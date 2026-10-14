/**
 * CrowdSync AI — Module D & E: Privacy Architecture & Zero-Knowledge Verification
 * 
 * Enforces data minimization, k-anonymity aggregation, differential privacy,
 * and zero-knowledge location proofs.
 */

import React, { useState, useEffect } from 'react';
import { PrivacyConfig, AuditEvent } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ZkProofModal } from '../components/ZkProofModal.tsx';

export const PrivacyCenterPage: React.FC = () => {
  const [config, setConfig] = useState<PrivacyConfig | null>(null);
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [isZkModalOpen, setIsZkModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Interactive Differential Privacy Test Tool
  const [dpRawInput, setDpRawInput] = useState<number>(45);
  const [dpSimulatedNoisy, setDpSimulatedNoisy] = useState<number | null>(null);

  const fetchPrivacyStatus = async () => {
    try {
      const data = await api.getPrivacyStatus();
      setConfig(data.config);
      setAudits(data.recentAudits);
    } catch (err: any) {
      console.error('Failed to load privacy status:', err);
    }
  };

  useEffect(() => {
    fetchPrivacyStatus();
  }, []);

  const handleSaveConfig = async (newConfig: Partial<PrivacyConfig>) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updatePrivacyConfig(newConfig);
      setConfig(res.updatedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to update config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const runDpNoiseSimulator = (raw: number, epsilon: number) => {
    const scale = 1.0 / Math.max(0.01, epsilon);
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    setDpSimulatedNoisy(Math.max(0, Math.round(raw + noise)));
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="rainbow-text">Privacy Architecture &amp; Cryptographic Integrity</span>
        </h1>
        <p className="text-xs text-slate-400">
          Mathematical privacy guarantees: k-anonymity aggregation, calibrated Laplace noise, and zero GPS tracking
        </p>
      </div>

      {/* 5-Level Privacy Taxonomy Comparison Card */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Privacy Taxonomy & Security Model</h2>
          <p className="text-xs text-slate-400">
            Distinguishing standard pseudonymization from real cryptographic guarantees
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-mono text-amber-400 font-semibold">1. Pseudonymization</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Replacing real names with random session tokens. Vulnerable to location fingerprinting and trajectory reconstruction if individual traces are retained.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-mono text-sky-400 font-semibold">2. Aggregation</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Publishing only zone-level counts rather than discrete paths. Protects individual points as long as group sizes remain above the k-threshold.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-mono text-teal-400 font-semibold">3. K-Anonymity</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Strict suppression of any zone observation with fewer than <i>k</i> requests (e.g. k=5), preventing single-attendee re-identification.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-mono text-emerald-400 font-semibold">4. Differential Privacy</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Injecting calibrated Laplace noise Lap(1/ε). Guarantees that whether an individual is present or absent cannot be inferred mathematically.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/40 space-y-1.5 ring-1 ring-teal-500/20">
            <div className="font-mono text-teal-300 font-semibold">5. Zero-Knowledge Proofs</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Prover certifies proximity to an incentive zone via cryptographic hash commitments without ever transmitting (lat, lng) to the central server.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Controls & Policy Sliders */}
      {config && (
        <section className="grid md:grid-cols-2 gap-6">
          {/* Policy Settings Panel */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Configurable Data Minimization Controls</h3>
              {saveSuccess && <span className="text-xs font-mono text-emerald-400">✓ Policy Updated</span>}
            </div>

            {/* Setting 1: K-Anonymity Threshold */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">K-Anonymity Suppression Threshold:</span>
                <span className="font-mono text-teal-400 font-bold tabular-nums">k ≥ {config.kAnonymityThreshold}</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={config.kAnonymityThreshold}
                onChange={(e) => handleSaveConfig({ kAnonymityThreshold: Number(e.target.value) })}
                className="w-full accent-teal-400"
              />
              <p className="text-[11px] text-slate-500">
                Any zone reporting fewer than {config.kAnonymityThreshold} concurrent users will be automatically suppressed to prevent re-identification.
              </p>
            </div>

            {/* Setting 2: Differential Privacy Epsilon */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Differential Privacy Budget (ε Epsilon):</span>
                <span className="font-mono text-teal-400 font-bold tabular-nums">ε = {config.differentialPrivacyEpsilon}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={config.differentialPrivacyEpsilon}
                onChange={(e) => handleSaveConfig({ differentialPrivacyEpsilon: Number(e.target.value) })}
                className="w-full accent-teal-400"
              />
              <p className="text-[11px] text-slate-500">
                Lower epsilon (0.2–0.5) injects higher noise for stronger privacy. Higher epsilon (1.0–2.0) yields higher data accuracy.
              </p>
            </div>

            {/* Setting 3: Retention Purge */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Automated Data Expiration & Purge:</span>
                <span className="font-mono text-teal-400 font-bold tabular-nums">{config.dataRetentionMinutes} mins</span>
              </div>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={config.dataRetentionMinutes}
                onChange={(e) => handleSaveConfig({ dataRetentionMinutes: Number(e.target.value) })}
                className="w-full accent-teal-400"
              />
              <p className="text-[11px] text-slate-500">
                Temporary telemetry caches are purged automatically every {config.dataRetentionMinutes} minutes.
              </p>
            </div>
          </div>

          {/* Differential Privacy Live Lab */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Differential Privacy Noise Injector</h3>
              <p className="text-xs text-slate-400">
                Test how the Laplace mechanism masks exact zone counts
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">True Count of Attendees in Zone:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={dpRawInput}
                    onChange={(e) => setDpRawInput(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                  <span className="font-mono text-sm text-white font-bold tabular-nums">{dpRawInput}</span>
                </div>
              </div>

              <button
                onClick={() => runDpNoiseSimulator(dpRawInput, config.differentialPrivacyEpsilon)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-mono text-xs border border-teal-500/30 cursor-pointer transition-colors"
              >
                Sample Laplace Noise (Scale = {(1.0 / config.differentialPrivacyEpsilon).toFixed(2)})
              </button>

              {dpSimulatedNoisy !== null && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">True Value:</span>
                    <span className="text-slate-200 font-bold tabular-nums">{dpRawInput}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Published Value (Noisy):</span>
                    <span className="text-teal-400 font-bold tabular-nums text-sm">{dpSimulatedNoisy}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Noise Delta:</span>
                    <span className="text-sky-400 font-bold tabular-nums">
                      {dpSimulatedNoisy - dpRawInput >= 0 ? `+${dpSimulatedNoisy - dpRawInput}` : dpSimulatedNoisy - dpRawInput}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    An attacker cannot determine with certainty whether a specific individual was part of this cohort.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsZkModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl rainbow-gradient text-white font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                Launch Interactive Zero-Knowledge Prover
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Audit Log Trail */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Immutable Privacy Audit Log</h3>
            <p className="text-xs text-slate-400">Recent telemetry ingestions, ZKP verifications, and threshold checks</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{audits.length} events logged</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {audits.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800/60 flex items-start justify-between gap-4 text-xs font-mono"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    event.eventType === 'ZK_PROOF_VERIFIED' ? 'text-teal-300' :
                    event.eventType === 'TELEMETRY_INGESTED' ? 'text-sky-300' : 'text-amber-300'
                  }`}>
                    {event.eventType}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{event.source}</span>
                </div>
                <div className="text-slate-300 text-[11px]">{event.details}</div>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ZKP Modal */}
      <ZkProofModal
        isOpen={isZkModalOpen}
        onClose={() => {
          setIsZkModalOpen(false);
          fetchPrivacyStatus();
        }}
        zoneId="zone_east_plaza"
        zoneName="East Plaza Shuttle Hub"
      />
    </div>
  );
};
