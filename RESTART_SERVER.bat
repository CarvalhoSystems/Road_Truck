@echo off
REM ========================================
REM RESTART_SERVER.bat
REM Mata processo Node.js e reinicia
REM ========================================

echo.
echo 🔴 Matando processo Node.js anterior...
taskkill /F /IM node.exe

echo.
echo ⏳ Aguardando 2 segundos...
timeout /t 2

echo.
echo 🟢 Iniciando novo Node.js server...
cd /d C:\Road-Truck\back-end
node server.js

pause
