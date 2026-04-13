// =======================================================
// 1. VARIÁVEIS GLOBAIS E IMPORTAÇÕES
// =======================================================
let map;
let routeLayer;
let temporaryPoiLayer;

// ✅ CONFIGURAÇÃO DA URL DO BACKEND (Produção vs Desenvolvimento)
const BACKEND_URL = (() => {
  // 🌐 PRODUÇÃO: URL do servidor Render
  const BACKEND_PRODUCAO = "https://road-truck-api.onrender.com/api";

  // 🏠 DESENVOLVIMENTO: Localhost para testes locais
  const isProducao =
    window.location.hostname === "routers-caminhao.web.app" ||
    window.location.hostname.includes("firebase");

  if (isProducao) {
    return BACKEND_PRODUCAO;
  } else if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8080/api";
  } else {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080/api`;
  }
})();

// ✅ FUNÇÃO PARA REQUISIÇÕES COM RETENTIVA (Resolve problema Render dormindo)
async function axiosWithRetry(config, maxRetries = 4, initialDelay = 2000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Tentativa ${attempt} de ${maxRetries}...`);
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return await axios({
        ...config,
        timeout: attempt === 0 ? 120000 : 90000, // 2min na primeira, 1min nas outras
        headers: {
          ...config.headers,
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Tentativa ${attempt + 1} falhou:`, error.message);

      // Não tenta novamente se for erro 4xx (exceto 429 Too Many Requests)
      if (
        error.response &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

console.log("🔌 Informações de Conexão:");
console.log(`   Frontend URL: ${window.location.href}`);
console.log(
  `   Ambiente: ${window.location.hostname.includes("firebase") ? "PRODUÇÃO 🌐 (Motoristas em todo Brasil)" : "DESENVOLVIMENTO 🏠 (Testes locais)"}`,
);
console.log(`   Backend URL: ${BACKEND_URL}`);

import { auth, db } from "./config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// =======================================================
// 2. UTILITÁRIOS (Decodificação e Cálculos)
// =======================================================

function decodePolyline(encoded) {
  if (!encoded) return [];
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;
    coordinates.push([lat / 1e5, lng / 1e5]);
  }
  return coordinates;
}

function getDistanceHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseCoords(inputString) {
  if (!inputString) return "";

  const parts = inputString.split(",").map((c) => c.trim());

  // Se tiver 2 partes, tenta ver se são números (coordenadas)
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);

    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // Se não for coordenada, retorna a string original (nome da rua/endereço)
  return inputString;
}

function createPoiIcon(type) {
  let emoji =
    type === "posto"
      ? "⛽"
      : type === "pedagio"
        ? "🛑"
        : type === "parada"
          ? "🚛"
          : "🅿️";
  return L.divIcon({
    className: "poi-custom-icon",
    html: `<div style="font-size:22px; filter: drop-shadow(0 0 2px white);">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// =======================================================
// 3. INICIALIZAÇÃO DO MAPA
// =======================================================

function initMap() {
  // ✅ Verificação de segurança do Leaflet
  if (typeof L === "undefined") {
    console.warn(
      "⚠️ Leaflet (L) ainda não carregou. Tentando novamente em 500ms...",
    );
    setTimeout(initMap, 500);
    return;
  }

  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("❌ ERRO: Elemento #map não encontrado no DOM!");
    return;
  }

  if (map) {
    map.remove();
  }

  try {
    map = L.map("map").setView([-25.0, -55.0], 3); // Visão ampla do Mercosul

    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap",
      },
    ).addTo(map);

    // ✅ DETECÇÃO DE ERRO NO OPERA GX (AdBlock/Tracker Blocker)
    tiles.on("tileerror", (e) => {
      console.warn(
        "🚫 Tile bloqueado. Verifique o 'Opera GX Control' ou AdBlock.",
        e,
      );
      // O aviso acima aparecerá no console (F12) se o Opera estiver bloqueando o mapa
    });

    routeLayer = L.layerGroup().addTo(map);
    temporaryPoiLayer = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 200);
  } catch (error) {
    console.error("❌ ERRO ao inicializar mapa:", error);
  }
}

