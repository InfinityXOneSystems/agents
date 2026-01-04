# 🚀 INFINITY MATRIX - OPERATIONAL RUNBOOK
## Get Everything Running & Talking in 5 Minutes

**Last Updated:** January 4, 2026  
**System Version:** 4.2  
**Status:** ✅ READY FOR LAUNCH

---

## ⚡ QUICK START - 3 COMMANDS TO FULL OPERATION

```powershell
# 1. Start Backend API (Port 4000)
cd C:\AI\infinity-matrix\backend\admin-server
node index.js

# 2. Open Admin Dashboard (in new terminal)
cd C:\AI\infinity-matrix\frontend\admin
start chrome http://localhost:4000/admin

# 3. Test Everything (in new terminal)
cd C:\AI\infinity-matrix\backend\admin-server
node test-manus-scraper.js
```

**That's it!** Your system is running.

---

## 🔑 CREDENTIALS - ALL IN ONE PLACE

### ✅ Already Configured (Working)

```bash
# Hostinger API
✓ HOSTINGER_API_KEY=[CONFIGURED]

# Groq (Mixtral, Llama3)
✓ GROQ_API_KEY=[CONFIGURED]

# Anthropic (Claude)
✓ ANTHROPIC_API_KEY=[CONFIGURED]

# Google AI (Gemini)
✓ GOOGLE_AI_API_KEY=[CONFIGURED]

# Vertex AI (GCP)
✓ GCP_PROJECT_ID=796668262728
✓ GCP_LOCATION=us-east1
```

### 📍 Credential Locations

**Primary:** `C:\AI\infinity-matrix\backend\admin-server\.env`  
**Backup:** `C:\AI\credentials\`  
**Vault:** `C:\AI\credential-manager\store\`

All systems check these locations automatically.

---

## 🎯 START SEQUENCE - STEP BY STEP

### Step 1: Start Backend (30 seconds)

```powershell
cd C:\AI\infinity-matrix\backend\admin-server
node index.js
```

**You'll see:**
```
🚀 Infinity X One Systems Admin API
✓ Port: 4000
✓ CORS: Enabled
✓ Routes: 12 modules loaded
✓ Intelligence: /intelligence (PRIMARY)
✓ Manus: /api/manus (NEW)
Server running at http://localhost:4000
```

### Step 2: Verify Health (10 seconds)

Open browser: **http://localhost:4000/health**

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-04T...",
  "uptime": 5.234,
  "version": "1.0.0"
}
```

### Step 3: Test Intelligence System (20 seconds)

```powershell
# Test primary intelligence endpoint
Invoke-RestMethod -Uri "http://localhost:4000/intelligence/status"
```

**Expected:**
```json
{
  "status": "operational",
  "taxonomy": "active",
  "layers": 7,
  "version": "4.2"
}
```

### Step 4: Test Manus Scraper (30 seconds)

```powershell
cd C:\AI\infinity-matrix\backend\admin-server
node test-manus-scraper.js
```

**You'll see:**
```
================================================================================
MANUS SYSTEM SCRAPER TEST
================================================================================

Step 1: Initializing Manus System Scraper...
✓ Scraper initialized

Step 2: Loading credentials from vault...
✓ API Key loaded: xxxxxxxxxxxxxxxxxxxx...

Step 3: Testing Manus API authentication...
✓ Successfully authenticated with Manus API

Step 4: Scraping complete Manus system...
  - Agents
  - Workflows
  - Templates
  - Conversations
  - Models
  - System Config

Step 5: Scrape Results
--------------------------------------------------------------------------------
Summary:
  Total Items Scraped: 78
  Agents: 15
  Workflows: 12
  Templates: 18
  ...
```

---

## 🔗 SYSTEM COMMUNICATION MAP

```
┌─────────────────────────────────────────────────────────────────┐
│                     INFINITY MATRIX v4.2                         │
│                  All Systems Connected ✓                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Admin Dashboard│  http://localhost:4000/admin
│  (Frontend)     │  http://infinityxai.com/admin
└────────┬────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  Backend API (Node.js/Express)             │
│  Port: 4000                                │
│  ✓ /health                                 │
│  ✓ /intelligence (PRIMARY)                 │
│  ✓ /api/auth                               │
│  ✓ /api/agents                             │
│  ✓ /api/chat                               │
│  ✓ /api/manus (NEW)                        │
│  ✓ /api/vision-cortex                      │
│  ✓ /api/scraper                            │
│  ✓ /api/gcp                                │
│  ✓ /api/workspace                          │
└─────────┬──────────────────────────────────┘
          │
          ├─────────────┬──────────────┬──────────────┐
          ↓             ↓              ↓              ↓
   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐
   │ Infinity │  │  Vision   │  │ Quantum  │  │  Manus    │
   │ Taxonomy │  │  Cortex   │  │ X Builder│  │  Scraper  │
   │  (7 Layers)│  │ (Intelligence)│  │(Automation)│  │(Integration)│
   └──────────┘  └───────────┘  └──────────┘  └───────────┘
          │             │              │              │
          └─────────────┴──────────────┴──────────────┘
                              ↓
                    ┌──────────────────┐
                    │   LLM Providers  │
                    │  ✓ Groq          │
                    │  ✓ Claude        │
                    │  ✓ Gemini        │
                    │  ✓ Vertex AI     │
                    └──────────────────┘
```

