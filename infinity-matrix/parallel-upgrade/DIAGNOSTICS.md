Diagnostics and quick-start for local services and Hostinger connectivity

This document lists non-invasive steps to verify and start the pieces required for Hostinger <-> backend connectivity and Ollama availability.

1) Ensure Ollama CLI is installed and accessible
   - On Windows the binary is commonly at: C:\Users\<you>\AppData\Local\Programs\Ollama\ollama.exe
   - Run: `ollama -v` or use the full path to verify.

2) Sign in to Ollama (for cloud models)
   - `ollama signin` will print a URL. Open it in a browser and complete the flow.

3) Pull or run a model locally
   - `ollama pull <exact-slug>` then `ollama run <slug> 'Hello'`

4) Use the included adapter if you prefer a local HTTP proxy (parallel-upgrade/ollama-adapter)

5) Start the orchestrator (non-invasive; dev mode recommended)
   - cd orchestration
   - npm run dev
   - Service listens on PORT environment variable (default 3001)

6) Hostinger ping endpoint
   - We added `/hostinger/ping` to the orchestrator to help external services validate reachability.
   - Example: `curl http://<your-host>:3001/hostinger/ping`

7) Use ngrok or similar to expose local ports to the internet for Hostinger webhooks
   - `ngrok http 3001` will provide a public URL that Hostinger can reach.

Notes
 - These steps are intentionally non-invasive. No core files were modified except adding a small diagnostics endpoint.
 - If you want, I can create PowerShell scripts to run these steps for you.
