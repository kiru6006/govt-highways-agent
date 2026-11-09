import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Bell, HelpCircle, Palette, ChevronDown, Check, 
  MessageSquare, Calendar, Menu, X, Network, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEME_CONFIGS, ThemeMode } from '../context/ThemeContext';
import { api } from '../services/api';
import { UniversalSearchResultItem } from '../types';

interface HeaderProps {
  currentModuleName?: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentModuleName = 'TN-HDOS Master Platform',
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchPersona } = useAuth();
  const { theme, setTheme, isNavyGov } = useTheme();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UniversalSearchResultItem[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [unreadNotifications] = useState<number>(3);
  const [unreadMessages, setUnreadMessages] = useState<number>(4);
  const [displayBadge, setDisplayBadge] = useState<string>('4');

  const personaRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const personas = [
    { username: 'cm', label: "Hon'ble Chief Minister (Thiru C. Joseph Vijay)", role: 'Chief Minister of Tamil Nadu' },
    { username: 'minister', label: "Hon'ble Minister (Thiru Aadhav Arjuna)", role: 'Minister for Public Works & Sports Dev' },
    { username: 'secretary', label: 'Principal Secretary (Thiru Shunchonngam Jatak Chiru, IAS)', role: 'Principal Secretary to Government' },
    { username: 'admin', label: 'System Admin (Statewide)', role: 'State Administrator' },
    { username: 'chief_eng', label: 'Chief Engineer (Er. S. Palanivel)', role: 'CE (H) C&M Chennai Region' },
    { username: 'se_chengalpattu', label: 'Superintending Engineer (Er. M. Rajendran)', role: 'SE (H) Chengalpattu Circle' },
    { username: 'ee_tambaram', label: 'Divisional Engineer (Er. P. Anandhan)', role: 'DE (H) Tambaram Division' },
    { username: 'contractor_lt', label: 'Contractor L&T (V. Ramakrishnan)', role: 'Contractor (PRJ-TN-2026-001 only)' },
    { username: 'contractor_pst', label: 'Contractor PST (T. Shanmugam)', role: 'Contractor (PRJ-TN-2026-002 only)' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count for current user
  useEffect(() => {
    let isMounted = true;
    const fetchUnreads = async () => {
      try {
        const msgRes = await api.getMessagingUnreadCount();
        if (isMounted && msgRes) {
          setUnreadMessages(msgRes.total_unread_messages);
          setDisplayBadge(msgRes.display_badge);
        }
      } catch {
        // Fallback to initial count
      }
    };
    fetchUnreads();
    const interval = setInterval(fetchUnreads, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.universalSearch(searchQuery.trim());
          setSearchResults(res.results || []);
          setSearchDropdownOpen(true);
        } catch {
          setSearchResults([]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setSearchDropdownOpen(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
    }
  };

  const handleSelectPersona = (uname: string) => {
    switchPersona(uname);
    setPersonaMenuOpen(false);
  };

  const isMessagesActive = location.pathname.startsWith('/messages');
  const isNotificationsActive = location.pathname.startsWith('/notifications');
  const isCalendarActive = location.pathname.startsWith('/calendar');

  const activePersonaObj = personas.find(p => p.username === user?.username) || {
    label: user?.full_name || 'Government Official',
    role: user?.role_name || 'Highways Department'
  };

  return (
    <>
      <header className={`sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 border-b transition-colors ${
        isNavyGov 
          ? 'bg-[#0A192F] border-[#1E3A5F] text-slate-100' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
      }`}>
        
        {/* Left: Hamburger + Module Name + Desktop Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          {/* Hamburger Sidebar Toggle */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Module Title / Breadcrumb */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 hidden sm:block">
              TN-HDOS
            </span>
            <span className="text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs">
              {currentModuleName}
            </span>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 relative ml-2">
            <label htmlFor="top-global-search" className="sr-only">Search projects, packages, contractors, or messages</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="top-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, packages, files, messages..."
              className={`w-full pl-9 pr-10 py-1.5 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 border transition-all ${
                isNavyGov
                  ? 'bg-[#0F2744] border-[#1E4673] text-white placeholder-slate-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
              }`}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-700 rounded">
              ⌘K
            </kbd>

            {/* Universal Cross-Entity Search Results Dropdown */}
            {searchDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50 p-2 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Universal Entity Matches ({searchResults.length})</span>
                  <span className="text-emerald-600 font-semibold">Everything Connected</span>
                </div>
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigate(item.route);
                      setSearchQuery('');
                      setSearchDropdownOpen(false);
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.entity_type}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{item.code}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.connection_count} links
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Right: Compact Icon-Only Action Row */}
        {/* Strict Order: 1. Search (Mobile), 2. Notifications, 3. Calendar, 4. Messages, 5. Help, 6. Theme, 7. Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5">

          {/* 1. Mobile Search Trigger */}
          <div className="relative group md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Open Search"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Search
            </div>
          </div>

          {/* 2. Notifications Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label={`Notifications (${unreadNotifications} unread)`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isNotificationsActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Notifications {unreadNotifications > 0 && `(${unreadNotifications} unread)`}
            </div>
          </div>

          {/* 3. Calendar Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              aria-label="Unified Highways Calendar"
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isCalendarActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Calendar & Deadlines
            </div>
          </div>

          {/* 4. Messages Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => navigate('/messages')}
              aria-label={`Official Discussions and Messages (${displayBadge} unread)`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isMessagesActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-white dark:ring-slate-900 shadow-sm">
                  {displayBadge}
                </span>
              )}
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Discussions {unreadMessages > 0 && `(${displayBadge} unread)`}
            </div>
          </div>

          {/* 5. Help Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              aria-label="Department SOP and Guidelines"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Help & Guidelines
            </div>
          </div>

          {/* 6. Theme Switcher */}
          <div className="relative group" ref={themeRef}>
            <button
              type="button"
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              aria-label="Switch UI Color Theme"
              aria-expanded={themeMenuOpen}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div role="tooltip" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              Theme ({THEME_CONFIGS[theme]?.name})
            </div>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Government Design System
                  </p>
                </div>
                <div className="p-1 space-y-0.5">
                  {(Object.keys(THEME_CONFIGS) as ThemeMode[]).map((mode) => {
                    const cfg = THEME_CONFIGS[mode];
                    const isSelected = theme === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          setTheme(mode);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" 
                            style={{ backgroundColor: cfg.primaryColor }}
                          />
                          <div className="text-left">
                            <p className="font-medium">{cfg.name}</p>
                            <p className="text-[10px] text-slate-400">{cfg.badge}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* 7. Profile / Persona Menu */}
          <div className="relative group" ref={personaRef}>
            <button
              type="button"
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              aria-label={`Official Identity: ${activePersonaObj.label}`}
              aria-expanded={personaMenuOpen}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-primary-500/20">
                  {activePersonaObj.label.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden xl:flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                  {activePersonaObj.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
                  {activePersonaObj.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>
            <div role="tooltip" className="pointer-events-none absolute right-0 top-full mt-1.5 hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 rounded shadow-lg whitespace-nowrap">
              {activePersonaObj.label} • {activePersonaObj.role}
            </div>

            {/* Persona Switcher Dropdown */}
            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Current Official Identity
                  </p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {activePersonaObj.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activePersonaObj.role}
                  </p>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Persona (RBAC Simulation)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                    Govt Mode
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 divide-y divide-slate-100 dark:divide-slate-700/50">
                  {personas.map((p) => {
                    const isCurrent = p.username === user?.username;
                    return (
                      <button
                        key={p.username}
                        onClick={() => handleSelectPersona(p.username)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-950 dark:text-primary-100 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shrink-0">
                          {p.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold truncate">{p.label}</p>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {p.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <button
                    type="button"
                    onClick={() => {
                      setPersonaMenuOpen(false);
                      navigate('/messages');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/60 dark:hover:bg-primary-900/60 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Go to Official Discussions</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Slide-down Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-b px-4 py-2.5 z-20 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, packages, messages..."
              className="w-full rounded-lg pl-9 pr-9 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Help & SOP Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Government Operating Guidelines & SOP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong>Tamil Nadu Highways Department Operations System (TN-HDOS)</strong> provides integrated project tracking, financial monitoring, and AI decision intelligence.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Key Keyboard Shortcuts:</p>
                <p>• <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">⌘K</kbd> / <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Ctrl+K</kbd>: Global Search</p>
                <p>• Top Right Icons: Quick navigation to Notifications, Calendar, Discussions, Theme, and RBAC Persona Switcher.</p>
              </div>
              <p className="text-[11px] text-slate-400">
                Official queries can be escalated through the <em>Discussions</em> workspace or logged in <em>Digital Office</em>.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
