from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.property import Property
from pydantic import BaseModel

class PropertyCreate(BaseModel):
    name: str
    location: str
    rent: float
    landlord_id: int

router = APIRouter(prefix="/property")

@router.get("/")
def get_properties(db: Session = Depends(get_db)):
    return db.query(Property).all()

@router.post("/")
def create_property(data: PropertyCreate, db: Session = Depends(get_db)):
    prop = Property(name=data.name, location=data.location, rent=data.rent, landlord_id=data.landlord_id)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop