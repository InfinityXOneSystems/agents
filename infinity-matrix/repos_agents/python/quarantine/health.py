from fastapi import APIRouter
from control.state_model import SystemState

router = APIRouter()
CURRENT_STATE = SystemState.IDLE

@router.get('/health')
def health():
    return {'status': 'ok', 'state': CURRENT_STATE}

@router.get('/state')
def state():
    return {'state': CURRENT_STATE}
