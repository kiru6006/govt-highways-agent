import { ReconciliationLineageItem, SoRContractVariationItem, SoRQCTestLinkItem } from '../types';

export const fallbackLineageData: ReconciliationLineageItem[] = [
  {
    project_id: 1,
    project_name: "Chennai - Kancheepuram Expressway Widening (SH-112)",
    item_code: "W-1001",
    variance_percentage: 13.5,
    reconciliation_verdict: "QUANTITY_VARIANCE",
    lineage_flow: [
      {
        stage: "SOR_MASTER",
        reference_id: "SOR-2026-27-V1",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        quantity: 350.0,
        unit: "cum.",
        rate: 8450.0,
        amount: 2957500.0,
        status: "OFFICIAL_GAZETTED",
        timestamp: "2026-11-13"
      },
      {
        stage: "ESTIMATE",
        reference_id: "EST-2026-001",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        quantity: 350.0,
        unit: "cum.",
        rate: 8450.0,
        amount: 2957500.0,
        status: "SANCTIONED",
        timestamp: "2026-11-15"
      },
      {
        stage: "BOQ",
        reference_id: "BOQ-ITEM-01",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        quantity: 350.0,
        unit: "cum.",
        rate: 8450.0,
        amount: 2957500.0,
        status: "TENDER_AWARDED",
        timestamp: "2026-11-16"
      },
      {
        stage: "MB",
        reference_id: "MB-402/p.45",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        quantity: 3480.0,
        unit: "cum.",
        rate: 8450.0,
        amount: 29406000.0,
        status: "RECORDED_AT_SITE",
        timestamp: "2026-11-18"
      },
      {
        stage: "BILL",
        reference_id: "CC-03/RA-02",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        quantity: 3950.0,
        unit: "cum.",
        rate: 8450.0,
        amount: 33377500.0,
        status: "VARIANCE_FLAGGED",
        timestamp: "2026-11-19"
      }
    ],
    qc_tests: [
      {
        id: "QC-TEST-001",
        project_id: 1,
        reconciliation_id: "RECON-001",
        item_code: "W-1001",
        test_type: "CORE_CUTTER_DENSITY",
        equipment_code: "QC-0001",
        morth_spec_clause: "MORTH Section 500 Cl. 505.4",
        sample_chainage: "km 14/250 - 14/350 LHS",
        lab_test_certificate_no: "QCL-CHN-2026-C042",
        test_result_value: "99.4% Field Density",
        required_benchmark: "Min 98.0% of Marshall Density",
        compliance_status: "COMPLIANT",
        qc_engineer_name: "Er. R. Murugan, AEE (QC)",
        tested_at: "2026-11-18T10:30:00Z"
      }
    ],
    variations: [
      {
        id: "VAR-2026-001",
        project_id: 1,
        estimate_id: "EST-2026-001",
        variation_number: "VAR-2026-001",
        item_code: "W-1001",
        description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
        unit: "cum.",
        original_sanctioned_qty: 350.0,
        proposed_revised_qty: 410.0,
        qty_delta: 60.0,
        original_rate: 8450.0,
        proposed_rate: 8450.0,
        rate_delta: 0.0,
        financial_impact_cr: 0.0507,
        justification_code: "SITE_CONDITION",
        justification_details: "Unforeseen subgrade soft soil pocket at km 14/400-14/600 requiring additional 60 cum DBM leveling course.",
        approval_status: "RECOMMENDED_SE",
        delegation_order_ref: "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
        sanctioning_authority: "Superintending Engineer (SE) - Powers up to ₹7.00 Crores",
        created_at: "2026-11-18T14:20:00Z"
      }
    ]
  },
  {
    project_id: 1,
    project_name: "Chennai - Kancheepuram Expressway Widening (SH-112)",
    item_code: "B-201",
    variance_percentage: 0.0,
    reconciliation_verdict: "MATCHED",
    lineage_flow: [
      {
        stage: "SOR_MASTER",
        reference_id: "SOR-2026-27-V1",
        item_code: "B-201",
        description: "M35 Concrete for Bridge Deck Superstructure",
        quantity: 120.0,
        unit: "cum.",
        rate: 6850.0,
        amount: 822000.0,
        status: "OFFICIAL_GAZETTED",
        timestamp: "2026-11-13"
      },
      {
        stage: "ESTIMATE",
        reference_id: "EST-2026-001",
        item_code: "B-201",
        description: "M35 Concrete for Bridge Deck Superstructure",
        quantity: 120.0,
        unit: "cum.",
        rate: 7055.50,
        amount: 846660.0,
        status: "SANCTIONED",
        timestamp: "2026-11-15"
      },
      {
        stage: "BOQ",
        reference_id: "BOQ-ITEM-02",
        item_code: "B-201",
        description: "M35 Concrete for Bridge Deck Superstructure",
        quantity: 120.0,
        unit: "cum.",
        rate: 7055.50,
        amount: 846660.0,
        status: "TENDER_AWARDED",
        timestamp: "2026-11-16"
      },
      {
        stage: "MB",
        reference_id: "MB-402/p.52",
        item_code: "B-201",
        description: "M35 Concrete for Bridge Deck Superstructure",
        quantity: 120.0,
        unit: "cum.",
        rate: 7055.50,
        amount: 846660.0,
        status: "RECORDED_AT_SITE",
        timestamp: "2026-11-18"
      },
      {
        stage: "BILL",
        reference_id: "CC-03/RA-02",
        item_code: "B-201",
        description: "M35 Concrete for Bridge Deck Superstructure",
        quantity: 120.0,
        unit: "cum.",
        rate: 7055.50,
        amount: 846660.0,
        status: "PASSED",
        timestamp: "2026-11-19"
      }
    ],
    qc_tests: [
      {
        id: "QC-TEST-002",
        project_id: 1,
        reconciliation_id: "RECON-002",
        item_code: "B-201",
        test_type: "CONCRETE_COMPRESSIVE_STRENGTH_28D",
        equipment_code: "QC-0002",
        morth_spec_clause: "MORTH Section 1700 Table 1700-4",
        sample_chainage: "km 14/800 Deck Slab Pour-3",
        lab_test_certificate_no: "QCL-CHN-2026-C089",
        test_result_value: "39.8 MPa (28 Days)",
        required_benchmark: "Target Mean Strength >= 35.0 MPa",
        compliance_status: "COMPLIANT",
        qc_engineer_name: "Er. K. Shanmugam, AE (QC Lab)",
        tested_at: "2026-11-17T11:00:00Z"
      }
    ],
    variations: []
  }
];

