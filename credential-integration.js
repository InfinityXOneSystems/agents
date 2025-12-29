/**
 * Infinity Gateway - Credential Manager Integration
 * Seamlessly integrate centralized credentials into the gateway
 */

const path = require('path');

class GatewayCredentialIntegration {
  constructor(gatewayConfig) {
    this.gatewayConfig = gatewayConfig;
    this.credentialManagerPath = path.join(__dirname, 'credential-manager');
    this.credentials = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔐 Initializing Gateway Credential Integration...');

      // Import the credential manager
      const { CredentialManager } = require(path.join(this.credentialManagerPath, 'credentialManager'));
      const config = require(path.join(this.credentialManagerPath, 'config'));

      this.manager = new CredentialManager(config);
      await this.manager.initialize();

      // Load credentials into memory for faster access
      const allCreds = this.manager.getAllCredentials();
      for (const cred of allCreds) {
        this.credentials.set(cred.name, cred.value);
      }

      this.initialized = true;
      console.log('✅ Gateway Credential Integration initialized');
    } catch (error) {
      console.error('Failed to initialize Gateway Credential Integration:', error);
      throw error;
    }
  }

  getCredential(name) {
    return this.credentials.get(name) || null;
  }

  getAllCredentials() {
    return Object.fromEntries(this.credentials);
  }

  async setCredential(name, value) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.manager.setCredential(name, value);
    this.credentials.set(name, value);
    console.log(`✅ Credential '${name}' updated in gateway integration`);
  }

  // Convenience methods for common credentials
  getInfinityXOneCredentials() {
    return this.getCredential('infinityxone-credentials');
  }

  getWorkspaceServiceAccount() {
    return this.getCredential('workspace-sa-json');
  }

  getFirebaseConfig() {
    return this.getCredential('firebase-config');
  }

  getGitHubAppConfig() {
    return this.getCredential('github-app-config');
  }

  getGitHubOAuthToken() {
    return this.getCredential('InfinityXOneSystems-github-oauthtoken-c52d6b');
  }

  async validateCredentials() {
    if (!this.initialized) {
      await this.initialize();
    }

    const validation = await this.manager.validateCredentials();
    return {
      ...validation,
      gatewayIntegration: this.initialized
    };
  }

  getStatus() {
    if (!this.initialized) {
      return { initialized: false };
    }

    return {
      initialized: this.initialized,
      credentialCount: this.credentials.size,
      credentialManagerPath: this.credentialManagerPath,
      requiredCredentials: [
        'infinityxone-credentials',
        'workspace-sa-json',
        'firebase-config',
        'github-app-config',
        'InfinityXOneSystems-github-oauthtoken-c52d6b'
      ]
    };
  }
}

// Export for use in Infinity Gateway
module.exports = { GatewayCredentialIntegration };

// Example usage:
/*
// In your gateway server file
const { GatewayCredentialIntegration } = require('./credential-integration');

const credentialIntegration = new GatewayCredentialIntegration(gatewayConfig);
await credentialIntegration.initialize();

// Use credentials in services
const aiService = new AIService({
  apiKey: credentialIntegration.getInfinityXOneCredentials(),
  // ... other config
});

const githubService = new GitHubService({
  token: credentialIntegration.getGitHubOAuthToken(),
  // ... other config
});
*/