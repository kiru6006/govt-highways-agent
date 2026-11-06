/**
 * TN-HDOS Central Synthetic Highways Dataset Foundation
 * Prompt 01 Specification: Reusable by Leakage, Reports, Project 360, Quality, Assets,
 * Departments, Land & Utility, Finance, Contractors, and Field Operations.
 * 
 * Strict Metadata Enforcement:
 * - data_mode: 'mock'
 * - data_status: 'Seeded Demo'
 * - source_type: 'synthetic'
 */

export interface SyntheticBaseMetadata {
  data_mode: 'mock';
  data_status: 'Seeded Demo';
  source_type: 'synthetic';
  generated_at: string;
  scenario_id?: string;
}

export interface SyntheticProject extends SyntheticBaseMetadata {
  id: number;
  project_code: string;
  title: string;
  programme: 'CMRDP' | 'CKICP' | 'TNRSP_II' | 'NABARD' | 'CRIDP';
  road_type: 'SH' | 'MDR' | 'ODR' | 'NH';
  road_code: string;
  district: string;
  zone: string;
  division: string;
  sanctioned_cost_cr: number;
  revised_cost_cr?: number;
  expenditure_to_date_cr: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  status: 'SANCTIONED' | 'TENDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'STALLED';
  contractor_id: number;
  superintending_engineer: string;
  divisional_engineer: string;
  chainage_start_km: number;
  chainage_end_km: number;
  start_date: string;
  target_completion_date: string;
}

export interface SyntheticPackage extends SyntheticBaseMetadata {
  id: number;
  package_code: string;
  project_id: number;
  package_name: string;
  chainage_start_km: number;
  chainage_end_km: number;
  sanctioned_cost_cr: number;
  contractor_id: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  status: 'AWARDED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  time_extensions_count: number;
}

export interface SyntheticContractor extends SyntheticBaseMetadata {
  id: number;
  name: string;
  class: 'CLASS_1_SUPER' | 'CLASS_1' | 'CLASS_2';
  pan_masked: string;
  gst_masked: string;
  total_works_awarded: number;
  active_works_count: number;
  rating_score: number;
  blacklisted: boolean;
  city: string;
}

export interface SyntheticOfficial extends SyntheticBaseMetadata {
  id: number;
  officer_name: string;
  cadre: 'CE' | 'SE' | 'EE' | 'ADE' | 'AE' | 'JE' | 'FA_CAO' | 'SPECIAL_GP';
  designation: string;
  posting_unit: string;
  district: string;
  zone: string;
  email: string;
  phone: string;
}

export interface SyntheticTransaction extends SyntheticBaseMetadata {
  id: number;
  transaction_ref: string;
  project_id: number;
  package_id: number;
  contractor_id: number;
  bill_number: string;
  transaction_type: 'RA_BILL' | 'MOBILISATION_ADVANCE' | 'MATERIAL_ADVANCE' | 'PRICE_ADJUSTMENT' | 'SECURITY_RELEASE';
  gross_amount_cr: number;
  deductions_cr: number;
  net_payable_cr: number;
  voucher_date: string;
  approval_authority: string;
  status: 'SUBMITTED' | 'PASSED' | 'DISBURSED' | 'FLAGGED_ANOMALY';
  mb_book_ref: string;
}

export interface SyntheticPaymentRecord extends SyntheticBaseMetadata {
  id: number;
  payment_voucher_no: string;
  transaction_id: number;
  project_id: number;
  package_id: number;
  contractor_id: number;
  bank_ref_utr: string;
  disbursed_amount_cr: number;
  disbursement_date: string;
  pro_rata_advance_recovered_cr: number;
  retention_held_cr: number;
  payment_mode: 'PFMS_DIRECT' | 'TREASURY_ECS' | 'LETTER_OF_CREDIT';
}

export interface SyntheticMilestone extends SyntheticBaseMetadata {
  id: number;
  milestone_code: string;
  project_id: number;
  package_id: number;
  title: string;
  target_physical_pct: number;
  payment_linked_pct: number;
  due_date: string;
  actual_date?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'SLIPPED';
  delay_days: number;
}

export interface SyntheticQualityFinding extends SyntheticBaseMetadata {
  id: number;
  finding_ref: string;
  project_id: number;
  package_id: number;
  chainage_km: number;
  defect_category: 'BITUMEN_DENSITY' | 'SUB_GRADE_CBR' | 'CONCRETE_STRENGTH' | 'RIDING_QUALITY_IRI' | 'GUARD_RAIL_FIXING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lab_report_ref: string;
  description: string;
  rectification_status: 'OPEN' | 'UNDER_RECTIFICATION' | 'CLOSED_VERIFIED';
}

export interface SyntheticLandUtilityDependency extends SyntheticBaseMetadata {
  id: number;
  dependency_code: string;
  project_id: number;
  package_id: number;
  agency_name: string;
  dependency_type: 'LAND_ACQUISITION_AWARD' | 'TANGEDCO_EB_POLE' | 'TWAD_WATER_PIPE' | 'FOREST_CLEARANCE' | 'RAILWAY_ROB_CRS';
  location_chainage_km: number;
  days_pending: number;
  status: 'NOTICE_ISSUED' | 'JOINT_INSPECTION' | 'ESTIMATE_PAID' | 'PHYSICAL_SHIFTING_PENDING';
}

export interface SyntheticAnomalyFinding extends SyntheticBaseMetadata {
  id: number;
  finding_code: string;
  project_id: number;
  package_id?: number;
  contractor_id?: number;
  category: 
    | 'Duplicate Payment Indicators'
    | 'Milestone and Payment Mismatches'
    | 'Unusual Cost Variations'
    | 'Repeated Contract Extensions'
    | 'Work Progress and Expenditure Mismatches'
    | 'Missing Supporting Documents'
    | 'Unusual Quantity Variations'
    | 'Repeated Quality Defects'
    | 'Delayed Approvals Affecting Financial Progress'
    | 'Land and Utility-Related Project Delays';
  title: string;
  description: string;
  what_detected: string;
  why_flagged: string;
  detection_rule: string;
  calculation_formula: string;
  potential_exposure_cr: number;
  transaction_value_cr: number;
  verified_impact_cr: number;
  amount_under_review_cr: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ai_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence_status: 'SUPPORTED_BY_RECORDS' | 'PARTIAL_TELEMETRY' | 'CIRCUMSTANTIAL_VARIANCE';
  responsible_department: string;
  responsible_officer: string;
  review_status: 'NEW' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'VERIFIED' | 'NOT_SUBSTANTIATED' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  review_remarks?: string;
  suggested_verification: string;
  recommended_action: string;
  corrective_action?: string;
  action_due_date?: string;
  escalated_to_secretary: boolean;
  evidence_records_json: string;
  created_at: string;
}

const BASE_META: SyntheticBaseMetadata = {
  data_mode: 'mock',
  data_status: 'Seeded Demo',
  source_type: 'synthetic',
  generated_at: '2026-11-06T12:00:00Z',
};

// -------------------------------------------------------------
// 1. 12 SYNTHETIC HIGHWAY PROJECTS
// -------------------------------------------------------------
export const SYNTHETIC_PROJECTS: SyntheticProject[] = [
  {
    ...BASE_META,
    id: 1,
    project_code: 'PRJ-TN-2026-001',
    title: 'Widening to 4 Lanes with Paved Shoulders of SH-49 (East Coast Road) km 22/0 to 45/0',
    programme: 'CMRDP',
    road_type: 'SH',
    road_code: 'SH-49',
    district: 'Chengalpattu',
    zone: 'Chennai Zone',
    division: 'Chengalpattu Division',
    sanctioned_cost_cr: 142.20,
    revised_cost_cr: 156.40,
    expenditure_to_date_cr: 64.80,
    physical_progress_pct: 52.5,
    financial_progress_pct: 45.6,
    status: 'IN_PROGRESS',
    contractor_id: 1,
    superintending_engineer: 'Er. R. Manivannan, M.E. (SE Chengalpattu Circle)',
    divisional_engineer: 'Er. P. Anandhan, B.E. (DE Highways Chengalpattu)',
    chainage_start_km: 22.0,
    chainage_end_km: 45.0,
    start_date: '2024-03-15',
    target_completion_date: '2026-06-30'
  },
  {
    ...BASE_META,
    id: 2,
    project_code: 'PRJ-TN-2026-002',
    title: 'Construction of 4-Lane Grade Separator / Elevated Corridor at Tambaram on MDR-102',
    programme: 'CMRDP',
    road_type: 'MDR',
    road_code: 'MDR-102',
    district: 'Chennai',
    zone: 'Chennai Zone',
    division: 'Tambaram Division',
    sanctioned_cost_cr: 85.00,
    expenditure_to_date_cr: 22.40,
    physical_progress_pct: 31.0,
    financial_progress_pct: 26.4,
    status: 'IN_PROGRESS',
    contractor_id: 2,
    superintending_engineer: 'Er. R. Manivannan, M.E. (SE Metro Circle)',
    divisional_engineer: 'Er. S. Murugesan, M.Tech. (DE Tambaram)',
    chainage_start_km: 0.0,
    chainage_end_km: 3.2,
    start_date: '2024-08-01',
    target_completion_date: '2026-12-31'
  },
  {
    ...BASE_META,
    id: 3,
    project_code: 'PRJ-TN-2026-003',
    title: 'Reconstruction of Distressed High-Level Bridge on ODR-045 Thiruporur Hub',
    programme: 'NABARD',
    road_type: 'ODR',
    road_code: 'ODR-045',
    district: 'Kancheepuram',
    zone: 'Chennai Zone',
    division: 'Kancheepuram Division',
    sanctioned_cost_cr: 18.10,
    expenditure_to_date_cr: 16.50,
    physical_progress_pct: 92.0,
    financial_progress_pct: 91.2,
    status: 'COMPLETED',
    contractor_id: 3,
    superintending_engineer: 'Er. R. Manivannan, M.E.',
    divisional_engineer: 'Er. K. Velmurugan, B.E.',
    chainage_start_km: 14.5,
    chainage_end_km: 15.2,
    start_date: '2023-11-10',
    target_completion_date: '2025-10-31'
  },
  {
    ...BASE_META,
    id: 4,
    project_code: 'PRJ-TN-2026-004',
    title: 'Four Laning of SH-15 Ooty-Gudalur-Myleripalayam Ghat Corridor km 12/0 to 38/0',
    programme: 'CKICP',
    road_type: 'SH',
    road_code: 'SH-15',
    district: 'Coimbatore',
    zone: 'Coimbatore Zone',
    division: 'Coimbatore Special Division',
    sanctioned_cost_cr: 210.50,
    expenditure_to_date_cr: 98.40,
    physical_progress_pct: 46.8,
    financial_progress_pct: 46.7,
    status: 'IN_PROGRESS',
    contractor_id: 4,
    superintending_engineer: 'Er. M. Gunasekaran, M.E.',
    divisional_engineer: 'Er. T. Senthil Kumar, B.E.',
    chainage_start_km: 12.0,
    chainage_end_km: 38.0,
    start_date: '2024-01-20',
    target_completion_date: '2026-08-31'
  },
  {
    ...BASE_META,
    id: 5,
    project_code: 'PRJ-TN-2026-005',
    title: 'Strengthening & Realignment of SH-09 Cuddalore-Chidambaram Riverine Link',
    programme: 'TNRSP_II',
    road_type: 'SH',
    road_code: 'SH-09',
    district: 'Cuddalore',
    zone: 'Tiruchirappalli Zone',
    division: 'Cuddalore Division',
    sanctioned_cost_cr: 118.00,
    expenditure_to_date_cr: 88.50,
    physical_progress_pct: 75.0,
    financial_progress_pct: 75.0,
    status: 'IN_PROGRESS',
    contractor_id: 5,
    superintending_engineer: 'Er. N. Shanmugam, M.E.',
    divisional_engineer: 'Er. A. Radhakrishnan, B.E.',
    chainage_start_km: 5.0,
    chainage_end_km: 42.0,
    start_date: '2023-09-01',
    target_completion_date: '2026-03-31'
  },
  {
    ...BASE_META,
    id: 6,
    project_code: 'PRJ-TN-2026-006',
    title: 'Widening to 4 Lanes of SH-63 Thanjavur-Manamadurai Agro Logistics Corridor',
    programme: 'CKICP',
    road_type: 'SH',
    road_code: 'SH-63',
    district: 'Thanjavur',
    zone: 'Tiruchirappalli Zone',
    division: 'Thanjavur Division',
    sanctioned_cost_cr: 265.00,
    revised_cost_cr: 298.50,
    expenditure_to_date_cr: 142.30,
    physical_progress_pct: 53.7,
    financial_progress_pct: 53.6,
    status: 'IN_PROGRESS',
    contractor_id: 6,
    superintending_engineer: 'Er. N. Shanmugam, M.E.',
    divisional_engineer: 'Er. G. Ilangovan, M.E.',
    chainage_start_km: 0.0,
    chainage_end_km: 68.0,
    start_date: '2023-12-15',
    target_completion_date: '2026-11-30'
  },
  {
    ...BASE_META,
    id: 7,
    project_code: 'PRJ-TN-2026-007',
    title: 'Madurai Ring Road to Tuticorin Port Connectivity Expressway Link SH-75',
    programme: 'CKICP',
    road_type: 'SH',
    road_code: 'SH-75',
    district: 'Madurai',
    zone: 'Madurai Zone',
    division: 'Madurai Special Division',
    sanctioned_cost_cr: 340.00,
    expenditure_to_date_cr: 210.00,
    physical_progress_pct: 61.8,
    financial_progress_pct: 61.7,
    status: 'IN_PROGRESS',
    contractor_id: 7,
    superintending_engineer: 'Er. V. Subramanian, M.E.',
    divisional_engineer: 'Er. M. Palanivel, B.E.',
    chainage_start_km: 10.0,
    chainage_end_km: 74.0,
    start_date: '2023-08-10',
    target_completion_date: '2026-09-30'
  },
  {
    ...BASE_META,
    id: 8,
    project_code: 'PRJ-TN-2026-008',
    title: 'Reconstruction of 6 Major Bridges along SH-115 Cheyyar-Vandavasi Highway',
    programme: 'NABARD',
    road_type: 'SH',
    road_code: 'SH-115',
    district: 'Tiruvannamalai',
    zone: 'Chennai Zone',
    division: 'Tiruvannamalai Division',
    sanctioned_cost_cr: 42.60,
    expenditure_to_date_cr: 12.80,
    physical_progress_pct: 30.0,
    financial_progress_pct: 30.0,
    status: 'IN_PROGRESS',
    contractor_id: 8,
    superintending_engineer: 'Er. R. Manivannan, M.E.',
    divisional_engineer: 'Er. D. Rajendran, B.E.',
    chainage_start_km: 4.0,
    chainage_end_km: 36.0,
    start_date: '2024-05-10',
    target_completion_date: '2026-07-31'
  },
  {
    ...BASE_META,
    id: 9,
    project_code: 'PRJ-TN-2026-009',
    title: 'Salem City Western Ring Road MDR-218 Realignment and Grade Separator',
    programme: 'CRIDP',
    road_type: 'MDR',
    road_code: 'MDR-218',
    district: 'Salem',
    zone: 'Salem Zone',
    division: 'Salem City Division',
    sanctioned_cost_cr: 74.30,
    expenditure_to_date_cr: 18.20,
    physical_progress_pct: 24.5,
    financial_progress_pct: 24.5,
    status: 'IN_PROGRESS',
    contractor_id: 9,
    superintending_engineer: 'Er. C. Krishnan, M.E.',
    divisional_engineer: 'Er. P. Balamurugan, B.E.',
    chainage_start_km: 0.0,
    chainage_end_km: 14.8,
    start_date: '2024-07-01',
    target_completion_date: '2027-01-31'
  },
  {
    ...BASE_META,
    id: 10,
    project_code: 'PRJ-TN-2026-010',
    title: 'Tirunelveli Outer Bypass connecting NH-44 and SH-40 Ambasamudram Road',
    programme: 'CMRDP',
    road_type: 'SH',
    road_code: 'SH-40',
    district: 'Tirunelveli',
    zone: 'Madurai Zone',
    division: 'Tirunelveli Division',
    sanctioned_cost_cr: 98.40,
    expenditure_to_date_cr: 39.30,
    physical_progress_pct: 40.0,
    financial_progress_pct: 39.9,
    status: 'IN_PROGRESS',
    contractor_id: 10,
    superintending_engineer: 'Er. V. Subramanian, M.E.',
    divisional_engineer: 'Er. K. Sivakumar, B.E.',
    chainage_start_km: 0.0,
    chainage_end_km: 19.5,
    start_date: '2024-02-15',
    target_completion_date: '2026-10-31'
  },
  {
    ...BASE_META,
    id: 11,
    project_code: 'PRJ-TN-2026-011',
    title: 'Widening to 2-Lane with Paved Shoulders of ODR-112 Sivakasi-Srivilliputhur Fireworks Spine',
    programme: 'CRIDP',
    road_type: 'ODR',
    road_code: 'ODR-112',
    district: 'Virudhunagar',
    zone: 'Madurai Zone',
    division: 'Virudhunagar Division',
    sanctioned_cost_cr: 34.50,
    expenditure_to_date_cr: 4.80,
    physical_progress_pct: 14.0,
    financial_progress_pct: 13.9,
    status: 'IN_PROGRESS',
    contractor_id: 1,
    superintending_engineer: 'Er. V. Subramanian, M.E.',
    divisional_engineer: 'Er. R. Jeyaraj, B.E.',
    chainage_start_km: 0.0,
    chainage_end_km: 22.0,
    start_date: '2025-01-10',
    target_completion_date: '2026-12-31'
  },
  {
    ...BASE_META,
    id: 12,
    project_code: 'PRJ-TN-2026-012',
    title: 'Construction of Grade Separator at Anna Salai - Guindy Kathipara Feeder Jn MDR-089',
    programme: 'CMRDP',
    road_type: 'MDR',
    road_code: 'MDR-089',
    district: 'Chennai',
    zone: 'Chennai Zone',
    division: 'Chennai Metro Division',
    sanctioned_cost_cr: 112.00,
    expenditure_to_date_cr: 0.0,
    physical_progress_pct: 0.0,
    financial_progress_pct: 0.0,
    status: 'TENDERED',
    contractor_id: 2,
    superintending_engineer: 'Er. R. Manivannan, M.E.',
    divisional_engineer: 'Er. S. Murugesan, M.Tech.',
    chainage_start_km: 0.0,
    chainage_end_km: 1.8,
    start_date: '2025-04-01',
    target_completion_date: '2027-06-30'
  }
];

