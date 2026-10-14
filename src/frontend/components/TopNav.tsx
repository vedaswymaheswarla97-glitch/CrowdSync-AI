/**
 * CrowdSync AI — Top Navigation Bar
 * Follows the strict one-row, three-zone Top Bar Contract.
 */

import React from 'react';

export type NavTab = 
  | 'landing' 
  | 'dashboard' 
  | 'simulation' 
  | 'incentives' 
  | 'privacy' 
  | 'providers' 
  | 'docs';

interface TopNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  walletBalance: number;
}

export const TopNav: React.FC<TopNavProps> = ({ currentTab, onSelectTab, walletBalance }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Zone 1: Single text element wordmark with animated rainbow text */}
      <button
        onClick={() => onSelectTab('landing')}
        className="text-xl font-black tracking-tight whitespace-nowrap shrink-0 cursor-pointer group"
      >
        <span className="rainbow-text">CrowdSync AI</span>
      </button>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'dashboard' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          Live Map & Grid
          {currentTab === 'dashboard' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('simulation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'simulation' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          Simulation Lab
          {currentTab === 'simulation' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('incentives')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'incentives' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          Incentive Center
          {currentTab === 'incentives' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('privacy')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'privacy' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          Privacy & ZKP
          {currentTab === 'privacy' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('providers')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'providers' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          API Integrations
          {currentTab === 'providers' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('docs')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
            currentTab === 'docs' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          Documentation
          {currentTab === 'docs' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rainbow-gradient rounded-full" />
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action with vibrant user wallet badge */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => onSelectTab('incentives')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
          title="Simulated User Wallet"
        >
          <span>Wallet</span>
          <span className="font-bold rainbow-text tabular-nums">{walletBalance} pts</span>
        </button>
        
        <button
          onClick={() => onSelectTab('simulation')}
          className="px-4 py-2 text-xs font-extrabold text-white rainbow-gradient rounded-lg transition-transform hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer shadow-lg hover:shadow-cyan-500/20"
        >
          Run Spike Simulation
        </button>
      </div>
    </header>
  );
};
