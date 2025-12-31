#!/usr/bin/env python3
"""
Launch All Agents Autonomously
Starts all credential and integration agents in background.
"""

import subprocess
import time
import logging

logging.basicConfig(filename=r'C:\AI\credentials\launch.log', level=logging.INFO)

def launch_daemon():
    """Launch credential daemon."""
    try:
        subprocess.Popen(['python', r'C:\AI\credentials\credential_daemon.py'])
        logging.info("Credential Daemon launched")
        print("✅ Credential Daemon launched")
    except Exception as e:
        logging.error(f"Failed to launch daemon: {e}")
        print(f"❌ Daemon launch failed: {e}")

def launch_integrator():
    """Launch master integrator."""
    try:
        subprocess.Popen(['python', r'C:\AI\credentials\master_integrator.py'])
        logging.info("Master Integrator launched")
        print("✅ Master Integrator launched")
    except Exception as e:
        logging.error(f"Failed to launch integrator: {e}")
        print(f"❌ Integrator launch failed: {e}")

def launch_repo_sync():
    """Launch repo sync agent."""
    try:
        subprocess.Popen(['python', r'C:\AI\credentials\repo_sync_agent.py'])
        logging.info("Repo Sync Agent launched")
        print("✅ Repo Sync Agent launched")
    except Exception as e:
        logging.error(f"Failed to launch repo sync: {e}")
        print(f"❌ Repo Sync launch failed: {e}")

def launch_tester():
    """Launch background tester."""
    try:
        subprocess.Popen(['python', r'C:\AI\credentials\background_tester.py'])
        logging.info("Background Tester launched")
        print("✅ Background Tester launched")
    except Exception as e:
        logging.error(f"Failed to launch tester: {e}")
        print(f"❌ Tester launch failed: {e}")

def launch_hostinger_agent():
    """Launch Hostinger autonomous agent."""
    try:
        subprocess.Popen(['python', r'C:\AI.worktrees\worktree-2025-12-31T05-31-01\infinity-matrix\ai_stack\hostinger_agent.py', '--interval', '3600'])
        logging.info("Hostinger Agent launched")
        print("✅ Hostinger Agent launched")
    except Exception as e:
        logging.error(f"Failed to launch Hostinger agent: {e}")
        print(f"❌ Hostinger Agent launch failed: {e}")

if __name__ == "__main__":
    print("Launching all agents...")
    launch_daemon()
    time.sleep(2)
    launch_integrator()
    time.sleep(2)
    launch_repo_sync()
    time.sleep(2)
    launch_tester()
    time.sleep(2)
    launch_hostinger_agent()
    print("All agents launched autonomously!")