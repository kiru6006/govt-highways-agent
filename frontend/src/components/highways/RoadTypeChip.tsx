import React from 'react';

export type RoadCategory = 'NH' | 'SH' | 'MDR' | 'ODR' | 'RURAL' | 'OTHER' | string;

interface RoadTypeChipProps {
  category?: RoadCategory;
  code?: string;
  className?: string;
}

export const RoadTypeChip: React.FC<RoadTypeChipProps> = ({ category = 'SH', code, className = '' }) => {
  const norm = (category || '').toUpperCase().trim();

  if (norm.includes('NH') || norm === 'NATIONAL HIGHWAY') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#20242B] text-[#FACC15] border border-slate-700 shadow-2xs ${className}`}
        title="National Highway"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
        <span>{code || 'NH'}</span>
      </span>
    );
  }

  if (norm.includes('SH') || norm === 'STATE HIGHWAY') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] ${className}`}
        title="State Highway"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
        <span>{code || 'SH'}</span>
      </span>
    );
  }

  if (norm.includes('MDR') || norm === 'MAJOR DISTRICT ROAD') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] ${className}`}
        title="Major District Road"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
        <span>{code || 'MDR'}</span>
      </span>
    );
  }

  if (norm.includes('ODR') || norm === 'OTHER DISTRICT ROAD') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] ${className}`}
        title="Other District Road"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
        <span>{code || 'ODR'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] ${className}`}
      title="Rural / Other Road"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
      <span>{code || category || 'VR'}</span>
    </span>
  );
};

