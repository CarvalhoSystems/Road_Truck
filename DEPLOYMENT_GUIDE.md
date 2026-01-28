# 🚀 Guia Completo de Deploy Road-Truck

## ⚠️ Checklist Pré-Deploy

Antes de fazer deploy, certifique-se de:

- [ ] Firebase configurado e credenciais no `.env`
- [ ] Google Maps API ativada e chave configurada
- [ ] HTTPS/SSL preparado (se necessário)
- [ ] Banco de dados testado localmente
- [ ] Todas as rotas testadas no `http://localhost:8081`
- [ ] Variáveis de ambiente validadas

---

## 📝 Configuração do .env

```bash
# Copie o arquivo de exemplo
cp back-end/.env.example back-end/.env

# Edite e preencha os valores
nano back-end/.env
```

**Variáveis Obrigatórias:**

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GOOGLE_API_KEY`

---

## 🐳 Deploy com Docker

### Local (Testes)

```bash
# Build da imagem
docker build -t road-truck:latest -f back-end/Dockerfile .

# Executar container
docker run -p 8081:8081 \
  -e FIREBASE_PROJECT_ID=seu-id \
  -e FIREBASE_CLIENT_EMAIL=seu-email \
  -e FIREBASE_PRIVATE_KEY="sua-chave" \
  -e GOOGLE_API_KEY=sua-chave \
  road-truck:latest
```

### Usando Docker Compose

```bash
# Build e iniciar todos os serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose logs -f backend

# Parar serviços
docker-compose down
```

---

## 🌐 Deploy em Cloud

### Railway.app (Recomendado)

1. **Conectar repositório**
   - Faça push no GitHub
   - Conecte no Railway.app

2. **Configurar Variáveis de Ambiente**

   ```
   Dashboard > Project > Variables
   ```

3. **Deploy Automático**
   - Railway fará build e deploy automaticamente

### Render.com

1. **Criar Web Service**
   - Conecte seu repositório GitHub
   - Tipo: Node

2. **Build Command**

   ```bash
   cd back-end && npm ci
   ```

3. **Start Command**

   ```bash
   npm start
   ```

4. **Environment Variables**
   - Adicione todas do `.env`

### Fly.io

```bash
# Install Fly CLI
# Deploy
fly deploy

# Verificar logs
fly logs
```

---

## ✅ Verificação Pós-Deploy

```bash
# Testar endpoint
curl https://seu-app.com/api/ping

# Response esperada
{"ok":true,"now":"2024-01-19T..."}
```

### Testes de Funcionalidade

1. **Autenticação**
   - Teste login/cadastro

2. **Cálculo de Rotas**
   - Teste com coordenadas válidas

3. **POIs**
   - Verifique busca de postos e pedágios

---

## 🔒 Segurança em Produção

1. **HTTPS Obrigatório**
   - Railway/Render gerenciam automaticamente

2. **CORS Configurado**
   - Edite `ALLOWED_ORIGINS` no `.env`

3. **Rate Limiting Ativo**
   - Backend limita requisições automaticamente

4. **Sensores de Erro**
   - Monitore logs regularmente

---

## 📊 Monitoramento

### Logs

```bash
# Railway
railway logs

# Render
render logs

# Local
docker logs road-truck-backend
```

### Health Check

- Acesse: `/api/ping`
- Deve retornar `{"ok":true}`

---

## 🐛 Troubleshooting

### Erro: "FIREBASE_PRIVATE_KEY not found"

- Verifique se a chave está no formato correto
- Use aspas duplas e escape os newlines com `\n`

### Erro: "CORS error"

- Atualize `ALLOWED_ORIGINS` com seu domínio

### Erro: "Cannot find module 'helmet'"

- Rode `npm ci` no diretório `back-end`

---

## 📞 Suporte

Para erros persistentes, verifique:

1. Logs completos do servidor
2. Arquivo `.env` (não commite no Git!)
3. Firewall/portas abertas
4. Certificados SSL válidos

---

**Status:** ✅ Pronto para Produção
**Última atualização:** Janeiro 2024
