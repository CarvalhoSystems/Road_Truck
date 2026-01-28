# 📱 GUIA PASSO A PASSO - TESTAR MENU HAMBÚRGUER

## 🎯 Objetivo

Validar que o menu hambúrguer funciona corretamente em todos os navegadores e dispositivos.

---

## ✅ TESTE 1: HTML Simples (SEM Dependências)

### Passo 1: Abra o Navegador

```
Chrome, Safari ou Firefox
URL: http://localhost:8080/TEST_MENU_SIMPLE.html
```

### Passo 2: Ative o Mode Responsivo

```
Chrome/Firefox:
  1. Pressione F12
  2. Pressione Ctrl+Shift+M
  3. Selecione um telefone (ex: iPhone 12)

Safari:
  1. Pressione Cmd+Option+I
  2. Clique no device icon
  3. Selecione um telefone
```

### Passo 3: Observe o Hambúrguer

```
Em telas pequenas (≤768px):
  ✅ Deve ver: "☰" no canto superior esquerdo
  ✅ Deve ser AZUL (#38bdf8)
  ✅ Ao lado do logo
```

### Passo 4: Clique no Hambúrguer

```
Esperado:
  ✅ Menu abre da esquerda
  ✅ Fundo escuro aparece (overlay)
  ✅ Pode scrollar o menu
  ✅ Campo "Origem", "Destino", etc aparecem
  ✅ Botão "Traçar Rota" e "Limpar" aparecem
```

### Passo 5: Teste Diferentes Formas de Fechar

**Forma 1: Clicar no Hambúrguer Novamente**

```
✅ Clique no ☰ de novo
✅ Menu deve fechar
✅ Overlay desaparece
```

**Forma 2: Clicar no Overlay (Fundo Escuro)**

```
✅ Clique fora do menu (na área escura)
✅ Menu deve fechar
```

**Forma 3: Pressionar ESC**

```
✅ Abra o menu (clique no ☰)
✅ Pressione ESC no teclado
✅ Menu deve fechar
```

**Forma 4: Redimensionar a Tela**

```
✅ Abra o menu
✅ Redimensione para tela grande (>768px)
✅ Menu deve fechar automaticamente
✅ Hambúrguer deve desaparecer
✅ 3 colunas devem aparecer
```

### Passo 6: Confirme o Debug

```
No canto inferior direito, deve ver:
  📊 Debug:
  Tela: [número]px
  Menu: ✅ ABERTO ou ❌ FECHADO
```

---

## ✅ TESTE 2: Página Real do Router

### Passo 1: URL

```
http://localhost:8080/front-end/pages/router.html
```

### Passo 2: Ative Device Mode (como em TESTE 1)

```
F12 → Ctrl+Shift+M
```

### Passo 3: Confirme

```
✅ Hambúrguer (☰) visível
✅ Logo "🚚 RoadTruck" visível
✅ Botão "Sair" visível
✅ Mapa em destaque
```

### Passo 4: Teste o Menu

```
✅ Clique no ☰
✅ Veja os painéis aparecerem
✅ Scroll para ver tudo
✅ Clique fora para fechar
✅ Menu fecha como esperado
```

### Passo 5: Teste em Desktop

```
Redimensione para >768px:
  ✅ Hambúrguer desaparece
  ✅ Menu muda para padrão (3 colunas)
  ✅ Tudo como era antes
```

---

## ✅ TESTE 3: Página Principal

### Passo 1: URL

```
http://localhost:8080/front-end/index.html
```

### Passo 2: Mobile

```
F12 → Ctrl+Shift+M
```

### Passo 3: Observe

```
✅ Texto responsivo
✅ Botões visíveis
✅ Cards empilhados verticalmente
✅ Sem overflow horizontal
```

---

## 🧪 Teste em Diferentes Navegadores

### Chrome

```
1. Abra: http://localhost:8080/TEST_MENU_SIMPLE.html
2. F12
3. Ctrl+Shift+M
4. Clique no ☰
5. Esperado: ✅ Menu abre/fecha
```

### Safari (macOS)

```
1. Abra: http://localhost:8080/TEST_MENU_SIMPLE.html
2. Cmd+Option+I
3. Clique no device icon
4. Clique no ☰
5. Esperado: ✅ Menu abre/fecha
```

### Firefox

