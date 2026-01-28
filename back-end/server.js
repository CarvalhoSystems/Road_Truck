//=======================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
//=======================================================
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import admin from "firebase-admin";

import dns from "dns";
dns.setDefaultResultOrder("ipv4first"); // prioriza o uso do ipv4

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Verificação de variáveis críticas
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.GOOGLE_API_KEY
) {
  console.error(
    "❌ Erro Crítico: Variáveis de ambiente não configuradas (verifique o .env ou o painel do servidor).",
  );
  process.exit(1);
}

//=======================================================
// 2. FIREBASE ADMIN SDK
//=======================================================
const serviceAccountConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
});

const db = admin.firestore();
const auth = admin.auth();

//=======================================================
// 3. EXPRESS APP & MIDDLEWARES
//=======================================================

const PORT = process.env.PORT || 8080;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GH_SERVER_URL = process.env.GH_SERVER_URL || "http://localhost:8989"; // URL padrão do servidor GraphHopper local
const HERE_API_KEY = (process.env.HERE_API_KEY || "")
  .replace(/["']/g, "")
  .trim();
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// Middlewares

const app = express();

// Logger de Diagnóstico (Para confirmar se a requisição chega no servidor)
app.use((req, res, next) => {
  console.log(
    `🔍 [${req.method}] ${req.originalUrl} | Origin: ${
      req.headers.origin || "N/A"
    }`,
  );
  next();
});

// ✅ CONFIGURAÇÃO CORS VIA PACOTE (Mais seguro e completo)
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de origens permitidas explícitas
    const whitelist = [
      "https://routers-caminhao.web.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

    // Permite qualquer origem que começa com localhost ou 127.0.0.1 (desenvolvimento local)
    const isLocalhost =
      origin &&
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(origin);

    if (!origin || whitelist.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS bloqueado para origem: ${origin}`);
      callback(new Error("CORS não permitido para esta origem"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["ngrok-skip-browser-warning"],
  optionsSuccessStatus: 204, // Mudado de 200 para 204 (padrão para Preflight)
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});
app.options("*", cors(corsOptions)); // Trata explicitamente o Preflight (OPTIONS)

// ✅ AUMENTAR LIMITE DE PAYLOAD PARA SUPORTAR POLYLINES GRANDES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logger de Requisições
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
  }
  next();
});

// Arquivos Estáticos
const FRONT_END_DIR = path.join(__dirname, "../front-end");
app.use("/JS", express.static(path.join(FRONT_END_DIR, "JS")));
app.use("/CSS", express.static(path.join(FRONT_END_DIR, "CSS")));
app.use("/img", express.static(path.join(FRONT_END_DIR, "img")));
app.use("/pages", express.static(path.join(FRONT_END_DIR, "pages")));
app.use("/lib", express.static(path.join(FRONT_END_DIR, "lib")));
// Adiciona a raiz do front-end para servir arquivos como site.webmanifest e service-worker.js
app.use(express.static(FRONT_END_DIR));

//=======================================
// USAR O HERE TAMBEM (AGORA)
//========================================

//=======================================================
// 4. FUNÇÕES AUXILIARES (GEOCODING)
//=======================================================
async function getCoordsFromAddress(address) {
  try {
    console.log(`\n🔍 Geocodificando: "${address}"`);

    // Adicionamos ", Brasil" para garantir que a busca seja local
    const fullAddress = address + ", Brasil";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress,
    )}&key=${GOOGLE_API_KEY}`;

    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const loc = response.data.results[0].geometry.location;
      const result = { latitude: loc.lat, longitude: loc.lng };
      console.log(`   ✅ Geocodificação bem-sucedida:`, result);
      return result;
    } else {
      console.error(`   ❌ Geocoding falhou - Status: ${response.data.status}`);
      if (response.data.error_message) {
        console.error(`   Mensagem: ${response.data.error_message}`);
      }
      return null;
    }
  } catch (error) {
    console.error(`   ❌ Erro na geocodificação: ${error.message}`);
    return null;
  }
}

//=======================================================
// 5. MIDDLEWARES DE AUTENTICAÇÃO
//=======================================================
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: decodedToken.admin === true,
        status: userDoc.exists ? userDoc.data().status : "not_found",
      };
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

