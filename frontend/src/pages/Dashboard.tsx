import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  DashboardStats,
  ProjectItem,
  DepartmentDependencyItem,
  WorkflowTaskItem,
  AuditEventItem,
  RoadType
} from '../types';
import { RoadBadge } from '../components/RoadBadge';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileCheck,
  Building2,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [dependencies, setDependencies] = useState<DepartmentDependencyItem[]>([]);
  const [tasks, setTasks] = useState<WorkflowTaskItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, projsData, depsData, tasksData, auditsData] = await Promise.all([
        api.getDashboardStats(),
        api.getProjects(),
        api.getDependencies(),
        api.getWorkflowTasks(),
        api.getAuditEvents(10)
      ]);
      setStats(statsData);
      setProjects(projsData);
      setDependencies(depsData);
      setTasks(tasksData);
      setAuditEvents(auditsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      setCompletingTaskId(taskId);
      await api.completeTask(taskId);
      await loadData();
    } catch (err) {
      console.error('Error completing task', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#006A4E] text-[#E6F4EA] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#B2DFCD]/40 uppercase tracking-wide">
              Official Session
            </span>
            <span className="text-slate-400 text-xs">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Vanakkam, {user?.full_name || 'Officer'}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Role: <span className="font-semibold text-emerald-400">{user?.role_name}</span> | Jurisdiction:{' '}
            <span className="font-semibold text-amber-300">
              {user?.circle_id ? 'Chengalpattu Circle' : user?.zone_id ? 'Chennai Zone' : 'Statewide Access'}
            </span>
          </p>
        </div>

        {/* Quick Statutory Stat */}
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm">
          <Activity className="w-6 h-6 text-[#FFCC00]" />
          <div>
            <div className="text-[11px] text-slate-300">Highways Sanctioned Budget</div>
            <div className="text-lg font-bold text-white font-mono">
              ₹{stats?.total_sanctioned_cr || '245.30'} <span className="text-xs font-normal">Crores</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Road Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#006A4E] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats?.active_projects || projects.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="text-[#006A4E] font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 100% Monitored
            </span>
            <span>across 5 road tiers</span>
          </div>
        </div>

        {/* Card 2: Delayed / Critical */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Schedule Friction</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono">
            {stats?.delayed_projects || 1} <span className="text-xs font-normal text-slate-500">Delayed</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>Average milestone slip: +45 days</span>
          </div>
        </div>

        {/* Card 3: Interdepartmental Bottlenecks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inter-Agency Clearances</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F0F7] text-[#004B87] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#004B87] font-mono">
            {stats?.pending_bottlenecks || dependencies.length} <span className="text-xs font-normal text-slate-500">Pending</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Revenue LA, TANGEDCO EB, Railways
          </div>
        </div>

        {/* Card 4: Financial Concurrence */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Expenditure to Date</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] text-[#996600] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            ₹{stats?.total_expenditure_cr || '103.40'} <span className="text-xs font-normal text-slate-500">Cr</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">42.1%</span> of Sanctioned Budget
          </div>
        </div>
      </div>

      {/* Road Classification Network Palette Bar (Adhering strictly to DESIGN.md) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Road Asset Classification Network</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono">
                TN Highways Specification
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Departmental color coding matrix across Tamil Nadu Highway infrastructure tiers
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Total Monitored Length: <span className="font-bold text-slate-900 font-mono">567.9 km</span>
          </div>
        </div>

        {/* Road Tier Cards adhering to DESIGN.md tokens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {/* SH */}
          <div className="bg-[#E6F4EA] border border-[#B2DFCD] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#006A4E]">State Highways</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#006A4E]" />
            </div>
            <div className="text-lg font-bold text-[#006A4E] font-mono mt-1">123.5 km</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Brand #006A4E (SH-49)</div>
          </div>

          {/* NH */}
          <div className="bg-[#FFF9E6] border border-[#FFE680] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#996600]">National Highways</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
            </div>
            <div className="text-lg font-bold text-[#996600] font-mono mt-1">392.0 km</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Central #FFCC00 (NH-45)</div>
          </div>

          {/* MDR */}
          <div className="bg-[#E6F0F7] border border-[#B3CFE5] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#004B87]">Major District</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#004B87]" />
            </div>
            <div className="text-lg font-bold text-[#004B87] font-mono mt-1">26.4 km</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Regional #004B87 (MDR-102)</div>
          </div>

          {/* ODR */}
          <div className="bg-[#FCE8F3] border border-[#F2B3D6] rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D1197E]">Other District</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D1197E]" />
            </div>
            <div className="text-lg font-bold text-[#D1197E] font-mono mt-1">18.2 km</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Local #D1197E (ODR-045)</div>
          </div>

          {/* RURAL */}
          <div className="bg-[#FFF3EB] border border-[#FFCCB3] rounded-lg p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6600]">Rural & Village</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6600]" />
            </div>
            <div className="text-lg font-bold text-[#FF6600] font-mono mt-1">14.0 km</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Panchayat #FF6600 (RUR-012)</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Table & Critical Clearances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Projects (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Active Highway Projects (Phase 1 Portfolio)
              </h3>
              <p className="text-xs text-slate-500">
                Governed by RBAC: showing projects permitted under your jurisdiction
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs text-[#006A4E] hover:underline font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Road Tier</th>
                  <th className="py-2.5 px-4">Project Title</th>
                  <th className="py-2.5 px-4">Sanctioned</th>
                  <th className="py-2.5 px-4">Progress</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RoadBadge type={p.road_type} code={p.road_type === 'SH' ? 'SH-49' : p.road_type === 'MDR' ? 'MDR-102' : 'ODR-045'} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{p.project_code}</span>
                        {p.contractor_name && <span>• {p.contractor_name}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                      ₹{p.sanctioned_cost_cr.toFixed(2)} Cr
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#006A4E] h-2 rounded-full"
                            style={{ width: `${p.physical_progress_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-700 font-medium">
                          {p.physical_progress_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'IN_PROGRESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'DELAYED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No projects visible for current role.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Interdepartmental Coordination Bottlenecks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#004B87]" />
                Interdepartmental Clearances
              </h3>
              <p className="text-xs text-slate-500">Statutory clearances causing milestone slips</p>
            </div>
            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
              High Priority
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {dependencies.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {d.dependency_type}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    +{d.impact_days} Days Impact
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {d.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span>Target: {d.target_dept_name}</span>
                  <span className="font-semibold text-slate-700">Status: {d.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/departments"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              Open Interdepartmental War Room <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Row: Pending Tasks & Immutable Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Workflow Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#006A4E]" />
                Assigned Operational Tasks
              </h3>
              <p className="text-xs text-slate-500">Action items assigned to engineers & contractors</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {tasks.filter((t) => t.status !== 'Completed').length} Pending
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  task.status === 'Completed'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {task.task_reference}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 mt-1">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assigned to: {task.assigned_to_name || 'Officer'}
                  </p>
                </div>

                {task.status !== 'Completed' ? (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={completingTaskId === task.id}
                    className="flex-shrink-0 text-xs bg-[#E6F4EA] hover:bg-[#d0edd8] text-[#006A4E] border border-[#B2DFCD] font-semibold px-2.5 py-1 rounded-md transition-colors"
                  >
                    {completingTaskId === task.id ? 'Saving...' : 'Mark Done'}
                  </button>
                ) : (
                  <span className="flex-shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Immutable Audit Log Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-700" />
                Immutable Statutory Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Tamper-proof event trail of official sanctions, logins & status transitions
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {auditEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">
                    {evt.actor_name}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                  <span className="font-bold text-[#006A4E]">{evt.action}</span>
                  <span>on</span>
                  <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                    {evt.entity_type} {evt.entity_reference || `#${evt.entity_id}`}
                  </span>
                </div>
                {evt.changes_json && (
                  <div className="mt-1 text-[10px] font-mono text-slate-500 truncate bg-white p-1 rounded border border-slate-100">
                    {evt.changes_json}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

