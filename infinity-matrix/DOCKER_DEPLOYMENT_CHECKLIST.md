# Infinity-Matrix Docker Deployment - Complete Checklist

## ✅ Phase 1: Environment Setup

### Before You Start
- [ ] Docker Desktop installed and running
  - Check: `docker --version`
  - Check: `docker-compose --version`
- [ ] 4GB+ RAM available
- [ ] Ports 3000, 3001, 8000, 11434 free
  - Check: `netstat -ano | findstr :3000`
- [ ] Internet connection (to pull images)
- [ ] ~2GB free disk space (for images)

### Configuration Files
- [ ] Copy .env.example to .env
  ```bash
  cp .env.example .env
  ```
- [ ] Edit .env with Hostinger API key
  ```bash
  HOSTINGER_API_KEY=your_key_here
  ```
- [ ] Create credentials directory
  ```bash
  mkdir -p credentials
  ```
- [ ] (Optional) Add credentials/hostinger_creds.json
  ```json
  {"api_key": "your_key"}
  ```

## ✅ Phase 2: First-Time Startup

### Build Images
- [ ] Run build command
  ```bash
  cd c:\AI\infinity-matrix
  docker-compose build
  ```
  - Expected time: 2-3 minutes
  - Pulls base images, installs dependencies
  - Creates optimized layers

### Start Services
- [ ] Start in background
  ```bash
  docker-compose up -d
  ```
  - OR use startup script:
  - Windows: `start_docker.bat production`
  - Linux/Mac: `./start_docker.sh production`

### Wait for Ready
- [ ] Wait 60-90 seconds for startup
- [ ] Check status
  ```bash
  docker-compose ps
  ```
  All services should show "Up"

## ✅ Phase 3: Verification

### Service Status
- [ ] Frontend running
  ```bash
  curl http://localhost:3000
  ```
  Should return HTML page

- [ ] API health check
  ```bash
  curl http://localhost:3001/health
  ```
  Should return `{"status": "ok"}` (or similar)

- [ ] Hostinger endpoint
  ```bash
  curl http://localhost:3000/hostinger
  ```
  Should return HTML

- [ ] Gateway active
  ```bash
  curl http://localhost:8000
  ```
  Should be accessible

- [ ] Ollama running
  ```bash
  curl http://localhost:11434/api/tags
  ```
  Should return JSON

### Docker Verification
- [ ] Run health check script
  ```bash
  python docker_health_check.py
  ```
  Should show all services healthy

- [ ] Check container resource usage
  ```bash
  docker stats
  ```
  All containers should be running

- [ ] Review logs for errors
  ```bash
  docker-compose logs | grep ERROR
  ```
  Should be empty or minimal

## ✅ Phase 4: Dashboard Access

### Frontend Access
- [ ] Open browser to http://localhost:3000
  - [ ] Page loads successfully
  - [ ] Navigation visible
  - [ ] Responsive design working

### Hostinger Dashboard
- [ ] Navigate to http://localhost:3000/hostinger
  - [ ] Page loads with animation
  - [ ] Shows "Hostinger Account Information"
  - [ ] Displays hosting URL
  - [ ] Shows account status
  - [ ] Lists domains
  - [ ] Lists websites
  - [ ] Refresh button works

### API Direct Access
- [ ] Test API endpoint
  ```bash
  curl http://localhost:3001/hostinger/info
  ```
  Should return account data JSON

## ✅ Phase 5: Development Setup (Optional)

### Hot-Reload Development
- [ ] Start dev environment
  ```bash
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
  ```
  
- [ ] Make code change in `frontend_stack/frontend/src/`
- [ ] Verify hot-reload
  - [ ] Page reloads automatically (~2 seconds)
  - [ ] No manual browser refresh needed
  - [ ] Changes persist after save

### Local Development Alternative
- [ ] Stop Docker containers
  ```bash
  docker-compose down
  ```

- [ ] Start only supporting services
  ```bash
  docker-compose up api-gateway ollama crawler
  ```

