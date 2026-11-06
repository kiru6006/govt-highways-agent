import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Role, Department, Official, ServiceCategory, Designation,
    HistoricalPosting, DelegationOfAuthority, StatutoryCommittee,
    GovernmentDocumentRegistry, CommitteeMeeting, CommitteeDecision,
    StatutoryReferral, AIIntelligenceFinding, Project
)
from app.auth import get_password_hash

def seed_official_verification(db_session: Session = None):
    if db_session is None:
        db = SessionLocal()
        close_on_exit = True
    else:
        db = db_session
        close_on_exit = False

    Base.metadata.create_all(bind=db.get_bind())

    print("Seeding official Tamil Nadu Highways organisation, service cadres, and verified leadership...")

    pwd_common = get_password_hash("highway123")
    pwd_admin = get_password_hash("admin123")

    # 1. SERVICE CATEGORIES
    cats = [
        {"code": "POLITICAL", "name": "Council of Ministers, Government of Tamil Nadu", "governing_rules": "Constitution of India / Tamil Nadu Government Business Rules"},
        {"code": "IAS", "name": "Indian Administrative Service (IAS) - State Secretariat", "governing_rules": "IAS (Cadre) Rules / Tamil Nadu Secretariat Service Rules"},
        {"code": "TN_HES", "name": "Tamil Nadu Highways Engineering Service (TN-HES)", "governing_rules": "G.O.Ms.No.172, Highways & Minor Ports, dated 03.11.2025"},
        {"code": "TN_HESS", "name": "Tamil Nadu Highways Engineering Subordinate Service (TN-HESS)", "governing_rules": "Special Rules for TN-HESS"},
        {"code": "EXTERNAL", "name": "External Project Entities (Contractors & Consultants)", "governing_rules": "Tamil Nadu Transparency in Tenders Act, 1998"},
    ]
    cat_map = {}
    for c in cats:
        existing = db.query(ServiceCategory).filter(ServiceCategory.code == c["code"]).first()
        if not existing:
            existing = ServiceCategory(code=c["code"], name=c["name"], governing_rules=c["governing_rules"])
            db.add(existing)
            db.commit()
            db.refresh(existing)
        cat_map[c["code"]] = existing

    # 2. OFFICIAL DESIGNATIONS
    desigs = [
        {"code": "MINISTER", "title": "Minister for Public Works and Sports Development", "cat": "POLITICAL", "rank": 1, "ts": 9999.0, "ta": 9999.0},
        {"code": "PRIN_SEC", "title": "Principal Secretary to Government, Highways and Minor Ports", "cat": "IAS", "rank": 2, "ts": 100.0, "ta": 100.0},
        {"code": "DIR_GEN", "title": "Director General (H), Highways Department", "cat": "TN_HES", "rank": 3, "ts": 50.0, "ta": 50.0},
        {"code": "CHIEF_ENG", "title": "Chief Engineer (H)", "cat": "TN_HES", "rank": 4, "ts": 25.0, "ta": 25.0},
        {"code": "DIR_HRS", "title": "Director (H), Highways Research Station", "cat": "TN_HES", "rank": 4, "ts": 25.0, "ta": 25.0},
        {"code": "SUP_ENG", "title": "Superintending Engineer (H)", "cat": "TN_HES", "rank": 5, "ts": 5.0, "ta": 5.0},
        {"code": "DIV_ENG", "title": "Divisional Engineer (H)", "cat": "TN_HES", "rank": 6, "ts": 1.0, "ta": 0.50},
        {"code": "ASST_DIV_ENG", "title": "Assistant Divisional Engineer (H)", "cat": "TN_HES", "rank": 7, "ts": 0.20, "ta": 0.0},
        {"code": "ASST_ENG", "title": "Assistant Engineer (H)", "cat": "TN_HESS", "rank": 8, "ts": 0.0, "ta": 0.0},
        {"code": "JR_ENG", "title": "Junior Engineer (H)", "cat": "TN_HESS", "rank": 8, "ts": 0.0, "ta": 0.0},
    ]
    desig_map = {}
    for d in desigs:
        existing = db.query(Designation).filter(Designation.code == d["code"]).first()
        if not existing:
            existing = Designation(
                code=d["code"],
                title=d["title"],
                service_category_id=cat_map[d["cat"]].id if d["cat"] in cat_map else None,
                hierarchical_rank=d["rank"],
                technical_sanction_limit_cr=d["ts"],
                tender_acceptance_limit_cr=d["ta"]
            )
            db.add(existing)
            db.commit()
            db.refresh(existing)
        desig_map[d["code"]] = existing

    # 3. STATUTORY COMMITTEES & APPROVAL BODIES
    committees = [
        {
            "code": "BOE",
            "name": "Board of Engineers (BOE) - Highest Technical Authority",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Highest technical authority for policy decisions on engineering techniques, technical standards, specifications, and administrative reforms.",
            "go": "G.O. Ms. No. 359 (12.08.1997) & G.O. Ms. No. 1 (07.01.2011)"
        },
        {
            "code": "TAC",
            "name": "Technical Audit Committee (TAC)",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Mandatory technical audit for bridge works with linear waterway > 150m and complex bypasses/grade separators before according Technical Sanction.",
            "go": "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009"
        },
        {
            "code": "RASC",
            "name": "Revised Administrative Sanction Committee (RASC)",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Processing and recommendation of work proposals requiring Revised Administrative Sanction (RAS).",
            "go": "G.O. Ms. No. 289 (04.12.2008) & G.O. Ms. No. 1 (07.01.2011)"
        },
        {
            "code": "RASC_LA",
            "name": "Revised Administrative Sanction Committee for Land Acquisition",
            "chairperson": "Commissioner of Land Acquisition",
            "mandate": "Scrutiny and processing of revised land acquisition financial estimates and enhanced solatium proposals.",
            "go": "G.O. Ms. No. 163, Highways and Minor Ports (HN1), dated 13.12.2023"
        },
        {
            "code": "COT",
            "name": "Commissionerate of Tenders (COT)",
            "chairperson": "Secretary to Government, Finance / Director General (H)",
            "mandate": "Statutory scrutiny of tenders with excess above 10% (up to 50L), above 6% (up to 1Cr), all individual works > 6Cr, and package works > 7.50Cr.",
            "go": "G.O. Ms. No. 75 (02.09.2026) & G.O. Ms. No. 29 (03.03.2022)"
        },
        {
            "code": "SSR",
            "name": "Standard Schedule of Rates (SSR) Committee",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Annual compilation and notification of standardized departmental rate schedule for labor, materials, and machinery.",
            "go": "G.O. Ms. No. 21 (25.01.1999) & G.O. Ms. No. 1 (07.01.2011)"
        },
        {
            "code": "HLDRC",
            "name": "High Level Dispute Resolution Committee (HLDRC)",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Amicable settlement and speedy disposal of contractual disputes, claims, and arbitration matters.",
            "go": "G.O. Ms. No. 17 (06.03.2023) & G.O. Ms. No. 87 (21.07.2023)"
        },
        {
            "code": "EXPERT_16B",
            "name": "Three Member Expert Committee (Section 16(b) TNTIT Act)",
            "chairperson": "Joint Director, Office of the Director General (H)",
            "mandate": "Evaluation and approval for entrustment of additional quantities exceeding 25% of agreement quantities to original contractor.",
            "go": "G.O. Ms. No. 05, Highways and Minor Ports (HN2), dated 13.01.2026"
        },
        {
            "code": "TNRIDC_BOARD",
            "name": "TNRIDC - Board of Directors",
            "chairperson": "Principal Secretary to Government, Highways and Minor Ports Department",
            "mandate": "Supreme corporate governance, capital investments, policy approvals, and project financing for industrial corridors, ring roads, and port connectivity infrastructure.",
            "go": "G.O. Ms. No. 162, Highways (HN2) Dept, dated 24.06.2005"
        },
        {
            "code": "TNRIDC_AUDIT",
            "name": "TNRIDC Audit Committee",
            "chairperson": "Deputy Secretary to Government, Finance Department",
            "mandate": "Statutory financial scrutiny, internal audit reviews, vigilance compliance, and corporate risk governance under Section 177 of Companies Act, 2013.",
            "go": "Companies Act, 2013 / TNRIDC Board Resolution No. 4"
        },
        {
            "code": "TNRIDC_TECH",
            "name": "TNRIDC Technical Sanction Committee",
            "chairperson": "Director General (H), Highways Department",
            "mandate": "Specialized technical scrutiny, detailed project report clearance, and structural sanction for high-speed expressways and major ring roads executed through TNRIDC.",
            "go": "TNRIDC Board Resolution No. 12 / G.O. Ms. No. 162"
        }
    ]
    for c in committees:
        existing = db.query(StatutoryCommittee).filter(StatutoryCommittee.code == c["code"]).first()
        if not existing:
            db.add(StatutoryCommittee(
                code=c["code"],
                name=c["name"],
                chairperson_title=c["chairperson"],
                mandate_summary=c["mandate"],
                constitution_go=c["go"]
            ))
    db.commit()

    # 4. DELEGATIONS OF AUTHORITY
    delegations = [
        {
            "code": "COT",
            "power": "TENDER_ACCEPTANCE",
            "limit": 9999.0,
            "excess": 0.0,
            "ref": "G.O. Ms. No. 75 dated 02.09.2026",
            "remarks": "Individual works > Rs 6.00 Cr and Package works > Rs 7.50 Cr irrespective of tender excess"
        },
        {
            "code": "CHIEF_ENG",
            "power": "TECHNICAL_SANCTION",
            "limit": 25.0,
            "excess": 0.0,
            "ref": "G.O. Ms. No. 172 dated 03.11.2025",
            "remarks": "Full powers within sanctioned scheme for road/bridge estimates up to Rs 25.00 Cr"
        },
        {
            "code": "SUP_ENG",
            "power": "TECHNICAL_SANCTION",
            "limit": 5.0,
            "excess": 0.0,
            "ref": "Tamil Nadu Highways Manual Vol II",
            "remarks": "Circle jurisdiction estimates up to Rs 5.00 Cr"
        },
        {
            "code": "DIV_ENG",
            "power": "TENDER_ACCEPTANCE",
            "limit": 0.50,
            "excess": 5.0,
            "ref": "Tamil Nadu Highways Manual Vol II / G.O. Ms. 29",
            "remarks": "Divisional Engineer (H) approval for maintenance and minor works up to Rs 50 Lakhs"
        }
    ]
    for d in delegations:
        existing = db.query(DelegationOfAuthority).filter(
            DelegationOfAuthority.designation_code == d["code"],
            DelegationOfAuthority.power_type == d["power"]
        ).first()
        if not existing:
            db.add(DelegationOfAuthority(
                designation_code=d["code"],
                power_type=d["power"],
                monetary_limit_cr=d["limit"],
                tender_excess_pct_limit=d["excess"],
                statutory_rule_reference=d["ref"],
                remarks=d["remarks"]
            ))
    db.commit()

    # 5. SYNCHRONIZE OFFICIAL VERIFIED USER ACCOUNTS & PROFILES
    role_minister = db.query(Role).filter(Role.code == "MINISTER").first()
    role_prin_sec = db.query(Role).filter(Role.code == "PRIN_SEC").first()
    role_ce = db.query(Role).filter(Role.code == "CHIEF_ENG").first()
    role_se = db.query(Role).filter(Role.code == "SE_CIRCLE").first()
    role_ee = db.query(Role).filter(Role.code == "EE_DIV").first()
    dept_hw = db.query(Department).filter(Department.code == "HIGHWAYS").first()

    verified_officials_specs = [
        {
            "username": "minister",
            "full_name": "Thiru Aadhav Arjuna",
            "email": "minister.highways@tn.gov.in",
            "phone": "+91-9444000008",
            "role": role_minister,
            "cadre": "POLITICAL",
            "designation": "Minister for Public Works and Sports Development",
            "posting": "Cabinet Secretariat, Fort St. George, Chennai - 600 009",
            "emp_code": "POL-MIN-001",
            "postings": [
                {
                    "title": "Minister for Public Works and Sports Development (Buildings, Highways & Minor Ports)",
                    "unit": "Cabinet of Tamil Nadu, Secretariat",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 6, 1),
                    "go": "G.O. / Council of Ministers Gazette Order 2024"
                }
            ]
        },
        {
            "username": "secretary",
            "full_name": "Thiru Shunchonngam Jatak Chiru, IAS",
            "email": "hwaysec@tn.gov.in",
            "phone": "044-25670959",
            "role": role_prin_sec,
            "cadre": "IAS",
            "designation": "Principal Secretary to Government",
            "posting": "Highways and Minor Ports Department, Secretariat, Fort St. George, Chennai - 600 009",
            "emp_code": "IAS-SEC-001",
            "postings": [
                {
                    "title": "Principal Secretary to Government, Highways and Minor Ports",
                    "unit": "Secretariat, Fort St. George, Chennai - 600 009",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 3, 1),
                    "go": "G.O. Rt. No. 89, Public (Special.A) Dept"
                }
            ]
        },
        {
            "username": "dg_highways",
            "full_name": "Er. R. Selvadurai",
            "email": "dgchn.hd@tn.gov.in",
            "phone": "044-22351099",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Director General (H)",
            "posting": "Integrated Chief Engineers Complex, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-DG-001",
            "postings": [
                {
                    "title": "Director General (H), Highways Department",
                    "unit": "Directorate of Highways, Guindy, Chennai",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 5, 1),
                    "go": "G.O. (Rt) No. 45, Highways & Minor Ports"
                }
            ]
        },
        {
            "username": "pd_tnrsp",
            "full_name": "Thiru D. Baskara Pandian, IAS",
            "email": "pd.tnrsp@gov.in",
            "phone": "044-24954360",
            "role": role_ce,
            "cadre": "IAS",
            "designation": "Project Director (A/C TNRSP, FAC CKICP)",
            "posting": "CKICP Complex, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "IAS-PD-002",
            "postings": [
                {
                    "title": "Project Director (A/C), TNRSP-II",
                    "unit": "TNRSP-II World Bank Project Directorate",
                    "type": "ADDITIONAL_CHARGE",
                    "from_date": datetime.datetime(2024, 8, 1),
                    "go": "G.O. (Rt) No. 132, Public (Special.A)"
                },
                {
                    "title": "Project Director (FAC), CKICP",
                    "unit": "Chennai-Kanyakumari Industrial Corridor Project",
                    "type": "FULL_ADDITIONAL_CHARGE",
                    "from_date": datetime.datetime(2024, 10, 1),
                    "go": "G.O. (Rt) No. 165, Public (Special.A)"
                }
            ]
        },
        {
            "username": "chief_eng",
            "full_name": "Er. S. Palanivel",
            "email": "cengrcmchn.hd@tn.gov.in",
            "phone": "044-22350690",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H), C&M Chennai Region",
            "posting": "Kalaignar Centenary Building, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-CE-001",
            "postings": [
                {
                    "title": "Chief Engineer (H), Construction and Maintenance (Chennai Region)",
                    "unit": "C&M Chennai Region",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 7, 1),
                    "go": "G.O.(Rt) No. 112, Highways"
                },
                {
                    "title": "Chief Engineer (H) (A/C), Construction and Maintenance (Coimbatore Region)",
                    "unit": "C&M Coimbatore Region",
                    "type": "ADDITIONAL_CHARGE",
                    "from_date": datetime.datetime(2025, 1, 15),
                    "go": "G.O.(Rt) No. 18, Highways"
                }
            ]
        },
        {
            "username": "ce_trichy",
            "full_name": "Er. S. Jawahar Muthuraj",
            "email": "cehcandmtrichy@gmail.com",
            "phone": "0431-2420455",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H), C&M Trichy Region",
            "posting": "T.V.S. Toll Gate, Tiruchirappalli - 620 020",
            "emp_code": "HES-CE-002",
            "postings": [
                {
                    "title": "Chief Engineer (H), Construction and Maintenance (Trichy Region)",
                    "unit": "C&M Trichy Region",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 6, 1),
                    "go": "G.O.(Rt) No. 98, Highways"
                }
            ]
        },
        {
            "username": "ce_madurai",
            "full_name": "Er. Ramesh",
            "email": "cecandmmduregion1@gmail.com",
            "phone": "0452-2531234",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H), C&M Madurai Region",
            "posting": "Alagar Kovil Road, near Thamarai Thotti, Madurai - 625 002",
            "emp_code": "HES-CE-003",
            "postings": [
                {
                    "title": "Chief Engineer (H), Construction and Maintenance (Madurai Region)",
                    "unit": "C&M Madurai Region",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 9, 1),
                    "go": "G.O.(Rt) No. 142, Highways"
                }
            ]
        },
        {
            "username": "ce_nh",
            "full_name": "Er. K. Vanathi",
            "email": "cenhchn.hd@tn.gov.in",
            "phone": "044-22355701",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H), National Highways",
            "posting": "Integrated Chief Engineers Complex, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-CE-004",
            "postings": [
                {
                    "title": "Chief Engineer (H), National Highways Wing",
                    "unit": "National Highways Wing, Guindy, Chennai",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 4, 1),
                    "go": "G.O.(Rt) No. 67, Highways"
                }
            ]
        },
        {
            "username": "ce_pdi",
            "full_name": "Er. S. Yamini",
            "email": "cengr.pdi@tn.gov.in",
            "phone": "044-22352068",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H), Planning Designs & Investigation",
            "posting": "Integrated Chief Engineers Complex, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-CE-005",
            "postings": [
                {
                    "title": "Chief Engineer (H), Planning Designs and Investigation (PDI)",
                    "unit": "PDI Wing, HRS Campus, Guindy",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 5, 15),
                    "go": "G.O.(Rt) No. 81, Highways"
                },
                {
                    "title": "Chief Engineer (H) (A/C), TNRSP-II",
                    "unit": "TNRSP-II Directorate, Chennai",
                    "type": "ADDITIONAL_CHARGE",
                    "from_date": datetime.datetime(2024, 11, 1),
                    "go": "G.O.(Rt) No. 177, Highways"
                }
            ]
        },
        {
            "username": "dir_hrs",
            "full_name": "Er. A. Venkatachalam",
            "email": "dirhrschn.hd@tn.gov.in",
            "phone": "044-22354851",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Director (H), Highways Research Station",
            "posting": "HRS Campus, 76 Sardar Patel Road, Guindy, Chennai - 600 025",
            "emp_code": "HES-DIR-001",
            "postings": [
                {
                    "title": "Director (H), Highways Research Station (HRS)",
                    "unit": "HRS Guindy, Sardar Patel Road, Chennai",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 2, 1),
                    "go": "G.O.(Rt) No. 34, Highways"
                }
            ]
        },
        {
            "username": "ce_ckicp",
            "full_name": "Er. R. Vimala",
            "email": "prjdir.ckicp@tn.gov.in",
            "phone": "044-22350664",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Chief Engineer (H) (A/C), CKICP",
            "posting": "CKICP Complex, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-CE-006",
            "postings": [
                {
                    "title": "Chief Engineer (H) (A/C), Chennai-Kanyakumari Industrial Corridor Project",
                    "unit": "CKICP Directorate, Guindy",
                    "type": "ADDITIONAL_CHARGE",
                    "from_date": datetime.datetime(2024, 10, 1),
                    "go": "G.O.(Rt) No. 165, Highways"
                }
            ]
        },
        {
            "username": "mt_tansha",
            "full_name": "Er. D. Jebaselwin Gladson",
            "email": "mttansha2.hd@tn.gov.in",
            "phone": "044-22350022",
            "role": role_ce,
            "cadre": "TN_HES",
            "designation": "Member Technical, TANSHA",
            "posting": "Kalaignar Centenary Building, HRS Campus, Guindy, Chennai - 600 025",
            "emp_code": "HES-MT-001",
            "postings": [
                {
                    "title": "Member Technical, Tamil Nadu State Highways Authority (TANSHA)",
                    "unit": "TANSHA Headquarters, Guindy",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 8, 1),
                    "go": "G.O.(Rt) No. 129, Highways"
                }
            ]
        },
        {
            "username": "se_chengalpattu",
            "full_name": "Er. M. Rajendran",
            "email": "sechengalpattu.hd@tn.gov.in",
            "phone": "044-27426222",
            "role": role_se,
            "cadre": "TN_HES",
            "designation": "Superintending Engineer (H), Chengalpattu Circle",
            "posting": "Chengalpattu Circle Office, GST Road, Chengalpattu",
            "emp_code": "HES-SE-001",
            "postings": [
                {
                    "title": "Superintending Engineer (H), Chengalpattu Circle",
                    "unit": "Chengalpattu Circle Office",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2024, 6, 15),
                    "go": "G.O.(Rt) No. 102, Highways"
                }
            ]
        },
        {
            "username": "ee_tambaram",
            "full_name": "Er. P. Anandhan",
            "email": "detambaram.hd@tn.gov.in",
            "phone": "044-22265111",
            "role": role_ee,
            "cadre": "TN_HES",
            "designation": "Divisional Engineer (H), Tambaram Division",
            "posting": "Tambaram Division Office, GST Road, Tambaram, Chennai - 600 045",
            "emp_code": "HES-DE-001",
            "postings": [
                {
                    "title": "Divisional Engineer (H), Tambaram Division (C&M)",
                    "unit": "Tambaram Division, Chengalpattu Circle",
                    "type": "REGULAR",
                    "from_date": datetime.datetime(2023, 11, 1),
                    "go": "G.O.(Rt) No. 201, Highways, dated 28.10.2023"
                }
            ]
        }
    ]

    for spec in verified_officials_specs:
        u = db.query(User).filter(User.username == spec["username"]).first()
        if not u:
            u = User(
                username=spec["username"],
                email=spec["email"],
                hashed_password=pwd_common,
                full_name=spec["full_name"],
                phone=spec["phone"],
                role_id=spec["role"].id if spec["role"] else 1,
                department_id=dept_hw.id if dept_hw else None
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        else:
            u.full_name = spec["full_name"]
            u.email = spec["email"]
            u.phone = spec["phone"]
            db.commit()

        # Official record
        off = db.query(Official).filter(Official.user_id == u.id).first()
        if not off:
            off = db.query(Official).filter(Official.employee_code == spec["emp_code"]).first()
        if not off:
            off = Official(
                user_id=u.id,
                employee_code=spec["emp_code"],
                designation=spec["designation"],
                cadre=spec["cadre"],
                current_posting=spec["posting"],
                active_from=datetime.datetime(2024, 1, 1)
            )
            db.add(off)
            db.commit()
            db.refresh(off)
        else:
            off.user_id = u.id
            off.designation = spec["designation"]
            off.cadre = spec["cadre"]
            off.current_posting = spec["posting"]
            db.commit()

        # Historical Postings
        for p_spec in spec.get("postings", []):
            existing_p = db.query(HistoricalPosting).filter(
                HistoricalPosting.official_id == off.id,
                HistoricalPosting.designation_title == p_spec["title"]
            ).first()
            if not existing_p:
                db.add(HistoricalPosting(
                    official_id=off.id,
                    designation_title=p_spec["title"],
                    posting_unit=p_spec["unit"],
                    posting_type=p_spec["type"],
                    from_date=p_spec["from_date"],
                    is_current=True,
                    transfer_go_reference=p_spec["go"]
                ))
        db.commit()

    # 6. GOVERNMENT DOCUMENT REGISTRY
    docs_specs = [
        {
            "ref": "DOC-PN-2026-27",
            "title": "Highways and Minor Ports Department Policy Note 2026-2027",
            "category": "Policy Note",
            "dept": "Highways and Minor Ports Department",
            "go": "Demand No. 21 / 2026-2027",
            "date": datetime.datetime(2026, 3, 20),
            "eff_date": datetime.datetime(2026, 4, 1),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/policy_notes",
            "summary": "Legislative presentation by Minister for Public Works detailing strategic statewide road infrastructure priorities, CRIDP allocations, World Bank TNRSP-II closeout, CKICP status, and the 2026 departmental re-organization into 4 regional zones."
        },
        {
            "ref": "DOC-PN-2025-26",
            "title": "Highways and Minor Ports Department Policy Note 2025-2026",
            "category": "Policy Note",
            "dept": "Highways and Minor Ports Department",
            "go": "Demand No. 21 / 2025-2026",
            "date": datetime.datetime(2025, 3, 15),
            "eff_date": datetime.datetime(2025, 4, 1),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/policy_notes",
            "summary": "Legislative policy overview outlining budget provisions, NABARD rural connectivity, bypass initiatives, and flood restoration across 19 circles and 87 divisions."
        },
        {
            "ref": "DOC-GO-MS-172",
            "title": "Special Rules for the Tamil Nadu Highways Engineering Service (TN-HES)",
            "category": "Government Order",
            "dept": "Highways and Minor Ports (HK1) Department",
            "go": "G.O.Ms.No.172",
            "date": datetime.datetime(2025, 11, 3),
            "eff_date": datetime.datetime(2025, 11, 3),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/gos",
            "summary": "Statutory revision of Service Rules for TN-HES defining 5 officer categories (Director General, Chief Engineer, Superintending Engineer, Divisional Engineer, Assistant Divisional Engineer), recruitment criteria, qualification standards, and technical duties."
        },
        {
            "ref": "DOC-GO-MS-43",
            "title": "Reorganization and Restructuring of Highways Department into 4 Regional Zonal Cadres",
            "category": "Government Order",
            "dept": "Highways and Minor Ports Department",
            "go": "G.O.Ms.No.43",
            "date": datetime.datetime(2026, 1, 28),
            "eff_date": datetime.datetime(2026, 2, 1),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/gos",
            "summary": "Decentralization and rationalization of the department into 4 Zonal Commands (Chennai, Coimbatore, Madurai, Trichy), creating Regional Chief Engineers with unified administrative control over 19 circles, 87 divisions, and 353 subdivisions."
        },
        {
            "ref": "DOC-GO-MS-75",
            "title": "Revision of Financial Delegation of Powers for Technical Sanction and Tender Acceptance",
            "category": "Government Order",
            "dept": "Highways and Minor Ports (HN1) Department",
            "go": "G.O.Ms.No.75",
            "date": datetime.datetime(2026, 9, 2),
            "eff_date": datetime.datetime(2026, 9, 2),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/gos",
            "summary": "Revised monetary ceilings and tender excess thresholds for DE, SE, CE and Commissionerate of Tenders (COT). Sets mandatory COT acceptance for individual works > Rs 6.00 Cr and packages > Rs 7.50 Cr, and excess > 6% for works up to Rs 1.00 Cr."
        },
        {
            "ref": "DOC-GO-MS-163",
            "title": "Financial Delegation for Land Acquisition Sanctions and Enhanced Solatium Compensation",
            "category": "Government Order",
            "dept": "Highways and Minor Ports (HN1) Department",
            "go": "G.O.Ms.No.163",
            "date": datetime.datetime(2023, 12, 13),
            "eff_date": datetime.datetime(2023, 12, 13),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/gos",
            "summary": "Empowerment of Revised Administrative Sanction Committee for Land Acquisition (RASC-LA) under Commissioner of Land Acquisition for enhanced compensation and court-awarded solatium revisions."
        },
        {
            "ref": "DOC-GO-MS-05",
            "title": "Constitution of Three-Member Expert Committee under Section 16(b) of Tamil Nadu Transparency in Tenders Act",
            "category": "Government Order",
            "dept": "Highways and Minor Ports (HN2) Department",
            "go": "G.O.Ms.No.05",
            "date": datetime.datetime(2026, 1, 13),
            "eff_date": datetime.datetime(2026, 1, 13),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/gos",
            "summary": "Statutory constitution of 3-Member Expert Committee chaired by Joint Director (O/o DG) for scrutinizing additional quantity variations exceeding 25% of agreement quantities before execution."
        },
        {
            "ref": "DOC-SSR-2026-27",
            "title": "Tamil Nadu Highways Department Standard Schedule of Rates (SSR) 2026-2027",
            "category": "Schedule of Rates",
            "dept": "Highways Research Station & SSR Committee",
            "go": "SSR-TN-2026-27",
            "date": datetime.datetime(2026, 4, 1),
            "eff_date": datetime.datetime(2026, 4, 1),
            "status": "Verified",
            "url": "https://www.tnhighways.tn.gov.in/schedule_rates",
            "summary": "Standardized departmental schedule of basic rates for labour, raw materials (bitumen, cement, steel, aggregates), lead charts, and machinery operational rates for road and bridge works."
        }
    ]

    for d_spec in docs_specs:
        existing_doc = db.query(GovernmentDocumentRegistry).filter(GovernmentDocumentRegistry.document_reference == d_spec["ref"]).first()
        if not existing_doc:
            db.add(GovernmentDocumentRegistry(
                document_reference=d_spec["ref"],
                title=d_spec["title"],
                category=d_spec["category"],
                issuing_department=d_spec["dept"],
                go_number=d_spec["go"],
                order_date=d_spec["date"],
                effective_date=d_spec["eff_date"],
                verification_status=d_spec["status"],
                source_url=d_spec["url"],
                summary_abstract=d_spec["summary"],
                is_confidential=False
            ))
    db.commit()

    # 7. SAMPLE COMMITTEE MEETINGS & DECISIONS
    cot = db.query(StatutoryCommittee).filter(StatutoryCommittee.code == "COT").first()
    tac = db.query(StatutoryCommittee).filter(StatutoryCommittee.code == "TAC").first()
    exp16b = db.query(StatutoryCommittee).filter(StatutoryCommittee.code == "EXPERT_16B").first()
    sample_proj = db.query(Project).first()
    sample_proj_id = sample_proj.id if sample_proj else None

    if cot:
        meeting_cot = db.query(CommitteeMeeting).filter(CommitteeMeeting.meeting_reference == "COT-MTG-2026-004").first()
        if not meeting_cot:
            meeting_cot = CommitteeMeeting(
                committee_id=cot.id,
                meeting_reference="COT-MTG-2026-004",
                meeting_date=datetime.datetime(2026, 4, 12, 11, 0),
                venue="Committee Room, 3rd Floor, Main Secretariat, Chennai",
                chairperson_name="Thiru Shunchonngam Jatak Chiru, IAS",
                agenda_summary="Scrutiny of tender excess exceeding delegated Chief Engineer limits for ECR corridor works and CRN Package EPC03.",
                minutes_summary="Committee reviewed rate analysis submitted by CE (H) Chennai. Excess justified on account of increased bitumen hauling lead and night-time urban traffic constraints.",
                verification_status="Verified"
            )
            db.add(meeting_cot)
            db.commit()
            db.refresh(meeting_cot)

        dec_cot = db.query(CommitteeDecision).filter(CommitteeDecision.decision_reference == "COT-DEC-2026-042").first()
        if not dec_cot:
            db.add(CommitteeDecision(
                meeting_id=meeting_cot.id,
                committee_id=cot.id,
                project_id=sample_proj_id,
                decision_reference="COT-DEC-2026-042",
                subject="Acceptance of Tender with +8.40% Excess on SH-49 ECR Widening",
                decision_type="APPROVED_WITH_CONDITIONS",
                decision_text="Commissionerate of Tenders accepts lowest tender of M/s Consolidated Construction Consortium at +8.40% above estimated cost subject to contractor furnishing additional 2.5% performance bank guarantee for timely progress.",
                statutory_condition="Additional 2.5% PBG to be deposited before Agreement execution.",
                government_order_ref="G.O. Ms. No. 75 / COT Resolution No. 42",
                verification_status="Verified"
            ))
            db.commit()

    if tac:
        meeting_tac = db.query(CommitteeMeeting).filter(CommitteeMeeting.meeting_reference == "TAC-MTG-2026-104").first()
        if not meeting_tac:
            meeting_tac = CommitteeMeeting(
                committee_id=tac.id,
                meeting_reference="TAC-MTG-2026-104",
                meeting_date=datetime.datetime(2026, 3, 28, 14, 30),
                venue="HRS Auditorium, Guindy, Chennai",
                chairperson_name="Er. R. Selvadurai, Director General (H)",
                agenda_summary="Technical Audit for major bridge reconstruction with linear waterway exceeding 150m across coastal backwaters.",
                minutes_summary="TAC evaluated 2D hydrodynamic HEC-RAS model, scour depth simulations, and prestressed girder design. Cleared structural design with mandatory pile integrity tests.",
                verification_status="Verified"
            )
            db.add(meeting_tac)
            db.commit()
            db.refresh(meeting_tac)

        dec_tac = db.query(CommitteeDecision).filter(CommitteeDecision.decision_reference == "TAC-DEC-2026-018").first()
        if not dec_tac:
            db.add(CommitteeDecision(
                meeting_id=meeting_tac.id,
                committee_id=tac.id,
                project_id=sample_proj_id,
                decision_reference="TAC-DEC-2026-018",
                subject="Technical Sanction Clearance for 185m Linear Waterway Bridge",
                decision_type="APPROVED",
                decision_text="Technical Audit Committee clears hydraulic and structural design for bridge reconstruction on ODR-045. Pier foundation depth approved at 24.5m below bed level.",
                statutory_condition="Cross-hole sonic logging mandatory on 100% of cast-in-situ bored piles.",
                government_order_ref="Circular Memo No. 13555/Contracts-1/2009",
                verification_status="Verified"
            ))
            db.commit()

    if exp16b:
        meeting_exp = db.query(CommitteeMeeting).filter(CommitteeMeeting.meeting_reference == "EXP16B-MTG-2026-012").first()
        if not meeting_exp:
            meeting_exp = CommitteeMeeting(
                committee_id=exp16b.id,
                meeting_reference="EXP16B-MTG-2026-012",
                meeting_date=datetime.datetime(2026, 4, 18, 15, 0),
                venue="Chamber of Joint Director, Directorate of Highways, Chennai",
                chairperson_name="Joint Director (O/o DG Highways)",
                agenda_summary="Statutory evaluation of quantity variation exceeding 25% for structural steel and bituminous concrete in Tambaram Elevated Corridor.",
                minutes_summary="Committee verified field measurements against geotechnical redesign necessitated by Railway boundary clearances. Variation found unavoidable and technically justified.",
                verification_status="Verified"
            )
            db.add(meeting_exp)
            db.commit()
            db.refresh(meeting_exp)

        dec_exp = db.query(CommitteeDecision).filter(CommitteeDecision.decision_reference == "EXP16B-DEC-2026-009").first()
        if not dec_exp:
            db.add(CommitteeDecision(
                meeting_id=meeting_exp.id,
                committee_id=exp16b.id,
                project_id=sample_proj_id,
                decision_reference="EXP16B-DEC-2026-009",
                subject="Recommendation for Entrustment of 28.38% Additional Steel Quantities",
                decision_type="RECOMMENDED",
                decision_text="Section 16(b) Expert Committee recommends entrustment of +28.38% structural steel to the working contractor at agreed schedule rates without fresh tender call under G.O. Ms. No. 05.",
                statutory_condition="Supplemental Agreement to be executed within 14 days with updated completion milestone.",
                government_order_ref="G.O. Ms. No. 05 / Section 16(b) TNTIT Act",
                verification_status="Verified"
            ))
            db.commit()

    # 8. STATUTORY REFERRALS
    referrals_specs = [
        {
            "proj_id": 1,
            "code": "COT",
            "type": "TENDER_EXCESS",
            "val": 8.40,
            "limit": 6.00,
            "reason": "Lowest bid received has +8.40% excess over estimated rate, exceeding Chief Engineer delegated acceptance threshold of 6.00% under G.O. Ms. No. 75.",
            "rule": "G.O. Ms. No. 75, Highways & Minor Ports, dated 02.09.2026",
            "status": "SCRUTINIZED",
            "officer": "Er. S. Palanivel, CE (H) C&M Chennai"
        },
        {
            "proj_id": 3,
            "code": "TAC",
            "type": "WATERWAY_LINEAR_LENGTH",
            "val": 185.0,
            "limit": 150.0,
            "reason": "Bridge linear waterway measures 185.0 meters, exceeding 150m threshold mandated for independent TAC structural audit before according Technical Sanction.",
            "rule": "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009",
            "status": "SANCTIONED",
            "officer": "Er. S. Yamini, CE (H) Planning Designs & Investigation"
        },
        {
            "proj_id": 2,
            "code": "EXPERT_16B",
            "type": "QUANTITY_VARIATION_25PCT",
            "val": 28.38,
            "limit": 25.0,
            "reason": "Structural steel girder reinforcement quantity increased by 28.38% over agreement schedule due to redesigned railway span footing, requiring statutory Expert Committee clearance under Section 16(b) TNTIT Act.",
            "rule": "G.O. Ms. No. 05 dated 13.01.2026 / Section 16(b) TNTIT Act",
            "status": "PENDING_SCRUTINY",
            "officer": "Er. M. Rajendran, SE (H) Chengalpattu Circle"
        }
    ]

    for ref in referrals_specs:
        existing_ref = db.query(StatutoryReferral).filter(
            StatutoryReferral.project_id == ref["proj_id"],
            StatutoryReferral.committee_code == ref["code"],
            StatutoryReferral.referral_type == ref["type"]
        ).first()
        if not existing_ref:
            db.add(StatutoryReferral(
                project_id=ref["proj_id"],
                committee_code=ref["code"],
                referral_type=ref["type"],
                trigger_value=ref["val"],
                threshold_limit=ref["limit"],
                referral_reason=ref["reason"],
                statutory_rule_citation=ref["rule"],
                status=ref["status"],
                responsible_officer=ref["officer"]
            ))
    db.commit()

    # 9. AI INTELLIGENCE FINDINGS (WITH HUMAN VALIDATION WORKFLOW)
    findings_specs = [
        {
            "type": "TENDER_ANOMALY",
            "entity": "PROJECT",
            "entity_id": 1,
            "headline": "Tender Bid Excess (+8.40%) without Prior COT Sanction on SH-49 ECR Widening",
            "evidence": "Financial bid tabulation shows L1 bidder at ₹124.80 Cr against Sanctioned Estimate of ₹115.12 Cr (+8.40% excess). Rule threshold for CE acceptance is 6.00% under G.O. Ms. No. 75.",
            "explanation": "Under G.O. Ms. No. 75, any excess exceeding 6% on works up to ₹1.00 Cr and all excess above 0% on works > ₹6.00 Cr cannot be accepted by the Chief Engineer and must be referred to the Commissionerate of Tenders.",
            "confidence": "HIGH",
            "status": "CONFIRMED_VALID",
            "action": "Submit formal tender scrutiny memorandum to Commissionerate of Tenders (COT) with justified SSR lead differential before issuing Letter of Acceptance.",
            "citation": "G.O. Ms. No. 75, Highways & Minor Ports, dated 02.09.2026"
        },
        {
            "type": "QUANTITY_VARIATION_EXCESS",
            "entity": "PROJECT",
            "entity_id": 2,
            "headline": "Quantity Overrun (28.38%) on Tambaram Elevated Corridor Exceeds 25% Section 16(b) Limit",
            "evidence": "Running Account Bill No. 14 records 3,420 MT structural steel against agreement quantity of 2,664 MT (+28.38% increase). Cost variance is ₹6.82 Cr.",
            "explanation": "Under Section 16(b) of the Tamil Nadu Transparency in Tenders Act, variations exceeding 25% of agreement quantities cannot be entrusted to the original contractor without statutory clearance by the 3-Member Expert Committee constituted under G.O. Ms. No. 05.",
            "confidence": "HIGH",
            "status": "PENDING_HUMAN_REVIEW",
            "action": "Halt payment on excess quantities beyond 125% and refer revised BOQ to the Section 16(b) Expert Committee chaired by Joint Director, O/o DG Highways.",
            "citation": "G.O. Ms. No. 05 dated 13.01.2026 / Section 16(b) TNTIT Act"
        },
        {
            "type": "COMMITTEE_REFERRAL_REQUIRED",
            "entity": "PROJECT",
            "entity_id": 3,
            "headline": "Linear Waterway (185m) Exceeds 150m Mandatory Technical Audit Committee (TAC) Threshold",
            "evidence": "Hydraulic design report submitted by PDI wing shows total effective waterway opening of 185.0 meters across Thiruporur Hub backwaters. Technical Sanction was accorded without TAC reference number.",
            "explanation": "Departmental circular instructions strictly prohibit according Technical Sanction for bridges with linear waterway exceeding 150m without prior technical audit and clearance by TAC.",
            "confidence": "HIGH",
            "status": "CONFIRMED_VALID",
            "action": "Place bridge structural and hydraulic model before next TAC state-level sitting for ex-post facto ratification and foundation scour safety validation.",
            "citation": "Circular Memo No. 13555/Contracts-1/2009 dated 02.05.2009"
        },
        {
            "type": "REVISED_ESTIMATE_RISK",
            "entity": "PROJECT",
            "entity_id": 1,
            "headline": "Land Acquisition Solatium Escalation Triggers RASC-LA Jurisdiction",
            "evidence": "Enhanced compensation award by Special DRO (LA) under RFCTLARR Act 2013 totals ₹18.40 Cr against initial AS provision of ₹11.20 Cr (+64.2% increase).",
            "explanation": "Revisions exceeding 10% of sanctioned LA provisions require formal examination and recommendation by the Revised Administrative Sanction Committee for Land Acquisition (RASC-LA).",
            "confidence": "HIGH",
            "status": "PENDING_HUMAN_REVIEW",
            "action": "Prepare detailed comparison statement of guideline value vs court award and submit to Commissioner of Land Acquisition / RASC-LA.",
            "citation": "G.O. Ms. No. 163, Highways and Minor Ports (HN1), dated 13.12.2023"
        }
    ]

    for f in findings_specs:
        existing_f = db.query(AIIntelligenceFinding).filter(
            AIIntelligenceFinding.headline == f["headline"]
        ).first()
        if not existing_f:
            db.add(AIIntelligenceFinding(
                finding_type=f["type"],
                entity_type=f["entity"],
                entity_id=f["entity_id"],
                headline=f["headline"],
                evidence_summary=f["evidence"],
                explanation=f["explanation"],
                confidence=f["confidence"],
                human_validation_status=f["status"],
                recommended_action=f["action"],
                statutory_rule_citation=f["citation"]
            ))
    db.commit()

    print("Official Tamil Nadu organisation, service cadre, and verified leadership seeding complete.")

    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_official_verification()
