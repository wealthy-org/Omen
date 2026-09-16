"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface AirdropBannerProps {
  theme?: "dark" | "light";
}

export default function AirdropBanner({ theme: propTheme }: AirdropBannerProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <section className="w-full my-12">
      <div
        className={`relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl text-center flex flex-col items-center transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-b from-[#0A120D] via-[#030906] to-[#08140E] border border-emerald-500/20"
            : "light-hero-gradient border border-emerald-900/10 shadow-[0_10px_40px_rgba(14,122,78,0.08)]"
        }`}
      >
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isDark ? "bg-emerald-500/15" : "bg-emerald-400/20"
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isDark ? "bg-emerald-600/15" : "bg-emerald-300/30"
          }`}
        />

        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold mb-6 border ${
            isDark
              ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]"
              : "bg-white/80 border-emerald-600/20 text-[#0E7A4E]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-ping ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"}`} />
          <span>Season 1 Airdrop Campaign Active</span>
        </div>

        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-2xl leading-tight mb-4 ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
        >
          Turn Your Predictions & Streaks into Verified Tokens.
        </h2>

        <p className={`text-base sm:text-lg max-w-xl mb-8 leading-relaxed ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
          Every quest completed, consecutive streak maintained, and prediction pool won directly boosts your rank on the global points leaderboard for the upcoming protocol token airdrop.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/quests"
            className={`w-full sm:w-auto px-8 py-3.5 rounded-[14px] text-[15px] font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              isDark
                ? "text-[#030906] bg-[#34D399] hover:bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]"
                : "bg-[#10221A] text-white hover:bg-[#183428]"
            }`}
          >
            <span>Start Farming Quests Now</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/leaderboard"
            className={`w-full sm:w-auto px-7 py-3.5 rounded-[14px] text-[15px] font-semibold backdrop-blur-md transition-all flex items-center justify-center ${
              isDark
                ? "text-white bg-white/5 hover:bg-white/10 border border-white/15"
                : "text-[#0B1F16] bg-white/80 hover:bg-white border border-emerald-900/15"
            }`}
          >
            <span>View Points Leaderboard</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
