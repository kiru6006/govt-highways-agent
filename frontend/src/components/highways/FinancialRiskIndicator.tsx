import React from 'react';
import { CircleDollarSign, AlertCircle, FileSearch, CheckCircle, TrendingUp } from 'lucide-react';

export interface FinancialRiskData {
  actualAdditionalExpenditureCr?: number;
  forecastIncrementalExpenditureCr?: number;
  contractorClaimsPendingCr?: number;
  potentiallyAvoidableLossCr?: number;
  confirmedRecoverableLossCr?: number;
  notYetQuantified?: boolean;
  notes?: string;
}

interface FinancialRiskIndicatorProps {
  data: FinancialRiskData;
  layout?: 'badge' | 'detailed' | 'table-cell';
  className?: string;
}

export const FinancialRiskIndicator: React.FC<FinancialRiskIndicatorProps> = ({
  data,
  layout = 'badge',
  className = '',
}) => {
  const {
    actualAdditionalExpenditureCr = 0,
    forecastIncrementalExpenditureCr = 0,
    contractorClaimsPendingCr = 0,
    potentiallyAvoidableLossCr = 0,
    confirmedRecoverableLossCr = 0,
    notYetQuantified = false,
  } = data;

  const totalQuantified =
    actualAdditionalExpenditureCr +
    forecastIncrementalExpenditureCr +
    contractorClaimsPendingCr;

  if (layout === 'table-cell') {
    if (notYetQuantified && totalQuantified === 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
          title="Root cause & financial impact pending formal investigation"
        >
          <FileSearch className="w-3 h-3 text-slate-500" />
          <span>Not Quantified (Review req.)</span>
        </span>
      );
    }

    return (
      <div className={`space-y-0.5 ${className}`}>
        {actualAdditionalExpenditureCr > 0 && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="font-mono">₹{actualAdditionalExpenditureCr.toFixed(2)} Cr</span>
            <span className="text-[9px] uppercase tracking-wider text-red-600">Incurred</span>
          </div>
        )}
        {forecastIncrementalExpenditureCr > 0 && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="font-mono">₹{forecastIncrementalExpenditureCr.toFixed(2)} Cr</span>
            <span className="text-[9px] uppercase tracking-wider text-amber-700">Forecast</span>
          </div>
        )}
        {contractorClaimsPendingCr > 0 && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="font-mono">₹{contractorClaimsPendingCr.toFixed(2)} Cr</span>
            <span className="text-[9px] uppercase tracking-wider text-purple-600">Claim</span>
          </div>
        )}
        {totalQuantified === 0 && !notYetQuantified && (
          <span className="text-xs text-slate-500 font-mono">₹0.00 Cr (No extra exp.)</span>
        )}
      </div>
    );
  }

  if (layout === 'badge') {
    if (notYetQuantified && totalQuantified === 0) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <FileSearch className="w-3.5 h-3.5 text-slate-500" />
          <span>Financial impact: Review required</span>
        </span>
      );
    }

    return (
      <div className={`flex flex-wrap gap-1.5 items-center ${className}`}>
        {actualAdditionalExpenditureCr > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <CircleDollarSign className="w-3.5 h-3.5 text-red-600" />
            <span>Actual Addl: ₹{actualAdditionalExpenditureCr.toFixed(2)} Cr</span>
          </span>
        )}
        {forecastIncrementalExpenditureCr > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Forecast Incr: ₹{forecastIncrementalExpenditureCr.toFixed(2)} Cr</span>
          </span>
        )}
        {contractorClaimsPendingCr > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Claims: ₹{contractorClaimsPendingCr.toFixed(2)} Cr</span>
          </span>
        )}
      </div>
    );
  }

  // Detailed layout with all 6 ledger accounts
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <CircleDollarSign className="w-4 h-4 text-slate-600" />
          <span>Financial Exposure & Loss Ledger</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-500">6 Line Item Breakdown</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        {/* Line 1: Actual additional expenditure */}
        <div className="p-2.5 rounded-lg border border-red-200 bg-red-50/50">
          <div className="text-[10px] font-semibold uppercase text-red-800">
            1. Actual Additional Expenditure Incurred
          </div>
          <div className="text-base font-bold font-mono text-red-700 mt-1">
            ₹{actualAdditionalExpenditureCr.toFixed(2)} Cr
          </div>
        </div>

        {/* Line 2: Forecast incremental expenditure */}
        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
          <div className="text-[10px] font-semibold uppercase text-amber-800">
            2. Forecast Incremental to Complete
          </div>
          <div className="text-base font-bold font-mono text-amber-700 mt-1">
            ₹{forecastIncrementalExpenditureCr.toFixed(2)} Cr
          </div>
        </div>

        {/* Line 3: Contractor claims */}
        <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
          <div className="text-[10px] font-semibold uppercase text-purple-800">
            3. Contractor Claims Pending Determination
          </div>
          <div className="text-base font-bold font-mono text-purple-700 mt-1">
            ₹{contractorClaimsPendingCr.toFixed(2)} Cr
          </div>
        </div>

        {/* Line 4: Avoidable loss under mitigation */}
        <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
          <div className="text-[10px] font-semibold uppercase text-blue-800">
            4. Potentially Avoidable Loss Under Mitigation
          </div>
          <div className="text-base font-bold font-mono text-blue-700 mt-1">
            ₹{potentiallyAvoidableLossCr.toFixed(2)} Cr
          </div>
        </div>

        {/* Line 5: Confirmed recoverable loss */}
        <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
          <div className="text-[10px] font-semibold uppercase text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>5. Confirmed Recoverable Loss</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-700 mt-1">
            ₹{confirmedRecoverableLossCr.toFixed(2)} Cr
          </div>
        </div>

        {/* Line 6: Review required / unquantified */}
        <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
          <div className="text-[10px] font-semibold uppercase text-slate-700 flex items-center gap-1">
            <FileSearch className="w-3 h-3 text-slate-500" />
            <span>6. Unquantified / Investigation Pending</span>
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            {notYetQuantified ? 'Review Required' : 'None Outstanding'}
          </div>
        </div>
      </div>
    </div>
  );
};

