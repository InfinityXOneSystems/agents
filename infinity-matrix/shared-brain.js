// Shared Brain System
// This module implements shared memory and a pub/sub mechanism for inter-agent communication.

const EventEmitter = require('events');

class SharedBrain extends EventEmitter {
  constructor() {
    super();
    this.memory = {};
  }

  // Store data in shared memory
  set(key, value) {
    this.memory[key] = value;
    this.emit('memoryUpdated', { key, value });
  }

  // Retrieve data from shared memory
  get(key) {
    return this.memory[key];
  }

  // Subscribe to events
  subscribe(event, listener) {
    this.on(event, listener);
  }

  // Publish events
  publish(event, data) {
    this.emit(event, data);
  }
}

// Singleton instance
const sharedBrain = new SharedBrain();

// Import agents
const {
  codeOpsAgent,
  discoveryOpsAgent,
  analysisOpsAgent,
  diagnosisOpsAgent,
  docSyncAgent,
  resourcesAgent,
  billingAgent,
  budgetingAgent,
  financialMonitorAgent,
  sniperAgent,
  quantumMindAgent,
} = require('./agents/agents');

// Import strategic agents
const {
  strategistAgent,
  pickyBotAgent,
  socialAgent,
  brandingAgent,
  marketingAgent,
  salesAgent,
  rewardAgent,
} = require('./agents/strategic-agents');

// Import archetype agents and introduction agent builder
const archetypeAgents = require('./agents/archetype-agents');
const introductionAgentBuilder = require('./agents/introduction-agent-builder');

// Import additional agents
const {
  securityAgent,
  vaultAgent,
  memoryAgent,
  apiAgent,
  walletAgent,
} = require('./agents/additional-agents');

// Import dashboard module
const { renderDashboard } = require('./dashboard/dashboard');

// Example: Subscribing agents to shared brain events
sharedBrain.subscribe('memoryUpdated', (data) => {
  console.log('Shared brain memory updated:', data);

  // Notify specific agents based on the memory key
  if (data.key.includes('code')) {
    codeOpsAgent.performTask(data);
  } else if (data.key.includes('discovery')) {
    discoveryOpsAgent.performTask(data);
  }
  // Add more conditions for other agents as needed
});

// Example: Subscribing strategic agents to shared brain events
sharedBrain.subscribe('memoryUpdated', (data) => {
  console.log('Shared brain memory updated:', data);

  // Notify specific strategic agents based on the memory key
  if (data.key.includes('strategy')) {
    strategistAgent.performTask(data);
  } else if (data.key.includes('picky')) {
    pickyBotAgent.performTask(data);
  } else if (data.key.includes('social')) {
    socialAgent.performTask(data);
  } else if (data.key.includes('branding')) {
    brandingAgent.performTask(data);
  } else if (data.key.includes('marketing')) {
    marketingAgent.performTask(data);
  } else if (data.key.includes('sales')) {
    salesAgent.performTask(data);
  } else if (data.key.includes('reward')) {
    rewardAgent.performTask(data);
  }
});

// Example: Subscribing archetype agents to shared brain events
Object.values(archetypeAgents).forEach((agent) => {
  sharedBrain.subscribe('memoryUpdated', (data) => {
    if (data.key.includes(agent.industry.toLowerCase())) {
      agent.performTask(data);
    }
  });
});

// Example: Using the introduction agent builder
sharedBrain.subscribe('createCustomAgent', (data) => {
  const { name, personality, skills, industry } = data;
  try {
    const customAgent = introductionAgentBuilder.createCustomAgent(name, personality, skills, industry);
    console.log(`Custom agent created: ${customAgent.name}`);
  } catch (error) {
    console.error(error.message);
  }
});

// Reward Agent: Example of evaluating and rewarding agents
rewardAgent.evaluatePerformance = (agentName, performance) => {
  const stars = Math.min(5, Math.max(1, Math.round(performance / 20)));
  console.log(`${agentName} received ${stars} stars!`);
  sharedBrain.set(`${agentName}_rank`, stars);
};

// Example: Subscribing additional agents to shared brain events
sharedBrain.subscribe('memoryUpdated', (data) => {
  if (data.key.includes('security')) {
    securityAgent.performTask(data);
  } else if (data.key.includes('vault')) {
    vaultAgent.performTask(data);
  } else if (data.key.includes('memory')) {
    memoryAgent.performTask(data);
  } else if (data.key.includes('api')) {
    apiAgent.performTask(data);
  } else if (data.key.includes('wallet')) {
    walletAgent.performTask(data);
  }
});

// Example: Subscribing to dashboard updates
sharedBrain.subscribe('updateDashboard', (data) => {
  const { userId, userPicks, paperTradingAccount, predictions } = data;
  renderDashboard(userId, userPicks, paperTradingAccount, predictions);
});

// Multiply Manus agents into the newly named agents
const manusAgentNames = [
  'ValidationAgent',
  'PredictorAgent',
  'VisionAgent',
  'IngestorRetrieverAgent',
  'GatewayAgent',
  'VaultAgent',
  'StrategistAgent',
  'PickyBotAgent',
  'SocialAgent',
  'BrandingAgent',
  'MarketingAgent',
  'SalesAgent',
  'RewardAgent',
  'SecurityAgent',
  'MemoryAgent',
  'APIAgent',
  'WalletAgent',
];

agentFactory.multiplyAgents('ManusAgent', manusAgentNames);

// Enable parallel execution for all multiplied agents
manusAgentNames.forEach((agentName) => {
  const agent = agentFactory.createAgent(agentName);
  sharedBrain.subscribe('parallelTasks', (tasks) => {
    agent.performTaskInParallel(tasks);
  });
});

module.exports = sharedBrain;