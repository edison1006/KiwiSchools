"""
Admin endpoints for creating superuser accounts.
⚠️ WARNING: This should be disabled or protected in production!
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.auth import UserCreate

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
settings = get_settings()


@router.post("/create-superuser", status_code=status.HTTP_201_CREATED)
def create_superuser(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> dict:
    """
    Create a superuser account.
    ⚠️ WARNING: This endpoint should be disabled in production!
    For development/testing only.
    """
    if not settings.enable_admin_endpoint:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin endpoint is disabled",
        )
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = db.execute(statement).scalar_one_or_none()
    
    if existing_user:
        # Update existing user to superuser
        existing_user.hashed_password = get_password_hash(user_data.password)
        existing_user.is_superuser = True
        existing_user.is_active = True
        if user_data.full_name:
            existing_user.full_name = user_data.full_name
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)
        return {
            "message": "Superuser updated successfully",
            "email": existing_user.email,
            "is_superuser": existing_user.is_superuser,
        }
    
    # Create new superuser
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Superuser created successfully",
        "email": new_user.email,
        "is_superuser": new_user.is_superuser,
    }

