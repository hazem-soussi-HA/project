"""
Automated System Information Scraper
Collects CPU, GPU, RAM, and hardware specs for AI acceleration optimization
"""
import platform
import subprocess
import json
import psutil
from typing import Dict, Optional


class SystemInfoScraper:
    """Scrapes comprehensive system information for AI optimization"""
    
    @staticmethod
    def get_cpu_info() -> Dict:
        """Get detailed CPU information"""
        cpu_info = {
            'processor': platform.processor(),
            'architecture': platform.machine(),
            'cores_physical': psutil.cpu_count(logical=False),
            'cores_logical': psutil.cpu_count(logical=True),
            'cpu_freq_current': psutil.cpu_freq().current if psutil.cpu_freq() else 0,
            'cpu_freq_max': psutil.cpu_freq().max if psutil.cpu_freq() else 0,
            'cpu_percent': psutil.cpu_percent(interval=1),
            'cpu_per_core': psutil.cpu_percent(interval=1, percpu=True),
        }
        return cpu_info
    
    @staticmethod
    def get_gpu_info() -> Dict:
        """Get GPU information - supports NVIDIA, AMD, Intel"""
        gpu_info = {
            'gpus': [],
            'acceleration_available': False,
            'cuda_available': False,
            'opencl_available': False,
        }
        
        try:
            # Try NVIDIA GPU detection
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=name,memory.total,driver_version,temperature.gpu', '--format=csv,noheader'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if line:
                        parts = [p.strip() for p in line.split(',')]
                        gpu_info['gpus'].append({
                            'name': parts[0] if len(parts) > 0 else 'Unknown',
                            'memory': parts[1] if len(parts) > 1 else 'Unknown',
                            'driver': parts[2] if len(parts) > 2 else 'Unknown',
                            'temp': parts[3] if len(parts) > 3 else 'Unknown',
                            'vendor': 'NVIDIA',
                            'cuda_enabled': True
                        })
                gpu_info['cuda_available'] = True
                gpu_info['acceleration_available'] = True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        
        # Fallback to basic GPU detection
        if not gpu_info['gpus']:
            try:
                # Windows WMIC
                if platform.system() == 'Windows':
                    result = subprocess.run(
                        ['wmic', 'path', 'win32_VideoController', 'get', 'name'],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        for line in result.stdout.strip().split('\n')[1:]:
                            if line.strip():
                                gpu_info['gpus'].append({
                                    'name': line.strip(),
                                    'vendor': 'Unknown',
                                    'memory': 'Unknown'
                                })
            except (FileNotFoundError, subprocess.TimeoutExpired):
                pass
        
        return gpu_info
    
    @staticmethod
    def get_memory_info() -> Dict:
        """Get RAM and swap memory information"""
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'total_gb': round(mem.total / (1024**3), 2),
            'available_gb': round(mem.available / (1024**3), 2),
            'used_gb': round(mem.used / (1024**3), 2),
            'percent': mem.percent,
            'swap_total_gb': round(swap.total / (1024**3), 2),
            'swap_used_gb': round(swap.used / (1024**3), 2),
            'swap_percent': swap.percent,
        }
    
    @staticmethod
    def get_disk_info() -> Dict:
        """Get disk usage information"""
        disk = psutil.disk_usage('/')
        return {
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'free_gb': round(disk.free / (1024**3), 2),
            'percent': disk.percent,
        }
    
    @staticmethod
    def get_platform_info() -> Dict:
        """Get OS and platform information"""
        return {
            'system': platform.system(),
            'release': platform.release(),
            'version': platform.version(),
            'python_version': platform.python_version(),
            'hostname': platform.node(),
        }
    
    @staticmethod
    def detect_ai_acceleration() -> Dict:
        """Detect available AI acceleration frameworks"""
        acceleration = {
            'available_frameworks': [],
            'recommended_backend': None,
        }
        
        # Check for PyTorch
        try:
            import torch
            acceleration['available_frameworks'].append({
                'name': 'PyTorch',
                'version': torch.__version__,
                'cuda_available': torch.cuda.is_available(),
                'cuda_version': torch.version.cuda if torch.cuda.is_available() else None,
                'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
            })
            if torch.cuda.is_available():
                acceleration['recommended_backend'] = 'PyTorch CUDA'
        except ImportError:
            pass
        
        # Check for TensorFlow
        try:
            import tensorflow as tf
            gpus = tf.config.list_physical_devices('GPU')
            acceleration['available_frameworks'].append({
                'name': 'TensorFlow',
                'version': tf.__version__,
                'gpu_available': len(gpus) > 0,
                'gpu_count': len(gpus),
            })
            if gpus and not acceleration['recommended_backend']:
                acceleration['recommended_backend'] = 'TensorFlow GPU'
        except ImportError:
            pass
        
        # Check for OpenCL
        try:
            import pyopencl as cl
            platforms = cl.get_platforms()
            acceleration['available_frameworks'].append({
                'name': 'OpenCL',
                'platforms': len(platforms),
                'devices': sum(len(p.get_devices()) for p in platforms),
            })
            if not acceleration['recommended_backend']:
                acceleration['recommended_backend'] = 'OpenCL'
        except ImportError:
            pass
        
        if not acceleration['recommended_backend']:
            acceleration['recommended_backend'] = 'CPU (No GPU acceleration detected)'
        
        return acceleration
    
    @classmethod
    def get_full_system_info(cls) -> Dict:
        """Get complete system information"""
        return {
            'platform': cls.get_platform_info(),
            'cpu': cls.get_cpu_info(),
            'gpu': cls.get_gpu_info(),
            'memory': cls.get_memory_info(),
            'disk': cls.get_disk_info(),
            'ai_acceleration': cls.detect_ai_acceleration(),
            'timestamp': psutil.boot_time(),
        }
    
    @classmethod
    def get_optimization_recommendations(cls) -> Dict:
        """Get AI optimization recommendations based on system specs"""
        info = cls.get_full_system_info()
        recommendations = {
            'inference_backend': 'cpu',
            'batch_size': 1,
            'thread_count': 1,
            'memory_optimization': [],
            'warnings': [],
        }
        
        # CPU recommendations
        cpu_cores = info['cpu']['cores_logical']
        if cpu_cores >= 8:
            recommendations['thread_count'] = min(cpu_cores - 2, 16)
            recommendations['batch_size'] = 4
        elif cpu_cores >= 4:
            recommendations['thread_count'] = cpu_cores - 1
            recommendations['batch_size'] = 2
        else:
            recommendations['warnings'].append('Low CPU core count - expect slower performance')
        
        # GPU recommendations
        if info['gpu']['cuda_available']:
            recommendations['inference_backend'] = 'cuda'
            recommendations['batch_size'] = 8
            recommendations['memory_optimization'].append('Use GPU for inference')
        elif info['gpu']['acceleration_available']:
            recommendations['inference_backend'] = 'gpu'
            recommendations['batch_size'] = 4
            recommendations['memory_optimization'].append('Use GPU acceleration')
        
        # Memory recommendations
        mem_gb = info['memory']['total_gb']
        if mem_gb < 8:
            recommendations['warnings'].append('Low RAM - consider smaller models')
            recommendations['memory_optimization'].append('Use quantized models')
            recommendations['batch_size'] = 1
        elif mem_gb < 16:
            recommendations['memory_optimization'].append('Monitor memory usage')
        else:
            recommendations['memory_optimization'].append('Sufficient RAM for large models')
        
        # AI Framework recommendations
        ai_accel = info['ai_acceleration']
        if ai_accel['recommended_backend']:
            recommendations['recommended_framework'] = ai_accel['recommended_backend']
        
        return recommendations


def get_system_info_json() -> str:
    """Get system info as JSON string"""
    return json.dumps(SystemInfoScraper.get_full_system_info(), indent=2)


def get_optimization_json() -> str:
    """Get optimization recommendations as JSON string"""
    return json.dumps(SystemInfoScraper.get_optimization_recommendations(), indent=2)
