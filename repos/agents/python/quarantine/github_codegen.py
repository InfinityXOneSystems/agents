from fastapi import APIRouter
from control.audit import audit_event
from control.manifest_loader import Manifest
from control.jobs import submit_job

router = APIRouter()
manifest = Manifest()

@router.post('/admin/code/edit')
def gpt_edit_code(payload: dict):
    if not manifest.enabled('permissions.github.repos'):
        return {'error': 'GitHub edits disabled'}
    audit_event('admin.code.edit', payload)
    return submit_job('github.codegen', payload)
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
