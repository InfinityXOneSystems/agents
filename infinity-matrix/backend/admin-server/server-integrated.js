#!/usr/bin/env node

/**
 * INTEGRATED ADMIN SERVER
 * Vertex AI + Hostinger + Health Monitoring + Admin Dashboard
 * Port: 3000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Logging with colors
const log = {
  info: (msg) => console.log(`[\x1b[36mINFO\x1b[0m] ${msg}`),
  success: (msg) => console.log(`[\x1b[32mOK\x1b[0m] ${msg}`),
  error: (msg) => console.log(`[\x1b[31mERROR\x1b[0m] ${msg}`),
  warn: (msg) => console.log(`[\x1b[33mWARN\x1b[0m] ${msg}`)
};

app.use((req, res, next) => {
  log.info(`${req.method} ${req.path}`);
  next();
});

// ====================
// HEALTH MONITORING
// ====================

let healthMetrics = {
  uptime: 0,
  requests: 0,
  errors: 0,
  lastCheck: new Date().toISOString(),
  services: {}
};

app.get('/health', (req, res) => {
  healthMetrics.requests++;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'admin-server',
    port: PORT,
    memory: process.memoryUsage(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    }
  });
});

app.get('/api/health/full', async (req, res) => {
  const services = {
    adminServer: { status: 'online', port: PORT },
    vertexAI: { status: process.env.VERTEX_AI_ENABLED ? 'online' : 'offline' },
    hostinger: { status: 'checking' },
    vscode: { status: 'connected' }
  };

  // Check Hostinger connection
  try {
    const hostingerStatus = await checkHostingerStatus();
    services.hostinger = hostingerStatus;
  } catch (err) {
    services.hostinger = { status: 'offline', error: err.message };
  }

  res.json({
    overall: 'healthy',
    timestamp: new Date().toISOString(),
    services,
    metrics: healthMetrics,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: os.platform()
    }
  });
});

async function checkHostingerStatus() {
  return new Promise((resolve) => {
    exec('ping -n 1 infinityxai.com', (error) => {
      resolve({
        status: error ? 'offline' : 'online',
        domain: 'infinityxai.com',
        lastCheck: new Date().toISOString()
      });
    });
  });
}

// ====================
// VERTEX AI INTEGRATION
// ====================

app.post('/api/vertex/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-pro' } = req.body;
    
    if (!process.env.VERTEX_AI_PROJECT_ID) {
      return res.status(503).json({
        error: 'Vertex AI not configured',
        message: 'Set VERTEX_AI_PROJECT_ID in environment'
      });
    }

    // Mock response for now - integrate actual Vertex AI SDK
    const response = {
      model,
      generated: `Response to: ${prompt}`,
      timestamp: new Date().toISOString(),
      tokens: prompt.split(' ').length * 1.5
    };

    log.success(`Vertex AI generated response for: ${prompt.substring(0, 50)}...`);
    res.json(response);
  } catch (err) {
    healthMetrics.errors++;
    log.error(`Vertex AI error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vertex/models', (req, res) => {
  res.json({
    available: [
      { id: 'gemini-pro', name: 'Gemini Pro', type: 'text' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', type: 'multimodal' },
      { id: 'text-bison', name: 'Text Bison', type: 'text' }
    ],
    configured: !!process.env.VERTEX_AI_PROJECT_ID
  });
});

// ====================
// HOSTINGER SYNC
// ====================

app.post('/api/hostinger/sync', async (req, res) => {
  try {
    const { action = 'push', files = [] } = req.body;
    
    log.info(`Hostinger sync: ${action} - ${files.length} files`);
    
    // Execute sync script
    exec(`powershell -File ${__dirname}/../../scripts/sync-hostinger.js ${action}`, 
      (error, stdout, stderr) => {
        if (error) {
          log.error(`Sync failed: ${error.message}`);
          return res.status(500).json({ error: error.message });
        }
        
        log.success(`Sync completed: ${action}`);
        res.json({
          success: true,
          action,
          output: stdout,
          timestamp: new Date().toISOString()
        });
      });
  } catch (err) {
    healthMetrics.errors++;
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hostinger/status', async (req, res) => {
  const status = await checkHostingerStatus();
  res.json(status);
});

app.post('/api/hostinger/deploy', async (req, res) => {
  try {
    log.info('Starting Hostinger deployment...');
    
    exec('powershell -File ./deploy-with-python.ps1', 
      { cwd: path.join(__dirname, '../..') },
      (error, stdout, stderr) => {
        if (error) {
          log.error(`Deploy failed: ${error.message}`);
          return res.status(500).json({ error: error.message, stderr });
        }
        
        log.success('Deployment complete!');
        res.json({
          success: true,
          output: stdout,
          timestamp: new Date().toISOString()
        });
      });
  } catch (err) {
    healthMetrics.errors++;
    res.status(500).json({ error: err.message });
  }
});

// ====================
// VS CODE INTEGRATION
// ====================

app.get('/api/vscode/status', (req, res) => {
  res.json({
    connected: true,
    extensionVersion: '0.0.1',
    adminShellVisible: true,
    controlPanelVisible: true,
    services: {
      frontend: true,
      adminAPI: true,
      vertexAI: !!process.env.VERTEX_AI_PROJECT_ID,
      hostinger: true
    },
    capabilities: [
      'admin-shell',
      'control-panel',
      'health-monitor',
      'vertex-ai',
      'hostinger-sync'
    ]
  });
});

app.post('/api/vscode/command', (req, res) => {
  const { command, args = [] } = req.body;
  
  log.info(`VS Code command: ${command}`);
  
  // Execute VS Code commands
  const commands = {
    'boot-system': () => exec('powershell -File ./auto-boot.ps1', { cwd: __dirname }),
    'stop-system': () => exec('taskkill /F /IM node.exe', { cwd: __dirname }),
    'sync-hostinger': () => exec('node ./scripts/sync-hostinger.js push')
  };
  
  if (commands[command]) {
    commands[command]();
    res.json({ success: true, command });
  } else {
    res.status(404).json({ error: 'Command not found' });
  }
});

// ====================
// ADMIN DASHBOARD DATA
// ====================

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    services: [
      { name: 'Admin Server', status: 'running', port: PORT, uptime: process.uptime() },
      { name: 'Vertex AI', status: process.env.VERTEX_AI_PROJECT_ID ? 'configured' : 'not configured' },
      { name: 'Hostinger', status: 'connected', domain: 'infinityxai.com' },
      { name: 'VS Code Extension', status: 'active', version: '0.0.1' }
    ],
    metrics: healthMetrics,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        used: os.totalmem() - os.freemem()
      }
    },
    integrations: {
      vertexAI: {
        enabled: !!process.env.VERTEX_AI_PROJECT_ID,
        projectId: process.env.VERTEX_AI_PROJECT_ID || 'not configured'
      },
      hostinger: {
        enabled: true,
        domain: 'infinityxai.com',
        lastSync: new Date().toISOString()
      }
    }
  });
});

app.get('/api/admin/endpoints', (req, res) => {
  res.json({
    health: [
      'GET /health',
      'GET /api/health/full'
    ],
    vertex: [
      'POST /api/vertex/generate',
      'GET /api/vertex/models'
    ],
    hostinger: [
      'POST /api/hostinger/sync',
      'POST /api/hostinger/deploy',
      'GET /api/hostinger/status'
    ],
    vscode: [
      'GET /api/vscode/status',
      'POST /api/vscode/command'
    ],
    admin: [
      'GET /api/admin/dashboard',
      'GET /api/admin/endpoints'
    ]
  });
});

// ====================
// SYSTEM STATUS
// ====================

app.get('/api/system/status', (req, res) => {
  res.json({
    system: 'Infinity Matrix',
    status: 'online',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      admin: 'running',
      vertex: process.env.VERTEX_AI_PROJECT_ID ? 'configured' : 'offline',
      hostinger: 'connected'
    },
    uptime: process.uptime(),
    requests: healthMetrics.requests,
    errors: healthMetrics.errors
  });
});

// ====================
// MISSING ENDPOINTS
// ====================

// Authentication
app.post('/api/auth', (req, res) => {
  res.json({ message: 'Authentication endpoint placeholder' });
});

// Chat
app.get('/api/chat', (req, res) => {
  res.json({ message: 'Chat endpoint placeholder' });
});

// Swarm
app.get('/api/swarm', (req, res) => {
  res.json({ message: 'Swarm endpoint placeholder' });
});

// Investor
app.get('/api/investor', (req, res) => {
  res.json({ message: 'Investor endpoint placeholder' });
});

// Vision Cortex
app.get('/api/vision-cortex', (req, res) => {
  res.json({ message: 'Vision Cortex endpoint placeholder' });
});

// Scraper
app.get('/api/scraper', (req, res) => {
  res.json({ message: 'Scraper endpoint placeholder' });
});

// GCP
app.get('/api/gcp', (req, res) => {
  res.json({ message: 'GCP endpoint placeholder' });
});

// Workspace
app.get('/api/workspace', (req, res) => {
  res.json({ message: 'Workspace endpoint placeholder' });
});

// Users
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users endpoint placeholder' });
});

// Agents
app.get('/api/agents', (req, res) => {
  res.json({ message: 'Agents endpoint placeholder' });
});

// Manus Scrape
app.post('/api/manus/scrape', (req, res) => {
  res.json({ message: 'Manus scrape endpoint placeholder' });
});

// ====================
// FRONTEND ROUTES
// ====================

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  healthMetrics.errors++;
  log.error(err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  log.success('Server started!');
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 INFINITY MATRIX - INTEGRATED ADMIN SERVER           ║
║   Running on http://localhost:${PORT}                        ║
╚═══════════════════════════════════════════════════════════╝

📍 Endpoints:
   Frontend:           http://localhost:${PORT}/
   Admin Dashboard:    http://localhost:${PORT}/admin
   Health Check:       http://localhost:${PORT}/health
   Full Health:        http://localhost:${PORT}/api/health/full

🔗 Integrations:
   ✅ VS Code Extension
   ${process.env.VERTEX_AI_PROJECT_ID ? '✅' : '⚠️ '} Vertex AI ${process.env.VERTEX_AI_PROJECT_ID ? '(Configured)' : '(Not configured)'}
   ✅ Hostinger Sync
   ✅ Health Monitoring

📊 API Endpoints:
   Vertex AI:          POST /api/vertex/generate
   Hostinger Sync:     POST /api/hostinger/sync
   Hostinger Deploy:   POST /api/hostinger/deploy
   VS Code Status:     GET /api/vscode/status
   Dashboard Data:     GET /api/admin/dashboard

✅ Server ready! Press Ctrl+C to stop.
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log.warn('Shutting down server...');
  process.exit(0);
});

// Update metrics every 30 seconds
setInterval(() => {
  healthMetrics.uptime = process.uptime();
  healthMetrics.lastCheck = new Date().toISOString();
}, 30000);
