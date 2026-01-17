/**
 * AI Service - Unified LLM Provider Management
 * Implements hierarchical provider selection with fallback
 */

import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import axios from 'axios';
import { LLMConfig, LLMRequest, LLMResponse } from '../index.js';

interface ProviderStatus {
  name: string;
  available: boolean;
  latency?: number;
  lastError?: string;
}

export class AIService {
  private openai?: OpenAI;
  private groq?: Groq;
  private config: LLMConfig;

  private providerStatuses: Map<string, ProviderStatus> = new Map();

  constructor(config: LLMConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize OpenAI
    if (this.config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openaiApiKey
      });
    }

    // Initialize Groq
    if (this.config.groqApiKey) {
      this.groq = new Groq({
        apiKey: this.config.groqApiKey
      });
    }

    // Initialize provider statuses
    this.providerStatuses.set('github-copilot', { name: 'github-copilot', available: !!this.config.githubCopilotToken });
    this.providerStatuses.set('openai', { name: 'openai', available: !!this.config.openaiApiKey });
    this.providerStatuses.set('grok', { name: 'grok', available: !!this.config.grokApiKey });
    this.providerStatuses.set('groq', { name: 'groq', available: !!this.config.groqApiKey });
    this.providerStatuses.set('ollama', { name: 'ollama', available: !!this.config.ollamaEndpoint });
  }

  async start(): Promise<void> {
    // Test provider availability
    await this.testProviders();
  }

  async stop(): Promise<void> {
    // Cleanup if needed
  }

  /**
   * Test all providers for availability
   */
  private async testProviders(): Promise<void> {
    const providers = ['github-copilot', 'openai', 'grok', 'groq', 'ollama'];

    for (const provider of providers) {
      try {
        const startTime = Date.now();
        const available = await this.testProvider(provider);
        const latency = Date.now() - startTime;

        this.providerStatuses.set(provider, {
          name: provider,
          available,
          latency
        });
      } catch (error) {
        this.providerStatuses.set(provider, {
          name: provider,
          available: false,
          lastError: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Test individual provider
   */
  private async testProvider(provider: string): Promise<boolean> {
    switch (provider) {
      case 'github-copilot':
        return await this.testGitHubCopilot();

      case 'openai':
        return await this.testOpenAI();

      case 'grok':
        return await this.testGrok();

      case 'groq':
        return await this.testGroq();

      case 'ollama':
        return await this.testOllama();

      default:
        return false;
    }
  }

  private async testGitHubCopilot(): Promise<boolean> {
    // Test GitHub Copilot API availability
    // This would require GitHub Copilot API access
    return !!this.config.githubCopilotToken;
  }

  private async testOpenAI(): Promise<boolean> {
    if (!this.openai) return false;

    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async testGrok(): Promise<boolean> {
    // Test Grok API availability
    // This would require Grok API access
    return !!this.config.grokApiKey;
  }

  private async testGroq(): Promise<boolean> {
    if (!this.groq) return false;

    try {
      await this.groq.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async testOllama(): Promise<boolean> {
    if (!this.config.ollamaEndpoint) return false;

    try {
      const response = await axios.get(`${this.config.ollamaEndpoint}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if provider is available
   */
  async isProviderAvailable(provider: string): Promise<boolean> {
    const status = this.providerStatuses.get(provider);
    return status?.available || false;
  }

  /**
   * Complete LLM request with specified provider
   */
  async complete(request: LLMRequest, provider?: string): Promise<LLMResponse> {
    if (!provider) {
      // Auto-select best provider
      provider = await this.selectBestProvider(request);
    }

    switch (provider) {
      case 'github-copilot':
        return await this.completeGitHubCopilot(request);

      case 'openai':
        return await this.completeOpenAI(request);

      case 'grok':
        return await this.completeGrok(request);

      case 'groq':
        return await this.completeGroq(request);

      case 'ollama':
        return await this.completeOllama(request);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Select best provider based on request and availability
   */
  private async selectBestProvider(request: LLMRequest): Promise<string> {
    // Priority order: github-copilot, grok, openai, groq, ollama
    const priority = ['github-copilot', 'grok', 'openai', 'groq', 'ollama'];

    for (const provider of priority) {
      if (await this.isProviderAvailable(provider)) {
        return provider;
      }
    }

    throw new Error('No available LLM providers');
  }

  private async completeGitHubCopilot(request: LLMRequest): Promise<LLMResponse> {
    // GitHub Copilot integration
    // This would use GitHub Copilot API or VS Code extension API
    throw new Error('GitHub Copilot integration not yet implemented');
  }

  private async completeOpenAI(request: LLMRequest): Promise<LLMResponse> {
    if (!this.openai) throw new Error('OpenAI not configured');

    const messages = request.messages || [{ role: 'user', content: request.prompt || '' }];

    // Don't use streaming for now to keep it simple
    const response = await this.openai.chat.completions.create({
      model: request.model || 'gpt-4',
      messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: false
    }) as OpenAI.Chat.Completions.ChatCompletion;

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      model: response.model || request.model || 'gpt-4',
      provider: 'openai',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }

  private async completeGrok(request: LLMRequest): Promise<LLMResponse> {
    // Grok integration
    // This would use xAI Grok API
    throw new Error('Grok integration not yet implemented');
  }

  private async completeGroq(request: LLMRequest): Promise<LLMResponse> {
    if (!this.groq) throw new Error('Groq not configured');

    const messages = request.messages || [{ role: 'user', content: request.prompt || '' }];

    const response = await this.groq.chat.completions.create({
      model: request.model || 'mixtral-8x7b-32768',
      messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: false
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      model: response.model || request.model || 'mixtral-8x7b-32768',
      provider: 'groq',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }

  private async completeOllama(request: LLMRequest): Promise<LLMResponse> {
    if (!this.config.ollamaEndpoint) throw new Error('Ollama not configured');

    const payload = {
      model: request.model || this.config.ollamaModel || 'llama2',
      prompt: request.prompt,
      messages: request.messages,
      stream: request.stream,
      options: {
        temperature: request.temperature,
        num_predict: request.maxTokens
      }
    };

    const response = await axios.post(`${this.config.ollamaEndpoint}/api/chat`, payload);

    return {
      content: response.data.response || '',
      model: payload.model,
      provider: 'ollama'
    };
  }

  /**
   * Get status of all providers
   */
  async getProviderStatuses(): Promise<ProviderStatus[]> {
    return Array.from(this.providerStatuses.values());
  }
}