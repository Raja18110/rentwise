from app.db import SessionLocal
from app.models.lease import Lease

db = SessionLocal()

def create_lease(data):
    lease = Lease(**data)
    db.add(lease)
    db.commit()
    return {"msg": "Lease created"}

def get_all_leases():
    leases = db.query(Lease).all()

    return [
        {
            "id": l.id,
            "property_name": l.property_name,
            "tenant_email": l.tenant_email,
            "rent_amount": l.rent_amount,
            "frequency": l.frequency,
            "deposit": l.deposit,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "status": l.status
        }
        for l in leases
    ]