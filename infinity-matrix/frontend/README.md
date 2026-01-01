# InfinityXAI Frontend - infinityxai.com

This is the production frontend for **infinityxai.com**, connected to the InfinityXAI backend orchestration server.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Backend Connection

The frontend supports **dual-backend architecture**: Cloud AI (Vertex) and local Ollama.

### Environment Configuration

**Development** (`.env.development`):
```env
VITE_API_URL=http://localhost:3001
VITE_OLLAMA_HOST=http://localhost:11434
VITE_OLLAMA_ENABLED=true
VITE_OLLAMA_FALLBACK_HOST=
VITE_OLLAMA_FALLBACK_ENABLED=false
```

**Production** (`.env.production`):
```env
VITE_API_URL=https://api.infinityxai.com
VITE_OLLAMA_HOST=https://ollama.infinityxai.com
VITE_OLLAMA_ENABLED=true
VITE_OLLAMA_FALLBACK_HOST=
VITE_OLLAMA_FALLBACK_ENABLED=false
```

### Backend Options

#### 1. Cloud AI (Vertex AI) - Primary
- **URL**: Configured via `VITE_API_URL`
- **Port**: 3001 (local), api.infinityxai.com (production)
- **Models**: Gemini, PaLM, and other Google Cloud AI models
- **Cost**: Pay-per-use via Google Cloud
- **Features**: Enterprise-grade reliability, scalable inference

#### 2. Ollama (Local) - Parallel/Fallback
- **URL**: Configured via `VITE_OLLAMA_HOST`
- **Port**: 11434 (default)
- **Models**: llama2, mistral, neural-chat, etc.
- **Cost**: Free (runs locally)
- **Features**: Zero latency, complete privacy, offline capability

### Dual-Backend Architecture

The `/cloud-ai` page implements intelligent backend switching:

```javascript
// Automatic backend detection on page load
1. Tests Cloud AI connectivity
2. Tests Ollama connectivity  
3. If Ollama available → use Ollama tab (preferred)
4. If only Cloud available → use Cloud AI tab
5. If neither available → show error with instructions
```

**Tab-based switching** allows users to manually select between backends:
- **Cloud AI Tab** (Blue): Vertex AI models, cloud processing
- **Ollama Tab** (Green): Local models, zero-cost processing

**Intelligent fallback**: If one backend fails, automatically switches to the other.

### Setting up Ollama Locally

```bash
# 1. Download and install Ollama
# Visit: https://ollama.ai

# 2. Start Ollama server
ollama serve

# 3. In another terminal, pull models
ollama pull llama2
ollama pull mistral
ollama pull neural-chat

# 4. Frontend will auto-detect at http://localhost:11434
```

### API Configuration

Each backend has dedicated API functions:

**Cloud AI** (`/cloud/` endpoints):
- `GET /cloud/models` - List available Vertex AI models
- `GET /cloud/health` - Check backend health
- `POST /cloud/ai/process` - Process with cloud model

**Ollama** (local or via proxy):
- Uses Ollama REST API
- Auto-detects primary and fallback instances
- Health check via `/api/tags`
- Processing via `/api/generate`

## Features

### 1. **Landing Page** (`/`)
- Hero section with feature highlights
- Company information
- Call-to-action buttons
- SEO optimized

### 2. **Cloud AI Processing** (`/cloud-ai`)
- Interactive AI model selection
- Real-time prompt processing
- Cost estimation
- Service health monitoring
- Model information display
- Result streaming

### 3. **Additional Pages**
- Admin Dashboard (`/admin`)
- Chat Interface (`/chat`)
- Technology Stack (`/technology`)
- Services (`/services`)
- Pricing (`/pricing`)
- Vision Cortex (`/vision-cortex`)
- And more...

## Architecture

```
frontend/
├── src/
│   ├── pages/
│   │   ├── CloudAIPage.jsx       # NEW: Cloud AI interface
│   │   ├── LandingPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── ... (other pages)
│   ├── components/
│   │   ├── ui/                   # Radix UI components
│   │   ├── NeuralNetworkCanvas
│   │   └── ... (other components)
│   ├── lib/                      # Utility functions
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── tools/
│   └── generate-llms.js          # LLM generation tool
├── package.json
├── vite.config.js               # Vite + API proxy config
├── tailwind.config.js
├── postcss.config.js
└── .env.*                        # Environment files
```

## API Endpoints

The Cloud AI page integrates with these backend endpoints:

### Get Available Models
```http
GET /cloud/models
```

Response:
```json
{
  "models": [
    {
      "id": "vertex-gemini-2.0",
      "name": "Gemini 2.0",
      "description": "Advanced multimodal model",
      "provider": "Google Vertex AI",
      "costPerToken": 0.0001
    }
  ]
}
```

### Process with Cloud AI
```http
POST /cloud/ai/process
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "modelId": "vertex-gemini-2.0",
  "config": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

Response:
```json
{
  "result": "Generated response",
  "cost": 0.0025,
  "tokensUsed": 25
}
```

### Service Health
```http
GET /cloud/health
```

Response:
```json
{
  "status": "healthy",
  "quotaRemaining": 1000,
  "activeModels": 5
}
```

## Routing Configuration

The application uses React Router for client-side routing. API requests automatically route through the proxy configured in `vite.config.js`.

### Request Flow
```
Frontend Request
      ↓
Vite Dev Server (port 3000)
      ↓
Proxy (rewrite /api → backend)
      ↓
Backend API (port 3001)
      ↓
Vertex AI Cloud Models
```

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Radix UI**: Headless UI components
- **Lucide React**: Icon library

## Development Tips

### Running Backend & Frontend Together

**Terminal 1 - Backend:**
```bash
cd orchestration
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Both will be available:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Testing Cloud AI Page

1. Start backend (ensures port 3001 is running)
2. Navigate to http://localhost:3000/cloud-ai
3. Select a model from the dropdown
4. Enter a prompt and click "Process with AI"
5. View results and estimated cost

## Deployment

### Build for Production
```bash
npm run build
```

This generates an optimized build in the `dist/` directory.

### Deployment Steps

1. Build the application: `npm run build`
2. Deploy `dist/` folder to hosting provider
3. Ensure backend API URL is configured in `.env.production`
4. Set up CORS headers if backend is on different domain

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_URL` | http://localhost:3001 | https://api.infinityxai.com |

## Troubleshooting

### Cloud AI page shows "Failed to load models"
- Ensure backend is running on port 3001
- Check that `/cloud/models` endpoint is accessible
- Verify CORS configuration on backend
- Check browser console for detailed errors

### API requests failing
- Verify `VITE_API_URL` environment variable
- Ensure backend is running
- Check if port 3001 is already in use
- Review backend CORS settings

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear Vite cache: `rm -rf .vite`

## Technologies

- **React 19**: UI library
- **Vite**: Build tool
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **Firebase**: Optional authentication
- **Framer Motion**: Animations
- **Radix UI**: Component library

## Contributing

When adding new pages or components:

1. Create page in `src/pages/`
2. Add route in `App.jsx`
3. Update navigation as needed
4. Follow existing code style and component patterns

## License

See LICENSE file in project root
