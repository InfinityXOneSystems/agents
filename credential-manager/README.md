# InfinityXOne Credential Manager

A centralized credential management system with bidirectional synchronization between local encrypted storage, Google Cloud Secret Manager, and GitHub Secrets.

## Features

- **Local Encrypted Storage**: AES-256 encrypted credential storage on local filesystem
- **Google Cloud Secret Manager Integration**: Bidirectional sync with GCP Secret Manager
- **GitHub Secrets Integration**: Bidirectional sync with GitHub repository secrets
- **Command Line Interface**: Full CLI for credential management
- **Infinity Gateway Integration**: Seamless integration with Infinity Gateway
- **Event-Driven Architecture**: Real-time sync notifications and status updates

## Quick Start

```bash
cd C:\AI\credential-manager

# Setup the credential manager
node cli.js setup

# Initialize
node cli.js init

# Set a credential
echo "secret-value" | node cli.js set infinityxone-credentials

# Get a credential
node cli.js get infinityxone-credentials

# List all credentials
node cli.js list

# Validate setup
node cli.js validate
```

## Configuration

1. Copy `.env.example` to `.env` and configure:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=InfinityXOneSystems
GITHUB_REPO=infinityxone-credentials

# Google Cloud Configuration (optional)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
GCP_PROJECT_ID=896380409704

# Local Configuration
CREDENTIAL_STORE_PATH=C:/AI/credential-manager/.credentials
```

## Supported Credentials

- `infinityxone-credentials`: Main InfinityXOne credentials
- `workspace-sa-json`: Google Workspace service account JSON
- `firebase-config`: Firebase configuration
- `github-app-config`: GitHub App configuration
- `InfinityXOneSystems-github-oauthtoken-c52d6b`: GitHub OAuth token

## Commands

### Basic Commands

- `node cli.js setup` - Initial setup and configuration
- `node cli.js init` - Initialize the credential manager
- `node cli.js set <name>` - Set a credential value
- `node cli.js get <name>` - Get a credential value
- `node cli.js list` - List all credentials
- `node cli.js delete <name>` - Delete a credential
- `node cli.js validate` - Validate configuration
- `node cli.js status` - Show status

### Sync Commands

- `node cli.js sync` - Bidirectional sync with all targets
- `node cli.js sync-from <target>` - Sync from target (gcp, github, all)
- `node cli.js sync-to <target>` - Sync to target (gcp, github, all)

## Integration with Infinity Gateway

```javascript
const { CredentialManager } = require('./credential-manager/credentialManager');
const config = require('./credential-manager/config');

const manager = new CredentialManager(config);
await manager.initialize();

// Get credentials
const apiKey = manager.getCredential('infinityxone-credentials');
const githubToken = manager.getCredential('InfinityXOneSystems-github-oauthtoken-c52d6b');

// Listen for sync events
manager.on('credential-updated', (event) => {
  console.log(`Credential ${event.name} updated on targets: ${event.targets.join(', ')}`);
});
```

## Security

- AES-256 encryption for local storage
- Credentials stored outside repository structure
- System-derived encryption keys
- Access validation and audit trails
- Graceful handling of remote service failures

## Architecture

### Local Storage
- Encrypted `.cred` files with AES-256
- Automatic directory management
- System-specific encryption keys

### Remote Synchronization
- **GCP Secret Manager**: Full bidirectional sync
- **GitHub Secrets**: Push sync with encryption
- Graceful degradation when services unavailable

## Troubleshooting

### Common Issues

1. **GCP Sync Fails**: Check `GOOGLE_APPLICATION_CREDENTIALS` path
2. **GitHub Sync Fails**: Verify `GITHUB_TOKEN` has repo access
3. **Permission Errors**: Check write access to credential directory

### Validation Output

```bash
node cli.js validate
```

Shows status for local storage, GCP, and GitHub connectivity.

## Quick GCP ADC Setup

If you have an owner-level service account `infinity-x-one-systems@appspot.gserviceaccount.com` (used by platform), you can configure Application Default Credentials (ADC) in two ways:

- Use an existing service-account JSON key file:

```powershell
# From repository root
cd C:\AI\credential-manager\scripts
.\setup_gcp_adc.ps1 -KeyPath 'C:\path\to\workspace-sa.json'
```

- Or configure ADC by impersonating the owner SA (requires gcloud and impersonation rights):

```powershell
.\setup_gcp_adc.ps1 -Impersonate 'infinity-x-one-systems@appspot.gserviceaccount.com'
```

After either step, run `node cli.js validate` to confirm connectivity.