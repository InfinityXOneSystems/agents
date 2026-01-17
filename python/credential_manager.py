#!/usr/bin/env python3
"""
Autonomous Credential Loader for Agents
Production-grade script to securely load and manage credentials.
Requires encryption (e.g., via gpg) for sensitive files.
"""

import os
import json
import subprocess
from pathlib import Path

CREDENTIALS_DIR = os.getenv('CREDENTIALS_DIR', r'C:\AI\credentials')

class CredentialManager:
    def __init__(self, base_dir=CREDENTIALS_DIR):
        self.base_dir = Path(base_dir)
        if not self.base_dir.exists():
            raise FileNotFoundError(f"Credentials directory {base_dir} not found.")

    def load_json(self, category, filename, encrypted=False):
        """Load JSON credential file. Decrypt if encrypted."""
        filepath = self.base_dir / category / filename
        if encrypted:
            # Assuming gpg for decryption; adjust as needed
            decrypted = subprocess.run(['gpg', '--decrypt', str(filepath)], capture_output=True, text=True)
            if decrypted.returncode != 0:
                raise RuntimeError(f"Failed to decrypt {filepath}: {decrypted.stderr}")
            return json.loads(decrypted.stdout)
        else:
            with open(filepath, 'r') as f:
                return json.load(f)

    def save_json(self, category, filename, data, encrypt=False):
        """Save JSON credential file. Encrypt if requested."""
        filepath = self.base_dir / category / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        json_data = json.dumps(data, indent=2)
        if encrypt:
            # Encrypt with gpg; requires recipient setup
            proc = subprocess.run(['gpg', '--encrypt', '--recipient', 'your-email@example.com', '--output', str(filepath)], input=json_data, text=True)
            if proc.returncode != 0:
                raise RuntimeError(f"Failed to encrypt {filepath}")
        else:
            with open(filepath, 'w') as f:
                f.write(json_data)

    def get_google_cloud_creds(self):
        """Autonomously load Google Cloud service account creds."""
        return self.load_json('google_cloud', 'service_account.json', encrypted=True)

    def get_agent_token(self, agent_name):
        """Load agent-specific token."""
        return self.load_json('agents', f'{agent_name}_token.json', encrypted=True)

# Example usage for agents
if __name__ == "__main__":
    cm = CredentialManager()
    # Load Google Cloud creds
    creds = cm.get_google_cloud_creds()
    print("Google Cloud creds loaded successfully.")
    # Agents can now use creds autonomously