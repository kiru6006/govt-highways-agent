"""
Comprehensive Pytest Suite for SoR & Cost Intelligence (SoR-WECI)
Governing Reference: Tamil Nadu Schedule of Rates 2026-2027 Volume I (w.e.f. 13/11/2026)
"""

import pytest
from decimal import Decimal
from app.services.sor_calculation_service import SoRCalculationService, d_round


def test_01_sor_version_and_metadata(client):
    """Test 1: Verify published SoR version 2026-2027 header and effective date."""
    res = client.get("/api/v1/sor-weci/versions")
    assert res.status_code == 200
    versions = res.json()
    assert len(versions) >= 1
    v = versions[0]
    assert v["code"] == "SOR-2026-27"
    assert v["volume"] == "Volume I"
    assert v["effective_from"] == "2026-11-13"
    assert v["is_current"] is True


def test_02_sor_items_retrieval_and_filtering(client):
    """Test 2: Search SoR items by category, unique code, and provenance."""
    # Labour items
    res_l = client.get("/api/v1/sor-weci/items?category=Labour")
    assert res_l.status_code == 200
    data_l = res_l.json()
    assert data_l["total"] >= 5
    codes = [it["unique_code"] for it in data_l["items"]]
    assert "L-001" in codes
    assert "L-010" in codes

    # Unique code lookup
    res_single = client.get("/api/v1/sor-weci/items/W-120")
    assert res_single.status_code == 200
    item = res_single.json()
    assert item["unique_code"] == "W-120"
    assert "Dense Bituminous Macadam" in item["description"]
    assert item["unit_canonical"] == "CUM"
    assert item["basic_rate"] == 6950.0
    assert item["source_printed_page"] == 337


def test_03_tax_exclusive_basic_rates(client):
    """Test 3: Confirm all SoR basic rates are strictly tax/GST exclusive."""
    res = client.get("/api/v1/sor-weci/items?limit=100")
    assert res.status_code == 200
    items = res.json()["items"]
    for it in items:
        assert it["tax_inclusive"] is False, f"Item {it['unique_code']} marked tax-inclusive unexpectedly"
        assert it["basic_rate"] > 0


def test_04_statutory_allowances_corporation(client):
    """Test 4: Verify 10% Corporation allowance (Chennai/Madurai/CBE) and 5% (other corps)."""
    # Test Chennai 10%
    eval_cbe = SoRCalculationService.evaluate_allowances(
        item_code="W-101",
        category="Highways Works",
        basic_rate=184.0,
        structural_component_type="EARTHWORK",
        estimate_metadata={"corporation_type": "CHENNAI_32KM"}
    )
    # 184 * 10% = 18.40
    assert eval_cbe["unit_allowance"] == Decimal("18.40")
    assert eval_cbe["effective_rate"] == Decimal("202.40")

    # Test Other Corp 5%
    eval_other = SoRCalculationService.evaluate_allowances(
        item_code="W-101",
        category="Highways Works",
        basic_rate=184.0,
        structural_component_type="EARTHWORK",
        estimate_metadata={"corporation_type": "OTHER_CORP"}
    )
    # 184 * 5% = 9.20
    assert eval_other["unit_allowance"] == Decimal("9.20")
    assert eval_other["effective_rate"] == Decimal("193.20")


def test_05_night_work_labour_only_guardrail(client):
    """Test 5: Verify +25% night work strictly on labour component when tender clause exists."""
    # Case A: Tender clause present on Labour item (L-001, rate 625)
    eval_night_labour = SoRCalculationService.evaluate_allowances(
        item_code="L-001",
        category="Labour",
        basic_rate=625.0,
        structural_component_type="GENERAL",
        estimate_metadata={
            "is_night_work_allowed": True,
            "night_work_tender_clause": "Tender Section 14.3"
        }
    )
    # 625 * 25% = 156.25
    assert eval_night_labour["unit_allowance"] == Decimal("156.25")
    assert eval_night_labour["effective_rate"] == Decimal("781.25")

    # Case B: Tender clause absent -> Blocked with 0% extra
    eval_night_blocked = SoRCalculationService.evaluate_allowances(
        item_code="L-001",
        category="Labour",
        basic_rate=625.0,
        structural_component_type="GENERAL",
        estimate_metadata={
            "is_night_work_allowed": True,
            "night_work_tender_clause": None
        }
    )
    assert eval_night_blocked["unit_allowance"] == Decimal("0.00")
    blocked_reasons = [b["reason"] for b in eval_night_blocked["trace"]["blocked_rules"]]
    assert any("tender specification clause" in r for r in blocked_reasons)


