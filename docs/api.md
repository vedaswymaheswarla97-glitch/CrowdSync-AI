# CrowdSync AI — REST API Documentation

Base URL: `/api/v1`

All requests and responses use standard JSON payloads and UTC ISO-8601 timestamps.

---

### 1. System Health
#### `GET /api/v1/health`
Returns system operational state, active modules, and uptime.

**Response:**
```json
{
  "status": "healthy",
  "service": "CrowdSync AI Core Platform",
  "version": "1.0.0",
  "timestamp": "2026-10-14T07:20:00.000Z",
  "uptimeSeconds": 1420,
  "modules": {
    "predictiveEngine": "active",
    "incentiveEngine": "active",
    "zkpVerifier": "active",
    "providerGateway": "active"
  }
}
```

---

### 2. Zones & Crowd Status
#### `GET /api/v1/zones`
Retrieves all active coordination zones, capacities, arrival rates, and coordinates.

#### `GET /api/v1/zones/:zone_id`
Retrieves a single zone with its computed 15-minute predictive horizon forecast.

#### `PATCH /api/v1/zones/:zone_id`
Adjusts zone parameters in real time (capacity, current count, arrival rate).
**Request Body:**
```json
{
  "currentCount": 160,
  "capacity": 180
}
```

#### `GET /api/v1/crowd/status`
Aggregated network-wide status, net influx rate, critical bottlenecks, and overall utilization.

---

### 3. Predictive Attention Engine
#### `POST /api/v1/predictions`
Calculates congestion risk, Time Until Capacity Exceeded (TTCE), and safe headroom.
**Request Body (Optional):**
```json
{
  "zone_id": "zone_north_gate",
  "horizon_minutes": 15,
  "peak_multiplier": 1.2
}
```

---

### 4. Demand Spike Simulations
#### `POST /api/v1/simulations/run`
Executes a multi-scenario comparison (Baseline vs. Rule-Based vs. Incentive-Assisted).
**Request Body:**
```json
{
  "totalIncomingRequests": 500,
  "primaryCapacity": 150,
  "altZoneACapacity": 100,
  "altZoneBCapacity": 120,
  "laterTimeSlotCapacity": 100,
  "acceptanceRate": 0.65
}
```

---

### 5. Game-Theoretic Incentives
#### `GET /api/v1/incentives?user_id=demo_user`
Retrieves voluntary redirection offers evaluated using multi-factor utility scoring.

#### `POST /api/v1/incentives/:offer_id/accept`
Voluntarily accepts an alternative location offer. Issues digital voucher, credits points, and records anti-duplicate claim nonce.

#### `POST /api/v1/incentives/:offer_id/reject`
Declines an offer. Maintains user's original route without penalty.

---

### 6. Privacy & Zero-Knowledge Verification
#### `GET /api/v1/privacy/status`
Retrieves active k-anonymity thresholds, differential privacy epsilon, and retention purge timers.

#### `POST /api/v1/privacy/zk-verify`
Verifies a client-generated zero-knowledge proximity proof without receiving user coordinates.
**Request Body:**
```json
{
  "proofId": "zkp_1728892000",
  "targetZoneId": "zone_east_plaza",
  "commitment": "a6b7c8...256bit",
  "rangeThresholdMeters": 400,
  "nonce": "9f8a3c4b",
  "timestamp": "2026-10-14T07:20:00.000Z",
  "proofDigest": "5e1d2c...signature",
  "publicInputs": {
    "zoneId": "zone_east_plaza",
    "rangeMeters": 400,
    "claimEpoch": 29800000
  }
}
```

---

### 7. Cross-Platform Provider Gateway
#### `POST /api/v1/providers/telemetry`
Ingests aggregate pulses from authorized mapping, transit, and event partners.
**Headers:**
`Authorization: Bearer <api_key>`
**Request Body:**
```json
{
  "zone_id": "zone_north_gate",
  "raw_observations": 32,
  "timestamp": "2026-10-14T07:20:00.000Z"
}
```
**Rate Limiting:** Enforces maximum 60 requests per minute per integration key.
