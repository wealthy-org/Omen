"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PositionPanel } from "./PositionPanel";
import { CreatorConfirmation } from "./CreatorConfirmation";
import { useClaim } from "@/hooks/useClaim";

import { MarketDetailData, MarketDetailPanelsProps } from "@/types";
import { getExplorerBaseUrl } from "@/lib/contracts";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";
import { formatUserErrorMessage } from "@/lib/format-error";

export type { MarketDetailData, MarketDetailPanelsProps };

export function MarketDetailPanels({ market, onPositionUpdated }: MarketDetailPanelsProps) {
  const [activeMarket, setActiveMarket] = useState(market);
  const { claim, isPending: isClaiming, isSuccess: isClaimSuccess, error: claimError } = useClaim();

  const agreePoolEth = activeMarket.agreePoolEth ?? 0;
  const disagreePoolEth = activeMarket.disagreePoolEth ?? 0;
  const totalPool = agreePoolEth + disagreePoolEth;
  const agreePct = totalPool > 0 ? Math.round((agreePoolEth / totalPool) * 100) : 0;
  const disagreePct = totalPool > 0 ? 100 - agreePct : 0;

  const explorerBase = getExplorerBaseUrl(activeMarket.chainId);

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
      if (!activeMarket.marketAddress) {
        throw new Error("Market contract address is missing");
      }
      await claim(activeMarket.marketAddress);
    } catch {
    }
  };

  const cleanHandle = (activeMarket.authorHandle || "creator").replace(/^@/, "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
      <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6 animate-slide-up">
        <div className="bg-white dark:bg-[#070D09]/95 border border-zinc-200 dark:border-emerald-500/20 rounded-3xl p-6 sm:p-7 backdrop-blur-md relative overflow-hidden shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeMarket.status === "OPEN"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : activeMarket.status === "RESOLVED"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    : "bg-zinc-100 dark:bg-zinc-700/30 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                }`}>
                  {activeMarket.status}
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
                  Created {new Date(activeMarket.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2.5 py-0.5 rounded-lg border border-zinc-200 dark:border-white/10">
                {activeMarket.chainId === ROBINHOOD_TESTNET_CHAIN_ID ? "Robinhood Testnet" : "Sepolia"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug mb-5">
              &ldquo;{activeMarket.statement}&rdquo;
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-white/10 mb-4">
              {activeMarket.creatorAddress ? (
                <Link
                  href={`/creator/${activeMarket.creatorAddress}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10 shadow-xs">
                    <img
                      src={`https://unavatar.io/twitter/${cleanHandle}`}
                      alt={cleanHandle}
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-emerald-500 text-white font-bold text-xs flex items-center justify-center absolute inset-0 z-0">
                      {cleanHandle.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                      @{cleanHandle}
                      {activeMarket.isConfirmed && (
                        <span className="text-emerald-500 text-xs font-bold" title="Verified Creator">✓</span>
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
                    {cleanHandle.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      @{cleanHandle}
                    </div>
                  </div>
                </div>
              )}

              {activeMarket.sourceUrl && (
                <a
                  href={activeMarket.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold font-mono text-zinc-700 dark:text-zinc-200 transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-white/10 shadow-xs"
                >
                  <span>View Source</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-white/10">
            <CreatorConfirmation
              beliefId={activeMarket.id}
              statement={activeMarket.statement || activeMarket.title}
              authorHandle={activeMarket.authorHandle ?? undefined}
              creatorAddress={activeMarket.creatorAddress ?? undefined}
              isConfirmed={activeMarket.isConfirmed}
              marketAddress={activeMarket.marketAddress ?? undefined}
              onConfirmed={handleCreatorConfirmed}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#070D09]/95 border border-zinc-200 dark:border-emerald-500/20 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/10">
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Contract & Verification Details
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              {activeMarket.isConfirmed ? "EIP-712 Active" : "Unsigned Claim"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Oracle Resolution Type</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{activeMarket.resolutionType || "Chainlink Relative"}</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Chainlink Price Target</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {activeMarket.targetPrice !== null && activeMarket.targetPrice !== undefined ? `$${activeMarket.targetPrice.toLocaleString()}` : "Market Close State"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1">Source Truth</span>
                <a
                  href={activeMarket.sourceUrl ?? "https://x.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 truncate"
                >
                  <span className="truncate">{activeMarket.sourcePlatform || "Social Feed"}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1">Resolution Deadline</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[11px]" suppressHydrationWarning>
                  {new Date(activeMarket.closesAt || activeMarket.closingDate || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6 animate-slide-left">
        <div className="bg-white dark:bg-[#070D09]/95 border border-zinc-200 dark:border-emerald-500/20 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/10">
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">Consensus & Pool Metrics</h2>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{(activeMarket.totalVolumeEth ?? activeMarket.totalPoolEth ?? 0).toFixed(2)} ETH Pool</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400">AGREE: {activeMarket.agreePercentage}%</span>
                <span className="text-rose-600 dark:text-rose-400">DISAGREE: {activeMarket.disagreePercentage}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-black/60 overflow-hidden flex p-0.5 border border-zinc-200/50 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                  style={{ width: `${activeMarket.agreePercentage}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-r-full transition-all duration-500"
                  style={{ width: `${activeMarket.disagreePercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 font-mono">AGREE POOL</span>
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">{activeMarket.agreeMultiplier}x</span>
                </div>
                <div className="text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {agreePoolEth.toFixed(3)} <span className="text-xs text-zinc-500 font-normal">ETH</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 font-mono">DISAGREE POOL</span>
                  <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">{activeMarket.disagreeMultiplier}x</span>
                </div>
                <div className="text-lg font-black text-zinc-900 dark:text-white font-mono">
                  {disagreePoolEth.toFixed(3)} <span className="text-xs text-zinc-500 font-normal">ETH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1">Staked Pool</span>
              <span className="text-base font-black text-zinc-900 dark:text-white font-mono">
                {(activeMarket.totalVolumeEth ?? activeMarket.totalPoolEth ?? 0).toFixed(3)} ETH
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-1">Social Consensus</span>
              <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                {activeMarket.socialConsensusPct}%
              </span>
            </div>
          </div>

          {activeMarket.status === "RESOLVED" && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-3">
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
                  {formatUserErrorMessage(claimError, "Failed to claim payout. Please try again.")}
                </div>
              )}
            </div>
          )}
        </div>

        {activeMarket.status === "OPEN" && (
          <div className="flex-1 flex flex-col">
            <PositionPanel
              marketId={activeMarket.id}
              marketAddress={activeMarket.marketAddress ?? undefined}
              agreePool={activeMarket.agreePoolEth}
              disagreePool={activeMarket.disagreePoolEth}
              onPositionSuccess={handlePositionSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketDetailPanels;