---

## 🧪 TEST ALL ENDPOINTS - VERIFICATION SUITE

### Test Script (Copy & Paste)

```powershell
# Save this as: test-full-system.ps1
$base = "http://localhost:4000"

Write-Host "`n🧪 TESTING INFINITY MATRIX - ALL ENDPOINTS`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/health" | ConvertTo-Json

# 2. Intelligence System
Write-Host "`n2. Intelligence System..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/intelligence/status" | ConvertTo-Json

# 3. Taxonomy
Write-Host "`n3. Infinity Taxonomy..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/intelligence/taxonomy" | ConvertTo-Json -Depth 2

# 4. Manus Status
Write-Host "`n4. Manus System Status..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/api/manus/status" -Headers @{Authorization="Bearer your-token"} | ConvertTo-Json

# 5. Vision Cortex
Write-Host "`n5. Vision Cortex Health..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/api/vision-cortex/health" | ConvertTo-Json

# 6. GCP Integration
Write-Host "`n6. GCP Integration..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/api/gcp/status" | ConvertTo-Json

Write-Host "`n✅ ALL TESTS COMPLETE`n" -ForegroundColor Green
```

**Run it:**
```powershell
cd C:\AI\infinity-matrix
.\test-full-system.ps1
```

---

## 🔧 TROUBLESHOOTING - COMMON ISSUES

### Issue 1: Port 4000 Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Fix:**
```powershell
# Find and kill process on port 4000
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

# Restart server
node index.js
```

### Issue 2: "Cannot find module" Errors

**Symptom:**
```
Error: Cannot find module 'express'
```

**Fix:**
```powershell
cd C:\AI\infinity-matrix\backend\admin-server
npm install
node index.js
```

### Issue 3: Authentication Errors

**Symptom:**
```
401 Unauthorized
```

**Fix:**
```powershell
# Get JWT token first
$auth = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body '{"email":"admin@infinityxai.com","password":"admin"}' -ContentType "application/json"

# Use token
$token = $auth.token
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:4000/api/manus/status" -Headers $headers
```

### Issue 4: Manus API Not Responding

**Symptom:**
```
⚠ Using demo mode (authentication skipped)
```

**Fix:**
Create Manus credentials file:
```powershell
# Create credentials directory
New-Item -ItemType Directory -Force -Path "C:\AI\credentials"

# Save Manus credentials
@"
{
  "apiKey": "your-manus-api-key",
  "email": "your-email@example.com"
}
"@ | Out-File -FilePath "C:\AI\credentials\manus-credentials.json" -Encoding UTF8
```

### Issue 5: CORS Errors in Browser

**Symptom:**
```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000' has been blocked by CORS
```

**Fix:** Already configured! CORS is enabled for all origins in development mode.

---

## 📊 MONITORING - LIVE SYSTEM STATUS

### Dashboard URLs

**Admin Dashboard:** http://localhost:4000/admin  
**Health Dashboard:** http://infinityxai.com/admin/health-dashboard.html  
**Cortex Dashboard:** Open VS Code → Infinity Cortex Panel (auto-opens)

### PowerShell Status Check

```powershell
# Quick status check
function Get-InfinityStatus {
    $base = "http://localhost:4000"
    
    Write-Host "`n📊 INFINITY MATRIX STATUS`n" -ForegroundColor Cyan
    
    try {
        $health = Invoke-RestMethod -Uri "$base/health" -TimeoutSec 5
        Write-Host "✅ Backend API: ONLINE" -ForegroundColor Green
        Write-Host "   Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Gray
        
        $intel = Invoke-RestMethod -Uri "$base/intelligence/status" -TimeoutSec 5
        Write-Host "✅ Intelligence: $($intel.status.ToUpper())" -ForegroundColor Green
        Write-Host "   Taxonomy: $($intel.taxonomy) ($($intel.layers) layers)" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Backend API: OFFLINE" -ForegroundColor Red
        Write-Host "   Run: cd C:\AI\infinity-matrix\backend\admin-server; node index.js" -ForegroundColor Yellow
    }
}

# Run it
Get-InfinityStatus
```

---

## 🚀 DEPLOYMENT TO HOSTINGER

### Step 1: Sync Frontend

```powershell
cd C:\AI\infinity-matrix
npm run build

# Upload to Hostinger
node scripts/sync-hostinger.js push
```

### Step 2: Deploy Backend API

**Option A: PM2 (Recommended)**
```bash
ssh infinityxai@infinityxai.com

# Install backend
cd ~/infinity-matrix-api
git pull
npm install

