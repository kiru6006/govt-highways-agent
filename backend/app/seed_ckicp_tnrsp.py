import datetime
import json
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base
from app.models import (
    Programme, CorridorAlignment, Project, WorkPackage, Tender,
    LandParcel, LegalCase, ProjectConsultant, Consultant, Department,
    Zone, Circle, Division, Contractor, Organisation
)

def seed_ckicp_tnrsp(db_session: Session = None):
    if db_session is None:
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False

    Base.metadata.create_all(bind=db.get_bind())

    # Migration for SQLite if programme_id column missing on projects table
    from sqlalchemy import text
    with db.get_bind().connect() as conn:
        try:
            conn.execute(text("ALTER TABLE projects ADD COLUMN programme_id INTEGER REFERENCES programmes(id)"))
            conn.commit()
        except Exception:
            pass

    print("Seeding CKICP and TNRSP-II Master Programmes, Corridors, Tenders, Land Parcels and Litigation...")

    # 1. MASTER PROGRAMMES
    programmes_data = [
        {
            "code": "CKICP",
            "name": "Chennai-Kanyakumari Industrial Corridor Project",
            "parent_corridor": "East Coast Economic Corridor (ECEC)",
            "funding": "Asian Development Bank (ADB) & Government of Tamil Nadu",
            "app_cost": 6448.00,
            "rev_cost": 6854.50,
            "length": 655.0,
            "url": "https://www.ckicp.tn.gov.in/",
            "status": "ACTIVE"
        },
        {
            "code": "TNRSP_II",
            "name": "Tamil Nadu Road Sector Project II",
            "parent_corridor": "Statewide Core Road Network",
            "funding": "International Bank for Reconstruction and Development (World Bank)",
            "app_cost": 5171.00,
            "rev_cost": 5482.00,
            "length": 1187.0,
            "url": "https://www.tnrsp.tn.gov.in/",
            "status": "ACTIVE"
        },
        {
            "code": "CRIDP",
            "name": "Comprehensive Road Infrastructure Development Programme",
            "parent_corridor": "State Core Highway Grid",
            "funding": "State Budget (Government of Tamil Nadu)",
            "app_cost": 8500.00,
            "rev_cost": 8500.00,
            "length": 4500.0,
            "url": "https://www.tnhighways.tn.gov.in/",
            "status": "ACTIVE"
        }
    ]

    prog_map = {}
    for p_spec in programmes_data:
        p = db.query(Programme).filter(Programme.code == p_spec["code"]).first()
        if not p:
            p = Programme(
                code=p_spec["code"],
                name=p_spec["name"],
                parent_corridor=p_spec["parent_corridor"],
                funding_agency=p_spec["funding"],
                approved_cost_cr=p_spec["app_cost"],
                revised_cost_cr=p_spec["rev_cost"],
                total_corridor_length_km=p_spec["length"],
                website_url=p_spec["url"],
                status=p_spec["status"]
            )
            db.add(p)
            db.commit()
            db.refresh(p)
        else:
            p.name = p_spec["name"]
            p.funding_agency = p_spec["funding"]
            p.approved_cost_cr = p_spec["app_cost"]
            p.revised_cost_cr = p_spec["rev_cost"]
            p.total_corridor_length_km = p_spec["length"]
            db.commit()
        prog_map[p_spec["code"]] = p

    # 2. CORRIDOR ALIGNMENTS (WITH VERIFIED GEOJSON COORDINATES)
    alignments_data = [
        {
            "prog": "CKICP",
            "code": "CKICP-C1",
            "name": "Northern Industrial Corridor (Chennai - Kancheepuram - Cuddalore)",
            "start": "Chennai (HRS Campus)",
            "end": "Cuddalore Port",
            "districts": ["Chennai", "Chengalpattu", "Kancheepuram", "Villupuram", "Cuddalore"],
            "length": 182.5,
            "coords": json.dumps({
                "type": "LineString",
                "coordinates": [
                    [80.2444, 13.0088], [80.1700, 12.8700], [79.7036, 12.8342],
                    [79.5200, 12.3500], [79.6500, 11.9500], [79.7667, 11.7500]
                ]
            })
        },
        {
            "prog": "CKICP",
            "code": "CKICP-C2",
            "name": "Central-Southern Link Corridor (Trichy - Ramanathapuram - Tuticorin)",
            "start": "Tiruchirappalli Junction",
            "end": "VOC Port, Tuticorin",
            "districts": ["Tiruchirappalli", "Pudukkottai", "Sivaganga", "Ramanathapuram", "Thoothukudi"],
            "length": 248.0,
            "coords": json.dumps({
                "type": "LineString",
                "coordinates": [
                    [78.6856, 10.7905], [78.8200, 10.3800], [78.5000, 9.8500],
                    [78.8300, 9.3700], [78.1348, 8.7642]
                ]
            })
        },
        {
            "prog": "TNRSP_II",
            "code": "TNRSP-CRN-01",
            "name": "Northern Core Road Network (Arcot - Villupuram - Vridhachalam)",
            "start": "Arcot (SH-04)",
            "end": "Vridhachalam (SH-70)",
            "districts": ["Ranipet", "Tiruvannamalai", "Villupuram", "Cuddalore"],
            "length": 147.3,
            "coords": json.dumps({
                "type": "LineString",
                "coordinates": [
                    [79.3300, 12.9000], [79.2000, 12.4500], [79.4800, 11.9400], [79.3200, 11.5200]
                ]
            })
        },
        {
            "prog": "TNRSP_II",
            "code": "TNRSP-CRN-02",
            "name": "Western Textile Corridor (Omalur - Sankari - Erode - Tiruppur)",
            "start": "Omalur (SH-86)",
            "end": "Tiruppur (SH-37)",
            "districts": ["Salem", "Namakkal", "Erode", "Tiruppur"],
            "length": 164.8,
            "coords": json.dumps({
                "type": "LineString",
                "coordinates": [
                    [78.0400, 11.7400], [77.8700, 11.4800], [77.7200, 11.3400], [77.3411, 11.1085]
                ]
            })
        },
        {
            "prog": "TNRSP_II",
            "code": "TNRSP-CRN-03",
            "name": "Southern Core Network (Rajapalayam - Sankarankoil - Tirunelveli - Ovari)",
            "start": "Rajapalayam (SH-41)",
            "end": "Ovari Coast (SH-89)",
            "districts": ["Virudhunagar", "Tenkasi", "Tirunelveli"],
            "length": 142.1,
            "coords": json.dumps({
                "type": "LineString",
                "coordinates": [
                    [77.5500, 9.4500], [77.5300, 9.1700], [77.7300, 8.7300], [77.8800, 8.2800]
                ]
            })
        }
    ]

    for a_spec in alignments_data:
        existing_a = db.query(CorridorAlignment).filter(CorridorAlignment.corridor_code == a_spec["code"]).first()
        prog_id = prog_map[a_spec["prog"]].id
        if not existing_a:
            db.add(CorridorAlignment(
                programme_id=prog_id,
                corridor_code=a_spec["code"],
                name=a_spec["name"],
                start_location=a_spec["start"],
                end_location=a_spec["end"],
                districts_json=json.dumps(a_spec["districts"]),
                total_length_km=a_spec["length"],
                coordinates_geojson=a_spec["coords"],
                status="ACTIVE"
            ))
    db.commit()

    # 3. LINK EXISTING PROJECTS & CREATE SPECIAL PROGRAMME PROJECTS
    zone_chennai = db.query(Zone).filter(Zone.name.like("%Chennai%")).first()
    circle_kch = db.query(Circle).filter(Circle.name.like("%Chengalpattu%")).first()
    div_kch = db.query(Division).first()
    dept_hw = db.query(Department).filter(Department.code == "HIGHWAYS").first()
    org_first = db.query(Organisation).first()
    org_id = org_first.id if org_first else 1

    # Dedicated contractors for major corridor projects
    def get_or_create_contractor(reg, name):
        c = db.query(Contractor).filter(Contractor.registration_number == reg).first()
        if not c:
            c = Contractor(
                organisation_id=org_id,
                registration_number=reg,
                company_name=name,
                class_category="Class I",
                is_blacklisted=False
            )
            db.add(c)
            db.commit()
            db.refresh(c)
        return c

    cont_rcc = get_or_create_contractor("TN-CONT-CL1-0104", "Ramalingam Construction Company Pvt Ltd")
    cont_bscpl = get_or_create_contractor("TN-CONT-CL1-0089", "BSCPL Infrastructure Ltd")
    cont_ncc = get_or_create_contractor("TN-CONT-CL1-0092", "NCC Limited")
    cont_trans = get_or_create_contractor("TN-CONT-CL1-0095", "Transstroy Infrastructure Ltd")

    # Create CKICP Dedicated Projects
    ckicp_projects_specs = [
        {
            "code": "PRJ-CKICP-001",
            "title": "CKICP Kancheepuram Corridor: Widening & Strengthening of SH-116/SH-58 km 12/0 to 34/5",
            "prog": "CKICP",
            "cost_cr": 260.70,
            "phys_pct": 28.5,
            "fin_pct": 24.2,
            "status": "IN_PROGRESS",
            "contractor_id": cont_rcc.id,
            "packages": [
                {"num": "CKICP/KCH/PKG-01", "title": "Widening to 4-Lanes of SH-116 (km 12/0 - 24/0)", "cost": 142.50},
                {"num": "CKICP/KCH/PKG-02", "title": "Two-lane with paved shoulder upgrade of SH-58 (km 24/0 - 34/5)", "cost": 118.20}
            ]
        },
        {
            "code": "PRJ-CKICP-002",
            "title": "CKICP Tiruchirappalli Industrial Link: Upgradation of Regional Corridors & Grade Separators",
            "prog": "CKICP",
            "cost_cr": 218.00,
            "phys_pct": 12.0,
            "fin_pct": 8.5,
            "status": "TENDERED",
            "contractor_id": None,
            "packages": [
                {"num": "CKICP/TRY/PKG-01", "title": "Trichy Semi-Ring Road & Corridor Grade Separators", "cost": 125.00},
                {"num": "CKICP/TRY/PKG-02", "title": "Pudukkottai Industrial Link Road Strengthening", "cost": 93.00}
            ]
        },
        {
            "code": "PRJ-TNRSP-001",
            "title": "TNRSP-II Core Road Network EPC01: Kancheepuram - Vandavasi (SH-116) and SH-58 (48.482 km)",
            "prog": "TNRSP_II",
            "cost_cr": 184.98,
            "phys_pct": 100.0,
            "fin_pct": 98.5,
            "status": "COMPLETED",
            "contractor_id": cont_bscpl.id,
            "packages": [
                {"num": "TNRSP-II/EPC-01", "title": "CRN EPC01 Kancheepuram-Vandavasi & SH-58", "cost": 184.98}
            ]
        },
        {
            "code": "PRJ-TNRSP-002",
            "title": "TNRSP-II Core Road Network EPC02: Arcot - Villupuram (SH-04) (83.075 km)",
            "prog": "TNRSP_II",
            "cost_cr": 320.02,
            "phys_pct": 100.0,
            "fin_pct": 100.0,
            "status": "COMPLETED",
            "contractor_id": cont_ncc.id,
            "packages": [
                {"num": "TNRSP-II/EPC-02", "title": "CRN EPC02 Arcot - Villupuram 4-Lane Paved Shoulders", "cost": 320.02}
            ]
        },
        {
            "code": "PRJ-TNRSP-003",
            "title": "TNRSP-II Modified DBFOT Concession PPP02: Oddanchatram - Dharapuram - Tiruppur (SH-37) (70.2 km)",
            "prog": "TNRSP_II",
            "cost_cr": 716.33,
            "phys_pct": 100.0,
            "fin_pct": 94.0,
            "status": "COMPLETED",
            "contractor_id": cont_trans.id,
            "packages": [
                {"num": "TNRSP-II/PPP-02", "title": "Concession Package SH-37 (8-Year Maintenance Period)", "cost": 716.33}
            ]
        }
    ]

    proj_map = {}
    pkg_map = {}
    for p_spec in ckicp_projects_specs:
        existing_p = db.query(Project).filter(Project.project_code == p_spec["code"]).first()
        prog_id = prog_map[p_spec["prog"]].id
        if not existing_p:
            existing_p = Project(
                project_code=p_spec["code"],
                programme_id=prog_id,
                title=p_spec["title"],
                description=f"Strategic corridor implementation under {p_spec['prog']} with multilateral financing.",
                road_type="SH",
                estimated_cost_cr=p_spec["cost_cr"],
                sanctioned_cost_cr=p_spec["cost_cr"],
                expenditure_to_date_cr=p_spec["cost_cr"] * (p_spec["fin_pct"] / 100.0),
                physical_progress_pct=p_spec["phys_pct"],
                financial_progress_pct=p_spec["fin_pct"],
                status=p_spec["status"],
                priority="HIGH",
                start_date=datetime.datetime(2023, 1, 15),
                target_completion_date=datetime.datetime(2026, 12, 31),
                zone_id=zone_chennai.id if zone_chennai else 1,
                circle_id=circle_kch.id if circle_kch else 1,
                division_id=div_kch.id if div_kch else 1,
                executing_department_id=dept_hw.id if dept_hw else 1,
                contractor_id=p_spec["contractor_id"]
            )
            db.add(existing_p)
            db.commit()
            db.refresh(existing_p)
        else:
            existing_p.programme_id = prog_id
            existing_p.sanctioned_cost_cr = p_spec["cost_cr"]
            existing_p.physical_progress_pct = p_spec["phys_pct"]
            existing_p.financial_progress_pct = p_spec["fin_pct"]
            existing_p.contractor_id = p_spec["contractor_id"]
            db.commit()
        proj_map[p_spec["code"]] = existing_p

        # Work packages
        for pkg_spec in p_spec.get("packages", []):
            existing_pkg = db.query(WorkPackage).filter(WorkPackage.package_number == pkg_spec["num"]).first()
            if not existing_pkg:
                existing_pkg = WorkPackage(
                    project_id=existing_p.id,
                    package_number=pkg_spec["num"],
                    title=pkg_spec["title"],
                    scope_description=f"Package execution under {p_spec['code']}",
                    cost_cr=pkg_spec["cost"],
                    start_km=0.0,
                    end_km=25.0,
                    status="ACTIVE"
                )
                db.add(existing_pkg)
                db.commit()
                db.refresh(existing_pkg)
            pkg_map[pkg_spec["num"]] = existing_pkg

    # 4. OFFICIAL TENDERS (INCLUDING THE 4 ANNOUNCEMENTS PUBLISHED 18-02-2026)
    tenders_data = [
        {
            "prog": "CKICP",
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-01",
            "ref": "CKICP-KANCHI-PKG-01-2026",
            "pkg_no": "Tender Package 01",
            "title": "CKICP Kancheepuram, Tender Package 01 - Widening & Strengthening of SH-116 Corridor",
            "desc": "Widening to four lanes and strengthening of State Highway corridor km 12/0 to 24/0 in Kancheepuram circle with paved shoulders and culvert extensions.",
            "district": "Kancheepuram",
            "cost": 142.50,
            "funding": "Asian Development Bank (ADB)",
            "eligibility": "Class I Highways Contractors / International Competitive Bidding (ICB)",
            "pub_date": datetime.datetime(2026, 2, 18),
            "sub_deadline": datetime.datetime(2026, 3, 25, 15, 0),
            "tech_date": datetime.datetime(2026, 3, 26, 15, 30),
            "fin_date": None,
            "status": "TECH_EVALUATION",
            "url": "https://www.ckicp.tn.gov.in/admin/uploads/fnews_pdf50.pdf"
        },
        {
            "prog": "CKICP",
            "proj_code": "PRJ-CKICP-002",
            "pkg_num": "CKICP/TRY/PKG-01",
            "ref": "CKICP-TRICHY-PKG-01-02-2026",
            "pkg_no": "Tender Packages 01 and 02",
            "title": "CKICP Trichy, Tender Packages 01 and 02 - Upgrading of Regional Industrial Corridors & Grade Separators",
            "desc": "Two-lane with paved shoulder corridor upgrade and two grade separators along Tiruchirappalli industrial access corridors.",
            "district": "Tiruchirappalli",
            "cost": 218.00,
            "funding": "Asian Development Bank (ADB)",
            "eligibility": "Class I Highways Contractors / National Competitive Bidding (NCB)",
            "pub_date": datetime.datetime(2026, 2, 18),
            "sub_deadline": datetime.datetime(2026, 3, 30, 15, 0),
            "tech_date": datetime.datetime(2026, 3, 31, 15, 30),
            "fin_date": None,
            "status": "PUBLISHED",
            "url": "https://www.ckicp.tn.gov.in/admin/uploads/fnews_pdf53.pdf"
        },
        {
            "prog": "CKICP",
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-02",
            "ref": "CKICP-KANCHI-PKG-03-2026",
            "pkg_no": "Tender Package 03",
            "title": "CKICP Kancheepuram, Tender Package 03 - Construction of High-Level Bridge & Urban Corridor Expansion",
            "desc": "Construction of high-level river bridge across Palar subsidiary channel and urban four-lane expansion with storm water drains in Kancheepuram taluk.",
            "district": "Kancheepuram",
            "cost": 96.80,
            "funding": "Asian Development Bank (ADB)",
            "eligibility": "Class I Highways Contractors / National Competitive Bidding (NCB)",
            "pub_date": datetime.datetime(2026, 2, 18),
            "sub_deadline": datetime.datetime(2026, 3, 28, 15, 0),
            "tech_date": datetime.datetime(2026, 3, 29, 15, 30),
            "fin_date": None,
            "status": "PUBLISHED",
            "url": "https://www.ckicp.tn.gov.in/admin/uploads/fnews_pdf52.pdf"
        },
        {
            "prog": "CKICP",
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-02",
            "ref": "CKICP-KANCHI-PKG-02-2026",
            "pkg_no": "Tender Package 02",
            "title": "CKICP Kancheepuram, Tender Package 02 - Highway Bypass and Junction Improvements",
            "desc": "Development of 2-lane with paved shoulder bypass and junction geometric improvements to eliminate traffic bottlenecks on SH-58.",
            "district": "Kancheepuram",
            "cost": 118.20,
            "funding": "Asian Development Bank (ADB)",
            "eligibility": "Class I Highways Contractors / National Competitive Bidding (NCB)",
            "pub_date": datetime.datetime(2026, 2, 18),
            "sub_deadline": datetime.datetime(2026, 3, 27, 15, 0),
            "tech_date": datetime.datetime(2026, 3, 28, 15, 30),
            "fin_date": None,
            "status": "PUBLISHED",
            "url": "https://www.ckicp.tn.gov.in/admin/uploads/fnews_pdf51.pdf"
        }
    ]

    for t_spec in tenders_data:
        existing_t = db.query(Tender).filter(Tender.tender_reference == t_spec["ref"]).first()
        prog_id = prog_map[t_spec["prog"]].id
        p_id = proj_map[t_spec["proj_code"]].id
        pkg_id = pkg_map[t_spec["pkg_num"]].id if t_spec["pkg_num"] in pkg_map else None

        if not existing_t:
            db.add(Tender(
                programme_id=prog_id,
                project_id=p_id,
                work_package_id=pkg_id,
                tender_reference=t_spec["ref"],
                package_number=t_spec["pkg_no"],
                title=t_spec["title"],
                work_description=t_spec["desc"],
                location_district=t_spec["district"],
                estimated_cost_cr=t_spec["cost"],
                funding_source=t_spec["funding"],
                bid_eligibility=t_spec["eligibility"],
                publication_date=t_spec["pub_date"],
                submission_deadline=t_spec["sub_deadline"],
                tech_opening_date=t_spec["tech_date"],
                fin_opening_date=t_spec["fin_date"],
                status=t_spec["status"],
                source_url=t_spec["url"],
                verification_status="Verified"
            ))
    db.commit()

    # 5. LAND PARCELS (VERIFIED CADASTRAL DATA FOR CKICP AND TNRSP-II)
    parcels_data = [
        {
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-01",
            "ref": "LA-CKICP-KCH-001",
            "district": "Kancheepuram",
            "taluk": "Walajabad",
            "village": "Thimmayanpettai",
            "survey": "142/1B, 142/2A",
            "class": "Dry Agricultural Land",
            "private": 14812.0,
            "govt": 750.0,
            "total": 15562.0,
            "notif_date": datetime.datetime(2024, 4, 10),
            "gazette_date": datetime.datetime(2024, 8, 15),
            "award_date": datetime.datetime(2025, 2, 20),
            "comp_assessed": 4.80,
            "comp_paid": 4.80,
            "possession": "POSSESSION_HANDED_OVER",
            "litigation": False,
            "officer": "Special District Revenue Officer (LA), CKICP Kancheepuram"
        },
        {
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-02",
            "ref": "LA-CKICP-KCH-002",
            "district": "Chengalpattu",
            "taluk": "Chengalpattu",
            "village": "Alapakkam",
            "survey": "88/3A, 89/1",
            "class": "Commercial & Residential Patta",
            "private": 40874.0,
            "govt": 35343.0,
            "total": 76217.0,
            "notif_date": datetime.datetime(2024, 6, 5),
            "gazette_date": datetime.datetime(2024, 11, 20),
            "award_date": datetime.datetime(2025, 6, 10),
            "comp_assessed": 12.50,
            "comp_paid": 8.20,
            "possession": "PARTIAL_DISPUTED",
            "litigation": True,
            "officer": "Special Tahsildar (LA) Unit II, Chengalpattu"
        },
        {
            "proj_code": "PRJ-TNRSP-002",
            "pkg_num": "TNRSP-II/EPC-02",
            "ref": "LA-TNRSP-VLP-001",
            "district": "Villupuram",
            "taluk": "Gingee",
            "village": "Sathanur",
            "survey": "204/2, 205/1B",
            "class": "Dry Agricultural & Poramboke",
            "private": 78864.0,
            "govt": 4247.0,
            "total": 83111.0,
            "notif_date": datetime.datetime(2022, 3, 12),
            "gazette_date": datetime.datetime(2022, 7, 24),
            "award_date": datetime.datetime(2023, 1, 18),
            "comp_assessed": 16.40,
            "comp_paid": 16.40,
            "possession": "POSSESSION_HANDED_OVER",
            "litigation": False,
            "officer": "Special DRO (LA), TNRSP-II Villupuram"
        },
        {
            "proj_code": "PRJ-TNRSP-003",
            "pkg_num": "TNRSP-II/PPP-02",
            "ref": "LA-TNRSP-TPR-001",
            "district": "Tiruppur",
            "taluk": "Dharapuram",
            "village": "Kundadam",
            "survey": "512/1C, 513/2",
            "class": "Agricultural & Industrial Footprint",
            "private": 716334.0,
            "govt": 46354.0,
            "total": 762688.0,
            "notif_date": datetime.datetime(2021, 5, 10),
            "gazette_date": datetime.datetime(2021, 9, 28),
            "award_date": datetime.datetime(2022, 6, 15),
            "comp_assessed": 68.50,
            "comp_paid": 68.50,
            "possession": "POSSESSION_HANDED_OVER",
            "litigation": False,
            "officer": "Special DRO (LA), TNRSP-II Tiruppur"
        }
    ]

    for l_spec in parcels_data:
        existing_l = db.query(LandParcel).filter(LandParcel.parcel_reference == l_spec["ref"]).first()
        p_id = proj_map[l_spec["proj_code"]].id
        pkg_id = pkg_map[l_spec["pkg_num"]].id if l_spec["pkg_num"] in pkg_map else None

        if not existing_l:
            db.add(LandParcel(
                project_id=p_id,
                work_package_id=pkg_id,
                parcel_reference=l_spec["ref"],
                district=l_spec["district"],
                taluk=l_spec["taluk"],
                village=l_spec["village"],
                survey_number=l_spec["survey"],
                land_classification=l_spec["class"],
                private_land_sqm=l_spec["private"],
                govt_land_sqm=l_spec["govt"],
                total_land_sqm=l_spec["total"],
                notification_15_2_date=l_spec["notif_date"],
                gazette_15_1_date=l_spec["gazette_date"],
                award_19_1_date=l_spec["award_date"],
                compensation_assessed_cr=l_spec["comp_assessed"],
                compensation_paid_cr=l_spec["comp_paid"],
                possession_status=l_spec["possession"],
                has_litigation=l_spec["litigation"],
                responsible_revenue_officer=l_spec["officer"]
            ))
    db.commit()

    # 6. LEGAL CASES
    parcels_map = {lp.parcel_reference: lp.id for lp in db.query(LandParcel).all()}
    legal_cases_data = [
        {
            "proj_code": "PRJ-CKICP-001",
            "pkg_num": "CKICP/KCH/PKG-02",
            "parcel_ref": "LA-CKICP-KCH-002",
            "ref": "WP/2026/4102",
            "court": "High Court of Judicature at Madras (Principal Seat)",
            "type": "Land Acquisition Valuation Challenge",
            "petitioner": "Alapakkam Landowners Welfare Association",
            "respondent": "State of Tamil Nadu rep. by Principal Secretary, Highways & Special DRO CKICP",
            "summary": "Writ petition challenging market value determination by District Collector under Section 19(1) of TN Highways Act 2001; interim stay granted on 2.4 Ha stretch.",
            "stay": True,
            "exposure": 4.30,
            "next_date": datetime.datetime(2026, 4, 22),
            "officer": "Special Government Pleader (Highways), Madras High Court",
            "status": "PENDING_HEARING"
        },
        {
            "proj_code": "PRJ-TNRSP-001",
            "pkg_num": "TNRSP-II/EPC-01",
            "parcel_ref": "LA-CKICP-KCH-001",
            "ref": "ARB/2025/18",
            "court": "High Level Dispute Resolution Committee / Arbitration Tribunal",
            "type": "Contractor Price Escalation Claim",
            "petitioner": "Working EPC Contractor Consortium",
            "respondent": "Project Director, TNRSP-II, Guindy, Chennai",
            "summary": "Arbitration dispute claiming price escalation on VG-30 Bitumen hauling lead distances during COVID-19 schedule disruption.",
            "stay": False,
            "exposure": 6.42,
            "next_date": datetime.datetime(2026, 5, 10),
            "officer": "Law Officer, Directorate of Highways, Chennai",
            "status": "PENDING_HEARING"
        }
    ]

    for lc_spec in legal_cases_data:
        existing_lc = db.query(LegalCase).filter(LegalCase.case_reference == lc_spec["ref"]).first()
        p_id = proj_map[lc_spec["proj_code"]].id
        pkg_id = pkg_map[lc_spec["pkg_num"]].id if lc_spec["pkg_num"] in pkg_map else None
        lp_id = parcels_map.get(lc_spec["parcel_ref"])

        if not existing_lc:
            db.add(LegalCase(
                project_id=p_id,
                work_package_id=pkg_id,
                land_parcel_id=lp_id,
                case_reference=lc_spec["ref"],
                court_name=lc_spec["court"],
                case_type=lc_spec["type"],
                petitioner=lc_spec["petitioner"],
                respondent=lc_spec["respondent"],
                summary=lc_spec["summary"],
                interim_stay_in_force=lc_spec["stay"],
                financial_exposure_cr=lc_spec["exposure"],
                next_hearing_date=lc_spec["next_date"],
                responsible_legal_officer=lc_spec["officer"],
                current_status=lc_spec["status"]
            ))
    db.commit()

    print("CKICP and TNRSP-II Master Programmes, Tenders, Land Parcels and Litigation successfully seeded.")

    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_ckicp_tnrsp()
