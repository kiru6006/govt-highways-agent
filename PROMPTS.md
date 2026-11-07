# PHASE 17: INDEPENDENT EVIDENCE & PRODUCTION READINESS AUDIT

## 1. Objective

Conduct an independent, evidence-based audit of the existing TN-HDOS application.

The objective is not to add more features. It is to determine whether the existing implementation is functionally correct, supported by reliable government data, secure, auditable, and ready for controlled deployment.

**Primary rule: Do not mark any capability as complete merely because a page, API, database model, or placeholder exists. Verify the complete working flow.**

## 2. Mandatory execution rules

1. Inspect the complete existing repository before modifying anything.
2. Read README.md, architecture documents, implementation plans, database models, API routes, frontend routes, tests, and deployment configuration.
3. Preserve existing working functionality.
4. Do not replace existing implementations with simplified alternatives.
5. Do not delete existing data, migrations, modules, or routes.
6. Do not invent government records, official relationships, project details, or legal case information.
7. Do not silently change existing business rules.
8. Record every identified issue with its severity and evidence.
9. Use existing architecture and coding standards unless a documented defect requires a change.
10. Implement only corrections that are safe, necessary, and supported by evidence.

## 3. Audit Area A: Government Data Evidence Verification

Audit every government-related record currently stored in the database.

Cover:

- CKICP programmes, projects and packages.
- TNRSP-II programmes, projects and packages.
- Tender notices and tender packages.
- Contractors and consultants.
- Project directors and departmental officials.
- Land acquisition records and compensation.
- Government approvals and statutory permissions.
- High Court cases and legal stays.
- Project milestones and completion dates.
- Financial allocations, expenditure and payments.
- GIS alignments and project locations.

For every record, verify:

- Original source URL.
- Official document name and reference number.
- Publication date.
- Document retrieval date.
- Relevant page number or section.
- Extraction method.
- Verification status.
- Last verification date.
- Responsible verification authority, where known.

Use these data statuses consistently:

| Status | Meaning |
|---|---|
| Officially Verified | Confirmed against an authoritative government source |
| Extracted | Extracted from an official source but not independently verified |
| Seeded Demo | Artificial or illustrative development data |
| Pending Verification | Source or record requires validation |
| Conflicting | Multiple sources contain inconsistent information |
| Outdated | Previously valid information requiring refresh |
| Rejected | Incorrect or unsupported information |

**Critical checks:**

- Verify the reported CKICP footprint of 206.29 hectares.
- Verify the reported High Court case WP No. 11420/2024 and its actual relevance to the project.
- Verify the reported contractors Ramalingam, BSCPL, NCC and Transstroy against original tender or contract records.
- Verify the reported Project Director Thiru D. Baskara Pandian, IAS, including the applicable period of appointment.
- Verify the reported 42 HT pole shifting blocker attributed to TANGEDCO.
- Verify the reported Walajabad land acquisition award stay.
- Verify the GIS lengths of CKICP 654.8 km and TNRSP-II 577.0 km.

Do not assume these claims are correct because they exist in the database or README.

If a claim cannot be verified, retain it only with the appropriate status and clearly explain the missing evidence.

## 4. Audit Area B: Database Integrity

Inspect:

- SQLAlchemy models.
- Database migrations.
- Primary and foreign keys.
- Unique constraints.
- Relationships.
- Cascading deletion rules.
- Duplicate detection.
- Required field validation.
- Historical record preservation.
- Data provenance.
- Audit logging.

Verify that the following entities are correctly separated:

Programme → Project → Package → Tender → Contract → Contractor.

Do not merge these concepts into a single project table.

Check whether officials, organisations, departments, contractors and consultants can be linked to multiple projects with valid effective dates.

Verify that land parcels, legal cases, approvals, payments and milestones are linked to the correct project or package.

Implement missing constraints only after checking existing data and migration safety.

## 5. Audit Area C: API and Backend Verification

For every implemented API:

- Confirm the endpoint exists.
- Confirm the correct database query is executed.
- Validate request and response schemas.
- Verify pagination and filtering.
- Verify sorting.
- Verify error handling.
- Verify authentication.
- Verify backend-enforced RBAC.
- Verify audit logging.
- Verify input validation.
- Verify that sensitive data is not exposed.

Test whether the frontend displays actual API results rather than hardcoded sample data.

Identify mock APIs, static JSON, placeholder responses and incomplete integrations.

Do not label an API operational if it returns hardcoded data.

## 6. Audit Area D: Frontend and Role-Based Workspaces

Inspect all existing routes:

Operational routes:
- /
- /leadership/minister
- /leadership/secretary
- /ckicp
- /tnrsp
- /project-360
- /projects
- /directory
- /compliance
- /governance

Reported placeholder routes:
- /departments
- /finance
- /quality
- /contractors
- /field-ops
- /assets
- /digital-office
- /citizen-services
- /leakage

For each route, classify it as:

1. Fully functional.
2. Partially functional.
3. Read-only.
4. Placeholder.
5. Broken.
6. Not implemented.

Verify these user workspaces:

**Minister Workspace**
- State-level infrastructure overview.
- Programme progress.
- Major project delays.
- Budget and expenditure.
- High-risk projects.
- Interdepartmental bottlenecks.
- Decisions pending.
- Critical legal and public issues.

**Secretary Workspace**
- Department-wide project monitoring.
- Chief Engineer and field officer accountability.
- Approval pendency.
- Contractor performance.
- Financial progress.
- Project-level escalations.
- Legal and compliance issues.
- Action tracking.

Verify that both workspaces use real, traceable data and that access is controlled by backend permissions.

## 7. Audit Area E: KPI and Calculation Accuracy

Identify every KPI, score, percentage, financial metric and risk indicator.

For each metric, document:

- Business definition.
- Calculation formula.
- Source database tables.
- Required fields.
- Reporting period.
- Missing-data handling.
- Validation method.
- Responsible business owner.

Pay special attention to:

- Physical progress.
- Financial progress.
- Project completion percentage.
- Cost escalation.
- Time overruns.
- Earned Value Management.
- CPI and SPI.
- Land acquisition progress.
- Contractor performance.
- Approval delays.
- Payment pendency.

Do not display a percentage when the underlying data is insufficient.

Distinguish actual values, calculated values, estimates and forecasts.

## 8. Audit Area F: AI and Leakage Detection

Audit Ask AI, RAG, AI diagnostics and leakage detection.

Verify:

- Document ingestion.
- OCR extraction.
- Chunking and metadata.
- Embeddings.
- Retrieval quality.
- Source citations.
- Answer grounding.
- Hallucination controls.
- Confidence scoring.
- Human validation.
- Audit history.

Every AI finding must contain:

- Finding ID.
- Related programme.
- Project and package.
- Finding description.
- Source evidence.
- Source document and page.
- Financial or operational impact, if established.
- Severity.
- Confidence.
- Recommended action.
- Responsible authority, if established.
- Verification status.

Separate facts, calculations, inferences and predictions.

**Important:** An anomaly is not proof of corruption, fraud or misconduct. Use neutral language such as potential irregularity, unexplained variance, duplicate payment indicator or procurement anomaly until independently verified.

## 9. Audit Area G: Security and Governance

Verify:

- Authentication and session management.
- Role-based access control.
- API-level authorization.
- Department and jurisdiction restrictions.
- Data exposure risks.
- Password and secret management.
- CORS configuration.
- SQL injection protection.
- XSS protection.
- File upload validation.
- Audit logs.
- Sensitive document access.
- Data retention.
- Backup and recovery.

Test whether a user can bypass frontend permissions by calling APIs directly.

Check that Minister, Secretary, Engineer, Project Director, Finance Officer, Legal Officer, Contractor and Auditor roles have appropriate permissions.

Do not assume that hiding a frontend button provides security.

## 10. Audit Area H: Integrations and Deployment

Inspect:

- IFMS integration.
- GIS integration.
- Government document sources.
- Email and notification workflows.
- External department integrations.
- GitHub Actions.
- GitHub Pages deployment.
- Docker configuration.
- Environment variables.
- Offline fallback.
- Database backup and recovery.

Classify every integration as:

- Live and verified.
- Configured but not connected.
- Mock implementation.
- Planned.
- Failed.

Check whether GitHub Pages static deployment is compatible with the application's actual authentication, backend APIs and database requirements.

Do not claim that the complete application is deployed merely because the frontend builds successfully.

## 11. Audit Area I: Test Strategy

Execute the existing test suite and identify missing coverage.

Add or improve tests for:

1. Database integrity.
2. Government source-to-database reconciliation.
3. API integration.
4. Authentication and RBAC.
5. Minister workspace.
6. Secretary workspace.
7. Project 360.
8. CKICP intelligence.
9. TNRSP-II intelligence.
10. Financial calculations.
11. Legal and land acquisition relationships.
12. AI evidence and citation validation.
13. Audit logs.
14. Frontend navigation.
15. Deployment configuration.

Include negative tests:

- Unverified data must not appear as verified.
- Unauthorized users must not access restricted APIs.
- Missing evidence must not generate an official finding.
- Conflicting sources must not be silently merged.
- Duplicate payments must be flagged as indicators, not automatically classified as fraud.
- Invalid project relationships must be rejected.

Report actual test execution results. Do not fabricate passing results.

## 12. Audit Area J: README and Architecture Documentation

Update README.md to reflect the actual implementation.

Correct:

- Phase numbering and scope.
- Completion percentages.
- API inventory.
- Database model inventory.
- Route inventory.
- Integration status.
- Test results.
- Deployment status.
- Known limitations.
- Outstanding government data verification.

Every completion claim must have supporting code references or test evidence.

Keep the distinction between:

- Implemented.
- Tested.
- Verified with official data.
- Deployed.
- Production ready.

These are different states.

## 13. Required Deliverables

Create the following audit documents inside the existing documentation structure. Reuse existing files where appropriate rather than creating duplicate documentation.

1. PHASE_17_AUDIT_REPORT.md
2. GOVERNMENT_DATA_VERIFICATION_REGISTER.md
3. API_AND_ROUTE_AUDIT.md
4. SECURITY_AND_RBAC_AUDIT.md
5. AI_GROUNDING_AND_EVIDENCE_AUDIT.md
6. PRODUCTION_READINESS_CHECKLIST.md
7. PHASE_18_REMEDIATION_PLAN.md

The audit report must include:

| Field | Required information |
|---|---|
| Audit ID | Unique identifier |
| Audit area | Relevant module |
| Finding | Actual issue |
| Severity | Critical / High / Medium / Low |
| Evidence | File, function, API, database record or source |
| Business impact | Why it matters |
| Recommended correction | Specific action |
| Status | Open / Fixed / Blocked / Accepted Risk |
| Test evidence | Actual validation result |

## 14. Severity Classification

**Critical**
- Unauthorized access.
- Incorrect official data presented as verified.
- Material financial or legal misinformation.
- Data loss or corruption.
- Exposed credentials or sensitive records.

**High**
- Broken core workflows.
- Incorrect KPI calculations.
- Missing evidence for important AI findings.
- Major project relationship errors.
- Inadequate backend authorization.

**Medium**
- Incomplete modules.
- Missing validations.
- Weak error handling.
- Incomplete reporting.
- Limited test coverage.

**Low**
- Documentation gaps.
- Minor usability defects.
- Non-critical presentation issues.

## 15. Execution Sequence

Execute in this order:

1. Repository and architecture assessment.
2. Database and data provenance audit.
3. Official source verification.
4. API and backend audit.
5. Frontend and workspace audit.
6. KPI and calculation validation.
7. AI grounding and leakage audit.
8. Security and RBAC audit.
9. Integration and deployment audit.
10. Automated test execution.
11. Documentation updates.
12. Safe correction of confirmed defects.
13. Final production readiness assessment.

Do not begin Phase 18 feature development during this audit.

## 16. Final Acceptance Criteria

Phase 17 can be marked complete only when:

- All existing routes have been classified.
- All implemented APIs have been inspected.
- All critical government data claims have evidence or an explicit unverified status.
- All important KPIs have documented formulas.
- Backend authorization has been tested.
- AI findings have traceable evidence.
- Integrations are classified accurately.
- Tests have actually been executed.
- Critical and High findings are either fixed or explicitly blocked with documented reasons.
- README reflects the actual state.
- No existing working functionality has been broken.

## 17. Final Report Format

At the end, provide:

1. Overall audit result.
2. Actual completion percentage, with calculation method.
3. Number of Critical, High, Medium and Low findings.
4. Government data verification summary.
5. Functional route summary.
6. API verification summary.
7. Security findings.
8. AI accuracy and evidence findings.
9. Test execution results.
10. Deployment readiness.
11. Issues fixed.
12. Issues still open.
13. Phase 18 remediation priorities.

Choose one final status:

- NOT READY: Critical issues remain.
- CONDITIONALLY READY: No unresolved Critical issues, but High-priority issues or operational controls remain.
- READY FOR CONTROLLED PILOT: Core workflows, security, evidence and operational controls are validated for a limited pilot.
- PRODUCTION READY: All required operational, security, data governance, integration, recovery and acceptance controls have been independently validated.

Do not award PRODUCTION READY based only on successful builds, passing unit tests or a completed README.

**Start with assessment only. Present the audit scope, repository findings and proposed correction plan before making code changes. Then execute the audit and safe corrections in controlled steps.**



# PHASE 18: MOCK DATA FOUNDATION AND OPERATIONAL MODULE COMPLETION

## 1. Objective

Continue TN-HDOS development using realistic, internally generated mock data.

The objective is to convert the existing partially implemented and placeholder modules into functional operational modules.

Actual Tamil Nadu Government data will be integrated in a later phase. Development must not depend on its immediate availability.

The application must support two data modes:

1. MOCK mode: Uses synthetic development and testing data.
2. OFFICIAL mode: Uses verified government data when the relevant integrations become available.

For this phase, MOCK mode is the default.

**Important:** Never present mock records as actual government records. Clearly identify all synthetic data throughout the application.

## 2. Mandatory Repository Assessment

Before implementation:

1. Inspect the complete repository.
2. Read README.md and the Phase 17 audit report, if available.
3. Inspect existing database models, API endpoints, frontend routes and components.
4. Identify completed, partially completed and placeholder modules.
5. Identify reusable components and existing business logic.
6. Check existing tests and deployment configuration.
7. Preserve all existing working functionality.

Do not rebuild existing operational modules.

Create an implementation checklist and identify dependencies before modifying code.

## 3. Mock Data Architecture

Implement a reusable mock-data architecture.

### Required architecture

Frontend:
- React.
- TypeScript.
- Existing UI component library.
- Existing routing and state management.

Backend:
- Python.
- FastAPI.
- Existing SQLAlchemy models.
- Existing database infrastructure.

Data layer:
- PostgreSQL-compatible database.
- Existing migrations.
- Seed data management.
- Mock data provider.
- Future official data provider.

### Data provider abstraction

Create a common data provider interface.

Example:

DataProvider
├── ProjectProvider
├── FinanceProvider
├── ContractorProvider
├── DepartmentProvider
├── QualityProvider
├── FieldOperationsProvider
├── AssetProvider
├── LegalProvider
└── CitizenServiceProvider

Implement:

- MockDataProvider
- OfficialDataProvider interface or adapter contract

The application must select the data mode through environment configuration.

Example:

TN_HDOS_DATA_MODE=mock

Do not implement fake government integrations.

When OFFICIAL mode is selected but an integration is not configured, return a clear unavailable or not-integrated status. Never silently fall back to mock data.

### Mock data requirements

Create realistic but synthetic records for:

- 20 projects.
- 40 project packages.
- 15 contractors.
- 30 government officials.
- 10 departments.
- 50 land acquisition parcels.
- 25 approval records.
- 20 legal case records.
- 100 financial transactions.
- 50 project milestones.
- 30 quality inspection records.
- 50 field inspection records.
- 40 infrastructure assets.
- 30 citizen grievances.

These are development targets, not claims about actual government records.

Use consistent IDs and relationships across all modules.

Include realistic scenarios:
- Projects progressing on schedule.
- Delayed projects.
- Land acquisition bottlenecks.
- Pending approvals.
- Contractor underperformance.
- Quality defects.
- Payment delays.
- Legal restrictions.
- Cost variations.
- Citizen complaints.
- Completed projects.

Use fictional names and clearly synthetic reference numbers.

Do not use real officials' names, real contractor identities or fabricated government order numbers in mock records.

### Mock data metadata

Every mock record must include:

- data_mode: mock
- data_status: Seeded Demo
- source_type: synthetic
- generated_at
- scenario_id, where applicable

Expose the active data mode through the backend API.

Display a persistent MOCK DATA indicator in the application whenever mock mode is active.

## 4. Phase 18.1: Departmental Dependencies

Complete the existing /departments module.

Features:

- Department directory.
- Department hierarchy.
- Organisation relationships.
- Department responsibilities.
- Interdepartmental dependencies.
- Approval authorities.
- Pending approvals.
- Responsible officers.
- Escalation workflows.
- Dependency tracking.

Example scenario:

A highway project requires:
1. Land acquisition clearance.
2. Forest Department approval.
3. TANGEDCO electrical utility shifting.
4. Revenue Department coordination.
5. Police traffic diversion approval.
6. Highways Department technical approval.

Display all dependencies against the project.

Identify which approval is blocking project progress.

## 5. Phase 18.2: Finance Intelligence

Complete the /finance module.

Features:

- Project-wise budget.
- Administrative sanction.
- Revised estimates.
- Financial allocation.
- Expenditure.
- Work bills.
- Contractor payments.
- Pending bills.
- Retention amounts.
- Advances.
- Cost variations.
- Budget utilisation.
- Financial progress.

Implement calculation logic for:

Budget Utilisation = Actual Expenditure / Approved Budget × 100

Financial Progress = Actual Expenditure / Revised Project Cost × 100

Clearly distinguish these two metrics.

Provide:
- Project finance overview.
- Programme finance overview.
- Contractor payment history.
- Pending payment analysis.
- Cost escalation indicators.
- Financial variance analysis.

Do not assume IFMS is connected.

## 6. Phase 18.3: Engineering and Quality

Complete the /quality module.

Features:

- Technical inspections.
- Quality inspection records.
- Defect tracking.
- Material testing.
- Laboratory results.
- Non-conformance reports.
- Corrective action requests.
- Reinspection.
- Quality clearance.
- Engineer remarks.
- Supporting documents and photographs.

Workflow:

Inspection → Defect Identification → Corrective Action → Reinspection → Closure.

Create sample quality scenarios:
- Road surface defects.
- Poor drainage.
- Incorrect material specifications.
- Bridge structural inspection observations.
- Delayed defect rectification.

Provide project-wise and contractor-wise quality summaries.

Do not generate actual engineering safety certifications.

## 7. Phase 18.4: Contractor and Tender Intelligence

Complete the /contractors module.

Features:

- Contractor directory.
- Contractor profile.
- Tender history.
- Contract details.
- Awarded packages.
- Contract value.
- Start and completion dates.
- Extension of time.
- Performance history.
- Payment history.
- Quality observations.
- Delays.
- Contract amendments.
- Disputes.
- Penalties, where supported by records.

Implement contractor performance indicators using transparent formulas.

Distinguish:
- Contractual performance facts.
- Calculated performance scores.
- AI-generated risk indicators.

Do not classify a contractor as blacklisted or non-performing without verified supporting records and applicable authority decisions.

## 8. Phase 18.5: Field Operations

Complete the /field-ops module.

Features:

- Field inspection scheduling.
- Site visit records.
- Engineer observations.
- Geo-tagged inspection records.
- Progress photographs.
- Work completion verification.
- Issue reporting.
- Contractor responses.
- Corrective actions.
- Escalations.

Create synthetic field inspection records with clearly identified mock locations.

Support a workflow:

Schedule → Assign → Inspect → Record Findings → Verify → Close.

Prepare the backend and frontend for future mobile integration.

## 9. Phase 18.6: Asset Management

Complete the /assets module.

Track:

- Roads.
- Bridges.
- Culverts.
- Flyovers.
- Road structures.
- Drainage infrastructure.
- Traffic infrastructure.
- Other relevant highway assets.

Each asset should support:

- Asset ID.
- Asset type.
- Associated project.
- Geographic location.
- Installation or completion date.
- Condition.
- Inspection history.
- Maintenance history.
- Responsible authority.
- Maintenance priority.
- Supporting documents.

Provide:
- Asset register.
- Asset condition overview.
- Maintenance schedules.
- Overdue inspections.
- Asset-related risks.

Use synthetic GIS coordinates only.

## 10. Phase 18.7: Digital Office and Workflow

Complete the /digital-office module.

Features:

- Incoming correspondence.
- Outgoing correspondence.
- File movement.
- Document register.
- Internal notes.
- Approval workflows.
- Pending actions.
- Due dates.
- Officer assignments.
- Escalation history.
- Decision tracking.

Implement a configurable workflow engine.

Example:

Junior Engineer → Assistant Engineer → Assistant Executive Engineer → Executive Engineer → Superintending Engineer → Chief Engineer → Secretary.

This is an illustrative workflow only. Actual approval authority and delegation must be configurable and verified before official deployment.

Support:
- Draft.
- Submitted.
- Under Review.
- Clarification Required.
- Approved.
- Rejected.
- Closed.

Maintain a complete audit trail.

## 11. Phase 18.8: Citizen Services

Complete the /citizen-services module.

Features:

- Citizen grievance registration.
- Complaint categorisation.
- Project and road association.
- Location details.
- Photograph attachments.
- Responsible department.
- Assigned officer.
- Status tracking.
- Resolution notes.
- Escalation.
- Citizen feedback.

Sample categories:
- Road damage.
- Potholes.
- Drainage issues.
- Bridge safety observations.
- Encroachment reports.
- Road construction delays.
- Traffic-related infrastructure issues.

Implement:

Registered → Assigned → Under Investigation → Action Taken → Verified → Closed.

Use synthetic citizen identities and contact information. Never use real personal information in seed data.

## 12. Phase 18.9: Leakage and Irregularity Intelligence

Complete the /leakage module.

Build rule-based anomaly detection first.

Required checks:

- Duplicate payment references.
- Duplicate bills.
- Unusual cost variations.
- Milestone and payment mismatches.
- Repeated contract extensions.
- Unusually high pending payments.
- Missing supporting documents.
- Work progress inconsistent with reported expenditure.
- Repeated quality defects.
- Unexplained quantity variations.

For every finding, show:

- Finding ID.
- Project.
- Package.
- Related contractor, where applicable.
- Anomaly category.
- Detection rule.
- Evidence.
- Financial or operational impact.
- Severity.
- Confidence.
- Recommended verification.
- Responsible authority.
- Review status.

Clearly distinguish a detected anomaly from a confirmed irregularity.

Do not generate allegations of corruption or fraud.

## 13. Phase 18.10: Cross-Module Project Intelligence

Connect all completed modules through Project 360.

A project should provide a unified view of:

Project
├── Programme
├── Packages
├── Contractors
├── Officials
├── Departments
├── Approvals
├── Land Acquisition
├── Legal Cases
├── Finance
├── Engineering Quality
├── Field Inspections
├── Assets
├── Digital Office Files
├── Citizen Grievances
└── AI Findings

When a user opens a project, they should be able to navigate between these relationships without searching separately.

Implement cross-module filters and navigation.

Example:

If a bridge project is delayed because of pending electrical utility shifting, Project 360 should display:
- The affected project.
- Related package.
- Responsible department.
- Assigned officer.
- Pending approval.
- Contractor.
- Delay impact.
- Related correspondence.
- Recommended next action.

All example records must be synthetic.

## 14. Phase 18.11: Minister and Secretary Workspace Enhancements

Use the newly completed modules to improve the existing leadership workspaces.

Minister workspace:
- Programme progress.
- Budget utilisation.
- High-risk projects.
- Major bottlenecks.
- Interdepartmental dependencies.
- Critical decisions.
- Citizen issue trends.

Secretary workspace:
- Project execution.
- Approval pendency.
- Department performance.
- Contractor performance.
- Financial progress.
- Engineering quality.
- Legal issues.
- Officer action tracking.

Every KPI must be derived from the database and have a documented formula.

Add filters for programme, district, project, department and reporting period where relevant.

## 15. Phase 18.12: Role-Based Access and Audit

Extend existing RBAC.

Support:
- Minister.
- Secretary.
- Chief Engineer.
- Superintending Engineer.
- Executive Engineer.
- Assistant Executive Engineer.
- Assistant Engineer.
- Project Director.
- Finance Officer.
- Legal Officer.
- Quality Engineer.
- Field Engineer.
- Department Officer.
- Auditor.
- Citizen.
- Contractor.

Implement backend permission checks.

Users must only see and modify data permitted by their role and jurisdiction.

Record important actions in audit logs.

Do not rely on frontend visibility for authorization.

## 16. Phase 18.13: Testing and Quality Gate

Add tests for:

- Mock data generation.
- Database relationships.
- Data provider selection.
- Module APIs.
- Frontend workflows.
- Role permissions.
- Finance calculations.
- Contractor indicators.
- Quality workflows.
- Field inspection workflows.
- Asset maintenance.
- Digital office approvals.
- Citizen grievance workflows.
- Anomaly detection.
- Project 360 cross-module relationships.

Include negative tests.

Verify that:
- Mock records are always labelled as mock.
- Mock records cannot be presented as officially verified.
- Official mode does not silently use mock data.
- Unauthorised users cannot access protected records.
- Invalid project relationships are rejected.
- All financial calculations use the documented formulas.

Run existing tests after each major module.

Do not claim tests passed unless they were executed.

## 17. Phase 18.14: Documentation

Update README.md and existing architecture documentation.

Document:
- New modules.
- Routes.
- APIs.
- Database models.
- Mock data architecture.
- Seed commands.
- Environment configuration.
- Data provider switching.
- RBAC.
- Workflows.
- Test results.
- Known limitations.
- Future official data integration requirements.

Maintain the distinction between:
- Implemented.
- Tested.
- Mock data validated.
- Official data verified.
- Deployed.

## 18. Implementation Strategy

Implement in controlled subphases.

Recommended sequence:

1. Mock data provider and seed architecture.
2. Departmental dependencies.
3. Finance intelligence.
4. Engineering and quality.
5. Contractor and tender intelligence.
6. Field operations.
7. Asset management.
8. Digital office.
9. Citizen services.
10. Leakage intelligence.
11. Project 360 cross-module integration.
12. Minister and Secretary enhancements.
13. RBAC and audit improvements.
14. Regression testing and documentation.

Do not implement all modules in one uncontrolled operation.

For each subphase:

1. Inspect existing code.
2. Define implementation scope.
3. Identify affected files.
4. Implement backend.
5. Implement frontend.
6. Add mock records.
7. Integrate with Project 360.
8. Test functionality.
9. Fix regressions.
10. Update documentation.
11. Report completed work and remaining gaps.

## 19. Final Acceptance Criteria

Phase 18 is complete only when:

- All previously identified placeholder modules have functional workflows.
- Mock data is consistent across modules.
- Mock data is clearly labelled.
- The application supports configurable data providers.
- Official mode never silently falls back to mock data.
- Project 360 connects the relevant operational modules.
- Minister and Secretary workspaces use real database queries against the mock dataset.
- RBAC is enforced by backend APIs.
- Financial calculations are tested.
- Anomaly detection provides traceable evidence.
- All relevant tests have been executed.
- README and architecture documents reflect actual implementation.

## 20. Final Execution Report

At the end of each subphase, report:

1. Features implemented.
2. Backend files changed.
3. Frontend files changed.
4. Database models and migrations changed.
5. APIs added or modified.
6. Mock records created.
7. Routes completed.
8. Tests executed and results.
9. Existing functionality affected.
10. Known issues.
11. Next subphase.

**Start with Phase 18.1 only after completing the mock data architecture assessment. Do not attempt all subphases in one execution. Preserve existing modules and working functionality.**


# TN-HDOS IMPLEMENTATION PROMPT 01
# Complete AI Leakage Intelligence Screen with Realistic Mock Data

## 1. Objective

Complete the existing TN-HDOS `#/leakage` screen.

The current screen is empty, incomplete or only partially implemented. Transform it into a fully functional, Minister-ready AI Leakage and Irregularity Intelligence workspace.

This must be a working application screen, not a static dashboard mockup.

Use realistic synthetic data for demonstration. Do not wait for actual Tamil Nadu Government data.

The screen must demonstrate how TN-HDOS can identify potential financial leakage, project execution irregularities, procurement risks, payment anomalies and administrative bottlenecks.

The most important feature is AI-powered decision support.

## 2. Mandatory Initial Assessment

Before making changes:

1. Inspect the existing repository.
2. Inspect the current `#/leakage` route and its components.
3. Inspect the existing backend APIs and database models.
4. Inspect the current AI/RAG implementation.
5. Inspect the Minister and Secretary workspaces.
6. Inspect the existing Project 360 implementation.
7. Identify reusable charts, tables, filters, layouts and UI components.
8. Identify existing mock data and avoid duplicate seed records.
9. Check existing authentication and RBAC.

Do not rebuild the application.

Do not damage or replace existing working functionality.

Implement only this screen and the shared demo-data foundation needed by subsequent screens.

## 3. Demo Data Foundation

Create or extend a central synthetic dataset.

Use fictional project references, fictional contractors, fictional officers and fictional financial records.

Every record must have:

- data_mode: mock
- data_status: Seeded Demo
- source_type: synthetic
- generated_at
- project_id
- package_id, where applicable
- scenario_id

Never represent synthetic data as verified government information.

Display a persistent "DEMO DATA" indicator on the screen.

Create at least:

- 12 synthetic highway projects.
- 20 synthetic packages.
- 10 fictional contractors.
- 15 fictional officials.
- 30 synthetic financial transactions.
- 15 synthetic payment records.
- 12 synthetic project milestones.
- 10 synthetic quality findings.
- 10 synthetic land or utility dependencies.
- 15 synthetic AI anomaly findings.

Maintain consistent project, package, contractor and officer IDs.

The dataset must be reusable by the next implementation prompts for Reports, Project 360, Quality, Assets, Departments, Land and Utility, Finance, Contractors and Field Operations.

Do not hardcode the same dataset separately in each frontend component.

## 4. Final Screen Design

Design a professional government executive intelligence interface.

Follow the existing TN-HDOS visual identity and design system.

The screen should have the following structure.

### Section A: Screen Header

Title:

AI Leakage & Irregularity Intelligence

Subtitle:

AI-assisted detection of financial, procurement, project execution and governance anomalies across highway infrastructure programmes.

Show:

- DEMO DATA indicator.
- Last analysis timestamp.
- Reporting period.
- Programme filter.
- District filter.
- Project filter.
- Severity filter.
- Finding status filter.
- Refresh analysis action.

### Section B: Executive Risk Summary

Display six prominent KPI cards.

1. Total AI Findings.
2. Critical Findings.
3. High-Risk Findings.
4. Potential Financial Exposure.
5. Findings Awaiting Verification.
6. Corrective Actions Pending.

Use synthetic values that reconcile with the underlying mock dataset.

Each KPI must have:
- Value.
- Short description.
- Trend or comparison, if supported.
- Click-through to the relevant filtered findings.

Do not use arbitrary numbers that do not match the dataset.

### Section C: AI Executive Intelligence

This is the most important section.

Create a prominent AI Intelligence panel.

Title:

AI Executive Assessment

Display a dynamically generated summary from the synthetic findings.

Example demo narrative:

"AI analysis has identified multiple potential execution and financial anomalies across the demonstration dataset. The highest-priority cases involve milestone-payment mismatches, repeated contract extensions, unusual cost variations and delayed land or utility clearances. These findings require verification by the responsible departments before any official conclusion."

Include:

- Overall risk assessment.
- Critical observations.
- Financial exposure estimate.
- Projects requiring immediate attention.
- Recommended executive actions.

Separate:
- Observed facts from mock records.
- Calculated indicators.
- AI-generated interpretations.
- Recommended actions.

AI must not present an unverified anomaly as confirmed fraud or corruption.

### Section D: AI Anomaly Categories

Display an interactive category breakdown.

Categories:

1. Duplicate payment indicators.
2. Milestone and payment mismatches.
3. Unusual cost variations.
4. Repeated contract extensions.
5. Work progress and expenditure mismatches.
6. Missing supporting documents.
7. Unusual quantity variations.
8. Repeated quality defects.
9. Delayed approvals affecting financial progress.
10. Land and utility-related project delays.

Use a chart and a corresponding category list.

Clicking a category must filter the findings table.

### Section E: High-Priority AI Findings

Create a prominent table containing:

- Finding ID.
- Project.
- Package.
- Contractor.
- Anomaly category.
- Financial exposure.
- Severity.
- AI confidence.
- Evidence status.
- Responsible department.
- Review status.
- Action.

Seed realistic scenarios, for example:

Scenario 1:
A payment record appears to have a duplicate reference number.

Scenario 2:
A contractor payment milestone appears ahead of the corresponding physical progress.

Scenario 3:
A project shows repeated cost variations requiring review.

Scenario 4:
A package has multiple contract extensions.

Scenario 5:
A quality defect remains open despite a subsequent completion claim.

Scenario 6:
A payment record lacks the expected supporting documentation.

These are synthetic examples, not claims about actual government projects.

### Section F: Financial Exposure Intelligence

Create a financial exposure analysis section.

Display:

- Potential exposure by project.
- Exposure by anomaly category.
- Exposure by contractor.
- Exposure by programme.
- Month-wise trend.

Distinguish:

- Transaction value.
- Potential exposure.
- Verified financial impact.
- Amount under review.

Do not automatically treat the full value of a flagged transaction as a financial loss.

Use clearly documented formulas.

### Section G: Project Risk Matrix

Create an interactive project risk matrix.

Dimensions:

- Financial risk.
- Schedule risk.
- Procurement risk.
- Quality risk.
- Land and utility risk.
- Compliance risk.

Show the highest-risk projects first.

Selecting a project should open its Project 360 screen using the existing navigation mechanism.

### Section H: AI Finding Detail Panel

When a user selects an AI finding, open a detailed panel or drawer.

Display:

1. Finding reference.
2. Project and package.
3. Contractor.
4. Finding category.
5. What was detected.
6. Why the AI flagged it.
7. Supporting transaction or milestone records.
8. Calculation and detection rule.
9. Financial impact, if calculable.
10. AI confidence.
11. Severity.
12. Responsible department.
13. Suggested verification steps.
14. Recommended corrective action.
15. Review and audit history.

Provide tabs:

- Overview.
- Evidence.
- Financial Impact.
- Stakeholders.
- AI Explanation.
- Action History.

Provide source links or synthetic evidence references where applicable.

Do not fabricate official document references.

### Section I: Human Review and Action Workflow

Implement a working review workflow.

Statuses:

- New.
- Under Review.
- Evidence Requested.
- Verified.
- Not Substantiated.
- Action Required.
- Resolved.
- Closed.

Allow authorized demo users to:

- Assign a finding.
- Add review remarks.
- Request additional evidence.
- Change review status.
- Record a corrective action.
- Set a due date.
- Escalate to Secretary.
- Record closure remarks.

All actions must persist through the backend and appear in audit history.

Enforce existing RBAC.

Do not allow unauthorized users to close or modify findings.

### Section J: Minister and Secretary Decision Panel

Create a separate executive decision section.

Title:

Decisions Requiring Attention

Display only findings that require executive intervention.

Examples:

- Cross-departmental approval bottleneck.
- High-value payment anomaly requiring verification.
- Repeated package delays.
- Major unresolved quality findings.
- Significant cost variation.
- Pending corrective action beyond its due date.

For each item show:

- Project.
- Issue.
- Impact.
- Responsible department.
- Current status.
- Recommended decision.
- Escalation level.

Provide navigation to Project 360 and Departments.

Do not allow the AI to make government decisions autonomously.

## 5. AI Capabilities

Implement a useful AI feature set.

Priority 1: Rule-based anomaly detection.

Create transparent detection rules for:

- Duplicate payment references.
- Duplicate bill identifiers.
- Payment exceeding the approved milestone amount.
- Financial progress inconsistent with physical progress.
- Unusual cost variation.
- Repeated contract extensions.
- Missing supporting evidence.
- Repeated quality defects.
- Overdue corrective actions.
- Unusually high pending payments.

Priority 2: AI-assisted explanation.

Where the existing LLM integration is available, use it to explain detected anomalies.

The LLM must receive structured evidence from the backend.

Do not ask the LLM to invent financial values or project facts.

Priority 3: AI recommendations.

Generate suggested verification and corrective actions based on the evidence and detection category.

Priority 4: Executive intelligence summary.

Generate a concise summary for Minister and Secretary views.

If no LLM provider is configured, use deterministic template-based explanations and clearly label the output as rule-based.

Do not make the application dependent on a paid LLM API for basic functionality.

## 6. Backend Requirements

Implement or extend appropriate models and APIs.

Potential entities:

- anomaly_findings
- anomaly_rules
- anomaly_evidence
- anomaly_reviews
- anomaly_actions
- anomaly_assignments
- anomaly_audit_history
- anomaly_financial_impact

Reuse existing models where appropriate.

Required API capabilities:

- List findings.
- Filter findings.
- Retrieve finding details.
- Retrieve category summaries.
- Retrieve financial exposure summaries.
- Retrieve project risk summaries.
- Run anomaly detection against mock data.
- Assign findings.
- Update review status.
- Add review remarks.
- Create corrective actions.
- Retrieve action history.
- Generate executive summaries.

All endpoints must use actual backend queries.

Do not return hardcoded API responses.

## 7. Frontend Requirements

Build a complete responsive interface.

Requirements:

- Reuse existing design components.
- Professional government executive presentation.
- Clear visual hierarchy.
- Interactive charts.
- Functional filters.
- Searchable findings table.
- Finding detail drawer.
- Working status updates.
- Loading states.
- Empty states.
- Error states.
- Pagination where required.
- Responsive layouts.

Do not create a collection of disconnected dashboard cards.

The screen must tell a connected story from anomaly detection to evidence review to corrective action.

## 8. Navigation and Integration

Integrate with existing routes.

From leakage findings, allow navigation to:

- #/project-360
- #/finance
- #/contractors
- #/quality
- #/departments
- #/land-utility
- #/reports

Use the existing router implementation.

Do not create duplicate routes.

## 9. Security and Data Governance

- Enforce backend RBAC.
- Validate all inputs.
- Log important user actions.
- Prevent unauthorized status updates.
- Keep mock and official data modes separate.
- Never mark synthetic findings as officially verified.
- Keep evidence and AI interpretations separate.
- Preserve review history.

## 10. Testing and Acceptance Criteria

The screen is complete only when:

1. The route opens without errors.
2. KPI cards display values derived from the database.
3. Filters work.
4. Charts reflect the selected filters.
5. Finding details open correctly.
6. AI explanations display supporting evidence.
7. Financial calculations are reproducible.
8. Review workflows persist changes.
9. Audit history is recorded.
10. Project navigation works.
11. Backend permissions are enforced.
12. Existing screens continue working.
13. Automated tests pass.

Include tests for duplicate payments, milestone mismatches, cost variation and unauthorized review actions.

## 11. Final Demo Acceptance

The Minister should be able to open this screen and understand within two minutes:

- Where the highest risks are.
- Which projects are affected.
- What financial exposure is potentially involved.
- Why AI flagged the issues.
- What evidence supports the findings.
- Which department must respond.
- What decision or action is required.

The screen must be visually complete and populated with consistent mock data.

## 12. Execution Instructions

Implement only this prompt.

Do not proceed to Reports or other screens yet.

After implementation, report:

1. Existing functionality preserved.
2. UI components created or updated.
3. Database models added or reused.
4. APIs implemented.
5. Mock records created.
6. AI capabilities implemented.
7. Tests executed and results.
8. Screenshots or visual verification.
9. Known limitations.
10. Recommended next screen.

Do not claim completion unless the screen has been opened and its major workflows tested.


# TN-HDOS IMPLEMENTATION PROMPT 02
# Ministerial Reports and AI Decision Intelligence Workspace

## 1. Objective

Complete the existing TN-HDOS `#/reports` screen.