// ✅ SISTEMA DE MENU RESPONSIVO - VERSÃO CORRIGIDA
const MobileMenu = (() => {
  const init = () => {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebarWrapper = document.getElementById("mobile-sidebar");
    const backdrop = document.getElementById("menu-backdrop");

    if (!menuToggle || !sidebarWrapper) {
      console.warn(
        "⚠️ Elementos do menu não encontrados. Verifique os IDs no HTML.",
      );
      return;
    }

    // Função para abrir/fechar
    const toggle = () => {
      const isOpen = sidebarWrapper.classList.toggle("active");
      if (backdrop) backdrop.classList.toggle("active");
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    const close = () => {
      sidebarWrapper.classList.remove("active");
      if (backdrop) backdrop.classList.remove("active");
      document.body.style.overflow = "";
    };

    // Eventos
    menuToggle.onclick = toggle;
    if (backdrop) backdrop.onclick = close;

    // Fechar ao calcular (apenas no celular)
    document.getElementById("btn-calcular")?.addEventListener("click", () => {
      if (window.innerWidth <= 1024) close();
    });
  };

  return { init };
})();

// Certifique-se de chamar no final:
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  MobileMenu.init();
  setupMapFullscreen();
});

// ✅ NOVA FUNCIONALIDADE: Fullscreen do Mapa (Waze style)
function setupMapFullscreen() {
  const fullscreenBtn = document.getElementById("map-fullscreen-btn");
  const mapContainer = document.querySelector(".map-container");
  const map = document.getElementById("map");

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      mapContainer.classList.toggle("fullscreen");

      if (mapContainer.classList.contains("fullscreen")) {
        fullscreenBtn.textContent = "⊟";
        fullscreenBtn.title = "Sair da Tela Cheia";
        // Fechar sidebars em mobile
        document.getElementById("config-panel")?.classList.remove("active");
        document.getElementById("info-panel")?.classList.remove("active");
      } else {
        fullscreenBtn.textContent = "⛶";
        fullscreenBtn.title = "Tela Cheia";
      }

      // Reajustar tamanho do mapa
      setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    });
  }
}

window.clearMapContent = function () {
  routeLayer.clearLayers();
  temporaryPoiLayer.clearLayers();
  document.getElementById("info").innerHTML = "Calculando...";
  document.getElementById("pois-near-route").innerHTML = "";
};
// =======================================================
// 4. FUNÇÃO PRINCIPAL: CALCULAR ROTA
// =======================================================

