# CrowdSync AI — Privacy-Preserving Intelligent Crowd Coordination Platform

[![Automated Tests](https://img.shields.io/badge/Tests-27%20Passed-10B981?style=flat-square)](./tests/run_tests.ts)
[![Privacy Architecture](https://img.shields.io/badge/Privacy-Zero%20GPS%20Tracking-0EA5E9?style=flat-square)](./docs/privacy-threat-model.md)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue?style=flat-square)](./LICENSE)

CrowdSync AI is an end-to-end urban crowd coordination platform that predicts localized congestion, calculates capacity horizons, and balances attendee demand across underutilized peripheral transit hubs using voluntary game-theoretic virtual incentives—all while proving eligibility with zero-knowledge location cryptography.

---

## 1. Key Innovations

1. **Predictive Attention & Horizon Engine (Module A):** Computes net pedestrian flow velocity, projected demand over configurable time horizons, Time Until Capacity Exceeded (TTCE), and safe arrival headroom.
2. **Game-Theoretic Incentive Allocation (Module B):** Balances walking inconvenience against congestion relief and virtual voucher rewards using transparent utility optimization. Enforces strict secondary hub capacity limits (no alternative is overloaded).
3. **Cross-Platform Interoperability Gateway (Module C):** Standardized REST API with token-bucket rate limiting and mock adapters for NaviRoute (Mapping), MetroRail (Municipal Transit), and ArenaTicketing (Event Gateways).
4. **Data Minimization & Differential Privacy (Module D):** Enforces k-anonymity aggregation ($k \ge 5$) and injects calibrated Laplace noise to eliminate re-identification without harvesting continuous GPS trails.
5. **Zero-Knowledge Location Proof Demonstration (Module E):** Educational cryptographic protocol utilizing client-side SHA-256 commitments, Euclidean range checks, and single-use nonces to certify proximity without revealing coordinates.

---

## 2. Project Directory Structure

```
.
├── src/
│   ├── backend/
│   │   ├── algorithms/
│   │   │   ├── predictionEngine.ts    # Congestion metrics, TTCE, safe headroom
│   │   │   ├── incentiveEngine.ts     # Multi-factor utility, constrained optimization
│   │   │   ├── privacyEngine.ts       # K-anonymity filter & Laplace differential privacy
│   │   │   └── zkpVerifier.ts         # Zero-Knowledge proximity verification & anti-replay
│   │   ├── db/
│   │   │   ├── schema.ts              # Domain types and database models
│   │   │   └── store.ts               # Transactional data store with seeded event data
│   │   ├── routes/
│   │   │   └── apiRouter.ts           # Versioned REST endpoints (/api/v1/*)
│   │   └── services/
│   │       ├── crowdService.ts        # Zone statuses, predictions, offers, wallet
│   │       ├── simulationService.ts   # 500-attendee egress spike simulation
│   │       └── providerService.ts     # Mock provider adapters & telemetry ingestion
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── TopNav.tsx             # Strict 3-zone Top Bar Contract navigation
│   │   │   ├── SchematicMap.tsx       # Vector campus topology map with live heatmaps
│   │   │   ├── MetricsOverview.tsx    # Tabular KPI summary indicators
│   │   │   └── ZkProofModal.tsx       # Interactive step-by-step ZKP prover & verifier
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Problem/solution overview & feature highlights
│   │   │   ├── DashboardPage.tsx      # Operational map & interactive zone inspector
│   │   │   ├── SimulationLabPage.tsx  # 3-scenario comparison (Baseline vs Rule vs Incentive)
│   │   │   ├── IncentivesPage.tsx     # Voluntary redirection offers & voucher wallet
│   │   │   ├── PrivacyCenterPage.tsx  # K-anonymity controls, DP noise lab, ZKP launcher
│   │   │   ├── ApiIntegrationsPage.tsx# Provider gateway, telemetry tester & API specs
│   │   │   └── DocsPage.tsx           # Technical docs, math derivations & demo script
│   │   ├── services/
│   │   │   └── api.ts                 # Frontend API client
│   │   └── types/
│   │       └── index.ts               # Shared domain interfaces
│   ├── App.tsx                        # Root application component
│   ├── index.css                      # Tailwind CSS base styles & typography
│   └── main.tsx                       # React DOM entry point
├── tests/
│   └── run_tests.ts                   # 27 automated unit and integration tests
├── docs/
│   ├── architecture.md                # System topology and component flow
│   ├── api.md                         # Complete REST API reference
│   ├── algorithm.md                   # Mathematical derivations and formulas
│   ├── privacy-threat-model.md        # Threat analysis and mitigations
│   └── limitations.md                 # Implementation boundaries and future roadmap
├── server.ts                          # Standalone production server
├── package.json
└── vite.config.ts                     # Vite config mounting Express API middleware
```

---

## 3. Installation & Local Startup

The platform is designed to run locally using free, zero-paid dependencies without cloud accounts or paid API keys.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`. The Vite development server automatically mounts the full Express `/api/v1` backend router and serves the React frontend.

### 3. Run the Automated Test Suite
```bash
npx tsx tests/run_tests.ts
```
Executes all 27 automated tests verifying predictive formulas, capacity constraints, differential privacy noise, and anti-replay defense.

### 4. Build for Production
```bash
npm run build
npx tsx server.ts
```

---

## 4. Features Implemented vs. Simulated

| Feature | Implementation Status | Technical Details |
| :--- | :--- | :--- |
| **Prediction & Horizon Engine** | Fully Implemented | Computes net flow velocity, TTCE, safe headroom, and risk tiers (0–100) dynamically. |
| **Constrained Demand Allocation** | Fully Implemented | Multi-factor utility optimization strictly capped at 85% safe capacity for secondary nodes. |
| **Anti-Duplicate Claim Defense** | Fully Implemented | Enforces atomic single-use nonce checks; blocks replay attempts immediately. |
| **K-Anonymity & Laplace DP** | Fully Implemented | Suppresses cohorts $< k$ and injects calibrated Laplace noise based on privacy budget $\epsilon$. |
| **Zero-Knowledge Proximity Proof** | Pedagogically Implemented | Client computes SHA-256 coordinate commitment and range check. Server certifies eligibility with zero coordinate disclosure. |
| **External Providers** | Mock Adapters | Functional REST adapters for NaviRoute, MetroRail, and ArenaTicketing with rate limiting. |
| **Virtual Rewards** | Simulated Currency | Virtual educational points and digital voucher codes; no payment gateway integration. |

---

## 5. Five-Minute Hackathon Demo Script

1. **Minute 1 · Network Overview:** Open the **Live Map & Grid**. Inspect the 5-node campus topology. Note North Gate operating in high-congestion with incoming influx. Click any zone to adjust crowd counts or inject a +25 demand pulse.
2. **Minute 2 · 500-Attendee Simulation:** Navigate to **Simulation Lab**. Evaluate the 500-attendee stadium egress spike. Observe how CrowdSync AI coordination cuts average wait times from 42m down to safe limits while respecting all alternative capacities.
3. **Minute 3 · Voluntary Incentives:** Go to **Incentive Center**. Click **Accept & Earn** on a voluntary alternative voucher. Observe points credited to your Attendee Wallet, and try accepting twice to see duplicate-claim protection in action.
4. **Minute 4 · Zero-Knowledge Proofs:** Open **Privacy & ZKP** and launch the **Interactive Zero-Knowledge Prover**. Adjust client distance, compute the commitment + nonce, submit to the server, and verify certification with `revealedCoordinates: null`.
5. **Minute 5 · Testing & Interoperability:** Go to **API Integrations** to push a simulated pulse through the provider gateway. In terminal, run `npx tsx tests/run_tests.ts` to see 27 passing tests.
