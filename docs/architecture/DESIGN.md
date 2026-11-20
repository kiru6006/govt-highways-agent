# TN-HDOS: Government-First Design System (Final Antigravity Prompt)

Paste everything below the line into Antigravity (Claude model). Run **Plan mode first**. Stop after each stage and wait for "continue".

---

## ROLE
Principal Frontend Architect + Government UX Designer + Highways domain-aware design-system engineer.

## OBJECTIVE
Implement one consistent, accessible, token-driven design system across TN-HDOS. **Preserve all existing routes, data, APIs, and business logic.** Do not redesign working screens without a demonstrated usability issue.

## NON-NEGOTIABLE RULES
1. **Never invent or claim an official TN Highways colour standard.** Official brand hex codes are **unknown until verified from an official source**. Do NOT assume red/gold/black. Do NOT guess hex codes.
2. Every colour convention is labelled one of: `OFFICIAL SOURCE VERIFIED` / `PROPOSED DESIGN CONVENTION` / `AWAITING DEPARTMENTAL VALIDATION`. Nothing is marked official without a cited document.
3. **Colour is never the only carrier of meaning.** Every colour pairs with text label + icon/shape/pattern.
4. **Zero hardcoded colours** in components. Tokens only.
5. **Colour budget: one semantic colour channel per attribute type.** Status = colour. Road class = line style + colour (map only). Roles, categories, wings = **neutral** (text + icon), NOT coloured.
6. **No two tokens may share a hex value** across different semantic groups (enforced by test, see Stage 6).
7. Never recolour government emblems/logos. Use originals as supplied. Confirm emblem/logo usage permission is documented (TO VALIDATE; flag if unknown).
8. Synthetic/seeded records must never look like verified records.
9. Never claim an official approved the design without a documented written approval.

---

## STAGE 0: DISCOVERY (no code)
Inspect and report, with source URL, document date, source type:
- Official Tamil Nadu Government emblem + Highways Department logo/branding (original colours, proportions, usage rules).
- Existing Highways Department website branding.
- GIGW 3.0 and UX4G (typography, contrast, accessibility, layout expectations).
- IRC/MoRTH standards on road classification, signs, markings. Record that these govern **signs and markings**, not GIS or UI colours.
- Any official Highways maps/legends available. If none: use the proposed legend in Stage 3, labelled PROPOSED.
- Current official organisational structure (verify; flag outdated/conflicting records).
- Existing frontend: framework, current colours, current components, current routes.

Output: `docs/design/TN_HDOS_UX_AUDIT.md` (findings, gaps, what is VERIFIED vs PROPOSED). If official branding cannot be verified, **use the provisional shell below and say so in the UI footer of docs, not on production screens**.

---

## STAGE 1: FOUR-LAYER TOKEN ARCHITECTURE
Create `frontend/src/design/tokens.css` (CSS custom properties) + `tokens.ts` (typed export) + `brand.config.ts`.

### Layer A: Government identity (shell only)
`brand.config.ts` holds `status: "PROVISIONAL" | "OFFICIAL_VERIFIED"`. Shell tokens are swappable in one file when official branding is confirmed.

Provisional values (PROPOSED, replace after verification):
```css
--shell-bg: #0F2A4A;          /* header, sidebar */
--shell-fg: #FFFFFF;
--shell-active-indicator: #FFFFFF; /* 4px left bar, not a hue */
--shell-btn-primary-bg: #0F2A4A;
--shell-btn-primary-fg: #FFFFFF;
--surface-page: #F4F7FB;
--surface-card: #FFFFFF;
--border-default: #DCE4ED;
--text-primary: #1F2937;
--text-secondary: #5B6678;
--focus-ring: #1D4ED8;        /* 2px + 2px offset, always visible */
```
Layer A tokens are used **only** by header, sidebar, footer, primary buttons, global chrome. Never for data.

### Layer B: Entity identification
Identify entities by **official name + code + icon + text label**, not colour: roles/designations, wings, programmes, categories, contractors, officials, departments.
- Roles (Minister, Secretary, EIC/CE, SE, DE, ADE, Finance, Legal, Contractor, Other): neutral slate badge `--entity-badge-bg: #E5E8ED; --entity-badge-fg: #3F4756;` + role code text + icon.
- Contractors: same neutral badge with dashed border (distinguishes external from departmental).
- Project categories (CKICP, TNRSP-II, Bridge, Widening, Maintenance, New Construction, Land, Utility, Other): neutral outline chip + icon + label.
- Wings (Planning, Design & Investigation, Quality Assurance & Research, Construction & Maintenance, National Highways, NABARD & Rural Roads, Projects, Metro, TNRSP, IT Cell): same neutral style + official name + code + icon + navigation group. **No per-wing colours.**
- TNRDC and TNRIDC are corporations/companies, not departmental wings. Model as separate entity type "Associated Agency".

