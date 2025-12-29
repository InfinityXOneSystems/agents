/**
 * InfinityXOne Credential Manager (JavaScript Version)
 * Centralized credential management with bidirectional sync
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

// Dynamic imports for optional dependencies
let SecretManagerServiceClient = null;
let Octokit = null;

try {
  SecretManagerServiceClient = require('@google-cloud/secret-manager').SecretManagerServiceClient;
} catch (error) {
  console.warn('Google Cloud Secret Manager not available:', error.message);
}

try {
  Octokit = require('@octokit/rest').Octokit;
} catch (error) {
  console.warn('GitHub API client not available:', error.message);
}

class CredentialManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.encryptionKey = this.generateEncryptionKey();
    this.localStore = new Map();
    this.isInitialized = false;

    // Initialize clients if available and configured
    this.gcpClient = null;
    if (SecretManagerServiceClient) {
      // Primary: use explicit service account key if provided
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        try {
          this.gcpClient = new SecretManagerServiceClient({
            projectId: config.gcpProjectId,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
          });
          console.log('✅ GCP client initialized using service account key');
        } catch (error) {
          console.warn('Failed to initialize GCP client with key file:', error.message);
        }
      }

      // Fallback: try Application Default Credentials (ADC)
      if (!this.gcpClient) {
        // If GOOGLE_APPLICATION_CREDENTIALS is set but points to a non-existent file,
        // temporarily unset it so GoogleAuth doesn't attempt to stat it and throw ENOENT.
        let originalGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        let clearedGac = false;
        if (originalGac && !fs.existsSync(originalGac)) {
          console.warn(`GOOGLE_APPLICATION_CREDENTIALS is set but the file does not exist: ${originalGac}. Temporarily clearing for ADC initialization.`);
          delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
          clearedGac = true;
        }

        try {
          this.gcpClient = new SecretManagerServiceClient({
            projectId: config.gcpProjectId
          });
          console.log('✅ GCP client initialized using Application Default Credentials (ADC)');
        } catch (error) {
          console.log('⚠️  GCP ADC initialization failed:', error.message);
          this.gcpClient = null;
        } finally {
          // If we cleared a non-existent path, do NOT restore it — leave cleared so
          // ADC can be used for all subsequent GCP operations. If the original file
          // actually exists now, restore it (edge-case).
          if (clearedGac) {
            if (originalGac && fs.existsSync(originalGac)) {
              process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGac;
              console.log('🔁 Restored GOOGLE_APPLICATION_CREDENTIALS environment variable');
            } else {
              console.log('ℹ️  Left GOOGLE_APPLICATION_CREDENTIALS cleared to allow ADC-based GCP access');
            }
          }
        }
      }

      if (!this.gcpClient) {
        console.log('⚠️  GCP client could not be initialized - GCP sync disabled');
      }
    } else {
      console.log('⚠️  Google Cloud Secret Manager SDK not available - GCP sync disabled');
    }

    this.githubClient = null;
    if (Octokit && config.github.token && config.github.token !== 'your_github_token_here') {
      try {
        this.githubClient = new Octokit({
          auth: config.github.token
        });
        console.log('✅ GitHub client initialized');
      } catch (error) {
        console.warn('Failed to initialize GitHub client:', error.message);
      }
    } else {
      console.log('⚠️  GitHub token not configured - GitHub sync disabled');
    }

    this.ensureLocalDirectory();
  }

  generateEncryptionKey() {
    const systemId = crypto.createHash('sha256')
      .update(`${process.env.USERNAME || 'unknown'}-${process.env.COMPUTERNAME || 'unknown'}`)
      .digest('hex');
    return systemId; // 64 characters for AES-256
  }

  ensureLocalDirectory() {
    if (!fs.existsSync(this.config.localPath)) {
      fs.mkdirSync(this.config.localPath, { recursive: true });
    }
  }

  encrypt(data) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.encryptionKey, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.encryptionKey, 'hex');
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  getLocalCredentialPath(name) {
    return path.join(this.config.localPath, `${name}.cred`);
  }

  saveLocalCredential(credential) {
    const filePath = this.getLocalCredentialPath(credential.name);
    const data = {
      ...credential,
      value: credential.encrypted ? this.encrypt(credential.value) : credential.value,
      lastUpdated: credential.lastUpdated.toISOString()
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  loadLocalCredential(name) {
    const filePath = this.getLocalCredentialPath(name);
    if (!fs.existsSync(filePath)) return null;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.encrypted) {
        data.value = this.decrypt(data.value);
        data.encrypted = false;
      }
      data.lastUpdated = new Date(data.lastUpdated);
      return data;
    } catch (error) {
      console.error(`Failed to load local credential ${name}:`, error);
      return null;
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Credential Manager...');

    // Load existing local credentials
    await this.loadLocalCredentials();

    // Attempt to sync from remote sources
    if (this.gcpClient) {
      await this.syncFromGCP();
    } else {
      console.log('⚠️  GCP client not available - skipping GCP sync');
    }

    if (this.githubClient) {
      await this.syncFromGitHub();
    } else {
      console.log('⚠️  GitHub client not available - skipping GitHub sync');
    }

    this.isInitialized = true;
    console.log('✅ Credential Manager initialized');
  }

  async loadLocalCredentials() {
    try {
      const files = fs.readdirSync(this.config.localPath)
        .filter(file => file.endsWith('.cred'));

      for (const file of files) {
        const name = file.replace('.cred', '');
        const credential = this.loadLocalCredential(name);
        if (credential) {
          this.localStore.set(name, credential);
        }
      }
    } catch (error) {
      console.error('Failed to load local credentials:', error);
    }
  }

  async syncFromGCP() {
    if (!this.gcpClient) {
      console.log('⚠️  GCP client not available');
      return;
    }

    console.log('🔄 Syncing credentials from Google Cloud Secret Manager...');

    for (const [secretName, secretId] of Object.entries(this.config.gcpSecrets)) {
      try {
        const [version] = await this.gcpClient.accessSecretVersion({
          name: `projects/${this.config.gcpProjectId}/secrets/${secretId}/versions/latest`
        });

        const payload = version.payload?.data?.toString();
        if (payload) {
          const credential = {
            name: secretName,
            value: payload,
            description: `Synced from GCP Secret Manager: ${secretId}`,
            tags: ['gcp', 'auto-synced'],
            lastUpdated: new Date(),
            source: 'gcp',
            encrypted: false
          };

          this.localStore.set(secretName, credential);
          this.saveLocalCredential(credential);

          this.emit('credential-synced', { name: secretName, source: 'gcp' });
        }
      } catch (error) {
        console.error(`Failed to sync ${secretName} from GCP:`, error.message);
      }
    }
  }

  async syncToGCP() {
    if (!this.gcpClient) {
      console.log('⚠️  GCP client not available');
      return;
    }

    console.log('🔄 Syncing credentials to Google Cloud Secret Manager...');

    for (const [secretName, secretId] of Object.entries(this.config.gcpSecrets)) {
      const localCredential = this.localStore.get(secretName);
      if (!localCredential) continue;

      try {
        // Check if secret exists, create if not
        try {
          await this.gcpClient.getSecret({
            name: `projects/${this.config.gcpProjectId}/secrets/${secretId}`
          });
        } catch (error) {
          // Secret doesn't exist, create it
          await this.gcpClient.createSecret({
            parent: `projects/${this.config.gcpProjectId}`,
            secretId: secretId,
            secret: {
              replication: {
                automatic: {}
              }
            }
          });
        }

        // Add new version
        await this.gcpClient.addSecretVersion({
          parent: `projects/${this.config.gcpProjectId}/secrets/${secretId}`,
          payload: {
            data: Buffer.from(localCredential.value, 'utf8')
          }
        });

        this.emit('credential-synced', { name: secretName, source: 'gcp', direction: 'push' });
      } catch (error) {
        console.error(`Failed to sync ${secretName} to GCP:`, error.message);
      }
    }
  }

  async syncCredentialToGCP(name, credential) {
    if (!this.gcpClient) {
      console.log('⚠️  GCP client not available');
      return;
    }

    const secretId = this.config.gcpSecrets[name];
    if (!secretId) {
      console.log(`⚠️  No GCP secret mapping for ${name}`);
      return;
    }

    try {
      // Check if secret exists, create if not
      try {
        await this.gcpClient.getSecret({
          name: `projects/${this.config.gcpProjectId}/secrets/${secretId}`
        });
      } catch (error) {
        // Secret doesn't exist, create it
        await this.gcpClient.createSecret({
          parent: `projects/${this.config.gcpProjectId}`,
          secretId: secretId,
          secret: {
            replication: {
              automatic: {}
            }
          }
        });
      }

      // Add new version
      await this.gcpClient.addSecretVersion({
        parent: `projects/${this.config.gcpProjectId}/secrets/${secretId}`,
        payload: {
          data: Buffer.from(credential.value, 'utf8')
        }
      });

      console.log(`✅ Synced ${name} to GCP`);
      this.emit('credential-synced', { name, source: 'gcp', direction: 'push' });
    } catch (error) {
      console.error(`Failed to sync ${name} to GCP:`, error.message);
      throw error;
    }
  }

  async syncFromGitHub() {
    if (!this.githubClient) {
      console.log('⚠️  GitHub client not available');
      return;
    }

    console.log('🔄 Syncing credentials from GitHub...');

    try {
      const { data: secrets } = await this.githubClient.actions.listRepoSecrets({
        owner: this.config.github.owner,
        repo: this.config.github.repo
      });

      for (const secret of secrets.secrets) {
        try {
          // GitHub doesn't allow reading secret values via API for security
          // We'll mark them as synced but note that values need manual update
          const credential = {
            name: secret.name,
            value: '[PROTECTED - UPDATE MANUALLY]',
            description: `GitHub secret: ${secret.name}`,
            tags: ['github', 'protected'],
            lastUpdated: new Date(),
            source: 'github',
            encrypted: false
          };

          this.localStore.set(secret.name, credential);
          this.saveLocalCredential(credential);

          this.emit('credential-synced', { name: secret.name, source: 'github' });
        } catch (error) {
          console.error(`Failed to sync GitHub secret ${secret.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Failed to sync from GitHub:', error.message);
    }
  }

  async syncToGitHub() {
    if (!this.githubClient) {
      console.log('⚠️  GitHub client not available');
      return;
    }

    console.log('🔄 Syncing credentials to GitHub...');

    for (const [name, credential] of this.localStore.entries()) {
      if (credential.source === 'github' || credential.tags?.includes('github')) {
        try {
          // Get public key for encryption
          const { data: publicKey } = await this.githubClient.actions.getRepoPublicKey({
            owner: this.config.github.owner,
            repo: this.config.github.repo
          });

          // Encrypt the secret value
          const encryptedValue = this.encryptSecretForGitHub(credential.value, publicKey.key);

          await this.githubClient.actions.createOrUpdateRepoSecret({
            owner: this.config.github.owner,
            repo: this.config.github.repo,
            secret_name: name,
            encrypted_value: encryptedValue,
            key_id: publicKey.key_id
          });

          this.emit('credential-synced', { name, source: 'github', direction: 'push' });
        } catch (error) {
          console.error(`Failed to sync ${name} to GitHub:`, error.message);
        }
      }
    }
  }

  async syncCredentialToGitHub(name, credential) {
    if (!this.githubClient) {
      console.log('⚠️  GitHub client not available');
      return;
    }

    try {
      // Get public key for encryption
      const { data: publicKey } = await this.githubClient.actions.getRepoPublicKey({
        owner: this.config.github.owner,
        repo: this.config.github.repo
      });

      // Encrypt the secret value
      const encryptedValue = this.encryptSecretForGitHub(credential.value, publicKey.key);

      await this.githubClient.actions.createOrUpdateRepoSecret({
        owner: this.config.github.owner,
        repo: this.config.github.repo,
        secret_name: name,
        encrypted_value: encryptedValue,
        key_id: publicKey.key_id
      });

      console.log(`✅ Synced ${name} to GitHub`);
      this.emit('credential-synced', { name, source: 'github', direction: 'push' });
    } catch (error) {
      console.error(`Failed to sync ${name} to GitHub:`, error.message);
      throw error;
    }
  }

  async syncAll() {
    console.log('🔄 Starting bidirectional credential sync...');

    // Sync from all sources
    const syncFromPromises = [];
    if (this.gcpClient) syncFromPromises.push(this.syncFromGCP());
    if (this.githubClient) syncFromPromises.push(this.syncFromGitHub());
    await Promise.all(syncFromPromises);

    // Sync to all destinations
    const syncToPromises = [];
    if (this.gcpClient) syncToPromises.push(this.syncToGCP());
    if (this.githubClient) syncToPromises.push(this.syncToGitHub());
    await Promise.all(syncToPromises);

    console.log('✅ Bidirectional sync completed');
  }

  async setCredential(name, value, options = {}) {
    const credential = {
      name,
      value,
      description: options.description,
      tags: options.tags || [],
      lastUpdated: new Date(),
      source: 'local',
      encrypted: options.encrypted !== false
    };

    // Store locally
    this.localStore.set(name, credential);
    this.saveLocalCredential(credential);

    // Sync to remote stores
    const syncPromises = [];
    if (this.gcpClient && this.config.gcpSecrets[name]) {
      syncPromises.push(this.syncCredentialToGCP(name, credential).catch(error => {
        console.warn(`⚠️  Failed to sync ${name} to GCP:`, error.message);
      }));
    }
    if (this.githubClient) {
      syncPromises.push(this.syncCredentialToGitHub(name, credential).catch(error => {
        console.warn(`⚠️  Failed to sync ${name} to GitHub:`, error.message);
      }));
    }

    await Promise.all(syncPromises);

    console.log(`✅ Credential '${name}' set and synced`);
    this.emit('credential-updated', { name, targets: ['local', 'gcp', 'github'].filter(t => {
      if (t === 'gcp') return this.gcpClient && this.config.gcpSecrets[name];
      if (t === 'github') return this.githubClient;
      return true;
    }) });
  }

  getCredential(name) {
    return this.localStore.get(name) || null;
  }

  getAllCredentials() {
    return Array.from(this.localStore.values());
  }

  async deleteCredential(name) {
    // Remove locally
    this.localStore.delete(name);
    const filePath = this.getLocalCredentialPath(name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // TODO: Remove from remote stores when implemented

    this.emit('credential-deleted', { name });
  }

  async validateCredentials() {
    const results = {
      local: false,
      gcp: false,
      github: false,
      details: {}
    };

    // Validate local storage
    try {
      const allCredentials = this.getAllCredentials();
      results.local = allCredentials.length > 0;
      results.details.local = allCredentials.length > 0 ? `OK - ${allCredentials.length} credentials stored` : 'No credentials found';
    } catch (error) {
      results.details.local = `Error: ${error.message}`;
    }

    // Validate GCP connectivity
    if (this.gcpClient) {
      try {
        const [secrets] = await this.gcpClient.listSecrets({
          parent: `projects/${this.config.gcpProjectId}/locations/global`
        });
        results.gcp = true;
        results.details.gcp = `OK - Found ${secrets.length} secrets`;
      } catch (error) {
        results.details.gcp = `Error: ${error.message}`;
      }
    } else {
      results.details.gcp = 'GCP client not configured';
    }

    // Validate GitHub connectivity
    if (this.githubClient) {
      try {
        const { data: repo } = await this.githubClient.repos.get({
          owner: this.config.github.owner,
          repo: this.config.github.repo
        });
        results.github = true;
        results.details.github = `OK - Connected to ${repo.full_name}`;
      } catch (error) {
        results.details.github = `Error: ${error.message}`;
      }
    } else {
      results.details.github = 'GitHub client not configured';
    }

    return results;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      credentialCount: this.localStore.size,
      lastSync: null,
      config: this.config
    };
  }
}

module.exports = { CredentialManager };