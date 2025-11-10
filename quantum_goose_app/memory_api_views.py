"""
API endpoints for HAZoom Memory Management
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .memory_manager import MemoryManager
from .models import Memory, KnowledgeBase


@csrf_exempt
@require_http_methods(["POST"])
def store_memory(request):
    """Store a new memory"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_identifier', 'anonymous')
        key = data.get('key')
        value = data.get('value')
        memory_type = data.get('memory_type', 'fact')
        importance = data.get('importance', 5)
        tags = data.get('tags', [])
        description = data.get('description', '')
        
        if not key or not value:
            return JsonResponse({'error': 'Key and value are required'}, status=400)
        
        manager = MemoryManager(user_id)
        memory = manager.store_memory(
            key=key,
            value=value,
            memory_type=memory_type,
            importance=importance,
            tags=tags,
            description=description
        )
        
        return JsonResponse({
            'status': 'success',
            'memory': {
                'id': memory.id,
                'key': memory.key,
                'value': memory.value,
                'memory_type': memory.memory_type,
                'importance': memory.importance,
                'tags': memory.tags,
                'created_at': memory.created_at.isoformat()
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_memory(request):
    """Get a specific memory"""
    try:
        user_id = request.GET.get('user_identifier', 'anonymous')
        key = request.GET.get('key')
        
        if not key:
            return JsonResponse({'error': 'Key is required'}, status=400)
        
        manager = MemoryManager(user_id)
        memory = manager.get_memory(key)
        
        if not memory:
            return JsonResponse({'error': 'Memory not found'}, status=404)
        
        return JsonResponse({
            'memory': {
                'id': memory.id,
                'key': memory.key,
                'value': memory.value,
                'memory_type': memory.memory_type,
                'importance': memory.importance,
                'tags': memory.tags,
                'description': memory.description,
                'access_count': memory.access_count,
                'last_accessed': memory.last_accessed.isoformat() if memory.last_accessed else None,
                'created_at': memory.created_at.isoformat(),
                'updated_at': memory.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def search_memories(request):
    """Search memories"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_identifier', 'anonymous')
        query = data.get('query', '')
        memory_type = data.get('memory_type')
        tags = data.get('tags', [])
        limit = data.get('limit', 10)
        
        manager = MemoryManager(user_id)
        memories = manager.search_memories(
            query=query,
            memory_type=memory_type,
            tags=tags,
            limit=limit
        )
        
        return JsonResponse({
            'memories': [
                {
                    'id': m.id,
                    'key': m.key,
                    'value': m.value,
                    'memory_type': m.memory_type,
                    'importance': m.importance,
                    'tags': m.tags,
                    'access_count': m.access_count
                }
                for m in memories
            ],
            'count': len(memories)
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def list_memories(request):
    """List all memories for user"""
    try:
        user_id = request.GET.get('user_identifier', 'anonymous')
        memory_type = request.GET.get('memory_type')
        min_importance = int(request.GET.get('min_importance', 0))
        
        manager = MemoryManager(user_id)
        memories = manager.get_all_memories(
            memory_type=memory_type,
            min_importance=min_importance
        )
        
        return JsonResponse({
            'memories': [
                {
                    'id': m.id,
                    'key': m.key,
                    'value': m.value,
                    'memory_type': m.memory_type,
                    'importance': m.importance,
                    'tags': m.tags,
                    'description': m.description,
                    'access_count': m.access_count,
                    'created_at': m.created_at.isoformat()
                }
                for m in memories
            ],
            'count': len(memories)
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_memory(request):
    """Delete a memory"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_identifier', 'anonymous')
        key = data.get('key')
        
        if not key:
            return JsonResponse({'error': 'Key is required'}, status=400)
        
        manager = MemoryManager(user_id)
        manager.delete_memory(key)
        
        return JsonResponse({
            'status': 'success',
            'message': f'Memory "{key}" deleted'
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_memory_importance(request):
    """Update memory importance"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_identifier', 'anonymous')
        key = data.get('key')
        importance = data.get('importance')
        
        if not key or importance is None:
            return JsonResponse({'error': 'Key and importance are required'}, status=400)
        
        manager = MemoryManager(user_id)
        manager.update_memory_importance(key, importance)
        
        return JsonResponse({
            'status': 'success',
            'message': f'Memory "{key}" importance updated to {importance}'
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def memory_stats(request):
    """Get memory statistics"""
    try:
        user_id = request.GET.get('user_identifier', 'anonymous')
        
        manager = MemoryManager(user_id)
        stats = manager.get_memory_stats()
        
        return JsonResponse(stats)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def search_knowledge(request):
    """Search knowledge base"""
    try:
        data = json.loads(request.body)
        query = data.get('query', '')
        category = data.get('category')
        limit = data.get('limit', 5)
        
        user_id = data.get('user_identifier', 'anonymous')
        manager = MemoryManager(user_id)
        results = manager.search_knowledge(
            query=query,
            category=category,
            limit=limit
        )
        
        return JsonResponse({
            'knowledge': [
                {
                    'id': kb.id,
                    'category': kb.category,
                    'title': kb.title,
                    'content': kb.content,
                    'summary': kb.summary,
                    'keywords': kb.keywords,
                    'relevance_score': kb.relevance_score
                }
                for kb in results
            ],
            'count': len(results)
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_preferences(request):
    """Get user preferences"""
    try:
        user_id = request.GET.get('user_identifier', 'anonymous')
        
        manager = MemoryManager(user_id)
        prefs = manager.get_preferences()
        
        return JsonResponse({
            'preferences': {
                'user_identifier': prefs.user_identifier,
                'default_intelligence_level': prefs.default_intelligence_level,
                'preferred_response_style': prefs.preferred_response_style,
                'system_info_preferences': prefs.system_info_preferences,
                'notification_settings': prefs.notification_settings,
                'ui_preferences': prefs.ui_preferences,
                'privacy_settings': prefs.privacy_settings
            }
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_preferences(request):
    """Update user preferences"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_identifier', 'anonymous')
        
        manager = MemoryManager(user_id)
        prefs = manager.update_preferences(**{
            k: v for k, v in data.items() 
            if k != 'user_identifier'
        })
        
        return JsonResponse({
            'status': 'success',
            'message': 'Preferences updated',
            'preferences': {
                'default_intelligence_level': prefs.default_intelligence_level,
                'preferred_response_style': prefs.preferred_response_style
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
