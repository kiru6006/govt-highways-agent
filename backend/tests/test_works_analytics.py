"""
Automated tests for Unified Works Analytics:
- Filter registry metadata and cascading options
- Works Data Explorer queries with search, administrative filters, and progress bands
- Synchronized KPIs calculation
- Synchronized Charts calculation (A through J)
- Multi-sheet Excel and CSV exports with formula-injection guard
- Single work detail dossier retrieval
"""

import io
import pytest
from openpyxl import load_workbook


def test_filter_registry(client):
    """Test filter registry provides administrative, scheme, stage, progress band, and risk filters."""
    res = client.get("/api/v1/works-analytics/filter-registry")
    assert res.status_code == 200
    data = res.json()
    
    assert "wings" in data
    assert "Construction & Maintenance" in data["wings"]
    assert "Projects" in data["wings"]
    
    assert "circles" in data
    assert len(data["circles"]) >= 5
    
    assert "divisions" in data
    assert len(data["divisions"]) >= 10
    
    assert "schemes" in data
    assert "CRIDP - Regular" in data["schemes"]
    
    assert "work_stages" in data
    assert "Work in Progress" in data["work_stages"]
    assert "Completed" in data["work_stages"]
    
    assert "progress_bands" in data
    expected_bands = ["0–10%", "10–25%", "26–50%", "51–75%", "76–90%", "91–100%"]
    assert data["progress_bands"] == expected_bands
    
    assert "delay_categories" in data
    assert "No Delay" in data["delay_categories"]
    assert "< 30 Days" in data["delay_categories"]


def test_query_works_default(client):
    """Test default query returns seeded works with pagination and active chips."""
    res = client.post("/api/v1/works-analytics/query?skip=0&limit=25", json={})
    assert res.status_code == 200
    data = res.json()
    
    assert data["total_matching"] > 100
    assert len(data["items"]) == 25
    assert data["page"] == 1
    assert data["page_size"] == 25
    
    first = data["items"][0]
    assert "work_code" in first
    assert "work_name" in first
    assert "wing" in first
    assert "circle" in first
    assert "division" in first
    assert "as_amount_cr" in first
    assert "physical_progress_pct" in first


