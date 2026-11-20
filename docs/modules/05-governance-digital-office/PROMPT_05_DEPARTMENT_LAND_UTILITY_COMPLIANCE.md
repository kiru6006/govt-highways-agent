# TN-HDOS Prompt 05 Implementation & Compliance Document
## Departmental Coordination, Statutory Clearances, Land Acquisition & Utility Intelligence

**Document Version**: 1.0  
**Status**: Certified Complete & Verified (Automated Tests 18/18 Passing, 98/98 Suite Passing)  
**Modules**: `#/departments`, `#/land-utility`  
**Governing Acts**:
- Tamil Nadu Highways Act, 2001 (TN Act 34/2002) - Sections 15(2), 15(1), 19(1), 19(2), 20
- Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 30/2013)
- Forest (Conservation) Act, 1980 / Van (Sanrakshan Evam Samvardhan) Adhiniyam
- Electricity Act, 2003 & Central Electricity Authority (Technical Standards for Construction of Electrical Plants and Electric Lines) Regulations
- Tamil Nadu Transparency in Tenders Act, 1998 (TNTT Act)

---

## 1. Executive Summary & Objective

Prompt 05 implements two fully functional, interconnected, and operational executive workspaces in TN-HDOS:

1. **Departmental Coordination Workspace (`#/departments`)**: Provides the Minister, Principal Secretary, and Chief Engineers with real-time tracking of interdepartmental dependencies across 10 statutory line departments, SLA tracking on 40 statutory clearance applications, and AI cross-departmental bottleneck and deadlock intelligence.
2. **Land Acquisition & Utility Intelligence Workspace (`#/land-utility`)**: Tracks statutory land acquisition for 50 geocoded land parcels across the 8-stage lifecycle (Identification → Survey → Sec 15(2) Notification → Objections → Sec 15(1) Gazette → Sec 19(1) Award → Compensation Disbursal → Physical Possession Handover), alongside 25 utility shifting assets across TANGEDCO, TWAD Board, Telecom/BSNL, and Municipal Corporations.

---

## 2. Shared Synthetic Data Foundation & Provenance

In strict compliance with Prompt 05 specifications, data is unified across existing project identifiers (`PRJ-TN-2026-001` through `PRJ-CKICP-002`, `PRJ-TNRSP-001` through `PRJ-TNRSP-003`). All records are clearly tagged with:
- `data_mode: mock`
- `data_status: Seeded Demo`
- `source_type: synthetic`
- `generated_at: ISO-8601 UTC timestamp`

### Seeded Inventory:
- **10 Participating Departments**:
  - Highways and Minor Ports Department (Executing)
  - Revenue and Disaster Management Department (Land Acquisition & Valuation)
  - Tamil Nadu Generation and Distribution Corporation - TANGEDCO (Power distribution, HT/LT lines, shutdown sanctions)
  - Tamil Nadu Water Supply and Drainage Board - TWAD (Mains and distribution pipeline relocation)
  - Department of Environment, Climate Change and Forests (Stage-I/II forest clearances, tree felling permissions)
  - Southern Railway / Railway Board (ROB/RUB GAD clearances and safety inspections)
  - Public Works Department - Water Resources Department / WRD (River bridges, canal crossings, irrigation NOCs)
  - Municipal Administration and Water Supply - MAWS (Urban stormwater drains, water connections, streetlights)
  - Greater Chennai Traffic Police / Tamil Nadu State Police (Traffic diversion sanctions, heavy vehicle permits)
  - Ministry of Communications / Telecom Grid (Optical Fiber Cable ducts, BSNL / BharatNet relocations)
- **50 Land Parcels**: Survey numbers, joint pattadars, private vs government extents, Sec 15/19 notifications, compensation assessed/paid, and possession statuses.
- **90 Land Acquisition Workflows**: Chronological stage records, Treasury payment vouchers, and possession handover certificates.
- **25 Utility Shiftings**: Asset counts (poles, km pipes, km OFC), estimated and sanctioned costs, work order statuses, progress %, and engineer verification certificates.
- **28 Department Dependencies**: Requesting vs target line departments, days pending, SLA standards, criticality, and escalation tiers.
- **40 Statutory Approvals**: Submission dates, SLA target days, overdue tracking, statutory flags, and review remarks.
- **15 Department AI Findings**: Algorithmic detection of multi-agency interlocks, compensation Treasury delays, and critical path blockers.
- **20 Supporting Document References**: Government Orders (G.O.), Gazettes, Joint Inspection Reports (JIR), Treasury cheque tokens, and court orders.

---

## 3. Architecture & Data Models

