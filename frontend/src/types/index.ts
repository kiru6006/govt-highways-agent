export type RoadType = 'SH' | 'NH' | 'MDR' | 'ODR' | 'RURAL';

export interface UserInfo {
  id: number;
  username: string;
  full_name: string;
  role_code: string;
  role_name: string;
  department_name?: string;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  contractor_id?: number;
  is_active: boolean;
}

export interface ProjectItem {
  id: number;
  project_code: string;
  title: string;
  description?: string;
  road_type: RoadType;
  estimated_cost_cr: number;
  sanctioned_cost_cr: number;
  expenditure_to_date_cr: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  status: string;
  priority: string;
  zone_id: number;
  circle_id: number;
  division_id: number;
  contractor_id?: number;
  contractor_name?: string;
  road_name?: string;
  created_at: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  planned_start_date?: string;
  planned_completion_date?: string;
  revised_cost_cr?: number;
  sanction_as_number?: string;
  sanction_as_date?: string;
  sanction_ts_number?: string;
  sanction_ts_date?: string;
  carriageway_width_m?: number;
  lane_configuration?: string;
  pavement_type?: string;
  total_length_km?: number;
  start_chainage_km?: number;
  end_chainage_km?: number;
  funding_source?: string;
  project_director_name?: string;
  responsible_ee_name?: string;
  programme_id?: number;
  programme_code?: string;
  verification_status?: string;
}

export interface DepartmentDependencyItem {
  id: number;
  project_id: number;
  project_title?: string;
  requesting_dept_name: string;
  target_dept_name: string;
  dependency_type: string;
  description: string;
  impact_days: number;
  status: string;
  target_clearance_date?: string;
}

export interface IssueItem {
  id: number;
  issue_reference: string;
  category: string;
  description: string;
  project_id: number;
  project_title?: string;
  priority: string;
  status: string;
  escalation_status: string;
  assigned_to_name?: string;
  assigned_date: string;
  target_resolution_date?: string;
  resolution_notes?: string;
}

export interface WorkflowTaskItem {
  id: number;
  task_reference: string;
  project_id: number;
  project_title?: string;
  issue_id?: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  assigned_to_name?: string;
  created_by_name?: string;
  created_at: string;
}

export interface AuditEventItem {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  entity_reference?: string;
  changes_json?: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  delayed_projects: number;
  total_sanctioned_cr: number;
  total_expenditure_cr: number;
  pending_bottlenecks: number;
  critical_issues: number;
  active_tasks: number;
  road_network_counts: {
    SH: number;
    NH: number;
    MDR: number;
    ODR: number;
    RURAL: number;
  };
  is_demo: boolean;
}

export interface AskAIResult {
  answer: string;
  suggested_actions: string[];
  grounding_references: Array<{
    type: string;
    reference: string;
    detail: string;
  }>;
  is_demo: boolean;
  disclaimer: string;
}

// -------------------------------------------------------------
// Phase 2 Executive Command Centre Types
// -------------------------------------------------------------

export interface ExecutiveKPIs {
  total_active_projects: number;
  total_approved_project_value_cr: number;
  total_expenditure_cr: number;
  total_physical_progress_pct: number;
  projects_delayed: number;
  projects_high_risk: number;
  pending_approvals: number;
  pending_land_acquisition_ha: number;
  pending_utility_shifting_count: number;
  open_quality_defects: number;
  pending_contractor_obligations: number;
  open_legal_cases: number;
  unresolved_audit_observations: number;
  potential_financial_exposure_cr: number;
  verified_financial_recovery_cr: number;
  verified_prevented_expenditure_cr: number;
  reporting_period: string;
  data_freshness: string;
  cohort_sample_size: number;
  is_demo: boolean;
}

export interface PortfolioStageItem {
  stage: string;
  count: number;
  cost_cr: number;
  avg_progress_pct: number;
}

export interface ZoneComparisonItem {
  zone_id: number;
  zone_code: string;
  zone_name: string;
  headquarters: string;
  active_projects_count: number;
  completed_projects_pct: number;
  average_project_delay_days: number;
  budget_utilisation_pct: number;
  quality_defects_count: number;
  pending_approvals_count: number;
  land_acquisition_pending_ha: number;
  contractor_performance_score: number;
  cohort_sample_size: number;
  data_completeness_pct: number;
}

