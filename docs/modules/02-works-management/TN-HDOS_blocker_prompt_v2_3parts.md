# TN-HDOS Blocker, Exposure and Mitigation: Antigravity Prompts (v2, 3 parts)

Run **in order**. Paste one part at a time into Antigravity (Claude model), Plan mode first. Do not start Part N+1 until Part N passes its checks.

**Review before pasting Part 1:** this repo is a demo (synthetic + one dated source PDF). Thresholds below are PROPOSED defaults, not departmental standards.

---
## PART 1: AUDIT + IMPORT + EVIDENCE SPINE

```xml
<context>
TN-HDOS is a demo governance platform for the Tamil Nadu Highways Department. Goal of this enhancement: find the small unresolved blocker that causes disproportionate delay or cost, trace its evidence, name the authority who can resolve it, and track verified closure.
Source snapshot: "More than 50Cr works details as on 21.09.2026.pdf" (31 works, Chennai C&M Region, Minister review of 22 Sep 2026). This is a DATED SNAPSHOT, not live status.
Demo data rules: all non-PDF records are synthetic and labelled SEEDED DEMO. Real privacy handling is out of scope for the demo.
</context>

<hard_rules>
- MUST audit the repository before changing anything. NEVER assume a feature exists; verify by file path, route, API and test.
- MUST reuse existing models, APIs, components, roles and UI patterns. NEVER create a second project table or a separate financial database.
- MUST preserve existing routes and behaviour.
- Blank or missing source fields mean "not reported", NEVER "no issue". Show "Not reported".
- NEVER attribute delay, cost or fault to a person, contractor, consultant or department. Record contributing factors and evidence only; a human assigns findings.
- NEVER overwrite newer verified project data with the September 2026 snapshot. Store it as a dated snapshot linked to the canonical project.
- Every extracted PDF value MUST carry source document, page number, extraction confidence and verification status (EXTRACTED / VERIFIED / CONFLICTING).
- These rules apply to every record, every field, every screen.
</hard_rules>

<task>
Step 1. AUDIT. Inventory existing: project registry, Project 360°, finance, contractors, land/litigation, documents/evidence, notifications, relationship explorer, Ask AI, roles. Classify each VERIFIED IMPLEMENTED / PARTIAL / PLACEHOLDER / MISSING with file paths. Output the inventory, then stop and wait for "continue".

Step 2. IMPORT. Build a staging import (not direct write) for the 31 works keyed by source project ID. Fields: project ID and name, scheme/funding, circle, division, road/bridge details, chainage, length, contractor, contract value, technical sanction, commencement date, agreement completion date, estimated completion date, physical %, financial %, expenditure, agreement milestones vs actual, remarks, land acquisition, forest clearance, court case, railway approval, utility shifting, source page.
- Provide a review screen where a human confirms or corrects each extracted value. Nothing becomes canonical until verified.
- Match to existing projects by source ID; on match, add a snapshot; on no match, create one canonical project. Zero duplicates.
- Portfolio tag MAJOR_WORKS_50CR. The ₹50 crore basis (contract value vs sanction) is uncertain: store both, flag any work where the choice changes membership, never silently exclude.
- Preserve original text and units alongside normalised values.

Step 3. EVIDENCE SPINE. Reuse the existing document/evidence model. Create ONLY missing minimal entities, with typed relations to Project / WorkPackage:
- DelayEvent (cause category, start/end, affected milestone, status, evidence links; multiple causes allowed, a day counted once)
- Blocker (see categories below; links to DelayEvent)
- Obligation (owner party, deliverable, due date, acceptance criteria, status)
- EvidenceRequest (what is missing, from whom, due date)
Blocker categories: land acquisition; revenue records/survey; title dispute; litigation/stay (pending case vs operative order are separate fields); compensation/possession; forest; environmental; railway; utility shifting; contractor performance; design/technical approval; material/labour; financial release; public objection/encroachment; interdepartmental; quality/safety; other.
Every record shows data provenance and, where unverified, "Not yet verified".
</task>

<acceptance>
- Inventory delivered with file evidence.
- 31 of 31 works staged with page provenance; reconciliation report lists any field not extracted.
- Zero duplicate projects (test).
- Snapshot rows preserved; canonical rows not overwritten (test).
- Existing tests and routes pass.
</acceptance>

<output>
After each step print: ✅ what was completed, files changed, tests run, open gaps. Final: table (Requirement | Previous status | New status | Files | Tests | Gaps) using COMPLETED / PARTIAL / PLACEHOLDER / PENDING / BLOCKED. Then STOP. Do not start Part 2.
</output>
```