// -------------------------------------------------------------
// 2. 20 SYNTHETIC PACKAGES
// -------------------------------------------------------------
export const SYNTHETIC_PACKAGES: SyntheticPackage[] = [
  { ...BASE_META, id: 1, package_code: 'PKG-ECR-01', project_id: 1, package_name: 'km 22/0 to 33/0 Widening & Pavement', chainage_start_km: 22.0, chainage_end_km: 33.0, sanctioned_cost_cr: 68.50, contractor_id: 1, physical_progress_pct: 58.0, financial_progress_pct: 51.0, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 2, package_code: 'PKG-ECR-02', project_id: 1, package_name: 'km 33/0 to 45/0 Pavement & Minor Bridges', chainage_start_km: 33.0, chainage_end_km: 45.0, sanctioned_cost_cr: 73.70, contractor_id: 2, physical_progress_pct: 47.0, financial_progress_pct: 40.2, status: 'IN_PROGRESS', time_extensions_count: 2 },
  { ...BASE_META, id: 3, package_code: 'PKG-TBR-01', project_id: 2, package_name: 'Foundation, Piling & Substructure Tambaram', chainage_start_km: 0.0, chainage_end_km: 1.6, sanctioned_cost_cr: 44.00, contractor_id: 2, physical_progress_pct: 38.0, financial_progress_pct: 32.0, status: 'IN_PROGRESS', time_extensions_count: 3 },
  { ...BASE_META, id: 4, package_code: 'PKG-TBR-02', project_id: 2, package_name: 'Steel Composite Girder & Superstructure', chainage_start_km: 1.6, chainage_end_km: 3.2, sanctioned_cost_cr: 41.00, contractor_id: 4, physical_progress_pct: 24.0, financial_progress_pct: 20.8, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 5, package_code: 'PKG-TPR-01', project_id: 3, package_name: 'High-Level Bridge Superstructure & Approaches', chainage_start_km: 14.5, chainage_end_km: 15.2, sanctioned_cost_cr: 18.10, contractor_id: 3, physical_progress_pct: 92.0, financial_progress_pct: 91.2, status: 'COMPLETED', time_extensions_count: 0 },
  { ...BASE_META, id: 6, package_code: 'PKG-CBE-01', project_id: 4, package_name: 'Ghat Section Hill Cutting & Retaining Walls', chainage_start_km: 12.0, chainage_end_km: 24.0, sanctioned_cost_cr: 102.00, contractor_id: 4, physical_progress_pct: 52.0, financial_progress_pct: 51.5, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 7, package_code: 'PKG-CBE-02', project_id: 4, package_name: 'Bituminous Concrete & Curve Realignment', chainage_start_km: 24.0, chainage_end_km: 38.0, sanctioned_cost_cr: 108.50, contractor_id: 5, physical_progress_pct: 41.6, financial_progress_pct: 41.9, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 8, package_code: 'PKG-CUD-01', project_id: 5, package_name: 'Riverine Embankment Stabilization & DBM', chainage_start_km: 5.0, chainage_end_km: 22.0, sanctioned_cost_cr: 56.00, contractor_id: 5, physical_progress_pct: 82.0, financial_progress_pct: 81.8, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 9, package_code: 'PKG-CUD-02', project_id: 5, package_name: 'km 22/0 to 42/0 Wearing Course & Drainage', chainage_start_km: 22.0, chainage_end_km: 42.0, sanctioned_cost_cr: 62.00, contractor_id: 6, physical_progress_pct: 68.0, financial_progress_pct: 68.2, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 10, package_code: 'PKG-TNJ-01', project_id: 6, package_name: 'Thanjavur-Pattukkottai 4-Lane km 0/0 to 34/0', chainage_start_km: 0.0, chainage_end_km: 34.0, sanctioned_cost_cr: 130.00, contractor_id: 6, physical_progress_pct: 59.0, financial_progress_pct: 59.0, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 11, package_code: 'PKG-TNJ-02', project_id: 6, package_name: 'Pattukkottai-Manamadurai km 34/0 to 68/0', chainage_start_km: 34.0, chainage_end_km: 68.0, sanctioned_cost_cr: 135.00, contractor_id: 7, physical_progress_pct: 48.4, financial_progress_pct: 48.2, status: 'IN_PROGRESS', time_extensions_count: 2 },
  { ...BASE_META, id: 12, package_code: 'PKG-MDU-01', project_id: 7, package_name: 'Madurai Ring Road to Aruppukkottai km 10/0 to 40/0', chainage_start_km: 10.0, chainage_end_km: 40.0, sanctioned_cost_cr: 165.00, contractor_id: 7, physical_progress_pct: 68.0, financial_progress_pct: 68.0, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 13, package_code: 'PKG-MDU-02', project_id: 7, package_name: 'Aruppukkottai to Tuticorin Port Gate km 40/0 to 74/0', chainage_start_km: 40.0, chainage_end_km: 74.0, sanctioned_cost_cr: 175.00, contractor_id: 8, physical_progress_pct: 55.6, financial_progress_pct: 55.4, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 14, package_code: 'PKG-TVM-01', project_id: 8, package_name: 'Cheyyar River High Level Bridge Reconstruction', chainage_start_km: 4.0, chainage_end_km: 5.2, sanctioned_cost_cr: 22.00, contractor_id: 8, physical_progress_pct: 35.0, financial_progress_pct: 35.0, status: 'IN_PROGRESS', time_extensions_count: 2 },
  { ...BASE_META, id: 15, package_code: 'PKG-TVM-02', project_id: 8, package_name: 'Vandavasi Major Bridge & Approach Slabs', chainage_start_km: 25.0, chainage_end_km: 26.1, sanctioned_cost_cr: 20.60, contractor_id: 9, physical_progress_pct: 25.0, financial_progress_pct: 25.0, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 16, package_code: 'PKG-SLM-01', project_id: 9, package_name: 'Salem Ring Road Civil Works & Utility Shifting', chainage_start_km: 0.0, chainage_end_km: 14.8, sanctioned_cost_cr: 74.30, contractor_id: 9, physical_progress_pct: 24.5, financial_progress_pct: 24.5, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 17, package_code: 'PKG-TNV-01', project_id: 10, package_name: 'Tirunelveli Bypass Formation km 0/0 to 10/0', chainage_start_km: 0.0, chainage_end_km: 10.0, sanctioned_cost_cr: 48.00, contractor_id: 10, physical_progress_pct: 46.0, financial_progress_pct: 45.8, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 18, package_code: 'PKG-TNV-02', project_id: 10, package_name: 'Pavement & Minor Junctions km 10/0 to 19/5', chainage_start_km: 10.0, chainage_end_km: 19.5, sanctioned_cost_cr: 50.40, contractor_id: 1, physical_progress_pct: 34.0, financial_progress_pct: 34.0, status: 'IN_PROGRESS', time_extensions_count: 1 },
  { ...BASE_META, id: 19, package_code: 'PKG-VRD-01', project_id: 11, package_name: 'Sivakasi Hazardous Curve Realignment Works', chainage_start_km: 0.0, chainage_end_km: 22.0, sanctioned_cost_cr: 34.50, contractor_id: 1, physical_progress_pct: 14.0, financial_progress_pct: 13.9, status: 'IN_PROGRESS', time_extensions_count: 0 },
  { ...BASE_META, id: 20, package_code: 'PKG-CHN-01', project_id: 12, package_name: 'Kathipara Junction Feeder Flyover Spans', chainage_start_km: 0.0, chainage_end_km: 1.8, sanctioned_cost_cr: 112.00, contractor_id: 2, physical_progress_pct: 0.0, financial_progress_pct: 0.0, status: 'AWARDED', time_extensions_count: 0 }
];

// -------------------------------------------------------------
// 3. 10 FICTIONAL CONTRACTORS
// -------------------------------------------------------------
export const SYNTHETIC_CONTRACTORS: SyntheticContractor[] = [
  { ...BASE_META, id: 1, name: 'M/s Eswar Heavy Infra Engineering Pvt Ltd', class: 'CLASS_1_SUPER', pan_masked: 'AAACE****E', gst_masked: '33AAACE****1Z1', total_works_awarded: 18, active_works_count: 4, rating_score: 84.5, blacklisted: false, city: 'Chennai' },
  { ...BASE_META, id: 2, name: 'M/s Tamil Nadu Coastal Expressways Corporation Ltd', class: 'CLASS_1_SUPER', pan_masked: 'AAACT****F', gst_masked: '33AAACT****2Z3', total_works_awarded: 24, active_works_count: 5, rating_score: 72.0, blacklisted: false, city: 'Chengalpattu' },
  { ...BASE_META, id: 3, name: 'M/s Kanchi Bridges & Marine Foundations Ltd', class: 'CLASS_1', pan_masked: 'AAACK****G', gst_masked: '33AAACK****3Z5', total_works_awarded: 11, active_works_count: 2, rating_score: 91.0, blacklisted: false, city: 'Kancheepuram' },
  { ...BASE_META, id: 4, name: 'M/s Kongu Highways & Ghat Formations LLP', class: 'CLASS_1_SUPER', pan_masked: 'AAACK****H', gst_masked: '33AAACK****4Z7', total_works_awarded: 15, active_works_count: 3, rating_score: 79.5, blacklisted: false, city: 'Coimbatore' },
  { ...BASE_META, id: 5, name: 'M/s Delta Soil Dynamics & Asphalt Tech', class: 'CLASS_1', pan_masked: 'AAACD****I', gst_masked: '33AAACD****5Z9', total_works_awarded: 9, active_works_count: 2, rating_score: 86.0, blacklisted: false, city: 'Tiruchirappalli' },
  { ...BASE_META, id: 6, name: 'M/s Chola Mega Infrastructure Consortium', class: 'CLASS_1_SUPER', pan_masked: 'AAACC****J', gst_masked: '33AAACC****6Z2', total_works_awarded: 22, active_works_count: 4, rating_score: 68.0, blacklisted: false, city: 'Thanjavur' },
  { ...BASE_META, id: 7, name: 'M/s Pandyan Corridors & Port Links Pvt Ltd', class: 'CLASS_1_SUPER', pan_masked: 'AAACP****K', gst_masked: '33AAACP****7Z4', total_works_awarded: 19, active_works_count: 3, rating_score: 83.2, blacklisted: false, city: 'Madurai' },
  { ...BASE_META, id: 8, name: 'M/s Thondai Civil Works & Bridge Craft', class: 'CLASS_1', pan_masked: 'AAACT****L', gst_masked: '33AAACT****8Z6', total_works_awarded: 8, active_works_count: 2, rating_score: 64.5, blacklisted: false, city: 'Tiruvannamalai' },
  { ...BASE_META, id: 9, name: 'M/s Salem Precast Structures & Roadlines', class: 'CLASS_1', pan_masked: 'AAACS****M', gst_masked: '33AAACS****9Z8', total_works_awarded: 12, active_works_count: 3, rating_score: 77.0, blacklisted: false, city: 'Salem' },
  { ...BASE_META, id: 10, name: 'M/s Nellai Bitumen Roads & Civil Projects', class: 'CLASS_2', pan_masked: 'AAACN****N', gst_masked: '33AAACN****0Z0', total_works_awarded: 7, active_works_count: 1, rating_score: 82.0, blacklisted: false, city: 'Tirunelveli' }
];

