"use client";

import React from "react";
import Link from "next/link";
import FeaturedBeliefHero from "./FeaturedBeliefHero";

import { HeroSectionProps } from "@/types";

export type { HeroSectionProps };

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden pt-4 sm:pt-8 pb-4 sm:pb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-5 w-fit border bg-white dark:bg-emerald-950/60 border-emerald-500/20 text-[#0E7A4E] dark:text-[#DCE5DF] shadow-xs dark:shadow-none">
            <span className="w-2 h-2 rounded-full animate-pulse bg-[#22C55E] dark:bg-[#34D399]" />
            <span>
              Dual-Testnet Active • <strong className="font-bold text-[#0B1F16] dark:text-white">Ethereum Sepolia & Robinhood</strong>
            </span>
          </div>

          <h1
            className="font-black tracking-tight leading-[1.02] mb-5 text-4xl sm:text-5xl lg:text-[56px] text-[#0B1F16] dark:text-white"
            style={{
              letterSpacing: "-0.03em",
            }}
          >
            Turn opinions into markets.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed font-normal mb-8 max-w-xl text-[#4B5D55] dark:text-[#A9B3AD]">
            AI turns public takes into AGREE / DISAGREE markets. The crowd takes a side with test ETH, an oracle settles it at the deadline, and the record tracks who was right.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
            <Link
              href="#markets"
              className="px-7 py-3.5 rounded-xl text-[15px] font-extrabold transition-all duration-200 active:scale-[0.98] hover-lift flex items-center justify-center gap-2 group text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_4px_24px_rgba(16,185,129,0.35)] dark:shadow-[0_4px_24px_rgba(52,211,153,0.35)] border border-emerald-500/20"
            >
              <span>Explore markets</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="#how-it-works"
              className="px-6 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 hover-lift flex items-center justify-center gap-2 border text-[#0B1F16] dark:text-white bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 border-zinc-200 dark:border-white/10 shadow-xs dark:shadow-none"
            >
              <span>How resolution works</span>
            </Link>
          </div>

          <div className="pt-6 border-t grid grid-cols-3 gap-2 sm:gap-4 font-mono border-zinc-200 dark:border-white/10">
            <div>
              <div className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate text-[#0B1F16] dark:text-white">
                1,284
              </div>
              <div className="text-[10px] sm:text-xs leading-tight text-[#4B5D55] dark:text-[#A9B3AD] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Beliefs detected
              </div>
            </div>
            <div>
              <div className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate text-[#0B1F16] dark:text-white">
                412
              </div>
              <div className="text-[10px] sm:text-xs leading-tight text-[#4B5D55] dark:text-[#A9B3AD] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Markets open
              </div>
            </div>
            <div>
              <div className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate text-[#0B1F16] dark:text-white">
                3,960 ETH
              </div>
              <div className="text-[10px] sm:text-xs leading-tight text-[#4B5D55] dark:text-[#A9B3AD] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Test ETH committed
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 w-full">
          <FeaturedBeliefHero />
        </div>
      </div>
    </section>
  );
}
