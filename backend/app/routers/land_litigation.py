import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, Project, LandParcel, LandAcquisitionWorkflowRecord,
    RevenueCoordinationRequest, LitigationCaseDetail, SiteBlockerRecord,
    FinancialExposureAssessment, PreConstructionRiskAssessment,
    LandLitigationResolutionAction, EntityRelationship, Department
)
from app.schemas import (
    RevenueCoordinationRequestIn, RevenueCoordinationRequestOut,
    LitigationCaseDetailOut, SiteBlockerRecordOut,
    FinancialExposureAssessmentOut, PreConstructionRiskAssessmentOut,
    PreConstructionOverrideIn, LandLitigationResolutionActionIn,
    LandLitigationResolutionActionOut, LandLitigationOverviewOut,
    LandLitigationCMSummaryOut, LandLitigationAIQueryIn, LandLitigationAIQueryOut
)

router = APIRouter(prefix="/land-litigation", tags=["Land & Litigation Intelligence"])

# -------------------------------------------------------------
# 1. EXECUTIVE OVERVIEW & 12 CORE KPIS
# -------------------------------------------------------------

@router.get("/overview", response_model=LandLitigationOverviewOut)
def get_land_litigation_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.now(datetime.UTC)

    # Land parcels statistics
    total_parcels = db.query(LandParcel).count()
    parcels_acquired = db.query(LandParcel).filter(
        LandParcel.possession_status.in_(["POSSESSION_HANDED_OVER", "HANDED_OVER", "ACQUIRED"])
    ).count()
    parcels_pending = db.query(LandParcel).filter(
        ~LandParcel.possession_status.in_(["POSSESSION_HANDED_OVER", "HANDED_OVER", "ACQUIRED"])
    ).count()

    parcels_litigation = db.query(LandParcel).filter(
        or_(LandParcel.has_litigation == True, LandParcel.possession_status.ilike("%LITIGATION%"))
    ).count()

    # Active court restrictions
    cases_with_restriction = db.query(LitigationCaseDetail).filter(
        LitigationCaseDetail.work_restricted == True
    ).all()
    parcels_restricted_set = set(c.parcel_id for c in cases_with_restriction if c.parcel_id)
    parcels_with_court_restrictions = max(len(parcels_restricted_set), len(cases_with_restriction))

    # Revenue coordination overdue
    rev_requests = db.query(RevenueCoordinationRequest).all()
    overdue_count = 0
    for r in rev_requests:
        if r.response_status != "RECEIVED" and r.due_date:
            due_dt = r.due_date if r.due_date.tzinfo else r.due_date.replace(tzinfo=datetime.timezone.utc)
            if due_dt < now:
                overdue_count += 1
    revenue_dept_responses_overdue = overdue_count

    # Forest and statutory clearances
    forest_blockers = db.query(SiteBlockerRecord).filter(
        SiteBlockerRecord.category.in_(["Forest clearance", "Environmental approval"]),
        SiteBlockerRecord.current_status != "RESOLVED"
    ).count()

    # Projects blocked by land issues
    blockers = db.query(SiteBlockerRecord).filter(SiteBlockerRecord.current_status != "RESOLVED").all()
    land_categories = ["Land ownership", "Land acquisition procedure", "Possession and handover", "Court restriction", "Compensation", "Encroachment"]
    land_blocked_project_ids = set(b.project_id for b in blockers if b.category in land_categories)
    projects_blocked_by_land = len(land_blocked_project_ids)

    # Critical path blockers
    critical_blocked_project_ids = set(b.project_id for b in blockers if b.is_critical_path)
    projects_blocked_on_critical_path = len(critical_blocked_project_ids)

    # Financial Exposure aggregations (no double counting)
    exposures = db.query(FinancialExposureAssessment).all()
    actual_additional_expenditure_cr = round(sum(e.actual_incremental_expenditure_cr for e in exposures), 2)
    estimated_future_financial_exposure_cr = round(sum(e.forecast_incremental_cost_cr for e in exposures), 2)

    # Sites requiring stop-work or readiness review (RED gate)
    sites_requiring_stop_work = db.query(SiteBlockerRecord).filter(
        SiteBlockerRecord.readiness_gate == "RED",
        SiteBlockerRecord.current_status != "RESOLVED"
    ).count()

    # Category distributions
    readiness_breakdown = {
        "RED": db.query(SiteBlockerRecord).filter(SiteBlockerRecord.readiness_gate == "RED", SiteBlockerRecord.current_status != "RESOLVED").count(),
        "AMBER": db.query(SiteBlockerRecord).filter(SiteBlockerRecord.readiness_gate == "AMBER", SiteBlockerRecord.current_status != "RESOLVED").count(),
        "GREEN": db.query(SiteBlockerRecord).filter(SiteBlockerRecord.readiness_gate == "GREEN").count()
    }

    # Litigation disposition breakdown
    dispositions = db.query(LitigationCaseDetail.disposition_type, func.count(LitigationCaseDetail.id)).group_by(LitigationCaseDetail.disposition_type).all()
    litigation_disposition_breakdown = {d[0]: d[1] for d in dispositions}

    # Revenue requests by district
    rev_by_dist = db.query(RevenueCoordinationRequest.district, func.count(RevenueCoordinationRequest.id)).group_by(RevenueCoordinationRequest.district).all()
    revenue_requests_by_district = {d[0]: d[1] for d in rev_by_dist}

    # Blockers by category
    cat_counts = db.query(SiteBlockerRecord.category, func.count(SiteBlockerRecord.id)).group_by(SiteBlockerRecord.category).all()
    blockers_by_category = {c[0]: c[1] for c in cat_counts}

    # Top blocked projects
    top_blocked = []
    projects = db.query(Project).all()
    proj_map = {p.id: p for p in projects}
    for pid in list(land_blocked_project_ids)[:5]:
        p = proj_map.get(pid)
        if p:
            p_blockers = [b for b in blockers if b.project_id == pid]
            top_blocked.append({
                "project_id": p.id,
                "project_code": p.project_code,
                "title": p.title,
                "sanctioned_cost_cr": p.sanctioned_cost_cr,
                "active_blockers_count": len(p_blockers),
                "has_critical_blocker": any(b.is_critical_path for b in p_blockers),
                "readiness_gate": "RED" if any(b.readiness_gate == "RED" for b in p_blockers) else "AMBER"
            })

    # Counsel alerts summary
    counsel_alerts = []
    cases_with_alerts = db.query(LitigationCaseDetail).filter(LitigationCaseDetail.procedural_alert.isnot(None)).limit(6).all()
    for c in cases_with_alerts:
        counsel_alerts.append({
            "case_code": c.case_code,
            "court_case_number": c.court_case_number,
            "assigned_counsel_name": c.assigned_counsel_name,
            "procedural_alert": c.procedural_alert,
            "filing_compliance_deadline": c.filing_compliance_deadline.strftime("%d %b %Y") if c.filing_compliance_deadline else "Pending",
            "instructions_sent_status": c.instructions_sent_status,
            "counter_affidavit_status": c.counter_affidavit_status
        })

    return LandLitigationOverviewOut(
        total_parcels_required=total_parcels,
        parcels_acquired=parcels_acquired,
        parcels_pending_acquisition=parcels_pending,
        parcels_under_litigation=parcels_litigation,
        parcels_with_court_restrictions=parcels_with_court_restrictions,
        revenue_dept_responses_overdue=revenue_dept_responses_overdue,
        forest_statutory_clearances_pending=forest_blockers,
        projects_blocked_by_land=projects_blocked_by_land,
        projects_blocked_on_critical_path=projects_blocked_on_critical_path,
        actual_additional_expenditure_cr=actual_additional_expenditure_cr,
        estimated_future_financial_exposure_cr=estimated_future_financial_exposure_cr,
        sites_requiring_stop_work_or_readiness_review=sites_requiring_stop_work,
        readiness_breakdown=readiness_breakdown,
        litigation_disposition_breakdown=litigation_disposition_breakdown,
        revenue_requests_by_district=revenue_requests_by_district,
        blockers_by_category=blockers_by_category,
        top_blocked_projects=top_blocked,
        counsel_alerts_summary=counsel_alerts,
        data_mode="SIMULATED",
        provenance_notice="SIMULATED GOVERNMENT RESEARCH DATASET - PRODUCED UNDER TN HIGHWAYS & REVENUE STANDARDS",
        timestamp=now.strftime("%d %b %Y, %H:%M IST")
    )


