from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Organisation
from app.schemas import OrganisationOut
from app.auth import get_current_user

router = APIRouter(prefix="/organisations", tags=["Organisations"])

@router.get("", response_model=List[OrganisationOut])
def get_organisations(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Organisation).all()

