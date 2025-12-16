#!/bin/bash
# Script to start the backend server
# Usage: bash scripts/start_server.sh [port]

PORT=${1:-8000}

echo "Starting KiwiSchools backend server..."
echo "Port: $PORT"
echo ""

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠ Port $PORT is already in use!"
    echo ""
    echo "Options:"
    echo "1. Stop the existing process:"
    echo "   kill \$(lsof -ti:$PORT)"
    echo ""
    echo "2. Use a different port:"
    echo "   bash scripts/start_server.sh 8001"
    echo ""
    echo "3. Find and stop the process:"
    echo "   lsof -i:$PORT"
    exit 1
fi

# Change to backend directory
cd "$(dirname "$0")/.." || exit 1

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv .venv
    echo "Installing dependencies..."
    .venv/bin/pip install -r requirements.txt
fi

# Activate virtual environment and start server
echo "Starting server on port $PORT..."
echo "API docs will be available at: http://localhost:$PORT/docs"
echo ""
.venv/bin/uvicorn app.main:app --reload --port $PORT


