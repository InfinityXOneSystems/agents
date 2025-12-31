#!/usr/bin/env python3
"""Ollama Manager - Local AI Server"""
import requests
import json

class OllamaManager:
    """Manager for Ollama local AI"""
    
    MODELS = {
        'llama2': 'General purpose',
        'codellama': 'Code generation',
        'mistral': 'Advanced reasoning',
        'phi': 'Ultra-fast (2.7B)',
        'neural-chat': 'Conversations'
    }
    
    def __init__(self, url="http://localhost:11434"):
        self.url = url
        
    def generate(self, prompt, model="llama2", **kwargs):
        """Generate response"""
        try:
            r = requests.post(f"{self.url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=60)
            if r.status_code == 200:
                return {'success': True, 'response': r.json()['response'], 'model': model}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        return {'success': False, 'error': 'Request failed'}
    
    def analyze_scraped_content(self, content, task="summarize"):
        """Analyze scraped content"""
        prompts = {
            'summarize': f"Summarize:\n{content}",
            'extract': f"Extract key info from:\n{content}",
            'sentiment': f"Analyze sentiment:\n{content}"
        }
        return self.generate(prompts.get(task, content), model="mistral")
    
    def code_analysis(self, code, language="python"):
        """Analyze code"""
        prompt = f"Analyze this {language} code:\n```{language}\n{code}\n```"
        return self.generate(prompt, model="codellama")
    
    def health_check(self):
        """Check server status"""
        try:
            r = requests.get(f"{self.url}/api/tags", timeout=2)
            return {
                'server_running': r.status_code == 200,
                'models': [m['name'] for m in r.json().get('models', [])]
            }
        except:
            return {'server_running': False, 'models': []}

if __name__ == "__main__":
    mgr = OllamaManager()
    print(json.dumps(mgr.health_check(), indent=2))
