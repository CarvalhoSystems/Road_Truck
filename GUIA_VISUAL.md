# 📖 GUIA VISUAL PASSO-A-PASSO

## 🚀 Começar em 3 Passos

### PASSO 1: Abrir Servidor ✅

**Windows:**

```
1. Localize: RUN_SERVER.bat
2. Duplo clique nele
3. Aguarde abrir um terminal
```

**Mac/Linux:**

```bash
cd back-end
npm start
```

**Você deve ver:**

```
✅ Servidor HTTP rodando em http://localhost:8081
```

---

### PASSO 2: Abrir Navegador ✅

**Copie e cole na barra de endereço:**

```
http://localhost:8081/pages/router.html
```

**Você deve ver:**

```
- Formulário com campos (Origem, Destino, Altura, etc.)
- Mapa vazio no centro
- Seção de POIs à direita
```

---

### PASSO 3: Calcular Rota ✅

**Preencha os campos:**

| Campo           | Valor              |
| --------------- | ------------------ |
| **Origem**      | -23.5505, -46.6333 |
| **Destino**     | -22.9068, -43.1729 |
| **Altura**      | 4.4                |
| **Largura**     | 2.6                |
| **Comprimento** | 18.6               |
| **Peso**        | 45                 |
| **Eixos**       | 6                  |

**Click em "Calcular Rota"**

---

## 📊 O Que Você Vai Ver

### Mapa

```
🗺️  ANTES: Vazio
✅ DEPOIS: 3 linhas com cores diferentes
         - Laranja (Rota 1 - melhor)
         - Azul (Rota 2)
         - Verde (Rota 3)

📍 Marcadores:
         - Ponto verde = Origem
         - Ponto vermelho = Destino
         - ⛽ = Postos de combustível
         - 🚛 = Paradas de caminhão
```

### Informações (Caixa Superior)

```
✅ 3 rota(s) calculada(s)

Rota 1: 430.5 km • 6h 15min
Rota 2: 456.2 km • 6h 45min
Rota 3: 448.1 km • 6h 30min

📏 Distância (1ª): 430.5 km
⏱️ Tempo Est.: 6h 15min
```

### POIs (Lado Direito)

```
🛣️ ROTA 1
⛽ Postos de Abastecimento e 🚛 Paradas de Caminhão

⛽ Posto Shell - Rodovia Anhanguera
   📍 52.3 km desde o ponto anterior (Origem)

⛽ Combustível Mega - Jundiaí
   📍 18.7 km desde o ponto anterior (Posto Shell)

🚛 Truck Stop Brasil - São José dos Campos
   📍 65.2 km desde o ponto anterior (Combustível Mega)

... (mais 10 postos listados)

🏁 42.1 km até o Destino final.

---

🛣️ ROTA 2
⛽ Postos de Abastecimento e 🚛 Paradas de Caminhão
(lista similar)

---

🛣️ ROTA 3
⛽ Postos de Abastecimento e 🚛 Paradas de Caminhão
(lista similar)
```

---

## 📱 Testar em Mobile

### Abrir DevTools (Ferramentas do Desenvolvedor)

**Chrome/Edge:**

```
Windows: F12 ou Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Ativar Modo Mobile

**Chrome:**

```
1. DevTools aberto (F12)
2. Click no ícone de celular (canto superior esquerdo)
3. Escolha: iPhone SE ou similar
```

### O Layout Deve Ficar

```
📱 MOBILE (375px)

