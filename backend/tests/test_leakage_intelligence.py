import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username: str = "admin", password: str = "admin123"):
    res = client.post("/api/v1/auth/token", data={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_leakage_kpis_reconciliation():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/kpis", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_findings"] >= 16
    assert data["critical_findings"] >= 3
    assert data["potential_financial_exposure_cr"] > 50.0
    assert data["data_mode"] == "mock"

def test_leakage_findings_list_and_filters():
    token = get_token("admin")
    # All findings
    res = client.get("/api/v1/leakage/findings", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 16

    # Filter by severity
    res_crit = client.get("/api/v1/leakage/findings?severity=CRITICAL", headers={"Authorization": f"Bearer {token}"})
    assert res_crit.status_code == 200
    crit_findings = res_crit.json()
    assert all(f["severity"] == "CRITICAL" for f in crit_findings)

    # Filter by category
    res_dup = client.get("/api/v1/leakage/findings?category=Duplicate Payment Indicators", headers={"Authorization": f"Bearer {token}"})
    assert res_dup.status_code == 200
    dup_findings = res_dup.json()
    assert len(dup_findings) >= 1
    assert dup_findings[0]["finding_code"] == "ANM-2026-001"
    assert dup_findings[0]["scenario_id"] == "SCENARIO-01"

def test_leakage_finding_detail():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/findings/1", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["finding_code"] == "ANM-2026-001"
    assert "Duplicate RA Bill" in data["title"]
    assert data["potential_exposure_cr"] == 18.20
    assert "Detection Rule R-DUP-01" in data["why_flagged"]
    assert len(data["actions"]) >= 1

def test_leakage_categories_breakdown():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/categories", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 8
    cat_names = [c["category"] for c in categories]
    assert "Duplicate Payment Indicators" in cat_names
    assert "Milestone and Payment Mismatches" in cat_names
    assert "Unusual Cost Variations" in cat_names

def test_exposure_analysis():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/exposure-analysis", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["by_project"]) > 0
    assert len(data["by_category"]) > 0
    assert len(data["by_contractor"]) > 0
    assert len(data["month_trend"]) >= 5
    assert data["total_potential_exposure_cr"] > 50.0

def test_project_risk_matrix():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/project-risk-matrix", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    matrix = res.json()
    assert len(matrix) >= 1
    # Ordered descending by overall_composite_risk
    for i in range(len(matrix) - 1):
        assert matrix[i]["overall_composite_risk"] >= matrix[i + 1]["overall_composite_risk"]

def test_executive_assessment_narrative():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/executive-assessment", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "AI analysis" in data["summary_narrative"]
    assert len(data["critical_observations"]) >= 4
    assert len(data["observed_facts"]) >= 4
    assert len(data["calculated_indicators"]) >= 4
    assert len(data["ai_interpretations"]) >= 3
    assert len(data["recommended_executive_actions"]) >= 3

def test_decisions_requiring_attention():
    token = get_token("admin")
    res = client.get("/api/v1/leakage/decisions-requiring-attention", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    decisions = res.json()
    assert len(decisions) >= 1
    for d in decisions:
        assert d["escalation_level"] in ["MINISTER", "SECRETARY", "CHIEF_ENGINEER"]

def test_review_action_workflow_and_audit():
    token = get_token("admin")
    # Perform review update on finding #2
    payload = {
        "review_status": "ACTION_REQUIRED",
        "assigned_to": "Superintending Engineer Chennai",
        "review_remarks": "Automated test review - immediate recovery ordered from RA Bill 3",
        "corrective_action": "Schedule ₹2.20 Cr deduction from contractor ledger",
        "action_due_date": "2026-11-30",
        "escalate_to_secretary": True
    }
    res = client.post("/api/v1/leakage/findings/2/review", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    updated = res.json()
    assert updated["review_status"] == "ACTION_REQUIRED"
    assert updated["assigned_to"] == "Superintending Engineer Chennai"
    assert updated["escalated_to_secretary"] is True
    # Verify action was appended to history
    assert len(updated["actions"]) >= 2
    last_action = updated["actions"][-1]
    assert last_action["new_status"] == "ACTION_REQUIRED"

def test_leakage_rbac_restriction():
    # Contractor cannot access confidential vigilance findings
    contractor_token = get_token("contractor_lt", password="highway123")
    res = client.get("/api/v1/leakage/findings", headers={"Authorization": f"Bearer {contractor_token}"})
    assert res.status_code == 403
    assert "Access restricted" in res.json()["detail"]
