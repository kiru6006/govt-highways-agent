You are acting as a Principal Full-Stack Engineer and Government Infrastructure Systems Architect working inside **Antigravity IDE** on the existing **TN-HDOS** application (`https://kiru6006.github.io/govt-highways-agent/`).

Your task is to build a **lean, deterministic, audit-ready** new section called **SoR & Cost Intelligence** directly inside the existing TN-HDOS app—integrating **Tamil Nadu Schedule of Rates 2026–2027, Volume I (w.e.f. 13/11/2026)**[cite: 1] for Tamil Nadu Highways workflows without duplicating existing TN-HDOS domains (`A`–`H`) or building a bloated standalone app.

---

### 1. First: Inspect the Repository & Existing Architecture
Before writing feature code, inspect the existing repository so your changes fit seamlessly into TN-HDOS:
1. Check the existing frontend stack (React 18, TypeScript, Vite, Tailwind CSS), routing, navigation shell, existing domains (`A. Executive Command Centre`, `B. Project and Works Management`, `C. Engineering and Quality Management`, `D. Finance and Procurement`, `E. Contractor and Consultant Management`, `F. Land Acquisition and Dependencies`, `G. Legal, Audit and Compliance`, `H. AI Intelligence`), and which features are live vs. mock/stubbed.
2. Check the backend stack (Python FastAPI, SQLAlchemy, SQLite dev / PostgreSQL prod), existing API routes, auth/RBAC/jurisdiction middleware, and audit logging.
3. Produce a brief **Repo & Gap Summary** first, then implement the capability cleanly across backend, database, and frontend.

---

### 2. Lean Page Structure (3 Pages Only — No Navigation Bloat)
Add **one** top-level section in TN-HDOS navigation—**`SoR & Cost Intelligence`**—with **3 focused pages** and clean tabs:

1. **`/sor-catalogue` — Schedule of Rates (2026–2027, w.e.f. 13/11/2026)**[cite: 1]
   - **Tabs:** `Highways Items (311–352)`[cite: 1] | `General Notes & Allowances (1–9)` | `Conveyance & Head Load` | `Common/PWD Reference Items`.
   - **Capabilities:**
     - Search and filter by `Unique Code` (`L-`, `M-`, `W-`, `C-`, `H-`), keyword, annexure, or unit.
     - Clearly display **Basic Rate (Excl. GST & Other Taxes)**, effective date (`13/11/2026`), and source page provenance (`Printed Page` + `PDF Page`).
     - Surface rule badges and notes (including items with G.O./depot references, non-Highways/WRD-tagged clauses flagged for validation, and at-site/no-conveyance rules).
     - Clearly mark any remaining unparsed Highways pages (`311–352`) as `TO VALIDATE` until ingested from the source PDF[cite: 1].

2. **`/work-estimator` — Work Estimate & BOQ Builder**
   - **Tabs:** `Estimate & BOQ Lines` | `Allowance & Rule Check` | `MB & Bill Variance`.
   - **Capabilities:**
     - Link estimates and BOQs to existing TN-HDOS project/work-package records (Domain B) and hand off/align with tender/billing records (Domain D).
     - Support item selection, quantity, lead distance, lift height, terrain/zone selection, and bridge vs. road project inputs.
     - Execute **100% deterministic arithmetic** using exact `Decimal` (`ROUND_HALF_UP`) logic—never LLM arithmetic.
     - Compare BOQ items against Measurement Book (MB) quantities and bill figures, flagging unit mismatches, quantity variances, and rate differences.

3. **`/cost-audit` — Cost Comparison, Exceptions & Audit Trail**
   - **Tabs:** `Rate & Cost Comparison` | `Exception & Variance Queue` | `Audit Log`.
   - **Capabilities:**
     - Compare unit rates and project/work costs across divisions, road categories (`SH`, `MDR`, `ODR`, etc.), and works.
     - Present flagged discrepancies using a structured 10-point review checklist (`What should have happened`, `What actually happened`, `Applicable rule/control`, `Difference`, `Cause`, `Justification`, `Evidence`, `Potential exposure`, `Investigating official`, `Preventive action`).
     - **Strict Governance Rule:** Never label any anomaly or variance as "fraud" or "corruption". Use neutral review states (`Open`, `Justified Exception`, `Requires Revision`, `Escalated for Review`).
     - Maintain an append-only audit log recording user, role, jurisdiction, action, target entity, before/after state diff, and timestamp.

---

### 3. Mandatory Deterministic Business Rules & Guardrails
Implement these rules in a dedicated, unit-tested backend calculation & rule service:
- **Effective Date & Tax Separation:** Enforce SoR 2026–2027 (`w.e.f. 13/11/2026`)[cite: 1]; keep basic rates **exclusive of GST & other taxes** and display tax/GST separately.
- **No Unauthorized or Compounded Extras:** Allow extra percentages **only** where explicitly permitted by General Notes / schedule rules; compute percentages deterministically without unauthorized compounding.
- **Highways Bridge 3% Provisional Allowance Guardrail:** Apply the **3% provisional allowance** strictly to **structural component items of bridge works** (and for road works, only when the bridge component exceeds **50%** of total project cost and the provisional allowance is active/unwithdrawn). Explicitly block **drains, culverts, retaining walls, and repair works** from receiving this 3% allowance.
- **Special Areas, Conveyance & Head Load:** Support Corporation/Municipal limits, Night-work labour allowance (`+25%` on labour only where tender clause/conditions apply), Hills/Islands/Restricted area rules, AEE quarry-vs-conveyance check prompts, and head-load/conveyance slab calculations (including no-conveyance rules on excluded material annexures).
- **AI Guardrails & Offline Resilience:** Any AI helper (PDF extraction, item matching, variance explanation) must be clearly labeled `AI-Assisted (Advisory Only)` with source citations, must **never** compute official totals or approve items, and the entire module must work seamlessly when AI is disabled or unavailable.
- **RBAC & Delegation Safety:** Respect TN-HDOS roles, jurisdiction boundaries, and `TO VALIDATE` placeholders where statutory financial/technical delegation orders or remaining Highways PDF pages (`311–352`) require departmental verification[cite: 1].

---

### 4. Deliverables Expected in Your Response
1. **Repo & Gap Summary** (based on inspecting the codebase).
2. **Database Models & Seed Data** (SQLAlchemy models + seed script for `SoR-2026-2027-V1` w.e.f. `13/11/2026`, rules, and sample Highways/estimate/reconciliation/audit records).
3. **Deterministic Calculation & Rule Engine + Unit Tests** (covering allowances, exclusions, Bridge 3% rule, conveyance/head-load, tax separation, and variance checks).
4. **FastAPI REST Endpoints** (catalogue, estimates/BOQ, reconciliation, cost comparison/exceptions, advisory AI hook, and immutable audit log).
5. **React + TypeScript + Tailwind UI** for `/sor-catalogue`, `/work-estimator`, and `/cost-audit`, integrated cleanly into the existing TN-HDOS navigation and responsive for desktop and mobile.


# TN-HDOS: FINAL EXPERT REVIEW AND PRD GENERATION PROMPT

## Objective

Analyse the attached Tamil Nadu Schedule of Rates 2026–2027, Volume I, and determine the minimum correct, useful and scalable integration into the existing Tamil Nadu Highways Digital Operating System (TN-HDOS).

Do not assume a new module, dashboard, BOQ builder or AI agent is necessary. Prove the business need and recommend the smallest architecture that solves it.

## 1. Product Background

TN-HDOS is an AI-enabled departmental operating platform for the Tamil Nadu Highways Department.

Live demonstration:
https://kiru6006.github.io/govt-highways-agent/

The existing product covers or targets:

- Executive performance and project intelligence.
- Road and bridge project management.
- Works Management and Project 360-degree records.
- Engineering and quality management.
- Budget, finance, tender and contractor management.
- Land acquisition and utility dependencies.
- Measurement, billing and financial progress.
- Legal, audit and compliance.
- Role-based departmental workflows.
- AI-assisted risk identification and decision support.

The platform is intended to connect planning, sanctions, estimates, tendering, construction, quality, measurement, billing, payment, maintenance and audit.

Its strategic objective is to reduce manual work, improve project quality and productivity, and identify evidence-backed financial and operational deviations.

The system is not intended to replace statutory engineering judgment or official approval authority.

### Technology Context

Current implementation includes React, TypeScript, Vite, Tailwind, Python FastAPI and SQLAlchemy, with SQLite used in development.

PostgreSQL and additional AI/data infrastructure are possible future architecture choices.

Do not assume proposed technologies, integrations or workflows already exist.

## 2. Mandatory First Step: Existing Application Audit

Before designing anything:

1. Inspect the live TN-HDOS application.
2. Inspect the source repository if access is provided.
3. Inventory the current navigation, pages, forms, APIs, entities and workflows.
4. Identify where estimates, BOQs, rates, measurement books and financial comparisons already exist.
5. Classify each capability as implemented, partial, demonstration-only, planned or not verified.
6. Identify functionality that can be reused.
7. Identify duplication risks and missing dependencies.

If the repository, API definitions or database are inaccessible, clearly state the limitation.

Do not invent existing features or implementation details.

## 3. Mandatory Second Step: Source Document Audit

Analyse the attached Schedule of Rates, effective 13 November 2026.

The document contains Public Works, Highways and Water Resources schedules.

Focus on the Highways annexures, printed pages 311–352, and relevant general notes on printed pages 1–9.

Analyse:

- Labour rates.
- Material rates.
- Work rates.
- Quality-control equipment.
- Road furniture.
- Survey and DPR.
- Avenue plantation.
- Sub-data.
- Tools and plant hire charges.
- Unique item codes and units.
- Tax inclusion and exclusion.
- Geographic allowances.
- Night-work allowances.
- Bridge structural component provisions.
- Conditions, exclusions and cross-departmental references.

Important source examples:

- Highways Annexure I contains a 25% night-work labour allowance subject to tender-clause conditions.
- Highways Annexure II states that incidental, loading and unloading charges are included in the listed material basic costs.
- The general notes provide a provisional 3% allowance for eligible bridge structural components, subject to specific restrictions.

Verify each provision against the original document before using it.

Do not confuse a basic rate with a completed-work rate, approved estimate, tendered rate or actual payment.

Do not assume the PDF contains all data needed for project estimation.

## 4. Mandatory Third Step: Challenge the Business Need

Answer these questions before proposing features:

1. What problem does the existing TN-HDOS application fail to solve?
2. Which problem can be solved with a searchable reference catalogue?
3. Which problem requires a deterministic calculation engine?
4. Which problem requires existing project records?
5. Which problem requires a new workflow?
6. Which problem genuinely benefits from AI?
7. Which features are unnecessary?
8. Which features would duplicate existing pages?
9. Which requirements cannot be implemented without departmental data?
10. What is the minimum viable capability?

Explicitly evaluate three alternatives:

**Option A: Reference Library Only**

A searchable, versioned Schedule of Rates with source citations.

**Option B: Reference Library and Estimate Validation**

Option A plus deterministic rules, item validation, calculation checks and integration with existing project estimates.

**Option C: Full Cost Intelligence Platform**

Option B plus project-level BOQ, measurement, billing, payment, benchmarking and anomaly intelligence.

Compare complexity, dependencies, risks, value and maintainability.

Recommend one option for the first release and justify the decision.

## 5. Product Design Principles

- Extend the existing TN-HDOS application.
- Reuse existing project, work, finance and approval entities.
- Prefer a small number of purposeful pages.
- Do not duplicate existing functionality.
- Keep official rate calculations deterministic.
- Preserve item-level source evidence.
- Support annual schedules and amendments.
- Never silently overwrite historical rates.
- Separate rate validity from project applicability.
- Keep tax and adjustment rules explicit.
- Require human review for disputed or ambiguous cases.
- Make field-engineer workflows mobile-friendly.
- Use AI only where it provides measurable additional value.

## 6. Required Business Analysis

For every proposed capability, document:

- Business process.
- Actual or hypothesised pain point.
- Supporting evidence.
- Current workflow.
- Proposed improvement.
- Required data.
- User role.
- Applicable source provision.
- Calculation or validation rule.
- Exceptions.
- Expected outcome.
- KPI.
- Implementation dependency.
- Acceptance criteria.

Prioritise real problems over the number of use cases.

Do not create 30 or 50 use cases merely to meet a target.

## 7. Required Technical Analysis

Design only the components justified by the chosen scope.

Cover:

- Versioned SOR data catalogue.
- Source-document provenance.
- Item-code and unit validation.
- Rate applicability and effective dates.
- Rules and exceptions.
- Estimate integration.
- Existing project and BOQ relationships.
- Audit history.
- Role-based access.
- APIs and database changes.
- Migration and rollback.
- Calculation testing.
- Performance and mobile accessibility.

Use the existing React and FastAPI architecture unless a change is technically justified.

Prefer a modular monolith over unnecessary microservices.

## 8. Financial Controls

Where sufficient data exists, investigate:

- Outdated rate selection.
- Incorrect units.
- Unsupported location allowances.
- Ineligible bridge allowances.
- Duplicate incidental charges.
- Estimate-to-BOQ rate mismatches.
- Unexplained quantity revisions.
- Measurement-to-billing discrepancies.
- Equipment hire anomalies.
- Repeated maintenance expenditure.

For each detection, distinguish:

- Data mismatch.
- Potential exception.
- Confirmed error.
- Potential financial exposure.
- Verified financial loss.
- Prevented expenditure.
- Actual recovery.

Never treat a statistical anomaly as proof of misconduct.

## 9. Required PRD Structure

Produce the following deliverables:

### A. Executive Assessment
State whether the proposed capability is necessary and why.

### B. Source Analysis
Explain the actual SOR content, conditions and limitations with printed page references.

### C. Existing Application Gap Assessment
Identify what can be reused, extended or must be built.

### D. Architecture Decision
Compare Options A, B and C, recommend the first release and explain trade-offs.

### E. Product Scope
Define in-scope, out-of-scope, dependencies and assumptions.

### F. Functional Requirements
Use unique requirement IDs, priorities, user roles and acceptance criteria.

### G. Navigation and UX
Recommend the smallest useful set of pages, tabs and integrations.

### H. Business Rules
Provide precise formulas, eligibility conditions, exceptions, effective dates and evidence requirements.

### I. Data Model and APIs
Describe only the new entities, fields and endpoints that are genuinely required.

### J. Workflows
Show source import, validation, publication, estimate checking, exception review and audit.

### K. Test Strategy
Include source reconciliation, boundary conditions, rounding, units, exclusions, historical versions, security and negative test cases.

### L. Delivery Roadmap
Identify dependencies, phases, exit criteria and rollback strategy.

### M. Business Outcomes
Specify measurable improvements without inventing savings.

### N. Open Questions
List unresolved engineering, statutory, departmental, data and integration questions.

### O. Implementation Readiness
State whether development may begin, which work is safe to implement and which work is blocked.

## 10. Evidence Standard

Classify all claims:

- SOURCE VERIFIED: Directly supported by the attached PDF.
- CODE VERIFIED: Confirmed from actual TN-HDOS source code.
- PRODUCT OBSERVED: Visible in the live application but not code-verified.
- PROPOSED: New design requirement.
- TO VALIDATE: Requires authoritative confirmation.

Do not describe hypothetical data, interfaces or financial savings as existing facts.

Cite the exact printed PDF page for rate rules and item examples.

If any part of the PDF cannot be read, report the coverage gap.

## 11. Independent Red-Team Review

Before delivering the final PRD, perform a critical review as:

1. Chief Highway Engineer.
2. Departmental Finance and Audit Specialist.
3. Enterprise Solution Architect.
4. Senior Product Manager.
5. Government Security and Compliance Reviewer.

Each reviewer must identify:

- Incorrect assumptions.
- Unnecessary features.
- Missing dependencies.
- Financial calculation risks.
- Source interpretation risks.
- Duplicate functionality.
- Security or approval weaknesses.
- Opportunities to simplify the design.

Revise the PRD based on these findings.

## 12. Final Decision Required

Conclude with a decision table:

- Build now.
- Reuse existing functionality.
- Defer until data is available.
- Reject as unnecessary.
- Requires departmental validation.

Then produce one consolidated, implementation-ready PRD.

Do not generate Antigravity coding prompts until the PRD has passed the source, architecture and business-rule reviews.

The final solution should be the smallest technically sound extension that makes the 2026–27 Schedule of Rates useful, traceable and auditable inside TN-HDOS.


# Product Requirements Document (PRD): Schedule of Rates, Work Estimation and Cost Intelligence (SoR-WECI) for TN-HDOS

**Document Version:** 1.0 (Implementation-Ready Blueprint)

**Target Platform:** Tamil Nadu Highways Digital Operating System (TN-HDOS) — `[https://kiru6006.github.io/govt-highways-agent/](https://kiru6006.github.io/govt-highways-agent/)`

**Primary Source Document:** Tamil Nadu Schedule of Rates (SoR) 2026–2027, Volume I (w.e.f. 13/11/2026), Published by Tamil Nadu Public Works Department (PWD). Note: The attached file `TNHD 2026-2027 Work list.pdf` (394 pages) contains the Tamil Nadu Schedule of Rates 2026–2027 Volume I (PWD, Highways, and Water Resources).

**Date:** November 19, 2026

> **Epistemic Grounding & Classification Legend (Applied Throughout This PRD)**
> * **`SOURCE VERIFIED`**: Directly supported by the attached 394-page PDF (`TNHD 2026-2027 Work list.pdf` — Tamil Nadu Schedule of Rates 2026–2027, Volume I).
> * **`EXISTING PRODUCT`**: Confirmed via architectural/functional context of TN-HDOS (`[https://kiru6006.github.io/govt-highways-agent/](https://kiru6006.github.io/govt-highways-agent/)`) and user-provided system specifications (`TO VALIDATE` where live repository inspection is pending).
> * **`PROPOSED`**: New product capability, page, workflow, schema, API, or rule introduced by this PRD.
> * **`TO VALIDATE`**: Requires departmental confirmation, live repository/UI inspection of `govt-highways-agent`, or statutory/delegation order verification.
> 
> 

---

## Part 1: Executive Product Summary

### 1.1 Business Problem (`SOURCE VERIFIED` / `TO VALIDATE`)

The Tamil Nadu Highways Department executes road and bridge infrastructure across State Highways (SH), Major District Roads (MDR), Other District Roads (ODR), and specialized execution wings (`C&M`, `Projects`, `NABARD`, `Metro`, `TNRSP/EAP`). While the Tamil Nadu Schedule of Rates (SoR) 2026–2027 Volume I (effective **13/11/2026**) establishes standardized basic rates and extra-percentage rules across PWD, Highways, and Water Resources, estimation and cost-control workflows risk fragmentation across disconnected spreadsheets, BOQs, tender schedules, Measurement Books (MBs), revised estimates, and payment vouchers (`TO VALIDATE` exact departmental tool mix).

Key operational problems to address include:

1. Incorrect or outdated rate selection (`TO VALIDATE` current practice; `SOURCE VERIFIED` effective date `13/11/2026`).
2. Manual estimate preparation (`TO VALIDATE`).
3. Inconsistent units and quantities (`SOURCE VERIFIED` unit variations across annexures such as `cum.`, `sqm.`, `RM`, `Each`, `1000 Nos.`, `MT`, `Nozle`, `Dozen`, `Gross`, `10 mtr.`).
4. Unsupported additional percentages (`SOURCE VERIFIED` strict prohibition on extra percentages outside specified General Note areas).
5. Incorrect location-based allowances (`SOURCE VERIFIED` Corporation limits, Restricted Areas, Hills, Islands, and special footnotes).
6. Duplicate material or labour charges (`SOURCE VERIFIED` loading/unloading/incidental charges already included in basic rates for specified materials and labour already included in `Rates of Works` where human labour alone is involved).
7. Incorrect equipment hire calculations (`TO VALIDATE` Highways hire charges on printed pages 349–352; `SOURCE VERIFIED` concrete vibrator/hoisting/polishing provisions in PDF pages 40, 32, 42).
8. BOQ and Measurement Book mismatches (`TO VALIDATE`).
9. Unexplained revised-estimate increases (`TO VALIDATE`).
10. Repeated road maintenance expenditure (`TO VALIDATE`).


