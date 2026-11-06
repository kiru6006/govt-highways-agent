import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProjectItem, RoadType } from '../types';
import { RoadBadge } from '../components/RoadBadge';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Search, Layers, AlertCircle, ArrowUpRight } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedRoadType, setSelectedRoadType] = useState<RoadType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const roadTypeParam = selectedRoadType === 'ALL' ? undefined : selectedRoadType;
      const data = await api.getProjects(roadTypeParam);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedRoadType, user]);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.project_code.toLowerCase().includes(search.toLowerCase()) ||
    (p.contractor_name && p.contractor_name.toLowerCase().includes(search.toLowerCase()))
  );

  const roadTiers: Array<{ type: RoadType | 'ALL'; label: string; count?: number }> = [
    { type: 'ALL', label: 'All Roads' },
    { type: 'SH', label: 'State Highways (SH)' },
    { type: 'NH', label: 'National Highways (NH)' },
    { type: 'MDR', label: 'Major District Roads (MDR)' },
    { type: 'ODR', label: 'Other District Roads (ODR)' },
    { type: 'RURAL', label: 'Rural Roads' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              3. Project Management Portfolio
            </h2>
            <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#006A4E] px-2 py-0.5 rounded border border-[#B2DFCD]">
              RBAC Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            State highway works, DPR tracking, physical milestones and contractor assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('New Project Sanction Form is active for Superintending and Chief Engineers.')}
            className="bg-[#006A4E] hover:bg-[#00553E] text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Sanction New Work
          </button>
        </div>
      </div>

      {/* Road Classification Filter Tabs adhering to DESIGN.md */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {roadTiers.map((tier) => {
          const isSelected = selectedRoadType === tier.type;
          return (
            <button
              key={tier.type}
              onClick={() => setSelectedRoadType(tier.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#006A4E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tier.label}
            </button>
          );
        })}
      </div>

      {/* Projects List Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by project code, title, contractor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredProjects.length}</span> projects for role{' '}
            <span className="font-semibold text-[#006A4E]">{user?.role_name}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Road Tier</th>
                <th className="py-3 px-4">Project Code & Details</th>
                <th className="py-3 px-4">Sanction (Cr)</th>
                <th className="py-3 px-4">Expenditure (Cr)</th>
                <th className="py-3 px-4">Physical vs Financial</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap align-top">
                    <RoadBadge type={p.road_type} code={p.road_name || p.road_type} />
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-slate-900 leading-snug">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {p.project_code}
                      </span>
                      {p.contractor_name && (
                        <span className="text-slate-600 font-medium">
                          Contractor: {p.contractor_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap align-top">
                    ₹{p.sanctioned_cost_cr.toFixed(2)} Cr
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap align-top">
                    ₹{p.expenditure_to_date_cr.toFixed(2)} Cr
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">Physical:</span>
                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-[#006A4E] h-1.5 rounded-full"
                            style={{ width: `${p.physical_progress_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {p.physical_progress_pct}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">Financial:</span>
                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-[#004B87] h-1.5 rounded-full"
                            style={{ width: `${p.financial_progress_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-700">
                          {p.financial_progress_pct}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap align-top">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.status === 'IN_PROGRESS'
                          ? 'bg-[#E6F4EA] text-[#006A4E] border border-[#B2DFCD]'
                          : p.status === 'DELAYED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap align-top">
                    <button
                      onClick={() => alert(`Opening 360° Profile for ${p.project_code} (Sanctioned under Chief Minister Road Development Programme).`)}
                      className="text-xs text-[#006A4E] hover:text-[#00553E] font-semibold flex items-center gap-0.5"
                    >
                      View 360° <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No projects found for current filter or user jurisdiction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

