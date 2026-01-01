
const API_BASE = 'https://orchestrator-896380409704.us-east1.run.app';
// The FRONTEND_TOKEN is no longer used for authentication in fetch headers
// const FRONTEND_TOKEN = 'tPLxWY7e8/x3waKMoZQ2vlW1dZG0ERsDiNMHADr8xgE=';

// Helper to manage session ID persistence
const getSessionId = () => {
  try {
    let sessionId = localStorage.getItem('vision_cortex_session_id');
    if (!sessionId) {
      // Generate a UUID
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        // Fallback for environments without crypto.randomUUID
        sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      localStorage.setItem('vision_cortex_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    // Fallback if localStorage is inaccessible
    console.warn('LocalStorage access failed, using temporary session ID');
    return `temp-session-${Date.now()}`;
  }
};

const handleOrchestratorResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Orchestrator API Error Details:', errorData);
    throw new Error(errorData.detail || errorData.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  
  // Normalized text extraction
  let text = '';
  
  // Check for 'text' property as requested for vertex/generate
  if (data.text) {
    text = data.text;
  }
  // Check for chat/openai format
  else if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    text = data.choices[0].message?.content || '';
  } 
  // Other fallbacks
  else if (data.content) {
    text = data.content;
  } else if (data.response) {
    text = data.response;
  } else {
    console.warn('Unexpected response structure:', data);
    text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  if (!text) {
    throw new Error('Empty response received from Neural Grid');
  }

  return {
    role: 'assistant',
    content: text
  };
};

export const api = {
  sendMessage: async (message) => {
    try {
      const sessionId = getSessionId();

      const payload = {
        model: 'gemini-pro',
        messages: [
          { role: 'user', content: message }
        ],
        session_id: sessionId,
        metadata: {
          source: 'infinityxai.com'
        }
      };

      const response = await fetch(`${API_BASE}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Removed 'Authorization' header as requested
        },
        body: JSON.stringify(payload)
      });

      return await handleOrchestratorResponse(response);

    } catch (error) {
      console.error('Vision Cortex Connection Failed:', error);
      return {
        role: 'assistant',
        content: `[SYSTEM ERROR] Neural link unstable. Unable to process query. \n\nDetails: ${error.message}`
      };
    }
  },

  analyzeImage: async (base64Data, userPrompt) => {
    try {
      const sessionId = getSessionId();
      // Required prompt prefix for the backend
      const prompt = `ANALYZE_IMAGE_BASE64:${base64Data}\n\n${userPrompt || 'Analyze this image.'}`;

      const payload = {
        prompt: prompt,
        max_tokens: 800,
        session_id: sessionId,
        metadata: {
          source: 'vision-cortex',
          type: 'image-analysis'
        }
      };

      const response = await fetch(`${API_BASE}/vertex/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Removed 'Authorization' header as requested
        },
        body: JSON.stringify(payload)
      });

      return await handleOrchestratorResponse(response);

    } catch (error) {
      console.error('Vision Analysis Failed:', error);
      return {
        role: 'assistant',
        content: `[VISION ERROR] Optical sensors failed to process image. \n\nDetails: ${error.message}`
      };
    }
  },

  generateCode: async (requirements, language = 'javascript', framework = 'react') => {
    try {
      const sessionId = getSessionId();
      const prompt = `Generate ${language} code using ${framework}.\n\nRequirements:\n${requirements}`;

      const payload = {
        prompt: prompt,
        session_id: sessionId,
        metadata: {
          source: 'quantum-x-builder',
          type: 'code-generation'
        }
      };

      const response = await fetch(`${API_BASE}/vertex/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Removed 'Authorization' header as requested
        },
        body: JSON.stringify(payload)
      });

      return await handleOrchestratorResponse(response);

    } catch (error) {
      console.error('Code Generation Failed:', error);
      return {
        role: 'assistant',
        content: `[BUILDER ERROR] Construct mechanism failed. \n\nDetails: ${error.message}`
      };
    }
  },

  // Stub/Mock methods for user profile and stats to prevent errors in dependent pages
  getProfile: async () => ({ name: 'Operative', email: 'operative@infinity.x' }),
  getStats: async () => ({ tokensUsed: 12500, messagesSent: 342, activeChats: 3, plan: 'Pro Node' }),
  isAuthenticated: () => true, 
  getChatHistory: async () => [],
  clearHistory: async () => {},
  logout: () => {}
};