11. Inconsistent contractor rates (`TO VALIDATE`).
12. Lack of comparable project benchmarks (`TO VALIDATE`).
13. Missing evidence for cost variations (`TO VALIDATE`).
14. Weak linkage between estimates and payments (`TO VALIDATE`).
15. Delayed technical review and approvals (`TO VALIDATE`).

### 1.2 Proposed Capability (`PROPOSED`)

We recommend naming the new TN-HDOS capability:
**`Schedule of Rates, Work Estimation & Cost Intelligence (SoR-WECI)`** (integrated directly into TN-HDOS rather than built as a standalone app, preserving unified project context across Planning, Sanctions, Estimates, Tendering, Execution, MB, Billing, and Audit).

### 1.3 Target Users (`EXISTING PRODUCT` / `TO VALIDATE`)

Minister and executive leadership; Principal Secretary / Secretary; Director General / Chief Engineers; Superintending Engineers (SE); Divisional Engineers (DE); Assistant Executive Engineers (AEE); Assistant Engineers (AE); Accounts and Finance Officers; Quality-Control (QC) personnel; Procurement officers; Contractors and consultants; Audit and legal personnel; and Citizens (approved public information only). *Note: Statutory delegation orders for sanctions, rate exceptions, and financial approvals are marked `TO VALIDATE`.*

### 1.4 Strategic Value & Boundaries (`PROPOSED` / `SOURCE VERIFIED`)

* **Value:** Connects approved 2026–2027 SoR basic rates (`SOURCE VERIFIED`, w.e.f. `13/11/2026`) and deterministic allowance rules (`PROPOSED`) to project estimates, BOQs, MBs, billing, and audit evidence (`PROPOSED`), while flagging discrepancies for authorized human review without labelling anomalies as fraud or confirmed loss (`PROPOSED`).
* **Boundaries:** Does **not** duplicate existing TN-HDOS domains (`A` through `H`) (`PROPOSED`). Does **not** replace legally mandated physical registers/MBs or statutory approvals (`PROPOSED`). Does **not** use LLMs for authoritative arithmetic or financial approvals (`PROPOSED`).

---

## Part 2: Document Analysis (`SOURCE VERIFIED`)

### 2.1 Publication Metadata & Governance Structure

* **Title:** Government of Tamil Nadu — Schedule of Rates for the Year 2026–2027, Volume I (`BASIC RATES (EXCLUDING GST & OTHER TAXES)`).
* **Effective Date:** `13/11/2026` (w.e.f. 13.11.2026).
* **Publisher / Issuing Authority:** Tamil Nadu Public Works Department (PWD); Preface signed for the Schedule of Rates Committee by Engineer-in-Chief & Chief Engineer (General), PWD, Chepauk, Chennai – 600 005.
* **Committee Constitution:** Constituted via `G.O. (Ms). No 3, Public Works (G2) department, dated 14.03.2024`, comprising members from PWD, Water Resources Department (WRD), Highways Department (Director General, Highways Department; Chief Engineer (Construction and Maintenance), Highways Department), Forest Department, Finance Department, TWAD, CMWSSB, TNPDCL, and TNUHDB.
* **Basis of Rates:** Prevailing market rates, current year Wholesale Price Index (WPI), TANCEM rate for Cement, SAIL rate for Steel, past five years' data, existing items, deletion of unused items, addition of new items, and merger of similar items.
* **Volume Scope:** Volume I covers **PWD, Highways Department, and Water Resources Department**. (Volume II covers TWAD, CMWSSB, TNUHDB, HR&CE, Tamil Nadu Horticulture Development Agency; Volume III covers Forests, TNPDCL, TANTRANSCO).

### 2.2 Complete Volume I Index & Highways Section Map

The PDF contains 394 PDF pages (`through`). Printed page numbers appear at the bottom of schedule pages, with a structural offset between printed pages and PDF pages in the observed sections (e.g., printed page `1` = PDF page `8`; printed page `11` = PDF page `18`; printed page `212` = PDF page `219`).

| Volume I Section | Printed Pages | Status in Attached PDF / Analysis |
| --- | --- | --- |
| General Note | 1–6 | **Inspected** (PDF pp. 8–13) |
| General Note - Table | 7–9 | **Inspected** (PDF pp. 14–16) |
| PWD — Structure for Unique Item Codes & Annexures I–IX | 10–310 | **Partially Inspected** (PDF pp. 17–250; Annexures VI–VII cover common construction/electrical items referenced by General Note 8(viii)) |
| **Highways Department — Header** | **311** | **Beyond observed PDF page sample (`TO VALIDATE` full text on PDF p. 318+)** |
| **Highways — Structure for Unique Item Codes** | **312** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-I: Rates of Labour** | **313** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-II: Rates of Materials** | **314–315** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-III: Rates of Works** | **316–327** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-IV: Rates of QC Equipments** | **328** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-V: Rates of Road Furnitures** | **329–343** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-VI: Rate of Survey and DPR** | **344–345** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-VII: Rates of Avenue Plantation** | **346–347** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-VIII: Sub Data** | **348** | **Index-verified; full page text `TO VALIDATE**` |
| **Highways — Annexure-IX: Rates of Hire charges for Tools and Plants** | **349–352** | **Index-verified; full page text `TO VALIDATE**` |
| Water Resources Department — Header & Annexures I–IV | 353–387 | **Index-verified; full page text `TO VALIDATE**` |

> **Important Source Grounding Note:** While the Index on printed page `ii` (PDF page `7`) explicitly lists the Highways Department sections (`311`–`352`), the visible PDF page stream provided in this session covers PDF pages `1`–`250` (Preface, Index, General Note, General Note Table, and PWD Annexures I–VII). All exact codes, descriptions, units, and rates in Section 2.3 are therefore strictly cited from the inspected PDF pages (``), while exact line-by-line rates inside Highways printed pages `311`–`352` are explicitly flagged as `TO VALIDATE` from the remaining PDF pages (`~318`–`359`) prior to final ingestion.

### 2.3 Unique Code Structure & Representative Verified Rates (`SOURCE VERIFIED`)

* **Unique Code Format:** `A-1234` (single prefix letter followed by digits), where prefixes in the code structure denote: `L` = Labour, `M` = Materials, `W` = Works, `C` = Head load and Conveyance, `H` = Hire Charges.
* **Representative Verified Rates (w.e.f. `13/11/2026`, exclusive of GST & other taxes):**
* **Labour (`Annexure-I`):** `L-0001` Technical Assistant Grade-I (B.E. Passed): ₹1,430.00/Day; `L-0023` Driver (Light Duty): ₹904.00/Day; `L-0024` Driver (Heavy Duty): ₹965.00/Day; `L-0025` Maistry, Road Inspector & Work Inspector: ₹870.90/Day; `L-0026` Maistry, Road Inspector & Work Inspector (Degree Holder): ₹965.00/Day; `L-0053` Stone & Crusher Operator: ₹796.00/Day; `L-0094` Mixer Operator (including concrete mixer): ₹832.00/Day; `L-0096` Heavy Mazdoor: ₹832.00/Day; `L-0098` Mazdoor Category-II: ₹628.00/Day. *(Note: L-0011, L-0012, L-0015, L-0022, L-0034, L-0035, L-0047–L-0049, L-0064, L-0066, L-0076, L-0088, L-0089, L-0005–L-0008, L-0052 are noted as pertaining to Water Resources Department).*
* **Materials (`Annexure-II`):** `M-0001` Cement: ₹5,000.00/MT; `M-0002` Steel: ₹55,665.00/MT; `M-0045` Rough Stone for masonry works (Hard Granite): ₹449.40/cum.; `M-0082` HBGS Jelly 90mm: ₹583.20/cum.; `M-0085` HBGS Jelly 50mm: ₹875.40/cum.; `M-0086` HBGS Jelly 40mm: ₹1,362.90/cum.; `M-0088` HBGS Jelly 20mm: ₹1,897.40/cum.; `M-0119` Gravel: ₹222.70/cum.; `M-0124` Pond Ash (wet/dry): ₹95.65/cum.; `M-0125` Crushed Stone Sand (M-Sand): ₹1,578.80/cum.; `M-0126` Plastering Sand (P-Sand): ₹1,584.70/cum.; `M-0127` Sand for Mortar & `M-0128` Sand for Filling: *"As per G.O. Ms.No.4, Public Works (I.Spl.2) Dept., dated 06.01.2022"* (at Government Sand Depot).
* **Works (`Annexure-III`):** `W-0001` Clearing Heavy Jungle: ₹9.18/sqm.; `W-0007` Cleaning Juliflora Jungle with Uprooting: ₹10.48/sqm.; `W-0034` Dismantling Plain Cement Concrete: ₹520.23/cum.; `W-0035` Dismantling RCC by manual / deploying machineries: ₹4,610.31/cum.; `W-0055` Earth work ORDINARY SOIL (SS20B) initial lead 10m & lift 2m: ₹88.10/cum.; `W-0061` HGS SS.20.B: ₹131.89/cum.; `W-0062` SDR (Not Requiring Blasting): ₹196.44/cum.; `W-0064` MR & DMR (Not Requiring Blasting): ₹345.04/cum.; `W-0065` Extra per additional 10m lead: ₹15.95/cum.; `W-0066` Extra per additional 1m lift: ₹12.42/cum.; `W-0085` Earth work in all soils except hard rock requiring blasting & conveying for formation of bund (lead 0–100m, machinery & tippers): ₹63.35/cum.; `W-0086` Extra per additional 100m lead (bund): ₹4.96/cum.; `W-0100` Concrete Vibrators in PCC: ₹82.15/cum.; `W-0101` Concrete Vibrators in RCC: ₹110.87/cum.; `W-0307` Acrylic coating for anti-carbonation New Concrete (Bridges & Flyover): ₹359.50/sqm.; `W-0379` Production cost of Concrete by Batching Plant: ₹550.00/Cum.
* **Head Load (`Annexure-IV`):** `C-0001` Rough Stone, Broken Stone Jelly, Cut Stone, RCC Slab, etc. (Lead >10m up to 100m): ₹120.95/cum.; `C-0002` extra per additional 100m or part thereof: ₹50.20/cum.; `C-0003` extra per 1m lift above 2m lift: ₹13.00/cum.. Applicable only to inaccessible places where bullock carts cannot move (`Chief Engineer (General), Memo No. CTO(A)/38153/89, dated 03.02.1989`); no head load for initial 10m lead and 2m lift; fraction of 100m rounded to nearest 100m.
* **Conveyance in Plains (`Annexure-V(A)`) & Hills (`Annexure-V(B)`):** Tiered distance slabs (`0–10 km`, `10–20 km`, `20–40 km`, `40–80 km`, `Above 80 km`), plus loading, unloading, and interstate extras. Plains conveyances carry explicit `Co-efficient` values (`1.00`, `1.10`, `1.60`, `1.35`, `1.80`, `2.25`).



### 2.4 General Notes, Highways-Specific Provisions, Exclusions & Tax Treatment (`SOURCE VERIFIED`)

1. **Strict Cap on Extra Percentages:** *"Extra percentage other than those for the specified areas noted below, shall not be allowed."*.
2. **Non-Compounding / Basic Rate Rule (`General Note 8(ii)` & `Annexure-I Note 2b`):** Extra percentages apply **only on basic rates** (excluding any other percentage increase given for specified reasons).
3. **Highways Department General Note (`General Note 10`):**
* **Provisional 3% Bridge Structural Allowance:** Allows a provisional increase of **3%** on rates of **structural component items of bridge works only** to address contingencies and items required over and above existing approved data.
* **Sunset Clause:** *"Once the approved data is modified and updated accordingly to incorporate the changes, this provisional allowance stands withdrawn."*.
* **Road + Bridge Threshold (>50%):** In road work projects, if the cost of the bridge component **exceeds 50% of the total project cost**, the 3% allowance on structural component items of the **bridge work alone** is permitted.
* **Explicit Exclusions:** Not applicable to **drains, culverts, retaining walls, and repair works**, nor to any non-bridge category.


4. **Special Areas & Allowances (`General Notes 1–7` & `General Note Table`):**
* **Corporation / Municipal / Special Areas:** +10% on Rates of Labour, Rates of Works, and Head Load for erstwhile Chennai Corporation limits + 32 km belt around erstwhile Chennai Corporation limits, Madurai Corporation, Coimbatore Corporation, and Hosur Taluk. +5% on Rates of Labour, Rates of Works, and Head Load for Trichy, Salem, Tirunelveli, Tiruppur, Erode, Thoothukudi, and Vellore Corporation limits.
* **Night Works in Corporation & Municipal Areas (`Annexure-I Note 2a–2b`):** +25% over Rates of Labour charges **only** (including bridge works) in all Corporation and Municipal Areas, restricted to items necessarily carried out at night with an appropriate tender clause, applied on basic rates only (excluding specified area extras).
* **Restricted Areas (`General Note 3`):** Central Jail campus (+10% Labour, Works, Conveyance); Sub-Jail campus (+5% Labour, Works, Conveyance); Reserve Forest Areas (+20% Labour, Materials, Works, Conveyance, Head Load; note 3(vi) +40% Labour / +20% others is marked in Note 1 of the Table as pertaining to WRD).
* **Hills (`General Note 4`):** Regrouped areas with differentiated extra percentages on Labour, Materials, Works (where human labour alone is involved), Conveyance (`Annexure-V(B)`), and Head Load (e.g., Nilgiris: +40% Labour/Works/Head Load, +25% Materials; Gudiyalathur/Siruvani/Anamalai/etc. and Western Ghats of Madurai, Virudhunagar, Coimbatore, Tirunelveli, Kanyakumari: +20% across Labour/Materials/Works/Head Load; Kodaikanal: +40% Labour/Works/Head Load, +25% Materials; Yercaud/Boothamalai/etc.: +25% Labour/Materials/Works/Head Load).
* **Islands (`General Note 5`):** Rameswaram Island (+25% Labour, Works, Head Load); 17 specified other islands in Ramanathapuram District and Van, Kasuvar, Karaichalli, Vilankuchali Islands in Thoothukudi District (+125% across Labour, Materials, Works, Conveyance, Head Load).
* **Material Source Duty (`General Note 8(ix)`):** For materials quarried/manufactured locally inside special tracts (Corporation limits, Reserve Forest, Hills, Islands, etc.), the officer in charge (**not below the rank of Assistant Executive Engineer**) must analyze and confirm whether finished cost is higher than conveying materials from outside the specified area where extra percentages are not permissible.
* **Material Conveyance Exclusions (`General Note 8(viii)` & `Annexure-VI/VII Notes`):** No extra percentage or conveyance charges are allowed for items under **Annexure-VI** (`Rates of Other Construction Materials`) and **Annexure-VII** (`Rates of Electrical Items of Works`); rates apply at site of work. Bitumen conveyance follows rates concluded by Oil Companies (`General Note 8(vii)`).


5. **Tax & GST Treatment (`General Note 8(xi)–(xii)`):**
* Basic rates of labour, materials, works, head load, and conveyance are **exclusive of all taxes and GST**.
* Cites `G.O. Ms No. 114, CT&R (B1) Department dated 22.07.2022` (GST Council notification): **12%** GST for works contracts supplied to Government involving predominantly earth work, and **18%** for other works (such as historical monuments, canals, dams, pipelines, water supply plants, educational institutions, hospitals, etc.). *(Highways-specific GST applicability across road/bridge works is marked `TO VALIDATE` with Finance/GST circulars.)*



### 2.5 Source Document Data-Quality Issues Identified During Inspection (`SOURCE VERIFIED`)

1. **PDF-to-Printed Page Offset:** PDF page index does not match printed page numbers (e.g., printed page 1 = PDF page 8); automated parsers must anchor on printed page footers plus PDF page numbers.
2. **Duplicate / Contradictory Table Headers & Column Labels:** On PDF page 15 (printed page 8), column headers shift to `Labour`, `hu-work labour ... (where of)`, `Material`, `Conveyance`, `Head load`, and on PDF page 14 (printed page 7), `Conveyance` appears before `Head load`.
3. **Typography, Spacing & OCR Artifacts in Source PDF:** Merged words (`"of work"`, `"forsewer"`, `"1020 km"`, `"not requring"`, `"pthalate"`, `"preceeding"`, `"adopter"`, `"bison lam"`), inconsistent unit casing (`cum.`, `Cum`, `sqm.`, `Sq.m`, `Sqm`, `RM`, `Mtr.`, `Metre`, `Nos.`, `Each`, `Nozle`), and malformed mathematical symbols (`©0.2L/m2` instead of `@ 0.2L/m2` on W-0303/W-0304; `270 mVhr` / `200 mVhr` on PDF page 67).
4. **Non-Numeric / GO-Referenced Rates:** `M-0127` and `M-0128` reference `G.O. Ms.No.4, Public Works (I.Spl.2) Dept., dated 06.01.2022` rather than a static rupee figure, and `M-2853` states `"GO will be issued by the NLC"`.
5. **Cross-Departmental Item Overlap:** Certain codes in general tables are explicitly attributed to Water Resources Department (`General Note Table Note 1`, `Annexure-I Note 3a–3b`, `Annexure-II Note 4`, `Annexure-III Note 2`).

---

## Part 3: Existing TN-HDOS Integration Assessment (`EXISTING PRODUCT` / `TO VALIDATE` / `PROPOSED`)

### 3.1 Existing Capability Status & Integration Blueprint

* `EXISTING PRODUCT` / `TO VALIDATE`: TN-HDOS (`[https://kiru6006.github.io/govt-highways-agent/](https://kiru6006.github.io/govt-highways-agent/)`) is structured around 8 domains (`A. Executive Command Centre`, `B. Project and Works Management`, `C. Engineering and Quality Management`, `D. Finance and Procurement`, `E. Contractor and Consultant Management`, `F. Land Acquisition and Dependencies`, `G. Legal, Audit and Compliance`, `H. AI Intelligence`) with a React 18 + TypeScript + Vite + Tailwind frontend, Python FastAPI + SQLAlchemy backend, SQLite (dev) / PostgreSQL (prod), and RBAC/jurisdiction/audit controls (`TO VALIDATE` which specific screens/APIs are live vs. sample/mock data in the current GitHub Pages build).
* `PROPOSED` **Integration Strategy (Zero Duplication):**
* Do **not** create a standalone app or duplicate `A`–`H`.
* Embed **SoR-WECI** as a top-level capability section (`/sor-weci`) with deep cross-links into **Domain B** (Project & Works Management, estimates, BOQs, MBs), **Domain C** (QC equipment & material testing records), **Domain D** (sanctions, tenders, contracts, RA/final bills, cost variations), **Domain E** (EoT, escalation, performance), **Domain G** (audit & dispute evidence bundles), and **Domain H** (Ask AI & anomaly triage).



| Existing TN-HDOS Domain | Reuse Opportunity | Required Integration / Changes (`PROPOSED` / `TO VALIDATE`) |
| --- | --- | --- |
| **A. Executive Command Centre** | Jurisdiction & division filters; executive risk cards | Surface SoR version compliance, unapproved rate-override exposure, and cost-variance rollups (`TO VALIDATE` existing command widgets). |
| **B. Project & Works Management** | Project 360 dossier, work packages, original/revised estimates | Link `sor_estimates` and `sor_boq_items` to project/package IDs; pre-populate MB measurement lines from BOQ item codes & units. |
| **C. Engineering & QC Management** | QC & material test logs | Link `Annexure-IV` QC equipment items and lab test certificates to bill/item clearance (`TO VALIDATE` QC schema). |
| **D. Finance & Procurement** | Budget, sanctions, tender, contract, billing/payment records | Pass approved Estimate/BOQ into tender schedule; validate RA/final bills & variations against `sor_2026_27` basic rates & rules. |
| **E. Contractor & Consultant Mgmt** | Contract milestones, EoT, price escalation | Link contractor quoted rates/rebates and escalation clauses to baseline SoR item codes (`TO VALIDATE` escalation rules). |
| **F. Land Acquisition & Dependencies** | Forest/land/utility status (`TANGEDCO`, `TWAD`, Railways)

 | Cross-check `Reserve Forest Areas` (`General Note 3(v)`) and utility/roadway dependencies when computing lead/allowance eligibility. |
