# Architecture Decision Records (ADR)

## ADR-001: Modular Monolith vs. Microservices
- **Status**: Accepted
- **Context**: Government highway operations involve atomic transactions across budget sanctions, inter-departmental clearances, and contractor assignments.
- **Decision**: Adopt a modular monolith built on FastAPI and SQLAlchemy with clear bounded contexts.
- **Consequences**: Eliminates distributed transaction latency and simplifies local deployment while maintaining clean separation of concerns.

## ADR-002: Dual-Mode Database Support (SQLite for Dev, PostgreSQL/PostGIS for Prod)
- **Status**: Accepted
- **Context**: Developers and evaluators need to run the application immediately without local PostgreSQL installations, while production requires PostGIS geospatial queries.
- **Decision**: Use SQLAlchemy abstraction configured to SQLite by default (`sqlite:///./tn_hdos.db`) with complete compatibility for PostgreSQL/PostGIS through environment variable `DATABASE_URL`.
- **Consequences**: Immediate zero-friction evaluation; production can point to cloud-managed PostgreSQL with PostGIS enabled.

## ADR-003: Highway Classification Color Tokens (DESIGN.md Alignment)
- **Status**: Accepted
- **Context**: The Tamil Nadu Highways Department employs standard color codes for road tiers.
- **Decision**: Hardcode official hex colors into Tailwind config (`tnh-sh`: `#006A4E`, `tnh-nh`: `#FFCC00`, `tnh-mdr`: `#004B87`, `tnh-odr`: `#D1197E`, `tnh-rural`: `#FF6600`).
- **Consequences**: Immediate visual recognition of road classifications across badges, progress cards, and data tables.

## ADR-004: Server-Side Contractor Isolation
- **Status**: Accepted
- **Context**: Contractors must only view their own contracts and must be strictly denied access to competitor data.
- **Decision**: Enforce filtering at the database query level (`Project.contractor_id == user.contractor_id`) and raise HTTP 403 Forbidden on direct ID access attempts.
- **Consequences**: Guarantees data privacy and passes all automated RBAC security tests.

