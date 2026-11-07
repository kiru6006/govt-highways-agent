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
  requesting_dept_name?: string;
  target_dept_name?: string;
  department_name?: string;
  days_pending?: number;
  schedule_delay_days?: number;
  action_required?: string;
  contact_officer?: string;
  impact_cost_cr?: number;
  dependency_type: string;
  description?: string;
  impact_days?: number;
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
  actor_name?: string;
  actor_role?: string;
  user_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  entity_reference?: string;
  entity_name?: string;
  details?: string;
  changes_json?: string;
  ip_address?: string;
  created_at?: string;
  timestamp?: string;
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
  project_id?: number;
  project_title?: string;
  finding_type: string;
  entity_type?: string;
  entity_id?: number;
  headline?: string;
  issue_summary?: string;
  evidence_summary?: string;
  evidence_chain?: string;
  explanation?: string;
  confidence?: string;
  severity?: string;
  root_cause_category?: string;
  is_verified_by_model?: boolean;
  human_validation_status: string;
  recommended_action: string;
  statutory_rule_citation: string;
  created_at?: string;
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
  case_type?: string;
  category?: string;
  programme_id?: number;
  project_id?: number;
  package_number?: string;
  petitioner: string;
  respondent?: string;
  subject_matter?: string;
  prayer_summary?: string;
  interim_stay_granted?: boolean;
  stay_order_active?: boolean;
  stay_details?: string;
  stay_order_date?: string;
  potential_financial_exposure_cr?: number;
  financial_exposure_cr?: number;
  delay_impact_months?: number;
  schedule_delay_days?: number;
  next_hearing_date?: string;
  standing_counsel?: string;
  standing_counsel_name?: string;
  status?: string;
  case_status?: string;
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
  contractor_id?: number;
  contractor_name?: string;
  package_number?: string;
  package_code?: string;
  title: string;
  scope_description?: string;
  cost_cr?: number;
  sanctioned_amount_cr?: number;
  start_km?: number;
  end_km?: number;
  start_chainage_km?: number;
  end_chainage_km?: number;
  physical_progress_pct?: number;
  financial_progress_pct?: number;
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
  title?: string;
  description: string;
  probability: string;
  impact: string;
  severity_score?: number;
  risk_score?: number;
  owner_role?: string;
  mitigation_strategy: string;
  status: string;
  created_at?: string;
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
  planned_financial_pct?: number;
  actual_financial_pct?: number;
  financial_variance_pct: number;
  status_assessment: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_DELAY' | 'COST_OVERRUN';
}

export interface ProjectStakeholderItem {
  id?: number;
  stakeholder_type?: string;
  department_name?: string;
  contact_person?: string;
  officer_name?: string;
  role_label?: string;
  department?: string;
  office_location?: string;
  email?: string;
  phone?: string;
  responsibility_scope?: string;
  designation?: string;
  posting_unit?: string;
}

export interface Project360Detail {
  project?: ProjectItem;
  id?: number;
  project_code?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  verification_status?: string;
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
  ai_project_intelligence?: {
    title: string;
    executive_summary: string;
    critical_findings: string[];
    root_cause_analysis: {
      land_acquisition: string;
      utility_shifting: string;
      departmental_approvals: string;
      contractor_performance: string;
      funding_and_payment: string;
      engineering_quality: string;
      legal_restrictions: string;
      field_execution: string;
    };
    recommended_actions: string[];
    decision_required: {
      reference: string;
      decision_title: string;
      decision_authority: string;
      current_status: string;
      recommended_directive: string;
    };
  };
  field_operations?: {
    total_inspections: number;
    verified_progress_pct: number;
    last_inspection_date: string;
    inspections: Array<{
      inspection_id: string;
      date: string;
      officer_name: string;
      site_location: string;
      package_name: string;
      work_activity: string;
      progress_reported_pct: number;
      progress_verified_pct: number;
      findings: string;
      verified_by_geo_tag: boolean;
      has_photo_evidence: boolean;
      photo_url?: string;
      follow_up_action: string;
    }>;
  };
  assets?: {
    total_assets: number;
    road_carriageway_km: number;
    bridges_count: number;
    culverts_count: number;
    items: Array<{
      asset_id: string;
      asset_type: string;
      name: string;
      location: string;
      condition: string;
      last_inspection: string;
      maintenance_status: string;
    }>;
  };
  citizen_grievances?: {
    total_grievances: number;
    resolved_count: number;
    pending_count: number;
    critical_count: number;
    items: Array<{
      grievance_id: string;
      category: string;
      location: string;
      date_received: string;
      petitioner_type: string;
      assigned_officer: string;
      status: string;
      resolution_target: string;
      resolution_details: string;
    }>;
  };
  financial_transactions?: Array<{
    txn_reference: string;
    voucher_number: string;
    package_name: string;
    contractor_name: string;
    bill_date: string;
    bill_type: string;
    bill_amount_cr: number;
    approved_amount_cr: number;
    paid_amount_cr: number;
    payment_status: string;
    supporting_evidence_status: string;
  }>;
  actions_register?: Array<{
    action_id: string;
    issue: string;
    department: string;
    assigned_officer: string;
    priority: string;
    target_date: string;
    status: string;
    remarks: string;
  }>;
  utility_shifting?: {
    total_utilities: number;
    shifting_in_progress: number;
    completed: number;
    estimated_shifting_cost_cr: number;
    items: Array<{
      utility_type: string;
      department: string;
      affected_chainage: string;
      quantity: number;
      unit: string;
      estimated_cost_cr: number;
      deposit_status: string;
      work_status: string;
      schedule_impact_days: number;
    }>;
  };
}

// -------------------------------------------------------------
// AI Leakage & Anomaly Intelligence Types (Prompt 01)
// -------------------------------------------------------------

export interface AnomalyActionHistoryItem {
  id: number;
  finding_id: number;
  action_type: string;
  actor_name: string;
  actor_role: string;
  old_status?: string;
  new_status?: string;
  remarks?: string;
  action_details?: string;
  due_date?: string;
  created_at: string;
}

export interface AnomalyFindingItem {
  id: number;
  finding_code: string;
  project_id: number;
  project_title: string;
  project_code?: string;
  package_id?: number;
  package_name?: string;
  contractor_id?: number;
  contractor_name?: string;
  category: string;
  title: string;
  description?: string;
  what_detected?: string;
  why_flagged?: string;
  detection_rule?: string;
  calculation_formula?: string;
  potential_exposure_cr: number;
  transaction_value_cr: number;
  verified_impact_cr: number;
  amount_under_review_cr: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ai_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence_status: string;
  responsible_department: string;
  responsible_officer: string;
  review_status: 'NEW' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'VERIFIED' | 'NOT_SUBSTANTIATED' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  review_remarks?: string;
  suggested_verification?: string;
  recommended_action?: string;
  corrective_action?: string;
  action_due_date?: string;
  escalated_to_secretary?: boolean;
  evidence_records_json?: string;
  scenario_id?: string;
  data_mode?: string;
  data_status?: string;
  created_at: string;
  actions?: AnomalyActionHistoryItem[];
}

export interface LeakageKPIs {
  total_findings: number;
  critical_findings: number;
  high_risk_findings: number;
  potential_financial_exposure_cr: number;
  findings_awaiting_verification: number;
  corrective_actions_pending: number;
  data_mode: string;
  reporting_period: string;
  last_analysis_timestamp: string;
}

export interface CategorySummaryItem {
  category: string;
  count: number;
  total_exposure_cr: number;
  critical_count: number;
}

export interface ExposureAnalysisData {
  by_project: Array<{ project_id: number; project_code: string; title: string; exposure_cr: number }>;
  by_category: Array<{ category: string; exposure_cr: number }>;
  by_contractor: Array<{ contractor_id: number; name: string; exposure_cr: number }>;
  by_programme: Array<{ programme: string; exposure_cr: number }>;
  month_trend: Array<{ month: string; exposure_cr: number; count: number }>;
  total_transaction_value_cr: number;
  total_potential_exposure_cr: number;
  total_verified_impact_cr: number;
  total_under_review_cr: number;
}

export interface ProjectRiskScoreItem {
  project_id: number;
  project_code: string;
  project_title: string;
  programme: string;
  financial_risk_score: number;
  schedule_risk_score: number;
  procurement_risk_score: number;
  quality_risk_score: number;
  land_utility_risk_score: number;
  compliance_risk_score: number;
  overall_composite_risk: number;
  active_anomalies_count: number;
}

export interface ExecutiveAssessmentData {
  summary_narrative: string;
  overall_risk_assessment: string;
  critical_observations: string[];
  financial_exposure_estimate_cr: number;
  projects_requiring_immediate_attention: Array<{
    project_id: number;
    code: string;
    title: string;
    issue: string;
    exposure_cr: number;
  }>;
  recommended_executive_actions: Array<{
    action: string;
    authority: string;
    urgency: string;
  }>;
  observed_facts: string[];
  calculated_indicators: string[];
  ai_interpretations: string[];
}

export interface DecisionRequiredItem {
  id: number;
  finding_code: string;
  project_id: number;
  project_title: string;
  issue: string;
  impact: string;
  financial_exposure_cr: number;
  responsible_department: string;
  current_status: string;
  recommended_decision: string;
  escalation_level: string;
  due_date?: string;
}

// -------------------------------------------------------------
// Ministerial Reports & AI Decision Intelligence Types (Prompt 02)
// -------------------------------------------------------------

export interface ReportsOverviewData {
  total_active_projects: number;
  total_project_value_cr: number;
  total_budget_allocation_cr: number;
  total_expenditure_cr: number;
  physical_progress_avg_pct: number;
  delayed_projects_count: number;
  delayed_projects_value_cr: number;
  critical_risk_projects_count: number;
  pending_approvals_count: number;
  land_acquisition_pending_count: number;
  potential_financial_exposure_cr: number;
  reporting_period: string;
  frequency: string;
  last_updated_timestamp: string;
  data_mode: string;
  data_status: string;
  kpi_definitions: Record<string, string>;
}

export interface ProgrammePerformanceItem {
  programme_code: string;
  programme_name: string;
  projects_count: number;
  packages_count: number;
  approved_cost_cr: number;
  budget_allocation_cr: number;
  expenditure_cr: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  delayed_projects_count: number;
  high_risk_projects_count: number;
  variance_pct: number;
  status: string;
}

export interface ProjectPerformanceItem {
  project_id: number;
  project_code: string;
  project_title: string;
  programme: string;
  district: string;
  sanctioned_cost_cr: number;
  expenditure_to_date_cr: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  planned_completion_date: string;
  expected_completion_date: string;
  schedule_variance_days: number;
  contractor_id?: number;
  contractor_name: string;
  overall_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  has_critical_blocker: boolean;
}

export interface FinancialPerformanceData {
  approved_budget_cr: number;
  revised_budget_cr: number;
  actual_expenditure_cr: number;
  pending_bills_cr: number;
  payments_made_cr: number;
  retention_amount_cr: number;
  cost_variations_cr: number;
  potential_exposure_under_review_cr: number;
  budget_vs_expenditure_by_programme: Array<{
    programme: string;
    budget: number;
    expenditure: number;
    pending_bills: number;
  }>;
  monthly_expenditure_trend: Array<{
    month: string;
    expenditure: number;
    target: number;
    bills_cleared: number;
  }>;
  contractor_payment_distribution: Array<{
    contractor: string;
    disbursed: number;
    pending: number;
    retention: number;
  }>;
  pending_payment_ageing: Array<{
    age_bracket: string;
    bills_count: number;
    amount_cr: number;
    status: string;
  }>;
  cost_variation_analysis: Array<{
    project: string;
    original_cr: number;
    variation_cr: number;
    reason: string;
    approval_status: string;
  }>;
}

export interface SchedulePerformanceData {
  projects_on_schedule_count: number;
  delayed_projects_count: number;
  critical_delays_count: number;
  milestones_due_count: number;
  overdue_milestones_count: number;
  contract_extensions_count: number;
  delay_analysis_table: Array<{
    project_code: string;
    project_title: string;
    package_name: string;
    contractor: string;
    planned_completion: string;
    expected_completion: string;
    delay_days: number;
    primary_blocker: string;
    responsible_department: string;
    recommended_action: string;
  }>;
}

export interface DepartmentPerformanceItem {
  department_name: string;
  category: string;
  pending_approvals: number;
  avg_approval_age_days: number;
  critical_dependencies: number;
  projects_affected: number;
  overdue_actions: number;
  escalations_count: number;
  lead_officer: string;
  status: string;
}

export interface ContractorPerformanceItem {
  contractor_id: number;
  name: string;
  contractor_class: string;
  active_contracts: number;
  contract_value_cr: number;
  project_progress_avg: number;
  schedule_adherence_pct: number;
  quality_observations_count: number;
  pending_payments_cr: number;
  contract_extensions_count: number;
  open_corrective_actions_count: number;
  performance_score: number;
  score_breakdown: {
    formula: string;
    schedule_component: number;
    quality_component: number;
    pace_component: number;
    discipline_component: number;
  };
}

export interface QualityAssetPerformanceData {
  inspections_conducted: number;
  open_defects: number;
  critical_observations: number;
  ncrs_count: number;
  corrective_actions_pending: number;
  overdue_quality_closures: number;
  contractor_quality_breakdown: Array<{
    contractor: string;
    tests_conducted: number;
    passed: number;
    failed: number;
    open_ncrs: number;
  }>;
  total_assets: number;
  road_assets_km: number;
  bridges_count: number;
  culverts_count: number;
  assets_requiring_inspection: number;
  maintenance_pending: number;
  critical_asset_conditions: number;
}

export interface LandUtilityPerformanceData {
  total_land_parcels: number;
  parcels_under_acquisition: number;
  awards_pending: number;
  compensation_pending: number;
  possession_pending: number;
  utility_shifting_pending: number;
  projects_affected: number;
  avg_pending_duration_days: number;
  department_dependencies: Array<{
    department: string;
    parcels_pending?: number;
    utilities_pending?: number;
    projects: number;
    avg_days: number;
    status: string;
  }>;
  utility_type_breakdown: Array<{
    utility_type: string;
    count: number;
    estimated_shifting_cost_cr: number;
    action: string;
  }>;
}

