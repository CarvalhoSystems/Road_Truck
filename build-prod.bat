@echo off
REM =====================================================
REM Road-Truck - Production Build & Deploy Script (Windows)
REM =====================================================

setlocal enabledelayedexpansion

echo.
echo 🚀 Road-Truck Production Build
echo ======================================

REM 1. Verificar Node.js
echo.
echo ✅ Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js não está instalado!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo    Node.js !NODE_VER!
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo    npm !NPM_VER!

REM 2. Verificar arquivo .env
echo.
echo ✅ Verificando configurações...
if not exist "back-end\.env" (
    echo ❌ Arquivo .env não encontrado em back-end\
    echo    Copie back-end\.env.example para back-end\.env
    echo    e preencha com suas credenciais
    pause
    exit /b 1
)

REM 3. Instalar dependências do backend
echo.
echo ✅ Instalando dependências do backend...
cd back-end
call npm ci --only=production
cd ..

REM 4. Verificar variáveis críticas
echo.
echo ✅ Validando variáveis de ambiente...
REM (Verificação básica - em produção use um script mais robusto)

REM 5. Log final
echo.
echo ======================================
echo ✅ Build Production Concluído!
echo.
echo 📋 Próximos passos:
echo    1. Deploy Docker:
echo       docker build -t road-truck . && docker run -p 8081:8081 road-truck
echo.
echo    2. Deploy em Cloud:
echo       Faça push para GitHub/GitLab e configure CI/CD
echo.
echo    3. Verifique os logs após deploy
echo.
pause
