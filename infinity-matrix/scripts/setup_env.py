# Environment Setup Script

import os

def setup_environment():
    """Sets up the environment variables for the Infinity-Matrix system."""
    os.environ['API_GATEWAY_URL'] = 'http://localhost:8000'
    os.environ['LOG_LEVEL'] = 'INFO'
    print("Environment variables set up successfully.")

if __name__ == "__main__":
    setup_environment()