#!/usr/bin/env python3
"""
Launch All Agents Autonomously
Starts all credential and integration agents in background.
"""

import subprocess
import time
import logging
import os

logging.basicConfig(filename=r'C:\AI\credentials\launch.log', level=logging.INFO)

def check_process_running(process_name):
    """Check if a process is running."""
    try:
        result = subprocess.run(['tasklist'], capture_output=True, text=True)
        return process_name in result.stdout
    except Exception as e:
        logging.error(f"Failed to check process: {e}")
        return False

def launch_with_health_check(command, process_name, retries=3):
    """Launch a process with health checks and retries."""
    for attempt in range(retries):
        try:
            subprocess.Popen(command)
            time.sleep(5)  # Allow time for the process to start
            if check_process_running(process_name):
                logging.info(f"{process_name} launched successfully")
                print(f"✅ {process_name} launched successfully")
                return
            else:
                logging.warning(f"{process_name} not running. Retrying...")
        except Exception as e:
            logging.error(f"Failed to launch {process_name}: {e}")
    print(f"❌ Failed to launch {process_name} after {retries} attempts")

def launch_daemon():
    """Launch credential daemon."""
    launch_with_health_check(['python', r'C:\AI\credentials\credential_daemon.py'], "credential_daemon.py")

def launch_integrator():
    """Launch master integrator."""
    launch_with_health_check(['python', r'C:\AI\credentials\master_integrator.py'], "master_integrator.py")

def launch_repo_sync():
    """Launch repo sync agent."""
    launch_with_health_check(['python', r'C:\AI\credentials\repo_sync_agent.py'], "repo_sync_agent.py")

def launch_tester():
    """Launch background tester."""
    launch_with_health_check(['python', r'C:\AI\credentials\background_tester.py'], "background_tester.py")

if __name__ == "__main__":
    print("Launching all agents...")
    launch_daemon()
    time.sleep(2)
    launch_integrator()
    time.sleep(2)
    launch_repo_sync()
    time.sleep(2)
    launch_tester()
    print("All agents launched autonomously!")