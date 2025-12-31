import requests
from registry.services import SERVICES
from analysis.analyzer import analyze

COMMANDS = {
    "memory.write": {"service": "memory", "path": "/memory/execute"},
    "memory.rehydrate": {"service": "memory", "path": "/memory/execute"},
    "intelligence.ingest": {"service": "intelligence", "path": "/intelligence/execute"},
    "intelligence.discover": {"service": "intelligence", "path": "/intelligence/execute"}
}

def dispatch(command: dict):
    intent = command.get("intent")
    payload = command.get("payload", {})

    analysis = analyze(intent, payload)
    if analysis["decision"] == "block":
        return {
            "status": "blocked",
            "intent": intent,
            "analysis": analysis
        }

    if intent not in COMMANDS:
        return {
            "status": "error",
            "reason": f"Unknown intent: {intent}",
            "analysis": analysis
        }

    cfg = COMMANDS[intent]
    url = SERVICES[cfg["service"]] + cfg["path"]

    r = requests.post(url, json=payload, timeout=30)

    return {
        "status": "ok",
        "intent": intent,
        "analysis": analysis,
        "response": r.json()
    }
