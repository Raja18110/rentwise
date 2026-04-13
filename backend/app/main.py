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
    # Startup
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(
            "WARNING: Database initialization failed on startup. "
            "Your DATABASE_URL may be unreachable or invalid."
        )
        print(exc)
    yield
    # Shutdown (if needed)


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