@echo off
REM ==========================================
REM 🚀 ROAD-TRUCK STARTUP COMPLETO
REM ==========================================
REM Este script inicia TUDO que você precisa para o projeto 100% funcional

echo.
echo ========================================
echo   🚀 ROAD-TRUCK - STARTUP COMPLETO
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não está instalado ou não está no PATH
    echo Por favor, instale Node.js de: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Verificar se ngrok está instalado
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: ngrok não está instalado
    echo Por favor, instale de: https://ngrok.com/
    pause
    exit /b 1
)

echo ✅ ngrok detectado
echo.

REM Matar processos anteriores
echo 🔄 Matando processos Node.js anteriores...
taskkill /F /IM node.exe >nul 2>&1

REM Aguardar um pouco
timeout /t 2 /nobreak >nul

REM Iniciar Backend em Terminal separado
echo 🚀 Iniciando Backend (Node.js porta 8080)...
start "RoadTruck Backend" cmd /k "cd /d C:\Road-Truck && node back-end\server.js"

REM Aguardar backend iniciar
timeout /t 3 /nobreak >nul

REM Iniciar ngrok em Terminal separado
echo 📡 Iniciando ngrok para expor localhost:8080...
start "RoadTruck ngrok" cmd /k "ngrok http 8080"

REM Aguardar ngrok conectar
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ✅ TUDO INICIADO COM SUCESSO!
echo ========================================
echo.
echo 📍 Próximas ações:
echo    1. Abra: https://routers-caminhao.web.app
echo    2. Login com email ou Google
echo    3. Calcule uma rota
echo    4. Visualize os POIs
echo.
echo 💡 O ngrok abriu em um terminal separado
echo    Copie a URL de forwarding se precisar compartilhar
echo.
pause
