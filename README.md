# TN-HDOS: Tamil Nadu Highways Digital Operating System

[![Phase](https://img.shields.io/badge/Phase-0%20%26%201%20Foundation-006A4E)](docs/ARCHITECTURE.md)
[![Theme](https://img.shields.io/badge/Highways%20Theme-DESIGN.md%20Compliant-FFCC00)](DESIGN.md)
[![Tests](https://img.shields.io/badge/Pytest-6%20Passed-004B87)](backend/tests/)
[![License](https://img.shields.io/badge/License-Govt%20of%20Tamil%20Nadu-D1197E)]()

**TN-HDOS (Tamil Nadu Highways Digital Operating System)** is the official departmental enterprise digital operating platform built for the **Highways and Minor Ports Department, Government of Tamil Nadu**.

It establishes an integrated foundation connecting projects, roads, bridges, engineers, contractors, consultants, external government departments (Revenue, TANGEDCO, TWAD, Forest, Southern Railway), finances, and statutory audit compliance.

---

## 🎨 Highways Department Theme Palette (DESIGN.md)

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

### 1. Global Application Header & Role Persona Switcher
* Official Tamil Nadu Government branding and dynamic module title.
* Global search bar querying project codes, road names, and contractors.
* **Live RBAC Role Switcher**: Click on the user profile to seamlessly evaluate the platform under different roles with server-side jurisdiction enforcement.

### 2. Full 17-Module Persistent Sidebar
1. **Executive Command Centre** (`/`) - Main KPI cockpit with portfolio statistics and road classification distribution.
2. **Leakage Intelligence** (`/leakage`) - Refinery bitumen reconciliation and anti-corruption signals.
3. **Project Management** (`/projects`) - DPR, technical sanctions, milestone schedules, and progress tracking.
4. **Project 360°** (`/project-360`) - Unified road stretch and bridge digital passport.
5. **People & Directory** (`/directory`) - Official hierarchy and contractor registers.
6. **Department Connections** (`/departments`) - Inter-agency war room (Revenue, TANGEDCO, TWAD, Forest, Railways).
7. **Engineering Quality** (`/quality`) - Highways Research Station (HRS) cube, core, and roughness tests.
8. **Finance & Procurement** (`/finance`) - Letter of Credit (LC), IFMS bridge, and bill clearance.
9. **Contractor Intelligence** (`/contractors`) - Empanelled contractor performance ratings and bid capacities.
10. **Field Operations** (`/field-ops`) - Daily field logs, gang work maintenance, and JE inspections.
11. **Road & Bridge Assets** (`/assets`) - RAMS asset register with condition scoring.
12. **Digital Office** (`/digital-office`) - E-Office files, G.O. repository, and statutory circulars.
13. **Land & Utility Coordination** (`/land-utility`) - TN Highways Act 2001 Section 15(2) and utility shifting.
14. **Legal, Audit & Compliance** (`/compliance`) - High Court writ petitions and AG audit paras.
15. **Citizen Services** (`/citizen-services`) - Pothole grievances and Right to Information (RTI).
16. **Reports and Analytics** (`/reports`) - Cabinet notes and Legislative Assembly Questions (LAQ).
17. **Administration** (`/admin`) - User provisioning, circle/division boundaries, and security audits.

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

| Username | Password | Role / Designation | Jurisdiction Scope |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | System Administrator | Statewide (Full Administration) |
| **`chief_eng`** | `highway123` | Chief Engineer (Projects) | Statewide (All Highway Circles) |
| **`se_chengalpattu`**| `highway123` | Superintending Engineer | Chengalpattu Circle |
| **`ee_tambaram`** | `highway123` | Divisional Engineer | Tambaram Division |
| **`contractor_lt`** | `highway123` | Contractor (L&T Infrastructure) | Restricted to `PRJ-TN-2026-001` only |
| **`contractor_pst`**| `highway123` | Contractor (PST Constructions) | Restricted to `PRJ-TN-2026-002` only |

> **Note**: Contractor isolation is strictly verified via automated tests. `contractor_lt` receives **HTTP 403 Forbidden** if attempting to access `contractor_pst`'s records.

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