### Layer C: Operational status (the only broad semantic-colour set)
Each status has `fg` (text), `bg` (tint), `solid` (dots, markers, charts). Verified: fg/bg contrast ≥ 4.5:1; solid vs white ≥ 3:1.

| Status | Icon | fg | bg | solid |
|---|---|---|---|---|
| On track | check-circle | #0F6B4A | #E3F4EC | #1E9E6B |
| Under observation | eye | #14578F | #E2EFFA | #1F78C8 |
| At risk | alert-triangle | #7A4B00 | #FFF1CC | #B07A00 |
| Delayed | clock-alert | #8F3A00 | #FFE6D2 | #E8650A |
| Critical | octagon-alert | #9B1C1C | #FDE3E3 | #D32F2F |
| Completed | check-check | #0B4F36 | #CFEBDD | #15704D |
| On hold / stayed | pause-circle | #3F4756 | #E5E8ED | #6B7280 |
| Pending approval | hourglass | #5B2DB0 | #EDE5FB | #7C4DDB |

Rules: status is independent of project category, road class, and role. Badge = icon + text + tint. Charts: add direct labels/patterns, not colour-only legends.

### Layer D: Data provenance (shape/pattern, not hue)
Distinct border/pattern language so it never competes with status colours:
| Badge | Style |
|---|---|
| Officially Verified | solid border, check icon, "Verified" + source + date |
| Extracted | dotted border, scan icon |
| **Seeded Demo** | diagonal-stripe background, dashed border, "DEMO" text, always visible |
| Pending Verification | dashed grey border, hourglass |
| Conflicting | double border, split-arrow icon |
| Outdated | clock icon, strikethrough date |
| Rejected | grey, strikethrough, x icon |

Global rule: any screen containing seeded data shows a persistent `SEEDED DEMO DATA` ribbon. Unverified contacts never render as confirmed.

---

## STAGE 2: SHARED COMPONENTS (consume tokens only)
Shell (Layer A): `GovernmentHeader`, `DepartmentBranding`, `PrimaryNavigation`, `WingNavigation`, `GlobalFooter`, `PrimaryButton`.
Entity (Layer B): `RoadClassificationLabel`, `OfficialDesignationLabel`, `DepartmentIdentity`, `ProjectCategoryLabel`.
Status/provenance (C, D): `OperationalStatusBadge`, `DataProvenanceBadge`.
Composite: `ProjectSummaryCard`, `OfficialProfileCard`, `ApprovalTimeline`, `EvidencePanel`, `GISLegend`, `ProjectQuickActions`, `ContextualSideDrawer`, `InformationTooltip`, `EmptyState`, `LoadingState`, `ErrorState`.
Refactor existing components to these; do not duplicate.

---

## STAGE 3: ROAD CLASSIFICATION (GIS + labels)
Separate use cases: (1) IRC sign colours, (2) pavement markings, (3) GIS road classification, (4) UI identification. **Do not copy sign colours into GIS or UI.**

Proposed TN-HDOS legend (`PROPOSED DESIGN CONVENTION`, `AWAITING DEPARTMENTAL VALIDATION`; replace if an official legend is found). Class is carried by **weight + dash pattern + label**, colour is secondary and avoids status hues:

| Class | Colour | Line |
|---|---|---|
| National Highway | #111827 | 5px solid |
| Expressway | #111827 | 5px solid + centre white dash |
| State Highway | #4338CA | 4px solid |
| Major District Road | #0E7490 | 3px solid |
| Other District Road | #92400E | 2.5px dashed |
| Village Road | #6B7280 | 2px dotted |
| Urban / Corporation | #BE185D | 2px dash-dot |
| Bridge / ROB / RUB | n/a | point icon, labelled |

Map rule: **road class = line style; project status = marker (shape + colour + label)**. Never colour a line by status. `GISLegend` explains every displayed category, includes the "PROPOSED legend" tag, and keeps labels readable (halo text). Road class filters and cards reuse the same tokens.

---

## STAGE 4: PROJECT QUICK-REVIEW
Every project card and table row shows `ProjectQuickActions`: Overview, Officials, Approvals, Land, Finance, Contractor, Quality, Field Ops, Legal, Risks, Documents.
Click opens `ContextualSideDrawer` (no page navigation). Drawer shows **only records for the selected project**; verify with a test that a record from Project B never appears in Project A's drawer.

