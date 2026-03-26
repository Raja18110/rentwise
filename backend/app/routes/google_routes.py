from fastapi import APIRouter
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

from app.services.auth import create_token
from app.db import SessionLocal
from app.models.user import User

router = APIRouter(prefix="/auth")
db = SessionLocal()

GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"


class GoogleRequest(BaseModel):
    token: str   # 🔥 IMPORTANT (not email anymore)


@router.post("/google")
def google_login(data: GoogleRequest):

    try:
        # ✅ VERIFY GOOGLE TOKEN
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")

    except Exception:
        return {"error": "Invalid Google token"}

    # ✅ FIND OR CREATE USER
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            username=name,
            role="tenant"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # ✅ CREATE JWT
    token = create_token({
        "id": user.id,
        "email": user.email
    })

    return {
        "token": token,
        "role": user.role
    }