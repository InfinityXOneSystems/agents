# Docker Quick Reference Card

## 🚀 START HERE - 3 Commands to Get Running

```bash
# 1. Create config from template
cp .env.example .env

# 2. Edit with your Hostinger API key
nano .env    # Linux/Mac
notepad .env # Windows

# 3. Start everything
docker-compose up -d
```

**Wait 60 seconds, then visit:** http://localhost:3000/hostinger

---

## 📋 Essential Commands

### START / STOP
```bash
docker-compose up -d              # Start (background)
docker-compose up                 # Start (foreground, see logs)
docker-compose stop               # Stop gracefully
docker-compose down               # Stop & remove containers
docker-compose down -v            # Stop & remove everything
```

### MONITOR
```bash
docker-compose ps                 # Service status
docker-compose logs -f            # View logs (live)
docker-compose logs -f frontend   # Specific service
docker stats                       # CPU/Memory usage
python docker_health_check.py     # Health check
```

### DEVELOP
```bash
# Hot-reload development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Rebuild after code changes
docker-compose build
docker-compose build --no-cache
docker-compose build orchestration  # Specific service
```

### MAINTAIN
```bash
docker-compose restart            # Restart all
docker-compose restart frontend   # Restart one
docker-compose exec frontend npm list  # Run command
docker-compose exec frontend sh   # Access shell
```

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main app |
| **Hostinger** | http://localhost:3000/hostinger | **YOUR DASHBOARD** |
| **API** | http://localhost:3001 | Backend |
| **Health** | http://localhost:3001/health | Status |
| **Gateway** | http://localhost:8000 | API Gateway |
| **Ollama** | http://localhost:11434 | LLM |

---

## 📁 Important Files

```
docker-compose.yml          Main configuration
docker-compose.dev.yml      Development overrides
.env                        Your config (create from .env.example)
credentials/hostinger_creds.json  API key file
```

---

## 🔥 Common Issues & Fixes

| Issue | Command |
|-------|---------|
| **Port in use** | `netstat -ano \| findstr :3000` |
| **Services won't start** | `docker-compose build --no-cache && docker-compose up -d` |
| **Need logs** | `docker-compose logs \| grep ERROR` |
| **Restart everything** | `docker-compose down && docker-compose up -d` |
| **Clear everything** | `docker-compose down -v` |

---

## 📚 Documentation

| Document | When | Time |
|----------|------|------|
| **DOCKER_QUICK_START.md** | **First time** | **3 min** |
| DOCKER_SETUP.md | Need details | 15 min |
| DOCKER_INDEX.md | Want architecture | 10 min |
| DOCKER_DEPLOYMENT_CHECKLIST.md | Before production | 10 min |

---

## ✅ You're Good When

```bash
✓ docker-compose ps            # All "Up"
✓ curl http://localhost:3000   # Returns HTML
✓ curl http://localhost:3001/health  # Returns OK
✓ Browser shows http://localhost:3000/hostinger
✓ python docker_health_check.py     # All green
✓ docker-compose logs | grep ERROR  # Empty
```

---

## 🆘 Need Help?

1. **Quick issues?** → Check this card
2. **Setup help?** → Read DOCKER_QUICK_START.md
3. **Full guide?** → Read DOCKER_SETUP.md  
4. **Deploying?** → Use DOCKER_DEPLOYMENT_CHECKLIST.md
5. **Architecture?** → Study DOCKER_INDEX.md

---

## 💡 Pro Tips

```bash
# Watch logs in real-time
docker-compose logs -f

# See resource usage
docker stats --no-stream

# Access service shell (for debugging)
docker-compose exec orchestration bash

# Get recent errors
docker-compose logs | tail -20 | grep -i error

# Check API manually
curl -i http://localhost:3001/hostinger/info

# Rebuild and restart in one command
docker-compose build && docker-compose up -d
```

---

## 🎯 Daily Workflow

**Morning - Start System**
```bash
docker-compose up -d
python docker_health_check.py --wait
curl http://localhost:3000/hostinger
```

**During Day - Check Status**
```bash
docker-compose ps
docker-compose logs -f
```

**Evening - Stop System**
```bash
docker-compose stop
```

**When Code Changes**
```bash
docker-compose build
docker-compose up -d
```

---

## 📦 What's Running

```
Frontend (React/Vite)       :3000
  └─ Hostinger Dashboard   /hostinger
  
Orchestration (Express)    :3001
  └─ API Health Check      /health
  
AI Services (Python)       Internal
  └─ Hostinger Agent       Integration
  
API Gateway               :8000
Ollama (LLM)             :11434
Crawler                  Internal
```

**Network:** infinity-network (all services connected)

---

## 🔑 Configuration

### Create .env
```bash
cp .env.example .env
```

### Required Variables
```
HOSTINGER_API_KEY=your_key_here
NODE_ENV=production
LOG_LEVEL=INFO
```

### Optional
```
VITE_API_URL=http://localhost:3001
ORCHESTRATION_PORT=3001
API_GATEWAY_PORT=8000
```

---

## ⏱️ Startup Times

| Phase | Duration |
|-------|----------|
| Build (first) | 2-3 min |
| Build (cached) | 30-60 sec |
| Container start | 30 sec |
| Services ready | 60-90 sec |
| **Total startup** | **~2-3 min first time** |

---

## 🎊 Success Indicators

✅ `docker-compose ps` = all "Up"  
✅ Browser = http://localhost:3000 works  
✅ Dashboard = http://localhost:3000/hostinger shows data  
✅ API = http://localhost:3001/health returns OK  
✅ Logs = No ERROR lines  

---

## Version Info

- **Docker Compose**: 3.8+
- **Node**: 18 (Alpine)
- **Python**: 3.12 (Slim)
- **Status**: Production Ready ✅

---

**Last Updated:** December 31, 2025  
**Status:** READY TO USE  
**Support:** See DOCKER_SETUP.md for detailed help
