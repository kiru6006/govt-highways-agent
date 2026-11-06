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
