# TN-HDOS | SoR & Cost Intelligence Implementation Progress Register

**Statutory Document Reference:** Tamil Nadu Schedule of Rates (SoR) 2026–2027, Volume I (w.e.f. 13/11/2026)  
**Governing PRD / Spec:** `PRICE.md` (Schedule of Rates, Work Estimation & Cost Intelligence - SoR-WECI)  
**Target Platform:** TN-HDOS (`govt-highways-agent`)  
**Status Date:** November 19, 2026  

---

## 1. Phase Progress Checklist

| Phase | Description | Status | Evidence / Artifacts |
|---|---|---|---|
| **Phase 1** | Database Models, Pydantic Schemas & Deterministic Seed Data | **COMPLETED** | `models.py`, `schemas.py`, `seed_sor_2026_data.py` (Seeded 30 items, 7 rules, 2 estimates, 2 BOQs, 2 recon, 3 anomalies) |
| **Phase 2** | Deterministic Calculation Engine, Business Rules & REST APIs | **COMPLETED** | `sor_calculation_service.py`, `sor_weci.py` router mounted at `/api/v1/sor-weci` |
| **Phase 3** | Automated Pytest Suite (Unit, Decimal Math, Rules & Limits) | **COMPLETED** | `test_sor_weci.py` (15 tests passing 100%) |
| **Phase 4** | Frontend UI: 3 Screens (`/sor-catalogue`, `/work-estimator`, `/cost-audit`) | **COMPLETED** | `SoRCataloguePage.tsx`, `WorkEstimatorPage.tsx`, `CostAuditPage.tsx`, `fallbackSoR.ts`, `Sidebar.tsx`, `App.tsx` |
| **Phase 5** | Regression Verification, Documentation, Git Commit & Push | **COMPLETED** | `pytest` 100%, `tsc && vite build` (45s, 0 errors), `README.md`, Git commit & push |
| **Phase 6** | Rate Calculator (`/rate-calculator`): 10 Modes, Pure Decimal Math, 25 Statutory Tests, Drawer Breakdown & Sheet | **COMPLETED** | `RateCalculatorPage.tsx`, `sor_calculation_service.py`, `rate_calculator.py`, `test_rate_calculator.py` (25/25 passing) |
| **Phase 7** | PRICE2.md Phase 1: Dedicated Reconciliation & Variations Screen (`/reconciliation`): 5-Stage Lineage, G.O. 11 Variations Ledger, MORTH QC & G.O. 84 Gate | **COMPLETED** | `ReconciliationPage.tsx`, `SoRContractVariation`, `SoRQCTestLink`, `test_sor_weci.py` (19/19 passing) |
| **Phase 8** | PRICE2.md Phase 2: Approvals Queue & Statutory Delegation Matrix Screen 5 (`/approvals-audit`): G.O. 11 & G.O. 29 | **COMPLETED** | `ApprovalsAuditPage.tsx`, `SoRApprovalTask`, `SoRDelegationRule`, `test_20`, `test_21` passing |
| **Phase 9** | PRICE2.md Phase 3: Bounded AI Investigation Assist (`FR-09`, `UC-32`): Cited PDF page, non-binding advice & disclaimer | **COMPLETED** | `/ai/investigate-finding`, `test_22` passing, drawer integrated in Approvals and Cost Audit screens |
| **Phase 10** | PRICE2.md Phase 4: SoR Ingestion & Document Parser Workbench Screen 6 (`/sor-ingestion`): PDF page range, OCR scrutiny, side-by-side editor & publish gate | **COMPLETED** | `SoRIngestionPage.tsx`, `SoRIngestionJob`, `SoRStagedItem`, `SoRIngestionDiscrepancy`, `test_23` passing |
| **Phase 11** | PRICE2.md Phase 5: Navigation, Transfer CTA from Rate Calculator to Work Estimator, 23/23 tests passing, production build verified | **COMPLETED** | Full suite regression pass (23/23 in `test_sor_weci.py`, 25/25 in `test_rate_calculator.py`), `tsc && vite build` (11.32s, 0 errors) |

---

## 2. Phase 1 & 2 Execution Details
- [x] Initialized `implementation.md` progress tracker.
- [x] Added SQLAlchemy database models in `backend/app/models.py` (`SoRVersion`, `SoRItem`, `SoRAllowanceRule`, `SoREstimate`, `SoREstimateLine`, `SoRBOQItem`, `SoRReconciliationEntry`, `SoRAnomalyFinding`, `SoREvidenceLink`, `SoRAuditEvent`).
- [x] Added Pydantic schemas in `backend/app/schemas.py`.
- [x] Created and executed deterministic seed script `backend/app/seed_sor_2026_data.py`.
- [x] Wired `seed_sor_master_data()` into `main.py` and `tests/conftest.py`.
- [x] Created `backend/app/services/sor_calculation_service.py` with exact `Decimal` (`ROUND_HALF_UP`) arithmetic:
  - Lead conveyance calculation (initial slab + subsequent slabs).
  - Head load deduction/calculation (10m free lead, 2m free lift, 100m rounding).
  - Corporation allowances (+10% on Chennai/Madurai/CBE/Hosur, +5% on others for Works/Labour).
  - Night work (+25% strictly on Labour only with verified tender clause).
  - Bridge 3% provisional allowance (>50% bridge cost share, structural items only, hard block on drains/culverts/repairs).
  - Strict GST & tax separation (18% applied separately at summary, no tax compounding).
- [x] Created `backend/app/routers/sor_weci.py`:
  - `GET /versions`
  - `GET /items` (search, category, annexure filter, pagination)
  - `GET /items/{unique_code}`
  - `GET /allowance-rules`
  - `POST /estimates` (create estimate with lines & auto-calculate trace)
  - `POST /estimates/{id}/calculate` (re-calculate with trace)
  - `POST /estimates/{id}/boq/generate`
  - `GET /reconciliation/{project_id}`
  - `GET /intelligence/findings`
  - `POST /intelligence/findings/{id}/review` (10-point review disposition)
  - `GET /intelligence/benchmarks`
  - `GET /audit/events`
- [x] Mounted `/sor-weci` in `backend/app/main.py`.

---

## 3. Phase 3 Automated Test Suite Execution
- [x] Created `backend/tests/test_sor_weci.py` with 15 test cases:
  1. `test_01_sor_version_and_metadata`
  2. `test_02_sor_items_retrieval_and_filtering`
  3. `test_03_tax_exclusive_basic_rates`
  4. `test_04_statutory_allowances_corporation`
  5. `test_05_night_work_labour_only_guardrail`
  6. `test_06_bridge_3pct_provisional_allowance_success`
  7. `test_07_bridge_3pct_guardrail_drain_culvert_block`
  8. `test_08_conveyance_slab_calculations`
  9. `test_09_estimate_creation_and_deterministic_totals`
  10. `test_10_boq_generation_from_estimate`
  11. `test_11_mb_billing_reconciliation_variance_detection`
  12. `test_12_structured_10_point_anomaly_finding_review`
  13. `test_13_cost_benchmarking_and_comparisons`
  14. `test_14_immutable_audit_log_append`
  15. `test_15_regression_existing_endpoints_intact`
- [x] Verified 100% test pass.

---

## 4. Phase 4 Frontend Implementation (Lean 3-Page Structure)
- [x] TypeScript interfaces in `frontend/src/types/index.ts` (`SoRVersionItem`, `SoRItem`, `SoRAllowanceRule`, `SoREstimate`, `SoREstimateLine`, `SoRBOQItem`, `SoRReconciliationEntry`, `SoRAnomalyFinding`, `SoRBenchmarkItem`, `SoRAuditEvent`).
- [x] Resilient offline fallback in `frontend/src/data/fallbackSoR.ts`.
- [x] API service client `sorAPI` in `frontend/src/services/api.ts`.
- [x] Screen 1: `frontend/src/pages/SoRCataloguePage.tsx` (`/sor-catalogue`) with 4 tabs:
  - Highways Items pp. 311–352
  - General Notes 1–10 & Allowances
  - Conveyance & Head Load Slabs (with interactive haulage calculator)
  - Common / PWD Cross-References
- [x] Screen 2: `frontend/src/pages/WorkEstimatorPage.tsx` (`/work-estimator`) with 3 tabs:
  - Estimate & BOQ Lines (deterministic cost engine, tender schedule generator)
  - Statutory Allowance & Rule Check (hard gates for bridge allowance, night work tender clause)
  - MB & Bill Variance Reconciliation (3-way cross-verification: BOQ vs MB vs Billed)
