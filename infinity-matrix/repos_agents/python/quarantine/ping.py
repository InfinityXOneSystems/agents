import os, requests

def ping():
    key = os.getenv("HOSTINGER_API_KEY")
    if not key:
        return False, "NO_KEY"

    r = requests.get(
        "https://api.hostinger.com/v1/account",
        headers={"Authorization": f"Bearer {key}"}
    )
    return r.status_code == 200, r.text
