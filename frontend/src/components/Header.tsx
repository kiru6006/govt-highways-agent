import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Shield, ChevronDown, UserCheck, RefreshCw, AlertCircle, Menu } from 'lucide-react';

interface HeaderProps {
  currentModuleName: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentModuleName, onToggleSidebar, isSidebarCollapsed }) => {
  const { user, switchPersona } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <header className="h-16 bg-white border-b border-gov-border px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Brand & Module */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-1"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#006A4E] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#B2DFCD]">
            TN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-slate-900 leading-none">
                TN-HDOS
              </h1>
              <span className="bg-[#E6F4EA] text-[#006A4E] border border-[#B2DFCD] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                Phase 1 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Highways Digital Operating System
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        <div className="hidden md:flex items-center gap-2 text-slate-700">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Module:</span>
          <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {currentModuleName}
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, roads (SH-49, MDR-102), contractors, officials..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Side: Demo notice, Notifications & Role Persona Switcher */}
      <div className="flex items-center gap-3">
        {/* Demo Data Disclaimer Tag */}
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-md font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Demo Data Environment</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="3 Active statutory alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Persona & RBAC Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.full_name || 'Loading user...'}
              </div>
              <div className="text-[10px] text-[#006A4E] font-semibold flex items-center gap-1 leading-tight">
                <Shield className="w-2.5 h-2.5" />
                {user?.role_name || user?.role_code}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
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

