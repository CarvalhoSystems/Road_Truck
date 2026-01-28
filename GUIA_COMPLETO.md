# 🚚 Road-Truck - Guia Completo de Uso

## 📋 Alterações Realizadas - Versão Final

### ✅ Problemas Corrigidos

1. **Múltiplas Rotas Não Apareciam**

   - ✔️ Ativado `computeAlternativeRoutes: true` na API do Google
   - ✔️ Backend retorna múltiplas rotas corretamente formatadas
   - ✔️ Frontend renderiza todas as rotas com cores diferentes

2. **POIs (Postos de Combustível) Não Aparecem**

   - ✔️ Implementada integração com **Overpass API** (OpenStreetMap)
   - ✔️ Busca postos de combustível e paradas de caminhão
   - ✔️ Calcula distâncias entre pontos
   - ✔️ Exibe lista formatada e marcadores no mapa

3. **CSS Responsivo**
   - ✔️ Otimizado para desktop (3 colunas)
   - ✔️ Otimizado para tablet/laptop (1 coluna)
   - ✔️ Otimizado para mobile (< 480px)
   - ✔️ Mapa responsivo com altura mínima ajustada

---

## 🚀 Como Executar - 3 Passos Simples

### Opção 1: Executar com Script (Recomendado - Windows)

```bash
1. Clique duas vezes em: RUN_SERVER.bat
2. Aguarde a mensagem: "SERVIDOR INICIANDO NA PORTA 8081"
3. Abra seu navegador: http://localhost:8081/pages/router.html
```

### Opção 2: Executar Manual (Windows/Mac/Linux)

```bash
# Terminal 1 - Inicie o Backend
cd back-end
npm install  (somente primeira vez)
npm start

# Abrira o navegador
http://localhost:8081/pages/router.html
```

---

## 📍 Como Testar Completamente

### Teste 1: Múltiplas Rotas (São Paulo → Rio de Janeiro)

**Dados de Entrada:**

- **Origem:** -23.5505, -46.6333
- **Destino:** -22.9068, -43.1729
- **Altura:** 4.4 m
- **Largura:** 2.6 m
- **Comprimento:** 18.6 m
- **Peso:** 45 toneladas
- **Eixos:** 6

**Resultado Esperado:**

- ✅ 3 rotas aparecem no mapa (cores: laranja, azul, verde)
- ✅ Seção "POIs Próximos" mostra:
  - Rota 1: Lista de postos e paradas
  - Rota 2: Lista de postos e paradas
  - Rota 3: Lista de postos e paradas
- ✅ Mapa mostra ⛽ e 🚛 em todos os POIs encontrados
- ✅ Informações de distância e tempo para cada rota

### Teste 2: Mobile (Responsividade)

1. Abra o DevTools (F12)
2. Clique em "Toggle device toolbar" (Ctrl+Shift+M)
3. Teste em:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)

**Esperado:**

- ✅ Layout adapta para 1 coluna
- ✅ Mapa aparece no topo
- ✅ Formulário e POIs em scroll vertical
- ✅ Botões responsivos

### Teste 3: Diferentes Rotas

**Teste Curitiba → Brasília:**

- Origem: -25.4267, -49.2653
- Destino: -15.7697, -47.8822

**Teste Salvador → Manaus:**

- Origem: -12.9714, -38.5014
- Destino: -3.1019, -60.0217

---

## 🔧 Arquivos Modificados

### Backend (`back-end/server.js`)

1. **Ativação de Rotas Alternativas (linha 445)**

   ```javascript
   computeAlternativeRoutes: true,  // ✅ Antes era false
   ```

2. **Melhorado Retorno de Rotas (linha 450)**

   - Agora retorna formato padronizado: `{ routes: [...] }`
   - Inclui logs detalhados

3. **Implementado POIs com Overpass API (linha 495)**
   - Busca postos de combustível em bbox
   - Retry automático se falhar
   - Trata nodes e ways corretamente

### Frontend (`front-end/JS/index.js`)

1. **Melhorado Processamento de Rotas (linha 305)**

   - Trata múltiplos formatos de polyline
   - Logs mais detalhados
   - Cores diferentes para cada rota

2. **Busca de POIs para Todas as Rotas (linha 365)**

   - Antes: apenas rota 1
   - Agora: todas as rotas

3. **Exibição Melhorada (linha 390)**
   - Lista separada por rota
   - Limite de 10 POIs por rota (evita UI pesada)
   - Distâncias calculadas entre pontos

### CSS (`front-end/CSS/routers.css`)

1. **Responsividade Mobile (linha 850+)**
   - Layout 1 coluna em tablets
   - Ajustes para móveis < 480px
   - POI list com scroll dedicado

---

## 🛠️ Resolução de Problemas

