/**
 * PubSub Service - Inter-agent Communication
 * Enables real-time communication between agents using Redis
 */

import { createClient as createRedisClient, RedisClientType } from 'redis';

export interface PubSubMessage {
  id: string;
  type: string;
  from: string;
  to?: string;
  data: any;
  timestamp: number;
  ttl?: number;
}

export interface PubSubChannel {
  name: string;
  subscribers: Set<string>;
  messageCount: number;
  lastActivity: number;
}

export class PubSubService {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private channels: Map<string, PubSubChannel> = new Map();
  private messageHandlers: Map<string, (message: PubSubMessage) => void> = new Map();
  private isRunning: boolean = false;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';

    this.publisher = createRedisClient({ url });
    this.subscriber = createRedisClient({ url });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      await this.publisher.connect();
      await this.subscriber.connect();

      this.subscriber.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });

      this.isRunning = true;
      console.log('📡 PubSub service started');
    } catch (error) {
      console.error('Failed to start PubSub service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.subscriber.unsubscribe();
      await this.publisher.quit();
      await this.subscriber.quit();

      this.isRunning = false;
      console.log('📡 PubSub service stopped');
    } catch (error) {
      console.error('Error stopping PubSub service:', error);
    }
  }

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: Omit<PubSubMessage, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isRunning) throw new Error('PubSub service not running');

    const fullMessage: PubSubMessage = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message
    };

    try {
      await this.publisher.publish(channel, JSON.stringify(fullMessage));

      // Update channel stats
      this.updateChannelStats(channel);

      console.log(`📤 Published message to ${channel}:`, fullMessage.type);
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channel: string, handler?: (message: PubSubMessage) => void): Promise<void> {
    if (!this.isRunning) throw new Error('PubSub service not running');

    try {
      await this.subscriber.subscribe(channel, (message, channelName) => {
        this.handleMessage(channelName, message);
      });

      if (handler) {
        this.messageHandlers.set(channel, handler);
      }

      // Initialize channel stats
      if (!this.channels.has(channel)) {
        this.channels.set(channel, {
          name: channel,
          subscribers: new Set(),
          messageCount: 0,
          lastActivity: Date.now()
        });
      }

      console.log(`📥 Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error('Failed to subscribe to channel:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel: string): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.subscriber.unsubscribe(channel);
      this.messageHandlers.delete(channel);

      console.log(`📤 Unsubscribed from channel: ${channel}`);
    } catch (error) {
      console.error('Failed to unsubscribe from channel:', error);
    }
  }

  /**
   * Publish LLM result to agent channel
   */
  async publishLLMResult(agentId: string, result: any): Promise<void> {
    await this.publish(`agent:${agentId}:llm`, {
      type: 'llm-result',
      from: 'ai-service',
      to: agentId,
      data: result
    });
  }

  /**
   * Publish task completion to agent channel
   */
  async publishTaskCompletion(agentId: string, taskId: string, result: any): Promise<void> {
    await this.publish(`agent:${agentId}:tasks`, {
      type: 'task-completed',
      from: 'task-manager',
      to: agentId,
      data: { taskId, result }
    });
  }

  /**
   * Publish agent status update
   */
  async publishAgentStatus(agentId: string, status: any): Promise<void> {
    await this.publish('agents:status', {
      type: 'status-update',
      from: agentId,
      data: { agentId, ...status }
    });
  }

  /**
   * Request help from other agents
   */
  async requestAgentHelp(fromAgent: string, request: any): Promise<void> {
    await this.publish('agents:help', {
      type: 'help-request',
      from: fromAgent,
      data: request
    });
  }

  /**
   * Broadcast system-wide message
   */
  async broadcastSystemMessage(message: any): Promise<void> {
    await this.publish('system:broadcast', {
      type: 'system-message',
      from: 'system',
      data: message
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(channel: string, messageData: string): void {
    try {
      const message: PubSubMessage = JSON.parse(messageData);

      // Call channel-specific handler
      const handler = this.messageHandlers.get(channel);
      if (handler) {
        handler(message);
      }

      // Update channel stats
      this.updateChannelStats(channel);

      console.log(`📥 Received message on ${channel}:`, message.type);
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Update channel statistics
   */
  private updateChannelStats(channel: string): void {
    const channelInfo = this.channels.get(channel);
    if (channelInfo) {
      channelInfo.messageCount++;
      channelInfo.lastActivity = Date.now();
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get channel information
   */
  getChannelInfo(channel: string): PubSubChannel | undefined {
    return this.channels.get(channel);
  }

  /**
   * Get all channels
   */
  getAllChannels(): PubSubChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<any> {
    return {
      running: this.isRunning,
      channels: this.getAllChannels().length,
      handlers: this.messageHandlers.size,
      publisherConnected: this.publisher.isOpen,
      subscriberConnected: this.subscriber.isOpen
    };
  }
}