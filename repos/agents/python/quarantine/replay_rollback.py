import requests

def replay_run(run_id, orchestrator_url):
    """
    Request a replay of a previous run from the orchestrator.
    """
    r = requests.post(f"{orchestrator_url}/replay", json={"run_id": run_id})
    r.raise_for_status()
    return r.json()

def rollback_run(run_id, orchestrator_url):
    """
    Request a rollback of a previous run from the orchestrator.
    """
    r = requests.post(f"{orchestrator_url}/rollback", json={"run_id": run_id})
    r.raise_for_status()
    return r.json()

# Example usage:
if __name__ == "__main__":
    orchestrator_url = "https://orchestrator-896380409704.us-east1.run.app"
    print(replay_run("RUN-123", orchestrator_url))
    print(rollback_run("RUN-123", orchestrator_url))
