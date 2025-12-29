/**
 * AI/LLM Integration Module
 * Provides unified LLM capabilities with hierarchical provider selection
 * Primary: GitHub VS Code Copilot, OpenAI GPT-4.0/4.1, GPT-5.0 Mini, Grok Code Fast 1
 * Secondary: Groq
 * Tertiary: Local Ollama open source
 * All free open source LLMs are primary for LLM/ML capabilities
 */

import { BaseModule, ModuleConfig } from '../core/index.js';
import { AIService } from './services/aiService.js';
import { PubSubService } from './services/pubSubService.js';
import { VSCodeIntegration } from './services/vsCodeIntegration.js';
import { AgentCommunicationService } from './services/agentCommunicationService.js';
import { AGENT_CATEGORIES, JOB_CLASSIFICATIONS, getAgentCategory, validateAgentCapabilities } from './agent-categories.js';

export interface LLMConfig {
  // Primary providers (free open source prioritized)
  githubCopilotToken?: string;
  openaiApiKey?: string;
  grokApiKey?: string;

  // Secondary providers
  groqApiKey?: string;

  // Tertiary providers (local)
  ollamaEndpoint?: string;
  ollamaModel?: string;

  // Enterprise features
  enableCaching: boolean;
  enableTracing: boolean;
  enableMetrics: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;

  // VS Code integration
  vscodeWorkspacePath?: string;

  // PubSub configuration
  redisUrl?: string;
  enableInterAgentCommunication: boolean;
}

export interface LLMRequest {
  prompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  context?: any;
  agentId?: string;
  taskId?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency?: number;
  cached?: boolean;
  agentId?: string;
  taskId?: string;
}

export class AIIntegrationManager extends BaseModule {
  private aiService!: AIService;
  private pubSubService!: PubSubService;
  private vsCodeIntegration!: VSCodeIntegration;
  private agentCommunication!: AgentCommunicationService;

  constructor(config: Partial<LLMConfig> = {}) {
    super('ai-llm-integration', '2.0.0', {
      enabled: true,
      name: 'ai-llm-integration',
      version: '2.0.0',
      enableCaching: true,
      enableTracing: true,
      enableMetrics: true,
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      enableInterAgentCommunication: true,
      ...config
    });
  }

  async init(config?: Partial<LLMConfig>): Promise<void> {
    await super.init(config);

    // Get the merged config
    const llmConfig = this.config as LLMConfig & ModuleConfig;

    // Initialize services
    this.aiService = new AIService(llmConfig);
    this.pubSubService = new PubSubService(llmConfig.redisUrl);
    this.vsCodeIntegration = new VSCodeIntegration(llmConfig.vscodeWorkspacePath);
    this.agentCommunication = new AgentCommunicationService(this.pubSubService);

    console.log('🤖 AI/LLM Integration Module initialized');
  }

  async start(): Promise<void> {
    await super.start();

    // Start all services
    await this.aiService.start();
    await this.pubSubService.start();
    await this.vsCodeIntegration.start();
    await this.agentCommunication.start();

    console.log('🚀 AI/LLM Integration services started');
  }

  async stop(): Promise<void> {
    await super.stop();

    // Stop all services
    await this.agentCommunication.stop();
    await this.vsCodeIntegration.stop();
    await this.pubSubService.stop();
    await this.aiService.stop();

    console.log('🛑 AI/LLM Integration services stopped');
  }

  /**
   * Execute LLM request with hierarchical provider selection
   */
  async executeLLMRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Determine best provider based on hierarchy and availability
      const provider = await this.selectProvider(request);

      // Execute request
      const response = await this.aiService.complete(request, provider);

      // Add metadata
      const enhancedResponse: LLMResponse = {
        ...response,
        latency: Date.now() - startTime,
        agentId: request.agentId,
        taskId: request.taskId
      };

      // Publish to inter-agent communication if enabled
      if (this.config.enableInterAgentCommunication && request.agentId) {
        await this.agentCommunication.publishLLMResult(request.agentId, enhancedResponse);
      }

