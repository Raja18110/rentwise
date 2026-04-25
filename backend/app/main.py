from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.db import Base, engine
from app.db_migrations import run_startup_migrations
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


FRONTEND_URLS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_URLS",
        "http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002",
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    import time

    print("Starting RentWise backend...")

    # Try DB connection (retry system)
    for i in range(5):
        try:
            Base.metadata.create_all(bind=engine)
            run_startup_migrations()
            print("Database connected")
            break
        except Exception as exc:
            print(f"DB not ready... retry {i+1}")
            time.sleep(3)
    else:
        print("Running without DB (temporary)")

    yield

    print("Shutting down...")


app = FastAPI(
    title="RentWise API",
    description="Property management and rental system API",
    version="1.0.0",
    lifespan=lifespan
)

# Include routers with proper prefixes
app.include_router(auth_routes.router)
app.include_router(lease_routes.router)
app.include_router(user_routes.router)
app.include_router(upload.router)
app.include_router(payment.router)
app.include_router(request.router)
app.include_router(property.router)
app.include_router(chat.router)
app.include_router(notification.router)

# Configure CORS middleware properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,  # Specific origins only
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods: GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose headers to client
    max_age=600,  # Cache preflight requests for 10 minutes
)


@app.get("/")
def home():
    """Root endpoint - API status check"""
    return {
        "status": "running",
        "message": "RentWise API",
        "version": "1.0.0"
    }
