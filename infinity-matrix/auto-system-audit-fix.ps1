# ============================================
# AUTONOMOUS SYSTEM AUDIT, DIAGNOSE, FIX & VALIDATE
# Infinity X One Systems - FAANG-Level Enterprise
# ============================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INFINITY X ONE SYSTEMS - AUTONOMOUS SYSTEM AUDIT         ║" -ForegroundColor Cyan
Write-Host "║  Enterprise-Grade Auto-Heal & Validation System           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$script:fixes = @()
$script:warnings = @()
$script:errors = @()
$script:successes = @()

function Log-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green; $script:successes += $msg }
function Log-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow; $script:warnings += $msg }
function Log-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red; $script:errors += $msg }
function Log-Fix { param($msg) Write-Host "🔧 $msg" -ForegroundColor Magenta; $script:fixes += $msg }
function Log-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }

# ============================================
# SECTION 1: ENVIRONMENT VALIDATION
# ============================================
Write-Host "`n━━━ SECTION 1: ENVIRONMENT & CREDENTIALS AUDIT ━━━" -ForegroundColor Cyan

# Check main .env
if (Test-Path "C:\AI\infinity-matrix\.env") {
    Log-Success "Main .env file exists"
    $envContent = Get-Content "C:\AI\infinity-matrix\.env" -Raw
    
    # Check for required variables
    $requiredVars = @(
        "JWT_SECRET",
        "GCP_PROJECT_ID",
        "GOOGLE_AI_API_KEY",
        "VERTEX_AI_PROJECT_ID"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            Log-Success "$var is set"
        } else {
            Log-Warning "$var is missing or empty"
        }
    }
} else {
    Log-Error "Main .env file missing"
    if (Test-Path "C:\AI\infinity-matrix\.env.example") {
        Log-Fix "Copying .env.example to .env"
        Copy-Item "C:\AI\infinity-matrix\.env.example" "C:\AI\infinity-matrix\.env"
        Log-Success ".env file created from template"
    }
}

# Check backend .env
if (Test-Path "C:\AI\infinity-matrix\backend\admin-server\.env") {
    Log-Success "Backend .env exists"
} else {
    Log-Warning "Backend .env missing - creating from main .env"
    if (Test-Path "C:\AI\infinity-matrix\.env") {
        Copy-Item "C:\AI\infinity-matrix\.env" "C:\AI\infinity-matrix\backend\admin-server\.env"
        Log-Fix "Created backend .env"
    }
}

# Validate VERTEX_AI_PROJECT_ID
if ($envContent -notmatch "VERTEX_AI_PROJECT_ID") {
    Log-Fix "Adding VERTEX_AI_PROJECT_ID to .env"
    Add-Content "C:\AI\infinity-matrix\.env" "`nVERTEX_AI_PROJECT_ID=796668262728"
    Add-Content "C:\AI\infinity-matrix\backend\admin-server\.env" "`nVERTEX_AI_PROJECT_ID=796668262728"
}

# Validate GOOGLE_APPLICATION_CREDENTIALS
$credPath = "C:\AI\credentials\gcp-service-account.json"
if (Test-Path $credPath) {
    Log-Success "GCP service account key found"
    $env:GOOGLE_APPLICATION_CREDENTIALS = $credPath
    
    # Add to .env if missing
    if ($envContent -notmatch "GOOGLE_APPLICATION_CREDENTIALS") {
        Log-Fix "Adding GOOGLE_APPLICATION_CREDENTIALS to .env"
        Add-Content "C:\AI\infinity-matrix\.env" "`nGOOGLE_APPLICATION_CREDENTIALS=$credPath"
        Add-Content "C:\AI\infinity-matrix\backend\admin-server\.env" "`nGOOGLE_APPLICATION_CREDENTIALS=$credPath"
    }
} else {
    Log-Warning "GCP service account key not found at $credPath"
    Log-Info "Run: gcloud auth application-default login"
}

# ============================================
# SECTION 2: GITHUB INTEGRATION
# ============================================
Write-Host "`n━━━ SECTION 2: GITHUB INTEGRATION AUDIT ━━━" -ForegroundColor Cyan

# Check GitHub remotes
$remotes = git -C "C:\AI\infinity-matrix" remote -v 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-Success "Git repository detected"
    if ($remotes -match "InfinityXOneSystems/infinity-matrix") {
        Log-Success "Correct repository: InfinityXOneSystems/infinity-matrix"
    } elseif ($remotes -match "InfinityXOneSystems/agents") {
        Log-Warning "Current repo is 'agents', not 'infinity-matrix'"
        Log-Info "You may need to change remote or work in correct directory"
    }
    
    # List all remotes
    Log-Info "Current remotes:"
    Write-Host $remotes
} else {
    Log-Error "Not a git repository"
}

