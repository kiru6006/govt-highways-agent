# Tamil Nadu Highways Department: National Highway Inventory Validation Report

**Wing**: National Highways Wing, Highways Department, Government of Tamil Nadu  
**Head of Wing**: Er. K. Vanathi, Chief Engineer (H), National Highways  
**Governing Agency**: Ministry of Road Transport and Highways (MoRTH), Government of India  
**Entrusted Network Length**: 797.562 km  
**Status**: VALIDATED WITH CHAINAGE REVERSAL ANOMALY FLAGGED

---

## 1. Entrusted National Highways Inventory (State PWD Maintenance)

Under formal entrustment orders issued by MoRTH under Section 5 of the National Highways Act 1956, the State Highways Department exercises executive and maintenance control over 11 key National Highway stretches across Tamil Nadu.

| S.No | Old NH No | New NH No | Name of Section / Corridor | From Km | To Km | Verified Length (Km) | Maintenance Division Jurisdiction | Data Validation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **67** | **181** | Coimbatore - Mettupalayam - Ooty - Gudalur - TN/KNT Border | 0.000 | 171.400 | **171.400** | Coimbatore (NH) & Ooty (NH) Divisions | `[VERIFIED OFFICIAL]` |
| 2 | **207** | **648** | Sarjapur - Bagalur Road | 124.890 | 143.000 | **18.110** | Hosur (NH) Division | `[VERIFIED OFFICIAL]` |
| 3 | **-** | **179A** | Salem - Uthangarai - Tirupathur - Vaniyambadi Road | 0.000 | 125.000 | **125.000** | Salem (NH) & Vaniyambadi (NH) Divisions | `[VERIFIED OFFICIAL]` |
| 4 | **210** | **336** | Trichy - Karaikudi - Devakottai - Ramanathapuram Section | 33.609 | 44.009 | **10.400** | Trichy (NH) Division | `[VERIFIED OFFICIAL]` |
| 5 | **219** | **42** | Krishnagiri - Kuppam Road | **407.000** | **388.000** | **19.000** | Krishnagiri (NH) Division | `[VERIFIED OFFICIAL - ANOMALY FLAGGED]` *(Reversed Chainage)* |
| 6 | **234** | **75** | Pernambut (TN-KA border) - Gudiyattam - Vellore Road | 0.000 | 60.600 | **60.600** | Vellore (NH) Division | `[VERIFIED OFFICIAL]` |
| 7 | **234** | **38** | Vellore - Polur - Tiruvannamalai - Villupuram Section | 0.000 | 142.000 | **142.000** | Tiruvannamalai (NH) & Villupuram (NH) | `[VERIFIED OFFICIAL]` |
| 8 | **-** | **381** | Avinashi - Tiruppur - Avinashipalayam Road | 0.000 | 31.800 | **31.800** | Tiruppur (NH) Division | `[VERIFIED OFFICIAL]` |
| 9 | **-** | **381A** | Vellakoil - Sankagiri Road | 0.000 | 68.900 | **68.900** | Erode (NH) Division | `[VERIFIED OFFICIAL]` |
| 10 | **-** | **381B** | Musiri - Thottiyam - Namakkal Road | 34.000 | 73.200 | **39.200** | Namakkal (NH) Division | `[VERIFIED OFFICIAL]` |
| 11 | **-** | **532** | Cuddalore - Vridhachalam - Salem Road | 0.000 | 111.152 | **111.152** | Cuddalore (NH) & Salem (NH) Divisions | `[VERIFIED OFFICIAL]` |
| **TOTAL** | | | **State PWD Entrusted National Highways** | | | **797.562 Km** | **11 National Highway Stretches** | `[VERIFIED OFFICIAL - 797.562 KM MATCH]` |

---

## 2. Technical Validation & Data Anomaly Report

### Anomaly 1: Reversed Chainage on NH-42 (Item 5)
- **Reported Chainage**: From km `407.000` to km `388.000` (Total: `19.000` km).
- **Physical Analysis**: The chainage numbering on old NH-219 / new NH-42 was originally marked starting from Andhra Pradesh / Karnataka towards Krishnagiri in decreasing chainage.
- **System Handling Rule**:
  - The database preserves the raw statutory chainage marker (`km 407/0 to km 388/0`) as the official milestone reference.
  - In GIS / asset indexing, the linear reference is normalized with `start_chainage = 388.000` and `end_chainage = 407.000` with an inverted direction flag (`is_decreasing_chainage = True`).

### Anomaly 2: Multi-Division Jurisdiction Over Single Corridors
- Stretches such as **NH-181 (171.400 km)** cross both the plain industrial corridor in Coimbatore district and severe Western Ghats topography in Nilgiris district (Mettupalayam, Coonoor, Ooty, Gudalur up to Kakkanallah Karnataka border).
- **System Rule**: Stretches cannot be assigned to a single Division ID. Each corridor is split into sub-stretches linked to the respective field Division (e.g. Coimbatore NH Division: km 0/0 to km 36/0; Nilgiris NH Division: km 36/0 to km 171/4).
