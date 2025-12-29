## Cloud Service Account Setup

For full autonomous operation, set the following environment variable to your GCP service account key path:

```
export GOOGLE_APPLICATION_CREDENTIALS=/workspaces/infinity-xos/secrets/gcp_service_account.json
```

This key must have permissions for Storage Admin, Artifact Registry, and any other required GCP APIs.

All sync and bucket scripts will use this key for authentication.

## Automated Cloud Sync & Validation

The orchestrator will validate GCS, Docker, and GitHub connectivity at startup. All sync scripts are scheduled and monitored for errors.

## Cloud Run Deployment Status

See [CLOUD_RUN_STATUS.md](CLOUD_RUN_STATUS.md) for the latest deployment status and service URL.


# Infinity XOS Orchestrator

Enterprise-grade autonomous AI control plane.

---

## How to Run (Dev/Local)

```bash
uvicorn orchestrator.router:app --reload --host 0.0.0.0 --port 8080
```

## Main API Entrypoint

Use `orchestrator/router.py` as the main FastAPI app. The legacy `main.py` is deprecated and only for reference.

---

**Project Metadata**

- **Project Name:** Infinity X One Systems
- **Project Number:** 896380409704
- **Project ID:** infinity-x-one-systems
- **Service Account:** infinity-x-one-systems@appspot.gserviceaccount.com

---

## Crawler System (Max Capability)

The crawler subsystem is designed for maximum capability and extensibility:

- **Multi-source**: Crawl multiple URLs/APIs concurrently (see `system_manifest.yaml` > `crawler.sources`).
- **Multi-threaded**: Parallel crawling with configurable thread count (`max_threads`).
- **Headless/browser support**: Ready for browser-based crawling (Selenium/Playwright integration stubbed).
- **Plugin/extensible**: Supports custom plugins for post-processing, enrichment, or filtering.
- **AI-assisted**: Optional AI function can rewrite/expand sources or analyze content.
- **Observability**: Built-in hooks for logging, metrics, and error tracking.
- **Config-driven**: All options are controlled via `system_manifest.yaml`.
- **Integration**: Fully integrated with the autonomous loop and manifest system.

See `.infinity/quarantine/universal_crawler.py` for implementation details.

Example config in `system_manifest.yaml`:

```yaml
crawler:
  enabled: true
  interval_seconds: 60
  sources:
    - "https://example.com"
    - "https://news.ycombinator.com"
    - "https://github.com/trending"
  max_threads: 8
  headless: false
  plugins: []
  ai_assist: false
  observability: true
```

To extend, add plugins or AI hooks in `.infinity/quarantine/auto_loop.py` or via manifest config.
