"""
Seed Authoritative Organisation Blueprint under G.O. (Ms) No. 43, dated 13.03.2026.
Parses exact C&M hierarchy from CM_Wing_Reorganisation_GO43_13-03-2026.xlsx:
- 4 C&M Zones / Regions
- 19 C&M Circles
- 68 C&M Divisions
- 285 C&M Subdivisions
- Total Road Length: 68,149.618 km
- 19 Historical Redesignations (Annexure-III)
- NH Branch (4 Circles, 11 Divisions, flagged PENDING_VERIFICATION)
- Data Quality & Mapping Exception records
- Backward-compatibility sync with legacy Zone, Circle, Division, Subdivision tables.
"""

import os
import re
import datetime
from typing import Dict, List, Any, Optional
import openpyxl
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import (
    OrganisationUnit,
    HistoricalOrganisationMapping,
    DataQualityMappingException,
    Zone, Circle, Division, Subdivision
)


def normalize_name(raw_name: str) -> str:
    """Normalizes raw bureaucratic strings into clean display names."""
    if not raw_name:
        return ""
    name = str(raw_name).strip()
    name = re.sub(r"Circle-\d+\s*:\s*", "", name, flags=re.I)
    name = re.sub(r"C&M,\s*", "", name, flags=re.I)
    name = re.sub(r"\(split from [^)]+\)", "", name, flags=re.I)
    name = re.sub(r"\(renamed from [^)]+\)", "", name, flags=re.I)
    name = re.sub(r"\(Sub-div \d+ renamed [^)]+\)", "", name, flags=re.I)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def seed_organisation_master_data(db_session: Optional[Session] = None):
    Base.metadata.create_all(bind=engine)
    db = db_session if db_session else SessionLocal()
    try:
        # Check if already seeded
        existing_units = db.query(OrganisationUnit).count()
        if existing_units >= 350:
            print(f"OrganisationUnit already seeded ({existing_units} units). Skipping.")
            return

        print("Seeding Master Organisation Blueprint under G.O. (Ms) No. 43...")

        # 1. Root: Department of Highways and Minor Ports
        root_dept = OrganisationUnit(
            id="ORG-DEPT-TN-HIGHWAYS",
            official_name="Highways and Minor Ports Department, Government of Tamil Nadu",
            display_name="Tamil Nadu Highways Department",
            unit_type="DEPARTMENT",
            parent_id=None,
            wing="All Wings",
            region="Statewide",
            verification_status="VERIFIED_GO_43",
            source_go="G.O. (Ms) No.43, Highways Dept, dated 13.03.2026",
            effective_from=datetime.date(2026, 6, 15),
            road_length_km=68149.618,
            status="Continuing"
        )
        db.merge(root_dept)

        # 2. Operational Wings
        wings_data = [
            {
                "id": "ORG-WING-CM",
                "official_name": "Construction & Maintenance (C&M) Wing",
                "display_name": "Construction & Maintenance",
                "wing": "Construction & Maintenance",
                "verification_status": "VERIFIED_GO_43",
                "road_length_km": 68149.618,
                "status": "Unified under G.O. 43 w.e.f. 15.06.2026"
            },
            {
                "id": "ORG-WING-NH",
                "official_name": "National Highways (NH) Wing",
                "display_name": "National Highways",
                "wing": "National Highways",
                "verification_status": "PENDING_VERIFICATION",
                "road_length_km": 5000.0,
                "status": "Pending statutory verification"
            },
            {
                "id": "ORG-WING-PRJ",
                "official_name": "Highways Projects Wing",
                "display_name": "Projects",
                "wing": "Projects",
                "verification_status": "VERIFIED_GO_43",
                "road_length_km": 0.0,
                "status": "Continuing for major bypasses & flyovers"
            },
            {
                "id": "ORG-WING-NABARD",
                "official_name": "NABARD and Rural Roads Wing (Historical / Transitioned)",
                "display_name": "NABARD & Rural Roads",
                "wing": "NABARD & Rural Roads",
                "verification_status": "HISTORICAL_MAPPED",
                "road_length_km": 0.0,
                "status": "Merged into C&M under G.O. 43"
            },
            {
                "id": "ORG-WING-METRO",
                "official_name": "Metro Wing (Chennai Perungar Valarchi Thittam)",
                "display_name": "Metro",
                "wing": "Metro",
                "verification_status": "HISTORICAL_MAPPED",
                "road_length_km": 0.0,
                "status": "Merged into C&M under G.O. 43"
            },
            {
                "id": "ORG-WING-TANSHA",
                "official_name": "Tamil Nadu State Highways Authority (TANSHA)",
                "display_name": "TANSHA",
                "wing": "TANSHA",
                "verification_status": "OFFICIALLY_VERIFIED",
                "road_length_km": 0.0,
                "status": "Established under TN Act No. 12 of 2024"
            }
        ]

        for w in wings_data:
            w_unit = OrganisationUnit(
                id=w["id"],
                official_name=w["official_name"],
                display_name=w["display_name"],
                unit_type="WING",
                parent_id="ORG-DEPT-TN-HIGHWAYS",
                wing=w["wing"],
                region="Statewide",
                verification_status=w["verification_status"],
                road_length_km=w["road_length_km"],
                status=w["status"],
                source_go="G.O. (Ms) No.43, Highways Dept, dated 13.03.2026",
                effective_from=datetime.date(2026, 6, 15)
            )
            db.merge(w_unit)
        db.commit()

        # 3. Parse G.O. 43 Workbook for C&M Hierarchy
        wb_path = os.path.join(os.path.dirname(__file__), "..", "data", "CM_Wing_Reorganisation_GO43_13-03-2026.xlsx")
        if not os.path.exists(wb_path):
            alt_path = "/Users/apple/Downloads/CM_Wing_Reorganisation_GO43_13-03-2026 (1).xlsx"
            if os.path.exists(alt_path):
                wb_path = alt_path

        wb = openpyxl.load_workbook(wb_path, data_only=True)

        zone_configs = [
            {"sheet": "Chennai Zone", "reg_id": "ORG-REG-CHE", "name": "Chennai Zone", "hq": "Chennai", "expected_circles": 5, "expected_divs": 18, "expected_subdivs": 74, "expected_len": 16674.964},
            {"sheet": "Trichy Zone", "reg_id": "ORG-REG-TRI", "name": "Trichy Zone", "hq": "Tiruchirappalli", "expected_circles": 4, "expected_divs": 14, "expected_subdivs": 58, "expected_len": 14129.934},
            {"sheet": "Madurai Zone", "reg_id": "ORG-REG-MDU", "name": "Madurai Zone", "hq": "Madurai", "expected_circles": 5, "expected_divs": 18, "expected_subdivs": 75, "expected_len": 18474.092},
            {"sheet": "Coimbatore Zone", "reg_id": "ORG-REG-CBE", "name": "Coimbatore Zone", "hq": "Coimbatore", "expected_circles": 5, "expected_divs": 18, "expected_subdivs": 78, "expected_len": 18870.628}
        ]

        total_cm_circles = 0
        total_cm_divs = 0
        total_cm_subdivs = 0
        total_cm_len = 0.0

        circle_counter = 0
        division_counter = 0
        subdiv_counter = 0

        # Also populate legacy Zone / Circle / Division / Subdivision for backward compatibility
        legacy_zone_map = {}

        for zc in zone_configs:
            sheet_name = zc["sheet"]
            sheet = wb[sheet_name]

            # Create Region Unit
            reg_unit = OrganisationUnit(
                id=zc["reg_id"],
                official_name=zc["name"],
                display_name=zc["name"],
                unit_type="REGION",
                parent_id="ORG-WING-CM",
                wing="Construction & Maintenance",
                region=zc["name"],
                road_length_km=zc["expected_len"],
                verification_status="VERIFIED_GO_43",
                source_go="G.O. (Ms) No.43, dated 13.03.2026",
                source_sheet=sheet_name,
                effective_from=datetime.date(2026, 6, 15),
                status="Authoritative C&M Region"
            )
            db.merge(reg_unit)
            db.commit()

            # Legacy Zone
            leg_zone = db.query(Zone).filter(Zone.name == zc["name"]).first()
            if not leg_zone:
                leg_zone = Zone(code=zc["reg_id"].replace("ORG-", ""), name=zc["name"], headquarters=zc["hq"])
                db.add(leg_zone)
                db.commit()
            legacy_zone_map[zc["name"]] = leg_zone

            cur_circle_unit: Optional[OrganisationUnit] = None
            cur_circle_name = ""
            cur_circle_disp = ""
            cur_leg_circle: Optional[Circle] = None

            cur_div_unit: Optional[OrganisationUnit] = None
            cur_div_name = ""
            cur_div_disp = ""
            cur_div_len = 0.0
            cur_leg_div: Optional[Division] = None

            parsed_circles_in_zone = set()
            parsed_divs_in_zone = {}
            subdiv_count_in_zone = 0

            for r in range(2, sheet.max_row + 1):
                c_val = sheet.cell(row=r, column=1).value
                d_val = sheet.cell(row=r, column=2).value
                len_val = sheet.cell(row=r, column=3).value
                sd_val = sheet.cell(row=r, column=4).value
                status_val = sheet.cell(row=r, column=5).value

                # Check if this row is total row
                if c_val and "Total" in str(c_val):
                    continue

                # New Circle in col 1
                if c_val:
                    cur_circle_name = str(c_val).strip()
                    cur_circle_disp = normalize_name(cur_circle_name)
                    if not cur_circle_disp.endswith("Circle"):
                        cur_circle_disp += " Circle"

                    circle_counter += 1
                    cir_id = f"ORG-CIR-{str(circle_counter).zfill(2)}"
                    parsed_circles_in_zone.add(cir_id)

                    cur_circle_unit = OrganisationUnit(
                        id=cir_id,
                        official_name=cur_circle_name,
                        display_name=cur_circle_disp,
                        unit_type="CIRCLE",
                        parent_id=zc["reg_id"],
                        wing="Construction & Maintenance",
                        region=zc["name"],
                        circle=cur_circle_disp,
                        verification_status="VERIFIED_GO_43",
                        source_go="G.O. (Ms) No.43, dated 13.03.2026",
                        source_sheet=sheet_name,
                        source_row=r,
                        effective_from=datetime.date(2026, 6, 15),
                        status="Active"
                    )
                    db.merge(cur_circle_unit)
                    db.commit()

                    # Legacy Circle sync
                    cur_leg_circle = db.query(Circle).filter(Circle.name == cur_circle_disp).first()
                    if not cur_leg_circle:
                        cur_leg_circle = Circle(
                            zone_id=leg_zone.id,
                            code=f"CIR-{str(circle_counter).zfill(2)}",
                            name=cur_circle_disp
                        )
                        db.add(cur_leg_circle)
                        db.commit()

                # New Division in col 2
                if d_val:
                    cur_div_name = str(d_val).strip()
                    cur_div_disp = normalize_name(cur_div_name)
                    if not cur_div_disp.endswith("Division"):
                        cur_div_disp += " Division"

                    cur_div_len = float(len_val) if len_val is not None else 0.0

                    division_counter += 1
                    div_id = f"ORG-DIV-{str(division_counter).zfill(2)}"
                    parsed_divs_in_zone[div_id] = cur_div_len

                    cur_div_unit = OrganisationUnit(
                        id=div_id,
                        official_name=cur_div_name,
                        display_name=cur_div_disp,
                        unit_type="DIVISION",
                        parent_id=cur_circle_unit.id if cur_circle_unit else None,
                        wing="Construction & Maintenance",
                        region=zc["name"],
                        circle=cur_circle_disp,
                        division=cur_div_disp,
                        road_length_km=cur_div_len,
                        verification_status="VERIFIED_GO_43",
                        source_go="G.O. (Ms) No.43, dated 13.03.2026",
                        source_sheet=sheet_name,
                        source_row=r,
                        effective_from=datetime.date(2026, 6, 15),
                        status="Active"
                    )
                    db.merge(cur_div_unit)
                    db.commit()

                    # Legacy Division sync
                    cur_leg_div = db.query(Division).filter(Division.name == cur_div_disp).first()
                    if not cur_leg_div and cur_leg_circle:
                        cur_leg_div = Division(
                            circle_id=cur_leg_circle.id,
                            code=f"DIV-{str(division_counter).zfill(2)}",
                            name=cur_div_disp
                        )
                        db.add(cur_leg_div)
                        db.commit()

                # Subdivision in col 4
                if sd_val:
                    sd_name = str(sd_val).strip()
                    sd_disp = normalize_name(sd_name)
                    if not sd_disp.endswith("Subdivision") and not sd_disp.endswith("Sub-division"):
                        sd_disp += " Subdivision"

                    subdiv_counter += 1
                    subdiv_count_in_zone += 1
                    subdiv_id = f"ORG-SUBDIV-{str(subdiv_counter).zfill(3)}"

                    subdiv_unit = OrganisationUnit(
                        id=subdiv_id,
                        official_name=sd_name,
                        display_name=sd_disp,
                        unit_type="SUBDIVISION",
                        parent_id=cur_div_unit.id if cur_div_unit else None,
                        wing="Construction & Maintenance",
                        region=zc["name"],
                        circle=cur_circle_disp,
                        division=cur_div_disp,
                        subdivision=sd_disp,
                        verification_status="VERIFIED_GO_43",
                        source_go="G.O. (Ms) No.43, dated 13.03.2026",
                        source_sheet=sheet_name,
                        source_row=r,
                        effective_from=datetime.date(2026, 6, 15),
                        status=str(status_val).strip() if status_val else "Continuing"
                    )
                    db.merge(subdiv_unit)

                    # Legacy Subdivision sync
                    if cur_leg_div:
                        leg_subdiv = db.query(Subdivision).filter(
                            Subdivision.division_id == cur_leg_div.id,
                            Subdivision.name == sd_disp
                        ).first()
                        if not leg_subdiv:
                            leg_subdiv = Subdivision(
                                division_id=cur_leg_div.id,
                                code=f"SUB-{str(subdiv_counter).zfill(3)}",
                                name=sd_disp
                            )
                            db.add(leg_subdiv)

            db.commit()

            zone_tot_len = round(sum(parsed_divs_in_zone.values()), 3)
            print(f"Validated {zc['name']}: {len(parsed_circles_in_zone)} Circles, {len(parsed_divs_in_zone)} Divisions, {subdiv_count_in_zone} Subdivisions, {zone_tot_len} km.")

            total_cm_circles += len(parsed_circles_in_zone)
            total_cm_divs += len(parsed_divs_in_zone)
            total_cm_subdivs += subdiv_count_in_zone
            total_cm_len += zone_tot_len

        print(f"Total C&M Verified: {total_cm_circles} Circles (Expected: 19), {total_cm_divs} Divisions (Expected: 68), {total_cm_subdivs} Subdivisions (Expected: 285), Total km: {total_cm_len:.3f} (Expected: 68149.618)")

        # 4. Parse Old-to-New Division Mapping (Annexure-III, 19 Redesignations)
        map_sheet = wb['Old-to-New Division Mapping']
        redesignations_count = 0
        for r in range(2, map_sheet.max_row + 1):
            sno = map_sheet.cell(row=r, column=1).value
            old_w = map_sheet.cell(row=r, column=2).value
            old_d = map_sheet.cell(row=r, column=3).value
            new_d = map_sheet.cell(row=r, column=4).value

            if sno is not None and old_w and old_d and new_d:
                redesignations_count += 1
                map_id = f"HIST-MAP-{str(sno).zfill(2)}"

                # Match with corresponding new C&M division unit
                norm_new = normalize_name(str(new_d))
                matching_unit = db.query(OrganisationUnit).filter(
                    OrganisationUnit.unit_type == "DIVISION",
                    OrganisationUnit.display_name.ilike(f"%{norm_new}%")
                ).first()

                hist_map = HistoricalOrganisationMapping(
                    id=map_id,
                    serial_no=int(sno),
                    old_wing=str(old_w).strip(),
                    old_division=str(old_d).strip(),
                    new_division=str(new_d).strip(),
                    new_org_unit_id=matching_unit.id if matching_unit else None,
                    source_go="G.O. (Ms) No.43, Highways Dept, dated 13.03.2026",
                    source_annexure="Annexure-III",
                    effective_date=datetime.date(2026, 6, 15),
                    confidence_score=1.0,
                    mapping_status="VERIFIED_REDESIGNATION",
                    notes="Redesignated under G.O. Ms No. 43 Annexure-III"
                )
                db.merge(hist_map)

        db.commit()
        print(f"Total Historical Redesignations Imported: {redesignations_count} (Expected: 19)")

        # 5. Populate National Highways (NH) Hierarchy (Isolated & PENDING_VERIFICATION)
        nh_circles = [
            {"id": "ORG-CIR-NH-01", "name": "Chennai (NH) Circle", "divisions": ["Chennai (NH) Division", "Kanchipuram (NH) Division", "Vellore (NH) Division"]},
            {"id": "ORG-CIR-NH-02", "name": "Salem (NH) Circle", "divisions": ["Salem (NH) Division", "Krishnagiri (NH) Division", "Coimbatore (NH) Division"]},
            {"id": "ORG-CIR-NH-03", "name": "Madurai (NH) Circle", "divisions": ["Madurai (NH) Division", "Dindigul (NH) Division", "Ramanathapuram (NH) Division"]},
            {"id": "ORG-CIR-NH-04", "name": "Tirunelveli (NH) Circle", "divisions": ["Tirunelveli (NH) Division", "Thanjavur (NH) Division"]}
        ]

        nh_div_counter = 0
        for cir in nh_circles:
            cir_unit = OrganisationUnit(
                id=cir["id"],
                official_name=cir["name"],
                display_name=cir["name"],
                unit_type="CIRCLE",
                parent_id="ORG-WING-NH",
                wing="National Highways",
                region="NH Statewide",
                circle=cir["name"],
                verification_status="PENDING_VERIFICATION",
                source_go="Highways Policy Note / Demand No. 21",
                effective_from=datetime.date(2024, 4, 1),
                status="Active (Statutory Verification Pending)"
            )
            db.merge(cir_unit)

            for d_name in cir["divisions"]:
                nh_div_counter += 1
                div_id = f"ORG-DIV-NH-{str(nh_div_counter).zfill(2)}"
                div_unit = OrganisationUnit(
                    id=div_id,
                    official_name=d_name,
                    display_name=d_name,
                    unit_type="DIVISION",
                    parent_id=cir["id"],
                    wing="National Highways",
                    region="NH Statewide",
                    circle=cir["name"],
                    division=d_name,
                    verification_status="PENDING_VERIFICATION",
                    source_go="Highways Policy Note / Demand No. 21",
                    effective_from=datetime.date(2024, 4, 1),
                    status="Active (Statutory Verification Pending)"
                )
                db.merge(div_unit)

        db.commit()
        print(f"National Highways Wing seeded: 4 Circles, {nh_div_counter} Divisions (All PENDING_VERIFICATION).")

        # 6. Seed Initial Data Quality & Mapping Exceptions
        sample_exceptions = [
            {
                "id": "EXC-MAP-001",
                "entity_type": "ORGANISATION_UNIT",
                "entity_id": "ORG-WING-NH",
                "entity_code": "WING-NH",
                "exception_category": "PENDING_NH_VERIFICATION",
                "severity": "MEDIUM",
                "description": "National Highways (NH) Wing Circles and Divisions populated from Policy Note dockets pending statutory G.O. verification.",
                "suggested_fix": "Audit official Service Cadre dockets from NH Wing Chief Engineer and upload statutory sanction G.O.",
                "review_status": "PENDING_REVIEW"
            },
            {
                "id": "EXC-MAP-002",
                "entity_type": "HISTORICAL_WORK",
                "entity_id": "HIST-WRK-PDK-004",
                "entity_code": "CRIDP-HIST-2023-PDK",
                "exception_category": "SPLIT_DIVISION_AMBIGUITY",
                "severity": "HIGH",
                "description": "Historical work in Keeranur stretch sanctioned under former Pudukkottai Division now falls under newly created Viralimalai Division.",
                "suggested_fix": "Verify chainage km 0/0 - 18/4 against Viralimalai jurisdiction boundaries and assign Viralimalai Division.",
                "review_status": "PENDING_REVIEW"
            },
            {
                "id": "EXC-MAP-003",
                "entity_type": "PROJECT",
                "entity_id": "PRJ-TNRSP-002",
                "entity_code": "PRJ-TNRSP-002",
                "exception_category": "MULTI_JURISDICTION_CROSSING",
                "severity": "LOW",
                "description": "Arcot - Villupuram (SH-04) 83 km corridor spans across Ranipet, Tiruvannamalai, and Villupuram C&M Circles.",
                "suggested_fix": "Retain multi-jurisdictional assignments via ProjectOrganisationAssignment to avoid double-counting.",
                "review_status": "VERIFIED_APPROVED"
            }
        ]

        for exc in sample_exceptions:
            e_rec = DataQualityMappingException(
                id=exc["id"],
                entity_type=exc["entity_type"],
                entity_id=exc["entity_id"],
                entity_code=exc["entity_code"],
                exception_category=exc["exception_category"],
                severity=exc["severity"],
                description=exc["description"],
                suggested_fix=exc["suggested_fix"],
                review_status=exc["review_status"]
            )
            db.merge(e_rec)

        db.commit()
        print("Data Quality & Mapping Exceptions seeded successfully.")

    finally:
        if db_session is None:
            db.close()


if __name__ == "__main__":
    seed_organisation_master_data()
