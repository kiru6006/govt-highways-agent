/**
 * TN-HDOS Design System Tokens (Stage 1 Architecture from docs/DESIGN.md)
 */

export const LAYER_A_SHELL = {
  shellBg: '#0F2A4A',
  shellFg: '#FFFFFF',
  shellActiveIndicator: '#FFFFFF',
  shellBtnPrimaryBg: '#0F2A4A',
  shellBtnPrimaryFg: '#FFFFFF',
  surfacePage: '#F4F7FB',
  surfaceCard: '#FFFFFF',
  borderDefault: '#DCE4ED',
  textPrimary: '#1F2937',
  textSecondary: '#5B6678',
  focusRing: '#1D4ED8',
} as const;

export const LAYER_B_ENTITY = {
  entityBadgeBg: '#E5E8ED',
  entityBadgeFg: '#3F4756',
} as const;

export const LAYER_C_STATUS = {
  onTrack: { fg: '#0F6B4A', bg: '#E3F4EC', solid: '#1E9E6B' },
  underObservation: { fg: '#14578F', bg: '#E2EFFA', solid: '#1F78C8' },
  atRisk: { fg: '#7A4B00', bg: '#FFF1CC', solid: '#B07A00' },
  delayed: { fg: '#8F3A00', bg: '#FFE6D2', solid: '#E8650A' },
  critical: { fg: '#9B1C1C', bg: '#FDE3E3', solid: '#D32F2F' },
  completed: { fg: '#0B4F36', bg: '#CFEBDD', solid: '#15704D' },
  onHold: { fg: '#3F4756', bg: '#E5E8ED', solid: '#6B7280' },
  pendingApproval: { fg: '#5B2DB0', bg: '#EDE5FB', solid: '#7C4DDB' },
} as const;

export const LAYER_ROAD_LEGEND = {
  nationalHighway: { color: '#111827', line: '5px solid' },
  expressway: { color: '#111827', line: '5px solid + centre white dash' },
  stateHighway: { color: '#4338CA', line: '4px solid' },
  majorDistrictRoad: { color: '#0E7490', line: '3px solid' },
  otherDistrictRoad: { color: '#92400E', line: '2.5px dashed' },
  villageRoad: { color: '#6B7280', line: '2px dotted' },
  urbanCorporation: { color: '#BE185D', line: '2px dash-dot' },
} as const;

