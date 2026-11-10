import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DigitalOfficeOverviewData,
  CorrespondenceItem,
  GovernmentFileItem,
  GovernmentFileDetail,
  FileMovementItem,
  OfficeNoteItem,
  GovernmentDecisionItem,
  DigitalOfficeMeetingItem,
  GovernmentActionItem,
  DigitalDocumentItem,
  DigitalOfficeAIFindingItem,
  ProjectItem
} from '../types';
import {
  Briefcase,
  FileText,
  Send,
  Inbox,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Plus,
  X,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Users,
  Building2,
  CheckSquare,
  Lock,
  Compass,
  FileCode,
  Paperclip
} from 'lucide-react';

export const DigitalOfficePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'correspondence' | 'files' | 'movements' | 'notes' | 'decisions_actions' | 'documents' | 'demo_scenario'
  >('files');

  // Data states
  const [overview, setOverview] = useState<DigitalOfficeOverviewData | null>(null);
  const [correspondences, setCorrespondences] = useState<CorrespondenceItem[]>([]);
  const [files, setFiles] = useState<GovernmentFileItem[]>([]);
  const [decisions, setDecisions] = useState<GovernmentDecisionItem[]>([]);
  const [meetings, setMeetings] = useState<DigitalOfficeMeetingItem[]>([]);
  const [actionItems, setActionItems] = useState<GovernmentActionItem[]>([]);
  const [documents, setDocuments] = useState<DigitalDocumentItem[]>([]);
  const [aiFindings, setAiFindings] = useState<DigitalOfficeAIFindingItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Selected File Dossier
  const [selectedFileDetail, setSelectedFileDetail] = useState<GovernmentFileDetail | null>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  // Filters
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCorrespondenceModal, setShowCorrespondenceModal] = useState<boolean>(false);
  const [showMovementModal, setShowMovementModal] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [selectedActionItem, setSelectedActionItem] = useState<GovernmentActionItem | null>(null);

  // Form states
  const [correspondenceForm, setCorrespondenceForm] = useState({
    reference_number: '',
    communication_type: 'INCOMING' as 'INCOMING' | 'OUTGOING',
    sender_or_recipient_org: '',
    sender_or_recipient_name: '',
    sender_or_recipient_role: '',
    subject: '',
    category: 'Administrative Sanction',
    priority: 'HIGH' as 'ROUTINE' | 'URGENT' | 'HIGH' | 'IMMEDIATE',
    confidentiality_level: 'INTERNAL' as 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET',
    dispatch_evidence_ref: '',
    document_reference: ''
  });

  const [movementForm, setMovementForm] = useState({
    to_department_id: 2,
    to_officer_name: '',
    reason_for_movement: '',
    instruction_note: '',
    expected_action: '',
    due_date: ''
  });

  const [noteForm, setNoteForm] = useState({
    background_context: '',
    factual_matrix: '',
    financial_implications_cr: 0,
    legal_and_compliance_implications: '',
    project_milestone_impact: '',
    officer_recommendation: '',
    supporting_doc_ref: ''
  });

  const [workflowForm, setWorkflowForm] = useState({
    new_stage: 'SECRETARY_REVIEW',
    decision_remarks: '',
    decision_authority: 'PRINCIPAL_SECRETARY',
    approved_action: '',
    supporting_doc_ref: ''
  });

  const [actionUpdateForm, setActionUpdateForm] = useState({
    status: 'COMPLETED' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE',
    progress_pct: 100,
    evidence_ref: '',
    closure_remarks: ''
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Data
  const loadAllData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const prjId = filterProject !== 'ALL' ? Number(filterProject) : undefined;

      const [
        overviewRes,
        corrRes,
        filesRes,
        decRes,
        meetRes,
        actRes,
        docRes,
        aiRes,
        prjRes
      ] = await Promise.all([
        api.getDigitalOfficeOverview(prjId),
        api.getCorrespondence({ project_id: prjId }),
        api.getGovernmentFiles({ project_id: prjId }),
        api.getGovernmentDecisions({ project_id: prjId }),
        api.getDigitalOfficeMeetings(),
        api.getGovernmentActionItems(),
        api.getDigitalDocuments({ project_id: prjId }),
        api.getDigitalOfficeAIIntelligence(prjId),
        api.getProjects()
      ]);

      setOverview(overviewRes);
      setCorrespondences(corrRes);
      setFiles(filesRes);
      setDecisions(decRes);
      setMeetings(meetRes);
      setActionItems(actRes);
      setDocuments(docRes);
      setAiFindings(aiRes.items || []);
      setProjects(prjRes);
    } catch (err: any) {
      console.error('Failed to load Digital Office data:', err);
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to load Digital Office records.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filterProject]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData(false);
  };

  // View File Dossier
  const handleOpenFileDossier = async (fileId: number) => {
    try {
      setLoadingDossier(true);
      const detail = await api.getGovernmentFileDetail(fileId);
      setSelectedFileDetail(detail);
    } catch (err: any) {
      alert(`Access Restricted: ${err?.message || 'Could not load file dossier.'}`);
    } finally {
      setLoadingDossier(false);
    }
  };

  // Submit Correspondence
  const handleCreateCorrespondence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (correspondenceForm.communication_type === 'OUTGOING' && !correspondenceForm.dispatch_evidence_ref) {
        alert('Integrity Constraint: An official communication cannot be marked dispatched without postal/email dispatch evidence.');
        return;
      }
      await api.createCorrespondence(correspondenceForm);
      setFeedbackMsg({ type: 'success', text: 'Official communication registered successfully in Secretariat registry.' });
      setShowCorrespondenceModal(false);
      setCorrespondenceForm({
        reference_number: '',
        communication_type: 'INCOMING',
        sender_or_recipient_org: '',
        sender_or_recipient_name: '',
        sender_or_recipient_role: '',
        subject: '',
        category: 'Administrative Sanction',
        priority: 'HIGH',
        confidentiality_level: 'INTERNAL',
        dispatch_evidence_ref: '',
        document_reference: ''
      });
      loadAllData(false);
    } catch (err: any) {
      alert(`Submission Error: ${err?.message || 'Could not register communication.'}`);
    }
  };

  // Record File Movement
  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileDetail) return;
    try {
      await api.addFileMovement(selectedFileDetail.file.id, movementForm);
      setFeedbackMsg({ type: 'success', text: `File movement recorded. Dispatched to ${movementForm.to_officer_name}.` });
      setShowMovementModal(false);
      // Reload dossier
      handleOpenFileDossier(selectedFileDetail.file.id);
      loadAllData(false);
    } catch (err: any) {
      alert(`Movement Error: ${err?.message || 'Could not register movement.'}`);
    }
  };

  // Submit Office Note
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileDetail) return;
    try {
      await api.submitOfficeNote(selectedFileDetail.file.id, noteForm);
      setFeedbackMsg({ type: 'success', text: 'Structured office note recorded with factual matrix separation.' });
      setShowNoteModal(false);
      handleOpenFileDossier(selectedFileDetail.file.id);
      loadAllData(false);
    } catch (err: any) {
      alert(`Note Submission Error: ${err?.message || 'Could not record office note.'}`);
    }
  };

  // Advance Workflow
  const handleAdvanceWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileDetail) return;
    try {
      await api.advanceFileWorkflow(selectedFileDetail.file.id, workflowForm);
      setFeedbackMsg({ type: 'success', text: `File advanced to ${workflowForm.new_stage}. Official audit logged.` });
      setShowWorkflowModal(false);
      handleOpenFileDossier(selectedFileDetail.file.id);
      loadAllData(false);
    } catch (err: any) {
      alert(`Workflow Error: ${err?.message || 'Could not advance workflow.'}`);
    }
  };

  // Update Action Item
  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionItem) return;
    try {
      if (actionUpdateForm.status === 'COMPLETED' && !actionUpdateForm.evidence_ref) {
        alert('Integrity Constraint: An action item cannot be closed as COMPLETED without attaching compliance evidence.');
        return;
      }
      await api.updateGovernmentActionItem(selectedActionItem.id, actionUpdateForm);
      setFeedbackMsg({ type: 'success', text: `Action ${selectedActionItem.action_code} updated successfully.` });
      setShowActionModal(false);
      setSelectedActionItem(null);
      loadAllData(false);
    } catch (err: any) {
      alert(`Action Update Error: ${err?.message || 'Could not update action.'}`);
    }
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      if (filterPriority !== 'ALL' && f.priority !== filterPriority) return false;
      if (filterCategory !== 'ALL' && f.file_category !== filterCategory) return false;
      if (filterStage !== 'ALL' && f.current_workflow_stage !== filterStage) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const m1 = f.file_number.toLowerCase().includes(q);
        const m2 = f.subject.toLowerCase().includes(q);
        const m3 = f.current_responsible_officer_name.toLowerCase().includes(q);
        if (!m1 && !m2 && !m3) return false;
      }
      return true;
    });
  }, [files, filterPriority, filterCategory, filterStage, searchQuery]);

  // Filtered correspondences
  const filteredCorrespondences = useMemo(() => {
    return correspondences.filter(c => {
      if (filterPriority !== 'ALL' && c.priority !== filterPriority) return false;
      if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const m1 = c.communication_code.toLowerCase().includes(q);
        const m2 = c.subject.toLowerCase().includes(q);
        const m3 = c.sender_or_recipient_org.toLowerCase().includes(q);
        if (!m1 && !m2 && !m3) return false;
      }
      return true;
    });
  }, [correspondences, filterPriority, filterCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and Live Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
              <Briefcase className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900  tracking-tight">
                  Secretariat Digital Office & E-File Intelligence
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  DEMO DATA
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                  e-Office v4.2
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Government of Tamil Nadu • Highways and Minor Ports Department • End-to-End Decision Traceability
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Updated: {overview?.last_updated || 'Live'}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCorrespondenceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Inward/Outward Comm
          </button>
        </div>
      </div>

      {/* Flash Feedback */}
      {feedbackMsg && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic 14 KPI Cards Overview */}
      {overview?.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Incoming Comms</span>
              <Inbox className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900  mt-1">
              {overview.kpis.total_incoming_communications}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              {overview.kpis.unprocessed_communications} pending desk allocation
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Active Files</span>
              <FolderOpen className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900  mt-1">
              {overview.kpis.files_currently_under_processing}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Under departmental review
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Sec Review</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">
              {overview.kpis.files_pending_secretary_approval}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              Awaiting Sec Concurrence
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Minister Files</span>
              <Briefcase className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
              {overview.kpis.files_pending_minister_decision}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              Special Order queue
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Decisions Issued</span>
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {overview.kpis.decisions_issued}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Min & Sec G.O. proceedings
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Pending Actions</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
              {overview.kpis.pending_action_items}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {overview.kpis.completed_action_items} compliance closed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Overdue / Bottleneck</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
              {overview.kpis.overdue_files}
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
              {overview.kpis.critical_administrative_bottlenecks} AI alerts
            </div>
          </div>
        </div>
      )}

      {/* AI Office Intelligence Advisory Banner */}
      {aiFindings.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-indigo-900/20 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-indigo-600 text-white rounded-lg mt-0.5 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 ">
                    AI Secretariat Intelligence (Advisory Oversight)
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                    {aiFindings.length} Active Findings
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Human sign-off mandatory for administrative execution
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2.5">
                  {aiFindings.slice(0, 3).map(finding => (
                    <div
                      key={finding.id}
                      className="bg-white/90 dark:bg-gray-800/90 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs"
                    >
                      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                        <span>{finding.finding_code}</span>
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded ${
                            finding.severity === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                              : finding.severity === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {finding.severity}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-900  mt-1 line-clamp-1">
                        {finding.title}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                        {finding.problem_statement}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-400">
                        <span>Action: {finding.suggested_responsible_role}</span>
                        <span>{Math.round(finding.ai_confidence * 100)}% conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Government Files Register ({files.length})
        </button>

        <button
          onClick={() => setActiveTab('correspondence')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'correspondence'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Correspondence Register ({correspondences.length})
        </button>

        <button
          onClick={() => setActiveTab('decisions_actions')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'decisions_actions'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Decisions & Actions ({decisions.length}/{actionItems.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'movements'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          File Movement Registry
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Store ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab('demo_scenario')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'demo_scenario'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Compass className="w-4 h-4 text-indigo-500" />
          Section 16 Corridor Walkthrough
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
          </div>

          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Highway Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.road_name || p.title.slice(0, 30)}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="IMMEDIATE">IMMEDIATE (Within 24h)</option>
            <option value="HIGH">HIGH (Within 7d)</option>
            <option value="URGENT">URGENT (Within 15d)</option>
            <option value="ROUTINE">ROUTINE (Within 30d)</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Administrative Sanction">Administrative Sanction</option>
            <option value="Utility Shifting NOC">Utility Shifting NOC</option>
            <option value="Land Acquisition Award">Land Acquisition Award</option>
            <option value="Cabinet / Ministerial Order">Cabinet / Ministerial Order</option>
            <option value="Tender Approval">Tender Approval</option>
          </select>

          {activeTab === 'files' && (
            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="ALL">All Workflow Stages</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SECTION_REVIEW">SECTION REVIEW</option>
              <option value="DEPARTMENT_REVIEW">DEPARTMENT REVIEW</option>
              <option value="SECRETARY_REVIEW">SECRETARY REVIEW</option>
              <option value="MINISTER_DECISION">MINISTER DECISION</option>
              <option value="APPROVED">APPROVED</option>
              <option value="RETURNED_FOR_CLARIFICATION">RETURNED FOR CLARIFICATION</option>
            </select>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference, subject, officer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: GOVERNMENT FILES REGISTER */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-900  uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">File Number</th>
                    <th className="px-4 py-3">Subject & Category</th>
                    <th className="px-4 py-3">Current Location (Desk)</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition cursor-pointer"
                      onClick={() => handleOpenFileDossier(file.id)}
                    >
                      <td className="px-4 py-3.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {file.file_number}
                        {file.confidentiality_level !== 'INTERNAL' && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            {file.confidentiality_level}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-semibold text-gray-900  line-clamp-1">
                          {file.subject}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {file.file_category}
                          </span>
                          <span>•</span>
                          <span>{file.project_code || 'General'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {file.current_responsible_officer_name}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {file.current_department_code || 'Highways Department'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            file.priority === 'IMMEDIATE'
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                              : file.priority === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {file.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {file.current_workflow_stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {file.due_date || 'Standard'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenFileDossier(file.id);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800 transition"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CORRESPONDENCE REGISTER */}
      {activeTab === 'correspondence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 ">
              Official Correspondence Register ({filteredCorrespondences.length} communications)
            </h2>
            <button
              onClick={() => setShowCorrespondenceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New Letter
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-900  uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Code / Ref</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Sender / Recipient</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status & Evidence</th>
                    <th className="px-4 py-3 text-right">File Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredCorrespondences.map(corr => (
                    <tr key={corr.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition">
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-semibold text-gray-900 ">
                          {corr.communication_code}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {corr.reference_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            corr.communication_type === 'INCOMING'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {corr.communication_type === 'INCOMING' ? (
                            <Inbox className="w-3 h-3" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {corr.communication_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-gray-900 ">
                          {corr.sender_or_recipient_org}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {corr.sender_or_recipient_name} ({corr.sender_or_recipient_role})
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="font-medium text-gray-900  line-clamp-2">
                          {corr.subject}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Category: {corr.category}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            corr.priority === 'IMMEDIATE'
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                              : corr.priority === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {corr.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {corr.status}
                        </div>
                        {corr.dispatch_evidence_ref && (
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Ev: {corr.dispatch_evidence_ref}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {corr.government_file_id ? (
                          <button
                            onClick={() => handleOpenFileDossier(corr.government_file_id!)}
                            className="px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
                          >
                            Trace File #{corr.government_file_id}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No File Linked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DECISIONS & ACTIONS */}
      {activeTab === 'decisions_actions' && (
        <div className="space-y-6">
          {/* Ministerial Decisions Register */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900 ">
                  Ministerial & Secretary Decisions Register ({decisions.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Statutory Special Orders & Administrative Sanctions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {decisions.map(dec => (
                <div
                  key={dec.id}
                  className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {dec.decision_code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          dec.decision_authority === 'MINISTER'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {dec.decision_authority.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-900  mt-2">
                      {dec.decision_statement}
                    </p>

                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 mt-2">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Approved Action:
                      </span>{' '}
                      {dec.approved_action}
                    </div>

                    {dec.supporting_doc_ref && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-mono">
                        Ref: {dec.supporting_doc_ref}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{dec.decision_date}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        dec.implementation_status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}
                    >
                      {dec.implementation_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items and Compliance Tracker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900 ">
                  Operational Action Items & Compliance Tracking ({actionItems.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Mandatory Evidence Closure Rules Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-900  uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Action Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Responsible Officer</th>
                    <th className="px-4 py-3">Priority / Due Date</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Evidence Attached</th>
                    <th className="px-4 py-3 text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {actionItems.map(act => (
                    <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                        {act.action_code}
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-gray-900  line-clamp-1">
                          {act.description}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          Dept: {act.responsible_department_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {act.responsible_officer_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            act.priority === 'HIGH' || act.priority === 'IMMEDIATE'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {act.priority}
                        </span>
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Due: {act.due_date || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${act.progress_pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{act.progress_pct}%</span>
                        </div>
                        <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mt-0.5">
                          {act.status}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {act.evidence_ref ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {act.evidence_ref}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 italic">No Evidence</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedActionItem(act);
                            setActionUpdateForm({
                              status: act.status,
                              progress_pct: act.progress_pct,
                              evidence_ref: act.evidence_ref || '',
                              closure_remarks: act.closure_remarks || ''
                            });
                            setShowActionModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded border border-indigo-200 dark:border-indigo-800"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FILE MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-2.5">
            <h3 className="text-sm font-bold text-gray-900 ">
              Permanent Chronological File Movements Registry
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Select a Government File to view or record physical/digital movements
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Click on any file below to inspect its unbroken movement timeline from creation to final Secretariat sanction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(f => (
              <div
                key={f.id}
                onClick={() => handleOpenFileDossier(f.id)}
                className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                    {f.file_number}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 font-mono">
                    {f.current_workflow_stage}
                  </span>
                </div>
                <div className="text-xs font-semibold text-gray-900  mt-1 line-clamp-1">
                  {f.subject}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Desk: {f.current_responsible_officer_name} ({f.current_department_code || 'Highways'})
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    View Movement Trail →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: DOCUMENT REPOSITORY */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-900  uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Doc Code / Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Issuing Authority</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Confidentiality</th>
                    <th className="px-4 py-3">Integrity Checksum (SHA-256)</th>
                    <th className="px-4 py-3 text-right">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition">
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-semibold text-gray-900 ">
                          {doc.title}
                        </div>
                        <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          {doc.document_code} {doc.reference_number ? `(${doc.reference_number})` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                        {doc.issuing_authority}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {doc.document_date || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            doc.confidentiality_level === 'SECRET' || doc.confidentiality_level === 'CONFIDENTIAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {doc.confidentiality_level}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-gray-500 dark:text-gray-400">
                        {doc.checksum_sha256 ? `${doc.checksum_sha256.slice(0, 16)}...` : 'Verified'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        v{doc.version}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: SECTION 16 CORRIDOR DEMO SCENARIO */}
      {activeTab === 'demo_scenario' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-blue-900/20 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-blue-950/40 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 bg-indigo-600 text-white rounded-xl shadow">
                <Compass className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 ">
                  Section 16 Live Demonstration Scenario: CKICP SH-15 Corridor Fast-Track Approval
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Traceability Demonstration from Inward TANGEDCO Letter to Ministerial Decision & Execution
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-bold text-indigo-700 dark:text-indigo-400">Context:</span> In CKICP Project 4 (Gobichettipalayam - Erode Corridor, SH-15), four 33kV high-tension electrical towers at Pykara crossing blocked critical grade separator foundation work. The contractor (Ramalingam Construction) faced liquidated damages risk. The workflow below details the exact administrative progression recorded in TN-HDOS.
            </div>

            {/* Stepper Timeline */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 ">
                      Inward Communication Received: COMM-IN-2026-042
                    </span>
                    <span className="font-mono text-[11px] text-gray-500">12 Jan 2026</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Executive Engineer TANGEDCO submitted finalized estimate of ₹0.85 Cr for shifting Pykara towers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 ">
                      Government File Creation: FILE-CKICP-2026-088
                    </span>
                    <button
                      onClick={() => handleOpenFileDossier(4)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    >
                      Open Dossier
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Originating at CKICP Special Projects Wing, classified HIGH priority with 4 chronological desk movements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 ">
                      Structured Office Note: NOTE-2026-142
                    </span>
                    <span className="font-mono text-[11px] text-gray-500">₹0.85 Cr commitment</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Separated factual technical matrix from administrative recommendations as mandated by Secretariat Office Manual.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 ">
                      Ministerial Special Decision: DEC-MIN-2026-021
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">
                      MINISTER ACCORDED
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Hon'ble Minister for Public Works and Highways approved treasury release and ordered Joint Inspection within 7 days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                  5
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 ">
                      Operational Action Items: ACT-OFF-081 & ACT-OFF-082
                    </span>
                    <span className="font-mono text-[11px] text-emerald-600 font-semibold">100% Closed</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Joint alignment survey verified by Superintending Engineer; final compliance certificate attached to file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILE DOSSIER DRAWER / MODAL */}
      {selectedFileDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-600 text-white rounded-lg">
                  <FolderOpen className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900  font-mono">
                      {selectedFileDetail.file.file_number}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                      {selectedFileDetail.file.current_workflow_stage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Category: {selectedFileDetail.file.file_category} • Desk:{' '}
                    {selectedFileDetail.file.current_responsible_officer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 rounded-lg border border-emerald-300"
                >
                  Move Desk
                </button>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-lg border border-indigo-300"
                >
                  Add Note
                </button>
                <button
                  onClick={() => setShowWorkflowModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Advance Stage
                </button>
                <button
                  onClick={() => setSelectedFileDetail(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* File Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <div className="font-semibold text-gray-900  text-sm">
                  {selectedFileDetail.file.subject}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Priority:</span>{' '}
                    {selectedFileDetail.file.priority}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Originator:</span>{' '}
                    {selectedFileDetail.file.originating_officer_name}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Due Date:</span>{' '}
                    {selectedFileDetail.file.due_date || 'Standard'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Pending Action:</span>{' '}
                    {selectedFileDetail.file.pending_action || 'Review'}
                  </div>
                </div>
              </div>

              {/* Chronological Desk Movements */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Chronological Desk Movements ({selectedFileDetail.movements.length})
                </h4>
                <div className="space-y-2.5">
                  {selectedFileDetail.movements.map(m => (
                    <div
                      key={m.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs"
                    >
                      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          Movement #{m.movement_number}
                        </span>
                        <span>{m.movement_date}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900  mt-1">
                        <span>{m.from_officer_name} ({m.from_department_name})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span>{m.to_officer_name} ({m.to_department_name})</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Reason:</span>{' '}
                        {m.reason_for_movement}
                      </p>
                      {m.instruction_note && (
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 italic">
                          "{m.instruction_note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Office Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Structured Secretariat Office Notes ({selectedFileDetail.notes.length})
                </h4>
                <div className="space-y-3">
                  {selectedFileDetail.notes.map(n => (
                    <div
                      key={n.id}
                      className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">
                          Note #{n.note_number} by {n.author_officer_name} ({n.author_designation})
                        </span>
                        <span>{n.submission_date}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          Background Context:
                        </span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">{n.background_context}</span>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900/60 rounded border border-gray-100 dark:border-gray-800">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Factual Matrix:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">{n.factual_matrix}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Financial Commitment:
                          </span>{' '}
                          <span className="font-bold text-emerald-600">
                            ₹{n.financial_implications_cr.toFixed(2)} Cr
                          </span>
                        </div>
                        {n.supporting_doc_ref && (
                          <div className="font-mono text-[11px]">
                            Doc: {n.supporting_doc_ref}
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold">Officer Recommendation:</span> {n.officer_recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER CORRESPONDENCE */}
      {showCorrespondenceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 ">
                Register Official Communication
              </h3>
              <button
                onClick={() => setShowCorrespondenceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCorrespondence} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Comm Type</label>
                  <select
                    value={correspondenceForm.communication_type}
                    onChange={e =>
                      setCorrespondenceForm({
                        ...correspondenceForm,
                        communication_type: e.target.value as any
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  >
                    <option value="INCOMING">INCOMING (Inward)</option>
                    <option value="OUTGOING">OUTGOING (Dispatched)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={correspondenceForm.priority}
                    onChange={e =>
                      setCorrespondenceForm({
                        ...correspondenceForm,
                        priority: e.target.value as any
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  >
                    <option value="IMMEDIATE">IMMEDIATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="ROUTINE">ROUTINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Reference Number (Letter/Roc)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roc.No.4412/2026/A1"
                  value={correspondenceForm.reference_number}
                  onChange={e =>
                    setCorrespondenceForm({ ...correspondenceForm, reference_number: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Organisation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TANGEDCO / District Collectorate"
                    value={correspondenceForm.sender_or_recipient_org}
                    onChange={e =>
                      setCorrespondenceForm({
                        ...correspondenceForm,
                        sender_or_recipient_org: e.target.value
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. K. Soundarajan"
                    value={correspondenceForm.sender_or_recipient_name}
                    onChange={e =>
                      setCorrespondenceForm({
                        ...correspondenceForm,
                        sender_or_recipient_name: e.target.value
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Subject</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Subject of official letter..."
                  value={correspondenceForm.subject}
                  onChange={e =>
                    setCorrespondenceForm({ ...correspondenceForm, subject: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              {correspondenceForm.communication_type === 'OUTGOING' && (
                <div>
                  <label className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Dispatch Evidence Reference (Mandatory for Outgoing)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Speedpost tracking / Email ID ref..."
                    value={correspondenceForm.dispatch_evidence_ref}
                    onChange={e =>
                      setCorrespondenceForm({
                        ...correspondenceForm,
                        dispatch_evidence_ref: e.target.value
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-emerald-400 rounded-lg text-gray-900 "
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCorrespondenceModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Register Communication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD FILE MOVEMENT */}
      {showMovementModal && selectedFileDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 ">
                Dispatch File to Another Desk
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Recipient Officer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special DRO (Land Acquisition)"
                  value={movementForm.to_officer_name}
                  onChange={e => setMovementForm({ ...movementForm, to_officer_name: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Reason for Movement
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. For revenue boundary verification"
                  value={movementForm.reason_for_movement}
                  onChange={e =>
                    setMovementForm({ ...movementForm, reason_for_movement: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Expected Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Affix departmental concurrence"
                  value={movementForm.expected_action}
                  onChange={e =>
                    setMovementForm({ ...movementForm, expected_action: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Instruction Note</label>
                <textarea
                  rows={2}
                  placeholder="Specific Secretariat instructions..."
                  value={movementForm.instruction_note}
                  onChange={e =>
                    setMovementForm({ ...movementForm, instruction_note: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD STRUCTURED OFFICE NOTE */}
      {showNoteModal && selectedFileDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 ">
                Submit Secretariat Office Note
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNote} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Background Context
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Administrative background of the proposal..."
                  value={noteForm.background_context}
                  onChange={e => setNoteForm({ ...noteForm, background_context: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Factual Matrix (Verified Technical Facts)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="IRC codes, measurement data, survey findings..."
                  value={noteForm.factual_matrix}
                  onChange={e => setNoteForm({ ...noteForm, factual_matrix: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Financial Implications (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={noteForm.financial_implications_cr}
                    onChange={e =>
                      setNoteForm({
                        ...noteForm,
                        financial_implications_cr: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Doc Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DOC-IRC-412"
                    value={noteForm.supporting_doc_ref}
                    onChange={e => setNoteForm({ ...noteForm, supporting_doc_ref: e.target.value })}
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Officer Recommendation
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specific order sought from Secretary or Minister..."
                  value={noteForm.officer_recommendation}
                  onChange={e =>
                    setNoteForm({ ...noteForm, officer_recommendation: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-emerald-400 rounded-lg text-gray-900 "
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Submit Office Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADVANCE STAGE / ACCORD DECISION */}
      {showWorkflowModal && selectedFileDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 ">
                Advance Stage & Accord Decision
              </h3>
              <button onClick={() => setShowWorkflowModal(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdvanceWorkflow} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Target Stage</label>
                <select
                  value={workflowForm.new_stage}
                  onChange={e => setWorkflowForm({ ...workflowForm, new_stage: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                >
                  <option value="DEPARTMENT_REVIEW">DEPARTMENT REVIEW</option>
                  <option value="SECRETARY_REVIEW">SECRETARY REVIEW</option>
                  <option value="MINISTER_DECISION">MINISTER DECISION</option>
                  <option value="APPROVED">APPROVED (Formal Sanction)</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="RETURNED_FOR_CLARIFICATION">RETURNED FOR CLARIFICATION</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Decision Authority
                </label>
                <select
                  value={workflowForm.decision_authority}
                  onChange={e =>
                    setWorkflowForm({ ...workflowForm, decision_authority: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                >
                  <option value="MINISTER">Hon'ble Minister for Highways</option>
                  <option value="PRINCIPAL_SECRETARY">Principal Secretary to Government</option>
                  <option value="CHIEF_ENGINEER">Chief Engineer (Highways)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Decision Remarks / G.O. Statement
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Statutory endorsement or Special Order..."
                  value={workflowForm.decision_remarks}
                  onChange={e =>
                    setWorkflowForm({ ...workflowForm, decision_remarks: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Approved Action to Execute
                </label>
                <input
                  type="text"
                  placeholder="e.g. Release ₹0.85 Cr to TANGEDCO within 10 days"
                  value={workflowForm.approved_action}
                  onChange={e =>
                    setWorkflowForm({ ...workflowForm, approved_action: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowWorkflowModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Endorse & Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: UPDATE ACTION ITEM */}
      {showActionModal && selectedActionItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 ">
                Update Action Compliance
              </h3>
              <button onClick={() => setShowActionModal(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAction} className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                  {selectedActionItem.action_code}
                </div>
                <div className="font-semibold text-gray-900  mt-1">
                  {selectedActionItem.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={actionUpdateForm.status}
                    onChange={e =>
                      setActionUpdateForm({
                        ...actionUpdateForm,
                        status: e.target.value as any
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  >
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={actionUpdateForm.progress_pct}
                    onChange={e =>
                      setActionUpdateForm({
                        ...actionUpdateForm,
                        progress_pct: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Compliance Evidence Reference (Required for Completion)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FINAL-COMPLIANCE-CERT-2026-01"
                  value={actionUpdateForm.evidence_ref}
                  onChange={e =>
                    setActionUpdateForm({ ...actionUpdateForm, evidence_ref: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-emerald-400 rounded-lg text-gray-900 "
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Closure Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Field verification details..."
                  value={actionUpdateForm.closure_remarks}
                  onChange={e =>
                    setActionUpdateForm({ ...actionUpdateForm, closure_remarks: e.target.value })
                  }
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 "
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Compliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalOfficePage;

