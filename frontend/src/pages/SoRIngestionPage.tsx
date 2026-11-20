import React, { useState, useEffect } from 'react';
import {
  FileUp, BookOpen, AlertCircle, CheckCircle, RefreshCw,
  Eye, Check, ShieldCheck, FileCheck, Layers, ArrowRight,
  AlertTriangle, Save, Lock
} from 'lucide-react';
import { ingestionAPI } from '../services/api';
import { SoRIngestionJobItem, SoRStagedItemData, SoRIngestionDiscrepancyItem } from '../types';

export const SoRIngestionPage: React.FC = () => {
  const [jobs, setJobs] = useState<SoRIngestionJobItem[]>([]);
  const [activeJob, setActiveJob] = useState<SoRIngestionJobItem | null>(null);
  const [stagedItems, setStagedItems] = useState<SoRStagedItemData[]>([]);
  const [discrepancies, setDiscrepancies] = useState<SoRIngestionDiscrepancyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit / verify state
  const [editingItem, setEditingItem] = useState<SoRStagedItemData | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>('');
  const [savingItem, setSavingItem] = useState<boolean>(false);

  // Publish modal state
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);
  const [stewardName, setStewardName] = useState<string>('Er. M. Senthil Kumar');
  const [publishNotes, setPublishNotes] = useState<string>('Published official Tamil Nadu Schedule of Rates 2026-2027 Volume I w.e.f. 13/11/2026');
  const [publishing, setPublishing] = useState<boolean>(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jList = await ingestionAPI.getJobs();
      setJobs(jList);
      if (jList.length > 0) {
        selectJob(jList[0]);
      }
    } catch (err) {
      console.error("Failed loading ingestion jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectJob = async (job: SoRIngestionJobItem) => {
    setActiveJob(job);
    try {
      const [items, discs] = await Promise.all([
        ingestionAPI.getStagedItems(job.id),
        ingestionAPI.getDiscrepancies(job.id)
      ]);
      setStagedItems(items);
      setDiscrepancies(discs);
    } catch (err) {
      console.error("Failed loading staged items:", err);
    }
  };

  const handleStartEdit = (item: SoRStagedItemData) => {
    setEditingItem(item);
    setEditRate(item.basic_rate);
    setEditUnit(item.unit_raw);
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    setSavingItem(true);
    try {
      const updated = await ingestionAPI.updateStagedItem(editingItem.id, {
        basic_rate: editRate,
        unit_raw: editUnit,
        is_verified: true,
        verified_by: "SoR Data Steward (CE Cell)"
      });
      setStagedItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditingItem(null);
    } catch (err) {
      console.error("Failed saving staged item:", err);
      alert("Failed to update staged item.");
    } finally {
      setSavingItem(false);
    }
  };

  const handlePublish = async () => {
    if (!activeJob) return;
    setPublishing(true);
    try {
      const res = await ingestionAPI.publishJob(activeJob.id, {
        published_by: stewardName,
        notes: publishNotes
      });
      setActiveJob(res);
      setJobs(prev => prev.map(j => j.id === res.id ? res : j));
      setPublishModalOpen(false);
      alert("Schedule of Rates version successfully published to live master catalogue!");
    } catch (err: any) {
      console.error("Failed to publish job:", err);
      alert(err.message || "Cannot publish: Unresolved G.O. or OCR discrepancies pending steward review.");
    } finally {
      setPublishing(false);
    }
  };

  const openDiscrepanciesCount = discrepancies.filter(d => d.resolution_status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded w-fit mb-1 border border-teal-200">
            <BookOpen className="w-3.5 h-3.5" />
            Schedule Ingestion & OCR Scrutiny (Screen 6)
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            SoR Document Ingestion & Parser Workbench
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Automated PDF extraction, discrepancy reconciliation, and statutory publication for SoR 2026–2027 Volume I
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadJobs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeJob && (
            <button
              onClick={() => setPublishModalOpen(true)}
              disabled={activeJob.status === 'PUBLISHED'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-sm ${
                activeJob.status === 'PUBLISHED'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {activeJob.status === 'PUBLISHED' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Catalogue Published (w.e.f. 13/11/2026)
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  Publish Master SoR Version
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      {activeJob && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-gray-500">Document Schedule</span>
            <div className="text-sm font-bold text-gray-900 truncate">{activeJob.file_name}</div>
            <div className="text-[11px] text-gray-500">Printed Pages: {activeJob.page_range}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-gray-500">Parser Extraction Score</span>
            <div className="text-xl font-mono font-bold text-emerald-600">{activeJob.confidence_score_pct}%</div>
            <div className="text-[11px] text-emerald-700 font-medium">High Confidence OCR</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-gray-500">Extracted Items</span>
            <div className="text-xl font-mono font-bold text-indigo-600">{stagedItems.length} items</div>
            <div className="text-[11px] text-gray-500">Annexures I to X</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-xs font-medium text-gray-500">G.O. Discrepancies</span>
            <div className={`text-xl font-mono font-bold ${openDiscrepanciesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {openDiscrepanciesCount} Open
            </div>
            <div className="text-[11px] text-gray-500">Requires Steward Sign-Off</div>
          </div>
        </div>
      )}

      {/* Discrepancies Alert Panel */}
      {openDiscrepanciesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Discrepancies Requiring Manual Steward Resolution Prior to Publishing:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {discrepancies.filter(d => d.resolution_status === 'OPEN').map(disc => (
              <div key={disc.id} className="bg-white p-3 rounded-lg border border-amber-200 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-800">{disc.staged_item_id}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    {disc.discrepancy_type}
                  </span>
                </div>
                <div className="text-gray-700">{disc.flagged_issue}</div>
                <div className="text-[11px] text-gray-500">Field: <strong>{disc.field_name}</strong> | Extracted: <code>{disc.extracted_value}</code></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Ingestion Workbench: PDF Preview Snippet vs Extracted Row Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Source PDF Reference */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Source Schedule Reference
              </h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded">
                Printed pp. 311–352
              </span>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs space-y-2 border border-slate-700 leading-relaxed">
              <div className="text-emerald-400 font-bold">// SCHEDULE OF RATES 2026-2027 VOLUME I</div>
              <div>Effective: 13th November 2026</div>
              <div>Highways Annexures: Pages 311 to 352</div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Annexure I: Labour Rates (Printed p. 313)<br />
                Annexure II: Material Rates (Printed pp. 314-315)<br />
                Annexure III: Works Rates (Printed pp. 316-327)<br />
                Annexure IV: Quality Control (Printed p. 328)<br />
                Annexure V: Road Furniture (Printed pp. 329-343)
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
              <div className="font-bold">General Note 1 & 2 Verification:</div>
              <p className="text-[11px] text-blue-800 leading-normal">
                All basic rates extracted are canonical base rates exclusive of GST.
                Applicable GST at 18% shall be added on estimate abstract.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-3 border-t">
            Source file: <code>/documents/sor/TN_Schedule_of_Rates_2026_2027_Volume_I.pdf</code>
          </div>
        </div>

        {/* Right: Extracted Staged Items Ledger */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">
              Extracted Staged Items & Scrutiny
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              {stagedItems.filter(i => i.is_verified).length} of {stagedItems.length} items verified
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Extracted Rate</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Page</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {stagedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/20">
                    <td className="p-3 font-mono font-bold text-gray-900">{item.unique_code}</td>
                    <td className="p-3 text-gray-600">{item.category}</td>
                    <td className="p-3 text-gray-800 max-w-xs truncate" title={item.item_description}>
                      {item.item_description}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{item.basic_rate.toFixed(2)}
                    </td>
                    <td className="p-3 text-gray-600 font-mono">{item.unit_raw}</td>
                    <td className="p-3 text-gray-500 font-mono">p. {item.printed_page}</td>
                    <td className="p-3 text-center">
                      {item.is_verified ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : item.has_discrepancy ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Flagged
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Staged
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-indigo-700 font-semibold rounded text-[11px]"
                      >
                        Scrutinize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scrutiny & Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                Scrutinize Item {editingItem.unique_code}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Description</label>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-800">
                  {editingItem.item_description}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Basic Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editRate}
                  onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 font-mono text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 font-mono text-gray-800"
                />
              </div>

              {editingItem.discrepancy_notes && (
                <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Discrepancy Note:</strong> {editingItem.discrepancy_notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={savingItem}
                onClick={handleSaveItem}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Confirm & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {publishModalOpen && activeJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                Statutory Publication of SoR Catalogue
              </h3>
              <button onClick={() => setPublishModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-xs space-y-1 text-indigo-900">
              <div><strong>Catalogue:</strong> Tamil Nadu Schedule of Rates 2026–2027, Volume I</div>
              <div><strong>Effective Date:</strong> 13th November 2026 (Statutory)</div>
              <div><strong>Total Extracted Items:</strong> {stagedItems.length}</div>
            </div>

            {openDiscrepanciesCount > 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                <strong>Publication Blocked:</strong> There are {openDiscrepanciesCount} open G.O./OCR discrepancies.
                All discrepancies must be resolved by the Data Steward before publishing to live catalogue.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Authorizing Data Steward</label>
                  <input
                    type="text"
                    value={stewardName}
                    onChange={(e) => setStewardName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Publishing Notes</label>
                  <textarea
                    rows={3}
                    value={publishNotes}
                    onChange={(e) => setPublishNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-gray-800"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setPublishModalOpen(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={publishing || openDiscrepanciesCount > 0}
                onClick={handlePublish}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                Publish To Live Master Catalogue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
