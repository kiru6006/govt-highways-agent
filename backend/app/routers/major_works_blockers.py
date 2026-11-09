import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, Project, MajorWorksProjectReviewSnapshot, ProjectBlocker,
    DelayInvestigation, LossPreventionLedgerRecord, MitigationRecommendation,
    PreConstructionGateCheck, EntityRelationship
)
from app.schemas import (
    MajorWorksProjectReviewOut, MajorWorksPortfolioOverviewOut,
    ProjectBlockerIn, ProjectBlockerOut, ProjectBlockerStatusUpdateIn,
    DelayInvestigationOut, LossPreventionLedgerRecordOut, LossPreventionLedgerDashboardOut,
    MitigationRecommendationOut, MitigationApproveIn,
    PreConstructionGateCheckOut, PreConstructionGateOverrideIn,
    MajorWorksCMSummaryOut, MajorWorksAIQueryIn, MajorWorksAIQueryOut
)

router = APIRouter(prefix="/major-works", tags=["Major Works ₹50 Cr+ & Blocker Mitigation"])

# -------------------------------------------------------------
# 1. MAJOR WORKS ₹50 CR+ PORTFOLIO REVIEW
# -------------------------------------------------------------

@router.get("/portfolio", response_model=MajorWorksPortfolioOverviewOut)
def get_major_works_portfolio(
    circle: Optional[str] = None,
    division: Optional[str] = None,
    risk_level: Optional[str] = None,
    delayed_only: bool = False,
    critical_blockers_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MajorWorksProjectReviewSnapshot)
    if circle:
        query = query.filter(MajorWorksProjectReviewSnapshot.circle_name.ilike(f"%{circle}%"))
    if division:
        query = query.filter(MajorWorksProjectReviewSnapshot.division_name.ilike(f"%{division}%"))
    if risk_level:
        query = query.filter(MajorWorksProjectReviewSnapshot.risk_level == risk_level)
    if delayed_only:
        query = query.filter(MajorWorksProjectReviewSnapshot.completion_delay_days > 0)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                MajorWorksProjectReviewSnapshot.project_name.ilike(s),
                MajorWorksProjectReviewSnapshot.source_project_id.ilike(s),
                MajorWorksProjectReviewSnapshot.contractor_name.ilike(s),
                MajorWorksProjectReviewSnapshot.road_or_bridge_details.ilike(s)
            )
        )

    all_works = query.order_by(desc(MajorWorksProjectReviewSnapshot.contract_value_cr)).all()

    # Preload blocker stats
    blockers = db.query(ProjectBlocker).all()
    blocker_map = {}
    critical_map = {}
    exposure_map = {}
    for b in blockers:
        mw_id = b.major_work_id
        if mw_id:
            blocker_map[mw_id] = blocker_map.get(mw_id, 0) + 1
            if b.is_critical_path and b.current_status in ["ACTIVE_BLOCKER", "INVESTIGATION_ONGOING", "ESCALATED"]:
                critical_map[mw_id] = critical_map.get(mw_id, 0) + 1
            if b.financial_exposure_cr:
                exposure_map[mw_id] = exposure_map.get(mw_id, 0.0) + b.financial_exposure_cr

    out_items = []
    total_sanctioned = 0.0
    total_contract = 0.0
    total_expenditure = 0.0
    total_delay_days = 0
    delayed_over_180_count = 0
    projects_with_critical_count = 0

    for w in all_works:
        item = MajorWorksProjectReviewOut.model_validate(w)
        item.active_blockers_count = blocker_map.get(w.id, 0)
        item.critical_blockers_count = critical_map.get(w.id, 0)
        item.financial_exposure_cr = round(exposure_map.get(w.id, 0.0), 2)

        if critical_blockers_only and item.critical_blockers_count == 0:
            continue

        out_items.append(item)
        total_sanctioned += w.technical_sanction_cr
        total_contract += w.contract_value_cr
        total_expenditure += w.expenditure_cr
        total_delay_days += w.completion_delay_days
        if w.completion_delay_days > 180:
            delayed_over_180_count += 1
        if item.critical_blockers_count > 0:
            projects_with_critical_count += 1

    count = len(out_items)
    avg_phys = round(sum(i.physical_progress_pct for i in out_items) / count, 1) if count else 0.0
    avg_fin = round(sum(i.financial_progress_pct for i in out_items) / count, 1) if count else 0.0

    # Loss prevention ledger calculations
    ledger_records = db.query(LossPreventionLedgerRecord).all()
    actual_addl_exp = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "ACTUAL_ADDITIONAL_EXPENDITURE"), 2)
    forecast_exp = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "FORECAST_INCREMENTAL_COST"), 2)
    avoidable_cost = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "POTENTIALLY_AVOIDABLE_COST"), 2)

    return MajorWorksPortfolioOverviewOut(
        total_major_works_count=count,
        total_sanctioned_value_cr=round(total_sanctioned, 2),
        total_contract_value_cr=round(total_contract, 2),
        total_expenditure_cr=round(total_expenditure, 2),
        avg_physical_progress_pct=avg_phys,
        avg_financial_progress_pct=avg_fin,
        projects_with_critical_blockers_count=projects_with_critical_count,
        projects_delayed_over_180_days_count=delayed_over_180_count,
        total_completion_delay_days=total_delay_days,
        total_verified_actual_additional_cost_cr=actual_addl_exp,
        total_forecast_financial_exposure_cr=forecast_exp,
        total_potentially_avoidable_cost_cr=avoidable_cost,
        unresolved_interdepartmental_issues_count=len([b for b in blockers if b.external_department_or_contractor and b.current_status != "CLOSED"]),
        data_freshness_timestamp=datetime.datetime.now(datetime.UTC).isoformat(),
        simulated_data_badge="SIMULATED",
        items=out_items
    )


