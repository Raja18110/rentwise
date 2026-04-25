from app.models.payment import Payment


def create_payment(
    db,
    email,
    amount,
    type,
    lease_id=None,
    tenant_id=None,
    landlord_id=None,
    landlord_email=None,
    razorpay_order_id=None,
    razorpay_payment_id=None,
):
    payment = Payment(
        tenant_email=email,
        lease_id=lease_id,
        tenant_id=tenant_id,
        landlord_id=landlord_id,
        landlord_email=landlord_email,
        amount=amount,
        type=type,
        status="success",
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payments(db):
    return db.query(Payment).all()
