/**
 * CrowdSync AI — System Metrics Overview
 * Adheres strictly to Zero-Pill & Tabular Numerals discipline.
 */

import React from 'react';
import { CrowdStatus } from '../types/index.ts';

interface MetricsOverviewProps {
  status: CrowdStatus | null;
  totalSafeHeadroom: number;
  totalSuggestedRedirects: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  status,
  totalSafeHeadroom,
  totalSuggestedRedirects,
}) => {
  if (!status) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-900 rounded-xl border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Metric 1: Overall Utilization */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 rainbow-gradient" />
        <div className="text-xs text-slate-400 font-medium">Network Utilization</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono tabular-nums text-white">
            {status.overallUtilization}%
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {status.totalCurrentCount} / {status.totalCapacity}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span>Active Influx</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 font-mono font-semibold">
            +{status.zones.reduce((sum, z) => sum + Math.max(0, z.netFlow), 0)}/min
          </span>
        </div>
      </div>

      {/* Metric 2: Choke Points / Critical Zones */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-400" />
        <div className="text-xs text-slate-400 font-medium">Critical Risk Zones</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-2xl font-black font-mono tabular-nums ${
            status.criticalZoneCount > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {status.criticalZoneCount}
          </span>
          <span className="text-xs text-slate-400">
            of {status.zones.length} nodes
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span>High Risk Watch</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-amber-400 font-semibold">{status.highRiskZoneCount} zones</span>
        </div>
      </div>

      {/* Metric 3: Safe Capacity Headroom */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <div className="text-xs text-slate-400 font-medium">Safe Capacity Headroom</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
            {totalSafeHeadroom}
          </span>
          <span className="text-xs text-slate-400">absorbable arrivals</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span>Distributed across</span>
          <span aria-hidden="true">·</span>
          <span className="text-teal-300">4 peripheral hubs</span>
        </div>
      </div>

      {/* Metric 4: Target Voluntary Redirects */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />
        <div className="text-xs text-slate-400 font-medium">Recommended Diversions</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono tabular-nums text-cyan-400">
            {totalSuggestedRedirects}
          </span>
          <span className="text-xs text-slate-400">attendees</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span>Game-Theoretic Incentives</span>
          <span aria-hidden="true">·</span>
          <span className="rainbow-text font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
};
