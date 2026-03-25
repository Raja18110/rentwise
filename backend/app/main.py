from fastapi import FastAPI
from app.routes import auth_routes
from app.websocket import chat
from app.db import Base, engine

# IMPORTANT: import model
from app.models.user import User

Base.metadata.create_all(bind=engine)

app=FastAPI()
app.include_router(auth_routes.router)
app.include_router(chat.router)