/**
 * CrowdSync AI — Frontend API Client
 */

import {
  Zone,
  PredictionResult,
  CrowdStatus,
  IncentiveOffer,
  SimulationScenario,
  MockProvider,
  PrivacyConfig,
  AuditEvent,
  UserWallet
} from '../types/index.ts';

const BASE_URL = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<{ status: string; version: string; modules: Record<string, string> }>(res);
  },

  // Zones
  async getZones(): Promise<{ count: number; data: Zone[] }> {
    const res = await fetch(`${BASE_URL}/zones`);
    return handleResponse(res);
  },

  async getZone(zoneId: string): Promise<{ zone: Zone; prediction: PredictionResult }> {
    const res = await fetch(`${BASE_URL}/zones/${zoneId}`);
    return handleResponse(res);
  },

  async updateZone(zoneId: string, updates: Partial<Zone>): Promise<{ success: boolean; zone: Zone }> {
    const res = await fetch(`${BASE_URL}/zones/${zoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Crowd Status
  async getCrowdStatus(): Promise<CrowdStatus> {
    const res = await fetch(`${BASE_URL}/crowd/status`);
    return handleResponse(res);
  },

  // Predictions
  async getPredictions(zoneId?: string): Promise<{ count: number; predictions: PredictionResult[] }> {
    const res = await fetch(`${BASE_URL}/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneId ? { zone_id: zoneId } : {}),
    });
    return handleResponse(res);
  },

  // Simulations
  async runSimulation(params: {
    totalIncomingRequests?: number;
    primaryCapacity?: number;
    altZoneACapacity?: number;
    altZoneBCapacity?: number;
    laterTimeSlotCapacity?: number;
    acceptanceRate?: number;
    incentiveBudget?: number;
  }): Promise<SimulationScenario> {
    const res = await fetch(`${BASE_URL}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async getSimulation(id: string): Promise<SimulationScenario> {
    const res = await fetch(`${BASE_URL}/simulations/${id}`);
    return handleResponse(res);
  },

  // Incentives & Wallet
  async getIncentives(userId: string = 'demo_user'): Promise<{ user_id: string; wallet_balance: number; offers: IncentiveOffer[] }> {
    const res = await fetch(`${BASE_URL}/incentives?user_id=${userId}`);
    return handleResponse(res);
  },

  async acceptIncentive(offerId: string, sessionId: string = 'sess_demo_attendee'): Promise<{ success: boolean; offer: IncentiveOffer; new_balance: number }> {
    const res = await fetch(`${BASE_URL}/incentives/${offerId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return handleResponse(res);
  },

  async rejectIncentive(offerId: string): Promise<{ success: boolean; offer: IncentiveOffer }> {
    const res = await fetch(`${BASE_URL}/incentives/${offerId}/reject`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getWallet(): Promise<UserWallet> {
    const res = await fetch(`${BASE_URL}/wallet`);
    return handleResponse(res);
  },

  // Privacy & ZKP
  async getPrivacyStatus(): Promise<{
    config: PrivacyConfig;
    activeProtections: Record<string, unknown>;
    auditTrailCount: number;
    recentAudits: AuditEvent[];
  }> {
    const res = await fetch(`${BASE_URL}/privacy/status`);
    return handleResponse(res);
  },

  async updatePrivacyConfig(config: Partial<PrivacyConfig>): Promise<{ success: boolean; updatedConfig: PrivacyConfig }> {
    const res = await fetch(`${BASE_URL}/privacy/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  async generateZkDemoProof(userLat: number, userLng: number, zoneId: string, rangeMeters: number = 400) {
    const res = await fetch(`${BASE_URL}/privacy/zk-generate-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userLat, userLng, zoneId, rangeMeters }),
    });
    return handleResponse<{ proof: any; clientSecretDistanceMeters: number; clientSalt: string }>(res);
  },

  async verifyZkProof(proofPayload: any) {
    const res = await fetch(`${BASE_URL}/privacy/zk-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proofPayload),
    });
    return handleResponse<{
      valid: boolean;
      reason: string;
      verifiedAt: string;
      targetZoneId: string;
      replaySafe: boolean;
      revealedCoordinates: null;
      cryptographicNotes: string;
    }>(res);
  },

  // Providers & Telemetry
  async getProviders(): Promise<{ count: number; providers: MockProvider[] }> {
    const res = await fetch(`${BASE_URL}/providers/status`);
    return handleResponse(res);
  },

  async submitTelemetry(apiKey: string, payload: { zone_id: string; raw_observations?: number; timestamp?: string }) {
    const res = await fetch(`${BASE_URL}/providers/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${BASE_URL}/analytics/summary`);
    return handleResponse(res);
  },
};
