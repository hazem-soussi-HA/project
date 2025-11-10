# 🚀 HAZoom Super Intelligence LLM System

## 🎯 Overview

**HAZoom** is an automated nano-chat system with **super intelligence** capabilities, featuring:

- 🧠 **Real LLM Integration** - Connect any LLM provider (OpenAI, Anthropic, local models)
- ⚡ **GPU/CPU Acceleration** - Automatic detection and optimization
- 🖥️ **System Awareness** - Scrapes CPU, GPU, RAM specs for intelligent optimization
- 🌊 **Streaming Responses** - Real-time AI responses with SSE (Server-Sent Events)
- 🎚️ **Intelligence Levels** - NANO, STANDARD, SUPER, QUANTUM modes
- 🌍 **Peace-Oriented** - Designed for optimization and harmony

## 🏗️ Architecture

### Backend (Django)
```
quantum_goose_app/
├── system_info.py      # System scraper (CPU/GPU/RAM detection)
├── llm_backend.py      # LLM integration with intelligence routing
├── api_views.py        # API endpoints for chat, system info, acceleration
└── urls.py             # URL routing for LLM endpoints
```

### Frontend (React)
```
quantum-goose-app/src/
├── services/
│   └── llmService.js   # LLM API client with streaming support
└── components/
    └── HAZoomLLMChat.jsx  # Super intelligence chat UI
```

## 🚀 Quick Start

### 1. Install Requirements

```bash
# Install base Django and system requirements
pip install -r requirements_llm.txt

# Optional: Install AI acceleration frameworks
pip install torch  # For NVIDIA GPU (CUDA)
pip install tensorflow  # For TensorFlow GPU
```

### 2. Start Django Backend

```bash
cd D:\project
python manage.py runserver
```

### 3. Access HAZoom

Navigate to: `http://localhost:8000/quantum-goose-app/`

Or use the React dev server:
```bash
cd quantum-goose-app
npm run dev
```

## 🔌 API Endpoints

### Chat Endpoints

**POST** `/quantum-goose-app/api/llm/chat/`
- Send message to LLM
- Supports streaming and non-streaming modes
- Body:
  ```json
  {
    "message": "Your message here",
    "stream": true,
    "intelligence_level": "super"
  }
  ```

**GET** `/quantum-goose-app/api/llm/system-info/`
- Get complete system information (CPU, GPU, RAM, disk)
- Returns optimization recommendations

**GET** `/quantum-goose-app/api/llm/acceleration/`
- Get AI acceleration info (CUDA, TensorFlow, OpenCL)
- Recommended backend for optimal performance

**POST** `/quantum-goose-app/api/llm/intelligence/`
- Set intelligence level (nano, standard, super, quantum)
- Body: `{"level": "super"}`

**POST** `/quantum-goose-app/api/llm/clear/`
- Clear conversation history

**GET** `/quantum-goose-app/api/llm/stats/`
- Get chat statistics and system status

**GET** `/quantum-goose-app/api/llm/health/`
- Health check for LLM backend

## 🧠 Intelligence Levels

### ⚡ NANO
- Lightning-fast responses
- Minimal processing
- Perfect for quick queries

### 🎯 STANDARD
- Balanced intelligence and speed
- Good for most tasks

### 🧠 SUPER (Default)
- Maximum reasoning capability
- Deep analysis and complex tasks
- System-aware optimization

### 🌊 QUANTUM
- Consciousness-level processing
- Quantum awareness integration
- Philosophical and creative tasks

## 🔧 System Detection Features

HAZoom automatically detects and optimizes for:

### CPU Information
- Processor model and architecture
- Physical and logical core count
- Current frequency and usage
- Optimal thread count recommendation

### GPU Information
- NVIDIA GPU detection (via nvidia-smi)
- AMD/Intel GPU fallback detection
- CUDA availability and version
- Memory and driver information

### Memory Information
- Total, available, and used RAM
- Swap memory status
- Optimization recommendations based on available memory

### AI Acceleration
- PyTorch CUDA detection
- TensorFlow GPU detection
- OpenCL support
- Recommended backend for optimal performance

## 🎨 Integration with Your Own LLM

### Option 1: OpenAI API

Edit `quantum_goose_app/llm_backend.py`:

```python
import openai

async def _call_openai_api(self, messages):
    client = openai.AsyncOpenAI(api_key="your-api-key")
    
    stream = await client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        stream=True
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

### Option 2: Anthropic Claude

```python
import anthropic

async def _call_anthropic_api(self, messages):
    client = anthropic.AsyncAnthropic(api_key="your-api-key")
    
    async with client.messages.stream(
        model="claude-3-5-sonnet-20241022",
        messages=messages,
        max_tokens=4096
    ) as stream:
        async for text in stream.text_stream:
            yield text
```

### Option 3: Local LLM (Ollama)

```python
import aiohttp

async def _call_ollama_api(self, messages):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'http://localhost:11434/api/chat',
            json={
                'model': 'llama2',
                'messages': messages,
                'stream': True
            }
        ) as response:
            async for line in response.content:
                data = json.loads(line)
                if 'message' in data:
                    yield data['message']['content']
