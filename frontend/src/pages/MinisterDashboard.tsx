import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MinisterOverview } from '../types';
import {
  Landmark,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building,
  FileText
} from 'lucide-react';

export const MinisterDashboard: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const [data, setData] = useState<MinisterOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Directive modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [directiveSubject, setDirectiveSubject] = useState('');
  const [directiveActionType, setDirectiveActionType] = useState('CABINET_NOTE');
  const [assignedAuthority, setAssignedAuthority] = useState('Principal Secretary to Government');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [submittingDirective, setSubmittingDirective] = useState(false);
  const [directiveSuccess, setDirectiveSuccess] = useState<string | null>(null);

  const isAuthorised = user?.role_code === 'MINISTER' || user?.role_code === 'ADMIN';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMinisterOverview();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Minister Command Centre overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorised) {
      loadData();
    }
  }, [user]);

  const handleIssueDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveSubject.trim()) return;

    setSubmittingDirective(true);
    setDirectiveSuccess(null);
    try {
      const res = await api.recordLeadershipDecision({
        required_decision: directiveSubject,
        assigned_authority: assignedAuthority,
        action_type: directiveActionType,
        supporting_evidence: evidenceNotes || 'Ministerial Briefing & Cabinet Directive',
        resolution_notes: `Initiated directly by ${user?.full_name || "Hon'ble Minister for Highways"}`
      });
      setDirectiveSuccess(`Ministerial Directive ${res.decision_reference} officially dispatched with formal audit seal.`);
      setTimeout(() => {
        setModalOpen(false);
        setDirectiveSubject('');
        setEvidenceNotes('');
        setDirectiveSuccess(null);
        loadData();
      }, 2000);
    } catch (err: any) {
      alert(`Directive dispatch error: ${err.message || 'Unauthorized action'}`);
    } finally {
      setSubmittingDirective(false);
    }
  };

  // RBAC Access Restriction Gate
  if (!isAuthorised) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xl overflow-hidden">
          <div className="bg-red-900 text-white p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-800/80 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-red-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Access Restricted — Ministerial Clearance Required</h2>
              <p className="text-red-200 text-xs mt-1">
                Tamil Nadu Highways Digital Operating System (TN-HDOS) • Statutory RBAC Boundary
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-950 space-y-2">
              <p className="font-semibold">
                You are currently signed in as: <span className="font-bold underline">{user?.full_name || user?.username}</span> ({user?.role_name || user?.role_code})
              </p>
              <p className="text-xs text-red-800 leading-relaxed">
                The <strong>Minister's Strategic Command Centre</strong> contains Cabinet-level infrastructure intelligence, inter-ministerial bilateral correspondence, and strategic policy interventions. Your role does not possess the statutory clearance required to view this workspace.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Authorised Executive Personas:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Hon'ble Minister for Public Works and Sports Development</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded">minister</code>) — Statewide strategic & Cabinet policy intelligence</li>
                <li><strong>System Administrator</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded">admin</code>) — System oversight</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => switchPersona('minister')}
                className="bg-[#006A4E] hover:bg-[#00553E] text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Landmark className="w-4 h-4" />
                Switch to Minister Persona (Demo)
              </button>
              <button
                onClick={() => switchPersona('admin')}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Shield className="w-4 h-4" />
                Switch to Admin Persona
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-[#006A4E] animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading Minister's Command Centre intelligence...</span>
      </div>
    );
  }

  const kpis = data?.strategic_kpis;
  const briefing = data?.ai_briefing;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* Leadership Header */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#00553E] to-[#004B87] rounded-2xl p-6 text-white shadow-lg border border-[#B2DFCD]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                Cabinet Level
              </span>
              <span className="bg-white/20 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
                Government of Tamil Nadu
              </span>
              <span className="text-xs text-white/80">• {data?.reporting_period}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Landmark className="w-6 h-6 text-amber-300" />
              MINISTER'S STRATEGIC COMMAND CENTRE
            </h1>
            <p className="text-xs text-white/90 mt-1 max-w-2xl leading-relaxed">
              Consolidated statewide intelligence on major infrastructure delivery, capital investment, critical delays affecting public connectivity, and inter-ministerial cabinet interventions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
              <div className="text-[10px] uppercase font-bold text-white/70">Authorised User</div>
              <div className="text-xs font-bold text-white">{user?.full_name}</div>
              <div className="text-[10px] text-amber-300 font-semibold">{data?.data_freshness}</div>
            </div>
            <button
              onClick={() => {
                setDirectiveSubject('');
                setModalOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-slate-950" />
              Issue Ministerial Directive
            </button>
          </div>
        </div>
      </div>

      {/* 8 Strategic Priority KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-[#006A4E]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">State Capital Outlay</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{kpis.total_capital_outlay_cr.toFixed(2)} Cr</div>
            <span className="text-[10px] text-[#006A4E] font-semibold mt-1 block">Sanctioned Highway Outlay</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-[#004B87]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Major Corridors Active</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.major_corridors_count} Projects</div>
            <span className="text-[10px] text-[#004B87] font-semibold mt-1 block">State Highways & Bypasses</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Statewide Completion</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.statewide_completion_rate}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${kpis.statewide_completion_rate}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-red-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Critical Public Delays</span>
            <div className="text-2xl font-black text-red-600 mt-1">{kpis.critical_public_delays_count} Corridors</div>
            <span className="text-[10px] text-red-700 font-semibold mt-1 block">&gt; 60 days schedule variance</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cabinet Blockers</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{kpis.inter_ministerial_blockers_count} Inter-Agency</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Forest, Energy & Revenue</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-[#D1197E]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Land Acquisition Cleared</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.land_acquisition_cleared_pct}%</div>
            <span className="text-[10px] text-[#D1197E] font-semibold mt-1 block">Sec 15(2) Awards Passed</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-cyan-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Zero-Pothole Drive</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.zero_pothole_compliance_pct}%</div>
            <span className="text-[10px] text-cyan-700 font-semibold mt-1 block">Monsoon Readiness Completed</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Public Grievances</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.public_grievances_resolved} Resolved</div>
            <span className="text-[10px] text-purple-700 font-semibold mt-1 block">CM Special Cell & CPGRAMS</span>
          </div>
        </div>
      )}

      {/* Ministerial AI Strategic Briefing */}
      {briefing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{briefing.headline}</h3>
                <p className="text-xs text-slate-500">Automated evidence synthesis grounded in verified departmental data</p>
              </div>
            </div>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Cabinet Cleared
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {briefing.summary}
          </p>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urgent Inter-Ministerial Interventions Requiring Ministerial Action:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {briefing.urgent_interventions.map((item, idx) => (
                <div key={idx} className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-amber-950">{item.title}</span>
                    <span className="bg-amber-200/80 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      {item.days_pending} Days Pending
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Department: <span className="font-semibold text-slate-900">{item.dept}</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Impact: <span className="text-red-700 font-medium">{item.impact}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#006A4E]">Action: {item.action}</span>
                    <button
                      onClick={() => {
                        setDirectiveSubject(`Inter-Ministerial Bilateral: ${item.title}`);
                        setDirectiveActionType('INTER_MINISTERIAL_REVIEW');
                        setAssignedAuthority('Cabinet Secretariat / Principal Secretary');
                        setEvidenceNotes(item.impact);
                        setModalOpen(true);
                      }}
                      className="bg-[#006A4E] hover:bg-[#00553E] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      Convene Review <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div>
              <span className="font-bold">Public Sentiment & LAQ Readiness:</span>{' '}
              <span>{briefing.district_sentiment}</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
        </div>
      )}

      {/* District-Wise Infrastructure Delivery Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#006A4E]" />
              District-Wise Public Impact & Project Delivery Matrix
            </h3>
            <p className="text-xs text-slate-500">Infrastructure investments, corridor completions, and public status by key administrative districts</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">5 High-Priority Zones Analyzed</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">District</th>
                <th className="p-3">Active Corridors</th>
                <th className="p-3">Capital Outlay (₹ Cr)</th>
                <th className="p-3">Physical Completion</th>
                <th className="p-3">Public Readiness Status</th>
                <th className="p-3 text-right">Ministerial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.district_impact.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{d.district}</td>
                  <td className="p-3">{d.active_projects} Projects</td>
                  <td className="p-3 font-semibold text-slate-900">₹{d.outlay_cr.toFixed(2)} Cr</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            d.completion_pct >= 70 ? 'bg-emerald-600' : d.completion_pct >= 55 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${d.completion_pct}%` }}
                        />
                      </div>
                      <span className="font-bold">{d.completion_pct}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        d.status === 'ON_TRACK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'REQUIRES_INTERVENTION'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setDirectiveSubject(`District Review Meeting: ${d.district} Highway Projects`);
                        setDirectiveActionType('DISTRICT_COLLECTOR_MEETING');
                        setAssignedAuthority(`District Collector (${d.district}) & Superintending Engineer`);
                        setEvidenceNotes(`Addressing ${d.status} status across ₹${d.outlay_cr} Cr corridor works.`);
                        setModalOpen(true);
                      }}
                      className="text-[#006A4E] hover:underline font-bold text-[11px]"
                    >
                      Review District →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Cabinet Directives */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Pending Cabinet & Inter-Ministerial Decisions
            </h3>
            <p className="text-xs text-slate-500">Directives issued by Hon'ble Minister requiring inter-departmental action</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.cabinet_decisions_pending.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {item.ref}
                </span>
                <h5 className="font-bold text-xs text-slate-900">{item.subject}</h5>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Due by: <span className="font-semibold text-slate-700">{item.due_date}</span>
                </div>
              </div>
              <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded">
                {item.urgency} Priority
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ministerial Directive Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#006A4E] to-[#004B87] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-amber-300" />
                  Dispatch Ministerial Directive
                </h3>
                <p className="text-white/80 text-[11px] mt-0.5">
                  Formally authorized executive power under Government Business Rules
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueDirective} className="p-6 space-y-4">
              {directiveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{directiveSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Directive Subject / Decision Required:
                </label>
                <input
                  type="text"
                  required
                  value={directiveSubject}
                  onChange={(e) => setDirectiveSubject(e.target.value)}
                  placeholder="e.g. Convene bilateral review with Minister for Forests on Tambaram bypass clearance"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ministerial Action Power:
                  </label>
                  <select
                    value={directiveActionType}
                    onChange={(e) => setDirectiveActionType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  >
                    <option value="CABINET_NOTE">Cabinet Memorandum / Inter-Dept Note</option>
                    <option value="INTER_MINISTERIAL_REVIEW">Bilateral Inter-Ministerial Review</option>
                    <option value="POLICY_DIRECTIVE">Ministerial Policy Directive</option>
                    <option value="PUBLIC_COMMISSIONING_DIRECTIVE">Public Commissioning Mandate</option>
                    <option value="DISTRICT_COLLECTOR_MEETING">District Collector Special Review</option>
                    <option value="SPECIAL_INSPECTION">Depute Chief Engineer Spot Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Authority / Department:
                  </label>
                  <input
                    type="text"
                    required
                    value={assignedAuthority}
                    onChange={(e) => setAssignedAuthority(e.target.value)}
                    placeholder="e.g. Principal Secretary to Government"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supporting Evidence / Public Impact Details:
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Reference project documents, commuter delay metrics, or LA notification delays..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  Statutory Ministerial Authority Seal:
                </span>
                <p>
                  This directive will be logged into the permanent TN-HDOS executive audit registry under your Ministerial account. AI assists in evidence preparation; only authorized leadership can execute directives.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDirective}
                  className="bg-[#006A4E] hover:bg-[#00553E] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
                >
                  {submittingDirective ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Order...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Officially Dispatch Directive
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

