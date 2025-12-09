# Backend Server Startup Guide

## Quick Start

### Method 1: Using Startup Script (Recommended)

```bash
cd backend
bash scripts/start_server.sh
```

### Method 2: Manual Start

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Method 3: Using Virtual Environment Python

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload
```

## Port Already in Use Issue

If you encounter `ERROR: [Errno 48] Address already in use`, it means port 8000 is already occupied.

### Solutions

#### 1. Stop Process Using the Port

```bash
# Find process using the port
lsof -ti:8000

# Stop the process
kill $(lsof -ti:8000)

# Or force stop
kill -9 $(lsof -ti:8000)
```

#### 2. Use a Different Port

```bash
# Use port 8001
uvicorn app.main:app --reload --port 8001

# Or use startup script
bash scripts/start_server.sh 8001
```

#### 3. Use Stop Script

```bash
# Stop server on default port 8000
bash scripts/stop_server.sh

# Stop server on specified port
bash scripts/stop_server.sh 8001
```

## Verify Server Running

After starting, visit the following URLs:

- **Health Check**: http://localhost:8000/health
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc

## Common Commands

### Check Port Usage

```bash
lsof -i:8000
```

### View Server Logs

After starting the server, logs will be displayed in the terminal. If running in background:

```bash
# View log file (if exists)
tail -f logs/app.log
```

### Restart Server

```bash
# Stop
bash scripts/stop_server.sh

# Start
bash scripts/start_server.sh
```

## Troubleshooting

### Issue: Port Already in Use

**Solution**:
1. Use `lsof -i:8000` to view process using the port
2. Use `kill` to stop the process
3. Or use a different port

### Issue: Module Not Found

**Solution**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### Issue: Database Connection Failed

**Solution**:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. Run `bash scripts/setup_database.sh` to create database

## Production Environment

Production environment recommends using Gunicorn:

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
