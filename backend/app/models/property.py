from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    location = Column(String)
    rent = Column(Float)
    landlord_id = Column(Integer, ForeignKey("users.id"))