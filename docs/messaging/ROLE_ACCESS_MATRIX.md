# TN-HDOS Messaging Role-Based Access Control (RBAC) Matrix

## 1. Principles of Access Control

Government administrative communication requires strict compliance with hierarchical authority, division boundaries, and commercial confidentiality:
1. **Minister & Secretary**: Unrestricted statewide visibility across all project, departmental, and committee discussions. Power to issue binding `CRITICAL` directives.
2. **Director General & Chief Engineers**: Jurisdiction-wide oversight covering circles, packages, quality review teams, and dispute panels.
3. **Superintending & Divisional Engineers**: Division-specific thread authority, field coordination, and operational contractor dialogues.
4. **Contractors & Concessionaires**: Sandboxed access. Permitted to participate **only** in designated `CONTRACTOR_COORDINATION` working groups and package-specific threads to which they are officially contracted. Zero visibility into inter-departmental deliberations, vigilance probes, or Cabinet files.

---

## 2. Comprehensive RBAC Matrix

| Role Code | Role Name | Direct 1-on-1 | Create Working Groups | Project-Linked Discussions | View Cabinet/Minister Threads | Confirm AI Action Directive | Audit Log Review |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `MINISTER` | Minister for Public Works & Sports | ALL | ALL Categories | ALL Projects Statewide | YES | YES | YES |
| `SECRETARY` | Principal Secretary to Government | ALL | ALL Categories | ALL Projects Statewide | YES | YES | YES |
| `DIRECTOR_GENERAL`| DG Highways Department | ALL | ALL Categories | ALL Projects Statewide | YES (Invited) | YES | YES |
| `CHIEF_ENGINEER` | Chief Engineer (H) | ALL | Regional & Circle Groups | Region-Specific Projects | NO | YES | YES (Region) |
| `SUPERINTENDING_ENG`| Superintending Engineer (Circle)| Circle & Apex | Circle & Package Groups | Circle Projects | NO | YES | Circle Only |
| `DIVISIONAL_ENG`| Divisional Engineer (Division) | Division & SE | Field & Contractor Groups | Division Packages | NO | YES | Division Only |
| `ASSISTANT_ENG` | Assistant Engineer (Subdivision)| DE, Contractors| Field Coordination | Assigned Packages | NO | NO | NO |
| `PROJECT_DIRECTOR`| PD CKICP / TNRSP-II | Agency Teams | EAP Programme Groups | EAP Corridors | NO | YES | EAP Only |
| `FINANCE_OFFICER` | Accounts & Audit Branch | Engineers, SE | Finance & Bill Review Groups| Financial Threads | NO | YES | Financial Only |
| `LAND_ACQ_OFFICER`| Special DRO / LAO | DRO, Revenue | Land Acquisition Taskforces | LA-Impacted Projects | NO | YES | LA Only |
| `QUALITY_OFFICER` | Quality Control Division | Engineers, Labs| QA Review & Non-Compliance | QA-Monitored Projects| NO | YES | Quality Only |
| `CONTRACTOR` | EPC Contractor / Concessionaire| Assigned DE/AE| Restricted Package Groups | Assigned Package ONLY | NO | NO | NO |
| `ADMIN` | Statewide System Administrator | ALL | ALL Categories | ALL Projects Statewide | Security Only | NO | FULL SYSTEM |

---

## 3. Sandboxing & Cross-Boundary Enforcement
- **Contractor Segregation**: Any attempt by a contractor user to query conversation endpoints referencing projects outside their contracted scope returns an HTTP 403 Forbidden.
- **Audit Logging**: Every message post, edit, soft-deletion, attachment download, and action directive confirmation generates an immutable entry in `ConversationAuditLog`.
