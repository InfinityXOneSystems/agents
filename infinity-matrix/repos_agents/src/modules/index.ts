/**
 * Module Loader
 * Loads and registers all agent modules
 */

import { moduleRegistry } from './core/registry.js';
import CredentialManager from './credential-management/index.js';
import SyncIntegrationManager from './sync-integration/index.js';
import MonitoringMaintenanceManager from './monitoring-maintenance/index.js';
import TestingValidationManager from './testing-validation/index.js';
import OrchestrationManager from './orchestration/index.js';
import AIIntegrationManager from './ai-llm-integration/index.js';

export function loadAllModules(): void {
  console.log('📦 Loading all agent modules...');

  // Register core modules
  moduleRegistry.register(new CredentialManager());
  moduleRegistry.register(new SyncIntegrationManager());
  moduleRegistry.register(new MonitoringMaintenanceManager());
  moduleRegistry.register(new TestingValidationManager());
  moduleRegistry.register(new OrchestrationManager());
  moduleRegistry.register(new AIIntegrationManager());

  console.log('✅ All modules loaded and registered');
}

export function getModuleRegistry() {
  return moduleRegistry;
}

// Export individual modules for direct use
export { default as CredentialManager } from './credential-management/index.js';
export { default as SyncIntegrationManager } from './sync-integration/index.js';
export { default as MonitoringMaintenanceManager } from './monitoring-maintenance/index.js';
export { default as TestingValidationManager } from './testing-validation/index.js';
export { default as OrchestrationManager } from './orchestration/index.js';
export { default as AIIntegrationManager } from './ai-llm-integration/index.js';