import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Check,
  X,
  History,
  Lock
} from 'lucide-react';
import { sorAPI } from '../services/api';
import {
  SoRBenchmarkItem,
  SoRAnomalyFinding,
  SoRAuditEvent
} from '../types';

export const CostAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'exceptions' | 'audit'>('benchmarks');
  const [benchmarks, setBenchmarks] = useState<SoRBenchmarkItem[]>([]);
  const [findings, setFindings] = useState<SoRAnomalyFinding[]>([]);
  const [auditEvents, setAuditEvents] = useState<SoRAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Review disposition modal state
  const [selectedFinding, setSelectedFinding] = useState<SoRAnomalyFinding | null>(null);
  const [reviewDisposition, setReviewDisposition] = useState<string>('JUSTIFIED');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, fData, aData] = await Promise.all([
        sorAPI.getBenchmarks(),
        sorAPI.getFindings(),
        sorAPI.getAuditEvents(50)
      ]);
      setBenchmarks(bData);
      setFindings(fData);
      setAuditEvents(aData);
    } catch (err) {
      console.error('Failed to load cost audit data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (f: SoRAnomalyFinding) => {
    setSelectedFinding(f);
    setReviewDisposition(f.current_status);
    setReviewNotes(f.review_notes || '');
  };

  const handleSaveReview = async () => {
    if (!selectedFinding) return;
    setIsSubmittingReview(true);
    try {
      const updated = await sorAPI.reviewFinding(selectedFinding.id, {
        disposition: reviewDisposition,
        review_notes: reviewNotes,
        user_name: 'Er. S. Palanivel (Chief Engineer)'
      });
      setFindings(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      setSelectedFinding(null);
      // reload audit events to reflect append-only log
      const aData = await sorAPI.getAuditEvents(50);
      setAuditEvents(aData);
    } catch (err) {
      console.error('Failed to review finding', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Cost Audit & Variance Intelligence
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                10-Point Structured Review
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-50">Statewide Cost Comparison, Exceptions & Audit Trail</h1>
            <p className="text-sm text-slate-400 mt-1">
              Cross-division item benchmarking, neutral statutory exception queue, and immutable append-only governance trail.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex items-center gap-4 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px]">Open Exceptions</p>
              <p className="text-rose-400 font-bold text-base mt-0.5">
                {findings.filter(f => f.current_status === 'UNDER_REVIEW' || f.current_status === 'CLARIFICATION_REQUESTED').length}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px]">Audit Integrity</p>
              <p className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Append-Only
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'benchmarks'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rate & Cost Benchmarking
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {benchmarks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'exceptions'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Exception & Variance Queue
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
              {findings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            Immutable Audit Trail
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
              {auditEvents.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Rate & Cost Benchmarking */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Cross-Division Rate Benchmarks & Cost Dispersion</h3>
                <p className="text-xs text-slate-500">
                  Comparing canonical SoR 2026-27 basic rates with actual billed rates across 40+ monitored highway projects.
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                Statewide Baseline (FY 2026-27)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Item Code</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-3 font-semibold text-center">Unit</th>
                    <th className="py-3 px-3 font-semibold text-right">Canonical SoR Rate (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">State Min Billed (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">State Avg Billed (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">State Max Billed (₹)</th>
                    <th className="py-3 px-3 font-semibold text-right">Avg Delta (%)</th>
                    <th className="py-3 px-3 font-semibold text-center">Variance Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benchmarks.map(b => (
                    <tr key={b.item_code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                          {b.item_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800 max-w-xs">{b.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">{b.unit}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{b.canonical_sor_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-600">
                        ₹{b.state_min_billed_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-indigo-700">
                        ₹{b.state_avg_billed_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-rose-700">
                        ₹{b.state_max_billed_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-xs">
                        <span className={b.historical_variance_pct > 8 ? 'text-rose-700' : 'text-emerald-700'}>
                          +{b.historical_variance_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            b.trend === 'ELEVATED'
                              ? 'bg-amber-100 text-amber-800'
                              : b.trend === 'VOLATILE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {b.trend}
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

      {/* Tab 2: Exception & Variance Queue */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {findings.map(f => (
              <div
                key={f.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                      {f.finding_code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : f.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Project #{f.project_id}: {f.project_title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        f.current_status === 'JUSTIFIED' || f.current_status === 'ADMISSIBLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.current_status === 'REVERTED_TO_BASE'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {f.current_status}
                    </span>
                    <button
                      onClick={() => handleOpenReview(f)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review & Dispose
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{f.title}</h3>
                  <p className="text-xs text-rose-700 font-mono mt-0.5">
                    Rule Cited: {f.rule_violated}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.review_notes}</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between pt-3 border-t border-slate-100 text-xs gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-400">Estimated Variance:</span>
                      <span className="font-mono font-bold text-rose-700 ml-1.5">
                        ₹{f.estimated_excess_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {f.item_code && (
                      <div>
                        <span className="text-slate-400">Item:</span>
                        <span className="font-mono font-semibold text-slate-800 ml-1.5">{f.item_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Evidence links */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 font-medium">Evidence Citations:</span>
                    {f.evidence_links?.map(ev => (
                      <span
                        key={ev.id}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-mono flex items-center gap-1"
                        title={ev.excerpt_text}
                      >
                        <FileText className="w-3 h-3" />
                        {ev.reference_identifier} (p. {ev.page_number})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Statutory SoR & Pricing Audit Log</h3>
              <p className="text-xs text-slate-500">
                Immutable, append-only log capturing every rate modification, estimate creation, and anomaly review disposition.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-mono font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> WORM Integrity
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Authorized Officer</th>
                  <th className="py-3 px-3 font-semibold">Action</th>
                  <th className="py-3 px-3 font-semibold">Entity</th>
                  <th className="py-3 px-6 font-semibold">Justification & Regulatory Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditEvents.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(ev.event_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <span className="block font-semibold">{ev.user_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{ev.user_role}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold">
                        {ev.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-indigo-700">
                      {ev.entity_type} ({ev.entity_id})
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-700 leading-relaxed max-w-lg">
                      {ev.justification_text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Disposition Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Governance Review Disposition</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedFinding.finding_code}</p>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Finding Title:</label>
              <p className="text-xs text-slate-900 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedFinding.title}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Neutral Review Status:
              </label>
              <select
                value={reviewDisposition}
                onChange={e => setReviewDisposition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW (Investigation Active)</option>
                <option value="CLARIFICATION_REQUESTED">CLARIFICATION_REQUESTED (Letter to EE)</option>
                <option value="JUSTIFIED">JUSTIFIED (Site Condition Confirmed)</option>
                <option value="ADMISSIBLE">ADMISSIBLE (Special Approval Granted)</option>
                <option value="REVERTED_TO_BASE">REVERTED_TO_BASE (Excess Recovered)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Regulatory Justification & Review Findings:
              </label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Enter statutory justification, verified tender clause citations, or recovery order references..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={isSubmittingReview}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                {isSubmittingReview ? 'Recording Audit...' : 'Confirm Disposition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
