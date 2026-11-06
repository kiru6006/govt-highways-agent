from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import Token, UserOut, LoginRequest
from app.auth import verify_password, create_access_token, get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.code if user.role else "USER"}
    )
    
    # Audit login
    log_audit_event(
        db=db,
        action="LOGIN",
        entity_type="USER",
        entity_id=user.id,
        entity_reference=user.username,
        user=user
    )
    
    user_info = {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role_code": user.role.code if user.role else "USER",
        "role_name": user.role.name if user.role else "User",
        "department_name": user.department.name if user.department else "Highways Department",
        "zone_id": user.zone_id,
        "circle_id": user.circle_id,
        "division_id": user.division_id,
        "contractor_id": user.contractor_id
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user_info": user_info}

@router.post("/login", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.code if user.role else "USER"}
    )
    
    user_info = {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role_code": user.role.code if user.role else "USER",
        "role_name": user.role.name if user.role else "User",
        "department_name": user.department.name if user.department else "Highways Department",
        "zone_id": user.zone_id,
        "circle_id": user.circle_id,
        "division_id": user.division_id,
        "contractor_id": user.contractor_id
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user_info": user_info}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role_code=current_user.role.code if current_user.role else "USER",
        role_name=current_user.role.name if current_user.role else "User",
        department_name=current_user.department.name if current_user.department else None,
        zone_id=current_user.zone_id,
        circle_id=current_user.circle_id,
        division_id=current_user.division_id,
        contractor_id=current_user.contractor_id,
        is_active=current_user.is_active
    )

