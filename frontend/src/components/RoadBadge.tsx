import React from 'react';
import { RoadType } from '../types';

interface RoadBadgeProps {
  type: RoadType | string;
  code?: string;
  showCode?: boolean;
}

export const RoadBadge: React.FC<RoadBadgeProps> = ({ type, code, showCode = true }) => {
  const normType = (type || 'SH').toUpperCase() as RoadType;

  const styleMap: Record<RoadType, { label: string; bg: string; text: string; border: string }> = {
    SH: {
      label: 'State Highway',
      bg: 'bg-[#E6F4EA]',
      text: 'text-[#006A4E]',
      border: 'border-[#B2DFCD]'
    },
    NH: {
      label: 'National Highway',
      bg: 'bg-[#FFF9E6]',
      text: 'text-[#996600]',
      border: 'border-[#FFE680]'
    },
    MDR: {
      label: 'Major District Road',
      bg: 'bg-[#E6F0F7]',
      text: 'text-[#004B87]',
      border: 'border-[#B3CFE5]'
    },
    ODR: {
      label: 'Other District Road',
      bg: 'bg-[#FCE8F3]',
      text: 'text-[#D1197E]',
      border: 'border-[#F2B3D6]'
    },
    RURAL: {
      label: 'Rural Road',
      bg: 'bg-[#FFF3EB]',
      text: 'text-[#FF6600]',
      border: 'border-[#FFCCB3]'
    }
  };

  const current = styleMap[normType] || styleMap.SH;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
      title={`${current.label} (TN Highways Specification)`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{normType}</span>
      {showCode && code && <span className="opacity-90 font-mono">({code})</span>}
    </span>
  );
};

