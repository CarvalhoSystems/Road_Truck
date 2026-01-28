@echo off
echo ========================================
echo Road-Truck Server Initialization
echo ========================================
echo.

REM Verifica se está na pasta correta
if not exist "back-end" (
    echo ERROR: Execute este script da pasta raiz do projeto
    pause
    exit /b 1
)

REM Navega para back-end
cd back-end

echo.
echo [1/3] Verificando dependências...
if not exist "node_modules" (
    echo Instalando pacotes npm...
    call npm install
) else (
    echo Pacotes já instalados
)

echo.
echo [2/3] Iniciando servidor...
echo.
echo ========================================
echo SERVIDOR INICIANDO NA PORTA 8081
echo ========================================
echo.
echo Acesse em: http://localhost:8081/pages/router.html
echo.
echo Pressione CTRL+C para parar
echo ========================================
echo.

REM Inicia o servidor
call npm start

pause
