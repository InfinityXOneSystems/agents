# ⚡ QuickStart Reference Card

## 🚀 Start Everything (3 Steps)

### Step 1: Backend (Cloud AI)
```bash
cd c:\AI\infinity-matrix\ai_stack
python launch_all_agents.py
# Runs on port 3001
```

### Step 2: Local AI (Optional)
```bash
ollama serve
# In another terminal: ollama pull mistral
# Runs on port 11434
```

### Step 3: Frontend
```bash
cd c:\AI\infinity-matrix\frontend
npm run dev
# Opens http://localhost:3000
```

---

## 🌐 Test the Frontend

**URL**: http://localhost:3000/cloud-ai

**You'll see**:
- 🔵 **Cloud AI Tab** (Vertex AI models)
- 🟢 **Ollama Tab** (If Ollama running)

**Try**: 
1. Pick a model
2. Enter a prompt
3. Click "Process"
4. See results!

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/CloudAIPage.jsx` | Main dual-backend page |
| `frontend/src/lib/ollama-client.js` | Ollama API wrapper |
| `frontend/src/App.jsx` | Routes (includes /cloud-ai) |
| `frontend/.env.development` | Dev config (Cloud + Ollama) |
| `frontend/.env.production` | Prod config |

---

## 🔧 Common Commands

```bash
# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build

# Ollama
ollama serve                    # Start server
ollama pull mistral             # Get a model
ollama list                     # See models
ollama pull llama2 neural-chat  # Get multiple

# Check if backends running
curl http://localhost:3001/cloud/health    # Cloud
curl http://localhost:11434/api/tags       # Ollama
```

---

## 🎯 Architecture

```
Frontend (localhost:3000)
  ├── Cloud AI Tab → Port 3001 (Vertex)
  └── Ollama Tab → Port 11434 (Local)
```

---

## ❌ Troubleshooting

| Issue | Fix |
|-------|-----|
| No Ollama tab | Start: `ollama serve` + `ollama pull mistral` |
| Backend error | Check port 3001 is running |
| Slow responses | Use smaller model: `ollama pull mistral` |
| High CPU | Reduce models or use lighter ones |

---

## 📚 Read These

1. **FRONTEND_COMPLETE_SUMMARY.md** - Full overview
2. **OLLAMA_SETUP_GUIDE.md** - Ollama setup details
3. **FRONTEND_VERIFICATION.md** - Audit & checklist
4. **frontend/README.md** - Frontend-specific docs

---

## ✅ Verification

```bash
# Verify everything is ready
curl http://localhost:3001/cloud/health      # Cloud AI
curl http://localhost:11434/api/tags         # Ollama (if running)
curl http://localhost:3000                   # Frontend
```

---

## 🎉 Status

**Frontend**: ✅ CLEAN & PRODUCTION-READY  
**Cloud AI Integration**: ✅ WORKING  
**Ollama Integration**: ✅ WORKING  
**Documentation**: ✅ COMPLETE

**Ready to deploy!** 🚀
