/**
 * Ollama AI Integration Configuration
 * Manages connections to local Ollama instances and provides fallback support
 */

// Ollama configuration
export const OLLAMA_CONFIG = {
  // Primary Ollama instance (local)
  primary: {
    host: import.meta.env.VITE_OLLAMA_HOST || 'http://localhost:11434',
    enabled: import.meta.env.VITE_OLLAMA_ENABLED !== 'false',
    timeout: 30000
  },
  // Fallback instances
  fallback: {
    host: import.meta.env.VITE_OLLAMA_FALLBACK_HOST || 'http://localhost:11435',
    enabled: import.meta.env.VITE_OLLAMA_FALLBACK_ENABLED === 'true',
    timeout: 30000
  }
};

/**
 * Test connection to Ollama instance
 */
export async function testOllamaConnection(host = OLLAMA_CONFIG.primary.host) {
  try {
    const response = await fetch(`${host}/api/tags`, {
      method: 'GET',
      timeout: OLLAMA_CONFIG.primary.timeout
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to connect to Ollama at ${host}:`, error);
    return false;
  }
}

/**
 * Get available models from Ollama
 */
export async function getOllamaModels(host = OLLAMA_CONFIG.primary.host) {
  try {
    const response = await fetch(`${host}/api/tags`, {
      method: 'GET',
      timeout: OLLAMA_CONFIG.primary.timeout
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return (data.models || []).map(model => ({
      id: model.name,
      name: model.name,
      description: `Local Ollama Model - ${model.size}`,
      provider: 'Ollama Local',
      costPerToken: 0, // Local models are free
      isLocal: true
    }));
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    throw error;
  }
}

/**
 * Process prompt with Ollama model
 */
export async function processWithOllama(
  prompt,
  model,
  options = {},
  host = OLLAMA_CONFIG.primary.host
) {
  try {
    const response = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        ...options
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return {
      result: data.response,
      cost: 0, // Local processing is free
      tokensUsed: data.eval_count || 0,
      model: model,
      source: 'ollama'
    };
  } catch (error) {
    console.error('Failed to process with Ollama:', error);
    throw error;
  }
}

/**
 * Get health status of Ollama instance
 */
export async function getOllamaHealth(host = OLLAMA_CONFIG.primary.host) {
  try {
    const response = await fetch(`${host}/api/tags`, {
      method: 'GET',
      timeout: OLLAMA_CONFIG.primary.timeout
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return {
      status: 'healthy',
      activeModels: (data.models || []).length,
      source: 'ollama',
      host: host
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      activeModels: 0,
      error: error.message,
      source: 'ollama',
      host: host
    };
  }
}

/**
 * Attempt to find working Ollama instance
 * Tries primary, then fallback
 */
export async function findWorkingOllamaInstance() {
  if (OLLAMA_CONFIG.primary.enabled) {
    const isPrimaryHealthy = await testOllamaConnection(OLLAMA_CONFIG.primary.host);
    if (isPrimaryHealthy) {
      return OLLAMA_CONFIG.primary.host;
    }
  }

  if (OLLAMA_CONFIG.fallback.enabled) {
    const isFallbackHealthy = await testOllamaConnection(OLLAMA_CONFIG.fallback.host);
    if (isFallbackHealthy) {
      return OLLAMA_CONFIG.fallback.host;
    }
  }

  return null;
}

export default {
  OLLAMA_CONFIG,
  testOllamaConnection,
  getOllamaModels,
  processWithOllama,
  getOllamaHealth,
  findWorkingOllamaInstance
};
