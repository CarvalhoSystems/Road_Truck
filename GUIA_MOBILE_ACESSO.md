# 🚀 Guia de Acesso no Celular (Mobile)

## ⚠️ Problema Resolvido

A requisição de cálculo de rota agora funciona no celular!

- O problema principal era **CORS bloqueado** no backend
- Também havia `localhost` hardcoded que não funciona no celular

**Versão Atualizada:** Tudo foi corrigido! ✅

## 📱 Como Acessar a Aplicação no Celular

### 1️⃣ Encontre o IP do seu PC

**Windows (PowerShell):**

```powershell
ipconfig
```

Procure por "IPv4 Address" (algo como `192.168.x.x` ou `10.0.x.x`)

**Exemplo:** `192.168.1.100`

### 2️⃣ No Celular, Acesse

Na barra de endereço do navegador:

```
http://SEU_IP_DO_PC:5173
```

**Exemplo:**

```
http://192.168.1.100:5173
```

### 3️⃣ Certifique-se que:

✅ PC e Celular estão na **mesma rede WiFi**
✅ Backend está rodando: `node back-end/server.js` (ou `npm run dev`)
✅ Frontend está rodando: `npm run dev` em `front-end/`
✅ GraphHopper está rodando: `./graphhopper.bat` em `back-end/graphhopper/`

---

## 🔧 O Que Foi Corrigido

| Problema                  | Solução                                        |
| ------------------------- | ---------------------------------------------- |
| **CORS bloqueado**        | ✅ Backend aceita IPs locais (192.168.x, 10.x) |
| **Backend URL hardcoded** | ✅ Agora detecta automaticamente o IP correto  |
| **Timeout curto**         | ✅ Aumentado para 3 minutos em mobile          |
| **User-Agent missing**    | ✅ Adicionado header `User-Agent`              |
| **Detecção de erro vaga** | ✅ Agora mostra qual é o backend URL esperado  |

---

## 🧪 Diagnosticador Integrado (NOVO!)

Se ainda tiver problemas, use a ferramenta de debug:

```
http://SEU_IP:5173/pages/debug-mobile.html
```

**Exemplos:**

```
http://192.168.1.100:5173/pages/debug-mobile.html
http://10.0.0.5:5173/pages/debug-mobile.html
```

**Testes disponíveis:**

- ✅ Teste de Ping
- ✅ Teste de Conexão HTTP
- ✅ Teste de CORS
- ✅ Teste de Cálculo de Rota
- ✅ Teste de POIs

Cada teste mostra exatamente onde está o problema!
| **Mensagens de erro vagas** | ✅ Agora mostra o URL do backend para debug |

---

## 🐛 Se Ainda Não Funcionar

### Verifique o Console (DevTools)

1. Abra DevTools no celular: `F12` ou Menu > Developer Tools
2. Vá para a aba **Console**
3. Procure pelo `BACKEND_URL` que foi configurado

```
🔌 Backend URL configurada como: http://192.168.1.100:8080/api
```

### Testes Rápidos

**Teste 1: Backend está rodando?**

```bash
curl http://192.168.1.100:8080/api
```

**Teste 2: Frontend consegue atingir o backend?**
Abra o console no navegador do celular e execute:

```javascript
fetch("http://192.168.1.100:8080/api")
  .then((r) => r.json())
  .then((d) => console.log(d))
  .catch((e) => console.error(e));
```

---

## 🔄 Se Mudar de Rede

O sistema detecta automaticamente o novo IP, basta recarregar a página (`F5` ou swipe down).

---

## 📍 Resumo Rápido

| Local                | URL                          |
| -------------------- | ---------------------------- |
| **Desktop (PC)**     | `http://localhost:5173`      |
| **Mobile (na rede)** | `http://SEU_IP:5173`         |
| **Backend (PC)**     | `http://localhost:8080/api`  |
| **Backend (Mobile)** | Detectado automaticamente ✅ |
