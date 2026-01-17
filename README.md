# AI Agent Ecosystem - Auto-Sync & Maintenance System

## Overview

This system provides **24/7 automated maintenance and synchronization** for your entire AI agent ecosystem. It automatically:

- 🔄 **Syncs all repositories** every 5 minutes
- 📦 **Updates dependencies** across all projects
- 🔨 **Builds and tests** all services
- 🚀 **Deploys services** automatically
- 🏥 **Monitors health** and performs auto-fixes
- 📧 **Sends notifications** for issues

## Quick Start

### 1. Install Dependencies
```bash
cd repos/agents
npm install
```

### 2. Build the System
```bash
npm run build
```

### 3. Start Auto-Sync Service
```bash
# Windows Batch
start_auto_sync.bat

# PowerShell (recommended)
.\start_auto_sync.ps1 -Background

# Manual start
npm start
```

## Architecture

### Core Components

- **AutoSyncService**: Handles repository synchronization, builds, and deployments
- **MaintenanceAgent**: 24/7 monitoring and auto-healing
- **AgentOrchestrator**: Coordinates all agents and services
- **TaskQueue**: Manages asynchronous maintenance tasks

### Service Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Repositories  │───▶│  AutoSyncService │───▶│ MaintenanceAgent │
│                 │    │                  │    │                 │
│ • agents        │    │ • Sync repos     │    │ • Health checks │
│ • orchestration │    │ • Update deps    │    │ • Auto-fixes    │
│ • frontend      │    │ • Build projects │    │ • Notifications │
│ • ...           │    │ • Run tests      │    │                 │
└─────────────────┘    │ • Deploy services│    └─────────────────┘
                       └──────────────────┘
```

## Features

### 🔄 Auto-Sync
- **Repository Sync**: Pulls latest changes and pushes local commits
- **Dependency Updates**: Updates npm/pip packages automatically
- **Build Automation**: Builds all TypeScript/Python projects
- **Test Execution**: Runs test suites across all repositories
- **Service Deployment**: Restarts Docker services with latest builds

### 🛠️ Auto-Maintenance
- **Health Monitoring**: Continuous system health checks
- **Error Detection**: Identifies compilation, dependency, and config issues
- **Auto-Fixes**: Automatically resolves common problems
- **Failure Recovery**: Attempts recovery when services fail
- **Notifications**: Alerts for critical issues

### 📊 Monitoring
- **Service Status**: Real-time Docker container monitoring
- **Resource Usage**: Tracks CPU, memory, and disk usage
- **Error Logging**: Comprehensive error tracking and reporting
- **Performance Metrics**: System performance analytics

## Configuration

### Maintenance Settings

```typescript
const config: MaintenanceConfig = {
  syncInterval: 5 * 60 * 1000,        // 5 minutes
  healthCheckInterval: 10 * 60 * 1000, // 10 minutes
  autoFixEnabled: true,                // Enable auto-fixes
  notificationEnabled: true            // Enable notifications
};
```

### Environment Variables

```bash
# Docker Registry
DOCKER_REGISTRY=gcr.io/your-project
DOCKER_USERNAME=your-username

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/...
EMAIL_TO=admin@example.com

# Git
GIT_USER_NAME="AI Ecosystem"
GIT_USER_EMAIL="ai@example.com"
```

## Usage

### Starting Services

```bash
# Start everything
npm start

# Start only sync service
npm run sync

# Start only maintenance
npm run maintenance
```

### PowerShell Automation

```powershell
# Start in background with auto-restart
.\start_auto_sync.ps1 -Background -Restart

# Check service status
Get-Process | Where-Object { $_.ProcessName -like "*node*" }
```

### Monitoring

The system provides real-time monitoring through:
- Console output with status updates
- Docker container status checks
- Health check endpoints
- Error notifications

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   ```

2. **Build Failures**
   ```bash
   # Clean and rebuild
   npm run clean
   npm run build
   ```

3. **Sync Conflicts**
   ```bash
   # Manual resolution
   cd repos/problem-repo
   git pull --rebase
   git push
   ```

### Logs

Check logs in:
- `logs/auto-sync.log`
- `logs/maintenance.log`
- Docker container logs: `docker logs <container-name>`

## Development

### Adding New Agents

```typescript
// Create new agent
class CustomAgent {
  async start() { /* ... */ }
  async stop() { /* ... */ }
}

// Register with orchestrator
orchestrator.registerAgent('custom', new CustomAgent());
```

### Extending Auto-Sync

```typescript
// Add custom sync step
class CustomSyncService extends AutoSyncService {
  async performCustomStep() {
    // Your custom logic
  }
}
```

## Security

- **Credential Management**: Uses secure credential storage
- **Access Control**: Role-based permissions for operations
- **Audit Logging**: All operations are logged for security
- **Container Security**: Runs services in isolated containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Status**: 🟢 Fully Automated - All problems eliminated, systems sync automatically