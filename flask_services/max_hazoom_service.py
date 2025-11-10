#!/usr/bin/env python3
"""
Max-Hazoom Chat Service
Dedicated service for the Max-Hazoom Navigator chat panel
Migrated to: http://localhost:9000/quantum-goose-app/services/max-hazoom/
"""

import os
import sys
import json
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('max_hazoom_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'max-hazoom-navigator-secret-key-2025'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Security configuration
API_KEY = os.environ.get('MAX_HAZOOM_API_KEY', 'quantum-goose-secure-key-2025')

# CORS configuration for Max-Hazoom domain - restricted for security
allowed_origins = [
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    # Add production domains here when deploying
    # "https://yourdomain.com",
]

# Allow additional origins from environment variable
extra_origins = os.environ.get('ALLOWED_CORS_ORIGINS', '')
if extra_origins:
    allowed_origins.extend([origin.strip() for origin in extra_origins.split(',') if origin.strip()])

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-Client-Info",
            "X-API-Key"
        ],
        "expose_headers": ["X-API-Key"],
        "supports_credentials": False  # Disable credentials for WebSocket security
    }
})

# Initialize SocketIO with optimized settings for Max-Hazoom
socketio = SocketIO(
    app,
    cors_allowed_origins=allowed_origins,
    async_mode='threading',
    ping_timeout=120,
    ping_interval=30,
    allow_upgrades=True,
    transports=['websocket', 'polling']
)

# Service configuration
SERVICE_CONFIG = {
    'name': 'Max-Hazoom Chat Service',
    'version': '2.0.0',
    'description': 'Dedicated chat service for Max-Hazoom Navigator',
    'migrated_to': 'http://localhost:9000/quantum-goose-app/services/max-hazoom/',
    'base_path': '/services/max-hazoom',
    'endpoints': {
        'websocket': '/socket.io',
        'health': '/health',
        'api': '/api/v1',
        'chat': '/chat',
        'status': '/status'
    }
}

# Security headers
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# In-memory storage for chat sessions (in production, use Redis/DB)
chat_sessions = {}
active_connections = {}
chat_rooms = {}

# Rate limiting storage
connection_attempts = {}  # IP -> [timestamps]
message_rate_limits = {}  # client_id -> [timestamps]

