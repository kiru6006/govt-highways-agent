import { SoRIngestionJobItem, SoRStagedItemData, SoRIngestionDiscrepancyItem } from '../types';

export const FALLBACK_INGESTION_JOBS: SoRIngestionJobItem[] = [
  {
    id: "JOB-2026-SOR-VOL1",
    job_code: "ING-2026-001",
    sor_version_id: "SOR-2026-27-V1",
    file_name: "TN_Schedule_of_Rates_2026_2027_Volume_I.pdf",
    source_url_or_path: "/documents/sor/TN_Schedule_of_Rates_2026_2027_Volume_I.pdf",
    page_range: "311-352",
    status: "STAGED",
    total_pages: 42,
    total_items_extracted: 24,
    confidence_score_pct: 96.8,
    effective_date: "2026-11-13T00:00:00Z",
    created_at: "2026-11-14T08:00:00Z"
  }
];

export const FALLBACK_STAGED_ITEMS: SoRStagedItemData[] = [
  {
    id: "STAGE-001",
    job_id: "JOB-2026-SOR-VOL1",
    unique_code: "W-1001",
    category: "Highways Works",
    item_description: "Bituminous Concrete (BC) 40mm thick compacted with sensor paver to specified camber",
    unit_raw: "Cum",
    basic_rate: 8450.0,
    printed_page: 316,
    pdf_page: 323,
    extraction_confidence_pct: 99.2,
    has_discrepancy: false,
    is_verified: true,
    verified_by: "SE Technical Cell"
  },
  {
    id: "STAGE-002",
    job_id: "JOB-2026-SOR-VOL1",
    unique_code: "M-0127",
    category: "Materials",
    item_description: "Supply of Paving Bitumen Grade VG-30 conforming to IS:73 at designated refinery",
    unit_raw: "MT",
    basic_rate: 48200.0,
    printed_page: 314,
    pdf_page: 321,
    extraction_confidence_pct: 82.5,
    has_discrepancy: true,
    discrepancy_notes: "Requires linking to CPCL monthly price notification circular per G.O. (Ms) No. 42",
    is_verified: false
  },
  {
    id: "STAGE-003",
    job_id: "JOB-2026-SOR-VOL1",
    unique_code: "M-2853",
    category: "Materials",
    item_description: "High Tensile Prestressing Low-Relaxation Steel Strands 12.7mm dia conforming to IS:14268",
    unit_raw: "MT",
    basic_rate: 78500.0,
    printed_page: 315,
    pdf_page: 322,
    extraction_confidence_pct: 79.0,
    has_discrepancy: true,
    discrepancy_notes: "Unit conversion check required (metric tonnes vs quintal in table header footnote)",
    is_verified: false
  },
  {
    id: "STAGE-004",
    job_id: "JOB-2026-SOR-VOL1",
    unique_code: "L-0001",
    category: "Labour",
    item_description: "First Class Mazdoor (Male / Female) for earthwork and general highway operations",
    unit_raw: "Day",
    basic_rate: 625.0,
    printed_page: 313,
    pdf_page: 320,
    extraction_confidence_pct: 99.8,
    has_discrepancy: false,
    is_verified: true,
    verified_by: "EE Planning Cell"
  }
];

export const FALLBACK_INGESTION_DISCREPANCIES: SoRIngestionDiscrepancyItem[] = [
  {
    id: "DISC-001",
    job_id: "JOB-2026-SOR-VOL1",
    staged_item_id: "STAGE-002",
    discrepancy_type: "GO_REFERENCE_REQUIRED",
    field_name: "basic_rate",
    extracted_value: "48200.00",
    flagged_issue: "Bitumen base price requires attachment of approved monthly refinery index notification.",
    resolution_status: "OPEN"
  },
  {
    id: "DISC-002",
    job_id: "JOB-2026-SOR-VOL1",
    staged_item_id: "STAGE-003",
    discrepancy_type: "OCR_AMBIGUITY",
    field_name: "unit_raw",
    extracted_value: "MT",
    flagged_issue: "OCR detected symbol 'qtl' in footnote; row unit is 'MT'. Human confirmation required.",
    resolution_status: "OPEN"
  }
];