      return enhancedResponse;

    } catch (error) {
      console.error('LLM request failed:', error);

      // Try fallback providers
      return await this.fallbackLLMRequest(request, startTime);
    }
  }

  /**
   * Select best provider based on hierarchy
   */
  private async selectProvider(request: LLMRequest): Promise<string> {
    // Primary: Free open source and GitHub Copilot
    if (this.config.githubCopilotToken && await this.aiService.isProviderAvailable('github-copilot')) {
      return 'github-copilot';
    }

    if (this.config.grokApiKey && await this.aiService.isProviderAvailable('grok')) {
      return 'grok';
    }

    if (this.config.openaiApiKey && await this.aiService.isProviderAvailable('openai')) {
      return 'openai';
    }

    // Secondary: Groq
    if (this.config.groqApiKey && await this.aiService.isProviderAvailable('groq')) {
      return 'groq';
    }

    // Tertiary: Local Ollama
    if (this.config.ollamaEndpoint && await this.aiService.isProviderAvailable('ollama')) {
      return 'ollama';
    }

    throw new Error('No LLM providers available');
  }

  /**
   * Fallback to next available provider
   */
  private async fallbackLLMRequest(request: LLMRequest, startTime: number): Promise<LLMResponse> {
    const providers = ['github-copilot', 'grok', 'openai', 'groq', 'ollama'];

    for (const provider of providers) {
      try {
        if (await this.aiService.isProviderAvailable(provider)) {
          const response = await this.aiService.complete(request, provider);
          return {
            ...response,
            latency: Date.now() - startTime,
            agentId: request.agentId,
            taskId: request.taskId
          };
        }
      } catch (error) {
        console.warn(`Provider ${provider} failed, trying next...`);
      }
    }

    throw new Error('All LLM providers failed');
  }

  /**
   * Get VS Code context for enhanced LLM requests
   */
  async getVSCodeContext(): Promise<any> {
    return await this.vsCodeIntegration.getCurrentContext();
  }

  /**
   * Execute task with LLM assistance
   */
  async executeTask(taskName: string, params?: any): Promise<any> {
    switch (taskName) {
      case 'complete':
        return await this.executeLLMRequest(params);

      case 'get-context':
        return await this.getVSCodeContext();

      case 'analyze-code':
        return await this.analyzeCode(params);

      case 'generate-tests':
        return await this.generateTests(params);

      case 'optimize-code':
        return await this.optimizeCode(params);

      case 'review-pr':
        return await this.reviewPullRequest(params);

      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
  }

  /**
   * Analyze code using LLM
   */
  private async analyzeCode(params: { code: string; language?: string; context?: any }): Promise<LLMResponse> {
    const prompt = `Analyze the following ${params.language || 'code'} and provide insights:

${params.code}

Please provide:
1. Code quality assessment
2. Potential improvements
3. Security considerations
4. Performance optimizations
5. Best practices compliance`;

    return await this.executeLLMRequest({
      prompt,
      context: params.context,
      agentId: 'code-analyzer'
    });
  }

  /**
   * Generate tests using LLM
   */
  private async generateTests(params: { code: string; language?: string; framework?: string }): Promise<LLMResponse> {
    const prompt = `Generate comprehensive tests for the following ${params.language || 'code'}:

${params.code}

Please generate tests using ${params.framework || 'appropriate testing framework'} with:
1. Unit tests for all functions/methods
2. Edge cases and error handling
3. Mocking for external dependencies
4. Integration test examples`;

    return await this.executeLLMRequest({
      prompt,
      agentId: 'test-generator'
    });
  }

  /**
   * Optimize code using LLM
   */
  private async optimizeCode(params: { code: string; language?: string; target?: string }): Promise<LLMResponse> {
    const prompt = `Optimize the following ${params.language || 'code'} for ${params.target || 'performance and maintainability'}:

${params.code}

Please provide:
1. Performance optimizations
2. Memory usage improvements
3. Algorithm enhancements
4. Code readability improvements
5. Modern language features utilization`;

    return await this.executeLLMRequest({
      prompt,
      agentId: 'code-optimizer'
    });
  }

  /**
   * Review pull request using LLM
   */
  private async reviewPullRequest(params: { diff: string; language?: string; context?: any }): Promise<LLMResponse> {
    const prompt = `Review the following code changes:

${params.diff}

Please provide a comprehensive code review including:
1. Code quality assessment
2. Potential bugs or issues
3. Security vulnerabilities
4. Performance considerations
5. Best practices compliance
6. Suggested improvements
7. Testing recommendations`;

    return await this.executeLLMRequest({
      prompt,
      context: params.context,
      agentId: 'pr-reviewer'
    });
  }

  /**
   * Get agent category and job classification
   */
  getAgentCategory(agentName: string) {
    return getAgentCategory(agentName);
  }

  /**
   * Validate agent meets enterprise-grade requirements
   */
  validateAgentCapabilities(agentName: string, capabilities: string[]): boolean {
    return validateAgentCapabilities(agentName, capabilities);
  }

  /**
   * Get all agent categories
   */
  getAllCategories() {
    return AGENT_CATEGORIES;
  }

  /**
   * Get all job classifications
   */
  getAllJobClassifications() {
    return JOB_CLASSIFICATIONS;
  }

  /**
   * Get enterprise-grade capabilities for category
   */
  getEnterpriseCapabilities(categoryId: string) {
    const category = AGENT_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? {
      faangLevel: category.faangLevel,
      capabilities: category.capabilities,
      priority: category.priority,
      jobRoles: category.jobRoles
    } : null;
  }

  /**
   * Run agent proactively with definitive recommendations
   */
  async runAgentProactively(agentName: string, params: any = {}): Promise<string> {
    // Get agent category and capabilities
    const category = this.getAgentCategory(agentName);
    if (!category) {
      return `Agent '${agentName}' not found. Recommended action: Create agent with proper categorization.`;
    }

    // Generate proactive recommendations based on category
    const recommendations = await this.generateProactiveRecommendations(category, params);

    // Execute the agent task
    try {
      const result = await this.executeTask(agentName, params);
      return `✅ ${agentName} executed successfully. ${recommendations}\n\nResult: ${JSON.stringify(result, null, 2)}`;
    } catch (error) {
      return `❌ ${agentName} execution failed. Recommended fix: ${recommendations}\n\nError: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Generate proactive recommendations based on agent category
   */
  private async generateProactiveRecommendations(category: any, params: any): Promise<string> {
    const prompt = `As a ${category.faangLevel} level ${category.name} agent, provide definitive best-practice recommendations for the following task:

Category: ${category.name}
Capabilities: ${category.capabilities.join(', ')}
Job Roles: ${category.jobRoles.join(', ')}

Task Parameters: ${JSON.stringify(params, null, 2)}

Provide specific, actionable recommendations that should be implemented immediately. Do not ask questions - provide definitive solutions.`;

    try {
      const response = await this.executeLLMRequest({
        prompt,
        agentId: 'proactive-recommender',
        maxTokens: 500
      });
      return response.content || 'Execute standard procedures for this category.';
    } catch (error) {
      return `Follow ${category.name} best practices and implement immediately.`;
    }
  }
}

export default AIIntegrationManager;