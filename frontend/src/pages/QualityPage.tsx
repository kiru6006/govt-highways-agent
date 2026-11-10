import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  QualitySummaryData,
  QualityInspectionItem,
  QualityFindingItem,
  MaterialTestItem,
  ContractorQualityScorecardItem,
  ProjectItem
} from '../types';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Beaker,
  CheckSquare,
  AlertOctagon,
  Info,
  Calendar,
  X,
  Send,
  Building,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const QualityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<QualitySummaryData | null>(null);
  const [inspections, setInspections] = useState<QualityInspectionItem[]>([]);
  const [defects, setDefects] = useState<QualityFindingItem[]>([]);
  const [materialTests, setMaterialTests] = useState<MaterialTestItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'inspections' | 'defects' | 'materials' | 'scorecard'>('inspections');

  // Filters
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedInspectionType, setSelectedInspectionType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyNCRs, setOnlyNCRs] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedInspection, setSelectedInspection] = useState<QualityInspectionItem | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<QualityFindingItem | null>(null);
  const [actionModalFinding, setActionModalFinding] = useState<QualityFindingItem | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [actionErrorMsg, setActionErrorMsg] = useState<string>('');

  // Action form state
  const [actionForm, setActionForm] = useState({
    contractor_response: '',
    corrective_action: '',
    target_closure_date: '',
    reinspection_date: '',
    reinspection_officer: '',
    reinspection_notes: '',
    status: 'CORRECTIVE_ACTION_PENDING'
  });

  // Load initial projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getProjects({});
        if (Array.isArray(res)) {
          setProjects(res);
        }
      } catch (e) {
        console.error('Failed to load projects list', e);
      }
    };
    fetchProjects();
  }, []);

  // Fetch all quality data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const projId = selectedProjectId !== 'ALL' ? Number(selectedProjectId) : undefined;

      const [summary, inspRes, defectRes, matRes] = await Promise.all([
        api.getQualitySummary(projId),
        api.getQualityInspections({
          project_id: projId,
          inspection_type: selectedInspectionType,
          severity: selectedSeverity,
          status: selectedStatus,
          search: searchQuery
        }),
        api.getQualityFindings({
          project_id: projId,
          is_ncr: onlyNCRs ? true : undefined,
          severity: selectedSeverity,
          status: selectedStatus,
          search: searchQuery
        }),
        api.getMaterialTests({
          project_id: projId,
          search: searchQuery
        })
      ]);

      setSummaryData(summary);
      setInspections(inspRes.items || []);
      setDefects(defectRes.items || []);
      setMaterialTests(matRes.items || []);
    } catch (err) {
      console.error('Error fetching quality data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, selectedSeverity, selectedStatus, selectedInspectionType, onlyNCRs]);

  // Handle open Action modal
  const handleOpenActionModal = (finding: QualityFindingItem) => {
    setActionModalFinding(finding);
    setActionForm({
      contractor_response: finding.contractor_response || '',
      corrective_action: finding.corrective_action || '',
      target_closure_date: finding.target_closure_date || '',
      reinspection_date: finding.reinspection_date || '',
      reinspection_officer: finding.reinspection_officer || (user ? user.full_name : ''),
      reinspection_notes: finding.reinspection_notes || '',
      status: finding.status || 'CORRECTIVE_ACTION_PENDING'
    });
    setActionSuccessMsg('');
    setActionErrorMsg('');
  };

  // Submit action / reinspection
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModalFinding) return;

    // RBAC Check: If user is contractor attempting to close finding
    if (user?.role_code === 'CONTRACTOR' && actionForm.status === 'VERIFIED_CLOSED') {
      setActionErrorMsg('RBAC Restriction: Contractor personnel cannot self-verify and close Non-Conformance findings. Verification requires departmental engineer.');
      return;
    }

    setActionSubmitting(true);
    setActionErrorMsg('');
    setActionSuccessMsg('');

    try {
      await api.updateQualityDefectAction(actionModalFinding.id, actionForm);
      setActionSuccessMsg('Quality finding and corrective action workflow updated successfully.');
      setTimeout(() => {
        setActionModalFinding(null);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to submit corrective action update.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedProgramme('ALL');
    setSelectedDistrict('ALL');
    setSelectedProjectId('ALL');
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSelectedInspectionType('ALL');
    setSearchQuery('');
    setOnlyNCRs(false);
  };

  // Filtered Inspections for table
  const filteredInspections = useMemo(() => {
    return inspections.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.inspection_code.toLowerCase().includes(q) ||
        item.site_location.toLowerCase().includes(q) ||
        item.inspecting_officer.toLowerCase().includes(q) ||
        item.contractor_name.toLowerCase().includes(q) ||
        item.inspection_type.toLowerCase().includes(q)
      );
    });
  }, [inspections, searchQuery]);

  // Filtered Defects for table
  const filteredDefects = useMemo(() => {
    return defects.filter(item => {
      if (onlyNCRs && !item.is_ncr) return false;
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.finding_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.defect_category.toLowerCase().includes(q) ||
        item.contractor_name.toLowerCase().includes(q)
      );
    });
  }, [defects, onlyNCRs, searchQuery]);

  // Filtered Material Tests
  const filteredMaterialTests = useMemo(() => {
    return materialTests.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.test_ref.toLowerCase().includes(q) ||
        item.material_type.toLowerCase().includes(q) ||
        item.laboratory_name.toLowerCase().includes(q) ||
        item.test_parameter.toLowerCase().includes(q)
      );
    });
  }, [materialTests, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. SCREEN HEADER & DEMO BADGE                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEMO DATA • TN-HDOS SEEDED
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Period: FY 2025-2026 (Q4)
              </span>
              <span className="text-xs text-slate-400">
                Updated: {summaryData?.last_updated || '07 Nov 2026, 09:30 IST'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600" />
              Engineering Quality Intelligence
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Construction quality assurance, inspection evidence, defect monitoring, and corrective action intelligence for Tamil Nadu highway infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/field-ops')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              Field Operations View
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Scenario Spotlight Banner (Section 14)                        */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Active Demonstration Scenario:</span>{' '}
              <span className="font-semibold">CKICP SH-15 Ooty-Gudalur Ghat Corridor (Project #4).</span>{' '}
              Binder content deficiency on 1.3 km stretch (NCR-2025-041, Lab Test MAT-2026-001) triggered corrective milling order and pavement condition downgrade.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedProjectId('4');
                setOnlyNCRs(true);
                setActiveTab('defects');
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition"
            >
              View SH-15 Finding
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-medium rounded transition"
            >
              Check Asset AST-PVM-01
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Multi-tier Filter Bar                                         */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Programme</label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Programmes</option>
              <option value="CKICP">CKICP (Asian Development Bank)</option>
              <option value="TNRSP">TNRSP-II (World Bank)</option>
              <option value="CRIDP">CRIDP (State Budget)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Projects (12)</option>
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.project_code} - {p.title.substring(0, 28)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Type</label>
            <select
              value={selectedInspectionType}
              onChange={(e) => setSelectedInspectionType(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Inspection Types</option>
              <option value="Bitumen Testing">Bitumen Testing</option>
              <option value="Pavement Quality">Pavement Quality</option>
              <option value="Concrete Strength">Concrete Strength</option>
              <option value="Soil Compaction">Soil Compaction</option>
              <option value="Structural Integrity">Structural Integrity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (High Risk)</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="CORRECTIVE_ACTION_PENDING">Corrective Action Pending</option>
              <option value="RECTIFICATION_IN_PROGRESS">Rectification In Progress</option>
              <option value="REINSPECTION_PENDING">Reinspection Pending</option>
              <option value="COMPLETED">Completed / Closed</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleResetFilters}
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search bar row */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search inspections, NCR codes, contractors, lab tests or road chainage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyNCRs}
              onChange={(e) => setOnlyNCRs(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Show Only Formal NCRs
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE QUALITY SUMMARY (8 KPI CARDS)                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Inspections */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('ALL'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Audits</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
            {summaryData?.kpis.total_inspections ?? 34}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.total_inspections}>
            Pavement & Structures
          </div>
        </div>

        {/* Card 2: Open Findings */}
        <div
          onClick={() => { setActiveTab('defects'); setSelectedStatus('CORRECTIVE_ACTION_PENDING'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 group-hover:text-amber-700 transition">
            {summaryData?.kpis.open_quality_findings ?? 13}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.open_quality_findings}>
            Active defects in field
          </div>
        </div>

        {/* Card 3: Critical Defects */}
        <div
          onClick={() => { setActiveTab('defects'); setSelectedSeverity('CRITICAL'); }}
          className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Critical Defects</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 group-hover:text-rose-700 transition">
            {summaryData?.kpis.critical_defects ?? 3}
          </div>
          <div className="text-[10px] text-rose-700/80 mt-1 truncate" title={summaryData?.kpi_definitions.critical_defects}>
            High safety/structure risk
          </div>
        </div>

        {/* Card 4: Formal NCRs */}
        <div
          onClick={() => { setActiveTab('defects'); setOnlyNCRs(true); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">NCRs Issued</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-700 group-hover:text-purple-800 transition">
            {summaryData?.kpis.non_conformance_reports ?? 25}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.non_conformance_reports}>
            Contractual notices
          </div>
        </div>

        {/* Card 5: Corrective Actions Pending */}
        <div
          onClick={() => { setActiveTab('defects'); setSelectedStatus('CORRECTIVE_ACTION_PENDING'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions Pending</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
            {summaryData?.kpis.corrective_actions_pending ?? 12}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.corrective_actions_pending}>
            Contractor rectification
          </div>
        </div>

        {/* Card 6: Overdue Actions */}
        <div
          onClick={() => { setActiveTab('defects'); setSelectedSeverity('ALL'); }}
          className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Overdue Actions</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 group-hover:text-amber-800 transition">
            {summaryData?.kpis.overdue_corrective_actions ?? 2}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-1 truncate" title={summaryData?.kpi_definitions.overdue_corrective_actions}>
            Target date exceeded
          </div>
        </div>

        {/* Card 7: Reinspections Pending */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('REINSPECTION_PENDING'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reinspections</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 group-hover:text-indigo-800 transition">
            {summaryData?.kpis.reinspections_pending ?? 4}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.reinspections_pending}>
            Awaiting Dept verification
          </div>
        </div>

        {/* Card 8: Quality Closure Rate */}
        <div
          onClick={() => { setActiveTab('scorecard'); }}
          className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Closure Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 group-hover:text-emerald-800 transition">
            {summaryData?.kpis.quality_closure_rate_pct ?? 82.5}%
          </div>
          <div className="text-[10px] text-emerald-800/80 mt-1 truncate" title={summaryData?.kpi_definitions.quality_closure_rate_pct}>
            Formula: Verified/Total*100
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AI ENGINEERING QUALITY ASSESSMENT PANEL                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                AI Engineering Quality Assessment & Executive Guidance
              </h2>
              <p className="text-xs text-slate-400">
                Automated synthesis of laboratory test results, field compaction logs, and contractor quality performance.
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30 font-mono">
            Model: Highway-Quality-v4
          </span>
        </div>

        {/* Executive summary paragraph */}
        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 text-sm leading-relaxed text-slate-200">
          {summaryData?.ai_quality_assessment.overall_assessment ||
            'State-wide quality conformance stands at 85.0%. However, critical friction is observed on SH-15 Ooty-Gudalur Ghat Corridor where binder content deficiency (4.6% vs 5.2%) on 1.3 km stretch remains under corrective milling, and subgrade compaction failed MDD test.'}
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Critical Concerns */}
          <div className="bg-slate-800/50 p-3.5 rounded-lg border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2 uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              Critical Concerns
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {summaryData?.ai_quality_assessment.critical_concerns.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              )) || (
                <>
                  <li>• SH-15 Ooty: NCR-2025-041 binder deficiency strips moisture under rain.</li>
                  <li>• PST Engineering logged 14.2% material test failure rate over 90 days.</li>
                </>
              )}
            </ul>
          </div>

          {/* Repeated Defect Patterns */}
          <div className="bg-slate-800/50 p-3.5 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Repeated Defect Patterns
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {summaryData?.ai_quality_assessment.repeated_defect_patterns.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              )) || (
                <>
                  <li>• Bituminous binder extraction variations recurring across ghat packages.</li>
                  <li>• Subgrade dry density below 97% MDD due to inadequate pneumatic rolling.</li>
                </>
              )}
            </ul>
          </div>

          {/* Contractors Requiring Attention */}
          <div className="bg-slate-800/50 p-3.5 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2 uppercase tracking-wider">
              <Building className="w-4 h-4" />
              Contractors Requiring Attention
            </div>
            <div className="space-y-2 text-xs">
              {summaryData?.ai_quality_assessment.contractors_requiring_attention.map((c, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{c.reason}</div>
                </div>
              )) || (
                <div className="text-slate-500">KCP Infra Fictional Ltd (2 Open NCRs)</div>
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-slate-800/50 p-3.5 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Recommended Executive Actions
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {summaryData?.ai_quality_assessment.recommended_actions.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{a}</span>
                </li>
              )) || (
                <>
                  <li>✓ Direct DE Ooty to conduct joint core sample reinspection on Km 14+200.</li>
                  <li>✓ Enforce Clause 46 financial withholding of ₹0.30 Cr on RA Bill #14.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TABS NAVIGATION                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'inspections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Inspection Register
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
              {filteredInspections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('defects')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'defects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Defect & NCR Management
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 font-bold">
              {filteredDefects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'materials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Beaker className="w-4 h-4" />
            Material Testing & Lab Results
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
              {filteredMaterialTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'scorecard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            Contractor Quality Scorecard
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: INSPECTION REGISTER                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Quality Inspections Register</h3>
              <p className="text-xs text-slate-500">
                Authorized audits conducted by Authority Engineers, HRS Specialists, and Divisional Staff.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filteredInspections.length}</span> inspections
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Inspection Code</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Inspecting Officer</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4 text-center">Findings</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No quality inspections found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {item.inspection_code}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.inspection_date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item.inspection_type}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={item.site_location}>
                        {item.site_location}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.inspecting_officer}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.contractor_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${
                          item.findings_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.findings_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          item.severity === 'MAJOR' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'REINSPECTION_PENDING' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        >
                          View Details
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DEFECT & NCR MANAGEMENT                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'defects' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Defects & Non-Conformance Reports (NCR) Register
                <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 font-bold">
                  MoRTH / IRC Specification Standards
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Track formal non-conformances, contractor corrective action commitments, laboratory test re-validations and financial penalties.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyNCRs(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  !onlyNCRs ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Findings ({defects.length})
              </button>
              <button
                onClick={() => setOnlyNCRs(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  onlyNCRs ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Only Formal NCRs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">NCR / Finding Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description & Technical Non-Conformance</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Closure Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Penalty</th>
                  <th className="py-3 px-4 text-right">Action Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDefects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No quality findings or NCRs found matching current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDefects.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-rose-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {d.is_ncr && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Formal Non-Conformance Notice"></span>
                          )}
                          {d.finding_code}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Date: {d.identified_date}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {d.defect_category}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-sm">
                        <div className="line-clamp-2" title={d.description}>
                          {d.description}
                        </div>
                        {d.corrective_action && (
                          <div className="text-[11px] text-blue-700 mt-1 line-clamp-1 italic">
                            Action: {d.corrective_action}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          d.severity === 'MAJOR' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                        {d.contractor_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {d.target_closure_date || 'Pending Schedule'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.status === 'COMPLETED' || d.status === 'VERIFIED_CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'REINSPECTION_PENDING' || d.status === 'REINSPECTION_SCHEDULED' ? 'bg-purple-100 text-purple-800' :
                          d.status === 'RECTIFICATION_IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-rose-700 whitespace-nowrap">
                        {d.penalty_cr > 0 ? `₹${d.penalty_cr.toFixed(2)} Cr` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenActionModal(d)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
                        >
                          Update / Reinspect
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MATERIAL TESTING & LAB RESULTS                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Lab summary banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                <Beaker className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Government Laboratories & NABL Accredited Testing Quality Control
                </h4>
                <p className="text-xs text-slate-500">
                  HRS Guindy, HRS Regional Laboratories (Coimbatore, Madurai, Tiruchirappalli) & Site Quality Control Units.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div className="px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Total Tests</div>
                <div className="text-base font-bold text-slate-900">{materialTests.length}</div>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 rounded border border-emerald-200">
                <div className="text-xs text-emerald-700 font-semibold uppercase">Passed</div>
                <div className="text-base font-bold text-emerald-700">
                  {materialTests.filter(m => m.result_status === 'PASSED').length}
                </div>
              </div>
              <div className="px-3 py-1.5 bg-rose-50 rounded border border-rose-200">
                <div className="text-xs text-rose-700 font-semibold uppercase">Failed</div>
                <div className="text-base font-bold text-rose-700">
                  {materialTests.filter(m => m.result_status === 'FAILED').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Test Reference</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Date Sampled</th>
                    <th className="py-3 px-4">Accredited Laboratory</th>
                    <th className="py-3 px-4">Test Parameter & Standard</th>
                    <th className="py-3 px-4">Measured Result</th>
                    <th className="py-3 px-4">IRC / MoRTH Specification</th>
                    <th className="py-3 px-4 text-center">Result Status</th>
                    <th className="py-3 px-4 text-right">Lab Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterialTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {t.test_ref}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {t.material_type}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {t.sample_date}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.laboratory_name}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {t.test_parameter}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold ${
                        t.result_status === 'FAILED' ? 'text-rose-600' : 'text-slate-900'
                      }`}>
                        {t.measured_result}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {t.reference_limit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.result_status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.result_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        {t.report_file_name || 'HRS_Lab_Cert.pdf'}
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
      {/* TAB 4: CONTRACTOR QUALITY SCORECARD                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          {/* Formula definition card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900">Standard Contractor Quality Score Formula:</span>{' '}
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-blue-800">
                Score = 100 - (Critical NCRs × 10) - (Major Defects × 4) - (Overdue Actions × 5)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Contractors scoring below 70.0 trigger mandatory show-cause notice and technical bid withholding.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Contractor Quality Performance League</h3>
              <p className="text-xs text-slate-500">
                Quality scoring based on documented site inspections, non-conformance frequency, and promptness of corrective action.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Contractor Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-center">Total Audits</th>
                    <th className="py-3 px-4 text-center">Observations</th>
                    <th className="py-3 px-4 text-center">Critical NCRs</th>
                    <th className="py-3 px-4 text-center">Actions Pending</th>
                    <th className="py-3 px-4 text-center">Quality Score (/100)</th>
                    <th className="py-3 px-4 text-center">Compliance Rate</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData?.contractor_scorecard.map((item) => (
                    <tr key={item.contractor_id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.contractor_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.contractor_class}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                        {item.inspections_count}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700">
                        {item.total_observations}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                          item.critical_observations > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.critical_observations}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                        {item.corrective_actions_pending}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                          item.quality_score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          item.quality_score >= 70 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {item.quality_score.toFixed(1)} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {item.compliance_rate_pct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.quality_score < 70 ? (
                          <span className="text-xs font-bold text-rose-600">Action Required</span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600">Compliant</span>
                        )}
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
      {/* MODAL 1: INSPECTION DETAIL MODAL                              */}
      {/* ------------------------------------------------------------- */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {selectedInspection.inspection_code}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedInspection.inspection_type} Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Inspection Date:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedInspection.inspection_date}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Inspecting Officer:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedInspection.inspecting_officer}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Contractor:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedInspection.contractor_name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Location / Chainage:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedInspection.site_location}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Findings Summary</h4>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedInspection.findings_summary || 'No detailed findings recorded.'}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: CORRECTIVE ACTION & REINSPECTION WORKFLOW MODAL      */}
      {/* ------------------------------------------------------------- */}
      {actionModalFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600">
                  {actionModalFinding.finding_code} • {actionModalFinding.defect_category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Corrective Action & Engineering Reinspection
                </h3>
              </div>
              <button
                onClick={() => setActionModalFinding(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Finding brief */}
            <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 text-xs">
              <div className="font-bold text-rose-950">Non-Conformance Description:</div>
              <p className="text-rose-900 mt-0.5">{actionModalFinding.description}</p>
              <div className="mt-2 text-[11px] text-slate-600">
                Contractor: <span className="font-bold text-slate-800">{actionModalFinding.contractor_name}</span> |
                Identified: <span className="font-bold text-slate-800">{actionModalFinding.identified_date}</span>
              </div>
            </div>

            {/* Contractor Role RBAC Warning */}
            {user?.role_code === 'CONTRACTOR' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Contractor Mode Active:</span> You can submit contractor responses and proposed corrective actions. Departmental rules mandate that only Assistant Executive Engineers or above can sign off and close non-conformances.
                </div>
              </div>
            )}

            {actionErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                {actionErrorMsg}
              </div>
            )}

            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
                {actionSuccessMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contractor Explanation / Root Cause Response
                </label>
                <textarea
                  rows={2}
                  value={actionForm.contractor_response}
                  onChange={(e) => setActionForm({ ...actionForm, contractor_response: e.target.value })}
                  placeholder="Detail cause of variation (e.g. batching plant sensor calibration, temperature drop)..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposed Corrective Action / Rectification Methodology
                </label>
                <textarea
                  rows={2}
                  value={actionForm.corrective_action}
                  onChange={(e) => setActionForm({ ...actionForm, corrective_action: e.target.value })}
                  placeholder="e.g. Milling of 1.3 km layer, moisture re-conditioning, re-rolling to 97.5% MDD..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Closure Date</label>
                  <input
                    type="date"
                    value={actionForm.target_closure_date}
                    onChange={(e) => setActionForm({ ...actionForm, target_closure_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workflow Status</label>
                  <select
                    value={actionForm.status}
                    onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="CORRECTIVE_ACTION_PENDING">Corrective Action Pending</option>
                    <option value="RECTIFICATION_IN_PROGRESS">Rectification In Progress</option>
                    <option value="REINSPECTION_SCHEDULED">Reinspection Scheduled</option>
                    <option value="VERIFIED_CLOSED">Verified & Closed (Engineer Sign-off)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 uppercase text-[11px]">
                  Reinspection & Quality Verification Sign-Off
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reinspection Date</label>
                    <input
                      type="date"
                      value={actionForm.reinspection_date}
                      onChange={(e) => setActionForm({ ...actionForm, reinspection_date: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Verifying Engineer</label>
                    <input
                      type="text"
                      value={actionForm.reinspection_officer}
                      onChange={(e) => setActionForm({ ...actionForm, reinspection_officer: e.target.value })}
                      placeholder="e.g. Dr. P. Ramanathan / Er. R. Venkatesh"
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reinspection Core/Test Findings & Sign-off Notes
                  </label>
                  <input
                    type="text"
                    value={actionForm.reinspection_notes}
                    onChange={(e) => setActionForm({ ...actionForm, reinspection_notes: e.target.value })}
                    placeholder="e.g. Core sample taken at Km 14+300 yielded 5.25% bitumen; density passed."
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionModalFinding(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {actionSubmitting ? 'Saving...' : 'Save Quality Workflow Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityPage;
