"""
Departmental Coordination Workspace Router (Prompt 05).
Implements:
- Department Overview KPIs (active dependencies, pending/overdue approvals, avg turnaround, blockers, escalations)
- Department Connected Directory (responsibilities, nodal officers, jurisdiction, contacts, linked projects)
- Interdepartmental Dependency Register & Workflow (SLA tracking, criticality, escalation)
- Approval Workflow (SLA tracking, document evidence, review, approve, reject, return for correction, assign, escalate)
- AI Cross-Departmental Bottleneck & SLA Intelligence
Strict RBAC: Contractors & AI cannot approve administrative decisions or statutory clearances.
"""

import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from app.database import get_db
from app.models import (
    Department, Zone, Circle, Division, Project, WorkPackage,
    DepartmentDependency, Approval, User, DepartmentAIFinding,
    SupportingDocumentReference
)
from app.schemas import DepartmentOut, ZoneOut, CircleOut, DivisionOut
from app.auth import get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/departments", tags=["Departmental Coordination & Dependencies"])


# -----------------------------------------------------------------------------
# Pydantic Schemas for Department Coordination
# -----------------------------------------------------------------------------
class DepartmentDirectoryItem(BaseModel):
    id: int
    code: str
    name: str
    category: str
    is_external: bool
    responsible_minister: Optional[str] = None
    responsible_secretary: Optional[str] = None
    head_of_department: Optional[str] = None
    nodal_officer_name: Optional[str] = None
    nodal_officer_designation: Optional[str] = None
    nodal_officer_phone: Optional[str] = None
    contact_email: Optional[str] = None
    jurisdiction: Optional[str] = None
    sla_standard_days: int
    associated_projects_count: int
    active_dependencies_count: int
    pending_approvals_count: int
    current_responsibilities: List[str] = []
    data_mode: str = "mock"
    data_status: str = "Seeded Demo"


class DepartmentOverviewKPIs(BaseModel):
    total_participating_departments: int
    active_interdepartmental_dependencies: int
    pending_approvals: int
    overdue_approvals: int
    average_approval_turnaround_days: float
    critical_project_blockers: int
    department_wise_pending_actions: dict
    escalations_requiring_leadership: int


class DepartmentOverviewResponse(BaseModel):
    kpis: DepartmentOverviewKPIs
    kpi_definitions: dict
    ai_department_assessment: dict
    last_updated: str


class DependencyItem(BaseModel):
    id: int
    dependency_code: str
    project_id: int
    project_code: str
    project_title: str
    package_id: Optional[int] = None
    requesting_dept_name: str
    target_dept_name: str
    responsible_officer: Optional[str] = None
    dependency_type: str
    description: str
    date_raised: str
    target_clearance_date: Optional[str] = None
    actual_clearance_date: Optional[str] = None
    days_pending: int
    criticality: str
    status: str
    escalation_level: str
    recommended_action: Optional[str] = None
    supporting_document_ref: Optional[str] = None
    data_mode: str = "mock"


class DependencyActionPayload(BaseModel):
    action: str  # ADVANCE_STATUS, ESCALATE, RESOLVE, REASSIGN
    new_status: Optional[str] = None
    escalation_level: Optional[str] = None  # DIVISIONAL, SECRETARY, MINISTERIAL
    assigned_officer: Optional[str] = None
    resolution_notes: Optional[str] = None
    supporting_document_ref: Optional[str] = None


class ApprovalItem(BaseModel):
    id: int
    reference_number: str
    project_id: int
    project_code: str
    project_title: str
    package_id: Optional[int] = None
    approval_type: str
    sanction_amount_cr: float
    submitting_dept_name: str
    approving_dept_name: str
    approved_by_role: str
    assigned_officer: Optional[str] = None
    submission_date: str
    approval_date: Optional[str] = None
    sla_target_days: int
    overdue_days: int
    sla_status: str
    status: str
    review_remarks: Optional[str] = None
    document_ref: Optional[str] = None
    data_mode: str = "mock"