async function calcularRota() {
  const btn = document.getElementById("btn-calcular");
  const infoDisp = document.getElementById("info");
  const poiDisp = document.getElementById("pois-near-route");

  btn.disabled = true;
  infoDisp.innerHTML = "Processando rotas e POIs... ⏳";

  try {
    const origemInput = document.getElementById("origem").value;
    const destinoInput = document.getElementById("destino").value;

    if (!origemInput || !destinoInput) {
      throw new Error("Por favor, preencha origem e destino.");
    }

    const origem = parseCoords(origemInput);
    const destino = parseCoords(destinoInput);

    const vehicleInfo = {
      height: parseFloat(document.getElementById("altura")?.value) || 0,
      weight: parseFloat(document.getElementById("peso")?.value) || 0,
      length: parseFloat(document.getElementById("comprimento")?.value) || 0,
      axleCount: parseInt(document.getElementById("eixos")?.value) || 0,
      width: 2.6,
    };

    console.log("🚗 Dados da requisição:", {
      origem,
      destino,
      vehicleInfo,
    });

    infoDisp.innerHTML =
      "🔄 Conectando ao servidor... Aguarde enquanto acordamos o servidor Render.";

    const response = await axiosWithRetry({
      method: "POST",
      url: `${BACKEND_URL}/calculate-route`,
      data: {
        origem,
        destino,
        vehicleInfo,
        calculate_alternatives: true,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    });

    if (!response || !response.data) {
      throw new Error("Resposta inválida do servidor.");
    }

    console.log("✅ Resposta do servidor:", response.data);

    window.clearMapContent();

    // --- UNIFICAÇÃO DOS DADOS (GraphHopper vs Google vs TomTom) ---
    let routesToDraw = [];

    if (response.data.tomtom) {
      const routes = Array.isArray(response.data.tomtom)
        ? response.data.tomtom
        : [response.data.tomtom];

      routes.forEach((r) => {
        routesToDraw.push({
          distanceMeters: r.summary.lengthInMeters,
          duration: `${r.summary.travelTimeInSeconds}s`,
          polyline: r.legs[0].points.map((p) => [p.latitude, p.longitude]),
          isTomTom: true,
        });
      });
    } else if (
      response.data.graphhopper &&
      response.data.graphhopper.paths &&
      response.data.graphhopper.paths.length > 0
    ) {
      // Suporte a múltiplas rotas do GraphHopper
      response.data.graphhopper.paths.forEach((path) => {
        routesToDraw.push({
          distanceMeters: path.distance,
          duration: `${path.time / 1000}s`,
          polyline: path.points,
          isGraphHopper: true,
        });
      });
    } else if (response.data.routes) {
      routesToDraw = response.data.routes;
    }

    if (routesToDraw.length === 0) {
      throw new Error("Nenhuma rota encontrada.");
    }

    // ✅ DEFINIÇÃO DAS CORES (Isso resolve o erro ReferenceError)
    const colors = ["#f0540cff", "#38bdf8", "#94a3b8"]; // Verde, Azul e Cinza
    let infoHtml = `✅ <b>${routesToDraw.length} rota(s) encontrada(s)</b><br><br>`;

    // Guarda as rotas processadas para seleção posterior
    window._lastRoutes = [];

    routesToDraw.forEach((route, i) => {
      let decoded = [];

      try {
        if (route.isTomTom) {
          // TomTom já vem como array de coordenadas [lat, lng]
          decoded = route.polyline;
        } else if (route.isGraphHopper) {
          // Suporte para GeoJSON ou Polyline codificada (String)
          if (route.polyline && route.polyline.coordinates) {
            decoded = route.polyline.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ]);
          } else if (typeof route.polyline === "string") {
            decoded = decodePolyline(route.polyline);
          }
        } else {
          const poly = route.polyline.encodedPolyline || route.polyline;
          decoded = decodePolyline(poly);
        }
      } catch (e) {
        console.error("Erro ao decodificar rota:", e);
      }

      // Validação extra das coordenadas para evitar erros no Leaflet
      if (decoded && decoded.length > 0) {
        decoded = decoded.filter(
          (p) =>
            Array.isArray(p) && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]),
        );
      }

      if (!decoded || decoded.length === 0) {
        console.warn("Rota vazia ou inválida após decodificação:", route);
        return;
      }

      const isMain = i === 0;

      // ✅ DESENHANDO A ROTA COM CORES SÓLIDAS E BORDAS
      // Desenha uma borda branca para a rota principal se destacar (estilo Waze)
      if (isMain) {
        L.polyline(decoded, {
          color: "#ffffff",
          weight: 12,
          opacity: 0.2,
          lineJoin: "round",
        }).addTo(routeLayer);
      }

      const line = L.polyline(decoded, {
        color: colors[i % colors.length], // Usa a variável colors definida acima
        weight: isMain ? 7 : 5,
        opacity: isMain ? 1 : 0.7,
        dashArray: null, // ✅ Garante que a linha SEJA SÓLIDA (remove o pontilhado)
        lineJoin: "round",
        lineCap: "round",
      }).addTo(routeLayer);

      if (isMain) {
        map.fitBounds(line.getBounds());
        L.marker(decoded[0]).addTo(routeLayer).bindPopup("<b>Origem</b>");
        L.marker(decoded[decoded.length - 1])
          .addTo(routeLayer)
          .bindPopup("<b>Destino</b>");
      }

      // Prepara polyToSend para uso posterior na seleção
      const polyToSend = route.isGraphHopper
        ? route.polyline
        : route.isTomTom
          ? route.polyline
          : route.polyline.encodedPolyline || route.polyline;

      // Armazena dados minimalistas da rota para seleção posterior
      window._lastRoutes.push({
        decoded,
        polyToSend,
        pois: route.pois || [],
        color: colors[i % colors.length],
        originCoords: decoded[0],
        lineObj: line,
        distanceMeters: route.distanceMeters || route.distance || 0,
        duration: route.duration || route.time || 0,
      });

      // ... restante do cálculo de tempo/distância
      const distKm = (route.distanceMeters / 1000).toFixed(1);
      const durationSec = parseInt(route.duration.toString().replace("s", ""));
      const h = Math.floor(durationSec / 3600);
      const m = Math.floor((durationSec % 3600) / 60);

      infoHtml += `<b>Rota ${i + 1}:</b> ${distKm} km | ${h}h ${m}min<br>`;
    });

    // Preenche o select de rotas na UI (se existir)
    try {
      const select = document.getElementById("route-select");
      if (select) {
        select.innerHTML = '<option value="">Selecione uma rota</option>';
        window._lastRoutes.forEach((r, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.text = `Rota ${idx + 1} - ${(
            r.distanceMeters / 1000 || 0
          ).toFixed(1)} km`;
          select.appendChild(opt);
        });
        select.onchange = function () {
          const v = select.value;
          if (v === "") return;
          selecionarRota(parseInt(v, 10));
        };
        // Auto-seleciona a primeira rota encontrada
        if (window._lastRoutes.length > 0) {
          select.value = "0";
          selecionarRota(0);
        }
      }
    } catch (e) {
      console.warn("Erro ao preencher select de rotas", e);
    }

    infoDisp.innerHTML = infoHtml;
  } catch (error) {
    console.error("❌ Erro ao calcular a rota:", error);
    console.error("Detalhes completos do erro:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });

    // Mensagens de erro mais específicas
    let errorMsg = "❌ Erro ao calcular a rota. ";

    // Verifica se é erro de CORS (preflight ou bloqueio)
    if (
      error.message?.includes("CORS") ||
      error.message?.includes("cors") ||
      (error.response?.status === 0 && !navigator.onLine === false)
    ) {
      errorMsg = `⚠️ Problema de CORS ou bloqueio de rede. Backend: ${BACKEND_URL}. Verifique se o servidor está acessível.`;
    } else if (error.response?.status === 400) {
      errorMsg += error.response.data?.message || "Dados inválidos.";
    } else if (error.response?.status === 403) {
      errorMsg += "Acesso bloqueado (CORS). O servidor recusou a requisição.";
    } else if (error.response?.status === 500) {
      errorMsg += "Erro no servidor. Verifique se GraphHopper está rodando.";
    } else if (error.code === "ECONNABORTED") {
      errorMsg += "Timeout na requisição. Tente novamente.";
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network") ||
      error.message?.includes("network")
    ) {
      // Erro de rede - pode ser firewall, CORS ou backend indisponível
      errorMsg += `Falha de conexão. Backend: ${BACKEND_URL}. Certifique-se de que o servidor está rodando.`;
    } else if (error.response) {
      // Erro com resposta do servidor
      errorMsg += `Servidor respondeu com erro ${error.response.status}. ${error.response.data?.message || ""}`;
    } else {
      errorMsg += error.message || "Tente novamente mais tarde.";
    }

    infoDisp.innerHTML = errorMsg;
  } finally {
    btn.disabled = false;
  }
}
// =======================================================
//=============================================
// 4.1 FUNÇÃO AUXILIAR: BUSCAR E DESENHAR POIs
//=============================================

