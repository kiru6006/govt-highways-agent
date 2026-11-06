# TN-HDOS: Testing, Verification & Quality Assurance Register

**Highways and Minor Ports Department, Government of Tamil Nadu**  
**Document Ref:** `docs/TESTING_AND_VERIFICATION.md`  
**Version:** 1.0 (Phase 17 Production Readiness Baseline)  
**Status:** Approved & Verified (39 of 39 Tests Passing — 100%)

---

## 1. Executive Summary

This document establishes the official testing framework, test suite architecture, automated test specifications, and verification procedures for the **Tamil Nadu Highways Digital Operating System (TN-HDOS)**.

All test suites are executed against live FastAPI REST application routers, SQLAlchemy ORM data layers, Role-Based Access Control (RBAC) authorization gates, and SQLite/PostgreSQL relational storage.

### Testing Metrics Summary
| Metric | Specification / Result | Status |
| :--- | :--- | :---: |
| **Total Test Suites** | 5 Suites (`test_auth_and_rbac`, `test_executive_phase2`, `test_ckicp_tnrsp`, `test_project_360`, `test_phase17_audit`) | ✅ Complete |
| **Total Automated Tests** | **39 Tests** | ✅ Complete |
| **Passing Tests** | **39 Tests (100% Pass Rate)** | ✅ Verified |
| **Failing / Skipped Tests** | 0 Tests | ✅ Verified |
| **Execution Time** | ~1.85 seconds (full regression suite) | ⚡ High Speed |
| **Test Engine** | `pytest 8.x` with `httpx` and `starlette.testclient` | ✅ Industry Standard |
| **Database Environment** | Isolated test SQLite database with automated fixture teardown | ✅ Zero Side Effects |

---

## 2. Test Architecture & Fixtures

### 2.1 Test Configuration (`backend/tests/conftest.py`)
The testing harness utilizes dependency injection overrides in FastAPI to isolate testing from production data:
- **`app.dependency_overrides[get_db]`**: Provides an isolated SQLite session initialized with all tables from `Base.metadata`.
- **Database Fixtures**: Standardized seed data covering all 12 TN-HES roles, sample SH/NH/MDR road projects, CKICP/TNRSP-II mega packages, land parcels, High Court writ stays, and external statutory clearances.
- **Authentication Personas**:
  - `minister`: Hon'ble Minister for Public Works & Highways (`ROLE_MINISTER`)
  - `secretary`: Additional Chief Secretary / Principal Secretary to Government (`ROLE_SECRETARY`)
  - `dg`: Director General, Highways Department (`ROLE_DIRECTOR_GENERAL`)
  - `chief_engineer_cm`: Chief Engineer, Construction & Maintenance (`ROLE_CHIEF_ENGINEER`)
  - `superintending_engineer`: SE, Chennai Circle (`ROLE_SUPERINTENDING_ENGINEER`)
  - `divisional_engineer`: EE / Divisional Engineer, Chennai Division (`ROLE_DIVISIONAL_ENGINEER`)
  - `assistant_divisional_engineer`: ADE, Guindy Sub-division (`ROLE_ASSISTANT_DIVISIONAL_ENGINEER`)
  - `contractor_lt`: Larsen & Toubro Limited (`ROLE_CONTRACTOR` - scoped to Contract ID 1)
  - `contractor_rival`: Rival EPC Contractor (`ROLE_CONTRACTOR` - scoped to Contract ID 2)

---

## 3. Comprehensive Test Suite Catalog

```
backend/tests/
├── conftest.py                   # Pytest fixtures, test database setup, and mock JWT auth
├── test_auth_and_rbac.py         # 6 Tests  — Authentication, JWT tokens, RBAC, contractor isolation
├── test_executive_phase2.py      # 16 Tests — Executive Smartboard, Minister & Secretary dashboards, KPIs
├── test_ckicp_tnrsp.py           # 6 Tests  — Multilateral corridor packages, tenders, LA, legal stays
├── test_project_360.py           # 6 Tests  — 17-facet asset dossier, EVM calculations, milestone tracking
└── test_phase17_audit.py         # 5 Tests  — Security gating, multi-tenant isolation, AI statutory grounding
```

---

### Suite 1: Security, Authentication & Core RBAC Suite (`test_auth_and_rbac.py`)
**Test File:** `backend/tests/test_auth_and_rbac.py`  
**Scope:** Core authentication, JWT generation, role-based route permissions, multi-tenant contractor isolation, audit logging, and AI assistant security.

