"""
AUTO Command Grammar for Natural Language → Action Mapping
"""
import re

def parse_natural_language_command(text):
    """
    Parse a natural language command into an action, target, and payload.
    Example: "Sync the repo now" → {action: "repo.sync", target: "repo", payload: {}}
    """
    text = text.lower().strip()
    if "sync" in text and "repo" in text:
        return {"action": "repo.sync", "target": "repo", "payload": {}}
    if "commit" in text and "repo" in text:
        return {"action": "repo.commit", "target": "repo", "payload": {}}
    if "trigger ci" in text or "run ci" in text:
        return {"action": "ci.trigger", "target": "ci", "payload": {}}
    if "proof" in text:
        return {"action": "system.proof", "target": "orchestrator", "payload": {}}
    # Add more mappings as needed
    return {"action": "unknown", "target": None, "payload": {"original": text}}

# Example usage:
if __name__ == "__main__":
    print(parse_natural_language_command("Sync the repo now"))
    print(parse_natural_language_command("Trigger CI"))
    print(parse_natural_language_command("Give me a proof"))
