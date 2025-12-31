"""
Example usage of Hostinger integration.

This demonstrates all the capabilities of the Hostinger agent.
"""

from .hostinger_integration import get_hostinger_integration, initialize_hostinger


def example_basic_usage():
    """Example: Basic usage."""
    print("=" * 60)
    print("EXAMPLE 1: Basic Usage")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Get account info
    account = hostinger.agent.get_account_info()
    print(f"\n✅ Account Status: {account.get('account')}")
    print(f"   Websites: {account.get('websites')}")
    
    # List domains
    domains = hostinger.agent.list_domains()
    print(f"\n✅ Total Domains: {len(domains)}")
    for domain in domains[:3]:  # Show first 3
        print(f"   - {domain.get('domain_name')} ({domain.get('status')})")
    
    # List VPS
    vps = hostinger.agent.list_vps()
    print(f"\n✅ VPS Instances: {len(vps)}")
    for instance in vps[:3]:
        print(f"   - {instance.get('vps_name')} ({instance.get('ram')} RAM)")


def example_infrastructure_overview():
    """Example: Get complete infrastructure overview."""
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Infrastructure Overview")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    overview = hostinger.get_infrastructure_overview()
    
    print(f"\n📊 Infrastructure Status: {overview['status']}")
    print(f"✅ Domains: {overview['domains']['count']}")
    print(f"✅ VPS Instances: {overview['vps_instances']['count']}")
    print(f"✅ Backups: {overview['storage']['backups']}")
    print(f"✅ Databases: {overview['storage']['databases']}")
    print(f"✅ Security: {overview['security']['firewall']}")
    print(f"✅ Uptime: {overview['performance']['uptime']['uptime_percent']}%")


def example_backup_and_restore():
    """Example: Create and restore backups."""
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Backup and Restore")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Create backup
    print("\n📦 Creating backup...")
    backup = hostinger.create_backup()
    backup_id = backup.get('backup_id')
    print(f"✅ Backup created: {backup_id}")
    print(f"   Status: {backup.get('status')}")
    
    # List backups
    backups = hostinger.agent.list_backups()
    print(f"\n✅ Total backups: {len(backups)}")
    for b in backups[:3]:
        print(f"   - {b.get('backup_id')} ({b.get('status')})")


def example_dns_management():
    """Example: Manage DNS records."""
    print("\n" + "=" * 60)
    print("EXAMPLE 4: DNS Management")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Get existing DNS records
    domain = "example.com"
    records = hostinger.agent.get_dns_records(domain)
    print(f"\n📍 DNS records for {domain}:")
    for record in records:
        print(f"   {record.get('type')} {record.get('name')} → {record.get('value')}")
    
    # Example: Create new DNS records
    print(f"\n✏️ Adding DNS records to {domain}...")
    new_records = [
        {"type": "A", "name": "api", "value": "192.168.1.100"},
        {"type": "CNAME", "name": "blog", "value": "example.com"}
    ]
    result = hostinger.update_dns_records(domain, new_records)
    print(f"✅ DNS records updated: {len(result['updates'])} additions")


def example_ssl_certificates():
    """Example: SSL certificate management."""
    print("\n" + "=" * 60)
    print("EXAMPLE 5: SSL Certificate Management")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # List SSL certificates
    certs = hostinger.agent.get_ssl_certificates()
    print(f"\n🔒 SSL Certificates: {len(certs)}")
    for cert in certs:
        print(f"   {cert.get('domain')} - {cert.get('issuer')}")
        print(f"      Expires: {cert.get('expiration_date')}")
    
    # Create SSL certificate
    domain = "newsite.com"
    print(f"\n✏️ Creating SSL certificate for {domain}...")
    ssl_result = hostinger.agent.create_ssl_certificate(domain)
    print(f"✅ SSL certificate created")


def example_deployment():
    """Example: Deploy infrastructure configuration."""
    print("\n" + "=" * 60)
    print("EXAMPLE 6: Infrastructure Deployment")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Define deployment configuration
    deployment_config = {
        "domains": [
            {
                "name": "myapp.com",
                "registrant": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "country": "US"
                }
            }
        ],
        "databases": [
            {"name": "myapp_db", "type": "MySQL"},
            {"name": "analytics_db", "type": "MySQL"}
        ],
        "ssl_domains": ["myapp.com", "www.myapp.com"]
    }
    
    # Deploy
    print("\n🚀 Deploying infrastructure...")
    result = hostinger.deploy_infrastructure(deployment_config)
    print(f"✅ Deployment ID: {result['deployment_id']}")
    print(f"   Status: {result['status']}")
    print(f"   Components deployed: {len(result['components'])}")


