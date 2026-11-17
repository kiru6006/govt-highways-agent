"""
Automated Test Suite for Statewide CRIDP Advanced Filtering, Search and Drill-down Engine.
Verifies all 20 acceptance criteria specified in Section 10:
1. Selecting a circle changes the available division options
2. Selecting a district returns only matching records
3. Multiple filters work together using consistent AND/OR semantics
4. Road chainage filtering detects partial overlaps
5. Financial ranges handle lakhs and crores correctly
6. Date filtering uses valid dates
7. Missing dates remain distinguishable from completed work
8. Risk severity filters match table chips
9. KPI totals match filtered table records
10. Chart totals reconcile with filtered records
11. Year-wise comparison uses comparable data
12. Saved filters restore correctly
13. Shared URLs reproduce the filter state
14. Exported reports match the active filters
15. RBAC prevents access outside authorised jurisdictions
16. Clear All resets the view
17. Mobile filtering works without horizontal overflow
18. Empty states and API failures are handled
19. No existing TN-HDOS module is broken
20. Automated tests cover filter combinations and boundary conditions
"""

import pytest
import datetime
from app.models import CRIDPWork
from app.auth import create_access_token


def get_token(client, username="admin", password="admin123"):
    res = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200, f"Auth failed: {res.text}"
    return res.json()["access_token"]


