"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

import { SignalCase, CreatorSpotlight, SignalGapVisualizerProps } from "@/types";

export type { SignalCase, CreatorSpotlight, SignalGapVisualizerProps };

const SIGNAL_CASES: SignalCase[] = [
  {
    id: "sol-eth",
    category: "Layer 1 & DeFi",
    statement: "SOL will structurally outpace ETH in monthly active addresses and DEX velocity",
    author: "TraderX",
    authorHandle: "@TraderX",
    authorAvatar: "TX",
    peopleAgreePct: 78,
    peopleDisagreePct: 22,
    peopleTotal: 3140,
    moneyAgreePct: 42,
    moneyDisagreePct: 58,
    moneyTotalEth: 43.8,
    gapPct: 36,
    gapType: "overhyped",
    gapBadge: "+36% Retail Hype Divergence",
    analysisText: "Crowd conviction is overwhelmingly bullish on social media, but smart whale capital is heavily hedging the Disagree side. This creates an asymmetric 2.38x payout opportunity for contrarian traders.",
  },
  {
    id: "fed-rates",
    category: "Macroeconomics",
    statement: "Federal Reserve delivers 50bps emergency rate cut before Q4 closes",
    author: "Alpha Macro",
    authorHandle: "@AlphaMacro",
    authorAvatar: "AM",
    peopleAgreePct: 34,
    peopleDisagreePct: 66,
    peopleTotal: 2410,
    moneyAgreePct: 71,
    moneyDisagreePct: 29,
    moneyTotalEth: 64.5,
    gapPct: 37,
    gapType: "smart-money",
    gapBadge: "+37% Smart Money Accumulation",
    analysisText: "Social commentators remain skeptical of rapid cuts, yet institutional capital is actively buying Agree contracts at discounted odds ahead of macroeconomic bond yield shifts.",
  },
  {
    id: "btc-ath",
    category: "Crypto & BTC",
    statement: "Bitcoin breaks all-time high beyond $120,000 before year-end",
    author: "Onchain Witch",
    authorHandle: "@onchainwitch",
    authorAvatar: "OW",
    peopleAgreePct: 64,
    peopleDisagreePct: 36,
    peopleTotal: 4875,
    moneyAgreePct: 66,
    moneyDisagreePct: 34,
    moneyTotalEth: 133.6,
    gapPct: 2,
    gapType: "aligned",
    gapBadge: "Balanced Consensus Equilibrium",
    analysisText: "Retail sentiment and institutional capital staking are in almost complete parity. Market odds reflect stable pricing with minimal distortion between words and capital.",
  },
];

