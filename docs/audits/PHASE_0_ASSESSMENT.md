# Phase 0 Assessment Report: Tamil Nadu Highways Digital Operating System (TN-HDOS)

**Document Code**: TN-HDOS-P0-REPORT-2026  
**Department**: Tamil Nadu Highways and Minor Ports Department  
**Assessment Date**: November 2026  
**Status**: Completed  

---

## 1. Executive Summary

TN-HDOS (Tamil Nadu Highways Digital Operating System) is designed to serve as the single source of operational, statutory, technical, and financial truth for the Tamil Nadu Highways Department. Prior to implementation, an assessment was conducted per Section 2 of `ARCHITECT.md`.

---

## 2. Repository & Existing Codebase Inventory

| Parameter | Finding |
| :--- | :--- |
| **Initial Repository State** | Clean repository containing architectural directives: `ARCHITECT.md` (Master Implementation Guide) and `DESIGN.md` (Highway Department Color Specification). |
| **Existing Frontend** | None prior to Phase 0. |
| **Existing Backend** | None prior to Phase 0. |
| **Existing Database / Seed** | None prior to Phase 0. |
| **Working Code Justification** | No legacy code required deprecation or deletion; architecture established greenfield from the recommended target specification. |

---

## 3. Technology Stack Assessment & Selection

In strict compliance with Section 3 of `ARCHITECT.md`:

| Tier | Selected Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + TypeScript + Vite** | Fast compilation, strong type-safety for departmental entities, and component modularity. |
| **Styling & Design Tokens** | **Tailwind CSS + DESIGN.md Tokens** | Native mapping of State Highways (`#006A4E`), National Highways (`#FFCC00`), MDR (`#004B87`), ODR (`#D1197E`), and Rural Roads (`#FF6600`). |
| **Backend API** | **Python 3 + FastAPI** | Asynchronous capability, Pydantic data validation, OpenAPI interactive documentation (`/api/docs`), high performance. |
| **ORM & Relational Modeling** | **SQLAlchemy 2.0 Core & ORM** | Clean declarative models supporting complex foreign keys, tenure dates, and cross-departmental dependencies. |
| **Database Engine** | **SQLite (Dev) / PostgreSQL + PostGIS (Prod)** | Zero-dependency immediate startup for evaluation, with pluggable connection string for production PostGIS. |
| **Security & Auth** | **JWT (Bearer) + Bcrypt** | Cryptographic token handling, password hashing, and server-side RBAC + jurisdiction filter checks. |
| **Testing** | **Pytest + TestClient** | Automated integration and regression test harness covering login, RBAC denial, contractor isolation, and workflow audit logs. |

---

## 4. Security & Risk Assessment

1. **Contractor Data Leakage (IDOR Risk)**:
   - *Risk*: A contractor accessing another contractor's proprietary bills, drawings, or liquidated damages.
   - *Mitigation*: Implemented server-side filter `check_project_jurisdiction` in `app/auth.py`. Tested and proved that Contractor L&T receives HTTP 403 Forbidden when requesting Contractor PST's project.
2. **Jurisdiction Boundary Violation**:
   - *Risk*: Circle or Division officers approving projects outside their geographical remit.
   - *Mitigation*: Multi-tier jurisdiction model: State Level (Minister/CE), Zone Level (Zonal CE), Circle Level (SE), and Division Level (EE/ADE/JE).
3. **Audit Tampering**:
   - *Risk*: Disputed changes to project estimates or status closures.
   - *Mitigation*: Immutable `AuditEvent` records stored with actor, timestamp, action, entity reference, diff changes, and client IP.

