from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserOut
from app.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).all()
    results = []
    for u in users:
        results.append(UserOut(
            id=u.id,
            email=u.email,
            username=u.username,
            full_name=u.full_name,
            phone=u.phone,
            role_code=u.role.code if u.role else "USER",
            role_name=u.role.name if u.role else "User",
            department_name=u.department.name if u.department else None,
            zone_id=u.zone_id,
            circle_id=u.circle_id,
            division_id=u.division_id,
            contractor_id=u.contractor_id,
            is_active=u.is_active
        ))
    return results

