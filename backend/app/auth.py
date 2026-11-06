import datetime
from typing import Optional, List
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User, Role, Permission, Project

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        role_code = current_user.role.code if current_user.role else ""
        if "ADMIN" == role_code or role_code in allowed_roles:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Role '{role_code}' does not have sufficient clearance for this operation"
        )
    return role_checker

def check_project_jurisdiction(user: User, project: Project) -> bool:
    """
    Enforces Tamil Nadu Highways jurisdiction boundary rules:
    1. System Administrator, Minister, Principal Secretary, Chief Engineer have statewide access.
    2. Contractors ONLY have access if project.contractor_id == user.contractor_id.
    3. Zonal officers are restricted to their zone.
    4. Circle officers are restricted to their circle.
    5. Division officers are restricted to their division.
    """
    role_code = user.role.code if user.role else ""
    
    # State-level leadership and Admins
    if role_code in ["ADMIN", "MINISTER", "PRIN_SEC", "SEC", "CHIEF_ENG"]:
        return True
        
    # Contractor strict isolation
    if role_code == "CONTRACTOR":
        if user.contractor_id is not None and project.contractor_id == user.contractor_id:
            return True
        return False
        
    # Zonal CE
    if role_code == "ZONAL_CE":
        return user.zone_id is None or project.zone_id == user.zone_id
        
    # Superintending Engineer (Circle level)
    if role_code == "SE_CIRCLE":
        return user.circle_id is None or project.circle_id == user.circle_id
        
    # Divisional Engineer / Executive Engineer / ADE / JE (Division level)
    if role_code in ["EE_DIV", "ADE_SUBDIV", "JE_FIELD"]:
        return user.division_id is None or project.division_id == user.division_id

    # Default fallback to department match
    if user.department_id and project.executing_department_id:
        return user.department_id == project.executing_department_id

    return True