Implemented in `backend/app/models.py` and persisted in SQLite/PostgreSQL:

### Extended Models:
- `Department`: Added `category`, `responsible_minister`, `responsible_secretary`, `head_of_department`, `nodal_officer_name`, `nodal_officer_designation`, `nodal_officer_phone`, `jurisdiction`, `sla_standard_days`.
- `DepartmentDependency`: Added `dependency_code`, `work_package_id`, `responsible_officer`, `criticality`, `date_raised`, `days_pending`, `escalation_level`, `recommended_action`, `supporting_document_ref`, `upstream_dependency_id`, `downstream_dependency_id`.
- `Approval`: Added `work_package_id`, `submitting_department_id`, `approving_department_id`, `assigned_officer`, `submission_date`, `sla_target_days`, `overdue_days`, `review_remarks`, `document_ref`, `sla_status`.
- `LandParcel`: Added `landowner_name`, `acquisition_stage`, `legal_provision`, `compensation_status`, `possession_date`, `dispute_details`, `geo_lat`, `geo_lng`, `blocking_project_milestone`.

### Newly Created Models:
- `UtilityShiftingRecord` (`utility_shiftings`): Tracks owning agency, category, asset counts, costs, work order status, progress %, verification status, verifying engineer, and blocking milestones.
- `LandAcquisitionWorkflowRecord` (`land_acquisition_workflows`): Full audit of stage transitions from identification to handover.
- `DepartmentAIFinding` (`department_ai_findings`): Advisory intelligence on cross-department deadlocks.
- `SupportingDocumentReference` (`supporting_document_references`): Referential integrity for government orders and certificates.

---

## 4. API Endpoints Specification

Implemented in `backend/app/routers/departments.py` and `backend/app/routers/land_utility.py`:

| Method | Path | Description | Access & Validation |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/departments/overview` | 8 Overview KPIs, SLA turnaround averages, critical blockers | Authenticated |
| `GET` | `/api/v1/departments/directory` | Connected directory with nodal officers, jurisdiction, contacts | Category & search filters |
| `GET` | `/api/v1/departments/dependencies` | Register of 28 dependencies with SLA status and overdue days | Project, status, criticality filters |
| `POST` | `/api/v1/departments/dependencies/{id}/action` | Update status, escalation level, and coordination remarks | RBAC enforced; logs `AuditEvent` |
| `GET` | `/api/v1/departments/approvals` | Register of 40 statutory approvals with SLA tracking | SLA status & approving dept filters |
| `POST` | `/api/v1/departments/approvals/{id}/action` | Record approval decision (APPROVED/REJECTED/MORE_INFO) | Strict RBAC: Contractor rejected with 403 |
| `GET` | `/api/v1/departments/ai-intelligence` | 15 AI bottleneck findings with delay and cost impacts | Filterable by project |
| `GET` | `/api/v1/land-utility/overview` | Combined 10 Land KPIs & 8 Utility KPIs | Total sq.m, compensation ₹ Cr, utility counts |
| `GET` | `/api/v1/land-utility/parcels` | 50 Land parcels under TN Highways Act 2001 Sec 15/19 | Stage, compensation, possession filters |
| `POST` | `/api/v1/land-utility/parcels/{id}/workflow` | Advance stage, disburse compensation, certify possession | Mandates Treasury ref and handover date |
| `GET` | `/api/v1/land-utility/utilities` | 25 Utility shifting records with agency and progress | Agency, status, blocking filters |
| `POST` | `/api/v1/land-utility/utilities/{id}/workflow` | Update progress, work order status, and engineer verification | 100% complete requires verified inspection |
| `GET` | `/api/v1/land-utility/gis/locations` | Geo-coordinates for parcels and utility assets with blocking flags | Geocoded coordinate scatter |
| `GET` | `/api/v1/land-utility/ai-intelligence` | AI Land/Utility bottleneck findings & deadlock alerts | Correlates land, utility, and civil work |

---

## 5. Security, RBAC & State Integrity Constraints

The system implements mandatory negative validation rules tested and enforced at the API layer:

1. **Contractor Statutory Clearance Restriction**:
   Contractors cannot approve statutory approvals or sign off on land acquisition/possession. Attempting to do so returns `403 Forbidden` (`RBAC Restriction: Contractor personnel cannot approve statutory clearances`).
2. **Possession Handover Date & Certificate Constraint**:
   A land parcel cannot be marked as `POSSESSION_HANDED_OVER` without a valid handover date and revenue certificate reference. Missing date returns `400 Bad Request`.
3. **Treasury Voucher Reference Constraint**:
   Compensation cannot be marked as `PAID` without a valid Treasury payment voucher / cheque reference. Missing voucher reference returns `400 Bad Request`.
4. **Departmental Engineer Verification Constraint**:
   A utility shifting record cannot be marked `COMPLETED` or `100%` physical progress without departmental engineer verification (`VERIFIED`). Unverified completion returns `400 Bad Request`.
5. **AI Advisory Boundary**:
   AI intelligence findings remain strictly advisory. AI cannot approve or mutate records; administrative workflows require human officer credentials.

---

## 6. Section 12 Demonstration Scenario Walkthrough

The platform incorporates a unified demonstration scenario grounded on **CKICP SH-15 Ooty-Gudalur Ghat Corridor** (`PRJ-CKICP-001`, Package `PKG-EPC-01`):

- **Land Parcel `LA-SH15-01`**:
  - Village: Pykara, Nilgiris District. S.No. 142/2A, 142/2B.
  - Extent: 5,500 m² (4,850 m² private agricultural).
  - Award: Section 19(1) award passed for ₹0.85 Cr.
  - Blocker: Compensation disbursement voucher pending 48 days at District Treasury Ooty.
  - Project Impact: Blocks Embankment & Carriageway Formation on Km 14+200.
- **Utility Shifting `UTL-SH15-001`**:
  - Owning Agency: TANGEDCO (Nilgiris EDC).
  - Affected Assets: 48 11kV electrical poles on carriage edge.
  - Blocker: Power shutdown sanction pending 22 days past SLA at Gudalur 66kV substation.
  - Project Impact: Halts rock cutting and shoulder widening.
- **Dependencies `DEP-SH15-001` & `DEP-SH15-002`**:
  - Both escalated to `SECRETARY` tier.
- **Approvals `APP-SH15-001` & `APP-SH15-002`**:
  - Overdue past statutory SLAs.
- **AI Findings `DAIF-SH15-001` & `DAIF-SH15-002`**:
  - Algorithmic alert identifying multi-department deadlock, recommending Principal Secretary interdepartmental coordination meeting.

---

## 7. Automated Test Suite Results

Test execution verified via `./backend/venv/bin/python3 -m pytest tests/`:

```
tests/test_auth_and_rbac.py ......                                       [  6%]
tests/test_ckicp_tnrsp.py ......                                         [ 12%]
tests/test_department_land_utility.py ..................                 [ 30%]
tests/test_engineering_quality_assets.py ..............                  [ 44%]
tests/test_executive_phase2.py ................                          [ 61%]
tests/test_leakage_intelligence.py ..........                            [ 71%]
tests/test_phase17_audit.py .....                                        [ 76%]
tests/test_project_360.py .........                                      [ 85%]
tests/test_reports_workspace.py ..............                           [100%]

