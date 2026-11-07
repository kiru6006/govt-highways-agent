import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ReportsOverviewData,
  ProgrammePerformanceItem,
  ProjectPerformanceItem,
  FinancialPerformanceData,
  SchedulePerformanceData,
  DepartmentPerformanceItem,
  ContractorPerformanceItem,
  QualityAssetPerformanceData,
  LandUtilityPerformanceData,
  AIMinisterialBriefingData,
  DecisionQueueItem,
  ReportGenerateRequest,
  ReportGenerateResponse,
  MinisterialDecisionItem
} from '../types';
import {
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  Building,
  UserCheck,
  Scale,
  X,
  Send,
  Printer,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  Flag,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab state
  type ActiveTab = 'briefing' | 'programmes' | 'financial_schedule' | 'departments_contractors' | 'quality_assets' | 'generator';
  const [activeTab, setActiveTab] = useState<ActiveTab>('briefing');

  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Global Filter states
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [reportingFrequency, setReportingFrequency] = useState<string>('Quarterly');

  // Core Data states
  const [overview, setOverview] = useState<ReportsOverviewData | null>(null);
  const [programmes, setProgrammes] = useState<ProgrammePerformanceItem[]>([]);
  const [projects, setProjects] = useState<ProjectPerformanceItem[]>([]);
  const [financial, setFinancial] = useState<FinancialPerformanceData | null>(null);
  const [schedule, setSchedule] = useState<SchedulePerformanceData | null>(null);
  const [departments, setDepartments] = useState<DepartmentPerformanceItem[]>([]);
  const [contractors, setContractors] = useState<ContractorPerformanceItem[]>([]);
  const [qualityAssets, setQualityAssets] = useState<QualityAssetPerformanceData | null>(null);
  const [landUtility, setLandUtility] = useState<LandUtilityPerformanceData | null>(null);
  const [aiBriefing, setAiBriefing] = useState<AIMinisterialBriefingData | null>(null);
  const [decisions, setDecisions] = useState<MinisterialDecisionItem[]>([]);

  // Project Table Search & Pagination state
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ProjectPerformanceItem>('schedule_variance_days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [projectPage, setProjectPage] = useState<number>(1);
  const projectsPerPage = 8;

  // Decision Queue filter state
  const [decisionStatusFilter, setDecisionStatusFilter] = useState<string>('ALL');
  const [decisionAuthorityFilter, setDecisionAuthorityFilter] = useState<string>('ALL');

  // Decision Detail Drawer state
  const [selectedDecision, setSelectedDecision] = useState<MinisterialDecisionItem | null>(null);
  const [decisionStatusInput, setDecisionStatusInput] = useState<string>('');
  const [recordedDecisionInput, setRecordedDecisionInput] = useState<string>('');
  const [decisionRemarksInput, setDecisionRemarksInput] = useState<string>('');
  const [assignedOfficerInput, setAssignedOfficerInput] = useState<string>('');
  const [assignedDeptInput, setAssignedDeptInput] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('');
  const [updatingDecision, setUpdatingDecision] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Contractor Score Formula Modal
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Interactive Report Generator state
  const [reportGenType, setReportGenType] = useState<string>('Ministerial Executive Intelligence Briefing');
  const [includeFinancial, setIncludeFinancial] = useState<boolean>(true);
  const [includeDelays, setIncludeDelays] = useState<boolean>(true);
  const [includeContractor, setIncludeContractor] = useState<boolean>(true);
  const [includeAIFindings, setIncludeAIFindings] = useState<boolean>(true);
  const [includeLandUtility, setIncludeLandUtility] = useState<boolean>(true);
  const [includeQuality, setIncludeQuality] = useState<boolean>(true);
  const [generatedReport, setGeneratedReport] = useState<ReportGenerateResponse | null>(null);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);

  // KPI Definition Tooltip Helper
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Fetch all report data
  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setErrorMsg(null);

      const [
        overviewRes,
        progRes,
        projRes,
        finRes,
        schedRes,
        deptRes,
        contRes,
        qaRes,
        luRes,
        aiRes,
        decRes
      ] = await Promise.all([
        api.getReportsOverview({
          programme: selectedProgramme,
          district: selectedDistrict,
          department: selectedDepartment,
          frequency: reportingFrequency
        }),
        api.getProgrammePerformance(),
        api.getProjectPerformanceReport({
          programme: selectedProgramme,
          district: selectedDistrict
        }),
        api.getFinancialPerformanceReport(selectedProgramme),
        api.getSchedulePerformanceReport(selectedProgramme),
        api.getDepartmentPerformanceReport(),
        api.getContractorPerformanceReport(),
        api.getQualityAssetPerformanceReport(),
        api.getLandUtilityPerformanceReport(),
        api.getAIMinisterialBriefing(),
        api.getMinisterialDecisions({
          programme: selectedProgramme !== 'ALL' ? selectedProgramme : undefined
        })
      ]);

      setOverview(overviewRes);
      setProgrammes(progRes);
      setProjects(projRes);
      setFinancial(finRes);
      setSchedule(schedRes);
      setDepartments(deptRes);
      setContractors(contRes);
      setQualityAssets(qaRes);
      setLandUtility(luRes);
      setAiBriefing(aiRes);
      setDecisions(decRes);
    } catch (err: any) {
      console.error('Error fetching reports data:', err);
      setErrorMsg(err.message || 'Failed to load report datasets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProgramme, selectedDistrict, selectedDepartment, reportingFrequency]);

  // Open Decision Drawer
  const openDecisionDrawer = (item: MinisterialDecisionItem | DecisionQueueItem) => {
    // If it's from decision queue, find complete item with actions
    const fullItem = decisions.find(d => d.id === item.id) || (item as MinisterialDecisionItem);
    setSelectedDecision(fullItem);
    setDecisionStatusInput(fullItem.current_status);
    setRecordedDecisionInput(fullItem.recorded_decision || '');
    setDecisionRemarksInput(fullItem.remarks || '');
    setAssignedOfficerInput(fullItem.assigned_officer || '');
    setAssignedDeptInput(fullItem.assigned_department || '');
    setDueDateInput(fullItem.due_date || '');
    setActionSuccessMsg('');
  };

  // Close Decision Drawer
  const closeDecisionDrawer = () => {
    setSelectedDecision(null);
    setActionSuccessMsg('');
  };

  // Save Ministerial Decision Action
  const handleSaveDecision = async () => {
    if (!selectedDecision) return;
    try {
      setUpdatingDecision(true);
      const updated = await api.updateMinisterialDecisionAction(selectedDecision.id, {
        current_status: decisionStatusInput,
        recorded_decision: recordedDecisionInput,
        remarks: decisionRemarksInput,
        assigned_officer: assignedOfficerInput,
        assigned_department: assignedDeptInput,
        due_date: dueDateInput
      });

      setSelectedDecision(updated);
      setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
      setActionSuccessMsg('Official Ministerial Decision recorded successfully.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
      // Reload overview & briefing silently
      api.getReportsOverview({ programme: selectedProgramme }).then(setOverview);
    } catch (err: any) {
      alert('Error updating decision: ' + (err.message || 'Network error'));
    } finally {
      setUpdatingDecision(false);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const req: ReportGenerateRequest = {
        report_type: reportGenType,
        programme: selectedProgramme,
        district: selectedDistrict,
        department: selectedDepartment,
        reporting_period: overview?.reporting_period || 'FY 2025-26 Q4',
        include_financial: includeFinancial,
        include_delays: includeDelays,
        include_contractor: includeContractor,
        include_ai_findings: includeAIFindings,
        include_land_utility: includeLandUtility,
        include_quality: includeQuality
      };
      const result = await api.generateMinisterialReport(req);
      setGeneratedReport(result);
    } catch (err: any) {
      alert('Error generating report: ' + (err.message || 'Network error'));
    } finally {
      setGeneratingReport(false);
    }
  };

  // Export CSV
  const handleExportCsv = async (type: string = 'executive_overview') => {
    try {
      setExportingCsv(true);
      const csvData = await api.exportReportsCsv(type, selectedProgramme);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TN_HDOS_${type}_${selectedProgramme}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      list = list.filter(
        p =>
          p.project_title.toLowerCase().includes(q) ||
          p.project_code.toLowerCase().includes(q) ||
          p.contractor_name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q)
      );
    }
    if (projectStatusFilter !== 'ALL') {
      list = list.filter(p => p.status === projectStatusFilter);
    }
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortOrder === 'asc'
        ? Number(aVal || 0) - Number(bVal || 0)
        : Number(bVal || 0) - Number(aVal || 0);
    });
    return list;
  }, [projects, projectSearch, projectStatusFilter, sortField, sortOrder]);

  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * projectsPerPage;
    return filteredProjects.slice(start, start + projectsPerPage);
  }, [filteredProjects, projectPage]);

  const totalProjectPages = Math.ceil(filteredProjects.length / projectsPerPage) || 1;

  // Filtered Decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchStatus = decisionStatusFilter === 'ALL' || d.current_status === decisionStatusFilter;
      const matchAuth = decisionAuthorityFilter === 'ALL' || d.decision_authority === decisionAuthorityFilter;
      return matchStatus && matchAuth;
    });
  }, [decisions, decisionStatusFilter, decisionAuthorityFilter]);

  // Chart Colors
  const COLORS = ['#1e3a8a', '#0284c7', '#0d9488', '#f59e0b', '#dc2626', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
        <p className="text-slate-600 text-sm font-medium">Aggregating statewide ministerial intelligence & programmes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: SCREEN HEADER                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                DEMO DATA
              </span>
              <span className="text-xs font-medium text-slate-500">
                Period: <strong className="text-slate-700">{overview?.reporting_period || 'FY 2025-26 Q4'}</strong>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                Updated: <span className="text-slate-700">{overview?.last_updated_timestamp ? new Date(overview.last_updated_timestamp).toLocaleString('en-IN') : 'Just now'}</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Ministerial Reports &amp; Decision Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Unified reporting, programme performance and AI-assisted executive decision support.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('generator');
                setTimeout(() => handleGenerateReport(), 100);
              }}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              Generate AI Briefing
            </button>

            <button
              onClick={() => handleExportCsv('executive_overview')}
              disabled={exportingCsv}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              {exportingCsv ? 'Exporting...' : 'Export CSV'}
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center p-2 rounded-lg text-slate-600 border border-slate-300 hover:bg-slate-50 transition"
              title="Refresh Datasets"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-navy-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Programme</label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="ALL">All Programmes (Statewide)</option>
              <option value="CKICP">CKICP (ADB Financed)</option>
              <option value="TNRSP_II">TNRSP-II (World Bank)</option>
              <option value="CMRDP">CMRDP (Chennai Metro)</option>
              <option value="CRIDP">CRIDP (State Highway Fund)</option>
              <option value="NABARD">NABARD Rural Roads</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="ALL">All Districts</option>
              <option value="The Nilgiris">The Nilgiris</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Salem">Salem</option>
              <option value="Tiruvallur">Tiruvallur</option>
              <option value="Madurai">Madurai</option>
              <option value="Tirunelveli">Tirunelveli</option>
              <option value="Chengalpattu">Chengalpattu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Highways">Highways &amp; Minor Ports</option>
              <option value="Revenue">Revenue (LA &amp; Land Alienation)</option>
              <option value="Forest">Forest &amp; Wildlife Clearence</option>
              <option value="TANGEDCO">TANGEDCO (Electricity / Poles)</option>
              <option value="Water Resources">Water Resources (Canals/Pipelines)</option>
              <option value="Police">Traffic Police (NOC &amp; Diversions)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reporting Frequency</label>
            <select
              value={reportingFrequency}
              onChange={(e) => setReportingFrequency(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="Daily">Daily Snapshot</option>
              <option value="Weekly">Weekly Progress</option>
              <option value="Monthly">Monthly Review</option>
              <option value="Quarterly">Quarterly (Statutory)</option>
              <option value="Financial year">Financial Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: EXECUTIVE OVERVIEW (10 KPIs)                       */}
      {/* ------------------------------------------------------------- */}
      {overview && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Executive Performance Summary (Real-time Derived Metrics)
            </h2>
            <span className="text-xs text-slate-400">Click any card to drill down to detailed module</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* KPI 1: Active Projects */}
            <div
              onClick={() => navigate('/project-360')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Active Projects</span>
                <Layers className="w-4 h-4 text-navy-700" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{overview.total_active_projects}</div>
              <div className="text-xs text-slate-500 mt-0.5">Across 4 zones</div>
              <div className="text-[10px] text-navy-600 mt-2 font-medium flex items-center">
                Project 360 <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 2: Total Project Value */}
            <div
              onClick={() => navigate('/finance')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Project Value</span>
                <span className="text-xs font-bold text-slate-400">₹ Cr</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                ₹{overview.total_project_value_cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Approved Sanctions</div>
              <div className="text-[10px] text-navy-600 mt-2 font-medium flex items-center">
                Finance <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 3: Budget Allocation */}
            <div
              onClick={() => navigate('/finance')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Budget Allocation</span>
                <span className="text-xs font-bold text-slate-400">₹ Cr</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                ₹{overview.total_budget_allocation_cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">BE / RE Allocation</div>
              <div className="text-[10px] text-navy-600 mt-2 font-medium flex items-center">
                Finance <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 4: Total Expenditure */}
            <div
              onClick={() => navigate('/finance')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Expenditure</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-2">
                ₹{overview.total_expenditure_cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {overview.total_budget_allocation_cr > 0
                  ? ((overview.total_expenditure_cr / overview.total_budget_allocation_cr) * 100).toFixed(1)
                  : 0}% of budget
              </div>
              <div className="text-[10px] text-navy-600 mt-2 font-medium flex items-center">
                Finance <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 5: Physical Progress */}
            <div
              onClick={() => navigate('/project-360')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Physical Progress</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-2">
                {overview.physical_progress_avg_pct.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Weighted avg progress</div>
              <div className="text-[10px] text-navy-600 mt-2 font-medium flex items-center">
                Project 360 <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 6: Delayed Projects */}
            <div
              onClick={() => navigate('/project-360')}
              className="bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">Delayed Projects</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-700 mt-2">{overview.delayed_projects_count}</div>
              <div className="text-xs text-amber-600 mt-0.5">&gt; 30 days schedule slippage</div>
              <div className="text-[10px] text-amber-700 mt-2 font-medium flex items-center">
                Project 360 <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 7: Critical Risk Projects */}
            <div
              onClick={() => navigate('/project-360')}
              className="bg-white rounded-xl p-4 border border-red-200 hover:border-red-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-900">Critical Risk Projects</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700 mt-2">{overview.critical_risk_projects_count}</div>
              <div className="text-xs text-red-600 mt-0.5">High risk composite index</div>
              <div className="text-[10px] text-red-700 mt-2 font-medium flex items-center">
                Project 360 <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 8: Pending Approvals */}
            <div
              onClick={() => navigate('/departments')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Pending Approvals</span>
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700 mt-2">{overview.pending_approvals_count}</div>
              <div className="text-xs text-slate-500 mt-0.5">Inter-dept dependencies</div>
              <div className="text-[10px] text-purple-700 mt-2 font-medium flex items-center">
                Departments <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 9: Land Acquisition Pending */}
            <div
              onClick={() => navigate('/land-utility')}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-navy-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">LA Pending Parcels</span>
                <Scale className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-700 mt-2">{overview.land_acquisition_pending_count}</div>
              <div className="text-xs text-slate-500 mt-0.5">Awards &amp; possession due</div>
              <div className="text-[10px] text-orange-700 mt-2 font-medium flex items-center">
                Land &amp; Utility <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>

            {/* KPI 10: Potential Financial Exposure */}
            <div
              onClick={() => navigate('/leakage')}
              className="bg-white rounded-xl p-4 border border-rose-200 hover:border-rose-400 hover:shadow-md cursor-pointer transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-900">Potential Exposure</span>
                <span className="text-xs font-bold text-rose-600">AI Flag</span>
              </div>
              <div className="text-2xl font-bold text-rose-700 mt-2">
                ₹{overview.potential_financial_exposure_cr.toFixed(2)} Cr
              </div>
              <div className="text-xs text-rose-600 mt-0.5">Flagged for verification</div>
              <div className="text-[10px] text-rose-700 mt-2 font-medium flex items-center">
                Leakage <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NAVIGATION TABS                                               */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'briefing'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Ministerial Intelligence &amp; Decisions
          </button>

          <button
            onClick={() => setActiveTab('programmes')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'programmes'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            Programme &amp; Project Performance
          </button>

          <button
            onClick={() => setActiveTab('financial_schedule')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'financial_schedule'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Financial &amp; Delay Scrutiny
          </button>

          <button
            onClick={() => setActiveTab('departments_contractors')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'departments_contractors'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-purple-600" />
            Departments &amp; Contractor Governance
          </button>

          <button
            onClick={() => setActiveTab('quality_assets')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'quality_assets'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-indigo-600" />
            Quality, Assets &amp; Land/Utility
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            Official Report Generator
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: AI MINISTERIAL BRIEFING & DECISION QUEUE (SEC 14, 16)  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          {/* SECTION 22 HIGHLIGHT: SCENARIO BANNER */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" /> High-Priority Executive Case Grounding (Prompt Section 22)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  CKICP SH-15 Ooty-Gudalur Ghat Corridor (PRJ-TN-2026-004) - Multi-Vector Administrative Bottleneck
                </h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  Active 115-day schedule slippage resulting from 12 pending revenue land parcels in Ooty Taluk, 48 unshifted TANGEDCO 11kV electrical poles, a disputed ₹9.80 Cr hard rock variation claim, and AI Anomaly Flag <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[11px] font-mono">ANM-2026-003</code>.
                </p>
              </div>
              <button
                onClick={() => {
                  const mdr1 = decisions.find(d => d.decision_reference === 'MDR-2026-001');
                  if (mdr1) openDecisionDrawer(mdr1);
                }}
                className="ml-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 whitespace-nowrap shadow-sm transition"
              >
                Inspect MDR-2026-001
              </button>
            </div>
          </div>

          {/* AI Ministerial Briefing 5-Section Panel */}
          {aiBriefing && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-navy-900 text-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold tracking-tight">AI Ministerial Intelligence Briefing</h2>
                  </div>
                  <span className="text-xs font-medium text-navy-200">
                    Confidence: <span className="text-emerald-400 font-bold">98.4% (Multi-source Cross-verified)</span>
                  </span>
                </div>
                <p className="text-xs text-navy-200 mt-1">
                  Algorithmic cross-vector analysis of physical progress, financial disbursements, field defects, and inter-departmental clearances.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* A. What Needs Attention? */}
                <div className="border-l-4 border-red-500 pl-4 py-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                    A. What Needs Attention?
                  </h3>
                  <h4 className="text-sm font-bold text-slate-900">{aiBriefing.what_needs_attention.headline}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{aiBriefing.what_needs_attention.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiBriefing.what_needs_attention.primary_blockers.map((b, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                        • {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* B. Why Does It Matter? */}
                <div className="border-l-4 border-amber-500 pl-4 py-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
                    B. Why Does It Matter?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700">Financial Impact</div>
                      <div className="text-xs text-slate-600 mt-1">{aiBriefing.why_does_it_matter.financial_impact}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700">Schedule Slippage</div>
                      <div className="text-xs text-slate-600 mt-1">{aiBriefing.why_does_it_matter.schedule_impact}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700">Departmental Dependency</div>
                      <div className="text-xs text-slate-600 mt-1">{aiBriefing.why_does_it_matter.departmental_impact}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700">Public &amp; Ghat Safety</div>
                      <div className="text-xs text-slate-600 mt-1">{aiBriefing.why_does_it_matter.public_safety_impact}</div>
                    </div>
                  </div>
                </div>

                {/* C. What Should Be Done? */}
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                    C. What Should Be Done?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {aiBriefing.what_should_be_done.immediate_directives.map((dir, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{dir}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* D. Who Should Act? */}
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
                    D. Who Should Act?
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2.5">Designated Officer</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">Specific Directive</th>
                          <th className="p-2.5">Target Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-600">
                        {aiBriefing.who_should_act.actions.map((act, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-900">
                              {act.officer} <span className="text-slate-400 block text-[10px]">{act.role}</span>
                            </td>
                            <td className="p-2.5">{act.dept}</td>
                            <td className="p-2.5">{act.directive}</td>
                            <td className="p-2.5 font-semibold text-red-600">{act.target_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 italic">
                  Note: {aiBriefing.disclaimer}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 16: MINISTERIAL DECISION TRACKING QUEUE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  E. What Decision Is Required? (Ministerial Decision Queue)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive governance queue for Minister and Principal Secretary actions with full statutory audit history.
                </p>
              </div>

              {/* Status & Authority Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={decisionAuthorityFilter}
                  onChange={(e) => setDecisionAuthorityFilter(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
                >
                  <option value="ALL">All Authorities</option>
                  <option value="MINISTER">Minister</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="CHIEF_ENGINEER">Chief Engineer</option>
                </select>

                <select
                  value={decisionStatusFilter}
                  onChange={(e) => setDecisionStatusFilter(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_DECISION">Pending Decision</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="REFERRED_TO_DEPARTMENT">Referred to Department</option>
                  <option value="ACTION_ASSIGNED">Action Assigned</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Decision Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Project &amp; Programme</th>
                    <th className="p-3">Issue Title</th>
                    <th className="p-3">Financial Exposure</th>
                    <th className="p-3">Authority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredDecisions.map((dec) => (
                    <tr key={dec.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-navy-800">
                        {dec.decision_reference}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{dec.project_title}</div>
                        <div className="text-[10px] text-slate-500">{dec.programme} • {dec.district}</div>
                      </td>
                      <td className="p-3 max-w-xs font-medium text-slate-800">
                        {dec.issue_title}
                      </td>
                      <td className="p-3 font-semibold text-rose-700">
                        ₹{dec.financial_exposure_cr.toFixed(2)} Cr
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {dec.decision_authority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dec.current_status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dec.current_status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : dec.current_status === 'UNDER_REVIEW'
                              ? 'bg-blue-100 text-blue-800'
                              : dec.current_status === 'ACTION_ASSIGNED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {dec.current_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openDecisionDrawer(dec)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-800 transition"
                        >
                          Review &amp; Act
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDecisions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        No ministerial decisions matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PROGRAMME & PROJECT PERFORMANCE (SEC 6, 7)             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'programmes' && (
        <div className="space-y-6">
          {/* SECTION 6: PROGRAMME PERFORMANCE INTELLIGENCE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Programme Performance Comparison</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative analysis across CKICP, TNRSP-II, CMRDP, CRIDP, and NABARD.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                Synthetic Programme Performance Data
              </span>
            </div>

            {/* Programme Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
              {programmes.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProgramme(p.programme_code)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedProgramme === p.programme_code
                      ? 'border-navy-800 bg-navy-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.programme_name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {p.projects_count} Projects
                    </span>
                  </div>
                  <div className="text-lg font-bold text-navy-900 mt-2">
                    ₹{p.approved_cost_cr.toFixed(1)} Cr
                  </div>
                  <div className="text-[11px] text-slate-500">Exp: ₹{p.expenditure_cr.toFixed(1)} Cr</div>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                      <span>Physical Progress</span>
                      <span>{p.physical_progress_pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-navy-800 h-1.5 rounded-full"
                        style={{ width: `${Math.min(p.physical_progress_pct, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[10px]">
                    <span className="text-amber-700 font-medium">{p.delayed_projects_count} Delayed</span>
                    <span className="text-red-700 font-medium">{p.high_risk_projects_count} High Risk</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Bar Chart */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-3">Programme Budget Allocation vs. Expenditure</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programmes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="programme_code" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toFixed(2)} Cr`, '']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="budget_allocation_cr" name="Budget Allocation" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenditure_cr" name="Actual Expenditure" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 7: PROJECT PERFORMANCE REPORT TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Performance Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Searchable, sorted statewide project database with physical, financial, and schedule variance.
                </p>
              </div>

              {/* Table search & filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search project or contractor..."
                    value={projectSearch}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setProjectPage(1);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-56 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
                  />
                </div>

                <select
                  value={projectStatusFilter}
                  onChange={(e) => {
                    setProjectStatusFilter(e.target.value);
                    setProjectPage(1);
                  }}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="TENDER_STAGE">Tender Stage</option>
                </select>

                <button
                  onClick={() => handleExportCsv('project_performance')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Project ID &amp; Name</th>
                    <th className="p-2.5">Programme</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Value (Cr)</th>
                    <th className="p-2.5">Physical %</th>
                    <th className="p-2.5">Financial %</th>
                    <th className="p-2.5">Expected Comp.</th>
                    <th
                      className="p-2.5 cursor-pointer hover:bg-slate-200 transition"
                      onClick={() => {
                        if (sortField === 'schedule_variance_days') {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('schedule_variance_days');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Delay (Days)</span>
                        {sortField === 'schedule_variance_days' && (sortOrder === 'desc' ? '▼' : '▲')}
                      </div>
                    </th>
                    <th className="p-2.5">Contractor</th>
                    <th className="p-2.5">Risk</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {paginatedProjects.map((proj) => (
                    <tr
                      key={proj.project_id}
                      className={`hover:bg-slate-50 transition ${
                        proj.project_code === 'PRJ-TN-2026-004' ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="p-2.5">
                        <div className="font-mono text-[11px] font-bold text-navy-800">{proj.project_code}</div>
                        <div className="font-medium text-slate-900 max-w-xs truncate" title={proj.project_title}>
                          {proj.project_title}
                        </div>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800">{proj.programme}</td>
                      <td className="p-2.5 text-slate-600">{proj.district}</td>
                      <td className="p-2.5 font-semibold text-slate-900">₹{proj.sanctioned_cost_cr.toFixed(1)}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-blue-700">{proj.physical_progress_pct}%</span>
                      </td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-700">{proj.financial_progress_pct}%</span>
                      </td>
                      <td className="p-2.5 text-slate-600">{proj.expected_completion_date}</td>
                      <td className="p-2.5">
                        {proj.schedule_variance_days > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            +{proj.schedule_variance_days} d
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            On Track
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 max-w-[120px] truncate" title={proj.contractor_name}>
                        {proj.contractor_name}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            proj.overall_risk === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : proj.overall_risk === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {proj.overall_risk}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">
                          {proj.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => navigate(`/project-360?project=${proj.project_code}`)}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 transition flex items-center gap-1 ml-auto"
                        >
                          <span>360</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedProjects.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-6 text-center text-slate-500">
                        No projects match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div>
                Showing {(projectPage - 1) * projectsPerPage + 1} to{' '}
                {Math.min(projectPage * projectsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={projectPage <= 1}
                  onClick={() => setProjectPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-800">
                  {projectPage} / {totalProjectPages}
                </span>
                <button
                  disabled={projectPage >= totalProjectPages}
                  onClick={() => setProjectPage(prev => Math.min(prev + 1, totalProjectPages))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: FINANCIAL & DELAY SCRUTINY (SEC 8, 9)                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'financial_schedule' && (
        <div className="space-y-6">
          {/* SECTION 8: FINANCIAL PERFORMANCE REPORT */}
          {financial && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Financial Performance Intelligence</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Budget utilization, bill ageing, contractor payment distribution, and potential exposure scrutiny.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/finance')}
                  className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1 mt-2 sm:mt-0"
                >
                  Open Finance Module <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Financial KPI summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Approved Budget</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">₹{financial.approved_budget_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Revised Budget</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">₹{financial.revised_budget_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Actual Exp.</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1">₹{financial.actual_expenditure_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Pending Bills</div>
                  <div className="text-sm font-bold text-amber-700 mt-1">₹{financial.pending_bills_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Payments Made</div>
                  <div className="text-sm font-bold text-blue-700 mt-1">₹{financial.payments_made_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Retention Held</div>
                  <div className="text-sm font-bold text-purple-700 mt-1">₹{financial.retention_amount_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Cost Variations</div>
                  <div className="text-sm font-bold text-orange-700 mt-1">₹{financial.cost_variations_cr.toFixed(1)} Cr</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] font-semibold text-rose-800">Under Review</div>
                  <div className="text-sm font-bold text-rose-700 mt-1">₹{financial.potential_exposure_under_review_cr.toFixed(2)} Cr</div>
                </div>
              </div>

              {/* Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Monthly Expenditure Trend */}
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Monthly Expenditure Disbursements (FY 2025-26)</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financial.monthly_expenditure_trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)} Cr`, 'Disbursed']}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="amount_cr" stroke="#1e3a8a" fill="#3b82f6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pending Payment Ageing */}
                <div className="border border-slate-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Pending Contractor Payment Ageing Breakdown</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financial.pending_payment_ageing}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age_bracket" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)} Cr`, 'Amount']}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Bar dataKey="amount_cr" name="Amount (Cr)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: SCHEDULE AND DELAY ANALYSIS REPORT */}
          {schedule && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Delay Analysis &amp; Primary Blockers</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Critical slippage root cause investigation, responsible departments, and administrative recommendations.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {schedule.projects_on_schedule_count} On Track
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    {schedule.delayed_projects_count} Delayed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                    {schedule.critical_delays_count} Critical Delays
                  </span>
                </div>
              </div>

              {/* Delay Analysis Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Project &amp; Package</th>
                      <th className="p-2.5">Contractor</th>
                      <th className="p-2.5">Planned Comp.</th>
                      <th className="p-2.5">Expected Comp.</th>
                      <th className="p-2.5">Delay</th>
                      <th className="p-2.5">Primary Blocker</th>
                      <th className="p-2.5">Responsible Dept</th>
                      <th className="p-2.5">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {schedule.delay_analysis_table.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 transition ${
                          item.delay_days >= 90 ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{item.project_title}</div>
                          <div className="text-[10px] text-slate-500">{item.package_name}</div>
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">{item.contractor}</td>
                        <td className="p-2.5 text-slate-600">{item.planned_completion}</td>
                        <td className="p-2.5 text-slate-600">{item.expected_completion}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.delay_days >= 90
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            +{item.delay_days} days
                          </span>
                        </td>
                        <td className="p-2.5 max-w-xs font-medium text-slate-900">{item.primary_blocker}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {item.responsible_department}
                          </span>
                        </td>
                        <td className="p-2.5 text-xs text-navy-800 font-medium">{item.recommended_action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: DEPARTMENTS & CONTRACTOR GOVERNANCE (SEC 10, 11)        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'departments_contractors' && (
        <div className="space-y-6">
          {/* SECTION 10: DEPARTMENTAL PERFORMANCE REPORT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inter-Departmental Friction &amp; Clearances</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statewide dependencies across Revenue, Forest, TANGEDCO, Water Resources, and Police.
                </p>
              </div>
              <button
                onClick={() => navigate('/departments')}
                className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1 mt-2 sm:mt-0"
              >
                Open Departments Module <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Department Name</th>
                    <th className="p-2.5">Pending Approvals</th>
                    <th className="p-2.5">Avg Age (Days)</th>
                    <th className="p-2.5">Critical Dependencies</th>
                    <th className="p-2.5">Projects Affected</th>
                    <th className="p-2.5">Overdue Actions</th>
                    <th className="p-2.5">Escalations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {departments.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-navy-700" />
                        {dept.department_name}
                      </td>
                      <td className="p-2.5 font-semibold text-purple-700">{dept.pending_approvals}</td>
                      <td className="p-2.5 text-slate-600">{dept.avg_approval_age_days} days</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {dept.critical_dependencies} Critical
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">{dept.projects_affected}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          {dept.overdue_actions} Overdue
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-rose-700">{dept.escalations_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 11: CONTRACTOR PERFORMANCE REPORT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Contractor Performance Benchmark</h3>
                  <button
                    onClick={() => setShowFormulaModal(true)}
                    className="inline-flex items-center text-[10px] font-bold text-navy-700 hover:text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-200 transition"
                  >
                    <Info className="w-3 h-3 mr-1" /> View Formula
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparent 4-factor scoring formula. No arbitrary assumptions or defamatory labeling.
                </p>
              </div>
              <button
                onClick={() => navigate('/contractors')}
                className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1 mt-2 sm:mt-0"
              >
                Open Contractors Module <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Contractor Company</th>
                    <th className="p-2.5">Contracts</th>
                    <th className="p-2.5">Value (Cr)</th>
                    <th className="p-2.5">Progress %</th>
                    <th className="p-2.5">Schedule Adherence</th>
                    <th className="p-2.5">Open NCRs</th>
                    <th className="p-2.5">Pending Payments</th>
                    <th className="p-2.5">Composite Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {contractors.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-slate-900">
                        {c.name}
                      </td>
                      <td className="p-2.5 text-slate-600">{c.active_contracts}</td>
                      <td className="p-2.5 font-semibold text-slate-900">₹{c.contract_value_cr.toFixed(1)}</td>
                      <td className="p-2.5 font-bold text-blue-700">{c.project_progress_avg}%</td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-700">{c.schedule_adherence_pct}%</span>
                      </td>
                      <td className="p-2.5">
                        {c.open_corrective_actions_count > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {c.open_corrective_actions_count} Open
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600">₹{c.pending_payments_cr.toFixed(1)} Cr</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                c.performance_score >= 80
                                  ? 'bg-emerald-600'
                                  : c.performance_score >= 65
                                  ? 'bg-amber-500'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${c.performance_score}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-900">{c.performance_score}/100</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: QUALITY, ASSETS & LAND/UTILITY (SEC 12, 13)             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'quality_assets' && (
        <div className="space-y-6">
          {/* SECTION 12: QUALITY AND ASSET PERFORMANCE */}
          {qualityAssets && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Sub-section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Engineering Quality &amp; Inspections</h3>
                  <button
                    onClick={() => navigate('/quality')}
                    className="text-xs text-navy-700 hover:text-navy-900 font-semibold"
                  >
                    Quality Module →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Inspections</div>
                    <div className="text-base font-bold text-slate-900 mt-1">{qualityAssets.inspections_conducted}</div>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg text-center">
                    <div className="text-[10px] text-amber-700">Open Defects</div>
                    <div className="text-base font-bold text-amber-800 mt-1">{qualityAssets.open_defects}</div>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg text-center">
                    <div className="text-[10px] text-red-700">Critical NCRs</div>
                    <div className="text-base font-bold text-red-800 mt-1">{qualityAssets.ncrs_count}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Contractor Lab Tests &amp; Defect Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    {qualityAssets.contractor_quality_breakdown.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{item.contractor}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-600">{item.tests_conducted} Tests</span>
                          <span className="text-emerald-700 font-semibold">{item.passed} Pass</span>
                          <span className="text-red-700 font-semibold">{item.open_ncrs} Open NCR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assets Sub-section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Highway Road &amp; Structural Assets</h3>
                  <button
                    onClick={() => navigate('/assets')}
                    className="text-xs text-navy-700 hover:text-navy-900 font-semibold"
                  >
                    Assets Module →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Total Assets</div>
                    <div className="text-base font-bold text-slate-900 mt-1">{qualityAssets.total_assets}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Road Length</div>
                    <div className="text-base font-bold text-slate-900 mt-1">{qualityAssets.road_assets_km} km</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Bridges/Culverts</div>
                    <div className="text-base font-bold text-slate-900 mt-1">{qualityAssets.bridges_count + qualityAssets.culverts_count}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 flex justify-between">
                    <span className="text-amber-800 font-medium">Assets Requiring Immediate Inspection</span>
                    <span className="font-bold text-amber-900">{qualityAssets.assets_requiring_inspection}</span>
                  </div>
                  <div className="p-2.5 bg-orange-50 rounded border border-orange-200 flex justify-between">
                    <span className="text-orange-800 font-medium">Routine Maintenance Overdue</span>
                    <span className="font-bold text-orange-900">{qualityAssets.maintenance_pending}</span>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded border border-red-200 flex justify-between">
                    <span className="text-red-800 font-medium">Critical Structural Condition Assets</span>
                    <span className="font-bold text-red-900">{qualityAssets.critical_asset_conditions}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13: LAND AND UTILITY REPORT */}
          {landUtility && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Land Acquisition &amp; Utility Shifting Intelligence</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Revenue Department land parcels and TANGEDCO/TWAD utility clearances across highway corridors.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/land-utility')}
                  className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1 mt-2 sm:mt-0"
                >
                  Open Land &amp; Utility Module <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Land vs Utility KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Total Parcels</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{landUtility.total_land_parcels}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Under Acquisition</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{landUtility.parcels_under_acquisition}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Awards Due</div>
                  <div className="text-base font-bold text-amber-700 mt-1">{landUtility.awards_pending}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Compensation Due</div>
                  <div className="text-base font-bold text-amber-700 mt-1">{landUtility.compensation_pending}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Possession Due</div>
                  <div className="text-base font-bold text-red-700 mt-1">{landUtility.possession_pending}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Utilities Pending</div>
                  <div className="text-base font-bold text-red-700 mt-1">{landUtility.utility_shifting_pending}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Avg Pending Days</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{landUtility.avg_pending_duration_days} d</div>
                </div>
              </div>

              {/* Utility breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                {landUtility.utility_type_breakdown.map((ub, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{ub.utility_type}</span>
                      <span className="text-xs font-bold text-red-700">{ub.count} units</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Est. Shifting: ₹{ub.estimated_shifting_cost_cr.toFixed(2)} Cr</div>
                    <div className="text-[11px] text-navy-800 font-medium mt-2">{ub.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: INTERACTIVE REPORT GENERATOR (SEC 15)                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Custom Ministerial Report Builder</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure reporting scope, choose thematic intelligence sections, and render executive printable briefing.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Target Period: <strong>{overview?.reporting_period || 'FY 2025-26 Q4'}</strong>
              </span>
            </div>

            {/* Generator Form */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Report Title / Type</label>
                <select
                  value={reportGenType}
                  onChange={(e) => setReportGenType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
                >
                  <option value="Ministerial Executive Intelligence Briefing">
                    Ministerial Executive Intelligence Briefing
                  </option>
                  <option value="Quarterly Programme Performance Review">
                    Quarterly Programme Performance Review
                  </option>
                  <option value="Financial & Cost Variation Audit Summary">
                    Financial &amp; Cost Variation Audit Summary
                  </option>
                  <option value="Project Delays & Critical Friction Report">
                    Project Delays &amp; Critical Friction Report
                  </option>
                  <option value="Inter-Departmental Clearances & Land Acquisition">
                    Inter-Departmental Clearances &amp; Land Acquisition
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Programme Scope</label>
                <select
                  value={selectedProgramme}
                  onChange={(e) => setSelectedProgramme(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
                >
                  <option value="ALL">All Highway Programmes (Statewide)</option>
                  <option value="CKICP">Chennai-Kanyakumari Industrial Corridor (CKICP)</option>
                  <option value="TNRSP_II">Tamil Nadu Road Sector Project II (TNRSP-II)</option>
                  <option value="CMRDP">Chennai Metropolitan Road Development (CMRDP)</option>
                  <option value="CRIDP">Comprehensive Road Infrastructure Development (CRIDP)</option>
                  <option value="NABARD">NABARD Rural Infrastructure Scheme</option>
                </select>
              </div>
            </div>

            {/* Section Toggles */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Include Thematic Modules</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFinancial}
                    onChange={(e) => setIncludeFinancial(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>Financial Scrutiny</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDelays}
                    onChange={(e) => setIncludeDelays(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>Delay Analysis</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeContractor}
                    onChange={(e) => setIncludeContractor(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>Contractor Benchmarking</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAIFindings}
                    onChange={(e) => setIncludeAIFindings(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>AI Risk Findings</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLandUtility}
                    onChange={(e) => setIncludeLandUtility(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>Land &amp; Utility</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQuality}
                    onChange={(e) => setIncludeQuality(e.target.checked)}
                    className="rounded text-navy-800"
                  />
                  <span>Quality Assurance</span>
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-navy-900 text-white hover:bg-navy-800 shadow transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                {generatingReport ? 'Compiling Official Briefing...' : 'Render Official Report'}
              </button>
            </div>
          </div>

          {/* GENERATED REPORT PREVIEW & PRINT LAYOUT */}
          {generatedReport && (
            <div className="bg-white rounded-xl shadow border border-slate-200 p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
              {/* Report Government Header */}
              <div className="border-b-2 border-navy-900 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Government of Tamil Nadu • Highways &amp; Minor Ports Department
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{generatedReport.title}</h2>
                  <div className="text-xs text-slate-500 mt-1">
                    Report Ref: <strong className="font-mono text-slate-700">{generatedReport.report_id}</strong> • Period:{' '}
                    <strong>{generatedReport.reporting_period}</strong> • Generated on:{' '}
                    {new Date(generatedReport.generated_at).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="w-4 h-4 text-slate-500" /> Print
                  </button>
                  <button
                    onClick={() => handleExportCsv('custom_report')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Executive Assessment &amp; Directive Summary
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed">{generatedReport.executive_summary}</p>
              </div>

              {/* KPIs Snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(generatedReport.kpis_summary).map(([key, val], idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">{key.replace(/_/g, ' ')}</div>
                    <div className="text-base font-bold text-slate-900 mt-1">{String(val)}</div>
                  </div>
                ))}
              </div>

              {/* Dynamic Thematic Sections */}
              <div className="space-y-4">
                {generatedReport.sections.map((sec, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-navy-900">{sec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{sec.summary}</p>
                    <div className="mt-3 space-y-1">
                      {sec.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-600"></span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ministerial Decisions Required */}
              {generatedReport.recommended_decisions.length > 0 && (
                <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-amber-900 mb-2">Immediate Ministerial Decisions Enclosed</h4>
                  <div className="space-y-2">
                    {generatedReport.recommended_decisions.map((rd, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-amber-200 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-navy-900">{rd.ref} • {rd.project}</span>
                          <span className="text-amber-800">{rd.status}</span>
                        </div>
                        <div className="text-slate-700 mt-1"><strong>Issue:</strong> {rd.issue}</div>
                        <div className="text-slate-600 mt-0.5"><strong>Recommended Directive:</strong> {rd.recommended}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Government Signature Blocks */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-800">Thiru Pradeep Yadav, IAS</div>
                  <div>Additional Chief Secretary to Government</div>
                  <div>Highways &amp; Minor Ports Department</div>
                </div>
                <div className="border-t border-slate-300 pt-2 text-right">
                  <div className="font-bold text-slate-800">Thiru E.V. Velu</div>
                  <div>Hon&apos;ble Minister for Public Works, Highways &amp; Minor Ports</div>
                  <div>Government of Tamil Nadu</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MINISTERIAL DECISION ACTION DRAWER (SECTION 16)                */}
      {/* ------------------------------------------------------------- */}
      {selectedDecision && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-navy-800 px-2 py-0.5 rounded">
                  {selectedDecision.decision_reference}
                </span>
                <h3 className="text-base font-bold mt-1 text-white">{selectedDecision.issue_title}</h3>
                <div className="text-xs text-navy-200 mt-0.5">
                  {selectedDecision.project_title} • {selectedDecision.programme}
                </div>
              </div>
              <button
                onClick={closeDecisionDrawer}
                className="p-1 rounded-full text-navy-300 hover:text-white hover:bg-navy-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Alert message */}
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Status & Financial Exposure */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500">Current Status</div>
                  <div className="text-xs font-bold text-navy-900 mt-1">
                    {selectedDecision.current_status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] font-semibold text-rose-800">Financial Exposure Flag</div>
                  <div className="text-xs font-bold text-rose-700 mt-1">
                    ₹{selectedDecision.financial_exposure_cr.toFixed(2)} Cr
                  </div>
                </div>
              </div>

              {/* Evidence & Grounding Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Evidence &amp; Factual Grounding
                </h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedDecision.evidence_summary || 'No factual summary logged.'}
                </div>
              </div>

              {/* Impact Assessment */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Administrative &amp; Project Impact
                </h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedDecision.impact_assessment || 'Impact analysis pending.'}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="border-l-4 border-amber-500 pl-3 py-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  AI Recommended Directive
                </h4>
                <p className="text-xs text-slate-800 font-medium">{selectedDecision.recommended_action}</p>
              </div>

              {/* Decision Recording Form */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                  Record Official Administrative Decision
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={decisionStatusInput}
                      onChange={(e) => setDecisionStatusInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-medium"
                    >
                      <option value="PENDING_DECISION">Pending Decision</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="REFERRED_TO_DEPARTMENT">Referred to Department</option>
                      <option value="ACTION_ASSIGNED">Action Assigned</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Date</label>
                    <input
                      type="date"
                      value={dueDateInput}
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                    <input
                      type="text"
                      value={assignedDeptInput}
                      onChange={(e) => setAssignedDeptInput(e.target.value)}
                      placeholder="e.g. Revenue Department / TANGEDCO"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designated Officer</label>
                    <input
                      type="text"
                      value={assignedOfficerInput}
                      onChange={(e) => setAssignedOfficerInput(e.target.value)}
                      placeholder="e.g. District Collector, Nilgiris"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Directive / Order</label>
                  <textarea
                    rows={2}
                    value={recordedDecisionInput}
                    onChange={(e) => setRecordedDecisionInput(e.target.value)}
                    placeholder="Enter formal executive order or instructions to department..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Meeting Record</label>
                  <textarea
                    rows={2}
                    value={decisionRemarksInput}
                    onChange={(e) => setDecisionRemarksInput(e.target.value)}
                    placeholder="Optional remarks from Ministerial High-Level Review..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                  ></textarea>
                </div>
              </div>

              {/* Action History Audit Timeline */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Statutory Audit History ({selectedDecision.actions?.length || 0} events)
                </h4>
                <div className="space-y-2">
                  {selectedDecision.actions?.map((act) => (
                    <div key={act.id} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs">
                      <div className="flex justify-between items-center text-slate-500 text-[10px]">
                        <span className="font-semibold text-slate-700">{act.actor_name} ({act.actor_role})</span>
                        <span>{new Date(act.created_at).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-slate-800 mt-1 font-medium">
                        Status: <span className="text-navy-900 font-bold">{act.new_status}</span>
                      </div>
                      {act.remarks && <div className="text-slate-600 mt-0.5">{act.remarks}</div>}
                    </div>
                  ))}
                  {(!selectedDecision.actions || selectedDecision.actions.length === 0) && (
                    <div className="text-xs text-slate-400 italic">No previous actions recorded.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={closeDecisionDrawer}
                className="px-4 py-2 text-xs font-semibold rounded text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDecision}
                disabled={updatingDecision}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-navy-900 text-white hover:bg-navy-800 shadow transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                {updatingDecision ? 'Recording Decision...' : 'Commit Ministerial Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONTRACTOR SCORING FORMULA MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Contractor Performance Scoring Formula</h3>
              <button onClick={() => setShowFormulaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <p>
                The Composite Performance Score (0 - 100) is calculated objectively from verified contract records
                without discretionary subjectivity:
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>1. Schedule Adherence (Weight: 35%)</span>
                  <span>(1 - Milestone Delay Ratio) × 35</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>2. Quality Compliance (Weight: 30%)</span>
                  <span>(Pass Rate - 3 × Open NCRs) × 30</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>3. Milestone Delivery Rate (Weight: 20%)</span>
                  <span>(Completed / Total Milestones) × 20</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>4. Safety &amp; Contractual Governance (Weight: 15%)</span>
                  <span>Safety Audits &amp; Extension Penalty</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Note: In compliance with TN-HDOS guidelines, no contractor is labeled as blacklisted or guilty of
                misconduct. Scores represent operational performance indices for project allocation.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded bg-navy-900 text-white hover:bg-navy-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

