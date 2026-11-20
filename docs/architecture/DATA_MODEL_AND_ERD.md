# Tamil Nadu Highways Department: Data Model & Entity Relationship Architecture

**Document Reference**: TN-HDOS-DATA-01  
**Database Technology**: Relational (PostgreSQL / SQLite Production Compatible)  
**ORM Framework**: SQLAlchemy (Python) & Pydantic V2  
**Status**: APPROVED SCHEMA BLUEPRINT

---

## 1. Existing vs. Proposed Schema Mapping

| Entity Group | Current Implemented Model | Extended Architecture for Phase 3/4 | Purpose & Governance Enhancement |
| :--- | :--- | :--- | :--- |
| **Cadres & Designations** | `ServiceCategory`, `Designation` | Add `CadreRecruitmentRule`, `ProbationCondition` | Encodes exact TNPSC entry quota (3:1 Degree to Diploma) and promotion eligibility rules under G.O.Ms.No.172. |
| **Hierarchy & Units** | `Department`, `Zone`, `Circle`, `Division`, `Subdivision` | Add `OrganisationUnit` with `parent_unit_id`, `effective_from`, `effective_to` | Enables dynamic historical reorganisation modeling without changing database schema when circles/divisions move under G.O.Ms.No.43. |
| **People & Postings** | `User`, `Official`, `HistoricalPosting` | Add `UserAssignment`, `AdditionalChargeRecord` | Formally separates substantive posts from `A/C` and `FAC` acting charges, preventing historical accountability overwrites. |
| **Committees & Approvals** | `StatutoryCommittee`, `DelegationOfAuthority`, `LeadershipDecision` | Add `CommitteeMeeting`, `CommitteeDecision`, `StatutoryReferral` | Triggers automated referral dossiers to Commissionerate of Tenders (COT), TAC, or RASC when financial/technical limits are breached. |
| **Infrastructure Assets** | `Road`, `Bridge`, `Project`, `WorkPackage` | Add `LinearSection`, `AssetPassport`, `ChainageAnomaly` | Handles bidirectional and decreasing chainage (e.g. NH-42) and multi-division corridor splits (e.g. NH-181). |
| **Land Acquisition** | `LeadershipIssue` (LA category), `DepartmentDependency` | Add `LandAcquisitionParcel`, `SectionNoticeRecord` | Tracks parcel-level survey numbers, Sec 15(2) notices, Sec 15(1) gazettes, Sec 19(1) awards, and solatium payments. |
| **External Stakeholders** | `DepartmentDependency`, `InterdepartmentalBlocker` | Add `ExternalDepartmentSPOC`, `ClearanceSubmission` | Tracks lead time, statutory escalation paths to Collectors / Secretariat, and lead time variance. |

---

