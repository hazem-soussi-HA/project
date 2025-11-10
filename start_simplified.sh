#!/bin/bash

# 🚀 Simplified AI Chat Startup Script
# Clean, professional AI chat system for clients

echo "🤖 Starting Simplified AI Chat System..."
echo "=================================="

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama is not running. Starting Ollama..."
    ollama serve &
    sleep 3
else
    echo "✅ Ollama is already running"
fi

# Check available models
echo "📋 Available AI Models:"
ollama list

# Start Django backend
echo ""
echo "🔧 Starting Django Backend Server..."
cd /d/project
python3 manage.py runserver 0.0.0.0:9000 &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:9000"

# Wait for backend to initialize
sleep 5

# Test backend health
echo "🏥 Testing Backend Health..."
curl -s http://localhost:9000/quantum-goose-app/api/health/ | python3 -m json.tool

# Start React frontend
echo ""
echo "🎨 Starting React Frontend..."
cd quantum-goose-app
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started on http://localhost:5173"

# Wait for frontend to initialize
sleep 5

echo ""
echo "🎉 System Ready!"
echo "================"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:9000/quantum-goose-app/api/"
echo "🏥 Health Check: http://localhost:9000/quantum-goose-app/api/health/"
echo ""
echo "🤖 AI Chat Features:"
echo "  • Real-time streaming responses"
echo "  • Multiple AI models available"
echo "  • Clean, professional interface"
echo "  • Conversation memory"
echo "  • Model switching"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
wait