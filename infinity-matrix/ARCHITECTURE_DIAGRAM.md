# System Architecture Diagram

## Complete Infinity-Matrix System with Vertex AI Integration

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER (User)                             │
├────────────────────────────────────────────────────────────────────────────┤
│                   http://localhost:5173                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                   FRONTEND APPLICATION                             │  │
│  │                    (React.js + Vite)                               │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │  │
│  │  │  LandingPage     │  │  HostingerPage   │  │  CloudAIPage ✨  │ │  │
│  │  │  (Main)          │  │  (New)           │  │  (New)           │ │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  CloudAIPage Component                                      │  │  │
│  │  ├──────────────────────────────────────────────────────────────┤  │  │
│  │  │  • Model Selector (5 models with specs)                     │  │  │
│  │  │  • Configuration Panel (temp, tokens, task type)            │  │  │
│  │  │  • Prompt Input (textarea)                                  │  │  │
│  │  │  • Health Dashboard (budget, quotas, uptime)                │  │  │
│  │  │  • Results Display (response, tokens, costs)                │  │  │
│  │  │  • Error Handling & Loading States                          │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                            ↓ HTTP Requests                                 │
└────────────────────────────────────────────────────────────────────────────┘
                             ↓ fetch()
┌────────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / ORCHESTRATION                           │
│                    http://localhost:3001                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   EXPRESS.JS SERVER                                 │  │
│  │              (TypeScript/Node.js)                                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  HEALTH ENDPOINTS                                                   │  │
│  │  ├─ GET  /health          → Basic health check                      │  │
│  │  ├─ GET  /healthz         → K8s health check                        │  │
│  │  └─ GET  /readyz          → Detailed status                         │  │
│  │                                                                      │  │
│  │  AGENT ENDPOINTS                                                    │  │
│  │  ├─ POST /agents/research/execute    → Research tasks              │  │
│  │  ├─ GET  /agents/tasks                → List all tasks             │  │
│  │  ├─ GET  /agents/tasks/:id            → Task status                │  │
│  │  ├─ DELETE /agents/tasks/:id          → Cancel task                │  │
│  │  ├─ GET  /agents/info                 → Agent info                 │  │
│  │  └─ GET  /agents/stats                → Orchestrator stats         │  │
│  │                                                                      │  │
│  │  ✨ CLOUD AI ENDPOINTS (NEW)                                       │  │
│  │  ├─ GET  /cloud/models        → List 5 Vertex AI models            │  │
│  │  ├─ POST /cloud/ai/process    → Process with cloud AI              │  │
│  │  └─ GET  /cloud/health        → Service health + quotas            │  │
│  │                                                                      │  │
│  │  MIDDLEWARE                                                         │  │
│  │  ├─ CORS                      → Cross-origin support               │  │
│  │  ├─ JSON Parser               → Request body parsing               │  │
│  │  ├─ Request Logging           → HTTP logging                       │  │
│  │  └─ Error Handler             → Exception handling                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                              ↓ Route Processing                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              CLOUD AI REQUEST HANDLER                                │  │
│  │          (POST /cloud/ai/process)                                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  1. VALIDATE REQUEST                                                │  │
│  │     ✓ Check prompt is string                                        │  │
│  │     ✓ Extract model_id, task_type, temperature, max_tokens         │  │
│  │                                                                      │  │
│  │  2. SELECT MODEL (Task Router)                                      │  │
│  │     • code     → code-bison                                         │  │
│  │     • chat     → chat-bison                                         │  │
│  │     • image    → gemini-pro-vision                                  │  │
│  │     • research → gemini-ultra                                       │  │
│  │     • general  → gemini-pro (default)                               │  │
│  │                                                                      │  │
│  │  3. CONFIGURE MODEL                                                 │  │
│  │     • Apply temperature setting                                     │  │
│  │     • Set max output tokens                                         │  │
│  │     • Configure safety settings                                     │  │
│  │                                                                      │  │
│  │  4. CALL CLOUD PROCESSING (Mock or Real)                           │  │
│  │     → See "CLOUD PROCESSING LAYER" below                            │  │
│  │                                                                      │  │
│  │  5. TRACK COSTS                                                     │  │
│  │     • Count input tokens                                            │  │
│  │     • Count output tokens                                           │  │
│  │     • Calculate costs ($0.0005-0.03/1k tokens)                     │  │
│  │     • Include in response                                           │  │
│  │                                                                      │  │
│  │  6. RETURN RESPONSE                                                 │  │
│  │     {                                                                │  │
│  │       status: "success",                                            │  │
│  │       result: { model, response, processing_time_ms },             │  │
│  │       usage: { input_tokens, output_tokens, total_tokens },        │  │
│  │       cost_estimate: { input_cost, output_cost, total_cost }       │  │
│  │     }                                                                │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                    CLOUD PROCESSING LAYER                                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                   ┌─────────────────────────┐                             │
│                   │   TASK ROUTING ENGINE   │                             │
│                   ├─────────────────────────┤                             │
│                   │ Input: prompt, task     │                             │
│                   │ Output: selected_model  │                             │
│                   │ Method: keyword match   │                             │
│                   └───────────┬─────────────┘                             │
│                               │                                            │
│                   ┌───────────▼──────────────────┐                        │
│                   │  TRY VERTEX AI (Primary)     │                        │
│                   ├────────────────────────────────┤                       │
│                   │                                │                       │
│                   │  Google Cloud Project:         │                       │
│                   │  infinity-x-one-systems        │                       │
│                   │                                │                       │
│                   │  ✨ 5 Models Available:        │                       │
│                   │  ┌──────────────────────────┐  │                       │
│                   │  │ 1. gemini-pro            │  │                       │
│                   │  │    General, code, reason │  │                       │
│                   │  │    Max: 8k tokens        │  │                       │
│                   │  │    Cost: $0.0005/1k      │  │                       │
│                   │  └──────────────────────────┘  │                       │
│                   │  ┌──────────────────────────┐  │                       │
│                   │  │ 2. gemini-pro-vision     │  │                       │
│                   │  │    Images, visual        │  │                       │
│                   │  │    Max: 8k tokens        │  │                       │
│                   │  │    Cost: $0.001/1k       │  │                       │
│                   │  └──────────────────────────┘  │                       │
│                   │  ┌──────────────────────────┐  │                       │
│                   │  │ 3. gemini-ultra          │  │                       │
│                   │  │    Research, complex     │  │                       │
│                   │  │    Max: 16k tokens       │  │                       │
│                   │  │    Cost: $0.01/1k        │  │                       │
│                   │  └──────────────────────────┘  │                       │
│                   │  ┌──────────────────────────┐  │                       │
│                   │  │ 4. code-bison            │  │                       │
│                   │  │    Code generation       │  │                       │
│                   │  │    Max: 8k tokens        │  │                       │
│                   │  │    Cost: $0.001/1k       │  │                       │
│                   │  └──────────────────────────┘  │                       │
│                   │  ┌──────────────────────────┐  │                       │
│                   │  │ 5. chat-bison            │  │                       │
│                   │  │    Chat, conversation    │  │                       │
│                   │  │    Max: 4k tokens        │  │                       │
│                   │  │    Cost: $0.0005/1k      │  │                       │
│                   │  └──────────────────────────┘  │                       │
│                   │                                │                       │
│                   │  Authentication:               │                       │
│                   │  • API Key: VERTEX_AI_API_KEY  │                       │
│                   │  • Project: VERTEX_AI_PROJECT  │                       │
│                   │  • Region: us-central1         │                       │
│                   │                                │                       │
│                   │  Response Format:              │                       │
│                   │  {                             │                       │
│                   │    text: "...",                │                       │
│                   │    tokens_used: {...},         │                       │
│                   │    finish_reason: "STOP"       │                       │
│                   │  }                             │                       │
│                   │                                │                       │
│                   └────────────┬──────────┬────────┘                       │
│                                │          │                                │
│                         Success│          │Error/Timeout                  │
│                                │          │                                │
│                   ┌────────────▼──┐  ┌───▼────────────┐                   │
│                   │ Return Result  │  │FALLBACK LAYER  │                   │
│                   │ + Tokens       │  ├─────────────────┤                  │
│                   │ + Cost Info    │  │ TRY OLLAMA      │                  │
│                   └────────────────┘  │ (Local AI)      │                  │
│                                        │                 │                  │
│                                        │ localhost:11434 │                  │
│                                        │                 │                  │
│                                        │ If available,   │                  │
│                                        │ process locally │                  │
│                                        │                 │                  │
│                                        └────────┬────────┘                  │
│                                                 │                           │
│                                        ┌────────▼────────┐                 │
│                                        │ Return Fallback │                 │
│                                        │ Result         │                 │
│                                        └────────────────┘                  │
│                                                                             │
│  COST TRACKING SYSTEM                                                      │
│  ├─ Input tokens: prompt.length / 4                                        │
│  ├─ Output tokens: response.length / 4                                     │
│  ├─ Model rates: $0.0005 - $0.03 per 1k tokens                           │
│  ├─ Monthly budget: $1000                                                  │
│  ├─ Usage tracking: Real-time                                              │
│  └─ Alerts: When > 80% budget used                                         │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                         RESPONSE BACK TO CLIENT                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  {                                                                          │
│    "status": "success",                                                    │
│    "result": {                                                             │
│      "model": "code-bison",                                                │
│      "response": "def sort_list(items): return sorted(items)",             │
│      "processing_time_ms": 1250,                                           │
│      "temperature": 0.5,                                                   │
│      "timestamp": "2024-01-15T10:30:45Z"                                   │
│    },                                                                       │
│    "usage": {                                                              │
│      "input_tokens": 12,                                                   │
│      "output_tokens": 45,                                                  │
│      "total_tokens": 57                                                    │
│    },                                                                       │
│    "cost_estimate": {                                                      │
│      "input_cost": 0.000012,                                               │
│      "output_cost": 0.00009,                                               │
│      "total_cost": 0.000102,                                               │
│      "currency": "USD"                                                     │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
│  ↓ Displayed in CloudAIPage                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────┐                      │
│  │ Result Display                                  │                      │
│  ├─────────────────────────────────────────────────┤                      │
│  │ Model: code-bison                               │                      │
│  │ Processing Time: 1250ms                         │                      │
│  │                                                 │                      │
│  │ Response:                                       │                      │
│  │ [def sort_list(items): return sorted(items)]   │                      │
│  │                                                 │                      │
│  │ Token Usage:                                    │                      │
│  │ Input: 12 | Output: 45 | Total: 57             │                      │
│  │                                                 │                      │
│  │ Cost Estimate:                                  │                      │
│  │ Total: $0.000102 USD                            │                      │
│  └─────────────────────────────────────────────────┘                      │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
┌─────────┐                ┌──────────────┐              ┌────────────────┐
│ Browser │                │   Server     │              │  Cloud (GCP)   │
└────┬────┘                └──────┬───────┘              └────────┬───────┘
     │                             │                               │
     │  1. User enters prompt      │                               │
     ├────────────────────────────►│                               │
     │                             │                               │
     │                  2. POST /cloud/ai/process                  │
     │                             │                               │
     │                             │  3. Validate & Route          │
     │                             ├──────────────────┐            │
     │                             │                  │            │
     │                             │◄─────────────────┘            │
     │                             │                               │
     │                             │  4. Call API                  │
     │                             ├──────────────────────────────►│
     │                             │                               │
     │                             │  5. Process Prompt            │
     │                             │◄──────────────────────────────┤
     │                             │    (gemini-pro, code-bison,   │
     │                             │     etc)                      │
     │                             │                               │
     │                             │  6. Return Response           │
     │                             ├──────────────────────────────►│
     │                             │                               │
     │                             │◄──────────────────────────────┤
     │                             │    text + tokens + metadata   │
     │                             │                               │
     │                             │  7. Calculate Cost            │
     │                             ├──────────────────┐            │
     │                             │                  │            │
     │                             │◄─────────────────┘            │
     │                             │                               │
     │  8. 200 + Response          │                               │
     │◄────────────────────────────┤                               │
     │    (result, usage, cost)    │                               │
     │                             │                               │
     │  9. Display in UI           │                               │
     ├──────────┐                  │                               │
     │           │                  │                               │
     │◄──────────┘                  │                               │
     │                             │                               │
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│        Frontend Layer (React 19.0)          │
├─────────────────────────────────────────────┤
│ • React 19.0                                │
│ • Vite (Build tool)                         │
│ • React Router (Navigation)                 │
│ • Tailwind CSS (Styling)                    │
│ • Lucide Icons (UI Icons)                   │
│ • Framer Motion (Animations) - Optional    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Orchestration Layer (Express.js + TS)    │
├─────────────────────────────────────────────┤
│ • Node.js 18+                               │
│ • Express.js 4.18+                          │
│ • TypeScript                                │
│ • Agent Orchestrator                        │
│ • CORS & Middleware                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    Cloud Processing Layer (GCP)             │
├─────────────────────────────────────────────┤
│ • Google Vertex AI (Primary)                │
│ • 5 Generative Models                       │
│ • us-central1 Region                        │
│ • Safe text generation                      │
│ • Real-time streaming (optional)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    Fallback Layer (Local AI)                │
├─────────────────────────────────────────────┤
│ • Ollama (Local)                            │
│ • localhost:11434                           │
│ • Offline capability                        │
│ • No API key required                       │
└─────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│           Docker Compose Orchestration                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│  network: infinity-network (bridge driver)             │
│                                                         │
│  ┌─────────────────┐        ┌──────────────────┐      │
│  │   frontend      │        │   orchestration  │      │
│  │   (Node 18 +    │        │   (Node 18 +     │      │
│  │    React Vite)  │        │    Express)      │      │
│  │                 │        │                  │      │
│  │  Port: 5173     │        │  Port: 3001      │      │
│  │  HMR enabled    │        │  API endpoints   │      │
│  │  npm run dev    │        │  npm run dev     │      │
│  └────────┬────────┘        └────────┬─────────┘      │
│           │                          │                 │
│           └──────────────┬───────────┘                 │
│                          │                              │
│  ┌──────────────────┐    │    ┌─────────────────┐      │
│  │  api-gateway     │◄───┘    │  ai-services    │      │
│  │  (Node 18)       │         │  (Python 3.12)  │      │
│  │  Port: 8000      │         │  Port: 5000     │      │
│  └──────────────────┘         │                 │      │
│                               │  • Vertex AI    │      │
│  ┌──────────────────┐         │  • Ollama       │      │
│  │    ollama        │         │  • ML tasks     │      │
│  │  (Local LLMs)    │         │                 │      │
│  │  Port: 11434     │         └─────────────────┘      │
│  │                  │                                   │
│  │  Volume:         │         ┌─────────────────┐      │
│  │  ollama_data     │         │  setup-env      │      │
│  │  (persistent)    │         │  (Node 18)      │      │
│  └──────────────────┘         │  Initializes    │      │
│                               └─────────────────┘      │
│  ┌──────────────────┐         ┌─────────────────┐      │
│  │  credentials     │◄────────┤  credentials    │      │
│  │  (volume mount)  │         │  (read-only)    │      │
│  │  hostinger_creds │         │  vertex_ai_key  │      │
│  └──────────────────┘         └─────────────────┘      │
│                                                         │
│  Environment: .env file                                │
│  • HOSTINGER_API_KEY                                   │
│  • VERTEX_AI_API_KEY                                   │
│  • VERTEX_AI_PROJECT_ID                                │
│  • NODE_ENV, DEBUG, LOG_LEVEL                          │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

**Architecture created**: January 2024
**System**: Infinity-Matrix Cloud AI Integration
**Status**: ✅ COMPLETE
