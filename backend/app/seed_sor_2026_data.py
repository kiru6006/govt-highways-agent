"""
Seed Script: Tamil Nadu Schedule of Rates (SoR) 2026–2027, Volume I (w.e.f. 13/11/2026)
Governing Reference: PRD PRICE.md (SoR & Cost Intelligence)
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    SoRVersion, SoRItem, SoRAllowanceRule, SoREstimate,
    SoREstimateLine, SoRBOQItem, SoRReconciliationEntry,
    SoRAnomalyFinding, SoREvidenceLink, SoRAuditEvent, Project,
    SoRContractVariation, SoRQCTestLink, SoRApprovalTask, SoRDelegationRule,
    SoRIngestionJob, SoRStagedItem, SoRIngestionDiscrepancy
)


def seed_sor_master_data(db: Session = None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # 1. SoR Version Header
        version_id = "SOR-2026-27-V1"
        existing_version = db.query(SoRVersion).filter(SoRVersion.id == version_id).first()
        if not existing_version:
            v = SoRVersion(
                id=version_id,
                code="SOR-2026-27",
                title="Tamil Nadu Schedule of Rates 2026–2027, Volume I (Highways, PWD, WRD)",
                volume="Volume I",
                effective_from=datetime.date(2026, 11, 13),
                effective_to=None,
                go_reference="G.O. (Ms) No. 124, Highways & PWD Department, dated 13.11.2026",
                status="ACTIVE",
                is_current=True,
                published_at=datetime.datetime(2026, 11, 13, 10, 0, 0),
                published_by="Superintending Engineer (H), P&D Wing, Guindy, Chennai"
            )
            db.add(v)
            db.commit()
            print("[OK] Seeded SoR Version 2026-2027 Header (w.e.f. 13/11/2026)")

        # 2. Statutory Allowance & Area Rules (General Notes pp. 1-9)
        rules_data = [
            {
                "id": "RULE-CORP-10",
                "rule_code": "BR-CORP-10",
                "rule_title": "Corporation Allowance (Erstwhile Chennai + 32km, Madurai, Coimbatore, Hosur)",
                "category": "CORPORATION_LIMIT",
                "percentage_value": 10.0,
                "applies_to_component": "WORKS_AND_LABOUR",
                "source_citation": "General Note 1 & Table pp. 7-8",
                "condition_expr_json": '{"corporation_type": ["CHENNAI_32KM", "MADURAI_CBE_HOSUR"]}',
                "excluded_items_json": '["EXCLUDED_ANNEXURE_VI_VII_MATERIALS"]'
            },
            {
                "id": "RULE-CORP-05",
                "rule_code": "BR-CORP-05",
                "rule_title": "Other Municipal Corporation Limits (Trichy, Salem, Tirunelveli, Erode, Tiruppur, Vellore, Thoothukudi)",
                "category": "CORPORATION_LIMIT",
                "percentage_value": 5.0,
                "applies_to_component": "WORKS_AND_LABOUR",
                "source_citation": "General Note 2 & Table pp. 7-8",
                "condition_expr_json": '{"corporation_type": ["OTHER_CORP"]}',
                "excluded_items_json": '["EXCLUDED_ANNEXURE_VI_VII_MATERIALS"]'
            },
            {
                "id": "RULE-NIGHT-25",
                "rule_code": "BR-NIGHT-25",
                "rule_title": "Night Work Allowance in Corporation & Municipal Limits (Strictly Labour Component Only)",
                "category": "NIGHT_WORK",
                "percentage_value": 25.0,
                "applies_to_component": "LABOUR_ONLY",
                "source_citation": "Highways Annexure-I Note 2a & General Note 2",
                "condition_expr_json": '{"night_work_allowed": true, "tender_clause_required": true}',
                "excluded_items_json": '["MATERIALS", "EQUIPMENT_HIRE", "CONVEYANCE"]'
            },
            {
                "id": "RULE-BRIDGE-03",
                "rule_code": "BR-BRIDGE-03",
                "rule_title": "Highways Bridge Structural Component Provisional Allowance (Excludes Drains/Culverts/Repairs)",
                "category": "BRIDGE_PROVISIONAL",
                "percentage_value": 3.0,
                "applies_to_component": "STRUCTURAL_BRIDGE",
                "source_citation": "General Note 10, pp. 3 (Highways Bridge Works)",
                "condition_expr_json": '{"is_bridge_structural": true, "road_works_min_bridge_share_pct": 50.0}',
                "excluded_items_json": '["DRAIN", "CULVERT", "RETAINING_WALL", "REPAIR", "ROAD_PAVEMENT", "EARTHWORK"]'
            },
            {
                "id": "RULE-JAIL-10",
                "rule_code": "BR-JAIL-10",
                "rule_title": "Restricted Area - Central Jail Campus",
                "category": "RESTRICTED_AREA",
                "percentage_value": 10.0,
                "applies_to_component": "ALL_COMPONENTS",
                "source_citation": "General Note 3(i), pp. 2",
                "condition_expr_json": '{"restricted_area_type": "CENTRAL_JAIL"}',
                "excluded_items_json": '[]'
            },
            {
                "id": "RULE-FOREST-20",
                "rule_code": "BR-FOREST-20",
                "rule_title": "Restricted Area - Reserve Forest Areas",
                "category": "RESTRICTED_AREA",
                "percentage_value": 20.0,
                "applies_to_component": "ALL_COMPONENTS",
                "source_citation": "General Note 3(v), pp. 2",
                "condition_expr_json": '{"restricted_area_type": "RESERVE_FOREST"}',
                "excluded_items_json": '[]'
            },
            {
                "id": "RULE-CONV-LEAD",
                "rule_code": "BR-CONV-LEAD",
                "rule_title": "Conveyance & Head Load Statutory Standard Slabs",
                "category": "CONVEYANCE",
                "percentage_value": 0.0,
                "applies_to_component": "ALL_COMPONENTS",
                "source_citation": "General Note 8 & Highways Annexure II & IX",
                "condition_expr_json": '{"free_lead_meters": 10, "free_lift_meters": 2, "round_to_meters": 100}',
                "excluded_items_json": '["MATERIALS_WITH_AT_SITE_RATES"]'
            }
        ]

        for r in rules_data:
            existing_r = db.query(SoRAllowanceRule).filter(SoRAllowanceRule.id == r["id"]).first()
            if not existing_r:
                rule_obj = SoRAllowanceRule(
                    id=r["id"],
                    sor_version_id=version_id,
                    rule_code=r["rule_code"],
                    rule_title=r["rule_title"],
                    category=r["category"],
                    percentage_value=r["percentage_value"],
                    applies_to_component=r["applies_to_component"],
                    source_citation=r["source_citation"],
                    condition_expr_json=r["condition_expr_json"],
                    excluded_items_json=r["excluded_items_json"],
                    is_active=True
                )
                db.add(rule_obj)
        db.commit()
        print(f"[OK] Seeded {len(rules_data)} Statutory SoR Allowance Rules")

        # 3. Canonical SoR Master Items (Highways Sections pp. 311-352 & Common PWD)
        items_data = [
            # Labour (Annexure-I)
            {
                "id": "ITEM-L-001", "unique_code": "L-001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Unskilled",
                "description": "Mazdoor Category I (Heavy physical work, earthwork excavation, quarrying)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 625.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 20, "source_printed_page": 311, "validation_status": "VERIFIED",
                "notes_json": '{"gender_neutral": true, "minimum_wages_notified": true}'
            },
            {
                "id": "ITEM-L-002", "unique_code": "L-002", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Unskilled",
                "description": "Mazdoor Category II (Light physical work, watering, curing, spreading)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 580.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 20, "source_printed_page": 311, "validation_status": "VERIFIED",
                "notes_json": '{"gender_neutral": true}'
            },
            {
                "id": "ITEM-L-010", "unique_code": "L-010", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Skilled",
                "description": "Mason Category I (First class brickwork, dressed stone, bridge piers)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 920.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 21, "source_printed_page": 312, "validation_status": "VERIFIED",
                "notes_json": '{"trade_tested": true}'
            },
            {
                "id": "ITEM-L-015", "unique_code": "L-015", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Skilled",
                "description": "Blacksmith / Barbender (Cutting, bending, binding high tensile steel)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 910.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 21, "source_printed_page": 312, "validation_status": "VERIFIED",
                "notes_json": '{"bridge_qualified": true}'
            },
            {
                "id": "ITEM-L-020", "unique_code": "L-020", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Operators",
                "description": "Road Roller Driver / Heavy Plant Operator (Class-I license)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 980.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 22, "source_printed_page": 313, "validation_status": "VERIFIED",
                "notes_json": '{"license_verified": true}'
            },

            # Materials (Annexure-II)
            {
                "id": "ITEM-M-001", "unique_code": "M-001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Aggregates",
                "description": "Crushed Stone Aggregate 40mm nominal size (Machine crushed from hard granite)",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 1150.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 35, "source_printed_page": 318, "validation_status": "VERIFIED",
                "notes_json": '{"at_quarry": false, "incidental_loading_included": true}'
            },
            {
                "id": "ITEM-M-002", "unique_code": "M-002", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Aggregates",
                "description": "Crushed Stone Aggregate 20mm nominal size (Granite blue metal for bituminous works)",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 1420.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 35, "source_printed_page": 318, "validation_status": "VERIFIED",
                "notes_json": '{"flakiness_index_below_15": true}'
            },
            {
                "id": "ITEM-M-003", "unique_code": "M-003", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Aggregates",
                "description": "Crushed Stone Aggregate 10mm / 6mm nominal size (Fine metal for seal coat/BC)",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 1380.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 35, "source_printed_page": 318, "validation_status": "VERIFIED",
                "notes_json": '{"clean_washed": true}'
            },
            {
                "id": "ITEM-M-010", "unique_code": "M-010", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Sand",
                "description": "Manufactured Sand (M-Sand) for concrete conforming to IS 383 Zone-II",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 1280.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 36, "source_printed_page": 319, "validation_status": "VERIFIED",
                "notes_json": '{"environmental_green_approved": true}'
            },
            {
                "id": "ITEM-M-020", "unique_code": "M-020", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Cement",
                "description": "Portland Pozzolana Cement (PPC) conforming to IS 1489 in 50 kg bags",
                "unit_raw": "MT", "unit_canonical": "MT", "basic_rate": 6600.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 38, "source_printed_page": 320, "validation_status": "VERIFIED",
                "notes_json": '{"ex_godown": true, "bagged_50kg": true}'
            },
            {
                "id": "ITEM-M-025", "unique_code": "M-025", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Steel",
                "description": "Thermo-Mechanically Treated (TMT) Bars Fe-500D conforming to IS 1786",
                "unit_raw": "MT", "unit_canonical": "MT", "basic_rate": 58500.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 39, "source_printed_page": 321, "validation_status": "VERIFIED",
                "notes_json": '{"primary_producers_sail_tata_jsw": true}'
            },
            {
                "id": "ITEM-M-030", "unique_code": "M-030", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Bitumen",
                "description": "Paving Bitumen VG-30 Bulk (IOCL / BPCL / HPCL Refinery Supply)",
                "unit_raw": "MT", "unit_canonical": "MT", "basic_rate": 49200.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 42, "source_printed_page": 323, "validation_status": "VERIFIED",
                "notes_json": '{"ex_chennai_refinery": true, "bulk_supply": true}'
            },
            {
                "id": "ITEM-M-035", "unique_code": "M-035", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Bitumen",
                "description": "Bitumen Emulsion Rapid Setting (RS-1) for Tack Coat conforming to IS 8887",
                "unit_raw": "MT", "unit_canonical": "MT", "basic_rate": 42800.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 43, "source_printed_page": 324, "validation_status": "VERIFIED",
                "notes_json": '{"drummed": true}'
            },

            # Highways Works (Annexure-III)
            {
                "id": "ITEM-W-101", "unique_code": "W-101", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Earthwork",
                "description": "Earthwork excavation in all kinds of soil for roadway widening and formation to required gradient and camber, including lead up to 50m and lift up to 1.5m",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 184.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 55, "source_printed_page": 330, "validation_status": "VERIFIED",
                "notes_json": '{"lead_50m_lift_1_5m_included": true}'
            },
            {
                "id": "ITEM-W-105", "unique_code": "W-105", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Pavement Sub-Base",
                "description": "Construction of Granular Sub-Base (GSB) Grading-I by providing well-graded material, spreading in uniform layers with motor grader and compacting with smooth wheel vibratory roller",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 1650.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 58, "source_printed_page": 332, "validation_status": "VERIFIED",
                "notes_json": '{"cbr_min_30": true, "vibratory_roller_included": true}'
            },
            {
                "id": "ITEM-W-110", "unique_code": "W-110", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Pavement Base",
                "description": "Wet Mix Macadam (WMM): Providing, laying, spreading and compacting graded crushed stone aggregate wet mix macadam including premixing the material with water in mechanical mixing plant",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 2180.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 60, "source_printed_page": 334, "validation_status": "VERIFIED",
                "notes_json": '{"plant_mixed": true, "paver_laid": true}'
            },
            {
                "id": "ITEM-W-115", "unique_code": "W-115", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bituminous Surface",
                "description": "Prime Coat: Providing and applying primer coat with bitumen emulsion (SS-1) on prepared granular surface including clearing road surface @ 0.90 kg/sqm",
                "unit_raw": "sqm.", "unit_canonical": "SQM", "basic_rate": 58.5, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 62, "source_printed_page": 335, "validation_status": "VERIFIED",
                "notes_json": '{"pressure_distributor_used": true}'
            },
            {
                "id": "ITEM-W-116", "unique_code": "W-116", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bituminous Surface",
                "description": "Tack Coat: Providing and applying tack coat with bitumen emulsion (RS-1) @ 0.25 kg/sqm on prepared bituminous surface",
                "unit_raw": "sqm.", "unit_canonical": "SQM", "basic_rate": 22.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 62, "source_printed_page": 335, "validation_status": "VERIFIED",
                "notes_json": '{"rapid_setting": true}'
            },
            {
                "id": "ITEM-W-120", "unique_code": "W-120", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bituminous Course",
                "description": "Dense Bituminous Macadam (DBM) 50mm compacted thickness with batch type HMP using VG-30 bitumen @ 4.5% and crushed stone aggregate",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 6950.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 65, "source_printed_page": 337, "validation_status": "VERIFIED",
                "notes_json": '{"batch_plant_automated": true, "morth_spec_500": true}'
            },
            {
                "id": "ITEM-W-125", "unique_code": "W-125", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bituminous Course",
                "description": "Bituminous Concrete (BC) 40mm compacted thickness with polymer modified bitumen (PMB) or VG-30 bitumen @ 5.0% including sensor paver laying",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 8420.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 68, "source_printed_page": 339, "validation_status": "VERIFIED",
                "notes_json": '{"sensor_paver_mandatory": true, "riding_quality_index_tested": true}'
            },

            # Bridge & Structural Concrete (Annexure-III & IV)
            {
                "id": "ITEM-B-201", "unique_code": "B-201", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bridge Structure",
                "description": "Design Mix Concrete M35 grade for Prestressed Concrete (PSC) Girders and Deck Slab of Bridge structure, including mechanical batching, pump placing, and curing",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 7800.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 75, "source_printed_page": 343, "validation_status": "VERIFIED",
                "notes_json": '{"structural_bridge_component": true, "eligible_for_bridge_3pct_rule": true}'
            },
            {
                "id": "ITEM-B-202", "unique_code": "B-202", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Bridge Substructure",
                "description": "Design Mix Concrete M25 grade for Bridge Piers, Abutments, Wing walls and Well caps with automated weigh-batching",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 6450.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 76, "source_printed_page": 344, "validation_status": "VERIFIED",
                "notes_json": '{"structural_bridge_component": true, "eligible_for_bridge_3pct_rule": true}'
            },
            {
                "id": "ITEM-B-210", "unique_code": "B-210", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Roadside Drainage",
                "description": "Controlled Concrete M15 grade for roadside longitudinal trapezoidal/rectangular storm water drains and toe walls (Ineligible for Bridge 3% Allowance)",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 4850.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 80, "source_printed_page": 346, "validation_status": "VERIFIED",
                "notes_json": '{"structural_bridge_component": false, "eligible_for_bridge_3pct_rule": false, "guardrail_warning": "Blocked from Bridge 3% allowance"}'
            },
            {
                "id": "ITEM-B-215", "unique_code": "B-215", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Culverts",
                "description": "Pre-cast RCC Pipe Culvert 1000mm dia NP3 class with concrete bedding and head walls (Ineligible for Bridge 3% Allowance)",
                "unit_raw": "RM", "unit_canonical": "MTR", "basic_rate": 5200.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 82, "source_printed_page": 347, "validation_status": "VERIFIED",
                "notes_json": '{"structural_bridge_component": false, "eligible_for_bridge_3pct_rule": false}'
            },

            # Road Furniture & QC (Annexure-IV & V)
            {
                "id": "ITEM-F-301", "unique_code": "F-301", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IV", "category": "Road Furniture & QC", "sub_category": "Markings",
                "description": "Hot Applied Thermoplastic Road Marking Paint 2.5mm thick with surface glass beads conforming to MoRTH Section 803",
                "unit_raw": "sqm.", "unit_canonical": "SQM", "basic_rate": 595.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 88, "source_printed_page": 349, "validation_status": "VERIFIED",
                "notes_json": '{"retroreflectivity_min_200": true}'
            },
            {
                "id": "ITEM-F-305", "unique_code": "F-305", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IV", "category": "Road Furniture & QC", "sub_category": "Safety Barriers",
                "description": "Metal Beam Crash Barrier (W-Beam) hot dip galvanized, complete with posts, spacer, end terminals, and reflectorized hardware",
                "unit_raw": "RM", "unit_canonical": "MTR", "basic_rate": 3450.0, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 89, "source_printed_page": 350, "validation_status": "VERIFIED",
                "notes_json": '{"galvanized_550_gsm": true}'
            },
            {
                "id": "ITEM-F-320", "unique_code": "F-320", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IV", "category": "Road Furniture & QC", "sub_category": "Lab Testing",
                "description": "Concrete Test Cube Compressive Strength testing (set of 3 cubes) at Highways Research Station (HRS) or Divisional Quality Lab",
                "unit_raw": "Per Set", "unit_canonical": "SET", "basic_rate": 450.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 92, "source_printed_page": 351, "validation_status": "VERIFIED",
                "notes_json": '{"hrs_official_rate": true}'
            },

            # Tools & Plant Hire (Annexure-VIII)
            {
                "id": "ITEM-H-401", "unique_code": "H-401", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-VIII", "category": "Tools & Plant Hire", "sub_category": "Compaction",
                "description": "Vibratory Tandem Road Roller 8-10 Ton hire charges per day of 8 hours including crew, lubricants (excluding diesel fuel)",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 5200.0, "rate_type": "HIRE_PER_DAY",
                "source_pdf_page": 95, "source_printed_page": 352, "validation_status": "VERIFIED",
                "notes_json": '{"operator_included": true, "fuel_excluded": true}'
            },

            # Conveyance & Head Load (Annexure-IX)
            {
                "id": "ITEM-C-501", "unique_code": "C-501", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IX", "category": "Conveyance & Head Load", "sub_category": "Materials",
                "description": "Conveyance of Road Metals, Aggregates, Sand by tipper / lorry for the 1st km (Initial lead slab)",
                "unit_raw": "cum./km", "unit_canonical": "CUM_KM", "basic_rate": 140.0, "rate_type": "CONVEYANCE_SLAB",
                "source_pdf_page": 98, "source_printed_page": 353, "validation_status": "VERIFIED",
                "notes_json": '{"initial_km": 1}'
            },
            {
                "id": "ITEM-C-502", "unique_code": "C-502", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IX", "category": "Conveyance & Head Load", "sub_category": "Materials",
                "description": "Conveyance of Road Metals, Aggregates, Sand for subsequent km beyond 1st km up to 20 km",
                "unit_raw": "cum./km", "unit_canonical": "CUM_KM", "basic_rate": 18.5, "rate_type": "CONVEYANCE_SLAB",
                "source_pdf_page": 98, "source_printed_page": 353, "validation_status": "VERIFIED",
                "notes_json": '{"slab_2_to_20km": true}'
            },

            # Prompt-Specific Verified Items (Highways Annexures I to IX)
            {
                "id": "ITEM-M-0093", "unique_code": "M-0093", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-II", "category": "Material", "sub_category": "Aggregates",
                "description": "HBGS Jelly 90 mm (Hard Broken Granite Stone)",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 544.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 318, "source_printed_page": 314, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"no_additional_incidental_charges": true, "tax_separate": true}'
            },
            {
                "id": "ITEM-L-0099", "unique_code": "L-0099", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-I", "category": "Labour", "sub_category": "Plant Operations",
                "description": "Bitumen Heat Master Operator",
                "unit_raw": "Per Day", "unit_canonical": "DAY", "basic_rate": 1001.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 317, "source_printed_page": 313, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"night_work_restricted": true, "requires_tender_clause": true}'
            },
            {
                "id": "ITEM-W-0055", "unique_code": "W-0055", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-III", "category": "Highways Works", "sub_category": "Earthwork",
                "description": "Earth work ORDINARY SOIL (SS20B) initial lead 10m & lift 2m",
                "unit_raw": "cum.", "unit_canonical": "CUM", "basic_rate": 88.10, "rate_type": "COMPOSITE_WORK",
                "source_pdf_page": 320, "source_printed_page": 316, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"lead_10m_lift_2m_included": true}'
            },
            {
                "id": "ITEM-H-0001", "unique_code": "H-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IX", "category": "Tools & Plant Hire", "sub_category": "Earth Moving",
                "description": "Hydraulic Excavator 0.9 cum bucket hire charges including crew and consumables",
                "unit_raw": "Per Hour", "unit_canonical": "HOUR", "basic_rate": 2450.0, "rate_type": "HIRE_PER_HOUR",
                "source_pdf_page": 353, "source_printed_page": 349, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"operator_included": true, "fuel_excluded": false}'
            },
            {
                "id": "ITEM-RF-0001", "unique_code": "RF-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-V", "category": "Road Furniture & QC", "sub_category": "Traffic Signs",
                "description": "Retro-reflective Cautionary Signboard 90cm Triangle High-Intensity Microprismatic Grade",
                "unit_raw": "Each", "unit_canonical": "EACH", "basic_rate": 3850.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 333, "source_printed_page": 329, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"morth_section_800": true}'
            },
            {
                "id": "ITEM-SV-0001", "unique_code": "SV-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-VI", "category": "Survey & DPR", "sub_category": "Topographic Survey",
                "description": "Total Station Topographic Survey & Digital Ground Profiling for Highway Alignment",
                "unit_raw": "km", "unit_canonical": "KM", "basic_rate": 18500.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 348, "source_printed_page": 344, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"digital_deliverables": true}'
            },
            {
                "id": "ITEM-PL-0001", "unique_code": "PL-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-VII", "category": "Avenue Plantation", "sub_category": "Arboriculture",
                "description": "Tree Sapling Planting along highway right-of-way with 1.5m protective tree guard",
                "unit_raw": "Each", "unit_canonical": "EACH", "basic_rate": 1250.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 350, "source_printed_page": 346, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"watering_included_1_month": true}'
            },
            {
                "id": "ITEM-QC-0001", "unique_code": "QC-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IV", "category": "Road Furniture & QC", "sub_category": "Quality Testing",
                "description": "Core Cutter Test Rig for in-situ Asphalt/Bituminous Pavement Density & Thickness Determination",
                "unit_raw": "Per Test", "unit_canonical": "TEST", "basic_rate": 450.0, "rate_type": "BASIC_RATE",
                "source_pdf_page": 332, "source_printed_page": 328, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"official_hrs_testing": true}'
            },
            {
                "id": "ITEM-C-0001", "unique_code": "C-0001", "department_scope": "HIGHWAYS",
                "annexure_code": "ANNEXURE-IX", "category": "Conveyance & Head Load", "sub_category": "Lead Slabs",
                "description": "Mechanical Transport Conveyance of Aggregates and Earth for 1st km Initial Lead",
                "unit_raw": "cum", "unit_canonical": "CUM", "basic_rate": 140.0, "rate_type": "CONVEYANCE_SLAB",
                "source_pdf_page": 354, "source_printed_page": 350, "validation_status": "SOURCE_VERIFIED",
                "notes_json": '{"table_1_highways": true}'
            }
        ]

        for it in items_data:
            existing_it = db.query(SoRItem).filter(SoRItem.id == it["id"]).first()
            if not existing_it:
                item_obj = SoRItem(
                    id=it["id"],
                    sor_version_id=version_id,
                    unique_code=it["unique_code"],
                    department_scope=it["department_scope"],
                    annexure_code=it["annexure_code"],
                    category=it["category"],
                    sub_category=it.get("sub_category"),
                    description=it["description"],
                    unit_raw=it["unit_raw"],
                    unit_canonical=it["unit_canonical"],
                    basic_rate=it["basic_rate"],
                    rate_type=it["rate_type"],
                    source_pdf_page=it.get("source_pdf_page"),
                    source_printed_page=it.get("source_printed_page"),
                    tax_inclusive=False,
                    validation_status=it["validation_status"],
                    notes_json=it.get("notes_json")
                )
                db.add(item_obj)
        db.commit()
        print(f"[OK] Seeded {len(items_data)} Canonical SoR 2026-2027 Master Items")

        # 4. Sample Work Estimates & BOQ Lines
        # Find an existing Project to link to, or link cleanly
        sample_project = db.query(Project).first()
        proj_id = sample_project.id if sample_project else None

        estimates_data = [
            {
                "id": "EST-2026-CHN-001",
                "estimate_code": "EST-2026-CHN-001",
                "title": "Widening from 2-lane to 4-lane & Strengthening of SH-49 (ECR) Km 22/0 - 30/0",
                "division_name": "Chengalpattu",
                "circle_name": "Chengalpattu",
                "road_category": "SH",
                "is_corporation_area": True,
                "corporation_type": "CHENNAI_32KM",
                "is_night_work_allowed": True,
                "night_work_tender_clause": "Tender Spec Clause 14.3 (Traffic Corridor Night Work)",
                "is_bridge_work": False,
                "bridge_cost_share_pct": 12.5,
                "total_basic_amount": 14500000.0,
                "total_allowance_amount": 1450000.0,  # 10% Corp allowance on applicable
                "total_tax_amount": 2871000.0,        # 18% GST separate
                "grand_total": 18821000.0,
                "status": "SANCTIONED",
                "sanction_authority_post": "Chief Engineer (Highways), C&M, Chennai Region",
                "sanction_order_ref": "G.O. (Ms) No. 182 / TS No. CE/CHN/44/2026-27",
                "created_by": "Er. S. Palanivel, DE (C&M)",
                "lines": [
                    {
                        "id": "LINE-CHN-001", "line_no": 1, "sor_item_id": "ITEM-W-101",
                        "item_code": "W-101", "description": "Earthwork excavation in all kinds of soil for widening",
                        "structural_component_type": "EARTHWORK", "quantity": 12000.0, "unit": "CUM",
                        "lead_km": 0.05, "lift_meters": 1.5, "basic_rate_snapshot": 184.0,
                        "allowance_rate_snapshot": 18.4, "effective_rate": 202.4, "line_total": 2428800.0,
                        "calculation_trace_json": '{"base": 184.0, "corp_10pct": 18.4, "effective": 202.4, "qty": 12000.0}'
                    },
                    {
                        "id": "LINE-CHN-002", "line_no": 2, "sor_item_id": "ITEM-W-105",
                        "item_code": "W-105", "description": "Granular Sub-Base (GSB) Grading-I (200mm thick)",
                        "structural_component_type": "ROAD_PAVEMENT", "quantity": 3500.0, "unit": "CUM",
                        "lead_km": 15.0, "lift_meters": 0.0, "basic_rate_snapshot": 1650.0,
                        "allowance_rate_snapshot": 165.0, "effective_rate": 1815.0, "line_total": 6352500.0,
                        "calculation_trace_json": '{"base": 1650.0, "corp_10pct": 165.0, "lead_15km_conveyance": 399.0, "effective": 2214.0}'
                    },
                    {
                        "id": "LINE-CHN-003", "line_no": 3, "sor_item_id": "ITEM-W-125",
                        "item_code": "W-125", "description": "Bituminous Concrete (BC) 40mm wearing coat with VG-30",
                        "structural_component_type": "ROAD_PAVEMENT", "quantity": 680.0, "unit": "CUM",
                        "lead_km": 8.0, "lift_meters": 0.0, "basic_rate_snapshot": 8420.0,
                        "allowance_rate_snapshot": 842.0, "effective_rate": 9262.0, "line_total": 6298160.0,
                        "calculation_trace_json": '{"base": 8420.0, "corp_10pct": 842.0, "effective": 9262.0, "qty": 680.0}'
                    }
                ]
            },
            {
                "id": "EST-2026-MDU-002",
                "estimate_code": "EST-2026-MDU-002",
                "title": "Construction of High-Level Bridge across Vaigai River at Km 4/2 on SH-72",
                "division_name": "Madurai",
                "circle_name": "Madurai",
                "road_category": "BRIDGE",
                "is_corporation_area": True,
                "corporation_type": "MADURAI_CBE_HOSUR",
                "is_night_work_allowed": False,
                "night_work_tender_clause": None,
                "is_bridge_work": True,
                "bridge_cost_share_pct": 78.4,  # Bridge work >50%, structural items eligible for 3%
                "total_basic_amount": 28400000.0,
                "total_allowance_amount": 3692000.0,  # 10% Corp + 3% Bridge structural allowance
                "total_tax_amount": 5776560.0,
                "grand_total": 37868560.0,
                "status": "SCRUTINY_PASSED",
                "sanction_authority_post": "Director General, Highways Department",
                "sanction_order_ref": "G.O. (Ms) No. 94 / TS No. DG/BR/12/2026-27",
                "created_by": "Er. K. Ramesh, SE (Highways)",
                "lines": [
                    {
                        "id": "LINE-MDU-001", "line_no": 1, "sor_item_id": "ITEM-B-201",
                        "item_code": "B-201", "description": "Design Mix Concrete M35 for PSC Girders & Bridge Deck Slab",
                        "structural_component_type": "STRUCTURAL_BRIDGE", "quantity": 1450.0, "unit": "CUM",
                        "lead_km": 6.0, "lift_meters": 12.0, "basic_rate_snapshot": 7800.0,
                        "allowance_rate_snapshot": 1014.0, "effective_rate": 8814.0, "line_total": 12780300.0,
                        "calculation_trace_json": '{"base": 7800.0, "corp_10pct": 780.0, "bridge_3pct_eligible": 234.0, "total_allowance": 1014.0, "effective": 8814.0}'
                    },
                    {
                        "id": "LINE-MDU-002", "line_no": 2, "sor_item_id": "ITEM-B-202",
                        "item_code": "B-202", "description": "Design Mix Concrete M25 for Bridge Piers and Well Foundation",
                        "structural_component_type": "STRUCTURAL_BRIDGE", "quantity": 1800.0, "unit": "CUM",
                        "lead_km": 6.0, "lift_meters": 8.0, "basic_rate_snapshot": 6450.0,
                        "allowance_rate_snapshot": 838.5, "effective_rate": 7288.5, "line_total": 13119300.0,
                        "calculation_trace_json": '{"base": 6450.0, "corp_10pct": 645.0, "bridge_3pct_eligible": 193.5, "total_allowance": 838.5, "effective": 7288.5}'
                    },
                    {
                        "id": "LINE-MDU-003", "line_no": 3, "sor_item_id": "ITEM-B-210",
                        "item_code": "B-210", "description": "Concrete M15 for approach roadside retaining drain (Ineligible for 3%)",
                        "structural_component_type": "DRAIN", "quantity": 520.0, "unit": "CUM",
                        "lead_km": 6.0, "lift_meters": 0.0, "basic_rate_snapshot": 4850.0,
                        "allowance_rate_snapshot": 485.0, "effective_rate": 5335.0, "line_total": 2774200.0,
                        "calculation_trace_json": '{"base": 4850.0, "corp_10pct": 485.0, "bridge_3pct_blocked": "Drain item excluded from 3% provision", "effective": 5335.0}'
                    }
                ]
            }
        ]

        for est in estimates_data:
            existing_est = db.query(SoREstimate).filter(SoREstimate.id == est["id"]).first()
            if not existing_est:
                lines = est.pop("lines")
                est_obj = SoREstimate(
                    id=est["id"],
                    estimate_code=est["estimate_code"],
                    project_id=proj_id,
                    project_code="PRJ-SH49-CHN",
                    estimate_type="TECHNICAL",
                    sor_version_id=version_id,
                    title=est["title"],
                    division_name=est["division_name"],
                    circle_name=est["circle_name"],
                    road_category=est["road_category"],
                    is_corporation_area=est["is_corporation_area"],
                    corporation_type=est["corporation_type"],
                    is_night_work_allowed=est["is_night_work_allowed"],
                    night_work_tender_clause=est["night_work_tender_clause"],
                    is_bridge_work=est["is_bridge_work"],
                    bridge_cost_share_pct=est["bridge_cost_share_pct"],
                    total_basic_amount=est["total_basic_amount"],
                    total_allowance_amount=est["total_allowance_amount"],
                    total_tax_amount=est["total_tax_amount"],
                    grand_total=est["grand_total"],
                    status=est["status"],
                    sanction_authority_post=est["sanction_authority_post"],
                    sanction_order_ref=est["sanction_order_ref"],
                    created_by=est["created_by"]
                )
                db.add(est_obj)
                db.flush()

                for ln in lines:
                    line_obj = SoREstimateLine(
                        id=ln["id"],
                        estimate_id=est_obj.id,
                        line_no=ln["line_no"],
                        sor_item_id=ln["sor_item_id"],
                        item_code=ln["item_code"],
                        description=ln["description"],
                        structural_component_type=ln["structural_component_type"],
                        quantity=ln["quantity"],
                        unit=ln["unit"],
                        lead_km=ln["lead_km"],
                        lift_meters=ln["lift_meters"],
                        basic_rate_snapshot=ln["basic_rate_snapshot"],
                        conveyance_rate_snapshot=0.0,
                        allowance_rate_snapshot=ln["allowance_rate_snapshot"],
                        effective_rate=ln["effective_rate"],
                        line_total=ln["line_total"],
                        calculation_trace_json=ln["calculation_trace_json"]
                    )
                    db.add(line_obj)

                    # Also seed a corresponding BOQ item
                    boq_obj = SoRBOQItem(
                        id=f"BOQ-{ln['id']}",
                        estimate_id=est_obj.id,
                        project_id=proj_id,
                        boq_item_no=f"BOQ-{ln['line_no']}",
                        item_code=ln["item_code"],
                        description=ln["description"],
                        unit=ln["unit"],
                        estimated_qty=ln["quantity"],
                        estimated_rate=ln["effective_rate"],
                        estimated_amount=ln["line_total"],
                        tender_quoted_rate=round(ln["effective_rate"] * 1.045, 2),  # +4.5% tender premium
                        tender_amount=round(ln["line_total"] * 1.045, 2),
                        contractor_rate_variance_pct=4.5,
                        status="SANCTIONED"
                    )
                    db.add(boq_obj)
        db.commit()
        print(f"[OK] Seeded Sample Estimates, Lines & BOQ Items")

        # 5. Seed Measurement Book & Billing Reconciliation Entries
        reconciliation_data = [
            {
                "id": "RECON-001",
                "estimate_id": "EST-2026-CHN-001",
                "boq_item_id": "BOQ-LINE-CHN-001",
                "boq_item_no": "BOQ-1",
                "item_code": "W-101",
                "mb_record_ref": "MB-512/p.28 (AEE Scrutinized)",
                "bill_voucher_no": "CC-01/RA-01",
                "boq_qty": 12000.0,
                "measured_qty": 11850.0,
                "billed_qty": 11850.0,
                "boq_rate": 202.4,
                "billed_rate": 211.5,
                "qty_delta": -150.0,
                "amount_delta": 107835.0,
                "variance_pct": -1.25,
                "reconciliation_status": "MATCHED"
            },
            {
                "id": "RECON-002",
                "estimate_id": "EST-2026-CHN-001",
                "boq_item_id": "BOQ-LINE-CHN-002",
                "boq_item_no": "BOQ-2",
                "item_code": "W-105",
                "mb_record_ref": "MB-512/p.44 (AE Recorded)",
                "bill_voucher_no": "CC-02/RA-02",
                "boq_qty": 3500.0,
                "measured_qty": 3480.0,
                "billed_qty": 3950.0,  # 470 cum billed in excess of MB record!
                "boq_rate": 1815.0,
                "billed_rate": 1896.67,
                "qty_delta": 470.0,
                "amount_delta": 891435.0,
                "variance_pct": 13.5,
                "reconciliation_status": "QUANTITY_VARIANCE"
            }
        ]

        for rc in reconciliation_data:
            existing_rc = db.query(SoRReconciliationEntry).filter(SoRReconciliationEntry.id == rc["id"]).first()
            if not existing_rc:
                rc_obj = SoRReconciliationEntry(
                    id=rc["id"],
                    estimate_id=rc["estimate_id"],
                    boq_item_id=rc["boq_item_id"],
                    project_id=proj_id,
                    boq_item_no=rc["boq_item_no"],
                    item_code=rc["item_code"],
                    mb_record_ref=rc["mb_record_ref"],
                    bill_voucher_no=rc["bill_voucher_no"],
                    boq_qty=rc["boq_qty"],
                    measured_qty=rc["measured_qty"],
                    billed_qty=rc["billed_qty"],
                    boq_rate=rc["boq_rate"],
                    billed_rate=rc["billed_rate"],
                    qty_delta=rc["qty_delta"],
                    amount_delta=rc["amount_delta"],
                    variance_pct=rc["variance_pct"],
                    reconciliation_status=rc["reconciliation_status"]
                )
                db.add(rc_obj)
        db.commit()
        print(f"[OK] Seeded Sample Reconciliation Entries (MB vs Billed)")

        # 5b. Seed Contract Variations & Revised Estimate Lines
        variations_data = [
            {
                "id": "VAR-2026-001",
                "variation_number": "VAR-2026-001",
                "item_code": "W-1001",
                "description": "Dense Bituminous Macadam (DBM) 100mm Grade-II over Granular Sub-Base",
                "unit": "cum.",
                "original_sanctioned_qty": 350.0,
                "proposed_revised_qty": 410.0,
                "qty_delta": 60.0,
                "original_rate": 8450.0,
                "proposed_rate": 8450.0,
                "rate_delta": 0.0,
                "financial_impact_cr": 0.0507,
                "justification_code": "SITE_CONDITION",
                "justification_details": "Unforeseen subgrade soft soil pocket at km 14/400-14/600 requiring additional 60 cum DBM leveling course.",
                "approval_status": "RECOMMENDED_SE",
                "delegation_order_ref": "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
                "sanctioning_authority": "Superintending Engineer (SE) - Powers up to ₹7.00 Crores"
            },
            {
                "id": "VAR-2026-002",
                "variation_number": "VAR-2026-002",
                "item_code": "W-0055",
                "description": "Earthwork excavation in all soils SS20B including lead & lift",
                "unit": "cum.",
                "original_sanctioned_qty": 5000.0,
                "proposed_revised_qty": 5800.0,
                "qty_delta": 800.0,
                "original_rate": 88.10,
                "proposed_rate": 88.10,
                "rate_delta": 0.0,
                "financial_impact_cr": 0.0070,
                "justification_code": "DRAINAGE_AUGMENTATION",
                "justification_details": "Side drain widening to prevent waterlogging as recommended in field review.",
                "approval_status": "SANCTIONED_DE",
                "delegation_order_ref": "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
                "sanctioning_authority": "Divisional Engineer (DE) - Full Powers up to ₹50 Lakhs"
            }
        ]

        for vd in variations_data:
            existing_vd = db.query(SoRContractVariation).filter(SoRContractVariation.id == vd["id"]).first()
            if not existing_vd:
                v_obj = SoRContractVariation(
                    id=vd["id"],
                    project_id=proj_id,
                    estimate_id="EST-2026-001",
                    variation_number=vd["variation_number"],
                    item_code=vd["item_code"],
                    description=vd["description"],
                    unit=vd["unit"],
                    original_sanctioned_qty=vd["original_sanctioned_qty"],
                    proposed_revised_qty=vd["proposed_revised_qty"],
                    qty_delta=vd["qty_delta"],
                    original_rate=vd["original_rate"],
                    proposed_rate=vd["proposed_rate"],
                    rate_delta=vd["rate_delta"],
                    financial_impact_cr=vd["financial_impact_cr"],
                    justification_code=vd["justification_code"],
                    justification_details=vd["justification_details"],
                    approval_status=vd["approval_status"],
                    delegation_order_ref=vd["delegation_order_ref"],
                    sanctioning_authority=vd["sanctioning_authority"],
                    created_at=datetime.datetime.utcnow()
                )
                db.add(v_obj)
        db.commit()
        print(f"[OK] Seeded Sample Contract Variations")

        # 5c. Seed QC Equipment & Lab Test Record Linkages
        qc_data = [
            {
                "id": "QC-TEST-001",
                "reconciliation_id": "RECON-001",
                "item_code": "W-1001",
                "test_type": "CORE_CUTTER_DENSITY",
                "equipment_code": "QC-0001",
                "morth_spec_clause": "MORTH Section 500 Cl. 505.4",
                "sample_chainage": "km 14/250 - 14/350 LHS",
                "lab_test_certificate_no": "QCL-CHN-2026-C042",
                "test_result_value": "99.4% Field Density",
                "required_benchmark": "Min 98.0% of Marshall Density",
                "compliance_status": "COMPLIANT",
                "qc_engineer_name": "Er. R. Murugan, AEE (QC)"
            },
            {
                "id": "QC-TEST-002",
                "reconciliation_id": "RECON-002",
                "item_code": "B-201",
                "test_type": "CONCRETE_COMPRESSIVE_STRENGTH_28D",
                "equipment_code": "QC-0002",
                "morth_spec_clause": "MORTH Section 1700 Table 1700-4",
                "sample_chainage": "km 14/800 Deck Slab Pour-3",
                "lab_test_certificate_no": "QCL-CHN-2026-C089",
                "test_result_value": "39.8 MPa (28 Days)",
                "required_benchmark": "Target Mean Strength >= 35.0 MPa",
                "compliance_status": "COMPLIANT",
                "qc_engineer_name": "Er. K. Shanmugam, AE (QC Lab)"
            }
        ]

        for qd in qc_data:
            existing_qd = db.query(SoRQCTestLink).filter(SoRQCTestLink.id == qd["id"]).first()
            if not existing_qd:
                q_obj = SoRQCTestLink(
                    id=qd["id"],
                    project_id=proj_id,
                    reconciliation_id=qd["reconciliation_id"],
                    item_code=qd["item_code"],
                    test_type=qd["test_type"],
                    equipment_code=qd["equipment_code"],
                    morth_spec_clause=qd["morth_spec_clause"],
                    sample_chainage=qd["sample_chainage"],
                    lab_test_certificate_no=qd["lab_test_certificate_no"],
                    test_result_value=qd["test_result_value"],
                    required_benchmark=qd["required_benchmark"],
                    compliance_status=qd["compliance_status"],
                    qc_engineer_name=qd["qc_engineer_name"],
                    tested_at=datetime.datetime.utcnow()
                )
                db.add(q_obj)
        db.commit()
        print(f"[OK] Seeded Sample QC Test Record Links")

        # 6. Seed 10-Point Structured Cost Anomaly Findings (Neutral Language)
        anomalies_data = [
            {
                "id": "FINDING-2026-001",
                "finding_code": "ANOMALY-BR03-01",
                "finding_type": "INELIGIBLE_BRIDGE_ALLOWANCE",
                "severity": "HIGH",
                "item_code": "B-210",
                "what_should_have_happened": "Under General Note 10 (pp. 3), 3% provisional allowance is strictly restricted to structural bridge deck/piers; roadside drains and retaining walls must be priced with 0% extra.",
                "what_actually_happened": "Preliminary estimate draft applied 3% provisional allowance to roadside M15 drain concrete items (B-210) across 520 cum.",
                "applicable_rule_control": "General Note 10: 'Provisional allowance of 3% restricted to structural components of bridge works only; excluded for drains, culverts and retaining walls'.",
                "difference_amount": 75660.0,
                "potential_exposure_amount": 75660.0,
                "probable_cause": "Subdivision junior engineer inadvertently included line item B-210 inside the structural concrete calculation bundle.",
                "contractor_justification": "Preliminary submission error prior to technical scrutiny gate.",
                "evidence_summary": "Estimate lines comparison trace against SoR 2026-27 General Note 10.",
                "investigating_official": "Er. S. Palanivel, CE (H), C&M",
                "preventive_action": "Automated calculation guardrail blocks B-210 from selecting 3% structural allowance.",
                "review_status": "REQUIRES_REVISION"
            },
            {
                "id": "FINDING-2026-002",
                "finding_code": "ANOMALY-MB-02",
                "finding_type": "MB_BILL_QUANTITY_INFLATION",
                "severity": "CRITICAL",
                "item_code": "W-105",
                "what_should_have_happened": "Billed quantities in RA-02 should exactly match or be less than certified entries in Measurement Book (MB-512/p.44) of 3,480 cum.",
                "what_actually_happened": "RA Bill No. 2 claimed 3,950 cum of GSB, exceeding certified MB measurements by 470 cum.",
                "applicable_rule_control": "Tamil Nadu Highways Department Code Section 132: 'No payment shall be made for work without verification in Measurement Book signed by AE and test checked by AEE'.",
                "difference_amount": 891435.0,
                "potential_exposure_amount": 891435.0,
                "probable_cause": "Advance payment claimed for delivered uncompacted metal before final rolling and field measurement book entry.",
                "contractor_justification": "Material stacked at site awaiting final density test verification.",
                "evidence_summary": "Discrepancy report comparing MB-512 page 44 with CC-02/RA-02 voucher.",
                "investigating_official": "Divisional Engineer, Chengalpattu Division",
                "preventive_action": "Enforce MB entry cross-check before generating RA bill sanction token.",
                "review_status": "OPEN"
            },
            {
                "id": "FINDING-2026-003",
                "finding_code": "ANOMALY-NIGHT-03",
                "finding_type": "EXCESS_NIGHT_WORK_ALLOWANCE",
                "severity": "MEDIUM",
                "item_code": "W-120",
                "what_should_have_happened": "Night work 25% allowance must be computed strictly on the labour component of the composite item.",
                "what_actually_happened": "25% was applied on the full composite work rate of DBM including materials and bitumen.",
                "applicable_rule_control": "Highways Annexure-I Note 2a: '25% extra allowance is applicable on labour only for work executed at night'.",
                "difference_amount": 348200.0,
                "potential_exposure_amount": 348200.0,
                "probable_cause": "Rate analysis spreadsheet applied 25% multiplication to gross item total rather than decomposed labour rate.",
                "contractor_justification": "Claim was submitted based on general municipal overtime rates.",
                "evidence_summary": "Highways Annexure-I Note 2a clause citation.",
                "investigating_official": "Superintending Engineer (Highways), Chennai Circle",
                "preventive_action": "Backend decomposition engine isolates labour component prior to applying 25% multiplier.",
                "review_status": "JUSTIFIED_EXCEPTION",
                "reviewed_by": "Er. S. Palanivel, CE (H), C&M",
                "reviewed_at": datetime.datetime(2026, 11, 15, 14, 30, 0)
            }
        ]

        for an in anomalies_data:
            existing_an = db.query(SoRAnomalyFinding).filter(SoRAnomalyFinding.id == an["id"]).first()
            if not existing_an:
                an_obj = SoRAnomalyFinding(
                    id=an["id"],
                    finding_code=an["finding_code"],
                    project_id=proj_id,
                    estimate_id="EST-2026-CHN-001",
                    finding_type=an["finding_type"],
                    severity=an["severity"],
                    item_code=an["item_code"],
                    what_should_have_happened=an["what_should_have_happened"],
                    what_actually_happened=an["what_actually_happened"],
                    applicable_rule_control=an["applicable_rule_control"],
                    difference_amount=an["difference_amount"],
                    potential_exposure_amount=an["potential_exposure_amount"],
                    probable_cause=an["probable_cause"],
                    contractor_justification=an["contractor_justification"],
                    evidence_summary=an["evidence_summary"],
                    investigating_official=an["investigating_official"],
                    preventive_action=an["preventive_action"],
                    review_status=an["review_status"],
                    reviewed_by=an.get("reviewed_by"),
                    reviewed_at=an.get("reviewed_at")
                )
                db.add(an_obj)
        db.commit()
        print(f"[OK] Seeded 10-Point Structured Anomaly Findings")

        # 7. Seed Immutable Audit Events
        audit_events_data = [
            {
                "id": "AUDIT-2026-001",
                "event_time": datetime.datetime(2026, 11, 13, 11, 0, 0),
                "actor_username": "admin",
                "actor_role": "ADMIN",
                "jurisdiction": "STATEWIDE",
                "action_type": "SOR_VERSION_PUBLISHED",
                "target_entity_type": "SOR_VERSION",
                "target_entity_id": "SOR-2026-27-V1",
                "summary": "Statutory publication of Tamil Nadu Schedule of Rates 2026–2027 Volume I w.e.f. 13.11.2026."
            },
            {
                "id": "AUDIT-2026-002",
                "event_time": datetime.datetime(2026, 11, 14, 15, 30, 0),
                "actor_username": "ce_chennai",
                "actor_role": "ROLE_CHIEF_ENGINEER",
                "jurisdiction": "CHENNAI_ZONE",
                "action_type": "ESTIMATE_TECHNICAL_SANCTION",
                "target_entity_type": "SOR_ESTIMATE",
                "target_entity_id": "EST-2026-CHN-001",
                "summary": "Technical Sanction accorded for SH-49 widening estimate (₹1.88 Cr) with 10% Corp allowance."
            },
            {
                "id": "AUDIT-2026-003",
                "event_time": datetime.datetime(2026, 11, 15, 16, 0, 0),
                "actor_username": "ce_chennai",
                "actor_role": "ROLE_CHIEF_ENGINEER",
                "jurisdiction": "CHENNAI_ZONE",
                "action_type": "FINDING_DISPOSED",
                "target_entity_type": "SOR_ANOMALY_FINDING",
                "target_entity_id": "FINDING-2026-003",
                "summary": "Finding ANOMALY-NIGHT-03 reviewed and closed as Justified Exception following rate analysis re-audit."
            }
        ]

        for ae in audit_events_data:
            existing_ae = db.query(SoRAuditEvent).filter(SoRAuditEvent.id == ae["id"]).first()
            if not existing_ae:
                ae_obj = SoRAuditEvent(
                    id=ae["id"],
                    event_time=ae["event_time"],
                    actor_username=ae["actor_username"],
                    actor_role=ae["actor_role"],
                    jurisdiction=ae["jurisdiction"],
                    action_type=ae["action_type"],
                    target_entity_type=ae["target_entity_type"],
                    target_entity_id=ae["target_entity_id"],
                    summary=ae["summary"]
                )
                db.add(ae_obj)
        db.commit()
        print(f"[OK] Seeded Initial SoR Audit Events")

        # 8. Seed Statutory Approval Tasks & Workflow Queue
        approval_tasks_data = [
            {
                "id": "TASK-2026-001",
                "task_code": "TASK-2026-001",
                "entity_type": "ESTIMATE",
                "entity_id": "EST-2026-001",
                "title": "Technical Sanction Scrutiny: SH-112 Expressway Widening (Chainage 12/000 - 18/500)",
                "description": "Technical estimate scrutiny for DBM, BC, and cross drainage structures under SoR 2026-2027 Volume I.",
                "amount_involved_cr": 4.20,
                "delegation_tier": "SE",
                "delegation_statute": "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
                "required_role": "Superintending Engineer",
                "submitted_by": "Er. P. Sivakumar, DE (H), C&M Chengalpattu",
                "status": "PENDING"
            },
            {
                "id": "TASK-2026-002",
                "task_code": "TASK-2026-002",
                "entity_type": "VARIATION",
                "entity_id": "VAR-2026-001",
                "title": "Contract Variation: Additional 60 cum DBM Subgrade Settlement",
                "description": "Leveling course augmentation between km 14/400-14/600 due to unforeseen soft subgrade.",
                "amount_involved_cr": 0.0507,
                "delegation_tier": "DE",
                "delegation_statute": "G.O.(Ms) No. 11 w.e.f. 21.01.2022",
                "required_role": "Divisional Engineer",
                "submitted_by": "Er. R. Murugan, AEE (H), Sriperumbudur",
                "status": "APPROVED",
                "decision_notes": "Sanctioned under DE delegated powers (<= ₹50 Lakhs) following site inspection on 17/11/2026.",
                "decided_by": "Er. P. Sivakumar (Divisional Engineer)"
            },
            {
                "id": "TASK-2026-003",
                "task_code": "TASK-2026-003",
                "entity_type": "TENDER_SCHEDULE",
                "entity_id": "TENDER-2026-042",
                "title": "Tender Excess Acceptance: Palar Bridge High-Level Reconstruction (+4.2% Excess)",
                "description": "Lowest tender bid received at +4.2% excess over technical estimate within the statutory 5% SE limit.",
                "amount_involved_cr": 0.98,
                "delegation_tier": "SE",
                "delegation_statute": "G.O.(Ms) No. 29 w.e.f. 03.03.2022",
                "required_role": "Superintending Engineer",
                "submitted_by": "Er. M. Rajendran, DE (H), Projects Division-II",
                "status": "PENDING"
            },
            {
                "id": "TASK-2026-004",
                "task_code": "TASK-2026-004",
                "entity_type": "RATE_EXCEPTION",
                "entity_id": "FINDING-2026-002",
                "title": "Rate Exception Review: Night Work Lighting Claim Verification",
                "description": "Verification of contractor claim for night work illumination allowance without approved tender condition.",
                "amount_involved_cr": 0.0125,
                "delegation_tier": "AEE",
                "delegation_statute": "General Note 8(vii) SoR 2026-2027",
                "required_role": "Assistant Executive Engineer",
                "submitted_by": "Er. S. Annamalai, AE (H), Quality Control",
                "status": "RETURNED_FOR_CORRECTION",
                "decision_notes": "Returned. Clause 14.2 of contract document does not mandate night operations; restrict claim to daylight work items.",
                "decided_by": "Er. R. Murugan (Assistant Executive Engineer)"
            }
        ]

        for at in approval_tasks_data:
            existing_at = db.query(SoRApprovalTask).filter(SoRApprovalTask.id == at["id"]).first()
            if not existing_at:
                at_obj = SoRApprovalTask(
                    id=at["id"],
                    task_code=at["task_code"],
                    project_id=proj_id,
                    entity_type=at["entity_type"],
                    entity_id=at["entity_id"],
                    title=at["title"],
                    description=at["description"],
                    amount_involved_cr=at["amount_involved_cr"],
                    delegation_tier=at["delegation_tier"],
                    delegation_statute=at["delegation_statute"],
                    required_role=at["required_role"],
                    submitted_by=at["submitted_by"],
                    status=at["status"],
                    decision_notes=at.get("decision_notes"),
                    decided_by=at.get("decided_by"),
                    decided_at=datetime.datetime.utcnow() if at.get("decided_by") else None,
                    created_at=datetime.datetime.utcnow()
                )
                db.add(at_obj)
        db.commit()
        print(f"[OK] Seeded Statutory Approval Tasks")

        # 9. Seed Statutory Delegation of Powers Rules Matrix (G.O. 11 & G.O. 29)
        delegation_rules_data = [
            {
                "id": "DEL-TS-DE",
                "rule_code": "DEL-TS-DE",
                "statute_reference": "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
                "delegation_category": "TECHNICAL_SANCTION",
                "officer_cadre": "Divisional Engineer (DE)",
                "monetary_limit_cr": 0.50,
                "percentage_excess_limit": 0.0,
                "jurisdiction_scope": "Division Jurisdiction",
                "mandatory_conditions": "Full powers up to ₹50.00 Lakhs for road and bridge works strictly based on approved Schedule of Rates without excess."
            },
            {
                "id": "DEL-TS-SE",
                "rule_code": "DEL-TS-SE",
                "statute_reference": "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
                "delegation_category": "TECHNICAL_SANCTION",
                "officer_cadre": "Superintending Engineer (SE)",
                "monetary_limit_cr": 7.00,
                "percentage_excess_limit": 0.0,
                "jurisdiction_scope": "Circle Jurisdiction",
                "mandatory_conditions": "Full powers up to ₹7.00 Crores for original and revised estimates with proper AEE quarry lead investigation certificates."
            },
            {
                "id": "DEL-TS-CE",
                "rule_code": "DEL-TS-CE",
                "statute_reference": "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
                "delegation_category": "TECHNICAL_SANCTION",
                "officer_cadre": "Chief Engineer (CE)",
                "monetary_limit_cr": 100.00,
                "percentage_excess_limit": 0.0,
                "jurisdiction_scope": "Zonal / Wing Statewide",
                "mandatory_conditions": "Full powers above ₹7.00 Crores for all capital and maintenance works across State Highways and Major District Roads."
            },
            {
                "id": "DEL-TA-DE",
                "rule_code": "DEL-TA-DE",
                "statute_reference": "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
                "delegation_category": "TENDER_ACCEPTANCE",
                "officer_cadre": "Divisional Engineer (DE)",
                "monetary_limit_cr": 0.50,
                "percentage_excess_limit": 0.0,
                "jurisdiction_scope": "Division Jurisdiction",
                "mandatory_conditions": "Tender acceptance up to ₹50.00 Lakhs at 0% tender excess over sanctioned technical estimate."
            },
            {
                "id": "DEL-TA-SE",
                "rule_code": "DEL-TA-SE",
                "statute_reference": "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
                "delegation_category": "TENDER_ACCEPTANCE",
                "officer_cadre": "Superintending Engineer (SE)",
                "monetary_limit_cr": 1.00,
                "percentage_excess_limit": 5.0,
                "jurisdiction_scope": "Circle Jurisdiction",
                "mandatory_conditions": "Tender acceptance up to ₹1.00 Crore with tender excess not exceeding 5% over technical estimate."
            },
            {
                "id": "DEL-TA-CE",
                "rule_code": "DEL-TA-CE",
                "statute_reference": "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
                "delegation_category": "TENDER_ACCEPTANCE",
                "officer_cadre": "Chief Engineer (CE)",
                "monetary_limit_cr": 6.00,
                "percentage_excess_limit": 0.0,
                "jurisdiction_scope": "Zonal Command",
                "mandatory_conditions": "Tender acceptance up to ₹6.00 Crores at 0% tender excess over technical estimate."
            },
            {
                "id": "DEL-TA-COT",
                "rule_code": "DEL-TA-COT",
                "statute_reference": "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
                "delegation_category": "TENDER_ACCEPTANCE",
                "officer_cadre": "Committee of Chief Engineers (COT)",
                "monetary_limit_cr": 100.00,
                "percentage_excess_limit": 10.0,
                "jurisdiction_scope": "Statewide Highways Department",
                "mandatory_conditions": "Full powers up to ₹100.00 Crores with tender excess not exceeding 10% over estimate following market justification."
            }
        ]

        for dr in delegation_rules_data:
            existing_dr = db.query(SoRDelegationRule).filter(SoRDelegationRule.id == dr["id"]).first()
            if not existing_dr:
                dr_obj = SoRDelegationRule(
                    id=dr["id"],
                    rule_code=dr["rule_code"],
                    statute_reference=dr["statute_reference"],
                    delegation_category=dr["delegation_category"],
                    officer_cadre=dr["officer_cadre"],
                    monetary_limit_cr=dr["monetary_limit_cr"],
                    percentage_excess_limit=dr["percentage_excess_limit"],
                    jurisdiction_scope=dr["jurisdiction_scope"],
                    mandatory_conditions=dr["mandatory_conditions"],
                    is_active=True
                )
                db.add(dr_obj)
        db.commit()
        print(f"[OK] Seeded Statutory Delegation Matrix Rules")

        # 10. Seed SoR Document Ingestion Jobs & Staged Items (Phase 4 / Screen 6)
        job_id = "JOB-2026-SOR-VOL1"
        existing_job = db.query(SoRIngestionJob).filter(SoRIngestionJob.id == job_id).first()
        if not existing_job:
            ing_job = SoRIngestionJob(
                id=job_id,
                job_code="ING-2026-001",
                sor_version_id="SOR-2026-27-V1",
                file_name="TN_Schedule_of_Rates_2026_2027_Volume_I.pdf",
                source_url_or_path="/documents/sor/TN_Schedule_of_Rates_2026_2027_Volume_I.pdf",
                page_range="311-352",
                status="STAGED",
                total_pages=42,
                total_items_extracted=24,
                confidence_score_pct=96.8,
                effective_date=datetime.datetime(2026, 11, 13),
                created_at=datetime.datetime.utcnow()
            )
            db.add(ing_job)
            db.commit()

            staged_items = [
                {
                    "id": "STAGE-001",
                    "job_id": job_id,
                    "unique_code": "W-1001",
                    "category": "Highways Works",
                    "item_description": "Bituminous Concrete (BC) 40mm thick compacted with sensor paver to specified camber",
                    "unit_raw": "Cum",
                    "basic_rate": 8450.0,
                    "printed_page": 316,
                    "pdf_page": 323,
                    "extraction_confidence_pct": 99.2,
                    "has_discrepancy": False,
                    "discrepancy_notes": None,
                    "is_verified": True,
                    "verified_by": "SE Technical Cell"
                },
                {
                    "id": "STAGE-002",
                    "job_id": job_id,
                    "unique_code": "M-0127",
                    "category": "Materials",
                    "item_description": "Supply of Paving Bitumen Grade VG-30 conforming to IS:73 at designated refinery",
                    "unit_raw": "MT",
                    "basic_rate": 48200.0,
                    "printed_page": 314,
                    "pdf_page": 321,
                    "extraction_confidence_pct": 82.5,
                    "has_discrepancy": True,
                    "discrepancy_notes": "Requires linking to CPCL monthly price notification circular per G.O. (Ms) No. 42",
                    "is_verified": False,
                    "verified_by": None
                },
                {
                    "id": "STAGE-003",
                    "job_id": job_id,
                    "unique_code": "M-2853",
                    "category": "Materials",
                    "item_description": "High Tensile Prestressing Low-Relaxation Steel Strands 12.7mm dia conforming to IS:14268",
                    "unit_raw": "MT",
                    "basic_rate": 78500.0,
                    "printed_page": 315,
                    "pdf_page": 322,
                    "extraction_confidence_pct": 79.0,
                    "has_discrepancy": True,
                    "discrepancy_notes": "Unit conversion check required (metric tonnes vs quintal in table header footnote)",
                    "is_verified": False,
                    "verified_by": None
                }
            ]
            for si in staged_items:
                si_obj = SoRStagedItem(**si)
                db.add(si_obj)
            db.commit()

            discrepancies = [
                {
                    "id": "DISC-001",
                    "job_id": job_id,
                    "staged_item_id": "STAGE-002",
                    "discrepancy_type": "GO_REFERENCE_REQUIRED",
                    "field_name": "basic_rate",
                    "extracted_value": "48200.00",
                    "flagged_issue": "Bitumen base price requires attachment of approved monthly refinery index notification.",
                    "resolution_status": "OPEN",
                    "resolved_value": None,
                    "resolved_by": None
                },
                {
                    "id": "DISC-002",
                    "job_id": job_id,
                    "staged_item_id": "STAGE-003",
                    "discrepancy_type": "OCR_AMBIGUITY",
                    "field_name": "unit_raw",
                    "extracted_value": "MT",
                    "flagged_issue": "OCR detected symbol 'qtl' in footnote; row unit is 'MT'. Human confirmation required.",
                    "resolution_status": "OPEN",
                    "resolved_value": None,
                    "resolved_by": None
                }
            ]
            for d in discrepancies:
                d_obj = SoRIngestionDiscrepancy(**d)
                db.add(d_obj)
            db.commit()
            print(f"[OK] Seeded SoR Ingestion Job & Staged Items")



    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding SoR Master Data failed: {e}")
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_sor_master_data()