export interface CriticalLeadershipIssue {
  id: number;
  issue_reference: string;
  project_id: number;
  project_title: string;
  district: string;
  category: string;
  problem_description: string;
  root_cause: string;
  responsible_officer: string;
  responsible_external_dept?: string;
  contractor_name?: string;
  days_pending: number;
  schedule_impact_days: number;
  financial_exposure_cr: number;
  evidence_available?: string;
  recommended_action: string;
  escalation_level: string;
  priority: string;
  status: string;
  date_raised: string;
}

export interface InterdepartmentalBlocker {
  id: number;
  project_id: number;
  project_title: string;
  department_category: string;
  approval_required: string;
  submission_date?: string;
  latest_correspondence?: string;
  responsible_highways_officer: string;
  external_contact?: string;
  days_pending: number;
  expected_timeline?: string;
  reason_for_delay: string;
  supporting_documents?: string;
  recommended_action: string;
  status: string;
}

export interface FinancialLeakageFinding {
  id: number;
  finding_code: string;
  project_id: number;
  project_title: string;
  category: string;
  title: string;
  potential_exposure_cr: number;
  verified_loss_cr: number;
  verified_recovery_cr: number;
  prevented_expenditure_cr: number;
  evidence_summary: string;
  calculation_details: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  validation_status: 'INVESTIGATION_INDICATOR' | 'VERIFIED' | 'INFERRED' | 'TO_VALIDATE';
  responsible_officer: string;
  recommended_investigation: string;
  created_at: string;
}

export interface QualityDefectRecord {
  id: number;
  defect_code: string;
  project_id: number;
  project_title: string;
  road_code?: string;
  defect_type: string;
  chainage_km?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  observation_notes: string;
  lab_report_ref?: string;
  corrective_action_status: string;
  responsible_engineer: string;
  created_at: string;
}

export interface ContractorEvaluation {
  id: number;
  contractor_id: number;
  contractor_name: string;
  project_id: number;
  project_title: string;
  performance_score: number;
  behind_schedule_days: number;
  repeated_defects_count: number;
  delayed_submissions_count: number;
  time_extension_requests: number;
  claims_disputes_cr: number;
  performance_tier: string;
  assessment_notes?: string;
}

export interface LegalMatter {
  id: number;
  case_reference: string;
  court_forum: string;
  project_id: number;
  project_title: string;
  matter_type: string;
  plaintiff_petitioner: string;
  case_summary: string;
  interim_stay_in_force: boolean;
  next_hearing_date?: string;
  statutory_deadline?: string;
  ag_audit_para_ref?: string;
  responsible_legal_officer: string;
  status: string;
}

export interface LeadershipDecision {
  id: number;
  decision_reference: string;
  project_id?: number;
  project_title?: string;
  leadership_issue_id?: number;
  required_decision: string;
  assigned_authority: string;
  action_type: string;
  supporting_evidence?: string;
  due_date?: string;
  status: string;
  resolution_notes?: string;
  created_by_name: string;
  created_at: string;
}

export interface ExecutiveFilters {
  financial_year: string;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  road_type?: string;
  risk_status?: string;
  stage?: string;
}

// Separate Leadership Workspaces
export interface UrgentMinisterialIntervention {
  title: string;
  dept: string;
  action: string;
  days_pending: number;
  impact: string;
}

export interface DistrictImpactSummary {
  district: string;
  active_projects: number;
  outlay_cr: number;
  completion_pct: number;
  status: string;
}

export interface PendingDirectiveSummary {
  ref: string;
  subject: string;
  due_date: string;
  urgency: string;
}

export interface MinisterStrategicKPIs {
  total_capital_outlay_cr: number;
  major_corridors_count: number;
  statewide_completion_rate: number;
  critical_public_delays_count: number;
  inter_ministerial_blockers_count: number;
  land_acquisition_cleared_pct: number;
  zero_pothole_compliance_pct: number;
  public_grievances_resolved: number;
}

export interface MinisterAIBriefing {
  headline: string;
  summary: string;
  urgent_interventions: UrgentMinisterialIntervention[];
  district_sentiment: string;
}

export interface MinisterOverview {
  strategic_kpis: MinisterStrategicKPIs;
  ai_briefing: MinisterAIBriefing;
  district_impact: DistrictImpactSummary[];
  cabinet_decisions_pending: PendingDirectiveSummary[];
  data_freshness: string;
  reporting_period: string;
}

export interface OfficerAccountabilityAlert {
  officer: string;
  issue: string;
  pending_days: number;
  action: string;
}

