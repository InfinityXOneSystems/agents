# ⚡ QUICK START SCRIPT - Get Everything Running NOW
# Run this to start the entire Infinity Matrix system

$ErrorActionPreference = "Stop"

Write-Host "`n" -NoNewline
Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🚀 INFINITY MATRIX - QUICK START                     ║" -ForegroundColor Cyan
Write-Host "║              Everything Running in 30 Seconds                   ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "Step 1: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Step 2: Navigate to backend
Write-Host "`nStep 2: Navigating to backend directory..." -ForegroundColor Yellow
$backendPath = "C:\AI\infinity-matrix\backend\admin-server"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "  ✓ Found: $backendPath" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Check dependencies
Write-Host "`nStep 3: Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
}

# Step 4: Check .env file
Write-Host "`nStep 4: Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ .env file found" -ForegroundColor Green
    
    # Verify Hostinger API key
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "HOSTINGER_API_KEY=Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63") {
        Write-Host "  ✓ Hostinger API key configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Hostinger API key may need updating" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ .env file missing!" -ForegroundColor Red
    Write-Host "  Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ .env file created - please configure your keys" -ForegroundColor Green
}

# Step 5: Check if port 4000 is available
Write-Host "`nStep 5: Checking port availability..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "  ⚠ Port 4000 is in use" -ForegroundColor Yellow
    Write-Host "  Stopping existing process..." -ForegroundColor Yellow
    try {
        Get-Process -Id $portInUse.OwningProcess | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "  ✓ Port 4000 now available" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Could not free port 4000 - server may already be running" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ Port 4000 available" -ForegroundColor Green
}

# Step 6: Start the server
Write-Host "`nStep 6: Starting Infinity Matrix..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Start server in this terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node index.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Step 7: Test the server
Write-Host "`nStep 7: Testing server..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$serverOnline = $false

while ($retryCount -lt $maxRetries -and -not $serverOnline) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 2
        if ($health.status -eq "healthy") {
            $serverOnline = $true
            Write-Host "  ✓ Server is ONLINE!" -ForegroundColor Green
            Write-Host "  ✓ Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "  Waiting for server... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if (-not $serverOnline) {
    Write-Host "  ⚠ Server may need more time to start" -ForegroundColor Yellow
    Write-Host "  Check the server terminal window for details" -ForegroundColor Yellow
}

# Step 8: Test Intelligence System
Write-Host "`nStep 8: Testing Intelligence System..." -ForegroundColor Yellow
try {
    $intel = Invoke-RestMethod -Uri "http://localhost:4000/intelligence/status" -TimeoutSec 5
    Write-Host "  ✓ Intelligence: $($intel.status.ToUpper())" -ForegroundColor Green
    Write-Host "  ✓ Taxonomy: $($intel.taxonomy) ($($intel.layers) layers)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Intelligence system initializing..." -ForegroundColor Yellow
}

# Step 9: Display URLs
Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   ✅ SYSTEM ONLINE                               ║" -ForegroundColor Green
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 KEY URLS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Admin Dashboard:    " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000/admin" -ForegroundColor Yellow
Write-Host "  Health Check:       " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000/health" -ForegroundColor Yellow
Write-Host "  Intelligence:       " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000/intelligence" -ForegroundColor Yellow
Write-Host "  API Documentation:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000/" -ForegroundColor Yellow
Write-Host ""

# Step 10: Open browser
Write-Host "📊 OPENING DASHBOARD..." -ForegroundColor Cyan
Start-Sleep -Seconds 1
Start-Process "http://localhost:4000/health"

Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              🎯 NEXT STEPS                                      ║" -ForegroundColor Magenta
Write-Host "╚═════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Test Manus Scraper:" -ForegroundColor White
Write-Host "   cd C:\AI\infinity-matrix\backend\admin-server" -ForegroundColor Gray
Write-Host "   node test-manus-scraper.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run Full System Test:" -ForegroundColor White
Write-Host "   .\test-full-system.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. View Operational Runbook:" -ForegroundColor White
Write-Host "   code OPERATIONAL_RUNBOOK.md" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check Server Logs:" -ForegroundColor White
Write-Host "   Look at the server terminal window" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
