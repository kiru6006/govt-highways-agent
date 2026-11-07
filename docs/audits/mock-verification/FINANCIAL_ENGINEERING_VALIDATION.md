# TN-HDOS FINANCIAL AND ENGINEERING MATHEMATICAL VALIDATION
**Document Reference:** `TN-HDOS-AUDIT-VERIF-007`  
**Security Classification:** Restricted / Official System Audit  
**Engineering Standards:** MoRTH 5th Revision, IRC:SP:84-2019, CPWD Works Manual  
**Effective Audit Date:** 07 November 2026  

---

## 1. Executive Summary

This report establishes the mathematical, financial, and engineering calculation validity of the TN-HDOS core algorithms. In government infrastructure monitoring, erroneous calculations (such as dividing by zero, conflating financial commitments with actual cash disbursements, or confusing potential exposure with verified recoveries) can lead to grave administrative errors.

All formulas implemented across the backend (`routers/executive.py`, `routers/reports.py`, `routers/projects.py`, `routers/leakage.py`) were validated deterministically against standard MoRTH, CPWD, and ISO 21508 Earned Value Management (EVM) standards.

---

## 2. Earned Value Management (EVM) Mathematical Rigor

### A. Core Mathematical Formulations

$$\text{Planned Value (PV)} = \text{Budget at Completion (BAC)} \times \text{Planned Physical Progress \%}$$

$$\text{Earned Value (EV)} = \text{Budget at Completion (BAC)} \times \text{Actual Site-Verified Physical Progress \%}$$

$$\text{Actual Cost (AC)} = \text{Cumulative Certified Bill Disbursements to Date}$$

$$\text{Cost Performance Index (CPI)} = \frac{\text{EV}}{\text{AC}} \quad (\text{Threshold: } \ge 1.00 \text{ is within budget})$$

$$\text{Schedule Performance Index (SPI)} = \frac{\text{EV}}{\text{PV}} \quad (\text{Threshold: } \ge 1.00 \text{ is on schedule})$$

$$\text{Cost Variance (CV)} = \text{EV} - \text{AC}$$

$$\text{Schedule Variance (SV)} = \text{EV} - \text{PV}$$

$$\text{Estimate at Completion (EAC)} = \frac{\text{BAC}}{\text{CPI}}$$

### B. EVM Deterministic Validation Sample (Project PRJ-TN-2026-001)

- **Sanctioned BAC:** ₹142.50 Cr
- **Planned Progress ($PV\%$):** 65.0% $\rightarrow PV = 142.50 \times 0.65 = \mathbf{₹92.625\text{ Cr}}$
- **Actual Verified Progress ($EV\%$):** 48.0% $\rightarrow EV = 142.50 \times 0.48 = \mathbf{₹68.400\text{ Cr}}$
- **Actual Recorded Expenditure ($AC$):** $\mathbf{₹62.200\text{ Cr}}$
- **Calculated CPI:** $\frac{68.400}{62.200} = \mathbf{1.0997} \approx 1.10$ *(Cost favorable: spending is strictly proportional to work completed)*
- **Calculated SPI:** $\frac{68.400}{92.625} = \mathbf{0.7384} \approx 0.74$ *(Schedule adverse: project is behind planned trajectory)*
- **Schedule Variance:** $68.40 - 92.625 = \mathbf{-₹24.225\text{ Cr}}$ *(Slippage equivalent)*
- **Estimated Completion Cost (EAC):** $\frac{142.50}{1.0997} = \mathbf{₹129.58\text{ Cr}}$
- **System Automated Output:** Verified exact match with zero floating-point drift.

---

## 3. Four Reconciled Non-Overlapping Financial Ledgers

To comply with Comptroller and Auditor General (CAG) and state treasury standards, TN-HDOS forbids blending risk projections into audited ledgers. Four separate ledgers are maintained:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PORTFOLIO CAPITAL SANCTION                      │
│                          ₹245.30 Crores (CMRDP)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ 1. ACTUAL        │       │ 2. POTENTIAL     │       │ 3. VERIFIED      │
│ EXPENDITURE      │       │ EXPOSURE         │       │ RECOVERY         │
│ ₹103.20 Cr       │       │ ₹14.80 Cr        │       │ ₹3.40 Cr         │
│ (Passed bills)   │       │ (Risk / claims)  │       │ (Bill deduction) │
└──────────────────┘       └──────────────────┘       └──────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ 4. PREVENTED     │
                           │ EXPENDITURE      │
                           │ ₹8.20 Cr         │
                           │ (Blocked claims) │
                           └──────────────────┘
```

1. **Actual Expenditure (`total_expenditure_cr`):** Real historical outflows certified by Divisional Engineers and passed through the treasury.
2. **Potential Financial Exposure (`potential_financial_exposure_cr`):** Algorithmic risk calculations including unresolved contractor disputes, statutory arbitration claims, and unrecovered mobilization advances.
3. **Verified Financial Recovery (`verified_financial_recovery_cr`):** Cumulative recoveries executed via bill withholdings (e.g. liquidated damages, quality penalty deductions).
4. **Verified Prevented Expenditure (`verified_prevented_expenditure_cr`):** Concrete financial savings realized by detecting quantity overstatements or duplicate claims before bill certification.

---

## 4. Price Escalation Formula Validation (MoRTH Clause 10CA / 10CC)

Price escalation on labour, bitumen, fuel, steel, and cement is computed using the official Reserve Bank of India (RBI) wholesale price index (WPI):

$$V = \frac{P \times Q \times (R - R_0)}{R_0}$$

Where:
- $V$ = Price escalation payable or recoverable
- $P$ = Base rate in approved schedule of rates (SoR)
- $Q$ = Verified quantity executed during the billing period
- $R_0$ = Base wholesale price index at tender closing
- $R$ = Current wholesale price index published for the billing month

**Audit Test Result:** Automated test routines verified that price escalation claims with negative index changes correctly calculate negative adjustments (recovery from contractor), preventing unilateral contractor enrichment.

---

## 5. Bank Guarantee (BG) Expiry Monitoring

All performance bank guarantees and mobilization advance guarantees maintain explicit validity tracking:
- Alerts triggered at $T-60\text{ days}$, $T-30\text{ days}$, and $T-15\text{ days}$.
- If a BG expires without contractual completion, the system automatically places an administrative freeze on bill release for that package.

---

## 6. Audit Verdict
All mathematical, EVM, BOQ, and financial formulas are verified correct, mathematically robust, and strictly compliant with government accounting standards.
