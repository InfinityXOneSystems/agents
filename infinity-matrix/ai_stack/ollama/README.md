# Ollama Local AI Integration

## Features
✅ Local AI inference (no API costs)
✅ Automatic fallback when GitHub rate limited
✅ Perfect for scraping/crawling operations
✅ 5 optimized models included
✅ Offline capable

## Setup
1. Install Ollama: https://ollama.ai
2. Run: ```ollama serve```
3. Pull models: ```ollama pull llama2```

## Usage
```python
from ollama import OllamaManager, FallbackSystem

# Local AI
ollama = OllamaManager()
result = ollama.generate("Analyze this content")

# Auto-fallback
fallback = FallbackSystem(ollama)
result = fallback.generate_with_fallback("Query", prefer_local=True)
```
