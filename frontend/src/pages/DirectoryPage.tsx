import React, { useState, useEffect } from 'react';
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
  Building2
} from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const [data, setData] = useState<VerifiedOrganisationStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'roster' | 'hierarchy' | 'cadres' | 'committees' | 'history' | 'functional'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');

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
          8 Statutory Committees
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-[#006A4E]" />
                Four Administrative Zones (G.O.Ms.No.43 Restructuring)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The Tamil Nadu Highways Department operates across 4 geographical command zones for Construction &amp; Maintenance (C&amp;M), complemented by statewide functional wings and special project vehicles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
              {data?.zones_hierarchy.map((zone) => (
                <div
                  key={zone.name}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 hover:border-[#004B87] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-[#004B87] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Regional Command
                    </span>
                    <span className="text-xs font-bold text-slate-500">{zone.divisions_count} Divisions</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">{zone.name}</h4>
                    <p className="text-xs font-semibold text-[#006A4E] mt-0.5">{zone.chief_engineer}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> HQ: {zone.hq}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Circles Under Zone:</div>
                    <ul className="space-y-1">
                      {zone.circles.map((c) => (
                        <li key={c} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#006A4E]" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700">Corridor Scope:</span> {zone.jurisdiction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Department Organisational Tree Representation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-[#006A4E]">
              Tamil Nadu Highways Department Statewide Reporting Tree
            </h4>

            <div className="font-mono text-xs text-slate-800 bg-slate-50 p-6 rounded-xl border border-slate-200 leading-relaxed overflow-x-auto">
              <pre className="text-xs">
{`Government of Tamil Nadu
  └── Highways and Minor Ports Department (Secretariat)
        ├── Political: Hon'ble Minister for Public Works and Sports Development (Thiru Aadhav Arjuna)
        └── Administrative: Principal Secretary to Government (Thiru Shunchonngam Jatak Chiru, IAS)
              │
              ├── [STATUTORY UNDERTAKINGS]
              │     ├── Tamil Nadu Maritime Board (TNMB)
              │     ├── Poompuhar Shipping Corporation
              │     ├── Tamil Nadu Road Development Company (TNRDC)
              │     └── Tamil Nadu Road Infrastructure Development Corporation (TNRIDC)
              │
              └── [HEAD OF THE DEPARTMENT (Apex Technical Authority)]
                    └── Director General (H), Highways Department (Er. R. Selvadurai)
                          ├── BOARD OF ENGINEERS (BOE) & Commissionerate of Tenders (COT)
                          │
                          ├── [1. Construction & Maintenance (C&M) Wings - 4 Regional Zones]
                          │     ├── Chennai Zone (CE Er. S. Palanivel)
                          │     │     ├── Chennai Circle ──────> City Divisions (North, South, Central)
                          │     │     ├── Chengalpattu Circle ──> Tambaram Division (DE Er. P. Anandhan), Chengalpattu Division
                          │     │     └── Tiruvallur Circle ────> Tiruvallur Division, Ponneri Division
                          │     ├── Coimbatore Zone (CE Er. S. Palanivel A/C) ──> Coimbatore, Salem, Tiruppur Circles
                          │     ├── Madurai Zone (CE Er. Ramesh) ───────────────> Madurai, Tirunelveli, Ramanathapuram Circles
                          │     └── Tiruchirappalli Zone (CE Er. S. Jawahar Muthuraj) ─> Trichy, Thanjavur, Villupuram Circles
                          │
                          ├── [2. National Highways (NH) Wing] (CE Er. K. Vanathi)
                          │     └── Entrusted MoRTH Works (797.562 km across NH 181, 648, 179A, 336, 42, 75, 38, etc.)
                          │
                          ├── [3. Planning, Designs & Investigation (PDI)] (CE Er. S. Yamini)
                          │     └── DPR formulation, Alignment Survey & Hydrological Bridge Modeling
                          │
                          ├── [4. Highways Research Station (HRS Guindy)] (Director Er. A. Venkatachalam)
                          │     └── Soil & Foundation, Bitumen & Aggregates, Concrete Core Audits, Roughness Index (IRI)
                          │
                          ├── [5. Special Project Vehicles (SPVs)]
                          │     ├── TNRSP-II World Bank Project (PD Thiru D. Baskara Pandian, IAS; CE Er. S. Yamini A/C)
                          │     ├── Chennai-Kanyakumari Industrial Corridor (CKICP) (PD Thiru D. Baskara Pandian, IAS; CE Er. R. Vimala A/C)
                          │     └── Tamil Nadu State Highways Authority (TANSHA) (Member Technical Er. D. Jebaselwin Gladson)`}
              </pre>
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

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
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

      {/* TAB 4: 8 STATUTORY COMMITTEES */}
      {activeTab === 'committees' && (
        <div className="space-y-6">
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
          {/* Functional Groups Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#004B87]" />
                13 Functional Permission Groups (Distinct from Formal Cadres)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These are functional authorization scopes assigned to officers based on departmental portfolio, not separate statutory civil service cadres.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.functional_permission_groups.map((fg) => (
                <div key={fg.code} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#006A4E]">{fg.code}</span>
                    <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Permission Scope
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{fg.name}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{fg.mandate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* External Coordinating Stakeholders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#006A4E]" />
                External Department Coordination Roster
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Authorized coordinating external entities with designated single points of contact (SPOC).
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Department / Agency</th>
                    <th className="p-3">Designated SPOC Designation</th>
                    <th className="p-3">Coordination Portfolio</th>
                    <th className="p-3">High-Impact Clearance Mandate</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data?.external_stakeholders.map((stk) => (
                    <tr key={stk.department} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{stk.department}</td>
                      <td className="p-3 font-semibold text-[#004B87]">{stk.spoc}</td>
                      <td className="p-3 text-slate-700">{stk.portfolio}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{stk.clearance}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-[#006A4E] text-[10px] font-bold px-2 py-0.5 rounded">
                          {stk.status}
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
    </div>
  );
};
