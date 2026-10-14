/**
 * CrowdSync AI — Module C: Cross-Platform Interoperability & Mock Provider Adapter
 */

import { db } from '../db/store.ts';
import { MockProvider } from '../db/schema.ts';
import { PrivacyEngine } from '../algorithms/privacyEngine.ts';

// Rate limiting cache: Map<providerApiKey, timestamps[]>
const rateLimitMap: Map<string, number[]> = new Map();
const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 60;

export interface TelemetryPayload {
  zone_id: string;
  source_provider?: string;
  timestamp?: string;
  raw_observations?: number; // Estimated count of arriving pedestrians/vehicles
  confidence_score?: number;
  metadata?: Record<string, unknown>;
}

export class ProviderService {
  public static getAllProviders(): MockProvider[] {
    return Array.from(db.providers.values());
  }

  public static getProviderByKey(apiKey: string): MockProvider | undefined {
    return Array.from(db.providers.values()).find(p => p.apiKey === apiKey);
  }

  /**
   * Validates rate limit (token bucket / sliding window per minute)
   */
  public static checkRateLimit(apiKey: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = rateLimitMap.get(apiKey) || [];
    const validTimestamps = timestamps.filter(t => now - t < 60000);

    if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS_PER_MINUTE) {
      return { allowed: false, remaining: 0 };
    }

    validTimestamps.push(now);
    rateLimitMap.set(apiKey, validTimestamps);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE - validTimestamps.length,
    };
  }

  /**
   * Ingests external provider telemetry with API key verification, privacy sanitization,
   * and live zone count updates.
   */
  public static ingestTelemetry(apiKey: string, payload: TelemetryPayload) {
    const provider = this.getProviderByKey(apiKey);
    if (!provider) {
      throw new Error('Unauthorized: Invalid or missing integration API key.');
    }

    const rateLimit = this.checkRateLimit(apiKey);
    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded: Maximum 60 requests per minute per provider key.');
    }

    if (!payload.zone_id) {
      throw new Error('Validation Error: Missing required field "zone_id".');
    }

    const zone = db.zones.get(payload.zone_id);
    if (!zone) {
      throw new Error(`Validation Error: Specified zone_id "${payload.zone_id}" does not exist.`);
    }

    // Apply Privacy Module D: K-anonymity & DP Sanitization
    const sanitized = PrivacyEngine.sanitizeTelemetry(payload, db.privacyConfig);

    // Update zone arrival rate and counts safely
    if (!sanitized.suppressed && sanitized.count > 0) {
      // Coarse update to arrival rate
      zone.arrivalRate = Math.round(zone.arrivalRate * 0.7 + sanitized.count * 0.3);
      zone.updatedAt = new Date().toISOString();
    }

    // Update provider telemetry stats
    provider.lastPing = new Date().toISOString();
    provider.totalEventsReceived += 1;

    db.recordAudit(
      'TELEMETRY_INGESTED',
      `Provider "${provider.name}" pushed ${payload.raw_observations ?? 1} observations for ${zone.code} (Post-Privacy Filter: ${sanitized.count})`,
      provider.name,
      !sanitized.suppressed
    );

    return {
      status: 'accepted',
      provider_id: provider.id,
      provider_name: provider.name,
      zone_id: payload.zone_id,
      processed_count: sanitized.count,
      privacy_applied: sanitized.privacyNote,
      rate_limit_remaining: rateLimit.remaining,
      timestamp: new Date().toISOString(),
    };
  }
}
