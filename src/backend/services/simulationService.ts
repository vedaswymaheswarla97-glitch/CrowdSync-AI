/**
 * CrowdSync AI — Simulation Service
 * 
 * Executes full campus event demand spike scenarios (e.g. 500 incoming requests)
 * and compares:
 * 1. No Intervention (Baseline)
 * 2. Static Rule-Based Redirection
 * 3. Game-Theoretic Incentive-Assisted Coordination
 */

import { db } from '../db/store.ts';
import { SimulationScenario, RiskCategory } from '../db/schema.ts';
import { IncentiveEngine } from '../algorithms/incentiveEngine.ts';

export interface RunSimulationParams {
  totalIncomingRequests?: number;
  primaryZoneId?: string;
  primaryCapacity?: number;
  altZoneACapacity?: number;
  altZoneBCapacity?: number;
  laterTimeSlotCapacity?: number;
  acceptanceRate?: number; // e.g. 0.65
  incentiveBudget?: number;
}

export class SimulationService {
  public static runScenario(params: RunSimulationParams = {}): SimulationScenario {
    const totalRequests = params.totalIncomingRequests ?? 500;
    const primaryId = params.primaryZoneId ?? 'zone_north_gate';
    const primaryCap = params.primaryCapacity ?? 150;
    const altACap = params.altZoneACapacity ?? 100;
    const altBCap = params.altZoneBCapacity ?? 120;
    const laterSlotCap = params.laterTimeSlotCapacity ?? 100;
    const acceptanceRate = params.acceptanceRate ?? 0.65; // 65% accept voluntary incentive

    const primaryZone = db.zones.get(primaryId);
    if (!primaryZone) {
      throw new Error(`Primary zone ${primaryId} not found`);
    }

    // ----------------------------------------------------
    // 1. BASELINE SCENARIO (No Intervention)
    // ----------------------------------------------------
    // All 500 requests converge directly on the primary pickup zone
    const baselinePeakDemand = totalRequests;
    const baselineUtilization = parseFloat(((baselinePeakDemand / primaryCap) * 100).toFixed(1));
    const baselineOverload = Math.max(0, baselinePeakDemand - primaryCap);
    
    // Average wait time expands non-linearly with queue congestion:
    // W = base_wait * (1 + (overload / capacity)^1.5)
    const baselineWaitMinutes = parseFloat((8 * (1 + Math.pow(baselineOverload / primaryCap, 1.5))).toFixed(1));

    let baselineRisk: RiskCategory = 'Critical';
    let baselineScore = 96;
    if (baselineUtilization < 80) {
      baselineRisk = 'Low';
      baselineScore = 35;
    } else if (baselineUtilization < 100) {
      baselineRisk = 'Moderate';
      baselineScore = 65;
    } else if (baselineUtilization < 140) {
      baselineRisk = 'High';
      baselineScore = 84;
    }

    // ----------------------------------------------------
    // 2. RULE-BASED INTERVENTION
    // ----------------------------------------------------
    // Static digital signage directs people to the nearest alternative (Alt A),
    // but without incentives, voluntary compliance is low (~20%), and Alt A risks overload!
    const ruleComplianceRate = 0.22;
    const intendedRuleDivert = Math.round(totalRequests * ruleComplianceRate);
    // Alt A can only safely take up to its capacity:
    const safeAltAHeadroom = Math.max(0, altACap - 20); // assuming 20 existing
    const actualRuleDiverted = Math.min(intendedRuleDivert, safeAltAHeadroom);
    const rulePrimaryDemand = totalRequests - actualRuleDiverted;
    const ruleUtilization = parseFloat(((rulePrimaryDemand / primaryCap) * 100).toFixed(1));
    const ruleOverload = Math.max(0, rulePrimaryDemand - primaryCap);
    const ruleWaitMinutes = parseFloat((8 * (1 + Math.pow(ruleOverload / primaryCap, 1.5))).toFixed(1));
    const ruleUnmet = Math.max(0, intendedRuleDivert - actualRuleDiverted);

    // ----------------------------------------------------
    // 3. INCENTIVE-ASSISTED INTERVENTION (CrowdSync AI)
    // ----------------------------------------------------
    // Multi-alternative capacity allocation with points and vouchers:
    // Targeted diversion needed to reach safe 85% utilization on primary (150 * 0.85 = 127)
    const targetPrimarySafeCount = Math.floor(primaryCap * 0.85);
    const totalNeededDivert = Math.max(0, totalRequests - targetPrimarySafeCount); // 500 - 127 = 373

    // Create synthetic zone objects reflecting test capacities:
    const altA = { ...db.zones.get('zone_east_plaza')!, capacity: altACap, currentCount: 25 };
    const altB = { ...db.zones.get('zone_west_loop')!, capacity: altBCap, currentCount: 30 };
    const altC = { ...db.zones.get('zone_lot_c')!, capacity: 110, currentCount: 20 };

    const allocation = IncentiveEngine.computeOptimalAllocation(
      { ...primaryZone, capacity: primaryCap, currentCount: 0 },
      [altA, altB, altC],
      totalNeededDivert,
      laterSlotCap
    );

    // Offers generated equals total capacity headroom allocated:
    const offersGenerated = allocation.totalDivertedTarget;
    // Accepted offers based on game-theoretic voluntary acceptance:
    const offersAccepted = Math.round(offersGenerated * acceptanceRate);

    // Rebalance demand based on accepted offers
    const incentivePrimaryDemand = totalRequests - offersAccepted;
    const incentiveUtilization = parseFloat(((incentivePrimaryDemand / primaryCap) * 100).toFixed(1));
    const incentiveOverload = Math.max(0, incentivePrimaryDemand - primaryCap);
    const incentiveWaitMinutes = parseFloat((6 * (1 + Math.pow(incentiveOverload / primaryCap, 1.2))).toFixed(1));

    let incentiveRisk: RiskCategory = 'Low';
    let incentiveScore = 42;
    if (incentiveUtilization >= 120) {
      incentiveRisk = 'Critical';
      incentiveScore = 91;
    } else if (incentiveUtilization >= 95) {
      incentiveRisk = 'High';
      incentiveScore = 78;
    } else if (incentiveUtilization >= 75) {
      incentiveRisk = 'Moderate';
      incentiveScore = 58;
    }

    // Compute alternative zone loads after distribution
    const alternativeZoneLoads: Record<string, { current: number; capacity: number; utilizationPct: number }> = {};
    for (const alloc of allocation.allocations) {
      const acceptedForThisAlt = Math.round(alloc.allocatedCount * acceptanceRate);
      const originalCount = alloc.targetZoneId === 'zone_east_plaza' ? 25 : alloc.targetZoneId === 'zone_west_loop' ? 30 : 20;
      const finalCount = originalCount + acceptedForThisAlt;
      alternativeZoneLoads[alloc.targetZoneId] = {
        current: finalCount,
        capacity: alloc.capacityLimit,
        utilizationPct: parseFloat(((finalCount / alloc.capacityLimit) * 100).toFixed(1)),
      };
    }

    const simulation: SimulationScenario = {
      id: `sim_${Date.now()}`,
      title: 'Post-Championship Arena Egress Spike',
      description: `Evaluation of ${totalRequests} attendees requesting simultaneous exit transit at North Arena Gate.`,
      timestamp: new Date().toISOString(),
      parameters: {
        totalIncomingRequests: totalRequests,
        primaryZoneId: primaryId,
        primaryCapacity: primaryCap,
        altZoneACapacity: altACap,
        altZoneBCapacity: altBCap,
        laterTimeSlotCapacity: laterSlotCap,
        acceptanceRateEstimate: acceptanceRate,
        incentiveBudgetPoints: params.incentiveBudget ?? 25000,
      },
      baseline: {
        primaryPeakDemand: baselinePeakDemand,
        primaryCapacityUtilization: baselineUtilization,
        riskScore: baselineScore,
        riskCategory: baselineRisk,
        averageWaitTimeMinutes: baselineWaitMinutes,
        bottleneckCount: baselineOverload,
      },
      ruleBasedIntervention: {
        divertedCount: actualRuleDiverted,
        primaryCapacityUtilization: ruleUtilization,
        riskScore: Math.round(baselineScore * 0.88),
        riskCategory: ruleUtilization > 120 ? 'Critical' : 'High',
        averageWaitTimeMinutes: ruleWaitMinutes,
        unmetCapacity: ruleUnmet,
      },
      incentiveIntervention: {
        offersGenerated,
        offersAccepted,
        divertedCount: offersAccepted,
        primaryCapacityUtilization: incentiveUtilization,
        riskScore: incentiveScore,
        riskCategory: incentiveRisk,
        averageWaitTimeMinutes: incentiveWaitMinutes,
        totalPointsAwarded: offersAccepted * 65,
        unmetCapacity: allocation.unmetRedirectDemand,
        alternativeZoneLoads,
      },
    };

    db.simulations.set(simulation.id, simulation);
    db.recordAudit(
      'PREDICTION_COMPUTED',
      `Completed simulation run ${simulation.id}: Diverted ${offersAccepted}/${totalRequests} requests, reducing peak utilization from ${baselineUtilization}% to ${incentiveUtilization}%.`,
      'Simulation Service'
    );

    return simulation;
  }
}