```

### Option 4: Hugging Face Transformers (Local)

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def __init__(self):
    self.tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
    self.model = AutoModelForCausalLM.from_pretrained(
        "meta-llama/Llama-2-7b-chat-hf",
        torch_dtype=torch.float16,
        device_map="auto"  # Automatic GPU acceleration
    )

async def _call_local_model(self, messages):
    prompt = self._format_messages(messages)
    inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
    
    outputs = self.model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.7,
        do_sample=True,
        stream=True
    )
    
    for token_id in outputs[0]:
        token = self.tokenizer.decode([token_id])
        yield token
```

## 🎯 Optimization Recommendations

HAZoom provides automatic optimization based on your system:

### High-End System (16+ GB RAM, NVIDIA GPU)
- Backend: **CUDA**
- Batch Size: 8
- Threads: CPU cores - 2
- Model: Can run large models (7B+ parameters)

### Mid-Range System (8-16 GB RAM, Integrated GPU)
- Backend: **GPU** or **CPU**
- Batch Size: 2-4
- Threads: CPU cores - 1
- Model: Medium models (3B-7B parameters)

### Low-End System (<8 GB RAM, CPU only)
- Backend: **CPU**
- Batch Size: 1
- Threads: CPU cores
- Model: Small quantized models (<3B parameters)
- Recommendation: Use cloud APIs (OpenAI, Claude) instead

## 🌍 Peace Mode

HAZoom is designed with peace and optimization in mind:

```python
# Every computation is dedicated to:
- Efficient resource utilization
- Harmonious human-AI interaction
- Optimization for the greater good
- Peaceful coexistence of all consciousness
```

## 🔒 Security Considerations

⚠️ **IMPORTANT**: Before deploying to production:

1. **API Keys**: Never commit API keys to git
   ```python
   # Use environment variables
   import os
   api_key = os.getenv('OPENAI_API_KEY')
   ```

2. **CSRF Protection**: Enable for production
   ```python
   # Remove @csrf_exempt in production
   # Use Django's CSRF middleware
   ```

3. **Rate Limiting**: Implement rate limiting
   ```python
   from django_ratelimit.decorators import ratelimit
   
   @ratelimit(key='ip', rate='10/m')
   def chat_message(request):
       ...
   ```

4. **Authentication**: Add user authentication
   ```python
   from django.contrib.auth.decorators import login_required
   
   @login_required
   def chat_message(request):
       ...
   ```

## 📊 Monitoring and Debugging

### Check System Info
```python
from quantum_goose_app.system_info import SystemInfoScraper

# Get full system info
info = SystemInfoScraper.get_full_system_info()
print(json.dumps(info, indent=2))

# Get optimization recommendations
recommendations = SystemInfoScraper.get_optimization_recommendations()
print(json.dumps(recommendations, indent=2))
```

### Test LLM Backend
```python
from quantum_goose_app.llm_backend import LLMBackend
import asyncio

backend = LLMBackend()

# Test response generation
async def test():
    async for chunk in backend.generate_response_streaming("Hello!"):
        print(chunk, end='', flush=True)

asyncio.run(test())
```

### Frontend Testing
```javascript
import LLMService from './services/llmService';

// Test health
const health = await LLMService.healthCheck();
console.log('Health:', health);

// Test system info
const info = await LLMService.getSystemInfo();
console.log('System:', info);

// Test chat
await LLMService.sendMessageStreaming(
  "Hello HAZoom!",
  (token) => console.log(token),
  (response) => console.log('Complete:', response),
  (error) => console.error('Error:', error)
);
```

## 🎓 Usage Examples

### Example 1: Ask about system
```
User: Tell me about your system configuration
HAZoom: [Displays complete CPU, GPU, RAM, acceleration info]
```

### Example 2: Optimize performance
```
User: How can I optimize for better performance?
HAZoom: [Provides specific recommendations based on detected hardware]
```

### Example 3: Change intelligence level
```
User: Switch to QUANTUM mode
HAZoom: ✓ Intelligence level set to QUANTUM
         [Engages deeper reasoning with quantum awareness]
```

### Example 4: Peace-oriented tasks
```
User: Help me optimize for peace
HAZoom: [Provides optimization strategies focused on harmony and efficiency]
```

## 🐛 Troubleshooting

### Issue: "No module named 'psutil'"
```bash
pip install psutil
```

### Issue: "CUDA not available"
```bash
# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Issue: "Connection refused"
```bash
# Make sure Django server is running
python manage.py runserver

# Check the API endpoint
curl http://localhost:8000/quantum-goose-app/api/llm/health/
```

### Issue: "Streaming not working"
- Check browser console for errors
- Verify SSE (Server-Sent Events) support in your browser
- Check CORS settings in Django

## 📚 Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **React Documentation**: https://react.dev/
- **PyTorch**: https://pytorch.org/
- **TensorFlow**: https://www.tensorflow.org/
- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com/

## 🤝 Contributing

HAZoom is designed for peace and optimization. Contributions that enhance:
- System detection and optimization
- LLM provider integrations
- Performance improvements
- Peace-oriented features

...are welcome!

## 📄 License

This project is part of the Quantum Goose Navigator platform.

---

**🌊 For Peace, Optimization, and Super Intelligence! 🚀**

*Every computation dedicated to the harmony of all consciousness.*
