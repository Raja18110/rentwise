from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.services.auth import hash_password

router = APIRouter(prefix="/user")


@router.put("/update-email")
def update_email(user_id: int, new_email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    user.email = new_email
    db.commit()
    return {"message": "Email updated"}


@router.put("/update-username")
def update_username(user_id: int, username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    user.username = username
    db.commit()
    return {"message": "Username updated"}


@router.put("/update-password")
def update_password(user_id: int, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    user.password_hash = hash_password(password)
    db.commit()
    return {"message": "Password updated"}