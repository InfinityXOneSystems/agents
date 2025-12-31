# Cloud Run Deployment Quick Start Guide

**Status**: ✅ System Ready for Deployment  
**Target**: Google Cloud Run (Hybrid Cloud-Primary Architecture)  
**Time Estimate**: 15-30 minutes  

---

## Prerequisites Checklist

- [ ] Google Cloud account with billing enabled
- [ ] gcloud CLI installed: `gcloud --version`
- [ ] Docker installed: `docker --version`
- [ ] Project set up in Google Cloud Console
- [ ] Service account created with permissions

---

## 5-Minute Quick Start

### Step 1: Verify Your System is Ready (1 min)

```bash
cd c:\AI\infinity-matrix

# Run cloud readiness verification
python verify_cloud_readiness.py
```

**Expected Output**: All checks pass ✅

### Step 2: Configure Google Cloud (2 min)

```bash
# Set your GCP project ID
gcloud config set project YOUR_PROJECT_ID

# Verify configuration
gcloud config list
```

### Step 3: Deploy to Cloud Run (2 min)

```bash
# Make script executable
chmod +x deploy-cloud-run.sh

# Run deployment
./deploy-cloud-run.sh YOUR_PROJECT_ID us-central1
```

**Expected Output**: Both services deployed successfully

### Step 4: Verify Deployment (1 min)

```bash
# List deployed services
gcloud run services list --region=us-central1

# Get URLs
gcloud run services describe infinity-frontend \
  --format='value(status.url)' --region=us-central1

gcloud run services describe infinity-orchestration \
  --format='value(status.url)' --region=us-central1
```

---

## Detailed Deployment Steps

### 1. Preparation (5 minutes)

#### 1.1 Install Google Cloud SDK

```bash
# Windows (if not already installed)
# Download from: https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

#### 1.2 Authenticate with Google Cloud

```bash
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config list
```

#### 1.3 Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Vertex AI API (for LLM backend)
gcloud services enable aiplatform.googleapis.com
```

### 2. Verification (2 minutes)

```bash
# Verify system is cloud-ready
python verify_cloud_readiness.py

# Expected checks:
# ✓ Docker installed
# ✓ gcloud CLI installed
# ✓ GCP project configured
# ✓ Configuration files present
# ✓ Hybrid architecture configured
```

### 3. Deployment (5-10 minutes)

```bash
# Navigate to project directory
cd c:\AI\infinity-matrix

# Make deployment script executable
chmod +x deploy-cloud-run.sh

# Run the deployment
./deploy-cloud-run.sh my-project us-central1

# The script will:
# 1. Enable required Google Cloud APIs
# 2. Build backend Docker image
# 3. Push to Container Registry
# 4. Deploy backend to Cloud Run
# 5. Build frontend Docker image
# 6. Push to Container Registry
# 7. Deploy frontend to Cloud Run
# 8. Configure auto-scaling
# 9. Set up service accounts
```

### 4. Verification (2 minutes)

```bash
# Check deployment status
gcloud run services list --region=us-central1

# Output should show:
# SERVICE NAME             STATUS  REGION      URL
# infinity-frontend        OK      us-central1  https://infinity-frontend-xxxxx.run.app
# infinity-orchestration   OK      us-central1  https://infinity-orchestration-xxxxx.run.app

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe infinity-frontend \
  --format='value(status.url)' --region=us-central1)

# Test the frontend
curl $FRONTEND_URL
# Should return HTML content (React app)

# Test backend health
BACKEND_URL=$(gcloud run services describe infinity-orchestration \
  --format='value(status.url)' --region=us-central1)

curl $BACKEND_URL/health
# Should return: {"status":"healthy","services":{...}}
```

---

## Cloud Run Configuration Reference

### Environment Variables (Cloud Run)

The deployment script automatically sets:

```env
# Backend Service
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
PORT=8080
VERTEX_AI_ENABLED=true
OLLAMA_FALLBACK_ENABLED=true

# Frontend Service
VITE_API_URL=https://infinity-orchestration-xxxxx.run.app
VITE_OLLAMA_HOST=https://ollama.infinityxai.com
VITE_OLLAMA_ENABLED=true
PORT=8080
```

