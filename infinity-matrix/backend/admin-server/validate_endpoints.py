import unittest
import requests

class TestAPIEndpoints(unittest.TestCase):

    BASE_URL = "http://localhost:4000"
    TOKEN = "your_access_token_here"

    endpoints = [
        {"method": "POST", "url": f"{BASE_URL}/api/auth", "headers": {"Authorization": f"Bearer {TOKEN}"}, "json": {"username": "admin", "password": "admin123"}},
        {"method": "GET", "url": f"{BASE_URL}/api/users", "headers": {"Authorization": f"Bearer {TOKEN}"}},
        {"method": "GET", "url": f"{BASE_URL}/api/agents", "headers": {"Authorization": f"Bearer {TOKEN}"}},
        {"method": "GET", "url": f"{BASE_URL}/api/chat", "headers": {"Authorization": f"Bearer {TOKEN}"}},
        {"method": "GET", "url": f"{BASE_URL}/api/swarm"},
        {"method": "GET", "url": f"{BASE_URL}/api/admin", "headers": {"Authorization": f"Bearer {TOKEN}"}},
        {"method": "GET", "url": f"{BASE_URL}/api/investor"},
        {"method": "GET", "url": f"{BASE_URL}/api/vision-cortex"},
        {"method": "GET", "url": f"{BASE_URL}/intelligence"},
        {"method": "GET", "url": f"{BASE_URL}/api/scraper"},
        {"method": "GET", "url": f"{BASE_URL}/api/gcp"},
        {"method": "GET", "url": f"{BASE_URL}/api/workspace"},
        {"method": "POST", "url": f"{BASE_URL}/api/manus/scrape", "headers": {"Authorization": f"Bearer {TOKEN}"}, "json": {"data": "test"}},
    ]

    def test_endpoints(self):
        for endpoint in self.endpoints:
            with self.subTest(url=endpoint['url']):
                try:
                    if endpoint["method"] == "GET":
                        response = requests.get(endpoint["url"], headers=endpoint.get("headers"))
                    elif endpoint["method"] == "POST":
                        response = requests.post(endpoint["url"], json=endpoint.get("json"), headers=endpoint.get("headers"))
                    else:
                        self.fail(f"Unsupported method: {endpoint['method']}")

                    self.assertEqual(response.status_code, 200, f"Failed at {endpoint['url']} with status {response.status_code}")
                except Exception as e:
                    self.fail(f"Exception occurred for {endpoint['url']}: {e}")

if __name__ == "__main__":
    unittest.main()