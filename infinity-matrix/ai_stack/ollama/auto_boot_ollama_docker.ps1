# Auto Boot Ollama Docker
# Usage: Run as Administrator or with Docker permissions


$containerName = "ollama"
$imageName = "ollama/ollama:latest"
$port = 11434
# Optional: Set model mount path via environment variable
$modelMount = $env:OLLAMA_MODEL_MOUNT
if (-not $modelMount) { $modelMount = "" }

Write-Host "[Ollama] Checking for existing container..."
$existing = docker ps -a --filter "name=$containerName" --format "{{.ID}}"

if ($existing) {
    Write-Host "[Ollama] Stopping and removing existing container..."
    docker stop $containerName
    docker rm $containerName
}

Write-Host "[Ollama] Pulling latest image..."
docker pull $imageName


Write-Host "[Ollama] Starting Ollama container..."
if ($modelMount -ne "") {
    $runCmd = "docker run -d --name $containerName --restart unless-stopped -p ${port}:11434 -v ${modelMount}:/models $imageName"
} else {
    $runCmd = "docker run -d --name $containerName --restart unless-stopped -p ${port}:11434 $imageName"
}
Write-Host "[Ollama] Docker run command: $runCmd"
Invoke-Expression $runCmd


Write-Host "[Ollama] Waiting for API to be available..."
Start-Sleep -Seconds 5
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/api/tags" -TimeoutSec 10
} catch {}

if ($response -and $response.StatusCode -eq 200) {
    Write-Host "[Ollama] Ollama Docker is running and API is available at http://localhost:$port"
} else {
    Write-Host "[Ollama] ERROR: Ollama API not available. Printing last 20 lines of container logs:"
    docker logs --tail 20 $containerName
}
