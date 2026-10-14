/**
 * CrowdSync AI — Comprehensive Algorithm & Privacy Test Suite
 * Run with: npx tsx tests/run_tests.ts
 */

import { PredictionEngine } from '../src/backend/algorithms/predictionEngine.ts';
import { IncentiveEngine } from '../src/backend/algorithms/incentiveEngine.ts';
import { PrivacyEngine } from '../src/backend/algorithms/privacyEngine.ts';
import { ZkpVerifier } from '../src/backend/algorithms/zkpVerifier.ts';
import { CrowdService } from '../src/backend/services/crowdService.ts';
import { SimulationService } from '../src/backend/services/simulationService.ts';
import { Zone } from '../src/backend/db/schema.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (failureDetails) console.error(`    Details: ${failureDetails}`);
    failedTests++;
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('CrowdSync AI Test Suite Execution');
  console.log('========================================\n');

  // ----------------------------------------------------------------
  // Test Suite 1: Prediction & Attention Budgeting Engine
  // ----------------------------------------------------------------
  console.log('[Suite 1: Predictive Attention Engine]');
  const mockPrimaryZone: Zone = {
    id: 'zone_test_primary',
    name: 'Arena North Exit',
    code: 'TEST-N',
    type: 'pickup_zone',
    capacity: 100,
    currentCount: 85,
    arrivalRate: 15, // arrivals/min
    departureRate: 5,  // exits/min -> net +10/min
    coordinates: { lat: 37.77, lng: -122.41, x: 500, y: 200 },
    connectedZones: ['zone_test_alt_a'],
    walkingTimeToAlternatives: { 'zone_test_alt_a': 5 },
    description: 'Test zone',
    updatedAt: new Date().toISOString(),
  };

  const mockAltZone: Zone = {
    id: 'zone_test_alt_a',
    name: 'East Shuttle Hub',
    code: 'TEST-E',
    type: 'transit_hub',
    capacity: 120,
    currentCount: 30,
    arrivalRate: 4,
    departureRate: 8,
    coordinates: { lat: 37.78, lng: -122.40, x: 700, y: 300 },
    connectedZones: ['zone_test_primary'],
    walkingTimeToAlternatives: { 'zone_test_primary': 5 },
    description: 'Alternative zone',
    updatedAt: new Date().toISOString(),
  };

  const pred = PredictionEngine.predictZone(mockPrimaryZone, [mockPrimaryZone, mockAltZone]);

  assert(pred.riskCategory === 'Critical' || pred.riskCategory === 'High', 'Identifies critical/high risk on rapidly filling zone');
  assert(pred.timeUntilCapacityExceededMinutes === 1.5, 'Computes accurate TTCE: (100 - 85) / 10 = 1.5 minutes', `Got ${pred.timeUntilCapacityExceededMinutes}`);
  assert(pred.additionalSafeArrivals === 15, 'Computes correct safe arrivals headroom (100 - 85 = 15)');
  assert(pred.suggestedRedirectCount > 0, 'Computes positive redirect target to keep zone below 80% limit');
  assert(pred.recommendedAlternatives.length === 1, 'Recommends available connected alternatives');
  assert(pred.recommendedAlternatives[0].zoneId === 'zone_test_alt_a', 'Correctly ranks alternative zone');

  // ----------------------------------------------------------------
  // Test Suite 2: Game-Theoretic Incentive & Constrained Allocation
  // ----------------------------------------------------------------
  console.log('\n[Suite 2: Incentive Engine & Constrained Optimization]');
  
  // Utility function test
  const utility = IncentiveEngine.calculateUtility(mockPrimaryZone, mockAltZone, 5, 80);
  assert(utility > 0, 'Computes positive utility score for walking 5 mins to empty zone with 80 points');

  // Capacity constraint test:
  // Primary needs to divert 200 requests.
  // Alt A has capacity 100, current 20 -> safe cap 85, free headroom 65.
  // Alt B has capacity 80, current 10 -> safe cap 68, free headroom 58.
  // Later time slot has cap 80.
  const altA: Zone = { ...mockAltZone, id: 'alt_a', capacity: 100, currentCount: 20 };
  const altB: Zone = { ...mockAltZone, id: 'alt_b', capacity: 80, currentCount: 10 };
  
  const allocation = IncentiveEngine.computeOptimalAllocation(mockPrimaryZone, [altA, altB], 200, 80);

  // Verify constraints
  const allocA = allocation.allocations.find(a => a.targetZoneId === 'alt_a');
  const allocB = allocation.allocations.find(a => a.targetZoneId === 'alt_b');
  
  assert(allocA !== undefined && allocA.allocatedCount <= 65, 'Enforces Alt A capacity headroom limit (<= 65)');
  assert(allocB !== undefined && allocB.allocatedCount <= 58, 'Enforces Alt B capacity headroom limit (<= 58)');
  assert(allocation.timeSlotAllocations.length > 0, 'Spills excess demand to later time slots when spatial zones saturate');
  assert(allocation.totalDivertedTarget <= 200, 'Total allocated redirect never exceeds target demand');

  // ----------------------------------------------------------------
  // Test Suite 3: Privacy Engine (K-Anonymity & Differential Privacy)
  // ----------------------------------------------------------------
  console.log('\n[Suite 3: Privacy Engine & Sanitization]');
  const suppressedResult = PrivacyEngine.enforceKAnonymity(3, 5);
  assert(suppressedResult.isSuppressed === true && suppressedResult.safeCount === 0, 'Suppresses metrics with < k=5 observations to prevent re-identification');

  const safeResult = PrivacyEngine.enforceKAnonymity(18, 5);
  assert(safeResult.isSuppressed === false && safeResult.safeCount === 18, 'Permits aggregate metrics meeting k-anonymity threshold (>= 5)');

  const dpNoise = PrivacyEngine.addLaplaceNoise(100, 0.8);
  assert(typeof dpNoise.noisyCount === 'number' && dpNoise.noisyCount > 0, 'Injects calibrated differential privacy Laplace noise');

  // ----------------------------------------------------------------
  // Test Suite 4: Zero-Knowledge Proximity Proof & Anti-Replay
  // ----------------------------------------------------------------
  console.log('\n[Suite 4: Zero-Knowledge Location Proof Demonstration]');
  // User is located ~120m away from target zone (within 400m range)
  const clientProofResult = ZkpVerifier.generateSimulatedClientProof(
    37.7750, -122.4140, // User lat, lng
    37.7760, -122.4140, // Zone lat, lng
    'zone_test_alt_a',
    400
  );

  assert(clientProofResult.proof.commitment.length === 64, 'Generates 256-bit SHA256 coordinate commitment on client');
  assert(clientProofResult.proof.nonce.length > 0, 'Generates unique anti-replay nonce');

  // Verify valid proof
  const verif1 = ZkpVerifier.verifyProof(clientProofResult.proof);
  assert(verif1.valid === true, 'Server successfully verifies in-range location proof without knowing user coordinates');
  assert(verif1.revealedCoordinates === null, 'Server guarantees zero coordinate disclosure (revealedCoordinates is null)');

  // Anti-replay test: Verify the exact same proof again
  const verifReplay = ZkpVerifier.verifyProof(clientProofResult.proof);
  assert(verifReplay.valid === false && verifReplay.reason.includes('Replay Attack Detected'), 'Detects and rejects replayed nonce attack');

  // ----------------------------------------------------------------
  // Test Suite 5: Simulation Service (Campus Event 500 Spike Scenario)
  // ----------------------------------------------------------------
  console.log('\n[Suite 5: Campus Event 500 Demand Spike Scenario]');
  const sim = SimulationService.runScenario({
    totalIncomingRequests: 500,
    primaryCapacity: 150,
    altZoneACapacity: 100,
    altZoneBCapacity: 120,
    laterTimeSlotCapacity: 100,
    acceptanceRate: 0.65,
  });

  assert(sim.baseline.primaryPeakDemand === 500, 'Baseline accurately models all 500 requests at primary zone');
  assert(sim.baseline.primaryCapacityUtilization > 300, 'Baseline identifies severe 333% capacity overload');
  assert(sim.incentiveIntervention.divertedCount > 0, 'Incentive coordination redirects significant portion of attendees');
  assert(sim.incentiveIntervention.primaryCapacityUtilization < sim.baseline.primaryCapacityUtilization, 'Incentive coordination substantially reduces primary zone utilization');
  assert(sim.incentiveIntervention.averageWaitTimeMinutes < sim.baseline.averageWaitTimeMinutes, 'Incentive coordination slashes average attendee waiting time');

  // ----------------------------------------------------------------
  // Test Suite 6: Duplicate Claim & Wallet Protection
  // ----------------------------------------------------------------
  console.log('\n[Suite 6: Duplicate Incentive Claim Prevention]');
  const offers = CrowdService.generateIncentiveOffers('zone_north_gate', 'test_user_session_99');
  assert(offers.length > 0, 'Generates valid voluntary incentive offers');

  const firstOffer = offers[0];
  const accepted = CrowdService.acceptOffer(firstOffer.id, 'test_user_session_99');
  assert(accepted.status === 'accepted' && accepted.claimNonce !== undefined, 'Accepts initial offer and generates claim nonce');

  let duplicateBlocked = false;
  try {
    CrowdService.acceptOffer(firstOffer.id, 'test_user_session_99');
  } catch (err: any) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 'Blocks duplicate claim attempt on already-accepted offer');

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  console.log('\n========================================');
  console.log(`Test Execution Finished: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
