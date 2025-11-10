"""
Flask WebSocket Example for HAZoom
Only use this if you need real-time bidirectional communication
Otherwise, Django SSE (Server-Sent Events) is sufficient!
"""

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import sys
import os

# Add parent directory to path to import Django models if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure Flask app with new path and settings
app = Flask(__name__)
app.config['SECRET_KEY'] = 'max-hazoom-secret-key-2025'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure CORS for the new domain
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:9000", "http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
    }
})

# Initialize SocketIO with optimized settings
socketio = SocketIO(
    app, 
    cors_allowed_origins=["http://localhost:9000", "http://localhost:3000", "http://localhost:5173"], 
    async_mode='threading',
    ping_timeout=60,
    ping_interval=25
)

# Store active users
active_users = {}
chat_rooms = {}

# Service information
SERVICE_INFO = {
    'name': 'Max-Hazoom Chat Service',
    'version': '1.0.0',
    'description': 'Real-time chat and WebSocket service for Max-Hazoom Navigator',
    'endpoints': {
        'websocket': '/socket.io',
        'health': '/health',
        'status': '/status',
        'api': '/api/v1'
    }
}


@app.route('/')
def index():
    """Serve the main Max-Hazoom React app"""
    return jsonify({
        'service': 'Max-Hazoom Chat Service',
        'status': 'running',
        'message': 'Welcome to Max-Hazoom Navigator!',
        'info': SERVICE_INFO,
        'endpoints': {
            'websocket': f"ws://localhost:5000{SERVICE_INFO['endpoints']['websocket']}",
            'health': f"http://localhost:5000{SERVICE_INFO['endpoints']['health']}",
            'api': f"http://localhost:5000{SERVICE_INFO['endpoints']['api']}"
        }
    })


@app.route('/api/v1/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Max-Hazoom Chat Service',
        'version': SERVICE_INFO['version'],
        'active_connections': len(active_users),
        'rooms': {room: len(users) for room, users in chat_rooms.items()},
        'uptime': 'running'
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Flask WebSocket Service',
        'active_connections': len(active_users),
        'rooms': len(chat_rooms),
        'service_info': SERVICE_INFO
    })


@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connection"""
    print(f'Client connected: {request.sid}')
    active_users[request.sid] = {
        'connected_at': __import__('time').time(),
        'rooms': []
    }
    emit('status', {
        'connected': True,
        'message': 'Connected to HAZoom WebSocket',
        'sid': request.sid
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print(f'Client disconnected: {request.sid}')
    if request.sid in active_users:
        # Leave all rooms
        for room in active_users[request.sid]['rooms']:
            leave_room(room)
            if room in chat_rooms:
                chat_rooms[room].remove(request.sid)
        del active_users[request.sid]


@socketio.on('join_room')
def handle_join_room(data):
    """Join a chat room"""
    room = data.get('room', 'general')
    join_room(room)
    
    if request.sid in active_users:
        active_users[request.sid]['rooms'].append(room)
    
    if room not in chat_rooms:
        chat_rooms[room] = []
    chat_rooms[room].append(request.sid)
    
    emit('room_joined', {
        'room': room,
        'user_count': len(chat_rooms[room])
    }, room=room)


@socketio.on('leave_room')
def handle_leave_room(data):
    """Leave a chat room"""
    room = data.get('room', 'general')
    leave_room(room)
    
    if request.sid in active_users and room in active_users[request.sid]['rooms']:
        active_users[request.sid]['rooms'].remove(room)
    
    if room in chat_rooms and request.sid in chat_rooms[room]:
        chat_rooms[room].remove(request.sid)
    
    emit('room_left', {
        'room': room,
        'user_count': len(chat_rooms.get(room, []))
    }, room=room)


@socketio.on('message')
def handle_message(data):
    """Handle incoming chat message"""
    message = data.get('message', '')
    room = data.get('room', 'general')
    user_name = data.get('user_name', 'Anonymous')
    
    print(f'Message from {user_name} in {room}: {message}')
    
    # Broadcast message to room
    emit('new_message', {
        'user': user_name,
        'message': message,
        'timestamp': __import__('time').time(),
        'room': room
    }, room=room)
    
    # Optional: Send to LLM backend for AI response
    # This is where you'd integrate with your Django LLM backend
    # For now, just echo back
    if message.startswith('/ai'):
        emit('ai_response', {
            'message': f'AI Response: {message[3:]}',
            'timestamp': __import__('time').time()
        }, room=request.sid)


@socketio.on('llm_request')
def handle_llm_request(data):
    """Handle LLM request with streaming response"""
    message = data.get('message', '')
    intelligence_level = data.get('intelligence_level', 'super')
    
    # In real implementation, call Django LLM backend
    # For now, simulate streaming response
    import time
    words = f"This is a simulated streaming response to: {message}".split()
    
    for word in words:
        emit('llm_token', {'token': word + ' '})
        time.sleep(0.1)  # Simulate processing delay
    
    emit('llm_complete', {
        'message': 'Response complete',
        'timestamp': time.time()
    })


@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    room = data.get('room', 'general')
    user_name = data.get('user_name', 'Anonymous')
    is_typing = data.get('is_typing', False)
    
    emit('user_typing', {
        'user': user_name,
        'is_typing': is_typing
    }, room=room, include_self=False)


@socketio.on('get_stats')
def handle_get_stats():
    """Get server statistics"""
    emit('stats', {
        'active_users': len(active_users),
        'rooms': {room: len(users) for room, users in chat_rooms.items()},
        'total_connections': len(active_users)
    })


@socketio.on('broadcast')
def handle_broadcast(data):
    """Broadcast message to all connected clients"""
    message = data.get('message', '')
    emit('broadcast_message', {
        'message': message,
        'timestamp': __import__('time').time()
    }, broadcast=True)


if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════╗
    ║   🪿 MAX-HAZOOM CHAT MIGRATION SERVICE                ║
    ║   Migrated to: http://localhost:9000                  ║
    ║   Service: /quantum-goose-app/services/max-hazoom/    ║
    ║   Running on: http://localhost:5000                   ║
    ║   WebSocket: ws://localhost:5000/socket.io            ║
    ╚═══════════════════════════════════════════════════════╝
    
    MIGRATION COMPLETE! 🎉
    • Real-time bidirectional communication
    • Chat rooms support
    • Typing indicators
    • Broadcasting
    • LLM integration ready
    • CORS configured for localhost:9000
    
    Available Endpoints:
    • Main Service: http://localhost:5000
    • Health Check: http://localhost:5000/health
    • API Status: http://localhost:5000/api/v1/status
    • WebSocket: ws://localhost:5000/socket.io
    
    Integration Points:
    • React App: localhost:9000/quantum-goose-app/services/max-hazoom/
    • WebSocket Client: socket.io-client
    
    Ready for Max-Hazoom Navigator! 🚀
    """)
    
    # Start the service
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True,
        use_reloader=False  # Disable reloader in production
    )
