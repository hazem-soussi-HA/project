"""
Views for quantum_goose_app

Copyright (c) 2024 Hazem Soussi, Cloud Engineer. All rights reserved.
HAZoom SGI LLM - Super Intelligence AI System
"""
import os
import json
import logging
from django.http import JsonResponse, HttpResponse, FileResponse, Http404, StreamingHttpResponse
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.urls import reverse
from .camera_service import frame_generator, camera_ready, CameraUnavailableError, generate_placeholder_frame

logger = logging.getLogger(__name__)


def welcome(request):
    """
    Welcome page view with project information and React app links
    """
    context = {
        'project_name': 'Quantum Goose Project',
        'description': 'A Django backend with React frontend integration',
        'react_app_available': True,
        'react_app_path': '/quantum-goose-app/',
        'static_files_path': '/static/',
        'api_endpoints': {
            'health': '/quantum-goose-app/health/',
            'api': '/quantum-goose-app/api/',
        }
    }
    return render(request, 'quantum_goose_app/welcome.html', context)


def react_app_integration(request):
    """
    Integration view for the React application
    """
    context = {
        'react_app_config': {
            'base_url': '/quantum-goose-app/',
            'api_base_url': '/quantum-goose-app/api/',
            'static_url': '/static/',
            'debug': settings.DEBUG,
        },
        'quantum_goose_app_path': os.path.join(settings.BASE_DIR, 'quantum-goose-app'),
        'react_dist_path': os.path.join(settings.BASE_DIR, 'quantum-goose-app', 'dist'),
    }
    return render(request, 'quantum_goose_app/react_integration.html', context)


