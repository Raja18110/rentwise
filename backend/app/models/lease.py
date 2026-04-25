from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime

class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)

    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    property_name = Column(String)
    tenant_email = Column(String)
    landlord_email = Column(String, nullable=True)

    rent_amount = Column(Float)
    frequency = Column(String, default="monthly")   # monthly / yearly

    deposit = Column(Float, default=0)

    start_date = Column(String)
    end_date = Column(String)

    status = Column(String, default="pending")  # pending / active / expired / terminated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)