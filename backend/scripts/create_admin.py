"""
Script to create a superuser/admin account.
Usage: python scripts/create_admin.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlmodel import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal, init_db
from app.models.user import User


def create_admin(
    email: str = "admin@kiwischools.com",
    password: str = "admin123",
    full_name: str = "Super Admin",
) -> User:
    """Create a superuser account."""
    # Initialize database
    init_db()
    
    db: Session = SessionLocal()
    try:
        # Check if admin already exists
        statement = select(User).where(User.email == email)
        existing_user = db.execute(statement).scalar_one_or_none()
        
        if existing_user:
            print(f"Admin user with email '{email}' already exists.")
            print(f"Updating password...")
            existing_user.hashed_password = get_password_hash(password)
            existing_user.is_superuser = True
            existing_user.is_active = True
            existing_user.full_name = full_name
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)
            print(f"✓ Admin user updated successfully!")
            return existing_user
        
        # Create new admin user
        hashed_password = get_password_hash(password)
        admin_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_active=True,
            is_superuser=True,
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✓ Super admin user created successfully!")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  Full Name: {full_name}")
        print(f"  Is Superuser: {admin_user.is_superuser}")
        
        return admin_user
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error creating admin user: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Create a superuser account")
    parser.add_argument(
        "--email",
        type=str,
        default="admin@kiwischools.com",
        help="Admin email address (default: admin@kiwischools.com)",
    )
    parser.add_argument(
        "--password",
        type=str,
        default="admin123",
        help="Admin password (default: admin123)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="Super Admin",
        help="Admin full name (default: Super Admin)",
    )
    
    args = parser.parse_args()
    
    print("Creating super admin user...")
    print("-" * 50)
    create_admin(
        email=args.email,
        password=args.password,
        full_name=args.name,
    )
    print("-" * 50)
    print("Done!")

