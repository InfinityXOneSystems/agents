Vision Cortex (scaffold)
=========================

This is a minimal scaffold for the Vision Cortex microservice.

Features
- POST /vision/analyze - accepts JSON { image_base64: string } and returns a mock analysis
- POST /vision/describe - accepts JSON { image_base64: string } and returns a short caption

Run locally (development)

```bash
cd parallel-upgrade/vision-cortex
npm install
npm start
```

Docker

```bash
docker build -t vision-cortex:local .
docker run -p 4001:4001 vision-cortex:local
```

Integration
- The service is intended to call the local Ollama adapter or the orchestrator `/vertex/generate` endpoint for more advanced processing. For now it returns a deterministic mock response to validate wiring.
