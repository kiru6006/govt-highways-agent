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
    start_date: Optional[datetime.datetime] = None
    target_completion_date: Optional[datetime.datetime] = None
    actual_completion_date: Optional[datetime.datetime] = None
    planned_start_date: Optional[datetime.datetime] = None
    planned_completion_date: Optional[datetime.datetime] = None
    revised_cost_cr: Optional[float] = None
    sanction_as_number: Optional[str] = None
    sanction_as_date: Optional[datetime.datetime] = None
    sanction_ts_number: Optional[str] = None
    sanction_ts_date: Optional[datetime.datetime] = None
    carriageway_width_m: Optional[float] = None
    lane_configuration: Optional[str] = None
    pavement_type: Optional[str] = None
    total_length_km: Optional[float] = None
    start_chainage_km: Optional[float] = None
    end_chainage_km: Optional[float] = None
    funding_source: Optional[str] = None
    project_director_name: Optional[str] = None
    responsible_ee_name: Optional[str] = None
    programme_id: Optional[int] = None
    programme_code: Optional[str] = None
    verification_status: Optional[str] = "Verified"

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

# Minister & Secretary Command Centre Schemas
class UrgentMinisterialIntervention(BaseModel):
    title: str
    dept: str
    action: str
    days_pending: int
    impact: str

class DistrictImpactSummary(BaseModel):
    district: str
    active_projects: int
    outlay_cr: float
    completion_pct: float
    status: str

class PendingDirectiveSummary(BaseModel):
    ref: str
    subject: str
    due_date: str
    urgency: str

class MinisterStrategicKPIs(BaseModel):
    total_capital_outlay_cr: float
    major_corridors_count: int
    statewide_completion_rate: float
    critical_public_delays_count: int
    inter_ministerial_blockers_count: int
    land_acquisition_cleared_pct: float
    zero_pothole_compliance_pct: float
    public_grievances_resolved: int

class MinisterAIBriefing(BaseModel):
    headline: str
    summary: str
    urgent_interventions: List[UrgentMinisterialIntervention]
    district_sentiment: str

class MinisterOverviewOut(BaseModel):
    strategic_kpis: MinisterStrategicKPIs
    ai_briefing: MinisterAIBriefing
    district_impact: List[DistrictImpactSummary]
    cabinet_decisions_pending: List[PendingDirectiveSummary]
    data_freshness: str
    reporting_period: str

class OfficerAccountabilityAlert(BaseModel):
    officer: str
    issue: str
    pending_days: int
    action: str

class SecretaryAIBriefing(BaseModel):
    headline: str
    summary: str
    accountability_alerts: List[OfficerAccountabilityAlert]
    financial_controls: str

class SecretaryOverviewOut(BaseModel):
    governance_kpis: ExecutiveKPIsOut
    ai_briefing: SecretaryAIBriefing
    zone_performance: List[ZoneComparisonOut]
    secretarial_actions_pending: List[PendingDirectiveSummary]
    data_freshness: str
    reporting_period: str

# Verified Organisation, Service Cadre & Statutory Bodies Schemas
class StatutoryCommitteeOut(BaseModel):
    id: int
    code: str
    name: str
    chairperson_title: str
    mandate_summary: str
    constitution_go: str

    class Config:
        from_attributes = True

class DesignationOut(BaseModel):
    id: int
    code: str
    title: str
    hierarchical_rank: int
    is_gazetted: bool
    technical_sanction_limit_cr: float
    tender_acceptance_limit_cr: float

    class Config:
        from_attributes = True

class DelegationOfAuthorityOut(BaseModel):
    id: int
    designation_code: str
    power_type: str
    monetary_limit_cr: float
    tender_excess_pct_limit: float
    statutory_rule_reference: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class HistoricalPostingOut(BaseModel):
    id: int
    designation_title: str
    posting_unit: str
    posting_type: str
    from_date: datetime.datetime
    to_date: Optional[datetime.datetime] = None
    is_current: bool
    transfer_go_reference: Optional[str] = None

    class Config:
        from_attributes = True

class VerifiedOfficialOut(BaseModel):
    id: int
    name: str
    designation: str
    wing: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    office_address: Optional[str] = None
    charge_status: str
    verification_status: str
    tenures: List[HistoricalPostingOut] = []

    class Config:
        from_attributes = True

class VerifiedOrganisationStructureOut(BaseModel):
    chief_minister: Optional[dict] = None
    minister: dict
    principal_secretary: dict
    historical_leadership: List[dict] = []
    heads_of_department: List[VerifiedOfficialOut]
    statutory_committees: List[StatutoryCommitteeOut]
    delegations_of_authority: List[DelegationOfAuthorityOut]
    functional_permission_groups: List[dict] = []
    external_stakeholders: List[dict] = []
    zones_hierarchy: List[dict] = []
    verification_metadata: dict

# Master Data & Document Registry Schemas
class GovernmentDocumentOut(BaseModel):
    id: int
    document_reference: str
    title: str
    category: str
    issuing_department: str
    go_number: Optional[str] = None
    order_date: Optional[datetime.datetime] = None
    effective_date: Optional[datetime.datetime] = None
    last_verified_date: Optional[datetime.datetime] = None
    verification_status: str
    source_url: Optional[str] = None
    summary_abstract: str
    is_confidential: bool

    class Config:
        from_attributes = True

class CommitteeDecisionOut(BaseModel):
    id: int
    decision_reference: str
    committee_id: int
    subject: str
    decision_type: str
    decision_text: str
    statutory_condition: Optional[str] = None
    government_order_ref: Optional[str] = None
    effective_date: datetime.datetime
    verification_status: str

    class Config:
        from_attributes = True

class CommitteeMeetingOut(BaseModel):
    id: int
    meeting_reference: str
    committee_id: int
    meeting_date: datetime.datetime
    venue: str
    chairperson_name: str
    agenda_summary: str
    minutes_summary: str
    verification_status: str
    decisions: List[CommitteeDecisionOut] = []

    class Config:
        from_attributes = True

class StatutoryReferralOut(BaseModel):
    id: int
    project_id: int
    committee_code: str
    referral_type: str
    trigger_value: float
    threshold_limit: float
    referral_reason: str
    statutory_rule_citation: str
    status: str
    referral_date: datetime.datetime
    responsible_officer: str

    class Config:
        from_attributes = True

class AIIntelligenceFindingOut(BaseModel):
    id: int
    finding_type: str
    entity_type: str
    entity_id: Optional[int] = None
    headline: str
    evidence_summary: str
    explanation: str
    confidence: str
    human_validation_status: str
    recommended_action: str
    statutory_rule_citation: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FindingValidationUpdate(BaseModel):
    validation_status: str  # CONFIRMED_VALID, DISMISSED_FALSE_POSITIVE, PENDING_HUMAN_REVIEW
    officer_remarks: Optional[str] = None

class StatutoryCommitteeDetailOut(BaseModel):
    id: int
    code: str
    name: str
    chairperson_title: str
    mandate_summary: str
    constitution_go: str
    meetings: List[CommitteeMeetingOut] = []
    decisions: List[CommitteeDecisionOut] = []

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# PROGRAMME & INFRASTRUCTURE INTELLIGENCE SCHEMAS (CKICP / TNRSP-II)
# -------------------------------------------------------------

