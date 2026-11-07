# TN-HDOS MOCK GOVERNMENT TEST PERSONA REGISTER
**Document Reference:** `TN-HDOS-AUDIT-VERIF-001`  
**Security Classification:** Restricted / Test Data Only (Synthetic Demarcation)  
**Standard Compliance:** G.O.Ms.No.172 Highways & Minor Ports, Tamil Nadu Transparency in Tenders Act 1998, GIGW 3.0  
**Effective Date:** 07 November 2026  

---

## 1. Executive Summary & Persona Catalog Demarcation

This register formalizes thirty (30) standardized test personas spanning seven (7) administrative, engineering, financial, statutory, and technical domains within the Tamil Nadu Highways Digital Operating System (TN-HDOS).

Every persona has been provisioned with deterministic test credentials, cryptographically hashed passwords, role bindings, geographic jurisdiction scopes, and server-enforced access controls.

---

## 2. Master Persona Register (30 Mock Personas)

### Category A: Administrative Leadership
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-01** | `minister` | Hon'ble Thiru Aadhav Arjuna, Minister for Highways | Political / Cabinet | Statewide (Tamil Nadu) | `LEADERSHIP` | Executive Orders, Policy Directives, Cabinet Briefings | Technical Sanction, Direct DB mutation |
| **PER-02** | `secretary` | Thiru Shunchonngam Jatak Chiru, IAS, Principal Secretary | IAS / Secretariat | Statewide (Tamil Nadu) | `LEADERSHIP` | Administrative Sanction > ₹25 Cr, Interdept Escalations | Field MB Entry, Contractor Payment Signing |
| **PER-03** | `dir_gen` | Er. V. Senthil Nathan, Director General (Highways) | TN-HES (Apex) | Statewide Departmental | `EXECUTIVE` | Board of Engineers Chair, Technical Audit Approvals | Political Executive Directives |
| **PER-04** | `admin` | Thiru K. Ramanathan, State System Administrator | Secretariat / IT | System-wide | `SYSTEM` | User Management, Role Assignment, Audit Trail Scrutiny | Statutory Financial Approval |

### Category B: Engineering Execution & Technical Oversight
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-05** | `chief_eng` | Er. S. Palanivel, Chief Engineer (Highways - Projects) | TN-HES | Regional / Projects Wing | `EXECUTIVE` | Technical Sanction up to ₹25 Cr, Tender Acceptance | Alteration of Cabinet Directives |
| **PER-06** | `se_chengalpattu` | Er. M. Rajendran, Superintending Engineer | TN-HES | Chengalpattu Circle | `FIELD_MANAGEMENT` | Technical Sanction up to ₹5 Cr, Circle Quality Monitoring | Cross-circle work approvals |
| **PER-07** | `ee_tambaram` | Er. P. Anandhan, Divisional Engineer | TN-HES | Tambaram Division | `FIELD_MANAGEMENT` | Technical Sanction up to ₹1 Cr, Bill Certification, MB Check | Statewide policy decisions |
| **PER-08** | `ae_saidapet` | Er. K. Murugan, Assistant Engineer | TN-HESS | Saidapet Subdivision | `OPERATIONAL` | Measurement Book Entry, Daily Field Log, Site Observation | Bill Passing, Tender Acceptance |
| **PER-09** | `plan_eng` | Er. S. Mythili, Planning Engineer | TN-HES | State Planning Cell | `EXECUTIVE` | DPR Scrutiny, Corridor Traffic Forecast Analysis | Contractor Bill Authorization |
| **PER-10** | `design_eng` | Er. R. Vijayakumar, Design Engineer | TN-HES | Central Design Circle | `EXECUTIVE` | Structural Design Concurrence, Hydrology Validation | Field Measurement Recording |
| **PER-11** | `qc_hrs_eng` | Er. T. Soundararajan, Quality Assurance Engineer | TN-HES (HRS Guindy) | Statewide Quality Labs | `QUALITY` | Cube Test Certification, NCR Issuance, Lab Reports | Commercial Negotiations |
| **PER-12** | `maint_eng` | Er. N. Ganesan, Maintenance Engineer | TN-HES | C&M Maintenance Wing | `OPERATIONAL` | Pavement Distress Indexing, Work Order Generation | Capital Scheme RASC approvals |
| **PER-13** | `gis_survey_eng` | Er. D. Venkatesh, GIS / Survey Engineer | TN-HES | Geomatics Cell | `OPERATIONAL` | GIS Shapefile Ingestion, Chainage Alignment Calibration | Financial Ledger Edits |

