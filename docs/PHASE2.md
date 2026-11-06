# TN-HDOS Phase 2: Executive Command Centre Smartboard & Dedicated Leadership Workspaces

**Tamil Nadu Highways Digital Operating System (TN-HDOS)**  
**Department**: Highways and Minor Ports Department, Government of Tamil Nadu  
**Architecture Specification**: Phase 2 Statewide Highways Intelligence Smartboard & Leadership Workspaces  
**Status**: Fully Implemented, Tested, and Deployed  
**Deployment**: [https://kiru6006.github.io/govt-highways-agent/](https://kiru6006.github.io/govt-highways-agent/)

---

## 1. Executive Summary & Architectural Mandate

In Phase 2, TN-HDOS introduces a consolidated **Executive Command Centre** paired with two dedicated, role-tailored leadership workspaces. Rather than implementing a generic one-size-fits-all dashboard, the system establishes distinct workspaces aligned with the statutory powers, constitutional responsibilities, and operational jurisdictions of senior government leadership:

1. **Minister's Strategic Command Centre** (`/leadership/minister`):  
   Focuses on statewide strategic infrastructure delivery, total capital investment, public impact, major corridor delays, district-level connectivity status, and Cabinet-level inter-ministerial roadblocks.
2. **Principal Secretary / Secretary Command Centre** (`/leadership/secretary`):  
   Focuses on granular departmental governance, zone and circle performance benchmarking, officer accountability, IFMS budget controls and Letter of Credit (LC) balances, HRS Guindy engineering quality audits, contractor default management, legal writs, and statutory AG audit para disposal.
3. **Executive Smartboard Central Cockpit** (`/`):  
   Consolidated department-wide intelligence smartboard housing the 16 core KPIs, statewide project stage portfolio, zone comparison matrix, and 9 deep-dive analytical sections.

Both leadership workspaces reuse the same robust, relational data foundation and underlying REST APIs without duplicating business logic, while rendering differentiated KPI priorities, evidence-linked AI briefings, and decision dispatchers.

---

## 2. Dedicated Leadership Workspaces

### A. Minister's Command Centre (`/leadership/minister`)
* **Primary Audience**: Hon'ble Minister for Public Works and Highways, Chief Minister's Secretariat (CMO), and Cabinet Infrastructure Subcommittees.
* **Access Control**: Strictly restricted to `MINISTER` and `ADMIN` roles. Non-authorized roles (field engineers, contractors, citizens) receive an immediate HTTP 403 Forbidden and an informative security clearance barrier.
* **Core Modules**:
  1. **8 Strategic Headline KPIs**:
     - *Total State Capital Program*: ₹1,845.50 Cr sanctioned outlay
     - *Major Connectivity Corridors*: 6 mega-projects active
     - *Statewide Completion Rate*: 68.4% physical milestone progress
     - *Critical Public Delays*: 3 projects delayed &gt; 60 days
     - *Cabinet & Inter-Ministerial Roadblocks*: 4 pending high-level clearances
     - *Land Acquisition Cleared Area*: 74.2% handed over under Section 15(2)
     - *Zero-Pothole Drive Compliance*: 92.5% monsoon readiness completed
     - *Public Impact Grievances Resolved*: 142 resolved out of 154 logged
  2. **Ministerial AI Strategic Briefing (Evidence-Linked)**:
     - Automated executive synthesis highlighting projects nearing public commissioning (e.g. Tambaram Eastern Bypass Corridor).
     - Urgent Inter-Ministerial Interventions: DFO Forest land clearances and TANGEDCO 110kV HT transmission line shifting with direct "Convene Bilateral Review" dispatch triggers.
     - Public Sentiment & Legislative Assembly Questions (LAQ) readiness badge.
  3. **District-Wise Connectivity & Infrastructure Delivery Matrix**:
     - Comparative analysis across Chennai, Chengalpattu, Coimbatore, Madurai, and Tiruchirappalli tracking active corridors, capital outlay, physical completion %, and public readiness status.
  4. **Ministerial Directive Dispatcher (Statutory Powers)**:
     - Formally empowered actions:
       - `CABINET_NOTE`: Issue Cabinet Memorandum for inter-departmental ROW impasse
       - `INTER_MINISTERIAL_REVIEW`: Convene bilateral review with counterpart Minister
       - `POLICY_DIRECTIVE`: Issue strategic policy directive to department
       - `PUBLIC_COMMISSIONING_DIRECTIVE`: Set hard target for public road opening
       - `DISTRICT_COLLECTOR_MEETING`: Convene special land acquisition review with District Collector
       - `SPECIAL_INSPECTION`: Depute Chief Engineer for surprise spot inspection
     - Every directive creates an immutable audit trail entry in the database.

---

### B. Principal Secretary / Secretary Command Centre (`/leadership/secretary`)
* **Primary Audience**: Principal Secretary to Government, Secretary (Highways), and Chief Engineer (Highways - Projects).
* **Access Control**: Strictly restricted to `PRIN_SEC`, `CHIEF_ENG`, and `ADMIN` roles. Non-authorized users receive HTTP 403 Forbidden.
* **Core Modules**:
  1. **Departmental Governance & Disciplinary Oversight AI Briefing**:
     - Circle variance alerts (e.g., persistent land acquisition award delays in Chengalpattu Circle).
     - **Specific Officer Accountability Alerts**:
       - *Er. M. Rajasekaran, M.E. (SE Chengalpattu)*: 45-day delay in Section 15(2) compensation notification. Recommended: Issue Rule 17(a) explanation notice under TN Civil Services (CCA) Rules.
       - *Er. P. Anandhan, B.E. (EE Tambaram)*: 32-day overdue technical sanction for utility line diversion estimates. Recommended: Direct mandatory 7-day disposal order.
     - Financial Controls: IFMS Letter of Credit (LC) balances and pre-audit validation summaries.
  2. **16 Comprehensive Department Performance KPIs**:
     - Complete operational metrics with modal drill-downs into verified underlying records.
     - *Strict Financial Isolation*: Actual expenditure (₹824.20 Cr), potential exposure (₹42.80 Cr), verified recovery (₹8.45 Cr), and prevented expenditure (₹14.20 Cr) are strictly maintained in separate accounting buckets and never conflated into a single savings number.
  3. **Zone & Circle Benchmarking Cohorts**:
     - Standardized comparison across Chennai, Coimbatore, Madurai, and Tiruchirappalli zones.
     - Formal disclosure of sample size (`N=18`, `N=14`, `N=12`) and data completeness (`96%`, `94%`, `97%`).
  4. **Secretarial Directive & Disciplinary Console (Statutory Powers)**:
     - Formally empowered actions:
       - `DISCIPLINARY_INQUIRY`: Order Rule 17(a)/17(b) inquiry under CCA Rules
       - `WITHHOLD_LC`: Freeze Letter of Credit (LC) release to non-performing package
       - `ISSUE_LD_NOTICE`: Issue formal Liquidated Damages (LD) recovery notice to contractor
       - `ORDER_HRS_TECHNICAL_AUDIT`: Order independent core testing by Director, HRS Guindy
       - `VIGILANCE_REFERENCE`: Refer suspicious measurement book variances to DVAC / Vigilance Cell
       - `MANDATE_AG_ATR`: Enforce 15-day deadline for Action Taken Report to Accountant General
     - Immutable audit logging for all actions.

---

## 3. Executive Smartboard Cockpit (Central Dashboard)

Located at `/`, the Executive Smartboard provides statewide intelligence across 9 specialized deep-dive tabs:
1. **Critical Issues Requiring Leadership Intervention**: Unresolved bottlenecks with root-cause tracing, accountable officers, external departments, and contractor exposure.
2. **Interdepartmental Coordination Intelligence**: Tracking dependencies blocked by TANGEDCO, Forest, Revenue/LA, TWAD, and Southern Railways with correspondence logs.
3. **Financial & Leakage Intelligence**: Duplicate bills, bitumen consumption discrepancies, rate deviations, and unadjusted advances with confidence levels and validation statuses.
4. **Engineering & Asset Quality**: Highways Research Station (HRS) test failures, concrete core crush tests, bridge cracks, roughness indices, and NCR tracking.
5. **Zone & Division Performance**: Standardized cohort benchmarking across Chennai, Coimbatore, Madurai, and Tiruchirappalli zones.
6. **Statewide Project Portfolio**: Stage distribution (Planning, Tendering, Execution, Delayed, Requiring Intervention) and risk-tier breakdowns.
7. **Contractor Performance Summary**: Cohort-based delivery scoring, LD exposure, Mobilisation Bank Guarantee expiry alerts, and pending obligations.
8. **Legal & Compliance Register**: High Court writ petitions, Section 15(2) land disputes, arbitration notices, and AG audit paras.
9. **Decisions & Actions Required**: Registered directives and decisions with status tracking and audit history.

---

## 4. Role-Based Access Control (RBAC) Security Architecture

Access control is strictly validated server-side and client-side based on the authenticated user's role and jurisdiction:

| User Account | Role Code | Designation | `/leadership/minister` | `/leadership/secretary` | `/` & `/executive/kpis` | `/leakage` & `/legal` |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **`minister`** | `MINISTER` | Hon'ble Minister for Highways | ✅ Authorized | ✅ Authorized | ✅ Statewide | ✅ Authorized |
| **`secretary`** | `PRIN_SEC` | Principal Secretary to Government | ❌ Blocked (403) | ✅ Authorized | ✅ Statewide | ✅ Authorized |
| **`admin`** | `ADMIN` | System Administrator | ✅ Authorized | ✅ Authorized | ✅ Statewide | ✅ Authorized |
| **`chief_eng`**| `CHIEF_ENG`| Chief Engineer (Projects) | ❌ Blocked (403) | ✅ Authorized | ✅ Statewide | ✅ Authorized |
| **`se_chengalpattu`**| `SE_CIRCLE`| Superintending Engineer | ❌ Blocked (403) | ❌ Blocked (403) | 🟡 Circle Scoped | ❌ Blocked (403) |
| **`ee_tambaram`**| `EE_DIV` | Divisional Engineer | ❌ Blocked (403) | ❌ Blocked (403) | 🟡 Division Scoped | ❌ Blocked (403) |
| **`contractor_lt`**| `CONTRACTOR`| L&T Representative | ❌ Blocked (403) | ❌ Blocked (403) | 🔴 Contract Isolated | ❌ Blocked (403) |

> **Security Rule**: Access is never inferred from client URL parameters or frontend state. If an unauthorized role attempts to call leadership or confidential endpoints, the server returns **HTTP 403 Forbidden** with a clear statutory restriction notice.

---

## 5. API Reference (`/api/v1/executive`)

- `GET /api/v1/executive/minister/overview` — Strategic KPIs, AI briefing, district matrix, and pending cabinet actions. Requires `MINISTER` or `ADMIN`.
- `GET /api/v1/executive/secretary/overview` — Governance KPIs, accountability alerts, zone benchmarking, and pending secretarial actions. Requires `PRIN_SEC`, `CHIEF_ENG`, or `ADMIN`.
- `GET /api/v1/executive/kpis` — Returns the 16 department performance KPIs scoped by role jurisdiction and global filters.
- `GET /api/v1/executive/portfolio` — Stage and risk breakdown across the project portfolio.
- `GET /api/v1/executive/zones` — Zone benchmarking cohorts with sample size and data completeness metrics.
- `GET /api/v1/executive/critical-issues` — High-priority escalations requiring executive intervention.
- `GET /api/v1/executive/interdepartmental` — Interdepartmental friction intelligence (TANGEDCO, Forest, Revenue, TWAD, Railways).
- `GET /api/v1/executive/leakage` — Confidential financial leakage findings, bitumen reconciliation variances, and investigation indicators. Restricted from contractors.
- `GET /api/v1/executive/quality` — HRS Guindy quality test observations and NCR records.
- `GET /api/v1/executive/contractors` — Contractor delivery ratings, delays, and bank guarantee expiries.
- `GET /api/v1/executive/legal` — Confidential High Court writ petitions, land acquisition disputes, and AG audit paras. Restricted from contractors.
- `GET /api/v1/executive/decisions` — Registered leadership directives and actions.
- `POST /api/v1/executive/decisions` — Records a new leadership decision with validation of statutory authority and immutable audit logging.

---

## 6. Automated Test Suite Verification

Comprehensive integration test coverage in [`backend/tests/test_executive_phase2.py`](../backend/tests/test_executive_phase2.py) and [`backend/tests/test_auth_and_rbac.py`](../backend/tests/test_auth_and_rbac.py):
- **17 / 17 Tests Passing**:
  1. `test_executive_16_kpis_statewide`: Verifies all 16 KPIs and distinct financial accounting buckets.
  2. `test_executive_kpis_contractor_scoping`: Verifies contractor isolation to awarded projects only.
  3. `test_executive_zones_benchmarking`: Verifies 4 zone cohorts, delay days, and budget utilization.
  4. `test_critical_leadership_issues`: Verifies root-cause analysis and action triggers.
  5. `test_interdepartmental_blockers`: Verifies external agency dependencies.
  6. `test_financial_leakage_and_evidence`: Verifies bitumen variance and validation status types.
  7. `test_leadership_decision_creation_and_audit`: Verifies decision registration and immutable audit logs.
  8. `test_minister_workspace_access_and_security`: Verifies Minister gets 200, contractors and EE get 403.
  9. `test_secretary_workspace_access_and_security`: Verifies Secretary gets 200, contractors and EE get 403.
  10. `test_confidential_leakage_and_legal_protection`: Verifies vigilance and legal records return 403 to contractors.
  11. `test_statutory_authority_enforcement_on_decisions`: Verifies non-minister cannot issue `CABINET_NOTE`, non-secretary cannot issue `DISCIPLINARY_INQUIRY`, and empowered roles succeed.
  12-17. Complete Phase 1 authentication and RBAC regression tests.
