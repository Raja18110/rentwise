from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import Base, engine
from app.routes import auth_routes
from app.routes import lease_routes
from app.routes import user_routes
from app.routes import upload
from app.routes import payment
from app.routes import request
from app.routes import property
from app.websocket import chat
from app.models import notification
from app.models import request as request_model
from app.models import property as property_model
from app.routes import notification


@asynccontextmanager
async def lifespan(app: FastAPI):
    import time

    print("🚀 Starting RentWise backend...")

    # Try DB connection (retry system)
    for i in range(5):
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database connected")
            break
        except Exception as exc:
            print(f"⏳ DB not ready... retry {i+1}")
            time.sleep(3)
    else:
        print("⚠️ Running without DB (temporary)")

    yield

    print("🛑 Shutting down...")


app = FastAPI(lifespan=lifespan)
app.include_router(auth_routes.router)
app.include_router(lease_routes.router)
app.include_router(user_routes.router)
app.include_router(upload.router)
app.include_router(payment.router)
app.include_router(request.router)
app.include_router(property.router)
app.include_router(chat.router)
app.include_router(notification.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "RentWise API running"}