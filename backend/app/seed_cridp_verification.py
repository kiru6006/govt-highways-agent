"""
Seed script for Statewide CRIDP Work Verification, Five-Year Renewal Intelligence,
Historical Work Risk Intelligence, Investigation Dossiers, Corrective Actions,
Tamil Nadu State Highways Authority (TANSHA), and Delegation of Powers Registry.

Governing Statutory Frameworks:
- The Tamil Nadu State Highways Authority Act, 2024 (TN Act No. 12 of 2024)
- G.O.(Ms) No. 105, Highways and Minor Ports (HN.2) Department, dated 02.07.2025 (CRIDP Annual Guidelines)
- G.O.(Ms) No. 11, Highways and Minor Ports (HN.2) Department, dated 21.01.2022 (Technical Sanction Powers)
- G.O.(Ms) No. 29, Highways and Minor Ports (HN.2) Department, dated 03.03.2022 read with G.O.(Ms) No. 163 dated 01.10.2012 (Tender Acceptance Powers)
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    Road, RoadSegment, WorkHistory, CRIDPWork, OverlapFinding,
    DelegationOfPowerRegistry, Organisation, Department, StatutoryCommittee,
    RenewalEligibilityRule, User, CRIDPInvestigation, CRIDPCorrectiveAction,
    CRIDPDataQualityFinding
)
from app.services.cridp_verification_service import (
    verify_proposal_chainage_overlap, merge_intervals, sum_interval_length
)


def seed_cridp_verification_data(db_session=None):
    db: Session = db_session or SessionLocal()
    # Ensure all tables exist including new tables
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
            "monetary_limit_cr": 0.50,
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
            "monetary_limit_cr": 7.00,
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
            "monetary_limit_cr": 9999.00,
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
            "monetary_limit_cr": 0.50,
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
            "monetary_limit_cr": 1.00,
            "tender_excess_pct_limit": 5.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "Tamil Nadu Highways Manual Vol II & G.O. Ms. No. 29 (03.03.2022)",
            "operative_provisions": "Superintending Engineer is empowered to accept tenders up to ₹1.00 Crore with tender excess not exceeding 5%.",
            "notes": "Tender excess beyond 5% must be placed before Committee of Chief Engineers (COT)."
        },
        {
            "rule_id": "DOP-TA-CE-001",
            "go_reference": "G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O.(Ms) No. 163, dated 01.10.2012",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Chief Engineer",
            "monetary_limit_cr": 6.00,
            "tender_excess_pct_limit": 0.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "Tamil Nadu Highways Manual Vol II & G.O. Ms. No. 29 (03.03.2022)",
            "operative_provisions": "Chief Engineer is empowered to accept tenders up to ₹6.00 Crores with 0% tender excess.",
            "notes": "Tenders with excess beyond 0% or above ₹6.00 Crores must be placed before Committee of Chief Engineers (COT)."
        },
        {
            "rule_id": "DOP-TA-COT-001",
            "go_reference": "G.O.(Ms) No. 29, dated 03.03.2022 restoring G.O.(Ms) No. 163, dated 01.10.2012",
            "issuing_authority": "Highways and Minor Ports (HN.2) Department",
            "approval_category": "TENDER_ACCEPTANCE",
            "applicable_organisation": "Highways Department (C&M)",
            "applicable_work_type": "Road Works",
            "authority_designation": "Commissionerate of Tenders (COT)",
            "monetary_limit_cr": 100.00,
            "tender_excess_pct_limit": 10.0,
            "structural_design_separate": False,
            "effective_date": datetime.datetime(2022, 3, 3),
            "verification_status": "VERIFIED CURRENT",
            "supporting_source": "Tamil Nadu Highways Manual Vol II & G.O. Ms. No. 29 (03.03.2022)",
            "operative_provisions": "Commissionerate of Tenders (COT) is empowered to accept tenders up to ₹100.00 Crores with tender excess not exceeding 10%.",
            "notes": "Projects above ₹100.00 Crores or tender excess > 10% must be placed before Government."
        }
    ]

    for rule_data in delegation_rules:
        db.add(DelegationOfPowerRegistry(**rule_data))
    db.commit()

    print("Seeding Policy Renewal Eligibility Rules...")
    # -------------------------------------------------------------------------
    # 3. RENEWAL ELIGIBILITY POLICY RULE
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
    # 4. CANONICAL ROAD INVENTORY
    # -------------------------------------------------------------------------
    canonical_roads = [
        {"code": "SH-49", "name": "East Coast Road (Chennai - Mahabalipuram - Puducherry)", "road_type": "SH", "start": 11.5, "end": 135.0, "district": "Chengalpattu"},
        {"code": "SH-15", "name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor", "road_type": "SH", "start": 0.0, "end": 162.0, "district": "Coimbatore"},
        {"code": "SH-09", "name": "Cuddalore - Vridhachalam - Salem Road", "road_type": "SH", "start": 0.0, "end": 184.0, "district": "Cuddalore"},
        {"code": "SH-63", "name": "Thanjavur - Manamadurai Road", "road_type": "SH", "start": 0.0, "end": 142.5, "district": "Thanjavur"},
        {"code": "SH-110A", "name": "Medavakkam - Mambakkam Link Corridor", "road_type": "SH", "start": 0.0, "end": 18.4, "district": "Chengalpattu"},
        {"code": "SH-75", "name": "Madurai Ring Road to Tuticorin Port Connectivity Link", "road_type": "SH", "start": 0.0, "end": 64.0, "district": "Madurai"},
        {"code": "SH-162", "name": "Coimbatore Western Ring Road (Sugunapuram to Madukkarai)", "road_type": "SH", "start": 0.0, "end": 32.4, "district": "Coimbatore"},
        {"code": "SH-01", "name": "Chennai - Ennore Express Corridor", "road_type": "SH", "start": 0.0, "end": 28.5, "district": "Chennai"},
        {"code": "SH-20", "name": "Thoppur - Mettur - Bhavani - Erode Road", "road_type": "SH", "start": 0.0, "end": 96.0, "district": "Salem"},
        {"code": "SH-39", "name": "Tirunelveli - Shencottai - Kollam Road", "road_type": "SH", "start": 0.0, "end": 52.0, "district": "Tirunelveli"},
        {"code": "SH-58", "name": "Cuddalore - Chidambaram Coastal Link", "road_type": "SH", "start": 0.0, "end": 44.0, "district": "Cuddalore"},
        {"code": "MDR-102", "name": "Tambaram - Mudichur - Sriperumbudur Road", "road_type": "MDR", "start": 0.0, "end": 26.4, "district": "Chengalpattu"},
        {"code": "MDR-205", "name": "Salem - Yercaud Ghat Road", "road_type": "MDR", "start": 0.0, "end": 32.0, "district": "Salem"},
        {"code": "MDR-314", "name": "Madurai - Melur - Tirupathur Road", "road_type": "MDR", "start": 0.0, "end": 44.5, "district": "Madurai"},
        {"code": "MDR-401", "name": "Tiruchirappalli - Manachanallur Road", "road_type": "MDR", "start": 0.0, "end": 28.0, "district": "Tiruchirappalli"},
        {"code": "MDR-502", "name": "Tirunelveli - Ambasamudram Road", "road_type": "MDR", "start": 0.0, "end": 34.5, "district": "Tirunelveli"},
        {"code": "MDR-605", "name": "Erode - Perundurai Connector", "road_type": "MDR", "start": 0.0, "end": 24.0, "district": "Erode"},
        {"code": "ODR-045", "name": "Guduvanchery - Thiruporur Hub Link Road", "road_type": "ODR", "start": 0.0, "end": 18.2, "district": "Chengalpattu"},
        {"code": "ODR-112", "name": "Pollachi - Anaimalai Connector", "road_type": "ODR", "start": 0.0, "end": 16.8, "district": "Coimbatore"},
        {"code": "ODR-088", "name": "Tiruchirappalli - Thuraiyur Link", "road_type": "ODR", "start": 0.0, "end": 22.0, "district": "Tiruchirappalli"},
        {"code": "ODR-120", "name": "Kancheepuram - Walajabad Block Link", "road_type": "ODR", "start": 0.0, "end": 15.6, "district": "Kancheepuram"},
        {"code": "ODR-210", "name": "Salem - Omalur Rural Feeder", "road_type": "ODR", "start": 0.0, "end": 14.2, "district": "Salem"},
        {"code": "ODR-305", "name": "Madurai - Alanganallur Agricultural Link", "road_type": "ODR", "start": 0.0, "end": 19.5, "district": "Madurai"}
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

    print("Seeding 150+ Historical Work Records Across Tamil Nadu...")
    # -------------------------------------------------------------------------
    # 5. HISTORICAL WORK REGISTER (150+ records)
    # -------------------------------------------------------------------------
    # Clean up dependent tables first
    db.query(CRIDPCorrectiveAction).delete()
    db.query(CRIDPInvestigation).delete()
    db.query(CRIDPDataQualityFinding).delete()
    db.query(OverlapFinding).delete()
    db.query(CRIDPWork).delete()
    db.query(WorkHistory).delete()
    db.commit()

    history_records = [
        # Scenario 1 Previous Work: SH-49 Km 22 to 30 (Completed March 2024 - 2.7 yrs ago)
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
        # Scenario 2 Previous Work: SH-75 Km 10 to 18 (Completed claim without CC)
        {
            "work_reference": "WH-SH75-2021-BOT",
            "road_code": "SH-75",
            "road_name": "Madurai Ring Road to Tuticorin Port Connectivity Link",
            "road_category": "SH",
            "district": "Madurai",
            "division_name": "Madurai Special Division",
            "section_name": "Kappalur Section",
            "start_chainage": 10.0,
            "end_chainage": 18.0,
            "length_km": 8.0,
            "work_type": "BM & BC Overlay",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 110/2021",
            "sanction_date": datetime.datetime(2021, 6, 15),
            "sanctioned_cost_cr": 6.80,
            "contract_agreement_no": "AGR-SE-MDU-2021-08",
            "contractor_name": "M/s Pandian Infra Projects",
            "awarded_value_cr": 6.60,
            "physical_completion_date": datetime.datetime(2022, 11, 10),
            "actual_expenditure_cr": 6.55,
            "completion_certificate_ref": None,  # Missing completion certificate!
            "measurement_book_ref": "MB Unverified Dossier #44",
            "pavement_treatment": "Bituminous Concrete 40mm",
            "is_verified": False,
            "verification_source": "Unverified Field Claim"
        },
        # Scenario 3 Previous Work: SH-49 Km 10 to 15 (Completed Aug 2023 - 3.3 yrs ago)
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
        # Scenario 4 Previous Work: SH-162 Km 12 to 22 (Contractor delay, ongoing)
        {
            "work_reference": "WH-SH162-2023-01",
            "road_code": "SH-162",
            "road_name": "Coimbatore Western Ring Road (Sugunapuram to Madukkarai)",
            "road_category": "SH",
            "district": "Coimbatore",
            "division_name": "Coimbatore Special Division",
            "section_name": "Madukkarai Section",
            "start_chainage": 12.0,
            "end_chainage": 22.0,
            "length_km": 10.0,
            "work_type": "Widening to 4 Lanes with Paved Shoulders",
            "scheme_name": "CMRDP",
            "sanction_order_no": "G.O.(Ms) No. 74/2023",
            "sanction_date": datetime.datetime(2023, 3, 10),
            "sanctioned_cost_cr": 45.00,
            "contract_agreement_no": "AGR-CE-CBE-2023-19",
            "contractor_name": "M/s Kongu Highways Corp",
            "awarded_value_cr": 43.80,
            "physical_completion_date": None,  # Ongoing with 280 days delay
            "actual_expenditure_cr": 18.50,
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 719/Page 40",
            "pavement_treatment": "DBM 100mm + BC 50mm",
            "is_verified": True,
            "verification_source": "Coimbatore Circle Ongoing Works Register"
        },
        # Scenario 5 Previous Work: SH-63 Km 35 to 45 (Department drawing delay)
        {
            "work_reference": "WH-SH63-2023-01",
            "road_code": "SH-63",
            "road_name": "Thanjavur - Manamadurai Road",
            "road_category": "SH",
            "district": "Thanjavur",
            "division_name": "Thanjavur Division",
            "section_name": "Pattukkottai Section",
            "start_chainage": 35.0,
            "end_chainage": 45.0,
            "length_km": 10.0,
            "work_type": "Widening & Strengthening",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 62/2023",
            "sanction_date": datetime.datetime(2023, 4, 18),
            "sanctioned_cost_cr": 14.50,
            "contract_agreement_no": "AGR-SE-TNJ-2023-33",
            "contractor_name": "M/s Chola Infra Developers",
            "awarded_value_cr": 14.10,
            "physical_completion_date": datetime.datetime(2025, 10, 15),
            "actual_expenditure_cr": 13.90,
            "completion_certificate_ref": "CC-TNJ-2025-11",
            "measurement_book_ref": "MB No. 518/Page 92",
            "pavement_treatment": "WMM 250mm + DBM 75mm + BC 40mm",
            "is_verified": True,
            "verification_source": "Thanjavur Division MB Register"
        },
        # Scenario 6 Previous Work: MDR-102 Km 0 to 3.2 (Active Grade Separator project)
        {
            "work_reference": "WH-MDR102-GS-01",
            "road_code": "MDR-102",
            "road_name": "Tambaram - Mudichur - Sriperumbudur Road",
            "road_category": "MDR",
            "district": "Chennai",
            "division_name": "Tambaram Division",
            "section_name": "Tambaram Section",
            "start_chainage": 0.0,
            "end_chainage": 3.2,
            "length_km": 3.2,
            "work_type": "Construction of 4-Lane Grade Separator / Elevated Corridor",
            "scheme_name": "CMRDP",
            "sanction_order_no": "G.O.(Ms) No. 92/2024",
            "sanction_date": datetime.datetime(2024, 2, 18),
            "sanctioned_cost_cr": 85.00,
            "contract_agreement_no": "AGR-CE-MET-2024-05",
            "contractor_name": "PST Engineering Constructions",
            "awarded_value_cr": 81.20,
            "physical_completion_date": None,
            "actual_expenditure_cr": 22.40,
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 620/Page 15",
            "pavement_treatment": "Elevated Viaduct Deck + At-grade Service Roads",
            "is_verified": True,
            "verification_source": "Chennai Metro Circle Ongoing Works Register"
        },
        # Scenario 7 Previous Work: SH-15 Km 18 to 24 (Utility shifting dependency)
        {
            "work_reference": "WH-SH15-UT-01",
            "road_code": "SH-15",
            "road_name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor",
            "road_category": "SH",
            "district": "Coimbatore",
            "division_name": "Coimbatore Special Division",
            "section_name": "Myleripalayam Section",
            "start_chainage": 18.0,
            "end_chainage": 24.0,
            "length_km": 6.0,
            "work_type": "Widening to 4 Lanes",
            "scheme_name": "CKICP",
            "sanction_order_no": "G.O.(Ms) No. 128/2020",
            "sanction_date": datetime.datetime(2020, 8, 12),
            "sanctioned_cost_cr": 48.00,
            "contract_agreement_no": "CKICP-EPC-04B",
            "contractor_name": "M/s L&T Construction Ltd",
            "awarded_value_cr": 46.50,
            "physical_completion_date": None,
            "actual_expenditure_cr": 19.80,
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 812/Page 22",
            "pavement_treatment": "DBM 100mm + BC 50mm",
            "is_verified": True,
            "verification_source": "CKICP ADB Quarterly Review"
        },
        # Scenario 8 Previous Work: ODR-045 Km 2 to 4.5 (High Court stay on parcel)
        {
            "work_reference": "WH-ODR045-2023-01",
            "road_code": "ODR-045",
            "road_name": "Guduvanchery - Thiruporur Hub Link Road",
            "road_category": "ODR",
            "district": "Chengalpattu",
            "division_name": "Chengalpattu Division",
            "section_name": "Thiruporur Section",
            "start_chainage": 2.0,
            "end_chainage": 4.5,
            "length_km": 2.5,
            "work_type": "Widening from Single Lane to Intermediate Lane",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 104/2023",
            "sanction_date": datetime.datetime(2023, 9, 12),
            "sanctioned_cost_cr": 3.40,
            "contract_agreement_no": "AGR-DE-CPT-2023-88",
            "contractor_name": "M/s Thiruporur Builders",
            "awarded_value_cr": 3.30,
            "physical_completion_date": None,  # Injunction stay
            "actual_expenditure_cr": 0.45,
            "completion_certificate_ref": "STAYED_BY_HIGH_COURT",
            "measurement_book_ref": "MB No. 344/Page 05",
            "pavement_treatment": "WMM 150mm",
            "is_verified": True,
            "verification_source": "High Court Legal Cell Register"
        },
        # Scenario 9 Previous Work: SH-09 Km 40 to 48 (Physical financial mismatch)
        {
            "work_reference": "WH-SH09-2023-02",
            "road_code": "SH-09",
            "road_name": "Cuddalore - Vridhachalam - Salem Road",
            "road_category": "SH",
            "district": "Cuddalore",
            "division_name": "Cuddalore Division",
            "section_name": "Vridhachalam Section",
            "start_chainage": 40.0,
            "end_chainage": 48.0,
            "length_km": 8.0,
            "work_type": "BM & BC Overlay",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 55/2023",
            "sanction_date": datetime.datetime(2023, 6, 20),
            "sanctioned_cost_cr": 7.80,
            "contract_agreement_no": "AGR-SE-VLR-2023-44",
            "contractor_name": "M/s Delta Infrastructures",
            "awarded_value_cr": 7.60,
            "physical_completion_date": None,
            "actual_expenditure_cr": 6.85,  # 88% money spent for 52% progress
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 490/Page 18",
            "pavement_treatment": "Bituminous Concrete 40mm",
            "is_verified": False,
            "verification_source": "Cuddalore Division Reconciliation Memo"
        },
        # Scenario 10 Previous Work: MDR-314 Km 8 to 16 (Repeated quality failure)
        {
            "work_reference": "WH-MDR314-2024-01",
            "road_code": "MDR-314",
            "road_name": "Madurai - Melur - Tirupathur Road",
            "road_category": "MDR",
            "district": "Madurai",
            "division_name": "Madurai Division",
            "section_name": "Melur Section",
            "start_chainage": 8.0,
            "end_chainage": 16.0,
            "length_km": 8.0,
            "work_type": "Periodic Renewal / SDBC",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 81/2024",
            "sanction_date": datetime.datetime(2024, 1, 15),
            "sanctioned_cost_cr": 6.20,
            "contract_agreement_no": "AGR-SE-MDU-2024-11",
            "contractor_name": "M/s Madurai Roadways Ltd",
            "awarded_value_cr": 6.05,
            "physical_completion_date": datetime.datetime(2024, 9, 30),
            "actual_expenditure_cr": 6.00,
            "completion_certificate_ref": "CC-MDU-2024-50",
            "measurement_book_ref": "MB No. 510/Page 35",
            "pavement_treatment": "Semi-Dense Bituminous Concrete 25mm",
            "is_verified": True,
            "verification_source": "Madurai Division Quality Audit Report"
        },
        # Scenario 11 Previous Work: SH-15 Km 15 to 25 (Committed under ADB CKICP)
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
            "physical_completion_date": None,
            "actual_expenditure_cr": 98.40,
            "completion_certificate_ref": "WIP",
            "measurement_book_ref": "MB No. 811/Page 01",
            "pavement_treatment": "Heavy Duty Flexible Pavement (DBM 100mm + BC 50mm)",
            "is_verified": True,
            "verification_source": "CKICP ADB Quarterly Progress Review"
        },
        # Scenario 12 Previous Work: SH-110A Km 10 to 18 (Unresolved corrective action)
        {
            "work_reference": "WH-SH110A-2023-01",
            "road_code": "SH-110A",
            "road_name": "Medavakkam - Mambakkam Link Corridor",
            "road_category": "SH",
            "district": "Chengalpattu",
            "division_name": "Chengalpattu Division",
            "section_name": "Medavakkam Section",
            "start_chainage": 10.0,
            "end_chainage": 18.0,
            "length_km": 8.0,
            "work_type": "Strengthening & Paved Shoulders",
            "scheme_name": "CRIDP",
            "sanction_order_no": "G.O.(Ms) No. 95/2023",
            "sanction_date": datetime.datetime(2023, 7, 10),
            "sanctioned_cost_cr": 7.10,
            "contract_agreement_no": "AGR-SE-CPT-2023-71",
            "contractor_name": "M/s KGS Construction Co",
            "awarded_value_cr": 6.95,
            "physical_completion_date": datetime.datetime(2024, 8, 20),
            "actual_expenditure_cr": 6.90,
            "completion_certificate_ref": "CC-CPT-2024-81",
            "measurement_book_ref": "MB No. 440/Page 60",
            "pavement_treatment": "BM 50mm + SDBC 25mm",
            "is_verified": True,
            "verification_source": "Chengalpattu Circle Audit Para 14/2025"
        }
    ]

    # Add systematic historical records to reach 160+ total historical records
    corridor_districts = [
        ("SH-20", "Thoppur - Mettur - Bhavani - Erode Road", "SH", "Salem", "Mettur Division"),
        ("SH-39", "Tirunelveli - Shencottai - Kollam Road", "SH", "Tirunelveli", "Tenkasi Division"),
        ("SH-58", "Cuddalore - Chidambaram Coastal Link", "SH", "Cuddalore", "Chidambaram Division"),
        ("MDR-205", "Salem - Yercaud Ghat Road", "MDR", "Salem", "Salem Division"),
        ("MDR-401", "Tiruchirappalli - Manachanallur Road", "MDR", "Tiruchirappalli", "Trichy Division"),
        ("MDR-502", "Tirunelveli - Ambasamudram Road", "MDR", "Tirunelveli", "Ambasamudram Division"),
        ("MDR-605", "Erode - Perundurai Connector", "MDR", "Erode", "Erode Division"),
        ("ODR-112", "Pollachi - Anaimalai Connector", "ODR", "Coimbatore", "Pollachi Division"),
        ("ODR-088", "Tiruchirappalli - Thuraiyur Link", "ODR", "Tiruchirappalli", "Musiri Division"),
        ("ODR-120", "Kancheepuram - Walajabad Block Link", "ODR", "Kancheepuram", "Kancheepuram Division"),
        ("ODR-210", "Salem - Omalur Rural Feeder", "ODR", "Salem", "Omalur Division"),
        ("ODR-305", "Madurai - Alanganallur Agricultural Link", "ODR", "Madurai", "Vadipatti Division")
    ]

    contractor_pool = [
        "M/s Southern Infra Projects", "M/s Coastal Roadways Ltd", "M/s Pandian Infra Projects",
        "M/s Kongu Highways Corp", "M/s Chola Infra Developers", "PST Engineering Constructions",
        "M/s L&T Construction Ltd", "M/s Thiruporur Builders", "M/s Delta Infrastructures",
        "M/s Madurai Roadways Ltd", "M/s KGS Construction Co", "M/s Sri Murugan Infra"
    ]

    # Generate records systematically across years 2018 to 2025
    record_idx = 13
    for c_code, c_name, c_cat, c_dist, c_div in corridor_districts:
        for year in [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]:
            for offset in [0.0, 10.0]:
                start_ch = offset
                end_ch = offset + 8.0
                sanct_dt = datetime.datetime(year, 4 + (record_idx % 6), 10 + (record_idx % 15))
                comp_dt = sanct_dt + datetime.timedelta(days=280 + (record_idx % 90))
                c_name_sel = contractor_pool[record_idx % len(contractor_pool)]
                scheme = "CRIDP" if (record_idx % 4 != 0) else "CMRDP"

                history_records.append({
                    "work_reference": f"WH-{c_code.replace('-', '')}-{year}-{int(offset)}",
                    "road_code": c_code,
                    "road_name": c_name,
                    "road_category": c_cat,
                    "district": c_dist,
                    "division_name": c_div,
                    "section_name": f"{c_div.split()[0]} Section",
                    "start_chainage": start_ch,
                    "end_chainage": end_ch,
                    "length_km": 8.0,
                    "work_type": "Periodic Renewal / SDBC" if (record_idx % 2 == 0) else "BM & BC Overlay",
                    "scheme_name": scheme,
                    "sanction_order_no": f"G.O.(Ms) No. {10 + (record_idx % 120)}/{year}",
                    "sanction_date": sanct_dt,
                    "sanctioned_cost_cr": round(5.0 + (record_idx % 5) * 0.8, 2),
                    "contract_agreement_no": f"AGR-SE-{c_dist[:3].upper()}-{year}-{record_idx}",
                    "contractor_name": c_name_sel,
                    "awarded_value_cr": round(4.8 + (record_idx % 5) * 0.78, 2),
                    "physical_completion_date": comp_dt if year <= 2024 else None,
                    "actual_expenditure_cr": round(4.75 + (record_idx % 5) * 0.75, 2),
                    "completion_certificate_ref": f"CC-{c_dist[:3].upper()}-{year}-{record_idx}" if year <= 2024 else "WIP",
                    "measurement_book_ref": f"MB No. {300 + record_idx}/Page {record_idx % 80}",
                    "pavement_treatment": "Semi-Dense Bituminous Concrete 25mm" if (record_idx % 2 == 0) else "Bituminous Concrete 40mm",
                    "is_verified": True,
                    "verification_source": f"{c_dist} Circle Official Completion Register"
                })
                record_idx += 1

    # Insert all WorkHistory records
    for hw in history_records:
        r = db.query(Road).filter(Road.code == hw["road_code"]).first()
        if r:
            db.add(WorkHistory(road_id=r.id, **hw))
    db.commit()
    print(f"Total WorkHistory records seeded: {len(history_records)}")

    print("Seeding 75+ CRIDP Work Proposals for FY 2026-27 (with 12 Canonical Scenarios)...")
    # -------------------------------------------------------------------------
    # 6. CRIDP PROPOSALS (75+ records)
    # -------------------------------------------------------------------------
    sample_proposals = [
        # Scenario 1: Premature renewal (SH-49 Km 23 to 28)
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
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 12"
        },
        # Scenario 2: Reported completion without CC (SH-75 Km 10 to 18)
        {
            "proposal_code": "PROP-CRIDP-2026-008",
            "work_name": "Bituminous Overlay of SH-75 Madurai Ring Road km 10/0 to 18/0",
            "road_code": "SH-75",
            "road_name": "Madurai Ring Road to Tuticorin Port Connectivity Link",
            "road_category": "SH",
            "district": "Madurai",
            "circle_name": "Madurai Circle",
            "division_name": "Madurai Special Division",
            "section_name": "Kappalur Section",
            "start_chainage": 10.0,
            "end_chainage": 18.0,
            "proposed_length_km": 8.0,
            "proposed_work_type": "BM & BC Overlay",
            "financial_year": "2026-27",
            "estimated_cost_cr": 5.60,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 170.0,
            "pci_score": 52.0,
            "roughness_iri": 3800.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 44"
        },
        # Scenario 3: Partial chainage overlap (SH-49 Km 13 to 18)
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
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 08"
        },
        # Scenario 4: Contractor delay (SH-162 Km 12 to 22)
        {
            "proposal_code": "PROP-CRIDP-2026-009",
            "work_name": "Surface Renewal & Shoulder Paving of SH-162 km 12/0 to 22/0",
            "road_code": "SH-162",
            "road_name": "Coimbatore Western Ring Road (Sugunapuram to Madukkarai)",
            "road_category": "SH",
            "district": "Coimbatore",
            "circle_name": "Coimbatore Circle",
            "division_name": "Coimbatore Special Division",
            "section_name": "Madukkarai Section",
            "start_chainage": 12.0,
            "end_chainage": 22.0,
            "proposed_length_km": 10.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 7.80,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 160.0,
            "pci_score": 64.0,
            "roughness_iri": 3300.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 55"
        },
        # Scenario 5: Department delay (SH-63 Km 35 to 45)
        {
            "proposal_code": "PROP-CRIDP-2026-010",
            "work_name": "Strengthening of SH-63 Thanjavur km 35/0 to 45/0",
            "road_code": "SH-63",
            "road_name": "Thanjavur - Manamadurai Road",
            "road_category": "SH",
            "district": "Thanjavur",
            "circle_name": "Thanjavur Circle",
            "division_name": "Thanjavur Division",
            "section_name": "Pattukkottai Section",
            "start_chainage": 35.0,
            "end_chainage": 45.0,
            "proposed_length_km": 10.0,
            "proposed_work_type": "Widening & Strengthening",
            "financial_year": "2026-27",
            "estimated_cost_cr": 8.50,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 150.0,
            "pci_score": 58.0,
            "roughness_iri": 3700.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 62"
        },
        # Scenario 6: Land acquisition blocker (MDR-102 Km 0 to 3.2)
        {
            "proposal_code": "PROP-CRIDP-2026-007",
            "work_name": "Surface Renewal of MDR-102 Tambaram Junction km 0/0 to 3/2",
            "road_code": "MDR-102",
            "road_name": "Tambaram - Mudichur - Sriperumbudur Road",
            "road_category": "MDR",
            "district": "Chennai",
            "circle_name": "Chennai City Circle",
            "division_name": "Tambaram Division",
            "section_name": "Tambaram Section",
            "start_chainage": 0.0,
            "end_chainage": 3.2,
            "proposed_length_km": 3.2,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 2.20,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 150.0,
            "pci_score": 64.0,
            "roughness_iri": 3200.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 28"
        },
        # Scenario 7: Utility shifting blocker (SH-15 Km 18 to 24)
        {
            "proposal_code": "PROP-CRIDP-2026-011",
            "work_name": "Ghat Slope Base Renewal of SH-15 km 18/0 to 24/0",
            "road_code": "SH-15",
            "road_name": "Ooty - Kotagiri - Myleripalayam - Gudalur Ghat Corridor",
            "road_category": "SH",
            "district": "Coimbatore",
            "circle_name": "Coimbatore Circle",
            "division_name": "Coimbatore Special Division",
            "section_name": "Myleripalayam Section",
            "start_chainage": 18.0,
            "end_chainage": 24.0,
            "proposed_length_km": 6.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 5.40,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 170.0,
            "pci_score": 60.0,
            "roughness_iri": 3500.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 33"
        },
        # Scenario 8: Litigation stay (ODR-045 Km 2 to 4.5)
        {
            "proposal_code": "PROP-CRIDP-2026-012",
            "work_name": "Pavement Strengthening of ODR-045 km 2/0 to 4/5",
            "road_code": "ODR-045",
            "road_name": "Guduvanchery - Thiruporur Hub Link Road",
            "road_category": "ODR",
            "district": "Chengalpattu",
            "circle_name": "Chengalpattu Circle",
            "division_name": "Chengalpattu Division",
            "section_name": "Thiruporur Section",
            "start_chainage": 2.0,
            "end_chainage": 4.5,
            "proposed_length_km": 2.5,
            "proposed_work_type": "Widening & Strengthening",
            "financial_year": "2026-27",
            "estimated_cost_cr": 2.80,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 140.0,
            "pci_score": 45.0,
            "roughness_iri": 4200.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 89"
        },
        # Scenario 9: Physical-financial mismatch (SH-09 Km 40 to 48)
        {
            "proposal_code": "PROP-CRIDP-2026-013",
            "work_name": "Periodic Renewal of SH-09 km 40/0 to 48/0",
            "road_code": "SH-09",
            "road_name": "Cuddalore - Vridhachalam - Salem Road",
            "road_category": "SH",
            "district": "Cuddalore",
            "circle_name": "Villupuram Circle",
            "division_name": "Cuddalore Division",
            "section_name": "Vridhachalam Section",
            "start_chainage": 40.0,
            "end_chainage": 48.0,
            "proposed_length_km": 8.0,
            "proposed_work_type": "Periodic Renewal / SDBC",
            "financial_year": "2026-27",
            "estimated_cost_cr": 6.50,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 150.0,
            "pci_score": 55.0,
            "roughness_iri": 3600.0,
            "engineering_exception_justification": None,
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 71"
        },
        # Scenario 10: Repeated quality failure (MDR-314 Km 8 to 16)
        {
            "proposal_code": "PROP-CRIDP-2026-014",
            "work_name": "Reconstruction of Distressed Pavement on MDR-314 km 8/0 to 16/0",
            "road_code": "MDR-314",
            "road_name": "Madurai - Melur - Tirupathur Road",
            "road_category": "MDR",
            "district": "Madurai",
            "circle_name": "Madurai Circle",
            "division_name": "Madurai Division",
            "section_name": "Melur Section",
            "start_chainage": 8.0,
            "end_chainage": 16.0,
            "proposed_length_km": 8.0,
            "proposed_work_type": "Reconstruction & Stabilization",
            "financial_year": "2026-27",
            "estimated_cost_cr": 7.50,
            "existing_pavement_type": "Flexible",
            "existing_crust_thickness_mm": 130.0,
            "pci_score": 32.0,
            "roughness_iri": 5100.0,
            "engineering_exception_justification": "Subgrade CBR failure verified by HRS Guindy Report GEO-2025-104; requires lime stabilization and geotextile separator.",
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 95"
        },
        # Scenario 11: Multi-scheme conflict (SH-15 Km 15 to 25)
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
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 19"
        },
        # Scenario 12: Unresolved corrective action (SH-110A Km 0 to 8)
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
            "data_mode": "SIMULATED",
            "source_document_ref": "Annexure G.O.(Ms) No. 105 Page 37"
        }
    ]

    # Generate additional systematic proposals to reach 75+ total proposals
    p_seq = 15
    for c_code, c_name, c_cat, c_dist, c_div in corridor_districts:
        for offset in [0.0, 6.0, 12.0, 18.0, 24.0, 30.0, 36.0]:
            if p_seq > 105:
                break
            start_ch = offset
            end_ch = offset + 6.0
            p_cost = round(3.5 + (p_seq % 6) * 0.7, 2)
            p_pci = round(45.0 + (p_seq % 40) * 1.0, 1)

            sample_proposals.append({
                "proposal_code": f"PROP-CRIDP-2026-{str(p_seq).rjust(3, '0')}",
                "work_name": f"Periodic Renewal of {c_code} km {int(start_ch)}/0 to {int(end_ch)}/0",
                "road_code": c_code,
                "road_name": c_name,
                "road_category": c_cat,
                "district": c_dist,
                "circle_name": f"{c_dist} Circle",
                "division_name": c_div,
                "section_name": f"{c_div.split()[0]} Section",
                "start_chainage": start_ch,
                "end_chainage": end_ch,
                "proposed_length_km": 6.0,
                "proposed_work_type": "Periodic Renewal / SDBC" if (p_seq % 2 == 0) else "BM & BC Overlay",
                "financial_year": "2026-27",
                "estimated_cost_cr": p_cost,
                "existing_pavement_type": "Flexible",
                "existing_crust_thickness_mm": 150.0,
                "pci_score": p_pci,
                "roughness_iri": 3200.0,
                "engineering_exception_justification": None,
                "data_mode": "SIMULATED",
                "source_document_ref": f"Annexure G.O.(Ms) No. 105 Page {20 + (p_seq % 120)}"
            })
            p_seq += 1

    created_works = []
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
        created_works.append(work)

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

        if work.engineering_exception_justification:
            work.verification_status = "ENGINEERING EXCEPTION"
            work.duplicate_severity = "LOW"
            work.overlapping_length_km = res["overlapping_length_km"]
            work.eligible_length_km = work.proposed_length_km
            work.overlapping_chainage_description = res["overlapping_chainage_description"]
            work.potential_financial_exposure_cr = 0.0
            work.avoidable_expenditure_cr = 0.0
        else:
            work.verification_status = res["verification_classification"]
            work.duplicate_severity = res["duplicate_severity"]
            work.overlapping_length_km = res["overlapping_length_km"]
            work.eligible_length_km = res["eligible_length_km"]
            work.overlapping_chainage_description = res["overlapping_chainage_description"]

            rate_per_km = work.estimated_cost_cr / work.proposed_length_km if work.proposed_length_km > 0 else 0.0
            work.potential_financial_exposure_cr = round(rate_per_km * work.overlapping_length_km, 2)
            if work.verification_status in ["RECENTLY RENEWED", "DUPLICATE PROPOSAL"]:
                work.avoidable_expenditure_cr = work.potential_financial_exposure_cr
            elif work.verification_status == "PARTIALLY OVERLAPPING":
                work.avoidable_expenditure_cr = round(work.potential_financial_exposure_cr * 0.85, 2)
            else:
                work.avoidable_expenditure_cr = 0.0

        if work.estimated_cost_cr <= 0.50:
            work.approval_authority_required = "Divisional Engineer"
        elif work.estimated_cost_cr <= 7.00:
            work.approval_authority_required = "Superintending Engineer"
        else:
            work.approval_authority_required = "Chief Engineer"

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

    print(f"Total CRIDP proposals seeded: {len(created_works)}")

    print("Seeding Deep Investigation Dossiers for all Proposals...")
    # -------------------------------------------------------------------------
    # 7. CRIDP INVESTIGATIONS (Dossiers answering the 5 critical questions)
    # -------------------------------------------------------------------------
    scenario_map = {
        "PROP-CRIDP-2026-002": {
            "scenario_id": "SCN-01",
            "problem_category": "PREMATURE_RENEWAL",
            "problem_statement": "Premature renewal proposed on corridor completed only 2.7 years ago under CC-CPT-2024-14.",
            "problem_severity": "CRITICAL",
            "root_cause_category": "CONTRACTOR_CONTROLLED",
            "root_cause_analysis": "Pavement Condition Index is 78.0 (Good condition). Bitumen binder bleeding occurred locally, but structural crust is intact.",
            "evidence_chain": "Chengalpattu Circle Completion Certificate CC-CPT-2024-14 dated 20.03.2024; MB No. 428/Page 12.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 0,
            "recommended_action": "HOLD_PENDING_EVIDENCE",
            "decision_justification": "Proposal rejected in full under G.O. Ms. No. 84 five-year restriction. Reallocate ₹4.80 Cr to distressed corridors.",
            "deciding_authority": "Chief Engineer (C&M)"
        },
        "PROP-CRIDP-2026-008": {
            "scenario_id": "SCN-02",
            "problem_category": "UNVERIFIED_COMPLETION",
            "problem_statement": "Previous work reports 100% progress in annual return, but no digital completion certificate is registered.",
            "problem_severity": "HIGH",
            "root_cause_category": "DOCUMENTATION_DEFICIT",
            "root_cause_analysis": "Legacy BOT concessionaire handover MB records missing in digital portal; unverified bill passing.",
            "evidence_chain": "Madurai Division Unverified Dossier #44; missing CC in State Portal.",
            "is_critical_path_impact": False,
            "delay_days_investigated": 45,
            "recommended_action": "REVIEW_PREVIOUS_COMPLETION",
            "decision_justification": "DE Madurai to physically test-check legacy Measurement Book before technical sanction can be considered.",
            "deciding_authority": "Superintending Engineer, Madurai Circle"
        },
        "PROP-CRIDP-2026-001": {
            "scenario_id": "SCN-03",
            "problem_category": "PARTIALLY_OVERLAPPING",
            "problem_statement": "Chainage Km 13/0 to 15/0 (2.0 km) overlaps with WH-SH49-2023-01 completed August 2023 (3.3 yrs ago).",
            "problem_severity": "MEDIUM",
            "root_cause_category": "DEPARTMENT_CONTROLLED",
            "root_cause_analysis": "Section officer submitted composite 5.0 km package without checking sub-divisional completion register.",
            "evidence_chain": "Chengalpattu Completion Register MB No. 412/Page 55; CC-CPT-2023-89.",
            "is_critical_path_impact": False,
            "delay_days_investigated": 0,
            "recommended_action": "MODIFY_CHAINAGE",
            "decision_justification": "Truncate proposal to non-overlapping Km 15/000 to 18/000 (3.0 km). Save ₹1.80 Cr government funds.",
            "deciding_authority": "Superintending Engineer, Chengalpattu Circle"
        },
        "PROP-CRIDP-2026-009": {
            "scenario_id": "SCN-04",
            "problem_category": "SCHEDULE_OVERRUN",
            "problem_statement": "Ongoing 4-laning delayed by 280 days due to contractor failure to deploy adequate mechanical pavers.",
            "problem_severity": "HIGH",
            "root_cause_category": "CONTRACTOR_CONTROLLED",
            "root_cause_analysis": "Contractor liquidity crunch; plant capacity diverted to private sub-contracts in violation of agreement.",
            "evidence_chain": "Notice issued under Agreement Clause 60 dated 14.11.2025; SE Inspection Note #88.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 280,
            "recommended_action": "RESOLVE_EXISTING_CONTRACT",
            "decision_justification": "Enforce liquidated damages; contractor submitted revised recovery schedule for completion by March 2027.",
            "deciding_authority": "Chief Engineer, Projects"
        },
        "PROP-CRIDP-2026-010": {
            "scenario_id": "SCN-05",
            "problem_category": "SCHEDULE_OVERRUN",
            "problem_statement": "9 months schedule overrun caused by delayed release of revised culvert drawings from Planning wing.",
            "problem_severity": "MEDIUM",
            "root_cause_category": "DEPARTMENT_CONTROLLED",
            "root_cause_analysis": "Pattukkottai irrigation channel cross-drainage alignment modified following farmers representation.",
            "evidence_chain": "Planning Wing Letter No. 4410/P2/2024 dated 18.06.2024; GAD Approval #12.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 210,
            "recommended_action": "ELIGIBLE",
            "decision_justification": "Delay not attributable to contractor; formal Extension of Time (EoT) without penalties approved by CE.",
            "deciding_authority": "Chief Engineer (Planning & Designs)"
        },
        "PROP-CRIDP-2026-007": {
            "scenario_id": "SCN-06",
            "problem_category": "LAND_ACQUISITION_BLOCKER",
            "problem_statement": "100% duplication with active Grade Separator Project PRJ-TN-2026-002, currently blocked by 14 land parcels.",
            "problem_severity": "CRITICAL",
            "root_cause_category": "LAND_ACQUISITION",
            "root_cause_analysis": "Commercial structure owners in Tambaram market contested private valuation awards under RFCTLARR Act 2013.",
            "evidence_chain": "Special DRO Chengalpattu Award Enquiry Proceedings No. LA-TBM-2025-112.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 180,
            "recommended_action": "REFER_COMPETENT_AUTHORITY",
            "decision_justification": "Drop duplicate CRIDP proposal immediately. Coordinate with Revenue Department for Lok Adalat disposal.",
            "deciding_authority": "Chief Engineer (Metro)"
        },
        "PROP-CRIDP-2026-011": {
            "scenario_id": "SCN-07",
            "problem_category": "UTILITY_RELOCATION_BLOCKER",
            "problem_statement": "Corridor widening blocked by 4 TANGEDCO 110kV high-tension transmission towers in roadway carriageway.",
            "problem_severity": "HIGH",
            "root_cause_category": "UTILITY",
            "root_cause_analysis": "TANGEDCO grid shutdown delayed due to agricultural peak harvest power supply obligations.",
            "evidence_chain": "Highways Deposit Demand Draft ₹4.85 Cr receipt TANGEDCO/S/2026/1102; joint inspection note.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 120,
            "recommended_action": "HOLD_PENDING_EVIDENCE",
            "decision_justification": "Hold renewal until joint shutdown is completed and tower foundations relocated outside formation width.",
            "deciding_authority": "Superintending Engineer, Coimbatore Circle"
        },
        "PROP-CRIDP-2026-012": {
            "scenario_id": "SCN-08",
            "problem_category": "LITIGATION_STAY",
            "problem_statement": "Interim stay granted by Madras High Court (WP No. 4812/2026) restraining widening across wetland parcel.",
            "problem_severity": "CRITICAL",
            "root_cause_category": "LITIGATION",
            "root_cause_analysis": "Public Interest Litigation alleging encroachment on waterbody bund; counter-affidavit pending submission.",
            "evidence_chain": "Madras High Court Order in WMP No. 5110/2026 in WP 4812/2026 dated 12.02.2026.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 95,
            "recommended_action": "HOLD_PENDING_EVIDENCE",
            "decision_justification": "Statutory prohibition: No work or financial sanction permitted while High Court interim injunction is operative.",
            "deciding_authority": "Government / Special Government Pleader"
        },
        "PROP-CRIDP-2026-013": {
            "scenario_id": "SCN-09",
            "problem_category": "PHYSICAL_FINANCIAL_MISMATCH",
            "problem_statement": "88% expenditure recorded (₹6.85 Cr) while independently verified physical completion is only 52%.",
            "problem_severity": "HIGH",
            "root_cause_category": "CONTRACTOR_CONTROLLED",
            "root_cause_analysis": "Advance payments released for bitumen procurement without full field spreading and compaction in MB.",
            "evidence_chain": "Cuddalore Division Internal Audit Memo AO/CUD/2026/14; IFMS payment voucher records.",
            "is_critical_path_impact": False,
            "delay_days_investigated": 60,
            "recommended_action": "REVIEW_PREVIOUS_COMPLETION",
            "decision_justification": "Joint remeasurement ordered by Accounts Officer; halt further payments until reconciliation is certified.",
            "deciding_authority": "Superintending Engineer, Villupuram Circle"
        },
        "PROP-CRIDP-2026-014": {
            "scenario_id": "SCN-10",
            "problem_category": "QUALITY_DEFECT",
            "problem_statement": "Severe rutting and fatigue cracking developed within 14 months of surface renewal.",
            "problem_severity": "HIGH",
            "root_cause_category": "WEATHER_EXTERNAL",
            "root_cause_analysis": "Subgrade soil has soaked CBR < 3% with high water table; standard 25mm SDBC was an inadequate treatment.",
            "evidence_chain": "HRS Guindy Geotechnical Investigation Report No. HRS-GEO-2025-104; core test results.",
            "is_critical_path_impact": False,
            "delay_days_investigated": 0,
            "recommended_action": "SEEK_ENGINEERING_EXCEPTION",
            "decision_justification": "Approve engineering exception for lime-stabilized subbase and drainage blanket instead of simple surface renewal.",
            "deciding_authority": "Chief Engineer (C&M)"
        },
        "PROP-CRIDP-2026-005": {
            "scenario_id": "SCN-11",
            "problem_category": "MULTIPLE_SCHEME_CONFLICT",
            "problem_statement": "Proposed for renewal under CRIDP while stretch is already committed under ADB CKICP EPC package.",
            "problem_severity": "CRITICAL",
            "root_cause_category": "INTERDEPARTMENTAL",
            "root_cause_analysis": "C&M field sub-division submitted proposal unaware that CKICP wing had already awarded EPC-04 contract.",
            "evidence_chain": "CKICP Contract Agreement CKICP-EPC-04 dated 12.08.2020; ADB Loan Register #3864-IND.",
            "is_critical_path_impact": True,
            "delay_days_investigated": 0,
            "recommended_action": "HOLD_PENDING_EVIDENCE",
            "decision_justification": "Reject CRIDP proposal. Hand over alignment to CKICP Project Director to prevent double contracting.",
            "deciding_authority": "Chief Engineer (CKICP)"
        },
        "PROP-CRIDP-2026-006": {
            "scenario_id": "SCN-12",
            "problem_category": "UNRESOLVED_CORRECTIVE_ACTION",
            "problem_statement": "Open audit para 14/2025 on previous subgrade compaction quality remains unrectified.",
            "problem_severity": "MEDIUM",
            "root_cause_category": "CONTRACTOR_CONTROLLED",
            "root_cause_analysis": "Contractor failed to submit field density test certificates for 200m stretch at Km 4/200.",
            "evidence_chain": "Audit Para 14/2025 Inspection Register; Chengalpattu Lab Test Slip #219.",
            "is_critical_path_impact": False,
            "delay_days_investigated": 30,
            "recommended_action": "INVESTIGATE_PAVEMENT",
            "decision_justification": "Conduct destructive core sampling at contractor expense before considering new widening package.",
            "deciding_authority": "Superintending Engineer, Chengalpattu Circle"
        }
    }

    inv_count = 1
    for work in created_works:
        spec = scenario_map.get(work.proposal_code)
        if spec:
            inv = CRIDPInvestigation(
                proposal_id=work.id,
                investigation_code=f"INV-2026-{str(inv_count).rjust(3, '0')}",
                scenario_id=spec["scenario_id"],
                investigation_status="UNDER_INVESTIGATION" if inv_count % 3 != 0 else "COMPLETED",
                previous_work_summary=f"Investigated previous work history on {work.road_code} ({work.road_name})",
                previous_completion_status="VERIFIED_COMPLETED" if spec["scenario_id"] not in ("SCN-02", "SCN-04", "SCN-06", "SCN-07", "SCN-08", "SCN-09", "SCN-11") else "UNVERIFIED_CLAIM",
                problem_category=spec["problem_category"],
                problem_statement=spec["problem_statement"],
                problem_severity=spec["problem_severity"],
                root_cause_category=spec["root_cause_category"],
                root_cause_analysis=spec["root_cause_analysis"],
                evidence_chain=spec["evidence_chain"],
                is_critical_path_impact=spec["is_critical_path_impact"],
                delay_days_investigated=spec["delay_days_investigated"],
                financial_exposure_cr=work.potential_financial_exposure_cr,
                avoidable_expenditure_cr=work.avoidable_expenditure_cr,
                management_summary=f"Under review by {spec['deciding_authority']}",
                action_owner_designation="Superintending Engineer",
                recommended_action=spec["recommended_action"],
                decision_justification=spec["decision_justification"],
                deciding_authority=spec["deciding_authority"],
                delegation_rule_ref="G.O.(Ms) No. 11 & G.O.(Ms) No. 29",
                data_mode="SIMULATED"
            )
        else:
            is_overlap = work.overlapping_length_km > 0
            inv = CRIDPInvestigation(
                proposal_id=work.id,
                investigation_code=f"INV-2026-{str(inv_count).rjust(3, '0')}",
                scenario_id=None,
                investigation_status="COMPLETED" if not is_overlap else "UNDER_INVESTIGATION",
                previous_work_summary=f"Standard historical check on {work.road_code} ({work.road_name})",
                previous_completion_status="VERIFIED_COMPLETED",
                problem_category="PARTIALLY_OVERLAPPING" if is_overlap else "NONE",
                problem_statement=f"Routine screening for proposal {work.proposal_code}. Pavement condition PCI is {work.pci_score}." if not is_overlap else f"Overlapping stretch of {work.overlapping_length_km} km detected.",
                problem_severity="LOW" if not is_overlap else "MEDIUM",
                root_cause_category="NONE" if not is_overlap else "DEPARTMENT_CONTROLLED",
                root_cause_analysis="Routine pavement deterioration within expected design lifecycle." if not is_overlap else "Multi-year planning overlap across field sub-divisions.",
                evidence_chain=f"{work.district} Circle Pavement Condition Survey Register 2026.",
                is_critical_path_impact=False,
                delay_days_investigated=0,
                financial_exposure_cr=work.potential_financial_exposure_cr,
                avoidable_expenditure_cr=work.avoidable_expenditure_cr,
                management_summary=f"Processed by {work.division_name}",
                action_owner_designation="Divisional Engineer",
                recommended_action="ELIGIBLE" if not is_overlap else "MODIFY_CHAINAGE",
                decision_justification="Pavement condition justifies technical sanction under G.O. 11 powers." if not is_overlap else "Prune overlapping stretch before technical sanction.",
                deciding_authority=work.approval_authority_required,
                delegation_rule_ref="G.O.(Ms) No. 11 (21.01.2022)",
                data_mode="SIMULATED"
            )
        db.add(inv)
        inv_count += 1
    db.commit()
    print("CRIDP Investigations seeded successfully.")

    print("Seeding 45 Corrective Actions Across Statewide Pipeline...")
    # -------------------------------------------------------------------------
    # 8. CRIDP CORRECTIVE ACTIONS
    # -------------------------------------------------------------------------
    actions_data = [
        ("CAP-2026-001", "Core Sampling under Defect Liability on SH-49", "Extract 6 asphalt cores at Km 24/500 to test binder content and void ratio.", "Superintending Engineer, Chengalpattu Circle", "Er. R. Sundararajan", "Superintending Engineer", "TECHNICAL", "HIGH", 15, "IN_PROGRESS", 45, "CIRCLE", "LAB-CPT-2026-19"),
        ("CAP-2026-002", "Legacy Measurement Book Verification on SH-75", "Physical verification of concessionaire handover MBs at Madurai division record room.", "Divisional Engineer, Madurai Special Division", "Er. M. Senthil", "Divisional Engineer", "ADMINISTRATIVE", "HIGH", 10, "ACTION_ASSIGNED", 20, "DIVISION", "MEMO-MDU-2026-04"),
        ("CAP-2026-003", "Proposal Chainage Pruning for SH-49 ECR", "Issue revised priority list truncating proposal Km 13/0 to 18/0 to non-overlapping Km 15-18.", "Divisional Engineer, Chengalpattu Division", "Er. K. Natarajan", "Divisional Engineer", "TECHNICAL", "IMMEDIATE", 5, "CLOSED", 100, "CIRCLE", "REVISED-PR-SH49"),
        ("CAP-2026-004", "Enforce Clause 60 Notice on Coimbatore Ring Road", "Formal notice to contractor to remobilize asphalt paver and batching plant within 14 days.", "Chief Engineer, Projects", "Er. S. Selvakumar", "Chief Engineer", "CONTRACTUAL", "IMMEDIATE", 14, "IN_PROGRESS", 70, "CHIEF_ENGINEER", "NOTICE-CL60-CBE"),
        ("CAP-2026-005", "Expedite Pattukkottai Culvert GAD Drawings", "Concurrence of revised hydraulic cross-section by Chief Engineer (Planning).", "Chief Engineer (Planning & Designs)", "Er. V. Murugesan", "Chief Engineer", "TECHNICAL", "HIGH", 20, "CLOSED", 100, "CHIEF_ENGINEER", "GAD-PLAN-TNJ-12"),
        ("CAP-2026-006", "Conduct Lok Adalat for Tambaram Land Awards", "Special hearing by District Collector for consent award disbursement across 14 parcels.", "Special DRO (Land Acquisition)", "Dr. K. Senthil Nathan, IAS", "District Collector", "REVENUE", "HIGH", 30, "IN_PROGRESS", 65, "SECRETARY", "REV-LOKADALAT-09"),
        ("CAP-2026-007", "Coordinate TANGEDCO 110kV Line Shutdown", "Joint operational window for transmission tower relocation on SH-15 corridor.", "Superintending Engineer (TANGEDCO South)", "Er. M. Rajendran", "Superintending Engineer", "UTILITY", "IMMEDIATE", 12, "IN_PROGRESS", 80, "SECRETARY", "TNEB-SHUTDOWN-26"),
        ("CAP-2026-008", "Vacate Interim Stay in Madras High Court WP 4812", "Special Government Pleader to move vacate stay petition before Vacation Bench.", "Special Government Pleader", "Thiru R. Neelakandan", "Additional Advocate General", "LEGAL", "IMMEDIATE", 20, "IN_PROGRESS", 50, "SECRETARY", "HC-WMP-5110-2026"),
        ("CAP-2026-009", "Joint Remeasurement & Financial Reconciliation SH-09", "Audit wing and DE to perform 100% field check of asphalt overlay thickness.", "Accounts Officer & DE Cuddalore", "Thiru S. Balachandran", "Accounts Officer", "FINANCIAL", "HIGH", 15, "UNDER_INVESTIGATION", 30, "CIRCLE", "AUDIT-MEMO-CUD-14"),
        ("CAP-2026-010", "HRS Guindy Geotech Study for Subgrade Stabilization", "Benkelman Beam Deflection and FWD testing on distressed Melur corridor.", "Director, Highways Research Station", "Dr. P. Ravichandran", "Director (HRS)", "TECHNICAL", "HIGH", 25, "IN_PROGRESS", 60, "CHIEF_ENGINEER", "HRS-GEO-REPORT-26"),
        ("CAP-2026-011", "Cross-Wing Alignment Handover on SH-15", "Formal minutes of meeting transferring right-of-way from C&M to CKICP Project Director.", "Chief Engineer (C&M) / Project Director (CKICP)", "Er. S. Selvakumar", "Chief Engineer", "ADMINISTRATIVE", "ROUTINE", 10, "CLOSED", 100, "CHIEF_ENGINEER", "MOU-CM-CKICP-04"),
        ("CAP-2026-012", "Destructive Core Compaction Audit on SH-110A", "Extract subgrade cores at 50m intervals to verify modified Proctor density compliance.", "Superintending Engineer (Quality Control)", "Er. V. Murugesan", "Superintending Engineer", "TECHNICAL", "HIGH", 15, "IN_PROGRESS", 40, "CIRCLE", "QC-CORE-TEST-110A")
    ]

    for idx in range(13, 46):
        c_code_sel = corridor_districts[(idx - 13) % len(corridor_districts)][0]
        actions_data.append((
            f"CAP-2026-{str(idx).rjust(3, '0')}",
            f"Routine Drainage and Pavement Audit on {c_code_sel}",
            f"Pre-monsoon longitudinal drain desilting and shoulder grading on corridor {c_code_sel}.",
            "Divisional Engineer, Concerned Division",
            f"Er. Assistant Engineer #{idx}",
            "Assistant Divisional Engineer",
            "TECHNICAL",
            "ROUTINE" if idx % 2 == 0 else "HIGH",
            30,
            "CLOSED" if idx % 3 == 0 else ("IN_PROGRESS" if idx % 2 == 0 else "OPEN"),
            100 if idx % 3 == 0 else (50 if idx % 2 == 0 else 10),
            "DIVISION",
            f"DOC-ROUTINE-QC-{idx}"
        ))

    now = datetime.datetime.utcnow()
    for item in actions_data:
        code, title, desc, auth, oname, odesig, cat, prio, days_target, st, pct, esc, doc = item
        db.add(CRIDPCorrectiveAction(
            action_code=code,
            action_title=title,
            action_description=desc,
            responsible_authority=auth,
            action_owner_name=oname,
            action_owner_designation=odesig,
            action_category=cat,
            priority=prio,
            start_date=now - datetime.timedelta(days=10),
            target_date=now + datetime.timedelta(days=days_target - 10),
            status=st,
            progress_pct=pct,
            escalation_level=esc,
            supporting_document_ref=doc,
            last_update_notes="Progress reviewed in monthly Chief Engineer coordination review.",
            data_mode="SIMULATED",
            created_at=now,
            updated_at=now
        ))
    db.commit()
    print("CRIDP Corrective Actions seeded successfully.")

    print("Seeding 30 Data Quality Findings Across Historical & Proposal Registers...")
    # -------------------------------------------------------------------------
    # 9. CRIDP DATA QUALITY AUDIT FINDINGS (12 Categories)
    # -------------------------------------------------------------------------
    dq_findings = [
        ("DQ-2026-001", "MISSING_COMPLETION_DATE", "WH-SH75-2021-BOT", "SH-75", "Madurai", "Madurai Special Division", "Predefined Report (1).csv", "Row #412", "Record has physical progress 100% but blank completion date.", "WARNING", "Field inspection and measurement book verification required.", "DETECTED", 65.0),
        ("DQ-2026-002", "UNVERIFIED_100_PROGRESS", "WH-SH75-2021-BOT", "SH-75", "Madurai", "Madurai Special Division", "Predefined Report (1).csv", "Row #412", "Reported 100% progress without digitized completion certificate.", "HIGH", "DE Madurai to upload signed completion certificate.", "DETECTED", 58.0),
        ("DQ-2026-003", "MISSING_CHAINAGE", "WH-SH15-MISC-02", "SH-15", "Coimbatore", "Coimbatore Division", "Predefined Report (1).csv", "Row #890", "Start and end chainage entries recorded as 0/0 to 0/0.", "CRITICAL", "Re-extract chainage from original Technical Sanction docket.", "DETECTED", 42.0),
        ("DQ-2026-004", "ZERO_LENGTH_ENTRY", "WH-MDR205-01", "MDR-205", "Salem", "Salem Division", "Predefined Report (1).csv", "Row #1204", "Project length recorded as 0.00 km; requires interpretation.", "WARNING", "Calculate length from start/end chainage difference.", "RECONCILED", 85.0),
        ("DQ-2026-005", "DUPLICATE_JOB_CODE", "JOB-CRIDP-2025-88", "SH-49", "Chengalpattu", "Chengalpattu Division", "CRIDP Annexures PDF", "Page 14", "Job code repeated for two distinct work packages.", "CRITICAL", "Issue corrigendum assigning unique sub-job codes.", "DETECTED", 50.0),
        ("DQ-2026-006", "INCONSISTENT_DATES", "WH-SH09-2023-02", "SH-09", "Cuddalore", "Cuddalore Division", "Predefined Report (1).csv", "Row #1560", "Actual completion date precedes contract award date.", "CRITICAL", "Rectify date transposition in divisional progress database.", "DETECTED", 40.0),
        ("DQ-2026-007", "INVALID_MILESTONE_SEQUENCE", "WH-SH162-2023-01", "SH-162", "Coimbatore", "Coimbatore Special Division", "Predefined Report (1).csv", "Row #1890", "Milestone 75% delay recorded before milestone 50% reached.", "WARNING", "Recompute milestone sequence based on cumulative financial outturn.", "DETECTED", 60.0),
        ("DQ-2026-008", "UNRECONCILED_EXPENDITURE", "WH-SH09-2023-02", "SH-09", "Cuddalore", "Cuddalore Division", "Predefined Report (1).csv", "Row #2102", "Expenditure incurred ₹6.85 Cr exceeds proportional physical outturn 52%.", "HIGH", "Reconciliation by Accounts Officer and Divisional Engineer required.", "DETECTED", 55.0),
        ("DQ-2026-009", "CONFLICTING_STATUS", "WH-MDR102-GS-01", "MDR-102", "Chennai", "Tambaram Division", "Predefined Report (1).csv", "Row #2450", "DelayStatus shows 'No Delay' while overdue by 180 days.", "HIGH", "Recalculate delay using contractual fixed end date.", "RECONCILED", 90.0),
        ("DQ-2026-010", "UNVERIFIED_COURT_STAY", "WH-ODR045-2023-01", "ODR-045", "Chengalpattu", "Chengalpattu Division", "Predefined Report (1).csv", "Row #2801", "Stay order cited without verified High Court order copy.", "HIGH", "Obtain certified copy from High Court Legal Cell.", "RECONCILED", 95.0),
        ("DQ-2026-011", "MISSING_SOURCE_LINEAGE", "WH-ODR112-2022-01", "ODR-112", "Coimbatore", "Pollachi Division", "Predefined Report (1).csv", "Row #3110", "Source G.O. number recorded as 'GO MS /2022' without serial number.", "WARNING", "Lookup G.O. register in Secretariat records.", "DETECTED", 70.0),
        ("DQ-2026-012", "UNKNOWN_HISTORICAL_COVERAGE", "SH-39", "SH-39", "Tirunelveli", "Tenkasi Division", "CRIDP Historical Register", "Register Vol III", "Gap in historical maintenance records between 2017 and 2020.", "INFO", "Conduct core thickness testing to establish pavement life.", "WAIVED", 75.0)
    ]

    for idx in range(13, 31):
        c_code_sel = corridor_districts[(idx - 13) % len(corridor_districts)][0]
        c_dist_sel = corridor_districts[(idx - 13) % len(corridor_districts)][3]
        c_div_sel = corridor_districts[(idx - 13) % len(corridor_districts)][4]
        dq_findings.append((
            f"DQ-2026-{str(idx).rjust(3, '0')}",
            "MISSING_COMPLETION_DATE" if idx % 2 == 0 else "INCONSISTENT_DATES",
            f"WH-{c_code_sel.replace('-', '')}-2022",
            c_code_sel,
            c_dist_sel,
            c_div_sel,
            "Predefined Report (1).csv",
            f"Row #{3000 + idx * 15}",
            f"Routine timestamp variance detected on historical asset record {c_code_sel}.",
            "INFO",
            "Auto-harmonized with divisional completion ledger.",
            "RECONCILED",
            88.0
        ))

    for item in dq_findings:
        fcode, cat, rec_id, rcode, dist, div, sfile, srow, desc, sev, remed, vstat, cscore = item
        db.add(CRIDPDataQualityFinding(
            finding_code=fcode,
            metric_category=cat,
            record_identifier=rec_id,
            road_code=rcode,
            district=dist,
            division_name=div,
            source_filename=sfile,
            source_row_or_page=srow,
            anomaly_description=desc,
            severity=sev,
            suggested_remediation=remed,
            validation_status=vstat,
            data_confidence_score=cscore,
            created_at=datetime.datetime.utcnow()
        ))
    db.commit()
    print("CRIDP Data Quality findings seeded successfully.")

    print("All CRIDP Verification and Historical Risk Intelligence Data Seeded Successfully.")
    if not db_session:
        db.close()


if __name__ == "__main__":
    seed_cridp_verification_data()
