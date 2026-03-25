# controllers/auth_controller.py
from app.services.auth import *
from app.services.otp import *

def register_ctrl(email,username,password):
    send_otp(email)
    return {"msg":"OTP sent"}

def verify_ctrl(email,username,password,otp):
    if verify_otp(email,otp):
        return register(email,username,password)