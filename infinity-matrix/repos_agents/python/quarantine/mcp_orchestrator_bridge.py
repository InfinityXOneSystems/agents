import requests
import uuid
import time

def mcp_system_execute(arguments, rpc_id):
    """
    arguments = {
        "action": "system.proof.demo_run",
        "target": "orchestrator",
        "payload": {...},
        "mode": "EXECUTE" | "DRY_RUN"
    }
    """
    ORCHESTRATOR_EXECUTE_URL = "https://orchestrator-896380409704.us-east1.run.app/execute"
    run_id = arguments.get("run_id") or f"RUN-{uuid.uuid4()}"
    envelope = {
        "run_id": run_id,
        "origin": "MCP",
        "timestamp": int(time.time()),
        "action": arguments["action"],
        "target": arguments.get("target", "orchestrator"),
        "mode": arguments.get("mode", "EXECUTE"),
        "payload": arguments.get("payload", {}),
        "audit": {
            "requested_by": "gpt",
            "surface": "mcp.system.execute"
        }
    }
    try:
        r = requests.post(
            ORCHESTRATOR_EXECUTE_URL,
            json=envelope,
            timeout=90
        )
        r.raise_for_status()
        result = r.json()
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {
                "code": -32000,
                "message": "ORCHESTRATOR_EXECUTION_FAILED",
                "details": str(e)
            }
        }
    return {
        "jsonrpc": "2.0",
        "id": rpc_id,
        "result": {
            "run_id": run_id,
            "orchestrator_response": result
        }
    }
