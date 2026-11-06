import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models import AuditEvent, User

def log_audit_event(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    entity_reference: Optional[str] = None,
    user: Optional[User] = None,
    changes: Optional[dict] = None,
    ip_address: Optional[str] = None
) -> AuditEvent:
    """
    Creates an immutable audit record for compliance, statutory vigilance and transparency.
    """
    actor_id = user.id if user else None
    actor_name = user.full_name if user else "System Automated Action"
    actor_role = user.role.name if (user and user.role) else "SYSTEM"

    changes_str = json.dumps(changes, default=str) if changes else None

    audit_entry = AuditEvent(
        actor_user_id=actor_id,
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_reference=entity_reference,
        changes_json=changes_str,
        ip_address=ip_address
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry

