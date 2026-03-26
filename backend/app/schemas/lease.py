from pydantic import BaseModel


class LeaseSchema(BaseModel):
    property_name: str
    tenant_email: str
    rent_amount: float
    frequency: str
    deposit: float
    start_date: str
    end_date: str
    status: str