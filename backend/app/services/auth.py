from app.db import SessionLocal
from app.models.user import User
from app.utils.hash import hash_password, verify_password
from app.utils.jwt import create_token


# ✅ REGISTER
def register_user(db, email, username, password, role):
    if not username or not username.strip():
        return {"error": "Username is required"}

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        return {"error": "User already exists"}

    user = User(
        email=email,
        username=username.strip(),
        password_hash=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()

    return {"msg": "User registered successfully"}


# ✅ LOGIN
def login_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"error": "User not found"}

    if not verify_password(password, user.password_hash):
        return {"error": "Wrong password"}

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