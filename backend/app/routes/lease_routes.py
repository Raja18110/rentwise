from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.lease import LeaseSchema
from app.services.lease_service import create_lease, get_all_leases

router = APIRouter(prefix="/lease")


@router.post("/")
def create(data: LeaseSchema, db: Session = Depends(get_db)):
    lease = create_lease(db, data)
    return lease


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return get_all_leases(db)