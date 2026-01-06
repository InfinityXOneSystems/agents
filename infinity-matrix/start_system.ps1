#!/usr/bin/env powershell
<#
    Infinity-Matrix System Launcher
    Starts both frontend and orchestration backend with Hostinger dashboard
#>

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  INFINITY-MATRIX SYSTEM LAUNCHER" -ForegroundColor Cyan
Write-Host "  Frontend + Orchestration Backend" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$infinityPath = "C:\AI\infinity-matrix"
Set-Location $infinityPath

# Check prerequisites
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Yellow

$npmCheck = npm --version 2>$null
if (-not $npmCheck) {
    Write-Host "❌ npm not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

$pythonCheck = C:/AI/infinity-matrix/.venv/Scripts/python.exe --version 2>$null
if (-not $pythonCheck) {
    Write-Host "❌ Python not found in virtual environment. Please ensure the virtual environment is set up." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm: $npmCheck" -ForegroundColor Green
Write-Host "✅ Python: $pythonCheck" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps --silent

# Build orchestration
Write-Host ""
Write-Host "[3/4] Building orchestration server..." -ForegroundColor Yellow
npm run build:orchestration

# Start servers
Write-Host ""
Write-Host "[4/4] Starting system servers..." -ForegroundColor Yellow
Write-Host ""

# Start backend in background
Write-Host "🚀 Starting Orchestration Server (TypeScript)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList {
    Set-Location "C:\AI\infinity-matrix"
    npm run start:orchestration
} -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend in background
Write-Host "🚀 Starting Frontend Server (React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList {
    Set-Location "C:\AI\infinity-matrix\frontend_stack\frontend"
    npm install --silent
    npm run dev
} -WindowStyle Normal

Start-Sleep -Seconds 3

# Display dashboard
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ SYSTEM RUNNING" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend Dashboard:" -ForegroundColor Cyan
Write-Host "     http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "  📡 Orchestration API:" -ForegroundColor Cyan
Write-Host "     http://localhost:3001" -ForegroundColor Blue
Write-Host ""
Write-Host "  🏨 Hostinger Dashboard:" -ForegroundColor Cyan
Write-Host "     http://localhost:3000/hostinger" -ForegroundColor Blue
Write-Host ""
Write-Host "  📊 API Health:" -ForegroundColor Cyan
Write-Host "     http://localhost:3001/health" -ForegroundColor Blue
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep running
[Console]::ReadLine() | Out-Null
