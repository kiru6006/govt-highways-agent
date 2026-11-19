"""
Deterministic Calculation & Business Rule Engine for SoR-WECI
Governing Reference: Tamil Nadu SoR 2026-2027 Volume I w.e.f. 13/11/2026 (General Notes 1-10)
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List, Optional
import json
import uuid
import datetime


def to_decimal(val: Any) -> Decimal:
    if val is None:
        return Decimal("0.0")
    return Decimal(str(val))


def d_round(val: Decimal, places: int = 2) -> Decimal:
    fmt = "1." + "0" * places if places > 0 else "1"
    return val.quantize(Decimal(fmt), rounding=ROUND_HALF_UP)


class SoRCalculationService:
    """100% Deterministic Arithmetic & Rule Scrutiny Engine."""

    @staticmethod
    def calculate_conveyance(item_category: str, quantity: float, lead_km: float) -> Dict[str, Any]:
        """
        Calculates conveyance based on standard Highways Annexure-IX slabs.
        Materials with at-site rates or non-conveyable items return 0.
        """
        qty = to_decimal(quantity)
        lead = to_decimal(lead_km)

        if lead <= Decimal("0.0"):
            return {
                "conveyance_rate": Decimal("0.0"),
                "conveyance_total": Decimal("0.0"),
                "lead_km": 0.0,
                "notes": "No conveyance applied (lead is zero)."
            }

        # Standard stone metal/earth conveyance slabs:
        # 1st km initial lead slab: ₹140.00 / cum
        # Subsequent km (2 to 20 km): ₹18.50 / cum / km
        rate_1st_km = Decimal("140.00")
        rate_subsequent_km = Decimal("18.50")

        if lead <= Decimal("1.0"):
            rate_per_unit = rate_1st_km
        else:
            subsequent_dist = lead - Decimal("1.0")
            rate_per_unit = rate_1st_km + (subsequent_dist * rate_subsequent_km)

        rate_per_unit = d_round(rate_per_unit, 2)
        total_conveyance = d_round(rate_per_unit * qty, 2)

        return {
            "conveyance_rate": rate_per_unit,
            "conveyance_total": total_conveyance,
            "lead_km": float(lead),
            "notes": f"Conveyance calculated for {lead} km lead."
        }

    @staticmethod
    def evaluate_allowances(
        item_code: str,
        category: str,
        basic_rate: float,
        structural_component_type: str,
        estimate_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates Corporation, Night Work, and Bridge 3% allowances deterministically.
        """
        rate = to_decimal(basic_rate)
        trace: Dict[str, Any] = {
            "item_code": item_code,
            "base_rate": float(rate),
            "applied_rules": [],
            "blocked_rules": []
        }

        total_allowance_pct = Decimal("0.0")

        # 1. Corporation Allowances (General Notes 1 & 2)
        corp_type = estimate_metadata.get("corporation_type", "NONE")
        if corp_type in ["CHENNAI_32KM", "MADURAI_CBE_HOSUR"]:
            corp_pct = Decimal("10.0")
            total_allowance_pct += corp_pct
            trace["applied_rules"].append({
                "rule_code": "BR-CORP-10",
                "title": "Corporation Allowance +10%",
                "percentage": 10.0,
                "amount": float(d_round(rate * Decimal("0.10"), 2))
            })
        elif corp_type == "OTHER_CORP":
            corp_pct = Decimal("5.0")
            total_allowance_pct += corp_pct
            trace["applied_rules"].append({
                "rule_code": "BR-CORP-05",
                "title": "Municipal Corporation Allowance +5%",
                "percentage": 5.0,
                "amount": float(d_round(rate * Decimal("0.05"), 2))
            })

        # 2. Night Work Allowance (Highways Annexure-I Note 2a: +25% on Labour Only)
        is_night = estimate_metadata.get("is_night_work_allowed", False)
        night_clause = estimate_metadata.get("night_work_tender_clause")
        night_allowance_amount = Decimal("0.0")

        if is_night:
            if night_clause:
                # If pure labour, 25% on entire rate. If composite, 25% on labour component (~30%)
                if category.lower() == "labour":
                    labour_portion = rate
                else:
                    labour_portion = rate * Decimal("0.30")  # Standard 30% labour composition

                night_allowance_amount = d_round(labour_portion * Decimal("0.25"), 2)
                trace["applied_rules"].append({
                    "rule_code": "BR-NIGHT-25",
                    "title": "Night Work Allowance (+25% on Labour Component)",
                    "percentage": 25.0,
                    "tender_clause": night_clause,
                    "amount": float(night_allowance_amount)
                })
            else:
                trace["blocked_rules"].append({
                    "rule_code": "BR-NIGHT-25",
                    "reason": "Blocked: Missing mandatory tender specification clause authorizing night work."
                })

        # 3. Highways Bridge 3% Provisional Allowance Guardrail (General Note 10)
        # Eligibility:
        # a) Must be Bridge work OR road work with bridge cost share >= 50%
        # b) Item must be structural component of bridge (STRUCTURAL_BRIDGE)
        # c) Hard blocked for DRAIN, CULVERT, RETAINING_WALL, REPAIR, ROAD_PAVEMENT, EARTHWORK
        is_bridge_work = estimate_metadata.get("is_bridge_work", False)
        bridge_share_pct = to_decimal(estimate_metadata.get("bridge_cost_share_pct", 0.0))
        struct_type = (structural_component_type or "GENERAL").upper()

        bridge_allowance_amount = Decimal("0.0")
        blocked_structural_types = ["DRAIN", "CULVERT", "RETAINING_WALL", "REPAIR", "ROAD_PAVEMENT", "EARTHWORK"]

        if struct_type in blocked_structural_types:
            trace["blocked_rules"].append({
                "rule_code": "BR-BRIDGE-03",
                "structural_type": struct_type,
                "reason": f"Statutory Block: General Note 10 strictly excludes {struct_type} from 3% bridge provisional allowance."
            })
        elif struct_type == "STRUCTURAL_BRIDGE":
            if is_bridge_work or bridge_share_pct >= Decimal("50.0"):
                bridge_allowance_amount = d_round(rate * Decimal("0.03"), 2)
                trace["applied_rules"].append({
                    "rule_code": "BR-BRIDGE-03",
                    "title": "Bridge Structural Component Provisional Allowance +3%",
                    "percentage": 3.0,
                    "amount": float(bridge_allowance_amount),
                    "note": "Verified: Eligible structural bridge component."
                })
            else:
                trace["blocked_rules"].append({
                    "rule_code": "BR-BRIDGE-03",
                    "reason": f"Blocked: Road work bridge cost share ({bridge_share_pct}%) is below statutory 50% threshold."
                })

        # Sum total allowance per unit
        percentage_allowance_amount = d_round(rate * (total_allowance_pct / Decimal("100.0")), 2)
        total_unit_allowance = percentage_allowance_amount + night_allowance_amount + bridge_allowance_amount

        trace["total_unit_allowance"] = float(total_unit_allowance)
        trace["effective_unit_rate"] = float(rate + total_unit_allowance)

        return {
            "unit_allowance": total_unit_allowance,
            "effective_rate": rate + total_unit_allowance,
            "trace": trace
        }

    @classmethod
    def calculate_estimate_line(
        cls,
        item: Any,
        quantity: float,
        lead_km: float,
        lift_meters: float,
        structural_component_type: str,
        estimate_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes end-to-end line item calculation with full deterministic trace.
        """
        qty = to_decimal(quantity)
        base_rate = to_decimal(item.basic_rate)

        # Allowances
        allowance_res = cls.evaluate_allowances(
            item_code=item.unique_code,
            category=item.category,
            basic_rate=float(base_rate),
            structural_component_type=structural_component_type,
            estimate_metadata=estimate_metadata
        )

        effective_rate = allowance_res["effective_rate"]
        line_total = d_round(qty * effective_rate, 2)

        calculation_trace = {
            "item_code": item.unique_code,
            "description": item.description,
            "unit": item.unit_canonical,
            "quantity": float(qty),
            "basic_rate": float(base_rate),
            "lead_km": lead_km,
            "lift_meters": lift_meters,
            "structural_type": structural_component_type,
            "allowance_details": allowance_res["trace"],
            "effective_rate": float(effective_rate),
            "line_total": float(line_total)
        }

        return {
            "basic_rate_snapshot": float(base_rate),
            "allowance_rate_snapshot": float(allowance_res["unit_allowance"]),
            "effective_rate": float(effective_rate),
            "line_total": float(line_total),
            "calculation_trace_json": json.dumps(calculation_trace)
        }

    @staticmethod
    def calculate_estimate_totals(lines: List[Dict[str, Any]], gst_rate_pct: float = 18.0) -> Dict[str, float]:
        """
        Aggregates lines into basic, allowance, GST and grand total deterministically.
        """
        total_basic = Decimal("0.0")
        total_allowance = Decimal("0.0")
        grand_line_total = Decimal("0.0")

        for ln in lines:
            qty = to_decimal(ln.get("quantity", 0.0))
            base_r = to_decimal(ln.get("basic_rate_snapshot", 0.0))
            allow_r = to_decimal(ln.get("allowance_rate_snapshot", 0.0))

            total_basic += d_round(qty * base_r, 2)
            total_allowance += d_round(qty * allow_r, 2)
            grand_line_total += to_decimal(ln.get("line_total", 0.0))

        subtotal = total_basic + total_allowance
        gst_pct = to_decimal(gst_rate_pct)
        total_gst = d_round(subtotal * (gst_pct / Decimal("100.0")), 2)
        grand_total = d_round(subtotal + total_gst, 2)

        return {
            "total_basic_amount": float(d_round(total_basic, 2)),
            "total_allowance_amount": float(d_round(total_allowance, 2)),
            "total_tax_amount": float(d_round(total_gst, 2)),
            "grand_total": float(grand_total)
        }

    @classmethod
    def calculate_rate_item(cls, req: Any, item: Optional[Any] = None) -> Dict[str, Any]:
        """
        Authoritative calculator for individual rate lines across all 10 engineering modes.
        Enforces 100% Python Decimal precision, statutory guardrails, and provenance tracking.
        """
        calc_id = f"CALC-{uuid.uuid4().hex[:8].upper()}"
        mode = (req.calculation_mode or "WORK").upper()
        warnings: List[str] = []
        assumptions: List[str] = []
        applied_rules: List[Dict[str, Any]] = []
        excluded_rules: List[Dict[str, Any]] = []
        unit_conversions: Dict[str, Any] = {}

        # 1. Negative quantity validation (Hard Gate)
        raw_qty = getattr(req, "quantity", 1.0)
        if raw_qty < 0:
            return {
                "calculation_id": calc_id,
                "sor_version": "SOR-2026-27-V1",
                "item_code": getattr(req, "item_code", None),
                "item_description": item.description if item else None,
                "official_unit": item.unit_canonical if item else "UNIT",
                "source_rate": float(item.basic_rate) if item else 0.0,
                "input_quantity": float(raw_qty),
                "unit_conversions": {},
                "base_formula": "REJECTED: Quantity < 0",
                "base_amount": 0.0,
                "applied_rules": [],
                "excluded_rules": [],
                "total_adjustments": 0.0,
                "tax_treatment": {"tax_percentage": 0.0, "tax_amount": 0.0, "is_separate": True},
                "final_amount": 0.0,
                "source_reference": {},
                "validation_status": "INVALID",
                "warnings": ["Negative quantity rejected. Engineering calculations must have quantity >= 0."],
                "assumptions": [],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            }

        # 2. Missing rate handling (QUANTITY and CONVEYANCE modes can operate geometrically / via Table-I slabs)
        if not item and mode not in ["QUANTITY", "CONVEYANCE"]:
            return {
                "calculation_id": calc_id,
                "sor_version": "SOR-2026-27-V1",
                "item_code": getattr(req, "item_code", None),
                "item_description": "Unknown / Unverified Item",
                "official_unit": "UNIT",
                "source_rate": 0.0,
                "input_quantity": float(raw_qty),
                "unit_conversions": {},
                "base_formula": "UNAVAILABLE",
                "base_amount": 0.0,
                "applied_rules": [],
                "excluded_rules": [],
                "total_adjustments": 0.0,
                "tax_treatment": {"tax_percentage": 0.0, "tax_amount": 0.0, "is_separate": True},
                "final_amount": 0.0,
                "source_reference": {},
                "validation_status": "REQUIRES_VERIFICATION",
                "warnings": [f"Item rate for code '{getattr(req, 'item_code', None)}' requires verification or is not found in master catalogue."],
                "assumptions": [],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            }

        basic_rate = to_decimal(item.basic_rate if item else 0.0)
        qty = to_decimal(raw_qty)
        base_amount = Decimal("0.0")
        base_formula = ""
        official_unit = item.unit_canonical if item else (getattr(req, "unit", None) or "UNIT")
        item_code = item.unique_code if item else getattr(req, "item_code", None)
        item_desc = item.description if item else "Geometric Engineering Calculation"

        # Source provenance
        source_ref = {
            "annexure": item.annexure_code if item else "GENERAL_NOTES",
            "printed_page": item.source_printed_page if item else 1,
            "pdf_page": item.source_pdf_page if item else 8,
            "document_version": "SOR-2026-27-V1",
            "effective_date": "2026-11-13"
        }

        # 3. Calculation execution by mode
        if mode == "MATERIAL":
            # Formula A: Basic Material Cost = Quantity × Applicable Material Rate
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} {official_unit} × ₹{basic_rate}"
            assumptions.append("No additional incidental or loading charges automatically applied.")

        elif mode == "LABOUR":
            # Formula B: Basic Labour Cost = Number of Workers × Eligible Days × Applicable Daily Rate
            workers = getattr(req, "workers_count", None) or 1
            days = to_decimal(getattr(req, "days_count", None) or qty)
            base_amount = d_round(Decimal(str(workers)) * days * basic_rate, 2)
            base_formula = f"{workers} workers × {days} days × ₹{basic_rate}/day"

            # Night Work check (+25% strictly on Labour with tender clause)
            if getattr(req, "is_night_work", False):
                night_clause = getattr(req, "tender_night_clause", None)
                if night_clause:
                    night_add = d_round(base_amount * Decimal("0.25"), 2)
                    applied_rules.append({
                        "rule_code": "BR-NIGHT-25",
                        "name": "Night Work Allowance (+25% Labour Only)",
                        "percentage": 25.0,
                        "amount": float(night_add),
                        "citation": "Highways Annexure-I Clause 3(b)",
                        "tender_clause": night_clause
                    })
                else:
                    excluded_rules.append({
                        "rule_code": "BR-NIGHT-25",
                        "name": "Night Work Allowance (+25%)",
                        "reason": "Not applied: Mandatory tender specification clause verifying night operations was not provided."
                    })
                    warnings.append("Night-work allowance (+25%): Not applied unless eligibility is verified with an explicit tender clause.")

        elif mode == "WORK":
            # Formula C: Work Cost = Measured Quantity × Applicable Work Item Rate
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} {official_unit} × ₹{basic_rate}"

            # Corporation allowance check
            corp_type = getattr(req, "corporation_type", "NONE")
            if corp_type in ["CHENNAI_32KM", "MADURAI_CBE_HOSUR"]:
                corp_amt = d_round(base_amount * Decimal("0.10"), 2)
                applied_rules.append({
                    "rule_code": "BR-CORP-10",
                    "name": "Municipal Corporation Tier-1 (+10%)",
                    "percentage": 10.0,
                    "amount": float(corp_amt),
                    "citation": "General Note 1 & 2"
                })
            elif corp_type == "OTHER_CORP":
                corp_amt = d_round(base_amount * Decimal("0.05"), 2)
                applied_rules.append({
                    "rule_code": "BR-CORP-05",
                    "name": "Municipal Corporation Tier-2 (+5%)",
                    "percentage": 5.0,
                    "amount": float(corp_amt),
                    "citation": "General Note 2"
                })

            # Bridge 3% provisional allowance check
            struct_type = (getattr(req, "structural_type", None) or "ROADWAY").upper()
            is_bridge = getattr(req, "is_bridge_work", False)
            bridge_share = to_decimal(getattr(req, "bridge_cost_share_pct", 0.0))

            if struct_type in ["DRAIN", "CULVERT", "RETAINING_WALL", "REPAIR"]:
                excluded_rules.append({
                    "rule_code": "BR-BRIDGE-03",
                    "name": "Bridge 3% Provisional Allowance",
                    "reason": f"Statutory Block: General Note 10 explicitly excludes {struct_type} from 3% bridge provisional allowance."
                })
                warnings.append(f"General Note 10: 3% bridge provisional allowance strictly excludes {struct_type}.")
            elif struct_type == "STRUCTURAL_BRIDGE":
                if is_bridge or bridge_share >= Decimal("50.0"):
                    br_amt = d_round(base_amount * Decimal("0.03"), 2)
                    applied_rules.append({
                        "rule_code": "BR-BRIDGE-03",
                        "name": "Bridge 3% Provisional Allowance",
                        "percentage": 3.0,
                        "amount": float(br_amt),
                        "citation": "General Note 10"
                    })
                else:
                    excluded_rules.append({
                        "rule_code": "BR-BRIDGE-03",
                        "name": "Bridge 3% Provisional Allowance",
                        "reason": f"Bridge cost share ({bridge_share}%) is under the statutory 50% threshold for road works."
                    })

        elif mode == "EQUIPMENT":
            # Formula D: Equipment Cost = Eligible Duration × Applicable Hire Rate
            duration = to_decimal(getattr(req, "duration_hours", None) or qty)
            base_amount = d_round(duration * basic_rate, 2)
            base_formula = f"{duration} hours × ₹{basic_rate}/hour"
            assumptions.append("Hire charges include operator, fuel, and standard consumable oils unless specified.")

        elif mode == "ROAD_FURNITURE":
            # Formula E: Cost = Quantity × Applicable Item Rate
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} {official_unit} × ₹{basic_rate}"

        elif mode == "SURVEY_DPR":
            # Survey & DPR: Quantity (km) × Rate
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} km × ₹{basic_rate}/km"

        elif mode == "PLANTATION":
            # Avenue plantation: Quantity × Rate
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} {official_unit} × ₹{basic_rate}"

        elif mode == "QUANTITY":
            # Engineering Quantity Geometric Engine
            length_m = to_decimal(getattr(req, "length_m", None) or Decimal("0.0"))
            width_m = to_decimal(getattr(req, "width_m", None) or Decimal("0.0"))
            thickness_mm = to_decimal(getattr(req, "thickness_mm", None) or Decimal("0.0"))

            if length_m > 0 and width_m > 0 and thickness_mm > 0:
                # Thickness in metres
                thick_m = thickness_mm / Decimal("1000.0")
                geom_volume = d_round(length_m * width_m * thick_m, 3)
                unit_conversions = {
                    "length_m": float(length_m),
                    "width_m": float(width_m),
                    "thickness_mm": float(thickness_mm),
                    "thickness_converted_m": float(thick_m),
                    "calculated_volume_cum": float(geom_volume)
                }
                base_formula = f"{length_m} m × {width_m} m × {thick_m} m = {geom_volume} m³"
                official_unit = "CUM"
                qty = geom_volume

                if basic_rate > 0:
                    base_amount = d_round(geom_volume * basic_rate, 2)
                else:
                    base_amount = geom_volume

                warnings.append(f"Geometric volume: {geom_volume} m³. Do not automatically treat this as approved material procurement quantity or billable quantity.")
            elif length_m > 0 and width_m > 0:
                geom_area = d_round(length_m * width_m, 2)
                unit_conversions = {
                    "length_m": float(length_m),
                    "width_m": float(width_m),
                    "calculated_area_sqm": float(geom_area)
                }
                base_formula = f"{length_m} m × {width_m} m = {geom_area} m²"
                official_unit = "SQM"
                qty = geom_area
                if basic_rate > 0:
                    base_amount = d_round(geom_area * basic_rate, 2)
                else:
                    base_amount = geom_area
            else:
                base_amount = d_round(qty * basic_rate, 2)
                base_formula = f"{qty} {official_unit} × ₹{basic_rate}"

        elif mode == "CONVEYANCE":
            # Table-I Conveyance & Head Load Slabs
            lead_km = to_decimal(getattr(req, "lead_km", 0.0) or Decimal("0.0"))
            lift_m = to_decimal(getattr(req, "lift_m", 0.0) or Decimal("0.0"))
            terrain = (getattr(req, "terrain", "PLAINS") or "PLAINS").upper()

            if lead_km <= 0 and lift_m <= 0:
                warnings.append("Lead distance and lift height are zero; no conveyance charge admissible.")
                base_amount = Decimal("0.0")
                base_formula = "Lead 0 km (No Conveyance)"
            else:
                conv_rate = Decimal("0.0")
                # 1st km initial slab
                if lead_km > 0:
                    if lead_km <= Decimal("1.0"):
                        conv_rate += Decimal("140.00")
                    elif lead_km <= Decimal("20.0"):
                        conv_rate += Decimal("140.00") + ((lead_km - Decimal("1.0")) * Decimal("18.50"))
                    else:
                        conv_rate += Decimal("140.00") + (Decimal("19.0") * Decimal("18.50")) + ((lead_km - Decimal("20.0")) * Decimal("15.20"))

                # Head load lift > 2.0m: Rs 13.00 / cum per 1m lift
                if lift_m > Decimal("2.0"):
                    extra_lift = lift_m - Decimal("2.0")
                    lift_rate = extra_lift * Decimal("13.00")
                    conv_rate += lift_rate
                    applied_rules.append({
                        "rule_code": "C-0003",
                        "name": "Head Load Extra Lift (>2m)",
                        "extra_meters": float(extra_lift),
                        "amount": float(d_round(lift_rate * qty, 2))
                    })

                # Hills transport extra (General Note 4: +20%)
                if terrain == "HILLS":
                    hills_add = d_round(conv_rate * Decimal("0.20"), 2)
                    conv_rate += hills_add
                    applied_rules.append({
                        "rule_code": "GN-HILL-20",
                        "name": "Ghat Road / Hill Transport Addition (+20%)",
                        "percentage": 20.0,
                        "amount": float(d_round(hills_add * qty, 2))
                    })

                conv_rate = d_round(conv_rate, 2)
                base_amount = d_round(qty * conv_rate, 2)
                base_formula = f"{qty} cum × ₹{conv_rate}/cum (Lead: {lead_km} km, Lift: {lift_m} m)"

        else:
            base_amount = d_round(qty * basic_rate, 2)
            base_formula = f"{qty} {official_unit} × ₹{basic_rate}"

        # 4. Total adjustments
        total_adj = sum(to_decimal(r["amount"]) for r in applied_rules)

        # 5. Tax separation (18% GST where authorized)
        apply_tax = getattr(req, "apply_tax", False)
        tax_pct = to_decimal(getattr(req, "tax_percentage", 18.0) or Decimal("18.0"))
        subtotal = base_amount + total_adj

        if apply_tax:
            tax_amount = d_round(subtotal * (tax_pct / Decimal("100.0")), 2)
            final_amount = subtotal + tax_amount
            tax_treatment = {
                "tax_percentage": float(tax_pct),
                "tax_amount": float(tax_amount),
                "is_separate": True,
                "note": "GST 18% applied separately on post-allowance subtotal."
            }
        else:
            tax_amount = Decimal("0.0")
            final_amount = subtotal
            tax_treatment = {
                "tax_percentage": 0.0,
                "tax_amount": 0.0,
                "is_separate": True,
                "note": "Tax: Separately determined if applicable. Basic rates are strictly GST exclusive."
            }

        # 6. Validation status determination
        val_status = "VALID"
        if len(warnings) > 0:
            val_status = "VALID_WITH_WARNINGS"

        return {
            "calculation_id": calc_id,
            "sor_version": "SOR-2026-27-V1",
            "item_code": item_code,
            "item_description": item_desc,
            "official_unit": official_unit,
            "source_rate": float(basic_rate),
            "input_quantity": float(qty),
            "unit_conversions": unit_conversions,
            "base_formula": base_formula,
            "base_amount": float(base_amount),
            "applied_rules": applied_rules,
            "excluded_rules": excluded_rules,
            "total_adjustments": float(total_adj),
            "tax_treatment": tax_treatment,
            "final_amount": float(final_amount),
            "source_reference": source_ref,
            "validation_status": val_status,
            "warnings": warnings,
            "assumptions": assumptions,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }

    @classmethod
    def calculate_rate_batch(
        cls,
        lines_req: List[Any],
        get_item_fn: Any,
        session_id: Optional[str] = None,
        title: str = "Rate Calculation Sheet",
        project_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes multi-item batch calculation, aggregating basic amounts, adjustments, taxes, and grand totals.
        """
        sess_id = session_id or f"SESS-{uuid.uuid4().hex[:8].upper()}"
        calculated_lines: List[Dict[str, Any]] = []
        total_basic = Decimal("0.0")
        total_adj = Decimal("0.0")
        total_tax = Decimal("0.0")
        total_grand = Decimal("0.0")
        total_warnings = 0
        overall_status = "VALID"

        # Check for duplicate line codes
        seen_codes: Dict[str, int] = {}

        for req in lines_req:
            code = getattr(req, "item_code", None)
            if code:
                seen_codes[code] = seen_codes.get(code, 0) + 1

            item = get_item_fn(code) if code else None
            res = cls.calculate_rate_item(req, item)

            if code and seen_codes[code] > 1:
                res["warnings"].append(f"Duplicate item warning: Item code '{code}' appears {seen_codes[code]} times in sheet.")
                if res["validation_status"] == "VALID":
                    res["validation_status"] = "VALID_WITH_WARNINGS"

            total_basic += to_decimal(res["base_amount"])
            total_adj += to_decimal(res["total_adjustments"])
            total_tax += to_decimal(res["tax_treatment"].get("tax_amount", 0.0))
            total_grand += to_decimal(res["final_amount"])
            total_warnings += len(res["warnings"])

            if res["validation_status"] == "INVALID":
                overall_status = "INVALID"
            elif res["validation_status"] in ["REQUIRES_VERIFICATION", "VALID_WITH_WARNINGS"] and overall_status != "INVALID":
                overall_status = res["validation_status"]

            calculated_lines.append(res)

        return {
            "session_id": sess_id,
            "sor_version": "SOR-2026-27-V1",
            "title": title,
            "project_id": project_id,
            "lines": calculated_lines,
            "total_basic_amount": float(d_round(total_basic, 2)),
            "total_adjustment_amount": float(d_round(total_adj, 2)),
            "total_tax_amount": float(d_round(total_tax, 2)),
            "grand_total_amount": float(d_round(total_grand, 2)),
            "validation_status": overall_status,
            "warnings_count": total_warnings,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