---
## PART 2: DELAY INVESTIGATION + EXPOSURE LEDGER + SITE READINESS GATE

```xml
<context>
Part 1 is complete. Canonical projects, snapshots, DelayEvent, Blocker, Obligation, EvidenceRequest exist. Demo; synthetic records are labelled SEEDED DEMO.
</context>

<hard_rules>
- MUST NOT attribute causal responsibility without evidence. Output contributing factors and an evidence request, never a verdict.
- MUST show "Not yet quantified" when cost evidence is missing, and create an EvidenceRequest. NEVER treat full project value as loss. NEVER convert missing data into zero.
- Critical-path data is likely unavailable. If no schedule network exists, use milestone-based variance, label confidence LOW, and request the schedule. NEVER fabricate a critical path.
- Pending case ≠ operative court order. Only an operative order that restricts the work creates a legal RED.
- NEVER recommend work that breaches a court order, statute, contract or safety requirement.
- Thresholds are configurable (YAML), PROPOSED defaults, labelled "TO VALIDATE", never hardcoded.
- These rules apply to every calculation and every alert.
</hard_rules>

<task>
A. DELAY INVESTIGATION RULES (deterministic, unit-tested). Compare baseline completion, approved revised date, current forecast, planned vs actual milestones, physical vs financial progress, approved EOT records, correspondence. Flags:
- missed milestone; completion-date extension with no approved EOT record
- physical vs financial gap (default amber ≥15 pts, red ≥25 pts)
- blocker age (default amber ≥30 days, red ≥60 days)
- interdepartmental request unanswered (default amber ≥15 days, red ≥30 days)
- completion slip (default amber ≥60 days, red ≥180 days)
- report vs milestone conflict; repeat unresolved issue; missing approval/handover
Each flag returns: rule ID, inputs, formula, evidence links, confidence, data limitations.

B. EXPOSURE LEDGER. Map the 12 line items below into exactly five states: POTENTIAL, VERIFIED, PREVENTED, RECOVERED, AVOIDED-FUTURE. Display the five states separately; NEVER sum across states.
Line items: actual additional expenditure; claims submitted; claims admitted; claims disputed; idle resources; contractual escalation; financing cost; legal expenses; forecast incremental expenditure; potentially avoidable future expenditure; confirmed recoverable; delayed public benefit (non-monetary unless a method is documented).
Each figure shows formula, inputs, source, assumptions, period, confidence, verification status, reviewer. Duplicate detection on invoice IDs, claim IDs and expenditure references (test with a planted duplicate).

C. SITE READINESS GATE. Before tender award, mobilisation or work at a chainage, check: land/survey, possession, court restrictions, forest/environmental, railway, utilities, design approvals, access, contractual readiness, safety. RED / AMBER / GREEN with the restriction, evidence and lawful resolution. Management may record a documented review but NEVER override a binding legal restriction.

D. REFERENCE SCENARIO, Project 5566 (ROB at LC-13, Thirunindravur–Veppampattu). Source snapshot: physical 78%, expenditure ₹38.36 crore, agreement completion 20 Mar 2026, estimated 31 Jan 2027, difference 317 days. Source remarks mention railway-side work. Expected system behaviour:
- compute 317 days from the dates;
- critical-path blocker: "not established"; litigation: "not reported"; financial loss: "not established";
- generate EvidenceRequests: railway coordination records, approved EOT, remaining-work programme, site handover, contractor claims, financial records;
- NEVER attribute the 317 days to Railways.
Any added evidence for the demo MUST be labelled SEEDED DEMO.
</task>

<acceptance>
- Each rule has unit tests with pass/fail fixtures.
- 5566 golden-path test passes exactly as above.
- Double-count test passes; five states never summed.
- Missing cost data renders "Not yet quantified", not 0.
- Threshold change in YAML changes results without code change.
- Existing tests pass.
</acceptance>

<output>
After each step print: ✅ completed, files, tests run, gaps. Final table (Requirement | Previous | New | Files | Tests | Gaps). Then STOP. Do not start Part 3.
</output>
```

