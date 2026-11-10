import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export type AlertType = 'critical' | 'warning' | 'info' | 'success';

interface ProjectAlertProps {
  type?: AlertType;
  title: string;
  message?: string | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  className?: string;
}

export const ProjectAlert: React.FC<ProjectAlertProps> = ({
  type = 'info',
  title,
  message,
  action,
  onClose,
  className = '',
}) => {
  const configs = {
    critical: {
      container: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: AlertOctagon,
      iconColor: 'text-[#DC2626]',
      btn: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    },
    warning: {
      container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
      icon: AlertTriangle,
      iconColor: 'text-[#D97706]',
      btn: 'bg-[#D97706] text-white hover:bg-[#B45309]',
    },
    info: {
      container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]',
      icon: Info,
      iconColor: 'text-[#2563EB]',
      btn: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
    },
    success: {
      container: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
      icon: CheckCircle2,
      iconColor: 'text-[#15803D]',
      btn: 'bg-[#15803D] text-white hover:bg-[#166534]',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 flex items-start justify-between gap-3 shadow-2xs ${config.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div>
          <div className="text-xs sm:text-sm font-bold tracking-tight">{title}</div>
          {message && <div className="text-xs mt-1 leading-relaxed opacity-90">{message}</div>}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2.5 px-3 py-1 rounded-md text-xs font-semibold shadow-2xs transition-colors ${config.btn}`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

