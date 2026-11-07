import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AssetsSummaryData,
  InfrastructureAssetItem,
  MaintenanceWorkOrderItem,
  ProjectItem
} from '../types';
import {
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Wrench,
  Building,
  Plus,
  X,
  Send,
  Calendar,
  AlertOctagon,
  ChevronRight,
  TrendingDown,
  Compass,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<AssetsSummaryData | null>(null);
  const [assets, setAssets] = useState<InfrastructureAssetItem[]>([]);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrderItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'maintenance' | 'lifecycle'>('inventory');

  // Filters
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAssetItem | null>(null);
  const [conditionModalAsset, setConditionModalAsset] = useState<InfrastructureAssetItem | null>(null);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState<boolean>(false);
  const [updateOrderModalTarget, setUpdateOrderModalTarget] = useState<MaintenanceWorkOrderItem | null>(null);

  // Condition Form State
  const [conditionForm, setConditionForm] = useState({
    condition: 'Good',
    pci_score: 85.0,
    maintenance_status: 'Operational',
    notes: ''
  });
  const [conditionSubmitting, setConditionSubmitting] = useState<boolean>(false);
  const [conditionMsg, setConditionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Order Form State
  const [orderForm, setOrderForm] = useState({
    asset_id: 1,
    project_id: 4,
    maintenance_type: 'Corrective',
    description: '',
    priority: 'HIGH',
    estimated_cost_cr: 0.25,
    assigned_contractor: 'KCP Infra Fictional Ltd',
    assigned_engineer: 'Er. R. Venkatesh (AEE)',
    scheduled_date: new Date().toISOString().split('T')[0]
  });
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  const [orderMsg, setOrderMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update Order Status Form
  const [updateOrderStatusForm, setUpdateOrderStatusForm] = useState({
    status: 'COMPLETED',
    completion_date: new Date().toISOString().split('T')[0],
    inspection_verified: true,
    remarks: 'Field inspection completed and verified compliance with MoRTH standards.'
  });
  const [updateOrderSubmitting, setUpdateOrderSubmitting] = useState<boolean>(false);
  const [updateOrderMsg, setUpdateOrderMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Fetch all asset data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const projId = selectedProjectId !== 'ALL' ? Number(selectedProjectId) : undefined;

      const [summary, assetsRes, ordersRes] = await Promise.all([
        api.getAssetsSummary(selectedDistrict, selectedAssetType),
        api.getAssetsList({
          district: selectedDistrict,
          asset_type: selectedAssetType,
          condition: selectedCondition,
          project_id: projId,
          search: searchQuery
        }),
        api.getMaintenanceOrders({
          search: searchQuery
        })
      ]);

      setSummaryData(summary);
      setAssets(assetsRes.items || []);
      setWorkOrders(ordersRes.items || []);
    } catch (err) {
      console.error('Error fetching asset data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDistrict, selectedAssetType, selectedCondition, selectedProjectId]);

  // Submit Condition update
  const handleConditionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionModalAsset) return;

    setConditionSubmitting(true);
    setConditionMsg(null);

    try {
      await api.updateAssetCondition(conditionModalAsset.id, conditionForm);
      setConditionMsg({ type: 'success', text: 'Asset condition rating and PCI score updated successfully.' });
      setTimeout(() => {
        setConditionModalAsset(null);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setConditionMsg({ type: 'error', text: err?.message || 'Failed to update asset condition.' });
    } finally {
      setConditionSubmitting(false);
    }
  };

  // Submit Work order creation
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitting(true);
    setOrderMsg(null);

    try {
      await api.createMaintenanceOrder(orderForm);
      setOrderMsg({ type: 'success', text: 'Maintenance work order issued to contractor.' });
      setTimeout(() => {
        setCreateOrderModalOpen(false);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setOrderMsg({ type: 'error', text: err?.message || 'Failed to create work order.' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Submit Work order status update
  const handleUpdateOrderStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateOrderModalTarget) return;

    setUpdateOrderSubmitting(true);
    setUpdateOrderMsg(null);

    try {
      await api.updateMaintenanceOrderStatus(updateOrderModalTarget.id, updateOrderStatusForm);
      setUpdateOrderMsg({ type: 'success', text: 'Work order status updated and verified by engineer.' });
      setTimeout(() => {
        setUpdateOrderModalTarget(null);
        loadData(true);
      }, 1200);
    } catch (err: any) {
      setUpdateOrderMsg({ type: 'error', text: err?.message || 'Failed to update work order.' });
    } finally {
      setUpdateOrderSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedProgramme('ALL');
    setSelectedDistrict('ALL');
    setSelectedAssetType('ALL');
    setSelectedCondition('ALL');
    setSelectedProjectId('ALL');
    setSearchQuery('');
  };

  // Filtered Assets for table
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.asset_code.toLowerCase().includes(q) ||
        item.asset_name.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.location_chainage.toLowerCase().includes(q) ||
        item.responsible_authority.toLowerCase().includes(q)
      );
    });
  }, [assets, searchQuery]);

  // Filtered Work Orders for table
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(item => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.work_order_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.assigned_contractor.toLowerCase().includes(q) ||
        item.assigned_engineer.toLowerCase().includes(q)
      );
    });
  }, [workOrders, searchQuery]);

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
              <Layers className="w-8 h-8 text-blue-600" />
              Highway Infrastructure Asset Intelligence
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Digital asset inventory, condition index monitoring, pavement deterioration models, and lifecycle maintenance execution for Tamil Nadu highways.
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
                setCreateOrderModalOpen(true);
                setOrderMsg(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Issue Work Order
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Scenario Spotlight Banner (Section 14)                        */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Active Demonstration Scenario:</span>{' '}
              <span className="font-semibold">Asset AST-PVM-01 (SH-15 Flexible Pavement Stretch Km 0/0 to 14/0).</span>{' '}
              Pavement condition downgraded to <span className="font-bold text-amber-800">Fair (PCI 71.5)</span> following failed binder extraction test MAT-2026-001. Maintenance work order <span className="font-mono font-bold">MNT-2026-001</span> active for 1.3 km surface milling and replacement.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const ast = assets.find(a => a.asset_code === 'AST-PVM-01');
                if (ast) {
                  setSelectedAsset(ast);
                } else {
                  setSearchQuery('AST-PVM-01');
                }
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded transition"
            >
              Inspect AST-PVM-01
            </button>
            <button
              onClick={() => {
                setActiveTab('maintenance');
                setSearchQuery('MNT-2026-001');
              }}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-medium rounded transition"
            >
              View MNT-2026-001
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Districts</option>
              <option value="Nilgiris">Nilgiris</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Salem">Salem</option>
              <option value="Tiruchirappalli">Tiruchirappalli</option>
              <option value="Tirunelveli">Tirunelveli</option>
              <option value="Erode">Erode</option>
              <option value="Vellore">Vellore</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Type</label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Asset Types</option>
              <option value="Roads">Roads (Pavement Sections)</option>
              <option value="Bridges">Bridges & Flyovers</option>
              <option value="Culverts">Cross-Drainage Culverts</option>
              <option value="Retaining Walls">Retaining Walls & Slopes</option>
              <option value="Interchanges">Interchanges & Junctions</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Condition Rating</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Conditions</option>
              <option value="Good">Good (PCI 85-100)</option>
              <option value="Fair">Fair (PCI 70-84)</option>
              <option value="Poor">Poor (PCI 55-69)</option>
              <option value="Critical">Critical (PCI &lt; 55)</option>
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
                  {p.project_code} - {p.title.substring(0, 24)}...
                </option>
              ))}
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
            placeholder="Search assets by code, name, district, chainage or responsible authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE ASSETS SUMMARY (8 KPI CARDS)                     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Assets */}
        <div
          onClick={() => { setActiveTab('inventory'); setSelectedAssetType('ALL'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Assets</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
            {summaryData?.kpis.total_assets ?? 40}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            In State Highway GIS
          </div>
        </div>

        {/* Card 2: Roads km */}
        <div
          onClick={() => { setActiveTab('inventory'); setSelectedAssetType('Roads'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Roads (km)</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 group-hover:text-emerald-800 transition">
            {summaryData?.kpis.roads_km ?? 1284.6}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            Carriageway length
          </div>
        </div>

        {/* Card 3: Bridges */}
        <div
          onClick={() => { setActiveTab('inventory'); setSelectedAssetType('Bridges'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bridges</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 group-hover:text-indigo-800 transition">
            {summaryData?.kpis.bridges_count ?? 8}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            Major/Minor spans
          </div>
        </div>

        {/* Card 4: Culverts */}
        <div
          onClick={() => { setActiveTab('inventory'); setSelectedAssetType('Culverts'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Culverts</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-700 group-hover:text-purple-800 transition">
            {summaryData?.kpis.culverts_count ?? 16}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            Drainage structures
          </div>
        </div>

        {/* Card 5: Requiring Inspection */}
        <div
          onClick={() => { setActiveTab('inventory'); }}
          className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Audit Due</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 group-hover:text-amber-800 transition">
            {summaryData?.kpis.assets_requiring_inspection ?? 6}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-1 truncate">
            Inspection cycle due
          </div>
        </div>

        {/* Card 6: Requiring Maintenance */}
        <div
          onClick={() => { setActiveTab('maintenance'); }}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Maintenance</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
            {summaryData?.kpis.assets_requiring_maintenance ?? 8}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            Work orders required
          </div>
        </div>

        {/* Card 7: Critical Conditions */}
        <div
          onClick={() => { setActiveTab('inventory'); setSelectedCondition('Critical'); }}
          className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Critical</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600 group-hover:text-rose-700 transition">
            {summaryData?.kpis.critical_asset_conditions ?? 4}
          </div>
          <div className="text-[10px] text-rose-700/80 mt-1 truncate">
            PCI &lt; 55 / Scour risk
          </div>
        </div>

        {/* Card 8: Overdue Maintenance */}
        <div
          onClick={() => { setActiveTab('maintenance'); }}
          className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm cursor-pointer hover:border-rose-400 hover:shadow transition group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Overdue WO</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 group-hover:text-rose-800 transition">
            {summaryData?.kpis.overdue_maintenance_activities ?? 3}
          </div>
          <div className="text-[10px] text-rose-800/80 mt-1 truncate">
            Rectification delayed
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Condition Monitoring Distribution Banner                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Overall Asset Health Distribution (PCI Condition Tiers)
          </span>
          <span className="text-slate-500">
            Total Surveyed Assets: <span className="font-bold text-slate-800">{summaryData?.kpis.total_assets ?? 40}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-800">Good Condition (PCI 85-100)</div>
              <div className="text-lg font-bold text-emerald-900">{summaryData?.condition_distribution['Good'] ?? 22} Assets</div>
            </div>
            <span className="text-xs font-bold text-emerald-700">55%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-amber-800">Fair Condition (PCI 70-84)</div>
              <div className="text-lg font-bold text-amber-900">{summaryData?.condition_distribution['Fair'] ?? 12} Assets</div>
            </div>
            <span className="text-xs font-bold text-amber-700">30%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-orange-800">Poor Condition (PCI 55-69)</div>
              <div className="text-lg font-bold text-orange-900">{summaryData?.condition_distribution['Poor'] ?? 4} Assets</div>
            </div>
            <span className="text-xs font-bold text-orange-700">10%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-rose-800">Critical Condition (PCI &lt; 55)</div>
              <div className="text-lg font-bold text-rose-900">{summaryData?.condition_distribution['Critical'] ?? 2} Assets</div>
            </div>
            <span className="text-xs font-bold text-rose-700">5%</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AI ASSET HEALTH & MAINTENANCE INTELLIGENCE PANEL           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                AI Asset Health & Deterioration Prediction Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Pavement condition index modeling, bridge scour telemetry, and automated maintenance work order recommendations.
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30 font-mono">
            Model: Pavement-Asset-v4
          </span>
        </div>

        {/* Statement text */}
        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 text-sm leading-relaxed text-slate-200">
          {summaryData?.ai_asset_intelligence.overall_health_statement ||
            'State-wide Highway Asset Condition Index averages 78.4 (Fair to Good). Key attention required on Asset AST-PVM-01 (SH-15 Flexible Pavement) where binder deficiency has lowered PCI to 71.5, triggering corrective maintenance order MNT-2026-004. In addition, 1 river bridge foundation is overdue for underwater scour check.'}
        </div>

        {/* Health alerts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {summaryData?.ai_asset_intelligence.health_alerts.map((alert, idx) => (
            <div key={idx} className="bg-slate-900/80 p-3.5 rounded border border-emerald-500/30 text-xs space-y-1.5">
              <div className="flex justify-between items-start">
                <span className="font-mono text-emerald-400 font-bold">{alert.asset_code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-300">
                  {alert.current_condition}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{alert.asset_name}</h4>
              <div className="text-slate-300 text-[11px]">
                <span className="text-slate-400">Trigger:</span> {alert.trigger_event}
              </div>
              <div className="text-emerald-300 font-semibold text-[11px] pt-1 border-t border-slate-700/60">
                Directive: {alert.action_required}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TABS NAVIGATION                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Asset Inventory Register
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
              {filteredAssets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Maintenance Work Orders
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
              {filteredWorkOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
              activeTab === 'lifecycle'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            Asset Lifecycle Transition View
          </button>
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ASSET INVENTORY REGISTER                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Statewide Highway Infrastructure Assets</h3>
              <p className="text-xs text-slate-500">
                Pavement corridors, bridges, cross-drainage culverts, and retaining wall structures in Tamil Nadu.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filteredAssets.length}</span> assets
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Asset Code</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">District & Chainage</th>
                  <th className="py-3 px-4 text-center">Condition</th>
                  <th className="py-3 px-4 text-center">PCI Score</th>
                  <th className="py-3 px-4">Last Inspection</th>
                  <th className="py-3 px-4">Maintenance Status</th>
                  <th className="py-3 px-4 text-right">Value (₹ Cr)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No highway assets found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {item.asset_code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate" title={item.asset_name}>
                        {item.asset_name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {item.asset_type}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {item.district} • {item.location_chainage}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          item.condition === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                          item.condition === 'Fair' ? 'bg-amber-100 text-amber-800' :
                          item.condition === 'Poor' ? 'bg-orange-100 text-orange-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900">
                          {item.pci_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {item.last_inspection_date || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.maintenance_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                        ₹{item.replacement_value_cr.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedAsset(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setConditionModalAsset(item);
                            setConditionForm({
                              condition: item.condition,
                              pci_score: item.pci_score,
                              maintenance_status: item.maintenance_status,
                              notes: ''
                            });
                            setConditionMsg(null);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition"
                        >
                          Rate
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
      {/* TAB 2: MAINTENANCE WORK ORDERS                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Maintenance & Rectification Work Orders</h3>
              <p className="text-xs text-slate-500">
                Corrective resurfacing, bridge structural rehabilitation, desilting, and routine highway upkeep orders.
              </p>
            </div>
            <button
              onClick={() => {
                setCreateOrderModalOpen(true);
                setOrderMsg(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Issue New Work Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Scope / Description</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-right">Cost (₹ Cr)</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Engineer Verified</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No maintenance work orders found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredWorkOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {wo.work_order_code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {wo.maintenance_type}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={wo.description}>
                        {wo.description}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          wo.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          wo.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                        ₹{wo.estimated_cost_cr.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                        {wo.assigned_contractor}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {wo.assigned_engineer}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {wo.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {wo.inspection_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setUpdateOrderModalTarget(wo);
                            setUpdateOrderStatusForm({
                              status: wo.status,
                              completion_date: wo.completion_date || new Date().toISOString().split('T')[0],
                              inspection_verified: wo.inspection_verified,
                              remarks: wo.remarks || ''
                            });
                            setUpdateOrderMsg(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
                        >
                          Advance Status
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
      {/* TAB 3: ASSET LIFECYCLE TRANSITION VIEW                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          {/* Lifecycle pipeline visual */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Highways Asset Lifecycle Management Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              End-to-end operational stages from project planning through structural maintenance and lifecycle rehabilitation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
              {[
                { stage: 'Planning', count: 4, desc: 'DPR & Feasibility' },
                { stage: 'Construction', count: 12, desc: 'Civil Works Active' },
                { stage: 'Handover', count: 6, desc: 'Defect Liability Period' },
                { stage: 'Operation', count: 18, desc: 'Active Traffic' },
                { stage: 'Inspection', count: 6, desc: 'Condition Survey Due' },
                { stage: 'Maintenance', count: 8, desc: 'Work Orders Active' },
                { stage: 'Rehabilitation', count: 3, desc: 'Overlay / Strengthening' },
                { stage: 'Decommission', count: 0, desc: 'Replaced / Dismantled' }
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{item.stage}</div>
                  <div className="text-xl font-bold text-blue-700">{item.count}</div>
                  <div className="text-[9px] text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lifecycle Case Study: AST-PVM-01 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Lifecycle Case Study: AST-PVM-01 (SH-15 Flexible Pavement Corridor)
                </h4>
                <p className="text-xs text-slate-500">
                  Complete audit trail from field quality failure through defect rectification and asset condition restoration.
                </p>
              </div>
            </div>

            <div className="relative border-l-2 border-blue-300 ml-4 pl-6 space-y-6 text-xs">
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
                <div className="font-bold text-slate-900">Phase 1: Construction & Laying (Km 14+200 to 15+500)</div>
                <p className="text-slate-600 mt-0.5">Contractor KCP Infra laid Bituminous Concrete layer under Package PKG-EPC-01.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-rose-600 border-2 border-white"></div>
                <div className="font-bold text-rose-800">Phase 2: Field Audit & Lab Failure (04 Feb 2026)</div>
                <p className="text-slate-600 mt-0.5">
                  Inspection INSP-2026-001 by AEE Er. R. Venkatesh sampled BC course. HRS Coimbatore test MAT-2026-001 revealed 4.6% binder vs 5.2% spec. NCR-2025-041 issued.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-amber-600 border-2 border-white"></div>
                <div className="font-bold text-amber-800">Phase 3: Condition Downgrade & Maintenance Order</div>
                <p className="text-slate-600 mt-0.5">
                  Asset condition dropped from Good to Fair (PCI 71.5). Work Order MNT-2026-001 issued for 1.3 km milling and re-laying under Clause 46.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></div>
                <div className="font-bold text-emerald-800">Phase 4: Reinspection & Asset Restoration Target</div>
                <p className="text-slate-600 mt-0.5">
                  Upon contractor completion of re-laid DBM course and satisfactory joint core test certification, asset condition will be upgraded back to Good (PCI 88.0).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ASSET PROFILE MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {selectedAsset.asset_code} • {selectedAsset.asset_type}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedAsset.asset_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">District:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAsset.district}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Chainage:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAsset.location_chainage}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Responsible Division:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAsset.responsible_authority}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-semibold">Replacement Value:</span>
                <p className="font-bold text-slate-900 mt-0.5">₹{selectedAsset.replacement_value_cr.toFixed(2)} Cr</p>
              </div>
            </div>

            {/* PCI Condition Scorecard */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 uppercase text-[11px]">
                  Pavement Condition Index (PCI) Score
                </span>
                <span className="font-mono text-base font-bold text-blue-700">
                  {selectedAsset.pci_score.toFixed(1)} / 100 ({selectedAsset.condition})
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedAsset.pci_score >= 85 ? 'bg-emerald-500' :
                    selectedAsset.pci_score >= 70 ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${selectedAsset.pci_score}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Last Inspection: {selectedAsset.last_inspection_date || '—'}</span>
                <span>Next Inspection Due: {selectedAsset.next_inspection_date || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  setConditionModalAsset(selectedAsset);
                  setConditionForm({
                    condition: selectedAsset.condition,
                    pci_score: selectedAsset.pci_score,
                    maintenance_status: selectedAsset.maintenance_status,
                    notes: ''
                  });
                  setSelectedAsset(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition"
              >
                Update Condition Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: UPDATE ASSET CONDITION                               */}
      {/* ------------------------------------------------------------- */}
      {conditionModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                  {conditionModalAsset.asset_code}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Update Asset Condition & PCI Rating
                </h3>
              </div>
              <button
                onClick={() => setConditionModalAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conditionMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                conditionMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {conditionMsg.text}
              </div>
            )}

            <form onSubmit={handleConditionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition Status</label>
                  <select
                    value={conditionForm.condition}
                    onChange={(e) => setConditionForm({ ...conditionForm, condition: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Good">Good (PCI 85-100)</option>
                    <option value="Fair">Fair (PCI 70-84)</option>
                    <option value="Poor">Poor (PCI 55-69)</option>
                    <option value="Critical">Critical (PCI &lt; 55)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PCI Score (/100)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={conditionForm.pci_score}
                    onChange={(e) => setConditionForm({ ...conditionForm, pci_score: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintenance Status</label>
                <select
                  value={conditionForm.maintenance_status}
                  onChange={(e) => setConditionForm({ ...conditionForm, maintenance_status: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Inspection Due">Inspection Due</option>
                  <option value="Maintenance Required">Maintenance Required</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Engineering Inspection Notes & Justification
                </label>
                <textarea
                  rows={3}
                  value={conditionForm.notes}
                  onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                  placeholder="Detail condition survey findings, core test results or rehabilitation work..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConditionModalAsset(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={conditionSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {conditionSubmitting ? 'Saving...' : 'Update Condition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CREATE MAINTENANCE WORK ORDER                        */}
      {/* ------------------------------------------------------------- */}
      {createOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  Asset Maintenance Execution
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Issue Maintenance Work Order
                </h3>
              </div>
              <button
                onClick={() => setCreateOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                orderMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {orderMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateOrderSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Asset</label>
                  <select
                    value={orderForm.asset_id}
                    onChange={(e) => setOrderForm({ ...orderForm, asset_id: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>{a.asset_code} - {a.asset_name.substring(0, 24)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maintenance Type</label>
                  <select
                    value={orderForm.maintenance_type}
                    onChange={(e) => setOrderForm({ ...orderForm, maintenance_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Corrective">Corrective (Defect Rectification)</option>
                    <option value="Preventive">Preventive Maintenance</option>
                    <option value="Periodic">Periodic Resurfacing</option>
                    <option value="Special">Special Structural Repairs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope of Work</label>
                <textarea
                  rows={2}
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  placeholder="e.g. Surface milling and 40mm BC replacement on 1.3 km stretch..."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={orderForm.priority}
                    onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.estimated_cost_cr}
                    onChange={(e) => setOrderForm({ ...orderForm, estimated_cost_cr: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Contractor</label>
                  <input
                    type="text"
                    value={orderForm.assigned_contractor}
                    onChange={(e) => setOrderForm({ ...orderForm, assigned_contractor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervising Engineer</label>
                  <input
                    type="text"
                    value={orderForm.assigned_engineer}
                    onChange={(e) => setOrderForm({ ...orderForm, assigned_engineer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateOrderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {orderSubmitting ? 'Issuing...' : 'Issue Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADVANCE WORK ORDER STATUS                            */}
      {/* ------------------------------------------------------------- */}
      {updateOrderModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {updateOrderModalTarget.work_order_code}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Advance Maintenance Order & Verification
                </h3>
              </div>
              <button
                onClick={() => setUpdateOrderModalTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900">Scope:</span> {updateOrderModalTarget.description}
              <div className="mt-1 text-[11px] text-slate-600">
                Contractor: <span className="font-semibold text-slate-800">{updateOrderModalTarget.assigned_contractor}</span> |
                Engineer: <span className="font-semibold text-slate-800">{updateOrderModalTarget.assigned_engineer}</span>
              </div>
            </div>

            {updateOrderMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                updateOrderMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {updateOrderMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateOrderStatusSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Status</label>
                  <select
                    value={updateOrderStatusForm.status}
                    onChange={(e) => setUpdateOrderStatusForm({ ...updateOrderStatusForm, status: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="VERIFIED_CLOSED">Verified & Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={updateOrderStatusForm.completion_date}
                    onChange={(e) => setUpdateOrderStatusForm({ ...updateOrderStatusForm, completion_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={updateOrderStatusForm.inspection_verified}
                    onChange={(e) => setUpdateOrderStatusForm({ ...updateOrderStatusForm, inspection_verified: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Departmental Engineer Sign-Off & Physical Verification Confirmed
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Engineer Completion Remarks
                </label>
                <textarea
                  rows={2}
                  value={updateOrderStatusForm.remarks}
                  onChange={(e) => setUpdateOrderStatusForm({ ...updateOrderStatusForm, remarks: e.target.value })}
                  placeholder="e.g. Resurfaced stretch inspected; riding quality test passed."
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUpdateOrderModalTarget(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateOrderSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {updateOrderSubmitting ? 'Updating...' : 'Save Order Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
