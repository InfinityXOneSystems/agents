import * as express from 'express';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import Puppeteer from 'puppeteer';

const execAsync = promisify(exec);

class RepoSyncAgent {
    private reposPath: string;
    private syncInterval: number;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(reposPath: string = 'c:/AI/repos', syncInterval: number = 300000) { // 5 minutes default
        this.reposPath = reposPath;
        this.syncInterval = syncInterval;
    }

    async startSync() {
        console.log('[RepoSyncAgent] Starting continuous sync...');
        this.intervalId = setInterval(async () => {
            await this.syncAllRepos();
        }, this.syncInterval);
        // Initial sync
        await this.syncAllRepos();
    }

    async stopSync() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[RepoSyncAgent] Sync stopped.');
        }
    }

    private async syncAllRepos() {
        try {
            const repos = fs.readdirSync(this.reposPath).filter(dir => {
                const fullPath = path.join(this.reposPath, dir);
                return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, '.git'));
            });

            for (const repo of repos) {
                await this.syncRepo(repo);
            }
        } catch (error) {
            console.error('[RepoSyncAgent] Error syncing repos:', error);
        }
    }

    private async syncRepo(repoName: string) {
        const repoPath = path.join(this.reposPath, repoName);
        try {
            console.log(`[RepoSyncAgent] Syncing ${repoName}...`);
            // Fetch latest changes
            await execAsync('git fetch --all --prune', { cwd: repoPath });
            // Get current branch
            const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
            const currentBranch = branch.trim();
            // Pull if on main/master
            if (currentBranch === 'main' || currentBranch === 'master') {
                await execAsync('git pull --rebase', { cwd: repoPath });
            }
            // Check for local changes and push if any
            const { stdout: status } = await execAsync('git status --porcelain', { cwd: repoPath });
            if (status.trim()) {
                await execAsync('git add -A', { cwd: repoPath });
                await execAsync('git commit -m "Auto-sync: local changes"', { cwd: repoPath });
                await execAsync('git push origin HEAD', { cwd: repoPath });
            }
            console.log(`[RepoSyncAgent] Synced ${repoName}.`);
        } catch (error) {
            console.error(`[RepoSyncAgent] Error syncing ${repoName}:`, error);
        }
    }

    async handlePR(repoName: string, action: string, details?: any) {
        // Placeholder for PR handling - integrate with GitHub API tools
        console.log(`[RepoSyncAgent] Handling PR for ${repoName}: ${action}`, details);
        // Could use mcp_github tools here for create, review, merge PRs
    }

    async runCodeChecks(repoName: string) {
        const repoPath = path.join(this.reposPath, repoName);
        try {
            console.log(`[RepoSyncAgent] Running code checks for ${repoName}...`);
            // Check if package.json exists for npm scripts
            if (fs.existsSync(path.join(repoPath, 'package.json'))) {
                await execAsync('npm run lint', { cwd: repoPath });
                await execAsync('npm test', { cwd: repoPath });
            }
            // Check for Python
            if (fs.existsSync(path.join(repoPath, 'requirements.txt')) || fs.existsSync(path.join(repoPath, 'pyproject.toml'))) {
                await execAsync('python -m flake8 .', { cwd: repoPath });
                await execAsync('python -m pytest', { cwd: repoPath });
            }
            console.log(`[RepoSyncAgent] Code checks passed for ${repoName}.`);
        } catch (error) {
            console.error(`[RepoSyncAgent] Code checks failed for ${repoName}:`, error);
            // Could create issue or notify
        }
    }
}

// Export for use in orchestrator
export { RepoSyncAgent };