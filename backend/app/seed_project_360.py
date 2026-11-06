import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal, Base
from app.models import (
    Project, WorkPackage, Contract, Contractor, Road, Zone, Circle, Division,
    ProjectMilestone, ProjectRisk, ProjectProgressRecord, ProjectStakeholder,
    StakeholderResponsibility, DepartmentDependency, Approval, Issue, Document,
    EvidenceRecord, Official, Department, Organisation
)

def seed_project_360(db_session: Session = None):
    if db_session is None:
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False

    Base.metadata.create_all(bind=db.get_bind())

    # 1. SQLite schema migration for projects table
    new_columns = [
        ("planned_start_date", "DATETIME"),
        ("planned_completion_date", "DATETIME"),
        ("revised_cost_cr", "FLOAT"),
        ("sanction_as_number", "VARCHAR(100)"),
        ("sanction_as_date", "DATETIME"),
        ("sanction_as_amount_cr", "FLOAT"),
        ("sanction_ts_number", "VARCHAR(100)"),
        ("sanction_ts_date", "DATETIME"),
        ("sanction_ts_amount_cr", "FLOAT"),
        ("carriageway_width_m", "FLOAT"),
        ("lane_configuration", "VARCHAR(50)"),
        ("pavement_type", "VARCHAR(50)"),
        ("total_length_km", "FLOAT"),
        ("start_chainage_km", "FLOAT"),
        ("end_chainage_km", "FLOAT"),
        ("funding_source", "VARCHAR(100)"),
        ("project_director_name", "VARCHAR(150)"),
        ("responsible_ee_name", "VARCHAR(150)"),
        ("source_url", "VARCHAR(300)"),
        ("verification_status", "VARCHAR(50)")
    ]

    with db.get_bind().connect() as conn:
        for col_name, col_type in new_columns:
            try:
                conn.execute(text(f"ALTER TABLE projects ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

    print("Updating Projects with Rich 360° Technical Specifications, Sanctions & Milestones...")

    # 2. Update existing projects with technical specs & sanctions
    projects_specs = {
        "PRJ-TN-2026-001": {
            "planned_start": datetime.datetime(2024, 1, 15),
            "planned_comp": datetime.datetime(2025, 12, 31),
            "revised_cost": 158.40,
            "as_number": "G.O. (Ms) No. 114, Highways & Minor Ports (HN2)",
            "as_date": datetime.datetime(2023, 6, 15),
            "as_amount": 142.20,
            "ts_number": "CE(H) C&M TS No. 42/2023-24",
            "ts_date": datetime.datetime(2023, 8, 20),
            "ts_amount": 139.80,
            "width": 14.0,
            "lane_config": "4-Lane Divided with Paved Shoulders",
            "pavement": "Flexible (Bituminous Concrete / Stone Mastic Asphalt)",
            "length": 33.4,
            "start_ch": 22.4,
            "end_ch": 55.8,
            "funding": "State Government of Tamil Nadu (CRIDP)",
            "pd_name": "Er. S. Palanivel (Chief Engineer C&M Chennai)",
            "ee_name": "Er. P. Anandhan (Divisional Engineer Chengalpattu)",
            "source_url": "https://www.tnhighways.tn.gov.in/go/go114_2023.pdf",
            "verification_status": "Verified"
        },
        "PRJ-TN-2026-002": {
            "planned_start": datetime.datetime(2024, 6, 1),
            "planned_comp": datetime.datetime(2026, 3, 31),
            "revised_cost": 89.20,
            "as_number": "G.O. (Ms) No. 89, Highways & Minor Ports (HN1)",
            "as_date": datetime.datetime(2024, 3, 12),
            "as_amount": 86.50,
            "ts_number": "SE(H) Chengalpattu TS No. 18/2024-25",
            "ts_date": datetime.datetime(2024, 5, 18),
            "ts_amount": 85.10,
            "width": 10.0,
            "lane_config": "2-Lane with Paved Shoulder",
            "pavement": "Flexible (Dense Bituminous Macadam + BC)",
            "length": 18.6,
            "start_ch": 0.0,
            "end_ch": 18.6,
            "funding": "State Government of Tamil Nadu (CRIDP-MDR)",
            "pd_name": "Er. M. Rajendran (Superintending Engineer Chengalpattu)",
            "ee_name": "Er. P. Anandhan (Divisional Engineer Tambaram)",
            "source_url": "https://www.tnhighways.tn.gov.in/go/go89_2024.pdf",
            "verification_status": "Verified"
        },
        "PRJ-TN-2026-003": {
            "planned_start": datetime.datetime(2024, 9, 1),
            "planned_comp": datetime.datetime(2026, 8, 31),
            "revised_cost": 98.50,
            "as_number": "G.O. (Ms) No. 142, Highways & Minor Ports",
            "as_date": datetime.datetime(2024, 7, 25),
            "as_amount": 95.00,
            "ts_number": "CE(H) C&M TS No. 67/2024-25",
            "ts_date": datetime.datetime(2024, 8, 15),
            "ts_amount": 94.20,
            "width": 17.5,
            "lane_config": "4-Lane Elevated Viaduct with RE Approaches",
            "pavement": "Composite (Steel-Concrete Composite Box Girder)",
            "length": 2.4,
            "start_ch": 48.2,
            "end_ch": 50.6,
            "funding": "State Infrastructure Development Fund (SIDF)",
            "pd_name": "Er. S. Palanivel (Chief Engineer C&M Chennai)",
            "ee_name": "Er. P. Anandhan (Divisional Engineer Chengalpattu)",
            "source_url": "https://www.tnhighways.tn.gov.in/go/go142_2024.pdf",
            "verification_status": "Verified"
        },
        "PRJ-CKICP-001": {
            "planned_start": datetime.datetime(2023, 1, 15),
            "planned_comp": datetime.datetime(2026, 12, 31),
            "revised_cost": 260.70,
            "as_number": "G.O. (Ms) No. 205, Highways (CKICP-ADB)",
            "as_date": datetime.datetime(2022, 11, 18),
            "as_amount": 260.70,
            "ts_number": "CE(H) CKICP TS No. 04/2022-23",
            "ts_date": datetime.datetime(2023, 1, 5),
            "ts_amount": 258.40,
            "width": 14.0,
            "lane_config": "4-Lane Divided Arterial Corridor",
            "pavement": "Flexible with Modified Bitumen (PMB-40)",
            "length": 22.5,
            "start_ch": 12.0,
            "end_ch": 34.5,
            "funding": "Asian Development Bank (ADB Loan 3816-IND)",
            "pd_name": "Thiru D. Baskara Pandian, IAS (Project Director FAC CKICP)",
            "ee_name": "Divisional Engineer (H), CKICP Division, Kancheepuram",
            "source_url": "https://www.ckicp.tn.gov.in/projects/pkg01_as.pdf",
            "verification_status": "Verified"
        },
        "PRJ-TNRSP-001": {
            "planned_start": datetime.datetime(2016, 4, 1),
            "planned_comp": datetime.datetime(2019, 3, 31),
            "revised_cost": 184.98,
            "as_number": "G.O. (Ms) No. 165, Highways (TNRSP-II)",
            "as_date": datetime.datetime(2015, 8, 24),
            "as_amount": 184.98,
            "ts_number": "CE(H) TNRSP TS No. 01/2015-16",
            "ts_date": datetime.datetime(2015, 11, 10),
            "ts_amount": 182.50,
            "width": 10.0,
            "lane_config": "2-Lane with Paved Shoulder (EPC Contract)",
            "pavement": "Flexible with Crushed Rock Base",
            "length": 48.48,
            "start_ch": 12.0,
            "end_ch": 60.48,
            "funding": "World Bank (IBRD Loan 8499-IN)",
            "pd_name": "Thiru D. Baskara Pandian, IAS (Project Director A/C TNRSP)",
            "ee_name": "Divisional Engineer (H), TNRSP Division, Kancheepuram",
            "source_url": "https://www.tnrsp.tn.gov.in/epc01_contract.pdf",
            "verification_status": "Verified"
        }
    }

    for p_code, spec in projects_specs.items():
        proj = db.query(Project).filter(Project.project_code == p_code).first()
        if proj:
            proj.planned_start_date = spec["planned_start"]
            proj.planned_completion_date = spec["planned_comp"]
            proj.revised_cost_cr = spec["revised_cost"]
            proj.sanction_as_number = spec["as_number"]
            proj.sanction_as_date = spec["as_date"]
            proj.sanction_as_amount_cr = spec["as_amount"]
            proj.sanction_ts_number = spec["ts_number"]
            proj.sanction_ts_date = spec["ts_date"]
            proj.sanction_ts_amount_cr = spec["ts_amount"]
            proj.carriageway_width_m = spec["width"]
            proj.lane_configuration = spec["lane_config"]
            proj.pavement_type = spec["pavement"]
            proj.total_length_km = spec["length"]
            proj.start_chainage_km = spec["start_ch"]
            proj.end_chainage_km = spec["end_ch"]
            proj.funding_source = spec["funding"]
            proj.project_director_name = spec["pd_name"]
            proj.responsible_ee_name = spec["ee_name"]
            proj.source_url = spec["source_url"]
            proj.verification_status = spec["verification_status"]

            # Add AS Approval record
            existing_as = db.query(Approval).filter(
                Approval.project_id == proj.id,
                Approval.reference_number == spec["as_number"]
            ).first()
            if not existing_as:
                db.add(Approval(
                    project_id=proj.id,
                    approval_type="Administrative Sanction (AS)",
                    reference_number=spec["as_number"],
                    sanction_amount_cr=spec["as_amount"],
                    approved_by_role="Government Secretariat (Highways)",
                    status="APPROVED",
                    approval_date=spec["as_date"]
                ))

            # Add TS Approval record
            existing_ts = db.query(Approval).filter(
                Approval.project_id == proj.id,
                Approval.reference_number == spec["ts_number"]
            ).first()
            if not existing_ts:
                db.add(Approval(
                    project_id=proj.id,
                    approval_type="Technical Sanction (TS)",
                    reference_number=spec["ts_number"],
                    sanction_amount_cr=spec["ts_amount"],
                    approved_by_role="Chief Engineer (H) / Superintending Engineer",
                    status="APPROVED",
                    approval_date=spec["ts_date"]
                ))

            # Add Work Packages if none exist
            existing_wp = db.query(WorkPackage).filter(WorkPackage.project_id == proj.id).first()
            if not existing_wp:
                if p_code == "PRJ-TN-2026-001":
                    db.add(WorkPackage(
                        project_id=proj.id,
                        package_number="PKG-ECR-01",
                        title="Widening to 4 Lanes of SH-49 km 22/4 to 38/0 (Akkarai - Kovalam)",
                        scope_description="Embankment, granular sub-base, DBM, BC and 4-lane divided configuration",
                        cost_cr=74.50,
                        start_km=22.4,
                        end_km=38.0,
                        status="ACTIVE"
                    ))
                    db.add(WorkPackage(
                        project_id=proj.id,
                        package_number="PKG-ECR-02",
                        title="Widening to 4 Lanes of SH-49 km 38/0 to 55/8 (Kovalam - Mahabalipuram)",
                        scope_description="Pavement widening, drainage works, RE wall approaches and road furniture",
                        cost_cr=67.70,
                        start_km=38.0,
                        end_km=55.8,
                        status="ACTIVE"
                    ))
                elif p_code == "PRJ-TN-2026-002":
                    db.add(WorkPackage(
                        project_id=proj.id,
                        package_number="PKG-TAM-01",
                        title="Two-Lane with Paved Shoulder Upgrade of MDR-102 km 0/0 to 18/6",
                        scope_description="Strengthening and widening of Tambaram - Sriperumbudur corridor",
                        cost_cr=86.50,
                        start_km=0.0,
                        end_km=18.6,
                        status="ACTIVE"
                    ))
                elif p_code == "PRJ-TN-2026-003":
                    db.add(WorkPackage(
                        project_id=proj.id,
                        package_number="PKG-HUB-01",
                        title="Construction of 4-Lane Grade Separator at Thiruporur Hub",
                        scope_description="Composite steel-concrete box girder viaduct and grade separator",
                        cost_cr=95.00,
                        start_km=48.2,
                        end_km=50.6,
                        status="ACTIVE"
                    ))
    db.commit()

    # 3. Seed Project Milestones
    proj_1 = db.query(Project).filter(Project.project_code == "PRJ-TN-2026-001").first()
    if proj_1:
        milestones_1 = [
            {"code": "MS-01", "title": "Site Clearance, Utility Pegging & Tree Enumeration", "target": datetime.datetime(2024, 3, 31), "actual": datetime.datetime(2024, 3, 20), "target_pct": 10.0, "actual_pct": 10.0, "delay": 0, "status": "COMPLETED", "weight": 10.0},
            {"code": "MS-02", "title": "Earthwork in Embankment and Subgrade Preparation", "target": datetime.datetime(2024, 8, 31), "actual": datetime.datetime(2024, 9, 15), "target_pct": 25.0, "actual_pct": 25.0, "delay": 15, "status": "COMPLETED", "weight": 20.0},
            {"code": "MS-03", "title": "Granular Sub-Base (GSB) & Wet Mix Macadam (WMM)", "target": datetime.datetime(2024, 12, 31), "actual": datetime.datetime(2025, 2, 10), "target_pct": 50.0, "actual_pct": 50.0, "delay": 41, "status": "COMPLETED", "weight": 25.0},
            {"code": "MS-04", "title": "Dense Bituminous Macadam (DBM) Layer - 75mm", "target": datetime.datetime(2025, 6, 30), "actual": None, "target_pct": 75.0, "actual_pct": 58.0, "delay": 65, "status": "IN_PROGRESS", "weight": 25.0},
            {"code": "MS-05", "title": "Bituminous Concrete (BC) Wearing Course - 40mm", "target": datetime.datetime(2025, 10, 31), "actual": None, "target_pct": 90.0, "actual_pct": 0.0, "delay": 0, "status": "PENDING", "weight": 15.0},
            {"code": "MS-06", "title": "Road Markings, Thermoplastic Line & Crash Barriers", "target": datetime.datetime(2025, 12, 31), "actual": None, "target_pct": 100.0, "actual_pct": 0.0, "delay": 0, "status": "PENDING", "weight": 5.0}
        ]
        for m in milestones_1:
            existing_m = db.query(ProjectMilestone).filter(
                ProjectMilestone.project_id == proj_1.id,
                ProjectMilestone.milestone_code == m["code"]
            ).first()
            if not existing_m:
                db.add(ProjectMilestone(
                    project_id=proj_1.id,
                    milestone_code=m["code"],
                    title=m["title"],
                    description=f"Contractual physical milestone {m['code']} under {proj_1.project_code}",
                    target_date=m["target"],
                    actual_date=m["actual"],
                    target_physical_pct=m["target_pct"],
                    actual_physical_pct=m["actual_pct"],
                    delay_days=m["delay"],
                    status=m["status"],
                    weightage_pct=m["weight"]
                ))
        db.commit()

        # Monthly Progress History for PRJ-TN-2026-001 (EVM Tracking)
        months = [
            ("2024-03", 10.0, 10.0, 8.0, 7.5, 10.66, 10.66, 14.22, 14.22, 3.56, 0.0, "Milestone 1 completed on schedule"),
            ("2024-06", 18.0, 16.0, 15.0, 14.0, 9.24, 19.90, 22.75, 25.60, 2.85, -2.85, "Subgrade delayed due to rain in Kovalam"),
            ("2024-09", 28.0, 25.0, 25.0, 22.0, 11.37, 31.27, 35.55, 39.81, 4.28, -4.26, "Earthwork completed; GSB commenced"),
            ("2024-12", 45.0, 38.0, 40.0, 32.0, 14.22, 45.49, 54.03, 63.99, 8.54, -9.96, "TANGEDCO pole shift delay on Akkarai stretch"),
            ("2025-03", 60.0, 48.0, 55.0, 42.0, 14.22, 59.71, 68.25, 85.32, 8.54, -17.07, "Stay granted on S.No 114/2B; stretch bypassed"),
            ("2025-06", 75.0, 58.0, 70.0, 52.0, 14.22, 73.93, 82.47, 106.65, 8.54, -24.18, "DBM ongoing; critical delay > 60 days logged")
        ]
        for m_str, p_phys, a_phys, p_fin, a_fin, m_exp, cum_exp, ev, pv, cv, sv, remarks in months:
            existing_rec = db.query(ProjectProgressRecord).filter(
                ProjectProgressRecord.project_id == proj_1.id,
                ProjectProgressRecord.reporting_month == m_str
            ).first()
            if not existing_rec:
                db.add(ProjectProgressRecord(
                    project_id=proj_1.id,
                    reporting_month=m_str,
                    planned_physical_pct=p_phys,
                    actual_physical_pct=a_phys,
                    planned_financial_pct=p_fin,
                    actual_financial_pct=a_fin,
                    expenditure_in_month_cr=m_exp,
                    cumulative_expenditure_cr=cum_exp,
                    earned_value_cr=ev,
                    planned_value_cr=pv,
                    cost_variance_cr=cv,
                    schedule_variance_cr=sv,
                    remarks=remarks
                ))
        db.commit()

        # Risks for PRJ-TN-2026-001
        risks_1 = [
            {
                "code": "RSK-01",
                "category": "Land Acquisition Dispute",
                "title": "Madras HC Interim Stay on Akkarai Survey No. 114/2B",
                "desc": "High Court writ petition filed by landowners challenging valuation rate, halting 1.4 km corridor widening.",
                "prob": "HIGH", "impact": "CRITICAL", "score": 9.2,
                "mitigation": "Special DRO (LA) filed vacation petition with comparative market valuation; moving urgency memo.",
                "status": "OPEN"
            },
            {
                "code": "RSK-02",
                "category": "Utility Shifting",
                "title": "TANGEDCO 33kV Underground Cable Relocation Delay",
                "desc": "Power shutdown pending from SE/EDC Chengalpattu for transferring load from 14 roadside transformers.",
                "prob": "HIGH", "impact": "HIGH", "score": 7.8,
                "mitigation": "Deposit amount ₹1.85 Cr cleared; weekly review chaired by District Collector, Chengalpattu.",
                "status": "OPEN"
            },
            {
                "code": "RSK-03",
                "category": "Environmental & Monsoon",
                "title": "Coastal Tidal Backwater Inundation near Kovalam",
                "desc": "High tide backwater surges threaten embankment stability during Northeast monsoon season.",
                "prob": "MEDIUM", "impact": "HIGH", "score": 6.5,
                "mitigation": "Re-engineered cross-drainage with geotextile mattress reinforcement and linear box culverts.",
                "status": "MITIGATING"
            }
        ]
        for r in risks_1:
            existing_r = db.query(ProjectRisk).filter(
                ProjectRisk.project_id == proj_1.id,
                ProjectRisk.risk_code == r["code"]
            ).first()
            if not existing_r:
                db.add(ProjectRisk(
                    project_id=proj_1.id,
                    risk_code=r["code"],
                    category=r["category"],
                    title=r["title"],
                    description=r["desc"],
                    probability=r["prob"],
                    impact=r["impact"],
                    severity_score=r["score"],
                    mitigation_strategy=r["mitigation"],
                    status=r["status"]
                ))
        db.commit()

    # 4. Seed Milestones and EVM for PRJ-CKICP-001
    proj_ckicp = db.query(Project).filter(Project.project_code == "PRJ-CKICP-001").first()
    if proj_ckicp:
        milestones_ck = [
            {"code": "CK-MS-01", "title": "Contractor Mobilisation & Base Camp Establishment", "target": datetime.datetime(2023, 4, 30), "actual": datetime.datetime(2023, 4, 15), "target_pct": 5.0, "actual_pct": 5.0, "delay": 0, "status": "COMPLETED", "weight": 5.0},
            {"code": "CK-MS-02", "title": "DGPS Cadastral Survey & Tree Felling Clearances", "target": datetime.datetime(2023, 10, 31), "actual": datetime.datetime(2023, 11, 20), "target_pct": 15.0, "actual_pct": 15.0, "delay": 20, "status": "COMPLETED", "weight": 10.0},
            {"code": "CK-MS-03", "title": "Pavement Widening & Granular Base km 12/0 - 20/0", "target": datetime.datetime(2024, 8, 31), "actual": datetime.datetime(2024, 10, 15), "target_pct": 30.0, "actual_pct": 28.5, "delay": 45, "status": "IN_PROGRESS", "weight": 25.0},
            {"code": "CK-MS-04", "title": "Walajabad ROB Superstructure & Grade Separator", "target": datetime.datetime(2025, 6, 30), "actual": None, "target_pct": 60.0, "actual_pct": 10.0, "delay": 90, "status": "DELAYED", "weight": 35.0},
            {"code": "CK-MS-05", "title": "Final Wearing Course & Toll Plaza Infrastructure", "target": datetime.datetime(2026, 12, 31), "actual": None, "target_pct": 100.0, "actual_pct": 0.0, "delay": 0, "status": "PENDING", "weight": 25.0}
        ]
        for m in milestones_ck:
            existing_m = db.query(ProjectMilestone).filter(
                ProjectMilestone.project_id == proj_ckicp.id,
                ProjectMilestone.milestone_code == m["code"]
            ).first()
            if not existing_m:
                db.add(ProjectMilestone(
                    project_id=proj_ckicp.id,
                    milestone_code=m["code"],
                    title=m["title"],
                    description=f"CKICP ADB Multilateral Milestone {m['code']}",
                    target_date=m["target"],
                    actual_date=m["actual"],
                    target_physical_pct=m["target_pct"],
                    actual_physical_pct=m["actual_pct"],
                    delay_days=m["delay"],
                    status=m["status"],
                    weightage_pct=m["weight"]
                ))
        db.commit()

        # Monthly progress for PRJ-CKICP-001
        ck_months = [
            ("2023-06", 5.0, 5.0, 4.0, 4.0, 10.42, 10.42, 13.03, 13.03, 2.61, 0.0, "Mobilisation complete"),
            ("2023-12", 15.0, 12.0, 12.0, 10.0, 15.64, 26.07, 31.28, 39.10, 5.21, -7.82, "DGPS survey done; LA hurdles in Walajabad"),
            ("2024-06", 25.0, 20.0, 20.0, 16.0, 15.64, 41.71, 52.14, 65.17, 10.43, -13.03, "Southern Railway GAD clearance pending"),
            ("2024-12", 35.0, 28.5, 30.0, 24.2, 21.38, 63.09, 74.30, 91.24, 11.21, -16.94, "WP 11420 stay in force; variance elevated")
        ]
        for m_str, p_phys, a_phys, p_fin, a_fin, m_exp, cum_exp, ev, pv, cv, sv, remarks in ck_months:
            existing_rec = db.query(ProjectProgressRecord).filter(
                ProjectProgressRecord.project_id == proj_ckicp.id,
                ProjectProgressRecord.reporting_month == m_str
            ).first()
            if not existing_rec:
                db.add(ProjectProgressRecord(
                    project_id=proj_ckicp.id,
                    reporting_month=m_str,
                    planned_physical_pct=p_phys,
                    actual_physical_pct=a_phys,
                    planned_financial_pct=p_fin,
                    actual_financial_pct=a_fin,
                    expenditure_in_month_cr=m_exp,
                    cumulative_expenditure_cr=cum_exp,
                    earned_value_cr=ev,
                    planned_value_cr=pv,
                    cost_variance_cr=cv,
                    schedule_variance_cr=sv,
                    remarks=remarks
                ))
        db.commit()

        # Risks for CKICP
        ck_risks = [
            {
                "code": "CK-RSK-01",
                "category": "Statutory Court Stay",
                "title": "Madras HC Writ Petition 11420/2024 (Walajabad)",
                "desc": "Stay order on Survey No. 114/2B halts bridge abutment construction.",
                "prob": "HIGH", "impact": "CRITICAL", "score": 9.5,
                "mitigation": "Advocate General instructed for early listing; compensation deposit ready.",
                "status": "OPEN"
            },
            {
                "code": "CK-RSK-02",
                "category": "Railway Coordination",
                "title": "Southern Railway General Arrangement Drawing (GAD) Concurrence",
                "desc": "ROB span design over Chengalpattu-Arakkonam rail line awaiting Chief Bridge Engineer sign-off.",
                "prob": "MEDIUM", "impact": "HIGH", "score": 7.2,
                "mitigation": "Joint inspection completed on 18.01.2025; Revised GAD submitted with 2x60m bowstring girders.",
                "status": "MITIGATING"
            }
        ]
        for r in ck_risks:
            existing_r = db.query(ProjectRisk).filter(
                ProjectRisk.project_id == proj_ckicp.id,
                ProjectRisk.risk_code == r["code"]
            ).first()
            if not existing_r:
                db.add(ProjectRisk(
                    project_id=proj_ckicp.id,
                    risk_code=r["code"],
                    category=r["category"],
                    title=r["title"],
                    description=r["desc"],
                    probability=r["prob"],
                    impact=r["impact"],
                    severity_score=r["score"],
                    mitigation_strategy=r["mitigation"],
                    status=r["status"]
                ))
        db.commit()

    print("Project 360° Technical Specifications, EVM Milestones and Risk Registers Seeded Successfully.")
    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_project_360()
