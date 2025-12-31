import requests

def test_login():
    url = "https://infinityxai.com/api/login"
    payload = {"username": "test_user", "password": "secure_password"}
    response = requests.post(url, json=payload)

    if response.status_code == 200 and "session" in response.cookies:
        with open(".prooftest/login_proof.json", "w") as f:
            f.write(response.text)
        print("Login test passed. Session cookie saved.")
    else:
        print("Login test failed:", response.text)

test_login()