class CorridorAlignmentOut(BaseModel):
    id: int
    programme_id: int
    corridor_code: str
    name: str
    start_location: str
    end_location: str
    districts_json: str
    total_length_km: float
    coordinates_geojson: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class TenderOut(BaseModel):
    id: int
    programme_id: Optional[int] = None
    project_id: Optional[int] = None
    work_package_id: Optional[int] = None
    tender_reference: str
    package_number: str
    title: str
    work_description: str
    location_district: str
    estimated_cost_cr: float
    funding_source: str
    bid_eligibility: str
    publication_date: datetime.datetime
    submission_deadline: datetime.datetime
    tech_opening_date: Optional[datetime.datetime] = None
    fin_opening_date: Optional[datetime.datetime] = None
    successful_bidder_name: Optional[str] = None
    letter_of_acceptance_ref: Optional[str] = None
    agreement_number: Optional[str] = None
    contract_value_cr: Optional[float] = None
    work_commencement_date: Optional[datetime.datetime] = None
    completion_deadline: Optional[datetime.datetime] = None
    status: str
    source_url: Optional[str] = None
    verification_status: str

    class Config:
        from_attributes = True

class LandParcelOut(BaseModel):
    id: int
    project_id: int
    work_package_id: Optional[int] = None
    parcel_reference: str
    district: str
    taluk: str
    village: str
    survey_number: str
    land_classification: str
    private_land_sqm: float
    govt_land_sqm: float
    total_land_sqm: float
    notification_15_2_date: Optional[datetime.datetime] = None
    gazette_15_1_date: Optional[datetime.datetime] = None
    award_19_1_date: Optional[datetime.datetime] = None
    compensation_assessed_cr: float
    compensation_paid_cr: float
    possession_status: str
    has_litigation: bool
    responsible_revenue_officer: str

    class Config:
        from_attributes = True

class LegalCaseOut(BaseModel):
    id: int
    project_id: int
    work_package_id: Optional[int] = None
    land_parcel_id: Optional[int] = None
    case_reference: str
    court_name: str
    case_type: str
    petitioner: str
    respondent: str
    summary: str
    interim_stay_in_force: bool
    financial_exposure_cr: float
    next_hearing_date: Optional[datetime.datetime] = None
    responsible_legal_officer: str
    current_status: str

    class Config:
        from_attributes = True

class ProgrammeOut(BaseModel):
    id: int
    code: str
    name: str
    parent_corridor: Optional[str] = None
    funding_agency: str
    approved_cost_cr: float
    revised_cost_cr: float
    total_corridor_length_km: float
    website_url: Optional[str] = None
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProgrammeOverviewKPIs(BaseModel):
    programme: ProgrammeOut
    total_projects: int
    total_packages: int
    total_sanctioned_cost_cr: float
    total_expenditure_cr: float
    overall_physical_progress_pct: float
    overall_financial_progress_pct: float
    total_tenders: int
    awarded_tenders: int
    active_tenders: int
    total_land_required_sqm: float
    total_land_acquired_sqm: float
    land_acquisition_pct: float
    total_compensation_paid_cr: float
    active_litigations_count: int
    stay_orders_count: int
    financial_exposure_cr: float
    critical_risk_count: int
    leadership: dict

# -------------------------------------------------------------
# PHASE 3: PROJECT 360° INTELLIGENCE SCHEMAS
# -------------------------------------------------------------

class WorkPackageOut(BaseModel):
    id: int
    project_id: int
    package_number: str
    title: str
    scope_description: Optional[str] = None
    cost_cr: float
    start_km: float
    end_km: float
    status: str

    class Config:
        from_attributes = True

class ApprovalOut(BaseModel):
    id: int
    project_id: int
    approval_type: str
    reference_number: str
    sanction_amount_cr: float
    approved_by_role: str
    status: str
    approval_date: datetime.datetime

    class Config:
        from_attributes = True

class ProjectMilestoneOut(BaseModel):
    id: int
    project_id: int
    work_package_id: Optional[int] = None
    milestone_code: str
    title: str
    description: Optional[str] = None
    target_date: datetime.datetime
    actual_date: Optional[datetime.datetime] = None
    target_physical_pct: float
    actual_physical_pct: float
    delay_days: int
    status: str
    weightage_pct: float

    class Config:
        from_attributes = True

class ProjectRiskOut(BaseModel):
    id: int
    project_id: int
    risk_code: str
    category: str
    title: str
    description: str
    probability: str
    impact: str
    severity_score: float
    mitigation_strategy: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProjectProgressRecordOut(BaseModel):
    id: int
    project_id: int
    reporting_month: str
    planned_physical_pct: float
    actual_physical_pct: float
    planned_financial_pct: float
    actual_financial_pct: float
    expenditure_in_month_cr: float
    cumulative_expenditure_cr: float
    earned_value_cr: float
    planned_value_cr: float
    cost_variance_cr: float
    schedule_variance_cr: float
    remarks: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class EVMVarianceMetrics(BaseModel):
    planned_value_cr: float
    earned_value_cr: float
    actual_cost_cr: float
    cost_variance_cr: float  # CV = EV - AC
    schedule_variance_cr: float  # SV = EV - PV
    cost_performance_index: float  # CPI = EV / AC
    schedule_performance_index: float  # SPI = EV / PV
    schedule_variance_days: int
    planned_physical_pct: float
    actual_physical_pct: float
    physical_variance_pct: float
    planned_financial_pct: float
    actual_financial_pct: float
    financial_variance_pct: float
    status_assessment: str  # ON_TRACK, AT_RISK, CRITICAL_DELAY, COST_OVERRUN

class ProjectStakeholderOut(BaseModel):
    id: int
    stakeholder_type: str
    department_name: Optional[str] = None
    contact_person: str
    email: Optional[str] = None
    phone: Optional[str] = None
    responsibility_scope: Optional[str] = None
    designation: Optional[str] = None
    posting_unit: Optional[str] = None

class Project360DetailOut(BaseModel):
    project: ProjectOut
    jurisdiction_hierarchy: dict
    technical_specs: dict
    sanctions: List[ApprovalOut]
    milestones: List[ProjectMilestoneOut]
    execution_tracking: EVMVarianceMetrics
    progress_history: List[ProjectProgressRecordOut]
    work_packages: List[WorkPackageOut]
    contractors_and_consultants: dict
    assigned_officials_and_stakeholders: List[ProjectStakeholderOut]
    land_acquisition: dict
    utilities_and_dependencies: dict
    engineering_quality: dict
    legal_cases: dict
    documents: List[DocumentOut]
    risks_and_issues: dict
    ai_findings: List[AIIntelligenceFindingOut]
    audit_history: List[AuditEventOut]
    ai_project_intelligence: Optional[dict] = None
    field_operations: Optional[dict] = None
    assets: Optional[dict] = None
    citizen_grievances: Optional[dict] = None
    financial_transactions: Optional[List[dict]] = None
    actions_register: Optional[List[dict]] = None
    utility_shifting: Optional[dict] = None

# -------------------------------------------------------------
# Anomaly & Leakage Intelligence Schemas (Prompt 01)
# -------------------------------------------------------------

class AnomalyActionHistoryOut(BaseModel):
    id: int
    finding_id: int
    action_type: str
    actor_name: str
    actor_role: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None
    action_details: Optional[str] = None
    due_date: Optional[str] = None
    created_at: datetime.datetime

class AnomalyFindingListItem(BaseModel):
    id: int
    finding_code: str
    project_id: int
    project_title: str
    project_code: Optional[str] = None
    package_id: Optional[int] = None
    package_name: Optional[str] = None
    contractor_id: Optional[int] = None
    contractor_name: Optional[str] = None
    category: str
    title: str
    severity: str
    ai_confidence: str
    potential_exposure_cr: float
    transaction_value_cr: float
    verified_impact_cr: float
    amount_under_review_cr: float
    evidence_status: str
    responsible_department: str
    responsible_officer: str
    review_status: str
    assigned_to: Optional[str] = None
    scenario_id: Optional[str] = None
    data_mode: str = "mock"
    data_status: str = "Seeded Demo"
    created_at: datetime.datetime

