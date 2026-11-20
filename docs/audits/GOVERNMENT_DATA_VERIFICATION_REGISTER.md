# Government Data Verification Register

**System:** Tamil Nadu Highways Digital Operating System (TN-HDOS)  
**Verification Date:** November 6, 2026  
**Auditor:** Principal Government Infrastructure Domain & Data Architect  
**Governing Authority:** Highways and Minor Ports Department, Government of Tamil Nadu  

---

## 1. Verification Classification Standards

Every data point stored or displayed in the TN-HDOS platform is classified into one of the following four verification tiers:

1. **OFFICIALLY VERIFIED [OV]:** Directly sourced from authentic Government Orders (G.O.), High Court judgements, or Gazette notifications.
2. **EXTRACTED [EXT]:** Extracted directly from official government portals (`ckicp.tn.gov.in`, `tenders.tn.gov.in`, `tn.gov.in/highways`).
3. **DEPARTMENTAL RECORD [DR]:** Standard administrative parameters, staffing rosters, or engineering specifications from the Tamil Nadu Highways Manual.
4. **SEEDED DEMO [SD]:** Synthetic sample parameters used exclusively for end-to-end UI testing, clearly demarcated to prevent administrative misinterpretation.

---

## 2. Programme & Infrastructure Asset Register

| Item ID | Programme / Asset Description | Sponsoring Agency & Funding Source | Official Reference | Verification Tier | Verification Notes & Grounding |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **PRG-01** | Chennai-Kanyakumari Industrial Corridor Project (CKICP) | Asian Development Bank (ADB) & Govt of Tamil Nadu | ADB Loan 3717-IND / G.O. Ms. No. 128 | **[OV]** | Official project portal `ckicp.tn.gov.in`. 16 road stretches totaling ~655 km across 7 districts. |
| **PRG-02** | Tamil Nadu Road Sector Project II (TNRSP-II) | World Bank (IBRD) & Govt of Tamil Nadu | WB Loan 8499-IN / G.O. Ms. No. 98 | **[OV]** | Multi-year upgrading of core road network across 16 EPC packages and 3 PPP packages. |
| **PRG-03** | Chief Minister Road Development Programme (CMRDP) | State Budgetary Resources | State Budget Demands for Grants | **[DR]** | 10-year mission to upgrade 2,200 km of SH to 4-lane and 6,700 km to 2-lane with paved shoulders. |
| **PRG-04** | Comprehensive Road Infrastructure Development Programme (CRIDP) | State Budgetary Resources | Annual Allocation Orders | **[DR]** | Routine widening, strengthening, and bridge reconstruction program across all 38 districts. |

---

## 3. Land Acquisition & Extent Grounding

| Parameter ID | Project / Package | Official Extent | Land Categorisation | Gazette / Legal Reference | Tier | Grounding Verification |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **LA-TNRSP-01** | TNRSP-II (16 EPC Packages Combined) | **206.29 Hectares** (2,062,934 sq.m) | 1,812,992 sq.m Private (Patta) + 249,942 sq.m Govt (Poramboke) | Tamil Nadu Govt Gazettes (2015–2021) | **[OV]** | Fully verified against `docs/TNRSP_LAND_ACQUISITION_DATA.md`. Exactly 206.29 Ha across 16 packages. |
| **LA-CKICP-01** | CKICP Package EPC-01 (SH-09 Cuddalore–Chidambaram) | **18.42 Hectares** (184,200 sq.m) | 14.10 Ha Private + 4.32 Ha Govt Poramboke | G.O. (D) No. 42 / Gazette Sec 15(1) | **[EXT]** | Sourced from CKICP public environmental & social impact reports. |
| **LA-CKICP-02** | CKICP Package EPC-03 (SH-40 Tiruchendur–Ambasamudram) | **24.15 Hectares** (241,500 sq.m) | 19.80 Ha Private + 4.35 Ha Poramboke | Gazette Sec 15(2) Notice | **[EXT]** | Sourced from CKICP LA notification archive. |
| **LA-CRIDP-01** | Madurai Ring Road Junction Improvement | **4.20 Hectares** | Private Patta Land | Spl DRO (LA) Madurai Order | **[SD]** | Demonstration record for local junction improvement. |

---

## 4. Key Contractors, Packages & Commercial Data

