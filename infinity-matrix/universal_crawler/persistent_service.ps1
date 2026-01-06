# Persistent Service Script for 24/7 Operation (Windows)
# Auto-restarts crawler/orchestrator if stopped

$script = "C:\AI\infinity-matrix\universal_crawler\crawler.py"
while ($true) {
    Write-Host "[SERVICE] Starting Universal Crawler..."
    python $script
    Write-Host "[SERVICE] Universal Crawler stopped. Restarting in 10 seconds..."
    Start-Sleep -Seconds 10
}
