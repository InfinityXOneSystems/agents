import requests
from config import MEMORY_GATEWAY_URL

def write_memory(payload: dict):
    requests.post(
        MEMORY_GATEWAY_URL + "/memory/execute",
        json=payload,
        timeout=15
    )

def rehydrate_memory():
    r = requests.post(
        MEMORY_GATEWAY_URL + "/memory/execute",
        json={"memory_op": "rehydrate"},
        timeout=15
    )
    return r.json()
