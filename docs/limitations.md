# CrowdSync AI — Limitations & Future Roadmap

In compliance with engineering rigor and transparent evaluation, this document states the genuine technical boundaries of the current MVP implementation.

---

## 1. Zero-Knowledge Cryptography: Pedagogical Implementation vs. Full zk-SNARKs

- **Current Implementation:**
  CrowdSync AI implements an educational cryptographic protocol combining SHA-256 coordinate blinding commitments, local Euclidean/Haversine distance constraints, anti-replay nonces, and timestamp freshness checks. This demonstrates the core UX and privacy guarantee: **the server certifies eligibility without receiving or logging coordinates.**
- **Production Roadmap:**
  To guarantee complete zero-knowledge without relying on client-side software integrity, the production version will compile a Circom arithmetic circuit into a Groth16 zk-SNARK verifier executed over BN254 / BLS12-381 elliptic curves using SnarkJS or WebAssembly provers on the device.

---

## 2. Prediction Model: Transparent Rules vs. Machine Learning

- **Current Implementation:**
  The MVP utilizes a transparent statistical formula computing net flow velocity, capacity headroom, and multi-factor risk scores. This ensures predictable, inspectable behavior without "black box" hallucinations during live hackathon demos.
- **Production Roadmap:**
  With continuous historical data streams from transit agencies and arena ticketing gates, a hybrid XGBoost / Spatio-Temporal Graph Neural Network (ST-GNN) can be trained to model weather-dependent walking speeds, multi-modal modal splits, and non-linear egress surges.

---

## 3. Database Layer & Scaling

- **Current Implementation:**
  High-speed transactional in-memory store with atomic nonce sets, suitable for local demonstration, testing, and edge node execution.
- **Production Roadmap:**
  Transition to distributed PostgreSQL with TimescaleDB for telemetry time-series and Redis for sub-millisecond atomic nonce verification and rate limiting across multi-region server clusters.

---

## 4. Public Safety Notice

CrowdSync AI is an urban coordination tool designed to voluntarily distribute routine transit congestion and post-entertainment pedestrian flows. **It is not certified as an emergency evacuation system or 911 life-safety dispatch platform.**