- [x] Screen 3: `frontend/src/pages/CostAuditPage.tsx` (`/cost-audit`) with 3 tabs:
  - Rate & Cost Benchmarking (canonical vs statewide billed rates)
  - Exception & Variance Queue (10-point structured anomaly reviews with neutral states)
  - Immutable Audit Trail (WORM append-only event ledger)
- [x] Navigation entries mounted in `frontend/src/components/Sidebar.tsx` under Domain 4: Commercial & Resource Mgmt.
- [x] Routes wired in `frontend/src/App.tsx`.
- [x] Production build verified (`tsc && vite build`: built in 45.35s with 0 errors).

---

## 5. Phase 6 Rate Calculator (`/rate-calculator`) Implementation Details
- [x] **Database & Models (`backend/app/models.py`)**:
  - `CalculationSession`, `CalculationLine`, `CalculationAdjustment`, `CalculationResult`, `CalculationAudit`.
- [x] **Pydantic Schemas (`backend/app/schemas.py`)**:
  - `RateCalculateRequest`, `RateCalculateResponse`, `BatchCalculateRequest`, `BatchCalculateResponse`, `RateValidationRequest`, `RateValidationResponse`, `RateExportRequest`, `RateExportResponse`.
- [x] **Calculation Service Engine (`backend/app/services/sor_calculation_service.py`)**:
  - Pure Python `Decimal` (`ROUND_HALF_UP`) math.
  - Implemented all 10 engineering modes:
    1. Material Cost: $Q \times \text{Rate}$
    2. Labour Cost: $\text{Workers} \times \text{Days} \times \text{Rate}$
    3. Work Item Cost: $Q \times \text{Work Rate}$
    4. Equipment Hire: $\text{Duration} \times \text{Hire Rate}$
    5. Road Furniture: $Q \times \text{Item Rate}$
    6. Survey and DPR: $Q / \text{km} \times \text{Rate}$
    7. Plantation: $Q \times \text{Rate}$
    8. Quantity Calculator: Geometric formulas (Road area $L \times W$, Layer volume $L \times W \times \text{thick mm} / 1000$, Embankment earthwork, Concrete, Drains)
    9. Conveyance & Head Load: Table-I mechanical transport conveyance rates (1st km ₹140.00/cum, subsequent ₹18.50/cum/km), Ghat / Hill roads (+20%), Head load lift (>2m @ ₹13.00/cum/m)
    10. Combined Multi-Item Calculation Sheet: Add, clone, remove, recalculate, reset, export, and transfer to Estimate/BOQ
  - Negative quantity hard rejection.
  - Night work allowance: +25% strictly restricted to Labour component with tender clause validation.
  - Bridge 3% provisional allowance: Admissible strictly for bridge structural items ($\ge 50\%$ cost share); hard block on drains, culverts, retaining walls, and minor repairs.
- [x] **FastAPI Router (`backend/app/routers/rate_calculator.py`)**:
  - Mounted at `/api/v1/sor`:
    - `GET /publications`
    - `GET /items`
    - `GET /items/{itemCode}`
    - `GET /rules`
    - `POST /calculate`
    - `POST /calculate-batch`
    - `POST /validate`
    - `POST /export`
- [x] **Seeded Official Master Items (`backend/app/seed_sor_2026_data.py`)**:
  - Seeded official Annexure items: `M-0093` (HBGS 90mm @ ₹544/cum), `L-0099` (Heat Master Operator @ ₹1,001/day), `W-0055` (Earthwork SS20B @ ₹88.10/cum), `H-0001` (Excavator @ ₹2,450/hr), `RF-0001` (Signboard @ ₹3,850/sqm), `SV-0001` (Survey @ ₹18,500/km), `PL-0001` (Plantation @ ₹1,250/plant), `QC-0001` (Core cutter @ ₹450), `C-0001` (Conveyance 1st km @ ₹140.00).
- [x] **Automated Test Suite (`backend/tests/test_rate_calculator.py`)**:
  - 25 automated tests covering all statutory scenarios from Section 17, running at 100% pass rate.
- [x] **Frontend Screen (`frontend/src/pages/RateCalculatorPage.tsx`)**:
  - 10 Calculator Modes in compact tabs.
  - Live calculation cards with detailed formula preview.
  - Step-by-Step 18-Point Calculation Breakdown Modal Drawer.
  - Multi-Item Calculation Sheet with Add, Clone, Remove, Recalculate, Reset, CSV/JSON Export, and Transfer to Estimate/BOQ.
