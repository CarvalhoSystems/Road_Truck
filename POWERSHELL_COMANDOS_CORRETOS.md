# 🚛 ROAD-TRUCK: COMANDOS POWERSHELL CORRETOS

## ⚠️ IMPORTANTE

Você está usando **PowerShell**, não CMD ou Bash. Os comandos são diferentes!

---

## ✅ PASSO 1: Configuração do .env (FEITO!)

```powershell
# ✅ Backup do .env antigo
Copy-Item -Path C:\Road-Truck\.env -Destination C:\Road-Truck\.env.backup -Force

# ✅ Deletar .env antigo
Remove-Item -Path C:\Road-Truck\.env -Force

# ✅ Renomear .env.new → .env
Rename-Item -Path C:\Road-Truck\.env.new -NewName .env

# ✅ Verificar
Get-Item C:\Road-Truck\.env
```

---

## 🔧 PASSO 2: Executar GraphHopper (Terminal 1)

```powershell
# Vá para a pasta
cd C:\Road-Truck

# Execute o servidor Java com símbolo & na frente
& .\SERVER_JAVA.bat

# OU use cmd.exe
cmd /c .\SERVER_JAVA.bat
```

**Esperado:** Depois de 10-15 segundos:

```
✅ GraphHopper started
```

---

## 🔧 PASSO 3: Executar Node.js Server (Terminal 2)

```powershell
# Vá para a pasta
cd C:\Road-Truck

# Execute o servidor Node.js
& .\START_SERVER_24H.bat

# OU use cmd.exe
cmd /c .\START_SERVER_24H.bat
```

**Esperado:**

```
✅ Servidor rodando na porta 8080
```

---

## 🌐 PASSO 4: Abrir no Navegador

```powershell
# Abrir navegador (PowerShell v3+)
Start-Process "http://localhost:8080"

# OU manualmente:
# Abra seu navegador e acesse: http://localhost:8080
```

---

## 🧪 PASSO 5: Testar Conexão com Servidor

```powershell
# Verificar se Node.js está respondendo
Invoke-WebRequest -Uri "http://localhost:8080/api/ping" -ErrorAction Stop

# Resultado esperado:
# {"ok":true,"now":"2026-01-18T..."}
```

---

## 📊 PASSO 6: Verificar Processos Rodando

```powershell
# Ver todos os processos node
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# Ver todos os processos java
Get-Process | Where-Object { $_.ProcessName -eq "java" }

# OU de forma mais simples:
Get-Process node
Get-Process java
```

---

## 🛑 PASSO 7: Parar os Servidores (Quando precisar)

```powershell
# Parar Node.js
Stop-Process -Name "node" -Force

# Parar GraphHopper (Java)
Stop-Process -Name "java" -Force

# OU feche os Prompts manualmente
```

---

## ⚡ ATALHOS ÚTEIS

```powershell
# Abrir Explorador de Arquivos
Invoke-Item C:\Road-Truck

# Listar arquivos .env
Get-Item C:\Road-Truck\.env*

# Ver conteúdo do .env
Get-Content C:\Road-Truck\.env

# Ir para pasta Road-Truck
cd C:\Road-Truck

# Listar pasta
ls

# Listar com detalhes
ls -la

# Procurar arquivo
Get-ChildItem -Recurse -Filter "*.env"
```

---

## 📝 SCRIPT COMPLETO (Copie e Cole)

```powershell
# ===== SETUP COMPLETO =====

Write-Host "🚛 Road-Truck - Setup Completo" -ForegroundColor Cyan
Write-Host ""

# 1. Ir para pasta
Write-Host "1️⃣ Entrando na pasta Road-Truck..."
cd C:\Road-Truck

# 2. Verificar .env
Write-Host "2️⃣ Verificando arquivo .env..."
if (Test-Path ".\\.env.new") {
    Write-Host "   ✅ .env.new encontrado"
    Rename-Item -Path ".env.new" -NewName ".env" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Renomeado para .env"
} else {
    Write-Host "   ⚠️ .env.new não encontrado"
}

# 3. Verificar Node.js
Write-Host "3️⃣ Verificando Node.js..."
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ Node.js instalado: $(node --version)"
} else {
    Write-Host "   ❌ Node.js NÃO instalado!"
}

# 4. Verificar Java
Write-Host "4️⃣ Verificando Java..."
if (Get-Command java -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ Java instalado"
} else {
    Write-Host "   ❌ Java NÃO instalado!"
}

# 5. Listar arquivos importantes
Write-Host "5️⃣ Arquivos prontos:"
Get-ChildItem -Filter "START_SERVER_24H.bat", "SERVER_JAVA.bat", ".env" |
    ForEach-Object { Write-Host "   ✅ $_" }

Write-Host ""
Write-Host "🎯 PRÓXIMAS AÇÕES:" -ForegroundColor Green
Write-Host "   1. Abra 2 PowerShells diferentes"
Write-Host "   2. Em um: & .\SERVER_JAVA.bat"
Write-Host "   3. No outro: & .\START_SERVER_24H.bat"
Write-Host "   4. Aguarde 15 segundos"
Write-Host "   5. Navegador: http://localhost:8080"
Write-Host ""
```

---

## 🎓 DIFERENÇAS POWERSHELL vs CMD vs BASH

| Ação          | CMD               | PowerShell                | Bash             |
| ------------- | ----------------- | ------------------------- | ---------------- |
| Deletar       | `del arquivo`     | `Remove-Item arquivo`     | `rm arquivo`     |
| Renomear      | `ren antigo novo` | `Rename-Item antigo novo` | `mv antigo novo` |
| Copiar        | `copy a b`        | `Copy-Item a b`           | `cp a b`         |
| Listar        | `dir`             | `Get-ChildItem` ou `ls`   | `ls`             |
| Mover         | `move a b`        | `Move-Item a b`           | `mv a b`         |
| Executar .bat | `script.bat`      | `& .\script.bat`          | `./script.sh`    |
| Variáveis     | `%var%`           | `$var`                    | `$var`           |

---

## ✅ RESUMO

**Você já fez:**
✅ Renomeou .env.new → .env
✅ Fez backup do .env antigo

**Próximo:**

1. Abra 2 PowerShells
2. Execute: `& .\SERVER_JAVA.bat` (um)
3. Execute: `& .\START_SERVER_24H.bat` (outro)
4. Abra: http://localhost:8080

Simples! 🚀

---

**Dica:** Se quiser sempre usar bash/Linux commands, instale **Windows Terminal** + **WSL2** (Windows Subsystem for Linux)