export interface SecretaryAIBriefing {
  headline: string;
  summary: string;
  accountability_alerts: OfficerAccountabilityAlert[];
  financial_controls: string;
}

export interface SecretaryOverview {
  governance_kpis: ExecutiveKPIs;
  ai_briefing: SecretaryAIBriefing;
  zone_performance: ZoneComparisonItem[];
  secretarial_actions_pending: PendingDirectiveSummary[];
  data_freshness: string;
  reporting_period: string;
}

export interface StatutoryCommitteeItem {
  id: number;
  code: string;
  name: string;
  chairperson_title: string;
  mandate_summary: string;
  constitution_go: string;
}

export interface DesignationItem {
  id: number;
  code: string;
  title: string;
  hierarchical_rank: number;
  is_gazetted: boolean;
  technical_sanction_limit_cr: number;
  tender_acceptance_limit_cr: number;
}

export interface DelegationOfAuthorityItem {
  id: number;
  designation_code: string;
  power_type: string;
  monetary_limit_cr: number;
  tender_excess_pct_limit: number;
  statutory_rule_reference: string;
  remarks?: string;
}

export interface HistoricalPostingItem {
  id: number;
  designation_title: string;
  posting_unit: string;
  posting_type: string;
  from_date: string;
  to_date?: string;
  is_current: boolean;
  transfer_go_reference?: string;
}

export interface VerifiedOfficialItem {
  id: number;
  name: string;
  designation: string;
  wing?: string;
  phone?: string;
  email?: string;
  office_address?: string;
  charge_status: string;
  verification_status: string;
  tenures: HistoricalPostingItem[];
}

export interface FunctionalPermissionGroupItem {
  code: string;
  name: string;
  nature: string;
  is_statutory_cadre: boolean;
  mandate: string;
}

export interface ExternalStakeholderItem {
  department: string;
  spoc: string;
  portfolio: string;
  clearance: string;
  status: string;
}

export interface ZoneHierarchyItem {
  name: string;
  hq: string;
  chief_engineer: string;
  circles: string[];
  divisions_count: number;
  jurisdiction: string;
}

export interface VerifiedOrganisationStructure {
  minister: {
    name: string;
    designation: string;
    portfolio: string;
    office: string;
    verification_status: string;
    source: string;
  };
  principal_secretary: {
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    office: string;
    verification_status: string;
    source: string;
  };
  heads_of_department: VerifiedOfficialItem[];
  statutory_committees: StatutoryCommitteeItem[];
  delegations_of_authority: DelegationOfAuthorityItem[];
  functional_permission_groups: FunctionalPermissionGroupItem[];
  external_stakeholders: ExternalStakeholderItem[];
  zones_hierarchy: ZoneHierarchyItem[];
  verification_metadata: {
    rules_citation: string;
    statutory_delegation_citation: string;
    verification_date: string;
    cadre_rule: string;
  };
}

export interface GovernmentDocumentItem {
  id: number;
  document_reference: string;
  title: string;
  category: string;
  issuing_department: string;
  go_number?: string;
  order_date?: string;
  effective_date?: string;
  last_verified_date?: string;
  verification_status: string;
  source_url?: string;
  summary_abstract: string;
  is_confidential: boolean;
}

export interface CommitteeDecisionItem {
  id: number;
  decision_reference: string;
  committee_id: number;
  subject: string;
  decision_type: string;
  decision_text: string;
  statutory_condition?: string;
  government_order_ref?: string;
  effective_date: string;
  verification_status: string;
}

export interface CommitteeMeetingItem {
  id: number;
  meeting_reference: string;
  committee_id: number;
  meeting_date: string;
  venue: string;
  chairperson_name: string;
  agenda_summary: string;
  minutes_summary: string;
  verification_status: string;
  decisions: CommitteeDecisionItem[];
}

export interface StatutoryCommitteeDetailItem {
  id: number;
  code: string;
  name: string;
  chairperson_title: string;
  mandate_summary: string;
  constitution_go: string;
  meetings: CommitteeMeetingItem[];
  decisions: CommitteeDecisionItem[];
}

export interface StatutoryReferralItem {
  id: number;
  project_id: number;
  committee_code: string;
  referral_type: string;
  trigger_value: number;
  threshold_limit: number;
  referral_reason: string;
  statutory_rule_citation: string;
  status: string;
  referral_date: string;
  responsible_officer: string;
}

