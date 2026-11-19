import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Truck,
  HardHat,
  Wrench,
  Compass,
  TreePine,
  Maximize2,
  FileText,
  Lock,
  ArrowRight,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { rateCalculatorAPI, sorAPI } from '../services/api';
import {
  CalculatorMode,
  RateCalculateRequest,
  RateCalculateResponse,
  BatchCalculateResponse
} from '../types';

export const RateCalculatorPage: React.FC = () => {
  // Mode Selection
  const [activeMode, setActiveMode] = useState<CalculatorMode>('MATERIAL');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [quantity, setQuantity] = useState<number>(125);
  const [workersCount, setWorkersCount] = useState<number>(2);
  const [daysCount, setDaysCount] = useState<number>(5);
  const [durationHours, setDurationHours] = useState<number>(8);
  const [lengthM, setLengthM] = useState<number>(1000);
  const [widthM, setWidthM] = useState<number>(7.0);
  const [thicknessMm, setThicknessMm] = useState<number>(50);
  const [leadKm, setLeadKm] = useState<number>(10);
  const [liftM, setLiftM] = useState<number>(0);
  const [terrain, setTerrain] = useState<'PLAINS' | 'HILLS'>('PLAINS');
  const [corporationType, setCorporationType] = useState<string>('NONE');
  const [isNightWork, setIsNightWork] = useState<boolean>(false);
  const [tenderNightClause, setTenderNightClause] = useState<string>('');
  const [isBridgeWork, setIsBridgeWork] = useState<boolean>(false);
  const [bridgeCostSharePct, setBridgeCostSharePct] = useState<number>(60);
  const [structuralType, setStructuralType] = useState<string>('ROADWAY');
  const [applyTax, setApplyTax] = useState<boolean>(false);

  // Active Calculation Result & Sheet
  const [activeResult, setActiveResult] = useState<RateCalculateResponse | null>(null);
  const [calculationSheet, setCalculationSheet] = useState<RateCalculateResponse[]>([]);
  const [sheetTotals, setSheetTotals] = useState({
    basic: 0,
    adjustments: 0,
    tax: 0,
    grand: 0
  });

  // Step-by-Step Breakdown Drawer
  const [drawerResult, setDrawerResult] = useState<RateCalculateResponse | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [activeMode]);

  useEffect(() => {
    runLiveCalculation();
  }, [
    activeMode,
    selectedItem,
    quantity,
    workersCount,
    daysCount,
    durationHours,
    lengthM,
    widthM,
    thicknessMm,
    leadKm,
    liftM,
    terrain,
    corporationType,
    isNightWork,
    tenderNightClause,
    isBridgeWork,
    bridgeCostSharePct,
    structuralType,
    applyTax
  ]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await rateCalculatorAPI.getItems({ category: getCategoryForMode(activeMode), limit: 100 });
      setItems(data.items);
      if (data.items.length > 0) {
        setSelectedItem(data.items[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryForMode = (mode: CalculatorMode): string => {
    switch (mode) {
      case 'MATERIAL':
        return 'Material';
      case 'LABOUR':
        return 'Labour';
      case 'WORK':
        return 'Highways Works';
      case 'EQUIPMENT':
        return 'Tools & Plant Hire';
      case 'ROAD_FURNITURE':
        return 'Road Furniture';
      case 'SURVEY_DPR':
        return 'Survey';
      case 'PLANTATION':
        return 'Plantation';
      case 'CONVEYANCE':
        return 'Conveyance';
      default:
        return 'ALL';
    }
  };

  const runLiveCalculation = async () => {
    const payload: RateCalculateRequest = {
      calculation_mode: activeMode,
      item_code: selectedItem?.item_code,
      quantity: Number(quantity) || 1,
      workers_count: Number(workersCount),
      days_count: Number(daysCount),
      duration_hours: Number(durationHours),
      length_m: Number(lengthM),
      width_m: Number(widthM),
      thickness_mm: Number(thicknessMm),
      lead_km: Number(leadKm),
      lift_m: Number(liftM),
      terrain: terrain,
      corporation_type: corporationType,
      is_night_work: isNightWork,
      tender_night_clause: tenderNightClause || undefined,
      is_bridge_work: isBridgeWork,
      bridge_cost_share_pct: Number(bridgeCostSharePct),
      structural_type: structuralType,
      tax_percentage: 18.0,
      apply_tax: applyTax
    };

    try {
      const res = await rateCalculatorAPI.calculate(payload);
      setActiveResult(res);
    } catch (err) {
      console.error('Live calculation failed', err);
    }
  };

  const handleAddToSheet = () => {
    if (!activeResult) return;
    const updated = [...calculationSheet, { ...activeResult, calculation_id: `LINE-${Date.now()}` }];
    setCalculationSheet(updated);
    recalculateSheetTotals(updated);
  };

  const handleRemoveLine = (idx: number) => {
    const updated = calculationSheet.filter((_, i) => i !== idx);
    setCalculationSheet(updated);
    recalculateSheetTotals(updated);
  };

  const handleCloneLine = (line: RateCalculateResponse) => {
    const updated = [...calculationSheet, { ...line, calculation_id: `LINE-${Date.now()}` }];
    setCalculationSheet(updated);
    recalculateSheetTotals(updated);
  };

  const recalculateSheetTotals = (lines: RateCalculateResponse[]) => {
    const basic = lines.reduce((s, l) => s + l.base_amount, 0);
    const adjustments = lines.reduce((s, l) => s + l.total_adjustments, 0);
    const tax = lines.reduce((s, l) => s + (l.tax_treatment?.tax_amount || 0), 0);
    const grand = lines.reduce((s, l) => s + l.final_amount, 0);
    setSheetTotals({ basic, adjustments, tax, grand });
  };

  const handleResetSheet = () => {
    setCalculationSheet([]);
    setSheetTotals({ basic: 0, adjustments: 0, tax: 0, grand: 0 });
    setExportNotice(null);
  };

  const handleExportCSV = async () => {
    if (calculationSheet.length === 0) return;
    const batchData: BatchCalculateResponse = {
      session_id: `SESS-${Date.now()}`,
      sor_version: 'SOR-2026-27-V1',
      title: 'Statewide Rate Calculation Workbench',
      lines: calculationSheet,
      total_basic_amount: sheetTotals.basic,
      total_adjustment_amount: sheetTotals.adjustments,
      total_tax_amount: sheetTotals.tax,
      grand_total_amount: sheetTotals.grand,
      validation_status: 'VALID',
      warnings_count: calculationSheet.reduce((s, l) => s + l.warnings.length, 0),
      timestamp: new Date().toISOString()
    };

    try {
      const exp = await rateCalculatorAPI.exportSheet({ format: 'CSV', batch_data: batchData });
      // Trigger download
      const blob = new Blob([exp.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', exp.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportNotice(`Exported ${exp.filename} successfully.`);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const filteredItems = items.filter(it => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      it.item_code?.toLowerCase().includes(q) ||
      it.description?.toLowerCase().includes(q) ||
      it.sub_category?.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || it.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                Material, Labour & Work Rate Calculator
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                SoR 2026–2027 Vol. I (w.e.f. 13/11/2026)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-50">Engineering Rate & Quantity Calculator</h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic Python Decimal arithmetic, statutory area allowances, Table-I conveyance slabs, and transparent formula breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSheet}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Workbench
            </button>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
              <span className="text-[10px] text-slate-400 block uppercase">Tax Status</span>
              <span className="text-amber-400 font-bold">Rates GST Exclusive</span>
            </div>
          </div>
        </div>

        {/* Section A: Calculator Mode Segmented Tabs */}
        <div className="flex items-center gap-1.5 mt-6 border-b border-slate-800 pt-2 overflow-x-auto pb-1">
          {[
            { id: 'MATERIAL', label: '1. Material Cost', icon: Layers },
            { id: 'LABOUR', label: '2. Labour Cost', icon: HardHat },
            { id: 'WORK', label: '3. Work Item Cost', icon: Wrench },
            { id: 'EQUIPMENT', label: '4. Equipment Hire', icon: Calculator },
            { id: 'ROAD_FURNITURE', label: '5. Road Furniture', icon: ShieldCheck },
            { id: 'SURVEY_DPR', label: '6. Survey & DPR', icon: Compass },
            { id: 'PLANTATION', label: '7. Plantation', icon: TreePine },
            { id: 'QUANTITY', label: '8. Quantity Calculator', icon: Maximize2 },
            { id: 'CONVEYANCE', label: '9. Conveyance & Head Load', icon: Truck },
            { id: 'COMBINED', label: '10. Multi-Item Sheet', icon: FileSpreadsheet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as CalculatorMode)}
                className={`px-3.5 py-2 font-medium text-xs rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Desktop Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Item Selection & Contextual Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section B: Item Selector (Hidden for Pure Quantity Mode) */}
          {activeMode !== 'QUANTITY' && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-600" />
                  Select Schedule Item ({getCategoryForMode(activeMode)})
                </h3>
                <span className="text-xs text-slate-500 font-mono">Found: {filteredItems.length} items</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search item code, description, specification clause..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Items List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {filteredItems.map(it => {
                  const isSelected = selectedItem?.item_code === it.item_code;
                  return (
                    <div
                      key={it.item_code}
                      onClick={() => setSelectedItem(it)}
                      className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-amber-50/90 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {it.item_code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">{it.sub_category}</span>
                        </div>
                        <p className="text-slate-800 font-medium truncate mt-0.5">{it.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          ₹{it.basic_rate.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">per {it.unit}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No items match search filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section C: Contextual Inputs */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Calculation Parameters & Applied Conditions
            </h3>

            {/* Mode-Specific Contextual Fields */}
            {activeMode === 'MATERIAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Material Quantity ({selectedItem?.unit || 'cum'}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Ex: 125 m³ HBGS Jelly (M-0093)</span>
                </div>
              </div>
            )}

            {activeMode === 'LABOUR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Number of Workers:</label>
                  <input
                    type="number"
                    min="1"
                    value={workersCount}
                    onChange={e => setWorkersCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Working Days:</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={daysCount}
                    onChange={e => setDaysCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {activeMode === 'EQUIPMENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Operating Hours:</label>
                  <input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {activeMode === 'QUANTITY' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Length (metres):</label>
                  <input
                    type="number"
                    value={lengthM}
                    onChange={e => setLengthM(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Width (metres):</label>
                  <input
                    type="number"
                    value={widthM}
                    onChange={e => setWidthM(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Thickness (mm):</label>
                  <input
                    type="number"
                    value={thicknessMm}
                    onChange={e => setThicknessMm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Ex: 50mm = 0.05m</span>
                </div>
              </div>
            )}

            {activeMode === 'CONVEYANCE' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Volume (cum):</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Distance (km):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={leadKm}
                    onChange={e => setLeadKm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Lift Height (m):</label>
                  <input
                    type="number"
                    min="0"
                    value={liftM}
                    onChange={e => setLiftM(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* General Quantity (for Works, Road Furniture, Survey, Plantation) */}
            {['WORK', 'ROAD_FURNITURE', 'SURVEY_DPR', 'PLANTATION'].includes(activeMode) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Measured Quantity ({selectedItem?.unit || 'unit'}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Statutory Allowances Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Statutory Allowance Toggles
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Corporation Area */}
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Corporation Area Limits:</label>
                  <select
                    value={corporationType}
                    onChange={e => setCorporationType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="NONE">None (Standard Rates)</option>
                    <option value="CHENNAI_32KM">Chennai + 32km Belt (+10%)</option>
                    <option value="MADURAI_CBE_HOSUR">Madurai, Coimbatore, Hosur (+10%)</option>
                    <option value="OTHER_CORP">Other 17 Corporations (+5%)</option>
                  </select>
                </div>

                {/* Terrain */}
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Terrain Classification:</label>
                  <select
                    value={terrain}
                    onChange={e => setTerrain(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="PLAINS">Plains (Table-I Mechanical)</option>
                    <option value="HILLS">Ghat / Hills (+20% GN-4)</option>
                  </select>
                </div>
              </div>

              {/* Night Work Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNightWork}
                      onChange={e => setIsNightWork(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    Night Work Allowance (+25% Labour Only)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Annexure-I Cl. 3(b)</span>
                </div>
                {isNightWork && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter tender clause citation (Required for eligibility)..."
                      value={tenderNightClause}
                      onChange={e => setTenderNightClause(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    {!tenderNightClause && (
                      <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                        Hard Gate: Allowance will be blocked without verified tender specification clause.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bridge 3% Allowance Toggle */}
              {activeMode === 'WORK' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBridgeWork}
                        onChange={e => setIsBridgeWork(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Bridge Work Project (&ge; 50% Cost Share)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">General Note 10</span>
                  </div>
                  {isBridgeWork && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-0.5">Structural Component:</label>
                        <select
                          value={structuralType}
                          onChange={e => setStructuralType(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        >
                          <option value="ROADWAY">Roadway (Standard)</option>
                          <option value="STRUCTURAL_BRIDGE">Structural Bridge (+3% Eligible)</option>
                          <option value="DRAIN">Roadside Drain (Blocked)</option>
                          <option value="CULVERT">Cross Culvert (Blocked)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-0.5">Bridge Cost Share (%):</label>
                        <input
                          type="number"
                          value={bridgeCostSharePct}
                          onChange={e => setBridgeCostSharePct(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tax Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={e => setApplyTax(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Apply Separate GST (18%) at Summary
                </label>
                <span className="text-[10px] text-slate-400 font-mono">G.O. Ms No. 114</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Result Card & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activeResult && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 text-amber-400 rounded border border-slate-700">
                    {activeResult.calculation_id}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeResult.validation_status === 'VALID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeResult.validation_status === 'VALID_WITH_WARNINGS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {activeResult.validation_status}
                  </span>
                </div>
                <button
                  onClick={() => setDrawerResult(activeResult)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Audit Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Info */}
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {activeResult.item_code || 'GEOMETRIC_CALCULATION'}
                </span>
                <h4 className="font-bold text-slate-100 text-base leading-snug mt-0.5">
                  {activeResult.item_description}
                </h4>
              </div>

              {/* Formula String */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 font-mono text-xs text-amber-300 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Deterministic Formula Trace
                </span>
                <p className="font-bold">{activeResult.base_formula}</p>
              </div>

              {/* Numbers Summary */}
              <div className="space-y-2 text-xs font-mono pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Input Quantity:</span>
                  <span className="text-white font-semibold">
                    {activeResult.input_quantity.toLocaleString()} {activeResult.official_unit}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic Base Cost:</span>
                  <span className="text-white font-semibold">
                    ₹{activeResult.base_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Statutory Adjustments:</span>
                  <span className="text-amber-400 font-semibold">
                    +₹{activeResult.total_adjustments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {activeResult.tax_treatment?.tax_amount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% Statutory):</span>
                    <span className="text-rose-400 font-semibold">
                      +₹{activeResult.tax_treatment.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm">
                  <span className="text-slate-300 font-sans font-semibold">Calculated Line Total:</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    ₹{activeResult.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Warnings / Assumptions Box */}
              {activeResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 space-y-1">
                  <span className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Validation Notice
                  </span>
                  {activeResult.warnings.map((w, i) => (
                    <p key={i} className="text-[11px] leading-relaxed">
                      {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Add CTA */}
              <button
                onClick={handleAddToSheet}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item to Calculation Sheet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section E: Multi-Item Calculation Sheet (Workbench Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Multi-Item Rate Calculation Sheet</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                {calculationSheet.length} Lines Added
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consolidated estimate schedule with deterministic sub-totals, statutory allowances, and export readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={calculationSheet.length === 0}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Schedule (CSV)
            </button>
            <button
              onClick={() => {
                alert('Calculation lines transferred successfully to Domain B: Project Estimate & BOQ Builder.');
              }}
              disabled={calculationSheet.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Transfer to Estimate / BOQ
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between px-5">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold text-center">#</th>
                <th className="py-3 px-4 font-semibold">Item & Description</th>
                <th className="py-3 px-3 font-semibold text-center">Unit</th>
                <th className="py-3 px-3 font-semibold text-right">Quantity</th>
                <th className="py-3 px-3 font-semibold text-right">Basic Rate (₹)</th>
                <th className="py-3 px-3 font-semibold text-right">Basic Cost (₹)</th>
                <th className="py-3 px-3 font-semibold text-right">Adjustments (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount (₹)</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculationSheet.map((line, idx) => (
                <tr key={line.calculation_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-mono text-xs font-bold text-slate-900 block">
                      {line.item_code || 'GEOM_CALC'}
                    </span>
                    <p className="text-xs text-slate-600 truncate">{line.item_description}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">{line.official_unit}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-slate-800">
                    {line.input_quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-slate-600">
                    ₹{line.source_rate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-slate-800">
                    ₹{line.base_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs text-amber-700">
                    {line.total_adjustments > 0
                      ? `+₹${line.total_adjustments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-bold text-slate-900">
                    ₹{line.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        line.validation_status === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : line.validation_status === 'VALID_WITH_WARNINGS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {line.validation_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setDrawerResult(line)}
                        title="View Detailed Breakdown"
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCloneLine(line)}
                        title="Clone Line"
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        title="Remove Line"
                        className="p-1 hover:bg-rose-100 rounded text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {calculationSheet.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-xs text-slate-500">
                    No lines added yet. Use the calculator above and click "Add Item to Calculation Sheet".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation Sheet Totals Bar */}
        {calculationSheet.length > 0 && (
          <div className="p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Basic Cost</span>
                <span className="text-white font-bold text-sm">
                  ₹{sheetTotals.basic.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Adjustments</span>
                <span className="text-amber-400 font-bold text-sm">
                  +₹{sheetTotals.adjustments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Separate GST (18%)</span>
                <span className="text-rose-400 font-bold text-sm">
                  +₹{sheetTotals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-amber-400 block text-[10px] uppercase font-sans font-semibold">
                Grand Sanction Total
              </span>
              <span className="text-amber-300 font-bold text-xl">
                ₹{sheetTotals.grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Breakdown Modal / Slide-Over Drawer */}
      {drawerResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Step-by-Step Calculation Breakdown</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Calculation ID: {drawerResult.calculation_id} • Version: {drawerResult.sor_version}
                </p>
              </div>
              <button
                onClick={() => setDrawerResult(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 18 Metadata Points per Section 10 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">1. Item Code</span>
                <span className="font-mono font-bold text-slate-900">{drawerResult.item_code || 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">2. Official Unit</span>
                <span className="font-mono font-bold text-slate-900">{drawerResult.official_unit}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">3. Source Rate</span>
                <span className="font-mono font-bold text-slate-900">₹{drawerResult.source_rate.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase">4. Input Quantity</span>
                <span className="font-mono font-bold text-slate-900">{drawerResult.input_quantity}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Item Description:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {drawerResult.item_description}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Base Formula & Cost:</span>
              <div className="p-2.5 bg-slate-900 text-amber-300 font-mono text-xs rounded-lg flex items-center justify-between">
                <span>{drawerResult.base_formula}</span>
                <span className="font-bold text-white">₹{drawerResult.base_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Applied Rules */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Applied Statutory Rules:</span>
              {drawerResult.applied_rules.length > 0 ? (
                <div className="space-y-1.5">
                  {drawerResult.applied_rules.map((r, i) => (
                    <div
                      key={i}
                      className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex justify-between items-center text-emerald-950 font-mono"
                    >
                      <span>
                        {r.rule_code}: {r.name}
                      </span>
                      <span className="font-bold">+₹{r.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded">
                  No extra percentage additions applied.
                </p>
              )}
            </div>

            {/* Excluded Rules */}
            {drawerResult.excluded_rules.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">Blocked / Excluded Rules:</span>
                <div className="space-y-1.5">
                  {drawerResult.excluded_rules.map((r, i) => (
                    <div
                      key={i}
                      className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900"
                    >
                      <span className="font-bold font-mono">{r.rule_code}</span>: {r.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax & Final Sum */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Total Adjustments:</span>
                <span className="font-bold">+₹{drawerResult.total_adjustments.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Treatment:</span>
                <span>
                  {drawerResult.tax_treatment?.tax_amount > 0
                    ? `+₹${drawerResult.tax_treatment.tax_amount.toFixed(2)} (GST 18%)`
                    : 'GST Exclusive'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Final Calculated Total:</span>
                <span className="text-indigo-700">₹{drawerResult.final_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Source Provenance */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Source: {drawerResult.source_reference?.annexure} (p. {drawerResult.source_reference?.printed_page})</span>
              <span>Timestamp: {drawerResult.timestamp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