export interface DecisionQueueItem {
  id: number;
  decision_reference: string;
  project_id?: number;
  project_title: string;
  programme: string;
  district: string;
  issue_title: string;
  evidence_summary: string;
  impact_assessment: string;
  financial_exposure_cr: number;
  recommended_action: string;
  decision_authority: string;
  current_status: string;
  assigned_department?: string;
  assigned_officer?: string;
  due_date?: string;
  recorded_decision?: string;
  remarks?: string;
  is_simulated: boolean;
  created_at: string;
}

export interface AIMinisterialBriefingData {
  title: string;
  subtitle: string;
  generated_at: string;
  scenario_id: string;
  what_needs_attention: {
    headline: string;
    summary: string;
    primary_blockers: string[];
  };
  why_does_it_matter: {
    financial_impact: string;
    schedule_impact: string;
    departmental_impact: string;
    public_safety_impact: string;
  };
  what_should_be_done: {
    immediate_directives: string[];
  };
  who_should_act: {
    actions: Array<{
      officer: string;
      role: string;
      dept: string;
      target_date: string;
      directive: string;
    }>;
  };
  what_decision_is_required: DecisionQueueItem[];
  data_mode: string;
  disclaimer: string;
}

export interface ReportGenerateRequest {
  report_type: string;
  programme: string;
  district: string;
  project_id?: number;
  department: string;
  reporting_period: string;
  include_financial: boolean;
  include_delays: boolean;
  include_contractor: boolean;
  include_ai_findings: boolean;
  include_land_utility: boolean;
  include_quality: boolean;
}

export interface ReportGenerateResponse {
  report_id: string;
  title: string;
  generated_at: string;
  reporting_period: string;
  filters_applied: Record<string, any>;
  executive_summary: string;
  kpis_summary: Record<string, any>;
  sections: Array<{
    section_key: string;
    title: string;
    summary: string;
    highlights: string[];
  }>;
  recommended_decisions: Array<{
    ref: string;
    project: string;
    issue: string;
    recommended: string;
    authority: string;
    status: string;
  }>;
  data_mode: string;
}

export interface MinisterialDecisionItem {
  id: number;
  decision_reference: string;
  project_id?: number;
  project_title: string;
  programme: string;
  district: string;
  issue_title: string;
  evidence_summary?: string;
  impact_assessment?: string;
  financial_exposure_cr: number;
  recommended_action: string;
  decision_authority: string;
  current_status: string;
  assigned_department?: string;
  assigned_officer?: string;
  due_date?: string;
  recorded_decision?: string;
  remarks?: string;
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
  actions: MinisterialDecisionActionHistoryItem[];
}

export interface MinisterialDecisionActionHistoryItem {
  id: number;
  decision_id: number;
  action_type: string;
  actor_name: string;
  actor_role: string;
  old_status?: string;
  new_status?: string;
  remarks?: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}

export interface MinisterialDecisionUpdatePayload {
  current_status: string;
  recorded_decision?: string;
  remarks?: string;
  assigned_officer?: string;
  assigned_department?: string;
  due_date?: string;
}

// -------------------------------------------------------------
// Prompt 04: Quality, Field Ops & Asset Intelligence Types
// -------------------------------------------------------------

export interface QualitySummaryKPIs {
  total_inspections: number;
  open_quality_findings: number;
  critical_defects: number;
  non_conformance_reports: number;
  corrective_actions_pending: number;
  overdue_corrective_actions: number;
  reinspections_pending: number;
  quality_closure_rate_pct: number;
}

export interface ContractorQualityScorecardItem {
  contractor_id: number;
  contractor_name: string;
  contractor_class: string;
  inspections_count: number;
  total_observations: number;
  critical_observations: number;
  corrective_actions_pending: number;
  quality_score: number;
  compliance_rate_pct: number;
}

export interface QualitySummaryData {
  kpis: QualitySummaryKPIs;
  kpi_definitions: Record<string, string>;
  ai_quality_assessment: {
    overall_assessment: string;
    critical_concerns: string[];
    repeated_defect_patterns: string[];
    contractors_requiring_attention: Array<{ name: string; reason: string }>;
    recommended_actions: string[];
    findings?: Array<{
      code: string;
      title: string;
      severity: string;
      confidence: number;
      explanation: string;
      recommended_action: string;
    }>;
  };
  contractor_scorecard: ContractorQualityScorecardItem[];
  last_updated: string;
}

export interface QualityInspectionItem {
  id: number;
  inspection_code: string;
  project_id: number;
  package_id?: number;
  inspection_date: string;
  inspection_type: string;
  site_location: string;
  inspecting_officer: string;
  contractor_name: string;
  findings_count: number;
  severity: string;
  status: string;
  findings_summary?: string;
}

export interface QualityFindingItem {
  id: number;
  finding_code: string;
  project_id: number;
  package_id?: number;
  asset_id?: number;
  inspection_id?: number;
  defect_category: string;
  description: string;
  severity: string;
  status: string;
  identified_date: string;
  contractor_name: string;
  contractor_response?: string;
  corrective_action?: string;
  target_closure_date?: string;
  reinspection_date?: string;
  reinspection_officer?: string;
  reinspection_notes?: string;
  is_ncr: boolean;
  penalty_cr: number;
}

