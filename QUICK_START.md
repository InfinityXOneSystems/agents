# Quick Start Guide - Hostinger Integration

## Installation

### Step 1: Run Installer
```bash
python infinity-matrix/ai_stack/hostinger/install_hostinger.py
```

The installer will:
1. Create required directories
2. Install Python dependencies
3. Prompt for Hostinger API token
4. Test API connection
5. Create launcher scripts

### Step 2: Get Hostinger API Token
1. Log in to Hostinger dashboard
2. Go to API section
3. Generate new API token
4. Copy the token

### Step 3: Start Autonomous System
```bash
# Windows
C:\AI\credentials\launch_hostinger.bat

# Or directly with Python
python infinity-matrix/ai_stack/autonomous_controller.py
```

## Basic Usage

### CLI Commands
```bash
# List domains
python -m hostinger.hostinger_cli domains list

# Get domain details
python -m hostinger.hostinger_cli domains get example.com

# List DNS records
python -m hostinger.hostinger_cli dns list example.com

# Create DNS record
python -m hostinger.hostinger_cli dns create example.com A www 192.168.1.1

# List VPS instances
python -m hostinger.hostinger_cli vps list

# Health check
python -m hostinger.hostinger_cli health

# Backup
python -m hostinger.hostinger_cli backup
```

### Python SDK
```python
from hostinger import HostingerManager

# Initialize
manager = HostingerManager()

# Domain operations
domains = manager.list_domains()
manager.renew_domain('example.com', years=1)

# DNS operations
dns_records = manager.list_dns_records('example.com')
manager.create_dns_record('example.com', 'A', 'www', '192.168.1.1')

# VPS operations
vps_list = manager.list_vps()
manager.start_vps('vps-id-123')

# Health and backup
health = manager.health_check()
backup = manager.backup_all_data()
```

## Autonomous Operations

The system automatically:
- ✅ Monitors domain expirations (auto-renew)
- ✅ Monitors VPS health (auto-restart)
- ✅ Tracks billing (alerts)
- ✅ Performs daily backups
- ✅ Self-heals failed agents

## File Locations

### Credentials
- API Token: `C:\AI\credentials\hostinger\api_token.json`

### Backups
- System: `C:\AI\credentials\system_backups\`
- Hostinger: `C:\AI\credentials\hostinger\backups\`

### Logs
- Controller: `C:\AI\logs\autonomous_controller.log`
- Agents: `C:\AI\credentials\launch.log`

## Troubleshooting

### API Connection Failed
1. Check API token in `C:\AI\credentials\hostinger\api_token.json`
2. Verify token is valid in Hostinger dashboard
3. Check network connectivity

### Agent Not Starting
1. Check logs in `C:\AI\logs\`
2. Verify Python dependencies installed
3. Run health check: `python -m hostinger.hostinger_cli health`

### No Backups
1. Check backup directory exists: `C:\AI\credentials\hostinger\backups\`
2. Verify agent is running
3. Manually run: `python -m hostinger.hostinger_cli backup`

## Support

For issues:
1. Check logs in `C:\AI\logs\`
2. Run health check
3. Review `AUTONOMOUS_OPERATIONS.md` for detailed documentation

## GitHub Independence

✅ This system operates completely independently of GitHub
✅ All credentials stored locally
✅ Backups ensure continuity
✅ No external dependencies for core operations
