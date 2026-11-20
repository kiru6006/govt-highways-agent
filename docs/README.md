# Tamil Nadu Highways Department Operations System (TN-HDOS)
## Master Documentation Directory & Architecture Map

Welcome to the central documentation index for **TN-HDOS**. All engineering specifications, statutory references, architecture blueprints, audit reports, and implementation records are organized modularly below.

---

## 1. Modular Documentation Index

```
docs/
├── architecture/                     # Enterprise architecture, ERDs, ADRs, and API route audits
├── audits/                           # Security audits, RBAC matrices, and verification registers
│   └── mock-verification/            # Persona, route, and financial engineering validation registers
├── messaging/                        # Inter-agency and project-linked messaging specifications
├── modules/                          # Functional modules and screen implementation specifications
│   ├── 01-executive-command/         # CM Dashboard, Minister & Secretary Command Centres
│   ├── 02-works-management/          # Portfolios, Corridors, CKICP, TNRSP-II & National Highways
│   ├── 03-cridp-risk/                # CRIDP Risk Intelligence, Proposals & Historical Overlaps
│   ├── 04-sor-cost-intelligence/     # SoR-WECI (PRICE.md, PRICE2.md, Progress Register)
│   ├── 05-governance-digital-office/ # E-Files, Land Acquisition, Litigation & Delegations
│   └── 06-organisation-master/       # 4 Regional Zones, Circles, Divisions & Subdivisions (G.O. 43)
├── notifications/                    # Notification engines, calendar design, and priority workflows
├── prompts/                          # Master implementation prompts and phase execution plans
└── screenshots/                      # UI interface captures and dashboard showcases
```

---

## 2. Documentation by Functional Domain & Screen

### Domain 1: Executive Command & Dashboards
* **Screens**: Chief Minister Strategic Dashboard (`/`), Minister Dashboard (`/minister`), Secretary Dashboard (`/secretary`), Executive Smartboard (`/executive-dashboard`).
* **Documentation**:
  * [CM Dashboard & Universal Connectivity](modules/01-executive-command/CM_DASHBOARD_AND_UNIVERSAL_CONNECTIVITY.md) — Universal entity relationships, cross-wing metrics, CM directions tracking.

### Domain 2: Works Management, Portfolios & Corridors
* **Screens**: Major Works Portfolio (`/major-works`), Projects 360° (`/project-360`), Works Status Analytics (`/works-analytics`).
* **Documentation**:
  * [Major Works & Blocker Intelligence](modules/02-works-management/TN-HDOS_blocker_prompt_v2_3parts.md) — Critical path delay analysis, contractor performance, site blockers.
  * [Contract & Package Register](modules/02-works-management/CONTRACT_AND_PACKAGE_REGISTER.md) — Contract packages across CKICP, TNRSP-II, and C&M wings.
  * [CKICP & TNRSP-II Integration Assessment](modules/02-works-management/CKICP_TNRSP_INTEGRATION_ASSESSMENT.md) — World Bank & ADB funded corridor closeout and land parcel status.
  * [TNRSP Land Acquisition Data](modules/02-works-management/TNRSP_LAND_ACQUISITION_DATA.md) — Cadastral survey data, award enquiries, section 19 declarations.
  * [National Highways Inventory Validation](modules/02-works-management/NH_INVENTORY_VALIDATION.md) — Separation of NH and C&M administrative networks.

### Domain 3: CRIDP Risk & Historical Intelligence
* **Screens**: CRIDP Risk Intelligence Dashboard (`/cridp-risk-intelligence`), Proposal Verification (`/cridp-verification`).
* **Documentation**:
  * [CRIDP Baseline Audit & Integration Plan](modules/03-cridp-risk/CRIDP_BASELINE_AUDIT_AND_INTEGRATION_PLAN.md) — Core engine requirements, filter bars, dependency cascades.
  * [CRIDP Historical Risk Audit & Design](modules/03-cridp-risk/CRIDP_HISTORICAL_RISK_AUDIT_AND_DESIGN.md) — Spatial and chainage overlap detection, duplicate work prevention.
  * [CRIDP Final Execution Report](modules/03-cridp-risk/CRIDP_FINAL_EXECUTION_REPORT.md) — Verification of 12 canonical risk scenarios and 45 corrective actions.