class AnomalyFindingDetailOut(AnomalyFindingListItem):
    description: str
    what_detected: str
    why_flagged: str
    detection_rule: str
    calculation_formula: str
    review_remarks: Optional[str] = None
    suggested_verification: Optional[str] = None
    recommended_action: Optional[str] = None
    corrective_action: Optional[str] = None
    action_due_date: Optional[str] = None
    escalated_to_secretary: bool = False
    evidence_records_json: Optional[str] = None
    actions: List[AnomalyActionHistoryOut] = []

class AnomalyReviewRequest(BaseModel):
    review_status: Optional[str] = None
    assigned_to: Optional[str] = None
    review_remarks: Optional[str] = None
    request_evidence_details: Optional[str] = None
    corrective_action: Optional[str] = None
    action_due_date: Optional[str] = None
    escalate_to_secretary: Optional[bool] = None

class LeakageKPIsOut(BaseModel):
    total_findings: int
    critical_findings: int
    high_risk_findings: int
    potential_financial_exposure_cr: float
    findings_awaiting_verification: int
    corrective_actions_pending: int
    data_mode: str = "mock"
    reporting_period: str
    last_analysis_timestamp: str

class CategorySummaryOut(BaseModel):
    category: str
    count: int
    total_exposure_cr: float
    critical_count: int

class ExposureAnalysisOut(BaseModel):
    by_project: List[dict]
    by_category: List[dict]
    by_contractor: List[dict]
    by_programme: List[dict]
    month_trend: List[dict]
    total_transaction_value_cr: float
    total_potential_exposure_cr: float
    total_verified_impact_cr: float
    total_under_review_cr: float

class ProjectRiskScoreOut(BaseModel):
    project_id: int
    project_code: str
    project_title: str
    programme: str
    financial_risk_score: float
    schedule_risk_score: float
    procurement_risk_score: float
    quality_risk_score: float
    land_utility_risk_score: float
    compliance_risk_score: float
    overall_composite_risk: float
    active_anomalies_count: int

class ExecutiveAssessmentOut(BaseModel):
    summary_narrative: str
    overall_risk_assessment: str
    critical_observations: List[str]
    financial_exposure_estimate_cr: float
    projects_requiring_immediate_attention: List[dict]
    recommended_executive_actions: List[dict]
    observed_facts: List[str]
    calculated_indicators: List[str]
    ai_interpretations: List[str]

class DecisionRequiredOut(BaseModel):
    id: int
    finding_code: str
    project_id: int
    project_title: str
    issue: str
    impact: str
    financial_exposure_cr: float
    responsible_department: str
    current_status: str
    recommended_decision: str
    escalation_level: str  # MINISTER, SECRETARY, CHIEF_ENGINEER
    due_date: Optional[str] = None

# -------------------------------------------------------------
# Ministerial Reports & Decision Intelligence Schemas (Prompt 02)
# -------------------------------------------------------------

class ReportsOverviewOut(BaseModel):
    total_active_projects: int
    total_project_value_cr: float
    total_budget_allocation_cr: float
    total_expenditure_cr: float
    physical_progress_avg_pct: float
    delayed_projects_count: int
    delayed_projects_value_cr: float
    critical_risk_projects_count: int
    pending_approvals_count: int
    land_acquisition_pending_count: int
    potential_financial_exposure_cr: float
    reporting_period: str
    frequency: str
    last_updated_timestamp: str
    data_mode: str = "mock"
    data_status: str = "Seeded Demo"
    kpi_definitions: dict

class ProgrammePerformanceItem(BaseModel):
    programme_code: str
    programme_name: str
    projects_count: int
    packages_count: int
    approved_cost_cr: float
    budget_allocation_cr: float
    expenditure_cr: float
    physical_progress_pct: float
    financial_progress_pct: float
    delayed_projects_count: int
    high_risk_projects_count: int
    variance_pct: float
    status: str

class ProjectPerformanceItem(BaseModel):
    project_id: int
    project_code: str
    project_title: str
    programme: str
    district: str
    sanctioned_cost_cr: float
    expenditure_to_date_cr: float
    physical_progress_pct: float
    financial_progress_pct: float
    planned_completion_date: str
    expected_completion_date: str
    schedule_variance_days: int
    contractor_id: Optional[int] = None
    contractor_name: str
    overall_risk: str  # CRITICAL, HIGH, MEDIUM, LOW
    status: str
    has_critical_blocker: bool

class FinancialPerformanceOut(BaseModel):
    approved_budget_cr: float
    revised_budget_cr: float
    actual_expenditure_cr: float
    pending_bills_cr: float
    payments_made_cr: float
    retention_amount_cr: float
    cost_variations_cr: float
    potential_exposure_under_review_cr: float
    budget_vs_expenditure_by_programme: List[dict]
    monthly_expenditure_trend: List[dict]
    contractor_payment_distribution: List[dict]
    pending_payment_ageing: List[dict]
    cost_variation_analysis: List[dict]

class SchedulePerformanceOut(BaseModel):
    projects_on_schedule_count: int
    delayed_projects_count: int
    critical_delays_count: int
    milestones_due_count: int
    overdue_milestones_count: int
    contract_extensions_count: int
    delay_analysis_table: List[dict]

class DepartmentPerformanceItem(BaseModel):
    department_name: str
    category: str
    pending_approvals: int
    avg_approval_age_days: int
    critical_dependencies: int
    projects_affected: int
    overdue_actions: int
    escalations_count: int
    lead_officer: str
    status: str

class ContractorPerformanceItem(BaseModel):
    contractor_id: int
    name: str
    contractor_class: str
    active_contracts: int
    contract_value_cr: float
    project_progress_avg: float
    schedule_adherence_pct: float
    quality_observations_count: int
    pending_payments_cr: float
    contract_extensions_count: int
    open_corrective_actions_count: int
    performance_score: float
    score_breakdown: dict

class QualityAssetPerformanceOut(BaseModel):
    inspections_conducted: int
    open_defects: int
    critical_observations: int
    ncrs_count: int
    corrective_actions_pending: int
    overdue_quality_closures: int
    contractor_quality_breakdown: List[dict]
    total_assets: int
    road_assets_km: float
    bridges_count: int
    culverts_count: int
    assets_requiring_inspection: int
    maintenance_pending: int
    critical_asset_conditions: int

class LandUtilityPerformanceOut(BaseModel):
    total_land_parcels: int
    parcels_under_acquisition: int
    awards_pending: int
    compensation_pending: int
    possession_pending: int
    utility_shifting_pending: int
    projects_affected: int
    avg_pending_duration_days: int
    department_dependencies: List[dict]
    utility_type_breakdown: List[dict]

class DecisionQueueItem(BaseModel):
    id: int
    decision_reference: str
    project_id: Optional[int] = None
    project_title: str
    programme: str
    district: str
    issue_title: str
    evidence_summary: str
    impact_assessment: str
    financial_exposure_cr: float
    recommended_action: str
    decision_authority: str
    current_status: str
    assigned_department: Optional[str] = None
    assigned_officer: Optional[str] = None
    due_date: Optional[str] = None
    recorded_decision: Optional[str] = None
    remarks: Optional[str] = None
    is_simulated: bool = True
    created_at: str

