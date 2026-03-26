from fastapi import APIRouter
from pydantic import BaseModel
from app.services.lease_service import create_lease, get_all_leases
from app.schemas.lease import LeaseSchema

router = APIRouter(prefix="/lease")




# 🔹 CREATE LEASE
@router.post("/")
def create(data: LeaseSchema):
    return create_lease(data.dict())


# 🔹 GET ALL LEASES
@router.get("/")
def get_all():
    return get_all_leases()