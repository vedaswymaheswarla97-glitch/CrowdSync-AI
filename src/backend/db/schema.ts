/**
 * CrowdSync AI — Database Schemas and Domain Types
 */

export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface Zone {
  id: string;
  name: string;
  code: string;
  type: 'pickup_zone' | 'transit_hub' | 'stadium_gate' | 'parking_lot' | 'pedestrian_plaza';
  capacity: number;
  currentCount: number;
  arrivalRate: number; // requests or arrivals per minute
  departureRate: number; // exits per minute
  coordinates: {
    lat: number;
    lng: number;
    x: number; // schematic map coordinate (0-1000)
    y: number; // schematic map coordinate (0-600)
  };
  connectedZones: string[]; // IDs of nearby alternative zones
  walkingTimeToAlternatives: Record<string, number>; // minutes
  description: string;
  eventContext?: string;
  updatedAt: string;
}

export interface PredictionResult {
  zoneId: string;
  timestamp: string;
  currentCount: number;
  capacity: number;
  predictedDemand: number; // in next 15-30 mins
  predictedDensity: number; // % of capacity
  riskScore: number; // 0 to 100
  riskCategory: RiskCategory;
  timeUntilCapacityExceededMinutes: number | null; // null if safe
  additionalSafeArrivals: number; // headroom
  suggestedRedirectCount: number; // how many people to voluntarily divert
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
  confidence: number; // 0.0 - 1.0
}

export interface IncentiveOffer {
  id: string;
  userId: string; // anonymized session token
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
    acceptanceRateEstimate: number; // e.g. 0.65 (65% voluntarily accept)
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
  kAnonymityThreshold: number; // Minimum requests before publishing crowd stat (e.g. 5)
  differentialPrivacyEpsilon: number; // Epsilon parameter for Laplace noise
  dataRetentionMinutes: number; // Data expiration time (e.g. 60 mins)
  strictConsentRequired: boolean;
  zeroKnowledgeEnabled: boolean;
  locationPrecisionKm: number; // Coarse zone grid radius
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'TELEMETRY_INGESTED' | 'PREDICTION_COMPUTED' | 'INCENTIVE_ACCEPTED' | 'ZK_PROOF_VERIFIED' | 'PURGE_SCHEDULED';
  details: string;
  source: string;
  kAnonymityMet: boolean;
}
