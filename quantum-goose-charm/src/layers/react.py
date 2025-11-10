#!/usr/bin/env python3
"""
React frontend layer for Quantum Goose charm
Handles React application build and deployment
"""

import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

from charms.reactive import hook
from charms.reactive import set_flag, clear_flag, is_flag_set
from charmhelpers.core import hookenv
from charmhelpers.core.host import mkdir, write_file, chownr

from .base import base_layer

logger = logging.getLogger(__name__)


class ReactLayer:
    """React frontend service layer"""
    
    def __init__(self):
        self.frontend_dir = base_layer.charm_dir / "frontend"
        self.build_dir = self.frontend_dir / "build"
        self.source_dir = base_layer.charm_dir / "source" / "quantum-goose-app"
        self.node_modules_dir = self.frontend_dir / "node_modules"
        
        # Ensure directories exist
        self._ensure_react_directories()
    
    def _ensure_react_directories(self):
        """Ensure React-specific directories exist"""
        directories = [
            self.frontend_dir,
            self.build_dir,
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    @hook('install')
    def install_react(self):
        """Install React application"""
        logger.info("Installing React application")
        
        # Set React installation flag
        set_flag('quantum-goose.react.installed')
        
        # Install Node.js and npm
        self._install_nodejs()
        
        # Copy React source files
        self._copy_react_files()
        
        # Install React dependencies
        self._install_react_dependencies()
        
        # Build React application
        self._build_react_application()
        
        logger.info("React installation complete")
    
    @hook('config-changed')
    def config_changed_react(self):
        """Handle React configuration changes"""
        logger.info("React configuration changed")
        
        # Update environment variables
        self._update_react_environment()
        
        # Rebuild if needed
        if is_flag_set('quantum-goose.react.installed'):
            self._rebuild_react_application()
        
        logger.info("React configuration updated")
    
    def _install_nodejs(self):
        """Install Node.js and npm"""
        logger.info("Installing Node.js and npm")
        
        try:
            # Update package index
            subprocess.run([
                'apt-get', 'update'
            ], check=True, capture_output=True)
            
            # Install Node.js 18.x
            subprocess.run([
                'curl', '-fsSL', 'https://deb.nodesource.com/setup_18.x'
            ], check=True, capture_output=True)
            
            subprocess.run([
                'apt-get', 'install', '-y', 'nodejs'
            ], check=True, capture_output=True)
            
            # Verify installation
            result = subprocess.run([
                'node', '--version'
            ], capture_output=True, text=True, check=True)
            
            logger.info(f"Node.js version: {result.stdout.strip()}")
            
            result = subprocess.run([
                'npm', '--version'
            ], capture_output=True, text=True, check=True)
            
            logger.info(f"npm version: {result.stdout.strip()}")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install Node.js: {e}")
            raise
    
    def _copy_react_files(self):
        """Copy React application files"""
        logger.info("Copying React application files")
        
        source_dir = self.source_dir
        
        if not source_dir.exists():
            logger.warning(f"React source directory not found: {source_dir}")
            return
        
        # Create destination directory
        dest_dir = self.frontend_dir
        
        # Copy files recursively
        import shutil
        try:
            if dest_dir.exists():
                shutil.rmtree(dest_dir)
            
            shutil.copytree(source_dir, dest_dir)
            logger.info(f"Copied React files from {source_dir} to {dest_dir}")
            
            # Set ownership
            chownr(dest_dir, 'quantum-goose', 'quantum-goose')
            
        except Exception as e:
            logger.error(f"Failed to copy React files: {e}")
            raise
    
    def _install_react_dependencies(self):
        """Install React dependencies"""
        logger.info("Installing React dependencies")
        
        # Check if package.json exists
        package_json = self.frontend_dir / "package.json"
        if not package_json.exists():
            logger.warning("package.json not found, creating default")
            self._create_default_package_json()
        
        try:
            # Install dependencies
            subprocess.run([
                'npm', 'ci',  # Use CI for faster, more reliable installs
                '--production=false',  # Include dev dependencies for build
                '--prefer-offline',
                '--no-audit',
                '--no-fund'
            ], check=True, capture_output=True, cwd=str(self.frontend_dir))
            
            # Set ownership
            chownr(self.node_modules_dir, 'quantum-goose', 'quantum-goose')
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install React dependencies: {e}")
            # Try with npm install as fallback
            try:
                subprocess.run([
                    'npm', 'install',
                    '--production=false',
                    '--prefer-offline'
                ], check=True, capture_output=True, cwd=str(self.frontend_dir))
                
                chownr(self.node_modules_dir, 'quantum-goose', 'quantum-goose')
                
            except subprocess.CalledProcessError as e2:
                logger.error(f"Fallback npm install failed: {e2}")
                raise
    
    def _create_default_package_json(self):
        """Create default package.json for React app"""
        logger.info("Creating default package.json")
        
        package_json_content = '''{
  "name": "quantum-goose-frontend",
  "version": "1.0.0",
  "description": "Quantum Goose React Frontend",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0",
    "react-router-dom": "^6.14.2",
    "react-markdown": "^8.0.7",
    "react-syntax-highlighter": "^15.5.0",
    "prismjs": "^1.29.0",
    "socket.io-client": "^4.7.2",
    "recharts": "^2.7.2",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.14.1",
    "@mui/icons-material": "^5.14.1",
    "@mui/system": "^5.14.1",
    "lodash": "^4.17.21",
    "moment": "^2.29.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@types/lodash": "^4.14.195",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8000"
}'''
        
        write_file(
            path=str(self.frontend_dir / "package.json"),
            content=package_json_content,
            owner='quantum-goose',
            group='quantum-goose',
            perms=0o644
        )
    
    def _build_react_application(self):
        """Build React application for production"""
        logger.info("Building React application")
        
        build_mode = hookenv.config().get('react-build-mode', 'production')
        
        # Set environment variables
        env = os.environ.copy()
        env['NODE_ENV'] = build_mode
        
        # API URL configuration
        api_url = hookenv.config().get('react-api-url', '')
        if api_url:
            env['REACT_APP_API_URL'] = api_url
        
        try:
            # Clean previous build
            if self.build_dir.exists():
                import shutil
                shutil.rmtree(self.build_dir)
            
            # Build application
            subprocess.run([
                'npm', 'run', 'build'
            ], check=True, capture_output=True, cwd=str(self.frontend_dir), env=env)
            
            # Set ownership
            chownr(self.build_dir, 'quantum-goose', 'quantum-goose')
            
            logger.info(f"React application built successfully in {self.build_dir}")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"React build failed: {e}")
            logger.error(f"Build output: {e.stdout}")
            logger.error(f"Build error: {e.stderr}")
            raise
    
    def _update_react_environment(self):
        """Update React environment variables"""
        logger.info("Updating React environment variables")
        
        # Read current configuration
        config = hookenv.config()
        
        # Environment variables for React
        env_vars = {
            'REACT_APP_API_URL': config.get('react-api-url', ''),
            'REACT_APP_WEBSOCKET_URL': config.get('react-api-url', '').replace('http', 'ws'),
            'REACT_APP_DEBUG': str(config.get('django-debug', False)).lower(),
            'REACT_APP_LLM_PROVIDER': config.get('llm-provider', 'simulation'),
        }
        
        # Create .env.production file for production builds
        if config.get('react-build-mode') == 'production':
            env_file = self.frontend_dir / ".env.production"
            
            env_content = "\\n".join([
                f"{key}={value}" for key, value in env_vars.items() if value
            ])
            
            write_file(
                path=str(env_file),
                content=env_content,
                owner='quantum-goose',
                group='quantum-goose',
                perms=0o644
            )
    
    def _rebuild_react_application(self):
        """Rebuild React application with updated configuration"""
        logger.info("Rebuilding React application")
        
        # Update environment
        self._update_react_environment()
        
        # Rebuild
        try:
            # Clean and rebuild
            import shutil
            if self.build_dir.exists():
                shutil.rmtree(self.build_dir)
            
            self._build_react_application()
            
            logger.info("React application rebuilt successfully")
            
        except Exception as e:
            logger.error(f"React rebuild failed: {e}")
            raise
    
    def get_react_logs(self, lines: int = 100) -> str:
        """Get React build logs"""
        log_file = base_layer.log_dir / "react-build.log"
        
        try:
            if log_file.exists():
                result = subprocess.run([
                    'tail', '-n', str(lines), str(log_file)
                ], capture_output=True, text=True, check=True)
                return result.stdout
            else:
                return "React logs not found"
        except subprocess.CalledProcessError as e:
            return f"Error reading React logs: {e}"
    
    def get_build_size(self) -> Dict[str, int]:
        """Get React build size information"""
        try:
            build_stats = {
                'total_size': 0,
                'js_files': 0,
                'css_files': 0,
                'assets': 0
            }
            
            if not self.build_dir.exists():
                return build_stats
            
            for root, dirs, files in os.walk(self.build_dir):
                for file in files:
                    file_path = Path(root) / file
                    file_size = file_path.stat().st_size
                    build_stats['total_size'] += file_size
                    
                    if file_path.suffix == '.js':
                        build_stats['js_files'] += 1
                    elif file_path.suffix == '.css':
                        build_stats['css_files'] += 1
                    else:
                        build_stats['assets'] += 1
            
            return build_stats
            
        except Exception as e:
            logger.error(f"Failed to get build size: {e}")
            return {'total_size': 0, 'js_files': 0, 'css_files': 0, 'assets': 0}
    
    def validate_build(self) -> bool:
        """Validate React build integrity"""
        logger.info("Validating React build")
        
        try:
            # Check if build directory exists
            if not self.build_dir.exists():
                logger.error("React build directory not found")
                return False
            
            # Check for required files
            required_files = [
                'index.html',
                'static/js',
                'static/css'
            ]
            
            for required_file in required_files:
                if not (self.build_dir / required_file).exists():
                    logger.error(f"Required file/directory missing: {required_file}")
                    return False
            
            # Check if build has content
            if not any(self.build_dir.iterdir()):
                logger.error("React build directory is empty")
                return False
            
            logger.info("React build validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Build validation failed: {e}")
            return False
    
    def serve_static_files(self) -> Dict[str, str]:
        """Get static file serving configuration"""
        return {
            'build_dir': str(self.build_dir),
            'static_url': '/static/',
            'media_url': '/media/',
            'index_file': str(self.build_dir / 'index.html'),
        }


# Create React layer instance
react_layer = ReactLayer()