---
## PART 3: MITIGATION, ESCALATION, DASHBOARDS, ASK AI

```xml
<context>
Parts 1 and 2 are complete. Rules, ledger, readiness gate and the 5566 scenario work.
</context>

<hard_rules>
- AI explains and recommends; a human approves. NEVER let an LLM decide a formula, legal deadline, entitlement or permission.
- Every recommendation MUST include evidence links, missing information, and uncertainty.
- NEVER name an officer as the cause. Show "responsible resolution authority" and "assigned action owner" only.
- Dashboard tiles MUST answer: what decision, whose, by when. Remove any tile with no owner or action.
- Use messaging/calendar/notification modules ONLY if they already exist; otherwise use comments and reminders on the record.
- Seeded records stay labelled SEEDED DEMO everywhere.
- These rules apply to every output and every tile.
</hard_rules>

<task>
A. MITIGATION ENGINE, per critical blocker: what is stopping work; why (evidence); what is missing; who can resolve; lawful options with pros and cons; expected timeline; cost of intervention vs cost of waiting (only if quantified); required approver; how success is verified. Options include: continue unaffected packages, expedite approval, joint departmental review, complete survey documents, seek legal clarification on an operative order, resolve compensation/possession, re-sequence, review contractual acceleration.
B. ESCALATION WORKFLOW: investigate → assign owner → request evidence → inter-department request with acknowledgement and SLA clock → joint review → corrective action → escalate on breach (ladder: EE → SE → CE → Secretary → CM) → record direction → closure with evidence → reopen. Audit-log every transition.
C. BLOCKERS & MITIGATION TAB in Project 360°, plus a portfolio view under Major Works ₹50 Cr+. Filterable table, timeline, exposure panel (five separate states), root-cause breakdown, responsible-authority panel, escalation history, evidence viewer. Loading, empty, error, access-denied states. Everything clickable.
D. EXECUTIVE SECTION "Major Works: Financial Risk & Intervention" (CM, Minister, Secretary): projects with critical blockers; completion-date extensions; top unresolved interdepartmental dependencies; land/litigation and railway risks; five exposure states shown separately; unresolved actions; decisions needed. Every KPI drills to project → blocker → evidence → calculation → owner.
E. ASK AI (permission-scoped, retrieval over verified records): answers cite record IDs and dates, state uncertainty, and refuse to name fault, decide entitlement or give legal conclusions. Provide 20 test questions with expected cited answers (e.g., "Which projects have unresolved Railway dependencies?", "Which blocker has the highest verified exposure?").
</task>

<acceptance>
- Dashboard click-through opens the correct investigation (e2e test).
- Every recommendation shows evidence, missing info and uncertainty (test).
- Ask AI: 20 questions evaluated; 0 uncited answers; refusal test on fault/legal questions passes.
- Escalation timers fire on a time-travel test.
- Existing screens, APIs and roles work.
</acceptance>

<output>
After each step print: ✅ completed, files, tests, gaps. Final table (Requirement | Previous | New | Files | APIs | DB changes | Tests | Gaps). Then STOP.
</output>
```

---
**Warning: these prompts are for an agentic tool with real system access.** Review scope locks, forbidden actions and stop conditions before pasting. Confirm repo paths, directories and permissions match the actual project.
