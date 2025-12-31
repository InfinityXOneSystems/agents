# Autonomous System - GitHub-Free Operations

## Overview
This system operates completely independently of GitHub, using local credentials and Hostinger API for all operations.

## Key Components

### 1. Hostinger Integration
- **SDK**: Python SDK for Hostinger API operations
- **CLI**: Command-line interface for manual operations
- **Agent**: Autonomous monitoring and management agent

### 2. Autonomous Controller
Central control system that:
- Launches all agents automatically
- Monitors agent health
- Auto-restarts failed agents
- Performs system backups
- Operates without GitHub dependency

### 3. Credential Management
- Local credential storage in `C:\AI\credentials`
- Encrypted credential support
- No GitHub secrets required

## Setup

### 1. Install Dependencies
```bash
pip install -r infinity-matrix/ai_stack/hostinger/requirements.txt
```

### 2. Configure Hostinger API Token
Create `C:\AI\credentials\hostinger\api_token.json`:
```json
{
  "api_token": "your-hostinger-api-token-here"
}
```

### 3. Launch Autonomous System
```bash
# Launch all agents including Hostinger
python infinity-matrix/ai_stack/launch_all_agents.py

# Or launch the autonomous controller
python infinity-matrix/ai_stack/autonomous_controller.py
```

## Operations Without GitHub

### Domain Management
```bash
# List domains
python -m hostinger.hostinger_cli domains list

# Renew domain
python -m hostinger.hostinger_cli domains renew example.com --years 1
```

### VPS Management
```bash
# List VPS
python -m hostinger.hostinger_cli vps list

# Start VPS
python -m hostinger.hostinger_cli vps start vps-id-123
```

### DNS Management
```bash
# List DNS records
python -m hostinger.hostinger_cli dns list example.com

# Create DNS record
python -m hostinger.hostinger_cli dns create example.com A www 192.168.1.1
```

### Health Checks
```bash
# Run health check
python -m hostinger.hostinger_cli health

# Run backup
python -m hostinger.hostinger_cli backup
```

## Autonomous Operations

The system automatically:
1. **Monitors domain expirations** - Alerts and auto-renews
2. **Monitors VPS health** - Auto-restarts stopped instances
3. **Tracks billing** - Alerts on unpaid invoices
4. **Performs backups** - Daily backups of all data
5. **Self-heals** - Restarts failed agents automatically

## GitHub Independence

### What Works Without GitHub:
✅ Domain registration and renewal
✅ VPS management
✅ DNS record management
✅ Billing and invoicing
✅ Service monitoring
✅ Automated backups
✅ Health checks
✅ Auto-healing

### Local Storage:
- **Credentials**: `C:\AI\credentials\hostinger\`
- **Backups**: `C:\AI\credentials\hostinger\backups\`
- **Logs**: `C:\AI\logs\`
- **System State**: `C:\AI\credentials\system_backups\`

## Architecture

```
Autonomous Controller
├── Hostinger Agent (monitors Hostinger services)
├── Credential Daemon (manages credentials)
├── Health Monitor (checks agent status)
└── Auto-Healer (restarts failed agents)
```

## Monitoring

### Log Files:
- `C:\AI\logs\autonomous_controller.log` - Controller operations
- `C:\AI\credentials\launch.log` - Agent launches

### Status Checks:
```bash
# Check Hostinger health
python -m hostinger.hostinger_cli health

# View backups
dir C:\AI\credentials\hostinger\backups
```

## Security

- API tokens stored locally (not in GitHub)
- Support for GPG encryption
- Local-only credential access
- No network dependencies for core operations

## Failover Strategy

If GitHub is unavailable:
1. System continues operating from local credentials
2. Backups ensure no data loss
3. Autonomous agents maintain service health
4. All operations remain functional

## Auto-Resolution Features

The system automatically resolves:
- Expired domains (auto-renew)
- Stopped VPS instances (auto-start)
- Failed agents (auto-restart)
- Missing backups (auto-create)
- API connection issues (auto-retry)

## Integration Points

### Add to Existing Agents:
```python
# In your agent code
from hostinger.hostinger_manager import HostingerManager

manager = HostingerManager()
domains = manager.list_domains()
```

### Launch on System Startup:
Add to Windows Task Scheduler or systemd:
```bash
python C:\AI.worktrees\worktree-2025-12-31T05-31-01\infinity-matrix\ai_stack\autonomous_controller.py
```

## Future Enhancements
- Email/SMS notifications for critical alerts
- Web dashboard for monitoring
- Multi-region VPS management
- Automated cost optimization
- DNS failover automation
- Auto-scaling based on metrics

## Support
All operations are logged to `C:\AI\logs\` for troubleshooting.
No GitHub or external dependencies required for core functionality.
