# Tamil Nadu Highways Department — Dashboard Color Specification

### 🎨 1. Core Milestone Palette (Road Classifications)

| Road Type | UI Role Context | HEX Code | Tailwind Config Token | RGB Mapping Value |
| :--- | :--- | :--- | :--- | :--- |
| **State Highways (SH)** | Primary Brand / Main Actions | `#006A4E` | `tnh-sh` | `rgb(0, 106, 78)` |
| **National Highways (NH)** | Central Government Assets | `#FFCC00` | `tnh-nh` | `rgb(255, 204, 0)` |
| **Major District Roads (MDR)** | Regional Connectivity Data | `#004B87` | `tnh-mdr` | `rgb(0, 75, 135)` |
| **Other District Roads (ODR)** | Local Hub Linkages | `#D1197E` | `tnh-odr` | `rgb(209, 25, 126)` |
| **Rural & Village Roads** | Panchayats / Low-tier Data | `#FF6600` | `tnh-rural` | `rgb(255, 102, 0)` |

### 🗂️ 2. Component Utility Tints (For Backgrounds & Accents)

*   **State Highway (SH)**
    *   Light Badge / Active State Background: `#E6F4EA`
    *   Text on Light Tint: `#006A4E`
*   **National Highway (NH)**
    *   Light Badge / Accent Background: `#FFF9E6`
    *   Text on Light Tint (High Contrast): `#996600`
*   **Major District Roads (MDR)**
    *   Light Badge / Accent Background: `#E6F0F7`
    *   Text on Light Tint: `#004B87`
*   **Other District Roads (ODR)**
    *   Light Badge / Accent Background: `#FCE8F3`
    *   Text on Light Tint: `#D1197E`

### 📊 3. Array Matrix for Chart Libraries (Recharts, Chart.js, Canvas)

```javascript
const roadPalette = [
  '#006A4E', // State Highways (Green)
  '#FFCC00', // National Highways (Yellow)
  '#004B87', // Major District Roads (Blue)
  '#D1197E', // Other District Roads (Magenta)
  '#FF6600'  // Rural / Local Roads (Orange)
];
```
