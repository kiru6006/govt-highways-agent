import React, { useMemo } from 'react';
import {
  Building2,
  MapPin,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { OrganisationFilterOptions, OrganisationFilterOptionItem } from '../types';

export interface OrganisationFilterState {
  wing?: string;
  region?: string;
  circle?: string;
  division?: string;
  subdivision?: string;
  district?: string;
}

interface OrganisationFilterBarProps {
  filterOptions: OrganisationFilterOptions;
  selectedFilters: OrganisationFilterState;
  onChange: (filters: OrganisationFilterState) => void;
  onReset: () => void;
  showDistrict?: boolean;
  className?: string;
}

export const OrganisationFilterBar: React.FC<OrganisationFilterBarProps> = ({
  filterOptions,
  selectedFilters,
  onChange,
  onReset,
  showDistrict = true,
  className = ''
}) => {
  // Cascading lists based on selections
  const availableRegions = useMemo(() => {
    if (!selectedFilters.wing || selectedFilters.wing === 'ALL') {
      return filterOptions.regions;
    }
    return filterOptions.regions.filter(r => r.wing_code === selectedFilters.wing);
  }, [filterOptions.regions, selectedFilters.wing]);

  const availableCircles = useMemo(() => {
    let list = filterOptions.circles;
    if (selectedFilters.wing && selectedFilters.wing !== 'ALL') {
      list = list.filter(c => c.wing_code === selectedFilters.wing);
    }
    if (selectedFilters.region && selectedFilters.region !== 'ALL') {
      list = list.filter(c => c.parent_id === selectedFilters.region);
    }
    return list;
  }, [filterOptions.circles, selectedFilters.wing, selectedFilters.region]);

  const availableDivisions = useMemo(() => {
    let list = filterOptions.divisions;
    if (selectedFilters.wing && selectedFilters.wing !== 'ALL') {
      list = list.filter(d => d.wing_code === selectedFilters.wing);
    }
    if (selectedFilters.circle && selectedFilters.circle !== 'ALL') {
      list = list.filter(d => d.parent_id === selectedFilters.circle);
    }
    return list;
  }, [filterOptions.divisions, selectedFilters.wing, selectedFilters.circle]);

  const availableSubdivisions = useMemo(() => {
    let list = filterOptions.subdivisions;
    if (selectedFilters.division && selectedFilters.division !== 'ALL') {
      list = list.filter(s => s.parent_id === selectedFilters.division);
    }
    return list;
  }, [filterOptions.subdivisions, selectedFilters.division]);

  const handleWingChange = (wing: string) => {
    onChange({
      ...selectedFilters,
      wing: wing === 'ALL' ? undefined : wing,
      region: undefined,
      circle: undefined,
      division: undefined,
      subdivision: undefined
    });
  };

  const handleRegionChange = (region: string) => {
    onChange({
      ...selectedFilters,
      region: region === 'ALL' ? undefined : region,
      circle: undefined,
      division: undefined,
      subdivision: undefined
    });
  };

  const handleCircleChange = (circle: string) => {
    onChange({
      ...selectedFilters,
      circle: circle === 'ALL' ? undefined : circle,
      division: undefined,
      subdivision: undefined
    });
  };

  const handleDivisionChange = (division: string) => {
    onChange({
      ...selectedFilters,
      division: division === 'ALL' ? undefined : division,
      subdivision: undefined
    });
  };

  const handleSubdivisionChange = (subdivision: string) => {
    onChange({
      ...selectedFilters,
      subdivision: subdivision === 'ALL' ? undefined : subdivision
    });
  };

  const handleDistrictChange = (district: string) => {
    onChange({
      ...selectedFilters,
      district: district === 'ALL' ? undefined : district
    });
  };

  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-slate-800 text-sm">
            Highways Organisation Jurisdiction (G.O. Ms No. 43)
          </h3>
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
            Effective 15-06-2026
          </span>
          {selectedFilters.wing === 'NH' && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded font-medium">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
              NH Wing: Pending Verification
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Jurisdictions ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Wing Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Department Wing
          </label>
          <select
            value={selectedFilters.wing || 'ALL'}
            onChange={(e) => handleWingChange(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="ALL">All Wings</option>
            {filterOptions.wings.map((w) => (
              <option key={w.id} value={w.wing_code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            C&M Region (Zone)
          </label>
          <select
            value={selectedFilters.region || 'ALL'}
            onChange={(e) => handleRegionChange(e.target.value)}
            disabled={selectedFilters.wing === 'NH'}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="ALL">All Regions (4 Zones)</option>
            {availableRegions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Circle Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Circle (SE Jurisdiction)
          </label>
          <select
            value={selectedFilters.circle || 'ALL'}
            onChange={(e) => handleCircleChange(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="ALL">All Circles ({availableCircles.length})</option>
            {availableCircles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Division Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Division (EE Jurisdiction)
          </label>
          <select
            value={selectedFilters.division || 'ALL'}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="ALL">All Divisions ({availableDivisions.length})</option>
            {availableDivisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subdivision Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Subdivision (ADE)
          </label>
          <select
            value={selectedFilters.subdivision || 'ALL'}
            onChange={(e) => handleSubdivisionChange(e.target.value)}
            disabled={!selectedFilters.division || selectedFilters.division === 'ALL'}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="ALL">All Subdivisions ({availableSubdivisions.length})</option>
            {availableSubdivisions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        {showDistrict && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Revenue District
            </label>
            <select
              value={selectedFilters.district || 'ALL'}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="ALL">All Districts ({filterOptions.districts.length})</option>
              {filterOptions.districts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Breadcrumb trail */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center flex-wrap gap-1 text-xs text-slate-500">
        <span className="font-medium text-slate-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Jurisdiction Path:
        </span>
        <span className="text-slate-700 font-medium">Tamil Nadu Highways</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className={selectedFilters.wing ? 'font-semibold text-amber-700' : 'text-slate-500'}>
          {selectedFilters.wing ? (selectedFilters.wing === 'CM' ? 'C&M Wing' : 'National Highways') : 'All Wings'}
        </span>
        {selectedFilters.region && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-amber-700">
              {availableRegions.find(r => r.id === selectedFilters.region)?.name || selectedFilters.region}
            </span>
          </>
        )}
        {selectedFilters.circle && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-amber-700">
              {availableCircles.find(c => c.id === selectedFilters.circle)?.name || selectedFilters.circle}
            </span>
          </>
        )}
        {selectedFilters.division && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-amber-700">
              {availableDivisions.find(d => d.id === selectedFilters.division)?.name || selectedFilters.division}
            </span>
          </>
        )}
        {selectedFilters.subdivision && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-amber-700">
              {availableSubdivisions.find(s => s.id === selectedFilters.subdivision)?.name || selectedFilters.subdivision}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
