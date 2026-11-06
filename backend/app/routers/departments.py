from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Department, Zone, Circle, Division
from app.schemas import DepartmentOut, ZoneOut, CircleOut, DivisionOut
from app.auth import get_current_user

router = APIRouter(prefix="/departments", tags=["Departments & Jurisdictions"])

@router.get("", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Department).all()

@router.get("/zones", response_model=List[ZoneOut])
def get_zones(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Zone).all()

@router.get("/circles", response_model=List[CircleOut])
def get_circles(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Circle).all()

@router.get("/divisions", response_model=List[DivisionOut])
def get_divisions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Division).all()

