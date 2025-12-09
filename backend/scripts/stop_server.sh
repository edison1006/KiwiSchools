#!/bin/bash
# Script to stop the backend server
# Usage: bash scripts/stop_server.sh [port]

PORT=${1:-8000}

echo "Stopping server on port $PORT..."

# Find and kill process on the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
    exit 0
fi

echo "Found process: $PID"
kill $PID

sleep 1

# Check if still running
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "Process still running, force killing..."
    kill -9 $PID
fi

echo "✓ Server stopped"

