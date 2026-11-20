import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, ArrowUpRight,
  FileText, Clock, UserCheck, Layers, Bot, ChevronRight, X, Search,
  RefreshCw, Scale, ExternalLink
} from 'lucide-react';
import { approvalsAPI, sorAPI } from '../services/api';
import { SoRApprovalTaskItem, SoRDelegationRuleItem, AIInvestigateFindingResponse, SoRAuditEvent } from '../types';

export const ApprovalsAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'delegation' | 'audit'>('queue');
  const [tasks, setTasks] = useState<SoRApprovalTaskItem[]>([]);
  const [delegationRules, setDelegationRules] = useState<SoRDelegationRuleItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<SoRAuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Decision Modal State
  const [selectedTask, setSelectedTask] = useState<SoRApprovalTaskItem | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Er. K. Sundaram');
  const [officerRole, setOfficerRole] = useState<string>('Superintending Engineer');
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  // AI Investigation Assist Drawer State (Phase 3 Bounded AI FR-09)
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<AIInvestigateFindingResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, dData, aData] = await Promise.all([
        approvalsAPI.getTasks(),
        approvalsAPI.getDelegationMatrix(),
        sorAPI.getAuditEvents(50)
      ]);
      setTasks(tData);
      setDelegationRules(dData);
      setAuditEvents(aData);
    } catch (err) {
      console.error("Failed loading approvals & audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDecisionModal = (task: SoRApprovalTaskItem) => {
    setSelectedTask(task);
    setDecisionNotes('');
    if (task.delegation_tier === 'DE') {
      setOfficerName('Er. P. Anandhan');
      setOfficerRole('Divisional Engineer (DE)');
    } else if (task.delegation_tier === 'SE') {
      setOfficerName('Er. M. Rajendran');
      setOfficerRole('Superintending Engineer (SE)');
    } else {
      setOfficerName('Er. S. Palanivel');
      setOfficerRole('Chief Engineer (CE)');
    }
  };

  const handleSubmitDecision = async (decision: 'APPROVED' | 'RETURNED_FOR_CORRECTION' | 'ESCALATED') => {
    if (!selectedTask) return;
    if (!decisionNotes.trim()) {
      alert("Statutory remarks and decision justification are required.");
      return;
    }
    setSubmittingDecision(true);
    try {
      await approvalsAPI.recordDecision(selectedTask.id, {
        decision,
        decision_notes: decisionNotes,
        officer_name: officerName,
        officer_role: officerRole
      });
      await loadData();
      setSelectedTask(null);
    } catch (err) {
      console.error("Decision recording failed:", err);
      alert("Failed to submit approval decision.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleTriggerAIAssist = async (task: SoRApprovalTaskItem) => {
    setAiDrawerOpen(true);
    setAiLoading(true);
    try {
      const res = await approvalsAPI.aiInvestigate({
        finding_id: task.entity_id,
        context_type: task.entity_type,
        query: `Examine statutory compliance for ${task.title}. Total amount: ₹${task.amount_involved_cr} Cr.`
      });
      setAiResponse(res);
    } catch (err) {
      console.error("AI Investigation failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterTier !== 'ALL' && t.delegation_tier !== filterTier) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded w-fit mb-1 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Governance & Delegation Architecture (Screen 5)
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Approvals Queue & Statutory Audit Ledger
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Governed by G.O. (Ms) No. 11 (Technical Sanctions) and G.O. (Ms) No. 29 (Tender Excess Delegations)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Pending Approvals Queue
          <span className="ml-1.5 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {tasks.filter(t => t.status === 'PENDING').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'delegation'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          Statutory Delegation Matrix (G.O. 11 / 29)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Immutable WORM Audit Trail
        </button>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Filter By Authority Tier:</span>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-700 font-medium"
              >
                <option value="ALL">All Authorities</option>
                <option value="DE">Divisional Engineer (DE ≤ ₹50L)</option>
                <option value="SE">Superintending Engineer (SE ≤ ₹7.00 Cr)</option>
                <option value="CE">Chief Engineer (CE &gt; ₹7.00 Cr)</option>
              </select>

              <span className="font-semibold text-gray-700 ml-2">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-700 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Scrutiny</option>
                <option value="APPROVED">Statutorily Approved</option>
                <option value="RETURNED_FOR_CORRECTION">Returned For Correction</option>
              </select>
            </div>
            <div className="text-gray-500">
              Showing {filteredTasks.length} statutory workflow tasks
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No approval tasks found matching the selected filter criteria.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
                    task.status === 'PENDING'
                      ? 'border-amber-200 bg-amber-50/20'
                      : task.status === 'APPROVED'
                      ? 'border-emerald-200'
                      : 'border-red-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {task.task_code}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          task.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : task.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                          Tier: {task.delegation_tier} ({task.required_role})
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>Submitted By: <strong className="text-gray-700">{task.submitted_by}</strong></span>
                        <span>Amount Involved: <strong className="text-emerald-700 font-mono">₹{task.amount_involved_cr.toFixed(2)} Cr</strong></span>
                        <span>Statute: <strong className="text-gray-700">{task.delegation_statute}</strong></span>
                        {task.decided_by && (
                          <span className="text-indigo-700 font-medium">
                            Decided By: {task.decided_by}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => handleOpenDecisionModal(task)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Execute Decision
                        </button>
                      )}
                      <button
                        onClick={() => handleTriggerAIAssist(task)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        AI Investigation Assist
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Statutory Delegation Matrix */}
      {activeTab === 'delegation' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-800">
              Statutory Delegation of Powers Codification Table
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Strictly codified monetary thresholds and permissible excess caps under Tamil Nadu Government Orders.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Rule Code</th>
                  <th className="p-3">Statutory Order</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Competent Authority</th>
                  <th className="p-3 text-right">Monetary Ceiling</th>
                  <th className="p-3 text-right">Excess Cap</th>
                  <th className="p-3">Statutory Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {delegationRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-indigo-50/20">
                    <td className="p-3 font-mono font-bold text-gray-900">{rule.rule_code}</td>
                    <td className="p-3 text-indigo-700 font-medium">{rule.statute_reference}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {rule.delegation_category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-800">{rule.officer_cadre}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{rule.monetary_limit_cr.toFixed(2)} Cr
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-700">
                      {rule.percentage_excess_limit > 0 ? `+${rule.percentage_excess_limit}%` : '0%'}
                    </td>
                    <td className="p-3 text-gray-600 max-w-xs">{rule.mandatory_conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Append-Only WORM Audit Ledger (Section 4 Compliance)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Every calculation modification, approval action, and variance override is permanently sealed.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded font-bold">
              Append-Only (WORM Sealed)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/75 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Officer & Cadre</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Audit Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {auditEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500 whitespace-nowrap">
                        {evt.event_time.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{evt.user_name || (evt as any).actor_username}</div>
                        <div className="text-[10px] text-gray-500">{evt.user_role || (evt as any).actor_role}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {evt.action_type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-600">{evt.entity_type || (evt as any).target_entity_type}: {evt.entity_id || (evt as any).target_entity_id}</td>
                      <td className="p-3 text-gray-700 max-w-md">{evt.justification_text || (evt as any).summary}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                Statutory Decision on {selectedTask.task_code}
              </h3>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
              <div><strong>Task:</strong> {selectedTask.title}</div>
              <div><strong>Required Tier:</strong> {selectedTask.delegation_tier} ({selectedTask.required_role})</div>
              <div><strong>Amount Involved:</strong> ₹{selectedTask.amount_involved_cr.toFixed(2)} Cr</div>
              <div><strong>Statute:</strong> {selectedTask.delegation_statute}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deciding Officer Name</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Cadre / Designation</label>
                <input
                  type="text"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Statutory Scrutiny Notes & Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Record formal justification citing G.O. 11/29 clauses, field verification and estimate scrutiny..."
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                disabled={submittingDecision}
                onClick={() => handleSubmitDecision('RETURNED_FOR_CORRECTION')}
                className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold"
              >
                Return For Correction
              </button>
              <button
                disabled={submittingDecision}
                onClick={() => handleSubmitDecision('ESCALATED')}
                className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-semibold"
              >
                Escalate Tier
              </button>
              <button
                disabled={submittingDecision}
                onClick={() => handleSubmitDecision('APPROVED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Statutorily Sanction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Investigation Assist Slide-over Drawer (Phase 3 Bounded AI Assist FR-09) */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">AI Investigation Assist</h3>
                    <p className="text-[11px] text-gray-500">Tamil Nadu SoR 2026–2027 Volume I Grounded</p>
                  </div>
                </div>
                <button onClick={() => setAiDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Strict Notice Badge */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 flex items-center gap-2 text-xs font-bold text-purple-800">
                <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                AI-Assisted (Verify Before Approval)
              </div>

              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">
                    Querying codified clauses from SoR Volume I & G.O. 11/29...
                  </p>
                </div>
              ) : aiResponse ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Investigation Summary</span>
                    <p className="text-gray-800 mt-1 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-200">
                      {aiResponse.investigation_summary}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Probable Root Cause</span>
                    <p className="text-amber-800 mt-1 leading-relaxed bg-amber-50/50 p-2.5 rounded border border-amber-200">
                      {aiResponse.probable_root_cause}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Exact Document Citation</span>
                    <div className="mt-1 bg-indigo-50/70 p-2.5 rounded border border-indigo-200 text-indigo-900 space-y-1">
                      <div className="font-bold">{aiResponse.applicable_statute_citation}</div>
                      <div className="text-[11px] text-indigo-700 flex items-center gap-3">
                        <span>Printed Page: <strong>{aiResponse.printed_page}</strong></span>
                        <span>Source PDF Page: <strong>{aiResponse.source_pdf_page}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recommended Remedial Action</span>
                    <p className="text-emerald-800 mt-1 leading-relaxed bg-emerald-50/50 p-2.5 rounded border border-emerald-200 font-medium">
                      {aiResponse.recommended_remedial_action}
                    </p>
                  </div>

                  {/* Mandatory Statutory Disclaimer */}
                  <div className="bg-gray-100 p-3 rounded text-[10px] text-gray-500 leading-normal border border-gray-200">
                    <strong>Statutory Disclaimer:</strong> {aiResponse.statutory_disclaimer}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg"
              >
                Close Investigation Assist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