# Start with PM2
pm2 start index.js --name "infinity-api"
pm2 save
pm2 startup
```

**Option B: Node Background**
```bash
ssh infinityxai@infinityxai.com
cd ~/infinity-matrix-api
nohup node index.js > api.log 2>&1 &
```

### Step 3: Verify Live

```powershell
# Test live deployment
Invoke-RestMethod -Uri "https://infinityxai.com/api/health"
Invoke-RestMethod -Uri "https://infinityxai.com/intelligence/status"
```

---

## 📝 DAILY OPERATIONS CHECKLIST

### Morning Startup (2 minutes)

```bash
☐ Start backend: cd backend/admin-server && node index.js
☐ Check health: http://localhost:4000/health
☐ Open dashboard: http://localhost:4000/admin
☐ Verify intelligence: http://localhost:4000/intelligence/status
```

### During Development

```bash
☐ Monitor logs: tail -f backend/admin-server/logs/app.log
☐ Test changes: node test-comprehensive.js
☐ Check Manus sync: node test-manus-scraper.js
```

### End of Day

```bash
☐ Deploy changes: node scripts/sync-hostinger.js push
☐ Backup database: npm run backup
☐ Check live site: https://infinityxai.com/admin
```

---

## 🎯 KEY API ENDPOINTS REFERENCE

### Core System

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/health` | GET | System health check | None |
| `/intelligence` | GET | Primary intelligence hub | None |
| `/intelligence/status` | GET | Intelligence system status | None |
| `/intelligence/taxonomy` | GET | Full taxonomy structure | None |
| `/intelligence/taxonomy/:layer` | GET | Specific layer details | None |

### Manus Integration

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/manus/scrape` | POST | Scrape Manus system | Required |
| `/api/manus/status` | GET | Last scrape status | Required |
| `/api/manus/data/:format` | GET | Get scraped data | Required |
| `/api/manus/compare` | POST | Compare with Infinity X | Required |
| `/api/manus/integrate` | POST | Integrate into systems | Required |
| `/api/manus/test` | GET | Test Manus connection | Required |

### Vision Cortex

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/vision-cortex/send` | POST | Send query to Vision Cortex | Required |
| `/api/vision-cortex/health` | GET | Check Vision Cortex status | None |
| `/api/vision-cortex/history` | GET | Query history | Required |

### Agent Management

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/agents` | GET | List all agents | Required |
| `/api/agents/:id` | GET | Get agent details | Required |
| `/api/agents` | POST | Create new agent | Required |
| `/api/agents/:id` | PUT | Update agent | Required |
| `/api/agents/:id` | DELETE | Delete agent | Required |

---

## 🔐 AUTHENTICATION FLOW

### Get JWT Token

```powershell
$body = @{
    email = "admin@infinityxai.com"
    password = "admin"
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $body -ContentType "application/json"

$token = $auth.token
```

### Use Token for All Requests

```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:4000/api/manus/scrape" -Method POST -Headers $headers
```

---

## 🎓 TRAINING - NEW TEAM MEMBERS

### Day 1: Setup (1 hour)
1. Clone repository
2. Install dependencies: `npm install`
3. Configure .env file
4. Start backend: `node index.js`
5. Test health endpoint

### Day 2: Core Systems (2 hours)
1. Explore Intelligence endpoints
2. Test Taxonomy system
3. Review Manus scraper
4. Test Vision Cortex integration

### Day 3: Development (2 hours)
1. Create test agent
2. Send chat message
3. Run comprehensive tests
4. Deploy to staging

---

## 📞 SUPPORT CONTACTS

**System Owner:** Infinity X One Systems  
**Email:** support@infinityxai.com  
**Dashboard:** https://infinityxai.com/admin  
**Documentation:** This runbook + code comments

---

## ✅ SYSTEM STATUS CHECKLIST

Before reporting issues, verify:

```
☐ Backend running on port 4000
☐ .env file exists with all keys
☐ Node.js v20+ installed
☐ npm dependencies installed
☐ Firewall allows port 4000
☐ Internet connectivity for API calls
☐ Credentials in correct locations
☐ No port conflicts
```

---

## 🚨 EMERGENCY PROCEDURES

### Complete System Restart

```powershell
# Kill all processes
Get-Process node | Stop-Process -Force

# Clear cache
rm -r node_modules
npm install

# Restart
cd C:\AI\infinity-matrix\backend\admin-server
node index.js
```

### Reset Database

```powershell
# Backup first
cp data/infinity.db data/infinity.db.backup

# Reset
rm data/infinity.db
node scripts/init-db.js
```

### Rebuild Everything

```powershell
cd C:\AI\infinity-matrix
git pull
cd backend/admin-server
npm install
cd ../../frontend
npm install
npm run build
cd ../backend/admin-server
node index.js
```

---

## 🎉 SUCCESS INDICATORS

Your system is fully operational when:

✅ Backend responds at http://localhost:4000/health  
✅ Intelligence shows "operational" status  
✅ Manus scraper completes without errors  
✅ Vision Cortex returns intelligent responses  
✅ All 7 taxonomy layers accessible  
✅ Admin dashboard loads and functions  
✅ Live site accessible at infinityxai.com  

---

**You're all set! Your Infinity Matrix is ready to operate at full capacity.**

**Next:** Run the Manus scraper to begin competitive intelligence gathering!

```powershell
cd C:\AI\infinity-matrix\backend\admin-server
node test-manus-scraper.js
```
