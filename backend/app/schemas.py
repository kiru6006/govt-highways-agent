from typing import Optional, List, Any
import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_info: dict

class TokenData(BaseModel):
    username: Optional[str] = None
    role_code: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# User & Role Schemas
class PermissionOut(BaseModel):
    id: int
    code: str
    name: str
    module: str
    action: str

    class Config:
        from_attributes = True

class RoleOut(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    tier: str
    permissions: List[PermissionOut] = []

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    role_code: str
    role_name: str
    department_name: Optional[str] = None
    zone_id: Optional[int] = None
    circle_id: Optional[int] = None
    division_id: Optional[int] = None
    contractor_id: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True

# Jurisdiction & Departments
class DepartmentOut(BaseModel):
    id: int
    code: str
    name: str
    contact_email: Optional[str] = None
    is_external: bool

    class Config:
        from_attributes = True

class OrganisationOut(BaseModel):
    id: int
    name: str
    org_type: str
    registration_no: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class ZoneOut(BaseModel):
    id: int
    code: str
    name: str
    headquarters: Optional[str] = None

    class Config:
        from_attributes = True

class CircleOut(BaseModel):
    id: int
    zone_id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class DivisionOut(BaseModel):
    id: int
    circle_id: int
    code: str
    name: str

    class Config:
        from_attributes = True

# Roads & Assets
class RoadOut(BaseModel):
    id: int
    code: str
    name: str
    road_type: str
    start_chainage: float
    end_chainage: float
    total_length_km: float

    class Config:
        from_attributes = True

class BridgeOut(BaseModel):
    id: int
    bridge_code: str
    bridge_name: str
    bridge_type: str
    chainage_km: float
    span_meters: float
    river_or_rail_crossing: Optional[str] = None
    condition_score: float

    class Config:
        from_attributes = True

# Projects
class ProjectCreate(BaseModel):
    project_code: str
    title: str
    description: Optional[str] = None
    road_id: Optional[int] = None
    road_type: str = "SH"
    estimated_cost_cr: float
    sanctioned_cost_cr: float
    zone_id: int
    circle_id: int
    division_id: int
    executing_department_id: int
    contractor_id: Optional[int] = None
    priority: str = "HIGH"

class ProjectOut(BaseModel):
    id: int
    project_code: str
    title: str
    description: Optional[str] = None
    road_type: str
    estimated_cost_cr: float
    sanctioned_cost_cr: float
    expenditure_to_date_cr: float
    physical_progress_pct: float
    financial_progress_pct: float
    status: str
    priority: str
    zone_id: int
    circle_id: int
    division_id: int
    contractor_id: Optional[int] = None
    contractor_name: Optional[str] = None
    road_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Contractors & Officials
class ContractorOut(BaseModel):
    id: int
    registration_number: str
    company_name: str
    class_category: str
    pan: Optional[str] = None
    gst: Optional[str] = None
    is_blacklisted: bool

    class Config:
        from_attributes = True

class OfficialOut(BaseModel):
    id: int
    user_id: int
    employee_code: str
    full_name: str
    designation: str
    cadre: Optional[str] = None
    current_posting: str
    active_from: datetime.datetime

    class Config:
        from_attributes = True

# Dependencies
class DependencyOut(BaseModel):
    id: int
    project_id: int
    project_title: Optional[str] = None
    requesting_dept_name: str
    target_dept_name: str
    dependency_type: str
    description: str
    impact_days: int
    status: str
    target_clearance_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class DependencyCreate(BaseModel):
    project_id: int
    requesting_dept_id: int
    target_dept_id: int
    dependency_type: str
    description: str
    impact_days: int = 0
    target_clearance_date: Optional[datetime.datetime] = None

# Issues & Workflows
class IssueCreate(BaseModel):
    project_id: int
    category: str
    description: str
    priority: str = "MEDIUM"
    department_id: Optional[int] = None
    assigned_to_user_id: Optional[int] = None
    target_resolution_date: Optional[datetime.datetime] = None

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    closure_evidence: Optional[str] = None
    escalation_status: Optional[str] = None

class IssueOut(BaseModel):
    id: int
    issue_reference: str
    category: str
    description: str
    project_id: int
    project_title: Optional[str] = None
    priority: str
    status: str
    escalation_status: str
    assigned_to_name: Optional[str] = None
    assigned_date: datetime.datetime
    target_resolution_date: Optional[datetime.datetime] = None
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True

class WorkflowTaskCreate(BaseModel):
    project_id: int
    issue_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    assigned_to_user_id: int
    priority: str = "MEDIUM"
    due_date: Optional[datetime.datetime] = None

class WorkflowTaskOut(BaseModel):
    id: int
    task_reference: str
    project_id: int
    project_title: Optional[str] = None
    issue_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime.datetime] = None
    assigned_to_name: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Documents & Evidence
class DocumentOut(BaseModel):
    id: int
    document_title: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    uploader_name: Optional[str] = None
    project_id: Optional[int] = None
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Audit
class AuditEventOut(BaseModel):
    id: int
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    entity_reference: Optional[str] = None
    changes_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Ask AI
