import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Shield, ChevronDown, UserCheck, RefreshCw, AlertCircle, Menu, Palette, Check } from 'lucide-react';

interface HeaderProps {
  currentModuleName: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentModuleName, onToggleSidebar, isSidebarCollapsed }) => {
  const { user, switchPersona } = useAuth();
  const { theme, setTheme, isNavyGov } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const personas = [
    { username: 'minister', label: "Hon'ble Minister (Thiru Aadhav Arjuna)", role: 'Minister for Public Works & Sports Dev' },
    { username: 'secretary', label: 'Principal Secretary (Thiru Shunchonngam Jatak Chiru, IAS)', role: 'Principal Secretary to Government' },
    { username: 'admin', label: 'System Admin (Statewide)', role: 'State Administrator' },
    { username: 'chief_eng', label: 'Chief Engineer (Er. S. Palanivel)', role: 'CE (H) C&M Chennai Region' },
    { username: 'se_chengalpattu', label: 'Superintending Engineer (Er. M. Rajendran)', role: 'SE (H) Chengalpattu Circle' },
    { username: 'ee_tambaram', label: 'Divisional Engineer (Er. P. Anandhan)', role: 'DE (H) Tambaram Division' },
    { username: 'contractor_lt', label: 'Contractor L&T (V. Ramakrishnan)', role: 'Contractor (PRJ-TN-2026-001 only)' },
    { username: 'contractor_pst', label: 'Contractor PST (T. Shanmugam)', role: 'Contractor (PRJ-TN-2026-002 only)' },
  ];

  const handleSelectPersona = (uname: string) => {
    switchPersona(uname);
    setDropdownOpen(false);
  };

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors duration-200 ${
        isNavyGov
          ? 'bg-[#0F2A4A] border-[#1A3E66] text-white theme-header'
          : 'bg-white border-gov-border text-slate-900'
      }`}
    >
      {/* Brand & Module */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-colors mr-1 ${
              isNavyGov
                ? 'text-slate-300 hover:text-white hover:bg-[#14355B]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className={`w-5 h-5 ${isNavyGov ? 'text-slate-200' : 'text-slate-700'}`} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border ${
              isNavyGov
                ? 'bg-[#14355B] text-white border-sky-400/50'
                : 'bg-[#006A4E] text-white border-[#B2DFCD]'
            }`}
          >
            TN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-base tracking-tight leading-none ${isNavyGov ? 'text-white' : 'text-slate-900'}`}>
                TN-HDOS
              </h1>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                  isNavyGov
                    ? 'bg-[#14355B] text-sky-200 border-sky-400/40'
                    : 'bg-[#E6F4EA] text-[#006A4E] border-[#B2DFCD]'
                }`}
              >
                Phase 1 Live
              </span>
            </div>
            <p className={`text-[11px] font-medium leading-tight ${isNavyGov ? 'text-sky-200/80' : 'text-slate-500'}`}>
              Highways Digital Operating System
            </p>
          </div>
        </div>

        <div className={`h-6 w-px hidden md:block ${isNavyGov ? 'bg-[#1A3E66]' : 'bg-slate-200'}`} />

        <div className="hidden md:flex items-center gap-2">
          <span className={`text-xs uppercase tracking-wider font-semibold ${isNavyGov ? 'text-sky-300/80' : 'text-slate-400'}`}>
            Module:
          </span>
          <span
            className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${
              isNavyGov
                ? 'bg-[#14355B] text-white border-[#234D7E]'
                : 'bg-slate-100 text-slate-900 border-slate-200'
            }`}
          >
            {currentModuleName}
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isNavyGov ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, roads (SH-49, MDR-102), contractors, officials..."
            className={`w-full rounded-lg pl-9 pr-4 py-1.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all border ${
              isNavyGov
                ? 'bg-[#091C33] border-[#1E4673] text-white focus:ring-[#1D4ED8]'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-[#006A4E]'
            }`}
          />
        </div>
      </div>

      {/* Right Side: Theme Switcher, Demo notice, Notifications & Role Persona Switcher */}
      <div className="flex items-center gap-3">
        {/* THEME SWITCHER BUTTON (Prompt DESIGN.md) */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all ${
              isNavyGov
                ? 'bg-[#14355B] border-[#234D7E] text-white hover:bg-[#1A4372]'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
            title="Switch theme color (TN Classic / Government Navy)"
          >
            <Palette className={`w-4 h-4 ${isNavyGov ? 'text-sky-300' : 'text-[#006A4E]'}`} />
            <span className="hidden sm:inline">
              {isNavyGov ? 'Theme: Govt Navy' : 'Theme: TN Classic'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ring-1 ring-white ${
                isNavyGov ? 'bg-sky-400' : 'bg-[#006A4E]'
              }`}
            />
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {/* Theme Dropdown */}
          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50 text-slate-800 dark:text-slate-200">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visual Theme Selection
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle between original brand and DESIGN.md specification:
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                {/* Theme 1: TN Classic */}
                <button
                  onClick={() => {
                    setTheme('classic');
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                    !isNavyGov
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-[#006A4E] text-white flex items-center justify-center text-[11px] font-bold mt-0.5 flex-shrink-0 shadow-sm">
                    TN
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Tamil Nadu Classic</span>
                      {!isNavyGov && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Emerald (#006A4E) & Slate palette
                    </p>
                  </div>
                </button>

                {/* Theme 2: Government Navy from DESIGN.md */}
                <button
                  onClick={() => {
                    setTheme('navy-gov');
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                    isNavyGov
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-[#0F2A4A] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0 border border-sky-400 shadow-sm">
                    Gov
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Government Navy</span>
                      {isNavyGov && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      DESIGN.md Layer A (#0F2A4A) & #F4F7FB
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Data Disclaimer Tag */}
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border ${
            isNavyGov
              ? 'bg-[#14355B] text-amber-300 border-amber-500/40'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Demo Data Environment</span>
        </div>

        {/* Notifications Icon */}
        <button
          className={`relative p-2 rounded-lg transition-colors ${
            isNavyGov
              ? 'text-slate-300 hover:text-white hover:bg-[#14355B]'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="3 Active statutory alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Persona & RBAC Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border transition-all text-left ${
              isNavyGov
                ? 'bg-[#14355B] border-[#234D7E] text-white hover:bg-[#1A4372]'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-xs shadow-sm ${
                isNavyGov ? 'bg-[#091C33] border border-sky-400/50' : 'bg-[#006A4E]'
              }`}
            >
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="hidden sm:block">
              <div className={`text-xs font-bold leading-tight ${isNavyGov ? 'text-white' : 'text-slate-800'}`}>
                {user?.full_name || 'Loading user...'}
              </div>
              <div
                className={`text-[10px] font-semibold flex items-center gap-1 leading-tight ${
                  isNavyGov ? 'text-sky-300' : 'text-[#006A4E]'
                }`}
              >
                <Shield className="w-2.5 h-2.5" />
                {user?.role_name || user?.role_code}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
          </button>

          {/* Persona Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Role / Test RBAC Jurisdiction
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click any role to test server-enforced access controls:
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {personas.map((p) => {
                  const isActive = user?.username === p.username;
                  return (
                    <button
                      key={p.username}
                      onClick={() => handleSelectPersona(p.username)}
                      className={`w-full text-left px-4 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        isActive ? 'bg-[#E6F4EA]/60 border-l-4 border-[#006A4E]' : ''
                      }`}
                    >
                      <UserCheck
                        className={`w-4 h-4 mt-0.5 ${
                          isActive ? 'text-[#006A4E]' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {p.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400">
                Logged in as <span className="font-mono font-medium text-slate-600">{user?.username}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

