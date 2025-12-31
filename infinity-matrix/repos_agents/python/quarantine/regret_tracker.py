from datetime import datetime
from memory.client import MemoryClient

class RegretTracker:
    def __init__(self):
        self.memory = MemoryClient(collection='regret')

    def record(self, forecast: dict, outcome: dict):
        regret = abs(forecast.get('vertex_confidence', 0) - outcome.get('result', 0))
        self.memory.write({
            'timestamp': datetime.utcnow().isoformat(),
            'forecast': forecast,
            'outcome': outcome,
            'regret': regret
        })
