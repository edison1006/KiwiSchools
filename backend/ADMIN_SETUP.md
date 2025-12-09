# Create Super Administrator Account

There are two ways to create a super administrator account for testing:

## Method 1: Using API Endpoint (Recommended, Simplest)

1. **Ensure the backend server is running**:
```bash
cd backend
uvicorn app.main:app --reload
```

2. **Use curl or Postman to call the API**:

```bash
curl -X POST "http://localhost:8000/api/v1/admin/create-superuser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiwischools.com",
    "password": "admin123",
    "full_name": "Super Admin"
  }'
```

Or using Python requests:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/admin/create-superuser",
    json={
        "email": "admin@kiwischools.com",
        "password": "admin123",
        "full_name": "Super Admin"
    }
)
print(response.json())
```

## Method 2: Using Python Script

1. **Install dependencies** (if not already installed):
```bash
cd backend
pip install -r requirements.txt
```

2. **Ensure database is initialized**:
```bash
alembic upgrade head
```

3. **Run the script**:
```bash
# Use default account
python scripts/create_admin.py

# Or customize account
python scripts/create_admin.py \
  --email admin@test.com \
  --password MyPassword123 \
  --name "Admin User"
```

## Default Test Account

- **Email**: `admin@kiwischools.com`
- **Password**: `admin123`
- **Full Name**: `Super Admin`

## Test Login

After creating the account, you can test login using the following method:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiwischools.com",
    "password": "admin123"
  }'
```

Response example:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Security Notes

⚠️ **Important**:
- Admin endpoints are only enabled in development environment
- These endpoints should be disabled in production environment
- Use strong passwords to protect administrator accounts
- Regularly change default passwords
