"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";

import { FeaturePillarsProps } from "@/types";

export type { FeaturePillarsProps };

export default function FeaturePillars({}: FeaturePillarsProps) {
  const [betAmount, setBetAmount] = useState<string>("0.1");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES");

  const numAmount = parseFloat(betAmount) || 0;
  const estimatedReturn = selectedSide === "YES" ? (numAmount * 1.47).toFixed(3) : (numAmount * 3.12).toFixed(3);

  return (
    <section className="w-full my-8 sm:my-16 space-y-12 sm:space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest mb-2 text-[#0E7A4E] dark:text-[#34D399]">
          Ecosystem Architecture
        </h2>
        <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
          Dual-Engine Web3 Platform
        </p>
      </div>

      <div className="rounded-3xl border p-6 sm:p-10 transition-all duration-300 overflow-hidden relative bg-white/95 dark:bg-[#070D09]/90 border-emerald-500/15 dark:border-emerald-500/20 light-card-shine shadow-[0_12px_40px_rgba(14,122,78,0.06),_inset_0_1px_0_#ffffff] dark:shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full border bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-500/20 dark:border-emerald-500/30 text-[#0E7A4E] dark:text-[#DCE5DF]">
                Pillar I • Prediction Market & Betting
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-yes-green/10 text-yes-green border border-yes-green/20 font-bold">
                Solidity Verified
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-[#0B1F16] dark:text-white">
              Decentralized Binary Betting on Arbitrum Sepolia
            </h3>

            <p className="text-sm sm:text-base leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">
              Place binary predictions (YES / NO) on crypto assets, network milestones, and real-world tech events. Smart contracts securely escrow funds and calculate implied odds transparently with instant automated payouts.
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>100% Non-custodial Solidity smart contract execution</span>
              </li>
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>Transparent proportional pool odds and instant payout claims</span>
              </li>
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>Low gas fees powered by Arbitrum Sepolia Layer-2</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/predictions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98] bg-[#10221A] dark:bg-[#34D399] text-white dark:text-[#030906] hover:bg-[#183428] dark:hover:bg-emerald-400 dark:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                <span>Explore Prediction Markets</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border p-5 sm:p-6 transition-all bg-emerald-50/40 dark:bg-[#030704] border-emerald-500/20 dark:border-emerald-500/30 shadow-md dark:shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yes-green animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-[#0B1F16] dark:text-white">
                    Trading Slip Simulator
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">Arbitrum Sepolia L2</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono mb-1.5 text-[#4B5D55] dark:text-[#A9B3AD]">
                    Select Prediction Outcome
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSide("YES")}
                      className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        selectedSide === "YES"
                          ? "bg-yes-green text-slate-950 border-yes-green shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                          : "bg-white dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-[#0B1F16] dark:text-white hover:bg-white/10"
                      }`}
                    >
                      YES (1.47x)
                    </button>
                    <button
                      onClick={() => setSelectedSide("NO")}
                      className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        selectedSide === "NO"
                          ? "bg-no-red text-white border-no-red shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                          : "bg-white dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-[#0B1F16] dark:text-white hover:bg-white/10"
                      }`}
                    >
                      NO (3.12x)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1.5 text-[#4B5D55] dark:text-[#A9B3AD]">
                    Stake Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl font-mono text-sm border font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-black/40 border-emerald-500/20 dark:border-emerald-500/30 text-[#0B1F16] dark:text-white"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                      {["0.05", "0.1", "0.5"].map((val) => (
                        <button
                          key={val}
                          onClick={() => setBetAmount(val)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-emerald-100 dark:bg-white/5 border-emerald-200 dark:border-white/10 text-[#0E7A4E] dark:text-[#A9B3AD]"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border font-mono text-xs space-y-2 bg-white dark:bg-emerald-500/5 border-emerald-500/15 dark:border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B5D55] dark:text-[#A9B3AD]">Estimated Payout:</span>
                    <span className="font-bold text-base text-yes-green">{estimatedReturn} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#4B5D55] dark:text-[#A9B3AD]">Smart Contract Escrow:</span>
                    <span className="text-emerald-500 font-semibold">100% Non-Custodial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border p-6 sm:p-10 transition-all duration-300 overflow-hidden relative bg-white/95 dark:bg-[#070D09]/90 border-emerald-500/15 dark:border-emerald-500/20 light-card-shine shadow-[0_12px_40px_rgba(14,122,78,0.06),_inset_0_1px_0_#ffffff] dark:shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border p-5 sm:p-6 transition-all bg-emerald-50/40 dark:bg-[#030704] border-emerald-500/20 dark:border-emerald-500/30 shadow-md dark:shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 mb-4">
                <span className="text-xs font-mono font-bold uppercase text-[#0B1F16] dark:text-white">
                  Streak Multiplier Vault
                </span>
                <span className="text-[11px] font-mono text-yes-green font-bold">Season 1 Active</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border bg-white dark:bg-white/5 border-emerald-500/10 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span>Day 1-2 Streak</span>
                  </div>
                  <span className="font-bold text-emerald-500">1.0x Base</span>
                </div>

                <div className="p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border bg-emerald-100/70 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    <span>Day 3-5 Milestone</span>
                  </div>
                  <span className="font-bold text-[#34D399] flex items-center gap-1">
                    <span>1.5x Multiplier</span>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border bg-emerald-200/80 dark:bg-emerald-500/25 border-emerald-400 dark:border-emerald-400/50 text-emerald-950 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yes-green animate-ping" />
                    <span className="font-bold">Day 7 Champion Streak</span>
                  </div>
                  <span className="font-black text-yes-green flex items-center gap-1">
                    <span>3.0x Max Multiplier</span>
                    <Zap className="w-3.5 h-3.5 text-yes-green" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <span className="inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full border bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-500/20 dark:border-emerald-500/30 text-[#0E7A4E] dark:text-[#DCE5DF]">
                Pillar II • Gamification, Quest & Airdrop
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-[#0B1F16] dark:text-white">
              Gamified Daily Quests & Airdrop Points Engine
            </h3>

            <p className="text-sm sm:text-base leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">
              Earn reward points daily without paying gas fees. Build consecutive check-in streaks to unlock point multipliers, complete on-chain betting challenges, and qualify for future protocol token airdrop allocations.
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>Daily check-in streak multipliers (1.0x up to 3.0x bonus)</span>
              </li>
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>Gasless instant quest verification via Supabase backend</span>
              </li>
              <li className="flex items-start gap-3 text-[#17241D] dark:text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#34D399] mt-1.5 shrink-0" />
                <span>Transparent Season 1 points leaderboard tier rankings</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/quests"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98] bg-[#10221A] dark:bg-[#34D399] text-white dark:text-[#030906] hover:bg-[#183428] dark:hover:bg-emerald-400 dark:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                <span>Start Quest Farming</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
