#!/usr/bin/env python3
"""
GitHub-Free Autonomous System Controller
Manages all operations without GitHub dependency
"""

import os
import sys
import time
import json
import logging
import subprocess
from pathlib import Path
from datetime import datetime

# Setup logging
log_dir = Path(r'C:\AI\logs')
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'autonomous_controller.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('AutonomousController')


class AutonomousController:
    """GitHub-free autonomous system controller"""
    
    def __init__(self):
        self.base_dir = Path(r'C:\AI.worktrees\worktree-2025-12-31T05-31-01')
        self.credentials_dir = Path(r'C:\AI\credentials')
        self.agents = {}
        self.check_interval = 300  # 5 minutes
    
    def launch_hostinger_agent(self):
        """Launch Hostinger monitoring agent"""
        logger.info("Launching Hostinger Agent...")
        try:
            agent_script = self.base_dir / 'infinity-matrix' / 'ai_stack' / 'hostinger_agent.py'
            proc = subprocess.Popen(
                ['python', str(agent_script), '--interval', '3600'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.agents['hostinger'] = proc
            logger.info(f"Hostinger Agent launched (PID: {proc.pid})")
            return True
        except Exception as e:
            logger.error(f"Failed to launch Hostinger Agent: {e}")
            return False
    
    def launch_credential_daemon(self):
        """Launch credential management daemon"""
        logger.info("Launching Credential Daemon...")
        try:
            daemon_script = self.base_dir / 'infinity-matrix' / 'ai_stack' / 'credential_daemon.py'
            if daemon_script.exists():
                proc = subprocess.Popen(
                    ['python', str(daemon_script)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                self.agents['credential_daemon'] = proc
                logger.info(f"Credential Daemon launched (PID: {proc.pid})")
                return True
        except Exception as e:
            logger.error(f"Failed to launch Credential Daemon: {e}")
        return False
    
    def check_agent_health(self):
        """Check health of all agents"""
        logger.info("Checking agent health...")
        
        for name, proc in list(self.agents.items()):
            if proc.poll() is not None:
                logger.warning(f"Agent {name} has stopped (exit code: {proc.returncode})")
                del self.agents[name]
                
                # Auto-restart critical agents
                if name == 'hostinger':
                    logger.info(f"Auto-restarting {name}...")
                    self.launch_hostinger_agent()
                elif name == 'credential_daemon':
                    logger.info(f"Auto-restarting {name}...")
                    self.launch_credential_daemon()
            else:
                logger.info(f"Agent {name} is running (PID: {proc.pid})")
    
    def backup_system_state(self):
        """Backup entire system state"""
        logger.info("Backing up system state...")
        
        backup_dir = self.credentials_dir / 'system_backups'
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f'system_backup_{timestamp}.json'
        
        state = {
            'timestamp': timestamp,
            'agents': {name: proc.pid for name, proc in self.agents.items()},
            'hostinger_integrated': True,
            'github_independent': True
        }
        
        with open(backup_file, 'w') as f:
            json.dump(state, f, indent=2)
        
        logger.info(f"System state backed up to {backup_file}")
    
    def run_hostinger_health_check(self):
        """Run Hostinger health check"""
        logger.info("Running Hostinger health check...")
        try:
            from hostinger.hostinger_manager import HostingerManager
            manager = HostingerManager()
            health = manager.health_check()
            logger.info(f"Hostinger health: {json.dumps(health, indent=2)}")
        except Exception as e:
            logger.error(f"Hostinger health check failed: {e}")
    
    def auto_fix_issues(self):
        """Automatically fix detected issues"""
        logger.info("Running auto-fix...")
        
        # Check if agents are running
        if 'hostinger' not in self.agents:
            logger.warning("Hostinger agent not running, launching...")
            self.launch_hostinger_agent()
        
        # Additional auto-fix logic can be added here
    
    def run_once(self):
        """Run one iteration of autonomous operations"""
        logger.info("=== Autonomous Controller Check ===")
        
        self.check_agent_health()
        self.auto_fix_issues()
        self.backup_system_state()
        
        # Periodic Hostinger health check (every hour)
        current_hour = datetime.now().hour
        if current_hour % 1 == 0 and datetime.now().minute < 5:
            self.run_hostinger_health_check()
        
        logger.info("=== Autonomous Controller Check Complete ===")
    
    def start(self):
        """Start autonomous controller"""
        logger.info("=" * 60)
        logger.info("Starting GitHub-Free Autonomous System Controller")
        logger.info("=" * 60)
        
        # Launch all agents
        self.launch_hostinger_agent()
        time.sleep(2)
        self.launch_credential_daemon()
        time.sleep(2)
        
        logger.info(f"All agents launched. Running health checks every {self.check_interval} seconds")
        
        # Main control loop
        while True:
            try:
                self.run_once()
                time.sleep(self.check_interval)
            except KeyboardInterrupt:
                logger.info("Controller stopped by user")
                self.shutdown()
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                time.sleep(60)
    
    def shutdown(self):
        """Shutdown all agents"""
        logger.info("Shutting down all agents...")
        
        for name, proc in self.agents.items():
            try:
                logger.info(f"Terminating {name} (PID: {proc.pid})")
                proc.terminate()
                proc.wait(timeout=5)
            except Exception as e:
                logger.error(f"Error terminating {name}: {e}")
                try:
                    proc.kill()
                except:
                    pass
        
        logger.info("Autonomous controller shutdown complete")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description='GitHub-Free Autonomous System Controller'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=300,
        help='Health check interval in seconds (default: 300)'
    )
    
    args = parser.parse_args()
    
    controller = AutonomousController()
    controller.check_interval = args.interval
    controller.start()
