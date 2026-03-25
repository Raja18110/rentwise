# controllers/auth_controller.py
from app.services.auth import login, register
from app.services.otp import send_otp, verify_otp

def register_ctrl(email, username, password, role):
    send_otp(email)
    return {"msg": "OTP sent"}

def verify_register_ctrl(email, username, password, otp, role):
    if verify_otp(email, otp):
        return register(email, username, password, role)
    return {"error": "Invalid OTP"}

def login_controller(email, password):
    return login(email, password)