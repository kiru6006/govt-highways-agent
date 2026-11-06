import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, username: str, password: str = "highway123") -> str:
    pwd = "admin123" if username == "admin" else password
    res = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    assert res.status_code == 200, f"Auth failed for {username}: {res.text}"
    return res.json()["access_token"]

def test_executive_16_kpis_statewide(client: TestClient):
    """
    Verifies that all 16 mandated departmental KPIs are calculated and returned.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/kpis", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # 1. Total active projects
    assert data["total_active_projects"] >= 3
    # 2. Approved project value
    assert data["total_approved_project_value_cr"] > 100.0
    # 3. Total expenditure
    assert data["total_expenditure_cr"] > 50.0
    # 4. Total physical progress
    assert 0.0 <= data["total_physical_progress_pct"] <= 100.0
    # 5. Projects delayed
    assert data["projects_delayed"] >= 1
    # 6. Projects at high risk
    assert data["projects_high_risk"] >= 1
    # 7. Pending approvals
    assert data["pending_approvals"] >= 1
    # 8. Pending land acquisition
    assert data["pending_land_acquisition_ha"] > 0.0
    # 9. Pending utility shifting
    assert data["pending_utility_shifting_count"] >= 1
    # 10. Open quality defects
    assert data["open_quality_defects"] >= 1
    # 11. Pending contractor obligations
    assert data["pending_contractor_obligations"] >= 1
    # 12. Open legal cases
    assert data["open_legal_cases"] >= 1
    # 13. Unresolved audit observations
    assert data["unresolved_audit_observations"] >= 1
    # 14. Potential financial exposure
    assert data["potential_financial_exposure_cr"] > 0.0
    # 15. Verified financial recovery
    assert data["verified_financial_recovery_cr"] > 0.0
    # 16. Verified prevented expenditure
    assert data["verified_prevented_expenditure_cr"] > 0.0

    # Ensure financial metrics are distinct (never combined into a single savings number)
    assert data["total_expenditure_cr"] != data["potential_financial_exposure_cr"]
    assert data["potential_financial_exposure_cr"] != data["verified_financial_recovery_cr"]

def test_executive_kpis_contractor_scoping(client: TestClient):
    """
    Contractors must only see metrics pertaining to their own contracts.
    """
    token = get_auth_token(client, "contractor_lt")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/kpis", headers=headers)
    assert res.status_code == 200
    data = res.json()
    # L&T only has 1 project assigned
    assert data["total_active_projects"] == 1
    assert data["total_approved_project_value_cr"] == 142.20

def test_executive_zones_benchmarking(client: TestClient):
    """
    Zone comparison view returns comparable cohorts across Chennai, Coimbatore, Madurai, Tiruchirappalli.
    """
    token = get_auth_token(client, "chief_eng")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/zones", headers=headers)
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 4
    for z in zones:
        assert "completed_projects_pct" in z
        assert "average_project_delay_days" in z
        assert "budget_utilisation_pct" in z
        assert "contractor_performance_score" in z

def test_critical_leadership_issues(client: TestClient):
    """
    Verifies retrieval of Critical Issues Requiring Leadership Intervention.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/critical-issues", headers=headers)
    assert res.status_code == 200
    issues = res.json()
    assert len(issues) >= 3
    sample = issues[0]
    assert sample["issue_reference"].startswith("LDR-")
    assert sample["root_cause"] is not None
    assert sample["recommended_action"] is not None
    assert sample["financial_exposure_cr"] >= 0.0

def test_interdepartmental_blockers(client: TestClient):
    """
    Verifies cross-departmental coordination intelligence.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/interdepartmental", headers=headers)
    assert res.status_code == 200
    blockers = res.json()
    assert len(blockers) >= 3
    categories = [b["department_category"] for b in blockers]
    assert any("Revenue" in c for c in categories)
    assert any("Electricity" in c for c in categories)

def test_financial_leakage_and_evidence(client: TestClient):
    """
    Verifies measurement mismatches and unreconciled advances findings.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/executive/leakage", headers=headers)
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 2
    f = findings[0]
    assert f["confidence"] in ["HIGH", "MEDIUM", "LOW"]
    assert f["validation_status"] in ["INVESTIGATION_INDICATOR", "VERIFIED", "INFERRED", "TO_VALIDATE"]
    assert len(f["evidence_summary"]) > 0

