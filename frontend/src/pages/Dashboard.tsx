import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ZoneComparisonChart, PortfolioDonut, ProgressComparisonChart } from '../components/Charts';
import {
  ExecutiveKPIs,
  PortfolioStageItem,
  ZoneComparisonItem,
  CriticalLeadershipIssue,
  InterdepartmentalBlocker,
  FinancialLeakageFinding,
  QualityDefectRecord,
  ContractorEvaluation,
  LegalMatter,
  LeadershipDecision,
  ProjectItem,
  RoadType
} from '../types';
import { RoadBadge } from '../components/RoadBadge';
import {
  AlertTriangle,
  Building2,
  FileCheck,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Filter,
  RefreshCw,
  Scale,
  Award,
  CircleDollarSign,
  Briefcase,
  HardHat,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  FileText,
  X,
  ExternalLink,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Filters State
  const [financialYear, setFinancialYear] = useState('FY 2025-26');
  const [selectedZone, setSelectedZone] = useState<number | undefined>(undefined);
  const [selectedRoadType, setSelectedRoadType] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Executive Data State
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [portfolioStages, setPortfolioStages] = useState<PortfolioStageItem[]>([]);
  const [zoneComparisons, setZoneComparisons] = useState<ZoneComparisonItem[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<CriticalLeadershipIssue[]>([]);
  const [blockers, setBlockers] = useState<InterdepartmentalBlocker[]>([]);
  const [leakageFindings, setLeakageFindings] = useState<FinancialLeakageFinding[]>([]);
  const [qualityDefects, setQualityDefects] = useState<QualityDefectRecord[]>([]);
  const [contractors, setContractors] = useState<ContractorEvaluation[]>([]);
  const [legalMatters, setLegalMatters] = useState<LegalMatter[]>([]);
  const [decisions, setDecisions] = useState<LeadershipDecision[]>([]);
  const [loading, setLoading] = useState(true);

  // Active View Tab State
  const [activeTab, setActiveTab] = useState<
    'critical' | 'interdept' | 'leakage' | 'quality' | 'zones' | 'portfolio' | 'contractors' | 'legal' | 'decisions'
  >('critical');

  // Drilldown Modal State
  const [drilldownModal, setDrilldownModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    metricKey: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    metricKey: ''
  });

  // New Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    linkedIssueId?: number;
    defaultTitle?: string;
  }>({
    isOpen: false
  });
  const [decisionForm, setDecisionForm] = useState({
    required_decision: '',
    assigned_authority: 'Chief Engineer (Highways - Projects)',
    action_type: 'FORWARD_COORDINATION',
    supporting_evidence: '',
    resolution_notes: ''
  });
  const [savingDecision, setSavingDecision] = useState(false);

  const loadExecutiveData = async () => {
    try {
      setLoading(true);
      const [
        kpisData,
        portfolioData,
        zonesData,
        issuesData,
        blockersData,
        leakageData,
        qualityData,
        contractorsData,
        legalData,
        decisionsData
      ] = await Promise.all([
        api.getExecutiveKPIs({
          financial_year: financialYear,
          zone_id: selectedZone,
          road_type: selectedRoadType,
          risk_status: selectedRisk,
          stage: selectedStage
        }),
        api.getPortfolioStages(),
        api.getZoneComparison(),
        api.getCriticalIssues(),
        api.getInterdepartmentalBlockers(),
        api.getFinancialLeakageFindings(),
        api.getQualityDefects(),
        api.getContractorEvaluations(),
        api.getLegalMatters(),
        api.getLeadershipDecisions()
      ]);

      setKpis(kpisData);
      setPortfolioStages(portfolioData);
      setZoneComparisons(zonesData);
      setCriticalIssues(issuesData);
      setBlockers(blockersData);
      setLeakageFindings(leakageData);
      setQualityDefects(qualityData);
      setContractors(contractorsData);
      setLegalMatters(legalData);
      setDecisions(decisionsData);
    } catch (err) {
      console.error('Failed to load executive command data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutiveData();
  }, [user, financialYear, selectedZone, selectedRoadType, selectedRisk, selectedStage]);

  const handleOpenDrilldown = (title: string, description: string, metricKey: string) => {
    setDrilldownModal({
      isOpen: true,
      title,
      description,
      metricKey
    });
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionForm.required_decision.trim()) return;

    try {
      setSavingDecision(true);
      await api.recordLeadershipDecision({
        required_decision: decisionForm.required_decision,
        assigned_authority: decisionForm.assigned_authority,
        action_type: decisionForm.action_type,
        leadership_issue_id: decisionModal.linkedIssueId,
        supporting_evidence: decisionForm.supporting_evidence,
        resolution_notes: decisionForm.resolution_notes
      });
      setDecisionModal({ isOpen: false });
      setDecisionForm({
        required_decision: '',
        assigned_authority: 'Chief Engineer (Highways - Projects)',
        action_type: 'FORWARD_COORDINATION',
        supporting_evidence: '',
        resolution_notes: ''
      });
      await loadExecutiveData();
    } catch (err) {
      console.error('Error saving decision', err);
    } finally {
      setSavingDecision(false);
    }
  };

  const activeFilterCount =
    (financialYear !== 'FY 2025-26' ? 1 : 0) +
    (selectedZone !== undefined ? 1 : 0) +
    (selectedRoadType !== 'ALL' ? 1 : 0) +
    (selectedRisk !== 'ALL' ? 1 : 0) +
    (selectedStage !== 'ALL' ? 1 : 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-[#006A4E] text-[#E6F4EA] text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-[#B2DFCD]/40 uppercase tracking-wide">
              Executive Command Centre • Phase 2
            </span>
            <span className="text-slate-400 text-[10px] sm:text-xs font-mono">
              Period: {kpis?.reporting_period} | Freshness: {kpis?.data_freshness}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
            Statewide Highways Intelligence Smartboard
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Active Role: <span className="font-semibold text-emerald-400">{user?.role_name}</span> | Scope:{' '}
            <span className="font-semibold text-amber-300">
              {user?.circle_id ? 'Chengalpattu Circle' : user?.zone_id ? 'Chennai Zone' : 'Statewide Executive Oversight'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/10 backdrop-blur-xs flex-shrink-0 self-start md:self-auto">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFCC00] flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">Monitored Portfolio Value</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono">
              ₹{kpis?.total_approved_project_value_cr.toFixed(2) || '245.30'} <span className="text-xs font-normal">Crores</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Filter Toolbar (Section 3.A) with Mobile Accordion */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              aria-expanded={mobileFiltersOpen}
            >
              <Filter className="w-3.5 h-3.5 text-[#006A4E]" />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[#006A4E]" />
              Global Executive Filters & Cohorts {activeFilterCount > 0 && <span className="text-[10px] font-mono text-[#006A4E]">({activeFilterCount} active)</span>}
            </div>
          </div>
          <button
            onClick={() => {
              setFinancialYear('FY 2025-26');
              setSelectedZone(undefined);
              setSelectedRoadType('ALL');
              setSelectedRisk('ALL');
              setSelectedStage('ALL');
            }}
            className="text-xs text-[#006A4E] hover:underline font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>

        <div className={`${mobileFiltersOpen ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs`}>
          {/* Financial Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="FY 2025-26">FY 2025-26 (Current)</option>
              <option value="FY 2024-25">FY 2024-25</option>
              <option value="FY 2023-24">FY 2023-24</option>
            </select>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Administrative Zone</label>
            <select
              value={selectedZone || ''}
              onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="">All Zones (Statewide)</option>
              <option value="1">Chennai Zone</option>
              <option value="2">Coimbatore Zone</option>
              <option value="3">Madurai Zone</option>
              <option value="4">Tiruchirappalli Zone</option>
              <option value="5">Salem Zone</option>
            </select>
          </div>

          {/* Road Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Road Classification</label>
            <select
              value={selectedRoadType}
              onChange={(e) => setSelectedRoadType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Classifications</option>
              <option value="SH">State Highways (SH)</option>
              <option value="NH">National Highways (NH)</option>
              <option value="MDR">Major District Roads (MDR)</option>
              <option value="ODR">Other District Roads (ODR)</option>
              <option value="RURAL">Rural Roads</option>
            </select>
          </div>

          {/* Risk Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Risk Profile</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Project Stage */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Execution Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Stages</option>
              <option value="PLANNING">Planning & DPR</option>
              <option value="TENDERED">Tendered</option>
              <option value="IN_PROGRESS">Execution in Progress</option>
              <option value="DELAYED">Delayed / Schedule Slip</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. The 16 Department Performance KPIs Grid (Section 3.B) */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Department Performance KPIs (16 Core Metrics)
            </h3>
            <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">Click card to inspect</span>
          </div>
          <span className="text-[10px] sm:text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium self-start sm:self-auto">
            Sample: {kpis?.cohort_sample_size || 3} Projects
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 md:gap-3">
          {/* KPI 1 */}
          <div
            onClick={() => handleOpenDrilldown('Total Active Projects', 'All projects currently sanctioned, tendered, or in execution', 'active_projects')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#006A4E] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">1. Active Works</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 group-hover:text-[#006A4E] truncate">
              {kpis?.total_active_projects || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Monitored</div>
          </div>

          {/* KPI 2 */}
          <div
            onClick={() => handleOpenDrilldown('Approved Value', 'Total sanctioned capital budget under CMRDP/CRIDP', 'approved_value')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#006A4E] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">2. Approved Val</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 group-hover:text-[#006A4E] truncate">
              ₹{kpis?.total_approved_project_value_cr.toFixed(1) || 0} Cr
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Sanctioned</div>
          </div>

          {/* KPI 3 */}
          <div
            onClick={() => handleOpenDrilldown('Actual Expenditure', 'Recorded billable expenditure to date against LC sanctions', 'expenditure')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#006A4E] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">3. Expenditure</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 group-hover:text-[#006A4E] truncate">
              ₹{kpis?.total_expenditure_cr.toFixed(1) || 0} Cr
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 truncate">42.1% Utilized</div>
          </div>

          {/* KPI 4 */}
          <div
            onClick={() => handleOpenDrilldown('Physical Progress', 'Average weighted physical progress verified via field inspections', 'progress')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#006A4E] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">4. Physical %</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-[#006A4E] font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.total_physical_progress_pct || 0}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Site Verified</div>
          </div>

          {/* KPI 5 */}
          <div
            onClick={() => handleOpenDrilldown('Projects Delayed', 'Projects exceeding contractual milestone dates', 'delayed')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-red-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide truncate">5. Delayed</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-red-600 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.projects_delayed || 0}
            </div>
            <div className="text-[10px] text-red-500 font-semibold mt-0.5 truncate">+45d Slip</div>
          </div>

          {/* KPI 6 */}
          <div
            onClick={() => handleOpenDrilldown('High Risk Projects', 'Projects designated as Critical or High priority bottleneck', 'risk')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wide truncate">6. High Risk</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-amber-600 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.projects_high_risk || 0}
            </div>
            <div className="text-[10px] text-amber-500 font-semibold mt-0.5 truncate">Needs Action</div>
          </div>

          {/* KPI 7 */}
          <div
            onClick={() => handleOpenDrilldown('Pending Approvals', 'Technical, Administrative, or Revised Estimate approvals pending', 'approvals')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide truncate">7. Approvals</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-blue-600 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.pending_approvals || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">TS / AS Pending</div>
          </div>

          {/* KPI 8 */}
          <div
            onClick={() => handleOpenDrilldown('Pending Land Acquisition', 'Total land area pending award enquiry under TN Highways Act 2001', 'la')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#004B87] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-[#004B87] uppercase tracking-wide truncate">8. Pending LA</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-[#004B87] font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.pending_land_acquisition_ha || 0} <span className="text-[11px] font-normal">Ha</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Sec 15(2)</div>
          </div>

          {/* KPI 9 */}
          <div
            onClick={() => handleOpenDrilldown('Pending Utility Shifting', 'TANGEDCO electric poles, TWAD water pipelines, and OFC lines', 'utility')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-800 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide truncate">9. Utilities</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.pending_utility_shifting_count || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">EB Poles/TWAD</div>
          </div>

          {/* KPI 10 */}
          <div
            onClick={() => handleOpenDrilldown('Open Quality Defects', 'Non-conformance reports, core density failures, and lab cube test fails', 'defects')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-red-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide truncate">10. Defects</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-red-600 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.open_quality_defects || 0}
            </div>
            <div className="text-[10px] text-red-500 font-semibold mt-0.5 truncate">HRS Lab Fail</div>
          </div>

          {/* KPI 11 */}
          <div
            onClick={() => handleOpenDrilldown('Pending Contractor Obligations', 'Expired bank guarantees, delayed submissions, or performance defaults', 'contractor_obligations')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide truncate">11. Cont. Default</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-amber-700 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.pending_contractor_obligations || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Under Scrutiny</div>
          </div>

          {/* KPI 12 */}
          <div
            onClick={() => handleOpenDrilldown('Open Legal Cases', 'High Court writs, PILs, and arbitration proceedings', 'legal')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-600 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide truncate">12. Legal Cases</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-purple-700 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.open_legal_cases || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">HC / Tribunal</div>
          </div>

          {/* KPI 13 */}
          <div
            onClick={() => handleOpenDrilldown('Unresolved Audit Observations', 'Accountant General (AG) audit paras pending settlement', 'audit')}
            className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide truncate">13. AG Audit</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 truncate">
              {kpis?.unresolved_audit_observations || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">Para Pending</div>
          </div>

          {/* KPI 14 (Distinct Financial Bucket) */}
          <div
            onClick={() => handleOpenDrilldown('Potential Financial Exposure', 'Unreconciled advance risk, measurement variance, or penalty exposure', 'exposure')}
            className="bg-red-50/50 rounded-xl p-2.5 sm:p-3 border border-red-200 shadow-2xs hover:shadow-md hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide truncate">14. Exposure</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-red-700 font-mono mt-0.5 sm:mt-1 truncate">
              ₹{kpis?.potential_financial_exposure_cr.toFixed(2) || 0} Cr
            </div>
            <div className="text-[10px] text-red-500 font-semibold mt-0.5 truncate">Potential Risk</div>
          </div>

          {/* KPI 15 (Distinct Financial Bucket) */}
          <div
            onClick={() => handleOpenDrilldown('Verified Financial Recovery', 'Actual recovered amounts through bill withholdings and penalty deductions', 'recovery')}
            className="bg-emerald-50/50 rounded-xl p-2.5 sm:p-3 border border-[#B2DFCD] shadow-2xs hover:shadow-md hover:border-[#006A4E] transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-[#006A4E] uppercase tracking-wide truncate">15. Recovery</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-[#006A4E] font-mono mt-0.5 sm:mt-1 truncate">
              ₹{kpis?.verified_financial_recovery_cr.toFixed(2) || 0} Cr
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 truncate">Verified Inward</div>
          </div>

          {/* KPI 16 (Distinct Financial Bucket) */}
          <div
            onClick={() => handleOpenDrilldown('Verified Prevented Expenditure', 'Expenditure prevented by detecting quantity inflation and duplicate claims', 'prevented')}
            className="bg-blue-50/50 rounded-xl p-2.5 sm:p-3 border border-blue-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide truncate">16. Prevented</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-blue-700 font-mono mt-0.5 sm:mt-1 truncate">
              ₹{kpis?.verified_prevented_expenditure_cr.toFixed(2) || 0} Cr
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5 truncate">Leakage Blocked</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Statutory Accounting Note: Actual expenditure, potential exposure, verified recovery, and prevented expenditure are tracked as distinct ledgers.
          </span>
          <span className="font-mono text-slate-600 font-semibold">TN-HDOS-P2-FIN</span>
        </div>
      </div>

      {/* 4. Executive Navigation Tabs for Deep Intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/70 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1. Leadership Interventions</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {criticalIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('interdept')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'interdept'
                ? 'bg-[#004B87] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2. Interdepartmental Friction</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {blockers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leakage')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'leakage'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            <span>3. Leakage Intelligence</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {leakageFindings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quality'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Quality & HRS Audits</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {qualityDefects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'zones'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5. Zone Benchmarking</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {zoneComparisons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>6. Statewide Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'contractors'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>7. Contractors</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'legal'
                ? 'bg-[#006A4E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>8. Legal & AG Paras</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'decisions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>9. Leadership Decisions</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {decisions.length}
            </span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* TAB 1: CRITICAL ISSUES REQUIRING LEADERSHIP INTERVENTION (Section 3.E) */}
          {activeTab === 'critical' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-base font-bold text-red-700 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    CRITICAL ISSUES REQUIRING LEADERSHIP INTERVENTION
                  </h4>
                  <p className="text-xs text-slate-500">
                    Highest-urgency statutory bottlenecks causing significant schedule or financial slip
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDecisionModal({
                      isOpen: true,
                      defaultTitle: 'Executive Order on Immediate Highway Bottleneck Resolution'
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors self-start"
                >
                  <PlusCircle className="w-4 h-4" /> Issue Leadership Directive
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {criticalIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-5 rounded-xl border border-red-200 bg-red-50/20 hover:bg-red-50/40 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-300">
                          {issue.issue_reference}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {issue.district} District
                        </span>
                        <span className="text-xs font-bold text-slate-500">•</span>
                        <span className="text-xs font-semibold text-[#004B87]">
                          {issue.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Pending: {issue.days_pending} Days
                        </span>
                        <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Exposure: ₹{issue.financial_exposure_cr.toFixed(2)} Cr
                        </span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-slate-900">{issue.issue_reference}: {issue.category}</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {issue.problem_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Root Cause / Suspected Friction:</span>
                        <span className="text-slate-600">{issue.root_cause}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Accountable Stakeholders:</span>
                        <div className="text-slate-600 space-y-0.5">
                          <div>Highways: <span className="font-semibold text-slate-800">{issue.responsible_officer}</span></div>
                          {issue.responsible_external_dept && (
                            <div>External: <span className="font-semibold text-[#004B87]">{issue.responsible_external_dept}</span></div>
                          )}
                          {issue.contractor_name && (
                            <div>Contractor: <span className="font-semibold text-slate-800">{issue.contractor_name}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="text-xs">
                        <span className="font-bold text-[#006A4E]">Recommended Action:</span>{' '}
                        <span className="text-slate-700">{issue.recommended_action}</span>
                      </div>
                      <button
                        onClick={() => {
                          setDecisionModal({
                            isOpen: true,
                            linkedIssueId: issue.id,
                            defaultTitle: `Directive on ${issue.issue_reference}: ${issue.category}`
                          });
                        }}
                        className="bg-[#006A4E] hover:bg-[#00553E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap self-end"
                      >
                        Take Leadership Action <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERDEPARTMENTAL COORDINATION INTELLIGENCE (Section 3.F) */}
          {activeTab === 'interdept' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-[#004B87] tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#004B87]" />
                  INTERDEPARTMENTAL COORDINATION WAR-ROOM
                </h4>
                <p className="text-xs text-slate-500">
                  Projects actively blocked by external statutory bodies (Revenue, TANGEDCO, Railways, Forest, TWAD)
                </p>
              </div>

              {/* Mobile Blockers Card View (< md) */}
              <div className="block md:hidden space-y-3">
                {blockers.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-[#004B87] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {b.department_category}
                      </span>
                      <span className="font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex-shrink-0">
                        {b.days_pending}d Delay
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{b.project_title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{b.approval_required}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-semibold text-slate-700">Latest: </span>{b.latest_correspondence}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                      <div><span className="font-semibold text-slate-800">HW:</span> {b.responsible_highways_officer}</div>
                      <div><span className="font-semibold text-slate-800">Ext:</span> {b.external_contact}</div>
                    </div>
                    <div className="text-[11px] text-[#006A4E] font-medium pt-1">
                      <span className="font-bold">Escalation: </span>{b.recommended_action}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Blockers Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[950px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Agency Category</th>
                      <th className="py-3 px-4">Project & Required Clearance</th>
                      <th className="py-3 px-4">Latest Correspondence</th>
                      <th className="py-3 px-4">Responsible Officials</th>
                      <th className="py-3 px-4">Delay & Reason</th>
                      <th className="py-3 px-4">Recommended Escalation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blockers.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <span className="font-bold text-[#004B87] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {b.department_category}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-top max-w-xs">
                          <div className="font-bold text-slate-900">{b.project_title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{b.approval_required}</div>
                        </td>
                        <td className="py-3 px-4 align-top text-slate-600 max-w-xs">
                          <div className="line-clamp-2">{b.latest_correspondence}</div>
                        </td>
                        <td className="py-3 px-4 align-top whitespace-nowrap text-[11px]">
                          <div>HW: <span className="font-semibold text-slate-800">{b.responsible_highways_officer}</span></div>
                          <div className="text-slate-500">Ext: {b.external_contact}</div>
                        </td>
                        <td className="py-3 px-4 align-top whitespace-nowrap">
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {b.days_pending} Days
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate">{b.reason_for_delay}</div>
                        </td>
                        <td className="py-3 px-4 align-top text-[#006A4E] font-medium max-w-xs">
                          {b.recommended_action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL & LEAKAGE INTELLIGENCE (Section 3.G) */}
          {activeTab === 'leakage' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#006A4E] tracking-tight flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-[#006A4E]" />
                    FINANCIAL ACCOUNTABILITY & LEAKAGE INTELLIGENCE
                  </h4>
                  <p className="text-xs text-slate-500">
                    Anomalies detected in measurement books, weighbridge gate passes, and advance recoveries
                  </p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded font-medium">
                  Statutory Note: Anomalies are investigation triggers, not proof of fraud.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {leakageFindings.map((f) => (
                  <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          {f.finding_code}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{f.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600">{f.project_title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                          Exposure: ₹{f.potential_exposure_cr.toFixed(2)} Cr
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Prevented: ₹{f.prevented_expenditure_cr.toFixed(2)} Cr
                        </span>
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          Confidence: {f.confidence}
                        </span>
                      </div>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900">{f.title}</h5>
                    <p className="text-xs text-slate-600">{f.evidence_summary}</p>
                    
                    <div className="bg-white p-3 rounded border border-slate-200 text-xs font-mono text-slate-700">
                      Calculation: {f.calculation_details}
                    </div>

                    <div className="text-xs text-[#006A4E] font-medium pt-1">
                      <span className="font-bold">Recommended Investigation:</span> {f.recommended_investigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUALITY & HRS AUDITS (Section 3.H) */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-[#006A4E] tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#006A4E]" />
                  ENGINEERING QUALITY & HRS AUDIT REGISTER
                </h4>
                <p className="text-xs text-slate-500">
                  Highways Research Station (HRS Guindy) lab test failures, cube tests, and structural inspection NCRs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualityDefects.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {q.defect_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.severity} SEVERITY
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900">{q.defect_type}</h5>
                    <p className="text-xs text-slate-600">{q.observation_notes}</p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                      <span>Lab Ref: <span className="font-mono font-semibold text-slate-700">{q.lab_report_ref || 'Under Testing'}</span></span>
                      <span>Chainage: <span className="font-mono font-semibold text-slate-700">{q.chainage_km ? `km ${q.chainage_km}` : 'Bridge P-3'}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ZONE BENCHMARKING (Section 3.D) */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#006A4E] tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#006A4E]" />
                    ZONE & DIVISION PERFORMANCE COMPARISON
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comparable project cohort comparison across Chennai, Coimbatore, Madurai, and Tiruchirappalli zones
                  </p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                  Note: Cohorts normalized by terrain and project scale
                </span>
              </div>

              {/* Mobile Zone Comparison Card View (< md) */}
              <div className="block md:hidden space-y-3">
                {zoneComparisons.map((z) => (
                  <div key={z.zone_id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{z.zone_name}</h5>
                        <span className="text-[10px] text-slate-500">HQ: {z.headquarters} • {z.cohort_sample_size} Works</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {z.completed_projects_pct}% Done
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded text-[11px] font-mono">
                      <div>Delay: <span className="text-red-600 font-bold">+{z.average_project_delay_days}d</span></div>
                      <div>Budget Util: <span className="font-bold">{z.budget_utilisation_pct}%</span></div>
                      <div>Defects: <span className="font-bold">{z.quality_defects_count}</span></div>
                      <div>LA Pending: <span className="font-bold">{z.land_acquisition_pending_ha} Ha</span></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Contractor Score: <strong className="text-slate-800">{z.contractor_performance_score}/100</strong></span>
                      <span>Data Completeness: <strong className="text-emerald-600">{z.data_completeness_pct}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Zone Comparison Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[950px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Zone & HQ</th>
                      <th className="py-3 px-4">Active Cohort</th>
                      <th className="py-3 px-4">Completed %</th>
                      <th className="py-3 px-4">Avg Delay (Days)</th>
                      <th className="py-3 px-4">Budget Util %</th>
                      <th className="py-3 px-4">Defects</th>
                      <th className="py-3 px-4">LA Pending (Ha)</th>
                      <th className="py-3 px-4">Contractor Score</th>
                      <th className="py-3 px-4">Data Completeness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {zoneComparisons.map((z) => (
                      <tr key={z.zone_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {z.zone_name}
                          <div className="text-[10px] text-slate-400 font-normal">HQ: {z.headquarters}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">{z.cohort_sample_size} Works</td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{z.completed_projects_pct}%</td>
                        <td className="py-3 px-4 font-mono text-red-600 font-semibold">+{z.average_project_delay_days}d</td>
                        <td className="py-3 px-4 font-mono">{z.budget_utilisation_pct}%</td>
                        <td className="py-3 px-4 font-mono">{z.quality_defects_count}</td>
                        <td className="py-3 px-4 font-mono">{z.land_acquisition_pending_ha} Ha</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">{z.contractor_performance_score}/100</td>
                        <td className="py-3 px-4 font-mono text-emerald-600">{z.data_completeness_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Zone comparison bar chart */}
              {zoneComparisons.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Zone Performance — Visual Comparison</p>
                  <ZoneComparisonChart data={zoneComparisons} />
                </div>
              )}

              {/* Physical vs Financial progress per zone */}
              {zoneComparisons.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Physical vs Financial Progress by Zone</p>
                  <ProgressComparisonChart
                    data={zoneComparisons.map(z => ({
                      label: z.zone_name.replace(' Zone', ''),
                      physical: z.completed_projects_pct,
                      financial: z.budget_utilisation_pct
                    }))}
                    height={zoneComparisons.length * 48 + 40}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STATEWIDE PORTFOLIO (Section 3.C) */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 tracking-tight">
                  STATEWIDE HIGHWAYS PORTFOLIO STAGES
                </h4>
                <p className="text-xs text-slate-500">Distribution across DPR planning, tendering, execution, and completion</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {portfolioStages.map((st, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{st.stage}</div>
                    <div className="text-xl font-bold text-slate-900 font-mono mt-1">{st.count}</div>
                    <div className="text-xs font-semibold text-[#006A4E] mt-0.5">₹{st.cost_cr.toFixed(1)} Cr</div>
                    <div className="text-[10px] text-slate-400 mt-1">Avg: {st.avg_progress_pct}%</div>
                  </div>
                ))}
              </div>

              {/* Portfolio distribution donut chart */}
              {portfolioStages.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Portfolio Stage Distribution</p>
                  <PortfolioDonut data={portfolioStages} />
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CONTRACTOR PERFORMANCE (Section 3.I) */}
          {activeTab === 'contractors' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-700" />
                  EMPANELLED CONTRACTOR DELIVERY EVALUATION
                </h4>
                <p className="text-xs text-slate-500">Performance scoring within comparable contract categories</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractors.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-slate-900">{c.contractor_name}</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.performance_tier === 'SATISFACTORY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.performance_tier}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">Assigned: {c.project_title}</div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded text-xs font-mono">
                      <div>Score: <span className="font-bold text-slate-900">{c.performance_score}/100</span></div>
                      <div>Delay: <span className="font-bold text-red-600">+{c.behind_schedule_days}d</span></div>
                      <div>Claims: <span className="font-bold text-slate-900">₹{c.claims_disputes_cr} Cr</span></div>
                    </div>

                    <p className="text-[11px] text-slate-500">{c.assessment_notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: LEGAL & AG AUDIT (Section 3.J) */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-purple-900 tracking-tight flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-700" />
                  HIGH COURT WRITS & AG AUDIT PARAS REGISTER
                </h4>
                <p className="text-xs text-slate-500">Active judicial proceedings and statutory audit observations</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {legalMatters.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{m.case_reference}</span>
                      <span className="font-bold text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {m.court_forum}
                      </span>
                    </div>
                    <p className="text-slate-600">{m.case_summary}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                      <span>Legal Officer: <span className="font-semibold text-slate-700">{m.responsible_legal_officer}</span></span>
                      {m.next_hearing_date && (
                        <span>Next Hearing: <span className="font-semibold text-red-600">{new Date(m.next_hearing_date).toLocaleDateString()}</span></span>
                      )}
                      <span>Status: <span className="font-semibold text-slate-800">{m.status}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: DECISIONS AND ACTIONS REQUIRED (Section 3.K) */}
          {activeTab === 'decisions' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-amber-800 tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-700" />
                    DECISIONS AND ACTIONS REQUIRED
                  </h4>
                  <p className="text-xs text-slate-500">
                    Statutory decision register tracking directives from the Hon'ble Minister, Principal Secretary, and Chief Engineers
                  </p>
                </div>
                <button
                  onClick={() => setDecisionModal({ isOpen: true, defaultTitle: 'Record Leadership Directive' })}
                  className="bg-[#006A4E] hover:bg-[#00553E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Record New Directive
                </button>
              </div>

              <div className="space-y-3">
                {decisions.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {d.decision_reference}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {d.status}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">{d.required_decision}</h5>
                    <div className="text-slate-600">Assigned Authority: <span className="font-semibold text-slate-800">{d.assigned_authority}</span></div>
                    {d.resolution_notes && (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-600 text-[11px]">
                        Notes: {d.resolution_notes}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Initiated by: {d.created_by_name}</span>
                      <span>Recorded on: {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. KPI Drilldown Modal (Section 6) */}
      {drilldownModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">{drilldownModal.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{drilldownModal.description}</p>
              </div>
              <button
                onClick={() => setDrilldownModal({ isOpen: false, title: '', description: '', metricKey: '' })}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-700">Underlying Records & Telemetry:</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">SH-49 East Coast Road 4-Laning (km 22/0 - 45/0)</span>
                  <span className="font-mono font-bold text-slate-900">₹142.20 Cr</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">MDR-102 Tambaram Elevated Corridor Flyover</span>
                  <span className="font-mono font-bold text-slate-900">₹85.00 Cr</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">ODR-045 Thiruporur Causeway Bridge Reconstruction</span>
                  <span className="font-mono font-bold text-slate-900">₹18.10 Cr</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Audited in accordance with Tamil Nadu Highways Department financial regulations.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDrilldownModal({ isOpen: false, title: '', description: '', metricKey: '' })}
                className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Close Records View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Record Leadership Decision Directive Modal */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handleCreateDecision} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Issue Executive Decision / Action</h4>
                <p className="text-xs text-slate-500 mt-0.5">Authorised leadership directive recorded in audit register</p>
              </div>
              <button
                type="button"
                onClick={() => setDecisionModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Decision / Directive</label>
                <input
                  type="text"
                  required
                  value={decisionForm.required_decision}
                  onChange={(e) => setDecisionForm({ ...decisionForm, required_decision: e.target.value })}
                  placeholder="e.g. Convene Bilateral Summit with Railway Chief Bridge Engineer"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Authority</label>
                <select
                  value={decisionForm.assigned_authority}
                  onChange={(e) => setDecisionForm({ ...decisionForm, assigned_authority: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="Hon'ble Minister for Highways">Hon'ble Minister for Highways</option>
                  <option value="Principal Secretary to Government">Principal Secretary to Government</option>
                  <option value="Chief Engineer (Highways - Projects)">Chief Engineer (Highways - Projects)</option>
                  <option value="Superintending Engineer (Circle)">Superintending Engineer (Circle)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={decisionForm.action_type}
                  onChange={(e) => setDecisionForm({ ...decisionForm, action_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="FORWARD_COORDINATION">Forward for Interdepartmental Coordination</option>
                  <option value="REQUEST_EVIDENCE">Request Additional Evidence</option>
                  <option value="INVESTIGATION">Recommend Technical / Vigilance Investigation</option>
                  <option value="ESCALATE">Escalate to Secretariat Leadership</option>
                  <option value="RECORD_DECISION">Record Official Decision</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution / Escalation Notes</label>
                <textarea
                  rows={2}
                  value={decisionForm.resolution_notes}
                  onChange={(e) => setDecisionForm({ ...decisionForm, resolution_notes: e.target.value })}
                  placeholder="Additional context or statutory notes..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDecisionModal({ isOpen: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDecision}
                className="bg-[#006A4E] hover:bg-[#00553E] text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                {savingDecision ? 'Recording...' : 'Commit Directive'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
