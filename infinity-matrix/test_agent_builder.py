import pytest
import requests
from unittest.mock import patch

@pytest.fixture
def mock_post():
    with patch("requests.post") as mock:
        yield mock

def test_agent_builder(mock_post):
    url = "https://infinityxai.com/api/agent-builder"
    payload = {
        "blueprint": {
            "name": "Test Agent",
            "tasks": ["Task 1", "Task 2"]
        }
    }

    # Mock response
    mock_post.return_value.status_code = 201
    mock_post.return_value.text = "{\"message\": \"Blueprint deployed successfully.\"}"

    response = requests.post(url, json=payload)

    assert response.status_code == 201
    assert response.text == "{\"message\": \"Blueprint deployed successfully.\"}"

    with open(".prooftest/agent_builder_proof.json", "w") as f:
        f.write(response.text)