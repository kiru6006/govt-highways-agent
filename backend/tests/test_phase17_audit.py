import pytest
from starlette.testclient import TestClient

def get_auth_token(client: TestClient, username: str, password: str = "highway123") -> str:
    if username == "admin":
        password = "admin123"
    res = client.post(
        "/api/v1/auth/token",
        data={"username": username, "password": password}
    )
    assert res.status_code == 200, f"Login failed for {username}: {res.text}"
    return res.json()["access_token"]

def test_unauthenticated_request_rejected(client: TestClient):
    """Verify that sensitive endpoints strictly reject unauthenticated access with 401."""
    res = client.get("/api/v1/projects")
    assert res.status_code == 401
    assert "detail" in res.json()

def test_contractor_multi_tenant_isolation(client: TestClient):
    """Verify that contractor_lt can only see their assigned project and not rival bidder projects."""
    token = get_auth_token(client, "contractor_lt")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/projects", headers=headers)
    assert res.status_code == 200
    projects = res.json()
    codes = [p["project_code"] for p in projects]
    assert "PRJ-TN-2026-001" in codes
    assert "PRJ-TN-2026-002" not in codes, "Contractor L&T must NOT see Contractor PST projects!"

def test_nonexistent_project_360_returns_404(client: TestClient):
    """Verify that requesting a non-existent project returns a clean 404."""
    token = get_auth_token(client, "secretary")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/projects/99999/360", headers=headers)
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_ai_findings_statutory_grounding_and_neutrality(client: TestClient):
    """Verify that all AI findings strictly avoid prohibited accusatory language."""
    token = get_auth_token(client, "secretary")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/executive/ai/findings", headers=headers)
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) > 0
    
    prohibited_terms = ["corrupt", "scam", "fraudulent", "collusion", "embezzle"]
    for f in findings:
        title = f.get("title", "").lower()
        desc = f.get("description", "").lower()
        rec = f.get("recommended_action", "").lower()
        for term in prohibited_terms:
            assert term not in title, f"Prohibited term '{term}' found in finding title: {title}"
            assert term not in desc, f"Prohibited term '{term}' found in finding desc: {desc}"
            assert term not in rec, f"Prohibited term '{term}' found in recommendation: {rec}"

def test_evm_metrics_zero_division_safety(client: TestClient):
    """Verify that EVM calculations handle potential division-by-zero boundary cases."""
    token = get_auth_token(client, "secretary")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/projects/1/360", headers=headers)
    assert res.status_code == 200
    data = res.json()
    evm = data.get("execution_tracking", {})
    assert "cost_performance_index" in evm
    assert "schedule_performance_index" in evm
    assert "cost_variance_cr" in evm
    assert "schedule_variance_cr" in evm
    # Must be valid numeric values, not inf or nan
    assert isinstance(evm["cost_performance_index"], (int, float))
    assert isinstance(evm["schedule_performance_index"], (int, float))
