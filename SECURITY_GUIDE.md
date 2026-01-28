# 🔒 Guia de Segurança - Road-Truck

## Melhorias de Segurança Implementadas ✅

### Backend

- ✅ Helmet.js para headers de segurança
- ✅ Express Rate Limiting
- ✅ Validação de entrada (sanitização)
- ✅ CORS configurável por ambiente
- ✅ Limit de tamanho de payload (10MB)
- ✅ Validação de coordenadas
- ✅ Autenticação obrigatória em rotas críticas

### Frontend

- ✅ HTTPS em produção (via Railway/Render)
- ✅ Proteção contra XSS
- ✅ CSRF token (via Firebase)
- ✅ Validação de entrada em formulários
- ✅ Sem dados sensíveis em localStorage

---

## 🔐 Variáveis Sensíveis - NUNCA commite no Git!

```bash
# ERRADO ❌
git add .env
git commit -m "add env file"

# CORRETO ✅
echo ".env" >> .gitignore
git add .gitignore
```

### Como Usar Credenciais Seguramente

1. **Local**: Use arquivo `.env` (já no `.gitignore`)
2. **Produção**: Use variáveis de ambiente da plataforma

```bash
# Railway
railway variables set FIREBASE_PROJECT_ID=xxx

# Render
Dashboard > Environment Variables
```

---

## 🚨 Checklist de Segurança Antes de Deploy

- [ ] `.env` NÃO está no Git
- [ ] FIREBASE_PRIVATE_KEY não está no código
- [ ] ALLOWED_ORIGINS está configurado
- [ ] NODE_ENV=production
- [ ] HTTPS está ativado
- [ ] Rate limiting está ativo
- [ ] CORS é restritivo (não wildcard em produção)
- [ ] Logs não expõem dados sensíveis
- [ ] Senhas/tokens não nos logs

---

## 🛡️ Proteção de Endpoints

### Autenticação Requerida

```javascript
// ✅ Protegido - Requer token Firebase
app.post("/api/calculate-route", checkAuth, ...)

// ✅ Rate limitado
app.post("/api/contact", limiter, ...)
```

### Validação de Entrada

```javascript
// ✅ Validado
const cleanAddress = sanitizeInput(address); // máx 255 chars

// ✅ Coordenadas verificadas
if (!isValidCoord(lat, lon)) {
  return res.status(400).json({ error: "Invalid coords" });
}
```

---

## 📋 Boas Práticas

### 1. Nunca exponha informações sensíveis

```javascript
// ❌ ERRADO
console.log("Private key:", FIREBASE_PRIVATE_KEY);

// ✅ CORRETO
console.log("Firebase initialized successfully");
```

### 2. Use HTTPS em produção

```bash
# ✅ Automaticamente em Railway/Render
# Local: Configure certificados SSL na pasta certs/
```

### 3. Valide TUDO

```javascript
// ✅ Valide sempre
if (!origem || !destino) {
  return res.status(400).json({ error: "Missing data" });
}
```

### 4. Log estruturado

```javascript
// ✅ Informação útil sem sensibilidade
console.log(`[${timestamp}] Route calculated: ${distKm}km`);

// ❌ Expõe dados do usuário
console.log(`Route for user ${userEmail}: ${JSON.stringify(data)}`);
```

---

## 🔑 Gerenciamento de Chaves API

### Rotação Periódica (Recomendado: 90 dias)

1. **Gerar nova chave** no console do serviço
2. **Atualizar** variável de ambiente
3. **Remover** chave antiga após confirmação
4. **Auditar** uso das chaves

### Monitorar Uso

- [ ] Google: Google Cloud Console > Quotas & System Limits
- [ ] Firebase: Firebase Console > Usage
- [ ] TomTom: TomTom Developer Portal > Usage

---

## 🚨 Resposta a Incidentes

### Se uma chave vazar:

1. **Imediatamente**: Disable a chave no console
2. **Gerar nova chave**
3. **Atualizar** variáveis de ambiente
4. **Monitore** por atividades suspeitas
5. **Notifique** se dados foram expostos

---

## 📞 Recursos de Segurança

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Status**: ✅ Seguro para Produção
**Última verificação**: Janeiro 2024
