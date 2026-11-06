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
  VerifiedOrganisationStructure
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
    full_name: "Thiru Aadhav Arjuna, Minister for Public Works and Sports Development",
    role_code: 'MINISTER',
    role_name: "Minister for Public Works and Sports Development",
    department_name: 'Highways and Minor Ports Department',
    is_active: true
  },
  secretary: {
    id: 8,
    username: 'secretary',
    full_name: 'Thiru Shunchonngam Jatak Chiru, IAS, Principal Secretary to Government',
    role_code: 'PRIN_SEC',
    role_name: 'Principal Secretary to Government (Highways & Minor Ports)',
    department_name: 'Highways and Minor Ports Department',
    is_active: true
  }
};

const fallbackOrganisationStructure: VerifiedOrganisationStructure = {
  minister: {
    name: "Thiru Aadhav Arjuna",
    designation: "Minister for Public Works and Sports Development",
    portfolio: "Public Works (Buildings, Highways and Minor Ports), Sports Development",
    office: "Office of the Minister, Secretariat, Fort St. George, Chennai - 600 009",
    verification_status: "VERIFIED OFFICIAL",
    source: "G.O. / TN Portal Directory (dept_id=MTM)"
  },
  principal_secretary: {
    name: "Thiru Shunchonngam Jatak Chiru, IAS",
    designation: "Principal Secretary to Government",
    department: "Highways and Minor Ports Department",
    email: "hwaysec@tn.gov.in",
    phone: "044-25670959",
    office: "Secretariat, Fort St. George, Chennai - 600 009",
    verification_status: "VERIFIED OFFICIAL",
    source: "TN Portal Directory (dept_id=MTM)"
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

  getVerifiedOrganisationStructure: async (): Promise<VerifiedOrganisationStructure> => {
    try {
      return await request<VerifiedOrganisationStructure>('/executive/organisation/verified-structure');
    } catch {
      return fallbackOrganisationStructure;
    }
  },
};
