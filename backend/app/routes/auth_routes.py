from fastapi import APIRouter , Depends
from pydantic import BaseModel
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
    email: str

class VerifyOTP(BaseModel):
    email: str
    otp: str
class GoogleLoginSchema(BaseModel):
    token: str
    role: str = "tenant"


router = APIRouter(prefix="/auth")


@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    return register_user(
        db,
        data.email,
        data.username,
        data.password,
        data.role
    )


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    return login_user(
        db,
        data.email,
        data.password
    )


@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    generate_otp(request.email)
    return {"msg": "OTP sent"}

@router.post("/verify-otp")
def verify(request: VerifyOTP, db: Session = Depends(get_db)):
    if verify_otp(request.email, request.otp):
        return {"msg": "Verified"}
    return {"error": "Invalid OTP"}
    
@router.post("/google")
def google_login(data: GoogleLoginSchema, db: Session = Depends(get_db)):

    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")

    except Exception:
        return {"error": "Invalid Google token"}

    # 🔍 Check user
    user = db.query(User).filter(User.email == email).first()

    # 🆕 Register if not exists
    if not user:
        user = User(
            email=email,
            username=name or email.split("@")[0],
            role=data.role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 🔐 Create token
    token = create_token({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    })

    return {
        "token": token,
        "username": user.username,
        "role": user.role
    }