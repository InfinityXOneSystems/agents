# Infinity Matrix - Autonomous Dashboard Launcher
# This script automatically starts the backend and opens the dashboard

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🌌 INFINITY MATRIX - AUTONOMOUS LAUNCH              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend\admin-server"
$dashboardPath = Join-Path $PSScriptRoot "dashboard\index.html"

Write-Host "📍 Backend Path: $backendPath" -ForegroundColor Yellow
Write-Host "📍 Dashboard Path: $dashboardPath`n" -ForegroundColor Yellow

# Check if backend directory exists
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Check if dashboard exists
if (-not (Test-Path $dashboardPath)) {
    Write-Host "❌ Dashboard file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking if server is already running..." -ForegroundColor Cyan
$existingProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*4000*" -or $_.CommandLine -like "*index.js*"
}

if ($existingProcess) {
    Write-Host "✅ Server already running (PID: $($existingProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting Infinity Matrix backend server..." -ForegroundColor Green
    
    # Start the backend server in a new window
    $serverJob = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$backendPath'; Write-Host '🌌 INFINITY MATRIX BACKEND SERVER' -ForegroundColor Cyan; Write-Host 'Port: 4000' -ForegroundColor Green; Write-Host ''; node index.js"
    ) -PassThru
    
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Verify server is running
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 5
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
        Write-Host "   Status: $($health.status)" -ForegroundColor White
        Write-Host "   Uptime: $($health.uptime)s" -ForegroundColor White
    } catch {
        Write-Host "⚠️  Server may still be starting... Opening dashboard anyway" -ForegroundColor Yellow
    }
}

Write-Host "`n🌐 Opening Infinity Matrix Dashboard..." -ForegroundColor Green
Start-Sleep -Seconds 1

# Open dashboard in default browser
Start-Process $dashboardPath

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✨ DASHBOARD LAUNCHED SUCCESSFULLY             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Dashboard URL: file:///$($dashboardPath -replace '\\', '/')" -ForegroundColor Cyan
Write-Host "🔗 Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📝 Health Check: http://localhost:4000/health" -ForegroundColor Cyan
Write-Host "🧠 Intelligence: http://localhost:4000/intelligence" -ForegroundColor Cyan

Write-Host "`n💡 Dashboard Features:" -ForegroundColor Yellow
Write-Host "   • Real-time system monitoring" -ForegroundColor White
Write-Host "   • Auto-refresh every 5 seconds" -ForegroundColor White
Write-Host "   • Live endpoint status" -ForegroundColor White
Write-Host "   • Performance metrics" -ForegroundColor White
Write-Host "   • Taxonomy visualization" -ForegroundColor White

Write-Host "`n⚡ Quick Commands:" -ForegroundColor Yellow
Write-Host "   • Restart server: cd backend\admin-server; node index.js" -ForegroundColor White
Write-Host "   • Test endpoints: .\test-full-system.ps1" -ForegroundColor White
Write-Host "   • View logs: Check server window" -ForegroundColor White

Write-Host "`n✅ System is now fully operational!" -ForegroundColor Green
Write-Host "Press any key to exit launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
