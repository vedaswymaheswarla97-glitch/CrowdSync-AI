# CrowdSync AI — Privacy Threat Model

## 1. Trust Assumptions & Security Perimeter

| Component | Trust Level | Rationale |
| :--- | :--- | :--- |
| **User Device (Client)** | Trusted with user secrets | Stores raw GPS coordinates, calculates Euclidean distance locally, and blinds commitments. |
| **CrowdSync Central Server** | Honest-but-curious | Complies with protocol execution, but may attempt to infer individual identities from database records. |
| **External Providers (Transit/Maps)** | Semi-trusted | Authorized via pre-shared API keys; subject to token-bucket rate limiting (60 req/min) and privacy sanitization. |
| **Public Network / Adversaries** | Untrusted | May eavesdrop, attempt replay attacks on incentive tokens, or deploy Sybil scripts to harvest rewards. |

---

## 2. Threat Analysis & Mitigations

### Threat 1: Continuous Location Tracking & Trajectory Reconstruction
- **Vulnerability:** Conventional navigation platforms log continuous $(lat, lng, t)$ trails, creating behavioral fingerprints that reveal home addresses, workplaces, and habits.
- **CrowdSync Mitigation:** The central platform possesses **zero continuous coordinate collection endpoints**. Coordinates are strictly held in volatile client memory. Central database models only store coarse, zone-level aggregate counts (`zone_north_gate`, count: 142).

### Threat 2: Re-Identification via Small-Cohort Slicing
- **Vulnerability:** If an attacker knows that a victim left an arena at 10:04 PM and a peripheral lot reports a count of 1, the attacker links the location to the victim.
- **CrowdSync Mitigation:** **$K$-Anonymity Suppression Filter ($k \ge 5$)**. Any zone reporting fewer than $k$ simultaneous arrivals suppresses the exact count, eliminating single-attendee re-identification.

### Threat 3: Membership Inference via Database Differencing
- **Vulnerability:** An attacker who observes counts before and after an attendee's arrival can infer their participation.
- **CrowdSync Mitigation:** **Calibrated Laplace Differential Privacy ($\text{Lap}(1/\epsilon)$)**. Count responses are perturbed by zero-mean Laplace noise scaled to privacy budget $\epsilon$, mathematically bounding what an observer can deduce about individual presence.

### Threat 4: Incentive Replay & Double-Claim Attacks
- **Vulnerability:** An adversary captures a valid location proof and re-submits it across multiple accounts to drain reward budgets.
- **CrowdSync Mitigation:** **Cryptographic Anti-Replay Nonce Registry**. Each proof is bound to a single-use random nonce and an epoch timestamp. The central verifier performs atomic checks against `claimedNonces`, rejecting any reused nonce with an immediate security alert.

### Threat 5: Provider Telemetry Spoofing & Denial of Service
- **Vulnerability:** Compromised or rogue API keys inject massive fake demand spikes to manipulate incentive algorithms.
- **CrowdSync Mitigation:** Token-bucket rate limiting (60 req/min), schema validation, and outlier clipping prevent external telemetry injection from abruptly destabilizing zone allocations.
