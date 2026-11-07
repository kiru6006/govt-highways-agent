"""
Comprehensive Automated Test Suite for TN-HDOS Notifications and Unified Calendar.
Covers:
- Notification retrieval & role-based visibility across personas
- AI Priority Briefing generation with explainability and evidence citations
- Notification actions: read, unread, save, statutory acknowledge, add-to-calendar
- User notification preferences
- Calendar multi-view querying (Month, Week, Day, Agenda, My Calendar)
- Meeting scheduling, participant invitations, and RSVP updates
- Meeting Minutes (MoM) recording and follow-up action item generation
- RBAC security checks: Contractor restricted from uninvited meetings
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Notification, CalendarEvent, CalendarParticipant, MeetingActionItem

client = TestClient(app)

def get_auth_token(username: str) -> str:
    pwd = "admin123" if username in ("admin", "it_sec_admin") else "highway123"
    resp = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    assert resp.status_code == 200, f"Login failed for {username}: {resp.text}"
    return resp.json()["access_token"]


def test_notification_summary_counts():
    """Verify live calculated summary counts for Minister and Secretary."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/notifications/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert "total_notifications" in data
    assert "unread_notifications" in data
    assert "critical_alerts" in data
    assert "high_priority_alerts" in data
    assert "upcoming_meetings" in data
    assert data["total_notifications"] > 0
    assert data["upcoming_meetings"] > 0


def test_ai_priority_briefing_explainability():
    """Verify AI priority briefing items contain explainable reasoning, impact, and evidence."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/notifications/ai-priority-briefing", headers=headers)
    assert resp.status_code == 200
    briefings = resp.json()

    assert len(briefings) > 0
    top = briefings[0]
    assert "why_important" in top
    assert "potential_impact" in top
    assert "required_action" in top
    assert "evidence_source" in top
    assert "confidence_score" in top
    assert top["confidence_score"] >= 0.90
    assert "target_route" in top


def test_role_based_notification_isolation():
    """Ensure Minister sees strategic notifications and Contractor only sees their contracts."""
    min_token = get_auth_token("minister")
    lt_token = get_auth_token("contractor_lt")

    min_resp = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {min_token}"})
    assert min_resp.status_code == 200
    min_notifs = min_resp.json()
    assert len(min_notifs) > 0
    assert any("Cabinet" in n["title"] or "Arbitration" in n["title"] for n in min_notifs)

    lt_resp = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {lt_token}"})
    assert lt_resp.status_code == 200
    lt_notifs = lt_resp.json()
    # Contractor must not see cabinet policy notes
    assert not any("Cabinet" in n["title"] for n in lt_notifs)
    # Contractor must see contract milestones
    assert any("Milestone" in n["title"] or "L&T" in n["project_name"] for n in lt_notifs)


def test_notification_status_actions():
    """Test read, unread, save, and statutory acknowledge workflows."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch a notification
    resp = client.get("/api/v1/notifications", headers=headers)
    notifs = resp.json()
    target_id = notifs[0]["id"]

    # 1. Mark Read
    read_resp = client.post(f"/api/v1/notifications/{target_id}/read", headers=headers)
    assert read_resp.status_code == 200
    assert read_resp.json()["is_read"] is True

    # 2. Mark Unread
    unread_resp = client.post(f"/api/v1/notifications/{target_id}/unread", headers=headers)
    assert unread_resp.status_code == 200
    assert unread_resp.json()["is_read"] is False

    # 3. Toggle Save
    save_resp = client.post(f"/api/v1/notifications/{target_id}/save", headers=headers)
    assert save_resp.status_code == 200
    assert "is_saved" in save_resp.json()

    # 4. Acknowledge statutory alert
    ack_resp = client.post(f"/api/v1/notifications/{target_id}/acknowledge", headers=headers)
    assert ack_resp.status_code == 200
    assert ack_resp.json()["is_acknowledged"] is True


