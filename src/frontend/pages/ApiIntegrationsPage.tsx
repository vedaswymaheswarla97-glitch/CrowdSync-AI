/**
 * CrowdSync AI — Module C: Cross-Platform Interoperability & Mock Provider Gateway
 * 
 * Demonstrates open integration APIs for mapping services, municipal transit,
 * and event ticketing platforms with rate-limiting and privacy sanitization.
 */

import React, { useState, useEffect } from 'react';
import { MockProvider } from '../types/index.ts';
import { api } from '../services/api.ts';

export const ApiIntegrationsPage: React.FC = () => {
  const [providers, setProviders] = useState<MockProvider[]>([]);
  const [selectedProviderKey, setSelectedProviderKey] = useState<string>('demo-naviroute-key-101');
  const [targetZoneId, setTargetZoneId] = useState<string>('zone_north_gate');
  const [observationsCount, setObservationsCount] = useState<number>(32);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [telemetryResponse, setTelemetryResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const data = await api.getProviders();
      setProviders(data.providers);
      if (data.providers.length > 0 && !selectedProviderKey) {
        setSelectedProviderKey(data.providers[0].apiKey);
      }
    } catch (err: any) {
      console.error('Failed to load providers:', err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSendTelemetry = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTelemetryResponse(null);
    try {
      const res = await api.submitTelemetry(selectedProviderKey, {
        zone_id: targetZoneId,
        raw_observations: observationsCount,
        timestamp: new Date().toISOString(),
      });
      setTelemetryResponse(res);
      await fetchProviders();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="rainbow-text">Cross-Platform Provider Gateway</span>
        </h1>
        <p className="text-xs text-slate-400">
          Standardized REST APIs and mock adapters for transit authorities, navigation apps, and event gateways
        </p>
      </div>

      {/* Provider Status Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Registered Integration Partners (Mock Providers)</h2>
          <span className="text-xs font-mono text-slate-400">Rate Limit: 60 req/min per key</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-xl border transition-all ${
                selectedProviderKey === p.apiKey
                  ? 'bg-slate-900 border-teal-500/50 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase">{p.category}</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {p.status}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white mt-2">{p.name}</h3>

              <div className="mt-3 space-y-1 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>API Key:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{p.apiKey}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pulses:</span>
                  <span className="text-teal-400 font-bold tabular-nums">{p.totalEventsReceived}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Last Ingest:</span>
                  <span>{new Date(p.lastPing).toLocaleTimeString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProviderKey(p.apiKey)}
                className={`mt-4 w-full py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedProviderKey === p.apiKey
                    ? 'bg-teal-400 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {selectedProviderKey === p.apiKey ? 'Active Ingest Key' : 'Select for Testing'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Telemetry Ingest Tester */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white">Live Telemetry Ingestion Console</h2>
          <p className="text-xs text-slate-400">
            Submit synthetic pedestrian pulses via <code>POST /api/v1/providers/telemetry</code> and observe privacy filtering in real time
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Provider API Key:</label>
            <input
              type="text"
              value={selectedProviderKey}
              onChange={(e) => setSelectedProviderKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Target Zone ID:</label>
            <select
              value={targetZoneId}
              onChange={(e) => setTargetZoneId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
            >
              <option value="zone_north_gate">zone_north_gate (North Main Gate)</option>
              <option value="zone_east_plaza">zone_east_plaza (East Plaza Shuttle)</option>
              <option value="zone_west_loop">zone_west_loop (West Esplanade Loop)</option>
              <option value="zone_lot_c">zone_lot_c (Lot C Ride-Hail)</option>
              <option value="zone_south_station">zone_south_station (South Rail)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 block mb-1.5 font-medium">Raw Aggregate Count:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="200"
                value={observationsCount}
                onChange={(e) => setObservationsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
              />
              <button
                onClick={handleSendTelemetry}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl rainbow-gradient text-white font-extrabold text-xs shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md"
              >
                {isSubmitting ? 'Ingesting...' : 'Send Pulse'}
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Response Output */}
        {telemetryResponse && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-teal-400 font-semibold flex items-center justify-between">
              <span>✓ HTTP 200 Telemetry Accepted</span>
              <span className="text-slate-400 text-[11px]">
                Rate Limit Remaining: {telemetryResponse.rate_limit_remaining} / 60
              </span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(telemetryResponse, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* REST API Endpoints Specification Explorer */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Standard REST API Surface Reference</h2>
        <p className="text-xs text-slate-400">
          All endpoints accept and return standardized JSON schemas with UTC ISO-8601 timestamps
        </p>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200">/api/v1/zones</span>
            </div>
            <span className="text-slate-500 text-[11px]">Returns all zones, capacities, and live coordinates</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200">/api/v1/crowd/status</span>
            </div>
            <span className="text-slate-500 text-[11px]">Aggregated system-wide capacity and active choke points</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sky-400 font-bold">POST</span>
              <span className="text-slate-200">/api/v1/predictions</span>
            </div>
            <span className="text-slate-500 text-[11px]">Runs predictive horizon analysis and TTCE estimations</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sky-400 font-bold">POST</span>
              <span className="text-slate-200">/api/v1/providers/telemetry</span>
            </div>
            <span className="text-slate-500 text-[11px]">External provider ingestion (Bearer auth & rate-limited)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sky-400 font-bold">POST</span>
              <span className="text-slate-200">/api/v1/privacy/zk-verify</span>
            </div>
            <span className="text-slate-500 text-[11px]">Verifies zero-knowledge proximity proof without location data</span>
          </div>
        </div>
      </section>
    </div>
  );
};
