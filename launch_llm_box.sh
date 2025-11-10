#!/bin/bash
# Quantum Goose LLM Box Launcher
# Starts both frontend and backend servers

echo "🪿 Launching Quantum Goose LLM Box..."
echo "=================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "python.*manage.py runserver" 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start Django backend
echo "🚀 Starting Django backend server..."
cd /d/project
python3 manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start React frontend
echo "⚡ Starting React frontend server..."
cd /d/project/quantum-goose-app
npm run dev &
FRONTEND_PID=$!

# Wait for servers to be ready
echo "⏳ Waiting for servers to start..."
sleep 3

# Check if servers are running
if curl -s http://localhost:8000/quantum-goose-app/api/llm/health/ > /dev/null; then
    echo "✅ Django backend is healthy"
else
    echo "❌ Django backend failed to start"
    cleanup
    exit 1
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ React frontend is running"
else
    echo "❌ React frontend failed to start"
    cleanup
    exit 1
fi

echo ""
echo "🎉 Quantum Goose LLM Box is ready!"
echo "=================================="
echo "📱 Frontend (React): http://localhost:5173"
echo "🔧 Backend (Django): http://localhost:8000"
echo "💬 LLM Chat: http://localhost:5173/hazoom-llm"
echo "🤖 Model Manager: http://localhost:5173/models"
echo "🧠 Memory Dashboard: http://localhost:5173/memory"
echo "📊 System Info: http://localhost:5173/system-info"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================="

# Keep script running
wait