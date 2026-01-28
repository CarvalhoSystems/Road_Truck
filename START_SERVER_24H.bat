@echo off
REM =========================================================================
REM SCRIPT: START_SERVER_24H.bat
REM DESCRICAO: Inicia o servidor Node.js e mantém rodando 24 horas
REM STATUS: Reinicia automaticamente se der crash
REM =========================================================================

setlocal enabledelayedexpansion

:SETUP
cd /d "%~dp0"
color 0A
title [24h] Road-Truck Server - Auto-Restart System
cls

echo.
echo =========================================================================
echo                    ROAD-TRUCK SERVER (24 HORAS)
echo                    Auto-Restart e Diagnóstico
echo =========================================================================
echo.
echo Data/Hora Inicio: %date% %time%
echo Diretorio: %CD%
echo.

REM Verifica se .env existe
if not exist ".env" (
    echo.
    echo [ERRO] Arquivo .env nao encontrado em: %CD%
    echo [ACAO] Copie o arquivo .env para esta pasta antes de continuar
    pause
    exit /b 1
)

REM Verifica se node_modules existe
if not exist "back-end\node_modules" (
    echo.
    echo [AVISO] Pasta node_modules nao encontrada
    echo [ACAO] Instalando dependencias com npm install...
    cd back-end
    call npm install
    cd ..
)

:LOOP
echo.
echo =========================================================================
echo [%date% %time%] Iniciando servidor Node.js...
echo =========================================================================
echo.

cd back-end

REM Inicia o servidor com logs detalhados
call npm start

echo.
echo =========================================================================
echo [ERRO] Servidor foi encerrado inesperadamente!
echo [INFO] Logs acima mostram o motivo do crash
echo [ACAO] Reiniciando em 5 segundos...
echo =========================================================================
echo.

REM Aguarda 5 segundos antes de reiniciar
timeout /t 5 /nobreak

REM Volta para loop
cd ..
goto LOOP

pause