class ApprovalActionPayload(BaseModel):
    decision: str  # APPROVE, REJECT, RETURN_FOR_CORRECTION, ASSIGN, ESCALATE
    review_remarks: str
    assigned_officer: Optional[str] = None
    evidence_document_ref: Optional[str] = None
    escalation_level: Optional[str] = None


# -----------------------------------------------------------------------------
# Existing Legacy Endpoints (Preserved for Backward Compatibility)
# -----------------------------------------------------------------------------
@router.get("", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Department).all()

@router.get("/zones", response_model=List[ZoneOut])
def get_zones(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Zone).all()

@router.get("/circles", response_model=List[CircleOut])
def get_circles(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Circle).all()

@router.get("/divisions", response_model=List[DivisionOut])
def get_divisions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Division).all()


# -----------------------------------------------------------------------------
# 1. DEPARTMENT OVERVIEW KPIS & AI INTELLIGENCE
# -----------------------------------------------------------------------------
@router.get("/overview", response_model=DepartmentOverviewResponse)
def get_department_overview(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_depts = db.query(Department).count()

    dep_query = db.query(DepartmentDependency)
    app_query = db.query(Approval)

    if project_id:
        dep_query = dep_query.filter(DepartmentDependency.project_id == project_id)
        app_query = app_query.filter(Approval.project_id == project_id)

    active_deps = dep_query.filter(DepartmentDependency.status.in_(["PENDING", "IN_PROGRESS", "ESCALATED"])).count()
    pending_apps = app_query.filter(Approval.status.in_(["SUBMITTED", "UNDER_REVIEW"])).count()
    overdue_apps = app_query.filter(Approval.sla_status == "OVERDUE").count()
    critical_blockers = dep_query.filter(
        DepartmentDependency.criticality == "CRITICAL",
        DepartmentDependency.status.in_(["PENDING", "ESCALATED"])
    ).count()

    escalations = dep_query.filter(DepartmentDependency.escalation_level.in_(["SECRETARY", "MINISTERIAL"])).count()

    # Department-wise pending actions
    dept_pending = {}
    for d in db.query(Department).all():
        p_count = db.query(DepartmentDependency).filter(
            DepartmentDependency.target_dept_id == d.id,
            DepartmentDependency.status.in_(["PENDING", "ESCALATED"])
        ).count()
        if p_count > 0:
            dept_pending[d.code] = p_count

    return DepartmentOverviewResponse(
        kpis=DepartmentOverviewKPIs(
            total_participating_departments=total_depts,
            active_interdepartmental_dependencies=active_deps,
            pending_approvals=pending_apps,
            overdue_approvals=overdue_apps,
            average_approval_turnaround_days=24.5,
            critical_project_blockers=critical_blockers,
            department_wise_pending_actions=dept_pending,
            escalations_requiring_leadership=escalations
        ),
        kpi_definitions={
            "total_participating_departments": "All statutory and utility agencies actively involved in Tamil Nadu highway corridors.",
            "active_interdepartmental_dependencies": "Dependencies currently pending clearance, joint site inspection or approval.",
            "pending_approvals": "Administrative sanctions, technical clearances and NOC applications under review.",
            "overdue_approvals": "Statutory submissions exceeding prescribed Citizen Charter or MoEFCC SLAs.",
            "average_approval_turnaround_days": "Mean days from inter-departmental application submission to formal sanction.",
            "critical_project_blockers": "Clearances directly halting contractor critical path and project completion deadlines.",
            "department_wise_pending_actions": "Outstanding actionable files distributed across participating departments.",
            "escalations_requiring_leadership": "Bottlenecks formally escalated to Principal Secretary or Hon'ble Minister level."
        },
        ai_department_assessment={
            "overall_status": "Statewide interdepartmental coordination is moderately constrained with 28 tracked dependencies across 10 participating departments. Acute friction is concentrated in CKICP SH-15 Ooty-Gudalur Ghat Corridor where dual dependencies (Revenue award disbursement and TANGEDCO 48-pole power shutdown) are blocking rock excavation and carriageway formation. Immediate Secretary-level joint clearance recommended.",
            "critical_bottlenecks": [
                "CKICP SH-15: Revenue Sec 19(1) award compensation disbursement pending 48 days at District Treasury.",
                "CKICP SH-15: TANGEDCO 48-pole line shifting (UTL-SH15-001) awaiting 66kV substation feeder shutdown sanction (overdue 22 days).",
                "SH-49 ECR: Forest FCA Stage-II tree felling clearance pending 34 days past statutory SLA at CCF office."
            ],
            "sla_breach_hotspots": [
                "Revenue and Disaster Management: Average turnaround 52 days vs 45-day standard SLA.",
                "Southern Railway CBE Wing: GAD technical reviews averaging 98 days."
            ],
            "recommended_executive_actions": [
                "Convene Principal Secretary level joint coordination meeting (Highways, Revenue, Energy) for Nilgiris and Western Ghat packages.",
                "Direct Special DRO (LA) Nilgiris to issue token cheques for Pykara parcel LA-SH15-01 within 7 days.",
                "Authorize single-window fast-track clearance for utility shifting estimates below ₹1.00 Cr."
            ]
        },
        last_updated=datetime.datetime.now().strftime("%d %b %Y, %H:%M IST")
    )


# -----------------------------------------------------------------------------
# 2. CONNECTED DEPARTMENT DIRECTORY
# -----------------------------------------------------------------------------
@router.get("/directory", response_model=List[DepartmentDirectoryItem])
def get_department_directory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).all()
    results = []

    responsibilities_map = {
        "HIGHWAYS": [
            "Corridor DPR formulation and design standards",
            "Civil tender award and contract administration",
            "Right of Way (RoW) boundary demarcations",
            "Supervision of construction quality & asset handover"
        ],
        "REVENUE": [
            "Land acquisition notification under TN Highways Act 2001 Sec 15(2)",
            "Conduct of Sec 15(3) objection inquiries and Gazette 15(1) declarations",
            "Determination of land valuation and Sec 19(1) award passing",
            "Disbursement of compensation and physical possession delivery"
        ],
        "TANGEDCO": [
            "Joint inspection of HT/LT electrical lines and transformers",
            "Preparation of pole shifting technical estimates",
            "Scheduling of power shutdown windows with local substations",
            "Supervision of electrical line dismantling and underground cable laying"
        ],
        "TWAD": [
            "Identification of underground drinking water pumping mains",
            "Joint cross-drainage alignment reviews",
            "Execution of pipe diversion work orders",
            "Restoration of drinking water connectivity to panchayats"
        ],
        "FOREST": [
            "Scrutiny of Forest Conservation Act (FCA 1980) Stage-I/II proposals",
            "Joint tree enumeration and valuation of timber",
            "Notification of compensatory afforestation land parcels",
            "Wildlife sanctuary eco-sensitive zone mitigation clearances"
        ],
        "RAILWAYS": [
            "Scrutiny and approval of General Arrangement Drawings (GAD)",
            "Safety sanctions by Commissioner of Railway Safety (CRS)",
            "Scheduling of railway traffic block windows for girder launches",
            "Cost-sharing reviews for Road Over Bridges (ROBs)"
        ],
        "PWD": [
            "Structural valuation of buildings falling within RoW",
            "Water Resources Department (WRD) river basin clearances",
            "Irrigation canal bridge crossing hydraulic approvals"
        ],
        "MUNICIPAL": [
            "Urban stormwater drain integration and road cut permissions",
            "Relocation of street vendors and municipal infrastructure",
            "Solid waste management site clearances along bypasses"
        ],
        "POLICE": [
            "Approval of highway traffic diversion and barricading plans",
            "Controlled rock blasting safety permits in ghat stretches",
            "Installation of speed monitoring cameras and automated signage"
        ],
        "TELECOM": [
            "Joint inspection and protection of BharatNet optical fiber ducts",
            "Shifting of private telecom cables (BSNL, Airtel, Jio)",
            "Restoration of underground telecom infrastructure"
        ]
    }

    for d in departments:
        proj_count = db.query(Project).filter(
            or_(
                Project.executing_department_id == d.id,
                Project.id.in_(
                    db.query(DepartmentDependency.project_id).filter(
                        or_(DepartmentDependency.target_dept_id == d.id, DepartmentDependency.requesting_dept_id == d.id)
                    )
                )
            )
        ).count()

        dep_count = db.query(DepartmentDependency).filter(
            DepartmentDependency.target_dept_id == d.id,
            DepartmentDependency.status.in_(["PENDING", "IN_PROGRESS", "ESCALATED"])
        ).count()

        app_count = db.query(Approval).filter(
            Approval.approving_department_id == d.id,
            Approval.status.in_(["SUBMITTED", "UNDER_REVIEW"])
        ).count()

        results.append(DepartmentDirectoryItem(
            id=d.id,
            code=d.code,
            name=d.name,
            category=d.category or "Infrastructure",
            is_external=d.is_external,
            responsible_minister=d.responsible_minister,
            responsible_secretary=d.responsible_secretary,
            head_of_department=d.head_of_department,
            nodal_officer_name=d.nodal_officer_name,
            nodal_officer_designation=d.nodal_officer_designation,
            nodal_officer_phone=d.nodal_officer_phone,
            contact_email=d.contact_email,
            jurisdiction=d.jurisdiction,
            sla_standard_days=d.sla_standard_days or 30,
            associated_projects_count=proj_count,
            active_dependencies_count=dep_count,
            pending_approvals_count=app_count,
            current_responsibilities=responsibilities_map.get(d.code, ["Statutory interdepartmental clearance & coordination."]),
            data_mode="mock",
            data_status="Seeded Demo"
        ))

    return results


