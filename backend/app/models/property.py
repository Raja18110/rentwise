from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from app.db import Base
from datetime import datetime

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    landlord_id = Column(Integer, ForeignKey("users.id"))
    landlord_email = Column(String, nullable=True)
    
    name = Column(String)
    location = Column(String)
    description = Column(Text, nullable=True)
    
    rent = Column(Float)
    deposit = Column(Float, nullable=True)
    
    bhk = Column(String, nullable=True)  # 1BHK, 2BHK, etc.
    area = Column(String, nullable=True)  # in sq ft
    furnished = Column(String, default="unfurnished")  # furnished / unfurnished / semi-furnished
    
    status = Column(String, default="available")  # available / rented / maintenance
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)