/**
 * CrowdSync AI — Versioned REST API Router (/api/v1/*)
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/store.ts';
import { CrowdService } from '../services/crowdService.ts';
import { SimulationService } from '../services/simulationService.ts';
import { ProviderService } from '../services/providerService.ts';
import { ZkpVerifier } from '../algorithms/zkpVerifier.ts';

export const apiRouter = Router();

// ==========================================
// 1. System Health
// ==========================================
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CrowdSync AI Core Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    modules: {
      predictiveEngine: 'active',
      incentiveEngine: 'active',
      zkpVerifier: 'active',
      providerGateway: 'active',
    },
  });
});

// ==========================================
// 2. Zones & Real-Time Status
// ==========================================
apiRouter.get('/zones', (_req: Request, res: Response) => {
  const zones = CrowdService.getAllZones();
  res.json({ count: zones.length, data: zones });
});

apiRouter.get('/zones/:zone_id', (req: Request, res: Response) => {
  const zone = CrowdService.getZoneById(req.params.zone_id);
  if (!zone) {
    return res.status(404).json({ error: `Zone ${req.params.zone_id} not found` });
  }
  const prediction = CrowdService.getZonePrediction(zone.id);
  res.json({ zone, prediction });
});

apiRouter.patch('/zones/:zone_id', (req: Request, res: Response) => {
  try {
    const updated = CrowdService.updateZone(req.params.zone_id, req.body);
    res.json({ success: true, zone: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/crowd/status', (_req: Request, res: Response) => {
  const status = CrowdService.getCrowdStatus();
  res.json(status);
});

// ==========================================
// 3. Predictions
// ==========================================
apiRouter.post('/predictions', (req: Request, res: Response) => {
  const { zone_id, horizon_minutes, peak_multiplier } = req.body;
  if (zone_id) {
    try {
      const pred = CrowdService.getZonePrediction(zone_id, {
        timeHorizonMinutes: horizon_minutes,
        eventPeakMultiplier: peak_multiplier,
      });
      return res.json(pred);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  const allPredictions = CrowdService.getAllPredictions();
  res.json({ count: allPredictions.length, predictions: allPredictions });
});

// ==========================================
// 4. Simulations (Baseline vs Rule vs Incentive)
// ==========================================
apiRouter.post('/simulations/run', (req: Request, res: Response) => {
  try {
    const simulation = SimulationService.runScenario({
      totalIncomingRequests: req.body.totalIncomingRequests,
      primaryZoneId: req.body.primaryZoneId,
      primaryCapacity: req.body.primaryCapacity,
      altZoneACapacity: req.body.altZoneACapacity,
      altZoneBCapacity: req.body.altZoneBCapacity,
      laterTimeSlotCapacity: req.body.laterTimeSlotCapacity,
      acceptanceRate: req.body.acceptanceRate,
      incentiveBudget: req.body.incentiveBudget,
    });
    res.status(201).json(simulation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/simulations/:simulation_id', (req: Request, res: Response) => {
  const sim = db.simulations.get(req.params.simulation_id);
  if (!sim) {
    return res.status(404).json({ error: `Simulation ${req.params.simulation_id} not found` });
  }
  res.json(sim);
});

// ==========================================
// 5. Recommendations & Incentives
// ==========================================
apiRouter.post('/recommendations', (req: Request, res: Response) => {
  const originZoneId = req.body.origin_zone_id || 'zone_north_gate';
  const userId = req.body.user_id || 'demo_user';

  try {
    const offers = CrowdService.generateIncentiveOffers(originZoneId, userId);
    res.json({
      origin_zone_id: originZoneId,
      user_id: userId,
      offers,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/incentives', (req: Request, res: Response) => {
  const userId = (req.query.user_id as string) || 'demo_user';
  let offers = CrowdService.getOffersForUser(userId);
  if (offers.length === 0) {
    offers = CrowdService.generateIncentiveOffers('zone_north_gate', userId);
  }
  res.json({
    user_id: userId,
    wallet_balance: db.userWallet.balance,
    offers,
  });
});

apiRouter.post('/incentives/:offer_id/accept', (req: Request, res: Response) => {
  const userSessionId = req.body.session_id || 'sess_anonymous_user';
  try {
    const accepted = CrowdService.acceptOffer(req.params.offer_id, userSessionId);
    res.json({
      success: true,
      message: 'Voluntary incentive accepted and points credited.',
      offer: accepted,
      new_balance: db.userWallet.balance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/incentives/:offer_id/reject', (req: Request, res: Response) => {
  try {
    const rejected = CrowdService.rejectOffer(req.params.offer_id);
    res.json({
      success: true,
      message: 'Offer declined. Your location preference remains unchanged.',
      offer: rejected,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/wallet', (_req: Request, res: Response) => {
  res.json(db.userWallet);
});

// ==========================================
// 6. Privacy & Zero-Knowledge Proofs
// ==========================================
apiRouter.get('/privacy/status', (_req: Request, res: Response) => {
  res.json({
    config: db.privacyConfig,
    activeProtections: {
      noPreciseCoordinatesStored: true,
      kAnonymityEnforced: true,
      differentialPrivacyActive: true,
      zeroKnowledgeVerifierReady: true,
      automatedRetentionPurge: `${db.privacyConfig.dataRetentionMinutes} minutes`,
    },
    auditTrailCount: db.auditEvents.length,
    recentAudits: db.auditEvents.slice(0, 10),
  });
});

apiRouter.post('/privacy/update', (req: Request, res: Response) => {
  db.privacyConfig = {
    ...db.privacyConfig,
    ...req.body,
  };
  res.json({ success: true, updatedConfig: db.privacyConfig });
});

apiRouter.post('/privacy/zk-generate-demo', (req: Request, res: Response) => {
  const { userLat, userLng, zoneId, rangeMeters } = req.body;
  const targetZone = db.zones.get(zoneId || 'zone_east_plaza');
  if (!targetZone) {
    return res.status(404).json({ error: 'Target zone not found' });
  }

  const result = ZkpVerifier.generateSimulatedClientProof(
    userLat ?? targetZone.coordinates.lat + 0.001,
    userLng ?? targetZone.coordinates.lng + 0.001,
    targetZone.coordinates.lat,
    targetZone.coordinates.lng,
    targetZone.id,
    rangeMeters ?? 400
  );

  res.json(result);
});

apiRouter.post('/privacy/zk-verify', (req: Request, res: Response) => {
  try {
    const verification = ZkpVerifier.verifyProof(req.body);
    res.status(verification.valid ? 200 : 400).json(verification);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. Mock Provider Telemetry & Gateway
// ==========================================
apiRouter.get('/providers/status', (_req: Request, res: Response) => {
  const providers = ProviderService.getAllProviders();
  res.json({
    count: providers.length,
    providers,
  });
});

apiRouter.post('/providers/telemetry', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : (req.body.api_key as string);

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized: Missing API key. Pass Authorization: Bearer <key> or { "api_key": "<key>" }',
    });
  }

  try {
    const result = ProviderService.ingestTelemetry(apiKey, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message.startsWith('Unauthorized') ? 401 : err.message.startsWith('Rate limit') ? 429 : 400;
    res.status(status).json({ error: err.message });
  }
});

// ==========================================
// 8. Analytics Summary
// ==========================================
apiRouter.get('/analytics/summary', (_req: Request, res: Response) => {
  const status = CrowdService.getCrowdStatus();
  const predictions = CrowdService.getAllPredictions();

  const totalSafeHeadroom = predictions.reduce((sum, p) => sum + p.additionalSafeArrivals, 0);
  const totalSuggestedRedirects = predictions.reduce((sum, p) => sum + p.suggestedRedirectCount, 0);

  res.json({
    timestamp: new Date().toISOString(),
    crowd: status,
    totalSafeHeadroom,
    totalSuggestedRedirects,
    predictionsSummary: predictions.map(p => ({
      zoneId: p.zoneId,
      densityPct: p.predictedDensity,
      riskScore: p.riskScore,
      riskCategory: p.riskCategory,
      ttceMinutes: p.timeUntilCapacityExceededMinutes,
      safeHeadroom: p.additionalSafeArrivals,
      suggestedRedirects: p.suggestedRedirectCount,
    })),
    recentAuditCount: db.auditEvents.length,
    simulationsRunCount: db.simulations.size,
  });
});
