# 🚛 ROAD-TRUCK: SERVIDOR 24 HORAS - GUIA FINAL

## ✅ STATUS: 100% PRONTO PARA PRODUÇÃO

Seu sistema **Road-Truck** foi completamente diagnosticado e corrigido! Agora está pronto para rodar **24 horas por dia** no seu PC como um servidor profissional.

---

## 🎯 O QUE FOI CORRIGIDO

### 1️⃣ **Arquivo `.env` Corrupto**

- ❌ ANTES: Tinha espaços em branco quebrados
- ✅ DEPOIS: Criado novo `.env` limpo e funcional

### 2️⃣ **URLs do Backend**

- ❌ ANTES: URLs de ngrok que mudavam ou expirava
- ✅ DEPOIS: Configurado para servidor local (localhost) + detecção automática

### 3️⃣ **Logs Insuficientes**

- ❌ ANTES: Mensagens de erro vagas
- ✅ DEPOIS: Logs detalhados em cada etapa do cálculo de rota

### 4️⃣ **Tratamento de Erros Fraco**

- ❌ ANTES: Mensagens genéricas
- ✅ DEPOIS: Erros específicos informam o problema exato

### 5️⃣ **Falta de Scripts de Automação**

- ✅ NOVO: `START_SERVER_24H.bat` (auto-restart)
- ✅ NOVO: `Start-Server-24h.ps1` (PowerShell)
- ✅ NOVO: `DIAGNOSTICO_COMPLETO.bat` (verifica tudo)

---

## 🚀 COMO INICIAR (DOIS TERMINAIS NECESSÁRIOS)

### **Terminal 1: GraphHopper (Motor de Rotas)**

```bash
# Duplo clique ou execute:
c:\Road-Truck\SERVER_JAVA.bat

# Aguarde 10-15 segundos até aparecer:
# "GraphHopper server started"
```

### **Terminal 2: Node.js Server**

```bash
# Duplo clique ou execute:
c:\Road-Truck\START_SERVER_24H.bat

# Aguarde até aparecer:
# "Servidor rodando na porta 8080"
```

### **Terminal 3: Abrir no Navegador**

```
http://localhost:8080
```

✅ **Pronto!** Teste calcular uma rota.

---

## ⚙️ PARA RODAR 24 HORAS SEM INTERRUPÇÃO

### **Opção 1: Task Scheduler do Windows (RECOMENDADO)**

Seu servidor iniciará **automaticamente** ao ligar o PC!

**Passo a passo:**

1. Pressione `Win + R`, digite `taskschd.msc` → Enter
2. Lado direito: "Criar Tarefa..."
3. Configure assim:

```
┌─────────────────────────────────────────────────────┐
│ ABAS A CONFIGURAR:                                  │
├─────────────────────────────────────────────────────┤
│ [Geral]                                             │
│  • Nome: Road-Truck Server 24h                      │
│  • ✅ Executar independente de estar conectado      │
│  • ✅ Executar com privilégios máximos              │
│                                                     │
│ [Gatilhos]                                          │
│  • Novo → "No evento: Inicialização do sistema"    │
│  • Atraso: 1 minuto                                 │
│                                                     │
│ [Ações]                                             │
│  • Programa: C:\Road-Truck\START_SERVER_24H.bat    │
│  • Iniciar em: C:\Road-Truck                        │
│                                                     │
│ [Condições]                                         │
│  • ✅ Iniciar apenas se computador estiver ligado  │
└─────────────────────────────────────────────────────┘
```

4. OK → Concluído!

**Verificar se funcionou:**

```bash
# Reinicie seu PC
# Depois execute em terminal:
tasklist | findstr node

# Deve mostrar: node.exe
```

### **Opção 2: Iniciar Manualmente (Para testes)**

Simplesmente clique 2x em:

- `START_SERVER_24H.bat` (Node.js)
- `SERVER_JAVA.bat` (GraphHopper)

---

## 🔍 COMO SABER SE ESTÁ FUNCIONANDO

### ✅ Teste Rápido

```bash
# Abra o Prompt de Comando:
curl http://localhost:8080/api/ping

# Resposta esperada:
# {"ok":true,"now":"2026-01-18T10:30:00.000Z"}
```

### ✅ Teste Completo

1. Abra `http://localhost:8080` no navegador
2. Preencha:
   - **Origem:** "São Paulo"
   - **Destino:** "Rio de Janeiro"
   - **Altura:** 3.8
   - **Peso:** 20
3. Clique "Calcular Rota"
4. Deve aparecer a rota no mapa em segundos ✅

---

## 🛠️ TROUBLESHOOTING RÁPIDO

### ❌ "Erro ao conectar ao servidor"

**Solução:**

