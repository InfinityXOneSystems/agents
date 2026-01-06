/**
 * Agents Service HTTP Server
 * Express-based REST API for agent orchestration
 */

import express, { Request, Response, NextFunction } from "express";
import predictorRouter from "../../modules/predictor/index.js";
import { AgentOrchestrator } from "../agents/orchestrator.js";
import { ServiceHealth } from "../types/index.js";

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_TASKS || "5", 10);

// Initialize orchestrator
const orchestrator = new AgentOrchestrator(MAX_CONCURRENT);

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-API-Key"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


// Mount predictor endpoints for /predict (financial prediction, trading, coin)
app.use("/predict", predictorRouter);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "infinity-agents",
    timestamp: new Date().toISOString(),
  });
});

app.get("/healthz", (req, res) => {
  res.json({
    status: "healthy",
    service: "infinity-agents",
    timestamp: new Date().toISOString(),
  });
});

app.get("/readyz", (req, res) => {
  try {
    const isReady = orchestrator.isHealthy();

    if (!isReady) {
      res.status(503).json({
        status: "not ready",
        service: "infinity-agents",
        timestamp: new Date().toISOString(),
        error: "Orchestrator not healthy",
      });
      return;
    }

    const health: ServiceHealth = {
      status: "healthy",
      service: "infinity-agents",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      checks: {
        agents: "ok",
        queue: "ok",
        index_service: "ok", // TODO: Check index service connectivity
      },
      stats: {
        active_agents: orchestrator.getAgentsInfo().length,
        queued_tasks: orchestrator.getStats().queue.queued,
        running_tasks: orchestrator.getStats().queue.running,
        completed_tasks_24h: orchestrator.getStats().queue.completed,
      },
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      service: "infinity-agents",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

/**
 * Hostinger Integration Endpoint
 */
app.get("/hostinger/info", async (req, res) => {
  try {
    // This endpoint would call the Python Hostinger agent via orchestrator
    // For now, returning structured data that the frontend expects
    const hostingerInfo = {
      account: {
        account: "active",
        websites: 5,
        mode: "live"
      },
      url: process.env.HOSTINGER_URL || "https://infinity-matrix.hostinger.com",
      domains: {
        domains: [
          { name: "infinity-matrix.com", status: "active" },
          { name: "infinityxos.io", status: "active" }
        ]
      },
      websites: {
        websites: [
          { id: 1, name: "Infinity Matrix", status: "active" },
          { id: 2, name: "Admin Dashboard", status: "active" }
        ]
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(hostingerInfo);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Hostinger info",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Execute research task
 */
app.post("/agents/research/execute", async (req, res) => {
  try {
    const { query, max_depth, max_results, priority } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        error: "Invalid request",
        message: "query is required and must be a string",
      });
      return;
    }

    const taskId = await orchestrator.submitResearchTask(query, {
      max_depth,
      max_results,
      priority,
    });

    res.status(202).json({
      task_id: taskId,
      status: "accepted",
      message: "Research task queued",
      query,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit research task",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get all tasks
 */
app.get("/agents/tasks", (req, res) => {
  try {
    const tasks = orchestrator.getAllTasks();

    const { status, type } = req.query;

    let filtered = tasks;

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }

    res.json({
      total: filtered.length,
      tasks: filtered.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        started_at: t.started_at,
        completed_at: t.completed_at,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get tasks",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get task status
 */
app.get("/agents/tasks/:id", (req, res) => {
  try {
    const task = orchestrator.getTask(req.params.id);

    if (!task) {
      res.status(404).json({
        error: "Task not found",
        task_id: req.params.id,
      });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get task",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Cancel task
 */
app.delete("/agents/tasks/:id", (req, res) => {
  try {
    const cancelled = orchestrator.cancelTask(req.params.id);

    if (!cancelled) {
      res.status(404).json({
        error: "Task not found or cannot be cancelled",
        task_id: req.params.id,
        message: "Task may be already running or completed",
      });
      return;
    }

    res.json({
      message: "Task cancelled",
      task_id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to cancel task",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get agent info
 */
app.get("/agents/info", (req, res) => {
  try {
    const agents = orchestrator.getAgentsInfo();
    res.json({
      total: agents.length,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get agent info",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get orchestrator stats
 */
app.get("/agents/stats", (req, res) => {
  try {
    const stats = orchestrator.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get stats",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// VERTEX AI CLOUD ENDPOINTS
// ============================================================================

/**
 * List available cloud AI models
 */
app.get("/cloud/models", (req, res) => {
  try {
    const models = [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        description: "General-purpose model for text generation, reasoning, and coding",
        best_for: ["general", "code", "reasoning", "content_creation"],
        max_tokens: 8000,
        input_cost_per_1k: 0.0005,
        output_cost_per_1k: 0.0015,
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        description: "Multimodal model for image understanding and visual reasoning",
        best_for: ["image_analysis", "visual_understanding", "object_detection"],
        max_tokens: 8000,
        input_cost_per_1k: 0.001,
        output_cost_per_1k: 0.002,
      },
      {
        id: "gemini-ultra",
        name: "Gemini Ultra",
        description: "Most capable model for complex analysis and research tasks",
        best_for: ["complex_analysis", "research", "advanced_reasoning"],
        max_tokens: 16000,
        input_cost_per_1k: 0.01,
        output_cost_per_1k: 0.03,
      },
      {
        id: "code-bison",
        name: "Code Bison",
        description: "Specialized model for code generation and programming tasks",
        best_for: ["code_generation", "programming", "debugging", "refactoring"],
        max_tokens: 8000,
        input_cost_per_1k: 0.001,
        output_cost_per_1k: 0.002,
      },
      {
        id: "chat-bison",
        name: "Chat Bison",
        description: "Optimized for conversational interactions and chat",
        best_for: ["conversation", "chatbot", "dialogue", "customer_support"],
        max_tokens: 4000,
        input_cost_per_1k: 0.0005,
        output_cost_per_1k: 0.0015,
      },
    ];

    res.json({
      status: "success",
      models,
      total: models.length,
      recommended_fallback: "gemini-pro",
      note: "System will automatically fallback to local Ollama if cloud is unavailable",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list models",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Process prompt with Vertex AI cloud
 */
app.post("/cloud/ai/process", async (req, res) => {
  try {
    const { prompt, model_id, task_type, temperature, max_tokens } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({
        error: "Invalid request",
        message: "prompt is required and must be a string",
      });
      return;
    }

    // Map task types to models
    const taskModelMap: Record<string, string> = {
      code: "code-bison",
      chat: "chat-bison",
      image: "gemini-pro-vision",
      research: "gemini-ultra",
      general: "gemini-pro",
    };

    const selectedModel = model_id || taskModelMap[task_type] || "gemini-pro";
    const selectedTemperature = temperature || 0.7;
    const selectedMaxTokens = max_tokens || 1000;

    // Simulate cloud processing (would call actual Vertex AI in production)
    const result = {
      model: selectedModel,
      task_type: task_type || "general",
      input_tokens: Math.ceil(prompt.length / 4),
      output_tokens: selectedMaxTokens,
      response: `[Cloud Processing via ${selectedModel}] Model would process: "${prompt.substring(0, 50)}..."`,
      temperature: selectedTemperature,
      timestamp: new Date().toISOString(),
      processing_time_ms: Math.random() * 3000 + 500,
    };

    res.status(200).json({
      status: "success",
      result,
      usage: {
        input_tokens: result.input_tokens,
        output_tokens: result.output_tokens,
        total_tokens: result.input_tokens + result.output_tokens,
      },
      cost_estimate: {
        input_cost: (result.input_tokens / 1000) * 0.001,
        output_cost: (result.output_tokens / 1000) * 0.002,
        total_cost: ((result.input_tokens / 1000) * 0.001) + ((result.output_tokens / 1000) * 0.002),
        currency: "USD",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process with cloud AI",
      message: error instanceof Error ? error.message : String(error),
      suggestion: "System will fallback to local Ollama if available",
    });
  }
});

/**
 * Check cloud AI service health and quotas
 */
app.get("/cloud/health", async (req, res) => {
  try {
    // Simulate health check (would call actual Vertex AI in production)
    const health = {
      service: "Vertex AI",
      status: "operational",
      api_available: true,
      region: "us-central1",
      project_id: process.env.VERTEX_AI_PROJECT_ID || "infinity-x-one-systems",
      quotas: {
        requests_per_minute: 300,
        requests_remaining: 287,
        monthly_budget_usd: 1000,
        monthly_spent_usd: 127.45,
        percentage_used: 12.7,
      },
      models_available: 5,
      fallback_available: true,
      fallback_service: "Ollama",
      last_successful_request: new Date(Date.now() - 60000).toISOString(),
      uptime_percentage: 99.97,
    };

    res.json({
      status: "success",
      health,
      recommendation:
        health.percentage_used > 80
          ? "Approaching budget limit, consider rate limiting"
          : "All systems operational",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check cloud health",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get("/", (req, res) => {
  res.json({
    service: "Infinity XOS Agents Service",
    version: "1.0.0",
    description: "Multi-agent orchestration, autonomous research, and cloud AI processing",
    endpoints: {
      health: {
        "GET /health": "Health check",
        "GET /healthz": "Kubernetes health check",
        "GET /readyz": "Readiness check with detailed status",
      },
      agents: {
        "POST /agents/research/execute": "Execute research task",
        "GET /agents/tasks":
          "List all tasks (supports ?status=pending&type=research)",
        "GET /agents/tasks/:id": "Get task status and results",
        "DELETE /agents/tasks/:id": "Cancel pending task",
        "GET /agents/info": "Get all agent information",
        "GET /agents/stats": "Get orchestrator statistics",
      },
      cloud_ai: {
        "GET /cloud/models": "List available Vertex AI models",
        "POST /cloud/ai/process": "Process prompt with cloud AI",
        "GET /cloud/health": "Check cloud service health and quotas",
      },
    },
    documentation: "https://github.com/InfinityXOneSystems/agents",
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    // Start orchestrator
    await orchestrator.start();
    console.log("✅ Agent orchestrator started");

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀 Infinity XOS Agents Service started`);
      console.log(`📍 Listening on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📖 API docs at http://localhost:${PORT}/\n`);

      const stats = orchestrator.getStats();
      console.log(`🤖 Active agents: ${stats.agents.total}`);
      console.log(`⚡ Max concurrent tasks: ${MAX_CONCURRENT}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start service:", error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGTERM", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  await orchestrator.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  await orchestrator.stop();
  process.exit(0);
});

start();

export default app;
