#!/bin/bash

# Script to find and kill processes using the MCP_SERVER_PORT
# Usage: ./kill-port.sh [port]

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Use provided port or default to MCP_SERVER_PORT from env, or 2999 as fallback
PORT=${1:-${MCP_SERVER_PORT:-2999}}

echo "🔍 Looking for processes using port $PORT..."

# Find processes using the port
PIDS=$(lsof -ti :$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ No processes found using port $PORT"
    exit 0
fi

echo "📋 Found the following processes using port $PORT:"
lsof -i :$PORT

echo ""
echo "⚠️  Terminating processes..."

# Kill the processes
for PID in $PIDS; do
    echo "🔄 Killing process $PID..."
    kill $PID 2>/dev/null
    
    # Wait a moment for graceful termination
    sleep 1
    
    # Check if process is still running
    if kill -0 $PID 2>/dev/null; then
        echo "💀 Force killing process $PID..."
        kill -9 $PID 2>/dev/null
    fi
done

# Wait a moment and check again
sleep 2

REMAINING_PIDS=$(lsof -ti :$PORT 2>/dev/null)
if [ -z "$REMAINING_PIDS" ]; then
    echo "✅ Port $PORT is now free!"
else
    echo "❌ Some processes may still be using port $PORT:"
    lsof -i :$PORT
    exit 1
fi 