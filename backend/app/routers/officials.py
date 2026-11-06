from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Official, User
from app.schemas import OfficialOut
from app.auth import get_current_user

router = APIRouter(prefix="/officials", tags=["Officials & Engineers"])

@router.get("", response_model=List[OfficialOut])
def list_officials(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    officials = db.query(Official).all()
    results = []
    for off in officials:
        results.append(OfficialOut(
            id=off.id,
            user_id=off.user_id,
            employee_code=off.employee_code,
            full_name=off.user.full_name if off.user else "Officer",
            designation=off.designation,
            cadre=off.cadre,
            current_posting=off.current_posting,
            active_from=off.active_from
        ))
    return results

