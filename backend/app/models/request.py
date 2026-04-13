from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True)
    message = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")