def test_06_bridge_3pct_provisional_allowance_success():
    """Test 6: +3% allowance granted for structural bridge component when bridge share >= 50%."""
    eval_bridge = SoRCalculationService.evaluate_allowances(
        item_code="B-201",
        category="Highways Works",
        basic_rate=7800.0,
        structural_component_type="STRUCTURAL_BRIDGE",
        estimate_metadata={
            "is_bridge_work": True,
            "bridge_cost_share_pct": 75.0
        }
    )
    # 7800 * 3% = 234.00
    assert eval_bridge["unit_allowance"] == Decimal("234.00")
    assert eval_bridge["effective_rate"] == Decimal("8034.00")
    applied_codes = [a["rule_code"] for a in eval_bridge["trace"]["applied_rules"]]
    assert "BR-BRIDGE-03" in applied_codes


def test_07_bridge_3pct_guardrail_drain_culvert_block():
    """Test 7: Hard Guardrail: Drains, culverts, retaining walls, and repairs blocked from 3%."""
    blocked_types = ["DRAIN", "CULVERT", "RETAINING_WALL", "REPAIR", "ROAD_PAVEMENT", "EARTHWORK"]
    for b_type in blocked_types:
        eval_drain = SoRCalculationService.evaluate_allowances(
            item_code="B-210",
            category="Highways Works",
            basic_rate=4850.0,
            structural_component_type=b_type,
            estimate_metadata={
                "is_bridge_work": True,
                "bridge_cost_share_pct": 100.0
            }
        )
        assert eval_drain["unit_allowance"] == Decimal("0.00"), f"{b_type} should have received 0% allowance"
        blocked_reasons = [b["reason"] for b in eval_drain["trace"]["blocked_rules"]]
        assert any("strictly excludes" in r for r in blocked_reasons)


def test_08_conveyance_slab_calculations():
    """Test 8: Conveyance slabs: 1st km (140.0) + subsequent km (18.50/km) deterministic math."""
    # 5 km lead for 100 cum
    # Rate = 140 + (4 * 18.50) = 140 + 74 = 214.00
    # Total = 214.00 * 100 = 21400.00
    conv = SoRCalculationService.calculate_conveyance("Material", 100.0, 5.0)
    assert conv["conveyance_rate"] == Decimal("214.00")
    assert conv["conveyance_total"] == Decimal("21400.00")


def test_09_estimate_creation_and_deterministic_totals(client):
    """Test 9: Create new estimate via API, verify line calculation and grand total."""
    payload = {
        "estimate_code": "EST-TEST-PYTEST-01",
        "title": "Strengthening of ODR-14 with 10% Corporation Allowance",
        "division_name": "Madurai",
        "circle_name": "Madurai",
        "road_category": "ODR",
        "is_corporation_area": True,
        "corporation_type": "MADURAI_CBE_HOSUR",
        "is_night_work_allowed": False,
        "is_bridge_work": False,
        "bridge_cost_share_pct": 0.0,
        "lines": [
            {
                "sor_item_id": "ITEM-W-101",
                "structural_component_type": "EARTHWORK",
                "quantity": 1000.0,
                "lead_km": 0.0,
                "lift_meters": 0.0
            },
            {
                "sor_item_id": "ITEM-W-105",
                "structural_component_type": "ROAD_PAVEMENT",
                "quantity": 500.0,
                "lead_km": 0.0,
                "lift_meters": 0.0
            }
        ]
    }
    res = client.post("/api/v1/sor-weci/estimates", json=payload)
    assert res.status_code == 200
    est = res.json()
    assert est["estimate_code"] == "EST-TEST-PYTEST-01"
    assert len(est["lines"]) == 2

    # W-101: 184 * 10% = 18.40 -> effective 202.40 * 1000 = 202,400.00
    # W-105: 1650 * 10% = 165.00 -> effective 1815.00 * 500 = 907,500.00
    # Basic = (1000*184) + (500*1650) = 184,000 + 825,000 = 1,009,000.00
    # Allowance = 18,400 + 82,500 = 100,900.00
    # Subtotal = 1,109,900.00
    # GST 18% = 1,109,900 * 0.18 = 199,782.00
    # Grand Total = 1,309,682.00
    assert est["total_basic_amount"] == 1009000.0
    assert est["total_allowance_amount"] == 100900.0
    assert est["total_tax_amount"] == 199782.0
    assert est["grand_total"] == 1309682.0


