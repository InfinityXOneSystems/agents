from datetime import datetime

class DecisionLogger:
    def __init__(self, memory_client):
        self.memory = memory_client

    def log(self, decision: dict):
        decision['timestamp'] = datetime.utcnow().isoformat()
        self.memory.write(decision)
