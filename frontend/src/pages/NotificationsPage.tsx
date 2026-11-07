import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  FolderGit2,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  CheckCheck,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  Building2,
  User,
  SlidersHorizontal,
  X,
  FileText,
  Scale,
  Award,
  HardHat,
  Briefcase,
  CircleDollarSign,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';
import {
  NotificationItem,
  AIPriorityBriefingItem,
  NotificationSummary,
  NotificationPreference
} from '../types';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { id: 'ALL', label: 'All Notifications', icon: Layers },
  { id: 'PROJECT_UPDATE', label: 'Project Updates', icon: FolderGit2 },
  { id: 'ADMIN_DECISION', label: 'Administrative Decisions', icon: Building2 },
  { id: 'APPROVAL', label: 'Approvals', icon: CheckCircle },
  { id: 'LAND_ACQUISITION', label: 'Land Acquisition', icon: MapPin },
  { id: 'UTILITY_SHIFTING', label: 'Utility Shifting', icon: Layers },
  { id: 'FINANCE', label: 'Finance & Payments', icon: CircleDollarSign },
  { id: 'CONTRACTOR', label: 'Contractors', icon: Briefcase },
  { id: 'QUALITY', label: 'Quality & Testing', icon: Award },
  { id: 'FIELD_OPS', label: 'Field Operations', icon: HardHat },
  { id: 'LEGAL', label: 'Legal & Court', icon: Scale },
  { id: 'CITIZEN_GRIEVANCE', label: 'Citizen Grievances', icon: HeartHandshake },
  { id: 'MEETING', label: 'Meetings & Reviews', icon: Calendar },
  { id: 'DOCUMENT', label: 'Documents & Orders', icon: FileText },
  { id: 'AI_INTELLIGENCE', label: 'AI Intelligence', icon: Sparkles },
  { id: 'SYSTEM', label: 'System & Security', icon: Shield }
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNavyGov } = useTheme();

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [briefings, setBriefings] = useState<AIPriorityBriefingItem[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'SAVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [activeBriefingTab, setActiveBriefingTab] = useState<number>(0);

  // Modal State for Statutory Acknowledgment
  const [ackModalItem, setAckModalItem] = useState<NotificationItem | null>(null);
  const [ackRemarks, setAckRemarks] = useState<string>('');
  const [ackSubmitting, setAckSubmitting] = useState<boolean>(false);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifsData, briefingsData, summaryData] = await Promise.all([
        api.getNotifications({ limit: 100 }),
        api.getAIPriorityBriefing(),
        api.getNotificationSummary()
      ]);
      setNotifications(notifsData || []);
      setBriefings(briefingsData || []);
      setSummary(summaryData || null);
    } catch (err) {
      console.error('Failed to load notifications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;
      if (readFilter === 'UNREAD' && item.is_read) return false;
      if (readFilter === 'READ' && !item.is_read) return false;
      if (readFilter === 'SAVED' && !item.is_saved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchProj = (item.project_name || '').toLowerCase().includes(q);
        const matchDept = (item.department_name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchProj && !matchDept) return false;
      }
      return true;
    });
  }, [notifications, selectedCategory, selectedPriority, readFilter, searchQuery]);

  // Actions
  const handleToggleRead = async (item: NotificationItem) => {
    try {
      if (item.is_read) {
        await api.markNotificationUnread(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: false } : n))
        );
      } else {
        await api.markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      }
      const newSummary = await api.getNotificationSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to update read state:', err);
    }
  };

  const handleToggleSave = async (item: NotificationItem) => {
    try {
      const res = await api.toggleSaveNotification(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_saved: res.is_saved } : n))
      );
    } catch (err) {
      console.error('Failed to toggle save state:', err);
    }
  };

  const handleAddToCalendar = async (item: NotificationItem) => {
    try {
      const res = await api.addNotificationToCalendar(item.id);
      alert(`Event successfully scheduled on Calendar: ${res.event_code}`);
    } catch (err) {
      console.error('Failed to add to calendar:', err);
      alert('Failed to add to calendar');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      const newSummary = await api.getNotificationSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleOpenAcknowledgeModal = (item: NotificationItem) => {
    setAckModalItem(item);
    setAckRemarks('');
  };

  const handleConfirmAcknowledge = async () => {
    if (!ackModalItem) return;
    setAckSubmitting(true);
    try {
      await api.acknowledgeNotification(ackModalItem.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === ackModalItem.id
            ? { ...n, is_acknowledged: true, is_read: true, acknowledged_at: 'Just now' }
            : n
        )
      );
      setAckModalItem(null);
      const newSummary = await api.getNotificationSummary();
      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to acknowledge notification:', err);
    } finally {
      setAckSubmitting(false);
    }
  };

  const handleNavigateDeepLink = (route?: string) => {
    if (!route) return;
    if (route.startsWith('#')) {
      const cleanRoute = route.substring(1);
      navigate(cleanRoute);
    } else {
      navigate(route);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-300';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300';
      case 'LOW':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300';
      default:
        return 'bg-slate-500/15 text-slate-700 border-slate-500/40 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const found = CATEGORIES.find((c) => c.id === category);
    if (!found || found.id === 'ALL') return Layers;
    return found.icon;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Intelligent Notification & Alert Centre
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Deterministic Role-Based Signals, AI Priority Briefings & Statutory Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={() => setShowPreferences(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Unified Calendar</span>
          </button>
        </div>
      </div>

      {/* 8-Metric Live Operational Summary Card Matrix */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block truncate">Total</span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {summary.total_notifications}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">Unread</span>
            <div className="text-base sm:text-lg font-bold font-mono text-blue-700 dark:text-blue-300 mt-0.5">
              {summary.unread_notifications}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider block truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Critical
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-red-700 dark:text-red-300 mt-0.5">
              {summary.critical_alerts}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">High Priority</span>
            <div className="text-base sm:text-lg font-bold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
              {summary.high_priority_alerts}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider block truncate">Pending Actions</span>
            <div className="text-base sm:text-lg font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
              {summary.pending_actions}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">Meetings</span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
              {summary.upcoming_meetings}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider block truncate">Overdue</span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-700 dark:text-rose-300 mt-0.5">
              {summary.overdue_tasks}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block truncate">Projects Updated</span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {summary.recently_updated_projects}
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: AI-PRIORITISED NOTIFICATION PANEL ("Your Priority Briefing") */}
      {briefings && briefings.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-950 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Your Priority Briefing</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                    Deterministic AI Synthesis
                  </span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Critical actions and risk items ranked by project impact, statutory SLA proximity, and authority level.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Grounding: Verified Audit Trails & e-MB Records
            </div>
          </div>

          {/* Carousel / Tab selector for top briefings */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {briefings.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setActiveBriefingTab(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all border ${
                  activeBriefingTab === idx
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono mr-1.5">#{idx + 1}</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px] inline-block align-bottom">{b.title}</span>
              </button>
            ))}
          </div>

          {/* Active Priority Briefing Card */}
          {briefings[activeBriefingTab] && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${getPriorityBadgeClass(briefings[activeBriefingTab].priority)}`}>
                      {briefings[activeBriefingTab].priority}
                    </span>
                    {briefings[activeBriefingTab].project_name && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {briefings[activeBriefingTab].project_name}
                      </span>
                    )}
                    {briefings[activeBriefingTab].department_name && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {briefings[activeBriefingTab].department_name}
                      </span>
                    )}
                    {briefings[activeBriefingTab].is_statutory_mandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 dark:text-amber-300">
                        Statutory Retention Mandatory
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {briefings[activeBriefingTab].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {briefings[activeBriefingTab].short_explanation}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleNavigateDeepLink(briefings[activeBriefingTab].target_route)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Open Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {briefings[activeBriefingTab].is_statutory_mandatory && !briefings[activeBriefingTab].is_acknowledged && (
                    <button
                      onClick={() => {
                        const notif = notifications.find((n) => n.id === briefings[activeBriefingTab].id);
                        if (notif) handleOpenAcknowledgeModal(notif);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Statutory Sign-off</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3-Column AI Analysis Detail Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Why This Is Important
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {briefings[activeBriefingTab].why_important}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 space-y-1">
                  <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Potential Impact
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {briefings[activeBriefingTab].potential_impact}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-1">
                  <div className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Required Action & Deadline
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {briefings[activeBriefingTab].required_action}
                  </p>
                  <div className="pt-1 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">
                    Deadline: {briefings[activeBriefingTab].deadline}
                  </div>
                </div>
              </div>

              {/* Provenance footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-1 font-mono">
                <div>
                  Evidence: <span className="text-slate-700 dark:text-slate-300">{briefings[activeBriefingTab].evidence_source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Confidence: {(briefings[activeBriefingTab].confidence_score * 100).toFixed(0)}%</span>
                  <span>•</span>
                  <span>Updated: {briefings[activeBriefingTab].last_updated}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        {/* Category Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Informational</option>
            </select>

            {/* Read / Unread / Saved Filter */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setReadFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  readFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReadFilter('UNREAD')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  readFilter === 'UNREAD'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setReadFilter('SAVED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  readFilter === 'SAVED'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Saved
              </button>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredNotifications.length} of {notifications.length}
            </span>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts, projects, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Notification Card List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading role-targeted notifications and telemetry...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/70" />
            <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No matching notifications found
            </div>
            <p className="text-xs text-slate-400">
              Try adjusting your category, priority, or search filters.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const CatIcon = getCategoryIcon(notif.category);
            return (
              <div
                key={notif.id}
                className={`group rounded-xl border transition-all p-4 ${
                  notif.is_read
                    ? 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                    : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Icon & Notification content */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        notif.priority === 'CRITICAL'
                          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:border-red-800'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                          : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
                      }`}
                    >
                      <CatIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" title="Unread alert" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadgeClass(notif.priority)}`}>
                          {notif.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          {notif.category.replace('_', ' ')}
                        </span>
                        {notif.is_acknowledged && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Acknowledged
                          </span>
                        )}
                        {notif.is_statutory_mandatory && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                            Statutory Notice
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Meta Context Badges */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                        {notif.project_name && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <FolderGit2 className="w-3 h-3 text-slate-400" />
                            {notif.project_name}
                          </span>
                        )}
                        {notif.department_name && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {notif.department_name}
                          </span>
                        )}
                        {notif.responsible_officer_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {notif.responsible_officer_name}
                          </span>
                        )}
                        {notif.due_date && (
                          <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="w-3 h-3" />
                            Due: {notif.due_date}
                          </span>
                        )}
                        <span>{notif.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleNavigateDeepLink(notif.target_route)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
                      title="Navigate to primary record screen"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleRead(notif)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        notif.is_read
                          ? 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          : 'border-blue-300 dark:border-blue-700 text-blue-600 hover:bg-blue-50'
                      }`}
                      title={notif.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      aria-label="Toggle read status"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleSave(notif)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        notif.is_saved
                          ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Save notification"
                      aria-label="Save notification"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleAddToCalendar(notif)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Schedule on Calendar"
                      aria-label="Schedule on Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>

                    {notif.is_statutory_mandatory && !notif.is_acknowledged && (
                      <button
                        onClick={() => handleOpenAcknowledgeModal(notif)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Statutory Acknowledgment Modal */}
      {ackModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Statutory Notice Acknowledgment
                  </h3>
                  <p className="text-xs text-slate-500">Official Gazetted Compliance Sign-off</p>
                </div>
              </div>
              <button
                onClick={() => setAckModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                {ackModalItem.title}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {ackModalItem.message}
              </p>
              <div className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                Notice Ref: {ackModalItem.source_record_id || 'STAT-NOTICE'}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Acknowledgment Remarks & Action Plan
              </label>
              <textarea
                rows={3}
                placeholder="Enter departmental remarks, designated officer compliance notes, or file movement references..."
                value={ackRemarks}
                onChange={(e) => setAckRemarks(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Note: This action creates an immutable audit trail entry stamped with your official persona credentials and UTC timestamp.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAckModalItem(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcknowledge}
                disabled={ackSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{ackSubmitting ? 'Recording...' : 'Record Statutory Sign-off'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-300">
                  <SlidersHorizontal className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Notification Delivery Preferences
                  </h3>
                  <p className="text-xs text-slate-500">Configure alert channels and quiet hours</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">In-App Live Alerts</div>
                  <div className="text-[11px] text-slate-500">Surface real-time operational notifications in top banner</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">AI Daily Morning Briefing</div>
                  <div className="text-[11px] text-slate-500">Include synthesized daily priority briefing on dashboard</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Email Digest Delivery</div>
                  <div className="text-[11px] text-slate-500">Government Mail Server (NIC e-Mail Gateway simulated)</div>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Quiet Hours Window</div>
                <div className="text-[11px] text-slate-500">Suppress non-critical notifications during designated off-duty hours. Statutory & Critical safety alerts bypass quiet hours.</div>
                <div className="flex items-center gap-3 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block">From</label>
                    <input type="text" defaultValue="22:00" className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block">To</label>
                    <input type="text" defaultValue="06:00" className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
