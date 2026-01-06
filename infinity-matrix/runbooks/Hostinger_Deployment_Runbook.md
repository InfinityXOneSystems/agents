# Hostinger Deployment Runbook

## Overview
This runbook provides step-by-step instructions for deploying the Infinity-Matrix system to Hostinger.

---

## Prerequisites
1. Ensure the following tools are installed:
   - Node.js
   - Python (configured in `.venv`)
   - PowerShell
2. Verify the following environment variables are set:
   - `HOSTINGER_API_KEY`
   - `GOOGLE_APPLICATION_CREDENTIALS`
3. Ensure the `start_system.ps1` script is available.

---

## Deployment Steps

### 1. Sync Files to Hostinger
1. Run the following command to sync files:
   ```bash
   node ./scripts/sync-hostinger.js push
   ```
2. Verify the sync status:
   ```bash
   curl http://localhost:3000/api/hostinger/status
   ```

### 2. Deploy the System
1. Execute the deployment script:
   ```powershell
   .\deploy-with-python.ps1
   ```
2. Verify the deployment:
   ```bash
   curl http://localhost:3000/hostinger/info
   ```

---

## Troubleshooting

### Common Issues
1. **Sync Failure**:
   - Check the `sync-hostinger.js` logs for errors.
   - Ensure the Hostinger API key is valid.

2. **Deployment Failure**:
   - Verify the `deploy-with-python.ps1` script dependencies.
   - Check network connectivity.

3. **Health Check Failure**:
   - Restart the system:
     ```powershell
     .\start_system.ps1
     ```
   - Verify the `/health` endpoint.

---

## Next Steps
1. Visit the admin panel:
   ```
   http://localhost:3000/admin
   ```
2. Use the `/admin` panel to manage the website.
3. Monitor health metrics via `/api/health/full`.

---

## Contacts
- **DevOps Team**: devops@infinityxone.com
- **Support**: support@infinityxone.com