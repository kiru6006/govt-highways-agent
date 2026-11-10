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
  MajorWorksAIResponse,
  ReconciliationReport,
  ObligationItem,
  EvidenceRequestItem
} from '../types';
import {
  RoadTypeChip,
  WorkTypeChip,
  RiskSeverityChip,
  FinancialRiskIndicator
} from '../components/highways';

export const MajorWorksPortfolioPage: React.FC = () => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'portfolio' | 'staging' | 'evidence' | 'blockers' | 'investigations' | 'ledger' | 'mitigations' | 'gates'>('portfolio');

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<MajorWorksPortfolioOverview | null>(null);
  const [works, setWorks] = useState<MajorWorksProjectItem[]>([]);
  const [blockers, setBlockers] = useState<ProjectBlockerItem[]>([]);
  const [investigations, setInvestigations] = useState<DelayInvestigationItem[]>([]);
  const [ledger, setLedger] = useState<LossPreventionLedgerDashboard | null>(null);
  const [mitigations, setMitigations] = useState<MitigationRecommendationItem[]>([]);
  const [gates, setGates] = useState<PreConstructionGateCheckItem[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationReport | null>(null);
  const [obligations, setObligations] = useState<ObligationItem[]>([]);
  const [evidenceRequests, setEvidenceRequests] = useState<EvidenceRequestItem[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedScheme, setSelectedScheme] = useState('ALL');
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [selectedBlockerCategory, setSelectedBlockerCategory] = useState('ALL');

  // Selected Detail Modal
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [workDetail, setWorkDetail] = useState<any | null>(null);

  // Staging Human Verification Review Modal State
  const [verifyingSnapshot, setVerifyingSnapshot] = useState<MajorWorksProjectItem | null>(null);
  const [verifierName, setVerifierName] = useState('Er. S. Palanivel, CE (H) C&M Chennai');
  const [verifierNotes, setVerifierNotes] = useState('Verified against page and ministerial review presentation notes.');
  const [verifyingSubmitting, setVerifyingSubmitting] = useState(false);

  // AI Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuery, setAIQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<MajorWorksAIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Status Action Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        blockersRes,
        ledgerRes,
        mitigationsRes,
        gatesRes,
        reconcileRes,
        obligationsRes,
        evidenceReqRes
      ] = await Promise.all([
        api.getMajorWorksPortfolio(),
        api.getBlockers(),
        api.getFinancialLossLedger(),
        api.getMitigations(),
        api.getPreConstructionGates(),
        api.getReconciliationReport(),
        api.getObligations(),
        api.getEvidenceRequests()
      ]);

      setOverview(overviewRes);
      setWorks(overviewRes.items || []);
      setBlockers(blockersRes);
      setLedger(ledgerRes);
      setMitigations(mitigationsRes);
      setGates(gatesRes);
      setReconciliation(reconcileRes);
      setObligations(obligationsRes);
      setEvidenceRequests(evidenceReqRes);

      const invRes = await api.getDelayInvestigation(1);
      if (invRes) {
        setInvestigations([invRes]);
      }
    } catch (err) {
      console.error('Failed to load major works data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (sourceProjectId: string | number) => {
    setSelectedWorkId(String(sourceProjectId));
    try {
      const res = await api.getMajorWorkDetail(sourceProjectId);
      setWorkDetail(res);
    } catch (err) {
      console.error('Failed to load detail for project', sourceProjectId, err);
    }
  };

  const handleApproveMitigation = async (mitigationId: number) => {
    try {
      await api.approveMitigation(mitigationId, {
        approved: true,
        approving_officer: 'Hon. Minister for Public Works & Chief Engineer',
        approval_notes: 'Approved in Ministerial Review Session for immediate execution'
      });
      setActionSuccess(`Mitigation recommendation #${mitigationId} approved successfully.`);
      const updated = await api.getMitigations();
      setMitigations(updated);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleOverrideGate = async (gateId: number) => {
    const authority = prompt('Enter Overriding Authority Designation (e.g. Principal Secretary Highways):');
    if (!authority) return;
    const justification = prompt('Enter Statutory Justification (Court orders strictly prohibit override):');
    if (!justification) return;

    try {
      await api.overridePreConstructionGate(gateId, {
        override_authority: authority,
        justification
      });
      setActionSuccess(`Pre-construction gate #${gateId} conditionally overridden.`);
      const updated = await api.getPreConstructionGates();
      setGates(updated);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Override blocked: ${err.message}`);
    }
  };

  const handleVerifySnapshot = async () => {
    if (!verifyingSnapshot) return;
    setVerifyingSubmitting(true);
    try {
      const updated = await api.verifySnapshot(verifyingSnapshot.id, {
        verified: true,
        verification_status: 'VERIFIED',
        verified_by_officer: verifierName,
        notes: verifierNotes,
        update_canonical: true
      });
      setWorks(prev => prev.map(w => (w.id === updated.id ? updated : w)));
      setActionSuccess(`Snapshot for project #${verifyingSnapshot.source_project_id} verified & confirmed.`);
      setVerifyingSnapshot(null);
      await loadData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifyingSubmitting(false);
    }
  };

  const handleRunAIQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiLoading(true);
    setAIQuery(queryText);
    try {
      const res = await api.queryMajorWorksAI(queryText);
      setAiResponse(res);
    } catch (err: any) {
      alert(`AI Query error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Unique divisions for filter
  const divisions = Array.from(new Set(works.map(w => w.division_name))).filter(Boolean);
  const schemes = Array.from(new Set(works.map(w => w.scheme_name))).filter(Boolean);

  // Filtered works
  const filteredWorks = works.filter(w => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match =
        w.project_name.toLowerCase().includes(s) ||
        w.source_project_id.toLowerCase().includes(s) ||
        w.division_name.toLowerCase().includes(s) ||
        (w.contractor_name && w.contractor_name.toLowerCase().includes(s)) ||
        w.scheme_name.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (selectedDivision !== 'ALL' && w.division_name !== selectedDivision) return false;
    if (selectedScheme !== 'ALL' && w.scheme_name !== selectedScheme) return false;
    if (delayedOnly && w.completion_delay_days <= 0) return false;
    return true;
  });

  // Filtered blockers
  const filteredBlockers = blockers.filter(b => {
    if (selectedBlockerCategory !== 'ALL' && b.category !== selectedBlockerCategory) {
      return false;
    }
    return true;
  });

  const getRiskBadge = (level: string) => {
    return <RiskSeverityChip severity={level} compact />;
  };

  const getReadinessBadge = (state: string) => {
    switch (state) {
      case 'GREEN':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GREEN: CLEARED
          </span>
        );
      case 'AMBER':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> AMBER: CONDITIONAL
          </span>
        );
      case 'RED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-red-600" /> RED: BLOCKED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 sm:p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
              OFFICIAL MINISTERIAL REVIEW
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs">
              Review Date: 21.09.2026
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              Chennai C&amp;M Region (31 Works)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#20242B]" />
            Major Works ₹50 Cr+ Portfolio &amp; Blocker Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Source: <code className="text-blue-700 font-mono">More than 50Cr works details as on 21.09.2026.pdf</code> | Loss prevention ledger &amp; root-cause mitigation engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#20242B] hover:bg-slate-800 text-[#FACC15] rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Brain className="w-4 h-4 text-[#FACC15]" />
            Ask Grounded AI
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Canonical Benchmark Case 5566 Alert Banner */}
      <div className="p-4 bg-white border border-amber-300 rounded-xl shadow-2xs border-l-4 border-l-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              CANONICAL BENCHMARK CASE
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">Project ID: 5566</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              Review Required
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            ROB at LC-13, Thirunindravur–Veppampattu (Southern Railway Section)
          </h3>
          <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
            Physical: <strong className="text-slate-900">78.0%</strong> | Exp: <strong className="text-slate-900">₹38.36 Cr</strong> | Agreement: <span className="line-through text-slate-400">20.03.2026</span> → Forecast: <span className="text-amber-700 font-semibold">31.01.2027</span> (<strong className="text-red-700">+317 days variance</strong>). Railway-side work reported; exact critical path blocker unestablished by site audit. No litigation reported on record; financial loss unestablished. EOT and remaining CPM programme required.
          </p>
        </div>
        <button
          onClick={() => handleOpenDetail('5566')}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition"
        >
          Inspect 5566 Dossier <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-[#20242B]">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Reviewed Works</span>
          <div className="text-2xl font-bold font-mono text-slate-900">31</div>
          <div className="text-[11px] text-slate-500">Chennai C&amp;M Region</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-blue-500">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Contract Value</span>
          <div className="text-2xl font-bold font-mono text-blue-700">₹3,042.80 <span className="text-xs font-normal text-slate-500">Cr</span></div>
          <div className="text-[11px] text-slate-500">TS: ₹3,418.90 Cr</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-amber-500">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Delayed &gt;180 Days</span>
          <div className="text-2xl font-bold font-mono text-amber-700">21 <span className="text-xs font-normal text-slate-500">works</span></div>
          <div className="text-[11px] text-slate-500">Avg delay: 281 days</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-red-500">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Critical Path Blockers</span>
          <div className="text-2xl font-bold font-mono text-red-700">6 <span className="text-xs font-normal text-slate-500">active</span></div>
          <div className="text-[11px] text-slate-500">Railway: 3 | LA: 2 | Stay: 1</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-emerald-500">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Addl Cost</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹14.85 <span className="text-xs font-normal text-slate-500">Cr</span></div>
          <div className="text-[11px] text-slate-500">Non-double counted</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 border-t-3 border-t-indigo-500">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Potentially Avoidable</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">₹18.50 <span className="text-xs font-normal text-slate-500">Cr</span></div>
          <div className="text-[11px] text-slate-500">With timely mitigation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto custom-scrollbar">
        {[
          { key: 'portfolio', label: '1. Portfolio Registry (31 Works)', icon: Building2 },
          { key: 'staging', label: '1B. Staging & Human Review', icon: FileText, badge: `${reconciliation?.total_staged_records || 31}` },
          { key: 'evidence', label: '1C. Evidence Spine', icon: Layers, badge: `${obligations.length + evidenceRequests.length}` },
          { key: 'blockers', label: '2. Blocker Register (17 Types)', icon: AlertTriangle, badge: `${blockers.length}` },
          { key: 'investigations', label: '3. Delay Investigations', icon: Clock, badge: `${investigations.length}` },
          { key: 'ledger', label: '4. Loss Prevention Ledger', icon: IndianRupee },
          { key: 'mitigations', label: '5. Mitigations', icon: Sparkles, badge: `${mitigations.length}` },
          { key: 'gates', label: '6. Risk Gates', icon: Lock, badge: `${gates.length}` },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap rounded-t-lg ${
                isActive
                  ? 'border-b-2 border-[#FACC15] text-slate-900 bg-amber-50/60 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PORTFOLIO TABLE */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, name, contractor, division..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="ALL">All Divisions</option>
                {divisions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedScheme}
                onChange={e => setSelectedScheme(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="ALL">All Schemes</option>
                {schemes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={delayedOnly}
                  onChange={e => setDelayedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-[#FACC15]"
                />
                Delayed only
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID / Scheme</th>
                  <th className="px-4 py-3">Work Name &amp; Division</th>
                  <th className="px-4 py-3">Work Type</th>
                  <th className="px-4 py-3">Contractor</th>
                  <th className="px-4 py-3 text-right">Value (₹ Cr)</th>
                  <th className="px-4 py-3 text-center">Progress (Phys / Fin)</th>
                  <th className="px-4 py-3 text-center">Delay</th>
                  <th className="px-4 py-3 text-center">Risk</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorks.map(w => {
                  const is5566 = w.source_project_id === '5566';
                  const isCritical = w.risk_level === 'CRITICAL';
                  return (
                    <tr
                      key={w.id}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        is5566
                          ? 'bg-amber-50/40 border-l-3 border-l-amber-500'
                          : isCritical
                          ? 'bg-red-50/30 border-l-3 border-l-red-500'
                          : ''
                      }`}
                      onClick={() => handleOpenDetail(w.source_project_id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">#{w.source_project_id}</span>
                          <RoadTypeChip category={w.scheme_name.includes('NH') ? 'NH' : 'SH'} code={w.scheme_name.includes('NH') ? 'NH' : 'SH'} />
                        </div>
                        <div className="text-[10px] text-slate-500 max-w-[140px] truncate mt-0.5">{w.scheme_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 max-w-sm truncate" title={w.project_name}>
                          {w.project_name}
                        </div>
                        <div className="text-[11px] text-slate-500">{w.division_name} Division</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <WorkTypeChip type={w.project_name.includes('ROB') ? 'ROB/RUB' : w.project_name.includes('Widening') ? 'Road Widening' : 'General Road Work'} />
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate text-slate-700" title={w.contractor_name}>
                        {w.contractor_name || 'Departmental'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">₹{w.contract_value_cr.toFixed(2)} Cr</div>
                        <div className="text-[10px] text-slate-500 font-mono">Exp: ₹{w.expenditure_cr.toFixed(2)} Cr</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-semibold font-mono">
                          <span className="text-blue-700">{w.physical_progress_pct}%</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-emerald-700">{w.financial_progress_pct}%</span>
                        </div>
                        <div className="w-20 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(w.physical_progress_pct, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {w.completion_delay_days > 0 ? (
                          <span className="text-amber-800 font-semibold font-mono">+{w.completion_delay_days} d</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">On Time</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {getRiskBadge(w.risk_level)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenDetail(w.source_project_id);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1B: STAGING IMPORT & VERIFICATION REVIEW */}
      {activeTab === 'staging' && (
        <div className="space-y-4">
          {/* Reconciliation Overview Banner */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Staging Import &amp; Document Reconciliation</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    PDF SNAPSHOT (21.09.2026)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Source: <em>More than 50Cr works details as on 21.09.2026.pdf</em> (31 works, Chennai C&amp;M Region). Records remain in staging with page provenance until verified by an authorized officer.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700">
                  Total Staged: <strong className="text-slate-900">{reconciliation?.total_staged_records || 31}</strong>
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800">
                  Verified: <strong>{reconciliation?.verified_records_count || 1}</strong>
                </span>
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800">
                  Extracted: <strong>{reconciliation?.pending_verification_count || 30}</strong>
                </span>
              </div>
            </div>

            {/* Unreported Fields Notice */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Source Completeness Policy: Missing Fields = "Not reported"</span>
              </div>
              <p className="text-[11px] text-slate-600">
                In strict compliance with statutory governance rules: blank or missing source fields mean <strong>"Not reported"</strong>, never "no issue". Zero duplicate projects created; canonical projects linked via typed foreign key.
              </p>
              {reconciliation?.missing_fields_inventory && reconciliation.missing_fields_inventory.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {reconciliation.missing_fields_inventory.slice(0, 4).map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-700">
                      #{m.source_project_id}: {m.unreported_fields.join(', ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Staged Records Verification Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                31 Staged Extracted Works (Human Review Queue)
              </span>
              <span className="text-[11px] text-slate-500">
                Click "Verify &amp; Confirm" to approve extracted values into canonical record
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Source ID &amp; Work</th>
                    <th className="px-3 py-3">Source Page</th>
                    <th className="px-3 py-3">TS vs Contract</th>
                    <th className="px-3 py-3">Confidence</th>
                    <th className="px-3 py-3">Discrepancy Details</th>
                    <th className="px-3 py-3 text-center">Verification Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {works.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-slate-900">#{w.source_project_id}</div>
                        <div className="text-slate-900 font-medium text-xs line-clamp-1">{w.project_name}</div>
                        <div className="text-[10px] text-slate-500">{w.division_name} | {w.contractor_name || 'Not reported'}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                        Page {w.source_page_number}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono">
                        <div className="text-slate-900 font-semibold">₹{w.contract_value_cr.toFixed(2)} Cr</div>
                        <div className="text-[10px] text-slate-500">TS: ₹{w.technical_sanction_cr.toFixed(2)} Cr</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 border border-blue-200 text-blue-700 font-mono">
                          {((w.extraction_confidence || 0.95) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11px]">
                        {w.sanction_vs_contract_discrepancy ? (
                          <div className="text-amber-800 font-medium">
                            <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px]">
                              ₹50 Cr Discrepancy
                            </span>
                            <div className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{w.discrepancy_details}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Consistent (≥₹50 Cr)</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            w.verification_status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : w.verification_status === 'CONFLICTING'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {w.verification_status || 'EXTRACTED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setVerifyingSnapshot(w)}
                          className="px-2.5 py-1 bg-[#20242B] hover:bg-slate-800 text-[#FACC15] rounded text-xs font-semibold transition shadow-2xs"
                        >
                          Verify &amp; Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1C: EVIDENCE SPINE (OBLIGATIONS & EVIDENCE REQUESTS) */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Evidence Spine: Typed Obligations &amp; Evidence Requests
            </h3>
            <p className="text-xs text-slate-600">
              Typed relations linking delay events and blockers to responsible parties, formal deliverables, missing items, and verification criteria. All records carry provenance tags ("SEEDED DEMO - Not yet verified").
            </p>
          </div>

          {/* Section 1: Obligations */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                1. Project Obligations (Deliverables &amp; Acceptance Criteria)
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                {obligations.length} Active Obligations
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Obligation Code</th>
                    <th className="px-3 py-2.5">Project</th>
                    <th className="px-3 py-2.5">Owner Party</th>
                    <th className="px-4 py-2.5">Deliverable</th>
                    <th className="px-3 py-2.5">Due Date</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {obligations.map(ob => (
                    <tr key={ob.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                        {ob.obligation_code}
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        {ob.project_name || 'ROB at LC-13 Thirunindravur'}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-700">
                        {ob.owner_party}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900 font-medium">{ob.deliverable}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Criteria: {ob.acceptance_criteria}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                        {ob.due_date ? new Date(ob.due_date).toLocaleDateString() : 'Pending schedule'}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            ob.status === 'FULFILLED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ob.status === 'OVERDUE'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {ob.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600">
                          {ob.provenance_note}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Evidence Requests */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                2. Evidence Requests (What is Missing &amp; From Whom)
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                {evidenceRequests.length} Active Requests
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Request Code</th>
                    <th className="px-3 py-2.5">Project</th>
                    <th className="px-4 py-2.5">Item Requested (Missing Evidence)</th>
                    <th className="px-3 py-2.5">Requested From</th>
                    <th className="px-3 py-2.5">Due Date</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evidenceRequests.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                        {ev.request_code}
                      </td>
                      <td className="px-3 py-3 text-slate-800">
                        {ev.project_name || 'ROB at LC-13 Thirunindravur'}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {ev.item_requested}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-700">
                        {ev.requested_from_party}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                        {ev.due_date ? new Date(ev.due_date).toLocaleDateString() : 'Immediate'}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            ev.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ev.status === 'SUBMITTED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600">
                          {ev.provenance_note}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCKER REGISTER (17 CATEGORIES) */}
      {activeTab === 'blockers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-sm text-slate-800 font-semibold">
              Registered Blockers across 17 Statutory &amp; Operational Categories
            </div>
            <select
              value={selectedBlockerCategory}
              onChange={e => setSelectedBlockerCategory(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
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
              <div key={b.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{b.blocker_code}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {b.category.replace(/_/g, ' ')}
                      </span>
                      {b.is_critical_path && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 font-semibold">
                          CRITICAL PATH
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-medium">{b.project_name}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    {b.current_status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{b.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">Resolution Authority:</span>
                    <div className="font-semibold text-slate-800 truncate">{b.responsible_resolution_authority}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Action Owner:</span>
                    <div className="font-semibold text-slate-800 truncate">{b.assigned_action_owner}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Days Affected:</span>
                    <div className="font-semibold text-amber-800">{b.days_affected} days</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Financial Exposure:</span>
                    <div>
                      {b.is_financial_exposure_quantified && b.financial_exposure_cr ? (
                        <span className="font-semibold text-red-700">₹{b.financial_exposure_cr.toFixed(2)} Cr</span>
                      ) : (
                        <span className="text-slate-500 italic font-mono text-[10px]">Exposure not yet quantified</span>
                      )}
                    </div>
                  </div>
                </div>

                {b.supporting_evidence && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <strong className="text-slate-700">Supporting Evidence:</strong> {b.supporting_evidence}
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
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Delay Investigation Engine (Baseline vs Forecast Causal Analysis)
            </h3>
            <p className="text-xs text-slate-600">
              Evaluates missed milestones, physical vs financial gaps, and unanswered inter-departmental correspondence. Never attributes delay without verified proof.
            </p>
          </div>

          <div className="space-y-4">
            {investigations.map(inv => (
              <div key={inv.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{inv.investigation_code}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        {inv.milestone_health_verdict.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{inv.project_name}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Investigator: <strong className="text-slate-800">{inv.responsible_investigator_name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans">Baseline Completion</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(inv.baseline_completion_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans">Current Forecast</span>
                    <div className="text-sm font-bold text-amber-700 mt-1">
                      {new Date(inv.current_forecast_completion_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans">Delay from Baseline</span>
                    <div className="text-sm font-bold text-red-700 mt-1">+{inv.delay_days_from_baseline} days</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-sans">Physical vs Financial Gap</span>
                    <div className="text-sm font-bold text-blue-700 mt-1">{inv.physical_vs_financial_variance_pct}% gap</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">Critical Path Assessment:</span>
                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {inv.critical_path_assessment}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Preliminary Findings:</span>
                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {inv.preliminary_findings}
                    </p>
                  </div>
                  {inv.unverified_assumptions && (
                    <div>
                      <span className="font-semibold text-amber-800">Unverified Assumptions (Must NOT be treated as proven):</span>
                      <p className="text-amber-900 mt-0.5 bg-amber-50 p-2.5 rounded border border-amber-200">
                        {inv.unverified_assumptions}
                      </p>
                    </div>
                  )}
                  {inv.evidence_checklist_pending && (
                    <div>
                      <span className="font-semibold text-blue-800">Evidence Required to Finalise:</span>
                      <p className="text-blue-900 mt-0.5 bg-blue-50 p-2.5 rounded border border-blue-200">
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

      {/* TAB 4: FINANCIAL LOSS PREVENTION LEDGER */}
      {activeTab === 'ledger' && ledger && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              Financial Exposure &amp; Loss Prevention Ledger (12 Itemised Accounts)
            </h3>
            <p className="text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
              <strong className="text-emerald-800">Statutory Accounting Guard:</strong> {ledger.summary.accounting_guard_statement}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] text-slate-500 font-sans uppercase">Verified Addl Exp</span>
              <div className="text-xl font-bold text-slate-900 mt-1">₹{ledger.summary.actual_additional_expenditure_cr} Cr</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] text-slate-500 font-sans uppercase">Claims Submitted</span>
              <div className="text-xl font-bold text-amber-700 mt-1">₹{ledger.summary.contractor_claims_submitted_cr} Cr</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] text-slate-500 font-sans uppercase">Claims Admitted</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">₹{ledger.summary.claims_admitted_cr} Cr</div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] text-slate-500 font-sans uppercase">Potentially Avoidable</span>
              <div className="text-xl font-bold text-indigo-700 mt-1">₹{ledger.summary.potentially_avoidable_future_expenditure_cr} Cr</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Code / Project</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Formula / Basis</th>
                  <th className="px-4 py-3 text-right">Amount (₹ Cr)</th>
                  <th className="px-4 py-3 text-center">Confidence</th>
                  <th className="px-4 py-3">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">{rec.ledger_code}</span>
                      <div className="text-[10px] text-slate-500 max-w-[150px] truncate">{rec.project_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{rec.account_name.replace(/_/g, ' ')}</span>
                      {rec.source_reference && (
                        <div className="text-[10px] text-slate-500 max-w-xs truncate">{rec.source_reference}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-700">
                      {rec.formula_description}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {rec.is_quantified && rec.amount_cr !== undefined ? (
                        <span className="font-bold text-slate-900 font-mono">₹{rec.amount_cr.toFixed(2)} Cr</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-amber-800 border border-amber-300 font-medium italic">
                          Financial exposure not yet quantified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        rec.data_confidence === 'HIGH'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rec.data_confidence === 'MEDIUM'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {rec.data_confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
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
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Mitigation Recommendation Engine (Human Approval Required)
            </h3>
            <p className="text-xs text-slate-600">
              Evaluates lawful options, resolving authority, and intervention costs vs avoidable losses. AI recommendations are never executed without responsible officer approval.
            </p>
          </div>

          <div className="space-y-4">
            {mitigations.map(mit => (
              <div key={mit.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{mit.mitigation_code}</span>
                      <span className="text-xs text-slate-500 font-medium">Ref: {mit.blocker_code}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        mit.human_approval_status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {mit.human_approval_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1">{mit.project_name}</div>
                  </div>

                  {mit.human_approval_status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={() => handleApproveMitigation(mit.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Mitigation
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {mit.approved_by_officer}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-600 font-semibold">What is stopping the work?</span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">{mit.stopping_what}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-600 font-semibold">Why is it happening?</span>
                    <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">{mit.stopping_why}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-indigo-800 font-semibold">Lawful Actions Available:</span>
                  <p className="text-indigo-950 bg-indigo-50/60 p-2.5 rounded border border-indigo-200">{mit.lawful_actions_available}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-500 font-sans">Resolving Authority:</span>
                    <div className="font-semibold text-slate-900 truncate font-sans">{mit.resolving_authority}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Intervention Cost:</span>
                    <div className="font-semibold text-amber-800">₹{mit.estimated_intervention_cost_cr.toFixed(2)} Cr</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Avoidable Delay:</span>
                    <div className="font-semibold text-emerald-700">{mit.avoidable_delay_days} days</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Avoidable Cost:</span>
                    <div className="font-semibold text-emerald-700">₹{mit.avoidable_cost_cr.toFixed(2)} Cr</div>
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
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              Pre-Construction Risk Gates (Statutory Legal Guard)
            </h3>
            <p className="text-xs text-slate-600">
              Verifies land, forest, environmental, utility, and judicial clearances before tender award or site handover. Binding court injunctions strictly prohibit administrative bypass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gates.map(gate => (
              <div key={gate.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{gate.gate_code}</span>
                      {getReadinessBadge(gate.readiness_state)}
                    </div>
                    <div className="text-xs text-slate-700 mt-1 font-medium">{gate.project_name}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">{gate.stage.replace(/_/g, ' ')}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-600 font-semibold">Restriction Summary:</span>
                  <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">{gate.restriction_summary}</p>
                </div>

                {gate.court_restrictions_active && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-red-700 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> STATUTORY PROHIBITION: COURT INJUNCTION IN FORCE
                    </div>
                    <p className="text-red-900 text-[11px]">{gate.operative_stay_details}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    {gate.acquisition_possession_cleared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
                    <span className="text-slate-800">Land Possession: {gate.acquisition_possession_cleared ? 'Cleared' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {gate.railway_coordination_cleared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
                    <span className="text-slate-800">Railway Clearance: {gate.railway_coordination_cleared ? 'Cleared' : 'Pending'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Status: <strong className="text-slate-800">{gate.authorized_override_status.replace(/_/g, ' ')}</strong>
                  </span>
                  {gate.authorized_override_status === 'NONE' && (
                    <button
                      onClick={() => handleOverrideGate(gate.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        gate.court_restrictions_active
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
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
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-slate-900">Project #{workDetail.work.source_project_id}</span>
                  {getRiskBadge(workDetail.work.risk_level)}
                  <span className="text-xs text-slate-500">{workDetail.work.scheme_name}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{workDetail.work.project_name}</h2>
                <p className="text-xs text-slate-500">{workDetail.work.division_name} Division | {workDetail.work.circle_name}</p>
              </div>
              <button
                onClick={() => setSelectedWorkId(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-sans">Contract Value</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">₹{workDetail.work.contract_value_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-sans">Expenditure</span>
                <div className="text-base font-bold text-emerald-700 mt-0.5">₹{workDetail.work.expenditure_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-sans">Progress</span>
                <div className="text-base font-bold text-blue-700 mt-0.5">{workDetail.work.physical_progress_pct}% (Phys)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-sans">Delay</span>
                <div className="text-base font-bold text-amber-800 mt-0.5">+{workDetail.work.completion_delay_days} days</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-1">Departmental Review Observations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Work Status Remarks:</span>
                  <p className="text-slate-800 mt-1">{workDetail.work.work_remarks || 'None reported'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Railway Approvals:</span>
                  <p className="text-slate-800 mt-1">{workDetail.work.railway_approval_remarks || 'Not applicable'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Land Acquisition Status:</span>
                  <p className="text-slate-800 mt-1">{workDetail.work.land_acquisition_remarks || 'Cleared'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Court Case Information:</span>
                  <p className="text-slate-800 mt-1">{workDetail.work.court_case_remarks || 'No litigation on record'}</p>
                </div>
              </div>
            </div>

            {workDetail.blockers && workDetail.blockers.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-1">Active Blockers for this Work</h4>
                {workDetail.blockers.map((b: any) => (
                  <div key={b.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-slate-900 font-bold">{b.blocker_code}</span>: {b.description}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                      {b.current_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HUMAN VERIFICATION & RECONCILING MODAL */}
      {verifyingSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900">
                  Staging Review: Project #{verifyingSnapshot.source_project_id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{verifyingSnapshot.project_name}</h3>
                <p className="text-xs text-slate-500">
                  Source: <em>{verifyingSnapshot.source_document}</em> (Page {verifyingSnapshot.source_page_number})
                </p>
              </div>
              <button
                onClick={() => setVerifyingSnapshot(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans">Contract Value</span>
                <div className="font-bold text-slate-900 mt-0.5">₹{verifyingSnapshot.contract_value_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans">Tech Sanction</span>
                <div className="font-bold text-slate-800 mt-0.5">₹{verifyingSnapshot.technical_sanction_cr.toFixed(2)} Cr</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans">Physical Progress</span>
                <div className="font-bold text-blue-700 mt-0.5">{verifyingSnapshot.physical_progress_pct}%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans">Delay</span>
                <div className="font-bold text-amber-800 mt-0.5">+{verifyingSnapshot.completion_delay_days} days</div>
              </div>
            </div>

            {verifyingSnapshot.sanction_vs_contract_discrepancy && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-amber-800">₹50 Cr Membership Criteria Discrepancy:</span>
                <p className="text-amber-900 text-[11px]">{verifyingSnapshot.discrepancy_details}</p>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Verifying Officer Name &amp; Designation
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={e => setVerifierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reconciliation Notes &amp; Verification Basis
                </label>
                <textarea
                  value={verifierNotes}
                  onChange={e => setVerifierNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <p>
                  <strong>Human Governance Lock:</strong> Verifying this record will transition status from <span className="text-amber-700 font-semibold">EXTRACTED</span> to <span className="text-emerald-700 font-semibold">VERIFIED</span> and update canonical project records in the Project Registry without creating duplicate entities.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setVerifyingSnapshot(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySnapshot}
                disabled={verifyingSubmitting}
                className="px-4 py-2 bg-[#20242B] hover:bg-slate-800 text-[#FACC15] rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                {verifyingSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Recording Verification...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm &amp; Mark Verified
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Brain className="w-5 h-5 text-[#20242B]" />
                Grounded Domain AI Intelligence
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Grounded strictly in September 2026 Minister Review facts and official departmental files. Distinguishes verified facts from unproven assumptions.
            </p>

            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Canonical Inquiries:</span>
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
                    className="text-left text-[11px] px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {aiLoading && (
              <div className="p-4 text-center text-xs text-slate-600 flex items-center justify-center gap-2 bg-slate-50 rounded-xl border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-800" /> Grounding analysis in official records...
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-700">Verified Findings</span>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Confidence: {Math.round(aiResponse.confidence_score * 100)}%</span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-800">Verified Facts:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {aiResponse.verified_facts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-amber-800">Missing Information / Uncertainty:</span>
                  <ul className="list-disc pl-4 space-y-1 text-amber-900">
                    {aiResponse.missing_information.map((miss, i) => (
                      <li key={i}>{miss}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-800">Resolving Authority:</span>
                  <p className="text-slate-900 font-medium">{aiResponse.resolving_authority}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-blue-800">Recommended Next Action:</span>
                  <p className="text-blue-900 bg-blue-50/70 p-2 rounded border border-blue-200">
                    {aiResponse.recommended_next_action}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-600">Evidence Citations:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[11px]">
                    {aiResponse.evidence_references.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Close AI Intelligence Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
