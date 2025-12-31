#!/usr/bin/env python3
"""
Hostinger Autonomous Agent
Continuously monitors and manages Hostinger services
"""

import os
import sys
import time
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from hostinger.hostinger_manager import HostingerManager


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('HostingerAgent')


class HostingerAgent:
    """Autonomous agent for Hostinger operations"""
    
    def __init__(self, check_interval: int = 3600):
        """
        Initialize Hostinger Agent
        
        Args:
            check_interval: Interval in seconds between checks (default: 1 hour)
        """
        self.manager = HostingerManager()
        self.check_interval = check_interval
        self.last_backup = None
        self.backup_interval = 86400  # 24 hours
    
    def check_domain_renewals(self):
        """Check domains that need renewal"""
        logger.info("Checking domain renewals...")
        try:
            domains = self.manager.list_domains()
            renewal_threshold = 30  # days
            
            for domain in domains:
                domain_name = domain.get('domain') or domain.get('name')
                expiry_date = domain.get('expiry_date')
                
                if expiry_date:
                    # Parse expiry date and check if renewal needed
                    days_until_expiry = (datetime.fromisoformat(expiry_date) - datetime.now()).days
                    
                    if days_until_expiry <= renewal_threshold:
                        logger.warning(f"Domain {domain_name} expires in {days_until_expiry} days")
                        if days_until_expiry <= 7:
                            logger.critical(f"URGENT: Domain {domain_name} expires in {days_until_expiry} days!")
                            # Auto-renew if enabled
                            if domain.get('auto_renew'):
                                logger.info(f"Auto-renewing {domain_name}...")
                                self.manager.renew_domain(domain_name)
        except Exception as e:
            logger.error(f"Error checking domain renewals: {e}")
    
    def check_vps_health(self):
        """Check VPS instances health"""
        logger.info("Checking VPS health...")
        try:
            vps_list = self.manager.list_vps()
            
            for vps in vps_list:
                vps_id = vps.get('id')
                vps_name = vps.get('name', vps_id)
                status = vps.get('status')
                
                if status != 'running':
                    logger.warning(f"VPS {vps_name} is {status}")
                    
                    # Auto-restart if stopped
                    if status == 'stopped':
                        logger.info(f"Auto-starting VPS {vps_name}...")
                        self.manager.start_vps(vps_id)
        except Exception as e:
            logger.error(f"Error checking VPS health: {e}")
    
    def check_services(self):
        """Check services status"""
        logger.info("Checking services...")
        try:
            services = self.manager.list_services()
            
            for service in services:
                service_id = service.get('id')
                service_name = service.get('name', service_id)
                status = service.get('status')
                
                if status != 'active':
                    logger.warning(f"Service {service_name} is {status}")
        except Exception as e:
            logger.error(f"Error checking services: {e}")
    
    def check_billing(self):
        """Check billing and payment status"""
        logger.info("Checking billing...")
        try:
            billing = self.manager.get_billing_info()
            balance = billing.get('balance', 0)
            
            if balance < 0:
                logger.warning(f"Negative balance: {balance}")
            
            # Check for unpaid invoices
            invoices = self.manager.list_invoices()
            unpaid = [inv for inv in invoices if inv.get('status') == 'unpaid']
            
            if unpaid:
                logger.warning(f"Found {len(unpaid)} unpaid invoices")
                for invoice in unpaid:
                    logger.warning(f"Unpaid invoice: {invoice.get('id')} - {invoice.get('amount')}")
        except Exception as e:
            logger.error(f"Error checking billing: {e}")
    
    def perform_backup(self):
        """Perform periodic backup"""
        current_time = datetime.now()
        
        if self.last_backup is None or (current_time - self.last_backup).seconds >= self.backup_interval:
            logger.info("Performing backup...")
            try:
                result = self.manager.backup_all_data()
                logger.info(f"Backup completed: {result['backup_file']}")
                self.last_backup = current_time
            except Exception as e:
                logger.error(f"Error performing backup: {e}")
    
    def run_health_check(self):
        """Run comprehensive health check"""
        logger.info("Running health check...")
        try:
            health = self.manager.health_check()
            logger.info(f"Health check results: {json.dumps(health, indent=2)}")
            
            if health['issues']:
                logger.warning(f"Found {len(health['issues'])} issues:")
                for issue in health['issues']:
                    logger.warning(f"  - {issue}")
        except Exception as e:
            logger.error(f"Error running health check: {e}")
    
    def run_once(self):
        """Run single iteration of checks"""
        logger.info("=== Starting Hostinger Agent Check ===")
        
        self.run_health_check()
        self.check_domain_renewals()
        self.check_vps_health()
        self.check_services()
        self.check_billing()
        self.perform_backup()
        
        logger.info("=== Hostinger Agent Check Complete ===")
    
    def run(self):
        """Run agent continuously"""
        logger.info("Starting Hostinger Autonomous Agent...")
        logger.info(f"Check interval: {self.check_interval} seconds")
        
        while True:
            try:
                self.run_once()
                logger.info(f"Sleeping for {self.check_interval} seconds...")
                time.sleep(self.check_interval)
            except KeyboardInterrupt:
                logger.info("Agent stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                time.sleep(60)  # Wait 1 minute before retrying


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Hostinger Autonomous Agent')
    parser.add_argument('--interval', type=int, default=3600, help='Check interval in seconds (default: 3600)')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    
    args = parser.parse_args()
    
    agent = HostingerAgent(check_interval=args.interval)
    
    if args.once:
        agent.run_once()
    else:
        agent.run()
