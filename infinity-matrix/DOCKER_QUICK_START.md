# Docker Deployment Quick Reference

## One-Command Start

```bash
cd c:\AI\infinity-matrix
docker-compose up
```

Then visit: **http://localhost:3000/hostinger**

## 30-Second Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Add Hostinger API Key**
   ```bash
   # Edit .env and add your key
   HOSTINGER_API_KEY=your_key_here
   ```
   
   OR create credentials file:
   ```bash
   mkdir -p credentials
   # Create credentials/hostinger_creds.json with your API key
   ```

3. **Start Docker**
   ```bash
   docker-compose up -d
   ```

4. **Check Status**
   ```bash
   docker-compose ps
   ```

5. **View Logs**
   ```bash
   docker-compose logs -f frontend
   ```

## URLs After Startup

| Service | URL | Wait Time |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | 30-60s |
| **Hostinger** | **http://localhost:3000/hostinger** | **30-60s** |
| API | http://localhost:3001/health | 30-60s |
| Gateway | http://localhost:8000 | 60s |
| Ollama | http://localhost:11434 | 2-5m |

## Common Operations

```bash
# Start (foreground - see all logs)
docker-compose up

# Start (background)
docker-compose up -d

# Stop
docker-compose stop

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Stop and remove
docker-compose down

# View status
docker-compose ps

# Clean everything (removes containers, not images/volumes)
docker-compose down -v
```

## Development Mode

```bash
# Auto-reload on file changes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Troubleshooting

```bash
# Check if ports are free
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# View specific service logs
docker-compose logs frontend
docker-compose logs orchestration
docker-compose logs ai-services

# Rebuild after code changes
docker-compose build && docker-compose up -d

# Force rebuild
docker-compose build --no-cache && docker-compose up -d

# Access container shell
docker-compose exec frontend sh
docker-compose exec orchestration sh

# Manual health check
curl http://localhost:3001/health
curl http://localhost:3000
```

## File Structure for Docker

```
infinity-matrix/
├── docker-compose.yml           ← Main config
├── docker-compose.dev.yml       ← Dev overrides
├── .env                         ← Your config (create from .env.example)
├── .dockerignore                ← Build optimization
├── .env.example                 ← Template
├── credentials/
│   └── hostinger_creds.json     ← API key file
├── frontend_stack/frontend/
│   └── Dockerfile               ← Frontend build
├── orchestration/
│   └── Dockerfile               ← Backend build
├── Dockerfile.ai                ← Python build
├── ai_stack/
│   ├── hostinger/hostinger_agent.py
│   └── system_health_check.py
└── ... (other files)
```

## Hostinger Integration Verification

After startup, check:

```bash
# 1. Frontend loads
curl http://localhost:3000

# 2. Hostinger page loads
curl http://localhost:3000/hostinger

# 3. API responds
curl http://localhost:3001/hostinger/info

# 4. View dashboard
# Open browser: http://localhost:3000/hostinger
# Should show:
# - Your Hostinger URL
# - Account status
# - Domains
# - Websites
# - Live refresh capability
```

## Quick Debugging

```bash
# All service logs
docker-compose logs

# Last 50 lines, follow new entries
docker-compose logs --tail=50 -f

# Pretty print
docker-compose logs frontend | head -20

# Filter by service
docker-compose logs orchestration | grep ERROR

# See startup order
docker-compose logs | grep -E "Starting|started"
```

## Resource Monitoring

```bash
# CPU/Memory/Network stats
docker stats

# Specific service only
docker stats infinity-matrix_frontend_1

# Pretty format
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
```

## Performance Tips

1. **First time**: Takes 2-3 minutes (building images)
2. **Subsequent starts**: 30-60 seconds
3. **Development**: Use hot-reload config for faster iteration
4. **Production**: Use standard docker-compose.yml

## When to Use Each Config

| Scenario | Command |
|----------|---------|
| First time setup | `docker-compose up` |
| Daily development | `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` |
| Production deploy | `docker-compose -f docker-compose.yml up -d` |
| Quick restart | `docker-compose restart` |
| Fresh build | `docker-compose down && docker-compose up -d` |
| Debugging | `docker-compose logs -f` |

## Success Indicators

✅ `docker-compose ps` shows all services as "Up"  
✅ `curl http://localhost:3000` returns HTML  
✅ `curl http://localhost:3001/health` returns `{"status": "ok"}`  
✅ Browser shows Hostinger dashboard at `/hostinger`  
✅ No ERROR lines in `docker-compose logs`  

## If Something's Wrong

1. **Check logs first**
   ```bash
   docker-compose logs | grep ERROR
   ```

2. **Rebuild if code changed**
   ```bash
   docker-compose build && docker-compose up -d
   ```

3. **Nuke and restart** (removes everything)
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Check ports are free**
   ```bash
   netstat -ano | findstr ":3000\|:3001\|:8000"
   ```

5. **Verify .env exists and has API key**
   ```bash
   cat .env | grep HOSTINGER
   ```

---

**Status**: ✅ Ready to Deploy  
**Estimated Startup Time**: 60-90 seconds  
**Knowledge Base**: See DOCKER_SETUP.md for advanced topics
