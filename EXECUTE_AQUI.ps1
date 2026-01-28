# =========================================================================
# COMECE AQUI - Comandos para PowerShell
# =========================================================================
# Copie e COLE cada seção em um PowerShell novo

# TERMINAL 1: Iniciar GraphHopper
# =========================================================================
# Copie tudo abaixo e cole em UM PowerShell novo:

cd C:\Road-Truck
Start-Process -FilePath ".\SERVER_JAVA.bat" -NoNewWindow
Write-Host "GraphHopper iniciando... Aguarde 15 segundos"
Start-Sleep -Seconds 15


# TERMINAL 2: Iniciar Node.js
# =========================================================================
# Copie tudo abaixo e cole em OUTRO PowerShell novo:

cd C:\Road-Truck
Start-Process -FilePath ".\START_SERVER_24H.bat" -NoNewWindow
Write-Host "Servidor Node.js iniciando... Aguarde 5 segundos"
Start-Sleep -Seconds 5


# AGORA NO NAVEGADOR
# =========================================================================
# Abra: http://localhost:8080
# Preencha:
#   Origem: São Paulo
#   Destino: Rio de Janeiro
#   Altura: 3.8 m
#   Peso: 20 ton
#   Eixos: 3
# Clique em "Calcular Rota"
# Se a rota aparecer = TUDO FUNCIONANDO!
