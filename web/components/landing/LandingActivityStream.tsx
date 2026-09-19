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

export interface CreatorSpotlight {
  id: string;
  name: string;
  handle: string;
  address: string;
  avatarInitials: string;
  gradient: string;
  since: string;
  confirmed: number;
  resolved: number;
  correct: number;
  accuracyRate: number;
  volumeEth: number;
  topCategory: { name: string; winRate: number };
  weakestCategory: { name: string; winRate: number };
}

const CREATOR_SPOTLIGHTS: CreatorSpotlight[] = [
  {
    id: "traderx",
    name: "TraderX",
    handle: "@TraderX",
    address: "0x89f4...3a1c",
    avatarInitials: "TX",
    gradient: "from-emerald-600 to-teal-500",
    since: "March 2026",
    confirmed: 47,
    resolved: 31,
    correct: 24,
    accuracyRate: 77,
    volumeEth: 84.5,
    topCategory: { name: "Layer 1 & Macro", winRate: 84 },
    weakestCategory: { name: "Memecoins", winRate: 42 },
  },
  {
    id: "alphamacro",
    name: "Alpha Macro",
    handle: "@AlphaMacro",
    address: "0x3bc1...90fe",
    avatarInitials: "AM",
    gradient: "from-blue-600 to-indigo-500",
    since: "January 2026",
    confirmed: 58,
    resolved: 42,
    correct: 35,
    accuracyRate: 83,
    volumeEth: 126.2,
    topCategory: { name: "Fed & Macro Rates", winRate: 89 },
    weakestCategory: { name: "NFT Floor", winRate: 50 },
  },
  {
    id: "onchainwitch",
    name: "Onchain Witch",
    handle: "@onchainwitch",
    address: "0x12dc...44b2",
    avatarInitials: "OW",
    gradient: "from-purple-600 to-pink-500",
    since: "November 2025",
    confirmed: 64,
    resolved: 50,
    correct: 46,
    accuracyRate: 92,
    volumeEth: 154.0,
    topCategory: { name: "DeFi & Yields", winRate: 94 },
    weakestCategory: { name: "Gaming Tokens", winRate: 60 },
  },
  {
    id: "defiwizard",
    name: "DeFi Wizard",
    handle: "@DeFiWizard",
    address: "0x67ab...19dd",
    avatarInitials: "DW",
    gradient: "from-amber-600 to-orange-500",
    since: "February 2026",
    confirmed: 39,
    resolved: 29,
    correct: 23,
    accuracyRate: 79,
    volumeEth: 62.8,
    topCategory: { name: "Arbitrum & DEXs", winRate: 86 },
    weakestCategory: { name: "AI Sectors", winRate: 55 },
  },
];

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

  const [creatorIndex, setCreatorIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCreatorIndex((prev) => (prev + 1) % CREATOR_SPOTLIGHTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

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

  const handlePrevCreator = () => {
    setCreatorIndex((prev) => (prev === 0 ? CREATOR_SPOTLIGHTS.length - 1 : prev - 1));
  };

  const handleNextCreator = () => {
    setCreatorIndex((prev) => (prev + 1) % CREATOR_SPOTLIGHTS.length);
  };

  const currentCreator = CREATOR_SPOTLIGHTS[creatorIndex];

  return (
    <section id="creators" className="w-full my-8 sm:my-12 scroll-mt-28 relative">
      <div id="activity" className="absolute -top-28 pointer-events-none" />
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
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between hover-lift shadow-xl ${
            isDark
              ? "bg-[#070D09]/95 border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-white"
              : "bg-white/95 border-emerald-500/15 shadow-[0_12px_32px_rgba(14,122,78,0.06)] text-[#0B1F16]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Top Thinkers ({creatorIndex + 1}/{CREATOR_SPOTLIGHTS.length})
                </span>
                {isPaused && (
                  <span className="text-[11px] font-mono text-[#A9B3AD] animate-pulse">
                    [Paused]
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCreator}
                  aria-label="Previous Creator"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/15 text-white"
                      : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextCreator}
                  aria-label="Next Creator"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/15 text-white"
                      : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-800"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <Link
                  href="/creators"
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/10 text-[#34D399]"
                      : "bg-emerald-50 border-emerald-500/20 hover:bg-emerald-100 text-[#0E7A4E]"
                  }`}
                >
                  All Creators ↗
                </Link>
              </div>
            </div>

            <div key={currentCreator.id} className="animate-scale-in">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-13 h-13 rounded-full bg-gradient-to-br ${currentCreator.gradient} text-white font-black text-base flex items-center justify-center border-2 border-white/20 shadow-md`}
                  >
                    {currentCreator.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold tracking-tight">{currentCreator.name}</h3>
                      <span className="text-xs font-mono font-bold text-zinc-400">{currentCreator.handle}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    </div>
                    <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                      Tracking convictions since {currentCreator.since}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 inline-block shadow-xs">
                    {currentCreator.accuracyRate}% Accuracy
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-emerald-500/15 mb-5 text-center font-mono bg-black/20">
                <div className="p-1.5">
                  <div className="text-xl font-black text-emerald-500">{currentCreator.confirmed}</div>
                  <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Confirmed</div>
                </div>
                <div className="p-1.5">
                  <div className="text-xl font-black">{currentCreator.resolved}</div>
                  <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Resolved</div>
                </div>
                <div className="p-1.5">
                  <div className="text-xl font-black">{currentCreator.correct}</div>
                  <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Correct</div>
                </div>
                <div className="p-1.5">
                  <div className="text-xl font-black text-emerald-400">{currentCreator.volumeEth} ETH</div>
                  <div className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>Volume</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-[#030906] border-emerald-500/20" : "bg-emerald-50/60 border-emerald-500/15"
                  }`}
                >
                  <div className={`text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                    Top Alpha Category
                  </div>
                  <div className="text-sm font-bold text-emerald-500 mt-0.5">
                    {currentCreator.topCategory.name} ({currentCreator.topCategory.winRate}% win)
                  </div>
                </div>
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? "bg-[#030906] border-rose-500/20" : "bg-rose-50/60 border-rose-500/15"
                  }`}
                >
                  <div className={`text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                    Weakest Category
                  </div>
                  <div className="text-sm font-bold text-rose-500 mt-0.5">
                    {currentCreator.weakestCategory.name} ({currentCreator.weakestCategory.winRate}% win)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-emerald-500/10">
            <div className="flex items-center gap-1.5">
              {CREATOR_SPOTLIGHTS.map((creator, idx) => (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => setCreatorIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    creatorIndex === idx
                      ? "w-7 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "w-2 bg-zinc-600/40 hover:bg-zinc-500/60"
                  }`}
                  aria-label={`Go to creator ${creator.name}`}
                />
              ))}
            </div>

            <Link
              href={`/creator/${currentCreator.address}`}
              className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>View Profile</span>
              <span>↗</span>
            </Link>
          </div>
        </div>

        <div
          className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover-lift ${
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
