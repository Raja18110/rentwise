from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from pydantic import BaseModel, EmailStr, Field
from app.services.notification import create_notification, get_notifications, mark_read

class NotificationSchema(BaseModel):
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)

router = APIRouter(prefix="/notification", tags=["Notifications"])


@router.post("/", summary="Create notification")
def create(data: NotificationSchema, db: Session = Depends(get_db)):
    """Create a new notification for a user"""
    try:
        notification = create_notification(db, data.email, data.message)
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create notification"
            )
        
        return {
            "success": True,
            "message": "Notification created successfully",
            "data": notification
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create notification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification"
        )


@router.get("/{email}", summary="Get notifications for user")
def get(email: str, db: Session = Depends(get_db)):
    """Get all notifications for a specific email"""
    try:
        notifications = get_notifications(db, email)
        
        return {
            "success": True,
            "data": notifications or [],
            "count": len(notifications) if notifications else 0
        }
    except Exception as e:
        print(f"Get notifications error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )


@router.put("/read/{notification_id}", summary="Mark notification as read")
def read(notification_id: int, db: Session = Depends(get_db)):
    """Mark a notification as read"""
    try:
        result = mark_read(db, notification_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return {
            "success": True,
            "message": "Notification marked as read",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Mark notification as read error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )
