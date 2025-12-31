"""HostingerAgent implementation - Real Hostinger API Integration."""

import json
import os
import requests
import logging
from typing import Optional, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HostingerAgent:
    """Real Hostinger API agent with live credential support."""
    
    BASE_URL = "https://api.hostinger.com/v1"
    
    def __init__(self):
        """Initialize Hostinger agent with real API key."""
        self.api_key = self.load_api_key()
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })
        self.account_info = None

    def load_api_key(self) -> str:
        """Load the API key for Hostinger from credentials file."""
        creds_path = os.path.join(os.path.dirname(__file__), '..', '..', 'credentials', 'hostinger_creds.json')
        
        try:
            if os.path.exists(creds_path):
                with open(creds_path, 'r') as f:
                    creds = json.load(f)
                    api_key = creds.get('api_key') or creds.get('HOSTINGER_API_KEY')
                    if api_key:
                        logger.info("✅ Hostinger API key loaded from credentials")
                        return api_key
        except Exception as e:
            logger.warning(f"Could not load from credentials file: {e}")
        
        # Fallback to environment variable
        api_key = os.getenv('HOSTINGER_API_KEY')
        if api_key:
            logger.info("✅ Hostinger API key loaded from environment")
            return api_key
        
        logger.warning("⚠️ No Hostinger API key found, using mock")
        return "mock_api_key"

    def get_account_info(self) -> Dict[str, Any]:
        """Retrieve account information from Hostinger."""
        try:
            if self.api_key == "mock_api_key":
                logger.info("Using mock Hostinger data")
                return {"account": "active", "websites": 5, "mode": "mock"}
            
            response = self.session.get(f"{self.BASE_URL}/account")
            response.raise_for_status()
            self.account_info = response.json()
            logger.info(f"✅ Retrieved account info from Hostinger")
            return self.account_info
        except requests.exceptions.RequestException as e:
            logger.error(f"Error retrieving Hostinger account info: {e}")
            return {"account": "error", "error": str(e), "mode": "error"}

    def get_domains(self) -> Dict[str, Any]:
        """Retrieve domains associated with account."""
        try:
            if self.api_key == "mock_api_key":
                return {"domains": [{"name": "example.com", "status": "active"}]}
            
            response = self.session.get(f"{self.BASE_URL}/domains")
            response.raise_for_status()
            logger.info("✅ Retrieved domains from Hostinger")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error retrieving domains: {e}")
            return {"error": str(e)}

    def get_websites(self) -> Dict[str, Any]:
        """Retrieve websites from account."""
        try:
            if self.api_key == "mock_api_key":
                return {"websites": [{"id": 1, "name": "Default Website", "status": "active"}]}
            
            response = self.session.get(f"{self.BASE_URL}/websites")
            response.raise_for_status()
            logger.info("✅ Retrieved websites from Hostinger")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error retrieving websites: {e}")
            return {"error": str(e)}

    def get_hosting_url(self) -> Optional[str]:
        """Get the primary hosting URL."""
        try:
            websites = self.get_websites()
            if "websites" in websites and websites["websites"]:
                url = websites["websites"][0].get("domain") or websites["websites"][0].get("url")
                logger.info(f"✅ Primary URL: {url}")
                return url
            return None
        except Exception as e:
            logger.error(f"Error getting hosting URL: {e}")
            return None
