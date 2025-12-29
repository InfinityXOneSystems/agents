import requests
from registry.services import SERVICES

def health_check():
    for name, base in SERVICES.items():
        try:
            r = requests.get(base + "/health", timeout=3)
            if r.status_code != 200:
                print(f"[HEAL] {name} unhealthy")
        except Exception:
            print(f"[HEAL] {name} unreachable")
