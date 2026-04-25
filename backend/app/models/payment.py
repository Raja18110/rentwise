from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from app.db import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    tenant_email = Column(String)
    landlord_email = Column(String, nullable=True)
    amount = Column(Float)
    type = Column(String, default="rent")  # rent / maintenance / deposit
    status = Column(String, default="success")  # pending / success / failed
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)