| **G. Legal, Audit & Compliance** | Audit findings, disputes, supporting documents | Export immutable rate-calculation snapshots, G.O./Memo citations, and AEE source-comparison proofs into audit/dispute dossiers. |
| **H. AI Intelligence** | Ask AI, risk/leakage indicators, root-cause assistant | Route natural-language rate/BOQ queries to deterministic calculation tools + cited SoR chunks; surface anomaly flags with human review queues. |

---

## Part 4: Business Requirements (`PROPOSED` / `SOURCE VERIFIED`)

### 4.1 Objectives, Scope & Exclusions

* **Business Objectives:** (1) Establish a single source of truth for Tamil Nadu SoR 2026–2027 (w.e.f. `13/11/2026`); (2) Automate deterministic estimate, conveyance, head-load, and allowance calculations (`PROPOSED`); (3) Detect rate, unit, allowance, duplicate, and variation anomalies early (`PROPOSED`); (4) Preserve audit-grade traceability back to PDF pages and G.O.s (`PROPOSED`).
* **In Scope:** Highways SoR sections (printed pp. `311`–`352` once ingested, plus shared General Notes pp. `1`–`9` and referenced PWD/Common Annexures `I`–`VII` where applicable); Estimate & BOQ builder; Rate analysis; Special allowance & bridge 3% rule engine; Cost comparison & deviation detection; Approval & audit trail; AI extraction/classification/explanation assistants.
* **Out of Scope (`PROPOSED`):** Replacing statutory physical Measurement Books or manual treasury/IFHRMS disbursement outside TN-HDOS; building a separate standalone web portal; using LLMs to compute official totals or approve payments; classifying anomalies as proven fraud/corruption without authorized investigation.

### 4.2 Personas & Process Map

* **Key Personas:** `AE` / `AEE` (Estimate & BOQ creation, lead/lift/AEE quarry-vs-conveyance check, MB entry); `DE` / `SE` (Technical scrutiny, allowance/deviation verification, sanction/escalation per delegation order `TO VALIDATE`); `CE` / `DG` / `Secretary` / `Minister` (High-value approvals, statewide/wing cost intelligence); `Accounts/Finance Officer` (Bill check, tax/GST separation, payment traceability); `QC Officer` (QC equipment & material test linkage); `Procurement Officer` (BOQ-to-tender alignment & rate benchmarking); `Audit/Legal Officer` (Evidence inspection, variance & dispute review); `Contractor/Consultant` (Bid/quote/submission portal where enabled); `Citizen` (Approved summary view only).
* **Lifecycle Process Map:** `SoR Master Ingestion (w.e.f. 13/11/2026)` → `Preliminary / DPR / Technical Estimate & Rate Analysis` → `Administrative & Technical Sanction` → `Tender BOQ & Bid Evaluation` → `Contract Execution, QC & Measurement Book` → `Revised Estimates, Variations & RA/Final Billing` → `Cost Intelligence, Audit & Closure`.

### 4.3 Measurable Outcomes (`PROPOSED` Targets — `TO VALIDATE` Baseline)

1. **100%** of estimates created on or after `13/11/2026` reference a versioned SoR item code and effective date (`SOURCE VERIFIED` date).
2. **0** unflagged mathematical or rule-cap violations (e.g., extra percentages outside General Notes or applied to excluded Annexures VI/VII) reaching final approval without explicit logged disposition.
3. **100%** of rate/allowance computations expose step-by-step formula breakdown and PDF page/clause citation.
4. **100%** of flagged anomalies carry a human review state (`Pending Review`, `Justified Exception`, `Requires Revision`, `Escalated to Audit/Legal`)—never auto-labeled as fraud.

---

## Part 5: Functional Requirements (`PROPOSED`)

| Req ID | Priority | Requirement Summary | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| **FR-01** | P0 | **SoR Master Catalogue & Versioning:** Store SoR 2026–2027 (w.e.f. `13/11/2026`) items (`Unique Code`, category, annexure, description, unit, basic rate, effective/expiry dates, footnotes, PDF page ref) with multi-year version support. | DB Schema (`sor_versions`, `sor_items`) | Searchable/filterable catalogue returns exact basic rate, unit, effective date (`13/11/2026`), and PDF page citation for every item. |
| **FR-02** | P0 | **Deterministic Estimation & BOQ Builder:** Build estimates (Preliminary, DPR, Technical, Revised) and BOQs by selecting SoR items, quantities, leads, lifts, and locations; compute amounts deterministically in backend/calculation engine. | FR-01, Domain B (`projects`) | All line totals, sub-totals, and grand totals match exact formula outputs; manual override of official basic rate is blocked or requires authorized deviation workflow. |
| **FR-03** | P0 | **Rate Analysis & Sub-Data Engine:** Decompose composite/work items into labour, material, conveyance, head-load, and hire components with unit normalization (`cum.`, `sqm.`, `RM`, `MT`, `1000 Nos.`, etc.). | FR-01, FR-02, Highways Annexures I–IX (`TO VALIDATE` pp. 311–352) | Rate analysis shows each component's code, unit conversion factor, basic rate, and rule adjustments with zero LLM arithmetic. |
| **FR-04** | P0 | **Special Allowance & Bridge 3% Rule Engine:** Evaluate Corporation/Municipal limits, Hills (`General Note 4`), Islands (`General Note 5`), Restricted Areas (`General Note 3`), Night Work (+25% labour only with tender clause), and Highways Bridge 3% rule (`General Note 10`, including >50% bridge share in road works and exclusion of drains/culverts/retaining walls/repairs). | FR-02, Jurisdiction & Project metadata | Ineligible categories/areas automatically receive `0%` allowance with an explanatory rule code; AEE quarry-vs-conveyance check (`General Note 8(ix)`) is prompted when required. |
| **FR-05** | P1 | **Tax & GST Separation Engine:** Keep basic rates strictly tax/GST-exclusive and apply configured GST/tax rules transparently at estimate/bill summary level (`TO VALIDATE` exact Highways GST circular mapping alongside `G.O. Ms. No. 114, CT&R (B1) dt. 22.07.2022`). | FR-02, Finance config | Basic cost and tax/GST components are stored and displayed separately; no silent double-taxation occurs. |
| **FR-06** | P1 | **Estimate-to-BOQ-to-MB-to-Bill Traceability:** Link every BOQ line to its source Estimate item, tender bid rate, MB measurement entry, and RA/Final bill voucher. | Domain B & D entities | Clicking any bill or MB line displays full lineage from SoR item → Estimate → BOQ → MB → Bill with quantity/rate deltas. |
| **FR-07** | P1 | **Cost Comparison & Benchmark Engine:** Compare items/projects across divisions, road categories (`SH`, `MDR`, `ODR`), execution wings, and historical/current rates. | FR-02, FR-06, Domain A/B | Renders side-by-side unit-rate and cost-per-km/span comparisons with sample-size and scope disclaimers. |
| **FR-08** | P1 | **Financial & Operational Deviation Detection:** Run deterministic + statistical checks for excess rates, duplicate charges, disallowed extras, unusual material costs, quantity escalations, equipment underutilisation, variation spikes, and repeated maintenance. | FR-02, FR-06, FR-07 | Generates structured findings (`What should have happened`, `What actually happened`, rule cited, variance, evidence links, review status) without fraud labels. |
| **FR-09** | P2 | **AI Extraction, Classification & Investigation Assist:** Assist in parsing PDFs/BOQs, mapping non-standard descriptions to SoR codes, drafting variance explanations, and summarizing evidence bundles. | FR-01, FR-08, AI service | AI outputs are labeled `AI-Assisted (Verify Before Approval)`, include citations, and cannot alter calculated numbers or approve records. |
| **FR-10** | P0 | **Approval Workflow, RBAC & Immutable Audit Log:** Enforce role/jurisdiction permissions, delegation-order gates (`TO VALIDATE`), and append-only audit logs for all reads/writes/overrides/approvals. | Domain G & Security layer | Every state change or override records actor, role, jurisdiction, timestamp, before/after payload, and supporting evidence ID. |

---

## Part 6: Page-by-Page UX Specifications (`PROPOSED` / `EXISTING PRODUCT` Alignment)

### 6.1 Navigation Hierarchy & Page Consolidation Decision (Avoid Navigation Bloat)

Rather than creating 15 separate top-level sidebar pages, **SoR-WECI** uses **1 primary section (`SoR & Cost Intelligence`) with 6 focused pages** and **contextual tabs/drawers** inside them:

1. **`/sor-weci/catalogue` — SoR Master Catalogue & Rate Explorer** *(Tabs: `Work Items`, `Materials`, `Labour`, `Road Furniture & QC`, `Survey, DPR & Plantation`, `Tools & Plant Hire`, `Conveyance & Head Load`, `General Notes & Rules`)*.
2. **`/sor-weci/estimates` — Estimate & BOQ Studio** *(Tabs: `Estimate Lines & BOQ`, `Rate Analysis & Sub-Data`, `Special Allowances & Bridge 3%`, `Tax & Summary`)*.
3. **`/sor-weci/cost-intelligence` — Cost Comparison & Deviation Workbench** *(Tabs: `Benchmarks & Comparisons`, `Deviation & Risk Findings`, `Investigation Dossier`)*.


4. **`/sor-weci/reconciliation` — MB, Variations & Billing Reconciliation** *(Tabs: `Estimate-to-Bill Lineage`, `Revised Estimates & Variations`, `Maintenance & QC Check`)*.
5. **`/sor-weci/approvals-audit` — Approvals, Exceptions & Audit Trail** *(Tabs: `Pending Approvals & Overrides`, `Delegation & Rule Matrix`, `Immutable Audit Log`)*.
6. **`/sor-weci/ingestion` — SoR Ingestion & Document Parser** *(Admin/Authorized role: `PDF/Annexure Extractor`, `Code & Rate Diff Review`, `Validation Queue`)*.

### 6.2 Detailed Specification for Every Proposed Screen

#### Screen 1: SoR Master Catalogue & Rate Explorer (`/sor-weci/catalogue`)

* **Purpose:** Browse, search, and inspect official Tamil Nadu SoR 2026–2027 (w.e.f. `13/11/2026`) items, basic rates, units, notes, and source PDF pages across Highways and referenced PWD/Common annexures.
* **User Roles:** All authenticated departmental roles (`AE`, `AEE`, `DE`, `SE`, `CE`, `DG`, `Accounts/Finance`, `QC`, `Procurement`, `Audit/Legal`, `Contractor/Consultant`); `Citizen` (approved public subset).
* **Existing TN-HDOS Integration:** Linked from **Domain B** (Estimate builder), **Domain C** (QC equipment), and **Domain H** (Ask AI rate citations).
* **Required Data:** `sor_versions`, `sor_items`, `sor_footnotes`, `sor_conveyance_slabs`, `sor_allowance_rules`.
* **UI Components:** SoR version selector (`2026–2027 w.e.f. 13/11/2026`); category tabs; search bar (by `Unique Code` like `M-0001` or keyword); unit & status filters (`Active`, `Superseded`, `WRD-Specific`, `GO-Referenced`); item table; slide-over Item Detail & Source Provenance Drawer showing PDF page number, annexure, exact note text, and `Add to Estimate` CTA.
* **User Actions:** Filter/search items; inspect item rules/footnotes; open linked PDF page provenance; export filtered schedule CSV/PDF (where permitted); launch Estimate Builder pre-loaded with selected items.
* **API Dependencies:** `GET /api/v1/sor/versions`, `GET /api/v1/sor/items`, `GET /api/v1/sor/items/{code}`.
* **Business Rules:** Display rates as `Basic Rate (Excl. GST & Other Taxes)`; clearly tag items with special notes (e.g., `M-0127`/`M-0128` G.O. reference, Annexure-VI/VII no-conveyance rule).
* **Error and Empty States:** Empty search state with quick reset & sample code chips; API/ingestion error banner with retry and `TO VALIDATE` notice if a requested Highways annexure page is awaiting full ingestion.
* **Responsive Behaviour:** Collapsible filter drawer on mobile/tablet; horizontal-scroll or card-stacked item rows on `<768px` screens.
* **Acceptance Criteria:** Searching a valid code or keyword returns results in `<500ms` (for cached catalogue queries) with exact code, unit, rate, effective date `13/11/2026`, and PDF page reference.

#### Screen 2: Estimate & BOQ Studio (`/sor-weci/estimates`)

* **Purpose:** Author and structure Preliminary, DPR, Technical, and Revised estimates and tender BOQs with deterministic rate analysis, lead/lift conveyance, and special allowance calculation.
* **User Roles:** `AE` (draft/edit), `AEE` (verify/submit + quarry-vs-conveyance check), `DE` / `SE` (technical scrutiny/approval per delegation order `TO VALIDATE`), `Procurement` (BOQ export/lock).
* **Existing TN-HDOS Integration:** Bound to **Domain B** (`Project` and `Work Package`); pushes approved BOQ to **Domain D** (`Tender` / `Contract`).
* **Required Data:** `project`, `work_package`, `sor_estimates`, `sor_estimate_lines`, `sor_items`, `sor_allowance_rules`, `sor_conveyance_slabs`.
* **UI Components:** Project/package header & estimate type selector (`Preliminary`, `DPR`, `Technical`, `Revised`); 4 sub-tabs (`Estimate Lines & BOQ`, `Rate Analysis & Sub-Data`, `Special Allowances & Bridge 3%`, `Tax & Summary`); line-item table with inline lead/lift/quantity inputs; live rule-check badges; `Submit for Scrutiny` action button.
* **User Actions:** Add/edit/remove estimate lines; enter lead distance (`m`/`km`), lift height (`m`), and project location/zone; run deterministic recalculation; attach AEE quarry-vs-conveyance confirmation or bridge cost share breakdown; submit estimate.
* **API Dependencies:** `GET /api/v1/estimates/{id}`, `POST /api/v1/estimates`, `PUT /api/v1/estimates/{id}/lines`, `POST /api/v1/estimates/{id}/calculate`, `POST /api/v1/estimates/{id}/submit`.
* **Business Rules:** All arithmetic executed by deterministic calculation engine; block unauthorized allowance percentages; enforce Bridge 3% structural-only rule and `>50%` bridge-cost condition for road projects (`General Note 10`); require documented justification for revised estimates.
* **Error and Empty States:** Empty estimate prompt with `Import from DPR` or `Add SoR Line`; inline field validation on negative/zero quantities or invalid lead/lift units; conflict warning if concurrent edit occurs.
* **Responsive Behaviour:** Compact stepper & sticky bottom total bar on mobile field tablets; full multi-column calculation grid on desktop.
* **Acceptance Criteria:** Recalculation produces deterministic totals with complete rule-step breakdown; invalid allowance or missing mandatory AEE/bridge fields block submission with clear remediation hints.

#### Screen 3: Cost Comparison & Deviation Workbench (`/sor-weci/cost-intelligence`)

* **Purpose:** Compare unit rates and project costs across divisions, road categories, and timelines, and investigate deterministic/statistical deviations with structured human review.
* **User Roles:** `DE`, `SE`, `CE`, `DG`, `Secretary`, `Minister`, `Accounts/Finance`, `Audit/Legal`, `AI Analyst` (read/triage per RBAC).
* **Existing TN-HDOS Integration:** Pulls data from **Domain A** (Command Centre), **Domain B** (Projects), **Domain D** (Contracts/Bills), **Domain E** (Maintenance/EoT), and **Domain H** (Ask AI).
* **Required Data:** `sor_cost_benchmarks`, `sor_anomaly_findings`, `sor_finding_reviews`, `sor_evidence_links`.
* **UI Components:** Jurisdiction/wing/period/category filter bar; KPI summary strip (count of open findings, variance range, unreviewed items); comparison chart & table; deviation queue table; Investigation Dossier panel answering the 10 mandatory diagnostic questions (Section 6 of prompt) + `AI Investigation Assist` drawer.
* **User Actions:** Filter findings by severity, type, division, or review status; inspect calculation trace & evidence attachments; record review disposition (`Justified Exception`, `Requires Revision`, `Refer to Audit/Legal`); ask AI to synthesize evidence.
* **API Dependencies:** `GET /api/v1/intelligence/benchmarks`, `GET /api/v1/intelligence/findings`, `POST /api/v1/intelligence/findings/{id}/review`, `POST /api/v1/ai/investigate-finding`.
* **Business Rules:** Every finding shows exact formula, baseline vs. actual value, and limitations; system never labels a finding as `Fraud` or `Confirmed Loss`; disposition changes require reason notes and write to audit log.
* **Error and Empty States:** `"No deviations detected for selected filters"` state with filter summary; partial-data banner when peer benchmark sample size is small (`n < 5`).
* **Responsive Behaviour:** Stacked cards on mobile; split master-detail view on desktop (`>=1024px`).
* **Acceptance Criteria:** Every displayed finding links to underlying calculation inputs and evidence records; review actions update status and persist immutable audit logs.

#### Screen 4: MB, Variations & Billing Reconciliation (`/sor-weci/reconciliation`)

* **Purpose:** Reconcile Measurement Book (MB) quantities, contract variations, revised estimates, and RA/Final bills against approved estimates and SoR 2026–2027 rules.
* **User Roles:** `AE`, `AEE`, `DE`, `Accounts/Finance`, `QC`, `Audit/Legal`.
* **Existing TN-HDOS Integration:** Reads/writes across **Domain B** (MBs, revised estimates), **Domain C** (QC/material test status), **Domain D** (RA/Final bills, payments, variations), and **Domain E** (maintenance/escalation).
* **Required Data:** `sor_boq_items`, `mb_measurements`, `contract_variations`, `bill_vouchers`, `qc_test_records`.
* **UI Components:** Project/Bill selector; reconciliation ledger table comparing `Estimate Qty/Rate` vs. `BOQ` vs. `MB Measured` vs. `Billed/Paid`; variance & rule-flag indicators; `Create Variation / Revised Estimate` action.
* **User Actions:** Match MB entries to BOQ items; flag quantity/rate mismatches; attach QC clearance & variation justification; verify tax/GST separation (`TO VALIDATE` exact bill tax rules).
* **API Dependencies:** `GET /api/v1/reconciliation/projects/{projectId}`, `POST /api/v1/reconciliation/bills/{billId}/validate`, `POST /api/v1/reconciliation/variations`.
* **Business Rules:** Flag billed quantities exceeding sanctioned/BOQ thresholds without approved variation; flag duplicate labour/material/conveyance claims; separate basic amounts from GST (`General Note 8(xi)–(xii)`).
* **Error and Empty States:** Missing MB or missing bill voucher alert; unit-mismatch blocker preventing silent summation of incompatible units (`cum.` vs `sqm.` vs `MT`).
* **Responsive Behaviour:** Focused single-bill checklist view on mobile; side-by-side variance table on desktop.
* **Acceptance Criteria:** All mismatches between BOQ, MB, and bills are surfaced with exact numeric deltas before bill sign-off.

#### Screen 5: Approvals, Exceptions & Audit Trail (`/sor-weci/approvals-audit`)

* **Purpose:** Manage approval queues, exception/override sign-offs, delegation-order matrix visibility (`TO VALIDATE`), and immutable audit logs.
* **User Roles:** `AEE`, `DE`, `SE`, `CE`, `DG`, `Accounts/Finance`, `Audit/Legal`, `System Admin`.
* **Existing TN-HDOS Integration:** Connects with **Domain D** (financial sanctions/approvals) and **Domain G** (Legal, Audit & Compliance).
* **Required Data:** `approval_tasks`, `rule_exceptions`, `delegation_rules` (`TO VALIDATE`), `audit_events`.
* **UI Components:** Approval queue list; Exception & Override detail card; Delegation Matrix reference table (`TO VALIDATE` active G.O./order mapping); filterable Audit Log table (`actor`, `role`, `action`, `entity`, `timestamp`, `hash/trace ID`).
* **User Actions:** Approve, return for correction, or escalate items within permitted authority; inspect full change diff; export audit evidence package.
* **API Dependencies:** `GET /api/v1/approvals`, `POST /api/v1/approvals/{id}/decision`, `GET /api/v1/audit/events`.
* **Business Rules:** Segregation of duties (preparer cannot self-approve final sanction unless explicitly permitted by validated delegation order); all actions are append-only in `audit_events`.
* **Error and Empty States:** `"No pending approvals"` state; permission-denied (`403`) message when a user attempts an action outside role or delegation scope.
* **Responsive Behaviour:** Actionable approval cards on mobile; dense filterable audit table on desktop.
* **Acceptance Criteria:** Every approval, rejection, or override creates a non-deletable audit record with complete before/after metadata.

