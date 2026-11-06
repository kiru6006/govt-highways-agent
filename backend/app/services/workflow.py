import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Issue, WorkflowTask, User
from app.services.audit import log_audit_event

VALID_ISSUE_STATUSES = [
    "New",
    "Under Review",
    "Assigned",
    "Action in Progress",
    "Awaiting External Department",
    "Awaiting Evidence",
    "Resolved",
    "Closed",
    "Reopened"
]

def transition_issue_status(
    db: Session,
    issue: Issue,
    new_status: str,
    user: User,
    resolution_notes: Optional[str] = None,
    closure_evidence: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Issue:
    if new_status not in VALID_ISSUE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid issue status: '{new_status}'. Allowed: {VALID_ISSUE_STATUSES}"
        )
    
    old_status = issue.status
    issue.status = new_status
    
    if resolution_notes:
        issue.resolution_notes = resolution_notes
    if closure_evidence:
        issue.closure_evidence = closure_evidence
        
    db.commit()
    db.refresh(issue)
    
    # Immutable audit logging
    log_audit_event(
        db=db,
        action="STATUS_CHANGE",
        entity_type="ISSUE",
        entity_id=issue.id,
        entity_reference=issue.issue_reference,
        user=user,
        changes={"old_status": old_status, "new_status": new_status, "notes": resolution_notes},
        ip_address=ip_address
    )
    return issue

