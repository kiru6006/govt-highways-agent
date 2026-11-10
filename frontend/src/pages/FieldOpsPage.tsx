import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FieldOpsSummaryData,
  FieldInspectionItem,
  FieldIssueItem,
  ProjectItem
} from '../types';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Camera,
  FileCheck,
  AlertOctagon,
  ChevronRight,
  Plus,
  X,
  Send,
  Building,
  UserCheck,
  Activity,
  Layers,
  Map as MapIcon,
  Compass,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const FieldOpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<FieldOpsSummaryData | null>(null);
  const [inspections, setInspections] = useState<FieldInspectionItem[]>([]);
  const [issues, setIssues] = useState<FieldIssueItem[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'inspections' | 'schedule' | 'issues' | 'map'>('inspections');

  // Filters
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedIssueCategory, setSelectedIssueCategory] = useState<string>('ALL');
  const [selectedIssuePriority, setSelectedIssuePriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedInspection, setSelectedInspection] = useState<FieldInspectionItem | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [issueModalTarget, setIssueModalTarget] = useState<FieldIssueItem | null>(null);
  const [activeMapPoint, setActiveMapPoint] = useState<any | null>(null);

  // Scheduling Form
  const [scheduleForm, setScheduleForm] = useState({
    project_id: 4,
    package_id: 1,
    officer_name: user?.full_name || 'Er. R. Venkatesh',
    officer_designation: 'Assistant Executive Engineer',
    inspection_date: new Date().toISOString().split('T')[0],
    site_location: 'SH-15 Km 14+200 (Pykara stretch)',
    work_activity: 'Bituminous Concrete Rectification & Joint Core Verification'
  });
  const [scheduleSubmitting, setScheduleSubmitting] = useState<boolean>(false);
  const [scheduleMsg, setScheduleMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Issue Update Form
  const [issueForm, setIssueForm] = useState({
    status: 'IN_PROGRESS',
    resolution_target: '',
    resolution_notes: ''
  });
  const [issueSubmitting, setIssueSubmitting] = useState<boolean>(false);
  const [issueMsg, setIssueMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getProjects({});
        if (Array.isArray(res)) setProjects(res);
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    };
    fetchProjects();
  }, []);

  // Fetch all field ops data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const projId = selectedProjectId !== 'ALL' ? Number(selectedProjectId) : undefined;

      const [summary, inspRes, issueRes, mapRes] = await Promise.all([
        api.getFieldOpsSummary(projId),
        api.getFieldInspections({
          project_id: projId,
          status: selectedStatus,
          severity: selectedSeverity,
          search: searchQuery
        }),
        api.getFieldIssues({
          project_id: projId,
          category: selectedIssueCategory,
          priority: selectedIssuePriority,
          status: selectedStatus,
          search: searchQuery
        }),
        api.getFieldOpsMapLocations()
      ]);

      setSummaryData(summary);
      setInspections(inspRes.items || []);
      setIssues(issueRes.items || []);
      setMapPoints(mapRes.points || []);
      if (mapRes.points && mapRes.points.length > 0) {
        setActiveMapPoint(mapRes.points[0]);
      }
    } catch (err) {
      console.error('Error fetching field ops data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, selectedStatus, selectedSeverity, selectedIssueCategory, selectedIssuePriority]);

  // Handle schedule submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSubmitting(true);
    setScheduleMsg(null);

    try {
      await api.scheduleFieldInspection(scheduleForm);
      setScheduleMsg({ type: 'success', text: 'Inspection scheduled and officer roster updated successfully.' });
      setTimeout(() => {
        setScheduleModalOpen(false);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setScheduleMsg({ type: 'error', text: err?.message || 'Failed to schedule inspection.' });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Handle issue status submit
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalTarget) return;

    setIssueSubmitting(true);
    setIssueMsg(null);

    try {
      await api.updateFieldIssueStatus(issueModalTarget.id, issueForm);
      setIssueMsg({ type: 'success', text: 'Field issue status and inter-departmental action updated.' });
      setTimeout(() => {
        setIssueModalTarget(null);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setIssueMsg({ type: 'error', text: err?.message || 'Failed to update issue status.' });
    } finally {
      setIssueSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedProgramme('ALL');
    setSelectedDistrict('ALL');
    setSelectedProjectId('ALL');
    setSelectedStatus('ALL');
    setSelectedSeverity('ALL');
    setSelectedIssueCategory('ALL');
    setSelectedIssuePriority('ALL');
    setSearchQuery('');
  };

  // Filtered Inspections for table
  const filteredInspections = useMemo(() => {
    return inspections.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.inspection_code.toLowerCase().includes(q) ||
        item.site_location.toLowerCase().includes(q) ||
        item.officer_name.toLowerCase().includes(q) ||
        item.contractor_name.toLowerCase().includes(q) ||
        item.work_activity.toLowerCase().includes(q)
      );
    });
  }, [inspections, searchQuery]);

  // Filtered Issues for table
  const filteredIssues = useMemo(() => {
    return issues.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.issue_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.assigned_department.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    });
  }, [issues, searchQuery]);

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
              <Compass className="w-8 h-8 text-blue-600" />
              Field Operations & Execution Intelligence
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Physical site inspection monitoring, progress verification, field issue resolution, geo-tagged observation logs and contractor accountability.
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
              onClick={() => {
                setScheduleModalOpen(true);
                setScheduleMsg(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule Inspection
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Scenario Spotlight Banner (Section 14)                        */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950">Active Demonstration Scenario:</span>{' '}
              <span className="font-semibold">CKICP SH-15 Ooty-Gudalur Ghat Corridor (Project #4).</span>{' '}
              Site inspection <span className="font-mono font-bold">INSP-2026-001</span> logged by AEE Er. R. Venkatesh detected 14.0% progress divergence (Contractor claimed 68% vs Engineer verified 54%). 48 TANGEDCO poles obstruct road carriage edge (<span className="font-mono font-bold">FISS-2026-002</span>).
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedProjectId('4');
                setActiveTab('inspections');
              }}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded transition"
            >
              Inspect SH-15 Visit
            </button>
            <button
              onClick={() => {
                setActiveTab('map');
              }}
              className="px-3 py-1.5 bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 font-medium rounded transition"
            >
              View Geo-Location
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="FOLLOWUP_REQUIRED">Follow-up Required</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Severity / Risk</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (High Risk)</option>
              <option value="MAJOR">Major</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Category</label>
            <select
              value={selectedIssueCategory}
              onChange={(e) => setSelectedIssueCategory(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Utility Obstruction">Utility Obstruction</option>
              <option value="Land Boundary">Land Boundary</option>
              <option value="Drainage">Drainage</option>
              <option value="Safety Hazard">Safety Hazard</option>
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

        {/* Search row */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search site visits, officers, contractors, work activity or issue descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE FIELD OPS SUMMARY (8 KPI CARDS)                  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Site Inspections */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('ALL'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Site Visits</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
            {summaryData?.kpis.total_site_inspections ?? 50}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.total_site_inspections}>
            Documented visits
          </div>
        </div>

        {/* Card 2: Completed */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('COMPLETED'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 group-hover:text-emerald-800 transition">
            {summaryData?.kpis.inspections_completed ?? 38}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.inspections_completed}>
            With geo-logs & photos
          </div>
        </div>

        {/* Card 3: Scheduled */}
        <div
          onClick={() => { setActiveTab('schedule'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Scheduled</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 group-hover:text-indigo-800 transition">
            {summaryData?.kpis.inspections_scheduled ?? 8}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.inspections_scheduled}>
            In calendar roster
          </div>
        </div>

        {/* Card 4: Overdue Inspections */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('OVERDUE'); }}
          className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Overdue</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 group-hover:text-rose-700 transition">
            {summaryData?.kpis.overdue_inspections ?? 4}
          </div>
          <div className="text-[10px] text-rose-700/80 mt-1 truncate" title={summaryData?.kpi_definitions.overdue_inspections}>
            &gt; 7 days past target
          </div>
        </div>

        {/* Card 5: Open Field Issues */}
        <div
          onClick={() => { setActiveTab('issues'); setSelectedStatus('ALL'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 group-hover:text-amber-700 transition">
            {summaryData?.kpis.open_field_issues ?? 14}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.open_field_issues}>
            Site bottlenecks
          </div>
        </div>

        {/* Card 6: Critical Field Issues */}
        <div
          onClick={() => { setActiveTab('issues'); setSelectedIssuePriority('CRITICAL'); }}
          className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Critical Issues</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 group-hover:text-rose-800 transition">
            {summaryData?.kpis.critical_field_issues ?? 3}
          </div>
          <div className="text-[10px] text-rose-800/80 mt-1 truncate" title={summaryData?.kpi_definitions.critical_field_issues}>
            Milestone halting
          </div>
        </div>

        {/* Card 7: Progress Updates Submitted */}
        <div
          onClick={() => { setActiveTab('inspections'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submissions</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
            {summaryData?.kpis.progress_updates_submitted ?? 42}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate" title={summaryData?.kpi_definitions.progress_updates_submitted}>
            Contractor claims
          </div>
        </div>

        {/* Card 8: Verification Pending */}
        <div
          onClick={() => { setActiveTab('inspections'); setSelectedStatus('FOLLOWUP_REQUIRED'); }}
          className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Pending Check</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 group-hover:text-amber-800 transition">
            {summaryData?.kpis.verification_pending ?? 6}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-1 truncate" title={summaryData?.kpi_definitions.verification_pending}>
            Joint cross-check
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AI FIELD EXECUTION INTELLIGENCE PANEL                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                AI Field Execution Intelligence & Physical Verification
              </h2>
              <p className="text-xs text-slate-400">
                Automated detection of divergence between contractor progress claims and departmental engineer verification.
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-400/30 font-mono">
            Model: Field-Exec-Sensor-v3
          </span>
        </div>

        {/* Summary text */}
        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 text-sm leading-relaxed text-slate-200">
          {summaryData?.ai_field_intelligence.overall_execution_status ||
            'Field progress monitoring reveals strong overall activity. However, a significant divergence of 14.0% was detected on SH-15 Ooty Ghat Corridor (68.0% contractor claimed vs 54.0% verified by AEE), alongside 48 unshifted TANGEDCO electrical poles halting earthworks.'}
        </div>

        {/* Divergence Alerts Section */}
        {summaryData?.ai_field_intelligence.divergence_alerts && summaryData.ai_field_intelligence.divergence_alerts.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-500/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Physical Progress Divergence Flag (Claimed vs Verified)
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-rose-500/30 text-rose-200 rounded font-bold font-mono">
                FLAGGED FOR CURTAILMENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaryData.ai_field_intelligence.divergence_alerts.map((alert, idx) => (
                <div key={idx} className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-xs space-y-2 text-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-indigo-700 font-bold">{alert.project_code}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{alert.project_name}</h4>
                      <p className="text-slate-500 text-[11px]">{alert.package}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-700 font-bold text-sm">Gap: {alert.gap_pct.toFixed(1)}%</span>
                      <div className="text-[10px] text-slate-500">Withhold MB Entry</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Contractor Claimed Progress:</span>
                      <span className="font-bold text-amber-700">{alert.reported_progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${alert.reported_progress}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-slate-600">Engineer Verified Physical Progress:</span>
                      <span className="font-bold text-emerald-700">{alert.verified_progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${alert.verified_progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Recommended Action Column */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-800">
                <div className="text-indigo-800 font-bold uppercase text-[11px]">
                  Recommended Engineering Remediation
                </div>
                <ul className="space-y-1.5 text-slate-700">
                  {summaryData.ai_field_intelligence.recommended_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">→</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
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
            <FileCheck className="w-4 h-4" />
            Field Inspection Register
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
              {filteredInspections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'schedule'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Inspection Schedule & Roster
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'issues'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Field Issues & Obstructions
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
              {filteredIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'map'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Interactive Spatial Explorer
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: FIELD INSPECTION REGISTER                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Physical Field Inspection Logs</h3>
              <p className="text-xs text-slate-500">
                Geo-tagged site visits, work activity verifications, and contractor vs engineer measurement logs.
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
                  <th className="py-3 px-4">Visit Code</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Officer & Designation</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Location / Stretch</th>
                  <th className="py-3 px-4">Work Activity</th>
                  <th className="py-3 px-4 text-center">Progress (Claimed / Verified)</th>
                  <th className="py-3 px-4 text-center">Photos</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No field inspections found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((item) => {
                    const gap = item.progress_reported_pct - item.progress_verified_pct;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {item.inspection_code}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {item.inspection_date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{item.officer_name}</div>
                          <div className="text-[10px] text-slate-500">{item.officer_designation}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {item.contractor_name}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={item.site_location}>
                          {item.site_location}
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-medium max-w-xs truncate" title={item.work_activity}>
                          {item.work_activity}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                            <span className="text-amber-600 font-bold">{item.progress_reported_pct}%</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-emerald-700 font-bold">{item.progress_verified_pct}%</span>
                            {gap > 5 && (
                              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                                -{gap}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            <Camera className="w-3 h-3 text-slate-500" />
                            {item.photos_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'FOLLOWUP_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                            item.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedInspection(item)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: INSPECTION SCHEDULE & ROSTER                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mandatory Milestone Inspection Calendar</h3>
              <p className="text-xs text-slate-500">
                Departmental roster programming joint inspections, milestone verifications, and laboratory sampling appointments.
              </p>
            </div>
            <button
              onClick={() => {
                setScheduleModalOpen(true);
                setScheduleMsg(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule New Site Visit
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Inspection Date</th>
                    <th className="py-3 px-4">Inspection Code</th>
                    <th className="py-3 px-4">Target Stretch / Location</th>
                    <th className="py-3 px-4">Work Activity Planned</th>
                    <th className="py-3 px-4">Assigned Engineer</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'FOLLOWUP_REQUIRED').map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.inspection_date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {item.inspection_code}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.site_location}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item.work_activity}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.officer_name} ({item.officer_designation})
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 rounded transition"
                        >
                          View Details
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: FIELD ISSUES & OBSTRUCTIONS TRACKER                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Field Issues & Inter-Departmental Obstructions
                <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-bold">
                  TANGEDCO • Forest • TWAD • Revenue
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Track road execution bottlenecks, utility shifting delays, land boundary disputes, and environmental clearances.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Issue Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description of Impediment</th>
                  <th className="py-3 px-4">Chainage / Location</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Resolution Target</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No field issues found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {issue.issue_code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {issue.category}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-sm">
                        <div className="line-clamp-2" title={issue.description}>
                          {issue.description}
                        </div>
                        {issue.resolution_notes && (
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                            Notes: {issue.resolution_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {issue.location}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {issue.assigned_department}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          issue.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          issue.status === 'DEPARTMENT_ACTION_REQUIRED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {issue.resolution_target || 'TBD'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setIssueModalTarget(issue);
                            setIssueForm({
                              status: issue.status,
                              resolution_target: issue.resolution_target || '',
                              resolution_notes: issue.resolution_notes || ''
                            });
                            setIssueMsg(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
                        >
                          Update Status
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
      {/* TAB 4: INTERACTIVE FIELD MAP VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Statewide Field Operations Spatial Explorer
              </h3>
              <p className="text-xs text-slate-500">
                Interactive geo-referenced inspection observation coordinates, corridor assets, and field issue pins across Tamil Nadu.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Inspection Points
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Infrastructure Assets
              </span>
            </div>
          </div>

          {/* Interactive GIS Spatial Grid & Pin Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Simulated Geospatial GIS Canvas */}
            <div className="lg:col-span-2 bg-slate-50 rounded-xl p-6 min-h-[420px] flex flex-col justify-between relative overflow-hidden border border-slate-200 shadow-2xs text-slate-800">
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-mono text-emerald-800 font-semibold">GIS Coordinates Active: WGS-84 TN Grid</span>
                </div>
                <div className="font-mono text-slate-500">Datum: EPSG:4326</div>
              </div>

              {/* Pins visualization */}
              <div className="relative z-10 my-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mapPoints.map((pt, idx) => {
                  const isSelected = activeMapPoint?.id === pt.id && activeMapPoint?.type === pt.type;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveMapPoint(pt)}
                      className={`p-3.5 rounded-lg cursor-pointer transition border backdrop-blur-sm ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pt.type === 'INSPECTION' ? 'bg-blue-500/30 text-blue-300' : 'bg-emerald-500/30 text-emerald-300'
                        }`}>
                          {pt.type} • {pt.code}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {pt.lat?.toFixed(4)}, {pt.lng?.toFixed(4)}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white">{pt.title}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{pt.location}</div>
                      <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-700/60">
                        <span className="text-slate-400">{pt.officer}</span>
                        <span className={`font-semibold ${
                          pt.severity === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {pt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-800">
                <span>Click any coordinate card to inspect telemetry and field photos.</span>
                <span className="font-mono text-slate-500">Nilgiris Ghat Corridor • SH-15</span>
              </div>
            </div>

            {/* Right 1 Col: Active Selected Point Dossier */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              {activeMapPoint ? (
                <>
                  <div className="pb-3 border-b border-slate-200">
                    <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                      {activeMapPoint.type} • {activeMapPoint.code}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {activeMapPoint.title}
                    </h4>
                    <p className="text-xs text-slate-500">{activeMapPoint.location}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Geo Latitude:</span>
                      <span className="font-mono font-bold text-slate-800">{activeMapPoint.lat}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Geo Longitude:</span>
                      <span className="font-mono font-bold text-slate-800">{activeMapPoint.lng}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Authority / Officer:</span>
                      <span className="font-bold text-slate-800">{activeMapPoint.officer}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Execution Status:</span>
                      <span className="font-bold text-blue-700">{activeMapPoint.status}</span>
                    </div>
                    {activeMapPoint.verified_progress !== undefined && (
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Verified Progress:</span>
                        <span className="font-bold text-emerald-700">{activeMapPoint.verified_progress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Field Dossier Evidence</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Digital inspection captured with authenticated GPS location, timestamped photographic proof, and engineer digital certification.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    {activeMapPoint.type === 'INSPECTION' ? (
                      <button
                        onClick={() => {
                          const item = inspections.find(i => i.inspection_code === activeMapPoint.code);
                          if (item) setSelectedInspection(item);
                        }}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition text-center"
                      >
                        Open Full Site Inspection Log
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/assets')}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition text-center"
                      >
                        Open Asset Intelligence Card
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a coordinate pin on the spatial map to view inspection details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: VIEW INSPECTION DOSSIER                              */}
      {/* ------------------------------------------------------------- */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {selectedInspection.inspection_code} • {selectedInspection.status.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Site Visit Dossier: {selectedInspection.work_activity}
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
                <p className="font-bold text-slate-900 mt-0.5">{selectedInspection.officer_name} ({selectedInspection.officer_designation})</p>
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

            {/* Measurement reconciliation */}
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 text-xs space-y-2">
              <span className="font-bold text-blue-950 uppercase text-[11px]">
                Physical Measurement Verification
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Contractor Claimed Progress:</span>
                  <div className="text-lg font-bold text-amber-600">{selectedInspection.progress_reported_pct}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Officer Verified Progress:</span>
                  <div className="text-lg font-bold text-emerald-700">{selectedInspection.progress_verified_pct}%</div>
                </div>
              </div>
              {selectedInspection.progress_reported_pct > selectedInspection.progress_verified_pct && (
                <div className="text-rose-700 font-semibold text-[11px] pt-1 border-t border-blue-200">
                  Divergence of {(selectedInspection.progress_reported_pct - selectedInspection.progress_verified_pct).toFixed(1)}% identified. Curtailment order issued.
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Observation & Findings Summary</h4>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedInspection.findings_summary}
              </p>
            </div>

            {selectedInspection.follow_up_action && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Required Follow-up Directive:</span>
                <p className="text-amber-800">{selectedInspection.follow_up_action}</p>
                {selectedInspection.follow_up_date && (
                  <span className="text-[10px] text-amber-900 font-semibold mt-1 block">
                    Target Date: {selectedInspection.follow_up_date}
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: SCHEDULE FIELD INSPECTION                            */}
      {/* ------------------------------------------------------------- */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  Officer Roster Programming
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Schedule Field Inspection
                </h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scheduleMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                scheduleMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {scheduleMsg.text}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project</label>
                  <select
                    value={scheduleForm.project_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, project_id: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.project_code} - {p.title.substring(0, 24)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={scheduleForm.inspection_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, inspection_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Officer</label>
                  <input
                    type="text"
                    value={scheduleForm.officer_name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, officer_name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={scheduleForm.officer_designation}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, officer_designation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Location / Chainage</label>
                <input
                  type="text"
                  value={scheduleForm.site_location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, site_location: e.target.value })}
                  placeholder="e.g. SH-15 Km 14+200 to 18+000 (Pykara stretch)"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Activity Planned</label>
                <textarea
                  rows={2}
                  value={scheduleForm.work_activity}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, work_activity: e.target.value })}
                  placeholder="e.g. Dense Bituminous Macadam compaction audit, core sampling..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {scheduleSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: UPDATE FIELD ISSUE STATUS                            */}
      {/* ------------------------------------------------------------- */}
      {issueModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">
                  {issueModalTarget.issue_code} • {issueModalTarget.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Update Field Issue & Inter-Dept Action
                </h3>
              </div>
              <button
                onClick={() => setIssueModalTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900">Issue:</span> {issueModalTarget.description}
              <div className="mt-1 text-[11px] text-slate-600">
                Location: <span className="font-semibold text-slate-800">{issueModalTarget.location}</span> |
                Assigned to: <span className="font-semibold text-slate-800">{issueModalTarget.assigned_department}</span>
              </div>
            </div>

            {issueMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                issueMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {issueMsg.text}
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Status</label>
                  <select
                    value={issueForm.status}
                    onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    <option value="DEPARTMENT_ACTION_REQUIRED">Department Action Required</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved / Cleared</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Resolution Date</label>
                  <input
                    type="date"
                    value={issueForm.resolution_target}
                    onChange={(e) => setIssueForm({ ...issueForm, resolution_target: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inter-Departmental Actions & Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={issueForm.resolution_notes}
                  onChange={(e) => setIssueForm({ ...issueForm, resolution_notes: e.target.value })}
                  placeholder="e.g. Joint site inspection conducted with TANGEDCO SE; power shutdown scheduled..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIssueModalTarget(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {issueSubmitting ? 'Updating...' : 'Update Issue Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOpsPage;