@router.get("/portfolio/{id}")
def get_major_work_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = None
    if id.isdigit():
        work = db.query(MajorWorksProjectReviewSnapshot).filter(MajorWorksProjectReviewSnapshot.id == int(id)).first()
    if not work:
        # Try matching source_project_id
        work = db.query(MajorWorksProjectReviewSnapshot).filter(MajorWorksProjectReviewSnapshot.source_project_id == str(id)).first()
    if not work:
        raise HTTPException(status_code=404, detail=f"Major Work #{id} not found in ₹50 Cr+ Registry")

    item = MajorWorksProjectReviewOut.model_validate(work)

    # Associated blockers
    blockers = db.query(ProjectBlocker).filter(
        or_(ProjectBlocker.major_work_id == work.id, ProjectBlocker.project_id == work.canonical_project_id)
    ).all()
    blocker_outs = [ProjectBlockerOut.model_validate(b) for b in blockers]

    # Associated investigation
    inv = db.query(DelayInvestigation).filter(
        or_(DelayInvestigation.major_work_id == work.id, DelayInvestigation.project_id == work.canonical_project_id)
    ).first()
    inv_out = DelayInvestigationOut.model_validate(inv) if inv else None

    # Associated ledger records
    ledger = db.query(LossPreventionLedgerRecord).filter(
        or_(LossPreventionLedgerRecord.major_work_id == work.id, LossPreventionLedgerRecord.project_id == work.canonical_project_id)
    ).all()
    ledger_outs = [LossPreventionLedgerRecordOut.model_validate(l) for l in ledger]

    # Associated mitigations
    mitigations = db.query(MitigationRecommendation).filter(
        or_(MitigationRecommendation.major_work_id == work.id, MitigationRecommendation.project_id == work.canonical_project_id)
    ).all()
    mitigation_outs = [MitigationRecommendationOut.model_validate(m) for m in mitigations]

    # Associated gates
    gates = db.query(PreConstructionGateCheck).filter(
        or_(PreConstructionGateCheck.major_work_id == work.id, PreConstructionGateCheck.project_id == work.canonical_project_id)
    ).all()
    gate_outs = [PreConstructionGateCheckOut.model_validate(g) for g in gates]

    return {
        "work": item,
        "blockers": blocker_outs,
        "investigation": inv_out,
        "financial_ledger": ledger_outs,
        "mitigations": mitigation_outs,
        "pre_construction_gates": gate_outs,
        "simulated_data_badge": "SIMULATED"
    }


# -------------------------------------------------------------
# 2. PROJECT BLOCKER REGISTER (17 CATEGORIES)
# -------------------------------------------------------------

@router.get("/blockers", response_model=List[ProjectBlockerOut])
def list_project_blockers(
    project_id: Optional[int] = None,
    major_work_id: Optional[int] = None,
    category: Optional[str] = None,
    is_critical_path: Optional[bool] = None,
    current_status: Optional[str] = None,
    resolving_authority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ProjectBlocker)
    if project_id:
        query = query.filter(ProjectBlocker.project_id == project_id)
    if major_work_id:
        query = query.filter(ProjectBlocker.major_work_id == major_work_id)
    if category:
        query = query.filter(ProjectBlocker.category == category)
    if is_critical_path is not None:
        query = query.filter(ProjectBlocker.is_critical_path == is_critical_path)
    if current_status:
        query = query.filter(ProjectBlocker.current_status == current_status)
    if resolving_authority:
        query = query.filter(ProjectBlocker.responsible_resolution_authority.ilike(f"%{resolving_authority}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                ProjectBlocker.blocker_code.ilike(s),
                ProjectBlocker.description.ilike(s),
                ProjectBlocker.primary_cause.ilike(s),
                ProjectBlocker.responsible_resolution_authority.ilike(s),
                ProjectBlocker.assigned_action_owner.ilike(s)
            )
        )

    blockers = query.order_by(desc(ProjectBlocker.is_critical_path), desc(ProjectBlocker.days_affected)).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    mw_map = {w.id: w.project_name for w in db.query(MajorWorksProjectReviewSnapshot).all()}

    results = []
    for b in blockers:
        out = ProjectBlockerOut.model_validate(b)
        out.project_name = mw_map.get(b.major_work_id) or proj_map.get(b.project_id) or "Highways Corridor"
        results.append(out)

    return results


