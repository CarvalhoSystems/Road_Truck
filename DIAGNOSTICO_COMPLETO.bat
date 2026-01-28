@echo off
REM =========================================================================
REM SCRIPT: DIAGNOSTICO_COMPLETO.bat
REM DESCRICAO: Verifica se tudo está configurado corretamente
REM =========================================================================

setlocal enabledelayedexpansion

cd /d "%~dp0"
color 0F
title Diagnostico - Road-Truck Server

cls
echo =========================================================================
echo                        DIAGNOSTICO COMPLETO
echo                       Road-Truck Server 24H
echo =========================================================================
echo.

:CHECKLIST

echo [1/9] Verificando Node.js...
where node >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%A in ('node --version') do set NODE_VER=%%A
    echo     ✅ Node.js encontrado: !NODE_VER!
) else (
    echo     ❌ Node.js NAO encontrado!
    goto FALHA
)

echo.
echo [2/9] Verificando Java (para GraphHopper)...
where java >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%A in ('java -version 2^>^&1 ^| findstr /R version') do set JAVA_VER=%%A
    echo     ✅ Java encontrado
) else (
    echo     ❌ Java NAO encontrado!
    echo        (Necessário para GraphHopper)
    goto FALHA
)

echo.
echo [3/9] Verificando arquivo .env...
if exist ".env" (
    echo     ✅ .env encontrado
) else (
    echo     ❌ .env NAO encontrado!
    goto FALHA
)

echo.
echo [4/9] Verificando back-end...
if exist "back-end" (
    echo     ✅ Pasta back-end encontrada
    if exist "back-end\package.json" (
        echo     ✅ package.json encontrado
    ) else (
        echo     ❌ package.json NAO encontrado
        goto FALHA
    )
    if exist "back-end\server.js" (
        echo     ✅ server.js encontrado
    ) else (
        echo     ❌ server.js NAO encontrado
        goto FALHA
    )
) else (
    echo     ❌ Pasta back-end NAO encontrada
    goto FALHA
)

echo.
echo [5/9] Verificando node_modules...
if exist "back-end\node_modules" (
    echo     ✅ node_modules encontrado
) else (
    echo     ❌ node_modules NAO encontrado!
    echo        Instalando dependencias...
    cd back-end
    call npm install
    cd ..
)

echo.
echo [6/9] Verificando front-end...
if exist "front-end" (
    echo     ✅ Pasta front-end encontrada
    if exist "front-end\index.html" (
        echo     ✅ index.html encontrado
    ) else (
        echo     ❌ index.html NAO encontrado
        goto FALHA
    )
) else (
    echo     ❌ Pasta front-end NAO encontrada
    goto FALHA
)

echo.
echo [7/9] Testando porta 8080 (Node.js)...
netstat -ano | findstr ":8080 " >nul 2>&1
if !errorlevel! equ 0 (
    echo     ✅ Porta 8080 está EM USO (servidor rodando)
) else (
    echo     ⚠️  Porta 8080 disponível (servidor NAO está rodando)
)

echo.
echo [8/9] Testando porta 8989 (GraphHopper)...
netstat -ano | findstr ":8989 " >nul 2>&1
if !errorlevel! equ 0 (
    echo     ✅ Porta 8989 está EM USO (GraphHopper rodando)
) else (
    echo     ⚠️  Porta 8989 disponível (GraphHopper NAO está rodando)
)

echo.
echo [9/9] Testando conectividade...
ping -n 1 google.com >nul 2>&1
if !errorlevel! equ 0 (
    echo     ✅ Internet funcionando
) else (
    echo     ❌ Sem conexão com Internet!
    goto FALHA
)

echo.
echo =========================================================================
echo                         ✅ DIAGNOSTICO OK!
echo =========================================================================
echo.
echo Proximos passos:
echo   1. Execute: SERVER_JAVA.bat (em outro terminal)
echo   2. Execute: START_SERVER_24H.bat (em outro terminal)
echo   3. Aguarde 15 segundos
echo   4. Abra navegador: http://localhost:8080
echo.
pause
goto FIM

:FALHA
echo.
echo =========================================================================
echo                    ❌ DIAGNOSTICO FALHOU!
echo =========================================================================
echo.
echo Veja acima os erros em vermelho e corrija antes de continuar.
echo.
pause
goto FIM

:FIM
