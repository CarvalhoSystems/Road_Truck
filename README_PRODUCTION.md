# 🚚 Road-Truck - Rotas Inteligentes para Caminhões

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]() [![License](https://img.shields.io/badge/License-MIT-blue)]()

Sistema inteligente de otimização de rotas para veículos pesados (caminhões). Calcula múltiplas alternativas considerando restrições de altura, peso e eixos, identifica postos de combustível e pedágios na rota.

## ✨ Funcionalidades

- 🗺️ **Múltiplas Rotas**: 3 alternativas de navegação com diferentes características
- ⛽ **Postos de Combustível**: Localizador inteligente de postos próximos à rota
- 🛑 **Pedágios**: Identifica pedágios automaticamente
- 📏 **Restrições de Veículo**: Filtra rotas por altura, peso, comprimento
- 📱 **Responsivo**: Mobile, tablet e desktop otimizados
- 🔒 **Seguro**: Autenticação Firebase, validação de entrada
- 🌙 **Dark Mode**: Interface confortável para os olhos

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm 9+
- Firebase Project (grátis)
- Google Maps API key


### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/road-truck.git
cd road-truck

# Copie o arquivo de configuração
cp back-end/.env.example back-end/.env

# Edite com suas credenciais
nano back-end/.env
```

### 2. Configuração do .env

```env
NODE_ENV=development
PORT=8081
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_CLIENT_EMAIL=seu-email@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_API_KEY=sua-chave-do-google-maps
```

### 3. Executar Localmente

```bash
# Windows
RUN_SERVER.bat

# Mac/Linux
./RUN_SERVER.bat
```

ou

```bash
cd back-end
npm install
npm start
```

### 4. Acessar

- **Frontend**: http://localhost:8081
- **Login**: http://localhost:8081/pages/login.html
- **Router**: http://localhost:8081/pages/router.html

## 📖 Documentação

- [Guia de Deploy](./DEPLOYMENT_GUIDE.md) - Deploy em produção
- [Guia de Segurança](./SECURITY_GUIDE.md) - Boas práticas de segurança
- [Guia de Testes](./TESTING_GUIDE.md) - Testes completos

## 🏗️ Arquitetura

```
road-truck/
├── back-end/
│   ├── server.js           # Servidor Express
│   ├── package.json        # Dependências
│   ├── .env                # Configuração local (git ignored)
│   └── graphhopper/        # Motor de rotas offline
├── front-end/
│   ├── index.html          # Landing page
│   ├── pages/
│   │   ├── router.html     # Mapa e cálculo de rotas
│   │   ├── login.html      # Autenticação
│   │   └── admin.html      # Painel administrativo
│   ├── JS/
│   │   ├── index.js        # Lógica principal
│   │   ├── config.js       # Firebase config
│   │   └── auth.js         # Autenticação
│   └── CSS/
│       └── styles.css      # Estilos
└── DEPLOYMENT_GUIDE.md     # Guia de deploy
```

## 🔧 Stack Tecnológico

### Backend

- **Node.js 18** - Runtime JavaScript
- **Express.js 4** - Framework web
- **Firebase Admin SDK** - Autenticação e banco de dados
- **Axios** - Cliente HTTP
- **Helmet** - Segurança de headers
- **Express Rate Limit** - Proteção contra força bruta

### Frontend

- **Leaflet.js** - Mapa interativo
- **OpenStreetMap** - Dados de mapa
- **Firebase SDK** - Autenticação
- **SweetAlert2** - Diálogos amigáveis
- **Axios** - Requisições HTTP

### APIs Terceiras

- **Google Maps Geocoding** - Converter endereços em coordenadas
- **Google Routes API** - Cálculo de rotas
- **TomTom Routes API** - Rotas especializadas para caminhões
- **Overpass API** - Busca de POIs (postos, pedágios)
- **GraphHopper** - Roteamento offline

## 📦 Deploy

### Docker

```bash
docker build -t road-truck .
docker run -p 8081:8081 road-truck
```

### Railway.app

```bash
# Conecte seu repositório GitHub
# Adicione variáveis de ambiente no painel
# Deploy automático!
```

### Render.com

```bash
# Conecte seu repositório GitHub
# Configure build command: cd back-end && npm ci
# Configure start command: npm start
# Deploy!
```

Ver [Guia Completo de Deploy](./DEPLOYMENT_GUIDE.md)

## 🔒 Segurança

Implementações de segurança:

- ✅ Validação e sanitização de entrada
- ✅ CORS configurável
- ✅ Rate limiting (proteção DDoS)
- ✅ Helmet.js (headers segura)
- ✅ Autenticação Firebase obrigatória
- ✅ HTTPS em produção
- ✅ Limites de payload (10MB)

Ver [Guia de Segurança](./SECURITY_GUIDE.md)

## 🧪 Testes

```bash
# Teste login
http://localhost:8081/pages/login.html

# Teste cálculo de rota
# Origem: -23.5505, -46.6333 (São Paulo)
# Destino: -22.9068, -43.1729 (Rio de Janeiro)
# Altura: 4.4m
# Peso: 45 ton

# Teste POIs
# Após calcular rota, verifique "Serviços na Rota"
```

Ver [Guia de Testes](./TESTING_GUIDE.md)

## 🤝 Suporte

### Erros Comuns

**CORS Error**

```
Solução: Atualize ALLOWED_ORIGINS no .env
```

**Firebase não inicializa**

```
Solução: Verifique FIREBASE_PRIVATE_KEY no .env
```

**GraphHopper não conecta**

```
Solução: Execute SERVER_JAVA.bat em outra janela
```

## 📝 Licença

MIT

## 👨‍💻 Autor

Road-Truck - 2024

---

## ⭐ Roadmap

- [x] Cálculo básico de rotas
- [x] Autenticação Firebase
- [x] Busca de POIs
- [x] Interface responsiva
- [x] Segurança implementada
- [ ] Histórico de rotas
- [ ] Notificações em tempo real
- [ ] App mobile nativo
- [ ] Integração com telemática

---

**Status**: ✅ **Pronto para Produção**

Última atualização: Janeiro 2024
