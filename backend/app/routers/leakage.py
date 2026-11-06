"""
AI Leakage & Irregularity Intelligence Router (Prompt 01)
Provides endpoints for anomaly detection, exposure analysis, project risk matrix,
executive AI assessment, and human-in-the-loop review actions with RBAC.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, Project, WorkPackage, Contractor, AuditEvent,
    AnomalyFinding, AnomalyActionHistory
)
from app.schemas import (
    AnomalyFindingListItem, AnomalyFindingDetailOut,
    AnomalyActionHistoryOut, AnomalyReviewRequest,
    LeakageKPIsOut, CategorySummaryOut, ExposureAnalysisOut,
    ProjectRiskScoreOut, ExecutiveAssessmentOut, DecisionRequiredOut
)

router = APIRouter(prefix="/leakage", tags=["AI Leakage & Irregularity Intelligence"])

# -------------------------------------------------------------
# RBAC HELPER
# -------------------------------------------------------------
def verify_leakage_access(current_user: User):
    role_code = current_user.role.code if current_user.role else ""
    if role_code in ["CONTRACTOR", "CONSULTANT", "CITIZEN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Confidential vigilance and anomaly intelligence records are restricted to authorised departmental leadership."
        )

# -------------------------------------------------------------
# 1. EXECUTIVE KPIS
# -------------------------------------------------------------
@router.get("/kpis", response_model=LeakageKPIsOut)
def get_leakage_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    findings = db.query(AnomalyFinding).all()
    total_findings = len(findings)
    critical_findings = sum(1 for f in findings if f.severity == "CRITICAL")
    high_risk_findings = sum(1 for f in findings if f.severity == "HIGH")
    potential_exposure = sum(f.potential_exposure_cr for f in findings)
    awaiting_verification = sum(1 for f in findings if f.review_status in ["NEW", "UNDER_REVIEW", "EVIDENCE_REQUESTED"])
    actions_pending = sum(1 for f in findings if f.review_status in ["ACTION_REQUIRED", "VERIFIED"])

    return LeakageKPIsOut(
        total_findings=total_findings,
        critical_findings=critical_findings,
        high_risk_findings=high_risk_findings,
        potential_financial_exposure_cr=round(potential_exposure, 2),
        findings_awaiting_verification=awaiting_verification,
        corrective_actions_pending=actions_pending,
        data_mode="mock",
        reporting_period="FY 2025-26 (Q3 Active Portfolio)",
        last_analysis_timestamp=datetime.datetime.utcnow().isoformat() + "Z"
    )

# -------------------------------------------------------------
# 2. LIST FINDINGS WITH MULTI-FILTER
# -------------------------------------------------------------
@router.get("/findings", response_model=List[AnomalyFindingListItem])
def list_anomaly_findings(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    programme: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    query = db.query(AnomalyFinding)

    if category:
        query = query.filter(AnomalyFinding.category == category)
    if severity:
        query = query.filter(AnomalyFinding.severity == severity)
    if review_status:
        query = query.filter(AnomalyFinding.review_status == review_status)
    if project_id:
        query = query.filter(AnomalyFinding.project_id == project_id)

    findings = query.order_by(AnomalyFinding.potential_exposure_cr.desc()).all()
    results = []

    for f in findings:
        proj = f.project
        # Optional filter on programme / district via project relationship
        if programme and proj and getattr(proj, "funding_source", "") != programme and programme not in getattr(proj, "title", ""):
            continue
        if district and proj and getattr(proj, "district", "") != district:
            continue

        results.append(AnomalyFindingListItem(
            id=f.id,
            finding_code=f.finding_code,
            project_id=f.project_id,
            project_title=proj.title if proj else f"Project {f.project_id}",
            project_code=proj.project_code if proj else None,
            package_id=f.package_id,
            package_name=getattr(f.package, "package_number", None) or (f"Package {f.package_id}" if f.package_id else None),
            contractor_id=f.contractor_id,
            contractor_name=f.contractor.company_name if f.contractor else None,
            category=f.category,
            title=f.title,
            severity=f.severity,
            ai_confidence=f.ai_confidence,
            potential_exposure_cr=f.potential_exposure_cr,
            transaction_value_cr=f.transaction_value_cr,
            verified_impact_cr=f.verified_impact_cr,
            amount_under_review_cr=f.amount_under_review_cr,
            evidence_status=f.evidence_status,
            responsible_department=f.responsible_department,
            responsible_officer=f.responsible_officer,
            review_status=f.review_status,
            assigned_to=f.assigned_to,
            scenario_id=f.scenario_id,
            data_mode=f.data_mode or "mock",
            data_status=f.data_status or "Seeded Demo",
            created_at=f.created_at
        ))

    return results

# -------------------------------------------------------------
# 3. GET FINDING DETAIL WITH EVIDENCE & AUDIT HISTORY
# -------------------------------------------------------------
@router.get("/findings/{finding_id}", response_model=AnomalyFindingDetailOut)
def get_anomaly_finding_detail(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    f = db.query(AnomalyFinding).filter(AnomalyFinding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Anomaly finding not found.")

    actions_out = [
        AnomalyActionHistoryOut(
            id=a.id,
            finding_id=a.finding_id,
            action_type=a.action_type,
            actor_name=a.actor_name,
            actor_role=a.actor_role,
            old_status=a.old_status,
            new_status=a.new_status,
            remarks=a.remarks,
            action_details=a.action_details,
            due_date=a.due_date,
            created_at=a.created_at
        )
        for a in f.actions
    ]

    return AnomalyFindingDetailOut(
        id=f.id,
        finding_code=f.finding_code,
        project_id=f.project_id,
        project_title=f.project.title if f.project else f"Project {f.project_id}",
        project_code=f.project.project_code if f.project else None,
        package_id=f.package_id,
        package_name=getattr(f.package, "package_number", None) or (f"Package {f.package_id}" if f.package_id else None),
        contractor_id=f.contractor_id,
        contractor_name=f.contractor.company_name if f.contractor else None,
        category=f.category,
        title=f.title,
        description=f.description,
        what_detected=f.what_detected,
        why_flagged=f.why_flagged,
        detection_rule=f.detection_rule,
        calculation_formula=f.calculation_formula,
        potential_exposure_cr=f.potential_exposure_cr,
        transaction_value_cr=f.transaction_value_cr,
        verified_impact_cr=f.verified_impact_cr,
        amount_under_review_cr=f.amount_under_review_cr,
        severity=f.severity,
        ai_confidence=f.ai_confidence,
        evidence_status=f.evidence_status,
        responsible_department=f.responsible_department,
        responsible_officer=f.responsible_officer,
        review_status=f.review_status,
        assigned_to=f.assigned_to,
        review_remarks=f.review_remarks,
        suggested_verification=f.suggested_verification,
        recommended_action=f.recommended_action,
        corrective_action=f.corrective_action,
        action_due_date=f.action_due_date,
        escalated_to_secretary=f.escalated_to_secretary,
        evidence_records_json=f.evidence_records_json,
        scenario_id=f.scenario_id,
        data_mode=f.data_mode or "mock",
        data_status=f.data_status or "Seeded Demo",
        created_at=f.created_at,
        actions=actions_out
    )

# -------------------------------------------------------------
# 4. CATEGORY SUMMARY
# -------------------------------------------------------------
@router.get("/categories", response_model=List[CategorySummaryOut])
def get_category_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    findings = db.query(AnomalyFinding).all()
    cat_map = {}
    for f in findings:
        if f.category not in cat_map:
            cat_map[f.category] = {"count": 0, "exposure": 0.0, "critical": 0}
        cat_map[f.category]["count"] += 1
        cat_map[f.category]["exposure"] += f.potential_exposure_cr
        if f.severity == "CRITICAL":
            cat_map[f.category]["critical"] += 1

    results = [
        CategorySummaryOut(
            category=k,
            count=v["count"],
            total_exposure_cr=round(v["exposure"], 2),
            critical_count=v["critical"]
        )
        for k, v in cat_map.items()
    ]
    return sorted(results, key=lambda x: x.total_exposure_cr, reverse=True)

# -------------------------------------------------------------
# 5. FINANCIAL EXPOSURE ANALYSIS
# -------------------------------------------------------------
@router.get("/exposure-analysis", response_model=ExposureAnalysisOut)
def get_exposure_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    findings = db.query(AnomalyFinding).all()

    # By project
    proj_map = {}
    for f in findings:
        pid = f.project_id
        if pid not in proj_map:
            proj_map[pid] = {
                "project_id": pid,
                "project_code": f.project.project_code if f.project else f"PRJ-{pid}",
                "title": (f.project.title[:38] + "...") if f.project else f"Project {pid}",
                "exposure_cr": 0.0
            }
        proj_map[pid]["exposure_cr"] += f.potential_exposure_cr

    by_project = sorted(proj_map.values(), key=lambda x: x["exposure_cr"], reverse=True)
    for p in by_project:
        p["exposure_cr"] = round(p["exposure_cr"], 2)

    # By category
    cat_map = {}
    for f in findings:
        cat_map[f.category] = cat_map.get(f.category, 0.0) + f.potential_exposure_cr
    by_category = sorted([{"category": k, "exposure_cr": round(v, 2)} for k, v in cat_map.items()], key=lambda x: x["exposure_cr"], reverse=True)

    # By contractor
    cont_map = {}
    for f in findings:
        if f.contractor_id:
            cid = f.contractor_id
            name = f.contractor.company_name if f.contractor else f"Contractor {cid}"
            cont_map[cid] = cont_map.get(cid, {"contractor_id": cid, "name": name[:28], "exposure_cr": 0.0})
            cont_map[cid]["exposure_cr"] += f.potential_exposure_cr
    by_contractor = sorted(cont_map.values(), key=lambda x: x["exposure_cr"], reverse=True)
    for c in by_contractor:
        c["exposure_cr"] = round(c["exposure_cr"], 2)

    # By programme
    by_programme = [
        {"programme": "CMRDP", "exposure_cr": 28.05},
        {"programme": "CKICP", "exposure_cr": 14.95},
        {"programme": "TNRSP_II", "exposure_cr": 5.40},
        {"programme": "CRIDP", "exposure_cr": 3.65},
        {"programme": "NABARD", "exposure_cr": 1.95}
    ]

    # Month trend
    month_trend = [
        {"month": "Jun 2024", "exposure_cr": 2.10, "count": 2},
        {"month": "Aug 2024", "exposure_cr": 4.80, "count": 3},
        {"month": "Oct 2024", "exposure_cr": 7.20, "count": 4},
        {"month": "Dec 2024", "exposure_cr": 18.50, "count": 3},
        {"month": "Feb 2025", "exposure_cr": 8.60, "count": 2},
        {"month": "Nov 2026", "exposure_cr": 12.80, "count": 2}
    ]

    total_exposure = sum(f.potential_exposure_cr for f in findings)
    total_txn = sum(f.transaction_value_cr for f in findings)
    total_verified = sum(f.verified_impact_cr for f in findings)
    total_under_review = sum(f.amount_under_review_cr for f in findings)

    return ExposureAnalysisOut(
        by_project=by_project,
        by_category=by_category,
        by_contractor=by_contractor,
        by_programme=by_programme,
        month_trend=month_trend,
        total_transaction_value_cr=round(total_txn, 2),
        total_potential_exposure_cr=round(total_exposure, 2),
        total_verified_impact_cr=round(total_verified, 2),
        total_under_review_cr=round(total_under_review, 2)
    )

# -------------------------------------------------------------
# 6. PROJECT RISK MATRIX
# -------------------------------------------------------------
@router.get("/project-risk-matrix", response_model=List[ProjectRiskScoreOut])
def get_project_risk_matrix(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    projects = db.query(Project).all()
    results = []

    for p in projects:
        anomalies = db.query(AnomalyFinding).filter(AnomalyFinding.project_id == p.id).all()
        exposure = sum(a.potential_exposure_cr for a in anomalies)
        critical_count = sum(1 for a in anomalies if a.severity == "CRITICAL")

        fin_risk = min(100.0, round((exposure / 5.0) * 20.0 + (30.0 if critical_count > 0 else 10.0), 1))
        sched_risk = min(100.0, round((100.0 - (p.physical_progress_pct or 0.0)) * 0.4 + (35.0 if any("Extension" in a.category for a in anomalies) else 10.0), 1))
        proc_risk = 75.0 if any("Variation" in a.category or "Duplicate" in a.category for a in anomalies) else 25.0
        qual_risk = 85.0 if any("Quality" in a.category for a in anomalies) else 30.0
        land_risk = 90.0 if any("Utility" in a.category or "Land" in a.category for a in anomalies) else 20.0
        comp_risk = 80.0 if critical_count > 0 else 35.0

        composite = round((fin_risk * 0.3) + (sched_risk * 0.2) + (proc_risk * 0.15) + (qual_risk * 0.15) + (land_risk * 0.1) + (comp_risk * 0.1), 1)

        results.append(ProjectRiskScoreOut(
            project_id=p.id,
            project_code=p.project_code,
            project_title=p.title,
            programme="CMRDP" if "SH-49" in p.title else ("CKICP" if "SH-15" in p.title else "HIGHWAYS"),
            financial_risk_score=fin_risk,
            schedule_risk_score=sched_risk,
            procurement_risk_score=proc_risk,
            quality_risk_score=qual_risk,
            land_utility_risk_score=land_risk,
            compliance_risk_score=comp_risk,
            overall_composite_risk=composite,
            active_anomalies_count=len(anomalies)
        ))

    return sorted(results, key=lambda x: x.overall_composite_risk, reverse=True)

# -------------------------------------------------------------
# 7. EXECUTIVE ASSESSMENT (AI NARRATIVE)
# -------------------------------------------------------------
@router.get("/executive-assessment", response_model=ExecutiveAssessmentOut)
def get_executive_assessment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    findings = db.query(AnomalyFinding).all()
    total_exposure = sum(f.potential_exposure_cr for f in findings)

    return ExecutiveAssessmentOut(
        summary_narrative="AI analysis has scanned active financial vouchers, project execution schedules, and contract packages across the demonstration dataset. Multiple execution and financial anomalies were detected, concentrated in duplicate billing indicators, unamortized mobilization advances, unsanctioned non-BOQ rate variations, and acute utility clearance lag.",
        overall_risk_assessment="HIGH CONCERN (Action Recommended Prior to Q4 Financial Closures)",
        critical_observations=[
            "Duplicate voucher submission #ECR-RA-03 for ₹21.00 Cr flagged across Chengalpattu and Kelambakkam sub-divisional entries.",
            "Contractor mobilization advance recovery lag of ₹2.20 Cr on Tambaram Grade Separator despite surpassing 30% physical milestone.",
            "Non-BOQ rock splitting rate variation order of ₹9.80 Cr on Ooty Ghat Corridor lacks Board of Engineers prior approval.",
            "Critical concrete test shortfall on Pier P-14 (31.8 MPa vs M-45) remains open on HRS Guindy registry despite milestone payment claim."
        ],
        financial_exposure_estimate_cr=round(total_exposure, 2),
        projects_requiring_immediate_attention=[
            {"project_id": 1, "code": "PRJ-TN-2026-001", "title": "SH-49 East Coast Road Widening", "issue": "Duplicate billing voucher entry & refinery telemetry mismatch", "exposure_cr": 19.65},
            {"project_id": 4, "code": "PRJ-TN-2026-004", "title": "SH-15 Ooty-Gudalur Ghat Corridor", "issue": "Unsanctioned non-BOQ rock excavation variation order", "exposure_cr": 11.30},
            {"project_id": 2, "code": "PRJ-TN-2026-002", "title": "MDR-102 Tambaram Grade Separator", "issue": "Open critical concrete failure on Pier P-14 & advance recovery lag", "exposure_cr": 8.40}
        ],
        recommended_executive_actions=[
            {"action": "Freeze Treasury disbursement for Voucher #TXN-2025-004 and call for original MB Book 412.", "authority": "Finance Advisor & CAO", "urgency": "IMMEDIATE"},
            {"action": "Issue Stop-Work Notice on Pier P-14 until IIT Madras non-destructive structural test is certified.", "authority": "Chief Engineer (Highways - Projects)", "urgency": "CRITICAL"},
            {"action": "Convene Joint High-Level Taskforce with Revenue Secretary & TANGEDCO CMD on statutory clearance bottlenecks.", "authority": "Principal Secretary (Highways)", "urgency": "HIGH"},
            {"action": "Enforce automatic ₹3.50 Cr unamortized advance recovery on Madurai-Tuticorin expressway voucher.", "authority": "Superintending Engineer Madurai", "urgency": "ROUTINE"}
        ],
        observed_facts=[
            "2 identical bill numbers (#ECR-RA-03) generated within 12 days in two separate offices.",
            "1,810 MT of bitumen billed on SH-49 lacks matching electronic refinery gate passes.",
            "48 TANGEDCO poles have remained unshifted for 142 days despite 100% deposit payment.",
            "Pier P-14 28-day cube test achieved only 31.8 MPa against required M-45."
        ],
        calculated_indicators=[
            f"Total potential financial exposure across 16 findings is ₹{round(total_exposure, 2)} Cr.",
            "Verified financial impact already confirmed stands at ₹7.80 Cr.",
            "Amount under active administrative review is ₹46.20 Cr.",
            "Top 3 projects account for 72.8% of total portfolio anomaly value."
        ],
        ai_interpretations=[
            "The duplicate bill pattern strongly indicates an uncoordinated multi-office voucher upload or systemic registry lapse rather than deliberate double-payment, as the second voucher was halted before Treasury ECS release.",
            "Repeated time extensions on Tambaram without Liquidated Damages suggest informal risk absorption by the department due to unresolved utility conflicts.",
            "Variation order on Ooty ghat road appears to bypass the Standing Finance Committee threshold through piecemeal sub-divisional authorizations."
        ]
    )

# -------------------------------------------------------------
# 8. DECISIONS REQUIRING ATTENTION (MINISTER & SECRETARY)
# -------------------------------------------------------------
@router.get("/decisions-requiring-attention", response_model=List[DecisionRequiredOut])
def get_decisions_requiring_attention(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    urgent_findings = db.query(AnomalyFinding).filter(
        (AnomalyFinding.severity == "CRITICAL") | (AnomalyFinding.escalated_to_secretary == True)
    ).order_by(AnomalyFinding.potential_exposure_cr.desc()).limit(5).all()

    results = []
    for f in urgent_findings:
        level = "MINISTER" if f.potential_exposure_cr > 10.0 or "Concrete" in f.title else "SECRETARY"
        results.append(DecisionRequiredOut(
            id=f.id,
            finding_code=f.finding_code,
            project_id=f.project_id,
            project_title=f.project.title if f.project else f"Project {f.project_id}",
            issue=f.title,
            impact=f"Potential financial exposure of ₹{f.potential_exposure_cr} Cr with schedule/quality repercussions.",
            financial_exposure_cr=f.potential_exposure_cr,
            responsible_department=f.responsible_department,
            current_status=f.review_status,
            recommended_decision=f.recommended_action,
            escalation_level=level,
            due_date=f.action_due_date
        ))

    return results

# -------------------------------------------------------------
# 9. HUMAN REVIEW & ACTION WORKFLOW WITH AUDIT LOGGING
# -------------------------------------------------------------
@router.post("/findings/{finding_id}/review", response_model=AnomalyFindingDetailOut)
def update_finding_review(
    finding_id: int,
    payload: AnomalyReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_leakage_access(current_user)

    f = db.query(AnomalyFinding).filter(AnomalyFinding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Anomaly finding not found.")

    old_status = f.review_status

    if payload.review_status:
        valid_statuses = ["NEW", "UNDER_REVIEW", "EVIDENCE_REQUESTED", "VERIFIED", "NOT_SUBSTANTIATED", "ACTION_REQUIRED", "RESOLVED", "CLOSED"]
        if payload.review_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid review status. Allowed: {valid_statuses}")
        f.review_status = payload.review_status

    if payload.assigned_to is not None:
        f.assigned_to = payload.assigned_to

    if payload.review_remarks:
        f.review_remarks = payload.review_remarks

    if payload.corrective_action:
        f.corrective_action = payload.corrective_action

    if payload.action_due_date:
        f.action_due_date = payload.action_due_date

    if payload.escalate_to_secretary is not None:
        f.escalated_to_secretary = payload.escalate_to_secretary

    f.updated_at = datetime.datetime.utcnow()

    # Create Anomaly Action History record
    action_type = "STATUS_UPDATE" if payload.review_status and payload.review_status != old_status else "REVIEW_REMARKS"
    if payload.escalate_to_secretary:
        action_type = "ESCALATED_TO_SECRETARY"

    history_entry = AnomalyActionHistory(
        finding_id=f.id,
        action_type=action_type,
        actor_name=current_user.full_name or current_user.username,
        actor_role=current_user.role.name if current_user.role else "OFFICIAL",
        old_status=old_status,
        new_status=f.review_status,
        remarks=payload.review_remarks or payload.request_evidence_details or "Status update performed",
        action_details=payload.corrective_action,
        due_date=payload.action_due_date
    )
    db.add(history_entry)

    # Global Audit Event
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=current_user.role.code if current_user.role else "USER",
        action="ANOMALY_REVIEW",
        entity_type="ANOMALY_FINDING",
        entity_id=f.id,
        entity_reference=f.finding_code,
        changes_json=f"Status: {old_status} -> {f.review_status}; Remarks: {payload.review_remarks or ''}"
    )
    db.add(audit)

    db.commit()
    db.refresh(f)

    return get_anomaly_finding_detail(finding_id=f.id, db=db, current_user=current_user)
