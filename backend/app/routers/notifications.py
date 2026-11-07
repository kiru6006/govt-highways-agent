"""
TN-HDOS Notifications API Router
Provides comprehensive endpoints for:
- Notification querying with pagination & filtering
- Unread & priority summaries
- Explainable AI Priority Briefings with provenance
- Status management (read, unread, acknowledge, save, add-to-calendar)
- User notification preferences
"""

import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, Notification, NotificationPreference,
    CalendarEvent, CalendarParticipant, NotificationAuditEvent, Project
)
from app.schemas import (
    NotificationOut, NotificationSummaryOut, AIPriorityBriefingItem,
    NotificationPreferenceOut, NotificationPreferenceUpdate
)
from app.services.notification_service import (
    filter_notifications_by_role, generate_ai_priority_briefings
)

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])


def format_notification(n: Notification) -> dict:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "message": n.message,
        "notification_type": n.notification_type or "INFO",
        "priority": n.priority or "MEDIUM",
        "category": n.category or "PROJECT_UPDATE",
        "source_module": n.source_module,
        "source_record_id": n.source_record_id,
        "project_id": n.project_id,
        "project_name": n.project_name,
        "department_id": n.department_id,
        "department_name": n.department_name,
        "responsible_officer_name": n.responsible_officer_name,
        "target_route": n.target_route or "/project-360",
        "is_read": n.is_read,
        "is_saved": n.is_saved,
        "is_acknowledged": n.is_acknowledged,
        "acknowledged_at": n.acknowledged_at.strftime("%d %b %Y, %H:%M IST") if n.acknowledged_at else None,
        "is_statutory_mandatory": n.is_statutory_mandatory,
        "due_date": n.due_date.strftime("%d %b %Y, %H:%M IST") if n.due_date else None,
        "ai_importance_score": n.ai_importance_score,
        "ai_is_priority_briefing": n.ai_is_priority_briefing,
        "ai_reasoning": n.ai_reasoning,
        "ai_potential_impact": n.ai_potential_impact,
        "ai_required_action": n.ai_required_action,
        "ai_evidence_citation": n.ai_evidence_citation,
        "ai_confidence_score": n.ai_confidence_score,
        "data_mode": n.data_mode or "mock",
        "data_status": n.data_status or "Seeded Demo",
        "reference_url": n.reference_url,
        "created_at": n.created_at.strftime("%d %b %Y, %H:%M IST") if n.created_at else "Just now"
    }


