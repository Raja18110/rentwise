from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.db import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String)
    message = Column(String)
    title = Column(String, nullable=True)
    notification_type = Column(String, default="general")  # payment / lease / request / message / system
    related_id = Column(Integer, nullable=True)  # ID of related payment/lease/request
    status = Column(String, default="unread")  # unread / read
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)