import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LandLitigationOverview,
  LandLitigationParcelItem,
  Parcel360Dossier,
  LitigationCaseItem,
  RevenueCoordinationItem,
  AdvocateMonitoringRecord,
  SiteBlockerItem,
  FinancialExposureDashboard,
  FinancialExposureItem,
  PreConstructionRiskAssessmentItem,
  LandLitigationResolutionActionItem,
  LandLitigationAIResponse
} from '../types';
import {
  Scale,
  MapPin,
  FileText,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building2,
  UserCheck,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
  Gavel,
  Briefcase,
  AlertOctagon,
  FileCheck2,
  Lock,
  Unlock,
  Eye,
  Send,
  Flag
} from 'lucide-react';

export const LandLitigationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview_parcels' | 'litigation' | 'revenue' | 'advocate' | 'blockers' | 'financial' | 'resolutions'
  >('overview_parcels');

  // Loading & Refreshing
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Overview Data
  const [overview, setOverview] = useState<LandLitigationOverview | null>(null);

  // Tab A: Parcels & Parcel 360
  const [parcels, setParcels] = useState<LandLitigationParcelItem[]>([]);
  const [parcelTotal, setParcelTotal] = useState<number>(0);
  const [parcelSearch, setParcelSearch] = useState<string>('');
  const [parcelStageFilter, setParcelStageFilter] = useState<string>('');
  const [parcelCriticalFilter, setParcelCriticalFilter] = useState<boolean | undefined>(undefined);
  const [parcelLitigationFilter, setParcelLitigationFilter] = useState<boolean | undefined>(undefined);
  const [selectedParcelId, setSelectedParcelId] = useState<number | null>(null);
  const [parcel360Dossier, setParcel360Dossier] = useState<Parcel360Dossier | null>(null);
  const [loading360, setLoading360] = useState<boolean>(false);

  // Tab B: Litigation
  const [litigationCases, setLitigationCases] = useState<LitigationCaseItem[]>([]);
  const [litigationSearch, setLitigationSearch] = useState<string>('');
  const [litigationCaseType, setLitigationCaseType] = useState<string>('');
  const [litigationWorkRestricted, setLitigationWorkRestricted] = useState<boolean | undefined>(undefined);

  // Tab C: Revenue Coordination
  const [revenueRequests, setRevenueRequests] = useState<RevenueCoordinationItem[]>([]);
  const [revenueOverdueOnly, setRevenueOverdueOnly] = useState<boolean>(false);
  const [revenueTypeFilter, setRevenueTypeFilter] = useState<string>('');
  const [showNewRevenueModal, setShowNewRevenueModal] = useState<boolean>(false);
  const [newRevenueForm, setNewRevenueForm] = useState({
    project_id: 1,
    request_type: 'FMB_SUBDIVISION_UPDATE',
    district: 'Chengalpattu',
    taluk: 'Tambaram',
    village: 'Vandalur',
    subdivision_target: 'Survey 142/2A Patta Transfer',
    subdivision_survey_number: '142/2A',
    revenue_officer_designation: 'Tahsildar (Land Acquisition)',
    revenue_office_location: 'Tambaram Taluk Office',
    statutory_due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    remarks: 'Expedited processing for Highway Corridor widening.'
  });

  // Tab D: Advocate Monitoring
  const [advocateRecords, setAdvocateRecords] = useState<AdvocateMonitoringRecord[]>([]);
  const [advocateAlertsOnly, setAdvocateAlertsOnly] = useState<boolean>(false);

  // Tab E: Site Blockers
  const [blockers, setBlockers] = useState<SiteBlockerItem[]>([]);
  const [blockerGateFilter, setBlockerGateFilter] = useState<string>('');
  const [blockerCriticalFilter, setBlockerCriticalFilter] = useState<boolean | undefined>(undefined);

  // Tab F: Financial Exposure
  const [financialData, setFinancialData] = useState<FinancialExposureDashboard | null>(null);

  // Tab G: Resolutions
  const [resolutions, setResolutions] = useState<LandLitigationResolutionActionItem[]>([]);
  const [showNewActionModal, setShowNewActionModal] = useState<boolean>(false);
  const [newActionForm, setNewActionForm] = useState({
    project_id: 1,
    title: '',
    action_type: 'REVENUE_ESCORT',
    assigned_to_officer: 'Special DRO (LA)',
    assigned_to_role: 'District Revenue Officer',
    escalation_level: 'DRO',
    target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  // Pre-Construction Risk Assessment Modal
  const [showPreConstructionModal, setShowPreConstructionModal] = useState<boolean>(false);
  const [preConstructionAssessments, setPreConstructionAssessments] = useState<PreConstructionRiskAssessmentItem[]>([]);
  const [selectedAssessmentForOverride, setSelectedAssessmentForOverride] = useState<PreConstructionRiskAssessmentItem | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    authority: 'Chief Engineer (Highways)',
    justification: ''
  });
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Grounded Ask AI Drawer
  const [showAIDrawer, setShowAIDrawer] = useState<boolean>(false);
  const [aiQuery, setAIQuery] = useState<string>('');
  const [aiLoading, setAILoading] = useState<boolean>(false);
  const [aiResponse, setAIResponse] = useState<LandLitigationAIResponse | null>(null);

  // Pre-set AI Domain Prompts
  const canonicalPrompts = [
    'Which projects have active court stays blocking the critical path?',
    'Identify all Revenue Department requests overdue by more than 30 days.',
    'Show financial exposure breakdown for Chennai-Kanyakumari corridor.',
    'List parcels where compensation is deposited but possession is not taken.',
    'Which cases have missed the counter-affidavit filing deadline?',
    'What are the unencumbered land percentages before contract handover?',
    'Summarise contractor idle plant claims disputed under Clause 10CA.',
    'Show inter-departmental blockers requiring Collector or DRO intervention.',
    'List all RED gate sites where contractor has mobilised prematurely.',
    'Provide audit summary of all pre-construction override decisions.'
  ];

  // Initial Load
  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      setErrorMsg(null);

      const [ovData, pData, litData, revData, advData, blkData, finData, resData] = await Promise.all([
        api.getLandLitigationOverview(),
        api.getLandLitigationParcels({ limit: 100 }),
        api.getLitigationCases(),
        api.getRevenueCoordination(),
        api.getAdvocateMonitoring(),
        api.getSiteBlockers(),
        api.getFinancialExposure(),
        api.getLandLitigationResolutions()
      ]);

      setOverview(ovData);
      setParcels(pData.items);
      setParcelTotal(pData.total);
      setLitigationCases(litData);
      setRevenueRequests(revData);
      setAdvocateRecords(advData);
      setBlockers(blkData);
      setFinancialData(finData);
      setResolutions(resData);
    } catch (err: any) {
      console.error('Failed to load Land & Litigation data', err);
      setErrorMsg(err?.message || 'Error fetching Land & Litigation Intelligence records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview_parcels', 'litigation', 'revenue', 'advocate', 'blockers', 'financial', 'resolutions'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    const prjParam = searchParams.get('project_id');
    if (prjParam) {
      const pId = parseInt(prjParam, 10);
      if (!isNaN(pId)) {
        // Find matching project title if parcels loaded
        const matched = parcels.find(p => p.project_id === pId);
        if (matched?.project_title) {
          setParcelSearch(matched.project_title.substring(0, 15));
          setLitigationSearch(matched.project_title.substring(0, 15));
        }
      }
    }
  }, [searchParams, parcels]);

  // Fetch Parcel 360 when selected
  useEffect(() => {
    if (selectedParcelId) {
      setLoading360(true);
      api.getParcel360(selectedParcelId)
        .then((res) => setParcel360Dossier(res))
        .catch((err) => console.error('Failed to fetch Parcel 360', err))
        .finally(() => setLoading360(false));
    } else {
      setParcel360Dossier(null);
    }
  }, [selectedParcelId]);

  // Handle KPI Card Clicks for Drill-down
  const handleKPIClick = (filterType: string) => {
    if (filterType === 'parcels_all') {
      setActiveTab('overview_parcels');
      setParcelStageFilter('');
      setParcelCriticalFilter(undefined);
      setParcelLitigationFilter(undefined);
    } else if (filterType === 'parcels_acquired') {
      setActiveTab('overview_parcels');
      setParcelStageFilter('POSSESSION_TAKEN');
    } else if (filterType === 'parcels_pending') {
      setActiveTab('overview_parcels');
      setParcelStageFilter('SECTION_15_2');
    } else if (filterType === 'litigation') {
      setActiveTab('litigation');
      setLitigationWorkRestricted(undefined);
    } else if (filterType === 'court_restrictions') {
      setActiveTab('litigation');
      setLitigationWorkRestricted(true);
    } else if (filterType === 'revenue_overdue') {
      setActiveTab('revenue');
      setRevenueOverdueOnly(true);
    } else if (filterType === 'forest_clearances') {
      setActiveTab('blockers');
      setBlockerGateFilter('');
    } else if (filterType === 'projects_blocked') {
      setActiveTab('blockers');
      setBlockerGateFilter('RED');
    } else if (filterType === 'critical_path') {
      setActiveTab('blockers');
      setBlockerCriticalFilter(true);
    } else if (filterType === 'financial_expenditure' || filterType === 'financial_exposure') {
      setActiveTab('financial');
    } else if (filterType === 'readiness_review') {
      openPreConstructionModal();
    }
  };

  // Open Pre-Construction Modal
  const openPreConstructionModal = async () => {
    setShowPreConstructionModal(true);
    try {
      const data = await api.getPreConstructionRiskAssessments();
      setPreConstructionAssessments(data);
    } catch (err) {
      console.error('Failed to load risk assessments', err);
    }
  };

  // Submit Pre-Construction Override
  const handleOverrideSubmit = async () => {
    if (!selectedAssessmentForOverride) return;
    if (selectedAssessmentForOverride.has_binding_legal_prohibition) {
      setOverrideError('STATUTORY VIOLATION: Cannot override binding court order or injunction.');
      return;
    }
    if (!overrideForm.justification.trim()) {
      setOverrideError('Justification is mandatory for audit record.');
      return;
    }

    try {
      setOverrideError(null);
      await api.overridePreConstructionAssessment(selectedAssessmentForOverride.id, {
        override_authority: overrideForm.authority,
        justification: overrideForm.justification
      });
      // Refresh assessments
      const updated = await api.getPreConstructionRiskAssessments();
      setPreConstructionAssessments(updated);
      setSelectedAssessmentForOverride(null);
      setOverrideForm({ authority: 'Chief Engineer (Highways)', justification: '' });
      fetchAllData();
    } catch (err: any) {
      setOverrideError(err?.message || 'Override failed');
    }
  };

  // Submit New Revenue Coordination Request
  const handleCreateRevenueRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRevenueCoordination(newRevenueForm);
      setShowNewRevenueModal(false);
      const revs = await api.getRevenueCoordination();
      setRevenueRequests(revs);
      fetchAllData();
    } catch (err: any) {
      alert(`Failed to create Revenue request: ${err.message}`);
    }
  };

  // Submit New Resolution Action
  const handleCreateResolutionAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createResolutionAction(newActionForm);
      setShowNewActionModal(false);
      const res = await api.getLandLitigationResolutions();
      setResolutions(res);
      fetchAllData();
    } catch (err: any) {
      alert(`Failed to create resolution action: ${err.message}`);
    }
  };

  // Update Resolution Action Status
  const handleUpdateActionStatus = async (id: number, status: string) => {
    try {
      await api.updateResolutionStatus(id, status, `Updated via Command Centre by ${user?.full_name || 'Officer'}`);
      const res = await api.getLandLitigationResolutions();
      setResolutions(res);
      fetchAllData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Execute Grounded AI Query
  const handleRunAIQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAILoading(true);
    setAIQuery(queryText);
    try {
      const resp = await api.queryLandLitigationAI(queryText);
      setAIResponse(resp);
    } catch (err: any) {
      console.error('AI query failed', err);
    } finally {
      setAILoading(false);
    }
  };

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (parcelSearch) {
        const s = parcelSearch.toLowerCase();
        const matches =
          p.parcel_reference.toLowerCase().includes(s) ||
          p.survey_number.toLowerCase().includes(s) ||
          p.village_name.toLowerCase().includes(s) ||
          p.taluk_name.toLowerCase().includes(s) ||
          p.district_name.toLowerCase().includes(s) ||
          (p.project_title && p.project_title.toLowerCase().includes(s));
        if (!matches) return false;
      }
      if (parcelStageFilter && p.acquisition_stage !== parcelStageFilter) return false;
      if (parcelCriticalFilter !== undefined && p.is_critical_path !== parcelCriticalFilter) return false;
      if (parcelLitigationFilter !== undefined && p.is_under_litigation !== parcelLitigationFilter) return false;
      return true;
    });
  }, [parcels, parcelSearch, parcelStageFilter, parcelCriticalFilter, parcelLitigationFilter]);

  // Filtered Litigation Cases
  const filteredLitigation = useMemo(() => {
    return litigationCases.filter((c) => {
      if (litigationSearch) {
        const s = litigationSearch.toLowerCase();
        const matches =
          c.case_code.toLowerCase().includes(s) ||
          c.court_case_number.toLowerCase().includes(s) ||
          c.petitioners.toLowerCase().includes(s) ||
          c.court_name.toLowerCase().includes(s) ||
          (c.project_title && c.project_title.toLowerCase().includes(s));
        if (!matches) return false;
      }
      if (litigationCaseType && c.case_type !== litigationCaseType) return false;
      if (litigationWorkRestricted !== undefined && c.work_restricted !== litigationWorkRestricted) return false;
      return true;
    });
  }, [litigationCases, litigationSearch, litigationCaseType, litigationWorkRestricted]);

  // Filtered Revenue Requests
  const filteredRevenue = useMemo(() => {
    return revenueRequests.filter((r) => {
      if (revenueOverdueOnly && !r.is_overdue) return false;
      if (revenueTypeFilter && r.request_type !== revenueTypeFilter) return false;
      return true;
    });
  }, [revenueRequests, revenueOverdueOnly, revenueTypeFilter]);

  // Filtered Blockers
  const filteredBlockers = useMemo(() => {
    return blockers.filter((b) => {
      if (blockerGateFilter && b.readiness_gate !== blockerGateFilter) return false;
      if (blockerCriticalFilter !== undefined && b.is_critical_path !== blockerCriticalFilter) return false;
      return true;
    });
  }, [blockers, blockerGateFilter, blockerCriticalFilter]);

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-600 font-medium text-sm">
          Loading Land Acquisition, Litigation & Site Blocker Intelligence Command Centre...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              HIGHWAYS & MINOR PORTS DEPT
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              SIMULATED DATA
            </span>
            <span className="text-xs text-gray-500">
              Updated: {overview?.data_freshness_timestamp ? new Date(overview.data_freshness_timestamp).toLocaleString('en-IN') : 'Live'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            <Scale className="w-7 h-7 text-emerald-700" />
            Land & Litigation Intelligence Command Centre
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-4xl">
            Unified statutory oversight of land acquisition (Clauses 15/19), Revenue administration, court litigation stays, advocate monitoring, site handover readiness gates, and financial exposure across Tamil Nadu Highways corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openPreConstructionModal()}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm font-medium transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Pre-Construction Gates
          </button>
          <button
            onClick={() => setShowAIDrawer(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            Ask Grounded AI
          </button>
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 12 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* 1. Total parcels required */}
        <div
          onClick={() => handleKPIClick('parcels_all')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Parcels</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">{overview?.total_parcels_required ?? '--'}</div>
          <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" /> Across 15 key projects
          </span>
        </div>

        {/* 2. Parcels acquired */}
        <div
          onClick={() => handleKPIClick('parcels_acquired')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Parcels Acquired</span>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{overview?.parcels_acquired ?? '--'}</div>
          <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Possession completed
          </span>
        </div>

        {/* 3. Parcels pending acquisition */}
        <div
          onClick={() => handleKPIClick('parcels_pending')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-amber-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Acquisition</span>
          <div className="text-2xl font-bold text-amber-700 mt-2">{overview?.parcels_pending_acquisition ?? '--'}</div>
          <span className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Stages: Sec 15(2) to Award
          </span>
        </div>

        {/* 4. Parcels under litigation */}
        <div
          onClick={() => handleKPIClick('litigation')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Parcels in Litigation</span>
          <div className="text-2xl font-bold text-indigo-700 mt-2">{overview?.parcels_under_litigation ?? '--'}</div>
          <span className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
            <Gavel className="w-3 h-3" /> High Court & Sub-Courts
          </span>
        </div>

        {/* 5. Parcels with court restrictions */}
        <div
          onClick={() => handleKPIClick('court_restrictions')}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-sm hover:border-red-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between bg-red-50/40"
        >
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center justify-between">
            Court Restrictions
            <Lock className="w-3 h-3 text-red-600" />
          </span>
          <div className="text-2xl font-bold text-red-700 mt-2">{overview?.parcels_with_court_restrictions ?? '--'}</div>
          <span className="text-xs text-red-600 mt-1 font-medium">Active Injunction/Stay</span>
        </div>

        {/* 6. Revenue Dept responses overdue */}
        <div
          onClick={() => handleKPIClick('revenue_overdue')}
          className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between bg-orange-50/30"
        >
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Revenue Overdue</span>
          <div className="text-2xl font-bold text-orange-700 mt-2">{overview?.revenue_dept_responses_overdue ?? '--'}</div>
          <span className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Over 30-day statutory SLA
          </span>
        </div>

        {/* 7. Forest/statutory clearances pending */}
        <div
          onClick={() => handleKPIClick('forest_clearances')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Forest / Clearances</span>
          <div className="text-2xl font-bold text-gray-800 mt-2">{overview?.forest_statutory_clearances_pending ?? '--'}</div>
          <span className="text-xs text-gray-500 mt-1">Stage-I / DFO / Wildlife</span>
        </div>

        {/* 8. Projects blocked by land */}
        <div
          onClick={() => handleKPIClick('projects_blocked')}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-sm hover:border-red-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between bg-red-50/20"
        >
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider">Projects Blocked</span>
          <div className="text-2xl font-bold text-red-700 mt-2">{overview?.projects_blocked_by_land ?? '--'}</div>
          <span className="text-xs text-red-600 mt-1 font-medium">Land & Legal Hold</span>
        </div>

        {/* 9. Projects blocked on critical path */}
        <div
          onClick={() => handleKPIClick('critical_path')}
          className="bg-white p-4 rounded-xl border border-red-300 shadow-sm hover:border-red-600 hover:shadow-md cursor-pointer transition flex flex-col justify-between bg-red-100/40"
        >
          <span className="text-xs font-semibold text-red-900 uppercase tracking-wider flex items-center justify-between">
            Critical Path
            <AlertOctagon className="w-3 h-3 text-red-600" />
          </span>
          <div className="text-2xl font-bold text-red-800 mt-2">{overview?.projects_blocked_on_critical_path ?? '--'}</div>
          <span className="text-xs text-red-700 mt-1 font-semibold">Immediate Delay Risk</span>
        </div>

        {/* 10. Actual additional expenditure */}
        <div
          onClick={() => handleKPIClick('financial_expenditure')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual Addl Cost</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ₹{overview?.actual_additional_expenditure_cr ?? '--'} <span className="text-xs font-normal text-gray-500">Cr</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Claims, idle plant & legal</span>
        </div>

        {/* 11. Estimated future financial exposure */}
        <div
          onClick={() => handleKPIClick('financial_exposure')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Forecast Exposure</span>
          <div className="text-2xl font-bold text-indigo-800 mt-2">
            ₹{overview?.estimated_future_financial_exposure_cr ?? '--'} <span className="text-xs font-normal text-gray-500">Cr</span>
          </div>
          <span className="text-xs text-indigo-600 mt-1">Escalation & Claims Risk</span>
        </div>

        {/* 12. Sites requiring stop-work/readiness review */}
        <div
          onClick={() => handleKPIClick('readiness_review')}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-sm hover:border-red-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between bg-red-50/50"
        >
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider">Readiness Review</span>
          <div className="text-2xl font-bold text-red-700 mt-2">{overview?.sites_requiring_stop_work_or_readiness_review ?? '--'}</div>
          <span className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Stop-Work Required
          </span>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview_parcels')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'overview_parcels'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Tab A: Land Acquisition & Parcel 360
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
              {parcelTotal}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('litigation')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'litigation'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Gavel className="w-4 h-4" />
            Tab B: Litigation & Court Cases
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
              {litigationCases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'revenue'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Tab C: Revenue Coordination
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${revenueRequests.some(r => r.is_overdue) ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-gray-100 text-gray-700'}`}>
              {revenueRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('advocate')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'advocate'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Tab D: Advocate & Legal Cell
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
              {advocateRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blockers')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'blockers'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            Tab E: Site Blockers & Readiness Gates
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 font-semibold">
              {blockers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'financial'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Tab F: Financial Exposure
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
              No Double Count
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolutions')}
            className={`px-5 py-3.5 whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
              activeTab === 'resolutions'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Tab G: Resolution & Escalation
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
              {resolutions.length}
            </span>
          </button>
        </div>

        {/* TAB A: LAND ACQUISITION & PARCEL 360 */}
        {activeTab === 'overview_parcels' && (
          <div className="p-6 space-y-6">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by survey no, village, taluk, district, or project..."
                    value={parcelSearch}
                    onChange={(e) => setParcelSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={parcelStageFilter}
                  onChange={(e) => setParcelStageFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All Acquisition Stages</option>
                  <option value="SECTION_15_2">Section 15(2) Notice Published</option>
                  <option value="SECTION_15_1">Section 15(1) Gazette Notification</option>
                  <option value="AWARD_ENQUIRY">Award Enquiry</option>
                  <option value="AWARD_PASSED">Award Passed</option>
                  <option value="COMPENSATION_DEPOSITED">Compensation Deposited</option>
                  <option value="POSSESSION_TAKEN">Possession Taken</option>
                  <option value="SITE_HANDED_OVER">Site Handed Over</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParcelCriticalFilter(parcelCriticalFilter === true ? undefined : true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    parcelCriticalFilter === true
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Critical Path Only
                </button>
                <button
                  onClick={() => setParcelLitigationFilter(parcelLitigationFilter === true ? undefined : true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    parcelLitigationFilter === true
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Under Litigation Only
                </button>
              </div>
            </div>

            {/* Parcels Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Parcel Reference</th>
                    <th className="px-4 py-3">Survey & Subdivision</th>
                    <th className="px-4 py-3">Village / Taluk / District</th>
                    <th className="px-4 py-3">Chainage</th>
                    <th className="px-4 py-3">Extent (Ha)</th>
                    <th className="px-4 py-3">Acquisition Stage</th>
                    <th className="px-4 py-3">Status Badges</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParcels.map((parcel) => (
                    <tr
                      key={parcel.id}
                      className={`hover:bg-gray-50 transition cursor-pointer ${
                        selectedParcelId === parcel.id ? 'bg-emerald-50/60' : ''
                      }`}
                      onClick={() => setSelectedParcelId(parcel.id)}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {parcel.parcel_reference}
                        <div className="text-xs text-gray-500 font-normal truncate max-w-xs">
                          {parcel.project_title || `Project #${parcel.project_id}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">{parcel.survey_number}</span>
                        {parcel.subdivision_number && (
                          <span className="text-xs text-gray-500"> / {parcel.subdivision_number}</span>
                        )}
                        <div className="text-xs text-gray-400 capitalize">{parcel.classification}</div>
                      </td>
                      <td className="px-4 py-3">
                        {parcel.village_name}, {parcel.taluk_name}
                        <div className="text-xs text-gray-500 font-semibold">{parcel.district_name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        km {parcel.chainage_start_km} - km {parcel.chainage_end_km}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {parcel.extent_hectares} Ha
                        <div className="text-[10px] text-gray-400">{parcel.extent_sq_meters.toLocaleString()} sq.m</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {parcel.acquisition_stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {parcel.has_work_restriction && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              <Lock className="w-2.5 h-2.5 mr-0.5" /> STAY / RESTRICTED
                            </span>
                          )}
                          {parcel.is_critical_path && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              CRITICAL PATH
                            </span>
                          )}
                          {parcel.possession_taken ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              POSSESSION TAKEN
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                              PENDING POSSESSION
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParcelId(parcel.id);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredParcels.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No land parcels match the specified search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Slide-over Drawer for Parcel 360 Dossier */}
            {selectedParcelId && (
              <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
                <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Parcel 360° Dossier: {parcel360Dossier?.parcel.parcel_reference}
                        </h2>
                        <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {parcel360Dossier?.parcel.simulated_data_badge || 'SIMULATED DATA'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedParcelId(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loading360 ? (
                    <div className="flex items-center justify-center p-16">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  ) : parcel360Dossier ? (
                    <div className="p-6 space-y-6 text-sm">
                      {/* Statutory Guard Alert if Work Restricted */}
                      {parcel360Dossier.parcel.has_work_restriction && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                          <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-800">BINDING WORK RESTRICTION ACTIVE</h4>
                            <p className="text-xs text-red-700 mt-1">
                              An active judicial injunction or stay restricts possession and construction on this parcel. Handover to contractor is strictly prohibited under High Court directions.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Basic details grid */}
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Project</span>
                          <p className="font-semibold text-gray-900 mt-0.5">
                            {parcel360Dossier.parcel.project_title || `Project #${parcel360Dossier.parcel.project_id}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Survey & Subdivision</span>
                          <p className="font-semibold text-gray-900 mt-0.5">
                            {parcel360Dossier.parcel.survey_number} {parcel360Dossier.parcel.subdivision_number ? `/ ${parcel360Dossier.parcel.subdivision_number}` : ''}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Revenue Jurisdiction</span>
                          <p className="font-medium text-gray-800 mt-0.5">
                            {parcel360Dossier.parcel.village_name}, {parcel360Dossier.parcel.taluk_name}, {parcel360Dossier.parcel.district_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Corridor Chainage</span>
                          <p className="font-medium text-gray-800 mt-0.5">
                            km {parcel360Dossier.parcel.chainage_start_km} to km {parcel360Dossier.parcel.chainage_end_km}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Extent</span>
                          <p className="font-medium text-gray-800 mt-0.5">
                            {parcel360Dossier.parcel.extent_hectares} Hectares ({parcel360Dossier.parcel.extent_sq_meters.toLocaleString()} sq.m)
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Classification</span>
                          <p className="font-medium text-gray-800 mt-0.5 capitalize">
                            {parcel360Dossier.parcel.classification}
                          </p>
                        </div>
                      </div>

                      {/* Compensation status */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Compensation Determination</h4>
                        <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <div>
                            <span className="text-xs text-gray-500">Determined</span>
                            <p className="text-base font-bold text-gray-900 mt-0.5">
                              ₹{parcel360Dossier.parcel.compensation_determined_cr ?? 0} Cr
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Deposited</span>
                            <p className="text-base font-bold text-indigo-700 mt-0.5">
                              ₹{parcel360Dossier.parcel.compensation_deposited_cr ?? 0} Cr
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Disbursed</span>
                            <p className="text-base font-bold text-emerald-700 mt-0.5">
                              ₹{parcel360Dossier.parcel.compensation_disbursed_cr ?? 0} Cr
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Workflow Milestones */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Acquisition Milestones</h4>
                        <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-white">
                          {parcel360Dossier.workflow_milestones.map((m) => (
                            <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-none">
                              <span className="font-medium text-gray-800 flex items-center gap-1.5">
                                {m.is_completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                {m.milestone_name}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${m.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                {m.is_completed ? (m.actual_date ? new Date(m.actual_date).toLocaleDateString() : 'COMPLETED') : 'PENDING'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Linked Litigation Cases */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Linked Court Cases ({parcel360Dossier.linked_litigation_cases.length})</h4>
                        {parcel360Dossier.linked_litigation_cases.length > 0 ? (
                          <div className="space-y-2">
                            {parcel360Dossier.linked_litigation_cases.map((c) => (
                              <div key={c.id} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-indigo-900">{c.case_code} — {c.court_case_number}</span>
                                  {c.work_restricted && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                                      ACTIVE STAY
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700">{c.court_name} | {c.case_type}</p>
                                <p className="text-gray-600 italic">Dispute: {c.dispute_nature}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No court litigation registered for this parcel.</p>
                        )}
                      </div>

                      {/* Linked Revenue Requests */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Revenue Department Coordination ({parcel360Dossier.revenue_requests.length})</h4>
                        {parcel360Dossier.revenue_requests.length > 0 ? (
                          <div className="space-y-2">
                            {parcel360Dossier.revenue_requests.map((r) => (
                              <div key={r.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-gray-900">{r.request_reference}</span>
                                  <p className="text-gray-600">{r.request_type} - {r.subdivision_target}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.days_overdue > 0 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {r.days_overdue > 0 ? `${r.days_overdue}d Overdue` : r.request_status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No pending revenue coordination requests.</p>
                        )}
                      </div>

                      {/* Universal Connected Records */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Connected Knowledge Graph</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5">
                          {parcel360Dossier.universal_relationships?.map((rel, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                              <span className="font-semibold text-emerald-700">{rel.relation_type}</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="font-medium text-gray-900">{rel.target_entity}</span>
                              <span className="text-gray-500 text-[11px]">({rel.details})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: LITIGATION & COURT CASES */}
        {activeTab === 'litigation' && (
          <div className="p-6 space-y-6">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by case code, court no, petitioner, or project..."
                    value={litigationSearch}
                    onChange={(e) => setLitigationSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={litigationCaseType}
                  onChange={(e) => setLitigationCaseType(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All Case Types</option>
                  <option value="WRIT_PETITION">Writ Petition (High Court)</option>
                  <option value="LAND_ACQUISITION_ORIGINAL_PETITION">LAOP (Sub-Court)</option>
                  <option value="SPECIAL_LEAVE_PETITION">SLP (Supreme Court)</option>
                  <option value="CONTEMPT_PETITION">Contempt Petition</option>
                  <option value="CIVIL_REVISION_PETITION">Civil Revision</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLitigationWorkRestricted(litigationWorkRestricted === true ? undefined : true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition flex items-center gap-1 ${
                    litigationWorkRestricted === true
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <Lock className="w-3 h-3" /> Active Stay / Work Restricted Only
                </button>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Case Code & Number</th>
                    <th className="px-4 py-3">Court / Bench</th>
                    <th className="px-4 py-3">Project & Parcel</th>
                    <th className="px-4 py-3">Petitioners & Dispute</th>
                    <th className="px-4 py-3">Work Restr. / Stay</th>
                    <th className="px-4 py-3">Counter-Affidavit</th>
                    <th className="px-4 py-3">Next Hearing</th>
                    <th className="px-4 py-3 text-right">Claim (₹ Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLitigation.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {c.case_code}
                        <div className="text-xs text-indigo-700 font-mono">{c.court_case_number}</div>
                        {c.cnr_number && <div className="text-[10px] text-gray-400 font-mono">CNR: {c.cnr_number}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-800">{c.court_name}</span>
                        {c.court_bench && <div className="text-gray-500">{c.court_bench}</div>}
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 font-medium">
                          {c.case_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-medium text-gray-800">{c.project_title || `Project #${c.project_id}`}</span>
                        {c.parcel_reference && (
                          <div className="text-emerald-700 font-semibold">{c.parcel_reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs">
                        <span className="font-semibold text-gray-900">{c.petitioners}</span>
                        <div className="text-gray-500 text-[11px] truncate">{c.dispute_nature}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.work_restricted ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                              <Lock className="w-3 h-3 mr-1" /> ACTIVE STAY
                            </span>
                            <div className="text-[10px] text-red-600 mt-0.5">
                              {c.vacate_stay_petition_filed ? 'Vacate Petition Filed' : 'Vacate NOT Filed'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <Unlock className="w-3 h-3 mr-1" /> No Work Restriction
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          c.counter_affidavit_status === 'FILED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.counter_affidavit_status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800 font-bold'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.counter_affidavit_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">
                        {c.next_hearing_date ? new Date(c.next_hearing_date).toLocaleDateString('en-IN') : '--'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono font-bold text-gray-900">
                        {c.financial_claim_cr ? `₹${c.financial_claim_cr}` : '--'}
                      </td>
                    </tr>
                  ))}
                  {filteredLitigation.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No litigation cases match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB C: REVENUE COORDINATION */}
        {activeTab === 'revenue' && (
          <div className="p-6 space-y-6">
            {/* Header controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <select
                  value={revenueTypeFilter}
                  onChange={(e) => setRevenueTypeFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All Revenue Request Types</option>
                  <option value="FMB_SUBDIVISION_UPDATE">FMB Subdivision Update</option>
                  <option value="PATTA_TRANSFER">Patta Transfer to Highways</option>
                  <option value="CLASSIFICATION_VERIFICATION">Classification Verification</option>
                  <option value="JOINT_SURVEY">Joint Survey</option>
                  <option value="ENCROACHMENT_EVICTION">Encroachment Eviction Assistance</option>
                </select>

                <button
                  onClick={() => setRevenueOverdueOnly(!revenueOverdueOnly)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    revenueOverdueOnly
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Overdue Responses Only
                </button>
              </div>

              <button
                onClick={() => setShowNewRevenueModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Coordination Request
              </button>
            </div>

            {/* Revenue Requests Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Request Type</th>
                    <th className="px-4 py-3">Revenue Office & Taluk</th>
                    <th className="px-4 py-3">Subdivision Target</th>
                    <th className="px-4 py-3">Dates & Due</th>
                    <th className="px-4 py-3">Overdue SLA</th>
                    <th className="px-4 py-3">Escalation Tier</th>
                    <th className="px-4 py-3">Joint Survey Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRevenue.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {r.request_reference}
                        <div className="text-xs text-gray-500 font-normal">{r.project_title}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">
                        {r.request_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-900">{r.revenue_officer_designation}</span>
                        <div className="text-gray-500">{r.revenue_office_location} ({r.district})</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {r.subdivision_target}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>Init: {new Date(r.date_initiated).toLocaleDateString('en-IN')}</div>
                        <div className="font-semibold text-gray-800">
                          Due: {new Date(r.statutory_due_date).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.is_overdue ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {r.days_overdue} Days Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Within SLA
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {r.escalation_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.joint_inspection_held ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Held on {r.joint_inspection_date ? new Date(r.joint_inspection_date).toLocaleDateString() : 'Yes'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending Inspection</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRevenue.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No revenue coordination requests match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* New Revenue Request Modal */}
            {showNewRevenueModal && (
              <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-gray-900">New Revenue Coordination Request</h3>
                    <button onClick={() => setShowNewRevenueModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateRevenueRequest} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Request Type</label>
                      <select
                        value={newRevenueForm.request_type}
                        onChange={(e) => setNewRevenueForm({ ...newRevenueForm, request_type: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md"
                      >
                        <option value="FMB_SUBDIVISION_UPDATE">FMB Subdivision Update</option>
                        <option value="PATTA_TRANSFER">Patta Transfer to Highways</option>
                        <option value="CLASSIFICATION_VERIFICATION">Classification Verification</option>
                        <option value="JOINT_SURVEY">Joint Survey</option>
                        <option value="ENCROACHMENT_EVICTION">Encroachment Eviction Assistance</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">District</label>
                        <input
                          type="text"
                          value={newRevenueForm.district}
                          onChange={(e) => setNewRevenueForm({ ...newRevenueForm, district: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Taluk</label>
                        <input
                          type="text"
                          value={newRevenueForm.taluk}
                          onChange={(e) => setNewRevenueForm({ ...newRevenueForm, taluk: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Target Survey / Parcel</label>
                      <input
                        type="text"
                        value={newRevenueForm.subdivision_target}
                        onChange={(e) => setNewRevenueForm({ ...newRevenueForm, subdivision_target: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md"
                        placeholder="e.g. Survey 142/2A Patta Transfer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Revenue Officer</label>
                        <input
                          type="text"
                          value={newRevenueForm.revenue_officer_designation}
                          onChange={(e) => setNewRevenueForm({ ...newRevenueForm, revenue_officer_designation: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Statutory Due Date</label>
                        <input
                          type="date"
                          value={newRevenueForm.statutory_due_date}
                          onChange={(e) => setNewRevenueForm({ ...newRevenueForm, statutory_due_date: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Remarks</label>
                      <textarea
                        rows={2}
                        value={newRevenueForm.remarks}
                        onChange={(e) => setNewRevenueForm({ ...newRevenueForm, remarks: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewRevenueModal(false)}
                        className="px-3 py-1.5 border rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold"
                      >
                        Initiate Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB D: ADVOCATE & LEGAL CELL MONITORING */}
        {activeTab === 'advocate' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-semibold">
                  Monitoring government standing counsel instructions, counter-affidavit filing compliance, and hearing attendance across Madurai and Madras Benches.
                </span>
              </div>
              <button
                onClick={() => setAdvocateAlertsOnly(!advocateAlertsOnly)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                  advocateAlertsOnly
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Show Procedural Alerts Only
              </button>
            </div>

            {/* Advocate Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Case Code & Court</th>
                    <th className="px-4 py-3">Assigned Standing Counsel</th>
                    <th className="px-4 py-3">Govt Legal Coordinator</th>
                    <th className="px-4 py-3">Instructions & Docs</th>
                    <th className="px-4 py-3">Counter-Affidavit Status</th>
                    <th className="px-4 py-3">Compliance Deadline</th>
                    <th className="px-4 py-3">Hearing Attendance</th>
                    <th className="px-4 py-3">Procedural Alert Notice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {advocateRecords
                    .filter((r) => (!advocateAlertsOnly ? true : r.procedural_alert))
                    .map((r) => (
                      <tr key={r.case_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-900 text-xs">
                          {r.case_code}
                          <div className="text-indigo-700 font-mono text-[11px]">{r.court_case_number}</div>
                          <div className="text-gray-500 font-normal">{r.court_name}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="font-semibold text-gray-900">{r.assigned_counsel_name}</span>
                          <div className="text-gray-500 font-mono text-[11px]">{r.counsel_contact}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-800">
                          {r.govt_legal_coordinator}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1 text-gray-700">
                            <span>Instructions:</span>
                            <span className="font-semibold">{r.instructions_sent_status}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <span>Docs:</span>
                            <span>{r.documents_supplied_status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            r.counter_affidavit_status === 'FILED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.counter_affidavit_status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800 font-bold'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.counter_affidavit_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">
                          {r.filing_compliance_deadline
                            ? new Date(r.filing_compliance_deadline).toLocaleDateString('en-IN')
                            : '--'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {r.hearing_attendance_record}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {r.procedural_alert ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                              Procedural Review Required
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                            </span>
                          )}
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {r.human_performance_review_notes}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB E: SITE BLOCKERS & READINESS GATES */}
        {activeTab === 'blockers' && (
          <div className="p-6 space-y-6">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <select
                  value={blockerGateFilter}
                  onChange={(e) => setBlockerGateFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All Readiness Gates</option>
                  <option value="RED">RED: Stop Work / Handover Blocked</option>
                  <option value="AMBER">AMBER: Conditional Work Allowed</option>
                  <option value="GREEN">GREEN: Unencumbered / Ready</option>
                </select>

                <button
                  onClick={() => setBlockerCriticalFilter(blockerCriticalFilter === true ? undefined : true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    blockerCriticalFilter === true
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Critical Path Only
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Showing {filteredBlockers.length} of {blockers.length} site blockers
              </div>
            </div>

            {/* Blockers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlockers.map((b) => (
                <div
                  key={b.id}
                  className={`bg-white p-4 rounded-xl border shadow-sm space-y-3 flex flex-col justify-between ${
                    b.readiness_gate === 'RED'
                      ? 'border-red-300 bg-red-50/20'
                      : b.readiness_gate === 'AMBER'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-emerald-300 bg-emerald-50/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-700">{b.blocker_code}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          b.readiness_gate === 'RED'
                            ? 'bg-red-600 text-white'
                            : b.readiness_gate === 'AMBER'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {b.readiness_gate === 'RED' && <Lock className="w-3 h-3 mr-1" />}
                        GATE {b.readiness_gate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-2">{b.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{b.description}</p>
                    <div className="text-xs font-semibold text-emerald-800 mt-1">
                      {b.project_title}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-200/80 pt-2 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Chainage:</span>
                      <span className="font-medium text-gray-800">
                        km {b.chainage_start_km ?? '--'} - km {b.chainage_end_km ?? '--'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span>Critical Path:</span>
                      <span className={`font-semibold ${b.is_critical_path ? 'text-red-700' : 'text-gray-700'}`}>
                        {b.is_critical_path ? 'YES (DELAY DRIVER)' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span>Contractor Mobilised:</span>
                      <span className={`font-semibold ${b.contractor_mobilised_on_blocked_site ? 'text-red-700' : 'text-gray-700'}`}>
                        {b.contractor_mobilised_on_blocked_site ? 'YES (PREMATURE MOBILISATION)' : 'No'}
                      </span>
                    </div>

                    {b.idle_resources_reported && (
                      <div className="p-1.5 bg-red-100 text-red-800 text-[11px] font-bold rounded flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Idle Machinery / Labour Reported
                      </div>
                    )}

                    <div className="flex items-center justify-between text-gray-600 pt-1">
                      <span>Owner:</span>
                      <span className="font-medium text-gray-900">{b.resolution_owner_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB F: FINANCIAL EXPOSURE */}
        {activeTab === 'financial' && financialData && (
          <div className="p-6 space-y-6">
            {/* Double-counting protection notice banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Government Financial Auditor Guard: Separate Expenditure Accounting
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  {financialData.summary.double_counting_protection}
                  Gross project sanctioned value (₹{financialData.summary.total_project_value_affected_cr} Cr) represents corridor scope, NOT expenditure loss. Forecast incremental loss (₹{financialData.summary.total_forecast_incremental_cost_cr} Cr) synthesizes admitted contractor claims, contractual price escalation (Clause 10CA), idle equipment finance, and legal defense costs.
                </p>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase">Gross Project Value Affected</span>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{financialData.summary.total_project_value_affected_cr} <span className="text-xs text-gray-400 font-normal">Cr</span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">Sanctioned capital scope</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 uppercase">Actual Incremental Incurred</span>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{financialData.summary.total_actual_incremental_expenditure_cr} <span className="text-xs text-gray-400 font-normal">Cr</span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">Actual disbursed to date</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50/20">
                <span className="text-xs font-semibold text-indigo-700 uppercase">Contractor Claims Admitted</span>
                <div className="text-2xl font-bold text-indigo-800 mt-1">
                  ₹{financialData.summary.total_claims_admitted_cr} <span className="text-xs text-gray-400 font-normal">Cr</span>
                </div>
                <span className="text-xs text-indigo-600 mt-1 block">
                  Submitted: ₹{financialData.summary.total_contractor_claims_submitted_cr} Cr | Disputed: ₹{financialData.summary.total_claims_disputed_cr} Cr
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Forecast Total Incremental Cost</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{financialData.summary.total_forecast_incremental_cost_cr} <span className="text-xs text-gray-400 font-normal">Cr</span>
                </div>
                <span className="text-xs text-emerald-600 mt-1 block">
                  Avoidable Future: ₹{financialData.summary.total_potentially_avoidable_future_cost_cr} Cr
                </span>
              </div>
            </div>

            {/* Per-Project Breakdown Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Project Title</th>
                    <th className="px-4 py-3 text-right">Project Value (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Actual Incurred (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Claims Admitted (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Price Escalation (10CA)</th>
                    <th className="px-4 py-3 text-right">Idle Plant / Labour</th>
                    <th className="px-4 py-3 text-right">Avoidable Future (₹ Cr)</th>
                    <th className="px-4 py-3">Basis of Estimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {financialData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900 text-xs max-w-xs">
                        {item.project_title || `Project #${item.project_id}`}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        ₹{item.project_value_affected_cr}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-900 font-semibold">
                        ₹{item.actual_incremental_expenditure_cr}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-indigo-700 font-bold">
                        ₹{item.claims_admitted_cr}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-amber-700 font-medium">
                        ₹{item.contractual_price_escalation_cr}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-red-700 font-medium">
                        ₹{item.idle_resource_cost_cr}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-emerald-700 font-bold">
                        ₹{item.potentially_avoidable_future_cost_cr}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {item.basis_of_estimate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB G: RESOLUTION & ESCALATION WORKSPACE */}
        {activeTab === 'resolutions' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600 font-semibold">
                Cross-departmental corrective actions, Collector coordination, Special DRO tasks, and CMO-level escalation tracker.
              </span>
              <button
                onClick={() => setShowNewActionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Corrective Action
              </button>
            </div>

            {/* Actions Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Action Code</th>
                    <th className="px-4 py-3">Title & Action Type</th>
                    <th className="px-4 py-3">Assigned Officer / Role</th>
                    <th className="px-4 py-3">Escalation Tier</th>
                    <th className="px-4 py-3">Target Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Evidence / Notes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {resolutions.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 text-xs">
                        {a.action_code}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-900">{a.title}</span>
                        <div className="text-gray-500">{a.action_type.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-800">{a.assigned_to_officer}</span>
                        <div className="text-gray-500">{a.assigned_to_role}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {a.escalation_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-800">
                        {new Date(a.target_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          a.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {a.resolution_evidence_url ? (
                          <a href={a.resolution_evidence_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Evidence Link
                          </a>
                        ) : (
                          a.notes || '--'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {a.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleUpdateActionStatus(a.id, 'COMPLETED')}
                            className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {resolutions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No resolution actions currently registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* New Action Modal */}
            {showNewActionModal && (
              <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-gray-900">Add Cross-Departmental Resolution Action</h3>
                    <button onClick={() => setShowNewActionModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateResolutionAction} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newActionForm.title}
                        onChange={(e) => setNewActionForm({ ...newActionForm, title: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md"
                        placeholder="e.g. Convene District Collector Coordination Meet"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Action Type</label>
                        <select
                          value={newActionForm.action_type}
                          onChange={(e) => setNewActionForm({ ...newActionForm, action_type: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        >
                          <option value="REVENUE_ESCORT">Revenue Escort</option>
                          <option value="VACATE_STAY_FILING">Vacate Stay Petition Filing</option>
                          <option value="JOINT_ENCROACHMENT_REMOVAL">Joint Encroachment Removal</option>
                          <option value="COMPENSATION_DISBURSEMENT_CAMP">Compensation Disbursement Camp</option>
                          <option value="COLLECTOR_SPECIAL_REVIEW">Collector Special Review</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Escalation Tier</label>
                        <select
                          value={newActionForm.escalation_level}
                          onChange={(e) => setNewActionForm({ ...newActionForm, escalation_level: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        >
                          <option value="CIRCLE_SE">Circle SE</option>
                          <option value="DRO">Special DRO</option>
                          <option value="COLLECTOR">District Collector</option>
                          <option value="CHIEF_ENGINEER">Chief Engineer</option>
                          <option value="PRINCIPAL_SECRETARY">Principal Secretary</option>
                          <option value="CHIEF_SECRETARY_CMO">Chief Secretary / CMO</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Assigned Officer</label>
                        <input
                          type="text"
                          required
                          value={newActionForm.assigned_to_officer}
                          onChange={(e) => setNewActionForm({ ...newActionForm, assigned_to_officer: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Target Date</label>
                        <input
                          type="date"
                          required
                          value={newActionForm.target_date}
                          onChange={(e) => setNewActionForm({ ...newActionForm, target_date: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Notes</label>
                      <textarea
                        rows={2}
                        value={newActionForm.notes}
                        onChange={(e) => setNewActionForm({ ...newActionForm, notes: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-md"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewActionModal(false)}
                        className="px-3 py-1.5 border rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold"
                      >
                        Register Action
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pre-Construction Risk Assessment Modal with Strict Legal Prohibition Guard */}
      {showPreConstructionModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-700" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Pre-Construction Land & Legal Readiness Gate (Tender / Handover Review)
                  </h3>
                  <span className="text-xs text-indigo-800">
                    Rule: Minimum 80% unencumbered land required before tender award; zero binding stays before physical handover.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreConstructionModal(false);
                  setSelectedAssessmentForOverride(null);
                  setOverrideError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {overrideError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg font-semibold flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                  <span>{overrideError}</span>
                </div>
              )}

              <div className="space-y-3">
                {preConstructionAssessments.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      item.readiness_verdict === 'BLOCKED'
                        ? 'border-red-300 bg-red-50/30'
                        : item.readiness_verdict === 'CONDITIONAL'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-emerald-300 bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{item.project_title}</span>
                        <div className="text-gray-500 mt-0.5">Stage: {item.stage}</div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                          item.readiness_verdict === 'BLOCKED'
                            ? 'bg-red-600 text-white'
                            : item.readiness_verdict === 'CONDITIONAL'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.readiness_verdict}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-gray-500">Unencumbered Land:</span>
                        <p className={`text-sm font-bold ${item.unencumbered_land_pct >= 80 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {item.unencumbered_land_pct}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Statutory Clearances:</span>
                        <p className="font-semibold text-gray-800">
                          {item.statutory_clearances_cleared ? 'CLEARED' : 'PENDING'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Binding Court Prohibition:</span>
                        <p className={`font-bold ${item.has_binding_legal_prohibition ? 'text-red-700' : 'text-emerald-700'}`}>
                          {item.has_binding_legal_prohibition ? 'YES (STAY IN FORCE)' : 'None'}
                        </p>
                      </div>
                    </div>

                    {item.has_binding_legal_prohibition && (
                      <div className="mt-3 p-2 bg-red-100 text-red-900 rounded font-semibold text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0 text-red-700" />
                        <span>Binding Judicial Stay in force: {item.prohibition_details}. Override strictly prohibited by statute.</span>
                      </div>
                    )}

                    {item.is_overridden && (
                      <div className="mt-3 p-2 bg-amber-100 text-amber-900 rounded text-[11px]">
                        <strong>ADMINISTRATIVELY OVERRIDDEN</strong> by {item.override_authority} on{' '}
                        {item.override_date ? new Date(item.override_date).toLocaleDateString() : ''}. Justification:{' '}
                        {item.override_justification}
                      </div>
                    )}

                    {!item.is_overridden && item.readiness_verdict !== 'CLEAR' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedAssessmentForOverride(item);
                            setOverrideError(null);
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            item.has_binding_legal_prohibition
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                          }`}
                          disabled={item.has_binding_legal_prohibition}
                          title={item.has_binding_legal_prohibition ? 'Binding legal stays cannot be overridden' : 'Authorise administrative override'}
                        >
                          {item.has_binding_legal_prohibition ? 'Override Blocked by Injunction' : 'Request Administrative Override'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Override Form section if an item is selected */}
              {selectedAssessmentForOverride && (
                <div className="mt-4 p-4 border border-indigo-200 rounded-xl bg-indigo-50/60 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-900">
                    Administrative Override for {selectedAssessmentForOverride.project_title}
                  </h4>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Authorising Authority</label>
                    <select
                      value={overrideForm.authority}
                      onChange={(e) => setOverrideForm({ ...overrideForm, authority: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-md bg-white text-xs"
                    >
                      <option value="Chief Engineer (Highways)">Chief Engineer (Highways)</option>
                      <option value="Principal Secretary (Highways)">Principal Secretary (Highways)</option>
                      <option value="Empowered Committee">Empowered Committee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Mandatory Audit Justification</label>
                    <textarea
                      rows={2}
                      required
                      value={overrideForm.justification}
                      onChange={(e) => setOverrideForm({ ...overrideForm, justification: e.target.value })}
                      placeholder="Specify mitigation plan, interim bypass chainage, and escrow provisions..."
                      className="w-full px-3 py-1.5 border rounded-md bg-white text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssessmentForOverride(null)}
                      className="px-3 py-1.5 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleOverrideSubmit}
                      className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md font-semibold"
                    >
                      Confirm Administrative Override
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grounded AI Intelligence Drawer */}
      {showAIDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Land & Legal Grounded AI</h3>
                  <span className="text-xs text-gray-500">Statutory Fact Retrieval & Risk Synthesis</span>
                </div>
              </div>
              <button onClick={() => setShowAIDrawer(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs flex-1">
              {/* Quick Canonical Prompt Chips */}
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Canonical Intelligence Queries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {canonicalPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunAIQuery(p)}
                      className="text-left px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 rounded-full border border-gray-200 text-[11px] transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask any statutory, parcel, stay or claims question..."
                  value={aiQuery}
                  onChange={(e) => setAIQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAIQuery(aiQuery)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleRunAIQuery(aiQuery)}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Ask
                </button>
              </div>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="space-y-4 pt-2">
                  {/* Urgency Badge */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-gray-600 font-medium">Urgency Level:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      aiResponse.urgency_level === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : aiResponse.urgency_level === 'ELEVATED'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {aiResponse.urgency_level}
                    </span>
                  </div>

                  {/* Verified Facts */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Verified Facts
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                      {aiResponse.verified_facts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Information */}
                  {aiResponse.missing_information?.length > 0 && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1.5">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Missing Information
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-gray-800">
                        {aiResponse.missing_information.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Statutory Governance Authority */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-1.5">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-indigo-700" /> Statutory & Governance Authority
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                      {aiResponse.statutory_governance_authority.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Next Actions */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1.5">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-700" /> Recommended Corrective Actions
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                      {aiResponse.recommended_next_actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence References */}
                  <div className="text-[11px] text-gray-500 space-y-1">
                    <span className="font-semibold text-gray-700">Evidence References:</span>
                    <div>{aiResponse.evidence_references?.join(' • ') || 'TN-HDOS Live Database'}</div>
                  </div>

                  {/* Limitations Disclaimer */}
                  <div className="text-[10px] text-gray-400 italic border-t pt-2">
                    {aiResponse.limitations_disclaimer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandLitigationPage;