@router.get("", response_model=List[NotificationOut])
def get_notifications(
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    is_saved: Optional[bool] = Query(None, description="Filter by saved status"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    search: Optional[str] = Query(None, description="Free text search"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns paginated, role-filtered notifications for the logged-in persona."""
    query = db.query(Notification)
    query = filter_notifications_by_role(
        query=query,
        user=current_user,
        category=category,
        priority=priority,
        is_read=is_read,
        search=search
    )

    if is_saved is not None:
        query = query.filter(Notification.is_saved == is_saved)
    if project_id is not None:
        query = query.filter(Notification.project_id == project_id)

    items = query.offset(offset).limit(limit).all()
    return [format_notification(n) for n in items]


@router.get("/summary", response_model=NotificationSummaryOut)
def get_notification_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculates live operational summary counts for the authenticated user."""
    base_query = db.query(Notification).filter(Notification.user_id == current_user.id)

    total_notifications = base_query.count()
    unread_notifications = base_query.filter(Notification.is_read == False).count()
    critical_alerts = base_query.filter(Notification.priority == "CRITICAL").count()
    high_priority_alerts = base_query.filter(Notification.priority == "HIGH").count()
    pending_actions = base_query.filter(
        Notification.due_date != None,
        Notification.is_acknowledged == False
    ).count()

    now = datetime.datetime.utcnow()
    upcoming_meetings = db.query(CalendarEvent).filter(
        CalendarEvent.start_time >= now,
        CalendarEvent.start_time <= now + datetime.timedelta(days=7)
    ).count()

    overdue_tasks = base_query.filter(
        Notification.due_date != None,
        Notification.due_date < now,
        Notification.is_acknowledged == False
    ).count()

    # Distinct projects updated in last 7 days
    recently_updated_projects = db.query(func.count(func.distinct(Notification.project_id))).filter(
        Notification.user_id == current_user.id,
        Notification.project_id != None
    ).scalar() or 0

    return {
        "total_notifications": total_notifications,
        "unread_notifications": unread_notifications,
        "critical_alerts": critical_alerts,
        "high_priority_alerts": high_priority_alerts,
        "pending_actions": pending_actions,
        "upcoming_meetings": upcoming_meetings,
        "overdue_tasks": overdue_tasks,
        "recently_updated_projects": recently_updated_projects
    }


@router.get("/ai-priority-briefing", response_model=List[AIPriorityBriefingItem])
def get_ai_priority_briefing(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates explainable, evidence-grounded AI Priority Briefing for logged-in persona."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    notifications = query.order_by(
        desc(Notification.priority == "CRITICAL"),
        desc(Notification.priority == "HIGH"),
        desc(Notification.ai_importance_score),
        desc(Notification.created_at)
    ).all()

    briefings = generate_ai_priority_briefings(notifications, current_user)
    return briefings


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggles or sets notification read status."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.add(NotificationAuditEvent(
        notification_id=notif.id,
        user_id=current_user.id,
        action="READ",
        details="User marked notification as read"
    ))
    db.commit()
    return {"status": "success", "id": notif.id, "is_read": True}


@router.post("/{notification_id}/unread")
def mark_notification_unread(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks notification as unread."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = False
    db.add(NotificationAuditEvent(
        notification_id=notif.id,
        user_id=current_user.id,
        action="UNREAD",
        details="User marked notification as unread"
    ))
    db.commit()
    return {"status": "success", "id": notif.id, "is_read": False}


@router.post("/{notification_id}/save")
def toggle_save_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggles saved state for later reference."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_saved = not notif.is_saved
    db.add(NotificationAuditEvent(
        notification_id=notif.id,
        user_id=current_user.id,
        action="SAVED" if notif.is_saved else "UNSAVED",
        details=f"User toggled save flag to {notif.is_saved}"
    ))
    db.commit()
    return {"status": "success", "id": notif.id, "is_saved": notif.is_saved}


@router.post("/{notification_id}/acknowledge")
def acknowledge_statutory_alert(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Formal statutory sign-off and acknowledgement with immutable audit trail."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_acknowledged = True
    notif.acknowledged_at = datetime.datetime.utcnow()
    notif.is_read = True

    db.add(NotificationAuditEvent(
        notification_id=notif.id,
        user_id=current_user.id,
        action="ACKNOWLEDGED",
        details=f"Formal acknowledgment recorded by {current_user.full_name} ({current_user.role.code if current_user.role else 'OFFICER'})"
    ))
    db.commit()
    return {"status": "success", "id": notif.id, "is_acknowledged": True}


@router.post("/{notification_id}/add-to-calendar")
def add_notification_to_calendar(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a linked calendar event from a deadline or inspection notification."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    start_time = notif.due_date or (datetime.datetime.utcnow() + datetime.timedelta(days=2))
    end_time = start_time + datetime.timedelta(hours=1)

    event_code = f"EVT-NOTIF-{notif.id:04d}"
    existing_event = db.query(CalendarEvent).filter(CalendarEvent.event_code == event_code).first()

    if not existing_event:
        event = CalendarEvent(
            event_code=event_code,
            title=f"[Follow-up] {notif.title}",
            event_category="OFFICE_ACTION_DEADLINE" if notif.category != "MEETING" else "PROJECT_REVIEW",
            start_time=start_time,
            end_time=end_time,
            venue_or_url="Government Secretariat / Regional Site Office",
            is_virtual=False,
            organiser_user_id=current_user.id,
            organiser_name=current_user.full_name,
            organiser_role=current_user.role.name if current_user.role else "Officer",
            related_project_id=notif.project_id,
            related_project_name=notif.project_name,
            related_department_name=notif.department_name,
            agenda=f"Action on notification: {notif.message}",
            preparation_notes=f"Required action: {notif.ai_required_action or 'Review and verify compliance'}",
            priority=notif.priority,
            status="SCHEDULED",
            source_module="notifications",
            source_record_id=str(notif.id),
            data_mode="mock",
            data_status="Seeded Demo"
        )
        db.add(event)
        db.flush()

        # Add current user as participant
        db.add(CalendarParticipant(
            event_id=event.id,
            user_id=current_user.id,
            official_name=current_user.full_name,
            official_role=current_user.role.name if current_user.role else "Officer",
            department_name=notif.department_name or "Highways Department",
            invitation_status="ACCEPTED",
            attendance_status="PENDING"
        ))

    db.add(NotificationAuditEvent(
        notification_id=notif.id,
        user_id=current_user.id,
        action="CALENDAR_ADDED",
        details=f"Notification transformed into calendar event {event_code}"
    ))
    db.commit()
    return {"status": "success", "event_code": event_code, "notification_id": notif.id}


@router.post("/mark-all-read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all accessible notifications as read for current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}


@router.get("/preferences", response_model=NotificationPreferenceOut)
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches user notification preferences."""
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            enable_in_app=True,
            enable_email_digest=False,
            min_priority_alert="LOW",
            quiet_hours_enabled=False,
            quiet_hours_start="22:00",
            quiet_hours_end="06:00",
            category_filters_json="[]",
            daily_briefing_enabled=True
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    try:
        categories = json.loads(pref.category_filters_json or "[]")
    except Exception:
        categories = []

    return {
        "id": pref.id,
        "user_id": pref.user_id,
        "enable_in_app": pref.enable_in_app,
        "enable_email_digest": pref.enable_email_digest,
        "min_priority_alert": pref.min_priority_alert,
        "quiet_hours_enabled": pref.quiet_hours_enabled,
        "quiet_hours_start": pref.quiet_hours_start,
        "quiet_hours_end": pref.quiet_hours_end,
        "category_filters": categories,
        "daily_briefing_enabled": pref.daily_briefing_enabled
    }


@router.put("/preferences", response_model=NotificationPreferenceOut)
def update_user_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user notification preferences."""
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    if payload.enable_in_app is not None:
        pref.enable_in_app = payload.enable_in_app
    if payload.enable_email_digest is not None:
        pref.enable_email_digest = payload.enable_email_digest
    if payload.min_priority_alert is not None:
        pref.min_priority_alert = payload.min_priority_alert
    if payload.quiet_hours_enabled is not None:
        pref.quiet_hours_enabled = payload.quiet_hours_enabled
    if payload.quiet_hours_start is not None:
        pref.quiet_hours_start = payload.quiet_hours_start
    if payload.quiet_hours_end is not None:
        pref.quiet_hours_end = payload.quiet_hours_end
    if payload.category_filters is not None:
        pref.category_filters_json = json.dumps(payload.category_filters)
    if payload.daily_briefing_enabled is not None:
        pref.daily_briefing_enabled = payload.daily_briefing_enabled

    pref.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(pref)

    try:
        categories = json.loads(pref.category_filters_json or "[]")
    except Exception:
        categories = []

    return {
        "id": pref.id,
        "user_id": pref.user_id,
        "enable_in_app": pref.enable_in_app,
        "enable_email_digest": pref.enable_email_digest,
        "min_priority_alert": pref.min_priority_alert,
        "quiet_hours_enabled": pref.quiet_hours_enabled,
        "quiet_hours_start": pref.quiet_hours_start,
        "quiet_hours_end": pref.quiet_hours_end,
        "category_filters": categories,
        "daily_briefing_enabled": pref.daily_briefing_enabled
    }
