import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ProjectItem,
  Project360Detail,
  RoadType
} from '../types';
import { RoadBadge } from '../components/RoadBadge';
import { EVMTrendChart, ProgressComparisonChart } from '../components/Charts';
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
  ChevronLeft,
  Landmark,
  Compass,
  FileCode,
  ExternalLink,
  ChevronDown,
  Info,
  Download,
  Eye,
  Plus,
  Send,
  RefreshCw,
  Camera,
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageSquare,
  Wrench,
  Cpu,
  FolderOpen,
  ClipboardList,
  Network
} from 'lucide-react';
import { ConnectedEntityPanel } from '../components/connectivity/ConnectedEntityPanel';

export type Project360TabKey =
  | 'overview'
  | 'timeline'
  | 'packages'
  | 'stakeholders'
  | 'approvals'
  | 'land_utilities'
  | 'finance'
  | 'quality'
  | 'field_ops'
  | 'legal'
  | 'assets'
  | 'grievances'
  | 'ai_findings'
  | 'documents'
  | 'actions_history'
  | 'connectivity';

interface TabDefinition {
  key: Project360TabKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Project360Page: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project360Detail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Project360TabKey>('overview');
  const [landUtilitySubTab, setLandUtilitySubTab] = useState<'land' | 'utility'>('land');

