<#
Build and import GraphHopper image and PBFs (PowerShell)

Usage:
  Open PowerShell as Administrator and run this script from the `BACK-END/graphhopper` folder,
  or call it by its full path. The script will build a local Docker image (if not skipped),
  import all `.osm.pbf` files found in the `data` subfolder and start the GraphHopper web server.

Examples:
  # Build, import and start
  .\build-and-import.ps1

  # Skip build (if you already have the image locally)
  .\build-and-import.ps1 -SkipBuild
#>

param(
    [switch]$SkipBuild,
    [string]$JavaMaxHeap = "16g"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$dataDir = Join-Path $scriptDir 'data'

if (-not (Test-Path $dataDir)) {
    Write-Error "Data folder not found: $dataDir"
    exit 1
}

if (-not $SkipBuild) {
    Write-Host "Building GraphHopper image from GitHub (this may take a long time)..."
    docker build -t graphhopper/graphhopper:local https://github.com/graphhopper/graphhopper.git
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}

$pbfs = Get-ChildItem -Path $dataDir -Filter "*.osm.pbf" | Sort-Object Name
if ($pbfs.Count -eq 0) {
    Write-Error "No .osm.pbf files found in $dataDir"
    exit 1
}

foreach ($pbf in $pbfs) {
    Write-Host "Importing $($pbf.Name) with Java heap -Xmx$JavaMaxHeap ..."
    $argsArray = @(
        "-Xmx$JavaMaxHeap",
        "-jar",
        "/graphhopper/graphhopper-web.jar",
        "import",
        "/data/$($pbf.Name)"
    )
    docker run --rm -v "${dataDir}:/data" --entrypoint java graphhopper/graphhopper:local $argsArray
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Import failed for $($pbf.Name) with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}

# Start web server using the first PBF
$firstPbf = $pbfs[0].Name
Write-Host "Starting GraphHopper web server with $firstPbf ..."
Write-Host "Starting GraphHopper web server with Java heap -Xmx$JavaMaxHeap ..."
    $serverArgs = @(
        "-Xmx$JavaMaxHeap",
        "-jar",
        "/graphhopper/graphhopper-web.jar",
        "server",
        "/graphhopper/config-example.yml"
    )
    $containerId = docker run -d -v "${dataDir}:/data" -p 8989:8989 --entrypoint java graphhopper/graphhopper:local $serverArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start web server (exit code $LASTEXITCODE)"
    exit $LASTEXITCODE
}

Write-Host "GraphHopper web server started. Container ID: $containerId"
Write-Host "Test endpoint: http://localhost:8989/route?point=-23.5505,-46.6333&point=-34.6037,-58.3816&profile=truck&points_encoded=false"
