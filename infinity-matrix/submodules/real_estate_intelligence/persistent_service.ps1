# Persistent Service Script for 24/7 Real Estate Intelligence Operation (Windows)
# Auto-restarts intelligence upgrade orchestrator if stopped

$script = "C:\AI\infinity-matrix\submodules\real_estate_intelligence\intelligence_upgrade.py"
while ($true) {
    Write-Host "[SERVICE] Starting Real Estate Intelligence Upgrade..."
    python $script
    Write-Host "[SERVICE] Intelligence Upgrade stopped. Restarting in 10 seconds..."
    Start-Sleep -Seconds 10
}
