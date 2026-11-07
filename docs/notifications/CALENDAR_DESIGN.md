# TN-HDOS Unified Calendar & Meeting Management Architecture

## 1. Objective & Vision
The Unified Calendar module (`#/calendar`) serves as the central operational scheduler for the Highways Department, synchronizing high-level Ministerial reviews, interdepartmental clearance committees, court hearings, statutory land acquisition enquiries, quality core-cutting inspections, and contractor milestone deadlines.

---

## 2. Multi-View Architecture

```
                    ┌─────────────────────────┐
                    │  Unified Calendar Hub   │
                    └────────────┬────────────┘
                                 │
     ┌──────────────┬────────────┼────────────┬──────────────┐
     ▼              ▼            ▼            ▼              ▼
┌─────────┐   ┌─────────┐  ┌──────────┐ ┌──────────┐  ┌─────────────┐
│  Month  │   │  Week   │  │   Day    │ │  Agenda  │  │ My Schedule │
│  Grid   │   │ Columns │  │ Timeline │ │ (Filter) │  │  (Invited)  │
└─────────┘   └─────────┘  └──────────┘ └──────────┘  └─────────────┘
```

1. **Month View**: 7-column calendar matrix displaying event density per day, color-coded categories, and priority badges.
2. **Week View**: Horizontal 7-day columns highlighting timed event slots.
3. **Day View**: Hourly vertical scheduling grid with event conflict detection.
4. **Agenda View**: Chronological list of events with agenda previews, attendee counts, and tracked action items.
5. **My Schedule View**: Quick toggle isolating events where the logged-in persona is the organiser or an invited attendee.

---

## 3. Event Categories & Priority Coloring

| Category Code | Display Name | Priority Accent | Typical Lead / Organiser |
| :--- | :--- | :--- | :--- |
| `MINISTERIAL_REVIEW` | Ministerial Review | Purple `#8B5CF6` | Minister / Private Secretary |
| `SECRETARY_COORDINATION` | Secretary Coordination | Blue `#3B82F6` | Principal Secretary |
| `CHIEF_ENGINEER_MEETING`| Chief Engineer Meeting | Indigo `#6366F1` | Chief Engineer (Projects / C&M) |
| `PROJECT_REVIEW` | Project Review | Sky `#0EA5E9` | Project Director / SE |
| `SITE_INSPECTION` | Site Inspection | Amber `#F59E0B` | Divisional Engineer |
| `FIELD_VISIT` | Field Visit | Orange `#F97316` | Assistant Engineer |
| `CONTRACTOR_MEETING` | Contractor Meeting | Slate `#64748B` | Project Director / EE |
| `LAND_ACQUISITION_DEADLINE`| Land Acquisition | Emerald `#10B981`| Special DRO (LA) |
| `UTILITY_COORDINATION` | Utility Coordination | Cyan `#06B6D4` | Utility Nodal Officer |
| `COURT_HEARING` | Court Hearing | Red `#EF4444` | Special Government Pleader |
| `QUALITY_INSPECTION` | Quality Inspection | Emerald `#059669`| QA Engineer (HRS Guindy) |
| `GRIEVANCE_REVIEW` | Grievance Review | Rose `#F43F5E` | Citizen Grievance Officer |
| `OFFICE_ACTION_DEADLINE`| Action Deadline | Violet `#7C3AED` | Section Officer / Admin |
