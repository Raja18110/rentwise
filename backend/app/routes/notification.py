from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from pydantic import BaseModel
from app.services.notification import create_notification, get_notifications, mark_read

router = APIRouter(prefix="/notification")


class NotificationSchema(BaseModel):
    email: str
    message: str


@router.post("/")
def create(data: NotificationSchema, db: Session = Depends(get_db)):
    return create_notification(db, data.email, data.message)


@router.get("/{email}")
def get(email: str, db: Session = Depends(get_db)):
    return get_notifications(db, email)


@router.put("/read/{id}")
def read(id: int, db: Session = Depends(get_db)):
    return mark_read(db, id)