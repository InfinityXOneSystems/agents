from fastapi import FastAPI, Request
from services.guardian.agent import GuardianAgent


# DEPRECATED: Echo Voice AI is deprecated. Use Atlas/Infinity-XOS as canonical system.

guardian = GuardianAgent()

@app.post("/twilio/voice")
async def inbound_call(request: Request):
    guardian.validate(request)
    return {"status": "accepted"}

@app.post("/twilio/sms")
async def inbound_sms(request: Request):
    guardian.validate(request)
    return {"status": "accepted"}
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
