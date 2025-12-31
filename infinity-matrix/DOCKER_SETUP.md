# Docker Setup for Infinity-Matrix with Hostinger Integration

## Overview

This Docker Compose setup runs the complete Infinity-Matrix system with Hostinger dashboard:

- **Frontend**: React/Vite dashboard on port 3000
- **Backend**: TypeScript/Express API on port 3001
- **AI Services**: Python services for integration
- **Gateway**: Original API gateway on port 8000
- **Ollama**: LLM service on port 11434

## Prerequisites

- Docker Desktop (or Docker + Docker Compose)
- Git (already installed)
- 4GB+ RAM available
- Ports 3000, 3001, 8000, 11434 available

## Quick Start

### 1. Production Environment

```bash
cd c:\AI\infinity-matrix
docker-compose up -d
```

Wait for containers to start (~2-3 minutes):

```bash
docker-compose ps
```

### 2. Development Environment

For live reload and faster development:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 3. Access the System

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | Main dashboard |
| **Hostinger Dashboard** | **http://localhost:3000/hostinger** | **Your hosting info** |
| API Health | http://localhost:3001/health | Backend status |
| Gateway | http://localhost:8000 | API gateway |
| Ollama | http://localhost:11434 | LLM service |

## What Gets Built

### Frontend Service
- **Image**: Node 18 Alpine + React/Vite
- **Port**: 3000
- **Process**: Builds React app, runs via `serve`
- **Health Check**: HTTP /health every 30s

### Orchestration Service
- **Image**: Node 18 Alpine + TypeScript/Express
- **Port**: 3001
- **Process**: Compiles TypeScript, runs Express server
- **Health Check**: HTTP /health every 30s
- **Mounts**: Credentials folder (read-only)

### AI Services
- **Image**: Python 3.12 Slim
- **Process**: Runs system health check
- **Mounts**: Credentials folder (read-only)
- **Env**: HOSTINGER_API_KEY support

### Supporting Services
- **API Gateway**: Python-based gateway (port 8000)
- **Ollama**: LLM service (port 11434)
- **Crawler**: Web scraper service

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Hostinger Integration
HOSTINGER_API_KEY=your_api_key_here

# Optional
NODE_ENV=production
LOG_LEVEL=INFO
DEBUG=false
```

### Credentials

Place your Hostinger API key in:
```
credentials/hostinger_creds.json
```

Contents:
```json
{
  "api_key": "your_hostinger_api_key"
}
```

This is mounted read-only in containers.

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f orchestration

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Services

```bash
# Stop all
docker-compose stop

# Remove containers
docker-compose down

# Remove with volumes
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build orchestration

# Rebuild without cache
docker-compose build --no-cache
```

### Execute Commands

```bash
# Run command in container
docker-compose exec frontend npm list

docker-compose exec orchestration npm run build

# Access shell
docker-compose exec frontend sh
docker-compose exec orchestration sh
```

## Development Workflow

### Option 1: Hot Reload Development

```bash
# Start dev environment with volume mounts
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Changes to src/ files will auto-reload
# Edit files and see changes immediately
```

### Option 2: Local Development, Docker Services

```bash
# Run only supporting services
docker-compose up api-gateway ollama crawler

# Run frontend/backend locally
cd frontend_stack/frontend
npm run dev

# In another terminal
cd orchestration
npm run dev
```

### Option 3: Full Docker Production

```bash
# Build everything
docker-compose build

# Run production version
docker-compose up -d

# Monitor
docker-compose logs -f
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or use different port
docker-compose -e "FRONTEND_PORT=3002" up
```

### Container Won't Start

```bash
# Check logs
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache frontend

# Restart
docker-compose restart frontend
```

### Permission Denied Errors

```bash
# On Windows, ensure Docker Desktop is running with proper settings
# On Linux, may need: sudo docker-compose ...
```

### Memory Issues

```bash
# Increase Docker Desktop memory (Settings > Resources)
# Or limit per container in docker-compose.yml:
# services:
#   frontend:
#     deploy:
#       resources:
#         limits:
#           memory: 512M
```

### Build Errors

```bash
# Clear build cache
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Check build logs
docker-compose build --verbose
```

## Performance Tips

1. **Use `.dockerignore`** - Reduces build context (already set up)
2. **Multi-stage builds** - Frontend and orchestration use builder stages
3. **Minimal base images** - Alpine Linux used for smaller images
4. **Layer caching** - Dependencies cached between builds
5. **Volumes** - Credentials mounted read-only for security

## Security

### What's Secure

✅ Credentials never copied into image  
✅ Credentials mounted read-only  
✅ No hardcoded secrets in Dockerfiles  
✅ Production uses minimal base images  
✅ Health checks verify service status  

### Best Practices

1. Use `.env` for secrets (not in docker-compose.yml)
2. Mount credentials read-only
3. Use specific version tags (not `latest`)
4. Scan images for vulnerabilities: `docker scan <image>`
5. Don't run as root in containers

## Deploying to Production

### On Linux Server

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/InfinityXOneSystems/infinity-matrix.git
cd infinity-matrix

# Create .env with production values
nano .env

# Pull credentials
mkdir -p credentials
# Copy hostinger_creds.json

# Start services
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3000/hostinger
```

### On Hostinger

```bash
# SSH into hosting
ssh user@your-domain.com

# Install Docker (if not available)
# Or use existing container runtime

# Follow Linux Server steps above
```

## Monitoring

### Docker Stats

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats infinity-matrix_frontend_1
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Manual health check
curl http://localhost:3001/health
curl http://localhost:3000/hostinger
```

## Advanced Configuration

### Custom Network

Containers communicate via `infinity-network` bridge:
```bash
# Inspect network
docker network inspect infinity-matrix_infinity-network
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect infinity-matrix_ollama_data

# Backup volume
docker run --rm -v infinity-matrix_ollama_data:/data -v $(pwd):/backup ubuntu tar czf /backup/ollama_backup.tar.gz /data
```

### Build Arguments

```bash
# Pass build args
docker-compose build --build-arg NODE_ENV=production
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify ports: `netstat -ano`
3. Test locally first: `npm run dev`
4. Check Docker Desktop status
5. Review .env configuration

---

**Status**: ✅ Production Ready  
**Version**: Docker Compose 3.8  
**Date**: December 31, 2025
