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
