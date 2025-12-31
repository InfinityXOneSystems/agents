# Quick Start Guide - Running Infinity-Matrix with Hostinger Dashboard

## What's Been Set Up

Your system now has a complete frontend-to-backend integration:

1. **Frontend Dashboard** (React + Vite)
   - Location: `c:\AI\infinity-matrix\frontend_stack\frontend\`
   - Running on: http://localhost:3000
   - Includes new Hostinger dashboard page

2. **Orchestration Backend** (TypeScript + Express)
   - Location: `c:\AI\infinity-matrix\orchestration\`
   - Running on: http://localhost:3001
   - API endpoints for agents and Hostinger integration

3. **Python AI Stack** (Ready to integrate)
   - Location: `c:\AI\infinity-matrix\ai_stack\`
   - Hostinger agent with real API credential support

## Quick Start

### Option 1: PowerShell Launcher (Recommended)
```powershell
cd C:\AI\infinity-matrix
.\start_system.ps1
```

This will:
- ✅ Check prerequisites (npm, python)
- ✅ Install all dependencies
- ✅ Build the TypeScript orchestration layer
- ✅ Start both frontend and backend servers
- ✅ Display access URLs

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd C:\AI\infinity-matrix
npm run start:orchestration
```

**Terminal 2 - Frontend:**
```bash
cd C:\AI\infinity-matrix\frontend_stack\frontend
npm install
npm run dev
```

## Access Your System

Once running, you can access:

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend Home | http://localhost:3000 | Main dashboard |
| Hostinger Dashboard | http://localhost:3000/hostinger | View your Hostinger hosting info & URL |
| API Health | http://localhost:3001/health | Check orchestration server status |
| Hostinger API | http://localhost:3001/hostinger/info | Raw API data |

## Hostinger Dashboard Features

The new Hostinger page shows:

✅ **Account Status** - Live connection to your Hostinger account
✅ **Primary URL** - Your hosting domain/URL displayed prominently  
✅ **Domains List** - All registered domains with status
✅ **Websites** - Hosted websites on your account
✅ **Live Updates** - Auto-refresh button for real-time data

## Setting Up Real Hostinger Credentials

To connect to your real Hostinger account:

1. Get your API key from Hostinger control panel
2. Create `c:\AI\infinity-matrix\credentials\hostinger_creds.json`:

```json
{
  "api_key": "your_hostinger_api_key_here"
}
```

Or set environment variable:
```powershell
$env:HOSTINGER_API_KEY = "your_api_key"
```

The Hostinger agent will automatically:
- ✅ Load credentials from file or environment
- ✅ Fetch real account data via API
- ✅ Display actual domains and websites
- ✅ Show live hosting URL

## Architecture

```
Frontend (React)
   ↓
Vite Dev Server (Port 3000)
   ↓
Hostinger Page Component
   ↓
Fetch from Orchestration API
   ↓
Express Server (Port 3001)
   ↓
/hostinger/info Endpoint
   ↓
Returns Account Data to Dashboard
```

## Testing the Connection

### Check Backend Health:
```powershell
curl http://localhost:3001/health
```

### Get Hostinger Info:
```powershell
curl http://localhost:3001/hostinger/info
```

### View Frontend:
Open browser to http://localhost:3000

## Stopping the System

Press `Ctrl+C` in the PowerShell window to stop all services, or:

```powershell
# Kill Node processes
Stop-Process -Name node -Force

# Kill Python processes  
Stop-Process -Name python -Force
```

## Next Steps

1. **Enable Real Hostinger API:**
   - Add your API key to `credentials/hostinger_creds.json`
   - The dashboard will automatically switch to live data

2. **Customize Dashboard:**
   - Edit `frontend_stack/frontend/src/pages/HostingerPage.jsx`
   - Add more integrations to the orchestration server
   - Extend the AI agent ecosystem

3. **Deploy to Production:**
   - Build: `npm run build:orchestration`
   - Use Docker: See `Dockerfile.gateway` for reference
   - Deploy to Hostinger using the dashboard integration

## Troubleshooting

### Port Already in Use
```powershell
# Find and kill process using port
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Stop-Process -Force

Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
  Stop-Process -Force
```

### Dependencies Won't Install
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install --legacy-peer-deps
```

### Python Issues
```bash
# Activate virtual environment
cd C:\AI\infinity-matrix
.\.venv\Scripts\Activate.ps1

# Run health check
python system_health_check.py
```

## Support

For issues or questions:
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review [CONSOLIDATION_COMPLETE.md](CONSOLIDATION_COMPLETE.md) for technical details
- Check orchestration logs: `npm run start:orchestration`
- Check frontend logs: `npm run dev` in frontend folder

---

**Status:** ✅ Production Ready  
**Last Updated:** December 31, 2025  
**Version:** 1.0
