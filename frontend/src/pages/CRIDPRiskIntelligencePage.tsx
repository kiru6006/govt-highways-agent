import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  CRIDPRiskOverviewKPIs,
  CRIDPInvestigationItem,
  CRIDPDelayRootCauseItem,
  CRIDPContractorScorecardItem,
  CRIDPCorrectiveActionItem,
  CRIDPDataQualityItem,
  CRIDPAIInsightResponse,
  CRIDPWorkItem,
  WorkHistoryItem,
  YearWiseEligibilityItem,
  DelegationOfPowerRuleItem
} from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Building,
  Scale,
  Sparkles,
  Calculator,
  ChevronRight,
  MapPin,
  ExternalLink,
  Milestone,
  HelpCircle,
  Eye,
  Send,
  AlertOctagon,
  Users,
  DollarSign,
  Activity,
  History,
  CheckSquare,
  FileCheck,
  Flame,
  FileQuestion,
  Hammer,
  BadgeAlert,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

export const CRIDPRiskIntelligencePage: React.FC = () => {
  // Active Tab: 11 Mandated Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'investigation'
    | 'five-year'
    | 'duplicates'
    | 'delays'
    | 'contractors'
    | 'financial'
    | 'actions'
    | 'yearwise'
    | 'quality'
    | 'reports-ai'
  >('overview');

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Data States
  const [riskKPIs, setRiskKPIs] = useState<CRIDPRiskOverviewKPIs | null>(null);
  const [investigations, setInvestigations] = useState<CRIDPInvestigationItem[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<CRIDPInvestigationItem | null>(null);
  const [proposals, setProposals] = useState<CRIDPWorkItem[]>([]);
  const [historicalWorks, setHistoricalWorks] = useState<WorkHistoryItem[]>([]);
  const [delays, setDelays] = useState<CRIDPDelayRootCauseItem[]>([]);
  const [contractors, setContractors] = useState<CRIDPContractorScorecardItem[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CRIDPCorrectiveActionItem[]>([]);
  const [yearWiseRows, setYearWiseRows] = useState<YearWiseEligibilityItem[]>([]);
  const [dataQualityFindings, setDataQualityFindings] = useState<CRIDPDataQualityItem[]>([]);
  const [delegationRules, setDelegationRules] = useState<DelegationOfPowerRuleItem[]>([]);

  // Filter States
  const [selectedFY, setSelectedFY] = useState<string>('2026-27');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Decision Form State (CE Verdict)
  const [decisionVerdict, setDecisionVerdict] = useState<string>('REJECT_PREMATURE_RENEWAL');
  const [decisionJustification, setDecisionJustification] = useState<string>('');
  const [decidingAuthority, setDecidingAuthority] = useState<string>('Chief Engineer (C&M)');
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);

  // New Corrective Action Modal
  const [showNewActionModal, setShowNewActionModal] = useState<boolean>(false);
  const [newActionTitle, setNewActionTitle] = useState<string>('');
  const [newActionDesc, setNewActionDesc] = useState<string>('');
  const [newActionOwnerName, setNewActionOwnerName] = useState<string>('');
  const [newActionOwnerDesig, setNewActionOwnerDesig] = useState<string>('Divisional Engineer');
  const [newActionAuthority, setNewActionAuthority] = useState<string>('Divisional Engineer, Concerned Division');
  const [newActionCategory, setNewActionCategory] = useState<string>('TECHNICAL');
  const [newActionPriority, setNewActionPriority] = useState<string>('HIGH');
  const [newActionDays, setNewActionDays] = useState<number>(15);
  const [newActionEscalation, setNewActionEscalation] = useState<string>('CIRCLE');

  // AI Insights State
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<CRIDPAIInsightResponse | null>(null);

  // Load Initial Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        kpisRes,
        invsRes,
        propsRes,
        histRes,
        delaysRes,
        contractorsRes,
        actionsRes,
        ywRes,
        dqRes,
        rulesRes
      ] = await Promise.all([
        api.getCRIDPRiskOverview(selectedFY),
        api.getCRIDPInvestigations(),
        api.getCRIDPProposals({ financial_year: selectedFY }),
        api.getCRIDPHistoricalWorks(),
        api.getCRIDPDelaysAndRootCauses(),
        api.getCRIDPContractorScorecards(),
        api.getCRIDPCorrectiveActions(),
        api.getCRIDPYearWiseEligibility(),
        api.getCRIDPDataQualityFindings(),
        api.getDelegationRules()
      ]);

      setRiskKPIs(kpisRes);
      setInvestigations(invsRes);
      if (invsRes.length > 0 && !selectedInvestigation) {
        setSelectedInvestigation(invsRes[0]);
      }
      setProposals(propsRes);
      setHistoricalWorks(histRes);
      setDelays(delaysRes);
      setContractors(contractorsRes);
      setCorrectiveActions(actionsRes);
      setYearWiseRows(ywRes);
      setDataQualityFindings(dqRes);
      setDelegationRules(rulesRes);
    } catch (err) {
      console.error('Error loading CRIDP risk intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedFY]);

  // Handle Recording Chief Engineer Decision
  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestigation) return;
    setActionSubmitting(true);
    setDecisionSuccess(null);
    try {
      const targetId = selectedInvestigation.scenario_id || selectedInvestigation.proposal_id || selectedInvestigation.id;
      const updated = await api.recordCRIDPInvestigationDecision(targetId, {
        recommended_action: decisionVerdict,
        decision_justification: decisionJustification,
        deciding_authority: decidingAuthority
      });
      setSelectedInvestigation(updated);
      setInvestigations(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
      setDecisionSuccess(`Executive verdict "${decisionVerdict}" successfully recorded for ${selectedInvestigation.investigation_code}.`);
    } catch (err: any) {
      alert(`Decision recording failed: ${err.message || 'Check Chief Engineer authorization'}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Handle Submitting New Corrective Action
  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSubmitting(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + Number(newActionDays));
      const created = await api.createCRIDPCorrectiveAction({
        action_title: newActionTitle,
        action_description: newActionDesc,
        action_owner_name: newActionOwnerName || 'Er. Concerned Officer',
        action_owner_designation: newActionOwnerDesig,
        responsible_authority: newActionAuthority,
        action_category: newActionCategory,
        priority: newActionPriority,
        target_date: targetDate.toISOString(),
        escalation_level: newActionEscalation
      });
      setCorrectiveActions(prev => [created, ...prev]);
      setShowNewActionModal(false);
      setNewActionTitle('');
      setNewActionDesc('');
    } catch (err: any) {
      alert(`Action creation failed: ${err.message}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Handle AI Question Ask
  const handleAskAI = async (qText?: string) => {
    const query = qText || aiQuestion;
    if (!query.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.askCRIDPAIRiskAnalyst(query);
      setAiResponse(res);
      if (qText) setAiQuestion(qText);
    } catch (err: any) {
      alert(`AI risk analyst lookup failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Investigations
  const filteredInvestigations = useMemo(() => {
    return investigations.filter(inv => {
      if (selectedCategory !== 'ALL' && inv.problem_category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && inv.problem_severity !== selectedSeverity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesCode = inv.investigation_code.toLowerCase().includes(q);
        const matchesStmt = inv.problem_statement.toLowerCase().includes(q);
        const matchesCause = inv.root_cause_analysis.toLowerCase().includes(q);
        const matchesScn = (inv.scenario_id || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesStmt && !matchesCause && !matchesScn) return false;
      }
      return true;
    });
  }, [investigations, selectedCategory, selectedSeverity, searchQuery]);

  // Unique Districts for Filter Dropdowns
  const districts = useMemo(() => {
    const setD = new Set<string>();
    delays.forEach(d => { if (d.district) setD.add(d.district); });
    proposals.forEach(p => { if (p.district) setD.add(p.district); });
    return Array.from(setD).sort();
  }, [delays, proposals]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* TOP COMMAND HEADER */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-800/90 backdrop-blur border border-slate-700/80 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CRIDP G.O.(Ms) No. 105 (02.07.2025)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              G.O. Ms. No. 84 5-Year Renewal Restriction
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SIMULATED / MOCK DATA MODE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              G.O. 11 & G.O. 29 Authority Rules
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
            Statewide CRIDP Work Verification & Risk Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-4xl">
            Deterministic previous work investigation, five-year renewal compliance, overlapping stretch pruning,
            delay root cause attribution, contractor accountability, and financial exposure mitigation for Chief Engineers.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Target FY:</span>
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="bg-transparent text-sm text-slate-200 font-semibold focus:outline-none"
            >
              <option value="2026-27">2026-27 (Upcoming)</option>
              <option value="2025-26">2025-26 (Annexure)</option>
              <option value="2027-28">2027-28 (Forecast)</option>
            </select>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg border border-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 11 MANDATORY TABS NAVIGATION */}
      {/* ------------------------------------------------------------------- */}
      <div className="border-b border-slate-700/80 overflow-x-auto scrollbar-thin">
        <nav className="flex space-x-1 min-w-max pb-1">
          {[
            { id: 'overview', label: '1. Statewide Risk Overview', icon: Activity },
            { id: 'investigation', label: '2. Previous Work Investigation', icon: FileQuestion },
            { id: 'five-year', label: '3. Five-Year Renewal Verification', icon: History },
            { id: 'duplicates', label: '4. Duplicate & Overlap Detection', icon: Layers },
            { id: 'delays', label: '5. Delay & Root Cause Analysis', icon: Clock },
            { id: 'contractors', label: '6. Contractor Performance', icon: Users },
            { id: 'financial', label: '7. Financial Exposure & Leakage', icon: DollarSign },
            { id: 'actions', label: '8. Corrective Action Tracker', icon: CheckSquare },
            { id: 'yearwise', label: '9. Year-wise Eligible Length', icon: Milestone },
            { id: 'quality', label: '10. Data Quality & Lineage', icon: FileCheck },
            { id: 'reports-ai', label: '11. Reports & AI Insights', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: STATEWIDE RISK OVERVIEW */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'overview' && riskKPIs && (
        <div className="space-y-6">
          {/* Top 14 Mandatory KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            {[
              { label: 'Total CRIDP Works', val: riskKPIs.total_cridp_works, unit: 'Works', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
              { label: 'Historical Works Assessed', val: riskKPIs.historical_works_assessed, unit: 'Assessed', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
              { label: 'Proposed Renewal Works', val: riskKPIs.proposed_renewal_works_count, unit: 'Proposals', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
              { label: 'Verified Previous History', val: riskKPIs.works_with_verified_previous_history, unit: 'Verified', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Potential Duplicate Works', val: riskKPIs.potential_duplicate_works_count, unit: 'Flagged', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
              { label: 'Partially Overlapping Length', val: `${riskKPIs.partially_overlapping_length_km} km`, unit: 'Overlap', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Renewed < 5 Years Ago', val: riskKPIs.works_completed_within_previous_five_years, unit: 'Locked', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
              { label: 'Unresolved Previous Issues', val: riskKPIs.works_with_unresolved_previous_issues, unit: 'Issues', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
              { label: 'Disputed Completion Status', val: riskKPIs.works_with_disputed_completion_status, unit: 'Uncertified', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Awaiting CE Tech Review', val: riskKPIs.works_requiring_technical_review, unit: 'In Queue', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Potential Financial Exposure', val: `₹${riskKPIs.potential_financial_exposure_cr} Cr`, unit: 'Exposure', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
              { label: 'Verified Avoidable Loss', val: `₹${riskKPIs.verified_avoidable_expenditure_cr} Cr`, unit: 'Avoidable', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Open Corrective Actions', val: riskKPIs.open_corrective_actions_count, unit: 'Open CAP', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
              { label: 'Overdue Corrective Actions', val: riskKPIs.overdue_corrective_actions_count, unit: 'Overdue', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
            ].map((kpi, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${kpi.border} ${kpi.bg} flex flex-col justify-between`}>
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">{kpi.label}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-xl font-extrabold ${kpi.color}`}>{kpi.val}</span>
                  <span className="text-[10px] text-slate-400">{kpi.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Statewide Context & Audit Statement Banner */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Verified Statewide Audit Provenance Register</h3>
              </div>
              <p className="text-xs text-slate-400">
                Reporting Date: <span className="text-slate-200 font-semibold">{riskKPIs.reporting_date}</span> | Data Completeness: <span className="text-emerald-400 font-semibold">{riskKPIs.data_completeness_pct}%</span> | Data Quality Index: <span className="text-sky-400 font-semibold">{riskKPIs.data_quality_index}/100</span>
              </p>
              <p className="text-xs text-slate-400 italic">
                Source: {riskKPIs.verification_status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('investigation')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-900/30"
              >
                Inspect 12 Canonical Scenarios
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                View Leakage Ledger
              </button>
            </div>
          </div>

          {/* Quick Scenario Previews */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              High-Risk Proposal Investigations Requiring Immediate Chief Engineer Direction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investigations.slice(0, 6).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => { setSelectedInvestigation(inv); setActiveTab('investigation'); }}
                  className="bg-slate-800/90 border border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 cursor-pointer transition hover:shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-emerald-400 border border-slate-700">
                      {inv.scenario_id || inv.investigation_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.problem_severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      inv.problem_severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {inv.problem_severity}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{inv.problem_statement}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inv.root_cause_analysis}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Exposure: <strong className="text-orange-400">₹{inv.financial_exposure_cr} Cr</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      Investigate <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: PREVIOUS WORK INVESTIGATION (The 5-Question Deep Dossier) */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'investigation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Proposal & Investigation Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-emerald-400" />
                Select CRIDP Investigation Dossier
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by code, scenario or road..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 w-full"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PREMATURE_RENEWAL">Premature Renewal</option>
                  <option value="UNVERIFIED_COMPLETION">Unverified Completion</option>
                  <option value="SCHEDULE_OVERRUN">Schedule Overrun</option>
                  <option value="LAND_ACQUISITION_BLOCKER">Land Acquisition</option>
                  <option value="UTILITY_RELOCATION_BLOCKER">Utility Blocker</option>
                  <option value="LITIGATION_STAY">Litigation Stay</option>
                  <option value="PHYSICAL_FINANCIAL_MISMATCH">Physical-Financial Mismatch</option>
                  <option value="QUALITY_DEFECT">Quality Defect</option>
                  <option value="MULTIPLE_SCHEME_CONFLICT">Multiple Scheme Conflict</option>
                  <option value="UNRESOLVED_CORRECTIVE_ACTION">Unresolved Action</option>
                </select>
              </div>
            </div>

            {/* List of Scenarios / Dossiers */}
            <div className="space-y-2 max-h-[700px] overflow-y-auto scrollbar-thin pr-1">
              {filteredInvestigations.map((inv) => {
                const isSelected = selectedInvestigation?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => { setSelectedInvestigation(inv); setDecisionSuccess(null); }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400">{inv.scenario_id || inv.investigation_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.problem_severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                        inv.problem_severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {inv.problem_category}
                      </span>
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{inv.problem_statement}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Exposure: <strong className="text-orange-400">₹{inv.financial_exposure_cr} Cr</strong></span>
                      <span className="text-emerald-400 font-medium">{inv.recommended_action}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: The 5-Part Investigation Deep Dossier */}
          <div className="lg:col-span-8 space-y-5">
            {selectedInvestigation ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 space-y-6 shadow-xl">
                {/* Dossier Header */}
                <div className="border-b border-slate-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedInvestigation.scenario_id || 'OFFICIAL DOSSIER'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-300">
                        Code: {selectedInvestigation.investigation_code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {selectedInvestigation.data_mode}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedInvestigation.problem_statement}</h2>
                  </div>
                  <div className="text-right self-start md:self-auto">
                    <span className="text-xs text-slate-400 block">Investigated Exposure</span>
                    <span className="text-2xl font-black text-orange-400">₹{selectedInvestigation.financial_exposure_cr} Cr</span>
                  </div>
                </div>

                {/* THE 5 MANDATED QUESTIONS DISPLAY */}
                <div className="space-y-4">
                  {/* Facet 1: What work was previously sanctioned/completed? */}
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                      <History className="w-4 h-4" />
                      Question 1: What work was previously sanctioned or completed on this road stretch?
                    </div>
                    <p className="text-sm text-slate-200">
                      {selectedInvestigation.previous_work_summary || 'No historical work documented in registry.'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Completion Status: <strong className="text-emerald-400">{selectedInvestigation.previous_completion_status}</strong></span>
                      <span>Critical Path Impact: <strong className={selectedInvestigation.is_critical_path_impact ? 'text-rose-400' : 'text-slate-300'}>{selectedInvestigation.is_critical_path_impact ? 'YES' : 'NO'}</strong></span>
                      <span>Recorded Delay: <strong className="text-amber-400">{selectedInvestigation.delay_days_investigated} days</strong></span>
                    </div>
                  </div>

                  {/* Facet 2: What went wrong or remains unverified? */}
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      Question 2: What went wrong, or what remains unverified, in the previous work?
                    </div>
                    <p className="text-sm text-slate-200">
                      {selectedInvestigation.problem_statement}
                    </p>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="text-slate-400">Problem Category: <strong className="text-slate-200">{selectedInvestigation.problem_category}</strong></span>
                      <span className="text-slate-400">Severity: <strong className={selectedInvestigation.problem_severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}>{selectedInvestigation.problem_severity}</strong></span>
                    </div>
                  </div>

                  {/* Facet 3: Why did it happen? (Root Cause & Evidence Chain) */}
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Scale className="w-4 h-4" />
                      Question 3: What caused the problem, and what evidence supports that conclusion?
                    </div>
                    <p className="text-sm text-slate-200">
                      {selectedInvestigation.root_cause_analysis}
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Official Evidence Chain:</span>
                      <p className="text-xs text-emerald-300 font-mono">{selectedInvestigation.evidence_chain}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      Root Cause Responsibility: <strong className="text-slate-200">{selectedInvestigation.root_cause_category}</strong>
                    </div>
                  </div>

                  {/* Facet 4: How is the issue currently being managed? */}
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      <Building className="w-4 h-4" />
                      Question 4: How is the issue currently being managed, by whom and within what deadline?
                    </div>
                    <p className="text-sm text-slate-200">
                      {selectedInvestigation.management_summary || 'Action assigned to concerned circle Superintending Engineer.'}
                    </p>
                    <div className="text-xs text-slate-400">
                      Nodal Action Owner: <strong className="text-slate-200">{selectedInvestigation.action_owner_designation || 'Divisional Engineer'}</strong>
                    </div>
                  </div>

                  {/* Facet 5: Should the proposed new work proceed, require modification or be referred? */}
                  <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4" />
                      Question 5: Should proposed new work proceed, require modification or be referred?
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300">Technical Recommendation:</span>
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedInvestigation.recommended_action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200">
                      {selectedInvestigation.decision_justification}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                      <span>Deciding Authority: <strong className="text-slate-200">{selectedInvestigation.deciding_authority}</strong></span>
                      <span>Delegation Rule: <strong className="text-indigo-400">{selectedInvestigation.delegation_rule_ref}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Chief Engineer Authoritative Verdict Form */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Hammer className="w-4 h-4 text-emerald-400" />
                    Record Chief Engineer Authoritative Verdict
                  </h3>
                  {decisionSuccess && (
                    <div className="mb-3 p-3 bg-emerald-900/40 border border-emerald-500 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {decisionSuccess}
                    </div>
                  )}
                  <form onSubmit={handleRecordDecision} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Executive Verdict</label>
                        <select
                          value={decisionVerdict}
                          onChange={(e) => setDecisionVerdict(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="REJECT_PREMATURE_RENEWAL">REJECT: Premature Renewal (&lt; 5 Years Lock-in)</option>
                          <option value="TRUNCATE_AND_SANCTION_ELIGIBLE">TRUNCATE: Prune Overlap & Sanction Non-Overlapping Stretch</option>
                          <option value="TECHNICAL_SANCTION_HOLD">HOLD: Withhold Sanction Pending Field MB / Lab Verification</option>
                          <option value="RESOLVE_EXISTING_CONTRACT">CONTRACTUAL: Enforce Clause 52 / Liquidated Damages</option>
                          <option value="SEEK_ENGINEERING_EXCEPTION">EXCEPTION: Refer to HRS Guindy for Benkelman Deflection Exception</option>
                          <option value="APPROVED_OVERRIDE">EXECUTIVE OVERRIDE: Record Sanction with Documented CE Concurrence</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Deciding Authority</label>
                        <input
                          type="text"
                          value={decidingAuthority}
                          onChange={(e) => setDecidingAuthority(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Authoritative Justification & Evidence Citations (Min 15 chars)</label>
                      <textarea
                        rows={3}
                        required
                        value={decisionJustification}
                        onChange={(e) => setDecisionJustification(e.target.value)}
                        placeholder="Enter engineering justification, referring to Measurement Book entries, G.O. Ms. No. 84 provisions, or lab test certificates..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        disabled={actionSubmitting || decisionJustification.length < 15}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-900/30"
                      >
                        <FileCheck className="w-4 h-4" />
                        {actionSubmitting ? 'Recording Verdict...' : 'Affix Chief Engineer Sanction Verdict'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
                Select a proposal from the left to view the complete 5-question investigation dossier.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: FIVE-YEAR RENEWAL VERIFICATION */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'five-year' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Deterministic Five-Year Road Renewal Verification Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates proposal chainage against canonical road network history. Corridors completed within 5 years require Highways Research Station core deflection testing before sanction.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Cut-off: 5 Years Precise Arithmetic
            </span>
          </div>

          {/* Proposals Table */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Proposal Code</th>
                    <th className="p-3">Road / Stretch</th>
                    <th className="p-3">District / Div</th>
                    <th className="p-3 text-center">Proposed (Km)</th>
                    <th className="p-3 text-center">Overlapping (Km)</th>
                    <th className="p-3 text-center">Eligible (Km)</th>
                    <th className="p-3 text-right">Est Cost (₹ Cr)</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Competent Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {proposals.slice(0, 15).map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">{p.proposal_code}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{p.road_code}</span>
                        <span className="text-[11px] text-slate-400">{p.road_name} (Km {p.start_chainage} - {p.end_chainage})</span>
                      </td>
                      <td className="p-3">
                        <span>{p.district}</span>
                        <span className="text-[11px] text-slate-400 block">{p.division_name}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-white">{p.proposed_length_km}</td>
                      <td className="p-3 text-center font-bold text-rose-400">{p.overlapping_length_km}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{p.eligible_length_km}</td>
                      <td className="p-3 text-right font-bold text-orange-400">₹{p.estimated_cost_cr}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.verification_status === 'ELIGIBLE' ? 'bg-emerald-500/20 text-emerald-300' :
                          p.verification_status === 'RECENTLY RENEWED' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {p.verification_status}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-400 font-semibold">{p.approval_authority_required || 'Chief Engineer'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: DUPLICATE AND OVERLAP DETECTION */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Interval Union & Overlapping Chainage Math Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prevents double counting of government expenditure using mathematical 1D interval union algorithm:
                {" \\bigcup [a_i, b_i] "}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.filter(p => p.overlapping_length_km > 0).slice(0, 8).map(p => (
              <div key={p.id} className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">{p.proposal_code}</span>
                  <span className="text-xs font-bold text-rose-400">{p.duplicate_severity} OVERLAP</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{p.road_code} - {p.road_name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.overlapping_chainage_description}</p>
                </div>
                {/* Visual Chainage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Km {p.start_chainage}</span>
                    <span>Km {p.end_chainage}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.round((p.overlapping_length_km / p.proposed_length_km) * 100)}%` }}
                      className="bg-rose-500 h-full"
                      title={`Overlapping: ${p.overlapping_length_km} km`}
                    />
                    <div
                      style={{ width: `${Math.round((p.eligible_length_km / p.proposed_length_km) * 100)}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Eligible: ${p.eligible_length_km} km`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="text-rose-400 font-semibold">Overlapping: {p.overlapping_length_km} km</span>
                    <span className="text-emerald-400 font-semibold">Eligible: {p.eligible_length_km} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 5: DELAY AND ROOT CAUSE ANALYSIS */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'delays' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Statewide Delay Breakdown & Critical Path Attribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compares contractual milestones vs actuals; quantifies critical-path slippages and partitions causal responsibility.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Work Ref</th>
                    <th className="p-3">Road / District</th>
                    <th className="p-3">Contractor</th>
                    <th className="p-3 text-center">Delay Days</th>
                    <th className="p-3 text-center">Critical Path</th>
                    <th className="p-3">Delay Responsibility</th>
                    <th className="p-3">Root Cause & Evidence</th>
                    <th className="p-3">Management Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {delays
                    .filter(d => selectedDistrict === 'ALL' || d.district.toLowerCase().includes(selectedDistrict.toLowerCase()))
                    .slice(0, 12)
                    .map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono font-bold text-indigo-400">{d.work_code}</td>
                        <td className="p-3">
                          <span className="font-bold text-white block">{d.road_code}</span>
                          <span className="text-[11px] text-slate-400">{d.district} ({d.division_name})</span>
                        </td>
                        <td className="p-3 text-slate-200">{d.contractor_name}</td>
                        <td className="p-3 text-center font-bold text-rose-400">{d.overall_delay_days} d</td>
                        <td className="p-3 text-center font-bold text-amber-400">{d.critical_path_delay_days} d</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.delay_responsibility === 'CONTRACTOR' ? 'bg-rose-500/20 text-rose-300' :
                            d.delay_responsibility === 'DEPARTMENT' ? 'bg-sky-500/20 text-sky-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {d.delay_responsibility}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="line-clamp-2 text-slate-300">{d.root_cause_summary}</p>
                          <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">{d.evidence_document}</span>
                        </td>
                        <td className="p-3 max-w-xs text-slate-400 text-[11px]">
                          {d.management_plan}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 6: CONTRACTOR PERFORMANCE AND ACCOUNTABILITY */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Statewide Contractor Performance Matrix & Workload Risk
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks active packages, delay concentration, quality NCRs, and liquidity signals across prime contractors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractors.map((c, idx) => (
              <div key={idx} className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{c.contractor_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.performance_band === 'SATISFACTORY' ? 'bg-emerald-500/20 text-emerald-300' :
                    c.performance_band === 'ATTENTION_REQUIRED' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {c.performance_band}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active</span>
                    <strong className="text-white text-sm">{c.active_packages_count}</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Delayed</span>
                    <strong className="text-rose-400 text-sm">{c.delayed_packages_count}</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Completed</span>
                    <strong className="text-emerald-400 text-sm">{c.completed_packages_count}</strong>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Avg Schedule Variance:</span>
                    <strong className={c.avg_schedule_variance_days > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {c.avg_schedule_variance_days > 0 ? `+${c.avg_schedule_variance_days} d` : `${c.avg_schedule_variance_days} d`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality NCRs:</span>
                    <strong className="text-amber-400">{c.quality_ncr_count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity Warning:</span>
                    <strong className={c.liquidity_warning ? 'text-rose-400' : 'text-slate-400'}>
                      {c.liquidity_warning ? 'ACTIVE ALERT' : 'NORMAL'}
                    </strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700/80 text-[11px] text-indigo-400">
                  Recommended Scrutiny: <strong>{c.recommended_scrutiny_level}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 7: FINANCIAL EXPOSURE AND LEAKAGE PREVENTION */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'financial' && riskKPIs && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Avoidable Expenditure Ledger & Exposure Partitioning
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintains non-accusatory, mathematically grounded separation between Estimated Exposure vs Verified Avoidable Savings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Statewide Avoidable Savings</span>
                <span className="text-xl font-black text-emerald-400">₹{riskKPIs.verified_avoidable_expenditure_cr} Cr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Potential Exposure</span>
              <span className="text-2xl font-black text-orange-400 block">₹{riskKPIs.potential_financial_exposure_cr} Cr</span>
              <p className="text-xs text-slate-400">Total monetary value of overlapping, premature, or duplicate proposals identified across all 38 districts.</p>
            </div>
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Verified Avoidable Expenditure</span>
              <span className="text-2xl font-black text-emerald-400 block">₹{riskKPIs.verified_avoidable_expenditure_cr} Cr</span>
              <p className="text-xs text-slate-400">Hard government savings realized by dropping 100% duplicate works and pruning overlapping chainages.</p>
            </div>
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Net Sanctionable Portfolio</span>
              <span className="text-2xl font-black text-sky-400 block">
                ₹{((proposals.reduce((acc, p) => acc + (p.estimated_cost_cr || 0), 0)) - riskKPIs.verified_avoidable_expenditure_cr).toFixed(2)} Cr
              </span>
              <p className="text-xs text-slate-400">Verified eligible road renewal portfolio ready for Technical Sanction by Chief Engineers under G.O. 11/2022.</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 8: CORRECTIVE ACTION AND MITIGATION TRACKER */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Statewide Corrective Action Pipeline (CAP)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks accountability, owners, deadlines, and multi-tier escalations (Division &rarr; Circle &rarr; Chief Engineer &rarr; Secretary).
              </p>
            </div>
            <button
              onClick={() => setShowNewActionModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
            >
              <FileCheck className="w-4 h-4" />
              Add Corrective Action
            </button>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Action Code</th>
                    <th className="p-3">Title & Mandate</th>
                    <th className="p-3">Responsible Officer</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Target Date</th>
                    <th className="p-3 text-center">Progress</th>
                    <th className="p-3 text-center">Escalation</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {correctiveActions.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">{a.action_code}</td>
                      <td className="p-3 max-w-sm">
                        <span className="font-bold text-white block">{a.action_title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{a.action_description}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-200 block">{a.action_owner_name}</span>
                        <span className="text-[11px] text-slate-400">{a.action_owner_designation}</span>
                      </td>
                      <td className="p-3 text-slate-300">{a.action_category}</td>
                      <td className="p-3 text-center text-slate-200 font-mono">
                        {a.target_date ? a.target_date.substring(0, 10) : 'TBD'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-emerald-400">{a.progress_pct}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.escalation_level === 'SECRETARY' ? 'bg-red-500/20 text-red-300' :
                          a.escalation_level === 'CHIEF_ENGINEER' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {a.escalation_level}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-300' :
                          a.status === 'IN_PROGRESS' ? 'bg-sky-500/20 text-sky-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {a.status}
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

      {/* ------------------------------------------------------------------- */}
      {/* TAB 9: YEAR-WISE ELIGIBLE ROAD LENGTH */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'yearwise' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Milestone className="w-5 h-5 text-indigo-400" />
                Statewide Year-wise Eligible Road Length Projections (FY 2026-27 to 2030-31)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Projects road length unlocking from the five-year renewal restriction window across Tamil Nadu.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Financial Year</th>
                    <th className="p-3 text-right">Verified Network (Km)</th>
                    <th className="p-3 text-right">Restricted 5-Yr (Km)</th>
                    <th className="p-3 text-right">Historically Eligible (Km)</th>
                    <th className="p-3 text-right">Admin Available (Km)</th>
                    <th className="p-3 text-right">Tech Recommended (Km)</th>
                    <th className="p-3 text-right">Approved Renewal (Km)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium font-mono">
                  {yearWiseRows.map((yw, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-emerald-400 font-sans">{yw.financial_year}</td>
                      <td className="p-3 text-right text-slate-200">{yw.total_verified_length_km.toLocaleString()}</td>
                      <td className="p-3 text-right text-purple-400">{yw.restricted_renewal_window_km.toLocaleString()}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">{yw.historically_eligible_km.toLocaleString()}</td>
                      <td className="p-3 text-right text-sky-400">{yw.administratively_available_km.toLocaleString()}</td>
                      <td className="p-3 text-right text-amber-400">{yw.technically_recommended_km.toLocaleString()}</td>
                      <td className="p-3 text-right text-white font-bold">{yw.approved_renewal_km.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 10: DATA QUALITY AND VERIFICATION */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Data Quality Audit Register (12 Mandated Anomaly Categories)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Traces provenance directly to Predefined Report (1).csv rows, PDF annexures, and circle measurement book references.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Source Dataset Lineage</th>
                    <th className="p-3">Corridor & District</th>
                    <th className="p-3">Anomaly Description</th>
                    <th className="p-3">Suggested Resolution</th>
                    <th className="p-3 text-center">Confidence</th>
                    <th className="p-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {dataQualityFindings.map(dq => (
                    <tr key={dq.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">{dq.finding_code}</td>
                      <td className="p-3 text-slate-200">{dq.category}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{dq.source_dataset_filename}</span>
                        <span className="text-[11px] text-slate-400">{dq.source_line_or_page}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-white block">{dq.road_code}</span>
                        <span className="text-[11px] text-slate-400">{dq.district}</span>
                      </td>
                      <td className="p-3 max-w-xs text-slate-300">{dq.anomaly_description}</td>
                      <td className="p-3 max-w-xs text-slate-400 text-[11px]">{dq.suggested_resolution}</td>
                      <td className="p-3 text-center font-bold text-sky-400">{dq.confidence_score}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dq.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                          dq.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-sky-500/20 text-sky-300'
                        }`}>
                          {dq.severity}
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

      {/* ------------------------------------------------------------------- */}
      {/* TAB 11: REPORTS AND AI INSIGHTS */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'reports-ai' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Ask AI Risk Analyst (Evidence & Citation Grounded)</h3>
                <p className="text-xs text-slate-400">
                  Formulates verified responses to Chief Engineers based on G.O.(Ms) No. 105, G.O. Ms. No. 84, and Tamil Nadu Highways Manual.
                </p>
              </div>
            </div>

            {/* Quick 10 Mandated Prompts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Mandated Strategic Questions:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'What are the highest-risk CRIDP works statewide?',
                  'Which road stretches are blocked by land acquisition?',
                  'Which works have unresolved previous issues?',
                  'What is the total potential duplicate value?',
                  'Which contractors show critical delay patterns?',
                  'How many works are locked under the 5-year renewal window?',
                  'Which proposals require Chief Engineer technical sanction under G.O. 11/2022?',
                  'What is the progress-discrepancy risk in Cuddalore Division?',
                  'Can SH-110A Km 0.0 to 8.0 be sanctioned immediately?',
                  'What corrective actions are overdue at Circle level?'
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAI(promptText)}
                    className="text-left text-xs bg-slate-900/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask any question regarding CRIDP renewal eligibility, delay causes, or delegation of powers..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading || !aiQuestion.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {aiLoading ? 'Analyzing...' : 'Ask AI'}
              </button>
            </div>
          </div>

          {/* AI Response Card */}
          {aiResponse && (
            <div className="bg-slate-800/90 border border-emerald-500/40 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Chief Engineer Risk Advisor Assessment
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Status: {aiResponse.status}</span>
              </div>
              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiResponse.answer}
              </div>
              {/* Supporting Citations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-700/80">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Cited Government Rules:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResponse.cited_rules.map((rule, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Source Lineage:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResponse.supporting_sources.map((src, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: ADD CORRECTIVE ACTION */}
      {/* ------------------------------------------------------------------- */}
      {showNewActionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Assign New Corrective Action Mandate
              </h3>
              <button
                onClick={() => setShowNewActionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAction} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="e.g. Conduct Joint Measurement on Cuddalore Stretch"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Detailed Description & Directive</label>
                <textarea
                  rows={3}
                  required
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="Specify steps, laboratory testing requirements, or revenue coordination..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Responsible Officer Name</label>
                  <input
                    type="text"
                    required
                    value={newActionOwnerName}
                    onChange={(e) => setNewActionOwnerName(e.target.value)}
                    placeholder="Er. R. Sundararajan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Designation</label>
                  <select
                    value={newActionOwnerDesig}
                    onChange={(e) => setNewActionOwnerDesig(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Superintending Engineer">Superintending Engineer</option>
                    <option value="Divisional Engineer">Divisional Engineer</option>
                    <option value="Assistant Divisional Engineer">Assistant Divisional Engineer</option>
                    <option value="Accounts Officer">Accounts Officer</option>
                    <option value="Special DRO">Special DRO</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="IMMEDIATE">IMMEDIATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Deadline Days</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={newActionDays}
                    onChange={(e) => setNewActionDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Escalation Level</label>
                  <select
                    value={newActionEscalation}
                    onChange={(e) => setNewActionEscalation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="DIVISION">DIVISION</option>
                    <option value="CIRCLE">CIRCLE</option>
                    <option value="CHIEF_ENGINEER">CHIEF_ENGINEER</option>
                    <option value="SECRETARY">SECRETARY</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowNewActionModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting || !newActionTitle.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                >
                  {actionSubmitting ? 'Saving...' : 'Deploy Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
