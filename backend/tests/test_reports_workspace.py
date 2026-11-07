import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username: str = "admin", password: str = "admin123"):
    res = client.post("/api/v1/auth/token", data={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_reports_overview_kpis():
    token = get_token("admin")
    res = client.get("/api/v1/reports/overview", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_active_projects"] >= 8
    assert data["total_project_value_cr"] > 1000.0
    assert data["total_expenditure_cr"] > 500.0
    assert data["physical_progress_avg_pct"] > 0
    assert data["delayed_projects_count"] >= 2
    assert data["critical_risk_projects_count"] >= 2
    assert data["pending_approvals_count"] >= 10
    assert data["land_acquisition_pending_count"] >= 10
    assert data["potential_financial_exposure_cr"] > 40.0
    assert data["data_mode"] == "mock"
    assert "total_active_projects" in data["kpi_definitions"]

def test_reports_programme_performance():
    token = get_token("admin")
    res = client.get("/api/v1/reports/programmes", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    programmes = res.json()
    assert len(programmes) >= 5
    codes = [p["programme_code"] for p in programmes]
    assert "CKICP" in codes
    assert "TNRSP_II" in codes
    assert "CMRDP" in codes
    assert "CRIDP" in codes
    assert "NABARD" in codes
    ckicp = next(p for p in programmes if p["programme_code"] == "CKICP")
    assert ckicp["delayed_projects_count"] >= 1
    assert ckicp["approved_cost_cr"] > 300.0

def test_reports_project_performance_and_filters():
    token = get_token("admin")
    # All projects
    res = client.get("/api/v1/reports/projects", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) >= 8

    # Filter by programme CKICP
    res_ckicp = client.get("/api/v1/reports/projects?programme=CKICP", headers={"Authorization": f"Bearer {token}"})
    assert res_ckicp.status_code == 200
    ckicp_projects = res_ckicp.json()
    assert all("CKICP" in p["programme"] for p in ckicp_projects)

    # Specific delayed project (Ooty-Gudalur Ghat Corridor)
    ooty = next((p for p in projects if p["project_id"] == 4), None)
    if ooty:
        assert ooty["schedule_variance_days"] == 115
        assert ooty["overall_risk"] == "CRITICAL"
        assert ooty["has_critical_blocker"] is True

def test_reports_financial_scrutiny():
    token = get_token("admin")
    res = client.get("/api/v1/reports/financial", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    fin = res.json()
    assert fin["approved_budget_cr"] > 1000.0
    assert fin["actual_expenditure_cr"] > 600.0
    assert len(fin["budget_vs_expenditure_by_programme"]) >= 5
    assert len(fin["monthly_expenditure_trend"]) >= 6
    assert len(fin["pending_payment_ageing"]) >= 4
    assert len(fin["cost_variation_analysis"]) >= 4

def test_reports_schedule_delay_analysis():
    token = get_token("admin")
    res = client.get("/api/v1/reports/schedule", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    sched = res.json()
    assert sched["delayed_projects_count"] >= 4
    assert sched["overdue_milestones_count"] >= 3
    assert len(sched["delay_analysis_table"]) >= 4
    first_delay = sched["delay_analysis_table"][0]
    assert "SH-15" in first_delay["project_title"]
    assert first_delay["delay_days"] == 115
    assert "TANGEDCO" in first_delay["primary_blocker"]

def test_reports_departmental_dependencies():
    token = get_token("admin")
    res = client.get("/api/v1/reports/departments", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    depts = res.json()
    assert len(depts) >= 5
    names = [d["department_name"] for d in depts]
    assert any("Revenue" in n for n in names)
    assert any("TANGEDCO" in n for n in names)
    assert any("Water Resources" in n for n in names)

def test_reports_contractor_performance_score():
    token = get_token("admin")
    res = client.get("/api/v1/reports/contractors", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    contractors = res.json()
    assert len(contractors) >= 4
    for c in contractors:
        assert 0 <= c["performance_score"] <= 100
        assert "formula" in c["score_breakdown"]
        assert c["score_breakdown"]["schedule_component"] >= 0

def test_reports_quality_and_assets():
    token = get_token("admin")
    res = client.get("/api/v1/reports/quality-assets", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    qa = res.json()
    assert qa["inspections_conducted"] > 100
    assert qa["ncrs_count"] >= 5
    assert qa["total_assets"] > 400
    assert qa["bridges_count"] >= 50

def test_reports_land_and_utility():
    token = get_token("admin")
    res = client.get("/api/v1/reports/land-utility", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    lu = res.json()
    assert lu["total_land_parcels"] > 100
    assert lu["utility_shifting_pending"] > 150
    assert len(lu["utility_type_breakdown"]) >= 3

def test_reports_ai_ministerial_briefing_5_subsections():
    token = get_token("admin")
    res = client.get("/api/v1/reports/ai-briefing", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    briefing = res.json()
    assert briefing["title"] == "AI Ministerial Intelligence Briefing"
    assert "headline" in briefing["what_needs_attention"]
    assert "financial_impact" in briefing["why_does_it_matter"]
    assert "immediate_directives" in briefing["what_should_be_done"]
    assert "actions" in briefing["who_should_act"]
    assert len(briefing["what_decision_is_required"]) >= 3

def test_reports_interactive_generation():
    token = get_token("admin")
    payload = {
        "report_type": "Executive Briefing",
        "programme": "CKICP",
        "district": "ALL",
        "reporting_period": "Quarterly",
        "include_financial": True,
        "include_delays": True,
        "include_contractor": True,
        "include_ai_findings": True,
        "include_land_utility": True,
        "include_quality": True
    }
    res = client.post("/api/v1/reports/generate", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    gen = res.json()
    assert "REP-TN-" in gen["report_id"]
    assert len(gen["sections"]) >= 5
    assert len(gen["recommended_decisions"]) >= 1

def test_ministerial_decision_action_workflow_and_audit():
    token = get_token("admin")
    # Get all decisions
    res = client.get("/api/v1/reports/decisions", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    decisions = res.json()
    assert len(decisions) >= 3

    # Update decision #1
    target_id = decisions[0]["id"]
    action_payload = {
        "current_status": "Action Assigned",
        "recorded_decision": "Direct DRO Coimbatore and TANGEDCO SE to convene on-site resolution on 18th Nov.",
        "remarks": "Priority taskforce constituted as directed by the Hon'ble Minister.",
        "assigned_officer": "Er. K. Senthil Nathan, M.E. (Chief Engineer CKICP)",
        "assigned_department": "CKICP Project Unit",
        "due_date": "2026-11-20"
    }
    res_update = client.post(
        f"/api/v1/reports/decisions/{target_id}/action",
        json=action_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["current_status"] == "Action Assigned"
    assert "Priority taskforce" in updated["remarks"]
    assert len(updated["actions"]) >= 2

def test_reports_csv_export():
    token = get_token("admin")
    res = client.get("/api/v1/reports/export/csv?report_type=projects", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "Project ID,Project Code" in res.text
    assert "mock" in res.text

def test_reports_rbac_restriction():
    # Contractor cannot access ministerial decision intelligence
    token = get_token("contractor_lt", "highway123")
    res = client.get("/api/v1/reports/overview", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