def example_monitoring():
    """Example: Monitor performance and health."""
    print("\n" + "=" * 60)
    print("EXAMPLE 7: Monitoring and Health Check")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Get monitoring data
    monitoring = hostinger.get_monitoring_data()
    print(f"\n📊 Monitoring Data ({monitoring['timestamp']}):")
    print(f"   Uptime: {monitoring['uptime']['uptime_percent']}%")
    print(f"   Disk Usage: {monitoring['usage'].get('disk_used', 'N/A')}")
    print(f"   Domains: {monitoring['domains']}")
    print(f"   VPS: {monitoring['vps']}")
    print(f"   Databases: {monitoring['databases']}")
    
    # Health check
    print(f"\n🏥 Health Check:")
    health = hostinger.health_check()
    print(f"   API Connection: {'✅ HEALTHY' if health['api_connection'] else '⚠️ DEGRADED'}")
    print(f"   Overall Status: {health['overall_status'].upper()}")


def example_database_management():
    """Example: Database management."""
    print("\n" + "=" * 60)
    print("EXAMPLE 8: Database Management")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # List databases
    databases = hostinger.agent.get_databases()
    print(f"\n🗄️ Databases: {len(databases)}")
    for db in databases:
        print(f"   {db.get('database_name')} ({db.get('type')}) - {db.get('status')}")
    
    # Create database
    print(f"\n✏️ Creating new database...")
    new_db = hostinger.agent.create_database("new_project_db", "MySQL")
    print(f"✅ Database created: {new_db}")


def example_email_management():
    """Example: Email account management."""
    print("\n" + "=" * 60)
    print("EXAMPLE 9: Email Management")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # List email accounts
    emails = hostinger.agent.get_email_accounts()
    print(f"\n📧 Email Accounts: {len(emails)}")
    for email in emails:
        print(f"   {email.get('email')} - {email.get('status')}")
        print(f"      Storage: {email.get('storage_used')}")
    
    # Create email account
    print(f"\n✏️ Creating new email account...")
    new_email = hostinger.agent.create_email_account(
        "support@example.com",
        "secure_password_here"
    )
    print(f"✅ Email account created")


def example_usage_analytics():
    """Example: Usage analytics and scaling."""
    print("\n" + "=" * 60)
    print("EXAMPLE 10: Usage Analytics and Scaling")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Get usage stats
    usage = hostinger.agent.get_usage_stats()
    print(f"\n📈 Usage Statistics:")
    print(f"   Disk: {usage.get('disk_used')} / {usage.get('disk_limit')}")
    print(f"   Bandwidth: {usage.get('bandwidth_used')} / {usage.get('bandwidth_limit')}")
    print(f"   CPU: {usage.get('cpu_usage')}")
    print(f"   Memory: {usage.get('memory_usage')}")
    
    # Example: Scale VPS
    print(f"\n📶 Scaling VPS...")
    vps_list = hostinger.agent.list_vps()
    if vps_list:
        vps_id = vps_list[0].get('account_id', 'vps_1')
        scale_result = hostinger.scale_infrastructure(
            vps_id,
            {"ram": "8GB", "disk": "200GB", "cpu": "4 cores"}
        )
        print(f"✅ Scaling initiated:")
        print(f"   VPS: {vps_id}")
        print(f"   ETA: {scale_result['estimated_completion']}")


def example_export_configuration():
    """Example: Export configuration."""
    print("\n" + "=" * 60)
    print("EXAMPLE 11: Export Configuration")
    print("=" * 60)
    
    hostinger = get_hostinger_integration()
    
    # Export
    print("\n📥 Exporting configuration...")
    config = hostinger.export_configuration()
    
    print(f"✅ Configuration exported with:")
    print(f"   Domains: {len(config.get('domains', []))}")
    print(f"   VPS: {len(config.get('vps_instances', []))}")
    print(f"   Databases: {len(config.get('databases', []))}")
    print(f"   Email accounts: {len(config.get('email_accounts', []))}")
    print(f"   SSL certificates: {len(config.get('ssl_certificates', []))}")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("HOSTINGER INTEGRATION - COMPLETE EXAMPLES")
    print("=" * 60)
    
    # Initialize
    hostinger = initialize_hostinger("Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63")
    print(f"\n✅ Initialized with API key")
    
    # Run examples
    example_basic_usage()
    example_infrastructure_overview()
    example_backup_and_restore()
    example_dns_management()
    example_ssl_certificates()
    example_deployment()
    example_monitoring()
    example_database_management()
    example_email_management()
    example_usage_analytics()
    example_export_configuration()
    
    print("\n" + "=" * 60)
    print("ALL EXAMPLES COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    main()