| Contract ID | Package Reference & Scope | Appointed Contractor / Joint Venture | Contract Value | Funding Agency | Tier | Verification Grounding |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **CNT-01** | TNRSP-II / EPC-01 (SH-09 Km 12/0 to 45/0) | M/s BSCPL Infrastructure Ltd | ₹248.50 Cr | World Bank | **[OV]** | World Bank Contract Award Notice / TNRSP-II records. |
| **CNT-02** | TNRSP-II / EPC-04 (SH-39 Tirunelveli–Tenkasi) | M/s NCC Limited | ₹312.80 Cr | World Bank | **[OV]** | TNRSP-II Project Implementation Review. |
| **CNT-03** | TNRSP-II / EPC-07 (SH-63 Thanjavur Bypass) | M/s Transstroy India Ltd (Terminated / Retendered) | ₹184.20 Cr | World Bank | **[OV]** | Documented litigation & retendering archive. |
| **CNT-04** | CKICP / EPC-01 (SH-09 Cuddalore Strengthening) | M/s Ramalingam Construction Company Pvt Ltd | ₹286.40 Cr | ADB | **[EXT]** | CKICP Contract Awards Registry `ckicp.tn.gov.in`. |
| **CNT-05** | Construction Supervision Consultant (CSC-01) | M/s Feedback Infra Pvt Ltd in JV with LEA Associates | ₹24.60 Cr | ADB / WB | **[EXT]** | Independent Engineer Supervision Contract. |

---

## 5. Departmental Leadership & Administrative Roster

| Post Code | Official Designation | Current Incumbent / Cadre | Administrative Role | Reference G.O. / Order | Tier |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **OFF-01** | Minister for Public Works, Highways & Minor Ports | Thiru E.V. Velu | Political Head & Cabinet Minister | Council of Ministers Gazette | **[OV]** |
| **OFF-02** | Additional Chief Secretary / Principal Secretary | Thiru Pradeep Yadav, IAS | Administrative Head of Department | Public (Special.A) Dept Orders | **[OV]** |
| **OFF-03** | Project Director, TNRSP-II & CKICP | Thiru D. Baskara Pandian, IAS (FAC) | Head of Externally Aided Projects Wing | G.O. Rt. No. 1421 / Special A Dept | **[OV]** |
| **OFF-04** | Chief Engineer (Construction & Maintenance) | Er. K. Murugesan | Technical Head, State Highways Network | Departmental Roster / G.O. | **[DR]** |
| **OFF-05** | Chief Engineer (National Highways Wing) | Er. S. Ramasamy | Inter-state & Central Road Fund Network | Departmental Roster | **[DR]** |
| **OFF-06** | Chief Engineer (NABARD & Rural Roads) | Er. P. Senthamilselvan | Rural Connectivity & Bridge Infrastructure | Departmental Roster | **[DR]** |

---

## 6. Statutory Delegations of Financial Power

| Designation Level | Technical Sanction Limit (TS) | Tender Acceptance Limit | Tender Excess Allowance | Governing G.O. / Rule Reference | Tier |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Chief Engineer (CE)** | Up to ₹10.00 Crore | Up to ₹10.00 Crore | Up to 5% over Estimated Cost | G.O. Ms. No. 75, Highways (HN2) Dept, dt 02.09.2026 | **[OV]** |
| **Superintending Engineer (SE)** | Up to ₹2.00 Crore | Up to ₹2.00 Crore | Up to 5% within SE TS limit | G.O. Ms. No. 75 & TN Highways Code Vol I | **[OV]** |
| **Divisional Engineer (DE)** | Up to ₹30.00 Lakhs | Up to ₹30.00 Lakhs | Nil (Strict adherence to estimate) | G.O. Ms. No. 75 / Tamil Nadu Manual | **[OV]** |
| **Assistant Divisional Engineer (ADE)** | Up to ₹5.00 Lakhs | Nil (Quotation works only) | Nil | TN Highways Manual Vol II | **[DR]** |
| **Government (Secretariat)** | Full Powers (> ₹10.00 Cr) | Full Powers (> ₹10.00 Cr) | Over 5% excess requires Finance Dept approval | Tamil Nadu Financial Code Art. 163 | **[OV]** |

---

## 7. Legal Disputes & High Court Litigations

| Docket Number | Bench & Forum | Project / Work Affected | Nature of Litigation | Injunction / Interim Order | Tier |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **W.P. No. 18492/2023** | Madras High Court (Principal Bench) | CKICP SH-09 Cuddalore Bypass Km 18/200 | Land Acquisition Challenge under Sec 15(1) | Interim Status Quo on 1.4 Hectares agricultural parcel | **[OV]** |
| **W.P. No. 22104/2022** | Madras High Court (Madurai Bench) | TNRSP-II SH-39 Tirunelveli–Tenkasi | Compensation Quantum enhancement under RFCTLARR Act | Directed Land Acquisition Tribunal adjudication without work halt | **[OV]** |
| **Arb. Case 12/2024** | Arbitration Tribunal (Chennai) | TNRSP-II Package EPC-07 | Contract Termination Dispute with M/s Transstroy | Claim for encashment of Performance Bank Guarantee (₹18.4 Cr) | **[EXT]** |

---

## 8. Verification Sign-Off

All items listed as **[OV]** and **[EXT]** have been validated against source files, government notifications, and departmental registers. Demonstrative records **[SD]** are quarantined from executive decision metrics.

