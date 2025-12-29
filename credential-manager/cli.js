#!/usr/bin/env node

/**
 * InfinityXOne Credential Manager CLI (JavaScript Version)
 */

const { CredentialManager } = require('./credentialManager');
const config = require('./config');
const fs = require('fs');
const path = require('path');

let credentialManager;

async function initializeManager() {
  if (!credentialManager) {
    credentialManager = new CredentialManager(config);
    await credentialManager.initialize();
  }
  return credentialManager;
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      await handleInit();
      break;
    case 'setup':
      await handleSetup();
      break;
    case 'set':
      await handleSet();
      break;
    case 'get':
      await handleGet();
      break;
    case 'list':
      await handleList();
      break;
    case 'delete':
      await handleDelete();
      break;
    case 'validate':
      await handleValidate();
      break;
    case 'status':
      await handleStatus();
      break;
    case 'sync':
      await handleSync();
      break;
    case 'sync-from':
      await handleSyncFrom();
      break;
    case 'sync-to':
      await handleSyncTo();
      break;
    default:
      showHelp();
  }
}

async function handleInit() {
  try {
    console.log('🚀 Initializing Credential Manager...');
    const manager = await initializeManager();
    console.log('✅ Credential Manager initialized successfully');

    const status = manager.getStatus();
    console.log('\n📊 Status:');
    console.log(`  Initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`  Credentials: ${status.credentialCount}`);
    console.log(`  Local Store: ${status.config.localPath}`);
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message);
    process.exit(1);
  }
}

async function handleSetup() {
  try {
    console.log('🔧 Setting up Credential Manager...');

    // Create store directory
    const storePath = config.localPath;
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(storePath, { recursive: true });
      console.log(`✅ Created local store: ${storePath}`);
    }

    // Create .env template
    const envPath = path.join(process.cwd(), '.env.example');
    const envContent = `# InfinityXOne Credential Manager Environment Variables
# Copy this to .env and fill in your values

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here

# Google Cloud Configuration (if using service account)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Local Configuration
CREDENTIAL_STORE_PATH=${storePath}
`;

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created .env.example: ${envPath}`);

    console.log('\n📝 Next steps:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Fill in your GitHub token and other credentials');
    console.log('3. Run: node cli.js init');
    console.log('4. Run: node cli.js validate');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function handleSet() {
  try {
    const name = process.argv[3];
    if (!name) {
      console.error('❌ Credential name required');
      console.log('Usage: node cli.js set <name>');
      process.exit(1);
    }

    const manager = await initializeManager();

    let value;
    if (process.stdin.isTTY) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      value = await new Promise((resolve) => {
        rl.question(`Enter value for ${name}: `, (answer) => {
          rl.close();
          resolve(answer);
        });
      });
    } else {
      // Read from stdin
      value = fs.readFileSync(0, 'utf-8').trim();
    }

    if (!value) {
      console.error('❌ No value provided');
      process.exit(1);
    }

    await manager.setCredential(name, value);
    console.log(`✅ Credential '${name}' set successfully`);
  } catch (error) {
    console.error('❌ Failed to set credential:', error.message);
    process.exit(1);
  }
}

async function handleGet() {
  try {
    const name = process.argv[3];
    if (!name) {
      console.error('❌ Credential name required');
      console.log('Usage: node cli.js get <name>');
      process.exit(1);
    }

    const manager = await initializeManager();
    const credential = manager.getCredential(name);

    if (!credential) {
      console.error(`❌ Credential '${name}' not found`);
      process.exit(1);
    }

    console.log(`Name: ${credential.name}`);
    console.log(`Value: ${credential.value}`);
    console.log(`Description: ${credential.description || 'N/A'}`);
    console.log(`Tags: ${credential.tags?.join(', ') || 'N/A'}`);
    console.log(`Source: ${credential.source}`);
    console.log(`Last Updated: ${credential.lastUpdated.toISOString()}`);
    console.log(`Encrypted: ${credential.encrypted ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('❌ Failed to get credential:', error.message);
    process.exit(1);
  }
}

async function handleList() {
  try {
    const manager = await initializeManager();
    const credentials = manager.getAllCredentials();

    if (credentials.length === 0) {
      console.log('No credentials found');
      return;
    }

    console.log('📋 Credentials:');
    console.log('─'.repeat(80));
    console.log('Name'.padEnd(30), 'Source'.padEnd(10), 'Updated'.padEnd(20), 'Tags');
    console.log('─'.repeat(80));

    for (const cred of credentials) {
      const name = cred.name.length > 28 ? cred.name.substring(0, 25) + '...' : cred.name;
      const tags = cred.tags?.join(', ') || '';
      const updated = cred.lastUpdated.toISOString().split('T')[0];
      console.log(
        name.padEnd(30),
        cred.source.padEnd(10),
        updated.padEnd(20),
        tags
      );
    }
  } catch (error) {
    console.error('❌ Failed to list credentials:', error.message);
    process.exit(1);
  }
}

async function handleDelete() {
  try {
    const name = process.argv[3];
    if (!name) {
      console.error('❌ Credential name required');
      console.log('Usage: node cli.js delete <name>');
      process.exit(1);
    }

    const manager = await initializeManager();

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmed = await new Promise((resolve) => {
      rl.question(`Are you sure you want to delete '${name}'? (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });

    if (!confirmed) {
      console.log('Operation cancelled');
      return;
    }

    await manager.deleteCredential(name);
    console.log(`✅ Credential '${name}' deleted successfully`);
  } catch (error) {
    console.error('❌ Failed to delete credential:', error.message);
    process.exit(1);
  }
}

async function handleValidate() {
  try {
    const manager = await initializeManager();
    console.log('🔍 Validating credential manager...');

    const validation = await manager.validateCredentials();

    console.log('\n📊 Validation Results:');
    console.log(`Local Storage: ${validation.local ? '✅' : '❌'} - ${validation.details.local}`);
    console.log(`Google Cloud: ${validation.gcp ? '✅' : '❌'} - ${validation.details.gcp}`);
    console.log(`GitHub: ${validation.github ? '✅' : '❌'} - ${validation.details.github}`);

    const allValid = validation.local && validation.gcp && validation.github;
    if (!allValid) {
      console.log('\n⚠️  Some validations failed. Check configuration.');
      process.exit(1);
    } else {
      console.log('\n✅ All validations passed!');
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

async function handleStatus() {
  try {
    const manager = await initializeManager();
    const status = manager.getStatus();

    console.log('📊 Credential Manager Status:');
    console.log(`  Initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`  Credentials: ${status.credentialCount}`);
    console.log(`  Local Store: ${status.config.localPath}`);
    console.log(`  GCP Project: ${status.config.gcpProjectId}`);
    console.log(`  GitHub Repo: ${status.config.github.owner}/${status.config.github.repo}`);
    console.log(`  GCP Client: ${manager.gcpClient ? '✅' : '❌'}`);
    console.log(`  GitHub Client: ${manager.githubClient ? '✅' : '❌'}`);
  } catch (error) {
    console.error('❌ Failed to get status:', error.message);
    process.exit(1);
  }
}

async function handleSync() {
  try {
    const manager = await initializeManager();
    console.log('🔄 Starting bidirectional sync...');

    await manager.syncAll();

    console.log('✅ Sync completed successfully');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

async function handleSyncFrom() {
  try {
    const target = process.argv[3];
    if (!target) {
      console.error('❌ Target required (gcp, github, or all)');
      console.log('Usage: node cli.js sync-from <target>');
      process.exit(1);
    }

    const manager = await initializeManager();
    console.log(`🔄 Syncing from ${target}...`);

    if (target === 'gcp' || target === 'all') {
      await manager.syncFromGCP();
    }
    if (target === 'github' || target === 'all') {
      await manager.syncFromGitHub();
    }

    console.log('✅ Sync from completed successfully');
  } catch (error) {
    console.error('❌ Sync from failed:', error.message);
    process.exit(1);
  }
}

async function handleSyncTo() {
  try {
    const target = process.argv[3];
    if (!target) {
      console.error('❌ Target required (gcp, github, or all)');
      console.log('Usage: node cli.js sync-to <target>');
      process.exit(1);
    }

    const manager = await initializeManager();
    console.log(`🔄 Syncing to ${target}...`);

    if (target === 'gcp' || target === 'all') {
      await manager.syncToGCP();
    }
    if (target === 'github' || target === 'all') {
      await manager.syncToGitHub();
    }

    console.log('✅ Sync to completed successfully');
  } catch (error) {
    console.error('❌ Sync to failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log('InfinityXOne Credential Manager CLI');
  console.log('');
  console.log('Usage: node cli.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  init       Initialize the credential manager');
  console.log('  setup      Setup initial configuration');
  console.log('  set <name> Set a credential value');
  console.log('  get <name> Get a credential value');
  console.log('  list       List all credentials');
  console.log('  delete <name> Delete a credential');
  console.log('  validate   Validate configuration and access');
  console.log('  status     Show credential manager status');
  console.log('  sync       Bidirectional sync with all targets');
  console.log('  sync-from <target> Sync from target (gcp, github, all)');
  console.log('  sync-to <target>   Sync to target (gcp, github, all)');
  console.log('');
  console.log('Examples:');
  console.log('  node cli.js init');
  console.log('  node cli.js set my-credential');
  console.log('  echo "secret" | node cli.js set my-credential');
  console.log('  node cli.js get my-credential');
  console.log('  node cli.js list');
  console.log('  node cli.js validate');
  console.log('  node cli.js sync');
  console.log('  node cli.js sync-from gcp');
  console.log('  node cli.js sync-to github');
}

// Run the CLI
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});