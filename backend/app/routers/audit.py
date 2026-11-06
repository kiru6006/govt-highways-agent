from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditEvent, User
from app.schemas import AuditEventOut
from app.auth import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit & Transparency"])

@router.get("", response_model=List[AuditEventOut])
def list_audit_events(
    entity_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditEvent)
    if entity_type:
        query = query.filter(AuditEvent.entity_type == entity_type)
    events = query.order_by(AuditEvent.id.desc()).limit(limit).all()
    
    results = []
    for e in events:
        results.append(AuditEventOut(
            id=e.id,
            actor_name=e.actor_name,
            actor_role=e.actor_role,
            action=e.action,
            entity_type=e.entity_type,
            entity_id=e.entity_id,
            entity_reference=e.entity_reference,
            changes_json=e.changes_json,
            ip_address=e.ip_address,
            created_at=e.created_at
        ))
    return results

