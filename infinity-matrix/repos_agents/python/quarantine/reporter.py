import requests
import datetime

ORCH_URL = "https://orchestrator-896380409704.us-east1.run.app"

def report(subsystem, healthy, **kwargs):
    payload = {
        "subsystem": subsystem,
        "healthy": healthy,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "details": kwargs
    }
    requests.post(f"{ORCH_URL}/telemetry", json=payload)
