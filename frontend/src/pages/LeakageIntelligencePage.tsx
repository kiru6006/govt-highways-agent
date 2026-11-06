import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LeakageKPIs,
  AnomalyFindingItem,
  CategorySummaryItem,
  ExposureAnalysisData,
  ProjectRiskScoreItem,
  ExecutiveAssessmentData,
  DecisionRequiredItem
} from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Layers,
  Building,
  UserCheck,
  Calendar,
  IndianRupee,
  ChevronRight,
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BrainCircuit,
  Eye,
  Sliders,
  Flag,
  Send,
  Scale
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

export const LeakageIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState<LeakageKPIs | null>(null);
  const [findings, setFindings] = useState<AnomalyFindingItem[]>([]);
  const [categories, setCategories] = useState<CategorySummaryItem[]>([]);
  const [exposureData, setExposureData] = useState<ExposureAnalysisData | null>(null);
  const [riskMatrix, setRiskMatrix] = useState<ProjectRiskScoreItem[]>([]);
  const [assessment, setAssessment] = useState<ExecutiveAssessmentData | null>(null);
  const [decisions, setDecisions] = useState<DecisionRequiredItem[]>([]);

  // Filter states
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drawer state
  const [selectedFinding, setSelectedFinding] = useState<AnomalyFindingItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'evidence' | 'financial' | 'stakeholders' | 'ai' | 'history'>('overview');
  
  // Review form states
  const [reviewStatusInput, setReviewStatusInput] = useState<string>('');
  const [assignedToInput, setAssignedToInput] = useState<string>('');
  const [reviewRemarksInput, setReviewRemarksInput] = useState<string>('');
  const [correctiveActionInput, setCorrectiveActionInput] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('');
  const [escalateInput, setEscalateInput] = useState<boolean>(false);
  const [savingAction, setSavingAction] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [kpiRes, catRes, expRes, riskRes, assessRes, decRes] = await Promise.all([
        api.getLeakageKPIs(),
        api.getAnomalyCategories(),
        api.getExposureAnalysis(),
        api.getProjectRiskMatrix(),
        api.getExecutiveAssessment(),
        api.getDecisionsRequiringAttention()
      ]);

      setKpis(kpiRes);
      setCategories(catRes);
      setExposureData(expRes);
      setRiskMatrix(riskRes);
      setAssessment(assessRes);
      setDecisions(decRes);

      await applyFilters();
    } catch (err) {
      console.error('Failed to load leakage data', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const list = await api.getAnomalyFindings({
        programme: selectedProgramme !== 'ALL' ? selectedProgramme : undefined,
        district: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
        review_status: selectedStatus !== 'ALL' ? selectedStatus : undefined
      });
      setFindings(list);
    } catch (err) {
      console.error('Failed to filter findings', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedProgramme, selectedDistrict, selectedCategory, selectedSeverity, selectedStatus]);

  // Handle drawer open
  const openDetailDrawer = async (finding: AnomalyFindingItem) => {
    try {
      const full = await api.getAnomalyFindingDetail(finding.id);
      setSelectedFinding(full);
      setReviewStatusInput(full.review_status);
      setAssignedToInput(full.assigned_to || '');
      setReviewRemarksInput(full.review_remarks || '');
      setCorrectiveActionInput(full.corrective_action || '');
      setDueDateInput(full.action_due_date || '');
      setEscalateInput(full.escalated_to_secretary || false);
      setDrawerTab('overview');
      setActionSuccessMsg('');
    } catch (err) {
      console.error('Failed to load finding details', err);
      setSelectedFinding(finding);
    }
  };

  // Submit review action
  const handleSaveReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;

    try {
      setSavingAction(true);
      const updated = await api.updateAnomalyReview(selectedFinding.id, {
        review_status: reviewStatusInput,
        assigned_to: assignedToInput,
        review_remarks: reviewRemarksInput,
        corrective_action: correctiveActionInput,
        action_due_date: dueDateInput,
        escalate_to_secretary: escalateInput
      });

      setSelectedFinding(updated);
      setActionSuccessMsg('Action and review status successfully logged in audit history.');
      // Refresh list and KPIs in background
      applyFilters();
      api.getLeakageKPIs().then(setKpis);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update review action', err);
    } finally {
      setSavingAction(false);
    }
  };

  // Filtered findings by search term
  const displayedFindings = findings.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.finding_code.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.project_title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.responsible_officer.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">NEW</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">UNDER REVIEW</span>;
      case 'EVIDENCE_REQUESTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">EVIDENCE REQ.</span>;
      case 'ACTION_REQUIRED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">ACTION REQUIRED</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">VERIFIED</span>;
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const COLORS = ['#7B1C1C', '#D97706', '#1D4ED8', '#006A4E', '#7C3AED', '#0D9488', '#DC2626', '#475569', '#0284C7', '#B8860B'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* ------------------------------------------------------------- */}
      {/* SECTION A: SCREEN HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    AI Leakage & Irregularity Intelligence
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    DEMO DATA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  AI-assisted detection of financial, procurement, project execution and governance anomalies across highway infrastructure programmes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Reporting Period: <strong className="text-slate-800">{kpis?.reporting_period}</strong></span>
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* Global Multi-Filters */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Programme</label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Programmes</option>
              <option value="CMRDP">CMRDP (State Funds)</option>
              <option value="CKICP">CKICP (ADB Loan)</option>
              <option value="TNRSP_II">TNRSP-II (World Bank)</option>
              <option value="NABARD">NABARD Rural Bridges</option>
              <option value="CRIDP">CRIDP Arterial Links</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Districts</option>
              <option value="Chengalpattu">Chengalpattu</option>
              <option value="Chennai">Chennai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Thanjavur">Thanjavur</option>
              <option value="Madurai">Madurai</option>
              <option value="Tiruvannamalai">Tiruvannamalai</option>
              <option value="Salem">Salem</option>
              <option value="Tirunelveli">Tirunelveli</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Anomaly Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All 10 Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Review Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EVIDENCE_REQUESTED">Evidence Requested</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Search Dossiers</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Code, bill, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION B: EXECUTIVE RISK SUMMARY (6 KPI CARDS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => { setSelectedSeverity('ALL'); setSelectedStatus('ALL'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#006A4E] transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total AI Findings</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{kpis?.total_findings || 16}</div>
          <p className="text-[10px] text-slate-500 mt-1">Cross-reconciled with demo portfolio</p>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => setSelectedSeverity('CRITICAL')}
          className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm cursor-pointer hover:border-rose-400 transition-all bg-rose-50/20"
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Findings</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 font-mono">{kpis?.critical_findings || 3}</div>
          <p className="text-[10px] text-rose-600 mt-1">Immediate intervention required</p>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setSelectedSeverity('HIGH')}
          className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm cursor-pointer hover:border-amber-400 transition-all bg-amber-50/20"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">High-Risk Findings</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">{kpis?.high_risk_findings || 9}</div>
          <p className="text-[10px] text-amber-600 mt-1">Execution / clearance lags</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Potential Exposure</span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-[#006A4E] mt-2 font-mono">
            ₹{kpis?.potential_financial_exposure_cr.toFixed(2) || '54.00'} <span className="text-xs font-normal">Cr</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Subject to verification</p>
        </div>

        {/* KPI 5 */}
        <div
          onClick={() => setSelectedStatus('UNDER_REVIEW')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#006A4E] transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Verification</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{kpis?.findings_awaiting_verification || 7}</div>
          <p className="text-[10px] text-slate-500 mt-1">Under departmental inquiry</p>
        </div>

        {/* KPI 6 */}
        <div
          onClick={() => setSelectedStatus('ACTION_REQUIRED')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#006A4E] transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Action Pending</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{kpis?.corrective_actions_pending || 5}</div>
          <p className="text-[10px] text-slate-500 mt-1">Directives issued</p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION C: AI EXECUTIVE ASSESSMENT PANEL */}
      {/* ------------------------------------------------------------- */}
      {assessment && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold tracking-tight text-slate-100">AI Executive Assessment</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                SYNTHESIZED INTELLIGENCE
              </span>
            </div>
            <span className="text-xs font-mono text-amber-400">
              Risk Level: {assessment.overall_risk_assessment}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {assessment.summary_narrative}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Observed Facts */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                1. Observed Facts (Records Grounding)
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {assessment.observed_facts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>

            {/* Calculated Indicators */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                2. Calculated Risk Indicators
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {assessment.calculated_indicators.map((ind, idx) => (
                  <li key={idx}>{ind}</li>
                ))}
              </ul>
            </div>

            {/* AI Interpretations */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                3. AI Interpretations & Hypotheses
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {assessment.ai_interpretations.map((interp, idx) => (
                  <li key={idx}>{interp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Executive Directives */}
          <div className="pt-2">
            <span className="text-xs font-bold text-emerald-400 block mb-2">Recommended Departmental Directives</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assessment.recommended_executive_actions.map((act, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mb-1.5 ${
                    act.urgency === 'IMMEDIATE' || act.urgency === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {act.urgency}
                  </span>
                  <p className="text-slate-200 font-medium">{act.action}</p>
                  <span className="text-[10px] text-slate-500 block mt-2">Authority: {act.authority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION J: MINISTER & SECRETARY DECISION PANEL */}
      {/* ------------------------------------------------------------- */}
      {decisions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Decisions Requiring Attention (Minister & Secretary Intervention)</h3>
                <p className="text-xs text-slate-500">Cross-departmental bottlenecks, critical quality non-conformances, and high-value expenditure queries.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {decisions.length} Escalations Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisions.map((dec) => (
              <div key={dec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    dec.escalation_level === 'MINISTER' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    Escalation: {dec.escalation_level}
                  </span>
                  <span className="text-xs font-bold text-[#006A4E] font-mono">₹{dec.financial_exposure_cr.toFixed(2)} Cr</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{dec.issue}</h4>
                <p className="text-[11px] text-slate-600">{dec.impact}</p>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Recommended Decision:</span>
                  <p className="text-slate-800 font-medium mt-0.5">{dec.recommended_decision}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Dept: <strong>{dec.responsible_department}</strong></span>
                  <button
                    onClick={() => navigate(`/project-360?id=${dec.project_id}`)}
                    className="text-[#006A4E] hover:underline font-semibold flex items-center gap-1"
                  >
                    Open Project 360 <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION D & F: CATEGORIES & FINANCIAL EXPOSURE CHARTS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section D: 10 Anomaly Categories Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">10 Anomaly Categories</h3>
            <span className="text-xs text-slate-500">Click to filter</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total_exposure_cr"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`₹${Number(val || 0).toFixed(2)} Cr`, name]}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {categories.map((c, i) => (
              <div
                key={i}
                onClick={() => setSelectedCategory(c.category === selectedCategory ? 'ALL' : c.category)}
                className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCategory === c.category ? 'bg-[#006A4E] text-white font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{c.category}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] opacity-75">{c.count} cases</span>
                  <span className="font-mono font-bold">₹{c.total_exposure_cr.toFixed(1)}Cr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section F: Exposure Analysis by Project & Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Financial Exposure Intelligence</h3>
              <p className="text-xs text-slate-500">Distribution across major highway projects & monthly historical trend.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase">Total Under Scrutiny</span>
              <span className="text-base font-bold text-[#006A4E] font-mono">
                ₹{exposureData?.total_potential_exposure_cr.toFixed(2) || '54.00'} Cr
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Project Bar Chart */}
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">Exposure by Highway Project</span>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exposureData?.by_project.slice(0, 5) || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="project_code" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} unit="Cr" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="exposure_cr" name="Exposure (₹ Cr)" fill="#7B1C1C" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend Area Chart */}
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">Detection Timeline Trend</span>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={exposureData?.month_trend || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} unit="Cr" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="exposure_cr" name="Flagged (₹ Cr)" stroke="#006A4E" fill="#006A4E" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Breakdown summary row */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Transaction Scanned</span>
              <span className="text-xs font-bold text-slate-800 font-mono">₹{exposureData?.total_transaction_value_cr.toFixed(2)} Cr</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Potential Exposure</span>
              <span className="text-xs font-bold text-rose-700 font-mono">₹{exposureData?.total_potential_exposure_cr.toFixed(2)} Cr</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Confirmed Recovery</span>
              <span className="text-xs font-bold text-emerald-700 font-mono">₹{exposureData?.total_verified_impact_cr.toFixed(2)} Cr</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Under Active Review</span>
              <span className="text-xs font-bold text-blue-700 font-mono">₹{exposureData?.total_under_review_cr.toFixed(2)} Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION E: HIGH-PRIORITY AI FINDINGS TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              High-Priority AI Anomaly Findings ({displayedFindings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Detailed registry of detected duplicate vouchers, milestone gaps, non-BOQ variations, and documentation lapses.
            </p>
          </div>
          <span className="text-xs text-slate-400">Click any row to open full audit dossier & action form</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Finding Ref</th>
                <th className="py-3 px-3">Project & Package</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Potential Exposure</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3">Responsible Dept</th>
                <th className="py-3 px-3">Review Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedFindings.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => openDetailDrawer(f)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {f.finding_code}
                    {f.scenario_id && (
                      <span className="block text-[9px] text-amber-700 font-semibold">{f.scenario_id}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{f.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{f.project_title}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{f.category}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getSeverityBadge(f.severity)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#006A4E] whitespace-nowrap">
                    ₹{f.potential_exposure_cr.toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {f.ai_confidence === 'HIGH' ? '🟢 94%' : (f.ai_confidence === 'MEDIUM' ? '🟡 78%' : '⚪ 62%')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                    {f.responsible_department}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(f.review_status)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetailDrawer(f); }}
                      className="px-2.5 py-1 rounded-md bg-[#006A4E] hover:bg-[#00523C] text-white text-[11px] font-medium transition-colors"
                    >
                      Inspect Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION G: PROJECT RISK MATRIX */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Dimensional Project Risk Matrix</h3>
            <p className="text-xs text-slate-500">Cross-evaluating financial, schedule, procurement, quality, utility, and compliance indicators.</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">Ranked by Composite Risk</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Project & Code</th>
                <th className="py-3 px-3">Programme</th>
                <th className="py-3 px-3">Composite Risk</th>
                <th className="py-3 px-3">Financial Risk</th>
                <th className="py-3 px-3">Schedule Risk</th>
                <th className="py-3 px-3">Procurement Risk</th>
                <th className="py-3 px-3">Quality Risk</th>
                <th className="py-3 px-3">Utility Risk</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riskMatrix.map((item) => (
                <tr key={item.project_id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {item.project_title}
                    <div className="text-[10px] font-mono text-slate-400">{item.project_code}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">{item.programme}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      item.overall_composite_risk >= 70 ? 'bg-rose-100 text-rose-800' : (item.overall_composite_risk >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                    }`}>
                      {item.overall_composite_risk}/100
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.financial_risk_score}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.schedule_risk_score}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.procurement_risk_score}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.quality_risk_score}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.land_utility_risk_score}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/project-360?id=${item.project_id}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                    >
                      Project 360 <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION H & I: FINDING DETAIL DRAWER & HUMAN REVIEW WORKFLOW */}
      {/* ------------------------------------------------------------- */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                    {selectedFinding.finding_code}
                  </span>
                  {getSeverityBadge(selectedFinding.severity)}
                  {getStatusBadge(selectedFinding.review_status)}
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-1">
                  {selectedFinding.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto flex-shrink-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'evidence', label: 'Evidence & Records' },
                { id: 'financial', label: 'Financial Impact' },
                { id: 'stakeholders', label: 'Stakeholders' },
                { id: 'ai', label: 'AI Explanation' },
                { id: 'history', label: 'Action History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                    drawerTab === tab.id
                      ? 'border-[#006A4E] text-[#006A4E]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Anomaly Summary</span>
                    <p className="text-slate-700 leading-relaxed mt-1 text-sm">{selectedFinding.description}</p>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                    <span className="text-[10px] font-bold uppercase block text-amber-800">What Was Detected:</span>
                    <p className="leading-relaxed">{selectedFinding.what_detected}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase block text-slate-500">Detection Rule:</span>
                    <p className="font-mono text-slate-800 text-[11px]">{selectedFinding.detection_rule}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Project</span>
                      <strong className="text-slate-900 block truncate">{selectedFinding.project_title}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Responsible Department</span>
                      <strong className="text-slate-900 block truncate">{selectedFinding.responsible_department}</strong>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'evidence' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Supporting Transaction Records</span>
                    <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                      <pre>{selectedFinding.evidence_records_json ? JSON.stringify(JSON.parse(selectedFinding.evidence_records_json), null, 2) : 'No raw telemetry attached'}</pre>
                    </div>
                  </div>

                  <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 space-y-1">
                    <span className="text-[10px] font-bold uppercase block text-sky-800">Suggested Verification Steps:</span>
                    <p className="leading-relaxed">{selectedFinding.suggested_verification}</p>
                  </div>
                </div>
              )}

              {drawerTab === 'financial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] text-rose-600 block uppercase font-bold">Potential Exposure</span>
                      <span className="text-lg font-bold text-rose-900 font-mono">₹{selectedFinding.potential_exposure_cr.toFixed(2)} Cr</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Transaction Value</span>
                      <span className="text-lg font-bold text-slate-900 font-mono">₹{selectedFinding.transaction_value_cr.toFixed(2)} Cr</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase block text-slate-500">Calculation Formula:</span>
                    <p className="font-mono text-slate-800">{selectedFinding.calculation_formula}</p>
                  </div>
                </div>
              )}

              {drawerTab === 'stakeholders' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Accountability Matrix</span>
                    <div>
                      <strong className="text-slate-900 block text-xs">{selectedFinding.responsible_officer}</strong>
                      <span className="text-slate-500 text-[11px]">{selectedFinding.responsible_department}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      Assigned Investigator: <strong>{selectedFinding.assigned_to || 'Pending Assignment'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'ai' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-purple-800 block flex items-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5" /> AI Diagnostic Reasoning
                    </span>
                    <p className="leading-relaxed">{selectedFinding.why_flagged}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">Recommended Administrative Action:</span>
                    <p className="leading-relaxed">{selectedFinding.recommended_action}</p>
                  </div>
                </div>
              )}

              {drawerTab === 'history' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Audit & Review Timeline</span>
                  {selectedFinding.actions && selectedFinding.actions.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedFinding.actions.map((act) => (
                        <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{act.action_type}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{act.created_at.substring(0, 10)}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{act.remarks}</p>
                          <span className="text-[10px] text-slate-400 block">Actor: {act.actor_name} ({act.actor_role})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No previous actions recorded.</p>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION I: HUMAN REVIEW AND ACTION WORKFLOW FORM */}
              {/* ------------------------------------------------------------- */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#006A4E]" />
                    Human Review & Action Directives
                  </span>
                  <span className="text-[10px] text-slate-400">Role: {user?.role_code || 'ADMIN'}</span>
                </div>

                {actionSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-medium">
                    {actionSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSaveReviewAction} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Update Status</label>
                      <select
                        value={reviewStatusInput}
                        onChange={(e) => setReviewStatusInput(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      >
                        <option value="NEW">New</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="EVIDENCE_REQUESTED">Evidence Requested</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="NOT_SUBSTANTIATED">Not Substantiated</option>
                        <option value="ACTION_REQUIRED">Action Required</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assign Officer</label>
                      <input
                        type="text"
                        placeholder="Officer name..."
                        value={assignedToInput}
                        onChange={(e) => setAssignedToInput(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Official Review Remarks</label>
                    <textarea
                      rows={2}
                      placeholder="Add investigation remarks or evidence findings..."
                      value={reviewRemarksInput}
                      onChange={(e) => setReviewRemarksInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Corrective Action</label>
                      <input
                        type="text"
                        placeholder="e.g., Freeze voucher in IFHRMS..."
                        value={correctiveActionInput}
                        onChange={(e) => setCorrectiveActionInput(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Action Due Date</label>
                      <input
                        type="date"
                        value={dueDateInput}
                        onChange={(e) => setDueDateInput(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="escalateSecretary"
                      checked={escalateInput}
                      onChange={(e) => setEscalateInput(e.target.checked)}
                      className="rounded border-slate-300 text-[#006A4E] focus:ring-[#006A4E]"
                    />
                    <label htmlFor="escalateSecretary" className="text-xs text-slate-700 font-medium cursor-pointer">
                      Escalate to Principal Secretary for Interdepartmental Directive
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingAction}
                      className="px-4 py-2 rounded-lg bg-[#006A4E] hover:bg-[#00523C] text-white font-medium text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {savingAction ? 'Saving Directive...' : 'Log Directive & Update Status'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

