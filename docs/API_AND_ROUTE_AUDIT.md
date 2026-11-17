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
| **11** | `/#/cm-dashboard` | `CMDashboard.tsx` | **OPERATIONAL** | CMO, Minister, Secretary | 17 Apex KPIs, 8-zone state pulse map, delay root-cause analysis, CM directions |
| **12** | `/#/organisation-intelligence` | `OrganisationIntelligencePage.tsx` | **OPERATIONAL** | All Departmental Leadership | G.O. (Ms) No. 43 Blueprint, 4 C&M Zones, 19 Circles, 68 Divisions, 285 Subdivisions, 19 Annexure-III redesignations, Exception resolution |
| **13** | `/#/works-analytics` | `WorksAnalyticsPage.tsx` | **OPERATIONAL** | Chief Engineers, Planning | Works Data Explorer & Charts, URL-synchronized filtering, Excel export |
| **14** | `/#/cridp-risk-intelligence` | `CRIDPRiskIntelligencePage.tsx` | **OPERATIONAL** | Chief Engineers, Planning, Audit | 11-Tab CRIDP Risk Intelligence: Previous works, investigations, corrective actions, advanced filtering |
| **15** | `/#/cridp-verification` | `CRIDPRiskIntelligencePage.tsx` | **OPERATIONAL** | Chief Engineers, Planning, Audit | 5-Year renewal verification, chainage overlap intervals, delegation of power rules |
| **16** | `/#/major-works` | `MajorWorksPortfolioPage.tsx` | **OPERATIONAL** | Leadership, Project Directors | ₹50 Cr+ flagship works portfolio, loss prevention ledger, site blocker tracking |
| **17** | `/#/leakage` | `LeakageIntelligencePage.tsx` | **OPERATIONAL** | Vigilance, Internal Audit | Bitumen cross-reconciliation, weighbridge anomalies, anti-corruption risk scoring |
| **18** | `/#/departments` | `DepartmentsPage.tsx` | **OPERATIONAL** | Secretariat, CE | Inter-departmental coordination console (TANGEDCO, Revenue, Forest, TWAD) |
| **19** | `/#/quality` | `QualityPage.tsx` | **OPERATIONAL** | CE (Quality), ADE, Lab | Core test register, non-conformance reports (NCR), lab cube test data |
| **20** | `/#/finance` | `PlaceholderModule.tsx` | **OPERATIONAL DEMO** | FA, Accounts Officers | Letter of Credit (LOC) tracking, bill clearance, FIDIC price escalation |
| **21** | `/#/contractors` | `PlaceholderModule.tsx` | **OPERATIONAL DEMO** | CE, SE, Contractors | Performance grading, debarment registry, encashment tracking |
| **22** | `/#/field-ops` | `FieldOpsPage.tsx` | **OPERATIONAL** | DE, ADE, AE, JDO | Measurement Book (MB) recordings, daily site logs, weather downtime |
| **23** | `/#/assets` | `AssetsPage.tsx` | **OPERATIONAL** | CE (P&D), GIS Cell | Road asset management system (RAMS), bridge condition indices (BCI) |
| **24** | `/#/digital-office`| `DigitalOfficePage.tsx` | **OPERATIONAL** | Secretariat, Circle Clerks | e-File movement, G.O. issuance, departmental circulars |
| **25** | `/#/land-utility` | `LandUtilityPage.tsx` | **OPERATIONAL** | Spl DRO (LA), DE | Section 15(1) gazettes, award awards, utility shifting joint inspections |
| **26** | `/#/land-litigation`| `LandLitigationPage.tsx` | **OPERATIONAL** | Legal Officers, Spl DRO | Land acquisition writ petitions, stay orders, Advocate monitoring |
| **27** | `/#/notifications`| `NotificationsPage.tsx` | **OPERATIONAL** | All Officials | Real-time statutory alerts, priority briefings, severity filtration |
| **28** | `/#/calendar` | `CalendarPage.tsx` | **OPERATIONAL** | Leadership, Engineers | Unified tender opening, High Court hearings, PAC audit dates |
| **29** | `/#/messages` | `MessagesPage.tsx` | **OPERATIONAL** | Departmental Cadre | Secure official chat, project discussion channels, AI action items |
| **30** | `/#/citizen-services`| `PlaceholderModule.tsx` | **PROMOTION PLANNED** | Public, Grievance Cell | Pothole reporting, CM Helpline integration, Right to Information (RTI) |

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
| **17** | `GET` | `/api/v1/works-analytics/filter-registry` | `routers.works_analytics` | Yes | All Officials | None | `WorksAnalyticsFilterRegistryOut` |
| **18** | `POST` | `/api/v1/works-analytics/query` | `routers.works_analytics` | Yes | All Officials | `skip`, `limit`, JSON payload | `WorksAnalyticsQueryResultOut` |
| **19** | `POST` | `/api/v1/works-analytics/kpis` | `routers.works_analytics` | Yes | All Officials | JSON payload | `WorksAnalyticsKPIsOut` |
| **20** | `POST` | `/api/v1/works-analytics/charts` | `routers.works_analytics` | Yes | All Officials | JSON payload | `WorksAnalyticsChartsOut` |
| **21** | `POST` | `/api/v1/works-analytics/export` | `routers.works_analytics` | Yes | All Officials | `format: excel \| csv` | Streaming File Blob |
| **22** | `GET` | `/api/v1/works-analytics/work/{work_id}` | `routers.works_analytics` | Yes | All Officials | `work_id: str` | `UnifiedWorkRecordOut` |
| **23** | `GET` | `/api/v1/cridp-verification/risk-overview` | `routers.cridp_verification` | Yes | All Officials | None | `CRIDPRiskOverviewResponse` |
| **24** | `POST` | `/api/v1/cridp-verification/check-overlap` | `routers.cridp_verification` | Yes | Chief Engineers, Planning | `proposal_id` or road/chainage | `OverlapCheckResponse` |
| **25** | `GET` | `/api/v1/cridp-verification/investigation/{id}` | `routers.cridp_verification` | Yes | All Officials | `proposal_id: int` | `InvestigationDossierResponse` |
| **26** | `POST` | `/api/v1/cridp-verification/investigation/{id}/decision` | `routers.cridp_verification` | Yes | Chief Engineers | Decision JSON payload | `DecisionConfirmationResponse` |
| **27** | `POST` | `/api/v1/cridp-verification/advanced-filter` | `routers.cridp_verification` | Yes | All Officials | Multi-field filter payload | `CRIDPFilterResponse` |
| **28** | `POST` | `/api/v1/cridp-verification/year-wise-comparison` | `routers.cridp_verification` | Yes | All Officials | Comparison filter payload | `YearWiseComparisonResponse` |
| **29** | `GET` | `/api/v1/organisation-blueprint/hierarchy` | `routers.organisation_blueprint` | Yes | All Officials | `root_id: Optional[str]` | `OrganisationHierarchyTreeOut` |
| **30** | `GET` | `/api/v1/organisation-blueprint/unit/{unit_id}` | `routers.organisation_blueprint` | Yes | All Officials | `unit_id: str` | `UnitDetailsResponse` |
| **31** | `GET` | `/api/v1/organisation-blueprint/filter-options` | `routers.organisation_blueprint` | Yes | All Officials | None | `OrganisationFilterOptionsOut` |
| **32** | `GET` | `/api/v1/organisation-blueprint/historical-mappings` | `routers.organisation_blueprint` | Yes | All Officials | None | `List[HistoricalOrganisationMappingOut]` (19 items) |
| **33** | `GET` | `/api/v1/organisation-blueprint/kpis` | `routers.organisation_blueprint` | Yes | All Officials | None | `OrganisationKPIsOut` |
| **34** | `GET` | `/api/v1/organisation-blueprint/exceptions` | `routers.organisation_blueprint` | Yes | Chief Engineers, Auditors | `status_filter: Optional[str]` | `List[DataQualityMappingExceptionOut]` |
| **35** | `POST` | `/api/v1/organisation-blueprint/resolve-exception` | `routers.organisation_blueprint` | Yes | Chief Engineers | Resolution payload | `DataQualityMappingExceptionOut` |

---

## 3. Data Flow & Security Validation

1. **Authentication Token Lifecycle:** JWT tokens are issued with a 24-hour expiration containing user ID, role code, and geographical jurisdiction parameters (`district_id`, `wing_code`).
2. **Contractor Data Isolation:** Any query issued by a user with role `CONTRACTOR` automatically appends `filter(Project.contractor_id == current_user.contractor_id)` to prevent cross-bidder data leakage.
3. **Zonal Jurisdiction Scoping:** Superintending Engineers (SE) and Divisional Engineers (DE) queries automatically filter projects by their assigned geographical division.
4. **Client State Resilience:** If backend API services undergo temporary restart, the frontend gracefully falls back to cached in-memory structures to maintain uninterrupted situational awareness for high-level officials.

