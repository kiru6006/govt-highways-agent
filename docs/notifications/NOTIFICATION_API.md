# TN-HDOS Notifications & Calendar REST API Specification

## 1. Notifications Endpoints (`/api/v1/notifications`)

### `GET /api/v1/notifications`
Returns paginated, role-filtered notifications for the authenticated user.
- **Query Parameters**:
  - `category` (optional string): Filter by category enum.
  - `priority` (optional string): Filter by `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`.
  - `is_read` (optional boolean): Filter read status.
  - `is_saved` (optional boolean): Filter saved items.
  - `project_id` (optional integer): Filter by project ID.
  - `search` (optional string): Text search against title, message, project, or department.
  - `limit` (integer, default 50): Page limit.
  - `offset` (integer, default 0): Page offset.

### `GET /api/v1/notifications/summary`
Returns live operational counters for dashboard and header badges:
- `total_notifications`: Total accessible records.
- `unread_notifications`: Unread count.
- `critical_alerts`: Active critical items.
- `high_priority_alerts`: High priority count.
- `pending_actions`: Unacknowledged notifications with approaching deadlines.
- `upcoming_meetings`: Meetings scheduled within the next 7 days.
- `overdue_tasks`: Overdue action items.
- `recently_updated_projects`: Count of distinct active projects with new updates.

### `GET /api/v1/notifications/ai-priority-briefing`
Returns top AI-ranked intelligence items containing:
- `why_important`: Root operational reason.
- `potential_impact`: Financial or schedule risk quantification.
- `required_action`: Next statutory action step.
- `evidence_source`: Exact document reference.
- `confidence_score`: Verification percentage.
- `target_route`: Exact deep link path.

### `POST /api/v1/notifications/{id}/read` & `POST /api/v1/notifications/{id}/unread`
Toggles read status and appends entry to `notification_audit_events`.

### `POST /api/v1/notifications/{id}/acknowledge`
Formal statutory sign-off on mandatory notifications with digital audit log.

### `POST /api/v1/notifications/{id}/add-to-calendar`
Transforms deadline or inspection alert into a synchronized calendar event (`EVT-NOTIF-0001`).

### `GET /api/v1/notifications/preferences` & `PUT /api/v1/notifications/preferences`
Retrieves or updates user alert preferences (quiet hours, email digest, in-app alerts).

---

## 2. Calendar Endpoints (`/api/v1/calendar`)

### `GET /api/v1/calendar/events`
Returns calendar events with view filtering:
- `category`, `priority`, `project_id`, `department`, `my_calendar`, `start_date`, `end_date`, `search`.

### `POST /api/v1/calendar/events`
Schedules a new meeting and automatically dispatches notifications to invited attendees.

### `GET /api/v1/calendar/events/{id}`
Returns full meeting dossier including agenda, documents, participants, MoM, and action items.

### `POST /api/v1/calendar/events/{id}/rsvp`
Submits attendee RSVP (`ACCEPTED`, `DECLINED`, `TENTATIVE`) with optional notes.

### `POST /api/v1/calendar/events/{id}/minutes`
Records official Minutes of Meeting, decisions summary, and creates tracked follow-up action items.

### `GET /api/v1/calendar/today-schedule`
Returns today's active schedule and overdue action items for quick widget rendering.