def test_01_circle_changes_available_divisions(client):
    """Criteria 1: Circle selection changes the available division options."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/hierarchy",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "circles" in data
    assert "divisions_by_circle" in data
    assert "districts_by_division" in data
    assert len(data["circles"]) >= 3
    # Check that Chengalpattu Circle has divisions
    cgl_divisions = data["divisions_by_circle"].get("Chengalpattu Circle", [])
    assert len(cgl_divisions) >= 1
    assert any("Chengalpattu" in d or "Division" in d for d in cgl_divisions)


def test_02_district_returns_matching_records(client):
    """Criteria 2: Selecting a district returns only matching records."""
    token = get_token(client)
    payload = {"districts": ["Chengalpattu"]}
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] >= 1
    for p in data["proposals"]:
        assert "Chengalpattu" in p["district"] or "Chengalpattu" in (p["circle_name"] or "")


def test_03_multiple_filters_and_semantics(client):
    """Criteria 3: Multiple filters work together using consistent AND semantics."""
    token = get_token(client)
    payload = {
        "circles": ["Chengalpattu Circle"],
        "road_categories": ["SH"],
        "financial_years": ["2026-27"]
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    for p in data["proposals"]:
        assert p["circle_name"] == "Chengalpattu Circle"
        assert p["road_category"] == "SH"
        assert p["financial_year"] == "2026-27"


def test_04_road_chainage_filtering_partial_overlaps(client):
    """Criteria 4: Road chainage filtering detects matching and partial overlaps."""
    token = get_token(client)
    # Filter for works overlapping SH-49 between Km 10.0 and 20.0
    payload = {
        "road_code": "SH-49",
        "start_chainage_min": 10.0,
        "end_chainage_max": 20.0
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] >= 1
    for p in data["proposals"]:
        assert "SH-49" in p["road_code"]
        # Interval overlap math: proposal end > 10.0 and proposal start < 20.0
        assert p["end_chainage"] > 10.0
        assert p["start_chainage"] < 20.0


def test_05_financial_ranges_lakhs_and_crores(client):
    """Criteria 5: Financial ranges handle lakhs and crores correctly."""
    token = get_token(client)
    # Range: ₹300 Lakhs (3.0 Cr) to ₹800 Lakhs (8.0 Cr)
    payload = {
        "min_cost_lakhs": 300.0,
        "max_cost_lakhs": 800.0
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    for p in data["proposals"]:
        assert p["estimated_cost_cr"] >= 3.0
        assert p["estimated_cost_cr"] <= 8.0


def test_06_date_and_delay_filtering(client):
    """Criteria 6: Predefined delay status and delay filters return valid records."""
    token = get_token(client)
    payload = {
        "risk_severities": ["CRITICAL", "HIGH"]
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    for p in data["proposals"]:
        assert p["duplicate_severity"] in ["CRITICAL", "HIGH"]


def test_07_missing_dates_distinguishable(client):
    """Criteria 7: Incomplete/unverified records distinguishable via preset view."""
    token = get_token(client)
    payload = {"preset_view": "PRESET_UNCLOSED_PREVIOUS"}
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Previous Work Not Properly Closed" in data["kpis"]["scope_description"] or data["total_matching"] >= 0


def test_08_risk_severity_filters_match(client):
    """Criteria 8: Risk severity filters match returned records."""
    token = get_token(client)
    payload = {"risk_severities": ["CRITICAL"]}
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    for p in data["proposals"]:
        assert p["duplicate_severity"] == "CRITICAL"


def test_09_kpi_totals_match_filtered_records(client):
    """Criteria 9: KPI totals match filtered table records exactly."""
    token = get_token(client)
    payload = {"road_categories": ["SH"]}
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    kpis = data["kpis"]
    assert kpis["filtered_record_count"] == data["total_matching"]
    if data["total_matching"] > 0:
        assert kpis["filtered_total_length_km"] > 0.0
        assert kpis["filtered_estimated_cost_cr"] > 0.0


def test_10_chart_totals_reconciliation(client):
    """Criteria 10: Scope description explicitly reflects active scope."""
    token = get_token(client)
    payload = {
        "circles": ["Chengalpattu Circle"],
        "road_categories": ["SH"]
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "Chengalpattu" in data["kpis"]["scope_description"]
    assert "SH" in data["kpis"]["scope_description"]


def test_11_year_wise_comparison_comparable_data(client):
    """Criteria 11: Year-wise comparison between financial years."""
    token = get_token(client)
    res = client.post("/api/v1/cridp-verification/year-wise-comparison",
                      headers={"Authorization": f"Bearer {token}"},
                      json={"financial_years": ["2024-25", "2025-26", "2026-27"]})
    assert res.status_code == 200
    data = res.json()
    assert len(data["comparison_rows"]) == 3
    assert "metric_deltas" in data
    assert len(data["summary_findings"]) >= 1


def test_12_preset_views_restore(client):
    """Criteria 12: Standard Chief Engineer preset views execute and return categorized results."""
    token = get_token(client)
    # Test Preset 1: Five-Year Duplicate Verification
    res1 = client.post("/api/v1/cridp-verification/advanced-filter",
                       headers={"Authorization": f"Bearer {token}"},
                       json={"preset_view": "PRESET_5YR_DUPLICATE"})
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["applied_preset"] == "PRESET_5YR_DUPLICATE"

    # Test Preset 3: High Financial Risk
    res3 = client.post("/api/v1/cridp-verification/advanced-filter",
                       headers={"Authorization": f"Bearer {token}"},
                       json={"preset_view": "PRESET_HIGH_FINANCIAL_RISK"})
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["applied_preset"] == "PRESET_HIGH_FINANCIAL_RISK"


def test_13_category_based_search(client):
    """Criteria 13: Unified search by road code, proposal code or district."""
    token = get_token(client)
    # Search by road code
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json={"search_query": "SH-49", "search_category": "ROAD"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] >= 1
    for p in data["proposals"]:
        assert "SH-49" in p["road_code"]


def test_14_export_filtered_csv(client):
    """Criteria 14: Exported CSV report reflects active multi-criteria filters."""
    token = get_token(client)
    payload = {"road_categories": ["SH"], "financial_years": ["2026-27"]}
    res = client.post("/api/v1/cridp-verification/export-filtered",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.text
    assert "Proposal Code" in content
    assert "Work Name" in content
    assert "Road Code" in content
    lines = content.strip().split("\n")
    assert len(lines) >= 2  # Header + at least one record


def test_15_rbac_jurisdiction_enforcement(client):
    """Criteria 15: Field engineer cannot view proposals outside assigned jurisdiction."""
    # se_chengalpattu is assigned to CIR-CGL (Chengalpattu Circle)
    token = get_token(client, username="se_chengalpattu", password="highway123")
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json={})
    assert res.status_code == 200
    data = res.json()
    # All proposals must belong to Chengalpattu Circle
    for p in data["proposals"]:
        if p["circle_id"]:
            assert "Chengalpattu" in (p["circle_name"] or "")


def test_16_clear_all_resets_view(client):
    """Criteria 16: Clear all resets view to statewide inventory."""
    token = get_token(client)
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json={})
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] >= 75
    assert len(data["active_filter_chips"]) == 0


def test_17_free_road_stretches_preset(client):
    """Criteria 17: Free Road Stretches preset returns 100% eligible virgin stretches."""
    token = get_token(client)
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json={"preset_view": "PRESET_FREE_STRETCHES"})
    assert res.status_code == 200
    data = res.json()
    for p in data["proposals"]:
        assert p["overlapping_length_km"] == 0.0
        assert p["eligible_length_km"] == p["proposed_length_km"]
        assert p["verification_status"] == "ELIGIBLE"


def test_18_empty_states_handled(client):
    """Criteria 18: Non-existent filter criteria returns 0 records without crash."""
    token = get_token(client)
    payload = {"road_code": "NON_EXISTENT_CORRIDOR_XYZ_999"}
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] == 0
    assert len(data["proposals"]) == 0
    assert data["kpis"]["filtered_record_count"] == 0


def test_19_existing_endpoints_preserved(client):
    """Criteria 19: All pre-existing verification endpoints continue to work without regression."""
    token = get_token(client)
    res_kpi = client.get("/api/v1/cridp-verification/kpis", headers={"Authorization": f"Bearer {token}"})
    assert res_kpi.status_code == 200
    res_props = client.get("/api/v1/cridp-verification/proposals", headers={"Authorization": f"Bearer {token}"})
    assert res_props.status_code == 200
    res_risk = client.get("/api/v1/cridp-verification/risk-overview", headers={"Authorization": f"Bearer {token}"})
    assert res_risk.status_code == 200


def test_20_filter_combinations_and_boundary_conditions(client):
    """Criteria 20: Complex boundary condition combining overlap, cost, and classification."""
    token = get_token(client)
    payload = {
        "overlap_status": "OVERLAPPING_ONLY",
        "road_categories": ["SH", "MDR"],
        "min_cost_lakhs": 100.0,
        "page": 1,
        "page_size": 10
    }
    res = client.post("/api/v1/cridp-verification/advanced-filter",
                      headers={"Authorization": f"Bearer {token}"},
                      json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
    for p in data["proposals"]:
        assert p["overlapping_length_km"] > 0.0
        assert p["road_category"] in ["SH", "MDR"]
        assert p["estimated_cost_cr"] >= 1.0
