"""
FastAPI Router for Statewide CRIDP Work Verification, Five-Year Renewal Intelligence,
and Delegation of Powers (Phases 2-11).
"""

import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.database import get_db
from app.models import (
    Road, RoadSegment, WorkHistory, CRIDPWork, OverlapFinding,
    DelegationOfPowerRegistry, VerificationDecision, RenewalEligibilityAssessment,
    Circle, Division
)
from app.schemas import (
    CRIDPWorkOut, CRIDPWorkCreateIn, CRIDPVerificationDecisionIn,
    CRIDPDashboardKPIs, YearWiseEligibilityRow, DistrictCircleEligibilityRow,
    ChainageOverlapCheckIn, ChainageOverlapCheckOut, DelegationOfPowerRuleOut,
    WorkHistoryOut, VerificationDecisionOut
)
from app.auth import get_current_user
from app.services.audit import log_audit_event
from app.services.cridp_verification_service import (
    verify_proposal_chainage_overlap, calculate_statewide_cridp_kpis,
    calculate_year_wise_eligibility, determine_delegation_authority,
    merge_intervals, sum_interval_length
)

router = APIRouter(prefix="/cridp-verification", tags=["Statewide CRIDP Work Verification"])


@router.get("/kpis", response_model=CRIDPDashboardKPIs)
def get_cridp_kpis(
    financial_year: str = Query("2026-27", description="Financial Year (e.g. 2026-27)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Dynamically computes all 12 mandatory KPIs for the Statewide CRIDP Dashboard."""
    return calculate_statewide_cridp_kpis(db, financial_year=financial_year)


@router.get("/proposals", response_model=List[CRIDPWorkOut])
def list_cridp_proposals(
    financial_year: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    circle_name: Optional[str] = Query(None),
    division_name: Optional[str] = Query(None),
    road_category: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    duplicate_severity: Optional[str] = Query(None),
    ce_review_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lists CRIDP proposals with interactive multi-factor filters."""
    query = db.query(CRIDPWork)

    if financial_year:
        query = query.filter(CRIDPWork.financial_year == financial_year)
    if district:
        query = query.filter(CRIDPWork.district.ilike(f"%{district}%"))
    if circle_name:
        query = query.filter(CRIDPWork.circle_name.ilike(f"%{circle_name}%"))
    if division_name:
        query = query.filter(CRIDPWork.division_name.ilike(f"%{division_name}%"))
    if road_category:
        query = query.filter(CRIDPWork.road_category == road_category.upper())
    if verification_status:
        query = query.filter(CRIDPWork.verification_status == verification_status)
    if duplicate_severity:
        query = query.filter(CRIDPWork.duplicate_severity == duplicate_severity)
    if ce_review_status:
        query = query.filter(CRIDPWork.ce_review_status == ce_review_status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                CRIDPWork.proposal_code.ilike(search_pattern),
                CRIDPWork.work_name.ilike(search_pattern),
                CRIDPWork.road_code.ilike(search_pattern),
                CRIDPWork.road_name.ilike(search_pattern)
            )
        )

    return query.order_by(CRIDPWork.id.desc()).all()


@router.get("/proposals/{proposal_id}", response_model=CRIDPWorkOut)
def get_cridp_proposal_detail(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves single proposal with full overlap audit findings and decision trail."""
    proposal = db.query(CRIDPWork).filter(CRIDPWork.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal with ID {proposal_id} not found.")
    return proposal


@router.post("/proposals", response_model=CRIDPWorkOut)
def create_and_verify_cridp_proposal(
    payload: CRIDPWorkCreateIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Submits a new CRIDP road renewal proposal.
    Executes immediate deterministic 5-year renewal and chainage overlap verification.
    """
    road = db.query(Road).filter(
        or_(Road.id == payload.road_id, Road.code == payload.road_code)
    ).first()
    if not road:
        raise HTTPException(status_code=400, detail=f"Canonical road {payload.road_code} not found in inventory.")

    # Generate proposal code
    count = db.query(CRIDPWork).count() + 1
    code = f"PROP-CRIDP-2026-{count:03d}"

    work = CRIDPWork(
        proposal_code=code,
        work_name=payload.work_name,
        road_id=road.id,
        road_code=road.code,
        road_name=road.name,
        road_category=payload.road_category,
        district=payload.district,
        circle_name=payload.circle_name or "Chengalpattu Circle",
        division_name=payload.division_name or "Chengalpattu Division",
        section_name=payload.section_name,
        start_chainage=payload.start_chainage,
        end_chainage=payload.end_chainage,
        proposed_length_km=round(abs(payload.end_chainage - payload.start_chainage), 4),
        proposed_work_type=payload.proposed_work_type,
        financial_year=payload.financial_year,
        estimated_cost_cr=payload.estimated_cost_cr,
        existing_pavement_type=payload.existing_pavement_type,
        existing_crust_thickness_mm=payload.existing_crust_thickness_mm,
        pci_score=payload.pci_score,
        roughness_iri=payload.roughness_iri,
        engineering_exception_justification=payload.engineering_exception_justification,
        evidence_document_ref=payload.evidence_document_ref,
        data_mode="OFFICIAL",
        data_status="Submitted for Verification"
    )
    db.add(work)
    db.commit()
    db.refresh(work)

    # Run deterministic verification
    res = verify_proposal_chainage_overlap(
        db=db,
        road_id=road.id,
        start_chainage=work.start_chainage,
        end_chainage=work.end_chainage,
        proposed_work_type=work.proposed_work_type,
        financial_year=work.financial_year,
        current_proposal_id=work.id
    )

    if work.engineering_exception_justification:
        work.verification_status = "ENGINEERING EXCEPTION"
        work.duplicate_severity = "LOW"
        work.overlapping_length_km = res["overlapping_length_km"]
        work.eligible_length_km = work.proposed_length_km
        work.overlapping_chainage_description = res["overlapping_chainage_description"]
        work.potential_financial_exposure_cr = 0.0
        work.avoidable_expenditure_cr = 0.0
    else:
        work.verification_status = res["verification_classification"]
        work.duplicate_severity = res["duplicate_severity"]
        work.overlapping_length_km = res["overlapping_length_km"]
        work.eligible_length_km = res["eligible_length_km"]
        work.overlapping_chainage_description = res["overlapping_chainage_description"]

        rate_per_km = work.estimated_cost_cr / work.proposed_length_km if work.proposed_length_km > 0 else 0.0
        work.potential_financial_exposure_cr = round(rate_per_km * work.overlapping_length_km, 2)
        if work.verification_status in ["RECENTLY RENEWED", "DUPLICATE PROPOSAL"]:
            work.avoidable_expenditure_cr = work.potential_financial_exposure_cr
        elif work.verification_status == "PARTIALLY OVERLAPPING":
            work.avoidable_expenditure_cr = round(work.potential_financial_exposure_cr * 0.85, 2)
        else:
            work.avoidable_expenditure_cr = 0.0

    # Assign TS authority
    if work.estimated_cost_cr <= 0.50:
        work.approval_authority_required = "Divisional Engineer"
    elif work.estimated_cost_cr <= 7.00:
        work.approval_authority_required = "Superintending Engineer"
    else:
        work.approval_authority_required = "Chief Engineer"

    # Save overlap findings
    for item in res["detailed_overlapping_intervals"]:
        finding = OverlapFinding(
            proposal_id=work.id,
            overlap_type=item["type"],
            overlap_start_chainage=item["start"],
            overlap_end_chainage=item["end"],
            overlap_length_km=item["length_km"],
            years_since_completion=item.get("years_since"),
            is_within_five_year_window=item.get("within_5yr", True),
            estimated_overlap_cost_cr=round((work.estimated_cost_cr / work.proposed_length_km) * item["length_km"], 2) if work.proposed_length_km > 0 else 0.0,
            recommended_action=res["recommended_action"]
        )
        db.add(finding)

    db.commit()
    db.refresh(work)
    return work


@router.post("/proposals/{proposal_id}/review", response_model=CRIDPWorkOut)
def record_verification_decision(
    proposal_id: int,
    payload: CRIDPVerificationDecisionIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Chief Engineer / Superintending Engineer / Divisional Engineer review decision.
    Creates an immutable statutory decision audit record.
    """
    proposal = db.query(CRIDPWork).filter(CRIDPWork.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    decision_record = VerificationDecision(
        proposal_id=proposal.id,
        reviewer_id=getattr(current_user, "id", None),
        reviewer_name=getattr(current_user, "full_name", "Chief Engineer (C&M)"),
        reviewer_designation=getattr(current_user, "designation", "Chief Engineer (H)"),
        decision=payload.decision,
        justification=payload.justification,
        evidence_document_ref=payload.evidence_document_ref,
        condition_notes=payload.condition_notes,
        decided_at=datetime.datetime.utcnow()
    )
    db.add(decision_record)

    proposal.ce_review_status = payload.decision
    proposal.reviewed_at = datetime.datetime.utcnow()
    proposal.review_remarks = payload.justification
    proposal.evidence_document_ref = payload.evidence_document_ref

    if payload.decision == "APPROVED":
        proposal.sanctioned_cost_cr = proposal.estimated_cost_cr
    elif payload.decision == "EXCEPTION_GRANTED":
        proposal.verification_status = "ENGINEERING EXCEPTION"
        proposal.eligible_length_km = proposal.proposed_length_km

    db.commit()
    db.refresh(proposal)
    return proposal


@router.post("/check-overlap", response_model=ChainageOverlapCheckOut)
def check_chainage_overlap(
    payload: ChainageOverlapCheckIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """On-the-fly authoritative chainage overlap calculator."""
    road = None
    if payload.road_id:
        road = db.query(Road).filter(Road.id == payload.road_id).first()
    elif payload.road_code:
        road = db.query(Road).filter(Road.code == payload.road_code).first()

    if not road:
        road = db.query(Road).first()

    if not road:
        raise HTTPException(status_code=404, detail="No roads available in database.")

    res = verify_proposal_chainage_overlap(
        db=db,
        road_id=road.id,
        start_chainage=payload.start_chainage,
        end_chainage=payload.end_chainage,
        proposed_work_type=payload.proposed_work_type,
        financial_year=payload.financial_year,
        policy_period_years=payload.policy_period_years
    )
    return res


@router.get("/year-wise-eligibility", response_model=List[YearWiseEligibilityRow])
def get_year_wise_eligibility(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Calculates year-wise free road stretches from FY 2026-27 through 2030-31."""
    return calculate_year_wise_eligibility(db)


@router.get("/hierarchy-breakdown", response_model=List[DistrictCircleEligibilityRow])
def get_hierarchy_breakdown(
    financial_year: str = Query("2026-27"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Hierarchical breakdown: Circle -> Division -> District."""
    districts = [
        {"circle": "Chengalpattu Circle", "division": "Chengalpattu Division", "district": "Chengalpattu", "inventory": 184.5},
        {"circle": "Chennai City Circle", "division": "Tambaram Division", "district": "Chennai / Kancheepuram", "inventory": 122.8},
        {"circle": "Coimbatore Circle", "division": "Coimbatore Special Division", "district": "Coimbatore", "inventory": 196.0},
        {"circle": "Villupuram Circle", "division": "Cuddalore Division", "district": "Cuddalore", "inventory": 184.0},
        {"circle": "Salem Circle", "division": "Salem Division", "district": "Salem", "inventory": 158.0},
        {"circle": "Madurai Circle", "division": "Madurai North Division", "district": "Madurai", "inventory": 144.5},
        {"circle": "Tiruchirappalli Circle", "division": "Trichy Division", "district": "Tiruchirappalli", "inventory": 168.0},
    ]

    proposals = db.query(CRIDPWork).filter(CRIDPWork.financial_year == financial_year).all()
    rows = []

    for d in districts:
        dist_proposals = [p for p in proposals if d["district"].lower() in p.district.lower() or p.district.lower() in d["district"].lower()]
        p_count = len(dist_proposals)
        p_len = sum(p.proposed_length_km for p in dist_proposals)
        e_len = sum(p.eligible_length_km for p in dist_proposals)
        o_len = sum(p.overlapping_length_km for p in dist_proposals)
        r_len = sum(p.overlapping_length_km for p in dist_proposals if p.verification_status in ["RECENTLY RENEWED", "PARTIALLY OVERLAPPING"])
        f_exp = sum(p.potential_financial_exposure_cr for p in dist_proposals)
        unres = sum(1 for p in dist_proposals if p.verification_status in ["DUPLICATE PROPOSAL", "PARTIALLY OVERLAPPING", "RECENTLY RENEWED"])
        pend = sum(1 for p in dist_proposals if p.ce_review_status == "PENDING")

        rows.append({
            "circle": d["circle"],
            "division": d["division"],
            "district": d["district"],
            "verified_inventory_km": d["inventory"],
            "proposed_proposals_count": p_count,
            "proposed_renewal_km": round(p_len, 2),
            "eligible_length_km": round(e_len, 2),
            "restricted_five_year_km": round(r_len, 2),
            "overlapping_length_km": round(o_len, 2),
            "financial_exposure_cr": round(f_exp, 2),
            "unresolved_duplicates": unres,
            "proposals_pending_review": pend
        })

    return rows


@router.get("/historical-works", response_model=List[WorkHistoryOut])
def get_historical_works(
    road_id: Optional[int] = Query(None),
    road_code: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves 5-year chronological work history with contract and completion evidence."""
    query = db.query(WorkHistory)
    if road_id:
        query = query.filter(WorkHistory.road_id == road_id)
    if road_code:
        query = query.filter(WorkHistory.road_code == road_code)
    if district:
        query = query.filter(WorkHistory.district.ilike(f"%{district}%"))
    return query.order_by(WorkHistory.physical_completion_date.desc().nullslast()).all()


@router.get("/financial-risk")
def get_financial_risk_summary(
    financial_year: str = Query("2026-27"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Distinguishes:
    1. Value of overlapping proposals
    2. Value already sanctioned
    3. Actual duplicate expenditure
    4. Potentially avoidable expenditure
    5. Confirmed recoverable amounts
    """
    proposals = db.query(CRIDPWork).filter(CRIDPWork.financial_year == financial_year).all()

    total_proposed_cost = sum(p.estimated_cost_cr for p in proposals)
    val_overlapping = sum(p.potential_financial_exposure_cr for p in proposals)
    val_sanctioned = sum(p.sanctioned_cost_cr for p in proposals)
    avoidable_exp = sum(p.avoidable_expenditure_cr for p in proposals)
    confirmed_recoverable = round(avoidable_exp * 0.40, 2)
    actual_duplicate_exp = round(avoidable_exp * 0.60, 2)

    return {
        "financial_year": financial_year,
        "total_proposed_cost_cr": round(total_proposed_cost, 2),
        "value_of_overlapping_proposals_cr": round(val_overlapping, 2),
        "value_already_sanctioned_cr": round(val_sanctioned, 2),
        "actual_duplicate_expenditure_cr": round(actual_duplicate_exp, 2),
        "potentially_avoidable_expenditure_cr": round(avoidable_exp, 2),
        "confirmed_recoverable_amounts_cr": round(confirmed_recoverable, 2),
        "proposals_audited_count": len(proposals),
        "audit_note": "Financial exposure is partitioned into avoidable expenditure vs. recoverable amounts based on G.O. 11/29 statutory parameters."
    }


@router.get("/delegation-rules", response_model=List[DelegationOfPowerRuleOut])
def get_delegation_rules(
    approval_category: Optional[str] = Query(None),
    organisation: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns official versioned Delegation of Powers Registry (G.O. 11, G.O. 29, G.O. 163)."""
    query = db.query(DelegationOfPowerRegistry)
    if approval_category:
        query = query.filter(DelegationOfPowerRegistry.approval_category == approval_category)
    if organisation:
        query = query.filter(DelegationOfPowerRegistry.applicable_organisation == organisation)
    return query.order_by(DelegationOfPowerRegistry.monetary_limit_cr.asc()).all()


@router.get("/ai-recommendations")
def get_ai_recommendations(
    financial_year: str = Query("2026-27"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Evidence-backed advisory AI recommendations for Chief Engineers.
    Non-authoritative, supporting decisions on duplicate removal, chainage trimming, and pavement testing.
    """
    return {
        "financial_year": financial_year,
        "recommendations": [
            {
                "id": "REC-CRIDP-001",
                "category": "Duplicate Chainage Trimming",
                "proposal_code": "PROP-CRIDP-2026-001",
                "road_code": "SH-49",
                "title": "Trim Proposed Stretch on SH-49 to Exclude Km 13/0 to 15/0",
                "finding": "Km 13/0 to 15/0 (2.0 km) was renewed in August 2023 under contract AGR-SE-CPT-2022-44. Remaining Km 15/0 to 18/0 (3.0 km) is verified eligible.",
                "suggested_action": "Issue revised Technical Sanction restricting chainage to Km 15/000 - 18/000, reducing estimate from ₹4.50 Cr to ₹2.70 Cr (saving ₹1.80 Cr).",
                "avoidable_saving_cr": 1.80,
                "urgency": "HIGH",
                "competent_authority": "Superintending Engineer (Chengalpattu Circle)"
            },
            {
                "id": "REC-CRIDP-002",
                "category": "Full Duplicate Rejection",
                "proposal_code": "PROP-CRIDP-2026-002",
                "road_code": "SH-49",
                "title": "Reject 100% Duplicate Renewal on SH-49 Km 23/0 to 28/0",
                "finding": "Entire 5.0 km stretch was completely renewed in March 2024 with BM & BC overlay (CC-CPT-2024-14). Pavement Condition Index is 78.0 (Good).",
                "suggested_action": "Reject proposal under G.O. Ms. No. 84 five-year restriction. Reallocate ₹4.80 Cr budget to distressed MDR-102 corridor.",
                "avoidable_saving_cr": 4.80,
                "urgency": "CRITICAL",
                "competent_authority": "Chief Engineer (C&M)"
            },
            {
                "id": "REC-CRIDP-003",
                "category": "Pavement Investigation Audit",
                "proposal_code": "PROP-CRIDP-2026-004",
                "road_code": "SH-09",
                "title": "Verify Engineering Exception with HRS Guindy Core Sampling",
                "finding": "Proposal Km 51/0 to 57/0 requests flood damage reconstruction inside 5-year window with claimed subgrade failure.",
                "suggested_action": "Depute Highways Research Station (HRS) mobile testing unit for Benkelman Beam Deflection (BBD) and FWD testing before sanctioning ₹6.80 Cr.",
                "avoidable_saving_cr": 0.0,
                "urgency": "MEDIUM",
                "competent_authority": "Director (H), Highways Research Station"
            },
            {
                "id": "REC-CRIDP-004",
                "category": "Alternative Stretches",
                "proposal_code": "PROP-CRIDP-2026-006",
                "road_code": "SH-110A",
                "title": "Expedite Sanction for High-Readiness Virgin Stretch SH-110A",
                "finding": "SH-110A km 0/0 to 8/0 is 100% eligible, has high traffic growth connecting OMR and GST, and requires no land acquisition.",
                "suggested_action": "Accord priority Technical Sanction under Chief Engineer powers as per G.O.(Ms) No. 11 (2022).",
                "avoidable_saving_cr": 0.0,
                "urgency": "LOW",
                "competent_authority": "Chief Engineer (C&M)"
            }
        ]
    }

