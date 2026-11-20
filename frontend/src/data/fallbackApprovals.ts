import { SoRApprovalTaskItem, SoRDelegationRuleItem, AIInvestigateFindingResponse } from '../types';

export const FALLBACK_APPROVAL_TASKS: SoRApprovalTaskItem[] = [
  {
    id: "TASK-2026-001",
    task_code: "TASK-2026-001",
    project_id: 1,
    entity_type: "ESTIMATE",
    entity_id: "EST-2026-SLM-001",
    title: "Technical Sanction Scrutiny for Salem Bypass Widening",
    description: "Detailed estimate ₹1.31 Cr requires statutory Technical Sanction by Superintending Engineer per G.O. (Ms) No. 11.",
    amount_involved_cr: 1.31,
    delegation_tier: "SE",
    delegation_statute: "G.O.(Ms) No. 11 dt 21.01.2022",
    required_role: "Superintending Engineer",
    submitted_by: "DE Salem (C&M)",
    status: "PENDING",
    created_at: "2026-11-14T09:30:00Z"
  },
  {
    id: "TASK-2026-002",
    task_code: "TASK-2026-002",
    project_id: 2,
    entity_type: "VARIATION",
    entity_id: "VAR-2026-001",
    title: "Quantity Variation Scrutiny on Item W-1001 (+470 Cum)",
    description: "Chainage km 14/200-14/800 soft subgrade remediation resulting in +470 Cum excess over BOQ schedule.",
    amount_involved_cr: 0.39,
    delegation_tier: "DE",
    delegation_statute: "G.O.(Ms) No. 11 dt 21.01.2022",
    required_role: "Divisional Engineer",
    submitted_by: "AEE Technical Scrutiny Cell",
    status: "PENDING",
    created_at: "2026-11-15T11:15:00Z"
  },
  {
    id: "TASK-2026-003",
    task_code: "TASK-2026-003",
    project_id: 3,
    entity_type: "RATE_EXCEPTION",
    entity_id: "EXC-2026-003",
    title: "Tender Excess Acceptance at +4.8% on Madurai Ring Road",
    description: "Lowest responsive bidder quoted +4.8% tender excess over sanctioned technical estimate. Sanctionable by SE under G.O. 29 (cap 5%).",
    amount_involved_cr: 0.88,
    delegation_tier: "SE",
    delegation_statute: "G.O.(Ms) No. 29 dt 03.03.2022",
    required_role: "Superintending Engineer",
    submitted_by: "DE Madurai (C&M)",
    status: "PENDING",
    created_at: "2026-11-16T14:45:00Z"
  },
  {
    id: "TASK-2026-004",
    task_code: "TASK-2026-004",
    project_id: 4,
    entity_type: "BILL_VOUCHER",
    entity_id: "BILL-2026-VCH-88",
    title: "Interim Payment Certificate CC-04 Clearance",
    description: "4th Running Account Bill passed with lab compliance certificate for MORTH Section 500 Bituminous Concrete.",
    amount_involved_cr: 2.15,
    delegation_tier: "SE",
    delegation_statute: "G.O.(Ms) No. 11 dt 21.01.2022",
    required_role: "Superintending Engineer",
    submitted_by: "AEE Field Subdivision",
    status: "APPROVED",
    decision_notes: "QC lab test reports verified. 28-day core test density 98.6% compliant. Sanctioned.",
    decided_by: "SE Trichy Circle",
    decided_at: "2026-11-17T16:20:00Z",
    created_at: "2026-11-16T10:00:00Z"
  }
];