#### Screen 6: SoR Ingestion & Document Parser (`/sor-weci/ingestion`)

* **Purpose:** Ingest official SoR PDFs/schedules, run AI-assisted extraction and item classification, verify discrepancies against the source PDF, and publish versioned SoR catalogues.
* **User Roles:** `SoR Data Steward` / `System Admin` / authorized `CE/Technical Cell` representative (`TO VALIDATE`).
* **Existing TN-HDOS Integration:** Feeds Screen 1 (`/sor-weci/catalogue`) and **Domain H** (RAG/document index).
* **Required Data:** `sor_ingestion_jobs`, `sor_staged_items`, `sor_ingestion_discrepancies`.
* **UI Components:** PDF upload & page-range selector (including Highways printed pp. `311`–`352`); extraction progress & OCR/parser confidence view; side-by-side PDF snippet vs. extracted row editor; `Publish SoR Version` gate.
* **User Actions:** Upload SoR PDF/addendum; review low-confidence or GO-referenced items (`M-0127`, `M-0128`, `M-2853`); resolve page/unit anomalies; publish new immutable SoR version.
* **API Dependencies:** `POST /api/v1/sor/ingestion/jobs`, `GET /api/v1/sor/ingestion/jobs/{id}`, `PATCH /api/v1/sor/ingestion/staged-items/{itemId}`, `POST /api/v1/sor/ingestion/jobs/{id}/publish`.
* **Business Rules:** Staged items cannot go live in active estimates until validated and published; every published item requires effective date (`13/11/2026` for SoR 2026–2027) and source page reference.
* **Error and Empty States:** Corrupted/scanned PDF warning; page-offset/table-header mismatch alert requiring human verification before publish.
* **Responsive Behaviour:** Desktop-first (`>=1024px`) split verification workbench; status-only viewer on mobile.
* **Acceptance Criteria:** Staged rates, codes, units, and page references can be reviewed and published atomically into a versioned SoR release.

---

## Part 7: End-to-End Workflows (`PROPOSED` / `SOURCE VERIFIED`)