The current screen is empty, incomplete or partially implemented.

Transform it into a comprehensive Ministerial Reporting and AI Decision Intelligence workspace.

This must be a fully functional screen backed by the existing backend and consistent synthetic mock data.

Do not create a static reporting page.

The Minister should be able to understand the overall status of Tamil Nadu highway infrastructure programmes, identify risks, review financial and operational performance, and determine which decisions require attention.

Use the existing mock data foundation created in Prompt 01.

Do not create a second independent dataset.

## 2. Mandatory Repository Assessment

Before implementation:

1. Inspect the existing repository.
2. Inspect the current `#/reports` route.
3. Inspect the Prompt 01 implementation and mock-data architecture.
4. Inspect the Minister and Secretary workspaces.
5. Inspect Project 360, Leakage, Finance, Quality, Contractors and Departments.
6. Inspect existing charts, tables, filters and reusable components.
7. Inspect existing APIs and database models.
8. Identify which data is already available and which additional mock records are needed.

Preserve existing functionality.

Do not duplicate business logic or create disconnected mock data.

## 3. Screen Design Philosophy

Design this screen as a high-level government executive intelligence workspace.

It must answer five questions:

1. What is the current state of highway infrastructure projects?
2. Where are the major delays and financial risks?
3. Which departments, projects or contractors need attention?
4. What has AI identified that requires intervention?
5. What decisions should the Minister or Secretary take?

Use a clean, modern government enterprise interface.

Follow the existing TN-HDOS visual design system.

Avoid excessive dashboard cards.

Prioritise decision-making, clear information hierarchy and actionable intelligence.

## 4. Screen Header

Title:

Ministerial Reports & Decision Intelligence

Subtitle:

Unified reporting, programme performance and AI-assisted executive decision support.

Display:

- DEMO DATA indicator.
- Reporting period.
- Last updated timestamp.
- Programme selector.
- District selector.
- Project selector.
- Department selector.
- Reporting frequency.
- Export report action.
- Generate AI briefing action.

Support:
- Daily.
- Weekly.
- Monthly.
- Quarterly.
- Financial year.

Use the existing reporting period conventions where available.

All filters must affect the actual backend queries.

## 5. Executive Overview

Create a high-level summary of the department's performance.

Display these KPIs:

1. Total Active Projects.
2. Total Project Value.
3. Total Budget Allocation.
4. Total Expenditure.
5. Physical Progress.
6. Delayed Projects.
7. Critical Risk Projects.
8. Pending Approvals.
9. Land Acquisition Pending.
10. Potential Financial Exposure.

All figures must be derived from the common mock dataset.

Provide clear definitions and calculation logic for each KPI.

Do not use arbitrary hardcoded numbers.

Clicking any KPI must navigate to the relevant filtered screen.

Examples:

- Delayed Projects → Project 360.
- Pending Approvals → Departments.
- Potential Financial Exposure → Leakage.
- Budget and Expenditure → Finance.
- Land Acquisition Pending → Land & Utility.

## 6. Programme Performance Intelligence

Create a programme-wise performance section.

Include the existing demonstration programmes:

- CKICP.
- TNRSP-II.
- Other synthetic highway infrastructure programmes.

Display:

- Number of projects.
- Number of packages.
- Approved project value.
- Budget allocation.
- Expenditure.
- Physical progress.
- Financial progress.
- Delayed projects.
- High-risk projects.

Use interactive comparison charts.

Selecting a programme should filter all relevant report sections.

Clearly mark all programme and project data as synthetic demonstration data.

Do not imply that mock values represent actual programme performance.

## 7. Project Performance Report

Create a searchable project performance table.

Columns:

- Project ID.
- Project Name.
- Programme.
- District.
- Project Value.
- Physical Progress.
- Financial Progress.
- Planned Completion.
- Expected Completion.
- Schedule Variance.
- Contractor.
- Overall Risk.
- Project Status.
- Action.

Support:

- Search.
- Sorting.
- Filtering.
- Pagination.
- Export.
- Navigation to Project 360.

Include visual indicators for schedule and performance status.

Use synthetic records from the existing mock dataset.

## 8. Financial Performance Report

Create a financial intelligence section.

Display:

- Approved budget.
- Revised budget.
- Actual expenditure.
- Pending bills.
- Payments made.
- Retention amount.
- Cost variations.
- Potential exposure under review.

Charts:

1. Budget versus expenditure.
2. Programme-wise expenditure.
3. Monthly expenditure trend.
4. Contractor payment distribution.
5. Pending payment ageing.
6. Cost variation analysis.

Include project-wise and contractor-wise financial breakdowns.

Distinguish approved expenditure, actual expenditure, pending payments and potential exposure.

Do not treat flagged transaction values as confirmed financial losses.

Navigation:
- Finance.
- Contractors.
- Leakage.
- Project 360.

## 9. Schedule and Execution Report

Create a project execution intelligence section.

Display:

- Projects on schedule.
- Delayed projects.
- Critical delays.
- Milestones due.
- Overdue milestones.
- Contract extensions.
- Expected completion risks.

Provide a project delay analysis table.

For each delayed project show:

- Project.
- Package.
- Contractor.
- Planned completion.
- Current expected completion.
- Delay in days.
- Primary blocker.
- Responsible department.
- Recommended action.

Use consistent milestone records.

Do not invent reasons for delay when the mock dataset does not contain evidence.

## 10. Departmental Performance Report

Display department-wise dependencies and pending actions.

Departments may include synthetic demonstration records for:

- Highways.
- Revenue.
- Forest.
- TANGEDCO.
- Water Resources.
- Police.
- Environment.
- Local Administration.

Display:

- Pending approvals.
- Average approval age.
- Critical dependencies.
- Projects affected.
- Overdue actions.
- Escalations.

Show the departments with the highest number of outstanding dependencies.

Navigation:
`#/departments`

## 11. Contractor Performance Report

Create a contractor performance comparison.

Display:

- Active contracts.
- Contract value.
- Project progress.
- Schedule adherence.
- Quality observations.
- Pending payments.
- Contract extensions.
- Open corrective actions.

Provide a contractor performance score with a transparent formula.

Do not create a score based on arbitrary assumptions.

Show the factors contributing to each score.

Do not label a contractor as blacklisted or guilty of misconduct.

Navigation:
`#/contractors`

## 12. Quality and Asset Performance Report

Create two connected reporting sections.

### Quality

Display:

- Inspections conducted.
- Open defects.
- Critical observations.
- Non-conformance reports.
- Corrective actions pending.
- Overdue quality closures.
- Contractor-wise quality observations.

Navigation:
`#/quality`

### Assets

Display:

- Total demonstration assets.
- Road assets.
- Bridges.
- Culverts.
- Assets requiring inspection.
- Assets with maintenance pending.
- Critical asset conditions.

Navigation:
`#/assets`

## 13. Land and Utility Report

Display:

- Total demonstration land parcels.
- Parcels under acquisition.
- Awards pending.
- Compensation pending.
- Possession pending.
- Utility shifting pending.
- Projects affected.
- Average pending duration.

Separate land acquisition and utility-shifting statistics.

Show:

- Revenue Department dependencies.
- TANGEDCO dependencies.
- Water Resources dependencies.
- Forest and other clearances.

Use synthetic records only.

Navigation:
`#/land-utility`

## 14. AI Decision Intelligence

This is the most important section.

Create a prominent AI-powered executive decision panel.

Title:

AI Ministerial Intelligence Briefing

The AI must analyse the structured mock data across:

- Projects.
- Finance.
- Leakage findings.
- Contractors.
- Quality.
- Land acquisition.
- Utility shifting.
- Departmental approvals.
- Field inspections.
- Citizen grievances.
- Legal and compliance records, where available.

Display five subsections.

### A. What Needs Attention?

Identify the highest-priority issues.

Example synthetic narrative:

"Three demonstration projects require immediate executive attention. The primary blockers are delayed utility shifting, pending land acquisition and repeated contractor milestone slippage."

### B. Why Does It Matter?

Explain:

- Project impact.
- Financial impact.
- Schedule impact.
- Departmental dependencies.
- Public impact, if supported by mock records.

### C. What Should Be Done?

Provide specific recommended actions.

Example:

- Request a status report from the responsible department.
- Assign a deadline for pending utility shifting.
- Review repeated contract extensions.
- Verify payment and physical progress mismatches.
- Escalate overdue corrective actions.

### D. Who Should Act?

Display:

- Responsible department.
- Assigned officer.
- Current action owner.
- Escalation authority.
- Target date.

All names must be fictional.

### E. What Decision Is Required?

Create a decision queue for Minister and Secretary.

Each item should include:

- Decision reference.
- Project.
- Issue.
- Evidence.
- Impact.
- Recommended action.
- Decision authority.
- Current status.

AI recommendations must be advisory.

The AI must not automatically issue government orders, approve payments, change contracts or make administrative decisions.

## 15. AI Report Generation

Implement an interactive report-generation workflow.

The user should be able to select:

- Report type.
- Programme.
- District.
- Project.
- Department.
- Reporting period.
- Include financial analysis.
- Include project delays.
- Include contractor performance.
- Include AI findings.
- Include land and utility dependencies.
- Include quality observations.

Generate a structured report with:

1. Executive summary.
2. Performance overview.
3. Financial analysis.
4. Project execution analysis.
5. Departmental dependencies.
6. Contractor performance.
7. Major risks.
8. AI observations.
9. Recommended actions.
10. Supporting data.

Provide:

- On-screen report preview.
- Print-friendly layout.
- PDF export if the existing architecture supports it.
- CSV export for supported tabular reports.

The generated report must reflect selected filters.

Include the data mode and generation timestamp.

Do not invent source citations for mock records.

## 16. Ministerial Decision Tracking

Implement a working decision tracking section.

Statuses:

- Pending Decision.
- Under Review.
- Approved.
- Rejected.
- Referred to Department.
- Action Assigned.
- Completed.
- Closed.

Allow authorized users to:

- Record a decision.
- Add remarks.
- Assign an action owner.
- Set a due date.
- Track completion.
- Review action history.

Persist all actions through backend APIs.

Use existing RBAC.

Record changes in audit logs.

For the demonstration, decisions must be clearly labelled as simulated administrative actions.

## 17. AI Technology Requirements

Use the existing AI infrastructure.

Preferred approach:

1. Structured database queries for factual data.
2. Rule-based calculations for KPIs.
3. Deterministic aggregation for reports.
4. LLM for executive explanation and recommendations.
5. Evidence-backed summaries.
6. Human review before any decision is recorded.

The LLM must not calculate critical financial KPIs independently.

Provide deterministic fallback summaries if no LLM provider is configured.

For every AI observation, identify:

- Data used.
- Relevant project.
- Evidence records.
- Reasoning category.
- Confidence or evidence completeness.
- Recommended action.

Clearly distinguish facts, calculations, inferences and predictions.

## 18. Backend and API Requirements

Reuse existing database models and services.

Create or extend APIs for:

- Executive report overview.
- Programme performance.
- Project performance.
- Financial performance.
- Schedule performance.
- Departmental performance.
- Contractor performance.
- Quality performance.
- Asset performance.
- Land and utility performance.
- AI executive briefing.
- Report generation.
- Report export.
- Ministerial decision tracking.

All APIs must use actual database queries.

All filters must work at the backend.

Avoid hardcoded frontend summaries.

## 19. UI and User Experience

The screen must feel like a premium government executive intelligence product.

Use:

- Clear executive summary.
- Strong visual hierarchy.
- Interactive charts.
- Searchable tables.
- Drill-down panels.
- AI briefing panel.
- Decision queue.
- Report generation interface.

Use appropriate loading, error and empty states.

Avoid overcrowding.

Ensure that the Minister can identify the most important information quickly.

Maintain responsive design.

Use the existing component library and design system.

## 20. Testing

Test:

- Route navigation.
- KPI calculation.
- Programme filters.
- District filters.
- Project filters.
- Department filters.
- Financial calculations.
- Schedule variance calculations.
- Contractor performance calculations.
- AI summary generation.
- Report generation.
- CSV/PDF export where implemented.
- Decision tracking.
- RBAC.
- Audit logging.

Verify that all report figures reconcile with the underlying mock dataset.

## 21. Acceptance Criteria

The screen is complete only when:

1. `#/reports` opens without errors.
2. It displays a populated Ministerial reporting workspace.
3. All major KPIs derive from the database.
4. Programme and project filters work.
5. Charts and tables reconcile.
6. AI executive briefing is functional.
7. Report generation produces a real filtered report.
8. Decision tracking persists records.
9. Navigation to related modules works.
10. Mock data is clearly identified.
11. Backend RBAC is enforced.
12. Existing application functionality remains intact.
13. Tests have actually been executed.

## 22. Minister Demonstration Scenario

Prepare one coherent synthetic scenario for the demonstration.

The Minister opens Reports and sees:

1. Overall highway project performance.
2. A delayed project in the CKICP demonstration programme.
3. A pending land acquisition dependency.
4. A utility-shifting bottleneck.
5. A contractor milestone delay.
6. A financial progress mismatch.
7. An AI-generated executive assessment.
8. A recommendation to seek departmental clarification.
9. A decision assigned to the responsible authority.
10. The ability to open Project 360 for the complete project history.

All these records must link to the same synthetic project and related entities.

## 23. Execution Instructions

Implement only the Reports screen.

Do not start Project 360 or any other screen in this execution.

Preserve the Prompt 01 Leakage screen.

Reuse the existing mock dataset and extend it only where required.

At completion, provide:

1. Screens and components implemented.
2. Backend APIs implemented.
3. Database models reused or added.
4. Mock data reused or added.
5. AI capabilities implemented.
6. Reports and export functionality.
7. Tests executed and results.
8. Visual verification.
9. Known limitations.
10. Confirmation that Leakage still works.

Do not claim completion without opening the screen and testing its workflows.


# TN-HDOS IMPLEMENTATION PROMPT 03
# Project 360°: Complete Project Lifecycle and AI Intelligence Workspace

## 1. Objective

Complete the existing TN-HDOS `#/project-360` screen.

Transform it into a comprehensive project lifecycle intelligence workspace for Ministers, Secretaries, Chief Engineers, Project Directors and other authorised users.

The current implementation may contain partial project information or incomplete sections. Inspect it first and complete the missing functionality.

This must be a working application screen backed by the common synthetic mock dataset.

Do not create a static project dashboard.

The central objective is:

**Select any highway project and understand everything about that project, its people, money, contracts, dependencies, risks, progress and required decisions in one unified interface.**

## 2. Mandatory Initial Assessment

Before modifying code:

1. Inspect the existing repository.
2. Inspect the existing Project 360 route and implementation.
3. Inspect the Prompt 01 Leakage implementation.
4. Inspect the Prompt 02 Reports implementation, if completed.
5. Inspect existing project, package, contractor and official database models.
6. Inspect existing land acquisition and legal models.
7. Inspect existing finance, quality, field operations and asset models.
8. Inspect existing AI/RAG capabilities.
9. Inspect existing navigation and RBAC.
10. Identify which Project 360 sections already work and which are incomplete.

Preserve all working functionality.

Reuse existing models, APIs and components wherever possible.

Do not create duplicate project records or disconnected mock datasets.

## 3. Common Mock Data Requirements

Use the central mock-data provider.

Maintain consistent relationships across all modules.

For this demonstration, create or reuse synthetic records for:

- 12 highway projects.
- 20 project packages.
- 10 fictional contractors.
- 30 fictional officials.
- 10 departments.
- 50 land acquisition parcels.
- 25 departmental approvals.
- 20 synthetic legal records.
- 100 financial transactions.
- 50 project milestones.
- 30 quality inspection records.
- 50 field inspection records.
- 40 infrastructure assets.
- 15 AI anomaly findings.
- 30 citizen grievances.

Do not recreate records already seeded by previous prompts.

Every synthetic record must have:

- data_mode: mock
- data_status: Seeded Demo
- source_type: synthetic
- generated_at

Use fictional officer and contractor names.

Use clearly synthetic legal case references and document numbers.

Do not represent synthetic data as actual Tamil Nadu Government records.

## 4. Screen Header and Project Selection

Title:

Project 360° Intelligence

Subtitle:

Complete lifecycle visibility, project execution, financial control, stakeholder accountability and AI-assisted risk intelligence.

Header elements:

- DEMO DATA indicator.
- Project search.
- Programme selector.
- District selector.
- Project status filter.
- Risk filter.
- Last updated timestamp.

Provide a project selector that supports searching by:

- Project ID.
- Project name.
- Programme.
- District.
- Contractor.
- Project Director.

When a project is selected, load its complete information.

Provide previous and next project navigation where appropriate.

Do not hardcode a single project.

## 5. Project Executive Overview

At the top, display a comprehensive project summary.

Include:

- Project ID.
- Project name.
- Programme.
- Project category.
- District.
- Project location.
- Project length, where applicable.
- Approved project value.
- Revised project value.
- Project start date.
- Planned completion date.
- Expected completion date.
- Current project status.
- Overall risk.
- Project Director.
- Executing authority.
- Main contractor.

Display prominent KPIs:

1. Physical Progress.
2. Financial Progress.
3. Schedule Variance.
4. Budget Utilisation.
5. Pending Approvals.
6. Land Acquisition Progress.
7. Open Quality Findings.
8. Open AI Findings.

All figures must come from the selected project's related records.

Provide definitions and formulas for calculated KPIs.

## 6. AI Project Intelligence Panel

This must be one of the most prominent sections.

Title:

AI Project Intelligence Assessment

The AI should analyse all available structured information for the selected project.

Show:

### A. Executive Summary

Provide a concise explanation of the project's overall condition.

Example synthetic narrative:

"This demonstration project is progressing but faces schedule pressure due to pending utility shifting and delayed departmental approvals. Financial progress is higher than the verified physical progress indicator. Two quality observations remain unresolved. AI recommends reviewing the payment milestone, resolving the utility dependency and obtaining an updated execution schedule."

### B. Critical Findings

Display the highest-priority project findings.

### C. Root Cause Analysis

Identify contributing factors from available records:

- Land acquisition.
- Utility shifting.
- Departmental approvals.
- Contractor performance.
- Funding and payment.
- Engineering quality.
- Legal restrictions.
- Field execution.

Distinguish confirmed mock-record facts from AI inferences.

### D. Recommended Actions

Provide specific actions, responsible departments and suggested deadlines.

### E. Decision Required

Highlight decisions requiring intervention from the Minister, Secretary or authorised project authority.

AI must be advisory.

Do not allow the AI to approve payments, modify contracts or issue government instructions automatically.

## 7. Project Lifecycle and Milestone Tracking

Create a visual project timeline.

Stages may include:

1. Project proposal.
2. Feasibility study.
3. DPR preparation.
4. Administrative sanction.
5. Technical sanction.
6. Land acquisition.
7. Environmental and statutory approvals.
8. Utility shifting.
9. Tender publication.
10. Contract award.
11. Work commencement.
12. Construction.
13. Quality inspection.
14. Completion.
15. Defect liability period.
16. Final closure.

Each stage should show:

- Planned date.
- Actual date, if available.
- Status.
- Responsible authority.
- Supporting evidence.
- Delay duration.
- Dependencies.

Support:

- Completed.
- In Progress.
- Pending.
- Delayed.
- Blocked.
- Not Applicable.

The timeline must be driven by project milestone records.

Do not display future or completed stages as factual without supporting mock records.

## 8. Project Packages and Contracts

Create a dedicated section.

Display all packages under the selected project.

For each package show:

- Package ID.
- Package description.
- Contract value.
- Contractor.
- Tender reference.
- Award date.
- Work order date.
- Start date.
- Planned completion.
- Current expected completion.
- Physical progress.
- Financial progress.
- Package status.
- Risk level.

Selecting a package should display its detailed information.

Include:

- Contract amendments.
- Extension of time.
- Payment history.
- Quality observations.
- Milestone performance.
- Contractor correspondence.
- Related AI findings.

Provide navigation to `#/contractors` and `#/finance`.

## 9. Contractor and Stakeholder Directory

Display all stakeholders linked to the selected project.

### Government officials

Show:

- Name.
- Designation.
- Department.
- Office.
- Role in the project.
- Responsibility.
- Assignment start date.
- Assignment end date, if applicable.
- Contact details, where appropriate for the synthetic demo.

### Contractors and consultants

Show:

- Contractor name.
- Contract/package association.
- Scope.
- Contract value.
- Current performance.
- Pending actions.

### Other departments

Show:

- Department.
- Dependency.
- Assigned officer.
- Pending action.
- Due date.
- Current status.

Allow navigation to the relevant directory and department screens.

Do not assign real government officials to fictional project responsibilities.

## 10. Departmental Dependencies and Approvals

Create a complete dependency register.

Display dependencies involving:

- Revenue Department.
- Forest Department.
- TANGEDCO.
- Water Resources Department.
- Police.
- Environment-related authorities.
- Local Administration.
- Highways Department.

For every dependency show:

- Dependency ID.
- Department.
- Approval or clearance type.
- Responsible officer.
- Date submitted.
- Days pending.
- Target date.
- Project impact.
- Status.
- Escalation level.

Include a dependency graph or workflow view showing which approval blocks the next project milestone.

Provide navigation to `#/departments`.

## 11. Land Acquisition and Utility Shifting

Create a combined land and utility section with separate tabs.

### Land acquisition

Display:

- Total parcels.
- Parcels under acquisition.
- Award completed.
- Compensation pending.
- Possession completed.
- Possession pending.
- Area acquired.
- Area pending.
- Disputes or objections.
- Related legal records.

For each parcel show:

- Parcel ID.
- Synthetic survey reference.
- Village.
- District.
- Area.
- Acquisition stage.
- Compensation status.
- Possession status.
- Responsible authority.
- Pending issue.

### Utility shifting

Display:

- Utility type.
- Utility owner department.
- Affected location.
- Shifting requirement.
- Estimated cost.
- Approval status.
- Work status.
- Expected completion.
- Impact on project schedule.

Support utility categories such as:

- Electrical lines.
- Water pipelines.
- Telecommunications.
- Drainage.
- Other infrastructure.

Use synthetic records and clearly label them.

Provide navigation to `#/land-utility`.

## 12. Finance and Payment Intelligence

Display project-level financial information.

Include:

- Approved project cost.
- Revised project cost.
- Budget allocation.
- Actual expenditure.
- Financial progress.
- Pending bills.
- Payments released.
- Retention.
- Advances.
- Cost variation.
- Payment milestones.

Add charts:

1. Budget versus expenditure.
2. Physical versus financial progress.
3. Monthly expenditure.
4. Package-wise expenditure.
5. Contractor payment history.

Provide a searchable transaction table.

For each transaction show:

- Transaction reference.
- Package.
- Contractor.
- Bill date.
- Bill amount.
- Approved amount.
- Paid amount.
- Payment status.
- Supporting evidence status.

Distinguish mock transactions from verified payments.

Provide navigation to `#/finance` and `#/leakage`.

## 13. Engineering Quality and Inspection

Display:

- Inspection count.
- Quality observations.
- Critical defects.
- Open non-conformance reports.
- Corrective actions.
- Reinspection status.
- Quality clearance.

For each finding show:

- Inspection ID.
- Inspection date.
- Inspection authority.
- Location.
- Defect category.
- Observation.
- Severity.
- Contractor response.
- Corrective action.
- Closure status.

Provide a chronological inspection history.

Allow authorised demo users to record observations and corrective actions.

All actions must be persisted and audited.

Provide navigation to `#/quality`.

## 14. Field Operations and Physical Progress

Display field execution intelligence.

Include:

- Site inspections.
- Engineer visits.
- Progress updates.
- Geo-tagged observations.
- Construction photographs, where available.
- Work completed.
- Work remaining.
- Site issues.
- Contractor responses.
- Verification status.

For each inspection show:

- Inspection ID.
- Date.
- Officer.
- Site location.
- Package.
- Work activity.
- Progress reported.
- Progress verified.
- Findings.
- Follow-up action.

Use synthetic locations and illustrative records.

Provide a map if the existing mapping capability supports it.

Do not display invented real-world GIS alignments as official routes.

Provide navigation to `#/field-ops`.

## 15. Legal and Compliance Intelligence

Create a project legal and compliance section.

Display:

- Synthetic legal records.
- Court or tribunal category.
- Case reference.
- Parties, using fictional names.
- Filing date.
- Current status.
- Interim orders, if part of the synthetic scenario.
- Project impact.
- Related parcel or package.
- Responsible legal officer.
- Next action.

Include:

- Contractual disputes.
- Land acquisition disputes.
- Compensation disputes.
- Statutory approval issues.
- Other project-related compliance matters.

Do not fabricate real court cases or actual court orders.

Clearly label every legal reference as synthetic demonstration data.

Provide links to the relevant legal and compliance modules if available.

## 16. Project Assets

Display infrastructure assets associated with the selected project.

Include:

- Roads.
- Bridges.
- Culverts.
- Flyovers.
- Drainage infrastructure.
- Other highway assets.

For each asset show:

- Asset ID.
- Asset type.
- Location.
- Installation or completion date.
- Current condition.
- Inspection history.
- Maintenance status.
- Responsible authority.

Provide navigation to `#/assets`.

## 17. Citizen Grievances and Public Impact

Display project-related citizen grievances.

Show:

- Grievance ID.
- Category.
- Location.
- Date received.
- Assigned department.
- Responsible officer.
- Status.
- Resolution target.
- Resolution details.

Categories may include:

- Road damage.
- Construction disruption.
- Drainage issues.
- Traffic diversions.
- Safety concerns.
- Encroachment complaints.

Use synthetic citizen records only.

Provide navigation to `#/citizen-services`.

## 18. AI Leakage and Risk Intelligence

Connect the selected project to AI findings from `#/leakage`.

Display:

- Finding ID.
- Category.
- Severity.
- Description.
- Evidence.
- Potential exposure.
- Confidence.
- Review status.
- Recommended action.

Support risk categories:

- Financial.
- Schedule.
- Procurement.
- Quality.
- Land acquisition.
- Utility shifting.
- Legal.
- Compliance.

Clicking a finding should open its detailed view.

Do not generate duplicate findings in Project 360.

Reuse the existing finding records.

## 19. Project Document Repository

Create a project-specific document register.

Document categories:

- DPR.
- Administrative sanction.
- Technical sanction.
- Tender documents.
- Contract agreements.
- Work orders.
- Progress reports.
- Inspection reports.
- Land acquisition documents.
- Approval documents.
- Correspondence.
- Legal documents.
- Payment records.

For each document display:

- Document ID.
- Document title.
- Category.
- Associated package.
- Upload or creation date.
- Version.
- Data status.
- Source type.
- Access permissions.

For the mock demo, use synthetic document metadata and clearly identified sample attachments.

Do not create fake official government orders.

## 20. Project Communication and Action Register

Create an action tracking section.

Show:

- Action ID.
- Issue.
- Related module.
- Responsible department.
- Assigned officer.
- Priority.
- Target date.
- Current status.
- Escalation history.

Support:

- Assign action.
- Add remarks.
- Change status.
- Set due date.
- Escalate.
- Close with closure remarks.

All actions must be persisted.

Maintain an audit trail.

Use existing RBAC.

## 21. Recommended Screen Layout

Design the page using a tabbed and section-based layout to avoid overwhelming users.

Suggested structure:

Header:
- Project selection.
- Project status.
- Project risk.
- Key project KPIs.

Executive section:
- AI Project Intelligence.
- Major blockers.
- Decisions required.

Project tabs:

1. Overview.
2. Timeline.
3. Packages & Contracts.
4. Officials & Stakeholders.
5. Departments & Approvals.
6. Land & Utilities.
7. Finance.
8. Quality.
9. Field Operations.
10. Legal & Compliance.
11. Assets.
12. Citizen Grievances.
13. AI Findings.
14. Documents.
15. Actions & History.

Ensure that the page remains usable on desktop and tablet.

Use a clear visual hierarchy and meaningful charts.

Avoid displaying every detail at once.

## 22. AI Capabilities

Implement these AI capabilities using existing infrastructure.

### AI Project Summary

Generate a concise project health assessment.

### AI Root Cause Analysis

Identify relationships between delays, dependencies, contractor performance, financial status and quality.

### AI Schedule Risk Prediction

Identify milestones at risk using available historical and planned dates.

### AI Financial Risk Analysis

Identify payment and expenditure anomalies.

### AI Dependency Analysis

Identify which department or approval is blocking project progress.

### AI Recommended Actions

Suggest next actions, responsible authorities and priorities.

### AI Executive Briefing

Generate a concise summary suitable for the Minister and Secretary.

Technology approach:

1. Structured database queries for factual records.
2. Deterministic calculations for KPIs.
3. Rule-based risk identification.
4. LLM for explanation and recommendations.
5. Evidence-linked outputs.
6. Human review for administrative decisions.

If no LLM is configured, provide deterministic summaries.

Do not allow the LLM to invent project information or calculate financial values independently.

For each AI finding, display:

- Evidence used.
- Related records.
- Explanation.
- Confidence or evidence completeness.
- Recommended action.

Clearly distinguish facts, calculations, inferences and predictions.

## 23. Backend and API Requirements

Reuse existing models and services.

Create or extend APIs for:

- Project executive overview.
- Project packages.
- Project milestones.
- Project stakeholders.
- Departmental dependencies.
- Land acquisition.
- Utility shifting.
- Project finance.
- Payment transactions.
- Quality inspections.
- Field inspections.
- Legal records.
- Assets.
- Citizen grievances.
- AI findings.
- Project documents.
- Project action register.
- AI project summary.
- AI risk assessment.

All endpoints must use actual database queries.

Ensure proper pagination, filters, validation and error handling.

Do not return hardcoded frontend data.

## 24. Security and Audit Requirements

Enforce existing RBAC at the backend.

Users should only see information permitted by their roles and jurisdictions.

Restrict actions such as:

- Financial record modification.
- Contract modification.
- Legal record modification.
- Approval updates.
- Document access.
- Action closure.

Record important changes in audit logs.

Do not treat mock records as official government data.

## 25. Testing and Acceptance Criteria

Test:

1. Project selection.
2. Project search.
3. Project overview.
4. Package relationships.
5. Contractor relationships.
6. Officer relationships.
7. Department dependencies.
8. Land acquisition records.
9. Utility shifting records.
10. Finance calculations.
11. Milestone calculations.
12. Quality records.
13. Field inspection records.
14. Legal records.
15. Asset relationships.
16. Citizen grievances.
17. AI findings.
18. Document register.
19. Action tracking.
20. RBAC.
21. Audit logging.
22. Navigation between screens.

Verify that all data displayed belongs to the selected project.

Test that changing the selected project updates every relevant section.

Test that missing data is displayed as unavailable, not fabricated.

Verify that the Leakage and Reports screens continue working.

## 26. Minister Demonstration Scenario

Prepare one coherent synthetic highway project scenario.

The Minister selects a project and sees:

1. Project progress is behind schedule.
2. One package is delayed.
3. The contractor has missed a milestone.
4. Land acquisition is partially pending.
5. Utility shifting is blocking construction.
6. A departmental approval is overdue.
7. Financial progress is inconsistent with physical progress.
8. Two quality observations remain open.
9. A legal issue affects one synthetic parcel.
10. AI identifies the combined project risk.
11. AI recommends specific corrective actions.
12. The Minister can identify which department and officer must act.
13. The Minister can open the relevant evidence and review history.

All related records must use the same synthetic project and linked entity IDs.

## 27. Final Acceptance Criteria

The screen is complete only when:

- Project 360 opens without errors.
- Multiple projects can be selected.
- All project information is loaded dynamically.
- All relevant modules are connected.
- Project relationships are correct.
- Financial and schedule calculations are tested.
- AI summaries use actual backend records.
- AI findings link to evidence.
- Action tracking persists.
- Role permissions are enforced.
- Mock data is clearly labelled.
- The Minister demonstration scenario works end to end.
- Existing screens remain functional.

## 28. Mandatory Final Status Report: DONE VS PENDING

At the end of implementation, provide a factual completion report.

Do not mark a feature complete just because a component or API exists.

Use this table:

| Feature / Section | Status | Evidence |
|---|---|---|
| Project selection | DONE / PARTIAL / PENDING | Route, component and test |
| Executive overview | DONE / PARTIAL / PENDING | API and UI evidence |
| AI project intelligence | DONE / PARTIAL / PENDING | AI service and evidence |
| Project timeline | DONE / PARTIAL / PENDING | Milestone API and UI |
| Packages and contracts | DONE / PARTIAL / PENDING | Database relationships |
| Officials and stakeholders | DONE / PARTIAL / PENDING | API and linked records |
| Departments and approvals | DONE / PARTIAL / PENDING | API and linked records |
| Land acquisition | DONE / PARTIAL / PENDING | API and linked records |
| Utility shifting | DONE / PARTIAL / PENDING | API and linked records |
| Finance | DONE / PARTIAL / PENDING | Calculation tests |
| Quality | DONE / PARTIAL / PENDING | Inspection workflows |
| Field operations | DONE / PARTIAL / PENDING | Inspection workflows |
| Legal and compliance | DONE / PARTIAL / PENDING | Legal records |
| Assets | DONE / PARTIAL / PENDING | Asset relationships |
| Citizen grievances | DONE / PARTIAL / PENDING | Grievance workflow |
| AI leakage findings | DONE / PARTIAL / PENDING | Finding references |
| Document repository | DONE / PARTIAL / PENDING | Document API |
| Action register | DONE / PARTIAL / PENDING | Persisted workflow |
| RBAC | DONE / PARTIAL / PENDING | Backend authorization tests |
| Audit history | DONE / PARTIAL / PENDING | Audit records |
| Responsive design | DONE / PARTIAL / PENDING | Visual verification |
| Regression tests | DONE / PARTIAL / PENDING | Actual test results |

### Summary

Provide:

**DONE**
- List features fully implemented and tested.

**PARTIALLY DONE**
- List features where the UI, API, data or workflow is incomplete.

**PENDING**
- List features not implemented.

**BLOCKED**
- List features blocked by technical dependencies or unavailable integrations.

**MOCK DATA COVERAGE**
- Number of projects.
- Number of packages.
- Number of linked contractors.
- Number of linked officials.
- Number of departmental dependencies.
- Number of land and utility records.
- Number of financial transactions.
- Number of quality and field records.
- Number of legal and AI records.

**TEST RESULTS**
- Tests executed.
- Passed.
- Failed.
- Skipped.
- Known issues.

**NEXT IMPLEMENTATION**
- Recommend the next screen based on actual remaining dependencies.

Do not assume all sections are complete. Report the actual implementation state.

## 29. Execution Instructions

Implement only Project 360.

Do not start the Quality or other screen implementations in this execution.

Preserve the existing Leakage and Reports screens.

Use the common mock dataset.

Implement backend, frontend, workflows and tests.

Open the actual route and verify the major workflows.

Provide the final DONE VS PENDING report as specified above.



# TN-HDOS IMPLEMENTATION PROMPT 04
# Engineering Quality, Field Operations and Asset Intelligence

## 1. Objective

Complete three existing TN-HDOS screens:

1. `#/quality`
2. `#/field-ops`
3. `#/assets`

These screens are currently empty, incomplete or partially implemented.

Transform them into fully functional engineering execution, inspection, quality assurance and infrastructure asset management workspaces.

This is a combined implementation because all three modules share operational data.

The central workflow must be:

Field Inspection → Engineering Observation → Quality Finding → Corrective Action → Reinspection → Verification → Closure → Asset Condition Update.

The application must demonstrate how TN-HDOS can monitor actual project execution at the field level and provide actionable intelligence to the Minister, Secretary and engineering leadership.

Use consistent synthetic mock data.

Do not wait for actual government data.

## 2. Mandatory Repository Assessment

Before modifying anything:

1. Inspect the complete repository.
2. Inspect the existing Quality, Field Operations and Assets routes.
3. Inspect Project 360 implementation.
4. Inspect Leakage and Reports implementations.
5. Inspect existing project, package, contractor and official models.
6. Inspect inspection, quality and asset-related models.
7. Inspect GIS and document capabilities.
8. Inspect existing AI infrastructure.
9. Inspect existing RBAC and audit logging.
10. Identify reusable UI components, APIs and workflows.

Preserve existing functionality.

Do not rebuild working modules.

Do not create duplicate inspection or asset records.

Reuse the common mock data provider established in earlier prompts.

## 3. Shared Mock Data Foundation

Create or extend a consistent synthetic dataset.

Target records:

- 12 synthetic projects.
- 20 synthetic packages.
- 10 fictional contractors.
- 30 fictional engineering officials.
- 40 synthetic infrastructure assets.
- 50 field inspection records.
- 30 quality inspection records.
- 40 engineering observations.
- 25 non-conformance records.
- 30 corrective actions.
- 20 reinspection records.
- 25 maintenance records.
- 15 AI-generated engineering findings.

Do not recreate records that already exist.

Use common project, package, contractor, officer and asset IDs across all three modules.

Every record must contain:

- data_mode: mock
- data_status: Seeded Demo
- source_type: synthetic
- generated_at
- project_id
- package_id, where applicable
- inspection_id, where applicable
- asset_id, where applicable
- scenario_id

Use fictional officer and contractor names.

Do not present mock inspections as official engineering certifications.

## 4. SCREEN ONE: QUALITY INTELLIGENCE

Route: `#/quality`

### 4.1 Screen Header

Title:

Engineering Quality Intelligence

Subtitle:

Construction quality assurance, inspection evidence, defect monitoring and corrective action intelligence.

Display:

- DEMO DATA indicator.
- Reporting period.
- Programme filter.
- District filter.
- Project filter.
- Package filter.
- Contractor filter.
- Quality status filter.
- Severity filter.
- Last updated timestamp.

### 4.2 Executive Quality Summary

Create KPI cards:

1. Total Inspections.
2. Open Quality Findings.
3. Critical Defects.
4. Non-Conformance Reports.
5. Corrective Actions Pending.
6. Overdue Corrective Actions.
7. Reinspections Pending.
8. Quality Closure Rate.

All values must be derived from database records.

Document calculation formulas.

Clicking a KPI should filter the relevant inspection or defect records.

### 4.3 AI Engineering Quality Assessment

Create a prominent panel:

AI Engineering Quality Assessment

AI should analyse:

- Inspection observations.
- Defect history.
- Contractor performance.
- Material test records.
- Repeated defects.
- Corrective action delays.
- Reinspection results.
- Asset condition.
- Field progress reports.

Display:

- Overall quality assessment.
- Critical quality concerns.
- Repeated defect patterns.
- Contractors requiring attention.
- Projects with recurring quality issues.
- Recommended engineering actions.

Example synthetic assessment:

"Repeated surface-quality observations have been recorded in two demonstration packages. One corrective action remains overdue, and a subsequent inspection has not yet verified closure. The responsible engineering authority should arrange a reinspection and record supporting evidence."

Clearly distinguish observed records, calculated indicators and AI interpretations.

### 4.4 Inspection Register

Create a searchable inspection table.

Columns:

- Inspection ID.
- Project.
- Package.
- Inspection date.
- Inspection type.
- Location.
- Inspecting officer.
- Contractor.
- Findings count.
- Severity.
- Inspection status.
- Action.

Clicking an inspection must open its complete details.

### 4.5 Quality Inspection Categories

Support:

- Road surface inspection.
- Pavement quality.
- Bridge inspection.
- Structural inspection.
- Drainage inspection.
- Culvert inspection.
- Material testing.
- Concrete testing.
- Bitumen testing.
- Road safety inspection.
- Workmanship inspection.
- General engineering inspection.

Use realistic synthetic observations.

Do not generate actual engineering test certifications.

### 4.6 Defect and Non-Conformance Management

Create a defect register.

Fields:

- Defect ID.
- Project.
- Package.
- Asset.
- Location.
- Defect category.
- Description.
- Inspection reference.
- Severity.
- Identified date.
- Contractor response.
- Corrective action.
- Target closure date.
- Reinspection date.
- Closure status.

Statuses:

- New.
- Under Review.
- Contractor Notified.
- Corrective Action Pending.
- Rectification in Progress.
- Reinspection Pending.
- Verified.
- Closed.