class AIMinisterialBriefingOut(BaseModel):
    title: str = "AI Ministerial Intelligence Briefing"
    subtitle: str
    generated_at: str
    scenario_id: str = "SCENARIO-MINISTER-DEMO"
    what_needs_attention: dict
    why_does_it_matter: dict
    what_should_be_done: dict
    who_should_act: dict
    what_decision_is_required: List[DecisionQueueItem]
    data_mode: str = "mock"
    disclaimer: str

class ReportGenerateRequest(BaseModel):
    report_type: str = "Executive Briefing"
    programme: str = "ALL"
    district: str = "ALL"
    project_id: Optional[int] = None
    department: str = "ALL"
    reporting_period: str = "Quarterly"
    include_financial: bool = True
    include_delays: bool = True
    include_contractor: bool = True
    include_ai_findings: bool = True
    include_land_utility: bool = True
    include_quality: bool = True

class ReportGenerateOut(BaseModel):
    report_id: str
    title: str
    generated_at: str
    reporting_period: str
    filters_applied: dict
    executive_summary: str
    kpis_summary: dict
    sections: List[dict]
    recommended_decisions: List[dict]
    data_mode: str = "mock"

class MinisterialDecisionActionHistoryOut(BaseModel):
    id: int
    decision_id: int
    action_type: str
    actor_name: str
    actor_role: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    created_at: str

class MinisterialDecisionOut(BaseModel):
    id: int
    decision_reference: str
    project_id: Optional[int] = None
    project_title: str
    programme: str
    district: str
    issue_title: str
    evidence_summary: Optional[str] = None
    impact_assessment: Optional[str] = None
    financial_exposure_cr: float
    recommended_action: str
    decision_authority: str
    current_status: str
    assigned_department: Optional[str] = None
    assigned_officer: Optional[str] = None
    due_date: Optional[str] = None
    recorded_decision: Optional[str] = None
    remarks: Optional[str] = None
    is_simulated: bool = True
    created_at: str
    updated_at: str
    actions: List[MinisterialDecisionActionHistoryOut] = []

class MinisterialDecisionUpdate(BaseModel):
    current_status: str
    recorded_decision: Optional[str] = None
    remarks: Optional[str] = None
    assigned_officer: Optional[str] = None
    assigned_department: Optional[str] = None
    due_date: Optional[str] = None


# --- Phase 18: Notification & Unified Calendar Schemas ---

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str = "INFO"
    priority: str = "MEDIUM"
    category: str = "PROJECT_UPDATE"
    source_module: Optional[str] = None
    source_record_id: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    responsible_officer_name: Optional[str] = None
    target_route: Optional[str] = None
    is_read: bool = False
    is_saved: bool = False
    is_acknowledged: bool = False
    acknowledged_at: Optional[str] = None
    is_statutory_mandatory: bool = False
    due_date: Optional[str] = None
    ai_importance_score: Optional[float] = None
    ai_is_priority_briefing: bool = False
    ai_reasoning: Optional[str] = None
    ai_potential_impact: Optional[str] = None
    ai_required_action: Optional[str] = None
    ai_evidence_citation: Optional[str] = None
    ai_confidence_score: Optional[float] = None
    data_mode: str = "mock"
    data_status: str = "Seeded Demo"
    reference_url: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class AIPriorityBriefingItem(BaseModel):
    id: int
    priority: str
    title: str
    short_explanation: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    department_name: Optional[str] = None
    responsible_officer: Optional[str] = None
    why_important: str
    potential_impact: str
    required_action: str
    deadline: Optional[str] = None
    evidence_source: Optional[str] = None
    confidence_score: float = 0.95
    last_updated: str
    target_route: str
    is_statutory_mandatory: bool = False
    is_read: bool = False
    is_acknowledged: bool = False

class NotificationSummaryOut(BaseModel):
    total_notifications: int
    unread_notifications: int
    critical_alerts: int
    high_priority_alerts: int
    pending_actions: int
    upcoming_meetings: int
    overdue_tasks: int
    recently_updated_projects: int

class NotificationPreferenceOut(BaseModel):
    id: Optional[int] = None
    user_id: int
    enable_in_app: bool = True
    enable_email_digest: bool = False
    min_priority_alert: str = "LOW"
    quiet_hours_enabled: bool = False
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "06:00"
    category_filters: List[str] = []
    daily_briefing_enabled: bool = True

class NotificationPreferenceUpdate(BaseModel):
    enable_in_app: Optional[bool] = None
    enable_email_digest: Optional[bool] = None
    min_priority_alert: Optional[str] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    category_filters: Optional[List[str]] = None
    daily_briefing_enabled: Optional[bool] = None

class CalendarParticipantOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    official_name: str
    official_role: str
    department_name: str
    invitation_status: str
    attendance_status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class MeetingActionItemOut(BaseModel):
    id: int
    event_id: int
    action_code: str
    title: str
    description: str
    responsible_user_id: Optional[int] = None
    responsible_officer_name: str
    responsible_department_name: str
    priority: str
    due_date: str
    status: str
    escalation_level: str
    closure_remarks: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class CalendarEventOut(BaseModel):
    id: int
    event_code: str
    title: str
    event_category: str
    start_time: str
    end_time: str
    time_zone: str = "Asia/Kolkata"
    venue_or_url: str
    is_virtual: bool = False
    organiser_user_id: Optional[int] = None
    organiser_name: str
    organiser_role: str
    related_project_id: Optional[int] = None
    related_project_name: Optional[str] = None
    related_department_name: Optional[str] = None
    agenda: str
    preparation_notes: Optional[str] = None
    required_documents: List[str] = []
    previous_meeting_ref: Optional[str] = None
    priority: str = "HIGH"
    status: str = "SCHEDULED"
    source_module: Optional[str] = None
    source_record_id: Optional[str] = None
    minutes_of_meeting: Optional[str] = None
    decisions_summary: Optional[str] = None
    data_mode: str = "mock"
    data_status: str = "Seeded Demo"
    created_at: str
    participants: List[CalendarParticipantOut] = []
    action_items: List[MeetingActionItemOut] = []

    class Config:
        from_attributes = True

class CalendarEventCreate(BaseModel):
    title: str
    event_category: str
    start_time: str
    end_time: str
    venue_or_url: str
    is_virtual: bool = False
    agenda: str
    preparation_notes: Optional[str] = None
    required_documents: Optional[List[str]] = None
    previous_meeting_ref: Optional[str] = None
    priority: str = "HIGH"
    related_project_id: Optional[int] = None
    related_department_name: Optional[str] = None
    participants: Optional[List[dict]] = None

class MeetingMinutesUpdate(BaseModel):
    minutes_of_meeting: str
    decisions_summary: Optional[str] = None
    status: str = "CONCLUDED"
    action_items: Optional[List[dict]] = None


# --- Phase 19: One-to-One Messaging, Group Chat & Discussion Intelligence Schemas ---

class ConversationParticipantOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    designation: str
    department_name: Optional[str] = None
    role_in_conversation: str = "MEMBER"
    is_pinned: bool = False
    is_muted: bool = False
    is_archived: bool = False
    joined_at: str

    class Config:
        from_attributes = True

class MessageAttachmentOut(BaseModel):
    id: int
    message_id: int
    file_name: str
    file_type: str
    file_size_bytes: int
    storage_path: Optional[str] = None
    security_scan_status: str = "VERIFIED_CLEAN"
    created_at: str

    class Config:
        from_attributes = True