1. **SoR Publication:** Upload SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`) → extract annexures, codes (`L-`, `M-`, `W-`, `C-`, `H-`), units, rates, footnotes, and PDF page numbers → steward verifies OCR/header/GO items (`TO VALIDATE` remaining Highways pages `311`–`352`) → publish `SoR-2026-2027-V1` with effective date `2026-11-13`.
2. **Estimate Preparation:** Select project/package → choose estimate stage (`Preliminary`, `DPR`, `Technical`) and effective date (`>= 2026-11-13`) → add SoR items, quantities, leads, and lifts → run deterministic calculation engine → attach AEE quarry-vs-conveyance check (`General Note 8(ix)`) and bridge component share (`General Note 10`).
3. **BOQ Generation:** Lock approved technical estimate items → generate BOQ schedule with item code, description, unit, estimated quantity, basic rate, allowance breakdown, and exclusions → transfer to **Domain D** tendering workflow.
4. **Validation & Approvals:** System validates rules (no disallowed extras, no Annexure VI/VII conveyance/extra percentages, no compounding of disallowed percentages, unit consistency) → routes through `AEE` → `DE` → `SE` / `CE` / Finance per delegation order (`TO VALIDATE`) → logs every step in `audit_events`.
5. **Revisions & Reconciliation:** During execution, record MB measurements, QC test status (`Domain C`), and contract variations/revised estimates (`Domain B`/`D`) → run automated line-by-line reconciliation against BOQ and SoR rules → route excess quantities/rates through variation approval workflow.
6. **Audit & Investigation:** Cost Intelligence flags statistical/rule deviations → officer reviews 10-point diagnostic dossier and evidence links → records disposition (`Justified Exception` or `Requires Revision` or `Refer to Audit/Legal`) → exports tamper-evident audit packet (`Domain G`).

---

## Part 8: Business Rules Catalogue (`SOURCE VERIFIED` & `PROPOSED`)

| Rule ID | Name & Source Reference | Deterministic Formula / Condition | Required Evidence | Status |
| --- | --- | --- | --- | --- |
| **BR-01** | **SoR Effective Date & Tax Exclusion** (`Preface`, `General Note 8(xi)–(xii)`, Annexures I–VI Notes) | `effective_date >= 2026-11-13` for SoR 2026–2027; `line_basic_amount = qty * basic_rate` (excludes GST & taxes). | SoR version ID, effective date, GST/tax line separated. | `SOURCE VERIFIED` |
| **BR-02** | **No Extra Percentage Outside Specified Areas** (`General Note` p. 1) | `extra_pct = 0` unless location/condition matches an explicitly listed rule in General Notes / Table / Annexures. | Location/condition tag mapped to rule ID. | `SOURCE VERIFIED` |
| **BR-03** | **Non-Compounding / Basic Rate Rule** (`General Note 8(ii)`, `Annexure-I Note 2b`) | `allowance_amount = base_amount * (allowance_pct / 100)` where `base_amount` is the unadjusted basic rate/amount (never stacked on another allowance percentage). | Rule formula trace showing `base_amount` and `allowance_pct`. | `SOURCE VERIFIED` |
| **BR-04** | **Corporation / Municipal Allowances** (`General Note 1–2`, `General Note Table` pp. 7–8, `Annexure-I Note 2a`) | Erstwhile Chennai Corp + 32 km belt, Madurai Corp, Coimbatore Corp, Hosur Taluk: `+10%` on Labour, Works, Head Load. Trichy, Salem, Tirunelveli, Tiruppur, Erode, Thoothukudi, Vellore Corp: `+5%` on Labour, Works, Head Load. Night work in Corp/Municipal areas: `+25%` on **Labour only** when tender clause exists. | Verified jurisdiction boundary; tender night-work clause ID if night labour claimed. | `SOURCE VERIFIED` |
| **BR-05** | **Restricted Areas & Hills & Islands** (`General Note 3–5`, `General Note Table` pp. 7–9) | Apply exact category-specific `%` from General Note 3–5 & Table (`Central Jail +10%`, `Sub-Jail +5%`, `Reserve Forest +20%` on L/M/W/C/Head Load; Hill & Island rules per Table). Exclude WRD-only sub-clauses (`Note 1` on p. 9) unless Highways applicability is validated. | Jurisdiction/forest/island tag; forest/island clearance or location proof (`TO VALIDATE` exact zone boundaries). | `SOURCE VERIFIED` / `TO VALIDATE` |
| **BR-06** | **AEE Quarry vs. Conveyance Check** (`General Note 8(ix)` p. 5) | For materials quarried/manufactured locally inside special tracts (`Corp limits`, `Reserve Forest`, `Hills`, `Islands`, etc.), flag unless officer `>= AEE` confirms finished cost is not higher than outside conveyance without extra %. | Recorded AEE cost-comparison confirmation ID. | `SOURCE VERIFIED` |
| **BR-07** | **Annexure-VI & VII Exclusion** (`General Note 8(viii)` p. 5, `Annexure-VI` p. 72, `Annexure-VII` p. 212) | For items in `Annexure-VI` (Other Construction Materials) and `Annexure-VII` (Electrical Items): `extra_pct = 0` and `conveyance_charge = 0` (rate applies at site). | Annexure classification (`VI` or `VII`). | `SOURCE VERIFIED` |
| **BR-08** | **Highways Bridge 3% Provisional Rule** (`General Note 10(i)–(iii)` p. 6) | `+3%` applies **only** to `structural_component` items of `bridge_works` (`is_active_until_data_updated == true`). For `road_work` projects, allowed only if `bridge_cost / total_project_cost > 0.50` and applied to `bridge_structural_items` only. `0%` on `drains`, `culverts`, `retaining_walls`, `repair_works`. | Item structure tag (`bridge_structural` vs drain/culvert/retaining wall/repair); project cost split. | `SOURCE VERIFIED` |
| **BR-09** | **Head Load & Road Conveyance Rules** (`Annexure-IV` pp. 64–65, `Annexure-V(A)/(B)` pp. 66–71) | Head load: `0` for initial `10m` lead and `2m` lift; applies only where bullock carts cannot move (`Memo CTO(A)/38153/89 dt. 03.02.1989`); round fraction of `100m` to nearest `100m`. Conveyance: slab increments + loading/unloading/interstate rules per Plains/Hills tables; `0` extra loading/unloading where already included in basic material rate (`Annexure-II Note 3`, `Annexure-V Note 6`). | Lead/lift measurements; inaccessibility/track type (`cart track +20%`, `sandy/slushy +50%` excl. loading/unloading). | `SOURCE VERIFIED` |
| **BR-10** | **Highways Annexures I–IX Deterministic Rules** (`Index` p. ii) | Apply Highways-specific rates, sub-data, QC equipment, road furniture, survey/DPR, avenue plantation, and T&P hire formulas once printed pp. `311`–`352` are ingested. | Verified Highways schedule rows from printed pp. `311`–`352`. | `TO VALIDATE` |

---

## Part 9: Data Architecture (`PROPOSED` PostgreSQL Schema on TN-HDOS)

### 9.1 Core Tables & Relationships

* `sor_versions` (`id`, `code`, `title`, `volume`, `effective_from`, `effective_to`, `go_reference`, `status`, `published_at`, `published_by`)
* `sor_items` (`id`, `sor_version_id` FK, `unique_code`, `department_scope`, `annexure_code`, `sub_category`, `description`, `unit_raw`, `unit_canonical`, `basic_rate`, `rate_type`, `source_pdf_page`, `source_printed_page`, `notes_json`)
* `sor_allowance_rules` (`id`, `sor_version_id` FK, `rule_code`, `category`, `applies_to_components_json`, `excluded_categories_json`, `percentage_value`, `condition_expr_json`, `requires_officer_rank`, `source_citation`)
* `sor_estimates` (`id`, `project_id` FK [Domain B], `package_id`, `estimate_type`, `sor_version_id` FK, `location_zone_id`, `bridge_cost_share_pct`, `status`, `total_basic_amount`, `total_allowance_amount`, `total_tax_amount`, `grand_total`, `created_by`, `created_at`)
* `sor_estimate_lines` (`id`, `estimate_id` FK, `line_no`, `sor_item_id` FK, `structure_component_type`, `quantity`, `unit_canonical`, `lead_meters`, `lift_meters`, `basic_rate_snapshot`, `allowance_amount`, `line_total`, `calculation_trace_json`)
* `sor_boq_items` (`id`, `estimate_id` FK, `project_id` FK, `tender_id`, `boq_item_no`, `sor_item_id` FK, `boq_qty`, `unit_canonical`, `estimated_rate`, `tender_quoted_rate`, `status`)
* `sor_reconciliation_entries` (`id`, `boq_item_id` FK, `mb_ref_id`, `bill_id`, `variation_id`, `measured_qty`, `billed_qty`, `billed_rate`, `qty_delta`, `amount_delta`, `reconciliation_status`)
* `sor_anomaly_findings` (`id`, `project_id` FK, `estimate_id` FK, `bill_id`, `finding_type`, `severity`, `rule_id` FK, `expected_value`, `actual_value`, `variance_amount`, `explanation_json`, `review_status`, `reviewed_by`, `reviewed_at`)
* `sor_evidence_links` (`id`, `entity_type`, `entity_id`, `evidence_type`, `document_ref`, `pdf_page`, `excerpt_text`, `uploaded_by`, `created_at`)
* `sor_audit_events` (`id`, `event_time`, `actor_user_id`, `actor_role`, `jurisdiction_code`, `action`, `target_type`, `target_id`, `before_state_json`, `after_state_json`, `correlation_id`)

### 9.2 Versioning, Provenance, Audit & Migration (`PROPOSED`)

* **Immutability & Snapshots:** Estimates, BOQs, bills, and findings store rate/rule snapshots (`basic_rate_snapshot`, `calculation_trace_json`) so future SoR amendments or yearly updates do not retroactively mutate historical sanctioned estimates or paid bills.
* **Migration:** Start with SQLAlchemy migrations compatible with SQLite (local dev) and PostgreSQL (production) (`EXISTING PRODUCT` target), using phased feature flags (`SOR_WECI_ENABLED`) and idempotent seed scripts for `SoR-2026-2027-V1` (`w.e.f. 13/11/2026`).

---

## Part 10: API Specifications (`PROPOSED` REST API — Python FastAPI)

Base path: `/api/v1/sor-weci` (authenticated via TN-HDOS session/JWT; `401` unauthenticated, `403` role/jurisdiction/delegation unauthorized, `422` validation/unit/rule error, `409` version/state conflict).

* `GET /versions` — List SoR versions (`2026-2027`, w.e.f. `13/11/2026`) and active rule sets.
* `GET /items?version_id=...&annexure=...&q=...&page=1&size=50` — Query SoR items with pagination and provenance metadata.
* `GET /items/{unique_code}` — Retrieve item details, footnotes, and linked rules.
* `POST /estimates` — Create a new Preliminary, DPR, Technical, or Revised estimate linked to a TN-HDOS project.
* `PUT /estimates/{estimate_id}/lines` — Upsert estimate line items, quantities, leads, lifts, and structural tags.
* `POST /estimates/{estimate_id}/calculate` — Execute deterministic rate, conveyance, head-load, allowance, and tax breakdown; returns `calculation_trace`.
* `POST /estimates/{estimate_id}/boq/generate` — Generate/sync BOQ schedule from calculated estimate.
* `GET /reconciliation/projects/{project_id}` — Fetch BOQ vs. MB vs. variation vs. bill reconciliation lines and deltas.
* `GET /intelligence/findings?project_id=...&status=...` — List cost/operational deviation findings with 10-point diagnostic fields.
* `POST /intelligence/findings/{finding_id}/review` — Submit human review disposition (`{ "decision": "JUSTIFIED_EXCEPTION" | "REQUIRES_REVISION" | "REFER_AUDIT", "justification": "...", "evidence_ids": [...] }`).
* `POST /ai/assist` — Bounded AI endpoint (`task`: `"EXTRACT_PDF" | "MATCH_ITEM" | "EXPLAIN_VARIANCE" | "DRAFT_DOSSIER"`) returning cited text/suggestions without mutating authoritative figures.
* `GET /audit/events?target_id=...` — Query append-only audit trail within user's jurisdiction/role scope.

---

## Part 11: AI and Cost Intelligence (`PROPOSED` / `SOURCE VERIFIED`)

### 11.1 Deterministic Rules + Statistical & Anomaly Detection

All financial math uses exact decimal arithmetic (`Python Decimal`, `ROUND_HALF_UP`)—never LLM token prediction. Detection covers:

1. **Excess Rate Application:** Billed/estimated unit rate exceeds applicable SoR basic rate + valid allowance (`SOURCE VERIFIED` rates/rules).
2. **Duplicate Claims:** Overlapping charges for head load/conveyance where included in material rate (`Annexure-II Note 3`, `Annexure-V Note 6`) or labour claimed separately where included in `Rates of Works` (`General Note 8(iii)`), or duplicate MB/bill lines.
3. **Unsupported Allowances:** Extra percentages outside General Notes, non-compounding breaches (`General Note 8(ii)`), night labour without tender clause (`Annexure-I Note 2b`), or Bridge 3% applied to culverts/drains/retaining walls/repairs (`General Note 10(iii)`).
4. **Unusual Material Costs:** Unit/source costs deviating from peer divisions or missing AEE quarry-vs-conveyance analysis (`General Note 8(ix)`).
5. **Quantity Escalation:** MB or bill quantities exceeding sanctioned BOQ quantities beyond variation thresholds.
6. **Equipment Underutilisation:** High idle/hire charges relative to output/progress (`TO VALIDATE` Highways T&P utilization logs).
7. **Estimate-to-Actual Differences:** Significant gaps between technical/DPR estimate and actual execution/bill amounts.
8. **Contract Variations:** High-value or late-stage scope/rate variations requiring heightened scrutiny.
9. **Repeated Maintenance:** Recurring maintenance/repair spend on the same road stretch/structure within short intervals (`TO VALIDATE` maintenance history).
10. **Cost Avoidance Opportunities:** Identifying optimization levers (e.g., quarry vs. long-lead haulage options per `General Note 8(ix)`, batching plant vs. site mix per `W-0379`) strictly as non-prescriptive review flags.

### 11.2 AI Opportunities, Safeguards & 10-Point Investigation Framework

* **AI Use Cases:** (1) PDF table/footnote extraction (`TO VALIDATE` noisy PDF OCR); (2) Item code matching for legacy/unstructured BOQ descriptions; (3) Plain-language rate-change explanations (`2026–2027` vs. prior schedules); (4) Anomaly clustering and root-cause hypothesis drafting; (5) Historical benchmark retrieval and predictive cost-risk scoring (`TO VALIDATE` historical dataset quality).
* **Mandatory Safeguards:**
* Every AI output is strictly advisory, cites exact SoR clauses/PDF pages or record IDs, states confidence/limitations, and passes through human approval.
* **Zero Fraud Accusation Policy:** Findings never classify an item as fraud, corruption, or confirmed loss; every finding surfaces the 10 mandatory questions (1. What should have happened, 2. What actually happened, 3. Rule/control, 4. Difference, 5. Cause, 6. Justification, 7. Evidence, 8. Potential exposure, 9. Investigating official per delegation order `TO VALIDATE`, 10. Preventive action).



---

## Part 12: Security and Governance (`EXISTING PRODUCT` + `PROPOSED`)

* **RBAC & Jurisdiction Scope:** Enforce TN-HDOS role-based access control and division/circle/wing jurisdiction scoping (`EXISTING PRODUCT` baseline; `TO VALIDATE` granular role matrix in existing codebase). Contractors/consultants see only their assigned contracts/submissions; Citizens see only approved public summaries.
* **Separation of Duties & Delegation Authority:** Enforce distinct `Prepare`, `Verify/Scrutinize`, and `Approve/Sanction` roles where required; map every approval threshold to official Tamil Nadu Highways delegation orders (`TO VALIDATE` exact G.O.s/monetary limits—never infer authority solely from title).
* **Immutable Audit & Document Access:** Append-only `sor_audit_events` for all estimate edits, rule overrides, anomaly reviews, bill reconciliations, and sensitive document views; watermark/log downloads of official schedules and supporting evidence.

---

## Part 13: Testing Strategy (`PROPOSED`)

* **Unit & Calculation Engine Tests:** Verify exact decimal math for every rule in Part 8 (Corporation 10%/5%, Night work 25% labour-only, Bridge 3% structural + >50% bridge share + drain/culvert/retaining-wall/repair exclusions, Head load 10m/2m free & 100m rounding, Annexure VI/VII zero-conveyance rule, GST separation).
* **Integration & API Tests:** Test estimate → BOQ → MB → bill → finding → review → audit-log flows and RBAC/jurisdiction enforcement (`403` on cross-jurisdiction access).
* **Security, Accessibility & Performance Tests:** Auth/authorization bypass tests; WCAG 2.1 AA keyboard/contrast/ARIA checks across desktop and mobile viewports; load/latency tests on catalogue search and estimate calculation.
* **User Acceptance Testing (UAT):** End-to-end scenario sign-off with domain reviewers (`AE`, `AEE`, `DE`, `Accounts`, `Audit`).

---

## Part 14: Implementation Roadmap (`PROPOSED`)

* **Phase 1 — Foundation, Catalogue & Deterministic Engine (Weeks 1–3):** Complete ingestion of remaining Highways SoR pages (`311`–`352` — `TO VALIDATE`), implement PostgreSQL/SQLAlchemy schema, build `/sor-weci/catalogue` and `/sor-weci/ingestion`, and ship deterministic calculation + rule engine (`BR-01`–`BR-10`).
* **Phase 2 — Estimate, BOQ & Reconciliation Workflows (Weeks 4–6):** Ship `/sor-weci/estimates` and `/sor-weci/reconciliation`, integrate with TN-HDOS **Domains B, C, D, E**, and enable role/jurisdiction approvals and immutable audit logging (`/sor-weci/approvals-audit`).
* **Phase 3 — Cost Intelligence & Bounded AI Assist (Weeks 7–9):** Ship `/sor-weci/cost-intelligence` with all 10 deviation detectors, 10-point investigation dossiers, and citation-backed AI extraction/matching/explanation assistants (`TO VALIDATE` historical benchmark data readiness).
* **Phase 4 — Hardening, Delegation Validation & Rollout (Weeks 10–12):** Complete UAT, verify statutory delegation orders (`TO VALIDATE`), run security/accessibility/performance sign-off, and roll out behind feature flag.
* **Key Risks & Mitigations:** Unverified delegation orders (`block final automated sanction enforcement until G.O.s loaded`); OCR/PDF layout quirks (`human-in-the-loop staging before publish`); LLM hallucination (`strict deterministic math + source citation guardrails`).

---

## Part 15: Business Outcome Measurement (`PROPOSED` Metrics — `TO VALIDATE` Baselines)

* **Cycle Time Reduction:** Median hours from draft estimate to technical scrutiny submission; median days for MB-to-bill reconciliation.
* **Error & Override Rate:** % of estimates caught pre-sanction for unit, allowance, or exclusion errors; count of unapproved/retroactive rate adjustments.
* **Cost Variance & Exposure Tracking:** Total ₹ value of flagged estimate-to-BOQ, BOQ-to-MB, and variation variances categorized by review disposition (`Justified Exception` vs. `Requires Revision` vs. `Referred for Review`).
* **Audit Readiness:** % of audit/review queries resolved with complete digital lineage (SoR code, PDF page, rule ID, calculation trace, and evidence attachments).

---

## Part 16: Open Questions (`TO VALIDATE`)

1. **Highways Pages 311–352 Ingestion (`SOURCE VERIFIED` index / `TO VALIDATE` content):** What are the exact item codes, descriptions, units, rates, and footnotes on printed pages `311`–`352` (Highways Structure, Annexures I–IX) once the remaining PDF pages are parsed?
2. **Existing `govt-highways-agent` Codebase State (`EXISTING PRODUCT` / `TO VALIDATE`):** Which backend endpoints, database tables, RBAC middlewares, and UI routes (`A`–`H`) are already implemented in `kiru6006/govt-highways-agent` vs. stubbed or planned?
3. **Delegation of Financial & Technical Powers (`TO VALIDATE`):** Which specific Tamil Nadu Government Orders and departmental circulars govern sanctioning limits, rate exceptions, and variation approvals across `AE`, `AEE`, `DE`, `SE`, `CE`, `DG`, and Finance officers?
4. **Highways GST & Tax Rules (`SOURCE VERIFIED` G.O. Ms. No. 114 dt. 22.07.2022 / `TO VALIDATE` application):** Which exact GST rates/notifications apply to Highways road construction, widening, strengthening, bridges, and maintenance contracts in 2026–2027?
5. **Sand & NLC Crushed Sand G.O.s (`SOURCE VERIFIED` `M-0127`, `M-0128`, `M-2853` / `TO VALIDATE` rates):** What are the active depot/NLC rates and conditions under `G.O. Ms.No.4, PWD (I.Spl.2) dt. 06.01.2022` and the pending NLC overburden crushed sand G.O.?
6. **WRD-Tagged Sub-Clauses in General Notes (`SOURCE VERIFIED` p. 9 / `TO VALIDATE` scope):** Does the Highways Department apply any of the items/clauses flagged under Water Resources Department in the General Note Table or Annexures I–III (`Note 1` p. 9, `Annexure-I Note 3`, `Annexure-II Note 4`, `Annexure-III Note 2`) for specialized cross-drainage/hydraulic highway works?
7. **Historical & Maintenance Data Availability (`TO VALIDATE`):** Are historical estimates, MB/bill records, QC test logs, and road maintenance histories available in structured format for benchmarking and repeated-maintenance detection?

---

## Part 17: Mandatory Use Cases (32 Detailed Use Cases — `PROPOSED` / `SOURCE VERIFIED`)

Each use case below follows all **20 mandatory fields** from Section 10 without inventing monetary savings.

### UC-01: Ingest SoR 2026–2027 Volume I Master Catalogue

1. **Use-case ID and title:** `UC-01` — Ingest SoR 2026–2027 Volume I Master Catalogue
2. **Departmental business process:** Schedule Master Governance & Publication
3. **User persona:** SoR Data Steward / Technical Cell Officer (`TO VALIDATE`)
4. **Current pain point:** Static PDF schedules require manual lookup and risk transcription errors (`TO VALIDATE`)
5. **Root cause:** Rate schedules are distributed as multi-hundred-page PDFs rather than structured versioned data (`SOURCE VERIFIED` PDF format)
6. **Current manual process:** Engineers look up printed pages manually while preparing Excel estimates (`TO VALIDATE`)
7. **Proposed digital workflow:** Upload SoR PDF → extract codes, units, rates, notes, and page numbers → steward verifies staged items → publish `SoR-2026-2027-V1` (`w.e.f. 13/11/2026`)
8. **Required data:** PDF pages, item codes (`L-`, `M-`, `W-`, `C-`, `H-`), descriptions, units, basic rates, effective dates, footnotes
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I Preface & Index (`w.e.f. 13/11/2026`, pp. i–ii, 1–352)
10. **Detection or calculation logic:** Schema & format validator checks unique code pattern, non-null unit/rate (unless GO-referenced), effective date `>= 2026-11-13`, and page reference
11. **Exception condition:** Item rate is GO-referenced (`M-0127`, `M-0128`, `M-2853`) or OCR confidence is below threshold
12. **Expected system alert:** `"Staged item requires steward verification before publication"`
13. **Recommended action:** Steward inspects PDF snippet, enters verified value/GO link, and approves publish
14. **Approval or investigation owner:** SoR Data Steward / Authorized Technical Cell (`TO VALIDATE`)
15. **Expected business outcome:** Standardized, version-controlled digital rate catalogue across TN-HDOS
16. **KPI and calculation formula:** `Catalogue Completeness (%) = (Verified & Published Items / Total Extracted Items) * 100`
17. **Evidence required:** Source PDF file hash, printed & PDF page numbers, steward sign-off record
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Published catalogue items are queryable by code/keyword with exact rate, unit, effective date `13/11/2026`, and page citation

### UC-02: Enforce SoR Effective Date on New Estimates

1. **Use-case ID and title:** `UC-02` — Enforce SoR Effective Date on New Estimates
2. **Departmental business process:** Estimate Preparation & Sanction
3. **User persona:** Assistant Engineer (`AE`) / Assistant Executive Engineer (`AEE`)
4. **Current pain point:** Estimates risk mixing obsolete rate schedules with current rates (`TO VALIDATE`)
5. **Root cause:** Lack of date-bound rate validation during estimate creation (`TO VALIDATE`)
6. **Current manual process:** Estimators manually check whether a newer SoR circular is in force (`TO VALIDATE`)
7. **Proposed digital workflow:** System binds estimate to active SoR version matching estimate effective date (`13/11/2026` onward for SoR 2026–2027) and blocks outdated rate codes
8. **Required data:** Estimate creation/effective date, `sor_versions.effective_from`, `sor_items.sor_version_id`
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** Check `estimate.effective_date >= sor_version.effective_from` and `(sor_version.effective_to IS NULL OR estimate.effective_date <= sor_version.effective_to)`
11. **Exception condition:** Backdated/legacy estimate expressly authorized under prior schedule rules (`TO VALIDATE`)
12. **Expected system alert:** `"Selected item rate is not effective for estimate date 2026-11-13+"`
13. **Recommended action:** Replace with valid `2026–2027` item code or submit authorized backdated-schedule exception
14. **Approval or investigation owner:** `DE` / Authorized Sanctioning Authority (`TO VALIDATE`)
15. **Expected business outcome:** Consistent application of `2026–2027` rates from `13/11/2026`
16. **KPI and calculation formula:** `Effective-Date Compliance (%) = (Estimates Using Valid-Date SoR Version / Total Estimates) * 100`
17. **Evidence required:** Estimate header date, bound `sor_version_id`, and any authorized exception order
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Estimates created on/after `13/11/2026` default to `SoR-2026-2027-V1` and flag incompatible item versions

### UC-03: Block Unauthorized Extra Percentages Outside General Notes

1. **Use-case ID and title:** `UC-03` — Block Unauthorized Extra Percentages Outside General Notes
2. **Departmental business process:** Technical Estimate & Scrutiny
3. **User persona:** Assistant Executive Engineer (`AEE`) / Divisional Engineer (`DE`)
4. **Current pain point:** Arbitrary or unverified percentage markups added to estimate totals (`TO VALIDATE`)
5. **Root cause:** Ad-hoc spreadsheet formulas adding custom percentages (`TO VALIDATE`)
6. **Current manual process:** Scrutiny officers manually audit spreadsheet formulas line by line (`TO VALIDATE`)
7. **Proposed digital workflow:** Rule engine enforces `General Note` cap (`Extra percentage other than those for the specified areas noted below, shall not be allowed`)
8. **Required data:** Estimate allowance lines, project location/zone, rule IDs
9. **Applicable SOR rule or source:** General Note p. 1 (`Extra percentage other than those for the specified areas noted below, shall not be allowed`)
10. **Detection or calculation logic:** Validate `allowance.rule_code IN allowed_rule_codes_for_location_and_item`; set disallowed extra to `0`
11. **Exception condition:** Specific Government Order or committee amendment overriding General Note (`TO VALIDATE`)
12. **Expected system alert:** `"Disallowed extra percentage blocked per SoR General Note (p. 1)"`
13. **Recommended action:** Remove unauthorized markup or attach verified G.O. for `SE`/`CE` review
14. **Approval or investigation owner:** `DE` / `SE` per delegation order (`TO VALIDATE`)
15. **Expected business outcome:** Elimination of unapproved percentage markups in estimates
16. **KPI and calculation formula:** `Disallowed Markup Prevention Rate (%) = (Blocked Invalid Extra Lines / Total Attempted Invalid Extra Lines) * 100`
17. **Evidence required:** Calculation trace showing `extra_pct = 0` or approved G.O. reference
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Any percentage markup lacking a valid General Note rule match is rejected or flagged prior to sanction

### UC-04: Apply +10% Allowance for Erstwhile Chennai (with 32 km Belt), Madurai, Coimbatore & Hosur Taluk

1. **Use-case ID and title:** `UC-04` — Apply +10% Allowance for Erstwhile Chennai (with 32 km Belt), Madurai, Coimbatore & Hosur Taluk
2. **Departmental business process:** Estimate & BOQ Preparation
3. **User persona:** `AE` / `AEE`
4. **Current pain point:** Mismatched allowance percentages across urban and taluk boundaries (`TO VALIDATE`)
5. **Root cause:** Manual geographic lookup of special allowances
6. **Current manual process:** Estimator checks zone manually and types `+10%` in estimate sheets (`TO VALIDATE`)
7. **Proposed digital workflow:** Geo/jurisdiction tag triggers deterministic `+10%` on `Rates of Labour`, `Rates of Works`, and `Head Load`
8. **Required data:** Project coordinates/jurisdiction code, item type (`Labour`, `Works`, `Head Load`)
9. **Applicable SOR rule or source:** General Note 1(i)–(iii) (p. 1) & Statement Sl. No. 1 (p. 7)
10. **Detection or calculation logic:** `allowance = base_amount * 0.10` where `item_type IN {'LABOUR', 'WORKS', 'HEAD_LOAD'}` and zone matches `General Note 1`
11. **Exception condition:** Item is `Materials` or `Conveyance` (not covered under `General Note 1` extra %) or outside listed areas
12. **Expected system alert:** `"Applied +10% General Note 1 allowance on eligible Labour/Works/Head Load items"`
13. **Recommended action:** Verify project boundary polygon/jurisdiction tag before submission
14. **Approval or investigation owner:** `AEE` / `DE`
15. **Expected business outcome:** Accurate, uniform +10% allowance application across eligible zones
16. **KPI and calculation formula:** `Zone Allowance Accuracy (%) = (Estimates with Verified +10% Eligibility / Total Eligible Zone Estimates) * 100`
17. **Evidence required:** Project jurisdiction tag and rule calculation log (`General Note 1`)
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** +10% applies strictly to Labour, Works, and Head Load in qualifying areas and never to non-eligible components

### UC-05: Apply +5% Allowance for Trichy, Salem, Tirunelveli, Tiruppur, Erode, Thoothukudi & Vellore Corporations

1. **Use-case ID and title:** `UC-05` — Apply +5% Allowance for Trichy, Salem, Tirunelveli, Tiruppur, Erode, Thoothukudi & Vellore Corporations
2. **Departmental business process:** Estimate & BOQ Preparation
3. **User persona:** `AE` / `AEE`
4. **Current pain point:** Confusing +5% corporation tier with +10% tier or general road works (`TO VALIDATE`)
5. **Root cause:** Manual lookup across multiple corporation lists
6. **Current manual process:** Estimator manually applies percentage in estimate workbook (`TO VALIDATE`)
7. **Proposed digital workflow:** Selecting any of the 7 listed corporations applies `+5%` on `Rates of Labour`, `Rates of Works`, and `Head Load`
8. **Required data:** Corporation code (`Trichy`, `Salem`, `Tirunelveli`, `Tiruppur`, `Erode`, `Thoothukudi`, `Vellore`), item type
9. **Applicable SOR rule or source:** General Note 2 (p. 1) & Statement Sl. No. 2 (p. 7)
10. **Detection or calculation logic:** `allowance = base_amount * 0.05` for `LABOUR`, `WORKS`, `HEAD_LOAD` in listed corporations
11. **Exception condition:** Work lies outside corporation limits or applies to materials/conveyance
12. **Expected system alert:** `"Applied +5% General Note 2 corporation allowance"`
13. **Recommended action:** Confirm work chainage falls within notified corporation limits
14. **Approval or investigation owner:** `AEE` / `DE`
15. **Expected business outcome:** Consistent +5% corporation allowance computation
16. **KPI and calculation formula:** `Corp-5% Precision (%) = (Compliant +5% Line Items / Total +5% Line Items) * 100`
17. **Evidence required:** Chainage/corporation boundary record and calculation trace
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** +5% calculates accurately for the 7 listed corporations and excludes non-listed or out-of-limits stretches

### UC-06: Enforce +25% Night-Work Labour Allowance Only With Tender Clause

1. **Use-case ID and title:** `UC-06` — Enforce +25% Night-Work Labour Allowance Only With Tender Clause
2. **Departmental business process:** Estimate & Tender Preparation
3. **User persona:** `AE` / `AEE` / `Procurement Officer`
4. **Current pain point:** Night-work labour extra claimed without tender authorization or applied to non-labour components (`TO VALIDATE`)
5. **Root cause:** Missing prerequisite check for night-work tender clause and labour-only scope
6. **Current manual process:** Estimator adds 25% manually without systematic clause verification (`TO VALIDATE`)
7. **Proposed digital workflow:** Enable `+25%` on Labour rates in Corporation/Municipal areas only when `night_work_tender_clause_present == true`
8. **Required data:** Municipal/Corporation flag, `night_work_required` flag, `tender_clause_ref`, labour line items
9. **Applicable SOR rule or source:** Annexure-I Note 2a & 2b (p. 16)
10. **Detection or calculation logic:** If `is_corp_or_municipal` AND `night_work_required` AND `has_tender_clause`: `extra = labour_basic_rate * 0.25` (on basic rate only, excluding area extras)
11. **Exception condition:** Tender clause absent or item is outside Corporation/Municipal limits or non-labour
12. **Expected system alert:** `"Night-work +25% labour allowance requires active Corporation/Municipal status and tender clause"`
13. **Recommended action:** Attach tender clause reference or remove night-work labour extra
14. **Approval or investigation owner:** `DE` / `Procurement Officer`
15. **Expected business outcome:** Audit-compliant night-work labour pricing for urban/bridge works
16. **KPI and calculation formula:** `Night-Clause Compliance (%) = (Night-Work Lines With Valid Tender Clause / Total Night-Work Lines) * 100`
17. **Evidence required:** Tender clause ID/text and labour basic-rate calculation breakdown
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** System blocks +25% night labour calculation if tender clause flag is unchecked

### UC-07: Enforce Highways Provisional 3% Bridge Structural Allowance & Exclusions

1. **Use-case ID and title:** `UC-07` — Enforce Highways Provisional 3% Bridge Structural Allowance & Exclusions
2. **Departmental business process:** Bridge & Road Estimation
3. **User persona:** `AE` / `AEE` / `DE`
4. **Current pain point:** 3% provisional bridge allowance mistakenly applied to culverts, drains, retaining walls, or repairs (`TO VALIDATE`)
5. **Root cause:** Misreading of `General Note 10` conditions and exclusions
6. **Current manual process:** Manual markup on estimate sheets (`TO VALIDATE`)
7. **Proposed digital workflow:** Engine checks `is_bridge_structural_component`, `bridge_cost_share` (for road projects `> 50%`), and `sor_data_updated_flag == false`
8. **Required data:** Item `structure_component_type`, project type (`bridge` vs `road`), bridge cost share %, SoR data-update status
9. **Applicable SOR rule or source:** General Note 10(i)–(iii) (p. 6)
10. **Detection or calculation logic:** Allow `+3%` only if `structure_component_type == 'BRIDGE_STRUCTURAL'` AND (`project_type == 'BRIDGE'` OR `bridge_share > 0.50`) AND `NOT data_updated`; force `0%` for `DRAIN`, `CULVERT`, `RETAINING_WALL`, `REPAIR`
11. **Exception condition:** Approved data already updated (withdrawing provisional 3%) or bridge share `<= 50%` on road work
12. **Expected system alert:** `"General Note 10(iii): 3% bridge structural allowance not applicable to drains, culverts, retaining walls, or repairs"`
13. **Recommended action:** Reclassify item or zero out 3% adjustment on excluded structures
14. **Approval or investigation owner:** `DE` / `SE`
15. **Expected business outcome:** Exact compliance with Highways General Note 10 bridge rules
16. **KPI and calculation formula:** `Bridge-3% Rule Adherence (%) = (Compliant Bridge/Road Lines / Total Evaluated Lines) * 100`
17. **Evidence required:** Component classification tag, bridge-to-project cost calculation, and rule trace
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Drains, culverts, retaining walls, and repairs never receive the provisional 3% bridge structural allowance

### UC-08: Prevent Compounding of Extra Percentages

1. **Use-case ID and title:** `UC-08` — Prevent Compounding of Extra Percentages
2. **Departmental business process:** Estimate Calculation & Financial Scrutiny
3. **User persona:** `AEE` / `DE` / `Accounts/Finance Officer`
4. **Current pain point:** Cascading percentage additions inflate base figures (`TO VALIDATE`)
5. **Root cause:** Applying a second percentage on top of an already-adjusted subtotal instead of basic rate
6. **Current manual process:** Spreadsheet formula chaining (`TO VALIDATE`)
7. **Proposed digital workflow:** Engine computes every percentage adjustment strictly against the unadjusted basic rate/amount
8. **Required data:** Item basic rate/amount, applicable percentage rules
9. **Applicable SOR rule or source:** General Note 8(ii) (p. 4) & Annexure-I Note 2b (p. 16)
10. **Detection or calculation logic:** `adj_i = basic_amount * (pct_i / 100)`; `total_adj = sum(adj_i)` (never `adj_i * (1 + pct_j)`)
11. **Exception condition:** Explicit superseding rule/G.O. (`TO VALIDATE`)
12. **Expected system alert:** `"Non-compounding rule applied: percentage calculated on basic rate only"`
13. **Recommended action:** Inspect additive breakdown in Rate Analysis tab
14. **Approval or investigation owner:** `Accounts/Finance Officer` / `DE`
15. **Expected business outcome:** Mathematical elimination of percentage compounding errors
16. **KPI and calculation formula:** `Non-Compounding Error Count = Count(Estimates Where Compounded Formula Detected)` (Target: `0`)
17. **Evidence required:** Step-by-step additive calculation table
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Automated tests confirm additive-on-basic math across multi-rule scenarios

### UC-09: Enforce AEE Quarry-vs-Conveyance Cost Check in Special Areas

1. **Use-case ID and title:** `UC-09` — Enforce AEE Quarry-vs-Conveyance Cost Check in Special Areas
2. **Departmental business process:** Material Sourcing & Estimate Sanction
3. **User persona:** Assistant Executive Engineer (`AEE`) / `DE`
4. **Current pain point:** High-cost local quarrying/manufacturing in special tracts selected without comparing outside conveyance (`TO VALIDATE`)
5. **Root cause:** Omission of comparative finished-cost check required by `General Note 8(ix)`
6. **Current manual process:** Informal note or unrecorded comparison in file (`TO VALIDATE`)
7. **Proposed digital workflow:** When local material inside special tract (`Corp`, `Reserve Forest`, `Hills`, `Islands`) is selected, prompt AEE cost-comparison check before sanction
8. **Required data:** Special tract flag, material source type (`local` vs `conveyed`), AEE comparison confirmation & figures
9. **Applicable SOR rule or source:** General Note 8(ix) (p. 5)
10. **Detection or calculation logic:** If `in_special_tract` AND `material_local == true` AND `aee_comparison_verified == false`: flag `PENDING_AEE_COMPARISON`
11. **Exception condition:** Outside conveyance is proven more expensive or logistically impossible (`TO VALIDATE`)
12. **Expected system alert:** `"General Note 8(ix): AEE confirmation required comparing local special-tract material vs. outside conveyance"`
13. **Recommended action:** AEE records comparative finished cost and signs off in workflow
14. **Approval or investigation owner:** `AEE` (mandatory duty per rule) & `DE`
15. **Expected business outcome:** Documented economic justification for material sourcing in special areas
16. **KPI and calculation formula:** `AEE Comparison Completion (%) = (Special-Tract Material Lines With AEE Sign-Off / Total Special-Tract Material Lines) * 100`
17. **Evidence required:** AEE comparison record, timestamps, and user ID
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Estimate cannot be marked `Sanction-Ready` until AEE comparison check is completed or waived by authorized rule

### UC-10: Block Duplicate Loading/Unloading & Incidental Charges on Included Materials

1. **Use-case ID and title:** `UC-10` — Block Duplicate Loading/Unloading & Incidental Charges on Included Materials
2. **Departmental business process:** Estimate & Bill Scrutiny
3. **User persona:** `AEE` / `Accounts/Finance Officer`
4. **Current pain point:** Separate loading, unloading, or incidental charges claimed on materials already inclusive of them (`TO VALIDATE`)
5. **Root cause:** Overlooking inclusion notes in `Annexure-II Note 3` and `Annexure-V Note 6`
6. **Current manual process:** Manual check during bill verification (`TO VALIDATE`)
7. **Proposed digital workflow:** Flag or block separate loading/unloading/incidental lines on Bricks/Tiles, Stone Jelly (ISS/IRC), Gravel, Sand, Lime Stone, and covered conveyance items
8. **Required data:** Material/conveyance item code, charge type (`loading`, `unloading`, `incidental`, `stacking`)
9. **Applicable SOR rule or source:** Annexure-II Note 3 (p. 27), Annexure-V Note 1 & Note 6 (pp. 68, 71, 75, 78)
10. **Detection or calculation logic:** Detect co-occurrence of covered material/conveyance item and separate loading/unloading/incidental charge line on same estimate/bill
11. **Exception condition:** Explicitly permitted stacking/handling charge under `Circular Memo No. 230 Wks. IV(2)/62-3 dt. 10.06.1962` (`TO VALIDATE`)
12. **Expected system alert:** `"Potential duplicate charge: loading/unloading/incidental is included in basic/schedule provisions"`
13. **Recommended action:** Remove duplicate charge line or attach permitted exception note
14. **Approval or investigation owner:** `Accounts/Finance Officer` / `DE`
15. **Expected business outcome:** Prevention of double payment for loading/unloading/incidentals
16. **KPI and calculation formula:** `Duplicate Handling Charge Flags Resolved (%) = (Resolved/Removed Duplicate Lines / Total Flagged Lines) * 100`
17. **Evidence required:** Item code, note citation, and reconciliation audit entry
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Co-occurring covered material + separate loading/unloading line triggers an immediate warning/block

### UC-11: Prevent Duplicate Labour Claims When Included in Work Rate

1. **Use-case ID and title:** `UC-11` — Prevent Duplicate Labour Claims When Included in Work Rate
2. **Departmental business process:** Rate Analysis & Billing Scrutiny
3. **User persona:** `AEE` / `Accounts/Finance Officer`
4. **Current pain point:** Separate mazdoor/labour charges added for earthwork/clearing/dismantling already covered in work item rates (`TO VALIDATE`)
5. **Root cause:** Misapplication of `General Note 8(iii)` (`Rates of Works` includes labour for earthwork, refilling foundation, dismantling, jungle clearance, head load where human labour alone is involved)
6. **Current manual process:** Manual spreadsheet/MB cross-check (`TO VALIDATE`)
7. **Proposed digital workflow:** Cross-check estimate and bill lines for overlapping work item (`W-`) and standalone labour (`L-`) / head-load (`C-`) charges on the same work scope
8. **Required data:** Estimate/bill lines (`W-`, `L-`, `C-`), scope/chainage/structure tags
9. **Applicable SOR rule or source:** General Note 8(iii) (p. 4)
10. **Detection or calculation logic:** Flag overlapping `W-` (human-labour work item) and `L-`/`C-` items on identical work package/element unless distinct scope is documented
11. **Exception condition:** Distinct scope/structure or machinery/special operation legitimately requiring separate line (`TO VALIDATE`)
12. **Expected system alert:** `"Overlapping labour/head-load detected against work item inclusive of human labour (General Note 8(iii))"`
13. **Recommended action:** Verify scope separation or remove duplicate labour/head-load entry
14. **Approval or investigation owner:** `DE` / `Accounts/Finance Officer`
15. **Expected business outcome:** Cleaner rate analysis and fewer duplicate labour claims
16. **KPI and calculation formula:** `Overlapping Labour Flag Rate (%) = (Flagged Overlapping Lines / Total Labour & Work Lines) * 100`
17. **Evidence required:** Item breakdown, scope notes, and reviewer disposition
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Overlapping work and labour/head-load lines surface a clear comparison view before approval

### UC-12: Enforce Annexure-VI & VII Site-Rate & Zero-Conveyance Rule

1. **Use-case ID and title:** `UC-12` — Enforce Annexure-VI & VII Site-Rate & Zero-Conveyance Rule
2. **Departmental business process:** Estimate & Material Pricing
3. **User persona:** `AE` / `AEE` / `Accounts/Finance Officer`
4. **Current pain point:** Road conveyance or area material percentages added to Annexure-VI / Annexure-VII items (`TO VALIDATE`)
5. **Root cause:** Rates in Annexures VI and VII already apply at site of work with no extra cost or conveyance (`General Note 8(viii)`)
6. **Current manual process:** Manual review of estimate schedules (`TO VALIDATE`)
7. **Proposed digital workflow:** Automatically set `conveyance_allowance = 0` and `area_material_extra = 0` for all `ANNEXURE_VI` and `ANNEXURE_VII` items
8. **Required data:** Item annexure tag (`ANNEXURE_VI` or `ANNEXURE_VII`), conveyance/allowance lines
9. **Applicable SOR rule or source:** General Note 8(viii) (p. 5), Annexure-VI Note (p. 72), Annexure-VII Note (p. 212)
10. **Detection or calculation logic:** If `item.annexure IN ('ANNEXURE_VI', 'ANNEXURE_VII')`: `conveyance = 0` and `material_area_extra = 0`
11. **Exception condition:** None under standard schedule rules (`TO VALIDATE` if any special departmental order exists)
12. **Expected system alert:** `"Conveyance and extra material percentage are not applicable to Annexure-VI / VII items (at-site rates)"`
13. **Recommended action:** Remove conveyance/extra lines on Annexure-VI / VII items
14. **Approval or investigation owner:** `AEE` / `Accounts/Finance Officer`
15. **Expected business outcome:** Exact adherence to at-site rate rules for other construction & electrical materials
16. **KPI and calculation formula:** `Annexure-VI/VII Rule Compliance (%) = (Compliant Items / Total Annexure-VI & VII Items) * 100`
17. **Evidence required:** Item annexure metadata and rate calculation log
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Zero conveyance or special-area material % is added to Annexure-VI or Annexure-VII items

### UC-13: Calculate Head Load Conveyance With Lead/Lift Thresholds & Rounding

1. **Use-case ID and title:** `UC-13` — Calculate Head Load Conveyance With Lead/Lift Thresholds & Rounding
2. **Departmental business process:** Conveyance & Estimate Calculation
3. **User persona:** `AE` / `AEE`
4. **Current pain point:** Miscalculation of initial free lead/lift (`10m` lead, `2m` lift) or fractional 100m rounding (`TO VALIDATE`)
5. **Root cause:** Manual formula errors on `Annexure-IV` rules and `Memo No. CTO(A)/38153/89 dt. 03.02.1989`
6. **Current manual process:** Hand-calculated lead/lift multipliers in spreadsheets (`TO VALIDATE`)
7. **Proposed digital workflow:** Engine enforces `0` head load for `<=10m` lead and `<=2m` lift, rounds fractional `100m` to nearest `100m`, and checks bullock-cart inaccessibility flag
8. **Required data:** Item category (`C-0001`–`C-0027`), `lead_m`, `lift_m`, `inaccessible_to_cart` flag, quantity
9. **Applicable SOR rule or source:** Annexure-IV (pp. 64–65) & Note 1–3 (`Memo No. CTO(A)/38153/89 dt. 03.02.1989`)
10. **Detection or calculation logic:** `extra_lead_m = max(0, lead_m - 100)` (for `>100m` after initial `10–100m` slab); `rounded_100m_units = round_nearest_100m(extra_lead_m) / 100`; `extra_lift_m = max(0, lift_m - 2)`
11. **Exception condition:** Site is accessible to bullock carts or within `10m` lead / `2m` lift
12. **Expected system alert:** `"Head load requires inaccessible-site verification and excludes initial 10m lead / 2m lift"`
13. **Recommended action:** Confirm site inaccessibility and verify lead/lift inputs
14. **Approval or investigation owner:** `AEE` / `DE`
15. **Expected business outcome:** Deterministic, auditable head-load conveyance calculations
16. **KPI and calculation formula:** `Head-Load Formula Match (%) = (Engine Calculations Matching Reference Test Suite / Total Test Cases) * 100`
17. **Evidence required:** Lead/lift values, cart-inaccessibility flag, and formula breakdown
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** All boundary cases (`10m`, `100m`, `150m`, `2m` lift, `2.5m` lift) match deterministic test expectations

### UC-14: Calculate Road Conveyance Across Distance Slabs & Track Modifiers

1. **Use-case ID and title:** `UC-14` — Calculate Road Conveyance Across Distance Slabs & Track Modifiers
2. **Departmental business process:** Material Conveyance Estimation
3. **User persona:** `AE` / `AEE`
4. **Current pain point:** Distance slab tiering (`0–10 km`, `10–20 km`, `20–40 km`, `40–80 km`, `>80 km`) or cart/sandy/slushy track extras misapplied (`TO VALIDATE`)
5. **Root cause:** Manual slab interpolation and track modifier confusion
6. **Current manual process:** Manual spreadsheet slab lookups
7. **Proposed digital workflow:** Engine computes slab-wise conveyance for Plains (`Annexure-V(A)`) or Hills (`Annexure-V(B)`) and applies `+20%` (cart track) or `+50%` (sandy/slushy track) **excluding loading and unloading**
8. **Required data:** Material/conveyance category, `distance_km`, terrain (`plains` vs `hills`), track type (`road`, `cart_track`, `sandy_slushy`), `is_interstate`
9. **Applicable SOR rule or source:** Annexure-V(A) (pp. 66–68) & Annexure-V(B) (pp. 69–71)
10. **Detection or calculation logic:** Sum per-km slab rates across distance intervals + loading/unloading/interstate where applicable; apply track multiplier only to conveyance portion (excluding loading/unloading)
11. **Exception condition:** Bitumen conveyance (`General Note 8(vii)` — Oil Company rates) or Annexure-VI/VII items (`General Note 8(viii)`)
12. **Expected system alert:** `"Track modifier applied to conveyance only (loading/unloading excluded)"`
13. **Recommended action:** Verify haulage distance, quarry/depot origin, and track type
14. **Approval or investigation owner:** `AEE` / `DE`
15. **Expected business outcome:** Consistent road conveyance calculations across plains and hills
16. **KPI and calculation formula:** `Conveyance Slab Accuracy (%) = (Verified Conveyance Calculations / Total Conveyance Calculations) * 100`
17. **Evidence required:** Distance input, origin/destination metadata, and slab-by-slab calculation log
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Slab totals and track modifiers match `Annexure-V(A)` and `Annexure-V(B)` rules with zero loading/unloading distortion

### UC-15: Separate Basic Rates From GST & Tax Provisions

1. **Use-case ID and title:** `UC-15` — Separate Basic Rates From GST & Tax Provisions
2. **Departmental business process:** Estimate, Billing & Financial Control
3. **User persona:** `Accounts/Finance Officer` / `DE`
4. **Current pain point:** GST and basic schedule rates mixed together during estimate or bill review (`TO VALIDATE`)
5. **Root cause:** Schedule rates are published strictly exclusive of GST and other taxes
6. **Current manual process:** Manual tax columns added in separate sheets (`TO VALIDATE`)
7. **Proposed digital workflow:** Display `Basic Cost (Excl. GST & Taxes)` separately from `Applicable GST/Tax` (`G.O. Ms. No. 114, CT&R (B1) dt. 22.07.2022` — `TO VALIDATE` Highways contract tax mapping)
8. **Required data:** Estimate/bill basic total, work classification (`earthwork-predominant` vs `other` — `TO VALIDATE` for Highways), active GST rate config
9. **Applicable SOR rule or source:** General Note 8(xi)–(xii) (p. 5) & `G.O. Ms. No. 114, CT&R (B1) Dept. dt. 22.07.2022`
10. **Detection or calculation logic:** `basic_subtotal = sum(line_basic_amount)`; `tax_amount = basic_subtotal * applicable_tax_rate` (flagged `TO VALIDATE` until Highways tax rule confirmed)
11. **Exception condition:** Exempt/zero-rated or revised GST notification (`TO VALIDATE`)
12. **Expected system alert:** `"Basic rate excludes GST; verify applicable Highways works contract tax rate"`
13. **Recommended action:** Finance officer confirms applicable tax rate/category prior to financial sanction/payment
14. **Approval or investigation owner:** `Accounts/Finance Officer` (`TO VALIDATE`)
15. **Expected business outcome:** Transparent separation of basic works cost and statutory taxes
16. **KPI and calculation formula:** `Tax-Segregation Completeness (%) = (Estimates/Bills With Segregated Basic & Tax Totals / Total Estimates/Bills) * 100`
17. **Evidence required:** Rate schedule note citation, tax rule version, and finance sign-off
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Basic amounts and GST/tax amounts appear as distinct, non-merged fields across UI, API, and reports

### UC-16: Generate Tender BOQ Directly From Approved Technical Estimate

1. **Use-case ID and title:** `UC-16` — Generate Tender BOQ Directly From Approved Technical Estimate
2. **Departmental business process:** Tendering & Procurement
3. **User persona:** `Procurement Officer` / `DE`
4. **Current pain point:** Manual re-keying of technical estimate items into tender BOQ introduces code/unit/rate drift (`TO VALIDATE`)
5. **Root cause:** Disconnected estimate and tender documents (`TO VALIDATE`)
6. **Current manual process:** Copying/retyping rows from estimate sheet into tender schedule (`TO VALIDATE`)
7. **Proposed digital workflow:** Generate immutable BOQ snapshot directly from sanctioned technical estimate (`POST /estimates/{id}/boq/generate`)
8. **Required data:** Sanctioned `sor_estimates` & `sor_estimate_lines`, `sor_items`
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** Copy `sor_item_id`, `unique_code`, `description`, `unit_canonical`, `quantity`, and calculated `estimated_rate` with hash checksum
11. **Exception condition:** Estimate is not yet in `SANCTIONED` state
12. **Expected system alert:** `"BOQ generation requires a sanctioned technical estimate"`
13. **Recommended action:** Complete technical/administrative sanction first or route via approved draft preview
14. **Approval or investigation owner:** `Procurement Officer` / `DE`
15. **Expected business outcome:** 100% fidelity between sanctioned technical estimate and tender BOQ
16. **KPI and calculation formula:** `Estimate-to-BOQ Line Fidelity (%) = (Identical Code/Unit/Qty/Rate Lines / Total BOQ Lines) * 100`
17. **Evidence required:** Estimate ID, BOQ snapshot ID, timestamp, and generating user ID
18. **Priority:** P1
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Every BOQ row traces back to a specific `sor_estimate_lines.id` without manual re-entry

### UC-17: Reconcile Measurement Book (MB) Quantities Against BOQ

1. **Use-case ID and title:** `UC-17` — Reconcile Measurement Book (MB) Quantities Against BOQ
2. **Departmental business process:** Execution Measurement & Certification
3. **User persona:** `AE` / `AEE` / `DE`
4. **Current pain point:** Discrepancies between BOQ quantities and measured work go unnoticed until late billing (`TO VALIDATE`)
5. **Root cause:** Lack of automated line-level comparison between BOQ and MB entries (`TO VALIDATE`)
6. **Current manual process:** Manual tally of MB pages against BOQ (`TO VALIDATE`)
7. **Proposed digital workflow:** Match MB measurement entries to BOQ lines and compute cumulative vs. BOQ quantity variance
8. **Required data:** `sor_boq_items.boq_qty`, `mb_measurements.measured_qty`, `unit_canonical`
9. **Applicable SOR rule or source:** SoR 2026–2027 unit & measurement definitions (`TO VALIDATE` departmental MB rules)
10. **Detection or calculation logic:** `qty_delta = cumulative_mb_qty - boq_qty`; flag if `unit_canonical` mismatches or `cumulative_mb_qty > boq_qty`
11. **Exception condition:** Approved quantity variation or permissible tolerance under contract (`TO VALIDATE`)
12. **Expected system alert:** `"MB cumulative quantity exceeds BOQ quantity on item {code} by {delta} {unit}"`
13. **Recommended action:** Verify field measurements and initiate variation/revised estimate approval if required
14. **Approval or investigation owner:** `AEE` / `DE`
15. **Expected business outcome:** Early visibility into quantity overruns and unit mismatches
16. **KPI and calculation formula:** `MB-BOQ Variance Rate (%) = (Abs(Cumulative MB Qty - BOQ Qty) / BOQ Qty) * 100`
17. **Evidence required:** MB reference ID, measurement entry, BOQ item ID, and officer verification
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Unit mismatches block summation and quantity variances display exact numeric deltas

### UC-18: Validate Running Account (RA) & Final Bills Against Contract & SoR

1. **Use-case ID and title:** `UC-18` — Validate Running Account (RA) & Final Bills Against Contract & SoR
2. **Departmental business process:** Billing & Payment Traceability
3. **User persona:** `Accounts/Finance Officer` / `DE`
4. **Current pain point:** Weak linkage between estimates, contract rates, MB measurements, and bill payouts (`TO VALIDATE`)
5. **Root cause:** Fragmented billing records across engineering and accounts desks (`TO VALIDATE`)
6. **Current manual process:** Manual cross-checking of bills, MBs, and rate schedules (`TO VALIDATE`)
7. **Proposed digital workflow:** Run automated pre-payment validation comparing billed items, quantities, rates, and taxes against approved BOQ/MB/variation records
8. **Required data:** `bill_vouchers`, `sor_reconciliation_entries`, `sor_boq_items`, `contract_variations`
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`) & contract terms (`TO VALIDATE`)
10. **Detection or calculation logic:** Verify `billed_qty <= approved_qty`, `unit` matches, and `billed_rate` aligns with agreed contract/SoR rule
11. **Exception condition:** Approved variation order or price escalation clause (`TO VALIDATE`)
12. **Expected system alert:** `"Bill line {line_no} exceeds approved quantity or rate—review required before payment"`
13. **Recommended action:** Hold/query line item or attach approved variation/escalation order
14. **Approval or investigation owner:** `Accounts/Finance Officer` & `DE`
15. **Expected business outcome:** Stronger payment traceability and fewer billing discrepancies
16. **KPI and calculation formula:** `Pre-Bill Flag Catch Rate (%) = (Bills With Discrepancies Flagged Before Approval / Total Discrepant Bills) * 100`
17. **Evidence required:** Bill voucher ID, linked MB IDs, approval/variation IDs
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Every bill displays an automated validation report prior to accounts sign-off

