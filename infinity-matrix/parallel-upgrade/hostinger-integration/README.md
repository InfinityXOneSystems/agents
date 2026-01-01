Hostinger Integration Guide
===========================

Purpose
-------
This folder contains a minimal front-end snippet and instructions to integrate the Infinity-Matrix orchestrator with a Hostinger-hosted frontend preview (or production site). It is intentionally non-invasive — nothing in the main repo is changed.

Quick goals
-----------
- Provide a small client-side snippet that Hostinger can inject into a preview page
- Explain required environment/secret configuration on Hostinger
- Show how to validate connectivity and rotate the demo token

Required pieces
---------------
- Cloud Run orchestrator URL (example): https://orchestrator-896380409704.us-east1.run.app
-- FRONTEND_ACCESS_TOKEN — demo token is stored in `credentials/frontend_access_token.txt` (development only).
- Allowed origins on backend: set `ALLOWED_ORIGINS` environment variable on Cloud Run to include Hostinger preview URL(s)

Hostinger setup (what the Hostinger dev does)
--------------------------------------------
1. Add a runtime secret named `FRONTEND_ACCESS_TOKEN` in Hostinger's control panel and set it to the demo token (see `credentials/frontend_access_token.txt`) or your own secret.
2. Edit the page template where you'd like the widget to appear and paste the `hostinger-snippet.js` contents or include it as an external script.
3. Ensure any preview domain shown by Hostinger is included in the Cloud Run `ALLOWED_ORIGINS` (comma-separated). If ALLOWED_ORIGINS is blank, the orchestrator heuristically allows common Hostinger preview origins.
4. Test the widget in preview mode.

Security note
-------------
- Do not hard-code the token into HTML for production. Use Hostinger's secrets or server-side injection to keep the token hidden. The demo token is for development only — rotate it after testing.

Validation & troubleshooting
---------------------------
- Use `/hostinger/ping` on the orchestrator to verify the backend sees requests and headers. Example:

  curl -H "Authorization: Bearer $FRONTEND_ACCESS_TOKEN" \
    https://orchestrator-896380409704.us-east1.run.app/hostinger/ping

- If Hostinger reports "Failed to fetch":
  - Confirm the preview domain is allowed in `ALLOWED_ORIGINS` set in Cloud Run.
  - If using Hostinger preview, expose the page URL to the internet and ensure it resolves.
  - Use ngrok to tunnel local dev to Hostinger preview for debugging.

CI & integration
----------------
- Add repository secrets `ORCHESTRATOR_URL` and `FRONTEND_TEST_TOKEN` in GitHub to enable `integration-orchestrator.yml`.
- The CI job will run `npm run test:integration:orchestrator` which uses the provided URL and token.

Token rotation
--------------
 - Use the existing `rotate_demo_token.ps1` script in the repo to generate a new token. Update Cloud Run env and Hostinger secret after rotation. Consider rotating the token now and removing it from the repo for production.

Files
-----
- `hostinger-snippet.js` — client snippet to call the orchestrator endpoints
- `hostinger-widget.html` — minimal HTML example showing how to inject the snippet and render a UI

If you want, I can:
- prepare a small static bundle you can upload to Hostinger,
- attempt to run an integration test from here against your orchestrator (I already ran health checks), or
- help automate token rotation and CI secret updates.
