/**
 * VS Code Integration Service
 * Provides integration with VS Code for enhanced LLM capabilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VSCodeContext {
  workspacePath?: string;
  activeFile?: string;
  selectedText?: string;
  cursorPosition?: { line: number; character: number };
  openFiles?: string[];
  workspaceSymbols?: any[];
  diagnostics?: any[];
  gitStatus?: any;
}

export interface VSCodeCommand {
  command: string;
  args?: any[];
  expectOutput?: boolean;
}

export class VSCodeIntegration {
  private workspacePath?: string;
  private isRunning: boolean = false;

  constructor(workspacePath?: string) {
    this.workspacePath = workspacePath || process.cwd();
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('💻 VS Code integration started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('💻 VS Code integration stopped');
  }

  /**
   * Get current VS Code context
   */
  async getCurrentContext(): Promise<VSCodeContext> {
    const context: VSCodeContext = {
      workspacePath: this.workspacePath
    };

    try {
      // Get active file
      context.activeFile = await this.getActiveFile();

      // Get selected text
      context.selectedText = await this.getSelectedText();

      // Get cursor position
      context.cursorPosition = await this.getCursorPosition();

      // Get open files
      context.openFiles = await this.getOpenFiles();

      // Get workspace symbols
      context.workspaceSymbols = await this.getWorkspaceSymbols();

      // Get diagnostics
      context.diagnostics = await this.getDiagnostics();

      // Get git status
      context.gitStatus = await this.getGitStatus();

    } catch (error) {
      console.warn('Failed to get some VS Code context:', error);
    }

    return context;
  }

  /**
   * Execute VS Code command
   */
  async executeCommand(command: VSCodeCommand): Promise<any> {
    try {
      const result = await this.runVSCodeCommand(command.command, command.args);

      if (command.expectOutput) {
        return result;
      }

      return { success: true };
    } catch (error) {
      console.error('VS Code command failed:', error);
      throw error;
    }
  }

  /**
   * Get active file path
   */
  private async getActiveFile(): Promise<string | undefined> {
    // This would integrate with VS Code API
    // For now, return undefined as we can't directly access VS Code state
    return undefined;
  }

  /**
   * Get selected text
   */
  private async getSelectedText(): Promise<string | undefined> {
    // This would integrate with VS Code API
    return undefined;
  }

  /**
   * Get cursor position
   */
  private async getCursorPosition(): Promise<{ line: number; character: number } | undefined> {
    // This would integrate with VS Code API
    return undefined;
  }

  /**
   * Get list of open files
   */
  private async getOpenFiles(): Promise<string[]> {
    try {
      if (!this.workspacePath) return [];

      // Get files that have been recently modified (proxy for open files)
      const files = await this.getRecentlyModifiedFiles();
      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get workspace symbols
   */
  private async getWorkspaceSymbols(): Promise<any[]> {
    try {
      // This would use VS Code's symbol search API
      // For now, return empty array
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get diagnostics/errors
   */
  private async getDiagnostics(): Promise<any[]> {
    try {
      // This would use VS Code's diagnostics API
      // For now, return empty array
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get git status
   */
  private async getGitStatus(): Promise<any> {
    try {
      if (!this.workspacePath) return null;

      const { stdout } = await execAsync('git status --porcelain', { cwd: this.workspacePath });
      const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: this.workspacePath });

      return {
        branch: branch.trim(),
        changes: stdout.split('\n').filter(line => line.trim()).length
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get recently modified files
   */
  private async getRecentlyModifiedFiles(): Promise<string[]> {
    try {
      if (!this.workspacePath) return [];

      const { stdout } = await execAsync('git log --name-only --since="1 hour ago" --pretty=format:', { cwd: this.workspacePath });
      const files = stdout.split('\n').filter(file => file.trim());

      return [...new Set(files)]; // Remove duplicates
    } catch (error) {
      return [];
    }
  }

  /**
   * Run VS Code command
   */
  private async runVSCodeCommand(command: string, args?: any[]): Promise<any> {
    // This would use VS Code's command execution API
    // For now, we'll simulate some common commands

    switch (command) {
      case 'vscode.open':
        return await this.openFile(args?.[0]);

      case 'vscode.diff':
        return await this.showDiff(args?.[0], args?.[1]);

      case 'vscode.search':
        return await this.searchWorkspace(args?.[0]);

      case 'vscode.runTask':
        return await this.runTask(args?.[0]);

      default:
        throw new Error(`Unknown VS Code command: ${command}`);
    }
  }

  /**
   * Open file in VS Code
   */
  private async openFile(filePath: string): Promise<any> {
    try {
      await execAsync(`code "${filePath}"`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to open file: ${error}`);
    }
  }

  /**
   * Show diff between files
   */
  private async showDiff(file1: string, file2: string): Promise<any> {
    try {
      await execAsync(`code --diff "${file1}" "${file2}"`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to show diff: ${error}`);
    }
  }

  /**
   * Search workspace
   */
  private async searchWorkspace(query: string): Promise<any> {
    try {
      if (!this.workspacePath) throw new Error('No workspace path');

      const { stdout } = await execAsync(`grep -r "${query}" . --include="*.ts" --include="*.js" --include="*.py"`, { cwd: this.workspacePath });
      return { results: stdout.split('\n').filter(line => line.trim()) };
    } catch (error) {
      return { results: [] };
    }
  }

  /**
   * Run VS Code task
   */
  private async runTask(taskName: string): Promise<any> {
    try {
      await execAsync(`npm run ${taskName}`, { cwd: this.workspacePath });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to run task: ${error}`);
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<any> {
    return {
      running: this.isRunning,
      workspacePath: this.workspacePath,
      hasWorkspace: !!this.workspacePath && fs.existsSync(this.workspacePath)
    };
  }
}