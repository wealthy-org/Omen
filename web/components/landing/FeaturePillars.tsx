"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface FeaturePillarsProps {
  theme?: "dark" | "light";
}

export default function FeaturePillars({ theme: propTheme }: FeaturePillarsProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className={`text-xs font-mono font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
          Ecosystem Architecture
        </h2>
        <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
          Dual-Engine Web3 Platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        <div
          className={`lg:col-span-7 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
            isDark
              ? "bg-[#0A0F0C] border border-emerald-500/20 hover:border-emerald-400/40 shadow-xl"
              : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_12px_40px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div
            className={`absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
          />

          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <span
                className={`inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full border ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-500/20 text-[#DCE5DF]"
                    : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
                }`}
              >
                Pillar I • Prediction Market & Betting
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-yes-green/10 text-yes-green border border-yes-green/20 font-bold">
                Solidity Verified
              </span>
            </div>

            <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Decentralized Binary Betting on Arbitrum Sepolia
            </h3>

            <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Place binary predictions (YES / NO) on crypto assets, network milestones, and real-world tech events. Smart contracts securely escrow funds and calculate implied odds transparently with instant automated payouts.
            </p>

            <div
              className={`rounded-2xl p-4 sm:p-5 mb-6 border transition-all ${
                isDark ? "bg-[#040D08] border-emerald-500/20" : "bg-emerald-50/40 border-emerald-500/15 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className={isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}>Simulated Live Market</span>
                <span className="font-bold text-yes-green">Arbitrum Sepolia L2</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                <span className="text-yes-green">YES 68% (1.47x)</span>
                <span className="text-no-red">NO 32% (3.12x)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-emerald-950/30 overflow-hidden flex">
                <div className="h-full bg-yes-green" style={{ width: "68%" }} />
                <div className="h-full bg-no-red" style={{ width: "32%" }} />
              </div>
            </div>

            <ul className="space-y-2.5 mb-8 text-sm">
              <li className={`flex items-center gap-2.5 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>100% Non-custodial Solidity smart contract execution</span>
              </li>
              <li className={`flex items-center gap-2.5 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Transparent proportional pool odds and instant payout claims</span>
              </li>
              <li className={`flex items-center gap-2.5 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Low gas fees powered by Arbitrum Sepolia Layer-2</span>
              </li>
            </ul>
          </div>

          <div className={`pt-6 border-t ${isDark ? "border-white/10" : "border-emerald-500/10"}`}>
            <Link
              href="/predictions"
              className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              <span>Explore Prediction Markets</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div
          className={`lg:col-span-5 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
            isDark
              ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30 shadow-lg"
              : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_12px_40px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div
            className={`absolute -bottom-16 -right-16 w-56 h-56 bg-gradient-to-tl from-[#34D399]/15 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
          />

          <div>
            <span
              className={`inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full border mb-6 ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-500/20 text-[#DCE5DF]"
                  : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
              }`}
            >
              Pillar II • Gamification, Quest & Airdrop
            </span>

            <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Gamified Daily Quests & Airdrop Points Engine
            </h3>

            <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Earn reward points daily without paying gas fees. Build consecutive check-in streaks to unlock point multipliers, complete on-chain betting challenges, and qualify for future protocol token airdrop allocations.
            </p>

            <div className="space-y-2.5 mb-6">
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono border ${
                  isDark ? "bg-white/5 border-white/5" : "bg-emerald-50/40 border-emerald-500/10"
                }`}
              >
                <span>Day 1-2 Streak</span>
                <span className="font-bold text-emerald-500">1.0x Base</span>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono border ${
                  isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-100/50 border-emerald-300/30"
                }`}
              >
                <span>Day 3-5 Milestone</span>
                <span className="font-bold text-[#34D399]">1.5x Multiplier 🔥</span>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono border ${
                  isDark ? "bg-emerald-500/20 border-emerald-400/30 text-white" : "bg-emerald-200/60 border-emerald-400/40 text-emerald-950"
                }`}
              >
                <span>Day 7 Champion Streak</span>
                <span className="font-black text-yes-green">3.0x Max Multiplier ⚡</span>
              </div>
            </div>

            <ul className="space-y-2 mb-8 text-xs">
              <li className={`flex items-center gap-2 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Daily check-in streak multipliers (1.0x up to 3.0x bonus)</span>
              </li>
              <li className={`flex items-center gap-2 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Gasless instant quest verification via Supabase backend</span>
              </li>
              <li className={`flex items-center gap-2 ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Transparent Season 1 points leaderboard tier rankings</span>
              </li>
            </ul>
          </div>

          <div className={`pt-6 border-t ${isDark ? "border-white/10" : "border-emerald-500/10"}`}>
            <Link
              href="/quests"
              className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              <span>Start Quest Farming</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
