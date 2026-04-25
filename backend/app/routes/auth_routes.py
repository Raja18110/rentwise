from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from app.services.auth import register_user, login_user
from app.services.otp_service import generate_otp, verify_otp
from app.db import get_db
from sqlalchemy.orm import Session
from app.models.user import User
    
from app.schemas.user import LoginSchema, RegisterSchema
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from app.utils.jwt import create_token
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your_google_client_id")

class OTPRequest(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=6)

class GoogleLoginSchema(BaseModel):
    token: str
    role: str = "tenant"

    class Config:
        json_schema_extra = {
            "example": {
                "token": "google_token_here",
                "role": "tenant"
            }
        }

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", summary="Register a new user")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    """
    Register a new user with email, username, password, and role.
    
    Roles: 'tenant' or 'landlord'
    """
    try:
        result = register_user(
            db,
            data.email,
            data.username,
            data.password,
            data.role
        )
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "success": True,
            "message": result.get("msg", "User registered successfully")
        }
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", summary="Login user")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns JWT token and user information.
    """
    try:
        result = login_user(db, data.email, data.password)
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result["error"]
            )
        
        return {
            "success": True,
            "token": result.get("token"),
            "username": result.get("username"),
            "role": result.get("role")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@router.post("/send-otp", summary="Send OTP to email")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    try:
        result = generate_otp(request.email)
        
        if result["success"]:
            return {
                "success": True,
                "message": result["message"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["message"]
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP send error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )


@router.post("/verify-otp", summary="Verify OTP")
def verify(request: VerifyOTP, db: Session = Depends(get_db)):
    """
    Verify OTP sent to email.
    """
    try:
        if verify_otp(request.email, request.otp):
            return {
                "success": True,
                "msg": "OTP verified successfully"
            }
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verify error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed. Please try again."
        )

    
@router.post("/google", summary="Google OAuth login")
def google_login(data: GoogleLoginSchema, db: Session = Depends(get_db)):

    if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID == "your_google_client_id":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )

    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            data.token,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Check if user exists, if not create
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                email=email,
                username=name or email.split("@")[0],
                role=data.role
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create JWT token
        token = create_token({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role
        })

        return {
            "success": True,
            "token": token,
            "username": user.username,
            "role": user.role
        }

    except ValueError as e:
        print(f"Google token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google login failed. Please try again."
        )
