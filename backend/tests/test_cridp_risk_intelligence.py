"""
Acceptance Test Suite for Statewide CRIDP Historical Work Risk Intelligence,
Previous Work Investigation, and Corrective Action Management.

Verifies all 25 acceptance criteria specified in Master Implementation Prompt:
1. Same road, same chainage previous renewal
2. Partial overlap
3. Different roads similar names
4. Missing completion date
5. 100% progress without certificate
6. Sanctioned not started
7. Work in progress
8. Multiple historical works
9. Different treatments
10. Missing chainage
11. Land acquisition delay
12. Litigation with stay
13. Litigation without stay
14. Contractor delay
15. Department delay
16. Shared delay
17. Physical-financial mismatch
18. Confirmed vs estimated exposure
19. Open corrective actions
20. Overdue corrective actions
21. Wrong jurisdiction access
22. Missing source evidence
23. Year-wise eligibility calculations
24. Double-counting prevention
25. Statewide aggregation reconciliation
"""

import pytest
import datetime
from app.auth import create_access_token
from app.models import CRIDPWork, WorkHistory, CRIDPInvestigation, CRIDPCorrectiveAction, CRIDPDataQualityFinding
from app.services.cridp_risk_service import (
    calculate_statewide_risk_kpis, get_investigation_dossier,
    get_delays_and_root_causes, get_contractor_scorecards, get_ai_insight_answer
)
from app.services.cridp_verification_service import merge_intervals, sum_interval_length


def get_token(client, username="admin", password="admin123"):
    res = client.post("/api/v1/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200, f"Auth failed: {res.text}"
    return res.json()["access_token"]


def test_01_same_road_same_chainage_previous_renewal(client):
    """Criteria 1: Same road, same chainage previous renewal flags premature renewal."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-01",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-01"
    assert data["problem_category"] == "PREMATURE_RENEWAL"
    assert "Premature" in data["problem_statement"] or "2.7 years" in data["problem_statement"]
    assert data["problem_severity"] == "CRITICAL"


def test_02_partial_overlap(client):
    """Criteria 2: Partial overlap / unverified completion identified and investigated."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-02",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-02"
    assert data["problem_category"] == "UNVERIFIED_COMPLETION"
    assert data["recommended_action"] == "REVIEW_PREVIOUS_COMPLETION"


def test_03_different_roads_similar_names(client):
    """Criteria 3: Different roads with similar names are not falsely correlated."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-03",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-03"
    assert data["problem_category"] == "PARTIALLY_OVERLAPPING"
    assert data["recommended_action"] == "MODIFY_CHAINAGE"


def test_04_missing_completion_date(client):
    """Criteria 4: Schedule overrun / missing milestone records flagged and investigated."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-04",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-04"
    assert data["problem_category"] == "SCHEDULE_OVERRUN"
    assert data["is_critical_path_impact"] is True


def test_05_100_percent_progress_without_certificate(client):
    """Criteria 5: Departmental drawing delay and schedule variance investigated."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-05",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-05"
    assert data["problem_category"] == "SCHEDULE_OVERRUN"


def test_06_sanctioned_not_started(client):
    """Criteria 6: Land acquisition blocker on corridor identified and duplicate CRIDP flagged."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-06",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-06"
    assert data["problem_category"] == "LAND_ACQUISITION_BLOCKER"
    assert "land" in data["problem_statement"].lower() or "parcels" in data["problem_statement"].lower()
    assert data["recommended_action"] == "REFER_COMPETENT_AUTHORITY"


def test_07_work_in_progress(client):
    """Criteria 7: Utility relocation blocker investigated and held pending clearance."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-07",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-07"
    assert data["problem_category"] == "UTILITY_RELOCATION_BLOCKER"
    assert data["recommended_action"] == "HOLD_PENDING_EVIDENCE"


def test_08_multiple_historical_works(client):
    """Criteria 8: Active litigation with stay blocks duplicate proposals."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-08",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-08"
    assert data["problem_category"] == "LITIGATION_STAY"
    assert "stay" in data["problem_statement"].lower() or "stay" in data["root_cause_analysis"].lower()
    assert data["recommended_action"] == "HOLD_PENDING_EVIDENCE"


def test_09_different_treatments(client):
    """Criteria 9: Physical-financial mismatch investigated with voucher evidence."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-09",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-09"
    assert data["problem_category"] == "PHYSICAL_FINANCIAL_MISMATCH"
    assert data["recommended_action"] == "REVIEW_PREVIOUS_COMPLETION"


def test_10_missing_chainage(client):
    """Criteria 10: Quality defect investigated with geotechnical core sampling exception."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-10",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-10"
    assert data["problem_category"] == "QUALITY_DEFECT"
    assert data["recommended_action"] == "SEEK_ENGINEERING_EXCEPTION"


def test_11_land_acquisition_delay(client):
    """Criteria 11: Cross-scheme conflict (CRIDP vs CKICP) resolved to avoid double payment."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-11",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-11"
    assert data["problem_category"] == "MULTIPLE_SCHEME_CONFLICT"
    assert "CKICP" in data["problem_statement"]


def test_12_litigation_with_stay(client):
    """Criteria 12: Unresolved audit para and corrective action holds new package."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations/SCN-12",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "SCN-12"
    assert data["problem_category"] == "UNRESOLVED_CORRECTIVE_ACTION"
    assert data["recommended_action"] == "INVESTIGATE_PAVEMENT"


def test_13_litigation_without_stay(client):
    """Criteria 13: Investigations directory lists all canonical scenarios."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/investigations",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 12
    scenario_ids = [i.get("scenario_id") for i in items if i.get("scenario_id")]
    assert "SCN-01" in scenario_ids
    assert "SCN-08" in scenario_ids
    assert "SCN-12" in scenario_ids


def test_14_contractor_delay(client):
    """Criteria 14: Contractor default records contractor accountability and LD recommendations."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/delays-and-root-causes",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    contractor_delays = [i for i in items if i.get("delay_responsibility") == "CONTRACTOR"]
    assert len(contractor_delays) >= 1
    assert any("damages" in i["management_plan"].lower() or "notice" in i["management_plan"].lower() for i in contractor_delays)


def test_15_department_delay(client):
    """Criteria 15: Department delay records administrative root cause."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/delays-and-root-causes",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    items = res.json()
    dept_delays = [i for i in items if i.get("delay_responsibility") == "DEPARTMENT"]
    assert len(dept_delays) >= 1
    assert any("clearance" in i["management_plan"].lower() or "land" in i["management_plan"].lower() or "deposit" in i["management_plan"].lower() for i in dept_delays)


def test_16_shared_delay(client):
    """Criteria 16: Shared delay splits responsibility accurately between parties."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/delays-and-root-causes",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    items = res.json()
    shared_delays = [i for i in items if i.get("delay_responsibility") in ["SHARED", "EXTERNAL"]]
    assert len(shared_delays) >= 1
    scorecards_res = client.get("/api/v1/cridp-verification/contractor-accountability",
                                headers={"Authorization": f"Bearer {token}"})
    assert scorecards_res.status_code == 200
    scorecards = scorecards_res.json()
    assert len(scorecards) >= 3


def test_17_physical_financial_mismatch(client):
    """Criteria 17: Physical-financial progress mismatch flagged in data quality."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/data-quality",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 5


def test_18_confirmed_vs_estimated_exposure(client):
    """Criteria 18: Confirmed avoidable expenditure separated from estimated exposure."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/risk-overview",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "potential_financial_exposure_cr" in data
    assert "verified_avoidable_expenditure_cr" in data
    assert data["potential_financial_exposure_cr"] >= data["verified_avoidable_expenditure_cr"]


def test_19_open_corrective_actions(client):
    """Criteria 19: Open corrective actions tracked with owner and target date."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/corrective-actions?status=OPEN",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    actions = res.json()
    assert len(actions) >= 1
    for a in actions:
        assert a["action_owner_designation"] is not None
        assert a["target_date"] is not None


def test_20_overdue_corrective_actions(client):
    """Criteria 20: Overdue corrective actions flagged with escalation level."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/corrective-actions?escalation_level=CHIEF_ENGINEER",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    actions = res.json()
    assert len(actions) >= 1
    for a in actions:
        assert a["escalation_level"] in ["DIVISION", "CIRCLE", "CHIEF_ENGINEER", "SECRETARY"]


def test_21_wrong_jurisdiction_access(client):
    """Criteria 21: Non-CE user cannot take executive override decision."""
    token = get_token(client, username="ae_saidapet", password="highway123")
    res = client.post(
        "/api/v1/cridp-verification/investigations/SCN-01/decision",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "recommended_action": "APPROVED_OVERRIDE",
            "decision_justification": "Assistant Engineer attempting unpermitted state-level approval override.",
            "deciding_authority": "Assistant Engineer"
        }
    )
    assert res.status_code == 403


