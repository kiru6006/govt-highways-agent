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
  MessageSquare,
  Crown,
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
  // Domain 1: Strategic Command (Apex Layer)
  { id: 'cm_dashboard', name: 'CM Highways Smartboard', path: '/cm-dashboard', icon: Crown, badge: 'CMO', badgeColor: 'bg-amber-50 text-amber-800 border border-amber-300', groupId: 'strategic' },
  { id: '1a', name: "Minister's Command Centre", path: '/leadership/minister', icon: Landmark, badge: 'Cabinet', badgeColor: 'bg-amber-50 text-amber-800 border border-amber-300', groupId: 'strategic' },
  { id: '1b', name: "Secretary's Command Centre", path: '/leadership/secretary', icon: Building2, badge: 'Govt', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-300', groupId: 'strategic' },
  { id: '1', name: 'Executive Smartboard', path: '/', icon: LayoutDashboard, groupId: 'strategic' },
  { id: '16', name: 'Reports & Analytics', path: '/reports', icon: BarChart3, groupId: 'strategic' },

  // Domain 2: Project Intelligence (Core Layer)
  { id: 'major_works', name: 'Major Works ₹50 Cr+', path: '/major-works', icon: Building2, badge: 'Chennai 31', badgeColor: 'bg-blue-50 text-blue-800 border border-blue-300', groupId: 'projects' },
  { id: '3', name: 'Project Portfolio Grid', path: '/projects', icon: FolderGit2, groupId: 'projects' },
  { id: '4', name: 'Project 360° Dossier', path: '/project-360', icon: View, groupId: 'projects' },
  { id: 'ckicp', name: 'CKICP Intelligence', path: '/ckicp', icon: Globe, badge: 'ADB', badgeColor: 'bg-sky-50 text-sky-800 border border-sky-300', groupId: 'projects' },
  { id: 'tnrsp', name: 'TNRSP-II Intelligence', path: '/tnrsp', icon: Milestone, badge: 'World Bank', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-300', groupId: 'projects' },

  // Domain 3: Engineering & Field Ops (Operational Layer)
  { id: '10', name: 'Field Operations', path: '/field-ops', icon: HardHat, groupId: 'engineering' },
  { id: '7', name: 'Engineering Quality', path: '/quality', icon: Award, groupId: 'engineering' },
  { id: '11', name: 'Road & Bridge Assets', path: '/assets', icon: Milestone, groupId: 'engineering' },

  // Domain 4: Commercial & Resource Mgmt (Support Layer)
  { id: '8', name: 'Finance & Procurement', path: '/finance', icon: CircleDollarSign, groupId: 'commercial' },
  { id: '9', name: 'Contractor Intelligence', path: '/contractors', icon: Briefcase, groupId: 'commercial' },
  { id: '5', name: 'People & Directory', path: '/directory', icon: Users, groupId: 'commercial' },

  // Domain 5: Governance & Coordination (Control Layer)
  { id: '6', name: 'Dept. Connections', path: '/departments', icon: Network, badge: 'Inter-agency', badgeColor: 'bg-blue-50 text-blue-800 border border-blue-300', groupId: 'governance' },
  { id: 'land_litigation', name: 'Land & Litigation Intelligence', path: '/land-litigation', icon: Scale, badge: 'Control', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-300', groupId: 'governance' },
  { id: '13', name: 'Land & Utility Coord', path: '/land-utility', icon: MapPin, groupId: 'governance' },
  { id: '14', name: 'Governance & Legal', path: '/compliance', icon: Scale, badge: 'Statutory', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-300', groupId: 'governance' },
  { id: '15', name: 'Citizen Services', path: '/citizen-services', icon: HeartHandshake, groupId: 'governance' },
  { id: '2', name: 'Leakage Intelligence', path: '/leakage', icon: ShieldAlert, badge: 'Vigilance', badgeColor: 'bg-red-50 text-red-800 border border-red-300', groupId: 'governance' },

  // Domain 6: Digital Office & Utilities (Utility Layer)
  { id: '12', name: 'Digital Office', path: '/digital-office', icon: FileText, groupId: 'digital_office' },
  { id: 'calendar', name: 'Unified Calendar', path: '/calendar', icon: Calendar, groupId: 'digital_office' },
  { id: 'messages', name: 'Discussions & Chat', path: '/messages', icon: MessageSquare, badge: 'Govt', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-300', groupId: 'digital_office' },
  { id: 'notifications', name: 'Notifications & Alerts', path: '/notifications', icon: Bell, badge: 'Live', badgeColor: 'bg-red-50 text-red-800 border border-red-300', groupId: 'digital_office' },
  { id: '17', name: 'System Administration', path: '/admin', icon: Settings, groupId: 'digital_office' },
];

export const navigationGroups: NavGroup[] = [
  {
    id: 'strategic',
    title: 'Strategic Command',
    items: navigationItems.filter((i) => i.groupId === 'strategic'),
  },
  {
    id: 'projects',
    title: 'Project Intelligence',
    items: navigationItems.filter((i) => i.groupId === 'projects'),
  },
  {
    id: 'engineering',
    title: 'Engineering & Field Ops',
    items: navigationItems.filter((i) => i.groupId === 'engineering'),
  },
  {
    id: 'commercial',
    title: 'Commercial & Resource Mgmt',
    items: navigationItems.filter((i) => i.groupId === 'commercial'),
  },
  {
    id: 'governance',
    title: 'Governance & Coordination',
    items: navigationItems.filter((i) => i.groupId === 'governance'),
  },
  {
    id: 'digital_office',
    title: 'Digital Office & Services',
    items: navigationItems.filter((i) => i.groupId === 'digital_office'),
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { isNavyGov } = useTheme();

  // Collapsible Accordion State: Track open/closed status per navigation group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('tn_hdos_nav_open_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to all open
      }
    }
    return {
      strategic: true,
      projects: true,
      engineering: true,
      commercial: true,
      governance: true,
      digital_office: true,
    };
  });

  // Save accordion state to localStorage
  useEffect(() => {
    localStorage.setItem('tn_hdos_nav_open_groups', JSON.stringify(openGroups));
  }, [openGroups]);

  // Auto-expand group that contains active link on route change
  useEffect(() => {
    const activeItem = navigationItems.find((item) => item.path === location.pathname);
    if (activeItem) {
      setOpenGroups((prev) => {
        if (!prev[activeItem.groupId]) {
          return { ...prev, [activeItem.groupId]: true };
        }
        return prev;
      });
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
    const newState: Record<string, boolean> = {};
    navigationGroups.forEach((g) => {
      newState[g.id] = !allOpen;
    });
    setOpenGroups(newState);
  };

  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex flex-col flex-shrink-0 min-h-screen border-r border-slate-200 bg-white text-slate-800 transition-all duration-300 select-none ${
          isCollapsed ? 'md:w-20' : 'md:w-72'
        } ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-xl translate-x-0'
            : 'fixed md:static inset-y-0 left-0 z-50 md:z-auto -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Tamil Nadu Govt Header in Sidebar */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs bg-[#20242B] text-[#FACC15] border border-slate-700">
              TN
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 tracking-wide truncate">
                  GOVERNMENT OF TN
                </div>
                <div className="text-[10px] font-medium text-slate-600 truncate flex items-center gap-1">
                  <span>Highways Department</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            )}

            {/* Expand / Collapse Sidebar Width Button (Desktop only) */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-slate-700" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Global Quick Action: Expand/Collapse All Categories (when not collapsed) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Domains (6) • Modules (22)
            </span>
            <button
              onClick={toggleAllGroups}
              className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 font-medium px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
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
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3 custom-scrollbar">
          {navigationGroups.map((group) => {
            const isOpen = openGroups[group.id];
            const hasActiveChild = group.items.some((i) => i.path === location.pathname);

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Group Header (Accordion Toggle) */}
                {!isCollapsed || isMobileOpen ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
                      hasActiveChild
                        ? 'text-slate-900 bg-amber-50/70 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{group.title}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 font-normal">
                        ({group.items.length})
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                ) : (
                  // In collapsed desktop mode: subtle separator
                  <div className="h-px bg-slate-200 my-2 mx-1" />
                )}

                {/* Group Menu Items */}
                {(isCollapsed && !isMobileOpen ? true : isOpen) && (
                  <div className="space-y-0.5">
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
                                ? 'bg-amber-50 text-slate-900 font-semibold border-l-4 border-[#FACC15] shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-2.5 truncate">
                                <Icon
                                  className={`w-4 h-4 flex-shrink-0 ${
                                    isActive
                                      ? 'text-slate-900'
                                      : 'text-slate-500 group-hover:text-slate-800'
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
                                    'bg-slate-100 text-slate-700 border border-slate-200'
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
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>TN-HDOS Platform</span>
                <span className="font-mono text-slate-900 font-bold bg-[#FACC15] px-1.5 py-0.2 rounded text-[9px]">v2.1.0</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Statutory Highways OS • Govt of Tamil Nadu
              </div>
            </div>
          ) : (
            <div className="text-center font-mono text-[9px] text-slate-600 font-bold">v2.1</div>
          )}
        </div>
      </aside>
    </>
  );
};
