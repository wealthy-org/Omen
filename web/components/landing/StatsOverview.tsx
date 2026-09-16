"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../ThemeProvider";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({ theme: propTheme }: StatsOverviewProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const [stats, setStats] = useState({
    totalTvl: "148.50 ETH",
    activeMarkets: "24 Markets",
    pointsDistributed: "1,420,000 PTS",
    activeWallets: "4,120 Wallets",
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/stats/overview")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.stats) {
          setStats({
            totalTvl: `${data.stats.total_tvl_eth} ETH`,
            activeMarkets: `${data.stats.active_markets} Markets`,
            pointsDistributed: `${Number(data.stats.total_points).toLocaleString()} PTS`,
            activeWallets: `${Number(data.stats.active_wallets).toLocaleString()} Wallets`,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full my-4 sm:my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"} animate-pulse`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Total Value Locked
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                isDark ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]" : "bg-emerald-100 border-emerald-300 text-[#0E7A4E]"
              }`}
            >
              Arbitrum L2
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.totalTvl}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-yes-green/10 text-yes-green border border-yes-green/20">
              +24.6% this week
            </span>
            <span className={`text-[11px] truncate ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Non-Custodial Escrow
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Active Markets
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                isDark ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]" : "bg-emerald-50 border-emerald-500/20 text-[#0E7A4E]"
              }`}
            >
              Real-time Odds
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.activeMarkets}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">ETH</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">ARB</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">MACRO</span>
            </div>
            <span className="text-[11px] text-yes-green font-bold">24/7 Live</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Image src="/icons/hot.webp" alt="Points" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Points Distributed
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                isDark ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]" : "bg-emerald-50 border-emerald-500/20 text-[#0E7A4E]"
              }`}
            >
              Season 1 Pool
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.pointsDistributed}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-yes-green/10 text-yes-green border border-yes-green/20">
              3.0x Multiplier
            </span>
            <span className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Gasless Quests
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Community Active
              </span>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-yes-green/10 text-yes-green border border-yes-green/20 font-bold">
              100% Onchain
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.activeWallets}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className={`text-[11px] truncate ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Verified Bettors
            </span>
            <span className="text-[11px] text-yes-green font-bold">
              Instant Payouts
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
