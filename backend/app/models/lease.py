from sqlalchemy import Column, Integer, String, Float
from app.db import Base

class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)

    property_name = Column(String)
    tenant_email = Column(String)

    rent_amount = Column(Float)
    frequency = Column(String)   # monthly / yearly

    deposit = Column(Float)

    start_date = Column(String)
    end_date = Column(String)

    status = Column(String, default="pending")  # pending / active / expired