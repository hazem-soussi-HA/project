# 🔌 Flask WebSocket Service for HAZoom

## ⚠️ Important Note

**You probably DON'T need this!**

Your Django backend already supports streaming with Server-Sent Events (SSE), which is sufficient for most use cases including HAZoom LLM streaming responses.

## 🤔 When to Use This Flask Service

Add Flask WebSocket **ONLY** if you need:

1. **Bidirectional Real-Time Communication**
   - Client and server both send messages continuously
   - Example: Live collaborative editing, multiplayer games

2. **Chat Rooms / Multi-User Sessions**
   - Multiple users in same chat room
   - See who's typing
   - Broadcast messages to groups

3. **Live Collaboration Features**
   - Real-time code collaboration
   - Shared whiteboard
   - Live cursor positions

4. **Gaming or Real-Time Apps**
   - Need <100ms latency
   - Frequent state updates
   - Server pushes to multiple clients

## 📊 Django SSE vs Flask WebSocket

| Feature | Django SSE (Current) | Flask WebSocket |
|---------|---------------------|-----------------|
| **Streaming LLM** | ✅ Perfect | ✅ Works |
| **One-way updates** | ✅ Perfect | ⚠️ Overkill |
| **Chat rooms** | ⚠️ Limited | ✅ Perfect |
| **Typing indicators** | ❌ Hard | ✅ Easy |
| **Multiplayer** | ❌ No | ✅ Yes |
| **Setup complexity** | ✅ Simple | ⚠️ More complex |
| **Resource usage** | ✅ Lower | ⚠️ Higher |
| **Browser support** | ✅ All modern | ✅ All modern |

**Verdict:** If you're happy with current streaming, **don't add this!**

## 🚀 Quick Start (If You Really Need It)

### 1. Install Dependencies

```bash
cd D:\project\flask_services
pip install -r requirements_flask.txt
```

### 2. Start Flask Server

```bash
python websocket_example.py
```

Server will run on: **http://localhost:5000**

### 3. Update React Frontend

Install Socket.IO client:

```bash
cd D:\project\quantum-goose-app
npm install socket.io-client
```

### 4. Connect from React

```javascript
// src/services/websocketService.js
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected!');
    });

    this.socket.on('status', (data) => {
      console.log('Status:', data);
    });

    this.socket.on('new_message', (data) => {
      console.log('New message:', data);
    });

    this.socket.on('llm_token', (data) => {
      console.log('LLM token:', data.token);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(room) {
    this.socket.emit('join_room', { room });
  }

  sendMessage(message, room = 'general') {
    this.socket.emit('message', { message, room });
  }

  requestLLM(message, intelligenceLevel = 'super') {
    this.socket.emit('llm_request', { 
      message, 
      intelligence_level: intelligenceLevel 
    });
  }

  onMessage(callback) {
    this.socket.on('new_message', callback);
  }

  onLLMToken(callback) {
    this.socket.on('llm_token', callback);
  }
}

export default new WebSocketService();
```

### 5. Use in React Component

```javascript
import React, { useEffect, useState } from 'react';
import websocketService from '../services/websocketService';

function WebSocketChat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect
    websocketService.connect();

    // Listen for messages
    websocketService.onMessage((data) => {
      setMessages(prev => [...prev, data]);
    });

    // Cleanup
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const sendMessage = (text) => {
    websocketService.sendMessage(text, 'general');
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>{msg.user}: {msg.message}</div>
      ))}
    </div>
  );
}
```

## 🔧 Configuration

### Port Configuration

Flask runs on port **5000** by default. If that's taken:

```python
# In websocket_example.py
socketio.run(app, host='0.0.0.0', port=5001)  # Use different port
```

### CORS Configuration

Allow your React app:

```python
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"]
    }
})
```

## 🎯 Available Events

### Client → Server

- `connect` - Establish connection
- `disconnect` - Close connection
- `join_room` - Join chat room
- `leave_room` - Leave chat room
- `message` - Send chat message
- `llm_request` - Request LLM response
- `typing` - Send typing indicator
- `get_stats` - Request server stats

### Server → Client

- `status` - Connection status
- `room_joined` - Confirmed room join
- `new_message` - New chat message
- `llm_token` - Streaming LLM token
- `llm_complete` - LLM response complete
- `user_typing` - User typing notification
- `stats` - Server statistics

## 🔗 Integration with Django

To connect Flask WebSocket with your Django LLM backend:

```python
import requests

@socketio.on('llm_request')
def handle_llm_request(data):
    message = data.get('message', '')
    
    # Call Django backend
    response = requests.post(
        'http://localhost:9001/quantum-goose-app/api/llm/chat/',
        json={
            'message': message,
            'stream': False
        }
    )
    
    if response.ok:
        result = response.json()
        emit('llm_response', {
            'response': result['response'],
            'intelligence_level': result['intelligence_level']
        })
```

## 📊 Performance Comparison

### Your Current Setup (Django SSE):
- Memory: ~100MB
- Connections: 1 server
- Latency: ~50-200ms (fine for streaming)
- Complexity: Low

### With Flask WebSocket Added:
- Memory: ~150MB (both servers)
- Connections: 2 servers
- Latency: ~10-50ms (better for real-time)
- Complexity: Medium

**Question:** Do you need that extra speed for your use case? 🤔

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### CORS Errors
Add your frontend URL to CORS config:
```python
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
```

### Connection Refused
1. Check Flask server is running
2. Verify port 5000 is open
3. Check firewall settings

## 💡 Recommendation

**For HAZoom Project:**

1. ✅ **Keep using Django SSE** for LLM streaming (current setup)
2. ⏸️ **Don't add Flask yet** unless you need specific features
3. 🎯 **Add Flask only if** you want:
   - Multi-user chat rooms
   - Live collaboration
   - Typing indicators
   - Real-time gaming features

**Your current setup is perfect for AI chat!** The Flask WebSocket is here if you need it in the future.

## 🌊 Peace & Performance

Remember: Simpler is better! Don't add complexity unless you need the features. Your Django + SSE setup is already optimized for peace and performance. 🚀
