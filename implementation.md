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