// -------------------------------------------------------------
// 4. 15 FICTIONAL OFFICIALS
// -------------------------------------------------------------
export const SYNTHETIC_OFFICIALS: SyntheticOfficial[] = [
  { ...BASE_META, id: 1, officer_name: 'Er. R. Manivannan, M.E.', cadre: 'SE', designation: 'Superintending Engineer (Highways)', posting_unit: 'Chengalpattu Circle', district: 'Chengalpattu', zone: 'Chennai Zone', email: 'se.chengalpattu@tnhighways.gov.in', phone: '044-27422301' },
  { ...BASE_META, id: 2, officer_name: 'Er. P. Anandhan, B.E.', cadre: 'EE', designation: 'Divisional Engineer (Highways)', posting_unit: 'Chengalpattu Division', district: 'Chengalpattu', zone: 'Chennai Zone', email: 'de.chengalpattu@tnhighways.gov.in', phone: '044-27422302' },
  { ...BASE_META, id: 3, officer_name: 'Er. S. Murugesan, M.Tech.', cadre: 'EE', designation: 'Divisional Engineer (Highways)', posting_unit: 'Tambaram Metro Division', district: 'Chennai', zone: 'Chennai Zone', email: 'de.tambaram@tnhighways.gov.in', phone: '044-22264101' },
  { ...BASE_META, id: 4, officer_name: 'Er. K. Velmurugan, B.E.', cadre: 'EE', designation: 'Divisional Engineer (Highways)', posting_unit: 'Kancheepuram Division', district: 'Kancheepuram', zone: 'Chennai Zone', email: 'de.kanchi@tnhighways.gov.in', phone: '044-27222501' },
  { ...BASE_META, id: 5, officer_name: 'Er. M. Gunasekaran, M.E.', cadre: 'SE', designation: 'Superintending Engineer (Projects)', posting_unit: 'Coimbatore Projects Circle', district: 'Coimbatore', zone: 'Coimbatore Zone', email: 'se.cbe@tnhighways.gov.in', phone: '0422-2300101' },
  { ...BASE_META, id: 6, officer_name: 'Er. T. Senthil Kumar, B.E.', cadre: 'EE', designation: 'Divisional Engineer (Special Projects)', posting_unit: 'Coimbatore Division', district: 'Coimbatore', zone: 'Coimbatore Zone', email: 'de.cbe@tnhighways.gov.in', phone: '0422-2300102' },
  { ...BASE_META, id: 7, officer_name: 'Er. N. Shanmugam, M.E.', cadre: 'SE', designation: 'Superintending Engineer', posting_unit: 'Trichy Circle', district: 'Tiruchirappalli', zone: 'Tiruchirappalli Zone', email: 'se.trichy@tnhighways.gov.in', phone: '0431-2410301' },
  { ...BASE_META, id: 8, officer_name: 'Er. A. Radhakrishnan, B.E.', cadre: 'EE', designation: 'Divisional Engineer (Highways)', posting_unit: 'Cuddalore Division', district: 'Cuddalore', zone: 'Tiruchirappalli Zone', email: 'de.cuddalore@tnhighways.gov.in', phone: '04142-230101' },
  { ...BASE_META, id: 9, officer_name: 'Er. G. Ilangovan, M.E.', cadre: 'EE', designation: 'Divisional Engineer (CKICP)', posting_unit: 'Thanjavur CKICP Division', district: 'Thanjavur', zone: 'Tiruchirappalli Zone', email: 'de.thanjavur@tnhighways.gov.in', phone: '04362-235101' },
  { ...BASE_META, id: 10, officer_name: 'Er. V. Subramanian, M.E.', cadre: 'SE', designation: 'Superintending Engineer', posting_unit: 'Madurai Circle', district: 'Madurai', zone: 'Madurai Zone', email: 'se.madurai@tnhighways.gov.in', phone: '0452-2530101' },
  { ...BASE_META, id: 11, officer_name: 'Er. M. Palanivel, B.E.', cadre: 'EE', designation: 'Divisional Engineer (Highways)', posting_unit: 'Madurai Special Division', district: 'Madurai', zone: 'Madurai Zone', email: 'de.madurai@tnhighways.gov.in', phone: '0452-2530102' },
  { ...BASE_META, id: 12, officer_name: 'Er. D. Rajendran, B.E.', cadre: 'EE', designation: 'Divisional Engineer', posting_unit: 'Tiruvannamalai Division', district: 'Tiruvannamalai', zone: 'Chennai Zone', email: 'de.tvm@tnhighways.gov.in', phone: '04175-222301' },
  { ...BASE_META, id: 13, officer_name: 'Er. C. Krishnan, M.E.', cadre: 'SE', designation: 'Superintending Engineer', posting_unit: 'Salem Circle', district: 'Salem', zone: 'Salem Zone', email: 'se.salem@tnhighways.gov.in', phone: '0427-2415101' },
  { ...BASE_META, id: 14, officer_name: 'Thiru K. Sundaramoorthy, IA&AS', cadre: 'FA_CAO', designation: 'Financial Advisor & Chief Accounts Officer', posting_unit: 'Directorate of Highways, Guindy', district: 'Chennai', zone: 'Chennai Zone', email: 'fa.cao@tnhighways.gov.in', phone: '044-22200150' },
  { ...BASE_META, id: 15, officer_name: 'Thiru S. Rajagopalan, M.L.', cadre: 'SPECIAL_GP', designation: 'Special Government Pleader (Highways)', posting_unit: 'High Court of Madras', district: 'Chennai', zone: 'Chennai Zone', email: 'spl.gp@tnhighways.gov.in', phone: '044-25341201' }
];

