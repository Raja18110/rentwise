# app/utils/jwt.py
from jose import jwt
from datetime import datetime, timedelta

SECRET="secret"

def create_token(data):
    data["exp"]=datetime.utcnow()+timedelta(hours=2)
    return jwt.encode(data, SECRET, algorithm="HS256")