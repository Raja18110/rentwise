from app.models.lease import Lease


def create_lease(db, data):
    lease = Lease(
        property_name=data.property_name,
        tenant_email=data.tenant_email,
        rent_amount=data.rent_amount,
        frequency=data.frequency,
        deposit=data.deposit,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status
    )

    db.add(lease)
    db.commit()
    db.refresh(lease)

    return lease


def get_all_leases(db):
    return db.query(Lease).all()