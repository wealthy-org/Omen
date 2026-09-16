"use client";

import { useTheme } from "../ThemeProvider";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({ theme: propTheme }: StatsOverviewProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <section className="w-full my-6 sm:my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          className={`lg:col-span-2 rounded-3xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
            isDark
              ? "bg-gradient-to-br from-[#0A0F0C] via-[#040D08] to-[#0A120E] border border-emerald-500/20 hover:border-emerald-400/40 shadow-xl"
              : "bg-gradient-to-br from-white via-white to-emerald-50/40 border border-emerald-500/15 hover:border-emerald-400/40 light-card-shine hover:shadow-[0_12px_40px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              isDark ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-emerald-400/15 group-hover:bg-emerald-400/25"
            }`}
          />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"} animate-pulse`}
                />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  Total Value Locked
                </span>
              </div>
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full border font-semibold ${
                  isDark
                    ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]"
                    : "bg-emerald-100 border-emerald-300 text-[#0E7A4E]"
                }`}
              >
                Onchain Pools
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-2">
              <div
                className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                148.50 ETH
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-yes-green/10 text-yes-green border border-yes-green/20 w-fit">
                +24.6% this week
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className={isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}>
              Arbitrum Sepolia Non-Custodial Smart Contract Escrow
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-yes-green">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Live Arbitrum Feed</span>
            </div>
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
            isDark
              ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30 shadow-md"
              : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_8px_30px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-xs font-mono font-medium uppercase tracking-wider ${
                  isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                }`}
              >
                Active Prediction Pools
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]"
                    : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
                }`}
              >
                Real-time Odds
              </span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              24 Markets
            </div>
            <p className={`text-xs mt-2 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Crypto & Tech binary markets
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">ETH</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">ARB</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">MACRO</span>
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
            isDark
              ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30 shadow-md"
              : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_8px_30px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-xs font-mono font-medium uppercase tracking-wider ${
                  isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                }`}
              >
                Points Distributed
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]"
                    : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
                }`}
              >
                Gamified Farming
              </span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
              }`}
            >
              1,420,000 PTS
            </div>
            <p className={`text-xs mt-2 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Season 1 Airdrop Pool
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs">
            <span className="text-xs font-mono font-bold text-[#34D399] bg-emerald-500/10 px-2 py-0.5 rounded">
              3.0x Max Multiplier
            </span>
          </div>
        </div>

        <div
          className={`lg:col-span-4 rounded-2xl px-6 py-4 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark
              ? "bg-[#060D09] border border-emerald-500/15"
              : "bg-emerald-50/50 border border-emerald-500/10 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500/40 bg-emerald-900 text-white flex items-center justify-center text-[10px] font-bold font-mono">0x1</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500/40 bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold font-mono">0x4</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500/40 bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold font-mono">0x9</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-extrabold font-mono ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                  4,120 Wallets
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yes-green/10 text-yes-green border border-yes-green/20 font-semibold">
                  Community Active
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Active Bettors & Quests • Arbitrum Sepolia verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className={isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}>
              Instant Non-Custodial Settlements
            </span>
            <span className="text-yes-green font-bold">100% Onchain</span>
          </div>
        </div>
      </div>
    </section>
  );
}
