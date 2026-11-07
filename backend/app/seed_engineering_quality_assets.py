"""
TN-HDOS Prompt 04 Seeder:
Engineering Quality, Field Operations and Asset Intelligence.
Seeds:
- 40 Infrastructure Assets
- 50 Field Inspection Records
- 25 Field Issues
- 30 Quality Inspection Records
- 40 Quality Findings / Observations (including 25 NCRs, 30 with corrective actions, 20 with reinspection data)
- 20 Material Test Records (Concrete, Bitumen, Aggregate, Soil, Steel)
- 25 Maintenance Work Orders
- 15 Engineering AI Findings
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models import (
    Project, WorkPackage, Contractor, Official,
    FieldInspectionRecord, FieldIssueRecord, QualityInspectionRecord,
    QualityFindingRecord, MaterialTestRecord, InfrastructureAssetRecord,
    MaintenanceWorkOrderRecord, EngineeringAIFinding
)
import datetime

def seed_engineering_quality_assets_data(db_session: Session = None):
    Base.metadata.create_all(bind=engine)
    if db_session is None:
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False

    # Check if all tables seeded
    if (
        db.query(InfrastructureAssetRecord).count() >= 40 and
        db.query(QualityInspectionRecord).count() >= 30 and
        db.query(QualityFindingRecord).count() >= 40 and
        db.query(MaterialTestRecord).count() >= 20 and
        db.query(MaintenanceWorkOrderRecord).count() >= 25 and
        db.query(EngineeringAIFinding).count() >= 15
    ):
        if close_on_exit:
            db.close()
        return

    print("Seeding Prompt 04: Engineering Quality, Field Operations & Asset Intelligence records...")

    # Clear partially seeded tables if any
    db.query(EngineeringAIFinding).delete()
    db.query(MaintenanceWorkOrderRecord).delete()
    db.query(MaterialTestRecord).delete()
    db.query(QualityFindingRecord).delete()
    db.query(QualityInspectionRecord).delete()
    db.query(FieldIssueRecord).delete()
    db.query(FieldInspectionRecord).delete()
    db.query(InfrastructureAssetRecord).delete()
    db.commit()

    # Ensure projects exist (1..12)
    projects = db.query(Project).all()
    project_ids = [p.id for p in projects] if projects else list(range(1, 13))

    # -------------------------------------------------------------
    # 1. 40 Infrastructure Assets
    # -------------------------------------------------------------
    asset_types = [
        ("Roads", "Flexible Pavement Section", "Operational", 82.0),
        ("Bridges", "Major High-Level Bridge", "Under Construction", 88.0),
        ("Bridges", "River Submersible Bridge", "Inspection Due", 68.0),
        ("Culverts", "RCC Box Culvert (2x2m)", "Operational", 94.0),
        ("Culverts", "Pipe Culvert (900mm dia)", "Operational", 90.0),
        ("Flyovers", "Urban Grade Separator", "Under Construction", 84.0),
        ("Retaining Walls", "Reinforced Earth (RE) Wall", "Operational", 76.0),
        ("Drainage Systems", "Lined Longitudinal Storm Drain", "Operational", 78.0),
        ("Traffic Infrastructure", "Solar Blinker & Signage Gantry", "Operational", 92.0),
        ("Road Safety", "Crash Barrier W-Beam Stretches", "Operational", 86.0)
    ]

    districts = ["Nilgiris", "Coimbatore", "Chennai", "Chengalpattu", "Tiruppur", "Madurai", "Salem", "Tiruchirappalli"]

    assets_to_create = []
    # Asset 1: Focus corridor pavement
    assets_to_create.append(
        InfrastructureAssetRecord(
            asset_code="AST-PVM-01",
            asset_name="SH-15 Flexible Pavement Stretch Km 0/0 to 14/0",
            asset_type="Roads",
            project_id=4,
            district="Nilgiris",
            location_chainage="Km 0/0 to 14/0",
            completion_date="2024-11-20",
            condition="Fair",
            pci_score=71.5,
            last_inspection_date="2026-02-04",
            next_inspection_date="2026-03-15",
            maintenance_status="Inspection Due",
            responsible_authority="Highways C&M Ooty Division",
            replacement_value_cr=28.50,
            scenario_id="SCN-PRJ4-DEMO"
        )
    )
    # Asset 2: Focus corridor bridge
    assets_to_create.append(
        InfrastructureAssetRecord(
            asset_code="AST-BR-01",
            asset_name="Pykara Tributary High-Level Bridge (2x24m Spans)",
            asset_type="Bridges",
            project_id=4,
            district="Nilgiris",
            location_chainage="Km 14+800",
            completion_date=None,
            condition="Good",
            pci_score=88.0,
            last_inspection_date="2026-01-22",
            next_inspection_date="2026-04-15",
            maintenance_status="Under Construction",
            responsible_authority="CKICP PIU Coimbatore",
            replacement_value_cr=14.20,
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(3, 41):
        atype, aname, mstatus, pci = asset_types[(i - 1) % len(asset_types)]
        cond = "Good" if pci >= 80 else "Fair" if pci >= 70 else "Poor" if pci >= 50 else "Critical"
        pid = project_ids[(i - 1) % len(project_ids)]
        dist = districts[(i - 1) % len(districts)]
        assets_to_create.append(
            InfrastructureAssetRecord(
                asset_code=f"AST-TN-{i:03d}",
                asset_name=f"{aname} #{i}",
                asset_type=atype,
                project_id=pid,
                district=dist,
                location_chainage=f"Km {(i * 3) % 45}+{(i * 120) % 900}",
                completion_date="2024-06-15" if i % 2 == 0 else None,
                condition=cond,
                pci_score=pci - ((i % 5) * 2.5),
                last_inspection_date=f"2026-01-{(i % 25) + 1:02d}",
                next_inspection_date=f"2026-04-{(i % 25) + 1:02d}",
                maintenance_status=mstatus,
                responsible_authority=f"Highways Division {dist}",
                replacement_value_cr=round(2.5 + (i * 0.8), 2),
                scenario_id="SCN-PORTFOLIO"
            )
        )

    db.add_all(assets_to_create)
    db.commit()

    # -------------------------------------------------------------
    # 2. 50 Field Inspection Records
    # -------------------------------------------------------------
    field_activities = [
        "Subgrade & Embankment Compaction Verification",
        "Granular Sub-Base (GSB) Layer Laying & Rolling",
        "Wet Mix Macadam (WMM) Base Course Laying",
        "Prime Coat & Tack Coat Bituminous Application",
        "Dense Bituminous Macadam (DBM) Paving & Compaction",
        "RCC Box Culvert Raft & Wall Concreting",
        "Bridge Pier & Pier Cap Reinforcement Check",
        "Pre-stressed Concrete Girder Launching Oversight",
        "Lined Roadside Drain Excavation & Masonry",
        "Traffic Signage & Crash Barrier Alignment Audit"
    ]
    inspectors = [
        ("Er. R. Venkatesh", "Assistant Executive Engineer", "Highways Gudalur"),
        ("Tmt. M. Kalaiselvi", "Divisional Engineer", "Highways Ooty"),
        ("Er. S. Murugan", "Assistant Engineer", "Highways Chengalpattu"),
        ("Er. P. Anandhan", "Divisional Engineer", "Highways Chengalpattu"),
        ("Er. K. Balaji", "Quality Lead Engineer", "Independent Consultant"),
        ("Dr. P. Ramanathan", "Team Leader", "STUP Authority's Engineer")
    ]
    contractors = [
        "KCP Infra Fictional Ltd",
        "Southern Highway Builders Ltd",
        "PST Engineering Fictional Ltd",
        "URC Construction Fictional Pvt Ltd",
        "L&T Infrastructure Fictional Ltd"
    ]

    field_inspections = []
    # Demonstration Focus Inspection 1
    field_inspections.append(
        FieldInspectionRecord(
            inspection_code="INSP-2026-001",
            project_id=4,
            package_id=1,
            officer_name="Er. R. Venkatesh",
            officer_designation="Assistant Executive Engineer",
            contractor_name="KCP Infra Fictional Ltd",
            inspection_date="2026-02-04",
            site_location="SH-15 Km 14+200 to 18+000 (Pykara stretch)",
            work_activity="Dense Bituminous Macadam (DBM) Surface Course Compaction",
            progress_reported_pct=68.0,
            progress_verified_pct=54.0,
            findings_summary="Observed binder segregation and temperature drop at paver screed. Core samples extracted at Km 14+600 and 15+200 for laboratory bitumen content test.",
            severity="CRITICAL",
            status="FOLLOWUP_REQUIRED",
            geo_lat=11.4124,
            geo_lng=76.6958,
            photos_count=4,
            follow_up_action="Await HRS Coimbatore lab report; withhold certification of RA Bill #14 item 4.2 pending binder quality clearance.",
            follow_up_date="2026-02-15",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )
    # Demonstration Focus Inspection 2
    field_inspections.append(
        FieldInspectionRecord(
            inspection_code="INSP-2026-002",
            project_id=4,
            package_id=1,
            officer_name="Tmt. M. Kalaiselvi",
            officer_designation="Divisional Engineer (Highways)",
            contractor_name="KCP Infra Fictional Ltd",
            inspection_date="2026-01-22",
            site_location="SH-15 Km 4+800 Minor Bridge Abutment #1",
            work_activity="RCC Pier Cap Reinforcement & Concrete Pouring",
            progress_reported_pct=75.0,
            progress_verified_pct=75.0,
            findings_summary="Rebar placement and cover blocks verified as per drawing #CKICP/BR/44. Concrete 7-day cube strength satisfied 28 N/mm².",
            severity="LOW",
            status="COMPLETED",
            geo_lat=11.4310,
            geo_lng=76.7120,
            photos_count=3,
            follow_up_action="Authorise staging removal and proceed with girder pre-stressing preparation.",
            follow_up_date="2026-02-10",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(3, 51):
        pid = project_ids[(i - 1) % len(project_ids)]
        act = field_activities[(i - 1) % len(field_activities)]
        oname, odesig, _ = inspectors[(i - 1) % len(inspectors)]
        cname = contractors[(i - 1) % len(contractors)]
        rep_prog = round(20.0 + ((i * 1.5) % 75.0), 1)
        ver_prog = rep_prog if i % 3 != 0 else round(rep_prog - 8.5, 1)
        sev = "CRITICAL" if i % 10 == 0 else "HIGH" if i % 5 == 0 else "MEDIUM" if i % 2 == 0 else "LOW"
        stat = "OVERDUE" if i % 12 == 0 else "FOLLOWUP_REQUIRED" if i % 6 == 0 else "SCHEDULED" if i % 7 == 0 else "COMPLETED"

        field_inspections.append(
            FieldInspectionRecord(
                inspection_code=f"INSP-2026-{i:03d}",
                project_id=pid,
                package_id=((i % 2) + 1),
                officer_name=oname,
                officer_designation=odesig,
                contractor_name=cname,
                inspection_date=f"2026-01-{(i % 28) + 1:02d}" if i <= 30 else f"2026-02-{(i % 15) + 1:02d}",
                site_location=f"Corridor Chainage Km {(i * 2) % 40}+{(i * 150) % 900}",
                work_activity=act,
                progress_reported_pct=rep_prog,
                progress_verified_pct=ver_prog,
                findings_summary=f"Routine engineering inspection of {act.lower()}. Quality parameters verified against MoRTH Section {(i % 8) + 100}.",
                severity=sev,
                status=stat,
                geo_lat=round(11.0 + (i * 0.04), 4),
                geo_lng=round(76.5 + (i * 0.05), 4),
                photos_count=(i % 5) + 1,
                follow_up_action=f"Ensure daily field test registers maintained by contractor QA engineer." if stat == "COMPLETED" else "Schedule mandatory compliance reinspection.",
                follow_up_date=f"2026-03-{(i % 20) + 1:02d}",
                scenario_id="SCN-FIELD-PORTFOLIO"
            )
        )

    db.add_all(field_inspections)
    db.commit()

    # -------------------------------------------------------------
    # 3. 25 Field Issues
    # -------------------------------------------------------------
    issue_categories = [
        "Workmanship", "Road Damage", "Drainage", "Material",
        "Construction Delay", "Safety Observation", "Utility Obstruction",
        "Land Access", "Environmental Concern"
    ]
    field_issues = []
    # Demonstration Focus Field Issue
    field_issues.append(
        FieldIssueRecord(
            issue_code="FISS-2026-001",
            project_id=4,
            package_id=1,
            category="Road Damage",
            description="Surface cracking and aggregate ravelling observed on freshly laid DBM between Km 14+200 and 15+500 following light rain.",
            location="SH-15 Km 14+400",
            reported_date="2026-02-04",
            assigned_officer="Er. R. Venkatesh (AEE)",
            assigned_department="Highways Department",
            status="UNDER_INVESTIGATION",
            priority="CRITICAL",
            resolution_target="2026-02-28",
            resolution_notes="Contractor served notice to submit core test analysis and joint rectification methodology.",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )
    field_issues.append(
        FieldIssueRecord(
            issue_code="FISS-2026-002",
            project_id=4,
            package_id=1,
            category="Utility Obstruction",
            description="48 TANGEDCO 11kV electrical poles remaining unshifted along ghat carriage edge between Km 4+200 and 12+800.",
            location="SH-15 Km 4/0 to 12/0",
            reported_date="2026-01-15",
            assigned_officer="Superintending Engineer, TANGEDCO Nilgiris EDC",
            assigned_department="TANGEDCO",
            status="DEPARTMENT_ACTION_REQUIRED",
            priority="CRITICAL",
            resolution_target="2026-03-10",
            resolution_notes="Power shutdown schedule awaited from Gudalur 66kV substation.",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(3, 26):
        cat = issue_categories[(i - 1) % len(issue_categories)]
        pid = project_ids[(i - 1) % len(project_ids)]
        pri = "CRITICAL" if i % 5 == 0 else "HIGH" if i % 2 == 0 else "MEDIUM"
        stat = "CLOSED" if i % 4 == 0 else "RESOLVED" if i % 5 == 0 else "UNDER_INVESTIGATION" if i % 3 == 0 else "ASSIGNED"

        field_issues.append(
            FieldIssueRecord(
                issue_code=f"FISS-2026-{i:03d}",
                project_id=pid,
                package_id=((i % 2) + 1),
                category=cat,
                description=f"Field {cat.lower()} issue logged at chainage Km {(i * 3) % 45}. Requires contractor field crew intervention.",
                location=f"Corridor Chainage Km {(i * 3) % 45}",
                reported_date=f"2026-01-{(i % 25) + 1:02d}",
                assigned_officer="Assistant Executive Engineer (Highways)",
                assigned_department="Highways Department" if i % 2 == 0 else "TANGEDCO",
                status=stat,
                priority=pri,
                resolution_target=f"2026-03-{(i % 25) + 1:02d}",
                resolution_notes="Action plan agreed during joint sub-divisional progress meeting.",
                scenario_id="SCN-ISSUE-PORTFOLIO"
            )
        )

    db.add_all(field_issues)
    db.commit()

    # -------------------------------------------------------------
    # 4. 30 Quality Inspection Records
    # -------------------------------------------------------------
    q_types = [
        "Road Surface Inspection", "Pavement Quality", "Bridge Inspection",
        "Structural Inspection", "Drainage Inspection", "Culvert Inspection",
        "Material Testing", "Concrete Testing", "Bitumen Testing",
        "Road Safety Inspection", "Workmanship Inspection", "General Engineering"
    ]
    quality_inspections = []
    # Focus Quality Inspection 1
    quality_inspections.append(
        QualityInspectionRecord(
            inspection_code="QINSP-2026-001",
            project_id=4,
            package_id=1,
            inspection_date="2026-02-04",
            inspection_type="Bitumen Testing",
            site_location="SH-15 Km 14+200 to 15+500",
            inspecting_officer="Dr. P. Ramanathan (Authority QA Team Leader)",
            contractor_name="KCP Infra Fictional Ltd",
            findings_count=2,
            severity="CRITICAL",
            status="REINSPECTION_PENDING",
            findings_summary="Bituminous Concrete surface course test failed binder percentage requirement. NCR-2025-041 issued.",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )
    # Focus Quality Inspection 2
    quality_inspections.append(
        QualityInspectionRecord(
            inspection_code="QINSP-2026-002",
            project_id=4,
            package_id=1,
            inspection_date="2026-01-20",
            inspection_type="Pavement Quality",
            site_location="SH-15 Km 21+200 to 22+000",
            inspecting_officer="Er. K. Balaji (HRS Field Specialist)",
            contractor_name="KCP Infra Fictional Ltd",
            findings_count=1,
            severity="CRITICAL",
            status="COMPLETED",
            findings_summary="Subgrade dry density compaction observed at 93.8% MDD vs specification >=97%. NCR-2025-042 issued.",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(3, 31):
        qtype = q_types[(i - 1) % len(q_types)]
        pid = project_ids[(i - 1) % len(project_ids)]
        cname = contractors[(i - 1) % len(contractors)]
        oname, _, _ = inspectors[(i - 1) % len(inspectors)]
        findings = 2 if i % 4 == 0 else 1 if i % 2 == 0 else 0
        sev = "CRITICAL" if findings > 1 else "HIGH" if findings == 1 else "LOW"
        stat = "REINSPECTION_PENDING" if sev == "CRITICAL" else "COMPLETED"

        quality_inspections.append(
            QualityInspectionRecord(
                inspection_code=f"QINSP-2026-{i:03d}",
                project_id=pid,
                package_id=((i % 2) + 1),
                inspection_date=f"2026-01-{(i % 28) + 1:02d}",
                inspection_type=qtype,
                site_location=f"Corridor Package Km {(i * 4) % 42}+000",
                inspecting_officer=oname,
                contractor_name=cname,
                findings_count=findings,
                severity=sev,
                status=stat,
                findings_summary=f"Quality audit of {qtype.lower()} conducted as per Indian Roads Congress (IRC) standard specifications.",
                scenario_id="SCN-QLT-PORTFOLIO"
            )
        )

    db.add_all(quality_inspections)
    db.commit()

    # -------------------------------------------------------------
    # 5. 40 Quality Findings / Observations (25 NCRs, 30 Corrective, 20 Reinspection)
    # -------------------------------------------------------------
    quality_findings = []
    # Demonstration Focus Finding 1 (NCR-2025-041)
    quality_findings.append(
        QualityFindingRecord(
            finding_code="NCR-2025-041",
            project_id=4,
            package_id=1,
            asset_id=1,
            inspection_id=1,
            defect_category="Bituminous Concrete (BC)",
            description="Binder content in surface course between Km 14+000 and 15+500 sampled at 4.6% vs specification of 5.2%. Core samples failed Marshall stability criteria.",
            severity="CRITICAL",
            status="CORRECTIVE_ACTION_PENDING",
            identified_date="2026-02-04",
            contractor_name="KCP Infra Fictional Ltd",
            contractor_response="Contractor attributes binder variation to automated batching plant sensor malfunction at Ooty mix unit.",
            corrective_action="Milling of affected 1.3 km layer and re-laying Dense Bituminous Macadam using calibrated batching plant under AEE supervision.",
            target_closure_date="2026-03-15",
            reinspection_date="2026-03-18",
            reinspection_officer="Dr. P. Ramanathan (Authority QA Lead)",
            reinspection_notes="Reinspection scheduled upon receipt of contractor readiness compliance certificate.",
            is_ncr=True,
            penalty_cr=0.20,
            scenario_id="SCN-PRJ4-DEMO"
        )
    )
    # Demonstration Focus Finding 2 (NCR-2025-042)
    quality_findings.append(
        QualityFindingRecord(
            finding_code="NCR-2025-042",
            project_id=4,
            package_id=1,
            asset_id=1,
            inspection_id=2,
            defect_category="Subgrade & Embankment",
            description="Dry density compaction between Km 21+200 and 22+000 tested at 93.8% MDD (standard MoRTH requirement >=97%).",
            severity="CRITICAL",
            status="RECTIFICATION_IN_PROGRESS",
            identified_date="2026-01-20",
            contractor_name="KCP Infra Fictional Ltd",
            contractor_response="Contractor deployed additional 12-ton vibratory roller with pneumatic tyred roller for re-compaction.",
            corrective_action="Moisture conditioning and re-rolling of subgrade layer in 200mm lifts until achieving 97.5% MDD field density.",
            target_closure_date="2026-03-10",
            reinspection_date="2026-03-12",
            reinspection_officer="Er. R. Venkatesh (AEE)",
            reinspection_notes="Preliminary sand cone test indicated 96.8% MDD; final core clearance pending.",
            is_ncr=True,
            penalty_cr=0.10,
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    defect_categories = [
        "Bituminous Concrete", "Subgrade & Embankment", "Bridge Structural Concrete",
        "Culvert Masonry", "Pavement Thickness Discrepancy", "Granular Sub-Base Gradation",
        "Retaining Wall Drainage Weepholes", "Tack Coat Uniformity", "Expansion Joint Gap",
        "Road Signage Reflectivity"
    ]
    statuses = [
        "NEW", "UNDER_REVIEW", "CONTRACTOR_NOTIFIED", "CORRECTIVE_ACTION_PENDING",
        "RECTIFICATION_IN_PROGRESS", "REINSPECTION_PENDING", "VERIFIED", "CLOSED"
    ]

    for i in range(3, 41):
        cat = defect_categories[(i - 1) % len(defect_categories)]
        pid = project_ids[(i - 1) % len(project_ids)]
        cname = contractors[(i - 1) % len(contractors)]
        is_ncr = (i <= 25)
        stat = statuses[(i - 1) % len(statuses)]
        sev = "CRITICAL" if is_ncr and i % 3 == 0 else "HIGH" if is_ncr else "MEDIUM"
        has_corrective = (i <= 32)
        has_reinspect = (i <= 22)

        quality_findings.append(
            QualityFindingRecord(
                finding_code=f"NCR-2026-{i:03d}" if is_ncr else f"DEF-2026-{i:03d}",
                project_id=pid,
                package_id=((i % 2) + 1),
                asset_id=((i % 38) + 1),
                inspection_id=((i % 28) + 1),
                defect_category=cat,
                description=f"Non-conformance identified during routine engineering audit of {cat.lower()} at Km {(i * 2) % 40}+{(i * 100) % 900}.",
                severity=sev,
                status=stat,
                identified_date=f"2026-01-{(i % 25) + 1:02d}",
                contractor_name=cname,
                contractor_response=f"Contractor submitted explanation and proposed rectification plan." if has_corrective else None,
                corrective_action=f"Rectification of {cat.lower()} under MoRTH Clause 500 standards." if has_corrective else None,
                target_closure_date=f"2026-03-{(i % 25) + 1:02d}" if has_corrective else None,
                reinspection_date=f"2026-03-{(i % 20) + 5:02d}" if has_reinspect else None,
                reinspection_officer="Divisional Engineer (Highways)" if has_reinspect else None,
                reinspection_notes="Reinspection verified field compliance with specifications." if stat in ["VERIFIED", "CLOSED"] else None,
                is_ncr=is_ncr,
                penalty_cr=round(0.05 * (i % 6), 2),
                scenario_id="SCN-DEFECT-PORTFOLIO"
            )
        )

    db.add_all(quality_findings)
    db.commit()

    # -------------------------------------------------------------
    # 6. 20 Material Test Records
    # -------------------------------------------------------------
    material_types = [
        ("Bitumen", "Bitumen Binder Content (VG-30)", "4.6%", "Min 5.2%", "FAILED"),
        ("Concrete", "Compressive Strength at 28 Days (M-40)", "44.2 N/mm²", "Min 40.0 N/mm²", "PASSED"),
        ("Concrete", "Compressive Strength at 28 Days (M-45)", "38.5 N/mm²", "Min 45.0 N/mm²", "FAILED"),
        ("Aggregate", "Aggregate Impact Value (AIV)", "18.4%", "Max 24.0%", "PASSED"),
        ("Aggregate", "Flakiness & Elongation Index", "22.1%", "Max 30.0%", "PASSED"),
        ("Soil", "CBR at 97% MDD (4-day soaked)", "8.2%", "Min 8.0%", "PASSED"),
        ("Steel", "Yield Stress (Fe 500D)", "525 N/mm²", "Min 500 N/mm²", "PASSED"),
        ("Cement", "7-Day Compressive Strength (OPC 53)", "41.2 N/mm²", "Min 37.0 N/mm²", "PASSED"),
        ("Bitumen", "Penetration at 25°C (100g, 5s)", "64 dmm", "60 to 70 dmm", "PASSED"),
        ("Soil", "Liquid Limit (LL) / Plasticity Index (PI)", "28% / 5.4%", "Max 35% / Max 6%", "PASSED")
    ]
    labs = [
        "Highways Research Station (HRS), Guindy",
        "HRS Regional Lab, Coimbatore",
        "National Institute of Technology (NIT) Trichy Lab",
        "IIT Madras Civil Engineering Testing Laboratory"
    ]

    material_tests = []
    # Demonstration Focus Test (HRS Guindy failed bitumen)
    material_tests.append(
        MaterialTestRecord(
            test_ref="MAT-2026-001",
            material_type="Bitumen",
            sample_date="2026-02-04",
            project_id=4,
            package_id=1,
            laboratory_name="HRS Regional Lab, Coimbatore",
            test_parameter="Bitumen Binder Extraction (ASTM D2172)",
            measured_result="4.62% by weight of mix",
            reference_limit="5.20% ± 0.3% (IRC:111-2009)",
            result_status="FAILED",
            report_file_name="HRS_CBE_Report_2026_014.pdf",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(2, 21):
        mtype, tparam, mres, reflim, resstat = material_types[(i - 1) % len(material_types)]
        pid = project_ids[(i - 1) % len(project_ids)]
        lab = labs[(i - 1) % len(labs)]
        material_tests.append(
            MaterialTestRecord(
                test_ref=f"MAT-2026-{i:03d}",
                material_type=mtype,
                sample_date=f"2026-01-{(i % 28) + 1:02d}",
                project_id=pid,
                package_id=((i % 2) + 1),
                laboratory_name=lab,
                test_parameter=tparam,
                measured_result=mres,
                reference_limit=reflim,
                result_status=resstat,
                report_file_name=f"Lab_Report_MAT_2026_{i:03d}.pdf",
                scenario_id="SCN-MAT-PORTFOLIO"
            )
        )

    db.add_all(material_tests)
    db.commit()

    # -------------------------------------------------------------
    # 7. 25 Maintenance Work Orders
    # -------------------------------------------------------------
    m_types = ["Preventive", "Corrective", "Emergency", "Periodic Rehabilitation"]
    m_statuses = [
        "MAINTENANCE_IDENTIFIED", "WORK_ORDER_CREATED", "ASSIGNED",
        "IN_PROGRESS", "INSPECTION_TRIGGERED", "VERIFIED", "CLOSED"
    ]

    maintenance_orders = []
    # Demonstration Focus Maintenance Order
    maintenance_orders.append(
        MaintenanceWorkOrderRecord(
            work_order_code="MNT-2026-001",
            asset_id=1,  # AST-PVM-01
            project_id=4,
            maintenance_type="Corrective",
            description="Milling and replacement of 1.3 km bitumen surface course (Km 14+200 to 15+500) following failed binder test MAT-2026-001.",
            priority="CRITICAL",
            estimated_cost_cr=0.45,
            assigned_contractor="KCP Infra Fictional Ltd",
            assigned_engineer="Er. R. Venkatesh (AEE)",
            scheduled_date="2026-02-15",
            completion_date=None,
            status="IN_PROGRESS",
            inspection_verified=False,
            remarks="Contractor ordered to rectify at own cost under Clause 46 Defect Rectification without billing department.",
            scenario_id="SCN-PRJ4-DEMO"
        )
    )

    for i in range(2, 26):
        mtype = m_types[(i - 1) % len(m_types)]
        stat = m_statuses[(i - 1) % len(m_statuses)]
        pid = project_ids[(i - 1) % len(project_ids)]
        pri = "CRITICAL" if i % 6 == 0 else "HIGH" if i % 3 == 0 else "MEDIUM"
        cname = contractors[(i - 1) % len(contractors)]
        oname, _, _ = inspectors[(i - 1) % len(inspectors)]

        maintenance_orders.append(
            MaintenanceWorkOrderRecord(
                work_order_code=f"MNT-2026-{i:03d}",
                asset_id=((i % 38) + 1),
                project_id=pid,
                maintenance_type=mtype,
                description=f"{mtype} maintenance work order for asset #{((i % 38) + 1)}. Includes surface sealing, expansion joint lubrication and drain clearance.",
                priority=pri,
                estimated_cost_cr=round(0.12 * ((i % 5) + 1), 2),
                assigned_contractor=cname,
                assigned_engineer=oname,
                scheduled_date=f"2026-02-{(i % 20) + 1:02d}",
                completion_date=f"2026-03-{(i % 20) + 1:02d}" if stat in ["VERIFIED", "CLOSED"] else None,
                status=stat,
                inspection_verified=(stat in ["VERIFIED", "CLOSED"]),
                remarks="Supervised as per TN Highways Maintenance Manual Volume III.",
                scenario_id="SCN-MNT-PORTFOLIO"
            )
        )

    db.add_all(maintenance_orders)
    db.commit()

    # -------------------------------------------------------------
    # 8. 15 Engineering AI Findings
    # -------------------------------------------------------------
    ai_findings_data = [
        # Quality module findings
        {
            "finding_code": "ENG-AI-Q-01",
            "module_source": "QUALITY",
            "project_id": 4,
            "title": "Recurring Bitumen Binder Deficiency on SH-15 Ooty Ghat Stretch",
            "category": "Material Quality Anomaly",
            "severity": "CRITICAL",
            "confidence_score": 0.94,
            "explanation": "Core test MAT-2026-014 confirms 4.6% bitumen vs 5.2% target between Km 14+200 and 15+500. Correlates with defect notice NCR-2025-041 and past temperature drop alerts at batching plant.",
            "recommended_action": "Withhold ₹0.20 Cr quality penalty and direct immediate milling and relaying before onset of monsoon showers.",
            "evidence_references": "Test MAT-2026-014; Inspection INSP-2026-088; NCR-2025-041",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-Q-02",
            "module_source": "QUALITY",
            "project_id": 1,
            "title": "Subgrade Compaction Inconsistency Detected across 3 Packages",
            "category": "Compaction Deficiency",
            "severity": "HIGH",
            "confidence_score": 0.88,
            "explanation": "Repeated field observations note heavy reliance on static rolling in rocky cuts without specified pneumatic tyred rolling.",
            "recommended_action": "Order random third-party core audit through HRS Guindy across chainages Km 20 to 35.",
            "evidence_references": "Field Issues FISS-2026-004, FISS-2026-008",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-Q-03",
            "module_source": "QUALITY",
            "project_id": 2,
            "title": "Overdue Corrective Action Closure on High-Level Bridge Abutment",
            "category": "Schedule Lag on Quality Fix",
            "severity": "HIGH",
            "confidence_score": 0.91,
            "explanation": "Corrective action on pier honeycombing issued 48 days ago remains unverified by Executive Engineer.",
            "recommended_action": "Issue statutory 7-day cure notice under contract clause 46.2.",
            "evidence_references": "NCR-2026-005; Work Order MNT-2026-006",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-Q-04",
            "module_source": "QUALITY",
            "project_id": 3,
            "title": "Contractor Quality Failure Rate Exceeds Benchmark Threshold (14.2% vs 5.0%)",
            "category": "Contractor Performance Alert",
            "severity": "CRITICAL",
            "confidence_score": 0.95,
            "explanation": "PST Engineering Fictional Ltd logged 6 failed material tests out of 42 batches in the last 90 days.",
            "recommended_action": "Flag contractor in Chief Engineer scrutiny list; suspend tender bidding eligibility for upcoming CRIDP packages.",
            "evidence_references": "Contractor Evaluation ID #3; Tests MAT-2026-003, MAT-2026-009",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-Q-05",
            "module_source": "QUALITY",
            "project_id": 4,
            "title": "Missing Post-Rectification Core Samples on Ooty Corridor Culverts",
            "category": "Evidence Gap",
            "severity": "MEDIUM",
            "confidence_score": 0.84,
            "explanation": "Contractor claimed completion of culvert crack grouting without submitting certified rebound hammer test sheets.",
            "recommended_action": "Direct AEE Gudalur to conduct rebound hammer inspection before bill clearance.",
            "evidence_references": "Asset AST-CLV-08; Finding DEF-2026-007",
            "status": "ACTIVE"
        },
        # Field operations findings
        {
            "finding_code": "ENG-AI-F-01",
            "module_source": "FIELD_OPS",
            "project_id": 4,
            "title": "Reported vs Verified Progress Divergence (+14.0%) on SH-15 EPC-01",
            "category": "Progress Discrepancy",
            "severity": "CRITICAL",
            "confidence_score": 0.96,
            "explanation": "Contractor claimed 68.0% physical progress on RA Bill #14, while AEE field verification INSP-2026-088 certified only 54.0%.",
            "recommended_action": "Curtail measurement book entry to 54.0% verified physical quantity.",
            "evidence_references": "Inspection INSP-2026-088; MB Book 412 Pg 62",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-F-02",
            "module_source": "FIELD_OPS",
            "project_id": 1,
            "title": "Low Site Inspection Frequency in Chengalpattu Coastal Division",
            "category": "Supervision Deficit",
            "severity": "MEDIUM",
            "confidence_score": 0.86,
            "explanation": "Only 2 site inspections recorded in the last 45 days against mandated fortnightly frequency for 4-lane widening.",
            "recommended_action": "Instruct Superintending Engineer to enforce mandatory weekly field visits.",
            "evidence_references": "Division chengalpattu inspection logs",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-F-03",
            "module_source": "FIELD_OPS",
            "project_id": 4,
            "title": "48 Unshifted TANGEDCO Poles Blocking Critical Path Earthwork",
            "category": "Inter-Agency Blocker",
            "severity": "CRITICAL",
            "confidence_score": 0.98,
            "explanation": "Poles remain in situ despite ₹1.45 Cr deposit paid 90 days ago. Halts earthwork between Km 4+200 and 12+800.",
            "recommended_action": "Escalate to Secretary (Highways) for joint coordination meeting with Chairman, TANGEDCO.",
            "evidence_references": "Field Issue FISS-2026-002; Dependency DEP-102",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-F-04",
            "module_source": "FIELD_OPS",
            "project_id": 5,
            "title": "Unmonitored Traffic Diversion Causing Bottlenecks on SH-49 ECR",
            "category": "Public Safety Alert",
            "severity": "HIGH",
            "confidence_score": 0.89,
            "explanation": "Contractor removed temporary retro-reflective delineators near Kovalam junction without police liaison.",
            "recommended_action": "Order immediate reinstatement of high-intensity solar blinkers and deployment of 4 marshals.",
            "evidence_references": "Field Issue FISS-2026-007; Grievance GRV-2026-102",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-F-05",
            "module_source": "FIELD_OPS",
            "project_id": 6,
            "title": "Incomplete Geo-Tag Validation on 8 Site Inspection Entries",
            "category": "Audit Trail Gap",
            "severity": "LOW",
            "confidence_score": 0.82,
            "explanation": "Mobile app entries lacked GPS fix accuracy (<15m) due to poor cellular coverage in hill terrain.",
            "recommended_action": "Enable offline GPS caching in TN-HDOS Field Mobile Module.",
            "evidence_references": "Field inspections INSP-2026-015 to INSP-2026-022",
            "status": "ACTIVE"
        },
        # Asset intelligence findings
        {
            "finding_code": "ENG-AI-A-01",
            "module_source": "ASSETS",
            "project_id": 4,
            "title": "Asset AST-PVM-01 Condition Degradation from Good to Fair (PCI 71.5)",
            "category": "Asset Health Risk",
            "severity": "HIGH",
            "confidence_score": 0.92,
            "explanation": "Early binder stripping and surface ravelling detected on newly laid stretch. Triggers automated maintenance work order MNT-2026-004.",
            "recommended_action": "Execute corrective milling and seal coat before start of northeast monsoon.",
            "evidence_references": "Asset AST-PVM-01; Test MAT-2026-014; Work Order MNT-2026-004",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-A-02",
            "module_source": "ASSETS",
            "project_id": 7,
            "title": "Major River Bridge AST-BR-03 Overdue for Annual Scour Inspection",
            "category": "Inspection Backlog",
            "severity": "HIGH",
            "confidence_score": 0.90,
            "explanation": "Bhavani River Bridge last underwater foundation scour inspection was performed 14 months ago (mandated annual limit).",
            "recommended_action": "Depute specialised diving inspection team from Highways Research Station.",
            "evidence_references": "Asset AST-BR-03; Asset condition register",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-A-03",
            "module_source": "ASSETS",
            "project_id": 8,
            "title": "12 Cross-Drainage Culverts Require Silt Removal Before Pre-Monsoon",
            "category": "Preventive Maintenance Backlog",
            "severity": "MEDIUM",
            "confidence_score": 0.87,
            "explanation": "Silt deposition exceeds 30% barrel height in 12 synthetic culverts in Tiruppur division.",
            "recommended_action": "Issue consolidated maintenance work order under CRIDP annual maintenance budget.",
            "evidence_references": "Assets AST-CLV-12 to AST-CLV-24",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-A-04",
            "module_source": "ASSETS",
            "project_id": 9,
            "title": "Retaining Wall Settling Trend Detected at Mountainous Km 24+100",
            "category": "Structural Settlement",
            "severity": "CRITICAL",
            "confidence_score": 0.93,
            "explanation": "Crib-type wall tilt monitoring indicates 18mm differential lateral movement following monsoon rains.",
            "recommended_action": "Install geotechnical inclinometer sensors and micro-pile strengthening immediately.",
            "evidence_references": "Asset AST-RW-04; Inspection INSP-2026-034",
            "status": "ACTIVE"
        },
        {
            "finding_code": "ENG-AI-A-05",
            "module_source": "ASSETS",
            "project_id": 10,
            "title": "Crash Barrier Protection Deficit on High Embankment Curves (Km 32-38)",
            "category": "Road Safety Deficiency",
            "severity": "HIGH",
            "confidence_score": 0.91,
            "explanation": "Road safety audit identified 2.4 km stretch of embankment >3m height lacking W-beam steel barriers.",
            "recommended_action": "Sanction emergency road safety installation under Road Safety Fund (RSF).",
            "evidence_references": "Asset AST-TN-038; Road Safety Audit Report #RS-44",
            "status": "ACTIVE"
        }
    ]

    for item in ai_findings_data:
        db.add(EngineeringAIFinding(**item))

    db.commit()
    print("Prompt 04 Seeding completed successfully.")
    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_engineering_quality_assets_data()