export interface MaterialTestItem {
  id: number;
  test_ref: string;
  material_type: string;
  sample_date: string;
  project_id: number;
  package_id?: number;
  laboratory_name: string;
  test_parameter: string;
  measured_result: string;
  reference_limit: string;
  result_status: string;
  report_file_name?: string;
}

export interface FieldOpsSummaryKPIs {
  total_site_inspections: number;
  inspections_completed: number;
  inspections_scheduled: number;
  overdue_inspections: number;
  open_field_issues: number;
  critical_field_issues: number;
  progress_updates_submitted: number;
  verification_pending: number;
}

export interface FieldOpsSummaryData {
  kpis: FieldOpsSummaryKPIs;
  kpi_definitions: Record<string, string>;
  ai_field_intelligence: {
    overall_execution_status: string;
    divergence_alerts: Array<{
      project_code: string;
      project_name: string;
      package: string;
      reported_progress: number;
      verified_progress: number;
      gap_pct: number;
      status: string;
    }>;
    repeated_observations: string[];
    recommended_actions: string[];
    findings?: Array<{
      code: string;
      title: string;
      severity: string;
      confidence: number;
      explanation: string;
      recommended_action: string;
    }>;
  };
  last_updated: string;
}

export interface FieldInspectionItem {
  id: number;
  inspection_code: string;
  project_id: number;
  package_id?: number;
  officer_name: string;
  officer_designation: string;
  contractor_name: string;
  inspection_date: string;
  site_location: string;
  work_activity: string;
  progress_reported_pct: number;
  progress_verified_pct: number;
  findings_summary: string;
  severity: string;
  status: string;
  geo_lat?: number;
  geo_lng?: number;
  photos_count: number;
  follow_up_action?: string;
  follow_up_date?: string;
}

export interface FieldIssueItem {
  id: number;
  issue_code: string;
  project_id: number;
  package_id?: number;
  category: string;
  description: string;
  location: string;
  reported_date: string;
  assigned_officer: string;
  assigned_department: string;
  status: string;
  priority: string;
  resolution_target?: string;
  resolution_notes?: string;
}

export interface AssetsSummaryKPIs {
  total_assets: number;
  roads_km: number;
  bridges_count: number;
  culverts_count: number;
  assets_requiring_inspection: number;
  assets_requiring_maintenance: number;
  critical_asset_conditions: number;
  overdue_maintenance_activities: number;
}

export interface AssetsSummaryData {
  kpis: AssetsSummaryKPIs;
  condition_distribution: Record<string, number>;
  ai_asset_intelligence: {
    overall_health_statement: string;
    health_alerts: Array<{
      asset_code: string;
      asset_name: string;
      current_condition: string;
      trigger_event: string;
      action_required: string;
    }>;
    preventive_maintenance_candidates: string[];
    recommended_actions: string[];
    findings?: Array<{
      code: string;
      title: string;
      severity: string;
      confidence: number;
      explanation: string;
      recommended_action: string;
    }>;
  };
  last_updated: string;
}

export interface InfrastructureAssetItem {
  id: number;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  project_id: number;
  package_id?: number;
  district: string;
  location_chainage: string;
  completion_date?: string;
  condition: string;
  pci_score: number;
  last_inspection_date?: string;
  next_inspection_date?: string;
  maintenance_status: string;
  responsible_authority: string;
  replacement_value_cr: number;
}

export interface MaintenanceWorkOrderItem {
  id: number;
  work_order_code: string;
  asset_id: number;
  project_id: number;
  maintenance_type: string;
  description: string;
  priority: string;
  estimated_cost_cr: number;
  assigned_contractor: string;
  assigned_engineer: string;
  scheduled_date: string;
  completion_date?: string;
  status: string;
  inspection_verified: boolean;
  remarks?: string;
}







// -------------------------------------------------------------
// Departmental Coordination, Land Acquisition & Utility Intelligence (Prompt 05)
// -------------------------------------------------------------

export interface DepartmentOverviewKPIs {
  total_participating_departments: number;
  active_interdepartmental_dependencies: number;
  pending_approvals: number;
  overdue_approvals: number;
  average_approval_turnaround_days: number;
  critical_project_blockers: number;
  department_wise_pending_actions: number;
  leadership_escalations: number;
}

export interface DepartmentOverviewData {
  kpis: DepartmentOverviewKPIs;
  reporting_period: string;
  last_updated: string;
  data_mode: string;
  data_status: string;
  kpi_definitions: Record<string, string>;
}

