"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PositionPanel } from "./PositionPanel";
import { CreatorConfirmation } from "./CreatorConfirmation";
import { useClaim } from "@/hooks/useClaim";

export interface MarketDetailData {
  id: string;
  statement: string;
  authorHandle: string | null;
  creatorAddress: string | null;
  sourceUrl?: string | null;
  sourcePlatform?: string | null;
  createdAt: string;
  closesAt: string;
  isConfirmed: boolean;
  status: "OPEN" | "CLOSED" | "RESOLVED" | "SETTLED";
  winningSide?: "AGREE" | "DISAGREE" | null;
  agreePoolEth: number;
  disagreePoolEth: number;
  totalVolumeEth: number;
  socialConsensusPct: number;
  marketAddress: string | null;
  chainId: number;
  oracleFeed: string | null;
  targetPrice: number | null;
  resolutionType: string | null;
}

export interface MarketDetailPanelsProps {
  market: MarketDetailData;
  onPositionUpdated?: () => void;
}

export function MarketDetailPanels({ market, onPositionUpdated }: MarketDetailPanelsProps) {
  const [activeMarket, setActiveMarket] = useState(market);
  const { claim, isPending: isClaiming, isSuccess: isClaimSuccess, error: claimError } = useClaim(activeMarket.marketAddress ?? undefined);

  const totalPool = activeMarket.agreePoolEth + activeMarket.disagreePoolEth;
  const agreePct = totalPool > 0 ? Math.round((activeMarket.agreePoolEth / totalPool) * 100) : 0;
  const disagreePct = totalPool > 0 ? 100 - agreePct : 0;

  const explorerBase = activeMarket.chainId === 46630
    ? "https://robinhood.blockscout.com"
    : "https://sepolia.etherscan.io";

  const handlePositionSuccess = () => {
    if (onPositionUpdated) {
      onPositionUpdated();
    }
  };

  const handleCreatorConfirmed = () => {
    setActiveMarket((prev) => ({ ...prev, isConfirmed: true }));
  };

  const handleClaim = async () => {
    try {
      await claim();
    } catch {
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6 animate-slide-up">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                activeMarket.status === "OPEN"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : activeMarket.status === "RESOLVED"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  : "bg-zinc-100 dark:bg-zinc-700/30 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
              }`}>
                {activeMarket.status}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
                Created {new Date(activeMarket.createdAt).toLocaleDateString()}
              </span>
            </div>

            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Chain: {activeMarket.chainId === 46630 ? "Robinhood Testnet" : "Sepolia"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug mb-4">
            &ldquo;{activeMarket.statement}&rdquo;
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
            {activeMarket.creatorAddress ? (
              <Link
                href={`/creator/${activeMarket.creatorAddress}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white font-bold text-sm">
                    {(activeMarket.authorHandle || "CR").slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                    @{activeMarket.authorHandle || "creator"}
                    {activeMarket.isConfirmed && (
                      <span className="text-emerald-500 text-xs">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {activeMarket.creatorAddress.length >= 10
                      ? `${activeMarket.creatorAddress.slice(0, 6)}...${activeMarket.creatorAddress.slice(-4)}`
                      : activeMarket.creatorAddress}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                  {(activeMarket.authorHandle || "AN").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    @{activeMarket.authorHandle || "anonymous"}
                  </div>
                </div>
              </div>
            )}

            {activeMarket.sourceUrl && (
              <a
                href={activeMarket.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>View Source</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>

        <CreatorConfirmation
          beliefId={activeMarket.id}
          statement={activeMarket.statement}
          authorHandle={activeMarket.authorHandle ?? ""}
          creatorAddress={activeMarket.creatorAddress ?? undefined}
          isConfirmed={activeMarket.isConfirmed}
          marketAddress={activeMarket.marketAddress ?? undefined}
          onConfirmed={handleCreatorConfirmed}
        />

        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Oracle & Resolution Rules</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Target Price Threshold</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                ${(activeMarket.targetPrice ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Condition</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                {activeMarket.resolutionType ?? "PRICE_ABOVE"}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Chainlink Price Feed</span>
            <a
              href={`${explorerBase}/address/${activeMarket.oracleFeed ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline break-all block"
            >
              {activeMarket.oracleFeed ?? "N/A"} ↗
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">On-Chain Transparency</h2>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 gap-1">
              <span className="text-zinc-500 dark:text-zinc-400">Market Contract:</span>
              <a
                href={`${explorerBase}/address/${activeMarket.marketAddress ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
              >
                {activeMarket.marketAddress ?? "N/A"} ↗
              </a>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60">
              <span className="text-zinc-500 dark:text-zinc-400">Closes At:</span>
              <span className="text-zinc-800 dark:text-zinc-200" suppressHydrationWarning>{new Date(activeMarket.closesAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6 animate-slide-left">
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Consensus & Pool Metrics</h2>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-emerald-600 dark:text-emerald-400">AGREE: {agreePct}%</span>
              <span className="text-rose-600 dark:text-rose-400">DISAGREE: {disagreePct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
              <div
                style={{ width: `${agreePct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
              />
              <div
                style={{ width: `${disagreePct}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Total Pool</span>
              <span className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                {activeMarket.totalVolumeEth.toFixed(3)} ETH
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Social Consensus</span>
              <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">
                {activeMarket.socialConsensusPct}%
              </span>
            </div>
          </div>

          {activeMarket.status === "RESOLVED" && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Market Settled
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Winner: {activeMarket.winningSide || "AGREE"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming || isClaimSuccess}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isClaiming ? "Claiming Payout..." : isClaimSuccess ? "✓ Payout Claimed" : "Claim Payout"}
              </button>
              {claimError && (
                <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded p-2">
                  {claimError.message || "Failed to claim payout"}
                </div>
              )}
            </div>
          )}
        </div>

        {activeMarket.status === "OPEN" && (
          <PositionPanel
            marketId={activeMarket.id}
            marketAddress={activeMarket.marketAddress ?? undefined}
            agreePool={activeMarket.agreePoolEth}
            disagreePool={activeMarket.disagreePoolEth}
            onPositionSuccess={handlePositionSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default MarketDetailPanels;
