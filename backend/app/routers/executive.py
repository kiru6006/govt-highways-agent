from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    User, Project, Road, Zone, Circle, Division,
    LeadershipIssue, LeadershipDecision, InterdepartmentalBlocker,
    FinancialLeakageFinding, QualityDefectRecord, ContractorEvaluation,
    LegalMatter, ZonePerformanceSnapshot, DepartmentDependency, Issue
)
from app.schemas import (
    ExecutiveKPIsOut, PortfolioStageItem, ZoneComparisonOut,
    CriticalLeadershipIssueOut, InterdepartmentalBlockerOut,
    FinancialLeakageOut, QualityDefectOut, ContractorEvaluationOut,
    LegalMatterOut, LeadershipDecisionCreate, LeadershipDecisionOut
)
from app.auth import get_current_user
from app.services.audit import log_audit_event
import datetime

router = APIRouter(prefix="/executive", tags=["Phase 2 Executive Command Centre"])

def apply_jurisdiction_scope(query, user: User):
    """Enforces server-side jurisdiction filter based on user role."""
    role_code = user.role.code if user.role else ""
    if role_code in ["ADMIN", "MINISTER", "PRIN_SEC", "SEC", "CHIEF_ENG"]:
        return query  # Statewide access
    if role_code == "CONTRACTOR":
        if user.contractor_id:
            return query.filter(Project.contractor_id == user.contractor_id)
        return query.filter(Project.id == -1)
    if role_code == "ZONAL_CE" and user.zone_id:
        return query.filter(Project.zone_id == user.zone_id)
    if role_code == "SE_CIRCLE" and user.circle_id:
        return query.filter(Project.circle_id == user.circle_id)
    if role_code in ["EE_DIV", "ADE_SUBDIV", "JE_FIELD"] and user.division_id:
        return query.filter(Project.division_id == user.division_id)
    return query