export const fallbackContractVariations: SoRContractVariationItem[] = [
  {
    id: "VAR-2026-001",
    project_id: 1,
    estimate_id: "EST-2026-001",
    variation_number: "VAR-2026-001",
    item_code: "W-1001",
    description: "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
    unit: "cum.",
    original_sanctioned_qty: 350.0,
    proposed_revised_qty: 410.0,
    qty_delta: 60.0,
    original_rate: 8450.0,
    proposed_rate: 8450.0,
    rate_delta: 0.0,
    financial_impact_cr: 0.0507,
    justification_code: "SITE_CONDITION",
    justification_details: "Unforeseen subgrade soft soil pocket at km 14/400-14/600 requiring additional 60 cum DBM leveling course.",
    approval_status: "RECOMMENDED_SE",
    delegation_order_ref: "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
    sanctioning_authority: "Superintending Engineer (SE) - Powers up to ₹7.00 Crores",
    created_at: "2026-11-18T14:20:00Z"
  },
  {
    id: "VAR-2026-002",
    project_id: 1,
    estimate_id: "EST-2026-001",
    variation_number: "VAR-2026-002",
    item_code: "W-0055",
    description: "Earthwork excavation in all soils SS20B including lead & lift",
    unit: "cum.",
    original_sanctioned_qty: 5000.0,
    proposed_revised_qty: 5800.0,
    qty_delta: 800.0,
    original_rate: 88.10,
    proposed_rate: 88.10,
    rate_delta: 0.0,
    financial_impact_cr: 0.0070,
    justification_code: "DRAINAGE_AUGMENTATION",
    justification_details: "Side drain widening to prevent waterlogging as recommended in field review.",
    approval_status: "SANCTIONED_DE",
    delegation_order_ref: "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
    sanctioning_authority: "Divisional Engineer (DE) - Full Powers up to ₹50 Lakhs",
    created_at: "2026-11-17T09:15:00Z"
  }
];

export const fallbackQCTestLinks: SoRQCTestLinkItem[] = [
  {
    id: "QC-TEST-001",
    project_id: 1,
    reconciliation_id: "RECON-001",
    item_code: "W-1001",
    test_type: "CORE_CUTTER_DENSITY",
    equipment_code: "QC-0001",
    morth_spec_clause: "MORTH Section 500 Cl. 505.4",
    sample_chainage: "km 14/250 - 14/350 LHS",
    lab_test_certificate_no: "QCL-CHN-2026-C042",
    test_result_value: "99.4% Field Density",
    required_benchmark: "Min 98.0% of Marshall Density",
    compliance_status: "COMPLIANT",
    qc_engineer_name: "Er. R. Murugan, AEE (QC)",
    tested_at: "2026-11-18T10:30:00Z"
  },
  {
    id: "QC-TEST-002",
    project_id: 1,
    reconciliation_id: "RECON-002",
    item_code: "B-201",
    test_type: "CONCRETE_COMPRESSIVE_STRENGTH_28D",
    equipment_code: "QC-0002",
    morth_spec_clause: "MORTH Section 1700 Table 1700-4",
    sample_chainage: "km 14/800 Deck Slab Pour-3",
    lab_test_certificate_no: "QCL-CHN-2026-C089",
    test_result_value: "39.8 MPa (28 Days)",
    required_benchmark: "Target Mean Strength >= 35.0 MPa",
    compliance_status: "COMPLIANT",
    qc_engineer_name: "Er. K. Shanmugam, AE (QC Lab)",
    tested_at: "2026-11-17T11:00:00Z"
  }
];
