"""Hostinger credentials management and secure storage."""

import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class HostingerCredentials:
    """Manage Hostinger API credentials securely."""
    
    def __init__(self):
        """Initialize credentials manager."""
        self.creds_dir = Path(__file__).parent.parent.parent / "credentials"
        self.creds_dir.mkdir(exist_ok=True)
        self.hostinger_creds_file = self.creds_dir / "hostinger_creds.json"
        self.api_key = self._load_or_create_credentials()
    
    def _load_or_create_credentials(self) -> str:
        """Load credentials from file or environment."""
        # Try environment variable first
        api_key = os.getenv('HOSTINGER_API_KEY')
        if api_key:
            logger.info("Using Hostinger API key from environment")
            self.save_credentials(api_key)
            return api_key
        
        # Try loading from file
        if self.hostinger_creds_file.exists():
            try:
                with open(self.hostinger_creds_file, 'r') as f:
                    data = json.load(f)
                    api_key = data.get('api_key')
                    if api_key:
                        logger.info("Loaded Hostinger API key from file")
                        return api_key
            except Exception as e:
                logger.warning(f"Could not load credentials file: {e}")
        
        # Use default/test key
        default_key = "Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63"
        logger.warning(f"Using test API key - update with real credentials")
        return default_key
    
    def save_credentials(self, api_key: str) -> bool:
        """Save credentials to secure file."""
        try:
            creds_data = {
                "api_key": api_key,
                "created_at": Path(self.hostinger_creds_file).stat().st_mtime 
                             if self.hostinger_creds_file.exists() else None
            }
            with open(self.hostinger_creds_file, 'w') as f:
                json.dump(creds_data, f, indent=2)
            os.chmod(self.hostinger_creds_file, 0o600)  # Restrict permissions
            logger.info("Hostinger credentials saved securely")
            return True
        except Exception as e:
            logger.error(f"Failed to save credentials: {e}")
            return False
    
    def update_api_key(self, new_key: str) -> bool:
        """Update API key and save it."""
        self.api_key = new_key
        os.environ['HOSTINGER_API_KEY'] = new_key
        return self.save_credentials(new_key)
    
    def get_api_key(self) -> str:
        """Get current API key."""
        return self.api_key
    
    def verify_credentials(self) -> bool:
        """Verify credentials are properly configured."""
        return bool(self.api_key)
