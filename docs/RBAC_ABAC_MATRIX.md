# Tamil Nadu Highways Department: RBAC & ABAC Access Control Matrix

**System**: Tamil Nadu Highways Digital Operating System (TN-HDOS)  
**Security Framework**: Attribute-Based Access Control (ABAC) with Dynamic Jurisdiction Scoping  
**Statutory Basis**: Tamil Nadu Government Business Rules & Financial Delegation Orders  
**Status**: APPROVED SECURITY ARCHITECTURE

---

## 1. Access Control Dimensions

Access to records in TN-HDOS is calculated as a function of multiple attributes:

$$\text{Access Granted} = f(\text{Role}, \text{Jurisdiction}, \text{Data Classification}, \text{Delegated Power}, \text{Action Type})$$

```
                                  PERMISSION DIMENSIONS
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ 1. IDENTITY & CADRE      │ 2. JURISDICTION      │ 3. RECORD CLASSIFICATION  │
    ├──────────────────────────┼──────────────────────┼───────────────────────────┤
    │ • Minister (Cabinet)     │ • Statewide          │ • Public / General        │
    │ • Principal Secy (IAS)   │ • Regional Zone      │ • Operational / Works     │
    │ • DG / CE (TN-HES)       │ • Circle             │ • Confidential Vigilance  │
    │ • SE / DE / ADE / AE     │ • Division           │ • Legal / High Court Writ │
    │ • Contractor (External)  │ • Subdivision        │ • AG Audit Paras          │
    │ • Consultant (External)  │ • Contract Package   │ • Financial LC Balances   │
    └──────────────────────────┴──────────────────────┴───────────────────────────┘
```

---

## 2. Comprehensive Action Matrix

The platform supports 13 discrete actions evaluated independently:

| Action Code | Action Name | Required Authority Level | Examples in Highways Operations |
| :--- | :--- | :--- | :--- |
| `ACT_VIEW` | View | General Jurisdiction | Inspect project progress, road geometry, public tenders |
| `ACT_CREATE` | Create | Field Engineer / Desk | Draft road register, initiate variation order, log field defect |
| `ACT_EDIT` | Edit | Originating Author | Update draft DPR text, modify measurement book entry before submission |
| `ACT_SUBMIT` | Submit | Assigned Officer | Submit tender evaluation to COT; submit check-measurement |
| `ACT_RECOMMEND` | Recommend | Supervisory Officer | SE recommends time extension to CE; TAC recommends bridge design |
| `ACT_VERIFY` | Verify | Independent Engineer / HRS | Verify core compressive test strength; verify weighbridge bitumen logs |
| `ACT_APPROVE` | Approve | Empowered Officer | DE accepts tender up to ₹50L; CE accords TS up to ₹25 Cr |
| `ACT_REJECT` | Reject | Empowered Officer | Reject substandard concrete batch; reject unverified time extension |
| `ACT_FORWARD` | Forward | Intermediate Desk | Forward RASC proposal to Secretariat; forward GAD to Southern Railway |
| `ACT_RETURN` | Return for Correction | Scrutinizing Authority | Return DPR for missing geotechnical borelog; return incomplete RA bill |
| `ACT_PUBLISH` | Publish | Competent Tender Authority | Publish e-tender notice on TNTIT portal; publish gazette Sec 15(1) notification |
| `ACT_EXPORT` | Export | Authorized Senior Officer | Export statewide IFMS financial dossier; export audit para report |
| `ACT_ARCHIVE` | Archive | System Admin / Records Desk | Seal completed project passport; archive 5-year maintenance records |

---

## 3. Role vs. Classification Permission Grid

| Role Code | Public Works | Financial Bills & LC | Quality Test NCRs | Confidential Vigilance & Bitumen Diffs | Legal Writ Petitions | AG Audit Paras | Ministerial Directives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MINISTER** | View, Direct | View (Strategic) | View (Strategic) | View (Summary) | View (Impact) | View (Summary) | **Create, Authorize** |
| **PRIN_SEC** | View, Direct | **Approve (LC Release)**| View, Order Audit | **View, Order 17(a)** | **View, Defend** | **View, Mandate ATR**| Forward to Minister |
| **DIR_GEN** | View, Recommend | View, Recommend | **Order Audit (HRS)**| View, Investigate | View, Instruct | View, Reply | Review |
| **CHIEF_ENG** | **Approve TS** | Approve RA Bills | Review, Direct Fix | Scoped to Region | Scoped to Region | Scoped to Region | Comply |
| **DIV_ENG (H)**| **Approve TA (&lt;50L)**| Check & Disburse | Field Rectification | Scoped to Division | Scoped to Division | Scoped to Division | Comply |
| **CONTRACTOR**| Submit Milestones | View Own RA Bills | Submit QC Certs | ❌ **FORBIDDEN (403)** | ❌ **FORBIDDEN (403)** | ❌ **FORBIDDEN (403)**| ❌ **FORBIDDEN (403)** |
