from fastapi import APIRouter
from pydantic import BaseModel
from app.services.auth import create_token
from app.db import SessionLocal
from app.models.user import User

router = APIRouter(prefix="/auth")

db = SessionLocal()

class GoogleRequest(BaseModel):
    email: str

@router.post("/google")
def google_login(data: GoogleRequest):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        user = User(
            email=data.email,
            username=data.email.split("@")[0],
            role="tenant"
        )
        db.add(user)
        db.commit()

    token = create_token({"id": user.id})

    return {
        "token": token,
        "role": user.role
    }