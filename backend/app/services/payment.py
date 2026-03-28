from app.db import SessionLocal
from app.models.payment import Payment

db = SessionLocal()

def create_payment(db, email, amount, type):
    payment = Payment(
        email=email,
        amount=amount,
        type=type,
        status="success"
    )
    db.add(payment)
    db.commit()
    return payment


def get_payments(db):
    return db.query(Payment).all()