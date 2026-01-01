/**
 * Hybrid Cloud Client
 * 
 * Implements cloud-primary architecture with intelligent fallback to local Ollama.
 * Priority: Google Cloud Run → Local Ollama → Error handling
 * 
 * Features:
 * - Automatic health checking
 * - Failover mechanism
 * - Request retry logic
 * - Comprehensive error handling
 * - Real-time status monitoring
 */

class HybridCloudClient {
  constructor(config = {}) {
    // Cloud endpoints (primary)
    this.cloudBackendUrl = config.cloudBackendUrl || process.env.VITE_API_URL || 'https://api.infinityxai.com';
    this.cloudVertexUrl = `${this.cloudBackendUrl}/vertex`;
    
    // Local endpoints (fallback)
    this.localBackendUrl = config.localBackendUrl || 'http://localhost:3001';
    this.localOllamaUrl = config.localOllamaUrl || process.env.VITE_OLLAMA_HOST || 'http://localhost:11434';
    
    // Configuration
    this.config = {
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      timeout: config.timeout || 30000,
      enableLogging: config.enableLogging !== false,
      ...config
    };
    
    // State
    this.state = {
      cloudStatus: 'checking',
      ollamaStatus: 'checking',
      preferredBackend: 'cloud', // 'cloud' or 'local'
      lastHealthCheck: null,
      requestStats: {
        cloudRequests: 0,
        localRequests: 0,
        failedRequests: 0,
        failoverCount: 0
      }
    };
    
    // Listeners for status changes
    this.statusListeners = [];
    
    // Initialize health checks
    this.startHealthChecks();
  }

  /**
   * Start periodic health checks for both backends
   */
  startHealthChecks() {
    this.performHealthCheck();
    setInterval(() => this.performHealthCheck(), this.config.healthCheckInterval);
  }

  /**
   * Perform health check on both backends
   */
  async performHealthCheck() {
    try {
      // Check cloud backend
      const cloudHealthPromise = this.checkCloudHealth();
      
      // Check local Ollama
      const ollamaHealthPromise = this.checkOllamaHealth();
      
      const [cloudResult, ollamaResult] = await Promise.allSettled([
        cloudHealthPromise,
        ollamaHealthPromise
      ]);
      
      const previousState = { ...this.state };
      
      // Update cloud status
      this.state.cloudStatus = cloudResult.status === 'fulfilled' && cloudResult.value ? 'healthy' : 'unhealthy';
      
      // Update Ollama status
      this.state.ollamaStatus = ollamaResult.status === 'fulfilled' && ollamaResult.value ? 'healthy' : 'unhealthy';
      
      // Determine preferred backend
      if (this.state.cloudStatus === 'healthy') {
        this.state.preferredBackend = 'cloud';
      } else if (this.state.ollamaStatus === 'healthy') {
        this.state.preferredBackend = 'local';
      }
      
      this.state.lastHealthCheck = new Date();
      
      // Notify listeners of status changes
      if (previousState.cloudStatus !== this.state.cloudStatus || 
          previousState.ollamaStatus !== this.state.ollamaStatus ||
          previousState.preferredBackend !== this.state.preferredBackend) {
        this.notifyStatusChange();
      }
      
      this.log('Health check completed', {
        cloud: this.state.cloudStatus,
        ollama: this.state.ollamaStatus,
        preferred: this.state.preferredBackend
      });
    } catch (error) {
      this.error('Health check failed', error);
    }
  }

