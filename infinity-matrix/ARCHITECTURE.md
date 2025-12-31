# Infinity-Matrix Architecture

## Current Structure (Consolidated)

```
infinity-matrix/
├── ai_stack/                    # Python AI Agents
│   ├── agents/                  # Individual Python agents
│   │   ├── crawler_agent.py
│   │   ├── ingestion_agent.py
│   │   ├── predictor_agent.py
│   │   ├── ceo_agent.py
│   │   ├── strategist_agent.py
│   │   ├── organizer_agent.py
│   │   ├── validator_agent.py
│   │   └── documentor_agent.py
│   ├── hostinger/               # Hostinger API Integration
│   ├── github/                  # GitHub Agent
│   ├── firebase/                # Firebase Agent
│   ├── google_cloud/            # Google Cloud Agent
│   ├── vision_cortex/           # Multi-Agent Orchestrator
│   └── [other AI stacks]
│
├── orchestration/               # TypeScript/Node.js Orchestration Layer (NEW - CONSOLIDATED)
│   ├── agents/                  # TypeScript agents
│   │   ├── orchestrator.ts      # Main agent orchestrator
│   │   ├── research.ts
│   │   └── [other agents]
│   ├── server/                  # Express.js server
│   │   └── index.ts             # Main server entry point
│   ├── modules/                 # Agent ecosystem modules
│   │   ├── orchestration/       # Orchestration module
│   │   ├── core/                # Core module system
│   │   └── [other modules]
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   ├── automation/              # Automation workflows
│   └── services/                # Service layer
│
├── frontend_stack/              # Legacy - to be deprecated
│   ├── unified-orchestrator.ts  # Keep for reference
│   └── orchestrator.ts
│
├── gateway_stack/               # Gateway layer
├── auto_builder/                # Auto-builder system
├── vscode-extension/            # VS Code integration
├── monitoring/                  # Monitoring systems
├── scripts/                     # Utility scripts
├── docs/                        # Documentation
└── [configuration files]
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER / EXTERNAL API                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  Express.js Server (orchestration/)   │
        │  - REST API endpoints                 │
        │  - WebSocket for real-time updates    │
        └───────────────────────────────────────┘
                            │
                ┌───────────┴──────────────┐
                ▼                          ▼
    ┌─────────────────────┐    ┌──────────────────────┐
    │  TypeScript Agents  │    │  Agent Orchestrator  │
    │  - Research Agent   │    │  - Task Distribution │
    │  - Maintenance      │    │  - Load Balancing    │
    │  - Coding Agent     │    │  - State Management  │
    └─────────────────────┘    └──────────────────────┘
                │                        │
                │       ┌────────────────┼────────────────┐
                │       │                │                │
                ▼       ▼                ▼                ▼
            ┌──────────────────────────────────────────────────┐
            │         Python AI Agents (ai_stack/)             │
            │  ┌────────────────────────────────────────────┐  │
            │  │  Vision Cortex (Multi-Agent Orchestrator)  │  │
            │  │  ├── Crawler Agent                         │  │
            │  │  ├── Ingestion Agent                       │  │
            │  │  ├── Predictor Agent                       │  │
            │  │  ├── CEO Agent (decision making)           │  │
            │  │  ├── Strategist Agent                      │  │
            │  │  ├── Organizer Agent                       │  │
            │  │  ├── Validator Agent                       │  │
            │  │  └── Documentor Agent                      │  │
            │  └────────────────────────────────────────────┘  │
            │  ┌────────────────────────────────────────────┐  │
            │  │  Specialized Agent Modules                 │  │
            │  │  ├── Hostinger Agent (API integration)     │  │
            │  │  ├── GitHub Agent                          │  │
            │  │  ├── Firebase Agent                        │  │
            │  │  └── Google Cloud Agent                    │  │
            │  └────────────────────────────────────────────┘  │
            └──────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼
    ┌────────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ GitHub │    │ Firebase │   │  Google  │   │Hostinger │
    │  API   │    │ Firestore│   │ Cloud    │   │   API    │
    └────────┘    └──────────┘   └──────────┘   └──────────┘
```

## Module Responsibilities

### `orchestration/server/` - HTTP Server
- Express.js REST API
- WebSocket connections
- Request routing
- Response formatting

### `orchestration/agents/` - Agent Orchestration
- `AgentOrchestrator`: Main task distribution
- `ResearchAgent`: Information gathering
- Task queue management
- Agent health monitoring

### `ai_stack/vision_cortex/` - Python AI Orchestration
- Multi-agent coordination
- Agent workflow execution
- Result aggregation
- State management

### `ai_stack/[agents]/` - Specialized Agents
- Domain-specific operations
- API integrations
- Data processing
- Credential management

## Starting the System

### TypeScript Services
```bash
cd orchestration
npm install
npm run build
npm run start
```

### Python Agents
```bash
cd ai_stack
python system_health_check.py
python -m pytest  # Run tests
```

## API Endpoints (orchestration/server)

### Health Check
- `GET /health` - System health status

### Agent Management
- `GET /agents` - List all agents
- `POST /agents/:name/task` - Submit task to agent
- `GET /tasks/:taskId` - Get task status

### Research Tasks
- `POST /research` - Submit research task
- `GET /research/:taskId` - Get research results

## Migration Notes

**Consolidated from:**
- `c:\AI\src\agents\orchestrator.ts` → `orchestration/agents/`
- `c:\AI\src\server\` → `orchestration/server/`
- `c:\AI\repos\agents\src\` → `orchestration/modules/`
- `c:\AI\infinity-matrix\frontend_stack\` → Legacy (consider deprecation)

**Next Steps:**
1. ✅ Consolidate code into single `orchestration/` directory
2. ⏳ Update all import paths in orchestration layer
3. ⏳ Create unified package.json for orchestration
4. ⏳ Test end-to-end (Python ↔ TypeScript communication)
5. ⏳ Remove legacy `frontend_stack/` duplicate code
6. ⏳ Document API contracts between Python and TypeScript

## Testing

```bash
# Run all tests
npm test              # TypeScript tests
pytest              # Python tests

# Health check
python system_health_check.py
```
