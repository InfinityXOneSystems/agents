#!/usr/bin/env node

/**
 * Unified Agent Orchestrator
 * Coordinates all agents, scrapers, crawlers, and services in perfect synchronization
 * Provides 24/7 headless API operations with local and cloud capabilities
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { spawn as spawnChild } from 'child_process';
import WebSocket, { WebSocketServer } from 'ws';
import { createClient as createRedisClient } from 'redis';
import puppeteer, { Browser } from 'puppeteer';
import axios from 'axios';
import { RepoSyncAgent } from './repo-sync-agent.js';
import { AIIntegrationManager } from './modules/ai-llm-integration/index.js';
import { AgentDiscoveryService, AgentRunnerService, DiscoveredAgent, PromptService } from './modules/core/index.js';

interface ServiceInfo {
  name: string;
  url: string;
  type: string;
  status?: string;
}

interface AgentInfo {
  id: string;
  ws: WebSocket;
  capabilities?: string[];
  lastSeen?: number;
  [key: string]: any;
}

interface TaskInfo {
  id: string;
  type: string;
  data: any;
  status: string;
  created: string;
  assignedTo?: string;
  assignedAt?: string;
  result?: any;
}

interface ScrapeOptions {
  waitFor?: number;
  timeout?: number;
  returnContent?: boolean;
}

class UnifiedAgentOrchestrator {
  private app: express.Application;
  private wss: WebSocket.Server | null;
  private redis: any;
  private browser: Browser | null;
  private services: Map<string, ServiceInfo>;
  private agents: Map<string, AgentInfo>;
  private tasks: Map<string, TaskInfo>;
  private isRunning: boolean;
  private server: any;
  private repoSyncAgent!: RepoSyncAgent;
  private aiIntegrationManager!: AIIntegrationManager;
  private discoveryService: AgentDiscoveryService;
  private runnerService: AgentRunnerService;
  private promptService: PromptService;
  private discoveredAgents: DiscoveredAgent[] = [];

  constructor() {
    this.app = express();
    this.wss = null;
    this.redis = null;
    this.browser = null;
    this.services = new Map();
    this.agents = new Map();
    this.tasks = new Map();
    this.isRunning = false;
    this.discoveryService = new AgentDiscoveryService();
    this.runnerService = new AgentRunnerService();
    this.promptService = new PromptService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupAgentRoutes();
    this.setupPromptRoutes();
  }

  /**
   * Setup Prompt routes
   */
  setupPromptRoutes() {
    // Get all prompts
    this.app.get('/prompts', (req: express.Request, res: express.Response) => {
      res.json(this.promptService.getAllPrompts());
    });

    // Get prompt by name
    this.app.get('/prompts/:name', (req: express.Request, res: express.Response) => {
      const prompt = this.promptService.getPromptByName(req.params.name);
      if (prompt) {
        res.json(prompt);
      } else {
        res.status(404).json({ error: `Prompt ${req.params.name} not found` });
      }
    });

    // Search prompts
    this.app.get('/prompts/search/:query', (req: express.Request, res: express.Response) => {
      res.json(this.promptService.searchPrompts(req.params.query));
    });

    // Generate CLI command from prompt
    this.app.get('/prompts/:name/cli', (req: express.Request, res: express.Response) => {
      const command = this.promptService.generateCliCommand(req.params.name);
      res.json({ command });
    });
  }

  /**
   * Setup Agent Discovery and Execution routes
   */
  setupAgentRoutes() {
    // Discover all agents
    this.app.get('/agents/discover', async (req: express.Request, res: express.Response) => {
      try {
        this.discoveredAgents = await this.discoveryService.discoverAgents();
        res.json(this.discoveredAgents);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Run a discovered agent
    this.app.post('/agents/run-discovered', async (req: express.Request, res: express.Response) => {
      try {
        const { name, options } = req.body;
        const agent = this.discoveredAgents.find(a => a.name === name);
        if (!agent) {
          return res.status(404).json({ error: `Agent ${name} not found. Run /agents/discover first.` });
        }
        const result = await this.runnerService.runAgent(agent, options);
        res.json({ status: 'started', pid: result.pid, startTime: result.startTime });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Stop a running agent
    this.app.post('/agents/stop-discovered', async (req: express.Request, res: express.Response) => {
      try {
        const { name } = req.body;
        await this.runnerService.stopAgent(name);
        res.json({ status: 'stopped', name });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Get active agents
    this.app.get('/agents/active', (req: express.Request, res: express.Response) => {
      res.json(this.runnerService.getActiveAgents());
    });

    // Sync with Infinity Gateway
    this.app.post('/sync/gateway', async (req: express.Request, res: express.Response) => {
      try {
        const gatewayUrl = process.env.INFINITY_GATEWAY_URL || 'http://localhost:8090';
        const response = await axios.post(`${gatewayUrl}/sync`, req.body);
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to sync with Infinity Gateway' });
      }
    });

    // Sync with MCP
    this.app.post('/sync/mcp', async (req: express.Request, res: express.Response) => {
      try {
        const mcpPath = 'C:\\AI\\repos\\mcp';
        const secretsPath = path.join(mcpPath, 'secrets');
        let secrets: string[] = [];
        if (fs.existsSync(secretsPath)) {
          secrets = fs.readdirSync(secretsPath);
        }
        res.json({ 
          status: 'success', 
          message: 'Synced with Model Context Protocol',
          mcpPath,
          secretsFound: secrets.length,
          secrets
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to sync with MCP' });
      }
    });
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req: express.Request, res: express.Response) => {
      res.json({
        status: 'healthy',
        services: Object.fromEntries(this.services),
        agents: Object.fromEntries(this.agents),
        timestamp: new Date().toISOString()
      });
    });

    // Start unified system
    this.app.post('/start', async (req: express.Request, res: express.Response) => {
      try {
        await this.start();
        res.json({ status: 'started', message: 'Unified agent system started' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Stop unified system
    this.app.post('/stop', async (req: express.Request, res: express.Response) => {
      try {
        await this.stop();
        res.json({ status: 'stopped', message: 'Unified agent system stopped' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Scrape endpoint
    this.app.post('/scrape', async (req: express.Request, res: express.Response) => {
      try {
        const { url, options = {} } = req.body;
        const result = await this.scrapeUrl(url, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Crawl endpoint
    this.app.post('/crawl', async (req: express.Request, res: express.Response) => {
      try {
        const { startUrl, maxDepth = 3, options = {} } = req.body;
        const result = await this.crawlWebsite(startUrl, maxDepth, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Task management
    this.app.get('/tasks', (req: express.Request, res: express.Response) => {
      res.json(Object.fromEntries(this.tasks));
    });

    this.app.post('/tasks', async (req: express.Request, res: express.Response) => {
      try {
        const { type, data } = req.body;
        const taskId = this.generateTaskId();
        await this.createTask(taskId, type, data);
        res.json({ taskId, status: 'created' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Repo sync routes
    this.app.post('/sync-start', async (req: express.Request, res: express.Response) => {
      try {
        await this.repoSyncAgent.startSync();
        res.json({ status: 'sync started' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/sync-stop', async (req: express.Request, res: express.Response) => {
      try {
        await this.repoSyncAgent.stopSync();
        res.json({ status: 'sync stopped' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/code-check', async (req: express.Request, res: express.Response) => {
      const { repo } = req.body;
      try {
        await this.repoSyncAgent.runCodeChecks(repo);
        res.json({ status: 'code checks completed' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // LLM Integration routes
    this.app.post('/ai/complete', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('complete', req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/ai/analyze-code', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('analyze-code', req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/ai/generate-tests', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('generate-tests', req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/ai/optimize-code', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('optimize-code', req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/ai/review-pr', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('review-pr', req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/ai/context', async (req: express.Request, res: express.Response) => {
      try {
        const result = await this.aiIntegrationManager.executeTask('get-context');
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/ai/status', async (req: express.Request, res: express.Response) => {
      try {
        const status = await this.aiIntegrationManager.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Agent categorization routes
    this.app.get('/agents/categories', (req: express.Request, res: express.Response) => {
      try {
        const categories = this.aiIntegrationManager.getAllCategories();
        res.json(categories);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/agents/categories/:agentName', (req: express.Request, res: express.Response) => {
      try {
        const { agentName } = req.params;
        const category = this.aiIntegrationManager.getAgentCategory(agentName);
        if (category) {
          res.json(category);
        } else {
          res.status(404).json({ error: 'Agent category not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/agents/job-classifications', (req: express.Request, res: express.Response) => {
      try {
        const classifications = this.aiIntegrationManager.getAllJobClassifications();
        res.json(classifications);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/agents/validate-capabilities', (req: express.Request, res: express.Response) => {
      try {
        const { agentName, capabilities } = req.body;
        const isValid = this.aiIntegrationManager.validateAgentCapabilities(agentName, capabilities);
        res.json({ agentName, capabilities, isValid, meetsEnterpriseStandards: isValid });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/agents/enterprise-capabilities/:categoryId', (req: express.Request, res: express.Response) => {
      try {
        const { categoryId } = req.params;
        const capabilities = this.aiIntegrationManager.getEnterpriseCapabilities(categoryId);
        if (capabilities) {
          res.json(capabilities);
        } else {
          res.status(404).json({ error: 'Category not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Run agent with proactive recommendations
    this.app.post('/agents/run', async (req: express.Request, res: express.Response) => {
      try {
        const { name, command, params } = req.body;
        const result = await this.aiIntegrationManager.runAgentProactively(name || command, params || {});
        res.json({ result, executedAt: new Date().toISOString() });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  /**
   * Start the unified orchestrator
   */
  async start() {
    if (this.isRunning) return;

    console.log('🚀 Starting Unified Agent Orchestrator...');

    try {
      // Initialize Redis connection
      await this.initRedis();

      // Initialize headless browser
      await this.initBrowser();

      // Start WebSocket server
      await this.initWebSocket();

      // Discover and connect to existing services
      await this.discoverServices();

      // Initialize AI Integration Manager
      this.aiIntegrationManager = new AIIntegrationManager({
        githubCopilotToken: process.env.GITHUB_COPILOT_TOKEN,
        openaiApiKey: process.env.OPENAI_API_KEY,
        grokApiKey: process.env.GROK_API_KEY,
        groqApiKey: process.env.GROQ_API_KEY,
        ollamaEndpoint: process.env.OLLAMA_ENDPOINT,
        ollamaModel: process.env.OLLAMA_MODEL,
        vscodeWorkspacePath: process.cwd()
      });
      await this.aiIntegrationManager.init();

      // Start agent coordination
      await this.startAgentCoordination();

      // Initial agent discovery
      console.log('🔍 Performing initial agent discovery...');
      this.discoveredAgents = await this.discoveryService.discoverAgents();
      console.log(`✅ Discovered ${this.discoveredAgents.length} potential agents`);

      // Start HTTP server
      const port = process.env.PORT || 8082;
      this.server = this.app.listen(port, () => {
        console.log(`📡 Unified Orchestrator running on port ${port}`);
      });

      this.isRunning = true;
      console.log('✅ Unified Agent Orchestrator started successfully');

    } catch (error) {
      console.error('❌ Failed to start orchestrator:', error);
      throw error;
    }
  }

  /**
   * Stop the unified orchestrator
   */
  async stop() {
    if (!this.isRunning) return;

    console.log('🛑 Stopping Unified Agent Orchestrator...');

    // Stop HTTP server
    if (this.server) {
      this.server.close();
    }

    // Close WebSocket connections
    if (this.wss) {
      this.wss.clients.forEach((client: WebSocket) => client.close());
      this.wss.close();
    }

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    // Close Redis
    if (this.redis) {
      this.redis.quit();
    }

    this.isRunning = false;
    console.log('✅ Unified Agent Orchestrator stopped');
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    try {
      this.redis = createRedisClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });

      await this.redis.connect();
      console.log('🔴 Redis connected');
    } catch (error) {
      console.warn('⚠️ Redis not available, running without Redis:', error instanceof Error ? error.message : String(error));
      this.redis = null;
    }
  }

  /**
   * Initialize headless browser
   */
  async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    console.log('🌐 Headless browser initialized');
  }

  /**
   * Initialize WebSocket server
   */
  async initWebSocket() {
    this.wss = new WebSocketServer({ port: 8081 });
    console.log('🔌 WebSocket server started on port 8081');

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔗 Agent connected via WebSocket');

      ws.on('message', (message: WebSocket.Data) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 Agent disconnected');
      });
    });
  }

  /**
   * Discover existing services
   */
  async discoverServices() {
    console.log('🔍 Discovering existing services...');

    const services = [
      { name: 'autonomous_crawler', url: 'http://localhost:8084', healthPath: '/health', type: 'crawler' },
      { name: 'infinityx', url: 'http://localhost:8080', healthPath: '/health', type: 'api' },
      { name: 'infinity-gateway', url: 'http://localhost:8090', healthPath: '/health', type: 'gateway' },
      { name: 'mcp', url: 'http://localhost:8091', healthPath: '/api/status', type: 'protocol' },
      { name: 'background_agent', url: 'http://localhost:8085', healthPath: '/health', type: 'agent' }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(`${service.url}${service.healthPath}`, { timeout: 5000 });
        if (response.status === 200) {
          this.services.set(service.name, { ...service, status: 'connected' });
          console.log(`✅ Connected to ${service.name}`);
        }
      } catch (error) {
        console.log(`⚠️  ${service.name} not available at ${service.url}${service.healthPath}`);
      }
    }
  }

  /**
   * Start agent coordination
   */
  async startAgentCoordination() {
    console.log('🤖 Starting agent coordination...');

    // Heartbeat monitoring
    setInterval(() => {
      this.checkAgentHealth();
    }, 30000); // Every 30 seconds

    // Task distribution
    setInterval(() => {
      this.distributeTasks();
    }, 60000); // Every minute

    // Synchronization cycle
    setInterval(() => {
      this.synchronizationCycle();
    }, 300000); // Every 5 minutes
  }

  /**
   * Scrape a URL with headless browser
   */
  async scrapeUrl(url: string, options: ScrapeOptions = {}) {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      if (options.waitFor) {
        await page.waitForTimeout(options.waitFor);
      }

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });

      const content = await page.content();
      const title = await page.title();

      // Extract structured data
      const data = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        const jsonLd = scripts.map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        }).filter(Boolean);

        return {
          title: document.title,
          description: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content,
          keywords: (document.querySelector('meta[name="keywords"]') as HTMLMetaElement)?.content,
          jsonLd,
          links: Array.from(document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>).map(a => ({
            text: a.textContent?.trim() || '',
            href: a.href
          }))
        };
      });

      return {
        url,
        title,
        content: options.returnContent ? content : content.substring(0, 10000),
        data,
        timestamp: new Date().toISOString()
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Crawl a website
   */
  async crawlWebsite(startUrl: string, maxDepth: number = 3, options: ScrapeOptions = {}) {
    const visited = new Set();
    const queue = [{ url: startUrl, depth: 0 }];
    const results = [];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;
      const { url, depth } = item;

      if (visited.has(url) || depth > maxDepth) continue;
      visited.add(url);

      try {
        console.log(`🕷️  Crawling: ${url} (depth: ${depth})`);
        const result = await this.scrapeUrl(url, options);
        results.push(result);

        // Add links to queue
        if (depth < maxDepth && result.data.links) {
          for (const link of result.data.links.slice(0, 10)) { // Limit links per page
            if (link.href && link.href.startsWith('http') && !visited.has(link.href)) {
              queue.push({ url: link.href, depth: depth + 1 });
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to crawl ${url}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return {
      startUrl,
      totalPages: results.length,
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check agent health
   */
  async checkAgentHealth() {
    for (const [name, service] of this.services) {
      try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        if (response.status !== 200) {
          this.services.set(name, { ...service, status: 'unhealthy' });
        }
      } catch (error) {
        this.services.set(name, { ...service, status: 'disconnected' });
      }
    }
  }

  /**
   * Distribute tasks to agents
   */
  async distributeTasks() {
    const availableTasks = Array.from(this.tasks.values()).filter(task => task.status === 'pending');

    for (const task of availableTasks) {
      const suitableAgent = this.findSuitableAgent(task);
      if (suitableAgent) {
        await this.assignTaskToAgent(task, suitableAgent);
      }
    }
  }

  /**
   * Synchronization cycle
   */
  async synchronizationCycle() {
    console.log('🔄 Running synchronization cycle...');

    // Sync data between services
    await this.syncServiceData();

    // Balance workloads
    await this.balanceWorkloads();

    // Update configurations
    await this.updateConfigurations();
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case 'register':
        this.agents.set(data.agentId, { ws, ...data });
        ws.send(JSON.stringify({ type: 'registered', agentId: data.agentId }));
        break;

      case 'task_complete':
        const existingTask = this.tasks.get(data.taskId);
        if (existingTask) {
          this.tasks.set(data.taskId, { ...existingTask, status: 'completed', result: data.result });
        }
        break;

      case 'heartbeat':
        // Update agent last seen
        const existingAgent = this.agents.get(data.agentId);
        if (existingAgent) {
          this.agents.set(data.agentId, { ...existingAgent, lastSeen: Date.now() });
        }
        break;
    }
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new task
   */
  async createTask(taskId: string, type: string, data: any) {
    const task: TaskInfo = {
      id: taskId,
      type,
      data,
      status: 'pending',
      created: new Date().toISOString(),
      assignedTo: undefined
    };

    this.tasks.set(taskId, task);

    // Store in Redis for persistence
    await this.redis.set(`task:${taskId}`, JSON.stringify(task));
  }

  /**
   * Find suitable agent for task
   */
  findSuitableAgent(task: TaskInfo): AgentInfo | null {
    // Simple agent selection logic
    for (const [id, agent] of this.agents) {
      if (agent.capabilities && agent.capabilities.includes(task.type)) {
        return agent;
      }
    }
    return null;
  }

  /**
   * Assign task to agent
   */
  async assignTaskToAgent(task: TaskInfo, agent: AgentInfo) {
    task.status = 'assigned';
    task.assignedTo = agent.id;
    task.assignedAt = new Date().toISOString();

    this.tasks.set(task.id, task);

    // Send via WebSocket
    agent.ws.send(JSON.stringify({
      type: 'task_assigned',
      taskId: task.id,
      task
    }));

    // Update Redis
    await this.redis.set(`task:${task.id}`, JSON.stringify(task));
  }

  /**
   * Sync data between services
   */
  async syncServiceData() {
    // Implementation for syncing data between services
    console.log('📊 Syncing service data...');
  }

  /**
   * Balance workloads across agents
   */
  async balanceWorkloads() {
    // Implementation for workload balancing
    console.log('⚖️  Balancing workloads...');
  }

  /**
   * Update configurations
   */
  async updateConfigurations() {
    // Implementation for configuration updates
    console.log('⚙️  Updating configurations...');
  }
}

// Start the unified orchestrator
const orchestrator = new UnifiedAgentOrchestrator();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await orchestrator.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await orchestrator.stop();
  process.exit(0);
});

orchestrator.start().catch(console.error);

export default UnifiedAgentOrchestrator;