import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    Project, Zone, Contractor, Road, Bridge, Issue, User,
    LeadershipIssue, LeadershipDecision, InterdepartmentalBlocker,
    FinancialLeakageFinding, QualityDefectRecord, ContractorEvaluation,
    LegalMatter, ZonePerformanceSnapshot
)

def seed_phase2_data(db_session: Session = None):
    Base.metadata.create_all(bind=engine)
    if db_session is None:
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False

    # Check if Phase 2 already seeded
    if db.query(LeadershipIssue).first():
        if close_on_exit:
            db.close()
        return

    print("Seeding TN-HDOS Phase 2 Executive Command Centre records...")

    proj1 = db.query(Project).filter(Project.project_code == "PRJ-TN-2026-001").first()
    proj2 = db.query(Project).filter(Project.project_code == "PRJ-TN-2026-002").first()
    proj3 = db.query(Project).filter(Project.project_code == "PRJ-TN-2026-003").first()
    
    admin_user = db.query(User).filter(User.username == "admin").first()
    contractor_lt = db.query(Contractor).filter(Contractor.company_name.like("%L&T%")).first()
    contractor_pst = db.query(Contractor).filter(Contractor.company_name.like("%PST%")).first()

    # 1. ZONE PERFORMANCE SNAPSHOTS
    zones = db.query(Zone).all()
    zone_dict = {z.code: z for z in zones}
    
    # Ensure all 5 major zones exist in database
    if "ZN-CBE" not in zone_dict:
        z_cbe = Zone(code="ZN-CBE", name="Coimbatore Zone", headquarters="Coimbatore")
        z_try = Zone(code="ZN-TRY", name="Tiruchirappalli Zone", headquarters="Tiruchirappalli")
        db.add_all([z_cbe, z_try])
        db.commit()
        zones = db.query(Zone).all()
        zone_dict = {z.code: z for z in zones}

    z_snaps = [
        ZonePerformanceSnapshot(
            zone_id=zone_dict.get("ZN-CHE", zones[0]).id,
            reporting_period="FY 2025-26",
            completed_projects_pct=68.5,
            average_project_delay_days=42,
            budget_utilisation_pct=88.2,
            quality_defects_count=3,
            pending_approvals_count=4,
            land_acquisition_pending_ha=12.4,
            contractor_performance_score=84.0,
            cohort_sample_size=18,
            data_completeness_pct=98.0
        ),
        ZonePerformanceSnapshot(
            zone_id=zone_dict.get("ZN-CBE", zones[0]).id,
            reporting_period="FY 2025-26",
            completed_projects_pct=76.2,
            average_project_delay_days=28,
            budget_utilisation_pct=92.5,
            quality_defects_count=1,
            pending_approvals_count=2,
            land_acquisition_pending_ha=6.2,
            contractor_performance_score=89.5,
            cohort_sample_size=14,
            data_completeness_pct=96.5
        ),
        ZonePerformanceSnapshot(
            zone_id=zone_dict.get("ZN-MDU", zones[0]).id,
            reporting_period="FY 2025-26",
            completed_projects_pct=62.0,
            average_project_delay_days=55,
            budget_utilisation_pct=79.4,
            quality_defects_count=4,
            pending_approvals_count=5,
            land_acquisition_pending_ha=18.0,
            contractor_performance_score=78.0,
            cohort_sample_size=16,
            data_completeness_pct=94.0
        ),
        ZonePerformanceSnapshot(
            zone_id=zone_dict.get("ZN-TRY", zones[0]).id,
            reporting_period="FY 2025-26",
            completed_projects_pct=71.4,
            average_project_delay_days=34,
            budget_utilisation_pct=86.0,
            quality_defects_count=2,
            pending_approvals_count=3,
            land_acquisition_pending_ha=8.5,
            contractor_performance_score=86.0,
            cohort_sample_size=12,
            data_completeness_pct=97.0
        )
    ]
    db.add_all(z_snaps)
    db.commit()

    # 2. CRITICAL LEADERSHIP ISSUES
    iss1 = LeadershipIssue(
        project_id=proj1.id if proj1 else 1,
        issue_reference="LDR-2026-001",
        title="Critical Land Acquisition Stoppage at Akkarai Section on SH-49 ECR [DEMO DATA]",
        district="Chengalpattu",
        category="Land Acquisition & Revenue",
        problem_description="4.2 Hectares of private land acquisition stalled due to landowner title disputes, halting widening to 4 lanes at km 28+400.",
        root_cause="Sub-Collector Tambaram award enquiry delayed under TN Highways Act 2001 Section 15(2); interim compensation dispute.",
        responsible_officer="Er. M. Rajasekaran, M.E. (Superintending Engineer)",
        responsible_external_dept="Revenue and Disaster Management (Tahsildar Tambaram)",
        contractor_name="L&T Infrastructure Engineering Ltd",
        days_pending=65,
        schedule_impact_days=65,
        financial_exposure_cr=14.50,
        evidence_available="Gazette Notification No. II(2)/HMP/482/2024 & Sub-Collector Notice",
        recommended_action="Convene Joint Secretariat Bilateral Taskforce with Principal Secretary (Revenue) to fast-track compensation deposit.",
        escalation_level="SECRETARIAT_ESCALATED",
        priority="CRITICAL",
        status="Action in Progress",
        date_raised=datetime.datetime(2025, 9, 1)
    )

    iss2 = LeadershipIssue(
        project_id=proj2.id if proj2 else 2,
        issue_reference="LDR-2026-002",
        title="Southern Railway GAD Clearance Delay for Tambaram Elevated Corridor Pier P-4/P-5 [DEMO DATA]",
        district="Chengalpattu",
        category="Railway Coordination (ROB)",
        problem_description="Pier cap erection suspended within 30m railway corridor pending approved General Arrangement Drawing (GAD).",
        root_cause="Chief Bridge Engineer (CBE) Southern Railway raised structural clearance query regarding overhead electrification (OHE) wire height.",
        responsible_officer="Er. P. Anandhan, B.E. (Divisional Engineer)",
        responsible_external_dept="Southern Railway (Zone 7, Ministry of Railways)",
        contractor_name="PST Engineering Constructions",
        days_pending=90,
        schedule_impact_days=90,
        financial_exposure_cr=8.80,
        evidence_available="Joint Inspection Memo with Railway Divisional Engineer dtd 14-Aug-2025",
        recommended_action="Hon'ble Minister / Principal Secretary to hold bilateral conference with General Manager, Southern Railway.",
        escalation_level="MINISTERIAL_ESCALATED",
        priority="CRITICAL",
        status="Action in Progress",
        date_raised=datetime.datetime(2025, 8, 10)
    )

    iss3 = LeadershipIssue(
        project_id=proj2.id if proj2 else 2,
        issue_reference="LDR-2026-003",
        title="Subgrade Compressive Strength Defect & Staging Shortage by Contractor PST [DEMO DATA]",
        district="Chengalpattu",
        category="Contractor Default & Quality",
        problem_description="Core density at Chainage 31+200 fell below MoRTH standards (88% vs 95% required). Contractor demobilised shuttering staging.",
        root_cause="Contractor financial distress and material procurement delays.",
        responsible_officer="Er. P. Anandhan, B.E. (Divisional Engineer)",
        responsible_external_dept="Highways Research Station (HRS) Quality Audit",
        contractor_name="PST Engineering Constructions",
        days_pending=42,
        schedule_impact_days=30,
        financial_exposure_cr=3.20,
        evidence_available="HRS Guindy Core Test Certificate #HRS-2026-441",
        recommended_action="Issue 14-day statutory cure notice under Clause 46 of General Conditions of Contract (GCC); withhold interim running bill.",
        escalation_level="ZONE_ESCALATED",
        priority="HIGH",
        status="Under Review",
        date_raised=datetime.datetime(2025, 9, 25)
    )
    db.add_all([iss1, iss2, iss3])
    db.commit()

    # 3. INTERDEPARTMENTAL BLOCKERS
    b1 = InterdepartmentalBlocker(
        project_id=proj1.id if proj1 else 1,
        department_category="Revenue & Land Acquisition",
        approval_required="Section 15(2) Valuation Award & Land Possession Handover (4.2 Ha)",
        submission_date=datetime.datetime(2025, 3, 15),
        latest_correspondence="D.O. Letter No. HW/CGL/LA/2025-412 to District Collector Chengalpattu",
        responsible_highways_officer="Er. M. Rajasekaran, M.E. (Superintending Engineer)",
        external_contact="Thiru G. Venkatesan (Special DRO, Land Acquisition)",
        days_pending=65,
        expected_timeline="Within 30 days post-hearing",
        reason_for_delay="Dispute over market valuation vs guideline value raised by pattadars in Muttukadu village.",
        supporting_documents="DRO Meeting Minutes dtd 18-Oct-2025",
        recommended_action="Remit provisional compensation to High Court Registrar to secure immediate possession.",
        status="BLOCKED"
    )

    b2 = InterdepartmentalBlocker(
        project_id=proj1.id if proj1 else 1,
        department_category="Electricity & TANGEDCO",
        approval_required="Relocation of 42 High-Tension (33kV) Transmission Poles",
        submission_date=datetime.datetime(2025, 5, 20),
        latest_correspondence="TANGEDCO Working Estimate #SE/CGL/EDC/TECH/2025-889",
        responsible_highways_officer="Er. P. Anandhan, B.E. (Divisional Engineer)",
        external_contact="Er. S. Murugesan (Superintending Engineer, TANGEDCO Kanchipuram)",
        days_pending=40,
        expected_timeline="45 days from shutdown sanction",
        reason_for_delay="Scheduled line shutdown awaiting State Load Despatch Centre (SLDC) window approval.",
        supporting_documents="Demand Draft of Rs 1.82 Cr remitted by Highways on 10-Aug-2025",
        recommended_action="Request Energy Secretary to sanction weekend shutdown window for Akkarai corridor.",
        status="BLOCKED"
    )

    b3 = InterdepartmentalBlocker(
        project_id=proj2.id if proj2 else 2,
        department_category="Southern Railway",
        approval_required="General Arrangement Drawing (GAD) & Safety Span Launching Surcharge",
        submission_date=datetime.datetime(2025, 4, 10),
        latest_correspondence="Railway Headquarter Letter #W.439/CN/B/TN/104 dtd 02-Sep-2025",
        responsible_highways_officer="Er. K. Balasubramanian (Chief Engineer Projects)",
        external_contact="Er. N. Sridhar (Chief Bridge Engineer, Southern Railway HQ)",
        days_pending=90,
        expected_timeline="60 days post-joint inspection",
        reason_for_delay="Clearance requirement for future 3rd & 4th mainline tracks between Tambaram and Chengalpattu.",
        supporting_documents="Revised GAD Plan Drawing No. TN/HW/ROB/2025-R3",
        recommended_action="Submit revised span layout providing 7.2m vertical clearance to expedite final approval.",
        status="BLOCKED"
    )
    db.add_all([b1, b2, b3])
    db.commit()

    # 4. FINANCIAL & LEAKAGE INTELLIGENCE FINDINGS
    l1 = FinancialLeakageFinding(
        finding_code="LKG-2026-001",
        project_id=proj1.id if proj1 else 1,
        category="Measurement and Bill Mismatch",
        title="Bituminous Concrete Thickness & Density Discrepancy at km 24/0 to 28/0 [DEMO DATA]",
        potential_exposure_cr=1.45,
        verified_loss_cr=0.0,
        verified_recovery_cr=0.60,
        prevented_expenditure_cr=0.85,
        evidence_summary="Electronic weighbridge refinery gate pass tons do not match MB Book 412 recorded volume by 12.8%.",
        calculation_details="Calculated theoretical tonnage: 14,200 MT; Refinery dispatched: 12,380 MT; Invoiced: 14,190 MT (Difference: 1,810 MT @ Rs 8,011/MT).",
        confidence="HIGH",
        validation_status="INVESTIGATION_INDICATOR",
        responsible_officer="Er. P. Anandhan, B.E. (Divisional Engineer)",
        recommended_investigation="Highways Research Station (HRS) to conduct independent radar core testing and cross-verify with CPCL Manali refinery gate telemetry."
    )

    l2 = FinancialLeakageFinding(
        finding_code="LKG-2026-002",
        project_id=proj2.id if proj2 else 2,
        category="Unreconciled Advances",
        title="Mobilisation Advance Recovery Lag Past 30% Physical Milestone [DEMO DATA]",
        potential_exposure_cr=2.20,
        verified_loss_cr=0.0,
        verified_recovery_cr=1.20,
        prevented_expenditure_cr=1.00,
        evidence_summary="Running Account Bill #4 omitted mandated 15% pro-rata recovery of mobilization advance.",
        calculation_details="10% initial mobilization advance of Rs 8.50 Cr was sanctioned; current recovered Rs 1.45 Cr vs mandated Rs 3.65 Cr.",
        confidence="HIGH",
        validation_status="VERIFIED",
        responsible_officer="Accounts Officer & Divisional Engineer Tambaram",
        recommended_investigation="Order automatic adjustment of Rs 2.20 Cr from pending RA Bill #5 and verify validity of bank guarantee."
    )
    db.add_all([l1, l2])
    db.commit()

    # 5. QUALITY DEFECT RECORDS
    q1 = QualityDefectRecord(
        defect_code="DEF-2026-001",
        project_id=proj1.id if proj1 else 1,
        defect_type="Material Testing Failure (HRS Guindy)",
        chainage_km=28.4,
        severity="CRITICAL",
        observation_notes="M-40 grade concrete 28-day characteristic compressive strength achieved 33.2 MPa (Fail vs 40.0 MPa target).",
        lab_report_ref="HRS/GUINDY/LAB/2026/0412",
        corrective_action_status="PENDING_RECTIFICATION",
        responsible_engineer="Er. P. Anandhan (Divisional Engineer)"
    )
    q2 = QualityDefectRecord(
        defect_code="DEF-2026-002",
        project_id=proj2.id if proj2 else 2,
        defect_type="Structural Inspection Observation",
        chainage_km=2.4,
        severity="HIGH",
        observation_notes="Surface micro-cracking observed on Pier Cap P-3 staging during pre-stressing cable tensioning.",
        lab_report_ref="HRS/FIELD/NDT/2026/0088",
        corrective_action_status="PENDING_RECTIFICATION",
        responsible_engineer="Er. S. Kannan (Quality Control ADE)"
    )
    db.add_all([q1, q2])
    db.commit()

    # 6. CONTRACTOR EVALUATIONS
    c_eval1 = ContractorEvaluation(
        contractor_id=contractor_lt.id if contractor_lt else 1,
        project_id=proj1.id if proj1 else 1,
        performance_score=86.5,
        behind_schedule_days=15,
        repeated_defects_count=0,
        delayed_submissions_count=1,
        time_extension_requests=1,
        claims_disputes_cr=0.0,
        performance_tier="SATISFACTORY",
        assessment_notes="Mobilisation is adequate. Schedule slip is primarily attributable to external 33kV pole shifting."
    )
    c_eval2 = ContractorEvaluation(
        contractor_id=contractor_pst.id if contractor_pst else 2,
        project_id=proj2.id if proj2 else 2,
        performance_score=68.0,
        behind_schedule_days=65,
        repeated_defects_count=3,
        delayed_submissions_count=4,
        time_extension_requests=2,
        claims_disputes_cr=2.40,
        performance_tier="UNDER_SCRUTINY",
        assessment_notes="Severe staging equipment bottleneck and poor lab test adherence. Performance security expires in 90 days."
    )
    db.add_all([c_eval1, c_eval2])
    db.commit()

    # 7. LEGAL MATTERS
    leg1 = LegalMatter(
        case_reference="W.P. No. 24891/2025 Madras High Court",
        court_forum="High Court of Madras (Principal Seat)",
        project_id=proj1.id if proj1 else 1,
        matter_type="Environmental & Tree Felling PIL",
        plaintiff_petitioner="Coastal Greenery Foundation",
        respondent="Secretary to Govt, Highways Dept & Others",
        case_summary="PIL challenging felling of avenue trees between Akkarai and Muttukadu on SH-49 ECR.",
        interim_stay_in_force=False,
        next_hearing_date=datetime.datetime(2026, 11, 24),
        statutory_deadline=datetime.datetime(2026, 11, 18),
        ag_audit_para_ref=None,
        is_confidential=False,
        responsible_legal_officer="Thiru K. M. D. Muhilan (Special Government Pleader)",
        status="ARGUMENTS_STAGE"
    )
    leg2 = LegalMatter(
        case_reference="AG Audit Para No. 2024-25/14",
        court_forum="Accountant General (Audit-II) Tamil Nadu",
        project_id=proj2.id if proj2 else 2,
        matter_type="Audit Paras - Unadjusted Material Advances",
        plaintiff_petitioner="Principal Accountant General (Audit)",
        respondent="Divisional Engineer (H), Tambaram",
        case_summary="Audit observation on unrecovered steel and bitumen mobilization advances amounting to Rs 2.20 Cr.",
        interim_stay_in_force=False,
        next_hearing_date=None,
        statutory_deadline=datetime.datetime(2026, 12, 10),
        ag_audit_para_ref="AG-TN-HW-2024-PARA-14",
        is_confidential=False,
        responsible_legal_officer="Financial Advisor & Chief Accounts Officer",
        status="PENDING_COUNTER"
    )
    db.add_all([leg1, leg2])
    db.commit()

    # 8. LEADERSHIP DECISIONS & ACTIONS REQUIRED
    dec1 = LeadershipDecision(
        decision_reference="DEC-2026-001",
        project_id=proj1.id if proj1 else 1,
        leadership_issue_id=iss1.id,
        required_decision="Convene Joint Secretariat Bilateral Taskforce with Revenue Secretary on Land Acquisition Awards [DEMO]",
        assigned_authority="Principal Secretary to Government (Highways)",
        action_type="FORWARD_COORDINATION",
        supporting_evidence="Gazette Notification No. II(2)/HMP/482/2024 & Tahsildar Award Enquiry Report",
        due_date=datetime.datetime(2026, 11, 28),
        status="ASSIGNED_FOR_REVIEW",
        resolution_notes="Meeting note drafted for Chief Secretary coordination agenda.",
        created_by_user_id=admin_user.id if admin_user else 1
    )
    dec2 = LeadershipDecision(
        decision_reference="DEC-2026-002",
        project_id=proj2.id if proj2 else 2,
        leadership_issue_id=iss2.id,
        required_decision="Bilateral Summit with General Manager Southern Railway for Tambaram ROB GAD Approval [DEMO]",
        assigned_authority="Hon'ble Minister for Highways & Minor Ports",
        action_type="ESCALATE",
        supporting_evidence="Revised GAD Drawing No. TN/HW/ROB/2025-R3",
        due_date=datetime.datetime(2026, 11, 22),
        status="PENDING",
        resolution_notes="Ministerial briefing note prepared.",
        created_by_user_id=admin_user.id if admin_user else 1
    )
    dec3 = LeadershipDecision(
        decision_reference="DEC-2026-003",
        project_id=proj2.id if proj2 else 2,
        leadership_issue_id=iss3.id,
        required_decision="Sanction Issuance of 14-Day Statutory Cure Notice to Contractor PST Engineering [DEMO]",
        assigned_authority="Chief Engineer (Highways - Projects)",
        action_type="INVESTIGATION",
        supporting_evidence="HRS Guindy Compressive Strength Lab Certificate #HRS-2026-441",
        due_date=datetime.datetime(2026, 11, 15),
        status="DECIDED",
        resolution_notes="Cure notice issued on 04-Nov-2026 under Clause 46 GCC.",
        created_by_user_id=admin_user.id if admin_user else 1
    )
    db.add_all([dec1, dec2, dec3])
    db.commit()

    print("TN-HDOS Phase 2 Executive Command Centre data successfully seeded.")
    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_phase2_data()
