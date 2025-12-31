from fastapi import APIRouter, Request

router = APIRouter()

@router.post('/telemetry')
async def telemetry(payload: dict):
    return {'status': 'received', 'payload': payload}

@router.post('/system-state')
async def system_state(payload: dict):
    return {'status': 'state_ingested'}

@router.post('/register-subsystem')
async def register_subsystem(payload: dict):
    return {'status': 'registered', 'subsystem': payload}

@router.post('/run-validation')
async def run_validation():
    return {'status': 'validation_started'}
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
