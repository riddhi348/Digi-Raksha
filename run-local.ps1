$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root ".venv\Scripts\python.exe"

function Test-PortAvailable {
    param([int]$Port)

    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Path $python)) {
    Write-Host "Virtual environment Python not found at $python" -ForegroundColor Red
    Write-Host "Create the venv and install dependencies first:" -ForegroundColor Yellow
    Write-Host "  py -m venv .venv"
    Write-Host "  .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
    exit 1
}

Set-Location $root

$port = $null
foreach ($candidate in 8000..8010) {
    if (Test-PortAvailable -Port $candidate) {
        $port = $candidate
        break
    }
}

if (-not $port) {
    Write-Host "No free port found in the range 8000-8010." -ForegroundColor Red
    exit 1
}

$env:DIGIRAKSHA_HOST = "127.0.0.1"
$env:DIGIRAKSHA_PORT = "$port"

Write-Host "Starting Digi-Raksha on http://127.0.0.1:$port" -ForegroundColor Green
Write-Host "Keep this window open while using the app." -ForegroundColor Yellow

& $python "backend.py"
