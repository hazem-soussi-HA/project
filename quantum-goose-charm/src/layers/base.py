#!/usr/bin/env python3
"""
Base reactive layer for Quantum Goose charm
Provides common reactive decorators and utilities
"""

import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

from charms.reactive import hook
from charms.reactive import set_flag, clear_flag, is_flag_set, flip_flag
from charms.reactive.bus import get_states
from charmhelpers.core import hookenv, unitdata
from charmhelpers.core.host import (
    service_restart, service_stop, service_start, service_running,
    add_user, add_group, add_to_group, mkdir, write_file, chownr, service
)
from charmhelpers.core.templating import render
from charmhelpers.payload import extract

logger = logging.getLogger(__name__)


class QuantumGooseBaseLayer:
    """Base layer for Quantum Goose charm"""
    
    def __init__(self):
        self.charm_dir = Path("/opt/quantum-goose")
        self.app_dir = self.charm_dir / "app"
        self.config_dir = self.charm_dir / "config"
        self.log_dir = self.charm_dir / "logs"
        self.data_dir = self.charm_dir / "data"
        
        # Ensure directories exist
        self._ensure_directories()
        
        # Initialize unit data
        self.kv = unitdata.kv()
    
    def _ensure_directories(self):
        """Ensure all required directories exist"""
        directories = [
            self.charm_dir,
            self.app_dir,
            self.config_dir,
            self.log_dir,
            self.data_dir
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
            # Set proper ownership
            try:
                os.chown(directory, 33, 33)  # www-data user/group
            except Exception:
                pass
    
    @hook('install')
    def install_base(self):
        """Base installation hook"""
        logger.info("Installing Quantum Goose base layer")
        
        # Set installation flags
        set_flag('quantum-goose.base.installed')
        set_flag('quantum-goose.base.configured')
        
        # Install system dependencies
        self._install_system_dependencies()
        
        # Setup Python environment
        self._setup_python_environment()
        
        # Create service user
        self._setup_service_user()
        
        logger.info("Base installation complete")
    
    @hook('start')
    def start_base(self):
        """Base start hook"""
        logger.info("Starting Quantum Goose base layer")
        
        # Start Redis if needed
        if is_flag_set('quantum-goose.redis.available'):
            self._start_redis()
        
        # Start services
        self._start_services()
        
        # Set running flags
        set_flag('quantum-goose.base.running')
        
        logger.info("Base layer started")
    
    @hook('stop')
    def stop_base(self):
        """Base stop hook"""
        logger.info("Stopping Quantum Goose base layer")
        
        # Stop services
        self._stop_services()
        
        # Clear running flags
        clear_flag('quantum-goose.base.running')
        
        logger.info("Base layer stopped")
    
    @hook('config-changed')
    def config_changed_base(self):
        """Base configuration change hook"""
        logger.info("Configuration changed in base layer")
        
        # Reload configuration
        self._reload_configuration()
        
        # Restart services if needed
        if is_flag_set('quantum-goose.base.running'):
            self._restart_services()
        
        logger.info("Base configuration updated")
    
    def _install_system_dependencies(self):
        """Install system dependencies"""
        logger.info("Installing system dependencies")
        
        packages = [
            'nginx',
            'redis-server',
            'supervisor',
            'python3-dev',
            'build-essential',
            'curl',
            'jq',
            'postgresql-client',
            'sqlite3'
        ]
        
        try:
            subprocess.run([
                'apt-get', 'update'
            ], check=True, capture_output=True)
            
            subprocess.run([
                'apt-get', 'install', '-y'
            ] + packages, check=True, capture_output=True)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install dependencies: {e}")
            raise
    
    def _setup_python_environment(self):
        """Setup Python virtual environment"""
        logger.info("Setting up Python environment")
        
        venv_path = self.charm_dir / "venv"
        
        try:
            # Create virtual environment
            subprocess.run([
                sys.executable, '-m', 'venv', str(venv_path)
            ], check=True, capture_output=True)
            
            # Install base packages
            pip_path = venv_path / "bin" / "pip"
            subprocess.run([
                str(pip_path), 'install', '--upgrade', 'pip'
            ], check=True, capture_output=True)
            
            # Install requirements
            requirements_file = Path("requirements.txt")
            if requirements_file.exists():
                subprocess.run([
                    str(pip_path), 'install', '-r', str(requirements_file)
                ], check=True, capture_output=True)
            
            # Store venv path
            self.kv.set('python.venv.path', str(venv_path))
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to setup Python environment: {e}")
            raise
    
    def _setup_service_user(self):
        """Setup service user and permissions"""
        logger.info("Setting up service user")
        
        try:
            # Add quantum-goose user
            add_user('quantum-goose', system=True, shell='/bin/false')
            add_group('quantum-goose')
            
            # Add to web server group
            add_to_group('quantum-goose', 'www-data')
            
            # Set ownership of directories
            chownr(self.charm_dir, 'quantum-goose', 'quantum-goose', chownlinks=True)
            
        except Exception as e:
            logger.error(f"Failed to setup service user: {e}")
            raise
    
    def _start_redis(self):
        """Start Redis service"""
        logger.info("Starting Redis service")
        
        try:
            service_start('redis-server')
            
            # Wait for Redis to be ready
            import time
            time.sleep(5)
            
            # Test connection
            subprocess.run([
                'redis-cli', 'ping'
            ], check=True, capture_output=True)
            
        except Exception as e:
            logger.error(f"Failed to start Redis: {e}")
            raise
    
    def _start_services(self):
        """Start application services"""
        logger.info("Starting application services")
        
        services = [
            'quantum-goose',
            'nginx'
        ]
        
        for service_name in services:
            try:
                service_start(service_name)
                logger.info(f"Started {service_name}")
            except Exception as e:
                logger.error(f"Failed to start {service_name}: {e}")
                raise
    
    def _stop_services(self):
        """Stop application services"""
        logger.info("Stopping application services")
        
        services = [
            'quantum-goose',
            'nginx'
        ]
        
        for service_name in services:
            try:
                service_stop(service_name)
                logger.info(f"Stopped {service_name}")
            except Exception as e:
                logger.error(f"Failed to stop {service_name}: {e}")
    
    def _restart_services(self):
        """Restart services with configuration changes"""
        logger.info("Restarting services")
        
        services = [
            'quantum-goose',
            'nginx'
        ]
        
        for service_name in services:
            try:
                service_restart(service_name)
                logger.info(f"Restarted {service_name}")
            except Exception as e:
                logger.error(f"Failed to restart {service_name}: {e}")
    
    def _reload_configuration(self):
        """Reload configuration files"""
        logger.info("Reloading configuration")
        
        # Reload Nginx configuration
        try:
            subprocess.run([
                'nginx', '-t'
            ], check=True, capture_output=True)
            
            subprocess.run([
                'systemctl', 'reload', 'nginx'
            ], check=True, capture_output=True)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to reload Nginx configuration: {e}")
            raise
    
    def get_python_venv_path(self) -> Path:
        """Get Python virtual environment path"""
        venv_path = self.kv.get('python.venv.path')
        if venv_path:
            return Path(venv_path)
        
        # Fallback to default path
        return self.charm_dir / "venv"
    
    def run_python_script(self, script_content: str, **kwargs) -> str:
        """Run Python script in the virtual environment"""
        venv_path = self.get_python_venv_path()
        python_path = venv_path / "bin" / "python"
        
        # Create temporary script file
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        try:
            # Run the script
            result = subprocess.run([
                str(python_path), script_path
            ], capture_output=True, text=True, check=True, **kwargs)
            
            return result.stdout
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Python script failed: {e}")
            logger.error(f"Script output: {e.stdout}")
            logger.error(f"Script error: {e.stderr}")
            raise
        finally:
            # Clean up temporary file
            try:
                os.unlink(script_path)
            except Exception:
                pass
    
    def template_render(self, template_path: str, output_path: str, context: Dict):
        """Render Jinja2 template"""
        logger.info(f"Rendering template {template_path} to {output_path}")
        
        try:
            render(
                source=template_path,
                target=output_path,
                context=context,
                owner='quantum-goose',
                group='quantum-goose',
                perms=0o644
            )
            
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            raise
    
    def log_info(self, message: str):
        """Log info message"""
        logger.info(message)
        hookenv.log(message, hookenv.INFO)
    
    def log_error(self, message: str):
        """Log error message"""
        logger.error(message)
        hookenv.log(message, hookenv.ERROR)
    
    def log_warning(self, message: str):
        """Log warning message"""
        logger.warning(message)
        hookenv.log(message, hookenv.WARNING)


# Create base layer instance
base_layer = QuantumGooseBaseLayer()
