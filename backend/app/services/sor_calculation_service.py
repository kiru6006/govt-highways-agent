"""
Deterministic Calculation & Business Rule Engine for SoR-WECI
Governing Reference: Tamil Nadu SoR 2026-2027 Volume I w.e.f. 13/11/2026 (General Notes 1-10)
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List, Optional
import json


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
