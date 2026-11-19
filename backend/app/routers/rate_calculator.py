"""
Rate Calculator Router for TN-HDOS
Governing Reference: Tamil Nadu SoR 2026-2027 Volume I w.e.f. 13/11/2026
Provides authoritative endpoints for Material, Labour, Work, Equipment, and Quantity calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import datetime
import json
import uuid

from app.database import get_db
from app.models import (
    SoRVersion, SoRItem, SoRAllowanceRule,
    CalculationSession, CalculationLine, CalculationAdjustment,
    CalculationResult, CalculationAudit
)
from app.schemas import (
    RateCalculateRequest, RateCalculateResponse,
    BatchCalculateRequest, BatchCalculateResponse,
    RateValidationRequest, RateValidationResponse,
    RateExportRequest, RateExportResponse,
    SoRVersionOut, SoRItemOut, SoRAllowanceRuleOut
)
from app.services.sor_calculation_service import SoRCalculationService

router = APIRouter(prefix="/sor", tags=["Material, Labour & Work Rate Calculator"])


@router.get("/publications", response_model=List[SoRVersionOut])
def get_publications(db: Session = Depends(get_db)):
    """Retrieve all approved SoR publication versions."""
    versions = db.query(SoRVersion).order_by(SoRVersion.effective_from.desc()).all()
    if not versions:
        # Fallback default if not seeded
        return [
            SoRVersionOut(
                id="SOR-2026-27-V1",
                version_code="SOR-2026-27-V1",
                volume_name="Volume I (Highways, PWD, WRD)",
                financial_year="2026-2027",
                effective_from=datetime.date(2026, 11, 13),
                is_active=True,
                source_authority="Engineer-in-Chief & Chief Engineer (General), PWD",
                source_document_title="Tamil Nadu Schedule of Rates 2026-2027 Volume I",
                gst_exclusive=True,
                created_at=datetime.datetime.utcnow()
            )
        ]
    return [SoRVersionOut.from_orm(v) for v in versions]


@router.get("/items", response_model=Dict[str, Any])
def search_rate_items(
    category: Optional[str] = Query(None, description="Filter by category (Labour, Material, Highways Works, etc.)"),
    annexure: Optional[str] = Query(None, description="Filter by Annexure (ANNEXURE-I .. IX)"),
    query: Optional[str] = Query(None, description="Search term for code or description"),
    validation_status: Optional[str] = Query(None, description="SOURCE_VERIFIED, VERIFIED, TO_VALIDATE"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Search and filter official Schedule of Rates items with pagination."""
    q = db.query(SoRItem)

    if category and category != "ALL":
        q = q.filter(SoRItem.category.ilike(f"%{category}%"))

    if annexure and annexure != "ALL":
        q = q.filter(SoRItem.annexure_code.ilike(f"%{annexure}%"))

    if validation_status:
        q = q.filter(SoRItem.validation_status == validation_status)

    if query:
        term = f"%{query.strip()}%"
        q = q.filter(
            (SoRItem.unique_code.ilike(term)) |
            (SoRItem.description.ilike(term)) |
            (SoRItem.sub_category.ilike(term))
        )

    total = q.count()
    items = q.order_by(SoRItem.unique_code.asc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [SoRItemOut.from_orm(it) for it in items]
    }


@router.get("/items/{itemCode}", response_model=SoRItemOut)
def get_rate_item_by_code(itemCode: str, db: Session = Depends(get_db)):
    """Retrieve single item specification and basic rate by unique code."""
    it = db.query(SoRItem).filter(
        (SoRItem.unique_code == itemCode) | (SoRItem.id == itemCode)
    ).first()

    if not it:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SoR Item code '{itemCode}' not found in official publication."
        )
    return SoRItemOut.from_orm(it)


@router.get("/rules", response_model=List[SoRAllowanceRuleOut])
def get_statutory_rules(db: Session = Depends(get_db)):
    """Retrieve all versioned statutory rules and area allowance percentages."""
    rules = db.query(SoRAllowanceRule).filter(SoRAllowanceRule.is_active == True).all()
    return [SoRAllowanceRuleOut.from_orm(r) for r in rules]


