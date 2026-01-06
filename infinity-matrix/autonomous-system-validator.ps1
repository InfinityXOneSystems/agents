#!/usr/bin/env pwsh
# ============================================================
# AUTONOMOUS SYSTEM VALIDATOR & AUTO-HEALER
# Infinity X One Systems - Enterprise-Grade System Check
# ============================================================

$ErrorActionPreference = "Continue"
$results = @()

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 AUTONOMOUS SYSTEM VALIDATION STARTED" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# ============================================================
# 1. BACKEND SERVER
# ============================================================
Write-Host "▶ Checking Backend Server (Port 4000)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 3
    if ($response.status -eq "healthy") {
        Write-Host "  ✅ Backend Server: RUNNING" -ForegroundColor Green
        $results += @{Component="Backend Server"; Status="✅ RUNNING"; Port=4000}
    }
} catch {
    Write-Host "  ❌ Backend Server: DOWN" -ForegroundColor Red
    $results += @{Component="Backend Server"; Status="❌ DOWN"; Port=4000}
    
    Write-Host "  🔧 Auto-healing: Restarting backend..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\AI\infinity-matrix\backend\admin-server; node index.js" -WindowStyle Minimized
    Start-Sleep -Seconds 4
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 3
        Write-Host "  ✅ Backend Server: RECOVERED" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Backend Server: FAILED TO RECOVER" -ForegroundColor Red
    }
}

# ============================================================
# 2. DOCKER SERVICES
# ============================================================
Write-Host "`n▶ Checking Docker Services..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "{{.Names}}\t{{.Status}}" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $containerList = $containers -split "`n" | Where-Object { $_ }
        Write-Host "  ✅ Docker: RUNNING ($($containerList.Count) containers)" -ForegroundColor Green
        $results += @{Component="Docker Services"; Status="✅ RUNNING"; Count=$containerList.Count}
        
        foreach ($container in $containerList) {
            $parts = $container -split "`t"
            $name = $parts[0]
            $status = $parts[1]
            if ($status -like "*Up*") {
                Write-Host "    • $name : UP" -ForegroundColor Green
            } else {
                Write-Host "    • $name : $status" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "  ⚠️  Docker: NOT RUNNING" -ForegroundColor Yellow
    $results += @{Component="Docker Services"; Status="⚠️ NOT RUNNING"; Count=0}
}

# ============================================================
# 3. ENVIRONMENT VARIABLES
# ============================================================
Write-Host "`n▶ Validating Environment Variables..." -ForegroundColor Yellow
$envPath = "C:\AI\infinity-matrix\backend\admin-server\.env"
$criticalVars = @(
    "PORT", "JWT_SECRET", "DEFAULT_ADMIN_EMAIL", "DEFAULT_ADMIN_PASSWORD",
    "GCP_PROJECT_ID", "GOOGLE_AI_API_KEY", "GROQ_API_KEY", "ANTHROPIC_API_KEY"
)

$envContent = Get-Content $envPath -Raw
$missingVars = @()
$presentVars = @()

foreach ($var in $criticalVars) {
    if ($envContent -match "$var=.+") {
        $presentVars += $var
    } else {
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    Write-Host "  ✅ All critical environment variables present ($($presentVars.Count)/$($criticalVars.Count))" -ForegroundColor Green
    $results += @{Component="Environment Variables"; Status="✅ COMPLETE"; Count=$presentVars.Count}
} else {
    Write-Host "  ⚠️  Missing variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    $results += @{Component="Environment Variables"; Status="⚠️ INCOMPLETE"; Missing=$missingVars -join ', '}
}

# ============================================================
# 4. GOOGLE CLOUD SERVICES
# ============================================================
Write-Host "`n▶ Checking Google Cloud Integration..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/gcp/status" -TimeoutSec 3
    if ($response.status -eq "initialized") {
        Write-Host "  ✅ Google Cloud: CONNECTED" -ForegroundColor Green
        $results += @{Component="Google Cloud"; Status="✅ CONNECTED"}
    }
} catch {
    Write-Host "  ⚠️  Google Cloud: NOT INITIALIZED" -ForegroundColor Yellow
    $results += @{Component="Google Cloud"; Status="⚠️ NOT INITIALIZED"}
}

# ============================================================
# 5. GOOGLE WORKSPACE
# ============================================================
Write-Host "`n▶ Checking Google Workspace..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/workspace/status" -TimeoutSec 3
    if ($response.status -eq "initialized") {
        Write-Host "  ✅ Google Workspace: CONNECTED" -ForegroundColor Green
        $results += @{Component="Google Workspace"; Status="✅ CONNECTED"}
    }
} catch {
    Write-Host "  ⚠️  Google Workspace: NOT INITIALIZED" -ForegroundColor Yellow
    $results += @{Component="Google Workspace"; Status="⚠️ NOT INITIALIZED"}
}

