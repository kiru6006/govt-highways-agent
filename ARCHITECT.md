# TN-HDOS MASTER IMPLEMENTATION
## Phase 0 and Phase 1: Existing Project Assessment and Enterprise Platform Foundation

Act as a Principal Enterprise Architect, Senior Full-Stack Engineer, AI Platform Architect, Database Architect and Security Engineer.

Your task is to build the foundation of **TN-HDOS (Tamil Nadu Highways Digital Operating System)**.

This is a complete departmental digital operating platform for the Tamil Nadu Highways Department. It must eventually connect projects, roads, bridges, engineers, contractors, consultants, other government departments, finance, procurement, legal cases, approvals, field operations and citizen issues.

Do not build this as a collection of disconnected dashboards.

Build a modular, secure, data-driven application with a common platform foundation.

## 1. Primary objective

Establish a production-oriented foundation that supports:

- Multiple functional dashboards.
- Role-based and jurisdiction-based access.
- Project 360° views.
- Official and contractor directories.
- Interdepartmental coordination.
- Connected project records and dependencies.
- Financial and operational intelligence.
- Evidence-based AI assistance.
- Workflow and accountability tracking.
- Complete audit history.

The system must be expandable without repeatedly redesigning the architecture.

## 2. Phase 0: Inspect the existing project

Before modifying code:

1. Inspect the complete repository structure.
2. Identify the existing frontend and backend frameworks.
3. Inspect package dependencies and configuration.
4. Identify existing screens, components, routes and APIs.
5. Inspect database schemas, migrations and seed data.
6. Identify existing authentication and permission mechanisms.
7. Identify reusable components and existing business logic.
8. Identify incomplete, duplicated or problematic implementations.
9. Identify security risks and architectural weaknesses.
10. Determine what can be reused, improved or replaced.

Produce:

- Existing architecture summary.
- Repository structure.
- Technology stack assessment.
- Existing feature inventory.
- Technical debt report.
- Security assessment.
- Proposed target architecture.
- Implementation plan.

Do not delete or rewrite working features without justification.

If the repository is empty, establish the project from scratch using the recommended architecture below.

## 3. Target technology stack

Preferred frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod
- ECharts or Recharts
- MapLibre for future geospatial capabilities

Preferred backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

Database:
- PostgreSQL
- PostGIS for geospatial data
- pgvector or an equivalent vector search solution when required later

Infrastructure:
- Docker
- Environment-based configuration
- Structured logging
- API documentation
- Automated testing
- CI/CD-ready structure

Architecture preference:
- Modular monolith initially.
- Clear separation of business domains.
- API-first development.
- Avoid premature microservices.

If the existing project already uses a suitable technology, retain it unless there is a strong technical reason to change it.

## 4. Phase 1: Build the common application shell

Implement a professional government enterprise application interface.

Application name:

TN-HDOS
Tamil Nadu Highways Digital Operating System

Create:

### A. Global header
- Application logo and name.
- Current module name.
- Global search.
- Notifications.
- User profile.
- Role and jurisdiction display.
- Help and settings.

### B. Sidebar navigation

Create navigation groups for:

1. Executive Command Centre
2. Leakage Intelligence
3. Project Management
4. Project 360°
5. People & Contact Directory
6. Department Connections
7. Engineering Quality
8. Finance & Procurement
9. Contractor Intelligence
10. Field Operations
11. Road & Bridge Assets
12. Digital Office
13. Land & Utility Coordination
14. Legal, Audit & Compliance
15. Citizen Services
16. Reports and Analytics
17. Administration

Use a consistent layout and reusable navigation components.

Do not implement all module functionality in this phase. Establish the routes, navigation structure and appropriate placeholder pages.

### C. Persistent Ask AI interface

Ask AI must be accessible from every dashboard.

Implement the initial interface with:

- Floating Ask AI entry point.
- Expandable side panel or chat panel.
- Current screen context.
- Selected project or record context.
- Question input.
- Suggested questions.
- Conversation history within the current session.
- Source/evidence display area.
- Clear distinction between demo responses and verified information.