class MessageActionSuggestionOut(BaseModel):
    id: int
    conversation_id: int
    message_id: Optional[int] = None
    title: str
    suggested_assignee_name: Optional[str] = None
    suggested_assignee_id: Optional[int] = None
    suggested_due_date: Optional[str] = None
    priority: str = "HIGH"
    is_confirmed: bool = False
    confirmed_action_code: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_user_id: int
    sender_name: str
    sender_role: str
    sender_department: Optional[str] = None
    content: str
    message_type: str = "TEXT"
    reply_to_message_id: Optional[int] = None
    reply_to_content: Optional[str] = None
    reply_to_sender: Optional[str] = None
    is_edited: bool = False
    is_deleted: bool = False
    is_pinned: bool = False
    priority: str = "NORMAL"
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    ai_priority_reason: Optional[str] = None
    attachments: List[MessageAttachmentOut] = []
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: int
    conversation_code: str
    conversation_type: str
    title: str
    description: Optional[str] = None
    category: str
    related_project_id: Optional[int] = None
    related_project_name: Optional[str] = None
    related_record_type: Optional[str] = None
    related_record_id: Optional[str] = None
    is_archived: bool = False
    is_pinned: bool = False
    is_muted: bool = False
    unread_count: int = 0
    last_message_preview: Optional[str] = None
    last_message_at: str
    created_at: str
    participants: List[ConversationParticipantOut] = []
    action_suggestions: List[MessageActionSuggestionOut] = []

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    conversation_type: str = "DIRECT"  # DIRECT, GROUP, PROJECT_LINKED
    title: str
    description: Optional[str] = None
    category: str = "GENERAL"
    related_project_id: Optional[int] = None
    related_record_type: Optional[str] = None
    related_record_id: Optional[str] = None
    participant_user_ids: List[int] = []

class MessageCreate(BaseModel):
    content: str
    message_type: str = "TEXT"
    reply_to_message_id: Optional[int] = None
    priority: str = "NORMAL"
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    attachments: Optional[List[dict]] = None

class MessageEdit(BaseModel):
    content: str

class ActionConfirmPayload(BaseModel):
    action_suggestion_id: int
    assigned_user_id: int
    due_date: str
    priority: str = "HIGH"

class ConversationAISummaryOut(BaseModel):
    conversation_id: int
    summary_text: str
    key_decisions_discussed: List[str]
    unresolved_issues: List[str]
    identified_risks: List[str]
    suggested_actions: List[dict]
    source_message_count: int
    ai_confidence: float = 0.94
    generated_at: str

class UnreadCountOut(BaseModel):
    total_unread_conversations: int
    total_unread_messages: int
    display_badge: str

class UserSearchItemOut(BaseModel):
    id: int
    username: str
    full_name: str
    role_name: str
    department_name: str
    email: str
    zone_name: Optional[str] = None
    circle_name: Optional[str] = None
    division_name: Optional[str] = None

# ============================================================================
# PHASE 20: UNIVERSAL CONNECTIVITY & CM DECISION INTELLIGENCE SCHEMAS
# ============================================================================

class EntityRelationshipCreate(BaseModel):
    source_entity_type: str
    source_entity_id: Any
    source_entity_name: Optional[str] = None
    relationship_type: str
    target_entity_type: str
    target_entity_id: Any
    target_entity_name: Optional[str] = None
    directionality: str = "BIDIRECTIONAL"
    source_reference: Optional[str] = None
    access_tier: str = "INTERNAL"
    verification_status: str = "VERIFIED_OFFICIAL"
    metadata_json: Optional[str] = None
    weight: Optional[float] = 1.0
    is_active: Optional[bool] = True
    is_critical_path: Optional[bool] = False
    provenance: Optional[str] = "MANUAL"
    description: Optional[str] = None

class EntityRelationshipOut(BaseModel):
    id: int
    relationship_code: str
    source_entity_type: str
    source_entity_id: str
    source_entity_name: str
    relationship_type: str
    target_entity_type: str
    target_entity_id: str
    target_entity_name: str
    directionality: str
    valid_from: datetime.datetime
    valid_to: Optional[datetime.datetime] = None
    is_current: bool
    verification_status: str
    confidence_score: float
    source_reference: Optional[str] = None
    access_tier: str
    metadata_json: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RelationshipAuditLogOut(BaseModel):
    id: int
    relationship_id: int
    relationship_code: Optional[str] = None
    action: str
    actor_user_id: Optional[int] = None
    reason: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class EntityRelationshipGraphNode(BaseModel):
    id: str
    name: str
    type: str
    category: str
    status: Optional[str] = "ACTIVE"
    badge: Optional[str] = None
    access_tier: str = "INTERNAL"

class EntityRelationshipGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    type: str
    verification_status: str = "VERIFIED_OFFICIAL"

class EntityRelationshipGraphOut(BaseModel):
    center_entity_id: str
    center_entity_type: str
    nodes: List[EntityRelationshipGraphNode]
    edges: List[EntityRelationshipGraphEdge]
    total_connections: int

class CMDirectionCreate(BaseModel):
    title: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    target_department: str = "Highways and Minor Ports"
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    assigned_officer_designation: Optional[str] = None
    priority: str = "CRITICAL"
    issue_summary: str
    directive_text: str
    deadline_date: datetime.datetime
    escalation_level: int = 1

class CMDirectionUpdate(BaseModel):
    status: Optional[str] = None
    compliance_notes: Optional[str] = None
    verified_by_cmo: Optional[bool] = None

class CMDirectionOut(BaseModel):
    id: int
    direction_code: str
    title: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    target_department: str
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    assigned_officer_designation: Optional[str] = None
    priority: str
    issue_summary: str
    directive_text: str
    deadline_date: datetime.datetime
    status: str
    compliance_notes: Optional[str] = None
    compliance_date: Optional[datetime.datetime] = None
    verified_by_cmo: bool
    escalation_level: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProjectDelayEventOut(BaseModel):
    id: int
    project_id: int
    event_title: str
    start_date: datetime.datetime
    end_date: Optional[datetime.datetime] = None
    delay_days: int
    is_critical_path: bool
    category: str
    primary_cause: str
    contributing_causes: Optional[str] = None
    causing_party: str
    causing_party_type: str
    resolving_authority: str
    formal_liability: str
    eot_status: str
    eot_days_approved: int
    financial_exposure_cr: float
    public_service_impact: Optional[str] = None
    corrective_action: Optional[str] = None
    target_resolution_date: Optional[datetime.datetime] = None
    verification_status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DelayRootCauseAnalysisOut(BaseModel):
    project_id: int
    project_code: str
    project_title: str
    baseline_completion_date: datetime.datetime
    forecast_completion_date: datetime.datetime
    total_calendar_delay_days: int
    critical_path_delay_days: int
    parallel_non_critical_days: int
    delay_events: List[ProjectDelayEventOut]
    causing_parties_summary: List[dict]
    resolving_authorities_summary: List[dict]
    cost_overrun_cr: float
    sanctioned_cost_cr: float
    revised_cost_cr: float

class CMExecutiveOverviewOut(BaseModel):
    # 17 Mandatory Executive KPIs
    total_highways_projects: int = 0
    total_sanctioned_budget_cr: float = 0.0
    total_expenditure_cr: float = 0.0
    statewide_physical_progress_pct: float = 0.0
    statewide_financial_progress_pct: float = 0.0
    projects_delayed_count: int = 0
    projects_at_critical_risk_count: int = 0
    pending_land_acquisition_parcels: int = 0
    pending_land_extent_hectares: float = 0.0
    pending_utility_shifting_items: int = 0
    interdepartmental_dependencies_blocking: int = 0
    open_legal_stays_count: int = 0
    critical_quality_non_conformances: int = 0
    high_risk_contractors_count: int = 0
    active_cm_directions_count: int = 0
    resolved_cm_directions_count: int = 0
    overdue_cm_directions_count: int = 0
    chief_minister: str = "Thiru C. Joseph Vijay"
    highways_minister: str = "Thiru Aadhav Arjuna"

    # Category Breakdowns & Health Overview
    total_projects: int
    ongoing_count: int
    completed_count: int
    delayed_count: int
    stalled_count: int
    at_risk_count: int
    delay_brackets: dict
    delay_causes_category: dict
    total_sanctioned_cost_cr: float
    total_revised_cost_cr: float
    net_cost_overrun_cr: float
    pending_land_parcels_count: int
    pending_utility_shifts_count: int
    active_court_stays_count: int
    contractor_repeated_failures_count: int
    avg_department_turnaround_days: float
    critical_quality_defects_count: int
    unresolved_grievances_count: int
    financial_leakage_alerts_count: int
    cm_escalation_queue_count: int
    pending_cabinet_approvals_count: int
    cm_directions_summary: dict
    timestamp: str