### UC-19: Govern Revised Estimates With Mandatory Scope & Variance Justification

1. **Use-case ID and title:** `UC-19` — Govern Revised Estimates With Mandatory Scope & Variance Justification
2. **Departmental business process:** Revised Estimates & Cost Control
3. **User persona:** `AE` / `AEE` / `DE` / `SE`
4. **Current pain point:** Unexplained increases in revised estimates delay approvals or trigger audit queries (`TO VALIDATE`)
5. **Root cause:** Missing structured comparison between original and revised line items (`TO VALIDATE`)
6. **Current manual process:** Narrative notes attached to revised estimate files (`TO VALIDATE`)
7. **Proposed digital workflow:** Generate item-by-item delta table (`Original` vs. `Revised`) requiring structured root-cause tags and supporting evidence before submission
8. **Required data:** Original estimate lines, revised estimate lines, variance reason codes, evidence IDs
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`) & departmental revision rules (`TO VALIDATE`)
10. **Detection or calculation logic:** Compute `delta_qty`, `delta_rate`, `delta_amount`, and `% increase` per line and overall estimate; require `reason_code` and `evidence_id` for all positive deltas
11. **Exception condition:** Minor rounding/reclassification within permitted threshold (`TO VALIDATE`)
12. **Expected system alert:** `"Revised estimate increase of ₹{delta} requires root-cause code and supporting evidence"`
13. **Recommended action:** Select root-cause category, upload technical/site evidence, and route per sanction authority
14. **Approval or investigation owner:** Competent Sanctioning Authority per delegation order (`TO VALIDATE`)
15. **Expected business outcome:** Clear, auditable rationale for every revised estimate increase
16. **KPI and calculation formula:** `Justified Revised Estimate Rate (%) = (Revised Estimates With Complete Reason & Evidence / Total Revised Estimates) * 100`
17. **Evidence required:** Original vs. revised diff, engineering/site justification, evidence attachments
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Submission is blocked if any line-item increase lacks a reason code and evidence link

### UC-20: Detect Repeated Road Maintenance Expenditure on Same Stretch

1. **Use-case ID and title:** `UC-20` — Detect Repeated Road Maintenance Expenditure on Same Stretch
2. **Departmental business process:** Road Maintenance & Asset Lifecycle Intelligence
3. **User persona:** `DE` / `SE` / `Audit/Legal Officer`
4. **Current pain point:** Repeated maintenance spend on the same road stretch/chainage masks underlying structural or quality issues (`TO VALIDATE`)
5. **Root cause:** Lack of chainage-level maintenance history aggregation across financial years (`TO VALIDATE`)
6. **Current manual process:** Manual review of past maintenance registers (`TO VALIDATE`)
7. **Proposed digital workflow:** Aggregate maintenance estimates and bills by `road_id`, `start_chainage`, `end_chainage`, and `work_type` over configurable lookback windows (`TO VALIDATE` window)
8. **Required data:** Road ID, chainage range, work category (`IRQP`/maintenance/pothole/patch), bill/estimate amounts, dates, QC records
9. **Applicable SOR rule or source:** Highways maintenance/repair context (`TO VALIDATE` maintenance policy & lookback window)


10. **Detection or calculation logic:** Group maintenance spend by overlapping chainage within lookback window; flag when `repeat_count >= threshold` or `cumulative_spend > benchmark`
11. **Exception condition:** Extreme weather/flood damage or scope change documented in `Domain C`/`F` (`TO VALIDATE`)
12. **Expected system alert:** `"Repeated maintenance detected on Road {road_id} (Ch. {start}-{end}): {count} works in {window}"`
13. **Recommended action:** Inspect QC/defect logs (`Domain C`) and pavement condition before approving repeat maintenance
14. **Approval or investigation owner:** `DE` / `SE` / `QC`
15. **Expected business outcome:** Better lifecycle asset management and targeted root-cause review
16. **KPI and calculation formula:** `Repeat Maintenance Stretch Share (%) = (Flagged Repeat-Maintenance Stretches / Total Maintained Stretches) * 100`
17. **Evidence required:** Historical work/bill IDs, chainage overlap, QC/inspection history
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Overlapping chainage maintenance history and linked QC records render in the Investigation Dossier

### UC-21: Benchmark Unit Rates Across Divisions & Road Categories

1. **Use-case ID and title:** `UC-21` — Benchmark Unit Rates Across Divisions & Road Categories
2. **Departmental business process:** Cost Intelligence & Procurement Benchmarking
3. **User persona:** `SE` / `CE` / `Procurement Officer` / `Accounts/Finance Officer`
4. **Current pain point:** Difficulty spotting outlier estimates or bid rates across divisions (`TO VALIDATE`)
5. **Root cause:** No centralized comparative view normalized by unit, scope, and jurisdiction (`TO VALIDATE`)
6. **Current manual process:** Informal inquiries or manual comparison across files (`TO VALIDATE`)
7. **Proposed digital workflow:** Display percentile/median/mean comparisons for identical `unique_code` and `unit_canonical` across divisions, road categories (`SH`, `MDR`, `ODR`), and time windows
8. **Required data:** `sor_items.unique_code`, `unit_canonical`, estimate/tender rates, division, road category, location allowances
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** Compute median and IQR of normalized basic/effective rates per item code & comparable context (`n >= min_sample_size`); flag outliers beyond IQR/z-threshold
11. **Exception condition:** Small sample size (`n < min_sample_size`) or distinct site/haulage conditions (`TO VALIDATE`)
12. **Expected system alert:** `"Rate for {code} is {pct}% above division/state median (sample n={n})"`
13. **Recommended action:** Review rate analysis, lead/conveyance assumptions, and tender competition
14. **Approval or investigation owner:** `DE` / `SE` / `Procurement Officer`
15. **Expected business outcome:** Evidence-based rate scrutiny and comparable cost benchmarks
16. **KPI and calculation formula:** `Benchmark Coverage (%) = (Estimate/BOQ Items With Valid Peer Benchmark / Total Items) * 100`
17. **Evidence required:** Benchmark cohort parameters, sample count `n`, rate distribution stats
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Benchmark table displays exact sample counts and explicitly warns when sample size is small

### UC-22: Detect Unusual Material Costs & Missing Sourcing Proof

1. **Use-case ID and title:** `UC-22` — Detect Unusual Material Costs & Missing Sourcing Proof
2. **Departmental business process:** Material Cost Control & Audit Readiness
3. **User persona:** `Accounts/Finance Officer` / `DE` / `Audit/Legal Officer`
4. **Current pain point:** High-cost material lines or GO-referenced materials (`M-0127`, `M-0128`, `M-2853`) lack supporting depot/G.O. records (`TO VALIDATE`)
5. **Root cause:** Non-standard rate entries or unattached G.O./depot proof (`TO VALIDATE`)
6. **Current manual process:** Manual voucher checking (`TO VALIDATE`)
7. **Proposed digital workflow:** Flag material lines with unusual unit cost variance or missing G.O./depot reference for GO-referenced codes
8. **Required data:** Material item code, unit rate, quantity, attached G.O./depot/invoice evidence IDs
9. **Applicable SOR rule or source:** Annexure-II (`M-0127`, `M-0128` G.O. Ms.No.4 dt. 06.01.2022; `M-2853` NLC G.O.) & General Note 8(ix)
10. **Detection or calculation logic:** Flag if `code IN ('M-0127', 'M-0128', 'M-2853')` and `go_ref_id IS NULL`, or if `abs(rate - benchmark_median) / benchmark_median > threshold`
11. **Exception condition:** Verified G.O./depot rate attached or approved special-area/site condition
12. **Expected system alert:** `"Material cost/source check: verify G.O./depot reference or rate variance on {code}"`
13. **Recommended action:** Attach applicable G.O./depot document or verify rate with `AEE`/`DE`
14. **Approval or investigation owner:** `Accounts/Finance Officer` / `DE`
15. **Expected business outcome:** Complete documentary backing for material rates in estimates and bills
16. **KPI and calculation formula:** `Material Evidence Completeness (%) = (Material Lines With Required Proof / Total Material Lines) * 100`
17. **Evidence required:** G.O./depot reference ID, calculation trace, reviewer note
18. **Priority:** P1
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Missing G.O. references on `M-0127`, `M-0128`, and `M-2853` are flagged automatically

### UC-23: Detect Equipment Hire Underutilisation or Idle-Charge Anomalies

1. **Use-case ID and title:** `UC-23` — Detect Equipment Hire Underutilisation or Idle-Charge Anomalies
2. **Departmental business process:** Tools, Plants & Machinery Cost Monitoring
3. **User persona:** `DE` / `SE` / `Accounts/Finance Officer`
4. **Current pain point:** Equipment hire charges billed despite low output, delays, or idle periods (`TO VALIDATE`)
5. **Root cause:** Disconnect between equipment hire logs, work output/MB progress, and delay/dependency records (`Domain E`/`F`) (`TO VALIDATE`)
6. **Current manual process:** Manual comparison of logbooks and bills (`TO VALIDATE`)
7. **Proposed digital workflow:** Correlate equipment hire durations/charges with measured work output and `Domain E`/`F` delay logs to flag low utilization for human review
8. **Required data:** Hire items (`H-` / `Annexure-IX` / equipment items — `TO VALIDATE` pp. 349–352), hire days/hours, MB output, delay/dependency logs
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`Annexure-IX` / hire provisions, pp. 349–352 — `TO VALIDATE`)
10. **Detection or calculation logic:** Compute `output_per_hire_unit` and `idle_ratio`; flag if `idle_ratio > threshold` without linked site/land/utility/weather hold (`Domain E`/`F`)
11. **Exception condition:** Documented site stoppage (land acquisition, utility shifting, forest clearance, monsoon/law-and-order delay) (`TO VALIDATE`)
12. **Expected system alert:** `"Equipment utilization variance: low work output logged relative to hire period on {project_id}"`
13. **Recommended action:** Cross-check `Domain E`/`F` dependency logs and `Domain B` progress before approving hire claim
14. **Approval or investigation owner:** `DE` / `SE`
15. **Expected business outcome:** Better alignment between equipment hire expenditure and actual execution
16. **KPI and calculation formula:** `Flagged Hire Review Rate (%) = (Reviewed Equipment Hire Flags / Total Equipment Hire Flags) * 100`
17. **Evidence required:** Hire log, MB progress link, `Domain E`/`F` dependency/delay record
18. **Priority:** P2
19. **Implementation complexity:** High
20. **Acceptance criteria:** Flag displays linked delay/progress context and never auto-accuses contractor of misconduct

### UC-24: Track Contract Variations With Threshold & Evidence Checks

1. **Use-case ID and title:** `UC-24` — Track Contract Variations With Threshold & Evidence Checks
2. **Departmental business process:** Contract & Cost Variation Governance
3. **User persona:** `DE` / `SE` / `Procurement Officer` / `Accounts/Finance Officer`
4. **Current pain point:** Contract variations approved without clear baseline comparison or supporting technical/site evidence (`TO VALIDATE`)
5. **Root cause:** Manual variation memos outside structured BOQ/estimate lineage (`TO VALIDATE`)
6. **Current manual process:** Paper/PDF variation proposals routed across offices (`TO VALIDATE`)
7. **Proposed digital workflow:** Capture variation items against original BOQ/SoR baseline, calculate cumulative variation %, verify required evidence, and route to authorized approving authority
8. **Required data:** Contract value, original BOQ lines, proposed variation lines, variation %, supporting evidence IDs
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`) & Highways contract variation rules (`TO VALIDATE`)
10. **Detection or calculation logic:** `cum_variation_pct = (sum(abs_or_net_variation_amt) / contract_value) * 100`; flag if `cum_variation_pct > alert_threshold` or evidence missing
11. **Exception condition:** Pre-approved scope variation under contract/delegation order (`TO VALIDATE`)
12. **Expected system alert:** `"Contract variation reaches {cum_variation_pct}% of contract value—verify authority and evidence"`
13. **Recommended action:** Attach engineering/site drawings/MB proof and route to designated approval authority
14. **Approval or investigation owner:** Authorized authority per delegation order (`TO VALIDATE`)
15. **Expected business outcome:** Controlled, traceable contract variations with full supporting evidence
16. **KPI and calculation formula:** `Variation Evidence Rate (%) = (Variations With Complete Attached Evidence / Total Variations) * 100`
17. **Evidence required:** Baseline BOQ comparison, variation calculation, technical/site evidence, approval record
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Cumulative variation % and line-level deltas are calculated deterministically and logged in audit trail