def test_query_works_search(client):
    """Test free text search across work name, code, contractor, and road name."""
    res = client.post("/api/v1/works-analytics/query", json={"search_query": "Bypass"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] > 0
    for r in data["items"]:
        assert ("bypass" in r["work_name"].lower() or 
                "bypass" in (r.get("road_name") or "").lower() or 
                "bypass" in (r.get("contractor_name") or "").lower())


def test_query_works_administrative_cascade(client):
    """Test filtering by Wing, Circle, and Division."""
    res = client.post("/api/v1/works-analytics/query", json={
        "wings": ["Construction & Maintenance"],
        "circles": ["Chennai Circle"],
        "divisions": ["Chennai City Roads Division"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] > 0
    for r in data["items"]:
        assert r["wing"] == "Construction & Maintenance"
        assert r["circle"] == "Chennai Circle"
        assert r["division"] == "Chennai City Roads Division"


def test_query_works_non_overlapping_progress_bands(client):
    """Test that progress bands partition records without overlap."""
    bands = ["0–10%", "10–25%", "26–50%", "51–75%", "76–90%", "91–100%"]
    total_band_records = 0
    
    for band in bands:
        res = client.post("/api/v1/works-analytics/query?limit=500", json={"progress_bands": [band]})
        assert res.status_code == 200
        data = res.json()
        count = data["total_matching"]
        total_band_records += count
        for r in data["items"]:
            pct = r["physical_progress_pct"]
            if band == "0–10%":
                assert 0.0 <= pct <= 10.0
            elif band == "10–25%":
                assert 10.0 < pct <= 25.0
            elif band == "26–50%":
                assert 25.0 < pct <= 50.0
            elif band == "51–75%":
                assert 50.0 < pct <= 75.0
            elif band == "76–90%":
                assert 75.0 < pct <= 90.0
            elif band == "91–100%":
                assert 90.0 < pct <= 100.0

    # Total across disjoint partition should equal total all records
    res_all = client.post("/api/v1/works-analytics/query?limit=1", json={})
    assert total_band_records == res_all.json()["total_matching"]


def test_query_works_stage_and_delays(client):
    """Test filtering by stage and delay category."""
    res = client.post("/api/v1/works-analytics/query", json={
        "work_stages": ["Work in Progress"],
        "forecast_delay_categories": ["> 180 Days"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] > 0
    for r in data["items"]:
        assert r["work_stage"] == "Work in Progress"
        assert r["forecast_delay_category"] == "> 180 Days"


def test_query_works_dependencies_and_risks(client):
    """Test filtering by dependency blockers and critical risk flags."""
    res = client.post("/api/v1/works-analytics/query", json={
        "dependency_issues": ["land_acquisition"],
        "risk_severities": ["CRITICAL", "HIGH"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_matching"] > 0
    for r in data["items"]:
        assert r["issue_land_acquisition"] is True
        assert r["risk_severity"] in ["CRITICAL", "HIGH"]


def test_calculate_kpis_synchronization(client):
    """Test that calculated KPIs reflect the filtered subset."""
    filter_payload = {"wings": ["Projects"]}
    
    # Query count & cost sum
    query_res = client.post("/api/v1/works-analytics/query?limit=500", json=filter_payload)
    records = query_res.json()["items"]
    expected_count = query_res.json()["total_matching"]
    expected_as_cr = round(sum(r["as_amount_cr"] for r in records), 2)
    expected_exp_cr = round(sum(r["expenditure_cr"] for r in records), 2)

    # KPI endpoint
    kpi_res = client.post("/api/v1/works-analytics/kpis", json=filter_payload)
    assert kpi_res.status_code == 200
    kpis = kpi_res.json()
    
    assert kpis["total_works"] == expected_count
    assert abs(kpis["total_as_amount_cr"] - expected_as_cr) < 0.1
    assert abs(kpis["total_expenditure_cr"] - expected_exp_cr) < 0.1
    assert kpis["completed_works"] + kpis["work_in_progress"] <= kpis["total_works"]
    assert kpis["total_length_km"] > 0


def test_calculate_charts_synchronization(client):
    """Test that chart endpoints return all charts A to J."""
    res = client.post("/api/v1/works-analytics/charts", json={})
    assert res.status_code == 200
    charts = res.json()
    
    # Chart A: Progress Bands
    assert "progress_stages" in charts
    assert len(charts["progress_stages"]) == 6
    
    # Chart B: Potential Delays
    assert "potential_delay_distribution" in charts
    assert len(charts["potential_delay_distribution"]) >= 4
    
    # Chart C: Agreement Delays
    assert "agreement_delay_distribution" in charts
    
    # Chart D: Pre-construction stages
    assert "pre_construction_stages" in charts
    
    # Chart E: Financial progress
    assert "financial_performance" in charts
    assert "overall_financial_progress_pct" in charts["financial_performance"]
    
    # Chart F: Circle performance
    assert "circle_division_performance" in charts
    assert len(charts["circle_division_performance"]) > 0
    
    # Chart G: Scheme performance
    assert "scheme_performance" in charts
    assert len(charts["scheme_performance"]) > 0
    
    # Chart H: Critical risks
    assert "risk_distribution" in charts
    assert len(charts["risk_distribution"]) > 0
    
    # Chart I: Year-wise trends
    assert "year_trends" in charts
    assert len(charts["year_trends"]) > 0
    
    # Chart J: CRIDP 5-year renewal
    assert "cridp_five_year_verification" in charts
    assert "eligible_length_km" in charts["cridp_five_year_verification"]


def test_export_excel_with_formula_injection_guard(client):
    """Test multi-sheet Excel export and verify formula injection guard."""
    res = client.post("/api/v1/works-analytics/export?format=excel", json={
        "wings": ["Construction & Maintenance"]
    })
    assert res.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in res.headers["content-type"]
    assert "attachment; filename=" in res.headers["content-disposition"]
    
    # Parse excel with openpyxl
    wb = load_workbook(io.BytesIO(res.content))
    expected_sheets = [
        "Filtered Works",
        "KPI Summary",
        "Risk Findings",
        "Data Quality Exceptions",
        "Filter Criteria & Metadata"
    ]
    assert wb.sheetnames == expected_sheets
    
    # Check Filtered Works sheet has data
    works_sheet = wb["Filtered Works"]
    assert works_sheet.max_row > 1  # Header + rows
    
    # Verify formula injection guard on any text cell
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            for val in row:
                if isinstance(val, str) and len(val) > 1:
                    # Raw Excel values must never begin with dangerous characters without being escaped
                    assert not val.startswith(("=", "+", "@")), f"Formula injection vulnerability found: {val}"


def test_export_csv(client):
    """Test CSV export."""
    res = client.post("/api/v1/works-analytics/export?format=csv", json={
        "page_size": 10
    })
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.content.decode("utf-8")
    lines = content.strip().split("\n")
    assert len(lines) > 1
    assert "Work Code" in lines[0]


def test_get_work_detail_by_id(client):
    """Test fetching full dossier for a single work."""
    list_res = client.post("/api/v1/works-analytics/query?limit=1", json={})
    work_id = list_res.json()["items"][0]["id"]
    
    res = client.get(f"/api/v1/works-analytics/work/{work_id}")
    assert res.status_code == 200
    work = res.json()
    assert work["id"] == work_id
    assert "work_code" in work
    assert "contractor_name" in work
    assert "risk_severity" in work
