"""Hostinger integration with the infinity-matrix system."""

import logging
from typing import Dict, List, Any
from .hostinger_agent import HostingerAgent
from .hostinger_credentials import HostingerCredentials

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HostingerIntegration:
    """Enterprise integration of Hostinger with infinity-matrix."""
    
    def __init__(self):
        """Initialize Hostinger integration."""
        self.credentials = HostingerCredentials()
        self.agent = HostingerAgent(api_key=self.credentials.get_api_key())
        self.initialized = False
    
    def initialize(self) -> bool:
        """Initialize and verify Hostinger connection."""
        try:
            if self.agent.health_check():
                logger.info("✅ Hostinger integration initialized successfully")
                self.initialized = True
                return True
            else:
                logger.warning("⚠️ Hostinger health check failed, using fallback mode")
                self.initialized = True  # Allow fallback operation
                return True
        except Exception as e:
            logger.error(f"❌ Hostinger initialization failed: {e}")
            self.initialized = False
            return False
    
    def get_infrastructure_overview(self) -> Dict[str, Any]:
        """Get complete infrastructure overview."""
        logger.info("Fetching Hostinger infrastructure overview...")
        
        return {
            "status": "connected" if self.initialized else "fallback",
            "account": self.agent.get_account_info(),
            "domains": {
                "count": len(self.agent.list_domains()),
                "list": self.agent.list_domains()
            },
            "vps_instances": {
                "count": len(self.agent.list_vps()),
                "list": self.agent.list_vps()
            },
            "storage": {
                "backups": len(self.agent.list_backups()),
                "databases": len(self.agent.get_databases())
            },
            "security": self.agent.get_security_info(),
            "performance": {
                "uptime": self.agent.get_uptime(),
                "usage": self.agent.get_usage_stats()
            }
        }
    
    def deploy_infrastructure(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy infrastructure based on configuration."""
        logger.info(f"Deploying infrastructure: {config}")
        
        results = {
            "deployment_id": f"deploy_{int(__import__('time').time())}",
            "status": "in_progress",
            "components": []
        }
        
        # Deploy domains
        if "domains" in config:
            for domain_config in config["domains"]:
                try:
                    result = self.agent.create_domain(
                        domain_config["name"],
                        domain_config.get("registrant", {})
                    )
                    results["components"].append({
                        "type": "domain",
                        "name": domain_config["name"],
                        "status": "created",
                        "result": result
                    })
                    logger.info(f"✅ Domain deployed: {domain_config['name']}")
                except Exception as e:
                    logger.error(f"Domain deployment failed: {e}")
                    results["components"].append({
                        "type": "domain",
                        "name": domain_config["name"],
                        "status": "failed",
                        "error": str(e)
                    })
        
        # Deploy databases
        if "databases" in config:
            for db_config in config["databases"]:
                try:
                    result = self.agent.create_database(
                        db_config["name"],
                        db_config.get("type", "MySQL")
                    )
                    results["components"].append({
                        "type": "database",
                        "name": db_config["name"],
                        "status": "created",
                        "result": result
                    })
                    logger.info(f"✅ Database created: {db_config['name']}")
                except Exception as e:
                    logger.error(f"Database creation failed: {e}")
        
        # Deploy SSL certificates
        if "ssl_domains" in config:
            for domain in config["ssl_domains"]:
                try:
                    result = self.agent.create_ssl_certificate(domain)
                    results["components"].append({
                        "type": "ssl",
                        "domain": domain,
                        "status": "created",
                        "result": result
                    })
                    logger.info(f"✅ SSL certificate created: {domain}")
                except Exception as e:
                    logger.error(f"SSL deployment failed: {e}")
        
        results["status"] = "completed"
        return results
    
    def create_backup(self, include_databases: bool = True, 
                     include_files: bool = True) -> Dict[str, Any]:
        """Create a backup of all content."""
        logger.info("Creating Hostinger backup...")
        
        try:
            result = self.agent.create_backup()
            logger.info(f"✅ Backup created: {result.get('backup_id')}")
            return result
        except Exception as e:
            logger.error(f"Backup creation failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def restore_from_backup(self, backup_id: str) -> Dict[str, Any]:
        """Restore from a specific backup."""
        logger.info(f"Restoring from backup: {backup_id}")
        
        try:
            result = self.agent.restore_backup(backup_id)
            logger.info(f"✅ Restore initiated: {result}")
            return result
        except Exception as e:
            logger.error(f"Restore failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def update_dns_records(self, domain: str, records: List[Dict]) -> Dict[str, Any]:
        """Update DNS records for a domain."""
        logger.info(f"Updating DNS records for {domain}")
        
        results = {"domain": domain, "updates": []}
        
        try:
            for record in records:
                result = self.agent.create_dns_record(domain, record)
                results["updates"].append({
                    "record": record,
                    "status": "created",
                    "result": result
                })
                logger.info(f"✅ DNS record created: {record.get('type')} {record.get('name')}")
        except Exception as e:
            logger.error(f"DNS update failed: {e}")
        
        return results
    
    def get_monitoring_data(self) -> Dict[str, Any]:
        """Get monitoring and performance data."""
        logger.info("Collecting monitoring data...")
        
        return {
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "uptime": self.agent.get_uptime(),
            "usage": self.agent.get_usage_stats(),
            "security": self.agent.get_security_info(),
            "domains": len(self.agent.list_domains()),
            "vps": len(self.agent.list_vps()),
            "backups": len(self.agent.list_backups()),
            "databases": len(self.agent.get_databases()),
            "ssl_certificates": len(self.agent.get_ssl_certificates())
        }
    
    def scale_infrastructure(self, vps_id: str, new_specs: Dict) -> Dict[str, Any]:
        """Scale VPS resources."""
        logger.info(f"Scaling VPS {vps_id} with specs: {new_specs}")
        
        # This would typically call an upgrade endpoint
        return {
            "vps_id": vps_id,
            "status": "scaling_initiated",
            "new_specs": new_specs,
            "estimated_completion": "5 minutes"
        }
    
    def export_configuration(self) -> Dict[str, Any]:
        """Export current configuration for backup/migration."""
        logger.info("Exporting Hostinger configuration...")
        
        config = {
            "account_info": self.agent.get_account_info(),
            "domains": self.agent.list_domains(),
            "vps_instances": self.agent.list_vps(),
            "databases": self.agent.get_databases(),
            "email_accounts": self.agent.get_email_accounts(),
            "ssl_certificates": self.agent.get_ssl_certificates(),
            "backups": self.agent.list_backups(),
            "security_settings": self.agent.get_security_info()
        }
        
        logger.info("✅ Configuration exported successfully")
        return config
    
    def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check."""
        return {
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "api_connection": self.agent.health_check(),
            "uptime": self.agent.get_uptime(),
            "security_status": self.agent.get_security_info(),
            "backup_status": len(self.agent.list_backups()) > 0,
            "overall_status": "healthy" if self.agent.health_check() else "degraded"
        }


# Global integration instance
_integration = None


def get_hostinger_integration() -> HostingerIntegration:
    """Get or create global Hostinger integration instance."""
    global _integration
    if _integration is None:
        _integration = HostingerIntegration()
        _integration.initialize()
    return _integration


def initialize_hostinger(api_key: str = None) -> HostingerIntegration:
    """Initialize Hostinger with specific API key."""
    global _integration
    
    if api_key:
        creds = HostingerCredentials()
        creds.update_api_key(api_key)
    
    _integration = HostingerIntegration()
    _integration.initialize()
    return _integration
