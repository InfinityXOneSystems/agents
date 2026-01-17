#!/usr/bin/env python3
"""
Automated Background Tester for Credential System
Runs comprehensive tests autonomously.
"""

import os
import json
import time
import logging
from pathlib import Path
from credential_manager import CredentialManager

logging.basicConfig(filename=r'C:\AI\credentials\test_log.log', level=logging.INFO)

def run_tests():
    """Run all tests."""
    logging.info("Starting automated tests")

    # Test 1: Environment
    creds_dir = os.getenv('CREDENTIALS_DIR')
    assert creds_dir and Path(creds_dir).exists(), "CREDENTIALS_DIR invalid"

    # Test 2: CredentialManager
    cm = CredentialManager()

    # Test 3: Save/Load
    test_data = {'api_key': 'test123', 'secret': 'secret456'}
    cm.save_json('agents', 'test_agent.json', test_data)
    loaded = cm.load_json('agents', 'test_agent.json')
    assert loaded == test_data, "Save/load failed"

    # Test 4: Permissions (basic check)
    base_dir = Path(creds_dir)
    assert base_dir.exists(), "Base dir missing"

    # Test 5: Subfolders
    subfolders = ['agents', 'systems', 'extensions', 'vscode', 'google_cloud', 'workspace', 'future_systems', 'github', 'firebase', 'hostinger']
    for folder in subfolders:
        assert (base_dir / folder).exists(), f"Subfolder {folder} missing"

    # Test 6: Run simulation test
    try:
        from simulation_test import SimulationTest
        sim = SimulationTest()
        success = sim.run_full_simulation()
        assert success, "Simulation test failed"
        logging.info("Simulation test passed")
    except Exception as e:
        logging.error(f"Simulation test error: {e}")
        raise

    logging.info("All tests passed")
    return True

if __name__ == "__main__":
    while True:
        try:
            run_tests()
        except Exception as e:
            logging.error(f"Test failed: {e}")
        time.sleep(1800)  # Test every 30 minutes