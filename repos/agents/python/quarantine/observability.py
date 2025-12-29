from fastapi import APIRouter
from control.jobs import submit_job
import time
import random

router = APIRouter()

@router.get('/obs/metrics')
def metrics():
    # Simulate metrics
    return {
        "cpu": random.uniform(0, 100),
        "memory": random.uniform(0, 100),
        "jobs": random.randint(0, 1000),
        "timestamp": time.time(),
        "job_metrics": submit_job('obs.metrics', {})
    }

@router.get('/obs/tracing')
def tracing():
    # Simulate tracing info
    return {"trace_id": hex(random.getrandbits(64)), "spans": random.randint(1, 10)}

@router.get('/obs/logs')
def logs():
    # Simulate log streaming
    return {"logs": [f"log entry {i}" for i in range(10)]}

@router.get('/obs/billing')
def billing():
    return {"billing": random.uniform(0, 1000), "job_billing": submit_job('obs.billing', {})}

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/ready")
def ready():
    return {"ready": True}
