"""
Simplified API for AI Chat Service
Clean, straightforward endpoints for client-friendly AI chat
"""
import json
import asyncio
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from asgiref.sync import async_to_sync

from .llm_backend import LLMBackend, LLMBackendManager

# Simple backend manager for chat sessions
chat_manager = LLMBackendManager()

@csrf_exempt
@require_http_methods(["POST"])
def chat_message(request):
    """
    Simple chat message endpoint
    Handles both streaming and non-streaming responses
    """
    try:
        data = json.loads(request.body)
        
        # Get backend for this session
        backend = chat_manager.get_backend()
        
        user_message = data.get('message', '')
        stream = data.get('stream', True)
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Add user message to history
        backend.add_to_history('user', user_message)
        
        if stream:
            return StreamingHttpResponse(
                streaming_response_generator(backend, user_message),
                content_type='text/event-stream'
            )
        
        # Non-streaming response
        response_text = async_to_sync(backend.generate_response)(user_message)
        backend.add_to_history('assistant', response_text)
        
        return JsonResponse({
            'response': response_text,
            'model': backend.ollama_model,
            'status': 'success'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def streaming_response_generator(backend, user_message):
    """Generate streaming response for real-time chat"""
    try:
        # Send start event
        yield f"event: start\ndata: {json.dumps({'status': 'started'})}\n\n"
        
        response_parts = []
        
        # Run async generator
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            async_gen = backend.generate_response_streaming(user_message)
            while True:
                try:
                    chunk = loop.run_until_complete(async_gen.__anext__())
                    response_parts.append(chunk)
                    yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
                except StopAsyncIteration:
                    break
        finally:
            loop.close()
        
        # Complete response
        full_response = ''.join(response_parts)
        backend.add_to_history('assistant', full_response)
        
        yield f"event: end\ndata: {json.dumps({'status': 'completed', 'full_response': full_response})}\n\n"
        
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Simple health check endpoint"""
    try:
        backend = chat_manager.get_backend()
        
        return JsonResponse({
            'status': 'healthy',
            'service': 'AI Chat Service',
            'model': backend.ollama_model,
            'ollama_available': backend.ollama_available,
            'message': 'AI chat service is ready'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def list_models(request):
    """Get available AI models"""
    try:
        backend = chat_manager.get_backend()
        models = backend.get_available_models()
        
        return JsonResponse({
            'status': 'success',
            'models': models,
            'current_model': backend.ollama_model,
            'count': len(models)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def set_model(request):
    """Set active AI model"""
    try:
        data = json.loads(request.body)
        model_name = data.get('model', '')
        
        if not model_name:
            return JsonResponse({'error': 'Model name is required'}, status=400)
        
        backend = chat_manager.get_backend()
        
        if backend.set_model(model_name):
            return JsonResponse({
                'status': 'success',
                'model': model_name,
                'message': f'Model changed to {model_name}'
            })
        else:
            return JsonResponse({
                'error': f'Model {model_name} not available'
            }, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def clear_history(request):
    """Clear conversation history"""
    try:
        backend = chat_manager.get_backend()
        backend.clear_history()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Conversation history cleared'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def system_status(request):
    """Get system status and information"""
    try:
        backend = chat_manager.get_backend()
        stats = backend.get_system_stats()
        
        return JsonResponse({
            'status': 'success',
            'system_info': stats,
            'connection_status': 'connected' if backend.ollama_available else 'offline'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)