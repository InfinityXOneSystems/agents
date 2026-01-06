# Preflight Checklist System

## How to Run

- **Locally (PowerShell 7+):**
  ```powershell
  ./preflight.ps1 --mode offline|auth|ci --changedOnly --format json|md|both --outDir ./artifacts/preflight/ --failOn warn|error
  ```
- **In CI (GitHub Actions):**
  See `.github/workflows/preflight.yml`.

## Gates
- 00-governance: PR metadata, CODEOWNERS, branch protection
- 10-local-quality: Lint, typecheck, unit tests (Node/Python)
- 20-security: Secret scan, dep audit, SBOM
- 30-container: Docker build, image scan, SBOM
- 40-terraform: Fmt, validate, plan, policy-as-code
- 50-gcp: Cloud checks (auth mode)
- 60-observability: Otel/logging/metrics, runbooks
- 70-product-flows: /predict, /simulate, onboarding, nav, profit engine
- 80-hostinger-frontend: Build, E2E, perf, env wiring

## Troubleshooting
- See RUNBOOK.md for common failures and fixes.
