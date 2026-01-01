from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import subprocess
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Ollama Adapter")


class GenerateRequest(BaseModel):
    model: str
    prompt: str
    timeout: int = 60


class GenerateResponse(BaseModel):
    model: str
    prompt: str
    output: str
    stderr: str | None = None
    returncode: int
    duration_ms: int


OLLAMA_PATH = os.getenv("OLLAMA_PATH", "ollama")


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    start = time.time()
    cmd = [OLLAMA_PATH, "run", req.model, req.prompt]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=req.timeout)
    except subprocess.TimeoutExpired as e:
        raise HTTPException(status_code=504, detail="Model timed out")

    duration_ms = int((time.time() - start) * 1000)
    output = proc.stdout.strip()
    stderr = proc.stderr.strip() if proc.stderr else None

    return GenerateResponse(
        model=req.model,
        prompt=req.prompt,
        output=output,
        stderr=stderr,
        returncode=proc.returncode,
        duration_ms=duration_ms,
    )
