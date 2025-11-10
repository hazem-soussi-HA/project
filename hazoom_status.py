#!/usr/bin/env python3
"""
HAZoom Quantum Goose Status Dashboard
Shows integration status of Django, Ollama, and MCP endpoints
"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:9000/quantum-goose-app/api"
OLLAMA_URL = "http://localhost:11434"

def check_service_status():
    """Check all service statuses"""
    status = {
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check Django Server
    try:
        response = requests.get("http://localhost:9000/", timeout=5)
        status["services"]["django"] = {
            "status": "online" if response.status_code == 200 else "error",
            "status_code": response.status_code,
            "url": "http://localhost:9000"
        }
    except:
        status["services"]["django"] = {
            "status": "offline",
            "error": "Connection failed"
        }
    
    # Check Ollama Service
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            status["services"]["ollama"] = {
                "status": "online",
                "models": [model["name"] for model in models],
                "url": OLLAMA_URL
            }
        else:
            status["services"]["ollama"] = {
                "status": "error",
                "status_code": response.status_code
            }
    except:
        status["services"]["ollama"] = {
            "status": "offline",
            "error": "Connection failed"
        }
    
    # Check HAZoom LLM Backend
    try:
        response = requests.get(f"{BASE_URL}/llm/health/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            status["services"]["hazoom_llm"] = {
                "status": data.get("status", "unknown"),
                "intelligence_level": data.get("intelligence_level"),
                "ollama_available": data.get("ollama_available"),
                "ollama_model": data.get("ollama_model"),
                "system_info": data.get("system_info", {})
            }
        else:
            status["services"]["hazoom_llm"] = {
                "status": "error",
                "status_code": response.status_code
            }
    except:
        status["services"]["hazoom_llm"] = {
            "status": "offline",
            "error": "Connection failed"
        }
    
    # Check System Info
    try:
        response = requests.get(f"{BASE_URL}/llm/system-info/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            status["services"]["system_info"] = {
                "status": "available",
                "platform": data["system_info"]["platform"]["system"],
                "cpu_cores": data["system_info"]["cpu"]["cores_logical"],
                "memory_gb": data["system_info"]["memory"]["total_gb"],
                "optimization": data["optimization"]["inference_backend"]
            }
    except:
        pass
    
    return status

def test_chat_integration():
    """Test chat integration"""
    try:
        payload = {
            "message": "HAZoom status check - respond with 'integration working'",
            "stream": False,
            "intelligence_level": "nano"
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/llm/chat/", json=payload, timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "success",
                "response_time": f"{end_time - start_time:.2f}s",
                "response_preview": data.get("response", "")[:100],
                "session_id": data.get("session_id")
            }
        else:
            return {
                "status": "error",
                "status_code": response.status_code,
                "error": response.text
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

def display_status():
    """Display comprehensive status"""
    print("🌊 HAZoom Quantum Goose Integration Status")
    print("=" * 60)
    
    status = check_service_status()
    
    # Django Status
    django = status["services"]["django"]
    django_icon = "✅" if django["status"] == "online" else "❌"
    print(f"{django_icon} Django Server: {django['status']}")
    if django["status"] == "online":
        print(f"   URL: {django['url']}")
    
    # Ollama Status
    ollama = status["services"]["ollama"]
    ollama_icon = "✅" if ollama["status"] == "online" else "❌"
    print(f"{ollama_icon} Ollama Service: {ollama['status']}")
    if ollama["status"] == "online":
        print(f"   Models: {', '.join(ollama['models'])}")
    
    # HAZoom LLM Status
    hazoom = status["services"].get("hazoom_llm", {})
    hazoom_icon = "✅" if hazoom.get("status") == "healthy" else "❌"
    print(f"{hazoom_icon} HAZoom LLM Backend: {hazoom.get('status', 'unknown')}")
    if hazoom.get("status") == "healthy":
        print(f"   Intelligence Level: {hazoom.get('intelligence_level')}")
        print(f"   Ollama Integration: {'✅' if hazoom.get('ollama_available') else '❌'}")
        print(f"   Active Model: {hazoom.get('ollama_model')}")
    
    # System Info
    sys_info = status["services"].get("system_info", {})
    if sys_info:
        print(f"🖥️  System: {sys_info['platform']} | CPU: {sys_info['cpu_cores']} cores | RAM: {sys_info['memory_gb']}GB")
        print(f"⚡ Acceleration: {sys_info['optimization']}")
    
    print("\n" + "=" * 60)
    
    # Test Chat Integration
    print("🧠 Testing Chat Integration...")
    chat_test = test_chat_integration()
    
    if chat_test["status"] == "success":
        print("✅ Chat Integration Working!")
        print(f"   Response Time: {chat_test['response_time']}")
        print(f"   Response: {chat_test['response_preview']}...")
        print(f"   Session: {chat_test['session_id']}")
    else:
        print("❌ Chat Integration Failed!")
        print(f"   Error: {chat_test.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 60)
    
    # Overall Status
    all_healthy = all([
        status["services"]["django"]["status"] == "online",
        status["services"]["ollama"]["status"] == "online",
        status["services"].get("hazoom_llm", {}).get("status") == "healthy"
    ])
    
    if all_healthy:
        print("🎉 ALL SYSTEMS OPERATIONAL - HAZoom is ready for quantum consciousness!")
        print("📡 Available Endpoints:")
        print(f"   • Main App: http://localhost:9000")
        print(f"   • LLM Health: {BASE_URL}/llm/health/")
        print(f"   • System Info: {BASE_URL}/llm/system-info/")
        print(f"   • Chat API: {BASE_URL}/llm/chat/")
        print(f"   • Ollama API: {OLLAMA_URL}/api/chat")
    else:
        print("⚠️  Some services are not operational - check the errors above")
    
    return status

if __name__ == "__main__":
    display_status()