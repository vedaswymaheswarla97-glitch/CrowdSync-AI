# CrowdSync AI — System Architecture

## 1. High-Level System Overview

CrowdSync AI is a full-stack, privacy-preserving intelligent crowd coordination platform engineered to alleviate severe post-event bottleneck congestion around campus arenas, stadiums, and urban transit interchanges.

Instead of traditional navigation architectures that harvest continuous GPS traces and inadvertently funnel thousands of people into the nearest exit, CrowdSync AI:
1. Predicts localized congestion velocity and capacity horizons (Time Until Capacity Exceeded, TTCE).
2. Uses game-theoretic multi-factor utility allocation to distribute voluntary demand across multiple underutilized peripheral hubs and staggered time slots.
3. Protects user confidentiality through k-anonymity aggregation, Laplace differential privacy, and zero-knowledge location proximity proofs.

```
+-------------------------------------------------------------------------+
|                              USER CLIENT                                |
|  - Local Coordinate Storage (Never Transmitted)                         |
|  - Distance Calculation to Target Perimeters                            |
|  - SHA-256 Pedersen / Hash Commitment & Nonce Generation                |
|  - Voluntary Incentive Offer Acceptance & Digital Voucher Wallet        |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP/REST (Coarse Aggregations Only)
                                     v
+-------------------------------------------------------------------------+
|                    CROWDSYNC AI BACKEND / API GATEWAY                   |
|                                                                         |
|  [REST API Router]                                                      |
|   /api/v1/zones, /api/v1/crowd/status, /api/v1/predictions              |
|   /api/v1/incentives, /api/v1/simulations, /api/v1/privacy/zk-verify    |
|                                                                         |
|  [Module A: Predictive Horizon Engine]                                  |
|   Net Influx Rate -> Projected Demand -> TTCE -> Safe Headroom          |
|                                                                         |
|  [Module B: Game-Theoretic Incentive Allocation]                        |
|   Utility Optimization -> Safe Capacity Limits -> Anti-Duplicate Nonces|
|                                                                         |
|  [Module C: Cross-Platform Provider Gateway]                            |
|   NaviRoute (Maps) | MetroRail (Transit) | ArenaTicketing (Gateways)    |
|                                                                         |
|  [Module D & E: Privacy Coordination & ZKP Verifier]                    |
|   K-Anonymity Filter (k>=5) | Laplace DP (Lap(1/eps)) | Nonce Registry  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                   PERSISTENT TRANSACTIONAL DATA STORE                   |
|  - Zones & Capacity Configurations                                      |
|  - Aggregated Telemetry Pulses                                          |
|  - Single-Use Nonce Registry (Anti-Replay Protection)                   |
|  - Privacy Audit Trail & Configurable Retention Purge                   |
+-------------------------------------------------------------------------+
```

## 2. Component Structure

- **`src/backend/db/`**: Transactional data store maintaining zone parameters, active simulation records, single-use nonces, and privacy audit logs.
- **`src/backend/algorithms/predictionEngine.ts`**: Transparent rule-based statistical model computing projected demand, capacity saturation time, risk tiers, and redirect counts.
- **`src/backend/algorithms/incentiveEngine.ts`**: Constrained optimization solving multi-alternative demand distribution without exceeding secondary hub ceilings.
- **`src/backend/algorithms/privacyEngine.ts`**: K-anonymity suppression filter and Laplace noise generator for differential privacy.
- **`src/backend/algorithms/zkpVerifier.ts`**: Zero-knowledge proximity verification engine with anti-replay protection.
- **`src/frontend/`**: React + Vite application featuring interactive vector schematic campus topology map, live zone controls, 3-scenario demand spike simulator, voucher wallet, and ZKP demo.
