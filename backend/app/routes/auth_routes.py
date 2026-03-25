# routes/auth_routes.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.auth_controller import (
    register_ctrl,
    verify_register_ctrl,
    login_controller
)

router=APIRouter(prefix="/auth")

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    role: str

@router.post("/register")
def register(data: RegisterRequest):
    return register_ctrl(data.email, data.username, data.password)
class VerifyRequest(BaseModel):
    email: str
    username: str
    password: str
    otp: str
    role: str


@router.post("/verify-register")
def verify(data: VerifyRequest):
    return verify_register_ctrl(
        data.email,
        data.username,
        data.password,
        data.otp
    )
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    return login_controller(data.email, data.password)