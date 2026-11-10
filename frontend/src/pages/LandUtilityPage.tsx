import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LandUtilityOverviewData,
  LandAcquisitionParcelItem,
  UtilityShiftingItem,
  LandUtilityMapPoint,
  DepartmentAIFindingItem,
  ProjectItem
} from '../types';
import {
  MapPin,
  Compass,
  Zap,
  Droplet,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileText,
  FileCheck2,
  Building,
  ExternalLink,
  SlidersHorizontal,
  X,
  Send,
  AlertOctagon,
  ChevronRight,
  Info,
  Calendar,
  CheckSquare,
  Landmark,
  ShieldCheck,
  Scale
} from 'lucide-react';

export const LandUtilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'parcels' | 'utilities' | 'gis' | 'walkthrough'>('parcels');

  const [overviewData, setOverviewData] = useState<LandUtilityOverviewData | null>(null);
  const [parcels, setParcels] = useState<LandAcquisitionParcelItem[]>([]);
  const [utilities, setUtilities] = useState<UtilityShiftingItem[]>([]);
  const [mapPoints, setMapPoints] = useState<LandUtilityMapPoint[]>([]);
  const [aiFindings, setAiFindings] = useState<DepartmentAIFindingItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedUtilityAgency, setSelectedUtilityAgency] = useState<string>('ALL');
  const [selectedBlockingOnly, setSelectedBlockingOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Selection
  const [selectedParcelForWorkflow, setSelectedParcelForWorkflow] = useState<LandAcquisitionParcelItem | null>(null);
  const [selectedUtilityForWorkflow, setSelectedUtilityForWorkflow] = useState<UtilityShiftingItem | null>(null);
  const [selectedMapPoint, setSelectedMapPoint] = useState<LandUtilityMapPoint | null>(null);

  // Form state for Land Parcel Workflow Modal
  const [wfNewStage, setWfNewStage] = useState<string>('Award 19(1)');
  const [wfPossessionStatus, setWfPossessionStatus] = useState<string>('PENDING_POSSESSION');
  const [wfPossessionDate, setWfPossessionDate] = useState<string>('');
  const [wfCompensationStatus, setWfCompensationStatus] = useState<string>('PENDING');
  const [wfCompensationAmount, setWfCompensationAmount] = useState<number>(0);
  const [wfPaymentRef, setWfPaymentRef] = useState<string>('');
  const [wfDocRef, setWfDocRef] = useState<string>('');
  const [wfRemarks, setWfRemarks] = useState<string>('');
  const [wfSubmitting, setWfSubmitting] = useState<boolean>(false);
  const [wfSuccessMsg, setWfSuccessMsg] = useState<string>('');
  const [wfErrorMsg, setWfErrorMsg] = useState<string>('');

  // Form state for Utility Shifting Workflow Modal
  const [utlWorkOrderStatus, setUtlWorkOrderStatus] = useState<string>('IN_PROGRESS');
  const [utlProgressPct, setUtlProgressPct] = useState<number>(25);
  const [utlVerificationStatus, setUtlVerificationStatus] = useState<string>('UNVERIFIED');
  const [utlVerifyingEngineer, setUtlVerifyingEngineer] = useState<string>('');
  const [utlInspectionDocRef, setUtlInspectionDocRef] = useState<string>('');
  const [utlRemarks, setUtlRemarks] = useState<string>('');
  const [utlSubmitting, setUtlSubmitting] = useState<boolean>(false);
  const [utlSuccessMsg, setUtlSuccessMsg] = useState<string>('');
  const [utlErrorMsg, setUtlErrorMsg] = useState<string>('');

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const pId = selectedProjectId !== 'ALL' ? Number(selectedProjectId) : undefined;
      const [ov, lps, utls, gisPts, ai, prjs] = await Promise.all([
        api.getLandUtilityOverview(pId),
        api.getLandParcels({
          project_id: pId,
          district: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
          stage: selectedStage !== 'ALL' ? selectedStage : undefined,
          is_blocking: selectedBlockingOnly ? true : undefined,
          search: searchQuery || undefined
        }),
        api.getUtilityShiftings({
          project_id: pId,
          owning_agency: selectedUtilityAgency !== 'ALL' ? selectedUtilityAgency : undefined,
          is_blocking: selectedBlockingOnly ? true : undefined,
          search: searchQuery || undefined
        }),
        api.getLandUtilityMapLocations(pId),
        api.getLandUtilityAIIntelligence(pId),
        api.getProjects()
      ]);

      setOverviewData(ov);
      setParcels(lps);
      setUtilities(utls);
      setMapPoints(gisPts);
      setAiFindings(ai.items || []);
      setProjects(prjs);
    } catch (err) {
      console.error('Failed to load Land & Utility Intelligence data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, selectedDistrict, selectedStage, selectedUtilityAgency, selectedBlockingOnly]);

  // Handle Land Parcel Workflow Submit
  const handleParcelWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelForWorkflow) return;

    setWfSubmitting(true);
    setWfErrorMsg('');
    setWfSuccessMsg('');

    try {
      await api.updateLandParcelWorkflow(selectedParcelForWorkflow.id, {
        new_stage: wfNewStage,
        possession_status: wfPossessionStatus,
        possession_date: wfPossessionDate || undefined,
        compensation_status: wfCompensationStatus,
        compensation_paid_cr: wfCompensationStatus === 'PAID' ? wfCompensationAmount || selectedParcelForWorkflow.compensation_assessed_cr : undefined,
        payment_reference: wfPaymentRef || undefined,
        document_reference: wfDocRef || undefined,
        officer_remarks: wfRemarks
      });
      setWfSuccessMsg('Land parcel statutory lifecycle updated successfully.');
      setTimeout(() => {
        setSelectedParcelForWorkflow(null);
        setWfSuccessMsg('');
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setWfErrorMsg(err?.message || 'Failed to update land parcel.');
    } finally {
      setWfSubmitting(false);
    }
  };

  // Handle Utility Workflow Submit
  const handleUtilityWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUtilityForWorkflow) return;

    setUtlSubmitting(true);
    setUtlErrorMsg('');
    setUtlSuccessMsg('');

    try {
      await api.updateUtilityWorkflow(selectedUtilityForWorkflow.id, {
        work_order_status: utlWorkOrderStatus,
        physical_progress_pct: utlProgressPct,
        verification_status: utlVerificationStatus,
        verifying_engineer: utlVerifyingEngineer || undefined,
        inspection_document_ref: utlInspectionDocRef || undefined,
        remarks: utlRemarks
      });
      setUtlSuccessMsg('Utility shifting progress & engineer verification updated.');
      setTimeout(() => {
        setSelectedUtilityForWorkflow(null);
        setUtlSuccessMsg('');
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setUtlErrorMsg(err?.message || 'Failed to update utility shifting.');
    } finally {
      setUtlSubmitting(false);
    }
  };

  const landKpis = overviewData?.land_kpis;
  const utilityKpis = overviewData?.utility_kpis;

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (selectedBlockingOnly && !p.blocking_project_milestone) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.parcel_reference.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.survey_number.toLowerCase().includes(q) ||
          p.landowner_name.toLowerCase().includes(q) ||
          p.project_title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parcels, selectedBlockingOnly, searchQuery]);

  // Filtered Utilities
  const filteredUtilities = useMemo(() => {
    return utilities.filter((u) => {
      if (selectedBlockingOnly && !u.blocking_milestone) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          u.utility_code.toLowerCase().includes(q) ||
          u.location_chainage.toLowerCase().includes(q) ||
          u.owning_agency.toLowerCase().includes(q) ||
          u.project_title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [utilities, selectedBlockingOnly, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Executive Metadata */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Land Acquisition & Utility Shifting Intelligence
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Statutory land acquisition under TN Highways Act 2001, multi-agency utility relocation, GIS spatial mapping and critical path clearance.
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
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
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
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <label className="block text-xs font-medium text-slate-600 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Districts</option>
              <option value="Nilgiris">Nilgiris (Ooty Corridor)</option>
              <option value="Chengalpattu">Chengalpattu (ECR)</option>
              <option value="Kanchipuram">Kanchipuram</option>
              <option value="Tiruchirappalli">Tiruchirappalli</option>
              <option value="Madurai">Madurai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Salem">Salem</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Acquisition Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statutory Stages</option>
              <option value="Notification 15(2)">Sec 15(2) Notice Published</option>
              <option value="Gazette 15(1)">Sec 15(1) Gazette Declaration</option>
              <option value="Award 19(1)">Sec 19(1) Compensation Award</option>
              <option value="Handover">Physical Possession Handed Over</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Utility Agency</label>
            <select
              value={selectedUtilityAgency}
              onChange={(e) => setSelectedUtilityAgency(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Utility Agencies</option>
              <option value="TANGEDCO">TANGEDCO (Electricity Board)</option>
              <option value="TWAD">TWAD Board (Water Supply)</option>
              <option value="TELECOM">BSNL / OFC Telecom</option>
              <option value="MUNICIPAL">Municipal Corporations (MAWS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search survey no, village, parcel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={selectedBlockingOnly}
              onChange={(e) => setSelectedBlockingOnly(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Show Milestone Blockers Only (Urgent Clearances)
            </span>
          </label>

          <span className="text-slate-500 font-mono text-[11px]">
            Statutory Governing Act: Tamil Nadu Highways Act 2001 (TN Act 34/2002)
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Combined Land & Utility Overview KPI Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Required Land</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {((landKpis?.total_required_sqm ?? 185500) / 1000).toFixed(1)}k m²
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">50 Parcels</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Possession Handed</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {landKpis?.overall_acquisition_pct ?? 67.0}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {((landKpis?.acquired_possession_sqm ?? 124300) / 1000).toFixed(1)}k m² Handed Over
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Land</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {((landKpis?.pending_acquisition_sqm ?? 61200) / 1000).toFixed(1)}k m²
          </div>
          <div className="text-[11px] text-amber-500 mt-0.5">In Acquisition Pipe</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Awards Passed</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{landKpis?.awards_passed_count ?? 38}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sec 19(1) Pronounced</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Compensation Paid</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            ₹{landKpis?.compensation_disbursed_cr ?? 18.20} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            of ₹{landKpis?.compensation_assessed_cr ?? 24.50} Cr
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-rose-500">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Comp. Pending</div>
          <div className="text-xl font-bold text-rose-700 mt-1">
            ₹{landKpis?.compensation_pending_cr ?? 6.30} Cr
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">Treasury Disbursal Lag</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Utility Assets</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{utilityKpis?.total_utility_assets ?? 25}</div>
          <div className="text-[11px] text-blue-500 mt-0.5">
            {utilityKpis?.tangedco_poles_count ?? 128} Poles / Lines
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Utility Shifted</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {utilityKpis?.shifting_completion_pct ?? 44.0}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {utilityKpis?.shiftings_completed ?? 11} / {utilityKpis?.total_utility_assets ?? 25} Done
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AI Land & Utility Bottleneck Intelligence */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-700/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                AI Land Acquisition & Utility Relocation Intelligence
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Automated detection of critical path milestone impediments, compensation Treasury disbursement lags, and electrical shutdown synchronization.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('walkthrough')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4" />
            View SH-15 Ooty Ghat Demonstration Scenario
          </button>
        </div>

        {/* AI Findings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {aiFindings.slice(0, 3).map((f) => (
            <div
              key={f.id}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex flex-col justify-between hover:bg-white/15 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
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
                  <span>Critical Delay:</span>
                  <span className="font-semibold text-rose-300">+{f.delay_impact_days} Days</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Exposure Amount:</span>
                  <span className="font-semibold text-amber-300">₹{f.cost_impact_cr.toFixed(2)} Cr</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-emerald-300 font-semibold">Action:</span> {f.recommended_action}
                </div>
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
            onClick={() => setActiveTab('parcels')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'parcels'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            Land Parcel Register ({parcels.length})
          </button>

          <button
            onClick={() => setActiveTab('utilities')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'utilities'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            Utility Shifting Register ({utilities.length})
          </button>

          <button
            onClick={() => setActiveTab('gis')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'gis'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            GIS & Spatial Map Explorer ({mapPoints.length} Locations)
          </button>

          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`py-3.5 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'walkthrough'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            SH-15 Demonstration Scenario Walkthrough
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Tab Content */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* TAB 1: Land Parcel Register */}
        {activeTab === 'parcels' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Land Parcel Register ({filteredParcels.length} Records)
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Statutory tracking under Tamil Nadu Highways Act 2001
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Parcel Reference</th>
                    <th className="py-3 px-3">Project & Village</th>
                    <th className="py-3 px-3">Survey & Pattadar</th>
                    <th className="py-3 px-3">Area (m²)</th>
                    <th className="py-3 px-3">Statutory Stage</th>
                    <th className="py-3 px-3">Compensation (₹ Cr)</th>
                    <th className="py-3 px-3">Possession</th>
                    <th className="py-3 px-3">Milestone Blocker</th>
                    <th className="py-3 px-3 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredParcels.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No land parcels found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredParcels.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-emerald-800">{p.parcel_reference}</div>
                          {p.has_litigation && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              COURT DISPUTE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{p.project_code}</div>
                          <div className="text-[11px] text-slate-600">
                            {p.village}, {p.district}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono font-semibold text-slate-900">S.No. {p.survey_number}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{p.landowner_name}</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{p.total_land_sqm.toLocaleString()} m²</div>
                          <div className="text-[10px] text-slate-500">
                            Pvt: {p.private_land_sqm} | Govt: {p.govt_land_sqm}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {p.acquisition_stage}
                          </span>
                          <div className="text-[9px] text-slate-400 mt-0.5">{p.legal_provision.slice(0, 24)}...</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">₹{p.compensation_assessed_cr.toFixed(2)} Cr</div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                              p.compensation_status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.compensation_status === 'DISPUTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.compensation_status}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.possession_status === 'POSSESSION_HANDED_OVER'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.possession_status === 'POSSESSION_HANDED_OVER' ? 'HANDED OVER' : 'PENDING'}
                          </span>
                          {p.possession_date && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.possession_date}</div>
                          )}
                        </td>

                        <td className="py-3 px-3 max-w-[160px]">
                          {p.blocking_project_milestone ? (
                            <div className="text-[10px] text-rose-700 font-medium flex items-start gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{p.blocking_project_milestone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Clear
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedParcelForWorkflow(p);
                              setWfNewStage(p.acquisition_stage);
                              setWfPossessionStatus(p.possession_status);
                              setWfPossessionDate(p.possession_date || '2026-02-15');
                              setWfCompensationStatus(p.compensation_status);
                              setWfCompensationAmount(p.compensation_assessed_cr);
                              setWfPaymentRef('TREASURY-CHQ-2026-001');
                              setWfDocRef('POSSESSION-CERT-2026-01');
                              setWfRemarks('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                          >
                            Advance
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

        {/* TAB 2: Utility Shifting Register */}
        {activeTab === 'utilities' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Utility Shifting Register ({filteredUtilities.length} Records)
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Multi-agency relocations across TANGEDCO, TWAD, Telecom & Municipal agencies
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3">Code & Category</th>
                    <th className="py-3 px-3">Project & Location</th>
                    <th className="py-3 px-3">Owning Agency</th>
                    <th className="py-3 px-3">Assets & Cost</th>
                    <th className="py-3 px-3">Work Order Status</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Milestone Blocker</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredUtilities.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No utility shifting records found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUtilities.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-blue-700">{u.utility_code}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{u.utility_category}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{u.project_code}</div>
                          <div className="text-[11px] text-slate-600">{u.location_chainage}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{u.owning_agency}</div>
                          {u.contact_officer && (
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                              {u.contact_officer}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{u.affected_assets_count} Units</div>
                          <div className="text-[10px] text-slate-500">Cost: ₹{u.approved_cost_cr.toFixed(2)} Cr</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.work_order_status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.work_order_status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.work_order_status}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  u.physical_shifting_progress_pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${u.physical_shifting_progress_pct}%` }}
                              ></div>
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              {u.physical_shifting_progress_pct}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.verification_status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {u.verification_status}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-[150px]">
                          {u.blocking_milestone ? (
                            <div className="text-[10px] text-rose-700 font-medium flex items-start gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{u.blocking_milestone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Clear
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedUtilityForWorkflow(u);
                              setUtlWorkOrderStatus(u.work_order_status);
                              setUtlProgressPct(u.physical_shifting_progress_pct);
                              setUtlVerificationStatus(u.verification_status);
                              setUtlVerifyingEngineer('Er. R. Venkatesh (AEE)');
                              setUtlInspectionDocRef('HIGHWAYS-JIR-VERIF-412');
                              setUtlRemarks('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            Update
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

        {/* TAB 3: GIS & Spatial Map Explorer */}
        {activeTab === 'gis' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">GIS Spatial Corridor & Clearance Map</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual mapping of land parcels and utility assets with blocking status across Tamil Nadu corridors.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Milestone Blocker
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> In Progress
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Verified & Cleared
                </span>
              </div>
            </div>

            {/* Spatial Grid Canvas Simulation */}
            <div className="bg-slate-50 rounded-xl p-6 min-h-[420px] relative overflow-hidden flex flex-col justify-between border border-slate-200 text-slate-800 shadow-2xs">
              {/* Background Map Grid */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-slate-900">Spatial View: Tamil Nadu State Highway Corridors</span>
                </div>
                <div className="font-mono text-slate-500">Bounding Box: 8.08° N to 13.50° N, 76.24° E to 80.34° E</div>
              </div>

              {/* Map Points Scatter */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 py-6">
                {mapPoints.slice(0, 12).map((pt) => (
                  <button
                    key={`${pt.type}-${pt.id}`}
                    onClick={() => setSelectedMapPoint(pt)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      pt.is_blocking
                        ? 'bg-rose-950/60 border-rose-500/50 hover:border-rose-400 text-white'
                        : pt.status.includes('PROGRESS') || pt.status.includes('PENDING')
                        ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400 text-white'
                        : 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-300">{pt.reference}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          pt.is_blocking ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {pt.type === 'LAND_PARCEL' ? 'PARCEL' : 'UTILITY'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold truncate text-white">{pt.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      GPS: {pt.lat.toFixed(4)}° N, {pt.lng.toFixed(4)}° E
                    </div>
                    {pt.is_blocking && (
                      <div className="text-[10px] text-rose-300 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Blocker Active</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="relative z-10 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div>Click any spatial pin above to inspect geo-coordinate coordinates and statutory record details.</div>
                <div className="font-mono text-emerald-400">Total {mapPoints.length} Geocoded Assets</div>
              </div>
            </div>

            {/* Selected Map Point Detail Drawer */}
            {selectedMapPoint && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{selectedMapPoint.reference}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {selectedMapPoint.category}
                    </span>
                    {selectedMapPoint.is_blocking && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Critical Milestone Blocker
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{selectedMapPoint.title}</div>
                  <div className="text-slate-600">
                    <strong>Project:</strong> {selectedMapPoint.project_code} ({selectedMapPoint.project_title})
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Geo Coordinates: {selectedMapPoint.lat}° N, {selectedMapPoint.lng}° E • Status: {selectedMapPoint.status}
                  </div>
                  {selectedMapPoint.blocking_description && (
                    <div className="text-rose-700 font-medium text-xs mt-1">
                      <strong>Impediment Details:</strong> {selectedMapPoint.blocking_description}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMapPoint(null)}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Demonstration Scenario Walkthrough (Section 12) */}
        {activeTab === 'walkthrough' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                PROMPT 05 • SECTION 12 DEMONSTRATION SCENARIO
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                CKICP SH-15 Ooty-Gudalur Ghat Corridor Multi-Agency Clearance Bottleneck
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Demonstration of interconnected Land Acquisition (LA-SH15-01), Utility Relocation (UTL-SH15-001), Department Dependencies (DEP-SH15-001/002) and Secretary Escalation.
              </p>
            </div>

            {/* Stepper / Timeline of the Interlock */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Project Context</h3>
                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <div><strong>Project:</strong> PRJ-CKICP-001</div>
                    <div><strong>Package:</strong> PKG-EPC-01 (Km 0/0 - 24/0)</div>
                    <div><strong>Contractor:</strong> KCP Infra Fictional Ltd</div>
                    <div><strong>Corridor:</strong> SH-15 Ooty - Gudalur Ghat</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-blue-700 font-semibold">
                  World Bank & State Funded
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-rose-900">Land Acquisition Lag</h3>
                  <div className="text-xs text-rose-800 mt-2 space-y-1">
                    <div><strong>Parcel:</strong> LA-SH15-01 (Pykara)</div>
                    <div><strong>Award 19(1):</strong> ₹0.85 Cr Passed</div>
                    <div><strong>Compensation:</strong> Disbursal Pending 48d</div>
                    <div><strong>Blocked Milestone:</strong> Embankment Formation Km 14+200</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-rose-200 text-[11px] text-rose-700 font-semibold">
                  Dependency DEP-SH15-001
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-amber-900">Utility Pole Shifting</h3>
                  <div className="text-xs text-amber-800 mt-2 space-y-1">
                    <div><strong>Utility:</strong> UTL-SH15-001</div>
                    <div><strong>Assets:</strong> 48 TANGEDCO 11kV Poles</div>
                    <div><strong>Cost:</strong> ₹0.42 Cr Sanctioned</div>
                    <div><strong>Issue:</strong> Feeder Shutdown Pending 22d</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] text-amber-700 font-semibold">
                  Dependency DEP-SH15-002
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs mb-3">
                    4
                  </div>
                  <h3 className="text-sm font-bold text-purple-900">Secretary Resolution</h3>
                  <div className="text-xs text-purple-800 mt-2 space-y-1">
                    <div><strong>AI Alert:</strong> DAIF-SH15-001</div>
                    <div><strong>Escalation:</strong> Principal Secretary</div>
                    <div><strong>Meeting:</strong> Highways ↔ Revenue ↔ TANGEDCO</div>
                    <div><strong>Status:</strong> Joint Resolution In Progress</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-200 text-[11px] text-purple-700 font-semibold">
                  Multi-Agency Interlock
                </div>
              </div>
            </div>

            {/* Interactive Scenario Action Bar */}
            <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-200 shadow-2xs border-l-4 border-l-[#20242B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Secretary Executive Intervention Decision
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Simulate Secretary-level coordination order: Authorize District Treasury Ooty to release ₹0.85 Cr voucher and mandate TANGEDCO Gudalur 66kV substation feeder shutdown on upcoming Sunday.
                </p>
              </div>

              <button
                onClick={() => {
                  alert(
                    'Coordination Order Dispatched!\n\n1. Revenue Treasury Voucher release notified to Special DRO Ooty (LA-SH15-01).\n2. TANGEDCO Superintending Engineer notified for Sunday feeder shutdown (UTL-SH15-001).\n3. Audit log recorded under Section 12 Demonstration Scenario.'
                  );
                }}
                className="px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors whitespace-nowrap shadow-md"
              >
                Execute Coordination Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL 1: Land Parcel Workflow Modal */}
      {selectedParcelForWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                  {selectedParcelForWorkflow.parcel_reference}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Advance Land Acquisition Stage</h3>
              </div>
              <button
                onClick={() => setSelectedParcelForWorkflow(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div><strong>Survey No:</strong> {selectedParcelForWorkflow.survey_number} ({selectedParcelForWorkflow.village}, {selectedParcelForWorkflow.district})</div>
              <div><strong>Pattadar:</strong> {selectedParcelForWorkflow.landowner_name}</div>
              <div><strong>Area:</strong> {selectedParcelForWorkflow.total_land_sqm} m² (Private: {selectedParcelForWorkflow.private_land_sqm} m²)</div>
              <div><strong>Assessed Award:</strong> ₹{selectedParcelForWorkflow.compensation_assessed_cr.toFixed(2)} Cr</div>
            </div>

            {wfErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{wfErrorMsg}</span>
              </div>
            )}
            {wfSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{wfSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleParcelWorkflowSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Statutory Stage</label>
                <select
                  value={wfNewStage}
                  onChange={(e) => setWfNewStage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Notification 15(2)">Notification 15(2) - Notice Published</option>
                  <option value="Gazette 15(1)">Gazette 15(1) - Declaration in Gazette</option>
                  <option value="Award 19(1)">Award 19(1) - Compensation Determined</option>
                  <option value="Handover">Handover - Physical Possession Delivered</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Compensation Status</label>
                <select
                  value={wfCompensationStatus}
                  onChange={(e) => setWfCompensationStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PENDING">PENDING - Awaiting Treasury Release</option>
                  <option value="PAID">PAID - Treasury Cheque / ECS Disbursed</option>
                  <option value="DISPUTED">DISPUTED - Referred to LA Court Sec 20</option>
                </select>
              </div>

              {wfCompensationStatus === 'PAID' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Treasury Payment Voucher Ref *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TREASURY-CHQ-2026-4412"
                    value={wfPaymentRef}
                    onChange={(e) => setWfPaymentRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Possession Handover Status</label>
                <select
                  value={wfPossessionStatus}
                  onChange={(e) => setWfPossessionStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PENDING_POSSESSION">PENDING_POSSESSION - Land not yet delivered</option>
                  <option value="POSSESSION_HANDED_OVER">POSSESSION_HANDED_OVER - Physical handover complete</option>
                </select>
              </div>

              {wfPossessionStatus === 'POSSESSION_HANDED_OVER' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Handover Date *</label>
                    <input
                      type="date"
                      required
                      value={wfPossessionDate}
                      onChange={(e) => setWfPossessionDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Possession Certificate Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. POSSESSION-CERT-2026-01"
                      value={wfDocRef}
                      onChange={(e) => setWfDocRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Revenue Officer Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Record verification notes, patta transfer, or consent details..."
                  value={wfRemarks}
                  onChange={(e) => setWfRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedParcelForWorkflow(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wfSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {wfSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Record Statutory Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Utility Workflow Modal */}
      {selectedUtilityForWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {selectedUtilityForWorkflow.utility_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Update Utility Shifting Progress</h3>
              </div>
              <button
                onClick={() => setSelectedUtilityForWorkflow(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div><strong>Project:</strong> {selectedUtilityForWorkflow.project_code}</div>
              <div><strong>Agency:</strong> {selectedUtilityForWorkflow.owning_agency}</div>
              <div><strong>Assets:</strong> {selectedUtilityForWorkflow.affected_assets_count} Units ({selectedUtilityForWorkflow.location_chainage})</div>
              <div><strong>Cost:</strong> ₹{selectedUtilityForWorkflow.approved_cost_cr.toFixed(2)} Cr</div>
            </div>

            {utlErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{utlErrorMsg}</span>
              </div>
            )}
            {utlSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{utlSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUtilityWorkflowSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Order Status</label>
                <select
                  value={utlWorkOrderStatus}
                  onChange={(e) => setUtlWorkOrderStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NOT_STARTED">NOT_STARTED</option>
                  <option value="ESTIMATE_PREPARED">ESTIMATE_PREPARED</option>
                  <option value="APPROVED">APPROVED - Work Order Issued</option>
                  <option value="IN_PROGRESS">IN_PROGRESS - Physical Shifting Active</option>
                  <option value="COMPLETED">COMPLETED - Shifting Finished</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Physical Progress (%)</span>
                  <span className="font-mono font-bold text-blue-700">{utlProgressPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={utlProgressPct}
                  onChange={(e) => setUtlProgressPct(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department Engineer Verification</label>
                <select
                  value={utlVerificationStatus}
                  onChange={(e) => setUtlVerificationStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UNVERIFIED">UNVERIFIED - Awaiting Site Inspection</option>
                  <option value="VERIFIED">VERIFIED - Inspected and Certified</option>
                </select>
              </div>

              {utlVerificationStatus === 'VERIFIED' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Verifying Engineer *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Er. R. Venkatesh (AEE)"
                      value={utlVerifyingEngineer}
                      onChange={(e) => setUtlVerifyingEngineer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Inspection Certificate Ref *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HIGHWAYS-JIR-VERIF-412"
                      value={utlInspectionDocRef}
                      onChange={(e) => setUtlInspectionDocRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Field Inspection Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Record shutdown details, clearance certification, or route inspection notes..."
                  value={utlRemarks}
                  onChange={(e) => setUtlRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUtilityForWorkflow(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={utlSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {utlSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Update Utility Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
