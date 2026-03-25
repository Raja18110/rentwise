# routes/auth_routes.py
from fastapi import APIRouter
from app.controllers.auth_controller import *

router=APIRouter(prefix="/auth")

@router.post("/register")
def reg(email:str,username:str,password:str):
    return register_ctrl(email,username,password)