from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, User, Road, Contractor
from app.schemas import ProjectOut, ProjectCreate
from app.auth import get_current_user, check_project_jurisdiction, require_roles
from app.services.audit import log_audit_event

router = APIRouter(prefix="/projects", tags=["Projects & Roads"])

@router.get("", response_model=List[ProjectOut])
def list_projects(
    zone_id: Optional[int] = None,
    circle_id: Optional[int] = None,
    road_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    
    role_code = current_user.role.code if current_user.role else ""
    
    # Contractor isolation: Contractors can ONLY see their assigned projects
    if role_code == "CONTRACTOR":
        if current_user.contractor_id is None:
            return []
        query = query.filter(Project.contractor_id == current_user.contractor_id)
    # Zonal officer restriction
    elif role_code == "ZONAL_CE" and current_user.zone_id:
        query = query.filter(Project.zone_id == current_user.zone_id)
    # Circle officer restriction
    elif role_code == "SE_CIRCLE" and current_user.circle_id:
        query = query.filter(Project.circle_id == current_user.circle_id)
    # Division officer restriction
    elif role_code in ["EE_DIV", "ADE_SUBDIV", "JE_FIELD"] and current_user.division_id:
        query = query.filter(Project.division_id == current_user.division_id)
    
    if zone_id:
        query = query.filter(Project.zone_id == zone_id)
    if circle_id:
        query = query.filter(Project.circle_id == circle_id)
    if road_type:
        query = query.filter(Project.road_type == road_type)
        
    projects = query.all()
    results = []
    for p in projects:
        results.append(ProjectOut(
            id=p.id,
            project_code=p.project_code,
            title=p.title,
            description=p.description,
            road_type=p.road_type,
            estimated_cost_cr=p.estimated_cost_cr,
            sanctioned_cost_cr=p.sanctioned_cost_cr,
            expenditure_to_date_cr=p.expenditure_to_date_cr,
            physical_progress_pct=p.physical_progress_pct,
            financial_progress_pct=p.financial_progress_pct,
            status=p.status,
            priority=p.priority,
            zone_id=p.zone_id,
            circle_id=p.circle_id,
            division_id=p.division_id,
            contractor_id=p.contractor_id,
            contractor_name=p.contractor.company_name if p.contractor else None,
            road_name=p.road.name if p.road else None,
            created_at=p.created_at
        ))
    return results

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Enforce jurisdiction
    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: You do not have jurisdiction clearance for Project '{project.project_code}'"
        )
        
    return ProjectOut(
        id=project.id,
        project_code=project.project_code,
        title=project.title,
        description=project.description,
        road_type=project.road_type,
        estimated_cost_cr=project.estimated_cost_cr,
        sanctioned_cost_cr=project.sanctioned_cost_cr,
        expenditure_to_date_cr=project.expenditure_to_date_cr,
        physical_progress_pct=project.physical_progress_pct,
        financial_progress_pct=project.financial_progress_pct,
        status=project.status,
        priority=project.priority,
        zone_id=project.zone_id,
        circle_id=project.circle_id,
        division_id=project.division_id,
        contractor_id=project.contractor_id,
        contractor_name=project.contractor.company_name if project.contractor else None,
        road_name=project.road.name if project.road else None,
        created_at=project.created_at
    )

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "MINISTER", "PRIN_SEC", "CHIEF_ENG", "SE_CIRCLE", "EE_DIV"]))
):
    project = Project(
        project_code=payload.project_code,
        title=payload.title,
        description=payload.description,
        road_id=payload.road_id,
        road_type=payload.road_type,
        estimated_cost_cr=payload.estimated_cost_cr,
        sanctioned_cost_cr=payload.sanctioned_cost_cr,
        zone_id=payload.zone_id,
        circle_id=payload.circle_id,
        division_id=payload.division_id,
        executing_department_id=payload.executing_department_id,
        contractor_id=payload.contractor_id,
        priority=payload.priority,
        status="SANCTIONED"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    log_audit_event(
        db=db,
        action="CREATE",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=project.project_code,
        user=current_user,
        changes={"title": project.title, "sanctioned_cost_cr": project.sanctioned_cost_cr}
    )
    
    return ProjectOut(
        id=project.id,
        project_code=project.project_code,
        title=project.title,
        description=project.description,
        road_type=project.road_type,
        estimated_cost_cr=project.estimated_cost_cr,
        sanctioned_cost_cr=project.sanctioned_cost_cr,
        expenditure_to_date_cr=project.expenditure_to_date_cr,
        physical_progress_pct=project.physical_progress_pct,
        financial_progress_pct=project.financial_progress_pct,
        status=project.status,
        priority=project.priority,
        zone_id=project.zone_id,
        circle_id=project.circle_id,
        division_id=project.division_id,
        contractor_id=project.contractor_id,
        contractor_name=project.contractor.company_name if project.contractor else None,
        road_name=project.road.name if project.road else None,
        created_at=project.created_at
    )

