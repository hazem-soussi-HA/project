"""
API Views for LLM HAZoom Integration
WebSocket and HTTP endpoints for real-time AI chat
"""
import json
import asyncio
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from asgiref.sync import async_to_sync, sync_to_async

from django.urls import reverse

from .llm_backend import LLMBackend, IntelligenceLevel, LLMBackendManager
from .system_info import SystemInfoScraper

try:
    from .memory_intelligence import MemoryIntelligence
    MEMORY_INTELLIGENCE_AVAILABLE = True
except ImportError:
    MEMORY_INTELLIGENCE_AVAILABLE = False
    MemoryIntelligence = None

llm_manager = LLMBackendManager()

DEFAULT_USER_IDENTIFIER = 'anonymous'
DEFAULT_SESSION_ID = 'default_session'


def _ensure_session_id(request, provided_session: str | None = None) -> str:
    """Return a valid session id, creating one if needed"""
    session_id = provided_session or request.session.session_key
    if not session_id:
        request.session.save()
        session_id = request.session.session_key
    return session_id or DEFAULT_SESSION_ID


def _resolve_backend(request, payload: dict | None = None):
    """Resolve backend instance, user identifier and session id"""
    payload = payload or {}
    session_candidate = payload.get('session_id') or request.GET.get('session_id')
    session_id = _ensure_session_id(request, session_candidate)

    user_identifier = (
        payload.get('user_identifier')
        or request.GET.get('user_identifier')
        or request.session.get('mcp_user_identifier')
        or DEFAULT_USER_IDENTIFIER
    )

    request.session['mcp_user_identifier'] = user_identifier

    backend = llm_manager.get_backend(user_identifier, session_id)
    return backend, user_identifier, session_id


@csrf_exempt
@require_http_methods(["POST"])
def chat_message(request):
    """
    Handle chat message from frontend
    Returns streaming or complete response
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        backend, user_identifier, session_id = _resolve_backend(request, data)

        user_message = data.get('message', '')
        stream = data.get('stream', True)
        intelligence_level = data.get('intelligence_level', backend.intelligence_level.value)

        if not user_message:
            return JsonResponse({'error': 'No message provided'}, status=400)

        try:
            level = IntelligenceLevel(intelligence_level.lower())
            backend.set_intelligence_level(level)
        except ValueError:
            pass  # Keep current

        backend.add_to_history('user', user_message, metadata={'session_id': session_id})

        if (MEMORY_INTELLIGENCE_AVAILABLE and MemoryIntelligence is not None and 
            hasattr(backend, 'memory_manager') and backend.memory_manager):
            try:
                extracted_memories = MemoryIntelligence.extract_memories_from_text(
                    user_message,
                    user_identifier
                )

                existing_keys = [str(m.key) for m in backend.memory_manager.get_all_memories()]

                for memory in extracted_memories:
                    should_store, _ = MemoryIntelligence.should_store_memory(memory, existing_keys)
                    if should_store:
                        backend.store_memory(
                            key=memory['key'],
                            value=memory['value'],
                            memory_type=memory['memory_type'],
                            importance=memory['importance']
                        )
            except Exception as e:
                print(f"Memory extraction error: {e}")

        if stream:
            return StreamingHttpResponse(
                streaming_response_generator(backend, user_message, session_id),
                content_type='text/event-stream'
            )

        response_text = async_to_sync(backend.generate_response)(user_message)
        backend.add_to_history('assistant', response_text, metadata={'session_id': session_id})

        return JsonResponse({
            'response': response_text,
            'session_id': session_id,
            'user_identifier': user_identifier,
            'intelligence_level': backend.intelligence_level.value,
            'system_stats': backend.get_system_stats()
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def streaming_response_generator(backend: LLMBackend, user_message: str, session_id: str):
    """Generate streaming SSE response"""
    import asyncio
    
    try:
        # Send initial event
        yield f"event: start\ndata: {json.dumps({'status': 'started', 'session_id': session_id})}\n\n"
        
        response_parts = []
        
        # Run async generator in event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            async_gen = backend.generate_response_streaming(user_message)
            while True:
                try:
                    chunk = loop.run_until_complete(async_gen.__anext__())
                    response_parts.append(chunk)
                    yield f"event: token\ndata: {json.dumps({'token': chunk, 'session_id': session_id})}\n\n"
                except StopAsyncIteration:
                    break
        finally:
            loop.close()
        
        # Complete response
        full_response = ''.join(response_parts)
        backend.add_to_history('assistant', full_response, metadata={'session_id': session_id})
        
        # Send completion event
        yield f"event: end\ndata: {json.dumps({'status': 'completed', 'full_response': full_response, 'session_id': session_id})}\n\n"
    
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e), 'session_id': session_id})}\n\n"


@csrf_exempt
@require_http_methods(["GET"])
def system_info(request):
    """Get complete system information"""
    try:
        info = SystemInfoScraper.get_full_system_info()
        return JsonResponse({
            'system_info': info,
            'optimization': SystemInfoScraper.get_optimization_recommendations(),
            'status': 'healthy'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def acceleration_info(request):
    """Get AI acceleration information"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        acceleration = SystemInfoScraper.detect_ai_acceleration()
        optimization = SystemInfoScraper.get_optimization_recommendations()
        
        return JsonResponse({
            'acceleration': acceleration,
            'optimization': optimization,
            'current_backend': backend.optimization['inference_backend'],
            'intelligence_level': backend.intelligence_level.value
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def set_intelligence_level(request):
    """Set AI intelligence level"""
    try:
        data = json.loads(request.body)
        level_str = data.get('level', 'super')
        
        backend, user_identifier, session_id = _resolve_backend(request, data)
        
        level = IntelligenceLevel(level_str.lower())
        backend.set_intelligence_level(level)
        
        return JsonResponse({
            'status': 'success',
            'intelligence_level': backend.intelligence_level.value,
            'message': f'Intelligence level set to {level.value.upper()}'
        })
    
    except ValueError:
        return JsonResponse({
            'error': f'Invalid intelligence level. Choose from: {", ".join(l.value for l in IntelligenceLevel)}'
        }, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def clear_history(request):
    """Clear conversation history"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        backend.clear_history()
        return JsonResponse({
            'status': 'success',
            'message': 'Conversation history cleared'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def chat_stats(request):
    """Get chat statistics and system status"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        stats = backend.get_system_stats()
        return JsonResponse({
            'stats': stats,
            'conversation_length': len(backend.conversation_history),
            'intelligence_level': backend.intelligence_level.value,
            'system_healthy': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def health_check_llm(request):
    """Health check for LLM backend"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        system_info = SystemInfoScraper.get_full_system_info()
        
        return JsonResponse({
            'status': 'healthy',
            'llm_backend': 'operational',
            'intelligence_level': backend.intelligence_level.value,
            'system_info': {
                'cpu_cores': system_info['cpu']['cores_logical'],
                'memory_gb': system_info['memory']['total_gb'],
                'gpu_available': system_info['gpu']['acceleration_available'],
                'acceleration_backend': backend.optimization['inference_backend']
            },
            'ollama_available': backend.ollama_available,
            'ollama_model': backend.ollama_model,
            'message': 'HAZoom LLM Backend is running with super intelligence for peace! 🌊'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def list_models(request):
    """Get list of available Ollama models"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        models = backend.get_available_models()
        
        return JsonResponse({
            'status': 'success',
            'models': models,
            'current_model': backend.ollama_model,
            'ollama_available': backend.ollama_available,
            'count': len(models)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def set_model(request):
    """Set the active Ollama model"""
    try:
        data = json.loads(request.body)
        model_name = data.get('model', '')
        
        if not model_name:
            return JsonResponse({'error': 'Model name is required'}, status=400)
        
        backend, user_identifier, session_id = _resolve_backend(request, data)
        
        if backend.set_model(model_name):
            return JsonResponse({
                'status': 'success',
                'model': model_name,
                'message': f'Model set to {model_name}'
            })
        else:
            return JsonResponse({
                'error': f'Failed to set model {model_name}. Model may not be available.'
            }, status=400)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def pull_model(request):
    """Pull a new model from Ollama"""
    try:
        data = json.loads(request.body)
        model_name = data.get('model', '')
        
        if not model_name:
            return JsonResponse({'error': 'Model name is required'}, status=400)
        
        backend, user_identifier, session_id = _resolve_backend(request, data)
        
        # Start model pull in background thread
        import threading
        def pull_in_background():
            success = backend.pull_model(model_name)
            print(f"Model pull {'completed' if success else 'failed'} for {model_name}")
        
        thread = threading.Thread(target=pull_in_background)
        thread.daemon = True
        thread.start()
        
        return JsonResponse({
            'status': 'started',
            'model': model_name,
            'message': f'Started pulling model {model_name}. This may take several minutes.'
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_model(request):
    """Delete a model from Ollama"""
    try:
        # Get model name from query parameter or request body
        model_name = request.GET.get('model', '')
        if not model_name:
            try:
                data = json.loads(request.body)
                model_name = data.get('model', '')
            except json.JSONDecodeError:
                pass
        
        if not model_name:
            return JsonResponse({'error': 'Model name is required'}, status=400)
        
        backend, user_identifier, session_id = _resolve_backend(request)
        
        if backend.delete_model(model_name):
            return JsonResponse({
                'status': 'success',
                'model': model_name,
                'message': f'Model {model_name} deleted successfully'
            })
        else:
            return JsonResponse({
                'error': f'Failed to delete model {model_name}'
            }, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def model_info(request):
    """Get detailed information about a specific model"""
    try:
        model_name = request.GET.get('model', '')
        if not model_name:
            return JsonResponse({'error': 'Model name is required'}, status=400)
        
        backend, user_identifier, session_id = _resolve_backend(request)
        model_info = backend.get_model_info(model_name)
        
        if model_info:
            return JsonResponse({
                'status': 'success',
                'model': model_name,
                'info': model_info
            })
        else:
            return JsonResponse({
                'error': f'Model {model_name} not found or unavailable'
            }, status=404)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def ollama_status(request):
    """Get comprehensive Ollama status and statistics"""
    try:
        backend, user_identifier, session_id = _resolve_backend(request)
        
        status = {
            'ollama_available': backend.ollama_available,
            'current_model': backend.ollama_model,
            'base_url': backend.ollama_base_url
        }
        
        if backend.ollama_available:
            models = backend.get_available_models()
            status.update({
                'total_models': len(models),
                'models': models,
                'total_size_gb': round(sum(m.get('size', 0) for m in models) / (1024**3), 2)
            })
        
        return JsonResponse({
            'status': 'success',
            'ollama_status': status
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
