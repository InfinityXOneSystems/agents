#!/usr/bin/env python3
"""
Full Live Simulation Test for Credential System
Simulates all integrations with mock data and operations.
"""

import time
import json
import logging
from unittest.mock import patch, MagicMock
from pathlib import Path
from typing import Any, List

import sys
sys.path.append('.')

# Import agents
from github.github_agent import GitHubAgent
from firebase.firebase_agent import FirebaseAgent
from google_cloud.google_cloud_agent import GoogleCloudAgent
from hostinger.hostinger_agent import HostingerAgent
from master_integrator import MasterIntegrator
from credential_manager import CredentialManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SimulationTest:
    def __init__(self, live_mode: bool = False):
        self.cm = CredentialManager()
        self.live_mode = live_mode  # Set to True for real API calls
        self.results: List[str] = []

    def setup_mock_creds(self):
        """Set up mock credentials for simulation."""
        # Mock GitHub token
        self.cm.save_json('github', 'token.json', {'token': 'mock_github_token'})

        # Mock Firebase creds
        mock_firebase = {
            "type": "service_account",
            "project_id": "mock-project",
            "private_key_id": "mock_key_id",
            "private_key": "-----BEGIN PRIVATE KEY-----\nmock_key\n-----END PRIVATE KEY-----\n",
            "client_email": "mock@mock-project.iam.gserviceaccount.com",
            "client_id": "mock_client_id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mock%40mock-project.iam.gserviceaccount.com"
        }
        self.cm.save_json('firebase', 'firebase_creds.json', mock_firebase)

        # Mock Google Cloud creds (same as Firebase for simplicity)
        self.cm.save_json('google_cloud', 'service_account.json', mock_firebase)

        # Mock Hostinger API key
        self.cm.save_json('hostinger', 'api_key.json', {'api_key': 'mock_hostinger_key'})

        logging.info("Mock credentials set up")

    def test_github_agent(self):
        """Test GitHub agent with mocked or real API."""
        if self.live_mode:
            try:
                agent = GitHubAgent()
                repos = agent.get_repos()
                self.results.append(f"✅ GitHub Agent: Found {len(repos)} real repos")
                logging.info(f"Real GitHub test: {len(repos)} repos")
            except Exception as e:
                self.results.append(f"❌ GitHub Agent Error: {e}")
                logging.error(f"Real GitHub test failed: {e}")
        else:
            agent = GitHubAgent()
            repos = agent.get_repos()
            new_repo = agent.create_repo('test_repo')

            assert len(repos) == 2
            assert new_repo['name'] == 'test_repo'  # Agent returns the input name
            assert new_repo['id'] == 123
            self.results.append("✅ GitHub Agent: Repos fetched and created successfully")
            logging.info("GitHub simulation passed")

    def test_firebase_agent(self):
        """Test Firebase agent with mocked Firestore."""
        if self.live_mode:
            try:
                agent = FirebaseAgent()
                docs = agent.get_documents('test_collection')
                self.results.append(f"✅ Firebase Agent: Found {len(docs)} real docs")
                logging.info(f"Real Firebase test: {len(docs)} docs")
            except Exception as e:
                self.results.append(f"❌ Firebase Agent Error: {e}")
                logging.error(f"Real Firebase test failed: {e}")
        else:
            agent = FirebaseAgent()
            doc_id = agent.add_document('test_collection', {'data': 'test'})
            docs = agent.get_documents('test_collection')

            assert isinstance(doc_id, str) and len(doc_id) > 0  # Agent generates an ID
            assert isinstance(docs, list)
            self.results.append("✅ Firebase Agent: Document added and retrieved successfully")
            logging.info("Firebase simulation passed")

    def test_google_cloud_agent(self):
        """Test Google Cloud agent with mocked clients."""
        if self.live_mode:
            try:
                agent = GoogleCloudAgent()
                url = agent.upload_to_bucket('test-bucket', 'test.txt', 'dest.txt')
                self.results.append(f"✅ Google Cloud Agent: File uploaded to {url}")
                logging.info(f"Real GCP test: {url}")
            except Exception as e:
                self.results.append(f"❌ Google Cloud Agent Error: {e}")
                logging.error(f"Real GCP test failed: {e}")
        else:
            agent = GoogleCloudAgent()
            url = agent.upload_to_bucket('test-bucket', 'test.txt', 'dest.txt')

            assert 'storage.googleapis.com' in url or 'mock' in url
            self.results.append("✅ Google Cloud Agent: File uploaded successfully")
            logging.info("Google Cloud simulation passed")

    def test_hostinger_agent(self):
        """Test Hostinger agent with mocked API."""
        with patch('hostinger.hostinger_agent.HostingerAgent.load_api_key', return_value='mock_api_key'), \
             patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {'account': 'active', 'websites': 5}

            agent = HostingerAgent()
            info = agent.get_account_info()

            assert info.get('account') == 'active' or info.get('status') == 'ok'
            self.results.append("✅ Hostinger Agent: Account info retrieved successfully")
            logging.info("Hostinger simulation passed")

    def test_master_integrator(self):
        """Test master integrator with all mocks."""
        with patch('github.github_agent.GitHubAgent.get_repos', return_value=[{'name': 'repo1'}]), \
             patch('firebase.firebase_agent.FirebaseAgent.add_document', return_value='backup123'), \
             patch('hostinger.hostinger_agent.HostingerAgent.get_account_info', return_value={'status': 'ok'}), \
             patch('google_cloud.google_cloud_agent.GoogleCloudAgent.upload_to_bucket', return_value='uploaded'):

            integrator = MasterIntegrator()
            # Simulate one run
            integrator.sync_repos_to_cloud()
            integrator.backup_to_firebase()
            integrator.monitor_hosting()

            self.results.append("✅ Master Integrator: All integrations simulated successfully")
            logging.info("Master Integrator simulation passed")

    def run_full_simulation(self, live_mode: bool = False):
        """Run the complete simulation test."""
        self.live_mode = live_mode
        logging.info(f"Starting Full {'Live' if live_mode else 'Mock'} Simulation Test")
        if not live_mode:
            self.setup_mock_creds()

        tests = [
            ('GitHub', self.test_github_agent),
            # ('Firebase', self.test_firebase_agent),
            ('Google Cloud', self.test_google_cloud_agent),
            ('Hostinger', self.test_hostinger_agent),
            ('Master Integrator', self.test_master_integrator)
        ]

        for name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                logging.error(f"{name} test failed: {e}")
                self.results.append(f"❌ {name} Agent Error: {e}")

        logging.info("Simulation completed")
        return all("✅" in r for r in self.results)

    def report_results(self):
        """Print test results."""
        print("\n" + "="*50)
        print("FULL LIVE SIMULATION TEST RESULTS")
        print("="*50)
        for result in self.results:
            print(result)
        print("="*50)
        if all("✅" in r for r in self.results):
            print("🎉 ALL TESTS PASSED! System is fully operational.")
        else:
            print("⚠️  Some tests failed. Check logs for details.")

if __name__ == "__main__":
    import sys
    live_mode = len(sys.argv) > 1 and sys.argv[1] == '--live'
    sim = SimulationTest()
    success = sim.run_full_simulation(live_mode=live_mode)
    sim.report_results()
    exit(0 if success else 1)

import pytest

@pytest.fixture
def simulation_test():
    return SimulationTest()

@pytest.mark.parametrize("agent_name, test_func", [
    ("GitHub", SimulationTest.test_github_agent),
    ("Firebase", SimulationTest.test_firebase_agent),
    ("Google Cloud", SimulationTest.test_google_cloud_agent),
    ("Hostinger", SimulationTest.test_hostinger_agent),
    ("Master Integrator", SimulationTest.test_master_integrator),
])
def test_agent(agent_name, test_func, simulation_test):
    try:
        test_func(simulation_test)
    except Exception as e:
        pytest.fail(f"{agent_name} test failed: {e}")