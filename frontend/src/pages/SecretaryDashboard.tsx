import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SecretaryOverview, ExecutiveKPIs } from '../types';
import {
  Building2,
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
  FileCheck,
  Scale,
  Award,
  CircleDollarSign,
  Briefcase,
  Users,
  ChevronRight,
  TrendingDown,
  AlertOctagon
} from 'lucide-react';

export const SecretaryDashboard: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const [data, setData] = useState<SecretaryOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Drill-down KPI modal
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);

  // Directive modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [directiveSubject, setDirectiveSubject] = useState('');
  const [directiveActionType, setDirectiveActionType] = useState('DISCIPLINARY_INQUIRY');
  const [assignedAuthority, setAssignedAuthority] = useState('Chief Engineer (Highways - Projects)');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [submittingDirective, setSubmittingDirective] = useState(false);
  const [directiveSuccess, setDirectiveSuccess] = useState<string | null>(null);

  const isAuthorised =
    user?.role_code === 'PRIN_SEC' ||
    user?.role_code === 'ADMIN' ||
    user?.role_code === 'CHIEF_ENG';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSecretaryOverview();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Secretary Command Centre overview.');
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
        supporting_evidence: evidenceNotes || 'Departmental Review & Disciplinary Audit',
        resolution_notes: `Initiated directly by ${user?.full_name || 'Principal Secretary to Government'}`
      });
      setDirectiveSuccess(`Secretarial Directive ${res.decision_reference} registered with statutory compliance audit.`);
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
          <div className="bg-slate-900 text-white p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Access Restricted — Secretarial Clearance Required</h2>
              <p className="text-slate-300 text-xs mt-1">
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
                The <strong>Principal Secretary Command Centre</strong> contains confidential departmental governance, disciplinary investigations under TN Civil Services (CCA) Rules, vigilance audit paras, and officer accountability records. Your role does not possess the statutory clearance required to view this workspace.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Authorised Executive Personas:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Principal Secretary to Government</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded">secretary</code>) — Departmental governance & operational oversight</li>
                <li><strong>Chief Engineer (Highways - Projects)</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded">chief_eng</code>) — Statewide engineering authority</li>
                <li><strong>System Administrator</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded">admin</code>) — System oversight</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => switchPersona('secretary')}
                className="bg-[#004B87] hover:bg-[#003865] text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Building2 className="w-4 h-4" />
                Switch to Principal Secretary Persona (Demo)
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
        <RefreshCw className="w-8 h-8 text-[#004B87] animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading Secretary's Command Centre governance intelligence...</span>
      </div>
    );
  }

  const kpis = data?.governance_kpis;
  const briefing = data?.ai_briefing;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* Governance Header */}
      <div className="bg-gradient-to-r from-[#004B87] via-[#003865] to-[#006A4E] rounded-2xl p-6 text-white shadow-lg border border-[#B3CFE5]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                Departmental Secretarial Control
              </span>
              <span className="bg-white/20 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
                Highways &amp; Minor Ports Department
              </span>
              <span className="text-xs text-white/80">• {data?.reporting_period}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-cyan-300" />
              PRINCIPAL SECRETARY'S COMMAND CENTRE
            </h1>
            <p className="text-xs text-white/90 mt-1 max-w-2xl leading-relaxed">
              Consolidated governance cockpit for operational execution, zone/circle benchmarking, officer accountability, IFMS budget release, HRS quality compliance, and statutory AG audit para disposal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
              <div className="text-[10px] uppercase font-bold text-white/70">Principal Secretary</div>
              <div className="text-xs font-bold text-white">{user?.full_name}</div>
              <div className="text-[10px] text-cyan-300 font-semibold">{data?.data_freshness}</div>
            </div>
            <button
              onClick={() => {
                setDirectiveSubject('');
                setModalOpen(true);
              }}
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-slate-950" />
              Issue Secretarial Directive
            </button>
          </div>
        </div>
      </div>

      {/* Secretary AI Operational & Disciplinary Briefing */}
      {briefing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-[#004B87]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{briefing.headline}</h3>
                <p className="text-xs text-slate-500">Departmental operational review and disciplinary oversight alerts</p>
              </div>
            </div>
            <span className="bg-[#E6F0F7] text-[#004B87] border border-[#B3CFE5] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Secretarial Clearance
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {briefing.summary}
          </p>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Highways Officer Accountability &amp; Statutory Non-Compliance Alerts:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {briefing.accountability_alerts.map((alert, idx) => (
                <div key={idx} className="bg-red-50/60 border border-red-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{alert.officer}</span>
                    <span className="bg-red-200/80 text-red-900 font-bold text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      {alert.pending_days} Days Pending
                    </span>
                  </div>
                  <div className="text-[11px] text-red-800">
                    Non-Compliance: <span className="font-medium text-slate-800">{alert.issue}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#004B87]">Recommended: {alert.action}</span>
                    <button
                      onClick={() => {
                        setDirectiveSubject(`Explanation Call Notice: ${alert.officer} for ${alert.issue}`);
                        setDirectiveActionType('DISCIPLINARY_INQUIRY');
                        setAssignedAuthority('Vigilance Officer / CE (General)');
                        setEvidenceNotes(`Pending for ${alert.pending_days} days in violation of Citizens Charter.`);
                        setModalOpen(true);
                      }}
                      className="bg-[#004B87] hover:bg-[#003865] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      Issue 17(a) Notice <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div>
              <span className="font-bold">Financial &amp; Pre-Audit Control Status:</span>{' '}
              <span>{briefing.financial_controls}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Audited
            </span>
          </div>
        </div>
      )}

      {/* 16 Comprehensive Department Performance KPIs */}
      {kpis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-[#004B87]" />
                16 Mandatory Department Performance KPIs
              </h3>
              <p className="text-xs text-slate-500">
                Click any KPI card to inspect underlying audit records. Actual expenditure, potential exposure, and prevented expenditure are strictly isolated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Card 1 */}
            <div
              onClick={() => setActiveDrillDown('Active Projects')}
              className="bg-slate-50 hover:bg-[#E6F4EA] border border-slate-200 hover:border-[#006A4E] rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Active Works</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpis.total_active_projects}</div>
              <div className="text-[9px] text-[#006A4E] font-semibold mt-0.5">Statewide</div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => setActiveDrillDown('Approved Project Value')}
              className="bg-slate-50 hover:bg-[#FFF9E6] border border-slate-200 hover:border-[#FFCC00] rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Approved Outlay</div>
              <div className="text-xl font-black text-slate-900 mt-1">₹{kpis.total_approved_project_value_cr.toFixed(1)} Cr</div>
              <div className="text-[9px] text-amber-700 font-semibold mt-0.5">Sanctioned</div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => setActiveDrillDown('Total Expenditure')}
              className="bg-slate-50 hover:bg-[#E6F0F7] border border-slate-200 hover:border-[#004B87] rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Expenditure</div>
              <div className="text-xl font-black text-slate-900 mt-1">₹{kpis.total_expenditure_cr.toFixed(1)} Cr</div>
              <div className="text-[9px] text-[#004B87] font-semibold mt-0.5">IFMS Booked</div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => setActiveDrillDown('Physical Progress')}
              className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-600 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Progress Avg</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{kpis.total_physical_progress_pct}%</div>
              <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">Field Verified</div>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => setActiveDrillDown('Projects Delayed')}
              className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Delayed Works</div>
              <div className="text-xl font-black text-red-600 mt-1">{kpis.projects_delayed}</div>
              <div className="text-[9px] text-red-700 font-semibold mt-0.5">Behind Schedule</div>
            </div>

            {/* Card 6 */}
            <div
              onClick={() => setActiveDrillDown('Projects at High Risk')}
              className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-600 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">High Risk</div>
              <div className="text-xl font-black text-red-700 mt-1">{kpis.projects_high_risk}</div>
              <div className="text-[9px] text-red-800 font-semibold mt-0.5">Critical Priority</div>
            </div>

            {/* Card 7 */}
            <div
              onClick={() => setActiveDrillDown('Pending Approvals')}
              className="bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Approvals Due</div>
              <div className="text-xl font-black text-amber-600 mt-1">{kpis.pending_approvals}</div>
              <div className="text-[9px] text-amber-700 font-semibold mt-0.5">NOCs / Clearances</div>
            </div>

            {/* Card 8 */}
            <div
              onClick={() => setActiveDrillDown('Pending Land Acquisition')}
              className="bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">LA Pending</div>
              <div className="text-xl font-black text-purple-700 mt-1">{kpis.pending_land_acquisition_ha} Ha</div>
              <div className="text-[9px] text-purple-800 font-semibold mt-0.5">Sec 15(2) Awards</div>
            </div>

            {/* Card 9 */}
            <div
              onClick={() => setActiveDrillDown('Pending Utility Shifting')}
              className="bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Utility Shifts</div>
              <div className="text-xl font-black text-cyan-700 mt-1">{kpis.pending_utility_shifting_count}</div>
              <div className="text-[9px] text-cyan-800 font-semibold mt-0.5">TANGEDCO / TWAD</div>
            </div>

            {/* Card 10 */}
            <div
              onClick={() => setActiveDrillDown('Open Quality Defects')}
              className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Quality NCRs</div>
              <div className="text-xl font-black text-red-600 mt-1">{kpis.open_quality_defects}</div>
              <div className="text-[9px] text-red-700 font-semibold mt-0.5">HRS Guindy Lab</div>
            </div>

            {/* Card 11 */}
            <div
              onClick={() => setActiveDrillDown('Contractor Obligations')}
              className="bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Contractor Slips</div>
              <div className="text-xl font-black text-orange-600 mt-1">{kpis.pending_contractor_obligations}</div>
              <div className="text-[9px] text-orange-700 font-semibold mt-0.5">BGs &amp; Schedules</div>
            </div>

            {/* Card 12 */}
            <div
              onClick={() => setActiveDrillDown('Open Legal Cases')}
              className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">Legal Writs</div>
              <div className="text-xl font-black text-indigo-700 mt-1">{kpis.open_legal_cases}</div>
              <div className="text-[9px] text-indigo-800 font-semibold mt-0.5">High Court Writs</div>
            </div>

            {/* Card 13 */}
            <div
              onClick={() => setActiveDrillDown('Unresolved Audit Observations')}
              className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-500 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">AG Audit Paras</div>
              <div className="text-xl font-black text-rose-700 mt-1">{kpis.unresolved_audit_observations}</div>
              <div className="text-[9px] text-rose-800 font-semibold mt-0.5">C&amp;AG Queries</div>
            </div>

            {/* Card 14 */}
            <div
              onClick={() => setActiveDrillDown('Potential Financial Exposure')}
              className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-600 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-red-700">Exposure (Cr)</div>
              <div className="text-xl font-black text-red-700 mt-1">₹{kpis.potential_financial_exposure_cr.toFixed(2)}</div>
              <div className="text-[9px] text-red-800 font-semibold mt-0.5">Under Review</div>
            </div>

            {/* Card 15 */}
            <div
              onClick={() => setActiveDrillDown('Verified Financial Recovery')}
              className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-600 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-emerald-800">Recovery (Cr)</div>
              <div className="text-xl font-black text-emerald-700 mt-1">₹{kpis.verified_financial_recovery_cr.toFixed(2)}</div>
              <div className="text-[9px] text-emerald-800 font-semibold mt-0.5">Verified Recovery</div>
            </div>

            {/* Card 16 */}
            <div
              onClick={() => setActiveDrillDown('Verified Prevented Expenditure')}
              className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-600 rounded-xl p-3 cursor-pointer transition-all text-center"
            >
              <div className="text-[10px] uppercase font-bold text-blue-800">Prevented (Cr)</div>
              <div className="text-xl font-black text-blue-700 mt-1">₹{kpis.verified_prevented_expenditure_cr.toFixed(2)}</div>
              <div className="text-[9px] text-blue-800 font-semibold mt-0.5">Pre-Audit Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Performance & Cohort Benchmarking */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#004B87]" />
              Zone Benchmarking &amp; Circle Administrative Variance
            </h3>
            <p className="text-xs text-slate-500">
              Comparable cohorts across administrative zones. Reporting period and data completeness percentages are formally disclosed.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">4 Zonal Commands Evaluated</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Zone &amp; HQ</th>
                <th className="p-3">Cohort Sample</th>
                <th className="p-3">Data Completeness</th>
                <th className="p-3">Completion %</th>
                <th className="p-3">Avg Delay (Days)</th>
                <th className="p-3">Budget Utilisation</th>
                <th className="p-3">Quality NCRs</th>
                <th className="p-3">Contractor Rating</th>
                <th className="p-3 text-right">Secretarial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.zone_performance.map((z, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{z.zone_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">HQ: {z.headquarters}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-semibold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      N = {z.cohort_sample_size} Projects
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-700">{z.data_completeness_pct}%</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900">{z.completed_projects_pct}%</span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${z.average_project_delay_days > 40 ? 'text-red-600' : 'text-slate-800'}`}>
                      +{z.average_project_delay_days} d
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{z.budget_utilisation_pct}%</td>
                  <td className="p-3 font-semibold text-red-600">{z.quality_defects_count}</td>
                  <td className="p-3 font-bold text-[#006A4E]">{z.contractor_performance_score}/100</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setDirectiveSubject(`Zone Performance Audit: ${z.zone_name} Administrative Review`);
                        setDirectiveActionType('ORDER_HRS_TECHNICAL_AUDIT');
                        setAssignedAuthority(`Zonal Chief Engineer (${z.zone_name}) & Director HRS`);
                        setEvidenceNotes(`Addressing ${z.average_project_delay_days} days average delay and ${z.quality_defects_count} NCRs.`);
                        setModalOpen(true);
                      }}
                      className="text-[#004B87] hover:underline font-bold text-[11px]"
                    >
                      Audit Zone →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secretarial Actions Pending */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#004B87]" />
              Secretarial Directives &amp; Operational Enforcement Register
            </h3>
            <p className="text-xs text-slate-500">Statutory orders issued to field circles, contractors, and internal vigilance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.secretarial_actions_pending.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {item.ref}
                </span>
                <h5 className="font-bold text-xs text-slate-900">{item.subject}</h5>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Compliance Due: <span className="font-semibold text-slate-700">{item.due_date}</span>
                </div>
              </div>
              <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded">
                {item.urgency}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Secretarial Directive Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-[#004B87] to-[#006A4E] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-300" />
                  Register Secretarial Directive
                </h3>
                <p className="text-white/80 text-[11px] mt-0.5">
                  Statutory executive power under Tamil Nadu Civil Services (CCA) Rules
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
                  Required Secretarial Decision / Directive:
                </label>
                <input
                  type="text"
                  required
                  value={directiveSubject}
                  onChange={(e) => setDirectiveSubject(e.target.value)}
                  placeholder="e.g. Issue Rule 17(a) explanation notice to SE Chengalpattu for delayed LA compensation award"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#004B87] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secretarial Statutory Power:
                  </label>
                  <select
                    value={directiveActionType}
                    onChange={(e) => setDirectiveActionType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#004B87] focus:outline-none"
                  >
                    <option value="DISCIPLINARY_INQUIRY">Order Rule 17(a)/17(b) Disciplinary Inquiry</option>
                    <option value="WITHHOLD_LC">Freeze Letter of Credit (LC) / Payment Stop</option>
                    <option value="ISSUE_LD_NOTICE">Issue Notice under Clause 60 / LD Recovery</option>
                    <option value="ORDER_HRS_TECHNICAL_AUDIT">Order Independent HRS Forensic Core Testing</option>
                    <option value="VIGILANCE_REFERENCE">Refer Finding to Directorate of Vigilance (DVAC)</option>
                    <option value="MANDATE_AG_ATR">Mandate 15-Day AG Audit Para ATR Disposal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Execution Authority:
                  </label>
                  <input
                    type="text"
                    required
                    value={assignedAuthority}
                    onChange={(e) => setAssignedAuthority(e.target.value)}
                    placeholder="e.g. Chief Engineer (Projects) / Director HRS"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#004B87] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Evidence Reference / Audit Findings:
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Cite specific HRS lab certificates, MB entry numbers, AG audit paras, or days delayed..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#004B87] focus:outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#004B87]" />
                  Secretarial Governance Compliance Note:
                </span>
                <p>
                  Every directive is bound by statutory Government Orders and registered into the immutable TN-HDOS audit log. Disciplinary and LC withholding actions require formally empowered roles.
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
                  className="bg-[#004B87] hover:bg-[#003865] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
                >
                  {submittingDirective ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Order...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Officially Register Directive
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drill Down Modal */}
      {activeDrillDown && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Drill-Down: {activeDrillDown}</h4>
              <button onClick={() => setActiveDrillDown(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Displaying underlying departmental records for <strong>{activeDrillDown}</strong>. In accordance with government accounting standards, all financial numbers are isolated and reconciled with the Treasury/IFMS ledger.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <div>Sample Data Validation: <span className="font-semibold text-emerald-700">VERIFIED</span></div>
              <div>Audit Trail Status: <span className="font-semibold text-slate-900">Active (Record Logged)</span></div>
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

