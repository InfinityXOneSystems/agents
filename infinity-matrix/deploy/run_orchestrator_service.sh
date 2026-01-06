#!/bin/bash
# Persistent background service for agent orchestrator
while true; do
  echo "[Orchestrator] Starting agent orchestration cycle..."
  python3 api/orchestrator.py
  echo "[Orchestrator] Cycle complete. Sleeping for 60 seconds."
  sleep 60
done