### Domain 4: Schedule of Rates, Work Estimation & Cost Intelligence (SoR-WECI)
* **Screens**:
  1. Master Schedule of Rates Catalogue (`/sor-catalogue`)
  2. Engineering Rate Calculator with 10 Modes (`/rate-calculator`)
  3. Work Estimator & BOQ Builder (`/work-estimator`)
  4. MB, Variations & Billing Reconciliation (`/reconciliation`)
  5. Approvals Queue & Statutory Delegation Matrix (`/approvals-audit`)
  6. SoR Ingestion & Document Parser Workbench (`/sor-ingestion`)
  7. Cost Audit & Benchmarking (`/cost-audit`)
* **Documentation**:
  * [SoR-WECI Master PRD (PRICE.md)](modules/04-sor-cost-intelligence/PRICE.md) — Comprehensive PRD for Schedule of Rates 2026–2027 Volume I (effective 13/11/2026), 10 calculation modes, conveyance slabs, head load, corporation allowances, and pure `Decimal` math.
  * [SoR-WECI Advanced Architecture (PRICE2.md)](modules/04-sor-cost-intelligence/PRICE2.md) — 6-Screen end-to-end blueprint, 5-stage lineage (`SOR` $\rightarrow$ `EST` $\rightarrow$ `BOQ` $\rightarrow$ `MB` $\rightarrow$ `BILL`), G.O. 11/29 statutory delegation rules, bounded AI assist (`FR-09`), and ingestion workbench.
  * [Implementation Progress Register](modules/04-sor-cost-intelligence/IMPLEMENTATION_PROGRESS.md) — Phase-by-phase execution tracking, automated test verification (48/48 tests passing), and production build logs.

### Domain 5: Governance, Digital Office & Compliance
* **Screens**: Digital Office & Tapal (`/digital-office`), Land & Litigation (`/land-litigation`), Governance & Compliance (`/compliance`).
* **Documentation**:
  * [Digital Office Compliance Specification](modules/05-governance-digital-office/PROMPT_07_DIGITAL_OFFICE_COMPLIANCE.md) — E-File transit, correspondence tracking, action notes, ministerial proceedings.
  * [Department, Land & Utility Coordination](modules/05-governance-digital-office/PROMPT_05_DEPARTMENT_LAND_UTILITY_COMPLIANCE.md) — Inter-agency NOCs (TANGEDCO, TWAD, Forest, Railways), utility shifting sanctions.
  * [Delegation of Authority Register](modules/05-governance-digital-office/DELEGATION_OF_AUTHORITY_REGISTER.md) — Financial and administrative powers codified under G.O. (Ms) No. 11 and G.O. (Ms) No. 29.
  * [Committee & Approval Register](modules/05-governance-digital-office/COMMITTEE_AND_APPROVAL_REGISTER.md) — Committee of Chief Engineers (COT), Tender Award Committees, High-Level Steering Committees.
  * [External Stakeholder Register](modules/05-governance-digital-office/EXTERNAL_STAKEHOLDER_REGISTER.md) — Inter-departmental coordination points and liaison authorities.

### Domain 6: Highways Organisation Master & Blueprint
* **Screens**: Organisation Intelligence (`/organisation`), Officer Directory (`/directory`).
* **Documentation**:
  * [Organisation Hierarchy Blueprint](modules/06-organisation-master/ORGANISATION_HIERARCHY.md) — 4 Regional Zones (Chennai, Trichy, Madurai, Coimbatore), 19 Circles, 68 Divisions, 285 Subdivisions under G.O. (Ms) No. 43.
  * [Organisation Blueprint Audit](modules/06-organisation-master/ORGANISATION_BLUEPRINT_AUDIT.md) — Data migration inventory, road length verification (68,149.614 km total).
  * [Organisation & RBAC Verification](modules/06-organisation-master/ORGANISATION_AND_RBAC_VERIFICATION.md) — Cross-verification of leadership, circles, divisions, and subdivisions.
  * [Official Designation Catalogue](modules/06-organisation-master/OFFICIAL_DESIGNATION_CATALOGUE.md) — Gazetted and non-gazetted technical and administrative designations.
  * [Officer Directory Verification](modules/06-organisation-master/OFFICER_DIRECTORY_VERIFICATION.md) — Verified posting locations, cadre strengths, and contact directories.

---

## 3. Architecture & Technical Design

