import unittest
import requests

class MetaTestValidator(unittest.TestCase):

    BASE_URL = "http://localhost:4000"

    def test_health_endpoint(self):
        """Validate the /health endpoint."""
        response = requests.get(f"{self.BASE_URL}/health")
        self.assertEqual(response.status_code, 200, "Health endpoint validation failed.")
        self.assertIn("healthy", response.text, "Health endpoint did not return 'healthy'.")

    def test_sync_endpoint(self):
        """Validate the /sync endpoint with a mock payload."""
        payload = {"key": "value"}
        response = requests.post(
            f"{self.BASE_URL}/api/vision-cortex/sync",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 200, "Sync endpoint validation failed.")
        self.assertIn("success", response.text, "Sync endpoint did not return 'success'.")

if __name__ == '__main__':
    unittest.main()