import React, { useEffect, useState } from 'react';
import { isDemoMode } from '../services/api';

/**
 * DemoBanner — sticky top bar shown when backend is unreachable.
 * Tells ministers / officials this is a demonstration with pre-loaded sample data.
 */
export const DemoBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Poll isDemoMode after initial auth completes (slight delay for login to run)
    const timer = setTimeout(() => setVisible(isDemoMode), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-800 text-amber-100 text-xs font-bold flex-shrink-0">D</span>
        <span>
          <strong>DEMONSTRATION MODE</strong> — Displaying pre-loaded sample data.
          All figures shown are illustrative. Connect to the TN-HDOS backend for live government data.
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-800 hover:text-amber-950 text-lg leading-none flex-shrink-0"
        aria-label="Dismiss demo banner"
      >
        ×
      </button>
    </div>
  );
};

