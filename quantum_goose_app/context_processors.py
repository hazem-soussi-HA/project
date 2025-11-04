"""
Context processors for quantum_goose_app
"""
from django.urls import reverse
from django.conf import settings


def navigation_context(request):
    """
    Adds navigation context to all templates
    """
    # Define navigation items
    navigation_items = [
        {
            'name': 'Welcome',
            'url': 'welcome',
            'icon': 'fas fa-home',
            'description': 'Project overview and documentation'
        },
        {
            'name': 'Quantum Goose App',
            'url': 'quantum_goose_app:react_integration',
            'icon': 'fab fa-react',
            'description': 'React application with Django backend',
            'sub_items': [
                {
                    'name': 'React App',
                    'url': 'quantum_goose_app:react_integration',
                    'icon': 'fas fa-rocket'
                },
                {
                    'name': 'API Endpoints',
                    'url': 'quantum_goose_app:api_integration',
                    'icon': 'fas fa-code'
                },
                {
                    'name': 'Health Check',
                    'url': 'quantum_goose_app:health_check',
                    'icon': 'fas fa-heartbeat'
                }
            ]
        },
        {
            'name': 'Quantum Services',
            'url': 'services_index',
            'icon': 'fas fa-cube',
            'description': 'Quantum-based applications and services',
            'sub_items': [
                {
                    'name': 'Goose Quantum Navigator',
                    'url': 'quantum_navigator',
                    'icon': 'fas fa-compass',
                    'description': 'Life Quantum Integration interface'
                },
                {
                    'name': 'Quantum Cube Universe',
                    'url': 'quantum_cube_universe',
                    'icon': 'fas fa-cube',
                    'description': '3D quantum cube visualization'
                },
                {
                    'name': 'Max Hazoom Chat',
                    'url': 'max_hazoom_chat',
                    'icon': 'fas fa-comments',
                    'description': 'Interactive chat interface'
                },
                {
                    'name': '3D Cube Page',
                    'url': 'cube_3d_page',
                    'icon': 'fas fa-cube',
                    'description': 'Advanced 3D cube experience'
                }
            ]
        },
        {
            'name': 'Admin',
            'url': 'admin:index',
            'icon': 'fas fa-cog',
            'description': 'Django administration panel',
            'admin_only': True
        }
    ]

    # Define service routes for HTML files
    service_routes = [
        {
            'name': 'Goose Quantum Navigator',
            'path': '/services/quantum-navigator/',
            'file': 'goose-quantum-navigator.html',
            'url_name': 'quantum_navigator',
            'icon': 'fas fa-compass',
            'description': 'Life Quantum Integration - Interactive navigation system'
        },
        {
            'name': 'Quantum Cube Universe',
            'path': '/services/quantum-cube/',
            'file': 'quantum-cube-universe.html',
            'url_name': 'quantum_cube_universe',
            'icon': 'fas fa-cube',
            'description': '3D quantum cube with visualization and interaction'
        },
        {
            'name': 'Max Hazoom Chat',
            'path': '/services/max-hazoom/',
            'file': 'max-hazoom-chat.html',
            'url_name': 'max_hazoom_chat',
            'icon': 'fas fa-comments',
            'description': 'Interactive chat with quantum consciousness features'
        },
        {
            'name': '3D Cube Page',
            'path': '/services/cube-3d/',
            'file': '3d-cube-page.html',
            'url_name': 'cube_3d_page',
            'icon': 'fas fa-cube',
            'description': 'Advanced 3D cube with quantum mechanics simulation'
        }
    ]

    # API endpoints
    api_endpoints = [
        {
            'name': 'Health Check',
            'url': '/quantum-goose-app/health/',
            'method': 'GET',
            'description': 'Check application health status'
        },
        {
            'name': 'API Integration',
            'url': '/quantum-goose-app/api/',
            'method': 'GET/POST',
            'description': 'Main API endpoint for React integration'
        },
        {
            'name': 'React Static Files',
            'url': '/quantum-goose-app/react/static/',
            'method': 'GET',
            'description': 'Serve React application static files'
        }
    ]

    # Build absolute URLs for current request
    current_path = request.path
    current_url = request.build_absolute_uri()

    # Determine active navigation item
    active_nav_item = None
    for item in navigation_items:
        if item['url'].startswith('http'):
            if current_url.startswith(item['url']):
                active_nav_item = item['name']
                break
        else:
            try:
                item_url = reverse(item['url'])
                if current_path == item_url:
                    active_nav_item = item['name']
                    break
            except:
                pass

    context = {
        'navigation_items': navigation_items,
        'service_routes': service_routes,
        'api_endpoints': api_endpoints,
        'active_nav_item': active_nav_item,
        'current_path': current_path,
        'current_url': current_url,
        'is_debug': settings.DEBUG,
        'static_url': settings.STATIC_URL,
        'media_url': settings.MEDIA_URL,
        'project_name': 'Quantum Goose Project',
        'project_description': 'Django + React integration with quantum consciousness interface'
    }

    return context