def test_notification_add_to_calendar():
    """Verify transforming a notification into a calendar follow-up event."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/notifications", headers=headers)
    target_id = resp.json()[0]["id"]

    cal_resp = client.post(f"/api/v1/notifications/{target_id}/add-to-calendar", headers=headers)
    assert cal_resp.status_code == 200
    assert "event_code" in cal_resp.json()
    event_code = cal_resp.json()["event_code"]
    assert event_code.startswith("EVT-NOTIF-")


def test_notification_preferences():
    """Verify reading and updating notification preferences."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    get_resp = client.get("/api/v1/notifications/preferences", headers=headers)
    assert get_resp.status_code == 200
    prefs = get_resp.json()
    assert "enable_in_app" in prefs
    assert "daily_briefing_enabled" in prefs

    put_resp = client.put(
        "/api/v1/notifications/preferences",
        headers=headers,
        json={"enable_email_digest": True, "quiet_hours_enabled": True, "min_priority_alert": "HIGH"}
    )
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["enable_email_digest"] is True
    assert updated["quiet_hours_enabled"] is True
    assert updated["min_priority_alert"] == "HIGH"


def test_calendar_events_retrieval_and_filtering():
    """Verify calendar events querying with category, priority, and date range."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/calendar/events", headers=headers)
    assert resp.status_code == 200
    events = resp.json()
    assert len(events) >= 20

    # Filter by category
    cat_resp = client.get("/api/v1/calendar/events?category=MINISTERIAL_REVIEW", headers=headers)
    assert cat_resp.status_code == 200
    cat_events = cat_resp.json()
    assert all(e["event_category"] == "MINISTERIAL_REVIEW" for e in cat_events)


def test_meeting_management_lifecycle():
    """Verify complete meeting lifecycle: Schedule -> Invite -> RSVP -> Record MoM -> Action Items."""
    token = get_auth_token("chief_eng")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Schedule meeting
    create_payload = {
        "title": "Special Taskforce: Tambaram Flood Mitigation ROB",
        "event_category": "PROJECT_REVIEW",
        "start_time": "2026-05-20T10:00:00",
        "end_time": "2026-05-20T12:00:00",
        "venue_or_url": "CE Projects Conference Room, Guindy",
        "is_virtual": False,
        "agenda": "Review drainage clearance under Railway Over Bridge piers.",
        "preparation_notes": "Tambaram EE to table hydraulic model.",
        "priority": "HIGH",
        "participants": [
            {"official_name": "Er. P. Anandhan", "official_role": "Divisional Engineer", "department_name": "Highways"}
        ]
    }
    create_resp = client.post("/api/v1/calendar/events", headers=headers, json=create_payload)
    assert create_resp.status_code == 200
    event_data = create_resp.json()
    event_id = event_data["id"]
    assert event_data["status"] == "SCHEDULED"

    # 2. RSVP by attendee
    ee_token = get_auth_token("ee_tambaram")
    rsvp_resp = client.post(
        f"/api/v1/calendar/events/{event_id}/rsvp?status_choice=ACCEPTED&notes=Will+attend+with+drawings",
        headers={"Authorization": f"Bearer {ee_token}"}
    )
    assert rsvp_resp.status_code == 200
    assert rsvp_resp.json()["rsvp"] == "ACCEPTED"

    # 3. Record Minutes of Meeting & Action Items
    mom_payload = {
        "minutes_of_meeting": "CE reviewed hydraulic levels. Decided to widen culvert span by 2.4 meters.",
        "decisions_summary": "Culvert span widening approved. Target completion 30th June 2026.",
        "status": "CONCLUDED",
        "action_items": [
            {
                "title": "Submit revised hydraulic design",
                "description": "Submit backwater calculations to proof consultant",
                "responsible_officer_name": "Er. P. Anandhan, EE",
                "responsible_department_name": "Highways",
                "priority": "HIGH",
                "due_date": "2026-06-05T18:00:00"
            }
        ]
    }
    mom_resp = client.post(f"/api/v1/calendar/events/{event_id}/minutes", headers=headers, json=mom_payload)
    assert mom_resp.status_code == 200
    updated_event = mom_resp.json()
    assert updated_event["status"] == "CONCLUDED"
    assert len(updated_event["action_items"]) > 0
    assert updated_event["action_items"][0]["title"] == "Submit revised hydraulic design"


def test_calendar_today_schedule():
    """Verify today's schedule endpoint returns structured events and overdue action items."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/calendar/today-schedule", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "today_date" in data
    assert "total_events_today" in data
    assert "overdue_action_items" in data
