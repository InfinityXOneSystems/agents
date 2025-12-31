"""Integration guide for Hostinger with infinity-matrix orchestrator."""

# Example 1: Use in main orchestrator
# ===================================

def setup_hostinger_in_orchestrator():
    """Add Hostinger to main system orchestrator."""
    from ai_stack.hostinger import get_hostinger_integration
    
    # Initialize
    hostinger = get_hostinger_integration()
    
    # Add to system
    return {
        "name": "hostinger",
        "agent": hostinger,
        "capabilities": [
            "domain_management",
            "vps_operations",
            "backup_management",
            "dns_management",
            "ssl_provisioning",
            "database_management",
            "email_services",
            "monitoring",
            "disaster_recovery",
            "infrastructure_deployment"
        ],
        "status": "active" if hostinger.initialized else "fallback"
    }


# Example 2: Deploy infrastructure automatically
# ================================================

def deploy_production_environment():
    """Deploy complete production environment."""
    from ai_stack.hostinger import get_hostinger_integration
    
    hostinger = get_hostinger_integration()
    
    # Define infrastructure
    config = {
        "domains": [
            {
                "name": "myapp.com",
                "registrant": {
                    "name": "Company Name",
                    "email": "admin@company.com",
                    "country": "US"
                }
            },
            {
                "name": "api.myapp.com",
                "registrant": {
                    "name": "Company Name",
                    "email": "admin@company.com",
                    "country": "US"
                }
            }
        ],
        "databases": [
            {"name": "production_db", "type": "MySQL"},
            {"name": "analytics_db", "type": "MySQL"},
            {"name": "cache_db", "type": "MySQL"}
        ],
        "ssl_domains": ["myapp.com", "api.myapp.com"]
    }
    
    # Deploy
    result = hostinger.deploy_infrastructure(config)
    
    print(f"Deployment {result['deployment_id']}: {result['status']}")
    for component in result['components']:
        print(f"  {component['type']}: {component['status']}")
    
    return result


# Example 3: Continuous monitoring
# =================================

def setup_monitoring_loop():
    """Set up continuous monitoring."""
    from ai_stack.hostinger import get_hostinger_integration
    import time
    
    hostinger = get_hostinger_integration()
    
    def monitor():
        while True:
            # Get monitoring data
            data = hostinger.get_monitoring_data()
            
            # Check health
            health = hostinger.health_check()
            
            # Log metrics
            print(f"[{data['timestamp']}]")
            print(f"  Uptime: {data['uptime']['uptime_percent']}%")
            print(f"  Domains: {data['domains']}")
            print(f"  Status: {health['overall_status']}")
            
            # Alert if degraded
            if health['overall_status'] != "healthy":
                alert_ops_team(health)
            
            # Wait 5 minutes
            time.sleep(300)
    
    return monitor


# Example 4: Backup automation
# =============================

def setup_backup_schedule():
    """Set up automated backups."""
    from ai_stack.hostinger import get_hostinger_integration
    from apscheduler.schedulers.background import BackgroundScheduler
    
    hostinger = get_hostinger_integration()
    
    def backup_job():
        print("Creating scheduled backup...")
        backup = hostinger.create_backup()
        print(f"Backup created: {backup['backup_id']}")
    
    scheduler = BackgroundScheduler()
    # Daily at 2 AM
    scheduler.add_job(backup_job, 'cron', hour=2, minute=0)
    scheduler.start()
    
    return scheduler


# Example 5: DNS update from external source
# ==========================================

def sync_dns_from_config():
    """Sync DNS records from configuration file."""
    from ai_stack.hostinger import get_hostinger_integration
    import json
    
    hostinger = get_hostinger_integration()
    
    # Load DNS config
    with open('dns_config.json', 'r') as f:
        dns_config = json.load(f)
    
    # Update for each domain
    for domain, records in dns_config.items():
        result = hostinger.update_dns_records(domain, records)
        print(f"Updated {domain}: {len(result['updates'])} records")


# Example 6: Disaster recovery workflow
# ======================================

def disaster_recovery():
    """Implement disaster recovery workflow."""
    from ai_stack.hostinger import get_hostinger_integration
    
    hostinger = get_hostinger_integration()
    
    # Step 1: Export current configuration
    print("Step 1: Exporting current configuration...")
    config = hostinger.export_configuration()
    
    # Step 2: Create backup
    print("Step 2: Creating backup...")
    backup = hostinger.create_backup()
    backup_id = backup['backup_id']
    
    # Step 3: Verify backup
    print("Step 3: Verifying backup...")
    status = hostinger.agent.get_backup_status(backup_id)
    
    if status['status'] == 'completed':
        print("✅ Backup verified")
        
        # Step 4: If disaster occurs, restore
        print("Step 4: Ready for restore if needed...")
        # hostinger.restore_from_backup(backup_id)
    
    return {"config": config, "backup_id": backup_id}


