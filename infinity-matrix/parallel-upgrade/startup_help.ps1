<#
Non-invasive helper: prints recommended local startup and diagnostics commands.
Run this script to get copy-paste commands for starting services and checking Hostinger reachability.
#>

Write-Host "=== Infinity-Matrix Local Diagnostics Helper ==="
Write-Host "1) Verify Ollama binary"
Write-Host "   `& 'C:\Users\<you>\AppData\Local\Programs\Ollama\ollama.exe' -v`"
Write-Host "2) Sign in to Ollama (if needed)"
Write-Host "   `& 'C:\Users\<you>\AppData\Local\Programs\Ollama\ollama.exe' signin`"
Write-Host "3) Pull a model (replace <slug>)"
Write-Host "   `& 'C:\Users\<you>\AppData\Local\Programs\Ollama\ollama.exe' pull <slug>`"
Write-Host "4) Start the orchestrator in dev mode"
Write-Host "   cd c:\AI\infinity-matrix\orchestration; npm run dev"
Write-Host "5) Ping Hostinger diagnostics endpoint (local)"
Write-Host "   curl http://127.0.0.1:3001/hostinger/ping"
Write-Host "6) If you need external exposure, use ngrok: ngrok http 3001"

Write-Host "
If you want me to run any of these commands, tell me which one and I'll prepare a safe, explicit script.
"
