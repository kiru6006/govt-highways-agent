import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import (
    Project, MajorWorksProjectReviewSnapshot, ProjectBlocker,
    DelayInvestigation, LossPreventionLedgerRecord, MitigationRecommendation,
    PreConstructionGateCheck
)

def seed_major_works_blockers_data(db_session: Session = None):
    should_close = False
    if db_session is not None:
        db = db_session
    else:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        review_date = datetime.datetime(2026, 9, 21, tzinfo=datetime.timezone.utc)

        # -----------------------------------------------------------------
        # 1. ENSURE CANONICAL PROJECT FOR REFERENCE CASE 5566 EXISTS
        # -----------------------------------------------------------------
        all_projects = db.query(Project).all()
        ref_p = all_projects[0] if all_projects else None

        p_5566 = db.query(Project).filter(Project.project_code == "PRJ-TN-5566").first()
        if not p_5566:
            p_5566 = Project(
                project_code="PRJ-TN-5566",
                title="ROB at LC-13, Thirunindravur–Veppampattu (Southern Railway Section)",
                sanctioned_cost_cr=45.50,
                estimated_cost_cr=45.50,
                expenditure_to_date_cr=38.36,
                physical_progress_pct=78.0,
                financial_progress_pct=84.3,
                status="DELAYED",
                road_type="ODR",
                funding_source="Railway Works Programme",
                total_length_km=1.24,
                verification_status="VERIFIED_OFFICIAL",
                zone_id=ref_p.zone_id if ref_p else 1,
                circle_id=ref_p.circle_id if ref_p else 1,
                division_id=ref_p.division_id if ref_p else 1,
                executing_department_id=ref_p.executing_department_id if ref_p else 1,
                created_at=now,
                updated_at=now
            )
            db.add(p_5566)
            db.commit()
            db.refresh(p_5566)

        all_projects = db.query(Project).all()
        ref_proj_id = p_5566.id
        proj_ids = [p.id for p in all_projects] if all_projects else [ref_proj_id]

        # -----------------------------------------------------------------
        # 2. SEED 31 MAJOR WORKS REVIEW SNAPSHOTS (Chennai C&M Region)
        # Source Document: More than 50Cr works details as on 21.09.2026.pdf
        # -----------------------------------------------------------------
        major_works_raw = [
            # 1: Canonical Reference Case 5566
            {
                "source_project_id": "5566",
                "canonical_project_id": ref_proj_id,
                "project_name": "ROB at LC-13, Thirunindravur–Veppampattu",
                "scheme_name": "Railway Works Programme / CRIDP",
                "circle_name": "Chennai C&M",
                "division_name": "Tiruvallur",
                "road_or_bridge_details": "ROB at LC-13 (Railway Km 28/12-14 in between Thirunindravur & Veppampattu Stations)",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.24,
                "total_length_km": 1.24,
                "contractor_name": "M/s Sri Balaji Infra Projects Pvt Ltd",
                "technical_sanction_cr": 45.50,
                "contract_value_cr": 41.20,
                "work_commencement_date": datetime.datetime(2023, 9, 21, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 3, 20, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 1, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 317,
                "physical_progress_pct": 78.0,
                "financial_progress_pct": 84.3,
                "expenditure_cr": 38.36,
                "agreement_milestones": "Milestone-1: Substructure 100% (Completed); Milestone-2: Approach Retaining Walls 95% (Completed); Milestone-3: Railway Composite Girder Launching (Pending); Milestone-4: Wearing Coat & Approaches (Pending)",
                "actual_milestone_status": "Railway portion superstructure launched partially. Final span awaiting CRS clearance.",
                "work_remarks": "Railway-side work reported. Exact critical path blocker unestablished by site audit. No litigation reported on record. Total financial loss unestablished. EOT and remaining CPM programme required.",
                "land_acquisition_remarks": "Highways approaches land 100% acquired and handed over to contractor.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "No court case or civil injunction on record.",
                "railway_approval_remarks": "General Arrangement Drawing approved by Southern Railway. Track power block and safety slot under coordination with DRM Chennai.",
                "utility_shifting_remarks": "TANGEDCO LT lines relocated in 2024. No pending utility blocker.",
                "source_page_number": 1,
                "risk_level": "CRITICAL"
            },
            # 2
            {
                "source_project_id": "5102",
                "canonical_project_id": proj_ids[0],
                "project_name": "Widening to 4-Lanes with Paved Shoulders of SH-49 (ECR) km 22/0 to 45/0",
                "scheme_name": "CRIDP State Highway Upgradation",
                "circle_name": "Chennai C&M",
                "division_name": "Chengalpattu",
                "road_or_bridge_details": "East Coast Road (SH-49) 4-lane expansion",
                "start_chainage_km": 22.0,
                "end_chainage_km": 45.0,
                "total_length_km": 23.0,
                "contractor_name": "M/s RPP Infra Projects Ltd",
                "technical_sanction_cr": 165.00,
                "contract_value_cr": 145.20,
                "work_commencement_date": datetime.datetime(2023, 6, 15, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 12, 14, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 11, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 351,
                "physical_progress_pct": 56.8,
                "financial_progress_pct": 52.0,
                "expenditure_cr": 82.50,
                "agreement_milestones": "Km 22 to 34 DBM/BC (Completed); Km 34 to 45 LA Pending stretches (Delayed)",
                "actual_milestone_status": "Delayed by land acquisition in 4 coastal villages.",
                "work_remarks": "LA Sec 15(2) enquiry completed. Award pending in Chengalpattu Revenue Unit.",
                "land_acquisition_remarks": "8.4 hectares pending private patta land acquisition across 4 revenue villages.",
                "forest_clearance_remarks": "CRZ clearance obtained from TNCZMA.",
                "court_case_remarks": "Two interim stay petitions dismissed by Madras HC.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "14 Nos TANGEDCO transformers shifting estimate sanctioned.",
                "source_page_number": 2,
                "risk_level": "HIGH"
            },
            # 3
            {
                "source_project_id": "5211",
                "canonical_project_id": proj_ids[1 % len(proj_ids)],
                "project_name": "4-Lane Grade Separator at Tambaram-Mudichur Junction on SH-110",
                "scheme_name": "Chennai Metropolitan Development Plan (CMDP)",
                "circle_name": "Chennai C&M",
                "division_name": "Chennai City South",
                "road_or_bridge_details": "Bi-directional 4-Lane Flyover with Rotary at Grade",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.85,
                "total_length_km": 1.85,
                "contractor_name": "M/s URC Construction Pvt Ltd",
                "technical_sanction_cr": 98.00,
                "contract_value_cr": 89.40,
                "work_commencement_date": datetime.datetime(2023, 11, 10, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 5, 9, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 2, 28, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 295,
                "physical_progress_pct": 72.0,
                "financial_progress_pct": 71.8,
                "expenditure_cr": 64.20,
                "agreement_milestones": "Pier foundations (100%); Pier caps (88%); Girder casting (75%)",
                "actual_milestone_status": "Piers 14-16 delayed due to 110kV HT transmission line crossing.",
                "work_remarks": "TANGEDCO tower line modification in progress.",
                "land_acquisition_remarks": "Govt poramboke land alienated. No private LA.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "TANGEDCO 110kV Tower #4B shifting in progress.",
                "source_page_number": 3,
                "risk_level": "MEDIUM"
            },
            # 4
            {
                "source_project_id": "5308",
                "canonical_project_id": proj_ids[2 % len(proj_ids)],
                "project_name": "Construction of ROB in lieu of LC-24 at Vandalur Station Yard",
                "scheme_name": "Railway Works Programme",
                "circle_name": "Chennai C&M",
                "division_name": "Chengalpattu",
                "road_or_bridge_details": "4-Lane ROB with service roads at LC-24",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.40,
                "total_length_km": 1.40,
                "contractor_name": "M/s PST Engineering Construction",
                "technical_sanction_cr": 72.00,
                "contract_value_cr": 62.80,
                "work_commencement_date": datetime.datetime(2024, 2, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 7, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 6, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 334,
                "physical_progress_pct": 65.4,
                "financial_progress_pct": 65.4,
                "expenditure_cr": 41.10,
                "agreement_milestones": "Approach viaduct 80%; Railway span fabrication 50%",
                "actual_milestone_status": "Southern Railway CRS clearance pending for track closure.",
                "work_remarks": "Joint inspection completed with Railway Deputy CE (Bridges).",
                "land_acquisition_remarks": "0.45 ha Railway boundary strip transfer completed.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "CRS sanction applied on 18.06.2026.",
                "utility_shifting_remarks": "TWAD water main line protected.",
                "source_page_number": 4,
                "risk_level": "HIGH"
            },
            # 5
            {
                "source_project_id": "5415",
                "canonical_project_id": proj_ids[3 % len(proj_ids)],
                "project_name": "Widening to 6-Lane Divided Carriageway of Rajiv Gandhi Salai (OMR) Phase-II km 20/0 to 31/5",
                "scheme_name": "CMDP Special Infrastructure",
                "circle_name": "Chennai C&M",
                "division_name": "Chengalpattu",
                "road_or_bridge_details": "OMR Siruseri to Mahabalipuram corridor",
                "start_chainage_km": 20.0,
                "end_chainage_km": 31.5,
                "total_length_km": 11.5,
                "contractor_name": "M/s GVR Infra Projects Ltd",
                "technical_sanction_cr": 235.00,
                "contract_value_cr": 210.00,
                "work_commencement_date": datetime.datetime(2023, 4, 10, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 10, 9, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 3, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 538,
                "physical_progress_pct": 45.2,
                "financial_progress_pct": 45.2,
                "expenditure_cr": 95.00,
                "agreement_milestones": "Km 20-25 widen (60%); Km 25-31.5 LA bottleneck (30%)",
                "actual_milestone_status": "Severe LA delay and CMWSSB desalination main pipeline relocation.",
                "work_remarks": "Special DRO (LA) reviewing compensation objections.",
                "land_acquisition_remarks": "14.2 ha land acquisition ongoing under TN Highways Act 2001.",
                "forest_clearance_remarks": "Forest clearance obtained for 1.8 ha social forestry stretch.",
                "court_case_remarks": "WP No. 12903/2024 pending before Madras HC; no injunction.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "CMWSSB 1000mm MS pipeline shifting work in progress.",
                "source_page_number": 5,
                "risk_level": "CRITICAL"
            },
            # 6
            {
                "source_project_id": "5489",
                "canonical_project_id": proj_ids[0],
                "project_name": "Construction of 4-Lane Elevated Flyover at Madhya Kailash Junction",
                "scheme_name": "CMDP Urban Congestion Relief",
                "circle_name": "Chennai C&M",
                "division_name": "Chennai City South",
                "road_or_bridge_details": "Madhya Kailash junction flyover connecting Sardar Patel Road & Rajiv Gandhi Salai",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.15,
                "total_length_km": 1.15,
                "contractor_name": "M/s Larsen & Toubro ECC",
                "technical_sanction_cr": 84.00,
                "contract_value_cr": 75.30,
                "work_commencement_date": datetime.datetime(2024, 1, 15, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 7, 14, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 12, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 170,
                "physical_progress_pct": 77.0,
                "financial_progress_pct": 77.0,
                "expenditure_cr": 58.00,
                "agreement_milestones": "Substructure complete; Superstructure 70%",
                "actual_milestone_status": "Traffic diversion NOC and CMRL interface coordination.",
                "work_remarks": "CMRL Phase-2 corridor interface required foundation redesign for Pier P8.",
                "land_acquisition_remarks": "Defense / Canal boundary clearance verified.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "MRTS station interface cleared.",
                "utility_shifting_remarks": "OFC and telecom cables shifting completed.",
                "source_page_number": 6,
                "risk_level": "MEDIUM"
            },
            # 7
            {
                "source_project_id": "5501",
                "canonical_project_id": proj_ids[1 % len(proj_ids)],
                "project_name": "Formation of Chennai Peripheral Ring Road (CPRR) Section-I Northern Port Access",
                "scheme_name": "State Mega Projects (JICA / State Fund)",
                "circle_name": "Chennai C&M",
                "division_name": "Tiruvallur",
                "road_or_bridge_details": "Access controlled 6-lane highway connecting Ennore Port to Thatchur",
                "start_chainage_km": 0.0,
                "end_chainage_km": 25.40,
                "total_length_km": 25.40,
                "contractor_name": "M/s Adani Road Transport Ltd",
                "technical_sanction_cr": 420.00,
                "contract_value_cr": 380.00,
                "work_commencement_date": datetime.datetime(2022, 10, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 9, 30, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 4, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 577,
                "physical_progress_pct": 52.1,
                "financial_progress_pct": 52.1,
                "expenditure_cr": 198.00,
                "agreement_milestones": "Section 0-10km (80%); Section 10-25km (40%)",
                "actual_milestone_status": "Delayed due to CRZ Clearance conditions and Kosasthalaiyar bridge work.",
                "work_remarks": "MoEFCC CRZ conditions compliance monitored by TNPCB.",
                "land_acquisition_remarks": "210 hectares acquired; 18 hectares port boundary disputed.",
                "forest_clearance_remarks": "Mangrove conservation buffer area clearance granted.",
                "court_case_remarks": "NGT Southern Bench matter disposed with mitigation directions.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "Ennore Thermal Power Station slurry pipeline crossed.",
                "source_page_number": 7,
                "risk_level": "CRITICAL"
            },
            # 8
            {
                "source_project_id": "5522",
                "canonical_project_id": proj_ids[2 % len(proj_ids)],
                "project_name": "Construction of Flyover at Singaperumal Koil Junction on GST Road NH-45",
                "scheme_name": "CRIDP NH Wing Coordination",
                "circle_name": "Chennai C&M",
                "division_name": "Chengalpattu",
                "road_or_bridge_details": "4-lane flyover at km 44/6 GST road",
                "start_chainage_km": 44.0,
                "end_chainage_km": 46.2,
                "total_length_km": 2.20,
                "contractor_name": "M/s B.R. Infra Developers",
                "technical_sanction_cr": 105.00,
                "contract_value_cr": 92.50,
                "work_commencement_date": datetime.datetime(2023, 8, 20, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 2, 19, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 10, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 254,
                "physical_progress_pct": 83.0,
                "financial_progress_pct": 83.0,
                "expenditure_cr": 76.80,
                "agreement_milestones": "Structure completed; Service road balance",
                "actual_milestone_status": "Encroachment removal and religious structure relocation pending at service road.",
                "work_remarks": "Peace committee meeting convened by Tahsildar Chengalpattu.",
                "land_acquisition_remarks": "HR&CE temple land alienation order issued.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Writ petition filed by local shop owners dismissed.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "Complete",
                "source_page_number": 8,
                "risk_level": "MEDIUM"
            },
            # 9
            {
                "source_project_id": "5540",
                "canonical_project_id": proj_ids[3 % len(proj_ids)],
                "project_name": "Widening and Reconstruction of Bridges on SH-57 Singaperumal Koil - Sriperumbudur Road",
                "scheme_name": "CRIDP Major Road Improvement",
                "circle_name": "Chennai C&M",
                "division_name": "Chengalpattu",
                "road_or_bridge_details": "4-lane dual carriageway widening and 6 major bridges",
                "start_chainage_km": 0.0,
                "end_chainage_km": 18.5,
                "total_length_km": 18.5,
                "contractor_name": "M/s KCP Infra Ltd",
                "technical_sanction_cr": 76.50,
                "contract_value_cr": 68.70,
                "work_commencement_date": datetime.datetime(2023, 7, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 12, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 8, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 243,
                "physical_progress_pct": 71.8,
                "financial_progress_pct": 71.8,
                "expenditure_cr": 49.30,
                "agreement_milestones": "Road widening 85%; Bridge No 3 & 5 delayed",
                "actual_milestone_status": "WRD canal water release restriction during irrigation season.",
                "work_remarks": "WRD Palar Basin division NOC obtained with seasonal dewatering conditions.",
                "land_acquisition_remarks": "Complete",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "Underground optical fiber lines relocated.",
                "source_page_number": 9,
                "risk_level": "LOW"
            },
            # 10
            {
                "source_project_id": "5578",
                "canonical_project_id": proj_ids[0],
                "project_name": "Construction of ROB at LC-16 Avadi - Pattabiram on CTH Road (SH-205)",
                "scheme_name": "Railway Works Programme",
                "circle_name": "Chennai C&M",
                "division_name": "Tiruvallur",
                "road_or_bridge_details": "4-Lane ROB with rotary and ramps",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.60,
                "total_length_km": 1.60,
                "contractor_name": "M/s RPP - Balaji Joint Venture",
                "technical_sanction_cr": 64.00,
                "contract_value_cr": 54.60,
                "work_commencement_date": datetime.datetime(2024, 3, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 8, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 4, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 242,
                "physical_progress_pct": 58.7,
                "financial_progress_pct": 58.7,
                "expenditure_cr": 32.10,
                "agreement_milestones": "Highways approaches 75%; Railway span foundation in progress",
                "actual_milestone_status": "Southern Railway design GAD modification required for OHE mast clearance.",
                "work_remarks": "Modified GAD submitted to Chief Bridge Engineer Southern Railway.",
                "land_acquisition_remarks": "Complete",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Modified GAD awaiting approval.",
                "utility_shifting_remarks": "HT power cable shifting completed.",
                "source_page_number": 10,
                "risk_level": "HIGH"
            },
            # 11
            {
                "source_project_id": "5590",
                "canonical_project_id": proj_ids[1 % len(proj_ids)],
                "project_name": "Formation of 4-Lane Bypass to Tiruvallur Town on SH-50",
                "scheme_name": "CRIDP State Highway Upgradation",
                "circle_name": "Chennai C&M",
                "division_name": "Tiruvallur",
                "road_or_bridge_details": "Greenfield 4-Lane bypass of length 12.80 km",
                "start_chainage_km": 0.0,
                "end_chainage_km": 12.80,
                "total_length_km": 12.80,
                "contractor_name": "M/s Sri Varu Infra Developers",
                "technical_sanction_cr": 138.00,
                "contract_value_cr": 124.00,
                "work_commencement_date": datetime.datetime(2023, 5, 2, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 11, 1, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 12, 15, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 409,
                "physical_progress_pct": 55.2,
                "financial_progress_pct": 55.2,
                "expenditure_cr": 68.50,
                "agreement_milestones": "Earthwork 70%; Granular Sub-base 55%; Major culverts 12/16",
                "actual_milestone_status": "Revenue department award disbursement delay in Putlur village.",
                "work_remarks": "Revenue sub-collector conducting final disbursement camps.",
                "land_acquisition_remarks": "4.2 ha land possession certificate pending.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "3 title dispute writ petitions in High Court.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "Complete",
                "source_page_number": 11,
                "risk_level": "HIGH"
            },
            # 12
            {
                "source_project_id": "5612",
                "canonical_project_id": proj_ids[2 % len(proj_ids)],
                "project_name": "Elevated Highway from Chennai Port to Maduravoyal (Highways Section)",
                "scheme_name": "State Mega Projects / Sagarmala",
                "circle_name": "Chennai C&M",
                "division_name": "Chennai City North",
                "road_or_bridge_details": "Double decker elevated corridor along Cooum river",
                "start_chainage_km": 0.0,
                "end_chainage_km": 20.60,
                "total_length_km": 20.60,
                "contractor_name": "M/s Afcons Infrastructure Ltd",
                "technical_sanction_cr": 480.00,
                "contract_value_cr": 420.00,
                "work_commencement_date": datetime.datetime(2022, 12, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 5, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2027, 8, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 457,
                "physical_progress_pct": 44.0,
                "financial_progress_pct": 44.0,
                "expenditure_cr": 185.00,
                "agreement_milestones": "Section A Piling (85%); Section B Pier caps (40%)",
                "actual_milestone_status": "Defense land exchange NOC pending with HQ ATNK&K Area.",
                "work_remarks": "Joint site inspection with Military Estate Officer completed.",
                "land_acquisition_remarks": "2.8 ha defense land transfer in exchange for state parcel.",
                "forest_clearance_remarks": "River basin CRZ environmental compliance clearance verified.",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Railway line crossing GAD approved.",
                "utility_shifting_remarks": "Major CMWSSB sewer trunk line diversion in progress.",
                "source_page_number": 12,
                "risk_level": "CRITICAL"
            },
            # 13
            {
                "source_project_id": "5634",
                "canonical_project_id": proj_ids[3 % len(proj_ids)],
                "project_name": "ROB at LC-32 Minjur on Tiruvottiyur-Ponneri-Panchetti Road (SH-56)",
                "scheme_name": "Railway Works Programme",
                "circle_name": "Chennai C&M",
                "division_name": "Tiruvallur",
                "road_or_bridge_details": "2-Lane ROB with service roads at Minjur railway yard",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.10,
                "total_length_km": 1.10,
                "contractor_name": "M/s Sri Murugan Engineering",
                "technical_sanction_cr": 65.00,
                "contract_value_cr": 58.90,
                "work_commencement_date": datetime.datetime(2023, 10, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2026, 3, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 11, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 244,
                "physical_progress_pct": 75.0,
                "financial_progress_pct": 75.0,
                "expenditure_cr": 44.20,
                "agreement_milestones": "Substructure complete; Superstructure 70%",
                "actual_milestone_status": "TANGEDCO 33kV HT overhead cable shifting delayed.",
                "work_remarks": "TANGEDCO supervision charges deposited; shutdown planned.",
                "land_acquisition_remarks": "Complete",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Railway CRS clearance granted.",
                "utility_shifting_remarks": "TANGEDCO 33kV line shifting pending shutdown.",
                "source_page_number": 13,
                "risk_level": "MEDIUM"
            },
            # 14
            {
                "source_project_id": "5655",
                "canonical_project_id": proj_ids[0],
                "project_name": "Widening to 6-Lanes of Mount-Poonamallee Road km 8/0 to 14/0",
                "scheme_name": "CMDP Arterial Corridor Improvement",
                "circle_name": "Chennai C&M",
                "division_name": "Chennai City West",
                "road_or_bridge_details": "Mount-Poonamallee Avadi Road (SH-55) expansion",
                "start_chainage_km": 8.0,
                "end_chainage_km": 14.0,
                "total_length_km": 6.00,
                "contractor_name": "M/s Anand Construction Pvt Ltd",
                "technical_sanction_cr": 82.00,
                "contract_value_cr": 72.10,
                "work_commencement_date": datetime.datetime(2023, 5, 10, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 11, 9, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 9, 30, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 325,
                "physical_progress_pct": 82.9,
                "financial_progress_pct": 82.9,
                "expenditure_cr": 59.80,
                "agreement_milestones": "5.2 km 6-lane completed; 800m bottleneck",
                "actual_milestone_status": "High Court interim stay on commercial parcel demolition at km 11/4.",
                "work_remarks": "Special Govt Pleader filed vacate stay petition on 12.08.2026.",
                "land_acquisition_remarks": "0.18 ha commercial plot subject to interim stay.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "WP No. 24891/2026 interim stay against demolition.",
                "railway_approval_remarks": "Not Applicable",
                "utility_shifting_remarks": "Complete",
                "source_page_number": 14,
                "risk_level": "HIGH"
            },
            # 15
            {
                "source_project_id": "5670",
                "canonical_project_id": proj_ids[1 % len(proj_ids)],
                "project_name": "Multi-Tier Grade Separator at Koyambedu Junction Phase-II",
                "scheme_name": "CMDP Urban Traffic Decongestion",
                "circle_name": "Chennai C&M",
                "division_name": "Chennai City West",
                "road_or_bridge_details": "Elevated rotary flyover with ramps towards Anna Nagar & Vadapalani",
                "start_chainage_km": 0.0,
                "end_chainage_km": 1.95,
                "total_length_km": 1.95,
                "contractor_name": "M/s Consolidated Construction Consortium Ltd",
                "technical_sanction_cr": 128.00,
                "contract_value_cr": 115.00,
                "work_commencement_date": datetime.datetime(2023, 3, 1, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": datetime.datetime(2025, 8, 31, tzinfo=datetime.timezone.utc),
                "estimated_completion_date": datetime.datetime(2026, 8, 31, tzinfo=datetime.timezone.utc),
                "completion_delay_days": 365,
                "physical_progress_pct": 80.0,
                "financial_progress_pct": 80.0,
                "expenditure_cr": 92.00,
                "agreement_milestones": "Phase-I ramps opened; Phase-II deck slab 85%",
                "actual_milestone_status": "Fly ash and aggregate quarry supply shortage during monsoon.",
                "work_remarks": "Alternative certified quarry approved by Superintending Engineer.",
                "land_acquisition_remarks": "Complete",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Metro rail safety clearance verified.",
                "utility_shifting_remarks": "Stormwater drain diversion complete.",
                "source_page_number": 15,
                "risk_level": "MEDIUM"
            }
        ]

        # Add 16 more projects to complete 31 records (IDs 5681 to 5696)
        additional_major_works_names = [
            ("5681", "Construction of 4-Lane Bypass to Madurantakam on SH-117", "CRIDP", "Chengalpattu", 78.40, 69.20, 72.0, 49.80, 180),
            ("5682", "Widening to 4-Lanes of Vandalur-Kelambakkam Road (SH-121) km 0/0 to 18/6", "CMDP", "Chengalpattu", 112.00, 98.50, 64.0, 63.00, 220),
            ("5683", "Reconstruction of Distressed Bridge across Palar River on SH-58", "State Fund", "Chengalpattu", 58.00, 51.50, 81.0, 41.70, 90),
            ("5684", "4-Lane Elevated Corridor on Grand Southern Trunk Road at Chromepet", "CMDP", "Chennai City South", 165.00, 148.00, 51.0, 75.50, 310),
            ("5685", "Construction of ROB at LC-28 Korukkupet on Basin Bridge - Ennore Section", "Railway Works", "Chennai City North", 74.00, 65.00, 68.0, 44.20, 210),
            ("5686", "Formation of Western Ring Road Section-II Tiruvallur Outer Link", "CRIDP", "Tiruvallur", 132.00, 118.00, 42.0, 49.50, 420),
            ("5687", "Widening of Poonamallee High Road km 18/0 to 26/0", "CRIDP", "Tiruvallur", 86.00, 76.50, 79.0, 60.40, 140),
            ("5688", "4-Lane Grade Separator at Korattur Junction on CTH Road", "CMDP", "Tiruvallur", 94.00, 82.00, 61.0, 50.00, 260),
            ("5689", "Widening and Improvements to Ennore Express Highway km 0/0 to 12/0", "CRIDP", "Chennai City North", 89.00, 79.00, 73.0, 57.70, 175),
            ("5690", "ROB at LC-4 Nemilichery on Chennai - Arakkonam Section", "Railway Works", "Tiruvallur", 68.00, 59.80, 84.0, 50.20, 120),
            ("5691", "Reconstruction of Major Bridge across Araniar River on SH-51", "CRIDP", "Tiruvallur", 56.00, 49.80, 76.0, 37.80, 150),
            ("5692", "4-Lane Elevated Link Road from Thiruvanmiyur to Akkarai (ECR Viaduct)", "CMDP", "Chennai City South", 240.00, 215.00, 38.0, 81.70, 480),
            ("5693", "Widening to 4-Lanes of Tambaram-Kishkinta Road km 0/0 to 8/4", "CRIDP", "Chengalpattu", 62.00, 54.00, 88.0, 47.50, 60),
            ("5694", "Grade Separator at Thiruverkadu Junction on NH-4 bypass", "CMDP", "Tiruvallur", 88.00, 77.20, 67.0, 51.70, 195),
            ("5695", "Widening and Modernisation of Medavakkam-Mambakkam Road (SH-110A)", "CRIDP", "Chengalpattu", 71.00, 63.50, 80.0, 50.80, 110),
            ("5696", "ROB at LC-8 Vyasarpadi Yard on Chennai - Beach Line", "Railway Works", "Chennai City North", 85.00, 74.80, 59.0, 44.10, 280)
        ]

        for idx, (sp_id, p_name, scheme, div, ts_val, cv_val, phys, exp_val, del_days) in enumerate(additional_major_works_names):
            proj_fk = proj_ids[idx % len(proj_ids)]
            agmt_comp = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(days=idx * 20)
            est_comp = agmt_comp + datetime.timedelta(days=del_days)
            r_level = "CRITICAL" if del_days > 300 else ("HIGH" if del_days > 180 else "MEDIUM")
            major_works_raw.append({
                "source_project_id": sp_id,
                "canonical_project_id": proj_fk,
                "project_name": p_name,
                "scheme_name": scheme,
                "circle_name": "Chennai C&M",
                "division_name": div,
                "road_or_bridge_details": f"{p_name} ({div} Division)",
                "start_chainage_km": 0.0,
                "end_chainage_km": 10.0 + idx,
                "total_length_km": 10.0 + idx,
                "contractor_name": f"M/s TN Infrastructure Partners JV-{idx+1}",
                "technical_sanction_cr": ts_val,
                "contract_value_cr": cv_val,
                "work_commencement_date": datetime.datetime(2023, 1, 15, tzinfo=datetime.timezone.utc),
                "agreement_completion_date": agmt_comp,
                "estimated_completion_date": est_comp,
                "completion_delay_days": del_days,
                "physical_progress_pct": phys,
                "financial_progress_pct": round(exp_val / cv_val * 100, 1),
                "expenditure_cr": exp_val,
                "agreement_milestones": "Substructure complete; Superstructure in progress",
                "actual_milestone_status": "Monitored under Minister Review September 2026",
                "work_remarks": f"Reviewed in ₹50 Cr+ portfolio. Delay {del_days} days under investigation.",
                "land_acquisition_remarks": "Possession status verified with local revenue wing.",
                "forest_clearance_remarks": "Not Applicable",
                "court_case_remarks": "Nil",
                "railway_approval_remarks": "Applicable if railway crossing involved",
                "utility_shifting_remarks": "Under coordination with TANGEDCO/TWAD",
                "source_page_number": 16 + idx,
                "risk_level": r_level
            })

        # Insert or update 31 snapshots
        db_snapshots = {}
        for row in major_works_raw:
            existing = db.query(MajorWorksProjectReviewSnapshot).filter(
                MajorWorksProjectReviewSnapshot.source_project_id == row["source_project_id"]
            ).first()
            if not existing:
                snap = MajorWorksProjectReviewSnapshot(
                    source_project_id=row["source_project_id"],
                    canonical_project_id=row["canonical_project_id"],
                    project_name=row["project_name"],
                    portfolio_category="MAJOR_WORKS_50CR",
                    scheme_name=row["scheme_name"],
                    circle_name=row["circle_name"],
                    division_name=row["division_name"],
                    road_or_bridge_details=row["road_or_bridge_details"],
                    start_chainage_km=row["start_chainage_km"],
                    end_chainage_km=row["end_chainage_km"],
                    total_length_km=row["total_length_km"],
                    contractor_name=row["contractor_name"],
                    technical_sanction_cr=row["technical_sanction_cr"],
                    contract_value_cr=row["contract_value_cr"],
                    work_commencement_date=row["work_commencement_date"],
                    agreement_completion_date=row["agreement_completion_date"],
                    estimated_completion_date=row["estimated_completion_date"],
                    completion_delay_days=row["completion_delay_days"],
                    physical_progress_pct=row["physical_progress_pct"],
                    financial_progress_pct=row["financial_progress_pct"],
                    expenditure_cr=row["expenditure_cr"],
                    agreement_milestones=row["agreement_milestones"],
                    actual_milestone_status=row["actual_milestone_status"],
                    work_remarks=row["work_remarks"],
                    land_acquisition_remarks=row["land_acquisition_remarks"],
                    forest_clearance_remarks=row["forest_clearance_remarks"],
                    court_case_remarks=row["court_case_remarks"],
                    railway_approval_remarks=row["railway_approval_remarks"],
                    utility_shifting_remarks=row["utility_shifting_remarks"],
                    source_document="More than 50Cr works details as on 21.09.2026.pdf",
                    source_page_number=row["source_page_number"],
                    review_reporting_date=review_date,
                    verification_status="OFFICIAL_MINISTERIAL_REVIEW",
                    risk_level=row["risk_level"],
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(snap)
                db.commit()
                db.refresh(snap)
                db_snapshots[row["source_project_id"]] = snap
            else:
                db_snapshots[row["source_project_id"]] = existing

        # -----------------------------------------------------------------
        # 3. SEED PROJECT BLOCKERS (17 Standard Categories)
        # -----------------------------------------------------------------
        blockers_data = [
            # Blocker 1: Canonical 5566 Railway Coordination
            {
                "blocker_code": "BLK-5566-01",
                "source_project_id": "5566",
                "category": "RAILWAY_COORDINATION",
                "subcategory": "CRS Clearance & Power Block",
                "chainage_location": "Railway Km 28/12-14",
                "description": "Railway-side superstructure launching pending Southern Railway CRS clearance and track power block at LC-13. Exact critical path blocker unestablished by site audit.",
                "current_status": "ACTIVE_BLOCKER",
                "is_critical_path": True,
                "primary_cause": "Coordination latency with Southern Railway Bridge Branch and pending joint safety inspection",
                "contributing_causes": "Contractor delayed submission of revised launching scheme; Railway division prioritised passenger corridor maintenance",
                "responsible_resolution_authority": "Southern Railway (DRM Chennai / Chief Bridge Engineer)",
                "assigned_action_owner": "Superintending Engineer (Highways), Projects Circle Chennai",
                "external_department_or_contractor": "Southern Railway & M/s Sri Balaji Infra Projects",
                "supporting_evidence": "Letter No. SR/B/MS-32 dated 14.07.2026; Joint inspection minutes dated 22.08.2026",
                "days_affected": 317,
                "financial_exposure_cr": None,
                "is_financial_exposure_quantified": False,
                "required_mitigation": "High-level state-railway coordination meeting at Secretary level; approve EOT and remaining CPM schedule",
                "target_resolution_date": datetime.datetime(2026, 10, 31, tzinfo=datetime.timezone.utc),
                "escalation_level": "SECRETARY"
            },
            # Blocker 2: Land Acquisition (5102)
            {
                "blocker_code": "BLK-5102-01",
                "source_project_id": "5102",
                "category": "LAND_ACQUISITION_DELAYS",
                "subcategory": "Section 15(2) Award Disbursement",
                "chainage_location": "Km 34/200 to 39/800",
                "description": "Private land acquisition of 8.4 hectares stalled due to ownership dispute and non-appearance of landholders before Revenue Divisional Officer.",
                "current_status": "ACTIVE_BLOCKER",
                "is_critical_path": True,
                "primary_cause": "Pending compensation disbursement in Chengalpattu Revenue Unit",
                "contributing_causes": "Revenue staff diverted for disaster mitigation; pending title regularisation",
                "responsible_resolution_authority": "District Collector, Chengalpattu",
                "assigned_action_owner": "Special District Revenue Officer (LA - Highways)",
                "external_department_or_contractor": "Revenue Department",
                "supporting_evidence": "DRO File No. LA/SH49/2024/C3 dated 11.08.2026",
                "days_affected": 351,
                "financial_exposure_cr": 4.80,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Convene Special Revenue Lok Adalat for on-the-spot award settlement under TN Highways Act Section 19",
                "target_resolution_date": datetime.datetime(2026, 11, 15, tzinfo=datetime.timezone.utc),
                "escalation_level": "CHIEF_ENGINEER"
            },
            # Blocker 3: Utility Shifting (5211)
            {
                "blocker_code": "BLK-5211-01",
                "source_project_id": "5211",
                "category": "UTILITY_SHIFTING",
                "subcategory": "110kV HT Power Transmission Line Relocation",
                "chainage_location": "Pier P14-P16 Junction",
                "description": "TANGEDCO 110kV high tension overhead transmission tower #4B infringes flyover pier erection safety envelope.",
                "current_status": "INVESTIGATION_ONGOING",
                "is_critical_path": True,
                "primary_cause": "Transmission line shutdown slot delayed due to Chennai south summer grid load",
                "contributing_causes": "Alternative mono-pole tower foundation redesign approved late",
                "responsible_resolution_authority": "TANGEDCO (Director Transmission / SE GCC Chennai South)",
                "assigned_action_owner": "Divisional Engineer (Highways), City Division",
                "external_department_or_contractor": "TANGEDCO",
                "supporting_evidence": "TANGEDCO Demand Note No. SE/GCC/CS/Tech/D.114/2026 dated 05.06.2026",
                "days_affected": 295,
                "financial_exposure_cr": 2.10,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Arrange 24-hr weekend power shutdown with grid load diversion via Guindy 230kV substation",
                "target_resolution_date": datetime.datetime(2026, 10, 20, tzinfo=datetime.timezone.utc),
                "escalation_level": "CIRCLE"
            },
            # Blocker 4: Court Injunction (5655)
            {
                "blocker_code": "BLK-5655-01",
                "source_project_id": "5655",
                "category": "COURT_INJUNCTIONS_LITIGATION",
                "subcategory": "High Court Interim Stay against Demolition",
                "chainage_location": "Km 11/400 to 11/580",
                "description": "Madras High Court interim injunction in WP No. 24891/2026 restraining demolition of 3-storey commercial complex on widening boundary.",
                "current_status": "ESCALATED",
                "is_critical_path": True,
                "primary_cause": "Petitioners allege non-compliance with statutory notice under Section 28(2) of TN Highways Act",
                "contributing_causes": "Field survey demarcation boundary disputed by petitioner surveyor",
                "responsible_resolution_authority": "High Court of Judicature at Madras / Special Govt Pleader",
                "assigned_action_owner": "Superintending Engineer (Highways), Chennai C&M Circle",
                "external_department_or_contractor": "Commercial Complex Owners Association",
                "supporting_evidence": "High Court Order in WMP No. 31204/2026 in WP No. 24891/2026 dated 28.05.2026",
                "days_affected": 325,
                "financial_exposure_cr": 1.75,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "File counter-affidavit with satellite survey proof and move urgent vacate stay petition before Vacation/Special Bench",
                "target_resolution_date": datetime.datetime(2026, 10, 15, tzinfo=datetime.timezone.utc),
                "escalation_level": "SECRETARY"
            },
            # Blocker 5: Forest & Environmental / CRZ (5501)
            {
                "blocker_code": "BLK-5501-01",
                "source_project_id": "5501",
                "category": "COASTAL_REGULATION_ZONE_CRZ",
                "subcategory": "CRZ Clearance & Tidal Buffer Compliance",
                "chainage_location": "Km 18/200 to 22/400",
                "description": "TNCZMA clearance conditions require specific bio-shield mangrove replantation and hydraulic flow culvert design modifications.",
                "current_status": "ACTIVE_BLOCKER",
                "is_critical_path": True,
                "primary_cause": "Environmental audit flagged tidal backwater flow obstruction during pile cap casting",
                "contributing_causes": "Heavy monsoon high-tide breached temporary cofferdams",
                "responsible_resolution_authority": "Tamil Nadu Coastal Zone Management Authority (TNCZMA) & MoEFCC",
                "assigned_action_owner": "Chief Engineer (Highways), State Mega Projects",
                "external_department_or_contractor": "Environment & Climate Change Department",
                "supporting_evidence": "TNCZMA Letter No. 3401/CRZ/2025-1 dated 18.04.2026",
                "days_affected": 577,
                "financial_exposure_cr": 9.40,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Submit revised hydraulic design vetted by IIT Madras Ocean Engineering Dept",
                "target_resolution_date": datetime.datetime(2026, 12, 10, tzinfo=datetime.timezone.utc),
                "escalation_level": "MINISTER_CM"
            },
            # Blocker 6: Defence Land Clearance (5612)
            {
                "blocker_code": "BLK-5612-01",
                "source_project_id": "5612",
                "category": "DEFENSE_MILITARY_LAND_APPROVALS",
                "subcategory": "Ministry of Defence In-Principle NOC",
                "chainage_location": "Km 4/200 to 5/100 (Island Grounds Stretch)",
                "description": "Defence land transfer of 2.8 hectares pending Cabinet Committee on Security / MoD formal sanction.",
                "current_status": "ESCALATED",
                "is_critical_path": True,
                "primary_cause": "Valuation disparity on equal-value alternative parcel offered at Tambaram",
                "contributing_causes": "Military Estate Officer raised audit observation on land survey boundary",
                "responsible_resolution_authority": "Ministry of Defence, Govt of India & Chief Secretary Tamil Nadu",
                "assigned_action_owner": "Principal Secretary, Highways & Minor Ports Department",
                "external_department_or_contractor": "HQ ATNK&K Area, Chennai",
                "supporting_evidence": "MoD Ref No. 11013/8/2025/D(Lands) dated 29.06.2026",
                "days_affected": 457,
                "financial_exposure_cr": 12.80,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Chief Secretary level bilateral conference with Defence Secretary to execute Working Permission against bank escrow",
                "target_resolution_date": datetime.datetime(2026, 11, 30, tzinfo=datetime.timezone.utc),
                "escalation_level": "MINISTER_CM"
            },
            # Blocker 7: Contractor Distress / Cashflow (5415)
            {
                "blocker_code": "BLK-5415-01",
                "source_project_id": "5415",
                "category": "CONTRACTOR_CASHFLOW_DISTRESS",
                "subcategory": "Sub-Contractor Payment Default & Machine Idle",
                "chainage_location": "Km 25/0 to 31/5",
                "description": "Main contractor facing acute working capital crunch, resulting in demobilisation of earthmoving machinery and non-supply of bitumen.",
                "current_status": "ACTIVE_BLOCKER",
                "is_critical_path": True,
                "primary_cause": "Contractor debt restructuring and bank guarantee limit exhaustion",
                "contributing_causes": "Delayed payment of running account bill due to revised estimate pending sanction",
                "responsible_resolution_authority": "Chief Engineer (Highways), Construction & Maintenance",
                "assigned_action_owner": "Superintending Engineer (Highways), Chennai C&M Circle",
                "external_department_or_contractor": "M/s GVR Infra Projects Ltd",
                "supporting_evidence": "Contractor Letter No. GVR/TN/OMR/Fin/109 dated 04.08.2026",
                "days_affected": 538,
                "financial_exposure_cr": 6.70,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Release admitted running bills into project-specific escrow account to directly pay suppliers and labour",
                "target_resolution_date": datetime.datetime(2026, 10, 25, tzinfo=datetime.timezone.utc),
                "escalation_level": "SECRETARY"
            },
            # Blocker 8: Material Shortage / Quarry Permits (5670)
            {
                "blocker_code": "BLK-5670-01",
                "source_project_id": "5670",
                "category": "MATERIAL_SHORTAGE_QUARRY_PERMITS",
                "subcategory": "Blue Metal Aggregate Quarry Permit Expiry",
                "chainage_location": "Entire Grade Separator Deck",
                "description": "Designated stone quarry in Kancheepuram district suspended by Dept of Geology & Mining pending environmental clearance renewal.",
                "current_status": "INVESTIGATION_ONGOING",
                "is_critical_path": False,
                "primary_cause": "State-wide granite quarry permit review by Mines Department",
                "contributing_causes": "Contractor delayed tagging alternative NABL-accredited source",
                "responsible_resolution_authority": "Director of Geology & Mining, Tamil Nadu",
                "assigned_action_owner": "Executive Engineer (Highways), Quality Control Division",
                "external_department_or_contractor": "Dept of Geology & Mining",
                "supporting_evidence": "Mines Notice No. 4921/Mines/2026 dated 15.07.2026",
                "days_affected": 365,
                "financial_exposure_cr": 1.20,
                "is_financial_exposure_quantified": True,
                "required_mitigation": "Approve temporary lead-distance haulage deviation to Walajabad quarry cluster with lab verification",
                "target_resolution_date": datetime.datetime(2026, 10, 10, tzinfo=datetime.timezone.utc),
                "escalation_level": "DIVISION"
            }
        ]

        db_blockers = {}
        for b_raw in blockers_data:
            snap = db_snapshots.get(b_raw["source_project_id"])
            p_fk = snap.canonical_project_id if snap and snap.canonical_project_id else ref_proj_id
            m_fk = snap.id if snap else None

            existing_b = db.query(ProjectBlocker).filter(ProjectBlocker.blocker_code == b_raw["blocker_code"]).first()
            if not existing_b:
                blk = ProjectBlocker(
                    blocker_code=b_raw["blocker_code"],
                    project_id=p_fk,
                    major_work_id=m_fk,
                    chainage_location=b_raw["chainage_location"],
                    category=b_raw["category"],
                    subcategory=b_raw["subcategory"],
                    description=b_raw["description"],
                    current_status=b_raw["current_status"],
                    is_critical_path=b_raw["is_critical_path"],
                    primary_cause=b_raw["primary_cause"],
                    contributing_causes=b_raw["contributing_causes"],
                    responsible_resolution_authority=b_raw["responsible_resolution_authority"],
                    assigned_action_owner=b_raw["assigned_action_owner"],
                    external_department_or_contractor=b_raw["external_department_or_contractor"],
                    supporting_evidence=b_raw["supporting_evidence"],
                    days_affected=b_raw["days_affected"],
                    financial_exposure_cr=b_raw["financial_exposure_cr"],
                    is_financial_exposure_quantified=b_raw["is_financial_exposure_quantified"],
                    required_mitigation=b_raw["required_mitigation"],
                    target_resolution_date=b_raw["target_resolution_date"],
                    escalation_level=b_raw["escalation_level"],
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(blk)
                db.commit()
                db.refresh(blk)
                db_blockers[b_raw["blocker_code"]] = blk
            else:
                db_blockers[b_raw["blocker_code"]] = existing_b

        # -----------------------------------------------------------------
        # 4. SEED DELAY INVESTIGATIONS (Baseline vs Forecast vs Blocker)
        # -----------------------------------------------------------------
        snap_5566 = db_snapshots.get("5566")
        investigation_5566 = db.query(DelayInvestigation).filter(DelayInvestigation.investigation_code == "INV-5566-01").first()
        if not investigation_5566:
            investigation_5566 = DelayInvestigation(
                investigation_code="INV-5566-01",
                project_id=ref_proj_id,
                major_work_id=snap_5566.id if snap_5566 else None,
                baseline_completion_date=datetime.datetime(2026, 3, 20, tzinfo=datetime.timezone.utc),
                approved_revised_completion_date=None,
                current_forecast_completion_date=datetime.datetime(2027, 1, 31, tzinfo=datetime.timezone.utc),
                delay_days_from_baseline=317,
                delay_days_from_revised=317,
                milestone_health_verdict="CRITICAL_PATH_BLOCKED",
                physical_vs_financial_variance_pct=6.3,  # Physical 78% vs Financial 84.3%
                unanswered_interdept_requests_count=3,
                unanswered_days_max=68,
                critical_path_assessment="Southern Railway launching requires 4-hour traffic power block and revised girder fabrication protocol. Exact sub-contractor bottleneck unestablished.",
                preliminary_findings="Physical progress 78.0%, Exp ₹38.36 Cr. No formal EOT approved beyond 20-03-2026. Remaining-work CPM schedule not submitted.",
                unverified_assumptions="Railway blame cited by contractor without written submission of revised CPM programme. Site inspection revealed contractor girder yard fabrication only 80% complete.",
                evidence_checklist_pending="1. Joint site inspection report with Southern Railway Bridge Branch; 2. NABL test certificate for girder splice welds; 3. Contractor cashflow statement for balance work.",
                responsible_investigator_name="State Project Audit Cell (Technical Vigilance)",
                investigation_status="IN_PROGRESS",
                data_mode="SIMULATED",
                created_at=now,
                updated_at=now
            )
            db.add(investigation_5566)
            db.commit()

        # Add investigations for 5102, 5501, 5612
        inv_samples = [
            ("INV-5102-01", "5102", datetime.datetime(2025, 12, 14, tzinfo=datetime.timezone.utc), datetime.datetime(2026, 11, 30, tzinfo=datetime.timezone.utc), 351, "Land acquisition Section 15(2) delay across 4 revenue villages"),
            ("INV-5501-01", "5501", datetime.datetime(2025, 9, 30, tzinfo=datetime.timezone.utc), datetime.datetime(2027, 4, 30, tzinfo=datetime.timezone.utc), 577, "CRZ environmental flow compliance and Kosasthalaiyar bridge tidal clearance"),
            ("INV-5612-01", "5612", datetime.datetime(2026, 5, 31, tzinfo=datetime.timezone.utc), datetime.datetime(2027, 8, 31, tzinfo=datetime.timezone.utc), 457, "Defence land working permission NOC pending MoD clearance")
        ]
        for inv_code, sp_id, base_dt, fore_dt, del_d, crit_text in inv_samples:
            existing_inv = db.query(DelayInvestigation).filter(DelayInvestigation.investigation_code == inv_code).first()
            if not existing_inv:
                snap_item = db_snapshots.get(sp_id)
                inv_obj = DelayInvestigation(
                    investigation_code=inv_code,
                    project_id=snap_item.canonical_project_id if snap_item and snap_item.canonical_project_id else ref_proj_id,
                    major_work_id=snap_item.id if snap_item else None,
                    baseline_completion_date=base_dt,
                    approved_revised_completion_date=None,
                    current_forecast_completion_date=fore_dt,
                    delay_days_from_baseline=del_d,
                    delay_days_from_revised=del_d,
                    milestone_health_verdict="CRITICAL_PATH_BLOCKED",
                    physical_vs_financial_variance_pct=4.8,
                    unanswered_interdept_requests_count=4,
                    unanswered_days_max=85,
                    critical_path_assessment=crit_text,
                    preliminary_findings=f"Project review flagged serious completion delay of {del_d} days. Immediate inter-departmental escalation required.",
                    unverified_assumptions="Clearance lead time estimated at 90 days assuming regular district coordination.",
                    evidence_checklist_pending="Statutory clearances, Joint survey sketch, Revised resource deployment plan.",
                    responsible_investigator_name="Superintending Engineer (Quality & Inspection)",
                    investigation_status="IN_PROGRESS",
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(inv_obj)
                db.commit()

        # -----------------------------------------------------------------
        # 5. SEED LOSS PREVENTION LEDGER (12 Itemized Accounts)
        # Note Rule: Zero double-counting. Reference case 5566 MUST have
        # explicitly unquantified fallback record.
        # -----------------------------------------------------------------
        b_5566 = db_blockers.get("BLK-5566-01")
        existing_rec_5566 = db.query(LossPreventionLedgerRecord).filter(
            LossPreventionLedgerRecord.ledger_code == "LED-5566-10CA"
        ).first()
        if not existing_rec_5566:
            rec_5566 = LossPreventionLedgerRecord(
                ledger_code="LED-5566-10CA",
                project_id=ref_proj_id,
                major_work_id=snap_5566.id if snap_5566 else None,
                blocker_id=b_5566.id if b_5566 else None,
                account_name="PRICE_ESCALATION_10CA",
                amount_cr=None,  # EXPLICITLY UNQUANTIFIED
                is_quantified=False,
                formula_description="Clause 10CA price escalation indexation on balance work ₹2.84 Cr pending submission of joint measurement and revised completion programme.",
                input_parameters_json='{"balance_work_cr": 2.84, "base_wpi_index": 128.4, "current_wpi_index": 141.2, "clause": "10CA"}',
                source_reference="Minister Review Note 21.09.2026 & Agreement Clause 10CA",
                assumptions_text="Indexation unestablished because contractor hasn't submitted monthly price index adjustment bills since March 2026.",
                applicable_period="Apr 2026 - Jan 2027",
                data_confidence="UNQUANTIFIED",
                is_verified=False,
                responsible_reviewer_name="Executive Engineer (Highways), Quality & Audit Cell",
                action_created_for_unquantified=True,
                data_mode="SIMULATED",
                created_at=now,
                updated_at=now
            )
            db.add(rec_5566)
            db.commit()

        # Quantified ledger entries across active major projects (12 accounts)
        quantified_ledger_entries = [
            ("LED-5102-IDLE", "5102", "BLK-5102-01", "CONTRACTOR_IDLE_PLANT_MACHINERY", 1.85, "Idle paver, tippers & JCBs in stalled 8km stretch", "Daily equipment rental rate * 120 idle days", "HIGH"),
            ("LED-5102-LABR", "5102", "BLK-5102-01", "IDLE_LABOUR_SUPERVISION", 0.92, "Camp establishment and skilled crew idle retention", "Minimum wage schedule * supervisory team", "MEDIUM"),
            ("LED-5211-BG", "5211", "BLK-5211-01", "EXTENDED_INSURANCE_BG", 0.45, "Bank guarantee renewal commission and CAR policy", "Bank guarantee commission 0.75% per quarter", "HIGH"),
            ("LED-5211-PMC", "5211", "BLK-5211-01", "CONSULTANCY_FEES", 0.68, "Extended authority engineer supervision charges", "Consultancy monthly fee * 6 extended months", "HIGH"),
            ("LED-5501-10CA", "5501", "BLK-5501-01", "PRICE_ESCALATION_10CA", 3.40, "Bitumen, cement, and high-tensile steel indexation", "Standard MoRTH Clause 10CA price index formula", "HIGH"),
            ("LED-5501-INFL", "5501", "BLK-5501-01", "INFLATIONARY_COST_INCREASE", 2.10, "Market price variation on balance structural work", "RBI Wholesale Price Index differential", "MEDIUM"),
            ("LED-5415-OVHD", "5415", "BLK-5415-01", "OVERHEAD_ESTABLISHMENT", 0.75, "Departmental field supervision and project office cost", "State establishment cost allocation 1.5%", "MEDIUM"),
            ("LED-5415-RMOB", "5415", "BLK-5415-01", "REMOBILISATION_COST", 0.50, "Piling rig and crane re-mobilisation charges", "Contractor demobilisation survey bill", "MEDIUM"),
            ("LED-5612-TERM", "5612", "BLK-5612-01", "PRE_CLOSURE_ABANDONMENT", 4.20, "Risk-and-cost retendering liability on stalled piers", "Estimated retendering rate variance 12%", "LOW_PRELIMINARY"),
            ("LED-5501-PEN", "5501", "BLK-5501-01", "INTER_DEPARTMENTAL_PENALTY", 0.30, "Coastal ecology remediation deposit surcharge", "TNCZMA penalty schedule", "HIGH"),
            ("LED-5655-LEG", "5655", "BLK-5655-01", "LITIGATION_LEGAL_EXPENSE", 0.25, "Senior Advocate fee and High Court registry filings", "Law Department approved retainer schedule", "HIGH"),
            ("LED-5102-ECON", "5102", "BLK-5102-01", "PUBLIC_ROAD_USER_COST", 8.50, "Commuter delay, detour fuel consumption, and VOC", "IRC:SP:30 Road User Cost Study model", "MEDIUM")
        ]

        for l_code, sp_id, blk_code, acct, amt, desc, form, conf in quantified_ledger_entries:
            existing_led = db.query(LossPreventionLedgerRecord).filter(
                LossPreventionLedgerRecord.ledger_code == l_code
            ).first()
            if not existing_led:
                snap_item = db_snapshots.get(sp_id)
                blk_item = db_blockers.get(blk_code)
                led_obj = LossPreventionLedgerRecord(
                    ledger_code=l_code,
                    project_id=snap_item.canonical_project_id if snap_item and snap_item.canonical_project_id else ref_proj_id,
                    major_work_id=snap_item.id if snap_item else None,
                    blocker_id=blk_item.id if blk_item else None,
                    account_name=acct,
                    amount_cr=amt,
                    is_quantified=True,
                    formula_description=form,
                    input_parameters_json=f'{{"account": "{acct}", "amount_cr": {amt}, "basis": "{desc}"}}',
                    source_reference=f"Project Audit Review: {desc}",
                    assumptions_text=desc,
                    applicable_period="2025-2027",
                    data_confidence=conf,
                    is_verified=True,
                    responsible_reviewer_name="Superintending Engineer (Financial Verification)",
                    action_created_for_unquantified=False,
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(led_obj)
                db.commit()

        # -----------------------------------------------------------------
        # 6. SEED MITIGATION RECOMMENDATIONS
        # -----------------------------------------------------------------
        mitigations_data = [
            # 5566 Canonical Mitigation
            {
                "mitigation_code": "MIT-5566-01",
                "source_project_id": "5566",
                "blocker_code": "BLK-5566-01",
                "stopping_what": "Railway span superstructure girder launching over active tracks at LC-13",
                "stopping_why": "Southern Railway Chennai Division track power block slot and final safety inspection clearance pending",
                "supporting_evidence": "Minutes of coordination meeting dated 14.07.2026 and Divisional Railway Manager communication",
                "missing_information": "Contractor revised crane placement plan and girder weld radiograph test report",
                "resolving_authority": "Principal Secretary (Highways) & DRM Southern Railway (Chennai)",
                "lawful_actions_available": "Option A: Direct Secretary-level coordination with General Manager Southern Railway for 4-day rolling 3-hr night block; Option B: Deposit work execution via Railway PSU (IRCON/RVNL)",
                "expected_resolution_timeline_days": 21,
                "estimated_intervention_cost_cr": 0.15,
                "avoidable_delay_days": 180,
                "avoidable_cost_cr": 3.20,
                "approval_authority": "Principal Secretary (Highways & Minor Ports)",
                "verification_criteria": "CRS formal safety clearance issued and power block dates gazetted",
                "human_approval_status": "PENDING_APPROVAL"
            },
            # 5102 LA Mitigation
            {
                "mitigation_code": "MIT-5102-01",
                "source_project_id": "5102",
                "blocker_code": "BLK-5102-01",
                "stopping_what": "4-lane carriageway formation in Km 34/200 to 39/800",
                "stopping_why": "Dispute in private award disbursement across 4 coastal revenue villages",
                "supporting_evidence": "Revenue DRO progress report No. LA/SH49/2026 dated 11.08.2026",
                "missing_information": "Genealogy succession certificate of 3 deceased title holders",
                "resolving_authority": "District Collector, Chengalpattu",
                "lawful_actions_available": "Option A: Deposit disputed compensation into Sub-Court under Section 21 of TN Highways Act and take possession; Option B: Private negotiation via District Level Committee",
                "expected_resolution_timeline_days": 30,
                "estimated_intervention_cost_cr": 0.40,
                "avoidable_delay_days": 150,
                "avoidable_cost_cr": 2.80,
                "approval_authority": "District Collector & Special DRO (LA)",
                "verification_criteria": "Form-C possession certificate signed by Tahsildar and physical handover to Highways AE",
                "human_approval_status": "PENDING_APPROVAL"
            },
            # 5655 Court Stay Mitigation
            {
                "mitigation_code": "MIT-5655-01",
                "source_project_id": "5655",
                "blocker_code": "BLK-5655-01",
                "stopping_what": "Demolition of commercial complex at Km 11/400 Mount-Poonamallee Road",
                "stopping_why": "High Court interim stay granted due to alleged defect in statutory notice",
                "supporting_evidence": "WMP No. 31204/2026 in WP No. 24891/2026 order copy",
                "missing_information": "Ack receipt of original Section 28(2) notice served in 2024",
                "resolving_authority": "High Court of Judicature at Madras / Special Govt Pleader",
                "lawful_actions_available": "Option A: Move urgent vacate stay petition with drone LIDAR boundary alignment; Option B: Minor alignment shift reducing impact to 1.2m setback",
                "expected_resolution_timeline_days": 25,
                "estimated_intervention_cost_cr": 0.08,
                "avoidable_delay_days": 120,
                "avoidable_cost_cr": 1.50,
                "approval_authority": "Chief Engineer (Highways), C&M",
                "verification_criteria": "High Court order vacating interim stay or modifying alignment consent",
                "human_approval_status": "PENDING_APPROVAL"
            }
        ]

        for m_raw in mitigations_data:
            existing_m = db.query(MitigationRecommendation).filter(
                MitigationRecommendation.mitigation_code == m_raw["mitigation_code"]
            ).first()
            if not existing_m:
                snap_item = db_snapshots.get(m_raw["source_project_id"])
                blk_item = db_blockers.get(m_raw["blocker_code"])
                mit = MitigationRecommendation(
                    mitigation_code=m_raw["mitigation_code"],
                    project_id=snap_item.canonical_project_id if snap_item and snap_item.canonical_project_id else ref_proj_id,
                    major_work_id=snap_item.id if snap_item else None,
                    blocker_id=blk_item.id if blk_item else 1,
                    stopping_what=m_raw["stopping_what"],
                    stopping_why=m_raw["stopping_why"],
                    supporting_evidence=m_raw["supporting_evidence"],
                    missing_information=m_raw["missing_information"],
                    resolving_authority=m_raw["resolving_authority"],
                    lawful_actions_available=m_raw["lawful_actions_available"],
                    expected_resolution_timeline_days=m_raw["expected_resolution_timeline_days"],
                    estimated_intervention_cost_cr=m_raw["estimated_intervention_cost_cr"],
                    avoidable_delay_days=m_raw["avoidable_delay_days"],
                    avoidable_cost_cr=m_raw["avoidable_cost_cr"],
                    approval_authority=m_raw["approval_authority"],
                    verification_criteria=m_raw["verification_criteria"],
                    human_approval_status=m_raw["human_approval_status"],
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(mit)
                db.commit()

        # -----------------------------------------------------------------
        # 7. SEED PRE-CONSTRUCTION GATE CHECKS
        # Statutory Guard: Check that active court stay is marked STRICTLY_BLOCKED
        # -----------------------------------------------------------------
        gates_data = [
            # Gate 1: 5655 Active Court Injunction (Strictly Blocked)
            {
                "gate_code": "GATE-5655-01",
                "source_project_id": "5655",
                "stage": "PRE_HANDOVER_AT_CHAINAGE",
                "chainage_km_start": 11.40,
                "chainage_km_end": 11.58,
                "land_survey_readiness_pct": 100.0,
                "acquisition_possession_cleared": False,
                "court_restrictions_active": True,
                "operative_stay_details": "Interim Injunction ordered in WP No. 24891/2026 by Madras High Court against demolition of building at Km 11/400",
                "forest_clearance_cleared": True,
                "environmental_approval_cleared": True,
                "railway_coordination_cleared": True,
                "utility_shifting_cleared": True,
                "design_technical_approved": True,
                "site_access_cleared": False,
                "contractual_readiness_cleared": True,
                "safety_requirements_cleared": False,
                "readiness_state": "RED",
                "restriction_summary": "Statutory and Judicial injunction in force. Land possession cannot be taken under G.O. or administrative direction.",
                "lawful_resolution_required": "Vacation of interim stay by High Court or formal land compromise deed.",
                "authorized_override_status": "STRICTLY_BLOCKED_BY_INJUNCTION"
            },
            # Gate 2: 5566 Pre-Mobilisation Railway Gate
            {
                "gate_code": "GATE-5566-01",
                "source_project_id": "5566",
                "stage": "PRE_MOBILISATION",
                "chainage_km_start": 0.0,
                "end_chainage_km": 1.24,
                "land_survey_readiness_pct": 100.0,
                "acquisition_possession_cleared": True,
                "court_restrictions_active": False,
                "operative_stay_details": None,
                "forest_clearance_cleared": True,
                "environmental_approval_cleared": True,
                "railway_coordination_cleared": False,
                "utility_shifting_cleared": True,
                "design_technical_approved": True,
                "site_access_cleared": True,
                "contractual_readiness_cleared": True,
                "safety_requirements_cleared": True,
                "readiness_state": "AMBER",
                "restriction_summary": "Railway safety track block slot pending formal DRM scheduling.",
                "lawful_resolution_required": "Joint safety signoff and CRS CRS track block approval.",
                "authorized_override_status": "NONE"
            },
            # Gate 3: 5211 Green Gate for Completed Foundations
            {
                "gate_code": "GATE-5211-01",
                "source_project_id": "5211",
                "stage": "PRE_HANDOVER_AT_CHAINAGE",
                "chainage_km_start": 0.0,
                "end_chainage_km": 1.20,
                "land_survey_readiness_pct": 100.0,
                "acquisition_possession_cleared": True,
                "court_restrictions_active": False,
                "operative_stay_details": None,
                "forest_clearance_cleared": True,
                "environmental_approval_cleared": True,
                "railway_coordination_cleared": True,
                "utility_shifting_cleared": True,
                "design_technical_approved": True,
                "site_access_cleared": True,
                "contractual_readiness_cleared": True,
                "safety_requirements_cleared": True,
                "readiness_state": "GREEN",
                "restriction_summary": "All statutory preconditions satisfied for 1.20 km deck stretch.",
                "lawful_resolution_required": "Continuous traffic police monitoring during night casting.",
                "authorized_override_status": "REVIEWED_AND_PERMITTED"
            }
        ]

        for g_raw in gates_data:
            existing_g = db.query(PreConstructionGateCheck).filter(
                PreConstructionGateCheck.gate_code == g_raw["gate_code"]
            ).first()
            if not existing_g:
                snap_item = db_snapshots.get(g_raw["source_project_id"])
                gt = PreConstructionGateCheck(
                    gate_code=g_raw["gate_code"],
                    project_id=snap_item.canonical_project_id if snap_item and snap_item.canonical_project_id else ref_proj_id,
                    major_work_id=snap_item.id if snap_item else None,
                    stage=g_raw["stage"],
                    chainage_km_start=g_raw["chainage_km_start"],
                    chainage_km_end=g_raw.get("chainage_km_end", 1.0),
                    land_survey_readiness_pct=g_raw["land_survey_readiness_pct"],
                    acquisition_possession_cleared=g_raw["acquisition_possession_cleared"],
                    court_restrictions_active=g_raw["court_restrictions_active"],
                    operative_stay_details=g_raw["operative_stay_details"],
                    forest_clearance_cleared=g_raw["forest_clearance_cleared"],
                    environmental_approval_cleared=g_raw["environmental_approval_cleared"],
                    railway_coordination_cleared=g_raw["railway_coordination_cleared"],
                    utility_shifting_cleared=g_raw["utility_shifting_cleared"],
                    design_technical_approved=g_raw["design_technical_approved"],
                    site_access_cleared=g_raw["site_access_cleared"],
                    contractual_readiness_cleared=g_raw["contractual_readiness_cleared"],
                    safety_requirements_cleared=g_raw["safety_requirements_cleared"],
                    readiness_state=g_raw["readiness_state"],
                    restriction_summary=g_raw["restriction_summary"],
                    lawful_resolution_required=g_raw["lawful_resolution_required"],
                    authorized_override_status=g_raw["authorized_override_status"],
                    data_mode="SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                db.add(gt)
                db.commit()

        print("[OK] Successfully seeded Major Works & Blocker Intelligence data.")

    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_major_works_blockers_data()
