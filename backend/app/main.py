from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

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


# Frontend URL configuration
FRONTEND_URLS = [
    "http://localhost:3002",
    "http://localhost:3000",
    "https://rentwise.vercel.app",
    "https://www.rentwise.vercel.app",
]

# Add environment-based URLs
if os.getenv("FRONTEND_URL"):
    FRONTEND_URLS.extend(os.getenv("FRONTEND_URL", "").split(","))


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


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "RentWise API"
    }


@app.options("/{full_path:path}")
def options_handler(full_path: str):
    """Handle preflight requests for CORS"""
    return {}