export interface DepartmentDirectoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  is_external: boolean;
  responsible_minister?: string;
  responsible_secretary?: string;
  head_of_department?: string;
  nodal_officer_name?: string;
  nodal_officer_designation?: string;
  nodal_officer_phone?: string;
  contact_email?: string;
  jurisdiction?: string;
  sla_standard_days: number;
  active_dependencies_count: number;
  pending_approvals_count: number;
  associated_projects_count: number;
  associated_projects: Array<{ id: number; code: string; title: string }>;
  key_responsibilities: string[];
}

export interface DepartmentCoordinationDependencyItem {
  id: number;
  dependency_code: string;
  project_id: number;
  project_code: string;
  project_title: string;
  work_package_id?: number;
  package_name?: string;
  requesting_department_id: number;
  requesting_department_name: string;
  requesting_department_code: string;
  target_department_id: number;
  target_department_name: string;
  target_department_code: string;
  dependency_type: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'BLOCKED';
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  date_raised: string;
  days_pending: number;
  sla_days: number;
  escalation_level: 'NONE' | 'DEPARTMENT_HEAD' | 'SECRETARY' | 'MINISTER';
  responsible_officer?: string;
  recommended_action?: string;
  supporting_document_ref?: string;
  downstream_blocker_milestone?: string;
}

export interface DepartmentApprovalItem {
  id: number;
  approval_code: string;
  project_id: number;
  project_code: string;
  project_title: string;
  work_package_id?: number;
  package_name?: string;
  approval_type: string;
  submitting_department_name: string;
  approving_department_name: string;
  approving_department_code: string;
  assigned_officer?: string;
  submission_date: string;
  sla_target_days: number;
  sla_status: 'ON_TRACK' | 'OVERDUE' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
  overdue_days: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUESTED' | 'APPROVED' | 'REJECTED';
  review_remarks?: string;
  document_ref?: string;
  is_statutory: boolean;
  approval_date?: string;
}

export interface DepartmentAIFindingItem {
  id: number;
  finding_code: string;
  project_id?: number;
  project_code?: string;
  project_title?: string;
  finding_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  ai_confidence: number;
  problem_statement: string;
  delay_impact_days: number;
  cost_impact_cr: number;
  participating_departments: string[];
  recommended_action: string;
  escalation_required: boolean;
  escalation_target?: string;
  status: string;
  created_at: string;
}

export interface LandAcquisitionKPIs {
  total_required_sqm: number;
  acquired_possession_sqm: number;
  pending_acquisition_sqm: number;
  overall_acquisition_pct: number;
  awards_passed_count: number;
  compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  compensation_pending_cr: number;
  parcels_in_litigation: number;
  possession_complete_parcels: number;
  total_parcels: number;
}

export interface UtilityKPIs {
  total_utility_assets: number;
  tangedco_poles_count: number;
  water_mains_km: number;
  ofc_cables_km: number;
  shiftings_in_progress: number;
  shiftings_completed: number;
  shifting_completion_pct: number;
  total_estimated_shifting_cost_cr: number;
}

export interface LandUtilityOverviewData {
  land_kpis: LandAcquisitionKPIs;
  utility_kpis: UtilityKPIs;
  reporting_period: string;
  last_updated: string;
  data_mode: string;
  data_status: string;
  kpi_definitions: Record<string, string>;
}

export interface LandAcquisitionParcelItem {
  id: number;
  parcel_reference: string;
  project_id: number;
  project_code: string;
  project_title: string;
  work_package_id?: number;
  package_name?: string;
  district: string;
  taluk: string;
  village: string;
  survey_number: string;
  landowner_name: string;
  land_classification: string;
  private_land_sqm: number;
  govt_land_sqm: number;
  total_land_sqm: number;
  acquisition_stage: string;
  legal_provision: string;
  notification_15_2_date?: string;
  gazette_15_1_date?: string;
  award_19_1_date?: string;
  compensation_assessed_cr: number;
  compensation_paid_cr: number;
  compensation_status: 'PENDING' | 'PARTIAL' | 'PAID' | 'DISPUTED';
  possession_status: 'PENDING_POSSESSION' | 'POSSESSION_HANDED_OVER';
  possession_date?: string;
  has_litigation: boolean;
  dispute_details?: string;
  responsible_revenue_officer?: string;
  blocking_project_milestone?: string;
  geo_lat?: number;
  geo_lng?: number;
}

export interface UtilityShiftingItem {
  id: number;
  utility_code: string;
  project_id: number;
  project_code: string;
  project_title: string;
  work_package_id?: number;
  package_name?: string;
  location_chainage: string;
  utility_category: string;
  owning_agency: string;
  contact_officer?: string;
  affected_assets_count: number;
  estimated_cost_cr: number;
  approved_cost_cr: number;
  fund_allocation_status: string;
  approval_status: string;
  work_order_status: 'NOT_STARTED' | 'ESTIMATE_PREPARED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  physical_shifting_progress_pct: number;
  verification_status: 'UNVERIFIED' | 'VERIFIED';
  target_completion_date?: string;
  actual_completion_date?: string;
  blocking_milestone?: string;
  remarks?: string;
  geo_lat?: number;
  geo_lng?: number;
}

