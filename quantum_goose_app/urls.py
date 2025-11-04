"""
URL configuration for quantum_goose_app
"""
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'quantum_goose_app'

urlpatterns = [
    # Welcome page
    path('', views.welcome, name='welcome'),
    
    # React app integration
    path('react/', views.react_app_integration, name='react_integration'),
    path('api/', views.api_integration, name='api_integration'),
    
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
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
