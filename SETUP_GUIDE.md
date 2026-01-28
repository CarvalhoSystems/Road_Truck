# 🚀 Road-Truck: Guia de Setup e Deployment

## Configuração Rápida

### 1. Back-end Setup

```bash
# Navegar para pasta back-end
cd back-end

# Instalar dependências limpas
npm install

# Criar arquivo .env na raiz do projeto (um nível acima)
cat > ../.env << EOF
NODE_ENV=development
FIREBASE_PROJECT_ID=routers-caminhao
FIREBASE_PRIVATE_KEY=\"YOUR_PRIVATE_KEY_HERE\"
FIREBASE_CLIENT_EMAIL=\"firebase-adminsdk-xxxxx@routers-caminhao.iam.gserviceaccount.com\"
GOOGLE_API_KEY=\"AIzaSyCQOqhSEfsU0ZxHyPMtqe8yJp1xSsyrhwY\"
GH_SERVER_URL=http://localhost:8989
EOF
```

### 2. Obter Credenciais Firebase

1. Ir para [Firebase Console](https://console.firebase.google.com/)
2. Selecionar projeto `routers-caminhao`
3. Project Settings → Service Accounts
4. Gerar nova chave privada (JSON)
5. Copiar valores para `.env`

### 3. Certificados SSL (Opcional)

```bash
# Criar pasta certs no back-end se não existir
mkdir -p back-end/certs

# Gerar certificado auto-assinado (válido por 365 dias)
cd back-end/certs
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \
  -days 365 -nodes -subj "/CN=localhost"
cd ../../
```

### 4. Iniciar Servidor

```bash
# Modo desenvolvimento (com logs)
cd back-end
npm run dev

# Modo produção (sem logs de debug)
npm start
```

**Output esperado:**

```
✅ Servidor HTTPS rodando em https://localhost:8081
=================================================================
```

Ou (se sem certificados):

```
⚠️ Certificados SSL não encontrados. Usando HTTP.
🚚 Servidor HTTP rodando em http://localhost:8081
=================================================================
```

---

## 🏗️ Arquitetura do Projeto

```
Road-Truck/
├── back-end/
│   ├── server.js           # Express server com rotas API
│   ├── package.json        # Dependências Node
│   ├── certs/              # Certificados SSL
│   │   ├── cert.pem
│   │   └── key.pem
│   └── graphhopper/        # GraphHopper local (opcional)
│
├── front-end/
│   ├── index.html          # Landing page
│   ├── JS/
│   │   ├── config.js       # Firebase config
│   │   ├── auth.js         # Autenticação
│   │   ├── index.js        # Lógica do mapa/rotas
│   │   ├── admin.js        # Painel admin
│   │   └── pending.js      # Página de espera
│   ├── CSS/
│   │   └── styles.css
│   └── pages/
│       ├── router.html     # Dashboard principal
│       ├── admin.html      # Painel administrador
│       └── pending.html    # Página de espera
│
├── functions/              # Firebase Cloud Functions
│   └── index.js
│
└── firebase.json           # Config Firebase Hosting

```

---

## 📡 Endpoints da API

### Autenticação

- `GET /api/auth-status` - Verificar status de login
- `POST /api/approve-client` - Aprovar cliente (admin)
- `POST /api/delete-client` - Deletar cliente (admin)
- `POST /api/make-admin` - Promover admin (admin)
- `POST /api/create-user` - Criar novo usuário (admin)

### Rotas

- `POST /api/calculate-route` - Calcular rota com restrições de caminhão
- `POST /api/gh-calculate-route` - Rota via GraphHopper local
- `POST /api/pois-for-route` - Buscar POIs ao longo da rota
- `POST /api/validate-route` - Validar violações de restrições

### Utilidade

- `GET /api/ping` - Health check
- `POST /api/contact` - Enviar mensagem de contato

---

## 🔐 Variáveis de Ambiente (.env)

```bash
# Modo de execução
NODE_ENV=development|production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=routers-caminhao
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@routers-caminhao.iam.gserviceaccount.com

# Google Maps API
GOOGLE_API_KEY=AIzaSyCQOqhSEfsU0ZxHyPMtqe8yJp1xSsyrhwY

# GraphHopper Server (se rodando localmente)
GH_SERVER_URL=http://localhost:8989
```

---

## 🛠️ Troubleshooting

### Erro: "Cannot find module 'express'"

```bash
cd back-end
npm install
```

### Erro: "Token inválido"

- Verificar se `.env` está na **raiz do projeto** (não em back-end/)
- Confirmar `FIREBASE_PRIVATE_KEY` tem quebras de linha: `\n`

### Erro: "EADDRINUSE: address already in use :::8081"

```bash
# Matar processo anterior
lsof -i :8081
kill -9 <PID>

# Ou trocar porta em server.js
const PORT = 8082;
```

### Front-end não conecta ao backend

- Confirmar que backend está rodando na porta 8081
- Verificar CORS habilitado: `app.use(cors());`
- Teste com: `curl http://localhost:8081/api/ping`

---

## 📦 Deployment

### Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy
```

### Docker (Futuro)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY back-end/package*.json ./
RUN npm ci --only=production
COPY back-end .
EXPOSE 8081
CMD ["npm", "start"]
```

---

## ✨ Melhorias Recentes

✅ Removidos: Logs sensíveis de debug  
✅ Corrigido: Middleware de autenticação admin  
✅ Implementado: Fallback HTTP/HTTPS automático  
✅ Removidas: Dependências não usadas  
✅ Consolidado: Configuração Firebase  
✅ Documentado: Guia de setup completo

---

## 📚 Documentação

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express.js](https://expressjs.com/)
- [Leaflet Maps](https://leafletjs.com/)
- [GraphHopper](https://www.graphhopper.com/)

---

**Última atualização**: 18 de Dezembro de 2025  
**Versão**: 1.0.0
