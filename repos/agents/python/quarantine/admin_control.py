from fastapi import APIRouter
from control.manifest_loader import Manifest
from control.audit import audit_event
from control.jobs import submit_job
from plugins.loader import PluginLoader

router = APIRouter()
manifest = Manifest()
plugins = PluginLoader()

@router.get('/admin/observability')
def observability():
    audit_event('admin.obs.read', {})
    return submit_job('obs.read', {})

@router.post('/admin/autonomy/toggle')
def autonomy_toggle(payload: dict):
    audit_event('admin.autonomy.toggle', payload)
    return submit_job('autonomy.toggle', payload)

@router.get('/admin/plugins')
def list_plugins():
    return plugins.list()

@router.post('/admin/plugin/{plugin_id}/update')
def update_plugin(plugin_id: str, payload: dict):
    audit_event('admin.plugin.update', {'plugin_id': plugin_id, **payload})
    return submit_job('plugin.update', {'plugin_id': plugin_id, **payload})
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
