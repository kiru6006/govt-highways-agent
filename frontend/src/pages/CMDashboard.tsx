import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  TrendingUp,
  AlertOctagon,
  Clock,
  ShieldAlert,
  Building,
  CheckCircle2,
  FileText,
  MapPin,
  Scale,
  Zap,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
  Send,
  MessageSquare,
  Network,
  Share2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import {
  CMExecutiveOverview,
  CMDirectionItem,
  DelayRootCauseAnalysis,
  CMEscalationsData,
  CMAIDailyBrief,
  JurisdictionBenchmarkItem,
  LandLitigationCMSummary
} from '../types';
import { ConnectedEntityPanel } from '../components/connectivity/ConnectedEntityPanel';

export const CMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<CMExecutiveOverview | null>(null);
  const [delayAnalysis, setDelayAnalysis] = useState<DelayRootCauseAnalysis | null>(null);
  const [escalations, setEscalations] = useState<CMEscalationsData | null>(null);
  const [aiBrief, setAiBrief] = useState<CMAIDailyBrief | null>(null);
  const [directions, setDirections] = useState<CMDirectionItem[]>([]);
  const [benchmarks, setBenchmarks] = useState<JurisdictionBenchmarkItem[]>([]);
  const [landSummary, setLandSummary] = useState<LandLitigationCMSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedProjectId, setSelectedProjectId] = useState<number>(2);
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');
  const [benchmarkLevel, setBenchmarkLevel] = useState<string>('zone');

  // Drawer / Modal states
  const [connectedEntity, setConnectedEntity] = useState<{ type: string; id: string | number; title?: string } | null>(null);
  const [isNewDirectionModalOpen, setIsNewDirectionModalOpen] = useState(false);
  const [updateDirectionTarget, setUpdateDirectionTarget] = useState<CMDirectionItem | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('COMPLIED');
  const [updateNotes, setUpdateNotes] = useState<string>('');

  // New Direction Form
  const [dirTitle, setDirTitle] = useState('');
  const [dirProject, setDirProject] = useState(2);
  const [dirDept, setDirDept] = useState('Revenue Department');
  const [dirOfficer, setDirOfficer] = useState('Thiru K. Baskaran');
  const [dirDesignation, setDirDesignation] = useState('Special District Revenue Officer (LA)');
  const [dirPriority, setDirPriority] = useState('CRITICAL');
  const [dirSummary, setDirSummary] = useState('');
  const [dirDirective, setDirDirective] = useState('');
  const [dirDays, setDirDays] = useState(7);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ov, esc, brief, dirs, bmarks, landSum] = await Promise.all([
        api.getCMOverview().catch(() => null),
        api.getCMEscalations().catch(() => null),
        api.getCMAIDailyBrief().catch(() => null),
        api.getCMDirections().catch(() => []),
        api.getJurisdictionComparison(benchmarkLevel).catch(() => ({ level: 'zone', benchmarks: [] })),
        api.getLandLitigationCMSummary().catch(() => null)
      ]);

      setOverview(ov);
      setEscalations(esc);
      setAiBrief(brief);
      setDirections(dirs || []);
      setBenchmarks(bmarks?.benchmarks || []);
      setLandSummary(landSum);

      // Load delay analysis for selected project
      if (selectedProjectId) {
        const da = await api.getCMDelayAnalysis(selectedProjectId).catch(() => null);
        setDelayAnalysis(da);
      }
    } catch (err) {
      console.error('Failed to load CM Executive data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      api.getCMDelayAnalysis(selectedProjectId).then(setDelayAnalysis).catch(() => null);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    api.getJurisdictionComparison(benchmarkLevel).then(res => setBenchmarks(res.benchmarks)).catch(() => null);
  }, [benchmarkLevel]);

  const handleCreateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Number(dirDays));

      await api.issueCMDirection({
        title: dirTitle,
        project_id: dirProject,
        project_name: dirProject === 2 ? 'Salem West Bypass Four-Laning (SH-86)' : 'Tambaram Grade Separator',
        target_department: dirDept,
        assigned_officer_name: dirOfficer,
        assigned_officer_designation: dirDesignation,
        priority: dirPriority,
        issue_summary: dirSummary,
        directive_text: dirDirective,
        deadline_date: deadline.toISOString()
      });

      setIsNewDirectionModalOpen(false);
      setDirTitle('');
      setDirSummary('');
      setDirDirective('');
      loadAllData();
    } catch (err) {
      alert('Failed to issue CM Direction.');
    }
  };

  const handleUpdateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateDirectionTarget) return;
    try {
      await api.updateCMDirection(updateDirectionTarget.id, {
        status: updateStatus,
        compliance_notes: updateNotes,
        verified_by_cmo: true
      });
      setUpdateDirectionTarget(null);
      setUpdateNotes('');
      loadAllData();
    } catch (err) {
      alert('Failed to update CM Direction compliance.');
    }
  };

  const filteredDirections = directions.filter(d => {
    if (directionFilter === 'ALL') return true;
    return d.status === directionFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 1. APEX LEADERSHIP HEADER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white px-6 py-6 border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-600/30 rounded-xl border border-emerald-500/40 text-emerald-400 shadow-inner">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    Hon'ble Chief Minister's Highways Executive Smartboard
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    TN-HDOS APEX COMMAND
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-slate-300">
                    VERIFIED OFFICIAL
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Tamil Nadu Highways and Minor Ports Department • Real-time Cross-Module Operations & Statutory Interventions
                </p>
              </div>
            </div>

            {/* Leadership Badge & Global Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Hon'ble CM: Thiru C. Joseph Vijay
                </div>
                <div className="text-[11px] text-slate-300">
                  Minister: Thiru Aadhav Arjuna • Sec: Shunchonngam Jatak Chiru, IAS
                </div>
              </div>

              <button
                onClick={() => setIsNewDirectionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow transition-colors"
              >
                <Plus className="w-4 h-4" /> Issue CM Directive
              </button>

              <button
                onClick={() => setConnectedEntity({ type: 'PROJECT', id: 2, title: 'Salem West Bypass' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
              >
                <Network className="w-4 h-4 text-emerald-400" /> Universal Connectivity
              </button>

              <button
                onClick={loadAllData}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Refresh All Operations"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* 2. 17 EXECUTIVE MANDATED KPIS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              17 Executive Operational KPIs (Statewide Highways Scope)
            </h2>
            <span className="text-xs text-slate-500">
              Updated: {overview?.timestamp || 'Live'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* KPI 1 */}
            <div
              onClick={() => setConnectedEntity({ type: 'PROJECT', id: 2, title: 'Statewide Portfolio' })}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Highways Projects</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-baseline justify-between">
                <span>{overview?.total_highways_projects || 3}</span>
                <span className="text-xs text-emerald-600 font-semibold">{overview?.ongoing_count || 1} active</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-600">
                <span>View all connected</span> <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sanctioned Budget</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                ₹{overview?.total_sanctioned_budget_cr?.toFixed(1) || '1,124.5'} <span className="text-xs font-bold text-slate-500">Cr</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Revised: ₹{overview?.total_revised_cost_cr?.toFixed(1) || '1,149.3'} Cr</div>
            </div>

            {/* KPI 3 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumulative Spend</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 text-emerald-700">
                ₹{overview?.total_expenditure_cr?.toFixed(1) || '542.8'} <span className="text-xs font-bold text-slate-500">Cr</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-1 font-semibold">{overview?.statewide_financial_progress_pct || 48.3}% disbursed</div>
            </div>

            {/* KPI 4 & 5 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State Progress</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {overview?.statewide_physical_progress_pct || 54.2}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${overview?.statewide_physical_progress_pct || 54.2}%` }}
                ></div>
              </div>
            </div>

            {/* KPI 6 */}
            <div
              onClick={() => {
                const el = document.getElementById('delay-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 shadow-sm hover:border-rose-400 cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
                <span>Delayed Projects</span>
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-extrabold text-rose-900 mt-1">
                {overview?.projects_delayed_count || 3}
              </div>
              <div className="text-[10px] text-rose-700 mt-1">
                {overview?.delay_brackets?.days_180_plus || 2} delayed &gt;180 days
              </div>
            </div>

            {/* KPI 7 */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Critical Risk</div>
              <div className="text-xl font-extrabold text-amber-900 mt-1">
                {overview?.projects_at_critical_risk_count || 4}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">Cost Overrun: ₹{overview?.net_cost_overrun_cr || 24.8} Cr</div>
            </div>

            {/* KPI 8 */}
            <div
              onClick={() => navigate('/land-litigation')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Pending Land (LA)</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {overview?.pending_land_acquisition_parcels || 14} <span className="text-xs font-bold text-slate-500">parcels</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">{overview?.pending_land_extent_hectares || 48.75} Ha • Land Intelligence →</div>
            </div>

            {/* KPI 9 */}
            <div
              onClick={() => setConnectedEntity({ type: 'UTILITY', id: 1, title: 'Utility Shifting Grid' })}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Utility Shifting</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {overview?.pending_utility_shifting_items || 22} <span className="text-xs font-bold text-slate-500">items</span>
              </div>
              <div className="text-[10px] text-purple-600 mt-1 font-medium">TANGEDCO / TWAD / BSNL</div>
            </div>

            {/* KPI 10 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interdept Blockers</div>
              <div className="text-xl font-extrabold text-rose-700 mt-1">
                {overview?.interdepartmental_dependencies_blocking || 18}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Turnaround: {overview?.avg_department_turnaround_days || 28.5} days</div>
            </div>

            {/* KPI 11 */}
            <div
              onClick={() => navigate('/land-litigation')}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 shadow-sm hover:border-rose-400 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
                <span>Active Court Stays</span>
                <Scale className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-extrabold text-rose-900 mt-1">
                {overview?.open_legal_stays_count || 3}
              </div>
              <div className="text-[10px] text-rose-700 mt-1">High Court writs • View Stays →</div>
            </div>

            {/* KPI 12 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quality NCRs</div>
              <div className="text-xl font-extrabold text-amber-700 mt-1">
                {overview?.critical_quality_non_conformances || 4}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">HRS Guindy inspections</div>
            </div>

            {/* KPI 13 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High-Risk Contractors</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {overview?.high_risk_contractors_count || 2}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Repeated milestone defaults</div>
            </div>

            {/* KPI 14, 15, 16 (CM Directions) */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm col-span-2 sm:col-span-1 lg:col-span-2">
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                <span>CM Directions Compliance</span>
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-xl font-extrabold text-emerald-950">
                    {overview?.active_cm_directions_count || 4}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 ml-1">Active</span>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {overview?.resolved_cm_directions_count || 1}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 ml-1">Complied</span>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-rose-700">
                    {overview?.overdue_cm_directions_count || 0}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700 ml-1">Overdue</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-800 mt-1 font-medium">
                Closure Rate: {overview?.cm_directions_summary?.closure_rate_pct || 20}% • Direct CMO statutory tracking
              </div>
            </div>

            {/* KPI 17 (Apex Governance) */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-sm col-span-2 sm:col-span-2 lg:col-span-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Cabinet-Level Accountability & Statutory Oversight
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  Portfolio: Highways and Minor Ports • Nodal Apex: Chief Minister's Office (CMO)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Pending Cabinet Approvals: <span className="text-white font-bold">{overview?.pending_cabinet_approvals_count || 2}</span> • CM Escalation Queue: <span className="text-rose-400 font-bold">{overview?.cm_escalation_queue_count || 4}</span> items
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Apex Jurisdiction Clearance
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GROUNDED AI DAILY BRIEFING */}
        {aiBrief && (
          <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{aiBrief.brief_title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Confidence: {(aiBrief.ai_confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generated: {aiBrief.generated_at} • Grounded in Tamil Nadu Highways operational data & Court registries
                  </p>
                </div>
              </div>

              <span className="px-2 py-1 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
                {aiBrief.provenance_disclaimer}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 mb-4">
              {aiBrief.executive_overview}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiBrief.cm_recommended_actions.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {rec.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{rec.target_entity}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 mb-1">{rec.action_text}</p>
                    <p className="text-[11px] text-slate-400 italic">"{rec.statutory_rationale}"</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-medium">Recommended CMO Action</span>
                    <button
                      onClick={() => {
                        setDirTitle(rec.action_text);
                        setDirSummary(rec.statutory_rationale);
                        setIsNewDirectionModalOpen(true);
                      }}
                      className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1"
                    >
                      Issue Directive <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. DELAY ROOT CAUSE INTELLIGENCE (CRITICAL PATH VS PARALLEL NON-CRITICAL) */}
        <section id="delay-section" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Delay Root-Cause & Critical Path Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  Zero Double-Counting Model
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Strict distinction between critical-path drivers and parallel non-critical concurrent events.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Analyze Project:</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={2}>Salem West Bypass & ROB (SH-86) - 185 Days Delayed</option>
                <option value={1}>Tambaram Grade Separator (MDR-102) - 95 Days Delayed</option>
              </select>
            </div>
          </div>

          {delayAnalysis ? (
            <div className="space-y-4">
              {/* Delay Variance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Total Calendar Delay</div>
                  <div className="text-2xl font-black text-rose-700 mt-0.5">
                    {delayAnalysis.total_calendar_delay_days} <span className="text-xs font-bold text-slate-500">Days</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Baseline to Forecast Gap</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Critical Path Driver</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {delayAnalysis.critical_path_delay_days} <span className="text-xs font-bold text-slate-500">Days</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Controls calendar end-date</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Parallel Non-Critical</div>
                  <div className="text-2xl font-black text-slate-600 mt-0.5">
                    {delayAnalysis.parallel_non_critical_days} <span className="text-xs font-bold text-slate-500">Days</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Not added to project total</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Escalation Cost Impact</div>
                  <div className="text-2xl font-black text-amber-700 mt-0.5">
                    ₹{delayAnalysis.cost_overrun_cr.toFixed(1)} <span className="text-xs font-bold text-slate-500">Cr</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">Estimated project cost inflation</div>
                </div>
              </div>

              {/* Delay Events Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Delay Event & Category</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Delay Days</th>
                      <th className="py-2.5 px-3">Causing Party</th>
                      <th className="py-2.5 px-3">Resolving Authority</th>
                      <th className="py-2.5 px-3">Formal Liability</th>
                      <th className="py-2.5 px-3">EoT Status</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {delayAnalysis.delay_events.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{ev.event_title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Category: <span className="font-medium text-slate-600">{ev.category}</span> • Ref: {ev.primary_cause}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {ev.is_critical_path ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              CRITICAL PATH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                              PARALLEL NON-CRITICAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {ev.delay_days} days
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{ev.causing_party}</span>
                          <div className="text-[10px] text-slate-400">[{ev.causing_party_type}]</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700">{ev.resolving_authority}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {ev.formal_liability}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {ev.eot_status}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setDirTitle(`Expedited Resolution: ${ev.event_title}`);
                              setDirSummary(`Direct responsibility of ${ev.resolving_authority}. Delay impacting project by ${ev.delay_days} days.`);
                              setIsNewDirectionModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Direct
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Loading delay events and critical-path network...
            </div>
          )}
        </section>

        {/* 5. CM ESCALATIONS & CM DIRECTIONS MANAGEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CM Escalation Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    CM High-Priority Escalation Queue ({escalations?.total_escalations || 4})
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  {escalations?.urgent_cabinet_items || 2} Urgent Cabinet Items
                </span>
              </div>

              <div className="space-y-3">
                {escalations?.escalations.map(esc => (
                  <div key={esc.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/20 transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {esc.severity} • {esc.days_pending} Days Stalled
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{esc.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{esc.title}</h4>
                    <p className="text-[11px] text-slate-600">{esc.issue_summary}</p>

                    <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Responsible: <span className="font-semibold text-slate-800">{esc.responsible_authority}</span>
                      </span>
                      <button
                        onClick={() => {
                          setDirTitle(`Intervention: ${esc.title}`);
                          setDirSummary(esc.issue_summary);
                          setDirDirective(esc.recommended_action);
                          setIsNewDirectionModalOpen(true);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        Intervene <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CM Directions & Directives Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Chief Minister Directives Tracker ({directions.length})
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {['ALL', 'IN_PROGRESS', 'COMPLIED', 'OVERDUE'].map(st => (
                    <button
                      key={st}
                      onClick={() => setDirectionFilter(st)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded ${
                        directionFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {filteredDirections.map(d => (
                  <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{d.direction_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'COMPLIED' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{d.title}</h4>
                    <p className="text-[11px] text-slate-600 italic">"{d.directive_text}"</p>

                    <div className="text-[11px] text-slate-500">
                      Officer: <span className="font-semibold text-slate-700">{d.assigned_officer_name}</span> ({d.assigned_officer_designation})
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Deadline: {new Date(d.deadline_date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConnectedEntity({ type: 'CM_DIRECTION', id: d.id, title: d.title })}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Trace Links
                        </button>
                        <button
                          onClick={() => {
                            setUpdateDirectionTarget(d);
                            setUpdateStatus(d.status);
                            setUpdateNotes(d.compliance_notes || '');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5B. LAND ACQUISITION & COURT LITIGATION RISKS (CM EXECUTIVE CARD) */}
        {landSummary && (
          <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 border border-slate-700 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Land Acquisition & Court Litigation Risks
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      SIMULATED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Statutory oversight of High Court stays, Revenue Department SLAs, and critical-path site handovers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/land-litigation')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Open Command Centre <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projects Blocked</span>
                <div className="text-xl font-extrabold text-rose-400 mt-1">{landSummary.total_projects_blocked}</div>
                <span className="text-[10px] text-slate-400">Land or stay hold</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Path Blockers</span>
                <div className="text-xl font-extrabold text-amber-400 mt-1">{landSummary.total_critical_path_blockers}</div>
                <span className="text-[10px] text-slate-400">Impacting completion date</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Court Stays</span>
                <div className="text-xl font-extrabold text-rose-400 mt-1">{landSummary.active_court_stays}</div>
                <span className="text-[10px] text-slate-400">High Court / Sub-Courts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue Requests Overdue</span>
                <div className="text-xl font-extrabold text-orange-400 mt-1">{landSummary.overdue_revenue_requests}</div>
                <span className="text-[10px] text-slate-400">Exceeded statutory SLA</span>
              </div>
            </div>

            {landSummary.high_risk_projects?.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  High-Exposure Corridors Requiring Cabinet / DRO Intervention
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {landSummary.high_risk_projects.slice(0, 4).map((p) => (
                    <div
                      key={p.project_id}
                      onClick={() => navigate(`/land-litigation?project_id=${p.project_id}`)}
                      className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-between hover:border-emerald-400 cursor-pointer transition text-xs"
                    >
                      <div className="truncate max-w-[70%]">
                        <span className="font-bold text-white block truncate">{p.project_title}</span>
                        <span className="text-[10px] text-slate-400">
                          {p.critical_blockers_count} critical blockers • ₹{p.exposure_cr} Cr exposure
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.binding_prohibition ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {p.binding_prohibition ? 'COURT STAY' : p.readiness_verdict}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 6. ZONAL & DISTRICT SCORECARDS */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Administrative Benchmark Scorecards
              </h3>
              <p className="text-xs text-slate-500">
                Statewide comparative metrics across Tamil Nadu administrative infrastructure zones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBenchmarkLevel('zone')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  benchmarkLevel === 'zone' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                4 Regional Zones
              </button>
              <button
                onClick={() => setBenchmarkLevel('circle')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  benchmarkLevel === 'circle' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                19 Regional Circles
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Administrative Entity</th>
                  <th className="py-2.5 px-3">Headquarters / Code</th>
                  <th className="py-2.5 px-3">Total Projects</th>
                  <th className="py-2.5 px-3">Delayed Projects</th>
                  <th className="py-2.5 px-3">Avg Physical Progress</th>
                  <th className="py-2.5 px-3">Sanctioned Value</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Operating Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {benchmarks.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{b.name}</td>
                    <td className="py-3 px-3 text-slate-500">{b.headquarters || b.code || 'Tamil Nadu'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{b.total_projects}</td>
                    <td className="py-3 px-3 font-semibold text-rose-700">{b.delayed_projects}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{b.avg_physical_progress_pct}%</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${b.avg_physical_progress_pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      ₹{b.total_sanctioned_cost_cr} Cr
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.health_rating === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                        b.health_rating === 'ATTENTION_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {b.health_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL: ISSUE NEW CM DIRECTIVE */}
      {isNewDirectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Issue Chief Minister Directive</h3>
              </div>
              <button onClick={() => setIsNewDirectionModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Directive Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immediate Vacation of High Court Interim Stay on Salem ROB"
                  value={dirTitle}
                  onChange={e => setDirTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={dirProject}
                    onChange={e => setDirProject(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={2}>Salem West Bypass & ROB (SH-86)</option>
                    <option value={1}>Tambaram Grade Separator (MDR-102)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={dirPriority}
                    onChange={e => setDirPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="CRITICAL">CRITICAL (Direct CM Intervention)</option>
                    <option value="HIGH">HIGH (Urgent Secretariat Follow-up)</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                  <input
                    type="text"
                    required
                    value={dirDept}
                    onChange={e => setDirDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    required
                    value={dirOfficer}
                    onChange={e => setDirOfficer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Summary</label>
                <textarea
                  rows={2}
                  required
                  value={dirSummary}
                  onChange={e => setDirSummary(e.target.value)}
                  placeholder="Summary of delay, legal stay, or interdepartmental blockage..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chief Minister Directive Statement</label>
                <textarea
                  rows={3}
                  required
                  value={dirDirective}
                  onChange={e => setDirDirective(e.target.value)}
                  placeholder="Mandatory action instructions from the Hon'ble Chief Minister..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Deadline (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={dirDays}
                  onChange={e => setDirDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDirectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow"
                >
                  Dispatch Official CM Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE CM DIRECTIVE COMPLIANCE */}
      {updateDirectionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Directive Compliance</h3>
            <p className="text-xs text-slate-500 mb-4">{updateDirectionTarget.direction_code}: {updateDirectionTarget.title}</p>

            <form onSubmit={handleUpdateDirection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={e => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="COMPLIED">COMPLIED (Action Completed)</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="OVERDUE">OVERDUE (Escalated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Notes / Evidence Ref</label>
                <textarea
                  rows={3}
                  required
                  value={updateNotes}
                  onChange={e => setUpdateNotes(e.target.value)}
                  placeholder="Record affidavit filing date, NOC issuance number, or field inspection notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdateDirectionTarget(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Save Compliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL CONNECTIVITY DRAWER */}
      {connectedEntity && (
        <ConnectedEntityPanel
          entityType={connectedEntity.type}
          entityId={connectedEntity.id}
          entityTitle={connectedEntity.title}
          isDrawer={true}
          onClose={() => setConnectedEntity(null)}
        />
      )}
    </div>
  );
};

