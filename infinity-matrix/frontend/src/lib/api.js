
const API_KEY = 'AIzaSyBLlKqSZFazsIusrqHpIhBh99yNtnR4KU0';
// Switching to v1/gemini-pro as the stable endpoint. 
// The v1beta/gemini-1.5-flash endpoint was returning 404s, indicating model unavailability for this key/region.
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

export const api = {
  sendMessage: async (message) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error Details:', errorData);
        
        // Handle specific error cases if needed
        if (response.status === 404) {
             throw new Error('AI Model not available. Please try again later.');
        }
        
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the response text
      // Structure: data.candidates[0].content.parts[0].text
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        // Sometimes safety settings block the response
        if (data.promptFeedback?.blockReason) {
            throw new Error(`Response blocked: ${data.promptFeedback.blockReason}`);
        }
        throw new Error('Invalid response format from Neural Grid');
      }

      return {
        role: 'assistant',
        content: text
      };
    } catch (error) {
      console.error('Vision Cortex Connection Failed:', error);
      return {
        role: 'assistant',
        content: `[SYSTEM ERROR] Neural link unstable. Unable to process query. \n\nDetails: ${error.message}`
      };
    }
  }
};