// -------------------------------------------------------------
// 5. 30 SYNTHETIC FINANCIAL TRANSACTIONS
// -------------------------------------------------------------
export const SYNTHETIC_TRANSACTIONS: SyntheticTransaction[] = [
  { ...BASE_META, id: 1, transaction_ref: 'TXN-2025-001', project_id: 1, package_id: 1, contractor_id: 1, bill_number: 'ECR-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 14.50, deductions_cr: 1.45, net_payable_cr: 13.05, voucher_date: '2024-06-20', approval_authority: 'DE Chengalpattu', status: 'DISBURSED', mb_book_ref: 'MB-412/p.1-24' },
  { ...BASE_META, id: 2, transaction_ref: 'TXN-2025-002', project_id: 1, package_id: 1, contractor_id: 1, bill_number: 'ECR-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 18.20, deductions_cr: 2.10, net_payable_cr: 16.10, voucher_date: '2024-09-15', approval_authority: 'DE Chengalpattu', status: 'DISBURSED', mb_book_ref: 'MB-412/p.25-50' },
  { ...BASE_META, id: 3, transaction_ref: 'TXN-2025-003', project_id: 1, package_id: 1, contractor_id: 1, bill_number: 'ECR-RA-03', transaction_type: 'RA_BILL', gross_amount_cr: 21.00, deductions_cr: 2.80, net_payable_cr: 18.20, voucher_date: '2024-12-10', approval_authority: 'DE Chengalpattu', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-412/p.51-78' },
  { ...BASE_META, id: 4, transaction_ref: 'TXN-2025-004', project_id: 1, package_id: 1, contractor_id: 1, bill_number: 'ECR-RA-03', transaction_type: 'RA_BILL', gross_amount_cr: 21.00, deductions_cr: 2.80, net_payable_cr: 18.20, voucher_date: '2024-12-22', approval_authority: 'Sub-Division Kelambakkam', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-412/p.79-90' },
  { ...BASE_META, id: 5, transaction_ref: 'TXN-2025-005', project_id: 1, package_id: 2, contractor_id: 2, bill_number: 'ECR-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 16.50, deductions_cr: 1.65, net_payable_cr: 14.85, voucher_date: '2024-08-14', approval_authority: 'DE Chengalpattu', status: 'DISBURSED', mb_book_ref: 'MB-415/p.1-30' },
  { ...BASE_META, id: 6, transaction_ref: 'TXN-2025-006', project_id: 1, package_id: 2, contractor_id: 2, bill_number: 'ECR-P2-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 14.80, deductions_cr: 1.50, net_payable_cr: 13.30, voucher_date: '2024-11-28', approval_authority: 'DE Chengalpattu', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-415/p.31-55' },
  { ...BASE_META, id: 7, transaction_ref: 'TXN-2025-007', project_id: 2, package_id: 3, contractor_id: 2, bill_number: 'TBR-MOB-ADV', transaction_type: 'MOBILISATION_ADVANCE', gross_amount_cr: 8.50, deductions_cr: 0.0, net_payable_cr: 8.50, voucher_date: '2024-08-20', approval_authority: 'SE Metro Circle', status: 'DISBURSED', mb_book_ref: 'BANK-GUARANTEE-BG-2024-912' },
  { ...BASE_META, id: 8, transaction_ref: 'TXN-2025-008', project_id: 2, package_id: 3, contractor_id: 2, bill_number: 'TBR-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 6.20, deductions_cr: 0.62, net_payable_cr: 5.58, voucher_date: '2024-10-15', approval_authority: 'DE Tambaram', status: 'DISBURSED', mb_book_ref: 'MB-501/p.1-20' },
  { ...BASE_META, id: 9, transaction_ref: 'TXN-2025-009', project_id: 2, package_id: 3, contractor_id: 2, bill_number: 'TBR-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 8.40, deductions_cr: 0.84, net_payable_cr: 7.56, voucher_date: '2024-12-05', approval_authority: 'DE Tambaram', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-501/p.21-42' },
  { ...BASE_META, id: 10, transaction_ref: 'TXN-2025-010', project_id: 2, package_id: 4, contractor_id: 4, bill_number: 'TBR-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 7.80, deductions_cr: 0.78, net_payable_cr: 7.02, voucher_date: '2024-11-10', approval_authority: 'DE Tambaram', status: 'DISBURSED', mb_book_ref: 'MB-504/p.1-15' },
  { ...BASE_META, id: 11, transaction_ref: 'TXN-2025-011', project_id: 3, package_id: 5, contractor_id: 3, bill_number: 'TPR-FINAL-BILL', transaction_type: 'RA_BILL', gross_amount_cr: 3.50, deductions_cr: 0.35, net_payable_cr: 3.15, voucher_date: '2025-02-15', approval_authority: 'DE Kancheepuram', status: 'PASSED', mb_book_ref: 'MB-310/p.90-112' },
  { ...BASE_META, id: 12, transaction_ref: 'TXN-2025-012', project_id: 4, package_id: 6, contractor_id: 4, bill_number: 'CBE-GH-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 28.50, deductions_cr: 2.85, net_payable_cr: 25.65, voucher_date: '2024-05-18', approval_authority: 'DE CBE Special Projects', status: 'DISBURSED', mb_book_ref: 'MB-602/p.1-40' },
  { ...BASE_META, id: 13, transaction_ref: 'TXN-2025-013', project_id: 4, package_id: 6, contractor_id: 4, bill_number: 'CBE-GH-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 32.00, deductions_cr: 3.20, net_payable_cr: 28.80, voucher_date: '2024-09-22', approval_authority: 'DE CBE Special Projects', status: 'DISBURSED', mb_book_ref: 'MB-602/p.41-80' },
  { ...BASE_META, id: 14, transaction_ref: 'TXN-2025-014', project_id: 4, package_id: 6, contractor_id: 4, bill_number: 'CBE-GH-VAR-01', transaction_type: 'PRICE_ADJUSTMENT', gross_amount_cr: 9.80, deductions_cr: 0.0, net_payable_cr: 9.80, voucher_date: '2024-11-15', approval_authority: 'SE CBE Circle', status: 'FLAGGED_ANOMALY', mb_book_ref: 'ITEM-NON-BOQ-HILL-CUT-7' },
  { ...BASE_META, id: 15, transaction_ref: 'TXN-2025-015', project_id: 4, package_id: 7, contractor_id: 5, bill_number: 'CBE-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 22.00, deductions_cr: 2.20, net_payable_cr: 19.80, voucher_date: '2024-08-30', approval_authority: 'DE CBE Special Projects', status: 'DISBURSED', mb_book_ref: 'MB-605/p.1-35' },
  { ...BASE_META, id: 16, transaction_ref: 'TXN-2025-016', project_id: 5, package_id: 8, contractor_id: 5, bill_number: 'CUD-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 24.00, deductions_cr: 2.40, net_payable_cr: 21.60, voucher_date: '2024-04-12', approval_authority: 'DE Cuddalore', status: 'DISBURSED', mb_book_ref: 'MB-211/p.1-30' },
  { ...BASE_META, id: 17, transaction_ref: 'TXN-2025-017', project_id: 5, package_id: 8, contractor_id: 5, bill_number: 'CUD-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 22.50, deductions_cr: 2.25, net_payable_cr: 20.25, voucher_date: '2024-08-19', approval_authority: 'DE Cuddalore', status: 'DISBURSED', mb_book_ref: 'MB-211/p.31-60' },
  { ...BASE_META, id: 18, transaction_ref: 'TXN-2025-018', project_id: 5, package_id: 9, contractor_id: 6, bill_number: 'CUD-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 21.00, deductions_cr: 2.10, net_payable_cr: 18.90, voucher_date: '2024-07-25', approval_authority: 'DE Cuddalore', status: 'DISBURSED', mb_book_ref: 'MB-215/p.1-28' },
  { ...BASE_META, id: 19, transaction_ref: 'TXN-2025-019', project_id: 6, package_id: 10, contractor_id: 6, bill_number: 'TNJ-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 38.00, deductions_cr: 3.80, net_payable_cr: 34.20, voucher_date: '2024-05-30', approval_authority: 'DE Thanjavur CKICP', status: 'DISBURSED', mb_book_ref: 'MB-701/p.1-60' },
  { ...BASE_META, id: 20, transaction_ref: 'TXN-2025-020', project_id: 6, package_id: 10, contractor_id: 6, bill_number: 'TNJ-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 39.50, deductions_cr: 3.95, net_payable_cr: 35.55, voucher_date: '2024-10-14', approval_authority: 'DE Thanjavur CKICP', status: 'DISBURSED', mb_book_ref: 'MB-701/p.61-115' },
  { ...BASE_META, id: 21, transaction_ref: 'TXN-2025-021', project_id: 6, package_id: 11, contractor_id: 7, bill_number: 'TNJ-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 35.00, deductions_cr: 3.50, net_payable_cr: 31.50, voucher_date: '2024-06-18', approval_authority: 'DE Thanjavur CKICP', status: 'DISBURSED', mb_book_ref: 'MB-708/p.1-45' },
  { ...BASE_META, id: 22, transaction_ref: 'TXN-2025-022', project_id: 6, package_id: 11, contractor_id: 7, bill_number: 'TNJ-P2-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 29.80, deductions_cr: 2.98, net_payable_cr: 26.82, voucher_date: '2024-11-20', approval_authority: 'DE Thanjavur CKICP', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-708/p.46-88' },
  { ...BASE_META, id: 23, transaction_ref: 'TXN-2025-023', project_id: 7, package_id: 12, contractor_id: 7, bill_number: 'MDU-EXP-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 56.00, deductions_cr: 5.60, net_payable_cr: 50.40, voucher_date: '2024-03-25', approval_authority: 'DE Madurai Special', status: 'DISBURSED', mb_book_ref: 'MB-801/p.1-80' },
  { ...BASE_META, id: 24, transaction_ref: 'TXN-2025-024', project_id: 7, package_id: 12, contractor_id: 7, bill_number: 'MDU-EXP-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 58.20, deductions_cr: 5.82, net_payable_cr: 52.38, voucher_date: '2024-08-11', approval_authority: 'DE Madurai Special', status: 'DISBURSED', mb_book_ref: 'MB-801/p.81-150' },
  { ...BASE_META, id: 25, transaction_ref: 'TXN-2025-025', project_id: 7, package_id: 13, contractor_id: 8, bill_number: 'MDU-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 48.00, deductions_cr: 4.80, net_payable_cr: 43.20, voucher_date: '2024-06-30', approval_authority: 'DE Madurai Special', status: 'DISBURSED', mb_book_ref: 'MB-805/p.1-65' },
  { ...BASE_META, id: 26, transaction_ref: 'TXN-2025-026', project_id: 8, package_id: 14, contractor_id: 8, bill_number: 'TVM-BRG-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 7.80, deductions_cr: 0.78, net_payable_cr: 7.02, voucher_date: '2024-09-05', approval_authority: 'DE Tiruvannamalai', status: 'DISBURSED', mb_book_ref: 'MB-120/p.1-25' },
  { ...BASE_META, id: 27, transaction_ref: 'TXN-2025-027', project_id: 8, package_id: 14, contractor_id: 8, bill_number: 'TVM-BRG-RA-02', transaction_type: 'RA_BILL', gross_amount_cr: 5.00, deductions_cr: 0.50, net_payable_cr: 4.50, voucher_date: '2024-12-18', approval_authority: 'DE Tiruvannamalai', status: 'FLAGGED_ANOMALY', mb_book_ref: 'MB-120/p.26-44' },
  { ...BASE_META, id: 28, transaction_ref: 'TXN-2025-028', project_id: 9, package_id: 16, contractor_id: 9, bill_number: 'SLM-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 18.20, deductions_cr: 1.82, net_payable_cr: 16.38, voucher_date: '2024-10-29', approval_authority: 'DE Salem City', status: 'DISBURSED', mb_book_ref: 'MB-901/p.1-32' },
  { ...BASE_META, id: 29, transaction_ref: 'TXN-2025-029', project_id: 10, package_id: 17, contractor_id: 10, bill_number: 'TNV-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 22.00, deductions_cr: 2.20, net_payable_cr: 19.80, voucher_date: '2024-07-15', approval_authority: 'DE Tirunelveli', status: 'DISBURSED', mb_book_ref: 'MB-950/p.1-30' },
  { ...BASE_META, id: 30, transaction_ref: 'TXN-2025-030', project_id: 10, package_id: 18, contractor_id: 1, bill_number: 'TNV-P2-RA-01', transaction_type: 'RA_BILL', gross_amount_cr: 17.30, deductions_cr: 1.73, net_payable_cr: 15.57, voucher_date: '2024-11-04', approval_authority: 'DE Tirunelveli', status: 'DISBURSED', mb_book_ref: 'MB-955/p.1-24' }
];

// -------------------------------------------------------------
// 6. 15 SYNTHETIC PAYMENT RECORDS
// -------------------------------------------------------------
export const SYNTHETIC_PAYMENTS: SyntheticPaymentRecord[] = [
  { ...BASE_META, id: 1, payment_voucher_no: 'PV-CHN-2024-0412', transaction_id: 1, project_id: 1, package_id: 1, contractor_id: 1, bank_ref_utr: 'SBIN002491201', disbursed_amount_cr: 13.05, disbursement_date: '2024-06-25', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 0.725, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 2, payment_voucher_no: 'PV-CHN-2024-0689', transaction_id: 2, project_id: 1, package_id: 1, contractor_id: 1, bank_ref_utr: 'SBIN002491202', disbursed_amount_cr: 16.10, disbursement_date: '2024-09-20', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 0.910, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 3, payment_voucher_no: 'PV-CHN-2024-0711', transaction_id: 5, project_id: 1, package_id: 2, contractor_id: 2, bank_ref_utr: 'HDFC001923011', disbursed_amount_cr: 14.85, disbursement_date: '2024-08-20', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 0.825, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 4, payment_voucher_no: 'PV-TBR-2024-0102', transaction_id: 7, project_id: 2, package_id: 3, contractor_id: 2, bank_ref_utr: 'HDFC001923012', disbursed_amount_cr: 8.50, disbursement_date: '2024-08-22', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 0.0, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 5, payment_voucher_no: 'PV-TBR-2024-0245', transaction_id: 8, project_id: 2, package_id: 3, contractor_id: 2, bank_ref_utr: 'HDFC001923013', disbursed_amount_cr: 5.58, disbursement_date: '2024-10-20', pro_rata_advance_recovered_cr: 0.62, retention_held_cr: 0.310, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 6, payment_voucher_no: 'PV-CBE-2024-0312', transaction_id: 12, project_id: 4, package_id: 6, contractor_id: 4, bank_ref_utr: 'ICIC00018201', disbursed_amount_cr: 25.65, disbursement_date: '2024-05-25', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.425, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 7, payment_voucher_no: 'PV-CBE-2024-0588', transaction_id: 13, project_id: 4, package_id: 6, contractor_id: 4, bank_ref_utr: 'ICIC00018202', disbursed_amount_cr: 28.80, disbursement_date: '2024-09-28', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.600, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 8, payment_voucher_no: 'PV-CUD-2024-0199', transaction_id: 16, project_id: 5, package_id: 8, contractor_id: 5, bank_ref_utr: 'IOBA00049101', disbursed_amount_cr: 21.60, disbursement_date: '2024-04-18', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.200, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 9, payment_voucher_no: 'PV-CUD-2024-0410', transaction_id: 17, project_id: 5, package_id: 8, contractor_id: 5, bank_ref_utr: 'IOBA00049102', disbursed_amount_cr: 20.25, disbursement_date: '2024-08-25', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.125, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 10, payment_voucher_no: 'PV-TNJ-2024-0290', transaction_id: 19, project_id: 6, package_id: 10, contractor_id: 6, bank_ref_utr: 'CANB00072101', disbursed_amount_cr: 34.20, disbursement_date: '2024-06-05', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.900, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 11, payment_voucher_no: 'PV-TNJ-2024-0580', transaction_id: 20, project_id: 6, package_id: 10, contractor_id: 6, bank_ref_utr: 'CANB00072102', disbursed_amount_cr: 35.55, disbursement_date: '2024-10-20', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.975, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 12, payment_voucher_no: 'PV-MDU-2024-0112', transaction_id: 23, project_id: 7, package_id: 12, contractor_id: 7, bank_ref_utr: 'BARB00091201', disbursed_amount_cr: 50.40, disbursement_date: '2024-03-31', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 2.800, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 13, payment_voucher_no: 'PV-MDU-2024-0419', transaction_id: 24, project_id: 7, package_id: 12, contractor_id: 7, bank_ref_utr: 'BARB00091202', disbursed_amount_cr: 52.38, disbursement_date: '2024-08-18', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 2.910, payment_mode: 'PFMS_DIRECT' },
  { ...BASE_META, id: 14, payment_voucher_no: 'PV-SLM-2024-0380', transaction_id: 28, project_id: 9, package_id: 16, contractor_id: 9, bank_ref_utr: 'KVBL00031201', disbursed_amount_cr: 16.38, disbursement_date: '2024-11-05', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 0.910, payment_mode: 'TREASURY_ECS' },
  { ...BASE_META, id: 15, payment_voucher_no: 'PV-TNV-2024-0275', transaction_id: 29, project_id: 10, package_id: 17, contractor_id: 10, bank_ref_utr: 'TMBL00011201', disbursed_amount_cr: 19.80, disbursement_date: '2024-07-22', pro_rata_advance_recovered_cr: 0.0, retention_held_cr: 1.100, payment_mode: 'TREASURY_ECS' }
];

// -------------------------------------------------------------
// 7. 12 SYNTHETIC PROJECT MILESTONES
// -------------------------------------------------------------
export const SYNTHETIC_MILESTONES: SyntheticMilestone[] = [
  { ...BASE_META, id: 1, milestone_code: 'MS-ECR-01', project_id: 1, package_id: 1, title: 'Earthwork & Granular Sub-Base 100%', target_physical_pct: 25.0, payment_linked_pct: 20.0, due_date: '2024-07-31', actual_date: '2024-07-28', status: 'ACHIEVED', delay_days: 0 },
  { ...BASE_META, id: 2, milestone_code: 'MS-ECR-02', project_id: 1, package_id: 1, title: 'Dense Bituminous Macadam (DBM) Layer', target_physical_pct: 50.0, payment_linked_pct: 25.0, due_date: '2024-11-30', actual_date: '2024-12-15', status: 'ACHIEVED', delay_days: 15 },
  { ...BASE_META, id: 3, milestone_code: 'MS-ECR-03', project_id: 1, package_id: 1, title: 'Bituminous Concrete (BC) Wearing Course', target_physical_pct: 75.0, payment_linked_pct: 25.0, due_date: '2025-04-30', status: 'IN_PROGRESS', delay_days: 22 },
  { ...BASE_META, id: 4, milestone_code: 'MS-TBR-01', project_id: 2, package_id: 3, title: 'All Pier Shafts & Pier Caps Complete', target_physical_pct: 35.0, payment_linked_pct: 30.0, due_date: '2024-10-31', status: 'SLIPPED', delay_days: 68 },
  { ...BASE_META, id: 5, milestone_code: 'MS-TBR-02', project_id: 2, package_id: 4, title: 'Superstructure Girder Erection', target_physical_pct: 70.0, payment_linked_pct: 35.0, due_date: '2025-05-31', status: 'PENDING', delay_days: 0 },
  { ...BASE_META, id: 6, milestone_code: 'MS-TPR-01', project_id: 3, package_id: 5, title: 'Bridge Deck Slab Concreting & Testing', target_physical_pct: 85.0, payment_linked_pct: 40.0, due_date: '2024-09-30', actual_date: '2024-09-25', status: 'ACHIEVED', delay_days: 0 },
  { ...BASE_META, id: 7, milestone_code: 'MS-CBE-01', project_id: 4, package_id: 6, title: 'Hill Side Slope Stabilization & Crib Walls', target_physical_pct: 40.0, payment_linked_pct: 30.0, due_date: '2024-08-31', actual_date: '2024-08-20', status: 'ACHIEVED', delay_days: 0 },
  { ...BASE_META, id: 8, milestone_code: 'MS-CUD-01', project_id: 5, package_id: 8, title: 'Sub-grade & Wet Mix Macadam Complete', target_physical_pct: 70.0, payment_linked_pct: 35.0, due_date: '2024-07-31', actual_date: '2024-07-15', status: 'ACHIEVED', delay_days: 0 },
  { ...BASE_META, id: 9, milestone_code: 'MS-TNJ-01', project_id: 6, package_id: 10, title: 'Bypass Realignment Formation 34 km', target_physical_pct: 50.0, payment_linked_pct: 25.0, due_date: '2024-09-30', actual_date: '2024-10-20', status: 'ACHIEVED', delay_days: 20 },
  { ...BASE_META, id: 10, milestone_code: 'MS-MDU-01', project_id: 7, package_id: 12, title: 'Corridor Dual Carriageway Pavement 30 km', target_physical_pct: 60.0, payment_linked_pct: 30.0, due_date: '2024-07-31', actual_date: '2024-07-25', status: 'ACHIEVED', delay_days: 0 },
  { ...BASE_META, id: 11, milestone_code: 'MS-TVM-01', project_id: 8, package_id: 14, title: 'Well Foundation Sinking & Steining', target_physical_pct: 30.0, payment_linked_pct: 25.0, due_date: '2024-11-30', status: 'SLIPPED', delay_days: 45 },
  { ...BASE_META, id: 12, milestone_code: 'MS-SLM-01', project_id: 9, package_id: 16, title: 'Outer Ring Land Formation & Box Culverts', target_physical_pct: 25.0, payment_linked_pct: 20.0, due_date: '2024-12-31', status: 'IN_PROGRESS', delay_days: 12 }
];

// -------------------------------------------------------------
// 8. 10 SYNTHETIC QUALITY FINDINGS
// -------------------------------------------------------------
export const SYNTHETIC_QUALITY_FINDINGS: SyntheticQualityFinding[] = [
  { ...BASE_META, id: 1, finding_ref: 'QF-ECR-001', project_id: 1, package_id: 1, chainage_km: 26.4, defect_category: 'BITUMEN_DENSITY', severity: 'CRITICAL', lab_report_ref: 'HRS/GUINDY/LAB/2024/0912', description: 'Core testing shows Bituminous Concrete compaction 91.2% (Mandated >= 98.0% per MoRTH Section 500)', rectification_status: 'OPEN' },
  { ...BASE_META, id: 2, finding_ref: 'QF-TBR-001', project_id: 2, package_id: 3, chainage_km: 1.2, defect_category: 'CONCRETE_STRENGTH', severity: 'CRITICAL', lab_report_ref: 'HRS/GUINDY/LAB/2024/1104', description: 'Pier P-14 cube test 28-day compressive strength achieved 31.8 MPa against required M-45 (Fail)', rectification_status: 'OPEN' },
  { ...BASE_META, id: 3, finding_ref: 'QF-TPR-001', project_id: 3, package_id: 5, chainage_km: 14.8, defect_category: 'GUARD_RAIL_FIXING', severity: 'MEDIUM', lab_report_ref: 'DE/KANCHI/INSP/2024/44', description: 'Crash barrier post anchor bolts torque below ASTM specifications on northern abutment approach', rectification_status: 'CLOSED_VERIFIED' },
  { ...BASE_META, id: 4, finding_ref: 'QF-CBE-001', project_id: 4, package_id: 6, chainage_km: 18.2, defect_category: 'SUB_GRADE_CBR', severity: 'HIGH', lab_report_ref: 'HRS/CBE/REG/2024/0201', description: 'Soaked CBR value of imported embankment borrow soil is 4.8% vs mandatory 8.0%', rectification_status: 'UNDER_RECTIFICATION' },
  { ...BASE_META, id: 5, finding_ref: 'QF-CUD-001', project_id: 5, package_id: 8, chainage_km: 12.0, defect_category: 'RIDING_QUALITY_IRI', severity: 'MEDIUM', lab_report_ref: 'HRS/TRICHY/ROUGH/2024/12', description: 'International Roughness Index (IRI) measured 2.8 m/km on freshly paved DBM (Threshold 2.2 m/km)', rectification_status: 'OPEN' },
  { ...BASE_META, id: 6, finding_ref: 'QF-TNJ-001', project_id: 6, package_id: 10, chainage_km: 21.5, defect_category: 'BITUMEN_DENSITY', severity: 'HIGH', lab_report_ref: 'HRS/TRICHY/LAB/2024/0812', description: 'Bitumen extraction test indicates 4.3% binder content against mix design recommendation of 5.1%', rectification_status: 'OPEN' },
  { ...BASE_META, id: 7, finding_ref: 'QF-MDU-001', project_id: 7, package_id: 12, chainage_km: 32.0, defect_category: 'CONCRETE_STRENGTH', severity: 'MEDIUM', lab_report_ref: 'HRS/MDU/LAB/2024/0510', description: 'Box culvert barrel slab concrete test strength 28.5 MPa against M-30 specification', rectification_status: 'CLOSED_VERIFIED' },
  { ...BASE_META, id: 8, finding_ref: 'QF-TVM-001', project_id: 8, package_id: 14, chainage_km: 4.8, defect_category: 'CONCRETE_STRENGTH', severity: 'CRITICAL', lab_report_ref: 'HRS/GUINDY/LAB/2024/1218', description: 'Well steining bottom plug concrete shows honeycombing and voiding in underwater tremie placement', rectification_status: 'OPEN' },
  { ...BASE_META, id: 9, finding_ref: 'QF-SLM-001', project_id: 9, package_id: 16, chainage_km: 8.5, defect_category: 'SUB_GRADE_CBR', severity: 'HIGH', lab_report_ref: 'HRS/SLM/LAB/2024/0304', description: 'Gravel sub-base layer thickness deficient by 45mm on outer bypass lane', rectification_status: 'UNDER_RECTIFICATION' },
  { ...BASE_META, id: 10, finding_ref: 'QF-TNV-001', project_id: 10, package_id: 17, chainage_km: 5.2, defect_category: 'GUARD_RAIL_FIXING', severity: 'MEDIUM', lab_report_ref: 'DE/TNV/INSP/2024/91', description: 'W-beam metal crash barrier alignment deviation exceeds permissible 10mm tolerance', rectification_status: 'CLOSED_VERIFIED' }
];

// -------------------------------------------------------------
// 9. 10 SYNTHETIC LAND OR UTILITY DEPENDENCIES
// -------------------------------------------------------------
export const SYNTHETIC_DEPENDENCIES: SyntheticLandUtilityDependency[] = [
  { ...BASE_META, id: 1, dependency_code: 'DEP-ECR-001', project_id: 1, package_id: 1, agency_name: 'TANGEDCO (Chengalpattu EDC)', dependency_type: 'TANGEDCO_EB_POLE', location_chainage_km: 27.5, days_pending: 142, status: 'ESTIMATE_PAID' },
  { ...BASE_META, id: 2, dependency_code: 'DEP-TBR-001', project_id: 2, package_id: 3, agency_name: 'Revenue Department (Tambaram RDO)', dependency_type: 'LAND_ACQUISITION_AWARD', location_chainage_km: 0.8, days_pending: 210, status: 'NOTICE_ISSUED' },
  { ...BASE_META, id: 3, dependency_code: 'DEP-TBR-002', project_id: 2, package_id: 3, agency_name: 'CMWSSB (Metro Water)', dependency_type: 'TWAD_WATER_PIPE', location_chainage_km: 1.4, days_pending: 95, status: 'JOINT_INSPECTION' },
  { ...BASE_META, id: 4, dependency_code: 'DEP-CBE-001', project_id: 4, package_id: 6, agency_name: 'Tamil Nadu Forest Department (Nilgiris)', dependency_type: 'FOREST_CLEARANCE', location_chainage_km: 19.0, days_pending: 185, status: 'JOINT_INSPECTION' },
  { ...BASE_META, id: 5, dependency_code: 'DEP-CUD-001', project_id: 5, package_id: 8, agency_name: 'Southern Railway (Trichy Division)', dependency_type: 'RAILWAY_ROB_CRS', location_chainage_km: 18.5, days_pending: 80, status: 'ESTIMATE_PAID' },
  { ...BASE_META, id: 6, dependency_code: 'DEP-TNJ-001', project_id: 6, package_id: 10, agency_name: 'Revenue Department (Pattukkottai RDO)', dependency_type: 'LAND_ACQUISITION_AWARD', location_chainage_km: 14.0, days_pending: 160, status: 'NOTICE_ISSUED' },
  { ...BASE_META, id: 7, dependency_code: 'DEP-MDU-001', project_id: 7, package_id: 12, agency_name: 'TANGEDCO (Madurai Metro EDC)', dependency_type: 'TANGEDCO_EB_POLE', location_chainage_km: 22.0, days_pending: 110, status: 'PHYSICAL_SHIFTING_PENDING' },
  { ...BASE_META, id: 8, dependency_code: 'DEP-TVM-001', project_id: 8, package_id: 14, agency_name: 'Water Resources Department (WRD Cheyyar)', dependency_type: 'RAILWAY_ROB_CRS', location_chainage_km: 4.5, days_pending: 130, status: 'JOINT_INSPECTION' },
  { ...BASE_META, id: 9, dependency_code: 'DEP-SLM-001', project_id: 9, package_id: 16, agency_name: 'Revenue Department (Salem RDO)', dependency_type: 'LAND_ACQUISITION_AWARD', location_chainage_km: 6.2, days_pending: 175, status: 'NOTICE_ISSUED' },
  { ...BASE_META, id: 10, dependency_code: 'DEP-TNV-001', project_id: 10, package_id: 17, agency_name: 'TWAD Board (Tirunelveli Zone)', dependency_type: 'TWAD_WATER_PIPE', location_chainage_km: 8.0, days_pending: 65, status: 'ESTIMATE_PAID' }
];

// -------------------------------------------------------------
// 10. 16 SYNTHETIC AI ANOMALY FINDINGS (COVERING ALL 10 CATEGORIES)
// -------------------------------------------------------------
export const SYNTHETIC_ANOMALIES: SyntheticAnomalyFinding[] = [
  // Category 1: Duplicate Payment Indicators
  {
    ...BASE_META,
    scenario_id: 'SCENARIO-01',
    id: 1,
    finding_code: 'ANM-2026-001',
    project_id: 1,
    package_id: 1,
    contractor_id: 1,
    category: 'Duplicate Payment Indicators',
    title: 'Duplicate RA Bill Number Invoiced for Same Chainage km 28/0-33/0 [DEMO]',
    description: 'Running Account Bill ref #ECR-RA-03 was submitted twice with identical gross amounts (₹21.00 Cr) within 12 days through two different sub-divisional offices.',
    what_detected: 'Two transaction records (TXN-2025-003 and TXN-2025-004) reference identical bill #ECR-RA-03 for ₹21.00 Cr under Package PKG-ECR-01.',
    why_flagged: 'Detection Rule R-DUP-01 triggered: Matching Bill Identifier + Matching Contractor ID + Transaction gap < 30 days.',
    detection_rule: 'Flag if (BillNumber_A == BillNumber_B) AND (Contractor_A == Contractor_B) AND (VoucherDate_B - VoucherDate_A < 30 days).',
    calculation_formula: 'Potential Exposure = Full value of second submitted bill = ₹21.00 Cr. Currently ₹18.20 Cr withheld pending audit verification.',
    potential_exposure_cr: 18.20,
    transaction_value_cr: 21.00,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 18.20,
    severity: 'CRITICAL',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Accounts & Audit',
    responsible_officer: 'Er. P. Anandhan, B.E. (DE Chengalpattu)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'Thiru K. Sundaramoorthy, IA&AS (FA & CAO)',
    review_remarks: 'Disbursement of TXN-2025-004 frozen in Treasury portal. Sub-division Kelambakkam summoned to produce original measurement book.',
    suggested_verification: 'Conduct physical audit of MB Book 412 pages 51-90 and verify whether electronic bank advice was generated.',
    recommended_action: 'Issue formal query to Executive Engineer Chengalpattu; cancel duplicate voucher TXN-2025-004 and update contractor ledger.',
    corrective_action: 'Voucher frozen in IFHRMS portal. Joint verification notice dispatched.',
    action_due_date: '2026-11-20',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({
      first_bill: { ref: 'TXN-2025-003', bill_no: 'ECR-RA-03', gross_cr: 21.00, date: '2024-12-10', authority: 'DE Chengalpattu' },
      second_bill: { ref: 'TXN-2025-004', bill_no: 'ECR-RA-03', gross_cr: 21.00, date: '2024-12-22', authority: 'Sub-Div Kelambakkam' }
    }),
    created_at: '2026-11-01T10:15:00Z'
  },

  // Category 2: Milestone and Payment Mismatches
  {
    ...BASE_META,
    scenario_id: 'SCENARIO-02',
    id: 2,
    finding_code: 'ANM-2026-002',
    project_id: 2,
    package_id: 3,
    contractor_id: 2,
    category: 'Milestone and Payment Mismatches',
    title: 'Mobilisation Advance Recovery Lag Past 30% Physical Milestone [DEMO]',
    description: 'TBR-RA-02 processed without statutory 15% pro-rata recovery of initial mobilization advance of ₹8.50 Cr sanctioned in August 2024.',
    what_detected: 'Cumulative physical progress achieved 31.0%, but only ₹0.62 Cr recovered against mandatory cumulative recovery threshold of ₹2.82 Cr.',
    why_flagged: 'Rule R-ADV-02: Mobilisation advance recovery must commence when physical progress exceeds 15% and complete before 80% per TN Highways Manual.',
    detection_rule: 'Flag if (ActualPhysicalPct >= 30%) AND (CumulativeAdvanceRecovered < TotalAdvance * 0.33).',
    calculation_formula: 'Lag Exposure = Mandated Recovery (₹2.82 Cr) - Actual Recovered (₹0.62 Cr) = ₹2.20 Cr.',
    potential_exposure_cr: 2.20,
    transaction_value_cr: 8.50,
    verified_impact_cr: 1.20,
    amount_under_review_cr: 1.00,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Accounts & Audit',
    responsible_officer: 'Er. S. Murugesan, M.Tech. (DE Tambaram)',
    review_status: 'VERIFIED',
    assigned_to: 'Er. R. Manivannan, M.E. (SE Metro Circle)',
    review_remarks: 'Contractor requested deferral citing drainage utility delay. Deferral rejected as contract contains no interest adjustment clause.',
    suggested_verification: 'Inspect running bill deduction register and bank guarantee validity with State Bank of India Guindy Branch.',
    recommended_action: 'Order immediate automatic recovery of ₹2.20 Cr from next RA Bill #3 and obtain extension of bank guarantee.',
    corrective_action: 'Deduction schedule scheduled for RA Bill #3 in IFHRMS.',
    action_due_date: '2026-11-25',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({
      total_advance_sanctioned_cr: 8.50,
      contractual_recovery_rate: '15% on each RA bill',
      mandated_cumulative_recovery_cr: 2.82,
      actual_recovered_cr: 0.62,
      recovery_deficit_cr: 2.20
    }),
    created_at: '2026-11-02T14:30:00Z'
  },

  // Category 3: Unusual Cost Variations
  {
    ...BASE_META,
    scenario_id: 'SCENARIO-03',
    id: 3,
    finding_code: 'ANM-2026-003',
    project_id: 4,
    package_id: 6,
    contractor_id: 4,
    category: 'Unusual Cost Variations',
    title: 'Non-BOQ Extra Item Sanction for Rock Blasting Exceeds 25% Sub-limit [DEMO]',
    description: 'Price adjustment voucher CBE-GH-VAR-01 for ₹9.80 Cr introduces non-tendered hard rock hydraulic splitting item without Board of Engineers prior approval.',
    what_detected: 'Single variation order represents 9.6% of original contract value (₹102.00 Cr) and 142% of the contingency budget.',
    why_flagged: 'Rule R-VAR-01: Variations > 5% of package value or introducing new non-BOQ items > ₹2 Cr require COT / BOE statutory sanction.',
    detection_rule: 'Flag if (VariationAmount > 0.05 * PackageCost) AND (ApprovalLevel < "CHIEF_ENGINEER_COT").',
    calculation_formula: 'Potential Exposure = Unsanctioned extra rate component = ₹9.80 Cr pending rate analysis verification.',
    potential_exposure_cr: 9.80,
    transaction_value_cr: 9.80,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 9.80,
    severity: 'CRITICAL',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Chief Engineer (Highways - Projects)',
    responsible_officer: 'Er. T. Senthil Kumar, B.E. (DE Special Projects)',
    review_status: 'ACTION_REQUIRED',
    assigned_to: 'Chief Engineer (Highways - Projects)',
    review_remarks: 'Rate analysis submitted relies on private commercial rates rather than Highways Schedule of Rates (SOR) 2024-25.',
    suggested_verification: 'Depute Senior Geologist from HRS to verify actual geological cross-section of Ooty ghat cutting.',
    recommended_action: 'Submit variation proposal to Standing Finance Committee (SFC) and apply standard PWD Schedule of Rates.',
    corrective_action: 'Payment stopped pending rate reconciliation by Superintending Engineer.',
    action_due_date: '2026-11-18',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({
      original_package_cost_cr: 102.00,
      variation_claimed_cr: 9.80,
      sor_permissible_rate_per_cum: 850,
      invoiced_rate_per_cum: 1420,
      quantity_cum: 69014
    }),
    created_at: '2026-11-03T09:00:00Z'
  },

  // Category 4: Repeated Contract Extensions
  {
    ...BASE_META,
    scenario_id: 'SCENARIO-04',
    id: 4,
    finding_code: 'ANM-2026-004',
    project_id: 2,
    package_id: 3,
    contractor_id: 2,
    category: 'Repeated Contract Extensions',
    title: 'Three Successive Time Extensions Granted Without Liquidated Damages [DEMO]',
    description: 'Package PKG-TBR-01 has received 3 extensions totaling 210 days without invocation of Clause 44 Liquidated Damages (LD) provisions.',
    what_detected: 'Time overrun exceeds 65% of original contract duration while cumulative physical progress remains stalled at 38%.',
    why_flagged: 'Rule R-EXT-01: Successive extensions beyond 180 days require formal departmental delay apportionment between agency and contractor.',
    detection_rule: 'Flag if (TimeExtensionsCount >= 3) AND (LiquidatedDamagesLevied == 0) AND (PhysicalProgress < 50%).',
    calculation_formula: 'Potential LD Exposure = 10% maximum contract value of ₹44.00 Cr = ₹4.40 Cr.',
    potential_exposure_cr: 4.40,
    transaction_value_cr: 44.00,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 4.40,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Planning & Legal Cell',
    responsible_officer: 'Er. R. Manivannan, M.E. (SE Metro Circle)',
    review_status: 'EVIDENCE_REQUESTED',
    assigned_to: 'Thiru S. Rajagopalan, M.L. (Special GP)',
    review_remarks: 'Delay apportionment report awaited from Divisional Engineer. Apparent contributory delay from CMDA alignment change.',
    suggested_verification: 'Review interdepartmental minutes of joint site meetings held with Chennai Metro Rail Ltd and Revenue RDO.',
    recommended_action: 'Finalize formal delay apportionment study within 14 days and decide on partial LD recovery.',
    corrective_action: 'Interim extension granted conditionally subject to outcome of delay apportionment analysis.',
    action_due_date: '2026-11-30',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({
      extension_1_days: 60,
      extension_2_days: 90,
      extension_3_days: 60,
      total_days: 210,
      contractual_ld_rate: '0.1% per day up to max 10%'
    }),
    created_at: '2026-11-03T16:20:00Z'
  },

  // Category 5: Work Progress and Expenditure Mismatches
  {
    ...BASE_META,
    id: 5,
    finding_code: 'ANM-2026-005',
    project_id: 1,
    package_id: 1,
    contractor_id: 1,
    category: 'Work Progress and Expenditure Mismatches',
    title: 'Disbursed Expenditure Exceeds Certified Physical Value by ₹5.40 Cr [DEMO]',
    description: 'Cumulative gross disbursements of ₹53.70 Cr contrast with third-party verified work-in-place physical valuation of ₹48.30 Cr.',
    what_detected: 'Negative Earned Value Schedule Variance of -₹5.40 Cr indicating payment running ahead of measured site execution.',
    why_flagged: 'Rule R-EVM-01: Financial disbursement percentage must not exceed verified physical progress percentage by more than 5%.',
    detection_rule: 'Flag if (FinancialDisbursement_Cr - (SanctionedCost_Cr * PhysicalProgressPct / 100)) > 2.0 Cr.',
    calculation_formula: 'Advance Payment Lag = Disbursed (₹53.70 Cr) - Earned Value (₹48.30 Cr) = ₹5.40 Cr.',
    potential_exposure_cr: 5.40,
    transaction_value_cr: 53.70,
    verified_impact_cr: 2.10,
    amount_under_review_cr: 3.30,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Research Station & Quality Circle',
    responsible_officer: 'Er. P. Anandhan, B.E. (DE Chengalpattu)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'Director, Highways Research Station (HRS)',
    review_remarks: 'Difference partially explained by advances on structural steel delivered to site but not yet erected.',
    suggested_verification: 'Verify secure custody register of fabricated steel girders stored in contractor yard at Kelambakkam.',
    recommended_action: 'Ensure 75% material advance is backed by valid hypothecation deed and insurance policy.',
    corrective_action: 'Material verification team dispatched to Kelambakkam casting yard.',
    action_due_date: '2026-11-22',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({
      cumulative_disbursed_cr: 53.70,
      certified_physical_progress_cr: 48.30,
      material_at_site_advance_claimed_cr: 4.20,
      unsupported_gap_cr: 1.20
    }),
    created_at: '2026-11-04T11:00:00Z'
  },

  // Category 6: Missing Supporting Documents
  {
    ...BASE_META,
    id: 6,
    finding_code: 'ANM-2026-006',
    project_id: 1,
    package_id: 2,
    contractor_id: 2,
    category: 'Missing Supporting Documents',
    title: 'Refinery Gate Passes & Weighbridge Slips Missing for 1,810 MT Bitumen [DEMO]',
    description: 'Running Account Bill ECR-P2-RA-02 lacks electronic refinery dispatch invoices from CPCL Manali for recorded 14,190 MT bitumen quantity.',
    what_detected: 'Invoiced quantity: 14,190 MT; Uploaded gate telemetry: 12,380 MT; Missing verified tonnage: 1,810 MT.',
    why_flagged: 'Rule R-DOC-01: Bulk bitumen supply must be verified by matching refinery batch delivery chalans with weighbridge slips.',
    detection_rule: 'Flag if (InvoicedBitumenQty - RefineryTelemetriedQty) > 50 MT.',
    calculation_formula: 'Potential Exposure = 1,810 MT @ ₹8,011 / MT delivered rate = ₹1.45 Cr.',
    potential_exposure_cr: 1.45,
    transaction_value_cr: 14.80,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.45,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'PARTIAL_TELEMETRY',
    responsible_department: 'Highways Research Station (HRS Guindy)',
    responsible_officer: 'Er. P. Anandhan, B.E. (DE Chengalpattu)',
    review_status: 'EVIDENCE_REQUESTED',
    assigned_to: 'Quality Control Wing, HRS Guindy',
    review_remarks: 'Contractor claims bitumen procured from alternate IOCL Ennore terminal due to CPCL shutdown. Awaiting Ennore gate certificates.',
    suggested_verification: 'API cross-verification with IOCL enterprise dispatch portal against contractor GSTIN.',
    recommended_action: 'Withhold ₹1.45 Cr from next payment until tamper-evident refinery vouchers are validated.',
    corrective_action: '₹1.45 Cr retained from pending payment voucher in IFHRMS.',
    action_due_date: '2026-11-28',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({
      invoiced_mt: 14190,
      verified_cpcl_mt: 12380,
      discrepancy_mt: 1810,
      unit_rate_rs_per_mt: 8011
    }),
    created_at: '2026-11-04T15:45:00Z'
  },

  // Category 7: Unusual Quantity Variations
  {
    ...BASE_META,
    id: 7,
    finding_code: 'ANM-2026-007',
    project_id: 6,
    package_id: 11,
    contractor_id: 7,
    category: 'Unusual Quantity Variations',
    title: 'Earthwork Borrow Pit Lead Distance Deviation Exceeds Sanctioned DPR [DEMO]',
    description: 'Lead distance for approved borrow pit increased from 4.5 km in sanctioned DPR to 18.2 km in bill TNJ-P2-RA-02, creating ₹3.20 Cr extra cartage.',
    what_detected: 'Cartage rate adjustment of ₹165/cum billed for 194,000 cum without District Collector borrow pit exhaustion certificate.',
    why_flagged: 'Rule R-QTY-01: Lead variation > 5 km requires certification from Revenue authorities that nearer designated quarries are exhausted.',
    detection_rule: 'Flag if (ActualLeadKm - DPRLeadKm > 5) AND (RevenueExhaustionCertUploaded == False).',
    calculation_formula: 'Potential Cartage Exposure = 194,000 cum * (₹165/cum extra) = ₹3.20 Cr.',
    potential_exposure_cr: 3.20,
    transaction_value_cr: 29.80,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 3.20,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'CIRCUMSTANTIAL_VARIANCE',
    responsible_department: 'Revenue & Quarry Licensing Wing',
    responsible_officer: 'Er. G. Ilangovan, M.E. (DE Thanjavur CKICP)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'District Collector, Thanjavur',
    review_remarks: 'Letter sent to Thanjavur District Collector Mines Department to ascertain quarry status at Orathanadu.',
    suggested_verification: 'Inspect GIS coordinates of borrow pit sites and verify weighbridge records on transit corridor.',
    recommended_action: 'Restrict payment to DPR lead distance (4.5 km) pending District Collectorate formal verification.',
    corrective_action: 'Extra lead charge held under objection code OBJ-CKICP-09.',
    action_due_date: '2026-11-25',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({
      dpr_lead_km: 4.5,
      billed_lead_km: 18.2,
      quantity_cum: 194000,
      excess_cartage_rate_rs: 165
    }),
    created_at: '2026-11-05T09:30:00Z'
  },

  // Category 8: Repeated Quality Defects
  {
    ...BASE_META,
    scenario_id: 'SCENARIO-05',
    id: 8,
    finding_code: 'ANM-2026-008',
    project_id: 2,
    package_id: 3,
    contractor_id: 2,
    category: 'Repeated Quality Defects',
    title: 'Open Non-Conformance Report on Pier P-14 Despite Completion Claim [DEMO]',
    description: 'Quality defect QF-TBR-001 (concrete strength 31.8 MPa vs required M-45) remains open on HRS Guindy register, yet milestone progress was claimed.',
    what_detected: 'Contractor submitted milestone achievement certification for pier substructure without uploading HRS structural retrofitting acceptance.',
    why_flagged: 'Rule R-QLT-01: No payment milestone may be approved for structural elements bearing open Critical Non-Conformance Reports (NCR).',
    detection_rule: 'Flag if (MilestoneClaimed == True) AND (OpenCriticalDefectsCount > 0) FOR SAME Package.',
    calculation_formula: 'Potential Exposure = Linked Milestone value of Pier P-14 substructure = ₹1.80 Cr.',
    potential_exposure_cr: 1.80,
    transaction_value_cr: 8.40,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.80,
    severity: 'CRITICAL',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Research Station (Structural Wing)',
    responsible_officer: 'Er. S. Murugesan, M.Tech. (DE Tambaram)',
    review_status: 'ACTION_REQUIRED',
    assigned_to: 'Chief Engineer (Highways - Quality Control)',
    review_remarks: 'IIT Madras Structural Division commissioned for ultrasonic non-destructive load test. Field report scheduled for next week.',
    suggested_verification: 'Review IIT Madras core test results and check if carbon fiber wrapping or structural jacket is mandated.',
    recommended_action: 'Issue statutory stop-work notice for pier cap erection above Pier P-14 until structural retrofit is certified.',
    corrective_action: 'Site work on Pier P-14 frozen. Warning letter issued to contractor.',
    action_due_date: '2026-11-19',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({
      ncr_code: 'QF-TBR-001',
      tested_strength_mpa: 31.8,
      mandated_strength_mpa: 45.0,
      testing_agency: 'HRS Guindy',
      status: 'OPEN_CRITICAL'
    }),
    created_at: '2026-11-05T13:00:00Z'
  },

  // Category 9: Delayed Approvals Affecting Financial Progress
  {
    ...BASE_META,
    id: 9,
    finding_code: 'ANM-2026-009',
    project_id: 8,
    package_id: 14,
    contractor_id: 8,
    category: 'Delayed Approvals Affecting Financial Progress',
    title: 'Well Foundation Sinking Approval Delayed 130 Days by Water Resources Dept [DEMO]',
    description: 'Cheyyar River High Level Bridge package PKG-TVM-01 is stalled awaiting Water Resources Department (WRD) waterway hydraulic cross-section NOC.',
    what_detected: 'Statutory interdepartmental dependency DEP-TVM-001 has been pending for 130 days, causing contractor idle machinery claims.',
    why_flagged: 'Rule R-DEP-01: Statutory dependencies pending > 90 days with financial progress lag > 25% require Secretariat-level intervention.',
    detection_rule: 'Flag if (DepartmentDaysPending > 90) AND (ProjectScheduleDelayDays > 45).',
    calculation_formula: 'Potential Idle Machinery / Compensation Exposure claimed by contractor = ₹1.10 Cr.',
    potential_exposure_cr: 1.10,
    transaction_value_cr: 22.00,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.10,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Water Resources Department (WRD)',
    responsible_officer: 'Er. D. Rajendran, B.E. (DE Tiruvannamalai)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'Principal Secretary (Highways & Minor Ports)',
    review_remarks: 'Joint site inspection completed by WRD Executive Engineer Arani. Clearance file submitted to Chief Engineer WRD Chennai.',
    suggested_verification: 'Inspect WRD file #WRD-CHE-2024-411 and verify whether revised high flood level (HFL) calculations are agreed.',
    recommended_action: 'Highways Secretary to address demi-official (D.O.) letter to WRD Secretary for expedited NOC clearance.',
    corrective_action: 'Draft D.O. letter submitted for Secretary signature.',
    action_due_date: '2026-11-21',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({
      days_pending: 130,
      contractor_claim_ref: 'CLAIM-TVM-IDLE-01',
      monthly_idle_machinery_cost_cr: 0.28
    }),
    created_at: '2026-11-05T16:00:00Z'
  },

  // Category 10: Land and Utility-Related Project Delays
  {
    ...BASE_META,
    id: 10,
    finding_code: 'ANM-2026-010',
    project_id: 1,
    package_id: 1,
    contractor_id: 1,
    category: 'Land and Utility-Related Project Delays',
    title: '142-Day Delay in Shifting 48 TANGEDCO High Tension Electric Poles [DEMO]',
    description: 'Demand draft for ₹88 Lakhs was deposited with TANGEDCO in June 2024, yet 48 electric poles at km 27/5 obstruct 4-lane widening.',
    what_detected: 'Sub-grade formation blocked over 3.2 km continuous stretch despite full utility deposit already disbursed.',
    why_flagged: 'Rule R-UTL-01: Paid utility deposits with execution delay > 120 days constitute administrative bottleneck with indirect contractor idle costs.',
    detection_rule: 'Flag if (UtilityDepositPaid == True) AND (DaysSincePayment > 120) AND (PhysicalShiftingComplete == False).',
    calculation_formula: 'Potential Delay Cost Exposure = Indirect traffic deviation + contractor idle overhead = ₹0.88 Cr.',
    potential_exposure_cr: 0.88,
    transaction_value_cr: 0.88,
    verified_impact_cr: 0.88,
    amount_under_review_cr: 0.0,
    severity: 'MEDIUM',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Energy Department (TANGEDCO)',
    responsible_officer: 'Er. P. Anandhan, B.E. (DE Chengalpattu)',
    review_status: 'ACTION_REQUIRED',
    assigned_to: 'Superintending Engineer, TANGEDCO Chengalpattu EDC',
    review_remarks: 'TANGEDCO cites shutdown approval pending from State Load Despatch Centre (SLDC) Chennai due to festival season power demand.',
    suggested_verification: 'Verify SLDC shutdown slot allocation for Chengalpattu 110 kV feeder line.',
    recommended_action: 'Convene coordination meeting with TANGEDCO Chief Engineer (Distribution) Chennai South to schedule 3-day line shutdown.',
    corrective_action: 'Coordination meeting fixed for 12th November at Secretariat.',
    action_due_date: '2026-11-20',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({
      tangedco_deposit_cr: 0.88,
      poles_count: 48,
      chainage_affected_km: '27.5 to 30.7',
      deposit_date: '2024-06-12'
    }),
    created_at: '2026-11-06T08:15:00Z'
  },

  // Additional realistic findings to enrich dataset (11 through 16)
  {
    ...BASE_META,
    id: 11,
    finding_code: 'ANM-2026-011',
    project_id: 7,
    package_id: 12,
    contractor_id: 7,
    category: 'Work Progress and Expenditure Mismatches',
    title: 'Mobilisation Advance Excess Balance Held Past 60% Physical Milestone [DEMO]',
    description: 'Contractor retains ₹3.50 Cr unamortized advance despite project achieving 61.8% physical progress along Madurai-Tuticorin expressway.',
    what_detected: 'TNRSP-II contract clauses mandate 100% advance recovery upon crossing 60% physical completion mark.',
    why_flagged: 'Rule R-ADV-03: Zero unamortized advance must remain after crossing 60% completion.',
    detection_rule: 'Flag if (PhysicalProgress > 60%) AND (UnamortizedAdvance > 0).',
    calculation_formula: 'Immediate Recovery Due = Full remaining unamortized advance = ₹3.50 Cr.',
    potential_exposure_cr: 3.50,
    transaction_value_cr: 3.50,
    verified_impact_cr: 3.50,
    amount_under_review_cr: 0.0,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Accounts & Audit',
    responsible_officer: 'Er. M. Palanivel, B.E. (DE Madurai Special)',
    review_status: 'VERIFIED',
    assigned_to: 'Er. V. Subramanian, M.E. (SE Madurai Circle)',
    review_remarks: 'Verified. Deduction order issued for incoming RA Bill #3.',
    suggested_verification: 'Cross-check deduction column in IFHRMS bill generation module.',
    recommended_action: 'Deduct full ₹3.50 Cr from next gross payment voucher.',
    corrective_action: 'Full recovery scheduled in Treasury ECS advice.',
    action_due_date: '2026-11-15',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({ unamortized_balance_cr: 3.50, physical_pct: 61.8 }),
    created_at: '2026-11-06T09:20:00Z'
  },
  {
    ...BASE_META,
    id: 12,
    finding_code: 'ANM-2026-012',
    project_id: 6,
    package_id: 10,
    contractor_id: 6,
    category: 'Unusual Cost Variations',
    title: 'Excess Asphalt Quantity Escalation Invoiced Over MoRTH Consumption Norms [DEMO]',
    description: 'Asphalt consumption in RA Bill TNJ-RA-02 billed at 5.8% against approved Job Mix Formula (JMF) of 5.1%, adding ₹2.15 Cr unwarranted cost.',
    what_detected: 'Variance of 0.7% bitumen weight across 145,000 MT asphaltic mix represents 1,015 MT excess billing.',
    why_flagged: 'Rule R-JMF-01: Binder consumption exceeding approved mix design by > 0.3% is unacceptable without laboratory justification.',
    detection_rule: 'Flag if (ActualBitumenPct - JMFBitumenPct) > 0.003.',
    calculation_formula: 'Potential Exposure = 1,015 MT * ₹8,011/MT = ₹2.15 Cr.',
    potential_exposure_cr: 2.15,
    transaction_value_cr: 39.50,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 2.15,
    severity: 'MEDIUM',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Research Station (HRS)',
    responsible_officer: 'Er. G. Ilangovan, M.E. (DE Thanjavur CKICP)',
    review_status: 'NEW',
    assigned_to: 'Quality Control Engineer (HRS Trichy)',
    suggested_verification: 'Inspect daily batch printout records from computerized asphalt hot-mix plant at Pattukkottai.',
    recommended_action: 'Audit computerized hot-mix plant electronic telemetry and recalculate bitumen billing based on JMF.',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({ jmf_rate: 0.051, billed_rate: 0.058, total_tonnage: 145000 }),
    created_at: '2026-11-06T10:00:00Z'
  },
  {
    ...BASE_META,
    id: 13,
    finding_code: 'ANM-2026-013',
    project_id: 9,
    package_id: 16,
    contractor_id: 9,
    category: 'Repeated Contract Extensions',
    title: 'Consecutive EOT Granted Without Escalation Neutralization Clause [DEMO]',
    description: 'Extension of Time (EOT) granted for Salem Ring Road package despite contractor falling behind agreed baseline CPM schedule.',
    what_detected: 'Time extension granted without explicitly freezing price escalation indices as mandated by G.O. Ms. No. 101.',
    why_flagged: 'Rule R-EXT-02: Contractor-attributable delay must freeze wholesale price index (WPI) for bitumen and steel adjustments.',
    detection_rule: 'Flag if (ExtensionGranted == True) AND (DelayApportionment == "CONTRACTOR") AND (PriceEscalationFrozen == False).',
    calculation_formula: 'Avoidable Price Escalation Exposure = ₹1.65 Cr.',
    potential_exposure_cr: 1.65,
    transaction_value_cr: 74.30,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.65,
    severity: 'HIGH',
    ai_confidence: 'MEDIUM',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Accounts & Audit',
    responsible_officer: 'Er. P. Balamurugan, B.E. (DE Salem City)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'Er. C. Krishnan, M.E. (SE Salem Circle)',
    suggested_verification: 'Examine EOT sanction proceedings issued by Superintending Engineer Salem.',
    recommended_action: 'Amend EOT proceedings to freeze price escalation indices to original completion milestone date.',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({ original_end_date: '2026-06-30', extended_end_date: '2027-01-31' }),
    created_at: '2026-11-06T10:45:00Z'
  },
  {
    ...BASE_META,
    id: 14,
    finding_code: 'ANM-2026-014',
    project_id: 4,
    package_id: 6,
    contractor_id: 4,
    category: 'Delayed Approvals Affecting Financial Progress',
    title: 'Forest Clearance Condition Compliance Delay Blocks Package Completion [DEMO]',
    description: 'Package PKG-CBE-01 hill cutting blocked over 4.5 km due to delayed compensatory afforestation deposit verification with DFO Nilgiris.',
    what_detected: '185 days pending on statutory clearance DEP-CBE-001 causing critical milestone slip.',
    why_flagged: 'Rule R-DEP-02: Environmental / Forest clearance delays > 150 days risk foreign funding disbursement covenants.',
    detection_rule: 'Flag if (ForestDelayDays > 150) AND (FundingProgramme == "CKICP" OR "TNRSP_II").',
    calculation_formula: 'Potential ADB Loan Commitment Fee / Idle Contractor Claim = ₹1.50 Cr.',
    potential_exposure_cr: 1.50,
    transaction_value_cr: 102.00,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.50,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Environment, Climate Change & Forests',
    responsible_officer: 'Er. T. Senthil Kumar, B.E. (DE Special Projects)',
    review_status: 'ACTION_REQUIRED',
    assigned_to: 'Principal Secretary (Highways)',
    suggested_verification: 'Verify payment receipt of Net Present Value (NPV) deposited into CAMPA account.',
    recommended_action: 'Place matter before State Forest Clearance Committee chaired by Chief Secretary.',
    corrective_action: 'Agenda note submitted for upcoming State Level Committee meeting.',
    action_due_date: '2026-11-24',
    escalated_to_secretary: true,
    evidence_records_json: JSON.stringify({ forest_parcels_ha: 4.8, campa_deposit_cr: 2.10, days_pending: 185 }),
    created_at: '2026-11-06T11:15:00Z'
  },
  {
    ...BASE_META,
    id: 15,
    finding_code: 'ANM-2026-015',
    project_id: 5,
    package_id: 9,
    contractor_id: 6,
    category: 'Repeated Quality Defects',
    title: 'Recurrent Potholing & Longitudinal Cracking on Cuddalore Corridor [DEMO]',
    description: '3rd consecutive inspection observation regarding recurrent premature fatigue cracking along newly laid wearing course on SH-09.',
    what_detected: 'Chainage km 12/0 to 18/0 shows surface cracking within 90 days of execution, indicating inadequate tack coat bonding or weak subgrade.',
    why_flagged: 'Rule R-QLT-02: Premature pavement failure within defect liability period requires mandatory full-depth core forensics.',
    detection_rule: 'Flag if (DefectType == "PAVEMENT_FAILURE") AND (AgeMonths < 6) AND (DefectRecurrence >= 3).',
    calculation_formula: 'Estimated Rectification & Pavement Overlay Cost = ₹1.25 Cr.',
    potential_exposure_cr: 1.25,
    transaction_value_cr: 62.00,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 1.25,
    severity: 'HIGH',
    ai_confidence: 'HIGH',
    evidence_status: 'SUPPORTED_BY_RECORDS',
    responsible_department: 'Highways Research Station (HRS Guindy)',
    responsible_officer: 'Er. A. Radhakrishnan, B.E. (DE Cuddalore)',
    review_status: 'NEW',
    assigned_to: 'Joint Director (Research), HRS Guindy',
    suggested_verification: 'Falling Weight Deflectometer (FWD) survey to measure pavement structural rebound.',
    recommended_action: 'Invoke Defect Liability Clause 39; require contractor to mill and replace 50mm BC wearing course at their own cost.',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({ chainage_start: 12.0, chainage_end: 18.0, inspection_reports: ['IR-CUD-101', 'IR-CUD-104', 'IR-CUD-109'] }),
    created_at: '2026-11-06T11:30:00Z'
  },
  {
    ...BASE_META,
    id: 16,
    finding_code: 'ANM-2026-016',
    project_id: 10,
    package_id: 17,
    contractor_id: 10,
    category: 'Missing Supporting Documents',
    title: 'Sub-base Gravel Compaction Laboratory Test Certificates Not Uploaded [DEMO]',
    description: 'Payment voucher TNV-RA-01 for ₹19.80 Cr cleared without mandatory Field Density Test (FDT) registers attached in document repository.',
    what_detected: '14,000 cum of gravel sub-base billed without corresponding sand replacement method field density test sheets.',
    why_flagged: 'Rule R-DOC-02: Quality certificates are mandatory pre-requisites for passing running account bills in accordance with TN Financial Code.',
    detection_rule: 'Flag if (BillPassed == True) AND (AttachedQualityCertificatesCount == 0).',
    calculation_formula: 'Amount Under Review = Value of uncertified sub-base layer = ₹0.95 Cr.',
    potential_exposure_cr: 0.95,
    transaction_value_cr: 19.80,
    verified_impact_cr: 0.0,
    amount_under_review_cr: 0.95,
    severity: 'MEDIUM',
    ai_confidence: 'MEDIUM',
    evidence_status: 'PARTIAL_TELEMETRY',
    responsible_department: 'Highways Accounts & Audit',
    responsible_officer: 'Er. K. Sivakumar, B.E. (DE Tirunelveli)',
    review_status: 'UNDER_REVIEW',
    assigned_to: 'Assistant Divisional Engineer (Highways), Tirunelveli',
    suggested_verification: 'Inspect divisional laboratory register and obtain signed test records from Assistant Engineer.',
    recommended_action: 'Direct Assistant Divisional Engineer to upload verified lab certificates within 5 working days.',
    escalated_to_secretary: false,
    evidence_records_json: JSON.stringify({ uncertified_quantity_cum: 14000, rate_per_cum_rs: 680 }),
    created_at: '2026-11-06T11:45:00Z'
  }
];

// -------------------------------------------------------------
// HELPER METHODS FOR REUSABLE DATA COMPUTATION
// -------------------------------------------------------------

export function getSyntheticKPIs() {
  const totalFindings = SYNTHETIC_ANOMALIES.length;
  const criticalFindings = SYNTHETIC_ANOMALIES.filter(a => a.severity === 'CRITICAL').length;
  const highRiskFindings = SYNTHETIC_ANOMALIES.filter(a => a.severity === 'HIGH').length;
  const potentialExposure = SYNTHETIC_ANOMALIES.reduce((sum, a) => sum + a.potential_exposure_cr, 0);
  const awaitingVerification = SYNTHETIC_ANOMALIES.filter(a => ['NEW', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED'].includes(a.review_status)).length;
  const actionsPending = SYNTHETIC_ANOMALIES.filter(a => ['ACTION_REQUIRED', 'VERIFIED'].includes(a.review_status)).length;

  return {
    total_findings: totalFindings,
    critical_findings: criticalFindings,
    high_risk_findings: highRiskFindings,
    potential_financial_exposure_cr: Number(potentialExposure.toFixed(2)),
    findings_awaiting_verification: awaitingVerification,
    corrective_actions_pending: actionsPending,
    data_mode: 'mock' as const,
    reporting_period: 'FY 2025-26 (Q3 Active Portfolio)',
    last_analysis_timestamp: '2026-11-06T12:00:00Z'
  };
}

export function getSyntheticCategorySummary() {
  const catMap: Record<string, { count: number; exposure: number; critical: number }> = {};

  SYNTHETIC_ANOMALIES.forEach(a => {
    if (!catMap[a.category]) {
      catMap[a.category] = { count: 0, exposure: 0, critical: 0 };
    }
    catMap[a.category].count += 1;
    catMap[a.category].exposure += a.potential_exposure_cr;
    if (a.severity === 'CRITICAL') catMap[a.category].critical += 1;
  });

  return Object.entries(catMap).map(([category, stats]) => ({
    category,
    count: stats.count,
    total_exposure_cr: Number(stats.exposure.toFixed(2)),
    critical_count: stats.critical
  })).sort((a, b) => b.total_exposure_cr - a.total_exposure_cr);
}

export function getSyntheticExposureAnalysis() {
  // By Project
  const projMap: Record<number, number> = {};
  SYNTHETIC_ANOMALIES.forEach(a => {
    projMap[a.project_id] = (projMap[a.project_id] || 0) + a.potential_exposure_cr;
  });
  const by_project = Object.entries(projMap).map(([pid, exp]) => {
    const proj = SYNTHETIC_PROJECTS.find(p => p.id === Number(pid));
    return {
      project_id: Number(pid),
      project_code: proj?.project_code || `PRJ-${pid}`,
      title: proj?.title.substring(0, 38) + '...' || `Project ${pid}`,
      exposure_cr: Number(exp.toFixed(2))
    };
  }).sort((a, b) => b.exposure_cr - a.exposure_cr);

  // By Contractor
  const contMap: Record<number, number> = {};
  SYNTHETIC_ANOMALIES.forEach(a => {
    if (a.contractor_id) {
      contMap[a.contractor_id] = (contMap[a.contractor_id] || 0) + a.potential_exposure_cr;
    }
  });
  const by_contractor = Object.entries(contMap).map(([cid, exp]) => {
    const cont = SYNTHETIC_CONTRACTORS.find(c => c.id === Number(cid));
    return {
      contractor_id: Number(cid),
      name: cont?.name.replace('M/s ', '').substring(0, 28) || `Contractor ${cid}`,
      exposure_cr: Number(exp.toFixed(2))
    };
  }).sort((a, b) => b.exposure_cr - a.exposure_cr);

  // By Programme
  const progMap: Record<string, number> = {};
  SYNTHETIC_ANOMALIES.forEach(a => {
    const proj = SYNTHETIC_PROJECTS.find(p => p.id === a.project_id);
    const prog = proj?.programme || 'OTHER';
    progMap[prog] = (progMap[prog] || 0) + a.potential_exposure_cr;
  });
  const by_programme = Object.entries(progMap).map(([programme, exposure_cr]) => ({
    programme,
    exposure_cr: Number(exposure_cr.toFixed(2))
  })).sort((a, b) => b.exposure_cr - a.exposure_cr);

  // Trend (synthetic historical monthly detections)
  const month_trend = [
    { month: 'Jun 2024', exposure_cr: 2.10, count: 2 },
    { month: 'Aug 2024', exposure_cr: 4.80, count: 3 },
    { month: 'Oct 2024', exposure_cr: 7.20, count: 4 },
    { month: 'Dec 2024', exposure_cr: 18.50, count: 3 },
    { month: 'Feb 2025', exposure_cr: 8.60, count: 2 },
    { month: 'Nov 2026', exposure_cr: 12.80, count: 2 }
  ];

  const totalExposure = SYNTHETIC_ANOMALIES.reduce((sum, a) => sum + a.potential_exposure_cr, 0);
  const totalTxn = SYNTHETIC_ANOMALIES.reduce((sum, a) => sum + a.transaction_value_cr, 0);
  const totalVerified = SYNTHETIC_ANOMALIES.reduce((sum, a) => sum + a.verified_impact_cr, 0);
  const totalUnderReview = SYNTHETIC_ANOMALIES.reduce((sum, a) => sum + a.amount_under_review_cr, 0);

  return {
    by_project,
    by_category: getSyntheticCategorySummary().map(c => ({ category: c.category, exposure_cr: c.total_exposure_cr })),
    by_contractor,
    by_programme,
    month_trend,
    total_transaction_value_cr: Number(totalTxn.toFixed(2)),
    total_potential_exposure_cr: Number(totalExposure.toFixed(2)),
    total_verified_impact_cr: Number(totalVerified.toFixed(2)),
    total_under_review_cr: Number(totalUnderReview.toFixed(2))
  };
}

export function getSyntheticProjectRiskMatrix() {
  return SYNTHETIC_PROJECTS.map(proj => {
    const anomalies = SYNTHETIC_ANOMALIES.filter(a => a.project_id === proj.id);
    const exposure = anomalies.reduce((sum, a) => sum + a.potential_exposure_cr, 0);
    const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
    
    // Deterministic synthetic scoring based on actual project attributes
    const financial_risk = Math.min(100, Math.round((exposure / 5) * 20 + (proj.financial_progress_pct > proj.physical_progress_pct ? 25 : 10)));
    const schedule_risk = Math.min(100, Math.round((100 - proj.physical_progress_pct) * 0.4 + (anomalies.some(a => a.category.includes('Extension')) ? 35 : 10)));
    const procurement_risk = anomalies.some(a => a.category.includes('Cost Variation') || a.category.includes('Duplicate')) ? 75 : 25;
    const quality_risk = SYNTHETIC_QUALITY_FINDINGS.some(q => q.project_id === proj.id && q.severity === 'CRITICAL') ? 85 : 30;
    const land_utility_risk = SYNTHETIC_DEPENDENCIES.some(d => d.project_id === proj.id && d.days_pending > 100) ? 90 : 20;
    const compliance_risk = criticalCount > 0 ? 80 : 35;

    const composite = Math.round((financial_risk * 0.3) + (schedule_risk * 0.2) + (procurement_risk * 0.15) + (quality_risk * 0.15) + (land_utility_risk * 0.1) + (compliance_risk * 0.1));

    return {
      project_id: proj.id,
      project_code: proj.project_code,
      project_title: proj.title,
      programme: proj.programme,
      financial_risk_score: financial_risk,
      schedule_risk_score: schedule_risk,
      procurement_risk_score: procurement_risk,
      quality_risk_score: quality_risk,
      land_utility_risk_score: land_utility_risk,
      compliance_risk_score: compliance_risk,
      overall_composite_risk: composite,
      active_anomalies_count: anomalies.length
    };
  }).sort((a, b) => b.overall_composite_risk - a.overall_composite_risk);
}

export function getSyntheticExecutiveAssessment() {
  const kpis = getSyntheticKPIs();
  return {
    summary_narrative:
      "AI analysis has scanned 30 active financial vouchers, 12 project schedules, and 20 contract packages across the demonstration dataset. Multiple execution and financial anomalies were detected, concentrated in duplicate billing indicators, unamortized mobilization advances, unsanctioned non-BOQ rate variations, and acute utility clearance lag.",
    overall_risk_assessment: "HIGH CONCERN (Action Recommended Prior to Q4 Financial Closures)",
    critical_observations: [
      "Duplicate voucher submission #ECR-RA-03 for ₹21.00 Cr flagged across Chengalpattu and Kelambakkam sub-divisional entries.",
      "Contractor mobilization advance recovery lag of ₹2.20 Cr on Tambaram Grade Separator despite surpassing 30% physical milestone.",
      "Non-BOQ rock splitting rate variation order of ₹9.80 Cr on Ooty Ghat Corridor lacks Board of Engineers prior approval.",
      "Critical concrete test shortfall on Pier P-14 (31.8 MPa vs M-45) remains open on HRS Guindy registry despite milestone payment claim."
    ],
    financial_exposure_estimate_cr: kpis.potential_financial_exposure_cr,
    projects_requiring_immediate_attention: [
      { project_id: 1, code: 'PRJ-TN-2026-001', title: 'SH-49 East Coast Road Widening', issue: 'Duplicate billing voucher entry & refinery telemetry mismatch', exposure_cr: 19.65 },
      { project_id: 4, code: 'PRJ-TN-2026-004', title: 'SH-15 Ooty-Gudalur Ghat Corridor', issue: 'Unsanctioned non-BOQ rock excavation variation order', exposure_cr: 11.30 },
      { project_id: 2, code: 'PRJ-TN-2026-002', title: 'MDR-102 Tambaram Grade Separator', issue: 'Open critical concrete failure on Pier P-14 & advance recovery lag', exposure_cr: 8.40 }
    ],
    recommended_executive_actions: [
      { action: 'Freeze Treasury disbursement for Voucher #TXN-2025-004 and call for original MB Book 412.', authority: 'Finance Advisor & CAO', urgency: 'IMMEDIATE' },
      { action: 'Issue Stop-Work Notice on Pier P-14 until IIT Madras non-destructive structural test is certified.', authority: 'Chief Engineer (Highways - Projects)', urgency: 'CRITICAL' },
      { action: 'Convene Joint High-Level Taskforce with Revenue Secretary & TANGEDCO CMD on statutory clearance bottlenecks.', authority: 'Principal Secretary (Highways)', urgency: 'HIGH' },
      { action: 'Enforce automatic ₹3.50 Cr unamortized advance recovery on Madurai-Tuticorin expressway voucher.', authority: 'Superintending Engineer Madurai', urgency: 'ROUTINE' }
    ],
    observed_facts: [
      "2 identical bill numbers (#ECR-RA-03) generated within 12 days in two separate offices.",
      "1,810 MT of bitumen billed on SH-49 lacks matching electronic refinery gate passes.",
      "48 TANGEDCO poles have remained unshifted for 142 days despite 100% deposit payment.",
      "Pier P-14 28-day cube test achieved only 31.8 MPa against required M-45."
    ],
    calculated_indicators: [
      "Total potential financial exposure across 16 findings is ₹54.00 Cr.",
      "Verified financial impact already confirmed stands at ₹7.80 Cr.",
      "Amount under active administrative review is ₹46.20 Cr.",
      "Top 3 projects account for 72.8% of total portfolio anomaly value."
    ],
    ai_interpretations: [
      "The duplicate bill pattern strongly indicates an uncoordinated multi-office voucher upload or systemic registry lapse rather than deliberate double-payment, as the second voucher was halted before Treasury ECS release.",
      "Repeated time extensions on Tambaram without Liquidated Damages suggest informal risk absorption by the department due to unresolved utility conflicts.",
      "Variation order on Ooty ghat road appears to bypass the Standing Finance Committee threshold through piecemeal sub-divisional authorizations."
    ]
  };
}

export function getSyntheticDecisionsRequiringAttention() {
  return [
    {
      id: 1,
      finding_code: 'ANM-2026-001',
      project_id: 1,
      project_title: 'Widening of SH-49 (East Coast Road) km 22/0 to 45/0',
      issue: 'Potential duplicate RA bill voucher #ECR-RA-03 of ₹21.00 Cr submitted through two sub-divisions',
      impact: 'Risk of double disbursement of ₹18.20 Cr net payable from state highways fund',
      financial_exposure_cr: 18.20,
      responsible_department: 'Highways Accounts & Audit',
      current_status: 'UNDER_REVIEW',
      recommended_decision: 'Authorize formal vigilance audit of Kelambakkam sub-division MB Book 412 and freeze contractor IFHRMS vendor ledger.',
      escalation_level: 'MINISTER',
      due_date: '2026-11-20'
    },
    {
      id: 3,
      finding_code: 'ANM-2026-003',
      project_id: 4,
      project_title: 'Four Laning of SH-15 Ooty-Gudalur Ghat Corridor',
      issue: 'Non-BOQ hydraulic rock splitting variation claim of ₹9.80 Cr exceeds delegated divisional powers',
      impact: 'Unbudgeted cost overrun of 9.6% on foreign-assisted CKICP programme corridor',
      financial_exposure_cr: 9.80,
      responsible_department: 'Chief Engineer (Highways - Projects)',
      current_status: 'ACTION_REQUIRED',
      recommended_decision: 'Direct Superintending Engineer Coimbatore to apply PWD Schedule of Rates and refer to Standing Finance Committee.',
      escalation_level: 'SECRETARY',
      due_date: '2026-11-18'
    },
    {
      id: 8,
      finding_code: 'ANM-2026-008',
      project_id: 2,
      project_title: 'Construction of Tambaram Grade Separator on MDR-102',
      issue: 'Critical M-45 concrete strength failure (achieved 31.8 MPa) on Pier P-14 with open NCR',
      impact: 'Public safety hazard on high-traffic urban corridor; possible structural collapse under heavy vehicle loading',
      financial_exposure_cr: 1.80,
      responsible_department: 'Highways Research Station & Quality Control',
      current_status: 'ACTION_REQUIRED',
      recommended_decision: 'Order immediate halt to girder erection above Pier P-14 and direct IIT Madras retrofitting study.',
      escalation_level: 'MINISTER',
      due_date: '2026-11-19'
    },
    {
      id: 9,
      finding_code: 'ANM-2026-009',
      project_id: 8,
      project_title: 'Reconstruction of 6 Major Bridges along SH-115 Cheyyar-Vandavasi',
      issue: '130-day interdepartmental delay in Water Resources Department NOC for Cheyyar river bridge',
      impact: 'Contractor idle machinery claims of ₹1.10 Cr and monsoon cutoff risk for rural connectivity',
      financial_exposure_cr: 1.10,
      responsible_department: 'Water Resources Department (WRD)',
      current_status: 'UNDER_REVIEW',
      recommended_decision: 'Principal Secretary to issue Demi-Official communication to Water Resources Secretary for expedited HFL clearance.',
      escalation_level: 'SECRETARY',
      due_date: '2026-11-21'
    }
  ];
}

