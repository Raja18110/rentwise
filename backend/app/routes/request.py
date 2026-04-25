from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.lease import Lease
from app.models.request import Request
from app.services.notification import create_notification


class RequestCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    title: str | None = None
    lease_id: int | None = None
    property_id: int | None = None
    tenant_id: int | None = None
    landlord_id: int | None = None
    tenant_email: str | None = None
    landlord_email: str | None = None
    request_type: str = "maintenance"
    priority: str = "normal"


class RequestUpdate(BaseModel):
    message: str | None = None
    status: str | None = None
    priority: str | None = None


router = APIRouter(prefix="/request", tags=["Requests"])


@router.get("/", summary="Get all requests")
def get_requests(db: Session = Depends(get_db)):
    """Get all requests."""
    try:
        requests = db.query(Request).order_by(Request.created_at.desc()).all()
        return {
            "success": True,
            "data": requests,
            "count": len(requests) if requests else 0,
        }
    except Exception as e:
        print(f"Get requests error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve requests",
        )


@router.get("/tenant/{tenant_email}", summary="Get requests by tenant email")
def get_tenant_requests(tenant_email: str, db: Session = Depends(get_db)):
    try:
        requests = (
            db.query(Request)
            .filter(Request.tenant_email == tenant_email)
            .order_by(Request.created_at.desc())
            .all()
        )
        return {"success": True, "data": requests, "count": len(requests)}
    except Exception as e:
        print(f"Get tenant requests error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve requests")


@router.get("/landlord/{landlord_email}", summary="Get requests by landlord email")
def get_landlord_requests(landlord_email: str, db: Session = Depends(get_db)):
    try:
        requests = (
            db.query(Request)
            .filter(Request.landlord_email == landlord_email)
            .order_by(Request.created_at.desc())
            .all()
        )
        return {"success": True, "data": requests, "count": len(requests)}
    except Exception as e:
        print(f"Get landlord requests error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve requests")


@router.post("/", summary="Create new request")
def create_request(data: RequestCreate, db: Session = Depends(get_db)):
    """Create a maintenance/service request tied to a lease."""
    try:
        lease = None
        landlord_email = data.landlord_email
        landlord_id = data.landlord_id
        property_id = data.property_id

        if data.lease_id:
            lease = db.query(Lease).filter(Lease.id == data.lease_id).first()
            if not lease:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lease not found",
                )
            landlord_email = landlord_email or lease.landlord_email
            landlord_id = landlord_id or lease.landlord_id
            property_id = property_id or lease.property_id

        req = Request(
            lease_id=data.lease_id,
            property_id=property_id,
            tenant_id=data.tenant_id or (lease.tenant_id if lease else None),
            landlord_id=landlord_id,
            title=data.title.strip() if data.title else "Maintenance request",
            message=data.message.strip(),
            tenant_email=data.tenant_email or (lease.tenant_email if lease else None),
            landlord_email=landlord_email,
            request_type=data.request_type,
            priority=data.priority,
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        if req.landlord_email:
            create_notification(
                db,
                req.landlord_email,
                f"{req.tenant_email or 'A tenant'} requested maintenance for {lease.property_name if lease else 'a property'}.",
                title=req.title,
                notification_type="request",
                related_id=req.id,
            )

        return {
            "success": True,
            "message": "Request created successfully",
            "data": req,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create request",
        )


@router.get("/{request_id}", summary="Get request by ID")
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Get a specific request."""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()

        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )

        return {
            "success": True,
            "data": req,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve request",
        )


@router.put("/{request_id}", summary="Update request")
def update_request(
    request_id: int,
    data: RequestUpdate,
    db: Session = Depends(get_db),
):
    """Update a request."""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()

        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )

        if data.message:
            req.message = data.message.strip()
        if data.status:
            req.status = data.status
        if data.priority:
            req.priority = data.priority

        db.commit()
        db.refresh(req)

        return {
            "success": True,
            "message": "Request updated successfully",
            "data": req,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update request",
        )


@router.delete("/{request_id}", summary="Delete request")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    """Delete a request."""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()

        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )

        db.delete(req)
        db.commit()

        return {
            "success": True,
            "message": "Request deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete request",
        )
