"""
Seed script for Statewide CRIDP Work Verification, Five-Year Renewal Intelligence,
Tamil Nadu State Highways Authority (TANSHA), and Delegation of Powers Registry.

Governing Statutory Frameworks:
- The Tamil Nadu State Highways Authority Act, 2024 (TN Act No. 12 of 2024)
- G.O.(Ms) No. 11, Highways and Minor Ports (HN.2) Department, dated 21.01.2022 (Technical Sanction Powers)
- G.O.(Ms) No. 29, Highways and Minor Ports (HN.2) Department, dated 03.03.2022 read with G.O.(Ms) No. 163 dated 01.10.2012 (Tender Acceptance Powers)
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    Road, RoadSegment, WorkHistory, CRIDPWork, OverlapFinding,
    DelegationOfPowerRegistry, Organisation, Department, StatutoryCommittee,
    RenewalEligibilityRule, User
)
from app.services.cridp_verification_service import (
    verify_proposal_chainage_overlap, merge_intervals, sum_interval_length
)


def seed_cridp_verification_data(db_session=None):
    db: Session = db_session or SessionLocal()
    # Ensure all tables exist
    if not db_session:
        Base.metadata.create_all(bind=engine)

    print("Seeding Tamil Nadu State Highways Authority (TANSHA)...")
    # -------------------------------------------------------------------------
    # 1. INSTATE TAMIL NADU STATE HIGHWAYS AUTHORITY (TANSHA)
    # -------------------------------------------------------------------------
    tansha_org = db.query(Organisation).filter(Organisation.name.like("%State Highways Authority%")).first()
    if not tansha_org:
        tansha_org = Organisation(
            name="Tamil Nadu State Highways Authority (TANSHA)",
            org_type="STATUTORY_AUTHORITY",
            registration_no="TN Act No. 12 of 2024",
            contact_email="mttansha2.hd@tn.gov.in",
            phone="044-22350022",
            address="Ground Floor, Kalaignar Centenary Building, HRS Campus, 76 Sardar Patel Road, Guindy, Chennai - 600 025"
        )
        db.add(tansha_org)
        db.commit()

    tansha_dept = db.query(Department).filter(Department.code == "TANSHA").first()
    if not tansha_dept:
        tansha_dept = Department(
            code="TANSHA",
            name="Tamil Nadu State Highways Authority (TANSHA)",
            category="Statutory Highway Authority",
            is_external=False,
            contact_email="mttansha2.hd@tn.gov.in",
            responsible_minister="Thiru Aadhav Arjuna (Minister for Public Works and Sports Development)",
            responsible_secretary="Thiru Shunchonngam Jatak Chiru, IAS (Principal Secretary to Govt)",
            head_of_department="Er. D. Jebaselwin Gladson (Member Technical, TANSHA)",
            nodal_officer_name="Er. D. Jebaselwin Gladson",
            nodal_officer_designation="Member Technical, Tamil Nadu State Highways Authority",
            nodal_officer_phone="044-22350022",
            jurisdiction="Statewide High-Speed Corridors, Expressways, Outer Ring Roads, and DBFOT Wayside Amenities",
            sla_standard_days=15
        )
        db.add(tansha_dept)
        db.commit()

    # Statutory Committee / Authority Board
    tansha_board = db.query(StatutoryCommittee).filter(StatutoryCommittee.code == "TANSHA_BOARD").first()
    if not tansha_board:
        tansha_board = StatutoryCommittee(
            code="TANSHA_BOARD",
            name="Tamil Nadu State Highways Authority - Governing Board",
            chairperson_title="Principal Secretary to Government, Highways and Minor Ports Department",
            mandate_summary="Supreme corporate and statutory governance for planning, financing, construction, maintenance, and tolling of high-speed corridors vested under TN Act 12 of 2024.",
            constitution_go="The Tamil Nadu State Highways Authority Act, 2024 (Tamil Nadu Act No. 12 of 2024)"
        )
        db.add(tansha_board)
        db.commit()

    print("Seeding Versioned Delegation of Powers Registry...")
    # -------------------------------------------------------------------------
    # 2. DELEGATION OF POWERS REGISTRY (G.O. 11, G.O. 29, G.O. 163, G.O. 75)
    # -------------------------------------------------------------------------
    # Clear and populate authoritative rules
    db.query(DelegationOfPowerRegistry).delete()

    delegation_rules = [
        # TECHNICAL SANCTION (G.O.(Ms) No. 11, dated 21.01.2022)
        {
            "rule_id": "DOP-TS-DE-001",
            "go_reference": "G.O.(Ms) No. 11, Highways and Minor Ports (HN.2), dated 21.01.2022",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TECHNICAL_SANCTION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Divisional Engineer",
            "monetary_limit_cr": 0.50,  # Up to ₹50 Lakhs
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": True,
            "effective_date": datetime.datetime(2022, 1, 21),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "https://www.tn.gov.in/gosec/hways/hways_e_11_2022.pdf",
            "operative_provisions": "Divisional Engineer is empowered to accord Technical Sanction for road works up to ₹50.00 Lakhs.",
            "notes": "Structural design approval for major bridges and structures must be separately submitted to HRS or Chief Engineer (Planning)."
        },
        {
            "rule_id": "DOP-TS-SE-001",
            "go_reference": "G.O.(Ms) No. 11, Highways and Minor Ports (HN.2), dated 21.01.2022",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TECHNICAL_SANCTION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Superintending Engineer",
            "monetary_limit_cr": 7.00,  # Up to ₹7.00 Crores
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": True,
            "effective_date": datetime.datetime(2022, 1, 21),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "https://www.tn.gov.in/gosec/hways/hways_e_11_2022.pdf",
            "operative_provisions": "Superintending Engineer is empowered to accord Technical Sanction for road works exceeding ₹50.00 Lakhs and up to ₹7.00 Crores.",
            "notes": "Does not apply to detailed structural design beyond standard IRC spans without HRS concurrence."
        },
        {
            "rule_id": "DOP-TS-CE-001",
            "go_reference": "G.O.(Ms) No. 11, Highways and Minor Ports (HN.2), dated 21.01.2022",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TECHNICAL_SANCTION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Chief Engineer",
            "monetary_limit_cr": 9999.00,  # Above ₹7.00 Crores (Full powers)
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": True,
            "effective_date": datetime.datetime(2022, 1, 21),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "https://www.tn.gov.in/gosec/hways/hways_e_11_2022.pdf",
            "operative_provisions": "Chief Engineer is empowered to accord Technical Sanction for all road works above ₹7.00 Crores (Full Powers within administrative sanction).",
            "notes": "Mandatory technical vetting by Planning wing for projects exceeding ₹25.00 Cr."
        },

        # TENDER ACCEPTANCE (G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O. 163 dated 01.10.2012)
        {
            "rule_id": "DOP-TA-DE-001",
            "go_reference": "G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O.(Ms) No. 163, dated 01.10.2012",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Divisional Engineer",
            "monetary_limit_cr": 0.50,  # Up to ₹50 Lakhs
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "Tamil Nadu Highways Manual Vol II & G.O. Ms. No. 29 (03.03.2022)",
            "operative_provisions": "Divisional Engineer is empowered to accept tenders up to ₹50.00 Lakhs at estimate rates (0% excess).",
            "notes": "Any tender with excess must be submitted to Superintending Engineer / COT."
        },
        {
            "rule_id": "DOP-TA-SE-001",
            "go_reference": "G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O.(Ms) No. 163, dated 01.10.2012",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Superintending Engineer",
            "monetary_limit_cr": 1.00,  # Up to ₹1.00 Crore individual / ₹7.50 Cr package
            "tender_excess_pct_limit": 5.0,  # Up to 5% tender excess
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "G.O. Ms. No. 29 (03.03.2022) & G.O. Ms. No. 163 (01.10.2012)",
            "operative_provisions": "Superintending Engineer is empowered to accept individual tenders up to ₹1.00 Crore with up to 5% tender excess.",
            "notes": "Excess above 5% requires mandatory transmission to Commissionerate of Tenders (COT)."
        },
        {
            "rule_id": "DOP-TA-CE-001",
            "go_reference": "G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O.(Ms) No. 163, dated 01.10.2012",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Chief Engineer",
            "monetary_limit_cr": 6.00,  # Up to ₹6.00 Cr (Works) / ₹7.50 Cr (Packages)
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "G.O. Ms. No. 29 (03.03.2022) & G.O. Ms. No. 163 (01.10.2012)",
            "operative_provisions": "Chief Engineer is empowered to accept tenders up to ₹6.00 Cr (Individual Works) and up to ₹7.50 Cr (Packages) at 0% tender excess.",
            "notes": "Works exceeding ₹6.00 Cr or packages exceeding ₹7.50 Cr or with any tender excess require COT scrutiny."
        },
        {
            "rule_id": "DOP-TA-COT-001",
            "go_reference": "G.O.(Ms) No. 75, Highways and Minor Ports, dated 02.09.2026 read with G.O. 29",
            "issuing_authority": "Finance / Highways Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Commissionerate of Tenders (COT)",
            "monetary_limit_cr": 100.00,
            "tender_excess_pct_limit": 10.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2026, 9, 2),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "G.O. Ms. No. 75 dated 02.09.2026 & Highways Manual Vol II",
            "operative_provisions": "Mandatory scrutiny body for all works > ₹6.00 Cr, all packages > ₹7.50 Cr, or tender excess > 5%.",
            "notes": "Statutory scrutiny recommendations forwarded to Secretary or Cabinet."
        },

        # ADMINISTRATIVE SANCTION
        {
            "rule_id": "DOP-AS-SEC-001",
            "go_reference": "Tamil Nadu Financial Code & Business Rules",
            "issuing_authority": "Government of Tamil Nadu",
            "approval_category": "ADMINISTRATIVE_SANCTION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Principal Secretary to Government",
            "monetary_limit_cr": 100.00,
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2020, 1, 1),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "TN Financial Code / Secretariat Instructions",
            "operative_provisions": "Administrative Sanction up to ₹100.00 Crores by Secretary in consultation with Finance.",
            "notes": "Schemes above ₹100.00 Cr require Council of Ministers (Cabinet) sanction."
        },
        # REVISED ESTIMATE APPROVAL
        {
            "rule_id": "DOP-RE-CE-001",
            "go_reference": "G.O. Ms. No. 163, Highways and Minor Ports (HN1), dated 13.12.2023",
            "issuing_authority": "Highways and Minor Ports Department",
            "approval_category": "REVISED_ESTIMATE_APPROVAL",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Chief Engineer",
            "monetary_limit_cr": 5.00,
            "tender_excess_pct_limit": 10.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2023, 12, 13),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "G.O. Ms. No. 163 dated 13.12.2023",
            "operative_provisions": "Revised estimates where excess does not exceed 10% of original AS can be sanctioned by CE within allocation.",
            "notes": "Above 10% requires Revised Administrative Sanction Committee (RASC) scrutiny."
        },
        # CONTRACT VARIATION
        {
            "rule_id": "DOP-CV-EXP-001",
            "go_reference": "G.O. Ms. No. 05, Highways and Minor Ports (HN2), dated 13.01.2026",
            "issuing_authority": "Highways and Minor Ports Department",
            "approval_category": "CONTRACT_VARIATION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Three Member Expert Committee (Section 16(b))",
            "monetary_limit_cr": 25.00,
            "tender_excess_pct_limit": 25.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2026, 1, 13),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "G.O. Ms. No. 05 (13.01.2026)",
            "operative_provisions": "Mandatory evaluation and approval for entrustment of additional quantities exceeding 25% to existing contractor under Section 16(b) of TNTIT Act.",
            "notes": "Contract variation beyond 25% strictly blocked without committee sanction."
        },
        # PAYMENT AUTHORISATION
        {
            "rule_id": "DOP-PA-DE-001",
            "go_reference": "Tamil Nadu Highways Manual Vol I & II",
            "issuing_authority": "Highways Department",
            "approval_category": "PAYMENT_AUTHORISATION",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Divisional Engineer",
            "monetary_limit_cr": 9999.00,  # Full powers for passing contractor CC bills based on test checks
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2015, 1, 1),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "Highways Manual Vol II (Accounts)",
            "operative_provisions": "Divisional Engineer is the Drawing and Disbursing Officer (DDO) empowered to pass contractor running and final bills after test check of measurement books.",
            "notes": "Subject to Letter of Credit (LC) and IFMS budget voucher clearance."
        }
    ]

    for rule_data in delegation_rules:
        db.add(DelegationOfPowerRegistry(**rule_data))
    db.commit()

    print("Seeding Policy Renewal Eligibility Rules...")
    # -------------------------------------------------------------------------
    # 3. RENEWAL ELIGIBILITY POLICY RULE (Configurable 5-Year Window)
    # -------------------------------------------------------------------------
    rule = db.query(RenewalEligibilityRule).filter(RenewalEligibilityRule.rule_code == "RULE-CRIDP-5YR").first()
    if not rule:
        rule = RenewalEligibilityRule(
            rule_code="RULE-CRIDP-5YR",
            policy_name="CRIDP Five-Year Road Renewal Restriction Policy",
            restriction_period_years=5.0,
            reference_date_type="PHYSICAL_COMPLETION_DATE",
            governing_order_ref="CRIDP Comprehensive Operational Guidelines (G.O. Ms. No. 84)",
            applicable_schemes="CRIDP, CMRDP, State Capital",
            is_active=True
        )
        db.add(rule)
        db.commit()

    print("Seeding Canonical Statewide Road Inventory...")
    # -------------------------------------------------------------------------
    # 4. CANONICAL ROAD INVENTORY & SEGMENTS
    # -------------------------------------------------------------------------
    # Ensure canonical roads exist across multiple categories and circles
    canonical_roads = [
        {"code": "SH-49", "name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)", "road_type": "SH", "start": 11.5, "end": 135.0, "district": "Chengalpattu"},
        {"code": "SH-15", "name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor", "road_type": "SH", "start": 0.0, "end": 162.0, "district": "Coimbatore"},
        {"code": "SH-09", "name": "Cuddalore - Vridhachalam - Salem Road", "road_type": "SH", "start": 0.0, "end": 184.0, "district": "Cuddalore"},
        {"code": "SH-63", "name": "Thanjavur - Manamadurai Road", "road_type": "SH", "start": 0.0, "end": 142.5, "district": "Thanjavur"},
        {"code": "SH-110A", "name": "Medavakkam - Mambakkam Link Corridor", "road_type": "SH", "start": 0.0, "end": 18.4, "district": "Chengalpattu"},
        {"code": "MDR-102", "name": "Tambaram - Mudichur - Sriperumbudur Road", "road_type": "MDR", "start": 0.0, "end": 26.4, "district": "Chengalpattu"},
        {"code": "MDR-205", "name": "Salem - Yercaud Ghat Road", "road_type": "MDR", "start": 0.0, "end": 32.0, "district": "Salem"},
        {"code": "MDR-314", "name": "Madurai - Melur - Tirupathur Road", "road_type": "MDR", "start": 0.0, "end": 44.5, "district": "Madurai"},
        {"code": "ODR-045", "name": "Guduvanchery - Thiruporur Hub Link Road", "road_type": "ODR", "start": 0.0, "end": 18.2, "district": "Chengalpattu"},
        {"code": "ODR-112", "name": "Pollachi - Anaimalai Connector", "road_type": "ODR", "start": 0.0, "end": 16.8, "district": "Coimbatore"},
        {"code": "ODR-088", "name": "Tiruchirappalli - Thuraiyur Link", "road_type": "ODR", "start": 0.0, "end": 22.0, "district": "Tiruchirappalli"},
    ]

    for cr in canonical_roads:
        r = db.query(Road).filter(Road.code == cr["code"]).first()
        if not r:
            r = Road(
                code=cr["code"],
                name=cr["name"],
                road_type=cr["road_type"],
                start_chainage=cr["start"],
                end_chainage=cr["end"],
                total_length_km=round(cr["end"] - cr["start"], 2)
            )
            db.add(r)
            db.commit()

    print("Seeding Five-Year Work History Register...")
    # -------------------------------------------------------------------------
    # 5. HISTORICAL WORK REGISTER (Completed within previous 5 years & prior)
    # -------------------------------------------------------------------------
    # Clean previous demo entries in WorkHistory to ensure clean state
    db.query(WorkHistory).delete()

    history_records = [
        # SH-49 ECR: Km 10/000 to 15/000 completed on 2023-08-15 (within 5-yr window)
        {
            "work_reference": "WH-SH49-2023-01",
            "road_code": "SH-49",
            "road_name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)",
            "road_category": "SH",
            "district": "Chengalpattu",
            "division_name": "Chengalpattu Division",
            "section_name": "Kovalam Section",
            "start_chainage": 10.0,
            "end_chainage": 15.0,
            "length_km": 5.0,
            "work_type": "Periodic Renewal / SDBC",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 112/2022",
            "sanction_date": datetime.datetime(2022, 10, 15),
            "sanctioned_cost_cr": 4.80,
            "contract_agreement_no": "AGR-SE-CPT-2022-44",
            "contractor_name": "M/s Southern Infra Projects",
            "awarded_value_cr": 4.65,
            "physical_completion_date": datetime.datetime(2023, 8, 15),
            "actual_expenditure_cr": 4.62,
            "completion_certificate_ref": "CC-CPT-2023-89",
            "measurement_book_ref": "MB No. 412/Page 55",
            "pavement_treatment": "Semi-Dense Bituminous Concrete (SDBC) 25mm overlay",
            "is_verified": True,
            "verification_source": "Chengalpattu Circle Completion Register"
        },
        # SH-49 ECR: Km 22/000 to 30/000 completed on 2024-03-20 (within 5-yr window)
        {
            "work_reference": "WH-SH49-2024-02",
            "road_code": "SH-49",
            "road_name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)",
            "road_category": "SH",
            "district": "Chengalpattu",
            "division_name": "Chengalpattu Division",
            "section_name": "Mahabalipuram Section",
            "start_chainage": 22.0,
            "end_chainage": 30.0,
            "length_km": 8.0,
            "work_type": "BM & BC Overlay",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 45/2023",
            "sanction_date": datetime.datetime(2023, 5, 10),
            "sanctioned_cost_cr": 8.50,
            "contract_agreement_no": "AGR-CE-CHN-2023-12",
            "contractor_name": "M/s Coastal Roadways Ltd",
            "awarded_value_cr": 8.40,
            "physical_completion_date": datetime.datetime(2024, 3, 20),
            "actual_expenditure_cr": 8.38,
            "completion_certificate_ref": "CC-CPT-2024-14",
            "measurement_book_ref": "MB No. 428/Page 12",
            "pavement_treatment": "Bituminous Concrete (BC) 40mm on DBM 50mm",
            "is_verified": True,
            "verification_source": "Chengalpattu Circle Completion Register"
        },
        # SH-15: Km 12/000 to 38/000 under CKICP (committed under other multilateral scheme)
        {
            "work_reference": "WH-SH15-CKICP-01",
            "road_code": "SH-15",
            "road_name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor",
            "road_category": "SH",
            "district": "Coimbatore",
            "division_name": "Coimbatore Special Division",
            "section_name": "Myleripalayam Section",
            "start_chainage": 12.0,
            "end_chainage": 38.0,
            "length_km": 26.0,
            "work_type": "Widening to 4 Lanes with Paved Shoulders",
            "scheme_name": "CKICP",
            "sanction_order_no": "G.O.(Ms) No. 128/2020",
            "sanction_date": datetime.datetime(2020, 8, 12),
            "sanctioned_cost_cr": 210.50,
            "contract_agreement_no": "CKICP-EPC-04",
            "contractor_name": "M/s L&T Construction Ltd",
            "awarded_value_cr": 198.40,
            "physical_completion_date": None,  # Ongoing multilateral work
            "actual_expenditure_cr": 98.40,
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 811/Page 01",
            "pavement_treatment": "Heavy Duty Flexible Pavement (DBM 100mm + BC 50mm)",
            "is_verified": True,
            "verification_source": "CKICP ADB Quarterly Progress Review"
        },
        # MDR-102: Km 5/000 to 12/000 completed on 2019-11-10 (HISTORICALLY ELIGIBLE: >5 years ago!)
        {
            "work_reference": "WH-MDR102-2019-01",
            "road_code": "MDR-102",
            "road_name": "Tambaram - Mudichur - Sriperumbudur Road",
            "road_category": "MDR",
            "district": "Chengalpattu",
            "division_name": "Tambaram Division",
            "section_name": "Mudichur Section",
            "start_chainage": 5.0,
            "end_chainage": 12.0,
            "length_km": 7.0,
            "work_type": "Periodic Renewal / SDBC",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 88/2018",
            "sanction_date": datetime.datetime(2018, 9, 14),
            "sanctioned_cost_cr": 5.20,
            "contract_agreement_no": "AGR-SE-MET-2018-91",
            "contractor_name": "M/s Sri Murugan Infra",
            "awarded_value_cr": 5.10,
            "physical_completion_date": datetime.datetime(2019, 11, 10),  # Completed ~7 years ago
            "actual_expenditure_cr": 5.08,
            "completion_certificate_ref": "CC-TBM-2019-45",
            "measurement_book_ref": "MB No. 312/Page 88",
            "pavement_treatment": "Semi-Dense Bituminous Concrete 25mm",
            "is_verified": True,
            "verification_source": "Tambaram Division Completion Register"
        },
        # SH-09 Cuddalore: Km 50/000 to 58/000 completed on 2024-09-05 (within 5-yr window)
        {
            "work_reference": "WH-SH09-2024-01",
            "road_code": "SH-09",
            "road_name": "Cuddalore - Vridhachalam - Salem Road",
            "road_category": "SH",
            "district": "Cuddalore",
            "division_name": "Cuddalore Division",
            "section_name": "Vridhachalam Section",
            "start_chainage": 50.0,
            "end_chainage": 58.0,
            "length_km": 8.0,
            "work_type": "BM & BC Overlay",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 71/2023",
            "sanction_date": datetime.datetime(2023, 7, 22),
            "sanctioned_cost_cr": 7.20,
            "contract_agreement_no": "AGR-SE-VLR-2023-38",
            "contractor_name": "M/s Vridhachalam Builders",
            "awarded_value_cr": 6.95,
            "physical_completion_date": datetime.datetime(2024, 9, 5),
            "actual_expenditure_cr": 6.90,
            "completion_certificate_ref": "CC-CUD-2024-31",
            "measurement_book_ref": "MB No. 514/Page 09",
            "pavement_treatment": "Bituminous Concrete 40mm Overlay",
            "is_verified": True,
            "verification_source": "Cuddalore Division Work Register"
        }
    ]

    for hw in history_records:
        r = db.query(Road).filter(Road.code == hw["road_code"]).first()
        if r:
            db.add(WorkHistory(road_id=r.id, **hw))
    db.commit()

    print("Seeding CRIDP Work Proposals for FY 2026-27...")
    # -------------------------------------------------------------------------
    # 6. CRIDP PROPOSALS (Demonstrating Duplicate, Partial Overlap, Eligible, Exception)
    # -------------------------------------------------------------------------
    db.query(OverlapFinding).delete()
    db.query(CRIDPWork).delete()

    sample_proposals = [
        # Proposal 1: SH-49 Km 13/000 to 18/000
        # Historical work was Km 10/000 to 15/000 (completed 2023-08-15)
        # Expected: Proposed 5 km, Overlap 2 km (Km 13-15), Eligible 3 km (Km 15-18) -> PARTIALLY OVERLAPPING
        {
            "proposal_code": "PROP-CRIDP-2026-001",
            "work_name": "Periodic Renewal and Riding Quality Improvement of SH-49 km 13/0 to 18/0",
            "road_code": "SH-49",
            "road_name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)",
            "road_category": "SH",
            "district": "Chengalpattu",
            "circle_name": "Chengalpattu Circle",
            "division_name": "Chengalpattu Division",
            "section_name": "Kovalam Section",
            "start_chainage": 13.0,
            "end_chainage": 18.0,
            "proposed_length_km": 5.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 4.50,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 160.0,
            "pci_score": 62.0,
            "roughness_iri": 3400.0,
            "engineering_exception_justification": None,
            "data_mode": "OFFICIAL",
            "source_document_ref": "DE(H) Chengalpattu Proposed CRIDP Priority List 2026-27"
        },
        # Proposal 2: SH-49 Km 23/000 to 28/000
        # Historical work was Km 22/000 to 30/000 (completed 2024-03-20)
        # Expected: Proposed 5 km, Overlap 5 km (100%) -> RECENTLY RENEWED
        {
            "proposal_code": "PROP-CRIDP-2026-002",
            "work_name": "Strengthening & Surface Renewal of SH-49 km 23/0 to 28/0",
            "road_code": "SH-49",
            "road_name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)",
            "road_category": "SH",
            "district": "Chengalpattu",
            "circle_name": "Chengalpattu Circle",
            "division_name": "Chengalpattu Division",
            "section_name": "Mahabalipuram Section",
            "start_chainage": 23.0,
            "end_chainage": 28.0,
            "proposed_length_km": 5.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 4.80,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 175.0,
            "pci_score": 78.0,
            "roughness_iri": 2800.0,
            "engineering_exception_justification": None,
            "data_mode": "OFFICIAL",
            "source_document_ref": "Special Sub-Division Annual Proposals 2026-27"
        },
        # Proposal 3: MDR-102 Km 5/000 to 12/000
        # Historical renewal was 2019-11-10 (>5 years ago)
        # Expected: Proposed 7 km, Overlap 0 km (past 5-yr restriction) -> ELIGIBLE
        {
            "proposal_code": "PROP-CRIDP-2026-003",
            "work_name": "Riding Quality Renewal on MDR-102 Tambaram-Mudichur Stretch km 5/0 to 12/0",
            "road_code": "MDR-102",
            "road_name": "Tambaram - Mudichur - Sriperumbudur Road",
            "road_category": "MDR",
            "district": "Chengalpattu",
            "circle_name": "Chennai City Circle",
            "division_name": "Tambaram Division",
            "section_name": "Mudichur Section",
            "start_chainage": 5.0,
            "end_chainage": 12.0,
            "proposed_length_km": 7.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 5.60,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 140.0,
            "pci_score": 54.0,
            "roughness_iri": 3900.0,
            "engineering_exception_justification": None,
            "data_mode": "OFFICIAL",
            "source_document_ref": "Tambaram Division Verified CRIDP Dossier"
        },
        # Proposal 4: SH-09 Km 51/000 to 57/000 with Approved Engineering Exception
        # Completed in 2024, but flood damage / extraordinary monsoon subsidence justified
        # Expected: Proposed 6 km, Overlap 6 km, but approved engineering exception -> ENGINEERING EXCEPTION
        {
            "proposal_code": "PROP-CRIDP-2026-004",
            "work_name": "Special Flood Damage Renewal & Base Stabilization of SH-09 km 51/0 to 57/0",
            "road_code": "SH-09",
            "road_name": "Cuddalore - Vridhachalam - Salem Road",
            "road_category": "SH",
            "district": "Cuddalore",
            "circle_name": "Villupuram Circle",
            "division_name": "Cuddalore Division",
            "section_name": "Vridhachalam Section",
            "start_chainage": 51.0,
            "end_chainage": 57.0,
            "proposed_length_km": 6.0,
            "proposed_work_type": "Reconstruction & Stabilization",
            "financial_year": "2026-27",
            "estimated_cost_cr": 6.80,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 150.0,
            "pci_score": 38.0,
            "roughness_iri": 4800.0,
            "engineering_exception_justification": "Severe subgrade failure due to Pennaiyar river flash flood breaching embankment; certified by HRS Guindy Investigation Report No. HRS-GEO-2025-104. Permitted by Chief Engineer (C&M) under special disaster restoration clause.",
            "data_mode": "OFFICIAL",
            "source_document_ref": "CE(H) C&M Proceedings No. 4122/W2/2026"
        },
        # Proposal 5: SH-15 Km 15/000 to 25/000
        # Overlaps with ongoing CKICP ADB project
        # Expected: Proposed 10 km, Overlap 10 km -> WORK IN PROGRESS / CROSS-SCHEME OVERLAP
        {
            "proposal_code": "PROP-CRIDP-2026-005",
            "work_name": "Surface Renewal of SH-15 km 15/0 to 25/0",
            "road_code": "SH-15",
            "road_name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor",
            "road_category": "SH",
            "district": "Coimbatore",
            "circle_name": "Coimbatore Circle",
            "division_name": "Coimbatore Special Division",
            "section_name": "Myleripalayam Section",
            "start_chainage": 15.0,
            "end_chainage": 25.0,
            "proposed_length_km": 10.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 8.20,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 180.0,
            "pci_score": 72.0,
            "roughness_iri": 2900.0,
            "engineering_exception_justification": None,
            "data_mode": "OFFICIAL",
            "source_document_ref": "Field Sub-Division Duplicate Submission"
        },
        # Proposal 6: SH-110A Km 0/000 to 8/000 (Eligible virgin stretch)
        {
            "proposal_code": "PROP-CRIDP-2026-006",
            "work_name": "Widening to 2-Lane with Paved Shoulder of SH-110A km 0/0 to 8/0",
            "road_code": "SH-110A",
            "road_name": "Medavakkam - Mambakkam Link Corridor",
            "road_category": "SH",
            "district": "Chengalpattu",
            "circle_name": "Chengalpattu Circle",
            "division_name": "Chengalpattu Division",
            "section_name": "Medavakkam Section",
            "start_chainage": 0.0,
            "end_chainage": 8.0,
            "proposed_length_km": 8.0,
            "proposed_work_type": "Widening & Strengthening",
            "financial_year": "2026-27",
            "estimated_cost_cr": 7.40,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 130.0,
            "pci_score": 58.0,
            "roughness_iri": 3600.0,
            "engineering_exception_justification": None,
            "data_mode": "OFFICIAL",
            "source_document_ref": "Chengalpattu Division Master Priority"
        }
    ]

    for p_spec in sample_proposals:
        r = db.query(Road).filter(Road.code == p_spec["road_code"]).first()
        if not r:
            continue

        work = CRIDPWork(
            road_id=r.id,
            **p_spec
        )
        db.add(work)
        db.commit()
        db.refresh(work)

        # Run deterministic chainage verification immediately
        res = verify_proposal_chainage_overlap(
            db=db,
            road_id=r.id,
            start_chainage=work.start_chainage,
            end_chainage=work.end_chainage,
            proposed_work_type=work.proposed_work_type,
            financial_year=work.financial_year,
            current_proposal_id=work.id
        )

        # Handle engineering exception override
        if work.engineering_exception_justification:
            work.verification_status = "ENGINEERING EXCEPTION"
            work.duplicate_severity = "LOW"
            work.overlapping_length_km = res["overlapping_length_km"]
            work.eligible_length_km = work.proposed_length_km  # Exception permits work
            work.overlapping_chainage_description = res["overlapping_chainage_description"]
            work.potential_financial_exposure_cr = 0.0
            work.avoidable_expenditure_cr = 0.0
        else:
            work.verification_status = res["verification_classification"]
            work.duplicate_severity = res["duplicate_severity"]
            work.overlapping_length_km = res["overlapping_length_km"]
            work.eligible_length_km = res["eligible_length_km"]
            work.overlapping_chainage_description = res["overlapping_chainage_description"]

            # Exposure calculation
            rate_per_km = work.estimated_cost_cr / work.proposed_length_km if work.proposed_length_km > 0 else 0.0
            work.potential_financial_exposure_cr = round(rate_per_km * work.overlapping_length_km, 2)
            if work.verification_status in ["RECENTLY RENEWED", "DUPLICATE PROPOSAL"]:
                work.avoidable_expenditure_cr = work.potential_financial_exposure_cr
            elif work.verification_status == "PARTIALLY OVERLAPPING":
                work.avoidable_expenditure_cr = round(work.potential_financial_exposure_cr * 0.85, 2)
            else:
                work.avoidable_expenditure_cr = 0.0

        # Assign statutory approval authority
        if work.estimated_cost_cr <= 0.50:
            work.approval_authority_required = "Divisional Engineer"
        elif work.estimated_cost_cr <= 7.00:
            work.approval_authority_required = "Superintending Engineer"
        else:
            work.approval_authority_required = "Chief Engineer"

        # Save findings
        for item in res["detailed_overlapping_intervals"]:
            finding = OverlapFinding(
                proposal_id=work.id,
                overlap_type=item["type"],
                overlap_start_chainage=item["start"],
                overlap_end_chainage=item["end"],
                overlap_length_km=item["length_km"],
                years_since_completion=item.get("years_since"),
                is_within_five_year_window=item.get("within_5yr", True),
                estimated_overlap_cost_cr=round((work.estimated_cost_cr / work.proposed_length_km) * item["length_km"], 2) if work.proposed_length_km > 0 else 0.0,
                recommended_action=res["recommended_action"]
            )
            db.add(finding)

        db.commit()

    print("CRIDP Verification Seeding completed successfully.")
    if not db_session:
        db.close()


if __name__ == "__main__":
    seed_cridp_verification_data()
