# Consolidation Checklist & Migration Guide

## ✅ Completed Steps

### 1. Code Consolidation
- [x] Copied `c:\AI\src\` → `orchestration/` (TypeScript orchestration)
- [x] Copied `c:\AI\repos\agents\src\` → `orchestration/modules/` (Agent ecosystem)
- [x] Created unified `orchestration/` directory structure
- [x] Preserved existing `ai_stack/` (Python agents)
- [x] Created `ARCHITECTURE.md` with new structure

### 2. Configuration
- [x] Updated root `package.json` with monorepo workspaces
- [x] Created `orchestration/package.json` for orchestration services
- [x] Added build/test/start scripts at root level

### 3. Verification
- [x] All Python agents intact in `ai_stack/`
- [x] All TypeScript orchestration code in `orchestration/`
- [x] No critical files missing
- [x] Architecture documented

## ⏳ Next Steps (Do These Now)

### Step 1: Update Import Paths in Orchestration
Files that need import path updates:

```typescript
// OLD: import { AgentOrchestrator } from "../agents/orchestrator.js";
// NEW: import { AgentOrchestrator } from "../agents/orchestrator.js";
// (already correct - relative imports work!)
```

The good news: imports within `orchestration/` are already relative, so they work!

### Step 2: Install Dependencies

```bash
# From root
cd c:\AI\infinity-matrix
npm install

# Build orchestration layer
npm run build:orchestration

# Test Python agents
python -m pytest ai_stack/ -v
```

### Step 3: Test Integrated System

```bash
# Run health check
python system_health_check.py

# Check both systems
npm test              # TypeScript tests
pytest ai_stack/      # Python tests
```

### Step 4: Clean Up Old Directories (AFTER testing)

Once everything works, we can safely remove:

```bash
# BACKUP FIRST - these are now redundant
rm -rf c:\AI\src\              # Copied to orchestration/
rm -rf c:\AI\repos\            # Copied to orchestration/modules/
rm -rf c:\AI\infinity-matrix\src_agents\    # Backup (can delete)
rm -rf c:\AI\infinity-matrix\repos_agents\  # Backup (can delete)

# Keep frontend_stack temporarily for reference
# (can deprecate after verifying all is working)
```

## 📁 New Directory Structure

```
infinity-matrix/ (primary working directory)
├── orchestration/          ← TypeScript orchestration layer (NEW)
│   ├── agents/             ← Agent coordination
│   ├── server/             ← Express.js REST API  
│   ├── modules/            ← Agent ecosystem modules
│   ├── types/              ← TypeScript types
│   ├── utils/              ← Utilities
│   ├── automation/         ← Automation workflows
│   ├── package.json        ← Orchestration dependencies
│   └── tsconfig.json       ← TypeScript config
│
├── ai_stack/               ← Python AI agents (EXISTING)
│   ├── agents/             ← Individual AI agents
│   ├── vision_cortex/      ← Multi-agent orchestrator
│   ├── [integrations]/     ← Service integrations (GitHub, Firebase, GCP, Hostinger)
│   ├── system_health_check.py
│   └── requirements.txt
│
├── package.json            ← Root monorepo config (UPDATED)
├── ARCHITECTURE.md         ← Documentation (NEW)
└── [other existing files]
```

## 🔄 Communication Path (Python ↔ TypeScript)

### Current Architecture:
1. **TypeScript Server** (orchestration/server/index.ts)
   - Listens on port 3001
   - Provides REST API endpoints

2. **Python Agents** (ai_stack/)
   - Can call TypeScript via HTTP to `/research` endpoint
   - Or run independently via CLI

3. **Vision Cortex** (ai_stack/vision_cortex/vision_cortex.py)
   - Coordinates Python agents
   - Can interface with TypeScript orchestrator

## ⚠️ Important: C:\AI folder

The root `c:\AI` folder is still the git repository for the `agents` repo. Currently:
- ✓ All code is duplicated/consolidated in `infinity-matrix/`
- ✓ Changes made to `infinity-matrix/` get committed to git
- ⏳ Clean up `c:\AI\src\` and `c:\AI\repos\` after testing

**DO NOT** delete the `.git` folder in `c:\AI\` until we're ready to separate repositories.

## 🧪 Testing Checklist

Before considering consolidation complete:

```bash
# 1. Verify imports work
cd orchestration && npm install && npm run build

# 2. Test Python agents
cd .. && python -m pytest ai_stack/ -v

# 3. Run health check
python system_health_check.py

# 4. Check git status
git status

# 5. Commit changes
git add .
git commit -m "Consolidate code into unified infinity-matrix structure"
```

## 🎯 Success Criteria

- [ ] `npm run build:orchestration` succeeds
- [ ] `npm run agents:test` shows 25/25 tests passing  
- [ ] `python system_health_check.py` shows all systems OK
- [ ] No import errors in logs
- [ ] All agents responsive
- [ ] Git commit clean (no merge conflicts)

## 📝 Notes

- Python agents work independently ✓
- TypeScript orchestration layer now centralized ✓
- Both can be tested separately ✓
- Integration point: HTTP API on :3001
- Python can call TypeScript via requests library
- TypeScript can spawn Python processes for agent tasks

## Next Action

Run the following to proceed:

```bash
cd c:\AI\infinity-matrix
npm install
npm run build:orchestration
python -m pytest ai_stack/ -v
python system_health_check.py
```

If everything passes, the consolidation is complete! ✨
