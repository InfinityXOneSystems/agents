/**
 * Sync & Integration Module
 * Handles repository synchronization, cloud integration, and data syncing
 */

import { spawn as spawnChild } from 'child_process';
import path from 'path';
import { BaseModule, ModuleConfig } from '../core/index.js';
import AutoSyncService from '../../services/auto-sync.js';

export interface SyncConfig extends ModuleConfig {
  syncInterval: number;
  cloudProviders: string[];
  autoSyncEnabled: boolean;
  repositories: string[];
}

export class SyncIntegrationManager extends BaseModule {
  private syncService: AutoSyncService;
  private pythonAgents: Map<string, string> = new Map([
    ['repo-sync', 'repo_sync_agent.py'],
    ['master-integrator', 'master_integrator.py']
  ]);

  constructor(config: Partial<SyncConfig> = {}) {
    super('sync-integration', '1.0.0', {
      syncInterval: 5 * 60 * 1000, // 5 minutes
      cloudProviders: ['google-cloud', 'github'],
      autoSyncEnabled: true,
      repositories: [],
      ...config
    });

    this.syncService = new AutoSyncService();
  }

  async init(config?: Partial<SyncConfig>): Promise<void> {
    await super.init(config);
    // Initialize TypeScript sync service
    // AutoSyncService doesn't have init method
    // await this.syncService.init?.() || Promise.resolve();
  }

  async start(): Promise<void> {
    await super.start();

    if (this.config.autoSyncEnabled) {
      this.syncService.start();
    }

    console.log('🔄 Sync & Integration module started');
  }

  async stop(): Promise<void> {
    await super.stop();
    // AutoSyncService doesn't have stop method
    // this.syncService.stop?.() || Promise.resolve();
  }

  async syncRepository(repoName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'), 'repo_sync_agent.py');
      const args = ['sync', repoName];

      const python = spawnChild('python', [scriptPath, ...args], {
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
          reject(new Error(`Repository sync failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runMasterIntegration(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'), 'master_integrator.py');

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
          reject(new Error(`Master integration failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async performFullSync(): Promise<void> {
    console.log('🔄 Performing full system sync...');

    // Run TypeScript auto-sync
    // Run TypeScript auto-sync
    if (this.syncService.performFullSync) {
      await this.syncService.performFullSync();
    }

    // Run Python repo sync
    await this.runMasterIntegration();

    console.log('✅ Full sync completed');
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'sync-repo':
        return this.syncRepository(params.repoName);
      case 'master-integration':
        return this.runMasterIntegration();
      case 'full-sync':
        return this.performFullSync();
      case 'discover-repos':
        return this.syncService.discoverRepos?.() || [];
      default:
        return super.executeTask(taskName, params);
    }
  }
}

export default SyncIntegrationManager;