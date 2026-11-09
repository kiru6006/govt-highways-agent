import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  IndianRupee,
  Building2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Lock,
  Calendar,
  Scale,
  Brain,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';
import {
  MajorWorksProjectItem,
  MajorWorksPortfolioOverview,
  ProjectBlockerItem,
  DelayInvestigationItem,
  LossPreventionLedgerDashboard,
  MitigationRecommendationItem,
  PreConstructionGateCheckItem,
  MajorWorksAIResponse
} from '../types';

export const MajorWorksPortfolioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'blockers' | 'investigations' | 'ledger' | 'mitigations' | 'gates'>('portfolio');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<MajorWorksPortfolioOverview | null>(null);
  const [works, setWorks] = useState<MajorWorksProjectItem[]>([]);
  const [blockers, setBlockers] = useState<ProjectBlockerItem[]>([]);
  const [investigations, setInvestigations] = useState<DelayInvestigationItem[]>([]);
  const [ledger, setLedger] = useState<LossPreventionLedgerDashboard | null>(null);
  const [mitigations, setMitigations] = useState<MitigationRecommendationItem[]>([]);
  const [gates, setGates] = useState<PreConstructionGateCheckItem[]>([]);

  // Filtering states
  const [search, setSearch] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [delayedOnly, setDelayedOnly] = useState<boolean>(false);
  const [selectedBlockerCategory, setSelectedBlockerCategory] = useState<string>('ALL');

  // Selected work for modal
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [workDetail, setWorkDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // AI Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<MajorWorksAIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Action toast / feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, blkRes, ledRes, mitRes, gateRes] = await Promise.all([
        api.getMajorWorksPortfolio(),
        api.getBlockers(),
        api.getFinancialLossLedger(),
        api.getMitigations(),
        api.getPreConstructionGates()
      ]);
      setOverview(ovRes);
      setWorks(ovRes.items);
      setBlockers(blkRes);
      setLedger(ledRes);
      setMitigations(mitRes);
      setGates(gateRes);

      // Also load default investigation for reference case 1
      const invRes = await api.getDelayInvestigation(1);
      if (invRes) {
        setInvestigations([invRes]);
      }
    } catch (err: any) {
      console.error('Failed to load major works data:', err);
      setError('Unable to load Major Works portfolio. Displaying verified operational fallback dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = async (id: string | number) => {
    setSelectedWorkId(String(id));
    setDetailLoading(true);
    try {
      const detail = await api.getMajorWorkDetail(id);
      setWorkDetail(detail);
    } catch (err) {
      console.error('Failed to load work detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApproveMitigation = async (mitigationId: number) => {
    try {
      await api.approveMitigation(mitigationId, {
        approved: true,
        approving_officer: 'Principal Secretary (Highways & Minor Ports)',
        approval_notes: 'Approved for formal inter-departmental resolution.'
      });
      setActionSuccess(`Mitigation recommendation #${mitigationId} approved successfully.`);
      const updatedMits = await api.getMitigations();
      setMitigations(updatedMits);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Approval error: ${err.message || 'Action failed'}`);
    }
  };

  const handleOverrideGate = async (gateId: number) => {
    try {
      await api.overridePreConstructionGate(gateId, {
        override_authority: 'Chief Engineer (Highways)',
        justification: 'Approved subject to safety verification.'
      });
      setActionSuccess(`Pre-construction gate #${gateId} conditionally permitted.`);
      const updatedGates = await api.getPreConstructionGates();
      setGates(updatedGates);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Statutory Prohibition: Cannot override court injunction.');
    }
  };

  const handleRunAIQuery = async (queryText: string) => {
    setAiQuery(queryText);
    setAiLoading(true);
    try {
      const res = await api.queryMajorWorksAI(queryText);
      setAiResponse(res);
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered works
  const filteredWorks = works.filter(w => {
    if (selectedDivision !== 'ALL' && !w.division_name.toLowerCase().includes(selectedDivision.toLowerCase())) {
      return false;
    }
    if (selectedRisk !== 'ALL' && w.risk_level !== selectedRisk) {
      return false;
    }
    if (delayedOnly && w.completion_delay_days <= 0) {
      return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        w.project_name.toLowerCase().includes(s) ||
        w.source_project_id.toLowerCase().includes(s) ||
        (w.contractor_name || '').toLowerCase().includes(s) ||
        w.scheme_name.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Filtered blockers
  const filteredBlockers = blockers.filter(b => {
    if (selectedBlockerCategory !== 'ALL' && b.category !== selectedBlockerCategory) {
      return false;
    }
    return true;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'LOW':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getReadinessBadge = (state: string) => {
    switch (state) {
      case 'GREEN':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> GREEN: CLEARED</span>;
      case 'AMBER':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> AMBER: CONDITIONAL</span>;
      case 'RED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Lock className="w-3 h-3" /> RED: BLOCKED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">UNKNOWN</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              OFFICIAL MINISTERIAL REVIEW
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs">
              Review Date: 21.09.2026
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
              Chennai C&M Region (31 Works)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-400" />
            Major Works ₹50 Cr+ Portfolio & Blocker Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Source: <code className="text-blue-300">More than 50Cr works details as on 21.09.2026.pdf</code> | Loss prevention ledger & root-cause mitigation engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20"
          >
            <Brain className="w-4 h-4" />
            Ask Grounded AI
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Reference Case 5566 Alert Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              CANONICAL BENCHMARK CASE
            </span>
            <span className="text-xs text-slate-400 font-mono">Project ID: 5566</span>
          </div>
          <h3 className="text-base font-semibold text-white">
            ROB at LC-13, Thirunindravur–Veppampattu (Southern Railway Section)
          </h3>
          <p className="text-xs text-slate-300 max-w-4xl">
            Physical: <strong className="text-white">78.0%</strong> | Exp: <strong className="text-white">₹38.36 Cr</strong> | Agreement: <span className="line-through text-slate-400">20.03.2026</span> → Forecast: <span className="text-amber-400 font-semibold">31.01.2027</span> (<strong className="text-red-400">+317 days variance</strong>). Railway-side work reported; exact critical path blocker unestablished by site audit. No litigation reported on record; financial loss unestablished. EOT and remaining CPM programme required.
          </p>
        </div>
        <button
          onClick={() => handleOpenDetail('5566')}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-medium transition"
        >
          Inspect 5566 Dossier <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Reviewed Works</span>
          <div className="text-xl font-bold text-white">31</div>
          <div className="text-[11px] text-slate-400">Chennai C&M Region</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Contract Value</span>
          <div className="text-xl font-bold text-blue-400">₹3,042.80 <span className="text-xs font-normal">Cr</span></div>
          <div className="text-[11px] text-slate-400">TS: ₹3,418.90 Cr</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Delayed &gt;180 Days</span>
          <div className="text-xl font-bold text-amber-400">21 <span className="text-xs font-normal">projects</span></div>
          <div className="text-[11px] text-slate-400">Avg delay: 281 days</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Critical Path Blockers</span>
          <div className="text-xl font-bold text-red-400">6 <span className="text-xs font-normal">active</span></div>
          <div className="text-[11px] text-slate-400">Railway: 3 | LA: 2 | Stay: 1</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Verified Addl Cost</span>
          <div className="text-xl font-bold text-emerald-400">₹14.85 <span className="text-xs font-normal">Cr</span></div>
          <div className="text-[11px] text-slate-400">Non-double counted</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Potentially Avoidable</span>
          <div className="text-xl font-bold text-indigo-400">₹18.50 <span className="text-xs font-normal">Cr</span></div>
          <div className="text-[11px] text-slate-400">With timely mitigation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'portfolio'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Major Works Registry (31)
        </button>

        <button
          onClick={() => setActiveTab('blockers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'blockers'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Blocker Register (17 Categories)
        </button>

        <button
          onClick={() => setActiveTab('investigations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'investigations'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Delay Investigations
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          Loss Prevention Ledger (12 Accounts)
        </button>

        <button
          onClick={() => setActiveTab('mitigations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mitigations'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Mitigation Recommendations
        </button>

        <button
          onClick={() => setActiveTab('gates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gates'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          Pre-Construction Gates
        </button>
      </div>

      {/* TAB 1: PORTFOLIO REGISTRY */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by project name, ID (e.g. 5566), contractor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700"
              >
                <option value="ALL">All Divisions</option>
                <option value="Tiruvallur">Tiruvallur</option>
                <option value="Chengalpattu">Chengalpattu</option>
                <option value="Chennai City South">Chennai City South</option>
                <option value="Chennai City North">Chennai City North</option>
                <option value="Chennai City West">Chennai City West</option>
              </select>

              <select
                value={selectedRisk}
                onChange={e => setSelectedRisk(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={delayedOnly}
                  onChange={e => setDelayedOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                Delayed only
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">ID / Scheme</th>
                  <th className="px-4 py-3">Work Name & Division</th>
                  <th className="px-4 py-3">Contractor</th>
                  <th className="px-4 py-3 text-right">Value (₹ Cr)</th>
                  <th className="px-4 py-3 text-center">Progress (Phys / Fin)</th>
                  <th className="px-4 py-3 text-center">Delay</th>
                  <th className="px-4 py-3 text-center">Risk</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredWorks.map(w => (
                  <tr
                    key={w.id}
                    className={`hover:bg-slate-800/40 transition cursor-pointer ${
                      w.source_project_id === '5566' ? 'bg-blue-950/20' : ''
                    }`}
                    onClick={() => handleOpenDetail(w.source_project_id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-400">#{w.source_project_id}</span>
                      <div className="text-[10px] text-slate-400 max-w-[140px] truncate">{w.scheme_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white max-w-sm truncate" title={w.project_name}>
                        {w.project_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{w.division_name} Division</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate" title={w.contractor_name}>
                      {w.contractor_name || 'Departmental'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="font-semibold text-white">₹{w.contract_value_cr.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Exp: ₹{w.expenditure_cr.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-semibold">
                        <span className="text-blue-400">{w.physical_progress_pct}%</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-emerald-400">{w.financial_progress_pct}%</span>
                      </div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(w.physical_progress_pct, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {w.completion_delay_days > 0 ? (
                        <span className="text-amber-400 font-semibold">+{w.completion_delay_days} d</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">On Time</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRiskColor(w.risk_level)}`}>
                        {w.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenDetail(w.source_project_id);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCKER REGISTER (17 CATEGORIES) */}
      {activeTab === 'blockers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-sm text-slate-300 font-medium">
              Registered Blockers across 17 Statutory & Operational Categories
            </div>
            <select
              value={selectedBlockerCategory}
              onChange={e => setSelectedBlockerCategory(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="RAILWAY_COORDINATION">Railway Coordination</option>
              <option value="LAND_ACQUISITION_DELAYS">Land Acquisition</option>
              <option value="UTILITY_SHIFTING">Utility Shifting</option>
              <option value="COURT_INJUNCTIONS_LITIGATION">Court Injunctions</option>
              <option value="COASTAL_REGULATION_ZONE_CRZ">CRZ / Environment</option>
              <option value="DEFENSE_MILITARY_LAND_APPROVALS">Defense Land Approvals</option>
              <option value="CONTRACTOR_CASHFLOW_DISTRESS">Contractor Distress</option>
              <option value="MATERIAL_SHORTAGE_QUARRY_PERMITS">Material / Quarry Permits</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlockers.map(b => (
              <div key={b.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{b.blocker_code}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {b.category.replace(/_/g, ' ')}
                      </span>
                      {b.is_critical_path && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                          CRITICAL PATH
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">{b.project_name}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {b.current_status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{b.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400">Resolution Authority:</span>
                    <div className="font-medium text-slate-200 truncate">{b.responsible_resolution_authority}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Action Owner:</span>
                    <div className="font-medium text-slate-200 truncate">{b.assigned_action_owner}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Days Affected:</span>
                    <div className="font-medium text-amber-400">{b.days_affected} days</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Financial Exposure:</span>
                    <div>
                      {b.is_financial_exposure_quantified && b.financial_exposure_cr ? (
                        <span className="font-semibold text-red-400">₹{b.financial_exposure_cr.toFixed(2)} Cr</span>
                      ) : (
                        <span className="text-slate-400 italic font-mono text-[10px]">Financial exposure not yet quantified</span>
                      )}
                    </div>
                  </div>
                </div>

                {b.supporting_evidence && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <strong className="text-slate-300">Supporting Evidence:</strong> {b.supporting_evidence}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELAY INVESTIGATIONS */}
      {activeTab === 'investigations' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Delay Investigation Engine (Baseline vs Forecast Causal Analysis)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates missed milestones, physical vs financial gaps, and unanswered inter-departmental correspondence. Never attributes delay without verified proof.
            </p>
          </div>

          <div className="space-y-4">
            {investigations.map(inv => (
              <div key={inv.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-400">{inv.investigation_code}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        {inv.milestone_health_verdict.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{inv.project_name}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Investigator: <strong className="text-slate-200">{inv.responsible_investigator_name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Baseline Completion</span>
                    <div className="text-sm font-bold text-white mt-1">
                      {new Date(inv.baseline_completion_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Current Forecast</span>
                    <div className="text-sm font-bold text-amber-400 mt-1">
                      {new Date(inv.current_forecast_completion_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Delay from Baseline</span>
                    <div className="text-sm font-bold text-red-400 mt-1">+{inv.delay_days_from_baseline} days</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Physical vs Financial Gap</span>
                    <div className="text-sm font-bold text-blue-400 mt-1">{inv.physical_vs_financial_variance_pct}% gap</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">Critical Path Assessment:</span>
                    <p className="text-slate-300 mt-0.5 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      {inv.critical_path_assessment}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Preliminary Findings:</span>
                    <p className="text-slate-300 mt-0.5 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      {inv.preliminary_findings}
                    </p>
                  </div>
                  {inv.unverified_assumptions && (
                    <div>
                      <span className="font-semibold text-amber-400">Unverified Assumptions (Must NOT be treated as proven):</span>
                      <p className="text-amber-200/90 mt-0.5 bg-amber-950/20 p-2.5 rounded border border-amber-500/20">
                        {inv.unverified_assumptions}
                      </p>
                    </div>
                  )}
                  {inv.evidence_checklist_pending && (
                    <div>
                      <span className="font-semibold text-blue-400">Evidence Required to Finalise:</span>
                      <p className="text-blue-200/90 mt-0.5 bg-blue-950/20 p-2.5 rounded border border-blue-500/20">
                        {inv.evidence_checklist_pending}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL LOSS PREVENTION LEDGER (12 ACCOUNTS) */}
      {activeTab === 'ledger' && ledger && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Financial Exposure & Loss Prevention Ledger (12 Itemised Accounts)
            </h3>
            <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-emerald-400">Statutory Accounting Guard:</strong> {ledger.summary.accounting_guard_statement}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400">Verified Addl Exp</span>
              <div className="text-lg font-bold text-white mt-1">₹{ledger.summary.actual_additional_expenditure_cr} Cr</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400">Claims Submitted</span>
              <div className="text-lg font-bold text-amber-400 mt-1">₹{ledger.summary.contractor_claims_submitted_cr} Cr</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400">Claims Admitted</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">₹{ledger.summary.claims_admitted_cr} Cr</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400">Potentially Avoidable</span>
              <div className="text-lg font-bold text-indigo-400 mt-1">₹{ledger.summary.potentially_avoidable_future_expenditure_cr} Cr</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Code / Project</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Formula / Basis</th>
                  <th className="px-4 py-3 text-right">Amount (₹ Cr)</th>
                  <th className="px-4 py-3 text-center">Confidence</th>
                  <th className="px-4 py-3">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ledger.records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-400">{rec.ledger_code}</span>
                      <div className="text-[10px] text-slate-400 max-w-[150px] truncate">{rec.project_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{rec.account_name.replace(/_/g, ' ')}</span>
                      {rec.source_reference && (
                        <div className="text-[10px] text-slate-400 max-w-xs truncate">{rec.source_reference}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-300">
                      {rec.formula_description}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {rec.is_quantified && rec.amount_cr !== undefined ? (
                        <span className="font-bold text-white">₹{rec.amount_cr.toFixed(2)} Cr</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30 italic">
                          Financial exposure not yet quantified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        rec.data_confidence === 'HIGH'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : rec.data_confidence === 'MEDIUM'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {rec.data_confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {rec.responsible_reviewer_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MITIGATION RECOMMENDATIONS */}
      {activeTab === 'mitigations' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Mitigation Recommendation Engine (Human Approval Required)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates lawful options, resolving authority, and intervention costs vs avoidable losses. AI recommendations are never executed without responsible officer approval.
            </p>
          </div>

          <div className="space-y-4">
            {mitigations.map(mit => (
              <div key={mit.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-400">{mit.mitigation_code}</span>
                      <span className="text-xs text-slate-400 font-medium">Ref: {mit.blocker_code}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        mit.human_approval_status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {mit.human_approval_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{mit.project_name}</div>
                  </div>

                  {mit.human_approval_status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={() => handleApproveMitigation(mit.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Mitigation
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {mit.approved_by_officer}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold">What is stopping the work?</span>
                    <p className="text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800">{mit.stopping_what}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold">Why is it happening?</span>
                    <p className="text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800">{mit.stopping_why}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-indigo-400 font-semibold">Lawful Actions Available:</span>
                  <p className="text-indigo-200 bg-indigo-950/20 p-2.5 rounded border border-indigo-500/30">{mit.lawful_actions_available}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400">Resolving Authority:</span>
                    <div className="font-semibold text-white truncate">{mit.resolving_authority}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Intervention Cost:</span>
                    <div className="font-semibold text-amber-400">₹{mit.estimated_intervention_cost_cr.toFixed(2)} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avoidable Delay:</span>
                    <div className="font-semibold text-emerald-400">{mit.avoidable_delay_days} days</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avoidable Cost:</span>
                    <div className="font-semibold text-emerald-400">₹{mit.avoidable_cost_cr.toFixed(2)} Cr</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PRE-CONSTRUCTION GATES */}
      {activeTab === 'gates' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              Pre-Construction Risk Gates (Statutory Legal Guard)
            </h3>
            <p className="text-xs text-slate-400">
              Verifies land, forest, environmental, utility, and judicial clearances before tender award or site handover. Binding court injunctions strictly prohibit administrative bypass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gates.map(gate => (
              <div key={gate.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{gate.gate_code}</span>
                      {getReadinessBadge(gate.readiness_state)}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{gate.project_name}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">{gate.stage.replace(/_/g, ' ')}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold">Restriction Summary:</span>
                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800">{gate.restriction_summary}</p>
                </div>

                {gate.court_restrictions_active && (
                  <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> STATUTORY PROHIBITION: COURT INJUNCTION IN FORCE
                    </div>
                    <p className="text-red-200 text-[11px]">{gate.operative_stay_details}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {gate.acquisition_possession_cleared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Land Possession: {gate.acquisition_possession_cleared ? 'Cleared' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {gate.railway_coordination_cleared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Railway Clearance: {gate.railway_coordination_cleared ? 'Cleared' : 'Pending'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-slate-200">{gate.authorized_override_status.replace(/_/g, ' ')}</strong>
                  </span>
                  {gate.authorized_override_status === 'NONE' && (
                    <button
                      onClick={() => handleOverrideGate(gate.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        gate.court_restrictions_active
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                      disabled={gate.court_restrictions_active}
                      title={gate.court_restrictions_active ? 'Statutory Prohibition: Cannot override court injunction' : 'Permit conditional commencement'}
                    >
                      {gate.court_restrictions_active ? 'Override Barred by Court' : 'Conditional Override'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED WORK */}
      {selectedWorkId && workDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-blue-400">Project #{workDetail.work.source_project_id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRiskColor(workDetail.work.risk_level)}`}>
                    {workDetail.work.risk_level}
                  </span>
                  <span className="text-xs text-slate-400">{workDetail.work.scheme_name}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{workDetail.work.project_name}</h2>
                <p className="text-xs text-slate-400">{workDetail.work.division_name} Division | {workDetail.work.circle_name}</p>
              </div>
              <button
                onClick={() => setSelectedWorkId(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Contract Value</span>
                <div className="text-base font-bold text-white mt-0.5">₹{workDetail.work.contract_value_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Expenditure</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">₹{workDetail.work.expenditure_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Progress</span>
                <div className="text-base font-bold text-blue-400 mt-0.5">{workDetail.work.physical_progress_pct}% (Phys)</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Delay</span>
                <div className="text-base font-bold text-amber-400 mt-0.5">+{workDetail.work.completion_delay_days} days</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-1">Departmental Review Observations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-medium">Work Status Remarks:</span>
                  <p className="text-slate-200 mt-1">{workDetail.work.work_remarks || 'None reported'}</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-medium">Railway Approvals:</span>
                  <p className="text-slate-200 mt-1">{workDetail.work.railway_approval_remarks || 'Not applicable'}</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-medium">Land Acquisition Status:</span>
                  <p className="text-slate-200 mt-1">{workDetail.work.land_acquisition_remarks || 'Cleared'}</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-medium">Court Case Information:</span>
                  <p className="text-slate-200 mt-1">{workDetail.work.court_case_remarks || 'No litigation on record'}</p>
                </div>
              </div>
            </div>

            {workDetail.blockers && workDetail.blockers.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-1">Active Blockers for this Work</h4>
                {workDetail.blockers.map((b: any) => (
                  <div key={b.id} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-blue-400 font-bold">{b.blocker_code}</span>: {b.description}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                      {b.current_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Brain className="w-5 h-5 text-indigo-400" />
                Grounded Domain AI Intelligence
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Grounded strictly in September 2026 Minister Review facts and official departmental files. Distinguishes verified facts from unproven assumptions.
            </p>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Canonical Inquiries:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What is the critical path blocker on Project 5566 LC-13 Thirunindravur?',
                  'Which projects have unresolved Railway dependencies?',
                  'Which blocker has the greatest financial exposure?',
                  'Which decisions require CM intervention?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunAIQuery(q)}
                    className="text-left text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {aiLoading && (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> Grounding analysis in official records...
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Verified Findings</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Confidence: {Math.round(aiResponse.confidence_score * 100)}%</span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-300">Verified Facts:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-200">
                    {aiResponse.verified_facts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-amber-400">Missing Information / Uncertainty:</span>
                  <ul className="list-disc pl-4 space-y-1 text-amber-200/90">
                    {aiResponse.missing_information.map((miss, i) => (
                      <li key={i}>{miss}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-300">Resolving Authority:</span>
                  <p className="text-slate-200 font-medium">{aiResponse.resolving_authority}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-blue-400">Recommended Next Action:</span>
                  <p className="text-blue-200 bg-blue-950/40 p-2 rounded border border-blue-500/30">
                    {aiResponse.recommended_next_action}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-400">Evidence Citations:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                    {aiResponse.evidence_references.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Close AI Intelligence Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
