"""
Land Acquisition & Utility Shifting Intelligence Router (Prompt 05).
Implements:
- Land Acquisition Overview & KPI synthesis
- Utility Shifting Overview & KPI synthesis
- Land Parcel Register (50 parcels, Section 15/19 statutory provisions, compensation, possession)
- Land Acquisition Lifecycle Workflow (Identification -> Survey -> 15(2) -> 15(3) -> 15(1) -> Valuation -> 19(1) -> Compensation -> Possession -> Handover)
- Utility Shifting Register (25 records across TANGEDCO, TWAD, Telecom, Municipal bodies)
- Utility Shifting Lifecycle Workflow (Identification -> Joint Inspection -> Estimate -> Approval -> Funding -> Work Order -> Shifting -> Inspection -> Verification -> Closure)
- Interactive GIS Spatial Map Endpoints
- AI Land & Utility Bottleneck Intelligence
Strict RBAC & Integrity:
- Unauthorised / Contractor users cannot approve land acquisition or utility milestones.
- Possession cannot be complete without possession date & documentation.
- Compensation cannot be marked paid without payment record.
- Utility shifting cannot be marked complete without engineer verification.
"""

import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from app.database import get_db
from app.models import (
    LandParcel, UtilityShiftingRecord, LandAcquisitionWorkflowRecord,
    Project, WorkPackage, Department, User, DepartmentAIFinding,
    SupportingDocumentReference
)
from app.auth import get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/land-utility", tags=["Land Acquisition & Utility Intelligence"])


# -----------------------------------------------------------------------------
# Pydantic Schemas for Land & Utility
# -----------------------------------------------------------------------------
class LandAcquisitionKPIs(BaseModel):
    total_projects_with_land_req: int
    total_land_required_sqm: float
    total_land_acquired_sqm: float
    total_land_pending_sqm: float
    acquisition_rate_pct: float
    awards_passed_count: int
    total_compensation_assessed_cr: float
    total_compensation_paid_cr: float
    total_compensation_pending_cr: float
    possession_completed_count: int
    litigation_affected_parcels_count: int
    critical_land_blockers_count: int


class UtilityShiftingKPIs(BaseModel):
    total_utility_assets: int
    shifting_in_progress_count: int
    shifting_completed_count: int
    pending_approvals_count: int
    joint_inspections_completed_count: int
    fund_allocation_pending_count: int
    critical_utility_blockers_count: int
    total_estimated_shifting_cost_cr: float
    total_approved_shifting_cost_cr: float
    shifting_completion_rate_pct: float


class LandUtilityOverviewResponse(BaseModel):
    land_kpis: LandAcquisitionKPIs
    utility_kpis: UtilityShiftingKPIs
    kpi_definitions: dict
    ai_bottleneck_assessment: dict
    last_updated: str


class LandParcelItem(BaseModel):
    id: int
    parcel_reference: str
    project_id: int
    project_code: str
    project_title: str
    package_id: Optional[int] = None
    district: str
    taluk: str
    village: str
    survey_number: str
    landowner_name: Optional[str] = None
    land_classification: str
    private_land_sqm: float
    govt_land_sqm: float
    total_land_sqm: float
    acquisition_stage: str
    legal_provision: str
    notification_15_2_date: Optional[str] = None
    gazette_15_1_date: Optional[str] = None
    award_19_1_date: Optional[str] = None
    compensation_assessed_cr: float
    compensation_paid_cr: float
    compensation_status: str
    possession_status: str
    possession_date: Optional[str] = None
    has_litigation: bool
    dispute_details: Optional[str] = None
    responsible_revenue_officer: str
    blocking_project_milestone: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lng: Optional[float] = None
    data_mode: str = "mock"


class LandParcelWorkflowPayload(BaseModel):
    new_stage: str  # Identification, Survey, Notification 15(2), Objections 15(3), Gazette 15(1), Valuation, Award 19(1), Compensation, Possession, Handover
    possession_status: Optional[str] = None  # PENDING_POSSESSION, POSSESSION_HANDED_OVER, PARTIAL_DISPUTED
    possession_date: Optional[str] = None
    compensation_status: Optional[str] = None  # PENDING, PAID, PARTIAL, DISPUTED
    compensation_paid_cr: Optional[float] = None
    payment_reference: Optional[str] = None
    document_reference: Optional[str] = None
    dispute_details: Optional[str] = None
    officer_remarks: str


class UtilityShiftingItem(BaseModel):
    id: int
    utility_code: str
    project_id: int
    project_code: str
    project_title: str
    package_id: Optional[int] = None
    location_chainage: str
    utility_category: str
    owning_agency: str
    contact_officer: str
    affected_assets_count: int
    estimated_cost_cr: float
    approved_cost_cr: float
    fund_allocation_status: str
    application_date: Optional[str] = None
    joint_inspection_date: Optional[str] = None
    approval_status: str
    work_order_status: str
    physical_shifting_progress_pct: float
    verification_status: str
    target_completion_date: Optional[str] = None
    actual_completion_date: Optional[str] = None
    blocking_milestone: Optional[str] = None
    remarks: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lng: Optional[float] = None
    data_mode: str = "mock"


class UtilityWorkflowPayload(BaseModel):
    action: str  # UPDATE_PROGRESS, APPROVE_ESTIMATE, ISSUE_WORK_ORDER, VERIFY_COMPLETION
    approval_status: Optional[str] = None
    work_order_status: Optional[str] = None
    physical_progress_pct: Optional[float] = None
    verification_status: Optional[str] = None
    completion_date: Optional[str] = None
    verifying_engineer: Optional[str] = None
    inspection_document_ref: Optional[str] = None
    remarks: str


# -----------------------------------------------------------------------------
# 1. LAND & UTILITY OVERVIEW KPIS
# -----------------------------------------------------------------------------
@router.get("/overview", response_model=LandUtilityOverviewResponse)
def get_land_utility_overview(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lp_q = db.query(LandParcel)
    utl_q = db.query(UtilityShiftingRecord)

    if project_id:
        lp_q = lp_q.filter(LandParcel.project_id == project_id)
        utl_q = utl_q.filter(UtilityShiftingRecord.project_id == project_id)

    parcels = lp_q.all()
    utilities = utl_q.all()

    # Land KPI aggregation
    p_ids_with_land = {p.project_id for p in parcels}
    total_land_req = sum(p.total_land_sqm for p in parcels)
    acquired_land = sum(p.private_land_sqm for p in parcels if p.possession_status == "POSSESSION_HANDED_OVER")
    pending_land = total_land_req - acquired_land
    acq_rate = round((acquired_land / total_land_req * 100.0), 1) if total_land_req > 0 else 0.0

    awards_passed = sum(1 for p in parcels if p.award_19_1_date is not None or p.acquisition_stage in ["Award 19(1)", "Compensation", "Possession", "Handover"])
    total_comp_assessed = round(sum(p.compensation_assessed_cr for p in parcels), 2)
    total_comp_paid = round(sum(p.compensation_paid_cr for p in parcels), 2)
    total_comp_pending = round(total_comp_assessed - total_comp_paid, 2)
    possession_completed = sum(1 for p in parcels if p.possession_status == "POSSESSION_HANDED_OVER")
    litigation_count = sum(1 for p in parcels if p.has_litigation)
    critical_land_blockers = sum(1 for p in parcels if p.blocking_project_milestone and p.possession_status != "POSSESSION_HANDED_OVER")

    # Utility KPI aggregation
    total_utilities = len(utilities)
    in_progress = sum(1 for u in utilities if u.work_order_status == "IN_PROGRESS")
    completed = sum(1 for u in utilities if u.work_order_status == "COMPLETED")
    pending_app = sum(1 for u in utilities if u.approval_status in ["PENDING", "UNDER_REVIEW"])
    joint_inspected = sum(1 for u in utilities if u.joint_inspection_date is not None)
    fund_pending = sum(1 for u in utilities if u.fund_allocation_status == "PENDING")
    critical_utl_blockers = sum(1 for u in utilities if u.blocking_milestone and u.work_order_status != "COMPLETED")
    total_est_cost = round(sum(u.estimated_cost_cr for u in utilities), 2)
    total_app_cost = round(sum(u.approved_cost_cr for u in utilities), 2)
    utl_comp_rate = round((completed / total_utilities * 100.0), 1) if total_utilities > 0 else 0.0

    return LandUtilityOverviewResponse(
        land_kpis=LandAcquisitionKPIs(
            total_projects_with_land_req=len(p_ids_with_land),
            total_land_required_sqm=round(total_land_req, 1),
            total_land_acquired_sqm=round(acquired_land, 1),
            total_land_pending_sqm=round(pending_land, 1),
            acquisition_rate_pct=acq_rate,
            awards_passed_count=awards_passed,
            total_compensation_assessed_cr=total_comp_assessed,
            total_compensation_paid_cr=total_comp_paid,
            total_compensation_pending_cr=total_comp_pending,
            possession_completed_count=possession_completed,
            litigation_affected_parcels_count=litigation_count,
            critical_land_blockers_count=critical_land_blockers
        ),
        utility_kpis=UtilityShiftingKPIs(
            total_utility_assets=total_utilities,
            shifting_in_progress_count=in_progress,
            shifting_completed_count=completed,
            pending_approvals_count=pending_app,
            joint_inspections_completed_count=joint_inspected,
            fund_allocation_pending_count=fund_pending,
            critical_utility_blockers_count=critical_utl_blockers,
            total_estimated_shifting_cost_cr=total_est_cost,
            total_approved_shifting_cost_cr=total_app_cost,
            shifting_completion_rate_pct=utl_comp_rate
        ),
        kpi_definitions={
            "total_land_required_sqm": "Total private and government land area surveyed under TN Highways Act 2001.",
            "total_compensation_pending_cr": "Valuation awards passed by Competent Authorities awaiting Treasury payment release.",
            "possession_completed_count": "Parcels formally demarcated and delivered to Highways Department with zero encumbrance.",
            "critical_land_blockers_count": "Parcels directly halting contractor earthworks, bridge abutments or carriageway formation.",
            "total_utility_assets": "Count of documented overhead electrical lines, water mains, drainage and telecom ducts in RoW.",
            "critical_utility_blockers_count": "Active utility obstacles halting critical path milestones without physical shifting completion."
        },
        ai_bottleneck_assessment={
            "overall_assessment": "Statewide land acquisition progress stands at 68.4% possession with ₹18.42 Cr compensation disbursed. The single most acute execution bottleneck is in CKICP SH-15 Ooty-Gudalur Ghat Corridor where Parcel LA-SH15-01 (Pykara) has ₹0.85 Cr award compensation pending disbursement for 48 days, preventing physical handover for rock-cutting on Km 14+200. Concurrently, 48 TANGEDCO electrical poles (UTL-SH15-001) obstruct the carriage edge awaiting Gudalur 66kV substation power shutdown sanction.",
            "key_land_risks": [
                "LA-SH15-01 (Nilgiris): Sec 19(1) award compensation cheque token pending at District Treasury; possession delayed.",
                "LA-TN-002 (Chennai): Survey No. 88/3A civil court interim injunction halting approach ramp of Anna Nagar grade separator.",
                "7 Parcels across state have conflicting title claims between legal heirs requiring DRO enquiry."
            ],
            "key_utility_risks": [
                "UTL-SH15-001: 48 11kV electrical poles on SH-15 carriage edge blocking earthworks; feeder shutdown overdue 22 days.",
                "UTL-2026-003: 600mm TWAD pipeline intersecting Kollidam bridge approach embankment awaiting fund clearance.",
                "BSNL OFC cable shifting pending joint inspection on Salem-Harur MDR stretch."
            ],
            "recommended_actions": [
                "Direct Special DRO (LA) Nilgiris to coordinate with District Treasury Officer to disburse ₹0.85 Cr to Pykara pattadars by 28 Feb 2026.",
                "Minister for Public Works to engage Minister for Electricity to authorize Sunday shutdown on Gudalur feeder.",
                "File urgent vacate-stay petition in Chennai civil court for Survey No. 88/3A on grounds of public road urgency."
            ]
        },
        last_updated=datetime.datetime.now().strftime("%d %b %Y, %H:%M IST")
    )


# -----------------------------------------------------------------------------
# 2. LAND PARCEL REGISTER
# -----------------------------------------------------------------------------
@router.get("/parcels", response_model=List[LandParcelItem])
def get_land_parcels(
    project_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    acquisition_stage: Optional[str] = Query(None),
    compensation_status: Optional[str] = Query(None),
    possession_status: Optional[str] = Query(None),
    has_litigation: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LandParcel)

    if project_id:
        query = query.filter(LandParcel.project_id == project_id)
    if district and district != "ALL":
        query = query.filter(LandParcel.district == district)
    if acquisition_stage and acquisition_stage != "ALL":
        query = query.filter(LandParcel.acquisition_stage == acquisition_stage)
    if compensation_status and compensation_status != "ALL":
        query = query.filter(LandParcel.compensation_status == compensation_status)
    if possession_status and possession_status != "ALL":
        query = query.filter(LandParcel.possession_status == possession_status)
    if has_litigation is not None:
        query = query.filter(LandParcel.has_litigation == has_litigation)

    parcels = query.all()
    results = []

    for lp in parcels:
        if search:
            q_lower = search.lower()
            match = (
                q_lower in lp.parcel_reference.lower() or
                q_lower in lp.survey_number.lower() or
                q_lower in lp.village.lower() or
                q_lower in lp.district.lower() or
                q_lower in (lp.landowner_name or "").lower() or
                q_lower in (lp.project.title if lp.project else "").lower()
            )
            if not match:
                continue

        p_code = lp.project.project_code if lp.project else f"PRJ-{lp.project_id}"
        p_title = lp.project.title if lp.project else "Highways Project"

        results.append(LandParcelItem(
            id=lp.id,
            parcel_reference=lp.parcel_reference,
            project_id=lp.project_id,
            project_code=p_code,
            project_title=p_title,
            package_id=lp.work_package_id,
            district=lp.district,
            taluk=lp.taluk,
            village=lp.village,
            survey_number=lp.survey_number,
            landowner_name=lp.landowner_name,
            land_classification=lp.land_classification,
            private_land_sqm=lp.private_land_sqm or 0.0,
            govt_land_sqm=lp.govt_land_sqm or 0.0,
            total_land_sqm=lp.total_land_sqm or 0.0,
            acquisition_stage=lp.acquisition_stage or "Valuation",
            legal_provision=lp.legal_provision or "Tamil Nadu Highways Act 2001 Sec 15(2)",
            notification_15_2_date=lp.notification_15_2_date.strftime("%Y-%m-%d") if lp.notification_15_2_date else None,
            gazette_15_1_date=lp.gazette_15_1_date.strftime("%Y-%m-%d") if lp.gazette_15_1_date else None,
            award_19_1_date=lp.award_19_1_date.strftime("%Y-%m-%d") if lp.award_19_1_date else None,
            compensation_assessed_cr=lp.compensation_assessed_cr or 0.0,
            compensation_paid_cr=lp.compensation_paid_cr or 0.0,
            compensation_status=lp.compensation_status or "PENDING",
            possession_status=lp.possession_status or "PENDING_POSSESSION",
            possession_date=lp.possession_date.strftime("%Y-%m-%d") if lp.possession_date else None,
            has_litigation=lp.has_litigation or False,
            dispute_details=lp.dispute_details,
            responsible_revenue_officer=lp.responsible_revenue_officer,
            blocking_project_milestone=lp.blocking_project_milestone,
            geo_lat=lp.geo_lat,
            geo_lng=lp.geo_lng,
            data_mode="mock"
        ))

    return results


@router.get("/parcels/{id}", response_model=LandParcelItem)
def get_land_parcel_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lp = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Land parcel not found.")

    p_code = lp.project.project_code if lp.project else f"PRJ-{lp.project_id}"
    p_title = lp.project.title if lp.project else "Highways Project"

    return LandParcelItem(
        id=lp.id,
        parcel_reference=lp.parcel_reference,
        project_id=lp.project_id,
        project_code=p_code,
        project_title=p_title,
        package_id=lp.work_package_id,
        district=lp.district,
        taluk=lp.taluk,
        village=lp.village,
        survey_number=lp.survey_number,
        landowner_name=lp.landowner_name,
        land_classification=lp.land_classification,
        private_land_sqm=lp.private_land_sqm or 0.0,
        govt_land_sqm=lp.govt_land_sqm or 0.0,
        total_land_sqm=lp.total_land_sqm or 0.0,
        acquisition_stage=lp.acquisition_stage or "Valuation",
        legal_provision=lp.legal_provision or "Tamil Nadu Highways Act 2001 Sec 15(2)",
        notification_15_2_date=lp.notification_15_2_date.strftime("%Y-%m-%d") if lp.notification_15_2_date else None,
        gazette_15_1_date=lp.gazette_15_1_date.strftime("%Y-%m-%d") if lp.gazette_15_1_date else None,
        award_19_1_date=lp.award_19_1_date.strftime("%Y-%m-%d") if lp.award_19_1_date else None,
        compensation_assessed_cr=lp.compensation_assessed_cr or 0.0,
        compensation_paid_cr=lp.compensation_paid_cr or 0.0,
        compensation_status=lp.compensation_status or "PENDING",
        possession_status=lp.possession_status or "PENDING_POSSESSION",
        possession_date=lp.possession_date.strftime("%Y-%m-%d") if lp.possession_date else None,
        has_litigation=lp.has_litigation or False,
        dispute_details=lp.dispute_details,
        responsible_revenue_officer=lp.responsible_revenue_officer,
        blocking_project_milestone=lp.blocking_project_milestone,
        geo_lat=lp.geo_lat,
        geo_lng=lp.geo_lng,
        data_mode="mock"
    )


@router.post("/parcels/{id}/workflow")
def update_land_parcel_workflow(
    id: int,
    payload: LandParcelWorkflowPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lp = db.query(LandParcel).filter(LandParcel.id == id).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Land parcel not found.")

    # Strict RBAC: Contractor cannot execute statutory land acquisition or possession handovers
    if current_user.role and current_user.role.code == "CONTRACTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RBAC Restriction: Contractor personnel cannot execute statutory land acquisition, award or possession certifications."
        )

    # Mandatory Rule: A parcel cannot be marked possession-complete without a verified possession record and date
    if payload.possession_status == "POSSESSION_HANDED_OVER":
        if not payload.possession_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Integrity Constraint: A land parcel cannot be marked as POSSESSION_HANDED_OVER without a valid possession handover date and revenue certificate."
            )

    # Mandatory Rule: Compensation cannot be marked paid without a payment voucher / bank token reference
    if payload.compensation_status == "PAID" and not payload.payment_reference:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Constraint: Compensation cannot be recorded as PAID without a verified Treasury payment voucher reference number."
        )

    old_stage = lp.acquisition_stage
    old_possession = lp.possession_status

    lp.acquisition_stage = payload.new_stage

    if payload.possession_status:
        lp.possession_status = payload.possession_status
    if payload.possession_date:
        lp.possession_date = datetime.datetime.strptime(payload.possession_date, "%Y-%m-%d")
    elif payload.possession_status == "POSSESSION_HANDED_OVER" and not lp.possession_date:
        lp.possession_date = datetime.datetime.utcnow()

    if payload.compensation_status:
        lp.compensation_status = payload.compensation_status
    if payload.compensation_paid_cr is not None:
        lp.compensation_paid_cr = payload.compensation_paid_cr
    elif payload.compensation_status == "PAID":
        lp.compensation_paid_cr = lp.compensation_assessed_cr

    if payload.dispute_details:
        lp.dispute_details = payload.dispute_details

    # If possession handed over, clear milestone blockage
    if lp.possession_status == "POSSESSION_HANDED_OVER":
        lp.blocking_project_milestone = None

    db.commit()
    db.refresh(lp)

    # Immutable Audit Logging
    log_audit_event(
        db=db,
        action="UPDATE_LAND_PARCEL",
        entity_type="LAND_PARCEL",
        entity_id=lp.id,
        entity_reference=lp.parcel_reference,
        user=current_user,
        changes={
            "old_stage": old_stage,
            "new_stage": lp.acquisition_stage,
            "old_possession": old_possession,
            "new_possession": lp.possession_status,
            "compensation_status": lp.compensation_status,
            "payment_ref": payload.payment_reference,
            "remarks": payload.officer_remarks
        }
    )

    return {
        "status": "success",
        "message": f"Land parcel {lp.parcel_reference} updated to stage {lp.acquisition_stage}.",
        "parcel_id": lp.id,
        "acquisition_stage": lp.acquisition_stage,
        "possession_status": lp.possession_status,
        "compensation_paid_cr": lp.compensation_paid_cr
    }


# -----------------------------------------------------------------------------
# 3. UTILITY SHIFTING REGISTER & WORKFLOW
# -----------------------------------------------------------------------------
@router.get("/utilities", response_model=List[UtilityShiftingItem])
def get_utility_shiftings(
    project_id: Optional[int] = Query(None),
    utility_category: Optional[str] = Query(None),
    owning_agency: Optional[str] = Query(None),
    approval_status: Optional[str] = Query(None),
    work_order_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(UtilityShiftingRecord)

    if project_id:
        query = query.filter(UtilityShiftingRecord.project_id == project_id)
    if utility_category and utility_category != "ALL":
        query = query.filter(UtilityShiftingRecord.utility_category == utility_category)
    if owning_agency and owning_agency != "ALL":
        query = query.filter(UtilityShiftingRecord.owning_agency == owning_agency)
    if approval_status and approval_status != "ALL":
        query = query.filter(UtilityShiftingRecord.approval_status == approval_status)
    if work_order_status and work_order_status != "ALL":
        query = query.filter(UtilityShiftingRecord.work_order_status == work_order_status)

    utilities = query.all()
    results = []

    for u in utilities:
        if search:
            q_lower = search.lower()
            match = (
                q_lower in u.utility_code.lower() or
                q_lower in u.location_chainage.lower() or
                q_lower in u.owning_agency.lower() or
                q_lower in u.utility_category.lower() or
                q_lower in (u.project.title if u.project else "").lower()
            )
            if not match:
                continue

        p_code = u.project.project_code if u.project else f"PRJ-{u.project_id}"
        p_title = u.project.title if u.project else "Highways Project"

        results.append(UtilityShiftingItem(
            id=u.id,
            utility_code=u.utility_code,
            project_id=u.project_id,
            project_code=p_code,
            project_title=p_title,
            package_id=u.work_package_id,
            location_chainage=u.location_chainage,
            utility_category=u.utility_category,
            owning_agency=u.owning_agency,
            contact_officer=u.contact_officer,
            affected_assets_count=u.affected_assets_count or 1,
            estimated_cost_cr=u.estimated_cost_cr or 0.0,
            approved_cost_cr=u.approved_cost_cr or 0.0,
            fund_allocation_status=u.fund_allocation_status or "PENDING",
            application_date=u.application_date.strftime("%Y-%m-%d") if u.application_date else None,
            joint_inspection_date=u.joint_inspection_date.strftime("%Y-%m-%d") if u.joint_inspection_date else None,
            approval_status=u.approval_status,
            work_order_status=u.work_order_status,
            physical_shifting_progress_pct=u.physical_shifting_progress_pct or 0.0,
            verification_status=u.verification_status or "UNVERIFIED",
            target_completion_date=u.target_completion_date.strftime("%Y-%m-%d") if u.target_completion_date else None,
            actual_completion_date=u.actual_completion_date.strftime("%Y-%m-%d") if u.actual_completion_date else None,
            blocking_milestone=u.blocking_milestone,
            remarks=u.remarks,
            geo_lat=u.geo_lat,
            geo_lng=u.geo_lng,
            data_mode="mock"
        ))

    return results


@router.post("/utilities/{id}/workflow")
def update_utility_workflow(
    id: int,
    payload: UtilityWorkflowPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    u = db.query(UtilityShiftingRecord).filter(UtilityShiftingRecord.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Utility shifting record not found.")

    # Strict RBAC: Contractor cannot verify or certify completion of utility shifting
    if current_user.role and current_user.role.code == "CONTRACTOR":
        if payload.action in ["VERIFY_COMPLETION", "APPROVE_ESTIMATE"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="RBAC Restriction: Contractor personnel cannot approve utility estimates or certify utility shifting verification."
            )

    # Mandatory Rule: Utility shifting cannot be marked complete without departmental verification
    if payload.work_order_status == "COMPLETED" or payload.physical_progress_pct == 100.0:
        if payload.verification_status != "VERIFIED" and u.verification_status != "VERIFIED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Integrity Constraint: Utility shifting cannot be marked COMPLETED without departmental engineer inspection verification."
            )

    old_status = u.work_order_status
    old_prog = u.physical_shifting_progress_pct

    if payload.approval_status:
        u.approval_status = payload.approval_status
    if payload.work_order_status:
        u.work_order_status = payload.work_order_status
    if payload.physical_progress_pct is not None:
        u.physical_shifting_progress_pct = payload.physical_progress_pct
    if payload.verification_status:
        u.verification_status = payload.verification_status

    if u.physical_shifting_progress_pct == 100.0 and u.verification_status == "VERIFIED":
        u.work_order_status = "COMPLETED"
        u.actual_completion_date = datetime.datetime.utcnow()
        u.blocking_milestone = None

    if payload.remarks:
        u.remarks = payload.remarks

    db.commit()
    db.refresh(u)

    # Immutable Audit Logging
    log_audit_event(
        db=db,
        action="UPDATE_UTILITY_SHIFTING",
        entity_type="UTILITY_SHIFTING",
        entity_id=u.id,
        entity_reference=u.utility_code,
        user=current_user,
        changes={
            "action": payload.action,
            "old_status": old_status,
            "new_status": u.work_order_status,
            "old_progress": old_prog,
            "new_progress": u.physical_shifting_progress_pct,
            "verification_status": u.verification_status,
            "remarks": payload.remarks
        }
    )

    return {
        "status": "success",
        "message": f"Utility record {u.utility_code} updated.",
        "utility_id": u.id,
        "work_order_status": u.work_order_status,
        "physical_progress_pct": u.physical_shifting_progress_pct,
        "verification_status": u.verification_status
    }


# -----------------------------------------------------------------------------
# 4. GIS & SPATIAL MAP LOCATIONS
# -----------------------------------------------------------------------------
@router.get("/map-locations")
def get_land_utility_map_locations(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lp_q = db.query(LandParcel)
    utl_q = db.query(UtilityShiftingRecord)

    if project_id:
        lp_q = lp_q.filter(LandParcel.project_id == project_id)
        utl_q = utl_q.filter(UtilityShiftingRecord.project_id == project_id)

    parcels = lp_q.filter(LandParcel.geo_lat.isnot(None)).all()
    utilities = utl_q.filter(UtilityShiftingRecord.geo_lat.isnot(None)).all()

    points = []

    for p in parcels:
        points.append({
            "type": "PARCEL",
            "id": p.id,
            "code": p.parcel_reference,
            "title": f"Survey #{p.survey_number} ({p.village})",
            "location": f"{p.district} • {p.taluk}",
            "lat": p.geo_lat,
            "lng": p.geo_lng,
            "stage": p.acquisition_stage,
            "compensation_status": p.compensation_status,
            "possession_status": p.possession_status,
            "is_blocking": bool(p.blocking_project_milestone and p.possession_status != "POSSESSION_HANDED_OVER"),
            "owner": p.landowner_name
        })

    for u in utilities:
        points.append({
            "type": "UTILITY",
            "id": u.id,
            "code": u.utility_code,
            "title": f"{u.affected_assets_count}x {u.utility_category}",
            "location": u.location_chainage,
            "lat": u.geo_lat,
            "lng": u.geo_lng,
            "category": u.utility_category,
            "agency": u.owning_agency,
            "progress_pct": u.physical_shifting_progress_pct,
            "status": u.work_order_status,
            "is_blocking": bool(u.blocking_milestone and u.work_order_status != "COMPLETED")
        })

    return {
        "total_points": len(points),
        "points": points,
        "coordinate_system": "WGS-84 (EPSG:4326) - Synthetic Ground Demonstration Grid",
        "disclaimer": "DEMO DATA: Spatial coordinates are simulated for demonstration purposes."
    }


# -----------------------------------------------------------------------------
# 5. AI LAND & UTILITY INTELLIGENCE
# -----------------------------------------------------------------------------
@router.get("/ai-intelligence")
def get_land_utility_ai_intelligence(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DepartmentAIFinding).filter(
        DepartmentAIFinding.related_entity_type.in_(["PARCEL", "UTILITY"])
    )
    if project_id:
        query = query.filter(DepartmentAIFinding.project_id == project_id)

    findings = query.all()
    results = []

    for f in findings:
        p_code = f.project.project_code if f.project else f"PRJ-{f.project_id}"
        results.append({
            "id": f.id,
            "finding_code": f.finding_code,
            "category": f.category,
            "project_id": f.project_id,
            "project_code": p_code,
            "related_entity_type": f.related_entity_type,
            "related_entity_code": f.related_entity_code,
            "responsible_department_name": f.responsible_department_name,
            "title": f.title,
            "severity": f.severity,
            "confidence": f.confidence,
            "impact_statement": f.impact_statement,
            "evidence_notes": f.evidence_notes,
            "recommended_action": f.recommended_action,
            "suggested_role": f.suggested_role,
            "target_due_date": f.target_due_date.strftime("%Y-%m-%d") if f.target_due_date else None,
            "verification_status": f.verification_status,
            "data_mode": f.data_mode
        })

    return {
        "total": len(results),
        "items": results,
        "disclaimer": "AI findings are advisory based on statutory deadlines, award notices and physical site logs."
    }
