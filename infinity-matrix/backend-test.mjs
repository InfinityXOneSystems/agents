#!/usr/bin/env node

/**
 * Simple Backend Server for Testing
 * Provides REST API for frontend with cloud and Ollama support
 */

import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'infinity-backend',
    backend: 'hybrid-cloud-primary',
    timestamp: new Date().toISOString(),
  });
});

// Ready probe
app.get('/ready', (req, res) => {
  res.json({ ready: true });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    requests_total: 0,
    cloud_requests: 0,
    local_requests: 0,
    failover_count: 0,
  });
});

// Vertex AI endpoint (cloud)
app.post('/vertex/generate', async (req, res) => {
  const { prompt, max_tokens = 256 } = req.body;

  try {
    // Simulate Vertex AI response
    const response = {
      text: `Cloud Response (Vertex AI): This is a response to the prompt: "${prompt}". ` +
            `(simulated - connect your Google Cloud credentials for real Vertex AI integration)`,
      backend: 'cloud',
      model: 'vertex-ai',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to query Vertex AI',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Ollama endpoint (local)
app.post('/ollama/generate', async (req, res) => {
  const { prompt, model = 'llama2', max_tokens = 256 } = req.body;

  try {
    // Try to connect to local Ollama
    const ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    
    try {
      const ollamaResponse = await axios.post(`${ollamaUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
      }, { timeout: 30000 });

      res.json({
        text: ollamaResponse.data.response,
        backend: 'local',
        model,
        timestamp: new Date().toISOString(),
      });
    } catch (ollamaError) {
      // Fallback if Ollama is not available
      res.json({
        text: `Local Response (Simulated Ollama): Response to "${prompt}". ` +
              `(Ollama not available - install and run: ollama pull llama2 && ollama serve)`,
        backend: 'local',
        model,
        timestamp: new Date().toISOString(),
        warning: 'Ollama not available, returning simulated response',
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to query Ollama',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Query endpoint (smart routing)
app.post('/query', async (req, res) => {
  const { prompt, provider = 'auto' } = req.body;

  try {
    let endpoint = '/vertex/generate';
    
    if (provider === 'local' || provider === 'ollama') {
      endpoint = '/ollama/generate';
    }

    const response = await axios.post(`http://localhost:${PORT}${endpoint}`, {
      prompt,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Query failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Infinity-Matrix Backend Server                          ║
║  Hybrid Cloud-Primary with Local Fallback                ║
╚══════════════════════════════════════════════════════════╝

✅ Backend started
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  
Available endpoints:
  GET    /health            - Health check
  GET    /ready             - Readiness probe
  GET    /metrics           - Performance metrics
  POST   /vertex/generate   - Query Vertex AI (cloud)
  POST   /ollama/generate   - Query Ollama (local)
  POST   /query             - Smart routing endpoint

Frontend URL:
  http://localhost:3000

Documentation:
  Cloud Architecture: See CLOUD_DOCUMENTATION_INDEX.md
  Hybrid Client: See frontend/src/lib/hybrid-cloud-client.js

Ready to test hybrid cloud-primary system! 🚀
  `);
});

// Error handling
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