Allow authorised users to update the workflow.

### 4.7 Material Testing and Laboratory Results

Create a material testing section.

Support synthetic records for:

- Concrete.
- Cement.
- Bitumen.
- Aggregate.
- Soil.
- Steel.
- Other construction materials.

Display:

- Test reference.
- Material type.
- Sample date.
- Project.
- Package.
- Laboratory.
- Test parameter.
- Measured result.
- Applicable reference limit.
- Result status.
- Supporting report.

Clearly label synthetic test results.

Do not present them as actual laboratory certifications.

### 4.8 Contractor Quality Performance

Show contractor-wise:

- Inspection count.
- Total observations.
- Critical observations.
- Repeat defects.
- Corrective actions pending.
- Average closure time.
- Reinspection results.

Use a transparent performance formula.

Do not generate unsupported contractor misconduct allegations.

### 4.9 Quality Finding Detail

When a user opens a finding, show:

- Finding details.
- Inspection evidence.
- Supporting photographs, if available.
- Material test results.
- Contractor response.
- Corrective action history.
- Reinspection evidence.
- Assigned engineering authority.
- AI explanation.
- Recommended next action.

Provide a complete audit history.

## 5. SCREEN TWO: FIELD OPERATIONS INTELLIGENCE

Route: `#/field-ops`

### 5.1 Screen Header

Title:

Field Operations & Execution Intelligence

Subtitle:

Field inspection, site progress verification, engineering observations and execution accountability.

Display:

- DEMO DATA indicator.
- Reporting period.
- Programme.
- District.
- Project.
- Package.
- Field officer.
- Inspection status.
- Last updated timestamp.

### 5.2 Field Operations Executive Summary

Create KPI cards:

1. Total Site Inspections.
2. Inspections Completed.
3. Inspections Scheduled.
4. Overdue Inspections.
5. Field Issues Open.
6. Critical Field Issues.
7. Progress Updates Submitted.
8. Verification Pending.

Use actual database aggregations.

### 5.3 Field Operations Map

Create a map-based inspection view if existing GIS capabilities support it.

Show synthetic demonstration locations for:

- Project sites.
- Inspection points.
- Construction activities.
- Quality defects.
- Blocked locations.
- Assets requiring inspection.

Use synthetic coordinates only.

Clearly label the map as demonstration data.

Do not imply that mock coordinates represent actual Tamil Nadu highway alignments.

Provide filters by project, district, inspection type and severity.

### 5.4 Field Inspection Schedule

Create an inspection scheduling workflow.

Display:

- Inspection ID.
- Project.
- Package.
- Inspection type.
- Assigned officer.
- Scheduled date.
- Priority.
- Current status.

Allow authorised demo users to:

- Schedule inspection.
- Assign officer.
- Change date.
- Add inspection instructions.
- Record completion.
- Escalate overdue inspections.

### 5.5 Field Inspection Register

Create a searchable table.

Columns:

- Inspection ID.
- Project.
- Package.
- Location.
- Date.
- Officer.
- Work activity.
- Progress reported.
- Progress verified.
- Findings.
- Status.
- Action.

### 5.6 Field Inspection Detail

When a user selects an inspection, show:

- Project details.
- Package details.
- Officer details.
- Contractor.
- Inspection date.
- Site location.
- Work activity.
- Progress reported.
- Progress verified.
- Observations.
- Photographs.
- GPS metadata, if available.
- Related quality findings.
- Related assets.
- Corrective actions.
- Follow-up date.

Support synthetic attachments and photographs.

Do not invent evidence for records where no attachment exists.

### 5.7 Physical Progress Verification

Create a comparison between:

- Contractor-reported progress.
- Engineer-reported progress.
- Verified physical progress.
- Planned progress.

Flag significant differences for review.

Use transparent calculations.

Do not allow AI to independently certify construction completion.

### 5.8 Field Issue Tracking

Categories:

- Workmanship issue.
- Road damage.
- Drainage issue.
- Material issue.
- Construction delay.
- Safety observation.
- Utility obstruction.
- Land access issue.
- Environmental concern.

Statuses:

- New.
- Assigned.
- Under Investigation.
- Contractor Action Required.
- Department Action Required.
- Verification Pending.
- Resolved.
- Closed.

Connect field issues to Quality, Departments, Land & Utility and Project 360.

### 5.9 AI Field Intelligence

Create a prominent panel:

AI Field Execution Intelligence

Identify:

- Repeated site observations.
- Projects with insufficient inspection coverage.
- Differences between reported and verified progress.
- Overdue field issues.
- Repeated contractor delays.
- Quality issues requiring reinspection.
- Assets requiring urgent attention.

Provide recommendations:

- Schedule another inspection.
- Request additional photographs.
- Assign an engineering officer.
- Escalate an unresolved field issue.
- Initiate quality reinspection.

Clearly identify the evidence behind every AI finding.

## 6. SCREEN THREE: ASSET MANAGEMENT INTELLIGENCE

Route: `#/assets`

### 6.1 Screen Header

Title:

Highway Infrastructure Asset Intelligence

Subtitle:

Asset inventory, condition monitoring, inspection history and maintenance planning.

Display:

- DEMO DATA indicator.
- Programme filter.
- District filter.
- Asset type.
- Condition.
- Maintenance status.
- Inspection status.
- Last updated timestamp.

### 6.2 Asset Executive Summary

Create KPI cards:

1. Total Assets.
2. Roads.
3. Bridges.
4. Culverts.
5. Assets Requiring Inspection.
6. Assets Requiring Maintenance.
7. Critical Asset Conditions.
8. Overdue Maintenance Activities.

Use synthetic records from the shared database.

### 6.3 Asset Categories

Support:

- Roads.
- Bridges.
- Flyovers.
- Culverts.
- Drainage systems.
- Retaining walls.
- Traffic infrastructure.
- Road safety infrastructure.
- Other highway structures.

### 6.4 Asset Register

Create a searchable asset register.

Columns:

- Asset ID.
- Asset name.
- Asset type.
- Project.
- District.
- Location.
- Installation or completion date.
- Current condition.
- Last inspection.
- Next inspection.
- Maintenance status.
- Responsible authority.

Support sorting, filtering, pagination and project navigation.

### 6.5 Asset Detail View

When an asset is selected, show:

- Asset profile.
- Project association.
- Package association.
- Asset type.
- Geographic location.
- Completion date.
- Current condition.
- Asset owner.
- Responsible authority.
- Inspection history.
- Defect history.
- Maintenance history.
- Related field observations.
- Related quality findings.
- Supporting documents.
- AI risk assessment.

### 6.6 Asset Condition Monitoring

Use condition categories:

- Good.
- Fair.
- Poor.
- Critical.
- Not Assessed.

Display condition distribution by:

- Asset type.
- District.
- Programme.
- Project.

Condition must be based on inspection records or explicitly labelled as a synthetic scenario.

### 6.7 Maintenance Management

Implement:

- Preventive maintenance scheduling.
- Corrective maintenance.
- Maintenance work orders.
- Inspection-based maintenance triggers.
- Maintenance assignments.
- Completion verification.
- Maintenance history.

Workflow:

Maintenance Identified → Work Order Created → Assigned → In Progress → Inspection → Verified → Closed.

Support overdue maintenance alerts.

### 6.8 AI Asset Intelligence

Create a prominent panel:

AI Asset Health and Maintenance Intelligence

Identify:

- Assets with repeated defects.
- Assets with overdue inspections.
- Assets with unresolved critical observations.
- Assets requiring preventive maintenance.
- Assets with worsening condition trends.
- Maintenance backlogs.

Generate recommendations based on inspection and maintenance history.

Do not claim structural failure or safety risk without sufficient evidence.

### 6.9 Asset Lifecycle

Show the asset lifecycle:

Planning → Construction → Completion → Handover → Operation → Inspection → Maintenance → Rehabilitation → Replacement.

Support asset lifecycle status and history.

Use synthetic lifecycle events.

## 7. Cross-Module Data Relationships

This is mandatory.

All three screens must use shared records.

Required relationships:

Project
├── Packages
├── Contractors
├── Field Inspections
├── Quality Inspections
├── Quality Findings
├── Corrective Actions
├── Infrastructure Assets
├── Asset Inspections
├── Maintenance Work Orders
├── AI Findings
└── Responsible Officials

Example scenario:

A synthetic highway package has a road-surface defect identified during a field inspection.

The system must:

1. Record the field inspection.
2. Create an engineering observation.
3. Create a quality finding.
4. Assign corrective action to the contractor.
5. Track the due date.
6. Schedule reinspection.
7. Record verification.
8. Update the associated asset condition when justified.
9. Update the contractor's quality history.
10. Update the project's AI risk assessment.
11. Make the issue visible in Project 360.
12. Make relevant anomaly information available to Leakage and Reports.

Do not duplicate findings across modules.

Use shared record IDs and relationships.

## 8. AI Capabilities and Technology

Implement AI-assisted features using the existing AI infrastructure.

Priority 1: Rule-based detection.

Rules should include:

- Repeated defects.
- Overdue corrective actions.
- Missing inspection evidence.
- Unusual differences in reported and verified progress.
- Assets with overdue inspections.
- Repeated maintenance requirements.
- High-severity unresolved findings.
- Quality defects recurring after closure.

Priority 2: AI explanations.

Use structured backend evidence to explain:

- Why a defect is important.
- Why an asset requires inspection.
- Why a corrective action is overdue.
- Why a project may need engineering intervention.

Priority 3: AI recommendations.

Suggest:

- Reinspection.
- Corrective action.
- Maintenance scheduling.
- Contractor clarification.
- Engineering review.
- Project escalation.

Priority 4: Executive summaries.

Provide concise intelligence summaries for Minister and Secretary workspaces.

Use deterministic calculations for all metrics.

Use LLMs for explanation and recommendations only.

If no LLM provider is configured, use deterministic fallback summaries.

Never invent inspection results or engineering certifications.

## 9. Backend and Database Requirements

Reuse existing models where appropriate.

Potential entities:

- field_inspections
- field_inspection_assignments
- field_observations
- inspection_attachments
- quality_inspections
- quality_findings
- non_conformance_reports
- material_tests
- corrective_actions
- reinspections
- infrastructure_assets
- asset_inspections
- asset_conditions
- maintenance_work_orders
- maintenance_history
- engineering_ai_findings

Do not create duplicate tables if equivalent models already exist.

Create or extend APIs for:

Quality:
- Quality summary.
- Inspection register.
- Inspection details.
- Defect register.
- Non-conformance reports.
- Material test records.
- Corrective actions.
- Reinspection.
- Contractor quality performance.

Field operations:
- Field summary.
- Inspection schedule.
- Inspection assignments.
- Field inspection register.
- Inspection details.
- Progress verification.
- Field issue tracking.
- Field intelligence.

Assets:
- Asset summary.
- Asset register.
- Asset details.
- Asset condition.
- Asset inspection history.
- Maintenance schedules.
- Work orders.
- Maintenance completion.
- Asset intelligence.

All APIs must use actual database queries.

Support filters, pagination, sorting, validation and error handling.

## 10. Frontend Requirements

All three screens must be visually complete.

Use the existing TN-HDOS design system.

Provide:

- Executive summary sections.
- Interactive charts.
- Searchable registers.
- Detail drawers.
- Tabs.
- Inspection workflows.
- Corrective-action workflows.
- Maintenance workflows.
- AI intelligence panels.
- Project navigation.
- Responsive layouts.
- Loading states.
- Error states.
- Empty states.

Do not overload users with too many cards.

Prioritise clear operational workflows.

## 11. Navigation Integration

Connect the screens to:

- `#/project-360`
- `#/leakage`
- `#/reports`
- `#/contractors`
- `#/departments`
- `#/land-utility`
- `#/finance`

Selecting a project, package, contractor, asset or finding should navigate to the relevant screen with the selected entity identified.

Preserve existing router conventions.

## 12. Security and Governance

Enforce existing backend RBAC.

Example roles:

- Minister.
- Secretary.
- Chief Engineer.
- Superintending Engineer.
- Executive Engineer.
- Assistant Executive Engineer.
- Assistant Engineer.
- Project Director.
- Quality Engineer.
- Field Engineer.
- Asset Manager.
- Contractor.
- Auditor.

Restrict sensitive actions.

Record:

- Inspection creation.
- Inspection updates.
- Quality finding creation.
- Corrective action assignments.
- Finding closure.
- Asset condition changes.
- Maintenance work order updates.

All changes must be auditable.

Do not allow contractors to approve their own quality findings or independently verify their own corrective actions.

## 13. Testing Requirements

Test:

1. Quality summary.
2. Inspection register.
3. Defect creation.
4. Corrective action assignment.
5. Reinspection.
6. Quality closure.
7. Material test display.
8. Contractor quality metrics.
9. Field inspection scheduling.
10. Field inspection updates.
11. Progress verification.
12. Field issue tracking.
13. Asset register.
14. Asset detail.
15. Asset condition history.
16. Maintenance scheduling.
17. Maintenance work order closure.
18. AI findings.
19. Cross-module relationships.
20. Backend RBAC.
21. Audit logging.
22. Project 360 integration.
23. Leakage integration.
24. Reports integration.

Include negative tests:

- A contractor cannot verify its own corrective action.
- An inspection cannot be closed without required information.
- An asset cannot be marked as inspected without an inspection record.
- Missing evidence must not be represented as verified.
- A field observation must not automatically certify project progress.
- A mock quality result must not be represented as an official certification.

Run regression tests after implementation.

## 14. Minister Demonstration Scenario

Create one coherent synthetic project scenario.

The Minister should be able to see:

1. A field engineer reports a road-surface defect.
2. An inspection record is created.
3. A quality finding is generated.
4. The contractor receives a corrective action.
5. The corrective action becomes overdue.
6. AI highlights the unresolved issue.
7. The associated asset is flagged for inspection.
8. A reinspection is scheduled.
9. The responsible engineering authority verifies the corrective action.
10. The asset condition is updated based on the inspection.
11. Project 360 reflects the issue and its resolution.
12. Reports reflects the quality and execution status.

All records must use the same synthetic IDs.

## 15. Final Acceptance Criteria

The implementation is complete only when:

- All three routes open without errors.
- All three screens display consistent mock data.
- Quality inspection workflows function.
- Field inspection workflows function.
- Asset management workflows function.
- Corrective action and maintenance workflows persist.
- AI summaries use backend evidence.
- Cross-module navigation works.
- Project 360 displays the related information.
- Leakage and Reports continue working.
- Backend RBAC is enforced.
- Audit history is maintained.
- Tests are executed.
- The Minister demonstration scenario works end to end.

## 16. Mandatory DONE VS PENDING REPORT

At the end, provide an evidence-based implementation report.

Use these statuses:

- DONE: Fully implemented and tested.
- PARTIALLY DONE: Some functionality exists but the workflow is incomplete.
- PENDING: Not implemented.
- BLOCKED: Cannot proceed due to a documented dependency.

### A. Quality Screen

| Feature | Status | Evidence |
|---|---|---|
| Quality executive dashboard | | |
| AI quality assessment | | |
| Inspection register | | |
| Defect register | | |
| Non-conformance management | | |
| Material testing | | |
| Corrective actions | | |
| Reinspection workflow | | |
| Contractor quality performance | | |
| Quality audit history | | |

### B. Field Operations Screen

| Feature | Status | Evidence |
|---|---|---|
| Field executive dashboard | | |
| Inspection scheduling | | |
| Inspection assignment | | |
| Field inspection register | | |
| Inspection details | | |
| Progress verification | | |
| Field issue tracking | | |
| Map integration | | |
| AI field intelligence | | |
| Field audit history | | |

### C. Assets Screen

| Feature | Status | Evidence |
|---|---|---|
| Asset executive dashboard | | |
| Asset register | | |
| Asset detail view | | |
| Asset condition monitoring | | |
| Asset inspection history | | |
| Maintenance scheduling | | |
| Maintenance work orders | | |
| Asset lifecycle | | |
| AI asset intelligence | | |
| Asset audit history | | |

### D. Cross-Module Integration

| Integration | Status | Evidence |
|---|---|---|
| Field inspection → Quality finding | | |
| Quality finding → Corrective action | | |
| Corrective action → Reinspection | | |
| Reinspection → Asset condition | | |
| Asset → Project 360 | | |
| Quality → Contractor performance | | |
| Field issue → Project 360 | | |
| AI finding → Leakage | | |
| Quality and asset KPIs → Reports | | |

### E. Final Summary

Provide:

**DONE**
- Fully implemented features with evidence.

**PARTIALLY DONE**
- Incomplete screens, APIs and workflows.

**PENDING**
- Features not yet implemented.

**BLOCKED**
- External integrations or technical dependencies.

**MOCK DATA COVERAGE**
- Record counts by entity.
- Cross-module relationship counts.
- Missing relationships.
- Data validation results.

**TEST RESULTS**
- Tests executed.
- Passed.
- Failed.
- Skipped.
- Regression status.

**KNOWN ISSUES**
- List actual defects and limitations.

**NEXT PHASE RECOMMENDATION**
- Identify the next most valuable combined implementation based on dependencies.

Do not report a screen as complete merely because it has been populated with mock cards or static tables.

## 17. Execution Instructions

Implement only these three screens.

Do not start Departments, Land & Utility, Finance or Contractors in this execution.

Preserve all existing working screens.

Use the shared mock-data architecture.

Complete backend, frontend, AI capabilities, workflows and tests.

Open all three routes and verify the major workflows.

Provide the mandatory DONE VS PENDING report.



# PROMPT 05: DEPARTMENTAL COORDINATION, LAND ACQUISITION & UTILITY INTELLIGENCE

## 1. Objective

Implement complete, connected and functional workspaces for:

- `#/departments`
- `#/land-utility`

The objective is to give the Minister, Secretary and departmental officers a unified view of interdepartmental dependencies, land acquisition progress, utility shifting, approval delays and project-level bottlenecks.

This must be a functional operating module, not a collection of static dashboards.

## 2. Mandatory Initial Assessment

Before making changes:

1. Inspect the complete repository structure.
2. Read `README.md`, architecture documentation and the implementation status of Phases 0–16.
3. Inspect existing models, APIs, services, mock data, RBAC, audit logging and routing.
4. Review the existing Project 360, Reports, Leakage, Quality, Field Operations and Assets implementations.
5. Identify reusable entities and existing relationships.
6. Identify unfinished functionality and technical constraints.

Do not duplicate existing models or seed duplicate records.

Preserve all working functionality. Do not perform unrelated refactoring.

## 3. Departmental Coordination Workspace

Complete `#/departments`.

### A. Department Overview

Provide:

- Total participating departments.
- Active interdepartmental dependencies.
- Pending approvals.
- Overdue approvals.
- Average approval turnaround time.
- Critical project blockers.
- Department-wise pending actions.
- Escalations requiring Secretary or Minister attention.

### B. Department Directory

Create a connected directory containing:

- Department name.
- Department category.
- Responsible organisation.
- Designation and role.
- Responsible officer.
- Jurisdiction.
- Contact details, using clearly identified synthetic data where necessary.
- Projects and packages associated with the department.
- Pending approvals and dependencies.
- Current responsibilities.

Use existing organisation and officer records wherever possible.

### C. Interdepartmental Dependency Register

Support dependencies involving departments such as:

- Highways and Minor Ports.
- Public Works.
- Revenue and Disaster Management.
- Tamil Nadu Generation and Distribution Corporation (TANGEDCO).
- Local bodies and municipal corporations.
- Water Resources Department.
- Forest Department.
- Environment and Climate Change Department.
- Telecommunications and utility agencies.
- Police and traffic authorities.
- Other relevant statutory authorities.

Do not assume every department participates in every project. Departmental involvement must be linked to an explicit dependency or approval record.

Each dependency must contain:

- Dependency ID.
- Project and package.
- Responsible department.
- Responsible officer or designation.
- Dependency type.
- Description.
- Date raised.
- Required completion date.
- Current status.
- Days pending.
- Criticality.
- Supporting documents.
- Upstream and downstream dependencies.
- Escalation level.
- Recommended next action.

### D. Approval Workflow

Implement:

- Approval submission.
- Document attachment or reference.
- Review and clarification.
- Approval or rejection.
- Return for correction.
- Assignment and reassignment.
- Escalation.
- Approval history.
- Time-based SLA tracking.

Enforce role-based permissions. AI must not approve or reject administrative decisions.

## 4. Land Acquisition Intelligence

Complete the land acquisition section within `#/land-utility`.

### A. Land Acquisition Overview

Show:

- Total projects with land requirements.
- Total land required.
- Land acquired.
- Land pending acquisition.
- Awards passed.
- Compensation paid.
- Compensation pending.
- Possession completed.
- Litigation-affected parcels.
- Critical land-related project blockers.

All quantities and financial calculations must be derived from underlying records.

### B. Land Parcel Register

Each parcel should contain:

- Parcel ID.
- Project and package.
- District.
- Taluk.
- Village.
- Survey number.
- Landowner reference, using synthetic identities.
- Land classification.
- Required area.
- Acquired area.
- Acquisition stage.
- Applicable legal provision.
- Notification date.
- Award date.
- Award amount.
- Compensation payment status.
- Possession status and date.
- Objections or disputes.
- Litigation reference, if applicable.
- Supporting documents.
- Responsible officer.
- Last updated date.

### C. Land Acquisition Workflow

Implement the lifecycle:

Identification → Survey → Notification → Objections → Valuation → Award → Compensation → Possession → Handover.

Show incomplete stages and identify the responsible authority.

Do not mark a parcel as acquired or possession-complete without supporting records.

### D. Land Acquisition Intelligence

Identify:

- Parcels delaying project milestones.
- Awards pending beyond their due dates.
- Compensation pending after award.
- Disputed survey numbers.
- Parcels affected by court orders.
- Missing documentation.
- Mismatches between required and acquired area.
- Parcels with incomplete possession records.

AI findings must include evidence, confidence, impact and recommended action. Do not make unsupported allegations.

## 5. Utility Shifting Intelligence

Create a dedicated utility shifting register.

Support categories such as:

- Electricity poles and transmission lines.
- Water pipelines.
- Sewage and drainage.
- Telecommunications cables.
- Gas pipelines.
- Other underground and overhead utilities.

Each utility record must contain:

- Utility ID.
- Project and package.
- Location or chainage.
- Utility category.
- Utility-owning organisation.
- Responsible officer or contact role.
- Number of affected assets.
- Estimated shifting cost.
- Approved cost.
- Fund allocation status.
- Application date.
- Joint inspection date.
- Approval status.
- Work order status.
- Physical shifting progress.
- Verification status.
- Target completion date.
- Actual completion date.
- Supporting evidence.
- Blocking project milestone.

Implement the lifecycle:

Identification → Joint Inspection → Estimate → Approval → Funding → Work Order → Shifting → Inspection → Verification → Closure.

Provide a clear view of which utility dependencies are blocking which projects.

## 6. GIS and Dependency Visualisation

Provide:

- Project-level land parcel map.
- Utility asset map.
- Departmental dependency view.
- Critical bottleneck highlighting.
- Project/package-level filtering.
- District and department filters.

Use synthetic coordinates only for demo records.

Clearly label synthetic map data. Do not present generated coordinates as actual government GIS data.

If a map provider is unavailable, provide a useful fallback view.

## 7. AI Intelligence Layer

Implement rule-based detection first, followed by LLM-generated explanations.

Required intelligence:

1. Land acquisition delays affecting project completion.
2. Utility shifting delays affecting construction milestones.
3. Departmental approvals exceeding defined SLAs.
4. Dependencies with no assigned responsible authority.
5. Multiple departments blocking the same milestone.
6. Inconsistent land area or compensation figures.
7. Missing approval or supporting documents.
8. Dependencies likely to affect contractual milestones.
9. Escalations requiring Secretary intervention.
10. Critical issues requiring Minister-level attention.

Every finding must include:

- Finding ID.
- Finding category.
- Affected project and package.
- Related parcel, utility or approval.
- Responsible department.
- Evidence references.
- Source and data status.
- Impact.
- Severity.
- Confidence.
- Recommended action.
- Suggested responsible role.
- Due date.
- Verification status.

Clearly distinguish verified facts, calculated values, AI inferences and predictions.

AI must remain advisory. It must not approve land acquisition, compensation, utility estimates or departmental decisions.

## 8. Cross-Module Integration

This is mandatory.

Connect these workspaces with existing modules:

| Existing module | Required integration |
|---|---|
| Project 360 | Display land, utility and departmental dependencies |
| Reports | Include department-wise and land/utility performance |
| Leakage | Surface evidence-backed anomalies and missing controls |
| Finance | Link compensation, utility estimates and payments |
| Contractors | Link utility and land dependencies to package milestones |
| Quality | Show dependencies affecting execution and inspection |
| Field Operations | Connect field observations to land and utility records |
| Legal/Compliance | Link litigation, statutory approvals and legal restrictions |
| Minister Workspace | Display critical bottlenecks and escalation actions |
| Secretary Workspace | Display pending approvals, ownership and departmental SLA |

Do not create disconnected copies of project, officer, department, parcel or package records.

## 9. Shared Synthetic Data

First inspect existing seed data.

Reuse existing records wherever possible. Add only missing records.

Target coverage, subject to existing data:

- 10 participating departments.
- 30 fictional officers or responsible designations.
- 12 projects.
- 20 packages.
- 50 land parcels.
- 30 land acquisition workflow records.
- 25 utility shifting records.
- 25 departmental dependencies.
- 30 approval records.
- 20 supporting document references.
- 15 AI findings.

All synthetic records must include:

- `data_mode: mock`
- `data_status: Seeded Demo`
- `source_type: synthetic`
- `generated_at`

Do not use real officials' names, actual contractor allegations, real court cases or unverified government figures as synthetic facts.

Where existing records contain extracted government information, preserve their original provenance and verification status.

## 10. Backend and Data Architecture

Implement or extend:

- Department model.
- DepartmentOfficer or Responsibility model.
- ProjectDepartmentDependency model.
- ApprovalWorkflow model.
- LandParcel model.
- LandAcquisitionStage model.
- CompensationRecord model.
- UtilityAsset model.
- UtilityShiftingWorkflow model.
- DependencyEvidence model.
- Escalation model.

Reuse existing models if they already exist.

Requirements:

- REST APIs with validation.
- Consistent error handling.
- Pagination and filtering.
- Search and sorting.
- Role-based access control.
- Audit logging.
- Data provenance.
- Referential integrity.
- Database migrations.
- Appropriate indexes.
- No duplicate seed data.

## 11. UI and User Experience

Build complete, usable screens.

Each workspace must include:

- Executive KPI section.
- Search and filters.
- Data tables with sorting and pagination.
- Record detail view.
- Workflow timeline.
- Evidence/document references.
- Responsible officer and department.
- Action register.
- AI intelligence panel.
- Escalation indicators.
- Links to related Project 360 records.

Use the existing design system and navigation.

Provide distinct views for:

- Minister: critical bottlenecks and decisions.
- Secretary: departmental coordination and escalations.
- Department officer: assigned dependencies and approvals.
- Project officer: project-specific land and utility progress.

Do not create separate duplicate datasets for each role.

## 12. Mandatory Minister Demonstration Scenario

Create one coherent synthetic demonstration scenario.

A highway project is delayed because:

1. One land parcel has an incomplete acquisition stage.
2. Compensation is pending.
3. A utility shifting activity is awaiting approval.
4. Two departments have unresolved dependencies.
5. A project milestone is at risk.

The system must demonstrate:

- Project-level impact.
- Responsible departments.
- Responsible officers or roles.
- Pending approvals.
- Land acquisition status.
- Utility shifting status.
- Evidence and supporting documents.
- AI-generated bottleneck assessment.
- Recommended actions.
- Escalation to the Secretary.
- Minister-level decision tracking.
- Updated status in Project 360 and Reports.

Use synthetic records only. Ensure the same entities appear across all connected modules.

## 13. Testing and Validation

Add automated tests for:

- Department and officer relationships.
- Dependency creation and assignment.
- Approval workflow transitions.
- SLA and overdue calculations.
- Role-based permissions.
- Land area calculations.
- Compensation status calculations.
- Parcel acquisition lifecycle.
- Utility shifting lifecycle.
- Missing evidence handling.
- Duplicate record prevention.
- Project milestone dependency links.
- Cross-module data consistency.
- Audit history.
- AI finding evidence references.

Negative tests are mandatory:

- An unauthorised user cannot approve a request.
- An approval cannot be closed without required evidence.
- A parcel cannot be marked possession-complete without a possession record.
- Compensation cannot be marked paid without a payment record.
- Utility shifting cannot be marked complete without verification.
- An AI recommendation cannot execute an administrative decision.
- Synthetic data cannot be presented as officially verified.

Run the complete existing test suite and new tests.

## 14. Documentation

Update:

- README.md.
- Architecture documentation.
- Data model documentation.
- API documentation.
- Route inventory.
- Phase implementation tracker.
- Mock data and provenance documentation.
- Known limitations.

Reconcile the phase numbering and status table. Do not claim completion based only on route availability.

## 15. Strict Implementation Rules

- Do not break existing modules.
- Do not overwrite existing verified data.
- Do not duplicate shared entities.
- Do not fabricate government records.
- Do not hardcode KPI values.
- Do not use LLMs for deterministic calculations.
- Do not expose sensitive information across roles.
- Do not make unsupported allegations.
- Do not mark placeholder screens as complete.
- Do not start Finance, Contractors, Digital Office or Citizen Services in this phase.

Implement the complete functionality, not just UI components.

## 16. Final Execution Report

At the end, provide a status matrix:

| Requirement | Status | Evidence |
|---|---|---|
| Department workspace | DONE / PARTIALLY DONE / PENDING / BLOCKED | Route, files and tests |
| Land acquisition | DONE / PARTIALLY DONE / PENDING / BLOCKED | Route, files and tests |
| Utility shifting | DONE / PARTIALLY DONE / PENDING / BLOCKED | Route, files and tests |
| AI intelligence | DONE / PARTIALLY DONE / PENDING / BLOCKED | Rules, evidence and tests |
| GIS integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Implementation evidence |
| Project 360 integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration evidence |
| Reports integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration evidence |
| RBAC and audit | DONE / PARTIALLY DONE / PENDING / BLOCKED | Tests and implementation |
| Documentation | DONE / PARTIALLY DONE / PENDING / BLOCKED | Updated files |

Also report:

1. Files created and modified.
2. Database models and migrations added or changed.
3. APIs implemented.
4. Existing records reused.
5. New synthetic records added.
6. Test results, including failures.
7. Routes visually tested.
8. Known limitations.
9. Security and data-quality concerns.
10. Recommended next phase.

Only report DONE when implementation and tests provide evidence. Otherwise report PARTIALLY DONE, PENDING or BLOCKED.

**Start with repository assessment, then implement in controlled steps. Do not stop after producing an implementation plan.**



# PROMPT 06: FINANCIAL MANAGEMENT, PROCUREMENT & CONTRACTOR INTELLIGENCE

## 1. Objective

Implement complete, connected and functional workspaces for:

- `#/finance`
- `#/contractors`

Build an integrated financial and contract management intelligence layer for TN-HDOS.

The system must connect:

**Programme → Project → Package → Tender → Contract → Contractor → Milestone → Measurement → Bill → Payment → Financial Performance**

This must be a functional operating module, not a static dashboard.

The Minister should be able to understand where public funds are allocated, committed, spent, held up or at risk.

The Secretary should be able to identify financial bottlenecks, delayed bills, contract variations, contractor performance issues and pending departmental actions.

## 2. Mandatory Initial Repository Assessment

Before implementation:

1. Inspect the complete repository.
2. Read `README.md`, architecture documentation and the phase implementation tracker.
3. Review existing project, package, contractor, tender, finance and payment models.
4. Inspect existing CKICP and TNRSP programme data.
5. Review Project 360, Reports, Leakage, Departments and Land & Utility integrations.
6. Identify existing APIs, database migrations, seed data, RBAC and audit functionality.
7. Identify duplicate or incomplete entities.

Reuse existing models and records. Do not create duplicate projects, packages, contractors or officers.

Preserve all working functionality.

## 3. Finance Workspace: `#/finance`

### A. Executive Financial Overview

Display dynamically calculated KPIs:

- Total approved project budget.
- Total administrative sanction.
- Total technical sanction.
- Total tendered value.
- Total awarded contract value.
- Total committed expenditure.
- Total expenditure.
- Total bills submitted.
- Total bills approved.
- Total payments released.
- Total outstanding payments.
- Unspent allocation.
- Budget utilisation percentage.
- Projects with financial risks.
- Delayed payments.
- Pending financial approvals.

Clearly distinguish budget, sanctioned amount, awarded value, committed expenditure, expenditure, bill value and actual payment.

Never treat these values as interchangeable.

### B. Project Financial Register

Each project should show:

- Project ID and name.
- Programme.
- District and division.
- Administrative sanction.
- Technical sanction.
- Revised sanction.
- Approved budget.
- Tender value.
- Contract value.
- Expenditure to date.
- Bills submitted.
- Bills approved.
- Payments released.
- Outstanding amount.
- Physical progress.
- Financial progress.
- Financial variance.
- Completion date.
- Current financial risk.

Provide project-level drill-down.

### C. Budget and Allocation Management

Implement:

- Original budget.
- Revised budget.
- Budget head.
- Funding source.
- Government allocation.
- Central assistance, where applicable.
- State allocation.
- External funding, where applicable.
- Fund release.
- Fund utilisation.
- Reallocation history.
- Unspent balance.
- Approval and sanction references.

Support year-wise and programme-wise financial views.

Do not invent funding sources or allocation amounts.

### D. Expenditure and Payment Register

Each financial transaction must contain:

- Transaction ID.
- Project and package.
- Contract reference.
- Contractor reference.
- Bill number.
- Bill type.
- Submitted date.
- Gross amount.
- Deductions.
- Net payable amount.
- Approval status.
- Payment status.
- Payment reference.
- Payment date.
- Treasury or IFMS reference, if available.
- Responsible approving authority.
- Supporting document references.
- Audit history.

Implement the workflow:

Bill Submission → Scrutiny → Measurement Verification → Technical Approval → Financial Approval → Payment Processing → Payment Confirmation.

Support rejected, returned, disputed and partially paid bills.

Do not mark a payment as released without a corresponding payment record.

### E. Financial Intelligence

Identify:

1. Budget utilisation significantly below planned progress.
2. Financial progress inconsistent with physical progress.
3. Bills pending beyond configured SLAs.
4. Payments pending after approval.
5. Duplicate bill references.
6. Unusual contract value changes.
7. Expenditure exceeding approved allocation.
8. Missing measurement or approval references.
9. Repeated bill resubmissions.
10. Unusual advance payments.
11. Unresolved deductions or recoveries.
12. Unexplained financial variances.

Use deterministic rules for calculations and anomaly detection.

AI may explain findings and suggest investigation steps. It must not declare fraud or wrongdoing without verified evidence.

## 4. Contractor and Procurement Workspace: `#/contractors`

### A. Contractor Overview

Display:

- Total registered contractors in the available dataset.
- Contractors with active contracts.
- Total awarded contract value.
- Active package count.
- Delayed packages.
- Contracts approaching completion.
- Contracts with pending bills.
- Contracts with unresolved variations.
- Contractor performance distribution.
- Contracts with unresolved quality issues.
- Contractual risk indicators.

Do not present synthetic contractors as real registered contractors.

### B. Contractor Directory

Each contractor record should include:

- Contractor ID.
- Contractor name.
- Registration category.
- Registration status.
- Registration validity.
- Contact details.
- Address.
- Relevant work categories.
- Associated projects.
- Awarded packages.
- Contract values.
- Work completed.
- Current workload.
- Pending milestones.
- Financial status.
- Quality performance.
- Dispute and litigation references, where verified.
- Source and verification status.

Use synthetic identities for demonstration records.

### C. Tender and Procurement Register

Create a complete tender lifecycle:

Tender Planning → Administrative Approval → Tender Publication → Bid Submission → Technical Evaluation → Financial Evaluation → Award → Agreement → Work Order.

Each tender should contain:

- Tender ID.
- Tender reference number.
- Project and package.
- Tendering authority.
- Estimated value.
- Publication date.
- Submission deadline.
- Bid opening date.
- Evaluation status.
- Award date.
- Selected contractor.
- Awarded value.
- Agreement reference.
- Work order reference.
- Supporting documents.
- Current status.

Include CKICP and TNRSP tender notices already extracted into the system. Preserve their original source URLs and verification status.

Do not infer tender awards from tender notices.

### D. Contract Register

Each contract must contain:

- Contract ID.
- Project and package.
- Tender reference.
- Contractor.
- Agreement number.
- Contract value.
- Start date.
- Original completion date.
- Revised completion date.
- Defects liability period.
- Performance security.
- Mobilisation advance.
- Retention amount.
- Liquidated damages provisions.
- Contract variation history.
- Extension of time history.
- Payment terms.
- Milestones.
- Current contract status.
- Supporting documents.

### E. Contractor Performance Intelligence

Calculate performance using measurable indicators:

- Planned versus actual physical progress.
- Milestone completion rate.
- Schedule variance.
- Quality inspection results.
- Non-conformance records.
- Corrective action closure rate.
- Safety observations.
- Bill submission and payment cycle.
- Contract variation frequency.
- Extension of time history.
- Defect rectification performance.

Provide a transparent performance score with visible component weights.

Do not create opaque AI-generated contractor rankings.

Do not label contractors as blacklisted, fraudulent or defaulting unless supported by verified official records.

## 5. Contract Milestone and Variation Management

Implement:

- Contract milestone register.
- Planned and actual dates.
- Completion percentage.
- Engineer verification.
- Evidence attachments.
- Delay reason.
- Responsible party.
- Extension of time requests.
- Approved and pending variations.
- Revised contract value.
- Revised completion date.
- Approval history.

Connect milestone delays with:

- Land acquisition.
- Utility shifting.
- Departmental approvals.
- Quality defects.
- Field inspection findings.
- Contractor dependencies.

A delay must not automatically be attributed to the contractor when external dependencies are responsible.

## 6. Financial and Contractor Leakage Intelligence

Integrate with the existing Leakage module.

Detect potential control failures and anomalies such as:

- Duplicate bills.
- Duplicate payment references.
- Payment exceeding approved bill value.
- Payment without required verification.
- Unexplained contract variation.
- Repeated time extensions.
- Milestone payment inconsistent with verified progress.
- Unresolved quality findings associated with payment milestones.
- Expenditure exceeding approved budget.
- Unusual advance payment patterns.
- Missing contractual documentation.
- Inconsistent project financial and physical progress.

Each finding must contain:

- Finding ID.
- Category.
- Project and package.
- Contract and contractor references.
- Financial amount involved, if calculable.
- Evidence references.
- Source and data status.
- Rule or detection method.
- Severity.
- Confidence.
- Potential impact.
- Recommended verification.
- Responsible authority.
- Due date.
- Investigation status.

Use the term **potential anomaly** until a competent authority verifies the finding.

## 7. Cross-Module Integration

This is mandatory.

| Existing module | Required integration |
|---|---|
| Project 360 | Display project budgets, contracts, expenditure and financial risks |
| Reports | Include financial and contractor performance reports |
| Leakage | Share evidence-backed financial and procurement anomalies |
| Departments | Link financial approvals to responsible departments |
| Land & Utility | Link compensation and utility shifting costs |
| Quality | Connect quality verification to payment milestones |
| Field Operations | Connect verified physical progress to milestone claims |
| Assets | Connect completed works to asset creation and lifecycle costs |
| Legal/Compliance | Link contract disputes, claims and litigation |
| Minister Workspace | Display major financial exposure and contract risks |
| Secretary Workspace | Display pending financial approvals and escalations |

Ensure the same project, package, contract, contractor and officer records are reused across modules.

## 8. Shared Data Model

Inspect and reuse existing entities before adding new ones.

Extend or implement:

