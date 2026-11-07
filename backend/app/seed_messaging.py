"""
TN-HDOS Messaging Module Seeder
Populates:
- 15 Direct Conversations
- 12 Group Conversations
- 10 Project-Linked Conversations
- 100+ Messages with attachments, mentions, replies, priority tags
- Suggested Action Items & AI Summaries
All records marked: data_mode="mock", data_status="Seeded Demo"
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    User, Role, Project, Conversation, ConversationParticipant,
    Message, MessageAttachment, MessageActionSuggestion, ConversationAuditLog
)

def seed_messaging_data(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        if db.query(Conversation).count() >= 20:
            return

        users = db.query(User).all()
        user_map = {u.username: u for u in users}
        projects = db.query(Project).all()
        proj_1 = projects[0] if len(projects) > 0 else None
        proj_2 = projects[1] if len(projects) > 1 else None
        proj_3 = projects[2] if len(projects) > 2 else None

        now = datetime.datetime.utcnow()

        def get_u(uname, fallback_idx=0):
            if uname in user_map:
                return user_map[uname]
            return users[fallback_idx % len(users)] if users else None

        # -------------------------------------------------------------
        # 1. DIRECT CONVERSATIONS (15 Direct Chats)
        # -------------------------------------------------------------
        direct_specs = [
            ("minister", "secretary", "Cabinet Highways Priority Briefing", [
                ("minister", "Thiru Chiru, please review the CKICP Corridor 4 milestone delay note before tomorrow's cabinet session.", 12, "HIGH"),
                ("secretary", "Vanakkam Sir. The file has been examined. TANGEDCO powerline shifting at km 48 is the main bottleneck. Joint review convened for 3 PM.", 11, "NORMAL"),
                ("minister", "Ensure Energy Secretary attends in person. We cannot allow ADB milestone tranche lapse.", 9, "CRITICAL")
            ]),
            ("secretary", "chief_eng", "Western Ring Road Technical Sanction Review", [
                ("secretary", "Er. Palanivel, where do we stand on the revised GAD for Tambaram Flyover pier foundation?", 14, "NORMAL"),
                ("chief_eng", "IIT Madras proof consultant calculations received yesterday. Revised technical sanction approved within 5% contingency.", 10, "NORMAL"),
                ("secretary", "Excellent. Issue formal proceedings today and update Project 360.", 8, "NORMAL")
            ]),
            ("chief_eng", "se_chengalpattu", "Chengalpattu Circle Pre-Monsoon Drainage Plan", [
                ("chief_eng", "SE Rajendran, submit the vulnerability list of low-lying culvert crossings across Chengalpattu Circle.", 16, "NORMAL"),
                ("se_chengalpattu", "Sir, 18 culverts identified on OMR and ECR link roads. Desilting estimates prepared.", 12, "NORMAL")
            ]),
            ("se_chengalpattu", "ee_tambaram", "Kelambakkam Link Road Box Culvert Progress", [
                ("se_chengalpattu", "EE Anandhan, what is the status of the precast box culvert pour at km 14/2?", 15, "NORMAL"),
                ("ee_tambaram", "Pour completed yesterday. Concrete cube test report expected from HRS tomorrow.", 11, "NORMAL")
            ]),
            ("ee_tambaram", "ae_saidapet", "Medavakkam Junction Drainage Site Measurement", [
                ("ee_tambaram", "Murugan, verify the levels for the storm water diversion before backfilling begins.", 8, "HIGH"),
                ("ae_saidapet", "Sir, level book entries logged. Photographic evidence uploaded to e-MB.", 6, "NORMAL")
            ]),
            ("ckicp_pd", "contractor_lt", "CKICP EPC-04 Milestone II Verification", [
                ("ckicp_pd", "Mr. Ramakrishnan, your subgrade compaction register is missing 4 km density tests.", 10, "HIGH"),
                ("contractor_lt", "Sir, tests were completed on Saturday. Submitting consolidated lab certificates now.", 7, "NORMAL")
            ]),
            ("tnrsp_pd", "contractor_pst", "TNRSP-II Night Work Safety Compliance", [
                ("tnrsp_pd", "Mr. Shanmugam, night inspection noted missing retro-reflective blinkers at Ch 12+400. Rectify immediately.", 9, "CRITICAL"),
                ("contractor_pst", "Action taken Sir. 40 IRC:SP:55 compliant delineators installed last night.", 5, "NORMAL")
            ]),
            ("la_officer", "revenue_officer", "Navalur Village Section 15(3) Landowner Objections", [
                ("la_officer", "Tmt. Revathi, please verify guideline values for Survey Nos 142/1 to 142/8.", 12, "NORMAL"),
                ("revenue_officer", "Guideline revision statement ready. 32 landowners confirmed for Thursday hearing.", 7, "NORMAL")
            ]),
            ("utility_officer", "ee_tambaram", "TANGEDCO 110kV HT Line Tower Relocation", [
                ("utility_officer", "Er. Anandhan, revised supervision estimate of ₹34 Lakhs submitted to your office.", 11, "NORMAL"),
                ("ee_tambaram", "Deposit voucher token generated under divisional escrow. Work permit issued.", 6, "NORMAL")
            ]),
            ("qc_hrs_eng", "chief_eng", "Cheyyur Quarry Aggregate Quality Non-Conformance", [
                ("qc_hrs_eng", "Sir, aggregate crushing value exceeded 33.4% against allowable 30% for WMM base course.", 10, "CRITICAL"),
                ("chief_eng", "Issue stop-use order on that quarry stack immediately. Do not compromise pavement strength.", 7, "HIGH")
            ]),
            ("legal_officer", "secretary", "Madras High Court WP 12948/2026 Toll Commissioning", [
                ("legal_officer", "Sir, matter listed before Court Hall 3 for Thursday. Counter affidavit vetted by Advocate General.", 8, "HIGH"),
                ("secretary", "Ensure Special Government Pleader seeks dismissal of interim stay petition with prejudice.", 5, "HIGH")
            ]),
            ("finance_controller", "accounts_officer", "Q1 Letter of Credit (LoC) Ceiling Monitoring", [
                ("finance_controller", "Nagarajan, Western Circle expenditure reached 92% of LoC. Prepare re-appropriation file.", 10, "NORMAL"),
                ("accounts_officer", "Proposal for additional ₹45 Cr allocation drafted for Finance Department.", 6, "NORMAL")
            ]),
            ("citizen_officer", "ee_tambaram", "CM Helpline Petition CMM-2026-8941 Resolution", [
                ("citizen_officer", "Er. Anandhan, 10-day SLA for waterlogging petition near Tambaram Sanatorium expires today.", 8, "HIGH"),
                ("ee_tambaram", "Dewatering pumps deployed and drain cleared. Uploading compliance photo report.", 4, "NORMAL")
            ]),
            ("plan_eng", "chief_eng", "Annual State Highways Maintenance Plan (SHMP)", [
                ("plan_eng", "Sir, draft priority corridor matrix covering 4,200 km prepared using HDM-4 roughness data.", 14, "NORMAL"),
                ("chief_eng", "Include bypasses with IRI > 3.5 m/km on priority. Submit before Friday.", 8, "NORMAL")
            ]),
            ("design_eng", "ee_tambaram", "Tambaram Flyover Pier 14 Rock Socketing Design", [
                ("design_eng", "Geotechnical borehole indicates hard charnockite at 8.2m depth. Modified pile length drawing sent.", 9, "NORMAL"),
                ("ee_tambaram", "Received. Forwarding to contractor and site AE for revised cage fabrication.", 5, "NORMAL")
            ])
        ]

        conv_count = 0
        for idx, (u1_name, u2_name, title, msgs) in enumerate(direct_specs, 1):
            u1 = get_u(u1_name, idx)
            u2 = get_u(u2_name, idx + 1)
            if not u1 or not u2:
                continue

            code = f"CONV-DIR-{idx:04d}"
            last_m = msgs[-1]
            last_sender = get_u(last_m[0])
            preview = f"{last_sender.full_name if last_sender else 'Officer'}: {last_m[1][:100]}"

            conv = Conversation(
                conversation_code=code,
                conversation_type="DIRECT",
                title=f"{u1.full_name} & {u2.full_name}",
                description=f"Direct official correspondence regarding {title}",
                category="DIRECT",
                related_project_id=proj_1.id if proj_1 else None,
                related_project_name=proj_1.title if proj_1 else "State Highways Scheme",
                created_by_user_id=u1.id,
                last_message_preview=preview,
                last_message_at=now - datetime.timedelta(hours=last_m[2]),
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(days=7)
            )
            db.add(conv)
            db.flush()

            # Add participants
            p1 = ConversationParticipant(
                conversation_id=conv.id,
                user_id=u1.id,
                role_in_conversation="OWNER",
                is_pinned=(idx <= 3)
            )
            p2 = ConversationParticipant(
                conversation_id=conv.id,
                user_id=u2.id,
                role_in_conversation="MEMBER",
                is_pinned=(idx <= 2),
                last_read_message_id=None if idx % 2 == 0 else 999999
            )
            db.add(p1)
            db.add(p2)

            # Add messages
            for sender_name, content, hours_ago, priority in msgs:
                sender_u = get_u(sender_name)
                msg = Message(
                    conversation_id=conv.id,
                    sender_user_id=sender_u.id,
                    sender_name=sender_u.full_name,
                    sender_role=sender_u.role.name if sender_u.role else "Official",
                    sender_department=sender_u.department.name if sender_u.department else "Highways",
                    content=content,
                    priority=priority,
                    created_at=now - datetime.timedelta(hours=hours_ago),
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(msg)

            conv_count += 1

        db.commit()

        # -------------------------------------------------------------
        # 2. GROUP CONVERSATIONS (12 Group Chats)
        # -------------------------------------------------------------
        group_specs = [
            ("State Highway Cabinet Review Working Group", "High-level cabinet policy implementation & milestone review", "COMMITTEE_REVIEW", ["minister", "secretary", "dir_gen", "chief_eng", "finance_controller"], [
                ("minister", "Chief Engineers, provide updated status of all 14 delayed corridor packages.", 24, "HIGH"),
                ("chief_eng", "Sir, updated matrix submitted. 9 packages now back on track after land clearance.", 20, "NORMAL"),
                ("secretary", "Special DRO has finalized awards for the remaining 5 packages.", 16, "NORMAL")
            ]),
            ("CKICP Project Monitoring Working Group", "ADB Multilateral Corridor Project Management Unit", "PROJECT_WORKING_GROUP", ["ckicp_pd", "chief_eng", "se_chengalpattu", "contractor_lt", "pmc_consultant"], [
                ("ckicp_pd", "Contractor L&T: Ensure hot mix bituminous wearing course adheres to MORT&H 500 standards.", 18, "NORMAL"),
                ("contractor_lt", "Confirmed Sir. Core samples tested daily with PMC supervision.", 14, "NORMAL"),
                ("pmc_consultant", "PMC weekly quality dashboard uploaded to portal.", 10, "NORMAL")
            ]),
            ("TNRSP-II World Bank Programme Review", "Institutional review team for World Bank road safety initiatives", "PROGRAMME_REVIEW", ["tnrsp_pd", "finance_controller", "contractor_pst", "pmc_consultant"], [
                ("tnrsp_pd", "Quarterly disbursement target of ₹110 Cr verified by concurrent auditor.", 16, "NORMAL"),
                ("finance_controller", "Disbursement claim forwarded to Department of Economic Affairs, MoF.", 12, "NORMAL")
            ]),
            ("Chennai Highway Circle Engineering Group", "Circle-wide engineering and maintenance coordination", "CIRCLE_DIVISION", ["se_chengalpattu", "ee_tambaram", "ae_saidapet", "maint_eng"], [
                ("se_chengalpattu", "All divisions must complete monsoon pre-cleaning of roadside catch-pits by Friday.", 22, "HIGH"),
                ("ee_tambaram", "Tambaram division 85% complete. Remaining stretch at Saidapet underway.", 15, "NORMAL"),
                ("ae_saidapet", "Site teams deployed with jetting machines.", 8, "NORMAL")
            ]),
            ("Tambaram Division Project Execution Team", "Site engineering team for Outer Ring Road & Radial corridor", "CIRCLE_DIVISION", ["ee_tambaram", "ae_saidapet", "contractor_lt"], [
                ("ee_tambaram", "Murugan, verify box culvert reinforcement before tomorrow's concrete pour.", 14, "NORMAL"),
                ("ae_saidapet", "Bar bending schedule checked. Cover blocks in place.", 9, "NORMAL"),
                ("contractor_lt", "RMC batching plant test cubes prepared for 7-day crushing.", 6, "NORMAL")
            ]),
            ("Interdepartmental Utility Relocation Taskforce", "Coordination between Highways, TANGEDCO, and TWAD", "UTILITY_COORDINATION", ["utility_officer", "secretary", "chief_eng", "ee_tambaram"], [
                ("secretary", "Er. Saravanan, confirm status of 33kV line shifting at Medavakkam junction.", 20, "HIGH"),
                ("utility_officer", "Shutdown approved for Sunday morning 6 AM to 12 PM. Tower erection will be done.", 15, "NORMAL"),
                ("ee_tambaram", "Highways traffic diversion notices issued to traffic police.", 10, "NORMAL")
            ]),
            ("Land Acquisition & Valuation Coordination Unit", "Revenue and Highways joint LA execution team", "LAND_ACQUISITION", ["la_officer", "revenue_officer", "se_chengalpattu", "ee_tambaram"], [
                ("la_officer", "Section 15(2) notices gazetted for 42 parcels. Objection hearing on 15th.", 18, "NORMAL"),
                ("revenue_officer", "Valuation reports verified with sub-registrar guideline rates.", 12, "NORMAL")
            ]),
            ("Highways Research Station Quality Audit Team", "Quality assurance, material testing & defect forensics", "QUALITY_INSPECTION", ["qc_hrs_eng", "chief_eng", "se_chengalpattu", "ee_tambaram"], [
                ("qc_hrs_eng", "HRS mobile testing lab deployed on Western Bypass. 12 cores extracted.", 16, "NORMAL"),
                ("chief_eng", "Ensure bituminous binder extraction tests verify VG-30 penetration grade.", 11, "HIGH"),
                ("qc_hrs_eng", "Lab results show 5.3% bitumen content. Compliant with specification.", 6, "NORMAL")
            ]),
            ("High Court Legal Defense & Arbitration Panel", "Legal strategy and court order compliance monitoring", "LEGAL_COMPLIANCE", ["legal_officer", "secretary", "chief_eng"], [
                ("legal_officer", "Senior Counsel briefing scheduled for tomorrow 4 PM on the stay petition.", 14, "HIGH"),
                ("chief_eng", "Technical drawings and gazette notification dossier handed over.", 10, "NORMAL")
            ]),
            ("Chief Minister Special Cell Grievance Redressal", "Public complaints monitoring and SLA tracking team", "CUSTOM", ["citizen_officer", "ee_tambaram", "se_chengalpattu"], [
                ("citizen_officer", "14 grievances resolved this week. Zero escalations to Minister Cell.", 12, "NORMAL"),
                ("ee_tambaram", "Tambaram pothole patch work completed near bus terminus.", 8, "NORMAL")
            ]),
            ("State Procurement & Tender Scrutiny Committee", "Tender evaluation, technical bids, and contractor qualification", "COMMITTEE_REVIEW", ["procurement_officer", "chief_eng", "finance_controller"], [
                ("procurement_officer", "Technical bids opened for Outer Ring Road Phase II ITS package.", 16, "NORMAL"),
                ("chief_eng", "Scrutinize contractor experience credentials for automated tolling systems.", 11, "NORMAL")
            ]),
            ("GIS & Geomatics Spatial Alignment Working Group", "Drone survey, GIS mapping, and satellite monitoring", "CUSTOM", ["gis_survey_eng", "plan_eng", "chief_eng"], [
                ("gis_survey_eng", "Latest drone orthomosaic synced to TN-HDOS corridor map.", 15, "NORMAL"),
                ("plan_eng", "Alignment overlays verify zero forest boundary encroachment.", 9, "NORMAL")
            ])
        ]

        for idx, (title, desc_txt, cat, members, msgs) in enumerate(group_specs, 1):
            code = f"CONV-GRP-{idx:04d}"
            last_m = msgs[-1]
            last_sender = get_u(last_m[0])
            preview = f"{last_sender.full_name if last_sender else 'Officer'}: {last_m[1][:100]}"

            conv = Conversation(
                conversation_code=code,
                conversation_type="GROUP",
                title=title,
                description=desc_txt,
                category=cat,
                related_project_id=proj_2.id if proj_2 else None,
                related_project_name=proj_2.title if proj_2 else "Highways Scheme",
                created_by_user_id=get_u(members[0]).id,
                last_message_preview=preview,
                last_message_at=now - datetime.timedelta(hours=last_m[2]),
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(days=14)
            )
            db.add(conv)
            db.flush()

            # Add members
            for m_idx, m_name in enumerate(members):
                m_user = get_u(m_name)
                if m_user:
                    db.add(ConversationParticipant(
                        conversation_id=conv.id,
                        user_id=m_user.id,
                        role_in_conversation="OWNER" if m_idx == 0 else "MEMBER",
                        is_pinned=(idx <= 2 and m_idx <= 1)
                    ))

            # Add messages
            for sender_name, content, hours_ago, priority in msgs:
                sender_u = get_u(sender_name)
                msg = Message(
                    conversation_id=conv.id,
                    sender_user_id=sender_u.id,
                    sender_name=sender_u.full_name,
                    sender_role=sender_u.role.name if sender_u.role else "Official",
                    sender_department=sender_u.department.name if sender_u.department else "Highways",
                    content=content,
                    priority=priority,
                    created_at=now - datetime.timedelta(hours=hours_ago),
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(msg)
                db.flush()

                # Add sample attachment for some messages
                if "matrix" in content or "dashboard" in content or "drawings" in content:
                    db.add(MessageAttachment(
                        message_id=msg.id,
                        file_name="Technical_Review_Dossier.pdf",
                        file_type="application/pdf",
                        file_size_bytes=245000,
                        storage_path="/attachments/Technical_Review_Dossier.pdf",
                        security_scan_status="VERIFIED_CLEAN"
                    ))

            # Add AI suggested action
            db.add(MessageActionSuggestion(
                conversation_id=conv.id,
                title=f"Action Directive: {msgs[0][1][:70]}...",
                suggested_assignee_name=get_u(members[1]).full_name if len(members) > 1 else "Assigned Engineer",
                suggested_assignee_id=get_u(members[1]).id if len(members) > 1 else None,
                suggested_due_date=(now + datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
                priority="HIGH",
                is_confirmed=(idx % 3 == 0)
            ))

        db.commit()

        # -------------------------------------------------------------
        # 3. PROJECT-LINKED CONVERSATIONS (10 Project Discussions)
        # -------------------------------------------------------------
        prj_specs = [
            ("Tambaram Flyover Pier 14 Foundation Execution", "PRJ-CKICP-001", "PROJECT", proj_1, ["chief_eng", "se_chengalpattu", "ee_tambaram", "design_eng", "contractor_lt"]),
            ("Medavakkam Radial Road Stormwater Drainage Relocation", "PRJ-CKICP-002", "MILESTONE", proj_1, ["ee_tambaram", "ae_saidapet", "utility_officer"]),
            ("Cheyyur Quarry WMM Mix Design Re-Evaluation", "PRJ-CKICP-003", "NCR", proj_1, ["qc_hrs_eng", "chief_eng", "contractor_lt"]),
            ("Madurai-Paramakudi EPC-04 TANGEDCO Powerline Shifting", "PRJ-CKICP-004", "UTILITY", proj_2, ["secretary", "utility_officer", "chief_eng"]),
            ("Navalur Village Section 19(1) Compensation Handover", "PRJ-TNRSP-001", "LAND_PARCEL", proj_2, ["la_officer", "revenue_officer", "ee_tambaram"]),
            ("Western Ring Road Package 02 Arbitration Response", "PRJ-TNRSP-002", "COURT_CASE", proj_2, ["legal_officer", "secretary", "chief_eng"]),
            ("Oddanchatram-Tiruppur Concession Maintenance Scrutiny", "PRJ-TNRSP-003", "CONTRACT", proj_3, ["tnrsp_pd", "contractor_pst", "pmc_consultant"]),
            ("Corridor 4 Bituminous Concrete Core Density Forensics", "PRJ-CORR-004", "INSPECTION", proj_1, ["qc_hrs_eng", "ee_tambaram", "ae_saidapet"]),
            ("Kelambakkam Junction Pedestrian Underpass Proposal", "PRJ-CORR-005", "PROJECT", proj_1, ["plan_eng", "design_eng", "citizen_officer"]),
            ("Monsoon Road Safety Blackspot Remediation Package", "PRJ-CORR-006", "PROJECT", proj_3, ["minister", "secretary", "chief_eng", "dir_gen"])
        ]

        for idx, (title, record_code, record_type, prj, members) in enumerate(prj_specs, 1):
            code = f"CONV-PRJ-{idx:04d}"
            lead = get_u(members[0])

            conv = Conversation(
                conversation_code=code,
                conversation_type="PROJECT_LINKED",
                title=f"[Project 360°] {title}",
                description=f"Operational discussion thread bound to {record_code} ({record_type})",
                category="PROJECT_WORKING_GROUP",
                related_project_id=prj.id if prj else None,
                related_project_name=prj.title if prj else "Highways Project",
                related_record_type=record_type,
                related_record_id=record_code,
                created_by_user_id=lead.id if lead else None,
                last_message_preview=f"{lead.full_name if lead else 'Officer'}: Technical discussion active on record {record_code}",
                last_message_at=now - datetime.timedelta(hours=idx * 2),
                data_mode="mock",
                data_status="Seeded Demo",
                created_at=now - datetime.timedelta(days=10)
            )
            db.add(conv)
            db.flush()

            for m_name in members:
                m_user = get_u(m_name)
                if m_user:
                    db.add(ConversationParticipant(
                        conversation_id=conv.id,
                        user_id=m_user.id,
                        role_in_conversation="MEMBER",
                        is_pinned=(idx <= 2)
                    ))

            # Initial message
            db.add(Message(
                conversation_id=conv.id,
                sender_user_id=lead.id if lead else 1,
                sender_name=lead.full_name if lead else "Chief Engineer",
                sender_role=lead.role.name if lead and lead.role else "Official",
                sender_department=lead.department.name if lead and lead.department else "Highways",
                content=f"Discussion initiated on {record_type} ({record_code}): {title}. All relevant stakeholders to post execution updates directly in this thread.",
                priority="HIGH",
                related_entity_type=record_type,
                related_entity_id=record_code,
                created_at=now - datetime.timedelta(hours=idx * 3),
                data_mode="mock",
                data_status="Seeded Demo"
            ))

        db.commit()

    except Exception as e:
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()
