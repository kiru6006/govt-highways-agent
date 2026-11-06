# TNRSP-II Land Acquisition Dataset: Official Validation & Anomaly Report

**Project**: Tamil Nadu Road Sector Project II (TNRSP-II)  
**Assistance**: World Bank Loan Assistance  
**Directorate**: Project Director, TNRSP-II, Guindy, Chennai  
**Statutory Acquisition Act**: Tamil Nadu Highways Act, 2001 (TN Act 34 of 2002) read with RFCTLARR Act 2013  
**Status**: VALIDATED WITH PACKAGE ANOMALIES & PARCEL SPLITS FLAGGED

---

## 1. Land Acquisition Master Dataset by Package

| Package Code | Road / SH Stretch Name | Private Land (sq.m) | Government Land (sq.m) | Total Land (sq.m) | District Jurisdiction | Data Validation Status & Anomaly Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EPC01** | Kancheepuram - Vandavasi (SH-116) | 14,812 | 750 | 15,562 | Tiruvannamalai, Kancheepuram | `[VERIFIED]` Chainage Km 14/300 to 36/700 |
| **EPC01 (SH-58)** | Sadras - Chengalpattu - Kancheepuram - Arakkonam - Thiruthani (SH-58) | 40,874 | 35,343 | 76,217 | Chengalpattu, Kancheepuram | `[ANOMALY FLAGGED]` Listed as separate sub-component in source |
| **EPC02** | Arcot - Villupuram (SH-04) | 78,864 | 4,247 | 83,111 | Tiruvannamalai, Villupuram | `[VERIFIED]` Km 29/800 to 110/165 & 113/325 to 114/600 |
| **EPC03** | Cuddalore - Chittoor (SH-09) & link road to SH-37 | 152,184 | 9,014 | 161,198 | Villupuram, Kallakurichi | `[VERIFIED]` Km 38/000 to 66/450 |
| **EPC04** | Vridhachalam - Parangipettai (SH-70) | 49,299 | 11,136 | 60,435 | Cuddalore | `[VERIFIED]` Km 0/000 to 35/800 |
| **EPC05** | Omalur - Sankari - Thiruchengode - Paramathy (SH-86) | 37,679 | 4,028 | 41,707 | Namakkal, Salem | `[VERIFIED]` Km 81/000 to 107/200 |
| **EPC06** | Malliyakarai - Rasipuram - Thiruchengode - Erode (SH-79) | 82,402 | 13,505 | 95,907 | Salem, Namakkal, Erode | `[VERIFIED]` Km 71/200 to 121/725 |
| **EPC07** | Mohanur - Namakkal - Senthamangalam - Rasipuram (SH-95) | 1,870 | 1,561 | 3,431 | Namakkal | `[VERIFIED]` Km 0/000 to 13/385 |
| **EPC08** | Nanguneri - Bharatavaram - Ovari (SH-89) up to ECR | 164,696 | 52,007 | 216,703 | Tirunelveli | `[VERIFIED]` Km 0/000 to 35/200 |
| **EPC09** | Paruvakudi - Kovilpatti - Ettayapuram - Vilathikulam - Vembar (SH-44) | 26,070 | 5,400 | 31,470 | Thoothukudi, Virudhunagar, Tenkasi | `[VERIFIED]` Km 22/900 to 54/550 |
| **EPC10** | Rajapalayam - Sankarankoil - Tirunelveli (SH-41) | 45,858 | 18,589 | 64,447 | Tirunelveli, Tenkasi, Virudhunagar | `[VERIFIED]` Km 1/800 to 77/000 |
| **EPC11** | Omalur - Mecheri (SH-222) | 65,284 | 9,893 | 75,177 | Salem | `[VERIFIED]` Km 1/150 to 14/300 |
| **EPC12** | Malliyakarai - Attur (SH-30) | 22,108 | 3,201 | 25,309 | Salem | `[VERIFIED]` Km 81/125 to 91/200 |
| **EPC13** | Chithode - Erode (SH-15) | 11,137 | 1,119 | 12,256 | Erode | `[VERIFIED]` Km 153/500 to 161/625 |
| **PPP01 / EPC16** | Gobi - Erode (SH-15) | 102,102 | 8,144 | 110,246 | Erode | `[VERIFIED]` Km 123/000 to 153/600 (Converted from PPP) |
| **PPP02** | Oddanchatram - Dharapuram - Tiruppur (SH-37) | 716,334 | 46,354 | 762,688 | Tiruppur, Dindigul | `[VERIFIED]` 70.2 km corridor (Largest LA footprint) |
| **PPP03 / EPC14 & 15** | Tirunelveli - Sengottai - Kollam (SH-39) | 201,419 | 25,651 | 227,070 | Tirunelveli, Tenkasi | `[VERIFIED]` Converted into EPC14 (Pkg I) & EPC15 (Pkg II) |
| **GRAND TOTAL** | **TNRSP-II Infrastructure Footprint** | **1,812,992 sq.m** | **249,942 sq.m** | **2,062,934 sq.m** | **Statewide Land Parcels** | `[VERIFIED MATCH: 206.29 Hectares]` |

---

## 2. Source Anomalies & Data Reconciliation

### Anomaly 1: Package EPC01 and SH-58 Double Listing
- In the primary World Bank project documents, **EPC01** is titled *"Upgrading Kancheepuram - Vandavasi Road (SH-116) and Sadras - Chengalpattu - Kancheepuram - Arakkonam - Thiruthani Road (SH-58)"*.
- In several raw tables, SH-116 and SH-58 are presented as two consecutive rows, each with distinct land acquisition figures (SH-116: 14,812 sq.m private; SH-58: 40,874 sq.m private).
- **Reconciliation**:
  - Combined private land for EPC01 contract is:
    $$14,812 \text{ sq.m} + 40,874 \text{ sq.m} = 55,686 \text{ sq.m}$$
  - Combined government land for EPC01 contract is:
    $$750 \text{ sq.m} + 35,343 \text{ sq.m} = 36,093 \text{ sq.m}$$
  - Total EPC01 package land footprint is **91,779 sq.m**.

### Anomaly 2: Typographical Chainage Error in Source Document for SH-116
- One source line printed: *"Km 14/300 - Km 6/700"* which is mathematically impossible for an increasing chainage stretch of 22.4 km.
- **Correction**: The verified chainage confirmed from G.O. and contract award is **Km 14/300 to Km 36/700** (a total length of 22.400 km).

### Anomaly 3: Conversion of PPP Packages into EPC Works
- **PPP01** was originally tendered as a Public-Private Partnership Annuity concession, but terminated and re-bid as **EPC16** (Gobi - Erode, ₹272.53 Cr).
- **PPP03** was bifurcated into two separate EPC packages:
  - **EPC14**: Tirunelveli - Sengottai Pkg I (km 5/0 to 27/7, ₹176.58 Cr).
  - **EPC15**: Tirunelveli - Sengottai Pkg II (km 27/7 to 50/6, ₹254.13 Cr).
- In the TN-HDOS database, the land acquisition parcels remain tied to the underlying road survey numbers and are mapped to the active execution packages (`EPC14`, `EPC15`, `EPC16`).
