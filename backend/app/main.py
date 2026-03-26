from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes import auth_routes
from app.routes import lease_routes
from app.routes import user_routes
from app.routes import upload
from app.routes import payment
from app.websocket import chat
from app.routes import google_routes


app = FastAPI()
app.include_router(auth_routes.router)
app.include_router(lease_routes.router)
app.include_router(user_routes.router)
app.include_router(upload.router)
app.include_router(payment.router)
app.include_router(chat.router)
app.include_router(google_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ CREATE TABLES
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "RentWise API running"}