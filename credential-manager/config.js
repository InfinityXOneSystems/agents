/**
 * InfinityXOne Credential Manager Configuration
 * Defines sync targets and authentication details
 */

// Load environment variables
require('dotenv').config();

const config = {
  gcpProjectId: process.env.GCP_PROJECT_ID || '896380409704',
  gcpSecrets: {
    'infinityxone-credentials': 'infinityxone-credentials',
    'workspace-sa-json': 'workspace-sa-json',
    'firebase-config': 'firebase-config',
    'github-app-config': 'github-app-config',
    'InfinityXOneSystems-github-oauthtoken-c52d6b': 'InfinityXOneSystems-github-oauthtoken-c52d6b'
  },
  github: {
    owner: process.env.GITHUB_OWNER || 'InfinityXOneSystems',
    repo: process.env.GITHUB_REPO || 'infinityxone-credentials',
    token: process.env.GITHUB_TOKEN || ''
  },
  localPath: process.env.CREDENTIAL_STORE_PATH || 'C:\\AI\\credential-manager\\store'
};

module.exports = config;