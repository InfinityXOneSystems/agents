# AI Agent Ecosystem - Modular Architecture

A comprehensive, extensible module system for AI agents with cross-platform support (Python + Node.js/TypeScript).

## Architecture Overview

The system is organized into logical modules that can be independently developed, tested, and deployed:

### Core Modules

#### 🔐 Credential Management
- **Purpose**: Secure credential loading, management, and encryption
- **Components**:
  - `CredentialManager` (TypeScript wrapper)
  - `credential_manager.py` (Python implementation)
- **Features**:
  - Encrypted credential storage
  - Google Cloud & GitHub credential management
  - Automatic key rotation

#### 🔄 Sync & Integration
- **Purpose**: Repository synchronization and cloud integration
- **Components**:
  - `SyncIntegrationManager` (TypeScript orchestrator)
  - `AutoSyncService` (TypeScript sync service)
  - `repo_sync_agent.py` (Python repo sync)
  - `master_integrator.py` (Python integration)
- **Features**:
  - Automated repository syncing
  - Multi-cloud provider support
  - Real-time synchronization

#### 🔍 Monitoring & Maintenance
- **Purpose**: System monitoring, health checks, and automated maintenance
- **Components**:
  - `MonitoringMaintenanceManager` (TypeScript orchestrator)
  - `MaintenanceAgent` (TypeScript maintenance)
  - `system_fixer.py` (Python system fixes)
  - `background_tester.py` (Python testing)
  - `dashboard_guardian.py` (Python monitoring)
- **Features**:
  - 24/7 health monitoring
  - Automatic issue detection and fixing
  - Docker and service monitoring

#### 🧪 Testing & Validation
- **Purpose**: Code quality assurance and automated testing
- **Components**:
  - `TestingValidationManager` (TypeScript orchestrator)
  - `validation_agent.py` (Python validation)
- **Features**:
  - ESLint and Prettier validation
  - Jest and pytest integration
  - Automated code quality scoring

#### 🎯 Orchestration
- **Purpose**: Unified coordination of all modules and agents
- **Components**:
  - `OrchestrationManager` (TypeScript orchestrator)
  - `UnifiedAgentOrchestrator` (WebSocket/REST API)
  - `launch_all_agents.py` (Python launcher)
  - `master_launcher.py` (Python master launcher)
- **Features**:
  - RESTful API for module control
  - WebSocket real-time communication
  - Cross-platform agent launching

## Module System Features

### Extensibility
- **Plugin Architecture**: Easy to add new modules
- **Interface Contracts**: Standardized module interfaces
- **Dependency Management**: Automatic module dependency resolution

### Cross-Platform Support
- **Python Integration**: Seamless Python script execution from TypeScript
- **Process Management**: Robust inter-process communication
- **Environment Detection**: Automatic platform-specific behavior

### Error Handling & Logging
- **Centralized Logging**: Winston-based logging system
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Health Monitoring**: Real-time module status tracking

### Configuration Management
- **Environment Variables**: Flexible configuration via env vars
- **Runtime Configuration**: Dynamic module reconfiguration
- **Validation**: Configuration schema validation

## Usage

### Starting the System

```bash
# Build the project
npm run build

# Start all modules
npm start

# Start in development mode
npm run dev
```

### Module Management

```bash
# Check module statuses
npm run module-status

# Start specific module via API
curl -X POST http://localhost:8080/modules/credential-management/task \
  -H "Content-Type: application/json" \
  -d '{"taskName": "getGoogleCloud"}'
```

### API Endpoints

- `GET /modules` - List all modules
- `GET /modules/:name/status` - Get module status
- `POST /modules/:name/task` - Execute module task
- `POST /system/start` - Start all modules
- `POST /system/stop` - Stop all modules
- `GET /system/status` - Get system status

## Development

### Adding a New Module

1. Create module directory: `src/modules/your-module/`
2. Implement module class extending `BaseModule`
3. Export from `src/modules/index.ts`
4. Register in `loadAllModules()` function

### Module Interface

```typescript
import { BaseModule, ModuleConfig } from '../core';

export interface YourModuleConfig extends ModuleConfig {
  // Your config properties
}

export class YourModule extends BaseModule {
  constructor(config?: Partial<YourModuleConfig>) {
    super('your-module', '1.0.0', config);
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    // Implement your tasks
  }
}
```

## Configuration

### Environment Variables

- `CREDENTIALS_DIR`: Path to credentials directory (default: `../../../credentials`)
- `PORT`: Orchestration API port (default: 8080)
- `NODE_ENV`: Environment mode

### Module Configuration

Each module accepts configuration overrides:

```typescript
const module = new CredentialManager({
  encryptionEnabled: true,
  credentialsDir: '/custom/path'
});
```

## Dependencies

### Runtime Dependencies
- `express`: REST API server
- `ws`: WebSocket support
- `winston`: Logging
- `axios`: HTTP client
- `dockerode`: Docker integration

### Development Dependencies
- `typescript`: TypeScript compiler
- `@types/*`: Type definitions
- `jest`: Testing framework
- `eslint`: Code linting

## Python Integration

The system integrates with Python agents located in the `credentials/` directory:

- Scripts are executed as subprocesses
- JSON-based communication protocol
- Automatic error handling and logging
- Cross-platform path resolution

## Monitoring & Maintenance

- **Health Checks**: Automatic system health monitoring
- **Auto-Fixing**: Self-healing capabilities for common issues
- **Logging**: Comprehensive logging with Winston
- **Metrics**: Performance and usage metrics collection

## Security

- **Encrypted Credentials**: GPG encryption for sensitive data
- **Access Control**: Module-level permission system
- **Audit Logging**: All operations are logged for security
- **Input Validation**: Comprehensive input sanitization

## Troubleshooting

### Common Issues

1. **Module Not Starting**: Check dependencies and configuration
2. **Python Script Errors**: Verify Python environment and script paths
3. **Port Conflicts**: Change default port via environment variable
4. **Permission Issues**: Ensure proper file system permissions

### Debug Mode

```bash
DEBUG=* npm start
```

## Contributing

1. Follow the module interface contracts
2. Add comprehensive tests
3. Update documentation
4. Ensure cross-platform compatibility
5. Follow TypeScript and ESLint standards