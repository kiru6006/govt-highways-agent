import React from 'react';
import {
  TrainTrack,
  GitFork,
  Route,
  Wrench,
  Milestone,
  ShieldCheck,
  MapPin,
  Mountain,
  Landmark,
  Footprints,
  Layers,
  Component
} from 'lucide-react';

export type StandardWorkType =
  | 'ROB/RUB'
  | 'Road Widening'
  | 'Bypass'
  | 'Bridge/Culvert'
  | 'Maintenance/Renewal'
  | 'Corridor Improvement'
  | 'Junction Improvement'
  | 'Safety Work'
  | 'Land Acquisition Only'
  | 'Coastal/Hill Road'
  | 'Urban Flyover'
  | 'Pedestrian Facility'
  | 'Grade Separator'
  | 'General Road Work'
  | string;

interface WorkTypeConfig {
  label: string;
  icon: React.ElementType;
  className: string;
}

const WORK_TYPE_MAP: Record<string, WorkTypeConfig> = {
  'rob/rub': {
    label: 'ROB / RUB',
    icon: TrainTrack,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  'road widening': {
    label: 'Road Widening',
    icon: Route,
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  widening: {
    label: 'Road Widening',
    icon: Route,
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  bypass: {
    label: 'Bypass',
    icon: GitFork,
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'bridge/culvert': {
    label: 'Bridge / Culvert',
    icon: Landmark,
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  bridge: {
    label: 'Bridge / Culvert',
    icon: Landmark,
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  'maintenance/renewal': {
    label: 'Maintenance / Renewal',
    icon: Wrench,
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  maintenance: {
    label: 'Maintenance / Renewal',
    icon: Wrench,
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'corridor improvement': {
    label: 'Corridor Improvement',
    icon: Milestone,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'junction improvement': {
    label: 'Junction Improvement',
    icon: GitFork,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'safety work': {
    label: 'Safety Work',
    icon: ShieldCheck,
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  'land acquisition only': {
    label: 'Land Acquisition Only',
    icon: MapPin,
    className: 'bg-stone-100 text-stone-700 border-stone-300',
  },
  'coastal/hill road': {
    label: 'Coastal / Hill Road',
    icon: Mountain,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  'urban flyover': {
    label: 'Urban Flyover',
    icon: Layers,
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  'pedestrian facility': {
    label: 'Pedestrian Facility',
    icon: Footprints,
    className: 'bg-lime-50 text-lime-800 border-lime-200',
  },
  'grade separator': {
    label: 'Grade Separator',
    icon: Layers,
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  'general road work': {
    label: 'General Road Work',
    icon: Component,
    className: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

interface WorkTypeChipProps {
  type?: StandardWorkType;
  className?: string;
  showIcon?: boolean;
}

export const WorkTypeChip: React.FC<WorkTypeChipProps> = ({
  type = 'General Road Work',
  className = '',
  showIcon = true,
}) => {
  const norm = (type || '').toLowerCase().trim();
  const matched = Object.entries(WORK_TYPE_MAP).find(([key]) => norm.includes(key));
  const config = matched
    ? matched[1]
    : {
        label: type || 'General Work',
        icon: Component,
        className: 'bg-slate-50 text-slate-700 border-slate-200',
      };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${config.className} ${className}`}
      title={config.label}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{config.label}</span>
    </span>
  );
};