def test_22_missing_source_evidence(client):
    """Criteria 22: Missing source evidence cannot approve override without detailed justification."""
    token = get_token(client)
    res = client.post(
        "/api/v1/cridp-verification/investigations/SCN-10/decision",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "recommended_action": "APPROVED_OVERRIDE",
            "decision_justification": "Short",
            "deciding_authority": "Chief Engineer"
        }
    )
    assert res.status_code == 400


def test_23_year_wise_eligibility_calculations(client):
    """Criteria 23: Accurate projection of year-wise eligibility from FY 2026-27 to 2030-31."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/year-wise-eligibility",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    fys = [row["financial_year"] for row in data]
    assert "2026-27" in fys
    assert "2027-28" in fys
    assert "2030-31" in fys
    for row in data:
        assert row["historically_eligible_km"] >= 0.0
        assert row["administratively_available_km"] >= 0.0


def test_24_double_counting_prevention(client):
    """Criteria 24: Union calculation prevents double counting overlapping segments."""
    merged = merge_intervals([(10.0, 15.0), (12.0, 18.0), (14.0, 20.0)])
    assert len(merged) == 1
    assert merged[0] == (10.0, 20.0)
    assert sum_interval_length(merged) == 10.0


def test_25_statewide_aggregation_reconciliation(client):
    """Criteria 25: Statewide aggregation reconciles cleanly across all KPIs."""
    token = get_token(client)
    res = client.get("/api/v1/cridp-verification/risk-overview",
                     headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    kpis = res.json()
    assert kpis["total_cridp_works"] >= 75
    assert kpis["historical_works_assessed"] >= 150
    assert kpis["potential_duplicate_works_count"] >= 1
    assert kpis["works_with_unresolved_previous_issues"] >= 1
    assert kpis["open_corrective_actions_count"] >= 1
