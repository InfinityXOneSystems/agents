from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

# Add more endpoints for intelligence, memory, events, etc.
