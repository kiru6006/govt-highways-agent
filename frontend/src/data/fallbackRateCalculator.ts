import { RateCalculateResponse, BatchCalculateResponse } from '../types';

export const fallbackCalculatorItems = [
  // Materials
  {
    item_code: "M-0093",
    category: "Material",
    sub_category: "Aggregates",
    description: "HBGS Jelly 90 mm (Hard Broken Granite Stone)",
    unit: "cum.",
    basic_rate: 544.00,
    annexure: "Annexure-II",
    printed_page: 314,
    notes: "Tax separate if applicable. No extra incidental loading charges."
  },
  {
    item_code: "M-0001",
    category: "Material",
    sub_category: "Binding Materials",
    description: "Ordinary Portland Cement (OPC 43/53 grade) conforming to IS 269",
    unit: "MT",
    basic_rate: 5000.00,
    annexure: "Annexure-II",
    printed_page: 314,
    notes: "TANCEM baseline. GST strictly separate."
  },
  {
    item_code: "M-0002",
    category: "Material",
    sub_category: "Steel",
    description: "TMT Fe-500D Steel Reinforcement Bars conforming to IS 1786",
    unit: "MT",
    basic_rate: 55665.00,
    annexure: "Annexure-II",
    printed_page: 314,
    notes: "SAIL baseline. Ex-yard rate excl. GST."
  },
  {
    item_code: "M-0130",
    category: "Material",
    sub_category: "Bitumen",
    description: "Paving Bitumen VG-30 in bulk (Refinery rate)",
    unit: "MT",
    basic_rate: 48500.00,
    annexure: "Annexure-II",
    printed_page: 315,
    notes: "Ex-refinery rate. Haulage governed by oil company circular."
  },
  // Labour
  {
    item_code: "L-0099",
    category: "Labour",
    sub_category: "Plant Operations",
    description: "Bitumen Heat Master Operator",
    unit: "Day",
    basic_rate: 1001.00,
    annexure: "Annexure-I",
    printed_page: 313,
    notes: "Night work +25% requires verified tender clause."
  },
  {
    item_code: "L-0001",
    category: "Labour",
    sub_category: "Technical Supervision",
    description: "Technical Assistant Grade-I (B.E. Passed)",
    unit: "Day",
    basic_rate: 1430.00,
    annexure: "Annexure-I",
    printed_page: 313,
    notes: "Degree qualified site technical support."
  },
  {
    item_code: "L-0024",
    category: "Labour",
    sub_category: "Transport Drivers",
    description: "Driver (Heavy Duty Vehicles / Tipper / Transit Mixer)",
    unit: "Day",
    basic_rate: 965.00,
    annexure: "Annexure-I",
    printed_page: 313,
    notes: "Commercial heavy license holder."
  },
  {
    item_code: "L-0096",
    category: "Labour",
    sub_category: "Mazdoors",
    description: "Heavy Mazdoor (Earthwork, metal spreading, quarrying)",
    unit: "Day",
    basic_rate: 832.00,
    annexure: "Annexure-I",
    printed_page: 313,
    notes: "Standard daily wage excl. statutory taxes."
  },
  // Works
  {
    item_code: "W-0055",
    category: "Highways Works",
    sub_category: "Earthwork",
    description: "Earth work ORDINARY SOIL (SS20B) initial lead 10m & lift 2m",
    unit: "cum.",
    basic_rate: 88.10,
    annexure: "Annexure-III",
    printed_page: 316,
    notes: "Free lead 10m, free lift 2m included."
  },
  {
    item_code: "W-0401",
    category: "Highways Works",
    sub_category: "Pavement Sub-Base",
    description: "Granular Sub-Base (GSB) Plant Mix Grade-I with vibratory compaction",
    unit: "cum.",
    basic_rate: 1420.00,
    annexure: "Annexure-III",
    printed_page: 318,
    notes: "MoRTH Section 401 compliant."
  },
  {
    item_code: "W-0505",
    category: "Highways Works",
    sub_category: "Bituminous Pavement",
    description: "Dense Bituminous Macadam (DBM) Grade-II VG-30 50mm compacted",
    unit: "cum.",
    basic_rate: 7650.00,
    annexure: "Annexure-III",
    printed_page: 326,
    notes: "Sensor paver laid, Marshall tested."
  },
  {
    item_code: "B-201",
    category: "Highways Works",
    sub_category: "Bridge Works",
    description: "Design Mix Concrete M35 for Bridge Superstructure PSC Girders & Deck",
    unit: "cum.",
    basic_rate: 7800.00,
    annexure: "Annexure-III",
    printed_page: 343,
    notes: "Eligible for 3% Bridge Provisional Allowance (>50% share)."
  },
  {
    item_code: "B-210",
    category: "Highways Works",
    sub_category: "Drainage",
    description: "Concrete M15 for roadside longitudinal drain (Ineligible for Bridge 3%)",
    unit: "cum.",
    basic_rate: 4850.00,
    annexure: "Annexure-III",
    printed_page: 346,
    notes: "Hard blocked from Bridge 3% allowance per General Note 10."
  },
  // Equipment Hire
  {
    item_code: "H-0001",
    category: "Tools & Plant Hire",
    sub_category: "Excavation",
    description: "Hydraulic Excavator 0.9 cum bucket hire charges including crew",
    unit: "Hour",
    basic_rate: 2450.00,
    annexure: "Annexure-IX",
    printed_page: 349,
    notes: "Rate per hour of active operation."
  },
  {
    item_code: "H-0004",
    category: "Tools & Plant Hire",
    sub_category: "Paving",
    description: "Hydrostatic Sensor Paver Finisher 9.0m paving width with electronic sensors",
    unit: "Hour",
    basic_rate: 4200.00,
    annexure: "Annexure-IX",
    printed_page: 350,
    notes: "Includes certified operator and screed master."
  },
  // Road Furniture
  {
    item_code: "RF-0001",
    category: "Road Furniture & QC",
    sub_category: "Traffic Signs",
    description: "Retro-reflective Cautionary Signboard 90cm Triangle High-Intensity",
    unit: "Each",
    basic_rate: 3850.00,
    annexure: "Annexure-V",
    printed_page: 329,
    notes: "IRC:67 Type-IV microprismatic sheeting."
  },
  {
    item_code: "RF-0003",
    category: "Road Furniture & QC",
    sub_category: "Barriers",
    description: "Metal Beam Crash Barrier (W-Beam) hot-dip galvanized complete with posts",
    unit: "RM",
    basic_rate: 3450.00,
    annexure: "Annexure-V",
    printed_page: 331,
    notes: "MoRTH Section 811 compliant."
  },
  // Survey & DPR
  {
    item_code: "SV-0001",
    category: "Survey & DPR",
    sub_category: "Surveys",
    description: "Total Station Topographic Survey & Digital Ground Profiling for Alignment",
    unit: "km",
    basic_rate: 18500.00,
    annexure: "Annexure-VI",
    printed_page: 344,
    notes: "Deliverables: DTM, contour map, cross-sections."
  },
  // Plantation
  {
    item_code: "PL-0001",
    category: "Avenue Plantation",
    sub_category: "Trees",
    description: "Tree Sapling Planting along highway right-of-way with 1.5m tree guard",
    unit: "Each",
    basic_rate: 1250.00,
    annexure: "Annexure-VII",
    printed_page: 346,
    notes: "Includes pit excavation, red soil manure and initial watering."
  },
  // Conveyance Slabs
  {
    item_code: "C-0001",
    category: "Conveyance & Head Load",
    sub_category: "Haulage",
    description: "Mechanical Transport Conveyance of Aggregates and Earth - Initial 1 km",
    unit: "cum",
    basic_rate: 140.00,
    annexure: "Annexure-IX",
    printed_page: 350,
    notes: "Table-I pucca road mechanical haulage."
  }
];

