# Infinity-Matrix: Unified AI Agent Orchestration System

A production-grade multi-agent system combining TypeScript orchestration with Python AI agents for enterprise-scale autonomous operations.

## 🏗️ Architecture

**Two-Layer Design:**
- **Orchestration Layer** (TypeScript/Node.js): HTTP API, agent coordination, task distribution
- **AI Layer** (Python): Specialized agents, Vision Cortex multi-agent system, service integrations

```
┌─────────────────────────────────────────┐
│        Express.js REST API (3001)       │
├─────────────────────────────────────────┤
│  Agent Orchestrator (TypeScript)        │
├─────────────────────────────────────────┤
│  Vision Cortex (Python Multi-Agent)     │
├─────────────────────────────────────────┤
│  Specialized Agents & Integrations      │
│  (GitHub, Firebase, GCP, Hostinger)     │
└─────────────────────────────────────────┘
```

## 📁 Directory Structure

```
infinity-matrix/
├── orchestration/              # TypeScript Orchestration Layer (NEW - CONSOLIDATED)
│   ├── agents/                 # Agent orchestration
│   ├── server/                 # Express.js HTTP server
│   ├── modules/                # Agent ecosystem modules
│   ├── types/                  # Type definitions
│   ├── utils/                  # Utilities
│   ├── package.json            # NPM dependencies
│   └── tsconfig.json           # TypeScript config
│
├── ai_stack/                   # Python AI Agents
│   ├── agents/                 # Individual AI agents
│   ├── vision_cortex/          # Multi-agent orchestrator
│   ├── hostinger/              # Hostinger API integration
│   ├── github/                 # GitHub agent
│   ├── firebase/               # Firebase agent
│   ├── google_cloud/           # Google Cloud agent
│   ├── system_health_check.py  # Health monitoring
│   └── requirements.txt        # Python dependencies
│
├── auto_builder/               # Automated code generation
├── gateway_stack/              # Gateway layer
├── vscode-extension/           # VS Code integration
├── monitoring/                 # Monitoring systems
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
├── package.json                # Root monorepo config
└── ARCHITECTURE.md             # Detailed architecture docs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm/npm installed

### Installation

```bash
cd infinity-matrix

# Install root dependencies
npm install

# Install orchestration dependencies
cd orchestration && npm install && cd ..

# Or with Python dependencies
pip install -r ai_stack/requirements.txt
```

### Running the System

```bash
# Start orchestration server (TypeScript)
npm run start:orchestration
# Server runs on http://localhost:3001

# In another terminal, verify system health (Python)
npm run health:check

# Run all tests
npm test

# Run Python agent tests
npm run agents:test
```

### Development Mode

```bash
# Start with auto-reload
npm run dev
```

## 📊 System Components

### Orchestration (TypeScript)
- **AgentOrchestrator**: Main task distribution and coordination
- **ResearchAgent**: Information gathering and analysis
- **TaskQueue**: Work queue management
- **HTTP Server**: REST API endpoints

### AI Stack (Python)
- **Vision Cortex**: Multi-agent orchestrator and coordinator
- **Crawler Agent**: Data collection and analysis
- **Ingestion Agent**: Data cleaning and normalization
- **Predictor Agent**: AI predictions and analysis
- **CEO Agent**: Decision-making and strategic planning
- **Strategist Agent**: Planning and strategy
- **Organizer Agent**: Data organization and indexing
- **Validator Agent**: Quality assurance and testing
- **Documentor Agent**: Documentation generation

### Service Integrations
- **Hostinger**: Hosting and domain management
- **GitHub**: Repository and issue management
- **Firebase**: Real-time database and auth
- **Google Cloud**: Cloud storage and AI services

## 🔌 API Endpoints

### Health Check
- `GET /health` - System health status

### Agent Management
- `GET /agents` - List all agents
- `POST /agents/:name/task` - Submit task to agent
- `GET /tasks/:taskId` - Get task status

### Research
- `POST /research` - Submit research task
- `GET /research/:taskId` - Get research results

## 🧪 Testing

```bash
# All tests
npm test

# Python tests only
npm run agents:test

# System health check
npm run health:check

# Specific test file
pytest ai_stack/simulation_test.py -v

# With coverage
pytest ai_stack/ --cov=ai_stack -v
```

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture
- **[CONSOLIDATION_CHECKLIST.md](CONSOLIDATION_CHECKLIST.md)** - Migration guide
- **[CONSOLIDATION_COMPLETE.md](CONSOLIDATION_COMPLETE.md)** - Consolidation status

## 🔄 Communication Flow

1. **External Request** → Express.js Server (port 3001)
2. **Request Routing** → AgentOrchestrator (TypeScript)
3. **Task Distribution** → Vision Cortex (Python)
4. **Agent Execution** → Specialized Agents
5. **Service Integration** → GitHub, Firebase, GCP, Hostinger
6. **Result Aggregation** → Response to client

## 🛠️ Development

### Adding New Agents

**Python Agent:**
```python
# Create in ai_stack/agents/
class MyAgent(BaseAgent):
    def execute(self, task):
        # Implementation
        pass
```

**TypeScript Task:**
```typescript
// Create in orchestration/agents/
orchestrator.submitTask('my-task', { /* data */ });
```

### Building & Deploying

```bash
# Build orchestration
npm run build:orchestration

# Create distribution
npm run build

# Run in production
npm start
```

## 🔐 Security

- Environment variables for credentials
- Secure JSON credential storage (600 permissions)
- API key encryption
- Request validation and sanitization

## 📈 Monitoring

System health can be monitored via:
- `npm run health:check` - Automated health check
- REST API `/health` endpoint
- Python agent status monitoring
- Log aggregation in `logs/` directory

## 🐛 Troubleshooting

### Tests Failing
```bash
# Clear cache and retry
npm run clean
npm install
npm test
```

### Import Errors
```bash
# Verify orchestration structure
cd orchestration && npm run build
```

### Python Dependency Issues
```bash
# Reinstall Python environment
pip install -r ai_stack/requirements.txt --force-reinstall
```

## 📞 Support

For detailed information on system components and architecture, see:
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [CONSOLIDATION_COMPLETE.md](CONSOLIDATION_COMPLETE.md)

## 📝 License

Proprietary - InfinityXOne Systems

## 🎯 Status

✅ Consolidated - Single source of truth  
✅ Tested - All core tests passing  
✅ Documented - Architecture fully documented  
✅ Production Ready - Ready for deployment
