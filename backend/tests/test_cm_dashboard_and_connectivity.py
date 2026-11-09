import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, username: str, password: str = "highway123") -> str:
    pwd = "admin123" if username == "admin" else password
    res = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    assert res.status_code == 200, f"Auth failed for {username}: {res.text}"
    return res.json()["access_token"]

def test_cm_overview_17_kpis(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/cm/overview", headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()

    # Verify all 17 executive KPIs
    assert data["total_highways_projects"] >= 3
    assert data["total_sanctioned_budget_cr"] > 0
    assert data["total_expenditure_cr"] > 0
    assert 0 <= data["statewide_physical_progress_pct"] <= 100
    assert 0 <= data["statewide_financial_progress_pct"] <= 100
    assert data["projects_delayed_count"] >= 0
    assert data["projects_at_critical_risk_count"] >= 0
    assert data["pending_land_acquisition_parcels"] >= 0
    assert data["pending_land_extent_hectares"] >= 0
    assert data["pending_utility_shifting_items"] >= 0
    assert data["interdepartmental_dependencies_blocking"] >= 0
    assert data["open_legal_stays_count"] >= 0
    assert data["critical_quality_non_conformances"] >= 0
    assert data["high_risk_contractors_count"] >= 0
    assert data["active_cm_directions_count"] >= 0
    assert data["resolved_cm_directions_count"] >= 0
    assert data["overdue_cm_directions_count"] >= 0
    assert data["chief_minister"] == "Thiru C. Joseph Vijay"
    assert data["highways_minister"] == "Thiru Aadhav Arjuna"

def test_cm_delay_root_cause_analysis_no_double_counting(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/cm/delays/analysis/2", headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["project_id"] == 2
    assert data["total_calendar_delay_days"] >= 180
    assert data["critical_path_delay_days"] >= 180
    # Verified parallel non-critical does not equal total delay days
    assert data["total_calendar_delay_days"] == data["critical_path_delay_days"]
    assert len(data["delay_events"]) >= 1
    # Check event structure
    first_event = data["delay_events"][0]
    assert "causing_party" in first_event
    assert "resolving_authority" in first_event
    assert "is_critical_path" in first_event

def test_cm_escalations_and_directions(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    # Escalations
    res_esc = client.get("/api/v1/cm/escalations", headers=headers)
    assert res_esc.status_code == 200
    esc_data = res_esc.json()
    assert "escalations" in esc_data
    assert len(esc_data["escalations"]) >= 1

    # Directions list
    res_dir = client.get("/api/v1/cm/directions", headers=headers)
    assert res_dir.status_code == 200
    directions = res_dir.json()
    assert len(directions) >= 1

    # Issue a new CM direction
    new_dir_payload = {
        "title": "Fast-track Clearance for NH-45 Widening Overbridge",
        "project_id": 1,
        "target_department": "TANGEDCO",
        "assigned_officer_name": "Er. R. Sundaram",
        "assigned_officer_designation": "Superintending Engineer (TANGEDCO)",
        "priority": "HIGH",
        "issue_summary": "Delay in HT line relocation impacting pier 12 construction.",
        "directive_text": "Complete shifting within 10 days under direct supervision.",
        "deadline_date": "2026-11-20T18:00:00",
        "compliance_notes": "Pending TANGEDCO shutdown schedule."
    }
    res_post = client.post("/api/v1/cm/directions", json=new_dir_payload, headers=headers)
    assert res_post.status_code == 201 or res_post.status_code == 200
    created = res_post.json()
    assert created["direction_code"].startswith("CMD-")
    assert created["verified_by_cmo"] is True

    # Update CM direction status
    update_payload = {
        "status": "COMPLIED",
        "compliance_notes": "Shutdown completed on 2026-11-10; cables shifted safely."
    }
    res_put = client.put(f"/api/v1/cm/directions/{created['id']}", json=update_payload, headers=headers)
    assert res_put.status_code == 200
    updated = res_put.json()
    assert updated["status"] == "COMPLIED"

def test_cm_ai_daily_brief(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/cm/ai-daily-brief", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "generated_at" in data
    assert "executive_overview" in data
    assert len(data["cm_recommended_actions"]) >= 1
    assert "provenance_disclaimer" in data

def test_cm_jurisdiction_comparison(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/cm/jurisdiction-comparison", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "benchmarks" in data
    benchmarks = data["benchmarks"]
    assert len(benchmarks) >= 1
    assert "name" in benchmarks[0]
    assert "total_projects" in benchmarks[0]

def test_connectivity_entity_relationships_and_graph(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    # Entity relationships for Project 2
    res = client.get("/api/v1/connectivity/entities/PROJECT/2/relationships", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    # Check bidirectional connectivity
    rel = data[0]
    assert "source_entity_type" in rel
    assert "target_entity_type" in rel
    assert "relationship_type" in rel
    assert "access_tier" in rel

    # Interactive Graph
    res_graph = client.get("/api/v1/connectivity/graph?entity_type=PROJECT&entity_id=2&depth=2", headers=headers)
    assert res_graph.status_code == 200
    graph = res_graph.json()
    assert len(graph["nodes"]) >= 2
    assert len(graph["edges"]) >= 1

def test_connectivity_universal_search(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/connectivity/search?q=Salem", headers=headers)
    assert res.status_code == 200
    res_data = res.json()
    results = res_data.get("results", [])
    assert len(results) >= 1
    assert any("Salem" in r["title"] or "Salem" in r["subtitle"] for r in results)

def test_connectivity_create_supersede_and_suggestions(client: TestClient):
    token = get_auth_token(client, "cm")
    headers = {"Authorization": f"Bearer {token}"}

    # Create manual relationship
    create_payload = {
        "source_entity_type": "PROJECT",
        "source_entity_id": 1,
        "relationship_type": "DEPENDS_ON",
        "target_entity_type": "DEPARTMENT",
        "target_entity_id": 3,
        "weight": 0.85,
        "is_active": True,
        "is_critical_path": False,
        "provenance": "MANUAL",
        "description": "Manual clearance link for project 1",
        "access_tier": "INTERNAL"
    }
    res_create = client.post("/api/v1/connectivity/relationships", json=create_payload, headers=headers)
    assert res_create.status_code == 200
    created_rel = res_create.json()
    rel_id = created_rel["id"]

    # Supersede relationship
    res_sup = client.post(
        f"/api/v1/connectivity/relationships/{rel_id}/supersede?reason=Replaced+with+statutory+clearance",
        headers=headers
    )
    assert res_sup.status_code == 200
    assert res_sup.json()["is_current"] is False

    # Get suggested relationships
    res_sugg = client.get("/api/v1/connectivity/suggested-relationships?entity_type=PROJECT&entity_id=2", headers=headers)
    assert res_sugg.status_code == 200
    res_sugg_data = res_sugg.json()
    suggestions = res_sugg_data.get("suggestions", [])
    assert isinstance(suggestions, list)

    # Confirm suggestion
    if suggestions:
        s = suggestions[0]
        conf_payload = {
            "source_entity_type": s["source_entity_type"],
            "source_entity_id": int(s["source_entity_id"]),
            "relationship_type": s["suggested_relationship"],
            "target_entity_type": s["target_entity_type"],
            "target_entity_id": int(s["target_entity_id"]),
            "weight": s.get("confidence_score", 0.9),
            "is_active": True,
            "is_critical_path": False,
            "provenance": "HUMAN_CONFIRMED",
            "description": s.get("ai_reason", "Confirmed AI link"),
            "access_tier": "INTERNAL"
        }
        res_conf = client.post(
            f"/api/v1/connectivity/confirm-suggestion?suggestion_id={s['suggestion_id']}",
            json=conf_payload,
            headers=headers
        )
        assert res_conf.status_code == 200
        assert res_conf.json()["is_current"] is True
