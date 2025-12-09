# Database Setup Complete ✅

The database has been successfully created and configured!

## Database Information

- **Database Name**: `kiwischools`
- **User**: `zhangxiaoyu`
- **Host**: `localhost`
- **Port**: `5432`
- **Connection URL**: `postgresql://zhangxiaoyu@localhost:5432/kiwischools`

## Created Tables

1. ✅ `school` - School/Kindergarten/University data table
2. ✅ `schoolzone` - School zone information table
3. ✅ `user` - User table (for authentication)
4. ✅ `alembic_version` - Alembic version control table

## Administrator Account

Default administrator account has been created:
- **Email**: `admin@kiwischools.com`
- **Password**: `admin123`
- **Permissions**: Super Administrator

## Next Steps

### 1. Test Database Connection

```bash
cd backend
.venv/bin/python scripts/test_scraper.py
```

### 2. Start Backend Server

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### 3. Test API

Visit API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Test Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiwischools.com",
    "password": "admin123"
  }'
```

## Environment Configuration

`.env` file has been created, containing:
- `DATABASE_URL=postgresql://zhangxiaoyu@localhost:5432/kiwischools`

If you need to modify database configuration, edit the `backend/.env` file.

## Database Management Commands

### Connect to Database

```bash
psql -h localhost -d kiwischools
```

### View All Tables

```bash
psql -h localhost -d kiwischools -c "\dt"
```

### View Table Structure

```bash
psql -h localhost -d kiwischools -c "\d school"
psql -h localhost -d kiwischools -c "\d user"
```

### View Data

```bash
psql -h localhost -d kiwischools -c "SELECT COUNT(*) FROM school;"
psql -h localhost -d kiwischools -c "SELECT * FROM \"user\";"
```

## Troubleshooting

### PostgreSQL Not Running

```bash
brew services start postgresql@15
```

### Database Connection Failed

1. Check if PostgreSQL is running: `brew services list | grep postgresql`
2. Check `DATABASE_URL` in `.env` file
3. Confirm database exists: `psql -h localhost -d kiwischools -c "\dt"`

### Permission Issues

If you encounter permission issues, you may need to create a postgres user:

```sql
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres CREATEDB;
```

Then update `DATABASE_URL` in the `.env` file.
