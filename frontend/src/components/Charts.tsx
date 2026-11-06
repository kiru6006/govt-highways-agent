/**
 * Charts.tsx — Recharts wrapper components for TN-HDOS dashboards.
 * Used by Dashboard, Project360, ProgrammeIntelligence pages.
 */
import React from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';

// TN Government colour palette
const TN_COLOURS = {
  maroon: '#7B1C1C',
  gold: '#B8860B',
  green: '#006A4E',
  blue: '#1D4ED8',
  amber: '#D97706',
  red: '#DC2626',
  slate: '#475569',
  teal: '#0D9488',
};

// ─── Zone Comparison Bar Chart ───────────────────────────────────────────────
interface ZoneBarData {
  zone_name: string;
  completed_projects_pct: number;
  budget_utilisation_pct: number;
  contractor_performance_score: number;
  average_project_delay_days: number;
}
export const ZoneComparisonChart: React.FC<{ data: ZoneBarData[] }> = ({ data }) => {
  const shortName = (n: string) => n.replace(' Zone', '');
  const formatted = data.map(d => ({ ...d, zone_name: shortName(d.zone_name) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="zone_name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit="%" />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(val: any, name: any) => [`${val}${name === 'Avg Delay (d)' ? 'd' : '%'}`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="completed_projects_pct" name="Completed %" fill={TN_COLOURS.green} radius={[3, 3, 0, 0]} />
        <Bar dataKey="budget_utilisation_pct" name="Budget Used %" fill={TN_COLOURS.blue} radius={[3, 3, 0, 0]} />
        <Bar dataKey="contractor_performance_score" name="Contractor Score" fill={TN_COLOURS.gold} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Portfolio Stage Donut ───────────────────────────────────────────────────
interface PortfolioStage { stage: string; count: number; cost_cr: number; avg_progress_pct: number; }
const STAGE_COLOURS = [TN_COLOURS.maroon, TN_COLOURS.amber, TN_COLOURS.blue, TN_COLOURS.green, TN_COLOURS.teal, TN_COLOURS.slate];

export const PortfolioDonut: React.FC<{ data: PortfolioStage[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={data}
        dataKey="count"
        nameKey="stage"
        cx="50%"
        cy="50%"
        innerRadius={65}
        outerRadius={110}
        paddingAngle={3}
        label={(entry: any) => `${entry.stage || entry.name}: ${entry.count || entry.value}`}
        labelLine={false}
      >
        {data.map((_, i) => <Cell key={i} fill={STAGE_COLOURS[i % STAGE_COLOURS.length]} />)}
      </Pie>
      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
        formatter={(val: any, name: any) => [val, name]} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
    </PieChart>
  </ResponsiveContainer>
);

// ─── EVM Trend Line Chart ────────────────────────────────────────────────────
interface EVMPoint { month: string; pv_cr: number; ev_cr: number; ac_cr: number; }
export const EVMTrendChart: React.FC<{ data: EVMPoint[]; title?: string }> = ({ data, title }) => (
  <div>
    {title && <p className="text-xs font-semibold text-slate-600 mb-2">{title}</p>}
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TN_COLOURS.blue} stopOpacity={0.15} />
            <stop offset="95%" stopColor={TN_COLOURS.blue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TN_COLOURS.green} stopOpacity={0.15} />
            <stop offset="95%" stopColor={TN_COLOURS.green} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="acGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TN_COLOURS.red} stopOpacity={0.12} />
            <stop offset="95%" stopColor={TN_COLOURS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}Cr`} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(val: any, name: any) => [`₹${Number(val || 0).toFixed(1)} Cr`, name]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="pv_cr" name="Planned Value" stroke={TN_COLOURS.blue} fill="url(#pvGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="ev_cr" name="Earned Value" stroke={TN_COLOURS.green} fill="url(#evGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="ac_cr" name="Actual Cost" stroke={TN_COLOURS.red} fill="url(#acGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── Physical vs Financial Progress Bar ─────────────────────────────────────
interface ProgressBar { label: string; physical: number; financial: number; }
export const ProgressComparisonChart: React.FC<{ data: ProgressBar[]; height?: number }> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
      <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} width={58} />
      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
        formatter={(val: any, name: any) => [`${val}%`, name]} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey="physical" name="Physical %" fill={TN_COLOURS.green} radius={[0, 3, 3, 0]} />
      <Bar dataKey="financial" name="Financial %" fill={TN_COLOURS.blue} radius={[0, 3, 3, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Radar: Contractor Performance ──────────────────────────────────────────
interface ContractorRadarProps {
  data: { metric: string; score: number; benchmark: number }[];
  contractorName: string;
}
export const ContractorRadarChart: React.FC<ContractorRadarProps> = ({ data, contractorName }) => (
  <div>
    <p className="text-xs font-semibold text-slate-600 mb-2">{contractorName}</p>
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
        <Radar name={contractorName} dataKey="score" stroke={TN_COLOURS.maroon} fill={TN_COLOURS.maroon} fillOpacity={0.3} />
        <Radar name="Benchmark" dataKey="benchmark" stroke={TN_COLOURS.slate} fill={TN_COLOURS.slate} fillOpacity={0.1} strokeDasharray="4 2" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// ─── Expenditure Line Chart ──────────────────────────────────────────────────
interface ExpenditurePoint { month: string; expenditure_cr: number; target_cr: number; }
export const ExpenditureLineChart: React.FC<{ data: ExpenditurePoint[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}Cr`} />
      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
        formatter={(val: any, name: any) => [`₹${Number(val || 0).toFixed(1)} Cr`, name]} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <Line type="monotone" dataKey="expenditure_cr" name="Actual Expenditure" stroke={TN_COLOURS.maroon} strokeWidth={2} dot={{ r: 3 }} />
      <Line type="monotone" dataKey="target_cr" name="Target" stroke={TN_COLOURS.slate} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
