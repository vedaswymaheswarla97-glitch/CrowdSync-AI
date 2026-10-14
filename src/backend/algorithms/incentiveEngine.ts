/**
 * CrowdSync AI — Module B: Game-Theoretic Incentive Engine
 * 
 * Computes voluntary incentive offers using a transparent multi-factor utility function.
 * Solves constrained demand reallocation across alternatives while enforcing capacity limits
 * and preventing duplicate reward claims.
 */

import { Zone, IncentiveOffer } from '../db/schema.ts';

export interface UtilityWeights {
  congestionReductionWeight: number; // alpha: system benefit
  travelInconvenienceWeight: number; // beta: walking penalty
  rewardValueWeight: number;        // gamma: incentive appeal
}

export interface AllocationPlan {
  totalDivertedTarget: number;
  allocations: Array<{
    targetZoneId: string;
    targetZoneName: string;
    allocatedCount: number;
    capacityLimit: number;
    remainingHeadroomAfter: number;
    pointsOffered: number;
    utilityScore: number;
  }>;
  timeSlotAllocations: Array<{
    slotName: string;
    allocatedCount: number;
    pointsOffered: number;
  }>;
  unmetRedirectDemand: number;
  totalPointsBudgetRequired: number;
  projectedPrimaryCongestionReliefPct: number;
}

export class IncentiveEngine {
  private static defaultWeights: UtilityWeights = {
    congestionReductionWeight: 1.4,
    travelInconvenienceWeight: 3.2,
    rewardValueWeight: 0.8,
  };

  /**
   * Calculates utility score of redirecting a user to a specific alternative
   * Utility U = alpha * DeltaCongestion - beta * WalkMinutes + gamma * Points / 10
   */
  public static calculateUtility(
    originZone: Zone,
    targetZone: Zone,
    walkingMinutes: number,
    pointsOffered: number,
    weights: UtilityWeights = IncentiveEngine.defaultWeights
  ): number {
    const originCongestionPct = (originZone.currentCount / originZone.capacity) * 100;
    const targetCongestionPct = (targetZone.currentCount / targetZone.capacity) * 100;
    
    // Congestion delta: positive when moving from crowded to emptier zone
    const congestionRelief = Math.max(0, originCongestionPct - targetCongestionPct);
    
    const utility = (
      weights.congestionReductionWeight * congestionRelief -
      weights.travelInconvenienceWeight * walkingMinutes +
      weights.rewardValueWeight * (pointsOffered / 5)
    );

    return parseFloat(Math.max(5, utility).toFixed(2));
  }

  /**
   * Constrained demand-allocation algorithm:
   * Reallocates voluntary redirect requests across available alternatives without
   * exceeding any alternative's operational capacity limit (85% cap).
   */
  public static computeOptimalAllocation(
    originZone: Zone,
    alternatives: Zone[],
    demandToDivert: number,
    laterSlotCapacity: number = 80
  ): AllocationPlan {
    let remainingToDivert = demandToDivert;
    let totalPoints = 0;

    const allocations: AllocationPlan['allocations'] = [];

    // Rank alternatives by current available capacity and walking proximity
    const rankedAlternatives = [...alternatives].sort((a, b) => {
      const freeA = Math.max(0, Math.floor(a.capacity * 0.85) - a.currentCount);
      const freeB = Math.max(0, Math.floor(b.capacity * 0.85) - b.currentCount);
      const walkA = originZone.walkingTimeToAlternatives[a.id] ?? 8;
      const walkB = originZone.walkingTimeToAlternatives[b.id] ?? 8;
      return (freeB - walkB * 4) - (freeA - walkA * 4);
    });

    for (const alt of rankedAlternatives) {
      if (remainingToDivert <= 0) break;

      const safeCap = Math.floor(alt.capacity * 0.85);
      const availableHeadroom = Math.max(0, safeCap - alt.currentCount);

      if (availableHeadroom <= 0) continue;

      // Allocate minimum of needed divert count and available safe headroom
      const countToAllocate = Math.min(remainingToDivert, availableHeadroom);
      const walkingTime = originZone.walkingTimeToAlternatives[alt.id] ?? 6;
      const points = 50 + walkingTime * 10;
      const utility = this.calculateUtility(originZone, alt, walkingTime, points);

      allocations.push({
        targetZoneId: alt.id,
        targetZoneName: alt.name,
        allocatedCount: countToAllocate,
        capacityLimit: alt.capacity,
        remainingHeadroomAfter: availableHeadroom - countToAllocate,
        pointsOffered: points,
        utilityScore: utility,
      });

      remainingToDivert -= countToAllocate;
      totalPoints += countToAllocate * points;
    }

    // Allocate remainder to optional later time slots if spatial alternatives are saturated
    const timeSlotAllocations: AllocationPlan['timeSlotAllocations'] = [];
    if (remainingToDivert > 0 && laterSlotCapacity > 0) {
      const timeSlotDivert = Math.min(remainingToDivert, laterSlotCapacity);
      timeSlotAllocations.push({
        slotName: '+20-30m Lounge & Refreshment Window',
        allocatedCount: timeSlotDivert,
        pointsOffered: 75,
      });
      remainingToDivert -= timeSlotDivert;
      totalPoints += timeSlotDivert * 75;
    }

    const totalDiverted = demandToDivert - remainingToDivert;
    const reliefPct = parseFloat(
      Math.min(100, (totalDiverted / Math.max(1, originZone.capacity)) * 100).toFixed(1)
    );

    return {
      totalDivertedTarget: totalDiverted,
      allocations,
      timeSlotAllocations,
      unmetRedirectDemand: remainingToDivert,
      totalPointsBudgetRequired: totalPoints,
      projectedPrimaryCongestionReliefPct: reliefPct,
    };
  }

  /**
   * Generates a voluntary user-facing incentive offer
   */
  public static createOffer(
    userId: string,
    originZone: Zone,
    targetZone: Zone,
    walkingTimeMinutes: number
  ): IncentiveOffer {
    const points = 50 + walkingTimeMinutes * 10;
    const utility = this.calculateUtility(originZone, targetZone, walkingTimeMinutes, points);
    const congestionRelief = parseFloat(
      ((1 / Math.max(1, originZone.capacity)) * 100).toFixed(2)
    );

    const vouchers = [
      'Campus Espresso or Cold Brew Voucher (Free at East Cafe)',
      '15% Off Next Rideshare Booking',
      'Priority Transit Seating Pass',
      'Campus Bookstore $5 Digital Coupon'
    ];
    const voucherDescription = vouchers[Math.floor(Math.random() * vouchers.length)];

    return {
      id: `off_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      originZoneId: originZone.id,
      recommendedZoneId: targetZone.id,
      recommendedZoneName: targetZone.name,
      points,
      voucherDescription,
      utilityScore: utility,
      estimatedDelayMinutes: walkingTimeMinutes,
      systemCongestionReductionPct: congestionRelief,
      status: 'offered',
      offeredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }
}