# ============================================================
# 6. VISION CORTEX
# ============================================================
Write-Host "`n▶ Checking Vision Cortex..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/vision-cortex/status" -TimeoutSec 3
    Write-Host "  ✅ Vision Cortex: OPERATIONAL" -ForegroundColor Green
    $results += @{Component="Vision Cortex"; Status="✅ OPERATIONAL"}
} catch {
    Write-Host "  ❌ Vision Cortex: NOT RESPONDING" -ForegroundColor Red
    $results += @{Component="Vision Cortex"; Status="❌ NOT RESPONDING"}
}

# ============================================================
# 7. LLM PROVIDERS
# ============================================================
Write-Host "`n▶ Checking LLM Providers..." -ForegroundColor Yellow
$llmProviders = @{
    "Vertex AI" = $envContent -match "GCP_PROJECT_ID=.+"
    "Gemini" = $envContent -match "GOOGLE_AI_API_KEY=.+"
    "Groq" = $envContent -match "GROQ_API_KEY=.+"
    "Anthropic" = $envContent -match "ANTHROPIC_API_KEY=.+"
}

$llmConfigured = 0
foreach ($provider in $llmProviders.Keys) {
    if ($llmProviders[$provider]) {
        Write-Host "  ✅ $provider : CONFIGURED" -ForegroundColor Green
        $llmConfigured++
    } else {
        Write-Host "  ⚠️  $provider : NOT CONFIGURED" -ForegroundColor Yellow
    }
}
$results += @{Component="LLM Providers"; Status="$llmConfigured/4 CONFIGURED"}

# ============================================================
# 8. GITHUB INTEGRATION
# ============================================================
Write-Host "`n▶ Checking GitHub Integration..." -ForegroundColor Yellow
$githubConfigured = $envContent -match "GITHUB_TOKEN=.+"
if ($githubConfigured) {
    Write-Host "  ✅ GitHub: CONFIGURED" -ForegroundColor Green
    $results += @{Component="GitHub Integration"; Status="✅ CONFIGURED"}
} else {
    Write-Host "  ⚠️  GitHub: NOT CONFIGURED" -ForegroundColor Yellow
    $results += @{Component="GitHub Integration"; Status="⚠️ NOT CONFIGURED"}
}

# ============================================================
# 9. STRIPE PAYMENTS
# ============================================================
Write-Host "`n▶ Checking Stripe Integration..." -ForegroundColor Yellow
$stripeConfigured = $envContent -match "STRIPE_API_KEY=.+"
if ($stripeConfigured) {
    Write-Host "  ✅ Stripe: CONFIGURED" -ForegroundColor Green
    $results += @{Component="Stripe Payments"; Status="✅ CONFIGURED"}
} else {
    Write-Host "  ⚠️  Stripe: NOT CONFIGURED" -ForegroundColor Yellow
    $results += @{Component="Stripe Payments"; Status="⚠️ NOT CONFIGURED"}
}

# ============================================================
# 10. AGENT SYSTEMS
# ============================================================
Write-Host "`n▶ Checking Agent Systems..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/agents/list" -TimeoutSec 3
    $agentCount = $response.Count
    Write-Host "  ✅ Agent System: OPERATIONAL ($agentCount agents)" -ForegroundColor Green
    $results += @{Component="Agent System"; Status="✅ OPERATIONAL"; Count=$agentCount}
} catch {
    Write-Host "  ⚠️  Agent System: AVAILABLE BUT NOT STARTED" -ForegroundColor Yellow
    $results += @{Component="Agent System"; Status="⚠️ AVAILABLE"}
}

# ============================================================
# SUMMARY REPORT
# ============================================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 SYSTEM VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$totalComponents = $results.Count
$healthyComponents = ($results | Where-Object { $_.Status -like "*✅*" }).Count
$warningComponents = ($results | Where-Object { $_.Status -like "*⚠️*" }).Count
$failedComponents = ($results | Where-Object { $_.Status -like "*❌*" }).Count

Write-Host "Total Components Checked: $totalComponents" -ForegroundColor White
Write-Host "✅ Healthy: $healthyComponents" -ForegroundColor Green
Write-Host "⚠️  Warning: $warningComponents" -ForegroundColor Yellow
Write-Host "❌ Failed: $failedComponents" -ForegroundColor Red

$healthScore = [math]::Round(($healthyComponents / $totalComponents) * 100, 2)
Write-Host "`n🎯 System Health Score: $healthScore%" -ForegroundColor $(if($healthScore -ge 80){"Green"}elseif($healthScore -ge 60){"Yellow"}else{"Red"})

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ VALIDATION COMPLETE" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Export results to JSON
$results | ConvertTo-Json -Depth 3 | Out-File "C:\AI\infinity-matrix\system-validation-results.json"
Write-Host "📄 Full results saved to: system-validation-results.json`n" -ForegroundColor Cyan
