import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.auth import get_password_hash
from app.models import (
    Role, Permission, Department, Organisation, Zone, Circle, Division, Subdivision,
    User, Official, Contractor, Consultant, Road, Bridge, Project, WorkPackage,
    Contract, DepartmentDependency, Issue, WorkflowTask, Document, EvidenceRecord,
    AuditEvent
)

def seed_database(db_session: Session = None):
    if db_session is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False
    
    # Check if already seeded
    if db.query(Role).first():
        if close_on_exit:
            db.close()
        return

    print("Seeding TN-HDOS database with Tamil Nadu Highways departmental records...")

    # 1. ROLES
    roles_data = [
        {"code": "ADMIN", "name": "System Administrator", "tier": "SYSTEM"},
        {"code": "MINISTER", "name": "Hon'ble Minister for Highways", "tier": "LEADERSHIP"},
        {"code": "PRIN_SEC", "name": "Principal Secretary to Government", "tier": "LEADERSHIP"},
        {"code": "CHIEF_ENG", "name": "Chief Engineer (Highways - Projects)", "tier": "EXECUTIVE"},
        {"code": "ZONAL_CE", "name": "Zonal Chief Engineer", "tier": "EXECUTIVE"},
        {"code": "SE_CIRCLE", "name": "Superintending Engineer", "tier": "FIELD_MANAGEMENT"},
        {"code": "EE_DIV", "name": "Divisional Engineer / Executive Engineer", "tier": "FIELD_MANAGEMENT"},
        {"code": "ADE_SUBDIV", "name": "Assistant Divisional Engineer", "tier": "OPERATIONAL"},
        {"code": "JE_FIELD", "name": "Junior Engineer / Field Engineer", "tier": "OPERATIONAL"},
        {"code": "FINANCE_OFFICER", "name": "Financial Advisor & Chief Accounts Officer", "tier": "FINANCIAL"},
        {"code": "QC_ENGINEER", "name": "Quality Control Engineer (HRS)", "tier": "QUALITY"},
        {"code": "LEGAL_OFFICER", "name": "Special Government Pleader (Legal)", "tier": "COMPLIANCE"},
        {"code": "CONTRACTOR", "name": "Empanelled Contractor Representative", "tier": "EXTERNAL"},
        {"code": "CONSULTANT", "name": "Design & DPR Consultant", "tier": "EXTERNAL"},
        {"code": "CITIZEN", "name": "Citizen User", "tier": "CITIZEN"},
    ]
    role_map = {}
    for r in roles_data:
        role = Role(code=r["code"], name=r["name"], tier=r["tier"])
        db.add(role)
        role_map[r["code"]] = role
    db.commit()

    # 2. DEPARTMENTS
    depts_data = [
        {"code": "HIGHWAYS", "name": "Tamil Nadu Highways Department", "is_external": False},
        {"code": "REVENUE", "name": "Revenue and Disaster Management Department (Land Acquisition)", "is_external": True},
        {"code": "TANGEDCO", "name": "Tamil Nadu Generation and Distribution Corporation (TANGEDCO)", "is_external": True},
        {"code": "TWAD", "name": "Tamil Nadu Water Supply and Drainage Board (TWAD)", "is_external": True},
        {"code": "FOREST", "name": "Department of Environment, Climate Change and Forests", "is_external": True},
        {"code": "RAILWAYS", "name": "Southern Railway (Zone 7, Indian Railways)", "is_external": True},
    ]
    dept_map = {}
    for d in depts_data:
        dept = Department(code=d["code"], name=d["name"], is_external=d["is_external"])
        db.add(dept)
        dept_map[d["code"]] = dept
    db.commit()

    # 3. ORGANISATIONS & CONTRACTORS
    org_lt = Organisation(name="L&T Infrastructure Engineering Ltd", org_type="CONTRACTOR", registration_no="TN-CONTR-CL1-0042")
    org_pst = Organisation(name="PST Engineering Constructions", org_type="CONTRACTOR", registration_no="TN-CONTR-CL1-0089")
    org_feedback = Organisation(name="Feedback Infra Design Consultants", org_type="CONSULTANT", registration_no="TN-CONS-0012")
    db.add_all([org_lt, org_pst, org_feedback])
    db.commit()

    contractor_lt = Contractor(
        organisation_id=org_lt.id,
        registration_number="REG/TN/HW/2021/0042",
        company_name="L&T Infrastructure Engineering Ltd",
        class_category="Class I (Unlimited)",
        pan="AAACL1234F",
        gst="33AAACL1234F1Z5",
        validity_date=datetime.datetime(2028, 12, 31)
    )
    contractor_pst = Contractor(
        organisation_id=org_pst.id,
        registration_number="REG/TN/HW/2022/0089",
        company_name="PST Engineering Constructions",
        class_category="Class I (Unlimited)",
        pan="BBBCP5678G",
        gst="33BBBCP5678G1Z2",
        validity_date=datetime.datetime(2027, 6, 30)
    )
    db.add_all([contractor_lt, contractor_pst])
    db.commit()

    # 4. ZONES, CIRCLES, DIVISIONS, SUBDIVISIONS
    zone_chennai = Zone(code="ZN-CHE", name="Chennai Zone", headquarters="Chennai")
    zone_madurai = Zone(code="ZN-MDU", name="Madurai Zone", headquarters="Madurai")
    zone_salem = Zone(code="ZN-SLM", name="Salem Zone", headquarters="Salem")
    db.add_all([zone_chennai, zone_madurai, zone_salem])
    db.commit()

    circle_chengalpattu = Circle(zone_id=zone_chennai.id, code="CIR-CGL", name="Chengalpattu Circle")
    circle_chennai_city = Circle(zone_id=zone_chennai.id, code="CIR-CHE", name="Chennai City Circle")
    circle_madurai = Circle(zone_id=zone_madurai.id, code="CIR-MDU", name="Madurai Circle")
    db.add_all([circle_chengalpattu, circle_chennai_city, circle_madurai])
    db.commit()

    div_tambaram = Division(circle_id=circle_chengalpattu.id, code="DIV-TAM", name="Tambaram Division")
    div_chennai_city = Division(circle_id=circle_chennai_city.id, code="DIV-CHE-CTY", name="Chennai City Division")
    div_madurai_north = Division(circle_id=circle_madurai.id, code="DIV-MDU-NTH", name="Madurai North Division")
    db.add_all([div_tambaram, div_chennai_city, div_madurai_north])
    db.commit()

    subdiv_saidapet = Subdivision(division_id=div_tambaram.id, code="SUB-SAI", name="Saidapet Subdivision")
    db.add(subdiv_saidapet)
    db.commit()

    # 5. USERS
    pwd_admin = get_password_hash("admin123")
    pwd_common = get_password_hash("highway123")

    user_minister = User(
        username="minister",
        email="minister.highways@tn.gov.in",
        hashed_password=pwd_common,
        full_name="Hon'ble Thiru E. V. Velu, Minister for Public Works & Highways [DEMO]",
        phone="+91-9444000008",
        role_id=role_map["MINISTER"].id,
        department_id=dept_map["HIGHWAYS"].id
    )

    user_secretary = User(
        username="secretary",
        email="secy.highways@tn.gov.in",
        hashed_password=pwd_common,
        full_name="Thiru Pradeep Yadav IAS, Principal Secretary to Government [DEMO]",
        phone="+91-9444000009",
        role_id=role_map["PRIN_SEC"].id,
        department_id=dept_map["HIGHWAYS"].id
    )

    user_admin = User(
        username="admin",
        email="admin.highways@tn.gov.in",
        hashed_password=pwd_admin,
        full_name="Thiru R. Senthil Kumar IAS [DEMO]",
        phone="+91-9444000001",
        role_id=role_map["ADMIN"].id,
        department_id=dept_map["HIGHWAYS"].id
    )

    user_ce = User(
        username="chief_eng",
        email="ce.projects@tn.gov.in",
        hashed_password=pwd_common,
        full_name="Er. K. Balasubramanian, M.E. [DEMO]",
        phone="+91-9444000002",
        role_id=role_map["CHIEF_ENG"].id,
        department_id=dept_map["HIGHWAYS"].id
    )

    user_se = User(
        username="se_chengalpattu",
        email="se.cgl@tn.gov.in",
        hashed_password=pwd_common,
        full_name="Er. M. Rajasekaran, M.E. [DEMO]",
        phone="+91-9444000003",
        role_id=role_map["SE_CIRCLE"].id,
        department_id=dept_map["HIGHWAYS"].id,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id
    )

    user_ee = User(
        username="ee_tambaram",
        email="ee.tambaram@tn.gov.in",
        hashed_password=pwd_common,
        full_name="Er. P. Anandhan, B.E. [DEMO]",
        phone="+91-9444000004",
        role_id=role_map["EE_DIV"].id,
        department_id=dept_map["HIGHWAYS"].id,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )

    user_contractor_lt = User(
        username="contractor_lt",
        email="pm.highways@lntecc.com",
        hashed_password=pwd_common,
        full_name="V. Ramakrishnan (Project Director, L&T) [DEMO]",
        phone="+91-9840000010",
        role_id=role_map["CONTRACTOR"].id,
        contractor_id=contractor_lt.id
    )

    user_contractor_pst = User(
        username="contractor_pst",
        email="projects@pstengg.com",
        hashed_password=pwd_common,
        full_name="T. Shanmugam (Managing Director, PST) [DEMO]",
        phone="+91-9840000011",
        role_id=role_map["CONTRACTOR"].id,
        contractor_id=contractor_pst.id
    )

    db.add_all([user_minister, user_secretary, user_admin, user_ce, user_se, user_ee, user_contractor_lt, user_contractor_pst])
    db.commit()

    # 6. OFFICIALS
    off_ce = Official(
        user_id=user_ce.id,
        employee_code="TN-HWD-00102",
        designation="Chief Engineer (Projects)",
        cadre="State Highways Engineering Service (SHES)",
        current_posting="O/o Director General, Highways Department, Guindy, Chennai"
    )
    off_se = Official(
        user_id=user_se.id,
        employee_code="TN-HWD-00341",
        designation="Superintending Engineer",
        cadre="State Highways Engineering Service (SHES)",
        current_posting="Chengalpattu Circle, Kanchipuram"
    )
    off_ee = Official(
        user_id=user_ee.id,
        employee_code="TN-HWD-00789",
        designation="Divisional Engineer",
        cadre="State Highways Engineering Service (SHES)",
        current_posting="Tambaram Division, Chromepet"
    )
    db.add_all([off_ce, off_se, off_ee])
    db.commit()

    # 7. ROADS (Color Palettes per DESIGN.md: SH=#006A4E, NH=#FFCC00, MDR=#004B87, ODR=#D1197E, RURAL=#FF6600)
    road_sh49 = Road(
        code="SH-49",
        name="East Coast Road (Chennai - Mahabalipuram - Puducherry)",
        road_type="SH",
        start_chainage=11.5,
        end_chainage=135.0,
        total_length_km=123.5,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )
    road_nh45 = Road(
        code="NH-45",
        name="Grand Southern Trunk (GST) Road (Chennai - Dindigul)",
        road_type="NH",
        start_chainage=28.0,
        end_chainage=420.0,
        total_length_km=392.0,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )
    road_mdr102 = Road(
        code="MDR-102",
        name="Tambaram - Mudichur - Sriperumbudur Road",
        road_type="MDR",
        start_chainage=0.0,
        end_chainage=26.4,
        total_length_km=26.4,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )
    road_odr045 = Road(
        code="ODR-045",
        name="Guduvanchery - Thiruporur Hub Link Road",
        road_type="ODR",
        start_chainage=0.0,
        end_chainage=18.2,
        total_length_km=18.2,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )
    road_rur012 = Road(
        code="RUR-012",
        name="Vandalur - Kelambakkam Rural Connectivity Link",
        road_type="RURAL",
        start_chainage=0.0,
        end_chainage=14.0,
        total_length_km=14.0,
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id
    )
    db.add_all([road_sh49, road_nh45, road_mdr102, road_odr045, road_rur012])
    db.commit()

    # 8. BRIDGES
    bridge_buckingham = Bridge(
        road_id=road_sh49.id,
        bridge_code="BR-SH49-014",
        bridge_name="Buckingham Canal Major Bridge at Muttukadu",
        bridge_type="Major Bridge",
        chainage_km=14.2,
        span_meters=180.0,
        river_or_rail_crossing="Buckingham Canal Estuary",
        condition_score=88.5
    )
    bridge_tambaram_rob = Bridge(
        road_id=road_mdr102.id,
        bridge_code="ROB-MDR102-002",
        bridge_name="Tambaram Railway Overbridge (ROB) Replacement",
        bridge_type="ROB (Railway Overbridge)",
        chainage_km=2.4,
        span_meters=95.0,
        river_or_rail_crossing="Southern Railway Main Line Corridor",
        condition_score=72.0
    )
    db.add_all([bridge_buckingham, bridge_tambaram_rob])
    db.commit()

    # 9. PROJECTS
    proj1 = Project(
        project_code="PRJ-TN-2026-001",
        title="Widening to 4 Lanes with Paved Shoulders of SH-49 (ECR) km 22/0 to 45/0 [DEMO DATA]",
        description="Major infrastructure upgradation under Chief Minister Road Development Programme (CMRDP) to reduce fatal accidents and improve scenic coastal corridor capacity.",
        road_id=road_sh49.id,
        road_type="SH",
        estimated_cost_cr=145.50,
        sanctioned_cost_cr=142.20,
        expenditure_to_date_cr=64.80,
        physical_progress_pct=52.5,
        financial_progress_pct=45.6,
        status="IN_PROGRESS",
        priority="CRITICAL",
        start_date=datetime.datetime(2025, 4, 1),
        target_completion_date=datetime.datetime(2027, 3, 31),
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id,
        executing_department_id=dept_map["HIGHWAYS"].id,
        contractor_id=contractor_lt.id
    )

    proj2 = Project(
        project_code="PRJ-TN-2026-002",
        title="Construction of 4-Lane Grade Separator / Elevated Corridor at Tambaram on MDR-102 [DEMO DATA]",
        description="Elevated flyover junction decongestion project connecting GST corridor with Sriperumbudur industrial belt.",
        road_id=road_mdr102.id,
        road_type="MDR",
        estimated_cost_cr=88.40,
        sanctioned_cost_cr=85.00,
        expenditure_to_date_cr=22.10,
        physical_progress_pct=28.0,
        financial_progress_pct=26.0,
        status="DELAYED",
        priority="HIGH",
        start_date=datetime.datetime(2025, 8, 15),
        target_completion_date=datetime.datetime(2026, 12, 31),
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id,
        executing_department_id=dept_map["HIGHWAYS"].id,
        contractor_id=contractor_pst.id
    )

    proj3 = Project(
        project_code="PRJ-TN-2026-003",
        title="Reconstruction of Distressed High-Level Bridge on ODR-045 Thiruporur Hub [DEMO DATA]",
        description="Comprehensive bridge reconstruction replacing damaged multi-vent causeway with pre-stressed girder superstructure.",
        road_id=road_odr045.id,
        road_type="ODR",
        estimated_cost_cr=18.60,
        sanctioned_cost_cr=18.10,
        expenditure_to_date_cr=16.50,
        physical_progress_pct=89.0,
        financial_progress_pct=91.2,
        status="IN_PROGRESS",
        priority="MEDIUM",
        start_date=datetime.datetime(2025, 1, 10),
        target_completion_date=datetime.datetime(2026, 6, 30),
        zone_id=zone_chennai.id,
        circle_id=circle_chengalpattu.id,
        division_id=div_tambaram.id,
        executing_department_id=dept_map["HIGHWAYS"].id,
        contractor_id=contractor_pst.id
    )
    db.add_all([proj1, proj2, proj3])
    db.commit()

    # 10. DEPARTMENT DEPENDENCIES
    dep1 = DepartmentDependency(
        project_id=proj1.id,
        requesting_dept_id=dept_map["HIGHWAYS"].id,
        target_dept_id=dept_map["REVENUE"].id,
        dependency_type="Land Acquisition (4.2 Hectares)",
        description="Tahsildar Tambaram sub-collector award enquiry under TN Highway Act 2001 Section 15(2) pending hearing.",
        impact_days=65,
        target_clearance_date=datetime.datetime(2026, 12, 15),
        status="ESCALATED"
    )
    dep2 = DepartmentDependency(
        project_id=proj1.id,
        requesting_dept_id=dept_map["HIGHWAYS"].id,
        target_dept_id=dept_map["TANGEDCO"].id,
        dependency_type="Utility Shifting (42 HT Electric Poles)",
        description="Superintending Engineer TANGEDCO Kanchipuram working estimate prepared; deposit of Rs 1.82 Cr remitted.",
        impact_days=40,
        target_clearance_date=datetime.datetime(2026, 11, 30),
        status="IN_PROGRESS"
    )
    dep3 = DepartmentDependency(
        project_id=proj2.id,
        requesting_dept_id=dept_map["HIGHWAYS"].id,
        target_dept_id=dept_map["RAILWAYS"].id,
        dependency_type="Railway General Arrangement Drawing (GAD) Clearance",
        description="GAD clearance for Pier P-4 and P-5 within railway boundary corridor pending Chief Bridge Engineer (CBE) Southern Railway.",
        impact_days=90,
        target_clearance_date=datetime.datetime(2027, 1, 31),
        status="PENDING"
    )
    db.add_all([dep1, dep2, dep3])
    db.commit()

    # 11. ISSUES
    iss1 = Issue(
        issue_reference="ISS-2026-0001",
        category="Utility Relocation",
        description="33kV underground feeder cable route obstruction at Akkarai junction halting median construction [DEMO DATA]",
        project_id=proj1.id,
        department_id=dept_map["TANGEDCO"].id,
        assigned_to_user_id=user_ee.id,
        priority="HIGH",
        status="Action in Progress",
        escalation_status="ZONE_ESCALATED",
        target_resolution_date=datetime.datetime(2026, 11, 28),
        resolution_notes="Joint site walkover conducted with TANGEDCO ADE on 2nd Nov."
    )
    iss2 = Issue(
        issue_reference="ISS-2026-0002",
        category="Contractor Delay",
        description="Pier cap shuttering staging material shortage leading to 3-week delay in Span 4 erection [DEMO DATA]",
        project_id=proj2.id,
        department_id=dept_map["HIGHWAYS"].id,
        assigned_to_user_id=user_ee.id,
        priority="CRITICAL",
        status="Under Review",
        escalation_status="NORMAL",
        target_resolution_date=datetime.datetime(2026, 12, 10),
        resolution_notes="Contractor served with 14-day statutory performance cure notice."
    )
    db.add_all([iss1, iss2])
    db.commit()

    # 12. WORKFLOW TASKS
    tsk1 = WorkflowTask(
        task_reference="TSK-2026-0001",
        issue_id=iss1.id,
        project_id=proj1.id,
        title="Conduct Joint Ground Verification with TANGEDCO Executive Engineer [DEMO DATA]",
        description="Inspect Akkarai junction utility trenching to finalize alignment avoiding 33kV corridor.",
        assigned_to_user_id=user_ee.id,
        created_by_user_id=user_se.id,
        priority="HIGH",
        status="Assigned",
        due_date=datetime.datetime(2026, 11, 20)
    )
    tsk2 = WorkflowTask(
        task_reference="TSK-2026-0002",
        issue_id=iss2.id,
        project_id=proj2.id,
        title="Inspect Staging Rigidity & Safety Netting at Pier P-4 [DEMO DATA]",
        description="Verify scaffolding certified by Structural Chartered Engineer before load test.",
        assigned_to_user_id=user_ee.id,
        created_by_user_id=user_ce.id,
        priority="CRITICAL",
        status="In Progress",
        due_date=datetime.datetime(2026, 11, 25)
    )
    db.add_all([tsk1, tsk2])
    db.commit()

    # 13. DOCUMENTS & EVIDENCE RECORDS
    doc1 = Document(
        document_title="Quality Control Cube Compressive Strength Test Report - ECR Chainage 28+400 [DEMO DATA]",
        file_name="HRS_CubeTest_SH49_28_400.pdf",
        file_path="/documents/demo/HRS_CubeTest_SH49_28_400.pdf",
        file_size_bytes=2458120,
        mime_type="application/pdf",
        sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        uploader_user_id=user_ee.id,
        project_id=proj1.id,
        is_verified=True
    )
    db.add(doc1)
    db.commit()

    ev1 = EvidenceRecord(
        document_id=doc1.id,
        issue_id=iss1.id,
        project_id=proj1.id,
        evidence_type="Lab Test Cube Report",
        latitude=12.8712,
        longitude=80.2441,
        chainage_km=28.4,
        verified_by_official_id=off_ee.id
    )
    db.add(ev1)
    db.commit()

    # 14. AUDIT EVENTS
    audit1 = AuditEvent(
        actor_user_id=user_admin.id,
        actor_name=user_admin.full_name,
        actor_role="System Administrator",
        action="PLATFORM_INITIALIZATION",
        entity_type="SYSTEM",
        entity_reference="SYS-TNHDOS-001",
        changes_json='{"status": "INITIALIZED", "version": "1.0.0-phase1"}',
        ip_address="127.0.0.1"
    )
    audit2 = AuditEvent(
        actor_user_id=user_ce.id,
        actor_name=user_ce.full_name,
        actor_role="Chief Engineer (Projects)",
        action="SANCTION_APPROVE",
        entity_type="PROJECT",
        entity_id=proj1.id,
        entity_reference=proj1.project_code,
        changes_json='{"sanctioned_cost_cr": 142.20, "programme": "CMRDP"}',
        ip_address="10.20.44.12"
    )
    db.add_all([audit1, audit2])
    db.commit()

    print("TN-HDOS database successfully seeded with complete Phase 1 foundation.")
    
    # Also seed Phase 2 records
    try:
        from app.seed_phase2 import seed_phase2_data
        seed_phase2_data(db_session=db)
    except Exception as e:
        print(f"Phase 2 seed notice: {e}")

    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_database()