Initially use clearly labelled demo responses or a disabled integration state.

Do not pretend that the AI is connected to government databases.

The architecture must support future integration with RAG, LangGraph, authorised data retrieval, structured tools and specialist agents.

### D. Responsive interface

Support:
- Desktop.
- Laptop.
- Tablet.

Prioritise desktop operational use while keeping the interface usable on smaller screens.

## 5. Identity and Role-Based Access Control

Design RBAC and jurisdiction-aware access from the beginning.

Initial role catalogue:

- Minister / Government Leadership
- Principal Secretary
- Secretary
- Chief Engineer
- Zonal Chief Engineer
- Superintending Engineer
- Divisional Engineer / Executive Engineer
- Assistant Divisional Engineer
- Junior Engineer / Field Engineer
- Finance Officer
- Procurement Officer
- Quality Control Engineer
- Legal Officer
- Internal Audit Officer
- Contractor
- Consultant
- Citizen
- System Administrator

Implement a permission model that considers:

1. Role.
2. Department.
3. Zone.
4. Circle.
5. Division.
6. Project assignment.
7. Record sensitivity.
8. Permitted action.

Supported actions should include:

- View.
- Create.
- Edit.
- Submit.
- Review.
- Recommend.
- Approve.
- Authorise.
- Close.
- Export.

Do not assume that all users with the same designation have identical permissions. Permissions must be configurable and subject to approved government delegation and service rules.

Create test cases to prove that one user cannot access another user's restricted projects or financial information.

Contractors must only access their own authorised contracts, submissions and assigned actions.

## 6. Core data model

Create a scalable relational model.

Establish the initial entities:

- User
- Role
- Permission
- Department
- Organisation
- Zone
- Circle
- Division
- Subdivision
- Project
- Road
- Bridge
- WorkPackage
- Contract
- Contractor
- Consultant
- Official
- ProjectStakeholder
- StakeholderResponsibility
- DepartmentDependency
- Approval
- Issue
- Document
- EvidenceRecord
- WorkflowTask
- Notification
- AuditEvent

Relationships must support:

- One project involving multiple departments.
- One project having multiple contractors and consultants.
- One contractor working on multiple projects.
- One official handling multiple projects.
- One approval depending on another approval.
- One issue involving several departments.
- One legal case affecting a project, road, land parcel or work package.
- One road containing multiple work packages and maintenance contracts.
- Officials being transferred without losing historical accountability records.

Use proper foreign keys, indexes, validation, timestamps and status fields.

Do not store important relationships only as unstructured text or JSON.

For historical responsibility, retain the period during which an official or organisation was associated with a project.

## 7. Common workflow foundation

Implement a reusable workflow model.

Every actionable issue should support:

- Unique reference number.
- Category.
- Description.
- Linked project.
- Linked department.
- Responsible person or organisation.
- Source evidence.
- Priority.
- Status.
- Assigned date.
- Target resolution date.
- Escalation status.
- Resolution notes.
- Closure evidence.

Initial statuses:

- New
- Under Review
- Assigned
- Action in Progress
- Awaiting External Department
- Awaiting Evidence
- Resolved
- Closed
- Reopened

Keep workflow configuration separate from individual dashboard components.

Do not automatically approve or close official work based on AI output.

## 8. Evidence and audit foundation

Create a reusable audit mechanism.

Record important actions:

- Login and access events where appropriate.
- Record creation.
- Record modification.
- Submission.
- Review.
- Approval.
- Assignment.
- Status changes.
- Evidence upload.
- Export.
- Closure.

Store actor, timestamp, action, record reference and relevant change information.

Protect audit records from ordinary user modification.

Implement document metadata and secure document references. Add file validation, access checks and safe upload handling.

## 9. Initial dashboard landing page

Build a working initial landing page with:

- Welcome and role context.
- Dashboard module navigation.
- High-level KPI placeholders.
- Recently accessed projects.
- My pending tasks.
- Critical alerts.
- Department coordination alerts.
- Persistent Ask AI.
- Recent activity.

All sample values must be explicitly marked as DEMO DATA.

Do not present fictional project names, official identities, contact numbers, financial figures or government approvals as real.

## 10. API foundation

Create versioned APIs.

Suggested initial route groups:

- /api/v1/auth
- /api/v1/users
- /api/v1/roles
- /api/v1/permissions
- /api/v1/departments
- /api/v1/organisations
- /api/v1/projects
- /api/v1/officials
- /api/v1/contractors
- /api/v1/stakeholders
- /api/v1/dependencies
- /api/v1/issues
- /api/v1/workflows
- /api/v1/documents
- /api/v1/audit

Implement request validation, consistent error responses, pagination and access-control enforcement.

## 11. Security requirements

Implement:

- Secure authentication.
- Password hashing where local authentication is used.
- Secure session/token handling.
- Server-side permission enforcement.
- Input validation.
- Secure file handling.
- Secrets through environment configuration.
- CORS restrictions.
- Rate limiting where appropriate.
- Audit logging.
- Protection against insecure direct object references.
- Tests for cross-project and cross-role data access.

Never rely only on frontend navigation to enforce permissions.

Do not expose sensitive records through unprotected APIs.

## 12. Testing requirements

Create:

- Frontend component tests.
- Backend unit tests.
- API integration tests.
- Database migration tests.
- RBAC tests.
- Cross-jurisdiction access tests.
- Workflow tests.
- Basic end-to-end navigation tests.

Test both allowed and denied access.

## 13. Development execution rules

Follow this sequence:

1. Inspect the repository.
2. Document the existing architecture.
3. Propose the implementation structure.
4. Implement the common application shell.
5. Implement the database foundation.
6. Implement authentication and RBAC.
7. Implement core APIs.
8. Implement shared workflow and audit services.
9. Connect the frontend to backend APIs.
10. Add demo seed data.
11. Run migrations.
12. Run tests.
13. Start the application.
14. Verify the major user journeys.
15. Fix errors before declaring completion.

Work in small, logically grouped changes.

Do not create empty placeholder components pretending to be completed functionality.

Do not hardcode business records in frontend components when they belong in the database.

Use reusable components and typed API contracts.

Maintain a clear README and environment setup instructions.

Maintain an architecture decision record for major technical decisions.

## 14. Required deliverables

At the end of this phase, provide:

1. Repository assessment report.
2. Target architecture document.
3. Updated project structure.
4. Working application shell.
5. Navigation and placeholder routes.
6. Persistent Ask AI interface.
7. Database schema and migrations.
8. Authentication and RBAC foundation.
9. Core API endpoints.
10. Workflow foundation.
11. Audit foundation.
12. Demo seed data.
13. Automated tests and results.
14. Local execution instructions.
15. Known limitations and next-phase recommendations.

## 15. Acceptance criteria

The phase is complete only when:

- The application starts successfully.
- A user can authenticate using the implemented development authentication method.
- Navigation works.
- The interface displays the correct user role and jurisdiction.
- Restricted routes and APIs deny unauthorised access.
- Core database migrations execute successfully.
- Project, official, contractor and department relationships can be represented.
- Ask AI is accessible from every screen.
- Workflow tasks can be created and assigned.
- Important changes are recorded in the audit history.
- Demo data is clearly distinguished from real data.
- Tests pass or remaining failures are documented with reasons.

## 16. Final instruction

Do not build all TN-HDOS dashboards now.

Complete Phase 0 and Phase 1 properly. Preserve existing working functionality. Prioritise maintainability, security, clear data relationships and a reliable foundation.

After implementation, show:

- What you inspected.
- What you changed.
- What works.
- What tests passed.
- What remains incomplete.
- Any architectural risks.
- The exact command to run the application.
- The recommended next implementation phase.

Do not claim completion without running the application and verifying the acceptance criteria.

