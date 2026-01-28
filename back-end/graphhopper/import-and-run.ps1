<#
Importa todos os arquivos .pbf na pasta `data` e inicia o container GraphHopper

Uso:
  1. Coloque seus PBFs em `BACK-END/graphhopper/data`
  2. Abra PowerShell como Administrador
  3. Rode: `.lash-import-and-run.ps1` (ou `.rom where you are\import-and-run.ps1`)
#>

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "GraphHopper helper script -- working dir: $root"

# --- VERIFICA DOCKER ---
docker ps > $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker não parece estar em execução. Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
}

# Verifica pasta data
$dataDir = Join-Path $root 'data'
if (-Not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    Write-Host "Criada pasta: $dataDir"
}

$pbfs = Get-ChildItem -Path $dataDir -Filter '*.pbf' -File
if ($pbfs.Count -eq 0) {
    Write-Warning "Nenhum arquivo .pbf encontrado em $dataDir. Coloque os PBFs (brazil, argentina, etc.) dentro desta pasta e rode novamente."
    exit 1
}

Write-Host "Encontrados $($pbfs.Count) PBF(s):"
$pbfs | ForEach-Object { Write-Host " - $($_.Name)" }

Write-Host "Iniciando docker-compose (import + web). Isto pode demorar muito dependendo do tamanho dos PBFs..."

Push-Location $root
try {
    docker compose up -d
} catch {
    Write-Error "Falha ao executar docker compose: $_"
    Pop-Location
    exit 1
}

Write-Host "Container inicializado. Acompanhe os logs (pode demorar enquanto importa):"
Write-Host "  docker logs -f graphhopper"

Pop-Location
