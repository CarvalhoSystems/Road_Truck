# 🚛 GUIA DE RESOLUÇÃO DE PROBLEMAS - Road-Truck Server 24H

## ⚠️ PROBLEMA: "Erro ao calcular a rota"

### 🔴 1. VERIFICAR SE O SERVIDOR ESTÁ RODANDO

```bash
# Terminal 1 - Verificar se Node.js respondendo
curl http://localhost:8080/api/ping

# Resposta esperada:
# {"ok":true,"now":"2026-01-18T10:30:00.000Z"}
```

**Se receber erro de conexão:**

- ❌ Servidor Node.js NÃO está rodando
- ✅ Execute: `START_SERVER_24H.bat` ou `Start-Server-24h.ps1`

---

### 🔴 2. VERIFICAR SE GRAPHHOPPER ESTÁ RODANDO

GraphHopper é **ESSENCIAL** para rotas de caminhão!

```bash
# Terminal 2 - Verificar se GraphHopper respondendo
curl http://localhost:8989/info

# Resposta esperada: JSON com informações do GraphHopper
```

**Se receber erro de conexão:**

- ❌ GraphHopper NÃO está rodando
- ✅ Execute: `SERVER_JAVA.bat`
- ⏳ Aguarde 10-15 segundos para iniciar

---

### 🔴 3. VERIFICAR ARQUIVO .env

```bash
# Abra: c:\Road-Truck\.env

# VERIFICAR ESTAS LINHAS:
GH_SERVER_URL="http://localhost:8989"        # ✅ CORRETO
GH_SERVER_URL="https://seu-ngrok.ngrok.io"   # ❌ ERRADO (ngrok muda sempre)
GH_SERVER_URL="h t t p : / / l o c a l h o s t : 8 9 8 9"  # ❌ ERRADO (espaços)
```

**Se estiver errado:**

- Delete `c:\Road-Truck\.env`
- Copie `c:\Road-Truck\.env.new` → `c:\Road-Truck\.env`
- Reinicie o servidor Node.js

---

### 🔴 4. VERIFICAR INTERNET E DNS

```bash
# Testar conexão com APIs externas
ping google.com          # Google Geocoding
ping api.tomtom.com      # TomTom API
```

**Se falhar:**

- Sua internet está com problema
- Reinicie seu roteador
- Verifique firewall/antivírus

---

### 🔴 5. VERIFICAR LOGS DO SERVIDOR

Ao tentar calcular uma rota, veja o terminal do servidor:

```
📍 REQUISIÇÃO DE CÁLCULO DE ROTA RECEBIDA
🕐 Timestamp: 2026-01-18T10:30:00.000Z
📌 Origem (input): São Paulo
📌 Destino (input): Rio de Janeiro
🚛 Tipo de Rota: CAMINHÃO

[ETAPA 1] Tentando TomTom API...
❌ Conexão recusada

[ETAPA 2] Tentando GraphHopper...
✅ GraphHopper: Rota calculada com sucesso!
```

---

## ✅ CHECKLIST - SERVIDOR 100% FUNCIONAL

- [ ] `npm install` executado em `c:\Road-Truck\back-end`
- [ ] `.env` configurado corretamente (sem espaços, URLs corretas)
- [ ] `SERVER_JAVA.bat` rodando (GraphHopper ligado)
- [ ] `START_SERVER_24H.bat` rodando (Node.js ligado)
- [ ] Terminal do servidor mostrando logs (não deve ter erros em vermelho)
- [ ] `curl http://localhost:8080/api/ping` respondendo
- [ ] `curl http://localhost:8989/info` respondendo
- [ ] Internet funcionando
- [ ] Chaves de API válidas (Google, TomTom)
- [ ] Testar calcular rota no navegador - deve retornar rotas
- [ ] Verificar se POIs (postos/pedágios) aparecem nas rotas

---

## 🚀 COMO INICIAR O SERVIDOR (MODO PRODUÇÃO 24H)

### **Opção 1: Batch simples (Recomendado para iniciantes)**

```bash
# Duplo clique em:
c:\Road-Truck\START_SERVER_24H.bat
```

### **Opção 2: PowerShell (Mais controle)**

```powershell
# Abra PowerShell e execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd c:\Road-Truck
.\Start-Server-24h.ps1
```

### **Opção 3: Usando Task Scheduler (Windows - totalmente automático)**

1. Pressione `Win + R`, digite `taskschd.msc` e Enter
2. Clique em "Criar Tarefa..." (lado direito)
3. **Abas a configurar:**

   **Geral:**
   - Nome: `Road-Truck Server 24h`
   - ✅ Marque: "Executar independentemente se o usuário está conectado"
   - ✅ Marque: "Executar com privilégios máximos"

   **Gatilhos:**
   - Clique "Novo"
   - Selecione: "No evento: Inicialização do sistema"
   - Atraso: 1 minuto

   **Ações:**
   - Clique "Novo"
   - Programa: `C:\Road-Truck\START_SERVER_24H.bat`
   - Iniciar em: `C:\Road-Truck`

   **Condições:**
   - ✅ Marque: "Iniciar a tarefa apenas se o computador estiver ligado"

4. Clique "OK"

Agora o servidor iniciará automaticamente 1 minuto após ligar o PC!

---

## 🔧 ERROS COMUNS E SOLUÇÕES

| Erro                         | Causa                           | Solução                           |
| ---------------------------- | ------------------------------- | --------------------------------- |
| "ECONNREFUSED" (GraphHopper) | GraphHopper não está rodando    | Execute `SERVER_JAVA.bat`         |
| "ENOTFOUND" (API external)   | Sem internet / DNS com problema | Reinicie modem/roteador           |
| "Cannot find module"         | npm install não executado       | Rode `npm install` em `back-end/` |
| "ENOENT .env"                | Arquivo .env ausente            | Copie `.env.new` → `.env`         |
| "401 Unauthorized"           | Chave de API inválida           | Verifique chaves em `.env`        |
| "Timeout"                    | Requisição demorando muito      | Aumentar timeout em `server.js`   |

---

## 📊 MONITORAMENTO DO SERVIDOR

### Ver processo Node.js rodando:

```bash
tasklist | findstr node
```

### Ver porta 8080 em uso:

```bash
netstat -ano | findstr 8080
```

### Matar processo se travar:

```bash
taskkill /PID [PID_NUMBER] /F
```

---

## 📞 RESUMO FINAL

Seu servidor **Road-Truck** está pronto para rodar 24 horas!

**Para começar agora:**

1. Terminal 1: `cmd.exe` → Execute `SERVER_JAVA.bat` (GraphHopper)
2. Terminal 2: `cmd.exe` → Execute `START_SERVER_24H.bat` (Node.js)
3. Navegador: Acesse `http://localhost:8080`

**Para rodar permanentemente:**

- Configure a Tarefa Agendada (Task Scheduler) seguindo as instruções acima

Se tiver dúvidas, veja os **logs do servidor** - eles explicam exatamente o que está acontecendo!

✅ **Status: 100% PRONTO PARA PRODUÇÃO**
