from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.lease import LeaseSchema, LeaseUpdateSchema
from app.services.lease_service import create_lease, get_all_leases, update_lease_status
from app.models.lease import Lease

router = APIRouter(prefix="/lease")


@router.post("/")
def create(data: LeaseSchema, db: Session = Depends(get_db)):
    lease = create_lease(db, data)
    return lease


@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return get_all_leases(db)


@router.put("/{lease_id}")
def update_lease(lease_id: int, data: LeaseUpdateSchema, db: Session = Depends(get_db)):
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        return {"error": "Lease not found"}
    
    lease.status = data.status
    db.commit()
    return {"message": "Lease updated successfully"}