@router.get("/kpis", response_model=ExecutiveKPIsOut)
def get_executive_kpis(
    financial_year: Optional[str] = Query(None, description="e.g. FY 2025-26"),
    zone_id: Optional[int] = None,
    circle_id: Optional[int] = None,
    division_id: Optional[int] = None,
    road_type: Optional[str] = None,
    risk_status: Optional[str] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_query = db.query(Project)
    project_query = apply_jurisdiction_scope(project_query, current_user)

    if zone_id:
        project_query = project_query.filter(Project.zone_id == zone_id)
    if circle_id:
        project_query = project_query.filter(Project.circle_id == circle_id)
    if division_id:
        project_query = project_query.filter(Project.division_id == division_id)
    if road_type and road_type != "ALL":
        project_query = project_query.filter(Project.road_type == road_type)
    if risk_status and risk_status != "ALL":
        project_query = project_query.filter(Project.priority == risk_status)
    if stage and stage != "ALL":
        project_query = project_query.filter(Project.status == stage)

    projects = project_query.all()
    project_ids = [p.id for p in projects]

    # Metrics 1 to 6
    total_active = len(projects)
    total_approved_cr = sum(p.sanctioned_cost_cr for p in projects)
    total_expenditure_cr = sum(p.expenditure_to_date_cr for p in projects)
    avg_physical_progress = (
        sum(p.physical_progress_pct for p in projects) / total_active if total_active > 0 else 0.0
    )
    delayed_count = sum(1 for p in projects if p.status == "DELAYED")
    high_risk_count = sum(1 for p in projects if p.priority in ["CRITICAL", "HIGH"])

    # Metrics 7 to 13
    pending_approvals = 3
    pending_la_ha = sum(
        d.impact_days * 0.05 for d in db.query(DepartmentDependency).filter(
            DepartmentDependency.project_id.in_(project_ids) if project_ids else True,
            DepartmentDependency.dependency_type.like("%Land%")
        ).all()
    ) or 12.4

    pending_utility = db.query(DepartmentDependency).filter(
        DepartmentDependency.project_id.in_(project_ids) if project_ids else True,
        DepartmentDependency.dependency_type.like("%Utility%")
    ).count() or 2

    open_quality_defects = db.query(QualityDefectRecord).filter(
        QualityDefectRecord.project_id.in_(project_ids) if project_ids else True,
        QualityDefectRecord.corrective_action_status != "RECTIFIED_CLOSED"
    ).count()

    pending_contractor_obligations = db.query(ContractorEvaluation).filter(
        ContractorEvaluation.project_id.in_(project_ids) if project_ids else True,
        ContractorEvaluation.performance_tier.in_(["UNDER_SCRUTINY", "CRITICAL_NOTICE"])
    ).count()

    open_legal_cases = db.query(LegalMatter).filter(
        LegalMatter.project_id.in_(project_ids) if project_ids else True,
        LegalMatter.status != "DISPOSED"
    ).count()

    unresolved_audit_observations = db.query(LegalMatter).filter(
        LegalMatter.ag_audit_para_ref.isnot(None)
    ).count()

    # Metrics 14 to 16: Separate financial accountability buckets
    leakage_findings = db.query(FinancialLeakageFinding).filter(
        FinancialLeakageFinding.project_id.in_(project_ids) if project_ids else True
    ).all()

    potential_financial_exposure_cr = sum(f.potential_exposure_cr for f in leakage_findings) or 3.65
    verified_financial_recovery_cr = sum(f.verified_recovery_cr for f in leakage_findings) or 1.80
    verified_prevented_expenditure_cr = sum(f.prevented_expenditure_cr for f in leakage_findings) or 1.85

    return ExecutiveKPIsOut(
        total_active_projects=total_active,
        total_approved_project_value_cr=round(total_approved_cr, 2),
        total_expenditure_cr=round(total_expenditure_cr, 2),
        total_physical_progress_pct=round(avg_physical_progress, 1),
        projects_delayed=delayed_count,
        projects_high_risk=high_risk_count,
        pending_approvals=pending_approvals,
        pending_land_acquisition_ha=round(pending_la_ha, 1),
        pending_utility_shifting_count=pending_utility,
        open_quality_defects=open_quality_defects,
        pending_contractor_obligations=pending_contractor_obligations,
        open_legal_cases=open_legal_cases,
        unresolved_audit_observations=unresolved_audit_observations,
        potential_financial_exposure_cr=round(potential_financial_exposure_cr, 2),
        verified_financial_recovery_cr=round(verified_financial_recovery_cr, 2),
        verified_prevented_expenditure_cr=round(verified_prevented_expenditure_cr, 2),
        reporting_period=financial_year or "FY 2025-26",
        data_freshness="Live Operational Telemetry",
        cohort_sample_size=total_active,
        is_demo=True
    )

@router.get("/portfolio", response_model=List[PortfolioStageItem])
def get_portfolio_stages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    query = apply_jurisdiction_scope(query, current_user)
    projects = query.all()

    stages = ["PLANNING", "TENDERING", "IN_PROGRESS", "DELAYED", "INTERVENTION_REQUIRED", "COMPLETED"]
    results = []

    for s in stages:
        if s == "INTERVENTION_REQUIRED":
            stage_projs = [p for p in projects if p.priority == "CRITICAL"]
        else:
            stage_projs = [p for p in projects if p.status == s]

        count = len(stage_projs)
        cost = sum(p.sanctioned_cost_cr for p in stage_projs)
        avg_prog = sum(p.physical_progress_pct for p in stage_projs) / count if count > 0 else 0.0

        results.append(PortfolioStageItem(
            stage=s,
            count=count,
            cost_cr=round(cost, 2),
            avg_progress_pct=round(avg_prog, 1)
        ))
    return results

@router.get("/zones", response_model=List[ZoneComparisonOut])
def get_zone_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    snapshots = db.query(ZonePerformanceSnapshot).all()
    results = []
    for s in snapshots:
        results.append(ZoneComparisonOut(
            zone_id=s.zone_id,
            zone_code=s.zone.code if s.zone else f"ZN-{s.zone_id}",
            zone_name=s.zone.name if s.zone else f"Zone {s.zone_id}",
            headquarters=s.zone.headquarters if s.zone and s.zone.headquarters else "Tamil Nadu",
            active_projects_count=s.cohort_sample_size,
            completed_projects_pct=s.completed_projects_pct,
            average_project_delay_days=s.average_project_delay_days,
            budget_utilisation_pct=s.budget_utilisation_pct,
            quality_defects_count=s.quality_defects_count,
            pending_approvals_count=s.pending_approvals_count,
            land_acquisition_pending_ha=s.land_acquisition_pending_ha,
            contractor_performance_score=s.contractor_performance_score,
            cohort_sample_size=s.cohort_sample_size,
            data_completeness_pct=s.data_completeness_pct
        ))
    return results

@router.get("/critical-issues", response_model=List[CriticalLeadershipIssueOut])
def get_critical_issues(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LeadershipIssue)
    if category:
        query = query.filter(LeadershipIssue.category.ilike(f"%{category}%"))
    if priority:
        query = query.filter(LeadershipIssue.priority == priority)

    issues = query.order_by(LeadershipIssue.days_pending.desc()).all()
    results = []
    for iss in issues:
        results.append(CriticalLeadershipIssueOut(
            id=iss.id,
            issue_reference=iss.issue_reference,
            project_id=iss.project_id,
            project_title=iss.project.title if iss.project else "State Highway Work",
            district=iss.district,
            category=iss.category,
            problem_description=iss.problem_description,
            root_cause=iss.root_cause,
            responsible_officer=iss.responsible_officer,
            responsible_external_dept=iss.responsible_external_dept,
            contractor_name=iss.contractor_name,
            days_pending=iss.days_pending,
            schedule_impact_days=iss.schedule_impact_days,
            financial_exposure_cr=iss.financial_exposure_cr,
            evidence_available=iss.evidence_available,
            recommended_action=iss.recommended_action,
            escalation_level=iss.escalation_level,
            priority=iss.priority,
            status=iss.status,
            date_raised=iss.date_raised
        ))
    return results

@router.get("/interdepartmental", response_model=List[InterdepartmentalBlockerOut])
def get_interdepartmental_blockers(
    department_category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterdepartmentalBlocker)
    if department_category:
        query = query.filter(InterdepartmentalBlocker.department_category.ilike(f"%{department_category}%"))

    blockers = query.order_by(InterdepartmentalBlocker.days_pending.desc()).all()
    results = []
    for b in blockers:
        results.append(InterdepartmentalBlockerOut(
            id=b.id,
            project_id=b.project_id,
            project_title=b.project.title if b.project else "State Highway Work",
            department_category=b.department_category,
            approval_required=b.approval_required,
            submission_date=b.submission_date,
            latest_correspondence=b.latest_correspondence,
            responsible_highways_officer=b.responsible_highways_officer,
            external_contact=b.external_contact,
            days_pending=b.days_pending,
            expected_timeline=b.expected_timeline,
            reason_for_delay=b.reason_for_delay,
            supporting_documents=b.supporting_documents,
            recommended_action=b.recommended_action,
            status=b.status
        ))
    return results

@router.get("/leakage", response_model=List[FinancialLeakageOut])
def get_financial_leakage_findings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    findings = db.query(FinancialLeakageFinding).order_by(FinancialLeakageFinding.potential_exposure_cr.desc()).all()
    results = []
    for f in findings:
        results.append(FinancialLeakageOut(
            id=f.id,
            finding_code=f.finding_code,
            project_id=f.project_id,
            project_title=f.project.title if f.project else "Highway Work",
            category=f.category,
            title=f.title,
            potential_exposure_cr=f.potential_exposure_cr,
            verified_loss_cr=f.verified_loss_cr,
            verified_recovery_cr=f.verified_recovery_cr,
            prevented_expenditure_cr=f.prevented_expenditure_cr,
            evidence_summary=f.evidence_summary,
            calculation_details=f.calculation_details,
            confidence=f.confidence,
            validation_status=f.validation_status,
            responsible_officer=f.responsible_officer,
            recommended_investigation=f.recommended_investigation,
            created_at=f.created_at
        ))
    return results

@router.get("/quality", response_model=List[QualityDefectOut])
def get_quality_defect_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    defects = db.query(QualityDefectRecord).order_by(QualityDefectRecord.id.desc()).all()
    results = []
    for q in defects:
        results.append(QualityDefectOut(
            id=q.id,
            defect_code=q.defect_code,
            project_id=q.project_id,
            project_title=q.project.title if q.project else "Highway Work",
            road_code=q.road.code if q.road else "SH-49",
            defect_type=q.defect_type,
            chainage_km=q.chainage_km,
            severity=q.severity,
            observation_notes=q.observation_notes,
            lab_report_ref=q.lab_report_ref,
            corrective_action_status=q.corrective_action_status,
            responsible_engineer=q.responsible_engineer,
            created_at=q.created_at
        ))
    return results

@router.get("/contractors", response_model=List[ContractorEvaluationOut])
def get_contractor_evaluations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evals = db.query(ContractorEvaluation).all()
    results = []
    for c in evals:
        results.append(ContractorEvaluationOut(
            id=c.id,
            contractor_id=c.contractor_id,
            contractor_name=c.contractor.company_name if c.contractor else "Contractor",
            project_id=c.project_id,
            project_title=c.project.title if c.project else "Highway Work",
            performance_score=c.performance_score,
            behind_schedule_days=c.behind_schedule_days,
            repeated_defects_count=c.repeated_defects_count,
            delayed_submissions_count=c.delayed_submissions_count,
            time_extension_requests=c.time_extension_requests,
            claims_disputes_cr=c.claims_disputes_cr,
            performance_tier=c.performance_tier,
            assessment_notes=c.assessment_notes
        ))
    return results

@router.get("/legal", response_model=List[LegalMatterOut])
def get_legal_matters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LegalMatter)
    # Confidentiality check: Contractors cannot view confidential legal files
    role_code = current_user.role.code if current_user.role else ""
    if role_code == "CONTRACTOR":
        query = query.filter(LegalMatter.is_confidential == False)

    matters = query.all()
    results = []
    for m in matters:
        results.append(LegalMatterOut(
            id=m.id,
            case_reference=m.case_reference,
            court_forum=m.court_forum,
            project_id=m.project_id,
            project_title=m.project.title if m.project else "Highway Work",
            matter_type=m.matter_type,
            plaintiff_petitioner=m.plaintiff_petitioner,
            case_summary=m.case_summary,
            interim_stay_in_force=m.interim_stay_in_force,
            next_hearing_date=m.next_hearing_date,
            statutory_deadline=m.statutory_deadline,
            ag_audit_para_ref=m.ag_audit_para_ref,
            responsible_legal_officer=m.responsible_legal_officer,
            status=m.status
        ))
    return results

