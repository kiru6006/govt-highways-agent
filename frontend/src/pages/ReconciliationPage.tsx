import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  GitBranch,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Scale,
  Building2,
  FileText,
  TrendingUp,
  X,
  ExternalLink
} from 'lucide-react';
import { reconciliationAPI, api } from '../services/api';
import {
  ReconciliationLineageItem,
  SoRContractVariationItem,
  SoRQCTestLinkItem,
  BillValidationResultData,
  ProjectItem
} from '../types';

export const ReconciliationPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeTab, setActiveTab] = useState<'lineage' | 'variations' | 'qc_check'>('lineage');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  const [lineageData, setLineageData] = useState<ReconciliationLineageItem[]>([]);
  const [variations, setVariations] = useState<SoRContractVariationItem[]>([]);
  const [qcLinks, setQcLinks] = useState<SoRQCTestLinkItem[]>([]);
  const [selectedItemCode, setSelectedItemCode] = useState<string>('W-1001');

  // Modal & Sandbox States
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [newVarItemCode, setNewVarItemCode] = useState('W-1001');
  const [newVarDesc, setNewVarDesc] = useState('Dense Bituminous Macadam (DBM) 100mm Grade-II');
  const [newVarUnit, setNewVarUnit] = useState('cum.');
  const [newVarOrigQty, setNewVarOrigQty] = useState(350);
  const [newVarRevQty, setNewVarRevQty] = useState(410);
  const [newVarOrigRate, setNewVarOrigRate] = useState(8450);
  const [newVarRevRate, setNewVarRevRate] = useState(8450);
  const [newVarJustCode, setNewVarJustCode] = useState('SITE_CONDITION');
  const [newVarDetails, setNewVarDetails] = useState('');
  const [isSubmittingVar, setIsSubmittingVar] = useState(false);

  // Bill Validation Sandbox
  const [sandboxBillNo, setSandboxBillNo] = useState('RA-BILL-04');
  const [sandboxContractor, setSandboxContractor] = useState('L&T Infrastructure Ltd');
  const [billValidResult, setBillValidResult] = useState<BillValidationResultData | null>(null);
  const [isValidatingBill, setIsValidatingBill] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadReconciliationData(selectedProjectId);
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const projs = await api.getProjects();
      setProjects(projs);
    } catch {
      // ignore
    }
  };

  const loadReconciliationData = async (projId: number) => {
    setIsLoading(true);
    try {
      const [lin, vars, qc] = await Promise.all([
        reconciliationAPI.getLineage(projId),
        reconciliationAPI.getVariations(projId),
        reconciliationAPI.getQCLinks(projId)
      ]);
      setLineageData(lin);
      setVariations(vars);
      setQcLinks(qc);
      if (lin.length > 0 && !lin.some(l => l.item_code === selectedItemCode)) {
        setSelectedItemCode(lin[0].item_code);
      }
    } catch (err) {
      console.error('Failed loading reconciliation data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVar(true);
    try {
      const created = await reconciliationAPI.createVariation({
        project_id: selectedProjectId,
        estimate_id: 'EST-2026-001',
        item_code: newVarItemCode,
        description: newVarDesc,
        unit: newVarUnit,
        original_sanctioned_qty: Number(newVarOrigQty),
        proposed_revised_qty: Number(newVarRevQty),
        original_rate: Number(newVarOrigRate),
        proposed_rate: Number(newVarRevRate),
        justification_code: newVarJustCode,
        justification_details: newVarDetails || 'Subgrade improvement required based on site conditions.'
      });
      setVariations([created, ...variations]);
      setIsVariationModalOpen(false);
      setNewVarDetails('');
    } catch (err) {
      console.error('Failed to create variation', err);
    } finally {
      setIsSubmittingVar(false);
    }
  };

  const handleRunBillValidation = async (withSpike: boolean = false, withDuplicate: boolean = false) => {
    setIsValidatingBill(true);
    try {
      const items = [
        { item_code: 'W-1001', quantity: 100.0, rate: 8450.0 },
        { item_code: 'B-201', quantity: 40.0, rate: 7055.50 }
      ];
      if (withDuplicate) {
        items.push({ item_code: 'W-1001', quantity: 20.0, rate: 8450.0 });
      }
      if (withSpike) {
        items.push({ item_code: 'W-0055', quantity: 500.0, rate: 155.0 }); // canonical is 88.10
      }

      const res = await reconciliationAPI.validateBill('BILL-SANDBOX-01', {
        bill_id: 'BILL-SANDBOX-01',
        project_id: selectedProjectId,
        bill_number: sandboxBillNo,
        contractor_name: sandboxContractor,
        billed_items: items,
        total_basic_billed: 1500000.0,
        gst_claimed: 270000.0
      });
      setBillValidResult(res);
    } catch (err) {
      console.error('Bill validation error', err);
    } finally {
      setIsValidatingBill(false);
    }
  };

  const activeLineage = lineageData.find(l => l.item_code === selectedItemCode) || lineageData[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header with Statutory Authority Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                SoR-WECI Screen 4
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                G.O.(Ms) No. 11 Delegation
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                MORTH Spec Section 500/1700
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                G.O. 84 5-Yr Renewal Guard
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-7 h-7 text-blue-600" />
              Measurement Book (MB), Variations & Billing Reconciliation
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              End-to-end 5-stage lineage verification (SoR Master &rarr; Sanctioned Estimate &rarr; Tender BOQ &rarr; Site MB &rarr; Contractor Bill) with automated variance detection and QC test linkage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title}
                  </option>
                ))
              ) : (
                <option value={1}>Chennai - Kancheepuram Expressway (SH-112)</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Executive Reconciliation KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>BOQ Sanctioned Baseline</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹3.80 Cr</div>
          <p className="text-xs text-slate-500 mt-1">Contract value at tender award</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>MB Recorded Field Vol.</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700">₹3.79 Cr</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">99.7% measured at site</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Contractor Billed Invoices</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700">₹4.18 Cr</div>
          <p className="text-xs text-amber-600 mt-1 font-medium">+10.0% variance over BOQ</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>QC Clearance & Lock-in</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">100% Passed</div>
          <p className="text-xs text-slate-500 mt-1">MORTH & G.O. 84 verified</p>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex gap-4">
        <button
          onClick={() => setActiveTab('lineage')}
          className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'lineage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Estimate-to-Bill Lineage Explorer
        </button>

        <button
          onClick={() => setActiveTab('variations')}
          className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'variations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          Revised Estimates & Variations ({variations.length})
        </button>

        <button
          onClick={() => setActiveTab('qc_check')}
          className={`py-3.5 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'qc_check'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Maintenance & QC Gate Check ({qcLinks.length})
        </button>
      </div>

      {/* 4. Tab 1: Lineage Explorer */}
      {activeTab === 'lineage' && (
        <div className="space-y-6">
          {/* Item Selector Pills */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Select Line Item:
            </span>
            {lineageData.map((lin) => (
              <button
                key={lin.item_code}
                onClick={() => setSelectedItemCode(lin.item_code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedItemCode === lin.item_code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lin.item_code}
                <span className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] ${
                  lin.reconciliation_verdict === 'MATCHED'
                    ? 'bg-emerald-500/20 text-emerald-800'
                    : 'bg-amber-500/20 text-amber-800'
                }`}>
                  {lin.reconciliation_verdict}
                </span>
              </button>
            ))}
          </div>

          {activeLineage && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    5-Stage Traceability: Item {activeLineage.item_code}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeLineage.lineage_flow[0]?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    activeLineage.variance_percentage > 5
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    Net Variance: {activeLineage.variance_percentage}%
                  </span>
                </div>
              </div>

              {/* Visual Lineage Progression */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {activeLineage.lineage_flow.map((node, idx) => (
                  <div
                    key={node.stage}
                    className={`p-4 rounded-xl border transition-all ${
                      node.status.includes('FLAGGED')
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Stage {idx + 1}: {node.stage}</span>
                      {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900 truncate" title={node.reference_id}>
                      {node.reference_id}
                    </div>
                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-semibold text-slate-800">{node.quantity.toLocaleString()} {node.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-semibold text-slate-800">₹{node.rate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                        <span>Amount:</span>
                        <span>₹{(node.amount / 100000).toFixed(2)} L</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        node.status === 'PASSED' || node.status === 'OFFICIAL_GAZETTED' || node.status === 'SANCTIONED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (node.status.includes('FLAGGED') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')
                      }`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lineage Table Detail */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Lifecycle Stage</th>
                      <th className="px-4 py-3 text-left">Document / Ref ID</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Unit Rate</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left">Date Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeLineage.lineage_flow.map((node) => (
                      <tr key={node.stage} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{node.stage}</td>
                        <td className="px-4 py-3 text-blue-700 font-mono text-xs">{node.reference_id}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          {node.quantity.toLocaleString()} {node.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">₹{node.rate.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">₹{node.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            node.status === 'PASSED' || node.status === 'OFFICIAL_GAZETTED' || node.status === 'SANCTIONED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {node.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{node.timestamp || '2026-11-18'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Bill Pre-Audit & Validation Sandbox */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  Live Contractor Running Account (RA) Bill Validation Sandbox
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate bill validation engine checking for duplicate voucher line items, rate spikes (&gt;5% tender cap), and unrecorded MB quantities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunBillValidation(false, false)}
                  disabled={isValidatingBill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isValidatingBill ? 'animate-spin' : ''}`} />
                  Test Normal Bill
                </button>
                <button
                  onClick={() => handleRunBillValidation(true, true)}
                  disabled={isValidatingBill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Test Spiked & Duplicate Claim
                </button>
              </div>
            </div>

            {billValidResult && (
              <div className={`p-4 rounded-xl border ${
                billValidResult.status === 'PASSED'
                  ? 'bg-emerald-50 border-emerald-200'
                  : (billValidResult.status === 'BLOCKED' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300')
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {billValidResult.status === 'PASSED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-bold text-sm text-slate-900">
                      Validation Status: {billValidResult.status}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Checked {billValidResult.reconciliation_summary.items_checked} Items
                  </span>
                </div>

                {billValidResult.duplicate_claims.length > 0 && (
                  <div className="mt-2 p-2.5 bg-red-100/70 rounded-lg text-xs text-red-900 font-medium space-y-1">
                    <div className="font-bold">Duplicate Line Item Claims Detected:</div>
                    {billValidResult.duplicate_claims.map((d, i) => (
                      <div key={i}>&bull; Item {d.item_code}: {d.reason}</div>
                    ))}
                  </div>
                )}

                {billValidResult.rate_spikes.length > 0 && (
                  <div className="mt-2 p-2.5 bg-amber-100/70 rounded-lg text-xs text-amber-900 font-medium space-y-1">
                    <div className="font-bold">Rate Spikes Exceeding Approved Thresholds:</div>
                    {billValidResult.rate_spikes.map((r, i) => (
                      <div key={i}>
                        &bull; Item {r.item_code}: Billed at ₹{r.billed_rate} vs Canonical SoR ₹{r.canonical_sor_rate} (+{r.excess_pct}% excess) [{r.threshold_rule}]
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                  {billValidResult.audit_notes.map((note, idx) => (
                    <div key={idx} className="italic text-slate-500">&bull; {note}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Revised Estimates & Variations */}
      {activeTab === 'variations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Contract Variations & Revised Estimate Register
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Statutory delegation routing under G.O.(Ms) No. 11 (DE &le; ₹50L, SE &le; ₹7Cr, CE &gt; ₹7Cr) with documented engineering justification.
              </p>
            </div>

            <button
              onClick={() => setIsVariationModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Propose Contract Variation
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Variation No.</th>
                  <th className="px-4 py-3 text-left">Item Code & Scope</th>
                  <th className="px-4 py-3 text-right">Sanctioned Qty</th>
                  <th className="px-4 py-3 text-right">Revised Qty</th>
                  <th className="px-4 py-3 text-right">Qty Delta</th>
                  <th className="px-4 py-3 text-right">Financial Impact</th>
                  <th className="px-4 py-3 text-left">Justification Code</th>
                  <th className="px-4 py-3 text-left">Approval Authority</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {variations.length > 0 ? (
                  variations.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{v.variation_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{v.item_code}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{v.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">{v.original_sanctioned_qty.toLocaleString()} {v.unit}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{v.proposed_revised_qty.toLocaleString()} {v.unit}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {v.qty_delta > 0 ? `+${v.qty_delta}` : v.qty_delta} {v.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        ₹{(v.financial_impact_cr * 100).toFixed(2)} Lakhs
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                          {v.justification_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">{v.sanctioning_authority}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          v.approval_status.includes('SANCTIONED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : (v.approval_status.includes('RECOMMENDED') ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                          {v.approval_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No contract variations recorded for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Maintenance & QC Check */}
      {activeTab === 'qc_check' && (
        <div className="space-y-6">
          {/* G.O. 84 5-Year Policy Audit Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Policy Compliance Pass
                  </span>
                  <span className="text-xs text-slate-500">Governing Order: G.O. Ms. No. 84</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  5-Year Surface Renewal Policy Verification
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                  Mandatory verification that no premature surface renewal has been sanctioned on this road stretch within 5 years of the previous work completion.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div><span className="font-semibold text-slate-700">Previous Sanction:</span> 12/04/2020</div>
                <div><span className="font-semibold text-slate-700">Elapsed Time:</span> 6 Years 7 Months</div>
                <div><span className="font-semibold text-emerald-700">Lock-in Period Status:</span> ELIGIBLE FOR RENEWAL</div>
              </div>
            </div>
          </div>

          {/* QC Lab Test Records */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  MORTH Quality Control Equipment & Material Testing Records
                </h3>
                <p className="text-xs text-slate-500">
                  Annexure-IV QC equipment deployment and laboratory compressive/density test certifications.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Item Code</th>
                    <th className="px-4 py-3 text-left">Test Type</th>
                    <th className="px-4 py-3 text-left">QC Equipment Code</th>
                    <th className="px-4 py-3 text-left">MORTH Clause</th>
                    <th className="px-4 py-3 text-left">Chainage Location</th>
                    <th className="px-4 py-3 text-left">Certificate No.</th>
                    <th className="px-4 py-3 text-left">Test Value</th>
                    <th className="px-4 py-3 text-left">Benchmark</th>
                    <th className="px-4 py-3 text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {qcLinks.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{q.item_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{q.test_type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
                          {q.equipment_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{q.morth_spec_clause}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{q.sample_chainage}</td>
                      <td className="px-4 py-3 font-mono text-xs text-purple-700">{q.lab_test_certificate_no}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{q.test_result_value}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{q.required_benchmark}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          q.compliance_status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {q.compliance_status}
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

      {/* Variation Creation Modal */}
      {isVariationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Propose Contract Variation / Revised Estimate
              </h3>
              <button
                onClick={() => setIsVariationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVariation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Item Code</label>
                  <input
                    type="text"
                    value={newVarItemCode}
                    onChange={(e) => setNewVarItemCode(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Unit</label>
                  <input
                    type="text"
                    value={newVarUnit}
                    onChange={(e) => setNewVarUnit(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Item Description</label>
                <input
                  type="text"
                  value={newVarDesc}
                  onChange={(e) => setNewVarDesc(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sanctioned Quantity</label>
                  <input
                    type="number"
                    value={newVarOrigQty}
                    onChange={(e) => setNewVarOrigQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Proposed Revised Quantity</label>
                  <input
                    type="number"
                    value={newVarRevQty}
                    onChange={(e) => setNewVarRevQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Original Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={newVarOrigRate}
                    onChange={(e) => setNewVarOrigRate(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Proposed Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={newVarRevRate}
                    onChange={(e) => setNewVarRevRate(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-xs space-y-1 text-blue-900">
                <div className="font-bold">Delegation Threshold Assessment:</div>
                <div>
                  Quantity Delta: {newVarRevQty - newVarOrigQty} {newVarUnit} | Net Financial Impact: ₹{(((newVarRevQty * newVarRevRate) - (newVarOrigQty * newVarOrigRate)) / 100000).toFixed(2)} Lakhs
                </div>
                <div className="font-medium text-blue-700">
                  Routing: {Math.abs(((newVarRevQty * newVarRevRate) - (newVarOrigQty * newVarOrigRate)) / 10000000) <= 0.50
                    ? "Divisional Engineer (DE) [Powers up to ₹50 Lakhs]"
                    : "Superintending Engineer (SE) [Powers up to ₹7.00 Crores]"}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Justification Category</label>
                <select
                  value={newVarJustCode}
                  onChange={(e) => setNewVarJustCode(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="SITE_CONDITION">Site Condition / Geotechnical Settlement</option>
                  <option value="MORTH_SPEC_UPGRADE">MORTH Specification Requirement</option>
                  <option value="DRAINAGE_AUGMENTATION">Drainage Augmentation</option>
                  <option value="SAFETY_FURNITURE_ADDITION">Road Safety Signage / Furniture</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Engineering Justification Details</label>
                <textarea
                  value={newVarDetails}
                  onChange={(e) => setNewVarDetails(e.target.value)}
                  placeholder="Detail the technical justification, site observation notes, and measurement references..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsVariationModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingVar ? 'Submitting...' : 'Submit Variation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReconciliationPage;
