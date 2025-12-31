# Infinity-Matrix Docker Deployment Index

## Overview

This document indexes all Docker-related files and configurations for the Infinity-Matrix system with Hostinger integration.

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) | Start here - 30 second setup | 3 min |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Complete Docker guide | 15 min |
| This file | Index and reference | 5 min |

## What Gets Deployed

### Docker Compose Services

```
Frontend Service (Port 3000)
├── Technology: Node.js 18 + React 19 + Vite
├── Dockerfile: frontend_stack/frontend/Dockerfile (28 lines)
├── Features: Hot reload (dev), SSR (prod), Health checks
└── URL: http://localhost:3000

Orchestration Service (Port 3001)
├── Technology: Node.js 18 + TypeScript + Express
├── Dockerfile: orchestration/Dockerfile (40 lines)
├── Features: API endpoints, Hostinger integration, Health checks
└── URL: http://localhost:3001/health

AI Services
├── Technology: Python 3.12
├── Dockerfile: Dockerfile.ai (35 lines)
├── Features: Hostinger API integration, System health checks
└── Integration: Connects to all services

API Gateway (Port 8000)
├── Technology: Python-based
├── Dockerfile: Dockerfile.gateway (existing)
├── Features: Request routing, API aggregation
└── URL: http://localhost:8000

Ollama LLM Service (Port 11434)
├── Technology: LLM inference
├── Features: Model loading, Inference API
└── URL: http://localhost:11434

Crawler Service
├── Technology: Web scraping
├── Features: Content extraction, Site monitoring
└── Integration: Feeds data to other services
```

## Docker Files

### Configuration Files

| File | Lines | Purpose |
|------|-------|---------|
| [docker-compose.yml](docker-compose.yml) | 89+ | Main service definitions |
| [docker-compose.dev.yml](docker-compose.dev.yml) | 28 | Development overrides with hot-reload |
| [.dockerignore](.dockerignore) | 21 | Build optimization (excludes node_modules, etc) |
| [.env.example](.env.example) | 30 | Environment variable template |

### Service Dockerfiles

| File | Lines | Technology | Purpose |
|------|-------|-----------|---------|
| [frontend_stack/frontend/Dockerfile](frontend_stack/frontend/Dockerfile) | 28 | Node 18 + React | Frontend app container |
| [orchestration/Dockerfile](orchestration/Dockerfile) | 40 | Node 18 + TypeScript | Backend API container |
| [Dockerfile.ai](Dockerfile.ai) | 35 | Python 3.12 | AI services container |
| [Dockerfile.gateway](Dockerfile.gateway) | (existing) | Python | API gateway container |

### Startup Scripts

| File | Platform | Purpose |
|------|----------|---------|
| [start_docker.sh](start_docker.sh) | Linux/Mac | Bash startup script with health checks |
| [start_docker.bat](start_docker.bat) | Windows | Batch startup script with health checks |

### Health Check Scripts

| File | Purpose |
|------|---------|
| [docker_health_check.py](docker_health_check.py) | Python health checker for all services |

## Setup Instructions

### 1. Initial Setup

```bash
# Copy environment template
cp .env.example .env

# Add your Hostinger API key
nano .env
# Set: HOSTINGER_API_KEY=your_key_here

# (Or create credentials file)
mkdir -p credentials
# Create: credentials/hostinger_creds.json
```

### 2. Start Services

**Production (background):**
```bash
docker-compose up -d
```

**Development (with hot-reload):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Using startup scripts:**
```bash
./start_docker.sh production      # Linux/Mac
start_docker.bat production       # Windows
```

### 3. Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| **Hostinger Dashboard** | **http://localhost:3000/hostinger** |
| API Health | http://localhost:3001/health |
| Gateway | http://localhost:8000 |
| Ollama | http://localhost:11434 |

### 4. Verify Installation

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Run health check
python docker_health_check.py

