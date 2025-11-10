#!/usr/bin/env python3
"""
Django service layer for Quantum Goose charm
Handles Django application deployment and management
"""

import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

from charms.reactive import hook
from charms.reactive import set_flag, clear_flag, is_flag_set
from charmhelpers.core import hookenv, unitdata
from charmhelpers.core.host import (
    service_restart, service_stop, service_start, mkdir, write_file, chownr
)
from charmhelpers.core.templating import render

from .base import base_layer

logger = logging.getLogger(__name__)


class DjangoLayer:
    """Django service layer"""
    
    def __init__(self):
        self.app_dir = base_layer.app_dir / "quantum_goose_app"
        self.static_dir = base_layer.charm_dir / "static"
        self.media_dir = base_layer.charm_dir / "media"
        self.venv_path = base_layer.get_python_venv_path()
        
        # Ensure directories exist
        self._ensure_django_directories()
    
    def _ensure_django_directories(self):
        """Ensure Django-specific directories exist"""
        directories = [
            self.app_dir,
            self.app_dir / "quantum_goose_project",
            self.app_dir / "migrations",
            self.app_dir / "static",
            self.app_dir / "templates",
            self.static_dir,
            self.media_dir,
            base_layer.config_dir / "django",
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    @hook('install')
    def install_django(self):
        """Install Django application"""
        logger.info("Installing Django application")
        
        # Set Django installation flag
        set_flag('quantum-goose.django.installed')
        
        # Copy Django application files
        self._copy_django_files()
        
        # Install Django dependencies
        self._install_django_dependencies()
        
        # Setup Django configuration
        self._setup_django_configuration()
        
        # Initialize database
        self._initialize_database()
        
        # Collect static files
        self._collect_static_files()
        
        logger.info("Django installation complete")
    
    @hook('start')
    def start_django(self):
        """Start Django application"""
        logger.info("Starting Django application")
        
        # Start Gunicorn service
        self._start_gunicorn()
        
        # Set Django running flag
        set_flag('quantum-goose.django.running')
        
        logger.info("Django application started")
    
    @hook('stop')
    def stop_django(self):
        """Stop Django application"""
        logger.info("Stopping Django application")
        
        # Stop Gunicorn service
        self._stop_gunicorn()
        
        # Clear Django running flag
        clear_flag('quantum-goose.django.running')
        
        logger.info("Django application stopped")
    
    @hook('config-changed')
    def config_changed_django(self):
        """Handle Django configuration changes"""
        logger.info("Django configuration changed")
        
        # Update Django settings
        self._update_django_settings()
        
        # Restart service if running
        if is_flag_set('quantum-goose.django.running'):
            self._restart_gunicorn()
        
        logger.info("Django configuration updated")
    
    def _copy_django_files(self):
        """Copy Django application files"""
        logger.info("Copying Django application files")
        
        source_dir = Path("/opt/quantum-goose-source/quantum_goose_app")
        
        if not source_dir.exists():
            logger.warning(f"Django source directory not found: {source_dir}")
            return
        
        # Create destination directory
        dest_dir = base_layer.app_dir
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy files recursively
        import shutil
        try:
            shutil.copytree(source_dir, dest_dir, dirs_exist_ok=True)
            logger.info(f"Copied Django files from {source_dir} to {dest_dir}")
        except Exception as e:
            logger.error(f"Failed to copy Django files: {e}")
            raise
    
    def _install_django_dependencies(self):
        """Install Django and dependencies in virtual environment"""
        logger.info("Installing Django dependencies")
        
        pip_path = self.venv_path / "bin" / "pip"
        
        # Django-specific requirements
        django_requirements = [
            "Django>=4.2.0",
            "django-extensions>=3.2.0",
            "django-cors-headers>=4.0.0",
            "channels>=4.0.0",
            "channels-redis>=4.1.0",
            "gunicorn>=21.0.0",
            "uvicorn[standard]>=0.23.0",
            "psycopg2-binary>=2.9.0",
            "redis>=4.6.0",
            "openai>=2.7.0",
            "anthropic>=0.72.0",
            "requests>=2.31.0",
            "aiohttp>=3.8.0",
            "asyncio-mqtt>=0.11.0",
            "psutil>=5.9.0",
            "prometheus-client>=0.17.0",
            "pyyaml>=6.0",
            "python-decouple>=3.8",
            "structlog>=23.1.0",
            "cryptography>=41.0.0",
            "pyjwt>=2.8.0",
        ]
        
        try:
            for requirement in django_requirements:
                subprocess.run([
                    str(pip_path), 'install', requirement
                ], check=True, capture_output=True)
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install Django dependencies: {e}")
            raise
    
    def _setup_django_configuration(self):
        """Setup Django configuration files"""
        logger.info("Setting up Django configuration")
        
        # Django settings template
        django_settings_template = {
            'debug': False,
            'secret_key': 'changeme-secret-key',
            'allowed_hosts': ['*'],
            'database': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': str(base_layer.data_dir / 'db.sqlite3'),
            },
            'cache': {
                'BACKEND': 'django_redis.cache.RedisCache',
                'LOCATION': 'redis://127.0.0.1:6379/1',
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                }
            },
            'static_url': '/static/',
            'static_root': str(base_layer.static_dir),
            'media_url': '/media/',
            'media_root': str(base_layer.media_dir),
            'use_websocket': True,
            'llm_provider': 'simulation',
            'llm_api_key': '',
            'llm_base_url': 'http://localhost:11434',
            'llm_model': 'llama2',
            'memory_limit': '2G',
            'max_workers': 4,
        }
        
        # Update with charm configuration
        config = hookenv.config()
        django_settings_template.update({
            'debug': config.get('django-debug', False),
            'secret_key': config.get('django-secret-key', 'changeme-secret-key'),
            'allowed_hosts': config.get('django-allowed-hosts', '*').split(','),
            'database': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'quantum_goose',
                'USER': 'quantum_goose',
                'PASSWORD': 'changeme',
                'HOST': 'localhost',
                'PORT': '5432',
            },
            'llm_provider': config.get('llm-provider', 'simulation'),
            'llm_api_key': config.get('llm-api-key', ''),
            'llm_base_url': config.get('llm-base-url', 'http://localhost:11434'),
            'llm_model': config.get('llm-model', 'llama2'),
            'max_workers': config.get('max-workers', 4),
            'memory_limit': config.get('memory-limit', '2G'),
        })
        
        # Save Django settings
        settings_file = self.app_dir / "quantum_goose_project" / "settings.py"
        self._write_django_settings(settings_file, django_settings_template)
        
        # Save database configuration
        db_config_file = base_layer.config_dir / "django" / "database.json"
        db_config_file.parent.mkdir(parents=True, exist_ok=True)
        
        import json
        with open(db_config_file, 'w') as f:
            json.dump(django_settings_template['database'], f, indent=2)
    
    def _write_django_settings(self, settings_file: Path, config: Dict):
        """Write Django settings.py file"""
        logger.info(f"Writing Django settings to {settings_file}")
        
        settings_content = f'''"""
Django settings for Quantum Goose application
Generated by Quantum Goose charm
"""

import os
import json
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '{config["secret_key"]}'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = {str(config["debug"]).lower()}

ALLOWED_HOSTS = {config["allowed_hosts"]}

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'corsheaders',
    'channels',
    'rest_framework',
    'quantum_goose_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

ROOT_URLCONF = 'quantum_goose_project.urls'

TEMPLATES = [
    {{
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {{
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'quantum_goose_app.context_processors.navigation',
            ],
        }},
    }},
]

WSGI_APPLICATION = 'quantum_goose_project.wsgi.application'
ASGI_APPLICATION = 'quantum_goose_project.asgi.application'

# Database configuration
DATABASES = {{
    'default': {config["database"]}
}}

# Cache configuration
if {str(config.get('use_redis', False)).lower()}:
    CACHES = {{
        'default': {config["cache"]}
    }}
else:
    CACHES = {{
        'default': {{
            'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
            'LOCATION': '/var/lib/quantum-goose/cache',
        }}
    }}

# Redis Configuration for Channels
if {str(config.get('use_websocket', True)).lower()}:
    CHANNEL_LAYERS = {{
        'default': {{
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {{
                'hosts': ['redis://127.0.0.1:6379/0'],
            }},
        }},
    }}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '{config["static_url"]}'
STATIC_ROOT = '{config["static_root"]}'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = '{config["media_url"]}'
MEDIA_ROOT = '{config["media_root"]}'

# Django Extensions
GRAPH_MODELS = {{
    'all_applications': True,
    'group_models': True,
}}

# Custom settings
LLM_PROVIDER = '{config["llm_provider"]}'
LLM_API_KEY = '{config["llm_api_key"]}'
LLM_BASE_URL = '{config["llm_base_url"]}'
LLM_MODEL = '{config["llm_model"]}'
MEMORY_LIMIT = '{config["memory_limit"]}'
MAX_WORKERS = {config["max_workers"]}

# Celery Configuration
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/2'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/3'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Logging
LOGGING = {{
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {{
        'verbose': {{
            'format': '{{levelname}} {{asctime}} {{module}} {{process:d}} {{thread:d}} {{message}}',
            'style': '{{',
        }},
        'simple': {{
            'format': '{{levelname}} {{message}}',
            'style': '{{',
        }},
    }},
    'handlers': {{
        'file': {{
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/lib/quantum-goose/logs/django.log',
            'formatter': 'verbose',
        }},
        'console': {{
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        }},
    }},
    'loggers': {{
        'django': {{
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        }},
        'quantum_goose_app': {{
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        }},
    }},
}}

# Security settings (for production)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_REDIRECT_EXEMPT = []
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    X_FRAME_OPTIONS = 'DENY'
'''
        
        # Write settings file
        write_file(
            path=str(settings_file),
            content=settings_content,
            owner='quantum-goose',
            group='quantum-goose',
            perms=0o644
        )
    
    def _initialize_database(self):
        """Initialize Django database"""
        logger.info("Initializing Django database")
        
        # Run migrations
        manage_py = self.app_dir / "manage.py"
        python_path = self.venv_path / "bin" / "python"
        
        try:
            subprocess.run([
                str(python_path),
                str(manage_py),
                'migrate',
                '--noinput'
            ], check=True, capture_output=True, cwd=str(self.app_dir))
            
            # Create superuser (optional)
            # This would be done via action in production
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def _collect_static_files(self):
        """Collect static files for Django"""
        logger.info("Collecting static files")
        
        manage_py = self.app_dir / "manage.py"
        python_path = self.venv_path / "bin" / "python"
        
        try:
            subprocess.run([
                str(python_path),
                str(manage_py),
                'collectstatic',
                '--noinput',
                '--clear'
            ], check=True, capture_output=True, cwd=str(self.app_dir))
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Static files collection failed: {e}")
            # Don't fail installation for static files
            logger.warning("Static files collection failed, continuing...")
    
    def _update_django_settings(self):
        """Update Django settings based on configuration changes"""
        logger.info("Updating Django settings")
        
        # This would re-read configuration and update settings
        # For now, just log that it was called
        pass
    
    def _start_gunicorn(self):
        """Start Gunicorn service"""
        logger.info("Starting Gunicorn service")
        
        # Create Gunicorn systemd service
        self._create_gunicorn_service()
        
        # Start the service
        try:
            service_start('quantum-goose')
        except Exception as e:
            logger.error(f"Failed to start Gunicorn: {e}")
            raise
    
    def _stop_gunicorn(self):
        """Stop Gunicorn service"""
        logger.info("Stopping Gunicorn service")
        
        try:
            service_stop('quantum-goose')
        except Exception as e:
            logger.error(f"Failed to stop Gunicorn: {e}")
    
    def _restart_gunicorn(self):
        """Restart Gunicorn service"""
        logger.info("Restarting Gunicorn service")
        
        try:
            service_restart('quantum-goose')
        except Exception as e:
            logger.error(f"Failed to restart Gunicorn: {e}")
            raise
    
    def _create_gunicorn_service(self):
        """Create Gunicorn systemd service file"""
        logger.info("Creating Gunicorn service file")
        
        service_content = f'''[Unit]
Description=Quantum Goose Django Application
After=network.target redis.service

[Service]
Type=notify
User=quantum-goose
Group=quantum-goose
RuntimeDirectory=quantum-goose
RuntimeDirectoryMode=755
WorkingDirectory={self.app_dir}
Environment=DJANGO_SETTINGS_MODULE=quantum_goose_project.settings
EnvironmentFile={base_layer.config_dir}/django/environment

ExecStart={self.venv_path}/bin/gunicorn \\
    --bind unix:/opt/quantum-goose/run/quantum-goose.sock \\
    --workers {base_layer.kv.get('max-workers', 4)} \\
    --worker-class uvicorn.workers.UvicornWorker \\
    --timeout 30 \\
    --keepalive 2 \\
    --max-requests 1000 \\
    --max-requests-jitter 50 \\
    --preload \\
    --log-level info \\
    --log-file {base_layer.log_dir}/gunicorn.log \\
    quantum_goose_project.wsgi:application

ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
'''
        
        service_file = Path("/etc/systemd/system/quantum-goose.service")
        write_file(
            path=str(service_file),
            content=service_content,
            owner='root',
            group='root',
            perms=0o644
        )
        
        # Reload systemd
        try:
            subprocess.run([
                'systemctl', 'daemon-reload'
            ], check=True, capture_output=True)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to reload systemd: {e}")
            raise
    
    def run_migration(self, app_name: Optional[str] = None):
        """Run Django migrations"""
        logger.info(f"Running Django migrations for {app_name or 'all apps'}")
        
        manage_py = self.app_dir / "manage.py"
        python_path = self.venv_path / "bin" / "python"
        
        cmd = [
            str(python_path),
            str(manage_py),
            'migrate'
        ]
        
        if app_name:
            cmd.append(app_name)
        
        cmd.append('--noinput')
        
        try:
            subprocess.run(cmd, check=True, capture_output=True, cwd=str(self.app_dir))
        except subprocess.CalledProcessError as e:
            logger.error(f"Migration failed: {e}")
            raise
    
    def collectstatic(self):
        """Collect static files"""
        logger.info("Collecting Django static files")
        
        manage_py = self.app_dir / "manage.py"
        python_path = self.venv_path / "bin" / "python"
        
        try:
            subprocess.run([
                str(python_path),
                str(manage_py),
                'collectstatic',
                '--noinput',
                '--clear'
            ], check=True, capture_output=True, cwd=str(self.app_dir))
        except subprocess.CalledProcessError as e:
            logger.error(f"Static collection failed: {e}")
            raise
    
    def create_superuser(self, username: str, email: str, password: str):
        """Create Django superuser"""
        logger.info(f"Creating superuser: {username}")
        
        manage_py = self.app_dir / "manage.py"
        python_path = self.venv_path / "bin" / "python"
        
        try:
            subprocess.run([
                str(python_path),
                str(manage_py),
                'createsuperuser',
                f'--username={username}',
                f'--email={email}',
                '--noinput'
            ], input=password.encode(), check=True, capture_output=True, cwd=str(self.app_dir))
        except subprocess.CalledProcessError as e:
            logger.error(f"Superuser creation failed: {e}")
            raise
    
    def get_django_logs(self, lines: int = 100) -> str:
        """Get Django application logs"""
        log_file = base_layer.log_dir / "django.log"
        
        try:
            result = subprocess.run([
                'tail', '-n', str(lines), str(log_file)
            ], capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get Django logs: {e}")
            return f"Error reading logs: {e}"


# Create Django layer instance
django_layer = DjangoLayer()
