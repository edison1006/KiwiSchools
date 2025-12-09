#!/bin/bash
# Script to set up the database
# Usage: bash scripts/setup_database.sh

set -e

echo "Setting up KiwiSchools database..."
echo "=================================================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql command not found!"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Database configuration
DB_NAME="kiwischools"
# On macOS with Homebrew, default user is current user, not postgres
DB_USER="${POSTGRES_USER:-$(whoami)}"
DB_PASSWORD="${POSTGRES_PASSWORD:-}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "Database configuration:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
# Try without password first (macOS Homebrew default)
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
    # Try with password if provided
    if [ -n "$DB_PASSWORD" ] && PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
        USE_PASSWORD=true
    else
    echo "ERROR: Cannot connect to PostgreSQL!"
    echo ""
    echo "Please ensure PostgreSQL is running:"
    echo "  macOS: brew services start postgresql"
    echo "  Linux: sudo systemctl start postgresql"
    echo ""
        echo "Or check your connection settings."
        exit 1
    fi
    USE_PASSWORD=false
else
    USE_PASSWORD=false
fi

echo "✓ PostgreSQL is running"
echo ""

# Function to run psql command
run_psql() {
    if [ "$USE_PASSWORD" = true ] && [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"
    fi
}

# Check if database exists
if run_psql -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database '$DB_NAME' already exists."
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        run_psql -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "✓ Database dropped"
    else
        echo "Keeping existing database."
        exit 0
    fi
fi

# Create database
echo "Creating database '$DB_NAME'..."
run_psql -d postgres <<EOF
CREATE DATABASE $DB_NAME;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Database '$DB_NAME' created successfully!"
else
    echo "✗ Failed to create database"
    exit 1
fi

echo ""
echo "=================================================="
echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations:"
echo "   cd backend"
echo "   alembic upgrade head"
echo ""
echo "2. Create admin user:"
echo "   python scripts/create_admin.py"
echo ""

