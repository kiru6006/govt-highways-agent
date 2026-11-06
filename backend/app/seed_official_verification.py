import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Role, Department, Official, ServiceCategory, Designation,
    HistoricalPosting, DelegationOfAuthority, StatutoryCommittee
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

    print("Official Tamil Nadu organisation, service cadre, and verified leadership seeding complete.")

    if close_on_exit:
        db.close()

if __name__ == "__main__":
    seed_official_verification()