- BudgetAllocation.
- FinancialSanction.
- FundingSource.
- ExpenditureRecord.
- BillRecord.
- PaymentRecord.
- FinancialApproval.
- Tender.
- TenderEvaluation.
- Contract.
- ContractMilestone.
- ContractVariation.
- ExtensionOfTime.
- Contractor.
- ContractorPerformance.
- FinancialEvidence.
- FinancialAnomaly.

Maintain:

- Referential integrity.
- Audit history.
- Source provenance.
- Version history.
- Role-based access.
- Appropriate database indexes.
- Validated financial calculations.

Use decimal or fixed-precision numeric types for financial amounts. Avoid floating-point errors.

## 9. Synthetic Data Requirements

Inspect existing records before adding data.

Reuse existing projects, packages, contractors and tender notices.

Target demonstration coverage, subject to existing records:

- 12 projects.
- 20 packages.
- 10 fictional contractors.
- 15 tender records.
- 20 contracts.
- 50 contract milestones.
- 100 financial transactions.
- 30 bill records.
- 25 payment records.
- 20 budget allocation records.
- 15 contract variation records.
- 15 financial AI findings.

Do not create duplicate entities to meet these targets.

Every synthetic record must contain:

- `data_mode: mock`
- `data_status: Seeded Demo`
- `source_type: synthetic`
- `generated_at`

All synthetic financial values must be internally consistent.

For example:

- A payment must reference an existing bill.
- A bill must reference an existing contract.
- A contract must reference an existing package.
- A package must reference an existing project.
- Cumulative payments must not exceed the corresponding approved payable amount unless an explicitly modelled exception exists.
- Contract variations must reconcile with revised contract value.

Use the same synthetic project in Finance, Contractors, Project 360, Reports and Leakage.

## 10. Integration Readiness

Prepare the architecture for future integration with:

- IFMS.
- Treasury payment systems.
- e-Procurement.
- Government accounting systems.
- Contract management systems.
- GIS.
- Document management systems.

Do not claim these systems are integrated unless an actual authenticated connection exists.

Implement integration adapters and clearly identified mock connectors where real credentials or APIs are unavailable.

Each integration should support:

- Source system.
- Connection status.
- Last successful synchronisation.
- Data freshness.
- Synchronisation errors.
- Reconciliation status.
- Audit logs.

Never fabricate successful external synchronisation.

## 11. UI and User Experience

Build complete workspaces with:

- Executive KPI sections.
- Search and filters.
- Sortable and paginated registers.
- Project and contractor drill-down.
- Financial transaction details.
- Contract lifecycle timeline.
- Approval workflow.
- Supporting documents.
- AI intelligence panel.
- Action register.
- Audit history.
- Export and print functionality where supported.

Provide role-specific views:

**Minister**
- Programme expenditure.
- Major financial risks.
- Contract performance.
- Significant pending decisions.

**Secretary**
- Financial approvals.
- Budget utilisation.
- Payment bottlenecks.
- Contract variations.
- Departmental escalations.

**Finance Officer**
- Bill scrutiny.
- Financial approvals.
- Payment reconciliation.
- Budget monitoring.

**Project Officer**
- Project expenditure.
- Contract milestones.
- Contractor progress.
- Pending measurements and bills.

**Procurement Officer**
- Tender lifecycle.
- Bid evaluation.
- Contract award.
- Contract documentation.

Enforce RBAC at the backend, not only through frontend visibility.

## 12. Mandatory Minister Demonstration Scenario

Create one coherent synthetic scenario.

A highway project has:

1. An approved project budget.
2. An awarded construction contract.
3. A contractor-submitted milestone bill.
4. A physical progress claim.
5. A field verification record showing lower actual progress.
6. An unresolved quality finding.
7. A pending utility shifting dependency.
8. A bill requiring further scrutiny.
9. A financial anomaly identified by deterministic rules.

The system must demonstrate:

- Project and package details.
- Original and revised contract values.
- Contractor performance.
- Planned versus actual progress.
- Bill and payment status.
- Quality and field evidence.
- Financial anomaly explanation.
- Responsible authority.
- Recommended verification action.
- Secretary-level escalation.
- Minister-level decision tracking.
- Updated Project 360 and Reports.

All records must be linked and synthetic.

## 13. Testing and Validation

Add automated tests for:

- Financial calculations.
- Budget utilisation.
- Expenditure reconciliation.
- Bill and payment relationships.
- Duplicate transaction detection.
- Contract value calculations.
- Contract variation calculations.
- Milestone completion.
- Contractor performance calculations.
- RBAC.
- Approval workflows.
- Audit history.
- Cross-module integration.
- Synthetic data consistency.
- Export functionality.

Mandatory negative tests:

- Payment cannot be recorded without a valid bill.
- A bill cannot exceed the contract's available approved value without an explicit variation or exception.
- A payment cannot exceed the approved payable amount without an authorised exception.
- A contractor cannot approve its own bill.
- An unverified physical milestone cannot trigger automatic payment approval.
- An AI finding cannot automatically block a payment.
- An unapproved contract variation cannot change the approved contract value.
- A tender notice cannot be represented as an awarded contract.
- Synthetic contractor data cannot be displayed as an official registration record.

Run the complete existing test suite and new tests.

## 14. Documentation

Update:

- README.md.
- Architecture documentation.
- Financial data model documentation.
- Procurement and contract lifecycle documentation.
- API documentation.
- Route inventory.
- Phase implementation tracker.
- Data provenance documentation.
- Integration readiness documentation.
- Known limitations.

Do not mark an external integration complete merely because an adapter or mock connector exists.

## 15. Strict Implementation Rules

- Do not break existing functionality.
- Do not overwrite verified records.
- Do not duplicate existing entities.
- Do not hardcode KPI values.
- Do not use LLMs for financial calculations.
- Do not invent government budgets or payments.
- Do not fabricate contractor registrations or tender awards.
- Do not make unsupported allegations.
- Do not allow AI to approve payments or contracts.
- Do not treat physical progress claims as engineer-verified progress.
- Do not start Digital Office, Citizen Services or Admin implementation in this phase.

Implement the backend, database, frontend, integrations, tests and documentation.

## 16. Final Execution Report

Provide the following status matrix:

| Requirement | Status | Evidence |
|---|---|---|
| Finance workspace | DONE / PARTIALLY DONE / PENDING / BLOCKED | Routes, files and tests |
| Budget management | DONE / PARTIALLY DONE / PENDING / BLOCKED | Models, APIs and tests |
| Bill and payment workflows | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow and tests |
| Contractor workspace | DONE / PARTIALLY DONE / PENDING / BLOCKED | Routes, files and tests |
| Tender management | DONE / PARTIALLY DONE / PENDING / BLOCKED | Models, APIs and tests |
| Contract lifecycle | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow and tests |
| Contractor performance | DONE / PARTIALLY DONE / PENDING / BLOCKED | Calculations and tests |
| Financial intelligence | DONE / PARTIALLY DONE / PENDING / BLOCKED | Rules and evidence |
| Leakage integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration evidence |
| Cross-module integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration tests |
| RBAC and audit | DONE / PARTIALLY DONE / PENDING / BLOCKED | Security tests |
| Documentation | DONE / PARTIALLY DONE / PENDING / BLOCKED | Updated files |

Also report:

1. Files created and modified.
2. Database models and migrations.
3. APIs implemented.
4. Existing records reused.
5. New synthetic records created.
6. Financial reconciliation results.
7. Automated test results and failures.
8. Routes visually tested.
9. External integrations actually connected versus mocked.
10. Known limitations and risks.
11. Recommended next phase.

Only report DONE when implementation and tests provide evidence. Otherwise report PARTIALLY DONE, PENDING or BLOCKED.

**Start with repository assessment, then implement in controlled steps. Do not stop after producing an implementation plan.**



# PROMPT 07: DIGITAL OFFICE, E-FILE MANAGEMENT & GOVERNMENT WORKFLOW INTELLIGENCE

## 1. Objective

Implement a complete Digital Office workspace at:

`#/digital-office`

Build a connected digital workflow system for the Highways Department and its associated project administration.

The system should allow authorised users to manage:

- Official correspondence.
- Incoming and outgoing communications.
- Digital files and file movement.
- Office notes.
- Draft proceedings.
- Approval workflows.
- Minister and Secretary decisions.
- Meeting minutes.
- Action items.
- Departmental references.
- Project-related documents.
- Escalations and reminders.
- Administrative audit trails.

This must be a functional workflow system, not a static document dashboard.

The objective is to establish traceability from an incoming communication to its final decision, responsible officer and completed action.

## 2. Mandatory Repository Assessment

Before implementation:

1. Inspect the complete repository.
2. Read `README.md`, architecture documentation and the implementation tracker.
3. Review existing authentication, RBAC, user, officer and department models.
4. Review Project 360, Reports, Departments, Land & Utility, Finance, Contractors, Legal and Compliance.
5. Inspect existing document storage, file references, audit logs and workflow APIs.
6. Identify existing reusable entities and incomplete implementations.

Do not duplicate existing models, document references or workflow functionality.

Preserve existing working modules.

## 3. Digital Office Executive Overview

Build a landing workspace with dynamically calculated KPIs:

- Total incoming communications.
- Unprocessed communications.
- Files currently under processing.
- Files pending officer action.
- Files pending departmental approval.
- Files pending Secretary approval.
- Files pending Minister decision.
- Overdue files.
- Files returned for clarification.
- Decisions issued.
- Pending action items.
- Completed action items.
- Average file processing time.
- Critical administrative bottlenecks.

Provide filters for:

- Date range.
- Department.
- Division.
- Project.
- Package.
- File category.
- Responsible officer.
- Workflow status.
- Priority.

Do not hardcode KPI values.

## 4. Incoming and Outgoing Correspondence

Create a correspondence register.

### A. Incoming Communications

Each record should include:

- Communication ID.
- Reference number.
- Received date.
- Sender organisation.
- Sender designation.
- Subject.
- Communication category.
- Related department.
- Related project or package.
- Priority.
- Confidentiality classification.
- Assigned officer.
- Current status.
- Due date.
- Attached document references.
- Related file reference.
- Action history.

Support:

- Registration.
- Classification.
- Assignment.
- Acknowledgement.
- File creation.
- Forwarding.
- Clarification request.
- Closure.

### B. Outgoing Communications

Support:

- Drafting.
- Review.
- Approval.
- Reference number allocation.
- Dispatch tracking.
- Recipient details.
- Dispatch date.
- Document attachment.
- Related incoming communication.
- Related file.
- Dispatch status.

Use synthetic correspondence records for demonstration.

Do not generate real government letter numbers or claim actual dispatch.

## 5. Government File Management

Implement a file register.

Each file should contain:

- File ID.
- Official file reference, if available.
- Subject.
- File category.
- Originating department.
- Current department.
- Originating officer.
- Current responsible officer.
- Related project and package.
- Related correspondence.
- Priority.
- Confidentiality level.
- Creation date.
- Last movement date.
- Current workflow stage.
- Pending action.
- Due date.
- Closure status.
- Document references.

### File Movement Register

Record every movement:

- From officer or department.
- To officer or department.
- Movement date and time.
- Reason for movement.
- Note or instruction.
- Expected action.
- Due date.
- Acknowledgement status.
- Receipt date.
- Movement status.

Provide a chronological file movement timeline.

A file must never lose its movement history.

## 6. Office Notes and Decision Workflow

Implement a structured note and approval workflow.

### A. Office Notes

Allow authorised users to:

- Create notes.
- Add background and context.
- Record facts and references.
- Add financial implications.
- Add legal or compliance implications.
- Add project impact.
- Recommend action.
- Attach supporting documents.
- Submit for review.

Clearly separate:

- Facts.
- Officer observations.
- Recommendations.
- AI-generated suggestions.
- Final decisions.

### B. Approval Workflow

Support configurable workflow stages:

Draft → Submitted → Section Review → Department Review → Secretary Review → Minister Decision, where applicable → Approved / Rejected / Returned → Action Issued → Closed.

The workflow must be configurable by file category and user permissions.

Not every file requires Minister approval.

Support:

- Approve.
- Reject.
- Return for clarification.
- Request additional documents.
- Reassign.
- Forward.
- Escalate.
- Record reason.
- Add decision remarks.

AI must never make or execute an administrative decision.

## 7. Minister and Secretary Decision Register

Create a decision register linked to office files.

Each decision should include:

- Decision ID.
- Related file.
- Decision authority.
- Decision date.
- Decision category.
- Decision statement.
- Approved action.
- Responsible department.
- Responsible officer or designation.
- Due date.
- Supporting documents.
- Implementation status.
- Compliance evidence.
- Closure date.

Provide separate views:

**Minister Workspace**
- Decisions awaiting attention.
- Critical proposals.
- Pending approvals.
- Decisions issued.
- Overdue implementation actions.
- High-impact escalations.

**Secretary Workspace**
- Files requiring review.
- Departmental approvals.
- Pending clarifications.
- Ministerial instructions.
- Decision implementation tracking.
- Overdue officer actions.

Integrate these views with existing Minister and Secretary workspaces.

## 8. Meeting Management and Minutes

Implement:

- Meeting calendar.
- Meeting title.
- Meeting category.
- Date and time.
- Participants.
- Departments represented.
- Related projects.
- Agenda.
- Meeting documents.
- Minutes.
- Decisions taken.
- Action items.
- Responsible officers.
- Due dates.
- Follow-up status.

Support meetings such as:

- Project review meetings.
- Departmental coordination meetings.
- Finance review meetings.
- Quality review meetings.
- Ministerial review meetings.
- Secretary-level review meetings.

Create a workflow:

Meeting → Minutes → Decisions → Action Items → Follow-up → Closure.

AI may summarise uploaded or entered meeting minutes and suggest action items. Every suggested action must be reviewed and confirmed by an authorised user before becoming an official task.

## 9. Action and Escalation Management

Build a unified action register.

Each action should include:

- Action ID.
- Originating file, decision or meeting.
- Description.
- Responsible department.
- Responsible officer.
- Priority.
- Created date.
- Due date.
- Status.
- Progress update.
- Evidence.
- Escalation level.
- Closure remarks.

Support:

- Assignment.
- Reassignment.
- Progress updates.
- Evidence submission.
- Review.
- Closure.
- Reopening.
- Escalation.

Implement configurable SLA rules.

Identify:

- Overdue actions.
- Repeatedly deferred actions.
- Actions without owners.
- Actions blocked by other departments.
- Actions affecting project milestones.
- Actions requiring Secretary attention.
- Actions requiring Minister attention.

Do not infer negligence or misconduct from overdue actions.

## 10. Document Management and Evidence Repository

Create a connected document repository.

Support document categories:

- Government orders.
- Administrative sanctions.
- Technical sanctions.
- Tender documents.
- Agreements.
- Bills and payment records.
- Land acquisition documents.
- Utility shifting approvals.
- Legal documents.
- Inspection reports.
- Correspondence.
- Meeting minutes.
- Office notes.
- Proceedings.
- Other project documents.

Each document record should contain:

- Document ID.
- Document title.
- Category.
- Reference number.
- Document date.
- Issuing authority.
- Project and package.
- Related file.
- Version.
- Source URL or storage reference.
- Uploading user.
- Upload date.
- Verification status.
- Confidentiality classification.
- Document checksum, where supported.
- Access history.

Implement:

- Version management.
- Document search.
- Metadata search.
- Access control.
- Duplicate detection.
- Document relationships.
- Audit history.

Do not expose confidential documents through unrestricted URLs.

If actual file storage is unavailable, implement metadata and mock document references. Clearly label them as demonstration records.

## 11. AI-Powered Digital Office Intelligence

Implement rule-based intelligence first and LLM assistance second.

Required capabilities:

1. Classify incoming correspondence.
2. Suggest the responsible department.
3. Suggest the relevant project and package.
4. Summarise long documents.
5. Extract dates, reference numbers and action items.
6. Identify missing supporting documents.
7. Detect duplicate correspondence.
8. Identify files pending beyond SLA.
9. Identify files repeatedly returned for clarification.
10. Summarise meeting minutes.
11. Generate draft action registers.
12. Identify related files and previous decisions.
13. Prepare Secretary-level briefing notes.
14. Prepare Minister-level decision summaries.
15. Identify decisions with overdue implementation actions.

Every AI-generated output must include:

- Source document or record.
- Relevant text or evidence reference.
- Confidence level.
- Extraction status.
- Human verification status.
- Generation timestamp.

AI must not:

- Approve or reject files.
- Issue official proceedings.
- Sign government communications.
- Allocate official reference numbers without an authorised workflow.
- Change government records without approval.
- Make legal conclusions.
- Send official communications automatically.

All AI-generated drafts must be reviewed by an authorised user.

## 12. Cross-Module Integration

This is mandatory.

| Existing module | Required integration |
|---|---|
| Project 360 | Link project files, decisions and actions |
| Reports | Include file movement, approval and action performance |
| Departments | Connect files to departments and responsible officers |
| Land & Utility | Link acquisition and utility approvals |
| Finance | Link sanctions, bills and financial approvals |
| Contractors | Link tender, contract and contractor correspondence |
| Quality | Link inspection reports and corrective action decisions |
| Field Operations | Link field reports and inspection records |
| Legal/Compliance | Link court documents, legal opinions and statutory references |
| Leakage | Link findings to evidence, investigation files and actions |
| Minister Workspace | Show proposals and decisions awaiting attention |
| Secretary Workspace | Show departmental files, approvals and escalations |

Use existing project, package, department, officer and document references.

## 13. Data Model and Backend

Inspect the current database architecture before adding models.

Extend or implement:

- Correspondence.
- GovernmentFile.
- FileMovement.
- OfficeNote.
- ApprovalWorkflow.
- ApprovalStep.
- DecisionRecord.
- Meeting.
- MeetingParticipant.
- MeetingMinutes.
- ActionItem.
- Escalation.
- DocumentRecord.
- DocumentVersion.
- DocumentRelationship.
- AIExtractionRecord.

Requirements:

- REST APIs.
- Input validation.
- Pagination.
- Filtering and search.
- Role-based permissions.
- Audit logging.
- Referential integrity.
- Database migrations.
- Version management.
- Consistent error handling.

Use transaction-safe workflows for approval and file movement operations.

## 14. Role-Based Access and Confidentiality

Implement role-specific access for:

- Minister.
- Secretary.
- Department Head.
- Chief Engineer.
- Superintending Engineer.
- Executive Engineer.
- Section Officer.
- Finance Officer.
- Legal Officer.
- Project Officer.
- System Administrator.

These are example role categories. Reuse the actual role structure in the existing application where available.

Requirements:

- Restrict confidential files.
- Enforce least-privilege access.
- Prevent unauthorised approval.
- Record access to sensitive documents.
- Maintain immutable workflow history.
- Separate read, write, review and approval permissions.
- Enforce permissions in backend APIs.

Do not rely only on frontend route protection.

## 15. Synthetic Data Requirements

Inspect existing records before seeding.

Reuse existing projects, departments and officers.

Target demonstration coverage, subject to existing data:

- 50 correspondence records.
- 20 government files.
- 60 file movement records.
- 30 office notes.
- 20 approval workflows.
- 15 decision records.
- 10 meetings.
- 30 action items.
- 50 document references.
- 15 AI intelligence findings.

Every synthetic record must contain:

- `data_mode: mock`
- `data_status: Seeded Demo`
- `source_type: synthetic`
- `generated_at`

Use fictional names and clearly labelled demonstration reference numbers.

Do not fabricate actual government orders, official correspondence, signatures, file numbers or decisions.

## 16. Mandatory Minister Demonstration Scenario

Create one connected synthetic workflow.

Scenario:

A highway project has a delayed land acquisition and utility shifting dependency.

1. An incoming communication is registered.
2. The communication is classified and assigned.
3. A government file is created.
4. The file is forwarded to the concerned department.
5. An officer submits an office note.
6. The note identifies land and utility dependencies.
7. Supporting records are attached.
8. The Secretary reviews the proposal.
9. The matter is escalated for a Minister-level decision, if required.
10. A decision is recorded.
11. Action items are assigned to responsible departments.
12. Officers update progress.
13. Evidence is submitted.
14. The action is reviewed and closed.
15. Project 360, Reports and Minister Workspace reflect the updated status.

The entire workflow must be traceable through one connected set of records.

All data must be synthetic.

