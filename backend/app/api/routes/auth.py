from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db, get_current_active_user
from app.core.config import get_settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.models.user import User
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    PasswordResetRequest,
    PasswordReset,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> User:
    """Register a new user."""
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> Token:
    """Login and get access token."""
    # Find user by email
    statement = select(User).where(User.email == form_data.username)
    user = db.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires,
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login/json", response_model=Token)
def login_json(
    login_data: UserLogin,
    db: Session = Depends(get_db),
) -> Token:
    """Login with JSON body (alternative to form-based login)."""
    # Find user by email
    statement = select(User).where(User.email == login_data.email)
    user = db.exec(statement).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires,
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current user information."""
    return current_user


@router.post("/password-reset-request")
def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Request password reset (sends reset token via email - placeholder)."""
    # Find user by email
    statement = select(User).where(User.email == reset_request.email)
    user = db.exec(statement).first()
    
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # TODO: Generate reset token and send email
    # For now, just return success message
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset")
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db),
) -> dict:
    """Reset password with token."""
    # TODO: Verify reset token
    # For now, this is a placeholder
    # In production, you would:
    # 1. Verify the token
    # 2. Find the user associated with the token
    # 3. Update the password
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset not fully implemented yet",
    )

