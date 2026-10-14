/**
 * CrowdSync AI — Module B: Game-Theoretic Incentive Center
 * 
 * Voluntary alternative location and time slot recommendations with virtual points,
 * digital vouchers, and duplicate claim protection.
 */

import React, { useState, useEffect } from 'react';
import { IncentiveOffer, UserWallet } from '../types/index.ts';
import { api } from '../services/api.ts';

interface IncentivesPageProps {
  wallet: UserWallet | null;
  onRefreshWallet: () => Promise<void>;
}

export const IncentivesPage: React.FC<IncentivesPageProps> = ({ wallet, onRefreshWallet }) => {
  const [offers, setOffers] = useState<IncentiveOffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSessionId] = useState<string>(() => `sess_${Math.random().toString(36).substr(2, 8)}`);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncentives('demo_user');
      setOffers(data.offers);
    } catch (err: any) {
      console.error('Failed to load incentive offers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAccept = async (offerId: string) => {
    setFeedbackMessage(null);
    try {
      const result = await api.acceptIncentive(offerId, activeSessionId);
      setFeedbackMessage({
        type: 'success',
        text: `Offer accepted! +${result.offer.points} points credited to your wallet. You can redeem your voucher at the destination.`,
      });
      await onRefreshWallet();
      await fetchOffers();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to accept offer.',
      });
    }
  };

  const handleReject = async (offerId: string) => {
    setFeedbackMessage(null);
    try {
      await api.rejectIncentive(offerId);
      setFeedbackMessage({
        type: 'success',
        text: 'Offer declined. Your route preference remains unchanged.',
      });
      await fetchOffers();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="rainbow-text">Voluntary Incentive &amp; Voucher Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Earn virtual reward points by choosing underutilized transit nodes and staggered departure windows
          </p>
        </div>

        {/* User Simulated Wallet Banner with Rainbow Points */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400">
            <div>Attendee Wallet Balance</div>
            <div className="font-mono text-xl font-black rainbow-text tabular-nums">
              {wallet ? wallet.balance : '...'} pts
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-xs font-mono text-slate-500">
            Session: <span className="text-slate-300">{activeSessionId.slice(0, 10)}</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-red-950/40 border-red-800 text-red-200'
        }`}>
          {feedbackMessage.text}
        </div>
      )}

      {/* Available Voluntary Offers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Active Redirection Offers</h2>
            <p className="text-xs text-slate-400">
              Evaluated via multi-factor utility scoring. No compulsion: accept or decline freely.
            </p>
          </div>
          <button
            onClick={fetchOffers}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            ↻ Refresh Offers
          </button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            No active congestion offers. Traffic flows across all hubs are currently balanced.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {offers.map((offer) => {
              const isPending = offer.status === 'offered';
              return (
                <div
                  key={offer.id}
                  className={`p-5 rounded-xl border transition-all ${
                    offer.status === 'accepted'
                      ? 'bg-slate-900/60 border-emerald-800/60'
                      : offer.status === 'rejected'
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-teal-500/50 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono text-teal-400 font-medium">
                        Alternative Pickup: {offer.recommendedZoneName}
                      </div>
                      <h3 className="text-base font-semibold text-white mt-0.5">
                        {offer.voucherDescription}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black font-mono rainbow-text tabular-nums">
                        +{offer.points}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono">pts reward</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono p-3 rounded-lg bg-slate-950 border border-slate-800/60">
                    <div>
                      <div className="text-slate-500">Walk Time</div>
                      <div className="text-slate-200 font-semibold">{offer.estimatedDelayMinutes} mins</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Congestion Relief</div>
                      <div className="text-cyan-400 font-semibold">~{offer.systemCongestionReductionPct}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Utility Score</div>
                      <div className="text-fuchsia-300 font-semibold">{offer.utilityScore}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-500 font-mono">
                      Status: <span className="text-slate-300 capitalize">{offer.status}</span>
                      {offer.claimNonce && ` (${offer.claimNonce.slice(0, 10)})`}
                    </span>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(offer.id)}
                          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAccept(offer.id)}
                          className="py-2 px-4 rounded-xl rainbow-gradient text-white text-xs font-black hover:scale-105 active:scale-95 cursor-pointer transition-transform shadow-md"
                        >
                          Accept &amp; Earn
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-mono font-medium ${
                        offer.status === 'accepted' ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {offer.status === 'accepted' ? '✓ Accepted & Points Awarded' : 'Declined'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Claimed Vouchers Wallet Section */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Redeemed Digital Vouchers</h2>
        <p className="text-xs text-slate-400">
          Show these digital codes at participating campus cafes or transit kiosks
        </p>

        {wallet && wallet.claimedVouchers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {wallet.claimedVouchers.map((voucher) => (
              <div key={voucher.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{voucher.title}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">Claimed {voucher.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-teal-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {voucher.code}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">Ready to scan</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500">No vouchers claimed yet. Accept an alternative above to earn rewards.</div>
        )}

        <div className="pt-2 text-xs text-slate-500 italic">
          Disclaimer: Simulated virtual points and vouchers for demonstration only. No real monetary transactions or payments processed.
        </div>
      </section>
    </div>
  );
};
