# 📱 GUIA DE TESTE - MOBILE FIX

## 🚀 Passo 1: Testar o Debug (Recomendado)

### URL

```
http://localhost:8080/DEBUG_MOBILE.html
```

### Teste em Mobile (Smartphone Real ou Simulado)

1. Abra a URL no navegador do celular
2. Veja os testes automáticos
3. Clique em "Testar Elementos"
4. Verifique se todos mostram ✅
5. Clique em "Simular Clique Menu"
6. Veja se o menu abre

---

## 🎯 Passo 2: Testar a Página Real

### URL

```
http://localhost:8080/front-end/pages/router.html
```

### Em Celular Real:

1. Abra a URL
2. Procure o hambúrguer (☰) no canto superior esquerdo
3. Clique nele
4. Menu deve abrir com formulário
5. Clique novamente ou fora do menu para fechar
6. Tente preencher os dados e clicar "Traçar Rota"

### Via Simulador (DevTools):

1. Abra no Chrome/Firefox/Safari
2. Pressione F12
3. Pressione Ctrl+Shift+M (ativa mobile)
4. Selecione um dispositivo (ex: iPhone 12)
5. Faça os mesmos testes acima

---

## ✅ O Que Deve Funcionar

### Menu

- [x] ☰ Visível em mobile
- [x] ☰ Desaparece em desktop
- [x] Abre com clique
- [x] Fecha com clique novamente
- [x] Fecha ao clicar overlay
- [x] Fecha ao pressionar ESC
- [x] Overlay escuro ao fundo

### Formulário

- [x] Origem e Destino acessíveis
- [x] Specs do veículo acessíveis
- [x] Botão "Traçar Rota" funciona
- [x] Botão "Limpar" funciona

### Mapa

- [x] Ocupa 50% da altura
- [x] Rota traçada aparece
- [x] Clicável mesmo com menu aberto

---

## 🔍 Se Não Funcionar

### Passo A: Verifique o Console

```
1. F12 (DevTools)
2. Abra a aba "Console"
3. Procure por: "✅ Mobile menu initialized!"
4. Se não vir, há erro no JS
```

### Passo B: Teste Específico

```
1. F12
2. Vá para "Console"
3. Digite e execute:

// Teste 1: Elemento existe?
document.getElementById("menu-toggle") // Deve mostrar o elemento

// Teste 2: Painel existe?
document.getElementById("config-panel") // Deve mostrar o painel

// Teste 3: Simular clique
document.getElementById("menu-toggle").click()
```

### Passo C: Limpe o Cache

```
1. Ctrl+Shift+Delete
2. Selecione "Todos os tempos"
3. Marque "Cookies e dados de site"
4. Clique "Limpar dados"
5. Recarregue a página
```

---

## 🛠️ Troubleshooting

| Problema                   | Solução                            |
| -------------------------- | ---------------------------------- |
| Menu não abre              | Verifique console (F12) se há erro |
| Menu abre mas não fecha    | Clique no overlay (fundo escuro)   |
| Formulário vazio           | Clique no ☰ para expandir menu    |
| Busca de rota não funciona | Teste em desktop primeiro          |
| Página branca              | Limpe cache e recarregue (Ctrl+F5) |

---

## 📞 Informações Importantes

### Arquivos Corrigidos

- ✅ `front-end/CSS/routers.css` - CSS reorganizado
- ✅ `front-end/JS/index.js` - JavaScript reescrito

### Arquivo de Debug

- ✨ `DEBUG_MOBILE.html` - Para testar elementos

### Documentação

- 📖 `CORRECOES_MOBILE_V3.md` - Detalhes técnicos

---

## 🚀 Checklist Final

Antes de confirmar que está funcionando, verifique:

```
Mobile (≤768px):
- [ ] ☰ Visível
- [ ] Menu abre ao clicar
- [ ] Overlay aparece
- [ ] Formulário visível
- [ ] Inputs funcionam
- [ ] Busca funciona
- [ ] Menu fecha
- [ ] Mapa funciona

Desktop (>768px):
- [ ] ☰ Desaparecido
- [ ] 3 colunas visíveis
- [ ] Tudo funciona
```

---

**Pronto! Agora teste em seu celular!** 📱✅

Data: 21 de janeiro de 2026
