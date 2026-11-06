import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Issue, Project, User
from app.schemas import IssueOut, IssueCreate, IssueUpdate
from app.auth import get_current_user
from app.services.workflow import transition_issue_status
from app.services.audit import log_audit_event

router = APIRouter(prefix="/issues", tags=["Issues & Bottlenecks"])

@router.get("", response_model=List[IssueOut])
def list_issues(
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Issue)
    if status_filter:
        query = query.filter(Issue.status == status_filter)
    if priority:
        query = query.filter(Issue.priority == priority)
    if project_id:
        query = query.filter(Issue.project_id == project_id)
        
    issues = query.order_by(Issue.id.desc()).all()
    results = []
    for iss in issues:
        results.append(IssueOut(
            id=iss.id,
            issue_reference=iss.issue_reference,
            category=iss.category,
            description=iss.description,
            project_id=iss.project_id,
            project_title=iss.project.title if iss.project else None,
            priority=iss.priority,
            status=iss.status,
            escalation_status=iss.escalation_status,
            assigned_to_name=iss.assigned_to_user.full_name if iss.assigned_to_user else "Unassigned",
            assigned_date=iss.assigned_date,
            target_resolution_date=iss.target_resolution_date,
            resolution_notes=iss.resolution_notes
        ))
    return results

@router.post("", response_model=IssueOut, status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate unique issue reference
    ref_count = db.query(Issue).count() + 1
    issue_reference = f"ISS-2026-{ref_count:04d}"
    
    issue = Issue(
        issue_reference=issue_reference,
        category=payload.category,
        description=payload.description,
        project_id=payload.project_id,
        department_id=payload.department_id,
        assigned_to_user_id=payload.assigned_to_user_id or current_user.id,
        priority=payload.priority,
        status="New",
        target_resolution_date=payload.target_resolution_date
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    
    log_audit_event(
        db=db,
        action="CREATE",
        entity_type="ISSUE",
        entity_id=issue.id,
        entity_reference=issue.issue_reference,
        user=current_user,
        changes={"category": issue.category, "project_id": issue.project_id}
    )
    
    return IssueOut(
        id=issue.id,
        issue_reference=issue.issue_reference,
        category=issue.category,
        description=issue.description,
        project_id=issue.project_id,
        project_title=issue.project.title if issue.project else None,
        priority=issue.priority,
        status=issue.status,
        escalation_status=issue.escalation_status,
        assigned_to_name=issue.assigned_to_user.full_name if issue.assigned_to_user else None,
        assigned_date=issue.assigned_date,
        target_resolution_date=issue.target_resolution_date,
        resolution_notes=issue.resolution_notes
    )

@router.patch("/{issue_id}", response_model=IssueOut)
def update_issue(
    issue_id: int,
    payload: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    if payload.status and payload.status != issue.status:
        transition_issue_status(
            db=db,
            issue=issue,
            new_status=payload.status,
            user=current_user,
            resolution_notes=payload.resolution_notes,
            closure_evidence=payload.closure_evidence
        )
    else:
        if payload.priority:
            issue.priority = payload.priority
        if payload.resolution_notes:
            issue.resolution_notes = payload.resolution_notes
        if payload.escalation_status:
            issue.escalation_status = payload.escalation_status
        db.commit()
        db.refresh(issue)
        
    return IssueOut(
        id=issue.id,
        issue_reference=issue.issue_reference,
        category=issue.category,
        description=issue.description,
        project_id=issue.project_id,
        project_title=issue.project.title if issue.project else None,
        priority=issue.priority,
        status=issue.status,
        escalation_status=issue.escalation_status,
        assigned_to_name=issue.assigned_to_user.full_name if issue.assigned_to_user else None,
        assigned_date=issue.assigned_date,
        target_resolution_date=issue.target_resolution_date,
        resolution_notes=issue.resolution_notes
    )

