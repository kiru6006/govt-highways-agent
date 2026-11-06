# API and Route Audit: Complete Architecture Catalog

**System:** Tamil Nadu Highways Digital Operating System (TN-HDOS)  
**Audit Standard:** RESTful API Specification & Client-Side Routing Architecture  
**Audit Date:** November 6, 2026  
**Auditor:** Full-Stack API Architect & Security Auditor  

---

## 1. Frontend Routing Architecture Catalog

The TN-HDOS frontend utilizes `react-router-dom` in HashRouter mode for zero-configuration static serving, client-side session hydration, and smooth role-based view transitions.

| S.No | URL Route Path | Component | Operational Status | User Roles Authorized | Key Features & Datasets Rendered |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | `/#/` | `Dashboard.tsx` | **OPERATIONAL** | Minister, Secretary, CE, SE, Public | State portfolio summary, inter-agency blockers, zonal comparisons, AI alerts |
| **2** | `/#/leadership/minister` | `MinisterDashboard.tsx` | **OPERATIONAL** | Minister, Secretary | Political priorities, constituency progress, public delivery matrix, press releases |
| **3** | `/#/leadership/secretary` | `SecretaryDashboard.tsx` | **OPERATIONAL** | Secretary, Minister, CE | Statutory compliance, BE/RE budget analysis, contractor scorecards, audit alerts |
| **4** | `/#/ckicp` | `ProgrammeIntelligencePage.tsx` | **OPERATIONAL** | All Departmental Officials | CKICP 16 packages, ADB funding, EPC contracts, LA status, supervision consultants |
| **5** | `/#/tnrsp` | `ProgrammeIntelligencePage.tsx` | **OPERATIONAL** | All Departmental Officials | TNRSP-II World Bank projects, 206.29 Ha land parcels, BSCPL/NCC/Transstroy data |
| **6** | `/#/projects` | `ProjectsPage.tsx` | **OPERATIONAL** | All Officials & Contractors | Responsive projects table, road tier filter, physical vs financial, direct 360° link |
| **7** | `/#/project-360` | `Project360Page.tsx` | **OPERATIONAL** | All Officials & Contractors | Unified 17-facet project intelligence, EVM variance analysis, LA, litigation, risks |
| **8** | `/#/directory` | `DirectoryPage.tsx` | **OPERATIONAL** | All Officials & Public | 8 Highways Wings, 47 HQ posts, G.O. Ms. No. 75 delegations, external SPOCs |
| **9** | `/#/compliance` | `GovernanceRegistryPage.tsx` | **OPERATIONAL** | Secretary, CE, Vigilance | High Court stays, statutory committees, PAC audit paras, grounded AI findings |
| **10** | `/#/governance` | `GovernanceRegistryPage.tsx` | **OPERATIONAL** | Secretary, CE, Vigilance | Alias to `/compliance` |
| **11** | `/#/leakage` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | Vigilance, Internal Audit | Anomaly detection console; backend algorithms active in executive router |
| **12** | `/#/departments` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | Secretariat, CE | Inter-departmental coordination console (TANGEDCO, Revenue, Forest, TWAD) |
| **13** | `/#/quality` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | CE (Quality), ADE, Lab | Core test register, non-conformance reports (NCR), lab cube test data |
| **14** | `/#/finance` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | FA, Accounts Officers | Letter of Credit (LOC) tracking, bill clearance, FIDIC price escalation |
| **15** | `/#/contractors` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | CE, SE, Contractors | Performance grading, debarment registry, encashment tracking |
| **16** | `/#/field-ops` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | DE, ADE, AE, JDO | Measurement Book (MB) recordings, daily site logs, weather downtime |
| **17** | `/#/assets` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | CE (P&D), GIS Cell | Road asset management system (RAMS), bridge condition indices (BCI) |
| **18** | `/#/digital-office`| `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | Secretariat, Circle Clerks | e-File movement, G.O. issuance, departmental circulars |
| **19** | `/#/land-utility` | `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | Spl DRO (LA), DE | Section 15(1) gazettes, award awards, utility shifting joint inspections |
| **20** | `/#/citizen-services`| `PlaceholderModule.tsx` | **PROMOTION PLANNED (P18)** | Public, Grievance Cell | Pothole reporting, CM Helpline integration, Right to Information (RTI) |

