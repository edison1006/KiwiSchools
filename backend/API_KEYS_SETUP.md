# API Keys Configuration Guide

## Overview

This guide explains how to configure and manage API keys and other sensitive configuration information.

## Configuration File Location

All API keys and sensitive configuration should be placed in the `.env` file, located in the `backend/` directory.

## Setup Steps

### 1. Create .env File

```bash
cd backend
cp .env.example .env
```

### 2. Edit .env File

Open the `.env` file with a text editor and fill in your actual API keys:

```bash
# Use your preferred editor
nano .env
# or
vim .env
# or
code .env  # VS Code
```

### 3. Configure API Keys

Set your API keys in the `.env` file:

```env
# Education API (if available)
EDUCATION_API_KEY=your-actual-api-key-here
EDUCATION_API_URL=https://api.education.govt.nz

# Google Maps API (for geocoding)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# JWT Secret Key (must be changed in production)
SECRET_KEY=your-very-secure-secret-key-here
```

## Available Configuration Items

### Application Configuration

- `APP_NAME`: Application name
- `ENVIRONMENT`: Environment (development/production)

### Database Configuration

- `DATABASE_URL`: PostgreSQL database connection URL

### JWT Configuration

- `SECRET_KEY`: JWT signing key (must use strong key in production)
- `ALGORITHM`: JWT algorithm (default HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (minutes)

### API Keys

- `EDUCATION_API_KEY`: Education department API key (if available)
- `EDUCATION_API_URL`: Education department API base URL
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (for geocoding)

### Other Configuration

- `ENABLE_ADMIN_ENDPOINT`: Whether to enable admin endpoints (should be set to false in production)

## Using API Keys in Code

### Method 1: Through Settings Class (Recommended)

```python
from app.core.config import get_settings

settings = get_settings()

# Use API key
api_key = settings.education_api_key
if api_key:
    # Use API key for requests
    headers = {"Authorization": f"Bearer {api_key}"}
```

### Method 2: Directly Read Environment Variables

```python
import os

api_key = os.getenv("EDUCATION_API_KEY")
```

## Security Best Practices

### ✅ Should Do

1. **Use .env file to store sensitive information**
   - `.env` file has been added to `.gitignore` and will not be committed to Git

2. **Use .env.example as template**
   - List all required configuration items in `.env.example` (without actual values)
   - Team members can refer to `.env.example` to create their own `.env` file

3. **Use environment variables in production**
   - Set environment variables directly on the server instead of using `.env` file
   - Or use secure key management services (such as AWS Secrets Manager, Azure Key Vault)

4. **Use strong keys**
   - `SECRET_KEY` should be a randomly generated strong key
   - Can be generated using:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

### ❌ Should Not Do

1. **Do not commit .env file to Git**
   - Ensure `.env` is in `.gitignore`

2. **Do not hardcode API keys in code**
   ```python
   # ❌ Wrong example
   api_key = "sk-1234567890abcdef"
   ```

3. **Do not commit API keys to version control**
   - Even public repositories should not commit them

4. **Do not output API keys in logs**
   ```python
   # ❌ Wrong example
   print(f"API Key: {api_key}")
   logger.info(f"Using API key: {api_key}")
   ```

## Adding New API Key

### 1. Update Configuration Class

Add new configuration item in `app/core/config.py`:

```python
class Settings(BaseSettings):
    # ... existing configuration ...
    
    # New API key
    new_service_api_key: Optional[str] = None
```

### 2. Update .env.example

Add to `backend/.env.example`:

```env
# New Service API
NEW_SERVICE_API_KEY=your-api-key-here
```

### 3. Use in Code

```python
from app.core.config import get_settings

settings = get_settings()
api_key = settings.new_service_api_key
```

## Environment Variable Priority

Configuration value priority (from high to low):

1. System environment variables
2. `.env` file
3. Default values in code

This means if you set a system environment variable, it will override the value in the `.env` file.

## Verify Configuration

After starting the application, you can verify that the configuration is loaded correctly:

```python
from app.core.config import get_settings

settings = get_settings()
print(f"Environment: {settings.environment}")
print(f"API Key set: {settings.education_api_key is not None}")
```

## Common Questions

### Q: .env file not working?

A: Ensure:
1. `.env` file is in `backend/` directory
2. File format is correct (KEY=VALUE, no quotes)
3. Restart application server

### Q: How to set up in production?

A: In production:
1. Set environment variables directly on the server
2. Or use container orchestration tools (such as Docker, Kubernetes) secrets management
3. Or use cloud provider key management services

### Q: How to generate secure SECRET_KEY?

A: Use Python to generate:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Example: Complete .env File

```env
# Application
APP_NAME=KiwiSchools API
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kiwischools

# JWT
SECRET_KEY=your-very-long-and-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin
ENABLE_ADMIN_ENDPOINT=false

# External APIs
EDUCATION_API_KEY=sk-1234567890abcdef
EDUCATION_API_URL=https://api.education.govt.nz
GOOGLE_MAPS_API_KEY=AIzaSyExample123456789
```

## Related Files

- `backend/.env.example` - Configuration template
- `backend/.gitignore` - Git ignore rules
- `backend/app/core/config.py` - Configuration class definition
