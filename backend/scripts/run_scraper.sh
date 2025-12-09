#!/bin/bash
# Script to run the scraper test with proper virtual environment
# Usage: 
#   From backend directory: bash scripts/run_scraper.sh
#   From project root: bash backend/scripts/run_scraper.sh

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to backend directory
cd "$BACKEND_DIR" || exit 1

echo "Backend directory: $BACKEND_DIR"
echo "Current directory: $(pwd)"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv .venv
    echo "Installing dependencies..."
    .venv/bin/pip install -r requirements.txt
fi

# Run the script using virtual environment Python
echo "Running scraper test..."
.venv/bin/python scripts/test_scraper.py