| # | Test Function Name | Tested Endpoint / Component | Verification Criteria & Assertion | Status |
| :-: | :--- | :--- | :--- | :---: |
| 1 | `test_health_check` | `GET /api/v1/health` | Validates API online status, database connection, timestamp generation, and version string. | ✅ PASSED |
| 2 | `test_login_success_and_failure` | `POST /api/v1/auth/token` | Validates bcrypt password hash verification, issuance of signed JWT bearer tokens, and rejection of invalid credentials with HTTP 401. | ✅ PASSED |
| 3 | `test_contractor_isolation` | `GET /api/v1/projects` with Contractor JWT | Verifies multi-tenant isolation: Contractor L&T can only view assigned projects; attempting to access rival packages returns scoped results or HTTP 403. | ✅ PASSED |
| 4 | `test_chief_engineer_statewide_access` | `GET /api/v1/projects` with CE JWT | Verifies statewide visibility for Chief Engineers across all circles, divisions, and road classifications. | ✅ PASSED |
| 5 | `test_workflow_status_transition_and_audit_log` | `POST /api/v1/projects/{id}/transition` | Validates the project state machine (Sanctioned → Tendered → Awarded → In Execution → Completed) and verifies immutable audit log recording. | ✅ PASSED |
| 6 | `test_ask_ai_persistent_endpoint` | `POST /api/v1/ai/query` | Validates context-aware AI assistant responses, statutory citations (Tamil Nadu Transparency in Tenders Act 1998), and grounded output without hallucinations. | ✅ PASSED |

---

### Suite 2: Executive Command Centre & Leadership Suite (`test_executive_phase2.py`)
**Test File:** `backend/tests/test_executive_phase2.py`  
**Scope:** Phase 2 Executive Smartboard, 16 state-wide KPIs, dedicated Minister & Principal Secretary leadership workspaces, zonal benchmarking, committee referrals, and statutory decision dispatches.

| # | Test Function Name | Tested Endpoint / Component | Verification Criteria & Assertion | Status |
| :-: | :--- | :--- | :--- | :---: |
| 7 | `test_executive_16_kpis_statewide` | `GET /api/v1/executive/kpis` | Verifies all 16 core state-wide KPIs (sanctioned budget, expenditure, road length, EVM variance, delayed packages) calculated from real database entities. | ✅ PASSED |
| 8 | `test_executive_kpis_contractor_scoping` | `GET /api/v1/executive/kpis` (Contractor role) | Verifies that contractors querying the executive endpoint only receive data scoped strictly to their awarded contracts. | ✅ PASSED |
| 9 | `test_executive_zones_benchmarking` | `GET /api/v1/executive/zones` | Verifies regional benchmarking across the 4 C&M Administrative Zones: Chennai, Coimbatore, Madurai, and Trichy. | ✅ PASSED |
| 10 | `test_critical_leadership_issues` | `GET /api/v1/executive/critical-issues` | Verifies identification of critical project delays, root-cause tagging, and responsible contractor/officer attribution. | ✅ PASSED |
| 11 | `test_interdepartmental_blockers` | `GET /api/v1/executive/blockers` | Verifies inter-agency clearance tracking across Revenue, TANGEDCO, TWAD, Forest, and Southern Railway with designated SPOCs. | ✅ PASSED |
| 12 | `test_financial_leakage_and_evidence` | `GET /api/v1/executive/leakage` | Verifies financial irregularity audits: duplicate invoice detection, bitumen grade consumption variances, and unadjusted mobilization advances. | ✅ PASSED |
| 13 | `test_leadership_decision_creation_and_audit` | `POST /api/v1/executive/decisions` | Verifies executive directive dispatch by the Minister or Secretary, generating immutable audit trail entries with priority flags. | ✅ PASSED |
| 14 | `test_minister_workspace_access_and_security` | `GET /api/v1/executive/minister-workspace` | Verifies that only the Hon'ble Minister (`ROLE_MINISTER`) and Secretary can access this workspace; unauthorized roles receive HTTP 403 Forbidden. | ✅ PASSED |
| 15 | `test_secretary_workspace_access_and_security` | `GET /api/v1/executive/secretary-workspace` | Verifies that only the Principal Secretary (`ROLE_SECRETARY`) can access this workspace; unauthorized roles receive HTTP 403 Forbidden. | ✅ PASSED |
| 16 | `test_confidential_leakage_and_legal_protection` | `GET /api/v1/executive/leakage` (Low privileges) | Verifies confidentiality masking: financial irregularity investigations are hidden from field contractors and public roles. | ✅ PASSED |
| 17 | `test_statutory_authority_enforcement_on_decisions`| `POST /api/v1/executive/decisions` | Enforces statutory limits of authority: an Assistant Engineer attempting to issue a Cabinet-level directive is rejected with HTTP 403. | ✅ PASSED |
| 18 | `test_verified_organisation_structure` | `GET /api/v1/executive/organisation-tree` | Verifies compliance with the official Tamil Nadu Highways Engineering Service (TN-HES) cadre structure and 8 Statewide Wings. | ✅ PASSED |
| 19 | `test_government_documents_registry` | `GET /api/v1/executive/documents` | Validates access to official government documents: Policy Notes, Budget Estimates, Schedule of Rates (SSR), and Government Orders (G.O.s). | ✅ PASSED |
| 20 | `test_governance_committees_and_decisions` | `GET /api/v1/executive/committees` | Verifies tracking of the 8 statutory committees, meeting resolutions, and pending executive decisions. | ✅ PASSED |
| 21 | `test_statutory_referrals` | `GET /api/v1/executive/referrals` | Validates automated statutory referral triggers (e.g. project cost revisions > 10% automatically referred to the Standing Finance Committee). | ✅ PASSED |
| 22 | `test_ai_intelligence_findings_and_human_validation`| `GET /api/v1/executive/ai-findings` | Verifies that AI-generated risk signals require mandatory review and sign-off by a designated departmental engineer before official escalation. | ✅ PASSED |