- [x] **Navigation & Production Build**:
  - Mounted `/rate-calculator` in `frontend/src/App.tsx`.
  - Added Rate Calculator under Domain 4 in `frontend/src/components/Sidebar.tsx`.
  - Frontend production build verified (`tsc && vite build`: built in 18.38s with 0 errors).

---

## 6. Phase 7 PRICE2.md Phase 1: Dedicated Reconciliation & Variations Screen 4 (`/reconciliation`)
- [x] **Database & Models (`backend/app/models.py`)**:
  - `SoRContractVariation`: Project ID, Estimate ID, variation number, item code, original vs proposed revised qty, qty delta, original vs proposed rate, financial impact (₹ Cr), justification category, G.O. 11 delegation routing authority (`DE <= ₹50L`, `SE <= ₹7Cr`, `CE > ₹7Cr`).
  - `SoRQCTestLink`: MORTH specification clauses, equipment codes (`QC-0001` core cutter, `QC-0002` compression machine), chainage location, lab test certificate number, test result vs benchmark, and compliance status.
- [x] **Pydantic Schemas (`backend/app/schemas.py`)**:
  - `SoRContractVariationCreate`, `SoRContractVariationOut`, `SoRQCTestLinkOut`, `BillValidationRequest`, `BillValidationResult`, `LineageNodeOut`, `ReconciliationLineageOut`.
- [x] **FastAPI Router Endpoints (`backend/app/routers/sor_weci.py`)**:
  - `GET /api/v1/sor-weci/reconciliation/{project_id}`
  - `GET /api/v1/sor-weci/reconciliation/lineage/{project_id}`: Full 5-stage lineage flow (`SOR_MASTER` $\rightarrow$ `ESTIMATE` $\rightarrow$ `BOQ` $\rightarrow$ `MB` $\rightarrow$ `BILL`).
  - `GET /api/v1/sor-weci/reconciliation/variations/{project_id}`
  - `POST /api/v1/sor-weci/reconciliation/variations`: Submits contract variation with financial delegation routing under G.O. 11.
  - `GET /api/v1/sor-weci/reconciliation/qc-links/{project_id}`
  - `POST /api/v1/sor-weci/reconciliation/bills/{bill_id}/validate`: Checks duplicate line claims, rate spikes (>5% excess), and unrecorded MB quantities.
- [x] **Seeded Test Data (`backend/app/seed_sor_2026_data.py`)**:
  - Seeded contract variations `VAR-2026-001` (DBM leveling course, +60 cum, SE routing) and `VAR-2026-002` (Earthwork side drain, +800 cum, DE routing).
  - Seeded QC lab test records `QC-TEST-001` (MORTH Section 500 Cl. 505.4, 99.4% density) and `QC-TEST-002` (MORTH Section 1700 Table 1700-4, 39.8 MPa strength).
- [x] **Automated Tests (`backend/tests/test_sor_weci.py`)**:
  - `test_16_reconciliation_lineage_traceability` (passes 100%)
  - `test_17_contract_variation_delegation_routing` (passes 100%)
  - `test_18_bill_validation_duplicate_and_spike_detection` (passes 100%)
  - `test_19_qc_test_links_compliance` (passes 100%)
- [x] **Frontend Screen (`frontend/src/pages/ReconciliationPage.tsx`)**:
  - Tab 1: Estimate-to-Bill Lineage Explorer with interactive 5-stage progression card, lifecycle table, and live RA bill validation sandbox.
  - Tab 2: Revised Estimates & Variations Ledger with "Propose Contract Variation" modal dialog and live G.O. 11 threshold calculator.
  - Tab 3: Maintenance & QC Gate Check with MORTH equipment/lab records and G.O. 84 5-Year Surface Renewal Policy compliance badge.
- [x] **Navigation & Production Build**:
  - Mounted `/reconciliation` and `/sor-weci/reconciliation` in `frontend/src/App.tsx`.
  - Added "MB & Bill Reconciliation" under Domain 4 in `frontend/src/components/Sidebar.tsx`.
  - Verified frontend production build (`tsc && vite build`: built in 22.81s with 0 errors).

---

## 7. PRICE2.md Phases 2, 3, 4 & 5 Implementation Details

