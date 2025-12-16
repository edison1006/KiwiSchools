# Admin Scripts

## Create Super Admin User

This script creates a superuser/admin account for testing and initial setup.

### Usage

1. Make sure you have installed all dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Make sure your database is set up and migrations are applied:
```bash
alembic upgrade head
```

3. Run the script:
```bash
python scripts/create_admin.py
```

### Default Credentials

- **Email**: admin@kiwischools.com
- **Password**: admin123
- **Full Name**: Super Admin

### Custom Credentials

You can customize the admin account:

```bash
python scripts/create_admin.py \
  --email your-email@example.com \
  --password your-password \
  --name "Your Name"
```

### Example

```bash
# Create default admin
python scripts/create_admin.py

# Create custom admin
python scripts/create_admin.py \
  --email admin@test.com \
  --password MySecurePassword123 \
  --name "Admin User"
```