async function buscarEDesenharPOIs(
  polyline,
  existingPois,
  routeColor,
  originCoords,
  title,
) {
  // ✅ PROTEÇÃO: Evita requisições simultâneas (race condition)
  if (window._buscandoPOIs) {
    console.warn(
      "⚠️ Já há uma busca de POIs em andamento. Ignorando requisição duplicada...",
    );
    return;
  }

  window._buscandoPOIs = true;

  try {
    const poiDisp = document.getElementById("pois-near-route");
    if (!poiDisp) {
      console.warn("⚠️ Elemento pois-near-route não encontrado");
      return;
    }

    temporaryPoiLayer.clearLayers(); // Limpa ícones de buscas anteriores

    let allPois = existingPois || [];

    console.log("🔎 Buscando POIs com title:", title, "polyline:", polyline);

    // Identifica a rota atual para cacheamento
    let currentRoute = null;
    if (
      typeof window._lastSelectedRouteIndex === "number" &&
      window._lastRoutes
    ) {
      currentRoute = window._lastRoutes[window._lastSelectedRouteIndex];
    }

    // Verifica se já tentamos buscar POIs para esta rota (evita loop e erro 429)
    const alreadyTried = currentRoute && currentRoute.poisFetched;

    // Se não vieram POIs (comum no fallback do Google), busca no Overpass via seu Backend
    if (allPois.length === 0 && polyline && !alreadyTried) {
      try {
        poiDisp.innerHTML =
          "<p class='text-muted p-2'>🔄 Buscando serviços na rota...</p>";

        console.log("📡 Enviando requisição POST para /pois-for-route");

        // ✅ OTIMIZAÇÃO: Envia a polyline COMPLETA para melhor cobertura de POIs
        // Se a polyline for muito grande, envia em chunks inteligentes
        let payloadPolyline = polyline;

        if (Array.isArray(polyline) && polyline.length > 500) {
          // Para rotas muito longas, estratégia é enviar múltiplos segmentos
          console.log(
            "🗺️  Rota longa detectada:",
            polyline.length,
            "pontos. Mantendo resolução completa...",
          );
          // Mantém a polyline completa mas com timeout maior
        } else if (Array.isArray(polyline) && polyline.length > 200) {
          // Para rotas médias, envia completa
          console.log(
            "📦 Polyline média:",
            polyline.length,
            "pontos. Enviando completa...",
          );
        }

        const resp = await axiosWithRetry({
          method: "POST",
          url: `${BACKEND_URL}/pois-for-route`,
          data: { polyline: payloadPolyline, radius: 50 },
          headers: {
            "Content-Type": "application/json",
            "User-Agent": navigator.userAgent,
          },
          withCredentials: false,
        });

        console.log("✅ Resposta do servidor /pois-for-route:", resp.data);
        allPois = resp.data.pois || [];

        if (allPois.length > 0) {
          console.log(`✅ ${allPois.length} POIs encontrados na rota`);
        } else {
          console.log("⚠️ Nenhum POI encontrado na rota");
        }

        // ✅ CACHE: Salva os POIs encontrados na rota atual para não buscar de novo
        if (currentRoute) {
          currentRoute.pois = allPois;
          currentRoute.poisFetched = true;
        }
      } catch (e) {
        console.warn("⚠️ Erro ao buscar POIs:", e);

        // Se houver erro, tenta buscar apenas segmentos principais
        if (
          Array.isArray(polyline) &&
          polyline.length > 100 &&
          !window._retryingPois
        ) {
          console.log("🔄 Tentando novamente com segmento simplificado...");
          window._retryingPois = true;

          try {
            const simplified = [
              polyline[0],
              polyline[Math.floor(polyline.length * 0.25)],
              polyline[Math.floor(polyline.length * 0.5)],
              polyline[Math.floor(polyline.length * 0.75)],
              polyline[polyline.length - 1],
            ];

            const retryResp = await axios.post(
              `${BACKEND_URL}/pois-for-route`,
              { polyline: simplified, radius: 50 },
              {
                timeout: 120000,
                headers: {
                  "ngrok-skip-browser-warning": "true",
                  "Content-Type": "application/json",
                  "User-Agent": navigator.userAgent,
                },
                withCredentials: false,
              },
            );

            allPois = retryResp.data.pois || [];
            console.log(
              `✅ Recuperou ${allPois.length} POIs na segunda tentativa`,
            );
          } catch (retryError) {
            console.warn("⚠️ Erro na segunda tentativa:", retryError);
          }

          window._retryingPois = false;
        }

        poiDisp.innerHTML =
          "<p class='text-muted p-2'>⚠️ Erro ao buscar serviços. Tente novamente.</p>";
        // Marca como tentado para não ficar tentando infinitamente
        if (currentRoute) currentRoute.poisFetched = true;
      }
    }

    if (allPois.length === 0) {
      poiDisp.innerHTML =
        "<p class='text-muted p-2'>Nenhum posto ou pedágio relevante nesta rota.</p>";
      return;
    }

    // Helpers para identificar tipos de POI de forma mais robusta
    const isFuelTag = (tags) => {
      if (!tags) return false;
      const amen = (tags.amenity || "").toString().toLowerCase();
      const shop = (tags.shop || "").toString().toLowerCase();
      const highway = (tags.highway || "").toString().toLowerCase();
      const name = (tags.name || "").toString().toLowerCase();

      // 1. Tags explícitas de combustível e paradas
      if (amen === "fuel" || shop === "fuel") return true;
      if (highway === "rest_area") return true;

      // 2. Verificação por nome (evitando Posto de Saúde/Polícia/Pedágio)
      if (
        name.includes("posto") ||
        name.includes("combustível") ||
        name.includes("combustivel") ||
        name.includes("parada")
      ) {
        if (name.includes("saúde") || name.includes("saude")) return false;
        if (name.includes("polícia") || name.includes("policia")) return false;
        if (name.includes("fiscal")) return false;
        if (name.includes("pedágio") || name.includes("pedagio")) return false;
        return true;
      }
      return false;
    };

    const isTollTag = (tags) => {
      if (!tags) return false;
      const barrier = (tags.barrier || "").toString().toLowerCase();
      const highway = (tags.highway || "").toString().toLowerCase();
      const toll = (tags.toll || "").toString().toLowerCase();
      const name = (tags.name || "").toString().toLowerCase();

      if (barrier === "toll_booth") return true;
      if (highway === "toll_gantry") return true;
      if (toll === "yes" || toll === "true") return true;
      if (name.includes("pedágio") || name.includes("pedagio")) return true;

      return false;
    };

    // Aplica filtro selecionado pelo usuário (Tudo / Pedágios / Postos)
    const filter = (window._poiFilter || "all").toLowerCase();
    const filterTitleMap = {
      all: "Serviços",
      pedagios: "Pedágios",
      postos: "Postos",
    };

    const filtered = allPois.filter((p) => {
      if (filter === "all") return true;
      const tags = p.tags || {};
      const isFuel = isFuelTag(tags);
      const isToll = isTollTag(tags);
      if (filter === "postos") return isFuel;
      if (filter === "pedagios") return isToll;
      return true;
    });

    console.log(`🔍 DEBUG FILTRO:
      - POIs totais recebidos: ${allPois.length}
      - Filtro ativo: ${filter}
      - POIs após filtro: ${filtered.length}
      - Percentual mantido: ${((filtered.length / allPois.length) * 100).toFixed(1)}%`);

    if (filtered.length === 0) {
      poiDisp.innerHTML = `<p class='text-muted p-2'>Nenhum ${
        filter === "postos"
          ? "posto"
          : filter === "pedagios"
            ? "pedágio"
            : "ponto"
      } relevante para o filtro selecionado.</p>`;
      return;
    }

    // Substitui allPois pelo conjunto filtrado para o restante da renderização
    allPois = filtered;
    console.log(
      `🎯 POIs após filtragem (${filter}): ${allPois.length} (Renderizando lista...)`,
    );

    const titleSafe = title || "Serviços na Rota";
    let listHtml = `<h6 class="p-2" style="background:${routeColor}22; border-radius: 8px 8px 0 0; margin-bottom: 0;">⛽ ${titleSafe} (${allPois.length})</h6><ul class='list-group list-group-flush'>`;

    // 1. Calcula distâncias e ordena os POIs (se tivermos a origem)
    if (originCoords && allPois.length > 0) {
      allPois.forEach((p) => {
        const lat = p.lat || p.latitude;
        const lon = p.lon || p.longitude || p.lng;
        p._distFromOrigin = getDistanceHaversine(
          originCoords[0],
          originCoords[1],
          lat,
          lon,
        );
      });
      allPois.sort((a, b) => a._distFromOrigin - b._distFromOrigin);
    }

    let previousDist = 0; // Para calcular a distância "do anterior"
    let listCount = 0; // Contador para limitar apenas a lista lateral
    let markerCount = 0; // Contador para quantos marcadores foram desenhados
    let invalidCoords = 0; // Contador de POIs sem coordenadas válidas

    console.log(
      `📍 PROCESSANDO: ${allPois.length} POIs para desenhar no mapa...`,
    );

    allPois.forEach((poi) => {
      // Normalização: aceita tanto .lat quanto .latitude
      const lat = poi.lat || poi.latitude;
      const lon = poi.lon || poi.longitude || poi.lng;
      const tags = poi.tags || {};

      // Identifica se é posto ou pedágio (usa helpers)
      const isFuel = isFuelTag(tags);
      const isToll = isTollTag(tags);

      // Refinamento do tipo para ícone e nome
      let poiType = "outros";
      if (isToll) poiType = "pedagio";
      else if (isFuel) {
        if (tags.highway === "rest_area" && tags.amenity !== "fuel")
          poiType = "parada";
        else poiType = "posto";
      }

      const name =
        tags.name ||
        (poiType === "posto"
          ? "Posto de Combustível"
          : poiType === "pedagio"
            ? "Pedágio"
            : poiType === "parada"
              ? "Parada de Caminhão"
              : "Ponto de Interesse");

      // Formata a distância para exibição
      let distHtml = "";
      if (typeof poi._distFromOrigin === "number") {
        const distFromPrev = poi._distFromOrigin - previousDist;
        distHtml = `<br><small class="text-muted" style="font-size:0.85em">📍 Km ${poi._distFromOrigin.toFixed(
          1,
        )} (+${distFromPrev.toFixed(1)} km)</small>`;
        previousDist = poi._distFromOrigin; // Atualiza a referência para o próximo loop
      }

      if (lat && lon) {
        // ✅ PASSO 1: DESENHA TODOS OS MARCADORES NO MAPA (sem limite!)
        const marker = L.marker([lat, lon], {
          icon: createPoiIcon(poiType),
          zIndexOffset: 1000,
        })
          .bindPopup(
            `
        <div style="line-height:1.2">
          <strong>${name}</strong><br>
          <small>${tags.brand || "Bandeira branca"}</small><br>
          ${tags["addr:street"] ? `<small>${tags["addr:street"]}</small>` : ""}
        </div>
      `,
          )
          .addTo(temporaryPoiLayer);

        markerCount++; // Conta quantos marcadores foram desenhados

        // ✅ PASSO 2: ADICIONA À LISTA LATERAL (com limite visual de 150 itens)
        if (listCount < 150) {
          const iconEmoji =
            poiType === "posto"
              ? "⛽"
              : poiType === "pedagio"
                ? "🛑"
                : poiType === "parada"
                  ? "🚛"
                  : "🅿️";
          const badge = tags.brand || (isToll ? "Pedágio" : "");
          listHtml += `
          <li class='list-group-item poi-item' onclick='map.flyTo([${lat}, ${lon}], 16)' title='Clique para ver no mapa'>
            <div class="d-flex justify-content-between align-items-center">
               <span>${iconEmoji} <b>${name}</b>${distHtml}</span>
               <small class="badge bg-light text-dark">${badge}</small>
            </div>
          </li>`;
          listCount++;
        }
      } else {
        invalidCoords++;
      }
    });

    // ✅ LOG DETALHADO: Mostra exatamente o que foi desenhado
    console.log(`🗺️  MARCADORES DESENHADOS NO MAPA: ${markerCount} POIs`);
    console.log(`⚠️ POIs COM COORDENADAS INVÁLIDAS: ${invalidCoords}`);
    console.log(`📝 LISTA LATERAL: ${listCount} itens (limitado a 150)`);
    console.log(`📊 TOTAL DE POIs PROCESSADOS: ${allPois.length}`);

    // Se houver mais de 150 POIs, mostra mensagem
    if (allPois.length > 150) {
      listHtml += `
      <li class='list-group-item' style="background: rgba(56, 189, 248, 0.1); color: var(--accent);">
        <small>✅ +${allPois.length - 150} serviços adicionais marcados no mapa!</small>
      </li>`;
    }

    poiDisp.innerHTML = listHtml + "</ul>";
  } finally {
    // ✅ SEMPRE reseta a flag ao finalizar (sucesso ou erro)
    window._buscandoPOIs = false;
    console.log("✅ Busca de POIs finalizada");
  }
}