### Service Configuration

**Backend Service (`infinity-orchestration`)**:
- Memory: 1Gi
- CPU: 1 (shared)
- Timeout: 3600 seconds
- Min Instances: 1
- Max Instances: 100
- Concurrency: 80

**Frontend Service (`infinity-frontend`)**:
- Memory: 512Mi
- CPU: 1 (shared)
- Timeout: 300 seconds
- Min Instances: 2
- Max Instances: 50
- Concurrency: 50

---

## Testing the Deployment

### Test Frontend

```bash
# Get frontend URL
FRONTEND=$(gcloud run services describe infinity-frontend \
  --format='value(status.url)' --region=us-central1)

# Open in browser
echo $FRONTEND
# Or directly: https://infinity-frontend-xxxxx.run.app

# Test with curl
curl -I $FRONTEND
# Should return 200 OK
```

### Test Backend Health

```bash
# Get backend URL
BACKEND=$(gcloud run services describe infinity-orchestration \
  --format='value(status.url)' --region=us-central1)

# Check health endpoint
curl $BACKEND/health
# Response: {"status":"healthy","services":{...},"uptime_seconds":XXX}

# Check readiness endpoint
curl $BACKEND/ready
# Response: {"ready":true,"services":{...}}
```

### Test Vertex AI Integration

```bash
# Query backend
BACKEND=$(gcloud run services describe infinity-orchestration \
  --format='value(status.url)' --region=us-central1)

curl -X POST $BACKEND/vertex/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is the capital of France?","max_tokens":50}'

# Response: {"text":"The capital of France is Paris...","backend":"cloud"}
```

### Test Hybrid Architecture

```bash
# The frontend will automatically:
# 1. Try Cloud Run backend first
# 2. Fall back to local Ollama if cloud fails
# 3. Return status in response: {"backend":"cloud"} or {"backend":"local"}

# Monitor in browser console or check metrics:
curl $BACKEND/metrics
# Shows request distribution, failover count, etc.
```

---

## Monitoring Your Deployment

### View Logs

```bash
# Real-time logs
gcloud run services logs read infinity-frontend --region=us-central1 --follow

# Or use Cloud Logging dashboard
# https://console.cloud.google.com/logs/query
```

### Monitor Metrics

```bash
# Check service metrics
gcloud monitoring metrics-descriptors list

# Or use Cloud Monitoring dashboard
# https://console.cloud.google.com/monitoring
```

### Check Auto-Scaling

```bash
# View current instance count
gcloud run services describe infinity-frontend --region=us-central1

# Should show something like:
# latestRevision: infinity-frontend-00001
# latestRevisionStatus: Active
# traffic:
# - latestRevision: true
#   percent: 100
```

---

## Common Issues and Solutions

### Issue: Build Fails

```bash
# Check Docker
docker --version

# Verify Dockerfile exists
ls -la frontend/Dockerfile
ls -la orchestration/Dockerfile

# Test local build
docker build -t test-frontend frontend/
docker build -t test-backend orchestration/
```

### Issue: Service Won't Start

```bash
# Check Cloud Run logs
gcloud run services logs read SERVICE_NAME --region=us-central1

# Common causes:
# - Port not set to 8080
# - Missing environment variables
# - Health check endpoint not responding
# - Docker image not found
```

### Issue: High Latency

```bash
# Check Cloud Monitoring for:
# - CPU utilization (should be < 70%)
# - Memory utilization (should be < 80%)
# - Cold start times
# - Instance count

# Scale up if needed:
gcloud run services update infinity-orchestration \
  --min-instances=2 --region=us-central1
```

### Issue: Fallback Not Working

```bash
# Verify local Ollama is running
curl http://localhost:11434/api/tags

# Check orchestration server
curl http://localhost:3001/health

# View hybrid client metrics
curl $BACKEND_URL/metrics

# Should show non-zero failover count if fallback working
```

---

## Configuration Management

