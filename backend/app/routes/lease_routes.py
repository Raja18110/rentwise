from fastapi import APIRouter
from pydantic import BaseModel
from app.services.lease_service import create_lease, get_all_leases

router = APIRouter(prefix="/lease")


# 🔹 Request Schema
class LeaseRequest(BaseModel):
    property_name: str
    tenant_email: str
    rent_amount: float
    frequency: str
    deposit: float
    start_date: str
    end_date: str
    status: str


# 🔹 CREATE LEASE
@router.post("/")
def create(data: LeaseRequest):
    return create_lease(data.dict())


# 🔹 GET ALL LEASES
@router.get("/")
def get_all():
    return get_all_leases()