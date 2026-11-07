import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  User,
  Users,
  Building2,
  FolderGit2,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Check,
  Send,
  Scale,
  Award,
  HardHat,
  Briefcase,
  CircleDollarSign,
  HeartHandshake,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import {
  CalendarEventItem,
  CalendarParticipantItem,
  MeetingActionItemDetail,
  TodayScheduleData
} from '../types';
import { useTheme } from '../context/ThemeContext';

type ViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';

const EVENT_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'MINISTERIAL_REVIEW', label: 'Ministerial Reviews' },
  { id: 'SECRETARY_COORDINATION', label: 'Secretary Coordination' },
  { id: 'CHIEF_ENGINEER_MEETING', label: 'Chief Engineer Meetings' },
  { id: 'PROJECT_REVIEW', label: 'Project Reviews' },
  { id: 'SITE_INSPECTION', label: 'Site Inspections' },
  { id: 'FIELD_VISIT', label: 'Field Visits' },
  { id: 'CONTRACTOR_MEETING', label: 'Contractor Meetings' },
  { id: 'LAND_ACQUISITION_DEADLINE', label: 'Land Acquisition' },
  { id: 'UTILITY_COORDINATION', label: 'Utility Coordination' },
  { id: 'COURT_HEARING', label: 'Court Hearings' },
  { id: 'STATUTORY_DEADLINE', label: 'Statutory Deadlines' },
  { id: 'QUALITY_INSPECTION', label: 'Quality Inspections' },
  { id: 'GRIEVANCE_REVIEW', label: 'Grievance Reviews' },
  { id: 'OFFICE_ACTION_DEADLINE', label: 'Action Deadlines' }
];

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { isNavyGov } = useTheme();

  // State
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // View & Filter State
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 1)); // Default to May 2026 per dataset
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [myCalendarOnly, setMyCalendarOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showMoMModal, setShowMoMModal] = useState<boolean>(false);
  const [newEventPayload, setNewEventPayload] = useState({
    title: '',
    event_category: 'PROJECT_REVIEW',
    start_time: '2026-05-15T10:00:00',
    end_time: '2026-05-15T12:00:00',
    venue_or_url: 'Secretariat Conference Hall',
    is_virtual: false,
    agenda: '',
    preparation_notes: '',
    priority: 'HIGH'
  });

  const [momPayload, setMomPayload] = useState({
    minutes_of_meeting: '',
    decisions_summary: '',
    action_title: '',
    action_officer: '',
    action_due: '2026-05-25'
  });

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventsData, todayData] = await Promise.all([
        api.getCalendarEvents({
          category: categoryFilter,
          priority: priorityFilter,
          my_calendar: myCalendarOnly,
          search: searchQuery
        }),
        api.getTodaySchedule()
      ]);
      setEvents(eventsData || []);
      setTodaySchedule(todayData || null);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [categoryFilter, priorityFilter, myCalendarOnly, searchQuery]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 4, 7)); // Simulated current May 2026 date
  };

  // RSVP Action
  const handleRSVP = async (eventId: number, status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    try {
      await api.updateEventRSVP(eventId, status);
      const updated = await api.getCalendarEventDetail(eventId);
      setSelectedEvent(updated);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    } catch (err) {
      console.error('Failed to update RSVP:', err);
    }
  };

  // Schedule Event Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCalendarEvent(newEventPayload);
      setShowScheduleModal(false);
      loadEvents();
      setSelectedEvent(created);
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to schedule meeting');
    }
  };

  // Record MoM Submit
  const handleRecordMoM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      const actions = momPayload.action_title
        ? [
            {
              title: momPayload.action_title,
              description: 'Follow-up requirement from official meeting',
              responsible_officer_name: momPayload.action_officer || 'Assigned Engineer',
              due_date: `${momPayload.action_due}T18:00:00`,
              priority: 'HIGH'
            }
          ]
        : [];

      const updated = await api.recordMeetingMinutes(selectedEvent.id, {
        minutes_of_meeting: momPayload.minutes_of_meeting,
        decisions_summary: momPayload.decisions_summary,
        status: 'CONCLUDED',
        action_items: actions
      });

      setSelectedEvent(updated);
      setEvents((prev) => prev.map((ev) => (ev.id === selectedEvent.id ? updated : ev)));
      setShowMoMModal(false);
    } catch (err) {
      console.error('Failed to record minutes:', err);
    }
  };

  // Calendar Month Grid Generator
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding from prev month
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateStr: '' });
    }
    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ dayNumber: day, isCurrentMonth: true, dateStr });
    }
    return days;
  }, [currentDate]);

  // Event category color mapping
  const getEventCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'MINISTERIAL_REVIEW':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
      case 'SECRETARY_COORDINATION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'COURT_HEARING':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200';
      case 'QUALITY_INSPECTION':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'CONTRACTOR_MEETING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'LAND_ACQUISITION_DEADLINE':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Unified Highways Calendar & Meeting Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Departmental Reviews, Court Hearings, Site Inspections & Action Item Deadlines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => navigate('/notifications')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Alerts & Notifications</span>
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule Quick Strip */}
      {todaySchedule && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-600 text-white font-bold">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{todaySchedule.today_date}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {todaySchedule.total_events_today} Scheduled Events
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {todaySchedule.overdue_action_items_count > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    {todaySchedule.overdue_action_items_count} Overdue Meeting Action Items Require Urgent Compliance
                  </span>
                ) : (
                  'All scheduled actions complying with SLA deadlines'
                )}
              </div>
            </div>
          </div>

          {/* Quick list of today's events */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full md:max-w-xl">
            {todaySchedule.events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  const full = events.find((e) => e.id === ev.id);
                  if (full) setSelectedEvent(full);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[11px] font-medium whitespace-nowrap cursor-pointer hover:border-blue-400 transition-colors shadow-xs flex items-center gap-1.5 flex-shrink-0"
              >
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{ev.time.split(' ')[0]}</span>
                <span className="truncate max-w-[150px]">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Strip: Month / Week / Day / Agenda switcher + Month Navigator + Filters */}
      <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Navigator: Prev / Next / Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={handlePrev}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous date range"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l border-slate-300 dark:border-slate-700"
                aria-label="Next date range"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pl-1">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
              {(['MONTH', 'WEEK', 'DAY', 'AGENDA'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* My Calendar Toggle */}
            <button
              onClick={() => setMyCalendarOnly(!myCalendarOnly)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                myCalendarOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Schedule</span>
            </button>
          </div>
        </div>

        {/* Filter dropdowns and search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <span className="text-slate-500 text-[11px]">
              {events.length} Events Listed
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search meetings, venue, agenda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main View Area: Month / Week / Day / Agenda */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {viewMode === 'MONTH' && (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase text-center py-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              {monthDays.map((d, idx) => {
                const dayEvents = d.isCurrentMonth
                  ? events.filter((e) => e.start_time.startsWith(d.dateStr))
                  : [];

                const isToday = d.dateStr === '2026-05-07';

                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] sm:min-h-[115px] p-1.5 transition-colors ${
                      !d.isCurrentMonth
                        ? 'bg-slate-50/40 dark:bg-slate-950/20'
                        : isToday
                        ? 'bg-blue-50/20 dark:bg-blue-950/10'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {d.dayNumber && (
                      <div className="flex items-center justify-between pb-1">
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Day event pills */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1 rounded text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] border ${getEventCategoryBadge(
                            ev.event_category
                          )}`}
                          title={`${ev.title} (${new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                        >
                          <span className="font-mono mr-1">
                            {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'AGENDA' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-4 space-y-3">
            {events.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No calendar events match the active filters.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 transition-all cursor-pointer shadow-xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getEventCategoryBadge(ev.event_category)}`}>
                          {ev.event_category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {new Date(ev.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        {ev.priority === 'CRITICAL' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Critical
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          ev.status === 'CONCLUDED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {ev.status}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {ev.agenda}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-1 flex-shrink-0 text-xs text-slate-500">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{ev.organiser_name}</span>
                      <span className="text-[11px] text-slate-400">{ev.venue_or_url}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 flex-wrap">
                    {ev.related_project_name && (
                      <span className="flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3 text-slate-400" />
                        {ev.related_project_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {ev.participants.length} Attendees
                    </span>
                    {ev.action_items.length > 0 && (
                      <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {ev.action_items.length} Action Items Tracked
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {(viewMode === 'WEEK' || viewMode === 'DAY') && (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-blue-500/70" />
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {viewMode === 'WEEK' ? 'Week Timeline View Active' : 'Daily Hourly Schedule Active'}
            </div>
            <p className="max-w-md mx-auto text-slate-400">
              Showing time-blocked event slots for {currentDate.toLocaleDateString()}. Use the Agenda view for complete tabular details or Month view for master calendar inspection.
            </p>
            <button
              onClick={() => setViewMode('AGENDA')}
              className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              Switch to Agenda List
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Event Detail Drawer / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl overflow-y-auto space-y-4">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getEventCategoryBadge(selectedEvent.event_category)}`}>
                    {selectedEvent.event_category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Ref: {selectedEvent.event_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedEvent.status === 'CONCLUDED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time, Venue & Organiser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Schedule</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {new Date(selectedEvent.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Venue / Mode</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate">
                  {selectedEvent.is_virtual ? <Video className="w-3.5 h-3.5 text-purple-500" /> : <MapPin className="w-3.5 h-3.5 text-red-500" />}
                  <span className="truncate">{selectedEvent.venue_or_url}</span>
                </div>
              </div>

              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Organiser</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedEvent.organiser_name}</span>
                  <span className="text-slate-400 text-[11px]">({selectedEvent.organiser_role})</span>
                </div>
              </div>
            </div>

            {/* RSVP Quick Actions */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Your Attendance RSVP
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRSVP(selectedEvent.id, 'ACCEPTED')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Invitation</span>
                </button>
                <button
                  onClick={() => handleRSVP(selectedEvent.id, 'DECLINED')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleRSVP(selectedEvent.id, 'TENTATIVE')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Tentative
                </button>
              </div>
            </div>

            {/* Agenda & Preparation Notes */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Official Meeting Agenda
              </div>
              <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedEvent.agenda}
              </p>

              {selectedEvent.preparation_notes && (
                <div className="space-y-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-400 text-[11px]">
                    Required Preparation & Submissions:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {selectedEvent.preparation_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Required Documents */}
            {selectedEvent.required_documents && selectedEvent.required_documents.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Required Documents & Briefings
                </div>
                <div className="space-y-1">
                  {selectedEvent.required_documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{doc}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">PDF Dossier</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants Register */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Invited Officials ({selectedEvent.participants.length})</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">Attendance Status</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedEvent.participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{p.official_name}</div>
                      <div className="text-slate-500">{p.official_role} • {p.department_name}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                      p.invitation_status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : p.invitation_status === 'DECLINED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {p.invitation_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes & Action Items Section */}
            {selectedEvent.minutes_of_meeting ? (
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Official Minutes of Meeting (MoM)
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {selectedEvent.minutes_of_meeting}
                </div>
                {selectedEvent.decisions_summary && (
                  <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                    <span className="font-semibold text-blue-900 dark:text-blue-300 block">Decisions Recorded:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedEvent.decisions_summary}</span>
                  </div>
                )}

                {/* Tracked Action Items */}
                {selectedEvent.action_items.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Follow-up Action Items
                    </div>
                    {selectedEvent.action_items.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                            {act.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">{act.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span>Assigned: {act.responsible_officer_name}</span>
                          <span>Due: {act.due_date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowMoMModal(true)}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Record Minutes of Meeting (MoM) & Decisions</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-600 text-white">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Schedule Official Review / Meeting
                  </h3>
                  <p className="text-xs text-slate-500">Add to departmental calendar and notify attendees</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Western Corridor Utility Shifting Progress Review"
                  value={newEventPayload.title}
                  onChange={(e) => setNewEventPayload({ ...newEventPayload, title: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Category
                  </label>
                  <select
                    value={newEventPayload.event_category}
                    onChange={(e) => setNewEventPayload({ ...newEventPayload, event_category: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    {EVENT_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newEventPayload.priority}
                    onChange={(e) => setNewEventPayload({ ...newEventPayload, priority: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventPayload.start_time}
                    onChange={(e) => setNewEventPayload({ ...newEventPayload, start_time: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventPayload.end_time}
                    onChange={(e) => setNewEventPayload({ ...newEventPayload, end_time: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Venue / Meeting URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="Secretariat Committee Room / Webex Link"
                  value={newEventPayload.venue_or_url}
                  onChange={(e) => setNewEventPayload({ ...newEventPayload, venue_or_url: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Agenda & Objectives
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail meeting purpose, points of discussion, and deliverables..."
                  value={newEventPayload.agenda}
                  onChange={(e) => setNewEventPayload({ ...newEventPayload, agenda: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create & Notify Attendees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record MoM Modal */}
      {showMoMModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-600 text-white">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Record Minutes of Meeting (MoM)
                  </h3>
                  <p className="text-xs text-slate-500">{selectedEvent.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoMModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordMoM} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Minutes of Meeting Summary
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record discussions, observations, objections, and progress review details..."
                  value={momPayload.minutes_of_meeting}
                  onChange={(e) => setMomPayload({ ...momPayload, minutes_of_meeting: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Decisions Taken
                </label>
                <textarea
                  rows={2}
                  placeholder="Official resolutions, approvals given, or sanctions recorded..."
                  value={momPayload.decisions_summary}
                  onChange={(e) => setMomPayload({ ...momPayload, decisions_summary: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wide">
                  Assign Follow-up Action Item
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Action item title (e.g., Submit revised hydraulic drawings)"
                    value={momPayload.action_title}
                    onChange={(e) => setMomPayload({ ...momPayload, action_title: e.target.value })}
                    className="w-full p-1.5 border rounded bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Responsible officer"
                    value={momPayload.action_officer}
                    onChange={(e) => setMomPayload({ ...momPayload, action_officer: e.target.value })}
                    className="p-1.5 border rounded bg-white dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="date"
                    value={momPayload.action_due}
                    onChange={(e) => setMomPayload({ ...momPayload, action_due: e.target.value })}
                    className="p-1.5 border rounded bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMoMModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign & Circulate MoM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
