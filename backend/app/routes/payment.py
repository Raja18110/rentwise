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
from app.models.lease import Lease
from app.services.payment import create_payment, get_payments
from app.services.notification import create_notification


class PaymentSchema(BaseModel):
    email: str
    amount: float = Field(..., gt=0)
    type: str
    lease_id: int | None = None
    tenant_id: int | None = None
    landlord_id: int | None = None
    landlord_email: str | None = None
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None


class CreateOrderSchema(BaseModel):
    amount: int = Field(..., gt=0)


router = APIRouter(prefix="/payment", tags=["Payments"])


@router.post("/", summary="Create payment")
def pay(data: PaymentSchema, db: Session = Depends(get_db)):
    """Create a new payment record and notify both parties."""
    try:
        lease = None
        landlord_email = data.landlord_email
        landlord_id = data.landlord_id

        if data.lease_id:
            lease = db.query(Lease).filter(Lease.id == data.lease_id).first()
            if not lease:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lease not found",
                )
            landlord_email = landlord_email or lease.landlord_email
            landlord_id = landlord_id or lease.landlord_id

        payment = create_payment(
            db,
            data.email,
            data.amount,
            data.type,
            lease_id=data.lease_id,
            tenant_id=data.tenant_id or (lease.tenant_id if lease else None),
            landlord_id=landlord_id,
            landlord_email=landlord_email,
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
        )

        if landlord_email:
            create_notification(
                db,
                landlord_email,
                f"{data.email} paid Rs {data.amount} for {lease.property_name if lease else 'rent'}.",
                title="Payment received",
                notification_type="payment",
                related_id=payment.id,
            )

        create_notification(
            db,
            data.email,
            f"Payment of Rs {data.amount} recorded successfully.",
            title="Payment successful",
            notification_type="payment",
            related_id=payment.id,
        )

        return {
            "success": True,
            "message": "Payment created successfully",
            "data": payment,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create payment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment",
        )


@router.post("/create-order", summary="Create Razorpay order")
def create_order(data: CreateOrderSchema):
    """Create a Razorpay order for payment."""
    try:
        key_id = os.getenv("RAZORPAY_KEY_ID")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")

        if not key_id or not key_secret:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay not configured",
            )

        if not RAZORPAY_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay SDK not installed",
            )

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            order = client.order.create({
                "amount": data.amount * 100,
                "currency": "INR",
                "receipt": f"receipt_{data.amount}",
                "payment_capture": 1,
            })

            return {
                "success": True,
                "data": order,
            }
        except razorpay.BadRequestError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payment details: {str(e)}",
            )
        except razorpay.ServerError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay service temporarily unavailable",
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Create order error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order",
        )


@router.get("/", summary="Get all payments")
def history(db: Session = Depends(get_db)):
    """Get payment history."""
    try:
        payments = get_payments(db)

        return {
            "success": True,
            "data": payments,
            "count": len(payments) if payments else 0,
        }
    except Exception as e:
        print(f"Get payments error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payments",
        )
