# Backend Environment Setup Guide

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv .venv
```

### 2. Activate Virtual Environment

**macOS/Linux:**
```bash
source .venv/bin/activate
```

**Windows:**
```bash
.venv\Scripts\activate
```

After activation, `(.venv)` will be displayed before the command prompt.

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy configuration template
cp .env.example .env

# Edit .env file, fill in your configuration
# At minimum, need to set database connection and API keys
```

### 5. Initialize Database

```bash
# Create database migrations
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head
```

### 6. Create Administrator Account

```bash
python scripts/create_admin.py
```

### 7. Start Server

```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`.

## Verify Installation

### Check Configuration

```bash
python scripts/verify_config.py
```

### Test API Key

```bash
python scripts/test_api_key.py
```

### Test Data Scraping

```bash
python scripts/test_scraper.py
```

## Common Issues

### ModuleNotFoundError

If you encounter `ModuleNotFoundError: No module named 'xxx'`:

1. Ensure virtual environment is activated (`.venv` before command prompt)
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check if you're in the correct directory (`backend/`)

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check if `DATABASE_URL` in `.env` file is correct
3. Ensure database is created:
   ```sql
   CREATE DATABASE kiwischools;
   ```

### Port Already in Use

If port 8000 is occupied, you can specify a different port:

```bash
uvicorn app.main:app --reload --port 8001
```

## Development Tools

### View API Documentation

After starting the server, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Run Tests

```bash
# If test files exist
pytest
```

## Production Deployment

1. Set `ENVIRONMENT=production` in `.env`
2. Change `SECRET_KEY` to a strong random key
3. Set `ENABLE_ADMIN_ENDPOINT=false`
4. Use production-grade WSGI server (such as Gunicorn)

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```
