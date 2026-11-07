import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  ShieldAlert,
  FolderGit2,
  View,
  Users,
  Network,
  Award,
  CircleDollarSign,
  Briefcase,
  HardHat,
  Milestone,
  FileText,
  MapPin,
  Scale,
  HeartHandshake,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Landmark,
  Building2,
  Globe,
  Bell,
  Calendar,
  X
} from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  groupId: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const navigationItems: NavItem[] = [
  // Group 1: Executive & Strategic
  { id: '1a', name: "1a. Minister's Command Centre", path: '/leadership/minister', icon: Landmark, badge: 'Cabinet', badgeColor: 'bg-amber-900/60 text-amber-200 border border-amber-700/50', groupId: 'executive' },
  { id: '1b', name: "1b. Secretary's Command Centre", path: '/leadership/secretary', icon: Building2, badge: 'Govt', badgeColor: 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50', groupId: 'executive' },
  { id: '1', name: '1c. Executive Smartboard', path: '/', icon: LayoutDashboard, groupId: 'executive' },
  { id: 'notifications', name: 'Notifications & Alerts', path: '/notifications', icon: Bell, badge: 'Live', badgeColor: 'bg-red-900/60 text-red-200 border border-red-700/50', groupId: 'executive' },
  { id: 'calendar', name: 'Unified Calendar', path: '/calendar', icon: Calendar, groupId: 'executive' },
  { id: '2', name: '2. Leakage Intelligence', path: '/leakage', icon: ShieldAlert, badge: 'Vigilance', badgeColor: 'bg-red-900/60 text-red-200 border border-red-700/50', groupId: 'executive' },
  { id: '16', name: '16. Reports and Analytics', path: '/reports', icon: BarChart3, groupId: 'executive' },

  // Group 2: Projects & Engineering
  { id: 'ckicp', name: 'CKICP Intelligence', path: '/ckicp', icon: Globe, badge: 'ADB', badgeColor: 'bg-sky-900/60 text-sky-200 border border-sky-700/50', groupId: 'projects' },
  { id: 'tnrsp', name: 'TNRSP-II Intelligence', path: '/tnrsp', icon: Milestone, badge: 'World Bank', badgeColor: 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50', groupId: 'projects' },
  { id: '3', name: '3. Project Management', path: '/projects', icon: FolderGit2, groupId: 'projects' },
  { id: '4', name: '4. Project 360°', path: '/project-360', icon: View, groupId: 'projects' },
  { id: '7', name: '7. Engineering Quality', path: '/quality', icon: Award, groupId: 'projects' },
  { id: '11', name: '11. Road & Bridge Assets', path: '/assets', icon: Milestone, groupId: 'projects' },

  // Group 3: Inter-Agency & Coordination
  { id: '5', name: '5. People & Directory', path: '/directory', icon: Users, groupId: 'interagency' },
  { id: '6', name: '6. Department Connections', path: '/departments', icon: Network, badge: 'Inter-agency', badgeColor: 'bg-blue-900/60 text-blue-200 border border-blue-700/50', groupId: 'interagency' },
  { id: '13', name: '13. Land & Utility Coord', path: '/land-utility', icon: MapPin, groupId: 'interagency' },

  // Group 4: Commercial, Contractors & Field
  { id: '8', name: '8. Finance & Procurement', path: '/finance', icon: CircleDollarSign, groupId: 'commercial' },
  { id: '9', name: '9. Contractor Intelligence', path: '/contractors', icon: Briefcase, groupId: 'commercial' },
  { id: '10', name: '10. Field Operations', path: '/field-ops', icon: HardHat, groupId: 'commercial' },

  // Group 5: Governance & Administration
  { id: '12', name: '12. Digital Office', path: '/digital-office', icon: FileText, groupId: 'governance' },
  { id: '14', name: '14. Governance & Legal Registry', path: '/compliance', icon: Scale, badge: 'Statutory', badgeColor: 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50', groupId: 'governance' },
  { id: '15', name: '15. Citizen Services', path: '/citizen-services', icon: HeartHandshake, groupId: 'governance' },
  { id: '17', name: '17. Administration', path: '/admin', icon: Settings, groupId: 'governance' },
];

export const navigationGroups: NavGroup[] = [
  {
    id: 'executive',
    title: 'Executive & Strategic',
    items: navigationItems.filter((i) => i.groupId === 'executive'),
  },
  {
    id: 'projects',
    title: 'Projects & Engineering',
    items: navigationItems.filter((i) => i.groupId === 'projects'),
  },
  {
    id: 'interagency',
    title: 'Inter-Agency & Coordination',
    items: navigationItems.filter((i) => i.groupId === 'interagency'),
  },
  {
    id: 'commercial',
    title: 'Commercial & Field',
    items: navigationItems.filter((i) => i.groupId === 'commercial'),
  },
  {
    id: 'governance',
    title: 'Governance & Public',
    items: navigationItems.filter((i) => i.groupId === 'governance'),
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { isNavyGov } = useTheme();

  // Internal collapse state with localStorage persistence
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tn_hdos_sidebar_collapsed') === 'true';
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    if (controlledToggle) {
      controlledToggle();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('tn_hdos_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  // Group expand/collapse accordion state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    executive: true,
    projects: true,
    interagency: true,
    commercial: true,
    governance: true,
  });

  // Auto-expand the group of the currently active path
  useEffect(() => {
    const activeItem = navigationItems.find((item) => item.path === location.pathname);
    if (activeItem && !openGroups[activeItem.groupId]) {
      setOpenGroups((prev) => ({
        ...prev,
        [activeItem.groupId]: true,
      }));
    }
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleAllGroups = () => {
    const allOpen = Object.values(openGroups).every(Boolean);
    const nextState: Record<string, boolean> = {};
    navigationGroups.forEach((g) => {
      nextState[g.id] = !allOpen;
    });
    setOpenGroups(nextState);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex flex-col flex-shrink-0 min-h-screen border-r transition-all duration-300 select-none ${
          isNavyGov
            ? 'bg-[#091A2E] text-slate-200 border-[#142842] theme-sidebar'
            : 'bg-slate-900 text-slate-300 border-slate-800'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'} ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl translate-x-0'
            : 'fixed md:static inset-y-0 left-0 z-50 md:z-auto -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Tamil Nadu Govt Header in Sidebar */}
        <div
          className={`p-3.5 border-b flex items-center justify-between ${
            isNavyGov ? 'bg-[#05111F] border-[#142842]' : 'bg-slate-950/50 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs border ${
                isNavyGov
                  ? 'bg-[#0F2A4A] text-white border-sky-400/50'
                  : 'bg-[#006A4E] text-white border-[#B2DFCD]/40'
              }`}
            >
              TN
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white tracking-wide truncate">
                  GOVERNMENT OF TN
                </div>
                <div
                  className={`text-[10px] font-medium truncate ${
                    isNavyGov ? 'text-sky-300' : 'text-emerald-400'
                  }`}
                >
                  Highways Department
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            )}

            {/* Expand / Collapse Sidebar Width Button (Desktop only) */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Global Quick Action: Expand/Collapse All Categories (when not collapsed) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-900/60 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Modules (17)
            </span>
            <button
              onClick={toggleAllGroups}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              title="Expand or collapse all menu sections"
            >
              <ChevronsUpDown className="w-3 h-3" />
              <span>
                {Object.values(openGroups).every(Boolean) ? 'Collapse All' : 'Expand All'}
              </span>
            </button>
          </div>
        )}

        {/* Nav List with Collapsible Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scrollbar-thin">
          {navigationGroups.map((group) => {
            const isOpen = openGroups[group.id];
            const hasActiveChild = group.items.some((i) => i.path === location.pathname);

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header (Accordion Toggle) */}
                {!isCollapsed || isMobileOpen ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
                      hasActiveChild
                        ? 'text-emerald-400 bg-emerald-950/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{group.title}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 font-normal">
                        ({group.items.length})
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                ) : (
                  // In collapsed desktop mode: subtle separator
                  <div className="h-px bg-slate-800 my-2 mx-1" />
                )}

                {/* Group Menu Items */}
                {(isCollapsed && !isMobileOpen ? true : isOpen) && (
                  <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={() => {
                            if (onCloseMobile) onCloseMobile();
                          }}
                          title={isCollapsed && !isMobileOpen ? item.name : undefined}
                          className={({ isActive }) =>
                            `relative flex items-center ${
                              isCollapsed && !isMobileOpen
                                ? 'justify-center p-2.5'
                                : 'justify-between px-3 py-2'
                            } rounded-lg text-xs font-medium transition-all group ${
                              isActive
                                ? isNavyGov
                                  ? 'bg-[#0F2A4A] text-white shadow-xs font-semibold border-l-4 border-white theme-active-nav'
                                  : 'bg-[#006A4E] text-white shadow-xs font-semibold'
                                : isNavyGov
                                ? 'text-slate-300 hover:bg-[#14355B] hover:text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-2.5 truncate">
                                <Icon
                                  className={`w-4 h-4 flex-shrink-0 ${
                                    isActive
                                      ? 'text-white'
                                      : isNavyGov
                                      ? 'text-slate-400 group-hover:text-sky-300'
                                      : 'text-slate-400 group-hover:text-emerald-400'
                                  }`}
                                />
                                {(!isCollapsed || isMobileOpen) && (
                                  <span className="truncate">{item.name}</span>
                                )}
                              </div>

                              {/* Badges in expanded mode */}
                              {(!isCollapsed || isMobileOpen) && item.badge && (
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                    item.badgeColor ||
                                    'bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer in Sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-500">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <span>TN-HDOS Platform</span>
                <span className="font-mono text-emerald-400">v2.1.0</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Statutory Highways OS • Govt of Tamil Nadu
              </div>
            </div>
          ) : (
            <div className="text-center font-mono text-[9px] text-slate-400">v2.1</div>
          )}
        </div>
      </aside>
    </>
  );
};