```
1. Abra: http://localhost:8080/TEST_MENU_SIMPLE.html
2. F12
3. Ctrl+Shift+M
4. Clique no ☰
5. Esperado: ✅ Menu abre/fecha
```

---

## 🔍 Se Não Funcionar

### Passo 1: Abra o Console

```
F12 → Console
```

### Passo 2: Procure por Erros

```
Deve ver:
✅ Menu mobile inicializado!
✅ Backdrop criado!

Se ver ❌ (vermelho):
  Há um erro JavaScript
```

### Passo 3: Teste Manualmente

```
Cole no console e pressione Enter:
document.getElementById("menu-toggle").click()

Esperado:
  ✅ Menu abre
```

### Passo 4: Verifique o Elemento

```
Cole no console:
document.getElementById("config-panel").classList

Esperado quando menu aberto:
  Inclui "active"

Esperado quando menu fechado:
  NÃO inclui "active"
```

---

## 📊 Checklist Final

### Desktop (>1200px):

- [ ] Hambúrguer desaparece
- [ ] 3 colunas aparecem lado a lado
- [ ] Painel esquerdo: "Calcular Rota"
- [ ] Painel central: Mapa
- [ ] Painel direito: "Detalhes" e "POIs"

### Tablet (768-1200px):

- [ ] Hambúrguer desaparece
- [ ] 2 colunas aparecem
- [ ] Menu normal visível

### Mobile (≤768px) - Menu Fechado:

- [ ] Hambúrguer visível
- [ ] Mapa ocupa a tela (50vh)
- [ ] Overlay não visível

### Mobile (≤768px) - Menu Aberto:

- [ ] Menu desliza da esquerda
- [ ] Overlay (fundo escuro) visível
- [ ] Puedo scroll no menu
- [ ] Campos de input visíveis
- [ ] Botões visíveis

### Interações:

- [ ] ☰ clique = abre
- [ ] ☰ clique novamente = fecha
- [ ] Clique no overlay = fecha
- [ ] ESC = fecha
- [ ] Clique fora = fecha (geralmente)
- [ ] Resize para >768px = fecha

---

## 🎬 Video do Comportamento Esperado

### Mobile:

```
1. Página carrega com Mapa grande
2. Hambúrguer ☰ no topo esquerdo
3. Clique no ☰
4. Menu desliza suavemente
5. Overlay aparece ao fundo
6. Pode ler todos os campos
7. Clique no ☰ de novo
8. Menu desliza para fora
9. Overlay desaparece
10. Voltar ao estado inicial
```

### Desktop (ao redimensionar):

```
1. Começa em mobile (menu aberto)
2. Redimensiona gradualmente
3. Em 769px: layout muda
4. Menu fecha automaticamente
5. Hambúrguer desaparece
6. 3 colunas aparecem
7. Tudo lado a lado
```

---

## 💡 Dicas Avançadas

### Inspecionar CSS

```javascript
// No console:
const panel = document.getElementById("config-panel");
console.log({
  display: getComputedStyle(panel).display,
  position: getComputedStyle(panel).position,
  left: getComputedStyle(panel).left,
  zIndex: getComputedStyle(panel).zIndex,
});
```

### Simulador de Click

```javascript
// No console:
document.getElementById("menu-toggle").click();
// Abre o menu

document.getElementById("menu-toggle").click();
// Fecha o menu
```

### Verificar Tamanho da Tela

```javascript
// No console:
console.log(window.innerWidth);
// Se > 768: desktop
// Se ≤ 768: mobile
```

---

## ✨ Resultado Esperado

### ✅ Sucesso:

```
✅ Menu abre e fecha
✅ Funciona em Chrome
✅ Funciona em Safari
✅ Funciona em Firefox
✅ Mobile: menu recolhível
✅ Desktop: menu normal
✅ Sem erros no console
✅ Performance boa
```

### ❌ Falha:

```
❌ Menu não abre
❌ Menu não fecha
❌ Overlay não aparece
❌ Erros no console
❌ Travamentos
```

---

## 📞 Suporte Final

**Se tudo funcionou:**

```
🎉 Parabéns! Menu 100% funcional!
   Pode usar em produção
```

**Se algo falhou:**

```
⚠️ Abra um ticket com:
   1. Navegador (Chrome/Safari/Firefox)
   2. Tamanho da tela
   3. Erro do console
   4. Screenshot
```

---

**Data:** 21 de janeiro de 2026  
**Teste:** ✅ PRONTO
