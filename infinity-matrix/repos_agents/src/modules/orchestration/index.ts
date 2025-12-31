/**
 * Orchestration Module
 * Coordinates all modules and provides unified API for the agent ecosystem
 */

import express from 'express';
import { spawn as spawnChild } from 'child_process';
import path from 'path';
import { BaseModule, ModuleConfig } from '../core/index.js';
import { moduleRegistry } from '../core/registry.js';
import UnifiedAgentOrchestrator from '../../unified-orchestrator.js';

export interface OrchestrationConfig extends ModuleConfig {
  port: number;
  enableWebSocket: boolean;
  enableREST: boolean;
  pythonLauncherEnabled: boolean;
}

export class OrchestrationManager extends BaseModule {
  private app?: express.Application;
  private unifiedOrchestrator?: UnifiedAgentOrchestrator;
  private pythonAgents: Map<string, string> = new Map([
    ['launch-all', 'launch_all_agents.py'],
    ['master-launcher', 'master_launcher.py']
  ]);

  constructor(config: Partial<OrchestrationConfig> = {}) {
    super('orchestration', '1.0.0', {
      port: 8080,
      enableWebSocket: true,
      enableREST: true,
      pythonLauncherEnabled: true,
      ...config
    });
  }

  async init(config?: Partial<OrchestrationConfig>): Promise<void> {
    await super.init(config);

    // Initialize unified orchestrator
    this.unifiedOrchestrator = new UnifiedAgentOrchestrator();

    // Setup REST API if enabled
    if (this.config.enableREST) {
      this.setupRESTAPI();
    }
  }

  async start(): Promise<void> {
    await super.start();

    // Start unified orchestrator
    await this.unifiedOrchestrator?.start();

    // Start REST API server
    if (this.app && this.config.enableREST) {
      const port = this.config.port as number;
      this.app.listen(port, () => {
        console.log(`🌐 Orchestration API running on port ${port}`);
      });
    }

    console.log('🎯 Orchestration module started');
  }

  async stop(): Promise<void> {
    await super.stop();
    await this.unifiedOrchestrator?.stop();
  }

  private setupRESTAPI(): void {
    this.app = express();
    this.app.use(express.json());

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    // Module management endpoints
    this.app.get('/modules', async (req, res) => {
      try {
        const modules = moduleRegistry.list().map((m: any) => ({
          name: m.name,
          version: m.version,
          enabled: m.config.enabled
        }));
        res.json(modules);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/modules/:name/status', async (req, res) => {
      try {
        const module = moduleRegistry.get(req.params.name);
        if (!module) {
          return res.status(404).json({ error: 'Module not found' });
        }
        const status = await module.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/modules/:name/task', async (req, res) => {
      try {
        const { taskName, params } = req.body;
        const result = await moduleRegistry.executeTask(req.params.name, taskName, params);
        res.json({ result });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // System orchestration endpoints
    this.app.post('/system/start', async (req, res) => {
      try {
        await moduleRegistry.startAll();
        res.json({ status: 'started' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.post('/system/stop', async (req, res) => {
      try {
        await moduleRegistry.stopAll();
        res.json({ status: 'stopped' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    this.app.get('/system/status', async (req, res) => {
      try {
        const statuses = await moduleRegistry.getAllStatuses();
        res.json({ modules: statuses });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });

    // Python agent endpoints
    this.app.post('/python/:agent', async (req, res) => {
      try {
        await this.launchPythonAgent(req.params.agent, req.body);
        res.json({ status: 'launched' });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  async launchPythonAgent(agentName: string, params?: any): Promise<void> {
    if (!this.config.pythonLauncherEnabled) {
      throw new Error('Python launcher is disabled');
    }

    const scriptName = this.pythonAgents.get(agentName);
    if (!scriptName) {
      throw new Error(`Unknown Python agent: ${agentName}`);
    }

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'), scriptName);
      const args = params ? [JSON.stringify(params)] : [];

      const python = spawnChild('python', [scriptPath, ...args], {
        detached: true,
        stdio: 'ignore'
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python agent ${agentName} failed with code ${code}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });

      // Detach the process
      python.unref();
    });
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'start-system':
        return moduleRegistry.startAll();
      case 'stop-system':
        return moduleRegistry.stopAll();
      case 'get-system-status':
        return moduleRegistry.getAllStatuses();
      case 'launch-python':
        return this.launchPythonAgent(params.agentName, params);
      default:
        return super.executeTask(taskName, params);
    }
  }
}

export default OrchestrationManager;