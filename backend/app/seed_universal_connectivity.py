"""
TN-HDOS Universal Connectivity & CM Decision Platform Seeder
Seeds:
1. Entity Relationships (120+ typed bidirectional links across all 26 entities)
2. CM Directions (High-priority executive directives issued from CMO)
3. Project Delay Events (Critical-path delay analysis without double-counting)
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import (
    EntityRelationship, RelationshipAuditLog, CMDirection, ProjectDelayEvent,
    Project, User, Contractor, Department, LegalCase, LandParcel, UtilityShiftingRecord,
    QualityFindingRecord, GovernmentDocumentRegistry
)

def seed_universal_connectivity(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        now = datetime.datetime.utcnow()

        # -------------------------------------------------------------
        # 1. SEED CM DIRECTIONS
        # -------------------------------------------------------------
        cm_user = db.query(User).filter(User.username == "cm").first()
        cm_id = cm_user.id if cm_user else 1

        existing_cmd = db.query(CMDirection).count()
        if existing_cmd == 0:
            directions_spec = [
                {
                    "direction_code": "CMD-2026-001",
                    "title": "Immediate Vacation of Interim Stay on Salem ROB & Bypass (WP 18492/2024)",
                    "project_id": 2,
                    "project_name": "Salem West Bypass Four-Laning & Railway Over Bridge (SH-86)",
                    "target_department": "Highways and Minor Ports / Legal Cell",
                    "assigned_officer_name": "Adv. S. Duraisamy",
                    "assigned_officer_designation": "Special Government Pleader (Highways)",
                    "priority": "CRITICAL",
                    "issue_summary": "High Court interim stay obtained by land owners on Survey No. 142/3 has halted super-structure erection for 185 days, risking Rs 89.2 Cr project escalation.",
                    "directive_text": "Hon'ble Chief Minister directed Special Government Pleader to file an urgent modification/vacation petition before the Division Bench within 5 days, presenting the public interest safety assessment and NHAI traffic study.",
                    "deadline_date": now + datetime.timedelta(days=5),
                    "status": "IN_PROGRESS",
                    "compliance_notes": "Counter affidavit sworn by Superintending Engineer (Salem); application listed before Bench for urgent hearing.",
                    "verified_by_cmo": True,
                    "escalation_level": 3
                },
                {
                    "direction_code": "CMD-2026-002",
                    "title": "Fast-Track Solatium Disbursement for Chengalpattu-Kanchipuram Corridor",
                    "project_id": 1,
                    "project_name": "Chengalpattu - Kanchipuram Four-Laning & Grade Separator (SH-58)",
                    "target_department": "Revenue and Disaster Management",
                    "assigned_officer_name": "Thiru K. Baskaran",
                    "assigned_officer_designation": "Special District Revenue Officer (LA)",
                    "priority": "HIGH",
                    "issue_summary": "14 title holders have not accepted original awards due to sub-division discrepancies, delaying ROW handover on Km 14/200 to 18/600.",
                    "directive_text": "CM instructed District Collector, Chengalpattu and Special DRO to conduct a special grievance camp on Saturday and disburse Section 19 compensation cheques without further delay.",
                    "deadline_date": now + datetime.timedelta(days=7),
                    "status": "PENDING_ACK",
                    "compliance_notes": None,
                    "verified_by_cmo": True,
                    "escalation_level": 2
                },
                {
                    "direction_code": "CMD-2026-003",
                    "title": "Coordinated Electrical Shutdown for 110kV Tower Relocation (SH-15)",
                    "project_id": 3,
                    "project_name": "Ooty - Gudalur Ghat Corridor Widening & Realignment (SH-15)",
                    "target_department": "Energy & TANGEDCO",
                    "assigned_officer_name": "Er. K. Saravanan",
                    "assigned_officer_designation": "Superintending Engineer (Distribution), TANGEDCO",
                    "priority": "HIGH",
                    "issue_summary": "4 HT electrical towers situated in critical slope stabilization zone require 6-hour power shutdown window for relocation.",
                    "directive_text": "CM approved Sunday scheduled power diversion and directed TANGEDCO and Divisional Engineer (Highways) to complete pole stringing in a single coordinated window.",
                    "deadline_date": now - datetime.timedelta(days=2),
                    "status": "COMPLIED",
                    "compliance_notes": "Shutdown successfully executed on Sunday 08:00 to 14:00 hrs. All 4 towers shifted and verified by Superintending Engineer.",
                    "compliance_date": now - datetime.timedelta(days=1),
                    "verified_by_cmo": True,
                    "escalation_level": 1
                },
                {
                    "direction_code": "CMD-2026-004",
                    "title": "Show-Cause Notice and Milestone Default Penalty on PST Engineering",
                    "project_id": 2,
                    "project_name": "Salem West Bypass Four-Laning & Railway Over Bridge (SH-86)",
                    "target_department": "Highways and Minor Ports Department",
                    "assigned_officer_name": "Er. S. Palanivel",
                    "assigned_officer_designation": "Chief Engineer (H), C&M Chennai Region",
                    "priority": "CRITICAL",
                    "issue_summary": "Contractor PST Engineering has achieved only 34% physical progress against 72% scheduled benchmark on Milestone 3.",
                    "directive_text": "CM directed Chief Engineer to issue a formal 14-day Cure Notice under Contract Clause 48.1 and withhold monthly running account bills until contractor augments paver equipment and bitumen crew.",
                    "deadline_date": now + datetime.timedelta(days=3),
                    "status": "IN_PROGRESS",
                    "compliance_notes": "Clause 48.1 Notice dispatched via Registered Post and e-mail. Contractor requested joint conciliation meeting on 12th Nov.",
                    "verified_by_cmo": True,
                    "escalation_level": 3
                },
                {
                    "direction_code": "CMD-2026-005",
                    "title": "Resolve Mobilization Advance Bank Guarantee Discrepancy",
                    "project_id": 4,
                    "project_name": "CKICP Cuddalore - Virudhachalam Corridor EPC-01",
                    "target_department": "Finance (Highways Branch)",
                    "assigned_officer_name": "Thiru R. Nagarajan",
                    "assigned_officer_designation": "Accounts Officer (Bills & Letters of Credit)",
                    "priority": "URGENT",
                    "issue_summary": "Bank Guarantee for Rs 12.4 Cr submitted by contractor is due for expiry in 15 days without revalidation confirmation from issuing bank.",
                    "directive_text": "CM instructed Accounts Officer to obtain formal revalidation from State Bank of India Industrial Finance Branch within 48 hours or invoke the BG to safeguard government funds.",
                    "deadline_date": now - datetime.timedelta(days=1),
                    "status": "OVERDUE",
                    "compliance_notes": "Bank confirmation awaited. Official reminder sent to Regional Manager.",
                    "verified_by_cmo": False,
                    "escalation_level": 2
                }
            ]

            for d in directions_spec:
                cmd = CMDirection(
                    direction_code=d["direction_code"],
                    title=d["title"],
                    project_id=d["project_id"],
                    project_name=d["project_name"],
                    target_department=d["target_department"],
                    assigned_officer_name=d["assigned_officer_name"],
                    assigned_officer_designation=d["assigned_officer_designation"],
                    priority=d["priority"],
                    issue_summary=d["issue_summary"],
                    directive_text=d["directive_text"],
                    deadline_date=d["deadline_date"],
                    status=d["status"],
                    compliance_notes=d.get("compliance_notes"),
                    compliance_date=d.get("compliance_date"),
                    verified_by_cmo=d.get("verified_by_cmo", False),
                    escalation_level=d.get("escalation_level", 1),
                    created_by_id=cm_id,
                    created_at=now - datetime.timedelta(days=3)
                )
                db.add(cmd)
            db.commit()
            print("Seeded 5 CM Directions.")

        # -------------------------------------------------------------
        # 2. SEED PROJECT DELAY EVENTS (CRITICAL-PATH ANALYSIS)
        # -------------------------------------------------------------
        existing_delays = db.query(ProjectDelayEvent).count()
        if existing_delays == 0:
            delay_specs = [
                # Project 2 (Salem Bypass - Total 185 days critical delay)
                {
                    "project_id": 2,
                    "event_title": "High Court Interim Stay on Approach Embankment Land Parcels",
                    "start_date": now - datetime.timedelta(days=185),
                    "end_date": now,
                    "delay_days": 140,
                    "is_critical_path": True,
                    "category": "COURT_STAY",
                    "primary_cause": "Writ Petition WP 18492/2024 filed challenging Tamil Nadu Highways Act Section 15(1) notification regarding compensation valuation.",
                    "contributing_causes": "Delay in filing counter-affidavit and lack of pre-notification valuation disclosure.",
                    "causing_party": "Private Landowners (K. Munusamy & 13 others)",
                    "causing_party_type": "PUBLIC_LITIGANT",
                    "resolving_authority": "Special Government Pleader (High Court) & Special DRO (LA)",
                    "formal_liability": "EXCUSABLE_NO_FAULT",
                    "eot_status": "APPROVED_WITHOUT_COST",
                    "eot_days_approved": 120,
                    "financial_exposure_cr": 4.2,
                    "public_service_impact": "Heavy freight vehicles forced through Salem inner city, causing 45-minute peak congestion and safety hazards.",
                    "corrective_action": "Vacation petition filed under Article 226; daily hearing listing sought.",
                    "target_resolution_date": now + datetime.timedelta(days=10),
                    "verification_status": "VERIFIED_OFFICIAL"
                },
                {
                    "project_id": 2,
                    "event_title": "TANGEDCO 110kV High-Tension Transmission Tower Relocation",
                    "start_date": now - datetime.timedelta(days=120),
                    "end_date": now - datetime.timedelta(days=30),
                    "delay_days": 45,
                    "is_critical_path": True,  # sequential continuation
                    "category": "UTILITY_SHIFTING",
                    "primary_cause": "Tower footing fell inside bridge abutment clear zone requiring full line re-stringing.",
                    "contributing_causes": "TANGEDCO material unavailability for narrow-base mono-pole structures.",
                    "causing_party": "TANGEDCO (Salem Distribution Circle)",
                    "causing_party_type": "UTILITY_AGENCY",
                    "resolving_authority": "Superintending Engineer (TANGEDCO) & SE (Highways)",
                    "formal_liability": "ESTABLISHED_DEPARTMENT",
                    "eot_status": "APPROVED_WITHOUT_COST",
                    "eot_days_approved": 45,
                    "financial_exposure_cr": 0.85,
                    "public_service_impact": "Approach ramp construction blocked until electrical clearance certified.",
                    "corrective_action": "Highways Department deposited Rs 1.12 Cr advance; work executed by emergency contractor.",
                    "target_resolution_date": now - datetime.timedelta(days=30),
                    "verification_status": "VERIFIED_OFFICIAL"
                },
                {
                    "project_id": 2,
                    "event_title": "Contractor Bitumen Plant Relocation & Slow Mobilization",
                    "start_date": now - datetime.timedelta(days=90),
                    "end_date": now - datetime.timedelta(days=45),
                    "delay_days": 45,
                    "is_critical_path": False,  # PARALLEL NON-CRITICAL DELAY (Does NOT add to project total)
                    "category": "CONTRACTOR_DEFAULT",
                    "primary_cause": "Contractor delayed setting up automated hot-mix plant in Omalur quarry site.",
                    "contributing_causes": "Local pollution control board consent to operate was delayed by 3 weeks.",
                    "causing_party": "PST Engineering Pvt Ltd",
                    "causing_party_type": "CONTRACTOR",
                    "resolving_authority": "Chief Engineer (C&M) & Divisional Engineer (Salem)",
                    "formal_liability": "UNDER_VERIFICATION",
                    "eot_status": "REJECTED",
                    "eot_days_approved": 0,
                    "financial_exposure_cr": 1.5,
                    "public_service_impact": "Negligible independent impact as site was concurrently blocked by High Court stay.",
                    "corrective_action": "Show-cause notice issued; plant now operational.",
                    "target_resolution_date": now - datetime.timedelta(days=40),
                    "verification_status": "UNDER_VERIFICATION"
                },

                # Project 1 (Chengalpattu - Kanchipuram 4-laning - Delayed 45 days)
                {
                    "project_id": 1,
                    "event_title": "Section 15(1) Land Acquisition Award Injunction in Walajabad Taluk",
                    "start_date": now - datetime.timedelta(days=45),
                    "end_date": now,
                    "delay_days": 45,
                    "is_critical_path": True,
                    "category": "LAND_ACQUISITION",
                    "primary_cause": "Private land owners dispute boundary survey regarding wet agricultural classification.",
                    "contributing_causes": "Revenue staff re-survey delayed due to election duty.",
                    "causing_party": "Revenue Department (Chengalpattu Revenue Unit)",
                    "causing_party_type": "GOVT_DEPARTMENT",
                    "resolving_authority": "Special DRO (Land Acquisition) & District Collector",
                    "formal_liability": "ESTABLISHED_DEPARTMENT",
                    "eot_status": "CLAIMED",
                    "eot_days_approved": 0,
                    "financial_exposure_cr": 16.2,
                    "public_service_impact": "Corridor bottleneck at Km 16/400 causing traffic choke points during rush hours.",
                    "corrective_action": "Re-survey completed; revised award statement submitted to District Collector for approval.",
                    "target_resolution_date": now + datetime.timedelta(days=15),
                    "verification_status": "VERIFIED_OFFICIAL"
                },

                # Project 3 (Ooty-Gudalur Ghat Road - Stalled 210 days)
                {
                    "project_id": 3,
                    "event_title": "Stage II Forest Clearance under Forest Conservation Act 1980",
                    "start_date": now - datetime.timedelta(days=210),
                    "end_date": now,
                    "delay_days": 210,
                    "is_critical_path": True,
                    "category": "FOREST_CLEARANCE",
                    "primary_cause": "Environmental Ministry regional office requested wildlife crossing underpass revisions.",
                    "contributing_causes": "Endangered Nilgiri Tahr habitat boundary survey requirements.",
                    "causing_party": "Ministry of Environment, Forest and Climate Change (MoEFCC)",
                    "causing_party_type": "STATUTORY_BODY",
                    "resolving_authority": "Principal Chief Conservator of Forests (PCCF) & Chief Engineer (Highways)",
                    "formal_liability": "EXCUSABLE_NO_FAULT",
                    "eot_status": "APPROVED_WITHOUT_COST",
                    "eot_days_approved": 180,
                    "financial_exposure_cr": 80.4,
                    "public_service_impact": "Severe monsoon landslide vulnerabilities unaddressed on 14 critical hair-pin bends.",
                    "corrective_action": "Revised GAD incorporating 2 wildlife canopy bridges submitted to MoEFCC Regional Empowered Committee.",
                    "target_resolution_date": now + datetime.timedelta(days=30),
                    "verification_status": "VERIFIED_OFFICIAL"
                }
            ]

            for d in delay_specs:
                pde = ProjectDelayEvent(
                    project_id=d["project_id"],
                    event_title=d["event_title"],
                    start_date=d["start_date"],
                    end_date=d["end_date"],
                    delay_days=d["delay_days"],
                    is_critical_path=d["is_critical_path"],
                    category=d["category"],
                    primary_cause=d["primary_cause"],
                    contributing_causes=d.get("contributing_causes"),
                    causing_party=d["causing_party"],
                    causing_party_type=d["causing_party_type"],
                    resolving_authority=d["resolving_authority"],
                    formal_liability=d["formal_liability"],
                    eot_status=d["eot_status"],
                    eot_days_approved=d["eot_days_approved"],
                    financial_exposure_cr=d["financial_exposure_cr"],
                    public_service_impact=d.get("public_service_impact"),
                    corrective_action=d.get("corrective_action"),
                    target_resolution_date=d.get("target_resolution_date"),
                    verification_status=d["verification_status"],
                    created_at=now
                )
                db.add(pde)
            db.commit()
            print("Seeded 5 Project Delay Events with critical path tagging.")

        # -------------------------------------------------------------
        # 3. SEED UNIVERSAL ENTITY RELATIONSHIPS (120+ TYPED LINKS)
        # -------------------------------------------------------------
        existing_rel = db.query(EntityRelationship).count()
        if existing_rel == 0:
            rel_specs = []
            rel_counter = 1

            # A. Political & Leadership Links
            rel_specs.extend([
                ("MINISTER", "7", "Thiru Aadhav Arjuna", "SUPERVISES", "DEPARTMENT", "1", "Highways and Minor Ports Department", "CABINET_GO", "G.O. Ms No. 1, Public Dept", "CABINET_ONLY"),
                ("MINISTER", "7", "Thiru Aadhav Arjuna", "OVERSEES", "PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "PORTFOLIO_REVIEW", "Review Order 2026", "INTERNAL"),
                ("MINISTER", "7", "Thiru Aadhav Arjuna", "OVERSEES", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "PORTFOLIO_REVIEW", "Review Order 2026", "INTERNAL"),
                ("MINISTER", "7", "Thiru Aadhav Arjuna", "CHAIRS", "COMMITTEE", "BOE", "Board of Engineers", "STATUTORY_ROLE", "TN Highways Code", "INTERNAL"),
                ("CHIEF_MINISTER", "41", "Thiru C. Joseph Vijay", "ISSUED_DIRECTION", "CM_DIRECTION", "1", "CMD-2026-001 (Salem ROB Stay Vacation)", "CMO_ORDER", "CM Directive 001", "INTERNAL"),
                ("CHIEF_MINISTER", "41", "Thiru C. Joseph Vijay", "ISSUED_DIRECTION", "CM_DIRECTION", "2", "CMD-2026-002 (Solatium Release)", "CMO_ORDER", "CM Directive 002", "INTERNAL"),
                ("CHIEF_MINISTER", "41", "Thiru C. Joseph Vijay", "ISSUED_DIRECTION", "CM_DIRECTION", "3", "CMD-2026-003 (TANGEDCO Shutdown)", "CMO_ORDER", "CM Directive 003", "INTERNAL"),
                ("CHIEF_MINISTER", "41", "Thiru C. Joseph Vijay", "ISSUED_DIRECTION", "CM_DIRECTION", "4", "CMD-2026-004 (PST Cure Notice)", "CMO_ORDER", "CM Directive 004", "INTERNAL"),
                ("CHIEF_MINISTER", "41", "Thiru C. Joseph Vijay", "MONITORS", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "ESCALATION_MONITORING", "State Cabinet Agenda Item 14", "CABINET_ONLY"),
                ("SECRETARY", "8", "Thiru Shunchonngam Jatak Chiru, IAS", "ADMINISTERS", "DEPARTMENT", "1", "Highways and Minor Ports Department", "SECRETARIAT_ORDER", "G.O. Rt No. 89", "INTERNAL"),
                ("SECRETARY", "8", "Thiru Shunchonngam Jatak Chiru, IAS", "SANCTIONED", "PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "AS_ORDER", "G.O. (Ms) No. 45/2024", "PUBLIC"),
                ("SECRETARY", "8", "Thiru Shunchonngam Jatak Chiru, IAS", "SANCTIONED", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "AS_ORDER", "G.O. (Ms) No. 112/2023", "PUBLIC"),
            ])

            # B. Project <-> Contractor & Engineer Links
            rel_specs.extend([
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "EXECUTED_BY", "CONTRACTOR", "1", "Larsen & Toubro Ltd (L&T)", "EPC_AGREEMENT", "Agr. No. 12/2024-25", "PUBLIC"),
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "ASSIGNED_TO", "ENGINEER", "3", "Er. P. Anandhan (Divisional Engineer)", "POSTING_ORDER", "G.O. (Rt) No. 142", "INTERNAL"),
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "SUPERVISED_BY", "ENGINEER", "2", "Er. M. Rajendran (Superintending Engineer)", "JURISDICTION", "Chengalpattu Circle", "INTERNAL"),
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "BLOCKED_BY", "LAND_PARCEL", "1", "Survey No. 14/2B Walajabad (0.84 Ha)", "REVENUE_AWARD", "Sec 15(1) Gazette", "RESTRICTED"),
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "AFFECTED_BY", "UTILITY_DEPENDENCY", "1", "TANGEDCO 33kV Line Shifting (18 Poles)", "SHIFTING_ESTIMATE", "EST-2025-UT-01", "INTERNAL"),
                ("PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "HAS_QUALITY_DEFECT", "QUALITY_NCR", "1", "Sub-base Bitumen Core Density Deficit (NCR-01)", "LAB_REPORT", "HRS/QC/2026/04", "INTERNAL"),

                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "EXECUTED_BY", "CONTRACTOR", "2", "PST Engineering Pvt Ltd", "EPC_AGREEMENT", "Agr. No. 04/2023-24", "PUBLIC"),
                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "ASSIGNED_TO", "ENGINEER", "2", "Er. S. Palanivel (Chief Engineer)", "SUPERVISION_ORDER", "HES-CE-001", "INTERNAL"),
                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "BLOCKED_BY", "LEGAL_CASE", "1", "WP 18492/2024 (Munusamy vs State of TN)", "HIGH_COURT_ORDER", "Interim Stay Order dt 14.05.2024", "RESTRICTED"),
                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "BLOCKED_BY", "UTILITY_DEPENDENCY", "2", "110kV High-Tension Transmission Tower Shifting", "TANGEDCO_DEPOSIT", "Deposit Sanction 89/2024", "INTERNAL"),
                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "ADDRESSED_BY", "CM_DIRECTION", "1", "CMD-2026-001 (Stay Vacation)", "CMO_DIRECTIVE", "CM Direction 001", "INTERNAL"),
                ("PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "ADDRESSED_BY", "CM_DIRECTION", "4", "CMD-2026-004 (PST Cure Notice)", "CMO_DIRECTIVE", "CM Direction 004", "INTERNAL"),

                ("PROJECT", "3", "Ooty - Gudalur Ghat Corridor Widening", "EXECUTED_BY", "CONTRACTOR", "1", "Larsen & Toubro Ltd (L&T)", "EPC_AGREEMENT", "Agr. No. 08/2024-25", "PUBLIC"),
                ("PROJECT", "3", "Ooty - Gudalur Ghat Corridor Widening", "BLOCKED_BY", "DEPARTMENT", "3", "Environment, Climate Change & Forests", "FCA_STATUTORY", "MoEFCC Stage II Clearance", "RESTRICTED"),
                ("PROJECT", "3", "Ooty - Gudalur Ghat Corridor Widening", "ADDRESSED_BY", "CM_DIRECTION", "3", "CMD-2026-003 (Coordinated Power Shutdown)", "CMO_DIRECTIVE", "CM Direction 003", "INTERNAL"),

                ("PROJECT", "4", "CKICP Cuddalore - Virudhachalam EPC-01", "FUNDED_BY", "AUTHORITY", "1", "Asian Development Bank (ADB)", "LOAN_AGREEMENT", "ADB Loan 3892-IND", "PUBLIC"),
                ("PROJECT", "4", "CKICP Cuddalore - Virudhachalam EPC-01", "ASSIGNED_TO", "OFFICER", "7", "Thiru D. Baskara Pandian, IAS (PD CKICP)", "GOVT_ORDER", "G.O. (Rt) No. 165", "INTERNAL"),
                ("PROJECT", "4", "CKICP Cuddalore - Virudhachalam EPC-01", "CROSSES", "AUTHORITY", "2", "Southern Railway (Zone 7)", "GAD_APPROVAL", "Railway GAD 45/2025", "INTERNAL"),
                ("PROJECT", "4", "CKICP Cuddalore - Virudhachalam EPC-01", "ADDRESSED_BY", "CM_DIRECTION", "5", "CMD-2026-005 (BG Revalidation)", "CMO_DIRECTIVE", "CM Direction 005", "INTERNAL"),
            ])

            # C. Legal, Land & Quality Links
            rel_specs.extend([
                ("LEGAL_CASE", "1", "WP 18492/2024 (Munusamy vs State)", "DEFENDED_BY", "OFFICER", "36", "Adv. S. Duraisamy (Special Govt Pleader)", "VAKALAT_NAMA", "HC Madras Registry", "CONFIDENTIAL"),
                ("LEGAL_CASE", "1", "WP 18492/2024 (Munusamy vs State)", "AFFECTS", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "CAUSE_TITLE", "WP 18492/2024", "RESTRICTED"),
                ("LEGAL_CASE", "1", "WP 18492/2024 (Munusamy vs State)", "TARGETS", "LAND_PARCEL", "2", "Survey No. 142/3 Omalur Bypass (1.24 Ha)", "PETITION_SCHEDULE", "Annexure A", "RESTRICTED"),
                ("CONTRACTOR", "2", "PST Engineering Pvt Ltd", "SUBJECT_TO", "CM_DIRECTION", "4", "CMD-2026-004 (Milestone Default Penalty)", "CONTRACT_CLAUSE", "Clause 48.1 Notice", "INTERNAL"),
                ("CONTRACTOR", "2", "PST Engineering Pvt Ltd", "RESPONSIBLE_FOR", "MILESTONE", "2", "Salem Package Milestone 3 (Pier Cap Casting)", "SCHEDULE_CONTRACT", "Key Date KD-3", "INTERNAL"),
                ("CONTRACTOR", "1", "Larsen & Toubro Ltd (L&T)", "RESPONSIBLE_FOR", "MILESTONE", "1", "Chengalpattu Package Milestone 2 (Bituminous Base)", "SCHEDULE_CONTRACT", "Key Date KD-2", "INTERNAL"),
                ("QUALITY_NCR", "1", "Sub-base Bitumen Core Density Deficit (NCR-01)", "INSPECTED_BY", "ENGINEER", "22", "Er. T. Soundararajan (HRS Guindy)", "TEST_RECORD", "HRS-TR-2026-88", "INTERNAL"),
                ("QUALITY_NCR", "1", "Sub-base Bitumen Core Density Deficit (NCR-01)", "ATTRIBUTABLE_TO", "CONTRACTOR", "1", "Larsen & Toubro Ltd (L&T)", "DEFECT_NOTICE", "Site Order Book Entry 45", "INTERNAL"),
            ])

            # D. Interdepartmental & Budgetary Links
            rel_specs.extend([
                ("DEPARTMENT", "2", "Revenue and Disaster Management", "PROVIDES_CLEARANCE", "PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "STATUTORY_ACT", "TN Highways Act 2001", "INTERNAL"),
                ("DEPARTMENT", "2", "Revenue and Disaster Management", "PROVIDES_CLEARANCE", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "STATUTORY_ACT", "TN Highways Act 2001", "INTERNAL"),
                ("DEPARTMENT", "4", "Energy & TANGEDCO", "REQUIRED_TO_SHIFT", "PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "WORK_DEPOSIT", "Deposit Receipt 102/2024", "INTERNAL"),
                ("DEPARTMENT", "4", "Energy & TANGEDCO", "REQUIRED_TO_SHIFT", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "WORK_DEPOSIT", "Deposit Receipt 114/2024", "INTERNAL"),
                ("DEPARTMENT", "3", "Environment, Climate Change & Forests", "REQUIRED_TO_CLEAR", "PROJECT", "3", "Ooty - Gudalur Ghat Corridor Widening", "FCA_STATUTE", "Forest Conservation Act", "RESTRICTED"),
                ("BUDGET", "CMRDP-2025-26", "Comprehensive Road Infrastructure Development Programme", "ALLOCATED_TO", "PROJECT", "1", "Chengalpattu - Kanchipuram Four-Laning", "BUDGET_SANCTION", "Demand 21, Subhead 102", "PUBLIC"),
                ("BUDGET", "CRIDP-2025-26", "State Highways Capital Works Budget", "ALLOCATED_TO", "PROJECT", "2", "Salem West Bypass Four-Laning & ROB", "BUDGET_SANCTION", "Demand 21, Subhead 103", "PUBLIC"),
            ])

            # Populate with additional systematic links to achieve 120+ connections
            for p_id in range(1, 13):
                p_code = f"PRJ-TN-2026-{p_id:03d}"
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "LOCATED_IN", "ZONE", "1", "Chennai Zone", "ADMIN_JURISDICTION", "HES Cadre Rules", "PUBLIC"))
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "AUDITED_BY", "OFFICER", "31", "Thiru P. Shanmugasundaram (Internal Auditor)", "STATUTORY_AUDIT", "AG Audit Plan 2026", "INTERNAL"))
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "ASSOCIATED_WITH", "CITIZEN_GRIEVANCE", str(p_id), f"Grievance Ticket CMG-2026-{p_id:04d}", "PORTAL_SYNC", "CM Special Cell Portal", "INTERNAL"))
                rel_specs.append(("ROAD", str(p_id), f"State Highway Corridor {p_id}", "CARRIES", "PROJECT", str(p_id), f"Highways Project {p_code}", "ASSET_REGISTRY", "TN Road Asset DB", "PUBLIC"))
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "GOVERNED_BY", "DOCUMENT", "1", "Tamil Nadu Highways Code Volume 1", "STATUTORY_REGULATION", "Law Dept Code 1976", "PUBLIC"))
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "COMPLIES_WITH", "DOCUMENT", "2", "Standard Data Book & Schedule of Rates (SSR 2025-26)", "ENGINEERING_SPEC", "BOE SSR 2025-26", "PUBLIC"))
                rel_specs.append(("PROJECT", str(p_id), f"Highways Project {p_code}", "DISCUSSED_IN", "DISCUSSION", str(p_id), f"Project Review Working Group {p_code}", "MESSAGING_MODULE", "Thread MSG-001", "INTERNAL"))

            for spec in rel_specs:
                src_type, src_id, src_name, rel_type, tgt_type, tgt_id, tgt_name, code_prefix, src_ref, tier = spec
                code = f"REL-2026-{rel_counter:04d}"
                rel = EntityRelationship(
                    relationship_code=code,
                    source_entity_type=src_type,
                    source_entity_id=str(src_id),
                    source_entity_name=src_name,
                    relationship_type=rel_type,
                    target_entity_type=tgt_type,
                    target_entity_id=str(tgt_id),
                    target_entity_name=tgt_name,
                    directionality="BIDIRECTIONAL",
                    valid_from=now - datetime.timedelta(days=120),
                    is_current=True,
                    verification_status="VERIFIED_OFFICIAL",
                    confidence_score=1.0,
                    source_reference=src_ref,
                    access_tier=tier,
                    created_by_user_id=1,
                    created_at=now - datetime.timedelta(days=60)
                )
                db.add(rel)
                rel_counter += 1

            db.commit()
            print(f"Seeded {len(rel_specs)} Universal Entity Relationships.")

    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_universal_connectivity()

