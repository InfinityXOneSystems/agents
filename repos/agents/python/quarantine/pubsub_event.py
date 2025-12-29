import requests

def emit_pubsub_event(topic, message, pubsub_url):
    """
    Emit an event to a Pub/Sub topic via orchestrator or event bus.
    """
    payload = {"topic": topic, "message": message}
    r = requests.post(pubsub_url, json=payload)
    r.raise_for_status()
    return r.json()

# Example usage:
if __name__ == "__main__":
    pubsub_url = "https://orchestrator-896380409704.us-east1.run.app/pubsub"
    print(emit_pubsub_event("system.events", {"event": "run.completed", "run_id": "RUN-123"}, pubsub_url))