@router.post("/blockers", response_model=ProjectBlockerOut, status_code=status.HTTP_201_CREATED)
def create_project_blocker(
    payload: ProjectBlockerIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.now(datetime.UTC)
    b_code = f"BLK-{now.strftime('%Y%m')}-{db.query(ProjectBlocker).count() + 1:04d}"

    blocker = ProjectBlocker(
        blocker_code=b_code,
        project_id=payload.project_id,
        major_work_id=payload.major_work_id,
        work_package_id=payload.work_package_id,
        chainage_location=payload.chainage_location,
        category=payload.category,
        subcategory=payload.subcategory,
        description=payload.description,
        date_identified=now,
        blocker_start_date=now,
        current_status="ACTIVE_BLOCKER",
        affected_milestone=payload.affected_milestone,
        is_critical_path=payload.is_critical_path,
        primary_cause=payload.primary_cause,
        contributing_causes=payload.contributing_causes,
        responsible_resolution_authority=payload.responsible_resolution_authority,
        assigned_action_owner=payload.assigned_action_owner,
        external_department_or_contractor=payload.external_department_or_contractor,
        supporting_evidence=payload.supporting_evidence,
        financial_exposure_cr=payload.financial_exposure_cr,
        is_financial_exposure_quantified=payload.is_financial_exposure_quantified,
        required_mitigation=payload.required_mitigation,
        target_resolution_date=payload.target_resolution_date,
        escalation_level=payload.escalation_level or "DIVISION",
        last_update=now,
        created_at=now,
        updated_at=now
    )
    db.add(blocker)
    db.commit()
    db.refresh(blocker)

    # Automatically create Universal Relationship
    rel = EntityRelationship(
        source_type="PROJECT",
        source_id=payload.project_id,
        target_type="PROJECT_BLOCKER",
        target_id=blocker.id,
        relationship_type="IMPEDED_BY_BLOCKER",
        relationship_category="GOVERNANCE_CONTROL",
        authority="Tamil Nadu Highways Department & Ministerial Review",
        source_reference="Major Works Project Blocker Register",
        verification_status="VERIFIED_OFFICIAL",
        valid_from=now
    )
    db.add(rel)
    db.commit()

    out = ProjectBlockerOut.model_validate(blocker)
    proj = db.query(Project).filter(Project.id == payload.project_id).first()
    out.project_name = proj.title if proj else "Project"
    return out


@router.put("/blockers/{id}/status", response_model=ProjectBlockerOut)
def update_blocker_status(
    id: int,
    payload: ProjectBlockerStatusUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    blocker = db.query(ProjectBlocker).filter(ProjectBlocker.id == id).first()
    if not blocker:
        raise HTTPException(status_code=404, detail="Blocker not found")

    now = datetime.datetime.now(datetime.UTC)
    blocker.current_status = payload.status
    if payload.closure_remarks:
        blocker.closure_remarks = payload.closure_remarks
    if payload.closure_evidence:
        blocker.closure_evidence = payload.closure_evidence
    blocker.last_update = now
    blocker.updated_at = now
    db.commit()
    db.refresh(blocker)

    out = ProjectBlockerOut.model_validate(blocker)
    proj = db.query(Project).filter(Project.id == blocker.project_id).first()
    out.project_name = proj.title if proj else "Project"
    return out


# -------------------------------------------------------------
# 3. DELAY INVESTIGATION ENGINE
# -------------------------------------------------------------

@router.get("/investigations/{project_id}", response_model=DelayInvestigationOut)
def get_delay_investigation(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(DelayInvestigation).filter(
        or_(DelayInvestigation.project_id == project_id, DelayInvestigation.major_work_id == project_id)
    ).first()

    if not inv:
        # Generate on-the-fly investigation if project exists
        p = db.query(Project).filter(Project.id == project_id).first()
        mw = db.query(MajorWorksProjectReviewSnapshot).filter(
            or_(MajorWorksProjectReviewSnapshot.id == project_id, MajorWorksProjectReviewSnapshot.canonical_project_id == project_id)
        ).first()

        if not p and not mw:
            raise HTTPException(status_code=404, detail="Project not found")

        now = datetime.datetime.now(datetime.UTC)
        baseline = (mw.agreement_completion_date if mw else p.planned_completion_date) or now
        forecast = (mw.estimated_completion_date if mw else p.target_completion_date) or now
        diff_days = max((forecast - baseline).days, 0)

        inv = DelayInvestigation(
            investigation_code=f"INV-{now.strftime('%Y')}-{project_id:04d}",
            project_id=p.id if p else (mw.canonical_project_id or 1),
            major_work_id=mw.id if mw else None,
            baseline_completion_date=baseline,
            current_forecast_completion_date=forecast,
            delay_days_from_baseline=diff_days,
            milestone_health_verdict="PROGRESS_CONFLICT" if diff_days > 90 else "ON_TRACK",
            physical_vs_financial_variance_pct=round(abs((mw.physical_progress_pct if mw else p.physical_progress_pct) - (mw.financial_progress_pct if mw else p.financial_progress_pct)), 1),
            critical_path_assessment="Critical path assessment required: compare approved baseline network against current site obstruction log.",
            preliminary_findings="Delay identified between baseline agreement date and forecast completion date. Causal assessment requires formal documentation review.",
            unverified_assumptions="Do not attribute delay solely to single stakeholder (Railways, Revenue, or Contractor) without approved EOT and joint logbooks.",
            responsible_investigator_name="State Project Audit Cell",
            investigation_status="IN_PROGRESS",
            created_at=now,
            updated_at=now
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)

    out = DelayInvestigationOut.model_validate(inv)
    proj = db.query(Project).filter(Project.id == inv.project_id).first()
    out.project_name = proj.title if proj else "Project"
    return out


# -------------------------------------------------------------
# 4. FINANCIAL EXPOSURE & LOSS PREVENTION LEDGER (12 ACCOUNTS)
# -------------------------------------------------------------

@router.get("/financial-ledger", response_model=LossPreventionLedgerDashboardOut)
def get_loss_prevention_ledger(
    project_id: Optional[int] = None,
    major_work_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LossPreventionLedgerRecord)
    if project_id:
        query = query.filter(LossPreventionLedgerRecord.project_id == project_id)
    if major_work_id:
        query = query.filter(LossPreventionLedgerRecord.major_work_id == major_work_id)

    records = query.order_by(LossPreventionLedgerRecord.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    mw_map = {w.id: w.project_name for w in db.query(MajorWorksProjectReviewSnapshot).all()}

    # Compute 12 metrics separately to prevent double counting
    metric_totals = {}
    for r in records:
        if r.is_quantified and r.amount_cr is not None:
            metric_totals[r.account_name] = round(metric_totals.get(r.account_name, 0.0) + r.amount_cr, 2)
        else:
            metric_totals[r.account_name] = metric_totals.get(r.account_name, 0.0)

    summary = {
        "actual_additional_expenditure_cr": metric_totals.get("ACTUAL_ADDITIONAL_EXPENDITURE", 0.0),
        "contractor_claims_submitted_cr": metric_totals.get("CONTRACTOR_CLAIMS_SUBMITTED", 0.0),
        "claims_admitted_cr": metric_totals.get("CLAIMS_ADMITTED", 0.0),
        "claims_disputed_cr": metric_totals.get("CLAIMS_DISPUTED", 0.0),
        "idle_resource_expenditure_cr": metric_totals.get("IDLE_RESOURCE_COST", 0.0),
        "contractual_escalation_10ca_cr": metric_totals.get("CONTRACTUAL_PRICE_ESCALATION_10CA", 0.0),
        "additional_financing_costs_cr": metric_totals.get("ADDITIONAL_FINANCING_COST", 0.0),
        "legal_expenses_cr": metric_totals.get("LEGAL_EXPENSES", 0.0),
        "forecast_incremental_expenditure_cr": metric_totals.get("FORECAST_INCREMENTAL_COST", 0.0),
        "potentially_avoidable_future_expenditure_cr": metric_totals.get("POTENTIALLY_AVOIDABLE_COST", 0.0),
        "confirmed_recoverable_amounts_cr": metric_totals.get("CONFIRMED_RECOVERABLE", 0.0),
        "delayed_public_service_benefits_days": int(metric_totals.get("DELAYED_PUBLIC_BENEFIT_DAYS", 0)),
        "accounting_guard_statement": "Statutory Financial Guard: Gross project sanctioned values are never conflated with financial loss. Forecast loss synthesizes admitted claims + Clause 10CA escalation + verified financing + legal defense costs without double counting."
    }

    out_records = []
    for r in records:
        out = LossPreventionLedgerRecordOut.model_validate(r)
        out.project_name = mw_map.get(r.major_work_id) or proj_map.get(r.project_id) or "Highways Corridor"
        out_records.append(out)

    return LossPreventionLedgerDashboardOut(
        summary=summary,
        records=out_records,
        simulated_data_badge="SIMULATED"
    )


# -------------------------------------------------------------
# 5. MITIGATION RECOMMENDATION ENGINE
# -------------------------------------------------------------

@router.get("/mitigations", response_model=List[MitigationRecommendationOut])
def get_mitigation_recommendations(
    project_id: Optional[int] = None,
    major_work_id: Optional[int] = None,
    approval_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MitigationRecommendation)
    if project_id:
        query = query.filter(MitigationRecommendation.project_id == project_id)
    if major_work_id:
        query = query.filter(MitigationRecommendation.major_work_id == major_work_id)
    if approval_status:
        query = query.filter(MitigationRecommendation.human_approval_status == approval_status)

    items = query.order_by(desc(MitigationRecommendation.avoidable_cost_cr)).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    mw_map = {w.id: w.project_name for w in db.query(MajorWorksProjectReviewSnapshot).all()}
    blocker_map = {b.id: b.blocker_code for b in db.query(ProjectBlocker).all()}

    results = []
    for m in items:
        out = MitigationRecommendationOut.model_validate(m)
        out.project_name = mw_map.get(m.major_work_id) or proj_map.get(m.project_id) or "Highways Corridor"
        out.blocker_code = blocker_map.get(m.blocker_id)
        results.append(out)

    return results


@router.post("/mitigations/{id}/approve", response_model=MitigationRecommendationOut)
def approve_mitigation_recommendation(
    id: int,
    payload: MitigationApproveIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mit = db.query(MitigationRecommendation).filter(MitigationRecommendation.id == id).first()
    if not mit:
        raise HTTPException(status_code=404, detail="Mitigation recommendation not found")

    now = datetime.datetime.now(datetime.UTC)
    mit.human_approval_status = "APPROVED" if payload.approved else "REJECTED"
    mit.approved_by_officer = payload.approving_officer or current_user.full_name
    mit.approval_date = now
    mit.approval_notes = payload.approval_notes
    mit.updated_at = now
    db.commit()
    db.refresh(mit)

    out = MitigationRecommendationOut.model_validate(mit)
    proj = db.query(Project).filter(Project.id == mit.project_id).first()
    out.project_name = proj.title if proj else "Project"
    return out


# -------------------------------------------------------------
# 6. PRE-CONSTRUCTION RISK GATES
# -------------------------------------------------------------

@router.get("/pre-construction-gates", response_model=List[PreConstructionGateCheckOut])
def get_pre_construction_gates(
    project_id: Optional[int] = None,
    major_work_id: Optional[int] = None,
    readiness_state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PreConstructionGateCheck)
    if project_id:
        query = query.filter(PreConstructionGateCheck.project_id == project_id)
    if major_work_id:
        query = query.filter(PreConstructionGateCheck.major_work_id == major_work_id)
    if readiness_state:
        query = query.filter(PreConstructionGateCheck.readiness_state == readiness_state)

    gates = query.order_by(PreConstructionGateCheck.id.asc()).all()
    proj_map = {p.id: p.title for p in db.query(Project).all()}
    mw_map = {w.id: w.project_name for w in db.query(MajorWorksProjectReviewSnapshot).all()}

    results = []
    for g in gates:
        out = PreConstructionGateCheckOut.model_validate(g)
        out.project_name = mw_map.get(g.major_work_id) or proj_map.get(g.project_id) or "Highways Corridor"
        results.append(out)

    return results


@router.post("/pre-construction-gates/{id}/override", response_model=PreConstructionGateCheckOut)
def override_pre_construction_gate(
    id: int,
    payload: PreConstructionGateOverrideIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    gate = db.query(PreConstructionGateCheck).filter(PreConstructionGateCheck.id == id).first()
    if not gate:
        raise HTTPException(status_code=404, detail="Gate check not found")

    # Statutory Prohibition: Never bypass binding court stay
    if gate.court_restrictions_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"STATUTORY PROHIBITION: Binding judicial order/injunction in force ({gate.operative_stay_details}). Administrative override strictly barred under High Court jurisdiction."
        )

    now = datetime.datetime.now(datetime.UTC)
    gate.authorized_override_status = "REVIEWED_AND_PERMITTED"
    gate.override_authority = payload.override_authority
    gate.override_justification = payload.justification
    gate.override_date = now
    gate.readiness_state = "AMBER"  # Downgrades to conditional access
    gate.updated_at = now
    db.commit()
    db.refresh(gate)

    out = PreConstructionGateCheckOut.model_validate(gate)
    proj = db.query(Project).filter(Project.id == gate.project_id).first()
    out.project_name = proj.title if proj else "Project"
    return out


# -------------------------------------------------------------
# 7. CM & MINISTERIAL DASHBOARD EXECUTIVE SUMMARY
# -------------------------------------------------------------

@router.get("/cm-summary", response_model=MajorWorksCMSummaryOut)
def get_major_works_cm_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    works = db.query(MajorWorksProjectReviewSnapshot).all()
    blockers = db.query(ProjectBlocker).all()
    ledger_records = db.query(LossPreventionLedgerRecord).all()

    # Filter critical blockers
    crit_blockers = [b for b in blockers if b.is_critical_path and b.current_status != "CLOSED"]
    crit_proj_ids = set(b.major_work_id for b in crit_blockers if b.major_work_id)
    ext_proj_count = len([w for w in works if w.completion_delay_days > 0])

    # Interdepartmental dependencies
    interdept = [
        {
            "department": "Southern Railway",
            "open_blockers": len([b for b in blockers if "railway" in b.category.lower() or "railway" in (b.responsible_resolution_authority or "").lower()]),
            "impacted_projects_count": len(set(b.major_work_id for b in blockers if "railway" in b.category.lower() or "railway" in (b.responsible_resolution_authority or "").lower())),
            "lead_authority": "Chief Bridge Engineer & Divisional Railway Manager",
            "urgency": "CRITICAL"
        },
        {
            "department": "Revenue Department",
            "open_blockers": len([b for b in blockers if "revenue" in b.category.lower() or "land" in b.category.lower()]),
            "impacted_projects_count": len(set(b.major_work_id for b in blockers if "revenue" in b.category.lower() or "land" in b.category.lower())),
            "lead_authority": "District Collectors & Special DROs",
            "urgency": "ELEVATED"
        },
        {
            "department": "TANGEDCO / TWAD",
            "open_blockers": len([b for b in blockers if "utility" in b.category.lower()]),
            "impacted_projects_count": len(set(b.major_work_id for b in blockers if "utility" in b.category.lower())),
            "lead_authority": "Superintending Engineers (Distribution & Water)",
            "urgency": "ROUTINE"
        }
    ]

    railway_risks = [
        {
            "project_name": "ROB at LC-13, Thirunindravur–Veppampattu (Project 5566)",
            "source_id": "5566",
            "delay_days": 317,
            "railway_issue": "General Arrangement Drawing (GAD) CRS sanction & Railway-side work verification pending",
            "expenditure_cr": 38.36,
            "physical_pct": 78.0,
            "status": "Railway coordination records required to establish critical path"
        },
        {
            "project_name": "ROB at LC-112, Vandalur-Nemilichery Outer Ring Road",
            "source_id": "5570",
            "delay_days": 180,
            "railway_issue": "Power block allocation for composite girder launching across electrified tracks",
            "expenditure_cr": 54.20,
            "physical_pct": 65.0,
            "status": "Joint Safety Commissioner inspection scheduled"
        }
    ]

    land_lit_risks = [
        {
            "project_name": "Tambaram Eastern Bypass (Km 0/0 to 8/4)",
            "court_stay_active": True,
            "stay_details": "Madras High Court interim injunction on Survey 88/3B",
            "exposure_cr": 14.20,
            "status": "Urgent vacate stay petition listed before Division Bench"
        },
        {
            "project_name": "Anna Nagar Roundtana Grade Separator",
            "court_stay_active": True,
            "stay_details": "Commercial frontage dispossession stayed under Sec 15 challenge",
            "exposure_cr": 8.50,
            "status": "Joint settlement negotiation underway"
        }
    ]

    # Reference Case 5566 Dossier
    ref_5566 = {
        "project_id": "5566",
        "title": "ROB at LC-13, Thirunindravur–Veppampattu",
        "physical_progress_pct": 78.0,
        "expenditure_cr": 38.36,
        "agreement_completion_date": "2026-03-20T00:00:00Z",
        "estimated_completion_date": "2027-01-31T00:00:00Z",
        "delay_days": 317,
        "verified_facts": [
            "Physical progress reported at 78% with ₹38.36 Cr expenditure as of 21.09.2026 Minister's review.",
            "Agreement completion was 20.03.2026; current estimated completion is 31.01.2027 (317 days variance).",
            "Railway-side bridge portion work reported in progress."
        ],
        "unverified_assumptions": [
            "Exact critical-path blocker is NOT established in ministerial snapshot.",
            "No active court litigation reported on record (must not fabricate litigation).",
            "Total financial loss is not established; full contract value must not be treated as loss.",
            "Entire 317-day delay cannot be unilaterally attributed to Railways without approved EOT."
        ],
        "evidence_required": [
            "Railway General Arrangement Drawing (GAD) and Commissioner of Railway Safety (CRS) approval records.",
            "Approved Extension of Time (EOT) documentation under GCC Clause 44.",
            "Contractor remaining-work CPM programme and milestone log.",
            "Quantified contractor claims and idle plant logs for independent verification."
        ],
        "recommended_next_action": "Convene joint site inspection with Southern Railway Deputy Chief Engineer (Bridges) and SE Highways Projects to settle remaining span launching schedule."
    }

    # Financial sums
    actual_addl_exp = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "ACTUAL_ADDITIONAL_EXPENDITURE"), 2)
    forecast_exp = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "FORECAST_INCREMENTAL_COST"), 2)
    avoidable_cost = round(sum(r.amount_cr or 0.0 for r in ledger_records if r.account_name == "POTENTIALLY_AVOIDABLE_COST"), 2)

    return MajorWorksCMSummaryOut(
        total_major_works_reviewed=len(works),
        projects_with_critical_blockers=len(crit_proj_ids),
        projects_with_completion_extensions=ext_proj_count,
        top_interdepartmental_dependencies=interdept,
        railway_coordination_risks=railway_risks,
        land_and_litigation_risks=land_lit_risks,
        actual_additional_expenditure_cr=actual_addl_exp,
        forecast_incremental_expenditure_cr=forecast_exp,
        potentially_avoidable_cost_cr=avoidable_cost,
        unresolved_corrective_actions_count=len([b for b in blockers if b.current_status != "CLOSED"]),
        projects_requiring_senior_intervention=[
            {"project_name": "ROB at LC-13, Thirunindravur–Veppampattu", "source_id": "5566", "reason": "317 days delay requiring Joint Railway Secretary review", "urgency": "CRITICAL"},
            {"project_name": "Tambaram Eastern Bypass (Km 0/0 to 8/4)", "source_id": "5562", "reason": "Binding High Court injunction requiring Additional Advocate General intervention", "urgency": "CRITICAL"},
            {"project_name": "Anna Nagar Grade Separator", "source_id": "5564", "reason": "Pier foundation obstruction requiring Corporation Commissioner clearance", "urgency": "ELEVATED"}
        ],
        reference_case_5566=ref_5566,
        simulated_data_badge="SIMULATED"
    )


# -------------------------------------------------------------
# 8. GROUNDED AI DOMAIN INTELLIGENCE (10 CANONICAL QUERIES)
# -------------------------------------------------------------

@router.post("/ai-ask", response_model=MajorWorksAIQueryOut)
def query_major_works_ai(
    payload: MajorWorksAIQueryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = (payload.query or "").lower()

    if "5566" in q or "thirunindravur" in q or "lc-13" in q:
        return MajorWorksAIQueryOut(
            query=payload.query,
            verified_facts=[
                "Project 5566 (ROB at LC-13, Thirunindravur–Veppampattu) reported 78% physical progress and ₹38.36 Cr expenditure as of 21.09.2026 review.",
                "Original agreement completion was 20.03.2026; current estimated completion is 31.01.2027 (317 days variance).",
                "Highways approach spans (7 spans) are substantially complete; railway span girder fabrication is in progress."
            ],
            missing_information=[
                "Exact critical-path obstruction not established in review document.",
                "No formal litigation reported; pending CRS safety approvals not yet verified in writing.",
                "Contractor financial claims under Clause 10CA not quantified or admitted."
            ],
            evidence_references=[
                "Document: 'More than 50Cr works details as on 21.09.2026.pdf', Page 4, Item 6.",
                "Ministerial Review Minutes dated 22.09.2026.",
                "Railway Joint Inspection Note No. SR-MAS-BR-2025-11."
            ],
            resolving_authority="Joint Committee: Chief Bridge Engineer (Southern Railway) & Chief Engineer (Highways Projects)",
            recommended_next_action="Convene senior joint coordination meeting to settle electrified track power block dates and verify contractor's revised CPM critical path.",
            lawful_options_available=[
                "Schedule railway power block during night traffic windows.",
                "Grant provisional Extension of Time (EOT) without cost escalation pending responsibility determination.",
                "Expedite approach ramp surfacing on completed spans to prevent concurrent delays."
            ],
            avoidable_exposure_cr=4.80,
            urgency_level="CRITICAL",
            uncertainty_and_limitations="Figures reflect ministerial snapshot dated 21.09.2026. Contractor claims have not been submitted for legal arbitration.",
            confidence_score=0.92,
            simulated_data_badge="SIMULATED"
        )

    elif "railway" in q:
        return MajorWorksAIQueryOut(
            query=payload.query,
            verified_facts=[
                "Two major ROB projects in Chennai Region have unresolved Railway dependencies: Project 5566 (LC-13) and Project 5570 (LC-112).",
                "Total sanctioned value affected by Railway span approvals is ₹182.40 Cr.",
                "Railway General Arrangement Drawings (GAD) are approved; CRS power blocks and girder launching clearances remain pending."
            ],
            missing_information=[
                "Southern Railway DRM coordination meeting minutes from Q3 2026.",
                "Confirmed date of Railway CRS inspection."
            ],
            evidence_references=[
                "Chief Secretary State-Railway Coordination Task Force Meeting Minutes (July 2026).",
                "Highways Special Projects Railway Cell Logbook."
            ],
            resolving_authority="Principal Secretary (Highways) & General Manager (Southern Railway)",
            recommended_next_action="Place Project 5566 and 5570 on agenda for next Chief Secretary State-Railway Quarterly Coordination Committee.",
            lawful_options_available=[
                "Apply for advance track possession under Southern Railway safety guidelines.",
                "Enter into deposit-work reconciliation agreement."
            ],
            avoidable_exposure_cr=7.50,
            urgency_level="CRITICAL",
            uncertainty_and_limitations="Railway track safety schedules are subject to Southern Railway operational passenger traffic constraints.",
            confidence_score=0.89,
            simulated_data_badge="SIMULATED"
        )

    elif "claim" in q or "financial" in q or "exposure" in q or "loss" in q:
        return MajorWorksAIQueryOut(
            query=payload.query,
            verified_facts=[
                "Verified actual additional expenditure across Major Works is ₹14.85 Cr.",
                "Submitted contractor claims total ₹28.40 Cr, of which ₹9.20 Cr has been admitted by Engineers and ₹19.20 Cr is disputed.",
                "Forecast incremental expenditure across all ₹50 Cr+ delayed corridors is ₹38.70 Cr."
            ],
            missing_information=[
                "Independent plant and equipment logbooks for idle machinery claims on 3 corridors.",
                "Certified price adjustment indexes for high-tensile prestressing steel."
            ],
            evidence_references=[
                "Independent Engineer Clause 10CA Monthly Adjustment Bulletins.",
                "Divisional Engineer Measurement Books & Escrow Statements."
            ],
            resolving_authority="Chief Engineer (Highways) Financial Delegation Committee under G.O. Ms. No. 75",
            recommended_next_action="Audit disputed contractor claims under GCC Clause 10CA before admitting liability; enforce time-bar under Clause 44.",
            lawful_options_available=[
                "Release admitted escalation strictly against statutory price index formulas.",
                "Dispute speculative downtime claims lacking verified site muster rolls.",
                "Settle mutually agreed non-compensable EOT where concurrent contractor fault exists."
            ],
            avoidable_exposure_cr=16.40,
            urgency_level="ELEVATED",
            uncertainty_and_limitations="Disputed claims are subject to dispute resolution board or arbitral tribunal proceedings.",
            confidence_score=0.94,
            simulated_data_badge="SIMULATED"
        )

    else:
        # Default Grounded Synthesis
        return MajorWorksAIQueryOut(
            query=payload.query,
            verified_facts=[
                "31 Major Works exceeding ₹50 Cr in Chennai C&M Region are under active ministerial monitoring.",
                "5 corridors face critical-path blockers causing more than 180 days completion delay.",
                "Strict statutory accounting separates gross project value (₹2,140 Cr) from incremental loss (₹38.70 Cr)."
            ],
            missing_information=[
                "Updated contractor milestone recovery schedules for Q4 2026.",
                "Interdepartmental clearance certificates from TWAD and TANGEDCO on 2 bypass stretches."
            ],
            evidence_references=[
                "Highways and Minor Ports Department Review as on 21.09.2026.",
                "TN-HDOS Universal Entity Relationship Graph."
            ],
            resolving_authority="Principal Secretary (Highways & Minor Ports) and Concerned Chief Engineers",
            recommended_next_action="Execute proactive Pre-Construction Risk Gates to freeze tender handover on parcels with binding legal stays.",
            lawful_options_available=[
                "Re-sequence work packages to unencumbered sections.",
                "Convene Collector-level weekly interdepartmental clearing camps.",
                "Issue binding CM directives on high-priority railway ROB bottlenecks."
            ],
            avoidable_exposure_cr=22.80,
            urgency_level="ELEVATED",
            uncertainty_and_limitations="Ground reality updates reflect official records dated 21 September 2026.",
            confidence_score=0.90,
            simulated_data_badge="SIMULATED"
        )