## 2. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    SERVICE_CATEGORY ||--o{ DESIGNATION : "classifies"
    DESIGNATION ||--o{ OFFICIAL : "defines rank of"
    DESIGNATION ||--o{ DELEGATION_OF_AUTHORITY : "empowers"
    
    ORGANISATION_UNIT ||--o{ ORGANISATION_UNIT : "reports to (parent)"
    ORGANISATION_UNIT ||--o{ OFFICIAL : "stationed at"
    ORGANISATION_UNIT ||--o{ PROJECT : "jurisdiction over"
    
    USER ||--|| OFFICIAL : "holds profile"
    OFFICIAL ||--o{ HISTORICAL_POSTING : "maintains tenure audit"
    OFFICIAL ||--o{ PROJECT_ASSIGNMENT : "responsible for"
    
    PROJECT ||--o{ WORK_PACKAGE : "divided into"
    WORK_PACKAGE ||--o{ CONTRACT : "awarded under"
    CONTRACT ||--|| CONTRACTOR : "executed by"
    
    PROJECT ||--o{ LAND_ACQUISITION_PARCEL : "requires"
    PROJECT ||--o{ DEPARTMENT_DEPENDENCY : "depends on"
    PROJECT ||--o{ LEGAL_MATTER : "subject to"
    PROJECT ||--o{ QUALITY_DEFECT_RECORD : "monitored for"
    
    STATUTORY_COMMITTEE ||--o{ COMMITTEE_DECISION : "renders"
    COMMITTEE_DECISION ||--o{ PROJECT : "authorizes"
```

---

## 3. Data Dictionary Key Attributes

1. **`HistoricalPosting`**:
   - `id`: Integer Primary Key
   - `official_id`: ForeignKey to `Official.id`
   - `designation_title`: String(150) (e.g. "Divisional Engineer (H), Tambaram Division")
   - `posting_unit`: String(200) (e.g. "Tambaram Division, Chengalpattu Circle")
   - `posting_type`: Enum (`REGULAR`, `ADDITIONAL_CHARGE`, `FULL_ADDITIONAL_CHARGE`, `DEPUTATION`)
   - `from_date`: DateTime
   - `to_date`: DateTime (Nullable, null indicates active posting)
   - `is_current`: Boolean
   - `transfer_go_reference`: String(150) (e.g. "G.O.(Rt) No. 201, Highways, dated 28.10.2023")
2. **`StatutoryCommittee`**:
   - `id`: Integer Primary Key
   - `code`: String(50) Unique (`BOE`, `TAC`, `RASC`, `RASC_LA`, `COT`, `SSR`, `HLDRC`, `EXPERT_16B`)
   - `name`: String(200)
   - `chairperson_title`: String(150)
   - `mandate_summary`: Text
   - `constitution_go`: String(150)
3. **`DelegationOfAuthority`**:
   - `id`: Integer Primary Key
   - `designation_code`: String(50)
   - `power_type`: String(100) (`TECHNICAL_SANCTION`, `TENDER_ACCEPTANCE`)
   - `monetary_limit_cr`: Float
   - `tender_excess_pct_limit`: Float
   - `statutory_rule_reference`: String(200)

4. **`OrganisationUnit` (G.O. Ms No. 43 Organisation Blueprint)**:
   - `id`: String(50) Primary Key (e.g. `DIV-CM-CHN-TVL`)
   - `code`: String(50) Unique
   - `name`: String(150)
   - `unit_type`: Enum (`DEPARTMENT`, `WING`, `REGION`, `CIRCLE`, `DIVISION`, `SUBDIVISION`, `SECTION`)
   - `parent_id`: String(50) Self-Referential ForeignKey
   - `wing_code`: String(20) (`CM`, `NH`, etc.)
   - `headquarters`: String(100)
   - `chief_engineer_post`: String(150)
   - `total_length_km`: Float (Statewide 68,149.618 km)
   - `status`: String(50) (`ACTIVE`, `PENDING_VERIFICATION`)

5. **`HistoricalOrganisationMapping` (G.O. 43 Annexure-III)**:
   - `id`: Integer Primary Key
   - `previous_unit_name`: String(150)
   - `previous_circle_name`: String(100)
   - `reorganised_unit_id`: String(50) ForeignKey to `OrganisationUnit`
   - `effective_date`: Date (2026-06-15)
   - `go_reference`: String(150)
   - `mapping_type`: String(50) (`CIRCLE_REALIGNMENT`, `HQ_REDESIGNATION`, etc.)
   - `verification_status`: String(50) (`VERIFIED`)

6. **`DataQualityMappingException`**:
   - `id`: Integer Primary Key
   - `exception_type`: String(100)
   - `source_record_id`: String(100)
   - `raw_value`: String(200)
   - `suggested_unit_id`: String(50)
   - `confidence_score`: Float
   - `review_status`: String(50) (`FLAGGED_FOR_REVIEW`, `VERIFIED_APPROVED`, `REJECTED`)
   - `resolution_action`: String(100)

7. **`UnifiedWorkRecord` (Works Status Analytics Master Entity)**:
   - `id`: String(100) Primary Key
   - `work_code`: String(100) Unique (e.g. `CRIDP-2025-26-001`)
   - `work_name`: String(255)
   - `wing`, `circle`, `division`, `district`: Hierarchical jurisdiction strings
   - `project_length_km`, `start_chainage_km`, `end_chainage_km`: Linear geometry
   - `as_amount_cr`, `ts_amount_cr`, `contract_value_cr`, `expenditure_cr`: Financial values
   - `physical_progress_pct`, `financial_progress_pct`, `progress_band`: Progress metrics
   - `overall_delay_days`, `delay_status`, `forecast_delay_category`: Schedule telemetry
   - `risk_severity`: Enum (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
   - `avoidable_expenditure_cr`: Potential financial loss/leakage

8. **`CRIDPWork` & `WorkHistory` (5-Year Renewal Audit)**:
   - Interval-union algorithm checks proposed chainage $[S_p, E_p]$ against previous works $[S_h, E_h]$ completed within 5 years (cutoff: 1826 days).
   - Flags premature overlaps and calculates eligible road length for Chief Engineer sanction.


