# ⚠️ CORREÇÕES URGENTES - APP QUEBRADO

## Status Atual: 🔴 CRÍTICO

O app está com **3 erros críticos** que impedem funcionar:

### 1️⃣ ERRO CRÍTICO: Backend URL é um Placeholder

**Problema:**

```javascript
const BACKEND_PRODUCAO = "https://seu-backend.com/api";
```

Esta URL **NÃO EXISTE**. O navegador tenta acessar e dá erro:

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED seu-backend.com
```

**Solução:**
Abra [front-end/JS/index.js](front-end/JS/index.js#L10) e troque `seu-backend.com` por:

- **Se vai testar localmente:** `http://localhost:8080/api`
- **Se tem servidor remoto:** `https://seu-dominio.com/api`
- **Se usa ngrok:** `https://seu-id.ngrok.io/api`

**Exemplo para localhost:**

```javascript
const BACKEND_PRODUCAO = "http://localhost:8080/api";
```

---

### 2️⃣ ERRO: User-Agent Header

**Problema:**

```
Refused to set unsafe header "User-Agent"
```

Navegadores não permitem setar User-Agent via JavaScript (restrição de segurança).

**Status:** ✅ JÁ CORRIGIDO

- Removi a linha `"User-Agent": navigator.userAgent` do código

---

### 3️⃣ ERRO: Menu e Layout CSS

**Problemas:**

- Menu não abre no celular
- Desktop perdeu layout 3 colunas

**Status:** ✅ PARCIALMENTE CORRIGIDO

- Mudei `.sidebar-wrapper` de `display: contents` para `display: block` em mobile
- Desktop continua com 3 colunas (320px | 1fr | 320px)

---

## ✅ Proximos Passos

### Passo 1: Corrigir Backend URL

1. Abra [front-end/JS/index.js](front-end/JS/index.js#L10)
2. Procure por: `const BACKEND_PRODUCAO = "https://seu-backend.com/api";`
3. Troque por sua URL real:

**Para testar localmente (development):**

```javascript
const BACKEND_PRODUCAO = "http://localhost:8080/api";
```

**Para produção (servidor remoto):**

```javascript
const BACKEND_PRODUCAO = "https://seu-dominio-real.com/api";
```

### Passo 2: Testar

1. Abra o navegador em `https://routers-caminhao.web.app`
2. Abra o console (F12)
3. Procure por: `🔌 Informações de Conexão`
4. Verifique se o Backend URL está correto

---

## 🔍 Diagnóstico Rápido

No console do navegador (F12), você deve ver:

```
🔌 Informações de Conexão:
   Frontend URL: https://routers-caminhao.web.app/pages/router.html
   Ambiente: PRODUÇÃO 🌐 (Motoristas em todo Brasil)
   Backend URL: http://localhost:8080/api  ← MUDE AQUI
```

Se o Backend URL está errado, a rota não vai calcular.

---

## 📍 Qual é seu Backend?

Para corrigir completamente, responda:

1. **Onde está rodando o backend?**
   - [ ] Localhost (máquina local)
   - [ ] Servidor remoto (qual domínio?)
   - [ ] Outro (qual?)

2. **Qual é a porta?**
   - [ ] 8080 (padrão)
   - [ ] Outra (qual?)

3. **Qual é a URL base para API?**
   - [ ] `http://localhost:8080/api`
   - [ ] `https://seu-backend.com/api`
   - [ ] Outra

Após responder, farei a correção exata no código.

---

## 🚀 Para Testar Rápido (Desenvolvimento)

Se o backend está rodando localmente:

```bash
cd back-end
npm install
npm start
```

Depois abra qualquer página HTML e teste. A URL será detectada como:

- **Frontend:** `http://localhost:5173` (Vite dev)
- **Backend:** `http://localhost:8080/api` (Node.js)

---

## ⚠️ Importante

O app **funcionará APENAS** se:

1. ✅ Backend URL for válido e acessível
2. ✅ Backend estiver rodando
3. ✅ CORS estiver configurado (já está no servidor.js)
4. ✅ Firebase Auth estiver configurado

Sem isso, qualquer tentativa de calcular rota dará erro.
