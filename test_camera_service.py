#!/usr/bin/env python3
"""Test script for camera service functionality."""

import sys
import os
sys.path.append('/d/project')

from quantum_goose_app.camera_service import (
    camera_ready, 
    generate_placeholder_frame, 
    CameraUnavailableError
)

def test_camera_service():
    """Test camera service functions."""
    print("=== Quantum Camera Service Test ===")
    
    # Test camera readiness
    print(f"Camera ready: {camera_ready()}")
    
    # Test placeholder frame generation
    placeholder = generate_placeholder_frame()
    if placeholder:
        print(f"Placeholder frame generated: {len(placeholder)} bytes")
    else:
        print("Placeholder frame not generated (OpenCV unavailable)")
    
    # Test error handling
    try:
        from quantum_goose_app.camera_service import frame_generator
        generator = frame_generator()
        print("Frame generator created successfully")
    except CameraUnavailableError as e:
        print(f"Expected CameraUnavailableError: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    
    print("=== Test Complete ===")

if __name__ == "__main__":
    test_camera_service()