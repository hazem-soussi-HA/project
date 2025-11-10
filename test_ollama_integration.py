#!/usr/bin/env python3
"""
Test script for HAZoom-Ollama integration
"""
import requests
import json
import time

BASE_URL = "http://localhost:9000/quantum-goose-app/api"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    response = requests.get(f"{BASE_URL}/llm/health/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check passed!")
        print(f"   Status: {data['status']}")
        print(f"   Ollama Available: {data['ollama_available']}")
        print(f"   Model: {data['ollama_model']}")
        print(f"   Intelligence Level: {data['intelligence_level']}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def test_simple_chat():
    """Test simple chat message"""
    print("\n💬 Testing simple chat...")
    
    payload = {
        "message": "Hello HAZoom! What is your purpose?",
        "stream": False,
        "intelligence_level": "standard"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/llm/chat/",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat successful!")
            print(f"   Response: {data['response'][:200]}...")
            print(f"   Session ID: {data['session_id']}")
            return True
        else:
            print(f"❌ Chat failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Chat request timed out - Ollama might be processing...")
        return False
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return False

def test_streaming_chat():
    """Test streaming chat"""
    print("\n🌊 Testing streaming chat...")
    
    payload = {
        "message": "Tell me about quantum consciousness",
        "stream": True,
        "intelligence_level": "super"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/llm/chat/",
            json=payload,
            stream=True,
            timeout=60
        )
        
        if response.status_code == 200:
            print("✅ Streaming started!")
            tokens_received = 0
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        try:
                            data = json.loads(line[6:])
                            if 'token' in data:
                                tokens_received += 1
                                print(data['token'], end='', flush=True)
                            elif 'status' in data:
                                print(f"\n\n✅ Streaming completed! Status: {data['status']}")
                                break
                        except json.JSONDecodeError:
                            continue
            
            print(f"   Tokens received: {tokens_received}")
            return True
        else:
            print(f"❌ Streaming failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Streaming error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 HAZoom-Ollama Integration Test Suite")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_simple_chat,
        test_streaming_chat
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! HAZoom-Ollama integration is working!")
    else:
        print("⚠️  Some tests failed. Check the logs above.")

if __name__ == "__main__":
    main()