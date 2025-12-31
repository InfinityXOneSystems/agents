#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from ollama_manager import OllamaManager
from fallback_system import FallbackSystem

print("=== OLLAMA INTEGRATION TEST ===\n")

ollama = OllamaManager()
health = ollama.health_check()

print(f"Server Running: {health['server_running']}")
print(f"Models: {health.get('models', [])}")

if not health['server_running']:
    print("\nTo start Ollama:")
    print("1. Download: https://ollama.ai")
    print("2. Run: ollama serve")
    print("3. Pull model: ollama pull llama2")

print("\n✅ Ollama integration ready!")