### Problema: "Erro ao chamar o servidor"

**Causa:** Backend não está rodando

**Solução:**

```bash
cd back-end
npm start
```

Verifique se mostra: `✅ Servidor HTTP rodando em http://localhost:8081`

---

### Problema: "Sem rotas encontradas"

**Causa:** Google API Key inválida ou quota esgotada

**Solução:**

1. Verifique `.env` arquivo
2. Verifique se GOOGLE_API_KEY está válida
3. Verifique se sua API tem permissão para Routes API
4. Verifique quota em: https://console.cloud.google.com

---

### Problema: "POIs não aparecem"

**Causa:** Overpass API pode estar lenta ou indisponível

**Solução:**

1. Abra DevTools (F12)
2. Vá para Console
3. Procure por logs: "🔎 Buscando POIs"
4. Se houver erro, tente novamente em 5 minutos

**Nota:** Overpass API é grátis mas tem rate limiting

---

### Problema: "Mapa não aparece"

**Causa:** Leaflet não carregou

**Solução:**

1. Verifique se está usando HTTPS ou localhost
2. Se usar proxy, configure para permitir unpkg.com
3. Abra DevTools Console e procure por erros de script

---

## 📊 Estrutura do Projeto

```
Road-Truck/
├── back-end/
│   ├── server.js                 # ✅ Backend principal
│   ├── package.json
│   └── certs/
│       ├── cert.pem
│       └── key.pem
├── front-end/
│   ├── pages/
│   │   ├── router.html          # ✅ Página principal
│   │   ├── login.html
│   │   └── admin.html
│   ├── JS/
│   │   ├── index.js             # ✅ Lógica do roteador
│   │   ├── auth.js
│   │   └── config.js
│   └── CSS/
│       ├── routers.css          # ✅ Estilos responsivos
│       ├── styles.css
│       └── login.css
├── functions/
│   ├── index.js
│   └── package.json
├── RUN_SERVER.bat               # ✅ Script de inicialização
└── .env                         # ✅ Variáveis de ambiente
```

---

## 🔐 Variáveis de Ambiente (.env)

Certifique-se de que o arquivo `.env` na raiz contém:

```env
# Firebase
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_PRIVATE_KEY=sua_private_key
FIREBASE_CLIENT_EMAIL=seu_email@firebase.iam.gserviceaccount.com

# Google API
GOOGLE_API_KEY=sua_chave_google

# GraphHopper (opcional)
GH_SERVER_URL=http://localhost:8989

# Servidor
PORT=8081
NODE_ENV=development
```

---

## 📈 Performance

### Otimizações Implementadas

- ✅ Limite de 200 POIs no mapa (evita lag)
- ✅ Limite de 10 POIs por rota na lista (UI limpa)
- ✅ Retry automático na Overpass API
- ✅ Decodificação eficiente de polyline
- ✅ Cache de bbox para cada rota

### Tempos Esperados

| Ação          | Tempo   |
| ------------- | ------- |
| Calcular rota | 2-5 seg |
| Buscar POIs   | 1-3 seg |
| Render mapa   | < 1 seg |
| Total         | 4-9 seg |

---

## 🎨 Personalizações Possíveis

### Alterar Cores das Rotas

Em `front-end/JS/index.js` linha 306:

```javascript
const colors = ["#FF6B35", "#2E86AB", "#4CAF50", "#FF8C00", "#228B22"];
```

### Alterar Ícones dos POIs

Em `front-end/JS/index.js` linha 135:

```javascript
function createPoiIcon(type) {
  let html = "❓";
  if (type === "posto") html = "⛽"; // Mudar emoji aqui
  if (type === "pedagio") html = "🛑";
  // ...
}
```

### Alterar Limite de POIs

Em `front-end/JS/index.js` linha 470:

```javascript
const MAX_POIS_TO_DRAW = 200; // Aumentar/diminuir
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o Console (F12)**

   - Procure por erros vermelhos
   - Procure por logs com 📍, ⛽, etc

2. **Verifique os Logs do Servidor**

   - Terminal do Node.js deve mostrar requisições

3. **Teste com DevTools**
   - Abra Network tab
   - Procure por respostas vermelhas (erros 4xx/5xx)

---

## ✨ Recursos Implementados

- ✅ Múltiplas rotas (até 3)
- ✅ POIs dinâmicos (Overpass API)
- ✅ Cálculo de distâncias Haversine
- ✅ Layout responsivo (desktop/mobile)
- ✅ Dark mode automático
- ✅ Marcadores coloridos
- ✅ Popups informativos
- ✅ Logs detalhados
- ✅ Tratamento de erros

---

**Versão:** 2.0 Final  
**Data:** 20 de dezembro de 2025  
**Status:** 100% Funcional ✅