export interface LandUtilityMapPoint {
  id: number;
  type: 'LAND_PARCEL' | 'UTILITY_ASSET';
  reference: string;
  title: string;
  project_id: number;
  project_code: string;
  project_title: string;
  lat: number;
  lng: number;
  status: string;
  is_blocking: boolean;
  blocking_description?: string;
  category: string;
  agency?: string;
  village?: string;
  district?: string;
}

// ============================================================================
// DIGITAL OFFICE, E-FILE MANAGEMENT & GOVERNMENT WORKFLOW INTELLIGENCE (PROMPT 07)
// ============================================================================

export interface DigitalOfficeKPIs {
  total_incoming_communications: number;
  unprocessed_communications: number;
  files_currently_under_processing: number;
  files_pending_officer_action: number;
  files_pending_departmental_approval: number;
  files_pending_secretary_approval: number;
  files_pending_minister_decision: number;
  overdue_files: number;
  files_returned_for_clarification: number;
  decisions_issued: number;
  pending_action_items: number;
  completed_action_items: number;
  average_file_processing_time_days: number;
  critical_administrative_bottlenecks: number;
}

export interface DigitalOfficeOverviewData {
  kpis: DigitalOfficeKPIs;
  kpi_definitions: Record<string, string>;
  reporting_period: string;
  last_updated: string;
  data_mode: string;
  data_status: string;
}

export interface CorrespondenceItem {
  id: number;
  communication_code: string;
  reference_number?: string;
  communication_type: 'INCOMING' | 'OUTGOING';
  received_or_dispatch_date?: string;
  sender_or_recipient_org: string;
  sender_or_recipient_name: string;
  sender_or_recipient_role: string;
  subject: string;
  category: string;
  department_id?: number;
  project_id?: number;
  project_code?: string;
  work_package_id?: number;
  priority: 'ROUTINE' | 'URGENT' | 'HIGH' | 'IMMEDIATE';
  confidentiality_level: 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
  assigned_officer_name?: string;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'FILE_GENERATED' | 'DISPATCHED' | 'CLOSED';
  due_date?: string;
  document_reference?: string;
  government_file_id?: number;
  dispatch_evidence_ref?: string;
  action_history_summary?: string;
}

export interface GovernmentFileItem {
  id: number;
  file_number: string;
  subject: string;
  file_category: string;
  originating_department_id: number;
  originating_department_code?: string;
  current_department_id: number;
  current_department_code?: string;
  originating_officer_name: string;
  current_responsible_officer_name: string;
  project_id?: number;
  project_code?: string;
  work_package_id?: number;
  priority: 'ROUTINE' | 'URGENT' | 'HIGH' | 'IMMEDIATE';
  confidentiality_level: 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
  current_workflow_stage: string;
  pending_action?: string;
  due_date?: string;
  is_closed: boolean;
  closure_date?: string;
  closure_remarks?: string;
  document_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FileMovementItem {
  id: number;
  file_id: number;
  movement_number: number;
  from_department_id: number;
  from_department_name: string;
  from_officer_name: string;
  to_department_id: number;
  to_department_name: string;
  to_officer_name: string;
  movement_date: string;
  reason_for_movement: string;
  instruction_note?: string;
  expected_action?: string;
  due_date?: string;
  acknowledgement_status: string;
}

export interface OfficeNoteItem {
  id: number;
  file_id: number;
  note_number: number;
  author_officer_name: string;
  author_designation: string;
  submission_date: string;
  background_context: string;
  factual_matrix: string;
  financial_implications_cr: number;
  legal_and_compliance_implications?: string;
  project_milestone_impact?: string;
  officer_recommendation: string;
  supporting_doc_ref?: string;
  status: string;
}

export interface GovernmentDecisionItem {
  id: number;
  decision_code: string;
  file_id: number;
  file_number?: string;
  decision_authority: 'MINISTER' | 'PRINCIPAL_SECRETARY' | 'CHIEF_ENGINEER' | 'COLLECTOR';
  decision_date: string;
  decision_category: string;
  decision_statement: string;
  approved_action: string;
  responsible_department_name: string;
  responsible_officer_name: string;
  due_date?: string;
  supporting_doc_ref?: string;
  implementation_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  compliance_evidence_ref?: string;
  closure_date?: string;
}

export interface DigitalOfficeMeetingItem {
  id: number;
  meeting_code: string;
  title: string;
  meeting_category: string;
  meeting_date: string;
  chairperson_name: string;
  departments_represented: string[];
  agenda_summary: string;
  minutes_summary: string;
  decisions_taken_summary?: string;
  status: string;
}

export interface GovernmentActionItem {
  id: number;
  action_code: string;
  origin_type: 'FILE' | 'MEETING' | 'DECISION' | 'COMMUNICATION';
  origin_id: number;
  description: string;
  responsible_department_name: string;
  responsible_officer_name: string;
  priority: string;
  due_date?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress_pct: number;
  evidence_ref?: string;
  escalation_level: 'ROUTINE' | 'OFFICER' | 'SECRETARY' | 'MINISTER';
  closure_remarks?: string;
}

export interface DigitalDocumentItem {
  id: number;
  document_code: string;
  title: string;
  category: string;
  reference_number?: string;
  document_date?: string;
  issuing_authority: string;
  project_id?: number;
  related_file_id?: number;
  version: string;
  storage_path?: string;
  confidentiality_level: 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
  verification_status: string;
  checksum_sha256?: string;
}

export interface DigitalOfficeAIFindingItem {
  id: number;
  finding_code: string;
  finding_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  ai_confidence: number;
  problem_statement: string;
  evidence_reference: string;
  affected_file_id?: number;
  affected_project_id?: number;
  recommended_action: string;
  suggested_responsible_role: string;
  is_escalation_required: boolean;
  status: string;
  data_mode: string;
}

export interface GovernmentFileDetail {
  file: GovernmentFileItem;
  movements: FileMovementItem[];
  notes: OfficeNoteItem[];
  decisions: GovernmentDecisionItem[];
  action_items: GovernmentActionItem[];
  linked_documents: DigitalDocumentItem[];
}

// ============================================================================
// NOTIFICATIONS & UNIFIED CALENDAR TYPES
// ============================================================================

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  source_module?: string;
  source_record_id?: string;
  project_id?: number;
  project_name?: string;
  department_id?: number;
  department_name?: string;
  responsible_officer_name?: string;
  target_route?: string;
  is_read: boolean;
  is_saved: boolean;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  is_statutory_mandatory: boolean;
  due_date?: string;
  ai_importance_score?: number;
  ai_is_priority_briefing: boolean;
  ai_reasoning?: string;
  ai_potential_impact?: string;
  ai_required_action?: string;
  ai_evidence_citation?: string;
  ai_confidence_score?: number;
  data_mode: string;
  data_status: string;
  reference_url?: string;
  created_at: string;
}

