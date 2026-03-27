from sqlalchemy import Column, Integer, String, Float
from app.db import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    amount = Column(Float)
    type = Column(String)  # rent / maintenance
    status = Column(String, default="success")