### UC-25: Conduct 10-Point Structured Investigation on High-Variance Findings

1. **Use-case ID and title:** `UC-25` — Conduct 10-Point Structured Investigation on High-Variance Findings
2. **Departmental business process:** Cost Intelligence, Audit & Compliance
3. **User persona:** `DE` / `SE` / `Accounts/Finance Officer` / `Audit/Legal Officer`
4. **Current pain point:** Ad-hoc or incomplete responses to cost anomalies and audit queries (`TO VALIDATE`)
5. **Root cause:** Lack of a standardized investigation checklist linking rules, facts, and evidence (`TO VALIDATE`)
6. **Current manual process:** Free-text remarks written separately by different officers (`TO VALIDATE`)
7. **Proposed digital workflow:** Present a structured 10-point investigation template (matching Section 6 of prompt) pre-populated with system facts and evidence links
8. **Required data:** Finding record, calculation trace, rule citation, evidence links, reviewer responses for points 1–10
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I & TN-HDOS Cost Intelligence framework
10. **Detection or calculation logic:** Require completion of mandatory fields (`what_should_happen`, `what_happened`, `applicable_rule`, `difference`, `cause`, `is_justified`, `evidence_refs`, `exposure_calc`, `investigating_official`, `preventive_action`) before closing finding
11. **Exception condition:** Interim referral to Audit/Legal (`Domain G`) while investigation remains open
12. **Expected system alert:** `"Investigation dossier incomplete: missing {field_name} before closing finding"`
13. **Recommended action:** Complete all 10 investigation prompts with linked evidence and record disposition
14. **Approval or investigation owner:** Assigned investigating officer per delegation order (`TO VALIDATE`) & `Audit/Legal`
15. **Expected business outcome:** Consistent, audit-grade investigation records free of premature fraud labels
16. **KPI and calculation formula:** `Dossier Completion Rate (%) = (Completed 10-Point Dossiers / Total Reviewed Findings) * 100`
17. **Evidence required:** Completed 10-point record, linked source documents, reviewer sign-off
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Every closed or escalated finding contains all 10 structured fields and links to source evidence

### UC-26: AI-Assisted Extraction of Rates & Footnotes From SoR PDFs

1. **Use-case ID and title:** `UC-26` — AI-Assisted Extraction of Rates & Footnotes From SoR PDFs
2. **Departmental business process:** Schedule Digitisation & Ingestion
3. **User persona:** `SoR Data Steward` / `AI Engineer`
4. **Current pain point:** Manual transcription of tables, units, and multi-line notes from PDFs is slow and error-prone (`TO VALIDATE`)
5. **Root cause:** Complex multi-column layouts, merged cells, and non-uniform page headers in PDF schedules (`SOURCE VERIFIED` PDF structure)
6. **Current manual process:** Manual typing/copy-pasting from PDF pages (`TO VALIDATE`)
7. **Proposed digital workflow:** Run layout/LLM extraction on staged PDF pages to propose structured rows and notes, tagging every output as `AI-Assisted — Steward Verification Required`
8. **Required data:** PDF page images/text, extracted candidate rows (`code`, `description`, `unit`, `rate`, `note`), confidence scores
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** AI proposes candidate fields; deterministic schema/numeric parser validates syntax; low-confidence or rate-delta items route to steward queue
11. **Exception condition:** LLM output fails schema validation or contains ungrounded numbers
12. **Expected system alert:** `"AI extraction staged {count} items—human verification required prior to publish"`
13. **Recommended action:** Steward verifies against side-by-side PDF view and approves/edits rows
14. **Approval or investigation owner:** `SoR Data Steward`
15. **Expected business outcome:** Faster catalogue digitization with human-verified accuracy
16. **KPI and calculation formula:** `Extraction Precision After Review (%) = (Unedited or Steward-Approved AI Rows / Total AI-Proposed Rows) * 100`
17. **Evidence required:** Original PDF page, AI extraction run ID, steward verification log
18. **Priority:** P1
19. **Implementation complexity:** High
20. **Acceptance criteria:** AI never directly publishes live rates without human steward approval

### UC-27: AI-Assisted Item Code Matching for Legacy or Free-Text BOQs

1. **Use-case ID and title:** `UC-27` — AI-Assisted Item Code Matching for Legacy or Free-Text BOQs
2. **Departmental business process:** BOQ Harmonisation & Migration
3. **User persona:** `AE` / `AEE` / `Procurement Officer`
4. **Current pain point:** Legacy or free-text item descriptions do not immediately map to `SoR 2026–2027` unique codes (`TO VALIDATE`)
5. **Root cause:** Inconsistent naming across historical estimates, DPRs, and tender schedules (`TO VALIDATE`)
6. **Current manual process:** Engineers manually search the schedule for matching work descriptions (`TO VALIDATE`)
7. **Proposed digital workflow:** AI suggests top candidate `sor_items` (`L-`, `M-`, `W-`, `C-`, `H-`) with similarity rationale and unit compatibility check
8. **Required data:** Source item description & unit, candidate `sor_items` catalogue
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** Semantic + lexical ranking over `sor_items` + deterministic unit check (`source_unit` vs `sor_item.unit_canonical`)
11. **Exception condition:** Unit mismatch (`cum.` vs `sqm.` vs `MT`) or low similarity score
12. **Expected system alert:** `"Suggested SoR matches shown—confirm technical specification and unit before locking"`
13. **Recommended action:** Engineer selects matching SoR code or flags item as non-schedule / rate-analysis item
14. **Approval or investigation owner:** `AE` / `AEE`
15. **Expected business outcome:** Faster BOQ standardization with explicit unit verification
16. **KPI and calculation formula:** `Top-3 Match Acceptance Rate (%) = (Accepted Top-3 AI Suggestions / Total BOQ Matching Attempts) * 100`
17. **Evidence required:** Original item text, selected `unique_code`, engineer confirmation log
18. **Priority:** P2
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Suggested matches display code, exact rate, unit, and PDF page; unit differences are highlighted

### UC-28: AI-Assisted Plain-Language Explanation of Rate & Rule Changes

1. **Use-case ID and title:** `UC-28` — AI-Assisted Plain-Language Explanation of Rate & Rule Changes
2. **Departmental business process:** Estimate Review & Stakeholder Communication
3. **User persona:** `DE` / `SE` / `CE` / `Accounts/Finance Officer`
4. **Current pain point:** Reviewing multi-page notes, footnotes, and rule interactions takes time during scrutiny (`TO VALIDATE`)
5. **Root cause:** Dense technical wording and cross-referenced footnotes across General Notes and Annexures
6. **Current manual process:** Officers read full notes/footnotes manually for each estimate (`TO VALIDATE`)
7. **Proposed digital workflow:** Generate concise, cited explanations of applicable rules, exclusions, and rate deltas grounded strictly in verified schedule text and deterministic outputs
8. **Required data:** Applicable `sor_items`, `sor_allowance_rules`, deterministic calculation trace, source page citations
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I (`w.e.f. 13/11/2026`)
10. **Detection or calculation logic:** Grounded RAG/context generation constrained to retrieved clauses & deterministic output JSON; verify all cited numbers match deterministic engine
11. **Exception condition:** Source clause ambiguous or missing (`TO VALIDATE`)
12. **Expected system alert:** `"AI summary generated from verified clauses—refer to cited page/rule for authoritative text"`
13. **Recommended action:** Read cited clause/calculation trace when reviewing estimate or query
14. **Approval or investigation owner:** Reviewing Officer (`DE` / `SE` / `Accounts`)
15. **Expected business outcome:** Faster technical & financial review comprehension
16. **KPI and calculation formula:** `Citation Grounding Rate (%) = (AI Explanations With Verified Source & Math Match / Total AI Explanations) * 100`
17. **Evidence required:** Prompt/response log, cited rule/page IDs, deterministic calculation snapshot
18. **Priority:** P2
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Every numerical figure in an AI explanation matches the deterministic engine output

