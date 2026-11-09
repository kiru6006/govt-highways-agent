"""
Seed script for 30 Mock Government Verification Personas across 7 categories.
Provides reproducible test credentials for comprehensive role-based verification.
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.auth import get_password_hash
from app.models import Role, User, Department, Zone, Circle, Division, Contractor, Organisation

PERSONA_SPECS = [
    # A. Administrative & Cabinet Leadership
    {"username": "cm", "full_name": "Thiru C. Joseph Vijay", "role_code": "CHIEF_MINISTER", "role_name": "Hon'ble Chief Minister of Tamil Nadu", "tier": "CABINET_APEX", "dept": "HIGHWAYS"},
    {"username": "minister", "full_name": "Thiru Aadhav Arjuna", "role_code": "MINISTER", "role_name": "Minister for Public Works & Highways", "tier": "LEADERSHIP", "dept": "HIGHWAYS"},
    {"username": "secretary", "full_name": "Thiru Shunchonngam Jatak Chiru, IAS", "role_code": "PRIN_SEC", "role_name": "Principal Secretary to Government", "tier": "LEADERSHIP", "dept": "HIGHWAYS"},
    {"username": "dir_gen", "full_name": "Er. V. Senthil Nathan", "role_code": "DIR_GEN", "role_name": "Director General (Highways)", "tier": "EXECUTIVE", "dept": "HIGHWAYS"},
    {"username": "admin", "full_name": "Thiru K. Ramanathan", "role_code": "ADMIN", "role_name": "Department Administrator", "tier": "SYSTEM", "dept": "HIGHWAYS"},

    # B. Engineering
    {"username": "chief_eng", "full_name": "Er. S. Palanivel", "role_code": "CHIEF_ENG", "role_name": "Chief Engineer (Highways - Projects)", "tier": "EXECUTIVE", "dept": "HIGHWAYS"},
    {"username": "se_chengalpattu", "full_name": "Er. M. Rajendran", "role_code": "SE_CIRCLE", "role_name": "Superintending Engineer (Circle)", "tier": "FIELD_MANAGEMENT", "dept": "HIGHWAYS", "zone_code": "ZN-CHE", "circle_code": "CIR-CGL"},
    {"username": "ee_tambaram", "full_name": "Er. P. Anandhan", "role_code": "EE_DIV", "role_name": "Divisional Engineer (Division)", "tier": "FIELD_MANAGEMENT", "dept": "HIGHWAYS", "zone_code": "ZN-CHE", "circle_code": "CIR-CGL", "div_code": "DIV-TAM"},
    {"username": "ae_saidapet", "full_name": "Er. K. Murugan", "role_code": "ASST_ENG", "role_name": "Assistant Engineer (Saidapet)", "tier": "OPERATIONAL", "dept": "HIGHWAYS", "zone_code": "ZN-CHE", "circle_code": "CIR-CGL", "div_code": "DIV-TAM"},
    {"username": "plan_eng", "full_name": "Er. S. Mythili", "role_code": "PLAN_ENG", "role_name": "Planning Engineer (State Planning Cell)", "tier": "EXECUTIVE", "dept": "HIGHWAYS"},
    {"username": "design_eng", "full_name": "Er. R. Vijayakumar", "role_code": "DESIGN_ENG", "role_name": "Design Engineer (Central Design Circle)", "tier": "EXECUTIVE", "dept": "HIGHWAYS"},
    {"username": "qc_hrs_eng", "full_name": "Er. T. Soundararajan", "role_code": "QC_ENGINEER", "role_name": "Quality Assurance Engineer (HRS Guindy)", "tier": "QUALITY", "dept": "HIGHWAYS"},
    {"username": "maint_eng", "full_name": "Er. N. Ganesan", "role_code": "MAINT_ENG", "role_name": "Maintenance Engineer (C&M Maintenance Wing)", "tier": "OPERATIONAL", "dept": "HIGHWAYS"},
    {"username": "gis_survey_eng", "full_name": "Er. D. Venkatesh", "role_code": "GIS_ENG", "role_name": "GIS / Survey Engineer (Geomatics Cell)", "tier": "OPERATIONAL", "dept": "HIGHWAYS"},

    # C. Programme and Project
    {"username": "ckicp_pd", "full_name": "Thiru A. Sridhar, IAS", "role_code": "CKICP_PD", "role_name": "CKICP Project Director (ADB Programme)", "tier": "LEADERSHIP", "dept": "HIGHWAYS"},
    {"username": "tnrsp_pd", "full_name": "Thiru M. Balamurugan, IAS", "role_code": "TNRSP_PD", "role_name": "TNRSP-II Project Director (World Bank Programme)", "tier": "LEADERSHIP", "dept": "HIGHWAYS"},
    {"username": "pmc_consultant", "full_name": "Er. G. Raghavan", "role_code": "PMC_CONSULTANT", "role_name": "Project Management Consultant (Feedback Infra)", "tier": "EXTERNAL", "dept": "HIGHWAYS"},
    {"username": "contractor_lt", "full_name": "V. Ramakrishnan", "role_code": "CONTRACTOR", "role_name": "Contractor Project Director (L&T Infrastructure)", "tier": "EXTERNAL", "dept": "HIGHWAYS"},
    {"username": "contractor_pst", "full_name": "T. Shanmugam", "role_code": "CONTRACTOR", "role_name": "Contractor Project Director (PST Engineering)", "tier": "EXTERNAL", "dept": "HIGHWAYS"},
    {"username": "procurement_officer", "full_name": "Er. J. Daniel", "role_code": "PROC_OFFICER", "role_name": "Tender & Procurement Officer", "tier": "FINANCIAL", "dept": "HIGHWAYS"},

    # D. Finance
    {"username": "finance_controller", "full_name": "Tmt. S. Uma Maheshwari", "role_code": "FIN_CONTROLLER", "role_name": "Financial Controller (State Highways)", "tier": "FINANCIAL", "dept": "HIGHWAYS"},
    {"username": "accounts_officer", "full_name": "Thiru R. Nagarajan", "role_code": "ACCOUNTS_OFFICER", "role_name": "Accounts Officer (Bills & Letter of Credit)", "tier": "FINANCIAL", "dept": "HIGHWAYS"},
    {"username": "internal_auditor", "full_name": "Thiru P. Shanmugasundaram", "role_code": "INTERNAL_AUDITOR", "role_name": "Internal Concurrent Auditor", "tier": "FINANCIAL", "dept": "HIGHWAYS"},

    # E. External Dependencies
    {"username": "la_officer", "full_name": "Thiru K. Baskaran", "role_code": "LA_OFFICER", "role_name": "Land Acquisition Officer (DRO)", "tier": "EXTERNAL", "dept": "REVENUE"},
    {"username": "revenue_officer", "full_name": "Tmt. N. Revathi", "role_code": "REVENUE_OFFICER", "role_name": "Revenue Divisional Officer (RDO)", "tier": "EXTERNAL", "dept": "REVENUE"},
    {"username": "utility_officer", "full_name": "Er. K. Saravanan", "role_code": "UTILITY_OFFICER", "role_name": "Utility Nodal Officer (TANGEDCO/TWAD)", "tier": "EXTERNAL", "dept": "TANGEDCO"},
    {"username": "forest_officer", "full_name": "Thiru V. Sundar", "role_code": "FOREST_OFFICER", "role_name": "District Forest Officer (DFO Wildlife/Env)", "tier": "EXTERNAL", "dept": "FOREST"},

    # F. Legal and Citizen Services
    {"username": "legal_officer", "full_name": "Adv. S. Duraisamy", "role_code": "LEGAL_OFFICER", "role_name": "Special Government Pleader (Highways)", "tier": "COMPLIANCE", "dept": "HIGHWAYS"},
    {"username": "citizen_officer", "full_name": "Tmt. M. Geetha", "role_code": "CITIZEN_OFFICER", "role_name": "Citizen Grievance Redressal Officer", "tier": "CITIZEN", "dept": "HIGHWAYS"},
    {"username": "field_inspector", "full_name": "Er. C. Velmurugan", "role_code": "FIELD_INSPECTOR", "role_name": "Field & Road Safety Inspector", "tier": "FIELD_MANAGEMENT", "dept": "HIGHWAYS"},

    # G. Technology and Governance
    {"username": "it_sec_admin", "full_name": "Thiru A. Vignesh", "role_code": "IT_SEC_ADMIN", "role_name": "IT & Information Security Administrator", "tier": "SYSTEM", "dept": "HIGHWAYS"},
    {"username": "ai_gov_auditor", "full_name": "Dr. K. Radhakrishnan", "role_code": "AI_GOV_AUDITOR", "role_name": "AI Governance & Data Provenance Auditor", "tier": "SYSTEM", "dept": "HIGHWAYS"},
]

def seed_mock_personas(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        common_password = get_password_hash("highway123")
        admin_password = get_password_hash("admin123")

        dept_cache = {d.code: d for d in db.query(Department).all()}
        zone_cache = {z.code: z for z in db.query(Zone).all()}
        circle_cache = {c.code: c for c in db.query(Circle).all()}
        div_cache = {div.code: div for div in db.query(Division).all()}
        role_cache = {r.code: r for r in db.query(Role).all()}
        contractor_lt = db.query(Contractor).first()

        for spec in PERSONA_SPECS:
            role_code = spec["role_code"]
            if role_code not in role_cache:
                new_role = Role(code=role_code, name=spec["role_name"], tier=spec["tier"])
                db.add(new_role)
                db.commit()
                db.refresh(new_role)
                role_cache[role_code] = new_role

            user = db.query(User).filter(User.username == spec["username"]).first()
            dept_obj = dept_cache.get(spec["dept"])
            zone_obj = zone_cache.get(spec.get("zone_code"))
            circle_obj = circle_cache.get(spec.get("circle_code"))
            div_obj = div_cache.get(spec.get("div_code"))

            if not user:
                pwd = admin_password if spec["username"] in ("admin", "it_sec_admin") else common_password
                user = User(
                    username=spec["username"],
                    email=f"{spec['username']}@tn.gov.in" if "contractor" not in spec["username"] else f"{spec['username']}@company.com",
                    hashed_password=pwd,
                    full_name=f"{spec['full_name']} [TEST]",
                    phone="+91-9444009999",
                    is_active=True,
                    role_id=role_cache[role_code].id,
                    department_id=dept_obj.id if dept_obj else None,
                    zone_id=zone_obj.id if zone_obj else None,
                    circle_id=circle_obj.id if circle_obj else None,
                    division_id=div_obj.id if div_obj else None,
                    contractor_id=contractor_lt.id if "contractor" in spec["username"] and contractor_lt else None,
                    created_at=datetime.datetime.utcnow()
                )
                db.add(user)
                db.commit()
            else:
                user.role_id = role_cache[role_code].id
                if dept_obj:
                    user.department_id = dept_obj.id
                db.commit()

        print(f"Successfully verified/seeded {len(PERSONA_SPECS)} test personas in TN-HDOS.")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_mock_personas()

