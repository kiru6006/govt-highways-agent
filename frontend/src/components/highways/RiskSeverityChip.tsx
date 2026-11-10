import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export type RiskSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'ON_TRACK'
  | 'COMPLETED'
  | 'UNKNOWN'
  | 'REVIEW_REQUIRED'
  | string;

interface RiskSeverityChipProps {
  severity?: RiskSeverity;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const RiskSeverityChip: React.FC<RiskSeverityChipProps> = ({
  severity = 'UNKNOWN',
  label,
  className = '',
  compact = false,
}) => {
  const norm = (severity || '').toUpperCase().trim();

  if (norm === 'CRITICAL' || norm.includes('CRIT') || norm === 'BLOCKER') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] ${className}`}
        title="Critical risk: immediate senior escalation required"
      >
        <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626] flex-shrink-0" />
        <span>{label || 'CRITICAL'}</span>
      </span>
    );
  }

  if (norm === 'HIGH' || norm === 'AT_RISK') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] ${className}`}
        title="High risk: significant delay or active obstacle"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
        <span>{label || 'HIGH'}</span>
      </span>
    );
  }

  if (norm === 'MEDIUM' || norm === 'OBSERVATION') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] ${className}`}
        title="Medium risk: under monitoring"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
        <span>{label || 'MEDIUM'}</span>
      </span>
    );
  }

  if (norm === 'LOW') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] ${className}`}
        title="Low risk"
      >
        <Info className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
        <span>{label || 'LOW'}</span>
      </span>
    );
  }

  if (norm === 'ON_TRACK' || norm === 'COMPLETED' || norm === 'RESOLVED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] ${className}`}
        title="On track: verified progressing to schedule"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
        <span>{label || (norm === 'COMPLETED' ? 'COMPLETED' : 'ON TRACK')}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] ${className}`}
      title="Status unknown or review required"
    >
      <HelpCircle className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
      <span>{label || (compact ? 'UNKNOWN' : 'REVIEW REQUIRED')}</span>
    </span>
  );
};

