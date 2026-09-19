"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface ActivityItem {
  id: string;
  address: string;
  action: "agreed" | "disagreed";
  claim: string;
  amount: string;
  timeAgo: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: "1", address: "0x89f4...3a1c", action: "agreed", claim: "SOL > ETH this month", amount: "1.5 ETH", timeAgo: "1m ago" },
  { id: "2", address: "0x3bc1...90fe", action: "disagreed", claim: "Fed cuts rates in Q3", amount: "0.8 ETH", timeAgo: "3m ago" },
  { id: "3", address: "0x12dc...44b2", action: "agreed", claim: "BTC prints new ATH", amount: "2.4 ETH", timeAgo: "5m ago" },
  { id: "4", address: "0x67ab...19dd", action: "agreed", claim: "Arbitrum TVL doubles", amount: "0.5 ETH", timeAgo: "8m ago" },
  { id: "5", address: "0x9812...77cc", action: "disagreed", claim: "Memecoin cull in 90d", amount: "1.2 ETH", timeAgo: "12m ago" },
];

const SAMPLE_CLAIMS = [
  "SOL > ETH this month",
  "ETH > $5,000 before year end",
  "BTC prints new ATH",
  "Fed cuts rates in Q3",
  "Arbitrum TVL doubles",
  "Memecoin cull in 90d",
];

export interface LandingActivityStreamProps {
  theme?: "dark" | "light";
}

export default function LandingActivityStream({ theme: propTheme }: LandingActivityStreamProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      const isAgree = Math.random() > 0.4;
      const randomEth = (Math.random() * 2 + 0.2).toFixed(1);
      const randomClaim = SAMPLE_CLAIMS[Math.floor(Math.random() * SAMPLE_CLAIMS.length)];
      const randomHex = `0x${Math.floor(Math.random() * 0xffff).toString(16)}...${Math.floor(Math.random() * 0xffff).toString(16)}`;

      const newEntry: ActivityItem = {
        id: `${Date.now()}-${Math.random()}`,
        address: randomHex,
        action: isAgree ? "agreed" : "disagreed",
        claim: randomClaim,
        amount: `${randomEth} ETH`,
        timeAgo: "just now",
      };

      setActivities((prev) => [newEntry, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
            }`}
          >
            Reputation & Consensus Ledger
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
        >
          Conviction Becomes a Record
        </h2>
        <p
          className={`text-sm sm:text-base mt-1.5 max-w-2xl ${
            isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
          }`}
        >
          Every resolved belief is scored on-chain. Being loud is free, but being right is permanently measured.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div
          id="creators"
          className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover-lift scroll-mt-24 ${
            isDark
              ? "bg-[#070D09]/90 border-white/10 shadow-lg text-white"
              : "bg-white/95 border-emerald-500/15 shadow-xs text-[#0B1F16]"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-white font-bold text-base flex items-center justify-center border border-white/20">
                TX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold">@TraderX</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    ✓ Verified
                  </span>
                </div>
                <p className={`text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                  Tracking convictions since March 2026
                </p>
              </div>
            </div>
            <Link
              href="/creators"
              className={`text-xs font-bold font-mono px-3 py-1.5 rounded-xl border transition-colors ${
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-[#34D399]"
                  : "bg-emerald-50 border-emerald-500/20 hover:bg-emerald-100 text-[#0E7A4E]"
              }`}
            >
              All Creators ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border border-emerald-500/10 mb-5 text-center font-mono">
            <div className="p-2">
              <div className="text-xl font-black text-emerald-500">47</div>
              <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Confirmed</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black">31</div>
              <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Resolved</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black">24</div>
              <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Correct</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-black text-emerald-500">77%</div>
              <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Accuracy</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#030906] border-emerald-500/20" : "bg-emerald-50/60 border-emerald-500/15"
              }`}
            >
              <div className={`text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Top Alpha Category
              </div>
              <div className="text-sm font-bold text-emerald-500 mt-0.5">Layer 1 & Macro (84% win)</div>
            </div>
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#030906] border-rose-500/20" : "bg-rose-50/60 border-rose-500/15"
              }`}
            >
              <div className={`text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Weakest Category
              </div>
              <div className="text-sm font-bold text-rose-500 mt-0.5">Memecoins (42% win)</div>
            </div>
          </div>
        </div>

        <div
          id="activity"
          className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover-lift scroll-mt-24 ${
            isDark
              ? "bg-[#070D09]/90 border-white/10 shadow-lg text-white"
              : "bg-white/95 border-emerald-500/15 shadow-xs text-[#0B1F16]"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-500/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-base font-extrabold tracking-tight">Live On-Chain Activity</h3>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]" : "bg-emerald-50 border-emerald-500/20 text-[#0E7A4E]"
              }`}
            >
              Verifiable Dual-Testnet
            </span>
          </div>

          <div className="space-y-2.5">
            {activities.map((act) => (
              <div
                key={act.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all animate-feed-slide ${
                  isDark
                    ? "bg-[#030906]/60 border-white/5 hover:border-white/15"
                    : "bg-zinc-50/80 border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 shrink-0">{act.address}</span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase shrink-0 ${
                      act.action === "agreed"
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25"
                        : "bg-rose-500/15 text-rose-500 border border-rose-500/25"
                    }`}
                  >
                    {act.action}
                  </span>
                  <span className="text-xs font-semibold truncate">{act.claim}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                  <span className="font-bold">{act.amount}</span>
                  <span className={`text-[11px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{act.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
