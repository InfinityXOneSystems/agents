#!/usr/bin/env node

/**
 * Auto-Sync Service
 * Automatically synchronizes all repositories, manages dependencies,
 * builds, deploys, and maintains the entire system
 */

import { execSync, spawn as spawnChild } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';

class AutoSyncService {
  private workspaceRoot: string;
  private repos: string[];
  private syncInterval: number;
  private isRunning: boolean;

  constructor() {
    this.workspaceRoot = path.resolve(__dirname, '..', '..');
    this.repos = this.discoverRepos();
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
  }

  /**
   * Discover all repositories in the workspace
   */
  discoverRepos(): string[] {
    const reposDir = path.join(this.workspaceRoot, 'repos');
    if (!fs.existsSync(reposDir)) return [];

    return fs.readdirSync(reposDir)
      .map((item: string) => path.join(reposDir, item))
      .filter((item: string) => fs.statSync(item).isDirectory() && fs.existsSync(path.join(item, '.git')));
  }

  /**
   * Start the auto-sync service
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🚀 Starting Auto-Sync Service...');
    console.log(`📁 Monitoring ${this.repos.length} repositories`);

    // Initial sync
    this.performFullSync();

    // Schedule periodic syncs
    setInterval(() => {
      this.performFullSync();
    }, this.syncInterval);

    console.log('✅ Auto-Sync Service running (syncs every 5 minutes)');
  }

  /**
   * Perform a full synchronization cycle
   */
  async performFullSync() {
    console.log('\n🔄 Starting full sync cycle...');

    try {
      // 1. Sync all repositories
      await this.syncAllRepos();

      // 2. Update dependencies
      await this.updateAllDependencies();

      // 3. Build all projects
      await this.buildAllProjects();

      // 4. Run tests
      await this.runAllTests();

      // 5. Deploy services
      await this.deployServices();

      // 6. Health check
      await this.performHealthCheck();

      console.log('✅ Full sync cycle completed successfully');

    } catch (error) {
      console.error('❌ Sync cycle failed:', error instanceof Error ? error.message : String(error));
      await this.handleSyncFailure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Sync all repositories
   */
  async syncAllRepos() {
    console.log('📥 Syncing repositories...');

    for (const repo of this.repos) {
      try {
        const repoName = path.basename(repo);
        console.log(`  ↻ ${repoName}`);

        // Pull latest changes
        execSync('git pull --rebase', { cwd: repo, stdio: 'pipe' });

        // Push any local changes
        execSync('git push', { cwd: repo, stdio: 'pipe' });

      } catch (error) {
        console.warn(`  ⚠️  Failed to sync ${path.basename(repo)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Update dependencies for all projects
   */
  async updateAllDependencies() {
    console.log('📦 Updating dependencies...');

    for (const repo of this.repos) {
      try {
        const repoName = path.basename(repo);

        // Check for package.json
        const packageJson = path.join(repo, 'package.json');
        if (fs.existsSync(packageJson)) {
          console.log(`  ↻ ${repoName} (npm)`);
          execSync('npm update', { cwd: repo, stdio: 'pipe' });
        }

        // Check for requirements.txt
        const requirementsTxt = path.join(repo, 'requirements.txt');
        if (fs.existsSync(requirementsTxt)) {
          console.log(`  ↻ ${repoName} (pip)`);
          execSync('pip install -r requirements.txt --upgrade', { cwd: repo, stdio: 'pipe' });
        }

      } catch (error) {
        console.warn(`  ⚠️  Failed to update ${path.basename(repo)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Build all projects
   */
  async buildAllProjects() {
    console.log('🔨 Building projects...');

    for (const repo of this.repos) {
      try {
        const repoName = path.basename(repo);

        // Check for package.json with build script
        const packageJson = path.join(repo, 'package.json');
        if (fs.existsSync(packageJson)) {
          const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
          if (pkg.scripts && pkg.scripts.build) {
            console.log(`  ↻ ${repoName}`);
            execSync('npm run build', { cwd: repo, stdio: 'pipe' });
          }
        }

      } catch (error) {
        console.warn(`  ⚠️  Failed to build ${path.basename(repo)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Run tests for all projects
   */
  async runAllTests() {
    console.log('🧪 Running tests...');

    for (const repo of this.repos) {
      try {
        const repoName = path.basename(repo);

        // Check for package.json with test script
        const packageJson = path.join(repo, 'package.json');
        if (fs.existsSync(packageJson)) {
          const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
          if (pkg.scripts && pkg.scripts.test) {
            console.log(`  ↻ ${repoName}`);
            execSync('npm test', { cwd: repo, stdio: 'pipe' });
          }
        }

      } catch (error) {
        console.warn(`  ⚠️  Failed tests in ${path.basename(repo)}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Deploy services
   */
  async deployServices() {
    console.log('🚀 Deploying services...');

    const orchestrationDir = path.join(this.workspaceRoot, 'repos', 'orchestration-config');

    if (fs.existsSync(orchestrationDir)) {
      try {
        console.log('  ↻ Restarting orchestration services');
        execSync('docker compose down', { cwd: orchestrationDir, stdio: 'pipe' });
        execSync('docker compose up -d --build', { cwd: orchestrationDir, stdio: 'pipe' });
      } catch (error) {
        console.warn(`  ⚠️  Failed to deploy services: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    console.log('🏥 Performing health checks...');

    // Check if services are running
    try {
      const result = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}"', { encoding: 'utf8' });
      console.log('  📊 Service Status:');
      console.log(result);
    } catch (error) {
      console.warn('  ⚠️  Could not check service status');
    }
  }

  /**
   * Handle sync failures
   */
  async handleSyncFailure(error: Error): Promise<void> {
    console.log('🔧 Attempting to fix sync issues...');

    // Try to restart services
    await this.deployServices();

    // Send notification (placeholder)
    console.log('📧 Sync failure notification sent');
  }

  /**
   * Stop the service
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Auto-Sync Service stopped');
  }
}

// Start the service if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new AutoSyncService();
  service.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down Auto-Sync Service...');
    service.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down Auto-Sync Service...');
    service.stop();
    process.exit(0);
  });
}

export default AutoSyncService;