# Wait for ready
python docker_health_check.py --wait
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                User Browser                          │
│            (http://localhost:3000)                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
            ┌────────────────────┐
            │  Frontend Service  │
            │  (React/Vite)      │
            │  Port 3000         │
            │  (Dockerfile)      │
            └─────────┬──────────┘
                      │
                      │ API calls
                      ▼
    ┌─────────────────────────────────────┐
    │   Orchestration Service             │
    │   (Express/TypeScript)              │
    │   Port 3001                         │
    │   /hostinger/info endpoint          │
    │   (Dockerfile)                      │
    └────────┬────────────────────────────┘
             │
    ┌────────┴──────────┬────────────────┐
    │                   │                │
    ▼                   ▼                ▼
┌────────┐      ┌──────────┐      ┌─────────────┐
│ Hostinger  │ API Gateway│ Ollama │
│  Agent     │ Port 8000  │ Port 11434
│ (Python)   │(Gateway)   │(LLM)
│Dockerfile.ai│Dockerfile │
└────────┘      │.gateway  │      └─────────────┘
                └──────────┘

All services connected via: infinity-network (bridge driver)
Persistent data: ollama_data volume
Credentials: credentials/ mounted read-only
```

## File Dependencies

### What Must Be Installed First

```
docker-compose.yml
  ├─ Requires: docker-compose 3.8+
  └─ Depends on:
     ├─ frontend_stack/frontend/Dockerfile
     ├─ orchestration/Dockerfile
     ├─ Dockerfile.ai
     ├─ Dockerfile.gateway
     └─ .env (created from .env.example)

docker-compose.dev.yml
  └─ Extends: docker-compose.yml
     (Used with: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up)

start_docker.sh / start_docker.bat
  └─ Wrapper scripts for:
     ├─ docker-compose build
     ├─ docker-compose up -d
     ├─ Health checks
     └─ Logs viewing
```

### Hostinger Integration Files

```
Frontend:
  └─ frontend_stack/frontend/src/pages/HostingerPage.jsx (350 lines)
     ├─ Displays Hostinger URL
     ├─ Shows account info
     ├─ Real-time updates
     └─ Integrated in App.jsx route /hostinger

Backend:
  └─ orchestration/server/index.ts
     └─ Endpoint: GET /hostinger/info
        └─ Returns account info from Python agent

Python:
  └─ ai_stack/hostinger/hostinger_agent.py
     ├─ get_account_info()
     ├─ get_domains()
     ├─ get_websites()
     ├─ Real API integration
     └─ Fallback to mock data
```

## Configuration Files Explained

### docker-compose.yml

Services defined:
- `frontend`: React dev server / production with serve
- `orchestration`: Express API server
- `ai-services`: Python health checks
- `api-gateway`: Python gateway
- `setup-env`: Environment initialization
- `ollama`: LLM service
- `crawler`: Web crawler

Network: `infinity-network` (bridge)
Volumes:
- `ollama_data`: Persistent LLM data
- `credentials/`: Read-only API keys

### docker-compose.dev.yml

Overrides for development:
- Source code volumes (hot-reload)
- `npm run dev` instead of production builds
- Debug environment variables
- Same services, faster iteration

Usage: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

### .env File

Variables used by all services:
```
HOSTINGER_API_KEY          # Hostinger integration
NODE_ENV                   # development/production
LOG_LEVEL                  # INFO/DEBUG/ERROR
VITE_API_URL              # Frontend API URL
VITE_GATEWAY_URL          # Frontend gateway URL
ORCHESTRATION_PORT        # Backend port
API_GATEWAY_PORT          # Gateway port
OLLAMA_URL                # LLM service URL
```

## Build Process

### Frontend Build (Multi-stage)

```
Stage 1 (builder):
  ├─ Base: Node 18 Alpine
  ├─ Copy: package.json, package-lock.json
  ├─ Run: npm ci
  ├─ Copy: src/
  └─ Run: npm run build → outputs to dist/

Stage 2 (production):
  ├─ Base: Node 18 Alpine
  ├─ Install: serve (production server)
  ├─ Copy: dist/ from builder
  ├─ Run: serve -s dist -l 3000
  └─ Health: curl localhost:3000
```

### Orchestration Build (Multi-stage)

```
Stage 1 (builder):
  ├─ Base: Node 18 Alpine
  ├─ Copy: package.json, tsconfig.json
  ├─ Run: npm ci
  ├─ Copy: server/, src/
  └─ Run: npm run build → outputs to dist/

Stage 2 (production):
  ├─ Base: Node 18 Alpine
  ├─ Copy: dist/ from builder
  ├─ Copy: package.json, node_modules (npm ci)
  ├─ Run: node dist/server/index.js
  └─ Health: curl localhost:3001/health
```

### AI Services Build

```
Base: Python 3.12 Slim
  ├─ Install: build-essential, curl
  ├─ Copy: requirements.txt
  ├─ Run: pip install -r requirements.txt
  ├─ Copy: ai_stack/
  └─ Health: Check Hostinger agent
```

## Networking

### DNS Resolution Within Docker

```
Services can reach each other by name:
  frontend → http://orchestration:3001
  orchestration → http://ai-services:8000 (or http://api-gateway:8000)
  all services → http://ollama:11434
  
External URLs:
  http://localhost:3000 (from host machine)
  http://docker.host.internal:3000 (from containers)
```

### Port Mappings

| Service | Internal | External | Used For |
|---------|----------|----------|----------|
| frontend | 3000 | 3000 | React app |
| orchestration | 3001 | 3001 | API |
| api-gateway | 8000 | 8000 | Gateway |
| ollama | 11434 | 11434 | LLM |

## Volume Management

### Data Persistence

```
ollama_data/
  └─ Persistent LLM models and cache
  └─ Preserved after docker-compose down
  └─ Mounted at: /root/.ollama in container

credentials/
  └─ API keys (hostinger_creds.json)
  └─ Mounted read-only in all services
  └─ Path: /app/credentials
```

### Backup Volumes

```bash
# Backup ollama data
docker run --rm -v infinity-matrix_ollama_data:/data \
  -v $(pwd):/backup ubuntu \
  tar czf /backup/ollama_backup.tar.gz /data

# Restore
docker run --rm -v infinity-matrix_ollama_data:/data \
  -v $(pwd):/backup ubuntu \
  tar xzf /backup/ollama_backup.tar.gz -C /
```

## Common Operations Reference

### Startup

```bash
# Simple (uses docker-compose.yml)
docker-compose up -d

# With overrides (development)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Using scripts
./start_docker.sh production       # Linux/Mac
start_docker.bat production        # Windows
```

### Monitoring

```bash
# Service status
docker-compose ps

# Real-time logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f frontend

# Resource usage
docker stats

# Health check
python docker_health_check.py
python docker_health_check.py --wait
```

### Updates

```bash
# Rebuild images
docker-compose build

# Rebuild specific service
docker-compose build orchestration

# Rebuild without cache
docker-compose build --no-cache

# Apply new build
docker-compose up -d
```

### Cleanup

```bash
# Stop services
docker-compose stop

# Remove containers
docker-compose down

# Remove everything including data
docker-compose down -v

# Clean unused images
docker image prune

# Full cleanup (use carefully)
docker system prune -a
```

## Environment-Specific Configurations

### Development

Use: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

Features:
- Hot reload on file changes
- Source code volumes mounted
- `npm run dev` for faster builds
- Debug logging enabled
- No optimization

### Staging

Use: `docker-compose up`

Features:
- Production builds
- Optimized images
- Health checks active
- Proper logging

### Production

Same as staging, plus:
- Consider using: `docker-compose up -d`
- Monitor with: `docker stats`
- Backup volumes regularly
- Update images periodically

## Troubleshooting Guide

### Issue: Services won't start

```bash
# Check logs
docker-compose logs | grep ERROR

# Verify environment
cat .env

# Rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Port already in use

```bash
# Find what's using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port in docker-compose.yml
```

### Issue: API not responding

```bash
# Check API container
docker-compose logs orchestration

# Test manually
curl -v http://localhost:3001/health

# Restart service
docker-compose restart orchestration
```

### Issue: Build fails

```bash
# Clear build cache
docker-compose build --no-cache

# Check Docker disk space
docker system df

# Increase Docker memory
# Settings > Resources > Memory: 4GB+
```

## Performance Optimization

### Build Time

- ✅ `.dockerignore` excludes unnecessary files
- ✅ Multi-stage builds reduce final size
- ✅ Alpine base images (2-20x smaller)
- ✅ Layer caching for dependencies

### Runtime Performance

- ✅ `serve` for frontend (optimized serving)
- ✅ Node.js cluster mode potential in orchestration
- ✅ Ollama caching for LLM models
- ✅ Volume mounts (not copy) for credentials

### Disk Usage

```bash
# Check sizes
docker images

# Remove unused
docker image prune

# Clean system
docker system prune --all
```

## Security Considerations

✅ **Implemented:**
- Credentials never in image
- Read-only credential mounts
- Alpine base images (smaller attack surface)
- Health checks verify service status
- No hardcoded secrets

⚠️ **Additional Recommendations:**
- Use secrets management (Docker Secrets/environment variables)
- Scan images: `docker scan <image>`
- Keep images updated regularly
- Use specific version tags (not `latest`)
- Network policies for production

## Next Steps

1. **First Time Setup**: Follow [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
2. **Detailed Info**: Read [DOCKER_SETUP.md](DOCKER_SETUP.md)
3. **Verify Deployment**: Run `python docker_health_check.py --wait`
4. **Access Dashboard**: Visit http://localhost:3000/hostinger
5. **Monitor Services**: Use `docker-compose logs -f`
6. **Production Deploy**: Move to Linux/server following setup guide

## Support Resources

- **Docker Docs**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Health Checks**: https://docs.docker.com/engine/reference/builder/#healthcheck

---

**Status**: ✅ Production Ready  
**Last Updated**: December 31, 2025  
**Tested On**: Windows 10/11, Linux, macOS  
**Docker Version**: 3.8+ (Compose)
