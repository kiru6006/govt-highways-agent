"""
TN-HDOS Unified Calendar & Meeting Management Router
Provides:
- Month, Week, Day, Agenda & My Schedule views
- High-level meeting management (creation, invitation, agenda, MoM, decisions)
- Action item tracking and automated escalation linking
- Role-based participant visibility and RSVP
"""

import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, CalendarEvent, CalendarParticipant, MeetingActionItem,
    Project, Notification, NotificationAuditEvent
)
from app.schemas import (
    CalendarEventOut, CalendarEventCreate, MeetingMinutesUpdate,
    CalendarParticipantOut, MeetingActionItemOut
)

router = APIRouter(prefix="/calendar", tags=["Unified Calendar & Meetings"])


def format_event(e: CalendarEvent) -> dict:
    req_docs = []
    if e.required_documents_json:
        try:
            req_docs = json.loads(e.required_documents_json)
        except Exception:
            req_docs = []

    participants_out = [
        {
            "id": p.id,
            "user_id": p.user_id,
            "official_name": p.official_name,
            "official_role": p.official_role,
            "department_name": p.department_name,
            "invitation_status": p.invitation_status,
            "attendance_status": p.attendance_status,
            "notes": p.notes
        }
        for p in e.participants
    ]

    actions_out = [
        {
            "id": a.id,
            "event_id": a.event_id,
            "action_code": a.action_code,
            "title": a.title,
            "description": a.description,
            "responsible_user_id": a.responsible_user_id,
            "responsible_officer_name": a.responsible_officer_name,
            "responsible_department_name": a.responsible_department_name,
            "priority": a.priority,
            "due_date": a.due_date.strftime("%d %b %Y, %H:%M IST") if a.due_date else "Not set",
            "status": a.status,
            "escalation_level": a.escalation_level,
            "closure_remarks": a.closure_remarks,
            "created_at": a.created_at.strftime("%d %b %Y, %H:%M IST") if a.created_at else "Today"
        }
        for a in e.action_items
    ]

    return {
        "id": e.id,
        "event_code": e.event_code,
        "title": e.title,
        "event_category": e.event_category,
        "start_time": e.start_time.isoformat(),
        "end_time": e.end_time.isoformat(),
        "time_zone": e.time_zone or "Asia/Kolkata",
        "venue_or_url": e.venue_or_url,
        "is_virtual": e.is_virtual,
        "organiser_user_id": e.organiser_user_id,
        "organiser_name": e.organiser_name,
        "organiser_role": e.organiser_role,
        "related_project_id": e.related_project_id,
        "related_project_name": e.related_project_name,
        "related_department_name": e.related_department_name,
        "agenda": e.agenda,
        "preparation_notes": e.preparation_notes,
        "required_documents": req_docs,
        "previous_meeting_ref": e.previous_meeting_ref,
        "priority": e.priority or "HIGH",
        "status": e.status or "SCHEDULED",
        "source_module": e.source_module,
        "source_record_id": e.source_record_id,
        "minutes_of_meeting": e.minutes_of_meeting,
        "decisions_summary": e.decisions_summary,
        "data_mode": e.data_mode or "mock",
        "data_status": e.data_status or "Seeded Demo",
        "created_at": e.created_at.strftime("%d %b %Y, %H:%M IST") if e.created_at else "Today",
        "participants": participants_out,
        "action_items": actions_out
    }


