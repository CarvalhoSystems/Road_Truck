$output = @"
╔════════════════════════════════════════════════════════════════╗
║         ROAD-TRUCK SERVER 24H - VERIFICACAO SISTEMA            ║
╚════════════════════════════════════════════════════════════════╝

"@
Write-Host $output -ForegroundColor Cyan

Write-Host "1 NODE.JS" -ForegroundColor Yellow
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if ($nodeExists) {
    $nodeVersion = node --version
    Write-Host "   OK Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERRO Node.js nao encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "2 JAVA" -ForegroundColor Yellow
$javaExists = Get-Command java -ErrorAction SilentlyContinue
if ($javaExists) {
    Write-Host "   OK Java instalado" -ForegroundColor Green
} else {
    Write-Host "   ERRO Java nao encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "3 NPM" -ForegroundColor Yellow
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if ($npmExists) {
    $npmVersion = npm --version
    Write-Host "   OK npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ERRO npm nao encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "4 ARQUIVO .env" -ForegroundColor Yellow
if (Test-Path "C:\Road-Truck\.env") {
    $envSize = (Get-Item "C:\Road-Truck\.env").Length
    $msg = "   OK .env encontrado ($envSize bytes)"
    Write-Host $msg -ForegroundColor Green
} else {
    Write-Host "   ERRO .env nao encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "5 SCRIPTS" -ForegroundColor Yellow
$scripts = @("START_SERVER_24H.bat", "SERVER_JAVA.bat")
foreach ($script in $scripts) {
    $exists = Test-Path "C:\Road-Truck\$script"
    if ($exists) {
        Write-Host "   OK $script" -ForegroundColor Green
    } else {
        Write-Host "   ERRO $script nao encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "6 NODE_MODULES" -ForegroundColor Yellow
if (Test-Path "C:\Road-Truck\back-end\node_modules") {
    Write-Host "   OK node_modules instalado" -ForegroundColor Green
} else {
    Write-Host "   AVISO npm install necessario" -ForegroundColor Yellow
}

$outro = @"

╔════════════════════════════════════════════════════════════════╗
║                         PROXIMAS ACOES                         ║
╚════════════════════════════════════════════════════════════════╝

PASSO 1: Abra novo PowerShell
         cd C:\Road-Truck
         Start SERVER_JAVA.bat

PASSO 2: Abra outro PowerShell
         cd C:\Road-Truck
         Start START_SERVER_24H.bat

PASSO 3: Navegador
         http://localhost:8080

PASSO 4: Teste
         Origem: Sao Paulo
         Destino: Rio de Janeiro

Sucesso quando a rota aparecer no mapa!

"@
Write-Host $outro -ForegroundColor Cyan
