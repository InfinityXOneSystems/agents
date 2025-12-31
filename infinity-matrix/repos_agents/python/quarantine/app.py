from fastapi import FastAPI
from api.health import router as health_router

app = FastAPI(title='Infinity XOS')

app.include_router(health_router)

from api.heartbeat import router as heartbeat_router

app.include_router(heartbeat_router)

from api.heartbeat import router as heartbeat_router

app.include_router(heartbeat_router)

from api.heartbeat import router as heartbeat_router

app.include_router(heartbeat_router)
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
