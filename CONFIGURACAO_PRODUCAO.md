# ⚙️ Configuração de Backend para Produção

## 🎯 Objetivo

Fazer o app funcionar para motoristas em **qualquer lugar do Brasil** com dados móveis, WiFi, etc.

---

## 🚀 Passos para Colocar em Produção

### 1️⃣ **Escolha uma Hospedagem para o Backend**

O backend precisa estar em um servidor remoto acessível 24/7:

#### Opção A: **Heroku** (Recomendado para começar)

- Gratuito com limitações
- Fácil de fazer deploy
- URL: `https://seu-app-heroku.herokuapp.com`

**Como fazer:**

```bash
# 1. Criar conta em heroku.com
# 2. Instalar Heroku CLI
# 3. Fazer login
heroku login

# 4. Criar app
heroku create seu-app-roadtruck

# 5. Deploy
git push heroku main
```

#### Opção B: **AWS EC2** (Mais robusto)

- Servidor dedicado
- Melhor performance
- Custa a partir de $3/mês

#### Opção C: **Google Cloud** ou **Azure**

- Similar ao AWS
- Escalável

---

### 2️⃣ **Configurar a URL do Backend**

Edite o arquivo `front-end/JS/index.js`:

```javascript
// MUDE ESTA LINHA:
const BACKEND_PRODUCAO = "https://api.roadtruck.app";

// PARA SUA URL REAL (EXEMPLO COM HEROKU):
const BACKEND_PRODUCAO = "https://seu-app-heroku.herokuapp.com/api";
```

**Exemplos:**

```javascript
// Heroku
const BACKEND_PRODUCAO = "https://roadtruck-backend-2024.herokuapp.com/api";

// Seu domínio próprio
const BACKEND_PRODUCAO = "https://api.roadtruck.com.br/api";

// IP fixo (menos ideal)
const BACKEND_PRODUCAO = "https://123.456.789.012:8080/api";
```

---

### 3️⃣ **Configurar CORS no Backend Remoto**

No arquivo `back-end/server.js`, adicione a URL de produção:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      "https://routers-caminhao.web.app", // Firebase Hosting
      "https://seu-dominio.com", // Seu domínio (NOVO!)
      "http://localhost:5173",
      "http://localhost:8080",
      // ... mais origens
    ];

    const isLocalhost =
      origin &&
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(origin);

    if (!origin || whitelist.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS bloqueado para origem: ${origin}`);
      callback(new Error("CORS não permitido"));
    }
  },
  // ...
};
```

---

### 4️⃣ **Testar a Configuração**

#### No PC (Desenvolvimento):

```
http://localhost:5173
↓ (usa backend local)
http://localhost:8080/api
```

#### No Celular (Mesmo WiFi):

```
http://192.168.1.100:5173
↓ (usa backend local)
http://192.168.1.100:8080/api
```

#### Em Produção (Dados Móveis):

```
https://routers-caminhao.web.app
↓ (usa backend remoto)
https://seu-app-heroku.herokuapp.com/api
```

---

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────────────────────┐
│              MOTORISTA NO BRASIL                     │
│  (Dados móveis, WiFi diferente, em qualquer lugar)  │
└────────┬────────────────────────────────────────────┘
         │
         ├─→ https://routers-caminhao.web.app (Firebase)
         │   └─→ Carrega o app
         │
         ├─→ Clica em "Traçar Rota"
         │
         ├─→ App faz POST para:
         │   https://seu-backend-remoto.com/api/calculate-route
         │
         ├─→ Backend remoto calcula rota
         │
         └─→ App mostra resultado no mapa ✅
```

---

## ✅ Checklist de Configuração

- [ ] Escolheu hospedagem para backend (Heroku, AWS, etc)
- [ ] Fez deploy do backend
- [ ] Testou se backend está acessível em `https://seu-backend.com/api`
- [ ] Atualizou `BACKEND_PRODUCAO` no `front-end/JS/index.js`
- [ ] Atualizou CORS no `back-end/server.js` com URL de produção
- [ ] Fez deploy do frontend no Firebase Hosting
- [ ] Testou no celular com dados móveis ✅

---

## 🧪 Como Testar

### Teste 1: Backend remoto está acessível?

```bash
curl https://seu-backend.com/api
```

### Teste 2: CORS configurado?

```javascript
// No console do navegador
fetch("https://seu-backend.com/api/calculate-route", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    origem: "-23.656, -46.476",
    destino: "-23.550, -46.633",
    vehicleInfo: { height: 4.4, weight: 45 },
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d))
  .catch((e) => console.error(e));
```

### Teste 3: No app (Dados Móveis)

1. Abra o app no celular com dados móveis
2. Tente calcular uma rota
3. Deve funcionar normalmente ✅

---

## 📞 Troubleshooting

### "Erro de CORS"

- [ ] Backend está rodando?
- [ ] URL de CORS está correta no `server.js`?
- [ ] Firebase URL está na whitelist?

### "Timeout"

- [ ] Backend muito lento?
- [ ] GraphHopper travado?
- [ ] Aumentar timeout em `index.js`

### "Erro 404"

- [ ] URL do backend está correta?
- [ ] Rota `/api/calculate-route` existe no backend?

---

## 🌍 Solução Completa para Motoristas

**Resumo:**

1. ✅ Frontend em produção (Firebase)
2. ✅ Backend em produção (Heroku/AWS)
3. ✅ Motoristas acessam de qualquer lugar
4. ✅ Funciona com dados móveis, WiFi, etc

**Próximo passo:** Deploy em produção!
