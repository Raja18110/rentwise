import razorpay
import os
from fastapi import APIRouter

router = APIRouter(prefix="/payment")

client = razorpay.Client(auth=("YOUR_KEY", "YOUR_SECRET"))


@router.post("/create-order")
def create_order():

    order = client.order.create({
        "amount": 5000 * 100,
        "currency": "INR",
        "payment_capture": 1
    })

    return order