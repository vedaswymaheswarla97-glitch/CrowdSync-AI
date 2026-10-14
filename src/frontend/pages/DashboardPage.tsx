/**
 * CrowdSync AI — Main Operations Dashboard
 * Displays live schematic network map, real-time KPI metrics, risk forecasts,
 * and clickable zone management controls.
 */

import React, { useState } from 'react';
import { Zone, PredictionResult, CrowdStatus } from '../types/index.ts';
import { SchematicMap } from '../components/SchematicMap.tsx';
import { MetricsOverview } from '../components/MetricsOverview.tsx';
import { ZkProofModal } from '../components/ZkProofModal.tsx';
import { api } from '../services/api.ts';

interface DashboardPageProps {
  zones: Zone[];
  predictions: Record<string, PredictionResult>;
  crowdStatus: CrowdStatus | null;
  onRefreshData: () => Promise<void>;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  zones,
  predictions,
  crowdStatus,
  onRefreshData,
  onNavigateToTab,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_north_gate');
  const [isZkModalOpen, setIsZkModalOpen] = useState<boolean>(false);
  const [isUpdatingZone, setIsUpdatingZone] = useState<boolean>(false);
  const [isPulsingTraffic, setIsPulsingTraffic] = useState<boolean>(false);

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];
  const selectedPrediction = selectedZone ? predictions[selectedZone.id] : null;

  // Handler to adjust zone capacity or current count interactively
  const handleUpdateZoneCount = async (delta: number) => {
    if (!selectedZone) return;
    setIsUpdatingZone(true);
    try {
      const newCount = Math.max(0, selectedZone.currentCount + delta);
      await api.updateZone(selectedZone.id, { currentCount: newCount });
      await onRefreshData();
    } catch (err: any) {
      console.error('Failed to update zone count:', err);
    } finally {
      setIsUpdatingZone(false);
    }
  };

  const handleUpdateZoneCapacity = async (newCapacity: number) => {
    if (!selectedZone || newCapacity < 20) return;
    setIsUpdatingZone(true);
    try {
      await api.updateZone(selectedZone.id, { capacity: newCapacity });
      await onRefreshData();
    } catch (err: any) {
      console.error('Failed to update capacity:', err);
    } finally {
      setIsUpdatingZone(false);
    }
  };

  // Simulate an influx pulse of +25 attendees
  const handleSimulatePulse = async () => {
    if (!selectedZone) return;
    setIsPulsingTraffic(true);
    try {
      await api.updateZone(selectedZone.id, {
        currentCount: selectedZone.currentCount + 25,
        arrivalRate: selectedZone.arrivalRate + 8,
      });
      await onRefreshData();
    } catch (err: any) {
      console.error('Pulse failed:', err);
    } finally {
      setIsPulsingTraffic(false);
    }
  };

  const totalHeadroom = Object.values(predictions).reduce((sum, p) => sum + p.additionalSafeArrivals, 0);
  const totalRedirects = Object.values(predictions).reduce((sum, p) => sum + p.suggestedRedirectCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top operational controls & KPI strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="rainbow-text">Active Crowd Coordination Grid</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry and predictive horizon analytics across campus egress nodes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulatePulse}
            disabled={isPulsingTraffic}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer shadow-sm"
          >
            {isPulsingTraffic ? 'Injecting Flow...' : '⚡ +25 Demand Pulse'}
          </button>
          <button
            onClick={() => onRefreshData()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            ↻ Refresh State
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <MetricsOverview
        status={crowdStatus}
        totalSafeHeadroom={totalHeadroom}
        totalSuggestedRedirects={totalRedirects}
      />

      {/* Main Grid: Interactive Map + Selected Zone Inspector */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vector Schematic Map */}
        <div className="lg:col-span-8">
          <SchematicMap
            zones={zones}
            predictions={predictions}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => setSelectedZoneId(id)}
          />
        </div>

        {/* Right: Selected Zone Inspector & Actions */}
        <div className="lg:col-span-4 space-y-4">
          {selectedZone && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 rainbow-gradient" />
              {/* Zone Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-teal-400 font-semibold">{selectedZone.code}</div>
                  <h2 className="text-lg font-bold text-white leading-snug">{selectedZone.name}</h2>
                </div>
                {selectedPrediction && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                    selectedPrediction.riskCategory === 'Critical'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : selectedPrediction.riskCategory === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : selectedPrediction.riskCategory === 'Moderate'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedPrediction.riskCategory} Risk
                  </span>
                )}
              </div>

              {/* Occupancy and Velocity Gauges */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Occupancy:</span>
                  <span className="font-mono text-white font-bold tabular-nums">
                    {selectedZone.currentCount} / {selectedZone.capacity} (
                    {Math.round((selectedZone.currentCount / selectedZone.capacity) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (selectedZone.currentCount / selectedZone.capacity) >= 1.0
                        ? 'bg-red-500'
                        : (selectedZone.currentCount / selectedZone.capacity) >= 0.85
                        ? 'bg-amber-500'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, (selectedZone.currentCount / selectedZone.capacity) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-500">Arrival Rate</div>
                    <div className="text-teal-400 font-semibold tabular-nums">+{selectedZone.arrivalRate}/min</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-500">Departure Rate</div>
                    <div className="text-slate-300 font-semibold tabular-nums">-{selectedZone.departureRate}/min</div>
                  </div>
                </div>
              </div>

              {/* Predictive Engine Horizon Analysis */}
              {selectedPrediction && (
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-400 font-medium">15-Minute Horizon Forecast:</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500">Predicted Demand:</span>{' '}
                      <span className="text-white font-semibold tabular-nums">{selectedPrediction.predictedDemand}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Risk Score:</span>{' '}
                      <span className="text-teal-400 font-semibold tabular-nums">{selectedPrediction.riskScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Time Until Exceeded:</span>{' '}
                      <span className="text-amber-400 font-semibold">
                        {selectedPrediction.timeUntilCapacityExceededMinutes !== null
                          ? `${selectedPrediction.timeUntilCapacityExceededMinutes}m`
                          : 'Safe'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Safe Headroom:</span>{' '}
                      <span className="text-emerald-400 font-semibold tabular-nums">+{selectedPrediction.additionalSafeArrivals}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-semibold">Recommended Intervention: </span>
                    {selectedPrediction.recommendedIntervention}
                  </div>
                </div>
              )}

              {/* Interactive Node Adjustment Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Live Simulation Overrides:</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateZoneCount(-10)}
                    disabled={isUpdatingZone || selectedZone.currentCount <= 0}
                    className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                  >
                    -10 Crowd
                  </button>
                  <button
                    onClick={() => handleUpdateZoneCount(10)}
                    disabled={isUpdatingZone}
                    className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                  >
                    +10 Crowd
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Node Capacity:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <button
                      onClick={() => handleUpdateZoneCapacity(selectedZone.capacity - 20)}
                      disabled={isUpdatingZone || selectedZone.capacity <= 40}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-white font-semibold tabular-nums">{selectedZone.capacity}</span>
                    <button
                      onClick={() => handleUpdateZoneCapacity(selectedZone.capacity + 20)}
                      disabled={isUpdatingZone}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: ZKP eligibility & Incentives */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setIsZkModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700/80 hover:border-cyan-500/80 text-white font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span className="rainbow-text text-sm">★</span>
                  <span>Demonstrate Zero-Knowledge Eligibility</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('incentives')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  View Active Vouchers for this Zone →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alternative Recommendations Strip */}
      {selectedPrediction && selectedPrediction.recommendedAlternatives.length > 0 && (
        <section className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recommended Voluntary Alternatives</h3>
              <p className="text-xs text-slate-400">
                Ranked by available capacity headroom, pedestrian walking distance, and system relief
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('incentives')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
            >
              Browse Incentive Center →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {selectedPrediction.recommendedAlternatives.map((alt) => (
              <div
                key={alt.zoneId}
                onClick={() => setSelectedZoneId(alt.zoneId)}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-teal-400 font-medium">
                    {alt.walkingTimeMinutes} min walk
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                    +{alt.incentivePoints} pts
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                  {alt.zoneName}
                </h4>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Available Space:</span>
                  <span className="text-slate-200 tabular-nums">{alt.availableCapacity} slots</span>
                </div>
                <div className="text-xs text-slate-400">
                  Relieves ~{alt.estimatedCongestionReduction}% origin pressure
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Zero Knowledge Modal */}
      {selectedZone && (
        <ZkProofModal
          isOpen={isZkModalOpen}
          onClose={() => setIsZkModalOpen(false)}
          zoneId={selectedZone.id}
          zoneName={selectedZone.name}
        />
      )}
    </div>
  );
};
