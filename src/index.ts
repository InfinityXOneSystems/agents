#!/usr/bin/env node

/**
 * AI Agent Ecosystem - Main Entry Point
 * Starts the complete modular agent system with orchestration capabilities
 */

import { loadAllModules, getModuleRegistry } from './modules/index.js';

async function main() {
  console.log('🤖 AI Agent Ecosystem Starting...');

  try {
    // Load and register all modules
    loadAllModules();

    // Get the module registry
    const registry = getModuleRegistry();

    // Start all modules
    await registry.startAll();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      await registry.stopAll();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down gracefully...');
      await registry.stopAll();
      process.exit(0);
    });

    console.log('✅ AI Agent Ecosystem running successfully');
    console.log('🔄 All modules active and operational');

  } catch (error) {
    console.error('❌ Failed to start system:', error);
    process.exit(1);
  }
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { loadAllModules, getModuleRegistry };