// Função que seleciona uma rota calculada e exibe seus POIs
window.selecionarRota = function (index) {
  // marca a rota atualmente selecionada (para re-filtragem ao mudar o filtro)
  window._lastSelectedRouteIndex = index;
  if (!window._lastRoutes || !window._lastRoutes[index]) return;
  const sel = window._lastRoutes[index];

  // Limpa POIs anteriores
  temporaryPoiLayer.clearLayers();

  // Reseta estilos das linhas e destaca a selecionada
  window._lastRoutes.forEach((r, idx) => {
    try {
      r.lineObj.setStyle({
        color: r.color,
        weight: idx === index ? 9 : 5,
        opacity: idx === index ? 1 : 0.7,
      });
      if (idx === index) r.lineObj.bringToFront();
    } catch (e) {
      // ignora
    }
  });

  // Chama a rotina para buscar/desenhar POIs da rota selecionada
  buscarEDesenharPOIs(
    sel.polyToSend,
    sel.pois,
    sel.color,
    sel.originCoords,
    `Serviços na Rota ${index + 1}`,
  );
};

// =======================================================
// 5. LISTENERS E EXPORTAÇÕES
// =======================================================

window.usarMinhaLocalizacao = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
    document.getElementById("origem").value = coords;
    map.setView([pos.coords.latitude, pos.coords.longitude], 14);
  });
};
//=====================================
// 6. Função de Logout Unificada e Robusta
//=====================================
const logoutAndReturn = async (e) => {
  if (e) e.preventDefault();
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
  window.location.href = "/"; // Redireciona para a raiz (Login)
};
window.logoutAndReturn = logoutAndReturn;

