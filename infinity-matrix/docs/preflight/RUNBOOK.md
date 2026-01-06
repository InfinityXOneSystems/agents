# Preflight Runbook

## When a Gate Fails
- Review the summary.md and report.json in artifacts/preflight/
- See below for common issues and fixes.

### Governance
- CODEOWNERS missing: Add .github/CODEOWNERS

### Local Quality
- Lint/typecheck/test fail: Run `npm run lint`, `npm run typecheck`, `npm test` or Python equivalents

### Security
- gitleaks/pip-audit missing: Install via tools/install-tools.ps1

### Container
- Docker build fails: Check Dockerfile and context

### Terraform
- Plan/validate fails: Check .tf files and credentials

### GCP
- Env vars missing: Set PROJECT_ID, REGION, etc.

### Observability
- Runbook/dashboard missing: Add docs/ops/runbook.md, docs/ops/dashboard.md

### Product Flows
- Route/config missing: Check frontend/src/router/index.js and manifests

### Hostinger/Frontend
- Build/E2E fail: Check npm run build, Playwright, Lighthouse
