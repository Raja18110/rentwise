from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth_routes, upload, payment
from app.websocket import chat
from app.db import Base, engine
from app.models.user import User

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
Base.metadata.create_all(bind=engine)

# ROUTES
app.include_router(auth_routes.router)
app.include_router(upload.router)
app.include_router(payment.router)
app.include_router(chat.router)

@app.get("/")
def home():
    return {"msg": "API running"}