  // Portfolio Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [programmeFilter, setProgrammeFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modals & Action Forms
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionForm, setActionForm] = useState({
    issue: '',
    department: 'Highways Wing',
    assigned_officer: '',
    priority: 'HIGH',
    target_date: '',
    remarks: ''
  });
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);

  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [qualityForm, setQualityForm] = useState({
    component_type: 'Pavement',
    description: '',
    severity: 'MEDIUM',
    financial_penalty_cr: 0,
    rectification_deadline: '',
    responsible_engineer: ''
  });
  const [qualitySubmitting, setQualitySubmitting] = useState<boolean>(false);

  const [selectedDocPreview, setSelectedDocPreview] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load project portfolio list
  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects({});
      setProjects(data);

      // Check if project id is specified in URL query params
      const idParam = searchParams.get('id');
      const codeParam = searchParams.get('code');
      if (idParam) {
        loadProject360(parseInt(idParam, 10));
      } else if (codeParam) {
        const found = data.find(p => p.project_code === codeParam);
        if (found) loadProject360(found.id);
      } else if (data.length > 0) {
        // Default to demonstration project (Project 4 / PRJ-CKICP-001 or first project)
        const demoPrj = data.find(p => p.id === 4 || p.project_code === 'PRJ-CKICP-001' || p.project_code === 'PRJ-TN-2026-004');
        loadProject360(demoPrj ? demoPrj.id : data[0].id);
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

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered projects for search & selection
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (programmeFilter !== 'ALL') {
        const prog = p.funding_source || (p.project_code.includes('CKICP') ? 'CKICP' : p.project_code.includes('TNRSP') ? 'TNRSP-II' : 'State Highways');
        if (!prog.toLowerCase().includes(programmeFilter.toLowerCase())) return false;
      }
      if (districtFilter !== 'ALL') {
        const dist = (p as any).district || (p.description || '');
        if (!dist.toLowerCase().includes(districtFilter.toLowerCase())) return false;
      }
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }
      if (riskFilter !== 'ALL') {
        const isCritical = (p.physical_progress_pct < 50 && (p.financial_progress_pct - p.physical_progress_pct > 15));
        const isHigh = p.status === 'DELAYED' || p.priority === 'HIGH';
        if (riskFilter === 'CRITICAL' && !isCritical) return false;
        if (riskFilter === 'HIGH' && !isHigh && !isCritical) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = p.project_code.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchContractor = (p.contractor_name || '').toLowerCase().includes(q);
        const matchDirector = (p.project_director_name || '').toLowerCase().includes(q);
        const matchRoad = (p.road_name || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchContractor && !matchDirector && !matchRoad) return false;
      }
      return true;
    });
  }, [projects, programmeFilter, districtFilter, statusFilter, riskFilter, searchQuery]);

  // Current project index for Prev/Next navigation
  const currentIndex = useMemo(() => {
    if (!selectedProject || !projects.length) return -1;
    const currentId = selectedProject.id || selectedProject.project?.id;
    return projects.findIndex(p => p.id === currentId);
  }, [selectedProject, projects]);

  const handlePrevProject = () => {
    if (currentIndex > 0) {
      loadProject360(projects[currentIndex - 1].id);
    }
  };

  const handleNextProject = () => {
    if (currentIndex >= 0 && currentIndex < projects.length - 1) {
      loadProject360(projects[currentIndex + 1].id);
    }
  };

  // Submit Action Directive Form
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !actionForm.issue.trim()) return;
    try {
      setActionSubmitting(true);
      const prjId = selectedProject.id || selectedProject.project?.id || 4;
      await api.createProjectAction(prjId, actionForm);
      showToast('Executive Action Directive recorded and dispatched to audit register', 'success');
      setShowActionModal(false);
      setActionForm({
        issue: '',
        department: 'Highways Wing',
        assigned_officer: '',
        priority: 'HIGH',
        target_date: '',
        remarks: ''
      });
      // Refresh project
      loadProject360(prjId);
    } catch (err) {
      showToast('Failed to record action directive', 'error');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Submit Quality Observation Form
  const handleSubmitQuality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !qualityForm.description.trim()) return;
    try {
      setQualitySubmitting(true);
      const prjId = selectedProject.id || selectedProject.project?.id || 4;
      await api.createProjectQualityObservation(prjId, qualityForm);
      showToast('Engineering Quality Observation logged and assigned for rectification', 'success');
      setShowQualityModal(false);
      setQualityForm({
        component_type: 'Pavement',
        description: '',
        severity: 'MEDIUM',
        financial_penalty_cr: 0,
        rectification_deadline: '',
        responsible_engineer: ''
      });
      // Refresh project
      loadProject360(prjId);
    } catch (err) {
      showToast('Failed to log quality observation', 'error');
    } finally {
      setQualitySubmitting(false);
    }
  };

  // 15 Tab Definitions
  const tabs: TabDefinition[] = useMemo(() => {
    const aiCount = selectedProject?.ai_findings?.length || 0;
    const qualityDefects = selectedProject?.engineering_quality?.critical_unresolved || 0;
    const approvalCount = selectedProject?.utilities_and_dependencies?.pending_clearances || 0;
    const docCount = selectedProject?.documents?.length || 0;
    const actionCount = selectedProject?.actions_register?.length || 0;
    const packageCount = selectedProject?.work_packages?.length || 0;
    const legalCount = selectedProject?.legal_cases?.total_cases || 0;
    const grievanceCount = selectedProject?.citizen_grievances?.pending_count || 0;

    return [
      { key: 'overview', label: '1. Overview', shortLabel: 'Overview', icon: Building },
      { key: 'timeline', label: '2. Timeline', shortLabel: 'Timeline', icon: Calendar },
      { key: 'packages', label: '3. Packages & Contracts', shortLabel: 'Packages', icon: Briefcase, badge: packageCount },
      { key: 'stakeholders', label: '4. Officials & Stakeholders', shortLabel: 'Stakeholders', icon: Users },
      { key: 'approvals', label: '5. Departments & Approvals', shortLabel: 'Approvals', icon: Landmark, badge: approvalCount > 0 ? approvalCount : undefined },
      { key: 'land_utilities', label: '6. Land & Utilities', shortLabel: 'Land & Utility', icon: MapPin },
      { key: 'finance', label: '7. Finance', shortLabel: 'Finance', icon: IndianRupee },
      { key: 'quality', label: '8. Quality', shortLabel: 'Quality', icon: ShieldCheck, badge: qualityDefects > 0 ? qualityDefects : undefined },
      { key: 'field_ops', label: '9. Field Operations', shortLabel: 'Field Ops', icon: Activity },
      { key: 'legal', label: '10. Legal & Compliance', shortLabel: 'Legal', icon: Scale, badge: legalCount > 0 ? legalCount : undefined },
      { key: 'assets', label: '11. Assets', shortLabel: 'Assets', icon: Compass },
      { key: 'grievances', label: '12. Citizen Grievances', shortLabel: 'Grievances', icon: MessageSquare, badge: grievanceCount > 0 ? grievanceCount : undefined },
      { key: 'ai_findings', label: '13. AI Findings', shortLabel: 'AI Findings', icon: Sparkles, badge: aiCount > 0 ? aiCount : undefined },
      { key: 'documents', label: '14. Documents', shortLabel: 'Documents', icon: FileText, badge: docCount },
      { key: 'actions_history', label: '15. Actions & History', shortLabel: 'Actions & Trail', icon: History, badge: actionCount > 0 ? actionCount : undefined },
      { key: 'connectivity', label: '16. Universal Connectivity', shortLabel: 'Entity Web', icon: Network, badge: 'Live' }
    ];
  }, [selectedProject]);

  // Derived KPI calculations for executive summary
  const project = selectedProject?.project;
  const physicalPct = project?.physical_progress_pct ?? 48.5;
  const financialPct = project?.financial_progress_pct ?? 62.4;
  const scheduleDelayDays = selectedProject?.execution_tracking?.schedule_variance_days ?? 115;
  const sanctionedCost = project?.sanctioned_cost_cr ?? 142.5;
  const revisedCost = project?.revised_cost_cr ?? sanctionedCost;
  const expenditure = project?.expenditure_to_date_cr ?? 88.92;
  const budgetUtilisationPct = Math.min(100, Math.round((expenditure / (revisedCost || 1)) * 100));
  const pendingApprovalsCount = selectedProject?.utilities_and_dependencies?.pending_clearances ?? 3;
  const landTotalParcels = selectedProject?.land_acquisition?.total_parcels ?? 50;
  const landPossessedParcels = selectedProject?.land_acquisition?.parcels?.filter(p => p.possession_status === 'POSSESSION_TAKEN').length ?? 38;
  const landProgressPct = Math.round((landPossessedParcels / (landTotalParcels || 1)) * 100);
  const openQualityCount = selectedProject?.engineering_quality?.critical_unresolved ?? 2;
  const openAICount = selectedProject?.ai_findings?.length ?? 1;
  const aiPotentialExposureCr = selectedProject?.ai_findings?.reduce((acc, f: any) => acc + (f.potential_exposure_cr || f.amount_flagged_cr || 0), 0) ?? 9.80;

  // EVM Data for Chart
  const evmChartData = useMemo(() => {
    if (!selectedProject?.progress_history?.length) {
      return [
        { month: 'Oct 25', pv_cr: 25.0, ev_cr: 24.2, ac_cr: 24.5 },
        { month: 'Nov 25', pv_cr: 40.0, ev_cr: 37.5, ac_cr: 39.0 },
        { month: 'Dec 25', pv_cr: 55.0, ev_cr: 49.0, ac_cr: 54.2 },
        { month: 'Jan 26', pv_cr: 72.0, ev_cr: 60.5, ac_cr: 71.0 },
        { month: 'Feb 26', pv_cr: 90.0, ev_cr: 69.1, ac_cr: 88.92 }
      ];
    }
    return selectedProject.progress_history.map(item => ({
      month: item.reporting_month,
      pv_cr: item.planned_value_cr || item.planned_physical_pct * 1.4,
      ev_cr: item.earned_value_cr || item.actual_physical_pct * 1.4,
      ac_cr: item.cumulative_expenditure_cr || (item.actual_physical_pct * 1.4) * 1.15
    }));
  }, [selectedProject]);

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-sm text-white ${
          notification.type === 'success' ? 'bg-emerald-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded border border-amber-300">
                DEMO DATA
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                Seeded Demonstration Workspace
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-mono">
                Updated: 07 Nov 2026, 09:30 IST
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Project 360° Intelligence
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Complete lifecycle visibility, project execution, financial control, stakeholder accountability and AI-assisted risk intelligence.
            </p>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevProject}
              disabled={currentIndex <= 0}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
              title="Previous project in portfolio"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="text-xs text-slate-500 font-medium px-1">
              {currentIndex >= 0 ? `${currentIndex + 1} of ${projects.length}` : '—'}
            </div>
            <button
              onClick={handleNextProject}
              disabled={currentIndex < 0 || currentIndex >= projects.length - 1}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
              title="Next project in portfolio"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
            <button
              onClick={() => setShowActionModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Assign Directive
            </button>
            <button
              onClick={() => setShowQualityModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-1.5 shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Log Quality Issue
            </button>
          </div>
        </div>

        {/* Global Multi-Parameter Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {/* Universal Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Code, Name, Contractor, Director..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Project Selector Dropdown */}
          <div>
            <select
              value={selectedProject ? (selectedProject.id || selectedProject.project?.id || '') : ''}
              onChange={(e) => {
                const pid = parseInt(e.target.value, 10);
                if (pid) loadProject360(pid);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              {filteredProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.project_code} - {p.title.length > 28 ? p.title.substring(0, 28) + '...' : p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Programme Filter */}
          <div>
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Programmes</option>
              <option value="CKICP">CKICP (Corridor Project)</option>
              <option value="TNRSP">TNRSP-II (World Bank)</option>
              <option value="State">State Highways (CRIDP)</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Districts</option>
              <option value="Nilgiris">Nilgiris (Ooty)</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Tiruppur">Tiruppur</option>
              <option value="Madurai">Madurai</option>
              <option value="Chennai">Chennai Metro</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
              <option value="SANCTIONED">Sanctioned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Dossier Skeleton */}
      {dossierLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading comprehensive project dossier...</p>
          <p className="text-xs text-slate-400 mt-1">Retrieving 15 lifecycle domains from unified highways database</p>
        </div>
      )}

      {/* Project Executive Summary & Dossier */}
      {selectedProject && !dossierLoading && (
        <>
          {/* Executive Overview Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {project?.project_code || selectedProject.project_code || 'PRJ-TN-2026-004'}
                  </span>
                  <RoadBadge type={project?.road_type || 'SH'} />
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                    project?.status === 'DELAYED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    project?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {project?.status?.replace('_', ' ') || 'IN PROGRESS'}
                  </span>
                  {scheduleDelayDays > 60 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded border border-red-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {scheduleDelayDays}d Schedule Overrun
                    </span>
                  )}
                  {selectedProject.id === 4 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded border border-purple-200">
                      Prompt 03 Demonstration Focus Corridor
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {project?.title || selectedProject.title}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-4">
                  <span>Programme: <strong className="text-slate-700">{selectedProject.technical_specs?.funding_programme || 'CKICP'}</strong></span>
                  <span>District: <strong className="text-slate-700">{selectedProject.jurisdiction_hierarchy?.district || 'Nilgiris'}</strong></span>
                  <span>Length: <strong className="text-slate-700">{selectedProject.technical_specs?.total_length_km || 38.6} km</strong></span>
                  <span>Chainage: <strong className="text-slate-700">Km {selectedProject.technical_specs?.start_chainage_km ?? 0} to Km {selectedProject.technical_specs?.end_chainage_km ?? 38.6}</strong></span>
                  <span>Lead Contractor: <strong className="text-slate-700">{selectedProject.contractors_and_consultants?.main_contractor?.name || project?.contractor_name || 'KCP Infra Fictional Ltd'}</strong></span>
                  <span>Project Director: <strong className="text-slate-700">{project?.project_director_name || 'Thiru S. Rajendran, SE'}</strong></span>
                </div>
              </div>

              {/* Sanctioned vs Exp Snapshot */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-w-[240px] text-right space-y-1">
                <div className="text-xs text-slate-500 font-medium">Approved / Revised Cost</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  ₹{sanctionedCost.toFixed(2)} Cr / ₹{revisedCost.toFixed(2)} Cr
                </div>
                <div className="text-xs text-slate-600 flex justify-between pt-1 border-t border-slate-200">
                  <span>Actual Cumulative Exp:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{expenditure.toFixed(2)} Cr</span>
                </div>
              </div>
            </div>

            {/* 8 Prominent Executive KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-4">
              {/* 1. Physical Progress */}
              <div
                onClick={() => setActiveTab('field_ops')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Verified physical work completed on site"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>1. Physical</span>
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">{physicalPct.toFixed(1)}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${physicalPct}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Target: 70.0%</div>
              </div>

              {/* 2. Financial Progress */}
              <div
                onClick={() => setActiveTab('finance')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Cumulative expenditure against revised budget"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>2. Financial</span>
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">{financialPct.toFixed(1)}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${financialPct}%` }} />
                </div>
                <div className={`text-[10px] mt-1 font-medium ${financialPct - physicalPct > 10 ? 'text-amber-600' : 'text-slate-400'}`}>
                  Gap: +{(financialPct - physicalPct).toFixed(1)}%
                </div>
              </div>

              {/* 3. Schedule Variance */}
              <div
                onClick={() => setActiveTab('timeline')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Schedule variance in calendar days against baseline"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>3. Sched. Var</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className={`text-base font-bold mt-1 ${scheduleDelayDays > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {scheduleDelayDays > 0 ? `+${scheduleDelayDays}d` : `${scheduleDelayDays}d`}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {scheduleDelayDays > 0 ? 'Behind Planned' : 'Ahead of Target'}
                </div>
                <div className="text-[10px] text-red-600 font-semibold mt-0.5">Critical Milestone #3</div>
              </div>

              {/* 4. Budget Utilisation */}
              <div
                onClick={() => setActiveTab('finance')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Total budget utilisation against sanctioned ceiling"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>4. Utilisation</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">{budgetUtilisationPct}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${budgetUtilisationPct}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">₹{expenditure.toFixed(1)} / ₹{revisedCost.toFixed(1)} Cr</div>
              </div>

              {/* 5. Pending Approvals */}
              <div
                onClick={() => setActiveTab('approvals')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Pending departmental and external statutory clearances"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>5. Clearances</span>
                  <Landmark className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="text-base font-bold text-purple-900 mt-1">{pendingApprovalsCount} Overdue</div>
                <div className="text-[10px] text-slate-500 mt-1">Avg 98d pending</div>
                <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Forest & TANGEDCO</div>
              </div>

              {/* 6. Land Acquisition Progress */}
              <div
                onClick={() => { setActiveTab('land_utilities'); setLandUtilitySubTab('land'); }}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Percentage of private land parcels taken into possession"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>6. Land Acq</span>
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">{landProgressPct}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${landProgressPct}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{landPossessedParcels}/{landTotalParcels} Parcels Taken</div>
              </div>

              {/* 7. Open Quality Findings */}
              <div
                onClick={() => setActiveTab('quality')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Open non-conformance reports and lab test failures"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>7. Quality NCRs</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="text-base font-bold text-red-700 mt-1">{openQualityCount} Open</div>
                <div className="text-[10px] text-slate-500 mt-1">Bitumen & Subgrade</div>
                <div className="text-[10px] text-red-600 font-semibold mt-0.5">Penalties ₹0.30 Cr</div>
              </div>

              {/* 8. Open AI Findings */}
              <div
                onClick={() => setActiveTab('ai_findings')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer"
                title="Active anomalies detected by AI intelligence engine"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>8. AI Exposure</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-base font-bold text-indigo-900 mt-1">{openAICount} Finding</div>
                <div className="text-[10px] text-slate-500 mt-1">Exposure: ₹{aiPotentialExposureCr.toFixed(2)} Cr</div>
                <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">Qty / Variation Risk</div>
              </div>
            </div>
          </div>

          {/* Section 6: AI Project Intelligence Assessment Panel */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 shadow-md border border-indigo-800">
            <div className="flex items-center justify-between border-b border-indigo-700/50 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    AI Project Intelligence Assessment
                    <span className="text-[10px] uppercase font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/40">
                      Advisory System
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Continuous multi-dimensional risk synthesis across schedule, contract, land, utility, finance and engineering logs.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded border border-indigo-700/60 hidden sm:inline-block">
                Model: TN-HighwayGuard v3.4 • Synthesised Factual Basis
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Executive Summary & Critical Findings */}
              <div className="lg:col-span-2 space-y-4">
                {/* A. Executive Summary */}
                <div className="bg-slate-800/80 border border-indigo-500/20 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> A. Executive Summary
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {selectedProject.ai_project_intelligence?.executive_summary ||
                      'This project is experiencing schedule compression (+115 days delay) driven primarily by unresolved TANGEDCO 11kV electrical pole relocations (48 poles) and 12 pending revenue land parcels in Ooty Taluk. Financial progress (62.4%) leads verified physical progress (48.5%) by 13.9%, triggered by a disputed ₹9.80 Cr rock excavation variation claim. Two critical quality non-conformances remain unresolved, and interim injunction OS 114/2025 restricts work along Km 18+200 to 19+400.'}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                      Confirmed Fact: 48 Poles Pending
                    </span>
                    <span className="bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                      Confirmed Fact: 12 Parcels Unpossessed
                    </span>
                    <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700">
                      AI Inference: Schedule Slip Risk 165d
                    </span>
                  </div>
                </div>

                {/* B. Critical Findings */}
                <div className="bg-slate-800/80 border border-indigo-500/20 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> B. Critical High-Priority Findings
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {(selectedProject.ai_project_intelligence?.critical_findings || [
                      'Schedule Slip: Package EPC-01 is 115 days behind baseline; milestone #3 recovery plan not submitted.',
                      'Financial Divergence: Paid expenditure is ₹13.80 Cr ahead of third-party verified physical measurements.',
                      'Utility Dependency: TANGEDCO deposit paid 90 days ago; shutdown clearances pending Divisional Engineer sanction.',
                      'Quality Non-Compliance: Defect notices QC-401 (asphalt binder) & QC-402 (subgrade compaction) open >45 days.'
                    ]).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* C. Multi-Dimensional Root Cause Analysis */}
                <div className="bg-slate-800/80 border border-indigo-500/20 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> C. Multi-Dimensional Root Cause Synthesis
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                      <span className="text-[10px] font-bold text-teal-300 uppercase block">1. Land Acquisition</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {selectedProject.ai_project_intelligence?.root_cause_analysis?.land_acquisition ||
                          '12 private tea-estate parcels awaiting Sec 19(1) declaration in Ooty Taluk; compensation deposited with revenue court.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                      <span className="text-[10px] font-bold text-amber-300 uppercase block">2. Utility Shifting</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {selectedProject.ai_project_intelligence?.root_cause_analysis?.utility_shifting ||
                          '48 high-tension poles on ghat corridor require coordinated power shutdown from Gudalur sub-station.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                      <span className="text-[10px] font-bold text-purple-300 uppercase block">3. Department Approvals</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {selectedProject.ai_project_intelligence?.root_cause_analysis?.departmental_approvals ||
                          'Forest Department permission for 0.8 hectares reserve forest diversion pending PCCF regional committee clearance.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                      <span className="text-[10px] font-bold text-rose-300 uppercase block">4. Financial & Variation</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {selectedProject.ai_project_intelligence?.root_cause_analysis?.funding_and_payment ||
                          'Contractor submitted ₹9.80 Cr hard rock variation claim exceeding 25% tender BOQ limit without prior CE approval.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recommended Actions & Ministerial Decision Required */}
              <div className="space-y-4">
                {/* D. Recommended Actions */}
                <div className="bg-slate-800/80 border border-indigo-500/20 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" /> D. Recommended Corrective Actions
                  </div>
                  <div className="space-y-2 text-xs text-slate-200">
                    {(selectedProject.ai_project_intelligence?.recommended_actions || [
                      'Convene District Revenue-Highways Task Force meeting chaired by Nilgiris District Collector for Sec 19(1) closure.',
                      'Direct TANGEDCO Superintending Engineer to schedule rolling power shutdowns between 06:00 and 10:00 hrs.',
                      'Withhold ₹9.80 Cr variation claim from RA Bill #14 pending independent geological assessment.',
                      'Issue statutory 14-day cure notice to contractor under Clause 46 for bitumen quality rectification.'
                    ]).map((act, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-700/40">
                        <span className="bg-indigo-600/40 text-indigo-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {i + 1}
                        </span>
                        <span className="text-[11px]">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* E. Ministerial Decision Required */}
                <div className="bg-gradient-to-b from-red-950/80 to-slate-900 border border-red-500/40 rounded-lg p-3.5 shadow-inner">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-red-400" /> E. Executive Decision Required
                    </span>
                    <span className="text-[10px] bg-red-800/60 text-red-200 px-1.5 py-0.5 rounded font-mono">
                      {selectedProject.ai_project_intelligence?.decision_required?.reference || 'MDR-2026-001'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">
                    {selectedProject.ai_project_intelligence?.decision_required?.decision_title ||
                      'Variation Sanction & Inter-Departmental Joint Directive'}
                  </h4>
                  <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    <strong>Authority:</strong> {selectedProject.ai_project_intelligence?.decision_required?.decision_authority || 'Minister for Highways & Minor Ports'}<br />
                    <strong>Directive:</strong> {selectedProject.ai_project_intelligence?.decision_required?.recommended_directive ||
                      'Sanction constitution of Empowered Inter-Departmental Committee to resolve Ooty corridor land-utility blockades and stay rock variation payment.'}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 font-semibold">Priority: High (Action by 15 Nov)</span>
                    <button
                      onClick={() => navigate('/reports?tab=decisions')}
                      className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded shadow transition flex items-center gap-1"
                    >
                      Open in Decision Queue <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 15 Project Lifecycle Tabs Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-thin">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                      isActive
                        ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Road Technical Specifications */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <Compass className="w-4 h-4 text-indigo-600" /> Technical & Geometric Specs
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-slate-400">Road Code / Name</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.road_code} • {selectedProject.technical_specs?.road_name}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Classification</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.road_type || 'State Highway (SH)'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Carriageway Width</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.carriageway_width_m || 7.0} Metres</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Lane Configuration</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.lane_configuration || '2-Lane with Paved Shoulder'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Pavement Type</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.pavement_type || 'Flexible (Bituminous)'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Terrain</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.terrain || 'Mountainous / Ghat Section'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Start / End Chainage</dt>
                          <dd className="font-semibold text-slate-800 font-mono">Km {selectedProject.technical_specs?.start_chainage_km ?? 0} to Km {selectedProject.technical_specs?.end_chainage_km ?? 38.6}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Total Length</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.total_length_km || 38.6} km</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Sanctions & Approvals */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" /> Administrative & Technical Sanctions
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-slate-400">Admin Sanction (AS)</dt>
                          <dd className="font-semibold text-slate-800">{project?.sanction_as_number || 'GO (Ms) No. 142/HW-2023'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">AS Date</dt>
                          <dd className="font-semibold text-slate-800">{project?.sanction_as_date || '18 Aug 2023'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Technical Sanction (TS)</dt>
                          <dd className="font-semibold text-slate-800">{project?.sanction_ts_number || 'CE/CKICP/TS/44/2023'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">TS Date</dt>
                          <dd className="font-semibold text-slate-800">{project?.sanction_ts_date || '12 Oct 2023'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Funding Programme</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.technical_specs?.funding_programme || 'CKICP (State/ADB Assistance)'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Budget Head</dt>
                          <dd className="font-mono text-slate-800 text-[11px]">5054-03-337-AA-1601</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Jurisdictional Hierarchy */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <Building className="w-4 h-4 text-purple-600" /> Administrative Jurisdiction
                      </h4>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-slate-400">Highways Zone</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.jurisdiction_hierarchy?.zone_name || 'Coimbatore Zone'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Highways Circle</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.jurisdiction_hierarchy?.circle_name || 'Nilgiris Circle'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Division Office</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.jurisdiction_hierarchy?.division_name || 'Ooty Highways Division'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">District Administration</dt>
                          <dd className="font-semibold text-slate-800">{selectedProject.jurisdiction_hierarchy?.district || 'The Nilgiris'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Executing Authority</dt>
                          <dd className="font-semibold text-slate-800">CKICP Project Implementation Unit</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Project Director</dt>
                          <dd className="font-semibold text-slate-800">{project?.project_director_name || 'Thiru S. Rajendran, SE'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Project Description & Narrative */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Scope & Project Purpose</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {project?.description || selectedProject.description ||
                        'Widening and strengthening of the State Highway 15 Ooty-Gudalur corridor (Km 0/0 to 38/6) including geometric improvements, slope stabilisation in landslide prone stretches, reconstruction of 24 minor culverts, construction of 2 high-level bridges, and reinforced soil retaining walls for ecological preservation along the Western Ghats eco-sensitive corridor.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: TIMELINE & LIFECYCLE MILESTONES */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Project Lifecycle & Stage Milestones</h4>
                      <p className="text-xs text-slate-500">Track progression from initial feasibility and sanctions to Defect Liability Period closure.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>
                      <span className="flex items-center gap-1 text-blue-700 font-semibold"><Activity className="w-3.5 h-3.5" /> In Progress</span>
                      <span className="flex items-center gap-1 text-red-700 font-semibold"><Clock className="w-3.5 h-3.5" /> Delayed / Blocked</span>
                    </div>
                  </div>

                  {/* Visual Milestone Timeline */}
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 my-4">
                    {(selectedProject.milestones?.length ? selectedProject.milestones : [
                      { title: 'Detailed Project Report (DPR) Approval', target_date: '2023-05-15', actual_date: '2023-05-20', status: 'COMPLETED', delay_days: 5, target_physical_pct: 5 },
                      { title: 'Administrative Sanction (GO Ms 142)', target_date: '2023-08-10', actual_date: '2023-08-18', status: 'COMPLETED', delay_days: 8, target_physical_pct: 5 },
                      { title: 'Technical Sanction (CE/CKICP)', target_date: '2023-10-01', actual_date: '2023-10-12', status: 'COMPLETED', delay_days: 11, target_physical_pct: 5 },
                      { title: 'Environmental & Forest Clearance (Phase 1)', target_date: '2023-12-15', actual_date: '2024-01-20', status: 'COMPLETED', delay_days: 36, target_physical_pct: 10 },
                      { title: 'Tender Award & Work Order Issuance', target_date: '2024-02-01', actual_date: '2024-02-15', status: 'COMPLETED', delay_days: 14, target_physical_pct: 10 },
                      { title: 'Milestone 1: 20% Physical Completion (Earthwork & Culverts)', target_date: '2024-08-15', actual_date: '2024-09-02', status: 'COMPLETED', delay_days: 18, target_physical_pct: 15 },
                      { title: 'Milestone 2: 40% Physical Completion (GSB & WMM)', target_date: '2025-02-28', actual_date: '2025-04-10', status: 'COMPLETED', delay_days: 41, target_physical_pct: 20 },
                      { title: 'Milestone 3: 65% Physical Completion (Dense Bituminous Macadam)', target_date: '2025-10-31', actual_date: undefined, status: 'DELAYED', delay_days: 115, target_physical_pct: 15 },
                      { title: 'Milestone 4: 100% Construction Completion & Safety Audit', target_date: '2026-06-30', actual_date: undefined, status: 'PENDING', delay_days: 0, target_physical_pct: 10 },
                      { title: 'Defect Liability Period (DLP) 3-Year Handover', target_date: '2029-06-30', actual_date: undefined, status: 'PENDING', delay_days: 0, target_physical_pct: 5 }
                    ]).map((ms: any, idx: number) => {
                      const isDone = ms.status === 'COMPLETED';
                      const isDelayed = ms.status === 'DELAYED' || (ms.delay_days && ms.delay_days > 30);
                      return (
                        <div key={idx} className="relative group">
                          {/* Circle on line */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                            isDone ? 'border-emerald-600 bg-emerald-500' :
                            isDelayed ? 'border-red-600 bg-red-500 animate-pulse' :
                            'border-slate-300 bg-slate-100'
                          }`} />

                          <div className={`border rounded-lg p-3 transition ${
                            isDelayed ? 'bg-red-50/60 border-red-200' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-800">
                                {ms.title || ms.milestone_name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isDone ? 'bg-emerald-100 text-emerald-800' :
                                  isDelayed ? 'bg-red-100 text-red-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {ms.status || 'PENDING'}
                                </span>
                                {ms.delay_days && ms.delay_days > 0 ? (
                                  <span className="text-[10px] font-mono text-red-600 font-bold">
                                    +{ms.delay_days}d delay
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4">
                              <span>Planned: <strong className="text-slate-700">{ms.target_date || ms.planned_date}</strong></span>
                              {ms.actual_date && <span>Actual: <strong className="text-slate-700">{ms.actual_date}</strong></span>}
                              {(ms.target_physical_pct || ms.weightage_pct) && (
                                <span>Weightage: <strong>{ms.target_physical_pct || ms.weightage_pct}%</strong></span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: PACKAGES & CONTRACTS */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Work Packages & Commercial Contracts</h4>
                      <p className="text-xs text-slate-500">Contractual obligations, agreement values, contractor adherence and variation claims.</p>
                    </div>
                    <button
                      onClick={() => navigate('/contractors')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      View Contractors Workspace <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Packages Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Package ID & Scope</th>
                          <th className="p-3">Contractor</th>
                          <th className="p-3">Contract Value</th>
                          <th className="p-3">Tender Ref / Award</th>
                          <th className="p-3">Physical %</th>
                          <th className="p-3">Financial %</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Risk Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.work_packages?.length ? selectedProject.work_packages : [
                          {
                            package_code: 'PKG-EPC-01',
                            package_name: 'Corridor Widening Km 0/0 to 20/0 & 14 Culverts',
                            contractor_name: 'KCP Infra Fictional Ltd',
                            contract_value_cr: 84.50,
                            agreement_number: 'CKICP/AGR/2024/01',
                            award_date: '2024-02-15',
                            physical_progress_pct: 46.2,
                            financial_progress_pct: 61.8,
                            status: 'DELAYED',
                            risk_level: 'CRITICAL'
                          },
                          {
                            package_code: 'PKG-EPC-02',
                            package_name: 'Ghat Section Km 20/0 to 38/6 & 2 High Level Bridges',
                            contractor_name: 'Southern Highway Builders Ltd (Fictional)',
                            contract_value_cr: 58.00,
                            agreement_number: 'CKICP/AGR/2024/02',
                            award_date: '2024-03-01',
                            physical_progress_pct: 51.4,
                            financial_progress_pct: 53.0,
                            status: 'IN_PROGRESS',
                            risk_level: 'MEDIUM'
                          }
                        ]).map((pkg: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="p-3">
                              <span className="font-mono font-bold text-indigo-700 block">{pkg.package_code}</span>
                              <span className="text-slate-800 font-medium">{pkg.package_name || pkg.name}</span>
                            </td>
                            <td className="p-3 font-medium text-slate-800">{pkg.contractor_name || 'KCP Infra Fictional Ltd'}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">₹{pkg.contract_value_cr?.toFixed(2) || '84.50'} Cr</td>
                            <td className="p-3 text-slate-500">
                              <div className="font-mono text-[11px]">{pkg.agreement_number || 'TND-2023-41'}</div>
                              <div className="text-[10px] text-slate-400">Award: {pkg.award_date || 'Feb 2024'}</div>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800">{pkg.physical_progress_pct}%</span>
                              <div className="w-16 bg-slate-200 h-1 rounded-full mt-1">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pkg.physical_progress_pct}%` }} />
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800">{pkg.financial_progress_pct}%</span>
                              <div className="w-16 bg-slate-200 h-1 rounded-full mt-1">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pkg.financial_progress_pct}%` }} />
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                pkg.status === 'DELAYED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {pkg.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                pkg.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {pkg.risk_level || 'MEDIUM'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Variation Claims & Extension of Time (EOT) Summary */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Active Variation & Extension Claims Under Scrutiny
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950">
                      <div className="bg-white p-3 rounded border border-amber-200">
                        <span className="font-bold block">Claim #VAR-01: Hard Rock Classification Variance (₹9.80 Cr)</span>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Contractor claimed 148,000 m³ hard rock excavation vs tender estimate of 42,000 m³ between Km 8+400 and 14+200. Flagged by AI Leakage Detector (ANM-2026-003) due to absence of joint core sample test logs.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-amber-200">
                        <span className="font-bold block">EOT Request #02: 120-Day Time Extension</span>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Claimed by EPC-01 citing unshifted TANGEDCO 11kV lines and court injunction OS 114/2025. Currently under review by Superintending Engineer (Highways), Nilgiris.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OFFICIALS & STAKEHOLDERS */}
              {activeTab === 'stakeholders' && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">Project Governance & Stakeholder Directory</h4>
                    <p className="text-xs text-slate-500">Designated government engineers, administrative officers, contractor executives and external agency liaisons.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Highways Department Officers */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 border-b border-indigo-200 pb-1">
                        <Users className="w-4 h-4 text-indigo-600" /> Highways Dept Officials
                      </h5>
                      {(selectedProject.assigned_officials_and_stakeholders?.filter(s => s.stakeholder_type === 'DEPARTMENT_OFFICIAL' || !s.stakeholder_type) || [
                        { officer_name: 'Thiru S. Rajendran', designation: 'Superintending Engineer & Project Director', department: 'CKICP Highways PIU', phone: '+91 94432 XXXXX', email: 'se.ckicp.ooty@tn.gov.in', responsibility_scope: 'Overall Project & Sanction Authority' },
                        { officer_name: 'Tmt M. Kalaiselvi', designation: 'Divisional Engineer (Highways)', department: 'Highways C&M, Ooty', phone: '+91 94433 XXXXX', email: 'de.ooty.hw@tn.gov.in', responsibility_scope: 'Field Execution & Quality Monitoring' },
                        { officer_name: 'Thiru R. Venkatesh', designation: 'Assistant Executive Engineer', department: 'Gudalur Sub-Division', phone: '+91 94434 XXXXX', email: 'aee.gudalur@tn.gov.in', responsibility_scope: 'Day-to-day Site Measurements & Supervision' }
                      ]).map((off: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                          <div className="font-bold text-slate-900">{off.officer_name || off.contact_person}</div>
                          <div className="text-indigo-700 font-medium text-[11px]">{off.designation || off.role_label}</div>
                          <div className="text-slate-500 text-[11px]">{off.department || off.department_name}</div>
                          <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-200 font-mono">
                            {off.phone || '+91 94430 00000'} • {off.email || 'officer@tn.gov.in'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contractor & Consultant Representatives */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 border-b border-emerald-200 pb-1">
                        <Briefcase className="w-4 h-4 text-emerald-600" /> Contractors & Consultants
                      </h5>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-bold text-slate-900">KCP Infra Fictional Ltd</div>
                        <div className="text-emerald-700 font-medium text-[11px]">EPC Contractor (Package 01)</div>
                        <div className="text-slate-500 text-[11px]">Project Manager: Er. K. Balaji</div>
                        <div className="text-slate-400 text-[10px] font-mono">Mobile: +91 98410 XXXXX • Reg: Class-I Special</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-bold text-slate-900">STUP & Associates (Fictional)</div>
                        <div className="text-emerald-700 font-medium text-[11px]">Authority's Engineer / Independent Consultant</div>
                        <div className="text-slate-500 text-[11px]">Team Leader: Dr. P. Ramanathan</div>
                        <div className="text-slate-400 text-[10px] font-mono">Quality Assurance & Milestone Certification</div>
                      </div>
                    </div>

                    {/* Inter-Departmental External Liaisons */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 border-b border-purple-200 pb-1">
                        <Landmark className="w-4 h-4 text-purple-600" /> External Inter-Agency Officers
                      </h5>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-bold text-slate-900">Thiru K. Sivakumar, DRO</div>
                        <div className="text-purple-700 font-medium text-[11px]">District Revenue Officer, Nilgiris</div>
                        <div className="text-slate-500 text-[11px]">Land Acquisition Competent Authority (CALA)</div>
                        <div className="text-amber-700 text-[10px] font-bold">Pending: 12 Sec 19(1) Gazettes</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-bold text-slate-900">Er. A. Meganathan, SE</div>
                        <div className="text-purple-700 font-medium text-[11px]">TANGEDCO Nilgiris EDC</div>
                        <div className="text-slate-500 text-[11px]">Electrical Utility Shifting Supervision</div>
                        <div className="text-amber-700 text-[10px] font-bold">Pending: 48 Poles Relocation</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DEPARTMENTS & APPROVALS */}
              {activeTab === 'approvals' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Departmental Clearances & Blockers Register</h4>
                      <p className="text-xs text-slate-500">Cross-departmental dependencies, submission dates, pending duration and critical path impact.</p>
                    </div>
                    <button
                      onClick={() => navigate('/departments')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Departments Dependency Matrix <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Clearance Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Dep ID</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Clearance Scope</th>
                          <th className="p-3">Responsible Authority</th>
                          <th className="p-3">Submitted</th>
                          <th className="p-3">Days Pending</th>
                          <th className="p-3">Impact</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.utilities_and_dependencies?.items?.length ? selectedProject.utilities_and_dependencies.items : [
                          {
                            id: 101,
                            department_name: 'Revenue Department',
                            description: 'Section 19(1) Land Declaration for 12 Tea Estate Parcels (Ooty Taluk)',
                            assigned_officer_name: 'District Revenue Officer, Nilgiris',
                            submission_date: '2025-08-10',
                            days_pending: 110,
                            schedule_impact_days: 90,
                            status: 'DELAYED'
                          },
                          {
                            id: 102,
                            department_name: 'TANGEDCO',
                            description: 'Relocation of 48 HT 11kV Electric Poles and 2 Transformers (Km 4/0 to 12/0)',
                            assigned_officer_name: 'Superintending Engineer, Nilgiris EDC',
                            submission_date: '2025-09-01',
                            days_pending: 88,
                            schedule_impact_days: 85,
                            status: 'DELAYED'
                          },
                          {
                            id: 103,
                            department_name: 'Forest Department',
                            description: 'Permission for Tree Felling (142 trees) & Eco-sensitive Roadside Clearance',
                            assigned_officer_name: 'District Forest Officer (Nilgiris North)',
                            submission_date: '2025-10-15',
                            days_pending: 44,
                            schedule_impact_days: 30,
                            status: 'UNDER_PROCESS'
                          },
                          {
                            id: 104,
                            department_name: 'Water Resources Dept (WRD)',
                            description: 'NOC for Bridge Abutment construction across Pykara River tributary',
                            assigned_officer_name: 'Executive Engineer, WRD Bhavani Basin',
                            submission_date: '2024-04-10',
                            days_pending: 0,
                            schedule_impact_days: 0,
                            status: 'APPROVED'
                          }
                        ]).map((dep: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="p-3 font-mono font-bold text-slate-700">DEP-{dep.id}</td>
                            <td className="p-3 font-semibold text-slate-900">{dep.department_name || dep.department}</td>
                            <td className="p-3 text-slate-700 max-w-xs">{dep.description || dep.clearance_type}</td>
                            <td className="p-3 text-slate-600">{dep.assigned_officer_name || dep.responsible_officer}</td>
                            <td className="p-3 text-slate-500 font-mono text-[11px]">{dep.submission_date || 'Aug 2025'}</td>
                            <td className="p-3 font-mono font-bold text-red-600">
                              {dep.days_pending > 0 ? `${dep.days_pending} days` : 'Cleared'}
                            </td>
                            <td className="p-3 text-slate-600">
                              {dep.schedule_impact_days > 0 ? (
                                <span className="text-red-700 font-semibold">Critical Path ({dep.schedule_impact_days}d)</span>
                              ) : (
                                <span className="text-slate-400">None</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                dep.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                dep.status === 'DELAYED' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {dep.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: LAND & UTILITIES */}
              {activeTab === 'land_utilities' && (
                <div className="space-y-6">
                  {/* Sub-tab Switcher */}
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <button
                      onClick={() => setLandUtilitySubTab('land')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                        landUtilitySubTab === 'land'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Land Acquisition (50 Parcels)
                    </button>
                    <button
                      onClick={() => setLandUtilitySubTab('utility')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                        landUtilitySubTab === 'utility'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Utility Shifting (48 Poles & Waterlines)
                    </button>
                    <div className="flex-1 text-right">
                      <button
                        onClick={() => navigate('/land-utility')}
                        className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Open Land & Utility Module <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 6a: Land Acquisition Sub-tab */}
                  {landUtilitySubTab === 'land' && (
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium block">Total Land Required</span>
                          <span className="text-base font-bold text-slate-900 font-mono">14.85 Hectares</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">50 Survey Parcels</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                          <span className="text-[11px] text-emerald-700 font-medium block">Possession Taken</span>
                          <span className="text-base font-bold text-emerald-900 font-mono">11.20 Hectares (75%)</span>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">38 Parcels Handed Over</span>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <span className="text-[11px] text-red-700 font-medium block">Possession Pending</span>
                          <span className="text-base font-bold text-red-900 font-mono">3.65 Hectares (25%)</span>
                          <span className="text-[10px] text-red-600 block mt-0.5">12 Parcels in Ooty Taluk</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium block">Compensation Disbursed</span>
                          <span className="text-base font-bold text-slate-900 font-mono">₹14.20 / ₹18.50 Cr</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">₹4.30 Cr In Court Deposit</span>
                        </div>
                      </div>

                      {/* Land Parcels Table */}
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Parcel Ref</th>
                              <th className="p-2.5">Survey No & Village</th>
                              <th className="p-2.5">Extent</th>
                              <th className="p-2.5">Classification</th>
                              <th className="p-2.5">Sec 15(2)</th>
                              <th className="p-2.5">Sec 19(1)</th>
                              <th className="p-2.5">Possession</th>
                              <th className="p-2.5">Litigation / Stay</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedProject.land_acquisition?.parcels?.length ? selectedProject.land_acquisition.parcels : [
                              { parcel_ref: 'LA-NIL-01', survey_number: '142/1A', village: 'Naduvattam', taluk: 'Ooty', total_sqm: 4200, classification: 'Dry Agricultural (Tea)', sec15_2_date: '2024-03-10', sec19_1_date: 'Pending', possession_status: 'PENDING_AWARD', has_litigation: true },
                              { parcel_ref: 'LA-NIL-02', survey_number: '142/2B', village: 'Naduvattam', taluk: 'Ooty', total_sqm: 3800, classification: 'Dry Agricultural (Tea)', sec15_2_date: '2024-03-10', sec19_1_date: 'Pending', possession_status: 'PENDING_AWARD', has_litigation: true },
                              { parcel_ref: 'LA-NIL-03', survey_number: '88/3', village: 'Pykara', taluk: 'Ooty', total_sqm: 6100, classification: 'Revenue Poramboke', sec15_2_date: '2024-01-15', sec19_1_date: '2024-07-20', possession_status: 'POSSESSION_TAKEN', has_litigation: false },
                              { parcel_ref: 'LA-NIL-04', survey_number: '92/1', village: 'Gudalur Rural', taluk: 'Gudalur', total_sqm: 5400, classification: 'Patta Land', sec15_2_date: '2024-02-12', sec19_1_date: '2024-08-30', possession_status: 'POSSESSION_TAKEN', has_litigation: false }
                            ]).map((p: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="p-2.5 font-mono font-bold text-indigo-700">{p.parcel_ref}</td>
                                <td className="p-2.5 font-medium text-slate-800">
                                  {p.survey_number} • {p.village} ({p.taluk})
                                </td>
                                <td className="p-2.5 font-mono">{p.total_sqm} m²</td>
                                <td className="p-2.5 text-slate-600">{p.classification}</td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-500">{p.sec15_2_date || '—'}</td>
                                <td className="p-2.5 font-mono text-[11px]">
                                  {p.sec19_1_date === 'Pending' ? (
                                    <span className="text-red-600 font-bold">Pending</span>
                                  ) : (
                                    <span className="text-emerald-700">{p.sec19_1_date}</span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                    p.possession_status === 'POSSESSION_TAKEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {p.possession_status?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  {p.has_litigation ? (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                                      OS 114/2025 Stay
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Clear</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 6b: Utility Shifting Sub-tab */}
                  {landUtilitySubTab === 'utility' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium block">Total Relocations</span>
                          <span className="text-base font-bold text-slate-900">72 Utility Assets</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Electric, Water, Telecom</span>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <span className="text-[11px] text-amber-700 font-medium block">TANGEDCO Poles Pending</span>
                          <span className="text-base font-bold text-amber-900">48 HT 11kV Poles</span>
                          <span className="text-[10px] text-amber-600 block mt-0.5">Deposit ₹1.45 Cr Paid</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium block">Water Pipelines</span>
                          <span className="text-base font-bold text-slate-900">3.2 km Pipeline Cleared</span>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">TWAD Board Complete</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Utility Type</th>
                              <th className="p-2.5">Owner Agency</th>
                              <th className="p-2.5">Affected Chainage</th>
                              <th className="p-2.5">Quantity</th>
                              <th className="p-2.5">Deposit Amount</th>
                              <th className="p-2.5">Execution Status</th>
                              <th className="p-2.5">Schedule Impact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedProject.utility_shifting?.items?.length ? selectedProject.utility_shifting.items : [
                              { utility_type: '11kV HT Electrical Line & Poles', department: 'TANGEDCO (Nilgiris EDC)', affected_chainage: 'Km 4+200 to 12+800', quantity: 48, unit: 'Poles', estimated_cost_cr: 1.45, work_status: 'IN_PROGRESS', schedule_impact_days: 85 },
                              { utility_type: 'Distribution Transformers (100 kVA)', department: 'TANGEDCO (Nilgiris EDC)', affected_chainage: 'Km 6+100 & 9+400', quantity: 2, unit: 'Units', estimated_cost_cr: 0.38, work_status: 'IN_PROGRESS', schedule_impact_days: 45 },
                              { utility_type: 'Water Supply Pipeline (150mm DI)', department: 'TWAD Board', affected_chainage: 'Km 18+000 to 21+200', quantity: 3200, unit: 'Metres', estimated_cost_cr: 0.85, work_status: 'COMPLETED', schedule_impact_days: 0 },
                              { utility_type: 'Optical Fibre Cable (OFC)', department: 'BSNL', affected_chainage: 'Km 0/0 to 38/6', quantity: 38.6, unit: 'km', estimated_cost_cr: 0.22, work_status: 'COMPLETED', schedule_impact_days: 0 }
                            ]).map((u: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="p-2.5 font-bold text-slate-800">{u.utility_type}</td>
                                <td className="p-2.5 text-slate-700">{u.department}</td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-600">{u.affected_chainage}</td>
                                <td className="p-2.5 font-mono">{u.quantity} {u.unit}</td>
                                <td className="p-2.5 font-mono font-bold text-slate-900">₹{u.estimated_cost_cr?.toFixed(2)} Cr</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                    u.work_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {u.work_status?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  {u.schedule_impact_days > 0 ? (
                                    <span className="text-red-700 font-bold">{u.schedule_impact_days} Days Blocker</span>
                                  ) : (
                                    <span className="text-emerald-700 font-medium">Cleared</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: FINANCE */}
              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Project Financial Control & EVM Analytics</h4>
                      <p className="text-xs text-slate-500">Earned Value Management (EVM), budget vs expenditure and searchable running bill transactions.</p>
                    </div>
                    <button
                      onClick={() => navigate('/finance')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Finance Workspace <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* EVM Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Planned Value (PV)</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">₹90.0 Cr</span>
                      <span className="text-[10px] text-slate-400 block">Baseline Plan</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Earned Value (EV)</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">₹69.1 Cr</span>
                      <span className="text-[10px] text-slate-400 block">Physical Value</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Actual Cost (AC)</span>
                      <span className="text-sm font-bold text-red-700 font-mono">₹88.92 Cr</span>
                      <span className="text-[10px] text-slate-400 block">Booked Exp</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Cost Var (CV)</span>
                      <span className="text-sm font-bold text-red-700 font-mono">-₹19.82 Cr</span>
                      <span className="text-[10px] text-red-600 font-semibold block">Cost Overrun</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Sched Var (SV)</span>
                      <span className="text-sm font-bold text-red-700 font-mono">-₹20.90 Cr</span>
                      <span className="text-[10px] text-red-600 font-semibold block">Behind Baseline</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">CPI (Cost Index)</span>
                      <span className="text-sm font-bold text-amber-700 font-mono">0.78</span>
                      <span className="text-[10px] text-amber-600 font-semibold block">&lt; 1.0 (Unfavourable)</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">SPI (Sched Index)</span>
                      <span className="text-sm font-bold text-amber-700 font-mono">0.77</span>
                      <span className="text-[10px] text-amber-600 font-semibold block">&lt; 1.0 (Delayed)</span>
                    </div>
                  </div>

                  {/* EVM Trend Chart */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Cumulative Earned Value vs Planned Value & Actual Cost Trend
                    </h5>
                    <EVMTrendChart data={evmChartData} />
                  </div>

                  {/* Searchable Transaction Table */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Running Account (RA) Bills & Vouchers</h5>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Voucher / Txn Ref</th>
                            <th className="p-2.5">Package</th>
                            <th className="p-2.5">Contractor</th>
                            <th className="p-2.5">Bill Date</th>
                            <th className="p-2.5">Bill Amount</th>
                            <th className="p-2.5">Approved Amount</th>
                            <th className="p-2.5">Paid Amount</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(selectedProject.financial_transactions?.length ? selectedProject.financial_transactions : [
                            { txn_reference: 'TXN-2026-081', voucher_number: 'VCH-OTY-2026-14', package_name: 'PKG-EPC-01', contractor_name: 'KCP Infra Fictional Ltd', bill_date: '2026-01-20', bill_amount_cr: 14.50, approved_amount_cr: 11.20, paid_amount_cr: 11.20, payment_status: 'PAID' },
                            { txn_reference: 'TXN-2026-092', voucher_number: 'VCH-OTY-2026-15', package_name: 'PKG-EPC-01', contractor_name: 'KCP Infra Fictional Ltd', bill_date: '2026-02-15', bill_amount_cr: 9.80, approved_amount_cr: 0.00, paid_amount_cr: 0.00, payment_status: 'WITHHELD_AI_FLAG' },
                            { txn_reference: 'TXN-2026-074', voucher_number: 'VCH-OTY-2025-88', package_name: 'PKG-EPC-02', contractor_name: 'Southern Highway Builders Ltd', bill_date: '2025-12-10', bill_amount_cr: 8.40, approved_amount_cr: 8.40, paid_amount_cr: 8.40, payment_status: 'PAID' }
                          ]).map((txn: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-2.5">
                                <span className="font-mono font-bold text-indigo-700 block">{txn.voucher_number}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{txn.txn_reference}</span>
                              </td>
                              <td className="p-2.5 text-slate-800 font-medium">{txn.package_name}</td>
                              <td className="p-2.5 text-slate-700">{txn.contractor_name}</td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-500">{txn.bill_date}</td>
                              <td className="p-2.5 font-mono font-bold text-slate-800">₹{txn.bill_amount_cr?.toFixed(2)} Cr</td>
                              <td className="p-2.5 font-mono text-slate-800">₹{txn.approved_amount_cr?.toFixed(2)} Cr</td>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">₹{txn.paid_amount_cr?.toFixed(2)} Cr</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  txn.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                  txn.payment_status === 'WITHHELD_AI_FLAG' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {txn.payment_status?.replace('_', ' ')}
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

              {/* TAB 8: QUALITY */}
              {activeTab === 'quality' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Engineering Quality & Non-Conformance Reports (NCR)</h4>
                      <p className="text-xs text-slate-500">Quality inspection logs, core tests, compaction tests and contractor rectification status.</p>
                    </div>
                    <button
                      onClick={() => setShowQualityModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" /> Log Observation
                    </button>
                  </div>

                  {/* Summary KPI Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-medium block">Total Inspections</span>
                      <span className="text-base font-bold text-slate-900">34 Tests Conducted</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Highways Research Station</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <span className="text-[11px] text-red-700 font-medium block">Critical Open Defects</span>
                      <span className="text-base font-bold text-red-900">{selectedProject.engineering_quality?.critical_unresolved || 2} Open NCRs</span>
                      <span className="text-[10px] text-red-600 block mt-0.5">Bitumen & Subgrade</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <span className="text-[11px] text-emerald-700 font-medium block">Rectified & Cleared</span>
                      <span className="text-base font-bold text-emerald-900">32 Observations</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">94% Quality Conformance</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-medium block">Financial Withholding</span>
                      <span className="text-base font-bold text-slate-900 font-mono">₹0.30 Cr</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Under Contract Clause 46</span>
                    </div>
                  </div>

                  {/* Defects Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">NCR Ref</th>
                          <th className="p-3">Component</th>
                          <th className="p-3">Observation Details</th>
                          <th className="p-3">Severity</th>
                          <th className="p-3">Penalty / Withheld</th>
                          <th className="p-3">Rectification Target</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.engineering_quality?.records?.length ? selectedProject.engineering_quality.records : [
                          {
                            defect_reference: 'NCR-2025-041',
                            component_type: 'Bituminous Concrete (BC)',
                            description: 'Binder content in surface course between Km 14+000 and 15+500 sampled at 4.6% vs specification of 5.2%. Lab test failed Marshall stability.',
                            severity: 'CRITICAL',
                            financial_penalty_cr: 0.20,
                            rectification_deadline: '2026-03-15',
                            status: 'OPEN'
                          },
                          {
                            defect_reference: 'NCR-2025-042',
                            component_type: 'Subgrade & Embankment',
                            description: 'Dry density compaction between Km 21+200 and 22+000 tested at 93.8% MDD (standard requirement >=97%). Re-rolling required.',
                            severity: 'CRITICAL',
                            financial_penalty_cr: 0.10,
                            rectification_deadline: '2026-03-10',
                            status: 'OPEN'
                          }
                        ]).map((rec: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-red-700">{rec.defect_reference}</td>
                            <td className="p-3 font-semibold text-slate-800">{rec.component_type}</td>
                            <td className="p-3 text-slate-700 max-w-sm">{rec.description}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                rec.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {rec.severity}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-red-700">₹{rec.financial_penalty_cr?.toFixed(2) || '0.00'} Cr</td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{rec.rectification_deadline || '15 Mar 2026'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                rec.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 9: FIELD OPERATIONS */}
              {activeTab === 'field_ops' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Field Inspections & Geo-Tagged Progress</h4>
                      <p className="text-xs text-slate-500">Site engineer visit reports, drone audit records, contractor presence and photo verification.</p>
                    </div>
                    <button
                      onClick={() => navigate('/field-ops')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Field Operations Module <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedProject.field_operations?.inspections?.length ? selectedProject.field_operations.inspections : [
                      {
                        inspection_id: 'INSP-OTY-2026-088',
                        date: '2026-02-04',
                        officer_name: 'Thiru R. Venkatesh, AEE',
                        site_location: 'Km 14+200 to 18+000 (Pykara stretch)',
                        package_name: 'PKG-EPC-01',
                        work_activity: 'Wet Mix Macadam (WMM) Base Layer Compaction',
                        progress_reported_pct: 68.0,
                        progress_verified_pct: 54.0,
                        verified_by_geo_tag: true,
                        has_photo_evidence: true,
                        findings: 'Subgrade level correct. Contractor operating 2 vibratory rollers. Compaction sample dispatched to HRS Coimbatore.',
                        follow_up_action: 'Await lab test report before bituminous prime coat clearance.'
                      },
                      {
                        inspection_id: 'INSP-OTY-2026-079',
                        date: '2026-01-22',
                        officer_name: 'Tmt M. Kalaiselvi, DE (Highways)',
                        site_location: 'Km 4+800 Minor Bridge Abutment #1',
                        package_name: 'PKG-EPC-01',
                        work_activity: 'RCC Pier Cap Reinforcement & Concrete Pouring',
                        progress_reported_pct: 75.0,
                        progress_verified_pct: 75.0,
                        verified_by_geo_tag: true,
                        has_photo_evidence: true,
                        findings: 'Rebar placement verified as per drawing #CKICP/BR/44. Concrete cube strength test at 7 days satisfied 28 N/mm².',
                        follow_up_action: 'Proceed with girder pre-stressing preparation.'
                      }
                    ]).map((insp: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-mono font-bold text-indigo-700 text-xs">{insp.inspection_id}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{insp.date}</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-slate-800">{insp.site_location}</div>
                          <div className="text-indigo-700 font-medium text-[11px]">{insp.work_activity}</div>
                          <div className="text-slate-500 text-[11px]">Inspector: <strong>{insp.officer_name}</strong></div>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>Contractor Claimed: <strong>{insp.progress_reported_pct}%</strong></span>
                            <span className="text-emerald-700 font-bold">Verified on Site: {insp.progress_verified_pct}%</span>
                          </div>
                          <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-100">{insp.findings}</p>
                          <div className="text-amber-800 font-medium text-[10px] pt-1">
                            Action: {insp.follow_up_action}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Geo-Tag Verified (11.4124° N, 76.6958° E)
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Camera className="w-3.5 h-3.5" /> 4 Photos Attached
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: LEGAL & COMPLIANCE */}
              {activeTab === 'legal' && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">Legal Proceedings & Statutory Stay Orders</h4>
                    <p className="text-xs text-slate-500">Synthetic judicial cases, civil court suits, writ petitions and project stay injunctions.</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Case Reference</th>
                          <th className="p-3">Court / Tribunal</th>
                          <th className="p-3">Parties Involved</th>
                          <th className="p-3">Subject Matter</th>
                          <th className="p-3">Interim Order</th>
                          <th className="p-3">Exposure</th>
                          <th className="p-3">Next Hearing</th>
                          <th className="p-3">Responsible Legal Officer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.legal_cases?.items?.length ? selectedProject.legal_cases.items : [
                          {
                            case_number: 'OS 114/2025',
                            court_name: 'Sub-Court, Ooty',
                            petitioner: 'M/s Glenrock Tea Estates Fictional Ltd',
                            respondent: 'Government of Tamil Nadu rep. by DRO Nilgiris & SE Highways',
                            subject_matter: 'Dispute over land valuation & tree compensation in Survey 142/1A (Km 18+200)',
                            interim_order: 'Interim Status Quo on road expansion within estate boundary',
                            financial_exposure_cr: 2.40,
                            next_hearing_date: '2026-03-24',
                            responsible_officer: 'Special Government Pleader (Highways)'
                          },
                          {
                            case_number: 'WP(MD) 8841/2024',
                            court_name: 'High Court of Madras (Madurai Bench)',
                            petitioner: 'Green Nilgiris Eco Foundation (Synthetic)',
                            respondent: 'Highways Dept & Forest Department',
                            subject_matter: 'PIL seeking wildlife underpass provision at Km 28+400',
                            interim_order: 'Direction to submit Chief Wildlife Warden concurrence report',
                            financial_exposure_cr: 1.20,
                            next_hearing_date: '2026-04-12',
                            responsible_officer: 'Government Counsel, High Court'
                          }
                        ]).map((leg: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-red-700">{leg.case_number}</td>
                            <td className="p-3 font-semibold text-slate-800">{leg.court_name}</td>
                            <td className="p-3 text-slate-700 max-w-xs">
                              <div><strong>Pet:</strong> {leg.petitioner}</div>
                              <div className="text-slate-500 text-[11px]"><strong>Resp:</strong> {leg.respondent}</div>
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs">{leg.subject_matter}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                                {leg.interim_order}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900">₹{leg.financial_exposure_cr?.toFixed(2) || '0.00'} Cr</td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{leg.next_hearing_date}</td>
                            <td className="p-3 text-slate-700">{leg.responsible_officer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 11: ASSETS */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Highway Infrastructure Assets Register</h4>
                      <p className="text-xs text-slate-500">Pavement stretches, major/minor bridges, culverts, retaining walls and drain systems.</p>
                    </div>
                    <button
                      onClick={() => navigate('/assets')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Asset Management Workspace <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Asset Type</th>
                          <th className="p-3">Asset Name & Chainage</th>
                          <th className="p-3">Condition Index</th>
                          <th className="p-3">Last Inspection</th>
                          <th className="p-3">Maintenance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.assets?.items?.length ? selectedProject.assets.items : [
                          { asset_id: 'AST-BR-01', asset_type: 'High-Level Bridge', name: 'Pykara Tributary Bridge (2x24m Spans)', location: 'Km 14+800', condition: 'Good (PCI 88)', last_inspection: '2026-01-15', maintenance_status: 'Under Construction' },
                          { asset_id: 'AST-CLV-08', asset_type: 'Box Culvert (2x2m)', name: 'Cross Drainage Culvert #8', location: 'Km 6+240', condition: 'Excellent (PCI 94)', last_inspection: '2025-11-20', maintenance_status: 'Completed / Operational' },
                          { asset_id: 'AST-RW-04', asset_type: 'Reinforced Retaining Wall', name: 'Crib-type Slope Support Wall', location: 'Km 24+100', condition: 'Fair (PCI 72)', last_inspection: '2026-02-01', maintenance_status: 'Monitoring Settlement' },
                          { asset_id: 'AST-PVM-01', asset_type: 'Bituminous Pavement', name: 'Flexible Pavement Section 1', location: 'Km 0/0 to 14/0', condition: 'Good (PCI 82)', last_inspection: '2026-01-28', maintenance_status: 'WMM Base Stage' }
                        ]).map((ast: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-indigo-700">{ast.asset_id}</td>
                            <td className="p-3 font-semibold text-slate-800">{ast.asset_type}</td>
                            <td className="p-3 text-slate-700">{ast.name} <span className="text-slate-400 font-mono text-[11px]">({ast.location})</span></td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                {ast.condition}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{ast.last_inspection}</td>
                            <td className="p-3 text-slate-600">{ast.maintenance_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 12: CITIZEN GRIEVANCES */}
              {activeTab === 'grievances' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Citizen Grievances & CM Helpline Petitions</h4>
                      <p className="text-xs text-slate-500">Public complaints regarding road conditions, construction diversions, dust pollution and safety.</p>
                    </div>
                    <button
                      onClick={() => navigate('/citizen-services')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Citizen Portal <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Grievance Ref</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Date Received</th>
                          <th className="p-3">Complaint Details</th>
                          <th className="p-3">Assigned Officer</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Target Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProject.citizen_grievances?.items?.length ? selectedProject.citizen_grievances.items : [
                          { grievance_id: 'GRV-2026-102', category: 'Construction Disruption', location: 'Naduvattam Market Junction', date_received: '2026-01-28', resolution_details: 'Unregulated excavation caused morning school bus gridlock. Contractor instructed to post marshals and grade bypass lane.', assigned_officer: 'AEE Gudalur Sub-Division', status: 'RESOLVED', resolution_target: '2026-02-02' },
                          { grievance_id: 'GRV-2026-144', category: 'Dust Pollution', location: 'Pykara Settlement (Km 16+400)', date_received: '2026-02-03', resolution_details: 'Residents reported excessive dust from dry aggregate hauling. Water sprinkling frequency doubled from 2 to 4 runs/day.', assigned_officer: 'AE Highways C&M', status: 'UNDER_INVESTIGATION', resolution_target: '2026-02-15' }
                        ]).map((grv: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-indigo-700">{grv.grievance_id}</td>
                            <td className="p-3 font-semibold text-slate-800">{grv.category}</td>
                            <td className="p-3 text-slate-700">{grv.location}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">{grv.date_received}</td>
                            <td className="p-3 text-slate-600 max-w-sm">{grv.resolution_details}</td>
                            <td className="p-3 text-slate-700">{grv.assigned_officer}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                grv.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {grv.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{grv.resolution_target}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 13: AI FINDINGS */}
              {activeTab === 'ai_findings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">AI Leakage & Anomaly Findings</h4>
                      <p className="text-xs text-slate-500">Integration with AI Revenue Leakage Engine (`#/leakage`). Direct verification against ground evidence.</p>
                    </div>
                    <button
                      onClick={() => navigate('/leakage')}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Full Leakage Workspace <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(selectedProject.ai_findings?.length ? selectedProject.ai_findings : [
                      {
                        anomaly_code: 'ANM-2026-003',
                        finding_code: 'ANM-2026-003',
                        title: 'Quantity Inflation: Hard Rock Excavation Mismatch vs Geological Baseline',
                        finding_title: 'Quantity Inflation: Hard Rock Excavation Mismatch vs Geological Baseline',
                        category: 'QUANTITY_DISCREPANCY',
                        severity: 'CRITICAL',
                        risk_score: 94,
                        confidence_score: 0.94,
                        potential_exposure_cr: 9.80,
                        amount_flagged_cr: 9.80,
                        review_status: 'UNDER_INVESTIGATION',
                        explanation: 'Contractor claimed 148,000 m³ hard rock excavation at ₹980/m³ (₹14.50 Cr) on Package EPC-01 between Km 8+400 and 14+200. Geological baseline and initial bore logs indicated only 42,000 m³ hard rock. Discrepancy of 106,000 m³ represents potential financial exposure of ₹9.80 Cr without requisite joint inspection evidence.',
                        rule_broken: 'IRC:SP:73-2018 Clause 3.4 & TN Highways Manual Vol II Para 142 (Rock Classification Protocol)'
                      }
                    ]).map((f: any, idx: number) => (
                      <div key={idx} className="bg-red-50/60 border border-red-200 rounded-xl p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/60 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm bg-red-700 text-white px-2.5 py-0.5 rounded">
                              {f.anomaly_code || f.finding_code || 'ANM-2026-003'}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800 uppercase">
                              {f.severity} SEVERITY
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              Confidence: {Math.round((f.confidence_score || 0.94) * 100)}%
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">Flagged Exposure:</span>
                            <span className="text-lg font-bold font-mono text-red-700">
                              ₹{(f.potential_exposure_cr || f.amount_flagged_cr || 9.80).toFixed(2)} Cr
                            </span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{f.title || f.finding_title}</h5>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{f.explanation || f.description}</p>
                          <div className="mt-2 text-[11px] text-red-900 font-medium bg-white/80 p-2 rounded border border-red-100">
                            <strong>Statutory Rule / Code:</strong> {f.rule_broken || 'IRC:SP:73-2018 Clause 3.4 & TN Highways Manual'}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
                          <span className="text-xs font-semibold text-slate-600">
                            Status: <strong className="uppercase text-amber-800">{f.review_status?.replace('_', ' ')}</strong>
                          </span>
                          <button
                            onClick={() => navigate(`/leakage?code=${f.anomaly_code || f.finding_code || 'ANM-2026-003'}`)}
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Verify in Leakage Module & Audit Trail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 14: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Project Document Repository</h4>
                      <p className="text-xs text-slate-500">Official government orders, technical sanction drawings, contract agreements and lab test certificates.</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {selectedProject.documents?.length || 6} Official Records
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(selectedProject.documents?.length ? selectedProject.documents : [
                      { id: 1, document_title: 'Administrative Sanction GO (Ms) No. 142', file_name: 'GO_Ms_142_HW_2023.pdf', mime_type: 'application/pdf', file_size_bytes: 1420000, is_verified: true, created_at: '2023-08-18' },
                      { id: 2, document_title: 'Technical Sanction & Geometric Alignment Drawings', file_name: 'TS_CKICP_44_Drawings.dwg.pdf', mime_type: 'application/pdf', file_size_bytes: 18500000, is_verified: true, created_at: '2023-10-12' },
                      { id: 3, document_title: 'EPC Agreement with KCP Infra Fictional Ltd', file_name: 'Contract_Agreement_EPC01.pdf', mime_type: 'application/pdf', file_size_bytes: 8400000, is_verified: true, created_at: '2024-02-15' },
                      { id: 4, document_title: 'Land Acquisition Section 15(2) Gazette Notice', file_name: 'Gazette_Sec15_2_Nilgiris.pdf', mime_type: 'application/pdf', file_size_bytes: 750000, is_verified: true, created_at: '2024-03-10' },
                      { id: 5, document_title: 'Highways Research Station Core Sample Audit #4', file_name: 'HRS_Lab_Test_Audit_04.pdf', mime_type: 'application/pdf', file_size_bytes: 3200000, is_verified: true, created_at: '2026-01-20' },
                      { id: 6, document_title: 'Interim Court Injunction Order OS 114/2025', file_name: 'SubCourt_Ooty_OS114_Stay.pdf', mime_type: 'application/pdf', file_size_bytes: 1100000, is_verified: true, created_at: '2025-11-14' }
                    ]).map((doc: any) => (
                      <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] text-slate-400">DOC-{doc.id}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                              Verified
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{doc.document_title}</h5>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.file_name}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(1)} MB • {doc.created_at}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setSelectedDocPreview(doc)}
                              className="p-1 hover:text-indigo-600 rounded transition"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => showToast(`Simulated download of ${doc.file_name}`, 'info')}
                              className="p-1 hover:text-indigo-600 rounded transition"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 15: ACTIONS & STATUTORY AUDIT HISTORY */}
              {activeTab === 'actions_history' && (
                <div className="space-y-6">
                  {/* Action Directives Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Project Action Directives Register</h4>
                        <p className="text-xs text-slate-500">Track and dispatch time-bound statutory directives issued to departments and field officers.</p>
                      </div>
                      <button
                        onClick={() => setShowActionModal(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Plus className="w-4 h-4" /> Assign New Directive
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Action Ref</th>
                            <th className="p-3">Directive / Issue</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Assigned Officer</th>
                            <th className="p-3">Priority</th>
                            <th className="p-3">Target Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(selectedProject.actions_register?.length ? selectedProject.actions_register : [
                            { action_id: 'ACT-4-01', issue: 'Convene District Revenue Taskforce for Section 19(1) declaration on 12 Naduvattam parcels', department: 'Revenue Department', assigned_officer: 'District Revenue Officer, Nilgiris', priority: 'CRITICAL', target_date: '2026-03-01', status: 'IN_PROGRESS' },
                            { action_id: 'ACT-4-02', issue: 'Schedule rolling 4-hour morning shutdowns for 48 TANGEDCO 11kV poles relocation', department: 'TANGEDCO', assigned_officer: 'SE TANGEDCO Nilgiris EDC', priority: 'HIGH', target_date: '2026-03-10', status: 'IN_PROGRESS' },
                            { action_id: 'ACT-4-03', issue: 'Withhold ₹9.80 Cr rock variation claim pending joint geological boring audit', department: 'CKICP Highways PIU', assigned_officer: 'Project Director / SE', priority: 'HIGH', target_date: '2026-02-28', status: 'COMPLETED' },
                            { action_id: 'ACT-4-04', issue: 'File counter-affidavit and vacate-stay petition in Sub-Court Ooty for OS 114/2025', department: 'Legal Cell', assigned_officer: 'Special Govt Pleader', priority: 'HIGH', target_date: '2026-03-15', status: 'IN_PROGRESS' }
                          ]).map((act: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-mono font-bold text-indigo-700">{act.action_id}</td>
                              <td className="p-3 font-medium text-slate-900 max-w-sm">{act.issue}</td>
                              <td className="p-3 text-slate-700">{act.department}</td>
                              <td className="p-3 text-slate-700">{act.assigned_officer}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  act.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {act.priority}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-600">{act.target_date}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  act.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {act.status?.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Statutory Audit Event Trail */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-600" /> Statutory Audit Event Trail
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 max-h-72 overflow-y-auto font-mono text-xs">
                      {(selectedProject.audit_history?.length ? selectedProject.audit_history : [
                        { created_at: '2026-02-05 16:45:10', event_type: 'AI_ANOMALY_TRIGGERED', actor_name: 'AI Revenue Engine', details: 'ANM-2026-003 quantity mismatch detected on RA Bill #14 (₹9.80 Cr).' },
                        { created_at: '2026-02-04 11:20:00', event_type: 'FIELD_INSPECTION_RECORDED', actor_name: 'Er. R. Venkatesh (AEE)', details: 'Inspection INSP-OTY-2026-088 logged with 4 geo-tagged photographs.' },
                        { created_at: '2026-01-20 14:10:22', event_type: 'PAYMENT_PROCESSED', actor_name: 'Pay & Accounts Officer (HW)', details: 'Payment voucher VCH-OTY-2026-14 released for ₹11.20 Cr.' },
                        { created_at: '2025-11-14 10:30:00', event_type: 'LEGAL_STAY_RECORDED', actor_name: 'Legal Assistant', details: 'Sub-Court Ooty OS 114/2025 status quo injunction entered into register.' },
                        { created_at: '2024-02-15 09:00:00', event_type: 'WORK_ORDER_ISSUED', actor_name: 'Chief Engineer (CKICP)', details: 'Agreement signed with KCP Infra Fictional Ltd for ₹84.50 Cr.' }
                      ]).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3 text-slate-700 border-b border-slate-200/60 pb-2">
                          <span className="text-slate-400 shrink-0 text-[11px]">{item.created_at}</span>
                          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded text-[10px] font-bold shrink-0">
                            {item.event_type}
                          </span>
                          <span className="text-indigo-700 font-semibold shrink-0 text-[11px]">{item.actor_name}:</span>
                          <span className="text-slate-600 text-[11px] flex-1">{item.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 16: UNIVERSAL CONNECTIVITY & ENTITY RELATIONSHIP WEB */}
              {activeTab === 'connectivity' && selectedProject && (
                <div className="space-y-4">
                  <ConnectedEntityPanel
                    entityType="PROJECT"
                    entityId={selectedProject.id || selectedProject.project?.id || 1}
                    entityTitle={selectedProject.title}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: ASSIGN ACTION DIRECTIVE */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Assign Executive Action Directive
              </h3>
              <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Directive / Issue Description *</label>
                <textarea
                  required
                  rows={3}
                  value={actionForm.issue}
                  onChange={(e) => setActionForm({ ...actionForm, issue: e.target.value })}
                  placeholder="Specify clear operational directive, e.g., 'Convene joint site inspection with TANGEDCO SE...'"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Department</label>
                  <select
                    value={actionForm.department}
                    onChange={(e) => setActionForm({ ...actionForm, department: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Highways Wing">Highways C&M</option>
                    <option value="CKICP Project Unit">CKICP PIU</option>
                    <option value="Revenue Department">Revenue Department</option>
                    <option value="TANGEDCO">TANGEDCO</option>
                    <option value="Forest Department">Forest Department</option>
                    <option value="Legal Cell">Legal Cell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={actionForm.priority}
                    onChange={(e) => setActionForm({ ...actionForm, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CRITICAL">Critical (Immediate)</option>
                    <option value="HIGH">High (Within 7 Days)</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    value={actionForm.assigned_officer}
                    onChange={(e) => setActionForm({ ...actionForm, assigned_officer: e.target.value })}
                    placeholder="e.g. Er. M. Kalaiselvi, DE"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={actionForm.target_date}
                    onChange={(e) => setActionForm({ ...actionForm, target_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-1.5 shadow"
                >
                  {actionSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Dispatch Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG QUALITY OBSERVATION */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Record Engineering Quality Observation
              </h3>
              <button onClick={() => setShowQualityModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitQuality} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Component / Structure *</label>
                <select
                  value={qualityForm.component_type}
                  onChange={(e) => setQualityForm({ ...qualityForm, component_type: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Bituminous Pavement">Bituminous Pavement (DBM / BC)</option>
                  <option value="Granular Sub-Base">Granular Sub-Base / WMM</option>
                  <option value="Bridge Structure">Bridge Pier / Abutment / Girder</option>
                  <option value="Culvert & Drainage">Cross Drainage Box Culvert</option>
                  <option value="Retaining Wall">Retaining / Breast Wall</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Observation & Test Discrepancy *</label>
                <textarea
                  required
                  rows={3}
                  value={qualityForm.description}
                  onChange={(e) => setQualityForm({ ...qualityForm, description: e.target.value })}
                  placeholder="Detail test results, core samples, density deficiency or structural crack observations..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Severity</label>
                  <select
                    value={qualityForm.severity}
                    onChange={(e) => setQualityForm({ ...qualityForm, severity: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CRITICAL">Critical (Non-conformance NCR)</option>
                    <option value="MEDIUM">Medium (Requires Re-testing)</option>
                    <option value="LOW">Low (Rectification at DLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Penalty / Withheld (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={qualityForm.financial_penalty_cr}
                    onChange={(e) => setQualityForm({ ...qualityForm, financial_penalty_cr: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Responsible Engineer</label>
                  <input
                    type="text"
                    value={qualityForm.responsible_engineer}
                    onChange={(e) => setQualityForm({ ...qualityForm, responsible_engineer: e.target.value })}
                    placeholder="e.g. Er. K. Balaji, QA Lead"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rectification Deadline</label>
                  <input
                    type="date"
                    value={qualityForm.rectification_deadline}
                    onChange={(e) => setQualityForm({ ...qualityForm, rectification_deadline: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQualityModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qualitySubmitting}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black font-semibold flex items-center gap-1.5 shadow"
                >
                  {qualitySubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  Log Quality Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT PREVIEW */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold truncate max-w-md">{selectedDocPreview.document_title}</h3>
              </div>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>File Name:</span>
                  <strong className="text-slate-800 font-mono">{selectedDocPreview.file_name}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>File Size:</span>
                  <strong className="text-slate-800">{(selectedDocPreview.file_size_bytes / 1024 / 1024).toFixed(2)} MB</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Registered Timestamp:</span>
                  <strong className="text-slate-800">{selectedDocPreview.created_at}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cryptographic Integrity:</span>
                  <span className="text-emerald-700 font-mono font-bold">SHA-256 Verified</span>
                </div>
              </div>

              <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                <FileCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Simulated Official Document Preview</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  In production, this displays the secure inline PDF viewer with digital signatures from Tamil Nadu e-Governance (TNeGA).
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(`Simulated download of ${selectedDocPreview.file_name}`, 'info');
                    setSelectedDocPreview(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Official Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
