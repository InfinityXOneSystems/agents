from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import json

router = APIRouter()

@router.get('/', response_class=HTMLResponse)
def dashboard():
    try:
        with open('ledger/chain_ledger.jsonl','r') as f:
            rows = f.readlines()[-50:]
    except:
        rows = []

    items = '<br>'.join(rows)
    return f'''
    <html>
      <head><title>Infinity XOS Dashboard</title></head>
      <body>
        <h1>Infinity XOS – Investor & System Dashboard</h1>
        <pre>{items}</pre>
      </body>
    </html>
    '''
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
