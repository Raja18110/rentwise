from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.request import Request
from pydantic import BaseModel

class RequestCreate(BaseModel):
    message: str
    user_id: int

router = APIRouter(prefix="/request")

@router.get("/")
def get_requests(db: Session = Depends(get_db)):
    return db.query(Request).all()

@router.post("/")
def create_request(data: RequestCreate, db: Session = Depends(get_db)):
    req = Request(message=data.message, user_id=data.user_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req