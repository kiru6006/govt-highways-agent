import React from 'react';

export type CardAccentColor = 'yellow' | 'charcoal' | 'blue' | 'green' | 'amber' | 'red' | 'none';

interface HighwaysCardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;
  unit?: string;
  icon?: React.ElementType;
  accent?: CardAccentColor;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const HighwaysCard: React.FC<HighwaysCardProps> = ({
  title,
  subtitle,
  value,
  unit,
  icon: Icon,
  accent = 'none',
  onClick,
  className = '',
  children,
  badge,
  badgeColor,
}) => {
  const accentClasses: Record<CardAccentColor, string> = {
    yellow: 'border-t-3 border-t-[#FACC15]',
    charcoal: 'border-t-3 border-t-[#20242B]',
    blue: 'border-t-3 border-t-[#2563EB]',
    green: 'border-t-3 border-t-[#15803D]',
    amber: 'border-t-3 border-t-[#D97706]',
    red: 'border-t-3 border-t-[#DC2626]',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      } ${accentClasses[accent]} ${className}`}
    >
      {(title || Icon || badge) && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 truncate">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                <Icon className="w-4 h-4" />
              </div>
            )}
            {title && (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 truncate">
                {title}
              </span>
            )}
          </div>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {value !== undefined && (
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>
      )}

      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}

      {children}
    </div>
  );
};