@router.post("/calculate", response_model=RateCalculateResponse)
def calculate_rate_item(req: RateCalculateRequest, db: Session = Depends(get_db)):
    """
    Execute single engineering rate calculation with 100% Python Decimal precision.
    Produces step-by-step audit trace, applied/excluded rules, and validation warnings.
    """
    item = None
    if req.item_code:
        item = db.query(SoRItem).filter(
            (SoRItem.unique_code == req.item_code) | (SoRItem.id == req.item_code)
        ).first()

    res = SoRCalculationService.calculate_rate_item(req, item)

    # Persist calculation result snapshot
    calc_res_obj = CalculationResult(
        id=str(uuid.uuid4()),
        calculation_id=res["calculation_id"],
        sor_version_code=res["sor_version"],
        item_code=res.get("item_code"),
        item_description=res.get("item_description"),
        official_unit=res.get("official_unit"),
        source_rate=res.get("source_rate", 0.0),
        input_quantity=res.get("input_quantity", 0.0),
        base_formula=res["base_formula"],
        base_amount=res["base_amount"],
        total_adjustments=res["total_adjustments"],
        tax_percentage=res["tax_treatment"].get("tax_percentage", 18.0),
        tax_amount=res["tax_treatment"].get("tax_amount", 0.0),
        final_amount=res["final_amount"],
        validation_status=res["validation_status"],
        trace_json=json.dumps(res)
    )
    db.add(calc_res_obj)

    # Record append-only calculation audit
    audit_entry = CalculationAudit(
        id=str(uuid.uuid4()),
        actor_username="authorized_engineer",
        actor_role="ESTIMATION_ENGINEER",
        action_type="CALCULATE",
        calculation_ref=res["calculation_id"],
        item_code=res.get("item_code"),
        inputs_summary=f"Mode: {req.calculation_mode}, Qty: {req.quantity}, Lead: {req.lead_km or 0}km",
        result_summary=f"Base: ₹{res['base_amount']}, Adj: ₹{res['total_adjustments']}, Final: ₹{res['final_amount']}",
        validation_status=res["validation_status"]
    )
    db.add(audit_entry)
    db.commit()

    return RateCalculateResponse(**res)


@router.post("/calculate-batch", response_model=BatchCalculateResponse)
def calculate_rate_batch(req: BatchCalculateRequest, db: Session = Depends(get_db)):
    """
    Execute multi-item calculation sheet with deterministic aggregation.
    Reconciles basic sums, adjustments, separate GST, and grand total.
    """
    def get_item(code: str):
        return db.query(SoRItem).filter(
            (SoRItem.unique_code == code) | (SoRItem.id == code)
        ).first()

    batch_res = SoRCalculationService.calculate_rate_batch(
        lines_req=req.lines,
        get_item_fn=get_item,
        session_id=req.session_id,
        title=req.title or "Rate Calculation Sheet",
        project_id=req.project_id
    )

    # Persist Calculation Session
    session_obj = CalculationSession(
        id=batch_res["session_id"],
        session_code=batch_res["session_id"],
        title=batch_res["title"],
        project_id=batch_res["project_id"],
        sor_version_id="SOR-2026-27-V1",
        mode="COMBINED",
        total_basic_amount=batch_res["total_basic_amount"],
        total_adjustment_amount=batch_res["total_adjustment_amount"],
        total_tax_amount=batch_res["total_tax_amount"],
        grand_total_amount=batch_res["grand_total_amount"],
        validation_status=batch_res["validation_status"],
        notes=f"Calculated with {len(batch_res['lines'])} lines; {batch_res['warnings_count']} warnings."
    )
    db.add(session_obj)

    # Persist Calculation Lines
    for idx, ln in enumerate(batch_res["lines"]):
        line_obj = CalculationLine(
            id=str(uuid.uuid4()),
            session_id=session_obj.id,
            line_number=idx + 1,
            calculation_mode=req.lines[idx].calculation_mode if idx < len(req.lines) else "WORK",
            item_code=ln.get("item_code"),
            item_description=ln.get("item_description"),
            official_unit=ln.get("official_unit"),
            basic_rate=ln.get("source_rate", 0.0),
            quantity=ln.get("input_quantity", 1.0),
            basic_amount=ln.get("base_amount", 0.0),
            adjustment_amount=ln.get("total_adjustments", 0.0),
            tax_amount=ln.get("tax_treatment", {}).get("tax_amount", 0.0),
            line_total=ln.get("final_amount", 0.0),
            formula_text=ln.get("base_formula"),
            validation_status=ln.get("validation_status", "VALID"),
            warnings_json=json.dumps(ln.get("warnings", [])),
            calculation_trace_json=json.dumps(ln)
        )
        db.add(line_obj)

    # Record Audit
    audit_entry = CalculationAudit(
        id=str(uuid.uuid4()),
        actor_username="authorized_engineer",
        actor_role="ESTIMATION_ENGINEER",
        action_type="BATCH_CALCULATE",
        calculation_ref=session_obj.id,
        inputs_summary=f"Batch of {len(req.lines)} items for {session_obj.title}",
        result_summary=f"Grand Total: ₹{batch_res['grand_total_amount']} (Basic: ₹{batch_res['total_basic_amount']})",
        validation_status=batch_res["validation_status"]
    )
    db.add(audit_entry)
    db.commit()

    return BatchCalculateResponse(**batch_res)


@router.post("/validate", response_model=RateValidationResponse)
def validate_calculation_inputs(req: RateValidationRequest, db: Session = Depends(get_db)):
    """
    Pre-flight validation check for quantities, units, night work clauses, and bridge allowance exclusions.
    """
    errors: List[str] = []
    warnings: List[str] = []
    admissible: List[Dict[str, Any]] = []
    inadmissible: List[Dict[str, Any]] = []

    if req.quantity < 0:
        errors.append("Quantity cannot be negative.")

    item = None
    if req.item_code:
        item = db.query(SoRItem).filter(
            (SoRItem.unique_code == req.item_code) | (SoRItem.id == req.item_code)
        ).first()
        if not item:
            warnings.append(f"Item code '{req.item_code}' is not in the official catalogue.")

    # Night work tender clause check
    if req.is_night_work:
        if not req.tender_night_clause:
            inadmissible.append({
                "rule": "BR-NIGHT-25",
                "reason": "Missing tender clause authorizing night work."
            })
            warnings.append("Night work 25% allowance will be blocked without explicit tender clause.")
        else:
            admissible.append({
                "rule": "BR-NIGHT-25",
                "percentage": 25.0,
                "note": "Verified with tender clause."
            })

    # Bridge structural check
    if req.structural_type in ["DRAIN", "CULVERT", "RETAINING_WALL", "REPAIR"]:
        inadmissible.append({
            "rule": "BR-BRIDGE-03",
            "reason": f"General Note 10 explicitly prohibits bridge 3% allowance on {req.structural_type}."
        })
        warnings.append(f"General Note 10: 3% bridge provisional allowance is strictly excluded for {req.structural_type}.")

    status_str = "VALID"
    if errors:
        status_str = "INVALID"
    elif warnings:
        status_str = "VALID_WITH_WARNINGS"

    return RateValidationResponse(
        is_valid=len(errors) == 0,
        status=status_str,
        errors=errors,
        warnings=warnings,
        admissible_allowances=admissible,
        inadmissible_allowances=inadmissible
    )


@router.post("/export", response_model=RateExportResponse)
def export_calculation_sheet(req: RateExportRequest, db: Session = Depends(get_db)):
    """
    Exports calculation summary sheet in JSON, CSV, or formatted text.
    """
    batch = req.batch_data
    export_id = f"EXP-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    if req.format.upper() == "CSV":
        csv_rows = [
            "Line,Item Code,Description,Quantity,Unit,Basic Rate (Rs),Basic Amount (Rs),Adjustments (Rs),Total Amount (Rs),Status,Formula"
        ]
        for idx, ln in enumerate(batch.lines):
            desc = (ln.item_description or "").replace(",", ";")
            formula = (ln.base_formula or "").replace(",", ";")
            csv_rows.append(
                f"{idx+1},{ln.item_code or 'N/A'},\"{desc}\",{ln.input_quantity},{ln.official_unit},{ln.source_rate},{ln.base_amount},{ln.total_adjustments},{ln.final_amount},{ln.validation_status},\"{formula}\""
            )
        csv_rows.append("")
        csv_rows.append(f",,,,Total Basic Amount,{batch.total_basic_amount}")
        csv_rows.append(f",,,,Total Statutory Adjustments,{batch.total_adjustment_amount}")
        csv_rows.append(f",,,,Separate GST (18%),{batch.total_tax_amount}")
        csv_rows.append(f",,,,Grand Sanction Total,{batch.grand_total_amount}")
        content = "\n".join(csv_rows)
        filename = f"Rate_Calculation_{batch.session_id}.csv"
    else:
        # Formatted JSON or Summary
        summary = {
            "document_title": "Tamil Nadu Highways Rate Calculation Sheet",
            "statutory_reference": "Schedule of Rates 2026-2027 Volume I (w.e.f. 13/11/2026)",
            "session_id": batch.session_id,
            "project_id": batch.project_id,
            "generated_at": timestamp_str,
            "validation_status": batch.validation_status,
            "total_basic_amount": batch.total_basic_amount,
            "total_adjustment_amount": batch.total_adjustment_amount,
            "total_tax_amount": batch.total_tax_amount,
            "grand_total_amount": batch.grand_total_amount,
            "lines": [ln.dict() for ln in batch.lines]
        }
        content = json.dumps(summary, indent=2)
        filename = f"Rate_Calculation_{batch.session_id}.json"

    return RateExportResponse(
        export_id=export_id,
        format=req.format.upper(),
        filename=filename,
        content=content,
        generated_at=timestamp_str
    )
