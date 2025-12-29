from fastapi import FastAPI
from analysis.analyzer import analyze
from control.policy_engine import allow

app = FastAPI(title='Infinity XOS Control Plane', version='1.0')

@app.post('/command')
def command(cmd: dict):
    intent = cmd.get('intent','unknown')
    payload = cmd.get('payload',{})
    analysis = analyze(intent, payload)
    if not allow(intent, analysis):
        return {'status':'blocked','analysis':analysis}
    return {'status':'accepted','analysis':analysis,'payload':payload}

@app.get('/health')
def health():
    return {'status':'ok'}
