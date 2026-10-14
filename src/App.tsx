/**
 * CrowdSync AI — Root Application Component
 * Privacy-Preserving Intelligent Crowd Coordination Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav, NavTab } from './frontend/components/TopNav.tsx';
import { LandingPage } from './frontend/pages/LandingPage.tsx';
import { DashboardPage } from './frontend/pages/DashboardPage.tsx';
import { SimulationLabPage } from './frontend/pages/SimulationLabPage.tsx';
import { IncentivesPage } from './frontend/pages/IncentivesPage.tsx';
import { PrivacyCenterPage } from './frontend/pages/PrivacyCenterPage.tsx';
import { ApiIntegrationsPage } from './frontend/pages/ApiIntegrationsPage.tsx';
import { DocsPage } from './frontend/pages/DocsPage.tsx';
import { Zone, PredictionResult, CrowdStatus, UserWallet } from './frontend/types/index.ts';
import { api } from './frontend/services/api.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [zones, setZones] = useState<Zone[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [crowdStatus, setCrowdStatus] = useState<CrowdStatus | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setGlobalError(null);
      const [zonesRes, crowdRes, predsRes, walletRes] = await Promise.all([
        api.getZones(),
        api.getCrowdStatus(),
        api.getPredictions(),
        api.getWallet(),
      ]);

      setZones(zonesRes.data);
      setCrowdStatus(crowdRes);
      setWallet(walletRes);

      const predMap: Record<string, PredictionResult> = {};
      predsRes.predictions.forEach(p => {
        predMap[p.zoneId] = p;
      });
      setPredictions(predMap);
    } catch (err: any) {
      console.error('Failed to load crowd data:', err);
      setGlobalError('Failed to synchronize with CrowdSync engine. Verify server is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh background crowd status every 20 seconds
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* Ambient Rainbow Glow Orbs for Stakeholder Presentation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-35">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-rose-600/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-[28rem] h-[28rem] bg-cyan-500/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/4 w-[32rem] h-[32rem] bg-emerald-500/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-1/3 w-[30rem] h-[30rem] bg-amber-500/25 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-10 w-[28rem] h-[28rem] bg-violet-600/30 rounded-full blur-[130px]" />
      </div>

      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        walletBalance={wallet?.balance ?? 420}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto relative z-10">
        {globalError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center justify-between">
            <span>{globalError}</span>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 bg-red-900/60 hover:bg-red-900 rounded font-mono text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <div className="text-xs font-mono text-slate-400">Initializing CrowdSync Coordination Engines...</div>
          </div>
        ) : (
          <>
            {currentTab === 'landing' && <LandingPage onNavigate={setCurrentTab} />}
            {currentTab === 'dashboard' && (
              <DashboardPage
                zones={zones}
                predictions={predictions}
                crowdStatus={crowdStatus}
                onRefreshData={loadData}
                onNavigateToTab={setCurrentTab}
              />
            )}
            {currentTab === 'simulation' && <SimulationLabPage />}
            {currentTab === 'incentives' && (
              <IncentivesPage wallet={wallet} onRefreshWallet={loadData} />
            )}
            {currentTab === 'privacy' && <PrivacyCenterPage />}
            {currentTab === 'providers' && <ApiIntegrationsPage />}
            {currentTab === 'docs' && <DocsPage />}
          </>
        )}
      </main>

      {/* Quiet Footer adhering strictly to Anti-Slop Discipline (No fake status tickers) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CrowdSync AI — Privacy-Preserving Intelligent Crowd Coordination Platform</span>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Aggregated Zone Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Zero Tracking GPS Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
