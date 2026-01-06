# PowerShell script to deploy the application to Hostinger

param(
    [string]$SourcePath = "C:\AI\infinity-matrix\deploy.zip",
    [string]$DestinationPath = "~/app",
    [string]$Server = "infinityxai@infinityxai.com"
)

# Ensure script runs as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as an Administrator." -ForegroundColor Red
    exit
}

# Check if source file exists
if (-not (Test-Path $SourcePath)) {
    Write-Host "Source file not found: $SourcePath" -ForegroundColor Red
    exit 1
}

# Start deployment
Write-Host "Starting deployment..." -ForegroundColor Green
& scp "${SourcePath}" "${Server}:${DestinationPath}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during file upload." -ForegroundColor Red
    exit 1
}

& ssh ${Server} "unzip -o ${DestinationPath}/deploy.zip -d ${DestinationPath} && rm ${DestinationPath}/deploy.zip"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during file extraction." -ForegroundColor Red
    exit 1
}

& ssh ${Server} "mv ${DestinationPath}/frontend/admin ${DestinationPath}/admin && pm2 restart all"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error restarting services." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green