====================== 98 passed, 437 warnings in 38.90s =======================
```

**18 Specific Prompt 05 Tests**:
1. `test_departments_overview_kpis`
2. `test_department_directory_10_departments`
3. `test_interdepartmental_dependencies_register_25_records`
4. `test_department_dependency_workflow_action`
5. `test_approval_workflow_and_sla_tracking`
6. `test_department_ai_intelligence_15_findings`
7. `test_land_acquisition_overview_kpis`
8. `test_land_parcel_register_50_parcels`
9. `test_land_parcel_workflow_transition`
10. `test_utility_shifting_overview_and_25_records`
11. `test_utility_workflow_and_engineer_verification`
12. `test_gis_spatial_map_locations`
13. `test_section_12_demonstration_scenario_ckicp_sh15`
14. `test_negative_contractor_cannot_approve_statutory_clearances`
15. `test_negative_parcel_possession_requires_date_and_certificate`
16. `test_negative_compensation_paid_requires_payment_voucher_reference`
17. `test_negative_utility_shifting_requires_verification_before_complete`
18. `test_data_integrity_and_provenance_markers`

---

## 8. Frontend Implementation

- **`frontend/src/pages/DepartmentsPage.tsx`**: Complete interactive console with 8 KPI cards, AI bottleneck drawer, 4 tabs (Directory, Dependency Register, Approval SLA Tracker, Bottleneck Matrix), and Action/Approval modal forms.
- **`frontend/src/pages/LandUtilityPage.tsx`**: Complete interactive console with 18 Land & Utility KPIs, AI deadlock alerts, 4 tabs (Parcel Register, Utility Register, GIS Map Explorer, Demonstration Walkthrough), and workflow advancement modals.
- **Production Build Status**: `npm run build` completed with 0 errors in 6.47s.

