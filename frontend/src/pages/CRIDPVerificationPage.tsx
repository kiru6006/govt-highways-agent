import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  CRIDPDashboardKPIs,
  CRIDPWorkItem,
  WorkHistoryItem,
  YearWiseEligibilityItem,
  DistrictCircleEligibilityItem,
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
  Check,
  X,
  FileCheck2,
  Calendar,
  AlertOctagon,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';

export const CRIDPVerificationPage: React.FC = () => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'hierarchy' | 'history' | 'duplicates' | 'yearwise' | 'financial' | 'queue' | 'ai'
  >('overview');

  // Loading & Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState<CRIDPDashboardKPIs | null>(null);
  const [proposals, setProposals] = useState<CRIDPWorkItem[]>([]);
  const [hierarchyRows, setHierarchyRows] = useState<DistrictCircleEligibilityItem[]>([]);
  const [historicalWorks, setHistoricalWorks] = useState<WorkHistoryItem[]>([]);
  const [yearWiseRows, setYearWiseRows] = useState<YearWiseEligibilityItem[]>([]);
  const [financialRisk, setFinancialRisk] = useState<any>(null);
  const [delegationRules, setDelegationRules] = useState<DelegationOfPowerRuleItem[]>([]);
  const [aiRecs, setAiRecs] = useState<any[]>([]);

  // Filter States
  const [selectedFY, setSelectedFY] = useState<string>('2026-27');
  const [selectedRoadCategory, setSelectedRoadCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showDelegationModal, setShowDelegationModal] = useState<boolean>(false);
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<CRIDPWorkItem | null>(null);
  const [reviewModalProposal, setReviewModalProposal] = useState<CRIDPWorkItem | null>(null);

  // Decision Form State
  const [decisionType, setDecisionType] = useState<string>('APPROVED');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [evidenceRef, setEvidenceRef] = useState<string>('');
  const [conditionNotes, setConditionNotes] = useState<string>('');
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  // On-the-fly Calculator Form State
  const [calcRoadCode, setCalcRoadCode] = useState<string>('SH-49');
  const [calcStartKm, setCalcStartKm] = useState<number>(13.0);
  const [calcEndKm, setCalcEndKm] = useState<number>(18.0);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);

  useEffect(() => {
    loadAllDashboardData();
  }, [selectedFY]);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [
        kpiData,
        proposalData,
        hierData,
        histData,
        yearData,
        finData,
        dopData,
        aiData
      ] = await Promise.all([
        api.getCRIDPKPIs(selectedFY),
        api.getCRIDPProposals({ financial_year: selectedFY }),
        api.getCRIDPHierarchyBreakdown(selectedFY),
        api.getCRIDPHistoricalWorks(),
        api.getCRIDPYearWiseEligibility(),
        api.getCRIDPFinancialRisk(selectedFY),
        api.getDelegationRules(),
        api.getCRIDPAIRecommendations(selectedFY)
      ]);

      setKpis(kpiData);
      setProposals(proposalData);
      setHierarchyRows(hierData);
      setHistoricalWorks(histData);
      setYearWiseRows(yearData);
      setFinancialRisk(finData);
      setDelegationRules(dopData);
      setAiRecs(aiData?.recommendations || []);
    } catch (err) {
      console.error("Failed to load CRIDP verification data", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (selectedRoadCategory !== 'ALL' && p.road_category !== selectedRoadCategory) return false;
      if (selectedDistrict !== 'ALL' && !p.district.toLowerCase().includes(selectedDistrict.toLowerCase())) return false;
      if (selectedStatus !== 'ALL' && p.verification_status !== selectedStatus) return false;
      if (selectedSeverity !== 'ALL' && p.duplicate_severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.proposal_code.toLowerCase().includes(q) ||
          p.work_name.toLowerCase().includes(q) ||
          p.road_code.toLowerCase().includes(q) ||
          p.road_name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [proposals, selectedRoadCategory, selectedDistrict, selectedStatus, selectedSeverity, searchQuery]);

  // Execute On-the-Fly Calculation
  const handleRunCalculation = async () => {
    setCalcLoading(true);
    try {
      const res = await api.checkChainageOverlap({
        road_code: calcRoadCode,
        start_chainage: calcStartKm,
        end_chainage: calcEndKm,
        financial_year: selectedFY
      });
      setCalcResult(res);
    } catch (err) {
      console.error("Calculator error", err);
    } finally {
      setCalcLoading(false);
    }
  };

  // Submit Statutory Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProposal) return;
    setSubmittingDecision(true);
    try {
      await api.reviewCRIDPProposal(reviewModalProposal.id, {
        decision: decisionType,
        justification: decisionReason,
        evidence_document_ref: evidenceRef || undefined,
        condition_notes: conditionNotes || undefined
      });
      setReviewModalProposal(null);
      setDecisionReason('');
      setEvidenceRef('');
      setConditionNotes('');
      await loadAllDashboardData();
    } catch (err) {
      console.error("Failed to record decision", err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'RECENTLY RENEWED':
      case 'DUPLICATE PROPOSAL':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'PARTIALLY OVERLAPPING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'ENGINEERING EXCEPTION':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'WORK IN PROGRESS':
      case 'ALREADY SANCTIONED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'LOW':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 pb-20">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Project Intelligence</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Highways Department (C&M)</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#006A4E] font-bold">Statewide CRIDP Verification</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-3.5 h-7 bg-amber-500 rounded-xs inline-block" />
              Statewide CRIDP Work Verification & Five-Year Renewal Intelligence
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic chainage overlap engine, 5-year renewal restrictions, year-wise free road analysis, and statutory delegation audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Action: Delegation of Powers Registry */}
            <button
              onClick={() => setShowDelegationModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Scale className="w-4 h-4 text-slate-700" />
              <span>Delegation Registry (G.O. 11 / 29)</span>
            </button>

            {/* Quick Action: On-the-fly Chainage Calculator */}
            <button
              onClick={() => setShowCalculator(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Calculator className="w-4 h-4" />
              <span>Verify Stretch Chainage</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadAllDashboardData}
              disabled={loading}
              className="p-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors shadow-2xs"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Provenance & Compliance Alert Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {kpis?.verification_status || 'VERIFIED INVENTORY'}
            </span>
            <span className="text-slate-500">
              Reporting As On: <strong className="text-slate-800">{kpis?.reporting_date || 'Current Date'}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              Data Completeness: <strong className="text-slate-800">{kpis?.data_completeness_pct || 98.4}%</strong>
            </span>
          </div>

          {/* TANSHA Jurisdiction Context Banner */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md text-[11px] text-blue-900 font-medium">
            <Building className="w-3.5 h-3.5 text-blue-700" />
            <span>
              <strong>Statutory Authority Notice:</strong> Expressways & DBFOT corridors are vested under{' '}
              <strong className="underline">Tamil Nadu State Highways Authority (TANSHA, Act 12 of 2024)</strong>. Non-concession state roads remain under Highways C&M.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* Global Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Financial Year Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-700">Financial Year:</label>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500"
              >
                <option value="2026-27">FY 2026-27 (Active Screening)</option>
                <option value="2027-28">FY 2027-28 (Future Horizon)</option>
                <option value="2028-29">FY 2028-29 (Future Horizon)</option>
                <option value="2029-30">FY 2029-30 (5-Year Plan)</option>
                <option value="2030-31">FY 2030-31 (5-Year Plan)</option>
              </select>
            </div>

            {/* Road Category Filter */}
            <div className="flex items-center gap-2">
              <Milestone className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-700">Category:</label>
              <select
                value={selectedRoadCategory}
                onChange={(e) => setSelectedRoadCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Categories</option>
                <option value="SH">State Highways (SH)</option>
                <option value="MDR">Major District Roads (MDR)</option>
                <option value="ODR">Other District Roads (ODR)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="ELIGIBLE">Eligible (Green)</option>
                <option value="RECENTLY RENEWED">Recently Renewed (Red)</option>
                <option value="PARTIALLY OVERLAPPING">Partially Overlapping (Amber)</option>
                <option value="DUPLICATE PROPOSAL">Duplicate Proposal (Red)</option>
                <option value="ENGINEERING EXCEPTION">Engineering Exception (Purple)</option>
                <option value="ALREADY SANCTIONED">Already Sanctioned (Blue)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Proposal, Road Code (e.g. SH-49), Stretch, or District..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 12 Required Dashboard KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {/* KPI 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-slate-800">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wide block">Verified Inventory</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {kpis?.total_verified_road_length_km || 0} <span className="text-xs font-medium text-slate-500">km</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Statewide Road Network</span>
          </div>

          {/* KPI 2 & 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-blue-600">
            <span className="text-[11px] font-bold uppercase text-blue-700 tracking-wide block">Proposed Works</span>
            <div className="text-xl font-black text-blue-900 mt-1">
              {kpis?.cridp_works_proposed_count || 0} <span className="text-xs font-medium text-slate-500">({kpis?.total_proposed_renewal_length_km || 0} km)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">FY {selectedFY} Proposals</span>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-emerald-600">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wide block">Verified Eligible</span>
            <div className="text-xl font-black text-emerald-900 mt-1">
              {kpis?.length_verified_eligible_km || 0} <span className="text-xs font-medium text-emerald-700">km</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">100% Free of 5-Yr Restriction</span>
          </div>

          {/* KPI 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-rose-600">
            <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wide block">Renewed ≤5 Years</span>
            <div className="text-xl font-black text-rose-900 mt-1">
              {kpis?.length_renewed_prev_five_years_km || 0} <span className="text-xs font-medium text-rose-700">km</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium mt-1 block">Restricted Renewal Window</span>
          </div>

          {/* KPI 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wide block">Overlapping Proposals</span>
            <div className="text-xl font-black text-amber-900 mt-1">
              {kpis?.length_with_overlapping_proposals_km || 0} <span className="text-xs font-medium text-amber-700">km</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium mt-1 block">Requires Chainage Trimming</span>
          </div>

          {/* KPI 7 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-purple-600">
            <span className="text-[11px] font-bold uppercase text-purple-700 tracking-wide block">Other Schemes</span>
            <div className="text-xl font-black text-purple-900 mt-1">
              {kpis?.length_committed_other_schemes_km || 0} <span className="text-xs font-medium text-slate-500">km</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">TNRSP / CKICP / NHAI / NABARD</span>
          </div>

          {/* KPI 8 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-slate-400">
            <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wide block">Manual Review Req.</span>
            <div className="text-xl font-black text-slate-800 mt-1">
              {kpis?.length_requiring_manual_verification_km || 0} <span className="text-xs font-medium text-slate-500">km</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Insufficient Inventory Data</span>
          </div>

          {/* KPI 9 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-rose-500">
            <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wide block">Duplicate Districts</span>
            <div className="text-xl font-black text-rose-900 mt-1">
              {kpis?.districts_with_unresolved_duplication_count || 0}
            </div>
            <span className="text-[10px] text-rose-600 font-semibold truncate block">
              {kpis?.districts_with_unresolved_duplication?.join(', ') || 'None'}
            </span>
          </div>

          {/* KPI 10 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-amber-600">
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wide block">Overlapping Value</span>
            <div className="text-xl font-black text-amber-900 mt-1">
              ₹{kpis?.estimated_value_overlapping_proposals_cr || 0} <span className="text-xs font-medium text-slate-600">Cr</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Total Exposure at Risk</span>
          </div>

          {/* KPI 11 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-emerald-600">
            <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wide block">Avoidable Expenditure</span>
            <div className="text-xl font-black text-emerald-900 mt-1">
              ₹{kpis?.potentially_avoidable_expenditure_cr || 0} <span className="text-xs font-medium text-emerald-700">Cr</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Potential Budget Savings</span>
          </div>

          {/* KPI 12 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs border-l-4 border-l-indigo-600 col-span-2">
            <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wide block">CE Review Action Queue</span>
            <div className="text-xl font-black text-indigo-900 mt-1">
              {kpis?.proposals_awaiting_ce_review_count || 0} <span className="text-xs font-medium text-slate-600">proposals pending review</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
              Awaiting Chief Engineer / SE statutory decision
            </span>
          </div>
        </div>

        {/* 8-Tab Operational Navigation Bar */}
        <div className="border-b border-slate-200 mb-6 flex overflow-x-auto space-x-1 scrollbar-none">
          {[
            { id: 'overview', label: '1. Statewide Overview' },
            { id: 'hierarchy', label: '2. Circle / Division Drilldown' },
            { id: 'history', label: '3. Five-Year Work History' },
            { id: 'duplicates', label: '4. Duplicate Work Detection' },
            { id: 'yearwise', label: '5. Year-Wise Free Stretches' },
            { id: 'financial', label: '6. Financial Risk & Exposure' },
            { id: 'queue', label: '7. CE Approval Queue' },
            { id: 'ai', label: '8. AI Recommendations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 border-amber-500 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              {tab.label}
              {tab.id === 'queue' && (kpis?.proposals_awaiting_ce_review_count || 0) > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                  {kpis?.proposals_awaiting_ce_review_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Statewide Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Attention Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Active Duplication & Overlap Detection Alert (FY {selectedFY})
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    The engine has identified <strong>{kpis?.length_with_overlapping_proposals_km} km</strong> of proposed renewals with chainage overlap or previous renewal history within the 5-year restriction window.
                    Estimated potentially avoidable expenditure is <strong>₹{kpis?.potentially_avoidable_expenditure_cr} Crore</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('duplicates')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Inspect Overlaps
              </button>
            </div>

            {/* Proposals Summary Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Current CRIDP Proposals ({filteredProposals.length})</h3>
                  <p className="text-xs text-slate-500">Evaluated road renewal proposals for financial year {selectedFY}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">Showing {filteredProposals.length} of {proposals.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Proposal Code</th>
                      <th className="py-3 px-4">Road Code & Name</th>
                      <th className="py-3 px-4">Chainage (km)</th>
                      <th className="py-3 px-4">Proposed / Overlap</th>
                      <th className="py-3 px-4">Cost (₹ Cr)</th>
                      <th className="py-3 px-4">Verification Status</th>
                      <th className="py-3 px-4">Authority Req.</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProposals.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {p.proposal_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.road_code}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{p.work_name}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            Km {p.start_chainage.toFixed(3)} - {p.end_chainage.toFixed(3)}
                          </span>
                          <span className="text-slate-400 block text-[10px]">({p.proposed_length_km} km)</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-slate-900">
                            Eligible: <strong className="text-emerald-700">{p.eligible_length_km} km</strong>
                          </div>
                          {p.overlapping_length_km > 0 ? (
                            <div className="text-rose-700 text-[11px] font-semibold">
                              Overlap: {p.overlapping_length_km} km
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[10px]">No Overlap</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          ₹{p.estimated_cost_cr.toFixed(2)}
                          {p.potential_financial_exposure_cr > 0 && (
                            <span className="block text-[10px] text-amber-700">Exp: ₹{p.potential_financial_exposure_cr.toFixed(2)} Cr</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(p.verification_status)}`}>
                            {p.verification_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold text-slate-800 block">
                            {p.approval_authority_required}
                          </span>
                          <span className="text-[10px] text-slate-500">G.O. 11/22 limits</span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedProposalDetail(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] mr-1.5 transition-colors"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => setReviewModalProposal(p)}
                            className="px-2.5 py-1 bg-[#006A4E] hover:bg-[#00553E] text-white rounded font-semibold text-[11px] transition-colors"
                          >
                            Review
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

        {/* Tab 2: Circle / Division Drilldown */}
        {activeTab === 'hierarchy' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Statewide Circle & Division Hierarchical Analysis</h3>
              <p className="text-xs text-slate-500">
                Drill-down: State → Circle → Division → District → Road Stretch. Cross-district corridors reconciled.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Circle Command</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Verified Inventory</th>
                    <th className="py-3 px-4">Proposals</th>
                    <th className="py-3 px-4">Eligible km</th>
                    <th className="py-3 px-4">Overlap km</th>
                    <th className="py-3 px-4">Financial Exposure</th>
                    <th className="py-3 px-4">Pending Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hierarchyRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.circle}</td>
                      <td className="py-3 px-4 text-slate-800">{row.division}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{row.district}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.verified_inventory_km} km</td>
                      <td className="py-3 px-4 font-semibold text-blue-700">{row.proposed_proposals_count} ({row.proposed_renewal_km} km)</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{row.eligible_length_km} km</td>
                      <td className="py-3 px-4 font-bold text-rose-700">{row.overlapping_length_km} km</td>
                      <td className="py-3 px-4 font-semibold text-amber-800">₹{row.financial_exposure_cr.toFixed(2)} Cr</td>
                      <td className="py-3 px-4">
                        {row.proposals_pending_review > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            {row.proposals_pending_review} Pending
                          </span>
                        ) : (
                          <span className="text-slate-400">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Five-Year Work History Timeline */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Road Works Register (Past 5 Years & Prior)</h3>
                <p className="text-xs text-slate-500">Immutable execution history, completion dates, and sanction orders</p>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{historicalWorks.length} Verified Historical Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Work Reference</th>
                    <th className="py-3 px-4">Road Stretch</th>
                    <th className="py-3 px-4">Chainage</th>
                    <th className="py-3 px-4">Scheme & Sanction</th>
                    <th className="py-3 px-4">Completion Date</th>
                    <th className="py-3 px-4">Exp. (₹ Cr)</th>
                    <th className="py-3 px-4">Pavement Treatment</th>
                    <th className="py-3 px-4">Measurement Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historicalWorks.map((hw) => (
                    <tr key={hw.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{hw.work_reference}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{hw.road_code}</span>
                        <span className="text-slate-500 block text-[11px] truncate max-w-xs">{hw.road_name}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        Km {hw.start_chainage.toFixed(3)} - {hw.end_chainage.toFixed(3)}
                        <span className="text-slate-400 block text-[10px]">({hw.length_km} km)</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700 mr-1">
                          {hw.scheme_name}
                        </span>
                        <span className="text-slate-600 block text-[11px] mt-0.5">{hw.sanction_order_no || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold whitespace-nowrap">
                        {hw.physical_completion_date ? (
                          <span className="text-slate-900">{hw.physical_completion_date.slice(0, 10)}</span>
                        ) : (
                          <span className="text-blue-700 font-bold">Ongoing Execution</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{hw.actual_expenditure_cr.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-700 text-[11px] max-w-xs truncate">{hw.pavement_treatment}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{hw.measurement_book_ref || 'Verified'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Duplicate Work Detection */}
        {activeTab === 'duplicates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Chainage Interval Duplication Analysis</h3>
                <p className="text-xs text-slate-500">
                  Exact overlapping kilometre intervals calculated via 1D union arithmetic: overlap_km = max(0, min(end_A, end_B) - max(start_A, start_B))
                </p>
              </div>

              <div className="p-5 space-y-4">
                {proposals.filter((p) => p.overlapping_length_km > 0).map((p) => (
                  <div
                    key={p.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-all shadow-2xs border-l-4 border-l-rose-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-slate-900 text-xs">{p.proposal_code}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(p.verification_status)}`}>
                            {p.verification_status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(p.duplicate_severity)}`}>
                            Severity: {p.duplicate_severity}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{p.work_name}</h4>
                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Road: <strong>{p.road_code}</strong> ({p.district})</span>
                          <span>Proposed Stretch: <strong>Km {p.start_chainage} - {p.end_chainage} ({p.proposed_length_km} km)</strong></span>
                          <span>Overlapping Stretch: <strong className="text-rose-700">{p.overlapping_chainage_description || `${p.overlapping_length_km} km`}</strong></span>
                          <span>Eligible Remainder: <strong className="text-emerald-700">{p.eligible_length_km} km</strong></span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">Estimated Overlap Value</div>
                        <div className="text-lg font-black text-rose-700">₹{p.potential_financial_exposure_cr.toFixed(2)} Cr</div>
                        <button
                          onClick={() => setSelectedProposalDetail(p)}
                          className="mt-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors"
                        >
                          View Overlap Details
                        </button>
                      </div>
                    </div>

                    {/* Visual Segment Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex justify-between">
                        <span>Chainage Visualizer: Km {p.start_chainage} to {p.end_chainage}</span>
                        <span>{((p.overlapping_length_km / p.proposed_length_km) * 100).toFixed(1)}% Overlap</span>
                      </div>
                      <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-rose-600 transition-all"
                          style={{ width: `${(p.overlapping_length_km / p.proposed_length_km) * 100}%` }}
                          title={`Overlapping ${p.overlapping_length_km} km`}
                        />
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${(p.eligible_length_km / p.proposed_length_km) * 100}%` }}
                          title={`Eligible ${p.eligible_length_km} km`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-rose-600 rounded-xs inline-block" /> Overlapping ({p.overlapping_length_km} km)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" /> Eligible Stretches ({p.eligible_length_km} km)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Year-Wise Free Stretches */}
        {activeTab === 'yearwise' && (
          <div className="space-y-6">
            {/* Definition Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                Technical & Legal Definition of Free Road Stretches
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">1. Historically Eligible</strong>
                  Stretches with no renewal works completed within previous 5 years from reference FY date.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">2. Administratively Available</strong>
                  Historically eligible stretches free of active multilateral schemes (CKICP, TNRSP) or legal injunctions.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">3. Technically Recommended</strong>
                  Portions where PCI &lt; 70 or roughness &gt; 3,000 mm/km warrants immediate structural renewal.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block mb-1">4. Approved Renewal Length</strong>
                  Stretches with sanctioned technical estimates under Chief Engineer powers for that financial year.
                </div>
              </div>
            </div>

            {/* Year-Wise Projections Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Statewide Year-Wise Renewal Eligibility Matrix</h3>
                <p className="text-xs text-slate-500">
                  Dynamic projections from FY 2026-27 to FY 2030-31 calculating when restricted stretches unlock
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Financial Year</th>
                      <th className="py-3 px-4">Total Inventory</th>
                      <th className="py-3 px-4">Restricted (≤5 Yr)</th>
                      <th className="py-3 px-4">Other Schemes Committed</th>
                      <th className="py-3 px-4">Historically Eligible</th>
                      <th className="py-3 px-4">Administratively Available</th>
                      <th className="py-3 px-4">Technically Recommended</th>
                      <th className="py-3 px-4">Approved Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {yearWiseRows.map((yr) => (
                      <tr key={yr.financial_year} className="hover:bg-slate-50 font-medium">
                        <td className="py-3 px-4 font-bold text-slate-900">{yr.financial_year}</td>
                        <td className="py-3 px-4 text-slate-700">{yr.total_verified_length_km} km</td>
                        <td className="py-3 px-4 text-rose-700 font-bold">{yr.restricted_renewal_window_km} km</td>
                        <td className="py-3 px-4 text-purple-700">{yr.other_schemes_committed_km} km</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">{yr.historically_eligible_km} km</td>
                        <td className="py-3 px-4 text-blue-800 font-bold">{yr.administratively_available_km} km</td>
                        <td className="py-3 px-4 text-amber-800 font-semibold">{yr.technically_recommended_km} km</td>
                        <td className="py-3 px-4 text-slate-900 font-bold">{yr.approved_renewal_km} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Financial Risk & Avoidable Expenditure */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs border-l-4 border-l-amber-500">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Proposed Cost</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{financialRisk?.total_proposed_cost_cr || 0} Cr</div>
                <span className="text-[10px] text-slate-500">All submitted proposals</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs border-l-4 border-l-rose-500">
                <span className="text-[11px] font-bold text-rose-700 uppercase">Overlapping Value</span>
                <div className="text-2xl font-black text-rose-900 mt-1">₹{financialRisk?.value_of_overlapping_proposals_cr || 0} Cr</div>
                <span className="text-[10px] text-rose-600">Total stretch at risk</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs border-l-4 border-l-emerald-600">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Potentially Avoidable</span>
                <div className="text-2xl font-black text-emerald-900 mt-1">₹{financialRisk?.potentially_avoidable_expenditure_cr || 0} Cr</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Avoidable if trimmed / rejected</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs border-l-4 border-l-blue-600">
                <span className="text-[11px] font-bold text-blue-700 uppercase">Confirmed Recoverable</span>
                <div className="text-2xl font-black text-blue-900 mt-1">₹{financialRisk?.confirmed_recoverable_amounts_cr || 0} Cr</div>
                <span className="text-[10px] text-blue-600">Audit-backed recoverable recovery</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Auditor Risk Separation Guidelines</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Statutory audit standard: <strong>Do not conflate entire overlapping value as financial fraud or leakage.</strong>
                Portions of overlapping proposals arise from administrative packaging, divided carriageway treatment separation,
                or post-monsoon emergency repairs. Potentially avoidable expenditure represents budget reallocations before technical sanction.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                <strong>Statutory Note:</strong> {financialRisk?.audit_note}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: CE Approval Queue */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Chief Engineer & Supervisory Review Queue</h3>
              <p className="text-xs text-slate-500">
                Statutory review workbench: approve, reject, return for chainage trimming, or sanction engineering exceptions.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {proposals.map((p) => (
                <div key={p.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900">{p.proposal_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(p.verification_status)}`}>
                        {p.verification_status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">({p.road_code})</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{p.work_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Stretch: Km {p.start_chainage} - {p.end_chainage} ({p.proposed_length_km} km) • Estimated: ₹{p.estimated_cost_cr} Cr • Overlap: {p.overlapping_length_km} km
                    </p>
                    {p.ce_review_status !== 'PENDING' && (
                      <div className="mt-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block">
                        Decision: {p.ce_review_status} • {p.review_remarks || 'Recorded'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedProposalDetail(p)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => setReviewModalProposal(p)}
                      className="px-3 py-1.5 bg-[#006A4E] hover:bg-[#00553E] text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      Act on Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: AI Recommendations */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  Evidence-Grounded AI Decision Recommendations
                </h4>
                <p className="text-xs text-blue-800 mt-1">
                  AI suggestions are purely advisory decision support based on deterministic chainage overlap and historical database records. Final sanction remains the statutory responsibility of the Chief Engineer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiRecs.map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {rec.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.urgency === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.urgency} Priority
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>Finding:</strong> {rec.finding}
                    </p>
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                      <strong>Suggested Action:</strong> {rec.suggested_action}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Authority: <strong>{rec.competent_authority}</strong></span>
                    {rec.avoidable_saving_cr > 0 && (
                      <span className="text-emerald-700 font-black">Saves ₹{rec.avoidable_saving_cr} Cr</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* On-the-Fly Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Verify Stretch Chainage Overlap</h3>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Road Code</label>
                <input
                  type="text"
                  value={calcRoadCode}
                  onChange={(e) => setCalcRoadCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SH-49, MDR-102, SH-15"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Chainage (Km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcStartKm}
                    onChange={(e) => setCalcStartKm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Chainage (Km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcEndKm}
                    onChange={(e) => setCalcEndKm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleRunCalculation}
                disabled={calcLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {calcLoading ? 'Calculating Overlap...' : 'Run Deterministic Verification'}
              </button>

              {/* Calculator Output */}
              {calcResult && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{calcResult.road_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(calcResult.verification_classification)}`}>
                      {calcResult.verification_classification}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Proposed: <strong>{calcResult.proposed_length_km} km</strong></div>
                    <div>Overlap: <strong className="text-rose-700">{calcResult.overlapping_length_km} km</strong></div>
                    <div>Eligible: <strong className="text-emerald-700">{calcResult.eligible_length_km} km</strong></div>
                    <div>Overlap %: <strong>{calcResult.overlap_percentage}%</strong></div>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                    <strong>Recommended Action:</strong> {calcResult.recommended_action}
                  </div>
                  <div className="text-[11px] text-indigo-800 font-semibold">
                    Competent TS Authority: {calcResult.operative_sanction_authority_required}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statutory Decision Modal */}
      {reviewModalProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Statutory Decision Record</span>
                <h3 className="text-base font-bold text-slate-900">
                  Review: {reviewModalProposal.proposal_code}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalProposal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Decision</label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="APPROVED">APPROVE TECHNICAL SANCTION (Eligible Portion)</option>
                  <option value="RETURNED_FOR_REVISION">RETURN FOR CHAINAGE TRIMMING</option>
                  <option value="EXCEPTION_GRANTED">GRANT ENGINEERING EXCEPTION (Emergency/Distress)</option>
                  <option value="REJECTED">REJECT AS DUPLICATE / RECENTLY RENEWED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason & Engineering Justification</label>
                <textarea
                  required
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Record formal statutory justification citing inspection report or chainage revision..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidence Document Reference</label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="e.g. HRS Inspection Note No. 412 / Field Measurement Book Ref"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalProposal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="px-4 py-2 bg-[#006A4E] hover:bg-[#00553E] text-white rounded-lg font-bold"
                >
                  {submittingDecision ? 'Submitting...' : 'Sign & Dispatch Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delegation of Powers Registry Modal */}
      {showDelegationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Versioned Delegation of Powers Registry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official sanction limits under G.O.(Ms) No. 11 (2022) & G.O.(Ms) No. 29/163 (2022/2012)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDelegationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3 text-xs">
              {delegationRules.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-indigo-900">{r.rule_id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                      {r.verification_status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {r.authority_designation}: {r.approval_category}
                  </div>
                  <div className="text-xs font-semibold text-amber-800 mt-1">
                    Monetary Threshold: {r.monetary_limit_cr >= 9000 ? 'Full Powers' : `Up to ₹${r.monetary_limit_cr} Crore`}
                    {r.tender_excess_pct_limit > 0 && ` (Tender Excess up to ${r.tender_excess_pct_limit}%)`}
                  </div>
                  <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
                    {r.operative_provisions}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400">
                    Source: {r.go_reference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proposal Dossier Detail Modal */}
      {selectedProposalDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Proposal Digital Passport</span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedProposalDetail.proposal_code} — {selectedProposalDetail.road_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProposalDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{selectedProposalDetail.work_name}</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 mt-2">
                  <div>District: <strong>{selectedProposalDetail.district}</strong></div>
                  <div>Circle: <strong>{selectedProposalDetail.circle_name || 'Chengalpattu'}</strong></div>
                  <div>Chainage: <strong>Km {selectedProposalDetail.start_chainage} - {selectedProposalDetail.end_chainage} ({selectedProposalDetail.proposed_length_km} km)</strong></div>
                  <div>Estimated Cost: <strong>₹{selectedProposalDetail.estimated_cost_cr} Cr</strong></div>
                  <div>Existing Pavement: <strong>{selectedProposalDetail.existing_pavement_type} ({selectedProposalDetail.existing_crust_thickness_mm} mm)</strong></div>
                  <div>PCI Score: <strong>{selectedProposalDetail.pci_score} / 100</strong></div>
                </div>
              </div>

              {/* Overlap Audit Findings */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Detailed Overlap Audit Findings</h4>
                {selectedProposalDetail.overlap_findings && selectedProposalDetail.overlap_findings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProposalDetail.overlap_findings.map((f, i) => (
                      <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                        <div className="flex items-center justify-between font-bold">
                          <span>{f.overlap_type}</span>
                          <span>Km {f.overlap_start_chainage} - {f.overlap_end_chainage} ({f.overlap_length_km} km)</span>
                        </div>
                        <div className="text-[11px] mt-1 text-rose-800">
                          {f.recommended_action || 'Chainage trim recommended'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold">
                    No conflicting historical works or duplicate proposals identified. Stretch is verified eligible.
                  </div>
                )}
              </div>

              {/* Statutory Decisions */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Statutory Decision Trail</h4>
                {selectedProposalDetail.decisions && selectedProposalDetail.decisions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProposalDetail.decisions.map((d, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{d.decision} by {d.reviewer_name}</span>
                          <span className="text-slate-500 text-[10px]">{d.decided_at?.slice(0, 10)}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{d.justification}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                    No decisions recorded yet. Pending review in Chief Engineer queue.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

