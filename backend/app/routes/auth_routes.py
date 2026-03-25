# routes/auth_routes.py
from fastapi import APIRouter
from app.controllers.auth_controller import login_controller, register_ctrl
from pydantic import BaseModel

router=APIRouter(prefix="/auth")

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

@router.post("/register")
def register(data: RegisterRequest):
    return register_ctrl(data.email, data.username, data.password)

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    return login_controller(data.email, data.password)