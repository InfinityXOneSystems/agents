# Hostinger CLI - Quick Commands from C:\AI\infinity-matrix

## Setup First (from PowerShell)
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01
python -m pip install requests python-dateutil
```

## Health Check
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli health
```

## Domain Commands
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01

# List all domains
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli domains list

# Get specific domain
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli domains get example.com

# Renew domain
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli domains renew example.com --years 1
```

## DNS Commands
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01

# List DNS records
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli dns list example.com

# Create DNS record
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli dns create example.com A www 192.168.1.1

# Delete DNS record
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli dns delete example.com record-id
```

## VPS Commands
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01

# List VPS
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli vps list

# Start VPS
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli vps start vps-id-123

# Stop VPS
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli vps stop vps-id-123

# Restart VPS
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli vps restart vps-id-123
```

## Billing Commands
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01

# Get billing info
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli billing info

# List invoices
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli billing invoices
```

## Backup & Services
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01

# Backup all data
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli backup

# List services
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli services list
```

## Launch Autonomous Controller
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01
python infinity-matrix\ai_stack\autonomous_controller.py
```

## OR Use the Easy Menu
```powershell
cd C:\AI\infinity-matrix
.\hostinger_setup.bat
```

## Your API Token Location
- File: `C:\AI\credentials\hostinger\api_token.json`
- Token: `Kn2PFrgqX7U7uT4uZsdpdQp7KAY94Kq1BvpRNVOj0bbffc63`

## Troubleshooting

### If you get "No module named 'requests'"
```powershell
pip install requests python-dateutil
```

### If you get path errors
Make sure you're in the correct directory:
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01
```

### Test the setup
```powershell
cd C:\AI.worktrees\worktree-2025-12-31T05-31-01
python infinity-matrix\ai_stack\hostinger\validate_integration.py
```
