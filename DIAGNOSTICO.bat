@echo off
REM Script de Diagnóstico - Road-Truck
REM Verifica a configuração do projeto

echo.
echo ========================================
echo      DIAGNOSTICO - ROAD-TRUCK
echo ========================================
echo.

REM Teste 1: Node.js
echo [1/5] Verificando Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js nao encontrado!
    echo Instale de: https://nodejs.org
    echo.
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo OK: Node.js !NODE_VER!
)

echo.

REM Teste 2: NPM
echo [2/5] Verificando NPM...
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: NPM nao encontrado!
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo OK: NPM !NPM_VER!
)

echo.

REM Teste 3: Estrutura de pastas
echo [3/5] Verificando estrutura...
if exist "back-end" (
    echo OK: Pasta back-end encontrada
) else (
    echo ERROR: Pasta back-end nao encontrada!
)

if exist "front-end" (
    echo OK: Pasta front-end encontrada
) else (
    echo ERROR: Pasta front-end nao encontrada!
)

echo.

REM Teste 4: Arquivo .env
echo [4/5] Verificando .env...
if exist ".env" (
    echo OK: Arquivo .env encontrado
    echo.
    echo Verificando variaveis:
    findstr "GOOGLE_API_KEY" .env >nul
    if errorlevel 1 (
        echo WARNING: GOOGLE_API_KEY nao definida!
    ) else (
        echo OK: GOOGLE_API_KEY presente
    )
    
    findstr "FIREBASE_PROJECT_ID" .env >nul
    if errorlevel 1 (
        echo WARNING: FIREBASE_PROJECT_ID nao definida!
    ) else (
        echo OK: FIREBASE_PROJECT_ID presente
    )
) else (
    echo ERROR: Arquivo .env nao encontrado!
    echo Crie .env na pasta raiz com suas chaves
)
    findstr "HERE_API_KEY" .env >nul
    if errorlevel 1 (
        echo WARNING: HERE-API-KEY nao definida!
) else (
        echo OK: HERE-API-KEY presente
    )

echo.

REM Teste 5: Porta 8081
echo [5/5] Verificando porta 8081...
netstat -ano | findstr ":8081" >nul
if errorlevel 1 (
    echo OK: Porta 8081 disponivel
) else (
    echo WARNING: Porta 8081 ja esta em uso!
)

echo.
echo ========================================
echo DIAGNOSTICO COMPLETO
echo ========================================
echo.
echo Proximos passos:
echo 1. Abra a pasta em um terminal
echo 2. Execute: RUN_SERVER.bat
echo 3. Acesse: http://localhost:8081/pages/router.html
echo.
pause
