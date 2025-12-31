from memory.client import write_memory

def document(scope: str, content: dict):
    write_memory({
        'scope': scope,
        'importance': 7,
        'confidence': 0.85,
        'content': content,
        'tags': ['vision-cortex']
    })
