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
    minister: dict
    principal_secretary: dict
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
