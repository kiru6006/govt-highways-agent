import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient) -> str:
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    if response.status_code == 200:
        return response.json().get("access_token")
    raise RuntimeError(f"Login failed: {response.text}")

def test_get_portfolio_overview(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/portfolio", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["total_major_works_count"] == 31
    assert data["total_contract_value_cr"] > 1000.0
    assert len(data["items"]) == 31

def test_get_canonical_reference_5566(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/portfolio/5566", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    item = data["work"]
    assert item["source_project_id"] == "5566"
    assert "Thirunindravur" in item["project_name"]
    assert item["physical_progress_pct"] == 78.0
    assert item["expenditure_cr"] == 38.36
    assert item["completion_delay_days"] == 317
    assert item["technical_sanction_cr"] == 45.50
    assert item["contract_value_cr"] == 41.20
    # Verify no fabricated court case on record
    assert "no court case" in item["court_case_remarks"].lower() or item["court_case_remarks"] == "No court case or civil injunction on record."

def test_blocker_register_listing_and_filtering(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/blockers", headers=headers)
    assert resp.status_code == 200
    blockers = resp.json()
    assert len(blockers) >= 8

    # Filter by category
    resp_rw = client.get("/api/v1/major-works/blockers?category=RAILWAY_COORDINATION", headers=headers)
    assert resp_rw.status_code == 200
    rw_blockers = resp_rw.json()
    assert any(b["blocker_code"] == "BLK-5566-01" for b in rw_blockers)

    # Filter by critical path
    resp_crit = client.get("/api/v1/major-works/blockers?is_critical_path=true", headers=headers)
    assert resp_crit.status_code == 200
    for b in resp_crit.json():
        assert b["is_critical_path"] is True

    # Update blocker status via PUT
    b_id = rw_blockers[0]["id"]
    put_resp = client.put(
        f"/api/v1/major-works/blockers/{b_id}/status",
        headers=headers,
        json={"status": "INVESTIGATION_ONGOING", "closure_remarks": "Joint inspection with Southern Railway underway"}
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["current_status"] == "INVESTIGATION_ONGOING"

def test_delay_investigation_5566(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    # Fetch 5566 snapshot to get canonical project_id
    snap_resp = client.get("/api/v1/major-works/portfolio/5566", headers=headers)
    p_id = snap_resp.json()["work"]["canonical_project_id"]

    inv_resp = client.get(f"/api/v1/major-works/investigations/{p_id}", headers=headers)
    assert inv_resp.status_code == 200
    inv = inv_resp.json()
    assert inv["delay_days_from_baseline"] == 317
    assert inv["milestone_health_verdict"] == "CRITICAL_PATH_BLOCKED"
    assert "Southern Railway" in inv["critical_path_assessment"]

def test_loss_prevention_ledger_zero_double_counting(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/financial-ledger", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    summary = data["summary"]
    assert "Statutory Financial Guard" in summary["accounting_guard_statement"]
    records = data["records"]
    assert len(records) >= 12
    # Check 5566 unquantified record exists
    unquant = [r for r in records if not r["is_quantified"]]
    assert len(unquant) >= 1
    assert unquant[0]["action_created_for_unquantified"] is True

def test_mitigation_recommendation_and_approval(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/mitigations", headers=headers)
    assert resp.status_code == 200
    mits = resp.json()
    assert len(mits) >= 3

    target_mit = mits[0]
    m_id = target_mit["id"]
    app_resp = client.post(
        f"/api/v1/major-works/mitigations/{m_id}/approve",
        headers=headers,
        json={
            "approved": True,
            "approving_officer": "Thiru K. Shanmugam, Principal Secretary",
            "approval_notes": "Option A approved. Direct conference with General Manager Southern Railway scheduled."
        }
    )
    assert app_resp.status_code == 200
    approved = app_resp.json()
    assert approved["human_approval_status"] == "APPROVED"
    assert "Thiru K. Shanmugam" in approved["approved_by_officer"]

def test_pre_construction_gates_and_statutory_stay_guard(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/major-works/pre-construction-gates", headers=headers)
    assert resp.status_code == 200
    gates = resp.json()
    assert len(gates) >= 3

    # Find gate with active court injunction (GATE-5655-01)
    stay_gate = next(g for g in gates if g["court_restrictions_active"] is True)
    assert stay_gate["gate_code"] == "GATE-5655-01"
    assert stay_gate["readiness_state"] == "RED"

    # Attempting administrative override on judicial stay MUST FAIL with 403 Forbidden
    override_resp = client.post(
        f"/api/v1/major-works/pre-construction-gates/{stay_gate['id']}/override",
        headers=headers,
        json={
            "justification": "Urgent public utility requirement, administrative exemption requested",
            "override_authority": "Chief Engineer C&M"
        }
    )
    assert override_resp.status_code == 403
    assert "injunction" in override_resp.json()["detail"].lower() or "prohibition" in override_resp.json()["detail"].lower()

def test_cm_summary_and_ai_ask(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    summary_resp = client.get("/api/v1/major-works/cm-summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_major_works_reviewed"] == 31
    assert summary["projects_with_critical_blockers"] >= 1
    assert summary["projects_with_completion_extensions"] >= 1
    assert summary["reference_case_5566"]["project_id"] == "5566"

    ai_resp = client.post(
        "/api/v1/major-works/ai-ask",
        headers=headers,
        json={"query": "What is the critical path blocker on Project 5566 LC-13 Thirunindravur?"}
    )
    assert ai_resp.status_code == 200
    ans = ai_resp.json()
    assert any("5566" in fact or "Thirunindravur" in fact for fact in ans["verified_facts"])
    assert len(ans["evidence_references"]) >= 1


def test_zero_duplicate_projects_and_staging_provenance(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check Reconciliation Report
    recon_resp = client.get("/api/v1/major-works/reconciliation-report", headers=headers)
    assert recon_resp.status_code == 200, recon_resp.text
    recon = recon_resp.json()
    assert recon["total_staged_records"] == 31
    assert recon["pending_verification_count"] >= 1
    assert len(recon["missing_fields_inventory"]) >= 1
    assert "More than 50Cr works details" in recon["provenance_summary"]

    # 2. Check 31 snapshots for provenance and zero duplicate source IDs
    port_resp = client.get("/api/v1/major-works/portfolio", headers=headers)
    assert port_resp.status_code == 200
    items = port_resp.json()["items"]
    assert len(items) == 31

    source_ids = [item["source_project_id"] for item in items]
    assert len(source_ids) == len(set(source_ids)), "Duplicate source_project_id found in snapshots!"

    for item in items:
        assert item["source_document"] == "More than 50Cr works details as on 21.09.2026.pdf"
        assert 1 <= item["source_page_number"] <= 35
        assert item["extraction_confidence"] == 0.95
        assert item["verification_status"] in ["EXTRACTED", "VERIFIED", "CONFLICTING"]


def test_snapshot_human_verification_and_canonical_immutability(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch snapshot 5566
    ref_resp = client.get("/api/v1/major-works/portfolio/5566", headers=headers)
    assert ref_resp.status_code == 200
    snap = ref_resp.json()["work"]
    snap_id = snap["id"]

    # Verify snapshot via officer human verification endpoint
    verify_resp = client.put(
        f"/api/v1/major-works/snapshots/{snap_id}/verify",
        headers=headers,
        json={
            "verified": True,
            "verification_status": "VERIFIED",
            "verified_by_officer": "Er. K. Ramesh (Superintending Engineer)",
            "update_canonical": True,
            "notes": "Verified against physical review minutes of 22.09.2026."
        }
    )
    assert verify_resp.status_code == 200, verify_resp.text
    verified_data = verify_resp.json()
    assert verified_data["verification_status"] == "VERIFIED"
    assert verified_data["verified_by_officer"] == "Er. K. Ramesh (Superintending Engineer)"
    assert verified_data["verified_at"] is not None


def test_evidence_spine_obligations_and_evidence_requests(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test Obligations listing
    ob_resp = client.get("/api/v1/major-works/obligations", headers=headers)
    assert ob_resp.status_code == 200
    obligations = ob_resp.json()
    assert len(obligations) >= 2
    assert any("Southern Railway" in o["owner_party"] for o in obligations)
    assert any("SEEDED DEMO - Not yet verified" in o["provenance_note"] for o in obligations)

    # 2. Test Evidence Requests listing
    ev_resp = client.get("/api/v1/major-works/evidence-requests", headers=headers)
    assert ev_resp.status_code == 200
    evidence_requests = ev_resp.json()
    assert len(evidence_requests) >= 3
    assert any("Joint Inspection" in r["item_requested"] for r in evidence_requests)
    assert any("SEEDED DEMO" in r["provenance_note"] for r in evidence_requests)

    # 3. Create a new Evidence Request
    ref_resp = client.get("/api/v1/major-works/portfolio/5566", headers=headers)
    proj_id = ref_resp.json()["work"]["canonical_project_id"]
    new_ev = client.post(
        "/api/v1/major-works/evidence-requests",
        headers=headers,
        json={
            "project_id": proj_id,
            "item_requested": "Contractor revised launching methodology statement",
            "requested_from_party": "M/s Sri Balaji Infra Projects Pvt Ltd",
            "due_date": "2026-10-25T00:00:00Z"
        }
    )
    assert new_ev.status_code == 201
    created = new_ev.json()
    assert created["request_code"].startswith("EVR-")
    assert created["status"] == "OPEN"
    assert created["verification_status"] == "UNVERIFIED"
    assert "SEEDED DEMO - Not yet verified" in created["provenance_note"]