class CMEscalationItem(BaseModel):
    id: str
    type: str
    title: str
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    severity: str
    days_pending: int
    responsible_authority: str
    issue_summary: str
    recommended_action: str
    requires_cm_intervention: bool

class CMEscalationsOut(BaseModel):
    escalations: List[CMEscalationItem]
    total_escalations: int
    urgent_cabinet_items: int

class CMAIDailyBriefOut(BaseModel):
    brief_title: str
    generated_at: str
    executive_overview: str
    top_10_critical_projects: List[dict]
    critical_path_drivers: List[dict]
    court_stays_impact: List[dict]
    contractor_risk_radar: List[dict]
    cm_recommended_actions: List[dict]
    data_freshness_timestamp: str
    provenance_disclaimer: str
    ai_confidence_score: float


# -------------------------------------------------------------
# LAND ACQUISITION & LITIGATION INTELLIGENCE SCHEMAS
# -------------------------------------------------------------

class RevenueCoordinationRequestOut(BaseModel):
    id: int
    request_code: str
    project_id: int
    project_title: Optional[str] = None
    parcel_id: Optional[int] = None
    parcel_reference: Optional[str] = None
    work_package_id: Optional[int] = None
    district: str
    taluk: Optional[str] = None
    village: Optional[str] = None
    survey_number: Optional[str] = None
    requesting_highways_officer: str
    receiving_revenue_authority: str
    request_type: str
    request_details: str
    request_date: datetime.datetime
    acknowledgment_date: Optional[datetime.datetime] = None
    due_date: datetime.datetime
    response_status: str
    days_overdue: int
    documents_received: Optional[str] = None
    documents_missing: Optional[str] = None
    clarification_required: Optional[str] = None
    escalation_level: str
    last_followup_date: Optional[datetime.datetime] = None
    next_action: Optional[str] = None
    resolution_evidence: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RevenueCoordinationRequestIn(BaseModel):
    project_id: int
    parcel_id: Optional[int] = None
    work_package_id: Optional[int] = None
    district: str
    taluk: Optional[str] = None
    village: Optional[str] = None
    survey_number: Optional[str] = None
    requesting_highways_officer: str
    receiving_revenue_authority: str
    request_type: str
    request_details: str
    due_date: datetime.datetime
    documents_missing: Optional[str] = None
    escalation_level: Optional[str] = "NONE"

class LitigationCaseDetailOut(BaseModel):
    id: int
    case_code: str
    court_case_number: str
    cnr_number: Optional[str] = None
    court_name: str
    jurisdiction: str
    case_type: str
    project_id: int
    project_title: Optional[str] = None
    parcel_id: Optional[int] = None
    parcel_reference: Optional[str] = None
    work_package_id: Optional[int] = None
    petitioners: str
    respondents: str
    statutory_provisions: Optional[str] = None
    dispute_nature: str
    relief_sought: Optional[str] = None
    interim_order_status: str
    interim_order_details: Optional[str] = None
    work_restricted: bool
    restriction_scope: Optional[str] = None
    latest_hearing_date: Optional[datetime.datetime] = None
    next_hearing_date: Optional[datetime.datetime] = None
    filing_compliance_deadline: Optional[datetime.datetime] = None
    assigned_counsel_name: Optional[str] = None
    counsel_contact: Optional[str] = None
    govt_legal_coordinator: Optional[str] = None
    instructions_sent_status: str
    instructions_sent_date: Optional[datetime.datetime] = None
    documents_supplied_status: str
    counter_affidavit_status: str
    counter_affidavit_filed_date: Optional[datetime.datetime] = None
    hearing_attendance_record: Optional[str] = None
    last_counsel_update: Optional[str] = None
    last_update_date: Optional[datetime.datetime] = None
    procedural_alert: Optional[str] = None
    human_performance_review_notes: Optional[str] = None
    disposition_type: str
    recommended_action: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SiteBlockerRecordOut(BaseModel):
    id: int
    blocker_code: str
    project_id: int
    project_title: Optional[str] = None
    work_package_id: Optional[int] = None
    chainage_start_km: float
    chainage_end_km: float
    chainage_display: str
    category: str
    cause_description: str
    start_date: datetime.datetime
    is_critical_path: bool
    readiness_gate: str
    resolution_owner: str
    supporting_department: Optional[str] = None
    action_required: str
    target_resolution_date: datetime.datetime
    current_status: str
    financial_impact_cr: float
    evidence_attachment: Optional[str] = None
    escalation_history: Optional[str] = None
    days_blocked: int = 0
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FinancialExposureAssessmentOut(BaseModel):
    id: int
    project_id: int
    project_title: Optional[str] = None
    parcel_id: Optional[int] = None
    case_id: Optional[int] = None
    blocker_id: Optional[int] = None
    project_value_affected_cr: float
    actual_incremental_expenditure_cr: float
    contractor_claims_submitted_cr: float
    claims_admitted_cr: float
    claims_disputed_cr: float
    idle_resource_cost_cr: float
    contractual_price_escalation_cr: float
    additional_financing_cost_cr: float
    legal_expenses_cr: float
    forecast_incremental_cost_cr: float
    potentially_avoidable_future_cost_cr: float
    confirmed_recoverable_cr: float
    public_benefit_delay_days: int
    calculation_formula: Optional[str] = None
    assumptions_and_sources: Optional[str] = None
    confidence_score_pct: float
    evidence_reference: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PreConstructionRiskAssessmentOut(BaseModel):
    id: int
    assessment_code: str
    project_id: int
    project_title: Optional[str] = None
    work_package_id: Optional[int] = None
    assessment_stage: str
    readiness_status: str
    survey_title_status: str
    acquisition_route_status: str
    objections_proceedings_status: str
    compensation_possession_status: str
    active_legal_restrictions_status: str
    has_binding_legal_prohibition: bool
    forest_statutory_approvals_status: str
    utility_dependencies_status: str
    site_access_contractor_status: str
    required_signoffs_status: str
    missing_evidence_notes: Optional[str] = None
    identified_risks_severity: Optional[str] = None
    recommended_mitigations: Optional[str] = None
    assigned_resolution_owner: str
    authorized_override_granted: bool
    override_justification: Optional[str] = None
    override_officer_name: Optional[str] = None
    override_timestamp: Optional[datetime.datetime] = None
    override_denied_reason: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PreConstructionOverrideIn(BaseModel):
    justification: str
    officer_name: str

