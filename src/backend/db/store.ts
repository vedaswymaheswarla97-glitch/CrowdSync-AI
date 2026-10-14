/**
 * CrowdSync AI — Transactional Data Store with Seed Data
 */
import { Zone, IncentiveOffer, SimulationScenario, MockProvider, PrivacyConfig, AuditEvent } from './schema.ts';

class DataStore {
  public zones: Map<string, Zone> = new Map();
  public incentiveOffers: Map<string, IncentiveOffer> = new Map();
  public claimedNonces: Set<string> = new Set();
  public simulations: Map<string, SimulationScenario> = new Map();
  public providers: Map<string, MockProvider> = new Map();
  public auditEvents: AuditEvent[] = [];
  public privacyConfig: PrivacyConfig = {
    kAnonymityThreshold: 5,
    differentialPrivacyEpsilon: 0.8,
    dataRetentionMinutes: 60,
    strictConsentRequired: true,
    zeroKnowledgeEnabled: true,
    locationPrecisionKm: 0.5,
  };
  public userWallet = {
    balance: 420,
    claimedVouchers: [
      { id: 'vch_01', title: '15% Off Campus Cafe', code: 'SYNC-CAFE15', date: '2026-10-14 18:30', pointsCost: 80 }
    ]
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Campus Event Zones
    const initialZones: Zone[] = [
      {
        id: 'zone_north_gate',
        name: 'North Arena Main Gate (Primary)',
        code: 'N-GATE',
        type: 'pickup_zone',
        capacity: 150,
        currentCount: 142,
        arrivalRate: 22, // 22 arrivals/min
        departureRate: 8,  // 8 departures/min -> net +14/min!
        coordinates: { lat: 37.7749, lng: -122.4194, x: 500, y: 160 },
        connectedZones: ['zone_east_plaza', 'zone_west_loop', 'zone_lot_c'],
        walkingTimeToAlternatives: {
          'zone_east_plaza': 4,
          'zone_west_loop': 6,
          'zone_lot_c': 8,
        },
        description: 'Main pedestrian exit directly in front of the campus arena concourse. Highly prone to post-event gridlock.',
        eventContext: 'Campus Spring Championship Final (5,000 attendees exiting)',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'zone_east_plaza',
        name: 'East Plaza Shuttle Hub (Alt A)',
        code: 'E-PLAZA',
        type: 'transit_hub',
        capacity: 100,
        currentCount: 34,
        arrivalRate: 6,
        departureRate: 10,
        coordinates: { lat: 37.7760, lng: -122.4140, x: 780, y: 260 },
        connectedZones: ['zone_north_gate', 'zone_lot_c'],
        walkingTimeToAlternatives: {
          'zone_north_gate': 4,
          'zone_lot_c': 5,
        },
        description: 'Dedicated electric campus shuttle terminal with covered shelters and wide sidewalk access.',
        eventContext: '4 electric shuttle buses running every 3 minutes',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'zone_west_loop',
        name: 'West Esplanade Transit Loop (Alt B)',
        code: 'W-LOOP',
        type: 'transit_hub',
        capacity: 120,
        currentCount: 45,
        arrivalRate: 7,
        departureRate: 9,
        coordinates: { lat: 37.7735, lng: -122.4250, x: 220, y: 320 },
        connectedZones: ['zone_north_gate', 'zone_lot_c'],
        walkingTimeToAlternatives: {
          'zone_north_gate': 6,
          'zone_lot_c': 7,
        },
        description: 'Spacious four-lane curbside pickup area connecting directly to the western arterial road.',
        eventContext: 'Express rideshare staging zone with zero street blocking',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'zone_lot_c',
        name: 'Lot C Ride-Hail Hub (Alt C)',
        code: 'LOT-C',
        type: 'parking_lot',
        capacity: 110,
        currentCount: 28,
        arrivalRate: 4,
        departureRate: 8,
        coordinates: { lat: 37.7710, lng: -122.4180, x: 490, y: 490 },
        connectedZones: ['zone_north_gate', 'zone_east_plaza', 'zone_west_loop'],
        walkingTimeToAlternatives: {
          'zone_north_gate': 8,
          'zone_east_plaza': 5,
          'zone_west_loop': 7,
        },
        description: 'Paved multi-bay lot dedicated to rideshare pick-ups and private carpool collection.',
        eventContext: 'Designated app pickup lanes with active marshals',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'zone_south_station',
        name: 'South Metro Rail Connector',
        code: 'S-RAIL',
        type: 'transit_hub',
        capacity: 250,
        currentCount: 88,
        arrivalRate: 15,
        departureRate: 20,
        coordinates: { lat: 37.7680, lng: -122.4160, x: 520, y: 560 },
        connectedZones: ['zone_lot_c'],
        walkingTimeToAlternatives: {
          'zone_lot_c': 4,
        },
        description: 'High-capacity suburban rapid transit station running trains every 6 minutes.',
        eventContext: 'Special match-day rail frequency activated',
        updatedAt: new Date().toISOString(),
      }
    ];

    initialZones.forEach(zone => this.zones.set(zone.id, zone));

    // 2. Seed Mock Providers
    const initialProviders: MockProvider[] = [
      {
        id: 'prov_naviroute',
        name: 'NaviRoute Mapping Engine',
        category: 'mapping',
        apiKey: 'demo-naviroute-key-101',
        status: 'connected',
        lastPing: new Date(Date.now() - 12000).toISOString(),
        totalEventsReceived: 1842,
        samplePayloadFormat: '{"zone_id": "zone_north_gate", "pedestrian_flux": 24, "heading": "south"}'
      },
      {
        id: 'prov_metrorail',
        name: 'MetroRail Campus Transit Provider',
        category: 'transit',
        apiKey: 'demo-metrorail-key-202',
        status: 'connected',
        lastPing: new Date(Date.now() - 4000).toISOString(),
        totalEventsReceived: 2950,
        samplePayloadFormat: '{"zone_id": "zone_east_plaza", "transit_departures": 18, "wait_sec": 180}'
      },
      {
        id: 'prov_ticketing',
        name: 'ArenaTicketing Event Gateway',
        category: 'event_ticketing',
        apiKey: 'demo-ticketing-key-303',
        status: 'connected',
        lastPing: new Date(Date.now() - 30000).toISOString(),
        totalEventsReceived: 620,
        samplePayloadFormat: '{"event_id": "ev_final_match", "concourse_density_pct": 91, "exit_pacing": "high"}'
      }
    ];

    initialProviders.forEach(p => this.providers.set(p.id, p));

    // 3. Seed Initial Audit Events
    this.auditEvents.push(
      {
        id: 'aud_01',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        eventType: 'TELEMETRY_INGESTED',
        details: 'Ingested batch from MetroRail Campus Transit (54 aggregate zone pulses)',
        source: 'MetroRail API',
        kAnonymityMet: true,
      },
      {
        id: 'aud_02',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        eventType: 'PREDICTION_COMPUTED',
        details: 'Evaluated congestion for zone_north_gate (Risk: 88/100, Critical Overload projected in 4.5m)',
        source: 'Predictive Attention Engine',
        kAnonymityMet: true,
      },
      {
        id: 'aud_03',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        eventType: 'ZK_PROOF_VERIFIED',
        details: 'Verified zero-knowledge location proximity proof for incentive claim (Proof Nonce: 9f8a3c)',
        source: 'ZKP Eligibility Verifier',
        kAnonymityMet: true,
      }
    );
  }

  public recordAudit(type: AuditEvent['eventType'], details: string, source: string, kAnonymityMet = true) {
    const event: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType: type,
      details,
      source,
      kAnonymityMet,
    };
    this.auditEvents.unshift(event);
    if (this.auditEvents.length > 100) {
      this.auditEvents.pop();
    }
    return event;
  }
}

export const db = new DataStore();
