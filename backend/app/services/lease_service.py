from app.models.lease import Lease
from app.models.property import Property
from app.services.notification import create_notification


def create_lease(db, data):
    prop = None
    if data.property_id:
        prop = db.query(Property).filter(Property.id == data.property_id).first()

    lease = Lease(
        property_id=data.property_id,
        landlord_id=data.landlord_id or (prop.landlord_id if prop else None),
        tenant_id=data.tenant_id,
        property_name=data.property_name,
        tenant_email=data.tenant_email,
        landlord_email=data.landlord_email or (prop.landlord_email if prop else None),
        rent_amount=data.rent_amount,
        frequency=data.frequency,
        deposit=data.deposit,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status
    )

    db.add(lease)
    if prop:
        prop.status = "rented"
    db.commit()
    db.refresh(lease)

    if lease.landlord_email:
        create_notification(
            db,
            lease.landlord_email,
            f"{lease.tenant_email} created a lease for {lease.property_name}.",
            title="New lease request",
            notification_type="lease",
            related_id=lease.id,
        )

    return lease


def get_all_leases(db):
    return db.query(Lease).all()


def update_lease_status(db, lease_id, status):
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if lease:
        lease.status = status
        db.commit()
        return lease
    return None