def test_10_boq_generation_from_estimate(client):
    """Test 10: Automatic synchronization of BOQ schedule from calculated estimate lines."""
    # Lookup the estimate created in test 9
    est_res = client.get("/api/v1/sor-weci/estimates")
    assert est_res.status_code == 200
    estimates = est_res.json()
    target_est = next((e for e in estimates if e["estimate_code"] == "EST-TEST-PYTEST-01"), None)
    assert target_est is not None

    boq_res = client.post(f"/api/v1/sor-weci/estimates/{target_est['id']}/boq/generate")
    assert boq_res.status_code == 200
    boqs = boq_res.json()
    assert len(boqs) == 2
    assert boqs[0]["item_code"] == "W-101"
    assert boqs[0]["estimated_rate"] == 202.4


def test_11_mb_billing_reconciliation_variance_detection(client):
    """Test 11: Reconcile BOQ vs Measurement Book vs Bill, flag quantity variances."""
    res = client.get("/api/v1/sor-weci/reconciliation/1")
    assert res.status_code == 200
    recon_entries = res.json()
    assert len(recon_entries) >= 2

    # Check the seeded quantity variance entry
    variance_item = next((r for r in recon_entries if r["reconciliation_status"] == "QUANTITY_VARIANCE"), None)
    assert variance_item is not None
    assert variance_item["measured_qty"] == 3480.0
    assert variance_item["billed_qty"] == 3950.0
    assert variance_item["qty_delta"] == 470.0


