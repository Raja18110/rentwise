# app/services/auth_service.py
from app.db import SessionLocal
from app.models.user import User
from app.utils.hash import *
from app.utils.jwt import *

db=SessionLocal()

def register(email, username, password, role="tenant"):
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()
    return user

def login(email,password):
    user=db.query(User).filter(User.email==email).first()
    if not user or not verify_password(password,user.password_hash):
        return None

    token=create_token({"id":user.id,"role":user.role})

    return {"token":token,"role":user.role}