#!/bin/bash

# Start both React and API server for development

echo "🚀 Starting UNICEF World Builder development servers..."

# Set development environment
export NODE_ENV=development

# Start API server in background
echo "📡 Starting API server on port 3001..."
npm run server &
API_PID=$!

# Wait a moment for API server to start
sleep 3

# Start React development server
echo "⚛️ Starting React development server on port 3000..."
npm run client &
REACT_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $API_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

echo "✅ Both servers are running!"
echo "🌐 React app: http://localhost:3000"
echo "🔧 API server: http://localhost:3001"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
