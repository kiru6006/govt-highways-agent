import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, Users, User, Search, Plus, Pin, BellOff, Paperclip, 
  Send, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, X, 
  ExternalLink, FileText, Download, Check, Reply, ArrowLeft, RefreshCw
} from 'lucide-react';
import { 
  ConversationItem, MessageItem, ConversationAISummary, 
  UserSearchItem 
} from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Right Contextual Panel State
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [aiSummary, setAiSummary] = useState<ConversationAISummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  // Message Composer State
  const [inputContent, setInputContent] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ROUTINE');
  const [replyingTo, setReplyingTo] = useState<MessageItem | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentSize] = useState<number>(1024 * 128);
  const [showAttachInput, setShowAttachInput] = useState<boolean>(false);

  // Modals & User Directory
  const [showNewDirectModal, setShowNewDirectModal] = useState<boolean>(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState<boolean>(false);
  const [userDirectory, setUserDirectory] = useState<UserSearchItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [newGroupTitle, setNewGroupTitle] = useState<string>('');
  const [newGroupCategory, setNewGroupCategory] = useState<string>('PROJECT_WORKING_GROUP');

  // Confirmation Alert for Action Items
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const fetchConversations = async (maintainSelection = true) => {
    try {
      setLoading(true);
      const data = await api.getConversations({
        tab: activeTab !== 'ALL' ? activeTab : undefined,
        search: searchQuery || undefined,
      });
      setConversations(data);

      const targetIdParam = searchParams.get('conversationId');
      const targetId = targetIdParam ? parseInt(targetIdParam, 10) : (maintainSelection ? selectedConversationId : null);
      
      if (targetId && data.some(c => c.id === targetId)) {
        setSelectedConversationId(targetId);
      } else if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(false);
  }, [user?.id, activeTab]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchConversations(true);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Fetch Messages for Selected Conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    let isMounted = true;
    const loadConversationDetails = async () => {
      try {
        setMessagesLoading(true);
        const conv = conversations.find(c => c.id === selectedConversationId);
        if (conv) setSelectedConversation(conv);

        const msgList = await api.getConversationMessages(selectedConversationId);
        if (isMounted) {
          setMessages(msgList);
          await api.markConversationRead(selectedConversationId);
          setConversations(prev => prev.map(c => c.id === selectedConversationId ? { ...c, unread_count: 0 } : c));
        }

        // Fetch AI Summary
        setSummaryLoading(true);
        const sum = await api.getConversationAISummary(selectedConversationId);
        if (isMounted) setAiSummary(sum);
      } catch (err) {
        console.error('Failed to load conversation details', err);
      } finally {
        if (isMounted) {
          setMessagesLoading(false);
          setSummaryLoading(false);
        }
      }
    };

    loadConversationDetails();
    return () => { isMounted = false; };
  }, [selectedConversationId, user?.id]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedConversationId) return;

    try {
      const attachmentsPayload = attachmentName.trim() ? [{
        file_name: attachmentName.trim(),
        file_size_bytes: attachmentSize,
        mime_type: 'application/pdf',
        file_url: `/files/${encodeURIComponent(attachmentName.trim())}`,
        document_classification: 'OFFICIAL_ATTACHMENT'
      }] : [];

      const newMsg = await api.sendMessage(selectedConversationId, {
        content: inputContent.trim(),
        priority: selectedPriority,
        reply_to_message_id: replyingTo?.id,
        attachments: attachmentsPayload
      });

      setMessages(prev => [...prev, newMsg]);
      setInputContent('');
      setReplyingTo(null);
      setAttachmentName('');
      setShowAttachInput(false);
      setSelectedPriority('ROUTINE');

      // Refresh conversation list preview
      fetchConversations(true);

      // Refresh AI summary asynchronously
      api.getConversationAISummary(selectedConversationId).then(sum => setAiSummary(sum)).catch(() => {});
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Toggle Pin / Mute
  const handleTogglePin = async (cId: number) => {
    try {
      const res = await api.togglePinConversation(cId);
      setConversations(prev => prev.map(c => c.id === cId ? { ...c, is_pinned: res.is_pinned } : c));
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  const handleToggleMute = async (cId: number) => {
    try {
      const res = await api.toggleMuteConversation(cId);
      setConversations(prev => prev.map(c => c.id === cId ? { ...c, is_muted: res.is_muted } : c));
    } catch (err) {
      console.error('Failed to toggle mute', err);
    }
  };

  // Confirm Action Directive
  const handleConfirmAction = async (actionId: number, instruction: string, assignedUserId: number = 2) => {
    if (!selectedConversationId) return;
    try {
      await api.confirmActionSuggestion(selectedConversationId, {
        action_suggestion_id: actionId,
        assigned_user_id: assignedUserId || 2,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'HIGH'
      });
      setActionSuccessMsg(`Action Directive Confirmed: "${instruction}" scheduled in Calendar & Task Registry.`);
      setTimeout(() => setActionSuccessMsg(null), 6000);

      // Refresh AI summary
      const sum = await api.getConversationAISummary(selectedConversationId);
      setAiSummary(sum);
    } catch (err) {
      console.error('Failed to confirm action directive', err);
    }
  };

  // Search Users for Directory
  const handleOpenUserSearch = async (isGroup: boolean) => {
    try {
      const users = await api.searchDirectoryUsers('');
      setUserDirectory(users);
      setSelectedUserIds([]);
      if (isGroup) {
        setShowNewGroupModal(true);
      } else {
        setShowNewDirectModal(true);
      }
    } catch (err) {
      console.error('Failed to load user directory', err);
    }
  };

  const handleStartDirectChat = async (targetUser: UserSearchItem) => {
    try {
      const currentUserId = user?.id || 1;
      const conv = await api.createConversation({
        title: `Official Chat: ${targetUser.full_name}`,
        conversation_type: 'DIRECT',
        category: 'DIRECT_OFFICIAL',
        participant_user_ids: [currentUserId, targetUser.id]
      });
      setShowNewDirectModal(false);
      await fetchConversations(false);
      setSelectedConversationId(conv.id);
    } catch (err) {
      console.error('Failed to create direct chat', err);
    }
  };

  const handleCreateGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim() || selectedUserIds.length === 0) return;

    try {
      const currentUserId = user?.id || 1;
      const conv = await api.createConversation({
        title: newGroupTitle.trim(),
        conversation_type: 'GROUP',
        category: newGroupCategory,
        participant_user_ids: [currentUserId, ...selectedUserIds]
      });
      setShowNewGroupModal(false);
      setNewGroupTitle('');
      setSelectedUserIds([]);
      await fetchConversations(false);
      setSelectedConversationId(conv.id);
    } catch (err) {
      console.error('Failed to create group conversation', err);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* PANEL 1: CONVERSATION LIST (LEFT)                         */}
      {/* ========================================================= */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 ${
        selectedConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header with Search and New Action buttons */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Discussions
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Highways Department Communication Grid
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleOpenUserSearch(false)}
                title="New Direct Message"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenUserSearch(true)}
                title="New Working Group"
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, projects..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] pt-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DIRECT', label: 'Direct' },
              { id: 'GROUP', label: 'Groups' },
              { id: 'PROJECT_LINKED', label: 'Projects' },
              { id: 'UNREAD', label: 'Unread' },
              { id: 'PINNED', label: 'Pinned' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-primary-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found in this category.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.id === selectedConversationId;
              const hasUnread = (c.unread_count ?? 0) > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={`p-3 cursor-pointer transition-colors relative flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-primary-50/80 dark:bg-primary-950/40 border-l-4 border-primary-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Avatar / Icon */}
                  <div className="relative shrink-0">
                    {c.conversation_type === 'DIRECT' ? (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shadow-xs">
                        {c.title.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    {c.is_pinned && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                        <Pin className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {c.title}
                      </h2>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {formatTime(c.last_message_at)}
                      </span>
                    </div>

                    {c.related_project_id && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium mb-1 truncate max-w-full">
                        <span>Project #{c.related_project_id}</span>
                      </div>
                    )}

                    <p className={`text-[11px] truncate ${
                      hasUnread 
                        ? 'font-semibold text-slate-900 dark:text-white' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {c.last_message_preview || 'No messages yet.'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {hasUnread && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center leading-none mt-1">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* PANEL 2: ACTIVE CONVERSATION THREAD (CENTRE)              */}
      {/* ========================================================= */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden ${
        !selectedConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="h-14 sm:h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedConversation.title}
                    </h2>
                    {selectedConversation.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300">
                        {selectedConversation.category.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedConversation.participants.length} Participants • {selectedConversation.participants.map(p => p.full_name).slice(0, 3).join(', ')}{selectedConversation.participants.length > 3 ? '...' : ''}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedConversation.related_project_id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/projects`)}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <span>Project 360°</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleTogglePin(selectedConversation.id)}
                  title={selectedConversation.is_pinned ? 'Unpin Discussion' : 'Pin Discussion'}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    selectedConversation.is_pinned 
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleMute(selectedConversation.id)}
                  title={selectedConversation.is_muted ? 'Unmute Notifications' : 'Mute Notifications'}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    selectedConversation.is_muted
                      ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BellOff className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  title="Toggle Intelligence & Actions Panel"
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    showRightPanel 
                      ? 'bg-slate-100 dark:bg-slate-800 text-primary-600'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Alert Banner */}
            {actionSuccessMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
                <button type="button" onClick={() => setActionSuccessMsg(null)}>
                  <X className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading message trail...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No messages yet. Send a note or directive to begin this discussion.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.sender_user_id === user?.id;
                  const isCritical = m.priority === 'CRITICAL';
                  const isHigh = m.priority === 'HIGH';

                  // Group by date separator
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const showDate = !prevMsg || formatDateLabel(prevMsg.created_at) !== formatDateLabel(m.created_at);

                  return (
                    <React.Fragment key={m.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {formatDateLabel(m.created_at)}
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {/* Sender info */}
                        {!isMine && (
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {m.sender_name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              • {m.sender_role} {m.sender_department ? `(${m.sender_department})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3 shadow-xs relative group ${
                          isMine
                            ? 'bg-primary-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        } ${isCritical ? 'ring-2 ring-rose-500' : isHigh ? 'ring-2 ring-amber-500' : ''}`}>
                          
                          {/* Priority Pill */}
                          {(isCritical || isHigh) && (
                            <div className="flex items-center gap-1 mb-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isCritical 
                                  ? 'bg-rose-500 text-white' 
                                  : 'bg-amber-500 text-slate-950 font-bold'
                              }`}>
                                {m.priority} NOTICE
                              </span>
                            </div>
                          )}

                          {/* Message Content */}
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {m.content}
                          </p>

                          {/* Attachments List */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-700 space-y-1.5">
                              {m.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                                    isMine 
                                      ? 'bg-primary-700/60 text-white' 
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate font-medium">{att.file_name}</span>
                                    <span className="text-[10px] opacity-75">
                                      ({Math.round(att.file_size_bytes / 1024)} KB)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => alert(`Downloading official document: ${att.file_name}`)}
                                    className="p-1 hover:opacity-80 transition-opacity"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Time & Delivery Status */}
                          <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                            isMine ? 'text-primary-100' : 'text-slate-400'
                          }`}>
                            <span>{formatTime(m.created_at)}</span>
                            {isMine && <Check className="w-3 h-3" />}
                          </div>

                          {/* Quick Reply Action on Hover */}
                          <div className="absolute right-2 -bottom-3 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 shadow-md">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(m)}
                              className="text-slate-500 hover:text-primary-600 text-[10px] flex items-center gap-1"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-slate-500">Replying to <strong className="text-slate-800 dark:text-slate-200">{replyingTo.sender_name}</strong>:</span>
                  <span className="truncate italic text-slate-600 dark:text-slate-400">"{replyingTo.content}"</span>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            )}

            {/* Attachment Bar */}
            {showAttachInput && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Document file name (e.g., Alignment_Clearance_Map.pdf)"
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowAttachInput(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-end gap-2">
                {/* Priority Selector */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className={`h-9 px-2 text-xs rounded-lg border font-semibold focus:outline-none ${
                    selectedPriority === 'CRITICAL' 
                      ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : selectedPriority === 'HIGH'
                      ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Directive</option>
                </select>

                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachInput(!showAttachInput);
                    if (!attachmentName) setAttachmentName('Inspection_Report_Annexure.pdf');
                  }}
                  title="Attach Project Document"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text Area */}
                <textarea
                  rows={1}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={`Write official note or directive...`}
                  className="flex-1 min-h-[38px] max-h-32 py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputContent.trim()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select an Official Conversation
            </h3>
            <p className="text-xs max-w-sm text-slate-500">
              Pick a discussion thread from the left or launch a new working group to coordinate project reviews, land clearances, or engineering quality decisions.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* PANEL 3: INTELLIGENCE & CONTEXTUAL PANEL (RIGHT)          */}
      {/* ========================================================= */}
      {showRightPanel && selectedConversation && (
        <div className="hidden xl:flex w-80 lg:w-88 flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Discussion Intelligence
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowRightPanel(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">

            {/* AI Summary Card */}
            <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  AI Executive Summary
                </span>
                {summaryLoading && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {aiSummary?.summary_text || 'No AI summary generated for this discussion.'}
              </p>

              {/* Key Decisions */}
              {aiSummary?.key_decisions_discussed && aiSummary.key_decisions_discussed.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    Decisions Reached
                  </p>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                    {aiSummary.key_decisions_discussed.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unresolved Risks */}
              {aiSummary?.unresolved_issues && aiSummary.unresolved_issues.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1">
                    Pending Bottlenecks & Risks
                  </p>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                    {aiSummary.unresolved_issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI Extracted Action Directives */}
            {selectedConversation.action_suggestions && selectedConversation.action_suggestions.length > 0 && (
              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 shadow-xs">
                <div className="flex items-center gap-1.5 mb-2 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>AI Extracted Action Directives ({selectedConversation.action_suggestions.length})</span>
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mb-3">
                  Requires explicit ministerial or administrative confirmation before being scheduled.
                </p>

                <div className="space-y-2.5">
                  {selectedConversation.action_suggestions.map((action) => (
                    <div
                      key={action.id}
                      className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-700/60 text-xs shadow-2xs"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {action.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                        <span>Assignee: {action.suggested_assignee_name || 'Designated Officer'}</span>
                        <span>Due: {action.suggested_due_date || '7 Days'}</span>
                      </div>

                      {action.is_confirmed ? (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed Directive ({action.confirmed_action_code})</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmAction(action.id, action.title, action.suggested_assignee_id)}
                          className="w-full py-1 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] transition-colors"
                        >
                          Confirm & Schedule Action Directive
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Project Context */}
            {selectedConversation.related_project_id && (
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Linked Highway Infrastructure
                </h4>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>PROJECT ID</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">#{selectedConversation.related_project_id}</span>
                  </div>
                  {selectedConversation.related_project_name && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 pt-1 font-medium">
                      {selectedConversation.related_project_name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/projects`)}
                    className="w-full mt-2 py-1 text-center text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center justify-center gap-1"
                  >
                    <span>View Projects Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Participants Roster */}
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Participants ({selectedConversation.participants.length})
                </h4>
                <span className="text-[10px] text-slate-400">Official Roster</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedConversation.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {p.full_name[0]}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold truncate text-slate-800 dark:text-slate-200">{p.full_name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{p.designation}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {p.role_in_conversation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NEW DIRECT CHAT USER DIRECTORY                   */}
      {/* ========================================================= */}
      {showNewDirectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                New Direct Official Discussion
              </h3>
              <button type="button" onClick={() => setShowNewDirectModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">
                Select an official from the verified Highways & Allied Departments directory:
              </p>

              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {userDirectory.filter(u => u.id !== user?.id).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartDirectChat(u)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{u.full_name}</p>
                      <p className="text-[11px] text-slate-500">{u.role_name} • {u.department_name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: NEW GROUP CHAT CREATION                          */}
      {/* ========================================================= */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateGroupChat} className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Government Working Group
              </h3>
              <button type="button" onClick={() => setShowNewGroupModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Working Group Title
                </label>
                <input
                  type="text"
                  required
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="e.g. Chennai-Kanyakumari Corridor Land Taskforce"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="PROJECT_WORKING_GROUP">Project Working Group</option>
                  <option value="DEPARTMENT_WORKING_GROUP">Department Working Group</option>
                  <option value="PROGRAMME_REVIEW">Programme Review</option>
                  <option value="CIRCLE_DIVISION">Circle / Division</option>
                  <option value="CONTRACTOR_COORDINATION">Contractor Coordination</option>
                  <option value="LAND_ACQUISITION">Land Acquisition</option>
                  <option value="UTILITY_SHIFTING">Utility Shifting</option>
                  <option value="QUALITY_ASSURANCE">Quality Assurance</option>
                  <option value="LEGAL_DISPUTE">Legal / Dispute</option>
                  <option value="COMMITTEE_REVIEW">Committee Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Participants ({selectedUserIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1">
                  {userDirectory.filter(u => u.id !== user?.id).map((u) => {
                    const isChecked = selectedUserIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds(prev => [...prev, u.id]);
                            } else {
                              setSelectedUserIds(prev => prev.filter(id => id !== u.id));
                            }
                          }}
                          className="rounded text-primary-600"
                        />
                        <div className="flex-1 truncate">
                          <span className="font-semibold">{u.full_name}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({u.role_name} - {u.department_name})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newGroupTitle.trim() || selectedUserIds.length === 0}
                className="px-4 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Create Working Group
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
