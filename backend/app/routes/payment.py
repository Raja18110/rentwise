from fastapi import APIRouter
from app.services.payment_service import create_order

router = APIRouter(prefix="/payment")

@router.post("/create-order")
def order(amount: float):
    return create_order(amount)