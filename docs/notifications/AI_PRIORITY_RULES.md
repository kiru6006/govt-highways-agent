# TN-HDOS Deterministic AI Scoring & Priority Ranking Rules

## 1. Principles of Explainable Government AI
To eliminate hallucination and ungrounded escalation, the TN-HDOS Priority Scoring Engine calculates an explainable score between $0.0$ and $100.0$ points using deterministic mathematical rules.

> **"No AI module within TN-HDOS shall escalate an event to CRITICAL without mathematical grounding and verified primary evidence citation."**

---

## 2. Mathematical Scoring Formula

The total priority score $S$ is calculated as:
$$S = \min\left(W_{\text{sev}} + W_{\text{dead}} + W_{\text{crit}} + W_{\text{fin}} + B_{\text{stat}} + B_{\text{esc}}, 100.0\right)$$

### 2.1 Component Breakdown

#### A. Severity Weight ($W_{\text{sev}}$) — Maximum 30 Points
- `CRITICAL`: 30.0 points
- `HIGH`: 22.0 points
- `MEDIUM`: 14.0 points
- `LOW`: 6.0 points
- `INFO`: 2.0 points

#### B. Deadline Proximity ($W_{\text{dead}}$) — Maximum 25 Points
Where $D$ is the number of calendar days remaining until the approved milestone or statutory deadline:
- $D < 0$ (Overdue): 25.0 points
- $0 \le D \le 2$ days: 22.0 points
- $3 \le D \le 5$ days: 16.0 points
- $6 \le D \le 14$ days: 10.0 points
- $D > 14$ days / Unset: 4.0 points

#### C. Project Criticality ($W_{\text{crit}}$) — Maximum 20 Points
- `CRITICAL` (CKICP / Multilateral Tranche / High Traffic Gateway): 20.0 points
- `HIGH` (State Highway 4-Laning / Major Ring Road): 15.0 points
- `MEDIUM` (Major District Road / Bridge Reconstruction): 10.0 points
- `LOW` (Other District Road / Minor Junction Improvement): 5.0 points

#### D. Financial Exposure ($W_{\text{fin}}$) — Maximum 15 Points
Where $E$ is the audited financial exposure in Crore Rupees:
- $E > ₹25.0\text{ Cr}$: 15.0 points
- $₹5.0\text{ Cr} < E \le ₹25.0\text{ Cr}$: 10.0 points
- $₹1.0\text{ Cr} < E \le ₹5.0\text{ Cr}$: 6.0 points
- $E \le ₹1.0\text{ Cr}$: 2.0 points

#### E. Statutory & Escalation Boosts ($B_{\text{stat}}, B_{\text{esc}}$) — Maximum 10 Points
- Has statutory basis (High Court order, Gazette land notice, IRC safety standard): $+5.0$ points
- Has been formally escalated by reporting engineer or Chief Engineer: $+5.0$ points

---

## 3. Threshold for "Your Priority Briefing"
- Items scoring $S \ge 65.0$ points or possessing a verified `CRITICAL` flag are automatically promoted to the **Your Priority Briefing** intelligence panel.
- Each promoted briefing must generate:
  1. `why_important`: Root operational reason.
  2. `potential_impact`: Financial or schedule risk quantification.
  3. `required_action`: Next statutory action step.
  4. `evidence_source`: Exact document or measurement book reference.
  5. `confidence_score`: Verification percentage ($\ge 90\%$).

