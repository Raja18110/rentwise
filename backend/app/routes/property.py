from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.property import Property


class PropertyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    rent: float = Field(..., gt=0)
    landlord_id: int
    landlord_email: str | None = None
    description: str | None = None
    bhk: str | None = None
    area: str | None = None
    furnished: str = "unfurnished"


class PropertyUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    rent: float | None = None
    description: str | None = None
    status: str | None = None


router = APIRouter(prefix="/property", tags=["Properties"])


@router.get("/", summary="Get all properties")
def get_properties(db: Session = Depends(get_db)):
    """Get all properties."""
    try:
        properties = db.query(Property).order_by(Property.created_at.desc()).all()
        return {
            "success": True,
            "data": properties,
            "count": len(properties),
        }
    except Exception as e:
        print(f"Get properties error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve properties",
        )


@router.get("/landlord/{landlord_id}", summary="Get properties by landlord ID")
def get_landlord_properties(landlord_id: int, db: Session = Depends(get_db)):
    """Get all properties owned by a specific landlord."""
    try:
        properties = (
            db.query(Property)
            .filter(Property.landlord_id == landlord_id)
            .order_by(Property.created_at.desc())
            .all()
        )
        return {
            "success": True,
            "data": properties,
            "count": len(properties) if properties else 0,
        }
    except Exception as e:
        print(f"Get landlord properties error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve landlord properties",
        )


@router.get("/email/{email}", summary="Get properties by landlord email")
def get_properties_by_email(email: str, db: Session = Depends(get_db)):
    """Get all properties owned by a landlord with specific email."""
    try:
        properties = (
            db.query(Property)
            .filter(Property.landlord_email == email)
            .order_by(Property.created_at.desc())
            .all()
        )
        return {
            "success": True,
            "data": properties,
            "count": len(properties) if properties else 0,
        }
    except Exception as e:
        print(f"Get properties by email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve properties",
        )


@router.post("/", summary="Create new property")
def create_property(data: PropertyCreate, db: Session = Depends(get_db)):
    """Create a new property."""
    try:
        prop = Property(
            name=data.name.strip(),
            location=data.location.strip(),
            rent=data.rent,
            landlord_id=data.landlord_id,
            landlord_email=data.landlord_email,
            description=data.description,
            bhk=data.bhk,
            area=data.area,
            furnished=data.furnished,
        )
        db.add(prop)
        db.commit()
        db.refresh(prop)

        return {
            "success": True,
            "message": "Property created successfully",
            "data": prop,
        }
    except Exception as e:
        print(f"Create property error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create property",
        )


@router.get("/{property_id}", summary="Get property by ID")
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get a specific property."""
    try:
        prop = db.query(Property).filter(Property.id == property_id).first()

        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

        return {
            "success": True,
            "data": prop,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get property error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve property",
        )


@router.put("/{property_id}", summary="Update property")
def update_property(
    property_id: int,
    data: PropertyUpdate,
    db: Session = Depends(get_db),
):
    """Update a property."""
    try:
        prop = db.query(Property).filter(Property.id == property_id).first()

        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

        if data.name:
            prop.name = data.name.strip()
        if data.location:
            prop.location = data.location.strip()
        if data.rent and data.rent > 0:
            prop.rent = data.rent
        if data.description is not None:
            prop.description = data.description
        if data.status:
            prop.status = data.status

        db.commit()
        db.refresh(prop)

        return {
            "success": True,
            "message": "Property updated successfully",
            "data": prop,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update property error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update property",
        )


@router.delete("/{property_id}", summary="Delete property")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    """Delete a property."""
    try:
        prop = db.query(Property).filter(Property.id == property_id).first()

        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

        db.delete(prop)
        db.commit()

        return {
            "success": True,
            "message": "Property deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete property error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete property",
        )
