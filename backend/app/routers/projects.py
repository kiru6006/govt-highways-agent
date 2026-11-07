from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import (
    Project, User, Road, Contractor, WorkPackage, Contract, ProjectStakeholder,
    StakeholderResponsibility, DepartmentDependency, Approval, Issue, Document,
    EvidenceRecord, LandParcel, LegalCase, ProjectConsultant, AIIntelligenceFinding,
    AuditEvent, QualityDefectRecord, Official, Zone, Circle, Division,
    ProjectMilestone, ProjectRisk, ProjectProgressRecord
)
from app.schemas import (
    ProjectOut, ProjectCreate, Project360DetailOut, ProjectMilestoneOut,
    ProjectRiskOut, ProjectProgressRecordOut, EVMVarianceMetrics, WorkPackageOut,
    ApprovalOut, ProjectStakeholderOut, DocumentOut, AIIntelligenceFindingOut,
    AuditEventOut, DependencyOut, LandParcelOut, LegalCaseOut
)
from app.auth import get_current_user, check_project_jurisdiction, require_roles
from app.services.audit import log_audit_event
import datetime

router = APIRouter(prefix="/projects", tags=["Projects & Roads"])

def build_project_out(p: Project) -> ProjectOut:
    return ProjectOut(
        id=p.id,
        project_code=p.project_code,
        title=p.title,
        description=p.description,
        road_type=p.road_type,
        estimated_cost_cr=p.estimated_cost_cr,
        sanctioned_cost_cr=p.sanctioned_cost_cr,
        expenditure_to_date_cr=p.expenditure_to_date_cr,
        physical_progress_pct=p.physical_progress_pct,
        financial_progress_pct=p.financial_progress_pct,
        status=p.status,
        priority=p.priority,
        zone_id=p.zone_id,
        circle_id=p.circle_id,
        division_id=p.division_id,
        contractor_id=p.contractor_id,
        contractor_name=p.contractor.company_name if p.contractor else None,
        road_name=p.road.name if p.road else None,
        created_at=p.created_at,
        start_date=p.start_date,
        target_completion_date=p.target_completion_date,
        actual_completion_date=p.actual_completion_date,
        planned_start_date=p.planned_start_date,
        planned_completion_date=p.planned_completion_date,
        revised_cost_cr=p.revised_cost_cr,
        sanction_as_number=p.sanction_as_number,
        sanction_as_date=p.sanction_as_date,
        sanction_ts_number=p.sanction_ts_number,
        sanction_ts_date=p.sanction_ts_date,
        carriageway_width_m=p.carriageway_width_m,
        lane_configuration=p.lane_configuration,
        pavement_type=p.pavement_type,
        total_length_km=p.total_length_km,
        start_chainage_km=p.start_chainage_km,
        end_chainage_km=p.end_chainage_km,
        funding_source=p.funding_source,
        project_director_name=p.project_director_name,
        responsible_ee_name=p.responsible_ee_name,
        programme_id=p.programme_id,
        programme_code=p.programme.code if p.programme else None,
        verification_status=p.verification_status or "Verified"
    )

@router.get("", response_model=List[ProjectOut])
def list_projects(
    zone_id: Optional[int] = None,
    circle_id: Optional[int] = None,
    division_id: Optional[int] = None,
    road_type: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    programme_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    
    role_code = current_user.role.code if current_user.role else ""
    
    # Contractor isolation: Contractors can ONLY see their assigned projects
    if role_code == "CONTRACTOR":
        if current_user.contractor_id is None:
            return []
        query = query.filter(Project.contractor_id == current_user.contractor_id)
    # Zonal officer restriction
    elif role_code == "ZONAL_CE" and current_user.zone_id:
        query = query.filter(Project.zone_id == current_user.zone_id)
    # Circle officer restriction
    elif role_code == "SE_CIRCLE" and current_user.circle_id:
        query = query.filter(Project.circle_id == current_user.circle_id)
    # Division officer restriction
    elif role_code in ["EE_DIV", "ADE_SUBDIV", "JE_FIELD"] and current_user.division_id:
        query = query.filter(Project.division_id == current_user.division_id)
    
    if zone_id:
        query = query.filter(Project.zone_id == zone_id)
    if circle_id:
        query = query.filter(Project.circle_id == circle_id)
    if division_id:
        query = query.filter(Project.division_id == division_id)
    if road_type and road_type != "ALL":
        query = query.filter(Project.road_type == road_type)
    if status and status != "ALL":
        query = query.filter(Project.status == status)
    if priority and priority != "ALL":
        query = query.filter(Project.priority == priority)
    if programme_id:
        query = query.filter(Project.programme_id == programme_id)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Project.project_code.ilike(s_term)) |
            (Project.title.ilike(s_term)) |
            (Project.description.ilike(s_term))
        )
        
    projects = query.offset(skip).limit(limit).all()
    return [build_project_out(p) for p in projects]

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Enforce jurisdiction
    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: You do not have jurisdiction clearance for Project '{project.project_code}'"
        )
        
    return build_project_out(project)

