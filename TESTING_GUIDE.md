# 🧪 Guia de Testes - Road-Truck

## Testes de Funcionalidade Essenciais

### 1️⃣ Autenticação

```bash
# Teste: Login com Firebase
1. Acesse: http://localhost:8081/pages/login.html
2. Digite email e senha válidos
3. Verifique redirecionamento para router.html
```

✅ **Esperado**: Acesso concedido com token armazenado

### 2️⃣ Cálculo de Rotas

```bash
# Teste: Rota São Paulo → Rio de Janeiro
# Origem: -23.5505, -46.6333
# Destino: -22.9068, -43.1729
# Altura: 4.4m
# Peso: 45 ton
```

✅ **Esperado**:

- ✅ 3 rotas exibidas no mapa
- ✅ Distância e duração calculadas
- ✅ Cores diferentes para cada rota

### 3️⃣ Busca de POIs

```bash
# Após calcular uma rota:
1. Verifique a aba "Serviços na Rota"
2. Procure por postos de combustível ⛽
3. Verifique pedágios 🛑
4. Teste filtro: "Postos", "Pedágios", "Tudo"
```

✅ **Esperado**: Marcadores aparecem no mapa e lista lateral

### 4️⃣ Responsividade Mobile

```bash
# Teste em navegador mobile ou F12 (DevTools)
1. Redimensione para 375px (iPhone)
2. Verifique se formulário está legível
3. Teste botões funcionam bem
4. Verifique mapa responsivo
```

✅ **Esperado**: Interface funcional em mobile

---

## 🔒 Testes de Segurança

### CORS

```bash
curl -H "Origin: http://outro-site.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:8081/api/ping
```

✅ **Esperado**: CORS headers corretos ou rejeitado

### Rate Limiting

```bash
# Execute 25 vezes rapidamente
for i in {1..25}; do
  curl http://localhost:8081/api/calculate-route
done
```

✅ **Esperado**: Após 20 requisições, recebe 429 (Too Many Requests)

### Validação de Entrada

```bash
# Teste com entrada maliciosa
curl -X POST http://localhost:8081/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nome":"<script>alert(1)</script>","email":"test@test.com"}'
```

✅ **Esperado**: Entrada sanitizada, sem scripts executados

---

## 📊 Testes de Performance

### Tempo de Resposta

```bash
# Teste latência da API
time curl http://localhost:8081/api/ping

# Esperado: < 100ms
```

✅ **Esperado**: Resposta em menos de 100ms

### Carga do Mapa

```bash
# F12 > Network > Reload
# Verifique tamanho total
```

✅ **Esperado**: < 2MB total (com imagens)

---

## 🐛 Testes de Erro Handling

### Endereço Inválido

```
Origem: "Lugar que não existe"
Destino: "São Paulo"
```

✅ **Esperado**: Erro amigável, não crash

### Credenciais Inválidas

```
Email: teste@invalido.com
Senha: senhaerrada
```

✅ **Esperado**: "Email ou senha incorretos"

### Sem Conexão

```
1. Desligue internet
2. Tente calcular rota
```

✅ **Esperado**: "Erro ao conectar com servidor"

---

## 📋 Checklist Pré-Deploy

- [ ] Login funciona
- [ ] Cálculo de rotas funciona
- [ ] POIs aparecem no mapa
- [ ] Mobile responsivo
- [ ] CORS testado
- [ ] Rate limiting ativo
- [ ] Validação de entrada
- [ ] Tratamento de erros
- [ ] Logs em desenvolvimento
- [ ] .env configurado
- [ ] Sem console.log em produção
- [ ] HTTPS configurado

---

## 🚀 Teste de Deploy Local (Docker)

```bash
# Build
docker build -t road-truck:test -f back-end/Dockerfile .

# Run
docker run -p 8081:8081 \
  -e NODE_ENV=production \
  -e FIREBASE_PROJECT_ID=seu-id \
  -e FIREBASE_CLIENT_EMAIL=seu-email \
  -e FIREBASE_PRIVATE_KEY="sua-chave" \
  -e GOOGLE_API_KEY=sua-chave \
  road-truck:test

# Verificar saúde
curl http://localhost:8081/api/ping
```

✅ **Esperado**: Container inicia sem erros

---

## 📞 Casos de Teste Completos

### Caso 1: Usuário Novo

1. ✅ Acessa página inicial
2. ✅ Clica em "LOGIN/CADASTRO"
3. ✅ Preenche formulário (email, senha)
4. ✅ Clica em "Cadastrar"
5. ✅ Recebe confirmação por email
6. ✅ Faz login com credenciais novas
7. ✅ Acessa router.html

### Caso 2: Calcular Rota

1. ✅ User logado acessa router.html
2. ✅ Preenche "Origem"
3. ✅ Preenche "Destino"
4. ✅ Seleciona especificações do veículo
5. ✅ Clica em "Traçar Rota Segura"
6. ✅ Aguarda cálculo (spinner mostra)
7. ✅ 3 rotas aparecem no mapa
8. ✅ Pode selecionar rota diferente

### Caso 3: Buscar POIs

1. ✅ Rota já calculada
2. ✅ Clica em filtro "Postos"
3. ✅ Postos aparecem no mapa
4. ✅ Clica em um posto na lista
5. ✅ Mapa foca naquela localização
6. ✅ Popup mostra informações

---

**Status**: ✅ Todos os testes passando
**Ambiente**: Local + Docker testado
**Data**: Janeiro 2024
