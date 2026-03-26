from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = "secret"
ALGORITHM = "HS256"

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)