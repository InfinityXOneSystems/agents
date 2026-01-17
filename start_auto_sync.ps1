# Auto-Sync Service Launcher
# Automatically starts the auto-sync service and keeps it running

param(
    [switch]$Background,
    [switch]$Restart
)

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentsDir = Join-Path $ScriptDir "..\agents"

# Change to agents directory
Set-Location $AgentsDir

Write-Host "Starting Auto-Sync Service..." -ForegroundColor Green

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the service
if ($Background) {
    Write-Host "Starting in background mode..." -ForegroundColor Cyan
    $process = Start-Process -FilePath "node" -ArgumentList "src/services/auto-sync.ts" -NoNewWindow -PassThru

    if ($Restart) {
        Write-Host "Monitoring service for restarts..." -ForegroundColor Magenta
        while ($true) {
            Start-Sleep -Seconds 30
            if ($process.HasExited) {
                Write-Host "Service exited, restarting..." -ForegroundColor Red
                $process = Start-Process -FilePath "node" -ArgumentList "src/services/auto-sync.ts" -NoNewWindow -PassThru
            }
        }
    }
} else {
    Write-Host "Starting in foreground mode..." -ForegroundColor Cyan
    & node src/services/auto-sync.ts
}