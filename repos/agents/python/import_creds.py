#!/usr/bin/env python3
"""
Autonomous Credential Importer
Imports existing credentials from known locations.
"""

import os
import json
import shutil
from pathlib import Path
from credential_manager import CredentialManager

CREDENTIALS_DIR = Path(r'C:\AI\credentials')
EXISTING_CRED_DIR = Path(r'C:\Users\JARVIS\AppData\Local\InfinityXOne\CredentialManager')

class CredentialImporter:
    def __init__(self):
        self.cm = CredentialManager()

    def import_google_cloud(self):
        """Import Google Cloud service account from existing location."""
        # Assume the JSON is in the existing cred manager
        source = EXISTING_CRED_DIR / 'google_cloud_service_account.json'
        if source.exists():
            shutil.copy(source, CREDENTIALS_DIR / 'google_cloud' / 'service_account.json')
            print("✅ Imported Google Cloud service account")
        else:
            # Try to fetch from Secret Manager (placeholder)
            print("⚠️  Google Cloud creds not found locally. Please download from Secret Manager: projects/896380409704/secrets/workspace-sa-json")

    def import_github(self):
        """Import GitHub token if available."""
        source = EXISTING_CRED_DIR / 'github_token.json'
        if source.exists():
            shutil.copy(source, CREDENTIALS_DIR / 'github' / 'token.json')
            print("✅ Imported GitHub token")
        else:
            print("⚠️  GitHub token not found. Please create at https://github.com/settings/tokens")

    def import_firebase(self):
        """Import Firebase creds."""
        source = EXISTING_CRED_DIR / 'firebase_creds.json'
        if source.exists():
            shutil.copy(source, CREDENTIALS_DIR / 'firebase' / 'firebase_creds.json')
            print("✅ Imported Firebase creds")
        else:
            print("⚠️  Firebase creds not found. Please download from Firebase Console")

    def import_hostinger(self):
        """Import Hostinger API key."""
        source = EXISTING_CRED_DIR / 'hostinger_api_key.json'
        if source.exists():
            shutil.copy(source, CREDENTIALS_DIR / 'hostinger' / 'api_key.json')
            print("✅ Imported Hostinger API key")
        else:
            print("⚠️  Hostinger API key not found. Please obtain from Hostinger dashboard")

    def encrypt_all(self):
        """Encrypt all imported creds."""
        import subprocess
        creds_to_encrypt = [
            ('google_cloud', 'service_account.json'),
            ('github', 'token.json'),
            ('firebase', 'firebase_creds.json'),
            ('hostinger', 'api_key.json')
        ]
        for folder, file in creds_to_encrypt:
            filepath = CREDENTIALS_DIR / folder / file
            if filepath.exists():
                try:
                    subprocess.run(['gpg', '--encrypt', '--recipient', 'your-email@example.com', '--output', str(filepath) + '.gpg', str(filepath)], check=True)
                    os.remove(filepath)  # Remove unencrypted
                    print(f"✅ Encrypted {file}")
                except:
                    print(f"⚠️  Failed to encrypt {file}. Install GPG and set up key.")

    def run_import(self):
        """Run the full import process."""
        print("Starting autonomous credential import...")
        self.import_google_cloud()
        self.import_github()
        self.import_firebase()
        self.import_hostinger()
        self.encrypt_all()
        print("Import complete. Run live tests to verify.")

if __name__ == "__main__":
    importer = CredentialImporter()
    importer.run_import()