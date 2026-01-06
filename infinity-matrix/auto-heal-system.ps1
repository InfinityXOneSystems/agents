# ============================================
# AUTO-HEAL & SELF-REPAIR SYSTEM
# Continuously monitors and fixes system issues
# ============================================
$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INFINITY X ONE - AUTO-HEAL & SELF-REPAIR SYSTEM          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

function Start-BackendServer {
    Write-Host "🔧 Starting backend server..." -ForegroundColor Magenta
    
    Write-Host "AUTO-HEAL SYSTEM EXECUTED SUCCESSFULLY" -ForegroundColor Green
    $processOnPort = netstat -ano | Select-String ":4000.*LISTENING"
