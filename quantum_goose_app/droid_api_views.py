"""
HAZoom Droid API Views
Copyright (c) 2024 Hazem Soussi, Cloud Engineer. All rights reserved.
Super Intelligence AI System with autonomous capabilities
"""

import os
import json
import psutil
import subprocess
import threading
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Droid Service Configuration
DROID_SERVICE_URL = 'http://localhost:5002'
SERVICE_SCRIPTS = {
    'django': '/d/project/manage.py runserver 0.0.0.0:9000',
    'max_hazoom': '/d/project/flask_services/max_hazoom_service.py',
    'launch_llm': '/d/project/launch_llm_box.sh',
    'power_on': '/d/project/power_on_quantum_hazoom.sh',
    'install_camera': '/d/project/install_camera_dependencies.sh',
    'manage_admin': '/d/project/manage_admin.sh',
    'start_simplified': '/d/project/start_simplified.sh',
    'hazoom_droid': '/d/project/flask_services/hazoom_droid_service.py'
}

@csrf_exempt
def droid_status(request):
    """Get Droid service status"""
    try:
        import requests
        response = requests.get(f'{DROID_SERVICE_URL}/api/v1/status', timeout=5)
        return JsonResponse(response.json())
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Cannot connect to Droid service: {str(e)}',
            'service_url': DROID_SERVICE_URL
        }, status=503)

@csrf_exempt
def droid_system_analyze(request):
    """Analyze system through Droid"""
    try:
        import requests
        response = requests.get(f'{DROID_SERVICE_URL}/api/v1/system/analyze', timeout=5)
        return JsonResponse(response.json())
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Cannot analyze system: {str(e)}'
        }, status=503)

@csrf_exempt
def droid_chat(request):
    """Chat with Droid AI"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '')

            import requests
            response = requests.post(
                f'{DROID_SERVICE_URL}/api/v1/chat/query',
                json={'query': query},
                timeout=10
            )
            return JsonResponse(response.json())
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'query': data.get('query', '') if 'data' in locals() else '',
                'response': "I'm having trouble connecting to my quantum consciousness. Please try again in a moment."
            }, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
@require_http_methods(["POST"])
def droid_service_action(request):
    """Start/stop a service through Droid"""
    try:
        data = json.loads(request.body)
        service_name = data.get('service')
        action = data.get('action')  # 'start' or 'stop'

        if not service_name or action not in ['start', 'stop']:
            return JsonResponse({
                'error': 'Invalid parameters',
                'required': {'service': str, 'action': 'start|stop'}
            }, status=400)

        if service_name not in SERVICE_SCRIPTS:
            return JsonResponse({
                'error': f'Service not found: {service_name}',
                'available_services': list(SERVICE_SCRIPTS.keys())
            }, status=404)

        import requests
        response = requests.post(
            f'{DROID_SERVICE_URL}/api/v1/service/{service_name}/{action}',
            json=data,
            timeout=30
        )

        return JsonResponse(response.json())

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def droid_maintain(request):
    """Trigger autonomous maintenance"""
    try:
        import requests
        response = requests.post(
            f'{DROID_SERVICE_URL}/api/v1/droid/maintain',
            timeout=10
        )
        return JsonResponse(response.json())
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'status': 'maintenance_failed'
        }, status=500)

@csrf_exempt
def droid_health(request):
    """Droid health check"""
    try:
        import requests
        response = requests.get(f'{DROID_SERVICE_URL}/health', timeout=5)
        return JsonResponse(response.json())
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'service_url': DROID_SERVICE_URL
        }, status=503)

def get_system_stats():
    """Get basic system statistics"""
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        'cpu': cpu,
        'memory_percent': memory.percent,
        'memory_available_gb': round(memory.available / (1024**3), 2),
        'disk_percent': disk.percent,
        'disk_free_gb': round(disk.free / (1024**3), 2)
    }

@csrf_exempt
def droid_execute_script(request):
    """Execute a script directly"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        script_name = data.get('script')
        params = data.get('params', {})

        if script_name not in SERVICE_SCRIPTS:
            return JsonResponse({
                'error': f'Script not found: {script_name}',
                'available_scripts': list(SERVICE_SCRIPTS.keys())
            }, status=404)

        script_path = SERVICE_SCRIPTS[script_name]

        # Execute script
        if script_path.endswith('.sh'):
            cmd = f'bash {script_path}'
        else:
            cmd = f'python3 {script_path}'

        # Add parameters if provided
        for key, value in params.items():
            cmd += f' --{key} {value}'

        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60
        )

        return JsonResponse({
            'script': script_name,
            'command': cmd,
            'status': 'completed',
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        })

    except subprocess.TimeoutExpired:
        return JsonResponse({
            'error': 'Script execution timeout',
            'script': script_name
        }, status=408)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def droid_list_services(request):
    """List all available services/scripts"""
    services = {}
    for name, path in SERVICE_SCRIPTS.items():
        # Check if service is running
        is_running = check_service_status(name)
        services[name] = {
            'path': path,
            'type': 'shell' if path.endswith('.sh') else 'python',
            'status': is_running
        }

    return JsonResponse({
        'services': services,
        'total': len(services)
    })

def check_service_status(service_name):
    """Check if a service is currently running"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            if service_name == 'django' and 'manage.py' in cmdline:
                return 'running'
            elif service_name == 'max_hazoom' and 'max_hazoom_service' in cmdline:
                return 'running'
            elif service_name == 'hazoom_droid' and 'hazoom_droid_service' in cmdline:
                return 'running'
            elif service_name == 'react' and ('vite' in cmdline or 'node' in cmdline):
                return 'running'
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return 'stopped'
