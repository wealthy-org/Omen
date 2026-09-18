"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../ThemeProvider";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({ theme: propTheme }: StatsOverviewProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const [stats, setStats] = useState({
    totalVolume: "0.00 ETH",
    activeMarkets: "0 Markets",
    totalBeliefs: "0 Beliefs",
    verifiedCreators: "0 Creators",
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/stats/overview")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.stats) {
          setStats({
            totalVolume: `${data.stats.total_volume_eth ?? data.stats.total_tvl_eth ?? "0.00"} ETH`,
            activeMarkets: `${data.stats.active_markets ?? 0} Markets`,
            totalBeliefs: `${data.stats.total_beliefs ?? 0} Beliefs`,
            verifiedCreators: `${data.stats.verified_creators ?? 0} Creators`,
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
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 hover-lift animate-slide-up stagger-1 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"} animate-pulse`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Total Protocol Volume
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                isDark ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]" : "bg-emerald-100 border-emerald-300 text-[#0E7A4E]"
              }`}
            >
              Dual-Chain
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.totalVolume}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sepolia & Robinhood
            </span>
            <span className={`text-[11px] truncate ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Escrow Verified
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 hover-lift animate-slide-up stagger-2 group ${
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
              Live Consensus
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
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">AGREE</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">DISAGREE</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">24/7 Staking</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 hover-lift animate-slide-up stagger-3 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Total Beliefs
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                isDark ? "bg-blue-950/60 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-500/20 text-blue-600"
              }`}
            >
              AI Extracted
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-blue-400" : "text-[#0B1F16] group-hover:text-blue-600"
              }`}
            >
              {stats.totalBeliefs}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Social Signals
            </span>
            <span className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Twitter & Farcaster
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 hover-lift animate-slide-up stagger-4 group ${
            isDark
              ? "bg-[#070D09]/90 border-emerald-500/20 hover:border-emerald-400/40 shadow-lg hover:bg-emerald-500/[0.03]"
              : "bg-white/95 border-emerald-500/15 light-card-shine hover:border-emerald-400/35 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Verified Creators
              </span>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              EIP-712
            </span>
          </div>

          <div className="my-1">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              {stats.verifiedCreators}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
            <span className={`text-[11px] truncate ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Signed Conviction
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              1.5% Fee Share
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
