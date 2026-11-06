import {
  UserInfo,
  ProjectItem,
  DepartmentDependencyItem,
  IssueItem,
  WorkflowTaskItem,
  AuditEventItem,
  DashboardStats,
  AskAIResult,
  RoadType,
  ExecutiveKPIs,
  PortfolioStageItem,
  ZoneComparisonItem,
  CriticalLeadershipIssue,
  InterdepartmentalBlocker,
  FinancialLeakageFinding,
  QualityDefectRecord,
  ContractorEvaluation,
  LegalMatter,
  LeadershipDecision,
  ExecutiveFilters
} from '../types';

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('tn_hdos_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('tn_hdos_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('tn_hdos_token');
}

// -------------------------------------------------------------
// Fallback Data Store (for Static Deployments on GitHub Pages)
// -------------------------------------------------------------
const fallbackUsers: Record<string, UserInfo> = {
  admin: {
    id: 1,
    username: 'admin',
    full_name: 'Thiru R. Senthil Kumar IAS [DEMO]',
    role_code: 'ADMIN',
    role_name: 'System Administrator (Statewide)',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  chief_eng: {
    id: 2,
    username: 'chief_eng',
    full_name: 'Er. K. Balasubramanian, M.E. [DEMO]',
    role_code: 'CHIEF_ENG',
    role_name: 'Chief Engineer (Highways - Projects)',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  se_chengalpattu: {
    id: 3,
    username: 'se_chengalpattu',
    full_name: 'Er. M. Rajasekaran, M.E. [DEMO]',
    role_code: 'SE_CIRCLE',
    role_name: 'Superintending Engineer (Chengalpattu Circle)',
    department_name: 'Tamil Nadu Highways Department',
    zone_id: 1,
    circle_id: 1,
    is_active: true
  },
  ee_tambaram: {
    id: 4,
    username: 'ee_tambaram',
    full_name: 'Er. P. Anandhan, B.E. [DEMO]',
    role_code: 'EE_DIV',
    role_name: 'Divisional Engineer (Tambaram Division)',
    department_name: 'Tamil Nadu Highways Department',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    is_active: true
  },
  contractor_lt: {
    id: 5,
    username: 'contractor_lt',
    full_name: 'V. Ramakrishnan (Project Director, L&T) [DEMO]',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 1,
    is_active: true
  },
  contractor_pst: {
    id: 6,
    username: 'contractor_pst',
    full_name: 'T. Shanmugam (Managing Director, PST) [DEMO]',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 2,
    is_active: true
  }
};

let activeUser: UserInfo = fallbackUsers.admin;

let fallbackProjects: ProjectItem[] = [
  {
    id: 1,
    project_code: 'PRJ-TN-2026-001',
    title: 'Widening to 4 Lanes with Paved Shoulders of SH-49 (ECR) km 22/0 to 45/0 [DEMO DATA]',
    description: 'Major infrastructure upgradation under Chief Minister Road Development Programme (CMRDP) to reduce fatal accidents and improve scenic coastal corridor capacity.',
    road_type: 'SH',
    estimated_cost_cr: 145.50,
    sanctioned_cost_cr: 142.20,
    expenditure_to_date_cr: 64.80,
    physical_progress_pct: 52.5,
    financial_progress_pct: 45.6,
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 1,
    contractor_name: 'L&T Infrastructure Engineering Ltd',
    road_name: 'East Coast Road (SH-49)',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    project_code: 'PRJ-TN-2026-002',
    title: 'Construction of 4-Lane Grade Separator / Elevated Corridor at Tambaram on MDR-102 [DEMO DATA]',
    description: 'Elevated flyover junction decongestion project connecting GST corridor with Sriperumbudur industrial belt.',
    road_type: 'MDR',
    estimated_cost_cr: 88.40,
    sanctioned_cost_cr: 85.00,
    expenditure_to_date_cr: 22.10,
    physical_progress_pct: 28.0,
    financial_progress_pct: 26.0,
    status: 'DELAYED',
    priority: 'HIGH',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 2,
    contractor_name: 'PST Engineering Constructions',
    road_name: 'Tambaram - Mudichur Road (MDR-102)',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    project_code: 'PRJ-TN-2026-003',
    title: 'Reconstruction of Distressed High-Level Bridge on ODR-045 Thiruporur Hub [DEMO DATA]',
    description: 'Comprehensive bridge reconstruction replacing damaged multi-vent causeway with pre-stressed girder superstructure.',
    road_type: 'ODR',
    estimated_cost_cr: 18.60,
    sanctioned_cost_cr: 18.10,
    expenditure_to_date_cr: 16.50,
    physical_progress_pct: 89.0,
    financial_progress_pct: 91.2,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 2,
    contractor_name: 'PST Engineering Constructions',
    road_name: 'Guduvanchery - Thiruporur Link (ODR-045)',
    created_at: new Date().toISOString()
  }
];

let fallbackCriticalIssues: CriticalLeadershipIssue[] = [
  {
    id: 1,
    issue_reference: 'LDR-2026-001',
    project_id: 1,
    project_title: 'Widening to 4 Lanes with Paved Shoulders of SH-49 (ECR) [DEMO DATA]',
    district: 'Chengalpattu',
    category: 'Land Acquisition & Revenue',
    problem_description: '4.2 Hectares of private land acquisition stalled due to landowner title disputes, halting widening to 4 lanes at km 28+400.',
    root_cause: 'Sub-Collector Tambaram award enquiry delayed under TN Highways Act 2001 Section 15(2); interim compensation dispute.',
    responsible_officer: 'Er. M. Rajasekaran, M.E. (Superintending Engineer)',
    responsible_external_dept: 'Revenue and Disaster Management (Tahsildar Tambaram)',
    contractor_name: 'L&T Infrastructure Engineering Ltd',
    days_pending: 65,
    schedule_impact_days: 65,
    financial_exposure_cr: 14.50,
    evidence_available: 'Gazette Notification No. II(2)/HMP/482/2024 & Sub-Collector Notice',
    recommended_action: 'Convene Joint Secretariat Bilateral Taskforce with Principal Secretary (Revenue) to fast-track compensation deposit.',
    escalation_level: 'SECRETARIAT_ESCALATED',
    priority: 'CRITICAL',
    status: 'Action in Progress',
    date_raised: '2025-09-01T00:00:00Z'
  },
  {
    id: 2,
    issue_reference: 'LDR-2026-002',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102 [DEMO DATA]',
    district: 'Chengalpattu',
    category: 'Railway Coordination (ROB)',
    problem_description: 'Pier cap erection suspended within 30m railway corridor pending approved General Arrangement Drawing (GAD).',
    root_cause: 'Chief Bridge Engineer (CBE) Southern Railway raised structural clearance query regarding overhead electrification (OHE) wire height.',
    responsible_officer: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    responsible_external_dept: 'Southern Railway (Zone 7, Ministry of Railways)',
    contractor_name: 'PST Engineering Constructions',
    days_pending: 90,
    schedule_impact_days: 90,
    financial_exposure_cr: 8.80,
    evidence_available: 'Joint Inspection Memo with Railway Divisional Engineer dtd 14-Aug-2025',
    recommended_action: 'Hon\'ble Minister / Principal Secretary to hold bilateral conference with General Manager, Southern Railway.',
    escalation_level: 'MINISTERIAL_ESCALATED',
    priority: 'CRITICAL',
    status: 'Action in Progress',
    date_raised: '2025-08-10T00:00:00Z'
  },
  {
    id: 3,
    issue_reference: 'LDR-2026-003',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102 [DEMO DATA]',
    district: 'Chengalpattu',
    category: 'Contractor Default & Quality',
    problem_description: 'Core density at Chainage 31+200 fell below MoRTH standards (88% vs 95% required). Contractor demobilised shuttering staging.',
    root_cause: 'Contractor financial distress and material procurement delays.',
    responsible_officer: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    responsible_external_dept: 'Highways Research Station (HRS) Quality Audit',
    contractor_name: 'PST Engineering Constructions',
    days_pending: 42,
    schedule_impact_days: 30,
    financial_exposure_cr: 3.20,
    evidence_available: 'HRS Guindy Core Test Certificate #HRS-2026-441',
    recommended_action: 'Issue 14-day statutory cure notice under Clause 46 of General Conditions of Contract (GCC); withhold interim running bill.',
    escalation_level: 'ZONE_ESCALATED',
    priority: 'HIGH',
    status: 'Under Review',
    date_raised: '2025-09-25T00:00:00Z'
  }
];

let fallbackBlockers: InterdepartmentalBlocker[] = [
  {
    id: 1,
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    department_category: 'Revenue & Land Acquisition',
    approval_required: 'Section 15(2) Valuation Award & Possession Handover (4.2 Ha)',
    submission_date: '2025-03-15T00:00:00Z',
    latest_correspondence: 'D.O. Letter No. HW/CGL/LA/2025-412 to District Collector Chengalpattu',
    responsible_highways_officer: 'Er. M. Rajasekaran, M.E. (Superintending Engineer)',
    external_contact: 'Thiru G. Venkatesan (Special DRO, Land Acquisition)',
    days_pending: 65,
    expected_timeline: 'Within 30 days post-hearing',
    reason_for_delay: 'Dispute over market valuation vs guideline value raised by pattadars in Muttukadu village.',
    supporting_documents: 'DRO Meeting Minutes dtd 18-Oct-2025',
    recommended_action: 'Remit provisional compensation to High Court Registrar to secure immediate possession.',
    status: 'BLOCKED'
  },
  {
    id: 2,
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    department_category: 'Electricity & TANGEDCO',
    approval_required: 'Relocation of 42 High-Tension (33kV) Transmission Poles',
    submission_date: '2025-05-20T00:00:00Z',
    latest_correspondence: 'TANGEDCO Working Estimate #SE/CGL/EDC/TECH/2025-889',
    responsible_highways_officer: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    external_contact: 'Er. S. Murugesan (Superintending Engineer, TANGEDCO Kanchipuram)',
    days_pending: 40,
    expected_timeline: '45 days from shutdown sanction',
    reason_for_delay: 'Scheduled line shutdown awaiting State Load Despatch Centre (SLDC) window approval.',
    supporting_documents: 'Demand Draft of Rs 1.82 Cr remitted by Highways on 10-Aug-2025',
    recommended_action: 'Request Energy Secretary to sanction weekend shutdown window for Akkarai corridor.',
    status: 'BLOCKED'
  },
  {
    id: 3,
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    department_category: 'Southern Railway',
    approval_required: 'General Arrangement Drawing (GAD) & Safety Span Launching Surcharge',
    submission_date: '2025-04-10T00:00:00Z',
    latest_correspondence: 'Railway Headquarter Letter #W.439/CN/B/TN/104 dtd 02-Sep-2025',
    responsible_highways_officer: 'Er. K. Balasubramanian (Chief Engineer Projects)',
    external_contact: 'Er. N. Sridhar (Chief Bridge Engineer, Southern Railway HQ)',
    days_pending: 90,
    expected_timeline: '60 days post-joint inspection',
    reason_for_delay: 'Clearance requirement for future 3rd & 4th mainline tracks between Tambaram and Chengalpattu.',
    supporting_documents: 'Revised GAD Plan Drawing No. TN/HW/ROB/2025-R3',
    recommended_action: 'Submit revised span layout providing 7.2m vertical clearance to expedite final approval.',
    status: 'BLOCKED'
  }
];

let fallbackLeakage: FinancialLeakageFinding[] = [
  {
    id: 1,
    finding_code: 'LKG-2026-001',
    project_id: 1,
    project_title: 'SH-49 East Coast Road (ECR)',
    category: 'Measurement and Bill Mismatch',
    title: 'Bituminous Concrete Thickness & Density Discrepancy at km 24/0 to 28/0 [DEMO DATA]',
    potential_exposure_cr: 1.45,
    verified_loss_cr: 0.0,
    verified_recovery_cr: 0.60,
    prevented_expenditure_cr: 0.85,
    evidence_summary: 'Electronic weighbridge refinery gate pass tons do not match MB Book 412 recorded volume by 12.8%.',
    calculation_details: 'Calculated theoretical tonnage: 14,200 MT; Refinery dispatched: 12,380 MT; Invoiced: 14,190 MT (Difference: 1,810 MT @ Rs 8,011/MT).',
    confidence: 'HIGH',
    validation_status: 'INVESTIGATION_INDICATOR',
    responsible_officer: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    recommended_investigation: 'Highways Research Station (HRS) to conduct independent radar core testing and cross-verify with CPCL Manali refinery gate telemetry.',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    finding_code: 'LKG-2026-002',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    category: 'Unreconciled Advances',
    title: 'Mobilisation Advance Recovery Lag Past 30% Physical Milestone [DEMO DATA]',
    potential_exposure_cr: 2.20,
    verified_loss_cr: 0.0,
    verified_recovery_cr: 1.20,
    prevented_expenditure_cr: 1.00,
    evidence_summary: 'Running Account Bill #4 omitted mandated 15% pro-rata recovery of mobilization advance.',
    calculation_details: '10% initial mobilization advance of Rs 8.50 Cr was sanctioned; current recovered Rs 1.45 Cr vs mandated Rs 3.65 Cr.',
    confidence: 'HIGH',
    validation_status: 'VERIFIED',
    responsible_officer: 'Accounts Officer & Divisional Engineer Tambaram',
    recommended_investigation: 'Order automatic adjustment of Rs 2.20 Cr from pending RA Bill #5 and verify validity of bank guarantee.',
    created_at: new Date().toISOString()
  }
];

let fallbackQuality: QualityDefectRecord[] = [
  {
    id: 1,
    defect_code: 'DEF-2026-001',
    project_id: 1,
    project_title: 'Widening of SH-49 ECR',
    road_code: 'SH-49',
    defect_type: 'Material Testing Failure (HRS Guindy)',
    chainage_km: 28.4,
    severity: 'CRITICAL',
    observation_notes: 'M-40 grade concrete 28-day characteristic compressive strength achieved 33.2 MPa (Fail vs 40.0 MPa target).',
    lab_report_ref: 'HRS/GUINDY/LAB/2026/0412',
    corrective_action_status: 'PENDING_RECTIFICATION',
    responsible_engineer: 'Er. P. Anandhan (Divisional Engineer)',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    defect_code: 'DEF-2026-002',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    road_code: 'MDR-102',
    defect_type: 'Structural Inspection Observation',
    chainage_km: 2.4,
    severity: 'HIGH',
    observation_notes: 'Surface micro-cracking observed on Pier Cap P-3 staging during pre-stressing cable tensioning.',
    lab_report_ref: 'HRS/FIELD/NDT/2026/0088',
    corrective_action_status: 'PENDING_RECTIFICATION',
    responsible_engineer: 'Er. S. Kannan (Quality Control ADE)',
    created_at: new Date().toISOString()
  }
];

let fallbackContractors: ContractorEvaluation[] = [
  {
    id: 1,
    contractor_id: 1,
    contractor_name: 'L&T Infrastructure Engineering Ltd',
    project_id: 1,
    project_title: 'Widening of SH-49 ECR',
    performance_score: 86.5,
    behind_schedule_days: 15,
    repeated_defects_count: 0,
    delayed_submissions_count: 1,
    time_extension_requests: 1,
    claims_disputes_cr: 0.0,
    performance_tier: 'SATISFACTORY',
    assessment_notes: 'Mobilisation is adequate. Schedule slip is primarily attributable to external 33kV pole shifting.'
  },
  {
    id: 2,
    contractor_id: 2,
    contractor_name: 'PST Engineering Constructions',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    performance_score: 68.0,
    behind_schedule_days: 65,
    repeated_defects_count: 3,
    delayed_submissions_count: 4,
    time_extension_requests: 2,
    claims_disputes_cr: 2.40,
    performance_tier: 'UNDER_SCRUTINY',
    assessment_notes: 'Severe staging equipment bottleneck and poor lab test adherence. Performance security expires in 90 days.'
  }
];

let fallbackLegal: LegalMatter[] = [
  {
    id: 1,
    case_reference: 'W.P. No. 24891/2025 Madras High Court',
    court_forum: 'High Court of Madras (Principal Seat)',
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    matter_type: 'Environmental & Tree Felling PIL',
    plaintiff_petitioner: 'Coastal Greenery Foundation',
    case_summary: 'PIL challenging felling of avenue trees between Akkarai and Muttukadu on SH-49 ECR.',
    interim_stay_in_force: false,
    next_hearing_date: '2026-11-24T00:00:00Z',
    statutory_deadline: '2026-11-18T00:00:00Z',
    responsible_legal_officer: 'Thiru K. M. D. Muhilan (Special Government Pleader)',
    status: 'ARGUMENTS_STAGE'
  },
  {
    id: 2,
    case_reference: 'AG Audit Para No. 2024-25/14',
    court_forum: 'Accountant General (Audit-II) Tamil Nadu',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    matter_type: 'Audit Paras - Unadjusted Material Advances',
    plaintiff_petitioner: 'Principal Accountant General (Audit)',
    case_summary: 'Audit observation on unrecovered steel and bitumen mobilization advances amounting to Rs 2.20 Cr.',
    interim_stay_in_force: false,
    ag_audit_para_ref: 'AG-TN-HW-2024-PARA-14',
    responsible_legal_officer: 'Financial Advisor & Chief Accounts Officer',
    status: 'PENDING_COUNTER'
  }
];

let fallbackDecisions: LeadershipDecision[] = [
  {
    id: 1,
    decision_reference: 'DEC-2026-001',
    project_id: 1,
    project_title: 'Widening of SH-49 ECR',
    leadership_issue_id: 1,
    required_decision: 'Convene Joint Secretariat Bilateral Taskforce with Revenue Secretary on Land Acquisition Awards [DEMO]',
    assigned_authority: 'Principal Secretary to Government (Highways)',
    action_type: 'FORWARD_COORDINATION',
    supporting_evidence: 'Gazette Notification No. II(2)/HMP/482/2024 & Tahsildar Award Enquiry Report',
    due_date: '2026-11-28T00:00:00Z',
    status: 'ASSIGNED_FOR_REVIEW',
    resolution_notes: 'Meeting note drafted for Chief Secretary coordination agenda.',
    created_by_name: 'Thiru R. Senthil Kumar IAS',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    decision_reference: 'DEC-2026-002',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    leadership_issue_id: 2,
    required_decision: 'Bilateral Summit with General Manager Southern Railway for Tambaram ROB GAD Approval [DEMO]',
    assigned_authority: 'Hon\'ble Minister for Highways & Minor Ports',
    action_type: 'ESCALATE',
    supporting_evidence: 'Revised GAD Drawing No. TN/HW/ROB/2025-R3',
    due_date: '2026-11-22T00:00:00Z',
    status: 'PENDING',
    resolution_notes: 'Ministerial briefing note prepared.',
    created_by_name: 'Thiru R. Senthil Kumar IAS',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    decision_reference: 'DEC-2026-003',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    leadership_issue_id: 3,
    required_decision: 'Sanction Issuance of 14-Day Statutory Cure Notice to Contractor PST Engineering [DEMO]',
    assigned_authority: 'Chief Engineer (Highways - Projects)',
    action_type: 'INVESTIGATION',
    supporting_evidence: 'HRS Guindy Compressive Strength Lab Certificate #HRS-2026-441',
    due_date: '2026-11-15T00:00:00Z',
    status: 'DECIDED',
    resolution_notes: 'Cure notice issued on 04-Nov-2026 under Clause 46 GCC.',
    created_by_name: 'Thiru R. Senthil Kumar IAS',
    created_at: new Date().toISOString()
  }
];

let fallbackZones: ZoneComparisonItem[] = [
  {
    zone_id: 1,
    zone_code: 'ZN-CHE',
    zone_name: 'Chennai Zone',
    headquarters: 'Chennai',
    active_projects_count: 18,
    completed_projects_pct: 68.5,
    average_project_delay_days: 42,
    budget_utilisation_pct: 88.2,
    quality_defects_count: 3,
    pending_approvals_count: 4,
    land_acquisition_pending_ha: 12.4,
    contractor_performance_score: 84.0,
    cohort_sample_size: 18,
    data_completeness_pct: 98.0
  },
  {
    zone_id: 2,
    zone_code: 'ZN-CBE',
    zone_name: 'Coimbatore Zone',
    headquarters: 'Coimbatore',
    active_projects_count: 14,
    completed_projects_pct: 76.2,
    average_project_delay_days: 28,
    budget_utilisation_pct: 92.5,
    quality_defects_count: 1,
    pending_approvals_count: 2,
    land_acquisition_pending_ha: 6.2,
    contractor_performance_score: 89.5,
    cohort_sample_size: 14,
    data_completeness_pct: 96.5
  },
  {
    zone_id: 3,
    zone_code: 'ZN-MDU',
    zone_name: 'Madurai Zone',
    headquarters: 'Madurai',
    active_projects_count: 16,
    completed_projects_pct: 62.0,
    average_project_delay_days: 55,
    budget_utilisation_pct: 79.4,
    quality_defects_count: 4,
    pending_approvals_count: 5,
    land_acquisition_pending_ha: 18.0,
    contractor_performance_score: 78.0,
    cohort_sample_size: 16,
    data_completeness_pct: 94.0
  },
  {
    zone_id: 4,
    zone_code: 'ZN-TRY',
    zone_name: 'Tiruchirappalli Zone',
    headquarters: 'Tiruchirappalli',
    active_projects_count: 12,
    completed_projects_pct: 71.4,
    average_project_delay_days: 34,
    budget_utilisation_pct: 86.0,
    quality_defects_count: 2,
    pending_approvals_count: 3,
    land_acquisition_pending_ha: 8.5,
    contractor_performance_score: 86.0,
    cohort_sample_size: 12,
    data_completeness_pct: 97.0
  }
];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // static fallback on GitHub Pages
    }

    const user = fallbackUsers[username] || fallbackUsers.admin;
    activeUser = user;
    return {
      access_token: `mock_token_${user.username}`,
      token_type: 'bearer',
      user_info: user
    };
  },

  getCurrentUser: async () => {
    try {
      return await request<UserInfo>('/auth/me');
    } catch {
      return activeUser;
    }
  },

  // -----------------------------------------------------------
  // Phase 2 Executive Command Centre Endpoints
  // -----------------------------------------------------------

  getExecutiveKPIs: async (filters?: Partial<ExecutiveFilters>) => {
    try {
      const params = new URLSearchParams();
      if (filters?.financial_year) params.append('financial_year', filters.financial_year);
      if (filters?.zone_id) params.append('zone_id', String(filters.zone_id));
      if (filters?.circle_id) params.append('circle_id', String(filters.circle_id));
      if (filters?.division_id) params.append('division_id', String(filters.division_id));
      if (filters?.road_type) params.append('road_type', filters.road_type);
      if (filters?.risk_status) params.append('risk_status', filters.risk_status);
      if (filters?.stage) params.append('stage', filters.stage);

      const query = params.toString() ? `?${params.toString()}` : '';
      return await request<ExecutiveKPIs>(`/executive/kpis${query}`);
    } catch {
      // Scoped fallback for contractor
      if (activeUser.role_code === 'CONTRACTOR') {
        return {
          total_active_projects: 1,
          total_approved_project_value_cr: 142.20,
          total_expenditure_cr: 64.80,
          total_physical_progress_pct: 52.5,
          projects_delayed: 0,
          projects_high_risk: 1,
          pending_approvals: 1,
          pending_land_acquisition_ha: 4.2,
          pending_utility_shifting_count: 1,
          open_quality_defects: 1,
          pending_contractor_obligations: 0,
          open_legal_cases: 1,
          unresolved_audit_observations: 0,
          potential_financial_exposure_cr: 1.45,
          verified_financial_recovery_cr: 0.60,
          verified_prevented_expenditure_cr: 0.85,
          reporting_period: filters?.financial_year || 'FY 2025-26',
          data_freshness: 'Live Operational Telemetry',
          cohort_sample_size: 1,
          is_demo: true
        };
      }

      return {
        total_active_projects: fallbackProjects.length,
        total_approved_project_value_cr: 245.30,
        total_expenditure_cr: 103.40,
        total_physical_progress_pct: 56.5,
        projects_delayed: 1,
        projects_high_risk: 2,
        pending_approvals: 3,
        pending_land_acquisition_ha: 12.4,
        pending_utility_shifting_count: 2,
        open_quality_defects: fallbackQuality.length,
        pending_contractor_obligations: 1,
        open_legal_cases: fallbackLegal.length,
        unresolved_audit_observations: 1,
        potential_financial_exposure_cr: 3.65,
        verified_financial_recovery_cr: 1.80,
        verified_prevented_expenditure_cr: 1.85,
        reporting_period: filters?.financial_year || 'FY 2025-26',
        data_freshness: 'Live Operational Telemetry',
        cohort_sample_size: fallbackProjects.length,
        is_demo: true
      };
    }
  },

  getPortfolioStages: async () => {
    try {
      return await request<PortfolioStageItem[]>('/executive/portfolio');
    } catch {
      return [
        { stage: 'PLANNING', count: 2, cost_cr: 65.00, avg_progress_pct: 0.0 },
        { stage: 'TENDERING', count: 1, cost_cr: 42.50, avg_progress_pct: 0.0 },
        { stage: 'IN_PROGRESS', count: 2, cost_cr: 160.30, avg_progress_pct: 70.8 },
        { stage: 'DELAYED', count: 1, cost_cr: 85.00, avg_progress_pct: 28.0 },
        { stage: 'INTERVENTION_REQUIRED', count: 1, cost_cr: 142.20, avg_progress_pct: 52.5 },
        { stage: 'COMPLETED', count: 1, cost_cr: 34.00, avg_progress_pct: 100.0 }
      ];
    }
  },

  getZoneComparison: async () => {
    try {
      return await request<ZoneComparisonItem[]>('/executive/zones');
    } catch {
      return fallbackZones;
    }
  },

  getCriticalIssues: async (category?: string, priority?: string) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (priority) params.append('priority', priority);
      const q = params.toString() ? `?${params.toString()}` : '';
      return await request<CriticalLeadershipIssue[]>(`/executive/critical-issues${q}`);
    } catch {
      let issues = [...fallbackCriticalIssues];
      if (category) issues = issues.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
      if (priority) issues = issues.filter(i => i.priority === priority);
      return issues;
    }
  },

  getInterdepartmentalBlockers: async (departmentCategory?: string) => {
    try {
      const q = departmentCategory ? `?department_category=${encodeURIComponent(departmentCategory)}` : '';
      return await request<InterdepartmentalBlocker[]>(`/executive/interdepartmental${q}`);
    } catch {
      let blockers = [...fallbackBlockers];
      if (departmentCategory) {
        blockers = blockers.filter(b => b.department_category.toLowerCase().includes(departmentCategory.toLowerCase()));
      }
      return blockers;
    }
  },

  getFinancialLeakageFindings: async () => {
    try {
      return await request<FinancialLeakageFinding[]>('/executive/leakage');
    } catch {
      return fallbackLeakage;
    }
  },

  getQualityDefects: async () => {
    try {
      return await request<QualityDefectRecord[]>('/executive/quality');
    } catch {
      return fallbackQuality;
    }
  },

  getContractorEvaluations: async () => {
    try {
      return await request<ContractorEvaluation[]>('/executive/contractors');
    } catch {
      return fallbackContractors;
    }
  },

  getLegalMatters: async () => {
    try {
      return await request<LegalMatter[]>('/executive/legal');
    } catch {
      return fallbackLegal;
    }
  },

  getLeadershipDecisions: async () => {
    try {
      return await request<LeadershipDecision[]>('/executive/decisions');
    } catch {
      return fallbackDecisions;
    }
  },

  recordLeadershipDecision: async (payload: {
    required_decision: string;
    assigned_authority: string;
    action_type: string;
    project_id?: number;
    leadership_issue_id?: number;
    supporting_evidence?: string;
    resolution_notes?: string;
  }) => {
    try {
      return await request<LeadershipDecision>('/executive/decisions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newDec: LeadershipDecision = {
        id: Date.now(),
        decision_reference: `DEC-2026-${String(fallbackDecisions.length + 1).padStart(3, '0')}`,
        required_decision: payload.required_decision,
        assigned_authority: payload.assigned_authority,
        action_type: payload.action_type,
        supporting_evidence: payload.supporting_evidence,
        status: 'ASSIGNED_FOR_REVIEW',
        resolution_notes: payload.resolution_notes,
        created_by_name: activeUser.full_name,
        created_at: new Date().toISOString()
      };
      fallbackDecisions.unshift(newDec);
      return newDec;
    }
  },

  // Projects
  getProjects: async (roadType?: RoadType) => {
    try {
      const query = roadType ? `?road_type=${roadType}` : '';
      return await request<ProjectItem[]>(`/projects${query}`);
    } catch {
      let filtered = [...fallbackProjects];
      if (activeUser.role_code === 'CONTRACTOR') {
        filtered = filtered.filter(p => p.contractor_id === activeUser.contractor_id);
      }
      if (roadType) {
        filtered = filtered.filter(p => p.road_type === roadType);
      }
      return filtered;
    }
  },

  getProjectById: async (id: number) => {
    try {
      return await request<ProjectItem>(`/projects/${id}`);
    } catch {
      const p = fallbackProjects.find(item => item.id === id);
      if (!p) throw new Error('Project not found');
      return p;
    }
  },

  // Dependencies
  getDependencies: async () => {
    try {
      return await request<DepartmentDependencyItem[]>('/dependencies');
    } catch {
      return [];
    }
  },

  // Issues
  getIssues: async () => {
    try {
      return await request<IssueItem[]>('/issues');
    } catch {
      return [];
    }
  },

  // Workflows
  getWorkflowTasks: async (myTasksOnly = false) => {
    try {
      return await request<WorkflowTaskItem[]>(`/workflows?my_tasks_only=${myTasksOnly}`);
    } catch {
      return [];
    }
  },

  completeTask: async (id: number) => {
    try {
      return await request<WorkflowTaskItem>(`/workflows/${id}/complete`, {
        method: 'PATCH',
      });
    } catch {
      return {} as WorkflowTaskItem;
    }
  },

  // Audit
  getAuditEvents: async (limit = 30) => {
    try {
      return await request<AuditEventItem[]>(`/audit?limit=${limit}`);
    } catch {
      return [];
    }
  },

  // Ask AI
  askAI: async (query: string, screenContext: string) => {
    try {
      return await request<AskAIResult>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query, screen_context: screenContext }),
      });
    } catch {
      const q = query.toLowerCase();
      let answer = `[DEMO AI EXECUTIVE ANALYSIS for ${screenContext}]: Processing query: "${query}". Based on live state records, schedule slips are concentrated in Chengalpattu circle due to statutory revenue land awards.`;
      let actions = ['Convene Joint Revenue Taskforce', 'Inspect TANGEDCO Pole Relocation Sites', 'Review Contractor PST Notice'];
      let groundings = [
        {
          type: 'Leadership Issue',
          reference: 'LDR-2026-001',
          detail: '4.2 Ha Land Acquisition stalled at Akkarai Section (SH-49 ECR)'
        },
        {
          type: 'Interdepartmental Blocker',
          reference: 'DEP-2',
          detail: 'Relocation of 42 HT Poles pending with TANGEDCO Kanchipuram'
        }
      ];

      if (q.includes('intervention') || q.includes('immediate')) {
        answer = `[DEMO AI EXECUTIVE ALERT]: 3 projects require leadership intervention. Priority #1 is SH-49 ECR land acquisition (+65 days slip). Priority #2 is Tambaram Elevated Corridor Railway GAD clearance (+90 days slip).`;
        actions = ['Schedule Secretariat Bilateral Conference', 'Issue Clause 46 GCC Notice to Contractor', 'Review Financial Exposure'];
      } else if (q.includes('exposure') || q.includes('leakage') || q.includes('financial')) {
        answer = `[DEMO AI FINANCIAL INTELLIGENCE]: Total potential financial exposure is ₹3.65 Cr across measurement discrepancies and advance recovery lags. ₹1.80 Cr verified recovery is already initiated, and ₹1.85 Cr prevented expenditure verified. Note: These are distinct statutory accounting buckets.`;
        actions = ['Review Bituminous Concrete Weighbridge Logs', 'Enforce RA Bill #5 Advance Deductions', 'Request HRS Forensic Audit'];
      }

      return {
        answer,
        suggested_actions: actions,
        grounding_references: groundings,
        is_demo: true,
        disclaimer: 'DEMO DATA ONLY: Generated for executive smartboard demonstration. Official executive actions require formal statutory Government Orders (G.O.).'
      };
    }
  },
};
