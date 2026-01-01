# Ollama HTTP Adapter (parallel-upgrade)

Lightweight FastAPI adapter that proxies HTTP requests to the local `ollama` CLI. Designed to be non-invasive and run separately from `infinity-matrix`.

Usage

- Configure `OLLAMA_PATH` in `.env` or set the environment variable to your `ollama` binary path (default `ollama`).
- Start locally:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\\Scripts\\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

- Or build with Docker and start with Docker Compose:

```bash
docker compose up --build -d
```

Endpoints

- POST /generate
  - Request JSON: { "model": "model-slug", "prompt": "text", "timeout": 60 }
  - Response JSON: { "model", "prompt", "output", "stderr", "returncode", "duration_ms" }

Notes

- This adapter shells out to the `ollama` binary. Set `OLLAMA_PATH` in the environment if `ollama` is not on PATH.
- The adapter is intentionally minimal; for production add authentication, rate-limiting, and concurrency controls.
