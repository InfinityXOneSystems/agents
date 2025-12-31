# Infinity-Matrix Docker Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Computer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Docker Engine                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         infinity-network (bridge driver)          │  │  │
│  │  │                                                    │  │  │
│  │  │  ┌──────────────┐      ┌──────────────┐          │  │  │
│  │  │  │   Frontend   │      │   Orchestr.  │          │  │  │
│  │  │  │   (React)    │◄────►│  (Express)   │          │  │  │
│  │  │  │   Port 3000  │      │  Port 3001   │          │  │  │
│  │  │  │              │      │    /health   │          │  │  │
│  │  │  │ /hostinger   │      │ /hostinger/  │          │  │  │
│  │  │  │   page       │      │    info      │          │  │  │
│  │  │  └──────────────┘      └──────┬───────┘          │  │  │
│  │  │         ▲                     │                   │  │  │
│  │  │         │                     ▼                   │  │  │
│  │  │   ┌─────┴──────┬──────────────────┬─────────┐    │  │  │
│  │  │   │            │                  │         │    │  │  │
│  │  │   ▼            ▼                  ▼         ▼    │  │  │
│  │  │ ┌────────┐ ┌─────────┐ ┌──────────────┐ ┌─────┐ │  │  │
│  │  │ │ Hostinger │ │ Gateway │ │   Ollama    │ │ AI  │ │  │  │
│  │  │ │  Agent  │ │ (Python)│ │   (LLM)     │ │Srvs │ │  │  │
│  │  │ │(Python) │ │ :8000  │ │  :11434     │ │(Py) │ │  │  │
│  │  │ └────────┘ └─────────┘ └──────────────┘ └─────┘ │  │  │
│  │  │     │                          │                │  │  │
│  │  │     └──────────────────────────┼────────────────┘  │  │
│  │  │                                │                   │  │
│  │  │  Volumes:                       │                   │  │
│  │  │  • credentials/ (read-only)    │                   │  │
│  │  │  • ollama_data (persistent)    │                   │  │
│  │  └────────────────────────────────┼───────────────────┘  │
│  │                                   │                       │
│  └──────────────────────────────────┼───────────────────────┘
│                                      │
│  ┌──────────────────────────────────┴──────────────────────┐
│  │             File System                                 │
│  │  .env                 → Environment config              │
│  │  credentials/         → API keys (mounted)              │
│  │  docker-compose.yml   → Service definitions             │
│  │  Dockerfiles          → Service builds                  │
│  └─────────────────────────────────────────────────────────┘
│
│  ┌────────────────────────────────────────────────────────┐
│  │   Browser (http://localhost:3000)                      │
│  │   ▼                                                    │
│  │   Frontend Dashboard                                  │
│  │   └─ Hostinger Page (/hostinger)  [YOUR DASHBOARD]   │
│  └────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

## Service Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│  Browser User                                           │
└────────────────────┬──────────────────────────────────┘
                     │
                     │ User clicks /hostinger
                     │
                     ▼
         ┌──────────────────────────┐
         │  Frontend Service        │
         │  (React/Vite)            │
         │  localhost:3000          │
         │  ┌────────────────────┐  │
         │  │ HostingerPage.jsx  │  │
         │  └──────────┬─────────┘  │
         └─────────────┼────────────┘
                       │
                       │ HTTP Request to /hostinger/info
                       │
                       ▼
         ┌──────────────────────────┐
         │ Orchestration Service    │
         │ (Express/TypeScript)     │
         │ localhost:3001           │
         │ ┌────────────────────┐   │
         │ │ GET /hostinger/info│   │
         │ │ Endpoint           │   │
         │ └──────────┬─────────┘   │
         └────────────┼─────────────┘
                      │
                      │ Python Function Call
                      │
                      ▼
         ┌──────────────────────────┐
         │ AI Services              │
         │ (Python 3.12)            │
         │ hostinger_agent.py       │
         │ ┌────────────────────┐   │
         │ │ get_account_info() │   │
         │ │ get_domains()      │   │
         │ │ get_websites()     │   │
         │ └──────────┬─────────┘   │
         └────────────┼─────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌─────────────┐ ┌──────────────┐ ┌────────────┐
│ hostinger   │ │ Real Hostinger
│ _creds.json │ │ API           │ │ Fallback   │
│ (Local)     │ │ (if available)│ │ Mock Data  │
└──────┬──────┘ └──────┬───────┘ └────────────┘
       │               │
       └───────┬───────┘
               │
               ▼
      ┌─────────────────────────────┐
      │ Hostinger Account Data      │
      │ {                           │
      │   url: "...",               │
      │   status: "...",            │
      │   domains: [...],           │
      │   websites: [...]           │
      │ }                           │
      └──────────┬──────────────────┘
                 │
                 │ Return JSON Response
                 │
                 ▼
      ┌──────────────────────────────┐
      │ Orchestration (Express)      │
      │ Formats Response             │
      │ Sends to Frontend            │
      └──────────┬───────────────────┘
                 │
                 │ HTTP Response
                 │
                 ▼
      ┌──────────────────────────────┐
      │ Frontend (React)             │
      │ Updates UI Components        │
      │ Shows Dashboard              │
      └──────────┬───────────────────┘
                 │
                 │ Browser renders
                 │
                 ▼
      ┌──────────────────────────────┐
      │ Hostinger Dashboard          │
      │ Displays all info            │
      │ Live, animated, responsive   │
      └──────────────────────────────┘
```

## Docker Network Topology

```
┌─────────────────────────────────────────────────────┐
│          infinity-network (bridge)                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Service Discovery (DNS)                     │   │
│  │ • frontend:3000   → container name to IP    │   │
│  │ • orchestration:3001 → container name to IP │   │
│  │ • ollama:11434    → container name to IP    │   │
│  │ • api-gateway:8000 → container name to IP   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Services can reach each other by name:             │
│  • frontend can call http://orchestration:3001      │
│  • orchestration can call http://ollama:11434       │
│  • all services share network                       │
│                                                     │
└─────────────────────────────────────────────────────┘

Host Machine (localhost)
    │
    ├─ :3000 ──────────► frontend container
    ├─ :3001 ──────────► orchestration container
    ├─ :8000 ──────────► api-gateway container
    └─ :11434 ─────────► ollama container
```

## Volume Mounting Structure

```
Host Machine                    Docker Container
└── c:\AI\infinity-matrix/
    ├── credentials/
    │   └── hostinger_creds.json  ────► /app/credentials/ (read-only)
    │                                  Used by: orchestration, ai-services
    │
    ├── docker-compose.yml ────────────► Service Definitions
    │
    ├── .env ───────────────────────────► Environment Variables
    │
    └── ollama_data/ (volume)
        └── Models, cache           ───► /root/.ollama (persistent)
            (survives docker-compose down)
```

## Build Process Pipelines

### Frontend Multi-Stage Build
```
Stage 1: Builder
┌──────────────────┐
│ Node 18 Alpine   │
├──────────────────┤
│ npm ci           │
├──────────────────┤
│ npm run build    │
├──────────────────┤
│ Output: dist/    │
└──────────────────┘
         │
         │ Copy dist/
         ▼
Stage 2: Production
┌──────────────────┐
│ Node 18 Alpine   │
├──────────────────┤
│ install serve    │
├──────────────────┤
│ serve dist/      │
├──────────────────┤
│ Port: 3000       │
└──────────────────┘
```

### Orchestration Multi-Stage Build
```
Stage 1: Builder
┌──────────────────┐
│ Node 18 Alpine   │
├──────────────────┤
│ npm ci           │
├──────────────────┤
│ npm run build    │
│ (TypeScript)     │
├──────────────────┤
│ Output: dist/    │
└──────────────────┘
         │
         │ Copy dist/
         ▼
Stage 2: Production
┌──────────────────┐
│ Node 18 Alpine   │
├──────────────────┤
│ npm ci --prod    │
├──────────────────┤
│ node dist/server │
├──────────────────┤
│ Port: 3001       │
└──────────────────┘
```

### AI Services Build (Python)
```
┌──────────────────┐
│ Python 3.12      │
│ Slim             │
├──────────────────┤
│ Install: pip     │
│ curl, build-tools│
├──────────────────┤
│ pip install from │
│ requirements.txt │
├──────────────────┤
│ Copy app files   │
├──────────────────┤
│ CMD: health check│
└──────────────────┘
```

## Data Flow - Complete Example

```
USER JOURNEY: View Hostinger Dashboard

1. User Action
   └─► Open browser: http://localhost:3000/hostinger

2. Frontend Load
   └─► React loads HostingerPage.jsx component
       ├─ Fetch: GET /hostinger/info (from backend)
       ├─ Await response
       └─ Display dashboard

3. API Request
   └─► Orchestration service receives request
       ├─ Route: GET /hostinger/info
       ├─ Call: hostinger_agent.get_account_info()
       └─ Return JSON response

4. Python Agent
   └─► Load Hostinger API credentials
       ├─ Check: credentials/hostinger_creds.json OR env var
       ├─ Call: Real API if available
       ├─ Fallback: Mock data if API unavailable
       └─ Return: Formatted account data

5. Response Chain
   └─► Orchestration formats response
       ├─ Frontend receives JSON
       ├─ React updates state
       ├─ Components re-render
       └─► User sees dashboard

6. Display
   └─► Dashboard shows:
       ├─ Hostinger URL (prominent)
       ├─ Account status
       ├─ Domains list
       ├─ Websites list
       ├─ Animated transitions
       └─ Live refresh button
```

## Container Lifecycle

```
┌─────────────────────────────────────────────────────┐
│  docker-compose up -d                               │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 1. Create Network            │
    │    infinity-network          │
    │    (bridge driver)           │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 2. Pull Images               │
    │    (if not cached)           │
    │    node:18-alpine            │
    │    python:3.12-slim          │
    │    ... etc                   │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 3. Build Services            │
    │    frontend → image          │
    │    orchestration → image     │
    │    ai-services → image       │
    │    ... etc                   │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 4. Create Containers         │
    │    from images               │
    │    with volumes/networks     │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 5. Start Containers          │
    │    in dependency order       │
    │    (orchestration first)     │
    │    (frontend depends on it)  │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ 6. Services Running          │
    │    ✓ frontend :3000          │
    │    ✓ orchestration :3001     │
    │    ✓ ai-services            │
    │    ✓ api-gateway :8000       │
    │    ✓ ollama :11434           │
    │    ✓ crawler                 │
    │    ✓ setup-env               │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ READY FOR USE               │
    │ Access: localhost:3000      │
    └─────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  docker-compose down                                │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ Stop & Remove:               │
    │ • Containers                 │
    │ • Services                   │
    │ • Network                    │
    │                              │
    │ Preserve:                    │
    │ • Images                     │
    │ • Volumes (data)             │
    │ • .env, credentials          │
    └─────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Security Layers                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Credentials Management                   │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✓ Credentials in .env (not in git)          │  │
│  │ ✓ Mounted as read-only volumes              │  │
│  │ ✓ Never copied into Docker image            │  │
│  │ ✓ Environment variable fallback             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Layer 2: Container Isolation                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✓ Minimal Alpine base images                │  │
│  │ ✓ No unnecessary tools/services             │  │
│  │ ✓ Read-only volumes where possible          │  │
│  │ ✓ Health checks verify status               │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Layer 3: Network Security                         │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✓ Internal bridge network                   │  │
│  │ ✓ Service-to-service by name (DNS)          │  │
│  │ ✓ Only required ports exposed               │  │
│  │ ✓ Localhost access only (no external)       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Layer 4: Build-Time Security                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✓ .dockerignore excludes secrets            │  │
│  │ ✓ Multi-stage builds reduce image size      │  │
│  │ ✓ No secrets in Dockerfile ARG              │  │
│  │ ✓ Clean layer history                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0  
**Last Updated**: December 31, 2025  
**Status**: Production Ready ✅
