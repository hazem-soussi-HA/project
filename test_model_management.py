#!/usr/bin/env python3
"""Test script for model management functionality."""

import sys
import os
sys.path.append('/d/project')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quantum_goose_project.settings')

import django
django.setup()

from quantum_goose_app.llm_backend import LLMBackend

def test_model_management():
    """Test model management functions."""
    print("=== Model Management Test ===")
    
    # Create backend instance
    backend = LLMBackend()
    
    print(f"Ollama available: {backend.ollama_available}")
    print(f"Current model: {backend.ollama_model}")
    
    if backend.ollama_available:
        # Test getting available models
        print("\n--- Testing get_available_models ---")
        models = backend.get_available_models()
        print(f"Found {len(models)} models:")
        for model in models[:3]:  # Show first 3 models
            print(f"  - {model['name']} ({model.get('size', 0)} bytes)")
        
        # Test getting model info for current model
        if models:
            print(f"\n--- Testing get_model_info for {backend.ollama_model} ---")
            model_info = backend.get_model_info(backend.ollama_model)
            if model_info:
                print("Model info retrieved successfully")
                print(f"  Details: {model_info.get('details', {})}")
            else:
                print("Failed to get model info")
        
        # Test setting model (only if multiple models available)
        if len(models) > 1:
            other_model = models[0]['name'] if models[0]['name'] != backend.ollama_model else models[1]['name']
            print(f"\n--- Testing set_model to {other_model} ---")
            success = backend.set_model(other_model)
            print(f"Set model success: {success}")
            print(f"Current model now: {backend.ollama_model}")
            
            # Set back to original
            backend.set_model(models[0]['name'])
    else:
        print("\n--- Ollama not available ---")
        print("Start Ollama with: ollama serve")
        print("Install a model with: ollama pull glm-4.6:cloud")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_model_management()