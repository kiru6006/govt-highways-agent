# TN-HDOS ROLE-PERMISSION AND ROUTE ACCESS MATRIX
**Document Reference:** `TN-HDOS-AUDIT-VERIF-002`  
**Security Classification:** Restricted / Official Test Framework  
**Standard Compliance:** GIGW 3.0, ISO 27001 / OWASP ASVS v4.0  
**Effective Date:** 07 November 2026  

---

## 1. Executive Summary

This matrix establishes the granular mappings between the thirty (30) mock test personas and all twenty-three (23) application routes, backend API routers, and data mutation actions.

Permissions are enforced at three distinct layers:
1. **Frontend Navigation Guard (`App.tsx` & `Sidebar.tsx`)**: Controls visual presentation and route entry.
2. **Backend Dependency Guard (`get_current_user` & RBAC decorators)**: Enforces HTTP 401 / 403 status codes.
3. **Database Jurisdiction Filter (`apply_jurisdiction_scope`)**: Restricts queries to the user's assigned Zone, Circle, Division, or Contractor ID.

---

## 2. Route Access Matrix (23 Routes vs Persona Categories)

| # | Route | Screen Name | Leadership (Minister/Sec) | Executive Engineers (CE/SE/EE) | Operational Engineers (AE/Plan/Des/GIS) | Quality & Field (HRS/Insp) | Finance & Audit (FC/AO/Aud) | External Depts (Revenue/EB) | Contractors & PMC | IT & AI Governance |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | `#/` | Executive Smartboard | Read/Act | Read/Act | Read | Read | Read | Read | Restricted | Read |
| 2 | `#/leadership/minister` | Minister's Command Centre | Full/Direct | Read Only | Restricted | Restricted | Restricted | Restricted | Forbidden (403) | Audit Only |
| 3 | `#/leadership/secretary` | Secretary's Command Centre | Full/Direct | Read Only | Restricted | Restricted | Restricted | Restricted | Forbidden (403) | Audit Only |
| 4 | `#/project-360` | Project 360° Detailed View | Full | Full/Juris | Read/Juris | Read/Juris | Read/Fin | Read/Dep | Read/Own | Read |
| 5 | `#/projects` | Master Projects Register | Full | Full/Juris | Read/Juris | Read | Read | Read | Read/Own | Read |
| 6 | `#/directory` | Officials & Directory | Full | Full | Read | Read | Read | Read | Read/Public | Full/Admin |
| 7 | `#/departments` | Departmental Coordination | Full/Esc | Action/Esc | Read | Read | Read | Action/Own | Read/Deps | Read |
| 8 | `#/ckicp` | CKICP ADB Intelligence | Full | Full/Prog | Read/Prog | Read | Read | Read/LA | Read/Own | Read |
| 9 | `#/tnrsp` | TNRSP-II World Bank Ops | Full | Full/Prog | Read/Prog | Read | Read | Read/LA | Read/Own | Read |
| 10 | `#/land-utility` | Land Acquisition & Utilities | Full/Direct | Action/Juris | Action/Juris | Read | Read/Cost | Action/Own | Read/Deps | Read |
| 11 | `#/finance` | Finance & Procurement | Full | Action/Sanct | Read | Read | Full/Audit | Restricted | Read/Own | Read |
| 12 | `#/contractors` | Contractor Performance | Full | Full/Eval | Read | Read | Read/Claims | Restricted | Self-Only | Read |
| 13 | `#/quality` | Engineering Quality & HRS | Full | Action/Rev | Action/Site | Full/NCR | Read/Withhold | Read | Read/NCR | Read |
| 14 | `#/field-ops` | Field Operations & Safety | Full | Action/Juris | Action/Site | Full/Audit | Read | Read | Read/Site | Read |
| 15 | `#/assets` | Infrastructure Assets & Bridge | Full | Action/Juris | Action/Site | Action/Test | Read | Read | Restricted | Read |
| 16 | `#/digital-office` | Digital Office & E-File | Full/Appr | Action/Sign | Action/Draft | Action/Note | Action/Audit | Action/Ref | Restricted | Full/Audit |
| 17 | `#/citizen-services` | Citizen Services & Grievance | Full/Oversight | Action/Close | Read | Read | Read | Read | Restricted | Read |
| 18 | `#/leakage` | Leakage & Vigilance Intel | Full/Direct | Action/Invest | Restricted | Read/Quality | Full/Audit | Restricted | Forbidden (403) | Full/Audit |
| 19 | `#/reports` | Reports & AI Decision Intel | Full/Export | Full/Prog | Read | Read | Full/Ledger | Read | Restricted | Read |
| 20 | `#/compliance` | Governance & Legal Registry | Full | Action/Court | Read | Read | Read/Award | Action/LA | Read/Litig | Read |
| 21 | `#/governance` | Statutory Committees & BOE | Full/Chair | Full/Member | Read | Read | Read | Read | Forbidden (403) | Read |
| 22 | Floating | Ask AI Assistant | Full/Statewide | Full/Juris | Read/Tech | Read/QC | Read/Ledger | Read/LA | Self-Only | Full/Audit |
| 23 | `#/admin` | System Administration & RBAC | Read Only | Restricted | Restricted | Restricted | Restricted | Restricted | Forbidden (403) | Full/Root |

