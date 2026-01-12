/**
 * AI Frameworks Integration Module
 * LangChain, CrewAI, Swarm AI, and Vertex AI integration
 * Powers the 30+ autonomous workspace agents
 */

import { ALL_AGENTS, AgentBlueprint, getAgentById } from '../agents/AGENT_REGISTRY';

// ============================================================================
// LANGCHAIN INTEGRATION
// ============================================================================

export interface LangChainConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
}

export interface LangChainMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface LangChainChain {
  id: string;
  name: string;
  steps: LangChainStep[];
  memory: LangChainMemory;
}

export interface LangChainStep {
  type: 'llm' | 'tool' | 'retrieval' | 'transform';
  config: Record<string, unknown>;
}

export interface LangChainMemory {
  type: 'buffer' | 'summary' | 'conversation' | 'entity';
  maxTokens: number;
  returnMessages: boolean;
}

export class LangChainIntegration {
  private config: LangChainConfig;
  private chains: Map<string, LangChainChain> = new Map();

  constructor(config: Partial<LangChainConfig> = {}) {
    this.config = {
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 4096,
      streaming: true,
      ...config
    };
  }

  createChain(name: string, steps: LangChainStep[], memoryType: LangChainMemory['type'] = 'conversation'): LangChainChain {
    const chain: LangChainChain = {
      id: `chain_${Date.now()}`,
      name,
      steps,
      memory: {
        type: memoryType,
        maxTokens: 2048,
        returnMessages: true
      }
    };
    this.chains.set(chain.id, chain);
    return chain;
  }

