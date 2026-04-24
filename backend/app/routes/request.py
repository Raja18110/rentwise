from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.request import Request
from pydantic import BaseModel, Field

class RequestCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    user_id: int

class RequestUpdate(BaseModel):
    message: str = None

router = APIRouter(prefix="/request", tags=["Requests"])

@router.get("/", summary="Get all requests")
def get_requests(db: Session = Depends(get_db)):
    """Get all requests"""
    try:
        requests = db.query(Request).all()
        return {
            "success": True,
            "data": requests,
            "count": len(requests) if requests else 0
        }
    except Exception as e:
        print(f"Get requests error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve requests"
        )

@router.post("/", summary="Create new request")
def create_request(data: RequestCreate, db: Session = Depends(get_db)):
    """Create a new request"""
    try:
        if data.user_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
        
        req = Request(
            message=data.message.strip(),
            user_id=data.user_id
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        
        return {
            "success": True,
            "message": "Request created successfully",
            "data": req
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create request"
        )

@router.get("/{request_id}", summary="Get request by ID")
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Get a specific request"""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()
        
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        return {
            "success": True,
            "data": req
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve request"
        )

@router.put("/{request_id}", summary="Update request")
def update_request(
    request_id: int,
    data: RequestUpdate,
    db: Session = Depends(get_db)
):
    """Update a request"""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()
        
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        if data.message:
            req.message = data.message.strip()
        
        db.commit()
        db.refresh(req)
        
        return {
            "success": True,
            "message": "Request updated successfully",
            "data": req
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update request"
        )

@router.delete("/{request_id}", summary="Delete request")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    """Delete a request"""
    try:
        req = db.query(Request).filter(Request.id == request_id).first()
        
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        db.delete(req)
        db.commit()
        
        return {
            "success": True,
            "message": "Request deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete request"
        )
