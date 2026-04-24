from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.services.auth import hash_password
from pydantic import BaseModel, EmailStr
from app.utils.jwt import verify_token

class UpdateEmailSchema(BaseModel):
    new_email: EmailStr

class UpdateUsernameSchema(BaseModel):
    username: str

class UpdatePasswordSchema(BaseModel):
    old_password: str
    new_password: str

router = APIRouter(prefix="/user", tags=["User"])


def get_current_user(db: Session = Depends(get_db)):
    """Dependency to get current user from token"""
    # This would normally extract from JWT token
    # For now, it's a placeholder
    pass


@router.put("/update-email", summary="Update user email")
def update_email(
    user_id: int,
    data: UpdateEmailSchema,
    db: Session = Depends(get_db)
):
    """Update user email address"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if email already exists
        existing = db.query(User).filter(
            User.email == data.new_email,
            User.id != user_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        
        user.email = data.new_email
        db.commit()
        
        return {
            "success": True,
            "message": "Email updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Email update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update email"
        )


@router.put("/update-username", summary="Update username")
def update_username(
    user_id: int,
    data: UpdateUsernameSchema,
    db: Session = Depends(get_db)
):
    """Update user username"""
    try:
        if not data.username or not data.username.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username cannot be empty"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.username = data.username.strip()
        db.commit()
        
        return {
            "success": True,
            "message": "Username updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Username update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update username"
        )


@router.put("/update-password", summary="Update password")
def update_password(
    user_id: int,
    data: UpdatePasswordSchema,
    db: Session = Depends(get_db)
):
    """Update user password"""
    try:
        from app.utils.hash import verify_password
        
        if not data.new_password or len(data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify old password
        if not verify_password(data.old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Old password is incorrect"
            )
        
        user.password_hash = hash_password(data.new_password)
        db.commit()
        
        return {
            "success": True,
            "message": "Password updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
