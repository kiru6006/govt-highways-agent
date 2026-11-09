import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import (
    Project, LandParcel, LandAcquisitionWorkflowRecord,
    RevenueCoordinationRequest, LitigationCaseDetail, SiteBlockerRecord,
    FinancialExposureAssessment, PreConstructionRiskAssessment,
    LandLitigationResolutionAction, EntityRelationship
)

def seed_land_litigation_data(db_session: Session = None):
    should_close = False
    if db_session is not None:
        db = db_session
    else:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        now = datetime.datetime.now(datetime.UTC)

        # -------------------------------------------------------------
        # 1. ENSURE 15 PROJECTS
        # -------------------------------------------------------------
        existing_projects = db.query(Project).all()
        p_count = len(existing_projects)
        if p_count < 15 and existing_projects:
            ref_p = existing_projects[0]
            sample_projects = [
                ("PRJ-TN-2026-013", "Widening of Coimbatore Western Ring Road (Km 12/0 to 28/4)", 184.50, "C&M Coimbatore", "SH", "Coimbatore"),
                ("PRJ-TN-2026-014", "Construction of 4-Lane Bypass for Harur Town on SH-60A", 68.20, "C&M Salem", "SH", "Dharmapuri"),
                ("PRJ-TN-2026-015", "Reconstruction of Distressed Major Bridge across Cauvery on MDR-312", 42.80, "C&M Trichy", "MDR", "Tiruchirappalli")
            ]
            for i, (code, title, cost, dept, rtype, dist) in enumerate(sample_projects[:15 - p_count]):
                p_new = Project(
                    project_code=code,
                    title=title,
                    sanctioned_cost_cr=cost,
                    estimated_cost_cr=cost,
                    expenditure_to_date_cr=cost * 0.35,
                    physical_progress_pct=38.0,
                    financial_progress_pct=35.0,
                    status="IN_PROGRESS",
                    road_type=rtype,
                    funding_source="CRIDP",
                    total_length_km=14.2 + i * 3.5,
                    verification_status="VERIFIED_OFFICIAL",
                    zone_id=ref_p.zone_id,
                    circle_id=ref_p.circle_id,
                    division_id=ref_p.division_id,
                    executing_department_id=ref_p.executing_department_id,
                    created_at=now
                )
                db.add(p_new)
            db.commit()

        projects = db.query(Project).all()
        proj_ids = [p.id for p in projects]

        # -------------------------------------------------------------
        # 2. SEED 60 LAND PARCELS
        # -------------------------------------------------------------
        existing_parcels = {p.parcel_reference: p for p in db.query(LandParcel).all()}
        districts_pool = ["Kancheepuram", "Tiruvallur", "Salem", "Ariyalur", "Vellore", "Coimbatore", "Madurai", "Tiruchirappalli", "Nilgiris", "Chengalpattu", "Cuddalore"]
        villages_pool = ["Pallikaranai", "Thiruporur", "Vandalur", "Guduvanchery", "Perungalathur", "Maraimalainagar", "Singaperumalkoil", "Walajabad", "Uthiramerur", "Sriperumbudur", "Madurantakam"]
        stages = ["SEC_15_2_NOTIFICATION", "SEC_15_1_GAZETTE", "SEC_19_1_AWARD", "COMPENSATION_DEPOSIT", "POSSESSION_HANDOVER"]

        for i in range(1, 61):
            ref = f"PARCEL-TN-2026-{i:03d}"
            pid = proj_ids[(i - 1) % len(proj_ids)]
            dist = districts_pool[(i - 1) % len(districts_pool)]
            vil = villages_pool[(i - 1) % len(villages_pool)]
            stage = stages[(i - 1) % len(stages)]

            has_lit = (i % 3 == 0 or i in [2, 4, 10, 18, 24, 30, 42])
            possession = "POSSESSION_HANDED_OVER" if (stage == "POSSESSION_HANDOVER" and not has_lit) else ("LITIGATION_STAY" if (has_lit and i % 2 == 0) else "PENDING_POSSESSION")
            comp_status = "PAID" if stage in ["COMPENSATION_DEPOSIT", "POSSESSION_HANDOVER"] else ("DISPUTED_COURT_DEPOSIT" if has_lit else "ASSESSED_PENDING_DISBURSEMENT")

            if ref in existing_parcels:
                p = existing_parcels[ref]
                p.has_litigation = has_lit
                p.possession_status = possession
                p.compensation_status = comp_status
                p.acquisition_stage = stage
            else:
                p = LandParcel(
                    project_id=pid,
                    parcel_reference=ref,
                    district=dist,
                    taluk=f"{dist} Taluk",
                    village=vil,
                    survey_number=f"{100 + i}/{i % 4 + 1}{chr(65 + i % 3)}",
                    land_classification="Dry Land (Punja)" if i % 2 == 0 else "Wet Land (Nanja)",
                    private_land_sqm=1250.0 + i * 45.0,
                    govt_land_sqm=200.0 + i * 15.0,
                    total_land_sqm=1450.0 + i * 60.0,
                    notification_15_2_date=now - datetime.timedelta(days=180 + i * 3),
                    gazette_15_1_date=now - datetime.timedelta(days=120 + i * 2),
                    award_19_1_date=now - datetime.timedelta(days=60 + i),
                    compensation_assessed_cr=round(0.45 + (i * 0.08), 2),
                    compensation_paid_cr=round(0.45 + (i * 0.08), 2) if comp_status == "PAID" else 0.0,
                    possession_status=possession,
                    has_litigation=has_lit,
                    responsible_revenue_officer=f"Thiru S. Ramanathan, Special Tahsildar (LA) #{i % 6 + 1}",
                    landowner_name=f"Thiru K. Muthuvel & {i % 4 + 1} Others",
                    acquisition_stage=stage,
                    legal_provision="Tamil Nadu Highways Act 2001 (Act 34/2002) Sec 15",
                    compensation_status=comp_status,
                    possession_date=now - datetime.timedelta(days=30) if possession == "POSSESSION_HANDED_OVER" else None,
                    dispute_details="Interim Stay granted by Madras High Court regarding valuation" if has_lit else None,
                    geo_lat=12.9249 + (i * 0.012),
                    geo_lng=80.1000 + (i * 0.015),
                    blocking_project_milestone=f"Milestone-3 Earthwork km {i}/000" if possession != "POSSESSION_HANDED_OVER" else None,
                    data_mode="SIMULATED",
                    data_status="Seeded Demo",
                    source_type="synthetic"
                )
                db.add(p)
        db.commit()

        parcels = db.query(LandParcel).all()
        parcel_ids = [p.id for p in parcels]

        # -------------------------------------------------------------
        # 3. SEED 25 ACQUISITION WORKFLOW PROCEEDINGS
        # -------------------------------------------------------------
        existing_awf = {w.parcel_id: w for w in db.query(LandAcquisitionWorkflowRecord).all()}
        workflow_stages = [
            ("Administrative Sanction", "Secretary (Highways)"),
            ("Section 15(2) Notice Issuance", "Special DRO (LA)"),
            ("Public Hearing & Objections Scrutiny", "Special Tahsildar (LA)"),
            ("Section 15(1) Gazette Publication", "Government of Tamil Nadu"),
            ("Section 19(1) Compensation Award Determination", "Special Collector (LA)")
        ]
        for idx, pid in enumerate(parcel_ids[:25]):
            if pid not in existing_awf:
                for s_idx, (stg, auth) in enumerate(workflow_stages):
                    awf = LandAcquisitionWorkflowRecord(
                        parcel_id=pid,
                        stage_name=stg,
                        sequence_order=s_idx + 1,
                        status="COMPLETED" if s_idx < 3 else "IN_PROGRESS",
                        responsible_authority=auth,
                        target_date=now + datetime.timedelta(days=s_idx * 20),
                        completed_date=now - datetime.timedelta(days=(4 - s_idx) * 20) if s_idx < 3 else None,
                        document_reference=f"ROC/LA/2026/G{idx+1}/S{s_idx+1}",
                        remarks="Statutory publication completed in District Gazette and local newspapers."
                    )
                    db.add(awf)
        db.commit()

        # -------------------------------------------------------------
        # 4. SEED 20 LITIGATION CASES (Covering 10 Canonical Scenarios)
        # -------------------------------------------------------------
        existing_cases = {c.case_code: c for c in db.query(LitigationCaseDetail).all()}

        case_scenarios = [
            # 1. Ownership dispute
            ("CASE-HC-2026-001", "WP No. 4120/2026", "TNHC010041202026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction - High Court of Judicature at Madras", "Writ Petition (Civil)", 1, parcel_ids[0],
             "P. Govindasamy & 4 Legal Heirs", "Secretary to Govt, Highways & Spl DRO (LA)",
             "Tamil Nadu Highways Act 2001 Sec 15(2)", "Ownership dispute",
             "Quash Sec 15(2) notice on ground that partition deed registered in 1994 was ignored in settlement register",
             "STATUS_QUO", "Status quo on title mutation; excavation permitted outside disputed 15m strip",
             False, "No work restriction on main carriageway; boundary fencing held",
             now - datetime.timedelta(days=12), now + datetime.timedelta(days=14), now + datetime.timedelta(days=10),
             "Thiru M. Karthikeyan (Addl Govt Pleader)", "+91-44-2534-1188", "Er. V. Sundaram, EE Legal Cell",
             "SENT", now - datetime.timedelta(days=8), "COMPLETE", "DRAFT_UNDER_REVIEW", None,
             "Hearing attended by Special GP on 28 Jan 2026; adjournment granted for counter",
             "Draft counter received from EE Legal; undergoing settling by Addl Govt Pleader",
             now - datetime.timedelta(days=2), "Counter affidavit required within 10 days",
             "Counsel actively engaged; waiting for Tahsildar genealogy record",
             "Ownership or title dispute", "File counter enclosing 2024 Revenue settlement register; move for modification"),

            # 2. Compensation dispute
            ("CASE-HC-2026-002", "LAOP No. 88/2025", "TNSC020000882025", "Special Court for LAOP, Kancheepuram",
             "Land Acquisition Original Petition Jurisdiction", "LAOP Reference under Sec 64", 2, parcel_ids[1],
             "M/s. Kanchee Agro Industries Ltd", "Competent Authority & Spl DRO (LA)",
             "RFCTLARR Act 2013 Sec 64", "Compensation dispute",
             "Enhance land compensation from ₹450/sq.ft to market rate of ₹1,200/sq.ft plus 100% solatium",
             "NO_ORDER", "No stay order issued; statutory reference on quantum only",
             False, "Entire corridor free for physical construction; dispute restricted to award quantum",
             now - datetime.timedelta(days=25), now + datetime.timedelta(days=30), now + datetime.timedelta(days=20),
             "Tmt. S. Anuradha (Government Pleader)", "+91-44-2534-2211", "Er. N. Jayakumar, AEE (H)",
             "SENT", now - datetime.timedelta(days=20), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=15),
             "Cross-examination of claimant witness completed on 14 Jan 2026",
             "Government valuation evidence filed with guideline value extracts from SRO",
             now - datetime.timedelta(days=5), None,
             "Case on track; guideline value extracts filed properly",
             "Compensation dispute", "Produce registered sale exemplars of adjacent survey numbers during argument"),

            # 3. Court stay (Active work restriction)
            ("CASE-HC-2026-003", "WP No. 1234/2026", "TNHC010012342026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction - High Court of Judicature at Madras", "Writ Petition (Civil)", 4, parcel_ids[3],
             "K. Senthil Kumar & 12 Landowners of Kilkothur", "District Collector Vellore & EE (H) NABARD",
             "Constitution of India Art 226 & TN Act 34/2002", "Procedural challenge to Sec 15(2)",
             "Stay all road upgradation works between km 0/0 and 3/7 pending personal hearing under Sec 15(2)",
             "INTERIM_STAY_ACTIVE", "Interim injunction restraining respondents from disturbing physical possession of petitioners until counter is filed",
             True, "Entire package km 0/0 to 3/7 suspended under High Court order dated 08 Jan 2026",
             now - datetime.timedelta(days=18), now + datetime.timedelta(days=6), now + datetime.timedelta(days=4),
             "Thiru R. Neelakandan (Addl Advocate General)", "+91-44-2534-9900", "Er. P. Anandhan, DE (H)",
             "SENT", now - datetime.timedelta(days=15), "PARTIAL", "DRAFT_UNDER_REVIEW", None,
             "Motion hearing held 08 Jan 2026; interim stay granted returnable in 4 weeks",
             "Urgent counter required to vacate stay; petitioners suppressed earlier notice service",
             now - datetime.timedelta(days=1), "CRITICAL: Stay vacation petition pending hearing in 6 days",
             "Immediate Secretariat coordination needed to produce personal service acknowledgment",
             "Active stay or injunction", "File vacation petition producing proof of publication in Dinamani & Daily Thanthi"),

            # 4. Missing Revenue records
            ("CASE-HC-2026-004", "WP No. 9410/2026", "TNHC010094102026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction", "Writ Petition (Civil)", 3, parcel_ids[2],
             "R. Varadharajan (Power Agent)", "Tahsildar Tambaram & Divisional Engineer (H)",
             "Tamil Nadu Survey and Boundaries Act 1923", "Survey and boundary demarcation challenge",
             "Mandamus to conduct re-survey with FMB sketch prior to laying culvert foundation",
             "NOTICE_ONLY", "Notice ordered; no interim stay granted",
             False, "No work restriction; culvert works continuing",
             now - datetime.timedelta(days=8), now + datetime.timedelta(days=22), now + datetime.timedelta(days=14),
             "Thiru K. Balasubramanian (Govt Advocate)", "+91-44-2534-3344", "Er. S. Narayanan, EE (H)",
             "PENDING", None, "AWAITING_REVENUE_FMB", "NOT_DRAFTED", None,
             "Notice served on Govt Advocate on 01 Feb 2026",
             "Awaiting FMB certified copy from Tahsildar Tambaram",
             now - datetime.timedelta(days=3), "Awaiting Revenue FMB extract before counter can be settled",
             "Revenue department response delayed; follow up with Special DRO",
             "Case pending without work restriction", "Obtain reconstructed FMB sheet from District Survey Records Room"),

            # 5. Survey mismatch
            ("CASE-HC-2026-005", "WP No. 5184/2026", "TNHC010051842026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction", "Writ Petition (Civil)", 1, parcel_ids[4],
             "Shri Ramakrishna Seva Trust", "State of Tamil Nadu rep by Secretary Highways",
             "Tamil Nadu Highways Act 2001 Sec 8", "Alignment variation claim",
             "Direct Highways Department to adhere strictly to 2018 DPR alignment without encroaching Trust frontage",
             "STATUS_QUO", "Status quo as on 12 Jan 2026 restricted strictly to compound wall at Ch 24+150",
             True, "Work restricted strictly between Ch 24+100 and Ch 24+250; balance corridor unrestricted",
             now - datetime.timedelta(days=14), now + datetime.timedelta(days=12), now + datetime.timedelta(days=8),
             "Thiru M. Karthikeyan (Addl Govt Pleader)", "+91-44-2534-1188", "Er. V. Sundaram, EE Legal Cell",
             "SENT", now - datetime.timedelta(days=10), "COMPLETE", "SETTLED_BY_COUNSEL", None,
             "Trust filed rejoinder affidavit claiming 2.5m discrepancy in Road Centerline",
             "Joint total station survey conducted on 03 Feb 2026 confirms Highways boundary matches 1968 RSO",
             now - datetime.timedelta(days=1), "Hearing in 12 days; file joint survey report",
             "Evidence complete; ready for final arguments to modify status quo",
             "Active stay or injunction", "Submit Joint Total Station Survey plan demonstrating compound wall is within legal RoW"),

            # 6. Forest clearance pending
            ("CASE-HC-2026-006", "WP (MD) No. 2210/2026", "TNHC020022102026", "Madras High Court (Madurai Bench)",
             "Madurai Bench - Writ Jurisdiction", "Writ Petition (Public Interest Litigation)", 5, parcel_ids[5],
             "Society for Green Tamil Nadu", "Principal Chief Conservator of Forests & CE (H)",
             "Forest (Conservation) Act 1980 Sec 2", "Environmental & Forest objection",
             "Injunction restraining felling of 42 roadside banyan trees on SH-116 corridor",
             "INTERIM_STAY_ACTIVE", "Stay on tree felling pending compensatory afforestation compliance report",
             True, "Pavement widening restricted around tree clusters between km 14/200 and 15/800",
             now - datetime.timedelta(days=30), now + datetime.timedelta(days=8), now + datetime.timedelta(days=5),
             "Thiru A. Balamurugan (Spl Govt Pleader Madurai)", "+91-452-253-1122", "Er. C. Mohan, EE (H)",
             "SENT", now - datetime.timedelta(days=22), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=10),
             "Court directed Forest Department to verify 1:10 sapling plantation site in Ariyalur",
             "DFO Ariyalur confirmed 420 saplings planted under Green Tamil Nadu Mission",
             now - datetime.timedelta(days=2), "Compliance report to be submitted to Hon'ble Division Bench",
             "Excellent compliance evidence assembled; move for immediate vacation",
             "Order clarification required", "Place DFO Geo-tagged compensatory afforestation report before Division Bench"),

            # 7. Encroachment eviction challenge
            ("CASE-HC-2026-007", "WP No. 6612/2026", "TNHC010066122026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction", "Writ Petition (Civil)", 2, parcel_ids[6],
             "Tambaram Traders & Shopkeepers Welfare Association", "Divisional Engineer (H) Tambaram",
             "Tamil Nadu Highways Act 2001 Sec 28(2)", "Encroachment eviction challenge",
             "Quash Form-III eviction notice dated 15 Dec 2025 issued under Section 28",
             "NOTICE_ONLY", "Notice ordered; Court directed no coercive action for 2 weeks subject to showing valid patta",
             False, "Traders given 14 days to submit title deeds; no stay on road drainage construction",
             now - datetime.timedelta(days=10), now + datetime.timedelta(days=16), now + datetime.timedelta(days=7),
             "Tmt. S. Anuradha (Government Pleader)", "+91-44-2534-2211", "Er. P. Anandhan, DE (H)",
             "SENT", now - datetime.timedelta(days=7), "COMPLETE", "DRAFT_UNDER_REVIEW", None,
             "Counsel pointed out Section 28(2) notices were served individually with 15 days cure period",
             "Traders failed to produce patta; all structures sit squarely within 30m Highways RoW",
             now - datetime.timedelta(days=2), "Eviction stay petition coming up in 16 days",
             "Documentation robust; proceed with vacating notice protection",
             "Procedural challenge", "File counter enclosing 1954 Village Settlement 'Vandipathai' classification"),

            # 8. Public access objection
            ("CASE-HC-2026-008", "WP No. 7114/2026", "TNHC010071142026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction", "Writ Petition (Civil)", 6, parcel_ids[7],
             "President, Vandalur Village Panchayat", "Secretary Highways & Chief Engineer Projects",
             "Constitution of India Art 21", "Public access objection",
             "Direct construction of Vehicular Underpass (VUP) at Ch 18+400 for cattle and farm equipment",
             "NO_ORDER", "No stay order; matter posted for Chief Engineer feasibility report",
             False, "Corridor works proceeding without legal restriction",
             now - datetime.timedelta(days=20), now + datetime.timedelta(days=28), now + datetime.timedelta(days=18),
             "Thiru M. Karthikeyan (Addl Govt Pleader)", "+91-44-2534-1188", "Er. T. Vijayan, CE Projects",
             "SENT", now - datetime.timedelta(days=15), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=8),
             "Highways informed court that 4.5m x 3.0m Light Vehicular Underpass already designed at Ch 18+650",
             "Villagers insisted on shifting by 250m; CE Design examining hydraulic feasibility",
             now - datetime.timedelta(days=4), None,
             "Technical solution exists; good administrative progress",
             "Case pending without work restriction", "Submit modified general arrangement drawing accommodating 250m shift"),

            # 9. Contractor claim due to site non-availability
            ("CASE-HC-2026-009", "Arb.O.P. No. 42/2026", "TNHC010000422026", "Madras High Court (Commercial Division)",
             "Original Side - Arbitration Jurisdiction", "Arbitration Original Petition under Sec 9", 2, parcel_ids[8],
             "M/s. PST Engineering Construction Pvt Ltd", "Superintending Engineer (H) Chengalpattu",
             "Arbitration and Conciliation Act 1996 Sec 9", "Contractor claim due to site non-availability",
             "Interim injunction restraining encashment of Performance Bank Guarantee (₹8.5 Cr) citing employer delay in land handover",
             "STATUS_QUO", "Bank Guarantee invocation stayed subject to contractor keeping BG alive",
             False, "Work continuing under mutual extension of time; no site restriction",
             now - datetime.timedelta(days=35), now + datetime.timedelta(days=15), now + datetime.timedelta(days=10),
             "Senior Counsel Thiru P. Wilson assisted by Addl GP", "+91-44-2534-7766", "Er. M. Rajendran, SE (H)",
             "SENT", now - datetime.timedelta(days=25), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=12),
             "Counter filed proving contractor achieved only 14% progress on unencumbered 78% corridor length",
             "Arguments heard in part; posted for rejoinder",
             now - datetime.timedelta(days=3), "Hearing on 24 Feb 2026",
             "Contractor trying to mask internal financial insolvency behind land delay",
             "Disposed case requiring compliance", "Press for early final disposal and reference to Arbitral Tribunal"),

            # 10. Court case pending WITHOUT actual work restriction
            ("CASE-HC-2026-010", "WP No. 3318/2026", "TNHC010033182026", "Madras High Court (Principal Seat)",
             "Writ Jurisdiction", "Writ Petition (Civil)", 4, parcel_ids[9],
             "A. Sivakumar (Aggrieved Landowner)", "Special Collector (LA) & Divisional Engineer (H)",
             "RFCTLARR Act 2013 Sec 26", "Compensation dispute",
             "Re-computation of multiplying factor for rural land under First Schedule",
             "NO_ORDER", "Notice issued returnable in 6 weeks; NO INJUNCTION OR STAY GRANTED",
             False, "Corridor handover completed; road earthwork and sub-base actively in progress",
             now - datetime.timedelta(days=15), now + datetime.timedelta(days=45), now + datetime.timedelta(days=35),
             "Thiru K. Balasubramanian (Govt Advocate)", "+91-44-2534-3344", "Er. S. Narayanan, EE (H)",
             "SENT", now - datetime.timedelta(days=10), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=5),
             "Affidavit filed clarifying multiplying factor of 1.25 applied strictly as per G.O. Ms. No. 300 Revenue",
             "Case awaits routine listing; no impediment to execution",
             now - datetime.timedelta(days=5), None,
             "Standard compensation challenge; zero construction risk",
             "Case pending without work restriction", "Awaiting routine bench disposal")
        ]

        # Add 10 more cases for total of 20
        for extra in range(11, 21):
            c_code = f"CASE-HC-2026-{extra:03d}"
            pid = proj_ids[(extra - 1) % len(proj_ids)]
            par_id = parcel_ids[(extra - 1) % len(parcel_ids)]
            is_restr = (extra in [13, 17])

            case_scenarios.append((
                c_code, f"WP No. {4000 + extra * 123}/2026", f"TNHC0100{4000 + extra * 123}2026",
                "Madras High Court (Principal Seat)" if extra % 2 == 0 else "Madras High Court (Madurai Bench)",
                "Writ Jurisdiction", "Writ Petition (Civil)", pid, par_id,
                f"Petitioner Coalition #{extra} rep by Thiru N. Murugan", "State of Tamil Nadu & Highways Dept",
                "Tamil Nadu Highways Act 2001", "Boundary and alignment dispute" if extra % 2 == 0 else "Solatium calculation",
                "Direction to re-assess structure valuation" if extra % 2 == 0 else "Interim injunction on demolition",
                "INTERIM_STAY_ACTIVE" if is_restr else "NO_ORDER",
                "Interim injunction on demolition" if is_restr else "Notice ordered without interim relief",
                is_restr, f"Demolition stayed on Survey No. {110 + extra}" if is_restr else "No work restriction",
                now - datetime.timedelta(days=15), now + datetime.timedelta(days=20), now + datetime.timedelta(days=14),
                "Thiru M. Karthikeyan (Addl Govt Pleader)", "+91-44-2534-1188", "Er. V. Sundaram, EE Legal Cell",
                "SENT", now - datetime.timedelta(days=10), "COMPLETE", "AFFIDAVIT_FILED", now - datetime.timedelta(days=3),
                "Matter listed for hearing next fortnight", "Counter affidavit successfully filed",
                now - datetime.timedelta(days=3), "Hearing approaching", None,
                "Active stay or injunction" if is_restr else "Case pending without work restriction",
                "File inspection memo before court"
            ))

        for sc in case_scenarios:
            code = sc[0]
            if code not in existing_cases:
                cd = LitigationCaseDetail(
                    case_code=code,
                    court_case_number=sc[1],
                    cnr_number=sc[2],
                    court_name=sc[3],
                    jurisdiction=sc[4],
                    case_type=sc[5],
                    project_id=sc[6],
                    parcel_id=sc[7],
                    petitioners=sc[8],
                    respondents=sc[9],
                    statutory_provisions=sc[10],
                    dispute_nature=sc[11],
                    relief_sought=sc[12],
                    interim_order_status=sc[13],
                    interim_order_details=sc[14],
                    work_restricted=sc[15],
                    restriction_scope=sc[16],
                    latest_hearing_date=sc[17],
                    next_hearing_date=sc[18],
                    filing_compliance_deadline=sc[19],
                    assigned_counsel_name=sc[20],
                    counsel_contact=sc[21],
                    govt_legal_coordinator=sc[22],
                    instructions_sent_status=sc[23],
                    instructions_sent_date=sc[24],
                    documents_supplied_status=sc[25],
                    counter_affidavit_status=sc[26],
                    counter_affidavit_filed_date=sc[27],
                    hearing_attendance_record=sc[28],
                    last_counsel_update=sc[29],
                    last_update_date=sc[30],
                    procedural_alert=sc[31],
                    human_performance_review_notes=sc[32],
                    disposition_type=sc[33],
                    recommended_action=sc[34],
                    data_mode="SIMULATED"
                )
                db.add(cd)
        db.commit()

        # -------------------------------------------------------------
        # 5. SEED 15 REVENUE DEPARTMENT REQUESTS
        # -------------------------------------------------------------
        existing_rev = {r.request_code: r for r in db.query(RevenueCoordinationRequest).all()}
        req_types = [
            "Patta and title verification", "Field Measurement Book", "Survey and subdivision",
            "Land classification", "Ownership history", "Acquisition notices",
            "Compensation and award", "Possession documentation", "Encroachment status",
            "Court-related records", "Revenue litigation status", "Mutation or boundary clarification",
            "Patta and title verification", "Field Measurement Book", "Compensation and award"
        ]

        for i in range(1, 16):
            r_code = f"REV-REQ-2026-{i:03d}"
            pid = proj_ids[(i - 1) % len(proj_ids)]
            par_id = parcel_ids[(i - 1) % len(parcel_ids)]
            rtype = req_types[i - 1]
            dist = districts_pool[(i - 1) % len(districts_pool)]
            is_overdue = (i in [1, 3, 5, 8, 12])
            due_dt = now - datetime.timedelta(days=i * 4) if is_overdue else now + datetime.timedelta(days=14 + i * 2)

            if r_code not in existing_rev:
                rc = RevenueCoordinationRequest(
                    request_code=r_code,
                    project_id=pid,
                    parcel_id=par_id,
                    district=dist,
                    taluk=f"{dist} Taluk",
                    village=villages_pool[(i - 1) % len(villages_pool)],
                    survey_number=f"45/{i}",
                    requesting_highways_officer=f"Er. S. Narayanan, Divisional Engineer (H) #{i % 4 + 1}",
                    receiving_revenue_authority=f"Special DRO (Land Acquisition) / Tahsildar {dist}",
                    request_type=rtype,
                    request_details=f"Statutory request for certified {rtype} for corridor widening under G.O. Ms. No. 114.",
                    request_date=now - datetime.timedelta(days=40 + i),
                    acknowledgment_date=now - datetime.timedelta(days=35 + i),
                    due_date=due_dt,
                    response_status="OVERDUE" if is_overdue else ("RECEIVED" if i % 4 == 0 else "PENDING"),
                    days_overdue=max((now - due_dt).days, 0) if is_overdue else 0,
                    documents_received=f"Certified extract of {rtype}" if i % 4 == 0 else None,
                    documents_missing=f"Certified FMB sketch and village chitta copy" if is_overdue else None,
                    clarification_required=f"Discrepancy in Survey No 45/{i} subdivision demarcation" if is_overdue else None,
                    escalation_level="DISTRICT_COLLECTOR" if is_overdue and i in [1, 3] else "DISTRICT_DRO" if is_overdue else "NONE",
                    last_followup_date=now - datetime.timedelta(days=3),
                    next_action=f"Issue D.O. Letter to District Collector {dist}" if is_overdue else "Await dispatch of certified copy",
                    resolution_evidence=f"Revenue Dispatch No. DISP/{dist}/2026/041" if i % 4 == 0 else None,
                    data_mode="SIMULATED"
                )
                db.add(rc)
        db.commit()

        # -------------------------------------------------------------
        # 6. SEED 30 SITE BLOCKERS (RED / AMBER / GREEN)
        # -------------------------------------------------------------
        existing_blockers = {b.blocker_code: b for b in db.query(SiteBlockerRecord).all()}
        blocker_categories = [
            "Land ownership", "Land acquisition procedure", "Possession and handover",
            "Court restriction", "Compensation", "Encroachment",
            "Forest clearance", "Environmental approval", "Utility shifting",
            "Railway crossing", "Public objections", "Safety restrictions",
            "Contractor mobilisation", "Technical design change", "Other department approval"
        ]

        for i in range(1, 31):
            b_code = f"BLK-2026-{i:03d}"
            pid = proj_ids[(i - 1) % len(proj_ids)]
            cat = blocker_categories[(i - 1) % len(blocker_categories)]
            is_crit = (i % 2 != 0)
            gate = "RED" if (cat in ["Court restriction", "Land ownership"] or i in [3, 7, 12, 19]) else ("AMBER" if i % 3 != 0 else "GREEN")
            status_val = "RESOLVED" if gate == "GREEN" else ("ESCALATED" if gate == "RED" else "ACTIVE")

            if b_code not in existing_blockers:
                sb = SiteBlockerRecord(
                    blocker_code=b_code,
                    project_id=pid,
                    chainage_start_km=round(12.0 + (i * 1.2), 3),
                    chainage_end_km=round(12.0 + (i * 1.2) + 0.35, 3),
                    chainage_display=f"km {12 + i}/100 to {12 + i}/450",
                    category=cat,
                    cause_description=f"Site obstructed due to {cat.lower()} pending statutory clearance and field handover.",
                    start_date=now - datetime.timedelta(days=30 + i * 2),
                    is_critical_path=is_crit,
                    readiness_gate=gate,
                    resolution_owner=f"Er. K. Murugesan (Joint CE) / Spl DRO (LA)",
                    supporting_department="Revenue Department" if "Land" in cat or "Compensation" in cat else ("TANGEDCO" if "Utility" in cat else "Forest Department"),
                    action_required=f"Complete joint field inspection and publish statutory notification.",
                    target_resolution_date=now + datetime.timedelta(days=15 + i),
                    current_status=status_val,
                    financial_impact_cr=round(0.25 + (i * 0.15), 2),
                    evidence_attachment=f"DOC-ATTACH-BLK-{i:03d}.pdf",
                    escalation_history=f"Escalated to Empowered Committee on { (now - datetime.timedelta(days=10)).strftime('%d %b %Y') }",
                    data_mode="SIMULATED"
                )
                db.add(sb)
        db.commit()

        # -------------------------------------------------------------
        # 7. SEED 15 FINANCIAL EXPOSURE ASSESSMENTS
        # -------------------------------------------------------------
        existing_exp = {e.project_id: e for e in db.query(FinancialExposureAssessment).all()}
        for i in range(1, 16):
            pid = proj_ids[(i - 1) % len(proj_ids)]
            if pid not in existing_exp:
                admitted = round(0.40 + (i * 0.12), 2)
                escalation = round(0.35 + (i * 0.10), 2)
                financing = round(0.20 + (i * 0.05), 2)
                legal = round(0.08 + (i * 0.02), 2)
                forecast = round(admitted + escalation + financing + legal, 2)

                fea = FinancialExposureAssessment(
                    project_id=pid,
                    parcel_id=parcel_ids[(i - 1) % len(parcel_ids)],
                    project_value_affected_cr=round(18.5 + (i * 4.2), 2),
                    actual_incremental_expenditure_cr=round(0.30 + (i * 0.08), 2),
                    contractor_claims_submitted_cr=round(1.20 + (i * 0.45), 2),
                    claims_admitted_cr=admitted,
                    claims_disputed_cr=round(0.80 + (i * 0.33), 2),
                    idle_resource_cost_cr=round(0.25 + (i * 0.06), 2),
                    contractual_price_escalation_cr=escalation,
                    additional_financing_cost_cr=financing,
                    legal_expenses_cr=legal,
                    forecast_incremental_cost_cr=forecast,
                    potentially_avoidable_future_cost_cr=round(forecast * 0.65, 2),
                    confirmed_recoverable_cr=round(0.15 + (i * 0.03), 2),
                    public_benefit_delay_days=45 + (i * 6),
                    calculation_formula="Forecast Incremental = Admitted Claims + Projected Escalation (Cl 10CA) + Additional IDC + Legal Fees",
                    assumptions_and_sources="Assumes price indices as per MoRTH bulletin; contractor machinery idle cost verified against logbooks.",
                    confidence_score_pct=88.5,
                    evidence_reference=f"FEA-AUDIT-2026-P{pid}.pdf",
                    data_mode="SIMULATED"
                )
                db.add(fea)
        db.commit()

        # -------------------------------------------------------------
        # 8. SEED 5 PRE-CONSTRUCTION RISK ASSESSMENTS (WITH 1 LEGAL PROHIBITION)
        # -------------------------------------------------------------
        existing_pcra = {r.assessment_code: r for r in db.query(PreConstructionRiskAssessment).all()}
        pcra_samples = [
            ("PCRA-2026-001", proj_ids[0], "PRE_TENDER", "GREEN", "VERIFIED", "GAZETTED_15_1", "CLEARED", "DISBURSED_POSSESSION_HANDED", "NO_RESTRICTIONS", False, "STAGE_II_GRANTED", "WORK_ORDER_ISSUED", "CLEAR_CORRIDOR", "ALL_SIGNOFFS_COMPLETE", "Corridor certified 100% ready for civil contract packaging."),
            ("PCRA-2026-002", proj_ids[1], "PRE_MOBILISATION", "AMBER", "PARTIAL", "INQUIRY_15_2", "OBJECTIONS_PENDING", "PENDING_DISBURSEMENT", "NOTICE_PENDING", False, "STAGE_I_PENDING", "JOINT_INSPECTION_PENDING", "PARTIAL_CHAINAGE_RESTRICTED", "PENDING_REVENUE_DRO", "Objections hearing scheduled; 12 parcels pending award."),
            ("PCRA-2026-003", proj_ids[3], "SITE_HANDOVER", "RED", "DISPUTED", "SEC_15_2_CHALLENGE", "HEARING_SCHEDULED", "PENDING_DISBURSEMENT", "INTERIM_STAY_ACTIVE", True, "NOT_APPLICABLE", "WORK_ORDER_ISSUED", "ACCESS_BLOCKED", "PENDING_REVENUE_DRO", "BINDING HIGH COURT STAY in WP No. 1234/2026. Site handover strictly prohibited."),
            ("PCRA-2026-004", proj_ids[2], "PRE_TENDER", "AMBER", "PARTIAL", "GAZETTED_15_1", "CLEARED", "PENDING_DISBURSEMENT", "NO_RESTRICTIONS", False, "NOT_APPLICABLE", "JOINT_INSPECTION_PENDING", "CLEAR_CORRIDOR", "PENDING_REVENUE_DRO", "Award inquiry completed; disbursement under process."),
            ("PCRA-2026-005", proj_ids[4], "PRE_MOBILISATION", "GREEN", "VERIFIED", "AWARD_19_1", "CLEARED", "DISBURSED_POSSESSION_HANDED", "NO_RESTRICTIONS", False, "STAGE_II_GRANTED", "SHIFTING_COMPLETED", "CLEAR_CORRIDOR", "ALL_SIGNOFFS_COMPLETE", "Full clearance obtained from Revenue, TANGEDCO and Forest.")
        ]
        for pcode, pid, stg, gate, sur, acq, obj, comp, leg, has_prob, fst, utl, acc, sign, notes in pcra_samples:
            if pcode not in existing_pcra:
                ra = PreConstructionRiskAssessment(
                    assessment_code=pcode,
                    project_id=pid,
                    assessment_stage=stg,
                    readiness_status=gate,
                    survey_title_status=sur,
                    acquisition_route_status=acq,
                    objections_proceedings_status=obj,
                    compensation_possession_status=comp,
                    active_legal_restrictions_status=leg,
                    has_binding_legal_prohibition=has_prob,
                    forest_statutory_approvals_status=fst,
                    utility_dependencies_status=utl,
                    site_access_contractor_status=acc,
                    required_signoffs_status=sign,
                    missing_evidence_notes=notes,
                    identified_risks_severity="CRITICAL" if gate == "RED" else ("HIGH" if gate == "AMBER" else "LOW"),
                    recommended_mitigations="Resolve High Court vacation petition prior to site handover" if has_prob else "Complete Revenue Tahsildar joint inspection",
                    assigned_resolution_owner="Er. S. Narayanan, Divisional Engineer (H)",
                    authorized_override_granted=False,
                    data_mode="SIMULATED"
                )
                db.add(ra)
        db.commit()

        # -------------------------------------------------------------
        # 9. SEED 20 RESOLUTION ACTIONS
        # -------------------------------------------------------------
        existing_actions = {a.action_code: a for a in db.query(LandLitigationResolutionAction).all()}
        action_samples = [
            ("ACT-RES-2026-001", proj_ids[0], "Expedite Counter Affidavit in WP No. 4120/2026", "ASSIGN_ACTION", "Legal Cell", "Er. V. Sundaram (EE Legal)", now + datetime.timedelta(days=4)),
            ("ACT-RES-2026-002", proj_ids[1], "FMB Subdivision Verification for Palar Bridge Approaches", "REQUEST_INFO", "Revenue Department", "Tahsildar Ariyalur", now + datetime.timedelta(days=7)),
            ("ACT-RES-2026-003", proj_ids[3], "Convene High Court Stay Vacation Strategy Meeting", "COORDINATION_MEETING", "Highways Secretariat", "Principal Secretary to Government", now + datetime.timedelta(days=3)),
            ("ACT-RES-2026-004", proj_ids[2], "Tambaram Traders Encroachment Demarcation Walkthrough", "ASSIGN_ACTION", "C&M Wing", "Er. P. Anandhan (DE Tambaram)", now + datetime.timedelta(days=6)),
            ("ACT-RES-2026-005", proj_ids[4], "DFO Compensatory Afforestation Joint Site Inspection", "UPLOAD_RESPONSE", "Forest Department", "Conservator of Forests Madurai", now + datetime.timedelta(days=9))
        ]
        for extra in range(6, 21):
            pid = proj_ids[(extra - 1) % len(proj_ids)]
            action_samples.append((
                f"ACT-RES-2026-{extra:03d}", pid,
                f"Statutory Resolution Follow-up #{extra} for Right of Way Clearance",
                "ASSIGN_ACTION" if extra % 2 == 0 else "COORDINATION_MEETING",
                "Revenue Department" if extra % 3 == 0 else "Highways & Minor Ports",
                f"Er. K. Murugesan (Joint CE Planning)",
                now + datetime.timedelta(days=extra)
            ))

        for acode, pid, title, atype, dept, off, tdate in action_samples:
            if acode not in existing_actions:
                act = LandLitigationResolutionAction(
                    action_code=acode,
                    project_id=pid,
                    action_title=title,
                    action_description=f"Action directive issued under Section 7 Protocol: {title}",
                    action_type=atype,
                    assigned_department=dept,
                    assigned_officer=off,
                    target_date=tdate,
                    status="COMPLIED" if acode == "ACT-RES-2026-005" else "OPEN",
                    is_closed=(acode == "ACT-RES-2026-005"),
                    closure_remarks="Compensatory afforestation report submitted to High Court." if acode == "ACT-RES-2026-005" else None,
                    escalation_level="DISTRICT_DRO" if acode in ["ACT-RES-2026-002", "ACT-RES-2026-003"] else "OFFICER",
                    data_mode="SIMULATED"
                )
                db.add(act)
        db.commit()

        # -------------------------------------------------------------
        # 10. UNIVERSAL RELATIONSHIP INTEGRATION (EntityRelationship)
        # -------------------------------------------------------------
        cases = db.query(LitigationCaseDetail).all()
        for idx, c in enumerate(cases[:10]):
            rel_exists = db.query(EntityRelationship).filter(
                EntityRelationship.source_entity_type == "PROJECT",
                EntityRelationship.source_entity_id == c.project_id,
                EntityRelationship.target_entity_type == "LITIGATION_CASE",
                EntityRelationship.target_entity_id == c.id
            ).first()
            if not rel_exists:
                rel = EntityRelationship(
                    relationship_code=f"REL-LL-{idx+1:03d}",
                    source_entity_type="PROJECT",
                    source_entity_id=c.project_id,
                    source_entity_name=f"Project #{c.project_id}",
                    target_entity_type="LITIGATION_CASE",
                    target_entity_id=c.id,
                    target_entity_name=c.court_case_number,
                    relationship_type="LITIGATED_UNDER",
                    directionality="DIRECTED",
                    confidence_score=0.98,
                    verification_status="VERIFIED_OFFICIAL",
                    source_reference="High Court Cause List & Legal Register",
                    access_tier="RESTRICTED",
                    is_current=True,
                    valid_from=now
                )
                db.add(rel)

        db.commit()
        print("Land Acquisition & Litigation Intelligence Command Centre seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding land litigation data: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_land_litigation_data()
