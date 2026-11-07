import datetime
import json
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import (
    Department,
    Project,
    WorkPackage,
    User,
    CorrespondenceRecord,
    GovernmentFileRecord,
    FileMovementRecord,
    OfficeNoteRecord,
    GovernmentDecisionRecord,
    DigitalOfficeMeetingRecord,
    GovernmentActionItemRecord,
    DigitalDocumentRecord,
    DigitalOfficeAIFinding
)

def seed_digital_office_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check departments
        highways = db.query(Department).filter(Department.code == "HIGHWAYS").first()
        revenue = db.query(Department).filter(Department.code == "REVENUE").first()
        tangedco = db.query(Department).filter(Department.code == "TANGEDCO").first()
        twad = db.query(Department).filter(Department.code == "TWAD").first()
        forest = db.query(Department).filter(Department.code == "FOREST").first()
        railways = db.query(Department).filter(Department.code == "RAILWAYS").first()

        dept_id_hwy = highways.id if highways else 1
        dept_id_rev = revenue.id if revenue else 2
        dept_id_elec = tangedco.id if tangedco else 3
        dept_id_twad = twad.id if twad else 4
        dept_id_fst = forest.id if forest else 5
        dept_id_rlw = railways.id if railways else 6

        # Check projects
        all_projects = db.query(Project).all()
        p_ids = [p.id for p in all_projects] if all_projects else [1, 2, 3, 4]
        work_packages = db.query(WorkPackage).all()
        pkg_ids = [w.id for w in work_packages] if work_packages else [1, 2, 3]

        # -------------------------------------------------------------
        # 1. SEED 20 GOVERNMENT FILES (Including Section 16 Demo File)
        # -------------------------------------------------------------
        existing_files = {f.file_number: f for f in db.query(GovernmentFileRecord).all()}

        demo_file_num = "FILE-CKICP-2026-088"
        if demo_file_num not in existing_files:
            demo_file = GovernmentFileRecord(
                file_number=demo_file_num,
                subject="Sanction for Pykara LA Award Disbursement (₹0.85 Cr) & TANGEDCO 11kV Feeder Shutdown for CKICP SH-15 Ooty-Gudalur Ghat Widening",
                file_category="Land Acquisition & Valuation",
                originating_department_id=dept_id_hwy,
                current_department_id=dept_id_hwy,
                originating_officer_name="Er. K. Murugesan (Joint Chief Engineer Planning)",
                current_responsible_officer_name="Dr. D. Jagannathan, I.A.S. (Principal Secretary)",
                project_id=4,
                work_package_id=pkg_ids[0] if pkg_ids else 1,
                priority="CRITICAL",
                confidentiality_level="INTERNAL",
                current_workflow_stage="MINISTER_DECISION",
                pending_action="Ministerial Special Proceeding & Inter-Agency Coordination Order Issuance",
                due_date=datetime.datetime(2026, 2, 28),
                is_closed=False,
                document_reference="G.O.Ms.No. 412/Highways/2026",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(demo_file)
            db.commit()
            existing_files[demo_file_num] = demo_file
        else:
            demo_file = existing_files[demo_file_num]
            demo_file.project_id = 4
            demo_file.current_workflow_stage = "MINISTER_DECISION"
            demo_file.is_closed = False
            db.commit()

        file_categories = [
            ("Land Acquisition & Valuation", dept_id_rev, "Special DRO (LA)", "CRITICAL"),
            ("Utility Shifting Sanction", dept_id_elec, "SE TANGEDCO Distribution", "HIGH"),
            ("Revised Administrative Sanction (RAS)", dept_id_hwy, "Chief Engineer (C&M)", "HIGH"),
            ("Contractor Extension & Variation", dept_id_hwy, "Superintending Engineer", "MEDIUM"),
            ("Court Writ Compliance & Counter Affidavit", dept_id_rev, "Government Pleader", "CRITICAL"),
            ("Statutory NOC & Forest Diversion", dept_id_fst, "Conservator of Forests", "HIGH"),
            ("Railway GAD Approval & Safety Sanction", dept_id_rlw, "Deputy Chief Engineer Bridges SR", "MEDIUM"),
            ("Quality Audit Rectification Compliance", dept_id_hwy, "Joint Chief Engineer Quality", "MEDIUM")
        ]

        file_objs = [demo_file]
        for i in range(1, 20):
            f_num = f"FILE-HDOS-2026-{i:03d}"
            if f_num in existing_files:
                file_objs.append(existing_files[f_num])
                continue

            cat_tuple = file_categories[(i - 1) % len(file_categories)]
            p_assigned = p_ids[(i - 1) % len(p_ids)]
            pkg_assigned = pkg_ids[(i - 1) % len(pkg_ids)]

            stages = [
                "SUBMITTED", "SECTION_REVIEW", "DEPARTMENT_REVIEW", "SECRETARY_REVIEW",
                "MINISTER_DECISION", "APPROVED", "ACTION_ISSUED", "RETURNED_FOR_CLARIFICATION"
            ]
            stage = stages[(i - 1) % len(stages)]

            gf = GovernmentFileRecord(
                file_number=f_num,
                subject=f"Administrative & Engineering Processing for {cat_tuple[0]} under Package PKG-EPC-{i % 5 + 1:02d}",
                file_category=cat_tuple[0],
                originating_department_id=dept_id_hwy if i % 2 == 0 else cat_tuple[1],
                current_department_id=cat_tuple[1] if i % 3 == 0 else dept_id_hwy,
                originating_officer_name=f"Er. S. Narayanan (Divisional Engineer #{i})",
                current_responsible_officer_name=cat_tuple[2],
                project_id=p_assigned,
                work_package_id=pkg_assigned,
                priority=cat_tuple[3],
                confidentiality_level="CONFIDENTIAL" if i % 4 == 0 else "INTERNAL",
                current_workflow_stage=stage,
                pending_action=f"Verification of statutory documentation and departmental endorsement for Phase #{i % 4 + 1}",
                due_date=datetime.datetime(2026, 2, 10) + datetime.timedelta(days=i * 3),
                is_closed=(stage in ["APPROVED", "CLOSED"]),
                closure_date=datetime.datetime(2026, 2, 1) if stage in ["APPROVED", "CLOSED"] else None,
                closure_remarks=f"Formally cleared by competent authority with sanction order reference." if stage in ["APPROVED", "CLOSED"] else None,
                document_reference=f"G.O.(Ms) No.{300 + i}/Highways/2026",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(gf)
            db.commit()
            file_objs.append(gf)
            existing_files[f_num] = gf

        # -------------------------------------------------------------
        # 2. SEED 60 FILE MOVEMENT RECORDS
        # -------------------------------------------------------------
        if db.query(FileMovementRecord).count() < 60:
            # Demonstration File movements (Section 16)
            demo_moves = [
                (1, dept_id_hwy, "Highways C&M Ooty", "Er. R. Venkatesh (AEE)", dept_id_rev, "Revenue LA Ooty", "Thiru S. Meenakshisundaram (Special DRO)", "Requisition for immediate release of compensation voucher for Pykara village S.No. 142/2A"),
                (2, dept_id_rev, "Revenue LA Ooty", "Thiru S. Meenakshisundaram (Special DRO)", dept_id_hwy, "Highways Secretariat", "Dr. D. Jagannathan, I.A.S. (Principal Secretary)", "Submission of joint award valuation matrix and request for Treasury allocation clearance"),
                (3, dept_id_hwy, "Highways Secretariat", "Dr. D. Jagannathan, I.A.S. (Principal Secretary)", dept_id_hwy, "Minister Cabinet Suite", "Thiru E.V. Velu (Hon. Minister for Public Works)", "Placed before Hon. Minister for Special Interdepartmental Sanction order under Section 19(2)")
            ]
            for m_num, f_dept, f_dname, f_off, t_dept, t_dname, t_off, reason in demo_moves:
                mov = FileMovementRecord(
                    file_id=demo_file.id,
                    movement_number=m_num,
                    from_department_id=f_dept,
                    from_department_name=f_dname,
                    from_officer_name=f_off,
                    to_department_id=t_dept,
                    to_department_name=t_dname,
                    to_officer_name=t_off,
                    movement_date=datetime.datetime(2026, 1, 15) + datetime.timedelta(days=m_num * 5),
                    reason_for_movement=reason,
                    instruction_note=f"Priority government matter. Expedite file processing within 48 hours as civil works on Km 14+200 are halted.",
                    expected_action="Review and affix digital administrative endorsement.",
                    due_date=datetime.datetime(2026, 2, 1) + datetime.timedelta(days=m_num * 5),
                    acknowledgement_status="ACKNOWLEDGED",
                    received_date=datetime.datetime(2026, 1, 16) + datetime.timedelta(days=m_num * 5),
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(mov)
            db.commit()

            # Seed remaining movements across the 20 files
            current_mov_count = db.query(FileMovementRecord).count()
            for idx in range(current_mov_count + 1, 65):
                f_target = file_objs[(idx - 1) % len(file_objs)]
                mov = FileMovementRecord(
                    file_id=f_target.id,
                    movement_number=(idx % 3) + 1,
                    from_department_id=dept_id_hwy,
                    from_department_name="Highways and Minor Ports Department",
                    from_officer_name=f"Er. A. Rajagopalan (Divisional Engineer #{idx % 5})",
                    to_department_id=dept_id_rev if idx % 2 == 0 else dept_id_elec,
                    to_department_name="Revenue & Disaster Management" if idx % 2 == 0 else "TANGEDCO (Nilgiris EDC)",
                    to_officer_name="Special DRO (Land Acquisition)" if idx % 2 == 0 else "Superintending Engineer (TANGEDCO)",
                    movement_date=datetime.datetime(2026, 1, 5) + datetime.timedelta(days=idx),
                    reason_for_movement=f"Inter-departmental clearance review and verification for file {f_target.file_number}",
                    instruction_note="Please scrutinise schedule of quantities and convey formal departmental concurrence.",
                    expected_action="Affix concurrence and return file with verified estimate dockets.",
                    due_date=datetime.datetime(2026, 2, 1) + datetime.timedelta(days=idx),
                    acknowledgement_status="ACKNOWLEDGED" if idx % 4 != 0 else "RECEIVED",
                    received_date=datetime.datetime(2026, 1, 6) + datetime.timedelta(days=idx),
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(mov)
            db.commit()

        # -------------------------------------------------------------
        # 3. SEED 50 CORRESPONDENCE RECORDS (Incoming & Outgoing)
        # -------------------------------------------------------------
        existing_comms = {c.communication_code: c for c in db.query(CorrespondenceRecord).all()}

        # Section 16 Demo Incoming Communication
        demo_comm_code = "COMM-IN-2026-042"
        if demo_comm_code not in existing_comms:
            demo_comm = CorrespondenceRecord(
                communication_code=demo_comm_code,
                reference_number="ROC.LA.Nilgiris/2026/D1",
                communication_type="INCOMING",
                received_or_dispatch_date=datetime.datetime(2026, 1, 12),
                sender_or_recipient_org="District Collectorate & Revenue Division, Ooty",
                sender_or_recipient_name="Thiru S. Meenakshisundaram",
                sender_or_recipient_role="Special District Revenue Officer (LA, CKICP)",
                subject="Disbursement sanction for Pykara Village S.No. 142/2A (Award ₹0.85 Cr) & TANGEDCO 48 electrical pole relocation for SH-15",
                category="Statutory Clearance",
                department_id=dept_id_rev,
                project_id=4,
                work_package_id=pkg_ids[0] if pkg_ids else 1,
                priority="CRITICAL",
                confidentiality_level="INTERNAL",
                assigned_officer_name="Er. K. Murugesan (Joint Chief Engineer Planning)",
                status="FILE_CREATED",
                due_date=datetime.datetime(2026, 1, 28),
                document_reference="COLL-OOTY-LA-PROC-2026-01",
                government_file_id=demo_file.id,
                action_history_summary="12 Jan: Registered in inwards dak -> 14 Jan: Assigned to JCE Planning -> 15 Jan: E-File FILE-CKICP-2026-088 generated.",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(demo_comm)
            db.commit()
            existing_comms[demo_comm_code] = demo_comm

        comm_subjects = [
            ("INCOMING", "Request for urgent 11kV electrical feeder shutdown for SH-15 Ooty corridor", "Statutory Clearance", dept_id_elec, "TANGEDCO Nilgiris EDC", "Superintending Engineer", "CRITICAL"),
            ("INCOMING", "Application for Stage-I Forest Clearance along Mudumalai Buffer Corridor", "Statutory Clearance", dept_id_fst, "Forest Department, Gudalur Division", "District Forest Officer", "HIGH"),
            ("OUTGOING", "Sanction Order for ₹0.85 Cr Land Compensation under Section 19(1) of TN Highways Act", "Administrative Sanction", dept_id_hwy, "District Treasury, Udhagamandalam", "Treasury Officer", "CRITICAL"),
            ("INCOMING", "Joint Inspection Report for TWAD 400mm DI water pipeline shifting along ECR", "Interdepartmental Requisition", dept_id_twad, "TWAD Board Chengalpattu", "Executive Engineer", "MEDIUM"),
            ("OUTGOING", "Notice of Contractual Delay and Milestone Deduction Warning to EPC Contractor", "Contractor Claim", dept_id_hwy, "KCP Infra Fictional Ltd", "Project Director", "HIGH"),
            ("INCOMING", "Legislative Assembly Question No. 412 regarding Ooty-Gudalur road completion date", "Cabinet Memo", dept_id_hwy, "Tamil Nadu Legislative Assembly Secretariat", "Under Secretary", "CRITICAL"),
            ("OUTGOING", "Submission of Counter Affidavit in W.P. No. 11420 of 2024 before Hon. Madras High Court", "Statutory Clearance", dept_id_hwy, "Advocate General Office, Madras High Court", "Special Government Pleader", "HIGH"),
            ("INCOMING", "Public Grievance regarding dust pollution during rock blasting on SH-15 Km 14+800", "Public Grievance", dept_id_hwy, "Pykara Village Panchayat Union", "Panchayat President", "MEDIUM")
        ]

        current_comm_count = db.query(CorrespondenceRecord).count()
        for i in range(current_comm_count + 1, 55):
            c_code = f"COMM-HDOS-2026-{i:03d}"
            if c_code in existing_comms:
                continue

            spec = comm_subjects[(i - 1) % len(comm_subjects)]
            c_type = spec[0]
            f_assigned = file_objs[(i - 1) % len(file_objs)]
            p_assigned = p_ids[(i - 1) % len(p_ids)]

            comm = CorrespondenceRecord(
                communication_code=c_code,
                reference_number=f"TN/HD/COMM/{2026}/{i:04d}",
                communication_type=c_type,
                received_or_dispatch_date=datetime.datetime(2026, 1, 10) + datetime.timedelta(days=i),
                sender_or_recipient_org=spec[4],
                sender_or_recipient_name=f"Official Representative #{i}",
                sender_or_recipient_role=spec[5],
                subject=f"{spec[1]} [Ref #{i}]",
                category=spec[2],
                department_id=spec[3],
                project_id=p_assigned,
                work_package_id=pkg_ids[(i - 1) % len(pkg_ids)],
                priority=spec[6],
                confidentiality_level="CONFIDENTIAL" if i % 6 == 0 else "INTERNAL",
                assigned_officer_name="Er. K. Murugesan (Joint Chief Engineer Planning)",
                status="DISPATCHED" if c_type == "OUTGOING" else ("ACTION_TAKEN" if i % 2 == 0 else "RECEIVED"),
                due_date=datetime.datetime(2026, 2, 15) + datetime.timedelta(days=i),
                document_reference=f"DOC-ATTACH-{i:03d}-PDF",
                government_file_id=f_target.id if 'f_target' in locals() else f_assigned.id,
                dispatch_evidence_ref=f"SPEEDPOST-ACK-{i:04d}-TN" if c_type == "OUTGOING" else None,
                action_history_summary=f"Communication received and logged in official registry. File {f_assigned.file_number} linked for administrative processing.",
                data_mode="mock",
                data_status="Seeded Demo",
                source_type="synthetic"
            )
            db.add(comm)
            existing_comms[c_code] = comm
        db.commit()

        # -------------------------------------------------------------
        # 4. SEED 30 OFFICE NOTES
        # -------------------------------------------------------------
        if db.query(OfficeNoteRecord).count() < 30:
            # Demo Note (Section 16)
            demo_note = OfficeNoteRecord(
                file_id=demo_file.id,
                note_number=1,
                author_officer_name="Thiru S. Meenakshisundaram (Special DRO LA, Ooty)",
                author_designation="Special District Revenue Officer (Land Acquisition)",
                submission_date=datetime.datetime(2026, 1, 18),
                background_context="The widening and strengthening of SH-15 Ooty-Gudalur Ghat Corridor (Km 0/0 to 24/0) under CKICP Package PKG-EPC-01 requires 5,500 m² of land at Pykara Village.",
                factual_matrix="Award No. 04/2025 under Section 19(1) of TN Highways Act 2001 was pronounced on 18 Dec 2025 assessing compensation at ₹0.85 Cr for joint pattadars of S.No. 142/2A. Pattadars agreed to surrender possession upon Treasury disbursement. Additionally, 48 TANGEDCO 11kV electrical poles on the carriage edge require power shutdown to permit road formation.",
                financial_implications_cr=0.85,
                legal_and_compliance_implications="Statutory compliance governed by TN Act 34/2002 Section 19. Delay beyond 60 days attracts interest under Section 23.",
                project_milestone_impact="Blocks Embankment & Carriageway Formation on Km 14+200; package completion delayed by 48 days.",
                officer_recommendation="May place before Principal Secretary and Hon. Minister for immediate sanction of Treasury payment voucher and issuance of coordination order to TANGEDCO for Sunday feeder shutdown.",
                ai_advisory_note="AI Validation: Land parcel LA-SH15-01 is verified as single critical-path bottleneck halting ₹240 Cr corridor progress. Fast-tracking voucher disbursement eliminates ₹0.42 Cr idling escalation claims.",
                decision_statement="Approved for Ministerial Special Order issuance.",
                supporting_doc_ref="ROC.LA.Nilgiris/2026/D1 & TANGEDCO-SD-991",
                status="APPROVED",
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(demo_note)
            db.commit()

            # Seed 29 additional structured office notes across files
            for idx in range(2, 32):
                f_target = file_objs[(idx - 1) % len(file_objs)]
                note = OfficeNoteRecord(
                    file_id=f_target.id,
                    note_number=(idx % 3) + 1,
                    author_officer_name=f"Er. M. Senthil Kumar (Divisional Engineer #{idx})",
                    author_designation="Divisional Engineer (Highways C&M)",
                    submission_date=datetime.datetime(2026, 1, 20) + datetime.timedelta(days=idx),
                    background_context=f"Subject matter involves administrative appraisal for {f_target.file_category} on Highway Package PKG-EPC-{idx % 5 + 1}.",
                    factual_matrix=f"Field scrutiny conducted by Assistant Executive Engineer on {idx} Jan 2026 confirms that statutory norms and technical specifications are satisfied.",
                    financial_implications_cr=round(0.25 + (idx * 0.08), 2),
                    legal_and_compliance_implications="In conformity with Tamil Nadu Transparency in Tenders Act 1998 and MORTH 5th Revision standards.",
                    project_milestone_impact=f"Enables timely commencement of Sub-base Course and Culvert Reconstruction.",
                    officer_recommendation=f"Submitted for administrative approval and budget allocation under Head of Account 5054.",
                    ai_advisory_note=f"Cross-referencing confirms budget head has sufficient uncommitted outlay for current financial year.",
                    decision_statement="Recommended for administrative sanction." if idx % 2 == 0 else "Clarifications requested on material test dockets.",
                    supporting_doc_ref=f"DOC-NOTE-ATTACH-{idx:03d}",
                    status="APPROVED" if idx % 2 == 0 else "SUBMITTED",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(note)
            db.commit()

        # -------------------------------------------------------------
        # 5. SEED 15 GOVERNMENT DECISION RECORDS
        # -------------------------------------------------------------
        existing_decs = {d.decision_code: d for d in db.query(GovernmentDecisionRecord).all()}

        demo_dec_code = "DEC-MIN-2026-021"
        if demo_dec_code not in existing_decs:
            demo_dec = GovernmentDecisionRecord(
                decision_code=demo_dec_code,
                file_id=demo_file.id,
                decision_authority="MINISTER",
                decision_date=datetime.datetime(2026, 1, 22),
                decision_category="Land Acquisition & Utility Sanction",
                decision_statement="Ministerial Special Coordination Sanction: Accorded administrative sanction for immediate Treasury release of ₹0.85 Cr to Pykara Village pattadars (S.No. 142/2A). Further directed TANGEDCO to execute 6-hour power shutdown on Sunday for 48 electrical poles shifting.",
                approved_action="1. Special DRO Ooty to disburse compensation voucher within 5 days.\n2. SE TANGEDCO Nilgiris to deploy line crews and complete pole relocation away from carriage edge by 28 Feb 2026.\n3. AEE Highways to certify physical possession handover upon clearing.",
                responsible_department_id=dept_id_rev,
                responsible_department_name="Revenue & Disaster Management Department",
                responsible_officer_name="Thiru S. Meenakshisundaram (Special DRO, Ooty)",
                due_date=datetime.datetime(2026, 2, 15),
                supporting_doc_ref="G.O.Ms.No. 412/Highways/2026",
                implementation_status="IN_PROGRESS",
                compliance_evidence_ref="TREASURY-CHQ-2026-4412",
                closure_date=None,
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(demo_dec)
            db.commit()
            existing_decs[demo_dec_code] = demo_dec

        dec_specs = [
            ("DEC-SEC-2026-011", "PRINCIPAL_SECRETARY", "Technical Sanction & Scope Revision", "Approved revised scope for Anna Nagar Roundtana flyover ramp integration under G.O. Ms. 85.", dept_id_hwy, "Highways and Minor Ports Department", "Er. R. Chandrasekhar (Chief Engineer C&M)", "COMPLIED"),
            ("DEC-MIN-2026-022", "MINISTER", "Contractual Extension with Liquidated Damages", "Approved 60-day time extension for Kollidam Bridge reconstruction with 2.5% LD waiver based on unseasonal flood records.", dept_id_hwy, "Highways and Minor Ports Department", "Er. K. Murugesan (Joint Chief Engineer)", "IN_PROGRESS"),
            ("DEC-SEC-2026-012", "PRINCIPAL_SECRETARY", "Utility Relocation Cost Concurrence", "Sanctioned ₹0.55 Cr revised estimate for TWAD Board 400mm DI water pipeline relocation along ECR corridor.", dept_id_twad, "TWAD Board", "Executive Engineer TWAD Chengalpattu", "COMPLIED"),
            ("DEC-MIN-2026-023", "MINISTER", "Forest Diversion Mitigation Funds", "Accorded sanction for ₹1.20 Cr compensatory afforestation deposit to Tamil Nadu Forest Department.", dept_id_fst, "Department of Environment & Forests", "District Forest Officer, Ooty", "PENDING"),
            ("DEC-SEC-2026-013", "PRINCIPAL_SECRETARY", "Railway General Arrangement Drawing (GAD)", "Approved cost-sharing agreement of ₹14.5 Cr with Southern Railway for 4-lane ROB at Arakkonam.", dept_id_rlw, "Southern Railway", "Chief Bridge Engineer, SR", "IN_PROGRESS")
        ]

        current_dec_count = db.query(GovernmentDecisionRecord).count()
        for idx in range(current_dec_count + 1, 16):
            spec = dec_specs[(idx - 1) % len(dec_specs)]
            d_code = f"DEC-GOV-2026-{idx:03d}"
            if d_code in existing_decs:
                continue

            f_target = file_objs[(idx - 1) % len(file_objs)]
            dec = GovernmentDecisionRecord(
                decision_code=d_code,
                file_id=f_target.id,
                decision_authority=spec[1],
                decision_date=datetime.datetime(2026, 1, 15) + datetime.timedelta(days=idx * 2),
                decision_category=spec[2],
                decision_statement=f"{spec[3]} (Governed under File {f_target.file_number})",
                approved_action=f"Executive implementation to be completed within stipulated timeline; compliance docket to be furnished to Secretariat.",
                responsible_department_id=spec[4],
                responsible_department_name=spec[5],
                responsible_officer_name=spec[6],
                due_date=datetime.datetime(2026, 2, 28) + datetime.timedelta(days=idx),
                supporting_doc_ref=f"DOC-DEC-ORDER-{idx:03d}",
                implementation_status=spec[7],
                compliance_evidence_ref=f"COMPL-CERT-{idx:03d}" if spec[7] == "COMPLIED" else None,
                closure_date=datetime.datetime(2026, 2, 5) if spec[7] == "COMPLIED" else None,
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(dec)
            existing_decs[d_code] = dec
        db.commit()

        # -------------------------------------------------------------
        # 6. SEED 10 DIGITAL OFFICE MEETINGS
        # -------------------------------------------------------------
        if db.query(DigitalOfficeMeetingRecord).count() < 10:
            meeting_specs = [
                ("MTG-2026-001", "High-Level Interdepartmental Coordination Committee on SH-15 Ooty-Gudalur Ghat Corridor", "MINISTERIAL_REVIEW", datetime.datetime(2026, 1, 20, 11, 0), "Thiru E.V. Velu (Minister for Public Works)", ["Highways and Minor Ports", "Revenue and Disaster Management", "TANGEDCO", "Forest and Environment"], [4], "Review of Pykara Land Acquisition compensation release and 48 TANGEDCO electrical pole shifting.", "Hon. Minister directed Revenue to issue compensation cheques within 5 days and instructed TANGEDCO to schedule power shutdown on upcoming Sunday.", "1. Treasury disbursement release\n2. Sunday power shutdown clearance\n3. Bi-weekly progress review"),
                ("MTG-2026-002", "Statewide Project Review Meeting (SPRM) on CKICP & TNRSP-II Corridors", "SECRETARY_COORDINATION", datetime.datetime(2026, 1, 25, 15, 0), "Dr. D. Jagannathan, I.A.S. (Principal Secretary)", ["Highways and Minor Ports", "Revenue", "Police Traffic"], [1, 2, 4, 5], "Quarterly review of physical and financial progress across all 16 EPC packages.", "Noted 88% overall progress on civil formation; flagged material quality compliance on ghat packages.", "1. Rectification of bituminous binder deficiency\n2. Traffic diversion order issuance"),
                ("MTG-2026-003", "Standing Finance Committee (SFC) Meeting on Revised Administrative Sanctions", "STATUTORY_COMMITTEE", datetime.datetime(2026, 1, 28, 11, 30), "Finance Secretary (Expenditure) & Principal Secretary Highways", ["Highways", "Finance Department"], [1, 2, 3], "Scrutiny of 3 cost variation proposals for grade separators and Kollidam bridge.", "SFC recommended approval of Revised Administrative Sanction up to 10% ceiling.", "1. Issue GO for revised financial sanction\n2. Update Project 360 financial ledger"),
                ("MTG-2026-004", "Joint Highways - Southern Railway ROB/RUB Progress Review", "INTERDEPARTMENTAL_CLEARANCE", datetime.datetime(2026, 2, 2, 14, 30), "Chief Bridge Engineer Southern Railway & Chief Engineer (H) Projects", ["Highways", "Southern Railway"], [6], "Expediting GAD clearance and CRS safety inspection for 4 railway over-bridges.", "Agreed upon revised GAD alignment for Arakkonam yard crossing.", "1. Affix joint signatures on approved GAD\n2. Contractor mobilization at railway boundary"),
                ("MTG-2026-005", "Quarterly Quality Assurance & Laboratory Audit Review", "PROJECT_MONITORING", datetime.datetime(2026, 2, 4, 10, 0), "Director, Highways Research Station (HRS Guindy)", ["Highways Research Station", "Chief Engineer C&M"], [1, 4], "Review of binder extraction, cube compressive strength and bituminous density across circles.", "HRS team mandated to conduct unannounced core extraction on SH-15 corridor.", "1. Deliver core test results within 7 days\n2. Hold payment for non-compliant batch")
            ]

            for m_code, title, cat, m_date, chair, depts, prjs, agenda, mins, decs in meeting_specs:
                m = DigitalOfficeMeetingRecord(
                    meeting_code=m_code,
                    title=title,
                    meeting_category=cat,
                    meeting_date=m_date,
                    chairperson_name=chair,
                    departments_represented_json=json.dumps(depts),
                    related_project_ids_json=json.dumps(prjs),
                    agenda_summary=agenda,
                    minutes_summary=mins,
                    decisions_taken_summary=decs,
                    status="MINUTES_CIRCULATED",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(m)

            # Seed 5 more to reach 10
            for idx in range(6, 11):
                m = DigitalOfficeMeetingRecord(
                    meeting_code=f"MTG-2026-{idx:03d}",
                    title=f"Monthly Divisional Review & Field Coordination Meeting #{idx}",
                    meeting_category="PROJECT_MONITORING",
                    meeting_date=datetime.datetime(2026, 2, 5) + datetime.timedelta(days=idx),
                    chairperson_name="Superintending Engineer (Highways C&M)",
                    departments_represented_json=json.dumps(["Highways and Minor Ports Department", "Revenue"]),
                    related_project_ids_json=json.dumps([p_ids[(idx - 1) % len(p_ids)]]),
                    agenda_summary="Review of monsoon damages, pothole restoration, and road safety signage installation.",
                    minutes_summary="Divisional engineers instructed to finish pre-monsoon road safety measures by end of month.",
                    decisions_taken_summary="Work orders issued for cold-mix patch work and solar blinker installation.",
                    status="CONCLUDED",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(m)
            db.commit()

        # -------------------------------------------------------------
        # 7. SEED 30 GOVERNMENT ACTION ITEMS
        # -------------------------------------------------------------
        existing_acts = {a.action_code: a for a in db.query(GovernmentActionItemRecord).all()}

        demo_act_1 = "ACT-OFF-081"
        if demo_act_1 not in existing_acts:
            act1 = GovernmentActionItemRecord(
                action_code=demo_act_1,
                origin_type="DECISION",
                origin_id=demo_dec.id,
                description="Disburse compensation payment voucher of ₹0.85 Cr to Pykara Village pattadars (S.No. 142/2A) via District Treasury Ooty.",
                responsible_department_id=dept_id_rev,
                responsible_department_name="Revenue & Disaster Management Department",
                responsible_officer_name="Thiru S. Meenakshisundaram (Special DRO LA, Ooty)",
                priority="CRITICAL",
                due_date=datetime.datetime(2026, 2, 15),
                status="IN_PROGRESS",
                progress_pct=60.0,
                evidence_ref="TREASURY-TOKEN-4412",
                escalation_level="SECRETARY",
                closure_remarks="Treasury voucher prepared and awaiting final digital signature from District Treasury Officer.",
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(act1)
            existing_acts[demo_act_1] = act1

        demo_act_2 = "ACT-OFF-082"
        if demo_act_2 not in existing_acts:
            act2 = GovernmentActionItemRecord(
                action_code=demo_act_2,
                origin_type="DECISION",
                origin_id=demo_dec.id,
                description="Deploy line crews and execute 6-hour Sunday power shutdown to relocate 48 TANGEDCO 11kV electrical poles on SH-15 carriage edge.",
                responsible_department_id=dept_id_elec,
                responsible_department_name="Tamil Nadu Generation and Distribution Corporation (TANGEDCO)",
                responsible_officer_name="Er. M. Rajavel (Superintending Engineer, TANGEDCO Nilgiris EDC)",
                priority="CRITICAL",
                due_date=datetime.datetime(2026, 2, 28),
                status="IN_PROGRESS",
                progress_pct=25.0,
                evidence_ref="TANGEDCO-SD-CIRCULAR-09",
                escalation_level="SECRETARY",
                closure_remarks="Shutdown circular issued to public; line shifting materials staged at Pykara site.",
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(act2)
            existing_acts[demo_act_2] = act2
        db.commit()

        # Seed 28 more action items
        current_act_count = db.query(GovernmentActionItemRecord).count()
        for idx in range(current_act_count + 1, 35):
            a_code = f"ACT-OFF-{idx:03d}"
            if a_code in existing_acts:
                continue

            statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "DEFERRED"]
            st = statuses[(idx - 1) % len(statuses)]
            prog = 100.0 if st == "COMPLETED" else (50.0 if st == "IN_PROGRESS" else 0.0)

            act = GovernmentActionItemRecord(
                action_code=a_code,
                origin_type="FILE" if idx % 2 == 0 else "MEETING",
                origin_id=file_objs[(idx - 1) % len(file_objs)].id,
                description=f"Action item #{idx}: Furnish verified compliance dockets and technical test certificates for Package PKG-EPC-{idx % 5 + 1}.",
                responsible_department_id=dept_id_hwy if idx % 2 == 0 else dept_id_rev,
                responsible_department_name="Highways and Minor Ports Department" if idx % 2 == 0 else "Revenue & Disaster Management",
                responsible_officer_name=f"Er. K. Sivakumar (Divisional Engineer #{idx})",
                priority="CRITICAL" if idx % 5 == 0 else ("HIGH" if idx % 2 == 0 else "MEDIUM"),
                due_date=datetime.datetime(2026, 2, 20) + datetime.timedelta(days=idx),
                status=st,
                progress_pct=prog,
                evidence_ref=f"DOC-ACTION-CERT-{idx:03d}" if st == "COMPLETED" else None,
                escalation_level="SECRETARY" if idx % 6 == 0 else "NONE",
                closure_remarks="Fully complied and verified by competent authority." if st == "COMPLETED" else None,
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(act)
            existing_acts[a_code] = act
        db.commit()

        # -------------------------------------------------------------
        # 8. SEED 50 DIGITAL DOCUMENTS (Evidence Repository)
        # -------------------------------------------------------------
        existing_docs = {d.document_code: d for d in db.query(DigitalDocumentRecord).all()}

        doc_categories = [
            ("Government Order", "G.O.(Ms) No. 412/Highways/2026", "Highways and Minor Ports Department", "INTERNAL"),
            ("Administrative Sanction", "AS-2026-HWY-088", "Government of Tamil Nadu", "INTERNAL"),
            ("Technical Sanction", "TS-CE-2026-114", "Chief Engineer (H) C&M", "INTERNAL"),
            ("Joint Inspection Report", "JIR-TANGEDCO-HWY-412", "Highways & TANGEDCO Joint Team", "INTERNAL"),
            ("Treasury Voucher", "TREASURY-VOUCHER-OOTY-4412", "District Treasury Ooty", "CONFIDENTIAL"),
            ("Court Order", "WP-11420-2024-INTERIM", "Hon. High Court of Madras", "INTERNAL"),
            ("Meeting Minutes", "MOM-SPRM-2026-01", "Highways Secretariat", "INTERNAL"),
            ("MORTH Test Certificate", "LAB-HRS-2026-CUBE-08", "Highways Research Station Guindy", "INTERNAL")
        ]

        # Section 16 Demo Document
        demo_doc_code = "DOC-GO-MS-2026-412"
        if demo_doc_code not in existing_docs:
            demo_doc = DigitalDocumentRecord(
                document_code=demo_doc_code,
                title="G.O.(Ms) No. 412: Special Sanction for Compensation Release (Pykara S.No. 142/2A) and Feeder Shutdown on SH-15",
                category="Government Order",
                reference_number="G.O.(Ms) No. 412, Highways and Minor Ports (HN1)",
                document_date=datetime.datetime(2026, 1, 23),
                issuing_authority="Principal Secretary to Government",
                project_id=4,
                work_package_id=pkg_ids[0] if pkg_ids else 1,
                related_file_id=demo_file.id,
                version="1.0",
                storage_path="/documents/orders/GO_MS_412_HIGHWAYS_2026.pdf",
                uploading_user="sec_highways",
                confidentiality_level="INTERNAL",
                verification_status="Verified",
                checksum_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(demo_doc)
            db.commit()
            existing_docs[demo_doc_code] = demo_doc

        current_doc_count = db.query(DigitalDocumentRecord).count()
        for idx in range(current_doc_count + 1, 55):
            d_code = f"DOC-HDOS-2026-{idx:03d}"
            if d_code in existing_docs:
                continue

            spec = doc_categories[(idx - 1) % len(doc_categories)]
            p_assigned = p_ids[(idx - 1) % len(p_ids)]
            f_assigned = file_objs[(idx - 1) % len(file_objs)]

            doc = DigitalDocumentRecord(
                document_code=d_code,
                title=f"{spec[0]}: Official Docket for Project Ref #{p_assigned} (Dossier #{idx})",
                category=spec[0],
                reference_number=f"{spec[1]}-{idx}",
                document_date=datetime.datetime(2026, 1, 10) + datetime.timedelta(days=idx),
                issuing_authority=spec[2],
                project_id=p_assigned,
                work_package_id=pkg_ids[(idx - 1) % len(pkg_ids)],
                related_file_id=f_assigned.id,
                version="1.0",
                storage_path=f"/documents/repo/doc_hdos_2026_{idx:03d}.pdf",
                uploading_user="admin",
                confidentiality_level=spec[3],
                verification_status="Verified" if idx % 5 != 0 else "Unverified",
                checksum_sha256=f"hash_{idx:08x}_{idx * 1337:016x}",
                data_mode="mock",
                data_status="Seeded Demo"
            )
            db.add(doc)
            existing_docs[d_code] = doc
        db.commit()

        # -------------------------------------------------------------
        # 9. SEED 15 AI OFFICE INTELLIGENCE FINDINGS
        # -------------------------------------------------------------
        if db.query(DigitalOfficeAIFinding).count() < 15:
            ai_specs = [
                ("DO-AIF-SH15-01", "MULTI_AGENCY_DEADLOCK", "CRITICAL", "Cross-Departmental Block: Pykara Land Compensation & TANGEDCO Feeder Shutdown", "Algorithmic audit indicates File FILE-CKICP-2026-088 is halting civil carriageway progress on Km 14+200. Combined Treasury token release and Sunday line shutdown clears deadlock.", "ROC.LA.Nilgiris/2026/D1 & TANGEDCO-SD-991", demo_file.id, 4, "Execute Ministerial Coordination Order G.O. Ms. 412; monitor Treasury release token.", "Principal Secretary / Minister", True),
                ("DO-AIF-002", "SLA_BREACH_WARNING", "HIGH", "File FILE-HDOS-2026-004 Exceeded Interdepartmental SLA by 18 Days", "File movement from Highways to TWAD Board has been pending acknowledgement for 18 days, exceeding 15-day statutory turnaround standard.", "MOV-2026-008", file_objs[3].id, 1, "Issue automated high-priority reminder to Superintending Engineer TWAD Chengalpattu.", "Executive Engineer TWAD", True),
                ("DO-AIF-003", "CORRESPONDENCE_ROUTING", "MEDIUM", "Auto-Classification & Routing Suggestion for Inward DAK #COMM-IN-2026-012", "Natural language parsing classifies communication as Southern Railway GAD Requisition and suggests routing directly to Special Chief Engineer Bridges.", "COMM-IN-2026-012", file_objs[1].id, 6, "Route directly to Chief Engineer Bridges (H) C&M to reduce 4-day desk routing latency.", "Section Officer (Registry)", False),
                ("DO-AIF-004", "MISSING_EVIDENCE", "HIGH", "Missing Compaction Density Test Certificate on File FILE-HDOS-2026-008", "Office Note submitted for bill payment lacks mandatory Core Compaction Density Certificate required under Clause 46.", "NOTE-2026-014", file_objs[7].id, 2, "Withhold final IPC payment voucher pending submission of HRS Guindy certified density report.", "Divisional Engineer (Quality)", False),
                ("DO-AIF-005", "OVERDUE_DECISION_ACTION", "CRITICAL", "Action ACT-OFF-081 Approaching Final Cabinet Implementation Cut-off", "Treasury payment voucher disbursal of ₹0.85 Cr is 72 hours from statutory compliance deadline.", "DEC-MIN-2026-021", demo_file.id, 4, "Direct Special DRO Ooty to submit disbursement voucher confirmation before Friday 17:00 IST.", "Special DRO (Land Acquisition)", True)
            ]

            for code, f_type, sev, title, prob, ev, f_id, p_id, rec, resp_role, esc in ai_specs:
                finding = DigitalOfficeAIFinding(
                    finding_code=code,
                    finding_type=f_type,
                    severity=sev,
                    title=title,
                    ai_confidence=0.94,
                    problem_statement=prob,
                    evidence_reference=ev,
                    affected_file_id=f_id,
                    affected_project_id=p_id,
                    recommended_action=rec,
                    suggested_responsible_role=resp_role,
                    is_escalation_required=esc,
                    status="ACTIVE",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(finding)

            # Seed 10 more to reach 15
            for idx in range(6, 16):
                finding = DigitalOfficeAIFinding(
                    finding_code=f"DO-AIF-{idx:03d}",
                    finding_type="SLA_BREACH_WARNING" if idx % 2 == 0 else "MINISTERIAL_BRIEFING",
                    severity="HIGH" if idx % 3 == 0 else "MEDIUM",
                    title=f"Office Workflow Intelligence Finding #{idx}: Document & File Turnaround Audit",
                    ai_confidence=0.91,
                    problem_statement=f"Pattern analysis detected repeated file referrals between Division Office #{idx % 4 + 1} and Secretariat without definitive technical disposal.",
                    evidence_reference=f"FILE-HDOS-2026-{idx:03d}",
                    affected_file_id=file_objs[(idx - 1) % len(file_objs)].id,
                    affected_project_id=p_ids[(idx - 1) % len(p_ids)],
                    recommended_action="Convene single joint scrutiny session to resolve technical queries in one sitting.",
                    suggested_responsible_role="Superintending Engineer (Highways C&M)",
                    is_escalation_required=(idx % 4 == 0),
                    status="ACTIVE",
                    data_mode="mock",
                    data_status="Seeded Demo"
                )
                db.add(finding)
            db.commit()

        print("Digital Office, E-File Management & Workflow Intelligence seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding digital office data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_digital_office_data()

