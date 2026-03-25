from fastapi import FastAPI
from app.routes import auth_routes
from app.websocket import chat

app=FastAPI()
app.include_router(auth_routes.router)
app.include_router(chat.router)