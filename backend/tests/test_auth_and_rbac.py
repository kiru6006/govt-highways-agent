import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, username: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/token",
        data={"username": username, "password": password}
    )
    assert response.status_code == 200, f"Login failed for {username}: {response.text}"
    return response.json()["access_token"]

def test_health_check(client: TestClient):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Phase 1 Enterprise Foundation" in data["disclaimer"]

def test_login_success_and_failure(client: TestClient):
    # Success
    res = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["user_info"]["role_code"] == "ADMIN"
    
    # Failure
    res_bad = client.post("/api/v1/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert res_bad.status_code == 401

def test_contractor_isolation(client: TestClient):
    """
    CRITICAL SECURITY CHECK:
    Contractor L&T must NOT access Contractor PST's project records.
    """
    # 1. Login as contractor_lt
    lt_token = get_auth_token(client, "contractor_lt", "highway123")
    headers = {"Authorization": f"Bearer {lt_token}"}
    
    # 2. Contractor lists projects: must only see their assigned project (PRJ-TN-2026-001)
    res_list = client.get("/api/v1/projects", headers=headers)
    assert res_list.status_code == 200
    projects = res_list.json()
    codes = [p["project_code"] for p in projects]
    assert "PRJ-TN-2026-001" in codes
    assert "PRJ-TN-2026-002" not in codes, "Contractor L&T should NOT see Contractor PST's project in list!"
    
    # 3. Direct access to Project 1 (allowed for L&T)
    res_p1 = client.get(f"/api/v1/projects/{projects[0]['id']}", headers=headers)
    assert res_p1.status_code == 200
    
    # 4. Direct access attempt by L&T on Project 2 (belonging to PST) -> must return 403 Forbidden!
    # First get Project 2 id using admin
    admin_token = get_auth_token(client, "admin", "admin123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    all_projects = client.get("/api/v1/projects", headers=admin_headers).json()
    p2 = next(p for p in all_projects if p["project_code"] == "PRJ-TN-2026-002")
    
    res_p2_unauthorized = client.get(f"/api/v1/projects/{p2['id']}", headers=headers)
    assert res_p2_unauthorized.status_code == 403, "Direct IDOR access must be blocked with 403 Forbidden!"
    assert "Access Denied" in res_p2_unauthorized.json()["detail"]

def test_chief_engineer_statewide_access(client: TestClient):
    """
    Chief Engineer has statewide jurisdiction and can access all projects.
    """
    ce_token = get_auth_token(client, "chief_eng", "highway123")
    headers = {"Authorization": f"Bearer {ce_token}"}
    
    res = client.get("/api/v1/projects", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 3

def test_workflow_status_transition_and_audit_log(client: TestClient):
    """
    Updating an issue status must record an immutable AuditEvent.
    """
    admin_token = get_auth_token(client, "admin", "admin123")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Fetch an issue
    issues = client.get("/api/v1/issues", headers=headers).json()
    assert len(issues) > 0
    target_issue = issues[0]
    
    # 2. Transition status to 'Action in Progress'
    patch_res = client.patch(
        f"/api/v1/issues/{target_issue['id']}",
        json={"status": "Action in Progress", "resolution_notes": "Tested in automated test suite"},
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Action in Progress"
    
    # 3. Check Audit log contains the transition event
    audit_res = client.get("/api/v1/audit?entity_type=ISSUE", headers=headers)
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert any(e["action"] == "STATUS_CHANGE" and e["entity_reference"] == target_issue["issue_reference"] for e in events)

def test_ask_ai_persistent_endpoint(client: TestClient):
    """
    Ask AI returns contextual demo-disclaimed intelligence.
    """
    admin_token = get_auth_token(client, "admin", "admin123")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    payload = {
        "query": "What are the critical bottlenecks on SH-49 ECR project?",
        "screen_context": "Executive Command Centre"
    }
    res = client.post("/api/v1/ai/query", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["is_demo"] is True
    assert "DEMO DATA ONLY" in data["disclaimer"]
    assert len(data["grounding_references"]) > 0
    assert len(data["suggested_actions"]) > 0

