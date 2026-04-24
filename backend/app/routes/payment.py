import os

try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.payment import create_payment, get_payments
from app.services.notification import create_notification

class PaymentSchema(BaseModel):
    email: str
    amount: float = Field(..., gt=0)
    type: str

class CreateOrderSchema(BaseModel):
    amount: int = Field(..., gt=0)

router = APIRouter(prefix="/payment", tags=["Payments"])


@router.post("/", summary="Create payment")
def pay(data: PaymentSchema, db: Session = Depends(get_db)):
    """Create a new payment record"""
    try:
        create_notification(
            db,
            data.email,
            f"Payment of ₹{data.amount} created."
        )
        payment = create_payment(db, data.email, data.amount, data.type)
        
        return {
            "success": True,
            "message": "Payment created successfully",
            "data": payment
        }
    except Exception as e:
        print(f"Create payment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment"
        )


@router.post("/create-order", summary="Create Razorpay order")
def create_order(data: CreateOrderSchema):
    """Create a Razorpay order for payment"""
    try:
        key_id = os.getenv("RAZORPAY_KEY_ID")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")

        if not key_id or not key_secret:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay not configured"
            )

        if not RAZORPAY_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay SDK not installed"
            )

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            order = client.order.create({
                "amount": data.amount * 100,  # Convert to paise
                "currency": "INR",
                "receipt": f"receipt_{data.amount}",
                "payment_capture": 1,
            })
            
            return {
                "success": True,
                "data": order
            }
        except razorpay.BadRequestError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payment details: {str(e)}"
            )
        except razorpay.ServerError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay service temporarily unavailable"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Create order error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order"
        )


@router.get("/", summary="Get all payments")
def history(db: Session = Depends(get_db)):
    """Get payment history"""
    try:
        payments = get_payments(db)
        
        return {
            "success": True,
            "data": payments,
            "count": len(payments) if payments else 0
        }
    except Exception as e:
        print(f"Get payments error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payments"
        )