export const FALLBACK_DELEGATION_RULES: SoRDelegationRuleItem[] = [
  {
    id: "DEL-TS-DE",
    rule_code: "DEL-TS-DE",
    statute_reference: "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
    delegation_category: "TECHNICAL_SANCTION",
    officer_cadre: "Divisional Engineer (DE)",
    monetary_limit_cr: 0.50,
    percentage_excess_limit: 0.0,
    jurisdiction_scope: "Division Jurisdiction",
    mandatory_conditions: "Full powers up to ₹50.00 Lakhs for road and bridge works strictly based on approved Schedule of Rates without excess.",
    is_active: true
  },
  {
    id: "DEL-TS-SE",
    rule_code: "DEL-TS-SE",
    statute_reference: "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
    delegation_category: "TECHNICAL_SANCTION",
    officer_cadre: "Superintending Engineer (SE)",
    monetary_limit_cr: 7.00,
    percentage_excess_limit: 0.0,
    jurisdiction_scope: "Circle Jurisdiction",
    mandatory_conditions: "Full powers up to ₹7.00 Crores for original and revised estimates with proper AEE quarry lead investigation certificates.",
    is_active: true
  },
  {
    id: "DEL-TS-CE",
    rule_code: "DEL-TS-CE",
    statute_reference: "G.O.(Ms) No. 11, Highways (HN.2), dt 21.01.2022",
    delegation_category: "TECHNICAL_SANCTION",
    officer_cadre: "Chief Engineer (CE)",
    monetary_limit_cr: 100.00,
    percentage_excess_limit: 0.0,
    jurisdiction_scope: "Zonal / Wing Statewide",
    mandatory_conditions: "Full powers above ₹7.00 Crores for all capital and maintenance works across State Highways and Major District Roads.",
    is_active: true
  },
  {
    id: "DEL-TA-DE",
    rule_code: "DEL-TA-DE",
    statute_reference: "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
    delegation_category: "TENDER_ACCEPTANCE",
    officer_cadre: "Divisional Engineer (DE)",
    monetary_limit_cr: 0.50,
    percentage_excess_limit: 0.0,
    jurisdiction_scope: "Division Jurisdiction",
    mandatory_conditions: "Tender acceptance up to ₹50.00 Lakhs at 0% tender excess over sanctioned technical estimate.",
    is_active: true
  },
  {
    id: "DEL-TA-SE",
    rule_code: "DEL-TA-SE",
    statute_reference: "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
    delegation_category: "TENDER_ACCEPTANCE",
    officer_cadre: "Superintending Engineer (SE)",
    monetary_limit_cr: 1.00,
    percentage_excess_limit: 5.0,
    jurisdiction_scope: "Circle Jurisdiction",
    mandatory_conditions: "Tender acceptance up to ₹1.00 Crore with tender excess not exceeding 5% over technical estimate.",
    is_active: true
  },
  {
    id: "DEL-TA-COT",
    rule_code: "DEL-TA-COT",
    statute_reference: "G.O.(Ms) No. 29 dt 03.03.2022 restoring G.O.(Ms) No. 163 dt 01.10.2012",
    delegation_category: "TENDER_ACCEPTANCE",
    officer_cadre: "Committee of Chief Engineers (COT)",
    monetary_limit_cr: 100.00,
    percentage_excess_limit: 10.0,
    jurisdiction_scope: "Statewide Highways Department",
    mandatory_conditions: "Full powers up to ₹100.00 Crores with tender excess not exceeding 10% over estimate following market justification.",
    is_active: true
  }
];

export const FALLBACK_AI_INVESTIGATION_SAMPLE: AIInvestigateFindingResponse = {
  is_ai_assisted: true,
  notice_badge: "AI-Assisted (Verify Before Approval)",
  investigation_summary: "Flagged bridge allowance deviation on item B-201. Under General Note 10, the 3% provisional allowance is strictly restricted to structural bridge deck, piers, and abutments where bridge component exceeds 50% of package cost. Drains and retaining walls are explicitly excluded.",
  probable_root_cause: "Inadvertent application of bridge percentage to roadside storm water drain or culvert item.",
  applicable_statute_citation: "General Note 10, Volume I (Printed Page 3 / PDF Page 10)",
  source_pdf_page: 10,
  printed_page: 3,
  recommended_remedial_action: "Revert non-structural item rate to 0% extra percentage and issue revised rate analysis sheet.",
  statutory_disclaimer: "This analysis is advisory and based on Tamil Nadu SoR 2026-2027 Volume I. Authoritative financial decisions remain governed by statutory delegation orders.",
  timestamp: "2026-11-19T23:55:00Z"
};