---

## 3. Data Operation Permissions Table

| Action Code | Action Label | Statutory Governing Body | Permitted Roles | Forbidden Roles | Audit Logged? |
|---|---|---|---|---|:---:|
| `ACT-DIR-01` | Record Ministerial Directive | Hon'ble Minister | `MINISTER` | All other 29 personas | **YES (MANDATORY)** |
| `ACT-DIR-02` | Issue Secretary Executive Order | Principal Secretary | `PRIN_SEC` | All other personas | **YES (MANDATORY)** |
| `ACT-TS-01` | Accord Technical Sanction | Chief Engineer / SE / EE | `CHIEF_ENG`, `SE_CIRCLE`, `EE_DIV` | Contractors, Revenue, Citizen | **YES** |
| `ACT-MB-01` | Record Field Measurement | Assistant Engineer | `ASST_ENG`, `EE_DIV` | Contractors, Public, Minister | **YES** |
| `ACT-QC-01` | Issue Material Test NCR | HRS Quality Engineer | `QC_ENGINEER` | Contractors, Finance | **YES** |
| `ACT-BILL-01` | Certify Contractor Interim Bill | Divisional Engineer & Accounts | `EE_DIV`, `ACCOUNTS_OFFICER` | Contractors, Revenue | **YES** |
| `ACT-PAY-01` | Release Letter of Credit (LC) | Financial Controller | `FIN_CONTROLLER` | Field Engineers, Contractors | **YES** |
| `ACT-LA-01` | Issue Section 15(2) Land Notice | Special DRO (Highways LA) | `LA_OFFICER` | Contractors, Field Engineers | **YES** |
| `ACT-FILE-01` | Submit Digital Office Note | Secretariat / Departmental Staff | All Government Roles | Contractors, Public | **YES** |
| `ACT-AI-01` | Verify AI Provenance & Advisory | AI Governance Auditor | `AI_GOV_AUDITOR`, `ADMIN` | General Users | **YES** |

---

## 4. Jurisdiction Enforcement Mechanisms

1. **Statewide Roles (`ADMIN`, `MINISTER`, `PRIN_SEC`, `DIR_GEN`, `FIN_CONTROLLER`, `AI_GOV_AUDITOR`)**:
   - `zone_id = NULL`, `circle_id = NULL`, `division_id = NULL`
   - Server queries return complete statewide dataset.
2. **Zonal Roles (`CHIEF_ENG`)**:
   - Filter: `Project.zone_id == user.zone_id` (if configured) or Statewide Project Directorate.
3. **Circle Roles (`SE_CIRCLE`)**:
   - Filter: `Project.circle_id == user.circle_id`.
   - Access to other circles is blocked with HTTP 403 or masked out.
4. **Division Roles (`EE_DIV`, `ASST_ENG`)**:
   - Filter: `Project.division_id == user.division_id`.
5. **Contractor Roles (`CONTRACTOR`)**:
   - Filter: `Project.contractor_id == user.contractor_id`.
   - Any query attempting to access `contractor_id != user.contractor_id` is aborted with HTTP 403.