---

## 2. Backend API Endpoint Catalog

The FastAPI backend exposes modular routers mounted under `/api/v1`.

| S.No | Method | Endpoint URL | Router Module | Auth Required | RBAC Scope | Request / Query Parameters | Response Model / Payload |
| :---: | :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| **1** | `POST` | `/api/v1/auth/login` | `routers.auth` | No | Public | `username`, `password` (OAuth2 form) | `Token` (JWT access token, role, name) |
| **2** | `GET` | `/api/v1/auth/me` | `routers.auth` | Yes | Any Authenticated | Bearer Header | `UserResponse` (profile, role, jurisdiction) |
| **3** | `GET` | `/api/v1/projects` | `routers.projects` | Yes | Role/Jurisdiction Scoped | `road_type`, `district`, `status` | `List[ProjectResponse]` |
| **4** | `GET` | `/api/v1/projects/{id}` | `routers.projects` | Yes | Role/Jurisdiction Scoped | `id: int` | `ProjectResponse` |
| **5** | `GET` | `/api/v1/projects/{id}/360` | `routers.projects_360` | Yes | Role/Jurisdiction Scoped | `id: int` | `Project360Response` (17 facets) |
| **6** | `GET` | `/api/v1/projects/{id}/milestones` | `routers.projects_360` | Yes | Role/Jurisdiction Scoped | `id: int` | `List[MilestoneResponse]` |
| **7** | `GET` | `/api/v1/projects/{id}/risks` | `routers.projects_360` | Yes | Role/Jurisdiction Scoped | `id: int` | `List[RiskResponse]` |
| **8** | `GET` | `/api/v1/projects/{id}/progress-history`| `routers.projects_360`| Yes | Role/Jurisdiction Scoped | `id: int` | `List[ProgressHistoryResponse]` |
| **9** | `GET` | `/api/v1/executive/kpis` | `routers.executive` | Yes | Leadership / CE | None | `ExecutiveKPIsResponse` |
| **10** | `GET` | `/api/v1/executive/minister` | `routers.executive` | Yes | Minister, Secretary | None | `MinisterDashboardResponse` |
| **11** | `GET` | `/api/v1/executive/secretary` | `routers.executive` | Yes | Secretary, Minister | None | `SecretaryDashboardResponse` |
| **12** | `GET` | `/api/v1/executive/programmes/{name}` | `routers.executive` | Yes | All Officials | `name: ckicp \| tnrsp` | `ProgrammeDetailResponse` |
| **13** | `GET` | `/api/v1/executive/organisation/verified-structure` | `routers.executive` | Yes | All Officials | None | `OrganisationStructureResponse` (8 wings) |
| **14** | `GET` | `/api/v1/executive/governance/committees` | `routers.executive` | Yes | Secretary, CE | None | `List[CommitteeResponse]` |
| **15** | `GET` | `/api/v1/executive/governance/referrals` | `routers.executive` | Yes | Secretary, CE, Vigilance | None | `List[ReferralResponse]` |
| **16** | `GET` | `/api/v1/executive/ai/findings` | `routers.executive` | Yes | Secretary, Internal Audit| None | `List[AIFindingResponse]` |

---

## 3. Data Flow & Security Validation

1. **Authentication Token Lifecycle:** JWT tokens are issued with a 24-hour expiration containing user ID, role code, and geographical jurisdiction parameters (`district_id`, `wing_code`).
2. **Contractor Data Isolation:** Any query issued by a user with role `CONTRACTOR` automatically appends `filter(Project.contractor_id == current_user.contractor_id)` to prevent cross-bidder data leakage.
3. **Zonal Jurisdiction Scoping:** Superintending Engineers (SE) and Divisional Engineers (DE) queries automatically filter projects by their assigned geographical division.
4. **Client State Resilience:** If backend API services undergo temporary restart, the frontend gracefully falls back to cached in-memory structures to maintain uninterrupted situational awareness for high-level officials.
