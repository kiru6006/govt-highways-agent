"""
Ministerial Reports & AI Decision Intelligence Router (Prompt 02)
Provides executive decision support, programme performance, financial scrutiny,
schedule delay analysis, departmental friction registers, contractor evaluation,
quality/assets, land/utility analytics, AI briefings, and decision tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime
import io
import csv

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, Project, WorkPackage, Contractor, Road, Zone, Circle, Division,
    Issue, DepartmentDependency, AnomalyFinding, QualityDefectRecord,
    MinisterialDecisionRecord, MinisterialDecisionActionHistory, AuditEvent
)
from app.schemas import (
    ReportsOverviewOut, ProgrammePerformanceItem, ProjectPerformanceItem,
    FinancialPerformanceOut, SchedulePerformanceOut, DepartmentPerformanceItem,
    ContractorPerformanceItem, QualityAssetPerformanceOut, LandUtilityPerformanceOut,
    AIMinisterialBriefingOut, DecisionQueueItem, ReportGenerateRequest,
    ReportGenerateOut, MinisterialDecisionOut, MinisterialDecisionUpdate,
    MinisterialDecisionActionHistoryOut
)

router = APIRouter(prefix="/reports", tags=["Ministerial Reports & Decision Intelligence"])

# -------------------------------------------------------------
# RBAC ENFORCEMENT
# -------------------------------------------------------------
def verify_executive_reports_access(current_user: User):
    role_code = current_user.role.code if current_user.role else ""
    if role_code in ["CITIZEN", "CONTRACTOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Ministerial decision intelligence and confidential portfolio reports are restricted to authorized departmental leadership."
        )

# -------------------------------------------------------------
# HELPER: APPLY QUERY FILTERS
# -------------------------------------------------------------
def filter_projects_query(
    query,
    programme: Optional[str] = None,
    district: Optional[str] = None,
    project_id: Optional[int] = None
):
    if project_id and project_id > 0:
        query = query.filter(Project.id == project_id)
    if programme and programme != "ALL":
        if programme == "CKICP":
            query = query.filter((Project.programme_id == 1) | Project.project_code.ilike("%CKICP%") | Project.funding_source.ilike("%ADB%") | Project.funding_source.ilike("%CKICP%"))
        elif programme in ["TNRSP_II", "TNRSP"]:
            query = query.filter((Project.programme_id == 2) | Project.project_code.ilike("%TNRSP%") | Project.funding_source.ilike("%World Bank%") | Project.funding_source.ilike("%TNRSP%"))
        else:
            query = query.filter(Project.funding_source.ilike(f"%{programme}%") | Project.project_code.ilike(f"%{programme}%"))
    return query

# -------------------------------------------------------------
# 1. EXECUTIVE OVERVIEW (10 KPIs)
# -------------------------------------------------------------
@router.get("/overview", response_model=ReportsOverviewOut)
def get_reports_overview(
    programme: str = Query("ALL", description="Filter by programme e.g. CKICP, TNRSP_II, CMRDP"),
    district: str = Query("ALL", description="Filter by district"),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    department: str = Query("ALL", description="Filter by department"),
    frequency: str = Query("Quarterly", description="Daily, Weekly, Monthly, Quarterly, Financial year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    projects_q = db.query(Project)
    projects_q = filter_projects_query(projects_q, programme, district, project_id)
    projects = projects_q.all()

    total_active_projects = len(projects)
    total_project_value_cr = round(sum(p.sanctioned_cost_cr or 0.0 for p in projects), 2)
    total_budget_allocation_cr = round(sum((p.revised_cost_cr or p.sanctioned_cost_cr or 0.0) for p in projects), 2)
    total_expenditure_cr = round(sum(p.expenditure_to_date_cr or 0.0 for p in projects), 2)
    
    physical_progress_avg_pct = round(
        sum(p.physical_progress_pct or 0.0 for p in projects) / total_active_projects if total_active_projects > 0 else 0.0,
        1
    )

    # Delayed projects: expected > planned or variance > 30 days
    delayed_projects = [
        p for p in projects
        if p.status == "IN_PROGRESS" and (p.physical_progress_pct or 0) < 60 and (p.expenditure_to_date_cr or 0) > 0
    ]
    delayed_projects_count = len(delayed_projects)
    delayed_projects_value_cr = round(sum(p.sanctioned_cost_cr or 0.0 for p in delayed_projects), 2)

    # Critical risk projects from anomalies or delays
    anomalies = db.query(AnomalyFinding).all()
    if programme != "ALL":
        proj_ids = {p.id for p in projects}
        anomalies = [a for a in anomalies if a.project_id in proj_ids]

    critical_risk_projects_count = len(set(a.project_id for a in anomalies if a.severity in ["CRITICAL", "HIGH"]))
    potential_financial_exposure_cr = round(sum(a.potential_exposure_cr or 0.0 for a in anomalies), 2)

    # Department dependencies
    deps_q = db.query(DepartmentDependency).filter(DepartmentDependency.status != "RESOLVED")
    if department != "ALL":
        deps_q = deps_q.filter(DepartmentDependency.dependency_type.ilike(f"%{department}%"))
    pending_deps = deps_q.all()
    pending_approvals_count = len(pending_deps) + 8  # Statutory + administrative approvals
    land_acquisition_pending_count = sum(1 for d in pending_deps if "LAND" in (d.dependency_type or "").upper() or "REVENUE" in (d.dependency_type or "").upper()) + 14

    return ReportsOverviewOut(
        total_active_projects=total_active_projects,
        total_project_value_cr=total_project_value_cr,
        total_budget_allocation_cr=total_budget_allocation_cr,
        total_expenditure_cr=total_expenditure_cr,
        physical_progress_avg_pct=physical_progress_avg_pct,
        delayed_projects_count=delayed_projects_count,
        delayed_projects_value_cr=delayed_projects_value_cr,
        critical_risk_projects_count=critical_risk_projects_count,
        pending_approvals_count=pending_approvals_count,
        land_acquisition_pending_count=land_acquisition_pending_count,
        potential_financial_exposure_cr=potential_financial_exposure_cr,
        reporting_period="Q3-Q4 FY 2025-26",
        frequency=frequency,
        last_updated_timestamp=datetime.datetime.utcnow().strftime("%d %b %Y, %H:%M IST"),
        data_mode="mock",
        data_status="Seeded Demo",
        kpi_definitions={
            "total_active_projects": "Count of sanctioned, tendered, or active infrastructure projects in Tamil Nadu Highways portfolio.",
            "total_project_value_cr": "Cumulative administrative sanction (AS) cost across portfolio in ₹ Crores.",
            "total_budget_allocation_cr": "Current revised budgetary allotment committed under state head of account.",
            "total_expenditure_cr": "Cumulative electronic letter-of-credit (LC) disbursements released to date.",
            "physical_progress_avg_pct": "Portfolio-wide arithmetic average of certified field physical progress.",
            "delayed_projects_count": "Projects exhibiting schedule variance greater than 30 days against approved milestones.",
            "critical_risk_projects_count": "Projects flagged with composite vulnerability score >= 65 or open critical anomalies.",
            "pending_approvals_count": "Pending interdepartmental clearances across Revenue, TANGEDCO, Forest, and WRD.",
            "land_acquisition_pending_count": "Total survey parcels with pending DRO section 19 awards or court references.",
            "potential_financial_exposure_cr": "Aggregated value of detected financial anomalies currently under administrative review."
        }
    )

# -------------------------------------------------------------
# 2. PROGRAMME PERFORMANCE INTELLIGENCE
# -------------------------------------------------------------
@router.get("/programmes", response_model=List[ProgrammePerformanceItem])
def get_programme_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    programmes_specs = [
        {
            "code": "CKICP",
            "name": "Chennai-Kanyakumari Industrial Corridor Project (ADB Assisted)",
            "approved_cost_cr": 384.20,
            "budget_allocation_cr": 412.50,
            "expenditure_cr": 194.80,
            "physical_pct": 52.4,
            "financial_pct": 50.7,
            "projects_count": 3,
            "packages_count": 5,
            "delayed": 2,
            "high_risk": 2,
            "status": "BEHIND_SCHEDULE"
        },
        {
            "code": "TNRSP_II",
            "name": "Tamil Nadu Road Sector Project - II (World Bank Assisted)",
            "approved_cost_cr": 268.00,
            "budget_allocation_cr": 285.00,
            "expenditure_cr": 142.30,
            "physical_pct": 54.0,
            "financial_pct": 53.1,
            "projects_count": 2,
            "packages_count": 4,
            "delayed": 1,
            "high_risk": 1,
            "status": "WATCHLIST"
        },
        {
            "code": "CMRDP",
            "name": "Chief Minister Road Development Programme (State Capital Works)",
            "approved_cost_cr": 412.80,
            "budget_allocation_cr": 425.00,
            "expenditure_cr": 182.40,
            "physical_pct": 47.8,
            "financial_pct": 44.2,
            "projects_count": 3,
            "packages_count": 6,
            "delayed": 2,
            "high_risk": 2,
            "status": "BEHIND_SCHEDULE"
        },
        {
            "code": "CRIDP",
            "name": "Comprehensive Road Infrastructure Development Programme",
            "approved_cost_cr": 195.40,
            "budget_allocation_cr": 204.00,
            "expenditure_cr": 128.60,
            "physical_pct": 68.2,
            "financial_pct": 65.8,
            "projects_count": 2,
            "packages_count": 3,
            "delayed": 0,
            "high_risk": 0,
            "status": "ON_TRACK"
        },
        {
            "code": "NABARD",
            "name": "NABARD Rural Road & Bridge Infrastructure Programme (RIDF)",
            "approved_cost_cr": 115.60,
            "budget_allocation_cr": 120.00,
            "expenditure_cr": 72.10,
            "physical_pct": 64.5,
            "financial_pct": 62.4,
            "projects_count": 2,
            "packages_count": 2,
            "delayed": 1,
            "high_risk": 1,
            "status": "MODERATE_RISK"
        }
    ]

    items = []
    for p in programmes_specs:
        variance = round(p["physical_pct"] - p["financial_pct"], 1)
        items.append(
            ProgrammePerformanceItem(
                programme_code=p["code"],
                programme_name=p["name"],
                projects_count=p["projects_count"],
                packages_count=p["packages_count"],
                approved_cost_cr=p["approved_cost_cr"],
                budget_allocation_cr=p["budget_allocation_cr"],
                expenditure_cr=p["expenditure_cr"],
                physical_progress_pct=p["physical_pct"],
                financial_progress_pct=p["financial_pct"],
                delayed_projects_count=p["delayed"],
                high_risk_projects_count=p["high_risk"],
                variance_pct=variance,
                status=p["status"]
            )
        )
    return items

# -------------------------------------------------------------
# 3. PROJECT PERFORMANCE REPORT
# -------------------------------------------------------------
@router.get("/projects", response_model=List[ProjectPerformanceItem])
def get_projects_performance_report(
    programme: str = Query("ALL"),
    district: str = Query("ALL"),
    project_id: Optional[int] = Query(None),
    status_filter: str = Query("ALL"),
    search: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    query = db.query(Project)
    query = filter_projects_query(query, programme, district, project_id)
    if status_filter != "ALL":
        query = query.filter(Project.status == status_filter)
    if search:
        query = query.filter(
            Project.title.ilike(f"%{search}%") | Project.project_code.ilike(f"%{search}%")
        )

    projects = query.all()
    contractors_map = {c.id: c.company_name for c in db.query(Contractor).all()}

    results = []
    for p in projects:
        # Determine schedule variance
        is_delayed = (p.physical_progress_pct or 0) < 55 and p.status == "IN_PROGRESS"
        variance_days = 115 if p.id == 4 else (85 if p.id == 2 else (45 if is_delayed else 0))
        planned_completion = p.target_completion_date.strftime("%Y-%m-%d") if p.target_completion_date else "2026-06-30"
        
        # Calculate expected completion
        if variance_days > 0 and p.target_completion_date:
            expected = p.target_completion_date + datetime.timedelta(days=variance_days)
            expected_str = expected.strftime("%Y-%m-%d")
        else:
            expected_str = planned_completion

        # Overall risk
        if p.id in [4, 1, 2]:
            overall_risk = "CRITICAL"
        elif variance_days > 40:
            overall_risk = "HIGH"
        elif variance_days > 0:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        prog_code = "CKICP" if ("CKICP" in (p.funding_source or "") or "CKICP" in (p.project_code or "") or p.programme_id == 1) else (
            "TNRSP_II" if ("TNRSP" in (p.funding_source or "") or "TNRSP" in (p.project_code or "") or p.programme_id == 2) else (
                "NABARD" if "NABARD" in (p.funding_source or "") else (
                    "CRIDP" if "CRIDP" in (p.funding_source or "") else "CMRDP"
                )
            )
        )

        results.append(
            ProjectPerformanceItem(
                project_id=p.id,
                project_code=p.project_code,
                project_title=p.title,
                programme=prog_code,
                district="Coimbatore" if p.id == 4 else ("Chennai" if p.id == 2 else ("Chengalpattu" if p.id == 1 else "Tamil Nadu")),
                sanctioned_cost_cr=round(p.sanctioned_cost_cr or 0.0, 2),
                expenditure_to_date_cr=round(p.expenditure_to_date_cr or 0.0, 2),
                physical_progress_pct=round(p.physical_progress_pct or 0.0, 1),
                financial_progress_pct=round(p.financial_progress_pct or 0.0, 1),
                planned_completion_date=planned_completion,
                expected_completion_date=expected_str,
                schedule_variance_days=variance_days,
                contractor_id=p.contractor_id,
                contractor_name=contractors_map.get(p.contractor_id, "Empanelled EPC Contractor"),
                overall_risk=overall_risk,
                status=p.status,
                has_critical_blocker=(p.id in [1, 2, 4, 8])
            )
        )

    return results

# -------------------------------------------------------------
# 4. FINANCIAL PERFORMANCE REPORT
# -------------------------------------------------------------
@router.get("/financial", response_model=FinancialPerformanceOut)
def get_financial_performance(
    programme: str = Query("ALL"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    # Core aggregates
    approved_budget = 1376.00
    revised_budget = 1446.50
    actual_expenditure = 720.20
    pending_bills = 84.50
    payments_made = 635.70
    retention_amount = 36.80
    cost_variations = 42.10
    potential_exposure = 54.00

    budget_vs_exp = [
        {"programme": "CKICP", "budget": 412.50, "expenditure": 194.80, "pending_bills": 28.40},
        {"programme": "TNRSP_II", "budget": 285.00, "expenditure": 142.30, "pending_bills": 16.20},
        {"programme": "CMRDP", "budget": 425.00, "expenditure": 182.40, "pending_bills": 24.50},
        {"programme": "CRIDP", "budget": 204.00, "expenditure": 128.60, "pending_bills": 9.10},
        {"programme": "NABARD", "budget": 120.00, "expenditure": 72.10, "pending_bills": 6.30}
    ]

    monthly_trend = [
        {"month": "May 2025", "expenditure": 48.20, "target": 52.00, "bills_cleared": 44.10},
        {"month": "Jun 2025", "expenditure": 54.60, "target": 55.00, "bills_cleared": 51.20},
        {"month": "Jul 2025", "expenditure": 62.10, "target": 65.00, "bills_cleared": 58.40},
        {"month": "Aug 2025", "expenditure": 71.30, "target": 75.00, "bills_cleared": 66.80},
        {"month": "Sep 2025", "expenditure": 68.40, "target": 72.00, "bills_cleared": 64.00},
        {"month": "Oct 2025", "expenditure": 74.80, "target": 80.00, "bills_cleared": 70.50}
    ]

    contractor_dist = [
        {"contractor": "L&T Infrastructure Engineering", "disbursed": 142.50, "pending": 14.80, "retention": 8.20},
        {"contractor": "PST Engineering Construction", "disbursed": 98.40, "pending": 12.10, "retention": 5.80},
        {"contractor": "KCP Infra Projects Ltd", "disbursed": 88.20, "pending": 18.50, "retention": 6.10},
        {"contractor": "URC Construction Pvt Ltd", "disbursed": 76.40, "pending": 9.20, "retention": 4.50},
        {"contractor": "RPP Infra Projects Ltd", "disbursed": 64.10, "pending": 7.80, "retention": 3.90},
        {"contractor": "Others (Class 1 & 2)", "disbursed": 166.10, "pending": 22.10, "retention": 8.30}
    ]

    ageing = [
        {"age_bracket": "< 30 Days", "bills_count": 28, "amount_cr": 44.20, "status": "NORMAL_SCRUTINY"},
        {"age_bracket": "30 - 60 Days", "bills_count": 14, "amount_cr": 22.80, "status": "OBSERVATION"},
        {"age_bracket": "60 - 90 Days", "bills_count": 6, "amount_cr": 11.40, "status": "EXECUTIVE_ESCALATION"},
        {"age_bracket": "> 90 Days", "bills_count": 3, "amount_cr": 6.10, "status": "HELD_OR_DISPUTED"}
    ]

    variations = [
        {"project": "SH-15 Ooty-Gudalur Ghat Corridor", "original_cr": 112.50, "variation_cr": 9.80, "reason": "Non-BOQ hydraulic rock splitting in landslide prone slopes", "approval_status": "PENDING_SFC"},
        {"project": "SH-49 East Coast Road Widening", "original_cr": 142.20, "variation_cr": 14.20, "reason": "Additional pedestrian underpass and utility ducting", "approval_status": "APPROVED_CABINET"},
        {"project": "MDR-102 Tambaram Grade Separator", "original_cr": 85.00, "variation_cr": 6.40, "reason": "Foundation redesign due to metro pier clash", "approval_status": "SANCTIONED_GO"},
        {"project": "SH-115 Cheyyar Bridge Reconstruction", "original_cr": 38.40, "variation_cr": 3.20, "reason": "Deep scouring protection well curbs extension", "approval_status": "UNDER_SCRUTINY"}
    ]

    return FinancialPerformanceOut(
        approved_budget_cr=approved_budget,
        revised_budget_cr=revised_budget,
        actual_expenditure_cr=actual_expenditure,
        pending_bills_cr=pending_bills,
        payments_made_cr=payments_made,
        retention_amount_cr=retention_amount,
        cost_variations_cr=cost_variations,
        potential_exposure_under_review_cr=potential_exposure,
        budget_vs_expenditure_by_programme=budget_vs_exp,
        monthly_expenditure_trend=monthly_trend,
        contractor_payment_distribution=contractor_dist,
        pending_payment_ageing=ageing,
        cost_variation_analysis=variations
    )

# -------------------------------------------------------------
# 5. SCHEDULE & EXECUTION REPORT
# -------------------------------------------------------------
@router.get("/schedule", response_model=SchedulePerformanceOut)
def get_schedule_performance(
    programme: str = Query("ALL"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    delay_table = [
        {
            "project_code": "PRJ-TN-2026-004",
            "project_title": "Four Laning of SH-15 Ooty-Gudalur Ghat Corridor",
            "package_name": "PKG-01 (km 28/0 to km 42/0)",
            "contractor": "KCP Infra Projects Ltd",
            "planned_completion": "2026-03-31",
            "expected_completion": "2026-07-24",
            "delay_days": 115,
            "primary_blocker": "12 Revenue land parcels pending award & 48 unshifted TANGEDCO poles",
            "responsible_department": "Revenue (LA) & TANGEDCO",
            "recommended_action": "Joint Ministerial Directive to DRO (LA) and TANGEDCO SE; establish 30-day clearance taskforce."
        },
        {
            "project_code": "PRJ-TN-2026-002",
            "project_title": "Construction of Tambaram Grade Separator on MDR-102",
            "package_name": "PKG-01 (Flyover and Approach Ramps)",
            "contractor": "PST Engineering Construction",
            "planned_completion": "2026-04-15",
            "expected_completion": "2026-07-09",
            "delay_days": 85,
            "primary_blocker": "Concrete strength defect on Pier P-14 & heavy peak traffic restrictions",
            "responsible_department": "Highways Research Station & Traffic Police",
            "recommended_action": "IIT Madras structural retrofitting certification & nocturnal 6-hour deck launching permission."
        },
        {
            "project_code": "PRJ-TN-2026-008",
            "project_title": "Reconstruction of 6 Major Bridges along SH-115 Cheyyar-Vandavasi",
            "package_name": "PKG-02 (Cheyyar River Major Bridge)",
            "contractor": "K. Rajagopal & Co",
            "planned_completion": "2026-01-31",
            "expected_completion": "2026-04-15",
            "delay_days": 74,
            "primary_blocker": "Delayed WRD water resources design clearance for HFL discharge",
            "responsible_department": "Water Resources Department (WRD)",
            "recommended_action": "Principal Secretary Demi-Official letter to WRD Chief Engineer Plan Formulation."
        },
        {
            "project_code": "PRJ-TN-2026-005",
            "project_title": "TNRSP-II Strengthening of SH-10 Cuddalore-Vridhachalam-Salem",
            "package_name": "PKG-02 (Vridhachalam Bypass Stretch)",
            "contractor": "Sri Balaji Roadworks",
            "planned_completion": "2025-12-31",
            "expected_completion": "2026-03-06",
            "delay_days": 65,
            "primary_blocker": "Contractor sub-contracting friction & slow bitumen procurement",
            "responsible_department": "TNRSP Project Management Unit",
            "recommended_action": "Enforce liquidated damages deduction of ₹65.0 Lakh on upcoming RA bill."
        }
    ]

    return SchedulePerformanceOut(
        projects_on_schedule_count=7,
        delayed_projects_count=5,
        critical_delays_count=2,
        milestones_due_count=18,
        overdue_milestones_count=4,
        contract_extensions_count=3,
        delay_analysis_table=delay_table
    )

# -------------------------------------------------------------
# 6. DEPARTMENTAL PERFORMANCE REPORT
# -------------------------------------------------------------
@router.get("/departments", response_model=List[DepartmentPerformanceItem])
def get_departments_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    depts = [
        {
            "name": "Revenue Department (Land Acquisition)",
            "category": "Statutory Land Clearances",
            "pending_approvals": 14,
            "avg_age": 148,
            "critical_deps": 4,
            "projects_affected": 5,
            "overdue_actions": 6,
            "escalations": 3,
            "lead": "Special DRO (Land Acquisition - Highways)",
            "status": "CRITICAL_BOTTLENECK"
        },
        {
            "name": "TANGEDCO (Electricity Distribution)",
            "category": "Utility Shifting (Poles & Cables)",
            "pending_approvals": 11,
            "avg_age": 112,
            "critical_deps": 3,
            "projects_affected": 4,
            "overdue_actions": 4,
            "escalations": 2,
            "lead": "Superintending Engineer (TANGEDCO GCC)",
            "status": "HIGH_ATTENTION"
        },
        {
            "name": "Water Resources Department (WRD)",
            "category": "Waterways, Canals & River Bridges NOC",
            "pending_approvals": 7,
            "avg_age": 94,
            "critical_deps": 2,
            "projects_affected": 3,
            "overdue_actions": 2,
            "escalations": 1,
            "lead": "Chief Engineer (WRD Plan Formulation)",
            "status": "MODERATE_FRICTION"
        },
        {
            "name": "Forest Department",
            "category": "Forest Clearance & Tree Felling Sanction",
            "pending_approvals": 5,
            "avg_age": 160,
            "critical_deps": 2,
            "projects_affected": 2,
            "overdue_actions": 3,
            "escalations": 2,
            "lead": "District Forest Officer (DFO)",
            "status": "HIGH_ATTENTION"
        },
        {
            "name": "Tamil Nadu Police (Traffic Wing)",
            "category": "Urban Corridor Traffic Diversion Permission",
            "pending_approvals": 4,
            "avg_age": 28,
            "critical_deps": 1,
            "projects_affected": 2,
            "overdue_actions": 0,
            "escalations": 0,
            "lead": "Joint Commissioner of Police (Traffic)",
            "status": "ON_TRACK"
        },
        {
            "name": "Tamil Nadu Pollution Control Board (TNPCB)",
            "category": "Environmental & Hot Mix Plant Clearances",
            "pending_approvals": 3,
            "avg_age": 42,
            "critical_deps": 0,
            "projects_affected": 2,
            "overdue_actions": 0,
            "escalations": 0,
            "lead": "District Environmental Engineer",
            "status": "ON_TRACK"
        }
    ]

    return [
        DepartmentPerformanceItem(
            department_name=d["name"],
            category=d["category"],
            pending_approvals=d["pending_approvals"],
            avg_approval_age_days=d["avg_age"],
            critical_dependencies=d["critical_deps"],
            projects_affected=d["projects_affected"],
            overdue_actions=d["overdue_actions"],
            escalations_count=d["escalations"],
            lead_officer=d["lead"],
            status=d["status"]
        )
        for d in depts
    ]

# -------------------------------------------------------------
# 7. CONTRACTOR PERFORMANCE REPORT
# -------------------------------------------------------------
@router.get("/contractors", response_model=List[ContractorPerformanceItem])
def get_contractors_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    contractors = [
        {
            "id": 1,
            "name": "L&T Infrastructure Engineering Ltd",
            "class": "CLASS_1_SUPER",
            "active_contracts": 3,
            "contract_value": 310.50,
            "progress_avg": 78.4,
            "schedule_adherence": 92.0,
            "qc_observations": 2,
            "pending_payments": 14.80,
            "extensions": 0,
            "open_corrective": 0,
            "schedule_score": 92.0,
            "qc_score": 95.0,
            "pace_score": 90.0,
            "discipline_score": 95.0
        },
        {
            "id": 2,
            "name": "PST Engineering Construction",
            "class": "CLASS_1",
            "active_contracts": 2,
            "contract_value": 145.00,
            "progress_avg": 45.2,
            "schedule_adherence": 68.0,
            "qc_observations": 4,
            "pending_payments": 12.10,
            "extensions": 2,
            "open_corrective": 2,
            "schedule_score": 68.0,
            "qc_score": 70.0,
            "pace_score": 65.0,
            "discipline_score": 60.0
        },
        {
            "id": 4,
            "name": "KCP Infra Projects Ltd",
            "class": "CLASS_1",
            "active_contracts": 2,
            "contract_value": 198.20,
            "progress_avg": 41.5,
            "schedule_adherence": 62.0,
            "qc_observations": 5,
            "pending_payments": 18.50,
            "extensions": 2,
            "open_corrective": 3,
            "schedule_score": 62.0,
            "qc_score": 65.0,
            "pace_score": 60.0,
            "discipline_score": 50.0
        },
        {
            "id": 3,
            "name": "URC Construction Pvt Ltd",
            "class": "CLASS_1",
            "active_contracts": 2,
            "contract_value": 115.60,
            "progress_avg": 68.5,
            "schedule_adherence": 85.0,
            "qc_observations": 2,
            "pending_payments": 9.20,
            "extensions": 1,
            "open_corrective": 1,
            "schedule_score": 85.0,
            "qc_score": 88.0,
            "pace_score": 82.0,
            "discipline_score": 85.0
        },
        {
            "id": 5,
            "name": "Sri Balaji Roadworks",
            "class": "CLASS_2",
            "active_contracts": 1,
            "contract_value": 52.40,
            "progress_avg": 54.0,
            "schedule_adherence": 72.0,
            "qc_observations": 3,
            "pending_payments": 6.50,
            "extensions": 1,
            "open_corrective": 1,
            "schedule_score": 72.0,
            "qc_score": 75.0,
            "pace_score": 70.0,
            "discipline_score": 75.0
        }
    ]

    items = []
    for c in contractors:
        # Score Formula: 0.35*Schedule + 0.35*QC + 0.20*Progress + 0.10*Discipline
        composite_score = round(
            (c["schedule_score"] * 0.35) +
            (c["qc_score"] * 0.35) +
            (c["pace_score"] * 0.20) +
            (c["discipline_score"] * 0.10),
            1
        )
        items.append(
            ContractorPerformanceItem(
                contractor_id=c["id"],
                name=c["name"],
                contractor_class=c["class"],
                active_contracts=c["active_contracts"],
                contract_value_cr=c["contract_value"],
                project_progress_avg=c["progress_avg"],
                schedule_adherence_pct=c["schedule_adherence"],
                quality_observations_count=c["qc_observations"],
                pending_payments_cr=c["pending_payments"],
                contract_extensions_count=c["extensions"],
                open_corrective_actions_count=c["open_corrective"],
                performance_score=composite_score,
                score_breakdown={
                    "formula": "Score = (0.35 * ScheduleAdherence) + (0.35 * QualityCompliance) + (0.20 * ProgressPace) + (0.10 * ContractDiscipline)",
                    "schedule_component": round(c["schedule_score"] * 0.35, 1),
                    "quality_component": round(c["qc_score"] * 0.35, 1),
                    "pace_component": round(c["pace_score"] * 0.20, 1),
                    "discipline_component": round(c["discipline_score"] * 0.10, 1)
                }
            )
        )

    return items

# -------------------------------------------------------------
# 8. QUALITY & ASSET PERFORMANCE REPORT
# -------------------------------------------------------------
@router.get("/quality-assets", response_model=QualityAssetPerformanceOut)
def get_quality_assets_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    contractor_qc = [
        {"contractor": "KCP Infra Projects Ltd", "tests_conducted": 42, "passed": 36, "failed": 6, "open_ncrs": 3},
        {"contractor": "PST Engineering Construction", "tests_conducted": 38, "passed": 34, "failed": 4, "open_ncrs": 2},
        {"contractor": "L&T Infrastructure Engineering", "tests_conducted": 64, "passed": 63, "failed": 1, "open_ncrs": 0},
        {"contractor": "URC Construction Pvt Ltd", "tests_conducted": 28, "passed": 26, "failed": 2, "open_ncrs": 1}
    ]

    return QualityAssetPerformanceOut(
        inspections_conducted=172,
        open_defects=13,
        critical_observations=3,
        ncrs_count=6,
        corrective_actions_pending=5,
        overdue_quality_closures=2,
        contractor_quality_breakdown=contractor_qc,
        total_assets=482,
        road_assets_km=1284.6,
        bridges_count=94,
        culverts_count=388,
        assets_requiring_inspection=34,
        maintenance_pending=18,
        critical_asset_conditions=4
    )

# -------------------------------------------------------------
# 9. LAND & UTILITY REPORT
# -------------------------------------------------------------
@router.get("/land-utility", response_model=LandUtilityPerformanceOut)
def get_land_utility_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    dept_deps = [
        {"department": "Revenue (DRO Land Acquisition)", "parcels_pending": 38, "projects": 5, "avg_days": 148, "status": "CRITICAL"},
        {"department": "TANGEDCO (Electricity Poles)", "utilities_pending": 126, "projects": 4, "avg_days": 112, "status": "HIGH"},
        {"department": "Water Resources / TWAD (Mains)", "utilities_pending": 18, "projects": 3, "avg_days": 94, "status": "MODERATE"},
        {"department": "Forest Department (Stage 1 Clearance)", "parcels_pending": 8, "projects": 2, "avg_days": 160, "status": "HIGH"}
    ]

    utility_types = [
        {"utility_type": "TANGEDCO LT/HT Electric Poles", "count": 126, "estimated_shifting_cost_cr": 4.80, "action": "Deposit paid; work stalled"},
        {"utility_type": "TWAD Board Bulk Water Pipelines", "count": 18, "estimated_shifting_cost_cr": 3.20, "action": "Joint alignment survey complete"},
        {"utility_type": "Telecom Optical Fibre Cables", "count": 44, "estimated_shifting_cost_cr": 1.10, "action": "Notice served to operators"},
        {"utility_type": "Gas Pipeline Crossings", "count": 4, "estimated_shifting_cost_cr": 1.40, "action": "NOC under scrutiny with IOCL"}
    ]

    return LandUtilityPerformanceOut(
        total_land_parcels=142,
        parcels_under_acquisition=46,
        awards_pending=18,
        compensation_pending=14,
        possession_pending=14,
        utility_shifting_pending=192,
        projects_affected=6,
        avg_pending_duration_days=128,
        department_dependencies=dept_deps,
        utility_type_breakdown=utility_types
    )

# -------------------------------------------------------------
# 10. AI MINISTERIAL INTELLIGENCE BRIEFING
# -------------------------------------------------------------
@router.get("/ai-briefing", response_model=AIMinisterialBriefingOut)
def get_ai_ministerial_briefing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    # Fetch decision queue items from database
    decisions = db.query(MinisterialDecisionRecord).order_by(MinisterialDecisionRecord.id.asc()).all()
    queue_items = [
        DecisionQueueItem(
            id=d.id,
            decision_reference=d.decision_reference,
            project_id=d.project_id,
            project_title=d.project_title,
            programme=d.programme,
            district=d.district or "Statewide",
            issue_title=d.issue_title,
            evidence_summary=d.evidence_summary or "",
            impact_assessment=d.impact_assessment or "",
            financial_exposure_cr=d.financial_exposure_cr or 0.0,
            recommended_action=d.recommended_action,
            decision_authority=d.decision_authority,
            current_status=d.current_status,
            assigned_department=d.assigned_department,
            assigned_officer=d.assigned_officer,
            due_date=d.due_date,
            recorded_decision=d.recorded_decision,
            remarks=d.remarks,
            is_simulated=d.is_simulated,
            created_at=d.created_at.strftime("%Y-%m-%d") if d.created_at else "2026-11-06"
        )
        for d in decisions
    ]

    return AIMinisterialBriefingOut(
        title="AI Ministerial Intelligence Briefing",
        subtitle="Cross-domain algorithmic synthesis of highway programme progress, statutory friction, and financial exposure.",
        generated_at=datetime.datetime.utcnow().strftime("%d %b %Y, %H:%M IST"),
        scenario_id="SCENARIO-MINISTER-DEMO-01",
        what_needs_attention={
            "headline": "Three demonstration projects require immediate executive intervention.",
            "summary": "AI cross-correlation of field milestones, ledger disbursements, and statutory correspondence has detected acute friction on SH-15 Ooty-Gudalur (CKICP), SH-49 ECR Widening (CMRDP), and Tambaram Grade Separator (CMRDP).",
            "primary_blockers": [
                "Unshifted utilities: 48 TANGEDCO poles on SH-15 Ooty Ghat corridor have stalled hill slope cutting for 142 days despite 100% deposit payment.",
                "Statutory land acquisition: 12 revenue parcels on SH-15 bypass pending section 19 final declaration with Special DRO Coimbatore.",
                "Contractor milestone slippage: Milestone #3 delayed by 115 days with idle machinery escalation notice issued by KCP Infra Projects Ltd.",
                "Financial variance claim: ₹9.80 Cr non-BOQ hydraulic rock splitting variation claim submitted without prior Standing Finance Committee concurrence."
            ]
        },
        why_does_it_matter={
            "financial_impact": "Cumulative potential financial exposure under active scrutiny stands at ₹54.00 Cr across 16 findings. If unresolved, contractual delay claims will compound by ₹12.5 Lakh per idle week.",
            "schedule_impact": "SH-15 Ghat corridor expected completion has slipped from March 2026 to July 2026 (115 days delay), threatening pre-monsoon connectivity for Nilgiris agriculture.",
            "departmental_impact": "Lack of structured monthly coordination meetings between Highways Chief Engineers and Revenue DROs is causing sequential rather than parallel statutory clearances.",
            "public_safety_impact": "Open concrete quality defect on Pier P-14 at Tambaram Grade Separator (achieved 31.8 MPa vs M-45) poses structural risk on Chennai's highest-density suburban junction."
        },
        what_should_be_done={
            "immediate_directives": [
                "Issue joint government directive convening a Special Interdepartmental Clearing Committee with Revenue Secretary and TANGEDCO CMD.",
                "Impose 21-day timebound deadline on TANGEDCO Coimbatore Circle to complete 48-pole relocation on SH-15.",
                "Order immediate freeze on duplicate voucher #TXN-2025-004 (₹21.00 Cr) and audit MB Book 412.",
                "Halt pier cap girder erection on Pier P-14 at Tambaram pending independent ultrasonic non-destructive testing by IIT Madras.",
                "Direct Superintending Engineers to enforce PWD Schedule of Rates on non-BOQ rock splitting claims rather than contractor-quoted rates."
            ]
        },
        who_should_act={
            "actions": [
                {"officer": "Thiru K. Phanindra Reddy, IAS", "role": "Principal Secretary (Highways)", "dept": "Highways & Minor Ports", "target_date": "2026-11-18", "directive": "Convene joint coordination with Revenue & Energy Secretaries."},
                {"officer": "Er. K. Senthil Nathan, M.E.", "role": "Chief Engineer (CKICP)", "dept": "CKICP Project Unit", "target_date": "2026-11-20", "directive": "Resolve 48 TANGEDCO poles relocation at site with SE Coimbatore."},
                {"officer": "Thiru K. Sundaramoorthy, IA&AS", "role": "Financial Advisor & CAO", "dept": "Accounts & Audit", "target_date": "2026-11-17", "directive": "Freeze duplicate voucher #TXN-2025-004 in Treasury ECS portal."},
                {"officer": "Dr. V. Gomathi, Ph.D.", "role": "Director, HRS Guindy", "dept": "Highways Research Station", "target_date": "2026-11-19", "directive": "Submit independent IIT Madras NDT test report for Pier P-14."}
            ]
        },
        what_decision_is_required=queue_items,
        data_mode="mock",
        disclaimer="AI Executive Briefing is generated algorithmically for demonstration purposes. Recommendations are strictly advisory and require human officer authentication."
    )

# -------------------------------------------------------------
# 11. REPORT GENERATION WORKFLOW
# -------------------------------------------------------------
@router.post("/generate", response_model=ReportGenerateOut)
def generate_ministerial_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    report_id = f"REP-TN-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    timestamp = datetime.datetime.utcnow().strftime("%d %B %Y, %H:%M IST")

    # Filter projects based on request
    q = db.query(Project)
    q = filter_projects_query(q, req.programme, req.district, req.project_id)
    projects = q.all()

    total_val = sum(p.sanctioned_cost_cr or 0 for p in projects)
    total_exp = sum(p.expenditure_to_date_cr or 0 for p in projects)
    avg_prog = sum(p.physical_progress_pct or 0 for p in projects) / len(projects) if projects else 0.0

    sections = []

    if req.include_financial:
        sections.append({
            "section_key": "financial_analysis",
            "title": "1. Financial Allocation & Expenditure Scrutiny",
            "summary": f"Portfolio expenditure stands at ₹{total_exp:.2f} Cr against sanctioned outlay of ₹{total_val:.2f} Cr (Financial Pace: {(total_exp/total_val*100 if total_val else 0):.1f}%).",
            "highlights": [
                f"Current verified disbursements: ₹{total_exp:.2f} Cr.",
                "Unamortized mobilization advances under active recovery: ₹14.80 Cr.",
                "Non-BOQ variation claims pending Standing Finance Committee review: ₹42.10 Cr."
            ]
        })

    if req.include_delays:
        delayed_count = sum(1 for p in projects if (p.physical_progress_pct or 0) < 55 and p.status == "IN_PROGRESS")
        sections.append({
            "section_key": "schedule_delays",
            "title": "2. Project Milestone Adherence & Critical Delay Registry",
            "summary": f"{delayed_count} projects exhibit schedule variance exceeding 30 days. Critical delay on SH-15 (115 days) driven by TANGEDCO utility pole relocation and DRO section 19 awards.",
            "highlights": [
                "SH-15 Ooty-Gudalur Ghat Corridor: 115 days delay; expected completion 24 July 2026.",
                "Tambaram Grade Separator on MDR-102: 85 days delay; pier defect rectification underway.",
                "SH-115 Cheyyar River Bridge: 74 days delay; awaiting WRD hydraulic model approval."
            ]
        })

    if req.include_contractor:
        sections.append({
            "section_key": "contractor_performance",
            "title": "3. Contractor Performance & Score Matrix",
            "summary": "Contractor capability and compliance evaluated using deterministic weighted index: Schedule (35%), Quality (35%), Pace (20%), and Discipline (10%).",
            "highlights": [
                "L&T Infrastructure Engineering: Score 92.4 (High Adherence; 0 Open NCRs).",
                "URC Construction Pvt Ltd: Score 83.2 (Moderate; 1 Open NCR).",
                "PST Engineering Construction: Score 66.8 (Watchlist; Pier defect & advance lag).",
                "KCP Infra Projects Ltd: Score 60.4 (Under Scrutiny; Milestone delay & rock rate claim)."
            ]
        })

    if req.include_land_utility:
        sections.append({
            "section_key": "land_utility",
            "title": "4. Interdepartmental Land Acquisition & Utility Shifting Friction",
            "summary": "142 total demonstration survey parcels tracked. 46 parcels under acquisition with average pending age of 148 days across Special DRO units.",
            "highlights": [
                "Revenue Department: 38 parcels pending award in Coimbatore, Chengalpattu, and Cuddalore.",
                "TANGEDCO: 126 unshifted LT/HT electric poles across 4 major road corridors.",
                "WRD: 18 bulk water pipeline crossings pending joint alignment clearance."
            ]
        })

    if req.include_quality:
        sections.append({
            "section_key": "quality_assets",
            "title": "5. Quality Assurance & Highways Research Station Audit",
            "summary": "172 field inspections logged. 13 open quality observations and 6 non-conformance reports (NCRs) active on state registry.",
            "highlights": [
                "Pier P-14 on MDR-102 failed 28-day concrete cube strength test (31.8 MPa vs M-45).",
                "1,810 MT of bitumen billed on SH-49 lacks matching electronic refinery gate passes.",
                "Core test compaction on Salem bypass verified within IRC SP:84 specifications."
            ]
        })

    if req.include_ai_findings:
        sections.append({
            "section_key": "ai_findings",
            "title": "6. AI Algorithmic Anomaly & Exposure Findings",
            "summary": "Automated surveillance rules flagged ₹54.00 Cr in potential financial and contractual exposure across 16 findings.",
            "highlights": [
                "Duplicate bill identifier trigger R-DUP-01: Voucher #ECR-RA-03 submitted twice (₹21.00 Cr).",
                "Unsanctioned variation order trigger R-VAR-03: ₹9.80 Cr rock excavation rate on SH-15.",
                "Mobilization advance recovery deficit trigger R-ADV-02: ₹2.20 Cr lag on Tambaram."
            ]
        })

    # Recommended decisions
    decisions = db.query(MinisterialDecisionRecord).limit(3).all()
    dec_list = [
        {
            "ref": d.decision_reference,
            "project": d.project_title,
            "issue": d.issue_title,
            "recommended": d.recommended_action,
            "authority": d.decision_authority,
            "status": d.current_status
        }
        for d in decisions
    ]

    return ReportGenerateOut(
        report_id=report_id,
        title=f"TN-HDOS Ministerial Executive Intelligence Report: {req.report_type}",
        generated_at=timestamp,
        reporting_period=req.reporting_period,
        filters_applied={
            "programme": req.programme,
            "district": req.district,
            "project_id": req.project_id or "All Projects",
            "department": req.department,
            "frequency": req.reporting_period
        },
        executive_summary=(
            f"This ministerial briefing covers {len(projects)} highway infrastructure projects with a cumulative outlay "
            f"of ₹{total_val:.2f} Cr. Portfolio physical progress averages {avg_prog:.1f}% with expenditure of ₹{total_exp:.2f} Cr. "
            f"Immediate executive intervention is advised on SH-15 Ooty-Gudalur Ghat Corridor and SH-49 ECR Widening to resolve "
            f"critical interdepartmental land/utility bottlenecks and verify detected billing discrepancies."
        ),
        kpis_summary={
            "projects_covered": len(projects),
            "total_sanctioned_cr": round(total_val, 2),
            "total_expenditure_cr": round(total_exp, 2),
            "avg_physical_progress_pct": round(avg_prog, 1),
            "critical_risk_projects": 3,
            "potential_exposure_cr": 54.00
        },
        sections=sections,
        recommended_decisions=dec_list,
        data_mode="mock"
    )

# -------------------------------------------------------------
# 12. MINISTERIAL DECISION TRACKING (CRUD & ACTIONS)
# -------------------------------------------------------------
@router.get("/decisions", response_model=List[MinisterialDecisionOut])
def list_ministerial_decisions(
    status_filter: Optional[str] = Query(None),
    authority_filter: Optional[str] = Query(None),
    programme: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    q = db.query(MinisterialDecisionRecord)
    if status_filter and status_filter != "ALL":
        q = q.filter(MinisterialDecisionRecord.current_status == status_filter)
    if authority_filter and authority_filter != "ALL":
        q = q.filter(MinisterialDecisionRecord.decision_authority == authority_filter)
    if programme and programme != "ALL":
        q = q.filter(MinisterialDecisionRecord.programme == programme)

    records = q.order_by(MinisterialDecisionRecord.id.asc()).all()

    results = []
    for r in records:
        acts = [
            MinisterialDecisionActionHistoryOut(
                id=a.id,
                decision_id=a.decision_id,
                action_type=a.action_type,
                actor_name=a.actor_name,
                actor_role=a.actor_role,
                old_status=a.old_status,
                new_status=a.new_status,
                remarks=a.remarks,
                assigned_to=a.assigned_to,
                due_date=a.due_date,
                created_at=a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else ""
            )
            for a in r.actions
        ]
        results.append(
            MinisterialDecisionOut(
                id=r.id,
                decision_reference=r.decision_reference,
                project_id=r.project_id,
                project_title=r.project_title,
                programme=r.programme,
                district=r.district or "Statewide",
                issue_title=r.issue_title,
                evidence_summary=r.evidence_summary,
                impact_assessment=r.impact_assessment,
                financial_exposure_cr=r.financial_exposure_cr or 0.0,
                recommended_action=r.recommended_action,
                decision_authority=r.decision_authority,
                current_status=r.current_status,
                assigned_department=r.assigned_department,
                assigned_officer=r.assigned_officer,
                due_date=r.due_date,
                recorded_decision=r.recorded_decision,
                remarks=r.remarks,
                is_simulated=r.is_simulated,
                created_at=r.created_at.strftime("%Y-%m-%d") if r.created_at else "",
                updated_at=r.updated_at.strftime("%Y-%m-%d") if r.updated_at else "",
                actions=acts
            )
        )

    return results

@router.get("/decisions/{decision_id}", response_model=MinisterialDecisionOut)
def get_ministerial_decision_detail(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    r = db.query(MinisterialDecisionRecord).filter(MinisterialDecisionRecord.id == decision_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Ministerial decision record not found.")

    acts = [
        MinisterialDecisionActionHistoryOut(
            id=a.id,
            decision_id=a.decision_id,
            action_type=a.action_type,
            actor_name=a.actor_name,
            actor_role=a.actor_role,
            old_status=a.old_status,
            new_status=a.new_status,
            remarks=a.remarks,
            assigned_to=a.assigned_to,
            due_date=a.due_date,
            created_at=a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else ""
        )
        for a in r.actions
    ]

    return MinisterialDecisionOut(
        id=r.id,
        decision_reference=r.decision_reference,
        project_id=r.project_id,
        project_title=r.project_title,
        programme=r.programme,
        district=r.district or "Statewide",
        issue_title=r.issue_title,
        evidence_summary=r.evidence_summary,
        impact_assessment=r.impact_assessment,
        financial_exposure_cr=r.financial_exposure_cr or 0.0,
        recommended_action=r.recommended_action,
        decision_authority=r.decision_authority,
        current_status=r.current_status,
        assigned_department=r.assigned_department,
        assigned_officer=r.assigned_officer,
        due_date=r.due_date,
        recorded_decision=r.recorded_decision,
        remarks=r.remarks,
        is_simulated=r.is_simulated,
        created_at=r.created_at.strftime("%Y-%m-%d") if r.created_at else "",
        updated_at=r.updated_at.strftime("%Y-%m-%d") if r.updated_at else "",
        actions=acts
    )

@router.post("/decisions/{decision_id}/action", response_model=MinisterialDecisionOut)
def record_ministerial_decision_action(
    decision_id: int,
    payload: MinisterialDecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    r = db.query(MinisterialDecisionRecord).filter(MinisterialDecisionRecord.id == decision_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Ministerial decision record not found.")

    old_status = r.current_status
    r.current_status = payload.current_status
    if payload.recorded_decision:
        r.recorded_decision = payload.recorded_decision
    if payload.remarks:
        r.remarks = payload.remarks
    if payload.assigned_officer:
        r.assigned_officer = payload.assigned_officer
    if payload.assigned_department:
        r.assigned_department = payload.assigned_department
    if payload.due_date:
        r.due_date = payload.due_date
    r.updated_at = datetime.datetime.utcnow()

    # Log action history
    act = MinisterialDecisionActionHistory(
        decision_id=r.id,
        action_type="MINISTERIAL_ACTION_RECORDED",
        actor_name=current_user.full_name or current_user.username,
        actor_role=current_user.role.name if current_user.role else "EXECUTIVE_OFFICIAL",
        old_status=old_status,
        new_status=payload.current_status,
        remarks=payload.remarks or payload.recorded_decision or "Administrative action recorded by authorized leadership.",
        assigned_to=payload.assigned_officer or r.assigned_officer,
        due_date=payload.due_date or r.due_date
    )
    db.add(act)

    # Log to system audit trail
    audit_evt = AuditEvent(
        actor_name=current_user.full_name or current_user.username,
        actor_role=current_user.role.code if current_user.role else "EXECUTIVE",
        action="UPDATE",
        entity_type="MINISTERIAL_DECISION",
        entity_id=r.id,
        entity_reference=r.decision_reference,
        changes_json=f"Decision {r.decision_reference} status transitioned from '{old_status}' to '{payload.current_status}'. Remarks: {payload.remarks or 'N/A'}",
        ip_address="127.0.0.1"
    )
    db.add(audit_evt)

    db.commit()
    db.refresh(r)

    acts = [
        MinisterialDecisionActionHistoryOut(
            id=a.id,
            decision_id=a.decision_id,
            action_type=a.action_type,
            actor_name=a.actor_name,
            actor_role=a.actor_role,
            old_status=a.old_status,
            new_status=a.new_status,
            remarks=a.remarks,
            assigned_to=a.assigned_to,
            due_date=a.due_date,
            created_at=a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else ""
        )
        for a in r.actions
    ]

    return MinisterialDecisionOut(
        id=r.id,
        decision_reference=r.decision_reference,
        project_id=r.project_id,
        project_title=r.project_title,
        programme=r.programme,
        district=r.district or "Statewide",
        issue_title=r.issue_title,
        evidence_summary=r.evidence_summary,
        impact_assessment=r.impact_assessment,
        financial_exposure_cr=r.financial_exposure_cr or 0.0,
        recommended_action=r.recommended_action,
        decision_authority=r.decision_authority,
        current_status=r.current_status,
        assigned_department=r.assigned_department,
        assigned_officer=r.assigned_officer,
        due_date=r.due_date,
        recorded_decision=r.recorded_decision,
        remarks=r.remarks,
        is_simulated=r.is_simulated,
        created_at=r.created_at.strftime("%Y-%m-%d") if r.created_at else "",
        updated_at=r.updated_at.strftime("%Y-%m-%d") if r.updated_at else "",
        actions=acts
    )

# -------------------------------------------------------------
# 13. CSV EXPORT FOR TABULAR REPORTS
# -------------------------------------------------------------
@router.get("/export/csv", response_class=PlainTextResponse)
def export_reports_csv(
    report_type: str = Query("projects"),
    programme: str = Query("ALL"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_executive_reports_access(current_user)

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "projects":
        writer.writerow([
            "Project ID", "Project Code", "Title", "Programme", "Sanctioned Cost (Cr)",
            "Expenditure (Cr)", "Physical Progress %", "Financial Progress %",
            "Target Completion", "Variance Days", "Status", "Data Mode"
        ])
        projects = db.query(Project).all()
        for p in projects:
            writer.writerow([
                p.id, p.project_code, p.title, p.funding_source or "CMRDP",
                p.sanctioned_cost_cr, p.expenditure_to_date_cr,
                p.physical_progress_pct, p.financial_progress_pct,
                p.target_completion_date.strftime("%Y-%m-%d") if p.target_completion_date else "",
                115 if p.id == 4 else (85 if p.id == 2 else 0),
                p.status, "mock"
            ])
    elif report_type == "decisions":
        writer.writerow([
            "Decision Ref", "Project Title", "Programme", "Issue", "Exposure (Cr)",
            "Authority", "Status", "Assigned Officer", "Due Date", "Data Mode"
        ])
        decisions = db.query(MinisterialDecisionRecord).all()
        for d in decisions:
            writer.writerow([
                d.decision_reference, d.project_title, d.programme, d.issue_title,
                d.financial_exposure_cr, d.decision_authority, d.current_status,
                d.assigned_officer, d.due_date, "mock"
            ])
    else:
        writer.writerow(["Metric", "Value", "Notes"])
        writer.writerow(["Total Projects", 12, "Synthetic Demonstration Data"])
        writer.writerow(["Total Value (Cr)", 1376.00, "Sanctioned Cost"])
        writer.writerow(["Total Expenditure (Cr)", 720.20, "Actual Released"])
        writer.writerow(["Delayed Projects", 5, "Schedule Variance > 30 Days"])
        writer.writerow(["Potential Exposure (Cr)", 54.00, "Under Review"])

    return output.getvalue()
