# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    username = Column(String)
    password_hash = Column(String)
    is_verified = Column(Boolean, default=False)