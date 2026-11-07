"""
TN-HDOS Prompt 05: Departmental Coordination, Land Acquisition & Utility Intelligence Seeder.
Ensures schema compatibility, adds missing columns to existing SQLite tables,
and seeds:
- 10 Participating Departments
- 30 Fictional Officers / Designations
- 12 Projects & 20 Packages
- 50 Land Parcels
- 30 Land Acquisition Workflow Records
- 25 Utility Shifting Records
- 25 Departmental Dependencies
- 30 Approval Records
- 20 Supporting Document References
- 15 AI Departmental & Land/Utility Intelligence Findings
Includes Section 12 Demonstration Scenario for CKICP SH-15 Ooty-Gudalur Corridor.
"""

import datetime
import sqlite3
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import (
    Department, Organisation, Project, WorkPackage, User, Official,
    DepartmentDependency, Approval, LandParcel,
    UtilityShiftingRecord, LandAcquisitionWorkflowRecord,
    DepartmentAIFinding, SupportingDocumentReference
)


def upgrade_sqlite_columns():
    """Ensure missing columns in existing SQLite tables are added without data loss."""
    conn = engine.raw_connection()
    cursor = conn.cursor()

    # Table: departments
    cursor.execute("PRAGMA table_info(departments)")
    dept_cols = [r[1] for r in cursor.fetchall()]
    new_dept_cols = [
        ("category", "VARCHAR(100) DEFAULT 'Infrastructure'"),
        ("responsible_minister", "VARCHAR(150)"),
        ("responsible_secretary", "VARCHAR(150)"),
        ("head_of_department", "VARCHAR(150)"),
        ("nodal_officer_name", "VARCHAR(150)"),
        ("nodal_officer_designation", "VARCHAR(150)"),
        ("nodal_officer_phone", "VARCHAR(50)"),
        ("jurisdiction", "VARCHAR(150)"),
        ("sla_standard_days", "INTEGER DEFAULT 30"),
        ("data_mode", "VARCHAR(20) DEFAULT 'mock'"),
        ("data_status", "VARCHAR(50) DEFAULT 'Seeded Demo'")
    ]
    for col, col_type in new_dept_cols:
        if col not in dept_cols:
            cursor.execute(f"ALTER TABLE departments ADD COLUMN {col} {col_type}")

    # Table: department_dependencies
    cursor.execute("PRAGMA table_info(department_dependencies)")
    dep_cols = [r[1] for r in cursor.fetchall()]
    new_dep_cols = [
        ("dependency_code", "VARCHAR(50)"),
        ("work_package_id", "INTEGER"),
        ("responsible_officer", "VARCHAR(150)"),
        ("criticality", "VARCHAR(20) DEFAULT 'MEDIUM'"),
        ("date_raised", "DATETIME"),
        ("days_pending", "INTEGER DEFAULT 0"),
        ("escalation_level", "VARCHAR(50) DEFAULT 'NONE'"),
        ("recommended_action", "TEXT"),
        ("supporting_document_ref", "VARCHAR(100)"),
        ("upstream_dependency_id", "INTEGER"),
        ("downstream_dependency_id", "INTEGER"),
        ("data_mode", "VARCHAR(20) DEFAULT 'mock'"),
        ("data_status", "VARCHAR(50) DEFAULT 'Seeded Demo'"),
        ("source_type", "VARCHAR(50) DEFAULT 'synthetic'"),
        ("generated_at", "DATETIME")
    ]
    for col, col_type in new_dep_cols:
        if col not in dep_cols:
            cursor.execute(f"ALTER TABLE department_dependencies ADD COLUMN {col} {col_type}")

    # Table: approvals
    cursor.execute("PRAGMA table_info(approvals)")
    app_cols = [r[1] for r in cursor.fetchall()]
    new_app_cols = [
        ("work_package_id", "INTEGER"),
        ("submitting_department_id", "INTEGER"),
        ("approving_department_id", "INTEGER"),
        ("assigned_officer", "VARCHAR(150)"),
        ("submission_date", "DATETIME"),
        ("sla_target_days", "INTEGER DEFAULT 30"),
        ("overdue_days", "INTEGER DEFAULT 0"),
        ("review_remarks", "TEXT"),
        ("document_ref", "VARCHAR(100)"),
        ("sla_status", "VARCHAR(50) DEFAULT 'ON_TRACK'"),
        ("data_mode", "VARCHAR(20) DEFAULT 'mock'"),
        ("data_status", "VARCHAR(50) DEFAULT 'Seeded Demo'"),
        ("source_type", "VARCHAR(50) DEFAULT 'synthetic'"),
        ("generated_at", "DATETIME")
    ]
    for col, col_type in new_app_cols:
        if col not in app_cols:
            cursor.execute(f"ALTER TABLE approvals ADD COLUMN {col} {col_type}")

    # Table: land_parcels
    cursor.execute("PRAGMA table_info(land_parcels)")
    lp_cols = [r[1] for r in cursor.fetchall()]
    new_lp_cols = [
        ("landowner_name", "VARCHAR(150)"),
        ("acquisition_stage", "VARCHAR(50) DEFAULT 'Valuation'"),
        ("legal_provision", "VARCHAR(100) DEFAULT 'Tamil Nadu Highways Act 2001 (TN Act 34/2002)'"),
        ("compensation_status", "VARCHAR(50) DEFAULT 'PENDING'"),
        ("possession_date", "DATETIME"),
        ("dispute_details", "TEXT"),
        ("geo_lat", "FLOAT"),
        ("geo_lng", "FLOAT"),
        ("blocking_project_milestone", "VARCHAR(200)"),
        ("data_mode", "VARCHAR(20) DEFAULT 'mock'"),
        ("data_status", "VARCHAR(50) DEFAULT 'Seeded Demo'"),
        ("source_type", "VARCHAR(50) DEFAULT 'synthetic'"),
        ("generated_at", "DATETIME")
    ]
    for col, col_type in new_lp_cols:
        if col not in lp_cols:
            cursor.execute(f"ALTER TABLE land_parcels ADD COLUMN {col} {col_type}")

    conn.commit()
    conn.close()


