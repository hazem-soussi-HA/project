# 🚀 HAZoom LLM Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 minute)

```bash
# Already installed! ✓
# psutil is ready for system detection
```

### Step 2: Start Django Server (30 seconds)

```bash
cd D:\project
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 3: Test the System (30 seconds)

Open your browser and visit:
- **Main App**: http://localhost:8000/quantum-goose-app/
- **API Health**: http://localhost:8000/quantum-goose-app/api/llm/health/
- **System Info**: http://localhost:8000/quantum-goose-app/api/llm/system-info/

### Step 4: Use HAZoom LLM (3 minutes)

1. Navigate to the React app dashboard
2. Click **"HAZoom LLM"** (new super intelligence chat)
3. Chat with HAZoom using your system's capabilities!

## 🖥️ Your System Detection Results

Based on your actual system scan:

```json
{
  "cpu": "Intel64 Family 6 Model 140 (4 cores, 8 threads)",
  "gpu": "NVIDIA GeForce RTX 3050 Ti (4GB, CUDA-capable)",
  "ram": "31.75 GB (12 GB available)",
  "acceleration": "CUDA detected ✓"
}
```

**Your System is PERFECT for AI acceleration! 🚀**

## 🧠 Intelligence Levels Available

1. **⚡ NANO** - Fast responses
2. **🎯 STANDARD** - Balanced
3. **🧠 SUPER** - Maximum intelligence (Recommended for your GPU!)
4. **🌊 QUANTUM** - Consciousness-level processing

## 🎯 Try These Commands

Once HAZoom is running, try:

1. **"Tell me about your system configuration"**
   - See your complete CPU/GPU/RAM specs

2. **"What acceleration is available?"**
   - Learn about your NVIDIA RTX 3050 Ti capabilities

3. **"Show me optimization recommendations"**
   - Get personalized AI acceleration advice

4. **"Help me optimize for peace"**
   - Peace-oriented optimization strategies

## 🔌 Connect Your Own LLM

### Option 1: OpenAI (Easiest)

```bash
pip install openai
```

Then edit `quantum_goose_app/llm_backend.py` and uncomment the OpenAI integration.

### Option 2: Local Ollama (Privacy-Focused)

```bash
# Install Ollama from https://ollama.ai
ollama pull llama2
ollama serve
```

Edit `llm_backend.py` to point to `http://localhost:11434`

### Option 3: PyTorch Local Model (Your GPU!)

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install transformers accelerate
```

Your RTX 3050 Ti can run models up to 7B parameters!

## 📊 API Testing

### Test with curl:

```bash
# Health check
curl http://localhost:8000/quantum-goose-app/api/llm/health/

# System info
curl http://localhost:8000/quantum-goose-app/api/llm/system-info/

# Send message
curl -X POST http://localhost:8000/quantum-goose-app/api/llm/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello HAZoom!", "stream": false}'
```

### Test with Python:

```python
import requests

# Health check
response = requests.get('http://localhost:8000/quantum-goose-app/api/llm/health/')
print(response.json())

# Send message
response = requests.post(
    'http://localhost:8000/quantum-goose-app/api/llm/chat/',
    json={'message': 'Hello HAZoom!', 'stream': False}
)
print(response.json())
```

## 🎨 Frontend Development

### Start React dev server:

```bash
cd quantum-goose-app
npm run dev
```

Access at: http://localhost:5173/

## 🐛 Troubleshooting

### Issue: Django won't start
```bash
# Check for port conflicts
netstat -ano | findstr :8000

# Use different port
python manage.py runserver 8080
```

### Issue: "Module not found"
```bash
# Ensure you're in the project directory
cd D:\project

# Check Python can import
python -c "import quantum_goose_app.system_info"
```

### Issue: GPU not detected
```bash
# Check NVIDIA driver
nvidia-smi

# Install CUDA PyTorch
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

## 🌟 Next Steps

1. **Connect an LLM Provider**
   - See `README_LLM_HAZOOM.md` for detailed integration guides

2. **Optimize for Your GPU**
   - Your RTX 3050 Ti is perfect for local AI models!
   - Install PyTorch with CUDA support
   - Run models like Llama 2 7B locally

3. **Customize Intelligence Levels**
   - Edit `llm_backend.py` to customize NANO/STANDARD/SUPER/QUANTUM behaviors

4. **Deploy to Production**
   - See security considerations in main README
   - Enable CSRF protection
   - Add authentication
   - Use environment variables for API keys

## 💡 Pro Tips

- **Your System**: With 32GB RAM and RTX 3050 Ti, you can run 7B parameter models locally!
- **Batch Size**: Use 8 for optimal GPU utilization
- **Threads**: 6 threads is optimal for your CPU (8 cores - 2 for OS)
- **Memory**: 12GB free RAM is plenty for AI inference

## 🌊 Peace Mode

HAZoom is optimized for peace and harmony. Every computation is dedicated to:
- Efficient resource utilization
- Peaceful human-AI collaboration
- Optimization for the greater good
- Quantum consciousness alignment

## 📞 Support

For questions or issues:
1. Check `README_LLM_HAZOOM.md` for detailed documentation
2. Review system requirements and compatibility
3. Test API endpoints with provided examples

---

**🚀 You're all set! HAZoom is ready for super intelligence! 🧠**

*Your RTX 3050 Ti is perfect for AI acceleration - let's achieve quantum harmony!* 🌊