# AI Response simulation with enhanced intelligence
class MaxHazoomAI:
    """Enhanced AI responses for Max-Hazoom Navigator"""
    
    def __init__(self):
        self.context_window = []
        self.user_preferences = {}
        
    def generate_response(self, message, user_context=None):
        """Generate contextual AI responses"""
        
        # Enhanced response patterns
        responses = {
            'greeting': [
                "Hello! I'm Goose, your Max-Hazoom AI assistant. I can help you navigate complex tasks, analyze data, create visualizations, and much more. What would you like to explore today?",
                "Welcome to Max-Hazoom Navigator! I'm here to assist you with coding, data analysis, automation, and creative projects. How can I help you achieve your goals?",
                "Greetings! I'm your AI companion in the Max-Hazoom ecosystem. Whether you need technical assistance, creative input, or problem-solving help, I'm ready to assist. What can we work on together?"
            ],
            'capabilities': {
                'technical': [
                    "🔧 **Technical Expertise**: I can help with Python, JavaScript, shell scripting, file processing, and system automation.",
                    "📊 **Data Analysis**: Process Excel files, create visualizations, analyze datasets, and generate insights.",
                    "🌐 **Web Services**: Interact with APIs, scrape websites, manage HTTP requests, and build integrations.",
                    "🗂️ **File Management**: Read/write documents (PDF, DOCX, TXT, JSON), organize projects, and process data.",
                    "🧠 **Memory System**: Remember your preferences, save important information, and maintain context across sessions.",
                    "🎨 **Creative Tools**: Generate charts, maps, reports, and interactive visualizations."
                ],
                'integration': [
                    "💻 **System Integration**: I connect with various tools and services to provide comprehensive assistance.",
                    "🔄 **Workflow Automation**: Streamline your processes with custom scripts and automation.",
                    "📈 **Real-time Analysis**: Process and analyze data in real-time with interactive displays.",
                    "🌟 **Advanced Features**: Access to developer tools, computer control, and specialized extensions."
                ]
            },
            'help_responses': [
                "I'd be happy to help! Could you tell me more about what you're trying to accomplish? I can assist with everything from simple questions to complex multi-step projects.",
                "Great question! Let me help you break this down step by step. What specific aspect would you like to start with?",
                "I can definitely help with that! I have access to various tools and capabilities. What would you like to accomplish, and I'll guide you through the best approach."
            ]
        }
        
        # Context-aware response selection
        message_lower = message.lower()
        
        if any(greeting in message_lower for greeting in ['hello', 'hi', 'hey', 'greetings']):
            return self._get_random_response(responses['greeting'])
        
        if any(word in message_lower for word in ['help', 'what can you do', 'capabilities']):
            response = f"🪿 **I'm Goose, your Max-Hazoom Navigator AI Assistant!**\n\n"
            response += f"**Core Capabilities:**\n"
            for category, items in responses['capabilities'].items():
                response += f"\n**{category.title()}:**\n"
                for item in items:
                    response += f"{item}\n"
            return response
        
        if any(word in message_lower for word in ['code', 'program', 'develop', 'python', 'javascript']):
            return "💻 **Coding & Development Support:**\n\nI can help you with:\n• **Code Analysis & Debugging**: Review your code, identify issues, and suggest improvements\n• **Feature Development**: Build new functionality from scratch\n• **Best Practices**: Guide you through proper coding patterns and architecture\n• **Multiple Languages**: Python, JavaScript, Shell, and more\n• **Integration**: Connect different services and APIs\n\nWhat programming challenge are you working on? Share your code or describe the problem!"
        
        if any(word in message_lower for word in ['data', 'analyze', 'chart', 'graph', 'visualize']):
            return "📊 **Data Analysis & Visualization:**\n\nI can help you with:\n• **Data Processing**: Clean, transform, and analyze datasets\n• **Visualization Creation**: Generate charts, graphs, maps, and interactive displays\n• **Report Generation**: Create comprehensive analysis reports\n• **Pattern Recognition**: Identify trends and insights\n• **File Processing**: Work with Excel, CSV, JSON, and other data formats\n\nWhat data would you like to analyze, and what insights are you looking for?"
        
        if any(word in message_lower for word in ['create', 'build', 'make', 'develop']):
            return "✨ **Creative & Development Projects:**\n\nI love helping bring ideas to life! I can assist with:\n• **Web Applications**: Build interactive websites and web apps\n• **Automation Scripts**: Create tools to streamline your workflow\n• **Documentation**: Generate reports, guides, and presentations\n• **Visual Content**: Design charts, diagrams, and infographics\n• **Data Pipelines**: Set up automated data processing workflows\n\nWhat would you like to create? Describe your vision and I'll help make it reality!"
        
        return self._get_random_response(responses['help_responses'])
    
    def _get_random_response(self, responses):
        """Get a random response from a list"""
        return responses[int(time.time()) % len(responses)]

# Initialize AI instance
max_hazoom_ai = MaxHazoomAI()

# Rate limiting configuration
MAX_CONNECTIONS_PER_MINUTE = 10
MAX_MESSAGES_PER_MINUTE = 30
RATE_LIMIT_WINDOW = 60  # seconds

def is_rate_limited(rate_dict, key, max_requests, window=RATE_LIMIT_WINDOW):
    """Check if a key has exceeded rate limits"""
    now = time.time()
    if key not in rate_dict:
        rate_dict[key] = []

    # Remove old timestamps
    rate_dict[key] = [t for t in rate_dict[key] if now - t < window]

    if len(rate_dict[key]) >= max_requests:
        return True

    rate_dict[key].append(now)
    return False

