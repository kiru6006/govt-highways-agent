# TN-HDOS Intelligent Notifications & Role-Based Alerts Architecture

## 1. System Vision & Architecture
The **Tamil Nadu Highways Digital Operating System (TN-HDOS)** Notifications Engine is an enterprise-grade, deterministic, and role-aware communication platform designed for the Minister, Additional Chief Secretary, Director General, field engineers, finance officers, and statutory authorities.

Unlike consumer alert dashboards that broadcast noisy notifications indiscriminately, TN-HDOS enforces:
1. **Role and Jurisdiction Boundary Locks**: Users only receive alerts within their administrative jurisdiction, wing, division, and assigned projects.
2. **Deterministic AI Priority Scoring**: Every priority score (0–100) is mathematically explained with clear provenance and primary source citations.
3. **Statutory Retention Rules**: Critical government notices, court orders, and vigilance red-flags cannot be deleted or dismissed without formal digital acknowledgment.
4. **Deep-Linked Traceability**: Every alert directly opens the exact primary record (`#/project-360?id=1`, `#/land-utility`, `#/quality`, `#/digital-office`).

---

## 2. Notification Hierarchy & Priority Classification

| Priority | Operational Definition | Enforcement Rule | Escalation Threshold |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | Severe structural risk, statutory deadline, safety non-conformance, court stay petition, major unshifted utility blocker. | Bypasses quiet hours; mandatory acknowledgment required before dismissal. | Auto-escalates to Secretary / Minister if unacknowledged within 48h. |
| **HIGH** | Milestone delay $>30$ days, arbitration notice, unverified contractor bill approaching 14-day limit, LoC ceiling warning. | Displayed in "Your Priority Briefing"; flagged with badge indicators. | Escalates to Superintending Engineer / Chief Engineer in 72h. |
| **MEDIUM** | Routine field inspection assignments, upcoming review meetings, normal pending approvals, M-Book level measurements. | Standard notification tray; grouped by category. | Remains in divisional queue. |
| **LOW** | Informational updates, treasury reconciliation confirmations, equipment mobilization certifications. | Retained in audit log; optional email digest. | Nil. |
| **INFO** | System synchronization notifications, cadastral layer updates, scheduled maintenance notices. | Silently archived; marked as read automatically after 30 days. | Nil. |

---

## 3. Operational Category Taxonomy

TN-HDOS categorizes notifications into 15 domain-specific streams:
1. `PROJECT_UPDATE`: Physical & financial milestones, EVM schedule variances, drone photogrammetry logs.
2. `ADMIN_DECISION`: Cabinet proceedings, ministerial minutes, policy directions.
3. `APPROVAL`: Technical sanctions, GAD revisions, variation approvals.
4. `LAND_ACQUISITION`: Section 15(2) notices, Section 15(3) hearings, Section 19(1) awards, compensation vouchers.
5. `UTILITY_SHIFTING`: TANGEDCO powerline relocations, TWAD transmission mains, municipal sewer crossing NOCs.
6. `FINANCE`: Running bills (e-MB), LoC ceilings, treasury tokens, budget re-appropriations.
7. `CONTRACTOR`: Work orders, EOT requests, liquidated damages warnings, mobilization certificates.
8. `QUALITY`: Material test failures, HRS core cutting density logs, Non-Conformance Reports (NCR).
9. `FIELD_OPS`: Site diaries, culvert pour checks, joint site inspection notes.
10. `LEGAL`: Madras High Court hearings, writ petitions, counter-affidavits, arbitration awards.
11. `CITIZEN_GRIEVANCE`: Chief Minister Special Cell petitions, road safety complaints, waterlogging escalations.
12. `MEETING`: Ministerial reviews, Secretary coordination sessions, pre-bid conferences.
13. `DOCUMENT`: Issued Government Orders (G.O.), Gazette notifications, circulars.
14. `AI_INTELLIGENCE`: Forensic anomaly detection, pavement roughness indices, contractor risk scoring.
15. `SYSTEM`: User role assignments, authentication audits, GIS sync logs.