export interface AIIntelligenceFindingItem {
  id: number;
  finding_type: string;
  entity_type: string;
  entity_id?: number;
  headline: string;
  evidence_summary: string;
  explanation: string;
  confidence: string;
  human_validation_status: string;
  recommended_action: string;
  statutory_rule_citation: string;
  created_at: string;
}

export interface CorridorAlignmentItem {
  id: number;
  programme_id: number;
  corridor_code: string;
  name: string;
  start_location: string;
  end_location: string;
  districts: string[];
  total_length_km: number;
  coordinates_geojson: string;
  status: string;
}

export interface TenderItem {
  id: number;
  tender_notice_number: string;
  package_number: string;
  title: string;
  programme_id: number;
  programme_code?: string;
  project_id?: number;
  project_title?: string;
  estimated_cost_cr: number;
  earnest_money_deposit_lakhs?: number;
  funding_source: string;
  bid_validity_days: number;
  procurement_type: string;
  publication_date: string;
  pre_bid_meeting_date?: string;
  bid_submission_deadline: string;
  technical_opening_date?: string;
  financial_opening_date?: string;
  status: string;
  successful_bidder_name?: string;
  contract_awarded_value_cr?: number;
  official_source_url?: string;
  pdf_filename?: string;
}

export interface LandParcelItem {
  id: number;
  parcel_reference: string;
  programme_id: number;
  project_id?: number;
  package_number?: string;
  district: string;
  taluk: string;
  village: string;
  survey_numbers_json: string;
  land_category: string;
  extent_sq_meters: number;
  extent_hectares: number;
  sec15_2_gazette_date?: string;
  sec15_1_declaration_date?: string;
  sec19_1_award_date?: string;
  total_compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  possession_status: string;
  has_litigation: boolean;
  court_case_reference?: string;
}

export interface LegalCaseItem {
  id: number;
  case_number: string;
  court_name: string;
  case_type: string;
  programme_id: number;
  project_id?: number;
  package_number?: string;
  petitioner: string;
  respondent: string;
  subject_matter: string;
  prayer_summary: string;
  interim_stay_granted: boolean;
  stay_order_date?: string;
  potential_financial_exposure_cr: number;
  delay_impact_months: number;
  next_hearing_date?: string;
  standing_counsel_name?: string;
  status: string;
}

export interface ProgrammeItem {
  id: number;
  code: string;
  name: string;
  parent_corridor?: string;
  funding_agency: string;
  approved_cost_cr: number;
  revised_cost_cr: number;
  total_corridor_length_km: number;
  website_url?: string;
  status: string;
  alignments?: CorridorAlignmentItem[];
  tenders?: TenderItem[];
}

export interface ProgrammeOverviewKPIs {
  programme_code: string;
  programme_name: string;
  funding_agency: string;
  total_approved_outlay_cr: number;
  total_expenditure_cr: number;
  financial_progress_pct: number;
  physical_progress_pct: number;
  total_corridor_length_km: number;
  total_projects: number;
  total_work_packages: number;
  active_tenders_count: number;
  tenders_value_cr: number;
  land_acquisition_total_sq_m: number;
  land_possession_pct: number;
  compensation_disbursed_cr: number;
  active_litigations_count: number;
  active_stays_count: number;
  litigation_financial_exposure_cr: number;
}

// -------------------------------------------------------------
// Phase 3: Project 360° Intelligence Interfaces
// -------------------------------------------------------------

export interface WorkPackageItem {
  id: number;
  project_id: number;
  package_number: string;
  title: string;
  scope_description?: string;
  cost_cr: number;
  start_km: number;
  end_km: number;
  status: string;
}

export interface ApprovalItem {
  id: number;
  project_id: number;
  approval_type: string;
  reference_number: string;
  sanction_amount_cr: number;
  approved_by_role: string;
  status: string;
  approval_date: string;
}

export interface ProjectMilestoneItem {
  id: number;
  project_id: number;
  work_package_id?: number;
  milestone_code: string;
  title: string;
  description?: string;
  target_date: string;
  actual_date?: string;
  target_physical_pct: number;
  actual_physical_pct: number;
  delay_days: number;
  status: string;
  weightage_pct: number;
}

export interface ProjectRiskItem {
  id: number;
  project_id: number;
  risk_code: string;
  category: string;
  title: string;
  description: string;
  probability: string;
  impact: string;
  severity_score: number;
  mitigation_strategy: string;
  status: string;
  created_at: string;
}