@router.get("/events", response_model=List[CalendarEventOut])
def get_calendar_events(
    category: Optional[str] = Query(None, description="Filter by event category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    department: Optional[str] = Query(None, description="Filter by department"),
    my_calendar: bool = Query(False, description="Filter to events where user is organiser or invited"),
    start_date: Optional[str] = Query(None, description="ISO date or YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date or YYYY-MM-DD"),
    search: Optional[str] = Query(None, description="Search keyword"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves calendar events with multi-view filters (Month, Week, Day, Agenda)."""
    query = db.query(CalendarEvent)

    # Role restriction: Contractors only see events they are explicitly invited to or organised
    role_code = current_user.role.code if current_user.role else ""
    if role_code in ("CONTRACTOR", "PMC_CONSULTANT") or my_calendar:
        query = query.filter(
            or_(
                CalendarEvent.organiser_user_id == current_user.id,
                CalendarEvent.participants.any(CalendarParticipant.user_id == current_user.id)
            )
        )

    if category:
        query = query.filter(CalendarEvent.event_category == category.upper())
    if priority:
        query = query.filter(CalendarEvent.priority == priority.upper())
    if project_id:
        query = query.filter(CalendarEvent.related_project_id == project_id)
    if department:
        query = query.filter(CalendarEvent.related_department_name.ilike(f"%{department}%"))

    if start_date:
        try:
            sd = datetime.datetime.fromisoformat(start_date.replace("Z", "+00:00")).replace(tzinfo=None)
            query = query.filter(CalendarEvent.end_time >= sd)
        except Exception:
            pass

    if end_date:
        try:
            ed = datetime.datetime.fromisoformat(end_date.replace("Z", "+00:00")).replace(tzinfo=None)
            query = query.filter(CalendarEvent.start_time <= ed)
        except Exception:
            pass

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                CalendarEvent.title.ilike(s),
                CalendarEvent.agenda.ilike(s),
                CalendarEvent.related_project_name.ilike(s),
                CalendarEvent.venue_or_url.ilike(s)
            )
        )

    events = query.order_by(CalendarEvent.start_time.asc()).all()
    return [format_event(e) for e in events]


@router.get("/events/{event_id}", response_model=CalendarEventOut)
def get_calendar_event_detail(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns comprehensive event details including agenda, documents, participants, MoM, and action items."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")

    role_code = current_user.role.code if current_user.role else ""
    if role_code in ("CONTRACTOR", "PMC_CONSULTANT"):
        is_participant = any(p.user_id == current_user.id for p in event.participants)
        if not is_participant and event.organiser_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this meeting schedule")

    return format_event(event)


@router.post("/events", response_model=CalendarEventOut)
def create_calendar_event(
    payload: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedules a new meeting or event with participant invitations and notifications."""
    try:
        st = datetime.datetime.fromisoformat(payload.start_time.replace("Z", "+00:00")).replace(tzinfo=None)
        et = datetime.datetime.fromisoformat(payload.end_time.replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")

    if et <= st:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    project = None
    if payload.related_project_id:
        project = db.query(Project).filter(Project.id == payload.related_project_id).first()

    event_count = db.query(CalendarEvent).count() + 1
    event_code = f"EVT-2026-{event_count:04d}"

    docs_json = json.dumps(payload.required_documents or [])

    event = CalendarEvent(
        event_code=event_code,
        title=payload.title,
        event_category=payload.event_category.upper(),
        start_time=st,
        end_time=et,
        venue_or_url=payload.venue_or_url,
        is_virtual=payload.is_virtual,
        organiser_user_id=current_user.id,
        organiser_name=current_user.full_name,
        organiser_role=current_user.role.name if current_user.role else "Official",
        related_project_id=project.id if project else None,
        related_project_name=project.title if project else None,
        related_department_name=payload.related_department_name or "Highways Department",
        agenda=payload.agenda,
        preparation_notes=payload.preparation_notes,
        required_documents_json=docs_json,
        previous_meeting_ref=payload.previous_meeting_ref,
        priority=payload.priority.upper(),
        status="SCHEDULED",
        source_module="calendar",
        data_mode="mock",
        data_status="Seeded Demo"
    )
    db.add(event)
    db.flush()

    # Add organiser as accepted participant
    db.add(CalendarParticipant(
        event_id=event.id,
        user_id=current_user.id,
        official_name=current_user.full_name,
        official_role=current_user.role.name if current_user.role else "Official",
        department_name="Highways Department",
        invitation_status="ACCEPTED",
        attendance_status="PENDING"
    ))

    # Add invited participants
    if payload.participants:
        for p in payload.participants:
            part_user_id = p.get("user_id")
            name = p.get("official_name", "Invited Officer")
            role = p.get("official_role", "Participant")
            dept = p.get("department_name", "Government Department")

            db.add(CalendarParticipant(
                event_id=event.id,
                user_id=part_user_id,
                official_name=name,
                official_role=role,
                department_name=dept,
                invitation_status="INVITED",
                attendance_status="PENDING"
            ))

            # Automatically dispatch notification to invited user if registered
            if part_user_id and part_user_id != current_user.id:
                notif = Notification(
                    user_id=part_user_id,
                    title=f"Meeting Invitation: {event.title}",
                    message=f"You are invited to '{event.title}' on {event.start_time.strftime('%d %b %Y at %H:%M IST')}. Venue: {event.venue_or_url}.",
                    priority=event.priority,
                    category="MEETING",
                    source_module="calendar",
                    source_record_id=event.event_code,
                    project_id=event.related_project_id,
                    project_name=event.related_project_name,
                    department_name=event.related_department_name,
                    responsible_officer_name=current_user.full_name,
                    target_route=f"#/calendar?id={event.id}",
                    due_date=event.start_time,
                    ai_importance_score=78.0,
                    ai_is_priority_briefing=True if event.priority in ("CRITICAL", "HIGH") else False,
                    ai_reasoning=f"Official meeting scheduled by {current_user.full_name}.",
                    ai_required_action="Review agenda, prepare notes, and record attendance.",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(notif)

    db.commit()
    db.refresh(event)
    return format_event(event)


@router.post("/events/{event_id}/rsvp")
def update_event_rsvp(
    event_id: int,
    status_choice: str = Query(..., pattern="^(ACCEPTED|DECLINED|TENTATIVE)$"),
    notes: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates participant RSVP status for a meeting."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    participant = db.query(CalendarParticipant).filter(
        CalendarParticipant.event_id == event_id,
        CalendarParticipant.user_id == current_user.id
    ).first()

    if not participant:
        # User not currently in participant list, add them as RSVP
        participant = CalendarParticipant(
            event_id=event.id,
            user_id=current_user.id,
            official_name=current_user.full_name,
            official_role=current_user.role.name if current_user.role else "Official",
            department_name="Highways Department",
            invitation_status=status_choice,
            attendance_status="PENDING",
            notes=notes
        )
        db.add(participant)
    else:
        participant.invitation_status = status_choice
        if notes:
            participant.notes = notes

    db.commit()
    return {"status": "success", "event_id": event_id, "rsvp": status_choice}


@router.post("/events/{event_id}/minutes", response_model=CalendarEventOut)
def record_meeting_minutes(
    event_id: int,
    payload: MeetingMinutesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Records official Minutes of Meeting, decisions, and creates tracked follow-up action items."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.minutes_of_meeting = payload.minutes_of_meeting
    event.decisions_summary = payload.decisions_summary
    event.status = payload.status or "CONCLUDED"

    if payload.action_items:
        for idx, act in enumerate(payload.action_items, 1):
            act_code = f"ACT-{event.event_code}-{idx:02d}"
            try:
                due_dt = datetime.datetime.fromisoformat(act.get("due_date", "").replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                due_dt = datetime.datetime.utcnow() + datetime.timedelta(days=7)

            action_item = MeetingActionItem(
                event_id=event.id,
                action_code=act_code,
                title=act.get("title", f"Action Item {idx}"),
                description=act.get("description", "Follow-up required from meeting"),
                responsible_user_id=act.get("responsible_user_id"),
                responsible_officer_name=act.get("responsible_officer_name", "Assigned Official"),
                responsible_department_name=act.get("responsible_department_name", "Highways Department"),
                priority=act.get("priority", "HIGH"),
                due_date=due_dt,
                status="IN_PROGRESS",
                escalation_level=act.get("escalation_level", "NONE")
            )
            db.add(action_item)
            db.flush()

            # Create notification for responsible user
            if act.get("responsible_user_id"):
                notif = Notification(
                    user_id=act["responsible_user_id"],
                    title=f"Assigned Action Item: {action_item.title}",
                    message=f"You have been assigned action item '{action_item.title}' following meeting '{event.title}'. Deadline: {action_item.due_date.strftime('%d %b %Y')}.",
                    priority=action_item.priority,
                    category="ADMIN_DECISION",
                    source_module="calendar",
                    source_record_id=action_item.action_code,
                    project_id=event.related_project_id,
                    project_name=event.related_project_name,
                    department_name=action_item.responsible_department_name,
                    responsible_officer_name=action_item.responsible_officer_name,
                    target_route=f"#/calendar?id={event.id}",
                    due_date=action_item.due_date,
                    ai_importance_score=85.0,
                    ai_is_priority_briefing=True,
                    ai_reasoning=f"Directive assigned during {event.title}.",
                    ai_required_action=f"Execute action before {action_item.due_date.strftime('%d %b %Y')} and upload compliance evidence.",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(notif)

    db.commit()
    db.refresh(event)
    return format_event(event)


@router.get("/today-schedule")
def get_today_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns today's agenda and critical items for quick widget consumption."""
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + datetime.timedelta(days=1)

    query = db.query(CalendarEvent).filter(
        CalendarEvent.start_time >= today_start,
        CalendarEvent.start_time < today_end
    ).order_by(CalendarEvent.start_time.asc())

    events = query.all()

    # Overdue action items
    overdue_actions = db.query(MeetingActionItem).filter(
        MeetingActionItem.due_date < datetime.datetime.utcnow(),
        MeetingActionItem.status.in_(["PENDING", "IN_PROGRESS"])
    ).limit(5).all()

    return {
        "today_date": today_start.strftime("%A, %d %B %Y"),
        "total_events_today": len(events),
        "events": [
            {
                "id": e.id,
                "event_code": e.event_code,
                "title": e.title,
                "category": e.event_category,
                "time": f"{e.start_time.strftime('%H:%M')} - {e.end_time.strftime('%H:%M')} IST",
                "venue": e.venue_or_url,
                "is_virtual": e.is_virtual,
                "priority": e.priority,
                "status": e.status,
                "project_name": e.related_project_name
            }
            for e in events
        ],
        "overdue_action_items_count": len(overdue_actions),
        "overdue_action_items": [
            {
                "action_code": a.action_code,
                "title": a.title,
                "responsible_officer": a.responsible_officer_name,
                "due_date": a.due_date.strftime("%d %b %Y")
            }
            for a in overdue_actions
        ]
    }
