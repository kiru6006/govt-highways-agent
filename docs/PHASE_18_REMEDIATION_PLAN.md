# Phase 18 Remediation Plan: Operational Console Promotion Roadmap

**System:** Tamil Nadu Highways Digital Operating System (TN-HDOS)  
**Target Milestone:** Promotion of Secondary Modules from Placeholder to Fully Operational Consoles  
**Planning Date:** November 6, 2026  
**Implementation Lead:** Principal Government Full-Stack Engineer & Delivery Lead  

---

## 1. Objective and Scope

While Phases 0 through 4 (Architecture, Foundation, Executive Smartboard, Project 360°, Officer Directory), the CKICP/TNRSP-II workspaces, and Phase 12 (Governance Registry) are **100% complete and verified**, 9 secondary functional modules currently render the standardized `PlaceholderModule.tsx` component.

The underlying backend data models, SQLAlchemy entities, and several API routers for these modules already exist in `backend/models.py`. The objective of **Phase 18** is to replace all 9 placeholders with dedicated, responsive operational consoles.

---

## 2. Module Promotion Matrix & Existing Backend Assets

| Module Name | Route | Target Phase | Existing Backend Model / Entity | Planned Operational Console Capabilities |
| :--- | :--- | :---: | :--- | :--- |
| **Leakage & Irregularities** | `/#/leakage` | Phase 14 | `AuditLog`, `AIFinding`, `MBEntry` | Automated detection console for phantom MB entries, bid rigging patterns, and unapproved price escalations. |
| **Inter-Departmental** | `/#/departments` | Phase 5 | `Stakeholder`, `StatutoryClearance` | SPOC escalation tracker for TANGEDCO utility shifting, Revenue tree cutting, Forest NOCs, and TWAD pipeline shifting. |
| **Technical Quality** | `/#/quality` | Phase 8 | `QualityTest`, `NCRReport`, `LabSample` | Core extraction test register, bituminous compaction density charts, Non-Conformance Report (NCR) lifecycle tracking. |
| **Finance & Expenditure**| `/#/finance` | Phase 7 | `Payment`, `LOCAllocation`, `BudgetHead` | Letter of Credit (LOC) tracking, contractor bill clearance pipeline, FIDIC price adjustment calculations. |
| **Contractor Management**| `/#/contractors` | Phase 9 | `Contractor`, `Tender`, `PerformanceScore`| Performance grading (A+ to C), live debarment registry, Bank Guarantee (BG) expiry monitoring. |
| **Field Operations** | `/#/field-ops` | Phase 10 | `MBRecording`, `DailyLog`, `FieldStaff` | Digital Measurement Book (e-MB) recording, geo-tagged photo uploads, weather downtime logs. |
| **Asset Management** | `/#/assets` | Phase 10 | `RoadAsset`, `BridgeConditionIndex` | Road Asset Management System (RAMS), Pavement Condition Index (PCI), Bridge Health Monitoring. |
| **Digital Office** | `/#/digital-office`| Phase 11 | `EFile`, `GovernmentOrder`, `Circular` | Tapal movement tracking, draft G.O. circulation, digital file endorsements. |
| **Citizen Grievances** | `/#/citizen-services`| Phase 13 | `Grievance`, `RTIApplication`, `RoadIssue`| Pothole reporting dashboard, CM Helpline integration, SLA violation escalation. |

---

## 3. Sprint Delivery Schedule

```mermaid
flowchart LR
    subgraph Sprint 1: High-Impact Operations
        M1[/#/departments<br>Inter-Agency SPOC]
        M2[/#/field-ops<br>Digital e-MB]
    end

    subgraph Sprint 2: Technical & Financial Assurance
        M3[/#/quality<br>Lab Quality & NCR]
        M4[/#/finance<br>LOC & Bill Clearance]
    end

    subgraph Sprint 3: Governance & Commercial
        M5[/#/contractors<br>Contractor Grading & BG]
        M6[/#/leakage<br>Leakage Anomaly Console]
    end

    subgraph Sprint 4: Public & Office Lifecycle
        M7[/#/assets<br>RAMS & Bridge Indices]
        M8[/#/digital-office<br>e-Office G.O. Movement]
        M9[/#/citizen-services<br>CM Helpline & Grievance]
    end

    Sprint 1 --> Sprint 2 --> Sprint 3 --> Sprint 4
```

---

## 4. Acceptance Criteria per Module

1. **Dedicated View:** No route renders `PlaceholderModule.tsx`.
2. **Table Responsiveness:** All tabular data must include `.custom-scrollbar`, `overflow-x-auto`, explicit column widths, and horizontal scrolling support.
3. **RBAC Scoping:** Views must enforce user role and jurisdiction restrictions.
4. **Offline Resilience:** Graceful local caching if backend services restart.
5. **Government Grounding:** Sourced from authentic departmental registers or clearly demarcated demo records.
6. **Automated Test Coverage:** Each promoted module must have at least 2 automated integration tests in `backend/tests/`.
