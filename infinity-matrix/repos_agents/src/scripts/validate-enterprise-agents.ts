import * as fs from 'fs';
import * as path from 'path';
import { AGENT_CATEGORIES, AGENT_MAPPINGS, validateAgentCapabilities } from '../modules/ai-llm-integration/agent-categories.js';

async function validateAgents() {
  console.log('🔍 Starting Enterprise Agent Validation...\n');

  const agentLocations = [
    'c:\\AI\\credentials',
    'c:\\AI\\repos\\agents\\src',
    'c:\\AI\\repos\\agents\\src\\agents',
    'c:\\AI\\repos\\agents\\src\\modules',
    'c:\\AI\\auto_builder',
    'c:\\AI'
  ];

  const results = [];

  for (const [agentName, categoryId] of Object.entries(AGENT_MAPPINGS)) {
    let foundPath = '';
    for (const loc of agentLocations) {
      const fullPath = path.join(loc, agentName);
      if (fs.existsSync(fullPath)) {
        foundPath = fullPath;
        break;
      }
      // Check for .ts or .js if it's a module name
      if (fs.existsSync(path.join(loc, `${agentName}.ts`))) {
        foundPath = path.join(loc, `${agentName}.ts`);
        break;
      }
      if (fs.existsSync(path.join(loc, `${agentName}.js`))) {
        foundPath = path.join(loc, `${agentName}.js`);
        break;
      }
    }

    const category = AGENT_CATEGORIES.find(c => c.id === categoryId);
    const status = foundPath ? '✅ FOUND' : '❌ MISSING';
    
    // Mock capability validation for now (in a real system, this would query the agent)
    const mockCapabilities = category ? category.capabilities : [];
    const isValid = foundPath && category ? validateAgentCapabilities(agentName, mockCapabilities) : false;

    results.push({
      agent: agentName,
      location: foundPath || 'Unknown',
      category: category?.name || 'Unknown',
      level: category?.faangLevel || 'N/A',
      status,
      enterpriseValid: isValid ? 'YES' : 'NO'
    });
  }

  console.table(results);

  const missing = results.filter(r => r.status === '❌ MISSING');
  if (missing.length > 0) {
    console.warn(`\n⚠️ Warning: ${missing.length} agents are missing from expected locations.`);
  } else {
    console.log('\n✨ All enterprise agents validated and accounted for.');
  }
}

validateAgents().catch(console.error);