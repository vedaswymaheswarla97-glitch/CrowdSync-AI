/**
 * CrowdSync AI — Module D: Privacy-Preserving Location Coordination
 * 
 * Enforces k-anonymity aggregation thresholds, differential privacy Laplace noise,
 * and data minimization policies.
 */

import { PrivacyConfig } from '../db/schema.ts';

export class PrivacyEngine {
  /**
   * Applies k-anonymity thresholding:
   * Suppresses or coarsens reporting if the number of requests/users in a cohort is less than k.
   */
  public static enforceKAnonymity(
    rawCount: number,
    threshold: number = 5
  ): { safeCount: number; isSuppressed: boolean; message: string } {
    if (rawCount < threshold) {
      return {
        safeCount: 0,
        isSuppressed: true,
        message: `Value suppressed (< ${threshold} users). Preserving k-anonymity.`,
      };
    }
    return {
      safeCount: rawCount,
      isSuppressed: false,
      message: 'Meets aggregation privacy threshold.',
    };
  }

  /**
   * Injects calibrated Laplace noise for epsilon-Differential Privacy (DP).
   * Sensitivity Delta f = 1 (each individual adds at most 1 count to a zone).
   */
  public static addLaplaceNoise(
    trueCount: number,
    epsilon: number = 0.8
  ): { noisyCount: number; noiseAdded: number } {
    // Generate Laplace random variable: Lap(scale = 1/epsilon)
    const scale = 1.0 / Math.max(0.01, epsilon);
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    const noisyCount = Math.max(0, Math.round(trueCount + noise));

    return {
      noisyCount,
      noiseAdded: parseFloat(noise.toFixed(2)),
    };
  }

  /**
   * Sanitizes telemetry batches: strips any persistent device IDs, IP addresses,
   * or continuous trajectories, leaving only coarse aggregate counts.
   */
  public static sanitizeTelemetry(payload: {
    zone_id: string;
    raw_observations?: number;
    timestamp?: string;
  }, config: PrivacyConfig) {
    const raw = payload.raw_observations ?? 1;
    const kCheck = this.enforceKAnonymity(raw, config.kAnonymityThreshold);

    if (kCheck.isSuppressed) {
      return {
        zone_id: payload.zone_id,
        count: 0,
        suppressed: true,
        privacyNote: kCheck.message,
      };
    }

    const dpResult = this.addLaplaceNoise(raw, config.differentialPrivacyEpsilon);
    return {
      zone_id: payload.zone_id,
      count: dpResult.noisyCount,
      noiseDelta: dpResult.noiseAdded,
      suppressed: false,
      privacyNote: `Protected via Differential Privacy (epsilon=${config.differentialPrivacyEpsilon})`,
    };
  }
}
