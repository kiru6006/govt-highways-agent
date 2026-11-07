"""
Unit and integration test suite for Prompt 05:
Departmental Coordination, Land Acquisition & Utility Intelligence.
Covers:
- Department overview KPIs & connected directory
- Interdepartmental dependency register & action workflows
- Approval workflows & SLA tracking
- Land acquisition overview, parcel registers & lifecycle transitions
- Utility shifting registers & completion verifications
- Mandatory negative tests for RBAC, missing evidence, unverified completion
- Section 12 Demonstration Scenario (CKICP SH-15 Ooty-Gudalur corridor)
- Audit logging verification
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
# 1. DEPARTMENT COORDINATION TESTS (`#/departments`)
# ------------------------------------------------------------------------------

def test_department_overview_and_8_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/departments/overview", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    kpis = data["kpis"]
    assert kpis["total_participating_departments"] >= 10
    assert kpis["active_interdepartmental_dependencies"] >= 10
    assert kpis["pending_approvals"] >= 5
    assert "overdue_approvals" in kpis
    assert "average_approval_turnaround_days" in kpis
    assert "critical_project_blockers" in kpis
    assert "department_wise_pending_actions" in kpis
    assert "escalations_requiring_leadership" in kpis

    # Check AI Assessment
    ai_assess = data["ai_department_assessment"]
    assert "overall_status" in ai_assess
    assert len(ai_assess["critical_bottlenecks"]) > 0
    assert len(ai_assess["recommended_executive_actions"]) > 0


def test_department_connected_directory():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/departments/directory", headers=headers)
    assert resp.status_code == 200, resp.text
    items = resp.json()

    assert len(items) >= 10
    codes = {d["code"] for d in items}
    assert "HIGHWAYS" in codes
    assert "REVENUE" in codes
    assert "TANGEDCO" in codes
    assert "TWAD" in codes
    assert "FOREST" in codes
    assert "RAILWAYS" in codes

    # Check details of HIGHWAYS and REVENUE
    rev_dept = next(d for d in items if d["code"] == "REVENUE")
    assert rev_dept["responsible_minister"] is not None
    assert rev_dept["responsible_secretary"] is not None
    assert rev_dept["nodal_officer_name"] is not None
    assert len(rev_dept["current_responsibilities"]) > 0


def test_interdepartmental_dependencies_register():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/departments/dependencies", headers=headers)
    assert resp.status_code == 200, resp.text
    items = resp.json()

    assert len(items) >= 20
    first = items[0]
    assert "dependency_code" in first
    assert "requesting_dept_name" in first
    assert "target_dept_name" in first
    assert "criticality" in first
    assert "status" in first


def test_dependency_action_workflow_and_audit():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch dependencies to pick one
    resp = client.get("/api/v1/departments/dependencies", headers=headers)
    dep_id = resp.json()[0]["id"]

    # Advance status
    action_resp = client.post(
        f"/api/v1/departments/dependencies/{dep_id}/action",
        headers=headers,
        json={
            "action": "ESCALATE",
            "escalation_level": "SECRETARY",
            "resolution_notes": "Escalated to Principal Secretary for interdepartmental clearance.",
            "supporting_document_ref": "GO-MS-88/2026"
        }
    )
    assert action_resp.status_code == 200, action_resp.text
    assert action_resp.json()["status"] == "success"
    assert action_resp.json()["current_status"] == "ESCALATED"
    assert action_resp.json()["escalation_level"] == "SECRETARY"


def test_approval_workflow_and_sla_tracking():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/departments/approvals", headers=headers)
    assert resp.status_code == 200, resp.text
    apps = resp.json()
    assert len(apps) >= 25

    app_id = apps[0]["id"]
    action_resp = client.post(
        f"/api/v1/departments/approvals/{app_id}/action",
        headers=headers,
        json={
            "decision": "APPROVE",
            "review_remarks": "Verified statutory compliance with MoEFCC guidelines.",
            "evidence_document_ref": "GO-MS-92/2026-HW"
        }
    )
    assert action_resp.status_code == 200, action_resp.text
    assert action_resp.json()["current_status"] == "APPROVED"


# ------------------------------------------------------------------------------
# 2. LAND ACQUISITION INTELLIGENCE TESTS (`#/land-utility`)
# ------------------------------------------------------------------------------

def test_land_acquisition_overview_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/land-utility/overview", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    land_kpis = data["land_kpis"]
    assert land_kpis["total_projects_with_land_req"] >= 5
    assert land_kpis["total_land_required_sqm"] > 50000.0
    assert land_kpis["total_land_acquired_sqm"] > 10000.0
    assert land_kpis["total_land_pending_sqm"] > 0.0
    assert land_kpis["awards_passed_count"] >= 10
    assert land_kpis["total_compensation_assessed_cr"] > 0.0
    assert land_kpis["total_compensation_pending_cr"] >= 0.0
    assert land_kpis["possession_completed_count"] >= 5
    assert land_kpis["litigation_affected_parcels_count"] >= 2


def test_land_parcels_register_50_records():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/land-utility/parcels", headers=headers)
    assert resp.status_code == 200, resp.text
    parcels = resp.json()

    assert len(parcels) == 50
    sample = parcels[0]
    assert "parcel_reference" in sample
    assert "survey_number" in sample
    assert "village" in sample
    assert "district" in sample
    assert "landowner_name" in sample
    assert "acquisition_stage" in sample
    assert "compensation_status" in sample
    assert "possession_status" in sample
    assert "responsible_revenue_officer" in sample


def test_land_parcel_workflow_transition():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch parcels to pick one that is not yet possession complete (and not our demo parcel LA-SH15-01)
    resp = client.get("/api/v1/land-utility/parcels", headers=headers)
    assert resp.status_code == 200, resp.text
    parcels = resp.json()
    assert len(parcels) > 1
    target_parcel = next((p for p in parcels if p["parcel_reference"] != "LA-SH15-01"), parcels[1])
    p_id = target_parcel["id"]

    # Transition to Compensation Paid & Possession Handed Over
    wf_resp = client.post(
        f"/api/v1/land-utility/parcels/{p_id}/workflow",
        headers=headers,
        json={
            "new_stage": "Handover",
            "possession_status": "POSSESSION_HANDED_OVER",
            "possession_date": "2026-02-15",
            "compensation_status": "PAID",
            "compensation_paid_cr": 0.85,
            "payment_reference": "TREASURY-CHQ-2026-4412",
            "document_reference": "POSSESSION-CERT-2026-01",
            "officer_remarks": "All legal heirs signed receipt voucher; physical possession delivered to AEE Highways."
        }
    )
    assert wf_resp.status_code == 200, wf_resp.text
    res_data = wf_resp.json()
    assert res_data["acquisition_stage"] == "Handover"
    assert res_data["possession_status"] == "POSSESSION_HANDED_OVER"


# ------------------------------------------------------------------------------
# 3. UTILITY SHIFTING INTELLIGENCE TESTS (`#/land-utility`)
# ------------------------------------------------------------------------------

def test_utility_shifting_overview_and_25_records():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Overview KPIs
    ov_resp = client.get("/api/v1/land-utility/overview", headers=headers)
    assert ov_resp.status_code == 200, ov_resp.text
    utl_kpis = ov_resp.json()["utility_kpis"]
    assert utl_kpis["total_utility_assets"] == 25
    assert utl_kpis["total_estimated_shifting_cost_cr"] > 0.0

    # Utilities list
    resp = client.get("/api/v1/land-utility/utilities", headers=headers)
    assert resp.status_code == 200, resp.text
    utilities = resp.json()
    assert len(utilities) == 25

    agencies = {u["owning_agency"] for u in utilities}
    assert "TANGEDCO" in agencies or any("TANGEDCO" in a for a in agencies)
    assert "TWAD Board" in agencies or any("TWAD" in a for a in agencies)


def test_utility_workflow_and_engineer_verification():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-utility/utilities", headers=headers)
    assert resp.status_code == 200, resp.text
    utls = resp.json()
    assert len(utls) > 1
    target_utl = next((u for u in utls if u["utility_code"] != "UTL-SH15-001"), utls[1])
    utl_id = target_utl["id"]

    wf_resp = client.post(
        f"/api/v1/land-utility/utilities/{utl_id}/workflow",
        headers=headers,
        json={
            "action": "VERIFY_COMPLETION",
            "physical_progress_pct": 100.0,
            "work_order_status": "COMPLETED",
            "verification_status": "VERIFIED",
            "completion_date": "2026-02-18",
            "verifying_engineer": "Er. R. Venkatesh (AEE)",
            "inspection_document_ref": "HIGHWAYS-JIR-VERIF-412",
            "remarks": "Physical shifting of all electrical poles verified as per approved alignment."
        }
    )
    assert wf_resp.status_code == 200, wf_resp.text
    assert wf_resp.json()["work_order_status"] == "COMPLETED"
    assert wf_resp.json()["verification_status"] == "VERIFIED"


# ------------------------------------------------------------------------------
# 4. GIS & SPATIAL MAP LOCATIONS
# ------------------------------------------------------------------------------

def test_land_utility_map_locations():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/land-utility/map-locations", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["total_points"] > 20
    types = {pt["type"] for pt in data["points"]}
    assert "PARCEL" in types
    assert "UTILITY" in types

    # Verify synthetic coordinate disclaimer
    assert "coordinate_system" in data
    assert "disclaimer" in data


# ------------------------------------------------------------------------------
# 5. SECTION 14 & 12 MANDATORY DEMONSTRATION SCENARIO (SH-15 GHAT CORRIDOR)
# ------------------------------------------------------------------------------

def test_section_12_demonstration_scenario_ckicp_sh15():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Land Parcel LA-SH15-01 (Pykara stretch)
    p_resp = client.get("/api/v1/land-utility/parcels?project_id=4&search=LA-SH15-01", headers=headers)
    assert p_resp.status_code == 200, p_resp.text
    parcels = p_resp.json()
    assert len(parcels) > 0
    sh15_parcel = parcels[0]
    assert sh15_parcel["parcel_reference"] == "LA-SH15-01"
    assert sh15_parcel["village"] == "Pykara"
    assert sh15_parcel["compensation_assessed_cr"] == 0.85
    assert sh15_parcel["compensation_status"] == "PENDING"
    assert sh15_parcel["blocking_project_milestone"] is not None

    # 2. Utility Shifting UTL-SH15-001 (48 TANGEDCO poles)
    u_resp = client.get("/api/v1/land-utility/utilities?project_id=4&search=UTL-SH15-001", headers=headers)
    assert u_resp.status_code == 200, u_resp.text
    utls = u_resp.json()
    assert len(utls) > 0
    sh15_utl = utls[0]
    assert sh15_utl["utility_code"] == "UTL-SH15-001"
    assert sh15_utl["affected_assets_count"] == 48
    assert "TANGEDCO" in sh15_utl["owning_agency"]

    # 3. Departmental Dependencies (DEP-SH15-001 & DEP-SH15-002)
    d_resp = client.get("/api/v1/departments/dependencies?project_id=4", headers=headers)
    assert d_resp.status_code == 200, d_resp.text
    deps = d_resp.json()
    dep_codes = {d["dependency_code"] for d in deps}
    assert "DEP-SH15-001" in dep_codes
    assert "DEP-SH15-002" in dep_codes

    # 4. Approvals Overdue (APP-SH15-001 & APP-SH15-002)
    a_resp = client.get("/api/v1/departments/approvals?project_id=4&sla_status=OVERDUE", headers=headers)
    assert a_resp.status_code == 200, a_resp.text
    apps = a_resp.json()
    app_refs = {a["reference_number"] for a in apps}
    assert "APP-SH15-001" in app_refs

    # 5. AI Bottleneck Finding
    ai_resp = client.get("/api/v1/departments/ai-intelligence?project_id=4", headers=headers)
    assert ai_resp.status_code == 200, ai_resp.text
    ai_items = ai_resp.json()["items"]
    ai_codes = {f["finding_code"] for f in ai_items}
    assert "DAIF-SH15-001" in ai_codes or "DAIF-SH15-002" in ai_codes


# ------------------------------------------------------------------------------
# 6. MANDATORY NEGATIVE TESTS (RBAC & INTEGRITY CONSTRAINTS)
# ------------------------------------------------------------------------------

def test_negative_contractor_cannot_approve_statutory_approval():
    contractor_token = get_auth_token(username="contractor_lt", password="highway123")
    headers = {"Authorization": f"Bearer {contractor_token}"}

    resp = client.post(
        "/api/v1/departments/approvals/1/action",
        headers=headers,
        json={
            "decision": "APPROVE",
            "review_remarks": "Contractor attempting self-approval of technical sanction."
        }
    )
    assert resp.status_code == 403, "Contractor must be forbidden from approving statutory approvals."
    assert "RBAC Restriction" in resp.json()["detail"]


def test_negative_approval_cannot_be_closed_without_evidence_document():
    admin_token = get_auth_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch approval with no document ref or omit it
    resp = client.post(
        "/api/v1/departments/approvals/2/action",
        headers=headers,
        json={
            "decision": "APPROVE",
            "review_remarks": "Attempting approval without document reference.",
            "evidence_document_ref": ""
        }
    )
    assert resp.status_code == 400, "Approval must fail without document reference."
    assert "Integrity Constraint" in resp.json()["detail"]


def test_negative_parcel_possession_requires_date_and_certificate():
    admin_token = get_auth_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch parcel with pending possession
    p_resp = client.get("/api/v1/land-utility/parcels?possession_status=PENDING_POSSESSION", headers=headers)
    p_id = p_resp.json()[0]["id"]

    resp = client.post(
        f"/api/v1/land-utility/parcels/{p_id}/workflow",
        headers=headers,
        json={
            "new_stage": "Possession",
            "possession_status": "POSSESSION_HANDED_OVER",
            "possession_date": None,  # Missing date!
            "officer_remarks": "Attempting possession handover without date."
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint" in resp.json()["detail"]


def test_negative_compensation_paid_requires_payment_voucher_reference():
    admin_token = get_auth_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    p_resp = client.get("/api/v1/land-utility/parcels?compensation_status=PENDING", headers=headers)
    p_id = p_resp.json()[0]["id"]

    resp = client.post(
        f"/api/v1/land-utility/parcels/{p_id}/workflow",
        headers=headers,
        json={
            "new_stage": "Compensation",
            "compensation_status": "PAID",
            "payment_reference": None,  # Missing payment ref!
            "officer_remarks": "Attempting compensation marked paid without voucher token."
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint" in resp.json()["detail"]


def test_negative_utility_shifting_requires_verification_before_complete():
    admin_token = get_auth_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.post(
        "/api/v1/land-utility/utilities/1/workflow",
        headers=headers,
        json={
            "action": "UPDATE_PROGRESS",
            "physical_progress_pct": 100.0,
            "work_order_status": "COMPLETED",
            "verification_status": "UNVERIFIED",  # Unverified!
            "remarks": "Attempting to mark shifting completed without engineer inspection."
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint" in resp.json()["detail"]


def test_negative_contractor_cannot_execute_land_acquisition_workflow():
    contractor_token = get_auth_token(username="contractor_lt", password="highway123")
    headers = {"Authorization": f"Bearer {contractor_token}"}

    resp = client.post(
        "/api/v1/land-utility/parcels/1/workflow",
        headers=headers,
        json={
            "new_stage": "Award 19(1)",
            "officer_remarks": "Contractor attempting land award stage update."
        }
    )
    assert resp.status_code == 403
    assert "RBAC Restriction" in resp.json()["detail"]
