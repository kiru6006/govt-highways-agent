# Tamil Nadu Highways Department: Unverified Information & Data Conflict Register

**Document Reference**: TN-HDOS-UNVERIF-01  
**Purpose**: Rigorous auditing of ambiguous, conflicting, or unverified secondary data points  
**Compliance Rule**: Never convert secondary reports into confirmed official facts  
**Status**: ACTIVE AUDIT & RESOLUTION MATRIX

---

## 1. Conflicting Information & Data Ambiguities Matrix

| S.No | Data Item / Domain | Conflicting Values / Problem Description | Source Origin | Potential Impact | System Accommodation & Resolution Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **G.O.Ms.No.43 Reorganisation Effective Date** | Restructuring announced on **13.03.2026**; however, transition circulars mention phased absorption from **01.04.2026** (FY 2026-27). Exact physical transfer of legacy NABARD and Projects division records is ongoing. | Secondary news reports vs Departmental circulars | Incorrect assignment of legacy project files to new zonal circles | **Effective-Dated Hierarchy**: Implement `effective_from` and `effective_to` on all Circles and Divisions. Keep legacy structures accessible for audit of historic vouchers. |
| 2 | **NH-42 Reversed Chainage** | Reported as **Km 407.000 to Km 388.000** (decreasing chainage over 19.000 km length). | MoRTH raw notification schedule | Linear referencing calculations and automated GIS chainage slips | **Dual Chainage Modeling**: Raw field chainage preserved as official statutory marker; GIS calculations mapped using normalized coordinates with `is_decreasing_chainage = True`. |
| 3 | **Package EPC01 Length & Cost Typographical Corruption** | Raw document printed `48.482*` with an asterisk and fragmented cost line. SH-116 and SH-58 presented as separate sub-records. Chainage typo printed `Km 14/300 to Km 6/700`. | World Bank raw progress printouts | Data integrity failure if summed directly without validation | **Mathematical Reconstruction**: Reconstructed verified package agreement value at **₹184.98 Cr** and verified chainage as **Km 14/300 to Km 36/700** (22.4 km). Sum verified to match exactly ₹1,704.91 Cr total. |
| 4 | **Commissionerate of Tenders (COT) Overlapping Thresholds** | G.O. Ms. No. 75 lists thresholds for ₹1.00 Cr to ₹6.00 Cr and above ₹6.00 Cr that appear ambiguous in summary tables. | Summary extracts of G.O. Ms. No. 75 | Tender acceptance by un-empowered Chief Engineers | **Clarified Statutory Rule**: Individual works under ₹6.00 Cr tendered **at or below estimate rate** are approved by CE. Any tender with **excess** or above ₹6.00 Cr must receive COT approval. |
| 5 | **Acting Charges (`A/C` and `FAC`) vs Substantive Posts** | Several Chief Engineers and Project Directors hold concurrent charge (e.g. Er. S. Palanivel in Coimbatore; Er. S. Yamini in TNRSP-II; Er. R. Vimala in CKICP). | Transfer Gazette Orders | Improper derivation of permanent post eligibility or confusion over dual jurisdiction | **Explicit Posting Type Modeling**: Database uses `posting_type` enum (`REGULAR`, `ADDITIONAL_CHARGE`, `FULL_ADDITIONAL_CHARGE`). An officer with `A/C` is permitted operational management but statutory committee voting reflects their substantive post. |
| 6 | **TNRIDC Associated Undertaking Relationship** | Secondary prompts occasionally treat TNRIDC, TNMB, Poompuhar, and TNRDC as internal wings of Highways Department. | General administrative references | Mixing sovereign departmental engineering cadres with corporate company boards | **Separate Corporate Entity Modeling**: Modeled as distinct Government Companies / Statutory Boards under Companies Act / Special Acts, with separate Board of Directors headed by the Secretary as CMD. |
| 7 | **Land Acquisition Progress vs Physical Possession** | Land acquisition quantities (2,062,934 sq.m) provided in reports do not automatically imply physical possession of land. | TNRSP-II project reports | Premature contractor work orders on encumbered private parcels | **Statutory Stage Gating**: TN-HDOS tracks Section 15(2) Notice, Section 15(1) Gazette, Section 19(1) Award, Solatium Payment, and Physical Possession as distinct verified milestones. |

---

## 2. Unverified Items Pending Original Gazette Order Verification

The following items are designated as `[TO VALIDATE]` and will not be hardcoded as binding rules until original Gazette text is uploaded:
1. Exact gazetted division counts for the restructured Metropolitan and Projects circles under G.O.Ms.No.43.
2. Current official email addresses for newly formed subdivisions in rural circles.
3. Specific revised solatium disbursement percentages under the 2026 RASC-LA procedural amendments.
