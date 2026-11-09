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
  ProjectStakeholderItem,
  AnomalyFindingItem,
  AnomalyActionHistoryItem,
  LeakageKPIs,
  CategorySummaryItem,
  ExposureAnalysisData,
  ProjectRiskScoreItem,
  ExecutiveAssessmentData,
  DecisionRequiredItem,
  ReportsOverviewData,
  ProgrammePerformanceItem,
  ProjectPerformanceItem,
  FinancialPerformanceData,
  SchedulePerformanceData,
  DepartmentPerformanceItem,
  ContractorPerformanceItem,
  QualityAssetPerformanceData,
  LandUtilityPerformanceData,
  AIMinisterialBriefingData,
  DecisionQueueItem,
  ReportGenerateRequest,
  ReportGenerateResponse,
  MinisterialDecisionItem,
  MinisterialDecisionUpdatePayload,
  QualitySummaryData,
  QualityInspectionItem,
  QualityFindingItem,
  MaterialTestItem,
  FieldOpsSummaryData,
  FieldInspectionItem,
  FieldIssueItem,
  AssetsSummaryData,
  InfrastructureAssetItem,
  MaintenanceWorkOrderItem,
  DepartmentOverviewData,
  DepartmentDirectoryItem,
  DepartmentCoordinationDependencyItem,
  DepartmentApprovalItem,
  DepartmentAIFindingItem,
  LandUtilityOverviewData,
  LandAcquisitionParcelItem,
  UtilityShiftingItem,
  LandUtilityMapPoint,
  DigitalOfficeOverviewData,
  CorrespondenceItem,
  GovernmentFileItem,
  FileMovementItem,
  OfficeNoteItem,
  GovernmentDecisionItem,
  DigitalOfficeMeetingItem,
  GovernmentActionItem,
  DigitalDocumentItem,
  DigitalOfficeAIFindingItem,
  GovernmentFileDetail,
  NotificationItem,
  AIPriorityBriefingItem,
  NotificationSummary,
  NotificationPreference,
  CalendarEventItem,
  TodayScheduleData,
  ConversationItem,
  MessageItem,
  ConversationAISummary,
  UnreadCountData,
  UserSearchItem,
  EntityRelationshipItem,
  RelationshipGraphData,
  UniversalSearchResultItem,
  RelationshipSuggestionItem,
  RelationshipAuditLogItem,
  CMExecutiveOverview,
  CMDirectionItem,
  DelayRootCauseAnalysis,
  CMEscalationsData,
  CMAIDailyBrief,
  JurisdictionBenchmarkItem,
  LandLitigationOverview,
  LandLitigationParcelItem,
  Parcel360Dossier,
  LitigationCaseItem,
  RevenueCoordinationItem,
  AdvocateMonitoringRecord,
  SiteBlockerItem,
  FinancialExposureDashboard,
  PreConstructionRiskAssessmentItem,
  LandLitigationResolutionActionItem,
  LandLitigationCMSummary,
  LandLitigationAIResponse,
  MajorWorksProjectItem,
  MajorWorksPortfolioOverview,
  ProjectBlockerItem,
  DelayInvestigationItem,
  LossPreventionLedgerDashboard,
  MitigationRecommendationItem,
  PreConstructionGateCheckItem,
  MajorWorksCMSummary,
  MajorWorksAIResponse
} from '../types';
import {
  SYNTHETIC_ANOMALIES,
  SYNTHETIC_PROJECTS,
  SYNTHETIC_MINISTERIAL_DECISIONS,
  getSyntheticKPIs,
  getSyntheticCategorySummary,
  getSyntheticExposureAnalysis,
  getSyntheticProjectRiskMatrix,
  getSyntheticExecutiveAssessment,
  getSyntheticDecisionsRequiringAttention,
  getSyntheticReportsOverview,
  getSyntheticProgrammePerformance,
  getSyntheticProjectPerformance,
  getSyntheticFinancialPerformance,
  getSyntheticSchedulePerformance,
  getSyntheticDepartmentPerformance,
  getSyntheticContractorPerformance,
  getSyntheticQualityAssetPerformance,
  getSyntheticLandUtilityPerformance,
  getSyntheticAIMinisterialBriefing,
  generateSyntheticMinisterialReport,
  updateSyntheticMinisterialDecision
} from '../data/syntheticHighwaysData';
import {
  fallbackLandLitigationOverview,
  fallbackLandLitigationParcels,
  fallbackLitigationCases,
  fallbackRevenueCoordination,
  fallbackAdvocateMonitoring,
  fallbackSiteBlockers,
  fallbackFinancialExposure,
  fallbackPreConstructionAssessments,
  fallbackLandLitigationResolutions,
  fallbackLandLitigationCMSummary,
  getFallbackParcel360,
  getFallbackLandLitigationAI
} from '../data/fallbackLandLitigation';
import {
  fallbackMajorWorksList,
  fallbackMajorWorksOverview,
  fallbackBlockersList,
  fallbackDelayInvestigations,
  fallbackLossPreventionLedger,
  fallbackMitigationsList,
  fallbackPreConstructionGatesList,
  fallbackMajorWorksCMSummary,
  fallbackMajorWorksAIResponse
} from '../data/fallbackMajorWorks';

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
  cm: {
    id: 99,
    username: 'cm',
    full_name: "Thiru C. Joseph Vijay, Hon'ble Chief Minister of Tamil Nadu",
    role_code: 'CHIEF_MINISTER',
    role_name: "Chief Minister of Tamil Nadu",
    department_name: "Chief Minister's Office (CMO) / Cabinet Secretariat",
    is_active: true
  },
  minister: {
    id: 7,
    username: 'minister',
    full_name: "Thiru Aadhav Arjuna, Minister for Public Works, Highways & Minor Ports",
    role_code: 'MINISTER',
    role_name: "Minister for Public Works, Highways and Minor Ports",
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
  chief_minister: {
    name: "Thiru C. Joseph Vijay",
    designation: "Hon'ble Chief Minister of Tamil Nadu",
    portfolio: "Chief Minister; Public Administration, Highways & Critical Infrastructure Monitoring",
    office: "Chief Minister's Office (CMO), Secretariat, Fort St. George, Chennai - 600 009",
    effective_date: "2026-05-10",
    verification_status: "VERIFIED OFFICIAL",
    source: "Tamil Nadu Cabinet Notification / Special Public Dept GO"
  },
  minister: {
    name: "Thiru Aadhav Arjuna",
    designation: "Minister for Public Works, Highways and Minor Ports",
    portfolio: "Highways and Minor Ports Department, Public Works",
    office: "Office of the Minister, Cabinet Secretariat, Fort St. George, Chennai - 600 009",
    effective_date: "2026-05-12",
    verification_status: "VERIFIED OFFICIAL",
    source: "G.O. Ms No. 1, Public (Special.A) Dept / Cabinet Gazette"
  },
  principal_secretary: {
    name: "Thiru Shunchonngam Jatak Chiru, IAS",
    designation: "Principal Secretary to Government",
    department: "Highways and Minor Ports Department",
    email: "hwaysec@tn.gov.in",
    phone: "044-25670959",
    office: "Secretariat, Fort St. George, Chennai - 600 009",
    effective_date: "2024-03-01",
    verification_status: "VERIFIED OFFICIAL",
    source: "G.O. Rt. No. 89, Public (Special.A) Dept / TN Portal Directory"
  },
  historical_leadership: [
    {
      name: "Thiru E.V. Velu",
      designation: "Minister for Public Works, Highways and Minor Ports",
      portfolio: "Public Works, Highways and Minor Ports",
      tenure: "2021-05-07 to 2026-05-10",
      status: "HISTORICAL OFFICEHOLDER",
      transfer_go_reference: "Cabinet Reconstitution G.O. (Ms) No. 01/2026, Public (Special.A) Dept",
      source: "Tamil Nadu Government Gazette Archive"
    }
  ],
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
    ],
    ai_project_intelligence: {
      title: "AI Project Intelligence Assessment",
      executive_summary: (
        p.id === 4 || p.project_code === 'PRJ-TN-2026-004' ?
          "This demonstration project (PRJ-TN-2026-004) faces acute schedule pressure with a critical delay of 115 days against baseline. Financial disbursements (34.2%) lead verified physical progress (22.8%), driven by mobilization advances and an unapproved non-BOQ rock variation claim of ₹9.80 Cr. Utility shifting (48 TANGEDCO 11kV electrical poles) and pending DRO land awards in Ooty Taluk constitute the primary critical path bottlenecks. AI recommends convening a multi-departmental clearance review and auditing rock variation quantities prior to releasing further payments." :
          `Project ${p.project_code} is progressing with physical progress at ${p.physical_progress_pct}% against planned ${plannedPhys}%. Schedule variance is ${delayDays} days. Inter-agency dependencies with Revenue and TANGEDCO require routine monitoring to avoid compounding delays.`
      ),
      critical_findings: [
        `Schedule variance has reached ${delayDays} days, triggering Critical Delay alert.`,
        "TANGEDCO electrical pole shifting obstructing main carriageway slope stabilization.",
        "Disputed ₹9.80 Cr non-BOQ variation claim requires Standing Finance Committee approval.",
        "Two open quality Non-Conformance Reports (NCR) awaiting field closure."
      ],
      root_cause_analysis: {
        land_acquisition: "12 parcels awaiting DRO award inquiry and statutory 19(1) gazette declaration.",
        utility_shifting: "48 overhead 11kV poles and 2 distribution transformers obstructing slope benches.",
        departmental_approvals: "Stage-II clearance pending with Forest Department; power shutdown pending with TANGEDCO.",
        contractor_performance: "Contractor slowed earthwork citing non-handover of unencumbered ROW stretches.",
        funding_and_payment: "Disbursement exceeds verified physical progress; ₹9.80 Cr variation claim withheld under audit.",
        engineering_quality: "M30 concrete honeycombing observed on breast wall; cube test records verified.",
        legal_restrictions: "Interim stay petition pending in Sub-Court regarding compensation quantum on survey parcel 14.",
        field_execution: "Heavy monsoon rains in hill terrain reduced working hours by 18 days in September-October."
      },
      recommended_actions: [
        "Convene District Level Coordination Committee under District Collector to order TANGEDCO shutdown schedule.",
        "Withhold RA Bill #3 non-BOQ items until State Technical Committee verifies rock profiling measurements.",
        "Direct Contractor to deploy secondary machinery on unencumbered chainage km 0/000 to 12/000.",
        "Instruct DRO to deposit interim land compensation into court escrow to obtain symbolic possession under Sec 19."
      ],
      decision_required: {
        reference: p.id === 4 ? "MDR-2026-001" : `MDR-${p.project_code}`,
        decision_title: "Inter-Departmental Deadlock Resolution & Contract Variation Scrutiny",
        decision_authority: "Hon'ble Minister / Principal Secretary",
        current_status: "PENDING_DECISION",
        recommended_directive: "Order joint physical survey with TANGEDCO & freeze extra item payment pending Technical Sanction revision."
      }
    },
    utility_shifting: {
      total_utilities: p.id === 4 ? 48 : 14,
      shifting_in_progress: p.id === 4 ? 32 : 8,
      completed: p.id === 4 ? 16 : 6,
      estimated_shifting_cost_cr: p.id === 4 ? 4.80 : 1.65,
      items: [
        {
          utility_type: "TANGEDCO 11kV Electrical Poles",
          department: "TANGEDCO",
          affected_chainage: "km 18/200 to 24/600",
          quantity: p.id === 4 ? 48 : 12,
          unit: "Poles",
          estimated_cost_cr: p.id === 4 ? 3.20 : 0.85,
          deposit_status: "PAID_TO_TANGEDCO",
          work_status: "PENDING_SHUTDOWN_APPROVAL",
          schedule_impact_days: p.id === 4 ? 115 : 25
        },
        {
          utility_type: "TANGEDCO 100kVA Transformers",
          department: "TANGEDCO",
          affected_chainage: "km 19/400 & km 22/800",
          quantity: 2,
          unit: "Units",
          estimated_cost_cr: 0.90,
          deposit_status: "ESTIMATE_SANCTIONED",
          work_status: "SITE_ACQUISITION_PENDING",
          schedule_impact_days: p.id === 4 ? 90 : 15
        },
        {
          utility_type: "TWAD Drinking Water Pipeline (300mm DI)",
          department: "TWAD Board",
          affected_chainage: "km 14/000 to 16/500",
          quantity: 2.5,
          unit: "km",
          estimated_cost_cr: 0.70,
          deposit_status: "JOINT_INSPECTION_COMPLETED",
          work_status: "ALIGNMENT_AGREED",
          schedule_impact_days: 30
        }
      ]
    },
    field_operations: {
      total_inspections: 18,
      verified_progress_pct: actualPhys,
      last_inspection_date: "2026-10-24",
      inspections: [
        {
          inspection_id: `INSP-${p.project_code}-01`,
          date: "2026-10-24",
          officer_name: "Er. P. Anandhan (Divisional Engineer)",
          site_location: "Chainage km 14/200 to 22/000",
          package_name: "Package EPC-01",
          work_activity: "Hill slope stabilization, breast wall construction and rock profiling",
          progress_reported_pct: Math.min(actualPhys + 1.5, 100),
          progress_verified_pct: actualPhys,
          findings: "Work halted at km 18/200 due to unshifted 11kV poles. Honeycombing observed on breast wall panel 4.",
          verified_by_geo_tag: true,
          has_photo_evidence: true,
          photo_url: "/evidence/site_inspect_ch14.jpg",
          follow_up_action: "Issue rectification notice to contractor for honeycombing; escalate pole shutdown to TANGEDCO EE."
        },
        {
          inspection_id: `INSP-${p.project_code}-02`,
          date: "2026-09-18",
          officer_name: "Er. M. Senthilkumar (Assistant Executive Engineer)",
          site_location: "Chainage km 0/000 to 12/000",
          package_name: "Package EPC-01",
          work_activity: "Granular Sub-Base (GSB) laying and compaction tests",
          progress_reported_pct: Math.max(actualPhys - 5.0, 5.0),
          progress_verified_pct: Math.max(actualPhys - 5.5, 4.5),
          findings: "GSB layer density test passed 98.4% MDD. Side drain masonry progressing satisfactorily.",
          verified_by_geo_tag: true,
          has_photo_evidence: true,
          photo_url: "/evidence/site_gsb_km10.jpg",
          follow_up_action: "Permit WMM trial stretch between km 6/0 and 8/0."
        }
      ]
    },
    assets: {
      total_assets: 8,
      road_carriageway_km: p.total_length_km || 28.5,
      bridges_count: 2,
      culverts_count: 14,
      items: [
        {
          asset_id: `AST-RD-${p.project_code}`,
          asset_type: "CARRIAGEWAY",
          name: `${p.road_name || 'Highways'} Alignment`,
          location: `km 0.0 to ${p.total_length_km || 28.5}`,
          condition: "UNDER_UPGRADATION",
          last_inspection: "2026-10-24",
          maintenance_status: "CONTRACTOR_WARRANTY_STAGE"
        },
        {
          asset_id: `AST-BRG-${p.id}-01`,
          asset_type: "HIGH_LEVEL_BRIDGE",
          name: "Major Bridge across Stream",
          location: "Chainage km 18/450",
          condition: "SUBSTRUCTURE_IN_PROGRESS",
          last_inspection: "2026-10-15",
          maintenance_status: "CONSTRUCTION_STAGE"
        },
        {
          asset_id: `AST-CUL-${p.id}-01`,
          asset_type: "BOX_CULVERT",
          name: "Double Cell RCC Box Culvert (2 x 3.0m)",
          location: "Chainage km 12/300",
          condition: "COMPLETED",
          last_inspection: "2026-09-10",
          maintenance_status: "SOUND"
        }
      ]
    },
    citizen_grievances: {
      total_grievances: 14,
      resolved_count: 9,
      pending_count: 5,
      critical_count: 1,
      items: [
        {
          grievance_id: `GRV-2026-${p.id}01`,
          category: "Drainage Obstruction & Water Stagnation",
          location: "Adjacent to Village Settlement km 14/800",
          date_received: "2026-10-02",
          petitioner_type: "Resident Association",
          assigned_officer: "Er. P. Anandhan (DE Highways)",
          status: "ACTION_IN_PROGRESS",
          resolution_target: "2026-11-15",
          resolution_details: "Contractor directed to excavate temporary bypass diversion drain during monsoon."
        },
        {
          grievance_id: `GRV-2026-${p.id}02`,
          category: "Dust Nuisance & Road Safety Signage",
          location: "School Zone km 8/200",
          date_received: "2026-09-14",
          petitioner_type: "Parent-Teacher Council",
          assigned_officer: "Er. M. Senthilkumar (AEE Highways)",
          status: "RESOLVED",
          resolution_target: "2026-09-20",
          resolution_details: "Water bowser sprinkling mandated twice daily; retro-reflective cautionary signage installed."
        }
      ]
    },
    financial_transactions: [
      {
        txn_reference: `TXN-${p.project_code}-001`,
        voucher_number: "IFHRMS-VCH-2024-912",
        package_name: "Package EPC-01",
        contractor_name: p.contractor_name || "Contractor",
        bill_date: "2024-05-10",
        bill_type: "MOBILISATION_ADVANCE",
        bill_amount_cr: Math.round(sanctioned * 0.10 * 100) / 100,
        approved_amount_cr: Math.round(sanctioned * 0.10 * 100) / 100,
        paid_amount_cr: Math.round(sanctioned * 0.10 * 100) / 100,
        payment_status: "DISBURSED",
        supporting_evidence_status: "VERIFIED_BG_HELD"
      },
      {
        txn_reference: `TXN-${p.project_code}-002`,
        voucher_number: "IFHRMS-VCH-2024-1182",
        package_name: "Package EPC-01",
        contractor_name: p.contractor_name || "Contractor",
        bill_date: "2024-11-20",
        bill_type: "RA_BILL_01",
        bill_amount_cr: Math.round(sanctioned * 0.12 * 100) / 100,
        approved_amount_cr: Math.round(sanctioned * 0.115 * 100) / 100,
        paid_amount_cr: Math.round(sanctioned * 0.115 * 100) / 100,
        payment_status: "DISBURSED",
        supporting_evidence_status: "VERIFIED_MB_BOOK"
      },
      {
        txn_reference: `TXN-${p.project_code}-003`,
        voucher_number: "IFHRMS-VCH-2025-045",
        package_name: "Package EPC-01",
        contractor_name: p.contractor_name || "Contractor",
        bill_date: "2025-06-14",
        bill_type: "RA_BILL_02",
        bill_amount_cr: Math.round(sanctioned * 0.15 * 100) / 100,
        approved_amount_cr: Math.round(sanctioned * 0.14 * 100) / 100,
        paid_amount_cr: Math.round(sanctioned * 0.14 * 100) / 100,
        payment_status: "DISBURSED",
        supporting_evidence_status: "VERIFIED_MB_BOOK"
      },
      {
        txn_reference: `TXN-${p.project_code}-004`,
        voucher_number: "IFHRMS-VCH-2025-992",
        package_name: "Package EPC-01",
        contractor_name: p.contractor_name || "Contractor",
        bill_date: "2025-10-20",
        bill_type: "RA_BILL_03",
        bill_amount_cr: p.id === 4 ? 9.80 : 6.50,
        approved_amount_cr: 0.0,
        paid_amount_cr: 0.0,
        payment_status: "HELD_UNDER_AUDIT",
        supporting_evidence_status: "VARIATION_CLAIM_UNDER_REVIEW"
      }
    ],
    actions_register: [
      {
        action_id: `ACT-${p.project_code}-01`,
        issue: "Inter-Departmental Joint Inspection for 48 TANGEDCO 11kV electrical pole relocation",
        department: "TANGEDCO / Highways",
        assigned_officer: "District Collector / Superintending Engineer (TANGEDCO)",
        priority: "CRITICAL",
        target_date: "2026-11-20",
        status: "ASSIGNED",
        remarks: "High-level coordination meeting scheduled at Collectorate."
      },
      {
        action_id: `ACT-${p.project_code}-02`,
        issue: "Expedite DRO Award enquiry for 12 revenue parcels in Taluk office",
        department: "Revenue Department",
        assigned_officer: "District Revenue Officer (DRO)",
        priority: "HIGH",
        target_date: "2026-11-28",
        status: "IN_PROGRESS",
        remarks: "Compensation determination finalized; gazette publication pending."
      },
      {
        action_id: `ACT-${p.project_code}-03`,
        issue: "Rectification of honeycombing defects in breast wall concrete at km 14/200",
        department: "Highways C&M / Quality Control Wing",
        assigned_officer: "Executive Engineer (Quality Control)",
        priority: "MEDIUM",
        target_date: "2026-11-15",
        status: "RECTIFICATION_SUBMITTED",
        remarks: "Pressure grouting methodology submitted by contractor."
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

  createProjectAction: async (projectId: number, payload: any) => {
    try {
      return await request<{ message: string; action: any }>(`/projects/${projectId}/actions`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      return {
        message: 'Action assigned successfully',
        action: {
          action_id: `ACT-${projectId}-${Date.now().toString().slice(-4)}`,
          ...payload
        }
      };
    }
  },

  createProjectQualityObservation: async (projectId: number, payload: any) => {
    try {
      return await request<{ message: string; record: any }>(`/projects/${projectId}/quality-observations`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      return {
        message: 'Quality observation recorded successfully',
        record: {
          defect_reference: `QC-${projectId}-${Date.now().toString().slice(-4)}`,
          component_type: payload.defect_type,
          description: payload.observation_notes,
          severity: payload.severity,
          status: payload.status
        }
      };
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
  },

  // -------------------------------------------------------------
  // AI Leakage & Irregularity Intelligence (Prompt 01)
  // -------------------------------------------------------------
  getLeakageKPIs: async (): Promise<LeakageKPIs> => {
    try {
      return await request<LeakageKPIs>('/leakage/kpis');
    } catch {
      return getSyntheticKPIs();
    }
  },

  getAnomalyFindings: async (filters?: {
    category?: string;
    severity?: string;
    review_status?: string;
    project_id?: number;
    programme?: string;
    district?: string;
  }): Promise<AnomalyFindingItem[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.category && filters.category !== 'ALL') q.append('category', filters.category);
      if (filters?.severity && filters.severity !== 'ALL') q.append('severity', filters.severity);
      if (filters?.review_status && filters.review_status !== 'ALL') q.append('review_status', filters.review_status);
      if (filters?.project_id) q.append('project_id', String(filters.project_id));
      if (filters?.programme && filters.programme !== 'ALL') q.append('programme', filters.programme);
      if (filters?.district && filters.district !== 'ALL') q.append('district', filters.district);
      const url = `/leakage/findings${q.toString() ? '?' + q.toString() : ''}`;
      return await request<AnomalyFindingItem[]>(url);
    } catch {
      let list = [...SYNTHETIC_ANOMALIES];
      if (filters?.category && filters.category !== 'ALL') {
        list = list.filter(a => a.category === filters.category);
      }
      if (filters?.severity && filters.severity !== 'ALL') {
        list = list.filter(a => a.severity === filters.severity);
      }
      if (filters?.review_status && filters.review_status !== 'ALL') {
        list = list.filter(a => a.review_status === filters.review_status);
      }
      if (filters?.project_id) {
        list = list.filter(a => a.project_id === filters.project_id);
      }
      if (filters?.programme && filters.programme !== 'ALL') {
        const matchingProjs = SYNTHETIC_PROJECTS.filter(p => p.programme === filters.programme).map(p => p.id);
        list = list.filter(a => matchingProjs.includes(a.project_id));
      }
      if (filters?.district && filters.district !== 'ALL') {
        const matchingProjs = SYNTHETIC_PROJECTS.filter(p => p.district === filters.district).map(p => p.id);
        list = list.filter(a => matchingProjs.includes(a.project_id));
      }
      return list as unknown as AnomalyFindingItem[];
    }
  },

  getAnomalyFindingDetail: async (id: number): Promise<AnomalyFindingItem> => {
    try {
      return await request<AnomalyFindingItem>(`/leakage/findings/${id}`);
    } catch {
      const target = SYNTHETIC_ANOMALIES.find(a => a.id === id) || SYNTHETIC_ANOMALIES[0];
      return {
        ...target,
        project_title: SYNTHETIC_PROJECTS.find(p => p.id === target.project_id)?.title || `Project ${target.project_id}`,
        actions: [
          {
            id: 1,
            finding_id: target.id,
            action_type: 'SYSTEM_DETECTION',
            actor_name: 'TN-HDOS AI Anomaly Engine',
            actor_role: 'AUTOMATED_AUDIT_SYSTEM',
            old_status: undefined,
            new_status: target.review_status,
            remarks: `Anomaly detected by rule engine (${target.detection_rule})`,
            action_details: target.corrective_action || 'Initial detection logged for departmental investigation.',
            created_at: target.created_at
          }
        ]
      } as unknown as AnomalyFindingItem;
    }
  },

  getAnomalyCategories: async (): Promise<CategorySummaryItem[]> => {
    try {
      return await request<CategorySummaryItem[]>('/leakage/categories');
    } catch {
      return getSyntheticCategorySummary();
    }
  },

  getExposureAnalysis: async (): Promise<ExposureAnalysisData> => {
    try {
      return await request<ExposureAnalysisData>('/leakage/exposure-analysis');
    } catch {
      return getSyntheticExposureAnalysis();
    }
  },

  getProjectRiskMatrix: async (): Promise<ProjectRiskScoreItem[]> => {
    try {
      return await request<ProjectRiskScoreItem[]>('/leakage/project-risk-matrix');
    } catch {
      return getSyntheticProjectRiskMatrix();
    }
  },

  getExecutiveAssessment: async (): Promise<ExecutiveAssessmentData> => {
    try {
      return await request<ExecutiveAssessmentData>('/leakage/executive-assessment');
    } catch {
      return getSyntheticExecutiveAssessment();
    }
  },

  getDecisionsRequiringAttention: async (): Promise<DecisionRequiredItem[]> => {
    try {
      return await request<DecisionRequiredItem[]>('/leakage/decisions-requiring-attention');
    } catch {
      return getSyntheticDecisionsRequiringAttention();
    }
  },

  updateAnomalyReview: async (
    id: number,
    payload: {
      review_status?: string;
      assigned_to?: string;
      review_remarks?: string;
      request_evidence_details?: string;
      corrective_action?: string;
      action_due_date?: string;
      escalate_to_secretary?: boolean;
    }
  ): Promise<AnomalyFindingItem> => {
    try {
      return await request<AnomalyFindingItem>(`/leakage/findings/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      const target = SYNTHETIC_ANOMALIES.find(a => a.id === id);
      if (target) {
        if (payload.review_status) target.review_status = payload.review_status as any;
        if (payload.assigned_to) target.assigned_to = payload.assigned_to;
        if (payload.review_remarks) target.review_remarks = payload.review_remarks;
        if (payload.corrective_action) target.corrective_action = payload.corrective_action;
        if (payload.action_due_date) target.action_due_date = payload.action_due_date;
        if (payload.escalate_to_secretary !== undefined) target.escalated_to_secretary = payload.escalate_to_secretary;
        return { ...target } as unknown as AnomalyFindingItem;
      }
      throw new Error("Finding not found");
    }
  },

  // -------------------------------------------------------------
  // Reports & AI Ministerial Decision Intelligence (Prompt 02)
  // -------------------------------------------------------------

  getReportsOverview: async (filters?: {
    programme?: string;
    district?: string;
    project_id?: number;
    department?: string;
    frequency?: string;
  }): Promise<ReportsOverviewData> => {
    try {
      const q = new URLSearchParams();
      if (filters?.programme && filters.programme !== 'ALL') q.append('programme', filters.programme);
      if (filters?.district && filters.district !== 'ALL') q.append('district', filters.district);
      if (filters?.project_id) q.append('project_id', String(filters.project_id));
      if (filters?.department && filters.department !== 'ALL') q.append('department', filters.department);
      if (filters?.frequency) q.append('frequency', filters.frequency);
      const url = `/reports/overview${q.toString() ? '?' + q.toString() : ''}`;
      return await request<ReportsOverviewData>(url);
    } catch {
      return getSyntheticReportsOverview(filters);
    }
  },

  getProgrammePerformance: async (): Promise<ProgrammePerformanceItem[]> => {
    try {
      return await request<ProgrammePerformanceItem[]>('/reports/programmes');
    } catch {
      return getSyntheticProgrammePerformance();
    }
  },

  getProjectPerformanceReport: async (filters?: {
    programme?: string;
    district?: string;
    search?: string;
    status?: string;
  }): Promise<ProjectPerformanceItem[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.programme && filters.programme !== 'ALL') q.append('programme', filters.programme);
      if (filters?.district && filters.district !== 'ALL') q.append('district', filters.district);
      if (filters?.search) q.append('search', filters.search);
      if (filters?.status && filters.status !== 'ALL') q.append('status', filters.status);
      const url = `/reports/projects${q.toString() ? '?' + q.toString() : ''}`;
      return await request<ProjectPerformanceItem[]>(url);
    } catch {
      return getSyntheticProjectPerformance(filters);
    }
  },

  getFinancialPerformanceReport: async (programme?: string): Promise<FinancialPerformanceData> => {
    try {
      const q = programme && programme !== 'ALL' ? `?programme=${encodeURIComponent(programme)}` : '';
      return await request<FinancialPerformanceData>(`/reports/financial${q}`);
    } catch {
      return getSyntheticFinancialPerformance();
    }
  },

  getSchedulePerformanceReport: async (programme?: string): Promise<SchedulePerformanceData> => {
    try {
      const q = programme && programme !== 'ALL' ? `?programme=${encodeURIComponent(programme)}` : '';
      return await request<SchedulePerformanceData>(`/reports/schedule${q}`);
    } catch {
      return getSyntheticSchedulePerformance();
    }
  },

  getDepartmentPerformanceReport: async (): Promise<DepartmentPerformanceItem[]> => {
    try {
      return await request<DepartmentPerformanceItem[]>('/reports/departments');
    } catch {
      return getSyntheticDepartmentPerformance();
    }
  },

  getContractorPerformanceReport: async (): Promise<ContractorPerformanceItem[]> => {
    try {
      return await request<ContractorPerformanceItem[]>('/reports/contractors');
    } catch {
      return getSyntheticContractorPerformance();
    }
  },

  getQualityAssetPerformanceReport: async (): Promise<QualityAssetPerformanceData> => {
    try {
      return await request<QualityAssetPerformanceData>('/reports/quality-assets');
    } catch {
      return getSyntheticQualityAssetPerformance();
    }
  },

  getLandUtilityPerformanceReport: async (): Promise<LandUtilityPerformanceData> => {
    try {
      return await request<LandUtilityPerformanceData>('/reports/land-utility');
    } catch {
      return getSyntheticLandUtilityPerformance();
    }
  },

  getAIMinisterialBriefing: async (): Promise<AIMinisterialBriefingData> => {
    try {
      return await request<AIMinisterialBriefingData>('/reports/ai-briefing');
    } catch {
      return getSyntheticAIMinisterialBriefing();
    }
  },

  generateMinisterialReport: async (req: ReportGenerateRequest): Promise<ReportGenerateResponse> => {
    try {
      return await request<ReportGenerateResponse>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify(req)
      });
    } catch {
      return generateSyntheticMinisterialReport(req);
    }
  },

  getMinisterialDecisions: async (params?: {
    status?: string;
    authority?: string;
    programme?: string;
  }): Promise<MinisterialDecisionItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      if (params?.authority && params.authority !== 'ALL') q.append('authority', params.authority);
      if (params?.programme && params.programme !== 'ALL') q.append('programme', params.programme);
      const url = `/reports/decisions${q.toString() ? '?' + q.toString() : ''}`;
      return await request<MinisterialDecisionItem[]>(url);
    } catch {
      let list = [...SYNTHETIC_MINISTERIAL_DECISIONS];
      if (params?.status && params.status !== 'ALL') {
        list = list.filter(d => d.current_status === params.status);
      }
      if (params?.authority && params.authority !== 'ALL') {
        list = list.filter(d => d.decision_authority === params.authority);
      }
      if (params?.programme && params.programme !== 'ALL') {
        list = list.filter(d => d.programme === params.programme);
      }
      return list;
    }
  },

  getMinisterialDecisionDetail: async (id: number): Promise<MinisterialDecisionItem> => {
    try {
      return await request<MinisterialDecisionItem>(`/reports/decisions/${id}`);
    } catch {
      const target = SYNTHETIC_MINISTERIAL_DECISIONS.find(d => d.id === id);
      if (!target) throw new Error("Decision record not found");
      return target;
    }
  },

  updateMinisterialDecisionAction: async (
    id: number,
    payload: MinisterialDecisionUpdatePayload
  ): Promise<MinisterialDecisionItem> => {
    try {
      return await request<MinisterialDecisionItem>(`/reports/decisions/${id}/action`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      const res = updateSyntheticMinisterialDecision(id, payload);
      if (!res) throw new Error("Decision not found");
      return res as unknown as MinisterialDecisionItem;
    }
  },

  exportReportsCsv: async (reportType: string, programme?: string): Promise<string> => {
    try {
      const token = getAuthToken();
      const q = new URLSearchParams();
      q.append('report_type', reportType);
      if (programme && programme !== 'ALL') q.append('programme', programme);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/reports/export/csv?${q.toString()}`, { headers });
      if (!res.ok) throw new Error('CSV export failed');
      return await res.text();
    } catch {
      // Fallback CSV generation
      const overview = getSyntheticReportsOverview({ programme });
      const projects = getSyntheticProjectPerformance({ programme });
      let csv = `Report: TN-HDOS Executive Performance Export\nGenerated: ${new Date().toISOString()}\nProgramme: ${programme || 'ALL'}\n`;
      csv += `Total Active Projects,${overview.total_active_projects}\n`;
      csv += `Total Project Value (Cr),${overview.total_project_value_cr}\n`;
      csv += `Total Expenditure (Cr),${overview.total_expenditure_cr}\n\n`;
      csv += `Project Code,Project Name,Programme,District,Value (Cr),Physical %,Financial %,Planned,Expected,Delay Days,Status,Contractor,Risk\n`;
      for (const p of projects) {
        csv += `"${p.project_code}","${p.project_title.replace(/"/g, '""')}","${p.programme}","${p.district}",${p.sanctioned_cost_cr},${p.physical_progress_pct},${p.financial_progress_pct},"${p.planned_completion_date}","${p.expected_completion_date}",${p.schedule_variance_days},"${p.status}","${p.contractor_name}","${p.overall_risk}"\n`;
      }
      return csv;
    }
  },

  // -----------------------------------------------------------
  // Prompt 04: Quality Intelligence APIs
  // -----------------------------------------------------------
  getQualitySummary: async (projectId?: number): Promise<QualitySummaryData> => {
    try {
      const q = projectId ? `?project_id=${projectId}` : '';
      return await request<QualitySummaryData>(`/quality/summary${q}`);
    } catch {
      return {
        kpis: {
          total_inspections: 34,
          open_quality_findings: 13,
          critical_defects: 3,
          non_conformance_reports: 25,
          corrective_actions_pending: 12,
          overdue_corrective_actions: 2,
          reinspections_pending: 4,
          quality_closure_rate_pct: 82.5
        },
        kpi_definitions: {
          total_inspections: 'Total quality audits conducted across pavement, structural and material domains.',
          open_quality_findings: 'Active defects and observations not yet closed or verified by engineers.',
          critical_defects: 'Non-conformances with potential structural integrity or road safety risk.',
          non_conformance_reports: 'Formal NCRs issued under contract quality assurance provisions.',
          corrective_actions_pending: 'Rectification plans submitted by contractors awaiting field execution.',
          overdue_corrective_actions: 'Corrective actions that have crossed stipulated target closure dates.',
          reinspections_pending: 'Rectifications completed by contractor awaiting departmental engineer verification.',
          quality_closure_rate_pct: 'Formula: (Verified + Closed Findings) / Total Findings * 100'
        },
        ai_quality_assessment: {
          overall_assessment: 'State-wide quality conformance stands at 85.0%. However, critical friction is observed on SH-15 Ooty-Gudalur Ghat Corridor where binder content deficiency (4.6% vs 5.2%) on 1.3 km stretch remains under corrective milling, and subgrade compaction failed MDD test. Immediate reinspection verification recommended.',
          critical_concerns: [
            'SH-15 Ooty Corridor: NCR-2025-041 binder content failure represents acute moisture stripping risk.',
            'Contractor PST Engineering Fictional Ltd logged 14.2% material test failure rate over 90 days.',
            '3 Bridge structural observations awaiting final Schmidt rebound hammer test certifications.'
          ],
          repeated_defect_patterns: [
            'Bituminous binder extraction variations recurring across high-altitude ghat packages.',
            'Subgrade dry density compaction below 97% MDD in rocky cut sections due to inadequate pneumatic rolling.'
          ],
          contractors_requiring_attention: [
            { name: 'KCP Infra Fictional Ltd', reason: '2 Open Critical NCRs on SH-15; variation review active' },
            { name: 'PST Engineering Fictional Ltd', reason: 'High material test failure frequency (14.2%)' }
          ],
          recommended_actions: [
            'Direct Divisional Engineer Ooty to conduct mandatory joint core sample reinspection on Km 14+200.',
            'Enforce Clause 46 financial withholding of ₹0.30 Cr on RA Bill #14 until lab clearance.',
            'Issue show-cause notice to automated batching plant operator regarding temperature monitoring.'
          ]
        },
        contractor_scorecard: [
          { contractor_id: 1, contractor_name: 'KCP Infra Fictional Ltd', contractor_class: 'Class I', inspections_count: 42, total_observations: 8, critical_observations: 2, corrective_actions_pending: 2, quality_score: 76.5, compliance_rate_pct: 75.0 },
          { contractor_id: 2, contractor_name: 'Southern Highway Builders Ltd', contractor_class: 'Class I', inspections_count: 36, total_observations: 4, critical_observations: 0, corrective_actions_pending: 1, quality_score: 91.0, compliance_rate_pct: 88.0 },
          { contractor_id: 3, contractor_name: 'PST Engineering Fictional Ltd', contractor_class: 'Class I', inspections_count: 38, total_observations: 9, critical_observations: 3, corrective_actions_pending: 3, quality_score: 68.2, compliance_rate_pct: 66.7 }
        ],
        last_updated: '07 Nov 2026, 09:30 IST'
      };
    }
  },

  getQualityInspections: async (params: any = {}): Promise<{ total: number; items: QualityInspectionItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.inspection_type && params.inspection_type !== 'ALL') q.append('inspection_type', params.inspection_type);
      if (params.severity && params.severity !== 'ALL') q.append('severity', params.severity);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: QualityInspectionItem[] }>(`/quality/inspections?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            inspection_code: 'QINSP-2026-001',
            project_id: 4,
            package_id: 1,
            inspection_date: '2026-02-04',
            inspection_type: 'Bitumen Testing',
            site_location: 'SH-15 Km 14+200 to 15+500',
            inspecting_officer: 'Dr. P. Ramanathan (Authority QA Team Leader)',
            contractor_name: 'KCP Infra Fictional Ltd',
            findings_count: 2,
            severity: 'CRITICAL',
            status: 'REINSPECTION_PENDING',
            findings_summary: 'Bituminous Concrete surface course test failed binder percentage requirement. NCR-2025-041 issued.'
          },
          {
            id: 2,
            inspection_code: 'QINSP-2026-002',
            project_id: 4,
            package_id: 1,
            inspection_date: '2026-01-20',
            inspection_type: 'Pavement Quality',
            site_location: 'SH-15 Km 21+200 to 22+000',
            inspecting_officer: 'Er. K. Balaji (HRS Field Specialist)',
            contractor_name: 'KCP Infra Fictional Ltd',
            findings_count: 1,
            severity: 'CRITICAL',
            status: 'COMPLETED',
            findings_summary: 'Subgrade dry density compaction observed at 93.8% MDD vs specification >=97%. NCR-2025-042 issued.'
          }
        ]
      };
    }
  },

  getQualityFindings: async (params: any = {}): Promise<{ total: number; items: QualityFindingItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.is_ncr !== undefined) q.append('is_ncr', String(params.is_ncr));
      if (params.severity && params.severity !== 'ALL') q.append('severity', params.severity);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: QualityFindingItem[] }>(`/quality/defects?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            finding_code: 'NCR-2025-041',
            project_id: 4,
            package_id: 1,
            asset_id: 1,
            inspection_id: 1,
            defect_category: 'Bituminous Concrete (BC)',
            description: 'Binder content in surface course between Km 14+000 and 15+500 sampled at 4.6% vs specification of 5.2%. Core samples failed Marshall stability criteria.',
            severity: 'CRITICAL',
            status: 'CORRECTIVE_ACTION_PENDING',
            identified_date: '2026-02-04',
            contractor_name: 'KCP Infra Fictional Ltd',
            contractor_response: 'Contractor attributes binder variation to automated batching plant sensor malfunction at Ooty mix unit.',
            corrective_action: 'Milling of affected 1.3 km layer and re-laying Dense Bituminous Macadam using calibrated batching plant under AEE supervision.',
            target_closure_date: '2026-03-15',
            reinspection_date: '2026-03-18',
            reinspection_officer: 'Dr. P. Ramanathan (Authority QA Lead)',
            reinspection_notes: 'Reinspection scheduled upon receipt of contractor readiness compliance certificate.',
            is_ncr: true,
            penalty_cr: 0.20
          },
          {
            id: 2,
            finding_code: 'NCR-2025-042',
            project_id: 4,
            package_id: 1,
            asset_id: 1,
            inspection_id: 2,
            defect_category: 'Subgrade & Embankment',
            description: 'Dry density compaction between Km 21+200 and 22+000 tested at 93.8% MDD (standard MoRTH requirement >=97%).',
            severity: 'CRITICAL',
            status: 'RECTIFICATION_IN_PROGRESS',
            identified_date: '2026-01-20',
            contractor_name: 'KCP Infra Fictional Ltd',
            contractor_response: 'Contractor deployed additional 12-ton vibratory roller with pneumatic tyred roller for re-compaction.',
            corrective_action: 'Moisture conditioning and re-rolling of subgrade layer in 200mm lifts until achieving 97.5% MDD field density.',
            target_closure_date: '2026-03-10',
            reinspection_date: '2026-03-12',
            reinspection_officer: 'Er. R. Venkatesh (AEE)',
            reinspection_notes: 'Preliminary sand cone test indicated 96.8% MDD; final core clearance pending.',
            is_ncr: true,
            penalty_cr: 0.10
          }
        ]
      };
    }
  },

  updateQualityDefectAction: async (defectId: number, payload: any): Promise<any> => {
    return await request<any>(`/quality/defects/${defectId}/action`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMaterialTests: async (params: any = {}): Promise<{ total: number; items: MaterialTestItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.material_type && params.material_type !== 'ALL') q.append('material_type', params.material_type);
      if (params.result_status && params.result_status !== 'ALL') q.append('result_status', params.result_status);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: MaterialTestItem[] }>(`/quality/material-tests?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            test_ref: 'MAT-2026-001',
            material_type: 'Bitumen',
            sample_date: '2026-02-04',
            project_id: 4,
            package_id: 1,
            laboratory_name: 'HRS Regional Lab, Coimbatore',
            test_parameter: 'Bitumen Binder Extraction (ASTM D2172)',
            measured_result: '4.62% by weight of mix',
            reference_limit: '5.20% ± 0.3% (IRC:111-2009)',
            result_status: 'FAILED',
            report_file_name: 'HRS_CBE_Report_2026_014.pdf'
          },
          {
            id: 2,
            test_ref: 'MAT-2026-002',
            material_type: 'Concrete',
            sample_date: '2026-01-22',
            project_id: 4,
            package_id: 1,
            laboratory_name: 'Highways Research Station (HRS), Guindy',
            test_parameter: '28-Day Compressive Strength (M-40)',
            measured_result: '44.2 N/mm²',
            reference_limit: 'Min 40.0 N/mm²',
            result_status: 'PASSED',
            report_file_name: 'HRS_Guindy_Concrete_442.pdf'
          }
        ]
      };
    }
  },

  // -----------------------------------------------------------
  // Prompt 04: Field Operations Intelligence APIs
  // -----------------------------------------------------------
  getFieldOpsSummary: async (projectId?: number): Promise<FieldOpsSummaryData> => {
    try {
      const q = projectId ? `?project_id=${projectId}` : '';
      return await request<FieldOpsSummaryData>(`/field-ops/summary${q}`);
    } catch {
      return {
        kpis: {
          total_site_inspections: 50,
          inspections_completed: 38,
          inspections_scheduled: 8,
          overdue_inspections: 4,
          open_field_issues: 14,
          critical_field_issues: 3,
          progress_updates_submitted: 42,
          verification_pending: 6
        },
        kpi_definitions: {
          total_site_inspections: 'Total documented physical site visits by engineering officers and consultants.',
          inspections_completed: 'Visits completed with geo-tagged observation logs and photo evidence.',
          inspections_scheduled: 'Mandatory milestone and quality audits programmed in the digital calendar.',
          overdue_inspections: 'Scheduled visits not logged within 7 days of stipulated target date.',
          open_field_issues: 'Active site obstructions, safety findings, or workmanship impediments.',
          critical_field_issues: 'Field issues directly blocking critical path milestones or public traffic.',
          progress_updates_submitted: 'Contractor measurement submissions awaiting engineer verification.',
          verification_pending: 'Inspections requiring departmental engineer re-audit or joint cross-check.'
        },
        ai_field_intelligence: {
          overall_execution_status: 'Field progress monitoring reveals strong overall activity (50 logged visits across state). However, a significant divergence of 14.0% was detected on SH-15 Ooty Ghat Corridor (68.0% contractor claimed vs 54.0% verified by AEE), alongside 48 unshifted TANGEDCO electrical poles halting earthworks.',
          divergence_alerts: [
            {
              project_code: 'PRJ-CKICP-001',
              project_name: 'SH-15 Ooty-Gudalur Ghat Corridor',
              package: 'PKG-EPC-01',
              reported_progress: 68.0,
              verified_progress: 54.0,
              gap_pct: 14.0,
              status: 'FLAGGED_FOR_CURTAILMENT'
            }
          ],
          repeated_observations: [
            'Temporary drainage absence along excavated slope cuts triggering shoulder scouring.',
            'Inadequate flaggers and safety delineation at sharp ghat curves during blasting hours.'
          ],
          recommended_actions: [
            'Schedule joint inspection between AEE (Highways) and TANGEDCO SE on SH-15 corridor.',
            'Enforce measurement book curtailment to 54.0% physical progress on RA Bill #14.',
            'Mandate weekly drone-based volumetric excavation audits for rock cutting stretches.'
          ]
        },
        last_updated: '07 Nov 2026, 09:30 IST'
      };
    }
  },

  getFieldInspections: async (params: any = {}): Promise<{ total: number; items: FieldInspectionItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.severity && params.severity !== 'ALL') q.append('severity', params.severity);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: FieldInspectionItem[] }>(`/field-ops/inspections?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            inspection_code: 'INSP-2026-001',
            project_id: 4,
            package_id: 1,
            officer_name: 'Er. R. Venkatesh',
            officer_designation: 'Assistant Executive Engineer',
            contractor_name: 'KCP Infra Fictional Ltd',
            inspection_date: '2026-02-04',
            site_location: 'SH-15 Km 14+200 to 18+000 (Pykara stretch)',
            work_activity: 'Dense Bituminous Macadam (DBM) Surface Course Compaction',
            progress_reported_pct: 68.0,
            progress_verified_pct: 54.0,
            findings_summary: 'Observed binder segregation and temperature drop at paver screed. Core samples extracted at Km 14+600 and 15+200 for laboratory bitumen content test.',
            severity: 'CRITICAL',
            status: 'FOLLOWUP_REQUIRED',
            geo_lat: 11.4124,
            geo_lng: 76.6958,
            photos_count: 4,
            follow_up_action: 'Await HRS Coimbatore lab report; withhold certification of RA Bill #14 item 4.2 pending binder quality clearance.',
            follow_up_date: '2026-02-15'
          },
          {
            id: 2,
            inspection_code: 'INSP-2026-002',
            project_id: 4,
            package_id: 1,
            officer_name: 'Tmt. M. Kalaiselvi',
            officer_designation: 'Divisional Engineer (Highways)',
            contractor_name: 'KCP Infra Fictional Ltd',
            inspection_date: '2026-01-22',
            site_location: 'SH-15 Km 4+800 Minor Bridge Abutment #1',
            work_activity: 'RCC Pier Cap Reinforcement & Concrete Pouring',
            progress_reported_pct: 75.0,
            progress_verified_pct: 75.0,
            findings_summary: 'Rebar placement and cover blocks verified as per drawing #CKICP/BR/44. Concrete 7-day cube strength satisfied 28 N/mm².',
            severity: 'LOW',
            status: 'COMPLETED',
            geo_lat: 11.4310,
            geo_lng: 76.7120,
            photos_count: 3,
            follow_up_action: 'Authorise staging removal and proceed with girder pre-stressing preparation.',
            follow_up_date: '2026-02-10'
          }
        ]
      };
    }
  },

  scheduleFieldInspection: async (payload: any): Promise<any> => {
    return await request<any>('/field-ops/schedule', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getFieldIssues: async (params: any = {}): Promise<{ total: number; items: FieldIssueItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.category && params.category !== 'ALL') q.append('category', params.category);
      if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: FieldIssueItem[] }>(`/field-ops/issues?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            issue_code: 'FISS-2026-001',
            project_id: 4,
            package_id: 1,
            category: 'Road Damage',
            description: 'Surface cracking and aggregate ravelling observed on freshly laid DBM between Km 14+200 and 15+500 following light rain.',
            location: 'SH-15 Km 14+400',
            reported_date: '2026-02-04',
            assigned_officer: 'Er. R. Venkatesh (AEE)',
            assigned_department: 'Highways Department',
            status: 'UNDER_INVESTIGATION',
            priority: 'CRITICAL',
            resolution_target: '2026-02-28',
            resolution_notes: 'Contractor served notice to submit core test analysis and joint rectification methodology.'
          },
          {
            id: 2,
            issue_code: 'FISS-2026-002',
            project_id: 4,
            package_id: 1,
            category: 'Utility Obstruction',
            description: '48 TANGEDCO 11kV electrical poles remaining unshifted along ghat carriage edge between Km 4+200 and 12+800.',
            location: 'SH-15 Km 4/0 to 12/0',
            reported_date: '2026-01-15',
            assigned_officer: 'Superintending Engineer, TANGEDCO Nilgiris EDC',
            assigned_department: 'TANGEDCO',
            status: 'DEPARTMENT_ACTION_REQUIRED',
            priority: 'CRITICAL',
            resolution_target: '2026-03-10',
            resolution_notes: 'Power shutdown schedule awaited from Gudalur 66kV substation.'
          }
        ]
      };
    }
  },

  updateFieldIssueStatus: async (issueId: number, payload: any): Promise<any> => {
    return await request<any>(`/field-ops/issues/${issueId}/status`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getFieldOpsMapLocations: async (): Promise<{ points: any[] }> => {
    try {
      return await request<{ points: any[] }>('/field-ops/map-locations');
    } catch {
      return {
        points: [
          { type: 'INSPECTION', id: 1, code: 'INSP-2026-001', title: 'Dense Bituminous Macadam Laying', location: 'SH-15 Km 14+200 (Pykara)', lat: 11.4124, lng: 76.6958, severity: 'CRITICAL', status: 'FOLLOWUP_REQUIRED', officer: 'Er. R. Venkatesh', verified_progress: 54.0 },
          { type: 'ASSET', id: 1, code: 'AST-PVM-01', title: 'Flexible Pavement Section', location: 'Nilgiris • Km 0/0 to 14/0', lat: 11.4250, lng: 76.7020, severity: 'CRITICAL', status: 'Fair', officer: 'Highways C&M Ooty', verified_progress: 71.5 },
          { type: 'INSPECTION', id: 2, code: 'INSP-2026-002', title: 'Bridge Pier Reinforcement', location: 'SH-15 Km 4+800', lat: 11.4310, lng: 76.7120, severity: 'LOW', status: 'COMPLETED', officer: 'Tmt. M. Kalaiselvi', verified_progress: 75.0 }
        ]
      };
    }
  },

  // -----------------------------------------------------------
  // Prompt 04: Asset Management Intelligence APIs
  // -----------------------------------------------------------
  getAssetsSummary: async (district?: string, assetType?: string): Promise<AssetsSummaryData> => {
    try {
      const q = new URLSearchParams();
      if (district && district !== 'ALL') q.append('district', district);
      if (assetType && assetType !== 'ALL') q.append('asset_type', assetType);
      return await request<AssetsSummaryData>(`/assets/summary?${q.toString()}`);
    } catch {
      return {
        kpis: {
          total_assets: 40,
          roads_km: 1284.6,
          bridges_count: 8,
          culverts_count: 16,
          assets_requiring_inspection: 6,
          assets_requiring_maintenance: 8,
          critical_asset_conditions: 4,
          overdue_maintenance_activities: 3
        },
        condition_distribution: {
          Good: 22,
          Fair: 12,
          Poor: 4,
          Critical: 2,
          'Not Assessed': 0
        },
        ai_asset_intelligence: {
          overall_health_statement: 'State-wide Highway Asset Condition Index averages 78.4 (Fair to Good). Key attention required on Asset AST-PVM-01 (SH-15 Flexible Pavement) where binder deficiency has lowered PCI to 71.5, triggering corrective maintenance order MNT-2026-004. In addition, 1 river bridge foundation is overdue for underwater scour check.',
          health_alerts: [
            {
              asset_code: 'AST-PVM-01',
              asset_name: 'SH-15 Flexible Pavement Stretch Km 0/0 to 14/0',
              current_condition: 'Fair (PCI 71.5)',
              trigger_event: 'Failed binder content test MAT-2026-014 (4.6% vs 5.2%)',
              action_required: 'Milling and surface replacement under work order MNT-2026-004'
            },
            {
              asset_code: 'AST-BR-03',
              asset_name: 'Bhavani River High-Level Bridge',
              current_condition: 'Inspection Due (14 Months Lag)',
              trigger_event: 'Annual monsoon underwater scour inspection overdue',
              action_required: 'Deploy HRS Guindy specialised bridge diving team'
            }
          ],
          preventive_maintenance_candidates: [
            '12 Cross-drainage culverts in Tiruppur division require pre-monsoon desilting.',
            'Reinforced Earth retaining wall at Km 24+100 requires inclinometer settlement monitoring.'
          ],
          recommended_actions: [
            'Approve preventive desilting work orders under CRIDP annual maintenance head.',
            'Schedule joint inspection for AST-PVM-01 upon contractor milling completion.',
            'Install automated solar blinkers on 2.4 km unshielded embankment stretch.'
          ]
        },
        last_updated: '07 Nov 2026, 09:30 IST'
      };
    }
  },

  getAssetsList: async (params: any = {}): Promise<{ total: number; items: InfrastructureAssetItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.asset_type && params.asset_type !== 'ALL') q.append('asset_type', params.asset_type);
      if (params.condition && params.condition !== 'ALL') q.append('condition', params.condition);
      if (params.district && params.district !== 'ALL') q.append('district', params.district);
      if (params.project_id) q.append('project_id', String(params.project_id));
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: InfrastructureAssetItem[] }>(`/assets/items?${q.toString()}`);
    } catch {
      return {
        total: 2,
        items: [
          {
            id: 1,
            asset_code: 'AST-PVM-01',
            asset_name: 'SH-15 Flexible Pavement Stretch Km 0/0 to 14/0',
            asset_type: 'Roads',
            project_id: 4,
            package_id: 1,
            district: 'Nilgiris',
            location_chainage: 'Km 0/0 to 14/0',
            completion_date: '2024-11-20',
            condition: 'Fair',
            pci_score: 71.5,
            last_inspection_date: '2026-02-04',
            next_inspection_date: '2026-03-15',
            maintenance_status: 'Inspection Due',
            responsible_authority: 'Highways C&M Ooty Division',
            replacement_value_cr: 28.50
          },
          {
            id: 2,
            asset_code: 'AST-BR-01',
            asset_name: 'Pykara Tributary High-Level Bridge (2x24m Spans)',
            asset_type: 'Bridges',
            project_id: 4,
            package_id: 1,
            district: 'Nilgiris',
            location_chainage: 'Km 14+800',
            condition: 'Good',
            pci_score: 88.0,
            last_inspection_date: '2026-01-22',
            next_inspection_date: '2026-04-15',
            maintenance_status: 'Under Construction',
            responsible_authority: 'CKICP PIU Coimbatore',
            replacement_value_cr: 14.20
          }
        ]
      };
    }
  },

  getAssetDetail: async (assetId: number): Promise<any> => {
    return await request<any>(`/assets/items/${assetId}`);
  },

  updateAssetCondition: async (assetId: number, payload: any): Promise<any> => {
    return await request<any>(`/assets/items/${assetId}/condition`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMaintenanceOrders: async (params: any = {}): Promise<{ total: number; items: MaintenanceWorkOrderItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params.asset_id) q.append('asset_id', String(params.asset_id));
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
      if (params.search) q.append('search', params.search);
      return await request<{ total: number; items: MaintenanceWorkOrderItem[] }>(`/assets/maintenance-orders?${q.toString()}`);
    } catch {
      return {
        total: 1,
        items: [
          {
            id: 1,
            work_order_code: 'MNT-2026-001',
            asset_id: 1,
            project_id: 4,
            maintenance_type: 'Corrective',
            description: 'Milling and replacement of 1.3 km bitumen surface course (Km 14+200 to 15+500) following failed binder test MAT-2026-001.',
            priority: 'CRITICAL',
            estimated_cost_cr: 0.45,
            assigned_contractor: 'KCP Infra Fictional Ltd',
            assigned_engineer: 'Er. R. Venkatesh (AEE)',
            scheduled_date: '2026-02-15',
            status: 'IN_PROGRESS',
            inspection_verified: false,
            remarks: 'Contractor ordered to rectify at own cost under Clause 46 Defect Rectification without billing department.'
          }
        ]
      };
    }
  },

  createMaintenanceOrder: async (payload: any): Promise<any> => {
    return await request<any>('/assets/maintenance-orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateMaintenanceOrderStatus: async (orderId: number, payload: any): Promise<any> => {
    return await request<any>(`/assets/maintenance-orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // -----------------------------------------------------------
  // Prompt 05: Departmental Coordination & Land/Utility APIs
  // -----------------------------------------------------------
  getDepartmentOverview: async (projectId?: number): Promise<DepartmentOverviewData> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<DepartmentOverviewData>(`/departments/overview${q}`);
  },

  getDepartmentDirectory: async (category?: string, search?: string): Promise<DepartmentDirectoryItem[]> => {
    const q = new URLSearchParams();
    if (category && category !== 'ALL') q.append('category', category);
    if (search) q.append('search', search);
    return await request<DepartmentDirectoryItem[]>(`/departments/directory?${q.toString()}`);
  },

  getDepartmentDependencies: async (params: any = {}): Promise<DepartmentCoordinationDependencyItem[]> => {
    const q = new URLSearchParams();
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.criticality && params.criticality !== 'ALL') q.append('criticality', params.criticality);
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.escalation_level && params.escalation_level !== 'ALL') q.append('escalation_level', params.escalation_level);
    if (params.target_dept_id) q.append('target_dept_id', String(params.target_dept_id));
    if (params.search) q.append('search', params.search);
    return await request<DepartmentCoordinationDependencyItem[]>(`/departments/dependencies?${q.toString()}`);
  },

  updateDepartmentDependencyAction: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/departments/dependencies/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getDepartmentApprovals: async (params: any = {}): Promise<DepartmentApprovalItem[]> => {
    const q = new URLSearchParams();
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.sla_status && params.sla_status !== 'ALL') q.append('sla_status', params.sla_status);
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.approving_dept_id) q.append('approving_dept_id', String(params.approving_dept_id));
    if (params.search) q.append('search', params.search);
    return await request<DepartmentApprovalItem[]>(`/departments/approvals?${q.toString()}`);
  },

  updateDepartmentApprovalAction: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/departments/approvals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getDepartmentAIIntelligence: async (projectId?: number): Promise<{ items: DepartmentAIFindingItem[]; total: number }> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<{ items: DepartmentAIFindingItem[]; total: number }>(`/departments/ai-intelligence${q}`);
  },

  getLandUtilityOverview: async (projectId?: number): Promise<LandUtilityOverviewData> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<LandUtilityOverviewData>(`/land-utility/overview${q}`);
  },

  getLandParcels: async (params: any = {}): Promise<LandAcquisitionParcelItem[]> => {
    const q = new URLSearchParams();
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.district && params.district !== 'ALL') q.append('district', params.district);
    if (params.stage && params.stage !== 'ALL') q.append('stage', params.stage);
    if (params.compensation_status && params.compensation_status !== 'ALL') q.append('compensation_status', params.compensation_status);
    if (params.possession_status && params.possession_status !== 'ALL') q.append('possession_status', params.possession_status);
    if (params.has_litigation !== undefined) q.append('has_litigation', String(params.has_litigation));
    if (params.is_blocking !== undefined) q.append('is_blocking', String(params.is_blocking));
    if (params.search) q.append('search', params.search);
    return await request<LandAcquisitionParcelItem[]>(`/land-utility/parcels?${q.toString()}`);
  },

  getLandParcelDetail: async (id: number): Promise<any> => {
    return await request<any>(`/land-utility/parcels/${id}`);
  },

  updateLandParcelWorkflow: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/land-utility/parcels/${id}/workflow`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getUtilityShiftings: async (params: any = {}): Promise<UtilityShiftingItem[]> => {
    const q = new URLSearchParams();
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.owning_agency && params.owning_agency !== 'ALL') q.append('owning_agency', params.owning_agency);
    if (params.work_order_status && params.work_order_status !== 'ALL') q.append('work_order_status', params.work_order_status);
    if (params.verification_status && params.verification_status !== 'ALL') q.append('verification_status', params.verification_status);
    if (params.is_blocking !== undefined) q.append('is_blocking', String(params.is_blocking));
    if (params.search) q.append('search', params.search);
    return await request<UtilityShiftingItem[]>(`/land-utility/utilities?${q.toString()}`);
  },

  updateUtilityWorkflow: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/land-utility/utilities/${id}/workflow`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getLandUtilityMapLocations: async (projectId?: number): Promise<LandUtilityMapPoint[]> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<LandUtilityMapPoint[]>(`/land-utility/gis/locations${q}`);
  },

  getLandUtilityAIIntelligence: async (projectId?: number): Promise<{ items: DepartmentAIFindingItem[]; total: number }> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<{ items: DepartmentAIFindingItem[]; total: number }>(`/land-utility/ai-intelligence${q}`);
  },

  // ============================================================================
  // DIGITAL OFFICE, E-FILE MANAGEMENT & GOVERNMENT WORKFLOW INTELLIGENCE
  // ============================================================================

  getDigitalOfficeOverview: async (projectId?: number, departmentId?: number): Promise<DigitalOfficeOverviewData> => {
    const q = new URLSearchParams();
    if (projectId) q.append('project_id', String(projectId));
    if (departmentId) q.append('department_id', String(departmentId));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<DigitalOfficeOverviewData>(`/digital-office/overview${qs}`);
  },

  getCorrespondence: async (params: any = {}): Promise<CorrespondenceItem[]> => {
    const q = new URLSearchParams();
    if (params.type && params.type !== 'ALL') q.append('type', params.type);
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.department_id) q.append('department_id', String(params.department_id));
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<CorrespondenceItem[]>(`/digital-office/correspondence${qs}`);
  },

  createCorrespondence: async (payload: any): Promise<any> => {
    return await request<any>('/digital-office/correspondence', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getGovernmentFiles: async (params: any = {}): Promise<GovernmentFileItem[]> => {
    const q = new URLSearchParams();
    if (params.stage && params.stage !== 'ALL') q.append('stage', params.stage);
    if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.is_closed !== undefined) q.append('is_closed', String(params.is_closed));
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<GovernmentFileItem[]>(`/digital-office/files${qs}`);
  },

  getGovernmentFileDetail: async (id: number): Promise<GovernmentFileDetail> => {
    return await request<GovernmentFileDetail>(`/digital-office/files/${id}`);
  },

  addFileMovement: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/digital-office/files/${id}/movement`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  submitOfficeNote: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/digital-office/files/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  advanceFileWorkflow: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/digital-office/files/${id}/workflow`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getGovernmentDecisions: async (params: any = {}): Promise<GovernmentDecisionItem[]> => {
    const q = new URLSearchParams();
    if (params.authority && params.authority !== 'ALL') q.append('authority', params.authority);
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<GovernmentDecisionItem[]>(`/digital-office/decisions${qs}`);
  },

  getDigitalOfficeMeetings: async (category?: string): Promise<DigitalOfficeMeetingItem[]> => {
    const q = category && category !== 'ALL' ? `?category=${category}` : '';
    return await request<DigitalOfficeMeetingItem[]>(`/digital-office/meetings${q}`);
  },

  getGovernmentActionItems: async (params: any = {}): Promise<GovernmentActionItem[]> => {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'ALL') q.append('status', params.status);
    if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
    if (params.escalation_level && params.escalation_level !== 'ALL') q.append('escalation_level', params.escalation_level);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<GovernmentActionItem[]>(`/digital-office/actions${qs}`);
  },

  updateGovernmentActionItem: async (id: number, payload: any): Promise<any> => {
    return await request<any>(`/digital-office/actions/${id}/update`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getDigitalDocuments: async (params: any = {}): Promise<DigitalDocumentItem[]> => {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<DigitalDocumentItem[]>(`/digital-office/documents${qs}`);
  },

  getDigitalOfficeAIIntelligence: async (projectId?: number): Promise<{ items: DigitalOfficeAIFindingItem[]; total: number; ai_notice: string }> => {
    const q = projectId ? `?project_id=${projectId}` : '';
    return await request<{ items: DigitalOfficeAIFindingItem[]; total: number; ai_notice: string }>(`/digital-office/ai-intelligence${q}`);
  },

  // ============================================================================
  // NOTIFICATIONS, ROLE-BASED ALERTS & UNIFIED CALENDAR
  // ============================================================================

  getNotifications: async (params: {
    category?: string;
    priority?: string;
    is_read?: boolean;
    is_saved?: boolean;
    project_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<NotificationItem[]> => {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
    if (params.is_read !== undefined) q.append('is_read', String(params.is_read));
    if (params.is_saved !== undefined) q.append('is_saved', String(params.is_saved));
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.search) q.append('search', params.search);
    if (params.limit) q.append('limit', String(params.limit));
    if (params.offset) q.append('offset', String(params.offset));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<NotificationItem[]>(`/notifications${qs}`);
  },

  getNotificationSummary: async (): Promise<NotificationSummary> => {
    return await request<NotificationSummary>('/notifications/summary');
  },

  getAIPriorityBriefing: async (): Promise<AIPriorityBriefingItem[]> => {
    return await request<AIPriorityBriefingItem[]>('/notifications/ai-priority-briefing');
  },

  markNotificationRead: async (id: number): Promise<{ status: string; id: number; is_read: boolean }> => {
    return await request<{ status: string; id: number; is_read: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
  },

  markNotificationUnread: async (id: number): Promise<{ status: string; id: number; is_read: boolean }> => {
    return await request<{ status: string; id: number; is_read: boolean }>(`/notifications/${id}/unread`, { method: 'POST' });
  },

  toggleSaveNotification: async (id: number): Promise<{ status: string; id: number; is_saved: boolean }> => {
    return await request<{ status: string; id: number; is_saved: boolean }>(`/notifications/${id}/save`, { method: 'POST' });
  },

  acknowledgeNotification: async (id: number): Promise<{ status: string; id: number; is_acknowledged: boolean }> => {
    return await request<{ status: string; id: number; is_acknowledged: boolean }>(`/notifications/${id}/acknowledge`, { method: 'POST' });
  },

  addNotificationToCalendar: async (id: number): Promise<{ status: string; event_code: string; notification_id: number }> => {
    return await request<{ status: string; event_code: string; notification_id: number }>(`/notifications/${id}/add-to-calendar`, { method: 'POST' });
  },

  markAllNotificationsRead: async (): Promise<{ status: string; message: string }> => {
    return await request<{ status: string; message: string }>('/notifications/mark-all-read', { method: 'POST' });
  },

  getNotificationPreferences: async (): Promise<NotificationPreference> => {
    return await request<NotificationPreference>('/notifications/preferences');
  },

  updateNotificationPreferences: async (payload: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    return await request<NotificationPreference>('/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getCalendarEvents: async (params: {
    category?: string;
    priority?: string;
    project_id?: number;
    department?: string;
    my_calendar?: boolean;
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}): Promise<CalendarEventItem[]> => {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'ALL') q.append('category', params.category);
    if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.department) q.append('department', params.department);
    if (params.my_calendar) q.append('my_calendar', 'true');
    if (params.start_date) q.append('start_date', params.start_date);
    if (params.end_date) q.append('end_date', params.end_date);
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<CalendarEventItem[]>(`/calendar/events${qs}`);
  },

  getCalendarEventDetail: async (id: number): Promise<CalendarEventItem> => {
    return await request<CalendarEventItem>(`/calendar/events/${id}`);
  },

  createCalendarEvent: async (payload: any): Promise<CalendarEventItem> => {
    return await request<CalendarEventItem>('/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  updateEventRSVP: async (id: number, status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE', notes?: string): Promise<any> => {
    const q = new URLSearchParams({ status_choice: status });
    if (notes) q.append('notes', notes);
    return await request<any>(`/calendar/events/${id}/rsvp?${q.toString()}`, { method: 'POST' });
  },

  recordMeetingMinutes: async (id: number, payload: {
    minutes_of_meeting: string;
    decisions_summary?: string;
    status?: string;
    action_items?: any[];
  }): Promise<CalendarEventItem> => {
    return await request<CalendarEventItem>(`/calendar/events/${id}/minutes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getTodaySchedule: async (): Promise<TodayScheduleData> => {
    return await request<TodayScheduleData>('/calendar/today-schedule');
  },

  // ============================================================================
  // ONE-TO-ONE MESSAGING, GROUP CHAT & DISCUSSION INTELLIGENCE
  // ============================================================================

  getConversations: async (params: {
    tab?: string;
    project_id?: number;
    search?: string;
  } = {}): Promise<ConversationItem[]> => {
    const q = new URLSearchParams();
    if (params.tab && params.tab !== 'ALL') q.append('tab', params.tab);
    if (params.project_id) q.append('project_id', String(params.project_id));
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<ConversationItem[]>(`/messaging/conversations${qs}`);
  },

  getConversationDetail: async (id: number): Promise<ConversationItem> => {
    return await request<ConversationItem>(`/messaging/conversations/${id}`);
  },

  createConversation: async (payload: {
    conversation_type: string;
    title: string;
    description?: string;
    category?: string;
    related_project_id?: number;
    related_record_type?: string;
    related_record_id?: string;
    participant_user_ids: number[];
  }): Promise<ConversationItem> => {
    return await request<ConversationItem>('/messaging/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getConversationMessages: async (conversationId: number, limit: number = 50, offset: number = 0): Promise<MessageItem[]> => {
    return await request<MessageItem[]>(`/messaging/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  sendMessage: async (conversationId: number, payload: {
    content: string;
    message_type?: string;
    reply_to_message_id?: number;
    priority?: string;
    related_entity_type?: string;
    related_entity_id?: string;
    attachments?: any[];
  }): Promise<MessageItem> => {
    return await request<MessageItem>(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  editMessage: async (messageId: number, content: string): Promise<MessageItem> => {
    return await request<MessageItem>(`/messaging/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  },

  deleteMessage: async (messageId: number): Promise<{ status: string; id: number; is_deleted: boolean }> => {
    return await request<{ status: string; id: number; is_deleted: boolean }>(`/messaging/messages/${messageId}`, {
      method: 'DELETE'
    });
  },

  markConversationRead: async (conversationId: number): Promise<any> => {
    return await request<any>(`/messaging/conversations/${conversationId}/read`, { method: 'POST' });
  },

  togglePinConversation: async (conversationId: number): Promise<{ status: string; is_pinned: boolean }> => {
    return await request<{ status: string; is_pinned: boolean }>(`/messaging/conversations/${conversationId}/pin`, { method: 'POST' });
  },

  toggleMuteConversation: async (conversationId: number): Promise<{ status: string; is_muted: boolean }> => {
    return await request<{ status: string; is_muted: boolean }>(`/messaging/conversations/${conversationId}/mute`, { method: 'POST' });
  },

  getMessagingUnreadCount: async (): Promise<UnreadCountData> => {
    return await request<UnreadCountData>('/messaging/unread-count');
  },

  getConversationAISummary: async (conversationId: number): Promise<ConversationAISummary> => {
    return await request<ConversationAISummary>(`/messaging/conversations/${conversationId}/ai-summary`);
  },

  confirmActionSuggestion: async (conversationId: number, payload: {
    action_suggestion_id: number;
    assigned_user_id: number;
    due_date: string;
    priority?: string;
  }): Promise<any> => {
    return await request<any>(`/messaging/conversations/${conversationId}/confirm-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  searchDirectoryUsers: async (query?: string, department?: string): Promise<UserSearchItem[]> => {
    const q = new URLSearchParams();
    if (query) q.append('query', query);
    if (department) q.append('department', department);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<UserSearchItem[]>(`/messaging/search-users${qs}`);
  },

  // ==========================================
  // CHIEF MINISTER HIGHWAYS DASHBOARD
  // ==========================================
  getCMOverview: async (): Promise<CMExecutiveOverview> => {
    return await request<CMExecutiveOverview>('/cm/overview');
  },

  getCMDelayAnalysis: async (projectId: number): Promise<DelayRootCauseAnalysis> => {
    return await request<DelayRootCauseAnalysis>(`/cm/delays/analysis/${projectId}`);
  },

  getCMEscalations: async (): Promise<CMEscalationsData> => {
    return await request<CMEscalationsData>('/cm/escalations');
  },

  getCMAIDailyBrief: async (): Promise<CMAIDailyBrief> => {
    return await request<CMAIDailyBrief>('/cm/ai-daily-brief');
  },

  getCMDirections: async (params?: { status?: string; priority?: string }): Promise<CMDirectionItem[]> => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.priority) q.append('priority', params.priority);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return await request<CMDirectionItem[]>(`/cm/directions${qs}`);
  },

  issueCMDirection: async (payload: {
    title: string;
    project_id?: number;
    project_name?: string;
    target_department: string;
    assigned_officer_id?: number;
    assigned_officer_name: string;
    assigned_officer_designation: string;
    priority: string;
    issue_summary: string;
    directive_text: string;
    deadline_date: string;
    escalation_level?: string;
  }): Promise<CMDirectionItem> => {
    return await request<CMDirectionItem>('/cm/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  updateCMDirection: async (id: number, payload: {
    status?: string;
    compliance_notes?: string;
    verified_by_cmo?: boolean;
  }): Promise<CMDirectionItem> => {
    return await request<CMDirectionItem>(`/cm/directions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getJurisdictionComparison: async (level: string = 'zone'): Promise<{ level: string; benchmarks: JurisdictionBenchmarkItem[] }> => {
    return await request<{ level: string; benchmarks: JurisdictionBenchmarkItem[] }>(`/cm/jurisdiction-comparison?level=${level}`);
  },

  // ==========================================
  // UNIVERSAL CONNECTIVITY ENGINE
  // ==========================================
  getEntityRelationships: async (entityType: string, entityId: string | number): Promise<EntityRelationshipItem[]> => {
    return await request<EntityRelationshipItem[]>(`/connectivity/entities/${entityType}/${entityId}/relationships`);
  },

  getEntityGraph: async (entityType: string, entityId: string | number, depth: number = 1): Promise<RelationshipGraphData> => {
    return await request<RelationshipGraphData>(`/connectivity/graph?center_type=${entityType}&center_id=${entityId}&depth=${depth}`);
  },

  universalSearch: async (q: string, entityTypes?: string[]): Promise<{ query: string; total_matches: number; results: UniversalSearchResultItem[] }> => {
    const p = new URLSearchParams();
    p.append('q', q);
    if (entityTypes && entityTypes.length > 0) {
      entityTypes.forEach(t => p.append('entity_types', t));
    }
    return await request<{ query: string; total_matches: number; results: UniversalSearchResultItem[] }>(`/connectivity/search?${p.toString()}`);
  },

  createRelationship: async (payload: {
    source_entity_type: string;
    source_entity_id: string | number;
    source_entity_name?: string;
    relationship_type: string;
    target_entity_type: string;
    target_entity_id: string | number;
    target_entity_name?: string;
    access_tier?: string;
    source_reference?: string;
  }): Promise<EntityRelationshipItem> => {
    return await request<EntityRelationshipItem>('/connectivity/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  supersedeRelationship: async (relationshipId: number, reason: string): Promise<EntityRelationshipItem> => {
    return await request<EntityRelationshipItem>(`/connectivity/relationships/${relationshipId}/supersede?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT'
    });
  },

  getSuggestedRelationships: async (entityType: string, entityId: string | number): Promise<{ entity_type: string; entity_id: string; suggestions_count: number; suggestions: RelationshipSuggestionItem[] }> => {
    return await request<{ entity_type: string; entity_id: string; suggestions_count: number; suggestions: RelationshipSuggestionItem[] }>(`/connectivity/suggested-relationships?entity_type=${entityType}&entity_id=${entityId}`);
  },

  confirmSuggestedRelationship: async (suggestionId: string, payload: any): Promise<EntityRelationshipItem> => {
    return await request<EntityRelationshipItem>(`/connectivity/confirm-suggestion?suggestion_id=${encodeURIComponent(suggestionId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  // ============================================================================
  // LAND ACQUISITION & LITIGATION INTELLIGENCE COMMAND CENTRE
  // ============================================================================
  getLandLitigationOverview: async (): Promise<LandLitigationOverview> => {
    try {
      return await request<LandLitigationOverview>('/land-litigation/overview');
    } catch {
      return fallbackLandLitigationOverview;
    }
  },

  getLandLitigationParcels: async (params?: {
    project_id?: number;
    district?: string;
    stage?: string;
    critical_only?: boolean;
    litigation_only?: boolean;
    work_restricted_only?: boolean;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ total: number; skip: number; limit: number; items: LandLitigationParcelItem[]; simulated_data_badge: string }> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.district) q.set('district', params.district);
      if (params?.stage) q.set('stage', params.stage);
      if (params?.critical_only !== undefined) q.set('critical_only', String(params.critical_only));
      if (params?.litigation_only !== undefined) q.set('litigation_only', String(params.litigation_only));
      if (params?.work_restricted_only !== undefined) q.set('work_restricted_only', String(params.work_restricted_only));
      if (params?.search) q.set('search', params.search);
      if (params?.skip !== undefined) q.set('skip', String(params.skip));
      if (params?.limit !== undefined) q.set('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<{ total: number; skip: number; limit: number; items: LandLitigationParcelItem[]; simulated_data_badge: string }>(`/land-litigation/parcels${qs}`);
    } catch {
      let filtered = [...fallbackLandLitigationParcels];
      if (params?.project_id) filtered = filtered.filter(p => p.project_id === params.project_id);
      if (params?.district) filtered = filtered.filter(p => p.district_name.toLowerCase().includes(params.district!.toLowerCase()));
      if (params?.stage) filtered = filtered.filter(p => p.acquisition_stage === params.stage);
      if (params?.critical_only) filtered = filtered.filter(p => p.is_critical_path);
      if (params?.litigation_only) filtered = filtered.filter(p => p.is_under_litigation);
      if (params?.work_restricted_only) filtered = filtered.filter(p => p.has_work_restriction);
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.parcel_reference.toLowerCase().includes(s) ||
          p.survey_number.toLowerCase().includes(s) ||
          p.village_name.toLowerCase().includes(s)
        );
      }
      return {
        total: filtered.length,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        items: filtered,
        simulated_data_badge: 'SIMULATED'
      };
    }
  },

  getParcel360: async (parcelId: number): Promise<Parcel360Dossier> => {
    try {
      return await request<Parcel360Dossier>(`/land-litigation/parcels/${parcelId}`);
    } catch {
      return getFallbackParcel360(parcelId);
    }
  },

  getLitigationCases: async (params?: {
    project_id?: number;
    case_type?: string;
    work_restricted?: boolean;
    disposition_type?: string;
    search?: string;
  }): Promise<LitigationCaseItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.case_type) q.set('case_type', params.case_type);
      if (params?.work_restricted !== undefined) q.set('work_restricted', String(params.work_restricted));
      if (params?.disposition_type) q.set('disposition_type', params.disposition_type);
      if (params?.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<LitigationCaseItem[]>(`/land-litigation/litigation${qs}`);
    } catch {
      let filtered = [...fallbackLitigationCases];
      if (params?.project_id) filtered = filtered.filter(c => c.project_id === params.project_id);
      if (params?.case_type) filtered = filtered.filter(c => c.case_type === params.case_type);
      if (params?.work_restricted !== undefined) filtered = filtered.filter(c => c.work_restricted === params.work_restricted);
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.case_code.toLowerCase().includes(s) ||
          c.court_case_number.toLowerCase().includes(s) ||
          c.petitioners.toLowerCase().includes(s)
        );
      }
      return filtered;
    }
  },

  getRevenueCoordination: async (params?: {
    project_id?: number;
    district?: string;
    request_type?: string;
    status?: string;
    overdue_only?: boolean;
  }): Promise<RevenueCoordinationItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.district) q.set('district', params.district);
      if (params?.request_type) q.set('request_type', params.request_type);
      if (params?.status) q.set('status', params.status);
      if (params?.overdue_only !== undefined) q.set('overdue_only', String(params.overdue_only));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<RevenueCoordinationItem[]>(`/land-litigation/revenue-coordination${qs}`);
    } catch {
      let filtered = [...fallbackRevenueCoordination];
      if (params?.project_id) filtered = filtered.filter(r => r.project_id === params.project_id);
      if (params?.request_type) filtered = filtered.filter(r => r.request_type === params.request_type);
      if (params?.overdue_only) filtered = filtered.filter(r => r.is_overdue);
      return filtered;
    }
  },

  createRevenueCoordination: async (payload: any): Promise<RevenueCoordinationItem> => {
    try {
      return await request<RevenueCoordinationItem>('/land-litigation/revenue-coordination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const newItem: RevenueCoordinationItem = {
        id: Date.now(),
        request_reference: `REV-TN-2026-${Math.floor(Math.random() * 900 + 100)}`,
        project_id: payload.project_id || 1,
        project_title: 'Widening of East Coast Road (SH-49) Km 22/0 to 45/0',
        request_type: payload.request_type || 'FMB_SUBDIVISION_UPDATE',
        district: payload.district || 'Chengalpattu',
        taluk: payload.taluk || 'Tambaram',
        village: payload.village || 'Pallikaranai',
        subdivision_target: payload.subdivision_target || 'Target Parcel',
        subdivision_survey_number: payload.subdivision_survey_number || '142/1',
        revenue_officer_designation: payload.revenue_officer_designation || 'Tahsildar',
        revenue_office_location: payload.revenue_office_location || 'Taluk Office',
        date_initiated: new Date().toISOString(),
        statutory_due_date: payload.statutory_due_date || new Date(Date.now() + 30 * 86400000).toISOString(),
        request_status: 'SUBMITTED',
        is_overdue: false,
        days_overdue: 0,
        escalation_level: 'TAHSILDAR',
        joint_inspection_held: false,
        field_measurement_book_updated: false,
        chitta_tslr_updated: false,
        remarks: payload.remarks || 'Initiated via TN-HDOS Command Centre',
        simulated_data_badge: 'SIMULATED'
      };
      fallbackRevenueCoordination.unshift(newItem);
      return newItem;
    }
  },

  getAdvocateMonitoring: async (alerts_only: boolean = false): Promise<AdvocateMonitoringRecord[]> => {
    try {
      return await request<AdvocateMonitoringRecord[]>(`/land-litigation/advocate-monitoring?alerts_only=${alerts_only}`);
    } catch {
      return alerts_only
        ? fallbackAdvocateMonitoring.filter(r => r.procedural_alert)
        : fallbackAdvocateMonitoring;
    }
  },

  getSiteBlockers: async (params?: {
    project_id?: number;
    category?: string;
    readiness_gate?: string;
    is_critical_path?: boolean;
    current_status?: string;
  }): Promise<SiteBlockerItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.category) q.set('category', params.category);
      if (params?.readiness_gate) q.set('readiness_gate', params.readiness_gate);
      if (params?.is_critical_path !== undefined) q.set('is_critical_path', String(params.is_critical_path));
      if (params?.current_status) q.set('current_status', params.current_status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<SiteBlockerItem[]>(`/land-litigation/site-blockers${qs}`);
    } catch {
      let filtered = [...fallbackSiteBlockers];
      if (params?.project_id) filtered = filtered.filter(b => b.project_id === params.project_id);
      if (params?.category) filtered = filtered.filter(b => b.category === params.category);
      if (params?.readiness_gate) filtered = filtered.filter(b => b.readiness_gate === params.readiness_gate);
      if (params?.is_critical_path !== undefined) filtered = filtered.filter(b => b.is_critical_path === params.is_critical_path);
      return filtered;
    }
  },

  getFinancialExposure: async (project_id?: number): Promise<FinancialExposureDashboard> => {
    try {
      const qs = project_id ? `?project_id=${project_id}` : '';
      return await request<FinancialExposureDashboard>(`/land-litigation/financial-exposure${qs}`);
    } catch {
      if (!project_id) return fallbackFinancialExposure;
      const items = fallbackFinancialExposure.items.filter(i => i.project_id === project_id);
      return {
        summary: fallbackFinancialExposure.summary,
        items,
        simulated_data_badge: 'SIMULATED'
      };
    }
  },

  getLandLitigationResolutions: async (params?: {
    project_id?: number;
    status?: string;
    escalation_level?: string;
  }): Promise<LandLitigationResolutionActionItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.status) q.set('status', params.status);
      if (params?.escalation_level) q.set('escalation_level', params.escalation_level);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<LandLitigationResolutionActionItem[]>(`/land-litigation/resolutions${qs}`);
    } catch {
      let filtered = [...fallbackLandLitigationResolutions];
      if (params?.project_id) filtered = filtered.filter(a => a.project_id === params.project_id);
      if (params?.status) filtered = filtered.filter(a => a.status === params.status);
      if (params?.escalation_level) filtered = filtered.filter(a => a.escalation_level === params.escalation_level);
      return filtered;
    }
  },

  createResolutionAction: async (payload: any): Promise<LandLitigationResolutionActionItem> => {
    try {
      return await request<LandLitigationResolutionActionItem>('/land-litigation/resolutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const newAction: LandLitigationResolutionActionItem = {
        id: Date.now(),
        action_code: `ACT-RES-2026-${Math.floor(Math.random() * 900 + 100)}`,
        project_id: payload.project_id || 1,
        project_title: 'Widening of East Coast Road (SH-49) Km 22/0 to 45/0',
        title: payload.title || 'Corrective Action',
        action_type: payload.action_type || 'REVENUE_ESCORT',
        assigned_to_officer: payload.assigned_to_officer || 'Special DRO (LA)',
        assigned_to_role: payload.assigned_to_role || 'District Revenue Officer',
        escalation_level: payload.escalation_level || 'DRO',
        target_date: payload.target_date || new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'OPEN',
        notes: payload.notes || 'Registered in TN-HDOS Command Centre',
        simulated_data_badge: 'SIMULATED'
      };
      fallbackLandLitigationResolutions.unshift(newAction);
      return newAction;
    }
  },

  updateResolutionStatus: async (actionId: number, status: string, notes?: string, evidenceUrl?: string): Promise<LandLitigationResolutionActionItem> => {
    try {
      const q = new URLSearchParams();
      q.set('status', status);
      if (notes) q.set('notes', notes);
      if (evidenceUrl) q.set('resolution_evidence_url', evidenceUrl);
      return await request<LandLitigationResolutionActionItem>(`/land-litigation/resolutions/${actionId}/status?${q.toString()}`, {
        method: 'PUT'
      });
    } catch {
      const act = fallbackLandLitigationResolutions.find(a => a.id === actionId);
      if (act) {
        act.status = status;
        if (notes) act.notes = notes;
        if (evidenceUrl) act.resolution_evidence_url = evidenceUrl;
        return act;
      }
      return fallbackLandLitigationResolutions[0];
    }
  },

  getPreConstructionRiskAssessments: async (projectId?: number): Promise<PreConstructionRiskAssessmentItem[]> => {
    try {
      const qs = projectId ? `?project_id=${projectId}` : '';
      return await request<PreConstructionRiskAssessmentItem[]>(`/land-litigation/pre-construction-risk-assessment${qs}`);
    } catch {
      if (projectId) return fallbackPreConstructionAssessments.filter(a => a.project_id === projectId);
      return fallbackPreConstructionAssessments;
    }
  },

  overridePreConstructionAssessment: async (assessmentId: number, payload: { override_authority: string; justification: string }): Promise<PreConstructionRiskAssessmentItem> => {
    try {
      return await request<PreConstructionRiskAssessmentItem>(`/land-litigation/pre-construction-risk-assessment/${assessmentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const item = fallbackPreConstructionAssessments.find(a => a.id === assessmentId);
      if (item) {
        if (item.has_binding_legal_prohibition) {
          throw new Error('STATUTORY VIOLATION: Cannot override binding court order or injunction.');
        }
        item.is_overridden = true;
        item.override_authority = payload.override_authority;
        item.override_justification = payload.justification;
        item.override_date = new Date().toISOString();
        return item;
      }
      return fallbackPreConstructionAssessments[0];
    }
  },

  getLandLitigationCMSummary: async (): Promise<LandLitigationCMSummary> => {
    try {
      return await request<LandLitigationCMSummary>('/land-litigation/cm-summary');
    } catch {
      return fallbackLandLitigationCMSummary;
    }
  },

  queryLandLitigationAI: async (query: string, project_id?: number): Promise<LandLitigationAIResponse> => {
    try {
      return await request<LandLitigationAIResponse>('/land-litigation/ai-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, project_id })
      });
    } catch {
      return getFallbackLandLitigationAI(query);
    }
  },

  // ============================================================================
  // MAJOR WORKS ₹50 CR+ & PROJECT BLOCKER MITIGATION INTELLIGENCE
  // ============================================================================
  getMajorWorksPortfolio: async (params?: {
    circle?: string;
    division?: string;
    risk_level?: string;
    delayed_only?: boolean;
    critical_blockers_only?: boolean;
    search?: string;
  }): Promise<MajorWorksPortfolioOverview> => {
    try {
      const q = new URLSearchParams();
      if (params?.circle) q.set('circle', params.circle);
      if (params?.division) q.set('division', params.division);
      if (params?.risk_level) q.set('risk_level', params.risk_level);
      if (params?.delayed_only !== undefined) q.set('delayed_only', String(params.delayed_only));
      if (params?.critical_blockers_only !== undefined) q.set('critical_blockers_only', String(params.critical_blockers_only));
      if (params?.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<MajorWorksPortfolioOverview>(`/major-works/portfolio${qs}`);
    } catch {
      let filtered = [...fallbackMajorWorksList];
      if (params?.circle) filtered = filtered.filter(w => w.circle_name.toLowerCase().includes(params.circle!.toLowerCase()));
      if (params?.division) filtered = filtered.filter(w => w.division_name.toLowerCase().includes(params.division!.toLowerCase()));
      if (params?.risk_level) filtered = filtered.filter(w => w.risk_level === params.risk_level);
      if (params?.delayed_only) filtered = filtered.filter(w => w.completion_delay_days > 0);
      if (params?.critical_blockers_only) filtered = filtered.filter(w => (w.critical_blockers_count || 0) > 0);
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(w =>
          w.project_name.toLowerCase().includes(s) ||
          w.source_project_id.toLowerCase().includes(s) ||
          (w.contractor_name || '').toLowerCase().includes(s)
        );
      }
      return {
        ...fallbackMajorWorksOverview,
        total_major_works_count: filtered.length,
        items: filtered
      };
    }
  },

  getMajorWorkDetail: async (id: string | number): Promise<{
    work: MajorWorksProjectItem;
    blockers: ProjectBlockerItem[];
    delay_investigation?: DelayInvestigationItem;
    financial_ledger: any[];
    mitigations: MitigationRecommendationItem[];
    pre_construction_gates: PreConstructionGateCheckItem[];
  }> => {
    try {
      return await request<{
        work: MajorWorksProjectItem;
        blockers: ProjectBlockerItem[];
        delay_investigation?: DelayInvestigationItem;
        financial_ledger: any[];
        mitigations: MitigationRecommendationItem[];
        pre_construction_gates: PreConstructionGateCheckItem[];
      }>(`/major-works/portfolio/${id}`);
    } catch {
      const idStr = String(id);
      const work = fallbackMajorWorksList.find(w => w.id === Number(id) || w.source_project_id === idStr) || fallbackMajorWorksList[0];
      const blockers = fallbackBlockersList.filter(b => b.major_work_id === work.id || b.major_work_source_id === work.source_project_id);
      const delay_investigation = fallbackDelayInvestigations.find(i => i.major_work_id === work.id || i.major_work_source_id === work.source_project_id);
      const financial_ledger = fallbackLossPreventionLedger.records.filter(r => r.major_work_id === work.id || r.major_work_source_id === work.source_project_id);
      const mitigations = fallbackMitigationsList.filter(m => m.major_work_id === work.id || m.major_work_source_id === work.source_project_id);
      const pre_construction_gates = fallbackPreConstructionGatesList.filter(g => g.major_work_id === work.id);
      return {
        work,
        blockers,
        delay_investigation,
        financial_ledger,
        mitigations,
        pre_construction_gates
      };
    }
  },

  getBlockers: async (params?: {
    project_id?: number;
    major_work_id?: number;
    category?: string;
    status?: string;
    is_critical_path?: boolean;
  }): Promise<ProjectBlockerItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.major_work_id) q.set('major_work_id', String(params.major_work_id));
      if (params?.category) q.set('category', params.category);
      if (params?.status) q.set('status', params.status);
      if (params?.is_critical_path !== undefined) q.set('is_critical_path', String(params.is_critical_path));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<ProjectBlockerItem[]>(`/major-works/blockers${qs}`);
    } catch {
      let filtered = [...fallbackBlockersList];
      if (params?.project_id) filtered = filtered.filter(b => b.project_id === params.project_id);
      if (params?.major_work_id) filtered = filtered.filter(b => b.major_work_id === params.major_work_id);
      if (params?.category) filtered = filtered.filter(b => b.category === params.category);
      if (params?.status) filtered = filtered.filter(b => b.current_status === params.status);
      if (params?.is_critical_path !== undefined) filtered = filtered.filter(b => b.is_critical_path === params.is_critical_path);
      return filtered;
    }
  },

  createBlocker: async (payload: any): Promise<ProjectBlockerItem> => {
    try {
      return await request<ProjectBlockerItem>('/major-works/blockers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const newBlocker: ProjectBlockerItem = {
        id: fallbackBlockersList.length + 1,
        blocker_code: `BLK-${Date.now().toString().slice(-4)}`,
        project_id: payload.project_id,
        project_name: 'Identified Project',
        major_work_id: payload.major_work_id,
        category: payload.category,
        description: payload.description,
        date_identified: new Date().toISOString(),
        blocker_start_date: new Date().toISOString(),
        current_status: 'ACTIVE_BLOCKER',
        is_critical_path: payload.is_critical_path ?? true,
        primary_cause: payload.primary_cause,
        responsible_resolution_authority: payload.responsible_resolution_authority,
        assigned_action_owner: payload.assigned_action_owner,
        days_affected: 0,
        financial_exposure_cr: payload.financial_exposure_cr,
        is_financial_exposure_quantified: !!payload.financial_exposure_cr,
        escalation_level: payload.escalation_level || 'DIVISION',
        last_update: new Date().toISOString(),
        simulated_data_badge: 'SIMULATED'
      };
      return newBlocker;
    }
  },

  updateBlockerStatus: async (
    id: number,
    payload: { status: string; closure_remarks?: string; closure_evidence?: string }
  ): Promise<ProjectBlockerItem> => {
    try {
      return await request<ProjectBlockerItem>(`/major-works/blockers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const b = fallbackBlockersList.find(item => item.id === id);
      if (b) {
        b.current_status = payload.status as any;
        if (payload.closure_remarks) b.closure_remarks = payload.closure_remarks;
        if (payload.closure_evidence) b.closure_evidence = payload.closure_evidence;
        b.last_update = new Date().toISOString();
        return { ...b };
      }
      return fallbackBlockersList[0];
    }
  },

  getDelayInvestigation: async (projectId: number): Promise<DelayInvestigationItem> => {
    try {
      return await request<DelayInvestigationItem>(`/major-works/investigations/${projectId}`);
    } catch {
      const inv = fallbackDelayInvestigations.find(i => i.project_id === projectId) || fallbackDelayInvestigations[0];
      return inv;
    }
  },

  getFinancialLossLedger: async (params?: {
    project_id?: number;
    major_work_id?: number;
  }): Promise<LossPreventionLedgerDashboard> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.major_work_id) q.set('major_work_id', String(params.major_work_id));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<LossPreventionLedgerDashboard>(`/major-works/financial-ledger${qs}`);
    } catch {
      let recs = [...fallbackLossPreventionLedger.records];
      if (params?.project_id) recs = recs.filter(r => r.project_id === params.project_id);
      if (params?.major_work_id) recs = recs.filter(r => r.major_work_id === params.major_work_id);
      return {
        summary: fallbackLossPreventionLedger.summary,
        records: recs,
        simulated_data_badge: 'SIMULATED'
      };
    }
  },

  getMitigations: async (params?: {
    project_id?: number;
    major_work_id?: number;
    blocker_id?: number;
    approval_status?: string;
  }): Promise<MitigationRecommendationItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.major_work_id) q.set('major_work_id', String(params.major_work_id));
      if (params?.blocker_id) q.set('blocker_id', String(params.blocker_id));
      if (params?.approval_status) q.set('approval_status', params.approval_status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<MitigationRecommendationItem[]>(`/major-works/mitigations${qs}`);
    } catch {
      let filtered = [...fallbackMitigationsList];
      if (params?.project_id) filtered = filtered.filter(m => m.project_id === params.project_id);
      if (params?.major_work_id) filtered = filtered.filter(m => m.major_work_id === params.major_work_id);
      if (params?.blocker_id) filtered = filtered.filter(m => m.blocker_id === params.blocker_id);
      if (params?.approval_status) filtered = filtered.filter(m => m.human_approval_status === params.approval_status);
      return filtered;
    }
  },

  approveMitigation: async (
    id: number,
    payload: { approved: boolean; approving_officer?: string; approval_notes?: string }
  ): Promise<MitigationRecommendationItem> => {
    try {
      return await request<MitigationRecommendationItem>(`/major-works/mitigations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const mit = fallbackMitigationsList.find(m => m.id === id);
      if (mit) {
        mit.human_approval_status = payload.approved ? 'APPROVED' : 'REJECTED';
        mit.approved_by_officer = payload.approving_officer || 'Superintending Engineer (Highways)';
        mit.approval_date = new Date().toISOString();
        mit.approval_notes = payload.approval_notes;
        return { ...mit };
      }
      return fallbackMitigationsList[0];
    }
  },

  getPreConstructionGates: async (params?: {
    project_id?: number;
    major_work_id?: number;
    readiness_state?: string;
  }): Promise<PreConstructionGateCheckItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.project_id) q.set('project_id', String(params.project_id));
      if (params?.major_work_id) q.set('major_work_id', String(params.major_work_id));
      if (params?.readiness_state) q.set('readiness_state', params.readiness_state);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return await request<PreConstructionGateCheckItem[]>(`/major-works/pre-construction-gates${qs}`);
    } catch {
      let filtered = [...fallbackPreConstructionGatesList];
      if (params?.project_id) filtered = filtered.filter(g => g.project_id === params.project_id);
      if (params?.major_work_id) filtered = filtered.filter(g => g.major_work_id === params.major_work_id);
      if (params?.readiness_state) filtered = filtered.filter(g => g.readiness_state === params.readiness_state);
      return filtered;
    }
  },

  overridePreConstructionGate: async (
    id: number,
    payload: { override_authority: string; justification: string }
  ): Promise<PreConstructionGateCheckItem> => {
    try {
      return await request<PreConstructionGateCheckItem>(`/major-works/pre-construction-gates/${id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const gate = fallbackPreConstructionGatesList.find(g => g.id === id);
      if (gate) {
        if (gate.court_restrictions_active) {
          throw new Error('STATUTORY PROHIBITION: Binding judicial order/injunction in force. Administrative override strictly barred under High Court jurisdiction.');
        }
        gate.authorized_override_status = 'REVIEWED_AND_PERMITTED';
        gate.override_authority = payload.override_authority;
        gate.override_justification = payload.justification;
        gate.override_date = new Date().toISOString();
        gate.readiness_state = 'AMBER';
        return { ...gate };
      }
      return fallbackPreConstructionGatesList[0];
    }
  },

  getMajorWorksCMSummary: async (): Promise<MajorWorksCMSummary> => {
    try {
      return await request<MajorWorksCMSummary>('/major-works/cm-summary');
    } catch {
      return fallbackMajorWorksCMSummary;
    }
  },

  queryMajorWorksAI: async (query: string, project_id?: number, blocker_id?: number): Promise<MajorWorksAIResponse> => {
    try {
      return await request<MajorWorksAIResponse>('/major-works/ai-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, project_id, blocker_id })
      });
    } catch {
      return fallbackMajorWorksAIResponse;
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