### Category C: Programme and Project Administration
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-14** | `ckicp_pd` | Thiru A. Sridhar, IAS, Project Director (CKICP) | IAS / Special Wing | CKICP Corridors (ADB) | `LEADERSHIP` | Multilateral Loan Milestone Tracking, EPC Sanctions | C&M Routine Road Sanctions |
| **PER-15** | `tnrsp_pd` | Thiru M. Balamurugan, IAS, Project Director (TNRSP) | IAS / Special Wing | TNRSP-II Corridors (WB) | `LEADERSHIP` | World Bank Loan Disbursement Concurrence | Non-TNRSP Budget Allocation |
| **PER-16** | `pmc_consultant` | Er. G. Raghavan, Team Leader (Feedback Infra) | External PMC | Assigned EPC Packages | `EXTERNAL` | Supervision Consultant Monthly Certificates | Statutory Notice Issuance |
| **PER-17** | `contractor_lt` | Thiru V. Ramakrishnan, Project Director (L&T) | External Contractor | Package PRJ-TN-2026-001 | `EXTERNAL` | Milestone Progress Submission, RFI Requests | View other contractors' commercial bids |
| **PER-18** | `contractor_pst` | Thiru T. Shanmugam, Project Director (PST Eng) | External Contractor | Package PRJ-TN-2026-002 | `EXTERNAL` | As-Built Submission, Plant & Machinery Log | View confidential cabinet briefings |
| **PER-19** | `procurement_officer` | Er. J. Daniel, Tender & Procurement Officer | TN-HES | Statewide Procurement Cell | `FINANCIAL` | Bid Opening Protocol, EMD Verification, Letter of Acceptance | Arbitrary tender rejection without TSC |

### Category D: Financial Management & Statutory Audit
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-20** | `finance_controller` | Tmt. S. Uma Maheshwari, Financial Controller | Finance Cadre | Statewide Highways Budget | `FINANCIAL` | Letter of Credit (LC) Sanctions, Revised Estimates | Field Quality Overruling |
| **PER-21** | `accounts_officer` | Thiru R. Nagarajan, Accounts Officer | Finance / Accounts | Divisional / Circle Ledger | `FINANCIAL` | Contractor Bill Audit, Statutory TDS & GST Deduction | Physical Dimension Measurement |
| **PER-22** | `internal_auditor` | Thiru P. Shanmugasundaram, Concurrent Auditor | Audit Cadre | Statewide Concurrent Audit | `FINANCIAL` | AG Audit Para Tracking, Advance Recovery Verification | Bill Payment Certification |

### Category E: External Interdepartmental Coordination
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-23** | `la_officer` | Thiru K. Baskaran, Special DRO (Land Acquisition) | Revenue (Highways LA) | Regional Land Units | `EXTERNAL` | Section 15(2) Notices, Section 19 Award Enquiries | Road Alignment Redesign |
| **PER-24** | `revenue_officer` | Tmt. N. Revathi, Revenue Divisional Officer (RDO) | Revenue Department | Revenue Sub-Division | `EXTERNAL` | Patta Mutation, Compensation Disbursement | Highways Engineering Sanctions |
| **PER-25** | `utility_officer` | Er. K. Saravanan, Executive Engineer (TANGEDCO) | Energy / TANGEDCO | Regional Electricity Dist | `EXTERNAL` | Pole Shifting Estimates, Line Shutdown Clearances | Highway Right-of-Way Alteration |
| **PER-26** | `forest_officer` | Thiru V. Sundar, District Forest Officer (DFO) | Environment & Forests | Forest Division | `EXTERNAL` | Forest Clearance Concurrence, Tree Felling NOC | Highway Pavement Construction |

### Category F: Legal, Compliance and Citizen Services
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-27** | `legal_officer` | Adv. S. Duraisamy, Special Government Pleader | Law / Advocate General | Madras High Court / CAT | `COMPLIANCE` | Counter Affidavit Upload, Judicial Stay Tracking | Administrative File Disposal |
| **PER-28** | `citizen_officer` | Tmt. M. Geetha, Grievance Redressal Officer | Public Grievances | CM Helpline / 1100 Unit | `CITIZEN` | Grievance Forwarding, SLA Escalation Tracking | Technical Specification Modification |
| **PER-29** | `field_inspector` | Er. C. Velmurugan, Road Safety & Field Inspector | Field Operations | Statewide National & State HW | `FIELD_MANAGEMENT` | Road Safety Audit NCRs, Blackspot Verification | Contractor Commercial Dispute Settlement |

### Category G: Technology and Governance
| Persona ID | Username | Official Title & Cadre | Department | Jurisdiction Scope | Tier | Key Authorizations | Prohibited Actions |
|---|---|---|---|---|---|---|---|
| **PER-30** | `it_sec_admin` | Thiru A. Vignesh, IT & Security Administrator | IT / NIC / TNeGA | Statewide Technical Stack | `SYSTEM` | RBAC Policy Configuration, JWT Token Rotation, SIEM Logs | Administrative Document Approvals |
| **PER-31** | `ai_gov_auditor` | Dr. K. Radhakrishnan, AI Governance & Data Auditor | State AI Review Council | Statewide Algorithmic Ops | `SYSTEM` | Model Explainability Audit, Evidence Provenance Scrutiny | Direct DB DDL Execution |

---

## 3. Synthetic Test Credentials Configuration
All mock personas operate in a sandboxed, isolated test database (`data_mode: mock`).
- Default Common Password: `highway123`
- Elevated System Password (`admin`, `it_sec_admin`): `admin123`
- Session Lifespan: 1440 minutes (JWT standard HMAC-SHA256)
- Salt Mechanism: BCrypt with 12 rounds