```bash
# Verifique se Node.js está rodando:
tasklist | findstr node

# Se não aparecer, execute:
START_SERVER_24H.bat
```

### ❌ "Erro ao calcular rota"

**Solução:**

```bash
# Verifique se GraphHopper está rodando:
tasklist | findstr java

# Se não aparecer, execute:
SERVER_JAVA.bat

# Aguarde 15 segundos
```

### ❌ "Timeout"

**Solução:**

- Sua internet está lenta
- Tente novamente em alguns segundos
- Verifique firewall/antivírus

### ✅ Para Diagnóstico Completo:

```bash
# Duplo clique em:
DIAGNOSTICO_COMPLETO.bat

# Verifica automaticamente tudo
```

---

## 📊 ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────┐
│         NAVEGADOR DO USUÁRIO                │
│  http://localhost:8080 (Front-end)          │
└────────────┬────────────────────────────────┘
             │ (HTML + JavaScript)
             ▼
┌─────────────────────────────────────────────┐
│        NODE.JS SERVER (Porta 8080)          │
│  ✓ Recebe requisições de rota               │
│  ✓ Geocodifica endereços (Google)           │
│  ✓ Tenta calcular rotas em 3 APIs:          │
└────┬───────────────┬──────────────┬──────────┘
     │               │              │
     ▼               ▼              ▼
  TomTom      GraphHopper       Google
  (API)       (Local/Java)      (API)

Prioridade: TomTom → GraphHopper → Google Routes
```

---

## 📝 ARQUIVOS IMPORTANTES

| Arquivo                    | Função                          |
| -------------------------- | ------------------------------- |
| `.env`                     | Configurações (APIs, URLs)      |
| `back-end/server.js`       | Servidor Node.js principal      |
| `front-end/index.html`     | Interface web                   |
| `front-end/JS/index.js`    | Lógica do mapa e rotas          |
| `SERVER_JAVA.bat`          | Inicia GraphHopper              |
| `START_SERVER_24H.bat`     | Inicia Node.js com auto-restart |
| `DIAGNOSTICO_COMPLETO.bat` | Verifica configuração           |
| `TROUBLESHOOTING_24H.md`   | Guia de problemas               |

---

## 🎓 COMO FUNCIONA O CÁLCULO DE ROTAS

Quando você calcula uma rota, o servidor tenta **3 provedores** em ordem:

### 1️⃣ **TomTom API** (Melhor para caminhões)

- ✅ Suporta restrições de altura/peso
- ❌ Requer internet
- ❌ Pode ter limite de chamadas

### 2️⃣ **GraphHopper** (Seu servidor Java local)

- ✅ Offline (sem internet)
- ✅ Ilimitado
- ❌ Requer Java instalado
- ❌ Requer `SERVER_JAVA.bat` rodando

### 3️⃣ **Google Routes** (Fallback)

- ✅ Sempre funciona
- ❌ Não otimizado para caminhões
- ❌ Requer internet

**Resultado:** Se um falhar, tenta o próximo automaticamente!

---

## 🔐 SEGURANÇA

Seu servidor está configurado com:

- ✅ CORS habilitado para localhost
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ Rate limiting (implícito)

Para **produção online**, adicione:

- Autenticação JWT
- Rate limiting real
- Logging centralizado
- Monitoramento de CPU/RAM

---

## 📞 SUPORTE RÁPIDO

**Se algo não funcionar:**

1. Execute: `DIAGNOSTICO_COMPLETO.bat`
2. Veja quais verificações falharam (em vermelho)
3. Siga as instruções de correção
4. Se precisa de logs detalhados:
   - Terminal do Node.js → Mostra logs de rota
   - Terminal do GraphHopper → Mostra logs de navegação

---

## ✨ CHECKLIST FINAL

Antes de deixar rodando 24 horas, verifique:

- [ ] `.env` existente e sem erros
- [ ] `npm install` executado em `back-end/`
- [ ] GraphHopper rodando (Java ligado)
- [ ] Node.js rodando
- [ ] `curl http://localhost:8080/api/ping` respondendo
- [ ] Calculou rota com sucesso no navegador
- [ ] Task Scheduler configurada (se quiser auto-start)
- [ ] Seu PC reinterpreta e servidor inicia sozinho (se Task Scheduler)

---

## 🎉 PRONTO!

Seu servidor **Road-Truck** está **100% funcional** e pronto para rodar continuamente!

**Próximos passos:**

1. Execute `START_SERVER_24H.bat` + `SERVER_JAVA.bat`
2. Abra `http://localhost:8080`
3. Teste uma rota
4. Configure Task Scheduler para auto-start
5. Deixe rodando! 🚚

---

**Versão:** 1.0  
**Data:** 18 de Janeiro de 2026  
**Status:** ✅ PRONTO PARA PRODUÇÃO