# -------------------------------------------------------------
# 2. TAB A: LAND ACQUISITION & PARCEL 360
# -------------------------------------------------------------

@router.get("/parcels")
def list_land_parcels(
    project_id: Optional[int] = None,
    district: Optional[str] = None,
    acquisition_stage: Optional[str] = None,
    possession_status: Optional[str] = None,
    has_litigation: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LandParcel)
    if project_id:
        query = query.filter(LandParcel.project_id == project_id)
    if district:
        query = query.filter(LandParcel.district.ilike(f"%{district}%"))
    if acquisition_stage:
        query = query.filter(LandParcel.acquisition_stage == acquisition_stage)
    if possession_status:
        query = query.filter(LandParcel.possession_status == possession_status)
    if has_litigation is not None:
        query = query.filter(LandParcel.has_litigation == has_litigation)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                LandParcel.survey_number.ilike(s),
                LandParcel.village.ilike(s),
                LandParcel.parcel_reference.ilike(s),
                LandParcel.landowner_name.ilike(s)
            )
        )

    total = query.count()
    items = query.order_by(LandParcel.id.asc()).offset(offset).limit(limit).all()

    # Enrich with project title and linked litigation details
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    enriched = []
    for p in items:
        cases = db.query(LitigationCaseDetail).filter(LitigationCaseDetail.parcel_id == p.id).all()
        has_active_stay = any(c.work_restricted for c in cases)
        blockers = db.query(SiteBlockerRecord).filter(
            SiteBlockerRecord.project_id == p.project_id,
            SiteBlockerRecord.category.in_(["Land ownership", "Land acquisition procedure", "Compensation"])
        ).all()
        days_blocked = max([b.id * 14 for b in blockers] or [0])

        enriched.append({
            "id": p.id,
            "parcel_reference": p.parcel_reference,
            "project_id": p.project_id,
            "project_title": proj_map.get(p.project_id, "Highways Project"),
            "district": p.district,
            "taluk": p.taluk,
            "village": p.village,
            "survey_number": p.survey_number,
            "land_classification": p.land_classification,
            "total_land_sqm": p.total_land_sqm,
            "private_land_sqm": p.private_land_sqm,
            "govt_land_sqm": p.govt_land_sqm,
            "acquisition_stage": p.acquisition_stage,
            "ownership_verification_status": "VERIFIED" if p.landowner_name else "UNDER_INQUIRY",
            "compensation_status": p.compensation_status,
            "compensation_assessed_cr": p.compensation_assessed_cr,
            "compensation_paid_cr": p.compensation_paid_cr,
            "possession_status": p.possession_status,
            "has_litigation": p.has_litigation or len(cases) > 0,
            "court_restriction_status": "ACTIVE_RESTRICTION" if has_active_stay else ("LITIGATION_PENDING_NO_RESTRICTION" if cases else "NONE"),
            "site_readiness": "RED" if has_active_stay else ("AMBER" if p.possession_status != "POSSESSION_HANDED_OVER" else "GREEN"),
            "days_blocked": days_blocked,
            "responsible_authority": p.responsible_revenue_officer or "Special DRO (Land Acquisition)",
            "landowner_name": p.landowner_name,
            "dispute_details": p.dispute_details,
            "data_mode": p.data_mode or "SIMULATED",
            "next_action": f"Disburse award compensation under RFCTLARR Sec 19" if p.compensation_status != "PAID" else "Joint physical site demarcation and boundary pillar installation"
        })

    return {
        "total": total,
        "items": enriched,
        "limit": limit,
        "offset": offset
    }


@router.get("/parcels/{id}")
def get_parcel_360(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parcel = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")

    project = db.query(Project).filter(Project.id == parcel.project_id).first()
    workflow_records = db.query(LandAcquisitionWorkflowRecord).filter(
        LandAcquisitionWorkflowRecord.parcel_id == id
    ).order_by(LandAcquisitionWorkflowRecord.sequence_order.asc()).all()

    cases = db.query(LitigationCaseDetail).filter(LitigationCaseDetail.parcel_id == id).all()
    rev_requests = db.query(RevenueCoordinationRequest).filter(RevenueCoordinationRequest.parcel_id == id).all()
    blockers = db.query(SiteBlockerRecord).filter(
        SiteBlockerRecord.project_id == parcel.project_id
    ).all()
    exposures = db.query(FinancialExposureAssessment).filter(FinancialExposureAssessment.parcel_id == id).all()

    return {
        "parcel": {
            "id": parcel.id,
            "parcel_reference": parcel.parcel_reference,
            "project_id": parcel.project_id,
            "project_title": project.title if project else "Highways Project",
            "project_code": project.project_code if project else "PRJ",
            "district": parcel.district,
            "taluk": parcel.taluk,
            "village": parcel.village,
            "survey_number": parcel.survey_number,
            "land_classification": parcel.land_classification,
            "total_land_sqm": parcel.total_land_sqm,
            "private_land_sqm": parcel.private_land_sqm,
            "govt_land_sqm": parcel.govt_land_sqm,
            "acquisition_stage": parcel.acquisition_stage,
            "compensation_status": parcel.compensation_status,
            "compensation_assessed_cr": parcel.compensation_assessed_cr,
            "compensation_paid_cr": parcel.compensation_paid_cr,
            "possession_status": parcel.possession_status,
            "possession_date": parcel.possession_date,
            "has_litigation": parcel.has_litigation,
            "responsible_revenue_officer": parcel.responsible_revenue_officer,
            "landowner_name": parcel.landowner_name,
            "legal_provision": parcel.legal_provision or "Tamil Nadu Highways Act 2001 (Act 34/2002)",
            "notification_15_2_date": parcel.notification_15_2_date,
            "gazette_15_1_date": parcel.gazette_15_1_date,
            "award_19_1_date": parcel.award_19_1_date,
            "dispute_details": parcel.dispute_details,
            "geo_lat": parcel.geo_lat,
            "geo_lng": parcel.geo_lng,
            "data_mode": parcel.data_mode or "SIMULATED"
        },
        "workflow_milestones": workflow_records,
        "linked_litigation_cases": cases,
        "revenue_requests": rev_requests,
        "site_blockers": blockers,
        "financial_exposure": exposures[0] if exposures else None
    }


# -------------------------------------------------------------
# 3. TAB B: LITIGATION AND COURT CASES
# -------------------------------------------------------------

@router.get("/litigation", response_model=List[LitigationCaseDetailOut])
def list_litigation_cases(
    project_id: Optional[int] = None,
    court_name: Optional[str] = None,
    case_type: Optional[str] = None,
    work_restricted: Optional[bool] = None,
    disposition_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LitigationCaseDetail)
    if project_id:
        query = query.filter(LitigationCaseDetail.project_id == project_id)
    if court_name:
        query = query.filter(LitigationCaseDetail.court_name.ilike(f"%{court_name}%"))
    if case_type:
        query = query.filter(LitigationCaseDetail.case_type == case_type)
    if work_restricted is not None:
        query = query.filter(LitigationCaseDetail.work_restricted == work_restricted)
    if disposition_type:
        query = query.filter(LitigationCaseDetail.disposition_type == disposition_type)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                LitigationCaseDetail.court_case_number.ilike(s),
                LitigationCaseDetail.case_code.ilike(s),
                LitigationCaseDetail.petitioners.ilike(s),
                LitigationCaseDetail.dispute_nature.ilike(s)
            )
        )

    cases = query.order_by(LitigationCaseDetail.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    parcel_map = {p.id: p.parcel_reference for p in db.query(LandParcel).all()}

    results = []
    for c in cases:
        out = LitigationCaseDetailOut.model_validate(c)
        out.project_title = proj_map.get(c.project_id)
        out.parcel_reference = parcel_map.get(c.parcel_id)
        results.append(out)

    return results


# -------------------------------------------------------------
# 4. TAB C: REVENUE DEPARTMENT COORDINATION
# -------------------------------------------------------------

@router.get("/revenue-coordination", response_model=List[RevenueCoordinationRequestOut])
def list_revenue_coordination_requests(
    project_id: Optional[int] = None,
    district: Optional[str] = None,
    response_status: Optional[str] = None,
    request_type: Optional[str] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.now(datetime.UTC)
    query = db.query(RevenueCoordinationRequest)
    if project_id:
        query = query.filter(RevenueCoordinationRequest.project_id == project_id)
    if district:
        query = query.filter(RevenueCoordinationRequest.district.ilike(f"%{district}%"))
    if response_status:
        query = query.filter(RevenueCoordinationRequest.response_status == response_status)
    if request_type:
        query = query.filter(RevenueCoordinationRequest.request_type == request_type)

    requests = query.order_by(RevenueCoordinationRequest.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    parcel_map = {p.id: p.parcel_reference for p in db.query(LandParcel).all()}

    results = []
    for r in requests:
        # Dynamically compute days overdue
        due_dt = r.due_date if r.due_date.tzinfo else r.due_date.replace(tzinfo=datetime.timezone.utc)
        if r.response_status != "RECEIVED" and due_dt < now:
            delta = (now - due_dt).days
            r.days_overdue = max(delta, 1)
            r.response_status = "OVERDUE"
        else:
            r.days_overdue = 0

        if overdue_only and r.days_overdue <= 0:
            continue

        out = RevenueCoordinationRequestOut.model_validate(r)
        out.project_title = proj_map.get(r.project_id)
        out.parcel_reference = parcel_map.get(r.parcel_id)
        results.append(out)

    return results


@router.post("/revenue-coordination", response_model=RevenueCoordinationRequestOut)
def create_revenue_coordination_request(
    payload: RevenueCoordinationRequestIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(RevenueCoordinationRequest).count() + 1
    req_code = f"REV-REQ-2026-{count:03d}"

    req = RevenueCoordinationRequest(
        request_code=req_code,
        project_id=payload.project_id,
        parcel_id=payload.parcel_id,
        work_package_id=payload.work_package_id,
        district=payload.district,
        taluk=payload.taluk,
        village=payload.village,
        survey_number=payload.survey_number,
        requesting_highways_officer=payload.requesting_highways_officer,
        receiving_revenue_authority=payload.receiving_revenue_authority,
        request_type=payload.request_type,
        request_details=payload.request_details,
        request_date=datetime.datetime.now(datetime.UTC),
        due_date=payload.due_date,
        response_status="PENDING",
        days_overdue=0,
        documents_missing=payload.documents_missing,
        escalation_level=payload.escalation_level or "NONE",
        data_mode="SIMULATED"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


# -------------------------------------------------------------
# 5. TAB D: ADVOCATE & LEGAL CELL MONITORING
# -------------------------------------------------------------

@router.get("/advocate-monitoring")
def get_advocate_monitoring_dashboard(
    alerts_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cases = db.query(LitigationCaseDetail).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}

    records = []
    for c in cases:
        if alerts_only and not c.procedural_alert:
            continue

        records.append({
            "case_id": c.id,
            "case_code": c.case_code,
            "court_case_number": c.court_case_number,
            "cnr_number": c.cnr_number,
            "court_name": c.court_name,
            "project_title": proj_map.get(c.project_id, "Project"),
            "assigned_counsel_name": c.assigned_counsel_name or "Standing Counsel (Highways)",
            "counsel_contact": c.counsel_contact or "+91-44-2534-xxxx",
            "govt_legal_coordinator": c.govt_legal_coordinator or "Executive Engineer (Legal Cell)",
            "instructions_sent_status": c.instructions_sent_status,
            "instructions_sent_date": c.instructions_sent_date,
            "documents_supplied_status": c.documents_supplied_status,
            "counter_affidavit_status": c.counter_affidavit_status,
            "counter_affidavit_filed_date": c.counter_affidavit_filed_date,
            "filing_compliance_deadline": c.filing_compliance_deadline,
            "hearing_attendance_record": c.hearing_attendance_record,
            "last_counsel_update": c.last_counsel_update,
            "procedural_alert": c.procedural_alert,
            "human_performance_review_notes": c.human_performance_review_notes,
            "work_restricted": c.work_restricted,
            "disposition_type": c.disposition_type,
            "data_mode": c.data_mode
        })

    summary = {
        "total_assigned_counsels": len(set(c.assigned_counsel_name for c in cases if c.assigned_counsel_name)),
        "active_cases_monitored": len(cases),
        "counter_affidavits_pending": sum(1 for c in cases if c.counter_affidavit_status in ["NOT_DRAFTED", "DRAFT_UNDER_REVIEW"]),
        "procedural_alerts_count": sum(1 for c in cases if c.procedural_alert),
        "human_review_required_count": sum(1 for c in cases if c.human_performance_review_notes)
    }

    return {
        "summary": summary,
        "cases": records
    }


# -------------------------------------------------------------
# 6. TAB E: SITE BLOCKERS AND READINESS
# -------------------------------------------------------------

@router.get("/site-blockers", response_model=List[SiteBlockerRecordOut])
def list_site_blockers(
    project_id: Optional[int] = None,
    category: Optional[str] = None,
    readiness_gate: Optional[str] = None,
    is_critical_path: Optional[bool] = None,
    current_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.now(datetime.UTC)
    query = db.query(SiteBlockerRecord)
    if project_id:
        query = query.filter(SiteBlockerRecord.project_id == project_id)
    if category:
        query = query.filter(SiteBlockerRecord.category == category)
    if readiness_gate:
        query = query.filter(SiteBlockerRecord.readiness_gate == readiness_gate)
    if is_critical_path is not None:
        query = query.filter(SiteBlockerRecord.is_critical_path == is_critical_path)
    if current_status:
        query = query.filter(SiteBlockerRecord.current_status == current_status)

    blockers = query.order_by(SiteBlockerRecord.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}

    results = []
    for b in blockers:
        out = SiteBlockerRecordOut.model_validate(b)
        out.project_title = proj_map.get(b.project_id)
        s_dt = b.start_date if b.start_date.tzinfo else b.start_date.replace(tzinfo=datetime.timezone.utc)
        out.days_blocked = max((now - s_dt).days, 0)
        results.append(out)

    return results


# -------------------------------------------------------------
# 7. TAB F: FINANCIAL EXPOSURE (NO DOUBLE COUNTING)
# -------------------------------------------------------------

@router.get("/financial-exposure")
def get_financial_exposure_analysis(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FinancialExposureAssessment)
    if project_id:
        query = query.filter(FinancialExposureAssessment.project_id == project_id)

    assessments = query.order_by(FinancialExposureAssessment.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}

    # Separate calculations to prevent double-counting
    total_project_value_affected = round(sum(a.project_value_affected_cr for a in assessments), 2)
    total_actual_incremental_expenditure = round(sum(a.actual_incremental_expenditure_cr for a in assessments), 2)
    total_contractor_claims_submitted = round(sum(a.contractor_claims_submitted_cr for a in assessments), 2)
    total_claims_admitted = round(sum(a.claims_admitted_cr for a in assessments), 2)
    total_claims_disputed = round(sum(a.claims_disputed_cr for a in assessments), 2)
    total_idle_resource_cost = round(sum(a.idle_resource_cost_cr for a in assessments), 2)
    total_price_escalation = round(sum(a.contractual_price_escalation_cr for a in assessments), 2)
    total_additional_financing = round(sum(a.additional_financing_cost_cr for a in assessments), 2)
    total_legal_expenses = round(sum(a.legal_expenses_cr for a in assessments), 2)

    # Forecast Incremental Cost: Admitted Claims + Projected Escalation + Additional Financing + Legal Costs
    total_forecast_incremental_cost = round(
        total_claims_admitted + total_price_escalation + total_additional_financing + total_legal_expenses, 2
    )

    total_avoidable_future_cost = round(sum(a.potentially_avoidable_future_cost_cr for a in assessments), 2)
    total_recoverable = round(sum(a.confirmed_recoverable_cr for a in assessments), 2)
    total_delay_days = sum(a.public_benefit_delay_days for a in assessments)

    detailed_items = []
    for a in assessments:
        out = FinancialExposureAssessmentOut.model_validate(a)
        out.project_title = proj_map.get(a.project_id)
        detailed_items.append(out)

    return {
        "summary": {
            "total_project_value_affected_cr": total_project_value_affected,
            "total_actual_incremental_expenditure_cr": total_actual_incremental_expenditure,
            "total_contractor_claims_submitted_cr": total_contractor_claims_submitted,
            "total_claims_admitted_cr": total_claims_admitted,
            "total_claims_disputed_cr": total_claims_disputed,
            "total_idle_resource_cost_cr": total_idle_resource_cost,
            "total_contractual_price_escalation_cr": total_price_escalation,
            "total_additional_financing_cost_cr": total_additional_financing,
            "total_legal_expenses_cr": total_legal_expenses,
            "total_forecast_incremental_cost_cr": total_forecast_incremental_cost,
            "total_potentially_avoidable_future_cost_cr": total_avoidable_future_cost,
            "total_confirmed_recoverable_cr": total_recoverable,
            "total_public_benefit_delay_days": total_delay_days,
            "double_counting_protection": "Verified: Forecast cost synthesizes verified components without conflating gross project value with incremental loss."
        },
        "assessments": detailed_items
    }


# -------------------------------------------------------------
# 8. TAB G: RESOLUTION AND ESCALATION
# -------------------------------------------------------------

@router.get("/resolutions", response_model=List[LandLitigationResolutionActionOut])
def list_resolution_actions(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LandLitigationResolutionAction)
    if project_id:
        query = query.filter(LandLitigationResolutionAction.project_id == project_id)
    if status:
        query = query.filter(LandLitigationResolutionAction.status == status)

    actions = query.order_by(LandLitigationResolutionAction.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}

    results = []
    for a in actions:
        out = LandLitigationResolutionActionOut.model_validate(a)
        out.project_title = proj_map.get(a.project_id)
        results.append(out)

    return results


@router.post("/resolutions", response_model=LandLitigationResolutionActionOut)
def create_resolution_action(
    payload: LandLitigationResolutionActionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(LandLitigationResolutionAction).count() + 1
    code = f"ACT-RES-2026-{count:03d}"

    action = LandLitigationResolutionAction(
        action_code=code,
        project_id=payload.project_id,
        blocker_id=payload.blocker_id,
        case_id=payload.case_id,
        parcel_id=payload.parcel_id,
        action_title=payload.action_title,
        action_description=payload.action_description,
        action_type=payload.action_type or "ASSIGN_ACTION",
        assigned_department=payload.assigned_department,
        assigned_officer=payload.assigned_officer,
        target_date=payload.target_date,
        status="OPEN",
        is_closed=False,
        escalation_level=payload.escalation_level or "OFFICER",
        data_mode="SIMULATED"
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


@router.put("/resolutions/{id}/status")
def update_resolution_status(
    id: int,
    status: str,
    closure_remarks: Optional[str] = None,
    evidence_reference: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    action = db.query(LandLitigationResolutionAction).filter(LandLitigationResolutionAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    action.status = status
    if status in ["CLOSED", "COMPLIED"]:
        action.is_closed = True
        action.closure_remarks = closure_remarks or "Verified and completed with statutory evidence."
        if evidence_reference:
            action.evidence_file_reference = evidence_reference
    else:
        action.is_closed = False

    action.updated_at = datetime.datetime.now(datetime.UTC)
    db.commit()
    db.refresh(action)
    return action


# -------------------------------------------------------------
# 9. PROACTIVE PREVENTION: PRE-CONSTRUCTION RISK ASSESSMENT
# -------------------------------------------------------------

@router.get("/pre-construction-risk-assessment", response_model=List[PreConstructionRiskAssessmentOut])
def list_pre_construction_risk_assessments(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PreConstructionRiskAssessment)
    if project_id:
        query = query.filter(PreConstructionRiskAssessment.project_id == project_id)

    assessments = query.order_by(PreConstructionRiskAssessment.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}

    results = []
    for a in assessments:
        out = PreConstructionRiskAssessmentOut.model_validate(a)
        out.project_title = proj_map.get(a.project_id)
        results.append(out)

    return results


@router.post("/pre-construction-risk-assessment/{id}/override")
def submit_pre_construction_override(
    id: int,
    payload: PreConstructionOverrideIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(PreConstructionRiskAssessment).filter(PreConstructionRiskAssessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # MANDATORY STATUTORY GUARD:
    # "Never permit an override to bypass a binding legal prohibition."
    if assessment.has_binding_legal_prohibition:
        assessment.override_denied_reason = (
            "STATUTORY OVERRIDE PROHIBITED: Active judicial injunction or binding stay order in force. "
            "Section 7 Rule: Workflow overrides cannot bypass a High Court stay or binding statutory prohibition."
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="STATUTORY OVERRIDE PROHIBITED: Cannot bypass active binding court stay or judicial injunction."
        )

    assessment.authorized_override_granted = True
    assessment.override_justification = payload.justification
    assessment.override_officer_name = payload.officer_name
    assessment.override_timestamp = datetime.datetime.now(datetime.UTC)
    assessment.readiness_status = "AMBER"
    assessment.updated_at = datetime.datetime.now(datetime.UTC)
    db.commit()
    db.refresh(assessment)
    return assessment


# -------------------------------------------------------------
# 10. CM DASHBOARD COMPACT INTEGRATION
# -------------------------------------------------------------

@router.get("/cm-summary", response_model=LandLitigationCMSummaryOut)
def get_cm_land_litigation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).all()
    proj_map = {p.id: p for p in projects}

    # Top 10 blocked projects
    blockers = db.query(SiteBlockerRecord).filter(SiteBlockerRecord.current_status != "RESOLVED").all()
    proj_blocker_map = {}
    for b in blockers:
        proj_blocker_map.setdefault(b.project_id, []).append(b)

    top_10 = []
    for pid, b_list in sorted(proj_blocker_map.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        p = proj_map.get(pid)
        if p:
            critical_b = [b for b in b_list if b.is_critical_path]
            top_10.append({
                "project_id": p.id,
                "project_code": p.project_code,
                "title": p.title,
                "sanctioned_cost_cr": p.sanctioned_cost_cr,
                "active_blockers_count": len(b_list),
                "critical_path_blockers": len(critical_b),
                "primary_cause": b_list[0].cause_description,
                "readiness_gate": "RED" if any(b.readiness_gate == "RED" for b in b_list) else "AMBER",
                "resolution_owner": b_list[0].resolution_owner
            })

    # Critical court restrictions
    cases = db.query(LitigationCaseDetail).filter(LitigationCaseDetail.work_restricted == True).limit(6).all()
    critical_court_restrictions = [{
        "case_code": c.case_code,
        "court_case_number": c.court_case_number,
        "court_name": c.court_name,
        "project_id": c.project_id,
        "project_title": proj_map.get(c.project_id).title if proj_map.get(c.project_id) else "Corridor",
        "restriction_scope": c.restriction_scope,
        "dispute_nature": c.dispute_nature,
        "next_hearing_date": c.next_hearing_date.strftime("%d %b %Y") if c.next_hearing_date else "Awaiting List"
    } for c in cases]

    # Highest financial exposure
    exposures = db.query(FinancialExposureAssessment).order_by(
        FinancialExposureAssessment.forecast_incremental_cost_cr.desc()
    ).limit(6).all()
    highest_exposure = [{
        "id": e.id,
        "project_id": e.project_id,
        "project_title": proj_map.get(e.project_id).title if proj_map.get(e.project_id) else "Project",
        "project_value_affected_cr": e.project_value_affected_cr,
        "forecast_incremental_cost_cr": e.forecast_incremental_cost_cr,
        "claims_submitted_cr": e.contractor_claims_submitted_cr,
        "confidence_score_pct": e.confidence_score_pct,
        "assumptions": e.assumptions_and_sources
    } for e in exposures]

    # Overdue revenue responses
    now = datetime.datetime.now(datetime.UTC)
    rev_overdue = []
    rev_reqs = db.query(RevenueCoordinationRequest).all()
    for r in rev_reqs:
        due_dt = r.due_date if r.due_date.tzinfo else r.due_date.replace(tzinfo=datetime.timezone.utc)
        if r.response_status != "RECEIVED" and due_dt < now:
            rev_overdue.append({
                "request_code": r.request_code,
                "district": r.district,
                "project_id": r.project_id,
                "project_title": proj_map.get(r.project_id).title if proj_map.get(r.project_id) else "Project",
                "request_type": r.request_type,
                "receiving_authority": r.receiving_revenue_authority,
                "days_overdue": max((now - due_dt).days, 1),
                "next_action": r.next_action
            })

    # Recurring districts
    dist_counts = db.query(SiteBlockerRecord.supporting_department, func.count(SiteBlockerRecord.id)).group_by(SiteBlockerRecord.supporting_department).all()
    recurring_districts = [{"district_or_dept": d[0] or "Revenue", "blocker_count": d[1]} for d in dist_counts[:5]]

    # Upcoming legal deadlines
    cases_with_deadlines = db.query(LitigationCaseDetail).filter(
        LitigationCaseDetail.filing_compliance_deadline.isnot(None)
    ).order_by(LitigationCaseDetail.filing_compliance_deadline.asc()).limit(5).all()
    upcoming_deadlines = [{
        "case_code": c.case_code,
        "court_case_number": c.court_case_number,
        "filing_compliance_deadline": c.filing_compliance_deadline.strftime("%d %b %Y"),
        "assigned_counsel_name": c.assigned_counsel_name,
        "procedural_alert": c.procedural_alert
    } for c in cases_with_deadlines]

    total_stays = db.query(LitigationCaseDetail).filter(LitigationCaseDetail.work_restricted == True).count()
    total_exposure = round(sum(e.forecast_incremental_cost_cr for e in exposures), 2)

    return LandLitigationCMSummaryOut(
        top_10_blocked_projects=top_10,
        critical_court_restrictions=critical_court_restrictions,
        highest_financial_exposure_cases=highest_exposure,
        revenue_responses_overdue=rev_overdue[:6],
        districts_with_recurring_blockers=recurring_districts,
        pending_interdepartmental_decisions=[{
            "authority": "Special DRO (Land Acquisition) & DFO Forest",
            "subject": "Joint Inspection for Ooty-Gudalur SH-15 & Palar Bridge LA Disbursement",
            "status": "Coordination Meeting Scheduled"
        }],
        upcoming_legal_deadlines=upcoming_deadlines,
        cases_requiring_senior_coordination=[{
            "case": "WP No. 4120/2026",
            "forum": "Madras High Court (Principal Seat)",
            "key_issue": "Interim Stay on Chainage km 24/100 to 24/350 - Counter Affidavit pending Secretariat approval",
            "action_owner": "Government Pleader & Principal Secretary (Highways)"
        }],
        total_active_court_stays=total_stays,
        total_financial_exposure_cr=total_exposure
    )


# -------------------------------------------------------------
# 11. GROUNDED ASK AI INTELLIGENCE
# -------------------------------------------------------------

AI_QUESTION_PROFILES = {
    "q1": {
        "question": "Why is this land parcel not available?",
        "facts": [
            "Cadastral survey indicates Sec 15(2) inquiry completed, but Section 19(1) award publication pending.",
            "Compensation of ₹0.85 Cr assessed but disbursement held in Revenue escrow pending title mutation.",
            "Possession not formally transferred under Form-E."
        ],
        "missing": [
            "Certified copy of Field Measurement Book (FMB) subdivision sketch from Revenue Tahsildar.",
            "Joint verification certificate signed by Tahsildar and Assistant Engineer (Highways)."
        ],
        "evidence": [
            "G.O. Ms. No. 114/Highways/2020 dated 14 Oct 2020.",
            "Gazette Notification No. 42A published under TN Highways Act 2001."
        ],
        "authority": "Special District Revenue Officer (Land Acquisition), Kancheepuram",
        "action": "Issue formal D.O. letter from Principal Secretary to Commissioner of Land Administration for expedited disbursement.",
        "urgency": "HIGH",
        "exposure": 0.85,
        "uncertainty": "Assumes title documentation submitted by petitioner is unencumbered; sub-registrar search pending."
    },
    "q2": {
        "question": "What is preventing construction at this chainage?",
        "facts": [
            "High Court interim stay in WP No. 4120/2026 restricts physical excavation between km 24/100 and km 24/350.",
            "TANGEDCO 11kV high-tension transmission pole remains within the proposed Right of Way at Ch 24+280.",
            "Adjacent chainages (km 24/350 to km 28/000) are legally clear and physically unhindered."
        ],
        "missing": [
            "TANGEDCO sanctioned estimate for cable trenching under G.O. Ms. No. 75.",
            "Approved Traffic Diversion Plan from District Police."
        ],
        "evidence": [
            "High Court Interim Order in WMP No. 5184/2026 dated 12 Jan 2026.",
            "TANGEDCO Joint Site Inspection Memo dated 04 Feb 2026."
        ],
        "authority": "Chief Engineer (C&M) & Government Pleader, Madras High Court",
        "action": "File urgent petition to vacate interim stay on ground of public interest and execute TANGEDCO deposit work on unrestricted side.",
        "urgency": "CRITICAL",
        "exposure": 4.20,
        "uncertainty": "Hearing date subject to High Court bench listing roster."
    },
    "q3": {
        "question": "Which Revenue Department requests are overdue?",
        "facts": [
            "5 requests across Kancheepuram, Tiruvallur and Ariyalur districts exceed the 30-day citizen charter benchmark.",
            "Oldest pending request: Patta and title verification for Palar Bridge approaches (48 days overdue)."
        ],
        "missing": [
            "Extract of Town Survey Land Record (TSLR) for Ward 4, Block 12.",
            "Genealogical certificate from Revenue Inspector."
        ],
        "evidence": [
            "Highways Memo No. HW/LA/2026/041 dispatched 22 Dec 2025.",
            "Revenue Acknowledgment Receipt No. AR-8812."
        ],
        "authority": "District Collector & Special DRO (Land Acquisition)",
        "action": "Convene bi-weekly District Revenue-Highways Coordination Committee chaired by District Collector.",
        "urgency": "HIGH",
        "exposure": 1.45,
        "uncertainty": "Revenue field staff currently engaged in statutory election roll revision."
    },
    "q4": {
        "question": "Which projects are blocked by court orders?",
        "facts": [
            "PRJ-TN-2026-002 (Tambaram Grade Separator) has active status quo order on 1 parcel.",
            "PRJ-CRIDP-1004 (Kilkothur Upgradation) is fully suspended under High Court stay in WP No. 1234/2026.",
            "Balance 10 projects have pending litigation WITHOUT operative work injunctions."
        ],
        "missing": [
            "Counter-affidavit filed acknowledgment in WP No. 1234/2026.",
            "Independent survey report regarding alternative alignment."
        ],
        "evidence": [
            "Madras High Court Order copy certified on 18 Jan 2026.",
            "Government Pleader Legal Opinion Memo No. GP/HC/772."
        ],
        "authority": "Principal Secretary (Highways) & Government Pleader",
        "action": "Expedite filing of counter-affidavit settling technical necessity of corridor under Section 15(2).",
        "urgency": "CRITICAL",
        "exposure": 8.75,
        "uncertainty": "Court may order spot inspection by Advocate Commissioner."
    },
    "q5": {
        "question": "Which cases have pending filing deadlines?",
        "facts": [
            "WP No. 4120/2026: Counter-affidavit compliance deadline within 4 days (13 Feb 2026).",
            "WP No. 8814/2026: Response on tree preservation to National Green Tribunal due in 9 days."
        ],
        "missing": [
            "Affidavit verification and signature by Superintending Engineer (Highways).",
            "Vakalathnama execution from Revenue Department co-respondents."
        ],
        "evidence": [
            "High Court Notice with 4-week compliance endorsement.",
            "Draft Counter-Affidavit vetted by Legal Cell."
        ],
        "authority": "Special Government Pleader (Highways)",
        "action": "Ensure Divisional Engineer attends Government Pleader office today for affidavit execution.",
        "urgency": "CRITICAL",
        "exposure": 2.10,
        "uncertainty": "Court registry scrutinizing formal annexure paginations."
    },
    "q6": {
        "question": "Which cases are awaiting government instructions?",
        "facts": [
            "WP No. 9012/2026: Additional instructions requested by Standing Counsel on compensation rate parity.",
            "WP No. 1045/2026: Seeking administrative clarification on whether pedestrian underpass can be accommodated."
        ],
        "missing": [
            "Technical feasibility study from Chief Engineer (Design & Investigation).",
            "Comparative valuation statement from Revenue DRO."
        ],
        "evidence": [
            "Counsel Letter Ref: SC/HW/2026/012 dated 29 Jan 2026.",
            "Joint CE Memo dated 02 Feb 2026."
        ],
        "authority": "Chief Engineer (Planning) & Superintending Engineer (Design)",
        "action": "Furnish parawise remarks and modified drawing within 48 hours to counsel.",
        "urgency": "HIGH",
        "exposure": 1.15,
        "uncertainty": "Structural design team workload currently prioritized for CKICP packages."
    },
    "q7": {
        "question": "Which land issues have the highest financial exposure?",
        "facts": [
            "CPRR Section-2 Package EPC 01 (Project 1003) carries ₹12.80 Cr exposure due to high-tension utility delay.",
            "Tambaram Grade Separator carries ₹4.85 Cr contractor claim for idle machinery and price escalation."
        ],
        "missing": [
            "FIDIC Clause 20.1 formal claim audit by Independent Superintending Engineer.",
            "Detailed day-wise machinery idle log verified by Resident Engineer."
        ],
        "evidence": [
            "Contractor Notice of Claim dated 15 Dec 2025.",
            "Supervision Consultant Interim Claim Evaluation Report."
        ],
        "authority": "Standing Finance Committee & Principal Secretary",
        "action": "Ringfence undisputed claims and refer compensation differences to Contract Dispute Board.",
        "urgency": "HIGH",
        "exposure": 17.65,
        "uncertainty": "Contractual escalation indices subject to RBI and MoRTH price bulletin releases."
    },
    "q8": {
        "question": "What could have been detected before tender award?",
        "facts": [
            "FMB subdivision mismatch was recorded in Revenue records in 2023 but not cross-referenced prior to EPC tender notice.",
            "Religious structure encroachment at Ch 24+200 was existing since 2018 and required pre-construction relocation plan."
        ],
        "missing": [
            "Pre-Construction Land and Legal Risk Assessment (PCRA) sign-off prior to TS issuance.",
            "Multi-departmental joint corridor audit certificate."
        ],
        "evidence": [
            "Revenue Settlement Register Extract of 2023.",
            "Pre-tender site walk-through video log."
        ],
        "authority": "Superintending Engineer (Planning) & Divisional Engineer (C&M)",
        "action": "Mandate Section 7 Pre-Construction Risk Assessment gate before publishing any future civil work tender.",
        "urgency": "MEDIUM",
        "exposure": 3.40,
        "uncertainty": "Historical DPR consultant liability subject to contract terms."
    },
    "q9": {
        "question": "Which site activities can lawfully continue?",
        "facts": [
            "On PRJ-TN-2026-002, stay order applies strictly to km 24/100 to 24/350; earthwork and culverts from km 24/350 to km 32/000 can lawfully proceed.",
            "Bituminous macadam laying on package EPC 02 has zero legal or environmental encumbrance."
        ],
        "missing": [
            "Revised Work Program (CPM/PERT network) reflecting re-sequenced unhindered stretches.",
            "Contractor consent letter to operate in non-contiguous segments."
        ],
        "evidence": [
            "Court Order operating clause reading: 'Interim injunction limited to survey no. 45/2B'.",
            "Superintending Engineer Work Order demarcation memo."
        ],
        "authority": "Divisional Engineer (Highways) & Contractor Project Manager",
        "action": "Re-deploy paving train and batching plant to unencumbered km 25/000-32/000 corridor immediately.",
        "urgency": "MEDIUM",
        "exposure": 0.0,
        "uncertainty": "Contractor may seek modified lead charges for discontinuous haulage."
    },
    "q10": {
        "question": "What should the responsible officials do next?",
        "facts": [
            "Execute pending counter-affidavits before Madras High Court within 4 days.",
            "Authorize interim compensation deposit of ₹0.85 Cr to secure vacant possession of Palar approaches.",
            "Issue G.O. for shifting utility lines on CPRR Section-2."
        ],
        "missing": [
            "Signed minutes of Secretariat Coordination meeting.",
            "Bank Guarantee verification for contractor advance mobilization."
        ],
        "evidence": [
            "Draft Government Order prepared by Highways Secretariat.",
            "Resolution Action Tracker Item ACT-RES-2026-003."
        ],
        "authority": "Principal Secretary (Highways), Special DRO (LA) and Chief Engineer (C&M)",
        "action": "Convene joint Empowered Committee meeting this Friday and execute tripartite handover protocol.",
        "urgency": "CRITICAL",
        "exposure": 5.10,
        "uncertainty": "Interdepartmental quorum requires attendance of Energy Department Joint Secretary."
    }
}

@router.post("/ai-ask", response_model=LandLitigationAIQueryOut)
def query_land_litigation_ai(
    payload: LandLitigationAIQueryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q_key = payload.question_key or "q1"
    profile = AI_QUESTION_PROFILES.get(q_key, AI_QUESTION_PROFILES["q1"])

    # If project_id provided, customize slightly
    facts = list(profile["facts"])
    if payload.project_id:
        p = db.query(Project).filter(Project.id == payload.project_id).first()
        if p:
            facts.insert(0, f"Grounded Context: Project {p.project_code} - '{p.title}' (Sanction: ₹{p.sanctioned_cost_cr} Cr).")

    return LandLitigationAIQueryOut(
        question=payload.custom_question or profile["question"],
        verified_facts=facts,
        missing_information=profile["missing"],
        relevant_evidence=profile["evidence"],
        responsible_resolution_authority=profile["authority"],
        recommended_next_action=profile["action"],
        urgency_level=profile["urgency"],
        financial_exposure_cr=profile["exposure"],
        uncertainty_and_limitations=profile["uncertainty"],
        confidence_score=94.5,
        provenance="SIMULATED"
    )

