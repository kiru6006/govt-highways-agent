"""
Works Status Analytics Router - Phase 1 Implementation
Endpoints for Unified Works Analytics:
- Filter registry metadata
- Query works with multi-criteria filtering, search, pagination
- Synchronized KPIs calculation
- Synchronized Charts calculation (A through J)
- Multi-sheet Excel & CSV exports with formula injection guards
- Individual work details for row drill-down
"""

import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UnifiedWorkRecord
from app.schemas import (
    WorksAnalyticsFilterRegistryOut,
    WorksAnalyticsFilterPayload,
    WorksAnalyticsKPIsOut,
    WorksAnalyticsChartsOut,
    WorksAnalyticsQueryResultOut,
    UnifiedWorkRecordOut
)
from app.services.works_analytics_service import (
    get_works_filter_registry,
    query_works_data,
    build_works_query,
    calculate_works_kpis,
    calculate_works_charts,
    export_works_excel_or_csv
)

router = APIRouter(
    prefix="/works-analytics",
    tags=["Works Status Analytics"]
)


@router.get("/filter-registry", response_model=WorksAnalyticsFilterRegistryOut)
def fetch_works_filter_registry(db: Session = Depends(get_db)):
    """Returns dynamic filter registry metadata populated from unified works records."""
    return get_works_filter_registry(db)


@router.post("/query", response_model=WorksAnalyticsQueryResultOut)
def query_works(
    payload: WorksAnalyticsFilterPayload,
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Records limit per page"),
    db: Session = Depends(get_db)
):
    """
    Queries unified highway works applying administrative cascades,
    status/stage filters, non-overlapping progress bands, financial ranges,
    dependency blockers, and risk levels with full text search and pagination.
    """
    if limit:
        payload.page_size = limit
    if skip is not None and limit:
        payload.page = (skip // limit) + 1
    return query_works_data(db, payload)


@router.post("/kpis", response_model=WorksAnalyticsKPIsOut)
def get_works_kpis(
    payload: WorksAnalyticsFilterPayload,
    db: Session = Depends(get_db)
):
    """
    Computes 10 synchronized KPIs across the filtered works dataset:
    total works, total AS value, total expenditure, physical progress avg,
    financial progress avg, completed works, WIP works, critical delays,
    inter-departmental blockers, and total audited length.
    """
    items = build_works_query(db, payload).all()
    return calculate_works_kpis(items)


@router.post("/charts", response_model=WorksAnalyticsChartsOut)
def get_works_charts(
    payload: WorksAnalyticsFilterPayload,
    db: Session = Depends(get_db)
):
    """
    Computes synchronized chart metrics A through J across the exact filtered dataset:
    - Chart A: Physical Progress Bands (non-overlapping)
    - Chart B: Potential Delay Analysis
    - Chart C: Agreement Delay Distribution
    - Chart D: Pre-Construction Pipeline
    - Chart E: Financial Expenditure vs Sanction
    - Chart F: Circle-wise Delivery Performance
    - Chart G: Scheme Performance Matrix
    - Chart H: Critical Risk Distribution
    - Chart I: Year-wise Sanction Trends
    - Chart J: CRIDP 5-Year Renewal Audit Breakdown
    """
    items = build_works_query(db, payload).all()
    kpis = calculate_works_kpis(items)
    return calculate_works_charts(items, kpis)


@router.post("/export")
def export_works_data(
    payload: WorksAnalyticsFilterPayload,
    format: str = Query("excel", pattern="^(excel|csv)$", description="Export format ('excel' or 'csv')"),
    db: Session = Depends(get_db)
):
    """
    Exports filtered works dataset to multi-sheet Excel (.xlsx) or CSV format.
    Sanitizes all text fields against formula injection attacks (=, +, -, @).
    Multi-sheet workbook contains:
    1. Filtered Works
    2. KPI Summary
    3. Risk Findings
    4. Data Quality Exceptions
    5. Filter Criteria & Metadata
    """
    file_bytes, content_type, extension = export_works_excel_or_csv(db, payload, export_format=format)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"TN_Highways_Works_Analytics_{timestamp}.{extension}"

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/work/{work_id}", response_model=UnifiedWorkRecordOut)
def get_work_by_id(work_id: str, db: Session = Depends(get_db)):
    """Retrieves full 55+ column dossier for a specific unified highway work record."""
    work = db.query(UnifiedWorkRecord).filter(UnifiedWorkRecord.id == work_id).first()
    if not work:
        work = db.query(UnifiedWorkRecord).filter(UnifiedWorkRecord.work_code == work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work record with ID or code '{work_id}' not found in unified registry."
        )
    return work
