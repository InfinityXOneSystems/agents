
from fastapi import APIRouter, Request
from control.manifest_loader import Manifest
from planner.core import PlannerCore
from executor.core import ExecutorCore
import os
import json

router = APIRouter()
manifest = Manifest()
planner = PlannerCore()
executor = ExecutorCore()

@router.post('/gpt/objective')
def inject_objective(payload: dict):
    if not manifest.enabled('gpt_bridge.enabled'):
        return {'error': 'GPT bridge disabled'}
    plan = planner.plan(payload.get('objective'))
    executor.execute(plan)
    return {'status': 'executed'}

# Advanced: Dynamic prompt injection
@router.post('/gpt/prompt')
def inject_prompt(payload: dict):
    prompt = payload.get('prompt')
    # Store or process prompt as needed
    return {'status': 'prompt_received', 'prompt': prompt}

# Advanced: Multi-turn conversation
@router.post('/gpt/conversation')
def conversation(payload: dict):
    history = payload.get('history', [])
    user_input = payload.get('input')
    # Simulate or call GPT for next response
    response = f"Echo: {user_input}"
    return {'response': response, 'history': history + [user_input]}

# Advanced: Tool-use orchestration
@router.post('/gpt/tool')
def tool_use(payload: dict):
    tool = payload.get('tool')
    args = payload.get('args', {})
    # Simulate tool execution
    result = f"Tool {tool} executed with args {args}"
    return {'result': result}

# Advanced: Workspace/code access
@router.post('/gpt/workspace/read')
def workspace_read(payload: dict):
    path = payload.get('path')
    try:
        with open(path, 'r') as f:
            content = f.read()
        return {'content': content}
    except Exception as e:
        return {'error': str(e)}

@router.post('/gpt/workspace/write')
def workspace_write(payload: dict):
    path = payload.get('path')
    content = payload.get('content', '')
    try:
        with open(path, 'w') as f:
            f.write(content)
        return {'status': 'written', 'path': path}
    except Exception as e:
        return {'error': str(e)}

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/ready")
def ready():
    return {"ready": True}
