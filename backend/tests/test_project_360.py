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

def test_project_portfolio_listing_and_filtering(client: TestClient):
    """
    Project portfolio lists projects with rich technical and administrative attributes,
    supporting search, status, and road-type filters.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    # All projects
    res = client.get("/api/v1/projects", headers=headers)
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) >= 5

    # Filter by road_type=SH
    res_sh = client.get("/api/v1/projects?road_type=SH", headers=headers)
    assert res_sh.status_code == 200
    sh_projects = res_sh.json()
    assert all(p["road_type"] == "SH" for p in sh_projects)

    # Search filter
    res_search = client.get("/api/v1/projects?search=ECR", headers=headers)
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert len(search_data) >= 1
    p1 = search_data[0]
    assert p1["project_code"] == "PRJ-TN-2026-001"
    assert p1["total_length_km"] == 33.4
    assert p1["carriageway_width_m"] == 14.0
    assert "CRIDP" in p1["funding_source"]

def test_project_360_detail_dossier_17_facets(client: TestClient):
    """
    GET /api/v1/projects/{id}/360 returns the unified 17-facet project intelligence dossier.
    """
    token = get_auth_token(client, "chief_eng")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/projects/1/360", headers=headers)
    assert res.status_code == 200
    dossier = res.json()

    # 1. Project identity & technical specs
    assert dossier["project"]["project_code"] == "PRJ-TN-2026-001"
    assert dossier["technical_specs"]["carriageway_width_m"] == 14.0
    assert dossier["technical_specs"]["total_length_km"] == 33.4
    assert dossier["jurisdiction_hierarchy"]["division_name"] is not None

    # 2. Sanctions
    assert len(dossier["sanctions"]) >= 1

    # 3. Milestones
    assert len(dossier["milestones"]) >= 4
    milestone_codes = [m["milestone_code"] for m in dossier["milestones"]]
    assert "MS-01" in milestone_codes
    assert "MS-04" in milestone_codes

    # 4. Execution tracking & EVM
    evm = dossier["execution_tracking"]
    assert "planned_value_cr" in evm
    assert "earned_value_cr" in evm
    assert "actual_cost_cr" in evm
    assert "cost_variance_cr" in evm
    assert "schedule_variance_cr" in evm
    assert "cost_performance_index" in evm
    assert "schedule_performance_index" in evm
    assert evm["status_assessment"] in ["ON_TRACK", "AT_RISK", "CRITICAL_DELAY", "COST_OVERRUN"]

    # 5. Progress history
    assert len(dossier["progress_history"]) >= 4

    # 6. Work packages
    assert len(dossier["work_packages"]) >= 1

    # 7. Contractors & consultants
    assert "main_contractor" in dossier["contractors_and_consultants"]
    assert dossier["contractors_and_consultants"]["main_contractor"]["name"] is not None

    # 8. Assigned officials and stakeholders
    officials = dossier["assigned_officials_and_stakeholders"]
    assert len(officials) >= 3
    stakeholder_types = [o["stakeholder_type"] for o in officials]
    assert "APEX_SECRETARIAT" in stakeholder_types
    assert "CHIEF_ENGINEER" in stakeholder_types

    # 9. Land acquisition
    assert "total_parcels" in dossier["land_acquisition"]

    # 10. Utilities & dependencies
    assert "items" in dossier["utilities_and_dependencies"]

    # 11. Engineering quality
    assert "total_defects_logged" in dossier["engineering_quality"]

    # 12. Legal cases
    assert "active_stays_count" in dossier["legal_cases"]

    # 13. Documents
    assert isinstance(dossier["documents"], list)

    # 14. Risks & issues
    assert len(dossier["risks_and_issues"]["risks"]) >= 2

    # 15. AI findings
    assert isinstance(dossier["ai_findings"], list)

    # 16. Audit history
    assert isinstance(dossier["audit_history"], list)

def test_project_execution_evm_variance_calculations(client: TestClient):
    """
    Earned Value Management (EVM) variance formulas must be mathematically sound:
    CV = EV - AC
    SV = EV - PV
    CPI = EV / AC
    SPI = EV / PV
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/projects/1/360", headers=headers)
    assert res.status_code == 200
    evm = res.json()["execution_tracking"]

    ev = evm["earned_value_cr"]
    pv = evm["planned_value_cr"]
    ac = evm["actual_cost_cr"]

    # Verify mathematical consistency within floating point rounding (0.05 Cr tolerance)
    expected_cv = ev - ac
    expected_sv = ev - pv
    assert abs(evm["cost_variance_cr"] - expected_cv) < 0.05
    assert abs(evm["schedule_variance_cr"] - expected_sv) < 0.05

    if ac > 0:
        expected_cpi = ev / ac
        assert abs(evm["cost_performance_index"] - expected_cpi) < 0.05
    if pv > 0:
        expected_spi = ev / pv
        assert abs(evm["schedule_performance_index"] - expected_spi) < 0.05

def test_project_sub_resource_endpoints(client: TestClient):
    """
    Individual resource endpoints for milestones, progress history, and risks work cleanly.
    """
    token = get_auth_token(client, "chief_eng")
    headers = {"Authorization": f"Bearer {token}"}

    # Milestones
    res_m = client.get("/api/v1/projects/1/milestones", headers=headers)
    assert res_m.status_code == 200
    milestones = res_m.json()
    assert len(milestones) >= 4
    assert any(m["milestone_code"] == "MS-01" for m in milestones)

    # Progress history
    res_p = client.get("/api/v1/projects/1/progress-history", headers=headers)
    assert res_p.status_code == 200
    history = res_p.json()
    assert len(history) >= 4
    assert history[0]["reporting_month"] == "2024-03"

    # Risks
    res_r = client.get("/api/v1/projects/1/risks", headers=headers)
    assert res_r.status_code == 200
    risks = res_r.json()
    assert len(risks) >= 2
    assert any("Stay" in r["title"] or "Akkarai" in r["title"] for r in risks)

def test_project_360_jurisdiction_scoping_and_contractor_isolation(client: TestClient):
    """
    Contractors must only be permitted to view the 360° dossier of their own assigned project.
    Access to projects executed by other contractors must be rejected with HTTP 403 Forbidden.
    """
    # Login as L&T contractor (assigned to Project 1)
    token_lt = get_auth_token(client, "contractor_lt")
    headers_lt = {"Authorization": f"Bearer {token_lt}"}

    # Project 1: Permitted
    res_p1 = client.get("/api/v1/projects/1/360", headers=headers_lt)
    assert res_p1.status_code == 200
    assert res_p1.json()["project"]["project_code"] == "PRJ-TN-2026-001"

    # Project 2 (Assigned to PST): Forbidden
    res_p2 = client.get("/api/v1/projects/2/360", headers=headers_lt)
    assert res_p2.status_code == 403
    assert "Access Denied" in res_p2.json()["detail"]

def test_project_360_not_found(client: TestClient):
    """
    Requesting non-existent project returns HTTP 404.
    """
    token = get_auth_token(client, "admin")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/projects/99999/360", headers=headers)
    assert res.status_code == 404