export interface ProjectProgressRecordItem {
  id: number;
  project_id: number;
  reporting_month: string;
  planned_physical_pct: number;
  actual_physical_pct: number;
  planned_financial_pct: number;
  actual_financial_pct: number;
  expenditure_in_month_cr: number;
  cumulative_expenditure_cr: number;
  earned_value_cr: number;
  planned_value_cr: number;
  cost_variance_cr: number;
  schedule_variance_cr: number;
  remarks?: string;
  created_at: string;
}

export interface EVMVarianceMetrics {
  planned_value_cr: number;
  earned_value_cr: number;
  actual_cost_cr: number;
  cost_variance_cr: number;
  schedule_variance_cr: number;
  cost_performance_index: number;
  schedule_performance_index: number;
  schedule_variance_days: number;
  planned_physical_pct: number;
  actual_physical_pct: number;
  physical_variance_pct: number;
  planned_financial_pct: number;
  actual_financial_pct: number;
  financial_variance_pct: number;
  status_assessment: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_DELAY' | 'COST_OVERRUN';
}

export interface ProjectStakeholderItem {
  id: number;
  stakeholder_type: string;
  department_name?: string;
  contact_person: string;
  email?: string;
  phone?: string;
  responsibility_scope?: string;
  designation?: string;
  posting_unit?: string;
}

export interface Project360Detail {
  project: ProjectItem;
  jurisdiction_hierarchy: {
    zone_name: string;
    circle_name: string;
    division_name: string;
    district: string;
  };
  technical_specs: {
    road_name: string;
    road_code: string;
    road_type: string;
    carriageway_width_m: number;
    lane_configuration: string;
    pavement_type: string;
    total_length_km: number;
    start_chainage_km: number;
    end_chainage_km: number;
    terrain: string;
    funding_programme: string;
  };
  sanctions: ApprovalItem[];
  milestones: ProjectMilestoneItem[];
  execution_tracking: EVMVarianceMetrics;
  progress_history: ProjectProgressRecordItem[];
  work_packages: WorkPackageItem[];
  contractors_and_consultants: {
    main_contractor: {
      name: string;
      registration: string;
      class: string;
      pan?: string;
      gst?: string;
    };
    contracts: Array<{
      agreement_number: string;
      agreement_date?: string;
      contract_value_cr: number;
      performance_security_cr: number;
      status: string;
    }>;
    consultants: Array<{
      company_name: string;
      assignment_title: string;
      contract_value_cr: number;
      status: string;
    }>;
  };
  assigned_officials_and_stakeholders: ProjectStakeholderItem[];
  land_acquisition: {
    total_parcels: number;
    total_land_sqm: number;
    total_land_hectares: number;
    compensation_assessed_cr: number;
    compensation_paid_cr: number;
    parcels: Array<{
      parcel_ref: string;
      district: string;
      taluk: string;
      village: string;
      survey_number: string;
      classification: string;
      total_sqm: number;
      sec15_2_date?: string;
      sec15_1_date?: string;
      sec19_1_date?: string;
      compensation_paid_cr: number;
      possession_status: string;
      has_litigation: boolean;
    }>;
  };
  utilities_and_dependencies: {
    total_dependencies: number;
    pending_clearances: number;
    total_impact_days: number;
    items: DepartmentDependencyItem[];
  };
  engineering_quality: {
    total_defects_logged: number;
    critical_unresolved: number;
    records: Array<{
      defect_reference: string;
      component_type: string;
      description: string;
      severity: string;
      status: string;
      financial_penalty_cr: number;
      rectification_deadline?: string;
    }>;
  };
  legal_cases: {
    total_cases: number;
    active_stays_count: number;
    total_financial_exposure_cr: number;
    items: LegalCaseItem[];
  };
  documents: Array<{
    id: number;
    document_title: string;
    file_name: string;
    mime_type: string;
    file_size_bytes: number;
    sha256_hash: string;
    is_verified: boolean;
    created_at: string;
  }>;
  risks_and_issues: {
    open_risks: number;
    critical_issues: number;
    risks: ProjectRiskItem[];
    issues: Array<{
      issue_ref: string;
      category: string;
      description: string;
      priority: string;
      status: string;
      escalation_status: string;
    }>;
  };
  ai_findings: AIIntelligenceFindingItem[];
  audit_history: AuditEventItem[];
}



