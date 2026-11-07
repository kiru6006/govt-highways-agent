# TN-HDOS Role-Based Notification & Permission Matrix

## 1. Overview
This matrix details the role-specific targeting, isolation boundaries, and allowed notification types for the 30 mock personas across the 7 functional categories of the Government of Tamil Nadu Highways Department.

---

## 2. Master Persona Notification Rules

| Persona ID | Username | Role / Designation | Allowed Categories | Prohibited / Filtered Content |
| :--- | :--- | :--- | :--- | :--- |
| **P01** | `minister` | Minister for Public Works & Highways | High-value project updates, cabinet notes, arbitration exposures $>₹10\text{Cr}$, ministerial reviews, high-level policy blockers. | Routine M-Book entries, minor lab test failures, individual contractor bills $<₹1\text{Cr}$. |
| **P02** | `secretary` | Principal Secretary to Government | Interdepartmental utility bottlenecks, Section 19(1) LA awards, administrative sanctions, high court cases, secretary meetings. | Routine site inspection diaries, localized grievance tickets. |
| **P03** | `dir_gen` | Director General (Highways) | Statewide quality audits (HRS), CE performance reviews, major corridor progress, contractor blacklisting proceedings. | Local sub-division petty repairs. |
| **P04** | `chief_eng` | Chief Engineer (Projects) | Technical sanction variations, package milestones, circle progress, arbitration filings, CE technical meetings. | Unfiltered field measurements. |
| **P05** | `se_chengalpattu` | Superintending Engineer (Circle) | Circle-wide package progress, divisional bills $>₹2\text{Cr}$, quality NCRs, divisional coordination meetings. | Statewide issues outside Chengalpattu Circle. |
| **P06** | `ee_tambaram` | Divisional Engineer (Division) | Assigned division bills, M-Book 10% test checks, site inspections, utility road-cut permits, contractor submissions. | Issues outside Tambaram Division. |
| **P07** | `ae_saidapet` | Assistant Engineer (Sub-Division) | Site diaries, concrete pour checks, level sheets, cube test records, field safety notices. | Executive policy briefings and cabinet dossiers. |
| **P10** | `qc_hrs_eng` | Quality Assurance Engineer (HRS) | Material test failures, aggregate crushing tests, core cutting density, lab NCRs, mix designs. | Commercial bills and land acquisition awards. |
| **P16** | `contractor_lt` | Contractor Project Director (L&T) | Contract work orders, verified milestones, site safety NCRs, submitted bill status, invited meetings. | **STRICTLY ISOLATED**: Cannot view internal leakage logs, vigilance notes, or other contractor files. |
| **P19** | `finance_controller`| Financial Controller | LoC allocations, expenditure vs budget, audit objections, treasury reconciliations. | Technical engineering drawings and level books. |
| **P22** | `la_officer` | Land Acquisition Officer (DRO) | Section 15(2) notices, Section 15(3) hearings, Section 19(1) awards, compensation vouchers. | Pavement engineering tests and contractor bills. |
| **P24** | `utility_officer` | Utility Nodal Officer (TANGEDCO/TWAD)| Transmission line shifting, water main relocations, joint inspection schedules, deposit reconciliations. | General roadway pavement tenders. |
| **P26** | `legal_officer` | Special Government Pleader | High Court writ petitions, counter-affidavits, court stay orders, arbitration hearings. | Standard construction progress records. |
| **P27** | `citizen_officer` | Citizen Grievance Redressal Officer | CM Helpline petitions, road safety complaints, pedestrian access requests, SLA escalations. | Highly confidential cabinet notes. |
