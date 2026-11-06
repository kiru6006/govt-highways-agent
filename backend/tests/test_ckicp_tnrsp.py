import pytest
from starlette.testclient import TestClient

def get_auth_token(client: TestClient, username: str, password: str = "highway123") -> str:
    pwd = "admin123" if username == "admin" else password
    res = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    assert res.status_code == 200, f"Auth failed for {username}: {res.text}"
    return res.json()["access_token"]

def test_list_programmes(client: TestClient):
    """Verifies listing of special infrastructure programmes (CKICP, TNRSP_II, CRIDP)."""
    token = get_auth_token(client, "secretary")
    res = client.get("/api/v1/programmes", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    programmes = res.json()
    codes = [p["code"] for p in programmes]
    assert "CKICP" in codes
    assert "TNRSP_II" in codes
    assert "CRIDP" in codes

def test_ckicp_programme_details_and_kpis(client: TestClient):
    """Verifies CKICP master record, approved cost, funding agency, and overview KPIs."""
    token = get_auth_token(client, "minister")
    h = {"Authorization": f"Bearer {token}"}

    # 1. Master Record
    res = client.get("/api/v1/programmes/CKICP", headers=h)
    assert res.status_code == 200
    ckicp = res.json()
    assert ckicp["code"] == "CKICP"
    assert "Asian Development Bank" in ckicp["funding_agency"]
    assert ckicp["approved_cost_cr"] == 6448.00

    # 2. Aggregated KPIs
    res_kpi = client.get("/api/v1/programmes/CKICP/kpis", headers=h)
    assert res_kpi.status_code == 200
    kpis = res_kpi.json()
    assert kpis["total_projects"] >= 2
    assert kpis["total_tenders"] >= 4
    assert kpis["active_tenders"] >= 4
    assert kpis["total_land_required_sqm"] > 0
    assert "Thiru D. Baskara Pandian, IAS" in kpis["leadership"]["project_director"]

def test_ckicp_tenders_extraction_verification(client: TestClient):
    """
    Verifies that the 4 official CKICP tender announcements published on 18-02-2026
    are properly extracted with PDF source URLs, bid dates, and non-awarded statuses.
    """
    token = get_auth_token(client, "secretary")
    h = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/programmes/CKICP/tenders", headers=h)
    assert res.status_code == 200
    tenders = res.json()
    assert len(tenders) >= 4

    refs = [t["tender_reference"] for t in tenders]
    assert "CKICP-KANCHI-PKG-01-2026" in refs
    assert "CKICP-TRICHY-PKG-01-02-2026" in refs
    assert "CKICP-KANCHI-PKG-03-2026" in refs
    assert "CKICP-KANCHI-PKG-02-2026" in refs

    # Verify Kancheepuram Package 01 details
    pkg1 = next(t for t in tenders if t["tender_reference"] == "CKICP-KANCHI-PKG-01-2026")
    assert pkg1["location_district"] == "Kancheepuram"
    assert pkg1["estimated_cost_cr"] == 142.50
    assert "fnews_pdf50.pdf" in pkg1["source_url"]
    assert pkg1["status"] in ["PUBLISHED", "TECH_EVALUATION"]
    # Not yet awarded - successful bidder should be None
    assert pkg1["successful_bidder_name"] is None

def test_ckicp_and_tnrsp_land_parcels(client: TestClient):
    """Verifies cadastral land acquisition parcel tracking with statutory notification dates."""
    token = get_auth_token(client, "secretary")
    h = {"Authorization": f"Bearer {token}"}

    # CKICP Parcels
    res = client.get("/api/v1/programmes/CKICP/land-parcels", headers=h)
    assert res.status_code == 200
    parcels = res.json()
    assert len(parcels) >= 2
    assert any(p["parcel_reference"] == "LA-CKICP-KCH-001" for p in parcels)
    assert any(p["has_litigation"] == True for p in parcels)

    # TNRSP-II Parcels
    res_tnrsp = client.get("/api/v1/programmes/TNRSP_II/land-parcels", headers=h)
    assert res_tnrsp.status_code == 200
    parcels_tnrsp = res_tnrsp.json()
    assert len(parcels_tnrsp) >= 2
    # Verify Oddanchatram SH-37 large footprint parcel
    tpr_parcel = next(p for p in parcels_tnrsp if p["parcel_reference"] == "LA-TNRSP-TPR-001")
    assert tpr_parcel["total_land_sqm"] == 762688.0

def test_ckicp_legal_cases_and_stays(client: TestClient):
    """Verifies litigation tracking, High Court writ petitions, and stay order detection."""
    token = get_auth_token(client, "secretary")
    h = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/programmes/CKICP/legal-cases", headers=h)
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 1
    kch_case = cases[0]
    assert "WP/2026/4102" in kch_case["case_reference"]
    assert kch_case["interim_stay_in_force"] == True
    assert kch_case["financial_exposure_cr"] == 4.30

def test_corridor_alignments_geojson(client: TestClient):
    """Verifies corridor alignment GeoJSON geometry for GIS map integration."""
    token = get_auth_token(client, "secretary")
    h = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/programmes/CKICP/alignments", headers=h)
    assert res.status_code == 200
    alignments = res.json()
    assert len(alignments) >= 2
    c1 = next(a for a in alignments if a["corridor_code"] == "CKICP-C1")
    assert "Northern Industrial Corridor" in c1["name"]
    assert c1["coordinates_geojson"] is not None
    assert "LineString" in c1["coordinates_geojson"]
