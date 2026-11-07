import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DepartmentOverviewData,
  DepartmentDirectoryItem,
  DepartmentCoordinationDependencyItem,
  DepartmentApprovalItem,
  DepartmentAIFindingItem,
  ProjectItem
} from '../types';
import {
  Building2,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  UserCheck,
  FileCheck2,
  FileText,
  SlidersHorizontal,
  X,
  Send,
  AlertOctagon,
  ChevronRight,
  Info,
  Calendar,
  Zap,
  CheckSquare
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'dependencies' | 'approvals' | 'matrix'>('directory');

  const [overviewData, setOverviewData] = useState<DepartmentOverviewData | null>(null);
  const [departments, setDepartments] = useState<DepartmentDirectoryItem[]>([]);
  const [dependencies, setDependencies] = useState<DepartmentCoordinationDependencyItem[]>([]);
  const [approvals, setApprovals] = useState<DepartmentApprovalItem[]>([]);
  const [aiFindings, setAiFindings] = useState<DepartmentAIFindingItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');
  const [selectedSlaStatus, setSelectedSlaStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<DepartmentDirectoryItem | null>(null);
  const [selectedDepForAction, setSelectedDepForAction] = useState<DepartmentCoordinationDependencyItem | null>(null);
  const [selectedApprovalForAction, setSelectedApprovalForAction] = useState<DepartmentApprovalItem | null>(null);

  // Form states for Dependency Action Modal
  const [depActionStatus, setDepActionStatus] = useState<string>('RESOLVED');
  const [depActionEscalation, setDepActionEscalation] = useState<string>('NONE');
  const [depActionRemarks, setDepActionRemarks] = useState<string>('');
  const [depActionDocRef, setDepActionDocRef] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [actionErrorMsg, setActionErrorMsg] = useState<string>('');

  // Form states for Approval Action Modal
  const [appActionDecision, setAppActionDecision] = useState<string>('APPROVED');
  const [appActionRemarks, setAppActionRemarks] = useState<string>('');
  const [appActionDocRef, setAppActionDocRef] = useState<string>('');

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const pId = selectedProjectId !== 'ALL' ? Number(selectedProjectId) : undefined;
      const [ov, depts, deps, apps, ai, prjs] = await Promise.all([
        api.getDepartmentOverview(pId),
        api.getDepartmentDirectory(selectedCategory !== 'ALL' ? selectedCategory : undefined, searchQuery || undefined),
        api.getDepartmentDependencies({
          project_id: pId,
          criticality: selectedCriticality !== 'ALL' ? selectedCriticality : undefined,
          search: searchQuery || undefined
        }),
        api.getDepartmentApprovals({
          project_id: pId,
          sla_status: selectedSlaStatus !== 'ALL' ? selectedSlaStatus : undefined,
          search: searchQuery || undefined
        }),
        api.getDepartmentAIIntelligence(pId),
        api.getProjects()
      ]);

      setOverviewData(ov);
      setDepartments(depts);
      setDependencies(deps);
      setApprovals(apps);
      setAiFindings(ai.items || []);
      setProjects(prjs);
    } catch (err) {
      console.error('Failed to load Departmental Coordination data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, selectedCategory, selectedCriticality, selectedSlaStatus]);

  // Handle Dependency Action Submit
  const handleDependencyActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepForAction) return;

    setActionSubmitting(true);
    setActionErrorMsg('');
    setActionSuccessMsg('');

    try {
      await api.updateDepartmentDependencyAction(selectedDepForAction.id, {
        action: 'UPDATE_STATUS',
        new_status: depActionStatus,
        new_escalation_level: depActionEscalation,
        officer_remarks: depActionRemarks,
        supporting_document_ref: depActionDocRef
      });
      setActionSuccessMsg('Dependency status and escalation updated successfully.');
      setTimeout(() => {
        setSelectedDepForAction(null);
        setActionSuccessMsg('');
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to update dependency.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Handle Approval Action Submit
  const handleApprovalActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprovalForAction) return;

    setActionSubmitting(true);
    setActionErrorMsg('');
    setActionSuccessMsg('');

    try {
      await api.updateDepartmentApprovalAction(selectedApprovalForAction.id, {
        decision: appActionDecision,
        review_remarks: appActionRemarks,
        document_reference: appActionDocRef
      });
      setActionSuccessMsg('Statutory approval decision recorded in audit log.');
      setTimeout(() => {
        setSelectedApprovalForAction(null);
        setActionSuccessMsg('');
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to record approval decision.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filtered Dependencies
  const filteredDependencies = useMemo(() => {
    return dependencies.filter((d) => {
      if (selectedCriticality !== 'ALL' && d.criticality !== selectedCriticality) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.dependency_code.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.target_department_name.toLowerCase().includes(q) ||
          d.project_title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dependencies, selectedCriticality, searchQuery]);

  // Filtered Approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      if (selectedSlaStatus !== 'ALL' && a.sla_status !== selectedSlaStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.approval_code.toLowerCase().includes(q) ||
          a.approval_type.toLowerCase().includes(q) ||
          a.approving_department_name.toLowerCase().includes(q) ||
          a.project_title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [approvals, selectedSlaStatus, searchQuery]);

  const kpis = overviewData?.kpis;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Executive Metadata */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Departmental Coordination & Statutory Clearances
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Interdepartmental dependency tracking, multi-agency statutory approvals, SLA compliance and executive bottleneck intelligence.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              DEMO DATA (SYNTHETIC)
            </span>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Projects (12)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} - {p.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="State Highways">State Highways</option>
              <option value="Land & Revenue">Land & Revenue</option>
              <option value="Power & Utilities">Power & Utilities</option>
              <option value="Water Resources">Water Resources</option>
              <option value="Forest & Environment">Forest & Environment</option>
              <option value="Railways & Central">Railways & Central</option>
              <option value="Urban & Local Bodies">Urban & Local Bodies</option>
              <option value="Public Safety & Traffic">Public Safety & Traffic</option>
              <option value="Telecommunications">Telecommunications</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Dependency Criticality</label>
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Criticalities</option>
              <option value="CRITICAL">Critical (Blocks Milestones)</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Approval SLA Status</label>
            <select
              value={selectedSlaStatus}
              onChange={(e) => setSelectedSlaStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All SLA Statuses</option>
              <option value="ON_TRACK">On Track</option>
              <option value="OVERDUE">Overdue (Past SLA)</option>
              <option value="ESCALATED">Escalated to Leadership</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search dept, code, officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. 8 Executive Overview KPI Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Departments</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis?.total_participating_departments ?? 10}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">10 Active Entities</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dependencies</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{kpis?.active_interdepartmental_dependencies ?? 28}</div>
          <div className="text-[11px] text-blue-500 mt-0.5">Active In-flight</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{kpis?.pending_approvals ?? 40}</div>
          <div className="text-[11px] text-amber-500 mt-0.5">Under Review</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overdue Approvals</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{kpis?.overdue_approvals ?? 14}</div>
          <div className="text-[11px] text-rose-500 mt-0.5">Exceeded SLA</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Turnaround</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis?.average_approval_turnaround_days ?? 38} d</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Standard: 21 Days</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-rose-500">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Blockers</div>
          <div className="text-xl font-bold text-rose-700 mt-1">{kpis?.critical_project_blockers ?? 8}</div>
          <div className="text-[11px] text-rose-500 mt-0.5">Halt Milestones</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Actions</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{kpis?.department_wise_pending_actions ?? 32}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Field Tasks</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-purple-500">
          <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Escalations</div>
          <div className="text-xl font-bold text-purple-700 mt-1">{kpis?.leadership_escalations ?? 12}</div>
          <div className="text-[11px] text-purple-500 mt-0.5">Secretary / Minister</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AI Cross-Departmental Bottleneck Intelligence */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-700/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                AI Cross-Departmental Bottleneck Intelligence & Deadlock Detector
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Machine learning analysis of statutory approval latency, multi-agency interlocks, and critical path milestone impediments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-800/80 text-indigo-200 border border-indigo-700 rounded-md text-xs font-mono">
              15 Active Algorithmic Findings
            </span>
          </div>
        </div>

        {/* AI Findings Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {aiFindings.slice(0, 3).map((f) => (
            <div
              key={f.id}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex flex-col justify-between hover:bg-white/15 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                    {f.finding_code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      f.severity === 'CRITICAL'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {f.severity} IMPACT
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">{f.problem_statement}</p>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Delay Impact:</span>
                  <span className="font-semibold text-rose-300">+{f.delay_impact_days} Days</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Financial Exposure:</span>
                  <span className="font-semibold text-amber-300">₹{f.cost_impact_cr.toFixed(2)} Cr</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Departments Involved:</span>
                  <span className="font-mono text-blue-200">{f.participating_departments.join(' ↔ ')}</span>
                </div>
                {f.escalation_required && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-purple-300 font-semibold text-[10px] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" /> Escalation: {f.escalation_target}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('dependencies');
                        setSearchQuery(f.finding_code.replace('DAIF-', 'DEP-'));
                      }}
                      className="text-xs text-blue-300 hover:text-white underline font-medium flex items-center gap-0.5"
                    >
                      View Linked Dependency <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Tab Navigation */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Connected Department Directory ({departments.length})
          </button>

          <button
            onClick={() => setActiveTab('dependencies')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'dependencies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            Interdepartmental Dependency Register ({dependencies.length})
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'approvals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Approval Workflow & SLA Tracker ({approvals.length})
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Bottleneck Flow Matrix
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Tab Content */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* TAB 1: Department Directory */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 mb-1.5">
                        {dept.code} • {dept.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h3>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        dept.is_external
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {dept.is_external ? 'External Line Agency' : 'Executing Dept'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 mb-3 line-clamp-2">
                    <strong className="text-slate-700">Jurisdiction:</strong> {dept.jurisdiction || 'Statewide Highway Works'}
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs mb-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">{dept.nodal_officer_name || 'Designated Nodal Officer'}</span>
                      <span className="text-slate-500">({dept.nodal_officer_designation || 'Special Officer'})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                      {dept.nodal_officer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {dept.nodal_officer_phone}
                        </span>
                      )}
                      {dept.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {dept.contact_email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <div className="text-[11px] text-slate-500">
                      <strong>Responsible Minister:</strong> {dept.responsible_minister || 'Hon. Minister'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <strong>Secretary:</strong> {dept.responsible_secretary || 'Principal Secretary'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="font-semibold text-blue-700">
                      {dept.active_dependencies_count} Active Dependencies
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-amber-600">
                      {dept.pending_approvals_count} Pending Approvals
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">SLA: {dept.sla_standard_days}d</span>
                  </div>

                  <button
                    onClick={() => setSelectedDeptForDetail(dept)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Interdepartmental Dependency Register */}
        {activeTab === 'dependencies' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Interdepartmental Dependency Register ({filteredDependencies.length} Records)
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Showing dependencies across 10 statutory line agencies
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Code & Criticality</th>
                    <th className="py-3 px-3">Project & Package</th>
                    <th className="py-3 px-3">Interacting Departments</th>
                    <th className="py-3 px-4">Dependency Type & Description</th>
                    <th className="py-3 px-3">Days Pending / SLA</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Escalation</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredDependencies.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No dependencies found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDependencies.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-blue-700">{d.dependency_code}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.criticality === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : d.criticality === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {d.criticality}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{d.project_code}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{d.project_title}</div>
                          {d.package_name && (
                            <div className="text-[10px] text-blue-600 font-mono mt-0.5">{d.package_name}</div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono">
                              {d.requesting_department_code}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                              {d.target_department_code}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]">
                            {d.target_department_name}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900">{d.dependency_type}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                            {d.description}
                          </div>
                          {d.downstream_blocker_milestone && (
                            <div className="text-rose-700 text-[10px] font-medium mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0 text-rose-500" />
                              Blocks: {d.downstream_blocker_milestone}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div
                            className={`font-bold ${
                              d.days_pending > d.sla_days ? 'text-rose-600 font-mono' : 'text-slate-800 font-mono'
                            }`}
                          >
                            {d.days_pending} Days
                          </div>
                          <div className="text-[10px] text-slate-400">SLA: {d.sla_days} Days</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              d.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'BLOCKED'
                                ? 'bg-rose-100 text-rose-800'
                                : d.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {d.escalation_level !== 'NONE' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <Zap className="w-3 h-3 text-purple-600" />
                              {d.escalation_level}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Routine</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedDepForAction(d);
                              setDepActionStatus(d.status);
                              setDepActionEscalation(d.escalation_level);
                              setDepActionRemarks('');
                              setDepActionDocRef(d.supporting_document_ref || '');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            Action
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Approval Workflow & SLA Tracker */}
        {activeTab === 'approvals' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Statutory Clearances & Approval SLA Tracker ({filteredApprovals.length} Records)
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Mandatory legal clearances under Central & State statutory acts
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Ref & Statutory Flag</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3">Approving Agency</th>
                    <th className="py-3 px-4">Approval Type & Remarks</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3">SLA Status & Overdue</th>
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-3 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No approvals found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApprovals.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">{a.approval_code}</div>
                          {a.is_statutory && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              STATUTORY MANDATE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{a.project_code}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{a.project_title}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 font-mono">{a.approving_department_code}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {a.approving_department_name}
                          </div>
                          {a.assigned_officer && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Assigned: {a.assigned_officer}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900">{a.approval_type}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                            {a.review_remarks || 'Clearance application under departmental technical scrutiny.'}
                          </div>
                          {a.document_ref && (
                            <div className="text-[10px] text-blue-600 font-mono mt-0.5 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {a.document_ref}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {a.submission_date}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.sla_status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : a.sla_status === 'ESCALATED'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : a.sla_status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {a.sla_status}
                          </span>
                          {a.overdue_days > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold mt-0.5">+{a.overdue_days}d Overdue</div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              a.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedApprovalForAction(a);
                              setAppActionDecision(a.status === 'APPROVED' ? 'APPROVED' : 'APPROVED');
                              setAppActionRemarks(a.review_remarks || '');
                              setAppActionDocRef(a.document_ref || '');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Bottleneck Flow Matrix */}
        {activeTab === 'matrix' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Agency Coordination Interlock Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mapping dependency flow from Highways Executing Wings to statutory external line departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Highways Wing</div>
                <div className="text-sm font-bold text-blue-900">Executing Highways & Minor Ports</div>
                <div className="text-xs text-slate-500 mt-1">Requesting Authority for Clearances</div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1">
                  <div><strong>Originating Dependencies:</strong> 28</div>
                  <div><strong>Packages Affected:</strong> 20</div>
                  <div><strong>Total Highway Value:</strong> ₹2,140 Cr</div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Primary Bottleneck 1</div>
                <div className="text-sm font-bold text-rose-900">Revenue & Disaster Management</div>
                <div className="text-xs text-rose-600 mt-1">Land Acquisition (Sec 15/19 Awards)</div>
                <div className="mt-4 pt-3 border-t border-rose-200 text-xs space-y-1 text-rose-800">
                  <div><strong>Pending Dependencies:</strong> 9</div>
                  <div><strong>Avg Turnaround:</strong> 52 Days</div>
                  <div><strong>Escalation Level:</strong> Secretary (Highways ↔ Revenue)</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Primary Bottleneck 2</div>
                <div className="text-sm font-bold text-amber-900">TANGEDCO (Electricity Board)</div>
                <div className="text-xs text-amber-700 mt-1">HT/LT Poles & Feeder Shutdown</div>
                <div className="mt-4 pt-3 border-t border-amber-200 text-xs space-y-1 text-amber-800">
                  <div><strong>Pending Dependencies:</strong> 8</div>
                  <div><strong>Avg Turnaround:</strong> 44 Days</div>
                  <div><strong>Critical Corridor:</strong> SH-15 Ooty-Gudalur (48 Poles)</div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Statutory Agency 3</div>
                <div className="text-sm font-bold text-indigo-900">Forest & Environment</div>
                <div className="text-xs text-indigo-700 mt-1">Stage-I/II Forest Land Diversion</div>
                <div className="mt-4 pt-3 border-t border-indigo-200 text-xs space-y-1 text-indigo-800">
                  <div><strong>Pending Dependencies:</strong> 4</div>
                  <div><strong>Avg Turnaround:</strong> 68 Days</div>
                  <div><strong>Statutory Act:</strong> Forest Conservation Act 1980</div>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Target Department</th>
                    <th className="py-2.5 px-3">Mandated SLA</th>
                    <th className="py-2.5 px-3">Active Dependencies</th>
                    <th className="py-2.5 px-3">Overdue Count</th>
                    <th className="py-2.5 px-3">Critical Blocker Impact</th>
                    <th className="py-2.5 px-3">Recommended Leadership Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Revenue and Disaster Management</td>
                    <td className="py-2.5 px-3 font-mono">45 Days</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">9</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600">5</td>
                    <td className="py-2.5 px-3 text-rose-700">Blocks Embankment on SH-15 Pykara & SH-49 ECR</td>
                    <td className="py-2.5 px-3 text-slate-700">Convene Chief Secretary Interdepartmental Committee</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">TANGEDCO (Power Distribution)</td>
                    <td className="py-2.5 px-3 font-mono">30 Days</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">8</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600">4</td>
                    <td className="py-2.5 px-3 text-rose-700">48 Poles on SH-15 Ghat Carriage Edge</td>
                    <td className="py-2.5 px-3 text-slate-700">Sanction Gudalur 66kV substation power shutdown</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Forest and Climate Change</td>
                    <td className="py-2.5 px-3 font-mono">60 Days</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">4</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">2</td>
                    <td className="py-2.5 px-3 text-amber-700">Reserve forest tree felling sanction on 2.4 km</td>
                    <td className="py-2.5 px-3 text-slate-700">PCCF Stage-I Working Permission issuance</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Southern Railway</td>
                    <td className="py-2.5 px-3 font-mono">45 Days</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">3</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">1</td>
                    <td className="py-2.5 px-3 text-slate-700">General Arrangement Drawing (GAD) approval for ROB</td>
                    <td className="py-2.5 px-3 text-slate-700">Joint GAD review with Chief Bridge Engineer, SR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL 1: Department Detail View */}
      {selectedDeptForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {selectedDeptForDetail.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedDeptForDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Category:</span>{' '}
                  <span className="font-semibold">{selectedDeptForDetail.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">Standard SLA:</span>{' '}
                  <span className="font-semibold">{selectedDeptForDetail.sla_standard_days} Days</span>
                </div>
                <div>
                  <span className="text-slate-500">Responsible Minister:</span>{' '}
                  <span className="font-semibold">{selectedDeptForDetail.responsible_minister}</span>
                </div>
                <div>
                  <span className="text-slate-500">Principal Secretary:</span>{' '}
                  <span className="font-semibold">{selectedDeptForDetail.responsible_secretary}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-900">Head of Department / Authority:</strong>
                <p className="text-slate-600 mt-0.5">{selectedDeptForDetail.head_of_department}</p>
              </div>

              <div>
                <strong className="text-slate-900">Designated Nodal Officer:</strong>
                <p className="text-slate-600 mt-0.5">
                  {selectedDeptForDetail.nodal_officer_name} ({selectedDeptForDetail.nodal_officer_designation})
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Phone: {selectedDeptForDetail.nodal_officer_phone} • Email: {selectedDeptForDetail.contact_email}
                </p>
              </div>

              <div>
                <strong className="text-slate-900">Statutory Jurisdiction:</strong>
                <p className="text-slate-600 mt-0.5">{selectedDeptForDetail.jurisdiction}</p>
              </div>

              <div>
                <strong className="text-slate-900">Associated Highway Projects ({selectedDeptForDetail.associated_projects?.length || 0}):</strong>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedDeptForDetail.associated_projects?.map((p) => (
                    <span key={p.id} className="px-2 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
                      {p.code} - {p.title.slice(0, 24)}...
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-slate-900">Key Statutory Responsibilities:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-600 mt-1">
                  {selectedDeptForDetail.key_responsibilities?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Dependency Action Modal */}
      {selectedDepForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {selectedDepForAction.dependency_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Update Interdepartmental Dependency</h3>
              </div>
              <button
                onClick={() => setSelectedDepForAction(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div><strong>Project:</strong> {selectedDepForAction.project_code} ({selectedDepForAction.project_title})</div>
              <div><strong>Target Dept:</strong> {selectedDepForAction.target_department_name} ({selectedDepForAction.target_department_code})</div>
              <div><strong>Type:</strong> {selectedDepForAction.dependency_type}</div>
              <div className="text-slate-600 mt-1 italic">{selectedDepForAction.description}</div>
            </div>

            {actionErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionErrorMsg}</span>
              </div>
            )}
            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleDependencyActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Update Status</label>
                <select
                  value={depActionStatus}
                  onChange={(e) => setDepActionStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">PENDING - Awaiting Action</option>
                  <option value="IN_PROGRESS">IN_PROGRESS - Work / Joint Inspection Active</option>
                  <option value="RESOLVED">RESOLVED - Clearance / Shifting Finalized</option>
                  <option value="BLOCKED">BLOCKED - Inter-Agency Dispute</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Escalation Level</label>
                <select
                  value={depActionEscalation}
                  onChange={(e) => setDepActionEscalation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">NONE - Routine Administrative Follow-up</option>
                  <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD - Chief Engineer / HOD Review</option>
                  <option value="SECRETARY">SECRETARY - Principal Secretary Interdepartmental Committee</option>
                  <option value="MINISTER">MINISTER - Hon. Minister Level Inter-Ministerial Review</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Officer Coordination Remarks</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record coordination meeting notes, inspection progress, or joint agreement..."
                  value={depActionRemarks}
                  onChange={(e) => setDepActionRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Supporting Document Reference</label>
                <input
                  type="text"
                  placeholder="e.g. HIGHWAYS-TANGEDCO-MOM-2026-08"
                  value={depActionDocRef}
                  onChange={(e) => setDepActionDocRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDepForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {actionSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Approval Action Modal */}
      {selectedApprovalForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                  {selectedApprovalForAction.approval_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Record Statutory Approval Decision</h3>
              </div>
              <button
                onClick={() => setSelectedApprovalForAction(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div><strong>Project:</strong> {selectedApprovalForAction.project_code}</div>
              <div><strong>Approval Type:</strong> {selectedApprovalForAction.approval_type}</div>
              <div><strong>Approving Authority:</strong> {selectedApprovalForAction.approving_department_name}</div>
              <div><strong>SLA Target:</strong> {selectedApprovalForAction.sla_target_days} Days (Status: {selectedApprovalForAction.sla_status})</div>
            </div>

            {actionErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionErrorMsg}</span>
              </div>
            )}
            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleApprovalActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Decision</label>
                <select
                  value={appActionDecision}
                  onChange={(e) => setAppActionDecision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="APPROVED">APPROVED - Statutory Clearance Granted</option>
                  <option value="REJECTED">REJECTED - Non-Compliant / Returned</option>
                  <option value="MORE_INFO_REQUESTED">MORE_INFO_REQUESTED - Clarifications Required</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Review Remarks / Authority Order</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record authority decision, statutory conditions, or grounds for rejection..."
                  value={appActionRemarks}
                  onChange={(e) => setAppActionRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Sanction / Government Order Ref</label>
                <input
                  type="text"
                  placeholder="e.g. GO-MS-312-REV-2026"
                  value={appActionDocRef}
                  onChange={(e) => setAppActionDocRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApprovalForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {actionSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
                  Record Statutory Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
