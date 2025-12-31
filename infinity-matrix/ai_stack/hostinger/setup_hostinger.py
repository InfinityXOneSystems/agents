"""Setup script for Hostinger integration."""

import os
import json
from pathlib import Path
from .hostinger_credentials import HostingerCredentials
from .hostinger_agent import HostingerAgent
from .hostinger_integration import HostingerIntegration


def setup_hostinger():
    """Set up Hostinger integration with API key."""
    
    print("=" * 60)
    print("HOSTINGER INTEGRATION SETUP")
    print("=" * 60)
    
    # Set up credentials
    api_key = "Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63"
    os.environ['HOSTINGER_API_KEY'] = api_key
    
    print(f"\n✅ API Key configured")
    print(f"   Key: {api_key[:20]}...{api_key[-10:]}")
    
    # Initialize credentials manager
    creds = HostingerCredentials()
    creds.save_credentials(api_key)
    print("✅ Credentials saved securely")
    
    # Initialize agent
    agent = HostingerAgent(api_key=api_key)
    print("✅ Hostinger Agent initialized")
    
    # Health check
    print("\nPerforming health check...")
    if agent.health_check():
        print("✅ Hostinger API connection: HEALTHY")
    else:
        print("⚠️  Hostinger API connection: Using fallback mode")
    
    # Get account info
    print("\nFetching account information...")
    account_info = agent.get_account_info()
    print(f"✅ Account Status: {account_info.get('account', 'Unknown')}")
    print(f"   Websites: {account_info.get('websites', 0)}")
    print(f"   Disk Space: {account_info.get('disk_space', 'Unknown')}")
    
    # Get all infrastructure info
    print("\nFetching infrastructure data...")
    integration = HostingerIntegration()
    integration.initialize()
    overview = integration.get_infrastructure_overview()
    
    print(f"✅ Domains: {overview['domains']['count']}")
    print(f"✅ VPS Instances: {overview['vps_instances']['count']}")
    print(f"✅ Backups: {overview['storage']['backups']}")
    print(f"✅ Databases: {overview['storage']['databases']}")
    
    # Export configuration
    print("\nExporting configuration...")
    config = integration.export_configuration()
    config_file = Path(__file__).parent / "hostinger_config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2, default=str)
    print(f"✅ Configuration exported to {config_file}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SETUP COMPLETE")
    print("=" * 60)
    print(f"""
✅ Hostinger integration is ready!

API Key: {api_key[:20]}...{api_key[-10:]}
Credentials: {creds.hostinger_creds_file}
Configuration: {config_file}

Next steps:
1. Use HostingerIntegration for deployment
2. Configure your domains and infrastructure
3. Set up automated backups
4. Monitor performance via health_check()

Example usage:
    from hostinger_integration import get_hostinger_integration
    
    hostinger = get_hostinger_integration()
    overview = hostinger.get_infrastructure_overview()
    print(overview)
""")


if __name__ == "__main__":
    setup_hostinger()
