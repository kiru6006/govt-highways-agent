export interface BrandConfig {
  status: 'PROVISIONAL' | 'OFFICIAL_VERIFIED';
  departmentName: string;
  shortName: string;
  sourceDocCitation: string;
  lastAuditedDate: string;
}

export const brandConfig: BrandConfig = {
  status: 'PROVISIONAL',
  departmentName: 'Highways and Minor Ports Department, Government of Tamil Nadu',
  shortName: 'TN-HDOS',
  sourceDocCitation: 'docs/DESIGN.md (Provisional Layer A Government Shell)',
  lastAuditedDate: '2026-11-07',
};

