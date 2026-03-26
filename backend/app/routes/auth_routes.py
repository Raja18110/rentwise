from fastapi import APIRouter
from pydantic import BaseModel
from app.services.auth import register_user, login_user
from app.services.otp_service import generate_otp, verify_otp


router = APIRouter(prefix="/auth")


# 🔹 Request Schemas
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


# 🔹 REGISTER API
@router.post("/register")
def register(data: RegisterRequest):
    return register_user(
        data.email,
        data.username,
        data.password,
        data.role
    )


# 🔹 LOGIN API
@router.post("/login")
def login(data: LoginRequest):
    return login_user(
        data.email,
        data.password
    )
@router.post("/send-otp")
def send_otp(email: str):
    generate_otp(email)
    return {"msg": "OTP sent"}

@router.post("/verify-otp")
def verify(email: str, otp: str):
    if verify_otp(email, otp):
        return {"msg": "Verified"}
    return {"error": "Invalid OTP"}