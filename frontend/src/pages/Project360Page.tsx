import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ProjectItem,
  Project360Detail,
  RoadType
} from '../types';
import { RoadBadge } from '../components/RoadBadge';
import {
  Layers,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Users,
  MapPin,
  FileText,
  AlertCircle,
  Briefcase,
  Scale,
  Sparkles,
  History,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Landmark,
  Compass,
  FileCode,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

type TabKey =
  | 'overview_specs'
  | 'sanctions_milestones'
  | 'evm_progress'
  | 'packages_contractors'
  | 'officials_stakeholders'
  | 'land_utilities'
  | 'quality_legal_docs'
  | 'risks_ai_audit';

export const Project360Page: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project360Detail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview_specs');

  // Portfolio Filters
  const [roadTypeFilter, setRoadTypeFilter] = useState<RoadType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI finding action feedback
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  // Load project portfolio list
  useEffect(() => {
    loadPortfolio();
  }, [roadTypeFilter, statusFilter, user]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects({
        roadType: roadTypeFilter === 'ALL' ? undefined : roadTypeFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined
      });
      setProjects(data);

      // Check if project id is specified in URL query params
      const idParam = searchParams.get('id');
      const codeParam = searchParams.get('code');
      if (idParam) {
        loadProject360(parseInt(idParam, 10));
      } else if (codeParam) {
        const found = data.find(p => p.project_code === codeParam);
        if (found) loadProject360(found.id);
      }
    } catch (err) {
      console.error('Failed to load projects portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProject360 = async (projectId: number) => {
    try {
      setDossierLoading(true);
      const detail = await api.getProject360(projectId);
      setSelectedProject(detail);
      setSearchParams({ id: String(projectId) });
    } catch (err) {
      console.error('Failed to load project 360 detail', err);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleSelectProject = (projectId: number) => {
    loadProject360(projectId);
  };

  const handleBackToPortfolio = () => {
    setSelectedProject(null);
    setSearchParams({});
  };

  const handleValidateFinding = async (findingId: number) => {
    try {
      await api.validateAIFinding(findingId, 'VERIFIED_CORRECT', 'Verified against official land records by officer.');
      setValidationSuccess(`Finding #${findingId} verified and forwarded to Executive Committee.`);
      setTimeout(() => setValidationSuccess(null), 4000);
      if (selectedProject) {
        loadProject360(selectedProject.id || selectedProject.project?.id || 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Road classifications
  const roadTiers: Array<{ type: RoadType | 'ALL'; label: string }> = [
    { type: 'ALL', label: 'All Roads' },
    { type: 'SH', label: 'State Highways (SH)' },
    { type: 'NH', label: 'National Highways (NH)' },
    { type: 'MDR', label: 'Major District Roads (MDR)' },
    { type: 'ODR', label: 'Other District Roads (ODR)' },
    { type: 'RURAL', label: 'Rural Roads' }
  ];

  // Helper status color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Delayed</span>;
      case 'SANCTIONED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Sanctioned</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getEVMStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> EVM On Track</span>;
      case 'AT_RISK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> EVM At Risk</span>;
      case 'CRITICAL_DELAY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Critical Slip</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // -------------------------------------------------------------
  // VIEW MODE 1: PROJECT PORTFOLIO GRID / LIST
  // -------------------------------------------------------------
  if (!selectedProject) {
    const totalProjects = projects.length;
    const totalSanctionedCr = projects.reduce((acc, p) => acc + (p.sanctioned_cost_cr || 0), 0);
    const avgPhysical = totalProjects > 0 ? (projects.reduce((acc, p) => acc + (p.physical_progress_pct || 0), 0) / totalProjects).toFixed(1) : '0';
    const delayedCount = projects.filter(p => p.status === 'DELAYED').length;

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#006A4E] rounded-lg border border-emerald-200">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Project 360° Intelligence Workspace
                  <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#006A4E] px-2 py-0.5 rounded border border-[#B2DFCD]">
                    Phase 3 Operational
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unified operational dossier tracking 17 linked facets from Administrative Sanction to Execution, EVM Variance, and Legal Closure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Projects</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalProjects}</div>
            <span className="text-[11px] text-slate-500">Across All Road Categories</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sanctioned Value</span>
            <div className="text-2xl font-bold text-[#006A4E] mt-1">₹{totalSanctionedCr.toFixed(2)} <span className="text-xs font-semibold text-slate-500">Cr</span></div>
            <span className="text-[11px] text-slate-500">Statutory AS Approved</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Physical Progress</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">{avgPhysical}%</div>
            <span className="text-[11px] text-slate-500">Cumulative Weighted Avg</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Delayed / Critical</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{delayedCount} <span className="text-xs font-normal text-slate-500">Projects</span></div>
            <span className="text-[11px] text-rose-600 font-medium">Require Secretariat Action</span>
          </div>
        </div>

        {/* Road Tier Filters */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {roadTiers.map((tier) => {
            const isSelected = roadTypeFilter === tier.type;
            return (
              <button
                key={tier.type}
                onClick={() => setRoadTypeFilter(tier.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#006A4E] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project code, road name, contractor, division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#006A4E] text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006A4E]"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
              <option value="SANCTIONED">Sanctioned</option>
            </select>

            <button
              onClick={loadPortfolio}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs flex items-center gap-1"
              title="Refresh Portfolio"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-[#006A4E] border-t-transparent rounded-full mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Retrieving State Project Dossiers...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No Projects Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No highways projects match your selected filters or search parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj.id)}
                className="bg-white rounded-xl border border-slate-200 hover:border-[#006A4E] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Row: Road Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <RoadBadge type={proj.road_type} code={proj.project_code} />
                    {getStatusBadge(proj.status)}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#006A4E] transition-colors line-clamp-2">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {proj.description || 'Highway infrastructure upgrade under Tamil Nadu Highways and Minor Ports Department.'}
                    </p>
                  </div>

                  {/* Specs Pill Strip */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sanctioned</span>
                      <span className="font-bold text-slate-900">₹{proj.sanctioned_cost_cr?.toFixed(2) || '0.00'} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expenditure</span>
                      <span className="font-bold text-emerald-700">₹{proj.expenditure_to_date_cr?.toFixed(2) || '0.00'} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Physical</span>
                      <span className="font-bold text-blue-700">{proj.physical_progress_pct?.toFixed(1) || 0}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Financial</span>
                      <span className="font-bold text-slate-700">{proj.financial_progress_pct?.toFixed(1) || 0}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Physical Execution</span>
                      <span className="font-semibold text-slate-700">{proj.physical_progress_pct?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#006A4E] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(proj.physical_progress_pct || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Contractor & Location */}
                  <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{proj.contractor_name || 'Departmental Execution'}</span>
                    </div>
                    {proj.road_name && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{proj.road_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between group-hover:bg-emerald-50/50 transition-colors">
                  <span className="text-xs font-semibold text-[#006A4E] flex items-center gap-1">
                    Open 360° Intelligence Dossier <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {proj.project_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW MODE 2: 17-FACET COMPREHENSIVE PROJECT 360° INTELLIGENCE DOSSIER
  // -------------------------------------------------------------
  const p = selectedProject;
  const evm = p.execution_tracking;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={handleBackToPortfolio}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#006A4E] transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects Portfolio
        </button>

        {/* Quick Project Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Switch Project:</span>
          <select
            value={p.id}
            onChange={(e) => handleSelectProject(Number(e.target.value))}
            className="bg-white border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006A4E]"
          >
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.project_code} - {proj.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation success notification */}
      {validationSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{validationSuccess}</span>
        </div>
      )}

      {/* Hero Dossier Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#004B35] text-white p-6 rounded-2xl shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RoadBadge type={p.technical_specs.road_type} code={p.project_code} />
              <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {p.jurisdiction_hierarchy.district} District
              </span>
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {p.verification_status}
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              {p.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {p.description}
            </p>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
            {getStatusBadge(p.status || p.project?.status || 'SANCTIONED')}
            {getEVMStatusBadge(evm.status_assessment)}
          </div>
        </div>

        {/* Executive Metric Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10 text-white">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Sanctioned Value</span>
            <div className="text-base font-bold text-white mt-0.5">₹{p.sanctions[0]?.sanction_amount_cr?.toFixed(2) || '0.00'} Cr</div>
            <span className="text-[10px] text-slate-400">G.O. Sanction</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Actual Cost (AC)</span>
            <div className="text-base font-bold text-emerald-300 mt-0.5">₹{evm.actual_cost_cr.toFixed(2)} Cr</div>
            <span className="text-[10px] text-slate-400">Paid to Date</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Earned Value (EV)</span>
            <div className="text-base font-bold text-blue-300 mt-0.5">₹{evm.earned_value_cr.toFixed(2)} Cr</div>
            <span className="text-[10px] text-slate-400">Value Delivered</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Physical Progress</span>
            <div className="text-base font-bold text-white mt-0.5">{evm.actual_physical_pct}%</div>
            <span className="text-[10px] text-slate-400">Plan: {evm.planned_physical_pct}%</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Cost Perf. (CPI)</span>
            <div className={`text-base font-bold mt-0.5 ${evm.cost_performance_index >= 1.0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {evm.cost_performance_index.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-400">{evm.cost_performance_index >= 1 ? 'Under Budget' : 'Cost Overrun'}</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Schedule (SPI)</span>
            <div className={`text-base font-bold mt-0.5 ${evm.schedule_performance_index >= 0.95 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {evm.schedule_performance_index.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-400">{evm.schedule_variance_days > 0 ? `Slip: ${evm.schedule_variance_days}d` : 'On Schedule'}</span>
          </div>
        </div>
      </div>

      {/* 17-Facet Tab Navigation Bar */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview_specs')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'overview_specs'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> 1 & 2. Overview & Technical Specs
        </button>

        <button
          onClick={() => setActiveTab('sanctions_milestones')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'sanctions_milestones'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> 3, 4 & 5. Sanctions, Milestones & Progress
        </button>

        <button
          onClick={() => setActiveTab('evm_progress')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'evm_progress'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> 6. EVM Variance & Financial History
        </button>

        <button
          onClick={() => setActiveTab('packages_contractors')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'packages_contractors'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> 7 & 8. Packages & Contractors
        </button>

        <button
          onClick={() => setActiveTab('officials_stakeholders')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'officials_stakeholders'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> 9. Officials & Stakeholders
        </button>

        <button
          onClick={() => setActiveTab('land_utilities')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'land_utilities'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> 10 & 11. Land & Utilities
        </button>

        <button
          onClick={() => setActiveTab('quality_legal_docs')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'quality_legal_docs'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" /> 12, 13 & 14. Quality, Legal & Docs
        </button>

        <button
          onClick={() => setActiveTab('risks_ai_audit')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'risks_ai_audit'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 15, 16 & 17. Risks, AI & Audit
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: 1. OVERVIEW & 2. TECHNICAL SPECIFICATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview_specs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Facet 1: Identity & Administrative Hierarchy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Landmark className="w-5 h-5 text-[#006A4E]" />
              <h2 className="text-sm font-bold text-slate-900">Facet 1: Administrative Jurisdiction & Leadership</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Highways Zone</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{p.jurisdiction_hierarchy.zone_name}</span>
                <span className="text-[11px] text-slate-500">Chief Engineer Jurisdiction</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Circle Office</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{p.jurisdiction_hierarchy.circle_name}</span>
                <span className="text-[11px] text-slate-500">Superintending Engineer</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Executing Division</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{p.jurisdiction_hierarchy.division_name}</span>
                <span className="text-[11px] text-slate-500">Divisional Engineer (DE / EE)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">District & Revenue</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{p.jurisdiction_hierarchy.district}</span>
                <span className="text-[11px] text-slate-500">District Collectorate Coord.</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Funding Programme / Budget Head</span>
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl mt-1 text-xs text-slate-800 font-medium flex items-center justify-between">
                <span>{p.technical_specs.funding_programme}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#006A4E] rounded text-[10px] font-bold">State Plan Fund</span>
              </div>
            </div>
          </div>

          {/* Facet 2: Scope & Technical Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-[#006A4E]" />
              <h2 className="text-sm font-bold text-slate-900">Facet 2: Scope & Technical Engineering Specifications</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Corridor Code & Name</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.road_code} - {p.technical_specs.road_name}</span>
              </div>

              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Length & Chainage</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.total_length_km} km ({p.technical_specs.start_chainage_km} to {p.technical_specs.end_chainage_km})</span>
              </div>

              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carriageway Width</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.carriageway_width_m} Metres</span>
              </div>

              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lane Configuration</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.lane_configuration}</span>
              </div>

              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pavement Type</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.pavement_type}</span>
              </div>

              <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Terrain Classification</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{p.technical_specs.terrain}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-amber-700" /> IRC Engineering Standard Verification</span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Cross-section dimensions and pavement crust design conform to IRC:37-2018 guidelines for high-density coastal corridors and heavy axle loads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: 3. SANCTIONS, 4. MILESTONES & 5. PHYSICAL PROGRESS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sanctions_milestones' && (
        <div className="space-y-6">
          {/* Facet 3: Administrative & Technical Sanctions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 3: Administrative Sanction (AS) & Technical Sanction (TS)</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Statutory Clearances</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 font-semibold">Approval Type</th>
                    <th className="py-2.5 px-3 font-semibold">Reference Order Number</th>
                    <th className="py-2.5 px-3 font-semibold">Sanction Amount</th>
                    <th className="py-2.5 px-3 font-semibold">Sanctioning Authority</th>
                    <th className="py-2.5 px-3 font-semibold">Date of Sanction</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {p.sanctions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {s.approval_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#006A4E]">
                        {s.reference_number}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        ₹{s.sanction_amount_cr?.toFixed(2) || '0.00'} Cr
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {s.approved_by_role}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {s.approval_date ? new Date(s.approval_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Facet 4 & 5: Milestones & Physical Execution Progress */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 4 & 5: Contractual Milestones & Physical Progress Schedule</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Weighted Milestone Progression</span>
            </div>

            <div className="space-y-3">
              {p.milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 text-slate-800">
                        {m.milestone_code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{m.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.delay_days > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          +{m.delay_days} Days Delay
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.status === 'DELAYED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600">{m.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Date</span>
                      <span className="font-medium text-slate-800">{new Date(m.target_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Actual Date</span>
                      <span className="font-medium text-slate-800">{m.actual_date ? new Date(m.actual_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Weightage</span>
                      <span className="font-medium text-slate-800">{m.weightage_pct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Actual Physical</span>
                      <span className="font-bold text-[#006A4E]">{m.actual_physical_pct}% (Target: {m.target_physical_pct}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: 6. EVM VARIANCE & FINANCIAL PROGRESS HISTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'evm_progress' && (
        <div className="space-y-6">
          {/* Facet 6A: Earned Value Management (EVM) Variance Metrics Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 6: Earned Value Management (EVM) Variance Analysis</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Formulae: EV = Sanctioned × ActualPhys%; CV = EV - AC; SV = EV - PV
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Planned Value (PV)</span>
                <span className="font-bold text-slate-900 text-base mt-0.5 block">₹{evm.planned_value_cr.toFixed(2)} Cr</span>
                <span className="text-[10px] text-slate-500">Planned: {evm.planned_physical_pct}%</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-blue-600 block text-[10px] font-semibold uppercase">Earned Value (EV)</span>
                <span className="font-bold text-blue-900 text-base mt-0.5 block">₹{evm.earned_value_cr.toFixed(2)} Cr</span>
                <span className="text-[10px] text-blue-600">Actual: {evm.actual_physical_pct}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Actual Cost (AC)</span>
                <span className="font-bold text-slate-900 text-base mt-0.5 block">₹{evm.actual_cost_cr.toFixed(2)} Cr</span>
                <span className="text-[10px] text-slate-500">Disbursed to Contractor</span>
              </div>

              <div className={`p-3 rounded-xl border ${evm.cost_variance_cr >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <span className={`block text-[10px] font-semibold uppercase ${evm.cost_variance_cr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Cost Variance (CV)
                </span>
                <span className={`font-bold text-base mt-0.5 block ${evm.cost_variance_cr >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {evm.cost_variance_cr >= 0 ? '+' : ''}₹{evm.cost_variance_cr.toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-slate-500">{evm.cost_variance_cr >= 0 ? 'Cost Savings' : 'Cost Overrun'}</span>
              </div>

              <div className={`p-3 rounded-xl border ${evm.schedule_variance_cr >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <span className={`block text-[10px] font-semibold uppercase ${evm.schedule_variance_cr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Schedule Var. (SV)
                </span>
                <span className={`font-bold text-base mt-0.5 block ${evm.schedule_variance_cr >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {evm.schedule_variance_cr >= 0 ? '+' : ''}₹{evm.schedule_variance_cr.toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-slate-500">{evm.schedule_variance_cr >= 0 ? 'Ahead of Plan' : 'Schedule Lag'}</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-purple-600 block text-[10px] font-semibold uppercase">Schedule Days Lag</span>
                <span className="font-bold text-purple-900 text-base mt-0.5 block">{evm.schedule_variance_days} Days</span>
                <span className="text-[10px] text-purple-600">Critical Milestone Slip</span>
              </div>
            </div>
          </div>

          {/* Facet 6B: Monthly Progress History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Monthly Progress & EVM Evolution Records</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Historical Measurement Sheets</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 font-semibold">Month</th>
                    <th className="py-2.5 px-3 font-semibold">Planned Phys %</th>
                    <th className="py-2.5 px-3 font-semibold">Actual Phys %</th>
                    <th className="py-2.5 px-3 font-semibold">Monthly Exp (₹ Cr)</th>
                    <th className="py-2.5 px-3 font-semibold">Cum. Exp (₹ Cr)</th>
                    <th className="py-2.5 px-3 font-semibold">Earned Value (₹ Cr)</th>
                    <th className="py-2.5 px-3 font-semibold">Schedule Var (₹ Cr)</th>
                    <th className="py-2.5 px-3 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {p.progress_history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{rec.reporting_month}</td>
                      <td className="py-3 px-3 text-slate-600">{rec.planned_physical_pct}%</td>
                      <td className="py-3 px-3 font-bold text-blue-700">{rec.actual_physical_pct}%</td>
                      <td className="py-3 px-3 text-slate-800">₹{rec.expenditure_in_month_cr.toFixed(2)}</td>
                      <td className="py-3 px-3 font-medium text-emerald-700">₹{rec.cumulative_expenditure_cr.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{rec.earned_value_cr.toFixed(2)}</td>
                      <td className={`py-3 px-3 font-semibold ${rec.schedule_variance_cr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {rec.schedule_variance_cr >= 0 ? '+' : ''}₹{rec.schedule_variance_cr.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{rec.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: 7. PACKAGES & 8. CONTRACTORS & CONSULTANTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'packages_contractors' && (
        <div className="space-y-6">
          {/* Facet 7: Work Packages Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 7: Executing Work Packages</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Sub-package Division</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.work_packages.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#E6F4EA] text-[#006A4E] border border-[#B2DFCD]">
                      {pkg.package_code}
                    </span>
                    {getStatusBadge(pkg.status)}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">{pkg.title}</h3>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Chainage Stretch</span>
                      <span className="font-semibold text-slate-800">km {pkg.start_chainage_km} to {pkg.end_chainage_km}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sanction Amount</span>
                      <span className="font-semibold text-slate-800">₹{((pkg.sanctioned_amount_cr ?? pkg.cost_cr) ?? 0).toFixed(2)} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Physical Progress</span>
                      <span className="font-bold text-blue-700">{pkg.physical_progress_pct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Financial Progress</span>
                      <span className="font-bold text-emerald-700">{pkg.financial_progress_pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facet 8: Contractors & Consultants Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 8A: Prime Contractor Identity & Agreements</h2>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{p.contractors_and_consultants.main_contractor.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {p.contractors_and_consultants.main_contractor.class}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registration</span>
                    <span className="font-medium">{p.contractors_and_consultants.main_contractor.registration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">GSTIN</span>
                    <span className="font-mono">{p.contractors_and_consultants.main_contractor.gst || '33AAACL1234F1Z5'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Awarded Contract Agreements</span>
                {p.contractors_and_consultants.contracts.map((c, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#006A4E]">{c.agreement_number}</span>
                      <span className="text-[11px] font-semibold text-slate-700">₹{c.contract_value_cr.toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Performance Security: ₹{c.performance_security_cr.toFixed(2)} Cr</span>
                      <span className="text-emerald-700 font-medium">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 8B: Independent Quality & Supervision Consultants</h2>
              </div>

              {p.contractors_and_consultants.consultants.map((con, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{con.company_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {con.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{con.assignment_title}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex justify-between">
                    <span>Consultancy Value: <strong className="text-slate-900">₹{con.contract_value_cr.toFixed(2)} Cr</strong></span>
                    <span>Statutory Supervision</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: 9. OFFICIALS & STAKEHOLDERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'officials_stakeholders' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#006A4E]" />
              <h2 className="text-sm font-bold text-slate-900">Facet 9: Assigned Engineering Officers & Interdepartmental Stakeholders</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Accountability Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p.assigned_officials_and_stakeholders.map((off, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {off.role_label}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active on project" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">{off.officer_name}</h3>
                  <p className="text-[11px] font-medium text-[#006A4E]">{off.designation}</p>
                  <p className="text-[11px] text-slate-500">{off.department}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                  <div>📞 {off.phone}</div>
                  <div>✉️ {off.email}</div>
                  <div className="text-[10px] text-slate-400 truncate">📍 {off.office_location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: 10. LAND ACQUISITION & 11. UTILITY DEPENDENCIES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'land_utilities' && (
        <div className="space-y-6">
          {/* Facet 10: Land Acquisition Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 10: Land Acquisition Status & Cadastral Parcels</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Tamil Nadu Highways Act, 2001 (TN Act 34 of 2002)
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Parcels</span>
                <span className="font-bold text-slate-900 text-lg mt-0.5 block">{p.land_acquisition.total_parcels}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Land Extent</span>
                <span className="font-bold text-slate-900 text-lg mt-0.5 block">{p.land_acquisition.total_land_hectares} Ha</span>
                <span className="text-[10px] text-slate-500">{p.land_acquisition.total_land_sqm.toLocaleString()} Sq.M</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assessed Compensation</span>
                <span className="font-bold text-slate-900 text-lg mt-0.5 block">₹{p.land_acquisition.compensation_assessed_cr.toFixed(2)} Cr</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Compensation Paid</span>
                <span className="font-bold text-emerald-800 text-lg mt-0.5 block">₹{p.land_acquisition.compensation_paid_cr.toFixed(2)} Cr</span>
              </div>
            </div>

            {/* Parcels Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 font-semibold">Parcel Ref</th>
                    <th className="py-2.5 px-3 font-semibold">Village / Taluk</th>
                    <th className="py-2.5 px-3 font-semibold">Survey No.</th>
                    <th className="py-2.5 px-3 font-semibold">Classification</th>
                    <th className="py-2.5 px-3 font-semibold">Extent (Sq.M)</th>
                    <th className="py-2.5 px-3 font-semibold">Sec 15(2) Notice</th>
                    <th className="py-2.5 px-3 font-semibold">Sec 15(1) Gazette</th>
                    <th className="py-2.5 px-3 font-semibold">Sec 19(1) Award</th>
                    <th className="py-2.5 px-3 font-semibold">Possession</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {p.land_acquisition.parcels.map((parcel, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{parcel.parcel_ref}</td>
                      <td className="py-3 px-3">{parcel.village}, {parcel.taluk}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{parcel.survey_number}</td>
                      <td className="py-3 px-3 text-slate-500">{parcel.classification}</td>
                      <td className="py-3 px-3 font-medium">{parcel.total_sqm}</td>
                      <td className="py-3 px-3 text-slate-500">{parcel.sec15_2_date ? new Date(parcel.sec15_2_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-500">{parcel.sec15_1_date ? new Date(parcel.sec15_1_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-500">{parcel.sec19_1_date ? new Date(parcel.sec19_1_date).toLocaleDateString() : 'Pending'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          parcel.possession_status === 'POSSESSION_TAKEN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {parcel.possession_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Facet 11: Utility Clearances & Interdepartmental Dependencies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Facet 11: Utility Shifting Clearances & Interdepartmental Blockers</h2>
              </div>
              <span className="text-xs text-rose-600 font-semibold">
                {p.utilities_and_dependencies.pending_clearances} Clearances Pending ({p.utilities_and_dependencies.total_impact_days} Days Slip)
              </span>
            </div>

            <div className="space-y-3">
              {p.utilities_and_dependencies.items.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-white text-slate-800 border border-slate-200">
                      {item.department_name} ({item.dependency_type})
                    </span>
                    <span className="text-xs font-bold text-rose-700">+{item.days_pending} Days Pending</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{item.action_required}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-rose-100">
                    <span>Contact Officer: <strong>{item.contact_officer}</strong></span>
                    <span>Financial Impact: <strong className="text-rose-700">₹{item.impact_cost_cr?.toFixed(2)} Cr</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: 12. QUALITY, 13. LEGAL CASES & 14. DOCUMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'quality_legal_docs' && (
        <div className="space-y-6">
          {/* Facet 12: Engineering Quality & Inspections (HRS) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 12: Highways Research Station (HRS) Quality Audits & Defect Records</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Independent Lab Testing</span>
            </div>

            <div className="space-y-3">
              {p.engineering_quality.records.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#006A4E]">{q.defect_reference}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {q.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{q.description}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Penalty: <strong className="text-slate-800">₹{q.financial_penalty_cr.toFixed(2)} Cr</strong></span>
                    <span className="font-medium text-blue-700">{q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facet 13: Legal Cases & Judicial Stays */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-700" />
                <h2 className="text-sm font-bold text-slate-900">Facet 13: Madras High Court Legal Cases & Injunction Stays</h2>
              </div>
              <span className="text-xs text-rose-600 font-semibold">
                {p.legal_cases.active_stays_count} Active Stay Orders (Exposure: ₹{p.legal_cases.total_financial_exposure_cr.toFixed(2)} Cr)
              </span>
            </div>

            <div className="space-y-3">
              {p.legal_cases.items.map((leg) => (
                <div key={leg.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-900">{leg.case_number}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      leg.stay_order_active ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {leg.stay_order_active ? 'STAY ACTIVE' : 'NO STAY'}
                    </span>
                  </div>

                  <p className="font-medium text-slate-800">{leg.petitioner}</p>
                  <p className="text-slate-600 text-[11px]">{leg.court_name}</p>

                  {leg.stay_details && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px]">
                      <strong>Stay Injunction:</strong> {leg.stay_details}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-indigo-100">
                    <span>Counsel: <strong>{leg.standing_counsel}</strong></span>
                    <span>Next Hearing: <strong>{leg.next_hearing_date ? new Date(leg.next_hearing_date).toLocaleDateString() : 'N/A'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facet 14: Documents & Cryptographic Integrity Registry */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 14: Official Documents & SHA-256 Cryptographic Verification</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Immutable Document Vault</span>
            </div>

            <div className="space-y-2.5">
              {p.documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#006A4E]" />
                      <span className="font-bold text-slate-900">{doc.document_title}</span>
                      <span className="text-[10px] text-slate-400">({(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <span>SHA-256:</span>
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{doc.sha256_hash}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Integrity Verified
                    </span>
                    <button
                      onClick={() => alert(`Document download link for: ${doc.file_name}`)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600"
                      title="Open Document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: 15. RISKS, 16. AI INTELLIGENCE & 17. AUDIT TRAIL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'risks_ai_audit' && (
        <div className="space-y-6">
          {/* Facet 15: Risk Register & Field Issues */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Facet 15: Statutory Risk Register & Field Escalations</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Risk Score = Probability × Impact</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.risks_and_issues.risks.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                      {r.risk_code} - {r.category}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                      Risk Score: {r.risk_score} ({r.impact})
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">{r.description}</p>

                  <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                    <strong>Mitigation Strategy:</strong> {r.mitigation_strategy}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Owner: {r.owner_role}</span>
                    <span className="font-bold text-amber-700">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facet 16: Grounded AI Project Intelligence */}
          <div className="bg-gradient-to-br from-white to-emerald-50/40 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 16: AI Project Intelligence & Decision Support</h2>
              </div>
              <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#006A4E] px-2 py-0.5 rounded border border-[#B2DFCD]">
                Tamil Nadu Legal & Administrative Rules Grounded
              </span>
            </div>

            <div className="space-y-4">
              {p.ai_findings.map((f) => (
                <div key={f.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                      {f.finding_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Status: <strong>{f.human_validation_status}</strong>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-snug">{f.issue_summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Evidence Chain</span>
                      <p className="text-slate-700 mt-0.5">{f.evidence_chain}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statutory Rule Citation</span>
                      <p className="text-slate-700 mt-0.5">{f.statutory_rule_citation}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-950">
                    <strong className="block text-[#006A4E] text-xs mb-1">Recommended Executive Action:</strong>
                    {f.recommended_action}
                  </div>

                  {/* Officer Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleValidateFinding(f.id)}
                      className="px-3 py-1.5 bg-[#006A4E] hover:bg-[#00553E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Validate & Escalate
                    </button>
                    <button
                      onClick={() => alert(`Forwarding Finding #${f.id} to Superintending Engineer.`)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Refer to Field Division
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facet 17: Immutable Audit History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#006A4E]" />
                <h2 className="text-sm font-bold text-slate-900">Facet 17: Immutable Audit Trail & Statutory Event Log</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Compliance Trail</span>
            </div>

            <div className="space-y-3">
              {p.audit_history.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ev.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">by {ev.user_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{ev.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(ev.timestamp || ev.created_at || '').toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

