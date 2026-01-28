@echo off
REM =====================================================
REM Road-Truck - Quick Start Script (Windows)
REM =====================================================

setlocal enabledelayedexpansion

echo.
echo 🚚 Road-Truck - Quick Start
echo ============================
echo.

REM 1. Check Node.js
echo 1️⃣  Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js não está instalado
    echo    Baixe em: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo ✅ Node.js !NODE_VER!

REM 2. Check .env
echo.
echo 2️⃣  Verificando .env...
if not exist "back-end\.env" (
    echo ⚠️  .env não encontrado
    echo    Copiando .env.example...
    copy "back-end\.env.example" "back-end\.env"
    echo.
    echo ⚠️  IMPORTANTE: Edite back-end\.env com suas credenciais!
    echo.
    echo Credenciais necessárias:
    echo   - FIREBASE_PROJECT_ID
    echo   - FIREBASE_CLIENT_EMAIL
    echo   - FIREBASE_PRIVATE_KEY
    echo   - GOOGLE_API_KEY
    echo.
    pause
) else (
    echo ✅ .env encontrado
)

REM 3. Install dependencies
echo.
echo 3️⃣  Instalando dependências...
cd back-end
call npm install
cd ..
echo ✅ Dependências instaladas

REM 4. Ready to start
echo.
echo ============================
echo ✅ Pronto para iniciar!
echo.
echo Para começar:
echo   npm start  (de dentro de back-end\)
echo.
echo Depois acesse:
echo   http://localhost:8081
echo.
echo Para produção:
echo   build-prod.bat
echo.
pause
