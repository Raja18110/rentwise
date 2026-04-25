from pydantic import BaseModel
from typing import Optional


class LeaseSchema(BaseModel):
    property_id: Optional[int] = None
    property_name: str
    tenant_email: str
    landlord_email: Optional[str] = None
    landlord_id: Optional[int] = None
    tenant_id: Optional[int] = None
    
    rent_amount: float
    frequency: str = "monthly"
    deposit: float = 0
    
    start_date: str
    end_date: str
    status: str = "pending"


class LeaseUpdateSchema(BaseModel):
    status: Optional[str] = None
    landlord_email: Optional[str] = None