┌─────────────────┐
│   Formulário    │  ← Origem, Destino, etc
├─────────────────┤
│    MAPA         │  ← Rotas e POIs
│                 │
├─────────────────┤
│   POIs Lista    │  ← Combustíveis, paradas
│  (scroll)       │
└─────────────────┘
```

---

## 🔍 Verificar Tudo Está Funcionando

### 1. Abrir DevTools Console

```
F12 → Console (aba)
```

### 2. Procurar por Estas Mensagens

**✅ Bom (Você deve ver):**

```
📍 Rotas recebidas: 3
✅ Encontrados 25 POIs para a rota 1.
✅ Encontrados 28 POIs para a rota 2.
✅ Encontrados 22 POIs para a rota 3.
```

**❌ Ruim (Problema):**

```
Error: ...
ERRO ao chamar servidor
Sem rotas
```

---

## 🛠️ Se Algo Não Funcionar

### Problema 1: Mapa branco (sem rotas)

**Causas possíveis:**

1. Backend não está rodando
2. GOOGLE_API_KEY inválida
3. Navegador não tem permissão

**Solução:**

```
1. Abra o terminal onde rodou RUN_SERVER.bat
2. Procure por erros (em vermelho)
3. Se vir "Cannot GET /api/calculate-route"
   → Backend não está rodando corretamente
```

### Problema 2: Sem POIs

**Causas possíveis:**

1. Overpass API está lenta
2. Sem internet
3. Rate limit esgotado

**Solução:**

```
1. Aguarde 2-3 segundos
2. Tente novamente
3. Se persistir, Overpass pode estar offline
   (gratuito, às vezes fica lento)
```

### Problema 3: Porta 8081 em uso

**Você vê:**

```
Error: listen EADDRINUSE :::8081
```

**Solução:**

```
1. Feche RUN_SERVER.bat
2. Aguarde 10 segundos
3. Execute novamente
```

---

## 📊 Testar Outras Rotas

Depois que funcionar com São Paulo → Rio, teste com:

### Curitiba → Brasília (Longa)

```
Origem: -25.4267, -49.2653
Destino: -15.7697, -47.8822

Tempo: ~16 horas
POIs: 35-50
```

### Belo Horizonte → São Paulo (Curta)

```
Origem: -19.9191, -43.9386
Destino: -23.5505, -46.6333

Tempo: ~6 horas
POIs: 15-25
```

### Salvador → Manaus (Muito Longa)

```
Origem: -12.9714, -38.5014
Destino: -3.1019, -60.0217

Tempo: ~30+ horas
POIs: 50+
```

---

## ✨ Features Avançadas

### Usar Minha Localização

```
1. Click em "Usar Minha Localização"
2. Browser pedirá permissão
3. Campo "Origem" será preenchido automaticamente
```

### Limpar Mapa

```
1. Click em "Limpar Mapa"
2. Sistema pede confirmação
3. Tudo é removido
```

### Chat com Suporte

```
1. Abra seção de POIs
2. Scroll até o final
3. Click em "Abrir Chat"
4. Digite sua dúvida
5. Clique "Enviar"
```

---

## 📞 Dúvidas Frequentes

**P: Por que só mostra 3 rotas?**
A: Google API retorna máximo 3. É o padrão.

**P: Por que POIs demoraram?**
A: Overpass API é gratuita e tem limite de requisições.

**P: Funciona offline?**
A: Não, precisa internet para Google API e Overpass.

**P: Posso usar em celular?**
A: Sim! Totalmente responsivo.

**P: Preciso de conta para testar?**
A: Sim, é preciso login com email válido.

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────┐
│  DESKTOP (Tela grande)                              │
│  ┌──────────┬─────────────┬──────────┐             │
│  │Formulário│   MAPA      │  POIs    │             │
│  │          │   (grande)  │  (lista) │             │
│  │          │             │          │             │
│  └──────────┴─────────────┴──────────┘             │
└─────────────────────────────────────────────────────┘

┌─────────────────┐
│ MOBILE (75px)   │
│ ┌─────────────┐ │
│ │ Formulário  │ │
│ ├─────────────┤ │
│ │   MAPA      │ │
│ │  (médio)    │ │
│ ├─────────────┤ │
│ │ POIs (scroll│ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 🚀 Próximos Passos

1. **Execute:** RUN_SERVER.bat
2. **Acesse:** http://localhost:8081/pages/router.html
3. **Preencha:** Origem e destino
4. **Clique:** Calcular Rota
5. **Veja:** 3 rotas com POIs
6. **Explore:** Diferentes rotas
7. **Teste:** No mobile (F12)

---

**Pronto! Você está usando o Road-Truck v2.0 100% funcional! 🎉**