def test_12_structured_10_point_anomaly_finding_review(client):
    """Test 12: Review and dispose cost anomaly finding with neutral governance disposition."""
    findings_res = client.get("/api/v1/sor-weci/intelligence/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) >= 3

    open_finding = next((f for f in findings if f["review_status"] == "OPEN"), None)
    assert open_finding is not None

    review_payload = {
        "finding_id": open_finding["id"],
        "review_status": "JUSTIFIED_EXCEPTION",
        "reviewed_by": "Er. S. Palanivel, CE (H), C&M",
        "justification_notes": "Site measurement verified with Divisional Engineer; differential adjusted in CC-03 voucher.",
        "preventive_action": "Strict automated MB pre-check prior to RA bill generation."
    }
    res_review = client.post(f"/api/v1/sor-weci/intelligence/findings/{open_finding['id']}/review", json=review_payload)
    assert res_review.status_code == 200
    updated = res_review.json()
    assert updated["review_status"] == "JUSTIFIED_EXCEPTION"
    assert updated["reviewed_by"] == "Er. S. Palanivel, CE (H), C&M"


def test_13_cost_benchmarking_and_comparisons(client):
    """Test 13: Fetch cross-category unit rate and cost-per-km benchmarks."""
    res = client.get("/api/v1/sor-weci/intelligence/benchmarks")
    assert res.status_code == 200
    benchmarks = res.json()
    assert len(benchmarks) >= 3
    categories = [b["category"] for b in benchmarks]
    assert "Bituminous Surface Works" in categories
    assert "Bridge Structural Concrete" in categories


def test_14_immutable_audit_log_append(client):
    """Test 14: Query append-only audit trail and confirm lifecycle event logging."""
    res = client.get("/api/v1/sor-weci/audit/events")
    assert res.status_code == 200
    events = res.json()
    assert len(events) >= 3
    action_types = [e["action_type"] for e in events]
    assert "SOR_VERSION_PUBLISHED" in action_types


def test_15_regression_existing_endpoints_intact(client):
    """Test 15: Regression test ensuring existing endpoints continue working with new SoR models."""
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200

    login_res = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_projects = client.get("/api/v1/projects", headers=headers)
    assert res_projects.status_code == 200


def test_16_reconciliation_lineage_traceability(client):
    """Test 16: Verify 5-stage lineage traceability (SoR -> Estimate -> BOQ -> MB -> Bill)."""
    res = client.get("/api/v1/sor-weci/reconciliation/lineage/1")
    assert res.status_code == 200
    lineage_data = res.json()
    assert len(lineage_data) >= 1
    flow = lineage_data[0]["lineage_flow"]
    stages = [node["stage"] for node in flow]
    assert stages == ["SOR_MASTER", "ESTIMATE", "BOQ", "MB", "BILL"]
    assert flow[0]["item_code"] in ["W-101", "W-1001", "B-201", "W-0055"]


def test_17_contract_variation_delegation_routing(client):
    """Test 17: Create contract variation and verify financial delegation routing under G.O. 11."""
    variation_payload = {
        "project_id": 1,
        "estimate_id": "EST-2026-001",
        "item_code": "W-1001",
        "description": "Dense Bituminous Macadam (DBM) 100mm Grade-II",
        "unit": "cum.",
        "original_sanctioned_qty": 350.0,
        "proposed_revised_qty": 420.0,
        "original_rate": 8450.0,
        "proposed_rate": 8450.0,
        "justification_code": "SITE_CONDITION",
        "justification_details": "Subgrade settlement between chainage 14/200 and 14/500 requiring additional thickness.",
        "delegation_order_ref": "G.O.(Ms) No. 11 w.e.f. 21.01.2022"
    }
    res = client.post("/api/v1/sor-weci/reconciliation/variations", json=variation_payload)
    assert res.status_code == 200
    var = res.json()
    assert var["qty_delta"] == 70.0
    assert var["approval_status"] == "PENDING_DE_SCRUTINY"
    assert "Divisional Engineer" in var["sanctioning_authority"]


def test_18_bill_validation_duplicate_and_spike_detection(client):
    """Test 18: Bill validation detects duplicate line items and rate spikes (>5% excess)."""
    bill_payload = {
        "bill_id": "BILL-TEST-001",
        "project_id": 1,
        "bill_number": "RA-BILL-04",
        "contractor_name": "L&T Infrastructure Ltd",
        "total_basic_billed": 1500000.0,
        "gst_claimed": 270000.0,
        "billed_items": [
            {"item_code": "W-1001", "quantity": 100.0, "rate": 8450.0},
            {"item_code": "W-1001", "quantity": 20.0, "rate": 8450.0},  # duplicate code
            {"item_code": "W-0055", "quantity": 500.0, "rate": 150.0}   # rate spike: canonical is 88.10, billed 150 (+70%)
        ]
    }
    res = client.post("/api/v1/sor-weci/reconciliation/bills/BILL-TEST-001/validate", json=bill_payload)
    assert res.status_code == 200
    result = res.json()
    assert result["is_valid"] is False
    assert result["status"] == "BLOCKED"
    assert len(result["duplicate_claims"]) == 1
    assert result["duplicate_claims"][0]["item_code"] == "W-1001"
    assert len(result["rate_spikes"]) >= 1


def test_19_qc_test_links_compliance(client):
    """Test 19: Verify QC equipment link retrieval and MORTH test compliance."""
    res = client.get("/api/v1/sor-weci/reconciliation/qc-links/1")
    assert res.status_code == 200
    links = res.json()
    assert len(links) >= 1
    item_codes = [link["item_code"] for link in links]
    assert "W-1001" in item_codes or "B-201" in item_codes


def test_20_approval_tasks_retrieval_and_decision(client):
    """Test 20: Fetch pending approval queue and execute statutory approval decision."""
    res = client.get("/api/v1/sor-weci/approvals")
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) >= 3
    pending_tasks = [t for t in tasks if t["status"] == "PENDING"]
    assert len(pending_tasks) >= 2

    # Choose a pending task, e.g., TASK-2026-001
    task_id = "TASK-2026-001"
    decision_payload = {
        "decision": "APPROVED",
        "officer_name": "SE K. Sundaram",
        "officer_role": "Superintending Engineer",
        "decision_notes": "Verified within G.O. 11 delegation and G.O. 29 5% tender excess cap. Approved."
    }
    dec_res = client.post(f"/api/v1/sor-weci/approvals/{task_id}/decision", json=decision_payload)
    assert dec_res.status_code == 200
    updated_task = dec_res.json()
    assert updated_task["status"] == "APPROVED"
    assert "SE K. Sundaram" in updated_task["decided_by"]


