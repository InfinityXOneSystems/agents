# Ollama Setup Guide

## 1. Install Ollama
Download from: https://ollama.ai
- Windows: ollama-windows-amd64.exe
- Mac: brew install ollama
- Linux: curl https://ollama.ai/install.sh | sh

## 2. Start Server
```bash
ollama serve
```

## 3. Pull Models
```bash
# General purpose
ollama pull llama2

# Code generation
ollama pull codellama

# Fast model
ollama pull phi
```

## 4. Test
```bash
python test_ollama.py
```

## 5. Use in Code
```python
from ollama import OllamaManager, FallbackSystem

# Local AI
ollama = OllamaManager()
result = ollama.generate("Explain AI")
print(result['response'])

# With fallback
fallback = FallbackSystem(ollama)
result = fallback.generate_with_fallback("Query", prefer_local=True)
```
