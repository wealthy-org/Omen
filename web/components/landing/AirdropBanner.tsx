"use client";

import Link from "next/link";

import { AirdropBannerProps } from "@/types";

export type { AirdropBannerProps };

export default function AirdropBanner({}: AirdropBannerProps) {
  return (
    <section className="w-full my-8 sm:my-12">
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl text-center flex flex-col items-center transition-all duration-300 light-hero-gradient dark:bg-gradient-to-b dark:from-[#0A120D] dark:via-[#030906] dark:to-[#08140E] border border-white/90 dark:border-emerald-500/20 light-card-shine shadow-[0_12px_48px_rgba(14,122,78,0.08),_inset_0_1px_0_#ffffff] dark:shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none light-emerald-seam dark:dark-emerald-seam" />

        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-emerald-400/20 dark:bg-emerald-500/15" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-emerald-300/30 dark:bg-emerald-600/15" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold mb-6 border bg-white/90 dark:bg-emerald-950/60 border-emerald-500/15 dark:border-emerald-500/20 text-[#0E7A4E] dark:text-[#34D399] shadow-xs dark:shadow-none">
          <span className="w-2 h-2 rounded-full animate-ping bg-[#22C55E] dark:bg-[#34D399]" />
          <span>Season 1 Airdrop Campaign Active</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-2xl leading-tight mb-4 text-[#0B1F16] dark:text-white">
          Turn Your Predictions & Streaks into Verified Tokens.
        </h2>

        <p className="text-base sm:text-lg max-w-xl mb-8 leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">
          Every quest completed, consecutive streak maintained, and prediction pool won directly boosts your rank on the global points leaderboard for the upcoming protocol token airdrop.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/quests"
            className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] text-[15px] font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-[#10221A] dark:bg-[#34D399] text-white dark:text-[#030906] hover:bg-[#183428] dark:hover:bg-emerald-400 shadow-sm dark:shadow-[0_0_30px_rgba(52,211,153,0.4)]"
          >
            <span>Start Farming Quests Now</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/leaderboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-[14px] text-[15px] font-semibold backdrop-blur-md transition-all flex items-center justify-center text-[#0B1F16] dark:text-white bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-emerald-500/15 dark:border-white/15 shadow-xs dark:shadow-none"
          >
            <span>View Points Leaderboard</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
