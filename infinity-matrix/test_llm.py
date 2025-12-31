import requests
import json

def test_llm():
    url = "https://infinityxai.com/api/llm"
    payload = {"prompt": "Explain the concept of AI orchestration."}
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        with open(".prooftest/llm_proof.json", "w") as f:
            f.write(response.text)
        print("LLM test passed. Response saved.")
        log_proof("LLM Test", "Passed")
    else:
        print("LLM test failed:", response.text)
        log_proof("LLM Test", "Failed: " + response.text)

def log_proof(action, result):
    log_entry = {"action": action, "result": result}
    with open(".prooftest/logs.json", "a") as log_file:
        log_file.write(json.dumps(log_entry) + "\n")

test_llm()