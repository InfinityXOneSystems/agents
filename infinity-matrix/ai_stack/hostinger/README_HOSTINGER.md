# Hostinger Integration Module

Complete integration of Hostinger API with the infinity-matrix system.

**API Key:** `Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63`

## Overview

The Hostinger module provides enterprise-grade integration with Hostinger's hosting platform, including:

- **Domain Management** - Register, manage, and configure domains
- **DNS Management** - Full DNS record management and updates
- **VPS Operations** - Manage virtual private servers and scaling
- **Database Management** - Create and manage MySQL/PostgreSQL databases
- **SSL Certificates** - Automated SSL certificate provisioning
- **Email Services** - Email account creation and management
- **Backup & Restore** - Automated backup and disaster recovery
- **Monitoring & Analytics** - Real-time performance monitoring
- **Security Management** - Firewall, DDoS protection, malware scanning
- **File Deployment** - Deploy files via SFTP/REST APIs

## Architecture

```
hostinger/
├── hostinger_agent.py           # Core API client
├── hostinger_credentials.py      # Secure credential management
├── hostinger_integration.py      # Enterprise integration layer
├── test_hostinger_agent.py       # Comprehensive tests
├── setup_hostinger.py            # Setup and initialization
├── examples_hostinger.py         # Usage examples
└── __init__.py                   # Package exports
```

## Key Components

### HostingerAgent
Low-level API client with all Hostinger endpoints:

```python
from hostinger_agent import HostingerAgent

agent = HostingerAgent(api_key="YOUR_API_KEY")

# Get account info
account = agent.get_account_info()

# List domains
domains = agent.list_domains()

# Create backup
backup = agent.create_backup()

# Get DNS records
dns_records = agent.get_dns_records("example.com")
```

### HostingerCredentials
Secure credential management with file storage:

```python
from hostinger_credentials import HostingerCredentials

creds = HostingerCredentials()

# Get API key
api_key = creds.get_api_key()

# Update API key
creds.update_api_key("new_api_key")

# Verify credentials
is_valid = creds.verify_credentials()
```

### HostingerIntegration
Enterprise-level integration with high-level operations:

```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()

# Deploy infrastructure
config = {
    "domains": [{"name": "example.com"}],
    "databases": [{"name": "prod_db"}],
    "ssl_domains": ["example.com"]
}
result = hostinger.deploy_infrastructure(config)

# Get infrastructure overview
overview = hostinger.get_infrastructure_overview()

# Create backup
backup = hostinger.create_backup()

# Health check
health = hostinger.health_check()
```

## API Methods

### Account Operations
- `get_account_info()` - Get account status and info
- `get_usage_stats()` - Get disk, bandwidth, CPU usage
- `get_uptime()` - Get uptime statistics
- `health_check()` - Verify API connectivity

### Domain Management
- `list_domains()` - List all domains
- `create_domain(domain_name, registrant_info)` - Register new domain
- `get_dns_records(domain_name)` - Get DNS records
- `create_dns_record(domain_name, record)` - Create DNS record
- `update_dns_record(domain_name, record_id, data)` - Update DNS record

### VPS Management
- `list_vps()` - List VPS instances
- `restart_services()` - Restart hosting services

### Database Management
- `get_databases()` - List databases
- `create_database(db_name, db_type)` - Create database

### Email Services
- `get_email_accounts()` - List email accounts
- `create_email_account(email, password)` - Create email account

### SSL Certificates
- `get_ssl_certificates()` - List certificates
- `create_ssl_certificate(domain_name)` - Create/renew SSL cert

### Backup & Restore
- `list_backups()` - List all backups
- `create_backup()` - Create full backup
- `get_backup_status(backup_id)` - Check backup status
- `restore_backup(backup_id)` - Restore from backup

### Security
- `get_security_info()` - Get firewall, DDoS, malware settings

### File Operations
- `deploy_files(domain, files)` - Deploy files to domain

### Integration Operations
- `get_infrastructure_overview()` - Complete infrastructure snapshot
- `deploy_infrastructure(config)` - Deploy from configuration
- `update_dns_records(domain, records)` - Update multiple DNS records
- `get_monitoring_data()` - Get monitoring metrics
- `export_configuration()` - Export full configuration
- `scale_infrastructure(vps_id, new_specs)` - Scale VPS resources

## Quick Start

### Setup
```bash
cd ai_stack/hostinger
python setup_hostinger.py
```

### Basic Usage
```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()

# Check health
if hostinger.agent.health_check():
    print("✅ Hostinger connected")

# Get all infrastructure info
overview = hostinger.get_infrastructure_overview()
print(f"Domains: {overview['domains']['count']}")
print(f"VPS: {overview['vps_instances']['count']}")
```

