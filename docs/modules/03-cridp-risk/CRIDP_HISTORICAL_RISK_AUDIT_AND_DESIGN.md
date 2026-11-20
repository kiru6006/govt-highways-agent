# TN-HDOS: Statewide CRIDP Historical Work Risk Intelligence & Previous Work Investigation Architecture

## 1. Statutory Context & Master Objectives

Under **G.O.(Ms) No. 105, Highways and Minor Ports (HN.2) Department, dated 02.07.2025**, the Comprehensive Road Infrastructure Development Programme (CRIDP) sanctions statewide annual road renewal, widening, strengthening, and riding quality improvements.

The primary objective of the **Statewide CRIDP Historical Work Risk Intelligence Dashboard** (`#/cridp-risk-intelligence`) is to empower Chief Engineers, Superintending Engineers, and Audit Specialists to systematically answer five critical questions before sanctioning any new renewal proposal:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                   THE 5 CRITICAL PREVIOUS-WORK INVESTIGATION QUESTIONS                    │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. What work was previously sanctioned or completed on this road stretch?                │
│    -> Retrieval of canonical road identity, chainage interval, work type, completion MB  │
│ 2. What went wrong, or what remains unverified, in the previous work?                    │
│    -> Problem taxonomy: Premature wear, unverified completion, delay, cost overrun, etc. │
│ 3. What caused the problem, and what evidence supports that conclusion?                  │
│    -> Critical-path root cause: Contractor-controlled, Dept-controlled, LA, Utility, Court│
│ 4. How is the issue currently being managed, by whom, and within what deadline?          │
│    -> Corrective action status, responsible authority, escalation level, closure evidence│
│ 5. Should the proposed new work proceed, require modification, or be referred?           │
│    -> Recorded decision with statutory citation, delegation rule, and justification      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Source Document Mapping & Ingestion Model

### Source A: `CRIDP-2025-2026-Annexures-.pdf` (G.O. Ms. No. 105)
Contains the scheduled annual proposals for State Highways (SH), Major District Roads (MDR), Other District Roads (ODR), and Special Component Plan (SCP):
- **Serial Number & Job Code**: Canonical reference identifier.
- **Administrative Location**: Wing, Circle, Division, Sub-Division, Section, Legislative Constituency, District.
- **Work Specification**: Road classification, start chainage, end chainage, proposed length (km), proposed treatment (SDBC, BM/BC, Reconstruction).
- **Financial Allocation**: Estimated outlay in ₹ Lakhs, sanctioned budget head.

### Source B: `Predefined Report (1).csv` (164 Columns, 23,926 Records)
Historical execution register tracking physical-financial progress and milestones:
- **Identification**: `works_code`, `works`, `scheme`, `road_name`, `project_length`.
- **Administrative**: `wing`, `circle`, `division`, `district`, `c_go_number`, `d_go_date`.
- **Financial Dynamics**: `n_as_amount`, `n_ts_amount`, `n_rts_amount`, `contract_value`, `expenditure_incurred`, `last_payment_made`.
- **Milestone & Schedule Progress**: `work_commencement_date`, `probable_dompletion_date`, `fixed_end_work_date`, `physical_progress`, `length_completed`.
- **Delay Analytics**: `DelayStatus`, `Forcasted_delay`, `overall_days_delay_current_stage`, `agreement_work_25_delay_days` to `100_delay_days`.
- **Blocker Categorisation**: `issue_land_acquisition`, `issue_forest_clearance`, `issue_shifting`, `issue_railway_approvals`, `issue_wrd_approvals`, `issue_court_approvals`.

---

## 3. The 12 Canonical Investigation Scenarios (Explicitly Labelled SIMULATED)

All test scenarios are grounded in real Tamil Nadu highway corridors, with simulated risk conditions for training and audit demonstration:

| ID | Scenario Title | Corridor & Stretch | Problem Investigated | Root Cause Category | Management Plan & Action Owner | Proposed Work Verdict |
|:---|:---|:---|:---|:---|:---|:---|
| **SCN-01** | **Premature Renewal** | SH-49 ECR (Km 23/0 - 28/0) | Renewed 2.7 yrs ago; proposed again for renewal | Contractor-controlled / Material defect | SE Chengalpattu ordered core testing under Defect Liability | **FLAGGED FOR REJECTION** |
| **SCN-02** | **Unverified Completion** | SH-75 Madurai Ring (Km 10/0 - 18/0) | 100% physical progress recorded without completion certificate | Documentation deficit | DE Madurai to inspect measurement book & submit CC | **HOLD PENDING EVIDENCE** |
| **SCN-03** | **Partial Chainage Overlap** | SH-49 ECR (Km 13/0 - 18/0) | Overlaps 2.0 km with work completed Aug 2023 | Planning duplication | Truncate proposal to Km 15/0 - 18/0 (3.0 km) | **MODIFY CHAINAGE** |
| **SCN-04** | **Contractor Delay** | SH-162 Coimbatore Bypass (Km 12/0 - 22/0) | 280 days delay; plant & machinery unmobilized | Contractor-controlled | Clause 60 notice issued; revised recovery schedule submitted | **HOLD PENDING RESOLUTION** |
| **SCN-05** | **Departmental Delay** | SH-63 Thanjavur (Km 35/0 - 45/0) | G.O. and alignment drawing released 9 months late | Department-controlled | CE (Planning) expedited revised GAD; EoT granted | **ELIGIBLE WITH EOT** |
| **SCN-06** | **Land Acquisition Blocker** | MDR-102 Tambaram (Km 0/0 - 3/2) | 14 commercial parcels unpossessed under Sec 15(1) | Land Acquisition / Revenue | Special DRO conducting Lok Adalat for consent awards | **HOLD PENDING POSSESSION** |
| **SCN-07** | **Utility Shifting Blocker** | SH-15 Ooty Ghat (Km 18/0 - 24/0) | TANGEDCO 110kV HT tower relocation pending | Utility dependency | Deposit sanctioned; joint shutdown scheduled | **HOLD PENDING CLEARANCE** |
| **SCN-08** | **High Court Stay** | ODR-045 Thiruporur (Km 2/0 - 4/5) | Madras HC interim stay on wetland parcel (WP 4812/26) | Litigation | Special Govt Pleader filed counter to vacate stay | **STATUTORY PROHIBITION** |
| **SCN-09** | **Physical-Financial Mismatch** | SH-09 Cuddalore (Km 40/0 - 48/0) | 88% expenditure recorded for 52% verified physical length | Reconciliation required | Accounts Officer & DE ordered joint field remeasurement | **REFER FOR FINANCIAL AUDIT**|
| **SCN-10** | **Repeated Quality Failure** | MDR-314 Melur Link (Km 8/0 - 16/0) | Rutting & fatigue cracking within 14 months of overlay | Quality defect / Subgrade moisture | HRS Guindy geotech study; pavement reconstruction plan | **SEEK ENGINEERING EXCEPTION**|
| **SCN-11** | **Multi-Scheme Conflict** | SH-15 ADB Corridor (Km 15/0 - 25/0) | Proposed under CRIDP while active under CKICP EPC | Cross-scheme overlap | CE (CKICP) verified active ADB EPC contract | **FLAGGED FOR REJECTION** |
| **SCN-12** | **Unresolved Corrective Action** | SH-110A Medavakkam (Km 0/0 - 8/0) | Open audit observation on uncompacted subgrade layers | Quality & compliance | SE directed destructive core extraction before approval | **HOLD PENDING AUDIT CLOSURE**|

---

## 4. The 11-Tab Dashboard Structure (`#/cridp-risk-intelligence`)

1. **Statewide Risk Overview**: 14 dynamic KPIs, multi-factor filters, risk distribution charts.
2. **Previous Work Investigation**: The deep 5-question Dossier with interactive proposal selector.
3. **Five-Year Renewal Verification**: Chainage and statutory screening with G.O. 11/29 delegation checks.
4. **Duplicate & Overlap Detection**: Deterministic interval comparison and union math.
5. **Delay & Root Cause Analysis**: Planned vs actual milestones, critical path breakdown.
6. **Contractor Performance & Accountability**: Responsibility matrix, contractor risk scorecards.
7. **Financial Exposure & Leakage Prevention**: Avoidable expenditure ledger, non-accusatory methods.
8. **Corrective Action & Mitigation Tracker**: Status pipeline (OPEN $\rightarrow$ CLOSED), owner and deadline tracking.
9. **Year-Wise Eligible Road Length**: Multiannual eligibility analysis (FY 2026-27 to 2030-31).
10. **Data Quality & Verification**: 12-category anomaly audit, source provenance log.
11. **Reports & AI Insights**: Evidence-aware Ask AI assistant answering the 10 mandated questions.