def seed_department_land_utility_data():
    upgrade_sqlite_columns()
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # -------------------------------------------------------------
        # 1. 10 PARTICIPATING DEPARTMENTS
        # -------------------------------------------------------------
        depts_spec = [
            {
                "code": "HIGHWAYS",
                "name": "Highways and Minor Ports Department",
                "category": "State Highways",
                "is_external": False,
                "responsible_minister": "Thiru E.V. Velu (Minister for Public Works)",
                "responsible_secretary": "Dr. D. Jagannathan, I.A.S. (Principal Secretary)",
                "head_of_department": "Er. R. Chandrasekhar (Chief Engineer, C&M)",
                "nodal_officer_name": "Er. K. Murugesan",
                "nodal_officer_designation": "Joint Chief Engineer (Planning)",
                "nodal_officer_phone": "+91 44 2567 1234",
                "jurisdiction": "Statewide Highway Corridors & Expressways",
                "sla_standard_days": 15
            },
            {
                "code": "REVENUE",
                "name": "Revenue and Disaster Management Department",
                "category": "Land & Revenue",
                "is_external": True,
                "responsible_minister": "Thiru K.K.S.S.R. Ramachandran (Minister for Revenue)",
                "responsible_secretary": "Thiru P. Amudha, I.A.S. (Principal Secretary)",
                "head_of_department": "Commissioner of Land Administration (CLA)",
                "nodal_officer_name": "Thiru S. Meenakshisundaram",
                "nodal_officer_designation": "Special District Revenue Officer (LA)",
                "nodal_officer_phone": "+91 44 2854 4432",
                "jurisdiction": "Land Valuation, Sec 15(2) Notifications & Sec 19 Awards",
                "sla_standard_days": 45
            },
            {
                "code": "TANGEDCO",
                "name": "Tamil Nadu Generation and Distribution Corporation (TANGEDCO)",
                "category": "Power & Utilities",
                "is_external": True,
                "responsible_minister": "Thiru V. Senthilbalaji (Minister for Electricity)",
                "responsible_secretary": "Thiru Rajesh Lakhoni, I.A.S. (CMD, TANGEDCO)",
                "head_of_department": "Director (Distribution), TANGEDCO",
                "nodal_officer_name": "Er. M. Rajavel",
                "nodal_officer_designation": "Superintending Engineer (Distribution)",
                "nodal_officer_phone": "+91 44 2852 0131",
                "jurisdiction": "HT/LT Electrical Lines, Pole Shifting, Transformers & Shutdowns",
                "sla_standard_days": 30
            },
            {
                "code": "TWAD",
                "name": "Tamil Nadu Water Supply and Drainage Board (TWAD)",
                "category": "Water & Sanitation",
                "is_external": True,
                "responsible_minister": "Thiru K.N. Nehru (Minister for Municipal Administration)",
                "responsible_secretary": "Thiru V. Dakshinamoorthy, I.A.S. (MD, TWAD Board)",
                "head_of_department": "Engineering Director, TWAD Board",
                "nodal_officer_name": "Er. P. Shanmugam",
                "nodal_officer_designation": "Chief Engineer (TWAD Regional Wing)",
                "nodal_officer_phone": "+91 44 2841 0422",
                "jurisdiction": "Bulk Water Transmission Mains & CWSS Pipelines",
                "sla_standard_days": 30
            },
            {
                "code": "FOREST",
                "name": "Department of Environment, Climate Change and Forests",
                "category": "Environment & Forest",
                "is_external": True,
                "responsible_minister": "Thiru M. Mathiventhan (Minister for Forests)",
                "responsible_secretary": "Dr. Supriya Sahu, I.A.S. (Additional Chief Secretary)",
                "head_of_department": "Principal Chief Conservator of Forests (HoFF)",
                "nodal_officer_name": "Thiru R. Kanchana, I.F.S.",
                "nodal_officer_designation": "Conservator of Forests (Eco-Protection)",
                "nodal_officer_phone": "+91 44 2432 1789",
                "jurisdiction": "Forest Land Diversion (FCA 1980), Ghat Road Clearances & Eco-Sensitivities",
                "sla_standard_days": 60
            },
            {
                "code": "RAILWAYS",
                "name": "Southern Railway (Zone 7, Indian Railways)",
                "category": "Rail & Transport",
                "is_external": True,
                "responsible_minister": "Minister of Railways (Govt of India)",
                "responsible_secretary": "General Manager, Southern Railway",
                "head_of_department": "Chief Bridge Engineer (CBE), Southern Railway",
                "nodal_officer_name": "Er. G. Ravikumar",
                "nodal_officer_designation": "Deputy Chief Engineer (General Arrangement Drawings)",
                "nodal_officer_phone": "+91 44 2535 3456",
                "jurisdiction": "ROB/RUB Clearances, CRS Sanctions & GAD Approvals",
                "sla_standard_days": 90
            },
            {
                "code": "PWD",
                "name": "Public Works Department (Buildings & Water Resources)",
                "category": "Public Works",
                "is_external": True,
                "responsible_minister": "Thiru E.V. Velu (Minister for Public Works)",
                "responsible_secretary": "Thiru B. Chandra Mohan, I.A.S. (Principal Secretary)",
                "head_of_department": "Engineer-in-Chief (WRD & Buildings)",
                "nodal_officer_name": "Er. S. Annamalai",
                "nodal_officer_designation": "Superintending Engineer (Design & Inter-Agency Coordination)",
                "nodal_officer_phone": "+91 44 2567 4321",
                "jurisdiction": "River Basin Clearances, Irrigation Canal Bridges & Govt Buildings",
                "sla_standard_days": 25
            },
            {
                "code": "MUNICIPAL",
                "name": "Municipal Administration & Water Supply (MAWS / ULBs)",
                "category": "Urban Local Body",
                "is_external": True,
                "responsible_minister": "Thiru K.N. Nehru (Minister for Municipal Admin)",
                "responsible_secretary": "Thiru D. Karthikeyan, I.A.S. (Principal Secretary)",
                "head_of_department": "Director of Municipal Administration (DMA)",
                "nodal_officer_name": "Thiru V. Subbarayan",
                "nodal_officer_designation": "Joint Director (Urban Highway Integration)",
                "nodal_officer_phone": "+91 44 2859 2200",
                "jurisdiction": "Urban Stormwater Drains, Street Furniture, Vendor Shifting & Road Cuts",
                "sla_standard_days": 20
            },
            {
                "code": "POLICE",
                "name": "Tamil Nadu Police (Traffic Planning & Highway Safety Wing)",
                "category": "Law & Order",
                "is_external": True,
                "responsible_minister": "Hon'ble Chief Minister (Home Department)",
                "responsible_secretary": "Thiru P. Niranjan Diwakar, I.P.S. (DGP & HoPF)",
                "head_of_department": "Additional Director General of Police (Traffic & Road Safety)",
                "nodal_officer_name": "Thiru T. Senthilkumar, I.P.S.",
                "nodal_officer_designation": "Superintendent of Police (Highway Patrol & Diversions)",
                "nodal_officer_phone": "+91 44 2844 7711",
                "jurisdiction": "Traffic Diversion Plans, Blasting Permissions & Highway Speed Signage",
                "sla_standard_days": 15
            },
            {
                "code": "TELECOM",
                "name": "Department of Telecommunications & Utility Infrastructure Agencies",
                "category": "Telecommunications",
                "is_external": True,
                "responsible_minister": "Ministry of Communications (DoT / TN Circle)",
                "responsible_secretary": "Chief General Manager (BSNL & Optical Fiber Grid)",
                "head_of_department": "Senior DDG, Tamil Nadu LSA",
                "nodal_officer_name": "Er. N. Padmanabhan",
                "nodal_officer_designation": "Divisional Engineer (Right of Way & Cable Protection)",
                "nodal_officer_phone": "+91 44 2827 8899",
                "jurisdiction": "Optical Fiber Cables (OFC), 4G/5G Duct Relocations & Telecom Towers",
                "sla_standard_days": 20
            }
        ]

        dept_map = {}
        for d_spec in depts_spec:
            dept = db.query(Department).filter(Department.code == d_spec["code"]).first()
            if not dept:
                dept = Department(
                    code=d_spec["code"],
                    name=d_spec["name"],
                    contact_email=f"{d_spec['code'].lower()}@tn.gov.in",
                    is_external=d_spec["is_external"]
                )
                db.add(dept)
                db.commit()
                db.refresh(dept)
            # Update attributes
            dept.category = d_spec["category"]
            dept.responsible_minister = d_spec["responsible_minister"]
            dept.responsible_secretary = d_spec["responsible_secretary"]
            dept.head_of_department = d_spec["head_of_department"]
            dept.nodal_officer_name = d_spec["nodal_officer_name"]
            dept.nodal_officer_designation = d_spec["nodal_officer_designation"]
            dept.nodal_officer_phone = d_spec["nodal_officer_phone"]
            dept.jurisdiction = d_spec["jurisdiction"]
            dept.sla_standard_days = d_spec["sla_standard_days"]
            dept.data_mode = "mock"
            dept.data_status = "Seeded Demo"
            dept_map[d_spec["code"]] = dept
        db.commit()

        # -------------------------------------------------------------
        # 2. ENSURE 12 PROJECTS & 20 PACKAGES EXIST
        # -------------------------------------------------------------
        existing_projects = db.query(Project).all()
        current_p_codes = {p.project_code: p for p in existing_projects}

        projects_to_seed = [
            ("PRJ-TN-2026-001", "Widening to 4 Lanes with Paved Shoulders of SH-49 (ECR)", 145.5, 38.0),
            ("PRJ-TN-2026-002", "Construction of 4-Lane Grade Separator at Anna Nagar Roundtana", 85.0, 48.0),
            ("PRJ-TN-2026-003", "Reconstruction of Distressed High-Level Bridge across Kollidam", 62.0, 72.0),
            ("PRJ-CKICP-001", "CKICP SH-15 Ooty-Gudalur Ghat Corridor Widening & Strengthening", 240.0, 54.0),
            ("PRJ-CKICP-002", "CKICP Tiruchirappalli Industrial Link Corridor (SH-22)", 180.0, 65.0),
            ("PRJ-TNRSP-001", "TNRSP-II Core Road Network EPC01: Kanchipuram - Arakkonam", 110.0, 80.0),
            ("PRJ-TNRSP-002", "TNRSP-II Core Road Network EPC02: Arani - Chengam Section", 130.0, 85.0),
            ("PRJ-TNRSP-003", "TNRSP-II Modified DBFOT Concession: Cuddalore - Chidambaram", 290.0, 92.0),
            ("PRJ-CRIDP-001", "CRIDP Major District Road Improvement: Salem - Harur Link", 75.0, 60.0),
            ("PRJ-CRIDP-002", "CRIDP Coastal Highway Upgradation: Nagapattinam - Vedaranyam", 95.0, 40.0),
            ("PRJ-CKICP-003", "CKICP Madurai Outer Ring Corridor Phase II", 210.0, 35.0),
            ("PRJ-CKICP-004", "CKICP Coimbatore West Bypass Highway (Km 0/0 to 26/0)", 320.0, 25.0)
        ]

        for p_code, title, cost, prog in projects_to_seed:
            if p_code not in current_p_codes:
                p = Project(
                    project_code=p_code,
                    title=title,
                    description=f"Strategic highway infrastructure priority project for Tamil Nadu. Sanctioned under Highway Modernisation Plan.",
                    road_type="State Highway",
                    estimated_cost_cr=cost,
                    sanctioned_cost_cr=cost,
                    expenditure_to_date_cr=cost * (prog / 100.0) * 0.85,
                    physical_progress_pct=prog,
                    financial_progress_pct=prog * 0.9,
                    status="IN_PROGRESS" if prog < 85 else "COMPLETED",
                    priority="HIGH",
                    zone_id=1,
                    circle_id=1,
                    division_id=1,
                    executing_department_id=dept_map["HIGHWAYS"].id,
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=300)
                )
                db.add(p)
                db.commit()
                db.refresh(p)
                current_p_codes[p_code] = p

        all_projects = db.query(Project).all()
        proj_id_map = {p.id: p for p in all_projects}

        # Ensure Work Packages (20 total)
        current_pkgs = db.query(WorkPackage).count()
        if current_pkgs < 20:
            for i in range(current_pkgs + 1, 21):
                p_target = all_projects[(i - 1) % len(all_projects)]
                wp = WorkPackage(
                    project_id=p_target.id,
                    package_number=f"PKG-EPC-{i:02d}",
                    title=f"Package {i:02d}: Civil & Structural Works",
                    scope_description=f"Four-laning, flexible pavement, culvert structures and utility ducts.",
                    cost_cr=p_target.estimated_cost_cr / 2.0,
                    start_km=0.0,
                    end_km=25.0,
                    status="IN_PROGRESS"
                )
                db.add(wp)
            db.commit()

        work_packages = db.query(WorkPackage).all()

        # -------------------------------------------------------------
        # 3. SEED 50 LAND PARCELS
        # -------------------------------------------------------------
        # Note: 4 parcels already exist in DB. We extend up to 50 parcels.
        existing_lps = db.query(LandParcel).all()
        existing_lp_refs = {lp.parcel_reference for lp in existing_lps}

        districts = [
            ("Nilgiris", "Udhagamandalam", "Pykara"),
            ("Coimbatore", "Mettupalayam", "Sirumugai"),
            ("Kancheepuram", "Walajabad", "Singadivakkam"),
            ("Chengalpattu", "Tiruporur", "Kalavakkam"),
            ("Villupuram", "Tindivanam", "Mailam"),
            ("Tiruppur", "Dharapuram", "Kundadam"),
            ("Salem", "Attur", "Thalaivasal"),
            ("Madurai", "Melur", "Kottampatti"),
            ("Tiruchirappalli", "Lalgudi", "Manachanallur"),
            ("Tirunelveli", "Ambasamudram", "Cheranmahadevi")
        ]

        stages_cycle = [
            ("Survey", "PENDING", "PENDING", "Special Tehsildar (LA)"),
            ("Notification 15(2)", "PENDING", "PENDING", "Special DRO (LA)"),
            ("Objections 15(3)", "PENDING", "PENDING", "District Collectorate"),
            ("Gazette 15(1)", "PENDING", "PENDING", "Highways & Minor Ports Dept"),
            ("Valuation", "PENDING", "PENDING", "Competent Authority (LA)"),
            ("Award 19(1)", "PENDING", "PENDING", "Special DRO (LA)"),
            ("Compensation", "PARTIAL", "PENDING_POSSESSION", "District Treasury"),
            ("Possession", "PAID", "POSSESSION_HANDED_OVER", "Highways Divisional Engineer"),
            ("Handover", "PAID", "POSSESSION_HANDED_OVER", "Contractor Project Director")
        ]

        # Specific Scenario Record (Section 12): LA-SH15-01 on Project 4 (SH-15 Ghat Corridor)
        lp_scenario = db.query(LandParcel).filter(LandParcel.parcel_reference == "LA-SH15-01").first()
        if not lp_scenario:
            lp_scenario = LandParcel(
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                parcel_reference="LA-SH15-01",
                district="Nilgiris",
                taluk="Udhagamandalam",
                village="Pykara",
                survey_number="142/2A, 142/2B",
                landowner_name="Thiru K. Sivasubramanian & 3 Others (Joint Pattadars)",
                land_classification="Dry / Wet Private Agricultural",
                private_land_sqm=4850.0,
                govt_land_sqm=650.0,
                total_land_sqm=5500.0,
                acquisition_stage="Award 19(1)",
                legal_provision="Tamil Nadu Highways Act 2001 (TN Act 34/2002) Sec 19(1)",
                notification_15_2_date=datetime.datetime(2025, 4, 10),
                gazette_15_1_date=datetime.datetime(2025, 8, 14),
                award_19_1_date=datetime.datetime(2025, 12, 18),
                compensation_assessed_cr=0.85,
                compensation_paid_cr=0.00,
                compensation_status="PENDING",
                possession_status="PENDING_POSSESSION",
                has_litigation=False,
                responsible_revenue_officer="Thiru S. Meenakshisundaram (Special DRO LA, Ooty)",
                blocking_project_milestone="Embankment & Carriageway Formation Km 14+200",
                dispute_details="Pattadars accepted award valuation but compensation disbursement voucher pending at District Treasury.",
                geo_lat=11.4180,
                geo_lng=76.6980,
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(lp_scenario)
            db.commit()
            existing_lp_refs.add("LA-SH15-01")
        else:
            lp_scenario.project_id = 4
            lp_scenario.compensation_assessed_cr = 0.85
            lp_scenario.compensation_paid_cr = 0.00
            lp_scenario.compensation_status = "PENDING"
            lp_scenario.possession_status = "PENDING_POSSESSION"
            lp_scenario.possession_date = None
            lp_scenario.blocking_project_milestone = "Embankment & Carriageway Formation Km 14+200"
            lp_scenario.village = "Pykara"
            db.commit()

        # Fill remaining parcels up to 50
        current_total_lps = db.query(LandParcel).count()
        for idx in range(current_total_lps + 1, 51):
            ref = f"LA-TN-{idx:03d}"
            if ref in existing_lp_refs:
                continue

            dist_tuple = districts[(idx - 1) % len(districts)]
            stage_info = stages_cycle[(idx - 1) % len(stages_cycle)]
            p_assign = all_projects[(idx - 1) % len(all_projects)]
            pkg_assign = work_packages[(idx - 1) % len(work_packages)] if work_packages else None

            private_area = 1500.0 + (idx * 120.0)
            govt_area = 200.0 + (idx * 30.0)
            total_area = private_area + govt_area
            comp_assessed = round(0.20 + (idx * 0.04), 2)
            comp_paid = comp_assessed if stage_info[1] == "PAID" else (comp_assessed * 0.5 if stage_info[1] == "PARTIAL" else 0.0)

            lp = LandParcel(
                project_id=p_assign.id,
                work_package_id=pkg_assign.id if pkg_assign else None,
                parcel_reference=ref,
                district=dist_tuple[0],
                taluk=dist_tuple[1],
                village=dist_tuple[2],
                survey_number=f"{100 + idx}/{idx % 4 + 1}{chr(65 + (idx % 3))}",
                landowner_name=f"Synthetic Pattadar #{idx} (Family Trust)",
                land_classification="Dry Private" if idx % 2 == 0 else "Wet Private Agricultural",
                private_land_sqm=private_area,
                govt_land_sqm=govt_area,
                total_land_sqm=total_area,
                acquisition_stage=stage_info[0],
                legal_provision="Tamil Nadu Highways Act 2001 Sec 15(2)",
                notification_15_2_date=datetime.datetime(2025, 2, 1) + datetime.timedelta(days=idx * 4),
                gazette_15_1_date=datetime.datetime(2025, 6, 1) + datetime.timedelta(days=idx * 4) if idx > 15 else None,
                award_19_1_date=datetime.datetime(2025, 10, 1) + datetime.timedelta(days=idx * 4) if idx > 25 else None,
                compensation_assessed_cr=comp_assessed,
                compensation_paid_cr=comp_paid,
                compensation_status=stage_info[1],
                possession_status=stage_info[2],
                has_litigation=(idx % 7 == 0),
                responsible_revenue_officer=stage_info[3],
                blocking_project_milestone=f"Milestone MS-{idx % 4 + 1}: Chainage Km {idx * 2}" if stage_info[2] == "PENDING_POSSESSION" else None,
                dispute_details="Title verification query raised by legal heirs" if (idx % 7 == 0) else None,
                geo_lat=11.2000 + (idx * 0.015),
                geo_lng=77.1000 + (idx * 0.015),
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(lp)
        db.commit()

        # -------------------------------------------------------------
        # 4. SEED 30 LAND ACQUISITION WORKFLOW RECORDS
        # -------------------------------------------------------------
        if db.query(LandAcquisitionWorkflowRecord).count() < 30:
            sample_parcels = db.query(LandParcel).all()[:10]
            workflow_stages = [
                ("Identification", "COMPLETED", "Special Land Acquisition Officer"),
                ("Survey & Demarcation", "COMPLETED", "Revenue Field Inspector"),
                ("Notification 15(2)", "COMPLETED", "Highways Department Gazetted Officer"),
                ("Hearing of Objections 15(3)", "COMPLETED", "District Revenue Officer"),
                ("Gazette Declaration 15(1)", "COMPLETED", "Government of Tamil Nadu"),
                ("Joint Valuation", "COMPLETED", "Public Works Department (Bldgs) & Revenue"),
                ("Award Enquiry 19(1)", "IN_PROGRESS", "Special DRO (LA)"),
                ("Compensation Disbursement", "PENDING", "District Treasury Officer"),
                ("Physical Possession Handover", "PENDING", "Highways Divisional Engineer")
            ]
            for p_idx, p in enumerate(sample_parcels):
                for s_idx, (s_name, s_status, s_auth) in enumerate(workflow_stages):
                    if db.query(LandAcquisitionWorkflowRecord).count() >= 30:
                        break
                    wf = LandAcquisitionWorkflowRecord(
                        parcel_id=p.id,
                        stage_name=s_name,
                        sequence_order=s_idx + 1,
                        status=s_status if p_idx > 0 else ("BLOCKED" if s_idx == 7 else s_status),
                        responsible_authority=s_auth,
                        target_date=datetime.datetime(2026, 1, 10) + datetime.timedelta(days=s_idx * 20),
                        completed_date=datetime.datetime(2026, 1, 10) + datetime.timedelta(days=s_idx * 18) if s_status == "COMPLETED" else None,
                        document_reference=f"GO-MS-{200 + s_idx}/2026",
                        remarks="Stage processed as per TN Highways Act 2001 statutory timeline."
                    )
                    db.add(wf)
            db.commit()

        # -------------------------------------------------------------
        # 5. SEED 25 UTILITY SHIFTING RECORDS
        # -------------------------------------------------------------
        utl_scen = db.query(UtilityShiftingRecord).filter(UtilityShiftingRecord.utility_code == "UTL-SH15-001").first()
        if not utl_scen:
            utl_scen = UtilityShiftingRecord(
                utility_code="UTL-SH15-001",
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                location_chainage="SH-15 Km 4/0 to 12/0 (Ghat Carriage Edge)",
                utility_category="Electricity Poles & Transformers",
                owning_agency="TANGEDCO (Nilgiris EDC)",
                department_id=dept_map["TANGEDCO"].id,
                contact_officer="Er. M. Rajavel (Superintending Engineer, TANGEDCO)",
                affected_assets_count=48,
                estimated_cost_cr=0.42,
                approved_cost_cr=0.42,
                fund_allocation_status="SANCTIONED",
                application_date=datetime.datetime(2025, 11, 15),
                joint_inspection_date=datetime.datetime(2025, 12, 10),
                approval_status="APPROVED",
                work_order_status="IN_PROGRESS",
                physical_shifting_progress_pct=25.0,
                verification_status="UNVERIFIED",
                target_completion_date=datetime.datetime(2026, 2, 28),
                blocking_milestone="Embankment Rock Cutting & Shoulder Widening (Km 4/0 to 12/0)",
                remarks="48 electrical poles require shifting away from ghat carriage edge. Power shutdown scheduled with Gudalur 66kV substation.",
                geo_lat=11.4250,
                geo_lng=76.7020,
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic",
                scenario_id="SCN-UTL-01"
            )
            db.add(utl_scen)
            db.commit()
        else:
            utl_scen.project_id = 4
            utl_scen.affected_assets_count = 48
            utl_scen.work_order_status = "IN_PROGRESS"
            utl_scen.physical_shifting_progress_pct = 25.0
            utl_scen.verification_status = "UNVERIFIED"
            db.commit()

        if db.query(UtilityShiftingRecord).count() < 25:

            utility_categories = [
                ("Electricity Poles & 11kV Lines", "TANGEDCO", "TANGEDCO", 0.35, 32),
                ("Water Supply Distribution Mains", "TWAD Board", "TWAD", 0.55, 1),
                ("Optical Fiber Cable Duct", "BSNL / BharatNet", "TELECOM", 0.18, 6),
                ("Stormwater RCC Box Drain", "Municipal Corporation MAWS", "MUNICIPAL", 0.40, 1),
                ("Gas Transmission Pipeline", "GAIL / IOCL Gas", "HIGHWAYS", 0.85, 1),
                ("High-Tension Transmission Tower (110kV)", "TANTRANSCO", "TANGEDCO", 1.20, 2)
            ]

            for u_idx in range(2, 26):
                u_cat = utility_categories[(u_idx - 2) % len(utility_categories)]
                p_u = all_projects[(u_idx - 1) % len(all_projects)]
                pkg_u = work_packages[(u_idx - 1) % len(work_packages)] if work_packages else None
                dept_target = dept_map.get(u_cat[2], dept_map["HIGHWAYS"])

                prog = 0.0 if u_idx % 4 == 0 else (45.0 if u_idx % 4 == 1 else 100.0)
                app_stat = "APPROVED" if prog > 0 else "UNDER_REVIEW"
                ver_stat = "VERIFIED" if prog == 100.0 else "UNVERIFIED"

                utl = UtilityShiftingRecord(
                    utility_code=f"UTL-2026-{u_idx:03d}",
                    project_id=p_u.id,
                    work_package_id=pkg_u.id if pkg_u else None,
                    location_chainage=f"{p_u.project_code} Km {u_idx * 3}+200",
                    utility_category=u_cat[0],
                    owning_agency=u_cat[1],
                    department_id=dept_target.id,
                    contact_officer=f"Er. Synthetic Officer #{u_idx} ({u_cat[1]})",
                    affected_assets_count=u_cat[4],
                    estimated_cost_cr=u_cat[3],
                    approved_cost_cr=u_cat[3] if app_stat == "APPROVED" else 0.0,
                    fund_allocation_status="DISBURSED" if prog == 100.0 else ("SANCTIONED" if app_stat == "APPROVED" else "PENDING"),
                    application_date=datetime.datetime(2025, 9, 1) + datetime.timedelta(days=u_idx * 5),
                    joint_inspection_date=datetime.datetime(2025, 10, 1) + datetime.timedelta(days=u_idx * 5),
                    approval_status=app_stat,
                    work_order_status="COMPLETED" if prog == 100.0 else ("IN_PROGRESS" if prog > 0 else "ISSUED"),
                    physical_shifting_progress_pct=prog,
                    verification_status=ver_stat,
                    target_completion_date=datetime.datetime(2026, 3, 31),
                    actual_completion_date=datetime.datetime(2026, 1, 15) if prog == 100.0 else None,
                    blocking_milestone=f"Milestone 2: Subgrade Compaction Km {u_idx * 3}" if prog < 100.0 else None,
                    remarks="Utility shifting coordinated through Single Window Clearance portal.",
                    geo_lat=11.1500 + (u_idx * 0.02),
                    geo_lng=77.2000 + (u_idx * 0.02),
                    data_mode="mock",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(utl)
            db.commit()

        # -------------------------------------------------------------
        # 6. SEED 25 INTERDEPARTMENTAL DEPENDENCIES
        # -------------------------------------------------------------
        if db.query(DepartmentDependency).count() < 25:
            # Scenario records (Section 12): DEP-SH15-001 & DEP-SH15-002
            dep_scenario_1 = DepartmentDependency(
                dependency_code="DEP-SH15-001",
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                requesting_dept_id=dept_map["HIGHWAYS"].id,
                target_dept_id=dept_map["REVENUE"].id,
                responsible_officer="Thiru S. Meenakshisundaram (Special DRO LA)",
                dependency_type="Land Acquisition Compensation Disbursement",
                description="Disbursement of Section 19(1) award compensation (₹0.85 Cr) for Pykara parcel LA-SH15-01 to permit physical possession.",
                impact_days=45,
                criticality="CRITICAL",
                date_raised=datetime.datetime(2025, 12, 20),
                target_clearance_date=datetime.datetime(2026, 1, 31),
                days_pending=48,
                escalation_level="SECRETARY",
                recommended_action="Convene joint review with Principal Secretary (Revenue) to direct Nilgiris District Treasury to release award cheques.",
                supporting_document_ref="GO-MS-88/2025-HW",
                status="ESCALATED",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )

            dep_scenario_2 = DepartmentDependency(
                dependency_code="DEP-SH15-002",
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                requesting_dept_id=dept_map["HIGHWAYS"].id,
                target_dept_id=dept_map["TANGEDCO"].id,
                responsible_officer="Er. M. Rajavel (SE, TANGEDCO)",
                dependency_type="TANGEDCO 11kV Electrical Pole Shifting",
                description="Power shutdown clearance and completion of shifting for 48 poles obstructing road carriage edge (UTL-SH15-001).",
                impact_days=30,
                criticality="CRITICAL",
                date_raised=datetime.datetime(2026, 1, 5),
                target_clearance_date=datetime.datetime(2026, 2, 15),
                days_pending=32,
                escalation_level="SECRETARY",
                recommended_action="Coordinate with CMD TANGEDCO to approve Gudalur 66kV substation feeder shutdown on upcoming Sunday.",
                supporting_document_ref="TANGEDCO-EE-OOTY-412",
                status="ESCALATED",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add_all([dep_scenario_1, dep_scenario_2])
            db.commit()

            dep_types = [
                ("Railway GAD Approval", "RAILWAYS", "Approval of General Arrangement Drawing for 4-lane ROB", 60, "CRITICAL"),
                ("Forest Clearance Stage-II", "FOREST", "Tree felling and diversion of 4.2 ha reserve forest", 90, "CRITICAL"),
                ("TWAD Bulk Pipeline Relocation", "TWAD", "Shifting of 600mm dia DI water pumping main", 30, "HIGH"),
                ("Municipal Stormwater Drain Connection", "MUNICIPAL", "NOC for linking road drainage to municipal outfall", 20, "MEDIUM"),
                ("Traffic Diversion Authorization", "POLICE", "Notification of one-way traffic during flyover girder erection", 15, "MEDIUM"),
                ("Optical Fiber Cable Duct Clearance", "TELECOM", "Joint inspection with BSNL for shifting underground cables", 25, "LOW")
            ]

            for d_idx in range(3, 26):
                dt = dep_types[(d_idx - 3) % len(dep_types)]
                p_dep = all_projects[(d_idx - 1) % len(all_projects)]
                pkg_dep = work_packages[(d_idx - 1) % len(work_packages)] if work_packages else None
                tgt_dept = dept_map.get(dt[1], dept_map["REVENUE"])

                d_stat = "CLEARED" if d_idx % 3 == 0 else ("ESCALATED" if d_idx % 3 == 1 else "PENDING")
                esc_lvl = "MINISTERIAL" if d_idx % 6 == 1 else ("SECRETARY" if d_stat == "ESCALATED" else "NONE")

                dep = DepartmentDependency(
                    dependency_code=f"DEP-2026-{d_idx:03d}",
                    project_id=p_dep.id,
                    work_package_id=pkg_dep.id if pkg_dep else None,
                    requesting_dept_id=dept_map["HIGHWAYS"].id,
                    target_dept_id=tgt_dept.id,
                    responsible_officer=tgt_dept.nodal_officer_name,
                    dependency_type=dt[0],
                    description=f"{dt[2]} for project {p_dep.project_code}.",
                    impact_days=dt[3],
                    criticality=dt[4],
                    date_raised=datetime.datetime(2025, 11, 1) + datetime.timedelta(days=d_idx * 3),
                    target_clearance_date=datetime.datetime(2026, 2, 28),
                    days_pending=12 + d_idx,
                    escalation_level=esc_lvl,
                    recommended_action=f"Follow up with {tgt_dept.name} nodal desk for statutory sanction.",
                    supporting_document_ref=f"DOC-REF-DEP-{d_idx:03d}",
                    status=d_stat,
                    data_mode="mock",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(dep)
            db.commit()

        # -------------------------------------------------------------
        # 7. SEED 30 APPROVAL RECORDS
        # -------------------------------------------------------------
        if db.query(Approval).count() < 30:
            # Scenario Overdue Approvals (Section 12)
            app_scen_1 = Approval(
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                approval_type="Land Acquisition Sec 19(1) Award Sanction",
                reference_number="APP-SH15-001",
                sanction_amount_cr=0.85,
                submitting_department_id=dept_map["HIGHWAYS"].id,
                approving_department_id=dept_map["REVENUE"].id,
                approved_by_role="Special District Revenue Officer (LA)",
                assigned_officer="Thiru S. Meenakshisundaram",
                submission_date=datetime.datetime(2025, 12, 10),
                sla_target_days=30,
                overdue_days=18,
                sla_status="OVERDUE",
                review_remarks="Award prepared but compensation disbursement authorization pending Treasury clearance.",
                document_ref="DRO-OOTY-LA-142",
                status="UNDER_REVIEW",
                approval_date=datetime.datetime(2025, 12, 18),
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )

            app_scen_2 = Approval(
                project_id=4,
                work_package_id=work_packages[0].id if work_packages else 1,
                approval_type="Utility Shifting Feeder Shutdown Sanction",
                reference_number="APP-SH15-002",
                sanction_amount_cr=0.42,
                submitting_department_id=dept_map["HIGHWAYS"].id,
                approving_department_id=dept_map["TANGEDCO"].id,
                approved_by_role="Superintending Engineer, TANGEDCO",
                assigned_officer="Er. M. Rajavel",
                submission_date=datetime.datetime(2025, 12, 15),
                sla_target_days=20,
                overdue_days=22,
                sla_status="ESCALATED",
                review_remarks="Power shutdown schedule under review with Chief Distribution Engineer Coimbatore.",
                document_ref="TANGEDCO-SDN-OOTY-2025",
                status="SUBMITTED",
                approval_date=datetime.datetime(2026, 1, 10),
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add_all([app_scen_1, app_scen_2])
            db.commit()

            app_types = [
                ("Administrative Sanction (AS)", "HIGHWAYS", 120.0, "Principal Secretary (Highways)", 30),
                ("Technical Sanction (TS)", "HIGHWAYS", 120.0, "Chief Engineer (C&M)", 20),
                ("Forest FCA Stage-I Approval", "FOREST", 0.0, "Conservator of Forests", 60),
                ("Railway GAD Technical Approval", "RAILWAYS", 18.5, "Chief Bridge Engineer, Southern Rly", 90),
                ("Revised Administrative Sanction", "HIGHWAYS", 24.0, "Government of Tamil Nadu", 45),
                ("TWAD Pipe Shifting Sanction", "TWAD", 0.65, "Managing Director, TWAD", 30)
            ]

            for a_idx in range(3, 31):
                at = app_types[(a_idx - 3) % len(app_types)]
                p_app = all_projects[(a_idx - 1) % len(all_projects)]
                pkg_app = work_packages[(a_idx - 1) % len(work_packages)] if work_packages else None
                tgt_dept = dept_map.get(at[1], dept_map["HIGHWAYS"])

                is_overdue = (a_idx % 4 == 0)
                app_stat = "APPROVED" if (a_idx % 3 != 0) else ("UNDER_REVIEW" if is_overdue else "SUBMITTED")

                app_rec = Approval(
                    project_id=p_app.id,
                    work_package_id=pkg_app.id if pkg_app else None,
                    approval_type=at[0],
                    reference_number=f"APP-TN-2026-{a_idx:03d}",
                    sanction_amount_cr=at[2],
                    submitting_department_id=dept_map["HIGHWAYS"].id,
                    approving_department_id=tgt_dept.id,
                    approved_by_role=at[3],
                    assigned_officer=tgt_dept.nodal_officer_name,
                    submission_date=datetime.datetime(2025, 10, 1) + datetime.timedelta(days=a_idx * 3),
                    sla_target_days=at[4],
                    overdue_days=14 if is_overdue else 0,
                    sla_status="OVERDUE" if is_overdue else "ON_TRACK",
                    review_remarks=f"Statutory scrutiny under process with {tgt_dept.name}.",
                    document_ref=f"DOC-APP-{a_idx:03d}.pdf",
                    status=app_stat,
                    approval_date=datetime.datetime(2025, 11, 1) + datetime.timedelta(days=a_idx * 3),
                    data_mode="mock",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(app_rec)
            db.commit()

        # -------------------------------------------------------------
        # 8. SEED 20 SUPPORTING DOCUMENT REFERENCES
        # -------------------------------------------------------------
        if db.query(SupportingDocumentReference).count() < 20:
            doc_specs = [
                ("DOC-GO-88", "Government Order G.O. (Ms) No. 88 Highways - Administrative Sanction", "Government Order (GO)", "Highways and Minor Ports Department", "GO(Ms) 88/2025", "2025-05-12", "APPROVAL", 1, "GO_Ms_88_2025.pdf"),
                ("DOC-NOTIF-15-2", "Tamil Nadu Government Gazette Notification Sec 15(2) - Pykara", "Gazette Notification", "Revenue and Disaster Management", "TNGG-LA-2025-04", "2025-08-14", "PARCEL", 1, "Gazette_15_2_Pykara.pdf"),
                ("DOC-AWRD-19", "Section 19(1) Land Valuation Award Order for Ooty Ghat Stretch", "Valuation Statement", "Special DRO (Land Acquisition)", "AW-2025-SH15-01", "2025-12-18", "PARCEL", 1, "Award_19_1_Ooty.pdf"),
                ("DOC-JNT-UTL", "Joint Inspection Report: 48 TANGEDCO 11kV Poles Shifting", "Joint Inspection Report", "TANGEDCO & Highways Department", "JIR-TANGEDCO-2025-48", "2025-12-10", "UTILITY", 1, "Joint_Inspection_Poles_48.pdf"),
                ("DOC-FCA-STG1", "Ministry of Environment & Forests (MoEFCC) In-Principle Stage 1 Clearance", "NOC", "Forest Department", "FCA-TN-2025-014", "2025-07-22", "DEPENDENCY", 1, "MoEFCC_Stage1_Approval.pdf"),
                ("DOC-ROB-GAD", "Southern Railway Approved General Arrangement Drawing (GAD)", "Technical Sanction", "Southern Railway", "SR-CBE-GAD-2025-11", "2025-11-04", "APPROVAL", 2, "Southern_Railway_GAD_Approved.pdf"),
                ("DOC-TWAD-NOC", "TWAD Board Bulk Water Pipe Cross-Drainage Technical NOC", "NOC", "TWAD Board", "TWAD-NOC-2025-88", "2025-10-18", "UTILITY", 2, "TWAD_Pipeline_NOC.pdf"),
                ("DOC-POLICE-DIV", "Commissioner of Police Traffic Regulation & Blasting Window Order", "Government Order (GO)", "Tamil Nadu Police", "COP-TRF-2026-02", "2026-01-15", "DEPENDENCY", 2, "Traffic_Diversion_Order.pdf")
            ]

            for d_idx, (d_code, title, dtype, idept, rnum, odate, retype, reid, fname) in enumerate(doc_specs):
                sdr = SupportingDocumentReference(
                    document_code=d_code,
                    title=title,
                    document_type=dtype,
                    issuing_department=idept,
                    reference_number=rnum,
                    order_date=odate,
                    related_entity_type=retype,
                    related_entity_id=reid,
                    file_name=fname,
                    verification_status="Verified"
                )
                db.add(sdr)

            # Fill remaining to 20
            for extra_idx in range(len(doc_specs) + 1, 21):
                sdr_extra = SupportingDocumentReference(
                    document_code=f"DOC-REF-STAT-{extra_idx:02d}",
                    title=f"Statutory Compliance Document #{extra_idx}: Interdepartmental Clearance",
                    document_type="Gazette Notification" if extra_idx % 2 == 0 else "NOC",
                    issuing_department="Highways and Minor Ports Department",
                    reference_number=f"DOC-STAT-{extra_idx}/2026",
                    order_date="2026-01-20",
                    related_entity_type="APPROVAL",
                    related_entity_id=extra_idx,
                    file_name=f"Statutory_Clearance_{extra_idx}.pdf",
                    verification_status="Verified"
                )
                db.add(sdr_extra)
            db.commit()

        # -------------------------------------------------------------
        # 9. SEED 15 AI DEPARTMENTAL & LAND/UTILITY INTELLIGENCE FINDINGS
        # -------------------------------------------------------------
        if db.query(DepartmentAIFinding).count() < 15:
            # Demonstration Scenario Findings (Section 12)
            findings_data = [
                (
                    "DAIF-SH15-001",
                    "Multi-Dept Deadlock",
                    4,
                    1,
                    "PARCEL",
                    1,
                    "LA-SH15-01",
                    dept_map["REVENUE"].id,
                    "Revenue and Disaster Management Department",
                    "Critical Land Compensation Delay Halting CKICP SH-15 Ghat Corridor",
                    "CRITICAL",
                    0.96,
                    "Award passed for ₹0.85 Cr under Sec 19(1) for Pykara parcel LA-SH15-01, but compensation disbursement pending 48 days. Physical possession not handed over, directly stalling rock-cutting and carriageway formation on Km 14+200.",
                    "Evidence: Award Order AW-2025-SH15-01 dated 18 Dec 2025; District Treasury pending token #4102.",
                    "Secretary (Highways) to convene joint clearance with Principal Secretary (Revenue) to direct Nilgiris District Treasury to release cheques within 7 days.",
                    "Principal Secretary (Highways)",
                    datetime.datetime(2026, 2, 28)
                ),
                (
                    "DAIF-SH15-002",
                    "Utility Shifting Blocker",
                    4,
                    1,
                    "UTILITY",
                    1,
                    "UTL-SH15-001",
                    dept_map["TANGEDCO"].id,
                    "TANGEDCO",
                    "48 Unshifted TANGEDCO 11kV Poles Stalling Embankment Formation on SH-15",
                    "CRITICAL",
                    0.94,
                    "48 electrical poles (UTL-SH15-001) remain on ghat carriage edge between Km 4/0 and 12/0. Feeder shutdown sanction pending 22 days past SLA. Blasting and widening halted due to high-voltage electrocution risk.",
                    "Evidence: Joint Inspection Report JIR-TANGEDCO-2025-48; Field Inspection INSP-2026-001 geo-tags.",
                    "Minister-level coordination with Minister for Electricity to authorize Gudalur 66kV substation weekend power shutdown.",
                    "Hon'ble Minister for Public Works",
                    datetime.datetime(2026, 2, 20)
                ),
                (
                    "DAIF-2026-003",
                    "SLA Breach",
                    1,
                    1,
                    "APPROVAL",
                    2,
                    "APP-TN-2026-004",
                    dept_map["FOREST"].id,
                    "Forest Department",
                    "Forest Stage-II Clearance Exceeding Statutory SLA by 34 Days (SH-49 ECR)",
                    "HIGH",
                    0.92,
                    "Tree enumeration completed for 340 avenue trees along ECR corridor, but Conservator of Forests office has exceeded 60-day MoEFCC SLA by 34 days without formal query.",
                    "Evidence: Proposal FCA-TN-2025-014; Forest Inspection Report dated 12 Oct 2025.",
                    "Direct Chief Conservator of Forests to issue formal Stage-II working permission.",
                    "Principal Secretary (Forests)",
                    datetime.datetime(2026, 3, 10)
                ),
                (
                    "DAIF-2026-004",
                    "Land Acquisition Delay",
                    2,
                    1,
                    "PARCEL",
                    2,
                    "LA-TN-002",
                    dept_map["REVENUE"].id,
                    "Revenue and Disaster Management Department",
                    "Disputed Survey No. 88/3A Under Civil Court Stay (Anna Nagar Grade Separator)",
                    "HIGH",
                    0.90,
                    "Interim injunction in O.S. 412/2025 by private claimant on 450 sq.m approach ramp land. Compensation deposited in civil court but physical stay active.",
                    "Evidence: Civil Court Interim Order dated 14 Nov 2025.",
                    "Direct Special Government Pleader (Highways) to file vacate-stay petition on public infrastructure urgency grounds.",
                    "Chief Engineer (Metro Highways)",
                    datetime.datetime(2026, 3, 15)
                ),
                (
                    "DAIF-2026-005",
                    "Utility Shifting Blocker",
                    3,
                    1,
                    "UTILITY",
                    3,
                    "UTL-2026-003",
                    dept_map["TWAD"].id,
                    "TWAD Board",
                    "600mm TWAD Pumping Main Crosses Kollidam Bridge Approach Embankment",
                    "HIGH",
                    0.89,
                    "Pipeline diversion estimate of ₹0.55 Cr submitted by TWAD requires joint fund clearance by Highways C&M division.",
                    "Evidence: TWAD Technical Estimate #TWAD-TR-412.",
                    "Sanction ₹0.55 Cr utility diversion advance from CRIDP bridge maintenance contingency funds.",
                    "Superintending Engineer (Highways Trichy)",
                    datetime.datetime(2026, 3, 5)
                )
            ]

            for (fcode, cat, pid, wpid, retype, reid, recode, rdid, rdname, title, sev, conf, imp, evid, rec, srole, tdate) in findings_data:
                finding = DepartmentAIFinding(
                    finding_code=fcode,
                    category=cat,
                    project_id=pid,
                    work_package_id=wpid,
                    related_entity_type=retype,
                    related_entity_id=reid,
                    related_entity_code=recode,
                    responsible_department_id=rdid,
                    responsible_department_name=rdname,
                    title=title,
                    severity=sev,
                    confidence=conf,
                    impact_statement=imp,
                    evidence_notes=evid,
                    recommended_action=rec,
                    suggested_role=srole,
                    target_due_date=tdate,
                    verification_status="UNVERIFIED",
                    data_mode="mock",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(finding)

            # Fill remaining findings to 15
            for f_idx in range(len(findings_data) + 1, 16):
                p_f = all_projects[(f_idx - 1) % len(all_projects)]
                finding_extra = DepartmentAIFinding(
                    finding_code=f"DAIF-2026-{f_idx:03d}",
                    category="SLA Breach" if f_idx % 2 == 0 else "Missing Documentation",
                    project_id=p_f.id,
                    work_package_id=1,
                    related_entity_type="APPROVAL",
                    related_entity_id=f_idx,
                    related_entity_code=f"APP-TN-2026-{f_idx:03d}",
                    responsible_department_id=dept_map["HIGHWAYS"].id,
                    responsible_department_name="Highways and Minor Ports Department",
                    title=f"Statutory Clearance Timeline Monitoring for {p_f.project_code}",
                    severity="MEDIUM",
                    confidence=0.88,
                    impact_statement=f"Statutory clearance for project {p_f.project_code} requires expedited inter-departmental processing.",
                    evidence_notes=f"Single Window Portal SLA tracking indicator for project ID #{p_f.id}.",
                    recommended_action="Instruct Executive Engineer to follow up during weekly district coordination meeting.",
                    suggested_role="Divisional Engineer",
                    target_due_date=datetime.datetime(2026, 3, 20),
                    verification_status="UNVERIFIED",
                    data_mode="mock",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(finding_extra)
            db.commit()

        print("Department, Land Acquisition & Utility Intelligence seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding Department & Land Utility data: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_department_land_utility_data()
