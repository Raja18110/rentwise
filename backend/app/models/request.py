from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from app.db import Base
from datetime import datetime

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    title = Column(String, nullable=True)
    message = Column(Text)
    tenant_email = Column(String, nullable=True)
    landlord_email = Column(String, nullable=True)
    
    request_type = Column(String, default="maintenance")  # maintenance / repair / complaint
    priority = Column(String, default="normal")  # low / normal / high
    status = Column(String, default="pending")  # pending / in_progress / resolved / cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)