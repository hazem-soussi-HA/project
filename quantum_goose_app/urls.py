"""
URL configuration for quantum_goose_app
"""
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from . import api_views
from . import memory_api_views
from . import simple_api
from . import droid_api_views

app_name = 'quantum_goose_app'

urlpatterns = [
    # Welcome page
    path('', views.welcome, name='welcome'),
    
    # React app integration
    path('react/', views.react_app_integration, name='react_integration'),
    path('api/', views.api_integration, name='api_integration'),
    
    # Simple AI Chat API Endpoints
    path('api/chat/', simple_api.chat_message, name='simple_chat'),
    path('api/health/', simple_api.health_check, name='simple_health'),
    path('api/models/', simple_api.list_models, name='simple_models'),
    path('api/models/set/', simple_api.set_model, name='simple_set_model'),
    path('api/clear/', simple_api.clear_history, name='simple_clear'),
    path('api/status/', simple_api.system_status, name='simple_status'),
    
    # Legacy LLM HAZoom API Endpoints (kept for compatibility)
    path('api/llm/chat/', api_views.chat_message, name='llm_chat'),
    path('api/llm/system-info/', api_views.system_info, name='llm_system_info'),
    path('api/llm/acceleration/', api_views.acceleration_info, name='llm_acceleration'),
    path('api/llm/intelligence/', api_views.set_intelligence_level, name='llm_intelligence'),
    path('api/llm/clear/', api_views.clear_history, name='llm_clear'),
    path('api/llm/stats/', api_views.chat_stats, name='llm_stats'),
    path('api/llm/health/', api_views.health_check_llm, name='llm_health'),
    
    # Legacy Model Management API Endpoints
    path('api/models/legacy/', api_views.list_models, name='models_list'),
    path('api/models/legacy/set/', api_views.set_model, name='model_set'),
    path('api/models/legacy/pull/', api_views.pull_model, name='model_pull'),
    path('api/models/legacy/delete/', api_views.delete_model, name='model_delete'),
    path('api/models/legacy/info/', api_views.model_info, name='model_info'),
    path('api/models/legacy/status/', api_views.ollama_status, name='ollama_status'),
    
    # Memory Management API Endpoints
    path('api/memory/store/', memory_api_views.store_memory, name='memory_store'),
    path('api/memory/get/', memory_api_views.get_memory, name='memory_get'),
    path('api/memory/search/', memory_api_views.search_memories, name='memory_search'),
    path('api/memory/list/', memory_api_views.list_memories, name='memory_list'),
    path('api/memory/delete/', memory_api_views.delete_memory, name='memory_delete'),
    path('api/memory/importance/', memory_api_views.update_memory_importance, name='memory_importance'),
    path('api/memory/stats/', memory_api_views.memory_stats, name='memory_stats'),
    path('api/knowledge/search/', memory_api_views.search_knowledge, name='knowledge_search'),
    path('api/preferences/get/', memory_api_views.get_preferences, name='preferences_get'),
    path('api/preferences/update/', memory_api_views.update_preferences, name='preferences_update'),
    
    # Static file serving for React app
    path('react/static/<path:filename>', views.serve_react_static, name='serve_react_static'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Service routes for HTML files
    path('services/', views.services_index, name='services_index'),
    path('services/quantum-navigator/', views.quantum_navigator, name='quantum_navigator'),
    path('services/quantum-cube/', views.quantum_cube_universe, name='quantum_cube_universe'),
    path('services/max-hazoom/', views.max_hazoom_chat, name='max_hazoom_chat'),
    path('services/cube-3d/', views.cube_3d_page, name='cube_3d_page'),
    path('services/camera/', views.camera_service, name='camera_service'),
    path('camera/stream/', views.camera_stream, name='camera_stream'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
