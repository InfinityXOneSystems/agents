import os
import requests
from dotenv import load_dotenv

load_dotenv()
ADAPTER_URL = os.getenv('ADAPTER_URL', 'http://127.0.0.1:8080')


def generate(model: str, prompt: str, timeout: int = 60):
    url = f"{ADAPTER_URL}/generate"
    payload = {"model": model, "prompt": prompt, "timeout": timeout}
    resp = requests.post(url, json=payload, timeout=timeout + 5)
    resp.raise_for_status()
    return resp.json()


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python llm_client.py <model> "<prompt>"')
        sys.exit(2)
    model = sys.argv[1]
    prompt = sys.argv[2]
    print(generate(model, prompt))
