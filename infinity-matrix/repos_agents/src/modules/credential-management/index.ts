/**
 * Credential Management Module
 * Handles secure credential loading, management, and encryption
 */

import { spawn as spawnChild } from 'child_process';
import path from 'path';
import { BaseModule, ModuleConfig } from '../core/index.js';

export interface CredentialConfig extends ModuleConfig {
  credentialsDir: string;
  encryptionEnabled: boolean;
  autoRotateKeys: boolean;
}

export interface CredentialData {
  [key: string]: any;
}

export class CredentialManager extends BaseModule {
  private credentialsDir: string;
  private encryptionEnabled: boolean;

  constructor(config: Partial<CredentialConfig> = {}) {
    super('credential-management', '1.0.0', {
      credentialsDir: process.env.CREDENTIALS_DIR || path.join(process.cwd(), '..', '..', 'credentials'),
      encryptionEnabled: true,
      autoRotateKeys: false,
      ...config
    });

    this.credentialsDir = this.config.credentialsDir as string;
    this.encryptionEnabled = this.config.encryptionEnabled as boolean;
  }

  async init(config?: Partial<CredentialConfig>): Promise<void> {
    await super.init(config);
    // Validate credentials directory exists
    const fs = await import('fs');
    if (!fs.existsSync(this.credentialsDir)) {
      throw new Error(`Credentials directory not found: ${this.credentialsDir}`);
    }
  }

  async loadCredential(category: string, filename: string, encrypted: boolean = false): Promise<CredentialData> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.credentialsDir, 'credential_manager.py');
      const args = ['load', category, filename, encrypted.toString()];

      const python = spawnChild('python', [scriptPath, ...args], {
        cwd: this.credentialsDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const data = JSON.parse(stdout.trim());
            resolve(data);
          } catch (error) {
            reject(new Error(`Failed to parse credential data: ${error}`));
          }
        } else {
          reject(new Error(`Credential loading failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async saveCredential(category: string, filename: string, data: CredentialData, encrypt: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.credentialsDir, 'credential_manager.py');
      const args = ['save', category, filename, JSON.stringify(data), encrypt.toString()];

      const python = spawnChild('python', [scriptPath, ...args], {
        cwd: this.credentialsDir,
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
          reject(new Error(`Credential saving failed: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getGoogleCloudCredentials(): Promise<CredentialData> {
    return this.loadCredential('google_cloud', 'service_account.json', this.encryptionEnabled);
  }

  async getGitHubCredentials(): Promise<CredentialData> {
    return this.loadCredential('github', 'credentials.json', this.encryptionEnabled);
  }

  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'load':
        return this.loadCredential(params.category, params.filename, params.encrypted);
      case 'save':
        return this.saveCredential(params.category, params.filename, params.data, params.encrypt);
      case 'getGoogleCloud':
        return this.getGoogleCloudCredentials();
      case 'getGitHub':
        return this.getGitHubCredentials();
      default:
        return super.executeTask(taskName, params);
    }
  }
}

export default CredentialManager;