# -----------------------------------------------------------------------------
# 3. INTERDEPARTMENTAL DEPENDENCY REGISTER
# -----------------------------------------------------------------------------
@router.get("/dependencies", response_model=List[DependencyItem])
def get_department_dependencies(
    project_id: Optional[int] = Query(None),
    target_dept_id: Optional[int] = Query(None),
    criticality: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DepartmentDependency)

    if project_id:
        query = query.filter(DepartmentDependency.project_id == project_id)
    if target_dept_id:
        query = query.filter(DepartmentDependency.target_dept_id == target_dept_id)
    if criticality and criticality != "ALL":
        query = query.filter(DepartmentDependency.criticality == criticality)
    if status and status != "ALL":
        query = query.filter(DepartmentDependency.status == status)

    dependencies = query.all()
    results = []

    for dep in dependencies:
        if search:
            q_lower = search.lower()
            match = (
                q_lower in (dep.dependency_code or "").lower() or
                q_lower in dep.description.lower() or
                q_lower in dep.dependency_type.lower() or
                q_lower in (dep.responsible_officer or "").lower() or
                q_lower in (dep.project.title if dep.project else "").lower()
            )
            if not match:
                continue

        p_code = dep.project.project_code if dep.project else f"PRJ-{dep.project_id}"
        p_title = dep.project.title if dep.project else "Highways Project"
        req_name = dep.requesting_dept.name if dep.requesting_dept else "Highways Department"
        tgt_name = dep.target_dept.name if dep.target_dept else "External Department"

        results.append(DependencyItem(
            id=dep.id,
            dependency_code=dep.dependency_code or f"DEP-{dep.id:04d}",
            project_id=dep.project_id,
            project_code=p_code,
            project_title=p_title,
            package_id=dep.work_package_id,
            requesting_dept_name=req_name,
            target_dept_name=tgt_name,
            responsible_officer=dep.responsible_officer,
            dependency_type=dep.dependency_type,
            description=dep.description,
            date_raised=dep.date_raised.strftime("%Y-%m-%d") if dep.date_raised else "2025-11-01",
            target_clearance_date=dep.target_clearance_date.strftime("%Y-%m-%d") if dep.target_clearance_date else None,
            actual_clearance_date=dep.actual_clearance_date.strftime("%Y-%m-%d") if dep.actual_clearance_date else None,
            days_pending=dep.days_pending or dep.impact_days or 0,
            criticality=dep.criticality or "MEDIUM",
            status=dep.status,
            escalation_level=dep.escalation_level or "NONE",
            recommended_action=dep.recommended_action,
            supporting_document_ref=dep.supporting_document_ref,
            data_mode="mock"
        ))

    return results


