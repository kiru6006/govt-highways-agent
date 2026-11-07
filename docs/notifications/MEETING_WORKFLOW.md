# TN-HDOS Meeting Management & Decision Lifecycle

## 1. End-to-End Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Organiser as Convening Authority (Secretary / CE)
    actor Attendee as Invited Officer (EE / Contractor)
    participant System as TN-HDOS Core
    participant Calendar as Calendar Module
    participant Notif as Notification Engine

    Organiser->>System: Schedule Meeting (Title, Date, Project, Agenda, Attendees)
    System->>Calendar: Create CalendarEvent Record
    System->>Notif: Dispatch Meeting Notifications to Attendees
    Attendee->>Calendar: Open Event & Submit RSVP (Accepted / Declined)
    Note over Organiser, Attendee: Meeting Convened (Physical or Cisco Webex)
    Organiser->>System: Record Minutes of Meeting (MoM) & Decisions
    Organiser->>System: Assign Follow-up Action Items with Deadlines
    System->>Notif: Dispatch Action Assignment Notification
    Attendee->>System: Execute Action & Submit Compliance Proof
    System->>Calendar: Update Action Status to COMPLETED
```

---

## 2. Core Functional Requirements

### 2.1 Pre-Meeting Workflow
- **Agenda & Preparation Notes**: Organiser specifies formal agenda items, required document attachments (GAD drawings, soil logs, progress sheets), and previous meeting references.
- **Participant Invitation & RSVP**: Attendees can formally accept, decline, or mark tentative with explanatory notes.
- **Project & Department Linking**: Every meeting is explicitly linked to its parent corridor or scheme.

### 2.2 Post-Meeting Workflow
- **Official MoM Recording**: Formal record of discussions, observations, objections, and consensus.
- **Decisions Summary**: High-level ministerial or secretarial orders resulting from the session.
- **Action Item Tracking**:
  - Each decision can spawn one or more assigned action items (`ACT-EVT-0001-01`).
  - Action items mandate: assigned officer, responsible department, priority tier, and SLA due date.
  - Generates automatic alert in the assignee's Notification Centre and Calendar.
- **Automated SLA Escalation**: If an assigned meeting action item is overdue by $>3$ days, an automated escalation alert is dispatched to the reporting Chief Engineer or Principal Secretary.

