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

# Phase 2 Executive Command Centre Entities

class LeadershipIssue(Base):
    __tablename__ = "leadership_issues"
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    issue_reference = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(250), nullable=False)
    district = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    problem_description = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=False)
    responsible_officer = Column(String(150), nullable=False)
    responsible_external_dept = Column(String(150), nullable=True)
    contractor_name = Column(String(150), nullable=True)
    days_pending = Column(Integer, default=0)
    schedule_impact_days = Column(Integer, default=0)
    financial_exposure_cr = Column(Float, default=0.0)
    evidence_available = Column(String(200), nullable=True)
    recommended_action = Column(Text, nullable=False)
    escalation_level = Column(String(50), default="SECRETARIAT_ESCALATED")  # ZONE_ESCALATED, SECRETARIAT_ESCALATED, MINISTERIAL_ESCALATED
    priority = Column(String(20), default="CRITICAL")
    status = Column(String(50), default="Action in Progress")
    date_raised = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project")

class LeadershipDecision(Base):
    __tablename__ = "leadership_decisions"
    id = Column(Integer, primary_key=True, index=True)
    decision_reference = Column(String(50), unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    leadership_issue_id = Column(Integer, ForeignKey("leadership_issues.id"), nullable=True)
    required_decision = Column(String(250), nullable=False)
    assigned_authority = Column(String(150), nullable=False)
    supporting_evidence = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, ASSIGNED_FOR_REVIEW, COORDINATION_FORWARDED, INVESTIGATION_RECOMMENDED, DECIDED, CLOSED
    action_type = Column(String(100), nullable=False)  # REVIEW, REQUEST_EVIDENCE, FORWARD_COORDINATION, INVESTIGATION, ESCALATE, RECORD_DECISION
    escalation_history = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    project = relationship("Project")
    created_by_user = relationship("User")

class InterdepartmentalBlocker(Base):
    __tablename__ = "interdepartmental_blockers"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    department_category = Column(String(100), nullable=False)  # Forest, Revenue (LA), Police/Traffic, TANGEDCO, TWAD, Telecom, Corporation, Panchayat, Environmental, Legal
    approval_required = Column(String(250), nullable=False)
    submission_date = Column(DateTime, nullable=True)
    latest_correspondence = Column(String(250), nullable=True)
    responsible_highways_officer = Column(String(150), nullable=False)
    external_contact = Column(String(200), nullable=True)
    days_pending = Column(Integer, default=0)
    expected_timeline = Column(String(100), nullable=True)
    reason_for_delay = Column(Text, nullable=False)
    supporting_documents = Column(String(250), nullable=True)
    recommended_action = Column(Text, nullable=False)
    status = Column(String(50), default="BLOCKED")  # BLOCKED, ADVANCED_STAGE, CLEARED
    
    project = relationship("Project")

class FinancialLeakageFinding(Base):
    __tablename__ = "financial_leakage_findings"
    id = Column(Integer, primary_key=True, index=True)
    finding_code = Column(String(50), unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category = Column(String(100), nullable=False)  # Measurement and Bill Mismatch, Duplicate Bill Indicator, Rate Deviation, Unreconciled Advance, Budget Utilisation Anomaly, Unjustified Variation, Retention/Security Defect, Repeated Maintenance Expenditure, Procurement Irregularity
    title = Column(String(250), nullable=False)
    potential_exposure_cr = Column(Float, default=0.0)
    verified_loss_cr = Column(Float, default=0.0)
    verified_recovery_cr = Column(Float, default=0.0)
    prevented_expenditure_cr = Column(Float, default=0.0)
    evidence_summary = Column(Text, nullable=False)
    calculation_details = Column(Text, nullable=False)
    confidence = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    validation_status = Column(String(50), default="INVESTIGATION_INDICATOR")  # INVESTIGATION_INDICATOR, VERIFIED, INFERRED, TO_VALIDATE
    responsible_officer = Column(String(150), nullable=False)
    recommended_investigation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project")

class QualityDefectRecord(Base):
    __tablename__ = "quality_defect_records"
    id = Column(Integer, primary_key=True, index=True)
    defect_code = Column(String(50), unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    road_id = Column(Integer, ForeignKey("roads.id"), nullable=True)
    bridge_id = Column(Integer, ForeignKey("bridges.id"), nullable=True)
    defect_type = Column(String(100), nullable=False)  # Open NCR, Critical Road Defect, Bridge Inspection Observation, Repeated Pothole Repair, Material Testing Failure, Overdue Inspection
    chainage_km = Column(Float, nullable=True)
    severity = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM
    observation_notes = Column(Text, nullable=False)
    lab_report_ref = Column(String(100), nullable=True)  # e.g., HRS Guindy Report #HRS-2026-441
    corrective_action_status = Column(String(50), default="PENDING_RECTIFICATION")  # PENDING_RECTIFICATION, RE-INSPECTED, RECTIFIED_CLOSED
    responsible_engineer = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project")
    road = relationship("Road")
    bridge = relationship("Bridge")

class ContractorEvaluation(Base):
    __tablename__ = "contractor_evaluations"
    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    performance_score = Column(Float, default=85.0)  # 0 to 100
    behind_schedule_days = Column(Integer, default=0)
    repeated_defects_count = Column(Integer, default=0)
    delayed_submissions_count = Column(Integer, default=0)
    time_extension_requests = Column(Integer, default=0)
    performance_security_expiry = Column(DateTime, nullable=True)
    claims_disputes_cr = Column(Float, default=0.0)
    performance_tier = Column(String(20), default="SATISFACTORY")  # EXCELLENT, SATISFACTORY, UNDER_SCRUTINY, CRITICAL_NOTICE
    assessment_notes = Column(Text, nullable=True)
    
    contractor = relationship("Contractor")
    project = relationship("Project")

class LegalMatter(Base):
    __tablename__ = "legal_matters"
    id = Column(Integer, primary_key=True, index=True)
    case_reference = Column(String(100), unique=True, index=True, nullable=False)  # e.g., W.P. No. 24891/2025 Madras High Court
    court_forum = Column(String(100), nullable=False)  # High Court of Madras, National Green Tribunal (SZ), District Court, Sole Arbitrator
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    matter_type = Column(String(100), nullable=False)  # Land Acquisition Compensation, Environmental Clearance Challenge, Contract Dispute, Arbitration, Injunction
    plaintiff_petitioner = Column(String(200), nullable=False)
    respondent = Column(String(200), nullable=False)
    case_summary = Column(Text, nullable=False)
    interim_stay_in_force = Column(Boolean, default=False)
    next_hearing_date = Column(DateTime, nullable=True)
    statutory_deadline = Column(DateTime, nullable=True)
    ag_audit_para_ref = Column(String(100), nullable=True)  # Linked Accountant General audit para
    is_confidential = Column(Boolean, default=False)
    responsible_legal_officer = Column(String(150), nullable=False)
    status = Column(String(50), default="PENDING_COUNTER")  # PENDING_COUNTER, ARGUMENTS_STAGE, RESERVED_FOR_ORDERS, DISPOSED
    
    project = relationship("Project")

class ZonePerformanceSnapshot(Base):
    __tablename__ = "zone_performance_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    reporting_period = Column(String(50), default="FY 2025-26")
    completed_projects_pct = Column(Float, default=0.0)
    average_project_delay_days = Column(Integer, default=0)
    budget_utilisation_pct = Column(Float, default=0.0)
    quality_defects_count = Column(Integer, default=0)
    pending_approvals_count = Column(Integer, default=0)
    land_acquisition_pending_ha = Column(Float, default=0.0)
    contractor_performance_score = Column(Float, default=80.0)
    issue_resolution_avg_days = Column(Integer, default=30)
    cohort_sample_size = Column(Integer, default=10)
    data_completeness_pct = Column(Float, default=95.0)
    
    zone = relationship("Zone")