---

### Suite 3: Multilateral Programme Intelligence Suite (`test_ckicp_tnrsp.py`)
**Test File:** `backend/tests/test_ckicp_tnrsp.py`  
**Scope:** Asian Development Bank (ADB) and World Bank funded mega-programmes (CKICP and TNRSP-II), EPC work-packages, cadastral land acquisition parcels, High Court writ stays, and GeoJSON GIS alignments.

| # | Test Function Name | Tested Endpoint / Component | Verification Criteria & Assertion | Status |
| :-: | :--- | :--- | :--- | :---: |
| 23 | `test_list_programmes` | `GET /api/v1/programmes` | Verifies retrieval of official programmes: CKICP (ADB-assisted), TNRSP-II (World Bank), and CRIDP (State-funded). | ✅ PASSED |
| 24 | `test_ckicp_programme_details_and_kpis` | `GET /api/v1/programmes/CKICP` | Verifies ADB funding details, approved capital outlay of ₹6,448 Crore, corridor lengths, and expenditure progress. | ✅ PASSED |
| 25 | `test_ckicp_tenders_extraction_verification` | `GET /api/v1/programmes/CKICP/tenders` | Verifies 4 official tenders published on 18-02-2026 extracted from official government portals with authentic PDF gazette references. | ✅ PASSED |
| 26 | `test_ckicp_and_tnrsp_land_parcels` | `GET /api/v1/programmes/TNRSP_II/land-parcels` | Verifies cadastral survey numbers, Section 15(2), 15(1), and 19(1) gazette notification dates, and the verified 206.29 Hectares land footprint across 16 EPC packages. | ✅ PASSED |
| 27 | `test_ckicp_legal_cases_and_stays` | `GET /api/v1/programmes/CKICP/legal-cases` | Verifies Madras High Court writ petition records (e.g. WP No. 11420 of 2024), interim injunction orders, and chainage-level stay markers. | ✅ PASSED |
| 28 | `test_corridor_alignments_geojson` | `GET /api/v1/programmes/CKICP/alignments` | Validates valid GeoJSON FeatureCollection format with LineString geometries, chainage markers, and corridor coordinates. | ✅ PASSED |

---

### Suite 4: Project 360° Intelligence Suite (`test_project_360.py`)
**Test File:** `backend/tests/test_project_360.py`  
**Scope:** Standalone `/project-360` intelligence engine, 17-facet comprehensive asset dossier, Earned Value Management (EVM) variance formulas, milestone scheduling, and sub-resource endpoints.

| # | Test Function Name | Tested Endpoint / Component | Verification Criteria & Assertion | Status |
| :-: | :--- | :--- | :--- | :---: |
| 29 | `test_project_portfolio_listing_and_filtering` | `GET /api/v1/project-360/portfolio` | Verifies multi-parameter filtering: by classification (`SH`, `NH`, `MDR`, `ODR`), division (Chennai, Chengalpattu), and search queries. | ✅ PASSED |
| 30 | `test_project_360_detail_dossier_17_facets` | `GET /api/v1/project-360/1` | Verifies full 17-facet asset passport response (Sanctions, Chainage, Milestones, EVM, Land Acquisition, Utilities, Litigation, Quality tests). | ✅ PASSED |
| 31 | `test_project_execution_evm_variance_calculations`| Internal EVM Math Engine | Mathematically validates Earned Value formulas: $CV = EV - AC$, $SV = EV - PV$, $CPI = EV / AC$, $SPI = EV / PV$. | ✅ PASSED |
| 32 | `test_project_sub_resource_endpoints` | Sub-resources: `/milestones`, `/progress`, `/risks` | Validates dedicated sub-resource child endpoints for granular mobile/desktop frontend component loading. | ✅ PASSED |
| 33 | `test_project_360_jurisdiction_scoping_and_contractor_isolation` | `GET /api/v1/project-360/portfolio` (Scoped roles) | Enforces field engineer circle scoping and multi-tenant contractor isolation on the 360° portfolio. | ✅ PASSED |
| 34 | `test_project_360_not_found` | `GET /api/v1/project-360/999999` | Verifies clean HTTP 404 response with standardized JSON error message when querying nonexistent project IDs. | ✅ PASSED |

