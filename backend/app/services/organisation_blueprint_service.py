"""
Master Organisation Blueprint Service.
Provides canonical hierarchical navigation, dynamic cascading filter registry,
historical redesignations query, data quality exception audit, and non-double-counting KPI aggregations.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import datetime

from app.models import (
    OrganisationUnit,
    HistoricalOrganisationMapping,
    DataQualityMappingException,
    Project,
    UnifiedWorkRecord
)
from app.schemas import (
    OrganisationHierarchyTreeOut,
    OrganisationHierarchyNode,
    OrganisationFilterOptionsOut,
    OrganisationKPIsOut,
    OrganisationResolveExceptionPayload
)


def build_node(unit: OrganisationUnit, all_units_by_parent: Dict[Optional[str], List[OrganisationUnit]]) -> OrganisationHierarchyNode:
    children_units = all_units_by_parent.get(unit.id, [])
    children_nodes = [build_node(c, all_units_by_parent) for c in children_units]
    return OrganisationHierarchyNode(
        id=unit.id,
        label=unit.display_name,
        official_name=unit.official_name,
        unit_type=unit.unit_type,
        road_length_km=unit.road_length_km or 0.0,
        verification_status=unit.verification_status,
        children=children_nodes
    )


def get_organisation_hierarchy_tree(db: Session, root_id: str = "ORG-DEPT-TN-HIGHWAYS") -> OrganisationHierarchyTreeOut:
    all_units = db.query(OrganisationUnit).filter(OrganisationUnit.is_active == True).all()

    units_by_parent: Dict[Optional[str], List[OrganisationUnit]] = {}
    for u in all_units:
        units_by_parent.setdefault(u.parent_id, []).append(u)

    root = db.query(OrganisationUnit).filter(OrganisationUnit.id == root_id).first()
    if not root:
        root = all_units[0] if all_units else None

    root_node = build_node(root, units_by_parent) if root else OrganisationHierarchyNode(
        id="EMPTY", label="Empty", official_name="Empty", unit_type="DEPARTMENT", road_length_km=0.0, verification_status="NONE", children=[]
    )

    cm_regions = [u for u in all_units if u.unit_type == "REGION" and u.wing == "Construction & Maintenance"]
    cm_circles = [u for u in all_units if u.unit_type == "CIRCLE" and u.wing == "Construction & Maintenance"]
    cm_divs = [u for u in all_units if u.unit_type == "DIVISION" and u.wing == "Construction & Maintenance"]
    cm_subdivs = [u for u in all_units if u.unit_type == "SUBDIVISION" and u.wing == "Construction & Maintenance"]
    total_km = round(sum(d.road_length_km for d in cm_divs), 3)

    return OrganisationHierarchyTreeOut(
        root=root_node,
        total_units=len(all_units),
        total_road_length_km=total_km,
        cm_regions_count=len(cm_regions),
        cm_circles_count=len(cm_circles),
        cm_divisions_count=len(cm_divs),
        cm_subdivisions_count=len(cm_subdivs)
    )


def get_organisation_unit_details(db: Session, unit_id: str) -> Optional[Dict[str, Any]]:
    unit = db.query(OrganisationUnit).filter(OrganisationUnit.id == unit_id).first()
    if not unit:
        # Also try matching by display_name
        unit = db.query(OrganisationUnit).filter(OrganisationUnit.display_name.ilike(f"%{unit_id}%")).first()
    if not unit:
        return None

    children = db.query(OrganisationUnit).filter(OrganisationUnit.parent_id == unit.id).all()
    parent = db.query(OrganisationUnit).filter(OrganisationUnit.id == unit.parent_id).first() if unit.parent_id else None

    # Count matching works in UnifiedWorkRecord
    works_query = db.query(UnifiedWorkRecord)
    if unit.unit_type == "REGION":
        works_query = works_query.filter(UnifiedWorkRecord.circle.in_([c.display_name for c in children]))
    elif unit.unit_type == "CIRCLE":
        works_query = works_query.filter(UnifiedWorkRecord.circle.ilike(f"%{unit.display_name}%"))
    elif unit.unit_type == "DIVISION":
        works_query = works_query.filter(UnifiedWorkRecord.division.ilike(f"%{unit.display_name}%"))
    elif unit.unit_type == "SUBDIVISION":
        works_query = works_query.filter(UnifiedWorkRecord.subdivision.ilike(f"%{unit.display_name}%"))

    works = works_query.limit(20).all()
    total_works_count = works_query.count()

    return {
        "unit": unit,
        "parent": parent,
        "children": children,
        "children_count": len(children),
        "total_works_count": total_works_count,
        "recent_works": [
            {
                "work_code": w.work_code,
                "work_name": w.work_name,
                "scheme": w.scheme,
                "stage": w.work_stage,
                "progress_pct": w.physical_progress_pct,
                "as_amount_cr": w.as_amount_cr,
                "contractor": w.contractor_name
            } for w in works
        ]
    }


def get_organisation_filter_options(db: Session) -> OrganisationFilterOptionsOut:
    all_units = db.query(OrganisationUnit).filter(OrganisationUnit.is_active == True).all()

    wings = ["Construction & Maintenance", "National Highways", "Projects", "TANSHA"]

    regions_by_wing: Dict[str, List[str]] = {w: [] for w in wings}
    circles_by_region: Dict[str, List[str]] = {}
    divisions_by_circle: Dict[str, List[str]] = {}
    subdivisions_by_division: Dict[str, List[str]] = {}

    all_regions = []
    all_circles = []
    all_divisions = []
    all_subdivisions = []

    for u in all_units:
        if u.unit_type == "REGION" and u.region:
            all_regions.append(u.region)
            if u.wing in regions_by_wing and u.region not in regions_by_wing[u.wing]:
                regions_by_wing[u.wing].append(u.region)

        elif u.unit_type == "CIRCLE" and u.circle:
            all_circles.append(u.circle)
            reg = u.region or "Statewide"
            circles_by_region.setdefault(reg, [])
            if u.circle not in circles_by_region[reg]:
                circles_by_region[reg].append(u.circle)

        elif u.unit_type == "DIVISION" and u.division:
            all_divisions.append(u.division)
            cir = u.circle or "Unassigned"
            divisions_by_circle.setdefault(cir, [])
            if u.division not in divisions_by_circle[cir]:
                divisions_by_circle[cir].append(u.division)

        elif u.unit_type == "SUBDIVISION" and u.subdivision:
            all_subdivisions.append(u.subdivision)
            div = u.division or "Unassigned"
            subdivisions_by_division.setdefault(div, [])
            if u.subdivision not in subdivisions_by_division[div]:
                subdivisions_by_division[div].append(u.subdivision)

    # Sort all lists
    all_regions = sorted(list(set(all_regions)))
    all_circles = sorted(list(set(all_circles)))
    all_divisions = sorted(list(set(all_divisions)))
    all_subdivisions = sorted(list(set(all_subdivisions)))

    districts = sorted(list({r.district for r in db.query(UnifiedWorkRecord.district).distinct() if r[0]}))
    constituencies = sorted(list({r.constituency for r in db.query(UnifiedWorkRecord.constituency).distinct() if r[0]}))

    return OrganisationFilterOptionsOut(
        wings=wings,
        regions_by_wing=regions_by_wing,
        circles_by_region=circles_by_region,
        divisions_by_circle=divisions_by_circle,
        subdivisions_by_division=subdivisions_by_division,
        all_regions=all_regions,
        all_circles=all_circles,
        all_divisions=all_divisions,
        all_subdivisions=all_subdivisions,
        districts=districts,
        constituencies=constituencies
    )


def get_historical_organisation_mappings(db: Session) -> List[HistoricalOrganisationMapping]:
    return db.query(HistoricalOrganisationMapping).order_by(HistoricalOrganisationMapping.serial_no.asc()).all()


def get_organisation_kpis(db: Session) -> OrganisationKPIsOut:
    all_units = db.query(OrganisationUnit).filter(OrganisationUnit.is_active == True).all()

    cm_regions = [u for u in all_units if u.unit_type == "REGION" and u.wing == "Construction & Maintenance"]
    cm_circles = [u for u in all_units if u.unit_type == "CIRCLE" and u.wing == "Construction & Maintenance"]
    cm_divs = [u for u in all_units if u.unit_type == "DIVISION" and u.wing == "Construction & Maintenance"]
    cm_subdivs = [u for u in all_units if u.unit_type == "SUBDIVISION" and u.wing == "Construction & Maintenance"]
    cm_tot_len = round(sum(d.road_length_km for d in cm_divs), 3)

    nh_circles = [u for u in all_units if u.unit_type == "CIRCLE" and u.wing == "National Highways"]
    nh_divs = [u for u in all_units if u.unit_type == "DIVISION" and u.wing == "National Highways"]

    # Active works & project aggregates
    all_works = db.query(UnifiedWorkRecord).all()
    active_works = [w for w in all_works if w.work_stage in ["Work in Progress", "To Be Started", "Tender Stage", "Estimate Stage"]]
    delayed_works = [w for w in all_works if w.delay_status in ["Delayed", "Critically delayed", "Potential Delay"]]
    exposure = round(sum(w.financial_exposure_cr for w in all_works), 2)
    critical_blockers = len([w for w in all_works if w.issue_land_acquisition or w.issue_court_approvals or w.issue_railway_approvals])

    redesignations_count = db.query(HistoricalOrganisationMapping).count()
    open_exceptions_count = db.query(DataQualityMappingException).filter(DataQualityMappingException.review_status == "PENDING_REVIEW").count()

    return OrganisationKPIsOut(
        operational_wings_count=6,
        cm_regions_count=len(cm_regions),
        cm_circles_count=len(cm_circles),
        cm_divisions_count=len(cm_divs),
        cm_subdivisions_count=len(cm_subdivs),
        cm_total_road_length_km=cm_tot_len,
        total_active_projects=len(active_works),
        total_delayed_projects=len(delayed_works),
        total_financial_exposure_cr=exposure,
        total_critical_blockers=critical_blockers,
        historical_redesignations_count=redesignations_count,
        open_mapping_exceptions_count=open_exceptions_count,
        nh_circles_count=len(nh_circles),
        nh_divisions_count=len(nh_divs),
        nh_verification_status="PENDING_VERIFICATION"
    )


def get_data_quality_mapping_exceptions(db: Session) -> List[DataQualityMappingException]:
    return db.query(DataQualityMappingException).order_by(DataQualityMappingException.created_at.desc()).all()


def resolve_mapping_exception(db: Session, payload: OrganisationResolveExceptionPayload) -> Optional[DataQualityMappingException]:
    exc = db.query(DataQualityMappingException).filter(DataQualityMappingException.id == payload.exception_id).first()
    if not exc:
        return None

    exc.review_status = payload.review_status
    exc.reviewed_by = payload.reviewed_by
    exc.reviewed_at = datetime.datetime.utcnow()
    if payload.correction_notes:
        exc.suggested_fix = (exc.suggested_fix or "") + f" | Notes: {payload.correction_notes}"

    db.commit()
    db.refresh(exc)
    return exc

