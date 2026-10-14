/**
 * CrowdSync AI — Interactive Schematic Campus Map
 * 
 * High-fidelity vector campus representation with live congestion heatmaps,
 * animated flow vectors, capacity utilization gauges, and clickable zone selection.
 * Requires zero paid third-party tile APIs.
 */

import React from 'react';
import { Zone, PredictionResult } from '../types/index.ts';

interface SchematicMapProps {
  zones: Zone[];
  predictions: Record<string, PredictionResult>;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  zones,
  predictions,
  selectedZoneId,
  onSelectZone,
}) => {
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.25)', text: 'text-red-400' };
      case 'High':
        return { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.25)', text: 'text-amber-400' };
      case 'Moderate':
        return { stroke: '#38BDF8', fill: 'rgba(56, 189, 248, 0.20)', text: 'text-sky-400' };
      default:
        return { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.20)', text: 'text-emerald-400' };
    }
  };

  return (
    <div className="relative w-full rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl overflow-hidden">
      {/* Map Header / Mode Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Campus Egress Network Topology</h2>
          <p className="text-xs text-slate-400">
            Real-time capacity utilization, pedestrian pathways, and predicted choke points
          </p>
        </div>
        
        {/* Risk Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>&lt;70% Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>70-89% Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>90-99% High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>&ge;100% Critical</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800/80">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="1" />
            </pattern>

            {/* Rainbow Linear Gradients */}
            <linearGradient id="rainbowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>

            <linearGradient id="rainbowGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <linearGradient id="rainbowGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <linearGradient id="rainbowFull" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="20%" stopColor="#fb923c" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="80%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Pulsing Glow Filters */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Rainbow Flow Arrow Marker */}
            <marker id="rainbowArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="620" fill="url(#grid)" />

          {/* Campus Geographic Features: Stadium / Arena Footprint */}
          <g opacity="0.85">
            <ellipse cx="500" cy="80" rx="160" ry="60" fill="rgba(30, 41, 59, 0.7)" stroke="url(#rainbowFull)" strokeWidth="2.5" />
            <text x="500" y="85" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700" letterSpacing="2">
              CAMPUS CHAMPIONSHIP ARENA (5,000 SEATS)
            </text>
          </g>

          {/* Central Campus Green / Plaza */}
          <rect x="380" y="280" width="240" height="130" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="#334155" strokeWidth="1.5" />
          <text x="500" y="350" textAnchor="middle" fill="#94a3b8" fontSize="11" letterSpacing="1">
            CENTRAL COMMONS PLAZA
          </text>

          {/* Inter-Zone Pedestrian Arterials & Roads with Rainbow Flow Strokes */}
          {/* Path 1: North Gate to East Plaza (Glowing Rainbow) */}
          <path
            d="M 500 160 Q 640 180 780 260"
            fill="none"
            stroke="url(#rainbowGrad1)"
            strokeWidth="3.5"
            strokeDasharray="8 4"
            markerEnd="url(#rainbowArrow)"
            filter="url(#glow)"
            opacity="0.85"
          />
          <text x="660" y="200" fill="#facc15" fontSize="11" fontFamily="monospace" fontWeight="600">
            4 min walk · +70 pts
          </text>

          {/* Path 2: North Gate to West Loop (Glowing Rainbow) */}
          <path
            d="M 500 160 Q 360 190 220 320"
            fill="none"
            stroke="url(#rainbowGrad2)"
            strokeWidth="3.5"
            strokeDasharray="8 4"
            markerEnd="url(#rainbowArrow)"
            filter="url(#glow)"
            opacity="0.85"
          />
          <text x="310" y="220" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="600">
            6 min walk · +90 pts
          </text>

          {/* Path 3: North Gate to Lot C */}
          <path
            d="M 500 160 L 490 490"
            fill="none"
            stroke="url(#rainbowGrad3)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.7"
          />

          {/* Path 4: East Plaza to Lot C */}
          <path
            d="M 780 260 Q 660 410 490 490"
            fill="none"
            stroke="url(#rainbowGrad2)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Path 5: West Loop to Lot C */}
          <path
            d="M 220 320 Q 330 450 490 490"
            fill="none"
            stroke="url(#rainbowGrad1)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Path 6: Lot C to South Rail Connector */}
          <path
            d="M 490 490 L 520 560"
            fill="none"
            stroke="url(#rainbowFull)"
            strokeWidth="3.5"
            opacity="0.8"
          />

          {/* Zone Nodes */}
          {zones.map((zone) => {
            const pred = predictions[zone.id];
            const risk = pred?.riskCategory ?? 'Low';
            const colors = getRiskColor(risk);
            const isSelected = selectedZoneId === zone.id;
            const utilPct = Math.round((zone.currentCount / zone.capacity) * 100);

            return (
              <g
                key={zone.id}
                transform={`translate(${zone.coordinates.x}, ${zone.coordinates.y})`}
                onClick={() => onSelectZone(zone.id)}
                className="cursor-pointer group"
              >
                {/* Outer Glow Halo for Selected or Critical */}
                {(isSelected || risk === 'Critical') && (
                  <circle
                    r="48"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                    filter="url(#glow)"
                  />
                )}

                {/* Base Zone Circle */}
                <circle
                  r="34"
                  fill="#0F172A"
                  stroke={isSelected ? '#38BDF8' : colors.stroke}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="transition-all duration-300 group-hover:scale-105"
                />

                {/* Capacity Radial Progress Ring */}
                <circle
                  r="30"
                  fill="none"
                  stroke="rgba(30, 41, 59, 0.8)"
                  strokeWidth="4"
                />
                <circle
                  r="30"
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="4"
                  strokeDasharray={`${(Math.min(100, utilPct) / 100) * 188.5} 188.5`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />

                {/* Zone Code Label */}
                <text
                  textAnchor="middle"
                  y="-4"
                  fill="#F8FAFC"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  {zone.code}
                </text>

                {/* Occupancy Count */}
                <text
                  textAnchor="middle"
                  y="12"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {zone.currentCount}/{zone.capacity}
                </text>

                {/* Subtitle / Risk Indicator Label Banner */}
                <g transform="translate(0, 48)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="20"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke={colors.stroke}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y="2"
                    fill="#F1F5F9"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {zone.name.split(' (')[0]} ({utilPct}%)
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Live Map Watermark & Time Context */}
        <div className="absolute bottom-3 left-3 text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800">
          <span>Coordinate Network: 5 Core Nodes</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Aggregated Zone Telemetry Active</span>
        </div>
      </div>
    </div>
  );
};