class AskAIRequest(BaseModel):
    query: str
    screen_context: Optional[str] = "Dashboard"
    selected_record_type: Optional[str] = None
    selected_record_id: Optional[int] = None
    conversation_history: Optional[List[dict]] = []

class AskAIResponse(BaseModel):
    answer: str
    suggested_actions: List[str]
    grounding_references: List[dict]
    is_demo: bool = True
    disclaimer: str


# Phase 2 Executive Command Centre Schemas

class ExecutiveKPIsOut(BaseModel):
    # 16 Mandated KPIs
    total_active_projects: int
    total_approved_project_value_cr: float
    total_expenditure_cr: float
    total_physical_progress_pct: float
    projects_delayed: int
    projects_high_risk: int
    pending_approvals: int
    pending_land_acquisition_ha: float
    pending_utility_shifting_count: int
    open_quality_defects: int
    pending_contractor_obligations: int
    open_legal_cases: int
    unresolved_audit_observations: int
    potential_financial_exposure_cr: float
    verified_financial_recovery_cr: float
    verified_prevented_expenditure_cr: float

    # Reporting context
    reporting_period: str = "FY 2025-26"
    data_freshness: str = "Live Operational Telemetry"
    cohort_sample_size: int = 14
    is_demo: bool = True

class PortfolioStageItem(BaseModel):
    stage: str
    count: int
    cost_cr: float
    avg_progress_pct: float

class ZoneComparisonOut(BaseModel):
    zone_id: int
    zone_code: str
    zone_name: str
    headquarters: str
    active_projects_count: int
    completed_projects_pct: float
    average_project_delay_days: int
    budget_utilisation_pct: float
    quality_defects_count: int
    pending_approvals_count: int
    land_acquisition_pending_ha: float
    contractor_performance_score: float
    cohort_sample_size: int
    data_completeness_pct: float

class CriticalLeadershipIssueOut(BaseModel):
    id: int
    issue_reference: str
    project_id: int
    project_title: str
    district: str
    category: str
    problem_description: str
    root_cause: str
    responsible_officer: str
    responsible_external_dept: Optional[str] = None
    contractor_name: Optional[str] = None
    days_pending: int
    schedule_impact_days: int
    financial_exposure_cr: float
    evidence_available: Optional[str] = None
    recommended_action: str
    escalation_level: str
    priority: str
    status: str
    date_raised: datetime.datetime

class InterdepartmentalBlockerOut(BaseModel):
    id: int
    project_id: int
    project_title: str
    department_category: str
    approval_required: str
    submission_date: Optional[datetime.datetime] = None
    latest_correspondence: Optional[str] = None
    responsible_highways_officer: str
    external_contact: Optional[str] = None
    days_pending: int
    expected_timeline: Optional[str] = None
    reason_for_delay: str
    supporting_documents: Optional[str] = None
    recommended_action: str
    status: str

class FinancialLeakageOut(BaseModel):
    id: int
    finding_code: str
    project_id: int
    project_title: str
    category: str
    title: str
    potential_exposure_cr: float
    verified_loss_cr: float
    verified_recovery_cr: float
    prevented_expenditure_cr: float
    evidence_summary: str
    calculation_details: str
    confidence: str
    validation_status: str
    responsible_officer: str
    recommended_investigation: str
    created_at: datetime.datetime

class QualityDefectOut(BaseModel):
    id: int
    defect_code: str
    project_id: int
    project_title: str
    road_code: Optional[str] = None
    defect_type: str
    chainage_km: Optional[float] = None
    severity: str
    observation_notes: str
    lab_report_ref: Optional[str] = None
    corrective_action_status: str
    responsible_engineer: str
    created_at: datetime.datetime

class ContractorEvaluationOut(BaseModel):
    id: int
    contractor_id: int
    contractor_name: str
    project_id: int
    project_title: str
    performance_score: float
    behind_schedule_days: int
    repeated_defects_count: int
    delayed_submissions_count: int
    time_extension_requests: int
    claims_disputes_cr: float
    performance_tier: str
    assessment_notes: Optional[str] = None

class LegalMatterOut(BaseModel):
    id: int
    case_reference: str
    court_forum: str
    project_id: int
    project_title: str
    matter_type: str
    plaintiff_petitioner: str
    case_summary: str
    interim_stay_in_force: bool
    next_hearing_date: Optional[datetime.datetime] = None
    statutory_deadline: Optional[datetime.datetime] = None
    ag_audit_para_ref: Optional[str] = None
    responsible_legal_officer: str
    status: str

class LeadershipDecisionCreate(BaseModel):
    project_id: Optional[int] = None
    leadership_issue_id: Optional[int] = None
    required_decision: str
    assigned_authority: str
    action_type: str  # REVIEW, REQUEST_EVIDENCE, FORWARD_COORDINATION, INVESTIGATION, ESCALATE, RECORD_DECISION
    supporting_evidence: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    resolution_notes: Optional[str] = None

class LeadershipDecisionOut(BaseModel):
    id: int
    decision_reference: str
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    leadership_issue_id: Optional[int] = None
    required_decision: str
    assigned_authority: str
    action_type: str
    supporting_evidence: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    status: str
    resolution_notes: Optional[str] = None
    created_by_name: str
    created_at: datetime.datetime
