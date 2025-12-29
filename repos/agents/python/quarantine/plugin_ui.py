from fastapi import APIRouter
from plugins.loader import PluginLoader

router = APIRouter()
loader = PluginLoader()

@router.get('/ui/plugins')
def plugins():
    return loader.list()

@router.get('/ui/plugins/{pid}')
def plugin(pid: str):
    p = loader.get(pid)
    return p.get('ui', {})
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
