import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const navigationItems: NavItem[] = [
  { id: '1', name: '1. Executive Command Centre', path: '/', icon: LayoutDashboard },
  { id: '2', name: '2. Leakage Intelligence', path: '/leakage', icon: ShieldAlert, badge: 'Vigilance', badgeColor: 'bg-red-100 text-red-700' },
  { id: '3', name: '3. Project Management', path: '/projects', icon: FolderGit2 },
  { id: '4', name: '4. Project 360°', path: '/project-360', icon: View },
  { id: '5', name: '5. People & Directory', path: '/directory', icon: Users },
  { id: '6', name: '6. Department Connections', path: '/departments', icon: Network, badge: 'Inter-agency', badgeColor: 'bg-blue-100 text-blue-700' },
  { id: '7', name: '7. Engineering Quality', path: '/quality', icon: Award },
  { id: '8', name: '8. Finance & Procurement', path: '/finance', icon: CircleDollarSign },
  { id: '9', name: '9. Contractor Intelligence', path: '/contractors', icon: Briefcase },
  { id: '10', name: '10. Field Operations', path: '/field-ops', icon: HardHat },
  { id: '11', name: '11. Road & Bridge Assets', path: '/assets', icon: Milestone },
  { id: '12', name: '12. Digital Office', path: '/digital-office', icon: FileText },
  { id: '13', name: '13. Land & Utility Coord', path: '/land-utility', icon: MapPin },
  { id: '14', name: '14. Legal, Audit & Compliance', path: '/compliance', icon: Scale },
  { id: '15', name: '15. Citizen Services', path: '/citizen-services', icon: HeartHandshake },
  { id: '16', name: '16. Reports and Analytics', path: '/reports', icon: BarChart3 },
  { id: '17', name: '17. Administration', path: '/admin', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Tamil Nadu Govt Header in Sidebar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#006A4E] text-white flex items-center justify-center font-bold text-xs">
            TN
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              GOVERNMENT OF TAMIL NADU
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              Highways & Minor Ports Dept
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group Header */}
      <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Departmental Modules (17)
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#006A4E] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-slate-300">TN-HDOS Master Platform</span>
          <span className="text-emerald-400">v1.0.0</span>
        </div>
        <p className="leading-tight text-slate-500">
          State Highway Code: <span className="text-[#006A4E] font-bold">#006A4E</span>
        </p>
      </div>
    </aside>
  );
};

