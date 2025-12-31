# Ollama Setup Guide for InfinityXAI Frontend

This guide walks you through setting up Ollama to run in parallel with the Cloud AI backend.

## 📋 Prerequisites

- Windows 10/11, macOS, or Linux
- 8GB+ RAM (16GB+ recommended)
- 10GB+ free disk space for models
- Git installed

## 🚀 Quick Setup (5 minutes)

### Step 1: Download & Install Ollama

**Windows:**
1. Visit [https://ollama.ai](https://ollama.ai)
2. Click "Download for Windows"
3. Run the installer
4. Follow the installation wizard
5. Restart your computer

**macOS:**
```bash
# Using Homebrew (recommended)
brew install ollama

# Or download from https://ollama.ai
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

### Step 2: Start Ollama Server

**Windows (GUI):**
1. Open Start Menu
2. Search for "Ollama"
3. Click to launch
4. Server starts automatically on port 11434

**macOS/Linux (Terminal):**
```bash
ollama serve
```

You should see:
```
Listening on 127.0.0.1:11434
```

### Step 3: Pull Your First Model

Open a new terminal and pull a model:

```bash
# Pull a lightweight model (recommended for first time)
ollama pull llama2

# Or other popular models:
ollama pull mistral        # Faster, good quality
ollama pull neural-chat    # Optimized for conversation
ollama pull dolphin        # Code-focused model
```

This downloads the model (1-5GB depending on model size).

### Step 4: Verify Installation

Test that Ollama is running:

```bash
# Check available models
curl http://localhost:11434/api/tags

# Test a simple generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'
```

### Step 5: Start the Frontend

```bash
cd c:\AI\infinity-matrix\frontend
npm run dev
```

Visit `http://localhost:3000/cloud-ai`

You should see:
- ✅ "Cloud AI (Vertex)" tab (blue)
- ✅ "Ollama (Local)" tab (green) - if Ollama is running

## 🎯 Frontend Integration

### Environment Variables

The frontend automatically detects Ollama on startup. Configuration in `.env.development`:

```env
# Primary Ollama instance
VITE_OLLAMA_HOST=http://localhost:11434

# Enable/disable Ollama
VITE_OLLAMA_ENABLED=true

# Optional: Secondary Ollama instance (for redundancy)
VITE_OLLAMA_FALLBACK_HOST=
VITE_OLLAMA_FALLBACK_ENABLED=false
```

### Tab Selection

**Cloud AI Tab (Blue)**
- Uses Google Vertex AI models
- Requires Cloud API backend (port 3001)
- Charges per request
- High-quality responses

**Ollama Tab (Green)**
- Uses local models
- Runs on your machine (port 11434)
- Zero cost
- Faster (no network latency)
- Complete data privacy

### Automatic Detection

The frontend automatically:
1. Tests if Ollama is running on startup
2. Loads available models for each backend
3. Shows/hides the Ollama tab accordingly
4. Prefers Ollama if both backends available
5. Falls back to Cloud if Ollama fails

## 📦 Recommended Models

Choose based on your use case:

### Fast & Lightweight
- **mistral** (26GB) - Good quality, very fast
- **neural-chat** (4GB) - Optimized for chat
- **orca-mini** (3GB) - Fast, reasonable quality

### Best Quality
- **llama2** (3.8GB) - General purpose, balanced
- **dolphin-mixtral** (26GB) - Advanced reasoning
- **neural-chat-7b** (4GB) - Best for conversation

### Code-Focused
- **dolphin** (11GB) - Excellent code generation
- **code-llama** (36GB) - Specialized for coding

### Pull Multiple Models
```bash
# Recommended combo for general use
ollama pull mistral        # Fast general model
ollama pull neural-chat    # Good for chat
ollama pull dolphin        # Code generation

# Check your models
ollama list
```

## 🔧 Advanced Configuration

### Change Ollama Port

**Note**: Frontend defaults to port 11434. To use a different port:

1. Start Ollama on custom port:
```bash
ollama serve --addr 0.0.0.0:11435
```

2. Update `.env.development`:
```env
VITE_OLLAMA_HOST=http://localhost:11435
```

3. Restart frontend dev server

### Remote Ollama Instance

To connect to Ollama on a different machine:

```env
# In .env.development or .env.production
VITE_OLLAMA_HOST=http://192.168.1.100:11434
```

### Fallback Setup (High Availability)

For production reliability, set up a fallback instance:

```env
VITE_OLLAMA_HOST=http://ollama-primary:11434
VITE_OLLAMA_FALLBACK_HOST=http://ollama-backup:11434
VITE_OLLAMA_FALLBACK_ENABLED=true
```

The frontend will automatically switch to fallback if primary fails.

## 📊 Performance Tips

### Optimize Memory Usage

```bash
# Check current model details
ollama show mistral

# Reduce model size (use smaller variants)
ollama pull mistral:7b     # 26GB
ollama pull mistral:tiny   # Smaller version if available
```

### GPU Acceleration

**Windows (NVIDIA GPU):**
```bash
# Ollama automatically uses NVIDIA GPU if available
ollama serve
# Watch for: "GPU device 0: NVIDIA GeForce RTX 4090"
```

**macOS:**
- Metal acceleration automatic on Apple Silicon

**Linux:**
```bash
# Install CUDA for GPU support
# Then Ollama will use GPU automatically
```

### Monitor Performance

```bash
# Check CPU/Memory usage while running
# Watch processes for "ollama" consuming resources
```

## 🐛 Troubleshooting

### Ollama Tab Doesn't Appear

**Problem**: Running frontend but no Ollama tab shown

**Check:**
```bash
# 1. Is Ollama running?
curl http://localhost:11434/api/tags
# Should return JSON with available models

# 2. Are models installed?
ollama list
# Should show at least one model

# 3. Try manual endpoint in browser
# http://localhost:11434/api/tags
```

**Solutions:**
- Start Ollama: `ollama serve`
- Pull a model: `ollama pull mistral`
- Restart frontend dev server
- Clear browser cache

### Models Not Loading

**Problem**: Ollama tab shows but no models available

**Solutions:**
```bash
# 1. Check models are pulled
ollama list

# 2. Pull a model if none shown
ollama pull mistral

# 3. Verify Ollama is responding
curl http://localhost:11434/api/tags
```

### Processing Fails/Times Out

**Problem**: Getting errors when sending prompts to Ollama

**Causes & Fixes:**
```bash
# 1. Model might be slow to load
# Increase timeout in ollama-client.js: TIMEOUT value

# 2. Model running out of memory
ollama list     # Check model size
# Try smaller model: ollama pull mistral instead of dolphin

# 3. Port blocked or firewall issue
# Check if port 11434 is open
# Windows: netstat -ano | findstr :11434
# macOS/Linux: lsof -i :11434
```

### High CPU/Memory Usage

**Problem**: Computer slowing down while using Ollama

**Solutions:**
```bash
# 1. Use smaller models
ollama pull orca-mini     # Tiny model

# 2. Run on fewer threads (slower but lighter)
# Edit Ollama config if needed

# 3. Limit simultaneous requests
# Don't run multiple conversations at once
```

## 📈 Scaling to Production

### Docker Deployment

```dockerfile
FROM ollama/ollama:latest

# Pull models during build
RUN ollama pull mistral && \
    ollama pull neural-chat

EXPOSE 11434
```

### Multiple Instances

For load balancing:

```env
# Primary instance
VITE_OLLAMA_HOST=http://ollama-1:11434

# Fallback for redundancy
VITE_OLLAMA_FALLBACK_HOST=http://ollama-2:11434
VITE_OLLAMA_FALLBACK_ENABLED=true
```

### Monitoring

Set up health checks:
```bash
# Add to monitoring system
curl http://localhost:11434/api/tags
```

## 💡 Tips & Tricks

### Run Multiple Models Concurrently

```bash
# Each in a separate terminal/process
ollama -p 11434 serve     # First instance
ollama -p 11435 serve     # Second instance
ollama -p 11436 serve     # Third instance
```

### Use Ollama in Python

```python
import requests

response = requests.post(
    'http://localhost:11434/api/generate',
    json={
        'model': 'mistral',
        'prompt': 'Hello, how are you?',
        'stream': False
    }
)

print(response.json()['response'])
```

### Benchmark Model Performance

```bash
# Test response time and quality
# Use frontend's `/cloud-ai` page or:

time curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral",
    "prompt": "Write hello world in Python",
    "stream": false
  }'
```

## 📚 Resources

- **Ollama Docs**: [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Model Library**: [https://ollama.ai/library](https://ollama.ai/library)
- **Discord Community**: [https://discord.gg/ollama](https://discord.gg/ollama)
- **InfinityXAI Docs**: See README.md in frontend folder

## ✅ Verification Checklist

After setup, verify:

- [ ] Ollama running: `ollama serve` or GUI active
- [ ] Models installed: `ollama list` shows at least one
- [ ] Frontend starts: `npm run dev`
- [ ] Cloud AI tab appears (blue)
- [ ] Ollama tab appears (green) if Ollama running
- [ ] Can select models from dropdown
- [ ] Can send prompts and get responses
- [ ] Cost shows for Cloud, tokens show for Ollama

---

**Status**: Ready to use Ollama with InfinityXAI!  
**Next**: Visit `http://localhost:3000/cloud-ai` and test both backends.