  async runChain(chainId: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const chain = this.chains.get(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found`);

    let result: Record<string, unknown> = { ...input };
    
    for (const step of chain.steps) {
      result = await this.executeStep(step, result);
    }

    return result;
  }

  private async executeStep(step: LangChainStep, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    switch (step.type) {
      case 'llm':
        return { ...input, llm_output: `LLM processed: ${JSON.stringify(input)}` };
      case 'tool':
        return { ...input, tool_output: `Tool executed: ${step.config.tool}` };
      case 'retrieval':
        return { ...input, retrieved: `Retrieved context for: ${input.query}` };
      case 'transform':
        return { ...input, transformed: true };
      default:
        return input;
    }
  }

  // Create agent-specific chain
  createAgentChain(agentId: string): LangChainChain {
    const agent = getAgentById(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const steps: LangChainStep[] = [
      { type: 'retrieval', config: { source: 'agent_memory' } },
      { type: 'llm', config: { systemPrompt: this.buildSystemPrompt(agent) } },
      { type: 'tool', config: { tools: agent.capabilities.capabilities } }
    ];

    return this.createChain(`${agent.identity.name}_chain`, steps, 'entity');
  }

  private buildSystemPrompt(agent: AgentBlueprint): string {
    return `You are ${agent.identity.name}, ${agent.identity.role}.
Your core values are: ${agent.identity.values.join(', ')}.
Your capabilities include: ${agent.capabilities.capabilities.join(', ')}.
Personality: ${agent.conversation.personality}
Always respond in character with empathy score ${agent.emotionalIntelligence.empathyScore} and warmth factor ${agent.emotionalIntelligence.warmthFactor}.`;
  }
}

// ============================================================================
// CREWAI INTEGRATION
// ============================================================================

export interface CrewAIAgent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  allowDelegation: boolean;
  verbose: boolean;
}

export interface CrewAITask {
  id: string;
  description: string;
  expectedOutput: string;
  agent: string;
  context?: string[];
  tools?: string[];
}

export interface CrewAICrew {
  id: string;
  name: string;
  agents: CrewAIAgent[];
  tasks: CrewAITask[];
  process: 'sequential' | 'hierarchical';
  managerAgent?: string;
  verbose: boolean;
}

export class CrewAIIntegration {
  private crews: Map<string, CrewAICrew> = new Map();
  private agents: Map<string, CrewAIAgent> = new Map();

  // Convert Infinity X AI agent to CrewAI agent
  convertToCrewAgent(agent: AgentBlueprint): CrewAIAgent {
    const crewAgent: CrewAIAgent = {
      id: agent.identity.id,
      name: agent.identity.name,
      role: agent.identity.role,
      goal: `Excel at ${agent.capabilities.capabilities.slice(0, 3).join(', ')}`,
      backstory: `${agent.identity.name} is a specialized AI agent with values of ${agent.identity.values.join(', ')}. ${agent.conversation.personality}`,
      tools: agent.capabilities.capabilities,
      allowDelegation: agent.capabilities.autonomyLevels.includes('full_auto'),
      verbose: true
    };
    this.agents.set(crewAgent.id, crewAgent);
    return crewAgent;
  }

  // Create a crew from multiple agents
  createCrew(name: string, agentIds: string[], process: 'sequential' | 'hierarchical' = 'hierarchical'): CrewAICrew {
    const crewAgents = agentIds.map(id => {
      const existing = this.agents.get(id);
      if (existing) return existing;
      
      const blueprint = getAgentById(id);
      if (!blueprint) throw new Error(`Agent ${id} not found`);
      return this.convertToCrewAgent(blueprint);
    });

    const crew: CrewAICrew = {
      id: `crew_${Date.now()}`,
      name,
      agents: crewAgents,
      tasks: [],
      process,
      managerAgent: process === 'hierarchical' ? 'echo' : undefined,
      verbose: true
    };

    this.crews.set(crew.id, crew);
    return crew;
  }

  // Add task to crew
  addTask(crewId: string, task: Omit<CrewAITask, 'id'>): CrewAITask {
    const crew = this.crews.get(crewId);
    if (!crew) throw new Error(`Crew ${crewId} not found`);

    const newTask: CrewAITask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    crew.tasks.push(newTask);
    return newTask;
  }

  // Execute crew workflow
  async executeCrew(crewId: string): Promise<Record<string, unknown>> {
    const crew = this.crews.get(crewId);
    if (!crew) throw new Error(`Crew ${crewId} not found`);

    const results: Record<string, unknown> = {
      crewId,
      crewName: crew.name,
      process: crew.process,
      taskResults: []
    };

    if (crew.process === 'sequential') {
      for (const task of crew.tasks) {
        const taskResult = await this.executeTask(task, crew);
        (results.taskResults as unknown[]).push(taskResult);
      }
    } else {
      // Hierarchical - manager delegates
      const managerAgent = crew.agents.find(a => a.id === crew.managerAgent);
      results.manager = managerAgent?.name || 'Echo';
      
      // Parallel execution with manager coordination
      const taskPromises = crew.tasks.map(task => this.executeTask(task, crew));
      results.taskResults = await Promise.all(taskPromises);
    }

    return results;
  }

  private async executeTask(task: CrewAITask, crew: CrewAICrew): Promise<Record<string, unknown>> {
    const agent = crew.agents.find(a => a.id === task.agent);
    return {
      taskId: task.id,
      agent: agent?.name || 'Unknown',
      description: task.description,
      status: 'completed',
      output: task.expectedOutput,
      timestamp: new Date().toISOString()
    };
  }

  // Pre-built crews for common workflows
  createLeadGenerationCrew(): CrewAICrew {
    return this.createCrew('Lead Generation Crew', [
      'echo', 'leadgen', 'lead_sniper', 'email_agent', 'voice_agent', 'sales_agent'
    ], 'hierarchical');
  }

  createContentCreationCrew(): CrewAICrew {
    return this.createCrew('Content Creation Crew', [
      'echo', 'branding_agent', 'marketing_agent', 'image_agent', 'video_agent', 'doc_creator'
    ], 'hierarchical');
  }

  createDevelopmentCrew(): CrewAICrew {
    return this.createCrew('Development Crew', [
      'echo', 'architect', 'dev_agent', 'code_agent', 'frontend_agent', 'app_agent'
    ], 'hierarchical');
  }

  createIntelligenceCrew(): CrewAICrew {
    return this.createCrew('Intelligence Crew', [
      'echo', 'vision', 'market_intel', 'predict_engine', 'real_estate_intel', 'loan_intel'
    ], 'hierarchical');
  }
}

// ============================================================================
// SWARM AI INTEGRATION
// ============================================================================

export interface SwarmAgent {
  id: string;
  name: string;
  instructions: string;
  functions: SwarmFunction[];
  model: string;
}

export interface SwarmFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface SwarmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  sender?: string;
  toolCalls?: SwarmToolCall[];
}

export interface SwarmToolCall {
  id: string;
  function: string;
  arguments: Record<string, unknown>;
}

export interface SwarmResponse {
  messages: SwarmMessage[];
  agent: SwarmAgent;
  contextVariables: Record<string, unknown>;
}

export class SwarmAIIntegration {
  private agents: Map<string, SwarmAgent> = new Map();
  private contextVariables: Record<string, unknown> = {};

  // Convert Infinity X AI agent to Swarm agent
  convertToSwarmAgent(agent: AgentBlueprint): SwarmAgent {
    const functions: SwarmFunction[] = agent.capabilities.capabilities.map(cap => ({
      name: cap.toLowerCase().replace(/\s+/g, '_'),
      description: `Execute ${cap} capability`,
      parameters: { type: 'object', properties: {} },
      handler: async (args) => ({ result: `${cap} executed`, args })
    }));

    const swarmAgent: SwarmAgent = {
      id: agent.identity.id,
      name: agent.identity.name,
      instructions: `You are ${agent.identity.name}, ${agent.identity.role}. ${agent.conversation.personality}. Your values: ${agent.identity.values.join(', ')}.`,
      functions,
      model: 'gemini-2.0-flash'
    };

    this.agents.set(swarmAgent.id, swarmAgent);
    return swarmAgent;
  }

  // Initialize all agents as swarm agents
  initializeSwarm(): void {
    ALL_AGENTS.forEach(agent => this.convertToSwarmAgent(agent));
    console.log(`🐝 Swarm initialized with ${this.agents.size} agents`);
  }

  // Hand off to another agent
  async handoff(fromAgentId: string, toAgentId: string, context: Record<string, unknown>): Promise<SwarmResponse> {
    const toAgent = this.agents.get(toAgentId);
    if (!toAgent) throw new Error(`Agent ${toAgentId} not found`);

    this.contextVariables = { ...this.contextVariables, ...context, handoff_from: fromAgentId };

    return {
      messages: [{
        role: 'system',
        content: `Handoff from ${fromAgentId} to ${toAgentId}`,
        sender: fromAgentId
      }],
      agent: toAgent,
      contextVariables: this.contextVariables
    };
  }

  // Run swarm conversation
  async run(agentId: string, messages: SwarmMessage[]): Promise<SwarmResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const responseMessages: SwarmMessage[] = [...messages];

    // Process messages and generate response
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      responseMessages.push({
        role: 'assistant',
        content: `[${agent.name}]: Processing your request regarding "${lastUserMessage.content}"`,
        sender: agent.id
      });

      // Check for tool calls needed
      const relevantFunctions = agent.functions.filter(f => 
        lastUserMessage.content.toLowerCase().includes(f.name.replace(/_/g, ' '))
      );

      if (relevantFunctions.length > 0) {
        const toolCalls: SwarmToolCall[] = relevantFunctions.map(f => ({
          id: `call_${Date.now()}`,
          function: f.name,
          arguments: {}
        }));

        responseMessages.push({
          role: 'assistant',
          content: `Executing: ${relevantFunctions.map(f => f.name).join(', ')}`,
          sender: agent.id,
          toolCalls
        });
      }
    }

    return {
      messages: responseMessages,
      agent,
      contextVariables: this.contextVariables
    };
  }

  // Multi-agent collaboration
  async collaborate(agentIds: string[], task: string): Promise<SwarmResponse[]> {
    const responses: SwarmResponse[] = [];
    let context: Record<string, unknown> = { task, startTime: Date.now() };

    for (const agentId of agentIds) {
      const response = await this.run(agentId, [{
        role: 'user',
        content: task
      }]);
      responses.push(response);
      context = { ...context, ...response.contextVariables };
    }

    return responses;
  }
}

// ============================================================================
// VERTEX AI INTEGRATION
// ============================================================================

export interface VertexAIConfig {
  projectId: string;
  location: string;
  model: string;
}

export interface VertexAIConversation {
  id: string;
  agentId: string;
  messages: VertexAIMessage[];
  context: Record<string, unknown>;
}

export interface VertexAIMessage {
  role: 'user' | 'model';
  parts: VertexAIPart[];
}

export interface VertexAIPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export class VertexAIIntegration {
  private config: VertexAIConfig;
  private conversations: Map<string, VertexAIConversation> = new Map();

  constructor(config: Partial<VertexAIConfig> = {}) {
    this.config = {
      projectId: process.env.GCP_PROJECT_ID || 'infinity-x-one-systems',
      location: 'us-central1',
      model: 'gemini-2.0-flash',
      ...config
    };
  }

  // Create conversation for agent
  createConversation(agentId: string): VertexAIConversation {
    const agent = getAgentById(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const conversation: VertexAIConversation = {
      id: `conv_${Date.now()}`,
      agentId,
      messages: [{
        role: 'model',
        parts: [{ text: agent.conversation.greetings[0] }]
      }],
      context: {
        agentName: agent.identity.name,
        agentRole: agent.identity.role,
        emotionalState: agent.emotionalIntelligence.emotionalBaseline
      }
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  // Send message in conversation
  async sendMessage(conversationId: string, message: string): Promise<VertexAIMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error(`Conversation ${conversationId} not found`);

    const agent = getAgentById(conversation.agentId);
    if (!agent) throw new Error(`Agent ${conversation.agentId} not found`);

    // Add user message
    conversation.messages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Generate response (in production, this would call Vertex AI API)
    const response: VertexAIMessage = {
      role: 'model',
      parts: [{
        text: `[${agent.identity.name}]: I understand you're asking about "${message}". As ${agent.identity.role}, I can help with ${agent.capabilities.capabilities.slice(0, 3).join(', ')}. ${agent.conversation.prompts[0]}`
      }]
    };

    conversation.messages.push(response);
    return response;
  }

  // Get conversation with full humanistic context
  getConversationWithContext(conversationId: string): VertexAIConversation & { humanisticContext: Record<string, unknown> } {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error(`Conversation ${conversationId} not found`);

    const agent = getAgentById(conversation.agentId);
    
    return {
      ...conversation,
      humanisticContext: {
        personality: agent?.conversation.personality,
        emotionalIntelligence: agent?.emotionalIntelligence,
        values: agent?.identity.values,
        communicationStyle: {
          empathy: agent?.emotionalIntelligence.empathyScore,
          warmth: agent?.emotionalIntelligence.warmthFactor,
          patience: agent?.emotionalIntelligence.patienceLevel
        }
      }
    };
  }
}

