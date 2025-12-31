# Hostinger API Python SDK Integration

## Overview
Autonomous Hostinger API management system for domains, VPS, DNS, and billing without GitHub dependency.

## Features
- **Domain Management**: Register, renew, and manage domains
- **DNS Management**: Create, update, and delete DNS records
- **VPS Management**: Start, stop, restart VPS instances
- **Billing Management**: Check billing info and invoices
- **Service Management**: Monitor and manage services
- **Autonomous Operations**: Background agent for continuous monitoring
- **Backup Capability**: Regular backups for offline operations

## Installation

### 1. Install Dependencies
```bash
pip install -r hostinger/requirements.txt
```

### 2. Configure Credentials
Create `C:\AI\credentials\hostinger\api_token.json`:
```json
{
  "api_token": "your-hostinger-api-token-here"
}
```

## Usage

### Python SDK
```python
from hostinger import HostingerManager

# Initialize manager
manager = HostingerManager()

# List domains
domains = manager.list_domains()

# Manage DNS
dns_records = manager.list_dns_records('example.com')
manager.create_dns_record('example.com', 'A', 'www', '192.168.1.1')

# Manage VPS
vps_list = manager.list_vps()
manager.start_vps('vps-id-123')

# Health check
health = manager.health_check()

# Backup
backup = manager.backup_all_data()
```

### CLI Usage
```bash
# List domains
python -m hostinger.hostinger_cli domains list

# Get domain details
python -m hostinger.hostinger_cli domains get example.com

# List DNS records
python -m hostinger.hostinger_cli dns list example.com

# Create DNS record
python -m hostinger.hostinger_cli dns create example.com A www 192.168.1.1

# List VPS
python -m hostinger.hostinger_cli vps list

# Start VPS
python -m hostinger.hostinger_cli vps start vps-id-123

# Health check
python -m hostinger.hostinger_cli health

# Backup
python -m hostinger.hostinger_cli backup
```

### Autonomous Agent
Run continuous monitoring agent:
```bash
# Run once
python hostinger_agent.py --once

# Run continuously (check every hour)
python hostinger_agent.py --interval 3600

# Run continuously (check every 5 minutes)
python hostinger_agent.py --interval 300
```

## Agent Features
- **Domain Renewal Monitoring**: Alerts and auto-renews expiring domains
- **VPS Health Monitoring**: Auto-restarts stopped VPS instances
- **Service Status Monitoring**: Tracks service availability
- **Billing Monitoring**: Alerts on unpaid invoices and negative balance
- **Automatic Backups**: Daily backups of all data

## API Endpoints

### Domains
- `GET /v1/domains` - List domains
- `GET /v1/domains/{domain}` - Get domain details
- `POST /v1/domains` - Register domain
- `POST /v1/domains/{domain}/renew` - Renew domain

### DNS
- `GET /v1/domains/{domain}/dns` - List DNS records
- `POST /v1/domains/{domain}/dns` - Create DNS record
- `PUT /v1/domains/{domain}/dns/{record_id}` - Update DNS record
- `DELETE /v1/domains/{domain}/dns/{record_id}` - Delete DNS record

### VPS
- `GET /v1/vps` - List VPS instances
- `GET /v1/vps/{vps_id}` - Get VPS details
- `POST /v1/vps/{vps_id}/start` - Start VPS
- `POST /v1/vps/{vps_id}/stop` - Stop VPS
- `POST /v1/vps/{vps_id}/restart` - Restart VPS

### Billing
- `GET /v1/billing` - Get billing info
- `GET /v1/billing/invoices` - List invoices
- `GET /v1/billing/invoices/{invoice_id}` - Get invoice details

### Services
- `GET /v1/services` - List services
- `GET /v1/services/{service_id}` - Get service details
- `POST /v1/services/{service_id}/auto-renewal/enable` - Enable auto-renewal
- `POST /v1/services/{service_id}/auto-renewal/disable` - Disable auto-renewal

## Integration with Existing System
```python
# Add to launch_all_agents.py
from hostinger_agent import HostingerAgent

def launch_hostinger_agent():
    agent = HostingerAgent(check_interval=3600)
    agent.run()

# Run in background thread
import threading
hostinger_thread = threading.Thread(target=launch_hostinger_agent, daemon=True)
hostinger_thread.start()
```

## Backup Structure
Backups are stored in `C:\AI\credentials\hostinger\backups\` with format:
```
hostinger_backup_YYYYMMDD_HHMMSS.json
```

Contains:
- All domains
- DNS records for each domain
- VPS instances
- Services
- Billing information
- Invoices

## Autonomous Operations
The system operates independently of GitHub:
1. **Credentials** stored locally in `C:\AI\credentials`
2. **Backups** stored locally for offline operations
3. **Agent** runs continuously in background
4. **No GitHub dependency** for operations

## Error Handling
- Automatic retry on API failures
- Logging of all operations
- Alert notifications for critical issues
- Graceful degradation on service unavailability

## Security
- API tokens stored in secure credentials directory
- Support for encrypted credentials (GPG)
- No hardcoded credentials
- Environment variable overrides

## Monitoring
Agent provides:
- Real-time health checks
- Domain expiration alerts
- VPS status monitoring
- Billing alerts
- Service availability tracking

## Future Enhancements
- Email notifications
- Slack/Discord webhooks
- Auto-scaling VPS based on metrics
- DNS failover automation
- Cost optimization recommendations