//========================================================================================
// 7. Inicializa o mapa e configura os Listeners quando o DOM estiver completamente carregado
//========================================================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "🚀 VERSÃO ATUALIZADA DO MAPA (v2.1) - Se não ver isso, limpe o cache com CTRL+F5!",
  );

  // ✅ 1. Inicializa o mapa IMEDIATAMENTE (Independente do Auth)
  // Isso garante que o mapa apareça no PC mesmo se o Auth demorar
  initMap();

  // ✅ 2. Inicializa componentes de UI
  MobileMenu.init();
  setupMapFullscreen();

  // ✅ 3. Configura listeners de botões
  const btnCalcular = document.getElementById("btn-calcular");
  const routeForm = document.getElementById("route-form");

  if (routeForm) {
    routeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      calcularRota();
    });
  }

  if (btnCalcular) {
    btnCalcular.addEventListener("click", (e) => {
      e.preventDefault();
      calcularRota();
    });
  }

  const btnLimpar = document.getElementById("btn-limpar");
  if (btnLimpar) btnLimpar.addEventListener("click", window.clearMapContent);

  const btnLocalizacao = document.getElementById("btn-minha-localizacao");
  if (btnLocalizacao)
    btnLocalizacao.addEventListener("click", usarMinhaLocalizacao);

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) btnLogout.addEventListener("click", logoutAndReturn);

  // ✅ 4. Inicializa filtros de POIs
  window._poiFilter = window._poiFilter || "all";
  const chips = document.querySelectorAll(".filter-chips .chip");
  if (chips && chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const txt = chip.textContent.trim().toLowerCase();
        if (txt === "tudo") window._poiFilter = "all";
        else if (txt.includes("ped")) window._poiFilter = "pedagios";
        else if (txt.includes("posto")) window._poiFilter = "postos";

        if (typeof window._lastSelectedRouteIndex === "number") {
          selecionarRota(window._lastSelectedRouteIndex);
        }
      });
    });
  }

  // ✅ 5. Ajuste de renderização quando o conteúdo se torna visível (Auth liberado)
  window.addEventListener("contentVisible", () => {
    console.log(
      "👁️ Conteúdo liberado pelo Auth. Atualizando renderização do mapa...",
    );
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      // Reforço para garantir que o mapa preencha a tela
      setTimeout(() => map.invalidateSize(), 500);
    }
  });

  // ✅ 6. Fallback periódico para garantir que o mapa renderize corretamente
  let checks = 0;
  const fixMapInterval = setInterval(() => {
    checks++;
    if (map) map.invalidateSize();
    if (checks > 5) clearInterval(fixMapInterval);
  }, 1000);

  // ✅ 7. Correção para Opera GX (Renderização em abas inativas/Dark Mode)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && map) {
      console.log("👁️ Aba ativa. Forçando renderização do mapa...");
      map.invalidateSize();
    }
  });
});

