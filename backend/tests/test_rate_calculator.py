"""
Comprehensive Test Suite for Rate Calculator
Governing Reference: Tamil Nadu SoR 2026-2027 Volume I (w.e.f. 13/11/2026)
Tests all 25 statutory calculation, validation, and engineering requirements.
"""

import pytest
from decimal import Decimal
from app.services.sor_calculation_service import SoRCalculationService
from app.schemas import RateCalculateRequest, BatchCalculateRequest, RateValidationRequest


def test_01_material_multiplication(client):
    """Test 1: Example 1 - M-0093 HBGS Jelly 90 mm: 125 m3 x Rs 544 = Rs 68,000."""
    payload = {
        "calculation_mode": "MATERIAL",
        "item_code": "M-0093",
        "quantity": 125.0,
        "apply_tax": False
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["item_code"] == "M-0093"
    assert data["source_rate"] == 544.0
    assert data["input_quantity"] == 125.0
    assert data["base_amount"] == 68000.0
    assert data["final_amount"] == 68000.0
    assert data["tax_treatment"]["tax_amount"] == 0.0
    assert data["validation_status"] == "VALID"
    assert "125" in data["base_formula"] and "544" in data["base_formula"]


def test_02_labour_multiplication(client):
    """Test 2: Example 2 - L-0099 Bitumen Heat Master Operator: 2 workers x 5 days x Rs 1,001 = Rs 10,010."""
    payload = {
        "calculation_mode": "LABOUR",
        "item_code": "L-0099",
        "quantity": 5.0,
        "workers_count": 2,
        "days_count": 5.0,
        "is_night_work": False
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["item_code"] == "L-0099"
    assert data["source_rate"] == 1001.0
    assert data["base_amount"] == 10010.0
    assert data["final_amount"] == 10010.0
    assert "2 workers" in data["base_formula"]
    assert "5" in data["base_formula"]
    assert "1001" in data["base_formula"]


def test_03_work_item_calculations(client):
    """Test 3: Work Item Cost = Measured Quantity x Work Item Rate (W-0055)."""
    payload = {
        "calculation_mode": "WORK",
        "item_code": "W-0055",
        "quantity": 500.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 500 * 88.10 = 44,050.00
    assert data["base_amount"] == 44050.0
    assert data["final_amount"] == 44050.0


def test_04_equipment_hire_calculations(client):
    """Test 4: Equipment Hire = Eligible Duration x Hourly Rate (H-0001 Excavator)."""
    payload = {
        "calculation_mode": "EQUIPMENT",
        "item_code": "H-0001",
        "quantity": 10.0,
        "duration_hours": 10.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 10 * 2450.0 = 24,500.00
    assert data["base_amount"] == 24500.0
    assert "10" in data["base_formula"] and "2450" in data["base_formula"]


def test_05_road_furniture_calculations(client):
    """Test 5: Road furniture quantity x rate (RF-0001 Cautionary Signboard)."""
    payload = {
        "calculation_mode": "ROAD_FURNITURE",
        "item_code": "RF-0001",
        "quantity": 4.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 4 * 3850.0 = 15,400.00
    assert data["base_amount"] == 15400.0


def test_06_survey_dpr_calculations(client):
    """Test 6: Survey & DPR km x rate (SV-0001 Topo Survey)."""
    payload = {
        "calculation_mode": "SURVEY_DPR",
        "item_code": "SV-0001",
        "quantity": 12.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 12 * 18500.0 = 222,000.00
    assert data["base_amount"] == 222000.0


def test_07_plantation_calculations(client):
    """Test 7: Avenue Plantation sapling count x rate (PL-0001 Tree Sapling)."""
    payload = {
        "calculation_mode": "PLANTATION",
        "item_code": "PL-0001",
        "quantity": 100.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 100 * 1250.0 = 125,000.00
    assert data["base_amount"] == 125000.0


def test_08_geometric_quantity_area(client):
    """Test 8: Geometric Area = Length x Width."""
    payload = {
        "calculation_mode": "QUANTITY",
        "length_m": 1000.0,
        "width_m": 7.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["official_unit"] == "SQM"
    assert data["input_quantity"] == 7000.0
    assert "1000" in data["base_formula"] and "7" in data["base_formula"]


def test_09_geometric_quantity_layer_volume(client):
    """Test 9: Example 3 - Length 1000m x Width 7m x Thickness 50mm (0.05m) = 350 m3."""
    payload = {
        "calculation_mode": "QUANTITY",
        "length_m": 1000.0,
        "width_m": 7.0,
        "thickness_mm": 50.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["official_unit"] == "CUM"
    assert data["input_quantity"] == 350.0
    assert data["unit_conversions"]["thickness_converted_m"] == 0.05
    assert "350" in data["base_formula"]
    # Check warning disclaiming automatic procurement quantity
    assert any("Geometric volume" in w for w in data["warnings"])


def test_10_negative_quantity_rejection(client):
    """Test 10: Negative quantity must be rejected as INVALID."""
    payload = {
        "calculation_mode": "MATERIAL",
        "item_code": "M-0093",
        "quantity": -25.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["validation_status"] == "INVALID"
    assert any("Negative quantity rejected" in w for w in data["warnings"])
    assert data["final_amount"] == 0.0


def test_11_zero_quantity_handling(client):
    """Test 11: Zero quantity produces 0 amount with valid status."""
    payload = {
        "calculation_mode": "MATERIAL",
        "item_code": "M-0093",
        "quantity": 0.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["base_amount"] == 0.0
    assert data["final_amount"] == 0.0
    assert data["validation_status"] == "VALID"


def test_12_missing_rate_handling(client):
    """Test 12: Missing or unverified rate requires verification."""
    payload = {
        "calculation_mode": "MATERIAL",
        "item_code": "NON-EXISTENT-CODE-9999",
        "quantity": 50.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["validation_status"] == "REQUIRES_VERIFICATION"
    assert any("requires verification" in w for w in data["warnings"])


def test_13_duplicate_line_warnings_in_batch(client):
    """Test 13: Duplicate line items trigger warning in batch sheet."""
    batch_payload = {
        "title": "Road Widening Test Sheet",
        "lines": [
            {"calculation_mode": "MATERIAL", "item_code": "M-0093", "quantity": 100.0},
            {"calculation_mode": "MATERIAL", "item_code": "M-0093", "quantity": 50.0}
        ]
    }
    res = client.post("/api/v1/sor/calculate-batch", json=batch_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["validation_status"] == "VALID_WITH_WARNINGS"
    assert any("Duplicate item warning" in w for w in data["lines"][1]["warnings"])


def test_14_effective_date_and_publication(client):
    """Test 14: Publications endpoint returns SOR-2026-27 w.e.f. 13/11/2026."""
    res = client.get("/api/v1/sor/publications")
    assert res.status_code == 200
    pubs = res.json()
    assert len(pubs) > 0
    assert "SOR-2026-27" in pubs[0]["code"]
    assert "2026-11-13" in str(pubs[0]["effective_from"])


def test_15_geographic_allowance_corporation(client):
    """Test 15: Municipal Corporation Tier-1 (+10%) allowance applied to Work item."""
    payload = {
        "calculation_mode": "WORK",
        "item_code": "W-0055",
        "quantity": 100.0,
        "corporation_type": "CHENNAI_32KM"
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # Base: 100 * 88.10 = 8810.00
    # +10% Corp allowance = 881.00
    # Final: 9691.00
    assert data["base_amount"] == 8810.0
    assert data["total_adjustments"] == 881.0
    assert data["final_amount"] == 9691.0
    assert any(r["rule_code"] == "BR-CORP-10" for r in data["applied_rules"])


def test_16_night_work_eligibility_and_tender_clause(client):
    """Test 16: Night work allowance requires verified tender clause; blocked if absent."""
    # Attempt without clause
    payload_no_clause = {
        "calculation_mode": "LABOUR",
        "item_code": "L-0099",
        "quantity": 1.0,
        "is_night_work": True,
        "tender_night_clause": None
    }
    res_no = client.post("/api/v1/sor/calculate", json=payload_no_clause)
    assert res_no.status_code == 200
    data_no = res_no.json()
    assert data_no["total_adjustments"] == 0.0
    assert any("tender specification clause" in r["reason"] for r in data_no["excluded_rules"])

    # Attempt with clause
    payload_with_clause = {
        "calculation_mode": "LABOUR",
        "item_code": "L-0099",
        "quantity": 1.0,
        "is_night_work": True,
        "tender_night_clause": "Special Condition 14(b) Night Operations Approved"
    }
    res_with = client.post("/api/v1/sor/calculate", json=payload_with_clause)
    assert res_with.status_code == 200
    data_with = res_with.json()
    # 25% of 1001.0 = 250.25
    assert data_with["total_adjustments"] == 250.25
    assert data_with["final_amount"] == 1251.25


def test_17_bridge_3pct_allowance_success(client):
    """Test 17: Structural Bridge item on project with bridge share >= 50% receives +3%."""
    payload = {
        "calculation_mode": "WORK",
        "item_code": "B-201",
        "quantity": 10.0,
        "structural_type": "STRUCTURAL_BRIDGE",
        "is_bridge_work": True,
        "bridge_cost_share_pct": 75.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any(r["rule_code"] == "BR-BRIDGE-03" for r in data["applied_rules"])
    assert data["total_adjustments"] > 0


def test_18_bridge_3pct_guardrail_drain_culvert_block(client):
    """Test 18: General Note 10 explicitly prohibits 3% allowance on drains and culverts."""
    payload = {
        "calculation_mode": "WORK",
        "item_code": "B-210",
        "quantity": 20.0,
        "structural_type": "DRAIN",
        "is_bridge_work": True,
        "bridge_cost_share_pct": 75.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any("excludes DRAIN" in r["reason"] for r in data["excluded_rules"])
    assert data["total_adjustments"] == 0.0


def test_19_conveyance_slab_table_1(client):
    """Test 19: Conveyance Table-I initial 1km = Rs 140, subsequent = Rs 18.50/cum/km."""
    # 10 km lead: 140 + 9 * 18.50 = 140 + 166.50 = 306.50 / cum
    payload = {
        "calculation_mode": "CONVEYANCE",
        "quantity": 100.0,
        "lead_km": 10.0,
        "lift_m": 0.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # 100 * 306.50 = 30,650.00
    assert data["base_amount"] == 30650.0


def test_20_conveyance_head_load_lift_extra(client):
    """Test 20: Head load lift > 2m applies extra Rs 13.00/cum/m."""
    payload = {
        "calculation_mode": "CONVEYANCE",
        "quantity": 50.0,
        "lead_km": 1.0,
        "lift_m": 4.0
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # Base lead 1km = 140.0
    # Lift > 2m: (4 - 2) * 13.00 = 26.00 / cum
    # Rate: 166.00 / cum -> 50 * 166 = 8,300.00
    assert data["base_amount"] == 8300.0
    assert any(r["rule_code"] == "C-0003" for r in data["applied_rules"])


def test_21_conveyance_hills_addition(client):
    """Test 21: Hills terrain applies +20% extra on conveyance."""
    payload = {
        "calculation_mode": "CONVEYANCE",
        "quantity": 10.0,
        "lead_km": 1.0,
        "terrain": "HILLS"
    }
    res = client.post("/api/v1/sor/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    # Initial 1km = 140.0 + 20% = 168.0 / cum
    assert data["base_amount"] == 1680.0
    assert any(r["rule_code"] == "GN-HILL-20" for r in data["applied_rules"])


def test_22_tax_separation_strict(client):
    """Test 22: Basic rates are strictly GST-exclusive; 18% GST added separately."""
    payload_no_tax = {
        "calculation_mode": "MATERIAL",
        "item_code": "M-0093",
        "quantity": 100.0,
        "apply_tax": False
    }
    res1 = client.post("/api/v1/sor/calculate", json=payload_no_tax)
    assert res1.json()["final_amount"] == 54400.0

    payload_with_tax = {
        "calculation_mode": "MATERIAL",
        "item_code": "M-0093",
        "quantity": 100.0,
        "apply_tax": True,
        "tax_percentage": 18.0
    }
    res2 = client.post("/api/v1/sor/calculate", json=payload_with_tax)
    data2 = res2.json()
    # 54,400 + 18% (9792.00) = 64,192.00
    assert data2["base_amount"] == 54400.0
    assert data2["tax_treatment"]["tax_amount"] == 9792.0
    assert data2["final_amount"] == 64192.0


def test_23_decimal_precision_and_rounding():
    """Test 23: Decimal arithmetic avoids binary floating point drift."""
    # Test edge case: 0.1 + 0.2 in float is 0.30000000000000004
    req = RateCalculateRequest(
        calculation_mode="MATERIAL",
        item_code="M-TEST",
        quantity=3.0,
        apply_tax=True,
        tax_percentage=18.0
    )
    class DummyItem:
        basic_rate = 100.33
        description = "Test Item"
        unit_canonical = "NOS"
        unique_code = "M-TEST"
        annexure_code = "ANNEXURE-II"
        source_printed_page = 314
        source_pdf_page = 318

    res = SoRCalculationService.calculate_rate_item(req, DummyItem)
    # 3 * 100.33 = 300.99
    # Tax: 300.99 * 0.18 = 54.1782 -> 54.18
    # Total: 355.17
    assert res["base_amount"] == 300.99
    assert res["tax_treatment"]["tax_amount"] == 54.18
    assert res["final_amount"] == 355.17


def test_24_batch_calculation_and_export(client):
    """Test 24: Multi-item batch calculation reconciles totals and exports summary."""
    batch_payload = {
        "title": "Bypass Junction Estimate Sheet",
        "lines": [
            {"calculation_mode": "MATERIAL", "item_code": "M-0093", "quantity": 100.0},
            {"calculation_mode": "LABOUR", "item_code": "L-0099", "quantity": 2.0, "workers_count": 2, "days_count": 2.0},
            {"calculation_mode": "EQUIPMENT", "item_code": "H-0001", "quantity": 5.0}
        ]
    }
    res_batch = client.post("/api/v1/sor/calculate-batch", json=batch_payload)
    assert res_batch.status_code == 200
    b_data = res_batch.json()
    assert len(b_data["lines"]) == 3
    # Total basic: (100 * 544) + (2 * 2 * 1001) + (5 * 2450) = 54,400 + 4,004 + 12,250 = 70,654.00
    assert b_data["total_basic_amount"] == 70654.0
    assert b_data["grand_total_amount"] == 70654.0

    # Test export
    export_payload = {
        "format": "CSV",
        "session_id": b_data["session_id"],
        "batch_data": b_data
    }
    res_exp = client.post("/api/v1/sor/export", json=export_payload)
    assert res_exp.status_code == 200
    exp_data = res_exp.json()
    assert "M-0093" in exp_data["content"]
    assert "70654" in exp_data["content"]
    assert exp_data["filename"].endswith(".csv")


def test_25_api_validation_endpoint(client):
    """Test 25: Pre-flight validation endpoint catches night work without clause & bridge blocks."""
    val_payload = {
        "calculation_mode": "WORK",
        "item_code": "B-210",
        "quantity": 10.0,
        "structural_type": "DRAIN",
        "is_night_work": True,
        "tender_night_clause": None
    }
    res = client.post("/api/v1/sor/validate", json=val_payload)
    assert res.status_code == 200
    val_data = res.json()
    assert val_data["status"] == "VALID_WITH_WARNINGS"
    assert any("Night work 25%" in w for w in val_data["warnings"])
    assert any("strictly excluded for DRAIN" in w for w in val_data["warnings"])