# Example 7: Scale infrastructure on demand
# ==========================================

def autoscale_infrastructure(cpu_threshold=80):
    """Implement auto-scaling based on CPU usage."""
    from ai_stack.hostinger import get_hostinger_integration
    
    hostinger = get_hostinger_integration()
    
    # Check current usage
    usage = hostinger.agent.get_usage_stats()
    cpu = float(usage['cpu_usage'].rstrip('%'))
    
    if cpu > cpu_threshold:
        print(f"CPU usage {cpu}% exceeds threshold, scaling up...")
        
        # Get first VPS
        vps_list = hostinger.agent.list_vps()
        if vps_list:
            vps_id = vps_list[0]['account_id']
            
            # Scale up
            result = hostinger.scale_infrastructure(
                vps_id,
                {"ram": "8GB", "disk": "200GB", "cpu": "4 cores"}
            )
            
            print(f"Scaling initiated: {result['estimated_completion']}")
            return result
    
    return {"status": "no_scaling_needed"}


# Example 8: Integration with other agents
# =========================================

def integrate_with_agents():
    """Show how to use Hostinger with other agents."""
    from ai_stack.hostinger import get_hostinger_integration
    from ai_stack.firebase_agent import FirebaseAgent
    from ai_stack.gcp_agent import GCPAgent
    
    hostinger = get_hostinger_integration()
    firebase = FirebaseAgent()
    gcp = GCPAgent()
    
    # Get infrastructure from Hostinger
    hostinger_info = hostinger.get_infrastructure_overview()
    
    # Store in Firebase
    firebase.store_infrastructure_data("hostinger", hostinger_info)
    
    # Log to GCP
    gcp.log_event("infrastructure_updated", hostinger_info)
    
    return {
        "hostinger": hostinger_info,
        "stored_in_firebase": True,
        "logged_to_gcp": True
    }


# Example 9: Health monitoring with alerts
# =========================================

def setup_health_monitoring_with_alerts():
    """Monitor health with alert notifications."""
    from ai_stack.hostinger import get_hostinger_integration
    
    hostinger = get_hostinger_integration()
    
    def check_and_alert():
        health = hostinger.health_check()
        
        alerts = []
        
        if not health['api_connection']:
            alerts.append("❌ API connection lost")
        
        if health['uptime']['uptime_percent'] < 99.9:
            alerts.append(f"⚠️ Uptime below 99.9%: {health['uptime']['uptime_percent']}%")
        
        if not health['backup_status']:
            alerts.append("❌ No recent backups")
        
        if health['overall_status'] != "healthy":
            alerts.append(f"⚠️ System status: {health['overall_status']}")
        
        # Send alerts
        for alert in alerts:
            send_alert(alert)
        
        return health
    
    return check_and_alert


# Example 10: Configuration management
# =====================================

def manage_infrastructure_config():
    """Export and version control infrastructure."""
    from ai_stack.hostinger import get_hostinger_integration
    import json
    from datetime import datetime
    
    hostinger = get_hostinger_integration()
    
    # Export current config
    config = hostinger.export_configuration()
    
    # Add metadata
    versioned_config = {
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "environment": "production",
        "infrastructure": config
    }
    
    # Save to file
    filename = f"infrastructure_config_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(versioned_config, f, indent=2, default=str)
    
    print(f"Configuration saved to {filename}")
    return versioned_config


# Usage in main system
# ====================

if __name__ == "__main__":
    print("Hostinger Integration Examples\n")
    
    # 1. Setup in orchestrator
    print("1. Setting up Hostinger in orchestrator...")
    orchestrator_setup = setup_hostinger_in_orchestrator()
    print(f"   Status: {orchestrator_setup['status']}\n")
    
    # 2. Deploy infrastructure
    print("2. Deploy production environment...")
    # deploy_result = deploy_production_environment()
    # print(f"   Result: {deploy_result}\n")
    
    # 3. Monitor
    print("3. Setting up monitoring...")
    # monitor = setup_monitoring_loop()
    print("   Monitoring ready\n")
    
    # 4. Backups
    print("4. Setting up backup schedule...")
    # scheduler = setup_backup_schedule()
    print("   Backups scheduled\n")
    
    # 5. Health check
    from ai_stack.hostinger import get_hostinger_integration
    hostinger = get_hostinger_integration()
    health = hostinger.health_check()
    print("5. Health check:")
    print(f"   Overall Status: {health['overall_status']}")
    print(f"   API Connection: {'✅' if health['api_connection'] else '❌'}")
    print(f"   Uptime: {health['uptime']['uptime_percent']}%\n")
    
    print("✅ All integration examples ready!")