  /**
   * Check cloud backend health
   */
  async checkCloudHealth() {
    try {
      const response = await fetch(`${this.cloudBackendUrl}/health`, {
        method: 'GET',
        timeout: this.config.timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check local Ollama health
   */
  async checkOllamaHealth() {
    try {
      const response = await fetch(`${this.localOllamaUrl}/api/tags`, {
        method: 'GET',
        timeout: this.config.timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Query Vertex AI via cloud backend (primary)
   */
  async queryVertexAI(prompt, options = {}) {
    return this.queryAI('vertex', prompt, options);
  }

  /**
   * Query Ollama via local backend (fallback)
   */
  async queryOllama(prompt, options = {}) {
    return this.queryAI('ollama', prompt, options);
  }

  /**
   * Smart AI query with automatic failover
   * Tries cloud first, falls back to local if needed
   */
  async queryAI(provider, prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      // If provider not specified, use preferred backend
      let actualProvider = provider;
      if (!provider || provider === 'auto') {
        actualProvider = this.state.preferredBackend === 'cloud' ? 'vertex' : 'ollama';
      }
      
      // Try primary backend first
      if (actualProvider === 'vertex' && this.state.cloudStatus === 'healthy') {
        try {
          const result = await this.queryCloudVertex(prompt, options);
          this.state.requestStats.cloudRequests++;
          this.log('Query completed via Vertex AI', { duration: Date.now() - startTime });
          return { ...result, backend: 'cloud', provider: 'vertex' };
        } catch (error) {
          this.log('Vertex AI query failed, attempting fallback', { error: error.message });
          this.state.requestStats.failoverCount++;
        }
      }
      
      // Try Ollama fallback
      if (this.state.ollamaStatus === 'healthy') {
        try {
          const result = await this.queryLocalOllama(prompt, options);
          this.state.requestStats.localRequests++;
          this.state.requestStats.failoverCount++;
          this.log('Query completed via Ollama (fallback)', { duration: Date.now() - startTime });
          return { ...result, backend: 'local', provider: 'ollama', viaFallback: true };
        } catch (error) {
          this.log('Ollama query failed', { error: error.message });
        }
      }
      
      // Both backends failed
      throw new Error('All backends unavailable. Cloud: ' + this.state.cloudStatus + ', Ollama: ' + this.state.ollamaStatus);
    } catch (error) {
      this.state.requestStats.failedRequests++;
      this.error('Query failed on all backends', error);
      throw error;
    }
  }

  /**
   * Query Vertex AI via cloud backend with retry logic
   */
  async queryCloudVertex(prompt, options = {}, attemptNumber = 1) {
    try {
      const response = await fetch(`${this.cloudVertexUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${options.token || ''}`
        },
        body: JSON.stringify({
          prompt,
          ...options
        }),
        timeout: this.config.timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (attemptNumber < this.config.retryAttempts) {
        this.log(`Vertex AI attempt ${attemptNumber} failed, retrying...`);
        await this.delay(this.config.retryDelay * attemptNumber);
        return this.queryCloudVertex(prompt, options, attemptNumber + 1);
      }
      throw error;
    }
  }

  /**
   * Query Ollama via local backend with retry logic
   */
  async queryLocalOllama(prompt, options = {}, attemptNumber = 1) {
    try {
      const response = await fetch(`${this.localBackendUrl}/ollama/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model: options.model || 'llama2',
          ...options
        }),
        timeout: this.config.timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (attemptNumber < this.config.retryAttempts) {
        this.log(`Ollama attempt ${attemptNumber} failed, retrying...`);
        await this.delay(this.config.retryDelay * attemptNumber);
        return this.queryLocalOllama(prompt, options, attemptNumber + 1);
      }
      throw error;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      ...this.state,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(listener) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  notifyStatusChange() {
    this.statusListeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        this.error('Status listener error', error);
      }
    });
  }

  /**
   * Utility: Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility
   */
  log(message, data = {}) {
    if (this.config.enableLogging) {
      console.log(`[HybridCloudClient] ${message}`, data);
    }
  }

  /**
   * Error logging utility
   */
  error(message, error) {
    console.error(`[HybridCloudClient] ${message}`, error);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.state.requestStats,
      cloudHealthy: this.state.cloudStatus === 'healthy',
      ollamaHealthy: this.state.ollamaStatus === 'healthy',
      preferredBackend: this.state.preferredBackend,
      lastHealthCheck: this.state.lastHealthCheck,
      successRate: this.state.requestStats.cloudRequests + this.state.requestStats.localRequests > 0
        ? ((this.state.requestStats.cloudRequests + this.state.requestStats.localRequests - this.state.requestStats.failedRequests) / 
           (this.state.requestStats.cloudRequests + this.state.requestStats.localRequests) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Shutdown and cleanup
   */
  shutdown() {
    this.statusListeners = [];
    this.log('Hybrid cloud client shutdown');
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HybridCloudClient;
}
