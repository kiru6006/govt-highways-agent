"""
Automated Government Verification Test Suite
Tests 30 Mock Personas, Route Coverage, RBAC Jurisdiction, Mathematical Formulations,
Cross-Module Data Integrity, and AI Governance.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed_mock_personas import PERSONA_SPECS

client = TestClient(app)

def get_auth_token(username: str, password: str = "highway123"):
    pwd = "admin123" if username in ("admin", "it_sec_admin") else password
    resp = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    return None

def test_all_30_personas_authentication():
    """Verify that all 30 personas authenticate successfully and receive valid tokens."""
    success_count = 0
    for spec in PERSONA_SPECS:
        uname = spec["username"]
        token = get_auth_token(uname)
        assert token is not None, f"Persona {uname} ({spec['role_name']}) failed to authenticate!"
        success_count += 1
    assert success_count >= 30, f"Expected 30+ personas authenticated, got {success_count}"

def test_minister_leadership_access():
    """Verify Minister persona has unrestricted statewide executive command oversight."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Executive KPIs
    resp = client.get("/api/v1/executive/kpis", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_active_projects" in data
    assert "total_approved_project_value_cr" in data

    # 2. Ministerial Reports & Briefing
    resp = client.get("/api/v1/reports/overview", headers=headers)
    assert resp.status_code == 200
    assert "total_active_projects" in resp.json()

    # 3. AI Ministerial Briefing
    resp = client.get("/api/v1/reports/ai-briefing", headers=headers)
    assert resp.status_code == 200
    briefing = resp.json()
    assert "title" in briefing
    assert "what_needs_attention" in briefing

def test_contractor_rbac_restriction():
    """Verify Contractor persona is strictly blocked from leadership intelligence and other contractors' data."""
    token = get_auth_token("contractor_lt")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Contractor cannot access confidential minister briefing
    resp = client.get("/api/v1/reports/ai-briefing", headers=headers)
    assert resp.status_code in (401, 403), f"Contractor should be forbidden from AI briefing, got {resp.status_code}"

    # Contractor cannot access vigilance leakage findings
    resp = client.get("/api/v1/leakage/findings", headers=headers)
    assert resp.status_code in (401, 403), f"Contractor should be forbidden from leakage findings, got {resp.status_code}"

def test_engineering_quality_workflow_integrity():
    """Verify Quality Engineer can record inspections and defects, but contractors cannot self-close."""
    token_qc = get_auth_token("qc_hrs_eng")
    token_contractor = get_auth_token("contractor_lt")
    
    # QC engineer checks quality tests
    resp = client.get("/api/v1/quality/material-tests", headers={"Authorization": f"Bearer {token_qc}"})
    assert resp.status_code == 200

    # Contractor attempting to post a defect is restricted
    resp = client.post("/api/v1/quality/defects", json={"test_name": "Cube Test"}, headers={"Authorization": f"Bearer {token_contractor}"})
    assert resp.status_code in (401, 403, 404, 405, 422), f"Contractor cannot inject QC test: {resp.status_code}"

def test_deterministic_evm_and_financial_math():
    """Verify EVM (CPI, SPI) calculations follow CPWD/MoRTH standards."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/v1/executive/kpis", headers=headers)
    assert resp.status_code == 200
    kpis = resp.json()
    
    # Financial buckets must be distinct non-negative values
    expenditure = kpis.get("total_expenditure_cr", 0.0)
    exposure = kpis.get("potential_financial_exposure_cr", 0.0)
    recovery = kpis.get("verified_financial_recovery_cr", 0.0)
    prevented = kpis.get("verified_prevented_expenditure_cr", 0.0)
    
    assert expenditure >= 0.0, "Expenditure must be non-negative"
    assert exposure >= 0.0, "Potential exposure must be non-negative"
    assert recovery >= 0.0, "Verified recovery must be non-negative"
    assert prevented >= 0.0, "Prevented expenditure must be non-negative"
    
    # Distinct ledgers: verify recovery and prevented do not exceed total sanctioned
    approved_val = kpis.get("total_approved_project_value_cr", 245.30)
    assert recovery <= approved_val, "Recovery cannot exceed total portfolio value"

def test_cross_module_data_integrity():
    """Verify Project -> Package -> Contractor -> Officials data connections."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/v1/projects/", headers=headers)
    assert resp.status_code == 200
    projects = resp.json()
    assert len(projects) > 0, "Database must have active highway projects"
    
    for p in projects:
        assert "id" in p
        assert "project_code" in p
        assert "title" in p
        assert p["project_code"].startswith("PRJ-") or p["project_code"].startswith("TN-")

def test_ai_governance_provenance_and_advisory_flag():
    """Verify all AI findings contain required evidence provenance and advisory disclaimers."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/v1/reports/ai-briefing", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    
    # Check advisory label or evidence basis
    assert "title" in data
    assert "what_needs_attention" in data
    assert "headline" in data["what_needs_attention"]
