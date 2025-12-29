from fastapi import APIRouter
from services.guardian.agent import GuardianAgent

guardian = GuardianAgent()
from datetime import datetime


# DEPRECATED: Echo endpoints are deprecated. Use Atlas/Infinity-XOS endpoints.

@router.post("/bootstrap")
async def echo_bootstrap(state: dict):
    return {
        "status": "ECHO_BOOTSTRAPPED",
        "timestamp": datetime.utcnow().isoformat(),
        "keys": list(state.keys())
    }

@router.post("/tick")
async def echo_tick(payload: dict):
    assert guardian.validate("echo_tick"), "Guardian blocked execution"
    return {
        "status": "ECHO_TICK_ACCEPTED",
        "decision": "ECHO_PLANS_NEXT"
    }


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