---

### Suite 5: Phase 17 Independent Audit & Grounding Suite (`test_phase17_audit.py`)
**Test File:** `backend/tests/test_phase17_audit.py`  
**Scope:** Independent evidence audit, unauthenticated endpoint protection, multi-tenant contractor separation, AI neutral language compliance, and mathematical division-by-zero guards.

| # | Test Function Name | Tested Endpoint / Component | Verification Criteria & Assertion | Status |
| :-: | :--- | :--- | :--- | :---: |
| 35 | `test_unauthenticated_request_rejected` | Protected Endpoints without Token | Verifies that calling sensitive endpoints (`/executive/kpis`, `/project-360/1`, `/executive/minister-workspace`) without a JWT token returns strict HTTP 401 Unauthorized. | ✅ PASSED |
| 36 | `test_contractor_multi_tenant_isolation` | `GET /api/v1/project-360/{id}` (Cross-contractor) | Verifies that Contractor A attempting to access Project 360° dossier of Contractor B's project receives HTTP 403 Forbidden. | ✅ PASSED |
| 37 | `test_nonexistent_project_360_returns_404` | `GET /api/v1/project-360/invalid-id` | Verifies robust input handling and HTTP 404 response when non-numeric or non-existent IDs are queried. | ✅ PASSED |
| 38 | `test_ai_findings_statutory_grounding_and_neutrality` | `GET /api/v1/executive/ai-findings` | Verifies that all AI-generated findings use neutral, factual government terminology (e.g. "variance observed", "procedural delay") and strictly avoid defamatory or accusatory terms ("fraud", "corrupt", "bribe"). | ✅ PASSED |
| 39 | `test_evm_metrics_zero_division_safety` | EVM Calculations with Zero Denominators | Validates zero-division guards in Earned Value Management calculations: returns valid neutral values (1.0 or 0.0) when Planned Value ($PV = 0$) or Actual Cost ($AC = 0$). | ✅ PASSED |

---

## 4. How to Run the Automated Tests

### 4.1 Prerequisites
Ensure the Python virtual environment is activated and dependencies are installed:
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

### 4.2 Run All Tests (Full Suite)
```bash
# Execute all 39 tests with verbose output
pytest -v

# Output:
# ======================== 39 passed in 1.85s ========================
```

### 4.3 Run Individual Test Suites
```bash
# 1. Security & RBAC Suite (6 tests)
pytest -v tests/test_auth_and_rbac.py

# 2. Executive Smartboard & Leadership Suite (16 tests)
pytest -v tests/test_executive_phase2.py

# 3. CKICP & TNRSP-II Multilateral Programme Suite (6 tests)
pytest -v tests/test_ckicp_tnrsp.py

# 4. Project 360° Intelligence Suite (6 tests)
pytest -v tests/test_project_360.py

# 5. Phase 17 Independent Audit Suite (5 tests)
pytest -v tests/test_phase17_audit.py
```

### 4.4 Run with Code Coverage Report
```bash
pytest --cov=app --cov-report=term-missing
```

---

## 5. Frontend Quality Assurance & Build Verification

The frontend client is developed in **React 18 + TypeScript + Vite + Tailwind CSS** with strict TypeScript type-checking.

### Build Verification Command:
```bash
cd frontend
npm run build
```
**Verification Outcome:**
- Zero TypeScript (`tsc`) compilation errors.
- Clean Vite production distribution output in `frontend/dist/`.
- Validated bundle size with code splitting.
- Fully compatible with GitHub Pages SPA routing via `HashRouter`.

---

## 6. Regression Testing & Pre-Commit Checklist

Before any code change or deployment to staging or production, the following pipeline must pass:

1. **Backend Automated Tests**: All 39 tests in `backend/tests/` must pass with zero failures.
2. **Frontend Production Build**: `npm run build` in `frontend/` must compile with zero errors.
3. **Security Check**: Role permissions must ensure that no contractor persona can inspect unassigned contracts or sensitive departmental audit registries.
4. **Data Integrity Check**: Any added government records must be tagged with authentic source references (G.O. number, ADB loan agreement, or High Court writ number).

---
*Verified and certified for departmental pilot deployment under Phase 17 Production Readiness standards.*

