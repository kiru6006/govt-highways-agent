import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

import {
  UnifiedWorkRecord,
  WorksAnalyticsFilterRegistry,
  WorksAnalyticsFilterPayload,
  WorksAnalyticsKPIs,
  WorksAnalyticsCharts
} from '../types';
import { worksAnalyticsAPI } from '../services/api';

const PROGRESS_BAND_COLORS: Record<string, string> = {
  '0–10%': '#ef4444',
  '10–25%': '#f97316',
  '26–50%': '#eab308',
  '51–75%': '#3b82f6',
  '76–90%': '#6366f1',
  '91–100%': '#10b981'
};

const CHART_PALETTE = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export const WorksAnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation Tabs: 'explorer' | 'charts'
  const activeTab = searchParams.get('tab') || 'explorer';
  const setActiveTab = (tab: 'explorer' | 'charts') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  // State
  const [registry, setRegistry] = useState<WorksAnalyticsFilterRegistry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [works, setWorks] = useState<UnifiedWorkRecord[]>([]);
  const [totalMatching, setTotalMatching] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [kpis, setKpis] = useState<WorksAnalyticsKPIs | null>(null);
  const [charts, setCharts] = useState<WorksAnalyticsCharts | null>(null);

  // Filter drawer toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Detail Drawer for 360° Inspection
  const [selectedWork, setSelectedWork] = useState<UnifiedWorkRecord | null>(null);

  // Column Presets for Tab 1 Explorer
  const [columnPreset, setColumnPreset] = useState<'core' | 'finance' | 'timeline' | 'risks' | 'all'>('core');

  // Filter state
  const [selectedWing, setSelectedWing] = useState<string>(searchParams.get('wing') || 'ALL');
  const [selectedCircle, setSelectedCircle] = useState<string>(searchParams.get('circle') || 'ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>(searchParams.get('division') || 'ALL');
  const [selectedScheme, setSelectedScheme] = useState<string>(searchParams.get('scheme') || 'ALL');
  const [selectedStage, setSelectedStage] = useState<string>(searchParams.get('stage') || 'ALL');
  const [selectedBand, setSelectedBand] = useState<string>(searchParams.get('band') || 'ALL');
  const [selectedDelay, setSelectedDelay] = useState<string>(searchParams.get('delay') || 'ALL');
  const [selectedAgreementDelay, setSelectedAgreementDelay] = useState<string>(searchParams.get('agreementDelay') || 'ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>(searchParams.get('risk') || 'ALL');
  const [selectedEligibility, setSelectedEligibility] = useState<string>(searchParams.get('eligibility') || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedBlocker, setSelectedBlocker] = useState<string>('ALL');

  // Load registry once
  useEffect(() => {
    async function initRegistry() {
      try {
        const reg = await worksAnalyticsAPI.getFilterRegistry();
        setRegistry(reg);
      } catch (err) {
        console.error('Failed to load filter registry', err);
      }
    }
    initRegistry();
  }, []);

  // Compute available Circles based on selected Wing
  const availableCircles = useMemo(() => {
    if (!registry) return [];
    if (selectedWing === 'ALL' || !registry.circles_by_wing[selectedWing]) {
      return registry.circles || [];
    }
    return registry.circles_by_wing[selectedWing] || [];
  }, [registry, selectedWing]);

  // Compute available Divisions based on selected Circle
  const availableDivisions = useMemo(() => {
    if (!registry) return [];
    if (selectedCircle === 'ALL' || !registry.divisions_by_circle[selectedCircle]) {
      return registry.divisions || [];
    }
    return registry.divisions_by_circle[selectedCircle] || [];
  }, [registry, selectedCircle]);

  // Build filter payload
  const currentPayload = useMemo<WorksAnalyticsFilterPayload>(() => {
    const p: WorksAnalyticsFilterPayload = {
      page,
      page_size: pageSize
    };
    if (selectedWing !== 'ALL') p.wings = [selectedWing];
    if (selectedCircle !== 'ALL') p.circles = [selectedCircle];
    if (selectedDivision !== 'ALL') p.divisions = [selectedDivision];
    if (selectedScheme !== 'ALL') p.schemes = [selectedScheme];
    if (selectedStage !== 'ALL') p.work_stages = [selectedStage];
    if (selectedBand !== 'ALL') p.progress_bands = [selectedBand];
    if (selectedDelay !== 'ALL') p.forecast_delay_categories = [selectedDelay];
    if (selectedAgreementDelay !== 'ALL') p.agreement_delay_categories = [selectedAgreementDelay];
    if (selectedRisk !== 'ALL') p.risk_severities = [selectedRisk];
    if (selectedEligibility !== 'ALL') p.five_year_eligibilities = [selectedEligibility];
    if (selectedBlocker !== 'ALL') p.dependency_issues = [selectedBlocker];
    if (searchQuery.trim()) p.search_query = searchQuery.trim();
    return p;
  }, [
    page,
    pageSize,
    selectedWing,
    selectedCircle,
    selectedDivision,
    selectedScheme,
    selectedStage,
    selectedBand,
    selectedDelay,
    selectedAgreementDelay,
    selectedRisk,
    selectedEligibility,
    selectedBlocker,
    searchQuery
  ]);

  // Fetch works and analytics
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resQuery, resKpis, resCharts] = await Promise.all([
        worksAnalyticsAPI.queryWorks(currentPayload, (page - 1) * pageSize, pageSize),
        worksAnalyticsAPI.getKPIs(currentPayload),
        worksAnalyticsAPI.getCharts(currentPayload)
      ]);
      setWorks(resQuery.items);
      setTotalMatching(resQuery.total_matching);
      setKpis(resKpis);
      setCharts(resCharts);
    } catch (err) {
      console.error('Error fetching works analytics', err);
    } finally {
      setLoading(false);
    }
  }, [currentPayload, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync state to URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedWing !== 'ALL') next.set('wing', selectedWing); else next.delete('wing');
    if (selectedCircle !== 'ALL') next.set('circle', selectedCircle); else next.delete('circle');
    if (selectedDivision !== 'ALL') next.set('division', selectedDivision); else next.delete('division');
    if (selectedScheme !== 'ALL') next.set('scheme', selectedScheme); else next.delete('scheme');
    if (selectedStage !== 'ALL') next.set('stage', selectedStage); else next.delete('stage');
    if (selectedBand !== 'ALL') next.set('band', selectedBand); else next.delete('band');
    if (selectedDelay !== 'ALL') next.set('delay', selectedDelay); else next.delete('delay');
    if (selectedAgreementDelay !== 'ALL') next.set('agreementDelay', selectedAgreementDelay); else next.delete('agreementDelay');
    if (selectedRisk !== 'ALL') next.set('risk', selectedRisk); else next.delete('risk');
    if (selectedEligibility !== 'ALL') next.set('eligibility', selectedEligibility); else next.delete('eligibility');
    if (searchQuery.trim()) next.set('q', searchQuery.trim()); else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [
    selectedWing,
    selectedCircle,
    selectedDivision,
    selectedScheme,
    selectedStage,
    selectedBand,
    selectedDelay,
    selectedAgreementDelay,
    selectedRisk,
    selectedEligibility,
    searchQuery
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedWing('ALL');
    setSelectedCircle('ALL');
    setSelectedDivision('ALL');
    setSelectedScheme('ALL');
    setSelectedStage('ALL');
    setSelectedBand('ALL');
    setSelectedDelay('ALL');
    setSelectedAgreementDelay('ALL');
    setSelectedRisk('ALL');
    setSelectedEligibility('ALL');
    setSelectedBlocker('ALL');
    setSearchQuery('');
    setPage(1);
  };

  // Quick Filter via KPI click
  const applyKpiFilter = (type: string) => {
    handleResetFilters();
    if (type === 'completed') setSelectedStage('Completed');
    if (type === 'wip') setSelectedStage('Work in Progress');
    if (type === 'delayed') setSelectedDelay('> 180 Days');
    if (type === 'agreement_delay') setSelectedAgreementDelay('More Than 6 Months');
    if (type === 'critical_risk') setSelectedRisk('CRITICAL');
    if (type === 'locked_5yr') setSelectedEligibility('LOCKED_UNDER_5YR');
    setActiveTab('explorer');
  };

  // Export handlers
  const handleExport = async (format: 'excel' | 'csv') => {
    setExporting(true);
    try {
      const blob = await worksAnalyticsAPI.exportData(currentPayload, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TN_Highways_Works_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(`Export failed: ${err}`);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  TN-HDOS Master Platform
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Statewide Works Management System
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                <Layers className="w-6 h-6 text-amber-600" />
                Works Status Analytics
              </h1>
            </div>

            {/* Tab Switcher & Export */}
            <div className="flex items-center gap-2.5">
              <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setActiveTab('explorer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'explorer'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  Works Data Explorer
                </button>
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'charts'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  Works Analytics & Charts
                </button>
              </div>

              {/* Exports */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={exporting}
                  onClick={() => handleExport('excel')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                  title="Download Multi-Sheet Excel Workbook"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exporting ? 'Generating...' : 'Excel (.xlsx)'}
                </button>
                <button
                  disabled={exporting}
                  onClick={() => handleExport('csv')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition-colors shadow-xs"
                  title="Download RFC 4180 CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-4">
        {/* SHARED FILTER BAR */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col gap-3">
            {/* Primary Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, name, road, contractor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Wing */}
              <div>
                <select
                  value={selectedWing}
                  onChange={(e) => {
                    setSelectedWing(e.target.value);
                    setSelectedCircle('ALL');
                    setSelectedDivision('ALL');
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Wings</option>
                  {(registry?.wings || []).map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Circle (Dependent) */}
              <div>
                <select
                  value={selectedCircle}
                  onChange={(e) => {
                    setSelectedCircle(e.target.value);
                    setSelectedDivision('ALL');
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Circles</option>
                  {availableCircles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Division (Dependent) */}
              <div>
                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Divisions</option>
                  {availableDivisions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Scheme */}
              <div>
                <select
                  value={selectedScheme}
                  onChange={(e) => {
                    setSelectedScheme(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Schemes</option>
                  {(registry?.schemes || []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filter Row: Stages & Non-Overlapping Bands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1 border-t border-slate-100 items-center">
              {/* Stage */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Work Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Stages</option>
                  {(registry?.work_stages || []).map((stg) => (
                    <option key={stg} value={stg}>{stg}</option>
                  ))}
                </select>
              </div>

              {/* Non-overlapping Progress Band */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Progress Band (Non-Overlapping)</label>
                <select
                  value={selectedBand}
                  onChange={(e) => {
                    setSelectedBand(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Progress Bands</option>
                  {(registry?.progress_bands || []).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Forecast Delay */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Delay Status</label>
                <select
                  value={selectedDelay}
                  onChange={(e) => {
                    setSelectedDelay(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Delay Types</option>
                  {(registry?.delay_categories || []).map((dc) => (
                    <option key={dc} value={dc}>{dc}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Risk Severity</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => {
                    setSelectedRisk(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ALL">All Risk Severities</option>
                  {(registry?.risk_severities || []).map((rs) => (
                    <option key={rs} value={rs}>{rs}</option>
                  ))}
                </select>
              </div>

              {/* Advanced toggle & Reset */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  {showAdvancedFilters ? 'Fewer Filters' : 'More Filters'}
                  {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Reset all filters to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-lg">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Agreement Delay</label>
                  <select
                    value={selectedAgreementDelay}
                    onChange={(e) => { setSelectedAgreementDelay(e.target.value); setPage(1); }}
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="ALL">All Agreement Delays</option>
                    {(registry?.agreement_delay_categories || []).map((adc) => (
                      <option key={adc} value={adc}>{adc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">CRIDP 5-Year Rule</label>
                  <select
                    value={selectedEligibility}
                    onChange={(e) => { setSelectedEligibility(e.target.value); setPage(1); }}
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="ALL">All 5-Year Eligibility</option>
                    <option value="ELIGIBLE">Eligible (Over 5 Years)</option>
                    <option value="LOCKED_UNDER_5YR">Locked Under 5-Year Warranty</option>
                    <option value="UNKNOWN_HISTORY">Unknown Historical Records</option>
                    <option value="REVIEW_REQUIRED">Review Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Department Blockers</label>
                  <select
                    value={selectedBlocker}
                    onChange={(e) => { setSelectedBlocker(e.target.value); setPage(1); }}
                    className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="ALL">All Dependencies</option>
                    <option value="land_acquisition">Land Acquisition Delay</option>
                    <option value="utility">Utility Shifting (TANGEDCO/TWAD)</option>
                    <option value="forest">Forest Clearance</option>
                    <option value="railway">Railway GAD Approval</option>
                    <option value="court">High Court Stay / Litigation</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900 w-full">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Cross-filtering active across 160+ live PMS records.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10 SYNCHRONIZED CLICKABLE KPI CARDS */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
            <div
              onClick={handleResetFilters}
              className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs hover:border-slate-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-slate-500 truncate">Total Works</div>
              <div className="text-lg font-bold text-slate-900">{kpis.total_works}</div>
              <div className="text-[10px] text-slate-400 truncate">{kpis.total_length_km} km</div>
            </div>

            <div
              onClick={() => applyKpiFilter('completed')}
              className="bg-white border border-emerald-200 rounded-xl p-2.5 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-emerald-700 truncate">Completed</div>
              <div className="text-lg font-bold text-emerald-700">{kpis.completed_works}</div>
              <div className="text-[10px] text-emerald-600 truncate">{kpis.completed_length_km} km done</div>
            </div>

            <div
              onClick={() => applyKpiFilter('wip')}
              className="bg-white border border-blue-200 rounded-xl p-2.5 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-blue-700 truncate">In Progress</div>
              <div className="text-lg font-bold text-blue-700">{kpis.work_in_progress}</div>
              <div className="text-[10px] text-blue-600 truncate">Active sites</div>
            </div>

            <div
              onClick={() => applyKpiFilter('delayed')}
              className="bg-white border border-amber-200 rounded-xl p-2.5 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-amber-700 truncate">Forecast Delay</div>
              <div className="text-lg font-bold text-amber-700">{kpis.works_with_potential_delay}</div>
              <div className="text-[10px] text-amber-600 truncate">Schedule risk</div>
            </div>

            <div
              onClick={() => applyKpiFilter('agreement_delay')}
              className="bg-white border border-purple-200 rounded-xl p-2.5 shadow-xs hover:border-purple-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-purple-700 truncate">&gt; Agree Date</div>
              <div className="text-lg font-bold text-purple-700">{kpis.works_beyond_agreement_date}</div>
              <div className="text-[10px] text-purple-600 truncate">Time elapsed</div>
            </div>

            <div
              onClick={() => applyKpiFilter('critical_risk')}
              className="bg-white border border-rose-200 rounded-xl p-2.5 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-rose-700 truncate">Critical Risks</div>
              <div className="text-lg font-bold text-rose-700">{kpis.critical_financial_risk_count}</div>
              <div className="text-[10px] text-rose-600 truncate">High exposure</div>
            </div>

            <div
              onClick={() => applyKpiFilter('locked_5yr')}
              className="bg-white border border-orange-200 rounded-xl p-2.5 shadow-xs hover:border-orange-400 cursor-pointer transition-all"
            >
              <div className="text-[10px] font-medium text-orange-700 truncate">5-Yr Overlap</div>
              <div className="text-lg font-bold text-orange-700">₹{kpis.total_avoidable_exposure_cr}Cr</div>
              <div className="text-[10px] text-orange-600 truncate">Avoidable cost</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
              <div className="text-[10px] font-medium text-slate-500 truncate">Pre-Const</div>
              <div className="text-lg font-bold text-slate-800">{kpis.pre_construction_works}</div>
              <div className="text-[10px] text-slate-400 truncate">LA / DPR / Tender</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
              <div className="text-[10px] font-medium text-slate-500 truncate">Sanction AS</div>
              <div className="text-lg font-bold text-slate-900">₹{kpis.total_as_amount_cr}Cr</div>
              <div className="text-[10px] text-slate-400 truncate">Total sanctioned</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
              <div className="text-[10px] font-medium text-slate-500 truncate">Expenditure</div>
              <div className="text-lg font-bold text-slate-900">₹{kpis.total_expenditure_cr}Cr</div>
              <div className="text-[10px] text-slate-400 truncate">
                {kpis.total_contract_value_cr > 0
                  ? `${Math.round((kpis.total_expenditure_cr / kpis.total_contract_value_cr) * 100)}% of Contract`
                  : '0%'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: WORKS DATA EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {/* Explorer Toolbar */}
            <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">
                  Showing {works.length} of {totalMatching} Works
                </span>
                {loading && (
                  <span className="inline-flex items-center text-[11px] text-amber-600 font-medium animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    Filtering...
                  </span>
                )}
              </div>

              {/* Column Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Views:</span>
                {[
                  { id: 'core', label: 'Core PMS' },
                  { id: 'finance', label: 'Financials' },
                  { id: 'timeline', label: 'Timeline & Delays' },
                  { id: 'risks', label: 'Blockers & 5-Yr' },
                  { id: 'all', label: 'All Columns' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setColumnPreset(preset.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      columnPreset === preset.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3">Work Code</th>
                    <th className="px-3.5 py-3 min-w-[220px]">Work / Road Name</th>
                    <th className="px-3 py-3">Wing & Division</th>
                    <th className="px-3 py-3">Scheme & Class</th>
                    <th className="px-3 py-3">Stage</th>
                    <th className="px-3 py-3 min-w-[130px]">Progress</th>
                    {(columnPreset === 'finance' || columnPreset === 'all') && (
                      <>
                        <th className="px-3 py-3">AS (₹ Cr)</th>
                        <th className="px-3 py-3">TS (₹ Cr)</th>
                        <th className="px-3 py-3">Contract (₹ Cr)</th>
                        <th className="px-3 py-3">Exp (₹ Cr)</th>
                      </>
                    )}
                    {(columnPreset === 'timeline' || columnPreset === 'all') && (
                      <>
                        <th className="px-3 py-3">Commence</th>
                        <th className="px-3 py-3">Fixed End</th>
                        <th className="px-3 py-3">Delay Days</th>
                        <th className="px-3 py-3">Contractor</th>
                      </>
                    )}
                    {(columnPreset === 'risks' || columnPreset === 'all') && (
                      <>
                        <th className="px-3 py-3">Blockers</th>
                        <th className="px-3 py-3">5-Yr Scrutiny</th>
                        <th className="px-3 py-3">Risk Level</th>
                      </>
                    )}
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {works.length === 0 && !loading && (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                        No highway works match the selected filters. Try widening your criteria.
                      </td>
                    </tr>
                  )}
                  {works.map((work) => {
                    const bandColor = PROGRESS_BAND_COLORS[work.progress_band] || '#64748b';
                    return (
                      <tr
                        key={work.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedWork(work)}
                      >
                        {/* Work Code */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {work.work_code}
                          </span>
                          <div className="text-[10px] text-slate-400">FY {work.financial_year}</div>
                        </td>

                        {/* Name & Road */}
                        <td className="px-3.5 py-3">
                          <div className="font-medium text-slate-900 line-clamp-1">{work.work_name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">{work.road_number}</span>
                            <span>•</span>
                            <span className="truncate">{work.road_name}</span>
                          </div>
                        </td>

                        {/* Wing & Division */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{work.wing}</div>
                          <div className="text-[11px] text-slate-500">{work.division}</div>
                        </td>

                        {/* Scheme & Class */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {work.scheme}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{work.road_classification}</div>
                        </td>

                        {/* Stage */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              work.work_stage === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : work.work_stage === 'Work in Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : work.work_stage.includes('Delay') || work.delay_status.includes('delay')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {work.work_stage}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-800">{work.physical_progress_pct}%</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {work.progress_band}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, work.physical_progress_pct)}%`, backgroundColor: bandColor }}
                            />
                          </div>
                        </td>

                        {/* Financial Columns */}
                        {(columnPreset === 'finance' || columnPreset === 'all') && (
                          <>
                            <td className="px-3 py-3 font-semibold text-slate-800">₹{work.as_amount_cr}</td>
                            <td className="px-3 py-3 text-slate-600">₹{work.ts_amount_cr}</td>
                            <td className="px-3 py-3 text-slate-600">₹{work.contract_value_cr}</td>
                            <td className="px-3 py-3 font-semibold text-emerald-700">₹{work.expenditure_cr}</td>
                          </>
                        )}

                        {/* Timeline Columns */}
                        {(columnPreset === 'timeline' || columnPreset === 'all') && (
                          <>
                            <td className="px-3 py-3 whitespace-nowrap text-slate-500">{work.commencement_date || '—'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-slate-500">{work.fixed_end_date || '—'}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {work.overall_delay_days > 0 ? (
                                <span className="font-semibold text-rose-600">+{work.overall_delay_days} d</span>
                              ) : (
                                <span className="text-emerald-600">On time</span>
                              )}
                            </td>
                            <td className="px-3 py-3 truncate max-w-[140px] text-slate-600" title={work.contractor_name}>
                              {work.contractor_name || '—'}
                            </td>
                          </>
                        )}

                        {/* Risk & Blocker Columns */}
                        {(columnPreset === 'risks' || columnPreset === 'all') && (
                          <>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {work.issue_land_acquisition && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800" title="Land Acquisition">
                                    LA
                                  </span>
                                )}
                                {work.issue_utility_shifting && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800" title="Utility Shifting">
                                    UTL
                                  </span>
                                )}
                                {work.issue_court_approvals && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800" title="Court Stay">
                                    STAY
                                  </span>
                                )}
                                {work.issue_forest_clearance && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800" title="Forest Clearance">
                                    FOR
                                  </span>
                                )}
                                {!work.issue_land_acquisition && !work.issue_utility_shifting && !work.issue_court_approvals && !work.issue_forest_clearance && (
                                  <span className="text-slate-400 text-[10px]">None</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {work.five_year_renewal_eligibility === 'LOCKED_UNDER_5YR' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  LOCKED 5-YR
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                  {work.five_year_renewal_eligibility}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  work.risk_severity === 'CRITICAL'
                                    ? 'bg-rose-100 text-rose-800'
                                    : work.risk_severity === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {work.risk_severity}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Actions */}
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWork(work);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-amber-500 hover:text-white transition-colors"
                          >
                            360° Dossier
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="py-1 px-2 text-xs bg-white border border-slate-200 rounded"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>
                  Page {page} of {totalPages}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKS ANALYTICS & CHARTS (10 CHARTS A THROUGH J) */}
        {activeTab === 'charts' && charts && (
          <div className="space-y-4">
            {/* Row 1: Progress Bands (Chart A) & Potential Delays (Chart B) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart A */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      Chart A: Physical Progress Bands (Non-Overlapping)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Disjoint partition of works across completion spectrum (Click band to filter explorer)
                    </p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.progress_stages}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload.length > 0) {
                          const clickedBand = e.activePayload[0].payload.stage;
                          setSelectedBand(clickedBand);
                          setActiveTab('explorer');
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} Works (${item.payload.pct_of_total}%)`,
                          'Count'
                        ]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {charts.progress_stages.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={PROGRESS_BAND_COLORS[entry.stage] || '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-600" />
                      Chart B: Potential Delay Categorization
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Forecast delay days distribution against milestone baseline
                    </p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.potential_delay_distribution}
                        dataKey="count"
                        nameKey="delay_category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        label={(entry: any) => `${entry.delay_category || entry.name}: ${entry.count || entry.value}`}
                        onClick={(entry: any) => {
                          setSelectedDelay(entry.delay_category || entry.name);
                          setActiveTab('explorer');
                        }}
                      >
                        {charts.potential_delay_distribution.map((_, index) => (
                          <Cell key={`slice-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Agreement Delay (Chart C) & Pre-Construction Stages (Chart D) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart C */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Chart C: Agreement End-Date Slippage Distribution
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Elapsed time past contracted completion deadline
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.agreement_delay_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="delay_category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart D */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  Chart D: Pre-Construction Pipeline Stages
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Works pending statutory sanction, DPR finalization, or land clearance
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.pre_construction_stages}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3: Financial Performance (Chart E) & Circle Performance (Chart F) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart E */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Chart E: Financial Performance & Expenditure vs Sanction
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Cumulative financial absorption across AS, TS, Contract and Booked Expenditure
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { metric: 'AS Amount', value: charts.financial_performance.as_amount_cr, fill: '#3b82f6' },
                        { metric: 'TS Amount', value: charts.financial_performance.ts_amount_cr, fill: '#6366f1' },
                        { metric: 'Contract', value: charts.financial_performance.contract_value_cr, fill: '#f59e0b' },
                        { metric: 'Expenditure', value: charts.financial_performance.expenditure_cr, fill: '#10b981' }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`₹${v} Cr`, 'Amount']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#6366f1" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart F */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  Chart F: Circle-wise Delivery Matrix
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Comparative performance across Superintending Engineer Circles
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.circle_division_performance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="circle" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_works" name="Total" fill="#64748b" />
                      <Bar dataKey="completed_works" name="Completed" fill="#10b981" />
                      <Bar dataKey="delayed_works" name="Delayed" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 4: Scheme Performance (Chart G) & Critical Risks (Chart H) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart G */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Chart G: Scheme Performance Matrix
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Total works, km, and completion rate across CRIDP, CKICP, TNRSP, CMRDP, SASCI
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.scheme_performance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="scheme" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total_works" name="Total Works" fill="#6366f1" />
                      <Line yAxisId="right" type="monotone" dataKey="completion_rate_pct" name="Completion Rate (%)" stroke="#10b981" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart H */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Chart H: Critical Risk & Blocker Distribution
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Inter-departmental clearance hurdles impacting critical path
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={charts.risk_distribution}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="risk_type" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 5: Year Trends (Chart I) & CRIDP 5-Year Scrutiny (Chart J) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart I */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Chart I: Year-wise Sanction & Completion Trends
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Works sanctioned vs delivered over multi-year portfolio
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.year_trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="works_sanctioned" name="Sanctioned" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="works_completed" name="Completed" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="delayed_works" name="Delayed" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart J */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  Chart J: CRIDP 5-Year Renewal Scrutiny & Avoidable Cost Audit
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Audit breakdown of proposal stretches against 5-year warranty rule
                </p>
                <div className="h-64 flex flex-col justify-center space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-700">Eligible Length (&gt; 5 Yrs)</span>
                      <span>{charts.cridp_five_year_verification.eligible_length_km} km</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-700">Locked Under 5-Year Warranty</span>
                      <span>{charts.cridp_five_year_verification.recently_renewed_length_km} km</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700">Direct Overlap with Previous Work</span>
                      <span>{charts.cridp_five_year_verification.overlapping_length_km} km</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '9%' }} />
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                    <span>Works requiring technical scope revision:</span>
                    <span className="font-bold text-rose-600">
                      {charts.cridp_five_year_verification.works_requiring_review_count} Proposals
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 360° WORK DOSSIER SLIDE-OVER DRAWER */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedWork.scheme}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedWork.work_code}</h2>
                <div className="text-xs text-slate-500">{selectedWork.work_name}</div>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="p-5 space-y-6">
              {/* Section 1: Administrative Jurisdiction */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  1. Administrative Hierarchy & Jurisdiction
                </h4>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400">Wing:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.wing}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Circle:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.circle}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Division:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.division}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Subdivision / Section:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.subdivision || selectedWork.section || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">District:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.district}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Assembly Constituency:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.constituency}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Scope & Road Attributes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  2. Road Inventory & Technical Scope
                </h4>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400">Road Number & Name:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.road_number} — {selectedWork.road_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Classification:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.road_classification}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Chainage Stretch:</span>
                    <p className="font-semibold text-slate-800">
                      Km {selectedWork.start_chainage_km} to Km {selectedWork.end_chainage_km} ({selectedWork.project_length_km} km)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Completed Length:</span>
                    <p className="font-semibold text-emerald-700">{selectedWork.length_completed_km} km</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Work Type / Sub Type:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.work_type} / {selectedWork.work_sub_type}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Work Stage:</span>
                    <p className="font-semibold text-amber-700">{selectedWork.work_stage}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Financial Sanctions & Expenditure */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  3. Sanctions, G.O. & Expenditure
                </h4>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400">Administrative Sanction (AS):</span>
                    <p className="font-bold text-slate-900">₹{selectedWork.as_amount_cr} Cr</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Technical Sanction (TS):</span>
                    <p className="font-bold text-slate-900">₹{selectedWork.ts_amount_cr} Cr</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Contract Agreement Value:</span>
                    <p className="font-bold text-slate-900">₹{selectedWork.contract_value_cr} Cr</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Expenditure Incurred:</span>
                    <p className="font-bold text-emerald-700">₹{selectedWork.expenditure_cr} Cr ({selectedWork.financial_progress_pct}%)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">G.O. Number & Date:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.c_go_number || '—'} ({selectedWork.d_go_date || '—'})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Contractor Name:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.contractor_name || 'Tender in Progress'}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Progress & Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  4. Progress & Milestone Schedule
                </h4>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400">Physical Progress:</span>
                    <p className="font-bold text-blue-700">{selectedWork.physical_progress_pct}% ({selectedWork.progress_band})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Delay Category:</span>
                    <p className="font-bold text-rose-600">{selectedWork.delay_status} ({selectedWork.overall_delay_days} days)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Commencement Date:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.commencement_date || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Agreed Completion Date:</span>
                    <p className="font-semibold text-slate-800">{selectedWork.fixed_end_date || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Section 5: CRIDP 5-Year Scrutiny & Avoidable Expenditure */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  5. CRIDP 5-Year Scrutiny & Avoidable Cost Audit
                </h4>
                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">5-Year Renewal Eligibility:</span>
                    <span className="font-bold text-slate-900">{selectedWork.five_year_renewal_eligibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Previous Work Overlap:</span>
                    <span className="font-bold text-rose-600">{selectedWork.previous_work_overlap_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Potential Avoidable Expenditure:</span>
                    <span className="font-bold text-rose-700">₹{selectedWork.avoidable_expenditure_cr} Cr</span>
                  </div>
                  {selectedWork.root_cause && (
                    <div className="pt-2 border-t border-amber-200/60">
                      <span className="text-slate-500 font-semibold block mb-0.5">Identified Root Cause:</span>
                      <p className="text-slate-800">{selectedWork.root_cause}</p>
                    </div>
                  )}
                  {selectedWork.mitigation_status && (
                    <div className="pt-1">
                      <span className="text-slate-500 font-semibold block mb-0.5">Corrective Action / Mitigation:</span>
                      <p className="text-slate-800">{selectedWork.mitigation_status}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 flex justify-end">
              <button
                onClick={() => setSelectedWork(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorksAnalyticsPage;