# Routes
@app.route('/')
def index():
    """Max-Hazoom service information"""
    return jsonify({
        'service': 'Max-Hazoom Chat Service',
        'status': 'active',
        'migrated_to': SERVICE_CONFIG['migrated_to'],
        'config': SERVICE_CONFIG,
        'endpoints': {
            'main': f"http://localhost:5000{SERVICE_CONFIG['base_path']}",
            'websocket': f"ws://localhost:5000{SERVICE_CONFIG['endpoints']['websocket']}",
            'health': f"http://localhost:5000{SERVICE_CONFIG['base_path']}{SERVICE_CONFIG['endpoints']['health']}",
            'api': f"http://localhost:5000{SERVICE_CONFIG['base_path']}{SERVICE_CONFIG['endpoints']['api']}"
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': SERVICE_CONFIG['name'],
        'version': SERVICE_CONFIG['version'],
        'active_connections': len(active_connections),
        'chat_sessions': len(chat_sessions),
        'chat_rooms': len(chat_rooms),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/v1/status')
def api_status():
    """API status with detailed information"""
    return jsonify({
        'service': SERVICE_CONFIG['name'],
        'version': SERVICE_CONFIG['version'],
        'status': 'operational',
        'migrated_to': SERVICE_CONFIG['migrated_to'],
        'connections': {
            'active': len(active_connections),
            'total_sessions': len(chat_sessions)
        },
        'rooms': {room: len(users) for room, users in chat_rooms.items()},
        'capabilities': [
            'Real-time chat',
            'WebSocket communication', 
            'AI responses',
            'Chat rooms',
            'Typing indicators',
            'Message history'
        ]
    })

@app.route('/api/v1/chat/history/<session_id>')
def get_chat_history(session_id):
    """Get chat history for a session"""
    if session_id in chat_sessions:
        return jsonify({
            'session_id': session_id,
            'messages': chat_sessions[session_id],
            'message_count': len(chat_sessions[session_id])
        })
    return jsonify({
        'session_id': session_id,
        'messages': [],
        'message_count': 0
    })

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connection with authentication and rate limiting"""
    client_id = request.sid
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)

    # Rate limiting for connection attempts
    if is_rate_limited(connection_attempts, client_ip, MAX_CONNECTIONS_PER_MINUTE):
        logger.warning(f"Rate limit exceeded for connection from {client_ip}")
        emit('error', {
            'message': 'Rate limit exceeded. Please try again later.',
            'code': 'RATE_LIMIT_EXCEEDED'
        })
        disconnect()
        return False

    # Check API key from query parameters or headers
    api_key = request.args.get('api_key') or request.headers.get('X-API-Key')
    if not api_key or api_key != API_KEY:
        logger.warning(f"Unauthorized connection attempt from {client_ip}")
        emit('error', {
            'message': 'Unauthorized: Invalid API key',
            'code': 'AUTH_FAILED'
        })
        disconnect()
        return False

    logger.info(f"Client connected: {client_id}")

    active_connections[client_id] = {
        'connected_at': time.time(),
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'ip_address': client_ip
    }

    emit('connected', {
        'status': 'success',
        'message': 'Connected to Max-Hazoom Chat Service',
        'client_id': client_id,
        'service_info': SERVICE_CONFIG
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    client_id = request.sid
    logger.info(f"Client disconnected: {client_id}")
    
    if client_id in active_connections:
        del active_connections[client_id]
    
    # Clean up user from all rooms
    for room in chat_rooms:
        if client_id in chat_rooms[room]:
            chat_rooms[room].remove(client_id)
            emit('user_left', {
                'user_id': client_id,
                'room': room
            }, room=room)

@socketio.on('join_chat')
def handle_join_chat(data):
    """Join a chat session"""
    session_id = data.get('session_id', 'default')
    user_name = data.get('user_name', 'Anonymous')
    room = data.get('room', 'general')
    
    join_room(room)
    
    if room not in chat_rooms:
        chat_rooms[room] = []
    chat_rooms[room].append(request.sid)
    
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    emit('chat_joined', {
        'session_id': session_id,
        'room': room,
        'user_name': user_name,
        'message_count': len(chat_sessions[session_id]),
        'active_users': len(chat_rooms[room])
    })

@socketio.on('send_message')
def handle_send_message(data):
    """Handle sending a chat message with rate limiting"""
    client_id = request.sid

    # Rate limiting for messages
    if is_rate_limited(message_rate_limits, client_id, MAX_MESSAGES_PER_MINUTE):
        emit('error', {
            'message': 'Message rate limit exceeded. Please slow down.',
            'code': 'MESSAGE_RATE_LIMIT'
        })
        return

    message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    user_name = data.get('user_name', 'Anonymous')
    room = data.get('room', 'general')
    message_type = data.get('type', 'text')

    if not message.strip():
        return
    
    # Store message in session
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    message_data = {
        'id': f"{int(time.time() * 1000)}",
        'message': message,
        'user_name': user_name,
        'type': message_type,
        'timestamp': datetime.now().isoformat(),
        'room': room
    }
    
    chat_sessions[session_id].append(message_data)
    
    # Broadcast message to room
    emit('new_message', message_data, room=room)
    
    # Generate AI response for chat messages
    if message_type == 'text' and not message.startswith('/'):
        try:
            # Generate AI response
            ai_response = max_hazoom_ai.generate_response(message, {'session_id': session_id})
            
            ai_message_data = {
                'id': f"{int(time.time() * 1000)}_ai",
                'message': ai_response,
                'user_name': 'Goose AI',
                'type': 'ai_response',
                'timestamp': datetime.now().isoformat(),
                'room': room,
                'response_to': message_data['id']
            }
            
            # Add small delay to simulate thinking
            time.sleep(0.5)
            
            emit('ai_response', ai_message_data, room=room)
            
            # Store AI response
            chat_sessions[session_id].append(ai_message_data)
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            emit('error', {
                'message': 'Failed to generate AI response',
                'error': str(e)
            })

@socketio.on('typing_start')
def handle_typing_start(data):
    """Handle typing indicator start"""
    room = data.get('room', 'general')
    user_name = data.get('user_name', 'Anonymous')
    emit('user_typing', {
        'user_name': user_name,
        'is_typing': True
    }, room=room, include_self=False)

@socketio.on('typing_stop')
def handle_typing_stop(data):
    """Handle typing indicator stop"""
    room = data.get('room', 'general')
    user_name = data.get('user_name', 'Anonymous')
    emit('user_typing', {
        'user_name': user_name,
        'is_typing': False
    }, room=room, include_self=False)

@socketio.on('get_stats')
def handle_get_stats():
    """Get service statistics"""
    emit('service_stats', {
        'active_connections': len(active_connections),
        'chat_sessions': len(chat_sessions),
        'chat_rooms': {room: len(users) for room, users in chat_rooms.items()},
        'total_messages': sum(len(session) for session in chat_sessions.values())
    })

@socketio.on('clear_chat')
def handle_clear_chat(data):
    """Clear chat history for a session"""
    session_id = data.get('session_id', 'default')
    if session_id in chat_sessions:
        chat_sessions[session_id] = []
        emit('chat_cleared', {
            'session_id': session_id,
            'message': 'Chat history cleared'
        })
    else:
        emit('error', {
            'message': 'Session not found'
        })

# Error handlers
@socketio.on_error()
def error_handler(e):
    """Handle WebSocket errors"""
    logger.error(f"WebSocket error: {e}")
    emit('error', {
        'message': 'An error occurred',
        'error': str(e)
    })

if __name__ == '__main__':
    # SSL configuration for secure connections
    ssl_context = None
    use_https = os.environ.get('USE_HTTPS', 'false').lower() == 'true'

    if use_https:
        # For development, you can generate self-signed certificates:
        # openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
        cert_file = os.environ.get('SSL_CERT_FILE', 'cert.pem')
        key_file = os.environ.get('SSL_KEY_FILE', 'key.pem')

        if os.path.exists(cert_file) and os.path.exists(key_file):
            ssl_context = (cert_file, key_file)
            protocol = 'https'
            ws_protocol = 'wss'
        else:
            logger.warning("SSL certificates not found, falling back to HTTP")
            protocol = 'http'
            ws_protocol = 'ws'
    else:
        protocol = 'http'
        ws_protocol = 'ws'

    print(f"""
    ╔═══════════════════════════════════════════════════════╗
    ║   🪿 MAX-HAZOOM CHAT SERVICE - SECURE MODE            ║
    ║   Service: {SERVICE_CONFIG['migrated_to']:<20}║
    ║   Local:   {protocol}://localhost:5000{SERVICE_CONFIG['base_path']:<20}║
    ║   WebSocket: {ws_protocol}://localhost:5000{SERVICE_CONFIG['endpoints']['websocket']:<20}║
    ╚═══════════════════════════════════════════════════════╝

    🔒 SECURITY STATUS: {'ENABLED (HTTPS/WSS)' if use_https else 'DEVELOPMENT (HTTP/WS)'}
    📍 Target: http://localhost:9000/quantum-goose-app/services/max-hazoom/
    🔗 Service URL: {SERVICE_CONFIG['migrated_to']}

    🚀 FEATURES:
    • Enhanced AI responses with context awareness
    • Real-time bidirectional communication
    • Session-based chat history
    • Multi-room support
    • Typing indicators
    • Service health monitoring

    📊 AVAILABLE ENDPOINTS:
    • Health Check: {protocol}://localhost:5000{SERVICE_CONFIG['base_path']}/health
    • API Status: {protocol}://localhost:5000{SERVICE_CONFIG['base_path']}/api/v1/status
    • Service Info: {protocol}://localhost:5000{SERVICE_CONFIG['base_path']}/
    • WebSocket: {ws_protocol}://localhost:5000{SERVICE_CONFIG['endpoints']['websocket']}

    Ready for Max-Hazoom Navigator! 🎯
    """)

    # Start the Max-Hazoom chat service
    socketio.run(
        app,
        host='0.0.0.0',
        port=5001,
        debug=False,  # Set to False for production
        allow_unsafe_werkzeug=True,
        use_reloader=False,
        log_output=True,
        ssl_context=ssl_context
    )
