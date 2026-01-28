# 🔧 Debug Mobile - Guia de Uso

## 📱 Como Acessar a Página de Debug

No seu celular, acesse:

```
http://SEU_IP:5173/pages/debug-mobile.html
```

**Exemplo:**

```
http://192.168.1.100:5173/pages/debug-mobile.html
```

---

## 🧪 Testes Disponíveis

### 1️⃣ **Teste de Ping (DNS)**

- Verifica se consegue atingir o servidor na porta 8080
- **Se falhar:** Backend não está acessível (verifique firewall)
- **Se passar:** ✅ Servidor está ligado

### 2️⃣ **Teste de Conexão HTTP**

- Faz uma requisição simples ao backend
- **Se falhar:** Servidor não responde (pode estar travado)
- **Se passar:** ✅ Servidor está respondendo

### 3️⃣ **Teste de CORS**

- Verifica se o servidor aceita requisições do celular
- **Se falhar:** Problema de CORS (já foi resolvido, mas é bom confirmar)
- **Se passar:** ✅ CORS está funcionando

### 4️⃣ **Teste de Cálculo de Rota (Completo)**

- Simula uma requisição real de cálculo de rota
- **Se falhar:** GraphHopper não está rodando ou resposta inválida
- **Se passar:** ✅ Tudo funciona! Tente no app

### 5️⃣ **Teste de POIs**

- Testa busca de Pontos de Interesse
- **Se falhar:** Problema com Overpass API ou conexão
- **Se passar:** ✅ POIs funcionando

---

## 🚀 Passo-a-Passo para Resolver Problemas

### Cenário 1: "Erro de Rede - Verifique sua Internet"

1. **Abra a página de debug**
2. **Execute o Teste de Ping**
   - ❌ Se falhar: **Backend não está rodando**
     ```bash
     # No PC, verifique se está rodando:
     # Terminal do back-end/
     node server.js
     ```
   - ✅ Se passar: Continue para próximo

3. **Execute o Teste de Conexão HTTP**
   - ❌ Se falhar: **Servidor travado, reinicie**
   - ✅ Se passar: Continue

4. **Execute o Teste de CORS**
   - ❌ Se falhar: **Whitelist CORS pode estar incorreta**
   - ✅ Se passar: Continue

5. **Execute o Teste de Rota Completa**
   - ❌ Se falhar: **GraphHopper não está rodando**
     ```bash
     # Terminal separado em graphhopper/
     ./graphhopper.bat
     ```
   - ✅ Se passar: O App deve funcionar agora!

---

## 📊 Interpretando os Resultados

| Teste    | ✅ Sucesso         | ❌ Falha                                  |
| -------- | ------------------ | ----------------------------------------- |
| **Ping** | Servidor acessível | Firewall bloqueando ou porta errada       |
| **HTTP** | Servidor responde  | Servidor travado ou desligado             |
| **CORS** | Headers corretos   | Origem bloqueada (já deve estar ok)       |
| **Rota** | Rota calculada     | GraphHopper down ou sem acesso à internet |
| **POIs** | POIs encontrados   | Overpass API indisponível                 |

---

## 💾 Como Salvar Logs

1. Execute todos os testes
2. Clique em **"Baixar Logs"**
3. Envie o arquivo para análise se necessário

---

## 🔗 Checklist de Verificação

- [ ] PC e Celular na mesma WiFi?
- [ ] Backend rodando? (`node server.js`)
- [ ] GraphHopper rodando? (`./graphhopper.bat`)
- [ ] Frontend rodando? (`npm run dev`)
- [ ] IP do PC correto? (check com `ipconfig`)
- [ ] Teste de Ping passou? ✅
- [ ] Teste de HTTP passou? ✅
- [ ] Teste de CORS passou? ✅
- [ ] Teste de Rota passou? ✅

Se tudo passou, feche e abra o app novamente!

---

## 📞 Precisa de Ajuda?

Se nenhum teste passar:

1. Verifique se está na mesma rede WiFi
2. Tente desativar VPN (se estiver ativa)
3. Verifique Firewall do Windows
4. Reinicie o backend
5. Limpe o cache do navegador no celular
