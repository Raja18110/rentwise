from sqlalchemy import Column, Integer, String
from app.db import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    message = Column(String)
    status = Column(String, default="unread")  # unread/read