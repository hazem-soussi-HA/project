"""
Template tags for quantum_goose_app
"""
from django import template
from django.urls import reverse

register = template.Library()


@register.inclusion_tag('quantum_goose_app/components/navigation/main_nav.html')
def main_navigation(active_item=None):
    """Render main navigation component"""
    return {
        'active_item': active_item,
        'navigation_items': [
            {
                'name': 'Welcome',
                'url': 'welcome',
                'icon': 'fas fa-home',
                'description': 'Project overview'
            },
            {
                'name': 'Quantum Goose App',
                'url': 'quantum_goose_app:react_integration',
                'icon': 'fab fa-react',
                'description': 'React integration'
            },
            {
                'name': 'Quantum Services',
                'url': 'quantum_goose_app:services_index',
                'icon': 'fas fa-cube',
                'description': 'Quantum applications'
            }
        ]
    }


@register.inclusion_tag('quantum_goose_app/components/navigation/service_nav.html')
def service_navigation():
    """Render service navigation component"""
    return {
        'services': [
            {
                'name': 'Goose Quantum Navigator',
                'url': 'quantum_goose_app:quantum_navigator',
                'icon': 'fas fa-compass',
                'description': 'Life Quantum Integration'
            },
            {
                'name': 'Quantum Cube Universe',
                'url': 'quantum_goose_app:quantum_cube_universe',
                'icon': 'fas fa-cube',
                'description': '3D quantum cube'
            },
            {
                'name': 'Max Hazoom Chat',
                'url': 'quantum_goose_app:max_hazoom_chat',
                'icon': 'fas fa-comments',
                'description': 'Interactive chat'
            },
            {
                'name': '3D Cube Page',
                'url': 'quantum_goose_app:cube_3d_page',
                'icon': 'fas fa-cube',
                'description': 'Advanced 3D cube'
            }
        ]
    }


@register.inclusion_tag('quantum_goose_app/components/navigation/sidebar_nav.html')
def sidebar_navigation(current_path=None):
    """Render sidebar navigation with smooth transitions"""
    return {
        'current_path': current_path,
        'nav_sections': [
            {
                'title': 'Main Navigation',
                'items': [
                    {
                        'name': 'Home',
                        'url': 'welcome',
                        'icon': 'fas fa-home',
                        'description': 'Project overview and documentation'
                    },
                    {
                        'name': 'Quantum Goose App',
                        'url': 'quantum_goose_app:react_integration',
                        'icon': 'fab fa-react',
                        'description': 'React application integration'
                    },
                    {
                        'name': 'API Interface',
                        'url': 'quantum_goose_app:api_integration',
                        'icon': 'fas fa-code',
                        'description': 'API endpoints and integration'
                    }
                ]
            },
            {
                'title': 'Quantum Services',
                'items': [
                    {
                        'name': 'Goose Navigator',
                        'url': 'quantum_goose_app:quantum_navigator',
                        'icon': 'fas fa-compass',
                        'description': 'Life Quantum Integration interface'
                    },
                    {
                        'name': 'Quantum Cube',
                        'url': 'quantum_goose_app:quantum_cube_universe',
                        'icon': 'fas fa-cube',
                        'description': '3D quantum cube universe'
                    },
                    {
                        'name': 'Max Hazoom Chat',
                        'url': 'quantum_goose_app:max_hazoom_chat',
                        'icon': 'fas fa-comments',
                        'description': 'Interactive chat interface'
                    },
                    {
                        'name': '3D Cube Page',
                        'url': 'quantum_goose_app:cube_3d_page',
                        'icon': 'fas fa-cube',
                        'description': 'Advanced 3D cube experience'
                    }
                ]
            },
            {
                'title': 'System Tools',
                'items': [
                    {
                        'name': 'Health Check',
                        'url': 'quantum_goose_app:health_check',
                        'icon': 'fas fa-heartbeat',
                        'description': 'Application health status'
                    },
                    {
                        'name': 'Admin Panel',
                        'url': 'admin:index',
                        'icon': 'fas fa-cog',
                        'description': 'Django administration'
                    }
                ]
            }
        ]
    }


@register.filter
def is_active_nav(current_path, url_pattern):
    """Check if current path matches URL pattern"""
    if isinstance(url_pattern, str):
        try:
            url_path = reverse(url_pattern)
        except:
            url_path = url_pattern
    else:
        url_path = url_pattern
    
    return current_path == url_path


@register.filter
def contains_active_nav(current_path, service_urls):
    """Check if current path contains any of the service URLs"""
    for url in service_urls:
        try:
            url_path = reverse(url)
            if current_path.startswith(url_path):
                return True
        except:
            pass
    return False
