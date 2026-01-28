<#
Run GraphHopper using the official released web JAR (Version 12.0).

This script will:
- Download the released 'graphhopper-web-0.12.0.jar' (if not present)
- Use the 'config.yml' for configuration (which must contain datareader.files)
- Run GraphHopper with the server command to import and serve the API.

Notes:
- This requires Java 17+ installed.
- Ensure 'config.yml' is set up with 'datareader.files' for multiple countries.
- Ensure 'my_truck_model.json' is using the V12 'variables' block.
- Delete the 'graph-cache' folder before running for the first time with V12.
#>

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
## Prefer a local 12.0 jar if present (matches config-example.yml format)
if (Test-Path (Join-Path $scriptDir 'graphhopper-web-11.0.jar')) {
    $jarPath = Join-Path $scriptDir 'graphhopper-web-11.0.jar'
    Write-Host "Using local JAR: $jarPath"
} else {
    $jarVersion = '11.0'
    $jarFilename = "graphhopper-web-$jarVersion.jar"
    $jarUrl = "https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/$jarVersion/$jarFilename"
    $jarPath = Join-Path $scriptDir $jarFilename

    # --- download if missing ---
    if (-not (Test-Path $jarPath)) {
        Write-Host "Downloading GraphHopper web JAR (Version $jarVersion)..."
        try {
            Invoke-WebRequest -Uri $jarUrl -OutFile $jarPath -UseBasicParsing
        } catch {
            Write-Error "Failed to download GraphHopper JAR from $jarUrl. Check your network or the URL."
            exit 1
        }
    }
}

# --- 1. DOWNLOAD DO JAR ---
if (-not (Test-Path $jarPath)) {
    Write-Host "Downloading GraphHopper web JAR (Version $jarVersion)..."
    try {
        Invoke-WebRequest -Uri $jarUrl -OutFile $jarPath -UseBasicParsing
    } catch {
        Write-Error "Failed to download GraphHopper JAR from $jarUrl. Check your network or the URL."
        exit 1
    }
}

# --- 2. CONFIG FILE CHECK ---
# Não tentaremos baixar um config-example.yml, confiando que o usuário corrigiu o config.yml existente
$configPath = Join-Path $scriptDir 'config.yml'
if (-not (Test-Path $configPath)) {
    Write-Error "Configuration file not found: $configPath. Please create it using the content provided previously."
    exit 1
}

# --- 3. JAVA CHECK ---
Write-Host "Checking Java..."
& java -version
if ($LASTEXITCODE -ne 0) { Write-Error "Java not found or returned error. Install Java 17+ and ensure 'java' is on PATH."; exit 1 }

# --- 4. START SERVER ---
Write-Host "Starting GraphHopper server (using config.yml for multiple PBFs)..."
Write-Host "This step can take a long time depending on the PBF size and hardware."

# A execução agora depende APENAS do config.yml para carregar os arquivos OSM.
# Ajuste de memória Java para prevenir OOM durante import (ajuste conforme RAM disponível)
$xms = '-Xms1g'
$xmx = '-Xmx6g'
Write-Host "Running: java $xms $xmx -jar $jarPath server $configPath"
& java $xms $xmx -jar $jarPath server $configPath