Sync Tests for Frontend ↔ Backend
================================

These tests validate that the frontend and backend are correctly wired. They check:
- `GET /health`
- CORS preflight for `/v1/chat`
- `POST /v1/chat` with the frontend token
- `GET /hostinger/ping`

How to run locally
------------------
1. Install dependencies:

```bash
cd parallel-upgrade/tests
npm install
```

2. Run the test (set env vars to override defaults):

```bash
ORCHESTRATOR_URL=https://orchestrator-896380409704.us-east1.run.app FRONTEND_TEST_TOKEN=tPLxWY7e8/... npm run test:sync
```

CI
- Add `ORCHESTRATOR_URL` and `FRONTEND_TEST_TOKEN` to the repository secrets and add a job that runs `npm ci && npm run test:sync`.
