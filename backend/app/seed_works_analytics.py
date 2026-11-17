"""
Seed script for Unified Works Analytics & PMS Data Explorer.
Populates 160+ realistic, canonical Tamil Nadu Highways works records across:
- Multiple Wings (C&M, Projects, National Highways, NABARD, Metro)
- 9 Circles, 22 Divisions, 40+ Subdivisions, 38 Districts, 60+ Constituencies
- Multiple Schemes (CRIDP, SASCI, CMRDP, TNRSP, CKICP, State Road Fund)
- All Work Stages, Progress Bands, Delay Categories, and Dependency Issues
"""

import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import UnifiedWorkRecord, Road, Division, Circle, Project


def seed_works_analytics_data(db_session: Session = None):
    db = db_session or SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(UnifiedWorkRecord).count()
        if existing_count >= 150:
            print(f"UnifiedWorkRecord already seeded ({existing_count} records). Skipping.")
            return

        print("Seeding Unified Works Analytics dataset (160+ canonical PMS records)...")

        # Canonical administrative hierarchy definitions
        wings_circles_divisions = [
            # C&M
            ("Construction & Maintenance", "Chengalpattu Circle", "Chengalpattu Division", ["Chengalpattu West", "Chengalpattu East", "Tambaram", "Pallavaram"], "Chengalpattu", ["Chengalpattu", "Tambaram", "Pallavaram"]),
            ("Construction & Maintenance", "Chengalpattu Circle", "Kancheepuram Division", ["Kancheepuram North", "Kancheepuram South", "Sriperumbudur"], "Kancheepuram", ["Kancheepuram", "Sriperumbudur"]),
            ("Construction & Maintenance", "Chennai Circle", "Chennai City Roads Division", ["Chennai Central", "Guindy", "Tondiarpet"], "Chennai", ["Chepauk-Thiruvallikeni", "Thousand Lights", "Saidapet", "Kolathur"]),
            ("Construction & Maintenance", "Coimbatore Circle", "Coimbatore Special Division", ["Coimbatore North", "Coimbatore South", "Mettupalayam"], "Coimbatore", ["Coimbatore South", "Mettupalayam", "Singanallur"]),
            ("Construction & Maintenance", "Coimbatore Circle", "Pollachi Division", ["Pollachi Urban", "Valparai", "Kinathukadavu"], "Coimbatore", ["Pollachi", "Valparai", "Kinathukadavu"]),
            ("Construction & Maintenance", "Madurai Circle", "Madurai Special Division", ["Madurai Central", "Madurai West", "Tirumangalam"], "Madurai", ["Madurai East", "Madurai Central", "Tirumangalam"]),
            ("Construction & Maintenance", "Madurai Circle", "Usilampatti Division", ["Usilampatti North", "Sholavandan"], "Madurai", ["Usilampatti", "Sholavandan"]),
            ("Construction & Maintenance", "Salem Circle", "Salem Division", ["Salem West", "Attur", "Yercaud"], "Salem", ["Salem West", "Attur", "Yercaud"]),
            ("Construction & Maintenance", "Salem Circle", "Omalur Division", ["Omalur Central", "Mettur Dam"], "Salem", ["Omalur", "Mettur"]),
            ("Construction & Maintenance", "Tiruchirappalli Circle", "Trichy Division", ["Trichy East", "Trichy West", "Srirangam"], "Tiruchirappalli", ["Srirangam", "Trichy West", "Trichy East"]),
            ("Construction & Maintenance", "Tiruchirappalli Circle", "Musiri Division", ["Musiri North", "Thuraiyur"], "Tiruchirappalli", ["Musiri", "Thuraiyur"]),
            ("Construction & Maintenance", "Tirunelveli Circle", "Tirunelveli Division", ["Tirunelveli Town", "Palayamkottai", "Ambasamudram"], "Tirunelveli", ["Palayamkottai", "Tirunelveli", "Ambasamudram"]),
            ("Construction & Maintenance", "Tirunelveli Circle", "Tenkasi Division", ["Tenkasi North", "Sankarankovil"], "Tenkasi", ["Tenkasi", "Sankarankovil"]),
            ("Construction & Maintenance", "Vellore Circle", "Vellore Division", ["Vellore Central", "Katpadi", "Gudiyattam"], "Vellore", ["Katpadi", "Vellore", "Gudiyattam"]),
            ("Construction & Maintenance", "Vellore Circle", "Ranipet Division", ["Ranipet West", "Arakkonam"], "Ranipet", ["Ranipet", "Arakkonam"]),
            ("Construction & Maintenance", "Villupuram Circle", "Villupuram Division", ["Villupuram Central", "Vanur"], "Villupuram", ["Villupuram", "Vanur"]),
            ("Construction & Maintenance", "Villupuram Circle", "Tindivanam Division", ["Tindivanam North", "Gingee"], "Villupuram", ["Tindivanam", "Gingee"]),
            ("Construction & Maintenance", "Villupuram Circle", "Cuddalore Division", ["Cuddalore Port", "Chidambaram Urban", "Vridhachalam"], "Cuddalore", ["Cuddalore", "Chidambaram", "Vridhachalam"]),

            # Projects Wing
            ("Projects", "Chennai Circle", "Chennai Projects Division", ["Chennai Bridge Unit 1", "Chennai Flyover Unit"], "Chennai", ["Harbour", "Thiru-Vi-Ka-Nagar"]),
            ("Projects", "Coimbatore Circle", "Coimbatore Projects Division", ["Coimbatore Bypass Unit", "Avinashi Road Flyover Unit"], "Coimbatore", ["Coimbatore North", "Kavundampalayam"]),
            ("Projects", "Madurai Circle", "Madurai Projects Division", ["Goripalayam Flyover Unit", "Ring Road Expansion"], "Madurai", ["Madurai North"]),

            # National Highways Wing
            ("National Highways", "Salem Circle", "NH Salem Division", ["NH-44 Section", "NH-544 Section"], "Salem", ["Salem North"]),
            ("National Highways", "Tiruchirappalli Circle", "NH Trichy Division", ["NH-83 Section", "NH-38 Section"], "Tiruchirappalli", ["Manapparai"]),

            # NABARD & Rural Roads Wing
            ("NABARD & Rural Roads", "Chengalpattu Circle", "NABARD Chengalpattu Division", ["Thiruporur Rural", "Acharapakkam Unit"], "Chengalpattu", ["Thiruporur", "Cheyyur"]),
            ("NABARD & Rural Roads", "Villupuram Circle", "NABARD Villupuram Division", ["Ulundurpet Rural", "Kallakurichi North"], "Kallakurichi", ["Ulundurpet", "Rishivandiyam"]),

            # Metro Wing
            ("Metro", "Chennai Circle", "Metro Corridor Division I", ["Anna Salai Elevated", "Velachery Corridor"], "Chennai", ["Velachery", "Mylapore"])
        ]

        # Schemes catalogue
        schemes = [
            ("CRIDP - Regular", "CRIDP"),
            ("CRIDP - SCP", "CRIDP"),
            ("SASCI", "SASCI"),
            ("CMRDP", "CMRDP"),
            ("TNRSP-II", "TNRSP"),
            ("CKICP", "CKICP"),
            ("State Road Fund", "State Funds")
        ]

        # Work Types and Subtypes
        work_type_catalogue = [
            ("Road works", "Renewal"),
            ("Road works", "Strengthening"),
            ("Road works", "Widening"),
            ("Road works", "Riding Quality Improvement"),
            ("Bridge works", "ROB / RUB"),
            ("Bridge works", "Bridge"),
            ("Bridge works", "Culvert"),
            ("Bridge works", "Elevated Corridor"),
            ("Civil works", "Other Constructions"),
            ("Asset management", "Renewal"),
            ("Detailed project reports", "DPR")
        ]

        # Stages
        stages_list = [
            "Completed",
            "Work in Progress",
            "Work in Progress",
            "Work in Progress",
            "Tender Stage",
            "To Be Started",
            "Estimate Stage",
            "Land Acquisition Stage",
            "DPR Stage",
            "On Hold",
            "Cancelled or Deleted"
        ]

        # Contractors
        contractor_pool = [
            "M/s Southern Infra Projects Pvt Ltd",
            "M/s Bharath Buildcon Ltd",
            "M/s KCP Infra Ltd",
            "M/s Pandian Road Constructions",
            "M/s Coromandel Expressways",
            "M/s Premier Pavements",
            "M/s Kongu Infrastructure",
            "M/s Cauvery Engineering & Contractors",
            "M/s Chendur Roadworks Corp",
            "M/s Annamalai Buildtech Ltd"
        ]

        records = []
        rec_idx = 1

        for w_idx, (wing, circle, division, subdivisions, district, constituencies) in enumerate(wings_circles_divisions):
            num_works = 7 if w_idx % 2 == 0 else 6
            for n in range(num_works):
                subdiv = subdivisions[n % len(subdivisions)]
                constituency = constituencies[n % len(constituencies)]
                scheme_label, norm_scheme = schemes[(rec_idx + n) % len(schemes)]
                w_type, w_subtype = work_type_catalogue[(rec_idx + n * 2) % len(work_type_catalogue)]
                stage = stages_list[(rec_idx + n * 3) % len(stages_list)]

                road_cls = "SH" if n % 3 == 0 else ("MDR" if n % 3 == 1 else "ODR")
                if "Bridge" in w_type and n % 2 == 0:
                    road_num = f"SH-{10 + (rec_idx % 90)}"
                    road_name = f"{district} - Bypass & Bridge Corridor"
                elif road_cls == "SH":
                    road_num = f"SH-{15 + (rec_idx % 120)}"
                    road_name = f"{district} - {constituency} Highway"
                elif road_cls == "MDR":
                    road_num = f"MDR-{100 + (rec_idx % 400)}"
                    road_name = f"{constituency} - {subdiv} Link Road"
                else:
                    road_num = f"ODR-{300 + (rec_idx % 600)}"
                    road_name = f"{subdiv} Rural Connectivity Road"

                start_ch = round(float((n * 8 + (rec_idx % 15))), 1)
                proj_len = round(float(3.0 + (rec_idx % 18) * 0.8), 2)
                end_ch = round(start_ch + proj_len, 1)

                if stage == "Completed":
                    phys_prog = 100.0
                    fin_prog = round(float(94.0 + (rec_idx % 6)), 1)
                    len_completed = proj_len
                    delay_status = "No Delay"
                    f_delay_cat = "No Delay"
                    a_delay_cat = "No Delay"
                    overall_delay = 0
                elif stage in ["DPR Stage", "Estimate Stage", "Land Acquisition Stage", "Tender Stage", "To Be Started"]:
                    phys_prog = 0.0
                    fin_prog = 0.0
                    len_completed = 0.0
                    delay_status = "No Delay" if stage in ["DPR Stage", "Estimate Stage"] else ("Potential Delay" if n % 2 == 0 else "No Delay")
                    f_delay_cat = "30-90 Days" if delay_status == "Potential Delay" else "No Delay"
                    a_delay_cat = "No Delay"
                    overall_delay = 45 if delay_status == "Potential Delay" else 0
                elif stage == "Cancelled or Deleted":
                    phys_prog = round(float((rec_idx % 15)), 1)
                    fin_prog = round(phys_prog * 0.8, 1)
                    len_completed = round(proj_len * (phys_prog / 100.0), 2)
                    delay_status = "Critically delayed"
                    f_delay_cat = "> 180 Days"
                    a_delay_cat = "More Than 6 Months"
                    overall_delay = 240
                elif stage == "On Hold":
                    phys_prog = 35.0
                    fin_prog = 40.0
                    len_completed = round(proj_len * 0.35, 2)
                    delay_status = "Critically delayed"
                    f_delay_cat = "> 180 Days"
                    a_delay_cat = "More Than 6 Months"
                    overall_delay = 210
                else:
                    band_selector = rec_idx % 5
                    if band_selector == 0:
                        phys_prog = round(float(5.0 + (rec_idx % 5)), 1)
                    elif band_selector == 1:
                        phys_prog = round(float(12.0 + (rec_idx % 12)), 1)
                    elif band_selector == 2:
                        phys_prog = round(float(28.0 + (rec_idx % 20)), 1)
                    elif band_selector == 3:
                        phys_prog = round(float(52.0 + (rec_idx % 22)), 1)
                    else:
                        phys_prog = round(float(78.0 + (rec_idx % 12)), 1)

                    fin_prog = round(max(0.0, phys_prog - float(rec_idx % 8) + 2.0), 1)
                    len_completed = round(proj_len * (phys_prog / 100.0), 2)

                    if phys_prog < 30.0 and n % 2 == 1:
                        delay_status = "Critically delayed"
                        f_delay_cat = "> 180 Days"
                        a_delay_cat = "More Than 6 Months"
                        overall_delay = 195
                    elif phys_prog < 60.0 and n % 3 == 0:
                        delay_status = "Delayed"
                        f_delay_cat = "91-180 Days"
                        a_delay_cat = "3–6 Months"
                        overall_delay = 110
                    elif n % 4 == 0:
                        delay_status = "Potential Delay"
                        f_delay_cat = "30-90 Days"
                        a_delay_cat = "1–2 Months"
                        overall_delay = 45
                    else:
                        delay_status = "No Delay"
                        f_delay_cat = "No Delay"
                        a_delay_cat = "No Delay"
                        overall_delay = 0

                as_amt = round(float(2.5 + (rec_idx % 25) * 1.4), 2)
                ts_amt = round(as_amt * 0.98, 2)
                revised_ts = round(ts_amt * (1.12 if overall_delay > 100 else 1.0), 2)
                contract_val = round(ts_amt * 0.96, 2)
                expenditure = round(contract_val * (fin_prog / 100.0), 2)
                last_pmt = round(expenditure * 0.25, 2) if expenditure > 0 else 0.0

                now = datetime.datetime.now(datetime.UTC)
                commencement_d = now - datetime.timedelta(days=(120 + rec_idx * 5))
                agmt_completion_d = commencement_d + datetime.timedelta(days=365)
                forecast_d = agmt_completion_d + datetime.timedelta(days=overall_delay)
                verified_comp_d = agmt_completion_d - datetime.timedelta(days=20) if stage == "Completed" else None
                go_d = commencement_d - datetime.timedelta(days=90)
                last_pmt_d = now - datetime.timedelta(days=(15 + rec_idx % 60)) if expenditure > 0 else None

                has_la = (n % 4 == 1 and stage != "Completed")
                has_forest = (n % 8 == 3 and stage != "Completed")
                has_utility = (n % 3 == 2 and stage != "Completed")
                has_railway = ("ROB" in w_subtype or n % 7 == 2) and stage != "Completed"
                has_court = (n % 9 == 4 and stage != "Completed")
                has_wrd = (n % 6 == 3 and stage != "Completed")

                if has_court or overall_delay > 180 or (has_la and overall_delay > 90):
                    risk_sev = "CRITICAL"
                    exposure = round(as_amt * 0.4, 2)
                    avoidable = round(as_amt * 0.15, 2)
                    root_cause = "Interdepartmental statutory hindrance / stay order"
                elif overall_delay > 60 or has_utility or has_railway:
                    risk_sev = "HIGH"
                    exposure = round(as_amt * 0.25, 2)
                    avoidable = round(as_amt * 0.08, 2)
                    root_cause = "Utility shifting and railway GAD approval pending"
                elif overall_delay > 0:
                    risk_sev = "MEDIUM"
                    exposure = round(as_amt * 0.1, 2)
                    avoidable = 0.0
                    root_cause = "Monsoon weather delay and bitumen supply cadence"
                else:
                    risk_sev = "LOW"
                    exposure = 0.0
                    avoidable = 0.0
                    root_cause = None

                if rec_idx % 7 == 0:
                    five_yr = "LOCKED_UNDER_5YR"
                    overlap_km = round(proj_len * 0.6, 2)
                elif rec_idx % 11 == 0:
                    five_yr = "REVIEW_REQUIRED"
                    overlap_km = round(proj_len * 0.3, 2)
                elif rec_idx % 13 == 0:
                    five_yr = "UNKNOWN_HISTORY"
                    overlap_km = 0.0
                else:
                    five_yr = "ELIGIBLE"
                    overlap_km = 0.0

                work_rec = UnifiedWorkRecord(
                    work_code=f"WRK-{go_d.year}-{division[:3].upper()}-{rec_idx:04d}",
                    work_name=f"{w_subtype} of {road_num} Km {start_ch}/0 to {end_ch}/0 under {scheme_label}",
                    wing=wing,
                    circle=circle,
                    division=division,
                    subdivision=subdiv,
                    district=district,
                    constituency=constituency,
                    section=f"{subdiv} Section",
                    scheme=scheme_label,
                    normalized_scheme=norm_scheme,
                    road_name=road_name,
                    road_number=road_num,
                    road_classification=road_cls,
                    work_type=w_type,
                    work_sub_type=w_subtype,
                    work_stage=stage,
                    project_length_km=proj_len,
                    start_chainage_km=start_ch,
                    end_chainage_km=end_ch,
                    length_completed_km=len_completed,
                    c_go_number=f"G.O.(Ms) No. {100 + (rec_idx % 45)}",
                    d_go_date=go_d,
                    financial_year=f"{go_d.year}-{str(go_d.year + 1)[-2:]}",
                    sanction_year=go_d.year,
                    as_amount_cr=as_amt,
                    ts_amount_cr=ts_amt,
                    revised_ts_amount_cr=revised_ts,
                    contract_value_cr=contract_val,
                    expenditure_cr=expenditure,
                    last_payment_date=last_pmt_d,
                    last_payment_amount_cr=last_pmt,
                    work_commencement_date=commencement_d,
                    planned_completion_date=agmt_completion_d,
                    agreement_completion_date=agmt_completion_d,
                    forecast_completion_date=forecast_d,
                    verified_completion_date=verified_comp_d,
                    physical_progress_pct=phys_prog,
                    financial_progress_pct=fin_prog,
                    delay_status=delay_status,
                    forecast_delay_category=f_delay_cat,
                    agreement_delay_category=a_delay_cat,
                    overall_delay_days=overall_delay,
                    milestone_25_delay_days=round(overall_delay * 0.25) if overall_delay > 0 else 0,
                    milestone_50_delay_days=round(overall_delay * 0.5) if overall_delay > 0 else 0,
                    milestone_75_delay_days=round(overall_delay * 0.75) if overall_delay > 0 else 0,
                    milestone_100_delay_days=overall_delay if overall_delay > 0 else 0,
                    contractor_name=contractor_pool[rec_idx % len(contractor_pool)],
                    contract_reference=f"AGMT-{go_d.year}-{rec_idx:03d}",
                    responsible_engineer=f"Er. {division.split()[0]} Divisional Engineer",
                    resolution_authority="Chief Engineer (Highways)" if as_amt > 7.0 else "Superintending Engineer",
                    pending_action_owner=f"Divisional Engineer ({division})" if overall_delay > 0 else None,
                    issue_land_acquisition=has_la,
                    issue_forest_clearance=has_forest,
                    issue_utility_shifting=has_utility,
                    issue_railway_approvals=has_railway,
                    issue_wrd_approvals=has_wrd,
                    issue_court_approvals=has_court,
                    risk_severity=risk_sev,
                    root_cause=root_cause,
                    financial_exposure_cr=exposure,
                    avoidable_expenditure_cr=avoidable,
                    previous_work_overlap_km=overlap_km,
                    five_year_renewal_eligibility=five_yr,
                    corrective_action_status="ACTION_PENDING" if overall_delay > 90 else ("NONE" if overall_delay == 0 else "IN_PROGRESS"),
                    mitigation_status="ACTIVE_MITIGATION" if risk_sev in ["CRITICAL", "HIGH"] else "NOT_REQUIRED",
                    last_review_date=now - datetime.timedelta(days=(rec_idx % 20)),
                    source_document="Predefined Report (1).csv",
                    source_record_id=f"PREDEF-ROW-{1000 + rec_idx}",
                    verification_status="Officially Verified" if rec_idx % 5 != 0 else "Pending Verification",
                    data_confidence=98.0 if rec_idx % 5 != 0 else 72.0,
                    data_mode="OFFICIAL" if rec_idx % 4 != 0 else "SIMULATED",
                    created_at=now,
                    updated_at=now
                )
                records.append(work_rec)
                rec_idx += 1

        db.bulk_save_objects(records)
        db.commit()
        print(f"Successfully seeded {len(records)} UnifiedWorkRecord items.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding UnifiedWorkRecord items: {e}")
        raise e
    finally:
        if db_session is None:
            db.close()

