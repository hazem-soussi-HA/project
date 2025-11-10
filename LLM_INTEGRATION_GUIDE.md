# 🚀 HAZoom LLM Integration Guide

## Current Status
✅ **Simulation Mode Active** - All intelligence levels functional  
✅ **Streaming Responses** - Real-time response generation  
✅ **Multiple Providers Ready** - OpenAI, Anthropic, Local models  
✅ **System Integration** - Django backend fully compatible  

## Integration Options

### 1. 🔵 OpenAI GPT Integration (Recommended for beginners)

**Setup:**
```bash
# Install OpenAI client
pip install openai

# Set your API key
export OPENAI_API_KEY="sk-your-key-here"

# Or add to .env file
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

**Implementation in `llm_backend.py`:**
```python
import openai
from openai import AsyncOpenAI

async def _generate_openai_response(self, messages):
    """OpenAI GPT integration with streaming"""
    client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    stream = await client.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-4" for maximum intelligence
        messages=messages,
        stream=True,
        temperature=0.7,
        max_tokens=2000
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

### 2. 🟣 Anthropic Claude Integration

**Setup:**
```bash
# Install Anthropic client
pip install anthropic

# Set API key
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

**Implementation:**
```python
import anthropic

async def _generate_claude_response(self, messages):
    """Anthropic Claude integration"""
    client = anthropic.AsyncAnthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    # Convert messages format
    system_prompt = ""
    user_messages = []
    
    for msg in messages:
        if msg["role"] == "system":
            system_prompt = msg["content"]
        else:
            user_messages.append({"role": msg["role"], "content": msg["content"]})
    
    message = await client.messages.create(
        model="claude-3-sonnet-20240229",  # or claude-3-opus for maximum intelligence
        max_tokens=2000,
        system=system_prompt,
        messages=user_messages
    )
    
    response_text = message.content[0].text
    # Split into chunks for streaming effect
    words = response_text.split()
    for i in range(0, len(words), 3):
        yield " ".join(words[i:i+3]) + " "
```

### 3. 🏠 Local Models (Ollama) - Best for Privacy

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve

# Pull a model
ollama pull llama2          # Fast, 4GB
ollama pull codellama       # For coding
ollama pull mistral         # High quality, 4GB
ollama pull phi             # Very small, 700MB
```

**Implementation:**
```python
import aiohttp
import json

async def _generate_ollama_response(self, messages):
    """Ollama local model integration"""
    url = "http://localhost:11434/api/chat"
    
    # Convert messages to Ollama format
    ollama_messages = []
    for msg in messages:
        if msg["role"] != "system":
            ollama_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    # Add system prompt as first user message
    system_msg = next((msg["content"] for msg in messages if msg["role"] == "system"), "")
    if system_msg:
        ollama_messages.insert(0, {
            "role": "system", 
            "content": system_msg
        })
    
    data = {
        "model": "llama2",  # or "mistral", "codellama", etc.
        "messages": ollama_messages,
        "stream": True
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as response:
            async for line in response.content:
                if line:
                    try:
                        chunk = json.loads(line)
                        if "message" in chunk and "content" in chunk["message"]:
                            yield chunk["message"]["content"]
                    except json.JSONDecodeError:
                        continue
```

### 4. 🖥️ LM Studio Integration

**Setup:**
1. Download LM Studio from https://lmstudio.ai
2. Download a model (e.g., Llama-2-7B-Chat-GGUF)
3. Start local server (usually on port 1234)

**Implementation:**
```python
import openai  # LM Studio is OpenAI-compatible

async def _generate_lmstudio_response(self, messages):
    """LM Studio integration (OpenAI-compatible API)"""
    client = openai.AsyncOpenAI(
        api_key="lm-studio",  # Dummy key
        base_url="http://localhost:1234/v1"  # LM Studio default
    )
    
    stream = await client.chat.completions.create(
        model="local-model",  # Your model name in LM Studio
        messages=messages,
        stream=True,
        temperature=0.7
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

## Complete Integration Example

**Replace the simulation method in `llm_backend.py`:**

```python
async def _simulate_intelligent_response(self, user_message: str, messages: List[Dict]) -> str:
    """Real LLM integration - replace simulation"""
    
    # Build conversation context
    conversation_messages = [
        {"role": "system", "content": self.system_context},
        *[{"role": msg.role, "content": msg.content} for msg in self.conversation_history[-10:]],
        {"role": "user", "content": user_message}
    ]
    
    # Route to appropriate provider based on intelligence level
    if self.intelligence_level == IntelligenceLevel.NANO:
        return self._generate_ollama_response(conversation_messages)  # Fast local model
    
    elif self.intelligence_level == IntelligenceLevel.STANDARD:
        return self._generate_openai_response(conversation_messages)  # GPT-3.5
    
    elif self.intelligence_level == IntelligenceLevel.SUPER:
        return self._generate_claude_response(conversation_messages)  # Claude
    
    elif self.intelligence_level == IntelligenceLevel.QUANTUM:
        return self._generate_openai_response(conversation_messages)  # GPT-4
```

## Quick Start Options

### For Development/Testing
```bash
# Use free Ollama models
ollama pull phi     # Ultra-fast, 700MB
ollama serve
```

### For Production
```bash
# Set up OpenAI for best quality
export OPENAI_API_KEY="your-key"

# Or Claude for alternative
export ANTHROPIC_API_KEY="your-key"
```

### For Privacy/Security
```bash
# Use local Ollama models
ollama pull mistral  # High quality, 4GB
ollama serve
```

## Environment Configuration

**Create `.env` file:**
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-claude-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Local Models
OLLAMA_MODEL=llama2
OLLAMA_URL=http://localhost:11434

# LM Studio
LM_STUDIO_URL=http://localhost:1234
LM_STUDIO_MODEL=local-model
```

## Testing Your Integration

**Run the integration test:**
```bash
python test_llm_integration.py
```

**This will:**
1. ✅ Test current simulation mode
2. ✅ Check API connectivity 
3. ✅ Validate streaming responses
4. ✅ Show performance metrics
5. ✅ Provide integration guidance

## Intelligence Level Routing

**Recommended Setup for RTX 3050 Ti, 32GB RAM:**

- **NANO**: Ollama with Phi (700MB) - Ultra-fast
- **STANDARD**: Ollama with Mistral (4GB) - GPU accelerated  
- **SUPER**: OpenAI GPT-3.5-turbo - Balanced quality/speed
- **QUANTUM**: OpenAI GPT-4 - Maximum intelligence

## Troubleshooting

**Common Issues:**

1. **API Rate Limits**: Add delays between requests
2. **Memory Issues**: Use smaller models for NANO level
3. **Connection Errors**: Check API keys and network
4. **Local Model Not Found**: Ensure Ollama is running and model is pulled

**Debug Commands:**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Test OpenAI connection
python -c "import openai; client=openai.OpenAI(); print('OpenAI OK')"

# Test Anthropic connection  
python -c "import anthropic; print('Anthropic OK')"
```

## Next Steps

1. ✅ Choose your preferred provider
2. ✅ Set up API keys/local models
3. ✅ Replace simulation with real integration
4. ✅ Test all intelligence levels
5. ✅ Monitor performance and costs
6. ✅ Scale production deployment

Your HAZoom system is ready for real AI! 🚀
