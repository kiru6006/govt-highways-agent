from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DepartmentDependency, User
from app.schemas import DependencyOut, DependencyCreate
from app.auth import get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/dependencies", tags=["Department Dependencies"])

@router.get("", response_model=List[DependencyOut])
def list_dependencies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deps = db.query(DepartmentDependency).all()
    results = []
    for d in deps:
        results.append(DependencyOut(
            id=d.id,
            project_id=d.project_id,
            project_title=d.project.title if d.project else None,
            requesting_dept_name=d.requesting_dept.name if d.requesting_dept else "Highways",
            target_dept_name=d.target_dept.name if d.target_dept else "External Dept",
            dependency_type=d.dependency_type,
            description=d.description,
            impact_days=d.impact_days,
            status=d.status,
            target_clearance_date=d.target_clearance_date
        ))
    return results

@router.post("", response_model=DependencyOut, status_code=status.HTTP_201_CREATED)
def create_dependency(
    payload: DependencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dep = DepartmentDependency(
        project_id=payload.project_id,
        requesting_dept_id=payload.requesting_dept_id,
        target_dept_id=payload.target_dept_id,
        dependency_type=payload.dependency_type,
        description=payload.description,
        impact_days=payload.impact_days,
        target_clearance_date=payload.target_clearance_date,
        status="PENDING"
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    
    log_audit_event(
        db=db,
        action="CREATE",
        entity_type="DEPENDENCY",
        entity_id=dep.id,
        entity_reference=f"DEP-{dep.id}",
        user=current_user,
        changes={"type": dep.dependency_type, "impact_days": dep.impact_days}
    )
    
    return DependencyOut(
        id=dep.id,
        project_id=dep.project_id,
        project_title=dep.project.title if dep.project else None,
        requesting_dept_name=dep.requesting_dept.name if dep.requesting_dept else "Highways",
        target_dept_name=dep.target_dept.name if dep.target_dept else "External Dept",
        dependency_type=dep.dependency_type,
        description=dep.description,
        impact_days=dep.impact_days,
        status=dep.status,
        target_clearance_date=dep.target_clearance_date
    )

