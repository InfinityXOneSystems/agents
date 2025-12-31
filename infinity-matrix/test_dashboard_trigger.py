import requests

def test_dashboard_trigger():
    url = "https://infinityxai.com/api/dashboard-trigger"
    payload = {"action": "refresh", "target": "agent_status"}
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        with open(".prooftest/dashboard_trigger_proof.json", "w") as f:
            f.write(response.text)
        print("Dashboard trigger test passed. Backend updated.")
    else:
        print("Dashboard trigger test failed:", response.text)

test_dashboard_trigger()