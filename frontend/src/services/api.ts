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
  ExecutiveFilters,
  MinisterOverview,
  SecretaryOverview,
  VerifiedOrganisationStructure,
  GovernmentDocumentItem,
  CommitteeMeetingItem,
  CommitteeDecisionItem,
  StatutoryCommitteeDetailItem,
  StatutoryReferralItem,
  AIIntelligenceFindingItem,
  ProgrammeItem,
  CorridorAlignmentItem,
  TenderItem,
  LandParcelItem,
  LegalCaseItem,
  ProgrammeOverviewKPIs,
  Project360Detail,
  ProjectMilestoneItem,
  ProjectRiskItem,
  ProjectProgressRecordItem,
  EVMVarianceMetrics,
  WorkPackageItem,
  ApprovalItem,
  ProjectStakeholderItem
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
// Demo Mode Detection (true when backend unreachable → GitHub Pages)
// -------------------------------------------------------------
export let isDemoMode: boolean = false;
export function setDemoMode(val: boolean) { isDemoMode = val; }

// -------------------------------------------------------------
// Fallback Data Store (for Static Deployments on GitHub Pages)
// -------------------------------------------------------------
const fallbackUsers: Record<string, UserInfo> = {
  admin: {
    id: 1,
    username: 'admin',
    full_name: 'State System Administrator',
    role_code: 'ADMIN',
    role_name: 'System Administrator (Statewide)',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  chief_eng: {
    id: 2,
    username: 'chief_eng',
    full_name: 'Er. S. Palanivel (Chief Engineer (H), C&M Chennai Region)',
    role_code: 'CHIEF_ENG',
    role_name: 'Chief Engineer (Highways - C&M Chennai)',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  se_chengalpattu: {
    id: 3,
    username: 'se_chengalpattu',
    full_name: 'Er. M. Rajendran (Superintending Engineer (H), Chengalpattu Circle)',
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
    full_name: 'Er. P. Anandhan (Divisional Engineer (H), Tambaram Division)',
    role_code: 'EE_DIV',
    role_name: 'Divisional Engineer (H) (Tambaram Division)',
    department_name: 'Tamil Nadu Highways Department',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    is_active: true
  },
  contractor_lt: {
    id: 5,
    username: 'contractor_lt',
    full_name: 'V. Ramakrishnan (Project Director, L&T)',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 1,
    is_active: true
  },
  contractor_pst: {
    id: 6,
    username: 'contractor_pst',
    full_name: 'T. Shanmugam (Managing Director, PST)',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 2,
    is_active: true
  },
  minister: {
    id: 7,
    username: 'minister',
    full_name: "Thiru E.V. Velu, Minister for Public Works, Highways & Minor Ports",
    role_code: 'MINISTER',
    role_name: "Minister for Public Works, Highways and Minor Ports",
    department_name: 'Highways and Minor Ports Department',
    is_active: true
  },
  secretary: {
    id: 8,
    username: 'secretary',
    full_name: 'Thiru Pradeep Yadav, IAS, Additional Chief Secretary to Government',
    role_code: 'PRIN_SEC',
    role_name: 'Principal Secretary to Government (Highways & Minor Ports)',
    department_name: 'Highways and Minor Ports Department',
    is_active: true
  }
};

const fallbackOrganisationStructure: VerifiedOrganisationStructure = {
  minister: {
    name: "Thiru E.V. Velu",
    designation: "Minister for Public Works, Highways and Minor Ports",
    portfolio: "Highways and Minor Ports Department, Public Works",
    office: "Office of the Minister, Secretariat, Fort St. George, Chennai - 600 009",
    verification_status: "VERIFIED OFFICIAL",
    source: "Cabinet Gazette / Tamil Nadu Government Directory"
  },
  principal_secretary: {
    name: "Thiru Pradeep Yadav, IAS",
    designation: "Additional Chief Secretary / Principal Secretary to Government",
    department: "Highways and Minor Ports Department",
    email: "hwaysec@tn.gov.in",
    phone: "044-25670959",
    office: "Secretariat, Fort St. George, Chennai - 600 009",
    verification_status: "VERIFIED OFFICIAL",
    source: "Public (Special.A) Dept / TN Portal Directory"
  },
  heads_of_department: [
    {
      id: 1,
      name: "Er. R. Selvadurai",
      designation: "Director General (H)",
      wing: "Directorate of Highways, Guindy, Chennai",
      phone: "044-22351099",
      email: "dgchn.hd@tn.gov.in",
      office_address: "Integrated Chief Engineers Complex, HRS Campus, Sardar Patel Road, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 1,
          designation_title: "Director General (H), Highways Department",
          posting_unit: "Apex Directorate, Guindy",
          posting_type: "REGULAR",
          from_date: "2024-05-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O. (Rt) No. 45, Highways & Minor Ports"
        }
      ]
    },
    {
      id: 2,
      name: "Thiru D. Baskara Pandian, IAS",
      designation: "Project Director (A/C TNRSP, FAC CKICP)",
      wing: "TNRSP-II World Bank Project / CKICP Directorate",
      phone: "044-24954360",
      email: "pd.tnrsp@gov.in",
      office_address: "CKICP Complex, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "ADDITIONAL_CHARGE",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 2,
          designation_title: "Project Director (A/C), TNRSP-II",
          posting_unit: "TNRSP-II Directorate",
          posting_type: "ADDITIONAL_CHARGE",
          from_date: "2024-08-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O. (Rt) No. 132, Public (Special.A)"
        },
        {
          id: 3,
          designation_title: "Project Director (FAC), CKICP",
          posting_unit: "CKICP Directorate",
          posting_type: "FULL_ADDITIONAL_CHARGE",
          from_date: "2024-10-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O. (Rt) No. 165, Public (Special.A)"
        }
      ]
    },
    {
      id: 3,
      name: "Er. S. Palanivel",
      designation: "Chief Engineer (H), C&M (Chennai Region)",
      wing: "Construction & Maintenance (Chennai Region)",
      phone: "044-22350690",
      email: "cengrcmchn.hd@tn.gov.in",
      office_address: "Kalaignar Centenary Building, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 4,
          designation_title: "Chief Engineer (H), Construction and Maintenance (Chennai Region)",
          posting_unit: "C&M Chennai Region",
          posting_type: "REGULAR",
          from_date: "2024-07-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 112, Highways"
        },
        {
          id: 5,
          designation_title: "Chief Engineer (H) (A/C), Construction and Maintenance (Coimbatore Region)",
          posting_unit: "C&M Coimbatore Region",
          posting_type: "ADDITIONAL_CHARGE",
          from_date: "2025-01-15T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 18, Highways"
        }
      ]
    },
    {
      id: 4,
      name: "Er. S. Jawahar Muthuraj",
      designation: "Chief Engineer (H), C&M (Trichy Region)",
      wing: "Construction & Maintenance (Trichy Region)",
      phone: "0431-2420455",
      email: "cehcandmtrichy@gmail.com",
      office_address: "T.V.S. Toll Gate, Tiruchirappalli - 620 020",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 6,
          designation_title: "Chief Engineer (H), C&M (Trichy Region)",
          posting_unit: "Trichy Region Office",
          posting_type: "REGULAR",
          from_date: "2024-06-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 98, Highways"
        }
      ]
    },
    {
      id: 5,
      name: "Er. Ramesh",
      designation: "Chief Engineer (H), C&M (Madurai Region)",
      wing: "Construction & Maintenance (Madurai Region)",
      phone: "0452-2531234",
      email: "cecandmmduregion1@gmail.com",
      office_address: "Alagar Kovil Road, near Thamarai Thotti, Madurai - 625 002",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 7,
          designation_title: "Chief Engineer (H), C&M (Madurai Region)",
          posting_unit: "Madurai Region Office",
          posting_type: "REGULAR",
          from_date: "2024-09-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 142, Highways"
        }
      ]
    },
    {
      id: 6,
      name: "Er. K. Vanathi",
      designation: "Chief Engineer (H), National Highways",
      wing: "National Highways Wing (MoRTH Entrusted Works)",
      phone: "044-22355701",
      email: "cenhchn.hd@tn.gov.in",
      office_address: "Integrated Chief Engineers Complex, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 8,
          designation_title: "Chief Engineer (H), National Highways Wing",
          posting_unit: "NH Wing, Guindy",
          posting_type: "REGULAR",
          from_date: "2024-04-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 67, Highways"
        }
      ]
    },
    {
      id: 7,
      name: "Er. S. Yamini",
      designation: "Chief Engineer (H), Planning Designs & Investigation",
      wing: "Planning Designs and Investigation (PDI) Wing",
      phone: "044-22352068",
      email: "cengr.pdi@tn.gov.in",
      office_address: "Integrated Chief Engineers Complex, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 9,
          designation_title: "Chief Engineer (H), Planning Designs & Investigation",
          posting_unit: "PDI Wing, Guindy",
          posting_type: "REGULAR",
          from_date: "2024-05-15T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 81, Highways"
        },
        {
          id: 10,
          designation_title: "Chief Engineer (H) (A/C), TNRSP-II",
          posting_unit: "TNRSP-II Directorate",
          posting_type: "ADDITIONAL_CHARGE",
          from_date: "2024-11-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 177, Highways"
        }
      ]
    },
    {
      id: 8,
      name: "Er. A. Venkatachalam",
      designation: "Director (H), Highways Research Station",
      wing: "Highways Research Station (HRS Guindy)",
      phone: "044-22354851",
      email: "dirhrschn.hd@tn.gov.in",
      office_address: "HRS Campus, 76 Sardar Patel Road, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 11,
          designation_title: "Director (H), Highways Research Station",
          posting_unit: "HRS Guindy",
          posting_type: "REGULAR",
          from_date: "2024-02-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 34, Highways"
        }
      ]
    },
    {
      id: 9,
      name: "Er. R. Vimala",
      designation: "Chief Engineer (H) (A/C), CKICP",
      wing: "Chennai-Kanyakumari Industrial Corridor Project",
      phone: "044-22350664",
      email: "prjdir.ckicp@tn.gov.in",
      office_address: "CKICP Complex, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "ADDITIONAL_CHARGE",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 12,
          designation_title: "Chief Engineer (H) (A/C), CKICP",
          posting_unit: "CKICP Directorate",
          posting_type: "ADDITIONAL_CHARGE",
          from_date: "2024-10-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 165, Highways"
        }
      ]
    },
    {
      id: 10,
      name: "Er. D. Jebaselwin Gladson",
      designation: "Member Technical, TANSHA",
      wing: "Tamil Nadu State Highways Authority (TANSHA)",
      phone: "044-22350022",
      email: "mttansha2.hd@tn.gov.in",
      office_address: "Ground Floor, Kalaignar Centenary Building, HRS Campus, Guindy, Chennai - 600 025",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 13,
          designation_title: "Member Technical, TANSHA",
          posting_unit: "TANSHA Headquarters",
          posting_type: "REGULAR",
          from_date: "2024-08-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 129, Highways"
        }
      ]
    },
    {
      id: 11,
      name: "Er. M. Rajendran",
      designation: "Superintending Engineer (H), Chengalpattu Circle",
      wing: "Chengalpattu Circle (C&M)",
      phone: "044-27426222",
      email: "sechengalpattu.hd@tn.gov.in",
      office_address: "Chengalpattu Circle Office, GST Road, Chengalpattu",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 14,
          designation_title: "Superintending Engineer (H), Chengalpattu Circle",
          posting_unit: "Chengalpattu Circle Office",
          posting_type: "REGULAR",
          from_date: "2024-06-15T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 102, Highways"
        }
      ]
    },
    {
      id: 12,
      name: "Er. P. Anandhan",
      designation: "Divisional Engineer (H), Tambaram Division",
      wing: "Tambaram Division (C&M)",
      phone: "044-22265111",
      email: "detambaram.hd@tn.gov.in",
      office_address: "Tambaram Division Office, GST Road, Tambaram, Chennai - 600 045",
      charge_status: "REGULAR",
      verification_status: "VERIFIED OFFICIAL",
      tenures: [
        {
          id: 15,
          designation_title: "Divisional Engineer (H), Tambaram Division (C&M)",
          posting_unit: "Tambaram Division Office",
          posting_type: "REGULAR",
          from_date: "2023-11-01T00:00:00Z",
          is_current: true,
          transfer_go_reference: "G.O.(Rt) No. 201, Highways, dated 28.10.2023"
        }
      ]
    }
  ],
  statutory_committees: [
    {
      id: 1,
      code: "BOE",
      name: "Board of Engineers (BOE)",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Highest Technical Authority deciding standard specifications, manual revisions, and technical policies.",
      constitution_go: "G.O. Ms. No. 359 (12.08.1997) & G.O. Ms. No. 1 (07.01.2011)"
    },
    {
      id: 2,
      code: "TAC",
      name: "Technical Audit Committee (TAC)",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Mandatory technical audit for bridge works with linear waterway > 150m and complex bypasses before according Technical Sanction.",
      constitution_go: "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009"
    },
    {
      id: 3,
      code: "RASC",
      name: "Revised Administrative Sanction Committee (RASC)",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Processing and recommendation of work proposals requiring Revised Administrative Sanction (RAS).",
      constitution_go: "G.O. Ms. No. 289 (04.12.2008) & G.O. Ms. No. 1 (07.01.2011)"
    },
    {
      id: 4,
      code: "RASC_LA",
      name: "Revised Administrative Sanction Committee for Land Acquisition",
      chairperson_title: "Commissioner of Land Acquisition",
      mandate_summary: "Scrutiny and processing of revised land acquisition financial estimates and enhanced solatium proposals.",
      constitution_go: "G.O. Ms. No. 163, Highways and Minor Ports (HN1), dated 13.12.2023"
    },
    {
      id: 5,
      code: "COT",
      name: "Commissionerate of Tenders (COT)",
      chairperson_title: "Secretary to Government, Finance / Director General (H)",
      mandate_summary: "Statutory scrutiny of tenders with excess above 10% (up to 50L), above 6% (up to 1Cr), all works > 6Cr, and packages > 7.50Cr.",
      constitution_go: "G.O. Ms. No. 75 (02.09.2026) & G.O. Ms. No. 29 (03.03.2022)"
    },
    {
      id: 6,
      code: "SSR",
      name: "Standard Schedule of Rates (SSR) Committee",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Annual compilation and notification of standardized departmental rate schedule for labor, materials, and machinery.",
      constitution_go: "G.O. Ms. No. 21 (25.01.1999) & G.O. Ms. No. 1 (07.01.2011)"
    },
    {
      id: 7,
      code: "HLDRC",
      name: "High Level Dispute Resolution Committee (HLDRC)",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Amicable settlement and speedy disposal of contractual disputes, claims, and arbitration matters.",
      constitution_go: "G.O. Ms. No. 17 (06.03.2023) & G.O. Ms. No. 87 (21.07.2023)"
    },
    {
      id: 8,
      code: "EXPERT_16B",
      name: "Three Member Expert Committee (Section 16(b) TNTIT Act)",
      chairperson_title: "Joint Director, Office of the Director General (H)",
      mandate_summary: "Evaluation and approval for entrustment of additional quantities exceeding 25% of agreement quantities to original contractor.",
      constitution_go: "G.O. Ms. No. 05, Highways and Minor Ports (HN2), dated 13.01.2026"
    },
    {
      id: 9,
      code: "TNRIDC_BOARD",
      name: "TNRIDC - Board of Directors",
      chairperson_title: "Principal Secretary to Government, Highways and Minor Ports Department",
      mandate_summary: "Supreme corporate governance, capital investments, policy approvals, and project financing for industrial corridors, ring roads, and port connectivity infrastructure.",
      constitution_go: "G.O. Ms. No. 162, Highways (HN2) Dept, dated 24.06.2005"
    },
    {
      id: 10,
      code: "TNRIDC_AUDIT",
      name: "TNRIDC Audit Committee",
      chairperson_title: "Deputy Secretary to Government, Finance Department",
      mandate_summary: "Statutory financial scrutiny, internal audit reviews, vigilance compliance, and corporate risk governance under Section 177 of Companies Act, 2013.",
      constitution_go: "Companies Act, 2013 / TNRIDC Board Resolution No. 4"
    },
    {
      id: 11,
      code: "TNRIDC_TECH",
      name: "TNRIDC Technical Sanction Committee",
      chairperson_title: "Director General (H), Highways Department",
      mandate_summary: "Specialized technical scrutiny, detailed project report clearance, and structural sanction for high-speed expressways and major ring roads executed through TNRIDC.",
      constitution_go: "TNRIDC Board Resolution No. 12 / G.O. Ms. No. 162"
    }
  ],
  delegations_of_authority: [
    {
      id: 1,
      designation_code: "COT",
      power_type: "TENDER_ACCEPTANCE",
      monetary_limit_cr: 9999.0,
      tender_excess_pct_limit: 0.0,
      statutory_rule_reference: "G.O. Ms. No. 75 dated 02.09.2026",
      remarks: "Individual works > Rs 6.00 Cr and Package works > Rs 7.50 Cr irrespective of tender excess"
    },
    {
      id: 2,
      designation_code: "CHIEF_ENG",
      power_type: "TECHNICAL_SANCTION",
      monetary_limit_cr: 25.0,
      tender_excess_pct_limit: 0.0,
      statutory_rule_reference: "G.O. Ms. No. 172 dated 03.11.2025",
      remarks: "Full powers within sanctioned scheme for road/bridge estimates up to Rs 25.00 Cr"
    },
    {
      id: 3,
      designation_code: "SUP_ENG",
      power_type: "TECHNICAL_SANCTION",
      monetary_limit_cr: 5.0,
      tender_excess_pct_limit: 0.0,
      statutory_rule_reference: "Tamil Nadu Highways Manual Vol II",
      remarks: "Circle jurisdiction estimates up to Rs 5.00 Cr"
    },
    {
      id: 4,
      designation_code: "DIV_ENG",
      power_type: "TENDER_ACCEPTANCE",
      monetary_limit_cr: 0.50,
      tender_excess_pct_limit: 5.0,
      statutory_rule_reference: "Tamil Nadu Highways Manual Vol II / G.O. Ms. 29",
      remarks: "Divisional Engineer (H) approval for maintenance and minor works up to Rs 50 Lakhs"
    }
  ],
  functional_permission_groups: [
    { code: "FIN_ACCOUNTS", name: "Finance & Accounts", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "IFMS Letter of Credit (LC) balances, contractor invoice reconciliation, and bill scrutiny." },
    { code: "BUDGET_IFMS", name: "Budget & Fiscal Control", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "State budget allocation tracking across CMRDP, CRIDP, NABARD, and external aid schemes." },
    { code: "PROCUREMENT_COT", name: "Procurement & Tendering", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "TNTIT Act 1998 compliance, Commissionerate of Tenders (COT) processing, and e-tender processing." },
    { code: "QUALITY_HRS", name: "Quality Control & Forensics", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Highways Research Station (HRS) cube, core, penetration, and Benkelman beam test scrutiny." },
    { code: "PLANNING_PDI", name: "Planning & Investigation", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Detailed Project Report (DPR) preparation, alignment survey, and preliminary estimate scrutiny." },
    { code: "LAND_ACQUISITION", name: "Land Acquisition Coordination", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "TN Highways Act 2001 Section 15(2), 15(1), and 19(1) gazette tracking and solatium disbursement." },
    { code: "ADMIN_ESTABLISHMENT", name: "Administration & Establishment", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Postings, tenures, service book records under TN-HES rules, and ministerial office staff management." },
    { code: "LEGAL_COMPLIANCE", name: "Legal & Court Litigation", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "High Court writ petition counters, arbitration defense under HLDRC, and interim stay management." },
    { code: "INTERNAL_AUDIT", name: "Internal Audit & AG Paras", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Accountant General (Audit II) draft para replies, Action Taken Reports (ATR), and recovery tracking." },
    { code: "PROJECT_MONITORING", name: "Project Monitoring & Milestones", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Schedule tracking, critical path variance, and time-extension recommendation review." },
    { code: "MAINTENANCE_OPS", name: "Maintenance & Gang Operations", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Periodic surface renewal, pothole elimination drive, culvert desilting, and disaster clearance." },
    { code: "FIELD_INSPECTION", name: "Field Inspection & Measurement", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "Check measurement verification, daily road register logs, and site inspection memos." },
    { code: "SAFETY_COMPLIANCE", name: "Road Safety & Blackspot Remediation", nature: "Functional Permission Group", is_statutory_cadre: false, mandate: "IRC safety audit compliance, crash barrier installation, and fatal accident spot engineering fixes." }
  ],
  external_stakeholders: [
    { department: "Revenue and Disaster Management", spoc: "Special District Revenue Officer (LA) / RDO", portfolio: "Land Acquisition under TN Highways Act 2001", clearance: "Section 15(2) Notice, Sec 15(1) Gazette, Sec 19(1) Award", status: "VERIFIED OFFICIAL" },
    { department: "Electricity & TANGEDCO/TNPDCL", spoc: "Superintending Engineer (Distribution Circle)", portfolio: "Utility Shifting & Power Disconnection", clearance: "HT tower relocation (110kV/33kV), LT pole shift", status: "VERIFIED OFFICIAL" },
    { department: "Environment, Climate Change & Forests", spoc: "District Forest Officer (DFO) / PCCF", portfolio: "Statutory Forest Clearance & Tree Felling", clearance: "Forest Conservation Act (FCA) Stage I & II Clearance", status: "VERIFIED OFFICIAL" },
    { department: "TWAD Board / CMWSSB", spoc: "Executive Engineer (Maintenance Division)", portfolio: "Bulk Water Mains Shifting", clearance: "Feeder water main diversion along Right-of-Way (ROW)", status: "VERIFIED OFFICIAL" },
    { department: "Southern Railway (Zone 7)", spoc: "Chief Bridge Engineer (CBE) / Dy. CE (Bridges)", portfolio: "Railway Over Bridge (ROB) / RUB Track Spans", clearance: "General Arrangement Drawing (GAD) & CRS Safety Sanction", status: "VERIFIED OFFICIAL" },
    { department: "Corporations & Municipalities (GCC)", spoc: "City Engineer / Superintending Engineer (Projects)", portfolio: "Urban Right-of-Way & Storm Water Drains", clearance: "Traffic diversion NOC & SWD culvert integration", status: "VERIFIED OFFICIAL" }
  ],
  zones_hierarchy: [
    { name: "Chennai Zone", hq: "Chennai (HRS Campus, Guindy)", chief_engineer: "Er. S. Palanivel", circles: ["Chennai Circle", "Chengalpattu Circle", "Tiruvallur Circle"], divisions_count: 8, jurisdiction: "Northern Coastal & Metro Corridors" },
    { name: "Coimbatore Zone", hq: "Coimbatore (Mettupalayam Road)", chief_engineer: "Er. S. Palanivel (A/C)", circles: ["Coimbatore Circle", "Salem Circle", "Tiruppur Circle"], divisions_count: 7, jurisdiction: "Western Industrial & Hill Corridors (Nilgiris)" },
    { name: "Madurai Zone", hq: "Madurai (Alagar Kovil Road)", chief_engineer: "Er. Ramesh", circles: ["Madurai Circle", "Tirunelveli Circle", "Ramanathapuram Circle"], divisions_count: 9, jurisdiction: "Southern Corridors & Port Connectivity" },
    { name: "Tiruchirappalli Zone", hq: "Trichy (T.V.S. Toll Gate)", chief_engineer: "Er. S. Jawahar Muthuraj", circles: ["Trichy Circle", "Thanjavur Circle", "Villupuram Circle"], divisions_count: 8, jurisdiction: "Central Delta & Agro-Corridors" }
  ],
  verification_metadata: {
    rules_citation: "Tamil Nadu Highways Engineering Service (TN-HES) Rules, G.O.Ms.No.172 dated 03.11.2025; G.O.Ms.No.43",
    statutory_delegation_citation: "G.O. Ms. No. 75 & G.O. Ms. No. 163 (Financial Powers for Technical Sanction & Tender Acceptance)",
    verification_date: "2026-11-06",
    cadre_rule: "Engineering cadre uses Divisional Engineer (H) [DE], Assistant Divisional Engineer (H) [ADE], Assistant Engineer (H) [AE], Junior Engineer (H) [JE]."
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
    responsible_highways_officer: 'Er. S. Palanivel (Chief Engineer (H), C&M Chennai Region)',
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

const fallbackMinisterOverview: MinisterOverview = {
  strategic_kpis: {
    total_capital_outlay_cr: 1845.50,
    major_corridors_count: 6,
    statewide_completion_rate: 68.4,
    critical_public_delays_count: 3,
    inter_ministerial_blockers_count: 4,
    land_acquisition_cleared_pct: 74.2,
    zero_pothole_compliance_pct: 92.5,
    public_grievances_resolved: 142
  },
  ai_briefing: {
    headline: "Cabinet Strategic Briefing: Statewide Highway Delivery & Public Impact",
    summary: "Statewide highway capital program is executing ₹1,845.50 Cr across priority connectivity corridors. 3 mega-projects are nearing readiness for public inauguration. Two inter-ministerial roadblocks require your direct cabinet-level bilateral engagement to clear pending ROWs.",
    urgent_interventions: [
      {
        title: "Forest Clearance for Tambaram Eastern Bypass Corridor (SH-49 Link)",
        dept: "Department of Forests",
        action: "Convene Bilateral Inter-Ministerial Meeting with Hon'ble Minister for Forests",
        days_pending: 115,
        impact: "Public commissioning of 8.2 km bypass corridor delayed by 4 months, impacting 45,000 daily commuters."
      },
      {
        title: "110kV HT Power Line Shifting at Perungalathur Junction (GST Road)",
        dept: "TANGEDCO / Energy Dept",
        action: "Table Joint Fast-Track Clearance Memorandum at Cabinet Infrastructure Committee",
        days_pending: 85,
        impact: "Severe bottleneck on NH-45 arterial corridor connecting Southern Tamil Nadu."
      }
    ],
    district_sentiment: "High positive public feedback on East Coast Road 4-laning progress. Urgent demand for early opening of Tambaram Eastern Bypass to decongest South Chennai."
  },
  district_impact: [
    { district: "Chennai", active_projects: 5, outlay_cr: 420.5, completion_pct: 78.2, status: "ON_TRACK" },
    { district: "Chengalpattu", active_projects: 4, outlay_cr: 310.2, completion_pct: 52.0, status: "REQUIRES_INTERVENTION" },
    { district: "Coimbatore", active_projects: 6, outlay_cr: 485.0, completion_pct: 71.5, status: "ON_TRACK" },
    { district: "Madurai", active_projects: 4, outlay_cr: 290.0, completion_pct: 65.0, status: "ATTENTION_NEEDED" },
    { district: "Tiruchirappalli", active_projects: 5, outlay_cr: 339.8, completion_pct: 69.2, status: "ON_TRACK" },
  ],
  cabinet_decisions_pending: [
    {
      ref: "MIN-DIR-001",
      subject: "Bilateral Inter-Ministerial Review: DFO Tambaram Forest Land Clearance",
      due_date: "2026-11-15",
      urgency: "HIGH"
    },
    {
      ref: "MIN-DIR-002",
      subject: "Cabinet Memorandum: Enhanced Solatium Approval for Section 15(2) Land Owners",
      due_date: "2026-11-20",
      urgency: "HIGH"
    }
  ],
  data_freshness: "Updated: Today, 08:30 IST",
  reporting_period: "FY 2025-26 Q4"
};

const fallbackKPIs: ExecutiveKPIs = {
  total_active_projects: 24,
  total_approved_project_value_cr: 1845.50,
  total_expenditure_cr: 824.20,
  total_physical_progress_pct: 68.4,
  projects_delayed: 7,
  projects_high_risk: 3,
  pending_approvals: 14,
  pending_land_acquisition_ha: 42.50,
  pending_utility_shifting_count: 28,
  open_quality_defects: 12,
  pending_contractor_obligations: 9,
  open_legal_cases: 6,
  unresolved_audit_observations: 18,
  potential_financial_exposure_cr: 42.80,
  verified_financial_recovery_cr: 8.45,
  verified_prevented_expenditure_cr: 14.20,
  reporting_period: 'FY 2025-26 Q4',
  data_freshness: 'Updated: Today, 08:30 IST',
  cohort_sample_size: 24,
  is_demo: true
};

const fallbackSecretaryOverview: SecretaryOverview = {
  governance_kpis: fallbackKPIs,
  ai_briefing: {
    headline: "Departmental Governance & Disciplinary Oversight Briefing",
    summary: "Department expenditure stands at ₹824.20 Cr with 68.4% physical completion. Chengalpattu Circle exhibits significant delay in administrative compliance. Quality audits by HRS Guindy detected 2 batch failures in M35 concrete requiring immediate structural remediation.",
    accountability_alerts: [
      {
        officer: "Er. M. Rajasekaran, M.E. (SE Chengalpattu Circle)",
        issue: "45-day delay in submitting Section 15(2) compensation records to Special DRO (LA)",
        pending_days: 45,
        action: "Issue Call for Explanation under Rule 17(a) of TN Civil Services (CCA) Rules"
      },
      {
        officer: "Er. P. Anandhan, B.E. (EE Tambaram Division)",
        issue: "Overdue technical sanction for utility line diversion estimates",
        pending_days: 32,
        action: "Direct mandatory 7-day disposal with compliance report to Chief Engineer"
      }
    ],
    financial_controls: "IFMS Letter of Credit (LC) balances reconciled for FY 2025-26. Verified recovery of ₹8.45 Cr initiated against duplicate measurement entries. ₹14.20 Cr expenditure prevented via pre-audit verification."
  },
  zone_performance: fallbackZones,
  secretarial_actions_pending: [
    {
      ref: "SEC-DIR-001",
      subject: "Freeze LC release on Package 2 pending Director HRS concrete core test report",
      due_date: "2026-11-12",
      urgency: "CRITICAL"
    },
    {
      ref: "SEC-DIR-002",
      subject: "Submit Action Taken Report (ATR) to Accountant General on Bitumen Measurement Audit Para",
      due_date: "2026-11-18",
      urgency: "HIGH"
    }
  ],
  data_freshness: "Updated: Today, 08:30 IST",
  reporting_period: "FY 2025-26 Q4"
};

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

// -------------------------------------------------------------
// Fallback Project 360° Intelligence Generator
// -------------------------------------------------------------
function fallbackProject360(id: number): Project360Detail {
  const p = fallbackProjects.find(item => item.id === id) || fallbackProjects[0];
  const isECR = p.id === 1;
  const isTambaram = p.id === 2;

  const plannedPhys = isECR ? 65.0 : isTambaram ? 45.0 : 92.0;
  const actualPhys = p.physical_progress_pct;
  const actualCost = p.expenditure_to_date_cr;
  const sanctioned = p.sanctioned_cost_cr;

  const ev = (sanctioned * (actualPhys / 100.0));
  const pv = (sanctioned * (plannedPhys / 100.0));
  const cv = ev - actualCost;
  const sv = ev - pv;
  const cpi = actualCost > 0 ? ev / actualCost : 1.0;
  const spi = pv > 0 ? ev / pv : 1.0;
  const delayDays = isECR ? 65 : isTambaram ? 90 : 0;

  return {
    project: p,
    id: p.id,
    project_code: p.project_code,
    title: p.title,
    description: p.description,
    status: p.status,
    priority: p.priority,
    verification_status: "Verified against G.O. and Department Records",
    jurisdiction_hierarchy: {
      zone_name: p.zone_id === 1 ? "Chennai Zone" : "Statewide Highways Zone",
      circle_name: p.circle_id === 1 ? "Chengalpattu Circle" : "Circle Office",
      division_name: p.division_id === 1 ? "Chengalpattu Division" : "Division Office",
      district: isECR || isTambaram ? "Chengalpattu" : "Kanchipuram"
    },
    technical_specs: {
      road_name: p.road_name || "Highways Strategic Corridor",
      road_code: isECR ? "SH-49" : isTambaram ? "MDR-102" : "ODR-045",
      road_type: p.road_type,
      carriageway_width_m: isECR ? 14.0 : isTambaram ? 15.5 : 7.0,
      lane_configuration: isECR ? "4-Lane with Paved Shoulder" : isTambaram ? "4-Lane Elevated Flyover + Service Roads" : "2-Lane High Level Bridge",
      pavement_type: isECR ? "Flexible (Bituminous Concrete / DBM)" : "Rigid Deck & Flexible Approaches",
      total_length_km: isECR ? 23.0 : isTambaram ? 4.8 : 0.65,
      start_chainage_km: isECR ? 22.0 : isTambaram ? 0.0 : 4.5,
      end_chainage_km: isECR ? 45.0 : isTambaram ? 4.8 : 5.15,
      terrain: "Plain / Coastal Corridor",
      funding_programme: isECR ? "Chief Minister Road Development Programme (CMRDP)" : "State Road Fund (CRIDP)"
    },
    sanctions: [
      {
        id: 101,
        project_id: p.id,
        approval_type: "ADMINISTRATIVE_SANCTION",
        reference_number: isECR ? "G.O.(Ms) No.84, Highways (HN2) Dept" : "G.O.(Ms) No.112, Highways (HW1) Dept",
        sanction_amount_cr: p.sanctioned_cost_cr,
        approved_by_role: "Government of Tamil Nadu (Secretariat)",
        status: "APPROVED",
        approval_date: "2024-07-14T00:00:00Z"
      },
      {
        id: 102,
        project_id: p.id,
        approval_type: "TECHNICAL_SANCTION",
        reference_number: isECR ? "TS-CHE-09/2024-25" : "TS-CHE-15/2024-25",
        sanction_amount_cr: p.sanctioned_cost_cr - 2.5,
        approved_by_role: "Chief Engineer (Highways) C&M",
        status: "APPROVED",
        approval_date: "2024-08-20T00:00:00Z"
      }
    ],
    milestones: [
      {
        id: 201,
        project_id: p.id,
        milestone_code: "MS-01",
        title: "Site Handover, Utility Survey & Joint Boundary Fixation",
        description: "Demarcation of right of way (RoW) and initial utility joint survey with TANGEDCO/TWAD.",
        target_date: "2025-01-15T00:00:00Z",
        actual_date: "2025-01-20T00:00:00Z",
        target_physical_pct: 10.0,
        actual_physical_pct: 10.0,
        delay_days: 5,
        status: "COMPLETED",
        weightage_pct: 10.0
      },
      {
        id: 202,
        project_id: p.id,
        milestone_code: "MS-02",
        title: "Granular Sub-Base (GSB) & Drainage Culverts",
        description: "Completion of 15 cross-drainage culverts and GSB laying up to km 33/0.",
        target_date: "2025-05-30T00:00:00Z",
        actual_date: "2025-06-10T00:00:00Z",
        target_physical_pct: 35.0,
        actual_physical_pct: 35.0,
        delay_days: 11,
        status: "COMPLETED",
        weightage_pct: 25.0
      },
      {
        id: 203,
        project_id: p.id,
        milestone_code: "MS-03",
        title: "Dense Bituminous Macadam (DBM) Layer & Retaining Walls",
        description: "75mm DBM layer execution and coastal protection retaining structures.",
        target_date: "2025-09-30T00:00:00Z",
        actual_date: undefined,
        target_physical_pct: 65.0,
        actual_physical_pct: actualPhys,
        delay_days: delayDays,
        status: delayDays > 30 ? "DELAYED" : "IN_PROGRESS",
        weightage_pct: 35.0
      },
      {
        id: 204,
        project_id: p.id,
        milestone_code: "MS-04",
        title: "Bituminous Concrete (BC), Signages & Commissioning",
        description: "40mm BC wearing course, road markings, retro-reflective signages and street illumination.",
        target_date: "2026-03-31T00:00:00Z",
        actual_date: undefined,
        target_physical_pct: 100.0,
        actual_physical_pct: 0.0,
        delay_days: delayDays,
        status: "PENDING",
        weightage_pct: 30.0
      }
    ],
    execution_tracking: {
      planned_value_cr: Math.round(pv * 100) / 100,
      earned_value_cr: Math.round(ev * 100) / 100,
      actual_cost_cr: Math.round(actualCost * 100) / 100,
      cost_variance_cr: Math.round(cv * 100) / 100,
      schedule_variance_cr: Math.round(sv * 100) / 100,
      cost_performance_index: Math.round(cpi * 1000) / 1000,
      schedule_performance_index: Math.round(spi * 1000) / 1000,
      schedule_variance_days: delayDays,
      planned_physical_pct: plannedPhys,
      actual_physical_pct: actualPhys,
      physical_variance_pct: Math.round((actualPhys - plannedPhys) * 10) / 10,
      financial_variance_pct: Math.round((p.financial_progress_pct - (pv / sanctioned * 100)) * 10) / 10,
      status_assessment: delayDays > 60 || sv < -15 ? "CRITICAL_DELAY" : delayDays > 15 ? "AT_RISK" : "ON_TRACK"
    },
    progress_history: [
      {
        id: 301,
        project_id: p.id,
        reporting_month: "2025-05",
        planned_physical_pct: 30.0,
        actual_physical_pct: 28.5,
        planned_financial_pct: 25.0,
        actual_financial_pct: 24.0,
        expenditure_in_month_cr: 12.5,
        cumulative_expenditure_cr: 34.0,
        earned_value_cr: Math.round((sanctioned * 0.285) * 100) / 100,
        planned_value_cr: Math.round((sanctioned * 0.30) * 100) / 100,
        cost_variance_cr: 6.5,
        schedule_variance_cr: -2.1,
        remarks: "GSB laying completed smoothly up to chainage 30. Minor rain interruptions.",
        created_at: "2025-05-31T00:00:00Z"
      },
      {
        id: 302,
        project_id: p.id,
        reporting_month: "2025-07",
        planned_physical_pct: 48.0,
        actual_physical_pct: 42.0,
        planned_financial_pct: 42.0,
        actual_financial_pct: 38.0,
        expenditure_in_month_cr: 15.8,
        cumulative_expenditure_cr: 49.8,
        earned_value_cr: Math.round((sanctioned * 0.42) * 100) / 100,
        planned_value_cr: Math.round((sanctioned * 0.48) * 100) / 100,
        cost_variance_cr: 9.8,
        schedule_variance_cr: -8.5,
        remarks: "Land dispute arose near Akkarai stretch. Section 15(2) enquiry pending with Revenue.",
        created_at: "2025-07-31T00:00:00Z"
      },
      {
        id: 303,
        project_id: p.id,
        reporting_month: "2025-09",
        planned_physical_pct: plannedPhys,
        actual_physical_pct: actualPhys,
        planned_financial_pct: 55.0,
        actual_financial_pct: p.financial_progress_pct,
        expenditure_in_month_cr: 15.0,
        cumulative_expenditure_cr: actualCost,
        earned_value_cr: Math.round(ev * 100) / 100,
        planned_value_cr: Math.round(pv * 100) / 100,
        cost_variance_cr: Math.round(cv * 100) / 100,
        schedule_variance_cr: Math.round(sv * 100) / 100,
        remarks: "Work stalled on 4.2 Ha section. TANGEDCO 42 HT poles relocation awaiting shutdown approval.",
        created_at: "2025-09-30T00:00:00Z"
      }
    ],
    work_packages: [
      {
        id: 401,
        package_code: isECR ? "PKG-ECR-01" : "PKG-TAM-01",
        project_id: p.id,
        title: isECR ? "Widening & Strengthening km 22/0 to 33/0" : "Main Elevated Viaduct Substructure & Superstructure",
        start_chainage_km: isECR ? 22.0 : 0.0,
        end_chainage_km: isECR ? 33.0 : 2.8,
        sanctioned_amount_cr: Math.round(sanctioned * 0.52 * 100) / 100,
        contractor_id: p.contractor_id || 1,
        contractor_name: p.contractor_name || "L&T Infrastructure Engineering Ltd",
        physical_progress_pct: Math.min(actualPhys + 8, 100),
        financial_progress_pct: Math.min(p.financial_progress_pct + 4, 100),
        status: p.status
      },
      {
        id: 402,
        package_code: isECR ? "PKG-ECR-02" : "PKG-TAM-02",
        project_id: p.id,
        title: isECR ? "Widening & Bridge Approaches km 33/0 to 45/0" : "Service Roads, Utility Ducts & Storm Water Drains",
        start_chainage_km: isECR ? 33.0 : 2.8,
        end_chainage_km: isECR ? 45.0 : 4.8,
        sanctioned_amount_cr: Math.round(sanctioned * 0.48 * 100) / 100,
        contractor_id: p.contractor_id || 1,
        contractor_name: p.contractor_name || "L&T Infrastructure Engineering Ltd",
        physical_progress_pct: Math.max(actualPhys - 10, 10),
        financial_progress_pct: Math.max(p.financial_progress_pct - 8, 10),
        status: p.status
      }
    ],
    contractors_and_consultants: {
      main_contractor: {
        name: p.contractor_name || "L&T Infrastructure Engineering Ltd",
        registration: "CR-TN-CL1-2018-092",
        class: "Class I (Super-Special)",
        pan: "AAACL1234F",
        gst: "33AAACL1234F1Z5"
      },
      contracts: [
        {
          agreement_number: isECR ? "AGR/CE-CM/2024-25/088" : "AGR/CE-CM/2024-25/104",
          agreement_date: "2024-09-05T00:00:00Z",
          contract_value_cr: Math.round(sanctioned * 0.98 * 100) / 100,
          performance_security_cr: Math.round(sanctioned * 0.05 * 100) / 100,
          status: "ACTIVE_EXECUTING"
        }
      ],
      consultants: [
        {
          company_name: "STUP Consultants Pvt Ltd & SMEC India Joint Venture",
          assignment_title: "Independent Engineer & Quality Audit Supervision Consultant",
          contract_value_cr: 4.85,
          status: "ACTIVE"
        }
      ]
    },
    assigned_officials_and_stakeholders: [
      {
        role_label: "Head of Department",
        officer_name: "Er. R. Senthil Kumar, M.E.",
        designation: "Chief Engineer (Highways) C&M",
        department: "Highways Department",
        phone: "+91 44 2567 1234",
        email: "ce.cm@tnhighways.gov.in",
        office_location: "Integrated Chief Engineer Office, Guindy, Chennai"
      },
      {
        role_label: "Superintending Engineer",
        officer_name: "Er. M. Rajasekaran, M.E.",
        designation: "Superintending Engineer (Highways)",
        department: "Highways Department (Chengalpattu Circle)",
        phone: "+91 44 2742 5678",
        email: "se.cpt@tnhighways.gov.in",
        office_location: "Chengalpattu Highways Complex, Chengalpattu"
      },
      {
        role_label: "Divisional Engineer (Executive Engineer)",
        officer_name: "Er. P. Anandhan, B.E.",
        designation: "Divisional Engineer (Highways)",
        department: "Highways Department (Chengalpattu Division)",
        phone: "+91 44 2743 9012",
        email: "ee.cpt@tnhighways.gov.in",
        office_location: "Divisional Engineer Office, Chengalpattu"
      },
      {
        role_label: "District Collector",
        officer_name: "Thiru S. Arunraj, IAS",
        designation: "District Collector & District Magistrate",
        department: "Revenue and Disaster Management Department",
        phone: "+91 44 2742 2222",
        email: "collr-cpt@nic.in",
        office_location: "District Collectorate, Chengalpattu"
      },
      {
        role_label: "Utility Coordinator (Electricity)",
        officer_name: "Er. K. Murugan, M.E.",
        designation: "Superintending Engineer (Distribution)",
        department: "TANGEDCO (Kanchipuram Electricity Distribution Circle)",
        phone: "+91 44 2722 3456",
        email: "se.kanchi@tnebnet.org",
        office_location: "Oli Mohamedpet, Kanchipuram"
      }
    ],
    land_acquisition: {
      total_parcels: isECR ? 38 : 14,
      total_land_sqm: isECR ? 42000 : 18500,
      total_land_hectares: isECR ? 4.2 : 1.85,
      compensation_assessed_cr: isECR ? 18.50 : 9.20,
      compensation_paid_cr: isECR ? 14.20 : 6.80,
      parcels: [
        {
          parcel_ref: "CPT-ECR-P01",
          district: "Chengalpattu",
          taluk: "Sholinganallur",
          village: "Akkarai",
          survey_number: "148/2A",
          classification: "Rayanwari Wet (Agricultural)",
          total_sqm: 4200,
          sec15_2_date: "2024-04-10T00:00:00Z",
          sec15_1_date: "2024-08-15T00:00:00Z",
          sec19_1_date: undefined,
          compensation_paid_cr: 1.85,
          possession_status: "DISPUTED_AWARD_PENDING",
          has_litigation: true
        },
        {
          parcel_ref: "CPT-ECR-P02",
          district: "Chengalpattu",
          taluk: "Thiruporur",
          village: "Muttukadu",
          survey_number: "204/1B",
          classification: "Dry Land (Commercial Frontage)",
          total_sqm: 6500,
          sec15_2_date: "2024-04-10T00:00:00Z",
          sec15_1_date: "2024-08-15T00:00:00Z",
          sec19_1_date: "2025-01-20T00:00:00Z",
          compensation_paid_cr: 3.40,
          possession_status: "POSSESSION_TAKEN",
          has_litigation: false
        },
        {
          parcel_ref: "CPT-ECR-P03",
          district: "Chengalpattu",
          taluk: "Thiruporur",
          village: "Kovalam",
          survey_number: "88/3",
          classification: "Poramboke (Water Body Margin)",
          total_sqm: 8200,
          sec15_2_date: "2024-02-18T00:00:00Z",
          sec15_1_date: "2024-06-12T00:00:00Z",
          sec19_1_date: "2024-11-05T00:00:00Z",
          compensation_paid_cr: 0.0,
          possession_status: "POSSESSION_TAKEN",
          has_litigation: false
        }
      ]
    },
    utilities_and_dependencies: {
      total_dependencies: isECR ? 3 : 2,
      pending_clearances: isECR ? 2 : 1,
      total_impact_days: delayDays,
      items: [
        {
          id: 1,
          project_id: p.id,
          project_title: p.title,
          department_name: "TANGEDCO",
          contact_officer: "Er. K. Murugan (SE Distribution)",
          dependency_type: "HT/LT Electric Line Shifting",
          status: "CRITICAL_ACTION_REQUIRED",
          days_pending: delayDays,
          impact_cost_cr: 4.80,
          schedule_delay_days: delayDays,
          action_required: "Approve 33kV line relocation estimate and provide line shutdown schedule for km 28+400."
        },
        {
          id: 2,
          project_id: p.id,
          project_title: p.title,
          department_name: "TWAD Board",
          contact_officer: "Er. S. Vetrivel (EE Project Division)",
          dependency_type: "Bulk Water Pipeline Relocation",
          status: "IN_PROGRESS",
          days_pending: 25,
          impact_cost_cr: 1.80,
          schedule_delay_days: 15,
          action_required: "Interconnection of 400mm DI replacement pipeline along service road."
        }
      ]
    },
    engineering_quality: {
      total_defects_logged: 3,
      critical_unresolved: isECR ? 1 : 0,
      records: [
        {
          defect_reference: "QCR-2025-089",
          component_type: "Dense Bituminous Macadam (DBM)",
          description: "Highways Research Station (HRS) core audit detected localized compaction deficit (95.2% vs min 98.0% specified) at km 28+400 to 28+650 LHS.",
          severity: "HIGH",
          status: "UNDER_RECTIFICATION",
          financial_penalty_cr: 0.25,
          rectification_deadline: "2025-11-20T00:00:00Z"
        },
        {
          defect_reference: "QCR-2025-042",
          component_type: "M30 RCC Box Culvert",
          description: "Honeycombing observed on outer wing wall barrel. Non-destructive rebound hammer test conducted.",
          severity: "MEDIUM",
          status: "RECTIFIED_VERIFIED",
          financial_penalty_cr: 0.05,
          rectification_deadline: "2025-06-15T00:00:00Z"
        }
      ]
    },
    legal_cases: {
      total_cases: isECR ? 2 : 1,
      active_stays_count: isECR ? 1 : 0,
      total_financial_exposure_cr: isECR ? 14.50 : 3.20,
      items: [
        {
          id: 601,
          case_number: "W.P. No. 18942 of 2025",
          court_name: "High Court of Judicature at Madras (Principal Seat)",
          petitioner: "K. Varadharajan & 4 Others vs State of Tamil Nadu",
          category: "LAND_ACQUISITION_WRIT",
          stay_order_active: isECR,
          stay_details: isECR ? "Interim Stay of Dispossession granted on 14-Jul-2025 for Survey No. 148/2A (Akkarai Section, km 28+400)." : undefined,
          financial_exposure_cr: 14.50,
          schedule_delay_days: delayDays,
          standing_counsel: "Special Government Pleader (Highways & Revenue)",
          next_hearing_date: "2025-11-25T00:00:00Z",
          case_status: isECR ? "STAY_ACTIVE" : "DISPOSED"
        }
      ]
    },
    documents: [
      {
        id: 701,
        document_title: "Administrative Sanction Government Order (G.O.Ms.No.84)",
        file_name: "GO_Ms_84_Highways_CMRDP_Sanction.pdf",
        mime_type: "application/pdf",
        file_size_bytes: 2458920,
        sha256_hash: "a4c28f1190bc89ef23d11b3e811c7590d6b9c97b83d47f9c892b11568e21ad47",
        is_verified: true,
        created_at: "2024-07-15T00:00:00Z"
      },
      {
        id: 702,
        document_title: "Technical Sanction Proceedings by Chief Engineer",
        file_name: "TS_Proceedings_CE_CM_09_2024_25.pdf",
        mime_type: "application/pdf",
        file_size_bytes: 1845100,
        sha256_hash: "d9e84128f7ca541991ab39c656d20387431fb542ea4c94702ba067f918e98341",
        is_verified: true,
        created_at: "2024-08-22T00:00:00Z"
      },
      {
        id: 703,
        document_title: "Highways Research Station (HRS) Quality Audit Certificate",
        file_name: "HRS_Quality_Audit_Q2_2025.pdf",
        mime_type: "application/pdf",
        file_size_bytes: 3120450,
        sha256_hash: "3c8297b5e1974efbb75800d04c000f07ab9b8a3e7e29683e9508920194bc0281",
        is_verified: true,
        created_at: "2025-08-30T00:00:00Z"
      }
    ],
    risks_and_issues: {
      open_risks: isECR ? 3 : 1,
      critical_issues: isECR ? 2 : 1,
      risks: [
        {
          id: 801,
          project_id: p.id,
          risk_code: "RSK-01",
          category: "LAND_ACQUISITION",
          description: "Sub-Collector Tambaram award inquiry delayed under Section 15(2); interim compensation dispute in Akkarai.",
          probability: "HIGH",
          impact: "CRITICAL",
          risk_score: 9,
          mitigation_strategy: "Convene Secretariat Bilateral Taskforce with Principal Secretary (Revenue) to fast-track compensation deposit.",
          owner_role: "Superintending Engineer (Chengalpattu Circle)",
          status: "OPEN"
        },
        {
          id: 802,
          project_id: p.id,
          risk_code: "RSK-02",
          category: "UTILITY_SHIFTING",
          description: "Relocation of 42 High Tension electrical poles pending line shutdown approval from TANGEDCO.",
          probability: "HIGH",
          impact: "HIGH",
          risk_score: 6,
          mitigation_strategy: "Request Member (Distribution) TANGEDCO to schedule weekend maintenance shutdown for pole relocation.",
          owner_role: "Divisional Engineer (Chengalpattu Division)",
          status: "OPEN"
        }
      ],
      issues: [
        {
          issue_ref: "LDR-2026-001",
          category: "Land Acquisition & Revenue",
          description: "4.2 Hectares of private land acquisition stalled due to landowner title disputes, halting widening at km 28+400.",
          priority: "CRITICAL",
          status: "Action in Progress",
          escalation_status: "SECRETARIAT_ESCALATED"
        }
      ]
    },
    ai_findings: [
      {
        id: 901,
        finding_type: "SCHEDULE_SLIPPAGE_ALERT",
        project_id: p.id,
        project_title: p.title,
        severity: "CRITICAL",
        root_cause_category: "Land Acquisition & Revenue",
        issue_summary: `Schedule slip of ${delayDays} days detected against Baseline Milestone MS-03. Earned Value (₹${ev.toFixed(2)} Cr) is tracking significantly below Planned Value (₹${pv.toFixed(2)} Cr), yielding SPI of ${spi.toFixed(3)}.`,
        evidence_chain: "Tamil Nadu Highways Act 2001 Section 15(2) delay + Madras HC Interim Stay W.P. No. 18942/2025.",
        statutory_rule_citation: "Tamil Nadu Highways Act, 2001 (TN Act 34 of 2002) Section 15(2) & 19(1).",
        recommended_action: "Minister / Principal Secretary should convene Joint Revenue Taskforce with District Collector Chengalpattu to execute court deposit under Section 21 and seek immediate vacation of stay.",
        is_verified_by_model: true,
        human_validation_status: "PENDING_REVIEW"
      }
    ],
    audit_history: [
      {
        id: 1001,
        timestamp: "2024-07-15T11:30:00Z",
        user_name: "Secretary to Government",
        action: "SANCTION_APPROVED",
        entity_name: "Project Sanction Order",
        details: `Administrative Sanction G.O.Ms.No.84 issued for ₹${sanctioned.toFixed(2)} Cr.`
      },
      {
        id: 1002,
        timestamp: "2024-09-05T14:15:00Z",
        user_name: "Chief Engineer (C&M)",
        action: "CONTRACT_AWARDED",
        entity_name: "Contract Agreement",
        details: `Contract awarded to ${p.contractor_name || "L&T Infrastructure"} under Agreement No. 88.`
      },
      {
        id: 1003,
        timestamp: "2025-08-30T16:45:00Z",
        user_name: "Director, HRS",
        action: "QUALITY_AUDIT_LOGGED",
        entity_name: "HRS Test Verification",
        details: "Highways Research Station submitted Bituminous Core Test Report QCR-2025-089."
      }
    ]
  };
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

    // Backend unreachable — activate demo mode
    setDemoMode(true);
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

  getMinisterOverview: async () => {
    try {
      return await request<MinisterOverview>('/executive/minister/overview');
    } catch {
      return fallbackMinisterOverview;
    }
  },

  getSecretaryOverview: async () => {
    try {
      return await request<SecretaryOverview>('/executive/secretary/overview');
    } catch {
      return fallbackSecretaryOverview;
    }
  },

  // Projects

  getProjects: async (param?: RoadType | {
    roadType?: RoadType;
    status?: string;
    priority?: string;
    programmeId?: number;
    search?: string;
  }) => {
    const isObject = typeof param === 'object' && param !== null;
    const roadType = isObject ? param.roadType : (param as RoadType | undefined);
    const status = isObject ? param.status : undefined;
    const priority = isObject ? param.priority : undefined;
    const programmeId = isObject ? param.programmeId : undefined;
    const search = isObject ? param.search : undefined;

    try {
      const q = new URLSearchParams();
      if (roadType) q.append('road_type', roadType);
      if (status && status !== 'ALL') q.append('status', status);
      if (priority && priority !== 'ALL') q.append('priority', priority);
      if (programmeId) q.append('programme_id', String(programmeId));
      if (search) q.append('search', search);

      const queryString = q.toString() ? `?${q.toString()}` : '';
      return await request<ProjectItem[]>(`/projects${queryString}`);
    } catch {
      let filtered = [...fallbackProjects];
      if (activeUser.role_code === 'CONTRACTOR') {
        filtered = filtered.filter(p => p.contractor_id === activeUser.contractor_id);
      }
      if (roadType) {
        filtered = filtered.filter(p => p.road_type === roadType);
      }
      if (status && status !== 'ALL') {
        filtered = filtered.filter(p => p.status === status);
      }
      if (priority && priority !== 'ALL') {
        filtered = filtered.filter(p => p.priority === priority);
      }
      if (programmeId) {
        filtered = filtered.filter(p => p.programme_id === programmeId);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(s) ||
          p.project_code.toLowerCase().includes(s) ||
          (p.road_name && p.road_name.toLowerCase().includes(s)) ||
          (p.contractor_name && p.contractor_name.toLowerCase().includes(s))
        );
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

  getProject360: async (id: number): Promise<Project360Detail> => {
    try {
      return await request<Project360Detail>(`/projects/${id}/360`);
    } catch {
      return fallbackProject360(id);
    }
  },

  getProjectMilestones: async (id: number): Promise<ProjectMilestoneItem[]> => {
    try {
      return await request<ProjectMilestoneItem[]>(`/projects/${id}/milestones`);
    } catch {
      return fallbackProject360(id).milestones;
    }
  },

  getProjectRisks: async (id: number): Promise<ProjectRiskItem[]> => {
    try {
      return await request<ProjectRiskItem[]>(`/projects/${id}/risks`);
    } catch {
      return fallbackProject360(id).risks_and_issues.risks;
    }
  },

  getProjectProgressHistory: async (id: number): Promise<ProjectProgressRecordItem[]> => {
    try {
      return await request<ProjectProgressRecordItem[]>(`/projects/${id}/progress-history`);
    } catch {
      return fallbackProject360(id).progress_history;
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

  getVerifiedOrganisationStructure: async (): Promise<VerifiedOrganisationStructure> => {
    try {
      return await request<VerifiedOrganisationStructure>('/executive/organisation/verified-structure');
    } catch {
      return fallbackOrganisationStructure;
    }
  },

  getGovernmentDocuments: async (params?: { category?: string; verification_status?: string; query?: string }): Promise<GovernmentDocumentItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') q.append('category', params.category);
      if (params?.verification_status && params.verification_status !== 'ALL') q.append('verification_status', params.verification_status);
      if (params?.query) q.append('query', params.query);
      const url = `/executive/documents/registry${q.toString() ? '?' + q.toString() : ''}`;
      return await request<GovernmentDocumentItem[]>(url);
    } catch {
      let docs = [...fallbackGovernmentDocuments];
      if (params?.category && params.category !== 'ALL') {
        docs = docs.filter(d => d.category === params.category);
      }
      if (params?.verification_status && params.verification_status !== 'ALL') {
        docs = docs.filter(d => d.verification_status === params.verification_status);
      }
      if (params?.query) {
        const needle = params.query.toLowerCase();
        docs = docs.filter(d =>
          d.title.toLowerCase().includes(needle) ||
          d.document_reference.toLowerCase().includes(needle) ||
          (d.go_number && d.go_number.toLowerCase().includes(needle))
        );
      }
      return docs;
    }
  },

  getGovernanceCommittees: async (): Promise<StatutoryCommitteeDetailItem[]> => {
    try {
      return await request<StatutoryCommitteeDetailItem[]>('/executive/governance/committees');
    } catch {
      return fallbackGovernanceCommittees;
    }
  },

  getStatutoryReferrals: async (params?: { committee_code?: string; status?: string }): Promise<StatutoryReferralItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.committee_code && params.committee_code !== 'ALL') q.append('committee_code', params.committee_code);
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      const url = `/executive/governance/referrals${q.toString() ? '?' + q.toString() : ''}`;
      return await request<StatutoryReferralItem[]>(url);
    } catch {
      let refs = [...fallbackStatutoryReferrals];
      if (params?.committee_code && params.committee_code !== 'ALL') {
        refs = refs.filter(r => r.committee_code === params.committee_code);
      }
      if (params?.status && params.status !== 'ALL') {
        refs = refs.filter(r => r.status === params.status);
      }
      return refs;
    }
  },

  getAIIntelligenceFindings: async (params?: { finding_type?: string; validation_status?: string }): Promise<AIIntelligenceFindingItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.finding_type && params.finding_type !== 'ALL') q.append('finding_type', params.finding_type);
      if (params?.validation_status && params.validation_status !== 'ALL') q.append('validation_status', params.validation_status);
      const url = `/executive/ai/findings${q.toString() ? '?' + q.toString() : ''}`;
      return await request<AIIntelligenceFindingItem[]>(url);
    } catch {
      let findings = [...fallbackAIIntelligenceFindings];
      if (params?.finding_type && params.finding_type !== 'ALL') {
        findings = findings.filter(f => f.finding_type === params.finding_type);
      }
      if (params?.validation_status && params.validation_status !== 'ALL') {
        findings = findings.filter(f => f.human_validation_status === params.validation_status);
      }
      return findings;
    }
  },

  validateAIFinding: async (findingId: number, validationStatus: string, remarks?: string): Promise<AIIntelligenceFindingItem> => {
    try {
      return await request<AIIntelligenceFindingItem>(`/executive/ai/findings/${findingId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ validation_status: validationStatus, officer_remarks: remarks })
      });
    } catch {
      const target = fallbackAIIntelligenceFindings.find(f => f.id === findingId);
      if (target) {
        target.human_validation_status = validationStatus;
        if (remarks) {
          target.recommended_action += ` [Officer Remark: ${remarks}]`;
        }
        return { ...target };
      }
      throw new Error("Finding not found");
    }
  },

  // Multilateral Programmes & Corridors (CKICP / TNRSP-II / CRIDP)
  getProgrammes: async (): Promise<ProgrammeItem[]> => {
    try {
      return await request<ProgrammeItem[]>('/programmes');
    } catch {
      return fallbackProgrammes;
    }
  },

  getProgrammeByCode: async (code: string): Promise<ProgrammeItem> => {
    try {
      return await request<ProgrammeItem>(`/programmes/${code}`);
    } catch {
      const p = fallbackProgrammes.find(item => item.code.toUpperCase() === code.toUpperCase());
      if (!p) throw new Error(`Programme ${code} not found`);
      return p;
    }
  },

  getProgrammeKPIs: async (code: string): Promise<ProgrammeOverviewKPIs> => {
    try {
      return await request<ProgrammeOverviewKPIs>(`/programmes/${code}/kpis`);
    } catch {
      return fallbackProgrammeKPIs[code.toUpperCase()] || fallbackProgrammeKPIs['CKICP'];
    }
  },

  getProgrammeProjects: async (code: string): Promise<ProjectItem[]> => {
    try {
      return await request<ProjectItem[]>(`/programmes/${code}/projects`);
    } catch {
      return fallbackProgrammeProjects[code.toUpperCase()] || [];
    }
  },

  getProgrammeTenders: async (code: string): Promise<TenderItem[]> => {
    try {
      return await request<TenderItem[]>(`/programmes/${code}/tenders`);
    } catch {
      return fallbackProgrammeTenders[code.toUpperCase()] || [];
    }
  },

  getProgrammeLandParcels: async (code: string): Promise<LandParcelItem[]> => {
    try {
      return await request<LandParcelItem[]>(`/programmes/${code}/land-parcels`);
    } catch {
      return fallbackProgrammeLandParcels[code.toUpperCase()] || [];
    }
  },

  getProgrammeLegalCases: async (code: string): Promise<LegalCaseItem[]> => {
    try {
      return await request<LegalCaseItem[]>(`/programmes/${code}/legal-cases`);
    } catch {
      return fallbackProgrammeLegalCases[code.toUpperCase()] || [];
    }
  },

  getProgrammeAlignments: async (code: string): Promise<CorridorAlignmentItem[]> => {
    try {
      return await request<CorridorAlignmentItem[]>(`/programmes/${code}/alignments`);
    } catch {
      return fallbackProgrammeAlignments[code.toUpperCase()] || [];
    }
  }
};

export const fallbackGovernmentDocuments: GovernmentDocumentItem[] = [
  {
    id: 1,
    document_reference: "DOC-PN-2026-27",
    title: "Highways and Minor Ports Department Policy Note 2026-2027",
    category: "Policy Note",
    issuing_department: "Highways and Minor Ports Department",
    go_number: "Demand No. 21 / 2026-2027",
    order_date: "2026-03-20T00:00:00Z",
    effective_date: "2026-04-01T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/policy_notes",
    summary_abstract: "Legislative presentation by Minister for Public Works detailing strategic statewide road infrastructure priorities, CRIDP allocations, World Bank TNRSP-II closeout, CKICP status, and the 2026 departmental re-organization into 4 regional zones.",
    is_confidential: false
  },
  {
    id: 2,
    document_reference: "DOC-PN-2025-26",
    title: "Highways and Minor Ports Department Policy Note 2025-2026",
    category: "Policy Note",
    issuing_department: "Highways and Minor Ports Department",
    go_number: "Demand No. 21 / 2025-2026",
    order_date: "2025-03-15T00:00:00Z",
    effective_date: "2025-04-01T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/policy_notes",
    summary_abstract: "Legislative policy overview outlining budget provisions, NABARD rural connectivity, bypass initiatives, and flood restoration across 19 circles and 87 divisions.",
    is_confidential: false
  },
  {
    id: 3,
    document_reference: "DOC-GO-MS-172",
    title: "Special Rules for the Tamil Nadu Highways Engineering Service (TN-HES)",
    category: "Government Order",
    issuing_department: "Highways and Minor Ports (HK1) Department",
    go_number: "G.O.Ms.No.172",
    order_date: "2025-11-03T00:00:00Z",
    effective_date: "2025-11-03T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/gos",
    summary_abstract: "Statutory revision of Service Rules for TN-HES defining 5 officer categories (Director General, Chief Engineer, Superintending Engineer, Divisional Engineer, Assistant Divisional Engineer), recruitment criteria, qualification standards, and technical duties.",
    is_confidential: false
  },
  {
    id: 4,
    document_reference: "DOC-GO-MS-43",
    title: "Reorganization and Restructuring of Highways Department into 4 Regional Zonal Cadres",
    category: "Government Order",
    issuing_department: "Highways and Minor Ports Department",
    go_number: "G.O.Ms.No.43",
    order_date: "2026-01-28T00:00:00Z",
    effective_date: "2026-02-01T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/gos",
    summary_abstract: "Decentralization and rationalization of the department into 4 Zonal Commands (Chennai, Coimbatore, Madurai, Trichy), creating Regional Chief Engineers with unified administrative control over 19 circles, 87 divisions, and 353 subdivisions.",
    is_confidential: false
  },
  {
    id: 5,
    document_reference: "DOC-GO-MS-75",
    title: "Revision of Financial Delegation of Powers for Technical Sanction and Tender Acceptance",
    category: "Government Order",
    issuing_department: "Highways and Minor Ports (HN1) Department",
    go_number: "G.O.Ms.No.75",
    order_date: "2026-09-02T00:00:00Z",
    effective_date: "2026-09-02T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/gos",
    summary_abstract: "Revised monetary ceilings and tender excess thresholds for DE, SE, CE and Commissionerate of Tenders (COT). Sets mandatory COT acceptance for individual works > Rs 6.00 Cr and packages > Rs 7.50 Cr, and excess > 6% for works up to Rs 1.00 Cr.",
    is_confidential: false
  },
  {
    id: 6,
    document_reference: "DOC-GO-MS-163",
    title: "Financial Delegation for Land Acquisition Sanctions and Enhanced Solatium Compensation",
    category: "Government Order",
    issuing_department: "Highways and Minor Ports (HN1) Department",
    go_number: "G.O.Ms.No.163",
    order_date: "2023-12-13T00:00:00Z",
    effective_date: "2023-12-13T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/gos",
    summary_abstract: "Empowerment of Revised Administrative Sanction Committee for Land Acquisition (RASC-LA) under Commissioner of Land Acquisition for enhanced compensation and court-awarded solatium revisions.",
    is_confidential: false
  },
  {
    id: 7,
    document_reference: "DOC-GO-MS-05",
    title: "Constitution of Three-Member Expert Committee under Section 16(b) of Tamil Nadu Transparency in Tenders Act",
    category: "Government Order",
    issuing_department: "Highways and Minor Ports (HN2) Department",
    go_number: "G.O.Ms.No.05",
    order_date: "2026-01-13T00:00:00Z",
    effective_date: "2026-01-13T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/gos",
    summary_abstract: "Statutory constitution of 3-Member Expert Committee chaired by Joint Director (O/o DG) for scrutinizing additional quantity variations exceeding 25% of agreement quantities before execution.",
    is_confidential: false
  },
  {
    id: 8,
    document_reference: "DOC-SSR-2026-27",
    title: "Tamil Nadu Highways Department Standard Schedule of Rates (SSR) 2026-2027",
    category: "Schedule of Rates",
    issuing_department: "Highways Research Station & SSR Committee",
    go_number: "SSR-TN-2026-27",
    order_date: "2026-04-01T00:00:00Z",
    effective_date: "2026-04-01T00:00:00Z",
    last_verified_date: "2026-11-06T00:00:00Z",
    verification_status: "Verified",
    source_url: "https://www.tnhighways.tn.gov.in/schedule_rates",
    summary_abstract: "Standardized departmental schedule of basic rates for labour, raw materials (bitumen, cement, steel, aggregates), lead charts, and machinery operational rates for road and bridge works.",
    is_confidential: false
  }
];

export const fallbackGovernanceCommittees: StatutoryCommitteeDetailItem[] = [
  {
    id: 1,
    code: "BOE",
    name: "Board of Engineers (BOE) - Highest Technical Authority",
    chairperson_title: "Director General (H), Highways Department",
    mandate_summary: "Highest Technical Authority deciding standard specifications, manual revisions, and technical policies.",
    constitution_go: "G.O. Ms. No. 359 (12.08.1997) & G.O. Ms. No. 1 (07.01.2011)",
    meetings: [],
    decisions: []
  },
  {
    id: 2,
    code: "TAC",
    name: "Technical Audit Committee (TAC)",
    chairperson_title: "Director General (H), Highways Department",
    mandate_summary: "Mandatory technical audit for bridge works with linear waterway > 150m and complex bypasses before according Technical Sanction.",
    constitution_go: "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009",
    meetings: [
      {
        id: 1,
        meeting_reference: "TAC-MTG-2026-104",
        committee_id: 2,
        meeting_date: "2026-03-28T14:30:00Z",
        venue: "HRS Auditorium, Guindy, Chennai",
        chairperson_name: "Er. R. Selvadurai, Director General (H)",
        agenda_summary: "Technical Audit for major bridge reconstruction with linear waterway exceeding 150m across coastal backwaters.",
        minutes_summary: "TAC evaluated 2D hydrodynamic HEC-RAS model, scour depth simulations, and prestressed girder design. Cleared structural design with mandatory pile integrity tests.",
        verification_status: "Verified",
        decisions: [
          {
            id: 1,
            decision_reference: "TAC-DEC-2026-018",
            committee_id: 2,
            subject: "Technical Sanction Clearance for 185m Linear Waterway Bridge",
            decision_type: "APPROVED",
            decision_text: "Technical Audit Committee clears hydraulic and structural design for bridge reconstruction on ODR-045. Pier foundation depth approved at 24.5m below bed level.",
            statutory_condition: "Cross-hole sonic logging mandatory on 100% of cast-in-situ bored piles.",
            government_order_ref: "Circular Memo No. 13555/Contracts-1/2009",
            effective_date: "2026-03-28T15:30:00Z",
            verification_status: "Verified"
          }
        ]
      }
    ],
    decisions: [
      {
        id: 1,
        decision_reference: "TAC-DEC-2026-018",
        committee_id: 2,
        subject: "Technical Sanction Clearance for 185m Linear Waterway Bridge",
        decision_type: "APPROVED",
        decision_text: "Technical Audit Committee clears hydraulic and structural design for bridge reconstruction on ODR-045. Pier foundation depth approved at 24.5m below bed level.",
        statutory_condition: "Cross-hole sonic logging mandatory on 100% of cast-in-situ bored piles.",
        government_order_ref: "Circular Memo No. 13555/Contracts-1/2009",
        effective_date: "2026-03-28T15:30:00Z",
        verification_status: "Verified"
      }
    ]
  },
  {
    id: 3,
    code: "COT",
    name: "Commissionerate of Tenders (COT)",
    chairperson_title: "Secretary to Government, Finance / Director General (H)",
    mandate_summary: "Statutory scrutiny of tenders with excess above 10% (up to 50L), above 6% (up to 1Cr), all works > 6Cr, and packages > 7.50Cr.",
    constitution_go: "G.O. Ms. No. 75 (02.09.2026) & G.O. Ms. No. 29 (03.03.2022)",
    meetings: [
      {
        id: 2,
        meeting_reference: "COT-MTG-2026-004",
        committee_id: 3,
        meeting_date: "2026-04-12T11:00:00Z",
        venue: "Committee Room, 3rd Floor, Main Secretariat, Chennai",
        chairperson_name: "Thiru Pradeep Yadav, IAS",
        agenda_summary: "Scrutiny of tender excess exceeding delegated Chief Engineer limits for ECR corridor works and CRN Package EPC03.",
        minutes_summary: "Committee reviewed rate analysis submitted by CE (H) Chennai. Excess justified on account of increased bitumen hauling lead and night-time urban traffic constraints.",
        verification_status: "Verified",
        decisions: [
          {
            id: 2,
            decision_reference: "COT-DEC-2026-042",
            committee_id: 3,
            subject: "Acceptance of Tender with +8.40% Excess on SH-49 ECR Widening",
            decision_type: "APPROVED_WITH_CONDITIONS",
            decision_text: "Commissionerate of Tenders accepts lowest tender of M/s Consolidated Construction Consortium at +8.40% above estimated cost subject to contractor furnishing additional 2.5% performance bank guarantee for timely progress.",
            statutory_condition: "Additional 2.5% PBG to be deposited before Agreement execution.",
            government_order_ref: "G.O. Ms. No. 75 / COT Resolution No. 42",
            effective_date: "2026-04-12T12:00:00Z",
            verification_status: "Verified"
          }
        ]
      }
    ],
    decisions: [
      {
        id: 2,
        decision_reference: "COT-DEC-2026-042",
        committee_id: 3,
        subject: "Acceptance of Tender with +8.40% Excess on SH-49 ECR Widening",
        decision_type: "APPROVED_WITH_CONDITIONS",
        decision_text: "Commissionerate of Tenders accepts lowest tender of M/s Consolidated Construction Consortium at +8.40% above estimated cost subject to contractor furnishing additional 2.5% performance bank guarantee for timely progress.",
        statutory_condition: "Additional 2.5% PBG to be deposited before Agreement execution.",
        government_order_ref: "G.O. Ms. No. 75 / COT Resolution No. 42",
        effective_date: "2026-04-12T12:00:00Z",
        verification_status: "Verified"
      }
    ]
  },
  {
    id: 4,
    code: "EXPERT_16B",
    name: "Three Member Expert Committee (Section 16(b) TNTIT Act)",
    chairperson_title: "Joint Director, Office of the Director General (H)",
    mandate_summary: "Evaluation and approval for entrustment of additional quantities exceeding 25% of agreement quantities to original contractor.",
    constitution_go: "G.O. Ms. No. 05, Highways and Minor Ports (HN2), dated 13.01.2026",
    meetings: [
      {
        id: 3,
        meeting_reference: "EXP16B-MTG-2026-012",
        committee_id: 4,
        meeting_date: "2026-04-18T15:00:00Z",
        venue: "Chamber of Joint Director, Directorate of Highways, Chennai",
        chairperson_name: "Joint Director (O/o DG Highways)",
        agenda_summary: "Statutory evaluation of quantity variation exceeding 25% for structural steel and bituminous concrete in Tambaram Elevated Corridor.",
        minutes_summary: "Committee verified field measurements against geotechnical redesign necessitated by Railway boundary clearances. Variation found unavoidable and technically justified.",
        verification_status: "Verified",
        decisions: [
          {
            id: 3,
            decision_reference: "EXP16B-DEC-2026-009",
            committee_id: 4,
            subject: "Recommendation for Entrustment of 28.38% Additional Steel Quantities",
            decision_type: "RECOMMENDED",
            decision_text: "Section 16(b) Expert Committee recommends entrustment of +28.38% structural steel to the working contractor at agreed schedule rates without fresh tender call under G.O. Ms. No. 05.",
            statutory_condition: "Supplemental Agreement to be executed within 14 days with updated completion milestone.",
            government_order_ref: "G.O. Ms. No. 05 / Section 16(b) TNTIT Act",
            effective_date: "2026-04-18T16:00:00Z",
            verification_status: "Verified"
          }
        ]
      }
    ],
    decisions: [
      {
        id: 3,
        decision_reference: "EXP16B-DEC-2026-009",
        committee_id: 4,
        subject: "Recommendation for Entrustment of 28.38% Additional Steel Quantities",
        decision_type: "RECOMMENDED",
        decision_text: "Section 16(b) Expert Committee recommends entrustment of +28.38% structural steel to the working contractor at agreed schedule rates without fresh tender call under G.O. Ms. No. 05.",
        statutory_condition: "Supplemental Agreement to be executed within 14 days with updated completion milestone.",
        government_order_ref: "G.O. Ms. No. 05 / Section 16(b) TNTIT Act",
        effective_date: "2026-04-18T16:00:00Z",
        verification_status: "Verified"
      }
    ]
  },
  {
    id: 5,
    code: "TNRIDC_BOARD",
    name: "TNRIDC - Board of Directors",
    chairperson_title: "Principal Secretary to Government, Highways and Minor Ports Department",
    mandate_summary: "Supreme corporate governance, capital investments, policy approvals, and project financing for industrial corridors, ring roads, and port connectivity infrastructure.",
    constitution_go: "G.O. Ms. No. 162, Highways (HN2) Dept, dated 24.06.2005",
    meetings: [],
    decisions: []
  },
  {
    id: 6,
    code: "TNRIDC_AUDIT",
    name: "TNRIDC Audit Committee",
    chairperson_title: "Deputy Secretary to Government, Finance Department",
    mandate_summary: "Statutory financial scrutiny, internal audit reviews, vigilance compliance, and corporate risk governance under Section 177 of Companies Act, 2013.",
    constitution_go: "Companies Act, 2013 / TNRIDC Board Resolution No. 4",
    meetings: [],
    decisions: []
  },
  {
    id: 7,
    code: "TNRIDC_TECH",
    name: "TNRIDC Technical Sanction Committee",
    chairperson_title: "Director General (H), Highways Department",
    mandate_summary: "Specialized technical scrutiny, detailed project report clearance, and structural sanction for high-speed expressways and major ring roads executed through TNRIDC.",
    constitution_go: "TNRIDC Board Resolution No. 12 / G.O. Ms. No. 162",
    meetings: [],
    decisions: []
  }
];

export const fallbackStatutoryReferrals: StatutoryReferralItem[] = [
  {
    id: 1,
    project_id: 1,
    committee_code: "COT",
    referral_type: "TENDER_EXCESS",
    trigger_value: 8.40,
    threshold_limit: 6.00,
    referral_reason: "Lowest bid received has +8.40% excess over estimated rate, exceeding Chief Engineer delegated acceptance threshold of 6.00% under G.O. Ms. No. 75.",
    statutory_rule_citation: "G.O. Ms. No. 75, Highways & Minor Ports, dated 02.09.2026",
    status: "SCRUTINIZED",
    referral_date: "2026-04-10T10:00:00Z",
    responsible_officer: "Er. S. Palanivel, CE (H) C&M Chennai"
  },
  {
    id: 2,
    project_id: 3,
    committee_code: "TAC",
    referral_type: "WATERWAY_LINEAR_LENGTH",
    trigger_value: 185.0,
    threshold_limit: 150.0,
    referral_reason: "Bridge linear waterway measures 185.0 meters, exceeding 150m threshold mandated for independent TAC structural audit before according Technical Sanction.",
    statutory_rule_citation: "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009",
    status: "SANCTIONED",
    referral_date: "2026-03-24T11:30:00Z",
    responsible_officer: "Er. S. Yamini, CE (H) Planning Designs & Investigation"
  },
  {
    id: 3,
    project_id: 2,
    committee_code: "EXPERT_16B",
    referral_type: "QUANTITY_VARIATION_25PCT",
    trigger_value: 28.38,
    threshold_limit: 25.0,
    referral_reason: "Structural steel girder reinforcement quantity increased by 28.38% over agreement schedule due to redesigned railway span footing, requiring statutory Expert Committee clearance under Section 16(b) TNTIT Act.",
    statutory_rule_citation: "G.O. Ms. No. 05 dated 13.01.2026 / Section 16(b) TNTIT Act",
    status: "PENDING_SCRUTINY",
    referral_date: "2026-04-15T14:00:00Z",
    responsible_officer: "Er. M. Rajendran, SE (H) Chengalpattu Circle"
  }
];

export const fallbackAIIntelligenceFindings: AIIntelligenceFindingItem[] = [
  {
    id: 1,
    finding_type: "TENDER_ANOMALY",
    entity_type: "PROJECT",
    entity_id: 1,
    headline: "Tender Bid Excess (+8.40%) without Prior COT Sanction on SH-49 ECR Widening",
    evidence_summary: "Financial bid tabulation shows L1 bidder at ₹124.80 Cr against Sanctioned Estimate of ₹115.12 Cr (+8.40% excess). Rule threshold for CE acceptance is 6.00% under G.O. Ms. No. 75.",
    explanation: "Under G.O. Ms. No. 75, any excess exceeding 6% on works up to ₹1.00 Cr and all excess above 0% on works > ₹6.00 Cr cannot be accepted by the Chief Engineer and must be referred to the Commissionerate of Tenders.",
    confidence: "HIGH",
    human_validation_status: "CONFIRMED_VALID",
    recommended_action: "Submit formal tender scrutiny memorandum to Commissionerate of Tenders (COT) with justified SSR lead differential before issuing Letter of Acceptance.",
    statutory_rule_citation: "G.O. Ms. No. 75, Highways & Minor Ports, dated 02.09.2026",
    created_at: "2026-04-08T09:30:00Z"
  },
  {
    id: 2,
    finding_type: "QUANTITY_VARIATION_EXCESS",
    entity_type: "PROJECT",
    entity_id: 2,
    headline: "Quantity Overrun (28.38%) on Tambaram Elevated Corridor Exceeds 25% Section 16(b) Limit",
    evidence_summary: "Running Account Bill No. 14 records 3,420 MT structural steel against agreement quantity of 2,664 MT (+28.38% increase). Cost variance is ₹6.82 Cr.",
    explanation: "Under Section 16(b) of the Tamil Nadu Transparency in Tenders Act, variations exceeding 25% of agreement quantities cannot be entrusted to the original contractor without statutory clearance by the 3-Member Expert Committee constituted under G.O. Ms. No. 05.",
    confidence: "HIGH",
    human_validation_status: "PENDING_HUMAN_REVIEW",
    recommended_action: "Halt payment on excess quantities beyond 125% and refer revised BOQ to the Section 16(b) Expert Committee chaired by Joint Director, O/o DG Highways.",
    statutory_rule_citation: "G.O. Ms. No. 05 dated 13.01.2026 / Section 16(b) TNTIT Act",
    created_at: "2026-04-14T11:15:00Z"
  },
  {
    id: 3,
    finding_type: "COMMITTEE_REFERRAL_REQUIRED",
    entity_type: "PROJECT",
    entity_id: 3,
    headline: "Linear Waterway (185m) Exceeds 150m Mandatory Technical Audit Committee (TAC) Threshold",
    evidence_summary: "Hydraulic design report submitted by PDI wing shows total effective waterway opening of 185.0 meters across Thiruporur Hub backwaters. Technical Sanction was accorded without TAC reference number.",
    explanation: "Departmental circular instructions strictly prohibit according Technical Sanction for bridges with linear waterway exceeding 150m without prior technical audit and clearance by TAC.",
    confidence: "HIGH",
    human_validation_status: "CONFIRMED_VALID",
    recommended_action: "Place bridge structural and hydraulic model before next TAC state-level sitting for ex-post facto ratification and foundation scour safety validation.",
    statutory_rule_citation: "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009",
    created_at: "2026-03-22T16:00:00Z"
  },
  {
    id: 4,
    finding_type: "REVISED_ESTIMATE_RISK",
    entity_type: "PROJECT",
    entity_id: 1,
    headline: "Land Acquisition Solatium Escalation Triggers RASC-LA Jurisdiction",
    evidence_summary: "Enhanced compensation award by Special DRO (LA) under RFCTLARR Act 2013 totals ₹18.40 Cr against initial AS provision of ₹11.20 Cr (+64.2% increase).",
    explanation: "Revisions exceeding 10% of sanctioned LA provisions require formal examination and recommendation by the Revised Administrative Sanction Committee for Land Acquisition (RASC-LA).",
    confidence: "HIGH",
    human_validation_status: "PENDING_HUMAN_REVIEW",
    recommended_action: "Prepare detailed comparison statement of guideline value vs court award and submit to Commissioner of Land Acquisition / RASC-LA.",
    statutory_rule_citation: "G.O. Ms. No. 163, Highways and Minor Ports (HN1), dated 13.12.2023",
    created_at: "2026-04-05T10:45:00Z"
  }
];

export const fallbackProgrammes: ProgrammeItem[] = [
  {
    id: 1,
    code: "CKICP",
    name: "Chennai-Kanyakumari Industrial Corridor Project",
    parent_corridor: "East Coast Economic Corridor (ECEC)",
    funding_agency: "Asian Development Bank (ADB)",
    approved_cost_cr: 6448.00,
    revised_cost_cr: 6448.00,
    total_corridor_length_km: 654.8,
    website_url: "https://www.ckicp.tn.gov.in/",
    status: "ACTIVE"
  },
  {
    id: 2,
    code: "TNRSP_II",
    name: "Tamil Nadu Road Sector Project II",
    parent_corridor: "Core Road Network Upgradation",
    funding_agency: "World Bank (IBRD)",
    approved_cost_cr: 5171.00,
    revised_cost_cr: 5171.00,
    total_corridor_length_km: 577.0,
    website_url: "https://www.tnrsp.tn.gov.in/",
    status: "ACTIVE"
  },
  {
    id: 3,
    code: "CRIDP",
    name: "Comprehensive Road Infrastructure Development Programme",
    parent_corridor: "Statewide Strategic Network",
    funding_agency: "State Government of Tamil Nadu (GoTN)",
    approved_cost_cr: 8000.00,
    revised_cost_cr: 8000.00,
    total_corridor_length_km: 3200.0,
    website_url: "https://www.tnhighways.tn.gov.in/",
    status: "ACTIVE"
  }
];

export const fallbackProgrammeKPIs: Record<string, ProgrammeOverviewKPIs> = {
  CKICP: {
    programme_code: "CKICP",
    programme_name: "Chennai-Kanyakumari Industrial Corridor Project",
    funding_agency: "Asian Development Bank (ADB)",
    total_approved_outlay_cr: 6448.00,
    total_expenditure_cr: 3185.50,
    financial_progress_pct: 49.4,
    physical_progress_pct: 54.2,
    total_corridor_length_km: 654.8,
    total_projects: 2,
    total_work_packages: 4,
    active_tenders_count: 4,
    tenders_value_cr: 575.10,
    land_acquisition_total_sq_m: 1480000,
    land_possession_pct: 86.4,
    compensation_disbursed_cr: 412.30,
    active_litigations_count: 2,
    active_stays_count: 1,
    litigation_financial_exposure_cr: 14.80
  },
  TNRSP_II: {
    programme_code: "TNRSP_II",
    programme_name: "Tamil Nadu Road Sector Project II",
    funding_agency: "World Bank (IBRD)",
    total_approved_outlay_cr: 5171.00,
    total_expenditure_cr: 4980.20,
    financial_progress_pct: 96.3,
    physical_progress_pct: 98.8,
    total_corridor_length_km: 577.0,
    total_projects: 3,
    total_work_packages: 3,
    active_tenders_count: 0,
    tenders_value_cr: 0.0,
    land_acquisition_total_sq_m: 2062934,
    land_possession_pct: 99.8,
    compensation_disbursed_cr: 388.45,
    active_litigations_count: 1,
    active_stays_count: 0,
    litigation_financial_exposure_cr: 5.60
  }
};

export const fallbackProgrammeTenders: Record<string, TenderItem[]> = {
  CKICP: [
    {
      id: 1,
      tender_notice_number: "CKICP/2026/TN-01",
      package_number: "CKICP/KCH/PKG-01",
      title: "Widening to 4 lanes of SH-116 Kancheepuram to Vandavasi (km 12/0 - 24/0)",
      programme_id: 1,
      programme_code: "CKICP",
      project_id: 1,
      project_title: "CKICP Kancheepuram Corridor: Widening & Strengthening of SH-116/SH-58",
      estimated_cost_cr: 142.50,
      earnest_money_deposit_lakhs: 142.50,
      funding_source: "Asian Development Bank (ADB)",
      bid_validity_days: 120,
      procurement_type: "International Competitive Bidding (ICB)",
      publication_date: "2026-02-18",
      pre_bid_meeting_date: "2026-03-05",
      bid_submission_deadline: "2026-03-24",
      technical_opening_date: "2026-03-25",
      status: "PUBLISHED",
      successful_bidder_name: undefined,
      official_source_url: "https://www.ckicp.tn.gov.in/tenders/fnews_pdf50.pdf",
      pdf_filename: "fnews_pdf50.pdf"
    },
    {
      id: 2,
      tender_notice_number: "CKICP/2026/TN-02",
      package_number: "CKICP/KCH/PKG-02",
      title: "Upgrading of SH-58 Chengalpattu - Thiruporur (km 24/0 - 34/5) with 2-lane paved shoulders",
      programme_id: 1,
      programme_code: "CKICP",
      project_id: 1,
      project_title: "CKICP Kancheepuram Corridor: Widening & Strengthening of SH-116/SH-58",
      estimated_cost_cr: 118.20,
      earnest_money_deposit_lakhs: 118.20,
      funding_source: "Asian Development Bank (ADB)",
      bid_validity_days: 120,
      procurement_type: "National Competitive Bidding (NCB)",
      publication_date: "2026-02-18",
      pre_bid_meeting_date: "2026-03-06",
      bid_submission_deadline: "2026-03-25",
      technical_opening_date: "2026-03-26",
      status: "PUBLISHED",
      successful_bidder_name: undefined,
      official_source_url: "https://www.ckicp.tn.gov.in/tenders/fnews_pdf51.pdf",
      pdf_filename: "fnews_pdf51.pdf"
    },
    {
      id: 3,
      tender_notice_number: "CKICP/2026/TN-03",
      package_number: "CKICP/KCH/PKG-03",
      title: "Construction of Major Grade Separator and ROB at Walajabad Junction (SH-116)",
      programme_id: 1,
      programme_code: "CKICP",
      project_id: 1,
      project_title: "CKICP Kancheepuram Corridor: Widening & Strengthening of SH-116/SH-58",
      estimated_cost_cr: 96.40,
      earnest_money_deposit_lakhs: 96.40,
      funding_source: "Asian Development Bank (ADB)",
      bid_validity_days: 120,
      procurement_type: "National Competitive Bidding (NCB)",
      publication_date: "2026-02-18",
      pre_bid_meeting_date: "2026-03-08",
      bid_submission_deadline: "2026-03-26",
      technical_opening_date: "2026-03-27",
      status: "PUBLISHED",
      successful_bidder_name: undefined,
      official_source_url: "https://www.ckicp.tn.gov.in/tenders/fnews_pdf52.pdf",
      pdf_filename: "fnews_pdf52.pdf"
    },
    {
      id: 4,
      tender_notice_number: "CKICP/2026/TN-04",
      package_number: "CKICP/TRY/PKG-01 & 02",
      title: "Two-lanning with paved shoulders and grade separators on Trichy Semi-Ring & Regional Link (76.8 km)",
      programme_id: 1,
      programme_code: "CKICP",
      project_id: 2,
      project_title: "CKICP Tiruchirappalli Industrial Link Upgradation",
      estimated_cost_cr: 218.00,
      earnest_money_deposit_lakhs: 218.00,
      funding_source: "Asian Development Bank (ADB)",
      bid_validity_days: 150,
      procurement_type: "International Competitive Bidding (ICB)",
      publication_date: "2026-02-18",
      pre_bid_meeting_date: "2026-03-10",
      bid_submission_deadline: "2026-03-28",
      technical_opening_date: "2026-03-29",
      status: "PUBLISHED",
      successful_bidder_name: undefined,
      official_source_url: "https://www.ckicp.tn.gov.in/tenders/fnews_pdf53.pdf",
      pdf_filename: "fnews_pdf53.pdf"
    }
  ],
  TNRSP_II: []
};

export const fallbackProgrammeLandParcels: Record<string, LandParcelItem[]> = {
  CKICP: [
    {
      id: 1,
      parcel_reference: "LP-CKICP-KCH-001",
      programme_id: 1,
      package_number: "CKICP/KCH/PKG-01",
      district: "Kancheepuram",
      taluk: "Walajabad",
      village: "Uthiramerur",
      survey_numbers_json: "[\"112/1A\", \"114/2B\", \"118/3\", \"122/1\"]",
      land_category: "PRIVATE_PATTA",
      extent_sq_meters: 48200,
      extent_hectares: 4.82,
      sec15_2_gazette_date: "2023-04-12",
      sec15_1_declaration_date: "2023-11-20",
      sec19_1_award_date: "2024-06-15",
      total_compensation_assessed_cr: 14.20,
      compensation_disbursed_cr: 12.80,
      possession_status: "PARTIAL_POSSESSION",
      has_litigation: true,
      court_case_reference: "WP No. 11420 of 2024 (Madras High Court)"
    },
    {
      id: 2,
      parcel_reference: "LP-CKICP-TRY-002",
      programme_id: 1,
      package_number: "CKICP/TRY/PKG-01",
      district: "Tiruchirappalli",
      taluk: "Srirangam",
      village: "Navalpattu",
      survey_numbers_json: "[\"45/1\", \"46/2A\", \"48/1B\"]",
      land_category: "GOVERNMENT_PORAMBOKE",
      extent_sq_meters: 35400,
      extent_hectares: 3.54,
      sec15_2_gazette_date: "2023-06-10",
      sec15_1_declaration_date: "2024-01-15",
      sec19_1_award_date: "2024-08-20",
      total_compensation_assessed_cr: 8.90,
      compensation_disbursed_cr: 8.90,
      possession_status: "FULL_POSSESSION",
      has_litigation: false
    }
  ],
  TNRSP_II: [
    {
      id: 3,
      parcel_reference: "LP-TNRSP-EPC01-01",
      programme_id: 2,
      package_number: "TNRSP-II/EPC-01",
      district: "Kancheepuram",
      taluk: "Kancheepuram",
      village: "Sevilimedu",
      survey_numbers_json: "[\"SH-116 km 12/0 - 24/0\"]",
      land_category: "PRIVATE_PATTA",
      extent_sq_meters: 14812,
      extent_hectares: 1.48,
      sec15_2_gazette_date: "2016-03-15",
      sec15_1_declaration_date: "2016-10-10",
      sec19_1_award_date: "2017-05-18",
      total_compensation_assessed_cr: 6.45,
      compensation_disbursed_cr: 6.45,
      possession_status: "FULL_POSSESSION",
      has_litigation: false
    },
    {
      id: 4,
      parcel_reference: "LP-TNRSP-EPC01-02",
      programme_id: 2,
      package_number: "TNRSP-II/EPC-01",
      district: "Chengalpattu",
      taluk: "Thiruporur",
      village: "Kalavakkam",
      survey_numbers_json: "[\"SH-58 km 24/0 - 34/5\"]",
      land_category: "PRIVATE_PATTA",
      extent_sq_meters: 40874,
      extent_hectares: 4.09,
      sec15_2_gazette_date: "2016-04-20",
      sec15_1_declaration_date: "2016-11-12",
      sec19_1_award_date: "2017-06-30",
      total_compensation_assessed_cr: 18.60,
      compensation_disbursed_cr: 18.60,
      possession_status: "FULL_POSSESSION",
      has_litigation: false
    },
    {
      id: 5,
      parcel_reference: "LP-TNRSP-EPC02-01",
      programme_id: 2,
      package_number: "TNRSP-II/EPC-02",
      district: "Ranipet",
      taluk: "Arcot",
      village: "Timiri",
      survey_numbers_json: "[\"SH-04 km 0/0 - 45/0\"]",
      land_category: "PRIVATE_PATTA",
      extent_sq_meters: 112400,
      extent_hectares: 11.24,
      sec15_2_gazette_date: "2016-02-10",
      sec15_1_declaration_date: "2016-09-05",
      sec19_1_award_date: "2017-04-12",
      total_compensation_assessed_cr: 42.30,
      compensation_disbursed_cr: 42.30,
      possession_status: "FULL_POSSESSION",
      has_litigation: false
    }
  ]
};

export const fallbackProgrammeLegalCases: Record<string, LegalCaseItem[]> = {
  CKICP: [
    {
      id: 1,
      case_number: "WP No. 11420 of 2024",
      court_name: "High Court of Judicature at Madras (Principal Seat)",
      case_type: "Writ Petition (Civil)",
      programme_id: 1,
      package_number: "CKICP/KCH/PKG-01",
      petitioner: "M. Kothandaraman & 14 Others (Landowners of Uthiramerur)",
      respondent: "State of Tamil Nadu rep. by Principal Secretary (Highways) & Special DRO (LA) CKICP",
      subject_matter: "Challenge to land acquisition valuation and prayer for realignment at km 16/200 SH-116",
      prayer_summary: "Quash Section 15(1) notification or direct payment of enhanced market value as per 2013 RFCTLARR Act.",
      interim_stay_granted: true,
      stay_order_date: "2024-07-12",
      potential_financial_exposure_cr: 12.50,
      delay_impact_months: 7,
      next_hearing_date: "2026-04-28",
      standing_counsel_name: "Additional Advocate General-IV / Special Government Pleader (Highways)",
      status: "INTERIM_STAY_ACTIVE"
    },
    {
      id: 2,
      case_number: "WA No. 892 of 2025",
      court_name: "High Court of Judicature at Madras (Madurai Bench)",
      case_type: "Writ Appeal",
      programme_id: 1,
      package_number: "CKICP/TRY/PKG-01",
      petitioner: "Project Director, CKICP",
      respondent: "S. Murugesan & Co (Contractor)",
      subject_matter: "Challenge to single bench order directing price variation index calculation using wholesale price index instead of RBI highway index.",
      prayer_summary: "Stay operation of judgment in WP(MD) No. 4512/2024 pending disposal of appeal.",
      interim_stay_granted: false,
      potential_financial_exposure_cr: 2.30,
      delay_impact_months: 2,
      next_hearing_date: "2026-05-14",
      standing_counsel_name: "Special Government Pleader (Madurai Bench)",
      status: "HEARING_SCHEDULED"
    }
  ],
  TNRSP_II: [
    {
      id: 3,
      case_number: "ARB Case No. 04 of 2023",
      court_name: "High Level Dispute Resolution / Arbitration Tribunal",
      case_type: "Arbitration Matter",
      programme_id: 2,
      package_number: "TNRSP-II/EPC-01",
      petitioner: "BSCPL Infrastructure Ltd",
      respondent: "Project Director, TNRSP-II",
      subject_matter: "Claims regarding Prolongation and Overhead Compensation due to utility shifting delay by TANGEDCO.",
      prayer_summary: "Award of ₹5.60 Cr plus interest under FIDIC Red Book Sub-clause 20.1.",
      interim_stay_granted: false,
      potential_financial_exposure_cr: 5.60,
      delay_impact_months: 0,
      next_hearing_date: "2026-06-10",
      standing_counsel_name: "Departmental Arbitrator / Law Officer (Highways)",
      status: "EVIDENCE_STAGE"
    }
  ]
};

export const fallbackProgrammeAlignments: Record<string, CorridorAlignmentItem[]> = {
  CKICP: [
    {
      id: 1,
      programme_id: 1,
      corridor_code: "CKICP-C1",
      name: "Northern Industrial Link Corridor (Kancheepuram - Chengalpattu - Cuddalore)",
      start_location: "Walajabad Junction (SH-116)",
      end_location: "Cuddalore Port Connectivity (SH-58 / SH-68)",
      districts: ["Kancheepuram", "Chengalpattu", "Villupuram", "Cuddalore"],
      total_length_km: 182.4,
      coordinates_geojson: JSON.stringify({
        type: "LineString",
        coordinates: [
          [79.8167, 12.8000], [79.9800, 12.6900], [79.5200, 12.3500], [79.6500, 11.9500], [79.7667, 11.7500]
        ]
      }),
      status: "ACTIVE"
    },
    {
      id: 2,
      programme_id: 1,
      corridor_code: "CKICP-C2",
      name: "Central-Southern Link Corridor (Trichy - Ramanathapuram - Tuticorin)",
      start_location: "Tiruchirappalli Junction",
      end_location: "VOC Port, Tuticorin",
      districts: ["Tiruchirappalli", "Pudukkottai", "Sivaganga", "Ramanathapuram", "Thoothukudi"],
      total_length_km: 248.0,
      coordinates_geojson: JSON.stringify({
        type: "LineString",
        coordinates: [
          [78.6856, 10.7905], [78.8200, 10.3800], [78.5000, 9.8500], [78.8300, 9.3700], [78.1348, 8.7642]
        ]
      }),
      status: "ACTIVE"
    }
  ],
  TNRSP_II: [
    {
      id: 3,
      programme_id: 2,
      corridor_code: "TNRSP-CRN-01",
      name: "Northern Core Road Network (Arcot - Villupuram - Vridhachalam)",
      start_location: "Arcot (SH-04)",
      end_location: "Vridhachalam (SH-70)",
      districts: ["Ranipet", "Tiruvannamalai", "Villupuram", "Cuddalore"],
      total_length_km: 147.3,
      coordinates_geojson: JSON.stringify({
        type: "LineString",
        coordinates: [
          [79.3300, 12.9000], [79.2000, 12.4500], [79.4800, 11.9400], [79.3200, 11.5200]
        ]
      }),
      status: "ACTIVE"
    },
    {
      id: 4,
      programme_id: 2,
      corridor_code: "TNRSP-CRN-02",
      name: "Western Textile Corridor (Omalur - Sankari - Erode - Tiruppur)",
      start_location: "Omalur (SH-86)",
      end_location: "Tiruppur (SH-37)",
      districts: ["Salem", "Namakkal", "Erode", "Tiruppur"],
      total_length_km: 164.8,
      coordinates_geojson: JSON.stringify({
        type: "LineString",
        coordinates: [
          [78.0400, 11.7400], [77.8700, 11.4800], [77.7200, 11.3400], [77.3411, 11.1085]
        ]
      }),
      status: "ACTIVE"
    },
    {
      id: 5,
      programme_id: 2,
      corridor_code: "TNRSP-CRN-03",
      name: "Southern Core Network (Rajapalayam - Sankarankoil - Tirunelveli - Ovari)",
      start_location: "Rajapalayam (SH-41)",
      end_location: "Ovari Coast (SH-89)",
      districts: ["Virudhunagar", "Tenkasi", "Tirunelveli"],
      total_length_km: 142.1,
      coordinates_geojson: JSON.stringify({
        type: "LineString",
        coordinates: [
          [77.5500, 9.4500], [77.5300, 9.1700], [77.7300, 8.7300], [77.8800, 8.2800]
        ]
      }),
      status: "ACTIVE"
    }
  ]
};

export const fallbackProgrammeProjects: Record<string, ProjectItem[]> = {
  CKICP: [
    {
      id: 4,
      project_code: "PRJ-CKICP-001",
      title: "CKICP Kancheepuram Corridor: Widening & Strengthening of SH-116/SH-58 km 12/0 to 34/5",
      description: "Strategic corridor implementation under CKICP with ADB multilateral financing.",
      road_type: "SH",
      estimated_cost_cr: 260.70,
      sanctioned_cost_cr: 260.70,
      expenditure_to_date_cr: 63.09,
      physical_progress_pct: 28.5,
      financial_progress_pct: 24.2,
      status: "IN_PROGRESS",
      priority: "HIGH",
      zone_id: 1,
      circle_id: 1,
      division_id: 1,
      contractor_id: 4,
      contractor_name: "Ramalingam Construction Company Pvt Ltd",
      road_name: "SH-116 & SH-58 Kancheepuram Corridor",
      created_at: "2023-01-15T00:00:00Z"
    },
    {
      id: 5,
      project_code: "PRJ-CKICP-002",
      title: "CKICP Tiruchirappalli Industrial Link: Upgradation of Regional Corridors & Grade Separators",
      description: "Strategic corridor implementation under CKICP with ADB multilateral financing.",
      road_type: "SH",
      estimated_cost_cr: 218.00,
      sanctioned_cost_cr: 218.00,
      expenditure_to_date_cr: 18.53,
      physical_progress_pct: 12.0,
      financial_progress_pct: 8.5,
      status: "TENDERED",
      priority: "HIGH",
      zone_id: 1,
      circle_id: 1,
      division_id: 1,
      road_name: "Trichy Semi-Ring Road & Regional Corridors",
      created_at: "2023-03-20T00:00:00Z"
    }
  ],
  TNRSP_II: [
    {
      id: 6,
      project_code: "PRJ-TNRSP-001",
      title: "TNRSP-II Core Road Network EPC01: Kancheepuram - Vandavasi (SH-116) and SH-58 (48.482 km)",
      description: "Strategic corridor implementation under TNRSP-II with World Bank financing.",
      road_type: "SH",
      estimated_cost_cr: 184.98,
      sanctioned_cost_cr: 184.98,
      expenditure_to_date_cr: 182.20,
      physical_progress_pct: 100.0,
      financial_progress_pct: 98.5,
      status: "COMPLETED",
      priority: "HIGH",
      zone_id: 1,
      circle_id: 1,
      division_id: 1,
      contractor_id: 5,
      contractor_name: "BSCPL Infrastructure Ltd",
      road_name: "SH-116 & SH-58",
      created_at: "2016-04-10T00:00:00Z"
    },
    {
      id: 7,
      project_code: "PRJ-TNRSP-002",
      title: "TNRSP-II Core Road Network EPC02: Arcot - Villupuram (SH-04) (83.075 km)",
      description: "Strategic corridor implementation under TNRSP-II with World Bank financing.",
      road_type: "SH",
      estimated_cost_cr: 320.02,
      sanctioned_cost_cr: 320.02,
      expenditure_to_date_cr: 320.02,
      physical_progress_pct: 100.0,
      financial_progress_pct: 100.0,
      status: "COMPLETED",
      priority: "HIGH",
      zone_id: 1,
      circle_id: 1,
      division_id: 1,
      contractor_id: 6,
      contractor_name: "NCC Limited",
      road_name: "SH-04 Arcot - Villupuram",
      created_at: "2016-06-15T00:00:00Z"
    },
    {
      id: 8,
      project_code: "PRJ-TNRSP-003",
      title: "TNRSP-II Modified DBFOT Concession PPP02: Oddanchatram - Dharapuram - Tiruppur (SH-37) (70.2 km)",
      description: "Modified DBFOT Concession under TNRSP-II with 8-year maintenance period.",
      road_type: "SH",
      estimated_cost_cr: 716.33,
      sanctioned_cost_cr: 716.33,
      expenditure_to_date_cr: 673.35,
      physical_progress_pct: 100.0,
      financial_progress_pct: 94.0,
      status: "COMPLETED",
      priority: "HIGH",
      zone_id: 1,
      circle_id: 1,
      division_id: 1,
      contractor_id: 7,
      contractor_name: "Transstroy Infrastructure Ltd",
      road_name: "SH-37 Oddanchatram - Tiruppur",
      created_at: "2016-08-01T00:00:00Z"
    }
  ]
};
