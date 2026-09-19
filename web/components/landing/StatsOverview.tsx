"use client";

import React, { useState, useEffect } from "react";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({}: StatsOverviewProps) {
  const [stats, setStats] = useState({
    totalVolume: "3,960.50 ETH",
    activeMarkets: "412",
    totalBeliefs: "1,284",
    verifiedCreators: "89",
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/stats/overview")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.stats) {
          setStats({
            totalVolume: `${data.stats.total_volume_eth ?? data.stats.total_tvl_eth ?? "0.00"} ETH`,
            activeMarkets: `${data.stats.active_markets ?? 0}`,
            totalBeliefs: `${data.stats.total_beliefs ?? 0}`,
            verifiedCreators: `${data.stats.verified_creators ?? 0}`,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full my-6 sm:my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <div className="rounded-2xl p-4 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-white/10 hover:border-emerald-500/35 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] dark:bg-[#34D399] animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD] truncate">
                  Protocol Volume
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border font-bold shrink-0 bg-emerald-100/70 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/30 text-[#0E7A4E] dark:text-[#34D399]">
                Dual-Chain
              </span>
            </div>

            <div className="my-1.5 sm:my-2">
              <div className="text-xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight transition-colors text-[#0B1F16] dark:text-white group-hover:text-[#0E7A4E] dark:group-hover:text-[#34D399] truncate">
                {stats.totalVolume}
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t flex items-center justify-between text-[10px] sm:text-xs font-mono border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
            <span className="font-semibold text-emerald-500 truncate">Sepolia & Robinhood</span>
            <span className="hidden sm:inline">Escrow Verified</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-white/10 hover:border-emerald-500/35 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="text-emerald-500 font-bold text-xs shrink-0">●</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD] truncate">
                  Active Markets
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border font-bold shrink-0 bg-emerald-100/70 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/30 text-[#0E7A4E] dark:text-[#34D399]">
                Live Consensus
              </span>
            </div>

            <div className="my-1.5 sm:my-2">
              <div className="text-xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight transition-colors text-[#0B1F16] dark:text-white group-hover:text-[#0E7A4E] dark:group-hover:text-[#34D399] truncate">
                {stats.activeMarkets} <span className="text-xs sm:text-lg font-bold font-sans text-zinc-500">Markets</span>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t flex items-center justify-between text-[10px] sm:text-xs font-mono border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
            <div className="flex items-center gap-1 sm:gap-1.5 font-bold">
              <span className="text-emerald-500">AGREE</span>
              <span className="text-zinc-500">/</span>
              <span className="text-rose-500">DISAGREE</span>
            </div>
            <span className="font-semibold text-emerald-500 hidden sm:inline">24/7 Staking</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-white/10 hover:border-emerald-500/35 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="text-blue-500 font-bold text-xs shrink-0">◆</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD] truncate">
                  Total Beliefs
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border font-bold shrink-0 bg-blue-100/70 dark:bg-blue-950/80 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400">
                AI Extracted
              </span>
            </div>

            <div className="my-1.5 sm:my-2">
              <div className="text-xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight transition-colors text-[#0B1F16] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                {stats.totalBeliefs} <span className="text-xs sm:text-lg font-bold font-sans text-zinc-500">Beliefs</span>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t flex items-center justify-between text-[10px] sm:text-xs font-mono border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
            <span className="text-blue-400 font-semibold truncate">Social Signals</span>
            <span className="hidden sm:inline">Twitter & Farcaster</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-white/10 hover:border-emerald-500/35 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="text-emerald-500 font-bold text-xs shrink-0">✓</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD] truncate">
                  Verified Creators
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border font-bold shrink-0 bg-emerald-100/70 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/30 text-[#0E7A4E] dark:text-[#34D399]">
                EIP-712
              </span>
            </div>

            <div className="my-1.5 sm:my-2">
              <div className="text-xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight transition-colors text-[#0B1F16] dark:text-white group-hover:text-[#0E7A4E] dark:group-hover:text-[#34D399] truncate">
                {stats.verifiedCreators} <span className="text-xs sm:text-lg font-bold font-sans text-zinc-500">Creators</span>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t flex items-center justify-between text-[10px] sm:text-xs font-mono border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
            <span className="truncate">Signed Conviction</span>
            <span className="font-bold text-emerald-500 shrink-0">1.5% Fee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