const CREATOR_SPOTLIGHTS: CreatorSpotlight[] = [
  {
    id: "traderx",
    name: "TraderX",
    handle: "@TraderX",
    address: "0x1111111111111111111111111111111111111111",
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
    address: "0x8888888888888888888888888888888888888888",
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
    address: "0x3333333333333333333333333333333333333333",
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
    address: "0x5555555555555555555555555555555555555555",
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

export default function SignalGapVisualizer({}: SignalGapVisualizerProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("sol-eth");
  const [creatorIndex, setCreatorIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCreatorIndex((prev) => (prev + 1) % CREATOR_SPOTLIGHTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrevCreator = () => {
    setCreatorIndex((prev) => (prev === 0 ? CREATOR_SPOTLIGHTS.length - 1 : prev - 1));
  };

  const handleNextCreator = () => {
    setCreatorIndex((prev) => (prev + 1) % CREATOR_SPOTLIGHTS.length);
  };

  const currentCase = SIGNAL_CASES.find((c) => c.id === selectedCaseId) || SIGNAL_CASES[0];
  const currentCreator = CREATOR_SPOTLIGHTS[creatorIndex];

  return (
    <section id="signal-gap" className="w-full my-8 sm:my-14 scroll-mt-28 relative">
      <div id="creators" className="absolute -top-28 pointer-events-none" />

      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0E7A4E] dark:text-[#34D399]">
            Dual-Track Consensus Engine & Reputation Ledger
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
          The Signal Gap: Words vs. Capital & Top Thinkers Record
        </h2>
        <p className="text-sm sm:text-base mt-1.5 max-w-3xl text-[#4B5D55] dark:text-[#A9B3AD]">
          Social sentiment reveals what the crowd says. Staked capital reveals what people truly believe. Compare the divergence in the Signal Gap and track the top thinkers whose convictions turn into immutable on-chain records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="h-10 flex items-center gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none shrink-0">
            {SIGNAL_CASES.map((item) => {
              const isActive = item.id === selectedCaseId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-emerald-600 dark:bg-emerald-500/20 text-white dark:text-emerald-400 border-emerald-600 dark:border-emerald-500/40 shadow-sm"
                      : "bg-white dark:bg-[#070D09]/80 border-zinc-200 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD] hover:text-[#0B1F16] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 shadow-xs"
                  }`}
                >
                  <span>{item.category}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? "bg-emerald-700 dark:bg-emerald-500/30 text-white dark:text-emerald-300"
                        : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.gapPct}% Gap
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-7 rounded-3xl border transition-all duration-300 hover-lift shadow-xl flex-1 flex flex-col justify-between bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-emerald-500/20 shadow-[0_12px_32px_rgba(14,122,78,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-[#0B1F16] dark:text-white">
            <div key={currentCase.id} className="animate-scale-in flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <img
                        src={`https://unavatar.io/twitter/${currentCase.authorHandle.replace('@', '')}`}
                        alt={currentCase.author}
                        className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-xs relative z-10"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-xs absolute inset-0 z-0">
                        {currentCase.authorAvatar}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{currentCase.author}</span>
                        <span className="text-xs font-mono text-zinc-400">{currentCase.authorHandle}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          ✓ Verified
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold mt-1 tracking-tight">
                        &ldquo;{currentCase.statement}&rdquo;
                      </h3>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-auto">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border inline-flex items-center gap-1.5 shadow-xs ${
                        currentCase.gapType === "overhyped"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                          : currentCase.gapType === "smart-money"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      {currentCase.gapBadge}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-5">
                  <div className="p-4 rounded-2xl border bg-zinc-50 dark:bg-[#030906]/80 border-zinc-200/80 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                        Track 1: Social Sentiments ({currentCase.peopleTotal.toLocaleString()} votes)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-500">
                        {currentCase.peopleAgreePct}% Agree
                      </span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex p-0.5 border border-white/10">
                      <div
                        style={{ width: `${currentCase.peopleAgreePct}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
                      />
                      <div
                        style={{ width: `${currentCase.peopleDisagreePct}%` }}
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border bg-zinc-50 dark:bg-[#030906]/80 border-zinc-200/80 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Track 2: Staked Capital Pool ({currentCase.moneyTotalEth} ETH Staked)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {currentCase.moneyAgreePct}% Agree
                      </span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex p-0.5 border border-white/10">
                      <div
                        style={{ width: `${currentCase.moneyAgreePct}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
                      />
                      <div
                        style={{ width: `${currentCase.moneyDisagreePct}%` }}
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-500/25 text-[#0B1F16] dark:text-[#DCE5DF]">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Zap className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 block">
                      Alpha Divergence
                    </span>
                    <p className="text-xs mt-0.5 leading-relaxed font-sans">{currentCase.analysisText}</p>
                  </div>
                </div>

                <Link
                  href="#markets"
                  className="shrink-0 text-xs font-bold font-mono px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
                >
                  Trade Gap ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="h-10 flex items-center justify-between gap-2 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
                Conviction Becomes a Record
              </h3>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevCreator}
                aria-label="Previous Creator"
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white shadow-2xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextCreator}
                aria-label="Next Creator"
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white shadow-2xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <Link
                href="/creators"
                className="text-xs sm:text-sm font-bold font-mono px-3.5 sm:px-4 py-1.5 rounded-xl border transition-all duration-200 bg-emerald-50 dark:bg-white/5 border-emerald-500/25 dark:border-white/10 hover:bg-emerald-100 dark:hover:bg-white/15 text-[#0E7A4E] dark:text-[#34D399] hover:border-emerald-500/40 dark:hover:border-white/20 shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <span>See All</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">↗</span>
              </Link>
            </div>
          </div>

          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="p-6 sm:p-7 rounded-3xl border transition-all duration-300 hover-lift shadow-xl flex-1 flex flex-col justify-between bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-emerald-500/20 shadow-[0_12px_32px_rgba(14,122,78,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-[#0B1F16] dark:text-white"
          >
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-emerald-500/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Top Thinkers ({creatorIndex + 1}/{CREATOR_SPOTLIGHTS.length})
                  </span>
                  {isPaused && (
                    <span className="text-[11px] font-mono text-[#A9B3AD] animate-pulse">
                      [Paused]
                    </span>
                  )}
                </div>

                <div key={currentCreator.id} className="animate-scale-in">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0">
                        <img
                          src={`https://unavatar.io/twitter/${currentCreator.handle.replace('@', '')}`}
                          alt={currentCreator.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-md relative z-10"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentCreator.gradient} text-white font-black text-sm flex items-center justify-center border-2 border-white/20 shadow-md absolute inset-0 z-0`}
                        >
                          {currentCreator.avatarInitials}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-extrabold tracking-tight">{currentCreator.name}</h4>
                          <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">{currentCreator.handle}</span>
                          <a
                            href={`https://x.com/${currentCreator.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/15 transition-all shadow-xs"
                            title={`View ${currentCreator.handle} on X`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="text-[10px] font-mono">X ↗</span>
                          </a>
                        </div>
                        <p className="text-[11px] font-mono mt-0.5 text-[#4B5D55] dark:text-[#A9B3AD]">
                          Conviction tracked since {currentCreator.since}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-block shadow-xs">
                        {currentCreator.accuracyRate}% Win
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 p-3 rounded-xl border border-emerald-500/15 dark:border-white/10 mb-4 text-center font-mono bg-emerald-50/70 dark:bg-black/20 text-xs">
                    <div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{currentCreator.confirmed}</div>
                      <div className="text-[10px] text-[#4B5D55] dark:text-[#A9B3AD]">Confirmed</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-[#0B1F16] dark:text-white">{currentCreator.resolved}</div>
                      <div className="text-[10px] text-[#4B5D55] dark:text-[#A9B3AD]">Resolved</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-[#0B1F16] dark:text-white">{currentCreator.correct}</div>
                      <div className="text-[10px] text-[#4B5D55] dark:text-[#A9B3AD]">Correct</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{currentCreator.volumeEth}</div>
                      <div className="text-[10px] text-[#4B5D55] dark:text-[#A9B3AD]">ETH Vol</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    <div className="p-3 rounded-xl border bg-emerald-50/60 dark:bg-[#030906] border-emerald-500/15 dark:border-emerald-500/20">
                      <div className="text-[11px] font-mono text-[#4B5D55] dark:text-[#A9B3AD]">
                        Top Alpha
                      </div>
                      <div className="text-xs font-bold text-emerald-500 mt-0.5 truncate">
                        {currentCreator.topCategory.name} ({currentCreator.topCategory.winRate}%)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border bg-rose-50/60 dark:bg-[#030906] border-rose-500/15 dark:border-rose-500/20">
                      <div className="text-[11px] font-mono text-[#4B5D55] dark:text-[#A9B3AD]">
                        Weakest
                      </div>
                      <div className="text-xs font-bold text-rose-500 mt-0.5 truncate">
                        {currentCreator.weakestCategory.name} ({currentCreator.weakestCategory.winRate}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-emerald-500/10 mt-auto">
                <div className="flex items-center gap-1.5">
                  {CREATOR_SPOTLIGHTS.map((creator, idx) => (
                    <button
                      key={creator.id}
                      type="button"
                      onClick={() => setCreatorIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        creatorIndex === idx
                          ? "w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
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
          </div>
        </div>
      </div>
    </section>
  );
}
