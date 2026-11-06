import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Table
)
from sqlalchemy.orm import relationship
from app.database import Base

# Association Table: Role <-> Permission
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    tier = Column(String(50), default="OPERATIONAL")  # LEADERSHIP, EXECUTIVE, FIELD, EXTERNAL, CITIZEN
    
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    module = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)  # view, create, edit, submit, review, recommend, approve, authorise, close, export
    
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    contact_email = Column(String(100), nullable=True)
    is_external = Column(Boolean, default=False)  # False for Highways, True for TANGEDCO, Revenue, TWAD, etc.
    
    users = relationship("User", back_populates="department")
    projects = relationship("Project", back_populates="executing_department")

class Organisation(Base):
    __tablename__ = "organisations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    org_type = Column(String(50), nullable=False)  # CONTRACTOR, CONSULTANT, VENDOR, UTILITY_AGENCY
    registration_no = Column(String(100), nullable=True)
    contact_email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)  # e.g., Chennai Zone, Madurai Zone, Salem Zone
    headquarters = Column(String(100), nullable=True)
    
    circles = relationship("Circle", back_populates="zone")
    projects = relationship("Project", back_populates="zone")

class Circle(Base):
    __tablename__ = "circles"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)  # e.g., Chengalpattu Circle, Tirunelveli Circle
    
    zone = relationship("Zone", back_populates="circles")
    divisions = relationship("Division", back_populates="circle")
    projects = relationship("Project", back_populates="circle")

class Division(Base):
    __tablename__ = "divisions"
    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)  # e.g., Tambaram Division, Madurai North
    
    circle = relationship("Circle", back_populates="divisions")
    subdivisions = relationship("Subdivision", back_populates="division")
    projects = relationship("Project", back_populates="division")

