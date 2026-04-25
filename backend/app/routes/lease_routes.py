from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.lease import LeaseSchema, LeaseUpdateSchema
from app.services.lease_service import create_lease, get_all_leases, update_lease_status
from app.models.lease import Lease
from pydantic import BaseModel

class LeaseStatusUpdate(BaseModel):
    status: str

router = APIRouter(prefix="/lease", tags=["Leases"])


@router.post("/", summary="Create new lease")
def create(data: LeaseSchema, db: Session = Depends(get_db)):
    try:
        lease = create_lease(db, data)
        return {
            "success": True,
            "message": "Lease created successfully",
            "data": lease
        }
    except Exception as e:
        print(f"Create lease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create lease"
        )


@router.get("/", summary="Get all leases")
def get_all(db: Session = Depends(get_db)):
    try:
        leases = get_all_leases(db)
        return {
            "success": True,
            "data": leases,
            "count": len(leases) if leases else 0
        }
    except Exception as e:
        print(f"Get leases error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leases"
        )


@router.put("/{lease_id}", summary="Update lease status")
def update_lease(
    lease_id: int,
    data: LeaseUpdateSchema,
    db: Session = Depends(get_db)
):
    """Update lease status"""
    try:
        lease = db.query(Lease).filter(Lease.id == lease_id).first()
        
        if not lease:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lease not found"
            )
        
        valid_statuses = ["active", "inactive", "terminated"]
        if data.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        lease.status = data.status
        db.commit()
        
        return {
            "success": True,
            "message": "Lease updated successfully",
            "data": lease
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update lease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update lease"
        )


@router.get("/{lease_id}", summary="Get lease by ID")
def get_lease(lease_id: int, db: Session = Depends(get_db)):
    """Get a specific lease"""
    try:
        lease = db.query(Lease).filter(Lease.id == lease_id).first()
        
        if not lease:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lease not found"
            )
        
        return {
            "success": True,
            "data": lease
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get lease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve lease"
        )


@router.get("/tenant/{tenant_email}", summary="Get leases by tenant email")
def get_tenant_leases(tenant_email: str, db: Session = Depends(get_db)):
    """Get all active leases for a specific tenant"""
    try:
        leases = db.query(Lease).filter(Lease.tenant_email == tenant_email).all()
        return {
            "success": True,
            "data": leases,
            "count": len(leases) if leases else 0
        }
    except Exception as e:
        print(f"Get tenant leases error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tenant leases"
        )


@router.get("/landlord/{landlord_email}", summary="Get leases by landlord email")
def get_landlord_leases(landlord_email: str, db: Session = Depends(get_db)):
    """Get all leases for a specific landlord"""
    try:
        leases = db.query(Lease).filter(Lease.landlord_email == landlord_email).all()
        return {
            "success": True,
            "data": leases,
            "count": len(leases) if leases else 0
        }
    except Exception as e:
        print(f"Get landlord leases error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve landlord leases"
        )
