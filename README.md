# TN-HDOS: Tamil Nadu Highways Digital Operating System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-006A4E?style=for-the-badge&logo=github)](https://kiru6006.github.io/govt-highways-agent/)
[![Phase](https://img.shields.io/badge/Phase-2%20Dedicated%20Leadership%20Workspaces-006A4E)](docs/PHASE2.md)
[![Theme](https://img.shields.io/badge/Highways%20Theme-docs%2FDESIGN.md%20Compliant-FFCC00)](docs/DESIGN.md)
[![Tests](https://img.shields.io/badge/Pytest-18%20Passed-004B87)](backend/tests/)
[![Docs](https://img.shields.io/badge/Documentation-docs%2F%20Folder-D1197E)](docs/)
[![License](https://img.shields.io/badge/License-Govt%20of%20Tamil%20Nadu-D1197E)]()

> 🌐 **Live Interactive Deployment**: [https://kiru6006.github.io/govt-highways-agent/](https://kiru6006.github.io/govt-highways-agent/)

**TN-HDOS (Tamil Nadu Highways Digital Operating System)** is the official departmental enterprise digital operating platform built for the **Highways and Minor Ports Department, Government of Tamil Nadu**.

It establishes an integrated foundation connecting projects, roads, bridges, engineers, contractors, consultants, external government departments (Revenue, TANGEDCO, TWAD, Forest, Southern Railway), finances, and statutory audit compliance.

---

## 📚 Departmental Documentation Index (`docs/`)

All system architecture, design specifications, and decision records are maintained in [`docs/`](docs/):
* [**`docs/ORGANISATION_AND_RBAC_VERIFICATION.md`**](docs/ORGANISATION_AND_RBAC_VERIFICATION.md) — Authoritative verification report of departmental leadership, service cadre rules (TN-HES), statutory committees, entrusted National Highways, and TNRSP-II EPC contracts.
* [**`docs/PHASE2.md`**](docs/PHASE2.md) — Comprehensive Phase 2 specification covering dedicated Minister (`/leadership/minister`) and Secretary (`/leadership/secretary`) workspaces, 16 KPIs, RBAC security, and 18 automated tests.
* [**`docs/DESIGN.md`**](docs/DESIGN.md) — Official Tamil Nadu Highways color specification (`SH`, `NH`, `MDR`, `ODR`, `Rural`) and component design tokens.
* [**`docs/ARCHITECT.md`**](docs/ARCHITECT.md) — Enterprise architecture blueprints, component hierarchies, and state boundaries.
* [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) — System topology, FastAPI backend, Vite/React client, SQLite data layers.
* [**`docs/ADR.md`**](docs/ADR.md) — Architecture Decision Records (HashRouter for GitHub Pages, standalone financial buckets, RBAC isolation).
* [**`docs/PHASE_0_ASSESSMENT.md`**](docs/PHASE_0_ASSESSMENT.md) — Pre-implementation audit and backward compatibility assessment.

---

## 🎨 Highways Department Theme Palette (docs/DESIGN.md)

All user interface elements, badges, charts, and indicators strictly adhere to the official **Tamil Nadu Highways Department Color Specification**:

| Road Classification | Hex Code | Tailwind Token | RGB Mapping Value | UI Role & Departmental Context |
| :--- | :--- | :--- | :--- | :--- |
| **State Highways (SH)** | `#006A4E` | `tnh-sh` | `rgb(0, 106, 78)` | **Primary Brand / Main Actions** (e.g. SH-49 East Coast Road) |
| **National Highways (NH)** | `#FFCC00` | `tnh-nh` | `rgb(255, 204, 0)` | **Central Government Assets** (e.g. NH-45 GST Road) |
| **Major District Roads (MDR)** | `#004B87` | `tnh-mdr` | `rgb(0, 75, 135)` | **Regional Connectivity Data** (e.g. MDR-102 Tambaram - Sriperumbudur) |
| **Other District Roads (ODR)** | `#D1197E` | `tnh-odr` | `rgb(209, 25, 126)` | **Local Hub Linkages** (e.g. ODR-045 Thiruporur Link Road) |
| **Rural & Village Roads** | `#FF6600` | `tnh-rural` | `rgb(255, 102, 0)` | **Panchayats / Low-tier Data** (e.g. RUR-012 Vandalur Arterial) |

### Component Utility Tints (Backgrounds & Badges)
* **State Highway (SH)**: Background `#E6F4EA` | Text `#006A4E` | Border `#B2DFCD`
* **National Highway (NH)**: Background `#FFF9E6` | Text `#996600` | Border `#FFE680`
* **Major District Roads (MDR)**: Background `#E6F0F7` | Text `#004B87` | Border `#B3CFE5`
* **Other District Roads (ODR)**: Background `#FCE8F3` | Text `#D1197E` | Border `#F2B3D6`
* **Rural Roads**: Background `#FFF3EB` | Text `#FF6600` | Border `#FFCCB3`

---

## 🏛️ Platform Architecture & Features Implemented

### 1. Dedicated Leadership Workspaces (Phase 2 Upgrade)
Rather than implementing a single generic cockpit for all senior executives, TN-HDOS implements two dedicated workspaces tailored to ministerial and secretarial statutory mandates:

#### A. Minister's Strategic Command Centre (`/leadership/minister`)
* **Target Audience**: Hon'ble Minister for Highways & Cabinet Infrastructure Committee.
* **Access Control**: Strictly restricted to `MINISTER` and `ADMIN` roles via server and client RBAC.
* **Key Capabilities**:
  - **8 Strategic Headline KPIs**: Capital Outlay (₹1,845.50 Cr), Major Corridors Active (6), Statewide Completion (68.4%), Critical Delays &gt;60d (3), Cabinet Blockers (4), Land Cleared (74.2%), Zero-Pothole Drive (92.5%), Public Grievances Resolved (142).
  - **Ministerial AI Strategic Briefing**: Evidence-linked narrative highlighting projects nearing public commissioning and urgent inter-ministerial bilateral actions (DFO Forest clearance, TANGEDCO 110kV line shifting).
  - **District-Wise Delivery Matrix**: Strategic comparison across Chennai, Chengalpattu, Coimbatore, Madurai, and Tiruchirappalli.
  - **Ministerial Directive Dispatcher**: Authorized ministerial actions (`CABINET_NOTE`, `INTER_MINISTERIAL_REVIEW`, `POLICY_DIRECTIVE`, `PUBLIC_COMMISSIONING_DIRECTIVE`, `DISTRICT_COLLECTOR_MEETING`, `SPECIAL_INSPECTION`) with immutable audit trails.

#### B. Principal Secretary's Command Centre (`/leadership/secretary`)
* **Target Audience**: Principal Secretary to Government, Secretary (Highways), Chief Engineer (Projects).
* **Access Control**: Strictly restricted to `PRIN_SEC`, `CHIEF_ENG`, and `ADMIN` roles.
* **Key Capabilities**:
  - **Departmental Governance AI Briefing**: Circle variance alerts, financial pre-audit controls, and **Specific Officer Accountability Alerts** (SE Chengalpattu for 45-day LA delay; DE (H) Tambaram for 32-day utility delay).
  - **16 Core Department Performance KPIs**: Full operational metrics with modal drill-downs into verified records.
  - **Zone Benchmarking Cohorts**: Comparative analysis across Chennai, Coimbatore, Madurai, Tiruchirappalli with sample size and completeness metadata.
  - **Secretarial Directive Console**: Authorized administrative actions (`DISCIPLINARY_INQUIRY`, `WITHHOLD_LC`, `ISSUE_LD_NOTICE`, `ORDER_HRS_TECHNICAL_AUDIT`, `VIGILANCE_REFERENCE`, `MANDATE_AG_ATR`).

#### C. Executive Smartboard Central Cockpit (`/`)
* **Statewide Project Portfolio & Stage Distribution** (Planning, Tendering, Execution, Delayed, Requiring Intervention).
* **9 Deep-Dive Intelligence Panels**: Critical Issues, Interdepartmental Friction, Financial Leakage, Quality Non-Conformances, Zone Benchmarking, Contractor Performance, Legal/AG Paras, and Decisions Tracker.

### 2. Authoritative Department Leadership, Service Cadres & Statutory Governance

In compliance with official Government of Tamil Nadu directories and statutory service cadre rules:

#### A. Executive & Administrative Leadership
* **Hon'ble Minister**: **Thiru Aadhav Arjuna**, Minister for Public Works and Sports Development (Public Works - Buildings, Highways and Minor Ports, Sports Development).
* **Principal Secretary to Government**: **Thiru Shunchonngam Jatak Chiru, IAS**, Highways and Minor Ports Department (`044-25670959`, `hwaysec@tn.gov.in`, Secretariat, Fort St. George, Chennai - 600 009).
* **Director General (Highways)**: **Er. R. Selvadurai**, Highways Department, Guindy, Chennai (`044-22351099`, `dgchn.hd@tn.gov.in`).
* **Project Director (TNRSP & CKICP)**: **Thiru D. Baskara Pandian, IAS**, Project Director (A/C TNRSP, FAC CKICP).
* **Chief Engineers (C&M, NH, PDI, HRS, TANSHA)**:
  - CE (C&M Chennai Region): **Er. S. Palanivel**
  - CE (C&M Trichy Region): **Er. S. Jawahar Muthuraj**
  - CE (C&M Madurai Region): **Er. Ramesh**
  - CE (C&M Coimbatore Region): **Er. S. Palanivel (A/C)**
  - CE (National Highways): **Er. K. Vanathi**
  - CE (Planning Designs & Investigation): **Er. S. Yamini** (also holds TNRSP-II A/C)
  - Director (Highways Research Station - HRS): **Er. A. Venkatachalam**
  - CE (CKICP): **Er. R. Vimala (A/C)**
  - Member Technical (TANSHA): **Er. D. Jebaselwin Gladson**

#### B. Service Cadre Rules (TN-HES)
* Governed by **Tamil Nadu Highways Engineering Service (TN-HES) Rules** (G.O.Ms.No.172 dated 03.11.2025; G.O.Ms.No.43).
* Cadre designations strictly employ **Divisional Engineer (H)** (`DE`), never central generic titles. Field hierarchy: Chief Engineer (H) &rarr; Superintending Engineer (H) &rarr; **Divisional Engineer (H)** &rarr; Assistant Divisional Engineer (H) &rarr; Assistant Engineer (H) / Junior Engineer (H).
* Financial power delegations for Technical Sanction (TS) and Tender Acceptance (TA) strictly follow **G.O. Ms. No. 75** and **G.O. Ms. No. 163**.

#### C. Statutory Committees & Undertakings
* **8 Statutory Committees**: Board of Engineers (BOE), Technical Audit Committee (TAC), Revised Administrative Sanction Committee (RASC & RASC_LA), Commissionerate of Tenders (COT), Standard Schedule of Rates (SSR) Committee, High Level Dispute Resolution Committee (HLDRC), and Three Member Expert Committee under TNTIT Act 16(b).
* **Entrusted National Highways**: 11 corridors totaling 797.562 km (NH 181, 648, 179A, 336, 42, 75, 38, 381, 381A, 381B, 532).
* **Core Road Network TNRSP-II EPC Packages**: EPC01 through EPC10 (427.967 km, ₹1,704.91 Cr) with 7-year maintenance liability.
* **Autonomous Undertakings**: Tamil Nadu Maritime Board (TNMB), Poompuhar Shipping Corporation, TNRDC, and TNRIDC.

### 3. Global Application Header & Role Persona Switcher
* Official Tamil Nadu Government branding and dynamic module title.
* Global search bar querying project codes, road names, and contractors.
* **Live RBAC Role Switcher**: Click on the user profile to seamlessly evaluate the platform under different roles with server-side jurisdiction enforcement.

### 3. Full 17-Module Persistent Sidebar
1. **1a. Minister's Command Centre** (`/leadership/minister`) - Strategic Cabinet intelligence.
2. **1b. Secretary's Command Centre** (`/leadership/secretary`) - Departmental governance & operational oversight.
3. **1c. Executive Smartboard** (`/`) - Central KPI cockpit with portfolio statistics and 9 deep-dive sections.
4. **2. Leakage Intelligence** (`/leakage`) - Refinery bitumen reconciliation and anti-corruption signals.
5. **3. Project Management** (`/projects`) - DPR, technical sanctions, milestone schedules, and progress tracking.
6. **4. Project 360°** (`/project-360`) - Unified road stretch and bridge digital passport.
7. **5. People & Directory** (`/directory`) - Official hierarchy and contractor registers.
8. **6. Department Connections** (`/departments`) - Inter-agency war room (Revenue, TANGEDCO, TWAD, Forest, Railways).
9. **7. Engineering Quality** (`/quality`) - Highways Research Station (HRS) cube, core, and roughness tests.
10. **8. Finance & Procurement** (`/finance`) - Letter of Credit (LC), IFMS bridge, and bill clearance.
11. **9. Contractor Intelligence** (`/contractors`) - Empanelled contractor performance ratings and bid capacities.
12. **10. Field Operations** (`/field-ops`) - Daily field logs, gang work maintenance, and JE inspections.
13. **11. Road & Bridge Assets** (`/assets`) - RAMS asset register with condition scoring.
14. **12. Digital Office** (`/digital-office`) - E-Office files, G.O. repository, and statutory circulars.
15. **13. Land & Utility Coordination** (`/land-utility`) - TN Highways Act 2001 Section 15(2) and utility shifting.
16. **14. Legal, Audit & Compliance** (`/compliance`) - High Court writ petitions and AG audit paras.
17. **15. Citizen Services** (`/citizen-services`) - Pothole grievances and Right to Information (RTI).
18. **16. Reports and Analytics** (`/reports`) - Cabinet notes and Legislative Assembly Questions (LAQ).
19. **17. Administration** (`/admin`) - User provisioning, circle/division boundaries, and security audits.

### 3. Persistent Ask AI Assistant
* Available on every dashboard screen via floating entry point.
* Screen-aware context injection with automated suggested prompts.
* Database-grounded references for road bottlenecks, project expenditure, and utility clearances.
* Prominently tagged with `[DEMO DATA ONLY]` statutory safety notices.

### 4. Enterprise Data Model (26 Core Entities)
Established with complete relational foreign keys, historical tenure tracking, and audit indexing:
* `User`, `Role`, `Permission`, `Department`, `Organisation`
* `Zone`, `Circle`, `Division`, `Subdivision`
* `Road`, `Bridge`, `Project`, `WorkPackage`, `Contract`
* `Contractor`, `Consultant`, `Official`, `ProjectStakeholder`, `StakeholderResponsibility`
* `DepartmentDependency`, `Approval`, `Issue`, `Document`, `EvidenceRecord`
* `WorkflowTask`, `Notification`, `AuditEvent`

---

## 🔑 Demo Personas & Login Credentials

All sample accounts are pre-seeded in the database:

| Username | Password | Role / Designation | Jurisdiction Scope | Authorized Workspaces |
| :--- | :--- | :--- | :--- | :--- |
| **`minister`** | `highway123` | Hon'ble Minister for Highways | Statewide (Cabinet Strategic) | `/leadership/minister` & `/` |
| **`secretary`**| `highway123` | Principal Secretary to Government | Statewide (Dept Governance) | `/leadership/secretary` & `/` |
| **`admin`** | `admin123` | System Administrator | Statewide (Full Administration) | All Workspaces |
| **`chief_eng`** | `highway123` | Chief Engineer (Projects) | Statewide (All Highway Circles) | `/leadership/secretary` & `/` |
| **`se_chengalpattu`**| `highway123`| Superintending Engineer | Chengalpattu Circle | Circle-scoped `/` |
| **`ee_tambaram`** | `highway123` | Divisional Engineer | Tambaram Division | Division-scoped `/` |
| **`contractor_lt`** | `highway123` | Contractor (L&T Infrastructure) | Restricted to `PRJ-TN-2026-001` | Scoped `/` (Leadership blocked 403) |
| **`contractor_pst`**| `highway123`| Contractor (PST Constructions) | Restricted to `PRJ-TN-2026-002` | Scoped `/` (Leadership blocked 403) |

> **Security Note**: RBAC is enforced both on the client and server. If `ee_tambaram` or `contractor_lt` navigates to `/leadership/minister` or `/leadership/secretary`, or attempts to access `/api/v1/executive/leakage` or `/api/v1/executive/legal`, access is rejected with **HTTP 403 Forbidden**.

---

## 🚀 Quick Start Guide (Step-by-Step)

### Prerequisites
* Python 3.10+ (Python 3.14 compatible)
* Node.js v18+ (Node v20/v25 recommended)
* npm 9+

### Option A: Local Development (Recommended)

#### Step 1: Start the Backend API
```bash
cd backend
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
# If initializing venv for the first time:
# pip install -r requirements.txt
python -m app.seed               # Seeds the database with realistic TN Highways data
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be live at:
* Swagger UI: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)
* Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

#### Step 2: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
# If running for the first time:
# npm install
npm run dev
```
Frontend application will be live at:
* Web Application: [http://localhost:3000](http://localhost:3000)

---

### Option B: Docker Compose
```bash
docker-compose up --build
```
* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 🧪 Automated Test Suite

Run the backend integration test harness covering authentication, RBAC, contractor isolation, and workflow audit logging:

```bash
cd backend
.venv/bin/pytest -v
```

### Verified Test Results:
* `test_health_check` **PASSED** - Health check and Phase 1 disclaimer verification.
* `test_login_success_and_failure` **PASSED** - JWT token issuance and invalid password rejection.
* `test_contractor_isolation` **PASSED** - Contractor L&T cannot see or access Contractor PST's projects (**HTTP 403 Forbidden** enforced).
* `test_chief_engineer_statewide_access` **PASSED** - Verified statewide project visibility for Chief Engineers.
* `test_workflow_status_transition_and_audit_log` **PASSED** - Validated state-machine transition and immutable `AuditEvent` generation.
* `test_ask_ai_persistent_endpoint` **PASSED** - Verified Ask AI grounding references and demo disclaimer tags.

---

## 📂 Project Structure

```
govt-highways-agent/
├── ARCHITECT.md                 # Master Implementation Specification (Phase 0 & 1)
├── DESIGN.md                    # Tamil Nadu Highways Department Color Specification
├── README.md                    # Complete project guide and execution instructions
├── docker-compose.yml           # Containerized orchestration
├── docs/
│   ├── PHASE_0_ASSESSMENT.md    # Repository & technology stack evaluation
│   ├── ARCHITECTURE.md          # Enterprise architecture & domain blueprint
│   └── ADR.md                   # Architecture Decision Records (001-004)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── tn_hdos.db               # SQLite database with seeded departmental records
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint with CORS
│   │   ├── config.py            # Pydantic BaseSettings environment config
│   │   ├── database.py          # SQLAlchemy session engine
│   │   ├── models.py            # 26 core relational entities
│   │   ├── schemas.py           # Pydantic request/response validation
│   │   ├── auth.py              # JWT tokens, bcrypt, RBAC & jurisdiction filters
│   │   ├── seed.py              # Realistic TN Highways departmental seed data
│   │   ├── services/
│   │   │   ├── audit.py         # Reusable immutable audit logging
│   │   │   └── workflow.py      # Issue & task state-machine engine
│   │   └── routers/
│   │       ├── auth.py          # Token login & current user profile
│   │       ├── users.py         # User listing
│   │       ├── roles.py         # Role catalogue
│   │       ├── departments.py   # Departments & administrative zones
│   │       ├── organisations.py # Contractors & consultants
│   │       ├── projects.py      # Projects with RBAC jurisdiction checks
│   │       ├── officials.py     # Engineer directory & designations
│   │       ├── contractors.py   # Empanelled contractors
│   │       ├── dependencies.py  # Inter-agency clearance tracking
│   │       ├── issues.py        # Bottlenecks & issues
│   │       ├── workflows.py     # Assigned operational tasks
│   │       ├── documents.py     # Document records & hashes
│   │       ├── audit.py         # Immutable audit stream
│   │       └── ai.py            # Persistent Ask AI query endpoint
│   └── tests/
│       ├── conftest.py          # Test database fixtures
│       └── test_auth_and_rbac.py# Automated security, RBAC & isolation tests
└── frontend/
    ├── package.json
    ├── tailwind.config.js       # Configured with DESIGN.md road tokens
    ├── postcss.config.js
    ├── tsconfig.json
    ├── vite.config.ts           # Proxy to backend API on port 8000
    ├── index.html
    └── src/
        ├── types/index.ts       # Typed TypeScript definitions
        ├── services/api.ts      # API client functions
        ├── context/AuthContext.tsx # Authentication & persona switching context
        ├── components/
        │   ├── Header.tsx       # Global government header with RBAC persona selector
        │   ├── Sidebar.tsx      # 17-module persistent sidebar
        │   ├── AskAIPanel.tsx   # Persistent Ask AI intelligence drawer
        │   └── RoadBadge.tsx    # Road classification badge adhering to DESIGN.md
        ├── pages/
        │   ├── Dashboard.tsx    # Executive Command Centre (Module 1)
        │   ├── ProjectsPage.tsx # Project Management Portfolio (Module 3)
        │   └── PlaceholderModule.tsx # Departmental modules (Modules 2, 4-17)
        ├── App.tsx              # Router & layout shell
        ├── main.tsx
        └── index.css            # Custom badge utility classes
```

---

## 🛡️ Statutory Disclaimer

All figures, project designations, official names, phone numbers, and contractor details included in this repository are **explicitly marked as [DEMO DATA]** for software architectural and evaluation purposes only. Live government databases, financial disbursements, and statutory decisions require formal Government Orders (G.O.) and digital certificate authorizations.