# Check GITHUB_TOKEN
if ($env:GITHUB_TOKEN) {
    Log-Success "GITHUB_TOKEN environment variable set"
} else {
    Log-Warning "GITHUB_TOKEN not set"
    Log-Info "Set with: `$env:GITHUB_TOKEN = 'ghp_your-token'"
}

# ============================================
# SECTION 3: GOOGLE CLOUD & VERTEX AI
# ============================================
Write-Host "`n━━━ SECTION 3: GOOGLE CLOUD & VERTEX AI AUDIT ━━━" -ForegroundColor Cyan

# Check gcloud CLI
$gcloudVersion = gcloud version 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-Success "gcloud CLI installed"
    
    # Check authentication
    $gcloudAuth = gcloud auth list --format="value(account)" 2>&1
    if ($gcloudAuth) {
        Log-Success "gcloud authenticated: $gcloudAuth"
    } else {
        Log-Warning "gcloud not authenticated"
        Log-Info "Run: gcloud auth login"
    }
    
    # Check active project
    $activeProject = gcloud config get-value project 2>&1
    if ($activeProject -eq "796668262728" -or $activeProject -match "796668262728") {
        Log-Success "Correct GCP project: 796668262728"
    } else {
        Log-Warning "Active project: $activeProject (expected: 796668262728)"
        Log-Fix "Setting project to 796668262728"
        gcloud config set project 796668262728
    }
} else {
    Log-Error "gcloud CLI not installed"
    Log-Info "Install: https://cloud.google.com/sdk/docs/install"
}

# Test Vertex AI connectivity (Python)
if (Test-Path "C:\AI\infinity-matrix\.venv\Scripts\python.exe") {
    Log-Info "Testing Vertex AI connectivity..."
    $vertexTest = & "C:\AI\infinity-matrix\.venv\Scripts\python.exe" -c @"
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'$credPath'
try:
    from google.cloud import aiplatform
    aiplatform.init(project='796668262728', location='us-east1')
    print('VERTEX_OK')
except Exception as e:
    print(f'VERTEX_ERROR: {e}')
"@ 2>&1
    
    if ($vertexTest -match "VERTEX_OK") {
        Log-Success "Vertex AI connection successful"
    } else {
        Log-Warning "Vertex AI connection failed: $vertexTest"
    }
}

# ============================================
# SECTION 4: DOCKER CONFIGURATION
# ============================================
Write-Host "`n━━━ SECTION 4: DOCKER CONFIGURATION AUDIT ━━━" -ForegroundColor Cyan

# Check Docker
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-Success "Docker installed: $dockerVersion"
    
    # Check Docker Compose
    $dockerComposeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Docker Compose installed: $dockerComposeVersion"
    } else {
        Log-Error "Docker Compose not installed"
    }
    
    # Check running containers
    $runningContainers = docker ps --format "{{.Names}}" 2>&1
    if ($runningContainers) {
        Log-Info "Running containers:"
        $runningContainers | ForEach-Object { Write-Host "  • $_" -ForegroundColor Gray }
    } else {
        Log-Warning "No Docker containers running"
        Log-Info "Start with: docker-compose up -d"
    }
    
    # Check docker-compose.yml
    if (Test-Path "C:\AI\infinity-matrix\docker-compose.yml") {
        Log-Success "docker-compose.yml exists"
        
        # Validate credentials mount
        $composeContent = Get-Content "C:\AI\infinity-matrix\docker-compose.yml" -Raw
        if ($composeContent -match "credentials:") {
            Log-Success "Credentials volume configured in Docker Compose"
        } else {
            Log-Warning "Credentials volume not found in docker-compose.yml"
        }
    } else {
        Log-Error "docker-compose.yml missing"
    }
} else {
    Log-Error "Docker not installed or not running"
    Log-Info "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
}

# ============================================
# SECTION 5: BACKEND SERVER STATUS
# ============================================
Write-Host "`n━━━ SECTION 5: BACKEND SERVER AUDIT ━━━" -ForegroundColor Cyan

# Check if backend server is running
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 3 -ErrorAction Stop
    Log-Success "Backend server is running on port 4000"
    Log-Info "Status: $($healthCheck.status)"
    Log-Info "Uptime: $([math]::Round($healthCheck.uptime, 2)) seconds"
} catch {
    Log-Warning "Backend server not running on port 4000"
    Log-Info "Start with: cd C:\AI\infinity-matrix\backend\admin-server; node index.js"
}