class Subdivision(Base):
    __tablename__ = "subdivisions"
    id = Column(Integer, primary_key=True, index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    
    division = relationship("Division", back_populates="subdivisions")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    username = Column(String(80), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    role = relationship("Role", back_populates="users")
    department = relationship("Department", back_populates="users")
    contractor = relationship("Contractor", back_populates="users")
    official_profile = relationship("Official", back_populates="user", uselist=False)

class Official(Base):
    __tablename__ = "officials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    employee_code = Column(String(50), unique=True, nullable=False)
    designation = Column(String(100), nullable=False)
    cadre = Column(String(50), nullable=True)
    current_posting = Column(String(150), nullable=False)
    active_from = Column(DateTime, default=datetime.datetime.utcnow)
    active_to = Column(DateTime, nullable=True)  # For tenure historical tracking
    
    user = relationship("User", back_populates="official_profile")
    responsibilities = relationship("StakeholderResponsibility", back_populates="official")

class Contractor(Base):
    __tablename__ = "contractors"
    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    registration_number = Column(String(80), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    class_category = Column(String(20), default="Class I")  # Class I (Unlimited), Class II, etc.
    pan = Column(String(20), nullable=True)
    gst = Column(String(25), nullable=True)
    validity_date = Column(DateTime, nullable=True)
    is_blacklisted = Column(Boolean, default=False)
    
    organisation = relationship("Organisation")
    users = relationship("User", back_populates="contractor")
    contracts = relationship("Contract", back_populates="contractor")
    projects = relationship("Project", back_populates="contractor")

class Consultant(Base):
    __tablename__ = "consultants"
    id = Column(Integer, primary_key=True, index=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    empanelment_number = Column(String(80), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    domain_expertise = Column(String(100), nullable=False)  # DPR Preparation, Quality Audit, Structural Design
    
    organisation = relationship("Organisation")

class Road(Base):
    __tablename__ = "roads"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., SH-49, NH-45, MDR-102
    name = Column(String(200), nullable=False)
    road_type = Column(String(20), nullable=False)  # SH, NH, MDR, ODR, RURAL
    start_chainage = Column(Float, default=0.0)
    end_chainage = Column(Float, default=0.0)
    total_length_km = Column(Float, default=0.0)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=True)
    
    bridges = relationship("Bridge", back_populates="road")
    projects = relationship("Project", back_populates="road")

class Bridge(Base):
    __tablename__ = "bridges"
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=False)
    bridge_code = Column(String(50), unique=True, index=True, nullable=False)
    bridge_name = Column(String(200), nullable=False)
    bridge_type = Column(String(50), nullable=False)  # ROB (Railway Overbridge), Major Bridge, Minor Bridge, Flyover, Causeway
    chainage_km = Column(Float, default=0.0)
    span_meters = Column(Float, default=0.0)
    river_or_rail_crossing = Column(String(150), nullable=True)
    condition_score = Column(Float, default=85.0)  # 0 to 100
    
    road = relationship("Road", back_populates="bridges")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=True)
    road_type = Column(String(20), default="SH")  # SH, NH, MDR, ODR, RURAL
    
    estimated_cost_cr = Column(Float, default=0.0)
    sanctioned_cost_cr = Column(Float, default=0.0)
    expenditure_to_date_cr = Column(Float, default=0.0)
    
    physical_progress_pct = Column(Float, default=0.0)
    financial_progress_pct = Column(Float, default=0.0)
    
    status = Column(String(50), default="IN_PROGRESS")  # SANCTIONED, TENDERED, IN_PROGRESS, DELAYED, COMPLETED
    priority = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    
    start_date = Column(DateTime, nullable=True)
    target_completion_date = Column(DateTime, nullable=True)
    actual_completion_date = Column(DateTime, nullable=True)
    
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    
    executing_department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    road = relationship("Road", back_populates="projects")
    zone = relationship("Zone", back_populates="projects")
    circle = relationship("Circle", back_populates="projects")
    division = relationship("Division", back_populates="projects")
    executing_department = relationship("Department", back_populates="projects")
    contractor = relationship("Contractor", back_populates="projects")
    
    work_packages = relationship("WorkPackage", back_populates="project")
    contracts = relationship("Contract", back_populates="project")
    stakeholders = relationship("ProjectStakeholder", back_populates="project")
    dependencies = relationship("DepartmentDependency", back_populates="project")
    approvals = relationship("Approval", back_populates="project")
    issues = relationship("Issue", back_populates="project")
    documents = relationship("Document", back_populates="project")

class WorkPackage(Base):
    __tablename__ = "work_packages"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    package_number = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    scope_description = Column(Text, nullable=True)
    cost_cr = Column(Float, default=0.0)
    start_km = Column(Float, default=0.0)
    end_km = Column(Float, default=0.0)
    status = Column(String(50), default="ACTIVE")
    
    project = relationship("Project", back_populates="work_packages")
    contracts = relationship("Contract", back_populates="work_package")

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    work_package_id = Column(Integer, ForeignKey("work_packages.id"), nullable=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    agreement_number = Column(String(100), unique=True, nullable=False)
    agreement_date = Column(DateTime, nullable=True)
    contract_value_cr = Column(Float, default=0.0)
    performance_security_cr = Column(Float, default=0.0)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, EXTENDED, TERMINATED, COMPLETED
    
    project = relationship("Project", back_populates="contracts")
    work_package = relationship("WorkPackage", back_populates="contracts")
    contractor = relationship("Contractor", back_populates="contracts")

class ProjectStakeholder(Base):
    __tablename__ = "project_stakeholders"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    stakeholder_type = Column(String(50), nullable=False)  # REVENUE, ELECTRICITY_TANGEDCO, FOREST, WATER_TWAD, RAILWAY, CITIZEN_REPRESENTATIVE
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=True)
    contact_person = Column(String(150), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    
    project = relationship("Project", back_populates="stakeholders")
    responsibilities = relationship("StakeholderResponsibility", back_populates="stakeholder")

class StakeholderResponsibility(Base):
    __tablename__ = "stakeholder_responsibilities"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    stakeholder_id = Column(Integer, ForeignKey("project_stakeholders.id"), nullable=True)
    official_id = Column(Integer, ForeignKey("officials.id"), nullable=True)
    responsibility_scope = Column(Text, nullable=False)
    from_date = Column(DateTime, default=datetime.datetime.utcnow)
    to_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=True)
    
    stakeholder = relationship("ProjectStakeholder", back_populates="responsibilities")
    official = relationship("Official", back_populates="responsibilities")

class DepartmentDependency(Base):
    __tablename__ = "department_dependencies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    requesting_dept_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    target_dept_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    dependency_type = Column(String(100), nullable=False)  # Land Acquisition, EB Pole Shifting, TWAD Pipe Relocation, Forest Clearance, Railway General Arrangement Drawing (GAD)
    description = Column(Text, nullable=False)
    impact_days = Column(Integer, default=0)
    target_clearance_date = Column(DateTime, nullable=True)
    actual_clearance_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, ESCALATED, CLEARED, REJECTED
    
    project = relationship("Project", back_populates="dependencies")
    requesting_dept = relationship("Department", foreign_keys=[requesting_dept_id])
    target_dept = relationship("Department", foreign_keys=[target_dept_id])

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    approval_type = Column(String(100), nullable=False)  # Administrative Sanction (AS), Technical Sanction (TS), Revised Estimate, CRIDP Approval
    reference_number = Column(String(100), unique=True, nullable=False)
    sanction_amount_cr = Column(Float, default=0.0)
    approved_by_role = Column(String(100), nullable=False)
    parent_approval_id = Column(Integer, ForeignKey("approvals.id"), nullable=True)
    status = Column(String(50), default="APPROVED")  # SUBMITTED, RECOMMENDED, APPROVED, REVISED, REJECTED
    approval_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="approvals")

class Issue(Base):
    __tablename__ = "issues"
    id = Column(Integer, primary_key=True, index=True)
    issue_reference = Column(String(50), unique=True, index=True, nullable=False)  # e.g., ISS-2026-001
    category = Column(String(100), nullable=False)  # Land Acquisition, Utility Relocation, Contractor Delay, Quality Non-conformance, Material Shortage, Legal Injunction
    description = Column(Text, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    priority = Column(String(20), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), default="New")  # New, Under Review, Assigned, Action in Progress, Awaiting External Department, Awaiting Evidence, Resolved, Closed, Reopened
    assigned_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_resolution_date = Column(DateTime, nullable=True)
    escalation_status = Column(String(50), default="NORMAL")  # NORMAL, ZONE_ESCALATED, SECRETARIAT_ESCALATED
    resolution_notes = Column(Text, nullable=True)
    closure_evidence = Column(Text, nullable=True)
    
    project = relationship("Project", back_populates="issues")
    assigned_to_user = relationship("User")
    documents = relationship("Document", back_populates="issue")
    tasks = relationship("WorkflowTask", back_populates="issue")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    document_title = Column(String(200), nullable=False)
    file_name = Column(String(200), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    sha256_hash = Column(String(64), nullable=False)
    uploader_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    uploader = relationship("User")
    project = relationship("Project", back_populates="documents")
    issue = relationship("Issue", back_populates="documents")
    evidence_records = relationship("EvidenceRecord", back_populates="document")

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    evidence_type = Column(String(50), nullable=False)  # Geo-tagged Photo, Drone Orthomosaic, Lab Test Cube Report, Inspection Joint Note
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    chainage_km = Column(Float, nullable=True)
    captured_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_by_official_id = Column(Integer, ForeignKey("officials.id"), nullable=True)
    
    document = relationship("Document", back_populates="evidence_records")

class WorkflowTask(Base):
    __tablename__ = "workflow_tasks"
    id = Column(Integer, primary_key=True, index=True)
    task_reference = Column(String(50), unique=True, index=True, nullable=False)  # e.g., TSK-2026-001
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(String(20), default="MEDIUM")
    status = Column(String(50), default="Assigned")  # Assigned, In Progress, Submitted, Approved, Rejected, Completed
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    issue = relationship("Issue", back_populates="tasks")
    project = relationship("Project")
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_user_id])
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # ALERT, APPROVAL, DEPENDENCY, TASK
    is_read = Column(Boolean, default=False)
    reference_url = Column(String(250), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(150), nullable=False)
    actor_role = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)  # LOGIN, CREATE, UPDATE, SUBMIT, APPROVE, RESOLVE, CLOSE, EXPORT
    entity_type = Column(String(100), nullable=False)  # PROJECT, ISSUE, WORKFLOW_TASK, APPROVAL, DOCUMENT
    entity_id = Column(Integer, nullable=True)
    entity_reference = Column(String(100), nullable=True)
    changes_json = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    actor = relationship("User")

