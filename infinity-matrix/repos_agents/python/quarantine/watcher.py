from memory.client import write_memory

def record_event(chain, address, event):
    write_memory({
        "scope": "crypto_events",
        "importance": 7,
        "confidence": 0.8,
        "content": {
            "chain": chain,
            "address": address,
            "event": event
        },
        "tags": ["crypto","event"]
    })