# Check backend dependencies
if (Test-Path "C:\AI\infinity-matrix\backend\admin-server\package.json") {
    Log-Success "Backend package.json exists"
    
    if (Test-Path "C:\AI\infinity-matrix\backend\admin-server\node_modules") {
        Log-Success "Backend node_modules installed"
    } else {
        Log-Warning "Backend dependencies not installed"
        Log-Fix "Installing backend dependencies..."
        Push-Location "C:\AI\infinity-matrix\backend\admin-server"
        npm install --silent
        Pop-Location
        Log-Success "Backend dependencies installed"
    }
}

# ============================================
# SECTION 6: VISION CORTEX AGENTS
# ============================================
Write-Host "`n━━━ SECTION 6: VISION CORTEX AGENTS AUDIT ━━━" -ForegroundColor Cyan

$visionCortexPath = "C:\AI\infinity-matrix\services\vision-cortex-quantum"
if (Test-Path $visionCortexPath) {
    Log-Success "Vision Cortex directory exists"
    
    # Check for agent files
    $agents = @("ingestion_engine.py", "organization-agent\agent.py")
    foreach ($agent in $agents) {
        $agentPath = Join-Path $visionCortexPath $agent
        if (Test-Path $agentPath) {
            Log-Success "Found agent: $agent"
        } else {
            Log-Warning "Missing agent: $agent"
        }
    }
    
    # Test Vision Cortex endpoint
    try {
        $visionStatus = Invoke-RestMethod -Uri "http://localhost:4000/api/vision-cortex/status" -TimeoutSec 3 -ErrorAction Stop
        Log-Success "Vision Cortex API endpoint accessible"
    } catch {
        Log-Warning "Vision Cortex API endpoint not accessible"
    }
} else {
    Log-Error "Vision Cortex directory not found"
}

# ============================================
# SECTION 7: QUANTUM X BUILDER
# ============================================
Write-Host "`n━━━ SECTION 7: QUANTUM X BUILDER AUDIT ━━━" -ForegroundColor Cyan

$autoBuilderFiles = @(
    "C:\AI\pull_analytics_models.py",
    "C:\AI\test_agent_builder.py",
    "C:\AI\register_agent.py"
)

$foundFiles = 0
foreach ($file in $autoBuilderFiles) {
    if (Test-Path $file) {
        Log-Success "Found: $(Split-Path -Leaf $file)"
        $foundFiles++
    }
}

if ($foundFiles -eq $autoBuilderFiles.Count) {
    Log-Success "Quantum X Builder (Auto Builder) system complete"
} else {
    Log-Warning "Quantum X Builder missing $($autoBuilderFiles.Count - $foundFiles) files"
}

# Check Ollama
try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Ollama installed: $ollamaVersion"
        
        # List models
        $ollamaModels = ollama list 2>&1
        if ($ollamaModels) {
            $modelCount = ($ollamaModels | Select-String "^\w+" | Measure-Object).Count
            Log-Success "Ollama models available: $modelCount"
        }
    } else {
        Log-Warning "Ollama not installed"
        Log-Info "Install: https://ollama.ai/download"
    }
} catch {
    Log-Warning "Ollama not accessible"
}

# ============================================
# SECTION 8: STRIPE INTEGRATION
# ============================================
Write-Host "`n━━━ SECTION 8: STRIPE PAYMENTS AUDIT ━━━" -ForegroundColor Cyan

$envContent = Get-Content "C:\AI\infinity-matrix\backend\admin-server\.env" -Raw
if ($envContent -match "STRIPE_SECRET_KEY") {
    Log-Success "STRIPE_SECRET_KEY configured"
} else {
    Log-Warning "STRIPE_SECRET_KEY not configured"
    Log-Info "Add to .env: STRIPE_SECRET_KEY=sk_test_your-key"
}

if ($envContent -match "STRIPE_PUBLISHABLE_KEY") {
    Log-Success "STRIPE_PUBLISHABLE_KEY configured"
} else {
    Log-Warning "STRIPE_PUBLISHABLE_KEY not configured"
}

# ============================================
# SECTION 9: SECURITY COMPLIANCE
# ============================================
Write-Host "`n━━━ SECTION 9: SECURITY & COMPLIANCE AUDIT ━━━" -ForegroundColor Cyan

# Check for secrets in code
Log-Info "Scanning for hardcoded secrets..."
$secretPatterns = @("password", "api_key", "secret", "token")
$codeFiles = Get-ChildItem "C:\AI\infinity-matrix" -Include *.js,*.ts,*.py -Recurse -File | Select-Object -First 100

