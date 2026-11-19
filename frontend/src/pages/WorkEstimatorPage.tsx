import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Layers,
  ShieldCheck,
  Scale,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight,
  Info,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { sorAPI } from '../services/api';
import {
  SoREstimate,
  SoRItem,
  SoRBOQItem,
  SoRReconciliationEntry,
  SoRAllowanceRule
} from '../types';

export const WorkEstimatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lines' | 'allowances' | 'reconciliation'>('lines');
  const [estimates, setEstimates] = useState<SoREstimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<SoREstimate | null>(null);
  const [items, setItems] = useState<SoRItem[]>([]);
  const [rules, setRules] = useState<SoRAllowanceRule[]>([]);
  const [boqItems, setBOQItems] = useState<SoRBOQItem[]>([]);
  const [reconciliation, setReconciliation] = useState<SoRReconciliationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [boqGenerated, setBoqGenerated] = useState(false);

  // New line item form state
  const [selectedItemId, setSelectedItemId] = useState<number>(1);
  const [itemQuantity, setItemQuantity] = useState<number>(1000);
  const [itemLeadKm, setItemLeadKm] = useState<number>(5);
  const [itemLiftM, setItemLiftM] = useState<number>(1.5);
  const [itemStructuralType, setItemStructuralType] = useState<string>('ROADWAY');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [estList, iList, rList] = await Promise.all([
        sorAPI.getEstimates(),
        sorAPI.getItems({ limit: 50 }),
        sorAPI.getAllowanceRules()
      ]);
      setEstimates(estList);
      setItems(iList.items);
      setRules(rList);
      if (estList.length > 0) {
        setSelectedEstimate(estList[0]);
        loadEstimateAuxiliary(estList[0].id, estList[0].project_id || 1);
      }
    } catch (err) {
      console.error('Failed to load work estimator data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEstimateAuxiliary = async (estId: number, projId: number) => {
    try {
      const reconData = await sorAPI.getReconciliation(projId);
      setReconciliation(reconData.lines);
    } catch (err) {
      console.error('Failed to load auxiliary reconciliation', err);
    }
  };

  const handleSelectEstimate = (est: SoREstimate) => {
    setSelectedEstimate(est);
    setBoqGenerated(false);
    loadEstimateAuxiliary(est.id, est.project_id || 1);
  };

  const handleGenerateBOQ = async () => {
    if (!selectedEstimate) return;
    try {
      const boq = await sorAPI.generateBOQ(selectedEstimate.id);
      setBOQItems(boq);
      setBoqGenerated(true);
    } catch (err) {
      console.error('Failed to generate BOQ', err);
    }
  };

  const handleAddLine = () => {
    if (!selectedEstimate) return;
    const item = items.find(it => it.id === selectedItemId);
    if (!item) return;

    // Deterministic lead conveyance
    const conveyanceRate = itemLeadKm <= 0 ? 0 : itemLeadKm <= 1 ? 140.0 : 140.0 + (itemLeadKm - 1) * 18.5;
    const conveyanceCharge = conveyanceRate * itemQuantity;

    // Corporation allowance
    let allowancePct = 0;
    if (selectedEstimate.is_corporation_area) {
      allowancePct = selectedEstimate.corporation_tier === 'TIER_1' ? 10.0 : 5.0;
    }
    // Bridge 3% check
    if (
      selectedEstimate.is_bridge_work &&
      selectedEstimate.bridge_cost_share_pct >= 50 &&
      item.is_bridge_structural_eligible
    ) {
      allowancePct += 3.0;
    }

    const baseCost = item.basic_rate * itemQuantity;
    const allowanceAmount = baseCost * (allowancePct / 100);
    const lineTotal = baseCost + conveyanceCharge + allowanceAmount;
    const effectiveRate = lineTotal / itemQuantity;

    const newLine = {
      id: (selectedEstimate.lines?.length || 0) + 1,
      line_number: (selectedEstimate.lines?.length || 0) + 1,
      sor_item_id: item.id,
      sor_item: item,
      item_code_snapshot: item.item_code,
      description_snapshot: item.description,
      unit_snapshot: item.unit,
      quantity: itemQuantity,
      basic_rate_snapshot: item.basic_rate,
      lead_km: itemLeadKm,
      lift_m: itemLiftM,
      conveyance_charge: conveyanceCharge,
      head_load_charge: 0,
      allowance_pct_applied: allowancePct,
      allowance_amount: allowanceAmount,
      structural_type: itemStructuralType,
      effective_rate: effectiveRate,
      line_total: lineTotal,
      calculation_trace: {
        item_code: item.item_code,
        quantity: itemQuantity,
        basic_rate: item.basic_rate,
        base_cost: baseCost,
        conveyance_rate: conveyanceRate,
        lead_km: itemLeadKm,
        conveyance_charge: conveyanceCharge,
        lift_m: itemLiftM,
        head_load_charge: 0,
        allowances_applied: [
          {
            rule_code: 'STATUTORY_CHECK',
            percentage: allowancePct,
            amount: allowanceAmount,
            basis: 'Statutory rules evaluated'
          }
        ],
        total_allowance: allowanceAmount,
        effective_rate: effectiveRate,
        line_total: lineTotal
      }
    };

    const updatedLines = [...(selectedEstimate.lines || []), newLine];
    const newBase = updatedLines.reduce((s, l) => s + l.basic_rate_snapshot * l.quantity, 0);
    const newConv = updatedLines.reduce((s, l) => s + l.conveyance_charge, 0);
    const newAllow = updatedLines.reduce((s, l) => s + l.allowance_amount, 0);
    const newSubTotal = newBase + newConv + newAllow;
    const newGST = newSubTotal * 0.18;
    const newGrand = newSubTotal + newGST;

    setSelectedEstimate({
      ...selectedEstimate,
      lines: updatedLines,
      base_total_amount: newBase,
      conveyance_total_amount: newConv,
      allowance_total_amount: newAllow,
      sub_total_before_tax: newSubTotal,
      gst_amount: newGST,
      grand_total_amount: newGrand
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                Work Estimate & BOQ Builder
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold">
                Deterministic Math Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-50">Highways Project Cost Estimator & Bill of Quantities</h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic rates with itemized conveyance, statutory allowances, strictly separated 18% GST, and MB reconciliation.
            </p>
          </div>

          {/* Estimate Selector Dropdown */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 min-w-[280px]">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold mb-1">
              Select Active Estimate
            </label>
            <select
              value={selectedEstimate?.id || ''}
              onChange={e => {
                const est = estimates.find(x => x.id === Number(e.target.value));
                if (est) handleSelectEstimate(est);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:ring-2 focus:ring-amber-500"
            >
              {estimates.map(e => (
                <option key={e.id} value={e.id}>
                  {e.estimate_code} - {e.road_category} ({e.division_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lines')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'lines'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Estimate & BOQ Lines
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {selectedEstimate?.lines?.length || 0}
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
            Statutory Allowance & Rule Check
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reconciliation'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4" />
            MB & Bill Variance Reconciliation
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {reconciliation.length} items
            </span>
          </button>
        </div>
      </div>

      {/* Selected Estimate Summary KPI Bar */}
      {selectedEstimate && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Base Works Cost</span>
            <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
              ₹{(selectedEstimate.base_total_amount / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500">Pure SoR basic</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Lead Haulage</span>
            <span className="text-base font-bold text-indigo-700 font-mono mt-0.5 block">
              ₹{(selectedEstimate.conveyance_total_amount / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500">Table-I slabs</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Statutory Additions</span>
            <span className="text-base font-bold text-amber-700 font-mono mt-0.5 block">
              ₹{(selectedEstimate.allowance_total_amount / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500">Corp/Night/Bridge</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Sub-Total (excl. Tax)</span>
            <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
              ₹{(selectedEstimate.sub_total_before_tax / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500">Pre-tax works sum</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">GST (18% Statutory)</span>
            <span className="text-base font-bold text-rose-700 font-mono mt-0.5 block">
              ₹{(selectedEstimate.gst_amount / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-500">Separately calculated</span>
          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-md">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Grand Total</span>
            <span className="text-base font-bold text-amber-300 font-mono mt-0.5 block">
              ₹{(selectedEstimate.grand_total_amount / 100000).toFixed(2)} L
            </span>
            <span className="text-[11px] text-slate-400">Total Sanction Cost</span>
          </div>
        </div>
      )}

      {/* Tab 1: Estimate & BOQ Lines */}
      {activeTab === 'lines' && selectedEstimate && (
        <div className="space-y-6">
          {/* Add Line Form Drawer */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Add Line Item with Live Deterministic Pricing</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">SoR Version: SOR-2026-27-V1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select SoR Master Item:</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.item_code} - {it.description.substring(0, 48)}... (₹{it.basic_rate}/{it.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={e => setItemQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Distance (km):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={itemLeadKm}
                  onChange={e => setItemLeadKm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Structural Type:</label>
                <select
                  value={itemStructuralType}
                  onChange={e => setItemStructuralType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ROADWAY">Roadway / Pavement</option>
                  <option value="DRAINAGE">Roadside Drain</option>
                  <option value="CULVERT">Cross Drainage Culvert</option>
                  <option value="BRIDGE_SUBSTRUCTURE">Bridge Substructure (Pier/Abutment)</option>
                  <option value="BRIDGE_SUPERSTRUCTURE">Bridge Superstructure (Girder/Deck)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleAddLine}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Line Item to Estimate
              </button>
            </div>
          </div>

          {/* Lines Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Line Items & Deterministic Rate Abstract</h3>
                <p className="text-xs text-slate-500">{selectedEstimate.title}</p>
              </div>
              <button
                onClick={handleGenerateBOQ}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Generate Tender BOQ Schedule
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 font-semibold text-center">#</th>
                    <th className="py-3 px-4 font-semibold">Item & Description</th>
                    <th className="py-3 px-3 font-semibold text-center">Unit</th>
                    <th className="py-3 px-3 font-semibold text-right">Quantity</th>
                    <th className="py-3 px-3 font-semibold text-right">Basic Rate (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">Lead (km)</th>
                    <th className="py-3 px-3 font-semibold text-right">Conveyance (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">Allowance (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Effective Rate (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEstimate.lines?.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">{l.line_number}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-mono text-xs font-bold text-slate-900 block">{l.item_code_snapshot}</span>
                        <p className="text-xs text-slate-600 truncate">{l.description_snapshot}</p>
                        {l.structural_type && (
                          <span className="text-[10px] text-slate-400 font-mono">[{l.structural_type}]</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-700">{l.unit_snapshot}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {l.quantity.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">₹{l.basic_rate_snapshot}</td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-700">{l.lead_km} km</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{l.conveyance_charge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-700">
                        {l.allowance_amount > 0
                          ? `₹${l.allowance_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (+${l.allowance_pct_applied}%)`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{l.effective_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{l.line_total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generated BOQ Schedule Modal/Block */}
          {boqGenerated && (
            <div className="bg-emerald-50/90 border border-emerald-200 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Tender Bill of Quantities (BOQ Schedule) Generated Successfully
                  </h4>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Format: Schedule-A Standard
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Rates locked strictly based on SoR-2026-27-V1 specifications. All statutory allowances, conveyance charges and 18% GST have been itemized in compliance with TN Highways Department Financial Rules.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Statutory Allowance & Rule Check */}
      {activeTab === 'allowances' && selectedEstimate && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Estimate Statutory Rule Verification Matrix</h3>
            <p className="text-xs text-slate-500">
              Deterministic verification against General Notes 1–10. Hard gates prevent non-compliant tender claims.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Corporation Check */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      CORP_ALLOWANCE
                    </span>
                    {selectedEstimate.is_corporation_area ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Admissible (+10%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Not Applicable (Rural/Munc.)
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900">Municipal Corporation Allowance</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Applicable to works executed within notified Tier-1 (Chennai, Madurai, CBE, Hosur +10%) or other 17 corporations (+5%).
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  Status: <strong>{selectedEstimate.corporation_tier || 'Non-Corporation'}</strong>
                </div>
              </div>

              {/* Night Work Check */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      NIGHT_WORK_25
                    </span>
                    {selectedEstimate.is_night_work_approved && selectedEstimate.tender_night_work_clause ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Clause Verified
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Guardrail Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900">Night Work Allowance (+25% Labour Only)</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Strictly restricted to the labour portion only. Admissible only when tender specification contains an explicit night operations clause.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500 truncate">
                  Tender Clause: <strong>{selectedEstimate.tender_night_work_clause || 'None Specified'}</strong>
                </div>
              </div>

              {/* Bridge 3% Provisional Check */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      BRIDGE_3%
                    </span>
                    {selectedEstimate.is_bridge_work && selectedEstimate.bridge_cost_share_pct >= 50 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Eligible ({selectedEstimate.bridge_cost_share_pct}%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Hard Blocked (Share &lt; 50%)
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900">Bridge 3% Provisional Allowance</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    General Note 10: Only admissible on structural bridge components for works where bridge cost share &ge; 50%. Hard blocked on drains and culverts.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  Bridge Cost Share: <strong>{selectedEstimate.bridge_cost_share_pct}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MB & Bill Variance Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">BOQ vs Measurement Book (MB) vs Billed Reconciliation</h3>
                <p className="text-xs text-slate-500">
                  Automated three-way quantity and rate verification preventing unapproved expenditure and scope creep.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                3-Way Cross Verification
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Item & Description</th>
                    <th className="py-3 px-3 font-semibold text-center">Unit</th>
                    <th className="py-3 px-3 font-semibold text-right">Sanctioned BOQ</th>
                    <th className="py-3 px-3 font-semibold text-right">Recorded in MB</th>
                    <th className="py-3 px-3 font-semibold text-right">Billed in Invoice</th>
                    <th className="py-3 px-3 font-semibold text-right">Delta (%)</th>
                    <th className="py-3 px-3 font-semibold text-center">Variance Category</th>
                    <th className="py-3 px-4 font-semibold">Audit Finding & Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reconciliation.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                        <span className="font-mono text-xs font-bold text-slate-800 block">{rec.item_code}</span>
                        <p className="text-xs text-slate-600 truncate">{rec.description}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">{rec.unit}</td>
                      <td className="py-3 px-3 text-right font-mono text-xs">
                        <span className="text-slate-800 block">{rec.boq_quantity.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-500">@ ₹{rec.boq_rate.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs">
                        <span className="text-slate-800 block">{rec.mb_quantity.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-500">@ ₹{rec.mb_rate.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold">
                        <span className="text-rose-700 block">{rec.billed_quantity.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-rose-600">@ ₹{rec.billed_rate.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-xs">
                        <span className={rec.variance_percentage > 10 ? 'text-rose-700' : 'text-emerald-700'}>
                          +{rec.variance_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            rec.variance_category === 'RATE_SPIKE'
                              ? 'bg-rose-100 text-rose-800'
                              : rec.variance_category === 'QUANTITY_SPIKE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rec.variance_category}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md text-xs text-slate-700 leading-relaxed">
                        {rec.audit_note}
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