class LandLitigationResolutionActionOut(BaseModel):
    id: int
    action_code: str
    project_id: int
    project_title: Optional[str] = None
    blocker_id: Optional[int] = None
    case_id: Optional[int] = None
    parcel_id: Optional[int] = None
    action_title: str
    action_description: str
    action_type: str
    assigned_department: str
    assigned_officer: str
    target_date: datetime.datetime
    status: str
    meeting_id: Optional[str] = None
    meeting_decisions: Optional[str] = None
    evidence_file_reference: Optional[str] = None
    closure_remarks: Optional[str] = None
    is_closed: bool
    escalation_level: str
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LandLitigationResolutionActionIn(BaseModel):
    project_id: int
    blocker_id: Optional[int] = None
    case_id: Optional[int] = None
    parcel_id: Optional[int] = None
    action_title: str
    action_description: str
    action_type: Optional[str] = "ASSIGN_ACTION"
    assigned_department: str
    assigned_officer: str
    target_date: datetime.datetime
    escalation_level: Optional[str] = "OFFICER"

class LandLitigationOverviewOut(BaseModel):
    # 12 Executive KPIs
    total_parcels_required: int
    parcels_acquired: int
    parcels_pending_acquisition: int
    parcels_under_litigation: int
    parcels_with_court_restrictions: int
    revenue_dept_responses_overdue: int
    forest_statutory_clearances_pending: int
    projects_blocked_by_land: int
    projects_blocked_on_critical_path: int
    actual_additional_expenditure_cr: float
    estimated_future_financial_exposure_cr: float
    sites_requiring_stop_work_or_readiness_review: int

    # Summary Breakdowns
    readiness_breakdown: dict
    litigation_disposition_breakdown: dict
    revenue_requests_by_district: dict
    blockers_by_category: dict
    top_blocked_projects: List[dict]
    counsel_alerts_summary: List[dict]
    data_mode: str = "SIMULATED"
    provenance_notice: str = "SIMULATED GOVERNMENT RESEARCH DATASET - PRODUCED UNDER TN HIGHWAYS & REVENUE STANDARDS"
    timestamp: str

class LandLitigationCMSummaryOut(BaseModel):
    top_10_blocked_projects: List[dict]
    critical_court_restrictions: List[dict]
    highest_financial_exposure_cases: List[dict]
    revenue_responses_overdue: List[dict]
    districts_with_recurring_blockers: List[dict]
    pending_interdepartmental_decisions: List[dict]
    upcoming_legal_deadlines: List[dict]
    cases_requiring_senior_coordination: List[dict]
    total_active_court_stays: int
    total_financial_exposure_cr: float

class LandLitigationAIQueryIn(BaseModel):
    question_key: Optional[str] = None
    custom_question: Optional[str] = None
    project_id: Optional[int] = None
    parcel_id: Optional[int] = None
    case_id: Optional[int] = None

class LandLitigationAIQueryOut(BaseModel):
    question: str
    verified_facts: List[str]
    missing_information: List[str]
    relevant_evidence: List[str]
    responsible_resolution_authority: str
    recommended_next_action: str
    urgency_level: str
    financial_exposure_cr: float
    uncertainty_and_limitations: str
    confidence_score: float
    provenance: str = "SIMULATED"








# ============================================================================
# MAJOR WORKS ₹50 CR+ & PROJECT BLOCKER SCHEMAS
# ============================================================================

class MajorWorksProjectReviewOut(BaseModel):
    id: int
    source_project_id: str
    canonical_project_id: Optional[int] = None
    project_name: str
    portfolio_category: str
    scheme_name: str
    circle_name: str
    division_name: str
    road_or_bridge_details: Optional[str] = None
    start_chainage_km: float = 0.0
    end_chainage_km: float = 0.0
    total_length_km: float = 0.0
    contractor_name: Optional[str] = None
    technical_sanction_cr: float
    contract_value_cr: float
    work_commencement_date: Optional[datetime.datetime] = None
    agreement_completion_date: Optional[datetime.datetime] = None
    estimated_completion_date: Optional[datetime.datetime] = None
    completion_delay_days: int
    physical_progress_pct: float
    financial_progress_pct: float
    expenditure_cr: float
    agreement_milestones: Optional[str] = None
    actual_milestone_status: Optional[str] = None
    work_remarks: Optional[str] = None
    land_acquisition_remarks: Optional[str] = None
    forest_clearance_remarks: Optional[str] = None
    court_case_remarks: Optional[str] = None
    railway_approval_remarks: Optional[str] = None
    utility_shifting_remarks: Optional[str] = None
    source_document: str
    source_page_number: int
    review_reporting_date: datetime.datetime
    extraction_confidence: float = 0.95
    verification_status: str
    sanction_vs_contract_discrepancy: bool = False
    discrepancy_details: Optional[str] = None
    raw_extracted_text: Optional[str] = None
    raw_extracted_json: Optional[str] = None
    verified_by_officer: Optional[str] = None
    verified_at: Optional[datetime.datetime] = None
    risk_level: str
    data_mode: str = "SIMULATED"
    active_blockers_count: Optional[int] = 0
    critical_blockers_count: Optional[int] = 0
    financial_exposure_cr: Optional[float] = 0.0

    class Config:
        from_attributes = True


class SnapshotVerifyIn(BaseModel):
    verified: bool = True
    verification_status: Optional[str] = "VERIFIED"  # VERIFIED, CONFLICTING
    verified_by_officer: str
    notes: Optional[str] = None
    update_canonical: bool = True
    corrected_contract_value_cr: Optional[float] = None
    corrected_technical_sanction_cr: Optional[float] = None
    corrected_physical_progress_pct: Optional[float] = None
    corrected_financial_progress_pct: Optional[float] = None
    corrected_estimated_completion_date: Optional[datetime.datetime] = None


class ReconciliationReportOut(BaseModel):
    total_staged_records: int
    verified_records_count: int
    pending_verification_count: int
    conflicting_records_count: int
    discrepancy_records_count: int
    missing_fields_inventory: List[dict]
    provenance_summary: str
    simulated_data_badge: str = "SIMULATED"


class MajorWorksPortfolioOverviewOut(BaseModel):
    total_major_works_count: int
    total_sanctioned_value_cr: float
    total_contract_value_cr: float
    total_expenditure_cr: float
    avg_physical_progress_pct: float
    avg_financial_progress_pct: float
    projects_with_critical_blockers_count: int
    projects_delayed_over_180_days_count: int
    total_completion_delay_days: int
    total_verified_actual_additional_cost_cr: float
    total_forecast_financial_exposure_cr: float
    total_potentially_avoidable_cost_cr: float
    unresolved_interdepartmental_issues_count: int
    data_freshness_timestamp: str
    simulated_data_badge: str = "SIMULATED"
    items: List[MajorWorksProjectReviewOut]


class ProjectBlockerIn(BaseModel):
    project_id: int
    major_work_id: Optional[int] = None
    delay_event_id: Optional[int] = None
    work_package_id: Optional[int] = None
    chainage_location: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    description: str
    affected_milestone: Optional[str] = None
    is_critical_path: bool = True
    primary_cause: str
    contributing_causes: Optional[str] = None
    is_litigation_pending: bool = False
    has_operative_stay_order: bool = False
    court_order_details: Optional[str] = None
    responsible_resolution_authority: str
    assigned_action_owner: str
    external_department_or_contractor: Optional[str] = None
    supporting_evidence: Optional[str] = None
    financial_exposure_cr: Optional[float] = None
    is_financial_exposure_quantified: bool = False
    required_mitigation: Optional[str] = None
    target_resolution_date: Optional[datetime.datetime] = None
    escalation_level: Optional[str] = "DIVISION"


class ProjectBlockerStatusUpdateIn(BaseModel):
    status: str
    closure_remarks: Optional[str] = None
    closure_evidence: Optional[str] = None