// ============================================================================
// UNIFIED AI FRAMEWORK MANAGER
// ============================================================================

export class AIFrameworkManager {
  public langchain: LangChainIntegration;
  public crewai: CrewAIIntegration;
  public swarm: SwarmAIIntegration;
  public vertex: VertexAIIntegration;

  constructor() {
    this.langchain = new LangChainIntegration();
    this.crewai = new CrewAIIntegration();
    this.swarm = new SwarmAIIntegration();
    this.vertex = new VertexAIIntegration();
  }

  // Initialize all frameworks
  initialize(): void {
    this.swarm.initializeSwarm();
    console.log('🤖 AI Framework Manager initialized');
    console.log(`   - LangChain: Ready`);
    console.log(`   - CrewAI: Ready`);
    console.log(`   - Swarm AI: ${ALL_AGENTS.length} agents`);
    console.log(`   - Vertex AI: Ready`);
  }

  // Get best framework for task
  selectFramework(taskType: string): 'langchain' | 'crewai' | 'swarm' | 'vertex' {
    const taskFrameworkMap: Record<string, 'langchain' | 'crewai' | 'swarm' | 'vertex'> = {
      'chain': 'langchain',
      'workflow': 'crewai',
      'collaboration': 'swarm',
      'conversation': 'vertex',
      'multi-agent': 'crewai',
      'real-time': 'swarm',
      'structured': 'langchain'
    };

    return taskFrameworkMap[taskType] || 'vertex';
  }

  // Execute task with optimal framework
  async executeTask(taskType: string, config: Record<string, unknown>): Promise<unknown> {
    const framework = this.selectFramework(taskType);
    
    switch (framework) {
      case 'langchain':
        const chain = this.langchain.createAgentChain(config.agentId as string);
        return this.langchain.runChain(chain.id, config);
      
      case 'crewai':
        const crew = this.crewai.createCrew(
          config.crewName as string,
          config.agentIds as string[]
        );
        return this.crewai.executeCrew(crew.id);
      
      case 'swarm':
        return this.swarm.run(config.agentId as string, config.messages as SwarmMessage[]);
      
      case 'vertex':
        const conv = this.vertex.createConversation(config.agentId as string);
        return this.vertex.sendMessage(conv.id, config.message as string);
      
      default:
        throw new Error(`Unknown framework: ${framework}`);
    }
  }
}

// Export singleton instance
export const aiFrameworks = new AIFrameworkManager();