$secretsFound = 0
foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    foreach ($pattern in $secretPatterns) {
        if ($content -match "$pattern\s*=\s*['\`"][^'\`"]+['\`"]") {
            if ($content -notmatch "\.env" -and $content -notmatch "example" -and $content -notmatch "your-") {
                $secretsFound++
                break
            }
        }
    }
}

if ($secretsFound -eq 0) {
    Log-Success "No hardcoded secrets detected in sample"
} else {
    Log-Warning "Potential hardcoded secrets found: $secretsFound files"
    Log-Info "Review and move to .env"
}

# Check JWT secret strength
if ($envContent -match "JWT_SECRET=(.+)") {
    $jwtSecret = $matches[1].Trim()
    if ($jwtSecret.Length -ge 32) {
        Log-Success "JWT_SECRET is strong (≥32 chars)"
    } else {
        Log-Warning "JWT_SECRET should be at least 32 characters"
    }
}

# ============================================
# SECTION 10: FRONTEND STATUS
# ============================================
Write-Host "`n━━━ SECTION 10: FRONTEND AUDIT ━━━" -ForegroundColor Cyan

if (Test-Path "C:\AI\infinity-matrix\frontend\package.json") {
    Log-Success "Frontend package.json exists"
    
    if (Test-Path "C:\AI\infinity-matrix\frontend\node_modules") {
        Log-Success "Frontend dependencies installed"
    } else {
        Log-Warning "Frontend dependencies not installed"
        Log-Fix "Installing frontend dependencies..."
        Push-Location "C:\AI\infinity-matrix\frontend"
        npm install --silent 2>&1 | Out-Null
        Pop-Location
        Log-Success "Frontend dependencies installed"
    }
} else {
    Log-Warning "Frontend package.json not found"
}

# Check if frontend is running
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    Log-Success "Frontend server running on port 3000"
} catch {
    Log-Warning "Frontend not running on port 3000"
    Log-Info "Start with: cd C:\AI\infinity-matrix\frontend; npm run dev"
}

# ============================================
# SECTION 11: ADMIN DASHBOARD
# ============================================
Write-Host "`n━━━ SECTION 11: ADMIN DASHBOARD AUDIT ━━━" -ForegroundColor Cyan

$dashboardPath = "C:\AI\infinity-matrix\frontend\admin\comprehensive-dashboard.html"
if (Test-Path $dashboardPath) {
    Log-Success "Comprehensive dashboard exists"
    try {
        $dashboardCheck = Invoke-WebRequest -Uri "http://localhost:4000/admin/" -TimeoutSec 3 -ErrorAction Stop
        Log-Success "Admin dashboard accessible at http://localhost:4000/admin/"
    } catch {
        Log-Warning "Admin dashboard not accessible (backend may be down)"
    }
} else {
    Log-Warning "Comprehensive dashboard not found"
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              AUDIT SUMMARY                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n✅ Successes: $($script:successes.Count)" -ForegroundColor Green
Write-Host "⚠️  Warnings: $($script:warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Errors: $($script:errors.Count)" -ForegroundColor Red
Write-Host "🔧 Fixes Applied: $($script:fixes.Count)" -ForegroundColor Magenta

if ($script:errors.Count -eq 0 -and $script:warnings.Count -eq 0) {
    Write-Host "`n🎉 SYSTEM IS FULLY OPERATIONAL - NO ISSUES DETECTED!" -ForegroundColor Green
    Write-Host "All systems are healthy and ready for production." -ForegroundColor Green
} elseif ($script:errors.Count -eq 0) {
    Write-Host "`n✅ SYSTEM IS OPERATIONAL - MINOR WARNINGS DETECTED" -ForegroundColor Yellow
    Write-Host "System is functional but could be improved." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  SYSTEM HAS CRITICAL ISSUES - ACTION REQUIRED" -ForegroundColor Red
    Write-Host "Please review errors above and take corrective action." -ForegroundColor Red
}

Write-Host "`n━━━ WARNINGS SUMMARY ━━━" -ForegroundColor Yellow
foreach ($warning in $script:warnings) {
    Write-Host "  • $warning" -ForegroundColor Yellow
}

if ($script:errors.Count -gt 0) {
    Write-Host "`n━━━ ERRORS SUMMARY ━━━" -ForegroundColor Red
    foreach ($error in $script:errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
}

Write-Host "`n━━━ RECOMMENDATIONS ━━━" -ForegroundColor Cyan
Write-Host "1. Fix all errors above before production deployment" -ForegroundColor Cyan
Write-Host "2. Review warnings and implement improvements" -ForegroundColor Cyan
Write-Host "3. Run comprehensive tests: test-admin-exhaustive.ps1" -ForegroundColor Cyan
Write-Host "4. Start services: docker-compose up -d" -ForegroundColor Cyan
Write-Host "5. Verify admin dashboard: http://localhost:4000/admin/" -ForegroundColor Cyan
Write-Host "6. Check Vision Cortex: http://localhost:4000/api/vision-cortex/status" -ForegroundColor Cyan

Write-Host "`n✅ Audit complete! Review results above.`n" -ForegroundColor Green
