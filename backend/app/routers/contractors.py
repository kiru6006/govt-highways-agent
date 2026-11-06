from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Contractor
from app.schemas import ContractorOut
from app.auth import get_current_user

router = APIRouter(prefix="/contractors", tags=["Contractor Intelligence"])

@router.get("", response_model=List[ContractorOut])
def list_contractors(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Contractor).all()

