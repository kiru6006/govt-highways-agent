# TN-HDOS: Chief Minister Highways Dashboard, Official Directory Rectification & Universal Connectivity Engine

## 1. Executive Summary & Objective

In accordance with statutory governance mandates of the **Highways and Minor Ports Department, Government of Tamil Nadu**, this release enhances the Tamil Nadu Highways Digital Operating System (TN-HDOS) with:

1. **Chief Minister Highways Command Smartboard (`#/cm-dashboard`)**: Dedicated apex executive dashboard for the Hon'ble Chief Minister to monitor statewide Highways operations, critical delays, court stays, and issue binding directives.
2. **Official Directory Rectification**: Verified apex leadership structure with Hon'ble Chief Minister Thiru C. Joseph Vijay, Highways Minister Thiru Aadhav Arjuna, and historical officeholder archive (Thiru E.V. Velu, 2021–2026).
3. **Universal Connectivity Engine**: Connected entity graph and relationship engine enforcing *"Everything relevant is connected to everything relevant, subject to role-based access"*.
4. **Critical-Path Delay & Accountability Intelligence**: Algorithmic delay calculation distinguishing critical-path delays from parallel non-critical concurrent events to prevent double counting.
5. **Grounded CM AI Executive Assistant**: Grounded daily briefing with exact citations, uncertainty disclosures, and recommended interventions requiring mandatory human confirmation.

---

## 2. Verified Apex Leadership Directory

| Designation / Portfolio | Officeholder | Provenance / Authority | System Access Tier |
|---|---|---|---|
| **Hon'ble Chief Minister of Tamil Nadu** | **Thiru C. Joseph Vijay** | State Apex Executive • State Highways Monitoring | `CABINET_APEX` (`CHIEF_MINISTER`) |
| **Hon'ble Minister for Public Works & Highways** | **Thiru Aadhav Arjuna** | Council of Ministers • Highways & Minor Ports | `LEADERSHIP` (`MINISTER`) |
| **Principal Secretary to Government** | **Thiru Shunchonngam Jatak Chiru, IAS** | Secretariat Executive Head • HK1 Department | `LEADERSHIP` (`PRIN_SEC`) |
| **Historical Officeholder Archive** | **Thiru E.V. Velu** | Ex-Minister for Public Works & Highways (2021–2026) | Verified Historical Record |

---

## 3. The 17 Executive Mandated Operational KPIs

The CM Dashboard computes and visualizes 17 real-time operational indicators directly from relational state operations:

1. **Total Highways Projects**: Total state highway projects partitioned by health (Ongoing, Completed, Delayed, Stalled).
2. **Approved Budget (₹ Cr)**: Sanctioned Administrative Sanction (AS) vs Technical Sanction (TS) value.
3. **Cumulative Expenditure (₹ Cr)**: Actual audited state treasury disbursements to date.
4. **Statewide Physical Progress (%)**: Weighted physical completion percentage across all packages.
5. **Statewide Financial Progress (%)**: Treasury disbursement vs approved sanction percentage.
6. **Delayed Projects Count**: Partitioned by delay brackets (30–59, 60–89, 90–179, 180+ days) without double counting.
7. **Critical Risk Projects Count**: Projects with negative EVM variance (SV < -15% or SPI < 0.85).
8. **Pending Land Acquisition**: Parcels awaiting Section 19(1) or possession awards + Total Extent in Hectares.
9. **Pending Utility Shifting**: Outstanding utility relocation tasks across TANGEDCO, TWAD Board, and BSNL.
10. **Interdepartmental Blockers**: Cross-agency dependencies with days pending and turnaround benchmarks.
11. **Active Court Stays**: Madras High Court and Sub-Court interim injunctions halting critical-path works.
12. **Critical Quality NCRs**: Non-Conformance Reports issued by Highways Research Station (HRS Guindy).
13. **High-Risk Contractors**: Contractors with repeated milestone defaults or pending cure notices.
14. **Active CM Directions**: Binding directives issued by CMO currently in progress.
15. **Resolved CM Directions**: Directives successfully complied with by line departments.
16. **Overdue CM Directions**: Directives exceeding CMO compliance deadlines flagged for escalation.
17. **Apex Leadership Oversight**: Cabinet-level approvals pending and CMO escalation queue items.

---

## 4. Universal Connectivity Engine & Entity Web

### 4.1 Architecture
The Universal Connectivity Engine implements typed, bidirectional, versioned relationships across all 26 departmental entity types:

* **Entity Types**: `PROJECT`, `WORK_PACKAGE`, `CONTRACTOR`, `DEPARTMENT`, `ROAD`, `BRIDGE`, `LAND_PARCEL`, `LEGAL_CASE`, `UTILITY`, `CM_DIRECTION`, `GOVERNMENT_FILE`, `CORRESPONDENCE`, `OFFICER`, `DECISION`, `QUALITY_DEFECT`, `INSPECTION`, `ASSET`, `GRIEVANCE`, etc.
* **Relationship Types**: `DEPENDS_ON`, `BLOCKED_BY`, `AFFECTED_BY_LITIGATION`, `EXECUTED_BY`, `GOVERNED_BY`, `COORDINATES_WITH`, `MONITORED_BY`, `SUBORDINATE_TO`, `SUPERSEDES`.
* **Access Tiers**: `PUBLIC`, `INTERNAL`, `RESTRICTED`, `CONFIDENTIAL`, `CABINET_ONLY`.
* **Provenance**: `VERIFIED_OFFICIAL`, `UNVERIFIED_OFFICIAL`, `SIMULATED`, `HUMAN_CONFIRMED`, `AI_INFERRED`.

### 4.2 Interactive Graph & Connected Records Panel
Accessible via:
- Dedicated Chief Minister Universal Graph Explorer (`#/cm-dashboard`)
- Global Universal Search Bar in Top Header (`⌘K`)
- Project 360° Tab 16 (`#/project-360?tab=connectivity`)
- Modal drawers across all operational workspaces

### 4.3 Human Confirmation Invariant
AI-inferred connections and recommendations require an explicit button click and verification by an authorized officer (`confirm_ai_suggested_relationship`) before becoming authoritative records.

---

## 5. Critical-Path Delay Logic (No Double Counting)

### Core Invariant
When a project experiences concurrent delay events on both critical and non-critical paths, **the total calendar delay is strictly bounded by the critical-path chain**. Parallel non-critical events are recorded for accountability but are NOT summed into total calendar delay days.

*Example*:
- **Salem West Bypass (SH-86)**:
  - *High Court Interim Stay (Survey No. 142/3)*: **185 Days (Critical Path Driver)**
  - *Contractor Plant Mobilization Delay*: **45 Days (Parallel Non-Critical)**
  - *Total Project Calendar Delay*: **185 Days** (NOT 230 days).

---

## 6. Backend API Catalog (`/api/v1/cm` & `/api/v1/connectivity`)

| Endpoint | Method | Role Clearance | Description |
|---|---|---|---|
| `/api/v1/cm/overview` | `GET` | CM, Minister, Secretary | Returns 17 Executive KPIs and operational breakdowns. |
| `/api/v1/cm/delays/analysis/{id}` | `GET` | CM, Minister, Secretary, CE | Critical-path vs non-critical delay analysis with causing parties. |
| `/api/v1/cm/escalations` | `GET` | CM, Minister, Secretary | High-priority escalation queue items requiring apex decisions. |
| `/api/v1/cm/ai-daily-brief` | `GET` | CM, Minister, Secretary | Grounded AI daily intelligence summary with citations. |
| `/api/v1/cm/directions` | `GET` | All Highways Personnel | List of CM directives with status and priority filtering. |
| `/api/v1/cm/directions` | `POST` | CM, Minister, Secretary | Issues a binding Chief Minister directive with CMO tracking. |
| `/api/v1/cm/directions/{id}` | `PUT` | CM, Minister, Secretary | Updates compliance status, notes, or verification of a directive. |
| `/api/v1/cm/jurisdiction-comparison` | `GET` | CM, Minister, Secretary | Comparative zonal and circle scorecard across Tamil Nadu. |
| `/api/v1/connectivity/entities/{type}/{id}/relationships` | `GET` | Role-based Tier | Returns typed connected records for an entity. |
| `/api/v1/connectivity/graph` | `GET` | Role-based Tier | Traverses node-link graph payload up to 2 hops. |
| `/api/v1/connectivity/search` | `GET` | Role-based Tier | Cross-entity universal search with match counts and routes. |
| `/api/v1/connectivity/relationships` | `POST` | Divisional Eng+ | Establishes new authoritative typed relationship. |
| `/api/v1/connectivity/relationships/{id}/supersede` | `POST/PUT` | Divisional Eng+ | Supersedes existing relationship with audit trail. |
| `/api/v1/connectivity/suggested-relationships` | `GET` | Divisional Eng+ | AI-assisted relationship candidate discovery. |
| `/api/v1/connectivity/confirm-suggestion` | `POST` | Divisional Eng+ | Confirms candidate link into verified official record. |

---

## 7. Automated Test Suite Verification

- `backend/tests/test_cm_dashboard_and_connectivity.py`: **8 / 8 tests passed** (100%).
- `backend/tests/test_executive_phase2.py`: **16 / 16 tests passed** (100%).
- Full regression test suite: **148 / 148 tests passed** (100%).
- Frontend production build (`tsc && vite build`): **0 compilation errors**, built in 8.12s.
