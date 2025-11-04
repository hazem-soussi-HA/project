"""
URL configuration for quantum_goose_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render

# Welcome view
def welcome_view(request):
    """Welcome page view"""
    context = {
        'project_name': 'Quantum Goose Project',
        'description': 'A Django backend with React frontend integration',
        'react_app_url': '/quantum-goose-app/',
    }
    return render(request, 'quantum_goose_app/welcome.html', context)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', welcome_view, name='welcome'),
    path('quantum-goose-app/', include('quantum_goose_app.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