def test_leadership_decision_creation_and_audit(client: TestClient):
    """
    Testing leadership decision recording and its immutable audit logging.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "required_decision": "Authorize Emergency Pre-stressing Technical Audit at Tambaram ROB [TEST]",
        "assigned_authority": "Chief Engineer (Projects)",
        "action_type": "INVESTIGATION",
        "supporting_evidence": "HRS Guindy Lab Certificate #HRS-2026-441",
        "resolution_notes": "Initiated via automated test harness."
    }

    res = client.post("/api/v1/executive/decisions", json=payload, headers=headers)
    assert res.status_code == 201
    decision = res.json()
    assert decision["decision_reference"].startswith("DEC-2026-")
    assert decision["status"] == "ASSIGNED_FOR_REVIEW"

    # Verify audit event was logged
    audit_res = client.get("/api/v1/audit?entity_type=LEADERSHIP_DECISION", headers=headers)
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert any(e["entity_reference"] == decision["decision_reference"] for e in events)

def test_minister_workspace_access_and_security(client: TestClient):
    """
    Verifies Minister's Command Centre endpoint security and data structure.
    - Minister role has authorized access.
    - Field engineers and contractors receive HTTP 403 Forbidden.
    """
    token_min = get_auth_token(client, "minister")
    res_min = client.get("/api/v1/executive/minister/overview", headers={"Authorization": f"Bearer {token_min}"})
    assert res_min.status_code == 200
    data = res_min.json()
    assert "strategic_kpis" in data
    assert "ai_briefing" in data
    assert "district_impact" in data
    assert "cabinet_decisions_pending" in data
    assert data["strategic_kpis"]["total_capital_outlay_cr"] > 100.0

    # Unauthorized access checks
    token_contractor = get_auth_token(client, "contractor_lt")
    res_contractor = client.get("/api/v1/executive/minister/overview", headers={"Authorization": f"Bearer {token_contractor}"})
    assert res_contractor.status_code == 403

    token_ee = get_auth_token(client, "ee_tambaram")
    res_ee = client.get("/api/v1/executive/minister/overview", headers={"Authorization": f"Bearer {token_ee}"})
    assert res_ee.status_code == 403

def test_secretary_workspace_access_and_security(client: TestClient):
    """
    Verifies Secretary's Command Centre endpoint security and data structure.
    - Secretary role has authorized access.
    - Field engineers and contractors receive HTTP 403 Forbidden.
    """
    token_sec = get_auth_token(client, "secretary")
    res_sec = client.get("/api/v1/executive/secretary/overview", headers={"Authorization": f"Bearer {token_sec}"})
    assert res_sec.status_code == 200
    data = res_sec.json()
    assert "governance_kpis" in data
    assert "ai_briefing" in data
    assert "accountability_alerts" in data["ai_briefing"]
    assert "zone_performance" in data
    assert "secretarial_actions_pending" in data

    # Unauthorized access checks
    token_contractor = get_auth_token(client, "contractor_lt")
    res_contractor = client.get("/api/v1/executive/secretary/overview", headers={"Authorization": f"Bearer {token_contractor}"})
    assert res_contractor.status_code == 403

    token_ee = get_auth_token(client, "ee_tambaram")
    res_ee = client.get("/api/v1/executive/secretary/overview", headers={"Authorization": f"Bearer {token_ee}"})
    assert res_ee.status_code == 403

def test_confidential_leakage_and_legal_protection(client: TestClient):
    """
    Verifies confidential financial vigilance and legal records are protected from contractors.
    """
    token_contractor = get_auth_token(client, "contractor_lt")
    h_contr = {"Authorization": f"Bearer {token_contractor}"}

    # Leakage must be blocked with 403
    res_leak = client.get("/api/v1/executive/leakage", headers=h_contr)
    assert res_leak.status_code == 403

    # Legal must be blocked with 403
    res_legal = client.get("/api/v1/executive/legal", headers=h_contr)
    assert res_legal.status_code == 403

    # Secretary and Admin have authorized access
    token_sec = get_auth_token(client, "secretary")
    h_sec = {"Authorization": f"Bearer {token_sec}"}
    assert client.get("/api/v1/executive/leakage", headers=h_sec).status_code == 200
    assert client.get("/api/v1/executive/legal", headers=h_sec).status_code == 200

def test_statutory_authority_enforcement_on_decisions(client: TestClient):
    """
    Verifies that statutory ministerial and secretarial actions enforce formally authorized powers.
    """
    token_min = get_auth_token(client, "minister")
    token_sec = get_auth_token(client, "secretary")
    token_ee = get_auth_token(client, "ee_tambaram")

    # EE cannot issue CABINET_NOTE
    payload_cab = {
        "required_decision": "Direct Cabinet note for inter-departmental land clearance",
        "assigned_authority": "Cabinet Secretariat",
        "action_type": "CABINET_NOTE"
    }
    res_fail = client.post("/api/v1/executive/decisions", json=payload_cab, headers={"Authorization": f"Bearer {token_ee}"})
    assert res_fail.status_code == 403

    # Minister can issue CABINET_NOTE
    res_ok = client.post("/api/v1/executive/decisions", json=payload_cab, headers={"Authorization": f"Bearer {token_min}"})
    assert res_ok.status_code == 201

    # EE cannot issue DISCIPLINARY_INQUIRY
    payload_disc = {
        "required_decision": "Order 17(a) inquiry under CCA Rules for prolonged project delay",
        "assigned_authority": "Vigilance Cell",
        "action_type": "DISCIPLINARY_INQUIRY"
    }
    res_disc_fail = client.post("/api/v1/executive/decisions", json=payload_disc, headers={"Authorization": f"Bearer {token_ee}"})
    assert res_disc_fail.status_code == 403

    # Secretary can issue DISCIPLINARY_INQUIRY
    res_disc_ok = client.post("/api/v1/executive/decisions", json=payload_disc, headers={"Authorization": f"Bearer {token_sec}"})
    assert res_disc_ok.status_code == 201

def test_verified_organisation_structure(client: TestClient):
    """
    Verifies that the organisation structure endpoint returns the verified
    Minister, Principal Secretary, HODs, statutory committees, and delegations of authority.
    """
    token = get_auth_token(client, "minister")
    res = client.get("/api/v1/executive/organisation/verified-structure", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()

    assert data["minister"]["name"] == "Thiru Aadhav Arjuna"
    assert data["minister"]["designation"] == "Minister for Public Works and Sports Development"
    assert data["principal_secretary"]["name"] == "Thiru Shunchonngam Jatak Chiru, IAS"
    assert data["principal_secretary"]["email"] == "hwaysec@tn.gov.in"
    assert "statutory_committees" in data
    assert any(c["code"] == "BOE" for c in data["statutory_committees"])
    assert any(c["code"] == "COT" for c in data["statutory_committees"])
    assert "delegations_of_authority" in data
    assert "heads_of_department" in data
    assert "verification_metadata" in data



