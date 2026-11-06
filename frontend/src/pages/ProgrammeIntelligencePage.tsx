import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  ProgrammeItem,
  CorridorAlignmentItem,
  TenderItem,
  LandParcelItem,
  LegalCaseItem,
  ProgrammeOverviewKPIs,
  ProjectItem
} from '../types';
import {
  Globe,
  Milestone,
  FileText,
  MapPin,
  Scale,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Search,
  Building,
  UserCheck,
  Shield,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  Coins,
  Gavel
} from 'lucide-react';

export const ProgrammeIntelligencePage: React.FC = () => {
  const location = useLocation();
  const initialProg = location.pathname.includes('tnrsp') ? 'TNRSP_II' : 'CKICP';

  const [activeProgrammeCode, setActiveProgrammeCode] = useState<string>(initialProg);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'tenders' | 'land' | 'legal' | 'ai'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [kpis, setKpis] = useState<ProgrammeOverviewKPIs | null>(null);
  const [alignments, setAlignments] = useState<CorridorAlignmentItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [landParcels, setLandParcels] = useState<LandParcelItem[]>([]);
  const [legalCases, setLegalCases] = useState<LegalCaseItem[]>([]);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadProgrammes();
  }, []);

  useEffect(() => {
    loadProgrammeData(activeProgrammeCode);
  }, [activeProgrammeCode]);

  const loadProgrammes = async () => {
    try {
      const data = await api.getProgrammes();
      setProgrammes(data);
    } catch (err) {
      console.error('Failed to load programmes', err);
    }
  };

  const loadProgrammeData = async (code: string) => {
    setLoading(true);
    try {
      const [kpisData, alignmentsData, projectsData, tendersData, landData, legalData] = await Promise.all([
        api.getProgrammeKPIs(code),
        api.getProgrammeAlignments(code),
        api.getProgrammeProjects(code),
        api.getProgrammeTenders(code),
        api.getProgrammeLandParcels(code),
        api.getProgrammeLegalCases(code)
      ]);
      setKpis(kpisData);
      setAlignments(alignmentsData);
      setProjects(projectsData);
      setTenders(tendersData);
      setLandParcels(landData);
      setLegalCases(legalData);
    } catch (err) {
      console.error('Error fetching programme details', err);
    } finally {
      setLoading(false);
    }
  };

  const currentProgramme = programmes.find((p) => p.code === activeProgrammeCode) || {
    code: activeProgrammeCode,
    name: activeProgrammeCode === 'CKICP' ? 'Chennai-Kanyakumari Industrial Corridor Project' : 'Tamil Nadu Road Sector Project II',
    parent_corridor: activeProgrammeCode === 'CKICP' ? 'East Coast Economic Corridor (ECEC)' : 'Core Road Network Upgradation',
    funding_agency: activeProgrammeCode === 'CKICP' ? 'Asian Development Bank (ADB)' : 'World Bank (IBRD)',
    approved_cost_cr: activeProgrammeCode === 'CKICP' ? 6448.0 : 5171.0,
    website_url: activeProgrammeCode === 'CKICP' ? 'https://www.ckicp.tn.gov.in/' : 'https://www.tnrsp.tn.gov.in/'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Multilateral Financed Programmes
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Official Live Intelligence
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {currentProgramme.name}
              <span className="text-sm font-medium px-3 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                {currentProgramme.code}
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Consolidated intelligence connecting strategic economic corridors, work packages, official tender notices (including 18-02-2026 publications), cadastral land acquisition (206.29 Ha TNRSP-II footprint & CKICP parcels), and Madras High Court litigation monitoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-xs space-y-1">
              <div className="text-slate-400 font-medium">Programme Leadership</div>
              <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                Thiru D. Baskara Pandian, IAS
              </div>
              <div className="text-[11px] text-slate-400">Project Director (A/C TNRSP, FAC CKICP)</div>
            </div>

            {currentProgramme.website_url && (
              <a
                href={currentProgramme.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Programme Switcher Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveProgrammeCode('CKICP')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeProgrammeCode === 'CKICP'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>CKICP (ADB Funded)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 text-sky-200">
              ₹6,448 Cr
            </span>
          </button>

          <button
            onClick={() => setActiveProgrammeCode('TNRSP_II')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeProgrammeCode === 'TNRSP_II'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>TNRSP-II (World Bank Funded)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 text-emerald-200">
              ₹5,171 Cr
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Sanctioned Outlay</span>
              <Coins className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{kpis.total_approved_outlay_cr.toLocaleString()} <span className="text-xs font-normal text-slate-500">Cr</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Exp: ₹{kpis.total_expenditure_cr.toFixed(1)} Cr</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Physical Progress</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {kpis.physical_progress_pct}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(kpis.physical_progress_pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Corridor Length</span>
              <Milestone className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {kpis.total_corridor_length_km} <span className="text-xs font-normal text-slate-500">km</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {kpis.total_projects} Projects • {kpis.total_work_packages} Packages
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Active Tenders</span>
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {kpis.active_tenders_count}{' '}
              <span className="text-xs font-normal text-slate-500">Notices</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              ₹{kpis.tenders_value_cr.toFixed(1)} Cr (Feb 2026)
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Land Possession</span>
              <MapPin className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {kpis.land_possession_pct}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {(kpis.land_acquisition_total_sq_m / 10000).toFixed(1)} Ha total footprint
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Legal Exposure</span>
              <Scale className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-xl font-bold text-red-700">
              ₹{kpis.litigation_financial_exposure_cr.toFixed(1)} <span className="text-xs font-normal text-slate-500">Cr</span>
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{kpis.active_stays_count} Active Stay Order{kpis.active_stays_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex items-center justify-between overflow-x-auto bg-slate-50/70">
          <div className="flex space-x-1 py-2">
            {[
              { id: 'overview', label: 'Corridors & GIS Map', icon: Milestone },
              { id: 'packages', label: 'Work Packages & Projects', icon: Layers },
              { id: 'tenders', label: `Tender Intelligence (${tenders.length})`, icon: FileSpreadsheet },
              { id: 'land', label: 'Cadastral Land Acquisition', icon: MapPin },
              { id: 'legal', label: `Litigation & Stays (${legalCases.length})`, icon: Scale },
              { id: 'ai', label: 'AI Risk & Clearances', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-sky-900 border border-slate-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => loadProgrammeData(activeProgrammeCode)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
              <p className="text-sm">Synthesising official programme intelligence records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CORRIDORS & GIS MAP */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Interactive Alignment Map Visualization */}
                    <div className="lg:col-span-2 bg-slate-950 rounded-xl p-5 border border-slate-800 text-white relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Milestone className="w-4 h-4 text-sky-400" />
                          <h3 className="text-sm font-semibold text-slate-200">
                            Tamil Nadu Strategic Corridor Alignments (GeoJSON Geometry)
                          </h3>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          {alignments.length} Corridors Plotted
                        </span>
                      </div>

                      {/* Schematic Map Representation */}
                      <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 h-80 flex flex-col justify-between relative overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Tamil Nadu State Outline Schematic */}
                          <path
                            d="M 280,30 C 330,25 360,50 370,80 C 360,110 375,130 380,160 C 370,210 340,260 300,295 C 280,305 260,280 250,250 C 230,210 210,160 220,120 C 230,70 250,40 280,30 Z"
                            fill="#0f172a"
                            stroke="#334155"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />

                          {/* Major Hub Cities */}
                          <circle cx="365" cy="75" r="4" fill="#38bdf8" />
                          <text x="375" y="78" fill="#94a3b8" fontSize="10">Chennai / Guindy</text>

                          <circle cx="340" cy="95" r="3.5" fill="#38bdf8" />
                          <text x="270" y="98" fill="#94a3b8" fontSize="10">Kancheepuram</text>

                          <circle cx="310" cy="165" r="3.5" fill="#38bdf8" />
                          <text x="318" y="168" fill="#94a3b8" fontSize="10">Tiruchirappalli</text>

                          <circle cx="260" cy="140" r="3.5" fill="#38bdf8" />
                          <text x="220" y="142" fill="#94a3b8" fontSize="10">Salem / Erode</text>

                          <circle cx="280" cy="230" r="3.5" fill="#38bdf8" />
                          <text x="235" y="234" fill="#94a3b8" fontSize="10">Madurai</text>

                          <circle cx="305" cy="285" r="3.5" fill="#38bdf8" />
                          <text x="315" y="288" fill="#94a3b8" fontSize="10">Tuticorin (VOC Port)</text>

                          {/* Render Corridor Alignments */}
                          {alignments.map((a, idx) => {
                            let strokeColor = idx % 2 === 0 ? '#0284c7' : '#10b981';
                            let pathD = 'M 340,95 L 350,115 L 360,140';
                            if (a.corridor_code === 'CKICP-C1') pathD = 'M 340,95 Q 355,120 360,145';
                            if (a.corridor_code === 'CKICP-C2') pathD = 'M 310,165 Q 315,220 305,285';
                            if (a.corridor_code === 'TNRSP-CRN-01') pathD = 'M 330,90 Q 335,115 350,140';
                            if (a.corridor_code === 'TNRSP-CRN-02') pathD = 'M 260,140 L 245,150 L 235,170';
                            if (a.corridor_code === 'TNRSP-CRN-03') pathD = 'M 260,240 Q 280,270 295,295';

                            return (
                              <g key={a.id}>
                                <path
                                  d={pathD}
                                  stroke={strokeColor}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  className="transition-all hover:stroke-amber-400"
                                />
                                <circle cx={pathD.split(' ')[1].split(',')[0]} cy={pathD.split(' ')[1].split(',')[1]} r="4" fill={strokeColor} />
                              </g>
                            );
                          })}
                        </svg>

                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 p-2 rounded text-[11px] text-slate-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-1 bg-sky-500 rounded" />
                            <span>Primary Economic Corridor (ADB / WB)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-1 bg-emerald-500 rounded" />
                            <span>Core Road Network Feeder</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Corridor Key Attributes */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-600" />
                        Corridor Alignment Registry
                      </h3>
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {alignments.map((a) => {
                          const districts = typeof a.districts === 'string' ? JSON.parse(a.districts) : a.districts || [];
                          return (
                            <div key={a.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-sky-300 transition-colors text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded text-[11px]">
                                  {a.corridor_code}
                                </span>
                                <span className="font-semibold text-slate-700">
                                  {a.total_length_km} km
                                </span>
                              </div>
                              <div className="font-medium text-slate-900">{a.name}</div>
                              <div className="text-slate-500 text-[11px]">
                                <span className="font-medium text-slate-700">Origin:</span> {a.start_location} →{' '}
                                <span className="font-medium text-slate-700">Destination:</span> {a.end_location}
                              </div>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {districts.map((d: string) => (
                                  <span key={d} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WORK PACKAGES & PROJECTS */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Sanctioned Corridor Implementation Projects
                      </h3>
                      <p className="text-xs text-slate-500">
                        Relational breakdown of parent projects and sub-work packages under {currentProgramme.code}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {projects.length} Dedicated Projects Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((p) => (
                      <div key={p.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-sky-100 text-sky-800">
                                {p.project_code}
                              </span>
                              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                                p.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'TENDERED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900">{p.title}</h4>
                            <p className="text-xs text-slate-600">{p.description}</p>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <div className="text-xs text-slate-500">Sanctioned Outlay</div>
                              <div className="text-base font-bold text-slate-900">₹{p.sanctioned_cost_cr.toFixed(2)} Cr</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Expenditure</div>
                              <div className="text-base font-bold text-sky-700">₹{p.expenditure_to_date_cr.toFixed(2)} Cr</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bars & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Physical Milestone Progress</span>
                              <span className="font-semibold text-slate-900">{p.physical_progress_pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-2 rounded-full"
                                style={{ width: `${p.physical_progress_pct}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Financial Disbursement Progress</span>
                              <span className="font-semibold text-slate-900">{p.financial_progress_pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-sky-600 h-2 rounded-full"
                                style={{ width: `${p.financial_progress_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-3">
                            <span>Executing Contractor: <strong className="text-slate-700">{p.contractor_name || 'Under Competitive Bidding'}</strong></span>
                            <span>•</span>
                            <span>Road Classification: <strong className="text-slate-700">{p.road_type}</strong></span>
                          </div>
                          <div>Division: Tambaram / Kancheepuram</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TENDER INTELLIGENCE & 18-02-2026 NOTICES */}
              {activeTab === 'tenders' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded">
                          Official Publications: 18-02-2026
                        </span>
                        <span className="text-xs text-amber-800 font-medium">
                          Asian Development Bank (ADB) Project Procurement
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-amber-950">
                        CKICP Official Tender Notifications (Kancheepuram & Tiruchirappalli)
                      </h3>
                      <p className="text-xs text-amber-800 max-w-2xl">
                        4 official tender packages published on 18-02-2026 with international and national competitive bidding procedures. Bid deadlines late March 2026.
                      </p>
                    </div>

                    <div className="bg-white/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        Verification Standard
                      </div>
                      <div className="text-[11px] text-amber-700">
                        Status: PUBLISHED / BIDDING ACTIVE. No winners fabricated prior to formal technical and financial opening.
                      </div>
                    </div>
                  </div>

                  {/* Tenders Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Tender Ref & Package</th>
                          <th className="py-3 px-4">Scope of Works</th>
                          <th className="py-3 px-4 text-right">Estimated Cost</th>
                          <th className="py-3 px-4">EMD / Type</th>
                          <th className="py-3 px-4">Submission Deadline</th>
                          <th className="py-3 px-4">Official Document</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tenders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No active tenders under competitive bidding for this programme. All packages awarded/completed.
                            </td>
                          </tr>
                        ) : (
                          tenders.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-sky-900">{t.package_number}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{t.tender_notice_number}</div>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  {t.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 max-w-sm">
                                <div className="font-medium text-slate-900">{t.title}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{t.funding_source}</div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                                ₹{t.estimated_cost_cr.toFixed(2)} Cr
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-medium text-slate-800">₹{t.earnest_money_deposit_lakhs?.toFixed(2)} L</div>
                                <div className="text-[11px] text-slate-500">{t.procurement_type}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-amber-700">{t.bid_submission_deadline}</div>
                                <div className="text-[11px] text-slate-500">
                                  Tech Open: {t.technical_opening_date || 'TBD'}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                {t.pdf_filename ? (
                                  <a
                                    href={t.official_source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] border border-slate-300 transition-colors shadow-2xs"
                                    title="Download official notification PDF"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-red-600" />
                                    <span>{t.pdf_filename}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Gazette Notice</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CADASTRAL LAND ACQUISITION MATRIX */}
              {activeTab === 'land' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4.5 h-4.5 text-sky-600" />
                        Cadastral Land Acquisition & Statutory Notifications
                      </h3>
                      <p className="text-xs text-slate-500">
                        Taluk and village survey level breakdown with Tamil Nadu Highways Act Section 15(2), 15(1), and 19(1) status.
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <strong>Verified Grounding:</strong> TNRSP-II official dataset covers 16 packages totaling exactly <strong>206.29 Hectares (2,062,934 sq.m)</strong>.
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Parcel Ref & Location</th>
                          <th className="py-3 px-4">Category & Extent</th>
                          <th className="py-3 px-4">Statutory Milestones</th>
                          <th className="py-3 px-4 text-right">Compensation (Assessed vs Paid)</th>
                          <th className="py-3 px-4">Possession Status</th>
                          <th className="py-3 px-4">Litigation Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {landParcels.map((lp) => (
                          <tr key={lp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{lp.parcel_reference}</div>
                              <div className="text-[11px] text-slate-600">
                                {lp.district} • {lp.taluk} Tk • {lp.village}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                SF: {lp.survey_numbers_json}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                lp.land_category === 'PRIVATE_PATTA'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {lp.land_category.replace('_', ' ')}
                              </span>
                              <div className="font-semibold text-slate-800 mt-1">
                                {lp.extent_sq_meters.toLocaleString()} sq.m
                              </div>
                              <div className="text-[11px] text-slate-500">
                                ({lp.extent_hectares.toFixed(2)} Ha)
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[11px] space-y-0.5">
                              <div><span className="text-slate-400">15(2) Gazette:</span> {lp.sec15_2_gazette_date || 'N/A'}</div>
                              <div><span className="text-slate-400">15(1) Decl:</span> {lp.sec15_1_declaration_date || 'N/A'}</div>
                              <div><span className="text-slate-400">19(1) Award:</span> {lp.sec19_1_award_date || 'Pending'}</div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-slate-900 text-sm">
                                ₹{lp.compensation_disbursed_cr.toFixed(2)} Cr
                              </div>
                              <div className="text-[11px] text-slate-500">
                                of ₹{lp.total_compensation_assessed_cr.toFixed(2)} Cr Assessed
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                lp.possession_status === 'FULL_POSSESSION'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {lp.possession_status === 'FULL_POSSESSION' ? '100% Handed Over' : 'Partial Possession'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {lp.has_litigation ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    High Court Writ
                                  </span>
                                  <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                    {lp.court_case_reference}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clear
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: LITIGATION & HIGH COURT STAYS */}
              {activeTab === 'legal' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Scale className="w-4.5 h-4.5 text-red-600" />
                        Litigation & High Court Interim Stays Registry
                      </h3>
                      <p className="text-xs text-slate-500">
                        Madras High Court Principal Seat & Madurai Bench active disputes impacting project delivery
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {legalCases.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                        No active litigation records registered for this programme.
                      </div>
                    ) : (
                      legalCases.map((c) => (
                        <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{c.case_number}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                  {c.court_name}
                                </span>
                                {c.interim_stay_granted ? (
                                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> INTERIM STAY ACTIVE
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                                    {c.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600">
                                <strong>Petitioner:</strong> {c.petitioner} vs. <strong>Respondent:</strong> {c.respondent}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-slate-500">Financial Exposure</div>
                              <div className="text-base font-bold text-red-700">₹{c.potential_financial_exposure_cr.toFixed(2)} Cr</div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <strong>Subject & Prayer:</strong> {c.subject_matter} — <em>"{c.prayer_summary}"</em>
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                            <div>
                              Standing Counsel: <strong className="text-slate-700">{c.standing_counsel_name}</strong>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>Delay Impact: <strong className="text-red-700">+{c.delay_impact_months} Months</strong></span>
                              <span>•</span>
                              <span>Next Hearing: <strong className="text-slate-800">{c.next_hearing_date || 'Awaiting Cause List'}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: AI RISK & CLEARANCES */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-sky-500/20 border border-sky-400/30 rounded-xl">
                      <Sparkles className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        AI Corridor Executive Diagnostic & Bottleneck Synthesis
                      </h3>
                      <p className="text-xs text-slate-300">
                        Automated statutory cross-referencing between revenue award notifications, utility relocation notices, and contractor work orders.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Bottleneck #1: Revenue Award & Dispossession
                        </span>
                        <span className="text-xs text-slate-500 font-medium">SH-116 Walajabad Section</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Writ Petition No. 11420/2024 at km 16/200 Holding Up 1.4 km Corridor Stretch
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Stay order granted by Madras High Court on Survey No. 114/2B creates an unworkable gap in Package 01. Special DRO (LA) has completed solatium assessment; vacation petition filed under Clause 4.
                      </p>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                        <strong>Recommended Administrative Intervention:</strong> Move urgency memo before Principal Bench for early hearing; tender deposit of revised compensation with Registrar General.
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          Bottleneck #2: TANGEDCO Utility Shifting
                        </span>
                        <span className="text-xs text-slate-500 font-medium">SH-58 Chengalpattu Link</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Relocation of 42 High Tension (HT) Poles Awaiting Line Clearances
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Deposit work amount of ₹1.85 Cr remitted to TANGEDCO Kancheepuram circle on 14.10.2025. Joint field inspection completed; final shutdown schedule pending confirmation from SE (EDC).
                      </p>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                        <strong>Recommended Administrative Intervention:</strong> Secretary (Highways) bilateral coordination memo to Chairman & MD, TANGEDCO for weekend power shutdown approval.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammeIntelligencePage;

