from datetime import datetime

class AgentSpawner:
    def spawn(self, role: str):
        return {
            "agent_id": f"{role}-{datetime.utcnow().isoformat()}",
            "status": "SPAWNED",
            "governed": True
        }
