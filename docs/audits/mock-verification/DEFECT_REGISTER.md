# TN-HDOS Defect Register & Resolution Log

## 1. Overview
This register records all defects, anomalies, and usability bugs identified during the **Mock Government Verification Exercise** of the **Tamil Nadu Highways Digital Operating System (TN-HDOS)** across its 30 persona tests, 23 routes, financial ledgers, and responsive viewports.

---

## 2. Summary Statistics

| Severity | Total Identified | Remediated | Pending | Remediation Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Critical (P0)** | 2 | 2 | 0 | 100% |
| **High (P1)** | 3 | 3 | 0 | 100% |
| **Medium (P2)** | 3 | 3 | 0 | 100% |
| **Low (P3)** | 2 | 2 | 0 | 100% |
| **Total** | **10** | **10** | **0** | **100%** |

---

## 3. Detailed Defect Register

### DEF-001 [CRITICAL]: Mobile Header Wrapping & Title Cut-off
- **Component / Route**: `frontend/src/components/Header.tsx` (Global)
- **Reported By**: Mobile Persona Verification (P01 Minister Mobile Inspection)
- **Description**: On viewports $< 768\text{px}$, brand icon, title, subtitle, live badges, theme switcher, and persona selector wrapped onto two separate lines, squishing content and breaking vertical scroll offsets.
- **Root Cause**: Flex container lacked `flex-nowrap min-w-0 overflow-hidden` and lacked responsive breakpoint visibility flags on long textual labels.
- **Fix Applied**: Refactored `Header.tsx` to fixed `h-16`, flex-nowrap layout with adaptive hiding (`hidden md:block` on subtitle, `hidden sm:inline-flex` on live badge, icon-only theme button on `< md`, avatar-only persona pill on `< sm`).
- **Status**: **RESOLVED & VERIFIED**.

### DEF-002 [CRITICAL]: Desktop Sidebar Compressing Main Content on Mobile
- **Component / Route**: `frontend/src/components/Sidebar.tsx` & `App.tsx`
- **Reported By**: Mobile UX Auditor
- **Description**: Sidebar remained in standard flex flow on viewports $< 768\text{px}$, compressing dashboard body to $< 120\text{px}$ width.
- **Root Cause**: Sidebar lacked off-canvas fixed drawer styling for mobile breakpoints.
- **Fix Applied**: Updated `Sidebar.tsx` to render as `fixed inset-y-0 left-0 z-50 w-72` on mobile with a dark backdrop overlay (`bg-slate-900/60 z-40 md:hidden`). Added auto-dismiss on route click.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-003 [HIGH]: 16 KPI Metric Overflow on Mobile Breakpoints
- **Component / Route**: `frontend/src/pages/Dashboard.tsx`
- **Reported By**: UX Auditor
- **Description**: 16 KPI cards forced wide horizontal scroll on mobile screens or overlapped values.
- **Root Cause**: Fixed grid column configuration with large padding and static typography.
- **Fix Applied**: Implemented adaptive CSS Grid `grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 md:gap-3` with responsive typography `text-sm sm:text-base md:text-lg`.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-004 [HIGH]: Wide Tables Breaking Small Viewports ($360\text{px}$)
- **Component / Route**: `frontend/src/pages/Dashboard.tsx` (Interdepartmental & Benchmarking Tabs)
- **Reported By**: Senior UX Designer / Frontend Architect
- **Description**: Complex data tables with 8+ columns caused broken layouts on mobile viewports.
- **Root Cause**: Single desktop-centric table implementation used for all screen sizes.
- **Fix Applied**: Implemented dual presentation pattern: compact, touch-friendly cards on mobile (`block md:hidden`) and full data tables on desktop (`hidden md:block`).
- **Status**: **RESOLVED & VERIFIED**.

### DEF-005 [HIGH]: Filter Bar Causing Screen Real-Estate Exhaustion
- **Component / Route**: `frontend/src/pages/Dashboard.tsx`
- **Reported By**: Executive User Feedback (P02 ACS Highways)
- **Description**: Filter bar consumed over 40% of the mobile vertical viewport above the fold.
- **Root Cause**: Static horizontal flex wrapping of 6 multi-select dropdowns.
- **Fix Applied**: Added collapsible accordion toggle with active filter count badge on mobile viewports.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-006 [MEDIUM]: Missing Persona Jurisdiction Metadata in Seed Database
- **Component / Route**: `backend/app/seed_mock_personas.py`
- **Reported By**: Automated Verification Suite
- **Description**: Division-level personas lacked explicit geographic polygon and wing bindings in DB attributes.
- **Root Cause**: Initial seed script created basic role assignments without granular jurisdiction records.
- **Fix Applied**: Updated seed logic to inject exact wing, circle, division, and sub-division tags into user profile metadata.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-007 [MEDIUM]: Financial Ledger Double-Count Risk in Dashboard Summary
- **Component / Route**: `backend/app/routers/executive.py`
- **Reported By**: Financial Engineering Auditor
- **Description**: Initial query draft aggregated `verified_recovery` alongside `actual_expenditure`, causing potential double-counting.
- **Root Cause**: Query lacked ledger domain separation.
- **Fix Applied**: Enforced strict four-ledger domain separation in SQL aggregations with distinct response keys.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-008 [MEDIUM]: Quality Risk Anomaly Lacked Primary Lab Report Link
- **Component / Route**: `frontend/src/pages/Quality.tsx`
- **Reported By**: AI Governance Auditor
- **Description**: AI quality risk cards displayed risk score without clickable link to the originating lab report.
- **Root Cause**: Frontend schema missing `lab_report_ref` property mapping.
- **Fix Applied**: Added `lab_report_ref` and `mbook_ref` link badges to anomaly items.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-009 [LOW]: Missing Tooltip on High-Density Status Chips
- **Component / Route**: `frontend/src/components/Header.tsx`
- **Reported By**: Senior Frontend Architect
- **Description**: Truncated role and department badges lacked native browser tooltips on hover.
- **Root Cause**: Omission of `title` attribute on compact pill spans.
- **Fix Applied**: Added dynamic `title` attributes with full textual strings across all compact indicators.
- **Status**: **RESOLVED & VERIFIED**.

### DEF-010 [LOW]: Contrast Ratio on Muted Timestamps
- **Component / Route**: `frontend/src/pages/DigitalOffice.tsx`
- **Reported By**: Accessibility Auditor (WCAG 2.1 AA)
- **Description**: Light gray timestamp text (`text-slate-400`) on white cards scored $3.9:1$ contrast ratio.
- **Root Cause**: Sub-optimal Tailwind color class selection.
- **Fix Applied**: Replaced `text-slate-400` with `text-slate-500` ($4.8:1$ contrast ratio, passing WCAG AA).
- **Status**: **RESOLVED & VERIFIED**.
