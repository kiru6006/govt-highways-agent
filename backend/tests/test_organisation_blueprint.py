"""
Automated tests for Master Organisation Blueprint (G.O. Ms No. 43).
Verifies:
- 4 C&M Regions, 19 Circles, 68 Divisions, 285 Subdivisions
- Exact road length reconciliation with G.O. 43 workbook
- 19 Historical Redesignations (Annexure-III)
- NH Branch isolation & PENDING_VERIFICATION status
- Hierarchical cascading dropdown options
- Exception register audit and resolution workflow
"""

import pytest


def test_01_four_cm_regions_imported(client):
    """Test that all 4 C&M Regions are imported under G.O. 43."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    assert data["cm_regions_count"] == 4
    
    # Check region labels
    root = data["root"]
    assert root["unit_type"] == "DEPARTMENT"
    cm_wing = next((w for w in root["children"] if w["id"] == "ORG-WING-CM"), None)
    assert cm_wing is not None
    region_labels = [r["label"] for r in cm_wing["children"]]
    assert "Chennai Zone" in region_labels
    assert "Trichy Zone" in region_labels
    assert "Madurai Zone" in region_labels
    assert "Coimbatore Zone" in region_labels


def test_02_all_19_cm_circles_present(client):
    """Test that exactly 19 C&M Circles exist."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    assert data["cm_circles_count"] == 19


def test_03_all_68_cm_divisions_present(client):
    """Test that exactly 68 C&M Divisions exist."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    assert data["cm_divisions_count"] == 68


def test_04_all_285_cm_subdivisions_present(client):
    """Test that exactly 285 C&M Subdivisions exist."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    assert data["cm_subdivisions_count"] == 285


def test_05_road_length_totals_reconciled(client):
    """Test that C&M road length total reconciles with workbook (68149.618 km)."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    assert abs(data["total_road_length_km"] - 68149.618) < 0.1


def test_06_all_19_historical_redesignations_preserved(client):
    """Test that all 19 historical redesignations in G.O. 43 Annexure-III are imported."""
    res = client.get("/api/v1/organisation/historical-mappings")
    assert res.status_code == 200
    mappings = res.json()
    assert len(mappings) == 19
    
    # Check S.No 1: NABARD Vellore -> C&M Polur
    first = mappings[0]
    assert first["serial_no"] == 1
    assert "NABARD" in first["old_wing"]
    assert "Vellore" in first["old_division"]
    assert "Polur" in first["new_division"]
    
    # Check S.No 19: Chennai Perungar Valarchi Thittam -> C&M Tindivanam
    last = mappings[18]
    assert last["serial_no"] == 19
    assert "Tindivanam" in last["new_division"]


def test_07_cascading_filter_options(client):
    """Test dynamic cascading filter options for Wing, Region, Circle, Division, Subdivision."""
    res = client.get("/api/v1/organisation/filter-options")
    assert res.status_code == 200
    data = res.json()
    
    assert "wings" in data
    assert "Construction & Maintenance" in data["wings"]
    assert "National Highways" in data["wings"]
    
    assert "regions_by_wing" in data
    assert len(data["regions_by_wing"]["Construction & Maintenance"]) == 4
    
    assert "circles_by_region" in data
    assert "Chennai Zone" in data["circles_by_region"]
    assert len(data["circles_by_region"]["Chennai Zone"]) == 5
    
    assert "divisions_by_circle" in data
    assert len(data["all_divisions"]) >= 68


def test_08_nh_branch_isolation_and_pending_verification(client):
    """Test that National Highways is isolated from C&M and marked PENDING_VERIFICATION."""
    res = client.get("/api/v1/organisation/hierarchy")
    assert res.status_code == 200
    data = res.json()
    root = data["root"]
    
    nh_wing = next((w for w in root["children"] if w["id"] == "ORG-WING-NH"), None)
    assert nh_wing is not None
    assert nh_wing["verification_status"] == "PENDING_VERIFICATION"
    
    # Check NH circles
    assert len(nh_wing["children"]) == 4
    for cir in nh_wing["children"]:
        assert cir["verification_status"] == "PENDING_VERIFICATION"
        assert "(NH)" in cir["label"]
        # Ensure no C&M divisions leaked into NH
        for div in cir["children"]:
            assert "(NH)" in div["label"]


def test_09_organisation_unit_details_drilldown(client):
    """Test drill-down into specific unit details, parent, children, and works."""
    res = client.get("/api/v1/organisation/unit/ORG-CIR-01")
    assert res.status_code == 200
    data = res.json()
    
    assert "unit" in data
    assert "Circle" in data["unit"]["display_name"]
    assert "parent" in data
    assert data["parent"]["unit_type"] == "REGION"
    assert "children" in data
    assert data["children_count"] > 0


def test_10_organisation_kpis(client):
    """Test Statewide Strategic Command KPIs."""
    res = client.get("/api/v1/organisation/kpis")
    assert res.status_code == 200
    data = res.json()
    
    assert data["cm_regions_count"] == 4
    assert data["cm_circles_count"] == 19
    assert data["cm_divisions_count"] == 68
    assert data["cm_subdivisions_count"] == 285
    assert abs(data["cm_total_road_length_km"] - 68149.618) < 0.1
    assert data["historical_redesignations_count"] == 19
    assert data["nh_verification_status"] == "PENDING_VERIFICATION"


def test_11_data_quality_mapping_exceptions(client):
    """Test fetching and resolving data quality exceptions."""
    res = client.get("/api/v1/organisation/exceptions")
    assert res.status_code == 200
    exceptions = res.json()
    assert len(exceptions) >= 3
    
    # Resolve first exception
    exc_id = exceptions[0]["id"]
    resolve_res = client.post("/api/v1/organisation/resolve-exception", json={
        "exception_id": exc_id,
        "review_status": "VERIFIED_APPROVED",
        "reviewed_by": "Er. P. Ravichandran, Chief Engineer (C&M)",
        "correction_notes": "Statutory verification confirmed against G.O. 43"
    })
    assert resolve_res.status_code == 200
    resolved = resolve_res.json()
    assert resolved["review_status"] == "VERIFIED_APPROVED"
    assert "Ravichandran" in resolved["reviewed_by"]


def get_token(client, username="admin", password="admin123"):
    res = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200, f"Auth failed: {res.text}"
    return res.json()["access_token"]


def test_12_regression_works_analytics_and_cridp_intact(client):
    """Regression test ensuring existing endpoints continue to work seamlessly."""
    works_res = client.post("/api/v1/works-analytics/query?limit=5", json={})
    assert works_res.status_code == 200
    assert works_res.json()["total_matching"] > 0
    
    token = get_token(client)
    cridp_res = client.get(
        "/api/v1/cridp-verification/risk-overview",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert cridp_res.status_code == 200
    assert "total_cridp_works" in cridp_res.json()