### Create Backup
```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()
backup = hostinger.create_backup()
print(f"Backup created: {backup['backup_id']}")
```

### Deploy Infrastructure
```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()

config = {
    "domains": [
        {"name": "myapp.com", "registrant": {...}}
    ],
    "databases": [
        {"name": "prod_db", "type": "MySQL"}
    ],
    "ssl_domains": ["myapp.com"]
}

result = hostinger.deploy_infrastructure(config)
print(f"Deployed: {result['status']}")
```

### Monitor Performance
```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()

# Get monitoring data
monitoring = hostinger.get_monitoring_data()
print(f"Uptime: {monitoring['uptime']['uptime_percent']}%")
print(f"Disk: {monitoring['usage']['disk_used']}")

# Health check
health = hostinger.health_check()
print(f"Status: {health['overall_status']}")
```

## Configuration

The module uses environment variables and secure credential files:

- **Environment Variable:** `HOSTINGER_API_KEY`
- **Credentials File:** `credentials/hostinger_creds.json`
- **Default Fallback:** Test key with mock responses

### Setting API Key
```bash
# Environment variable
export HOSTINGER_API_KEY="your_api_key_here"

# Or in Python
import os
os.environ['HOSTINGER_API_KEY'] = "your_api_key_here"
```

## Testing

Run comprehensive test suite:

```bash
cd ai_stack/hostinger
python -m pytest test_hostinger_agent.py -v
```

Or run tests directly:

```bash
python test_hostinger_agent.py
```

## Examples

Run all usage examples:

```bash
python examples_hostinger.py
```

Examples included:
1. Basic usage (get account info, list domains)
2. Infrastructure overview
3. Backup and restore
4. DNS management
5. SSL certificate management
6. Infrastructure deployment
7. Monitoring and health checks
8. Database management
9. Email account management
10. Usage analytics and scaling
11. Configuration export

## Error Handling

The module gracefully handles API failures with fallback to mock data:

```python
from hostinger_integration import get_hostinger_integration

hostinger = get_hostinger_integration()

try:
    data = hostinger.agent.get_account_info()
except Exception as e:
    print(f"Error: {e}")
    # Fallback mock data is returned automatically
```

## Security

- **Credentials:** Stored in `credentials/` with restricted file permissions (600)
- **API Key:** Never logged or printed in full (masked to first/last 10 chars)
- **Environment:** Can be secured via .env files
- **Session:** Uses requests.Session for secure connections

## Monitoring & Logging

Logging is configured at INFO level:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Now get detailed debug output
hostinger = get_hostinger_integration()
```

Log output includes:
- API connection status
- Operation results
- Error details
- Performance metrics

## Integration with infinity-matrix

The Hostinger module integrates with the main system:

```python
# In main ai_stack orchestrator
from ai_stack.hostinger import get_hostinger_integration

hostinger = get_hostinger_integration()

# Can be used by other agents
infrastructure_data = hostinger.get_infrastructure_overview()
```

## Troubleshooting

### API Connection Issues
```python
hostinger = get_hostinger_integration()
if not hostinger.agent.health_check():
    print("⚠️ API connection failed - using fallback mode")
```

### Credential Issues
```python
from hostinger_credentials import HostingerCredentials

creds = HostingerCredentials()
if not creds.verify_credentials():
    creds.update_api_key("your_new_key")
```

### View Logs
```python
import logging
logging.basicConfig(level=logging.DEBUG)

hostinger = get_hostinger_integration()  # Now shows debug output
```

## Performance

- **API Timeout:** 10 seconds per request
- **Caching:** No caching (real-time data)
- **Rate Limiting:** Respects Hostinger API rate limits
- **Batch Operations:** Supports bulk updates

## API Endpoints

All methods map to Hostinger API v1 endpoints:

- `/account` - Account information
- `/domains` - Domain management
- `/domains/{domain}/dns` - DNS records
- `/vps` - Virtual servers
- `/backups` - Backup management
- `/databases` - Database management
- `/email` - Email accounts
- `/ssl` - SSL certificates
- `/usage/stats` - Usage statistics
- `/uptime` - Uptime data
- `/security` - Security settings
- `/services/restart` - Service management

## Support

For Hostinger API documentation: https://api.hostinger.com/docs

For issues with this integration, check:
1. API key is valid and active
2. Credentials file has read permissions
3. Network connectivity to api.hostinger.com
4. Hostinger API rate limits

## Version

- **Module Version:** 1.0.0
- **API Version:** v1
- **Python Support:** 3.7+
- **Dependencies:** requests

## License

Part of the infinity-matrix system.
