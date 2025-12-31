# Google Vertex AI Integration

## Setup

### 1. API Key
Your Vertex AI API Key: `AIzaSyAb8RN6IIsq8RsZ3YIS5YysW_fwHsWDmom2ENxYSC8MtAhR1h-Q`

Create: `C:\AI\credentials\vertex_ai\api_key.json`
```json
{
  "api_key": "AIzaSyAb8RN6IIsq8RsZ3YIS5YysW_fwHsWDmom2ENxYSC8MtAhR1h-Q",
  "project_id": "infinity-x-one-systems",
  "location": "us-central1"
}
```

### 2. Install Dependencies
```bash
pip install google-cloud-aiplatform google-auth
```

## Available Models

- **gemini-pro**: General tasks, reasoning, code
- **gemini-pro-vision**: Image analysis, visual tasks
- **gemini-ultra**: Complex reasoning, research
- **code-bison**: Code generation, programming
- **chat-bison**: Conversations, chatbot
- **codechat-bison**: Code discussions
- **text-bison**: Text generation
- **textembedding-gecko**: Embeddings, semantic search

## Usage

### Python SDK
```python
from vertex_ai import VertexAIManager, ModelRouter

# Initialize
manager = VertexAIManager()
router = ModelRouter(manager)

# Auto-route to best model
result = router.route("Write a Python function to sort a list")
print(f"Selected: {result['selected_model']}")
print(f"Reason: {result['reason']}")

# Generate with specific model
response = manager.generate_text("Explain AI", model_id='gemini-pro')
print(response['text'])

# Code generation
code = manager.generate_code("Create a REST API")
print(code['text'])

# Image analysis
result = manager.analyze_image("image.jpg", "What's in this image?")
print(result['text'])
```

### CLI Usage
```bash
# Health check
python -c "from vertex_ai import VertexAIManager; m=VertexAIManager(); print(m.health_check())"

# List models
python -c "from vertex_ai import VertexAIManager; m=VertexAIManager(); print(list(m.models.keys()))"
```

## Intelligent Routing

The Model Router automatically selects the best model based on:

1. **Task Detection**: Analyzes prompt for keywords
2. **Model Capabilities**: Matches task to model strengths
3. **Context Awareness**: Uses additional context if provided

### Examples

- "Write code" → **code-bison**
- "Analyze this image" → **gemini-pro-vision**  
- "Let's chat" → **chat-bison**
- "Complex research" → **gemini-ultra**
- "General question" → **gemini-pro**

## Features

✅ **8 Vertex AI models** integrated
✅ **Intelligent routing** based on task type
✅ **Automatic model selection** 
✅ **Code generation** specialized models
✅ **Image analysis** with vision models
✅ **Embeddings** for semantic search
✅ **Health monitoring**
✅ **Easy integration** with existing systems

## Integration

### Add to Existing Code
```python
# Import Vertex AI
from vertex_ai import VertexAIManager, ModelRouter

# Initialize
vertex_mgr = VertexAIManager()
router = ModelRouter(vertex_mgr)

# Use in your application
def process_request(user_prompt):
    routing = router.route(user_prompt)
    response = vertex_mgr.generate_text(
        user_prompt,
        model_id=routing['selected_model']
    )
    return response
```

## API Key Security

- Store API key in `C:\AI\credentials\vertex_ai\api_key.json`
- Never commit API key to version control
- Use environment variables for production

## Next Steps

1. Create API key file
2. Install dependencies
3. Test with health check
4. Start using intelligent routing!
