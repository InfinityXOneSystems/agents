import requests

def test_agent_builder():
    url = "https://infinityxai.com/api/agent-builder"
    payload = {
        "blueprint": {
            "name": "Test Agent",
            "tasks": ["Task 1", "Task 2"]
        }
    }
    response = requests.post(url, json=payload)

    if response.status_code == 201:
        with open(".prooftest/agent_builder_proof.json", "w") as f:
            f.write(response.text)
        print("Agent builder test passed. Blueprint deployed.")
    else:
        print("Agent builder test failed:", response.text)

test_agent_builder()