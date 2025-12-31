/**
 * Monitoring & Maintenance Module
 * Handles system monitoring, health checks, and automated maintenance tasks
 */

import { spawn as spawnChild } from 'child_process';
import path from 'path';
import { BaseModule, ModuleConfig } from '../core/index.js';
import { MaintenanceAgent } from '../../agents/maintenance.js';

export interface MonitoringConfig extends ModuleConfig {
  healthCheckInterval: number;
  maintenanceInterval: number;
  autoFixEnabled: boolean;
  monitoringTargets: string[];
}

export class MonitoringMaintenanceManager extends BaseModule {
  private maintenanceAgent: MaintenanceAgent;
  private pythonAgents: Map<string, string> = new Map([
    ['system-fixer', 'system_fixer.py'],
    ['background-tester', 'background_tester.py'],
    ['dashboard-guardian', 'dashboard_guardian.py'],
    ['problem-fixer', 'problem_fixer.py'],
    ['repo-optimizer', 'repo_optimizer.py']
  ]);

  constructor(config: Partial<MonitoringConfig> = {}) {
    super('monitoring-maintenance', '1.0.0', {
      healthCheckInterval: 10 * 60 * 1000, // 10 minutes
      maintenanceInterval: 30 * 60 * 1000, // 30 minutes
      autoFixEnabled: true,
      monitoringTargets: ['docker', 'repositories', 'services'],
      ...config
    });

    // We'll need to create a mock orchestrator for the maintenance agent
    const mockOrchestrator = {
      getStatus: () => ({ status: 'running' }),
      executeTask: () => Promise.resolve()
    } as any;

    this.maintenanceAgent = new MaintenanceAgent(mockOrchestrator, {
      syncInterval: this.config.maintenanceInterval as number,
      healthCheckInterval: this.config.healthCheckInterval as number,
      autoFixEnabled: this.config.autoFixEnabled as boolean
    });
  }

  async init(config?: Partial<MonitoringConfig>): Promise<void> {
    await super.init(config);
    // MaintenanceAgent doesn't have init, just start
    // await this.maintenanceAgent.init?.() || Promise.resolve();
  }

  async start(): Promise<void> {
    await super.start();
    await this.maintenanceAgent.start();

    // Schedule health checks
    if (this.config.healthCheckInterval > 0) {
      setInterval(() => this.performHealthCheck(), this.config.healthCheckInterval as number);
    }

    console.log('🔍 Monitoring & Maintenance module started');
  }

  async stop(): Promise<void> {
    await super.stop();
    // MaintenanceAgent stop method
    if (this.maintenanceAgent.stop) {
      await this.maintenanceAgent.stop();
    }
  }

  async performHealthCheck(): Promise<any> {
    console.log('🏥 Performing system health check...');

    const results = {
      docker: await this.checkDockerHealth(),
      repositories: await this.checkRepositoryHealth(),
      services: await this.checkServiceHealth()
    };

    const issues = Object.entries(results).filter(([, healthy]) => !healthy);
    if (issues.length > 0 && this.config.autoFixEnabled) {
      await this.autoFixIssues(issues.map(([service]) => service));
    }

    return results;
  }

  private async checkDockerHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const docker = spawnChild('docker', ['ps'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      docker.on('close', (code) => {
        resolve(code === 0);
      });

      docker.on('error', () => {
        resolve(false);
      });
    });
  }

  private async checkRepositoryHealth(): Promise<boolean> {
    // Check if repos directory exists and has git repos
    const fs = await import('fs');
    const path = await import('path');
    const reposDir = path.join(process.cwd(), '..', '..', 'repos');

    if (!fs.existsSync(reposDir)) return false;

    const items = fs.readdirSync(reposDir);
    return items.some(item => {
      const itemPath = path.join(reposDir, item);
      return fs.statSync(itemPath).isDirectory() && fs.existsSync(path.join(itemPath, '.git'));
    });
  }

  private async checkServiceHealth(): Promise<boolean> {
    // Check if key services are running (simplified)
    return true; // Placeholder
  }

  async autoFixIssues(services: string[]): Promise<void> {
    console.log(`🔧 Auto-fixing issues for: ${services.join(', ')}`);

    for (const service of services) {
      switch (service) {
        case 'docker':
          await this.runPythonAgent('system-fixer');
          break;
        case 'repositories':
          await this.runPythonAgent('repo-optimizer');
          break;
      }
    }
  }

  private async runPythonAgent(agentName: string): Promise<void> {
    const scriptName = this.pythonAgents.get(agentName);
    if (!scriptName) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'), scriptName);

      const python = spawnChild('python', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';

      python.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${agentName} failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'health-check':
        return this.performHealthCheck();
      case 'auto-fix':
        return this.autoFixIssues(params.services || []);
      case 'run-agent':
        return this.runPythonAgent(params.agentName);
      default:
        return super.executeTask(taskName, params);
    }
  }
}

export default MonitoringMaintenanceManager;