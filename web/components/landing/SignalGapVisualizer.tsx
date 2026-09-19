"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface SignalCase {
  id: string;
  category: string;
  statement: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  peopleAgreePct: number;
  peopleDisagreePct: number;
  peopleTotal: number;
  moneyAgreePct: number;
  moneyDisagreePct: number;
  moneyTotalEth: number;
  gapPct: number;
  gapType: "overhyped" | "smart-money" | "aligned";
  gapBadge: string;
  analysisText: string;
}

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

export interface SignalGapVisualizerProps {
  theme?: "dark" | "light";
}

export default function SignalGapVisualizer({ theme: propTheme }: SignalGapVisualizerProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const [selectedCaseId, setSelectedCaseId] = useState<string>("sol-eth");

  const currentCase = SIGNAL_CASES.find((c) => c.id === selectedCaseId) || SIGNAL_CASES[0];

  return (
    <section id="signal-gap" className="w-full my-8 sm:my-12 scroll-mt-28">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
            }`}
          >
            Dual-Track Consensus Engine
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
        >
          The Signal Gap: Words vs. Capital
        </h2>
        <p
          className={`text-sm sm:text-base mt-1.5 max-w-2xl ${
            isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
          }`}
        >
          Social sentiment reveals what the crowd says. Staked capital reveals what people truly believe. The divergence between them is where market alpha lives.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {SIGNAL_CASES.map((item) => {
          const isActive = item.id === selectedCaseId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCaseId(item.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                    : "bg-emerald-600 text-white shadow-sm"
                  : isDark
                    ? "bg-[#070D09]/80 border border-white/10 text-[#A9B3AD] hover:text-white hover:bg-white/5"
                    : "bg-white border border-zinc-200 text-[#4B5D55] hover:text-[#0B1F16] hover:bg-zinc-50"
              }`}
            >
              <span>{item.category}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? isDark
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-emerald-700 text-white"
                    : isDark
                      ? "bg-white/5 text-zinc-400"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {item.gapPct}% Gap
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 hover-lift shadow-xl ${
          isDark
            ? "bg-[#070D09]/95 border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-white"
            : "bg-white/95 border-emerald-500/15 shadow-[0_12px_32px_rgba(14,122,78,0.06)] text-[#0B1F16]"
        }`}
      >
        <div key={currentCase.id} className="animate-scale-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-emerald-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                {currentCase.authorAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{currentCase.author}</span>
                  <span className="text-xs font-mono text-zinc-400">{currentCase.authorHandle}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    ✓ Verified Author
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold mt-1 tracking-tight">
                  &ldquo;{currentCase.statement}&rdquo;
                </h3>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs ${
                  currentCase.gapType === "overhyped"
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                    : currentCase.gapType === "smart-money"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                {currentCase.gapBadge}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-8">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? "bg-[#030906]/80 border-white/10" : "bg-zinc-50 border-zinc-200/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                    Track 1: Social Sentiments
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-zinc-400">
                  {currentCase.peopleTotal.toLocaleString()} votes
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                <span className="text-emerald-500">Agree {currentCase.peopleAgreePct}%</span>
                <span className="text-rose-500">Disagree {currentCase.peopleDisagreePct}%</span>
              </div>

              <div className="h-4 w-full rounded-full bg-zinc-800 overflow-hidden flex p-0.5 border border-white/10">
                <div
                  style={{ width: `${currentCase.peopleAgreePct}%` }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
                />
                <div
                  style={{ width: `${currentCase.peopleDisagreePct}%` }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500"
                />
              </div>
              <p className={`text-[11px] font-mono mt-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Unweighted community opinions extracted across social channels and poll engagements.
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                isDark ? "bg-[#030906]/80 border-white/10" : "bg-zinc-50 border-zinc-200/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Track 2: Staked Capital Pool
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currentCase.moneyTotalEth} ETH Staked
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                <span className="text-emerald-500">Agree {currentCase.moneyAgreePct}%</span>
                <span className="text-rose-500">Disagree {currentCase.moneyDisagreePct}%</span>
              </div>

              <div className="h-4 w-full rounded-full bg-zinc-800 overflow-hidden flex p-0.5 border border-white/10">
                <div
                  style={{ width: `${currentCase.moneyAgreePct}%` }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
                />
                <div
                  style={{ width: `${currentCase.moneyDisagreePct}%` }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500"
                />
              </div>
              <p className={`text-[11px] font-mono mt-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Actual ETH locked in non-custodial smart contracts on Sepolia & Robinhood Chain.
              </p>
            </div>
          </div>

          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-emerald-950/20 border-emerald-500/25 text-[#DCE5DF]"
                : "bg-emerald-50/80 border-emerald-500/20 text-[#0B1F16]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30 font-bold">
                ⚡
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 block">
                  Consensus Alpha Insight
                </span>
                <p className="text-xs sm:text-sm mt-0.5 leading-relaxed font-sans">{currentCase.analysisText}</p>
              </div>
            </div>

            <Link
              href="/#markets"
              className="shrink-0 text-xs font-bold font-mono px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              Explore Markets ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