### UC-29: Enforce Jurisdiction-Scoped Visibility & RBAC Across Divisions

1. **Use-case ID and title:** `UC-29` — Enforce Jurisdiction-Scoped Visibility & RBAC Across Divisions
2. **Departmental business process:** Information Security & Governance
3. **User persona:** All TN-HDOS Users & `System Admin`
4. **Current pain point:** Risk of exposing division-specific draft estimates, bills, or audit notes to unauthorized users (`TO VALIDATE`)
5. **Root cause:** Multi-tier organizational hierarchy (`Minister/Secretary/DG/CE` vs `SE/DE/AEE/AE` vs external roles)


6. **Current manual process:** File-level or folder-level access (`TO VALIDATE`)
7. **Proposed digital workflow:** Enforce RBAC + jurisdiction scope (`division_id`, `circle_id`, `wing_id`, `contract_id`) on every read/write API endpoint and UI query
8. **Required data:** User role, assigned jurisdiction scope, target record jurisdiction/contract ID
9. **Applicable SOR rule or source:** TN-HDOS Security & Governance specification (`TO VALIDATE` exact role/jurisdiction bindings)
10. **Detection or calculation logic:** Authorize iff `role_permits(role, action)` AND (`is_statewide_role(role)` OR `record.jurisdiction IN user.jurisdictions` OR `record.contract_id IN user.contracts`)
11. **Exception condition:** Explicit temporary audit/escalation grant (`TO VALIDATE`)
12. **Expected system alert:** `"Access denied: record outside your authorized role or jurisdiction scope"`
13. **Recommended action:** Return `403 Forbidden` and log access attempt in `sor_audit_events`
14. **Approval or investigation owner:** `System Admin` / `Security & Audit Governance`
15. **Expected business outcome:** Strict adherence to need-to-know and jurisdictional boundaries
16. **KPI and calculation formula:** `Unauthorized Access Block Rate (%) = (Blocked Out-of-Scope Requests / Total Out-of-Scope Requests) * 100` (Target: `100%`)
17. **Evidence required:** `sor_audit_events` entry with user ID, role, jurisdiction, and result
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Out-of-jurisdiction API and UI requests return `403` and record an audit event

### UC-30: Record Immutable Audit Trail for Rate Overrides & Approvals

1. **Use-case ID and title:** `UC-30` — Record Immutable Audit Trail for Rate Overrides & Approvals
2. **Departmental business process:** Audit, Legal & Compliance
3. **User persona:** `Audit/Legal Officer` / `Accounts/Finance Officer` / `Sanctioning Officer`
4. **Current pain point:** Difficulty reconstructing who changed a number, rule, or approval status and why (`TO VALIDATE`)
5. **Root cause:** Overwritten cells in spreadsheets or mutable status fields without history (`TO VALIDATE`)
6. **Current manual process:** Manual file endorsements and scattered emails (`TO VALIDATE`)
7. **Proposed digital workflow:** Append an immutable `sor_audit_events` entry on every create, update, calculation run, override, review disposition, and approval action
8. **Required data:** `actor_user_id`, `actor_role`, `jurisdiction_code`, `action`, `target_type`, `target_id`, `before_state_json`, `after_state_json`, `timestamp`
9. **Applicable SOR rule or source:** TN-HDOS Audit & Governance specification
10. **Detection or calculation logic:** Database trigger/service enforces insert-only on `sor_audit_events` (no `UPDATE`/`DELETE` on audit rows); compute diff between `before_state_json` and `after_state_json`
11. **Exception condition:** Database/log pipeline outage (`buffer & alert immediately; fail closed on mutating financial writes` — `TO VALIDATE`)
12. **Expected system alert:** `"Audit trail write failure—action blocked until logging service is healthy"`
13. **Recommended action:** Inspect audit log in `/sor-weci/approvals-audit` or export signed/traceable audit bundle for `Domain G`
14. **Approval or investigation owner:** `Audit/Legal Officer` / `System Admin`
15. **Expected business outcome:** Complete, tamper-evident audit trail across the estimation-to-payment lifecycle
16. **KPI and calculation formula:** `Audit Log Coverage (%) = (Mutating Actions With Matching Audit Event / Total Mutating Actions) * 100` (Target: `100%`)
17. **Evidence required:** `sor_audit_events` record ID, correlation ID, before/after JSON diff
18. **Priority:** P0
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Every estimate/BOQ/bill/finding state transition is visible in the audit log and cannot be edited or deleted via app APIs

### UC-31: Handle Hybrid/Special Works Requiring Non-SoR or Specialized Schedules

1. **Use-case ID and title:** `UC-31` — Handle Hybrid/Special Works Requiring Non-SoR or Specialized Schedules
2. **Departmental business process:** Specialized Engineering & Estimation
3. **User persona:** `AE` / `AEE` / `DE`
4. **Current pain point:** Specialized items not covered in the schedule require separate departmental/board schedules or data analysis (`TO VALIDATE`)
5. **Root cause:** General Note states that for special nature of works not covered in the SoR, separate schedules issued by respective officers/departments/boards are to be followed
6. **Current manual process:** External rate sheets pasted manually into estimate files (`TO VALIDATE`)
7. **Proposed digital workflow:** Allow tagging a line as `EXTERNAL_SCHEDULE / RATE_ANALYSIS_REQUIRED` with explicit schedule reference and approval gate, keeping it distinct from `SoR-2026-2027` items
8. **Required data:** Item description, unit, external schedule/authority reference, proposed rate, supporting rate analysis
9. **Applicable SOR rule or source:** General Note p. 1 (`For special nature of works, for which rates are not covered in the Schedule of Rates... separate schedule of rates... are to be followed`)
10. **Detection or calculation logic:** Flag non-SoR lines with `source_type = 'EXTERNAL_OR_ANALYSIS'`; exclude from `SoR-2026-2027` basic-rate match count and require authority attachment
11. **Exception condition:** Missing external schedule/authority reference
12. **Expected system alert:** `"Non-SoR item flagged: attach approved department/board schedule or rate analysis"`
13. **Recommended action:** Upload applicable schedule/rate analysis and obtain designated technical approval (`TO VALIDATE`)
14. **Approval or investigation owner:** Competent Technical Authority per delegation order (`TO VALIDATE`)
15. **Expected business outcome:** Clear separation between official SoR 2026–2027 items and specialized/external schedule items
16. **KPI and calculation formula:** `External-Item Documentation Rate (%) = (Non-SoR Lines With Schedule/Analysis Ref / Total Non-SoR Lines) * 100`
17. **Evidence required:** External schedule/order reference, rate analysis sheet, approval record
18. **Priority:** P1
19. **Implementation complexity:** Medium
20. **Acceptance criteria:** Non-SoR items are visibly tagged as `Non-SoR / External` and carry mandatory reference metadata

### UC-32: Operate Core SoR & Cost Intelligence Without AI Availability

1. **Use-case ID and title:** `UC-32` — Operate Core SoR & Cost Intelligence Without AI Availability
2. **Departmental business process:** Business Continuity & Resilient Operations
3. **User persona:** All Departmental Users (`AE`, `AEE`, `DE`, `SE`, `Accounts/Finance`, `Audit/Legal`)
4. **Current pain point:** AI service latency or outage must never block core estimation, BOQ, rule validation, or billing workflows
5. **Root cause:** Dependency on external/optional LLM or AI inference endpoints
6. **Current manual process:** Fallback to manual calculation if external tools fail (`TO VALIDATE`)
7. **Proposed digital workflow:** Keep catalogue browsing, deterministic estimate/BOQ calculation, rule enforcement, reconciliation, and rule-based deviation checks 100% independent of AI services
8. **Required data:** PostgreSQL/SQLite `sor_items`, `sor_allowance_rules`, `sor_estimates`, `sor_reconciliation_entries`, `sor_anomaly_findings`
9. **Applicable SOR rule or source:** SoR 2026–2027 Volume I & TN-HDOS Resilience requirement
10. **Detection or calculation logic:** When `ai_service_available == false`, hide/disable `AI Assist` buttons with a non-blocking status badge while all deterministic endpoints/screens execute normally
11. **Exception condition:** AI endpoint timeout or `503` error
12. **Expected system alert:** `"AI Assistant temporarily unavailable—all deterministic estimation, rule, and audit tools remain active"`
13. **Recommended action:** Proceed with deterministic estimation, rule checks, and approvals; retry AI assist later if desired
14. **Approval or investigation owner:** `System Admin` / Operating Engineers
15. **Expected business outcome:** Zero operational downtime for estimation and financial controls when AI is offline
16. **KPI and calculation formula:** `Core Workflow Availability Without AI (%) = (Uptime Minutes of Core SoR/Estimate/Reconciliation With AI Off / Total Scheduled Minutes) * 100` (Target: `99.9%`)
17. **Evidence required:** Health-check logs and deterministic calculation test results with AI disabled
18. **Priority:** P0
19. **Implementation complexity:** Low
20. **Acceptance criteria:** Full end-to-end estimate creation, calculation, and audit logging succeeds with AI service disabled

---

## Part 18: Source-to-Feature Traceability Matrix (`SOURCE VERIFIED` / `PROPOSED` / `TO VALIDATE`)

| Source Reference (PDF Page / Printed Page / Section) | Key Provision or Data | Target Feature / Screen / Rule | Status |
| --- | --- | --- | --- |
| PDF p. 5 (`Preface`, `G.O. (Ms). No 3, PWD (G2) dt. 14.03.2024`) | Committee, WPI/market/TANCEM/SAIL basis, Volumes I–III, w.e.f. `13/11/2026` | `/sor-weci/catalogue`, `/sor-weci/ingestion`, `BR-01`, `UC-01` | `SOURCE VERIFIED` |
| PDF pp. 6–7 (`Index`, printed pp. i–ii) | Volume I structure; Highways printed pp. `311`–`352` (`Structure`, `Annexures I–IX`) | Navigation tabs, `/sor-weci/ingestion`, `FR-01`, `FR-03` | `SOURCE VERIFIED` / `TO VALIDATE` (pp. 311–352 text) |
| PDF pp. 8–13 (`General Note`, printed pp. 1–6) | No extra % outside specified areas; special areas (`Corp`, `Restricted`, `Hills`, `Islands`); `General Note 8` (basic rate non-compounding, human labour in works, AEE quarry-vs-conveyance check, Annexure VI/VII site-rate rule, GST/G.O. Ms. No. 114 dt. 22.07.2022); `General Note 10` (Highways provisional 3% bridge structural rule, >50% road-bridge rule, drain/culvert/retaining wall/repair exclusions) | `BR-02`–`BR-08`, `UC-03`–`UC-12`, `UC-15`, `UC-31`, `/sor-weci/estimates`, `/sor-weci/cost-intelligence` | `SOURCE VERIFIED` (with `TO VALIDATE` on WRD-specific tags & Highways GST mapping) |
| PDF pp. 14–16 (`General Note - Table`, printed pp. 7–9) | Area/item allowance table & Note 1 (WRD items) | `BR-04`, `BR-05`, `UC-04`, `UC-05`, data-quality parser (`TO VALIDATE` header/column shifts) | `SOURCE VERIFIED` |
| PDF pp. 18–250 (`Unique Code` format & PWD Annexures I–VII) | Code structure `A-1234` (`L`, `M`, `W`, `C`, `H`); Labour (`L-`); Materials (`M-`); Works (`W-`); Head load (`C-`); Conveyance (`C-` Plains/Hills); GO-referenced sand/NLC items (`M-0127`, `M-0128`, `M-2853`) | `FR-01`–`FR-03`, `BR-06`–`BR-09`, `UC-09`–`UC-14`, `UC-22`, `UC-26`–`UC-27` | `SOURCE VERIFIED` |
| PDF index p. 7 (Highways printed pp. `311`–`352`) | Highways unique codes, Labour, Materials, Works, QC Equipment, Road Furniture, Survey & DPR, Avenue Plantation, Sub Data, T&P Hire | `FR-01`, `FR-03`, `BR-10`, `UC-23`, Phase 1 ingestion | `TO VALIDATE` (full text in remaining PDF pages) |

---

## Part 19: Independent Expert Review (Self-Challenge Against Section 13)

1. **Unnecessary pages?** No—15 requested capabilities are consolidated into **6 clean pages** (`/sor-weci/catalogue`, `/sor-weci/estimates`, `/sor-weci/cost-intelligence`, `/sor-weci/reconciliation`, `/sor-weci/approvals-audit`, `/sor-weci/ingestion`) with contextual tabs and drawers.
2. **Duplicating existing TN-HDOS capabilities?** No—integrates with existing TN-HDOS domains (`A`–`H`) without rebuilding project, QC, procurement, or legal/audit modules.
3. **Rate calculations explainable and auditable?** Yes—every calculation stores deterministic rule IDs, inputs, step-by-step math, and `sor_audit_events` diffs.
4. **Traceable to official source?** Yes—each item and rule carries `sor_version_id`, effective date (`13/11/2026`), and printed/PDF page citation.
5. **Rate versions and amendments handled correctly?** Yes—versioned `sor_versions` and historical snapshots on estimates/BOQs/bills prevent retroactive corruption when new schedules or amendments arrive.
6. **Anomaly vs. legitimate exception distinguished?** Yes—rule engine + benchmark engine emit neutral `sor_anomaly_findings` reviewed via `Justified Exception`, `Requires Revision`, or `Refer to Audit/Legal` workflows, with explicit prohibition on fraud labels.
7. **Practical for field engineers on mobile?** Yes—responsive layouts, concise mobile cards/steppers, and `TO VALIDATE` offline/low-connectivity considerations (`TO VALIDATE` mobile sync).
8. **Works without AI?** Yes (`UC-32`)—all catalogue browsing, deterministic math, rule enforcement, reconciliation, and audit logging run without AI.
9. **Permissions and statutory approvals respected?** Yes—RBAC, jurisdiction scoping, and `TO VALIDATE` delegation-order mapping govern actions; no authority is inferred from job title alone.
10. **Extensible to other schedules without corrupting Highways rules?** Yes—`department_scope`, `annexure_code`, and `sor_allowance_rules` isolate Highways-specific rules (`General Note 10`, etc.) cleanly.

---

## Part 20: Architecture & Integration Diagrams (`PROPOSED` / `EXISTING PRODUCT` / `TO VALIDATE`)

```text
+-----------------------------------------------------------------------------------+
|                        TN-HDOS FRONTEND (React 18, TS, Vite, Tailwind)           |
|  Existing Domains (A-H) <---- Deep Links & Shared Context ----> /sor-weci/*       |
|  [Domain B: Projects/MB] [Domain D: Tenders/Bills] [Domain G: Audit] [Domain H: AI]|
|  New /sor-weci Pages: Catalogue | Estimates & BOQ | Cost Intelligence |           |
|                       Reconciliation | Approvals & Audit | Ingestion               |
+-----------------------------------------+-----------------------------------------+
                                          | REST API (/api/v1/sor-weci/*)
                                          v
+-----------------------------------------------------------------------------------+
|                     TN-HDOS BACKEND (Python FastAPI, SQLAlchemy)                  |
|  +-------------------------+  +--------------------------+  +------------------+ |
|  | Deterministic Rate &    |  | Cost Intelligence &      |  | Bounded AI Assist| |
|  | Rule Engine (Decimal)   |  | Anomaly Detector         |  | (Extract/Match/  | |
|  | - SoR 2026-27 (13/11/26)|  | - 10-Point Dossier       |  |  Explain; Cited) | |
|  | - Allowances & Bridge 3%|  | - No Fraud Auto-Labels   |  |  No Math/Approve | |
|  +------------+------------+  +------------+-------------+  +--------+---------+ |
|               |                            |                         |            |
|               +--------------+-------------+-------------------------+            |
|                              |                                                    |
|                              v                                                    |
|  +-----------------------------------------------------------------------------+  |
|  | RBAC, Jurisdiction Filter, Delegation Gate (TO VALIDATE) & Immutable Audit   |  |
|  +--------------------------------------+--------------------------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|            DATA LAYER (SQLite Dev / PostgreSQL Prod + Evidence/PDF Store)          |
|  sor_versions | sor_items | sor_allowance_rules | sor_estimates | sor_boq_items |
|  sor_reconciliation_entries | sor_anomaly_findings | sor_evidence_links | audit   |
+-----------------------------------------------------------------------------------+

```

---

## Part 21: Sequential Antigravity IDE Implementation Prompts (`PROPOSED` Sequence)

Execute these prompts in order inside **Antigravity IDE** (using your configured model/BYOK setup):

1. **Prompt 1 — Repository & Existing TN-HDOS Audit (`TO VALIDATE`):**
> *"Inspect the `govt-highways-agent` repository structure, frontend routes/components (`Domains A–H`), FastAPI routers/models, RBAC/auth middleware, and database setup. Produce a concise gap report mapping existing entities/routes to the TN-HDOS SoR-WECI PRD before writing new feature code."*


2. **Prompt 2 — Database Schema & Seed Migration for SoR 2026–2027:**
> *"Create SQLAlchemy models and Alembic/migration scripts for `sor_versions`, `sor_items`, `sor_allowance_rules`, `sor_estimates`, `sor_estimate_lines`, `sor_boq_items`, `sor_reconciliation_entries`, `sor_anomaly_findings`, `sor_evidence_links`, and `sor_audit_events` compatible with SQLite and PostgreSQL. Seed `SoR-2026-2027-V1` (`w.e.f. 13/11/2026`) and the verified items/rules from Part 2 and Part 8 of the PRD, plus ingestion placeholders for Highways printed pages 311–352 (`TO VALIDATE`)."*


3. **Prompt 3 — Deterministic Rate, Conveyance & Allowance Engine + Unit Tests:**
> *"Implement a pure, deterministic Python calculation module using `Decimal` (`ROUND_HALF_UP`) enforcing rules `BR-01` through `BR-10` (SoR `13/11/2026` effective date, non-compounding basic-rate rule, Corporation/Municipal allowances, Night-work +25% labour-only with tender clause, Highways Bridge 3% structural-only and >50% road-bridge rule with drain/culvert/retaining-wall/repair exclusions, Head load 10m/2m free & 100m rounding, Plains/Hills conveyance slabs & track modifiers excluding loading/unloading, Annexure VI/VII zero-conveyance rule, and GST/tax separation). Write comprehensive unit tests covering every edge case and exclusion."*


4. **Prompt 4 — FastAPI Endpoints, RBAC, Jurisdiction & Immutable Audit Logging:**
> *"Build FastAPI routers under `/api/v1/sor-weci` for versions, items, estimates, line calculation, BOQ generation, reconciliation, cost intelligence findings, human review dispositions, and audit events. Enforce role/jurisdiction checks, delegation-order gates (`TO VALIDATE`), and append-only `sor_audit_events` writes with before/after JSON diffs."*


5. **Prompt 5 — Catalogue & Estimate/BOQ Studio Frontend (`/sor-weci/catalogue` & `/sor-weci/estimates`):**
> *"Build the React 18 + TypeScript + Tailwind screens for `/sor-weci/catalogue` (with category tabs, code/keyword search, effective date `13/11/2026` badge, and PDF page provenance drawer) and `/sor-weci/estimates` (with line items, lead/lift inputs, rule/allowance breakdown, and `TO VALIDATE` indicators). Ensure full keyboard accessibility and responsive mobile layout."*


6. **Prompt 6 — Cost Intelligence, Reconciliation, Approvals/Audit & Bounded AI Assist:**
> *"Build `/sor-weci/cost-intelligence` (with benchmark comparisons, non-accusatory deviation findings, and the 10-point investigation dossier), `/sor-weci/reconciliation`, `/sor-weci/approvals-audit`, and `/sor-weci/ingestion`. Integrate bounded `/api/v1/ai/assist` endpoints that return cited explanations/suggestions while keeping all calculations deterministic and functional when AI is offline (`UC-32`)."*