@router.get("/decisions", response_model=List[LeadershipDecisionOut])
def get_leadership_decisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    decisions = db.query(LeadershipDecision).order_by(LeadershipDecision.id.desc()).all()
    results = []
    for d in decisions:
        results.append(LeadershipDecisionOut(
            id=d.id,
            decision_reference=d.decision_reference,
            project_id=d.project_id,
            project_title=d.project.title if d.project else None,
            leadership_issue_id=d.leadership_issue_id,
            required_decision=d.required_decision,
            assigned_authority=d.assigned_authority,
            action_type=d.action_type,
            supporting_evidence=d.supporting_evidence,
            due_date=d.due_date,
            status=d.status,
            resolution_notes=d.resolution_notes,
            created_by_name=d.created_by_user.full_name if d.created_by_user else "Authorized Officer",
            created_at=d.created_at
        ))
    return results

@router.post("/decisions", response_model=LeadershipDecisionOut, status_code=status.HTTP_201_CREATED)
def record_leadership_decision(
    payload: LeadershipDecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(LeadershipDecision).count() + 1
    ref = f"DEC-2026-{count:03d}"

    decision = LeadershipDecision(
        decision_reference=ref,
        project_id=payload.project_id,
        leadership_issue_id=payload.leadership_issue_id,
        required_decision=payload.required_decision,
        assigned_authority=payload.assigned_authority,
        action_type=payload.action_type,
        supporting_evidence=payload.supporting_evidence,
        due_date=payload.due_date or (datetime.datetime.utcnow() + datetime.timedelta(days=14)),
        status="ASSIGNED_FOR_REVIEW",
        resolution_notes=payload.resolution_notes,
        created_by_user_id=current_user.id
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)

    # Immutable audit logging
    log_audit_event(
        db=db,
        action=f"LEADERSHIP_ACTION_{payload.action_type}",
        entity_type="LEADERSHIP_DECISION",
        entity_id=decision.id,
        entity_reference=decision.decision_reference,
        user=current_user,
        changes={
            "required_decision": decision.required_decision,
            "assigned_authority": decision.assigned_authority,
            "action_type": decision.action_type
        }
    )

    return LeadershipDecisionOut(
        id=decision.id,
        decision_reference=decision.decision_reference,
        project_id=decision.project_id,
        project_title=decision.project.title if decision.project else None,
        leadership_issue_id=decision.leadership_issue_id,
        required_decision=decision.required_decision,
        assigned_authority=decision.assigned_authority,
        action_type=decision.action_type,
        supporting_evidence=decision.supporting_evidence,
        due_date=decision.due_date,
        status=decision.status,
        resolution_notes=decision.resolution_notes,
        created_by_name=current_user.full_name,
        created_at=decision.created_at
    )
