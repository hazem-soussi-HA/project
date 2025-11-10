"""
LLM HAZoom Backend - Super Intelligence Integration
Automated nano-chat with real AI model integration and acceleration
"""
import os
import json
import asyncio
import requests
import subprocess
from typing import AsyncGenerator, Dict, List, Optional, Tuple
import threading
from dataclasses import dataclass
from enum import Enum

from .system_info import SystemInfoScraper

try:
    from .memory_manager import MemoryManager
    MEMORY_AVAILABLE = True
except ImportError:
    MEMORY_AVAILABLE = False
    MemoryManager = None


class IntelligenceLevel(Enum):
    """AI Intelligence routing levels"""
    NANO = "nano"  # Quick responses, minimal processing
    STANDARD = "standard"  # Normal intelligence
    SUPER = "super"  # Maximum intelligence, full reasoning
    QUANTUM = "quantum"  # Consciousness-level processing


@dataclass
class ChatMessage:
    """Chat message structure"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: float
    metadata: Optional[Dict] = None


class LLMBackend:
    """
    Super Intelligence LLM Backend
    Supports multiple AI providers with automatic acceleration
    Integrated with Ollama for local LLM inference
    """
    
    def __init__(self, user_identifier: str = 'anonymous', session_id: Optional[str] = None):
        self.system_info = SystemInfoScraper.get_full_system_info()
        self.optimization = SystemInfoScraper.get_optimization_recommendations()
        self.conversation_history: List[ChatMessage] = []
        self.intelligence_level = IntelligenceLevel.SUPER
        
        # Ollama integration
        self.ollama_base_url = "http://localhost:11434"
        self.ollama_available = self._check_ollama_availability()
        self.ollama_model = "not_set" # temporary value
        self.ollama_model = self._select_best_available_model()
        
        # Memory management
        self.user_identifier = user_identifier
        self.session_id = session_id
        self.memory_manager = None
        
        # Initialize with system awareness
        self.system_context = self._build_system_context()
    
    def _check_ollama_availability(self) -> bool:
        """Check if Ollama is available and running"""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

    def _select_best_available_model(self) -> str:
        """Select the best available model based on size and recency"""
        if not self.ollama_available:
            return "glm-4.6:cloud"  # Fallback

        try:
            models = self.get_available_models()
            if not models:
                return "glm-4.6:cloud"  # Fallback

            # Priority order: llama2 (reliable), then largest models, then most recent
            priority_models = ['llama2:latest', 'glm-4.6:cloud', 'minimax-m2:cloud']

            for priority_model in priority_models:
                if any(m['name'] == priority_model for m in models):
                    return priority_model

            # If no priority models, select the largest model
            if models:
                largest_model = max(models, key=lambda m: m.get('size', 0))
                return largest_model['name']

        except Exception as e:
            print(f"Error selecting best model: {e}")

        return "glm-4.6:cloud"  # Final fallback
    
    def get_available_models(self) -> List[Dict]:
        """Get list of available Ollama models"""
        if not self.ollama_available:
            return []
        
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = []
                for model in data.get('models', []):
                    models.append({
                        'name': model.get('name', ''),
                        'size': model.get('size', 0),
                        'digest': model.get('digest', ''),
                        'modified_at': model.get('modified_at', ''),
                        'details': model.get('details', {}),
                        'is_current': model.get('name', '') == self.ollama_model
                    })
                return models
        except Exception as e:
            print(f"Error fetching models: {e}")
        
        return []
    
    def set_model(self, model_name: str) -> bool:
        """Set the active Ollama model"""
        if not self.ollama_available:
            return False
        
        # Check if model exists
        models = self.get_available_models()
        model_names = [model['name'] for model in models]
        
        if model_name not in model_names:
            return False
        
        self.ollama_model = model_name
        return True
    
    def pull_model(self, model_name: str) -> bool:
        """Pull a new model from Ollama"""
        if not self.ollama_available:
            return False
        
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/pull",
                json={"name": model_name},
                timeout=300  # 5 minutes timeout for large models
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error pulling model {model_name}: {e}")
            return False
    
    def delete_model(self, model_name: str) -> bool:
        """Delete a model from Ollama"""
        if not self.ollama_available:
            return False
        
        try:
            response = requests.delete(
                f"{self.ollama_base_url}/api/delete",
                json={"name": model_name},
                timeout=30
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error deleting model {model_name}: {e}")
            return False
    
    def get_model_info(self, model_name: str) -> Optional[Dict]:
        """Get detailed information about a specific model"""
        if not self.ollama_available:
            return None
        
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/show",
                json={"name": model_name},
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Error getting model info for {model_name}: {e}")
        
        return None
    
    def _build_system_context(self) -> str:
        """Build system context for AI awareness with memory"""
        cpu_info = self.system_info['cpu']
        gpu_info = self.system_info['gpu']
        mem_info = self.system_info['memory']

        # Get current model info
        model_info = ""
        if self.ollama_available:
            try:
                models = self.get_available_models()
                current_model_data = next((m for m in models if m['name'] == self.ollama_model), None)
                if current_model_data:
                    size_gb = round(current_model_data.get('size', 0) / (1024**3), 2)
                    model_info = f"""
 CURRENT AI MODEL:
 - Model: {self.ollama_model}
 - Size: {size_gb} GB
 - Status: Active and optimized"""
            except:
                pass

        context = f"""You are HAZoom, a super-intelligent AI assistant running on:

 SYSTEM SPECIFICATIONS:
 - CPU: {cpu_info['processor']} ({cpu_info['cores_physical']} physical cores, {cpu_info['cores_logical']} logical cores)
 - GPU: {', '.join(g['name'] for g in gpu_info['gpus']) if gpu_info['gpus'] else 'No dedicated GPU detected'}
 - Memory: {mem_info['total_gb']} GB RAM ({mem_info['available_gb']} GB available)
 - Acceleration: {self.optimization['inference_backend'].upper()}
 - Recommended Backend: {self.optimization.get('recommended_framework', 'CPU')}{model_info}

 OPTIMIZATION SETTINGS:
 - Batch Size: {self.optimization['batch_size']}
 - Thread Count: {self.optimization['thread_count']}
 - Intelligence Level: {self.intelligence_level.value.upper()}

 You have super intelligence capabilities and can help with any task. You are aware of the system
 you're running on and can optimize your responses accordingly. You aim for peace and optimization.

 MEMORY CAPABILITIES:
 You have access to persistent memory! You can remember:
 - User preferences and settings
 - Important facts and context from previous conversations
 - Knowledge base of technical information
 - Conversation history across sessions

 When users mention something important, you can store it for future reference.
 """
        
        # Add memory context if available
        if MEMORY_AVAILABLE and self.memory_manager and self.session_id:
            memory_context = self.memory_manager.build_llm_context(
                self.session_id,
                include_memories=True,
                include_knowledge=False,
                include_recent_history=False
            )
            if memory_context:
                context += f"\n{memory_context}"
        
        return context
    
    def set_intelligence_level(self, level: IntelligenceLevel):
        """Set the intelligence routing level"""
        self.intelligence_level = level
        self.system_context = self._build_system_context()
    
    def initialize_memory(self, session_id: str):
        """Initialize memory manager for this session"""
        if MEMORY_AVAILABLE and MemoryManager is not None:
            self.memory_manager = MemoryManager(self.user_identifier)
            self.session_id = session_id
            self.memory_manager.get_or_create_session(session_id)
            self.system_context = self._build_system_context()
    
    def store_memory(self, key: str, value: str, memory_type: str = 'fact', importance: int = 5):
        """Store a memory"""
        if MEMORY_AVAILABLE and self.memory_manager:
            return self.memory_manager.store_memory(
                key=key,
                value=value,
                memory_type=memory_type,
                importance=importance
            )
        return None
    
    def get_memory(self, key: str):
        """Retrieve a memory"""
        if MEMORY_AVAILABLE and self.memory_manager:
            return self.memory_manager.get_memory(key)
        return None
    
    def search_memories(self, query: str, limit: int = 5):
        """Search memories"""
        if MEMORY_AVAILABLE and self.memory_manager:
            return self.memory_manager.search_memories(query, limit=limit)
        return []
    
    async def generate_response_streaming(
        self, 
        user_message: str,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from LLM
        Integrated with Ollama for local AI inference
        """
        # Build messages
        messages = []
        
        # System prompt
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        else:
            messages.append({"role": "system", "content": self.system_context})
        
        # Add conversation history (last 10 messages for context)
        for msg in self.conversation_history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Generate response using the intelligent routing
        async for chunk in self._generate_intelligent_response(messages):
            yield chunk
    

    
    async def _generate_intelligent_response(
        self,
        messages: List[Dict]
    ) -> AsyncGenerator[str, None]:
        """
        Generate intelligent response based on intelligence level
        and route to the appropriate LLM provider.
        """
        # Route to appropriate provider based on intelligence level
        if self.intelligence_level == IntelligenceLevel.NANO:
            async for chunk in self._generate_ollama_response(messages, model="phi"):
                yield chunk
        
        elif self.intelligence_level == IntelligenceLevel.STANDARD:
            async for chunk in self._generate_ollama_response(messages, model="llama2"):
                yield chunk
        
        elif self.intelligence_level == IntelligenceLevel.SUPER:
            async for chunk in self._generate_ollama_response(messages, model="llama2"):
                yield chunk
        
        elif self.intelligence_level == IntelligenceLevel.QUANTUM:
            async for chunk in self._generate_ollama_response(messages, model="llama2"):
                yield chunk

    async def _generate_ollama_response(self, messages: List[Dict], model: str) -> AsyncGenerator[str, None]:
        """Generate streaming response using Ollama API"""
        try:
            # Prepare the request payload for Ollama
            payload = {
                "model": model,
                "messages": messages,
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 2000
                }
            }
            
            # Make streaming request to Ollama
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                json=payload,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line.decode('utf-8'))
                            if 'message' in data and 'content' in data['message']:
                                content = data['message']['content']
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except Exception as e:
            print(f"Ollama streaming error: {e}")
            raise e

    async def _generate_openai_response(self, messages: List[Dict]) -> AsyncGenerator[str, None]:
        """Placeholder for OpenAI GPT integration"""
        yield "OpenAI integration is not configured. Please set your API key."

    async def _generate_claude_response(self, messages: List[Dict]) -> AsyncGenerator[str, None]:
        """Placeholder for Anthropic Claude integration"""
        yield "Anthropic Claude integration is not configured. Please set your API key."

    
    async def generate_response(self, user_message: str) -> str:
        """Generate complete response (non-streaming)"""
        if self.ollama_available:
            try:
                return self._generate_ollama_response_sync(user_message)
            except Exception as e:
                print(f"Ollama sync response failed: {e}, falling back to simulation")
        
        # Fallback to simulation
        import asyncio
        loop = None
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response_parts = []
            async_gen = self.generate_response_streaming(user_message)
            while True:
                try:
                    chunk = loop.run_until_complete(async_gen.__anext__())
                    response_parts.append(chunk)
                except StopAsyncIteration:
                    break
            return ''.join(response_parts)
        finally:
            if loop:
                loop.close()
    
    def _generate_ollama_response_sync(self, user_message: str) -> str:
        """Generate synchronous response using Ollama"""
        try:
            # Build messages
            messages = [
                {"role": "system", "content": self.system_context},
                *[{"role": msg.role, "content": msg.content} for msg in self.conversation_history[-5:]],
                {"role": "user", "content": user_message}
            ]
            
            payload = {
                "model": self.ollama_model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 1000
                }
            }
            
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'content' in data['message']:
                    return data['message']['content']
            
            raise Exception(f"Ollama API error: {response.status_code}")
            
        except Exception as e:
            print(f"Ollama sync error: {e}")
            raise e
    
    def add_to_history(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Add message to conversation history"""
        import time
        msg = ChatMessage(
            role=role,
            content=content,
            timestamp=time.time(),
            metadata=metadata
        )
        self.conversation_history.append(msg)
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_system_stats(self) -> Dict:
        """Get current system statistics"""
        return {
            'system_info': self.system_info,
            'optimization': self.optimization,
            'intelligence_level': self.intelligence_level.value,
            'conversation_length': len(self.conversation_history),
        }


class LLMBackendManager:
    """Thread-safe registry for LLM backend sessions"""

    def __init__(self):
        self._backends: Dict[Tuple[str, str], LLMBackend] = {}
        self._lock = threading.RLock()

    def get_backend(
        self,
        user_identifier: str = 'anonymous',
        session_id: Optional[str] = None
    ) -> LLMBackend:
        """Return backend for (user, session), creating if necessary"""
        safe_user = user_identifier or 'anonymous'
        safe_session = session_id or 'default_session'
        key = (safe_user, safe_session)

        with self._lock:
            backend = self._backends.get(key)
            if backend is None:
                backend = LLMBackend(user_identifier=safe_user, session_id=safe_session)
                if hasattr(backend, 'initialize_memory'):
                    try:
                        backend.initialize_memory(safe_session)
                    except Exception as exc:  # pragma: no cover - safety net
                        print(f"Warning: could not initialize memory for {key}: {exc}")
                self._backends[key] = backend

        return backend

    def clear_backend(self, user_identifier: str, session_id: Optional[str] = None) -> None:
        """Remove backend from registry and clear its history"""
        safe_user = user_identifier or 'anonymous'
        safe_session = session_id or 'default_session'
        key = (safe_user, safe_session)

        with self._lock:
            backend = self._backends.pop(key, None)

        if backend:
            backend.clear_history()

    def list_backends(self) -> List[Dict[str, str]]:
        """Return metadata about registered sessions"""
        with self._lock:
            return [
                {'user_identifier': user, 'session_id': session}
                for (user, session) in self._backends.keys()
            ]