## 17. Testing and Validation

Add automated tests for:

- Correspondence registration.
- File creation.
- File movement history.
- Note submission.
- Approval workflow transitions.
- Decision tracking.
- Meeting and minutes workflows.
- Action assignment.
- SLA calculations.
- Document versioning.
- Confidentiality permissions.
- Role-based access.
- Audit history.
- AI extraction provenance.
- Cross-module relationships.

Mandatory negative tests:

- An unauthorised officer cannot approve a file.
- A user cannot access a confidential file without permission.
- A closed file cannot be silently modified.
- A file movement cannot be deleted from its history.
- An AI-generated recommendation cannot become an official decision automatically.
- A meeting summary cannot create official action items without human confirmation.
- An official communication cannot be marked dispatched without dispatch evidence.
- A document cannot be represented as officially verified without verification evidence.

Run all existing and new tests.

## 18. UI and Visual Validation

Build a complete responsive interface using the existing design system.

Required sections:

- Digital Office Overview.
- Correspondence Register.
- File Register.
- File Movement.
- Office Notes.
- Approval Workflows.
- Decision Register.
- Meeting Management.
- Action Register.
- Document Repository.
- AI Office Intelligence.

Validate:

- Desktop layout.
- Navigation.
- Search and filters.
- Record detail views.
- Workflow transitions.
- Role-based screens.
- Empty and error states.
- Document access controls.

Do not leave placeholder screens.

## 19. Documentation

Update:

- README.md.
- Architecture documentation.
- Digital Office workflow documentation.
- Data model documentation.
- API documentation.
- RBAC matrix.
- Route inventory.
- Phase implementation tracker.
- Document provenance and security documentation.
- Known limitations.

## 20. Strict Implementation Rules

- Do not break existing modules.
- Do not duplicate project, department, officer or document records.
- Do not fabricate official government records.
- Do not expose confidential documents.
- Do not allow AI to approve or issue decisions.
- Do not allow silent modification of file movement history.
- Do not hardcode KPIs.
- Do not mark mock records as officially verified.
- Do not send real emails or official communications.
- Do not start Citizen Services or Admin implementation in this phase.

Implement complete backend, frontend, APIs, workflows, tests and documentation.

## 21. Final Execution Report

Provide this status matrix:

| Requirement | Status | Evidence |
|---|---|---|
| Digital Office overview | DONE / PARTIALLY DONE / PENDING / BLOCKED | Route and tests |
| Correspondence management | DONE / PARTIALLY DONE / PENDING / BLOCKED | APIs and tests |
| File management | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow and tests |
| Office notes and approvals | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow and tests |
| Minister and Secretary decisions | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration evidence |
| Meeting management | DONE / PARTIALLY DONE / PENDING / BLOCKED | Implementation evidence |
| Action and escalation management | DONE / PARTIALLY DONE / PENDING / BLOCKED | APIs and tests |
| Document repository | DONE / PARTIALLY DONE / PENDING / BLOCKED | Security and tests |
| AI office intelligence | DONE / PARTIALLY DONE / PENDING / BLOCKED | Evidence and tests |
| Cross-module integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration tests |
| RBAC and confidentiality | DONE / PARTIALLY DONE / PENDING / BLOCKED | Security tests |
| Documentation | DONE / PARTIALLY DONE / PENDING / BLOCKED | Updated files |

Also report:

1. Files created and modified.
2. Database models and migrations.
3. APIs implemented.
4. Existing records reused.
5. New synthetic records added.
6. Workflow scenarios tested.
7. RBAC and confidentiality test results.
8. Routes visually tested.
9. Test failures and known limitations.
10. Recommended next phase.

Only report DONE when implementation and tests provide evidence. Otherwise report PARTIALLY DONE, PENDING or BLOCKED.

**Start with repository assessment, then implement in controlled steps. Do not stop after producing an implementation plan.**


# PROMPT 08: CITIZEN SERVICES, PUBLIC GRIEVANCE & COMMUNITY IMPACT INTELLIGENCE

## 1. Objective

Implement a complete Citizen Services and Public Grievance Intelligence workspace at:

`#/citizen-services`

The objective is to connect citizen complaints and public infrastructure issues with the responsible Highways Department officials, projects, contractors, field inspections and corrective actions.

This must be an operational grievance management system, not a static complaint dashboard.

The system should help the Minister and Secretary answer:

- What problems are citizens reporting?
- Which roads, bridges and infrastructure assets are affected?
- Which projects or contractors are responsible?
- Which complaints remain unresolved?
- Which complaints are repeatedly reported?
- Which departments need to act?
- What evidence confirms that an issue has been resolved?
- Which public infrastructure problems require urgent attention?

## 2. Mandatory Initial Assessment

Before implementation:

1. Inspect the entire repository.
2. Read README.md and the phase implementation tracker.
3. Review existing Project 360, Reports, Field Operations, Quality, Assets, Departments, Land & Utility, Finance, Contractors, Digital Office and Leakage modules.
4. Inspect existing project, package, asset, officer, department, contractor and grievance-related models.
5. Review APIs, authentication, RBAC, audit logging and mock data.
6. Identify reusable components and unfinished functionality.
7. Verify the implementation status of Prompts 01–07 from actual code, tests and README evidence.

Do not duplicate existing entities.

Preserve existing working functionality.

Do not assume that an earlier prompt was implemented merely because it was issued.

## 3. Citizen Services Executive Overview

Build dynamically calculated KPIs:

- Total grievances received.
- New grievances.
- Under review.
- Assigned grievances.
- Pending field verification.
- Pending departmental action.
- Resolved grievances.
- Rejected or invalid grievances.
- Overdue grievances.
- Average resolution time.
- Reopened grievances.
- Repeat complaints.
- High-priority public safety complaints.
- District-wise grievance distribution.

Support filters for:

- Date range.
- District.
- Division.
- Taluk.
- Village or locality.
- Project.
- Road or asset.
- Grievance category.
- Severity.
- Responsible department.
- Assigned officer.
- Contractor.
- Current status.

All KPI values must be derived from database records.

## 4. Citizen Grievance Registration

Implement a grievance registration workflow.

Each grievance must include:

- Grievance ID.
- Reference number.
- Submission date.
- Citizen name or anonymous identifier.
- Contact details, where voluntarily provided.
- Submission channel.
- Grievance category.
- Description.
- District.
- Taluk.
- Village or locality.
- Road name or reference.
- Chainage or location reference, if available.
- GPS coordinates, if supplied.
- Related project.
- Related asset.
- Photo or document evidence.
- Priority.
- Privacy classification.
- Consent status.
- Current status.

Support submission through:

- Web form.
- Officer-entered complaint.
- Field officer submission.
- Imported grievance reference.
- External integration adapter.

Do not claim integration with an external citizen grievance portal unless an actual connection exists.

Support anonymous complaints where permitted by the configured policy.

Avoid collecting unnecessary personal information.

## 5. Grievance Categories

Implement configurable categories relevant to Highways Department operations:

1. Potholes and damaged roads.
2. Road surface deterioration.
3. Bridge damage.
4. Drainage and waterlogging.
5. Roadside encroachment.
6. Road safety concerns.
7. Missing or damaged signboards.
8. Street lighting and electrical issues.
9. Construction-related inconvenience.
10. Dust and environmental concerns.
11. Delayed infrastructure works.
12. Unsafe diversions.
13. Pedestrian and accessibility issues.
14. Roadside asset damage.
15. Land acquisition-related complaints.
16. Other infrastructure-related complaints.

Allow authorised administrators to configure categories.

## 6. Grievance Classification and Routing

Implement rule-based classification and AI-assisted routing.

The system should recommend:

- Responsible department.
- Relevant division.
- Responsible officer or designation.
- Related project.
- Related contractor.
- Related road or asset.
- Required field inspection.
- Suggested priority.
- Target resolution SLA.

Routing must be configurable.

AI recommendations must be reviewed by an authorised user where required.

A grievance must not be automatically attributed to a contractor or officer without supporting evidence.

## 7. Grievance Lifecycle Management

Implement the following lifecycle:

Submitted → Registered → Classified → Assigned → Under Review → Field Verification → Departmental Action → Resolution Submitted → Resolution Verified → Closed.

Additional statuses:

- Rejected.
- Duplicate.
- Reopened.
- Awaiting Citizen Information.
- Escalated.
- Transferred.

Every transition must be recorded.

Each grievance must maintain:

- Status history.
- Assignment history.
- Officer remarks.
- Citizen communication history.
- Field inspection references.
- Supporting evidence.
- Resolution remarks.
- Closure authority.
- Closure date.

Do not permit silent deletion or modification of grievance history.

## 8. Field Verification and Corrective Action

Connect grievances with Field Operations, Quality and Assets.

A grievance requiring physical verification should generate or link to a field inspection.

Capture:

- Inspection ID.
- Grievance ID.
- Inspector.
- Inspection date.
- Location.
- Observations.
- Severity.
- Photographs.
- Evidence.
- Related asset.
- Related project and package.
- Recommended corrective action.
- Responsible authority.
- Target completion date.

Support:

- Inspection scheduling.
- Field observations.
- Corrective action assignment.
- Contractor response, where applicable.
- Reinspection.
- Verification.
- Closure recommendation.

A complaint must not be marked resolved merely because an officer entered a closure remark.

Require appropriate verification evidence.

## 9. Public Safety Prioritisation

Implement a transparent priority model.

Consider:

- Risk to life and public safety.
- Road accessibility.
- Traffic impact.
- Infrastructure damage.
- Number of affected locations.
- Complaint frequency.
- Age of complaint.
- Available field evidence.

Use clear priority levels:

- Critical.
- High.
- Medium.
- Low.

Critical safety issues should trigger an escalation workflow.

The priority score must be explainable. Show the factors that contributed to it.

Do not allow an LLM to independently determine emergency severity without defined rules and human review.

## 10. Repeat Complaint and Geographic Intelligence

Identify:

- Repeated complaints at the same location.
- Multiple complaints concerning the same road segment.
- Recurring pothole locations.
- Repeated drainage problems.
- Repeated complaints against the same infrastructure asset.
- Grievances linked to ongoing construction.
- Complaints recurring after closure.
- Areas with high unresolved grievance density.

Use location matching with appropriate tolerance and confidence.

Do not merge complaints automatically where locations are uncertain.

Provide:

- District-wise distribution.
- Project-wise distribution.
- Road-segment distribution.
- Category-wise trends.
- Repeat complaint hotspots.
- Resolution performance trends.

Use synthetic coordinates for demo records and label them clearly.

## 11. Citizen Communication

Implement a communication register.

Support:

- Acknowledgement.
- Status updates.
- Clarification requests.
- Resolution notifications.
- Reopening notifications.

Maintain communication history.

Prepare notification adapters for email, SMS and supported messaging services.

Use mock notification delivery when external credentials are unavailable.

Do not claim a notification was delivered unless the provider confirms delivery.

Do not send real messages during demonstration testing.

## 12. SLA and Escalation Intelligence

Configure SLAs by grievance category and priority.

Track:

- Registration time.
- Assignment time.
- First response time.
- Inspection due date.
- Resolution due date.
- Actual resolution time.
- Reopening frequency.
- Escalation history.

Identify:

- Unassigned grievances.
- Overdue inspections.
- Overdue corrective actions.
- Repeatedly reopened complaints.
- Complaints without supporting evidence.
- Critical complaints awaiting action.
- Departments with high pending grievance volumes.

Escalate based on configured rules.

Do not infer misconduct from delayed grievance resolution.

## 13. AI-Powered Citizen Intelligence

Implement rule-based analytics first, followed by LLM-assisted analysis.

Required capabilities:

1. Classify grievance descriptions.
2. Extract location references.
3. Suggest related projects and assets.
4. Detect potential duplicate complaints.
5. Summarise complaint histories.
6. Identify recurring public infrastructure problems.
7. Recommend field verification.
8. Identify overdue actions.
9. Summarise district-level complaint trends.
10. Generate Secretary-level grievance briefings.
11. Generate Minister-level public issue summaries.
12. Identify potential project execution issues based on complaint patterns.

Every AI finding must contain:

- Finding ID.
- Related grievance references.
- Project or asset reference.
- Evidence references.
- Source and data status.
- Detection method.
- Confidence.
- Severity.
- Potential impact.
- Recommended action.
- Responsible authority.
- Verification status.

Clearly distinguish citizen allegations, verified field observations, calculated trends and AI inferences.

AI must not automatically reject complaints, assign blame, close grievances or issue official instructions.

## 14. Cross-Module Integration

Mandatory integration:

| Existing module | Required integration |
|---|---|
| Project 360 | Show grievances affecting each project |
| Reports | Include public grievance performance |
| Field Operations | Generate or link field inspections |
| Quality | Link verified defects and corrective actions |
| Assets | Link complaints to roads, bridges and infrastructure assets |
| Departments | Route grievances to responsible departments |
| Land & Utility | Connect relevant acquisition and utility complaints |
| Contractors | Link construction-related complaints to contracts and packages |
| Finance | Connect approved corrective work to financial records where appropriate |
| Leakage | Surface repeated control failures and evidence-backed anomalies |
| Digital Office | Create administrative files for grievances requiring formal decisions |
| Minister Workspace | Show critical public issues and unresolved hotspots |
| Secretary Workspace | Show departmental SLA performance and escalations |

Use shared project, package, department, officer and asset records.

Do not create duplicate copies.

## 15. Citizen Privacy and Security

Implement:

- Personal data minimisation.
- Consent tracking.
- Access controls.
- Role-based permissions.
- Restricted personal information.
- Secure document access.
- Audit logs.
- Retention policy configuration.
- Data masking in public and executive views.
- Separate public complaint details from internal officer remarks.

Do not expose citizen phone numbers, email addresses or personal details in public dashboards.

Do not expose confidential information through document URLs.

Enforce permissions at backend API level.

## 16. Backend and Data Model

Inspect existing models before adding new ones.

Extend or implement:

- Grievance.
- GrievanceCategory.
- GrievanceAssignment.
- GrievanceStatusHistory.
- GrievanceEvidence.
- GrievanceCommunication.
- FieldVerification.
- GrievanceCorrectiveAction.
- GrievanceEscalation.
- GrievanceSLA.
- GrievanceLocation.
- GrievanceAIInsight.

Requirements:

- REST APIs.
- Request validation.
- Pagination.
- Search and filters.
- Database migrations.
- Referential integrity.
- RBAC.
- Audit logging.
- Secure file handling.
- Consistent error handling.

Use transaction-safe status transitions.

## 17. Synthetic Data Requirements

Inspect existing shared seed data first.

Reuse existing projects, packages, assets, departments, officers and contractors.

Target demonstration coverage, subject to existing records:

- 100 synthetic grievances.
- 15 grievance categories.
- 12 projects.
- 30 linked assets.
- 30 field inspections.
- 25 corrective actions.
- 20 repeat complaint clusters.
- 15 escalation records.
- 20 citizen communication records.
- 15 AI intelligence findings.

Do not duplicate shared entities.

Every synthetic record must contain:

- `data_mode: mock`
- `data_status: Seeded Demo`
- `source_type: synthetic`
- `generated_at`

Use fictional citizen identities and synthetic contact details.

Do not use real citizens' personal data.

## 18. Mandatory Minister Demonstration Scenario

Create one connected synthetic scenario.

A citizen reports a damaged road section creating a safety risk.

The system must demonstrate:

1. Grievance registration.
2. Classification and priority recommendation.
3. Project and road asset identification.
4. Department and officer assignment.
5. Field inspection scheduling.
6. Inspection evidence submission.
7. Quality finding creation.
8. Corrective action assignment.
9. Contractor involvement, where supported by contract records.
10. Reinspection and verification.
11. Citizen status notification using mock delivery.
12. Grievance closure.
13. Project 360 update.
14. Reports update.
15. Minister and Secretary dashboard update.

Also demonstrate a repeat complaint hotspot that requires higher-level review.

All data must be synthetic and linked across modules.

## 19. Testing and Validation

Add automated tests for:

- Grievance registration.
- Category classification.
- Assignment and routing.
- Workflow transitions.
- SLA calculations.
- Priority calculations.
- Duplicate detection.
- Location matching.
- Field inspection integration.
- Corrective action lifecycle.
- Reopening.
- Escalation.
- Notification adapter behaviour.
- Privacy and data masking.
- RBAC.
- Audit history.
- Cross-module consistency.

Mandatory negative tests:

- A grievance cannot be closed without required verification.
- An unauthorised user cannot access personal information.
- A duplicate complaint must not be silently deleted.
- An AI recommendation cannot automatically reject a grievance.
- A contractor cannot verify its own corrective action.
- A citizen notification cannot be marked delivered without provider confirmation.
- A synthetic grievance cannot be presented as a real citizen complaint.
- An unverified complaint cannot be presented as a proven contractor or officer failure.

Run all existing and new tests.

## 20. UI and Visual Validation

Build a complete responsive workspace with:

- Executive Overview.
- Grievance Register.
- Grievance Detail.
- Registration Form.
- Assignment and Routing.
- Field Verification.
- Corrective Actions.
- Repeat Complaint Intelligence.
- Geographic Hotspots.
- SLA and Escalations.
- Citizen Communication.
- AI Intelligence.

Validate all routes, filters, workflows, details, permissions, empty states and error states.

Do not leave placeholder components.

## 21. Documentation

Update:

- README.md.
- Architecture documentation.
- Grievance lifecycle documentation.
- Data model documentation.
- API documentation.
- RBAC and privacy matrix.
- Route inventory.
- Phase implementation tracker.
- Mock data provenance.
- Integration readiness.
- Known limitations.

## 22. Strict Implementation Rules

- Do not break existing modules.
- Do not duplicate shared entities.
- Do not fabricate real citizen complaints.
- Do not expose personal information.
- Do not automatically close grievances.
- Do not make unsupported allegations.
- Do not use LLMs for deterministic calculations.
- Do not claim external portal integration without a working connection.
- Do not claim notification delivery without provider confirmation.
- Do not mark synthetic data as officially verified.
- Do not start Admin implementation in this phase.

Implement complete backend, frontend, APIs, workflows, tests and documentation.

## 23. Final Execution Report

### A. Implementation status

| Requirement | Status | Evidence |
|---|---|---|
| Citizen Services workspace | DONE / PARTIALLY DONE / PENDING / BLOCKED | Route and tests |
| Grievance registration | DONE / PARTIALLY DONE / PENDING / BLOCKED | API and tests |
| Assignment and routing | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow evidence |
| Field verification | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration tests |
| Corrective actions | DONE / PARTIALLY DONE / PENDING / BLOCKED | Workflow tests |
| Geographic intelligence | DONE / PARTIALLY DONE / PENDING / BLOCKED | GIS evidence |
| AI intelligence | DONE / PARTIALLY DONE / PENDING / BLOCKED | Rules and evidence |
| Citizen communication | DONE / PARTIALLY DONE / PENDING / BLOCKED | Adapter tests |
| Privacy and RBAC | DONE / PARTIALLY DONE / PENDING / BLOCKED | Security tests |
| Cross-module integration | DONE / PARTIALLY DONE / PENDING / BLOCKED | Integration tests |
| Documentation | DONE / PARTIALLY DONE / PENDING / BLOCKED | Updated files |

### B. Previous phase verification

Audit Prompts 01–07 against actual repository evidence.

For each phase, report:

- Previously claimed status.
- Actual implementation status.
- Functional routes.
- Backend APIs.
- Database models.
- Automated tests.
- Visual verification.
- Missing functionality.
- Remaining blockers.

Use only these statuses:

- DONE.
- PARTIALLY DONE.
- PENDING.
- BLOCKED.

A route existing does not mean the module is complete. A passing test does not establish data accuracy. A mock integration does not count as a live integration.

### C. Final summary

Report:

1. Files created and modified.
2. Models and migrations.
3. APIs implemented.
4. Shared records reused.
5. Synthetic records added.
6. Tests passed and failed.
7. Routes visually tested.
8. Security and privacy findings.
9. Known limitations.
10. Updated phase tracker.
11. Recommended next phase.

**Start with repository assessment. Implement in controlled steps. Do not stop after producing a plan.**