async function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "Token não fornecido." });
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      req.userUid = decodedToken.uid;
      next();
    } else {
      res.status(403).json({ message: "Acesso negado." });
    }
  } catch (error) {
    res.status(401).json({ message: "Token inválido." });
  }
}

//=======================================================
// 6. ROTAS DE NAVEGAÇÃO E STATUS
//=======================================================
app.get("/api/ping", (req, res) =>
  res.json({ ok: true, now: new Date().toISOString() }),
);

app.get("/api/auth-status", checkAuth, (req, res) => {
  if (req.user) return res.json({ loggedIn: true, ...req.user });
  return res.json({ loggedIn: false });
});

app.get("/", (req, res) =>
  res.sendFile(path.join(FRONT_END_DIR, "index.html")),
);

app.get("/pages/router.html", checkAuth, (req, res) => {
  // ✅ PERMISSÃO: Deixa entrar se for Cliente Aprovado OU se for Admin (para testes)
  if (req.user?.status === "approved" || req.user?.isAdmin)
    return res.sendFile(path.join(FRONT_END_DIR, "pages", "router.html"));
  res.redirect(req.user?.status === "pending" ? "/pages/pending.html" : "/");
});

app.get("/pages/admin.html", checkAuth, (req, res) => {
  if (req.user?.isAdmin)
    return res.sendFile(path.join(FRONT_END_DIR, "pages", "admin.html"));
  res.redirect("/");
});

