# Integration notes

Call the adapter from your backend using a simple HTTP POST to `/generate`.

Example Python client (requests):

```python
import requests

url = 'http://127.0.0.1:8080/generate'
payload = {
    'model': 'philschmid/phi-3',
    'prompt': 'Summarize: The quick brown fox',
    'timeout': 60
}

resp = requests.post(url, json=payload, timeout=70)
print(resp.status_code)
print(resp.json())
```

Add this adapter as an LLM provider in `infinity-matrix` by configuring an HTTP LLM client that sends requests to the adapter. Keep the adapter running in `parallel-upgrade` so you don't modify the main repo.