def test_21_statutory_delegation_matrix_rules(client):
    """Test 21: Verify statutory delegation matrix under G.O. 11 and G.O. 29."""
    res = client.get("/api/v1/sor-weci/delegation-matrix")
    assert res.status_code == 200
    rules = res.json()
    assert len(rules) >= 6

    # Verify G.O. 11 Technical Sanction limits (in Crores: DE = 0.50 Cr, SE = 7.00 Cr)
    ts_de = next((r for r in rules if "Divisional Engineer" in r["officer_cadre"] and r["delegation_category"] == "TECHNICAL_SANCTION"), None)
    assert ts_de is not None
    assert ts_de["monetary_limit_cr"] == 0.50  # 50 Lakhs = 0.50 Cr

    ts_se = next((r for r in rules if "Superintending Engineer" in r["officer_cadre"] and r["delegation_category"] == "TECHNICAL_SANCTION"), None)
    assert ts_se is not None
    assert ts_se["monetary_limit_cr"] == 7.00  # 7.00 Crores

    # Verify G.O. 29 Tender Excess limit
    ta_se = next((r for r in rules if "Superintending Engineer" in r["officer_cadre"] and r["delegation_category"] == "TENDER_ACCEPTANCE"), None)
    assert ta_se is not None
    assert ta_se["percentage_excess_limit"] == 5.0  # 5% max


def test_22_bounded_ai_investigate_finding(client):
    """Test 22: Verify bounded AI investigation assist with strict citation and disclaimer."""
    payload = {
        "finding_id": "FIND-2026-001",
        "item_code": "W-1001",
        "context_type": "COST_ANOMALY",
        "query": "Investigate rate spike on item W-1001."
    }
    res = client.post("/api/v1/sor-weci/ai/investigate-finding", json=payload)
    assert res.status_code == 200
    ai_resp = res.json()
    assert ai_resp["is_ai_assisted"] is True
    assert "AI-Assisted" in ai_resp["notice_badge"]
    assert ai_resp["source_pdf_page"] > 0
    assert ai_resp["printed_page"] > 0
    assert "Tamil Nadu SoR 2026-2027 Volume I" in ai_resp["statutory_disclaimer"]


def test_23_sor_ingestion_workbench(client):
    """Test 23: SoR document ingestion, staged items review, and publishing gate."""
    res = client.get("/api/v1/sor-weci/ingestion/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 1
    target_job = jobs[0]
    job_id = target_job["id"]

    # Verify staged items extraction
    items_res = client.get(f"/api/v1/sor-weci/ingestion/jobs/{job_id}/staged-items")
    assert items_res.status_code == 200
    staged = items_res.json()
    assert len(staged) >= 3

    # Attempt to publish while discrepancies are OPEN -> MUST return 400
    pub_res = client.post(f"/api/v1/sor-weci/ingestion/jobs/{job_id}/publish", json={
        "published_by": "SE Technical Cell",
        "notes": "Attempting premature publish before resolving open discrepancies"
    })
    assert pub_res.status_code == 400
    assert "unresolved G.O. or OCR discrepancies" in pub_res.json()["detail"]

    # Patch staged item verification
    staged_001 = staged[0]
    patch_res = client.patch(f"/api/v1/sor-weci/ingestion/staged-items/{staged_001['id']}", json={
        "basic_rate": 8450.0,
        "is_verified": True,
        "verified_by": "CE Planning"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["is_verified"] is True