- [ ] Run frontend locally
  ```bash
  cd frontend_stack/frontend
  npm run dev
  ```

- [ ] Run backend locally
  ```bash
  cd orchestration
  npm run dev
  ```

## ✅ Phase 6: Logs & Monitoring

### View Logs
- [ ] All services
  ```bash
  docker-compose logs -f
  ```

- [ ] Specific service
  ```bash
  docker-compose logs -f frontend
  docker-compose logs -f orchestration
  docker-compose logs -f ai-services
  ```

- [ ] Last 100 lines
  ```bash
  docker-compose logs --tail=100
  ```

### Monitor Performance
- [ ] Watch resource usage
  ```bash
  docker stats
  ```
  - [ ] CPU% - should be low (<10% each)
  - [ ] Memory - should be stable
  - [ ] Network - should see activity

- [ ] Check container disk usage
  ```bash
  docker system df
  ```

## ✅ Phase 7: Daily Operations

### Startup Procedure
- [ ] Check Docker is running
  - Windows: Docker Desktop running
  - Linux: `sudo systemctl status docker`

- [ ] Start services
  ```bash
  cd c:\AI\infinity-matrix
  docker-compose up -d
  ```
  Or use script: `start_docker.bat production`

- [ ] Verify (after 60 seconds)
  ```bash
  docker-compose ps
  python docker_health_check.py
  ```

### Shutdown Procedure
- [ ] Stop services gracefully
  ```bash
  docker-compose stop
  ```
  (Takes ~30 seconds)

- [ ] Verify stopped
  ```bash
  docker-compose ps
  ```
  All should show "Exited"

### Restart
- [ ] Quick restart
  ```bash
  docker-compose restart
  ```

### Full Rebuild
- [ ] When code changes significantly
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```

## ✅ Phase 8: Production Deployment

### Pre-Deployment Checklist
- [ ] All local tests passing
- [ ] Environment variables configured
- [ ] Credentials files in place
- [ ] .env file created (never commit actual keys)
- [ ] Documentation reviewed

### Server Preparation (Linux)
- [ ] SSH into server
- [ ] Install Docker
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

- [ ] Install Docker Compose
  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```

### Deploy to Server
- [ ] Clone or push repository
  ```bash
  git clone <repo-url> infinity-matrix
  cd infinity-matrix
  ```

- [ ] Create .env
  ```bash
  cp .env.example .env
  # Edit with production values
  nano .env
  ```

- [ ] Copy credentials
  ```bash
  mkdir -p credentials
  # Copy hostinger_creds.json
  ```

- [ ] Start services
  ```bash
  docker-compose up -d
  ```

- [ ] Verify
  ```bash
  docker-compose ps
  curl http://localhost:3000
  ```

### Reverse Proxy Setup (Optional)
- [ ] Install nginx (if not using Docker)
- [ ] Configure proxy to localhost:3000
- [ ] Set up SSL certificate
- [ ] Configure domain DNS

### Monitoring Setup
- [ ] Set up log rotation
- [ ] Configure monitoring alerts
- [ ] Schedule backups
- [ ] Document password access

## ✅ Phase 9: Maintenance

### Weekly
- [ ] Review logs for errors
  ```bash
  docker-compose logs | grep ERROR
  ```

- [ ] Check disk usage
  ```bash
  docker system df
  ```

- [ ] Monitor resource usage
  ```bash
  docker stats
  ```

### Monthly
- [ ] Update base images
  ```bash
  docker-compose build --pull
  docker-compose up -d
  ```

- [ ] Clean unused images
  ```bash
  docker image prune -a
  ```

- [ ] Backup Ollama data
  ```bash
  docker run --rm -v infinity-matrix_ollama_data:/data \
    -v $(pwd):/backup ubuntu \
    tar czf /backup/ollama_backup_$(date +%Y%m%d).tar.gz /data
  ```

### Quarterly
- [ ] Security scan images
  ```bash
  docker scan <image-name>
  ```

- [ ] Review and update dependencies
- [ ] Test disaster recovery
- [ ] Review access logs

