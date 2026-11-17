import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  GitBranch,
  BarChart3,
  ShieldCheck,
  AlertOctagon,
  FileText,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Compass,
  RefreshCw,
  FolderTree,
  MapPin,
  Check,
  X,
  FileCheck2,
  TrendingUp,
  Landmark
} from 'lucide-react';
import {
  OrganisationHierarchyTree,
  OrganisationHierarchyNode,
  OrganisationKPIs,
  HistoricalOrganisationMappingItem,
  DataQualityMappingExceptionItem,
  OrganisationFilterOptions,
  UnifiedWorkRecord
} from '../types';
import { organisationAPI, worksAnalyticsAPI } from '../services/api';
import {
  OrganisationFilterBar,
  OrganisationFilterState
} from '../components/OrganisationFilterBar';
import {
  fallbackOrganisationKPIs,
  fallbackHierarchyTree,
  fallbackHistoricalMappings,
  fallbackExceptions,
  fallbackOrganisationFilterOptions
} from '../data/fallbackOrganisation';

export const OrganisationIntelligencePage: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'explorer' | 'works' | 'cridp' | 'risks' | 'reorganisation' | 'exceptions'
  >('overview');

  // Filter state
  const [filterOptions, setFilterOptions] = useState<OrganisationFilterOptions>(
    fallbackOrganisationFilterOptions
  );
  const [selectedFilters, setSelectedFilters] = useState<OrganisationFilterState>({
    wing: 'CM'
  });

  // Data state
  const [kpis, setKPIs] = useState<OrganisationKPIs>(fallbackOrganisationKPIs);
  const [hierarchyTree, setHierarchyTree] = useState<OrganisationHierarchyTree>(fallbackHierarchyTree);
  const [historicalMappings, setHistoricalMappings] = useState<HistoricalOrganisationMappingItem[]>(
    fallbackHistoricalMappings
  );
  const [exceptions, setExceptions] = useState<DataQualityMappingExceptionItem[]>(fallbackExceptions);
  const [exceptionFilter, setExceptionFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Unit for Dossier (Tab B)
  const [selectedUnit, setSelectedUnit] = useState<OrganisationHierarchyNode | null>(null);
  const [unitAncestors, setUnitAncestors] = useState<OrganisationHierarchyNode[]>([]);
  const [unitWorks, setUnitWorks] = useState<UnifiedWorkRecord[]>([]);
  const [unitLoading, setUnitLoading] = useState<boolean>(false);

  // Tree expansion state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'DEPT-TN-HW': true,
    'WING-CM': true,
    'REG-CM-CHN': true
  });

  // Exception resolution modal state
  const [resolvingException, setResolvingException] = useState<DataQualityMappingExceptionItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<string>('APPROVE_SUGGESTION');
  const [correctionNotes, setCorrectionNotes] = useState<string>('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<boolean>(false);

  // Fetch initial master data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const [kpisData, treeData, filterData, mappingsData, exceptionsData] = await Promise.all([
          organisationAPI.getKPIs(),
          organisationAPI.getHierarchyTree(),
          organisationAPI.getFilterOptions(),
          organisationAPI.getHistoricalMappings(),
          organisationAPI.getExceptions()
        ]);
        setKPIs(kpisData);
        setHierarchyTree(treeData);
        setFilterOptions(filterData);
        setHistoricalMappings(mappingsData);
        setExceptions(exceptionsData);
        
        // Default selected unit: Chennai Region
        if (treeData.root.children.length > 0 && treeData.root.children[0].children.length > 0) {
          const defaultNode = treeData.root.children[0].children[0];
          setSelectedUnit(defaultNode);
          loadUnitDetails(defaultNode.id);
        }
      } catch (err) {
        console.error('Error loading organisation blueprint data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  // Load Unit Dossier details
  const loadUnitDetails = async (unitId: string) => {
    setUnitLoading(true);
    try {
      const details = await organisationAPI.getUnitDetails(unitId);
      setSelectedUnit(details.unit);
      setUnitAncestors(details.ancestors);
      setUnitWorks(details.assigned_works);
    } catch (err) {
      console.error('Failed to load unit details:', err);
    } finally {
      setUnitLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleResolveExceptionSubmit = async () => {
    if (!resolvingException) return;
    setIsSubmittingResolution(true);
    try {
      const updated = await organisationAPI.resolveException({
        exception_id: resolvingException.id,
        review_status: resolutionAction === 'REJECT' ? 'REJECTED' : 'VERIFIED_APPROVED',
        resolution_action: resolutionAction,
        correction_notes: correctionNotes || 'Approved against G.O.(Ms) No. 43 verification'
      });
      setExceptions(prev => prev.map(e => e.id === updated.id ? updated : e));
      setResolvingException(null);
      setCorrectionNotes('');
    } catch (err) {
      console.error('Failed to resolve exception:', err);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  // Filtered exceptions
  const filteredExceptions = useMemo(() => {
    if (exceptionFilter === 'ALL') return exceptions;
    return exceptions.filter(e => e.review_status === exceptionFilter);
  }, [exceptions, exceptionFilter]);

  // Search filter for historical mappings
  const [historySearch, setHistorySearch] = useState('');
  const filteredHistoricalMappings = useMemo(() => {
    if (!historySearch.trim()) return historicalMappings;
    const q = historySearch.toLowerCase().trim();
    return historicalMappings.filter(
      m =>
        m.previous_unit_name.toLowerCase().includes(q) ||
        m.reorganised_unit_name.toLowerCase().includes(q) ||
        m.reorganised_circle_name.toLowerCase().includes(q) ||
        m.reorganised_region_name.toLowerCase().includes(q)
    );
  }, [historicalMappings, historySearch]);

  // C&M Regions from hierarchy tree
  const cmRegions = useMemo(() => {
    const cmWing = hierarchyTree.root.children.find(c => c.wing_code === 'CM');
    return cmWing ? cmWing.children : [];
  }, [hierarchyTree]);

  // NH Wing from hierarchy tree
  const nhWing = useMemo(() => {
    return hierarchyTree.root.children.find(c => c.wing_code === 'NH');
  }, [hierarchyTree]);

  // Recursive tree node renderer
  const renderTreeNode = (node: OrganisationHierarchyNode, level: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedUnit?.id === node.id;

    const badgeColor =
      node.unit_type === 'DEPARTMENT'
        ? 'bg-slate-800 text-white'
        : node.unit_type === 'WING'
        ? 'bg-amber-700 text-white'
        : node.unit_type === 'REGION'
        ? 'bg-blue-700 text-white'
        : node.unit_type === 'CIRCLE'
        ? 'bg-emerald-700 text-white'
        : node.unit_type === 'DIVISION'
        ? 'bg-purple-700 text-white'
        : 'bg-slate-200 text-slate-800';

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-amber-100/70 border border-amber-300'
              : 'hover:bg-slate-100/80 border border-transparent'
          }`}
          style={{ paddingLeft: `${Math.max(8, level * 20)}px` }}
          onClick={() => {
            loadUnitDetails(node.id);
            if (hasChildren && !isExpanded) toggleNode(node.id);
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0.5 text-slate-500 hover:text-slate-900 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4" />
          )}

          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {node.unit_type}
          </span>

          <span className={`text-xs font-medium truncate ${isSelected ? 'text-amber-900 font-semibold' : 'text-slate-800'}`}>
            {node.name}
          </span>

          {node.total_length_km > 0 && (
            <span className="text-[11px] text-slate-500 ml-auto flex-shrink-0">
              {node.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
            </span>
          )}

          {node.critical_risk_count > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-full ml-1">
              {node.critical_risk_count} risks
            </span>
          )}

          {node.status === 'PENDING_VERIFICATION' && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 font-medium px-1.5 py-0.2 rounded ml-1">
              Pending Verification
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-4 pl-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
                  <Landmark className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">
                      Organisation & Jurisdiction Intelligence
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      G.O.(Ms) No. 43 Blueprint
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Highways & Minor Ports (HN1) Department | Statutory C&M Reorganisation | Effective 15 June 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Apex Stats Quick Summary */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-right">
                <div className="text-[11px] text-slate-500 font-medium">C&M Regions</div>
                <div className="text-sm font-bold text-slate-900">{kpis.cm_wing.regions} Zones</div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-right">
                <div className="text-[11px] text-slate-500 font-medium">Circles / Divisions</div>
                <div className="text-sm font-bold text-slate-900">
                  {kpis.cm_wing.circles} / {kpis.cm_wing.divisions}
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-right">
                <div className="text-[11px] text-slate-500 font-medium">Subdivisions</div>
                <div className="text-sm font-bold text-slate-900">{kpis.cm_wing.subdivisions}</div>
              </div>
              <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-right">
                <div className="text-[11px] text-amber-800 font-medium">Total Road Length</div>
                <div className="text-sm font-bold text-amber-950">
                  {kpis.cm_wing.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-3 border-t border-slate-100 pt-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Statewide Organisation Overview
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'explorer'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Organisation Explorer (Tree)
            </button>
            <button
              onClick={() => setActiveTab('works')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'works'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Works Analytics Sync
            </button>
            <button
              onClick={() => setActiveTab('cridp')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cridp'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              CRIDP Renewal Verification
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'risks'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Risk & Financial Exposure
            </button>
            <button
              onClick={() => setActiveTab('reorganisation')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reorganisation'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Historical Reorganisation (Annexure-III)
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-full font-bold">
                19
              </span>
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'exceptions'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Data Quality & Exceptions
              {exceptions.filter(e => e.review_status === 'FLAGGED_FOR_REVIEW').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded-full font-bold">
                  {exceptions.filter(e => e.review_status === 'FLAGGED_FOR_REVIEW').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Universal Filter Bar */}
        <OrganisationFilterBar
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onChange={(newFilters) => setSelectedFilters(newFilters)}
          onReset={() => setSelectedFilters({ wing: 'CM' })}
        />

        {/* ============================================================== */}
        {/* TAB A: STATEWIDE ORGANISATION OVERVIEW                         */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* 4 C&M Regional Zone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cmRegions.map((region) => {
                const isSelected = selectedFilters.region === region.id;
                return (
                  <div
                    key={region.id}
                    className={`bg-white rounded-xl border p-4 shadow-xs transition-all hover:shadow-md cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        wing: 'CM',
                        region: isSelected ? undefined : region.id,
                        circle: undefined,
                        division: undefined,
                        subdivision: undefined
                      }));
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          ZONE
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">
                          {region.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          HQ: {region.headquarters}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Circles (SEs):</span>
                        <span className="font-bold text-slate-800">{region.children.length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Divisions (EEs):</span>
                        <span className="font-bold text-slate-800">
                          {region.children.reduce((acc, c) => acc + c.children.length, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Subdivisions (ADEs):</span>
                        <span className="font-bold text-slate-800">
                          {region.children.reduce(
                            (acc, c) =>
                              acc + c.children.reduce((dAcc, d) => dAcc + d.children.length, 0),
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Road Length:</span>
                        <span className="font-bold text-amber-700">
                          {region.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Active Works:</span>
                        <span className="font-bold text-slate-800">{region.active_works_count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Avoidable Exposure:</span>
                        <span className="font-bold text-red-600">₹{region.avoidable_cost_cr.toFixed(1)} Cr</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('explorer');
                        loadUnitDetails(region.id);
                      }}
                      className="mt-3 w-full text-center text-xs text-amber-700 font-semibold py-1.5 rounded bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1"
                    >
                      Inspect Zone Hierarchy <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* National Highways Demarcation Banner */}
            {nhWing && (
              <div className="bg-yellow-50/70 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 text-yellow-800 rounded-lg flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-yellow-950 text-sm">
                        National Highways (NH) Wing Jurisdiction
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 border border-yellow-300">
                        PENDING VERIFICATION
                      </span>
                    </div>
                    <p className="text-xs text-yellow-800 mt-1">
                      Statutory Note: National Highways operates 4 Circles (Chennai NH, Salem NH, Madurai NH, Tirunelveli NH) and 11 Divisions, isolated from C&M under G.O. 43. Road length metrics and project cross-allocations remain subject to independent verification with MoRTH / NHAI.
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-yellow-900">
                      <span>4 NH Circles</span>
                      <span>•</span>
                      <span>11 NH Divisions</span>
                      <span>•</span>
                      <span>170 Ongoing Works (Isolated)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statutory Overview and Governance Principles */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Statutory Governance Framework (G.O. Ms No. 43 / 13-03-2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">1. Quad-Zonal Command</h4>
                  <p>
                    Establishes four Chief Engineer zones (Chennai, Trichy, Madurai, Coimbatore) governing all 68,149.618 km of State Highways, Major District Roads and Other District Roads.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">2. Single Canonical Identifier</h4>
                  <p>
                    Each unit carries a stable ID (e.g. <code>REG-CM-CHN</code>, <code>CIR-CM-TVL</code>, <code>DIV-CM-CHN-TVL</code>), permanently preventing duplicate road length or project counts.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">3. Non-Destructive Continuity</h4>
                  <p>
                    Pre-reorganisation records are safely indexed via 19 Annexure-III mapping bridges, ensuring historical CRIDP and audit records retain complete fidelity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB B: ORGANISATION EXPLORER (TREE & DOSSIER)                 */}
        {/* ============================================================== */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tree Navigator */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Hierarchy Tree</h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  {hierarchyTree.total_units} Units Mapped
                </span>
              </div>
              <div className="max-h-[650px] overflow-y-auto space-y-1 pr-1">
                {renderTreeNode(hierarchyTree.root)}
              </div>
            </div>

            {/* Selected Unit Dossier */}
            <div className="lg:col-span-7 space-y-4">
              {selectedUnit ? (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  {/* Unit Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                          {selectedUnit.unit_type}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedUnit.name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Canonical Code: <code className="font-mono text-amber-800 font-semibold">{selectedUnit.code}</code> | Wing: {selectedUnit.wing_code}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Jurisdiction Road Length</div>
                      <div className="text-base font-bold text-amber-700">
                        {selectedUnit.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                      </div>
                    </div>
                  </div>

                  {/* Dossier Attributes Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Headquarters</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedUnit.headquarters || 'State Headquarters'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Designated Post</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedUnit.chief_engineer_post || 'Divisional Engineer'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Active Works Count</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedUnit.active_works_count} Works
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Critical Delay Risks</div>
                      <div className="text-xs font-bold text-red-600 mt-0.5">
                        {selectedUnit.critical_risk_count} Critical Risks
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Avoidable Exposure</div>
                      <div className="text-xs font-bold text-amber-900 mt-0.5">
                        ₹{selectedUnit.avoidable_cost_cr.toFixed(1)} Cr
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Direct Subordinate Units</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedUnit.children ? selectedUnit.children.length : 0} Units
                      </div>
                    </div>
                  </div>

                  {/* Immediate Children Overview */}
                  {selectedUnit.children && selectedUnit.children.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">
                        Subordinate Jurisdictions ({selectedUnit.children.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {selectedUnit.children.map((child) => (
                          <div
                            key={child.id}
                            onClick={() => loadUnitDetails(child.id)}
                            className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{child.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {child.total_length_km.toFixed(1)} km | {child.active_works_count} works
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Works Table */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800">
                        Assigned Works in Jurisdiction ({unitWorks.length})
                      </h4>
                      <button
                        onClick={() => setActiveTab('works')}
                        className="text-xs text-amber-700 font-medium hover:underline flex items-center gap-1"
                      >
                        Open in Works Analytics <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {unitLoading ? (
                      <div className="py-6 text-center text-xs text-slate-500">Loading works...</div>
                    ) : unitWorks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No active works directly registered under this unit.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Work Code / Name</th>
                              <th className="py-2 px-3">Scheme</th>
                              <th className="py-2 px-3">Stage</th>
                              <th className="py-2 px-3 text-right">Length (km)</th>
                              <th className="py-2 px-3 text-right">Sanction (Cr)</th>
                              <th className="py-2 px-3 text-center">Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {unitWorks.slice(0, 6).map((w) => (
                              <tr key={w.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3">
                                  <div className="font-semibold text-slate-900 truncate max-w-xs">
                                    {w.work_name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {w.work_code}
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {w.scheme}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-slate-700">{w.work_stage}</td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {w.project_length_km ? w.project_length_km.toFixed(2) : '-'}
                                </td>
                                <td className="py-2 px-3 text-right font-medium">
                                  ₹{w.as_amount_cr.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      w.risk_severity === 'CRITICAL'
                                        ? 'bg-red-100 text-red-800'
                                        : w.risk_severity === 'HIGH'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {w.risk_severity}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                  Select an organisation unit from the tree on the left to inspect its statutory dossier.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB C: WORKS ANALYTICS SYNC                                    */}
        {/* ============================================================== */}
        {activeTab === 'works' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                    Synchronized Works Analytics Explorer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Governed by active jurisdiction filters: {selectedFilters.wing || 'All Wings'} → {selectedFilters.region || 'All Regions'} → {selectedFilters.circle || 'All Circles'} → {selectedFilters.division || 'All Divisions'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/works-analytics"
                    className="text-xs bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-700 flex items-center gap-1"
                  >
                    Open Standalone Works Analytics <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Works Table synced with current jurisdiction */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Work Name & Code</th>
                      <th className="py-2.5 px-3">Circle / Division</th>
                      <th className="py-2.5 px-3">Scheme</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3 text-right">Length (km)</th>
                      <th className="py-2.5 px-3 text-right">Sanction (Cr)</th>
                      <th className="py-2.5 px-3 text-right">Exp (Cr)</th>
                      <th className="py-2.5 px-3 text-center">Progress</th>
                      <th className="py-2.5 px-3 text-center">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unitWorks.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{w.work_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{w.work_code}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{w.circle}</div>
                          <div className="text-[10px] text-slate-400">{w.division}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {w.scheme}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{w.work_stage}</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {w.project_length_km ? w.project_length_km.toFixed(2) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          ₹{w.as_amount_cr.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          ₹{w.expenditure_cr.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="w-16 bg-slate-200 rounded-full h-2 mx-auto overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, w.physical_progress_pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">{w.physical_progress_pct.toFixed(0)}%</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.risk_severity === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : w.risk_severity === 'HIGH'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {w.risk_severity}
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

        {/* ============================================================== */}
        {/* TAB D: CRIDP VERIFICATION DRILL-DOWN                           */}
        {/* ============================================================== */}
        {activeTab === 'cridp' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    CRIDP Five-Year Renewal & Historical Work Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory five-year road renewal eligibility verification mapped to G.O. 43 reorganised divisions.
                  </p>
                </div>
                <a
                  href="/cridp-verification"
                  className="text-xs bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1 self-start"
                >
                  Open Full CRIDP Verification Engine <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* CRIDP Renewal Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[11px] text-emerald-800 font-semibold">Eligible Stretches (&gt;5 Yrs)</div>
                  <div className="text-lg font-bold text-emerald-950 mt-1">42,890.5 km</div>
                  <div className="text-[10px] text-emerald-700">Cleared for CRIDP Renewal 2026-27</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-[11px] text-red-800 font-semibold">Overlapping / Premature</div>
                  <div className="text-lg font-bold text-red-950 mt-1">1,480.2 km</div>
                  <div className="text-[10px] text-red-700">Flagged: Sanctioned within 5 years</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[11px] text-amber-800 font-semibold">Chief Engineer Exceptions</div>
                  <div className="text-lg font-bold text-amber-950 mt-1">34 Stretches</div>
                  <div className="text-[10px] text-amber-700">Documented Premature Deterioration</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-600 font-semibold">Prevented Duplicate Cost</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">₹318.5 Cr</div>
                  <div className="text-[10px] text-slate-500">Saved by automated chainage audit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB E: RISK & FINANCIAL EXPOSURE                               */}
        {/* ============================================================== */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Statewide Risk & Avoidable Financial Exposure by Zone
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Roll-up of execution delays, unresolved land/utility blockers, and premature renewal proposals aggregated to Chief Engineer zones.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">C&M Region (Zone)</th>
                      <th className="py-2.5 px-3 text-right">Road Length (km)</th>
                      <th className="py-2.5 px-3 text-right">Active Works</th>
                      <th className="py-2.5 px-3 text-right">Critical Risks</th>
                      <th className="py-2.5 px-3 text-right">Delayed Works</th>
                      <th className="py-2.5 px-3 text-right">Avoidable Exposure (₹ Cr)</th>
                      <th className="py-2.5 px-3 text-center">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cmRegions.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{reg.name}</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {reg.total_length_km.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">{reg.active_works_count}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-red-600">
                          {reg.critical_risk_count}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-amber-700">
                          {Math.round(reg.active_works_count * 0.15)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-red-700">
                          ₹{reg.avoidable_cost_cr.toFixed(1)} Cr
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            COMPLIANT
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

        {/* ============================================================== */}
        {/* TAB F: HISTORICAL REORGANISATION (G.O. 43 ANNEXURE-III)       */}
        {/* ============================================================== */}
        {activeTab === 'reorganisation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-600" />
                    Historical Organisation Redesignations (G.O. Ms No. 43 Annexure-III)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory Old-to-New Division mapping register maintaining continuous audit trail across reorganisation boundaries.
                  </p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search historical division..."
                    className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Previous Historical Unit</th>
                      <th className="py-2.5 px-3">Previous Circle / Region</th>
                      <th className="py-2.5 px-3">Reorganised Unit (G.O. 43)</th>
                      <th className="py-2.5 px-3">Reorganised Circle</th>
                      <th className="py-2.5 px-3">Mapping Type</th>
                      <th className="py-2.5 px-3">Effective Date</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistoricalMappings.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {m.previous_unit_name}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{m.previous_circle_name || '-'}</div>
                          <div className="text-[10px] text-slate-400">{m.previous_region_name || '-'}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-amber-900">{m.reorganised_unit_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{m.reorganised_unit_id}</div>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {m.reorganised_circle_name}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {m.mapping_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">{m.effective_date}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {m.verification_status}
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

        {/* ============================================================== */}
        {/* TAB G: DATA QUALITY & MAPPING EXCEPTIONS                       */}
        {/* ============================================================== */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Data Quality & Hierarchy Mapping Exception Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    Flagged legacy records with ambiguous jurisdictions, cross-district stretches or outdated circle references requiring statutory review.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Status:</span>
                  <select
                    value={exceptionFilter}
                    onChange={(e) => setExceptionFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ALL">All Exceptions ({exceptions.length})</option>
                    <option value="FLAGGED_FOR_REVIEW">Flagged for Review</option>
                    <option value="VERIFIED_APPROVED">Verified Approved</option>
                    <option value="SYSTEM_RESOLVED">System Resolved</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Exception Type</th>
                      <th className="py-2.5 px-3">Source Record</th>
                      <th className="py-2.5 px-3">Raw Value / Field</th>
                      <th className="py-2.5 px-3">Suggested Unit (G.O. 43)</th>
                      <th className="py-2.5 px-3 text-center">Confidence</th>
                      <th className="py-2.5 px-3 text-center">Review Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExceptions.map((exc) => (
                      <tr key={exc.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                            {exc.exception_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{exc.source_record_id}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {exc.source_record_title || exc.source_record_type}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="font-mono text-red-700 font-medium">"{exc.raw_value}"</div>
                          <div className="text-[10px] text-slate-400">Field: {exc.attempted_field}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">
                            {exc.suggested_unit_id || 'Not Mapped'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {(exc.confidence_score * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              exc.review_status === 'VERIFIED_APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exc.review_status === 'FLAGGED_FOR_REVIEW'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {exc.review_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {exc.review_status === 'FLAGGED_FOR_REVIEW' ? (
                            <button
                              onClick={() => {
                                setResolvingException(exc);
                                setResolutionAction('APPROVE_SUGGESTION');
                                setCorrectionNotes('');
                              }}
                              className="px-2.5 py-1 text-xs bg-amber-600 text-white font-semibold rounded hover:bg-amber-700"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Resolved</span>
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
      </main>

      {/* Exception Resolution Modal */}
      {resolvingException && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Resolve Statutory Mapping Exception
              </h3>
              <button
                onClick={() => setResolvingException(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500">Record:</span>{' '}
                <span className="font-bold text-slate-900">{resolvingException.source_record_id}</span> - {resolvingException.source_record_title}
              </div>
              <div>
                <span className="text-slate-500">Ambiguous Raw Value:</span>{' '}
                <span className="font-mono text-red-700 font-bold">"{resolvingException.raw_value}"</span>
              </div>
              <div>
                <span className="text-slate-500">Suggested Canonical Unit:</span>{' '}
                <span className="font-bold text-amber-900">{resolvingException.suggested_unit_id}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Action</label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="APPROVE_SUGGESTION">Approve Suggested Unit Assignment</option>
                  <option value="MAINTAIN_CURRENT_ASSIGNMENT">Maintain Current Assignment (Approved Exception)</option>
                  <option value="REJECT">Reject & Request Manual Division Re-Verification</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verification Notes / Statutory Justification
                </label>
                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="Enter Chief Engineer verification notes against G.O. 43..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setResolvingException(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveExceptionSubmit}
                  disabled={isSubmittingResolution}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSubmittingResolution ? 'Saving...' : 'Confirm Statutory Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
