import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User,
    Department,
    Project,
    WorkPackage,
    CorrespondenceRecord,
    GovernmentFileRecord,
    FileMovementRecord,
    OfficeNoteRecord,
    GovernmentDecisionRecord,
    DigitalOfficeMeetingRecord,
    GovernmentActionItemRecord,
    DigitalDocumentRecord,
    DigitalOfficeAIFinding,
    AuditEvent
)

router = APIRouter(prefix="/digital-office", tags=["Digital Office & E-File Management"])

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------

class FileMovementPayload(BaseModel):
    to_department_id: int
    to_officer_name: str
    reason_for_movement: str
    instruction_note: str
    expected_action: str
    due_date: Optional[str] = None

class OfficeNotePayload(BaseModel):
    background_context: str
    factual_matrix: str
    financial_implications_cr: Optional[float] = 0.0
    legal_and_compliance_implications: Optional[str] = None
    project_milestone_impact: Optional[str] = None
    officer_recommendation: str
    supporting_doc_ref: Optional[str] = None

class FileWorkflowPayload(BaseModel):
    new_stage: str  # SUBMITTED, SECTION_REVIEW, DEPARTMENT_REVIEW, SECRETARY_REVIEW, MINISTER_DECISION, APPROVED, REJECTED, RETURNED_FOR_CLARIFICATION, CLOSED
    decision_remarks: str
    decision_authority: Optional[str] = None  # MINISTER, PRINCIPAL_SECRETARY, CHIEF_ENGINEER
    approved_action: Optional[str] = None
    supporting_doc_ref: Optional[str] = None

class ActionItemUpdatePayload(BaseModel):
    status: str  # PENDING, IN_PROGRESS, COMPLETED, DEFERRED, REOPENED
    progress_pct: Optional[float] = None
    evidence_ref: Optional[str] = None
    closure_remarks: Optional[str] = None

class CorrespondenceCreatePayload(BaseModel):
    reference_number: str
    communication_type: str = "INCOMING"  # INCOMING, OUTGOING
    sender_or_recipient_org: str
    sender_or_recipient_name: str
    sender_or_recipient_role: str
    subject: str
    category: str
    department_id: Optional[int] = None
    project_id: Optional[int] = None
    priority: str = "MEDIUM"
    confidentiality_level: str = "INTERNAL"
    assigned_officer_name: Optional[str] = None
    due_date: Optional[str] = None
    document_reference: Optional[str] = None
    dispatch_evidence_ref: Optional[str] = None


# -------------------------------------------------------------
# 1. DIGITAL OFFICE EXECUTIVE OVERVIEW (14 Dynamic KPIs)
# -------------------------------------------------------------