- **Officials:** name, designation, department/wing, project responsibility, jurisdiction, contact (with verification status, source, last verified date), related approvals, other projects, link to full directory profile. Unverified contact: show "Pending Verification", not as confirmed.
- **Approvals:** authority, department, stage, pending duration, SLA, evidence, next action (ApprovalTimeline).
- **Finance:** administrative/technical sanction, budget, expenditure, bills, payments, outstanding.
- **Risks:** finding, severity, evidence, source, impact, responsible authority, action, verification status.
- Others: show scoped records with provenance badges.
Add tooltips to icon-only actions. Keyboard: Esc closes, focus trap, focus returns to trigger.

Official directory model: Project → Officials → Departments → Responsibilities → Approvals → Actions. If the backend lacks the relations, propose the **minimum** model change; do not break existing APIs.

---

## STAGE 5: APPLY ACROSS SCREENS
Executive Smartboard, Minister workspace, Secretary workspace, Project 360°, Projects, Officials directory, Departments and wings, CKICP, TNRSP-II, Land and Utility, Finance, Contractors, Quality, Field Operations, Assets, Digital Office, Citizen Services, Leakage, Reports, Compliance, Governance, Ask AI, Admin.

Accessibility and UX: WCAG 2.1 AA minimum (target GIGW 3.0 expectations); contrast tested; keyboard navigation; visible focus; labels with colours; confirmation dialogs for destructive actions; responsive desktop + tablet; consistent typography/spacing; predictable heading/filter positions; no excessive gradients/shadows/animation; no oversized cards. Support Tamil + English text rendering and expansion (Tamil text is longer; test layouts).

---

## STAGE 6: VERIFICATION (mandatory; no completion claims from code generation alone)
1. `grep -rE '#[0-9A-Fa-f]{3,8}\b' frontend/src --include=*.{ts,tsx,css} | grep -v design/tokens` returns nothing. Also scan for `rgb(`/`hsl(`/Tailwind arbitrary colour values.
2. **Token uniqueness test:** script fails if two tokens in different semantic groups share a hex value.
3. **Contrast test:** automated check of every fg/bg and solid/surface pair (text ≥ 4.5:1, graphics ≥ 3:1). Run axe-core on all screens.
4. **Layer separation:** Layer A tokens not referenced in data components; Layer C/D tokens not referenced in shell.
5. **Colour-blind check:** screenshots under protanopia/deuteranopia simulation; each status still distinguishable by icon + label.
6. Playwright: quick-action drawers open, scoped to project, keyboard-operable.
7. Existing routes and API contract tests still pass; zero console errors; tablet + desktop screenshots.

---

## STAGE 7: DOCUMENTATION DELIVERABLES
- `docs/design/TN_HDOS_DESIGN_SYSTEM.md`
- `docs/design/TN_HDOS_COLOUR_STANDARD.md`: for **each** convention: purpose, source/justification, OFFICIAL vs PROPOSED, where used, who must validate.
- `docs/design/TN_HDOS_HIGHWAYS_WING_VALIDATION.md`: checklist for Department leadership, Planning and Design, Construction & Maintenance, National Highways, NABARD & Rural Roads, Projects and Metro, TNRSP, Quality Assurance & Research, IT Cell, Finance, Land and legal coordination. Separate: verified standards / proposed decisions / awaiting confirmation / approvals actually received (default: none).
- `docs/design/TN_HDOS_UX_AUDIT.md`

## FINAL REPORT (exact format)
| Feature | Status | Evidence |
|---|---|---|
| Official branding identified | OFFICIAL SOURCE VERIFIED / NOT VERIFIED | Source URL + date |
| Layer A shell tokens | IMPLEMENTED / NOT IMPLEMENTED | File |
| Layer B entity identification (neutral) | IMPLEMENTED / NOT IMPLEMENTED | Screens |
| Layer C status tokens | IMPLEMENTED / NOT IMPLEMENTED | File + contrast report |
| Layer D provenance badges | IMPLEMENTED / NOT IMPLEMENTED | Screens |
| Road legend (proposed) | PROPOSED / AWAITING DEPARTMENTAL VALIDATION | Map |
| Layer separation + token uniqueness | IMPLEMENTED / NOT IMPLEMENTED | Test output |
| Quick actions + scoped drawers | IMPLEMENTED / NOT IMPLEMENTED | Tests |
| Official-project mapping | IMPLEMENTED / PARTIAL | API/model |
| Accessibility + responsive | IMPLEMENTED / PARTIAL | axe report, screenshots |
| Departmental approval | NONE RECEIVED (unless documented) | n/a |

Priority order: government identity → engineering accuracy → consistency → accessibility → quick operational review.

## START
Stage 0 only. Report findings and open questions (max 5). No code.