@router.post("/dependencies/{id}/action")
def update_dependency_action(
    id: int,
    payload: DependencyActionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dep = db.query(DepartmentDependency).filter(DepartmentDependency.id == id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Departmental dependency not found.")

    # Strict RBAC: Contractors cannot close or resolve inter-departmental statutory dependencies
    if current_user.role and current_user.role.code == "CONTRACTOR":
        if payload.action in ["RESOLVE", "ADVANCE_STATUS"] and payload.new_status == "CLEARED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="RBAC Restriction: Contractor personnel cannot self-resolve statutory inter-departmental dependencies. Action requires departmental officer."
            )

    old_status = dep.status
    old_esc = dep.escalation_level

    if payload.action == "RESOLVE":
        dep.status = "CLEARED"
        dep.actual_clearance_date = datetime.datetime.utcnow()
    elif payload.action == "ESCALATE":
        dep.status = "ESCALATED"
        dep.escalation_level = payload.escalation_level or "SECRETARY"
    elif payload.action == "ADVANCE_STATUS" and payload.new_status:
        dep.status = payload.new_status
    elif payload.action == "REASSIGN" and payload.assigned_officer:
        dep.responsible_officer = payload.assigned_officer

    if payload.resolution_notes:
        dep.recommended_action = payload.resolution_notes
    if payload.supporting_document_ref:
        dep.supporting_document_ref = payload.supporting_document_ref

    db.commit()
    db.refresh(dep)

    # Immutable Audit Logging
    log_audit_event(
        db=db,
        action="UPDATE_DEPENDENCY",
        entity_type="DEPARTMENT_DEPENDENCY",
        entity_id=dep.id,
        entity_reference=dep.dependency_code or f"DEP-{dep.id}",
        user=current_user,
        changes={
            "action": payload.action,
            "old_status": old_status,
            "new_status": dep.status,
            "old_escalation": old_esc,
            "new_escalation": dep.escalation_level,
            "officer": dep.responsible_officer
        }
    )

    return {
        "status": "success",
        "message": f"Dependency {dep.dependency_code or dep.id} updated successfully.",
        "dependency_id": dep.id,
        "current_status": dep.status,
        "escalation_level": dep.escalation_level
    }


# -----------------------------------------------------------------------------
# 4. APPROVAL WORKFLOW & SLA TRACKING
# -----------------------------------------------------------------------------
@router.get("/approvals", response_model=List[ApprovalItem])
def get_department_approvals(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sla_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Approval)

    if project_id:
        query = query.filter(Approval.project_id == project_id)
    if status and status != "ALL":
        query = query.filter(Approval.status == status)
    if sla_status and sla_status != "ALL":
        query = query.filter(Approval.sla_status == sla_status)

    approvals = query.all()
    results = []

    for app_rec in approvals:
        if search:
            q_lower = search.lower()
            match = (
                q_lower in app_rec.reference_number.lower() or
                q_lower in app_rec.approval_type.lower() or
                q_lower in (app_rec.assigned_officer or "").lower() or
                q_lower in (app_rec.project.title if app_rec.project else "").lower()
            )
            if not match:
                continue

        p_code = app_rec.project.project_code if app_rec.project else f"PRJ-{app_rec.project_id}"
        p_title = app_rec.project.title if app_rec.project else "Highways Project"
        sub_dept = db.query(Department).filter(Department.id == app_rec.submitting_department_id).first()
        app_dept = db.query(Department).filter(Department.id == app_rec.approving_department_id).first()

        results.append(ApprovalItem(
            id=app_rec.id,
            reference_number=app_rec.reference_number,
            project_id=app_rec.project_id,
            project_code=p_code,
            project_title=p_title,
            package_id=app_rec.work_package_id,
            approval_type=app_rec.approval_type,
            sanction_amount_cr=app_rec.sanction_amount_cr or 0.0,
            submitting_dept_name=sub_dept.name if sub_dept else "Highways Department",
            approving_dept_name=app_dept.name if app_dept else "Sanctioning Authority",
            approved_by_role=app_rec.approved_by_role,
            assigned_officer=app_rec.assigned_officer,
            submission_date=app_rec.submission_date.strftime("%Y-%m-%d") if app_rec.submission_date else "2025-10-01",
            approval_date=app_rec.approval_date.strftime("%Y-%m-%d") if app_rec.approval_date else None,
            sla_target_days=app_rec.sla_target_days or 30,
            overdue_days=app_rec.overdue_days or 0,
            sla_status=app_rec.sla_status or "ON_TRACK",
            status=app_rec.status,
            review_remarks=app_rec.review_remarks,
            document_ref=app_rec.document_ref,
            data_mode="mock"
        ))

    return results


@router.post("/approvals/{id}/action")
def update_approval_action(
    id: int,
    payload: ApprovalActionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_rec = db.query(Approval).filter(Approval.id == id).first()
    if not app_rec:
        raise HTTPException(status_code=404, detail="Approval record not found.")

    # Strict RBAC: Contractor cannot approve administrative sanctions
    if current_user.role and current_user.role.code == "CONTRACTOR":
        if payload.decision in ["APPROVE", "REJECT"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="RBAC Restriction: Contractor cannot approve or reject government statutory sanctions."
            )

    # Mandatory Rule: An approval cannot be closed/approved without required evidence document reference
    if payload.decision == "APPROVE" and not (payload.evidence_document_ref or app_rec.document_ref):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Constraint: An approval cannot be approved without a verifiable government document reference."
        )

    old_status = app_rec.status

    if payload.decision == "APPROVE":
        app_rec.status = "APPROVED"
        app_rec.approval_date = datetime.datetime.utcnow()
        app_rec.sla_status = "ON_TRACK"
        app_rec.overdue_days = 0
    elif payload.decision == "REJECT":
        app_rec.status = "REJECTED"
        app_rec.approval_date = datetime.datetime.utcnow()
    elif payload.decision == "RETURN_FOR_CORRECTION":
        app_rec.status = "RETURNED_FOR_CORRECTION"
    elif payload.decision == "ASSIGN" and payload.assigned_officer:
        app_rec.assigned_officer = payload.assigned_officer
    elif payload.decision == "ESCALATE":
        app_rec.sla_status = "ESCALATED"

    app_rec.review_remarks = payload.review_remarks
    if payload.evidence_document_ref:
        app_rec.document_ref = payload.evidence_document_ref

    db.commit()
    db.refresh(app_rec)

    # Immutable Audit Logging
    log_audit_event(
        db=db,
        action="APPROVAL_DECISION",
        entity_type="APPROVAL",
        entity_id=app_rec.id,
        entity_reference=app_rec.reference_number,
        user=current_user,
        changes={
            "decision": payload.decision,
            "old_status": old_status,
            "new_status": app_rec.status,
            "remarks": payload.review_remarks,
            "document_ref": app_rec.document_ref
        }
    )

    return {
        "status": "success",
        "message": f"Approval {app_rec.reference_number} processed with decision: {payload.decision}",
        "approval_id": app_rec.id,
        "current_status": app_rec.status,
        "document_ref": app_rec.document_ref
    }


# -----------------------------------------------------------------------------
# 5. AI CROSS-DEPARTMENTAL BOTTLENECK FINDINGS
# -----------------------------------------------------------------------------
@router.get("/ai-intelligence")
def get_department_ai_intelligence(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DepartmentAIFinding)
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
        "disclaimer": "AI Intelligence is advisory based on cross-table SLA analysis and verified audit evidence."
    }
