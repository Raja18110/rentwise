from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from pydantic import BaseModel
from app.services.payment_service import create_payment, get_payments

router = APIRouter(prefix="/payment")


class PaymentSchema(BaseModel):
    email: str
    amount: float
    type: str


@router.post("/")
def pay(data: PaymentSchema, db: Session = Depends(get_db)):
    return create_payment(db, data.email, data.amount, data.type)


@router.get("/")
def history(db: Session = Depends(get_db)):
    return get_payments(db)