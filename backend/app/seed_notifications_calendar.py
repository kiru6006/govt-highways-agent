"""
Seed script for TN-HDOS Notifications and Unified Calendar.
Populates:
- 120+ Notifications across all 15 categories and priority tiers
- 35+ AI-Prioritised Briefings with explainable scoring and evidence citations
- 30+ Calendar Events across Month, Week, Day, and Agenda views
- 25+ Meeting Action Items with realistic SLA escalations
- Notification Preferences for personas
All marked: data_mode="mock", data_status="Seeded Demo"
"""

import datetime
import json
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Role, Project, Notification, NotificationPreference,
    CalendarEvent, CalendarParticipant, MeetingActionItem, NotificationAuditEvent
)

def seed_notifications_calendar_data(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        existing_count = db.query(Notification).count()
        if existing_count >= 50:
            return

        users = db.query(User).all()
        user_by_username = {u.username: u for u in users}
        projects = db.query(Project).all()
        proj_1 = projects[0] if len(projects) > 0 else None
        proj_2 = projects[1] if len(projects) > 1 else None
        proj_3 = projects[2] if len(projects) > 2 else None

        now = datetime.datetime.utcnow()

        # Helper to get user id safely
        def uid(username, default_idx=0):
            if username in user_by_username:
                return user_by_username[username].id
            return users[default_idx % len(users)].id if users else 1

        # 1. SEED NOTIFICATION PREFERENCES
        for u in users:
            existing_pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == u.id).first()
            if not existing_pref:
                db.add(NotificationPreference(
                    user_id=u.id,
                    enable_in_app=True,
                    enable_email_digest=False,
                    min_priority_alert="LOW",
                    quiet_hours_enabled=False,
                    quiet_hours_start="22:00",
                    quiet_hours_end="06:00",
                    category_filters_json="[]",
                    daily_briefing_enabled=True
                ))
        db.commit()

        # 2. SEED NOTIFICATIONS (120+ items across categories & roles)
        notifications_data = [
            # MINISTERIAL (P01)
            {
                "username": "minister",
                "title": "Cabinet Review: CKICP Corridor Critical Milestone Delay",
                "message": "EPC Package 04 (Madurai-Paramakudi Corridor) recorded 45-day delay due to uncompleted high-tension TANGEDCO power line shifting at km 48/200. Construction stoppage imminent.",
                "priority": "CRITICAL",
                "category": "PROJECT_UPDATE",
                "source_module": "projects",
                "source_record_id": "PRJ-CKICP-004",
                "project": proj_1,
                "dept": "Highways & Minor Ports",
                "officer": "Er. S. Palanivel, CE (Projects)",
                "target_route": "#/project-360?id=1",
                "due_date": now + datetime.timedelta(days=2),
                "is_mandatory": True,
                "ai_score": 96.0,
                "ai_priority": True,
                "ai_reasoning": "High-value corridor delay affecting international multilateral disbursement target (ADB tranche).",
                "ai_impact": "Disbursement penalty of ₹14.8 Cr and contractual claim from concessionaire.",
                "ai_action": "Convene joint cabinet coordination review with Energy Secretary.",
                "ai_evidence": "Monthly Progress Report May 2026, Section 4.2 & Site Diary No. 118"
            },
            {
                "username": "minister",
                "title": "Financial Exposure Alert: Arbitration Award Appeal Deadline",
                "message": "Commercial Court arbitration petition for Western Ring Road package 2 requires state appeal submission before 15 days. Financial exposure ₹38.4 Cr.",
                "priority": "HIGH",
                "category": "LEGAL",
                "source_module": "compliance",
                "source_record_id": "ARB-2026-089",
                "project": proj_2,
                "dept": "Highways & Minor Ports",
                "officer": "Adv. S. Duraisamy, SGP",
                "target_route": "#/compliance",
                "due_date": now + datetime.timedelta(days=6),
                "is_mandatory": True,
                "ai_score": 88.5,
                "ai_priority": True,
                "ai_reasoning": "Statutory limitation period under Section 34 of Arbitration Act expires in 12 days.",
                "ai_impact": "State liability to deposit 75% awarded amount (₹28.8 Cr) if appeal not filed.",
                "ai_action": "Sanction engagement of Senior Counsel and approve draft memorandum.",
                "ai_evidence": "Commercial Court Chennai Order Dated 24-04-2026"
            },
            {
                "username": "minister",
                "title": "Cabinet Policy Sanction: Rural Road Safety Allocation",
                "message": "Draft Cabinet Note for special ₹450 Cr blackspot remediation package under TNRSP-II submitted for ministerial concurrence.",
                "priority": "HIGH",
                "category": "ADMIN_DECISION",
                "source_module": "digital_office",
                "source_record_id": "NOTE-CAB-2026-04",
                "project": proj_3,
                "dept": "Highways Secretariat",
                "officer": "Thiru Shunchonngam Jatak Chiru, IAS",
                "target_route": "#/digital-office",
                "due_date": now + datetime.timedelta(days=4),
                "is_mandatory": False,
                "ai_score": 82.0,
                "ai_priority": True,
                "ai_reasoning": "Policy note required for inclusion in upcoming Cabinet Council agenda.",
                "ai_impact": "Delayed clearance postpones monsoon road safety tender schedule by 3 months.",
                "ai_action": "Sign digital office docket note.",
                "ai_evidence": "G.O. Draft File No. HW-2026-POL-018"
            },

            # SECRETARY (P02)
            {
                "username": "secretary",
                "title": "Interdepartmental Blocker: TWAD Pipeline Relocation Chennai Bypass",
                "message": "TWAD Board clear-water transmission main crossing NH-45/SH-12 junction pending road cut approval and deposit payment reconciliation.",
                "priority": "CRITICAL",
                "category": "UTILITY_SHIFTING",
                "source_module": "land_utility",
                "source_record_id": "UTIL-TWAD-2026-012",
                "project": proj_1,
                "dept": "TWAD Board",
                "officer": "Er. K. Saravanan, Utility Nodal Officer",
                "target_route": "#/land-utility",
                "due_date": now + datetime.timedelta(days=3),
                "is_mandatory": True,
                "ai_score": 92.0,
                "ai_priority": True,
                "ai_reasoning": "Twin 1200mm diameter transmission mains halt sub-base compaction for 1.8 km corridor.",
                "ai_impact": "Critical path blocker causing ₹12 Lakh/day machinery idling costs.",
                "ai_action": "Order release of revised supervision charges and issue statutory road cut permit.",
                "ai_evidence": "Joint Inspection Note Dated 28-04-2026 by Highways & TWAD"
            },
            {
                "username": "secretary",
                "title": "Section 19(1) Land Acquisition Award Pending Approval",
                "message": "Pykara Bypass package 3: Final award determination for 14.8 hectares agrarian land completed by Special DRO. Financial compensation sanction ₹26.5 Cr required.",
                "priority": "HIGH",
                "category": "LAND_ACQUISITION",
                "source_module": "land_utility",
                "source_record_id": "LA-PARCEL-2026-088",
                "project": proj_2,
                "dept": "Revenue & Disaster Management",
                "officer": "Thiru K. Baskaran, DRO (LA)",
                "target_route": "#/land-utility",
                "due_date": now + datetime.timedelta(days=5),
                "is_mandatory": True,
                "ai_score": 87.0,
                "ai_priority": True,
                "ai_reasoning": "Statutory 1-year award validity under TN Highways Act expiring in 21 days.",
                "ai_impact": "Lapse of land acquisition proceedings would require restart under Section 15(2).",
                "ai_action": "Sign administrative sanction for treasury deposit to Revenue escrow.",
                "ai_evidence": "Special DRO Award Statement No. 4/2026 & Tahsildar Valuation Sheet"
            },

            # DIRECTOR GENERAL (P03)
            {
                "username": "dir_gen",
                "title": "Statewide Asphalt Batching Plant Quality Non-Conformance",
                "message": "HRS Central Quality Audit identified Bituminous Concrete (BC) bitumen binder content below 5.2% specification in 3 major Western Circle batch plants.",
                "priority": "CRITICAL",
                "category": "QUALITY",
                "source_module": "quality",
                "source_record_id": "NCR-HRS-2026-044",
                "project": proj_3,
                "dept": "Highways Department (C&M)",
                "officer": "Er. T. Soundararajan, QC HRS",
                "target_route": "#/quality",
                "due_date": now + datetime.timedelta(days=2),
                "is_mandatory": True,
                "ai_score": 94.0,
                "ai_priority": True,
                "ai_reasoning": "Deficient binder percentage creates early pavement ravelling and premature rutting.",
                "ai_impact": "Direct durability reduction on ₹62 Cr newly surfaced State Highway stretches.",
                "ai_action": "Issue statewide stop-work order to defaulting hot-mix plants until recalibration.",
                "ai_evidence": "HRS Lab Test Certificates Nos. QC-2026-901 to 904"
            },
            {
                "username": "dir_gen",
                "title": "Quarterly Chief Engineers Performance Review",
                "message": "Comprehensive physical and financial progress presentation prepared for all 8 Highway wings. 14 projects flagged in Red category.",
                "priority": "MEDIUM",
                "category": "MEETING",
                "source_module": "calendar",
                "source_record_id": "EVT-2026-0001",
                "project": proj_1,
                "dept": "Highways Department",
                "officer": "Er. S. Mythili, Planning Engineer",
                "target_route": "#/calendar",
                "due_date": now + datetime.timedelta(days=3),
                "is_mandatory": False,
                "ai_score": 74.0,
                "ai_priority": False,
                "ai_reasoning": "Routine quarterly performance evaluation.",
                "ai_impact": "Reallocation of unspent budget provisions before Q2.",
                "ai_action": "Review wing-wise KPI cards and chair review session.",
                "ai_evidence": "Consolidated Progress Dashboard Report April-June 2026"
            },

            # CHIEF ENGINEER (P04)
            {
                "username": "chief_eng",
                "title": "Technical Sanction Variation: Tambaram Flyover Girder Redesign",
                "message": "Revised technical sanction request submitted for pier 14 foundation modification following unexpected deep hard rock layer encounter.",
                "priority": "HIGH",
                "category": "APPROVAL",
                "source_module": "projects",
                "source_record_id": "TS-VAR-2026-019",
                "project": proj_1,
                "dept": "Highways (Projects Wing)",
                "officer": "Er. M. Rajendran, SE Chengalpattu",
                "target_route": "#/project-360?id=1",
                "due_date": now + datetime.timedelta(days=4),
                "is_mandatory": False,
                "ai_score": 84.0,
                "ai_priority": True,
                "ai_reasoning": "Structural redesign required to avoid micro-pile buckling under eccentric load.",
                "ai_impact": "Estimated variation cost ₹2.1 Cr (within permissible 5% contingency).",
                "ai_action": "Review proof consultant calculations and approve revised GAD.",
                "ai_evidence": "IIT Madras Geotechnical Borehole Investigation Log B-14"
            },

            # DIVISIONAL ENGINEER (P06)
            {
                "username": "ee_tambaram",
                "title": "Running Bill Verification: Package 02 Subgrade Compaction",
                "message": "CC Bill No. 06 for ₹4.82 Cr submitted by M/s L&T Infrastructure awaiting EE level certification and test check verification.",
                "priority": "HIGH",
                "category": "FINANCE",
                "source_module": "finance",
                "source_record_id": "BILL-LT-2026-06",
                "project": proj_1,
                "dept": "Highways (Tambaram Division)",
                "officer": "Er. K. Murugan, Assistant Engineer",
                "target_route": "#/field-ops",
                "due_date": now + datetime.timedelta(days=3),
                "is_mandatory": True,
                "ai_score": 86.0,
                "ai_priority": True,
                "ai_reasoning": "Contractual 14-day bill certification period expires on Friday.",
                "ai_impact": "Interest liability under GCC Clause 60 if payment not released within 28 days.",
                "ai_action": "Perform 10% test check on Measurement Book pages 45 to 88 and certify.",
                "ai_evidence": "MB No. 1044/2026 with AE verification stamp"
            },
            {
                "username": "ee_tambaram",
                "title": "Site Inspection: Medavakkam Junction Drainage Relocation",
                "message": "Joint inspection scheduled with Revenue, Police, and Corporation officials to finalize storm-water drain diversion layout.",
                "priority": "MEDIUM",
                "category": "FIELD_OPS",
                "source_module": "field_ops",
                "source_record_id": "INSP-TAM-2026-081",
                "project": proj_1,
                "dept": "Highways (Tambaram Division)",
                "officer": "Er. P. Anandhan, EE Tambaram",
                "target_route": "#/field-ops",
                "due_date": now + datetime.timedelta(days=1),
                "is_mandatory": False,
                "ai_score": 72.0,
                "ai_priority": False,
                "ai_reasoning": "On-site layout sign-off needed before precast box culvert placement.",
                "ai_impact": "Delay will push culvert installation into monsoon season.",
                "ai_action": "Conduct site inspection and sign joint inspection record.",
                "ai_evidence": "Divisional Inspection Roster Week 18"
            },

            # ASSISTANT ENGINEER (P07)
            {
                "username": "ae_saidapet",
                "title": "Field Measurement Entry: Culvert Wing Wall Concrete M-25",
                "message": "Pour verification completed for 3 culverts on Kelambakkam link road. Enter level book coordinates and cube test records into e-MB.",
                "priority": "MEDIUM",
                "category": "FIELD_OPS",
                "source_module": "field_ops",
                "source_record_id": "MB-ENT-2026-042",
                "project": proj_1,
                "dept": "Highways (Tambaram Division)",
                "officer": "Er. K. Murugan, AE",
                "target_route": "#/field-ops",
                "due_date": now + datetime.timedelta(days=2),
                "is_mandatory": False,
                "ai_score": 68.0,
                "ai_priority": False,
                "ai_reasoning": "Timely MB entry required before backfilling commences.",
                "ai_impact": "Hidden measurement dispute if backfilled without certified dimensions.",
                "ai_action": "Upload level sheets and photograph GPS logs.",
                "ai_evidence": "Site Diary No. 89 Entry 12"
            },

            # QUALITY ENGINEER (P10)
            {
                "username": "qc_hrs_eng",
                "title": "Material Test Failure: Coarse Aggregate Crushing Value",
                "message": "Quarry sample from Cheyyur quarry showed aggregate crushing value of 33.4% against allowable maximum of 30.0% for WMM base course.",
                "priority": "CRITICAL",
                "category": "QUALITY",
                "source_module": "quality",
                "source_record_id": "TEST-HRS-2026-118",
                "project": proj_1,
                "dept": "Highways Research Station",
                "officer": "Er. T. Soundararajan, QC HRS",
                "target_route": "#/quality",
                "due_date": now + datetime.timedelta(days=1),
                "is_mandatory": True,
                "ai_score": 93.0,
                "ai_priority": True,
                "ai_reasoning": "Substandard aggregate causes structural degradation and early road surface disintegration under axle loads.",
                "ai_impact": "Rejection of 4,500 MT dumped aggregate stack.",
                "ai_action": "Issue formal NCR-08 to contractor and prohibit stack usage.",
                "ai_evidence": "HRS Aggregate Test Sheet Lab Ref: AT-2026-442"
            },

            # CONTRACTOR (P16 - L&T)
            {
                "username": "contractor_lt",
                "title": "Milestone Compliance Notice: Subgrade Completion Package 02",
                "message": "Contractual Milestone II (Continuous Subgrade 24.5 km) verification requested. Submit joint survey levels and compaction test reports.",
                "priority": "HIGH",
                "category": "CONTRACTOR",
                "source_module": "contractors",
                "source_record_id": "MS-LT-2026-02",
                "project": proj_1,
                "dept": "Highways Department",
                "officer": "V. Ramakrishnan, Project Director (L&T)",
                "target_route": "#/field-ops",
                "due_date": now + datetime.timedelta(days=5),
                "is_mandatory": False,
                "ai_score": 85.0,
                "ai_priority": True,
                "ai_reasoning": "Milestone payment milestone of ₹18.0 Cr triggered upon verification.",
                "ai_impact": "Milestone delay would invoke liquidated damages warning notice.",
                "ai_action": "Submit consolidated density test register to AE/EE.",
                "ai_evidence": "GCC Clause 47.1 Milestone Schedule"
            },

            # CONTRACTOR (P17 - PST)
            {
                "username": "contractor_pst",
                "title": "Safety Non-Conformance Notice: Night Work Signage",
                "message": "Site inspection flagged inadequate retro-reflective blinkers and missing mandatory cautionary diversion boards at Ch 12+400.",
                "priority": "CRITICAL",
                "category": "FIELD_OPS",
                "source_module": "field_ops",
                "source_record_id": "SAF-PST-2026-01",
                "project": proj_2,
                "dept": "Highways Department",
                "officer": "T. Shanmugam, Project Director (PST)",
                "target_route": "#/field-ops",
                "due_date": now + datetime.timedelta(days=1),
                "is_mandatory": True,
                "ai_score": 95.0,
                "ai_priority": True,
                "ai_reasoning": "Imminent hazard to night traffic on high-speed dual carriageway stretch.",
                "ai_impact": "Accident liability and potential suspension of night construction work.",
                "ai_action": "Deploy IRC:SP:55 compliant reflective delineators and barricading within 6 hours.",
                "ai_evidence": "Field Inspector Photo Log Dated Today"
            },

            # FINANCE CONTROLLER (P19)
            {
                "username": "finance_controller",
                "title": "Letter of Credit (LoC) Ceiling Alert: Western Circle",
                "message": "Expenditure against Circle LoC allocation has reached 92.4% of Q1 ceiling. Budget replenishment sanction required.",
                "priority": "HIGH",
                "category": "FINANCE",
                "source_module": "finance",
                "source_record_id": "LOC-Q1-2026-WC",
                "project": proj_2,
                "dept": "Highways Department (Finance)",
                "officer": "Tmt. S. Uma Maheshwari, Fin Controller",
                "target_route": "#/finance",
                "due_date": now + datetime.timedelta(days=4),
                "is_mandatory": False,
                "ai_score": 86.5,
                "ai_priority": True,
                "ai_reasoning": "Approaching LoC ceiling causes treasury voucher token rejections.",
                "ai_impact": "Disruption in contractor monthly payments across 18 active road works.",
                "ai_action": "Move file for Additional Sanction to Finance (PW) Department.",
                "ai_evidence": "State Treasury Integrated Portal (IFHRMS) Ledger Sheet"
            },

            # LAND ACQUISITION OFFICER (P22)
            {
                "username": "la_officer",
                "title": "Statutory Hearing Section 15(3): Landowner Objections",
                "message": "Public inquiry session scheduled for 32 landowners in Navalur village regarding valuation enhancement claims.",
                "priority": "HIGH",
                "category": "LAND_ACQUISITION",
                "source_module": "land_utility",
                "source_record_id": "LA-HEAR-2026-14",
                "project": proj_1,
                "dept": "Revenue & Disaster Management",
                "officer": "Thiru K. Baskaran, DRO (LA)",
                "target_route": "#/land-utility",
                "due_date": now + datetime.timedelta(days=3),
                "is_mandatory": True,
                "ai_score": 89.0,
                "ai_priority": True,
                "ai_reasoning": "Statutory hearing required under TN Acquisition of Land for Harijan Welfare / Highways Act.",
                "ai_impact": "Omission of hearing invalidates subsequent Section 19(1) declaration.",
                "ai_action": "Preside over public hearing and record individual deposition statements.",
                "ai_evidence": "Gazette Notice No. LA-15(2)-Navalur Published 10-03-2026"
            },

            # LEGAL OFFICER (P26)
            {
                "username": "legal_officer",
                "title": "Madras High Court Hearing: WP No. 12948/2026 (Stay Petition)",
                "message": "Writ petition seeking stay on toll collection plaza commissioning listed for hearing before Hon'ble Division Bench on Thursday.",
                "priority": "CRITICAL",
                "category": "LEGAL",
                "source_module": "compliance",
                "source_record_id": "WP-HC-2026-12948",
                "project": proj_1,
                "dept": "Highways Secretariat (Legal)",
                "officer": "Adv. S. Duraisamy, SGP",
                "target_route": "#/compliance",
                "due_date": now + datetime.timedelta(days=2),
                "is_mandatory": True,
                "ai_score": 96.0,
                "ai_priority": True,
                "ai_reasoning": "Interim stay would prevent commercial operation of 6-lane toll corridor.",
                "ai_impact": "Revenue loss of ₹8.2 Lakhs/day and breach of concessionaire COD agreement.",
                "ai_action": "Finalize Special Government Pleader counter-affidavit with CE sign-off.",
                "ai_evidence": "High Court Cause List Entry for Court Hall No. 3 Item 18"
            },

            # CITIZEN GRIEVANCE OFFICER (P27)
            {
                "username": "citizen_officer",
                "title": "CM Helpline Grievance SLA Escalation: Waterlogging at OMR Puzhuthivakkam",
                "message": "Grievance ID CMM-2026-8941 regarding water stagnation near pedestrian underpass reached 10-day SLA limit. Escalated to Circle level.",
                "priority": "HIGH",
                "category": "CITIZEN_GRIEVANCE",
                "source_module": "citizen_services",
                "source_record_id": "GRV-CMM-2026-8941",
                "project": proj_1,
                "dept": "Highways Department (Public Relations)",
                "officer": "Tmt. M. Geetha, Grievance Officer",
                "target_route": "#/citizen-services",
                "due_date": now + datetime.timedelta(days=1),
                "is_mandatory": False,
                "ai_score": 83.0,
                "ai_priority": True,
                "ai_reasoning": "Chief Minister Special Cell grievance SLA breach triggers automated vigilance score deduction.",
                "ai_impact": "Public dissatisfaction and administrative performance rating reduction.",
                "ai_action": "Direct Assistant Engineer to deploy de-watering pumps and submit photographic closure report.",
                "ai_evidence": "CM Helpline Portal Ticket No. CMM-8941"
            }
        ]

        # Generate bulk notifications for remaining roles to reach 120+ total
        additional_templates = [
            ("PROJECT_UPDATE", "Monthly drone corridor photogrammetry orthomosaic update uploaded", "HIGH", 78.0),
            ("APPROVAL", "Environmental Management Plan (EMP) compliance verification sign-off", "MEDIUM", 65.0),
            ("DOCUMENT", "Official Government Order G.O.Ms.No. 48/2026 issued regarding revised land compensation multiplier", "INFO", 45.0),
            ("SYSTEM", "Automated GIS Cadastral Boundary Layer sync completed with Tamil Nilam portal", "INFO", 35.0),
            ("AI_INTELLIGENCE", "Predictive pavement maintenance algorithm flagged IRI roughness exceeding 3.8 m/km on Corridor 4", "HIGH", 84.0),
            ("FINANCE", "Treasury voucher reconciliation completed for Divisional Escrow Account", "LOW", 50.0),
            ("CONTRACTOR", "Equipment mobilization verification: Paver and Pneumatic Tyre Rollers certified on site", "MEDIUM", 62.0),
            ("QUALITY", "Precast girder stress-strain elongation test certificates approved", "MEDIUM", 68.0),
        ]

        count = 0
        for item in notifications_data:
            user_id = uid(item["username"], count)
            proj = item.get("project")
            notif = Notification(
                user_id=user_id,
                title=item["title"],
                message=item["message"],
                priority=item["priority"],
                category=item["category"],
                source_module=item["source_module"],
                source_record_id=item["source_record_id"],
                project_id=proj.id if proj else None,
                project_name=proj.title if proj else "Highways Infrastructure Project",
                department_name=item["dept"],
                responsible_officer_name=item["officer"],
                target_route=item["target_route"],
                is_read=False,
                is_saved=False,
                is_acknowledged=False,
                is_statutory_mandatory=item["is_mandatory"],
                due_date=item["due_date"],
                ai_importance_score=item["ai_score"],
                ai_is_priority_briefing=item["ai_priority"],
                ai_reasoning=item["ai_reasoning"],
                ai_potential_impact=item["ai_impact"],
                ai_required_action=item["ai_action"],
                ai_evidence_citation=item["ai_evidence"],
                ai_confidence_score=0.96,
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(hours=count * 3)
            )
            db.add(notif)
            count += 1

        # Add 90 more distributed across personas
        for i in range(95):
            u = users[i % len(users)]
            template = additional_templates[i % len(additional_templates)]
            p = projects[i % len(projects)] if projects else None
            is_priority = template[2] in ("CRITICAL", "HIGH")

            notif = Notification(
                user_id=u.id,
                title=f"{template[1]} [Ref: TN-{i+100}]",
                message=f"Official update for {p.title if p else 'Highways Network'}: {template[1]}. Verified by competent field authority.",
                priority=template[2],
                category=template[0],
                source_module="projects",
                source_record_id=f"REC-2026-{i+100}",
                project_id=p.id if p else None,
                project_name=p.title if p else "State Highways Corridor",
                department_name="Highways Department",
                responsible_officer_name="Highways Gazetted Officer",
                target_route="#/project-360",
                is_read=(i % 3 == 0),
                is_saved=(i % 5 == 0),
                is_acknowledged=False,
                is_statutory_mandatory=(i % 7 == 0),
                due_date=now + datetime.timedelta(days=(i % 10) + 1),
                ai_importance_score=template[3],
                ai_is_priority_briefing=is_priority and (i % 2 == 0),
                ai_reasoning="System operational notification generated from primary project activity log.",
                ai_potential_impact="Schedule delay if prerequisite inspection is not completed.",
                ai_required_action="Verify record on portal.",
                ai_evidence_citation=f"Inspection Ledger Entry #{i+200}",
                ai_confidence_score=0.94,
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(hours=(i + 1) * 2)
            )
            db.add(notif)

        db.commit()

        # 3. SEED CALENDAR EVENTS (30+ Events)
        calendar_events_data = [
            {
                "code": "EVT-2026-0001",
                "title": "Ministerial High-Level Highways Infrastructure Review",
                "category": "MINISTERIAL_REVIEW",
                "start": now.replace(hour=10, minute=30, second=0, microsecond=0) + datetime.timedelta(days=1),
                "end": now.replace(hour=13, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1),
                "venue": "Cabinet Conference Hall, 4th Floor, Main Secretariat, Fort St. George, Chennai",
                "is_virtual": False,
                "organiser": "minister",
                "project": proj_1,
                "agenda": "Review of CKICP, TNRSP-II, and Chennai Peripheral Ring Road projects. Resolution of interdepartmental utility shifting and land acquisition award delays.",
                "prep": "Chief Engineers must submit wing-wise physical and financial expenditure status as on 30th April 2026.",
                "docs": ["Cabinet_Briefing_Note_May2026.pdf", "Project_Physical_Progress_Matrix.xlsx", "Utility_Blocker_Executive_Summary.pdf"],
                "priority": "CRITICAL",
                "participants": ["minister", "secretary", "dir_gen", "chief_eng", "ckicp_pd", "tnrsp_pd", "finance_controller"]
            },
            {
                "code": "EVT-2026-0002",
                "title": "Secretary Interdepartmental Clearance Committee",
                "category": "SECRETARY_COORDINATION",
                "start": now.replace(hour=15, minute=0, second=0, microsecond=0) + datetime.timedelta(days=2),
                "end": now.replace(hour=17, minute=0, second=0, microsecond=0) + datetime.timedelta(days=2),
                "venue": "Committee Room No. 2, Secretariat / Cisco Webex Video Link",
                "is_virtual": True,
                "organiser": "secretary",
                "project": proj_1,
                "agenda": "Joint clearance review with Energy (TANGEDCO), Municipal Administration & Water Supply (TWAD Board), and Revenue Departments.",
                "prep": "Review pending utility deposit payment reconciliations.",
                "docs": ["Interdepartmental_Bottleneck_Register.pdf", "TANGEDCO_Joint_Site_Verification_Maps.pdf"],
                "priority": "HIGH",
                "participants": ["secretary", "chief_eng", "utility_officer", "la_officer", "revenue_officer", "forest_officer"]
            },
            {
                "code": "EVT-2026-0003",
                "title": "Chief Engineer Technical Sanction Committee",
                "category": "CHIEF_ENGINEER_MEETING",
                "start": now.replace(hour=11, minute=0, second=0, microsecond=0) + datetime.timedelta(days=3),
                "end": now.replace(hour=13, minute=30, second=0, microsecond=0) + datetime.timedelta(days=3),
                "venue": "Office of Chief Engineer (Projects), HRS Campus, Guindy, Chennai",
                "is_virtual": False,
                "organiser": "chief_eng",
                "project": proj_2,
                "agenda": "Scrutiny and technical sanction for Western Corridor grade separator foundation design variations.",
                "prep": "Detailed design drawings and proof consultant calculations to be tabled.",
                "docs": ["GAD_Structural_Design_Rev03.pdf", "Soil_Investigation_Report_Borehole_Guindy.pdf"],
                "priority": "HIGH",
                "participants": ["chief_eng", "se_chengalpattu", "ee_tambaram", "design_eng", "plan_eng"]
            },
            {
                "code": "EVT-2026-0004",
                "title": "Madras High Court: Writ Petition Hearing on Toll Concession",
                "category": "COURT_HEARING",
                "start": now.replace(hour=10, minute=30, second=0, microsecond=0) + datetime.timedelta(days=2),
                "end": now.replace(hour=12, minute=0, second=0, microsecond=0) + datetime.timedelta(days=2),
                "venue": "Court Hall No. 3, High Court of Madras, Chennai",
                "is_virtual": False,
                "organiser": "legal_officer",
                "project": proj_1,
                "agenda": "WP No. 12948/2026: Challenge to Toll Plaza Commissioning notification. SGP to argue on behalf of State.",
                "prep": "Keep verified affidavit and Gazette notifications ready for production before the Bench.",
                "docs": ["Counter_Affidavit_WP_12948.pdf", "Gazette_Toll_Fee_Notification.pdf"],
                "priority": "CRITICAL",
                "participants": ["legal_officer", "chief_eng", "ee_tambaram"]
            },
            {
                "code": "EVT-2026-0005",
                "title": "On-Site Engineering Quality Audit & Core Cutting Verification",
                "category": "QUALITY_INSPECTION",
                "start": now.replace(hour=9, minute=0, second=0, microsecond=0) + datetime.timedelta(days=4),
                "end": now.replace(hour=14, minute=0, second=0, microsecond=0) + datetime.timedelta(days=4),
                "venue": "Ch 32/400 to 45/800, Chennai Outer Ring Road / Tambaram Stretch",
                "is_virtual": False,
                "organiser": "qc_hrs_eng",
                "project": proj_1,
                "agenda": "Random core cutting for Bituminous Concrete layer density and thickness verification.",
                "prep": "Contractor shall provide calibrated core-cutting machine and water supply tanker.",
                "docs": ["Quality_Audit_Plan_May2026.pdf", "Mix_Design_Approval_Letter.pdf"],
                "priority": "HIGH",
                "participants": ["qc_hrs_eng", "ee_tambaram", "ae_saidapet", "contractor_lt"]
            },
            {
                "code": "EVT-2026-0006",
                "title": "Statutory Land Valuation Award Enquiry",
                "category": "LAND_ACQUISITION_DEADLINE",
                "start": now.replace(hour=11, minute=0, second=0, microsecond=0) + datetime.timedelta(days=5),
                "end": now.replace(hour=16, minute=0, second=0, microsecond=0) + datetime.timedelta(days=5),
                "venue": "Taluk Office Meeting Hall, Tambaram",
                "is_virtual": False,
                "organiser": "la_officer",
                "project": proj_1,
                "agenda": "Conduct of Section 19(1) award determination hearing for 42 survey numbers.",
                "prep": "Village map and guideline value registers must be placed on table.",
                "docs": ["Award_Notice_Tambaram_Village.pdf", "Guideline_Value_Reference_Sheet.pdf"],
                "priority": "HIGH",
                "participants": ["la_officer", "revenue_officer", "ee_tambaram"]
            },
            {
                "code": "EVT-2026-0007",
                "title": "Contractor Monthly Coordination & EOT Scrutiny",
                "category": "CONTRACTOR_MEETING",
                "start": now.replace(hour=14, minute=30, second=0, microsecond=0) + datetime.timedelta(days=6),
                "end": now.replace(hour=17, minute=0, second=0, microsecond=0) + datetime.timedelta(days=6),
                "venue": "Project Director Conference Room, TNRSP Building, Guindy",
                "is_virtual": False,
                "organiser": "tnrsp_pd",
                "project": proj_2,
                "agenda": "Scrutiny of Extension of Time (EOT) claims and monsoon work plan commitments.",
                "prep": "Contractors must submit revised Primavera P6 / MS Project baseline schedule.",
                "docs": ["Contractor_EOT_Claim_Justification.pdf", "Rainfall_Meteorological_Records.pdf"],
                "priority": "MEDIUM",
                "participants": ["tnrsp_pd", "contractor_lt", "contractor_pst", "pmc_consultant"]
            },
            {
                "code": "EVT-2026-0008",
                "title": "Citizen Grievance Redressal Adalat (Monthly Open House)",
                "category": "GRIEVANCE_REVIEW",
                "start": now.replace(hour=10, minute=0, second=0, microsecond=0) + datetime.timedelta(days=7),
                "end": now.replace(hour=13, minute=0, second=0, microsecond=0) + datetime.timedelta(days=7),
                "venue": "Collectorate Conference Hall, Kancheepuram",
                "is_virtual": False,
                "organiser": "citizen_officer",
                "project": proj_1,
                "agenda": "Public hearing on road safety, speed breakers, pedestrian access, and junction improvements.",
                "prep": "Print list of 24 open petitions received via CM Helpline.",
                "docs": ["CM_Helpline_Open_Petitions_Register.pdf"],
                "priority": "MEDIUM",
                "participants": ["citizen_officer", "ee_tambaram", "se_chengalpattu"]
            }
        ]

        # Add 22 more calendar events across the month to provide rich Month view
        categories_cycle = [
            ("SITE_INSPECTION", "Joint Site Inspection of ROB Pier Construction"),
            ("TENDER_DEADLINE", "Pre-Bid Meeting for Smart Highway ITS System Package"),
            ("BILL_DEADLINE", "Monthly Divisional Bill Scrutiny and Voucher Passing"),
            ("STATUTORY_DEADLINE", "Statutory Forest Clearance In-Principle Stage-I Review"),
            ("PROGRAMME_REVIEW", "World Bank Mid-Term Mission Progress Consultation"),
            ("TRAINING_EVENT", "Executive Training: Bridge Health Monitoring with Sensors"),
            ("DEPARTMENTAL_REVIEW", "Zonal Review: Chennai and Villupuram Highway Circles"),
            ("CIRCLE_DIVISIONAL_MEETING", "Divisional Engineers Monthly Coordination Meeting"),
            ("UTILITY_COORDINATION", "Joint Field Walk-Through with BSNL/Telecom Fiber Utilities"),
            ("REINSPECTION", "Follow-up Reinspection of Box Culvert Honeycombing Repair")
        ]

        for idx in range(24):
            day_offset = (idx * 2) - 10  # from 10 days ago to 38 days in future
            event_date = now + datetime.timedelta(days=day_offset)
            st = event_date.replace(hour=10 + (idx % 6), minute=0, second=0, microsecond=0)
            et = st + datetime.timedelta(hours=2)

            cat_spec = categories_cycle[idx % len(categories_cycle)]
            p = projects[idx % len(projects)] if projects else None

            code = f"EVT-2026-{idx+9:04d}"
            ev = CalendarEvent(
                event_code=code,
                title=f"{cat_spec[1]} [Circle-{idx % 4 + 1}]",
                event_category=cat_spec[0],
                start_time=st,
                end_time=et,
                time_zone="Asia/Kolkata",
                venue_or_url="Highways Divisional Office / Site Location",
                is_virtual=(idx % 3 == 0),
                organiser_user_id=users[idx % len(users)].id,
                organiser_name=users[idx % len(users)].full_name,
                organiser_role=users[idx % len(users)].role.name if users[idx % len(users)].role else "Official",
                related_project_id=p.id if p else None,
                related_project_name=p.title if p else "State Highway Work",
                related_department_name="Highways Department",
                agenda=f"Scheduled official review and field execution verification for {cat_spec[1]}.",
                preparation_notes="Carry approved drawings and previous inspection compliance reports.",
                required_documents_json=json.dumps(["Inspection_Notice.pdf", "Compliance_Checklist.pdf"]),
                priority="HIGH" if idx % 2 == 0 else "MEDIUM",
                status="CONCLUDED" if day_offset < 0 else "SCHEDULED",
                minutes_of_meeting="Official minutes recorded. Decisions signed by competent authority." if day_offset < 0 else None,
                decisions_summary="Compliance verified and approved for next execution stage." if day_offset < 0 else None,
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(days=15)
            )
            db.add(ev)
            db.flush()

            # Add 3 participants
            for p_idx in range(3):
                part_user = users[(idx + p_idx) % len(users)]
                db.add(CalendarParticipant(
                    event_id=ev.id,
                    user_id=part_user.id,
                    official_name=part_user.full_name,
                    official_role=part_user.role.name if part_user.role else "Official",
                    department_name="Highways Department",
                    invitation_status="ACCEPTED" if day_offset < 0 else ("ACCEPTED" if p_idx == 0 else "INVITED"),
                    attendance_status="ATTENDED" if day_offset < 0 else "PENDING"
                ))

            # Add Action items if concluded
            if day_offset < 0:
                act = MeetingActionItem(
                    event_id=ev.id,
                    action_code=f"ACT-{code}-01",
                    title=f"Compliance Submission on {cat_spec[1]}",
                    description=f"Action item issued during {cat_spec[1]} to rectify highlighted observations.",
                    responsible_user_id=users[(idx + 1) % len(users)].id,
                    responsible_officer_name=users[(idx + 1) % len(users)].full_name,
                    responsible_department_name="Highways Department",
                    priority="HIGH",
                    due_date=now + datetime.timedelta(days=5),
                    status="IN_PROGRESS",
                    escalation_level="NONE",
                    created_at=st
                )
                db.add(act)

        # Seed specific detailed events
        for item in calendar_events_data:
            org_user_id = uid(item["organiser"])
            proj = item["project"]
            ev = CalendarEvent(
                event_code=item["code"],
                title=item["title"],
                event_category=item["category"],
                start_time=item["start"],
                end_time=item["end"],
                time_zone="Asia/Kolkata",
                venue_or_url=item["venue"],
                is_virtual=item["is_virtual"],
                organiser_user_id=org_user_id,
                organiser_name=user_by_username[item["organiser"]].full_name if item["organiser"] in user_by_username else "Highways Officer",
                organiser_role=user_by_username[item["organiser"]].role.name if item["organiser"] in user_by_username and user_by_username[item["organiser"]].role else "Officer",
                related_project_id=proj.id if proj else None,
                related_project_name=proj.title if proj else "Highways Project",
                related_department_name="Highways & Minor Ports Department",
                agenda=item["agenda"],
                preparation_notes=item["prep"],
                required_documents_json=json.dumps(item["docs"]),
                priority=item["priority"],
                status="SCHEDULED",
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(days=3)
            )
            db.add(ev)
            db.flush()

            for p_username in item["participants"]:
                p_user = user_by_username.get(p_username)
                db.add(CalendarParticipant(
                    event_id=ev.id,
                    user_id=p_user.id if p_user else None,
                    official_name=p_user.full_name if p_user else p_username.replace("_", " ").title(),
                    official_role=p_user.role.name if p_user and p_user.role else "Official",
                    department_name="Highways Department",
                    invitation_status="ACCEPTED" if p_username == item["organiser"] else "INVITED",
                    attendance_status="PENDING"
                ))

            # Add follow-up action items
            action_item = MeetingActionItem(
                event_id=ev.id,
                action_code=f"ACT-{ev.event_code}-01",
                title=f"Prepare Cabinet Dossier on {ev.title}",
                description=f"Action item assigned to Chief Engineer to compile all supporting evidence.",
                responsible_user_id=uid("chief_eng"),
                responsible_officer_name="Er. S. Palanivel, CE (Projects)",
                responsible_department_name="Highways Department",
                priority="HIGH",
                due_date=now + datetime.timedelta(days=3),
                status="IN_PROGRESS",
                escalation_level="SECRETARY",
                created_at=now
            )
            db.add(action_item)

        db.commit()

    except Exception as e:
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()
