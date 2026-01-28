<#
Script: run_graphhopper_clean.ps1
Descrição: Para o compose, remove o volume de cache do GraphHopper, reconstrói a imagem,
levanta o compose e segue os logs. Use com cuidado — o volume de cache será removido.

Uso:
  # modo interativo (recomendado)
  .\run_graphhopper_clean.ps1

  # modo não interativo (pula confirmação)
  .\run_graphhopper_clean.ps1 -AutoConfirm
#>

param(
    [switch]$AutoConfirm
)

function Run-Command {
    param($cmd)
    Write-Host "=> $cmd" -ForegroundColor Cyan
    & powershell -NoProfile -Command $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Comando falhou: $cmd (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Mudar para pasta do script (garante execução correta)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "Script iniciando em: $PWD" -ForegroundColor Green

if (-not $AutoConfirm) {
    Write-Host "AVISO: este script REMOVERÁ o volume 'graphhopper_graphhopper_cache' e forçará um import limpo." -ForegroundColor Yellow
    $ok = Read-Host "Continuar? (s/n)"
    if ($ok -ne 's' -and $ok -ne 'S') { Write-Host "Cancelado."; exit 0 }
}

try {
    Run-Command "docker compose -f docker-compose.local.yml down"
} catch {
    Write-Host "Falha ao parar compose (continuando)" -ForegroundColor Yellow
}

Write-Host "Removendo volume: graphhopper_graphhopper_cache (se existir)" -ForegroundColor Green
docker volume rm graphhopper_graphhopper_cache -f 2>$null

Write-Host "Reconstruindo imagem road-truck-graphhopper:12.0 (pode demorar)" -ForegroundColor Green
Run-Command "docker build -t road-truck-graphhopper:12.0 ."

Write-Host "Subindo serviços (detached)" -ForegroundColor Green
Run-Command "docker compose -f docker-compose.local.yml up -d"

Write-Host "Seguindo logs do serviço 'graphhopper' (Ctrl+C para sair)" -ForegroundColor Green
Run-Command "docker compose -f docker-compose.local.yml logs -f --tail=200 graphhopper"

Write-Host "Script finalizado." -ForegroundColor Green
