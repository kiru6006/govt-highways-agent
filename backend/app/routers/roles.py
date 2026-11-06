from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Role
from app.schemas import RoleOut
from app.auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])

@router.get("", response_model=List[RoleOut])
def get_roles(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Role).all()

