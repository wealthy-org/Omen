"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeProvider";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({ theme: propTheme }: StatsOverviewProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const [stats, setStats] = useState({
    totalVolume: "0.00 ETH",
    activeMarkets: "0",
    totalBeliefs: "0",
    verifiedCreators: "0",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group ${
            isDark
              ? "bg-[#070D09]/95 border-white/10 hover:border-emerald-500/40 shadow-lg"
              : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"} animate-pulse`} />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  Protocol Volume
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isDark
                    ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]"
                    : "bg-emerald-100/70 border-emerald-300 text-[#0E7A4E]"
                }`}
              >
                Dual-Chain
              </span>
            </div>

            <div className="my-2">
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                {stats.totalVolume}
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
            }`}
          >
            <span className="font-semibold text-emerald-500">Sepolia & Robinhood</span>
            <span>Escrow Verified</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group ${
            isDark
              ? "bg-[#070D09]/95 border-white/10 hover:border-emerald-500/40 shadow-lg"
              : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold text-xs">●</span>
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  Active Markets
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isDark
                    ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]"
                    : "bg-emerald-100/70 border-emerald-300 text-[#0E7A4E]"
                }`}
              >
                Live Consensus
              </span>
            </div>

            <div className="my-2">
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                {stats.activeMarkets} <span className="text-lg font-bold font-sans text-zinc-500">Markets</span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-emerald-500">AGREE</span>
              <span className="text-zinc-500">/</span>
              <span className="text-rose-500">DISAGREE</span>
            </div>
            <span className="font-semibold text-emerald-500">24/7 Staking</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group ${
            isDark
              ? "bg-[#070D09]/95 border-white/10 hover:border-emerald-500/40 shadow-lg"
              : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-bold text-xs">◆</span>
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  Total Beliefs
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isDark
                    ? "bg-blue-950/80 border-blue-500/30 text-blue-400"
                    : "bg-blue-100/70 border-blue-300 text-blue-700"
                }`}
              >
                AI Extracted
              </span>
            </div>

            <div className="my-2">
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-blue-400" : "text-[#0B1F16] group-hover:text-blue-600"
                }`}
              >
                {stats.totalBeliefs} <span className="text-lg font-bold font-sans text-zinc-500">Beliefs</span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
            }`}
          >
            <span className="text-blue-400 font-semibold">Social Signals</span>
            <span>Twitter & Farcaster</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover-lift group ${
            isDark
              ? "bg-[#070D09]/95 border-white/10 hover:border-emerald-500/40 shadow-lg"
              : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold text-xs">✓</span>
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  Verified Creators
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isDark
                    ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]"
                    : "bg-emerald-100/70 border-emerald-300 text-[#0E7A4E]"
                }`}
              >
                EIP-712
              </span>
            </div>

            <div className="my-2">
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                {stats.verifiedCreators} <span className="text-lg font-bold font-sans text-zinc-500">Creators</span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
            }`}
          >
            <span>Signed Conviction</span>
            <span className="font-bold text-emerald-500">1.5% Fee Share</span>
          </div>
        </div>
      </div>
    </section>
  );
}
