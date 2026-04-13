import os

try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.payment import create_payment, get_payments
from app.services.notification import create_notification

router = APIRouter(prefix="/payment")


class PaymentSchema(BaseModel):
    email: str
    amount: float
    type: str


class CreateOrderSchema(BaseModel):
    amount: int


@router.post("/")
def pay(data: PaymentSchema, db: Session = Depends(get_db)):
    create_notification(db, data.email, f"Payment of ₹{data.amount} created.")
    return create_payment(db, data.email, data.amount, data.type)


@router.post("/create-order")
def create_order(data: CreateOrderSchema):
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if key_id and key_secret and RAZORPAY_AVAILABLE:
        client = razorpay.Client(auth=(key_id, key_secret))
        order = client.order.create({
            "amount": data.amount * 100,
            "currency": "INR",
            "receipt": "receipt_1",
            "payment_capture": 1,
        })
        return order

    return {
        "id": "test_order",
        "amount": data.amount * 100,
        "currency": "INR",
        "is_test_order": True,
    }


@router.get("/")
def history(db: Session = Depends(get_db)):
    return get_payments(db)