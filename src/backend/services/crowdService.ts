/**
 * CrowdSync AI — Crowd Management & Incentive Coordination Service
 */

import { db } from '../db/store.ts';
import { Zone, PredictionResult, IncentiveOffer } from '../db/schema.ts';
import { PredictionEngine } from '../algorithms/predictionEngine.ts';
import { IncentiveEngine } from '../algorithms/incentiveEngine.ts';

export class CrowdService {
  public static getAllZones(): Zone[] {
    return Array.from(db.zones.values());
  }

  public static getZoneById(id: string): Zone | undefined {
    return db.zones.get(id);
  }

  public static updateZone(id: string, updates: Partial<Zone>): Zone {
    const existing = db.zones.get(id);
    if (!existing) {
      throw new Error(`Zone ${id} not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    db.zones.set(id, updated);
    return updated;
  }

  public static getZonePrediction(zoneId: string, options = {}): PredictionResult {
    const zone = db.zones.get(zoneId);
    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }
    const allZones = this.getAllZones();
    return PredictionEngine.predictZone(zone, allZones, options);
  }

  public static getAllPredictions(): PredictionResult[] {
    const allZones = this.getAllZones();
    return allZones.map(zone => PredictionEngine.predictZone(zone, allZones));
  }

  public static getCrowdStatus() {
    const zones = this.getAllZones();
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const totalCurrentCount = zones.reduce((sum, z) => sum + z.currentCount, 0);
    const overallUtilization = parseFloat(((totalCurrentCount / totalCapacity) * 100).toFixed(1));

    const predictions = this.getAllPredictions();
    const criticalZones = predictions.filter(p => p.riskCategory === 'Critical');
    const highRiskZones = predictions.filter(p => p.riskCategory === 'High');

    return {
      timestamp: new Date().toISOString(),
      totalCapacity,
      totalCurrentCount,
      overallUtilization,
      criticalZoneCount: criticalZones.length,
      highRiskZoneCount: highRiskZones.length,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        code: z.code,
        capacity: z.capacity,
        currentCount: z.currentCount,
        utilizationPct: parseFloat(((z.currentCount / z.capacity) * 100).toFixed(1)),
        arrivalRate: z.arrivalRate,
        departureRate: z.departureRate,
        netFlow: z.arrivalRate - z.departureRate,
      })),
    };
  }

  public static generateIncentiveOffers(originZoneId: string, userId: string): IncentiveOffer[] {
    const origin = db.zones.get(originZoneId);
    if (!origin) throw new Error(`Origin zone ${originZoneId} not found`);

    const allZones = this.getAllZones();
    const alternatives = origin.connectedZones
      .map(id => db.zones.get(id))
      .filter((z): z is Zone => z !== undefined);

    const offers: IncentiveOffer[] = [];
    for (const alt of alternatives) {
      const walkTime = origin.walkingTimeToAlternatives[alt.id] ?? 5;
      const offer = IncentiveEngine.createOffer(userId, origin, alt, walkTime);
      db.incentiveOffers.set(offer.id, offer);
      offers.push(offer);
    }

    return offers;
  }

  public static getOffersForUser(userId: string): IncentiveOffer[] {
    return Array.from(db.incentiveOffers.values()).filter(o => o.userId === userId || o.userId === 'demo_user');
  }

  public static acceptOffer(offerId: string, userSessionId: string): IncentiveOffer {
    const offer = db.incentiveOffers.get(offerId);
    if (!offer) {
      throw new Error(`Incentive offer ${offerId} not found`);
    }

    if (offer.status === 'accepted' || offer.status === 'claimed') {
      throw new Error(`Offer ${offerId} has already been accepted or claimed (Duplicate Action Prevented)`);
    }

    offer.status = 'accepted';
    offer.claimedAt = new Date().toISOString();
    offer.claimNonce = `nonce_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Update user wallet
    db.userWallet.balance += offer.points;
    db.userWallet.claimedVouchers.unshift({
      id: `vch_${Date.now()}`,
      title: offer.voucherDescription,
      code: `CSYNC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      pointsCost: 0,
    });

    // Update target zone occupancy and relieve origin zone
    const origin = db.zones.get(offer.originZoneId);
    const target = db.zones.get(offer.recommendedZoneId);
    if (origin && origin.currentCount > 0) {
      origin.currentCount -= 1;
    }
    if (target) {
      target.currentCount += 1;
    }

    db.recordAudit(
      'INCENTIVE_ACCEPTED',
      `User ${userSessionId} voluntarily redirected to ${offer.recommendedZoneName} (+${offer.points} points awarded)`,
      'Incentive Coordination Service'
    );

    return offer;
  }

  public static rejectOffer(offerId: string): IncentiveOffer {
    const offer = db.incentiveOffers.get(offerId);
    if (!offer) throw new Error(`Offer ${offerId} not found`);
    offer.status = 'rejected';
    return offer;
  }
}
