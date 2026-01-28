# 🚚 Road-Truck - INICIAR AQUI

## ⚡ Início Rápido (2 Minutos)

### Windows

1. **Duplo clique** em `RUN_SERVER.bat`
2. Aguarde até ver: `SERVIDOR INICIANDO NA PORTA 8081`
3. Abra navegador: `http://localhost:8081/pages/router.html`

### Mac/Linux

```bash
cd back-end
npm install
npm start
# Abra navegador: http://localhost:8081/pages/router.html
```

---

## ✅ O Que Funciona Agora

- ✅ **3 ROTAS DIFERENTES** - Múltiplas alternativas de navegação
- ✅ **POSTOS DE COMBUSTÍVEL** - ⛽ Mostra todos os postos próximos
- ✅ **PARADAS DE CAMINHÃO** - 🚛 Paradas específicas para trucks
- ✅ **DISTÂNCIAS CALCULADAS** - Entre cada ponto de parada
- ✅ **MAPA RESPONSIVO** - Funciona em mobile e desktop
- ✅ **INTERFACE DARK MODE** - Confortável para os olhos

---

## 🧪 Testar Agora

**Teste rápido (São Paulo → Rio):**

| Campo       | Valor              |
| ----------- | ------------------ |
| Origem      | -23.5505, -46.6333 |
| Destino     | -22.9068, -43.1729 |
| Altura      | 4.4                |
| Largura     | 2.6                |
| Comprimento | 18.6               |
| Peso        | 45                 |
| Eixos       | 6                  |

**Click em "Calcular Rota" e veja:**

1. 🗺️ 3 rotas coloridas no mapa (laranja, azul, verde)
2. ⛽ Postos de combustível marcados
3. 📊 Lista de POIs com distâncias
4. ⏱️ Tempo total para cada rota

---

## 📊 Dados de Teste Alternativos

### Curitiba → Brasília (Longa)

- Origem: -25.4267, -49.2653
- Destino: -15.7697, -47.8822

### Salvador → Manaus (Nordeste→Norte)

- Origem: -12.9714, -38.5014
- Destino: -3.1019, -60.0217

### Belo Horizonte → São Paulo (Curta)

- Origem: -19.9191, -43.9386
- Destino: -23.5505, -46.6333

---

## 🛠️ Se Algo Não Funcionar

### 1️⃣ Verifique se o servidor está rodando

```
Mensagem esperada no terminal:
✅ Servidor HTTP rodando em http://localhost:8081
```

### 2️⃣ Diagnostique

Duplo clique em `DIAGNOSTICO.bat` para verificar:

- ✅ Node.js instalado
- ✅ Pastas corretas
- ✅ Variáveis de ambiente

### 3️⃣ Verifique o console do navegador

- Pressione **F12** no navegador
- Vá para **Console**
- Procure por erros vermelhos

### 4️⃣ Verifique os logs do servidor

No terminal do Node.js, procure por:

- ✅ `Encontrados X POIs` = OK
- ❌ `Erro` em vermelho = Problema

---

## 📁 Estrutura

```
Road-Truck/
├── RUN_SERVER.bat          ← EXECUTE AQUI
├── DIAGNOSTICO.bat         ← Se tiver problemas
├── GUIA_COMPLETO.md        ← Documentação detalhada
├── back-end/
│   ├── server.js           ← Backend (calcula rotas)
│   └── package.json
└── front-end/
    ├── pages/router.html   ← Interface principal
    ├── JS/index.js         ← Lógica do mapa
    └── CSS/routers.css     ← Estilos responsivos
```

---

## 🎯 Features Inclusos

| Feature            | Status |
| ------------------ | ------ |
| Múltiplas rotas    | ✅     |
| POIs combustível   | ✅     |
| Paradas caminhão   | ✅     |
| Cálculo distâncias | ✅     |
| Mapa interativo    | ✅     |
| Mobile responsivo  | ✅     |
| Dark mode          | ✅     |
| Logs detalhados    | ✅     |

---

## 📞 Informações Técnicas

- **Backend:** Node.js + Express
- **Frontend:** Leaflet + Axios
- **Mapas:** OpenStreetMap
- **POIs:** Overpass API
- **API Rotas:** Google Routes API

---

## 🔑 Requisitos

- Node.js 14+
- NPM 6+
- Chaves Google API (variáveis .env)
- Conexão internet para APIs

---

**Pronto para usar! 🚀**

Para mais detalhes, veja: `GUIA_COMPLETO.md`
