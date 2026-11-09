import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient):
    resp = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    raise RuntimeError(f"Login failed: {resp.text}")

def test_overview_12_kpis_and_drilldown(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/overview", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    # 1. Total land parcels required
    assert data["total_parcels_required"] >= 60
    # 2. Parcels acquired
    assert data["parcels_acquired"] >= 1
    # 3. Parcels pending acquisition
    assert data["parcels_pending_acquisition"] >= 1
    # 4. Parcels under litigation
    assert data["parcels_under_litigation"] >= 5
    # 5. Parcels with court restrictions
    assert data["parcels_with_court_restrictions"] >= 2
    # 6. Revenue Department responses overdue
    assert data["revenue_dept_responses_overdue"] >= 1
    # 7. Forest and other statutory clearances pending
    assert data["forest_statutory_clearances_pending"] >= 1
    # 8. Projects blocked by land issues
    assert data["projects_blocked_by_land"] >= 1
    # 9. Projects blocked on the critical path
    assert data["projects_blocked_on_critical_path"] >= 1
    # 10. Actual additional expenditure caused by delay
    assert data["actual_additional_expenditure_cr"] > 0
    # 11. Estimated future financial exposure
    assert data["estimated_future_financial_exposure_cr"] > 0
    # 12. Sites requiring stop-work or readiness review
    assert data["sites_requiring_stop_work_or_readiness_review"] >= 1

    # SIMULATED data mode check
    assert data["data_mode"] == "SIMULATED"
    assert "SIMULATED" in data["provenance_notice"]


def test_parcel_listing_filtering_and_360(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Test list & filter
    resp = client.get("/api/v1/land-litigation/parcels?limit=10", headers=headers)
    assert resp.status_code == 200
    res = resp.json()
    assert res["total"] >= 60
    assert len(res["items"]) <= 10

    first_parcel = res["items"][0]
    p_id = first_parcel["id"]

    # Test Parcel 360 detailed dossier
    p360_resp = client.get(f"/api/v1/land-litigation/parcels/{p_id}", headers=headers)
    assert p360_resp.status_code == 200
    p360 = p360_resp.json()
    assert "parcel" in p360
    assert "workflow_milestones" in p360
    assert "linked_litigation_cases" in p360
    assert "revenue_requests" in p360
    assert "site_blockers" in p360
    assert p360["parcel"]["id"] == p_id
    assert p360["parcel"]["data_mode"] in ["SIMULATED", "mock"]


def test_litigation_cases_work_restriction_distinction(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/litigation", headers=headers)
    assert resp.status_code == 200
    cases = resp.json()
    assert len(cases) >= 20

    # Verify distinction: work restricted vs pending without work restriction
    restricted_cases = [c for c in cases if c["work_restricted"] is True]
    unrestricted_cases = [c for c in cases if c["work_restricted"] is False]

    assert len(restricted_cases) >= 2, "Must have active stay/injunction cases"
    assert len(unrestricted_cases) >= 5, "Must have cases pending without operative work restriction"

    # Verify restriction scope is clear and specific
    for c in restricted_cases:
        assert c["restriction_scope"] is not None and len(c["restriction_scope"]) > 5
        assert c["interim_order_status"] in ["INTERIM_STAY_ACTIVE", "STATUS_QUO"]

    # Verify unrestricted cases do not shut down construction
    for c in unrestricted_cases:
        assert c["interim_order_status"] in ["NO_ORDER", "NOTICE_ONLY", "STATUS_QUO"]


def test_revenue_coordination_overdue_calculation(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/revenue-coordination", headers=headers)
    assert resp.status_code == 200
    reqs = resp.json()
    assert len(reqs) >= 15

    overdue_reqs = [r for r in reqs if r["days_overdue"] > 0]
    assert len(overdue_reqs) >= 1, "Must detect overdue revenue responses"

    for r in overdue_reqs:
        assert r["response_status"] == "OVERDUE"
        assert r["days_overdue"] > 0
        assert r["receiving_revenue_authority"] is not None


def test_revenue_coordination_create(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "project_id": 1,
        "district": "Tiruvallur",
        "taluk": "Ponneri Taluk",
        "village": "Minjur",
        "survey_number": "112/4B",
        "requesting_highways_officer": "Er. S. Narayanan, EE (H)",
        "receiving_revenue_authority": "Tahsildar Ponneri",
        "request_type": "Field Measurement Book",
        "request_details": "Urgent extract of FMB sketch for bridge approach widening.",
        "due_date": "2026-03-15T00:00:00Z",
        "documents_missing": "Certified FMB subdivision copy"
    }

    resp = client.post("/api/v1/land-litigation/revenue-coordination", headers=headers, json=payload)
    assert resp.status_code == 200
    created = resp.json()
    assert created["request_code"].startswith("REV-REQ-2026-")
    assert created["district"] == "Tiruvallur"
    assert created["response_status"] == "PENDING"
    assert created["data_mode"] == "SIMULATED"


def test_advocate_monitoring_alerts_and_no_unsupported_negligence(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/advocate-monitoring", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert "summary" in data
    assert "cases" in data
    assert data["summary"]["active_cases_monitored"] >= 20
    assert data["summary"]["total_assigned_counsels"] >= 4

    # Ensure counsel tracking separates procedural delays from unsupported negligence findings
    for c in data["cases"]:
        assert c["assigned_counsel_name"] is not None
        # Counsel should not be branded incompetent autonomously
        if c["human_performance_review_notes"]:
            assert "incompetent" not in c["human_performance_review_notes"].lower()
            assert "negligent" not in c["human_performance_review_notes"].lower()


def test_site_blockers_readiness_gates(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/site-blockers", headers=headers)
    assert resp.status_code == 200
    blockers = resp.json()
    assert len(blockers) >= 30

    gates = set(b["readiness_gate"] for b in blockers)
    assert "RED" in gates
    assert "AMBER" in gates
    assert "GREEN" in gates

    red_blockers = [b for b in blockers if b["readiness_gate"] == "RED"]
    for b in red_blockers:
        assert b["action_required"] is not None
        assert b["resolution_owner"] is not None
        assert b["chainage_display"] is not None


def test_financial_exposure_no_double_counting(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/financial-exposure", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    summary = data["summary"]
    # Verify separate calculations
    assert summary["total_project_value_affected_cr"] > summary["total_actual_incremental_expenditure_cr"]
    assert summary["total_contractor_claims_submitted_cr"] >= summary["total_claims_admitted_cr"]

    # Verify no double counting: forecast incremental is not conflated with project value
    assert summary["total_forecast_incremental_cost_cr"] < summary["total_project_value_affected_cr"]
    assert summary["total_forecast_incremental_cost_cr"] > 0
    assert "double_counting_protection" in summary


def test_pre_construction_risk_assessment_override_enforcement(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch assessments
    resp = client.get("/api/v1/land-litigation/pre-construction-risk-assessment", headers=headers)
    assert resp.status_code == 200
    assessments = resp.json()
    assert len(assessments) >= 5

    # Find the assessment with binding legal prohibition
    prohibited_assessment = next(a for a in assessments if a["has_binding_legal_prohibition"] is True)
    p_id = prohibited_assessment["id"]

    # Attempt override -> MUST BE REJECTED WITH 403
    override_payload = {
        "justification": "Urgent public interest in completing corridor before monsoon season.",
        "officer_name": "Chief Engineer (C&M)"
    }
    deny_resp = client.post(f"/api/v1/land-litigation/pre-construction-risk-assessment/{p_id}/override", headers=headers, json=override_payload)
    assert deny_resp.status_code == 403
    assert "STATUTORY OVERRIDE PROHIBITED" in deny_resp.json()["detail"]


def test_pre_construction_risk_assessment_override_permitted_when_no_stay(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/pre-construction-risk-assessment", headers=headers)
    assessments = resp.json()

    # Find an AMBER assessment without legal prohibition
    permitted_assessment = next(a for a in assessments if not a["has_binding_legal_prohibition"] and a["readiness_status"] == "AMBER")
    p_id = permitted_assessment["id"]

    override_payload = {
        "justification": "Revenue DRO verified that 92% awards are disbursed; contractor to start earthwork on non-contiguous clear stretch.",
        "officer_name": "Er. S. Palanivel, Chief Engineer (C&M)"
    }
    allow_resp = client.post(f"/api/v1/land-litigation/pre-construction-risk-assessment/{p_id}/override", headers=headers, json=override_payload)
    assert allow_resp.status_code == 200
    data = allow_resp.json()
    assert data["authorized_override_granted"] is True
    assert data["override_officer_name"] == "Er. S. Palanivel, Chief Engineer (C&M)"


def test_cm_land_litigation_summary(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/land-litigation/cm-summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["top_10_blocked_projects"]) <= 10
    assert len(data["critical_court_restrictions"]) >= 1
    assert len(data["highest_financial_exposure_cases"]) >= 1
    assert len(data["revenue_responses_overdue"]) >= 1
    assert data["total_active_court_stays"] >= 2
    assert data["total_financial_exposure_cr"] > 0


def test_grounded_ai_ask_queries(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Query 1: Why is this land parcel not available?
    resp1 = client.post("/api/v1/land-litigation/ai-ask", headers=headers, json={"question_key": "q1"})
    assert resp1.status_code == 200
    res1 = resp1.json()
    assert len(res1["verified_facts"]) >= 2
    assert len(res1["missing_information"]) >= 1
    assert len(res1["relevant_evidence"]) >= 1
    assert res1["responsible_resolution_authority"] is not None
    assert res1["financial_exposure_cr"] > 0
    assert res1["provenance"] == "SIMULATED"

    # Query 4: Which projects are blocked by court orders?
    resp4 = client.post("/api/v1/land-litigation/ai-ask", headers=headers, json={"question_key": "q4"})
    assert resp4.status_code == 200
    res4 = resp4.json()
    assert "PRJ-TN-2026-002" in " ".join(res4["verified_facts"])
    assert res4["urgency_level"] == "CRITICAL"


def test_resolution_actions_lifecycle(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create new resolution action
    payload = {
        "project_id": 1,
        "action_title": "Schedule Joint Total Station Survey with Tahsildar Tambaram",
        "action_description": "Demarcate highway RoW boundary to counter compound wall stay.",
        "assigned_department": "Revenue Department",
        "assigned_officer": "Tahsildar Tambaram",
        "target_date": "2026-02-28T00:00:00Z",
        "escalation_level": "DISTRICT_DRO"
    }
    create_resp = client.post("/api/v1/land-litigation/resolutions", headers=headers, json=payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    act_id = created["id"]
    assert created["status"] == "OPEN"
    assert created["is_closed"] is False

    # Close with evidence
    update_resp = client.put(
        f"/api/v1/land-litigation/resolutions/{act_id}/status?status=CLOSED&closure_remarks=Survey+completed+and+signed+sketch+filed+in+court",
        headers=headers
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["status"] == "CLOSED"
    assert updated["is_closed"] is True
    assert "Survey completed" in updated["closure_remarks"]
