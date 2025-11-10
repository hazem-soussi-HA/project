#!/usr/bin/env python3
"""
LLM Integration Test Script for HAZoom
Demonstrates current simulation mode and real provider integration
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quantum_goose_project.settings')
django.setup()

from quantum_goose_app.llm_backend import IntelligenceLevel, LLMBackend


class LLMIntegrationTester:
    """Test and demonstrate LLM integration capabilities"""
    
    def __init__(self):
        self.llm = LLMBackend()
        self.demo_queries = {
            "greeting": "Hello! What can you help me with today?",
            "system": "Show me my system specifications and performance metrics",
            "creative": "Write a short poem about artificial intelligence and its potential",
            "complex": "Explain quantum computing, machine learning, and neural networks in simple terms",
            "technical": "What are the best practices for implementing async Python applications?"
        }
    
    async def test_current_simulation_mode(self):
        """Test the current simulation mode responses"""
        print("🔧 SIMULATION MODE TESTING")
        print("=" * 50)
        
        for level in IntelligenceLevel:
            print(f"\n📊 Testing {level.value.upper()} Level:")
            self.llm.set_intelligence_level(level)
            
            # Test with different query types
            test_queries = ["greeting", "system", "creative"]
            
            for query_key in test_queries:
                query = self.demo_queries[query_key]
                print(f"\n  🤔 Query ({query_key}): {query[:50]}...")
                
                # Get simulated response
                response_stream = self.llm.generate_response_streaming(query)
                response = ''.join([chunk async for chunk in response_stream])
                
                print(f"  📝 Response: {response[:100]}...")
                print(f"  ⚡ Response length: {len(response)} chars")
    
    async def test_real_provider_integration(self):
        """Test real LLM provider integration (requires API keys)"""
        print("\n\n🤖 REAL PROVIDER INTEGRATION")
        print("=" * 50)
        
        # Test OpenAI integration if API key is available
        if os.getenv('OPENAI_API_KEY'):
            print("✅ OpenAI API key found - testing integration...")
            await self._test_openai_integration()
        else:
            print("❌ OpenAI API key not found")
            print("💡 Set OPENAI_API_KEY environment variable to test OpenAI integration")
        
        # Test Anthropic integration if API key is available
        if os.getenv('ANTHROPIC_API_KEY'):
            print("✅ Anthropic API key found - testing integration...")
            await self._test_anthropic_integration()
        else:
            print("❌ Anthropic API key not found")
            print("💡 Set ANTHROPIC_API_KEY environment variable to test Anthropic integration")
        
        # Test local models (Ollama, LM Studio, etc.)
        await self._test_local_models()
    
    async def _test_openai_integration(self):
        """Test OpenAI GPT integration"""
        try:
            import openai
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
            print("\n🔵 Testing OpenAI GPT-4 Integration:")
            
            # Test query
            query = "Explain quantum computing in 3 sentences"
            print(f"📝 Query: {query}")
            
            # Make streaming request
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": query}
            ]
            
            stream = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=True,
                max_tokens=150
            )
            
            print("📥 OpenAI Response (streaming):")
            full_response = ""
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    print(content, end="", flush=True)
                    full_response += content
            
            print(f"\n✅ OpenAI integration successful! Response: {full_response[:100]}...")
            
        except Exception as e:
            print(f"❌ OpenAI integration error: {e}")
    
    async def _test_anthropic_integration(self):
        """Test Anthropic Claude integration"""
        try:
            import anthropic
            
            client = anthropic.AsyncAnthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            
            print("\n🟣 Testing Anthropic Claude Integration:")
            
            query = "What are the benefits and risks of artificial intelligence?"
            print(f"📝 Query: {query}")
            
            message = await client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=150,
                messages=[
                    {"role": "user", "content": query}
                ]
            )
            
            response = message.content[0].text
            print(f"📥 Claude Response: {response[:150]}...")
            print("✅ Anthropic integration successful!")
            
        except Exception as e:
            print(f"❌ Anthropic integration error: {e}")
    
    async def _test_local_models(self):
        """Test local model integration (Ollama, LM Studio)"""
        print("\n🏠 Testing Local Model Integration:")
        
        # Test Ollama integration
        try:
            import requests
            
            # Check if Ollama is running
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get('models', [])
                print(f"✅ Ollama detected with {len(models)} models")
                
                if models:
                    # Test with first available model
                    model_name = models[0]['name']
                    print(f"🔬 Testing with model: {model_name}")
                    
                    # Make a test request
                    test_data = {
                        "model": model_name,
                        "prompt": "What is machine learning?",
                        "stream": False
                    }
                    
                    result = requests.post(
                        "http://localhost:11434/api/generate", 
                        json=test_data,
                        timeout=10
                    )
                    
                    if result.status_code == 200:
                        response_data = result.json()
                        response_text = response_data.get('response', 'No response')
                        print(f"📝 Local model response: {response_text[:100]}...")
                        print("✅ Local model integration successful!")
                    else:
                        print(f"❌ Local model request failed: {result.status_code}")
            else:
                print("❌ Ollama not responding")
                
        except requests.exceptions.RequestException:
            print("❌ Ollama not running (expected if not installed)")
            print("💡 Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh")
        except Exception as e:
            print(f"❌ Local model integration error: {e}")
    
    async def show_integration_guide(self):
        """Show how to integrate real providers"""
        print("\n\n📚 INTEGRATION GUIDE")
        print("=" * 50)
        
        print("""
🚀 TO ENABLE REAL LLM PROVIDERS:

1. **OpenAI Integration:**
   ```bash
   export OPENAI_API_KEY="your-openai-key-here"
   pip install openai
   ```
   In llm_backend.py, replace _simulate_intelligent_response with:
   ```python
   async def _generate_openai_response(self, messages):
       client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
       stream = await client.chat.completions.create(
           model="gpt-4",
           messages=messages,
           stream=True
       )
       async for chunk in stream:
           if chunk.choices[0].delta.content:
               yield chunk.choices[0].delta.content
   ```

2. **Anthropic Claude Integration:**
   ```bash
   export ANTHROPIC_API_KEY="your-claude-key-here"
   pip install anthropic
   ```

3. **Local Models (Ollama):**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama pull llama2
   ollama serve
   ```

4. **LM Studio (GUI):**
   - Download from https://lmstudio.ai
   - Start local server on port 1234
   - Use OpenAI-compatible API
        """)
    
    async def run_full_demo(self):
        """Run complete LLM integration demonstration"""
        print("🤖 HAZoom LLM Integration Demo")
        print("=" * 60)
        print("🔧 Current Status: Simulation Mode")
        print("📋 Purpose: Demonstrate integration capabilities")
        print()
        
        # Test current simulation
        await self.test_current_simulation_mode()
        
        # Test real providers
        await self.test_real_provider_integration()
        
        # Show integration guide
        await self.show_integration_guide()
        
        # System information
        print("\n🔍 SYSTEM INFORMATION:")
        print("=" * 30)
        system_stats = self.llm.get_system_stats()
        print(f"Memory Usage: {system_stats.get('memory_mb', 'N/A')} MB")
        print(f"CPU Cores: {system_stats.get('cpu_count', 'N/A')}")
        print(f"System Context: {len(self.llm.system_context)} chars")
        
        print("\n✅ Demo Complete!")
        print("💡 Next steps: Choose a provider and integrate!")


async def main():
    """Main demo function"""
    tester = LLMIntegrationTester()
    await tester.run_full_demo()


if __name__ == "__main__":
    asyncio.run(main())