@router.post("/{project_id}/actions")
def create_project_action(
    project_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    action_id = f"ACT-{project.project_code}-{datetime.datetime.utcnow().strftime('%M%S')}"
    new_action = {
        "action_id": action_id,
        "issue": payload.get("issue", "Project directive"),
        "department": payload.get("department", "Highways Department"),
        "assigned_officer": payload.get("assigned_officer", current_user.full_name),
        "priority": payload.get("priority", "HIGH"),
        "target_date": payload.get("target_date", "2026-11-30"),
        "status": payload.get("status", "ASSIGNED"),
        "remarks": payload.get("remarks", "Direct executive instruction")
    }

    log_audit_event(
        db=db,
        action="CREATE_ACTION",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=action_id,
        user=current_user,
        changes=new_action
    )

    return {"message": "Action assigned successfully", "action": new_action}

@router.post("/{project_id}/quality-observations")
def create_project_quality_observation(
    project_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    defect_code = f"QC-{project.project_code}-{datetime.datetime.utcnow().strftime('%M%S')}"
    new_obs = QualityDefectRecord(
        defect_code=defect_code,
        project_id=project.id,
        road_id=project.road_id,
        defect_type=payload.get("defect_type", "Open NCR"),
        observation_notes=payload.get("observation_notes", "Observation logged during inspection"),
        severity=payload.get("severity", "MEDIUM"),
        corrective_action_status=payload.get("status", "PENDING_RECTIFICATION"),
        responsible_engineer=payload.get("responsible_engineer", current_user.full_name)
    )
    db.add(new_obs)
    db.commit()
    db.refresh(new_obs)

    log_audit_event(
        db=db,
        action="CREATE_QUALITY_DEFECT",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=defect_code,
        user=current_user,
        changes={"defect_code": defect_code, "severity": new_obs.severity}
    )

    return {
        "message": "Quality observation recorded successfully",
        "record": {
            "defect_reference": new_obs.defect_code,
            "component_type": new_obs.defect_type,
            "description": new_obs.observation_notes,
            "severity": new_obs.severity,
            "status": new_obs.corrective_action_status
        }
    }


@router.get("/{project_id}/360", response_model=Project360DetailOut)
def get_project_360(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unified Project 360° Intelligence Dossier:
    Aggregates all 17 linked facets from administrative sanction to execution, EVM tracking,
    contractors, milestones, land acquisition, utility clearances, legal cases, and AI findings.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: You do not have jurisdiction clearance for Project '{project.project_code}'"
        )

    # 1. Identity & Technical Specs
    zone = db.query(Zone).filter(Zone.id == project.zone_id).first()
    circle = db.query(Circle).filter(Circle.id == project.circle_id).first()
    division = db.query(Division).filter(Division.id == project.division_id).first()

    jurisdiction_hierarchy = {
        "zone_name": zone.name if zone else "Tamil Nadu Statewide",
        "circle_name": circle.name if circle else "Headquarters Circle",
        "division_name": division.name if division else "Executing Division",
        "district": circle.name.replace("Circle", "").strip() if circle else "Statewide"
    }

    technical_specs = {
        "road_name": project.road.name if project.road else "Highways Strategic Corridor",
        "road_code": project.road.code if project.road else project.road_type,
        "road_type": project.road_type,
        "carriageway_width_m": project.carriageway_width_m or 7.0,
        "lane_configuration": project.lane_configuration or "2-Lane with Paved Shoulder",
        "pavement_type": project.pavement_type or "Flexible (Bituminous Concrete)",
        "total_length_km": project.total_length_km or (project.road.total_length_km if project.road else 25.0),
        "start_chainage_km": project.start_chainage_km or (project.road.start_chainage if project.road else 0.0),
        "end_chainage_km": project.end_chainage_km or (project.road.end_chainage if project.road else 25.0),
        "terrain": "Plain / Coastal Corridor",
        "funding_programme": project.funding_source or (project.programme.name if project.programme else "CRIDP State Fund")
    }

    # 2. Sanctions (Approvals)
    approvals = db.query(Approval).filter(Approval.project_id == project_id).all()
    sanctions_out = [
        ApprovalOut(
            id=a.id,
            project_id=a.project_id,
            approval_type=a.approval_type,
            reference_number=a.reference_number,
            sanction_amount_cr=a.sanction_amount_cr,
            approved_by_role=a.approved_by_role,
            status=a.status,
            approval_date=a.approval_date
        ) for a in approvals
    ]

    # 3. Milestones
    milestones = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project_id
    ).order_by(ProjectMilestone.target_date.asc()).all()

    milestones_out = [
        ProjectMilestoneOut(
            id=m.id,
            project_id=m.project_id,
            work_package_id=m.work_package_id,
            milestone_code=m.milestone_code,
            title=m.title,
            description=m.description,
            target_date=m.target_date,
            actual_date=m.actual_date,
            target_physical_pct=m.target_physical_pct,
            actual_physical_pct=m.actual_physical_pct,
            delay_days=m.delay_days,
            status=m.status,
            weightage_pct=m.weightage_pct
        ) for m in milestones
    ]

    # 4. Progress History & EVM Calculations
    progress_records = db.query(ProjectProgressRecord).filter(
        ProjectProgressRecord.project_id == project_id
    ).order_by(ProjectProgressRecord.reporting_month.asc()).all()

    progress_history_out = [
        ProjectProgressRecordOut(
            id=pr.id,
            project_id=pr.project_id,
            reporting_month=pr.reporting_month,
            planned_physical_pct=pr.planned_physical_pct,
            actual_physical_pct=pr.actual_physical_pct,
            planned_financial_pct=pr.planned_financial_pct,
            actual_financial_pct=pr.actual_financial_pct,
            expenditure_in_month_cr=pr.expenditure_in_month_cr,
            cumulative_expenditure_cr=pr.cumulative_expenditure_cr,
            earned_value_cr=pr.earned_value_cr,
            planned_value_cr=pr.planned_value_cr,
            cost_variance_cr=pr.cost_variance_cr,
            schedule_variance_cr=pr.schedule_variance_cr,
            remarks=pr.remarks,
            created_at=pr.created_at
        ) for pr in progress_records
    ]

    # Calculate EVM Metrics
    # EV = Sanctioned Cost * (Actual Physical % / 100)
    # PV = Sanctioned Cost * (Planned Physical % / 100)
    # AC = Actual Expenditure
    # CV = EV - AC; SV = EV - PV
    # CPI = EV / AC; SPI = EV / PV
    latest_progress = progress_records[-1] if progress_records else None
    planned_phys = latest_progress.planned_physical_pct if latest_progress else (project.physical_progress_pct + 12.0)
    planned_fin = latest_progress.planned_financial_pct if latest_progress else (project.financial_progress_pct + 10.0)

    sanction_cost = project.sanctioned_cost_cr
    ev = sanction_cost * (project.physical_progress_pct / 100.0)
    pv = sanction_cost * (min(planned_phys, 100.0) / 100.0)
    ac = project.expenditure_to_date_cr

    cv = ev - ac
    sv = ev - pv
    cpi = (ev / ac) if ac > 0 else 1.0
    spi = (ev / pv) if pv > 0 else 1.0

    max_delay = max([m.delay_days for m in milestones], default=0)

    if project.status == "COMPLETED":
        status_assessment = "ON_TRACK"
    elif max_delay > 60 or sv < -15.0 or project.status == "DELAYED":
        status_assessment = "CRITICAL_DELAY"
    elif max_delay > 15 or sv < -5.0 or cv < -5.0:
        status_assessment = "AT_RISK"
    else:
        status_assessment = "ON_TRACK"

    execution_tracking = EVMVarianceMetrics(
        planned_value_cr=round(pv, 2),
        earned_value_cr=round(ev, 2),
        actual_cost_cr=round(ac, 2),
        cost_variance_cr=round(cv, 2),
        schedule_variance_cr=round(sv, 2),
        cost_performance_index=round(cpi, 3),
        schedule_performance_index=round(spi, 3),
        schedule_variance_days=max_delay,
        planned_physical_pct=round(planned_phys, 1),
        actual_physical_pct=round(project.physical_progress_pct, 1),
        physical_variance_pct=round(project.physical_progress_pct - planned_phys, 1),
        planned_financial_pct=round(planned_fin, 1),
        actual_financial_pct=round(project.financial_progress_pct, 1),
        financial_variance_pct=round(project.financial_progress_pct - planned_fin, 1),
        status_assessment=status_assessment
    )

    # 5. Work Packages
    pkgs = db.query(WorkPackage).filter(WorkPackage.project_id == project_id).all()
    work_packages_out = [
        WorkPackageOut(
            id=wp.id,
            project_id=wp.project_id,
            package_number=wp.package_number,
            title=wp.title,
            scope_description=wp.scope_description,
            cost_cr=wp.cost_cr,
            start_km=wp.start_km,
            end_km=wp.end_km,
            status=wp.status
        ) for wp in pkgs
    ]

    # 6. Contractors & Consultants
    contracts = db.query(Contract).filter(Contract.project_id == project_id).all()
    consultants = db.query(ProjectConsultant).filter(ProjectConsultant.project_id == project_id).all()

    contractors_and_consultants = {
        "main_contractor": {
            "name": project.contractor.company_name if project.contractor else "Under Competitive Bidding",
            "registration": project.contractor.registration_number if project.contractor else "N/A",
            "class": project.contractor.class_category if project.contractor else "Class I (Unlimited)",
            "pan": project.contractor.pan if project.contractor else None,
            "gst": project.contractor.gst if project.contractor else None
        },
        "contracts": [
            {
                "agreement_number": c.agreement_number,
                "agreement_date": c.agreement_date,
                "contract_value_cr": c.contract_value_cr,
                "performance_security_cr": c.performance_security_cr,
                "status": c.status
            } for c in contracts
        ],
        "consultants": [
            {
                "company_name": pc.consultant.company_name if pc.consultant else "Empanelled Consultant",
                "assignment_title": pc.assignment_title,
                "contract_value_cr": pc.contract_value_cr,
                "status": pc.status
            } for pc in consultants
        ]
    }

    # 7. Assigned Officials & Stakeholders
    stakeholders = db.query(ProjectStakeholder).filter(ProjectStakeholder.project_id == project_id).all()
    officials_out = []
    
    # Add leadership & engineering chain
    officials_out.append(ProjectStakeholderOut(
        id=1,
        stakeholder_type="APEX_SECRETARIAT",
        department_name="Highways & Minor Ports Department",
        contact_person="Thiru Shunchonngam Jatak Chiru, IAS",
        email="hwaysec@tn.gov.in",
        phone="044-25670959",
        responsibility_scope="Administrative Sanction & Inter-Ministerial Policy",
        designation="Principal Secretary to Government",
        posting_unit="Highways Secretariat, Fort St. George"
    ))
    officials_out.append(ProjectStakeholderOut(
        id=2,
        stakeholder_type="APEX_DIRECTORATE",
        department_name="Highways Department",
        contact_person="Er. R. Selvadurai",
        email="dgchn.hd@tn.gov.in",
        phone="044-22351099",
        responsibility_scope="Departmental Oversight & Cadre Administration",
        designation="Director General (Highways)",
        posting_unit="Integrated Chief Engineers Complex, Guindy"
    ))
    officials_out.append(ProjectStakeholderOut(
        id=3,
        stakeholder_type="CHIEF_ENGINEER",
        department_name="Construction & Maintenance Wing",
        contact_person=project.project_director_name or "Er. S. Palanivel",
        email="cengrcmchn.hd@tn.gov.in",
        phone="044-22350690",
        responsibility_scope="Technical Sanction & State Project Direction",
        designation="Chief Engineer (H), C&M (Chennai Region)",
        posting_unit="Kalaignar Centenary Building, Guindy"
    ))
    officials_out.append(ProjectStakeholderOut(
        id=4,
        stakeholder_type="DIVISIONAL_ENGINEER",
        department_name="Highways Executing Division",
        contact_person=project.responsible_ee_name or "Er. P. Anandhan",
        email="de.tambaram.hd@tn.gov.in",
        phone="044-22265012",
        responsibility_scope="Field Contract Administration & Measurement Approvals",
        designation="Divisional Engineer (H)",
        posting_unit=division.name if division else "Tambaram Division"
    ))

    # External stakeholders from DB
    for s in stakeholders:
        officials_out.append(ProjectStakeholderOut(
            id=s.id + 10,
            stakeholder_type=s.stakeholder_type,
            department_name=s.department_id and "External Department",
            contact_person=s.contact_person,
            email=s.email,
            phone=s.phone,
            responsibility_scope="Inter-Agency Clearance & Ground NOC"
        ))

    # 8. Land Acquisition
    parcels = db.query(LandParcel).filter(LandParcel.project_id == project_id).all()
    total_la_sqm = sum(p.total_land_sqm for p in parcels)
    paid_comp = sum(p.compensation_paid_cr for p in parcels)
    assessed_comp = sum(p.compensation_assessed_cr for p in parcels)

    land_acquisition = {
        "total_parcels": len(parcels),
        "total_land_sqm": total_la_sqm,
        "total_land_hectares": round(total_la_sqm / 10000.0, 2),
        "compensation_assessed_cr": round(assessed_comp, 2),
        "compensation_paid_cr": round(paid_comp, 2),
        "parcels": [
            {
                "parcel_ref": p.parcel_reference,
                "district": p.district,
                "taluk": p.taluk,
                "village": p.village,
                "survey_number": p.survey_number,
                "classification": p.land_classification,
                "total_sqm": p.total_land_sqm,
                "sec15_2_date": p.notification_15_2_date,
                "sec15_1_date": p.gazette_15_1_date,
                "sec19_1_date": p.award_19_1_date,
                "compensation_paid_cr": p.compensation_paid_cr,
                "possession_status": p.possession_status,
                "has_litigation": p.has_litigation
            } for p in parcels
        ]
    }

    # 9. Utilities & Dependencies
    deps = db.query(DepartmentDependency).filter(DepartmentDependency.project_id == project_id).all()
    utilities_and_dependencies = {
        "total_dependencies": len(deps),
        "pending_clearances": sum(1 for d in deps if d.status in ["PENDING", "ESCALATED"]),
        "total_impact_days": sum(d.impact_days for d in deps),
        "items": [
            DependencyOut(
                id=d.id,
                project_id=d.project_id,
                project_title=project.title,
                requesting_dept_name="Highways Department",
                target_dept_name=d.target_dept.name if d.target_dept else "Utility Agency",
                dependency_type=d.dependency_type,
                description=d.description,
                impact_days=d.impact_days,
                status=d.status,
                target_clearance_date=d.target_clearance_date
            ) for d in deps
        ]
    }

    # 10. Engineering Quality & Inspection
    qc_records = db.query(QualityDefectRecord).filter(QualityDefectRecord.project_id == project_id).all()
    engineering_quality = {
        "total_defects_logged": len(qc_records),
        "critical_unresolved": sum(1 for q in qc_records if q.severity == "CRITICAL" and q.corrective_action_status != "RECTIFIED"),
        "records": [
            {
                "defect_reference": q.defect_code,
                "component_type": q.defect_type,
                "description": q.observation_notes,
                "severity": q.severity,
                "status": q.corrective_action_status,
                "financial_penalty_cr": 0.0,
                "rectification_deadline": None
            } for q in qc_records
        ]
    }

    # 11. Legal Cases
    cases = db.query(LegalCase).filter(LegalCase.project_id == project_id).all()
    active_stays = [c for c in cases if c.interim_stay_in_force]
    legal_exposure = sum(c.financial_exposure_cr for c in cases)

    legal_cases = {
        "total_cases": len(cases),
        "active_stays_count": len(active_stays),
        "total_financial_exposure_cr": round(legal_exposure, 2),
        "items": [
            LegalCaseOut(
                id=c.id,
                project_id=c.project_id,
                case_reference=c.case_reference,
                court_name=c.court_name,
                case_type=c.case_type,
                petitioner=c.petitioner,
                respondent=c.respondent,
                summary=c.summary,
                interim_stay_in_force=c.interim_stay_in_force,
                financial_exposure_cr=c.financial_exposure_cr,
                next_hearing_date=c.next_hearing_date,
                responsible_legal_officer=c.responsible_legal_officer,
                current_status=c.current_status
            ) for c in cases
        ]
    }

    # 12. Documents
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    docs_out = [
        DocumentOut(
            id=d.id,
            document_title=d.document_title,
            file_name=d.file_name,
            mime_type=d.mime_type,
            file_size_bytes=d.file_size_bytes,
            sha256_hash=d.sha256_hash,
            project_id=d.project_id,
            issue_id=d.issue_id,
            is_verified=d.is_verified,
            created_at=d.created_at
        ) for d in docs
    ]

    # 13. Risks & Issues
    risks = db.query(ProjectRisk).filter(ProjectRisk.project_id == project_id).all()
    issues = db.query(Issue).filter(Issue.project_id == project_id).all()

    risks_and_issues = {
        "open_risks": len([r for r in risks if r.status == "OPEN"]),
        "critical_issues": len([i for i in issues if i.priority == "CRITICAL" and i.status != "Closed"]),
        "risks": [
            ProjectRiskOut(
                id=r.id,
                project_id=r.project_id,
                risk_code=r.risk_code,
                category=r.category,
                title=r.title,
                description=r.description,
                probability=r.probability,
                impact=r.impact,
                severity_score=r.severity_score,
                mitigation_strategy=r.mitigation_strategy,
                status=r.status,
                created_at=r.created_at
            ) for r in risks
        ],
        "issues": [
            {
                "issue_ref": i.issue_reference,
                "category": i.category,
                "description": i.description,
                "priority": i.priority,
                "status": i.status,
                "escalation_status": i.escalation_status
            } for i in issues
        ]
    }

    # 14. AI Findings
    ai_findings = db.query(AIIntelligenceFinding).filter(
        AIIntelligenceFinding.entity_id == project_id
    ).all()
    ai_findings_out = [
        AIIntelligenceFindingOut(
            id=f.id,
            finding_type=f.finding_type,
            entity_type=f.entity_type,
            entity_id=f.entity_id,
            headline=f.headline,
            evidence_summary=f.evidence_summary,
            explanation=f.explanation,
            confidence=f.confidence,
            human_validation_status=f.human_validation_status,
            recommended_action=f.recommended_action,
            statutory_rule_citation=f.statutory_rule_citation,
            created_at=f.created_at
        ) for f in ai_findings
    ]

    # 15. Audit History
    audit_events = db.query(AuditEvent).filter(
        AuditEvent.entity_type == "PROJECT",
        AuditEvent.entity_id == project_id
    ).order_by(desc(AuditEvent.created_at)).limit(20).all()

    audit_out = [
        AuditEventOut(
            id=ae.id,
            actor_name=ae.actor_name,
            actor_role=ae.actor_role,
            action=ae.action,
            entity_type=ae.entity_type,
            entity_id=ae.entity_id,
            entity_reference=ae.entity_reference,
            changes_json=ae.changes_json,
            ip_address=ae.ip_address,
            created_at=ae.created_at
        ) for ae in audit_events
    ]

    # 16. Utility Shifting Breakdown (Prompt 03 Section 11)
    utility_shifting = {
        "total_utilities": 48 if project_id in [4, 6] else 14,
        "shifting_in_progress": 32 if project_id in [4, 6] else 8,
        "completed": 16 if project_id in [4, 6] else 6,
        "estimated_shifting_cost_cr": 4.80 if project_id in [4, 6] else 1.65,
        "items": [
            {
                "utility_type": "TANGEDCO 11kV Electrical Poles",
                "department": "TANGEDCO",
                "affected_chainage": "km 18/200 to 24/600",
                "quantity": 48 if project_id in [4, 6] else 12,
                "unit": "Poles",
                "estimated_cost_cr": 3.20 if project_id in [4, 6] else 0.85,
                "deposit_status": "PAID_TO_TANGEDCO",
                "work_status": "PENDING_SHUTDOWN_APPROVAL",
                "schedule_impact_days": 115 if project_id in [4, 6] else 25
            },
            {
                "utility_type": "TANGEDCO 100kVA Transformers",
                "department": "TANGEDCO",
                "affected_chainage": "km 19/400 & km 22/800",
                "quantity": 2,
                "unit": "Units",
                "estimated_cost_cr": 0.90,
                "deposit_status": "ESTIMATE_SANCTIONED",
                "work_status": "SITE_ACQUISITION_PENDING",
                "schedule_impact_days": 90 if project_id in [4, 6] else 15
            },
            {
                "utility_type": "TWAD Drinking Water Pipeline (300mm DI)",
                "department": "TWAD Board",
                "affected_chainage": "km 14/000 to 16/500",
                "quantity": 2.5,
                "unit": "km",
                "estimated_cost_cr": 0.70,
                "deposit_status": "JOINT_INSPECTION_COMPLETED",
                "work_status": "ALIGNMENT_AGREED",
                "schedule_impact_days": 30
            }
        ]
    }

    # 17. Field Operations & Physical Inspection (Prompt 03 Section 14)
    field_operations = {
        "total_inspections": 18,
        "verified_progress_pct": round(project.physical_progress_pct, 1),
        "last_inspection_date": "2026-10-24",
        "inspections": [
            {
                "inspection_id": f"INSP-{project.project_code}-01",
                "date": "2026-10-24",
                "officer_name": "Er. P. Anandhan (Divisional Engineer)",
                "site_location": "Chainage km 14/200 to 22/000",
                "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
                "work_activity": "Hill slope stabilization, breast wall construction and rock profiling",
                "progress_reported_pct": round(project.physical_progress_pct + 1.5, 1),
                "progress_verified_pct": round(project.physical_progress_pct, 1),
                "findings": "Work halted at km 18/200 due to unshifted 11kV poles. Honeycombing observed on breast wall panel 4.",
                "verified_by_geo_tag": True,
                "has_photo_evidence": True,
                "photo_url": "/evidence/site_inspect_ch14.jpg",
                "follow_up_action": "Issue rectification notice to contractor for honeycombing; escalate pole shutdown to TANGEDCO EE."
            },
            {
                "inspection_id": f"INSP-{project.project_code}-02",
                "date": "2026-09-18",
                "officer_name": "Er. M. Senthilkumar (Assistant Executive Engineer)",
                "site_location": "Chainage km 0/000 to 12/000",
                "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
                "work_activity": "Granular Sub-Base (GSB) laying and compaction tests",
                "progress_reported_pct": round(max(project.physical_progress_pct - 5.0, 5.0), 1),
                "progress_verified_pct": round(max(project.physical_progress_pct - 5.5, 4.5), 1),
                "findings": "GSB layer density test passed 98.4% MDD. Side drain masonry progressing satisfactorily.",
                "verified_by_geo_tag": True,
                "has_photo_evidence": True,
                "photo_url": "/evidence/site_gsb_km10.jpg",
                "follow_up_action": "Permit WMM trial stretch between km 6/0 and 8/0."
            }
        ]
    }

    # 18. Associated Infrastructure Assets (Prompt 03 Section 16)
    assets_out = {
        "total_assets": 8,
        "road_carriageway_km": project.total_length_km or 28.5,
        "bridges_count": 2,
        "culverts_count": 14,
        "items": [
            {
                "asset_id": f"AST-RD-{project.project_code}",
                "asset_type": "CARRIAGEWAY",
                "name": f"{technical_specs['road_name']} Main Alignment",
                "location": f"km {technical_specs['start_chainage_km']} to {technical_specs['end_chainage_km']}",
                "condition": "UNDER_UPGRADATION",
                "last_inspection": "2026-10-24",
                "maintenance_status": "CONTRACTOR_WARRANTY_STAGE"
            },
            {
                "asset_id": f"AST-BRG-{project.id}-01",
                "asset_type": "HIGH_LEVEL_BRIDGE",
                "name": "Major Bridge across Periyar River / Stream",
                "location": "Chainage km 18/450",
                "condition": "SUBSTRUCTURE_IN_PROGRESS",
                "last_inspection": "2026-10-15",
                "maintenance_status": "CONSTRUCTION_STAGE"
            },
            {
                "asset_id": f"AST-CUL-{project.id}-01",
                "asset_type": "BOX_CULVERT",
                "name": "Double Cell RCC Box Culvert (2 x 3.0m)",
                "location": "Chainage km 12/300",
                "condition": "COMPLETED",
                "last_inspection": "2026-09-10",
                "maintenance_status": "SOUND"
            }
        ]
    }

    # 19. Citizen Grievances (Prompt 03 Section 17)
    grievances_out = {
        "total_grievances": 14,
        "resolved_count": 9,
        "pending_count": 5,
        "critical_count": 1,
        "items": [
            {
                "grievance_id": f"GRV-2026-{project.id}01",
                "category": "Drainage Obstruction & Water Stagnation",
                "location": "Adjacent to Village Settlement km 14/800",
                "date_received": "2026-10-02",
                "petitioner_type": "Resident Association",
                "assigned_officer": "Er. P. Anandhan (DE Highways)",
                "status": "ACTION_IN_PROGRESS",
                "resolution_target": "2026-11-15",
                "resolution_details": "Contractor directed to excavate temporary bypass diversion drain during monsoon."
            },
            {
                "grievance_id": f"GRV-2026-{project.id}02",
                "category": "Dust Nuisance & Road Safety Signage",
                "location": "School Zone km 8/200",
                "date_received": "2026-09-14",
                "petitioner_type": "Parent-Teacher Council",
                "assigned_officer": "Er. M. Senthilkumar (AEE Highways)",
                "status": "RESOLVED",
                "resolution_target": "2026-09-20",
                "resolution_details": "Water bowser sprinkling mandated twice daily; retro-reflective cautionary signage installed."
            }
        ]
    }

    # 20. Financial Transactions (Prompt 03 Section 12)
    financial_txns = [
        {
            "txn_reference": f"TXN-{project.project_code}-001",
            "voucher_number": "IFHRMS-VCH-2024-912",
            "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
            "contractor_name": project.contractor.company_name if project.contractor else "Contractor",
            "bill_date": "2024-05-10",
            "bill_type": "MOBILISATION_ADVANCE",
            "bill_amount_cr": round(project.sanctioned_cost_cr * 0.10, 2),
            "approved_amount_cr": round(project.sanctioned_cost_cr * 0.10, 2),
            "paid_amount_cr": round(project.sanctioned_cost_cr * 0.10, 2),
            "payment_status": "DISBURSED",
            "supporting_evidence_status": "VERIFIED_BG_HELD"
        },
        {
            "txn_reference": f"TXN-{project.project_code}-002",
            "voucher_number": "IFHRMS-VCH-2024-1182",
            "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
            "contractor_name": project.contractor.company_name if project.contractor else "Contractor",
            "bill_date": "2024-11-20",
            "bill_type": "RA_BILL_01",
            "bill_amount_cr": round(project.sanctioned_cost_cr * 0.12, 2),
            "approved_amount_cr": round(project.sanctioned_cost_cr * 0.115, 2),
            "paid_amount_cr": round(project.sanctioned_cost_cr * 0.115, 2),
            "payment_status": "DISBURSED",
            "supporting_evidence_status": "VERIFIED_MB_BOOK"
        },
        {
            "txn_reference": f"TXN-{project.project_code}-003",
            "voucher_number": "IFHRMS-VCH-2025-045",
            "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
            "contractor_name": project.contractor.company_name if project.contractor else "Contractor",
            "bill_date": "2025-06-14",
            "bill_type": "RA_BILL_02",
            "bill_amount_cr": round(project.sanctioned_cost_cr * 0.15, 2),
            "approved_amount_cr": round(project.sanctioned_cost_cr * 0.14, 2),
            "paid_amount_cr": round(project.sanctioned_cost_cr * 0.14, 2),
            "payment_status": "DISBURSED",
            "supporting_evidence_status": "VERIFIED_MB_BOOK"
        },
        {
            "txn_reference": f"TXN-{project.project_code}-004",
            "voucher_number": "IFHRMS-VCH-2025-992",
            "package_name": work_packages_out[0].title if work_packages_out else "Package 1",
            "contractor_name": project.contractor.company_name if project.contractor else "Contractor",
            "bill_date": "2025-10-20",
            "bill_type": "RA_BILL_03",
            "bill_amount_cr": 9.80 if project_id in [4, 6] else 6.50,
            "approved_amount_cr": 0.0,
            "paid_amount_cr": 0.0,
            "payment_status": "HELD_UNDER_AUDIT",
            "supporting_evidence_status": "VARIATION_CLAIM_UNDER_REVIEW"
        }
    ]

    # 21. Action Register (Prompt 03 Section 20)
    actions_register = [
        {
            "action_id": f"ACT-{project.project_code}-01",
            "issue": "Inter-Departmental Joint Inspection for 48 TANGEDCO 11kV electrical pole relocation",
            "department": "TANGEDCO / Highways",
            "assigned_officer": "District Collector / Superintending Engineer (TANGEDCO)",
            "priority": "CRITICAL",
            "target_date": "2026-11-20",
            "status": "ASSIGNED",
            "remarks": "High-level coordination meeting scheduled at Collectorate."
        },
        {
            "action_id": f"ACT-{project.project_code}-02",
            "issue": "Expedite DRO Award enquiry for 12 revenue parcels in Taluk office",
            "department": "Revenue Department",
            "assigned_officer": "District Revenue Officer (DRO)",
            "priority": "HIGH",
            "target_date": "2026-11-28",
            "status": "IN_PROGRESS",
            "remarks": "Compensation determination finalized; gazette publication pending."
        },
        {
            "action_id": f"ACT-{project.project_code}-03",
            "issue": "Rectification of honeycombing defects in breast wall concrete at km 14/200",
            "department": "Highways C&M / Quality Control Wing",
            "assigned_officer": "Executive Engineer (Quality Control)",
            "priority": "MEDIUM",
            "target_date": "2026-11-15",
            "status": "RECTIFICATION_SUBMITTED",
            "remarks": "Pressure grouting methodology submitted by contractor."
        }
    ]

    # 22. AI Project Intelligence Assessment (Prompt 03 Section 6)
    is_scenario_project = project_id in [4, 6] or "CKICP" in (project.funding_source or "") or "Ooty" in project.title
    ai_project_intelligence = {
        "title": "AI Project Intelligence Assessment",
        "executive_summary": (
            f"This demonstration project ({project.project_code}) faces acute schedule pressure with a critical delay of "
            f"{max_delay} days against baseline. Financial disbursements ({project.financial_progress_pct}%) lead verified physical progress "
            f"({project.physical_progress_pct}%), driven by mobilization advances and an unapproved non-BOQ variation claim. "
            f"Utility shifting (48 TANGEDCO 11kV electrical poles) and pending DRO land awards constitute the primary critical path bottlenecks. "
            f"AI recommends convening a multi-departmental clearance review and auditing rock variation quantities prior to releasing further payments."
            if is_scenario_project else
            f"Project {project.project_code} is progressing under {technical_specs['funding_programme']} with physical progress at {project.physical_progress_pct}% "
            f"against planned {planned_phys}%. Schedule variance is {max_delay} days. Inter-agency dependencies with Revenue and TANGEDCO require "
            f"routine monitoring to avoid compounding delays."
        ),
        "critical_findings": [
            f"Schedule variance has reached {max_delay} days, triggering Critical Delay alert.",
            "TANGEDCO electrical pole shifting obstructing main carriageway slope stabilization.",
            "Disputed ₹9.80 Cr non-BOQ variation claim requires Standing Finance Committee approval.",
            "Two open quality Non-Conformance Reports (NCR) awaiting field closure."
        ],
        "root_cause_analysis": {
            "land_acquisition": "12 parcels awaiting DRO award inquiry and statutory 19(1) gazette declaration.",
            "utility_shifting": "48 overhead 11kV poles and 2 distribution transformers obstructing slope benches.",
            "departmental_approvals": "Stage-II clearance pending with Forest Department; power shutdown pending with TANGEDCO.",
            "contractor_performance": "Contractor slowed earthwork citing non-handover of unencumbered ROW stretches.",
            "funding_and_payment": "Disbursement exceeds verified physical progress; ₹9.80 Cr variation claim withheld under audit.",
            "engineering_quality": "M30 concrete honeycombing observed on breast wall; cube test records verified.",
            "legal_restrictions": "Interim stay petition pending in Sub-Court regarding compensation quantum on survey parcel 14.",
            "field_execution": "Heavy monsoon rains in hill terrain reduced working hours by 18 days in September-October."
        },
        "recommended_actions": [
            "Convene District Level Coordination Committee under District Collector to order TANGEDCO shutdown schedule.",
            "Withhold RA Bill #3 non-BOQ items until State Technical Committee verifies rock profiling measurements.",
            "Direct Contractor to deploy secondary machinery on unencumbered chainage km 0/000 to 12/000.",
            "Instruct DRO to deposit interim land compensation into court escrow to obtain symbolic possession under Sec 19."
        ],
        "decision_required": {
            "reference": "MDR-2026-001" if is_scenario_project else f"MDR-{project.project_code}",
            "decision_title": "Inter-Departmental Deadlock Resolution & Contract Variation Scrutiny",
            "decision_authority": "Hon'ble Minister / Principal Secretary",
            "current_status": "PENDING_DECISION",
            "recommended_directive": "Order joint physical survey with TANGEDCO & freeze extra item payment pending Technical Sanction revision."
        }
    }

    return Project360DetailOut(
        project=build_project_out(project),
        jurisdiction_hierarchy=jurisdiction_hierarchy,
        technical_specs=technical_specs,
        sanctions=sanctions_out,
        milestones=milestones_out,
        execution_tracking=execution_tracking,
        progress_history=progress_history_out,
        work_packages=work_packages_out,
        contractors_and_consultants=contractors_and_consultants,
        assigned_officials_and_stakeholders=officials_out,
        land_acquisition=land_acquisition,
        utilities_and_dependencies=utilities_and_dependencies,
        engineering_quality=engineering_quality,
        legal_cases=legal_cases,
        documents=docs_out,
        risks_and_issues=risks_and_issues,
        ai_findings=ai_findings_out,
        audit_history=audit_out,
        ai_project_intelligence=ai_project_intelligence,
        field_operations=field_operations,
        assets=assets_out,
        citizen_grievances=grievances_out,
        financial_transactions=financial_txns,
        actions_register=actions_register,
        utility_shifting=utility_shifting
    )

@router.get("/{project_id}/milestones", response_model=List[ProjectMilestoneOut])
def get_project_milestones(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied")

    milestones = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project_id
    ).order_by(ProjectMilestone.target_date.asc()).all()

    return [
        ProjectMilestoneOut(
            id=m.id,
            project_id=m.project_id,
            work_package_id=m.work_package_id,
            milestone_code=m.milestone_code,
            title=m.title,
            description=m.description,
            target_date=m.target_date,
            actual_date=m.actual_date,
            target_physical_pct=m.target_physical_pct,
            actual_physical_pct=m.actual_physical_pct,
            delay_days=m.delay_days,
            status=m.status,
            weightage_pct=m.weightage_pct
        ) for m in milestones
    ]

@router.get("/{project_id}/progress-history", response_model=List[ProjectProgressRecordOut])
def get_project_progress_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied")

    records = db.query(ProjectProgressRecord).filter(
        ProjectProgressRecord.project_id == project_id
    ).order_by(ProjectProgressRecord.reporting_month.asc()).all()

    return [
        ProjectProgressRecordOut(
            id=pr.id,
            project_id=pr.project_id,
            reporting_month=pr.reporting_month,
            planned_physical_pct=pr.planned_physical_pct,
            actual_physical_pct=pr.actual_physical_pct,
            planned_financial_pct=pr.planned_financial_pct,
            actual_financial_pct=pr.actual_financial_pct,
            expenditure_in_month_cr=pr.expenditure_in_month_cr,
            cumulative_expenditure_cr=pr.cumulative_expenditure_cr,
            earned_value_cr=pr.earned_value_cr,
            planned_value_cr=pr.planned_value_cr,
            cost_variance_cr=pr.cost_variance_cr,
            schedule_variance_cr=pr.schedule_variance_cr,
            remarks=pr.remarks,
            created_at=pr.created_at
        ) for pr in records
    ]

@router.get("/{project_id}/risks", response_model=List[ProjectRiskOut])
def get_project_risks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not check_project_jurisdiction(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied")

    risks = db.query(ProjectRisk).filter(
        ProjectRisk.project_id == project_id
    ).order_by(ProjectRisk.severity_score.desc()).all()

    return [
        ProjectRiskOut(
            id=r.id,
            project_id=r.project_id,
            risk_code=r.risk_code,
            category=r.category,
            title=r.title,
            description=r.description,
            probability=r.probability,
            impact=r.impact,
            severity_score=r.severity_score,
            mitigation_strategy=r.mitigation_strategy,
            status=r.status,
            created_at=r.created_at
        ) for r in risks
    ]

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "MINISTER", "PRIN_SEC", "CHIEF_ENG", "SE_CIRCLE", "EE_DIV"]))
):
    project = Project(
        project_code=payload.project_code,
        title=payload.title,
        description=payload.description,
        road_id=payload.road_id,
        road_type=payload.road_type,
        estimated_cost_cr=payload.estimated_cost_cr,
        sanctioned_cost_cr=payload.sanctioned_cost_cr,
        zone_id=payload.zone_id,
        circle_id=payload.circle_id,
        division_id=payload.division_id,
        executing_department_id=payload.executing_department_id,
        contractor_id=payload.contractor_id,
        priority=payload.priority,
        status="SANCTIONED"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    log_audit_event(
        db=db,
        action="CREATE",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=project.project_code,
        user=current_user,
        changes={"title": project.title, "sanctioned_cost_cr": project.sanctioned_cost_cr}
    )
    
    return build_project_out(project)

@router.post("/{project_id}/actions")
def create_project_action(
    project_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    action_id = f"ACT-{project.project_code}-{datetime.datetime.utcnow().strftime('%M%S')}"
    new_action = {
        "action_id": action_id,
        "issue": payload.get("issue", "Project directive"),
        "department": payload.get("department", "Highways Department"),
        "assigned_officer": payload.get("assigned_officer", current_user.full_name),
        "priority": payload.get("priority", "HIGH"),
        "target_date": payload.get("target_date", "2026-11-30"),
        "status": payload.get("status", "ASSIGNED"),
        "remarks": payload.get("remarks", "Direct executive instruction")
    }

    log_audit_event(
        db=db,
        action="CREATE_ACTION",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=action_id,
        user=current_user,
        changes=new_action
    )

    return {"message": "Action assigned successfully", "action": new_action}

@router.post("/{project_id}/quality-observations")
def create_project_quality_observation(
    project_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    defect_code = f"QC-{project.project_code}-{datetime.datetime.utcnow().strftime('%M%S')}"
    new_obs = QualityDefectRecord(
        defect_code=defect_code,
        project_id=project.id,
        road_id=project.road_id,
        defect_type=payload.get("defect_type", "Open NCR"),
        observation_notes=payload.get("observation_notes", "Observation logged during inspection"),
        severity=payload.get("severity", "MEDIUM"),
        corrective_action_status=payload.get("status", "PENDING_RECTIFICATION"),
        responsible_engineer=payload.get("responsible_engineer", current_user.full_name)
    )
    db.add(new_obs)
    db.commit()
    db.refresh(new_obs)

    log_audit_event(
        db=db,
        action="CREATE_QUALITY_DEFECT",
        entity_type="PROJECT",
        entity_id=project.id,
        entity_reference=defect_code,
        user=current_user,
        changes={"defect_code": defect_code, "severity": new_obs.severity}
    )

    return {
        "message": "Quality observation recorded successfully",
        "record": {
            "defect_reference": new_obs.defect_code,
            "component_type": new_obs.defect_type,
            "description": new_obs.observation_notes,
            "severity": new_obs.severity,
            "status": new_obs.corrective_action_status
        }
    }



