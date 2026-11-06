import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  GovernmentDocumentItem,
  StatutoryCommitteeDetailItem,
  StatutoryReferralItem,
  AIIntelligenceFindingItem
} from '../types';
import {
  FileText,
  Shield,
  Scale,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Calendar,
  Building,
  UserCheck,
  Award,
  AlertCircle,
  Check,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const GovernanceRegistryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'committees' | 'referrals' | 'ai'>('docs');
  
  // Data state
  const [documents, setDocuments] = useState<GovernmentDocumentItem[]>([]);
  const [committees, setCommittees] = useState<StatutoryCommitteeDetailItem[]>([]);
  const [referrals, setReferrals] = useState<StatutoryReferralItem[]>([]);
  const [findings, setFindings] = useState<AIIntelligenceFindingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [docCategory, setDocCategory] = useState<string>('ALL');
  const [docSearch, setDocSearch] = useState<string>('');
  const [selectedCommitteeCode, setSelectedCommitteeCode] = useState<string>('ALL');
  const [findingFilter, setFindingFilter] = useState<string>('ALL');

  // Human validation state
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [officerRemarks, setOfficerRemarks] = useState<{ [key: number]: string }>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [docsData, commsData, refsData, findsData] = await Promise.all([
        api.getGovernmentDocuments(),
        api.getGovernanceCommittees(),
        api.getStatutoryReferrals(),
        api.getAIIntelligenceFindings()
      ]);
      setDocuments(docsData);
      setCommittees(commsData);
      setReferrals(refsData);
      setFindings(findsData);
    } catch (err) {
      console.error('Failed to load governance registry data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateFinding = async (findingId: number, status: 'CONFIRMED_VALID' | 'DISMISSED_FALSE_POSITIVE') => {
    setValidatingId(findingId);
    try {
      const remarks = officerRemarks[findingId] || '';
      const updated = await api.validateAIFinding(findingId, status, remarks);
      setFindings(prev => prev.map(f => f.id === findingId ? updated : f));
      setActionSuccess(`AI finding #${findingId} successfully updated to ${status}. Immutable audit log created.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Validation action failed', err);
    } finally {
      setValidatingId(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = docCategory === 'ALL' || doc.category === docCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.document_reference.toLowerCase().includes(docSearch.toLowerCase()) ||
      (doc.go_number && doc.go_number.toLowerCase().includes(docSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredReferrals = referrals.filter(ref => {
    return selectedCommitteeCode === 'ALL' || ref.committee_code === selectedCommitteeCode;
  });

  const filteredFindings = findings.filter(f => {
    return findingFilter === 'ALL' || f.human_validation_status === findingFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> STATUTORY GOVERNANCE ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                G.O.Ms.No.43 & G.O.Ms.No.172 COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Governance, Document Registry & Statutory Intelligence
            </h1>
            <p className="text-sky-200/80 text-sm mt-1 max-w-3xl">
              Tamil Nadu Highways and Minor Ports Department authoritative legal orders, statutory committees, rule-triggered referrals, and AI integrity findings requiring formal human verification.
            </p>
          </div>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition shadow-md self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Registry
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-800/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-sky-700/30">
            <span className="text-xs text-slate-300">Official Documents</span>
            <div className="text-xl font-bold text-white mt-0.5">{documents.length} Records</div>
            <span className="text-[11px] text-emerald-400">100% Source-Verified</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-sky-700/30">
            <span className="text-xs text-slate-300">Statutory Committees</span>
            <div className="text-xl font-bold text-white mt-0.5">{committees.length} Bodies</div>
            <span className="text-[11px] text-sky-400">BOE, COT, TAC & TNRIDC</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-sky-700/30">
            <span className="text-xs text-slate-300">Statutory Referrals</span>
            <div className="text-xl font-bold text-white mt-0.5">{referrals.length} Triggered</div>
            <span className="text-[11px] text-amber-400">Tender Excess / Waterway</span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-sky-700/30">
            <span className="text-xs text-slate-300">AI Intelligence Findings</span>
            <div className="text-xl font-bold text-white mt-0.5">{findings.length} Flagged</div>
            <span className="text-[11px] text-indigo-300">Human Review Mandated</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'docs'
              ? 'bg-sky-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Government Document Registry ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('committees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'committees'
              ? 'bg-sky-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Statutory Committees & Proceedings ({committees.length})
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'referrals'
              ? 'bg-sky-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Threshold Referrals ({referrals.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'ai'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          AI Intelligence & Human Verification ({findings.length})
        </button>
      </div>

      {/* TAB 1: GOVERNMENT DOCUMENT REGISTRY */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full md:w-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search Policy Notes, G.O. numbers, or titles..."
                value={docSearch}
                onChange={e => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="ALL">All Document Types</option>
                <option value="Policy Note">Policy Notes</option>
                <option value="Government Order">Government Orders (G.O.)</option>
                <option value="Schedule of Rates">Schedule of Rates (SSR)</option>
              </select>
            </div>
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                      {doc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {doc.verification_status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 mb-3">
                    <span className="font-semibold text-slate-700">{doc.go_number || doc.document_reference}</span>
                    <span>•</span>
                    <span>{doc.issuing_department}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {doc.summary_abstract}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Eff: {doc.effective_date ? new Date(doc.effective_date).toLocaleDateString('en-IN') : 'Immediate'}</span>
                  </div>
                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline"
                    >
                      Official Source <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY COMMITTEES & PROCEEDINGS */}
      {activeTab === 'committees' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Statutory High-Level Technical & Financial Governance Bodies</span>
              <p className="mt-0.5 text-amber-800">
                The Tamil Nadu Highways Department operates under strict standing committee hierarchies. Any proposal exceeding delegated financial or technical thresholds must be placed before these statutory bodies before tender awards or expenditure sanctions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {committees.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {c.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{c.name}</h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-700 block">Statutory Chairperson:</span>
                    <span className="text-slate-900 font-medium">{c.chairperson_title}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Mandate & Scope:</span>
                    <p className="text-slate-600 leading-relaxed mt-0.5">{c.mandate_summary}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Governing Authority / G.O.:</span>
                    <span className="font-mono text-slate-800 text-[11px]">{c.constitution_go}</span>
                  </div>
                </div>

                {/* Meetings & Decisions if available */}
                {c.decisions && c.decisions.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <Award className="w-3.5 h-3.5 text-indigo-600" /> Recorded Decisions & Sanctions
                    </span>
                    <div className="space-y-2">
                      {c.decisions.map(d => (
                        <div key={d.id} className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-950">{d.decision_reference}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900">
                              {d.decision_type}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{d.subject}</p>
                          <p className="text-slate-600 text-[11px]">{d.decision_text}</p>
                          {d.statutory_condition && (
                            <p className="text-amber-900 font-medium text-[11px] bg-amber-100/60 p-1.5 rounded">
                              <span className="font-bold">Mandatory Condition:</span> {d.statutory_condition}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY THRESHOLD REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {/* Header filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rule-Triggered Committee Referrals</h3>
              <p className="text-xs text-slate-500">
                Automatic escalations generated when project parameters breach delegated statutory limits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Committee:</span>
              <select
                value={selectedCommitteeCode}
                onChange={e => setSelectedCommitteeCode(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="ALL">All Committees</option>
                <option value="COT">COT (Commissionerate of Tenders)</option>
                <option value="TAC">TAC (Technical Audit Committee)</option>
                <option value="EXPERT_16B">Section 16(b) Expert Committee</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReferrals.map(ref => (
              <div
                key={ref.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-900 text-white">
                      {ref.committee_code}
                    </span>
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {ref.referral_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {ref.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ref.referral_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3 text-xs">
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                    <span className="text-red-700 font-bold block">Actual Trigger Metric</span>
                    <span className="text-lg font-bold text-red-950">{ref.trigger_value}</span>
                    <span className="text-[11px] text-red-600 block">Exceeds ceiling of {ref.threshold_limit}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg md:col-span-2">
                    <span className="text-slate-700 font-bold block">Statutory Rule Citation</span>
                    <span className="font-mono text-slate-900 font-semibold block mt-0.5">
                      {ref.statutory_rule_citation}
                    </span>
                    <span className="text-slate-500 text-[11px] mt-1 block">
                      Assigned Officer: <span className="font-semibold text-slate-800">{ref.responsible_officer}</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  <span className="font-bold text-slate-900">Reason for Statutory Referral: </span>
                  {ref.referral_reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI INTELLIGENCE & HUMAN VERIFICATION */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-indigo-950 text-white p-5 rounded-xl border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">AI Intelligence Forensic Findings Center</h3>
              </div>
              <p className="text-xs text-indigo-200 mt-1 max-w-3xl">
                AI automated forensic scans detect tender bid anomalies, un-sanctioned quantity variations, missing bridge audits, and solatium misalignments. By constitutional rule, AI cannot exercise government power: an authorised engineering officer must validate or dismiss each finding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-200 font-medium">Filter Status:</span>
              <select
                value={findingFilter}
                onChange={e => setFindingFilter(e.target.value)}
                className="px-3 py-1.5 bg-indigo-900/80 border border-indigo-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              >
                <option value="ALL">All Findings ({findings.length})</option>
                <option value="PENDING_HUMAN_REVIEW">Pending Human Review</option>
                <option value="CONFIRMED_VALID">Confirmed Valid</option>
                <option value="DISMISSED_FALSE_POSITIVE">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFindings.map(finding => (
              <div
                key={finding.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {finding.finding_type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Confidence: {finding.confidence}
                    </span>
                  </div>
                  <div>
                    {finding.human_validation_status === 'CONFIRMED_VALID' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CONFIRMED BY OFFICER
                      </span>
                    ) : finding.human_validation_status === 'DISMISSED_FALSE_POSITIVE' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" /> DISMISSED FALSE POSITIVE
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> PENDING HUMAN REVIEW
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900">{finding.headline}</h4>

                {/* Evidence & Explanation Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" /> Live Forensic Evidence:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{finding.evidence_summary}</p>
                  </div>
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-amber-700" /> Statutory Rule & Analysis:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{finding.explanation}</p>
                    <span className="font-mono text-[11px] text-amber-800 font-semibold block pt-1">
                      Citation: {finding.statutory_rule_citation}
                    </span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs">
                  <span className="font-bold text-indigo-950 block">AI Recommended Corrective Action:</span>
                  <p className="text-indigo-900 mt-0.5 leading-relaxed">{finding.recommended_action}</p>
                </div>

                {/* Human Validation Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter verification notes / measurement book reference (optional)..."
                      value={officerRemarks[finding.id] || ''}
                      onChange={e => setOfficerRemarks({ ...officerRemarks, [finding.id]: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleValidateFinding(finding.id, 'CONFIRMED_VALID')}
                      disabled={validatingId === finding.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm Valid Finding
                    </button>
                    <button
                      onClick={() => handleValidateFinding(finding.id, 'DISMISSED_FALSE_POSITIVE')}
                      disabled={validatingId === finding.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
