"""
Unified Works Analytics Service.
Provides canonical query, filter registry, KPI aggregation, chart distribution,
and multi-sheet Excel / RFC 4180 CSV export.
"""

import io
import datetime
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from app.models import UnifiedWorkRecord, Division, Circle, Road, Project


def get_works_filter_registry(db: Session) -> Dict[str, Any]:
    """Extracts metadata-driven hierarchy and unique values from unified work records."""
    records = db.query(UnifiedWorkRecord).all()

    wings = sorted(list({r.wing for r in records if r.wing}))
    circles = sorted(list({r.circle for r in records if r.circle}))
    
    circles_by_wing: Dict[str, List[str]] = {}
    for r in records:
        w = r.wing or "Construction & Maintenance"
        c = r.circle
        if c:
            if w not in circles_by_wing:
                circles_by_wing[w] = set()
            circles_by_wing[w].add(c)
    circles_by_wing = {w: sorted(list(c_set)) for w, c_set in circles_by_wing.items()}

    divisions_by_circle: Dict[str, List[str]] = {}
    for r in records:
        c = r.circle
        d = r.division
        if c and d:
            if c not in divisions_by_circle:
                divisions_by_circle[c] = set()
            divisions_by_circle[c].add(d)
    divisions_by_circle = {c: sorted(list(d_set)) for c, d_set in divisions_by_circle.items()}

    subdivisions_by_division: Dict[str, List[str]] = {}
    districts_by_division: Dict[str, List[str]] = {}
    for r in records:
        d = r.division
        sd = r.subdivision
        dist = r.district
        if d:
            if d not in subdivisions_by_division:
                subdivisions_by_division[d] = set()
            if sd:
                subdivisions_by_division[d].add(sd)
            if d not in districts_by_division:
                districts_by_division[d] = set()
            if dist:
                districts_by_division[d].add(dist)
    subdivisions_by_division = {d: sorted(list(s_set)) for d, s_set in subdivisions_by_division.items()}
    districts_by_division = {d: sorted(list(dist_set)) for d, dist_set in districts_by_division.items()}

    constituencies = sorted(list({r.constituency for r in records if r.constituency}))
    schemes = sorted(list({r.scheme for r in records if r.scheme}))
    work_types = sorted(list({r.work_type for r in records if r.work_type}))
    work_sub_types = sorted(list({r.work_sub_type for r in records if r.work_sub_type}))
    work_stages = sorted(list({r.work_stage for r in records if r.work_stage}))
    road_classes = sorted(list({r.road_classification for r in records if r.road_classification}))
    financial_years = sorted(list({r.financial_year for r in records if r.financial_year}), reverse=True)
    delay_categories = ["No Delay", "< 30 Days", "30-90 Days", "91-180 Days", "> 180 Days"]
    agreement_delay_categories = ["No Delay", "1–2 Months", "3–6 Months", "More Than 6 Months"]
    risk_severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    return {
        "wings": wings,
        "circles": circles,
        "divisions": sorted(list({r.division for r in records if r.division})),
        "circles_by_wing": circles_by_wing,
        "divisions_by_circle": divisions_by_circle,
        "subdivisions_by_division": subdivisions_by_division,
        "districts_by_division": districts_by_division,
        "constituencies": constituencies,
        "schemes": schemes,
        "work_types": work_types,
        "work_sub_types": work_sub_types,
        "work_stages": work_stages,
        "road_classifications": road_classes,
        "financial_years": financial_years,
        "delay_categories": delay_categories,
        "agreement_delay_categories": agreement_delay_categories,
        "risk_severities": risk_severities
    }


