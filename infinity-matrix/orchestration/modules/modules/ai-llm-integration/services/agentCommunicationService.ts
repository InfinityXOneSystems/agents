/**
 * Agent Communication Service
 * Manages inter-agent communication using PubSub
 */

import { PubSubService, PubSubMessage } from './pubSubService.js';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  ttl?: number;
  correlationId?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  category: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error' | 'offline';
  lastSeen: number;
  metadata?: any;
}

export class AgentCommunicationService {
  private pubSub: PubSubService;
  private agentId: string;
  private registeredAgents: Map<string, AgentInfo> = new Map();
  private messageHandlers: Map<string, (message: AgentMessage) => void> = new Map();
  private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();

  constructor(pubSub: PubSubService, agentId: string = 'ai-service') {
    this.pubSub = pubSub;
    this.agentId = agentId;
  }

  async start(): Promise<void> {
    // Subscribe to agent communication channels
    await this.pubSub.subscribe('agents:registry', (message) => this.handleRegistryMessage(message));
    await this.pubSub.subscribe('agents:broadcast', (message) => this.handleBroadcastMessage(message));
    await this.pubSub.subscribe(`agent:${this.agentId}:direct`, (message) => this.handleDirectMessage(message));

    // Register this agent
    await this.registerAgent();

    console.log('🤝 Agent communication service started');
  }

  async stop(): Promise<void> {
    // Unsubscribe from channels
    await this.pubSub.unsubscribe('agents:registry');
    await this.pubSub.unsubscribe('agents:broadcast');
    await this.pubSub.unsubscribe(`agent:${this.agentId}:direct`);

    // Clear pending requests
    for (const [id, { timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
    }
    this.pendingRequests.clear();

    console.log('🤝 Agent communication service stopped');
  }

  /**
   * Register this agent in the system
   */
  private async registerAgent(): Promise<void> {
    const agentInfo: AgentInfo = {
      id: this.agentId,
      name: 'AI/LLM Integration Service',
      category: 'ai-ml',
      capabilities: [
        'llm-completion',
        'code-analysis',
        'test-generation',
        'code-optimization',
        'pr-review',
        'inter-agent-communication'
      ],
      status: 'idle',
      lastSeen: Date.now(),
      metadata: {
        providers: ['github-copilot', 'openai', 'grok', 'groq', 'ollama'],
        version: '2.0.0'
      }
    };

    await this.pubSub.publish('agents:registry', {
      type: 'register',
      from: this.agentId,
      data: agentInfo
    });
  }

  /**
   * Send message to specific agent
   */
  async sendMessage(to: string, message: Omit<AgentMessage, 'id' | 'from' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      id: this.generateMessageId(),
      from: this.agentId,
      ...message
    };

    await this.pubSub.publish(`agent:${to}:direct`, {
      type: 'direct-message',
      from: this.agentId,
      to,
      data: fullMessage
    });
  }

  /**
   * Request help from other agents
   */
  async requestHelp(request: any, timeout: number = 30000): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const correlationId = this.generateMessageId();

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(new Error('Request timeout'));
      }, timeout);

      this.pendingRequests.set(correlationId, { resolve, reject, timeout: timeoutHandle });

      // Publish help request
      await this.pubSub.publish('agents:help', {
        type: 'help-request',
        from: this.agentId,
        data: { ...request, correlationId }
      });
    });
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(message: Omit<AgentMessage, 'id' | 'from' | 'to' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      id: this.generateMessageId(),
      from: this.agentId,
      to: 'all',
      ...message
    };

    await this.pubSub.publish('agents:broadcast', {
      type: 'broadcast',
      from: this.agentId,
      data: fullMessage
    });
  }

  /**
   * Register message handler for specific message type
   */
  registerHandler(messageType: string, handler: (message: AgentMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Get list of registered agents
   */
  getRegisteredAgents(): AgentInfo[] {
    return Array.from(this.registeredAgents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentInfo | undefined {
    return this.registeredAgents.get(agentId);
  }

  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability: string): AgentInfo[] {
    return this.getRegisteredAgents().filter(agent =>
      agent.capabilities.includes(capability) && agent.status !== 'offline'
    );
  }

  /**
   * Find agents by category
   */
  findAgentsByCategory(category: string): AgentInfo[] {
    return this.getRegisteredAgents().filter(agent =>
      agent.category === category && agent.status !== 'offline'
    );
  }

  /**
   * Publish LLM result to agent channel
   */
  async publishLLMResult(agentId: string, result: any): Promise<void> {
    await this.pubSub.publishLLMResult(agentId, result);
  }

  /**
   * Handle registry messages
   */
  private handleRegistryMessage(message: PubSubMessage): void {
    const { type, data } = message;

    switch (type) {
      case 'register':
        this.registeredAgents.set(data.id, data);
        console.log(`📝 Agent registered: ${data.name} (${data.id})`);
        break;

      case 'unregister':
        this.registeredAgents.delete(data.id);
        console.log(`📝 Agent unregistered: ${data.id}`);
        break;

      case 'status-update':
        if (this.registeredAgents.has(data.id)) {
          this.registeredAgents.get(data.id)!.status = data.status;
          this.registeredAgents.get(data.id)!.lastSeen = Date.now();
        }
        break;
    }
  }

  /**
   * Handle broadcast messages
   */
  private handleBroadcastMessage(message: PubSubMessage): void {
    const agentMessage: AgentMessage = message.data;

    // Call registered handler
    const handler = this.messageHandlers.get(agentMessage.type);
    if (handler) {
      handler(agentMessage);
    }
  }

  /**
   * Handle direct messages
   */
  private handleDirectMessage(message: PubSubMessage): void {
    const agentMessage: AgentMessage = message.data;

    // Handle responses to pending requests
    if (agentMessage.correlationId && this.pendingRequests.has(agentMessage.correlationId)) {
      const { resolve, timeout } = this.pendingRequests.get(agentMessage.correlationId)!;
      clearTimeout(timeout);
      this.pendingRequests.delete(agentMessage.correlationId);
      resolve(agentMessage.data);
      return;
    }

    // Call registered handler
    const handler = this.messageHandlers.get(agentMessage.type);
    if (handler) {
      handler(agentMessage);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `agent_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<any> {
    return {
      agentId: this.agentId,
      registeredAgents: this.registeredAgents.size,
      pendingRequests: this.pendingRequests.size,
      handlers: this.messageHandlers.size
    };
  }
}