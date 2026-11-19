import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sorAPI } from '../services/api';
import { SoRVersionItem, SoRItem, SoRAllowanceRule } from '../types';

export const SoRCataloguePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'highways' | 'allowances' | 'conveyance' | 'reference'>('highways');
  const [versions, setVersions] = useState<SoRVersionItem[]>([]);
  const [items, setItems] = useState<SoRItem[]>([]);
  const [rules, setRules] = useState<SoRAllowanceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');

  // Conveyance sandbox calculator state
  const [calcLeadKm, setCalcLeadKm] = useState<number>(10);
  const [calcQuantity, setCalcQuantity] = useState<number>(500);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, iData, rData] = await Promise.all([
        sorAPI.getVersions(),
        sorAPI.getItems({ limit: 100 }),
        sorAPI.getAllowanceRules()
      ]);
      setVersions(vData);
      setItems(iData.items);
      setRules(rData);
    } catch (err) {
      console.error('Failed to load SoR catalogue data', err);
    } finally {
      setLoading(false);
    }
  };

  const subCategories = ['ALL', ...Array.from(new Set(items.map(it => it.sub_category).filter(Boolean)))];

  const filteredItems = items.filter(it => {
    const matchesSearch =
      it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.specification_code && it.specification_code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedSubCategory === 'ALL' || it.sub_category === selectedSubCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate sandbox conveyance
  const calculateSandboxConveyanceRate = (km: number) => {
    if (km <= 0) return 0;
    if (km <= 1) return 140.0;
    return 140.0 + (km - 1) * 18.5;
  };

  const currentVersion = versions[0] || {
    version_code: 'SOR-2026-27-V1',
    title: 'Schedule of Rates 2026–2027, Volume I (Highways Department)',
    effective_from: '2026-11-13T00:00:00Z',
    notes: 'Rates are strictly basic and exclusive of GST.'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Statutory Schedule of Rates
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                w.e.f. 13/11/2026 (Active)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-50">{currentVersion.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic basic rate master, statutory allowances & conveyance slabs governed by Volume I General Notes 1–10.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex items-center gap-4 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px]">Tax Separation</p>
              <p className="text-amber-400 font-semibold mt-0.5">Rates strictly GST Exclusive</p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px]">Active Version</p>
              <p className="text-slate-200 font-mono font-medium mt-0.5">{currentVersion.version_code}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('highways')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'highways'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Highways Items (pp. 311–352)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {items.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('allowances')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'allowances'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            General Notes 1–10 & Allowances
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {rules.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('conveyance')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'conveyance'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            Conveyance & Head Load Slabs
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reference'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Common / PWD Cross-References
          </button>
        </div>
      </div>

      {/* Tab 1: Highways Items (pp. 311–352) */}
      {activeTab === 'highways' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search item code, description, MoRTH clause..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Sub-Category:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {subCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat || 'ALL')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedSubCategory === cat
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Item Code</th>
                    <th className="py-3.5 px-4 font-semibold">Description & Specification</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Unit</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Basic Rate (₹)</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Component Breakdown</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Printed Page</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Bridge 3% Guardrail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-xs border border-slate-200">
                            {item.item_code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans block mt-0.5">{item.sub_category}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-900 font-medium line-clamp-2">{item.description}</p>
                        {item.specification_code && (
                          <span className="inline-block mt-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {item.specification_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700 text-xs">
                        <span className="px-2 py-1 bg-slate-100 rounded font-semibold">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-base">
                        ₹{item.basic_rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">excl. GST</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100" title="Labour Component">
                            L: ₹{item.labour_component_rate}
                          </span>
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100" title="Material Component">
                            M: ₹{item.material_component_rate}
                          </span>
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100" title="Machinery Component">
                            E: ₹{item.machinery_component_rate}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs text-slate-600 font-mono">
                        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          <FileText className="w-3 h-3 text-slate-400" />
                          p. {item.printed_page_number || '311'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {item.is_bridge_structural_eligible ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            Blocked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No items match your search or category filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: General Notes 1–10 & Allowances */}
      {activeTab === 'allowances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                      {rule.rule_code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        rule.percentage_rate >= 15
                          ? 'bg-rose-100 text-rose-800'
                          : rule.percentage_rate >= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      +{rule.percentage_rate}% Rate Addition
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">{rule.name}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{rule.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Applicability Scope:</span>
                    <span className="font-mono font-medium text-slate-800">{rule.applicability_scope}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Statutory Citation:</span>
                    <span className="font-semibold text-indigo-700">{rule.statutory_citation}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Mandatory Tender Clause:</span>
                    {rule.requires_tender_clause ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Required (Hard Gate)
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Standard Statutory</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statutory Guardrail Info Box */}
          <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-semibold text-sm">Statutory Rules Verification Guardrails</p>
              <p>
                1. <strong>Night Operations (+25%):</strong> Strictly applicable to the <em>labour portion only</em>. Billed items must carry an explicit tender agreement clause approving night work. Applying night work allowance to composite rates or without tender clause triggers automated anomaly alert.
              </p>
              <p>
                2. <strong>Bridge 3% Provisional Allowance:</strong> Only admissible on structural bridge components for contracts where bridge works constitute &ge; 50% of cost. Hard-blocked on drains, culverts, retaining walls, and minor repairs.
              </p>
              <p>
                3. <strong>GST Separation:</strong> All SoR basic rates are strictly tax-exclusive. GST (18%) is applied separately at the summary level and never compounded on basic rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Conveyance & Head Load Slabs */}
      {activeTab === 'conveyance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statutory Slab Tables */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Table-I: Mechanical Transport Conveyance Rates</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Highways Annexure-I pp. 350-354 (Pucca / Tarred Roads)</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-medium">
                  Unit: ₹ per cum
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Lead Distance Slab</th>
                    <th className="py-3 px-4 font-semibold">Statutory Formula / Rate</th>
                    <th className="py-3 px-4 font-semibold text-right">Effective Rate (₹/cum)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">Initial 1st km Lead</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">Fixed initial slab charge (loading, haulage, unloading)</td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">₹140.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">2nd km to 20th km</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">₹140.00 + (Distance - 1) × ₹18.50 per km</td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">+₹18.50 / km</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">Beyond 20 km (up to 50 km)</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">Graduated rate with verified GPS haulage route</td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">+₹15.20 / km</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Head Load Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Head Load & Lift Deductions / Allowances</h3>
                <p className="text-xs text-slate-500 mt-0.5">General Note 5: Free lead 10m, Free lift 2.0m</p>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-medium">Free Horizontal Lead:</span>
                  <span className="font-mono font-bold text-slate-900">10 Metres (Included in Basic Rate)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-medium">Free Vertical Lift:</span>
                  <span className="font-mono font-bold text-slate-900">2.0 Metres (Included in Basic Rate)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-medium">Subsequent Head Load Lead Slabs:</span>
                  <span className="font-mono font-bold text-slate-900">₹32.00 per cum per 50m block (rounded to 100m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Conveyance Sandbox */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Deterministic Haulage Calculator</h3>
                <p className="text-[11px] text-slate-500">Live test of Table-I formula</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Distance (km):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={calcLeadKm}
                onChange={e => setCalcLeadKm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Quantity (cum):</label>
              <input
                type="number"
                min="1"
                value={calcQuantity}
                onChange={e => setCalcQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>1st km Base Slab:</span>
                <span className="text-white">₹140.00 / cum</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Subsequent Haulage ({Math.max(0, calcLeadKm - 1)} km):</span>
                <span className="text-white">
                  ₹{(Math.max(0, calcLeadKm - 1) * 18.5).toFixed(2)} / cum
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-amber-400 font-semibold">Total Conveyance Rate:</span>
                <span className="text-amber-300 font-bold text-sm">
                  ₹{calculateSandboxConveyanceRate(calcLeadKm).toFixed(2)} / cum
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Total Haulage Cost:</span>
                <span className="text-emerald-400 font-bold text-base">
                  ₹{(calculateSandboxConveyanceRate(calcLeadKm) * calcQuantity).toLocaleString('en-IN', {
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Conveyance calculations are 100% deterministic and trace every kilometer slab against verified quarry coordinates.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Common / PWD Reference Items */}
      {activeTab === 'reference' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Common Standard Schedule of Rates (PWD / Building Unit)</h2>
              <p className="text-xs text-slate-500">
                Highways Volume-I integrates with Common PWD items for roadside administrative buildings, tool rooms, toll plazas, and electrical lighting.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">PWD-BLD-01</span>
              <h4 className="font-semibold text-sm text-slate-900 mt-2">Brick Masonry in CM 1:5</h4>
              <p className="text-xs text-slate-600 mt-1">Country bricks in cement mortar for boundary walls & inspection bungalows.</p>
              <div className="mt-3 flex justify-between text-xs font-mono font-bold text-slate-800">
                <span>Rate: ₹4,850.00 / cum</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">PWD-ELE-04</span>
              <h4 className="font-semibold text-sm text-slate-900 mt-2">LED Highway Street Lighting (120W)</h4>
              <p className="text-xs text-slate-600 mt-1">High-mast illumination fixtures for bypass junctions and toll plazas.</p>
              <div className="mt-3 flex justify-between text-xs font-mono font-bold text-slate-800">
                <span>Rate: ₹14,200.00 / each</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">PWD-PLMB-02</span>
              <h4 className="font-semibold text-sm text-slate-900 mt-2">Storm Water Catch-Pit Chambers</h4>
              <p className="text-xs text-slate-600 mt-1">Precast RCC drainage inspection chambers with heavy-duty ductile iron grating.</p>
              <div className="mt-3 flex justify-between text-xs font-mono font-bold text-slate-800">
                <span>Rate: ₹8,650.00 / unit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