### Update Environment Variables

```bash
# Update frontend environment
gcloud run services update infinity-frontend \
  --set-env-vars VITE_API_URL=https://new-api.example.com \
  --region=us-central1

# Update backend environment
gcloud run services update infinity-orchestration \
  --set-env-vars VERTEX_AI_ENABLED=true \
  --region=us-central1
```

### Scale Services

```bash
# Scale backend
gcloud run services update infinity-orchestration \
  --min-instances=2 \
  --max-instances=200 \
  --region=us-central1

# Scale frontend
gcloud run services update infinity-frontend \
  --min-instances=3 \
  --max-instances=100 \
  --region=us-central1
```

### Set Custom Domain

```bash
# Add domain mapping (requires DNS setup)
gcloud run domain-mappings create \
  --service=infinity-frontend \
  --domain=app.infinityxai.com \
  --region=us-central1

# Then update DNS CNAME to point to Cloud Run
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Google Cloud account created and billing enabled
- [ ] gcloud CLI installed and authenticated
- [ ] Docker installed and working
- [ ] Project ID known
- [ ] Service account permissions set up
- [ ] APIs enabled (Cloud Run, Cloud Build, Container Registry)

### Deployment
- [ ] Verified system readiness: `python verify_cloud_readiness.py`
- [ ] Set GCP project: `gcloud config set project YOUR_PROJECT_ID`
- [ ] Made deployment script executable: `chmod +x deploy-cloud-run.sh`
- [ ] Ran deployment: `./deploy-cloud-run.sh YOUR_PROJECT_ID us-central1`
- [ ] Verified both services deployed: `gcloud run services list`

### Post-Deployment
- [ ] Tested frontend endpoint
- [ ] Tested backend health endpoint
- [ ] Verified Vertex AI integration works
- [ ] Confirmed fallback mechanism (if local Ollama available)
- [ ] Set up monitoring and alerting
- [ ] Configured custom domain (if needed)
- [ ] Enabled CDN for frontend (optional)
- [ ] Set up Cloud Armor (optional)

### Post-Deployment
- [ ] Services running and healthy
- [ ] Traffic flowing to Cloud Run
- [ ] Monitoring dashboards set up
- [ ] Alerts configured
- [ ] Performance baseline established

---

## Cost Optimization Tips

1. **Adjust Min Instances**:
   ```bash
   # Set to 0 to avoid idle costs (but slower cold starts)
   gcloud run services update SERVICE_NAME \
     --min-instances=0 --region=us-central1
   ```

2. **Monitor Memory Usage**:
   ```bash
   # Check if you can reduce memory allocation
   gcloud monitoring metrics-descriptors list \
     --filter="memory"
   ```

3. **Enable Cloud CDN**:
   ```bash
   # Cache frontend static assets
   # Saves on Cloud Run requests
   ```

4. **Use Reserved Capacity** (for consistent traffic):
   - Plan for committed use discounts

---

## Support Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Infinity-Matrix Repository](https://github.com/yourusername/infinity-matrix)
- [Cloud Run Quotas & Limits](https://cloud.google.com/run/quotas)

---

## Next Steps After Deployment

1. **Monitor Performance**:
   - Set up Cloud Monitoring dashboards
   - Create alerts for anomalies
   - Track error rates and latency

2. **Optimize Costs**:
   - Review Cloud Billing
   - Adjust auto-scaling policies
   - Monitor API usage

3. **Enhance Security**:
   - Enable Cloud Armor DDoS protection
   - Set up VPC connectors if needed
   - Implement authentication/authorization

4. **Scale for Production**:
   - Load test the system
   - Set up regional failover
   - Plan disaster recovery

---

**Status**: 🟢 **READY FOR DEPLOYMENT**

Your Infinity-Matrix system is fully configured and verified for Google Cloud Run deployment with hybrid cloud-primary architecture.

**Estimated Time to Complete**: 15-30 minutes  
**Skill Level Required**: Intermediate (familiar with gcloud CLI and Docker)  
**Cost per Month**: ~$87 (baseline, scales with usage)
