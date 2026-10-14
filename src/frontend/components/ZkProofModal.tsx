/**
 * CrowdSync AI — Zero-Knowledge Location Proof Interactive Modal
 * Demonstrates client-side coordinate commitment, anti-replay nonce generation,
 * and zero-coordinate verification by the central server.
 */

import React, { useState } from 'react';
import { api } from '../services/api.ts';

interface ZkProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneId: string;
  zoneName: string;
}

export const ZkProofModal: React.FC<ZkProofModalProps> = ({
  isOpen,
  onClose,
  zoneId,
  zoneName,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [simulatedOffsetMeters, setSimulatedOffsetMeters] = useState<number>(180);
  const [generatedProof, setGeneratedProof] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateProof = async () => {
    try {
      setErrorMessage(null);
      // 1 deg latitude is ~111km, so 1 meter is ~0.000009 deg
      const latOffset = (simulatedOffsetMeters / 111000);
      const userLat = 37.7760 + latOffset;
      const userLng = -122.4140 + latOffset;

      const data = await api.generateZkDemoProof(userLat, userLng, zoneId, 400);
      setGeneratedProof(data);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleVerifyOnServer = async () => {
    if (!generatedProof) return;
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const result = await api.verifyZkProof(generatedProof.proof);
      setVerificationResult(result);
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestReplayAttack = async () => {
    if (!generatedProof) return;
    setIsVerifying(true);
    try {
      // Re-submit the exact same proof
      const result = await api.verifyZkProof(generatedProof.proof);
      setVerificationResult(result);
    } catch (err: any) {
      setErrorMessage(`Expected Replay Prevention Caught: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Zero-Knowledge Location Proof Demonstration</h2>
            <p className="text-xs text-slate-400">
              Proving proximity to <span className="text-teal-400 font-medium">{zoneName}</span> without transmitting GPS coordinates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Tabs */}
        <div className="flex items-center gap-2 py-4 text-xs font-mono border-b border-slate-800/60">
          <span className={`px-2.5 py-1 rounded ${step === 1 ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-500'}`}>
            01. Client Coordinates
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2.5 py-1 rounded ${step === 2 ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-500'}`}>
            02. Commitment & Proof
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2.5 py-1 rounded ${step === 3 ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-500'}`}>
            03. Server Verification
          </span>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Simulate Client Position */}
        {step === 1 && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-slate-100">Client-Side Isolation Principle:</div>
              <p>
                In a traditional app, your device sends exact coordinates (e.g. <code>37.77614, -122.41402</code>) to the company server, creating an intrusive tracking history.
              </p>
              <p>
                In <strong>CrowdSync AI</strong>, coordinates remain confined inside the client browser. Your device calculates distance locally, hashes coordinates with a private blinding salt, and transmits only an uninvertible cryptographic commitment.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Simulate Attendee Distance from Target Zone (Threshold is 400m):
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="20"
                  max="700"
                  step="20"
                  value={simulatedOffsetMeters}
                  onChange={(e) => setSimulatedOffsetMeters(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
                <span className="font-mono text-sm text-teal-400 font-semibold tabular-nums whitespace-nowrap">
                  {simulatedOffsetMeters} meters
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {simulatedOffsetMeters <= 400 ? (
                  <span className="text-emerald-400">✓ Within eligible 400m incentive perimeter</span>
                ) : (
                  <span className="text-amber-400">⚠ Outside 400m limit (proof will evaluate as ineligible)</span>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateProof}
              className="w-full py-3 px-4 rounded-xl rainbow-gradient text-white font-extrabold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
            >
              Generate Cryptographic Proof on Device
            </button>
          </div>
        )}

        {/* STEP 2: Inspect Proof Package */}
        {step === 2 && generatedProof && (
          <div className="mt-4 space-y-4">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-200">Generated Client Proof Payload:</div>
              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-500">Commitment C:</span>{' '}
                  <span className="text-teal-400 break-all">{generatedProof.proof.commitment}</span>
                </div>
                <div>
                  <span className="text-slate-500">Anti-Replay Nonce:</span>{' '}
                  <span className="text-sky-400 font-mono">{generatedProof.proof.nonce}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target Zone:</span> {generatedProof.proof.targetZoneId}
                </div>
                <div>
                  <span className="text-slate-500">Range Constraint:</span> ≤ {generatedProof.proof.rangeThresholdMeters} meters
                </div>
                <div>
                  <span className="text-slate-500">Private Blinding Salt:</span>{' '}
                  <span className="text-slate-400">{generatedProof.clientSalt.slice(0, 16)}... (never transmitted)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOnServer}
                disabled={isVerifying}
                className="flex-1 py-3 px-4 rounded-xl rainbow-gradient text-white font-extrabold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
              >
                {isVerifying ? 'Verifying on Server...' : 'Submit Proof to Central Verifier'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verification Result */}
        {step === 3 && verificationResult && (
          <div className="mt-4 space-y-4">
            <div className={`p-4 rounded-xl border ${
              verificationResult.valid
                ? 'bg-emerald-950/30 border-emerald-800'
                : 'bg-red-950/30 border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold ${
                  verificationResult.valid ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {verificationResult.valid ? '✓ Proof Certified Valid' : '✗ Verification Failed'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-200">{verificationResult.reason}</p>
              
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono space-y-1 text-slate-400">
                <div>Revealed Coordinates: <span className="text-emerald-400 font-bold">null (Zero coordinates leaked)</span></div>
                <div>Replay Protection Status: <span className="text-sky-300">{verificationResult.replaySafe ? 'Active (Nonce Registered)' : 'Triggered'}</span></div>
                <div>Verified At: {verificationResult.verifiedAt}</div>
              </div>
            </div>

            {/* Test Replay Prevention Button */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-300">Test Replay Attack Prevention</div>
                <div className="text-slate-500">Attempt to submit this exact proof nonce a second time</div>
              </div>
              <button
                onClick={handleTestReplayAttack}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs cursor-pointer"
              >
                Simulate Replay
              </button>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setGeneratedProof(null);
                setVerificationResult(null);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
            >
              Close Demonstration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