* [System Architecture](architecture/ARCHITECTURE.md) — High-level React 18, FastAPI, and SQLAlchemy architecture.
* [Architect Blueprint](architecture/ARCHITECT.md) — Multi-tier government platform patterns, offline resilience, and state synchronization.
* [Database Data Model & ERD](architecture/DATA_MODEL_AND_ERD.md) — Complete database entity-relationship documentation.
* [Architectural Decision Records (ADR)](architecture/ADR.md) — Historical and architectural decisions (FastAPI, SQLite/PostgreSQL, Tailwind, Leaflet).
* [API & Route Audit](architecture/API_AND_ROUTE_AUDIT.md) — Comprehensive inventory of backend FastAPI endpoints and frontend routes.
* [UI/UX Design Specification](architecture/DESIGN.md) — Design system, color palettes, government accessibility standards, and responsive breakpoints.

---

## 4. Audits, Security & Governance Registers

* [Master System Audit (AUDIT.md)](audits/AUDIT.md) — Comprehensive technical and functional platform audit.
* [Verification Audit (AUDIT-VERIFY.md)](audits/AUDIT_VERIFY.md) — Verification of departmental numbers, roads, and financial figures.
* [Claude Verdict & Quality Assessment](audits/CLAUDE_VERDICT.md) — Independent evaluation and code quality verdict.
* [Phase 0 Baseline Assessment](audits/PHASE_0_ASSESSMENT.md) — Initial codebase condition and roadmap formulation.
* [Phase 17 Audit Report](audits/PHASE_17_AUDIT_REPORT.md) — Milestone audit and regression log.
* [Phase 18 Remediation Plan](audits/PHASE_18_REMEDIATION_PLAN.md) — Defect remediation and code hardening plan.
* [Security & RBAC Audit](audits/SECURITY_AND_RBAC_AUDIT.md) — Token lifecycle, JWT security, cryptographic hashing, and penetration testing.
* [RBAC & ABAC Matrix](audits/RBAC_ABAC_MATRIX.md) — Role-based and attribute-based jurisdiction security rules.
* [Testing & Verification Protocol](audits/TESTING_AND_VERIFICATION.md) — Automated testing strategy (Pytest + Vitest).
* [Production Readiness Checklist](audits/PRODUCTION_READINESS_CHECKLIST.md) — Pre-launch security, performance, and accessibility verification.
* [AI Grounding & Evidence Audit](audits/AI_GROUNDING_AND_EVIDENCE_AUDIT.md) — Evidence tracing, citation grounding, and hallucination prevention.
* [Government Data Verification Register](audits/GOVERNMENT_DATA_VERIFICATION_REGISTER.md) — Tracking of official G.O. numbers and departmental sources.
* [Source Register](audits/SOURCE_REGISTER.md) — Complete bibliography of policy notes, standard data books, and government orders.
* [Unverified Information Register](audits/UNVERIFIED_INFORMATION_REGISTER.md) — Isolated mock or synthetic fields pending field confirmation.
* [Highways Research Report](audits/HIGHWAYS_RESEARCH_REPORT.md) — Comprehensive empirical analysis of Tamil Nadu highway administration.
* [Mock Verification Test Logs](audits/mock-verification/) — Detailed sub-audits across UX, roles, cross-module integrity, and end-to-end scenarios.

---

## 5. Communications, Collaboration & Messaging

* [Project-Linked Messaging Design](messaging/PROJECT_LINKED_MESSAGING.md) — Threaded collaboration attached to road packages and estimates.
* [Messaging Architecture & APIs](messaging/MESSAGING_DESIGN.md) — WebSocket and REST architecture for intra-departmental chat.
* [AI Messaging Governance](messaging/AI_MESSAGING_GOVERNANCE.md) — AI agent participation in technical discussions and summarization.
* [Role Access Matrix for Messaging](messaging/ROLE_ACCESS_MATRIX.md) — Channel permissions by engineering cadre.
* [Notification Design & Priority Engine](notifications/NOTIFICATION_DESIGN.md) — High-priority executive alert pipelines.
* [Calendar & Meeting Workflows](notifications/CALENDAR_DESIGN.md) — Statutory review and tender committee schedule sync.

---

## 6. Implementation Prompts & Workflows

* [Master Prompts Registry](prompts/PROMPTS.md) — Complete repository of user implementation prompts and specifications.
* [Phase 2 Master Prompt](prompts/PHASE2.md) — Phase 2 executive command center requirements.
* [Implementation Plan](prompts/IMPLEMENTATION_PLAN.md) — Initial engineering roadmap and delivery milestones.
