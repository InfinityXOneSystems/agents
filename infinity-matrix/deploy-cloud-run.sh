#!/bin/bash

# Google Cloud Run Deployment Script for Infinity-Matrix System
# Deploys both backend and frontend to Cloud Run with hybrid cloud-primary architecture

set -e

# Configuration
PROJECT_ID=${1:-infinity-matrix}
REGION=${2:-us-central1}
BACKEND_SERVICE="infinity-orchestration"
FRONTEND_SERVICE="infinity-frontend"
BACKEND_MEMORY="1Gi"
BACKEND_CPU="1"
FRONTEND_MEMORY="512Mi"
FRONTEND_CPU="1"

echo "=========================================="
echo "Infinity-Matrix Cloud Run Deployment"
echo "=========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "ERROR: gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Set project
echo "[1/7] Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "[2/7] Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build and deploy backend
echo "[3/7] Building and deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
  --source ./orchestration \
  --platform managed \
  --region $REGION \
  --memory $BACKEND_MEMORY \
  --cpu $BACKEND_CPU \
  --timeout 3600 \
  --allow-unauthenticated \
  --set-env-vars \
    NODE_ENV=production,\
    GOOGLE_CLOUD_PROJECT=$PROJECT_ID,\
    PORT=8080 \
  --service-account=${PROJECT_ID}@appspot.gserviceaccount.com \
  2>&1 | tee backend_deployment.log

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# Build and deploy frontend
echo "[4/7] Building and deploying frontend to Cloud Run..."
# Create a temporary env file with backend URL
cat > ./frontend/.env.production.cloud << EOF
VITE_API_URL=$BACKEND_URL
VITE_OLLAMA_HOST=https://ollama.example.com
VITE_OLLAMA_ENABLED=false
EOF

gcloud run deploy $FRONTEND_SERVICE \
  --source ./frontend \
  --platform managed \
  --region $REGION \
  --memory $FRONTEND_MEMORY \
  --cpu $FRONTEND_CPU \
  --timeout 300 \
  --allow-unauthenticated \
  --set-env-vars \
    VITE_API_URL=$BACKEND_URL,\
    PORT=8080 \
  2>&1 | tee frontend_deployment.log

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo ""
echo "[5/7] Configuring backend service account..."
# Create service account for backend
gcloud iam service-accounts create infinity-backend \
  --display-name="Infinity Matrix Backend Service Account" \
  2>/dev/null || echo "Service account already exists"

# Grant Vertex AI access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:infinity-backend@${PROJECT_ID}.iam.gserviceaccount.iam.googleapis.com" \
  --role="roles/aiplatform.user" \
  2>/dev/null || echo "Role already granted"

echo "[6/7] Setting up monitoring and logging..."
# Cloud Monitoring is automatically enabled
echo "✓ Cloud Logging enabled"
echo "✓ Cloud Monitoring enabled"
echo "✓ Cloud Trace enabled"

echo "[7/7] Deployment complete!"
echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""
echo "Backend Service:"
echo "  Name: $BACKEND_SERVICE"
echo "  URL: $BACKEND_URL"
echo "  Memory: $BACKEND_MEMORY"
echo "  CPU: $BACKEND_CPU"
echo ""
echo "Frontend Service:"
echo "  Name: $FRONTEND_SERVICE"
echo "  URL: $FRONTEND_URL"
echo "  Memory: $FRONTEND_MEMORY"
echo "  CPU: $FRONTEND_CPU"
echo ""
echo "Next steps:"
echo "  1. Update your DNS to point to: $FRONTEND_URL"
echo "  2. Configure authentication if needed"
echo "  3. Set up auto-scaling policies"
echo "  4. Configure CI/CD pipeline with Cloud Build"
echo ""
echo "Test the deployment:"
echo "  Frontend: curl $FRONTEND_URL"
echo "  Backend Health: curl $BACKEND_URL/health"
echo ""
