import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { VerifiedOrganisationStructure } from '../types';
import {
  Users,
  Building,
  Shield,
  Award,
  Layers,
  History,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Landmark,
  Scale,
  Briefcase,
  GitBranch,
  Calendar,
  Building2,
  ChevronRight,
  ChevronDown,
  Activity,
  Network,
  ArrowUpRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<VerifiedOrganisationStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'roster' | 'hierarchy' | 'cadres' | 'committees' | 'history' | 'functional'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('Chennai Zone');
  const [functionalSearch, setFunctionalSearch] = useState('');
  const [functionalCategory, setFunctionalCategory] = useState('ALL');
  const [stakeholderSearch, setStakeholderSearch] = useState('');

  useEffect(() => {
    loadStructure();
  }, []);

  const loadStructure = async () => {
    setLoading(true);
    try {
      const res = await api.getVerifiedOrganisationStructure();
      setData(res);
    } catch (err) {
      console.error('Failed to load organisation structure', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficials = data?.heads_of_department.filter((off) => {
    const matchesSearch =
      off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (off.wing && off.wing.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (off.office_address && off.office_address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWing =
      selectedWing === 'ALL' ||
      (selectedWing === 'CM' && off.designation.includes('C&M')) ||
      (selectedWing === 'NH' && off.designation.includes('National Highways')) ||
      (selectedWing === 'PDI' && (off.designation.includes('PDI') || off.designation.includes('Planning'))) ||
      (selectedWing === 'HRS' && off.designation.includes('Highways Research')) ||
      (selectedWing === 'SPV' && (off.designation.includes('TNRSP') || off.designation.includes('CKICP') || off.designation.includes('TANSHA')));

    return matchesSearch && matchesWing;
  }) || [];

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#00553E] to-[#004B87] rounded-2xl p-6 text-white shadow-lg border border-[#B2DFCD]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
              Statutory Cadre Directory
            </span>
            <span className="bg-white/20 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
              Highways and Minor Ports Department, Government of Tamil Nadu
            </span>
            <span className="bg-emerald-700/80 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/40">
              G.O.Ms.No.172 (03.11.2025) &amp; G.O.Ms.No.43
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-300" />
            OFFICIAL ORGANISATION, DESIGNATION &amp; SERVICE CADRE REGISTRY
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-3xl leading-relaxed">
            Statutory departmental directory of political leadership, Secretariat administrative command, and Tamil Nadu Highways Engineering Service (TN-HES) cadres. Formally distinguishes engineering posts, acting charges (A/C, FAC), statutory committees, and financial delegations.
          </p>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Leadership &amp; Officials ({filteredOfficials.length + 2})
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'hierarchy'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          4-Zone Hierarchy Tree
        </button>

        <button
          onClick={() => setActiveTab('cadres')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'cadres'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          TN-HES Cadres &amp; Financial Limits (TS/TA)
        </button>

        <button
          onClick={() => setActiveTab('committees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'committees'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Statutory Committees ({data?.statutory_committees.length || 11})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Historical Postings &amp; Acting Charges
        </button>

        <button
          onClick={() => setActiveTab('functional')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'functional'
              ? 'bg-[#006A4E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Functional Groups &amp; External Stakeholders
        </button>
      </div>

      {/* TAB 1: LEADERSHIP & OFFICIALS ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Top Government Leadership Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minister Card */}
            {data?.minister && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border-2 border-amber-300 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded">
                        Political Leadership
                      </span>
                      <span className="bg-emerald-100 text-[#006A4E] border border-[#B2DFCD] text-[10px] font-bold px-2 py-0.5 rounded">
                        {data.minister.verification_status}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{data.minister.name}</h3>
                    <p className="text-xs font-bold text-amber-900">{data.minister.designation}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Portfolio: {data.minister.portfolio}
                    </p>
                    <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>{data.minister.office}</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xl flex-shrink-0 shadow-inner">
                    AA
                  </div>
                </div>
              </div>
            )}

            {/* Principal Secretary Card */}
            {data?.principal_secretary && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50/40 rounded-2xl border-2 border-[#004B87]/30 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#004B87] text-white font-black text-[10px] uppercase px-2 py-0.5 rounded">
                        Secretariat Leadership (IAS)
                      </span>
                      <span className="bg-emerald-100 text-[#006A4E] border border-[#B2DFCD] text-[10px] font-bold px-2 py-0.5 rounded">
                        {data.principal_secretary.verification_status}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{data.principal_secretary.name}</h3>
                    <p className="text-xs font-bold text-[#004B87]">{data.principal_secretary.designation}</p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {data.principal_secretary.department}
                    </p>
                    <div className="pt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#004B87] flex-shrink-0" />
                        <a href={`mailto:${data.principal_secretary.email}`} className="font-semibold text-blue-700 hover:underline">
                          {data.principal_secretary.email}
                        </a>
                        <span className="text-slate-400">•</span>
                        <Phone className="w-3.5 h-3.5 text-[#004B87] flex-shrink-0" />
                        <span className="font-mono">{data.principal_secretary.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" />
                        <span>{data.principal_secretary.office}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#004B87] font-bold text-xl flex-shrink-0 shadow-inner">
                    SC
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search & Wing Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search official name, designation, wing, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Wing:
              </span>
              {[
                { code: 'ALL', label: 'All Officials' },
                { code: 'CM', label: 'C&M Regions' },
                { code: 'NH', label: 'National Highways' },
                { code: 'PDI', label: 'PDI Wing' },
                { code: 'HRS', label: 'HRS Guindy' },
                { code: 'SPV', label: 'SPVs (TNRSP/CKICP/TANSHA)' }
              ].map((w) => (
                <button
                  key={w.code}
                  onClick={() => setSelectedWing(w.code)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    selectedWing === w.code
                      ? 'bg-[#006A4E] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Officials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfficials.map((off) => {
              const isAC = off.charge_status === 'ADDITIONAL_CHARGE' || off.designation.includes('(A/C)');
              const isFAC = off.charge_status === 'FULL_ADDITIONAL_CHARGE' || off.designation.includes('(FAC)');

              return (
                <div
                  key={off.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#006A4E]/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-[#E6F4EA] text-[#006A4E] font-bold text-[10px] px-2 py-0.5 rounded">
                          TN-HES Cadre
                        </span>
                        {isAC && (
                          <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-1.5 py-0.5 rounded">
                            A/C (Addl Charge)
                          </span>
                        )}
                        {isFAC && (
                          <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-1.5 py-0.5 rounded">
                            FAC (Full Addl Charge)
                          </span>
                        )}
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {off.verification_status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{off.name}</h4>
                      <p className="text-xs font-semibold text-[#004B87] mt-0.5 leading-tight">
                        {off.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {off.wing}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      {off.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-mono">{off.phone}</span>
                        </div>
                      )}
                      {off.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <a href={`mailto:${off.email}`} className="text-blue-600 hover:underline truncate">
                            {off.email}
                          </a>
                        </div>
                      )}
                      {off.office_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-slate-500 leading-tight">
                            {off.office_address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {off.tenures && off.tenures.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-[10px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">
                        Active Statutory Posting:
                      </div>
                      <div className="font-medium text-slate-800">
                        {off.tenures[0].designation_title}
                      </div>
                      <div className="text-slate-500 font-mono text-[9px]">
                        Ref: {off.tenures[0].transfer_go_reference || 'Department Order'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 4-ZONE HIERARCHY TREE */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#006A4E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    G.O.Ms.No.43 Restructuring
                  </span>
                  <span className="bg-blue-100 text-[#004B87] text-[10px] font-bold px-2 py-0.5 rounded">
                    4 Regional Zones • 30 Circles • 84 Divisions
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-900 mt-1 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#006A4E]" />
                  Construction &amp; Maintenance (C&amp;M) 4-Zone Command Hierarchy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The primary field executive arm responsible for maintenance, widening, and rehabilitation of 12,000+ km State Highways and 54,000+ km District Roads.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-[#E6F4EA] hover:bg-[#d2edd9] text-[#006A4E] border border-[#B2DFCD] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Briefcase className="w-3.5 h-3.5" /> View Statewide Projects
                </button>
              </div>
            </div>

            {/* 4 Regional Zone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                {
                  name: "Chennai Zone",
                  hq: "HRS Campus, Guindy, Chennai",
                  chief_engineer: "Er. S. Palanivel",
                  cadre: "Regular CE (H)",
                  circles_count: 3,
                  divisions_count: 8,
                  corridor: "Northern Coastal & Metro Arterials",
                  color: "from-emerald-600 to-teal-700",
                  bg_tint: "border-emerald-200 bg-emerald-50/40",
                  key_circles: ["Chennai Circle", "Chengalpattu Circle", "Tiruvallur Circle"],
                  key_corridors: ["ECR (SH-49)", "OMR (SH-49A)", "Vandalur-Walajabad (SH-48)", "Chennai Outer Ring Road"]
                },
                {
                  name: "Coimbatore Zone",
                  hq: "Mettupalayam Road, Coimbatore",
                  chief_engineer: "Er. S. Palanivel (A/C)",
                  cadre: "Additional Charge (A/C)",
                  circles_count: 3,
                  divisions_count: 7,
                  corridor: "Western Industrial & Nilgiris Ghats",
                  color: "from-blue-600 to-indigo-700",
                  bg_tint: "border-blue-200 bg-blue-50/40",
                  key_circles: ["Coimbatore Circle", "Salem Circle", "Tiruppur Circle"],
                  key_corridors: ["Avinashi-Tiruppur (SH-174)", "Mettupalayam-Ooty (SH-181)", "Salem Western Ring Road"]
                },
                {
                  name: "Madurai Zone",
                  hq: "Alagar Kovil Road, Madurai",
                  chief_engineer: "Er. Ramesh",
                  cadre: "Regular CE (H)",
                  circles_count: 3,
                  divisions_count: 9,
                  corridor: "Southern Ports & Industrial Corridors",
                  color: "from-amber-600 to-orange-700",
                  bg_tint: "border-amber-200 bg-amber-50/40",
                  key_circles: ["Madurai Circle", "Tirunelveli Circle", "Ramanathapuram Circle"],
                  key_corridors: ["Tirunelveli-Tenkasi (SH-39)", "Madurai Ring Road", "Ramanathapuram-Dhanushkodi"]
                },
                {
                  name: "Tiruchirappalli Zone",
                  hq: "T.V.S. Toll Gate, Tiruchirappalli",
                  chief_engineer: "Er. S. Jawahar Muthuraj",
                  cadre: "Regular CE (H)",
                  circles_count: 3,
                  divisions_count: 8,
                  corridor: "Central Delta & Agro-Logistics",
                  color: "from-purple-600 to-indigo-800",
                  bg_tint: "border-purple-200 bg-purple-50/40",
                  key_circles: ["Trichy Circle", "Thanjavur Circle", "Villupuram Circle"],
                  key_corridors: ["Cuddalore-Chidambaram (SH-09)", "Thanjavur Bypass (SH-63)", "Trichy Semi-Ring Road"]
                }
              ].map((zone) => {
                const isSelected = selectedZone === zone.name;
                return (
                  <div
                    key={zone.name}
                    onClick={() => setSelectedZone(zone.name)}
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#006A4E] bg-white shadow-md ring-2 ring-[#006A4E]/20 scale-[1.01]'
                        : `${zone.bg_tint} hover:border-slate-400 hover:shadow-xs`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white bg-gradient-to-r ${zone.color}`}>
                          {zone.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {zone.divisions_count} Divisions
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">{zone.name}</h4>
                      <p className="text-xs font-semibold text-[#006A4E] mt-0.5">{zone.chief_engineer}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Cadre: {zone.cadre}</span>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{zone.hq}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[11px]">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Circles:</div>
                      <div className="flex flex-wrap gap-1">
                        {zone.key_circles.map((c) => (
                          <span key={c} className="bg-white text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[#004B87]">
                      <span>{isSelected ? '● Active Selection' : 'Click to inspect circles'}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Zone Circle & Divisional Command Inspector */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Regional Command Inspector
                    </span>
                    <h4 className="font-black text-base text-slate-900">
                      {selectedZone} — Circles, Superintending Engineers &amp; Divisional Commands
                    </h4>
                  </div>
                  <span className="text-xs bg-[#E6F4EA] text-[#006A4E] font-bold px-2.5 py-1 rounded-md border border-[#B2DFCD]">
                    Statutory Cadre: Divisional Engineer (H) [DE]
                  </span>
                </div>

                {selectedZone === 'Chennai Zone' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Chennai Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. K. Soundararajan</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>1. Chennai North Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: Inner Ring Road, Ennore Expressway</div>
                        <div className="font-semibold text-slate-800 flex items-center justify-between pt-1">
                          <span>2. Chennai South Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: OMR IT Corridor (SH-49A), Sardar Patel Road</div>
                        <div className="font-semibold text-slate-800 flex items-center justify-between pt-1">
                          <span>3. Chennai Central Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: Mount-Poonamallee (SH-113)</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Chengalpattu Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. N. Venkatesan</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>1. Tambaram Division</span>
                          <span className="text-[10px] text-[#006A4E] font-bold font-mono">DE Er. P. Anandhan</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: Vandalur-Kelambakkam (SH-121), Mudichur Bypass</div>
                        <div className="font-semibold text-slate-800 flex items-center justify-between pt-1">
                          <span>2. Chengalpattu Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: ECR 4-laning (SH-49 Km 22/0 to 45/0), Mamallapuram bypass</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Tiruvallur Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. V. Ravikumar</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>1. Tiruvallur Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: Chennai-Tirupati (SH-57), Sriperumbudur link</div>
                        <div className="font-semibold text-slate-800 flex items-center justify-between pt-1">
                          <span>2. Ponneri Division</span>
                          <span className="text-[10px] text-slate-500 font-mono">DE (H)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Corridors: Minjur-Kattupalli Port arterial road</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === 'Coimbatore Zone' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Coimbatore Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. R. Mathivanan</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Coimbatore Division (DE Er. C. Mohan)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Avinashi Road Elevated Corridor, Trichy Road</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Pollachi Division (DE Er. K. Suresh)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Pollachi-Udumalpet (SH-19)</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Salem Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. S. Chandrasekaran</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Salem Division (DE Er. M. Prabhakaran)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Salem Western Ring Road</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Attur Division • 3. Omalur Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Attur-Veeraganur, Omalur-Mecheri</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Tiruppur Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. A. Govindaraj</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Tiruppur Division (DE Er. P. Balasubramanian)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Palladam-Tiruppur (SH-174)</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Dharapuram Division (DE Er. T. Vijayan)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Dharapuram-Palani link</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === 'Madurai Zone' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Madurai Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. V. Ganesan</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Madurai Division (DE Er. T. Nagarajan)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Madurai Ring Road junction improvements</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Usilampatti Division • 3. Melur Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Madurai-Theni (SH-32), Melur-Tiruppattur</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Tirunelveli Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. M. Selvakumar</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Tirunelveli Division (DE Er. P. Sridhar)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Tirunelveli-Tenkasi 4-laning (SH-39)</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Tenkasi Division • 3. Ambasamudram Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Courtallam Ghat Road, Cheranmahadevi link</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Ramanathapuram Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. N. Sundarajan</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Ramanathapuram Division (DE Er. S. Pandian)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Ramanathapuram-Dhanushkodi Coastal Highway</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Paramakudi Division • 3. Sivagangai Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Paramakudi-Ilayangudi, Sivagangai-Thondi</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === 'Tiruchirappalli Zone' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Trichy Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. S. Shanmugam</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Trichy Division (DE Er. B. Krishnakumar)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Trichy Semi-Ring Road Phase-I &amp; II</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Musiri Division • 3. Pudukkottai Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Musiri-Thuraiyur, Pudukkottai-Aranthangi</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Thanjavur Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. K. Subramanian</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Thanjavur Division (DE Er. M. Govindarajan)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Thanjavur Bypass (SH-63), Thanjavur-Pattukkottai</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Kumbakonam Division • 3. Nagapattinam Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Cauvery Delta causeways, Coastal Delta Highway (SH-64)</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#004B87]">Villupuram Circle</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SE (H)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Superintending Engineer: Er. R. Jayachandran</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="font-semibold text-slate-800">1. Cuddalore Division (DE Er. K. Baskaran)</div>
                        <div className="text-[11px] text-slate-500">Corridors: Cuddalore-Chidambaram (SH-09 Km 12/0 to 45/0)</div>
                        <div className="font-semibold text-slate-800 pt-1">2. Villupuram Division • 3. Tindivanam Division</div>
                        <div className="text-[11px] text-slate-500">Corridors: Villupuram-Pondy, Tindivanam-Marakkanam</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statewide Visual Organisational Tree */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#004B87] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Apex Reporting Structure
                </span>
                <span className="bg-emerald-100 text-[#006A4E] text-[10px] font-bold px-2 py-0.5 rounded">
                  8 Statewide Specialized Wings
                </span>
              </div>
              <h4 className="font-black text-lg text-slate-900 mt-1 flex items-center gap-2">
                <Network className="w-5 h-5 text-[#004B87]" />
                Tamil Nadu Highways Department Statewide Command Tree
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Constitutional and statutory reporting hierarchy from Council of Ministers and Secretariat through Director General (Highways) to the 8 functional wings.
              </p>
            </div>

            {/* Level 1: Apex Political & Administrative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-xs">
                <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  Apex Political Leadership
                </span>
                <h5 className="font-black text-base mt-1.5">Thiru E.V. Velu</h5>
                <p className="text-xs text-amber-100 font-semibold">Hon&apos;ble Minister for Public Works, Highways &amp; Minor Ports</p>
                <div className="text-[11px] text-white/90 mt-2 pt-2 border-t border-amber-400/40">
                  Secretariat, Fort St. George, Chennai • Cabinet Policy &amp; Public Works Portfolio
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#004B87] to-blue-900 text-white p-4 rounded-xl shadow-xs">
                <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  Apex Administrative Command (IAS)
                </span>
                <h5 className="font-black text-base mt-1.5">Thiru Pradeep Yadav, IAS</h5>
                <p className="text-xs text-blue-200 font-semibold">Additional Chief Secretary / Principal Secretary to Government</p>
                <div className="text-[11px] text-white/90 mt-2 pt-2 border-t border-blue-700/50">
                  Administrative Sanctions (AS) • Statutory Oversight • Inter-Departmental Coordination
                </div>
              </div>
            </div>

            {/* Connecting Bar */}
            <div className="flex justify-center my-1">
              <div className="h-6 w-0.5 bg-slate-300" />
            </div>

            {/* Level 2: Head of Department (HOD) / Apex Directorate */}
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#006A4E] to-emerald-800 text-white p-4 rounded-xl text-center shadow-xs">
              <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                Apex Technical Authority &amp; Head of Department
              </span>
              <h5 className="font-black text-base mt-1">Director General (H), Highways Department</h5>
              <p className="text-xs text-emerald-200 font-semibold">Er. R. Selvadurai • Integrated CE Complex, HRS Campus, Guindy</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-2 border-t border-emerald-600 text-[11px] text-emerald-100">
                <span className="bg-white/10 px-2 py-0.5 rounded font-mono">Commissionerate of Tenders (COT)</span>
                <span>•</span>
                <span className="bg-white/10 px-2 py-0.5 rounded font-mono">Board of Engineers (BOE)</span>
                <span>•</span>
                <span className="bg-white/10 px-2 py-0.5 rounded font-mono">Highways Code Vol I &amp; II</span>
              </div>
            </div>

            {/* Connecting Fork */}
            <div className="flex justify-center my-1">
              <div className="h-6 w-0.5 bg-slate-300" />
            </div>

            {/* Level 3: 8 Statewide Specialized Wings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  The 8 Functional &amp; Regional Wings of Tamil Nadu Highways
                </span>
                <span className="text-[10px] text-slate-500 font-mono">G.O. Ms. No. 172 &amp; TN-HES Cadre</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    code: "C&M",
                    title: "1. Construction & Maintenance",
                    head: "4 Regional CEs (Chennai, Kovai, Madurai, Trichy)",
                    scope: "Primary network of 12,000+ km SH & 54,000+ km MDR/ODR roads across 30 Circles and 84 Divisions.",
                    color: "border-emerald-300 bg-emerald-50/50 text-[#006A4E]"
                  },
                  {
                    code: "NH",
                    title: "2. National Highways Wing",
                    head: "CE Er. K. Vanathi",
                    scope: "Entrusted Central MoRTH road network (797.56 km across NH 181, 648, 179A, 336, 42, 75).",
                    color: "border-amber-300 bg-amber-50/50 text-amber-900"
                  },
                  {
                    code: "PDI",
                    title: "3. Planning, Designs & Inv.",
                    head: "CE Er. S. Yamini",
                    scope: "Detailed Project Report (DPR) formulation, Traffic Surveys, and Hydrological Bridge Structural Modeling.",
                    color: "border-blue-300 bg-blue-50/50 text-[#004B87]"
                  },
                  {
                    code: "HRS",
                    title: "4. Highways Research Station",
                    head: "Director Er. A. Venkatachalam",
                    scope: "HRS Guindy laboratories: Soil, Concrete, Bitumen, Core extraction, Roughness Index (IRI), Pavement Forensics.",
                    color: "border-purple-300 bg-purple-50/50 text-purple-900"
                  },
                  {
                    code: "NABARD",
                    title: "5. NABARD & Rural Roads",
                    head: "CE Er. P. Senthamilselvan",
                    scope: "Rural connectivity, flood damage rehabilitation, minor river bridges, and Panchayat bypass links.",
                    color: "border-teal-300 bg-teal-50/50 text-teal-900"
                  },
                  {
                    code: "PROJECTS",
                    title: "6. Projects Wing",
                    head: "CE Er. M. Ravikumar",
                    scope: "Major urban flyovers, grade separators, Railway Over Bridges (ROBs), and bypass infrastructure.",
                    color: "border-indigo-300 bg-indigo-50/50 text-indigo-900"
                  },
                  {
                    code: "METRO",
                    title: "7. Metro Wing",
                    head: "CE (Metro Chennai/Kovai)",
                    scope: "Elevated corridors, traffic decongestion, pedestrian subways, and multi-modal transit integrations.",
                    color: "border-rose-300 bg-rose-50/50 text-rose-900"
                  },
                  {
                    code: "SPV / EAP",
                    title: "8. Special Project Vehicles",
                    head: "PD Thiru D. Baskara Pandian, IAS (FAC)",
                    scope: "Externally Aided Projects: TNRSP-II (World Bank 16 packages) & CKICP (ADB Industrial Corridors).",
                    color: "border-cyan-300 bg-cyan-50/50 text-cyan-900"
                  }
                ].map((w) => (
                  <div key={w.code} className={`rounded-xl border p-3.5 space-y-1.5 shadow-2xs ${w.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-white/80 border border-current">
                        {w.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">TN-HES Wing</span>
                    </div>
                    <h6 className="font-bold text-xs text-slate-900 leading-snug">{w.title}</h6>
                    <p className="text-[11px] font-semibold text-[#004B87]">{w.head}</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
                      {w.scope}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 4: Statutory Public Sector Undertakings (PSUs) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Statutory Boards &amp; Undertakings Coordinated under Department:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  ⚓ Tamil Nadu Maritime Board (TNMB)
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  🚢 Poompuhar Shipping Corporation
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  🛣️ Tamil Nadu Road Dev. Co. (TNRDC)
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  🏗️ TN Road Infra Dev. Corp. (TNRIDC)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE CADRES & FINANCIAL DELEGATIONS */}
      {activeTab === 'cadres' && (
        <div className="space-y-6">
          {/* Statutory Cadre Note */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <span className="font-bold uppercase tracking-wider text-amber-900">
                Statutory Cadre Rule Notice (G.O.Ms.No.172 dated 03.11.2025):
              </span>
              <p className="leading-relaxed">
                Under the Special Rules for the <strong>Tamil Nadu Highways Engineering Service (TN-HES)</strong>, State Highways division heads are formally designated as <strong>Divisional Engineer (H) [DE]</strong>, not generic central PWD &quot;Executive Engineer&quot;. All system roles, audit trails, and measurement books must strictly honor this nomenclature.
              </p>
            </div>
          </div>

          {/* Delegations of Authority Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#006A4E]" />
                Delegated Statutory Powers for Technical Sanction (TS) &amp; Tender Acceptance (TA)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Grounded in G.O. Ms. No. 75 (02.09.2026), G.O. Ms. No. 163, and Tamil Nadu Highways Manual Vol II.
              </p>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank / Authority Code</th>
                    <th className="p-3">Designation Title</th>
                    <th className="p-3">Power Type</th>
                    <th className="p-3">Monetary Ceiling</th>
                    <th className="p-3">Tender Excess Allowance</th>
                    <th className="p-3">Governing Rule / G.O. Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data?.delegations_of_authority.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#004B87]">{del.designation_code}</td>
                      <td className="p-3 font-semibold">{del.remarks || del.designation_code}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          del.power_type === 'TECHNICAL_SANCTION' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {del.power_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {del.monetary_limit_cr >= 9000 ? 'Unlimited / Cabinet' : `₹${del.monetary_limit_cr.toFixed(2)} Cr`}
                      </td>
                      <td className="p-3 font-mono">
                        {del.tender_excess_pct_limit > 0 ? `Up to ${del.tender_excess_pct_limit}%` : '0% (Nil Excess)'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{del.statutory_rule_reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY COMMITTEES */}
      {activeTab === 'committees' && (
        <div className="space-y-6">
          <div className="bg-sky-950 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-sky-800">
            <div>
              <h3 className="font-bold text-sm">Full Governance, Meeting Proceedings &amp; Statutory Referrals</h3>
              <p className="text-xs text-sky-200 mt-0.5">
                Explore detailed meeting minutes, sanctioned decisions, tender excess referrals, and AI integrity findings.
              </p>
            </div>
            <a
              href="#/compliance"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5 self-start md:self-auto"
            >
              Open Governance Registry &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data?.statutory_committees.map((com) => (
              <div
                key={com.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-[#006A4E] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#E6F4EA] text-[#006A4E] font-bold text-[10px] px-2 py-0.5 rounded">
                      Statutory Body
                    </span>
                    <span className="font-mono text-xs font-bold text-[#004B87]">{com.code}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{com.name}</h4>
                  <p className="text-xs text-[#004B87] font-semibold">
                    Chairperson: <span className="text-slate-800">{com.chairperson_title}</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">{com.mandate_summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                  Constitution Order: {com.constitution_go}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HISTORICAL TENURES & ACTING CHARGES */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#006A4E]" />
                Historical Tenure &amp; Transfer Accountability Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Under Government Service Rules, past signatures, check measurements, and technical sanctions remain permanently linked to the officer holding the post during that specific tenure. Officer transfers never overwrite historical accountability.
              </p>
            </div>

            <div className="space-y-4">
              {data?.heads_of_department.map((off) => (
                <div key={off.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{off.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({off.designation})</span>
                    </div>
                    <span className="text-xs font-mono text-[#004B87] font-bold">
                      {off.tenures.length} Tenure Record(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {off.tenures.map((ten) => (
                      <div
                        key={ten.id}
                        className="bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-1.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ten.posting_type === 'REGULAR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {ten.posting_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            From: {new Date(ten.from_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs">{ten.designation_title}</div>
                        <div className="text-slate-600 text-[11px]">{ten.posting_unit}</div>
                        <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                          Transfer Order: {ten.transfer_go_reference || 'Government Gazette'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FUNCTIONAL GROUPS & EXTERNAL STAKEHOLDERS */}
      {activeTab === 'functional' && (
        <div className="space-y-6">
          {/* Functional Permission Groups Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#004B87] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Operational RBAC Scopes
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                    13 Functional Groups (Distinct from Formal Cadres)
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-900 mt-1 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#004B87]" />
                  Departmental Functional Authorization &amp; Working Groups
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portfolio-based permission groups assigned to officers for executing specialized departmental duties across fiscal control, laboratory testing, statutory land acquisition, and court litigation.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter functional groups..."
                  value={functionalSearch}
                  onChange={(e) => setFunctionalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#004B87] focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Domain:
              </span>
              {[
                { code: 'ALL', label: 'All 13 Groups' },
                { code: 'FIN', label: 'Finance & Accounts' },
                { code: 'PROC', label: 'Procurement & Tenders' },
                { code: 'ENG', label: 'Quality & Engineering' },
                { code: 'LEGAL', label: 'Land Acquisition & Legal' },
                { code: 'OPS', label: 'Field Ops & Safety' }
              ].map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => setFunctionalCategory(cat.code)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    functionalCategory === cat.code
                      ? 'bg-[#004B87] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Functional Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  code: "FIN_ACCOUNTS",
                  name: "Finance & Accounts",
                  domain: "FIN",
                  route: "/finance",
                  rule: "TN Financial Code / IFMS",
                  mandate: "IFMS Letter of Credit (LOC) balances, contractor invoice reconciliation, and bill scrutiny."
                },
                {
                  code: "BUDGET_IFMS",
                  name: "Budget & Fiscal Control",
                  domain: "FIN",
                  route: "/finance",
                  rule: "Budget Demands for Grants",
                  mandate: "State budget allocation tracking across CMRDP, CRIDP, NABARD, and external aid schemes."
                },
                {
                  code: "PROCUREMENT_COT",
                  name: "Procurement & Tendering",
                  domain: "PROC",
                  route: "/projects",
                  rule: "TNTIT Act 1998 & Rules 2000",
                  mandate: "Commissionerate of Tenders (COT) processing, e-tender bid evaluations, and tender excess scrutiny."
                },
                {
                  code: "QUALITY_HRS",
                  name: "Quality Control & Forensics",
                  domain: "ENG",
                  route: "/compliance",
                  rule: "MoRTH Section 900 / IRC",
                  mandate: "Highways Research Station (HRS) core, cube, bitumen penetration, and Benkelman beam test scrutiny."
                },
                {
                  code: "PLANNING_PDI",
                  name: "Planning & Investigation",
                  domain: "ENG",
                  route: "/project-360",
                  rule: "Highways Code Vol I",
                  mandate: "Detailed Project Report (DPR) preparation, alignment survey, and preliminary estimate scrutiny."
                },
                {
                  code: "LAND_ACQUISITION",
                  name: "Land Acquisition Coordination",
                  domain: "LEGAL",
                  route: "/project-360",
                  rule: "TN Highways Act 2001",
                  mandate: "Section 15(2), 15(1) Gazette notifications, Section 19(1) Awards, and solatium compensation."
                },
                {
                  code: "ADMIN_ESTABLISHMENT",
                  name: "Administration & Establishment",
                  domain: "OPS",
                  route: "/directory",
                  rule: "G.O. Ms. No. 172 & TN-HES",
                  mandate: "Postings, tenures, service book records under TN-HES rules, and ministerial office staff management."
                },
                {
                  code: "LEGAL_COMPLIANCE",
                  name: "Legal & Court Litigation",
                  domain: "LEGAL",
                  route: "/compliance",
                  rule: "Madras High Court Rules",
                  mandate: "High Court writ petition counters, arbitration defense under HLDRC, and interim stay management."
                },
                {
                  code: "INTERNAL_AUDIT",
                  name: "Internal Audit & AG Paras",
                  domain: "FIN",
                  route: "/compliance",
                  rule: "CAG Standards / PAC Directives",
                  mandate: "Accountant General (Audit II) draft para replies, Action Taken Reports (ATR), and recovery tracking."
                },
                {
                  code: "PROJECT_MONITORING",
                  name: "Project Monitoring & Milestones",
                  domain: "ENG",
                  route: "/projects",
                  rule: "EVM Standard S-Curve",
                  mandate: "Schedule tracking, critical path variance, and time-extension recommendation review."
                },
                {
                  code: "MAINTENANCE_OPS",
                  name: "Maintenance & Gang Operations",
                  domain: "OPS",
                  route: "/projects",
                  rule: "Highway Maintenance Manual",
                  mandate: "Periodic surface renewal, pothole elimination drive, culvert desilting, and disaster clearance."
                },
                {
                  code: "FIELD_INSPECTION",
                  name: "Field Inspection & Measurement",
                  domain: "OPS",
                  route: "/projects",
                  rule: "TN Measurement Book Code",
                  mandate: "Check measurement verification, daily road register logs, and site inspection memos."
                },
                {
                  code: "SAFETY_COMPLIANCE",
                  name: "Road Safety & Blackspot Remediation",
                  domain: "OPS",
                  route: "/project-360",
                  rule: "IRC Road Safety Guidelines",
                  mandate: "IRC safety audit compliance, crash barrier installation, and fatal accident spot engineering fixes."
                }
              ]
                .filter((fg) => {
                  const matchesSearch =
                    fg.name.toLowerCase().includes(functionalSearch.toLowerCase()) ||
                    fg.code.toLowerCase().includes(functionalSearch.toLowerCase()) ||
                    fg.mandate.toLowerCase().includes(functionalSearch.toLowerCase());
                  const matchesCategory =
                    functionalCategory === 'ALL' || fg.domain === functionalCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((fg) => (
                  <div
                    key={fg.code}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 hover:border-[#004B87] transition flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-white text-[#006A4E] border border-slate-200">
                          {fg.code}
                        </span>
                        <span className="bg-slate-200/80 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {fg.domain} Scope
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{fg.name}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{fg.mandate}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono truncate max-w-[170px]" title={fg.rule}>
                        {fg.rule}
                      </span>
                      <button
                        onClick={() => navigate(fg.route)}
                        className="text-[#004B87] hover:text-[#003B6B] font-bold flex items-center gap-0.5"
                      >
                        Open Console <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* External Coordinating Stakeholders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#006A4E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Inter-Agency Governance
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    6 Key Coordinating Departments
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-900 mt-1 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#006A4E]" />
                  External Department Coordination Roster &amp; Single Points of Contact (SPOC)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designated nodal authorities across state and central utilities required for statutory clearances, utility shifting, forest land diversion, and railway span approvals.
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search agency, SPOC, mandate..."
                    value={stakeholderSearch}
                    onChange={(e) => setStakeholderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#004B87] hover:bg-[#003B6B] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                  title="View live inter-agency delay blockers on Executive Smartboard"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> View Live Blockers
                </button>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs min-w-[950px] border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-60">Coordinating Department / Agency</th>
                    <th className="py-3 px-4 w-52">Designated SPOC Designation</th>
                    <th className="py-3 px-4 w-60">Coordination Portfolio</th>
                    <th className="py-3 px-4 min-w-[280px]">High-Impact Clearance Mandate</th>
                    <th className="py-3 px-4 w-28">Verification</th>
                    <th className="py-3 px-4 w-32 text-right">Action Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {[
                    {
                      department: "Revenue and Disaster Management",
                      icon: "🏛️",
                      spoc: "Special District Revenue Officer (LA) / RDO",
                      portfolio: "Land Acquisition under TN Highways Act 2001",
                      clearance: "Section 15(2) Notice, Sec 15(1) Gazette, Sec 19(1) Award",
                      status: "VERIFIED OFFICIAL",
                      protocol: "Joint Collector Review"
                    },
                    {
                      department: "Electricity & TANGEDCO / TNPDCL",
                      icon: "⚡",
                      spoc: "Superintending Engineer (Distribution Circle)",
                      portfolio: "Utility Shifting & Power Disconnection",
                      clearance: "HT tower relocation (110kV/33kV), LT pole shift",
                      status: "VERIFIED OFFICIAL",
                      protocol: "Joint Field Survey"
                    },
                    {
                      department: "Environment, Climate Change & Forests",
                      icon: "🌲",
                      spoc: "District Forest Officer (DFO) / PCCF",
                      portfolio: "Statutory Forest Clearance & Tree Felling",
                      clearance: "Forest Conservation Act (FCA) Stage I & II Clearance",
                      status: "VERIFIED OFFICIAL",
                      protocol: "MoEFCC Parivesh Portal"
                    },
                    {
                      department: "TWAD Board / CMWSSB",
                      icon: "💧",
                      spoc: "Executive Engineer (Maintenance Division)",
                      portfolio: "Bulk Water Mains Shifting",
                      clearance: "Feeder water main diversion along Right-of-Way (ROW)",
                      status: "VERIFIED OFFICIAL",
                      protocol: "Inter-Agency Cost Deposit"
                    },
                    {
                      department: "Southern Railway (Zone 7)",
                      icon: "🚆",
                      spoc: "Chief Bridge Engineer (CBE) / Dy. CE (Bridges)",
                      portfolio: "Railway Over Bridge (ROB) / RUB Track Spans",
                      clearance: "General Arrangement Drawing (GAD) & CRS Safety Sanction",
                      status: "VERIFIED OFFICIAL",
                      protocol: "Railway CRS Review"
                    },
                    {
                      department: "Corporations & Municipalities (GCC)",
                      icon: "🏢",
                      spoc: "City Engineer / Superintending Engineer (Projects)",
                      portfolio: "Urban Right-of-Way & Storm Water Drains",
                      clearance: "Traffic diversion NOC & SWD culvert integration",
                      status: "VERIFIED OFFICIAL",
                      protocol: "Traffic Police & GCC Joint Inspection"
                    }
                  ]
                    .filter((stk) => {
                      const query = stakeholderSearch.toLowerCase();
                      return (
                        stk.department.toLowerCase().includes(query) ||
                        stk.spoc.toLowerCase().includes(query) ||
                        stk.portfolio.toLowerCase().includes(query) ||
                        stk.clearance.toLowerCase().includes(query)
                      );
                    })
                    .map((stk) => (
                      <tr key={stk.department} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{stk.icon}</span>
                            <span className="font-bold text-slate-900">{stk.department}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#004B87]">{stk.spoc}</td>
                        <td className="py-3.5 px-4 text-slate-700">{stk.portfolio}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] leading-relaxed">
                          {stk.clearance}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="bg-emerald-100 text-[#006A4E] text-[10px] font-bold px-2 py-0.5 rounded border border-[#B2DFCD]">
                            {stk.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate('/')}
                            className="text-xs text-[#006A4E] hover:text-[#00553E] bg-[#E6F4EA] hover:bg-[#d5eedc] px-2.5 py-1 rounded font-semibold border border-[#B2DFCD] transition flex items-center gap-1 ml-auto"
                          >
                            <span>Inspect Blocker</span>
                            <ArrowUpRight className="w-3 h-3" />
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
    </div>
  );
};