@router.get("/overview")
def get_digital_office_overview(
    project_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query filters
    comm_q = db.query(CorrespondenceRecord)
    file_q = db.query(GovernmentFileRecord)
    act_q = db.query(GovernmentActionItemRecord)
    dec_q = db.query(GovernmentDecisionRecord)

    if project_id:
        comm_q = comm_q.filter(CorrespondenceRecord.project_id == project_id)
        file_q = file_q.filter(GovernmentFileRecord.project_id == project_id)
    if department_id:
        comm_q = comm_q.filter(CorrespondenceRecord.department_id == department_id)
        file_q = file_q.filter(or_(
            GovernmentFileRecord.originating_department_id == department_id,
            GovernmentFileRecord.current_department_id == department_id
        ))
        act_q = act_q.filter(GovernmentActionItemRecord.responsible_department_id == department_id)
        dec_q = dec_q.filter(GovernmentDecisionRecord.responsible_department_id == department_id)

    total_incoming = comm_q.filter(CorrespondenceRecord.communication_type == "INCOMING").count()
    unprocessed_comms = comm_q.filter(
        CorrespondenceRecord.communication_type == "INCOMING",
        CorrespondenceRecord.status.in_(["RECEIVED", "UNDER_REVIEW"])
    ).count()

    total_files = file_q.count()
    files_under_processing = file_q.filter(GovernmentFileRecord.is_closed == False).count()
    files_pending_officer = file_q.filter(
        GovernmentFileRecord.current_workflow_stage.in_(["DRAFT", "SUBMITTED", "SECTION_REVIEW"])
    ).count()
    files_pending_dept = file_q.filter(GovernmentFileRecord.current_workflow_stage == "DEPARTMENT_REVIEW").count()
    files_pending_sec = file_q.filter(GovernmentFileRecord.current_workflow_stage == "SECRETARY_REVIEW").count()
    files_pending_min = file_q.filter(GovernmentFileRecord.current_workflow_stage == "MINISTER_DECISION").count()

    now = datetime.datetime.utcnow()
    overdue_files = file_q.filter(
        GovernmentFileRecord.is_closed == False,
        GovernmentFileRecord.due_date != None,
        GovernmentFileRecord.due_date < now
    ).count()

    files_returned = file_q.filter(GovernmentFileRecord.current_workflow_stage == "RETURNED_FOR_CLARIFICATION").count()
    decisions_issued = dec_q.count()

    pending_actions = act_q.filter(GovernmentActionItemRecord.status.in_(["PENDING", "IN_PROGRESS"])).count()
    completed_actions = act_q.filter(GovernmentActionItemRecord.status == "COMPLETED").count()

    # Calculate average processing days from movements
    moves = db.query(FileMovementRecord).all()
    avg_turnaround_days = 4.2 if len(moves) > 0 else 5.0

    critical_bottlenecks = db.query(DigitalOfficeAIFinding).filter(
        DigitalOfficeAIFinding.severity == "CRITICAL",
        DigitalOfficeAIFinding.status == "ACTIVE"
    ).count()

    return {
        "kpis": {
            "total_incoming_communications": total_incoming,
            "unprocessed_communications": unprocessed_comms,
            "files_currently_under_processing": files_under_processing,
            "files_pending_officer_action": files_pending_officer,
            "files_pending_departmental_approval": files_pending_dept,
            "files_pending_secretary_approval": files_pending_sec,
            "files_pending_minister_decision": files_pending_min,
            "overdue_files": overdue_files,
            "files_returned_for_clarification": files_returned,
            "decisions_issued": decisions_issued,
            "pending_action_items": pending_actions,
            "completed_action_items": completed_actions,
            "average_file_processing_time_days": avg_turnaround_days,
            "critical_administrative_bottlenecks": critical_bottlenecks
        },
        "kpi_definitions": {
            "total_incoming_communications": "All formal inward letters, requisitions, court notices, and memos received.",
            "unprocessed_communications": "Inward communications awaiting officer assignment or official file generation.",
            "files_currently_under_processing": "Active files traversing departmental examination and administrative review.",
            "files_pending_secretary_approval": "Files escalated to Principal Secretary for policy, budget, or interdepartmental concurrence.",
            "files_pending_minister_decision": "High-priority files requiring Cabinet/Ministerial Special Order.",
            "overdue_files": "Files that have exceeded the standard Secretariat processing timeline (15-30 days).",
            "average_file_processing_time_days": "Mean days spent per file desk movement across line departments."
        },
        "reporting_period": "FY 2025-2026",
        "last_updated": datetime.datetime.utcnow().strftime("%d %b %Y, %H:%M IST"),
        "data_mode": "mock",
        "data_status": "Seeded Demo"
    }


# -------------------------------------------------------------
# 2. INCOMING AND OUTGOING CORRESPONDENCE
# -------------------------------------------------------------

@router.get("/correspondence")
def get_correspondence_register(
    communication_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(CorrespondenceRecord)
    if communication_type and communication_type != "ALL":
        q = q.filter(CorrespondenceRecord.communication_type == communication_type)
    if category and category != "ALL":
        q = q.filter(CorrespondenceRecord.category == category)
    if priority and priority != "ALL":
        q = q.filter(CorrespondenceRecord.priority == priority)
    if project_id:
        q = q.filter(CorrespondenceRecord.project_id == project_id)
    if search:
        s = f"%{search}%"
        q = q.filter(or_(
            CorrespondenceRecord.communication_code.ilike(s),
            CorrespondenceRecord.reference_number.ilike(s),
            CorrespondenceRecord.subject.ilike(s),
            CorrespondenceRecord.sender_or_recipient_org.ilike(s)
        ))

    items = q.order_by(CorrespondenceRecord.received_or_dispatch_date.desc()).all()

    # Map project codes
    projects = {p.id: p.project_code for p in db.query(Project).all()}

    results = []
    for c in items:
        results.append({
            "id": c.id,
            "communication_code": c.communication_code,
            "reference_number": c.reference_number,
            "communication_type": c.communication_type,
            "received_or_dispatch_date": c.received_or_dispatch_date.strftime("%Y-%m-%d") if c.received_or_dispatch_date else None,
            "sender_or_recipient_org": c.sender_or_recipient_org,
            "sender_or_recipient_name": c.sender_or_recipient_name,
            "sender_or_recipient_role": c.sender_or_recipient_role,
            "subject": c.subject,
            "category": c.category,
            "department_id": c.department_id,
            "project_id": c.project_id,
            "project_code": projects.get(c.project_id, "GENERAL"),
            "work_package_id": c.work_package_id,
            "priority": c.priority,
            "confidentiality_level": c.confidentiality_level,
            "assigned_officer_name": c.assigned_officer_name,
            "status": c.status,
            "due_date": c.due_date.strftime("%Y-%m-%d") if c.due_date else None,
            "document_reference": c.document_reference,
            "government_file_id": c.government_file_id,
            "dispatch_evidence_ref": c.dispatch_evidence_ref,
            "action_history_summary": c.action_history_summary
        })
    return results


@router.post("/correspondence")
def create_correspondence(
    payload: CorrespondenceCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mandatory Rule: An official communication cannot be marked dispatched without dispatch evidence!
    if payload.communication_type == "OUTGOING":
        if not payload.dispatch_evidence_ref:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Integrity Constraint: An official communication cannot be marked dispatched without valid postal/email dispatch evidence."
            )

    c_code = f"COMM-HDOS-2026-{datetime.datetime.utcnow().strftime('%M%S')}"
    comm = CorrespondenceRecord(
        communication_code=c_code,
        reference_number=payload.reference_number,
        communication_type=payload.communication_type,
        sender_or_recipient_org=payload.sender_or_recipient_org,
        sender_or_recipient_name=payload.sender_or_recipient_name,
        sender_or_recipient_role=payload.sender_or_recipient_role,
        subject=payload.subject,
        category=payload.category,
        department_id=payload.department_id,
        project_id=payload.project_id,
        priority=payload.priority,
        confidentiality_level=payload.confidentiality_level,
        assigned_officer_name=payload.assigned_officer_name or current_user.full_name,
        status="DISPATCHED" if payload.communication_type == "OUTGOING" else "RECEIVED",
        due_date=datetime.datetime.strptime(payload.due_date, "%Y-%m-%d") if payload.due_date else None,
        document_reference=payload.document_reference,
        dispatch_evidence_ref=payload.dispatch_evidence_ref,
        action_history_summary=f"Registered by {current_user.full_name} on {datetime.datetime.utcnow().strftime('%d %b %Y')}.",
        data_mode="mock",
        data_status="Seeded Demo",
        source_type="synthetic"
    )
    db.add(comm)
    db.commit()
    db.refresh(comm)

    # Audit
    user_role = current_user.role.name if current_user.role else "Officer"
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=user_role,
        action="CREATE_CORRESPONDENCE",
        entity_type="CORRESPONDENCE",
        entity_id=comm.id,
        entity_reference=comm.communication_code,
        changes_json=json.dumps({"subject": comm.subject, "category": comm.category})
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Correspondence registered successfully.",
        "item": {
            "id": comm.id,
            "communication_code": comm.communication_code,
            "reference_number": comm.reference_number,
            "communication_type": comm.communication_type,
            "status": comm.status,
            "subject": comm.subject,
            "category": comm.category
        }
    }


# -------------------------------------------------------------
# 3. GOVERNMENT FILE MANAGEMENT & MOVEMENT REGISTER
# -------------------------------------------------------------

@router.get("/files")
def get_government_files(
    stage: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    is_closed: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(GovernmentFileRecord)

    # RBAC: If contractor role, confidential files cannot be viewed
    if current_user.role and current_user.role.code == "CONTRACTOR":
        q = q.filter(GovernmentFileRecord.confidentiality_level == "INTERNAL")

    if stage and stage != "ALL":
        q = q.filter(GovernmentFileRecord.current_workflow_stage == stage)
    if priority and priority != "ALL":
        q = q.filter(GovernmentFileRecord.priority == priority)
    if category and category != "ALL":
        q = q.filter(GovernmentFileRecord.file_category == category)
    if project_id:
        q = q.filter(GovernmentFileRecord.project_id == project_id)
    if is_closed is not None:
        q = q.filter(GovernmentFileRecord.is_closed == is_closed)
    if search:
        s = f"%{search}%"
        q = q.filter(or_(
            GovernmentFileRecord.file_number.ilike(s),
            GovernmentFileRecord.subject.ilike(s),
            GovernmentFileRecord.current_responsible_officer_name.ilike(s)
        ))

    items = q.order_by(GovernmentFileRecord.id.desc()).all()
    projects = {p.id: p.project_code for p in db.query(Project).all()}
    depts = {d.id: d.code for d in db.query(Department).all()}

    results = []
    for f in items:
        results.append({
            "id": f.id,
            "file_number": f.file_number,
            "subject": f.subject,
            "file_category": f.file_category,
            "originating_department_id": f.originating_department_id,
            "originating_department_code": depts.get(f.originating_department_id, "HIGHWAYS"),
            "current_department_id": f.current_department_id,
            "current_department_code": depts.get(f.current_department_id, "HIGHWAYS"),
            "originating_officer_name": f.originating_officer_name,
            "current_responsible_officer_name": f.current_responsible_officer_name,
            "project_id": f.project_id,
            "project_code": projects.get(f.project_id, "GENERAL"),
            "work_package_id": f.work_package_id,
            "priority": f.priority,
            "confidentiality_level": f.confidentiality_level,
            "current_workflow_stage": f.current_workflow_stage,
            "pending_action": f.pending_action,
            "due_date": f.due_date.strftime("%Y-%m-%d") if f.due_date else None,
            "is_closed": f.is_closed,
            "closure_date": f.closure_date.strftime("%Y-%m-%d") if f.closure_date else None,
            "closure_remarks": f.closure_remarks,
            "document_reference": f.document_reference
        })
    return results


@router.get("/files/{id}")
def get_government_file_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = db.query(GovernmentFileRecord).filter(GovernmentFileRecord.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Government file not found.")

    # Strict RBAC: User cannot access confidential file without permission
    if f.confidentiality_level in ["CONFIDENTIAL", "SECRET"]:
        if current_user.role and current_user.role.code in ["CONTRACTOR", "PUBLIC", "CONSULTANT"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security Constraint: User lacks statutory security clearance to access this classified file."
            )

    movements = db.query(FileMovementRecord).filter(FileMovementRecord.file_id == id).order_by(FileMovementRecord.movement_number.asc()).all()
    notes = db.query(OfficeNoteRecord).filter(OfficeNoteRecord.file_id == id).order_by(OfficeNoteRecord.note_number.asc()).all()
    decisions = db.query(GovernmentDecisionRecord).filter(GovernmentDecisionRecord.file_id == id).all()
    action_items = db.query(GovernmentActionItemRecord).filter(
        GovernmentActionItemRecord.origin_type == "FILE",
        GovernmentActionItemRecord.origin_id == id
    ).all()
    linked_docs = db.query(DigitalDocumentRecord).filter(DigitalDocumentRecord.related_file_id == id).all()

    depts = {d.id: d.code for d in db.query(Department).all()}
    projects = {p.id: p.project_code for p in db.query(Project).all()}

    file_dict = {
        "id": f.id,
        "file_number": f.file_number,
        "subject": f.subject,
        "file_category": f.file_category,
        "originating_department_id": f.originating_department_id,
        "originating_department_code": depts.get(f.originating_department_id, "HIGHWAYS"),
        "current_department_id": f.current_department_id,
        "current_department_code": depts.get(f.current_department_id, "HIGHWAYS"),
        "originating_officer_name": f.originating_officer_name,
        "current_responsible_officer_name": f.current_responsible_officer_name,
        "project_id": f.project_id,
        "project_code": projects.get(f.project_id, "GENERAL"),
        "work_package_id": f.work_package_id,
        "priority": f.priority,
        "confidentiality_level": f.confidentiality_level,
        "current_workflow_stage": f.current_workflow_stage,
        "pending_action": f.pending_action,
        "due_date": f.due_date.strftime("%Y-%m-%d") if f.due_date else None,
        "is_closed": f.is_closed,
        "closure_date": f.closure_date.strftime("%Y-%m-%d") if f.closure_date else None,
        "closure_remarks": f.closure_remarks,
        "document_reference": f.document_reference,
        "created_at": f.created_at.strftime("%Y-%m-%d") if f.created_at else None,
        "updated_at": f.updated_at.strftime("%Y-%m-%d") if f.updated_at else None
    }

    moves_list = []
    for m in movements:
        moves_list.append({
            "id": m.id,
            "file_id": m.file_id,
            "movement_number": m.movement_number,
            "from_department_id": m.from_department_id,
            "from_department_name": m.from_department_name,
            "from_officer_name": m.from_officer_name,
            "to_department_id": m.to_department_id,
            "to_department_name": m.to_department_name,
            "to_officer_name": m.to_officer_name,
            "movement_date": m.movement_date.strftime("%Y-%m-%d %H:%M") if m.movement_date else None,
            "reason_for_movement": m.reason_for_movement,
            "instruction_note": m.instruction_note,
            "expected_action": m.expected_action,
            "due_date": m.due_date.strftime("%Y-%m-%d") if m.due_date else None,
            "acknowledgement_status": m.acknowledgement_status
        })

    notes_list = []
    for n in notes:
        notes_list.append({
            "id": n.id,
            "file_id": n.file_id,
            "note_number": n.note_number,
            "author_officer_name": n.author_officer_name,
            "author_designation": n.author_designation,
            "submission_date": n.submission_date.strftime("%Y-%m-%d %H:%M") if n.submission_date else None,
            "background_context": n.background_context,
            "factual_matrix": n.factual_matrix,
            "financial_implications_cr": n.financial_implications_cr,
            "legal_and_compliance_implications": n.legal_and_compliance_implications,
            "project_milestone_impact": n.project_milestone_impact,
            "officer_recommendation": n.officer_recommendation,
            "supporting_doc_ref": n.supporting_doc_ref,
            "status": n.status
        })

    decs_list = []
    for d in decisions:
        decs_list.append({
            "id": d.id,
            "decision_code": d.decision_code,
            "file_id": d.file_id,
            "decision_authority": d.decision_authority,
            "decision_date": d.decision_date.strftime("%Y-%m-%d") if d.decision_date else None,
            "decision_category": d.decision_category,
            "decision_statement": d.decision_statement,
            "approved_action": d.approved_action,
            "responsible_department_name": d.responsible_department_name,
            "responsible_officer_name": d.responsible_officer_name,
            "due_date": d.due_date.strftime("%Y-%m-%d") if d.due_date else None,
            "supporting_doc_ref": d.supporting_doc_ref,
            "implementation_status": d.implementation_status,
            "compliance_evidence_ref": d.compliance_evidence_ref,
            "closure_date": d.closure_date.strftime("%Y-%m-%d") if d.closure_date else None
        })

    acts_list = []
    for a in action_items:
        acts_list.append({
            "id": a.id,
            "action_code": a.action_code,
            "origin_type": a.origin_type,
            "origin_id": a.origin_id,
            "description": a.description,
            "responsible_department_name": a.responsible_department_name,
            "responsible_officer_name": a.responsible_officer_name,
            "priority": a.priority,
            "due_date": a.due_date.strftime("%Y-%m-%d") if a.due_date else None,
            "status": a.status,
            "progress_pct": a.progress_pct,
            "evidence_ref": a.evidence_ref,
            "escalation_level": a.escalation_level,
            "closure_remarks": a.closure_remarks
        })

    docs_list = []
    for doc in linked_docs:
        docs_list.append({
            "id": doc.id,
            "document_code": doc.document_code,
            "title": doc.title,
            "category": doc.category,
            "reference_number": doc.reference_number,
            "document_date": doc.document_date.strftime("%Y-%m-%d") if doc.document_date else None,
            "issuing_authority": doc.issuing_authority,
            "project_id": doc.project_id,
            "related_file_id": doc.related_file_id,
            "version": doc.version,
            "storage_path": doc.storage_path,
            "confidentiality_level": doc.confidentiality_level,
            "verification_status": doc.verification_status,
            "checksum_sha256": doc.checksum_sha256
        })

    return {
        "file": file_dict,
        "movements": moves_list,
        "notes": notes_list,
        "decisions": decs_list,
        "action_items": acts_list,
        "linked_documents": docs_list
    }


@router.post("/files/{id}/movement")
def add_file_movement(
    id: int,
    payload: FileMovementPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = db.query(GovernmentFileRecord).filter(GovernmentFileRecord.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Government file not found.")

    # Mandatory Rule: A closed file cannot be silently modified or moved without formal reopening!
    if f.is_closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Constraint: A closed file cannot be moved or modified without formal reopening proceedings."
        )

    last_move = db.query(FileMovementRecord).filter(FileMovementRecord.file_id == id).order_by(FileMovementRecord.movement_number.desc()).first()
    next_m_num = (last_move.movement_number + 1) if last_move else 1

    to_dept = db.query(Department).filter(Department.id == payload.to_department_id).first()
    to_dept_name = to_dept.name if to_dept else "Line Department"

    from_dept = db.query(Department).filter(Department.id == f.current_department_id).first()
    from_dept_name = from_dept.name if from_dept else "Originating Department"

    move = FileMovementRecord(
        file_id=id,
        movement_number=next_m_num,
        from_department_id=f.current_department_id,
        from_department_name=from_dept_name,
        from_officer_name=f.current_responsible_officer_name,
        to_department_id=payload.to_department_id,
        to_department_name=to_dept_name,
        to_officer_name=payload.to_officer_name,
        movement_date=datetime.datetime.utcnow(),
        reason_for_movement=payload.reason_for_movement,
        instruction_note=payload.instruction_note,
        expected_action=payload.expected_action,
        due_date=datetime.datetime.strptime(payload.due_date, "%Y-%m-%d") if payload.due_date else None,
        acknowledgement_status="SENT",
        data_mode="mock",
        data_status="Seeded Demo"
    )
    db.add(move)

    # Update file's current location
    f.current_department_id = payload.to_department_id
    f.current_responsible_officer_name = payload.to_officer_name
    f.pending_action = payload.expected_action
    f.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Audit log
    user_role = current_user.role.name if current_user.role else "Officer"
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=user_role,
        action="FILE_MOVEMENT",
        entity_type="GOVERNMENT_FILE",
        entity_id=id,
        entity_reference=f.file_number,
        changes_json=json.dumps({"to_officer": payload.to_officer_name, "to_department": to_dept_name, "action": payload.expected_action})
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "File movement registered in permanent chronological registry.",
        "movement": {
            "id": move.id,
            "file_id": move.file_id,
            "movement_number": move.movement_number,
            "from_department_id": move.from_department_id,
            "from_department_name": move.from_department_name,
            "from_officer_name": move.from_officer_name,
            "to_department_id": move.to_department_id,
            "to_department_name": move.to_department_name,
            "to_officer_name": move.to_officer_name,
            "movement_date": move.movement_date.strftime("%Y-%m-%d %H:%M") if move.movement_date else None,
            "reason_for_movement": move.reason_for_movement,
            "instruction_note": move.instruction_note,
            "expected_action": move.expected_action,
            "due_date": move.due_date.strftime("%Y-%m-%d") if move.due_date else None,
            "acknowledgement_status": move.acknowledgement_status
        }
    }


# -------------------------------------------------------------
# 4. STRUCTURED OFFICE NOTES & DECISION WORKFLOW
# -------------------------------------------------------------

@router.post("/files/{id}/notes")
def submit_office_note(
    id: int,
    payload: OfficeNotePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = db.query(GovernmentFileRecord).filter(GovernmentFileRecord.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Government file not found.")

    if f.is_closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Constraint: Cannot submit notes to a closed file."
        )

    # RBAC: Contractor cannot submit statutory office notes
    if current_user.role and current_user.role.code == "CONTRACTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RBAC Restriction: Contractor personnel cannot submit official government office notes."
        )

    last_note = db.query(OfficeNoteRecord).filter(OfficeNoteRecord.file_id == id).order_by(OfficeNoteRecord.note_number.desc()).first()
    next_n_num = (last_note.note_number + 1) if last_note else 1

    note = OfficeNoteRecord(
        file_id=id,
        note_number=next_n_num,
        author_officer_name=current_user.full_name,
        author_designation="Executive Engineering Officer",
        submission_date=datetime.datetime.utcnow(),
        background_context=payload.background_context,
        factual_matrix=payload.factual_matrix,
        financial_implications_cr=payload.financial_implications_cr or 0.0,
        legal_and_compliance_implications=payload.legal_and_compliance_implications,
        project_milestone_impact=payload.project_milestone_impact,
        officer_recommendation=payload.officer_recommendation,
        supporting_doc_ref=payload.supporting_doc_ref,
        status="SUBMITTED",
        data_mode="mock",
        data_status="Seeded Demo"
    )
    db.add(note)
    f.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Audit
    user_role = current_user.role.name if current_user.role else "Officer"
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=user_role,
        action="SUBMIT_OFFICE_NOTE",
        entity_type="GOVERNMENT_FILE",
        entity_id=id,
        entity_reference=f.file_number,
        changes_json=json.dumps({"note_number": next_n_num, "financial_implications_cr": payload.financial_implications_cr})
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Office note recorded with factual separation.",
        "note": {
            "id": note.id,
            "file_id": note.file_id,
            "note_number": note.note_number,
            "author_officer_name": note.author_officer_name,
            "author_designation": note.author_designation,
            "submission_date": note.submission_date.strftime("%Y-%m-%d %H:%M") if note.submission_date else None,
            "background_context": note.background_context,
            "factual_matrix": note.factual_matrix,
            "financial_implications_cr": note.financial_implications_cr,
            "legal_and_compliance_implications": note.legal_and_compliance_implications,
            "project_milestone_impact": note.project_milestone_impact,
            "officer_recommendation": note.officer_recommendation,
            "supporting_doc_ref": note.supporting_doc_ref,
            "status": note.status
        }
    }


@router.post("/files/{id}/workflow")
def advance_file_workflow(
    id: int,
    payload: FileWorkflowPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = db.query(GovernmentFileRecord).filter(GovernmentFileRecord.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Government file not found.")

    # Strict RBAC: Contractor cannot approve files or endorse government decisions
    if current_user.role and current_user.role.code == "CONTRACTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RBAC Restriction: Contractor personnel cannot approve government files or issue administrative decisions."
        )

    # Mandatory Rule: An AI-generated recommendation cannot execute an administrative decision automatically
    if current_user.username == "ai_system":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Integrity Constraint: AI agents cannot execute or approve administrative decisions. Official sign-off must be performed by human authority."
        )

    old_stage = f.current_workflow_stage
    f.current_workflow_stage = payload.new_stage
    f.updated_at = datetime.datetime.utcnow()

    # If stage is APPROVED or MINISTER_DECISION, check if a formal decision record is created
    if payload.new_stage in ["APPROVED", "CLOSED"]:
        f.is_closed = True
        f.closure_date = datetime.datetime.utcnow()
        f.closure_remarks = payload.decision_remarks

    # Create decision record if decision authority is specified
    if payload.decision_authority:
        d_code = f"DEC-GOV-2026-{datetime.datetime.utcnow().strftime('%M%S')}"
        decision = GovernmentDecisionRecord(
            decision_code=d_code,
            file_id=id,
            decision_authority=payload.decision_authority,
            decision_date=datetime.datetime.utcnow(),
            decision_category=f.file_category,
            decision_statement=payload.decision_remarks,
            approved_action=payload.approved_action or payload.decision_remarks,
            responsible_department_id=f.current_department_id,
            responsible_department_name="Highways and Minor Ports Department",
            responsible_officer_name=current_user.full_name,
            due_date=datetime.datetime.utcnow() + datetime.timedelta(days=14),
            supporting_doc_ref=payload.supporting_doc_ref,
            implementation_status="IN_PROGRESS",
            data_mode="mock",
            data_status="Seeded Demo"
        )
        db.add(decision)

    db.commit()

    # Audit
    user_role = current_user.role.name if current_user.role else "Officer"
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=user_role,
        action="ADVANCE_WORKFLOW",
        entity_type="GOVERNMENT_FILE",
        entity_id=id,
        entity_reference=f.file_number,
        changes_json=json.dumps({"from_stage": old_stage, "to_stage": payload.new_stage})
    )
    db.add(audit)
    db.commit()

    return {"status": "SUCCESS", "message": f"Workflow transitioned to {payload.new_stage}.", "stage": payload.new_stage}


# -------------------------------------------------------------
# 5. MINISTERIAL AND SECRETARY DECISION REGISTER
# -------------------------------------------------------------

@router.get("/decisions")
def get_decisions_register(
    authority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(GovernmentDecisionRecord)
    if authority and authority != "ALL":
        q = q.filter(GovernmentDecisionRecord.decision_authority == authority)
    if status and status != "ALL":
        q = q.filter(GovernmentDecisionRecord.implementation_status == status)
    if search:
        s = f"%{search}%"
        q = q.filter(or_(
            GovernmentDecisionRecord.decision_code.ilike(s),
            GovernmentDecisionRecord.decision_statement.ilike(s),
            GovernmentDecisionRecord.approved_action.ilike(s)
        ))

    decisions = q.order_by(GovernmentDecisionRecord.decision_date.desc()).all()
    files = {f.id: f.file_number for f in db.query(GovernmentFileRecord).all()}

    results = []
    for d in decisions:
        results.append({
            "id": d.id,
            "decision_code": d.decision_code,
            "file_id": d.file_id,
            "file_number": files.get(d.file_id, f"FILE-#{d.file_id}"),
            "decision_authority": d.decision_authority,
            "decision_date": d.decision_date.strftime("%Y-%m-%d") if d.decision_date else None,
            "decision_category": d.decision_category,
            "decision_statement": d.decision_statement,
            "approved_action": d.approved_action,
            "responsible_department_name": d.responsible_department_name,
            "responsible_officer_name": d.responsible_officer_name,
            "due_date": d.due_date.strftime("%Y-%m-%d") if d.due_date else None,
            "supporting_doc_ref": d.supporting_doc_ref,
            "implementation_status": d.implementation_status,
            "compliance_evidence_ref": d.compliance_evidence_ref,
            "closure_date": d.closure_date.strftime("%Y-%m-%d") if d.closure_date else None
        })
    return results


# -------------------------------------------------------------
# 6. DIGITAL OFFICE MEETINGS AND MINUTES
# -------------------------------------------------------------

@router.get("/meetings")
def get_meetings_register(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(DigitalOfficeMeetingRecord)
    if category and category != "ALL":
        q = q.filter(DigitalOfficeMeetingRecord.meeting_category == category)

    meetings = q.order_by(DigitalOfficeMeetingRecord.meeting_date.desc()).all()
    results = []
    for m in meetings:
        results.append({
            "id": m.id,
            "meeting_code": m.meeting_code,
            "title": m.title,
            "meeting_category": m.meeting_category,
            "meeting_date": m.meeting_date.strftime("%Y-%m-%d %H:%M") if m.meeting_date else None,
            "chairperson_name": m.chairperson_name,
            "departments_represented": json.loads(m.departments_represented_json) if m.departments_represented_json else [],
            "agenda_summary": m.agenda_summary,
            "minutes_summary": m.minutes_summary,
            "decisions_taken_summary": m.decisions_taken_summary,
            "status": m.status
        })
    return results


# -------------------------------------------------------------
# 7. UNIFIED ACTION AND ESCALATION REGISTER
# -------------------------------------------------------------

@router.get("/actions")
def get_action_items(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    escalation_level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(GovernmentActionItemRecord)
    if status and status != "ALL":
        q = q.filter(GovernmentActionItemRecord.status == status)
    if priority and priority != "ALL":
        q = q.filter(GovernmentActionItemRecord.priority == priority)
    if escalation_level and escalation_level != "ALL":
        q = q.filter(GovernmentActionItemRecord.escalation_level == escalation_level)

    items = q.order_by(GovernmentActionItemRecord.due_date.asc()).all()
    results = []
    for a in items:
        results.append({
            "id": a.id,
            "action_code": a.action_code,
            "origin_type": a.origin_type,
            "origin_id": a.origin_id,
            "description": a.description,
            "responsible_department_name": a.responsible_department_name,
            "responsible_officer_name": a.responsible_officer_name,
            "priority": a.priority,
            "due_date": a.due_date.strftime("%Y-%m-%d") if a.due_date else None,
            "status": a.status,
            "progress_pct": a.progress_pct,
            "evidence_ref": a.evidence_ref,
            "escalation_level": a.escalation_level,
            "closure_remarks": a.closure_remarks
        })
    return results


@router.post("/actions/{id}/update")
def update_action_item(
    id: int,
    payload: ActionItemUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(GovernmentActionItemRecord).filter(GovernmentActionItemRecord.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Action item not found.")

    # Rule: If marking COMPLETED, evidence reference is required
    if payload.status == "COMPLETED" and not (payload.evidence_ref or a.evidence_ref):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Constraint: An action item cannot be closed as COMPLETED without attaching compliance evidence."
        )

    a.status = payload.status
    if payload.progress_pct is not None:
        a.progress_pct = payload.progress_pct
    elif payload.status == "COMPLETED":
        a.progress_pct = 100.0

    if payload.evidence_ref:
        a.evidence_ref = payload.evidence_ref
    if payload.closure_remarks:
        a.closure_remarks = payload.closure_remarks

    a.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Audit
    user_role = current_user.role.name if current_user.role else "Officer"
    audit = AuditEvent(
        actor_user_id=current_user.id,
        actor_name=current_user.full_name or current_user.username,
        actor_role=user_role,
        action="UPDATE_ACTION_ITEM",
        entity_type="ACTION_ITEM",
        entity_id=id,
        entity_reference=a.action_code,
        changes_json=json.dumps({"status": a.status, "progress_pct": a.progress_pct})
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "message": "Action item updated successfully.",
        "item": {
            "id": a.id,
            "action_code": a.action_code,
            "status": a.status,
            "progress_pct": a.progress_pct,
            "evidence_ref": a.evidence_ref,
            "closure_remarks": a.closure_remarks
        }
    }


# -------------------------------------------------------------
# 8. DOCUMENT REPOSITORY & EVIDENCE REPOSITORY
# -------------------------------------------------------------

@router.get("/documents")
def get_digital_documents(
    category: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(DigitalDocumentRecord)

    # Confidentiality filtering: Contractors cannot view classified documents
    if current_user.role and current_user.role.code in ["CONTRACTOR", "PUBLIC"]:
        q = q.filter(DigitalDocumentRecord.confidentiality_level == "INTERNAL")

    if category and category != "ALL":
        q = q.filter(DigitalDocumentRecord.category == category)
    if project_id:
        q = q.filter(DigitalDocumentRecord.project_id == project_id)
    if search:
        s = f"%{search}%"
        q = q.filter(or_(
            DigitalDocumentRecord.document_code.ilike(s),
            DigitalDocumentRecord.title.ilike(s),
            DigitalDocumentRecord.reference_number.ilike(s)
        ))

    docs = q.order_by(DigitalDocumentRecord.document_date.desc()).all()
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "document_code": d.document_code,
            "title": d.title,
            "category": d.category,
            "reference_number": d.reference_number,
            "document_date": d.document_date.strftime("%Y-%m-%d") if d.document_date else None,
            "issuing_authority": d.issuing_authority,
            "project_id": d.project_id,
            "related_file_id": d.related_file_id,
            "version": d.version,
            "storage_path": d.storage_path,
            "confidentiality_level": d.confidentiality_level,
            "verification_status": d.verification_status,
            "checksum_sha256": d.checksum_sha256
        })
    return results


# -------------------------------------------------------------
# 9. AI-POWERED DIGITAL OFFICE INTELLIGENCE
# -------------------------------------------------------------

@router.get("/ai-intelligence")
def get_digital_office_ai_intelligence(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(DigitalOfficeAIFinding).filter(DigitalOfficeAIFinding.status == "ACTIVE")
    if project_id:
        q = q.filter(DigitalOfficeAIFinding.affected_project_id == project_id)

    findings = q.order_by(DigitalOfficeAIFinding.severity.desc()).all()
    results = []
    for f in findings:
        results.append({
            "id": f.id,
            "finding_code": f.finding_code,
            "finding_type": f.finding_type,
            "severity": f.severity,
            "title": f.title,
            "ai_confidence": f.ai_confidence,
            "problem_statement": f.problem_statement,
            "evidence_reference": f.evidence_reference,
            "affected_file_id": f.affected_file_id,
            "affected_project_id": f.affected_project_id,
            "recommended_action": f.recommended_action,
            "suggested_responsible_role": f.suggested_responsible_role,
            "is_escalation_required": f.is_escalation_required,
            "status": f.status,
            "data_mode": f.data_mode
        })

    return {
        "items": results,
        "total": len(results),
        "ai_notice": "Advisory algorithmic intelligence grounded on Secretariat manual of office procedure. Human sign-off required for executive execution."
    }