class ProjectBlockerOut(BaseModel):
    id: int
    blocker_code: str
    project_id: int
    project_name: Optional[str] = None
    major_work_id: Optional[int] = None
    delay_event_id: Optional[int] = None
    work_package_id: Optional[int] = None
    chainage_location: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    description: str
    date_identified: datetime.datetime
    blocker_start_date: datetime.datetime
    current_status: str
    affected_milestone: Optional[str] = None
    is_critical_path: bool
    primary_cause: str
    contributing_causes: Optional[str] = None
    is_litigation_pending: bool = False
    has_operative_stay_order: bool = False
    court_order_details: Optional[str] = None
    responsible_resolution_authority: str
    assigned_action_owner: str
    external_department_or_contractor: Optional[str] = None
    supporting_evidence: Optional[str] = None
    supporting_evidence_url: Optional[str] = None
    provenance_note: Optional[str] = "SEEDED DEMO - Not yet verified"
    days_affected: int
    financial_exposure_cr: Optional[float] = None
    is_financial_exposure_quantified: bool
    required_mitigation: Optional[str] = None
    target_resolution_date: Optional[datetime.datetime] = None
    escalation_level: str
    last_update: datetime.datetime
    closure_evidence: Optional[str] = None
    closure_remarks: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ObligationIn(BaseModel):
    project_id: int
    work_package_id: Optional[int] = None
    blocker_id: Optional[int] = None
    owner_party: str
    deliverable: str
    due_date: Optional[datetime.datetime] = None
    acceptance_criteria: str
    status: Optional[str] = "PENDING"


class ObligationOut(BaseModel):
    id: int
    obligation_code: str
    project_id: int
    project_name: Optional[str] = None
    work_package_id: Optional[int] = None
    blocker_id: Optional[int] = None
    blocker_code: Optional[str] = None
    owner_party: str
    deliverable: str
    due_date: Optional[datetime.datetime] = None
    acceptance_criteria: str
    status: str
    verification_status: str
    provenance_note: str = "SEEDED DEMO - Not yet verified"
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class EvidenceRequestIn(BaseModel):
    project_id: int
    work_package_id: Optional[int] = None
    blocker_id: Optional[int] = None
    delay_event_id: Optional[int] = None
    item_requested: str
    requested_from_party: str
    due_date: Optional[datetime.datetime] = None
    status: Optional[str] = "OPEN"


class EvidenceRequestOut(BaseModel):
    id: int
    request_code: str
    project_id: int
    project_name: Optional[str] = None
    work_package_id: Optional[int] = None
    blocker_id: Optional[int] = None
    blocker_code: Optional[str] = None
    delay_event_id: Optional[int] = None
    item_requested: str
    requested_from_party: str
    due_date: Optional[datetime.datetime] = None
    status: str
    verification_status: str
    provenance_note: str = "SEEDED DEMO - Not yet verified"
    submission_notes: Optional[str] = None
    submission_evidence_url: Optional[str] = None
    verified_by_officer: Optional[str] = None
    verified_at: Optional[datetime.datetime] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class DelayInvestigationOut(BaseModel):
    id: int
    investigation_code: str
    project_id: int
    project_name: Optional[str] = None
    major_work_id: Optional[int] = None
    baseline_completion_date: datetime.datetime
    approved_revised_completion_date: Optional[datetime.datetime] = None
    current_forecast_completion_date: datetime.datetime
    delay_days_from_baseline: int
    delay_days_from_revised: int
    milestone_health_verdict: str
    physical_vs_financial_variance_pct: float
    unanswered_interdept_requests_count: int
    unanswered_days_max: int
    critical_path_assessment: str
    preliminary_findings: str
    unverified_assumptions: Optional[str] = None
    evidence_checklist_pending: Optional[str] = None
    responsible_investigator_name: str
    investigation_status: str
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class LossPreventionLedgerRecordOut(BaseModel):
    id: int
    ledger_code: str
    project_id: int
    project_name: Optional[str] = None
    major_work_id: Optional[int] = None
    blocker_id: Optional[int] = None
    account_name: str
    amount_cr: Optional[float] = None
    is_quantified: bool
    formula_description: str
    input_parameters_json: Optional[str] = None
    source_reference: str
    assumptions_text: Optional[str] = None
    applicable_period: Optional[str] = None
    data_confidence: str
    is_verified: bool
    responsible_reviewer_name: str
    action_created_for_unquantified: bool
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class LossPreventionLedgerDashboardOut(BaseModel):
    summary: dict
    records: List[LossPreventionLedgerRecordOut]
    simulated_data_badge: str = "SIMULATED"


class MitigationRecommendationOut(BaseModel):
    id: int
    mitigation_code: str
    project_id: int
    project_name: Optional[str] = None
    major_work_id: Optional[int] = None
    blocker_id: int
    blocker_code: Optional[str] = None
    stopping_what: str
    stopping_why: str
    supporting_evidence: str
    missing_information: Optional[str] = None
    resolving_authority: str
    lawful_actions_available: str
    expected_resolution_timeline_days: int
    estimated_intervention_cost_cr: float
    avoidable_delay_days: int
    avoidable_cost_cr: float
    approval_authority: str
    verification_criteria: str
    human_approval_status: str
    approved_by_officer: Optional[str] = None
    approval_date: Optional[datetime.datetime] = None
    approval_notes: Optional[str] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class MitigationApproveIn(BaseModel):
    approved: bool
    approval_notes: Optional[str] = None
    approving_officer: Optional[str] = None


class PreConstructionGateCheckOut(BaseModel):
    id: int
    gate_code: str
    project_id: int
    project_name: Optional[str] = None
    major_work_id: Optional[int] = None
    stage: str
    chainage_km_start: float
    chainage_km_end: float
    land_survey_readiness_pct: float
    acquisition_possession_cleared: bool
    court_restrictions_active: bool
    operative_stay_details: Optional[str] = None
    forest_clearance_cleared: bool
    environmental_approval_cleared: bool
    railway_coordination_cleared: bool
    utility_shifting_cleared: bool
    design_technical_approved: bool
    site_access_cleared: bool
    contractual_readiness_cleared: bool
    safety_requirements_cleared: bool
    readiness_state: str  # RED, AMBER, GREEN
    restriction_summary: str
    lawful_resolution_required: str
    authorized_override_status: str
    override_justification: Optional[str] = None
    override_authority: Optional[str] = None
    override_date: Optional[datetime.datetime] = None
    data_mode: str = "SIMULATED"
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class PreConstructionGateOverrideIn(BaseModel):
    override_authority: str
    justification: str


class MajorWorksCMSummaryOut(BaseModel):
    total_major_works_reviewed: int
    projects_with_critical_blockers: int
    projects_with_completion_extensions: int
    top_interdepartmental_dependencies: List[dict]
    railway_coordination_risks: List[dict]
    land_and_litigation_risks: List[dict]
    actual_additional_expenditure_cr: float
    forecast_incremental_expenditure_cr: float
    potentially_avoidable_cost_cr: float
    unresolved_corrective_actions_count: int
    projects_requiring_senior_intervention: List[dict]
    reference_case_5566: dict
    simulated_data_badge: str = "SIMULATED"


class MajorWorksAIQueryIn(BaseModel):
    query: str
    project_id: Optional[int] = None
    blocker_id: Optional[int] = None


class MajorWorksAIQueryOut(BaseModel):
    query: str
    verified_facts: List[str]
    missing_information: List[str]
    evidence_references: List[str]
    resolving_authority: str
    recommended_next_action: str
    lawful_options_available: List[str]
    avoidable_exposure_cr: float
    urgency_level: str
    uncertainty_and_limitations: str
    confidence_score: float
    simulated_data_badge: str = "SIMULATED"
