import requests

def test_sync_endpoint():
    jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.D_8h7mp3BUaYQutTXKIjaWK0VwFEvO0bHXxRFe1fF7A"
    headers = {"Authorization": f"Bearer {jwt_token}"}
    response = requests.get("https://infinityxai.com/api/sync", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("Sync endpoint test passed.")