export const fallbackSampleCalculations: RateCalculateResponse[] = [
  {
    calculation_id: "CALC-SAMPLE-01",
    sor_version: "SOR-2026-27-V1",
    item_code: "M-0093",
    item_description: "HBGS Jelly 90 mm (Hard Broken Granite Stone)",
    official_unit: "cum.",
    source_rate: 544.0,
    input_quantity: 125.0,
    unit_conversions: {},
    base_formula: "125 cum. × ₹544.00",
    base_amount: 68000.0,
    applied_rules: [],
    excluded_rules: [],
    total_adjustments: 0.0,
    tax_treatment: {
      tax_percentage: 18.0,
      tax_amount: 0.0,
      is_separate: true,
      note: "Tax: Separately determined if applicable. Basic rates are strictly GST exclusive."
    },
    final_amount: 68000.0,
    source_reference: {
      annexure: "Annexure-II",
      printed_page: 314,
      pdf_page: 318,
      document_version: "SOR-2026-27-V1",
      effective_date: "2026-11-13"
    },
    validation_status: "VALID",
    warnings: [],
    assumptions: ["No additional incidental or loading charges automatically applied."],
    timestamp: "2026-11-19T13:00:00Z"
  },
  {
    calculation_id: "CALC-SAMPLE-02",
    sor_version: "SOR-2026-27-V1",
    item_code: "L-0099",
    item_description: "Bitumen Heat Master Operator",
    official_unit: "Day",
    source_rate: 1001.0,
    input_quantity: 5.0,
    unit_conversions: {},
    base_formula: "2 workers × 5 days × ₹1001.00/day",
    base_amount: 10010.0,
    applied_rules: [],
    excluded_rules: [],
    total_adjustments: 0.0,
    tax_treatment: {
      tax_percentage: 18.0,
      tax_amount: 0.0,
      is_separate: true,
      note: "Tax: Separately determined if applicable. Basic rates are strictly GST exclusive."
    },
    final_amount: 10010.0,
    source_reference: {
      annexure: "Annexure-I",
      printed_page: 313,
      pdf_page: 317,
      document_version: "SOR-2026-27-V1",
      effective_date: "2026-11-13"
    },
    validation_status: "VALID",
    warnings: [],
    assumptions: [],
    timestamp: "2026-11-19T13:05:00Z"
  }
];

export const fallbackBatchSheet: BatchCalculateResponse = {
  session_id: "SESS-SAMPLE-2026-01",
  sor_version: "SOR-2026-27-V1",
  title: "SH-49 Road Widening & Junction Improvement Calculation Sheet",
  project_id: 1,
  lines: fallbackSampleCalculations,
  total_basic_amount: 78010.0,
  total_adjustment_amount: 0.0,
  total_tax_amount: 0.0,
  grand_total_amount: 78010.0,
  validation_status: "VALID",
  warnings_count: 0,
  timestamp: "2026-11-19T13:10:00Z"
};
