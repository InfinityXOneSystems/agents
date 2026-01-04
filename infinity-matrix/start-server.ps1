#!/usr/bin/env pwsh
# Simple Server Starter - Just Works™

Write-Host "`n🚀 Starting Infinity Matrix Backend...`n" -ForegroundColor Cyan

# Navigate to backend
Set-Location "C:\AI\infinity-matrix\backend\admin-server"

# Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Start server
Write-Host "✅ Starting server on port 4000...`n" -ForegroundColor Green
node index.js
