# CrowdSync AI — Algorithm & Metric Formulations

## 1. Module A: Predictive Horizon & Attention Budgeting

### Metrics & Definitions:
- **Current Utilization ($U_t$):**
  $$U_t = \frac{\text{CurrentCount}_t}{\text{Capacity}} \times 100\%$$
- **Net Influx Velocity ($V_{\text{net}}$):**
  $$V_{\text{net}} = (\text{ArrivalRate} \times M_{\text{peak}}) - \text{DepartureRate}$$
- **Projected Demand ($D_{t+H}$):**
  $$D_{t+H} = \max\left(0, \text{CurrentCount}_t + V_{\text{net}} \times H\right)$$
  *(where default horizon $H = 15$ minutes).*
- **Time Until Capacity Exceeded (TTCE):**
  $$\text{TTCE} = \begin{cases}
  0, & \text{if } \text{CurrentCount} \ge \text{Capacity} \\
  \frac{\text{Capacity} - \text{CurrentCount}}{V_{\text{net}}}, & \text{if } V_{\text{net}} > 0 \\
  \infty \text{ (Safe)}, & \text{if } V_{\text{net}} \le 0
  \end{cases}$$
- **Congestion Risk Score ($R \in [0, 100]$):**
  $$R = \min\left(100, 0.40 \cdot \min(100, U_t) + 0.40 \cdot \min(120, U_{t+H}) + 0.20 \cdot \text{Clamp}_{0}^{100}\left(\frac{V_{\text{net}}}{\max(1, \text{DepartureRate})} \times 50\right)\right)$$
- **Safe Arrivals Headroom:**
  $$\text{Headroom} = \max\left(0, \text{Capacity} - \text{CurrentCount}_t\right)$$
- **Target Voluntary Redirect Count ($N_{\text{redirect}}$):**
  $$N_{\text{redirect}} = \max\left(0, D_{t+H} - \lfloor 0.80 \times \text{Capacity}\rfloor\right)$$

---

## 2. Module B: Game-Theoretic Incentive Allocation

### Multi-Factor Utility Function:
For an origin zone $Z_{\text{orig}}$ and alternative candidate $Z_{\text{alt}}$:
$$U(Z_{\text{alt}}) = \alpha \cdot \Delta \text{Congestion} - \beta \cdot T_{\text{walk}} + \gamma \cdot \frac{\text{Points}}{5}$$

Where:
- $\Delta \text{Congestion} = \max(0, U(Z_{\text{orig}}) - U(Z_{\text{alt}}))$
- $T_{\text{walk}}$: Pedestrian walking time in minutes
- $\text{Points}$: Virtual reward points offered
- Weights: $\alpha = 1.4$, $\beta = 3.2$, $\gamma = 0.8$

### Constrained Knapsack Allocation:
To satisfy physical safety bounds, the algorithm imposes strict upper bounds:
$$\sum_{i} \text{Allocated}(Z_{\text{alt}, i}) \le N_{\text{redirect}}$$
Subject to:
$$\text{Allocated}(Z_{\text{alt}, i}) \le \max\left(0, \lfloor 0.85 \cdot \text{Capacity}(Z_{\text{alt}, i})\rfloor - \text{CurrentCount}(Z_{\text{alt}, i})\right)$$

Surplus demand that cannot be safely absorbed by spatial nodes is allocated to staggered temporal slots ($+15$m and $+30$m lounge refreshment windows).

---

## 3. Module D: Differential Privacy (Laplace Mechanism)

For aggregate count queries $f(D)$, the global sensitivity is $\Delta f = 1$ (adding or removing one attendee changes the count by at most 1).
To guarantee $\epsilon$-differential privacy, we add random noise drawn from the zero-mean Laplace distribution:
$$\text{Noise} \sim \text{Laplace}\left(0, \frac{\Delta f}{\epsilon}\right) = \text{Laplace}\left(0, \frac{1}{\epsilon}\right)$$
$$f_{\text{private}}(D) = \max\left(0, \text{round}\left(f(D) + \text{Noise}\right)\right)$$

Coupled with $k$-anonymity: if $f(D) < k$ (default $k=5$), the metric is completely suppressed from release.
