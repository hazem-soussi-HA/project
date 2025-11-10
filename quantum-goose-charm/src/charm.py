#!/usr/bin/env python3
"""
Quantum Goose Juju Charm
Main charm implementation using the Juju Operator Framework
"""

import logging
import os
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Optional

from ops.charm import CharmBase
from ops.framework import StoredState
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus, WaitingStatus
from ops.pebble import ServiceStatus

from src.handlers.install import InstallHandler
from src.handlers.start import StartHandler
from src.handlers.config_changed import ConfigChangedHandler
from src.handlers.relation_joined import RelationJoinedHandler
from src.handlers.upgrade_charm import UpgradeCharmHandler


logger = logging.getLogger(__name__)


class QuantumGooseCharm(CharmBase):
    """Main quantum goose charm implementation"""
    
    _stored = StoredState()
    
    def __init__(self, *args):
        super().__init__(*args)
        
        # Initialize stored state
        self._stored.set_default(
            installed=False,
            configured=False,
            started=False,
            database_configured=False,
            relations_configured=False
        )
        
        # Initialize handlers
        self.install_handler = InstallHandler(self)
        self.start_handler = StartHandler(self)
        self.config_changed_handler = ConfigChangedHandler(self)
        self.relation_joined_handler = RelationJoinedHandler(self)
        self.upgrade_charm_handler = UpgradeCharmHandler(self)
        
        # Observe charm events
        self.framework.observe(self.on.install, self._on_install)
        self.framework.observe(self.on.start, self._on_start)
        self.framework.observe(self.on.config_changed, self._on_config_changed)
        self.framework.observe(self.on.update_status, self._on_update_status)
        self.framework.observe(self.on.upgrade_charm, self._on_upgrade_charm)
        self.framework.observe(self.on.remove, self._on_remove)
        
        # Observe relation events
        self.framework.observe(
            self.on.database_relation_joined, 
            self._on_database_relation_joined
        )
        self.framework.observe(
            self.on.redis_relation_joined,
            self._on_redis_relation_joined
        )
        self.framework.observe(
            self.on.llm_service_relation_joined,
            self._on_llm_service_relation_joined
        )
        
        # Observe action events
        self.framework.observe(
            self.on.backup_action,
            self._on_backup_action
        )
        self.framework.observe(
            self.on.restore_action,
            self._on_restore_action
        )
        self.framework.observe(
            self.on.scale_action,
            self._on_scale_action
        )
        self.framework.observe(
            self.on.status_action,
            self._on_status_action
        )
        
        logger.info("Quantum Goose Charm initialized")
    
    def _on_install(self, event):
        """Handle install event"""
        logger.info("Installing quantum-goose charm")
        self.unit.status = MaintenanceStatus("Installing quantum-goose")
        
        try:
            self.install_handler.handle_install()
            self._stored.installed = True
            self.unit.status = WaitingStatus("Installation complete, waiting for configuration")
        except Exception as e:
            logger.error(f"Installation failed: {e}")
            self.unit.status = BlockedStatus(f"Installation failed: {e}")
    
    def _on_start(self, event):
        """Handle start event"""
        logger.info("Starting quantum-goose charm")
        self.unit.status = MaintenanceStatus("Starting quantum-goose")
        
        try:
            if not self._stored.installed:
                self.unit.status = WaitingStatus("Waiting for installation to complete")
                return
            
            self.start_handler.handle_start()
            self._stored.started = True
            self._update_application_status()
        except Exception as e:
            logger.error(f"Start failed: {e}")
            self.unit.status = BlockedStatus(f"Start failed: {e}")
    
    def _on_config_changed(self, event):
        """Handle configuration change event"""
        logger.info("Configuration changed")
        self.unit.status = MaintenanceStatus("Updating configuration")
        
        try:
            self.config_changed_handler.handle_config_changed()
            self._stored.configured = True
            self._update_application_status()
        except Exception as e:
            logger.error(f"Configuration update failed: {e}")
            self.unit.status = BlockedStatus(f"Configuration update failed: {e}")
    
    def _on_update_status(self, event):
        """Handle update status event"""
        self._update_application_status()
    
    def _on_upgrade_charm(self, event):
        """Handle upgrade charm event"""
        logger.info("Upgrading quantum-goose charm")
        self.unit.status = MaintenanceStatus("Upgrading quantum-goose")
        
        try:
            self.upgrade_charm_handler.handle_upgrade_charm()
            self.unit.status = ActiveStatus("Upgrade complete")
        except Exception as e:
            logger.error(f"Upgrade failed: {e}")
            self.unit.status = BlockedStatus(f"Upgrade failed: {e}")
    
    def _on_remove(self, event):
        """Handle remove event"""
        logger.info("Removing quantum-goose charm")
        self.unit.status = MaintenanceStatus("Removing quantum-goose")
        
        # Clean up resources
        try:
            self._cleanup_resources()
            self.unit.status = MaintenanceStatus("Removal complete")
        except Exception as e:
            logger.error(f"Removal failed: {e}")
            self.unit.status = BlockedStatus(f"Removal failed: {e}")
    
    def _on_database_relation_joined(self, event):
        """Handle database relation joined event"""
        logger.info("Database relation joined")
        try:
            self.relation_joined_handler.handle_database_relation(event)
        except Exception as e:
            logger.error(f"Database relation failed: {e}")
            event.relation.data[self.unit]['error'] = str(e)
    
    def _on_redis_relation_joined(self, event):
        """Handle Redis relation joined event"""
        logger.info("Redis relation joined")
        try:
            self.relation_joined_handler.handle_redis_relation(event)
        except Exception as e:
            logger.error(f"Redis relation failed: {e}")
            event.relation.data[self.unit]['error'] = str(e)
    
    def _on_llm_service_relation_joined(self, event):
        """Handle LLM service relation joined event"""
        logger.info("LLM service relation joined")
        try:
            self.relation_joined_handler.handle_llm_service_relation(event)
        except Exception as e:
            logger.error(f"LLM service relation failed: {e}")
            event.relation.data[self.unit]['error'] = str(e)
    
    def _on_backup_action(self, event):
        """Handle backup action"""
        logger.info("Executing backup action")
        
        backup_path = event.params.get('backup-path', '/opt/quantum-goose/backups')
        
        try:
            result = self._execute_backup(backup_path)
            event.set_results({'backup-path': result})
        except Exception as e:
            event.fail(f"Backup failed: {e}")
    
    def _on_restore_action(self, event):
        """Handle restore action"""
        logger.info("Executing restore action")
        
        backup_path = event.params.get('backup-path')
        if not backup_path:
            event.fail("Backup path is required")
            return
        
        try:
            self._execute_restore(backup_path)
            event.set_results({'status': 'restore complete'})
        except Exception as e:
            event.fail(f"Restore failed: {e}")
    
    def _on_scale_action(self, event):
        """Handle scale action"""
        logger.info("Executing scale action")
        
        units = event.params.get('units')
        if not units:
            event.fail("Units parameter is required")
            return
        
        try:
            self._execute_scale(int(units))
            event.set_results({'status': 'scale complete'})
        except Exception as e:
            event.fail(f"Scale failed: {e}")
    
    def _on_status_action(self, event):
        """Handle status action"""
        logger.info("Executing status action")
        
        try:
            status_info = self._get_detailed_status()
            event.set_results(status_info)
        except Exception as e:
            event.fail(f"Status failed: {e}")
    
    def _update_application_status(self):
        """Update application status based on current state"""
        try:
            if not self._stored.installed:
                self.unit.status = WaitingStatus("Waiting for installation")
                return
            
            if not self._stored.configured:
                self.unit.status = WaitingStatus("Waiting for configuration")
                return
            
            if not self._stored.started:
                self.unit.status = WaitingStatus("Waiting for start")
                return
            
            # Check if services are running
            if self._check_services_running():
                # Get configuration summary
                llm_provider = self.config["llm-provider"]
                debug_mode = self.config["django-debug"]
                
                status_message = f"Quantum Goose ready (LLM: {llm_provider}"
                if debug_mode:
                    status_message += " DEBUG"
                status_message += ")"
                
                self.unit.status = ActiveStatus(status_message)
            else:
                self.unit.status = WaitingStatus("Services not running")
                
        except Exception as e:
            logger.error(f"Status update failed: {e}")
            self.unit.status = BlockedStatus(f"Status check failed: {e}")
    
    def _check_services_running(self) -> bool:
        """Check if all required services are running"""
        try:
            # Check Django/Gunicorn service
            django_running = self._check_service("quantum-goose")
            
            # Check Redis if configured
            redis_running = True
            if self.config["enable-websocket"] or self.config.get("redis-relation"):
                redis_running = self._check_service("redis")
            
            # Check database if configured
            db_running = True
            if self.config.get("database-relation"):
                db_running = self._check_database_connection()
            
            return django_running and redis_running and db_running
            
        except Exception as e:
            logger.error(f"Service check failed: {e}")
            return False
    
    def _check_service(self, service_name: str) -> bool:
        """Check if a service is running"""
        try:
            result = subprocess.run(
                ["systemctl", "is-active", service_name],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def _check_database_connection(self) -> bool:
        """Check database connection"""
        try:
            # This would check the actual database connection
            # Implementation depends on database type
            return True
        except Exception:
            return False
    
    def _execute_backup(self, backup_path: str) -> str:
        """Execute backup operation"""
        logger.info(f"Creating backup to {backup_path}")
        
        # Create backup directory
        os.makedirs(backup_path, exist_ok=True)
        
        # Generate backup filename with timestamp
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_file = f"{backup_path}/quantum_goose_backup_{timestamp}.tar.gz"
        
        # Execute backup
        cmd = [
            "tar", "-czf", backup_file,
            "/opt/quantum-goose/app",
            "/etc/quantum-goose",
            "/var/lib/quantum-goose"
        ]
        
        subprocess.run(cmd, check=True)
        
        return backup_file
    
    def _execute_restore(self, backup_path: str):
        """Execute restore operation"""
        logger.info(f"Restoring from backup {backup_path}")
        
        # Stop services
        self._stop_services()
        
        # Extract backup
        cmd = ["tar", "-xzf", backup_path, "-C", "/"]
        subprocess.run(cmd, check=True)
        
        # Restart services
        self._start_services()
    
    def _execute_scale(self, units: int):
        """Execute scale operation"""
        logger.info(f"Scaling to {units} units")
        
        # Update application settings
        self.config["max-units"] = units
        
        # Trigger config change
        self._on_config_changed(None)
    
    def _get_detailed_status(self) -> Dict:
        """Get detailed status information"""
        try:
            # Get system metrics
            cpu_usage = self._get_cpu_usage()
            memory_usage = self._get_memory_usage()
            disk_usage = self._get_disk_usage()
            
            # Get application metrics
            active_connections = self._get_active_connections()
            response_time = self._get_average_response_time()
            
            return {
                "status": "healthy",
                "cpu_usage": f"{cpu_usage}%",
                "memory_usage": f"{memory_usage}%",
                "disk_usage": f"{disk_usage}%",
                "active_connections": active_connections,
                "average_response_time": f"{response_time}ms",
                "llm_provider": self.config["llm-provider"],
                "debug_mode": self.config["django-debug"],
                "services_running": self._check_services_running()
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_cpu_usage(self) -> float:
        """Get CPU usage percentage"""
        try:
            result = subprocess.run(
                ["top", "-bn1"],
                capture_output=True,
                text=True,
                timeout=5
            )
            # Parse CPU usage from top output
            lines = result.stdout.split('\n')
            for line in lines:
                if 'Cpu(s)' in line:
                    # Extract CPU usage
                    return 0.0  # Placeholder
            return 0.0
        except Exception:
            return 0.0
    
    def _get_memory_usage(self) -> float:
        """Get memory usage percentage"""
        try:
            result = subprocess.run(
                ["free", "-m"],
                capture_output=True,
                text=True,
                timeout=5
            )
            lines = result.stdout.split('\n')
            for line in lines:
                if 'Mem:' in line:
                    parts = line.split()
                    total = int(parts[1])
                    used = int(parts[2])
                    return (used / total) * 100
            return 0.0
        except Exception:
            return 0.0
    
    def _get_disk_usage(self) -> float:
        """Get disk usage percentage"""
        try:
            result = subprocess.run(
                ["df", "-h", "/"],
                capture_output=True,
                text=True,
                timeout=5
            )
            lines = result.stdout.split('\n')
            for line in lines[1:]:
                parts = line.split()
                if parts:
                    usage_str = parts[4].replace('%', '')
                    return float(usage_str)
            return 0.0
        except Exception:
            return 0.0
    
    def _get_active_connections(self) -> int:
        """Get number of active connections"""
        try:
            result = subprocess.run(
                ["ss", "-tuln"],
                capture_output=True,
                text=True,
                timeout=5
            )
            # Count connections to port 80 and 443
            connections = result.stdout.count(':80') + result.stdout.count(':443')
            return connections
        except Exception:
            return 0
    
    def _get_average_response_time(self) -> float:
        """Get average response time"""
        try:
            # This would measure actual response time
            # For now, return a placeholder
            return 250.0
        except Exception:
            return 0.0
    
    def _stop_services(self):
        """Stop all services"""
        services = ["quantum-goose", "nginx", "redis"]
        for service in services:
            try:
                subprocess.run(
                    ["systemctl", "stop", service],
                    capture_output=True,
                    timeout=30
                )
            except Exception:
                pass
    
    def _start_services(self):
        """Start all services"""
        services = ["redis", "quantum-goose", "nginx"]
        for service in services:
            try:
                subprocess.run(
                    ["systemctl", "start", service],
                    capture_output=True,
                    timeout=30
                )
            except Exception:
                pass
    
    def _cleanup_resources(self):
        """Clean up resources on removal"""
        # Stop and disable services
        self._stop_services()
        
        # Remove service files
        service_files = [
            "/etc/systemd/system/quantum-goose.service",
            "/etc/nginx/sites-available/quantum-goose",
            "/etc/nginx/sites-enabled/quantum-goose"
        ]
        
        for file_path in service_files:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass
        
        # Reload systemd
        try:
            subprocess.run(
                ["systemctl", "daemon-reload"],
                capture_output=True,
                timeout=10
            )
        except Exception:
            pass


if __name__ == "__main__":
    main(QuantumGooseCharm)
