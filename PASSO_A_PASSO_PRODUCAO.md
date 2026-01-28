# 🔧 Como Configurar o Backend para Produção (Motoristas em Todo Brasil)

## ⚠️ IMPORTANTE: Leia Antes de Colocar em Produção

O app agora tem duas configurações:

- **DESENVOLVIMENTO**: Localhost (seu PC, WiFi local)
- **PRODUÇÃO**: URL remota (motoristas em qualquer lugar do Brasil com dados móveis)

---

## 🎯 Passo 1: Escolha um Serviço de Hospedagem

### ✅ Recomendados (Mais Fáceis)

#### Heroku (Gratuito no início)

- URL: `https://seu-app-heroku.herokuapp.com`
- Setup: 5 minutos
- [Clique aqui para criar conta](https://www.heroku.com)

```bash
heroku login
heroku create seu-app-roadtruck
git push heroku main
```

#### Railway (Alternativa ao Heroku)

- URL: `https://seu-app.up.railway.app`
- Setup: 10 minutos
- [Clique aqui](https://railway.app)

#### Render

- URL: `https://seu-app.onrender.com`
- Setup: 10 minutos
- [Clique aqui](https://render.com)

### 💪 Mais Robustos (Melhor Performance)

- **AWS EC2** (~$3-5/mês)
- **Google Cloud** (~$3-10/mês)
- **DigitalOcean** (~$5/mês)
- **Seu próprio servidor** (melhor custo em longo prazo)

---

## 🔧 Passo 2: Alterar URL do Backend

**Arquivo a editar:** `front-end/JS/index.js`

### Localizar esta linha:

```javascript
const BACKEND_PRODUCAO = "https://seu-backend.com/api";
```

### Exemplo 1: Se usar Heroku

```javascript
const BACKEND_PRODUCAO = "https://roadtruck-backend-2024.herokuapp.com/api";
```

### Exemplo 2: Se usar seu domínio

```javascript
const BACKEND_PRODUCAO = "https://api.roadtruck.com.br/api";
```

### Exemplo 3: Se usar Railway

```javascript
const BACKEND_PRODUCAO = "https://roadtruck-api.up.railway.app/api";
```

---

## 🔐 Passo 3: Configurar CORS no Backend

**Arquivo a editar:** `back-end/server.js`

### Adicione sua URL de produção à whitelist:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      "https://routers-caminhao.web.app", // Firebase (produção atual)
      "https://seu-dominio.com.br", // ← ADICIONE AQUI
      "https://seu-app-heroku.herokuapp.com", // ← OU AQUI (se usar Heroku)
      "http://localhost:5173",
      "http://localhost:8080",
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
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // ... resto da configuração
};
```

---

## 📤 Passo 4: Deploy do Backend

### Se usar Heroku:

```bash
cd back-end
heroku login
heroku create seu-app-roadtruck
git push heroku main
```

### Se usar outro serviço:

Siga as instruções do serviço escolhido

---

## 🚀 Passo 5: Deploy do Frontend

```bash
firebase deploy
```

---

## ✅ Passo 6: Teste em Produção

### Teste 1: Backend está acessível?

```bash
curl https://seu-backend.com/api
```

### Teste 2: CORS funcionando?

```bash
curl -X OPTIONS https://seu-backend.com/api/calculate-route \
  -H "Origin: https://routers-caminhao.web.app" \
  -H "Access-Control-Request-Method: POST"
```

### Teste 3: No celular com dados móveis

1. Desative WiFi no celular
2. Abra o navegador
3. Acesse `https://routers-caminhao.web.app`
4. Tente calcular uma rota
5. **DEVE FUNCIONAR** ✅

---

## 🎉 Resultado Final

### Antes (Não funciona em produção)

```
Motorista tenta usar: ❌ Erro de rede
Backend esperado: localhost:8080
Resultado: Falha em qualquer lugar
```

### Depois (Funciona em todo Brasil)

```
Motorista em São Paulo: ✅ Funciona com 4G
Motorista em Brasília: ✅ Funciona com WiFi
Motorista em Salvador: ✅ Funciona com dados móveis
Backend: https://seu-backend.com/api
Resultado: Funciona em qualquer lugar! 🎉
```

---

## 🚨 Troubleshooting

### Erro: "CORS não permitido"

- [ ] URL está na whitelist do `server.js`?
- [ ] Firebase URL está na whitelist?

### Erro: "Servidor não respondeu"

- [ ] Backend está rodando?
- [ ] GraphHopper está rodando?
- [ ] Firewall permitindo a porta?

### Erro: "Timeout"

- [ ] Backend muito lento?
- [ ] Aumentar timeout em `index.js`

---

## 📋 Checklist Final

- [ ] Hospedagem escolhida (Heroku/AWS/outro)
- [ ] Backend deployado e rodando
- [ ] URL do backend no `index.js`
- [ ] CORS configurado no `server.js`
- [ ] Frontend deployado com `firebase deploy`
- [ ] Testado com dados móveis ✅
- [ ] Motoristas conseguem usar de qualquer lugar ✅

---

## 🌍 Resultado: App Funcional em Todo Brasil

✅ Motoristas podem usar em qualquer estado
✅ Funciona com 4G, 5G, dados móveis
✅ Funciona em qualquer WiFi
✅ 24/7 disponível
✅ Escalável para muitos usuários

**Parabéns! Seu app está pronto para produção!** 🚀🚚