//=================================================
// 8. MENSAGENS DOS CLIENTES (Movido para dentro do init)
//=================================================
const btnMensagem = document.getElementById("mensagemClientes"); // Garante a seleção pelo ID
if (btnMensagem) {
  btnMensagem.addEventListener("click", async () => {
    const { value: userMessage } = await Swal.fire({
      title: "📢 Mensagem para Administrador",
      input: "textarea",
      inputLabel: "Descreva sua dúvida ou problema:",
      inputPlaceholder: "Escreva aqui...",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      preConfirm: (message) => {
        if (!message) {
          Swal.showValidationMessage("Por favor, escreva uma mensagem.");
        }
        return message;
      },
    });

    // Se o usuário confirmou e existe uma mensagem
    if (userMessage) {
      try {
        await addDoc(collection(db, "suporte_mensagens"), {
          clienteEmail: auth.currentUser.email,
          clienteUid: auth.currentUser.uid,
          mensagem: userMessage,
          dataEnvio: serverTimestamp(),
          lida: false,
        });

        Swal.fire(
          "Enviado!",
          "Sua mensagem foi entregue ao administrador.",
          "success",
        );
      } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
        Swal.fire(
          "Erro",
          "Falha ao enviar mensagem ao banco de dados.",
          "error",
        );
      }
    }
    // exibi o email do cliente ao lado do botão sair
    const userEmailSpan = document.getElementById("user-email");
    if (userEmailSpan && auth.currentUser) {
      userEmailSpan.textContent = auth.currentUser.email;
    }
  });
}

//====================
// 9. MOSTRAR OS USUARIOS LOGADOS
//====================
auth.onAuthStateChanged((user) => {
  if (user) {
    const userEmailSpan = document.getElementById("user-email");
    if (userEmailSpan) {
      userEmailSpan.textContent = user.email;
    }
  }
});

//=================================================
// 10. Função mapa satelite
//=================================================

// ✅ Exporta as funções para o escopo global (window)
window.calcularRota = calcularRota;
window.usarMinhaLocalizacao = usarMinhaLocalizacao;
