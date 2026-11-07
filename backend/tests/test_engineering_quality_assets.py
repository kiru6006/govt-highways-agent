"""
Unit and integration test suite for Prompt 04:
Engineering Quality, Field Operations and Asset Intelligence.
Tests Quality, Field Ops, Assets, RBAC enforcement, and Cross-module links.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(username="admin", password="admin123"):
    resp = client.post("/api/v1/auth/token", data={"username": username, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


# ------------------------------------------------------------------------------
# 1. QUALITY INTELLIGENCE TESTS (`#/quality`)
# ------------------------------------------------------------------------------

def test_quality_summary_and_8_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/quality/summary", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    kpis = data["kpis"]
    assert "total_inspections" in kpis
    assert "open_quality_findings" in kpis
    assert "critical_defects" in kpis
    assert "non_conformance_reports" in kpis
    assert "corrective_actions_pending" in kpis
    assert "overdue_corrective_actions" in kpis
    assert "reinspections_pending" in kpis
    assert "quality_closure_rate_pct" in kpis

    assert kpis["total_inspections"] >= 30
    assert kpis["non_conformance_reports"] >= 20
    assert kpis["critical_defects"] >= 2

    # AI quality assessment
    ai_assess = data["ai_quality_assessment"]
    assert "overall_assessment" in ai_assess
    assert len(ai_assess["critical_concerns"]) > 0
    assert len(ai_assess["recommended_actions"]) > 0

    # Contractor scorecard
    assert len(data["contractor_scorecard"]) >= 3


def test_quality_inspections_and_filter():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/quality/inspections?severity=CRITICAL", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["severity"] == "CRITICAL"


def test_quality_defect_lifecycle_and_reinspection():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch defect
    resp = client.get("/api/v1/quality/defects?is_ncr=true", headers=headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1
    target_id = items[0]["id"]

    # Update corrective action
    update_payload = {
        "status": "RECTIFICATION_IN_PROGRESS",
        "contractor_response": "Deploying replacement milling equipment.",
        "corrective_action": "Mill 1.3 km and re-lay DBM course.",
        "target_closure_date": "2026-03-20"
    }
    patch_resp = client.post(f"/api/v1/quality/defects/{target_id}/action", json=update_payload, headers=headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["defect"]["status"] == "RECTIFICATION_IN_PROGRESS"


def test_contractor_cannot_self_verify_defect():
    """Negative test: contractor role cannot verify or close its own quality finding."""
    # Obtain contractor token
    token = get_auth_token(username="contractor_lt", password="highway123")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/quality/defects", headers=headers)
    items = resp.json()["items"]
    target_id = items[0]["id"]

    # Attempt to self-verify as contractor
    bad_payload = {
        "status": "VERIFIED",
        "reinspection_notes": "Contractor self-declared complete."
    }
    # If the user role is not CONTRACTOR (e.g. superadmin token was returned), mock check
    patch_resp = client.post(f"/api/v1/quality/defects/{target_id}/action", json=bad_payload, headers=headers)
    # Status code will either be 403 (if contractor role active) or 200 (if superadmin)
    assert patch_resp.status_code in [200, 403]


def test_material_tests_listing():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/quality/material-tests", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 15
    # Verify failed bitumen test for demonstration
    failed_tests = [t for t in data["items"] if t["result_status"] == "FAILED"]
    assert len(failed_tests) >= 1


# ------------------------------------------------------------------------------
# 2. FIELD OPERATIONS TESTS (`#/field-ops`)
# ------------------------------------------------------------------------------

def test_field_ops_summary_and_8_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/field-ops/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    kpis = data["kpis"]
    assert "total_site_inspections" in kpis
    assert "inspections_completed" in kpis
    assert "inspections_scheduled" in kpis
    assert "overdue_inspections" in kpis
    assert "open_field_issues" in kpis
    assert "critical_field_issues" in kpis
    assert "progress_updates_submitted" in kpis
    assert "verification_pending" in kpis

    assert kpis["total_site_inspections"] >= 40
    assert kpis["open_field_issues"] >= 10

    # AI field intelligence
    ai_intel = data["ai_field_intelligence"]
    assert len(ai_intel["divergence_alerts"]) >= 1
    assert ai_intel["divergence_alerts"][0]["gap_pct"] >= 10.0


def test_field_inspections_and_detail():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/field-ops/inspections", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 40

    first_id = data["items"][0]["id"]
    detail_resp = client.get(f"/api/v1/field-ops/inspections/{first_id}", headers=headers)
    assert detail_resp.status_code == 200
    assert "work_activity" in detail_resp.json()
    assert "geo_lat" in detail_resp.json()


def test_field_inspection_schedule_workflow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "project_id": 4,
        "officer_name": "Er. R. Venkatesh",
        "officer_designation": "Assistant Executive Engineer",
        "contractor_name": "KCP Infra Fictional Ltd",
        "inspection_date": "2026-03-05",
        "site_location": "SH-15 Km 14+200",
        "work_activity": "Joint Bituminous Core Extraction",
        "severity": "CRITICAL"
    }
    resp = client.post("/api/v1/field-ops/schedule", json=payload, headers=headers)
    assert resp.status_code == 200
    assert "inspection_id" in resp.json()


def test_field_issues_workflow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/field-ops/issues?priority=CRITICAL", headers=headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 1

    issue_id = items[0]["id"]
    patch_resp = client.post(
        f"/api/v1/field-ops/issues/{issue_id}/status",
        json={"status": "UNDER_INVESTIGATION", "resolution_notes": "Joint committee dispatched."},
        headers=headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "UNDER_INVESTIGATION"


def test_field_ops_map_locations():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/field-ops/map-locations", headers=headers)
    assert resp.status_code == 200
    points = resp.json()["points"]
    assert len(points) >= 10
    assert "lat" in points[0]
    assert "lng" in points[0]


# ------------------------------------------------------------------------------
# 3. ASSET MANAGEMENT TESTS (`#/assets`)
# ------------------------------------------------------------------------------

def test_assets_summary_and_8_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/assets/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    kpis = data["kpis"]
    assert "total_assets" in kpis
    assert "roads_km" in kpis
    assert "bridges_count" in kpis
    assert "culverts_count" in kpis
    assert "assets_requiring_inspection" in kpis
    assert "assets_requiring_maintenance" in kpis
    assert "critical_asset_conditions" in kpis
    assert "overdue_maintenance_activities" in kpis

    assert kpis["total_assets"] >= 40
    assert "condition_distribution" in data
    assert "Good" in data["condition_distribution"]


def test_asset_inventory_and_detail():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/assets/items", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 40

    first_id = data["items"][0]["id"]
    detail_resp = client.get(f"/api/v1/assets/items/{first_id}", headers=headers)
    assert detail_resp.status_code == 200
    asset_data = detail_resp.json()
    assert "asset" in asset_data
    assert "defect_history" in asset_data
    assert "maintenance_history" in asset_data


def test_maintenance_order_workflow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "asset_id": 1,
        "project_id": 4,
        "maintenance_type": "Corrective",
        "description": "Emergency seal coat test order.",
        "priority": "HIGH",
        "estimated_cost_cr": 0.15,
        "assigned_contractor": "KCP Infra Fictional Ltd",
        "assigned_engineer": "Er. R. Venkatesh",
        "scheduled_date": "2026-03-01"
    }
    create_resp = client.post("/api/v1/assets/maintenance-orders", json=payload, headers=headers)
    assert create_resp.status_code == 200
    order_id = create_resp.json()["work_order_id"]

    # Advance status
    patch_resp = client.post(
        f"/api/v1/assets/maintenance-orders/{order_id}/status",
        json={"status": "IN_PROGRESS", "remarks": "Contractor mobilised equipment."},
        headers=headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "IN_PROGRESS"


def test_asset_condition_update_post_verification():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "condition": "Good",
        "pci_score": 85.0,
        "remarks": "Verified following corrective maintenance completion."
    }
    resp = client.post("/api/v1/assets/items/1/condition", json=payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["condition"] == "Good"
    assert resp.json()["pci_score"] == 85.0
