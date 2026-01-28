# =========================================================================
# SCRIPT: Start-Server-24h.ps1
# DESCRICAO: Inicia e monitora o servidor Node.js continuamente (24h)
# AUTORESTART: Sim - reinicia automaticamente se der crash
# =========================================================================

param(
    [string]$BackendDir = "$PSScriptRoot\back-end",
    [int]$RestartDelaySeconds = 5
)

# Cores para output
$colors = @{
    'Info' = 'Cyan'
    'Success' = 'Green'
    'Warning' = 'Yellow'
    'Error' = 'Red'
}

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warning', 'Error')]
        [string]$Type = 'Info'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    
    Write-Host $logMessage -ForegroundColor $colors[$Type]
}

function Start-Server {
    Write-Log "Iniciando servidor Node.js..." 'Info'
    Write-Log "Diretório: $BackendDir" 'Info'
    
    # Verifica se package.json existe
    if (-not (Test-Path "$BackendDir\package.json")) {
        Write-Log "❌ package.json não encontrado em $BackendDir" 'Error'
        return $false
    }

    try {
        Push-Location $BackendDir
        
        # Verifica se node_modules existe, senão instala
        if (-not (Test-Path ".\node_modules")) {
            Write-Log "📦 Instalando dependências..." 'Warning'
            npm install
        }
        
        # Inicia o servidor
        Write-Log "🚀 Servidor iniciado com sucesso!" 'Success'
        npm start
        
    } catch {
        Write-Log "❌ Erro ao iniciar: $_" 'Error'
        return $false
    } finally {
        Pop-Location
    }
}

# Loop principal
$restartCount = 0
while ($true) {
    $restartCount++
    
    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Magenta
    Write-Host "                    ROAD-TRUCK SERVER (24 HORAS)" -ForegroundColor Magenta
    Write-Host "                    Reinicio #$restartCount" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Inicia o servidor
    Start-Server
    
    # Se chegou aqui, o servidor foi encerrado
    Write-Host ""
    Write-Log "⚠️ Servidor foi encerrado!" 'Warning'
    Write-Log "Aguardando $RestartDelaySeconds segundos antes de reiniciar..." 'Info'
    Write-Host ""
    
    Start-Sleep -Seconds $RestartDelaySeconds
}