//=======================================================
// 7. ROTA PRINCIPAL: CÁLCULO DE ROTA (CORRIGIDA)
//=======================================================
app.post("/api/calculate-route", async (req, res) => {
  let { origem, destino, vehicleInfo, calculate_alternatives } = req.body;

  // Garante que vehicleInfo seja um objeto para evitar crash ao acessar propriedades
  vehicleInfo = vehicleInfo || {};

  console.log("\n" + "=".repeat(60));
  console.log("📍 REQUISIÇÃO DE CÁLCULO DE ROTA RECEBIDA");
  console.log("=".repeat(60));
  console.log("🕐 Timestamp:", new Date().toISOString());
  console.log(
    "📤 IP do Cliente:",
    req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  );
  console.log("🚛 Dados do Veículo:", vehicleInfo);
  console.log("📌 Origem (input):", origem);
  console.log("📌 Destino (input):", destino);

  try {
    // 1. Converte Origem se for texto
    if (typeof origem === "string") {
      console.log(`\n🔄 [PASSO 1] Convertendo endereço de origem: ${origem}`);
      const coords = await getCoordsFromAddress(origem);
      if (!coords) {
        console.error(`❌ ERRO: Não foi possível geocodificar: ${origem}`);
        return res.status(400).json({
          message: `Não encontramos o endereço: ${origem}. Tente ser mais específico (Ex: incluir cidade).`,
          error: "GEOCODING_FAILED_ORIGIN",
        });
      }
      console.log(`✅ Origem geocodificada:`, coords);
      origem = coords;
    }

    // 2. Converte Destino se for texto
    if (typeof destino === "string") {
      console.log(`\n🔄 [PASSO 2] Convertendo endereço de destino: ${destino}`);
      const coords = await getCoordsFromAddress(destino);
      if (!coords) {
        console.error(`❌ ERRO: Não foi possível geocodificar: ${destino}`);
        return res.status(400).json({
          message: `Não encontramos o endereço: ${destino}.`,
          error: "GEOCODING_FAILED_DESTINATION",
        });
      }
      console.log(`✅ Destino geocodificado:`, coords);
      destino = coords;
    }

    console.log("\n✅ Coordenadas prontas:", { origem, destino });

    // 3. Verificação de segurança
    if (!origem.latitude || !destino.latitude) {
      console.error("❌ ERRO: Dados de geolocalização inválidos");
      return res.status(400).json({
        message: "Dados de geolocalização inválidos.",
        error: "INVALID_GEOLOCATION",
      });
    }

    const isTruckRoute = !!(
      vehicleInfo.height ||
      vehicleInfo.weight ||
      vehicleInfo.axleCount
    );

    console.log(`\n🚛 Tipo de Rota: ${isTruckRoute ? "CAMINHÃO" : "GENÉRICA"}`);

    // 1. Tentativa TomTom API (Nova Principal para Caminhões)
    if (isTruckRoute && TOMTOM_API_KEY) {
      console.log("\n" + "=".repeat(60));
      console.log("🚛 [ETAPA 1] Tentando TomTom API para rota de caminhão...");
      console.log("=".repeat(60));
      try {
        const weightKg = vehicleInfo.weight
          ? vehicleInfo.weight * 1000
          : undefined;

        const baseUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origem.latitude},${origem.longitude}:${destino.latitude},${destino.longitude}/json`;

        console.log("📡 URL TomTom:", baseUrl);
        console.log("📦 Parâmetros:", {
          travelMode: "truck",
          vehicleWeight: weightKg,
          vehicleHeight: vehicleInfo.height,
        });

        const response = await axios.get(baseUrl, {
          params: {
            key: TOMTOM_API_KEY,
            travelMode: "truck",
            vehicleCommercial: "true",
            vehicleWeight: weightKg,
            vehicleHeight: vehicleInfo.height,
            vehicleLength: vehicleInfo.length,
            vehicleWidth: vehicleInfo.width,
            traffic: false,
            maxAlternatives: calculate_alternatives ? 2 : 0,
          },
          timeout: 15000,
        });

        if (
          response.data &&
          response.data.routes &&
          response.data.routes.length > 0
        ) {
          console.log(
            `✅ TomTom: ${response.data.routes.length} rota(s) calculada(s) com sucesso!`,
          );
          return res.json({ tomtom: response.data.routes });
        }
      } catch (err) {
        console.warn("\n⚠️ [TomTom API] Falha na requisição:");
        if (err.response) {
          console.error(`   Status: ${err.response.status}`);
          console.error(`   Mensagem: ${JSON.stringify(err.response.data)}`);
        } else {
          console.error(`   Erro: ${err.message}`);
        }
        console.log("   ➡️ Tentando fallback (GraphHopper)...\n");
      }
    }

    // Tentativa GraphHopper
    if (isTruckRoute) {
      console.log("=".repeat(60));
      console.log("🚛 [ETAPA 2] Tentando GraphHopper (servidor local)...");
      console.log("=".repeat(60));
      console.log("📍 Endpoint:", `${GH_SERVER_URL}/route`);
      try {
        const customModel = {
          priority: [
            { if: `max_height < ${vehicleInfo.height || 0}`, multiply_by: 0 },
            { if: `max_weight < ${vehicleInfo.weight || 0}`, multiply_by: 0 },
          ],
        };
        const ghResponse = await axios.post(
          `${GH_SERVER_URL}/route`,
          {
            points: [
              [origem.longitude, origem.latitude],
              [destino.longitude, destino.latitude],
            ],
            profile: "truck",
            locale: "pt",
            points_encoded: false,
            "ch.disable": true,
            custom_model: customModel,
          },
          { timeout: 20000 },
        );

        if (ghResponse.data?.paths) {
          console.log(`✅ GraphHopper: Rota calculada com sucesso!`);
          return res.json({ graphhopper: ghResponse.data });
        }
      } catch (err) {
        console.warn("\n⚠️ [GraphHopper] Falha na requisição:");
        if (err.code === "ECONNREFUSED") {
          console.error(
            `❌ Conexão recusada! O servidor GraphHopper está rodando em ${GH_SERVER_URL}?`,
          );
          console.error(
            "💡 Dica: Execute 'SERVER_JAVA.bat' para iniciar o GraphHopper.",
          );
        } else if (err.response) {
          console.error(`   Status: ${err.response.status}`);
          console.error(`   Resposta: ${JSON.stringify(err.response.data)}`);
        } else {
          console.error(`   Erro: ${err.message}`);
        }
        console.log("   ➡️ Tentando fallback (Google Routes)...\n");
      }
    }

    // Fallback Google Routes API
    console.log("=".repeat(60));
    console.log("🌍 [ETAPA 3] Tentando Google Routes API (fallback)...");
    console.log("=".repeat(60));
    try {
      const gUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
      const gData = {
        origin: {
          location: {
            latLng: { latitude: origem.latitude, longitude: origem.longitude },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destino.latitude,
              longitude: destino.longitude,
            },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: !!calculate_alternatives,
      };

      console.log("📡 Enviando para Google Routes API...");
      const gResponse = await axios.post(gUrl, gData, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
        timeout: 15000,
      });
      console.log(
        `✅ Google Routes: ${gResponse.data.routes?.length || 0} rota(s) calculada(s)!`,
      );
      return res.json(gResponse.data);
    } catch (error) {
      console.error("\n❌ ERRO CRÍTICO: Todas as APIs falharam!");
      console.error("   Google Routes error:", error.message);
      return res.status(500).json({
        message: "Erro ao calcular rota. Todas as APIs falharam.",
        error: "ALL_PROVIDERS_FAILED",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("\n❌ ERRO NÃO TRATADO:", error);
    return res.status(500).json({
      message: "Erro interno no servidor",
      error: error.message,
    });
  }
});

//=======================================================
// FUNÇÃO DECODIFICADORA HERE FLEXIBLE POLYLINE (v8)
//=======================================================
function decodeFlexiblePolyline(encoded) {
  if (!encoded) return [];

  // Garante que a string não tenha espaços extras
  encoded = encoded.trim();

  // Tabela de decodificação gerada dinamicamente para evitar erros manuais
  const DECODING_TABLE = [
    62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  ];

  let idx = 0;
  const len = encoded.length;

  function decodeVarInt() {
    let res = 0,
      shift = 0,
      byte;
    do {
      if (idx >= len)
        throw new Error("Invalid encoding: Fim da string inesperado");
      const charCode = encoded.charCodeAt(idx++);
      const mapIdx = charCode - 45;

      // Validação de segurança
      if (mapIdx < 0 || mapIdx >= DECODING_TABLE.length)
        throw new Error("Char fora do range: " + charCode);
      const val = DECODING_TABLE[mapIdx];
      if (val === undefined || val === -1)
        throw new Error(
          "Caractere inválido na polyline: " + String.fromCharCode(charCode),
        );

      byte = val;
      res |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return res;
  }

  const header = decodeVarInt();
  const precision = header & 15;
  const factor = Math.pow(10, precision);
  const thirdDim = (header >> 4) & 7;

  const res = [];
  let lastLat = 0,
    lastLng = 0;
  while (idx < len) {
    const lat = decodeVarInt();
    const lng = decodeVarInt();
    if (thirdDim) decodeVarInt();
    const dLat = lat & 1 ? ~(lat >> 1) : lat >> 1;
    const dLng = lng & 1 ? ~(lng >> 1) : lng >> 1;
    lastLat += dLat;
    lastLng += dLng;
    res.push([lastLat / factor, lastLng / factor]);
  }
  return res;
}

//=======================================================
// 8. OUTRAS ROTAS (ADMIN, CONTACT, POIS)
//=======================================================

// Rota para excluir cliente (Auth + Firestore)
app.post("/api/delete-client", isAdmin, async (req, res) => {
  const { clienteUid } = req.body;
  try {
    // 1. Deleta do Authentication
    try {
      await auth.deleteUser(clienteUid);
    } catch (authError) {
      // Se o usuário não existir no Auth (já deletado), ignoramos o erro e limpamos o Firestore
      if (authError.code !== "auth/user-not-found") {
        throw authError;
      }
    }
    // 2. Deleta do Firestore
    await db.collection("users").doc(clienteUid).delete();
    res.json({ message: "Cliente excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res
      .status(500)
      .json({ message: "Erro ao excluir cliente: " + error.message });
  }
});

// Rota para promover a Admin
app.post("/api/make-admin", isAdmin, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    await db
      .collection("users")
      .doc(user.uid)
      .set({ role: "admin", status: "approved" }, { merge: true });
    res.json({ message: `Usuário ${email} agora é admin.` });
  } catch (error) {
    console.error("Erro ao promover admin:", error);
    res.status(500).json({ message: "Erro ao promover: " + error.message });
  }
});

app.post("/api/block-client", isAdmin, async (req, res) => {
  try {
    await db
      .collection("users")
      .doc(req.body.clienteUid)
      .update({ status: "blocked" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).send();
  }
});

app.post("/api/approve-client", isAdmin, async (req, res) => {
  try {
    await db
      .collection("users")
      .doc(req.body.clienteUid)
      .update({ status: "approved" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).send();
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    await db.collection("suporte_mensagens").add({
      ...req.body,
      dataEnvio: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Enviado com sucesso!" });
  } catch (e) {
    res.status(500).send();
  }
});

// Função auxiliar para decodificar polyline (Google format)
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
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;
    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coordinates;
}

// Função auxiliar para calcular distância (Haversine)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post("/api/pois-for-route", async (req, res) => {
  try {
    const { polyline } = req.body;
    if (!polyline) return res.json({ pois: [] });

    let points = [];
    // Normaliza a entrada (pode ser string codificada, array de arrays ou GeoJSON)
    if (typeof polyline === "string") {
      points = decodePolyline(polyline);
    } else if (polyline.coordinates && Array.isArray(polyline.coordinates)) {
      points = polyline.coordinates.map((p) => ({ lat: p[1], lng: p[0] }));
    } else if (Array.isArray(polyline)) {
      points = polyline.map((p) =>
        Array.isArray(p) ? { lat: p[0], lng: p[1] } : p,
      );
    }

    if (points.length === 0) return res.json({ pois: [] });

    // Calcula Bounding Box
    let minLat = 90,
      maxLat = -90,
      minLon = 180,
      maxLon = -180;
    points.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLon) minLon = p.lng;
      if (p.lng > maxLon) maxLon = p.lng;
    });

    const buffer = 0.05; // ~5km margem
    const bbox = `${minLat - buffer},${minLon - buffer},${maxLat + buffer},${
      maxLon + buffer
    }`;

    // 🔄 ESTRATÉGIA DE BUSCA APRIMORADA:
    // Se a rota for muito longa, divide em quadrantes para buscar mais POIs
    // (Overpass tem limite de resposta, então dividir em áreas menores ajuda)
    const width = maxLon - minLon;
    const height = maxLat - minLat;
    const divideRoute = width > 2 || height > 2; // Se for maior que ~200km

    let queryArray = [];
    if (divideRoute) {
      // Divide em até 4 quadrantes
      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;

      const bboxes = [
        // Quadrante 1 (inferior-esquerdo)
        `${minLat - buffer},${minLon - buffer},${centerLat},${centerLon}`,
        // Quadrante 2 (inferior-direito)
        `${minLat - buffer},${centerLon},${centerLat},${maxLon + buffer}`,
        // Quadrante 3 (superior-esquerdo)
        `${centerLat},${minLon - buffer},${maxLat + buffer},${centerLon}`,
        // Quadrante 4 (superior-direito)
        `${centerLat},${centerLon},${maxLat + buffer},${maxLon + buffer}`,
      ];

      bboxes.forEach((b) => {
        const query = `[out:json][timeout:180][bbox:${b}];(node["amenity"="fuel"];way["amenity"="fuel"];node["barrier"="toll_booth"];node["highway"="rest_area"];);out center geom;`;
        queryArray.push(query);
      });

      console.log(
        `📍 Rota longa detectada (${width.toFixed(2)}° x ${height.toFixed(2)}°) - Dividindo em 4 quadrantes para busca...`,
      );
    } else {
      // Rota pequena - busca em uma única area
      const query = `[out:json][timeout:180][bbox:${bbox}];(node["amenity"="fuel"];way["amenity"="fuel"];node["barrier"="toll_booth"];node["highway"="rest_area"];);out center geom;`;
      queryArray.push(query);
    }

    // --- LÓGICA DE RETRY (TENTATIVAS) PARA EVITAR ERRO 504 E 429 ---
    let rawPois = [];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        if (attempts > 1)
          console.log(`🔄 Tentativa ${attempts} de buscar POIs no Overpass...`);

        // ✅ OTIMIZAÇÃO: Requisições SEQUENCIAIS (não paralelas) para respeitar limite de taxa do Overpass
        // Overpass API tem limite de requisições por segundo, então fazemos uma por vez com delay
        for (let i = 0; i < queryArray.length; i++) {
          const query = queryArray[i];

          if (i > 0) {
            // Aguarda 1.5 segundos entre requisições para não sobrecarregar o Overpass
            await new Promise((r) => setTimeout(r, 1500));
          }

          try {
            console.log(
              `  [${i + 1}/${queryArray.length}] Buscando quadrante ${i + 1}...`,
            );

            const resp = await axios.post(
              "https://overpass-api.de/api/interpreter",
              `data=${encodeURIComponent(query)}`,
              { timeout: 180000 },
            );

            if (resp.data && resp.data.elements) {
              rawPois = rawPois.concat(resp.data.elements);
              console.log(
                `    ✅ Quadrante ${i + 1}: ${resp.data.elements.length} POIs encontrados`,
              );
            }
          } catch (quadErr) {
            console.warn(
              `    ⚠️ Erro no quadrante ${i + 1}: ${quadErr.message}`,
            );
            // Continua com os próximos quadrantes mesmo se um falhar
            if (quadErr.response?.status === 429) {
              // Se for erro 429, aguarda mais tempo antes de continuar
              console.log(
                `    ⏳ Aguardando 3 segundos devido a rate limit...`,
              );
              await new Promise((r) => setTimeout(r, 3000));
            }
          }
        }

        if (rawPois.length > 0) {
          break; // Sucesso! Sai do loop
        }
      } catch (err) {
        console.warn(
          `⚠️ Erro geral POIs (Tentativa ${attempts}): ${err.message}`,
        );
        if (attempts === maxAttempts) throw err; // Se foi a última, lança o erro
        await new Promise((r) => setTimeout(r, 2000)); // Espera 2s antes de tentar de novo
      }
    }

    // FILTRAGEM INTELIGENTE:
    // Mantém apenas POIs que estejam a menos de 1.5km (margem de segurança) da rota.
    // Também remove duplicatas (mesmas coordenadas)
    const filteredPois = rawPois.filter((poi) => {
      // Overpass retorna 'lat'/'lon' para nodes e 'center' para ways
      const pLat = poi.lat || (poi.center && poi.center.lat);
      const pLon = poi.lon || (poi.center && poi.center.lon);

      if (!pLat || !pLon) return false;

      // Otimização: Verifica a distância contra pontos da rota.
      // Pulamos alguns pontos (step=5) para ganhar performance sem perder precisão significativa.
      for (let i = 0; i < points.length; i += 5) {
        const dist = getDistanceFromLatLonInKm(
          pLat,
          pLon,
          points[i].lat,
          points[i].lng,
        );
        if (dist < 1.5) return true; // Encontrou um ponto da rota próximo (1.5km)
      }
      return false;
    });

    // ✅ Remove duplicatas de POIs (quando busca em quadrantes, pode haver sobreposição)
    const uniquePois = [];
    const seenCoords = new Set();

    filteredPois.forEach((poi) => {
      const pLat = poi.lat || (poi.center && poi.center.lat);
      const pLon = poi.lon || (poi.center && poi.center.lon);
      const key = `${pLat.toFixed(4)},${pLon.toFixed(4)}`;

      if (!seenCoords.has(key)) {
        seenCoords.add(key);
        uniquePois.push(poi);
      }
    });

    console.log(
      `✅ POIs encontrados: ${rawPois.length} brutos → ${filteredPois.length} na rota → ${uniquePois.length} únicos`,
    );

    res.json({ success: true, pois: uniquePois });
  } catch (e) {
    console.error("Erro POIs:", e.message);
    res.json({ success: false, pois: [] });
  }
});

///=======================================================
// 9. INICIALIZAÇÃO DO SERVIDOR (OTIMIZADO PARA CLOUD)
//=======================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 URL: http://0.0.0.0:${PORT}`);

  if (process.env.NODE_ENV === "production") {
    console.log("🔒 SSL Gerenciado pelo Render (HTTPS ativo)");
  } else {
    console.log("🛠️ Modo Desenvolvimento");
  }
});
//=======================================================
