from memory.client import rehydrate_memory, write_memory
from vision_cortex.cortex import run_vision_cycle

def run_cycle():
    state = rehydrate_memory()

    context = {
        'signals': ['system', 'uptime', 'risk']
    }

    vision = run_vision_cycle(context)

    write_memory({
        'scope': 'system',
        'importance': 9,
        'confidence': 0.9,
        'content': {
            'agent': 'alpha-omega',
            'vision': vision
        }
    })

    return {'cycle': 'ok', 'vision': vision}
