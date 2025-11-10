#!/bin/bash

# 🪿 Max-Hazoom Quantum Navigator Startup Script
# Power on the entire Max-Hazoom system

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🪿 QUANTUM MAX-HAZOOM NAVIGATOR - POWER ON          ║"
echo "║   Initializing AI Assistant Systems...                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d "/d/project" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

cd /d/project

echo "🔧 Starting Max-Hazoom Navigator Services..."
echo ""

# 1. Start the Django main server
echo "🚀 Starting Django Server (Port 9000)..."
python manage.py runserver 0.0.0.0:9000 &
DJANGO_PID=$!
echo "   ✅ Django Server started (PID: $DJANGO_PID)"

# 2. Start the Max-Hazoom Chat Service
echo "🪿 Starting Max-Hazoom Chat Service (Port 5001)..."
cd flask_services
python max_hazoom_service.py &
CHAT_PID=$!
cd ..

echo "   ✅ Max-Hazoom Chat Service started (PID: $CHAT_PID)"
echo ""

# 3. Wait a moment for services to initialize
sleep 3

# 4. Test the services
echo "🔍 Testing service health..."
echo ""

# Test Django server
if curl -s http://localhost:9000/ > /dev/null; then
    echo "   ✅ Django Server: HEALTHY"
else
    echo "   ❌ Django Server: NOT RESPONDING"
fi

# Test Max-Hazoom chat service
if curl -s http://localhost:5001/health > /dev/null; then
    echo "   ✅ Max-Hazoom Chat: HEALTHY"
else
    echo "   ❌ Max-Hazoom Chat: NOT RESPONDING"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🎯 MAX-HAZOOM QUANTUM NAVIGATOR - ONLINE            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🌟 Services Status:"
echo "   • Django Main Server:  http://localhost:9000"
echo "   • Max-Hazoom Chat:     http://localhost:9000/quantum-goose-app/services/max-hazoom/"
echo "   • Chat WebSocket:      ws://localhost:5001/socket.io"
echo "   • Service Health:      http://localhost:5001/health"
echo ""
echo "🚀 Ready to navigate the quantum digital realm!"
echo ""
echo "💡 To stop all services, run: pkill -f 'python.*max_hazoom' && pkill -f 'manage.py runserver'"
echo ""

# Keep the script running and show logs
echo "📊 Live Service Logs (Press Ctrl+C to stop):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Max-Hazoom Navigator..."
    kill $DJANGO_PID 2>/dev/null
    kill $CHAT_PID 2>/dev/null
    echo "   ✅ All services stopped"
    exit 0
}

# Set up signal handler
trap cleanup SIGINT

# Keep running and show logs
wait
