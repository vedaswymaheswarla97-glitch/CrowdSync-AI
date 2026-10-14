/**
 * CrowdSync AI — Landing Page
 * Architectural introduction, problem/solution breakdown, and fast launchpad.
 */

import React from 'react';
import { NavTab } from '../components/TopNav.tsx';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* Hero Section with Rainbow Border and Glowing Highlights */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-8 md:p-12 shadow-2xl rainbow-border-card">
        <div className="absolute top-0 left-0 right-0 h-1.5 rainbow-gradient" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full rainbow-gradient inline-block" />
            <span className="rainbow-text font-bold">Next-Generation Urban Coordination</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Zero Tracking Architecture</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Intelligent crowd movement <span className="rainbow-text">without personal surveillance</span>.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Large crowds create crippling congestion around campus arenas, stadiums, and transit hubs.
            Traditional navigation pushes everyone into the same choke point. <strong>CrowdSync AI</strong> predicts
            congestion, calculates capacity horizons, and balances demand across peripheral zones using voluntary, game-theoretic virtual incentives—all while proving eligibility with zero-knowledge location cryptography.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl rainbow-gradient text-white font-extrabold text-sm transition-transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-cyan-500/25"
            >
              Open Live Operational Map
            </button>
            <button
              onClick={() => onNavigate('simulation')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer border border-slate-700 hover:border-slate-500"
            >
              Simulate 500-Attendee Event Spike
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="px-6 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 font-semibold text-sm transition-colors cursor-pointer"
            >
              Inspect Privacy &amp; ZKP Model →
            </button>
          </div>
        </div>
      </section>

      {/* The Fundamental Problem & Solution Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-red-400 font-semibold">The Urban Bottleneck Dilemma</div>
          <h2 className="text-xl font-bold text-white">Why Single-Point Optimization Fails</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            When 5,000 attendees exit a campus stadium, conventional navigation and ride-hailing apps route every individual to the closest gate. The primary pickup zone experiences severe 300%+ overload, waiting queues surge past 40 minutes, and emergency response access becomes compromised—even when neighboring transit hubs sit half-empty 400 meters away.
          </p>
          <div className="pt-2 text-xs font-mono text-slate-400 space-y-1">
            <div>✕ GPS coordinates harvested and logged by third-party brokers</div>
            <div>✕ Users alerted simultaneously, causing oscillation from one jam to another</div>
            <div>✕ Zero coordination across public transit, shuttles, and ride-hail fleets</div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-teal-400 font-semibold">The CrowdSync AI Solution</div>
          <h2 className="text-xl font-bold text-white">Coordinated Voluntary Demand Shifting</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CrowdSync AI treats attendee attention and alternative capacity as finite, constrained budgets. Using transparent statistical estimation and multi-factor utility functions, the platform generates voluntary incentive offers (virtual reward points, cafe vouchers) that guide crowds into underutilized transit loops without compulsion.
          </p>
          <div className="pt-2 text-xs font-mono text-slate-400 space-y-1">
            <div>✓ K-anonymity aggregation and Laplace differential privacy</div>
            <div>✓ Zero-knowledge proximity proofs certify eligibility without GPS sharing</div>
            <div>✓ Respects alternative capacity limits: no secondary node is overloaded</div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Overview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Four Engine Architecture</h2>
            <p className="text-sm text-slate-400">Complete modular platform runnable on zero paid external APIs</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('dashboard')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer group relative overflow-hidden shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
            <div className="text-xs font-mono text-rose-400 mb-2 font-bold">Module A · Horizon</div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Predictive Attention &amp; Horizon Engine
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Calculates real-time influx velocity, time-until-capacity-exceeded (TTCE), and safe arrival headroom across all campus nodes.
            </p>
          </div>

          <div
            onClick={() => onNavigate('incentives')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group relative overflow-hidden shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-400" />
            <div className="text-xs font-mono text-amber-400 mb-2 font-bold">Module B · Game Theory</div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Game-Theoretic Incentive Engine
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Balances travel time penalty, voucher value, and system-wide relief using a transparent constrained utility optimization function.
            </p>
          </div>

          <div
            onClick={() => onNavigate('providers')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group relative overflow-hidden shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
            <div className="text-xs font-mono text-cyan-400 mb-2 font-bold">Module C · Gateway</div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Interoperability &amp; Provider Gateway
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Standardized REST endpoints for mapping engines, municipal rail, and event ticketing with token-bucket rate limiting.
            </p>
          </div>

          <div
            onClick={() => onNavigate('privacy')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-fuchsia-500/60 transition-all cursor-pointer group relative overflow-hidden shadow-md"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500" />
            <div className="text-xs font-mono text-fuchsia-400 mb-2 font-bold">Module D &amp; E · Privacy</div>
            <h3 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
              Privacy &amp; Zero-Knowledge Proofs
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Pedersen hash commitments and range checks certify attendee proximity while guaranteeing zero coordinates reach the server.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Launchpad Strip */}
      <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-lg">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rainbow-gradient" />
        <div>
          <div className="text-sm font-bold text-white">Ready to inspect the live simulation?</div>
          <div className="text-xs text-slate-400">Run a simulated 500-attendee stadium egress spike and inspect the 3-scenario comparison.</div>
        </div>
        <button
          onClick={() => onNavigate('simulation')}
          className="px-6 py-2.5 rounded-xl rainbow-gradient text-white font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-md"
        >
          Enter Simulation Lab
        </button>
      </section>
    </div>
  );
};