## ✅ Phase 10: Troubleshooting

### If Services Won't Start
- [ ] Check Docker daemon
  ```bash
  docker ps
  ```
  Should work without error

- [ ] View error logs
  ```bash
  docker-compose logs
  ```

- [ ] Rebuild
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```

### If Port is in Use
- [ ] Find process
  ```bash
  netstat -ano | findstr :3000
  ```

- [ ] Kill process (Windows)
  ```bash
  taskkill /PID <PID> /F
  ```

- [ ] Or use different port in docker-compose.yml

### If Frontend Won't Load
- [ ] Check frontend container
  ```bash
  docker-compose logs frontend
  ```

- [ ] Restart frontend
  ```bash
  docker-compose restart frontend
  ```

- [ ] Rebuild frontend
  ```bash
  docker-compose build --no-cache frontend
  docker-compose up -d frontend
  ```

### If API Not Responding
- [ ] Check orchestration logs
  ```bash
  docker-compose logs orchestration
  ```

- [ ] Test health endpoint
  ```bash
  curl -v http://localhost:3001/health
  ```

- [ ] Restart service
  ```bash
  docker-compose restart orchestration
  ```

### If Hostinger Dashboard Empty
- [ ] Check .env has API key
  ```bash
  grep HOSTINGER_API_KEY .env
  ```

- [ ] Verify API works
  ```bash
  curl http://localhost:3001/hostinger/info
  ```

- [ ] Check browser console (F12)
- [ ] Review orchestration logs
  ```bash
  docker-compose logs orchestration | grep -i hostinger
  ```

## ✅ Phase 11: Documentation

### Created Documentation
- [ ] DOCKER_QUICK_START.md - 30 second setup
- [ ] DOCKER_SETUP.md - Complete reference
- [ ] DOCKER_INDEX.md - Architecture and index
- [ ] DOCKER_DEPLOYMENT_SUMMARY.md - This overview
- [ ] This checklist

### Keep Updated
- [ ] Document any customizations
- [ ] Keep .env.example current
- [ ] Update README.md with Docker info
- [ ] Note any configuration changes

## ✅ Phase 12: Success Criteria

### System is working when:
- [ ] `docker-compose ps` shows all services "Up"
- [ ] Frontend loads at http://localhost:3000
- [ ] Hostinger dashboard shows at http://localhost:3000/hostinger
- [ ] API health check passes at http://localhost:3001/health
- [ ] No ERROR lines in logs
- [ ] All services responsive (<100ms response time)
- [ ] Health check script reports all healthy

### Production ready when:
- [ ] All above criteria met
- [ ] 24+ hours of stable operation
- [ ] Monitoring configured
- [ ] Backup process tested
- [ ] Disaster recovery plan documented
- [ ] Team trained on operations
- [ ] Documentation complete

## 📋 Quick Reference

### Essential Commands
```bash
# Start
docker-compose up -d

# Stop
docker-compose stop

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Rebuild
docker-compose build

# Health check
python docker_health_check.py

# Clean
docker-compose down -v
```

### Key URLs
```
Frontend:      http://localhost:3000
Hostinger:     http://localhost:3000/hostinger
API:           http://localhost:3001
Health:        http://localhost:3001/health
Gateway:       http://localhost:8000
Ollama:        http://localhost:11434
```

### Key Files
```
docker-compose.yml              Main config
docker-compose.dev.yml          Dev overrides
.env                            Configuration
credentials/hostinger_creds.json API keys
DOCKER_QUICK_START.md           Quick guide
DOCKER_SETUP.md                 Full reference
```

## ✅ Sign-Off

- [ ] All checklist items reviewed
- [ ] System tested and verified
- [ ] Documentation read and understood
- [ ] Team briefed on deployment
- [ ] Go/No-Go decision made

**Status**: ✅ **READY TO DEPLOY**

---

**Date**: December 31, 2025  
**Version**: 1.0  
**Status**: Production Ready  
**Estimated Setup Time**: 15-20 minutes (including build)