export interface AIPriorityBriefingItem {
  id: number;
  priority: string;
  title: string;
  short_explanation: string;
  project_id?: number;
  project_name?: string;
  department_name?: string;
  responsible_officer?: string;
  why_important: string;
  potential_impact: string;
  required_action: string;
  deadline?: string;
  evidence_source?: string;
  confidence_score: number;
  last_updated: string;
  target_route: string;
  is_statutory_mandatory: boolean;
  is_read: boolean;
  is_acknowledged: boolean;
}

export interface NotificationSummary {
  total_notifications: number;
  unread_notifications: number;
  critical_alerts: number;
  high_priority_alerts: number;
  pending_actions: number;
  upcoming_meetings: number;
  overdue_tasks: number;
  recently_updated_projects: number;
}

export interface NotificationPreference {
  id?: number;
  user_id: number;
  enable_in_app: boolean;
  enable_email_digest: boolean;
  min_priority_alert: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  category_filters: string[];
  daily_briefing_enabled: boolean;
}

export interface CalendarParticipantItem {
  id: number;
  user_id?: number;
  official_name: string;
  official_role: string;
  department_name: string;
  invitation_status: string;
  attendance_status: string;
  notes?: string;
}

export interface MeetingActionItemDetail {
  id: number;
  event_id: number;
  action_code: string;
  title: string;
  description: string;
  responsible_user_id?: number;
  responsible_officer_name: string;
  responsible_department_name: string;
  priority: string;
  due_date: string;
  status: string;
  escalation_level: string;
  closure_remarks?: string;
  created_at: string;
}

export interface CalendarEventItem {
  id: number;
  event_code: string;
  title: string;
  event_category: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  venue_or_url: string;
  is_virtual: boolean;
  organiser_user_id?: number;
  organiser_name: string;
  organiser_role: string;
  related_project_id?: number;
  related_project_name?: string;
  related_department_name?: string;
  agenda: string;
  preparation_notes?: string;
  required_documents: string[];
  previous_meeting_ref?: string;
  priority: string;
  status: string;
  source_module?: string;
  source_record_id?: string;
  minutes_of_meeting?: string;
  decisions_summary?: string;
  data_mode: string;
  data_status: string;
  created_at: string;
  participants: CalendarParticipantItem[];
  action_items: MeetingActionItemDetail[];
}

export interface TodayScheduleData {
  today_date: string;
  total_events_today: number;
  events: {
    id: number;
    event_code: string;
    title: string;
    category: string;
    time: string;
    venue: string;
    is_virtual: boolean;
    priority: string;
    status: string;
    project_name?: string;
  }[];
  overdue_action_items_count: number;
  overdue_action_items: {
    action_code: string;
    title: string;
    responsible_officer: string;
    due_date: string;
  }[];
}

