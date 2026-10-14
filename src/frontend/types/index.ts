/**
 * Frontend Type Definitions
 */

export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface Zone {
  id: string;
  name: string;
  code: string;
  type: 'pickup_zone' | 'transit_hub' | 'stadium_gate' | 'parking_lot' | 'pedestrian_plaza';
  capacity: number;
  currentCount: number;
  arrivalRate: number;
  departureRate: number;
  coordinates: {
    lat: number;
    lng: number;
    x: number;
    y: number;
  };
  connectedZones: string[];
  walkingTimeToAlternatives: Record<string, number>;
  description: string;
  eventContext?: string;
  updatedAt: string;
}

export interface PredictionResult {
  zoneId: string;
  timestamp: string;
  currentCount: number;
  capacity: number;
  predictedDemand: number;
  predictedDensity: number;
  riskScore: number;
  riskCategory: RiskCategory;
  timeUntilCapacityExceededMinutes: number | null;
  additionalSafeArrivals: number;
  suggestedRedirectCount: number;
  recommendedAlternatives: Array<{
    zoneId: string;
    zoneName: string;
    currentLoad: number;
    availableCapacity: number;
    walkingTimeMinutes: number;
    estimatedCongestionReduction: number;
    incentivePoints: number;
    suitabilityScore: number;
  }>;
  recommendedTimeSlots: Array<{
    slot: string;
    expectedLoad: number;
    incentivePoints: number;
  }>;
  recommendedIntervention: string;
  interventionExplanation: string;
  confidence: number;
}

export interface IncentiveOffer {
  id: string;
  userId: string;
  originZoneId: string;
  recommendedZoneId: string;
  recommendedZoneName: string;
  recommendedTimeSlot?: string;
  points: number;
  voucherDescription: string;
  utilityScore: number;
  estimatedDelayMinutes: number;
  systemCongestionReductionPct: number;
  status: 'offered' | 'accepted' | 'rejected' | 'claimed' | 'expired';
  offeredAt: string;
  expiresAt: string;
  claimedAt?: string;
  claimNonce?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  parameters: {
    totalIncomingRequests: number;
    primaryZoneId: string;
    primaryCapacity: number;
    altZoneACapacity: number;
    altZoneBCapacity: number;
    laterTimeSlotCapacity: number;
    acceptanceRateEstimate: number;
    incentiveBudgetPoints: number;
  };
  baseline: {
    primaryPeakDemand: number;
    primaryCapacityUtilization: number;
    riskScore: number;
    riskCategory: RiskCategory;
    averageWaitTimeMinutes: number;
    bottleneckCount: number;
  };
  ruleBasedIntervention: {
    divertedCount: number;
    primaryCapacityUtilization: number;
    riskScore: number;
    riskCategory: RiskCategory;
    averageWaitTimeMinutes: number;
    unmetCapacity: number;
  };
  incentiveIntervention: {
    offersGenerated: number;
    offersAccepted: number;
    divertedCount: number;
    primaryCapacityUtilization: number;
    riskScore: number;
    riskCategory: RiskCategory;
    averageWaitTimeMinutes: number;
    totalPointsAwarded: number;
    unmetCapacity: number;
    alternativeZoneLoads: Record<string, { current: number; capacity: number; utilizationPct: number }>;
  };
}

export interface MockProvider {
  id: string;
  name: string;
  category: 'mapping' | 'transit' | 'rideshare' | 'event_ticketing';
  apiKey: string;
  status: 'connected' | 'degraded' | 'syncing';
  lastPing: string;
  totalEventsReceived: number;
  samplePayloadFormat: string;
}

export interface PrivacyConfig {
  kAnonymityThreshold: number;
  differentialPrivacyEpsilon: number;
  dataRetentionMinutes: number;
  strictConsentRequired: boolean;
  zeroKnowledgeEnabled: boolean;
  locationPrecisionKm: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'TELEMETRY_INGESTED' | 'PREDICTION_COMPUTED' | 'INCENTIVE_ACCEPTED' | 'ZK_PROOF_VERIFIED' | 'PURGE_SCHEDULED';
  details: string;
  source: string;
  kAnonymityMet: boolean;
}

export interface CrowdStatus {
  timestamp: string;
  totalCapacity: number;
  totalCurrentCount: number;
  overallUtilization: number;
  criticalZoneCount: number;
  highRiskZoneCount: number;
  zones: Array<{
    id: string;
    name: string;
    code: string;
    capacity: number;
    currentCount: number;
    utilizationPct: number;
    arrivalRate: number;
    departureRate: number;
    netFlow: number;
  }>;
}

export interface UserWallet {
  balance: number;
  claimedVouchers: Array<{
    id: string;
    title: string;
    code: string;
    date: string;
    pointsCost: number;
  }>;
}
