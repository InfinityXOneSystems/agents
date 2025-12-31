#!/usr/bin/env python3
"""Fallback System - Auto-switch to local when cloud limited"""
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('Fallback')

class FallbackSystem:
    """Intelligent cloud/local fallback"""
    
    def __init__(self, ollama_manager, vertex_manager=None):
        self.ollama = ollama_manager
        self.vertex = vertex_manager
        self.stats = {'ollama': 0, 'vertex': 0, 'fallbacks': 0}
    
    def check_github_rate_limit(self):
        """Check if GitHub rate limited"""
        try:
            r = requests.get("https://api.github.com/rate_limit", timeout=2)
            if r.status_code == 200:
                remaining = r.json().get('rate', {}).get('remaining', 0)
                if remaining < 10:
                    logger.warning("GitHub rate limit approaching - using Ollama")
                    return True
        except:
            pass
        return False
    
    def generate_with_fallback(self, prompt, prefer_local=False, **kwargs):
        """Generate with automatic fallback"""
        # Use local if preferred or rate limited
        if prefer_local or self.check_github_rate_limit():
            result = self.ollama.generate(prompt, **kwargs)
            if result['success']:
                self.stats['ollama'] += 1
                result['provider'] = 'ollama_local'
                return result
        
        # Try Vertex if available
        if self.vertex:
            try:
                result = self.vertex.generate_text(prompt, **kwargs)
                if result.get('text'):
                    self.stats['vertex'] += 1
                    return {
                        'success': True,
                        'response': result['text'],
                        'provider': 'vertex_ai'
                    }
            except:
                pass
        
        # Fallback to Ollama
        result = self.ollama.generate(prompt, **kwargs)
        if result['success']:
            self.stats['fallbacks'] += 1
            result['provider'] = 'ollama_fallback'
        return result
    
    def analyze_content_with_fallback(self, content, task="summarize", prefer_local=True):
        """Analyze scraped content with fallback"""
        logger.info(f"Analyzing {len(content)} chars - Task: {task}")
        
        if prefer_local or self.check_github_rate_limit():
            result = self.ollama.analyze_scraped_content(content, task)
            if result['success']:
                result['provider'] = 'ollama_local'
                return result
        
        # Fallback
        return self.generate_with_fallback(f"Task: {task}\n\n{content}")
    
    def get_stats(self):
        """Get usage statistics"""
        return {
            **self.stats,
            'github_rate_limited': self.check_github_rate_limit(),
            'ollama_available': self.ollama.health_check()['server_running']
        }

if __name__ == "__main__":
    from ollama_manager import OllamaManager
    ollama = OllamaManager()
    fallback = FallbackSystem(ollama)
    result = fallback.generate_with_fallback("Test", prefer_local=True)
    print(result)