@csrf_exempt
def api_integration(request):
    """
    API endpoint for React app integration
    """
    if request.method == 'GET':
        # Return API information and available endpoints
        api_info = {
            'status': 'ok',
            'message': 'Quantum Goose API is running',
            'endpoints': {
                'health': '/quantum-goose-app/health/',
                'react_integration': '/quantum-goose-app/react/',
                'static_files': '/quantum-goose-app/react/static/',
            },
            'django_settings': {
                'debug': settings.DEBUG,
                'static_url': settings.STATIC_URL,
                'media_url': settings.MEDIA_URL,
            }
        }
        return JsonResponse(api_info)
    
    elif request.method == 'POST':
        # Handle POST requests from React app
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()
            
            response_data = {
                'status': 'success',
                'message': 'Data received successfully',
                'received_data': data,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'content_type': request.content_type,
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def serve_react_static(request, filename):
    """
    Serve static files from the React app dist directory
    """
    react_static_path = os.path.join(settings.BASE_DIR, 'quantum-goose-app', 'dist')
    file_path = os.path.join(react_static_path, filename)
    
    if not os.path.exists(file_path):
        raise Http404(f"File {filename} not found")
    
    # Determine content type
    content_type = 'text/plain'
    if filename.endswith('.js'):
        content_type = 'application/javascript'
    elif filename.endswith('.css'):
        content_type = 'text/css'
    elif filename.endswith('.html'):
        content_type = 'text/html'
    elif filename.endswith('.json'):
        content_type = 'application/json'
    elif filename.endswith('.png'):
        content_type = 'image/png'
    elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
        content_type = 'image/jpeg'
    elif filename.endswith('.svg'):
        content_type = 'image/svg+xml'
    
    try:
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            return response
    except IOError:
        raise Http404(f"Could not read file {filename}")


def health_check(request):
    """
    Health check endpoint
    """
    import django
    health_status = {
        'status': 'healthy',
        'django_version': django.get_version(),
        'debug_mode': settings.DEBUG,
        'static_url': settings.STATIC_URL,
        'media_url': settings.MEDIA_URL,
        'react_app_path': os.path.join(settings.BASE_DIR, 'quantum-goose-app'),
        'react_dist_exists': os.path.exists(os.path.join(settings.BASE_DIR, 'quantum-goose-app', 'dist')),
    }
    
    return JsonResponse(health_status)


# Service routes for HTML files
def services_index(request):
    """
    Services index page
    """
    services = [
        {
            'name': 'Max Hazoom Chat',
            'url': 'quantum_goose_app:max_hazoom_chat',
            'icon': 'fas fa-comments',
            'description': 'Interactive chat with quantum consciousness features',
            'priority_label': 'Priorité Haute',
            'priority_rank': 1
        },
        {
            'name': 'Goose Quantum Navigator',
            'url': 'quantum_goose_app:quantum_navigator',
            'icon': 'fas fa-compass',
            'description': 'Life Quantum Integration - Interactive navigation system',
            'priority_rank': 2
        },
        {
            'name': 'Quantum Cube Universe',
            'url': 'quantum_goose_app:quantum_cube_universe',
            'icon': 'fas fa-cube',
            'description': '3D quantum cube with visualization and interaction',
            'priority_rank': 3
        },
        {
            'name': '3D Cube Page',
            'url': 'quantum_goose_app:cube_3d_page',
            'icon': 'fas fa-cube',
            'description': 'Advanced 3D cube with quantum mechanics simulation',
            'priority_rank': 4
        },
        {
            'name': 'Quantum Camera Stream',
            'url': 'quantum_goose_app:camera_service',
            'icon': 'fas fa-video',
            'description': 'Live MJPEG stream from the system camera',
            'priority_rank': 5
        }
    ]

    services_sorted = sorted(services, key=lambda svc: svc.get('priority_rank', 99))

    context = {
        'services': services_sorted,
        'camera_available': camera_ready()
    }
    return render(request, 'quantum_goose_app/services_index.html', context)


@require_http_methods(["GET"])
def camera_service(request):
    context = {
        'camera_available': camera_ready(),
        'stream_url': reverse('quantum_goose_app:camera_stream')
    }
    return render(request, 'quantum_goose_app/camera_service.html', context)


@require_http_methods(["GET"])
def camera_stream(request):
    """Stream camera feed with error handling."""
    try:
        if not camera_ready():
            # Return a placeholder image instead of error
            placeholder = generate_placeholder_frame()
            if placeholder:
                # Check if it's SVG or JPEG
                if placeholder.startswith(b'<?xml'):
                    return HttpResponse(placeholder, content_type='image/svg+xml')
                else:
                    return HttpResponse(placeholder, content_type='image/jpeg')
            return HttpResponse(b'Camera unavailable', content_type='text/plain', status=503)
        
        response = StreamingHttpResponse(frame_generator(), content_type='multipart/x-mixed-replace; boundary=frame')
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    except CameraUnavailableError as e:
        logger.error(f"Camera stream error: {e}")
        return HttpResponse(b'Camera temporarily unavailable', content_type='text/plain', status=503)
    except Exception as e:
        logger.error(f"Unexpected camera stream error: {e}")
        return HttpResponse(b'Camera service error', content_type='text/plain', status=500)


def quantum_navigator(request):
    """
    Goose Quantum Navigator service
    """
    return serve_html_file(request, 'goose-quantum-navigator.html', 'Goose Quantum Navigator')


def quantum_cube_universe(request):
    """
    Quantum Cube Universe service
    """
    return serve_html_file(request, 'quantum-cube-universe.html', 'Quantum Cube Universe')


def max_hazoom_chat(request):
    """
    Max Hazoom Chat service
    """
    return serve_html_file(request, 'max-hazoom-chat.html', 'Max Hazoom Chat')


def cube_3d_page(request):
    """
    3D Cube Page service
    """
    return serve_html_file(request, '3d-cube-page.html', '3D Cube Page')


def serve_html_file(request, filename, title):
    """
    Generic function to serve HTML files with Django context
    """
    # Find the HTML file in the project root
    file_path = os.path.join(settings.BASE_DIR, filename)
    
    if not os.path.exists(file_path):
        # Return 404 if file doesn't exist
        return render(request, 'quantum_goose_app/error.html', {
            'error_code': '404',
            'error_message': f'Service file not found: {filename}',
            'error_description': 'The requested quantum service is currently unavailable.'
        }, status=404)
    
    try:
        # Read the HTML content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add navigation context and Django template structure
        # This is a simplified approach - in production, you might want to parse and integrate better
        django_wrapper = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Quantum Goose</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="{settings.STATIC_URL}css/style.css" rel="stylesheet">
    <style>
        /* Service-specific styles */
        body {{ 
            padding-top: 76px; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }}
        .service-header {{
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
        }}
        .service-content {{
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }}
        .back-link {{
            position: fixed;
            top: 100px;
            left: 20px;
            z-index: 1000;
            background: rgba(59, 130, 246, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            text-decoration: none;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }}
        .back-link:hover {{
            background: rgba(59, 130, 246, 1);
            color: white;
            transform: translateY(-2px);
        }}
    </style>
</head>
<body>
    <!-- Back to services link -->
    <a href="/quantum-goose-app/services/" class="back-link">
        <i class="fas fa-arrow-left me-2"></i>
        Back to Services
    </a>
    
    <!-- Service content -->
    <div class="service-header">
        <div class="container">
            <h1 class="display-4">
                <i class="fas fa-quidditch me-3"></i>
                {title}
            </h1>
            <p class="lead">Quantum Goose Service Experience</p>
        </div>
    </div>
    
    <div class="container">
        <div class="service-content">
            {content}
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{settings.STATIC_URL}js/main.js"></script>
</body>
</html>"""
        
        # Return the wrapped content
        return HttpResponse(django_wrapper.encode('utf-8'), content_type='text/html')
        
    except IOError as e:
        return render(request, 'quantum_goose_app/error.html', {
            'error_code': '500',
            'error_message': f'Error reading service file: {str(e)}',
            'error_description': 'There was an error loading this quantum service.'
        }, status=500)
