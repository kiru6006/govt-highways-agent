"""
Organisation & Jurisdiction Intelligence Router.
Endpoints for Master Organisation Blueprint:
- Hierarchical tree explorer
- Unit details and assigned assets
- Standardized cascading filter options
- Historical redesignations (G.O. 43 Annexure-III)
- Statewide Strategic Command KPIs
- Data quality & mapping exceptions audit
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import OrganisationUnit
from app.schemas import (
    OrganisationHierarchyTreeOut,
    OrganisationUnitOut,
    OrganisationFilterOptionsOut,
    HistoricalOrganisationMappingOut,
    DataQualityMappingExceptionOut,
    OrganisationKPIsOut,
    OrganisationResolveExceptionPayload
)
from app.services.organisation_blueprint_service import (
    get_organisation_hierarchy_tree,
    get_organisation_unit_details,
    get_organisation_filter_options,
    get_historical_organisation_mappings,
    get_organisation_kpis,
    get_data_quality_mapping_exceptions,
    resolve_mapping_exception
)

router = APIRouter(
    prefix="/organisation",
    tags=["Organisation & Jurisdiction Blueprint"]
)


@router.get("/hierarchy", response_model=OrganisationHierarchyTreeOut)
def fetch_organisation_hierarchy(
    root_id: str = Query("ORG-DEPT-TN-HIGHWAYS", description="Root organisation unit ID"),
    db: Session = Depends(get_db)
):
    """Returns canonical organisation tree for C&M (G.O. 43), NH, Projects, and TANSHA."""
    return get_organisation_hierarchy_tree(db, root_id=root_id)


@router.get("/unit/{unit_id}")
def fetch_organisation_unit(unit_id: str, db: Session = Depends(get_db)):
    """Fetches organisation unit details, parent/child relationships, and matching works."""
    details = get_organisation_unit_details(db, unit_id)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organisation unit '{unit_id}' not found."
        )
    return {
        "unit": {
            "id": details["unit"].id,
            "official_name": details["unit"].official_name,
            "display_name": details["unit"].display_name,
            "unit_type": details["unit"].unit_type,
            "parent_id": details["unit"].parent_id,
            "wing": details["unit"].wing,
            "region": details["unit"].region,
            "circle": details["unit"].circle,
            "division": details["unit"].division,
            "subdivision": details["unit"].subdivision,
            "road_length_km": details["unit"].road_length_km,
            "status": details["unit"].status,
            "effective_from": str(details["unit"].effective_from) if details["unit"].effective_from else None,
            "verification_status": details["unit"].verification_status,
            "source_go": details["unit"].source_go
        },
        "parent": {
            "id": details["parent"].id,
            "display_name": details["parent"].display_name,
            "unit_type": details["parent"].unit_type
        } if details["parent"] else None,
        "children": [
            {
                "id": c.id,
                "display_name": c.display_name,
                "unit_type": c.unit_type,
                "road_length_km": c.road_length_km,
                "status": c.status
            } for c in details["children"]
        ],
        "children_count": details["children_count"],
        "total_works_count": details["total_works_count"],
        "recent_works": details["recent_works"]
    }


@router.get("/filter-options", response_model=OrganisationFilterOptionsOut)
def fetch_organisation_filter_options(db: Session = Depends(get_db)):
    """Returns standardized cascading dropdown options across the platform."""
    return get_organisation_filter_options(db)


@router.get("/historical-mappings", response_model=List[HistoricalOrganisationMappingOut])
def fetch_historical_mappings(db: Session = Depends(get_db)):
    """Returns all 19 historical redesignations under G.O. (Ms) No. 43 Annexure-III."""
    return get_historical_organisation_mappings(db)


@router.get("/kpis", response_model=OrganisationKPIsOut)
def fetch_organisation_kpis(db: Session = Depends(get_db)):
    """Returns Strategic Command apex KPIs for Statewide Organisation Overview."""
    return get_organisation_kpis(db)


@router.get("/exceptions", response_model=List[DataQualityMappingExceptionOut])
def fetch_data_quality_exceptions(db: Session = Depends(get_db)):
    """Returns list of unmapped jurisdictions, split-division ambiguities, and pending verifications."""
    return get_data_quality_mapping_exceptions(db)


@router.post("/resolve-exception", response_model=DataQualityMappingExceptionOut)
def resolve_exception(payload: OrganisationResolveExceptionPayload, db: Session = Depends(get_db)):
    """Records administrative resolution or verification verdict on a mapping exception."""
    exc = resolve_mapping_exception(db, payload)
    if not exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping exception '{payload.exception_id}' not found."
        )
    return exc