### A. Screen 5: Approvals Queue & Statutory Delegation Matrix (`/approvals-audit`)
- **Database Models (`backend/app/models.py`)**:
  - `SoRApprovalTask`: Stores tasks for technical sanction, contract variations, rate exceptions, and bill payment clearances with statutory tier tagging (`DE`, `SE`, `CE`, `COT_FINANCE`).
  - `SoRDelegationRule`: Codifies statutory delegation rules under G.O. (Ms) No. 11 dt 21.01.2022 (Technical Sanction: DE $\le \text{₹}50\text{L}$, SE $\le \text{₹}7.00\text{Cr}$, CE $> \text{₹}7.00\text{Cr}$) and G.O. (Ms) No. 29 dt 03.03.2022 (Tender Excess: DE 0% up to ₹50L, SE 5% up to ₹1.00 Cr, CE 0% up to ₹6.00 Cr, COT 10% up to ₹100.00 Cr).
- **FastAPI Endpoints (`backend/app/routers/sor_weci.py`)**:
  - `GET /api/v1/sor-weci/approvals`: Filterable approval tasks queue.
  - `POST /api/v1/sor-weci/approvals/{task_id}/decision`: Executes statutory approval, return for correction, or escalation, creating an append-only WORM audit record.
  - `GET /api/v1/sor-weci/delegation-matrix`: Codified statutory delegation rules table.
- **Frontend Screen (`frontend/src/pages/ApprovalsAuditPage.tsx`)**:
  - Tab 1: Pending Approvals Queue with authority tier filters and "Execute Decision" modal.
  - Tab 2: Statutory Delegation Matrix table showing official limits and mandatory conditions.
  - Tab 3: Immutable Append-Only WORM Audit Trail displaying officer cadres and change summaries.

### B. Bounded AI Investigation Assist (FR-09, UC-32)
- **FastAPI Endpoint (`backend/app/routers/sor_weci.py`)**:
  - `POST /api/v1/sor-weci/ai/investigate-finding`: Grounded strictly in Tamil Nadu SoR 2026–2027 Volume I and G.O. 11/29. Returns `notice_badge: "AI-Assisted (Verify Before Approval)"`, exact source PDF page and printed page citations, and statutory disclaimer. Pure calculations and authoritative decisions remain 100% deterministic and non-delegable to AI.
- **Frontend Slide-Over Drawer**:
  - Embedded in both `ApprovalsAuditPage.tsx` and `CostAuditPage.tsx` with one-click trigger.

### C. Screen 6: SoR Ingestion & Document Parser Workbench (`/sor-ingestion`)
- **Database Models (`backend/app/models.py`)**:
  - `SoRIngestionJob`: Ingestion jobs for official SoR schedules with page ranges (`311-352`), extraction progress, and publication status.
  - `SoRStagedItem`: Extracted items staged for human scrutiny, rate confirmation, and canonical unit verification.
  - `SoRIngestionDiscrepancy`: Flags G.O.-referenced items (`M-0127`, `M-0128`, `M-2853`) and OCR ambiguities that must be resolved prior to publication.
- **FastAPI Endpoints (`backend/app/routers/sor_weci.py`)**:
  - `GET /api/v1/sor-weci/ingestion/jobs`, `POST /api/v1/sor-weci/ingestion/jobs`
  - `GET /api/v1/sor-weci/ingestion/jobs/{id}/staged-items`
  - `PATCH /api/v1/sor-weci/ingestion/staged-items/{item_id}`
  - `GET /api/v1/sor-weci/ingestion/jobs/{id}/discrepancies`
  - `POST /api/v1/sor-weci/ingestion/jobs/{id}/publish`: Hard gate blocking publication if open discrepancies exist.
- **Frontend Screen (`frontend/src/pages/SoRIngestionPage.tsx`)**:
  - Source PDF schedule viewer with printed pages 311–352 reference.
  - Parser extraction confidence score cards and open discrepancies alert.
  - Side-by-side row editor with modal scrutiny for rates and units.
  - Statutory publication gate modal with data steward authorization.

### D. Phase 5 Navigation & Transfer Integration
- Connected "Transfer to Estimate / BOQ" in `RateCalculatorPage.tsx` to automatically package active calculation sheet items and navigate to `/work-estimator`.
- Registered routes `/approvals-audit` and `/sor-ingestion` in `App.tsx` and sidebar navigation links in `Sidebar.tsx`.
- Automated tests expanded to 23 comprehensive tests in `test_sor_weci.py` (all passing).
- Verified production frontend build (`npm run build`: 0 errors).

