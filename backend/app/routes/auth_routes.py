from fastapi import APIRouter , Depends
from pydantic import BaseModel
from app.services.auth import register_user, login_user
from app.services.otp_service import generate_otp, verify_otp
from app.db import get_db
from sqlalchemy.orm import Session
    
from app.schemas.user import LoginSchema, RegisterSchema
from pydantic import BaseModel

class OTPRequest(BaseModel):
    email: str

class VerifyOTP(BaseModel):
    email: str
    otp: str


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
    
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        user = User(
            email=data.email,
            username=data.email.split("@")[0],
            role="tenant"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_token({"id": user.id})

    return {
        "token": token,
        "role": user.role
    }