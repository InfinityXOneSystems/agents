from services.guardian.agent import GuardianAgent

guardian = GuardianAgent()

@app.middleware("http")
async def guardian_middleware(request, call_next):
    guardian.validate(request)
    response = await call_next(request)
    return response