def build_works_query(db: Session, payload: Any, user_role: str = "ADMIN", user_jurisdiction: Optional[str] = None):
    """Builds base query applying all filters, RBAC jurisdiction restrictions, and non-overlapping bands."""
    query = db.query(UnifiedWorkRecord)

    # 1. RBAC Jurisdiction Enforcement
    if user_role in ["DIVISIONAL_OFFICER", "DIVISIONAL_ENGINEER"] and user_jurisdiction:
        query = query.filter(UnifiedWorkRecord.division.ilike(f"%{user_jurisdiction}%"))
    elif user_role in ["CIRCLE_OFFICER", "SUPERINTENDING_ENGINEER"] and user_jurisdiction:
        query = query.filter(UnifiedWorkRecord.circle.ilike(f"%{user_jurisdiction}%"))

    # 2. Administrative Hierarchy Filters
    if getattr(payload, "wings", None):
        wings = [w for w in payload.wings if w != "ALL"]
        if wings:
            query = query.filter(UnifiedWorkRecord.wing.in_(wings))

    if getattr(payload, "circles", None):
        circles = [c for c in payload.circles if c != "ALL"]
        if circles:
            query = query.filter(UnifiedWorkRecord.circle.in_(circles))

    if getattr(payload, "divisions", None):
        divisions = [d for d in payload.divisions if d != "ALL"]
        if divisions:
            query = query.filter(UnifiedWorkRecord.division.in_(divisions))

    if getattr(payload, "subdivisions", None):
        subdivisions = [s for s in payload.subdivisions if s != "ALL"]
        if subdivisions:
            query = query.filter(UnifiedWorkRecord.subdivision.in_(subdivisions))

    if getattr(payload, "districts", None):
        districts = [d for d in payload.districts if d != "ALL"]
        if districts:
            query = query.filter(UnifiedWorkRecord.district.in_(districts))

    if getattr(payload, "constituencies", None):
        constituencies = [c for c in payload.constituencies if c != "ALL"]
        if constituencies:
            query = query.filter(UnifiedWorkRecord.constituency.in_(constituencies))

    # 3. Scheme & Work Classification Filters
    if getattr(payload, "schemes", None):
        schemes = [s for s in payload.schemes if s != "ALL"]
        if schemes:
            query = query.filter(UnifiedWorkRecord.scheme.in_(schemes))

    if getattr(payload, "work_types", None):
        work_types = [wt for wt in payload.work_types if wt != "ALL"]
        if work_types:
            query = query.filter(UnifiedWorkRecord.work_type.in_(work_types))

    if getattr(payload, "work_sub_types", None):
        sub_types = [st for st in payload.work_sub_types if st != "ALL"]
        if sub_types:
            query = query.filter(UnifiedWorkRecord.work_sub_type.in_(sub_types))

    if getattr(payload, "work_stages", None):
        stages = [s for s in payload.work_stages if s != "ALL"]
        if stages:
            query = query.filter(UnifiedWorkRecord.work_stage.in_(stages))

    if getattr(payload, "road_classifications", None):
        rcs = [r for r in payload.road_classifications if r != "ALL"]
        if rcs:
            query = query.filter(UnifiedWorkRecord.road_classification.in_(rcs))

    if getattr(payload, "financial_years", None):
        fys = [f for f in payload.financial_years if f != "ALL"]
        if fys:
            query = query.filter(UnifiedWorkRecord.financial_year.in_(fys))

    # 4. G.O. and Dates
    if getattr(payload, "go_number", None) and payload.go_number.strip():
        query = query.filter(UnifiedWorkRecord.c_go_number.ilike(f"%{payload.go_number.strip()}%"))

    if getattr(payload, "go_date_from", None):
        query = query.filter(UnifiedWorkRecord.d_go_date >= payload.go_date_from)
    if getattr(payload, "go_date_to", None):
        query = query.filter(UnifiedWorkRecord.d_go_date <= payload.go_date_to)

    # 5. Financial Filters
    if getattr(payload, "min_as_amount_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.as_amount_cr >= payload.min_as_amount_cr)
    if getattr(payload, "max_as_amount_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.as_amount_cr <= payload.max_as_amount_cr)

    if getattr(payload, "min_expenditure_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.expenditure_cr >= payload.min_expenditure_cr)
    if getattr(payload, "max_expenditure_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.expenditure_cr <= payload.max_expenditure_cr)

    if getattr(payload, "min_contract_value_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.contract_value_cr >= payload.min_contract_value_cr)
    if getattr(payload, "max_contract_value_cr", None) is not None:
        query = query.filter(UnifiedWorkRecord.contract_value_cr <= payload.max_contract_value_cr)

    # 6. Physical Progress Bands (Strict Non-Overlapping Boundaries)
    if getattr(payload, "progress_bands", None):
        bands = [b for b in payload.progress_bands if b != "ALL"]
        if bands:
            band_clauses = []
            for b in bands:
                if b in ["0-10%", "0–10%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct >= 0.0, UnifiedWorkRecord.physical_progress_pct <= 10.0))
                elif b in ["10-25%", "10–25%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct > 10.0, UnifiedWorkRecord.physical_progress_pct <= 25.0))
                elif b in ["26-50%", "26–50%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct > 25.0, UnifiedWorkRecord.physical_progress_pct <= 50.0))
                elif b in ["51-75%", "51–75%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct > 50.0, UnifiedWorkRecord.physical_progress_pct <= 75.0))
                elif b in ["76-90%", "76–90%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct > 75.0, UnifiedWorkRecord.physical_progress_pct <= 90.0))
                elif b in ["91-100%", "91–100%"]:
                    band_clauses.append(and_(UnifiedWorkRecord.physical_progress_pct > 90.0, UnifiedWorkRecord.physical_progress_pct <= 100.0))
            if band_clauses:
                query = query.filter(or_(*band_clauses))

    # 7. Progress & Delay Filters
    if getattr(payload, "delay_statuses", None):
        delay_statuses = [ds for ds in payload.delay_statuses if ds != "ALL"]
        if delay_statuses:
            query = query.filter(UnifiedWorkRecord.delay_status.in_(delay_statuses))

    if getattr(payload, "forecast_delay_categories", None):
        fdcs = [f for f in payload.forecast_delay_categories if f != "ALL"]
        if fdcs:
            query = query.filter(UnifiedWorkRecord.forecast_delay_category.in_(fdcs))

    if getattr(payload, "agreement_delay_categories", None):
        adcs = [a for a in payload.agreement_delay_categories if a != "ALL"]
        if adcs:
            query = query.filter(UnifiedWorkRecord.agreement_delay_category.in_(adcs))

    # 8. Risk Severity
    if getattr(payload, "risk_severities", None):
        severities = [s for s in payload.risk_severities if s != "ALL"]
        if severities:
            query = query.filter(UnifiedWorkRecord.risk_severity.in_(severities))

    # 9. Dependencies (LA, Forest, Utility, Railway, WRD, Court)
    if getattr(payload, "dependency_issues", None):
        dep_clauses = []
        for dep in payload.dependency_issues:
            if dep == "land_acquisition":
                dep_clauses.append(UnifiedWorkRecord.issue_land_acquisition.is_(True))
            elif dep == "forest":
                dep_clauses.append(UnifiedWorkRecord.issue_forest_clearance.is_(True))
            elif dep == "utility":
                dep_clauses.append(UnifiedWorkRecord.issue_utility_shifting.is_(True))
            elif dep == "railway":
                dep_clauses.append(UnifiedWorkRecord.issue_railway_approvals.is_(True))
            elif dep == "wrd":
                dep_clauses.append(UnifiedWorkRecord.issue_wrd_approvals.is_(True))
            elif dep == "court":
                dep_clauses.append(UnifiedWorkRecord.issue_court_approvals.is_(True))
        if dep_clauses:
            query = query.filter(or_(*dep_clauses))

    # 10. 5-Year Renewal Eligibility
    if getattr(payload, "five_year_eligibilities", None):
        fye = [f for f in payload.five_year_eligibilities if f != "ALL"]
        if fye:
            query = query.filter(UnifiedWorkRecord.five_year_renewal_eligibility.in_(fye))

    # 11. Contractors
    if getattr(payload, "contractors", None):
        contractors = [c for c in payload.contractors if c != "ALL"]
        if contractors:
            query = query.filter(UnifiedWorkRecord.contractor_name.in_(contractors))

    # 12. Search Query (Global or Column-Specific)
    sq = getattr(payload, "search_query", None)
    sc = getattr(payload, "search_column", None)
    if sq and sq.strip():
        term = f"%{sq.strip()}%"
        if sc == "ROAD":
            query = query.filter(or_(UnifiedWorkRecord.road_name.ilike(term), UnifiedWorkRecord.road_number.ilike(term)))
        elif sc == "WORK_CODE":
            query = query.filter(UnifiedWorkRecord.work_code.ilike(term))
        elif sc == "DISTRICT":
            query = query.filter(UnifiedWorkRecord.district.ilike(term))
        elif sc == "DIVISION":
            query = query.filter(UnifiedWorkRecord.division.ilike(term))
        elif sc == "CONTRACTOR":
            query = query.filter(UnifiedWorkRecord.contractor_name.ilike(term))
        elif sc == "G.O.":
            query = query.filter(UnifiedWorkRecord.c_go_number.ilike(term))
        elif sc == "SCHEME":
            query = query.filter(UnifiedWorkRecord.scheme.ilike(term))
        else: # Global
            query = query.filter(or_(
                UnifiedWorkRecord.work_code.ilike(term),
                UnifiedWorkRecord.work_name.ilike(term),
                UnifiedWorkRecord.road_number.ilike(term),
                UnifiedWorkRecord.road_name.ilike(term),
                UnifiedWorkRecord.district.ilike(term),
                UnifiedWorkRecord.division.ilike(term),
                UnifiedWorkRecord.contractor_name.ilike(term),
                UnifiedWorkRecord.c_go_number.ilike(term),
                UnifiedWorkRecord.root_cause.ilike(term)
            ))

    return query


def calculate_works_kpis(items: List[UnifiedWorkRecord], active_filters_count: int = 0) -> Dict[str, Any]:
    """Calculates all 10 unified KPI cards strictly from the filtered dataset."""
    total_works = len(items)
    completed_works = len([w for w in items if w.work_stage == "Completed"])
    work_in_progress = len([w for w in items if w.work_stage == "Work in Progress"])
    deleted_cancelled_works = len([w for w in items if w.work_stage in ["Cancelled or Deleted", "On Hold"]])
    works_with_potential_delay = len([w for w in items if w.delay_status in ["Potential Delay", "Delayed", "Critically delayed"]])
    works_beyond_agreement_date = len([w for w in items if w.agreement_delay_category != "No Delay"])
    pre_construction_works = len([w for w in items if w.work_stage in ["Land Acquisition Stage", "DPR Stage", "Tender Stage", "To Be Started", "Estimate Stage"]])
    critical_financial_risk_count = len([w for w in items if w.risk_severity == "CRITICAL" or w.financial_exposure_cr > 2.0])
    works_requiring_action = len([w for w in items if w.corrective_action_status in ["ACTION_PENDING", "IN_PROGRESS", "ESCALATED"]])
    unverified_work_records = len([w for w in items if w.verification_status != "Officially Verified"])

    total_length = round(sum(w.project_length_km for w in items), 2)
    completed_length = round(sum(w.length_completed_km for w in items), 2)
    total_as = round(sum(w.as_amount_cr for w in items), 2)
    total_contract = round(sum(w.contract_value_cr for w in items), 2)
    total_exp = round(sum(w.expenditure_cr for w in items), 2)
    total_avoidable = round(sum(w.avoidable_expenditure_cr for w in items), 2)

    scope_desc = f"{total_works} Works Matching Scope"
    if active_filters_count > 0:
        scope_desc += f" ({active_filters_count} Active Filters)"

    return {
        "total_works": total_works,
        "completed_works": completed_works,
        "work_in_progress": work_in_progress,
        "deleted_cancelled_works": deleted_cancelled_works,
        "works_with_potential_delay": works_with_potential_delay,
        "works_beyond_agreement_date": works_beyond_agreement_date,
        "pre_construction_works": pre_construction_works,
        "critical_financial_risk_count": critical_financial_risk_count,
        "works_requiring_action": works_requiring_action,
        "unverified_work_records": unverified_work_records,
        "total_length_km": total_length,
        "completed_length_km": completed_length,
        "total_as_amount_cr": total_as,
        "total_contract_value_cr": total_contract,
        "total_expenditure_cr": total_exp,
        "total_avoidable_exposure_cr": total_avoidable,
        "scope_description": scope_desc,
        "active_filters_count": active_filters_count
    }


def calculate_works_charts(items: List[UnifiedWorkRecord], kpis: Dict[str, Any]) -> Dict[str, Any]:
    """Generates analytical distributions for all 10 Charts (A through J)."""
    # Chart A: Work Progress Stages (Strict Non-Overlapping Bands)
    band_defs = [
        ("0–10%", 0.0, 10.0, True),
        ("10–25%", 10.0, 25.0, False),
        ("26–50%", 25.0, 50.0, False),
        ("51–75%", 50.0, 75.0, False),
        ("76–90%", 75.0, 90.0, False),
        ("91–100%", 90.0, 100.0, False)
    ]
    progress_stages = []
    for label, min_p, max_p, inclusive_low in band_defs:
        if inclusive_low:
            count = len([w for w in items if min_p <= w.physical_progress_pct <= max_p])
        else:
            count = len([w for w in items if min_p < w.physical_progress_pct <= max_p])
        progress_stages.append({
            "stage": label,
            "count": count,
            "pct_of_total": round((count / len(items) * 100), 1) if items else 0.0
        })

    # Chart B: Potential Delay
    p_delay_cats = ["No Delay", "< 30 Days", "30-90 Days", "91-180 Days", "> 180 Days"]
    potential_delay_distribution = []
    for cat in p_delay_cats:
        count = len([w for w in items if w.forecast_delay_category == cat])
        potential_delay_distribution.append({
            "delay_category": cat,
            "count": count
        })

    # Chart C: Agreement-Date Delay
    a_delay_cats = ["No Delay", "1–2 Months", "3–6 Months", "More Than 6 Months"]
    agreement_delay_distribution = []
    for cat in a_delay_cats:
        count = len([w for w in items if w.agreement_delay_category == cat])
        agreement_delay_distribution.append({
            "delay_category": cat,
            "count": count
        })

    # Chart D: Pre-Construction Stages
    pre_stages = ["Land Acquisition Stage", "DPR Stage", "Tender Stage", "To Be Started", "Estimate Stage"]
    pre_construction_stages = []
    for stg in pre_stages:
        count = len([w for w in items if w.work_stage == stg])
        pre_construction_stages.append({
            "stage": stg.replace(" Stage", ""),
            "count": count
        })

    # Chart E: Financial Performance
    total_as = round(sum(w.as_amount_cr for w in items), 2)
    total_ts = round(sum(w.ts_amount_cr for w in items), 2)
    total_contract = round(sum(w.contract_value_cr for w in items), 2)
    total_exp = round(sum(w.expenditure_cr for w in items), 2)
    fin_pct = round((total_exp / total_contract * 100), 1) if total_contract > 0 else 0.0
    financial_performance = {
        "as_amount_cr": total_as,
        "ts_amount_cr": total_ts,
        "contract_value_cr": total_contract,
        "expenditure_cr": total_exp,
        "overall_financial_progress_pct": fin_pct
    }

    # Chart F: Circle and Division Performance
    circles = sorted(list({w.circle for w in items}))
    circle_division_performance = []
    for c in circles:
        c_items = [w for w in items if w.circle == c]
        completed = len([w for w in c_items if w.work_stage == "Completed"])
        delayed = len([w for w in c_items if w.delay_status in ["Delayed", "Critically delayed"]])
        crit_risks = len([w for w in c_items if w.risk_severity == "CRITICAL"])
        circle_division_performance.append({
            "circle": c,
            "total_works": len(c_items),
            "completed_works": completed,
            "delayed_works": delayed,
            "critical_risks": crit_risks,
            "sanction_amount_cr": round(sum(w.as_amount_cr for w in c_items), 2),
            "expenditure_cr": round(sum(w.expenditure_cr for w in c_items), 2)
        })

    # Chart G: Scheme-wise Performance
    schemes = sorted(list({w.scheme for w in items}))
    scheme_performance = []
    for sch in schemes:
        s_items = [w for w in items if w.scheme == sch]
        completed = len([w for w in s_items if w.work_stage == "Completed"])
        scheme_performance.append({
            "scheme": sch,
            "total_works": len(s_items),
            "total_length_km": round(sum(w.project_length_km for w in s_items), 2),
            "completion_rate_pct": round((completed / len(s_items) * 100), 1) if s_items else 0.0,
            "critical_risks": len([w for w in s_items if w.risk_severity == "CRITICAL"])
        })

    # Chart H: Critical Risk Distribution
    risk_distribution = [
        {"risk_type": "Land Acquisition", "count": len([w for w in items if w.issue_land_acquisition])},
        {"risk_type": "Litigation / Stay", "count": len([w for w in items if w.issue_court_approvals])},
        {"risk_type": "Railway GAD Approval", "count": len([w for w in items if w.issue_railway_approvals])},
        {"risk_type": "Utility Shifting", "count": len([w for w in items if w.issue_utility_shifting])},
        {"risk_type": "Forest Clearance", "count": len([w for w in items if w.issue_forest_clearance])},
        {"risk_type": "Contractor Default", "count": len([w for w in items if w.delay_status == "Critically delayed" and w.contractor_name])},
        {"risk_type": "Design / DPR Delay", "count": len([w for w in items if w.work_stage == "DPR Stage" and w.overall_delay_days > 0])},
        {"risk_type": "Financial Exposure", "count": len([w for w in items if w.financial_exposure_cr > 1.0])}
    ]

    # Chart I: Year-wise Work Trends
    years = sorted(list({w.sanction_year for w in items}))
    year_trends = []
    for yr in years:
        y_items = [w for w in items if w.sanction_year == yr]
        year_trends.append({
            "year": yr,
            "works_sanctioned": len(y_items),
            "works_started": len([w for w in y_items if w.work_stage in ["Work in Progress", "Completed"]]),
            "works_completed": len([w for w in y_items if w.work_stage == "Completed"]),
            "length_completed_km": round(sum(w.length_completed_km for w in y_items), 2),
            "expenditure_cr": round(sum(w.expenditure_cr for w in y_items), 2),
            "delayed_works": len([w for w in y_items if w.delay_status in ["Delayed", "Critically delayed"]])
        })

    # Chart J: CRIDP Five-Year Renewal Verification
    cridp_five_year_verification = {
        "eligible_length_km": round(sum(w.project_length_km for w in items if w.five_year_renewal_eligibility == "ELIGIBLE"), 2),
        "recently_renewed_length_km": round(sum(w.project_length_km for w in items if w.five_year_renewal_eligibility == "LOCKED_UNDER_5YR"), 2),
        "overlapping_length_km": round(sum(w.previous_work_overlap_km for w in items), 2),
        "unknown_history_length_km": round(sum(w.project_length_km for w in items if w.five_year_renewal_eligibility == "UNKNOWN_HISTORY"), 2),
        "works_requiring_review_count": len([w for w in items if w.five_year_renewal_eligibility == "REVIEW_REQUIRED"])
    }

    return {
        "progress_stages": progress_stages,
        "potential_delay_distribution": potential_delay_distribution,
        "agreement_delay_distribution": agreement_delay_distribution,
        "pre_construction_stages": pre_construction_stages,
        "financial_performance": financial_performance,
        "circle_division_performance": circle_division_performance,
        "scheme_performance": scheme_performance,
        "risk_distribution": risk_distribution,
        "year_trends": year_trends,
        "cridp_five_year_verification": cridp_five_year_verification,
        "kpis": kpis
    }


def query_works_data(db: Session, payload: Any, user_role: str = "ADMIN", user_jurisdiction: Optional[str] = None) -> Dict[str, Any]:
    """Queries paginated works, calculates synchronized KPIs and active chips."""
    query = build_works_query(db, payload, user_role, user_jurisdiction)

    # Sorting
    sort_by = getattr(payload, "sort_by", "id") or "id"
    sort_order = getattr(payload, "sort_order", "asc") or "asc"
    column_attr = getattr(UnifiedWorkRecord, sort_by, UnifiedWorkRecord.id)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(column_attr))
    else:
        query = query.order_by(asc(column_attr))

    total_matching = query.count()
    all_matching = query.all()

    page = max(1, getattr(payload, "page", 1) or 1)
    page_size = max(1, getattr(payload, "page_size", 50) or 50)
    total_pages = max(1, (total_matching + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    paginated_items = all_matching[offset:offset + page_size]

    # Active filter chips extraction
    chips = []
    if getattr(payload, "wings", None):
        for w in payload.wings:
            if w != "ALL": chips.append({"key": "wing", "label": "Wing", "value": w})
    if getattr(payload, "circles", None):
        for c in payload.circles:
            if c != "ALL": chips.append({"key": "circle", "label": "Circle", "value": c})
    if getattr(payload, "divisions", None):
        for d in payload.divisions:
            if d != "ALL": chips.append({"key": "division", "label": "Division", "value": d})
    if getattr(payload, "districts", None):
        for dist in payload.districts:
            if dist != "ALL": chips.append({"key": "district", "label": "District", "value": dist})
    if getattr(payload, "schemes", None):
        for s in payload.schemes:
            if s != "ALL": chips.append({"key": "scheme", "label": "Scheme", "value": s})
    if getattr(payload, "work_stages", None):
        for stg in payload.work_stages:
            if stg != "ALL": chips.append({"key": "stage", "label": "Stage", "value": stg})
    if getattr(payload, "progress_bands", None):
        for pb in payload.progress_bands:
            if pb != "ALL": chips.append({"key": "progress", "label": "Progress", "value": pb})
    if getattr(payload, "risk_severities", None):
        for rk in payload.risk_severities:
            if rk != "ALL": chips.append({"key": "risk", "label": "Risk", "value": rk})
    if getattr(payload, "search_query", None) and payload.search_query.strip():
        chips.append({"key": "search", "label": "Search", "value": payload.search_query.strip()})

    kpis = calculate_works_kpis(all_matching, len(chips))

    return {
        "items": paginated_items,
        "total_matching": total_matching,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "kpis": kpis,
        "active_filter_chips": chips
    }


def export_works_excel_or_csv(db: Session, payload: Any, export_format: str = "excel", user_role: str = "ADMIN", user_jurisdiction: Optional[str] = None) -> Tuple[bytes, str, str]:
    """Exports currently filtered dataset as a multi-sheet Excel (.xlsx) or CSV file with formula-injection guard."""
    query = build_works_query(db, payload, user_role, user_jurisdiction)
    items = query.all()
    kpis = calculate_works_kpis(items)

    def sanitize(val: Any) -> Any:
        """Formula injection prevention for Excel exports."""
        if val is None:
            return ""
        s = str(val)
        if s and s[0] in ("=", "+", "-", "@"):
            return "'" + s
        return val

    if export_format.lower() == "csv":
        import csv
        buf = io.StringIO()
        writer = csv.writer(buf, quoting=csv.QUOTE_ALL)
        headers = [
            "Work Code", "Work Name", "Wing", "Circle", "Division", "Subdivision", "District",
            "Constituency", "Scheme", "Road Number", "Road Name", "Road Class", "Work Type",
            "Work Sub Type", "Work Stage", "Project Length (Km)", "Start Chainage (Km)",
            "End Chainage (Km)", "Length Completed (Km)", "G.O. Number", "G.O. Date", "FY",
            "AS Amount (Cr)", "TS Amount (Cr)", "Contract Value (Cr)", "Expenditure (Cr)",
            "Physical Progress (%)", "Financial Progress (%)", "Delay Status", "Forecast Delay Category",
            "Agreement Delay Category", "Overall Delay (Days)", "Contractor Name", "Contract Reference",
            "Responsible Engineer", "Risk Severity", "Root Cause", "Financial Exposure (Cr)",
            "Avoidable Loss (Cr)", "Five-Year Eligibility", "Verification Status"
        ]
        writer.writerow(headers)
        for w in items:
            writer.writerow([
                sanitize(w.work_code), sanitize(w.work_name), sanitize(w.wing), sanitize(w.circle),
                sanitize(w.division), sanitize(w.subdivision), sanitize(w.district), sanitize(w.constituency),
                sanitize(w.scheme), sanitize(w.road_number), sanitize(w.road_name), sanitize(w.road_classification),
                sanitize(w.work_type), sanitize(w.work_sub_type), sanitize(w.work_stage),
                w.project_length_km, w.start_chainage_km, w.end_chainage_km, w.length_completed_km,
                sanitize(w.c_go_number), str(w.d_go_date.date()) if w.d_go_date else "", sanitize(w.financial_year),
                w.as_amount_cr, w.ts_amount_cr, w.contract_value_cr, w.expenditure_cr,
                w.physical_progress_pct, w.financial_progress_pct, sanitize(w.delay_status),
                sanitize(w.forecast_delay_category), sanitize(w.agreement_delay_category), w.overall_delay_days,
                sanitize(w.contractor_name), sanitize(w.contract_reference), sanitize(w.responsible_engineer),
                sanitize(w.risk_severity), sanitize(w.root_cause), w.financial_exposure_cr,
                w.avoidable_expenditure_cr, sanitize(w.five_year_renewal_eligibility), sanitize(w.verification_status)
            ])
        content = buf.getvalue().encode("utf-8")
        filename = f"works_status_analytics_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return content, "text/csv", filename

    # Multi-Sheet Excel Export (.xlsx)
    wb = openpyxl.Workbook()
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="006A4E", end_color="006A4E", fill_type="solid")
    kpi_fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    risk_fill = PatternFill(start_color="9B111E", end_color="9B111E", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='DDDDDD'),
        right=Side(style='thin', color='DDDDDD'),
        top=Side(style='thin', color='DDDDDD'),
        bottom=Side(style='thin', color='DDDDDD')
    )

    # Sheet 1: Filtered Works
    ws1 = wb.active
    ws1.title = "Filtered Works"
    headers = [
        "Work Code", "Work Name", "Wing", "Circle", "Division", "Subdivision", "District",
        "Constituency", "Scheme", "Road Number", "Road Name", "Road Class", "Work Type",
        "Work Sub Type", "Work Stage", "Project Length (Km)", "Start Chainage (Km)",
        "End Chainage (Km)", "Length Completed (Km)", "G.O. Number", "G.O. Date", "FY",
        "AS Amount (Cr)", "TS Amount (Cr)", "Contract Value (Cr)", "Expenditure (Cr)",
        "Physical Progress (%)", "Financial Progress (%)", "Delay Status", "Forecast Delay",
        "Agreement Delay", "Overall Delay (Days)", "Contractor Name", "Contract Reference",
        "Responsible Engineer", "Risk Severity", "Root Cause", "Financial Exposure (Cr)",
        "Avoidable Loss (Cr)", "Five-Year Eligibility", "Verification Status"
    ]
    ws1.append(headers)
    for col_num in range(1, len(headers) + 1):
        cell = ws1.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for row_idx, w in enumerate(items, start=2):
        row_vals = [
            sanitize(w.work_code), sanitize(w.work_name), sanitize(w.wing), sanitize(w.circle),
            sanitize(w.division), sanitize(w.subdivision), sanitize(w.district), sanitize(w.constituency),
            sanitize(w.scheme), sanitize(w.road_number), sanitize(w.road_name), sanitize(w.road_classification),
            sanitize(w.work_type), sanitize(w.work_sub_type), sanitize(w.work_stage),
            w.project_length_km, w.start_chainage_km, w.end_chainage_km, w.length_completed_km,
            sanitize(w.c_go_number), w.d_go_date.strftime("%Y-%m-%d") if w.d_go_date else "", sanitize(w.financial_year),
            w.as_amount_cr, w.ts_amount_cr, w.contract_value_cr, w.expenditure_cr,
            w.physical_progress_pct, w.financial_progress_pct, sanitize(w.delay_status),
            sanitize(w.forecast_delay_category), sanitize(w.agreement_delay_category), w.overall_delay_days,
            sanitize(w.contractor_name), sanitize(w.contract_reference), sanitize(w.responsible_engineer),
            sanitize(w.risk_severity), sanitize(w.root_cause), w.financial_exposure_cr,
            w.avoidable_expenditure_cr, sanitize(w.five_year_renewal_eligibility), sanitize(w.verification_status)
        ]
        ws1.append(row_vals)
        for c in range(1, len(row_vals) + 1):
            ws1.cell(row=row_idx, column=c).border = thin_border

    # Sheet 2: KPI Summary
    ws2 = wb.create_sheet(title="KPI Summary")
    ws2.append(["Metric Name", "Value", "Unit", "Remarks"])
    for col_num in range(1, 5):
        cell = ws2.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = kpi_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    kpi_rows = [
        ("Total Works Count", kpis["total_works"], "Works", "Synchronized matching count"),
        ("Completed Works", kpis["completed_works"], "Works", "100% physically completed works"),
        ("Work in Progress", kpis["work_in_progress"], "Works", "Active site execution"),
        ("Deleted / Cancelled Works", kpis["deleted_cancelled_works"], "Works", "Administrative de-sanction / hold"),
        ("Works with Potential Delay", kpis["works_with_potential_delay"], "Works", "Forecast delay > 0 days"),
        ("Works Beyond Agreement Date", kpis["works_beyond_agreement_date"], "Works", "Overdue agreement milestone"),
        ("Pre-Construction Works", kpis["pre_construction_works"], "Works", "DPR, LA, Tender, Estimate stage"),
        ("Critical Financial Risk Count", kpis["critical_financial_risk_count"], "Works", "Exposure > ₹2.00 Cr or CRITICAL"),
        ("Works Requiring Action", kpis["works_requiring_action"], "Works", "Open corrective action plan"),
        ("Unverified Work Records", kpis["unverified_work_records"], "Works", "Source lineage pending verification"),
        ("Total Project Length", kpis["total_length_km"], "Km", "Sum of proposed length"),
        ("Total Completed Length", kpis["completed_length_km"], "Km", "Sum of verified completed length"),
        ("Total Administrative Sanction", kpis["total_as_amount_cr"], "₹ Cr", "G.O. Sanction amount"),
        ("Total Contract Value", kpis["total_contract_value_cr"], "₹ Cr", "Awarded contract value"),
        ("Total Expenditure Incurred", kpis["total_expenditure_cr"], "₹ Cr", "Disbursed expenditure"),
        ("Total Avoidable Financial Exposure", kpis["total_avoidable_exposure_cr"], "₹ Cr", "Preventable duplicate cost")
    ]
    for r_idx, row in enumerate(kpi_rows, start=2):
        ws2.append(list(row))
        for c in range(1, 5):
            ws2.cell(row=r_idx, column=c).border = thin_border

    # Sheet 3: Risk Findings
    ws3 = wb.create_sheet(title="Risk Findings")
    ws3.append(["Work Code", "Work Name", "Circle", "Division", "Risk Severity", "Root Cause", "Financial Exposure (Cr)", "Avoidable Loss (Cr)", "Action Owner"])
    for col_num in range(1, 10):
        cell = ws3.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = risk_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    risk_items = [w for w in items if w.risk_severity in ["CRITICAL", "HIGH"]]
    for r_idx, w in enumerate(risk_items, start=2):
        row_vals = [
            sanitize(w.work_code), sanitize(w.work_name), sanitize(w.circle), sanitize(w.division),
            sanitize(w.risk_severity), sanitize(w.root_cause), w.financial_exposure_cr,
            w.avoidable_expenditure_cr, sanitize(w.pending_action_owner)
        ]
        ws3.append(row_vals)
        for c in range(1, 10):
            ws3.cell(row=r_idx, column=c).border = thin_border

    # Sheet 4: Data Quality Exceptions
    ws4 = wb.create_sheet(title="Data Quality Exceptions")
    ws4.append(["Work Code", "Work Name", "Division", "Verification Status", "Confidence Score", "Data Mode", "Exception Details"])
    for col_num in range(1, 8):
        cell = ws4.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = PatternFill(start_color="D97706", end_color="D97706", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")

    dq_items = [w for w in items if w.verification_status != "Officially Verified" or w.data_confidence < 90.0]
    for r_idx, w in enumerate(dq_items, start=2):
        row_vals = [
            sanitize(w.work_code), sanitize(w.work_name), sanitize(w.division),
            sanitize(w.verification_status), f"{w.data_confidence}%", sanitize(w.data_mode),
            "Source dataset completion date or chainage flag marked for engineering audit"
        ]
        ws4.append(row_vals)
        for c in range(1, 8):
            ws4.cell(row=r_idx, column=c).border = thin_border

    # Sheet 5: Filter Criteria & Metadata
    ws5 = wb.create_sheet(title="Filter Criteria & Metadata")
    ws5.append(["Parameter", "Value"])
    meta_rows = [
        ("Export Generated At", datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%d %H:%M:%S UTC")),
        ("Generated By Role", user_role),
        ("User Jurisdiction Scope", user_jurisdiction or "Statewide"),
        ("Source Dataset", "Tamil Nadu Highways PMS Predefined Report (1).csv & G.O.(Ms) No. 105"),
        ("Application", "Tamil Nadu Highways Decision Operations Support System (TN-HDOS)"),
        ("Filter Scope Description", kpis["scope_description"]),
        ("Total Matching Works Exported", len(items))
    ]
    for r_idx, row in enumerate(meta_rows, start=1):
        ws5.append(list(row))
        ws5.cell(row=r_idx, column=1).font = Font(bold=True)

    # Auto-adjust column widths
    for sheet in [ws1, ws2, ws3, ws4, ws5]:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    filename = f"tn_hdos_works_analytics_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return out.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename
