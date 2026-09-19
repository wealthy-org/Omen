"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";
import FeaturedBeliefHero from "./FeaturedBeliefHero";

export interface HeroSectionProps {
  theme?: "dark" | "light";
}

export default function HeroSection({ theme: propTheme }: HeroSectionProps) {
  const contextTheme = useTheme();
  const activeTheme = propTheme || contextTheme.theme || "dark";
  const isDark = activeTheme === "dark";

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden pt-4 sm:pt-8 pb-4 sm:pb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col text-left">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-5 w-fit border ${
              isDark
                ? "bg-emerald-950/60 border-emerald-500/20 text-[#DCE5DF]"
                : "bg-white border-emerald-500/20 text-[#0E7A4E] shadow-xs"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"}`} />
            <span>
              Dual-Testnet Active • <strong className={`font-bold ${isDark ? "text-white" : "text-[#0B1F16]"}`}>Ethereum Sepolia & Robinhood</strong>
            </span>
          </div>

          <h1
            className={`font-black tracking-tight leading-[1.02] mb-5 text-4xl sm:text-5xl lg:text-[56px] ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
            style={{
              letterSpacing: "-0.03em",
            }}
          >
            Turn opinions into markets.
          </h1>

          <p
            className={`text-base sm:text-lg leading-relaxed font-normal mb-8 max-w-xl ${
              isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
          >
            AI turns public takes into AGREE / DISAGREE markets. The crowd takes a side with test ETH, an oracle settles it at the deadline, and the record tracks who was right.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
            <Link
              href="#markets"
              className={`px-7 py-3.5 rounded-xl text-[15px] font-extrabold transition-all duration-200 active:scale-[0.98] hover-lift flex items-center justify-center gap-2 group ${
                isDark
                  ? "text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_4px_24px_rgba(52,211,153,0.35)]"
                  : "text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_4px_24px_rgba(16,185,129,0.35)] border border-emerald-500/20"
              }`}
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
              className={`px-6 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 hover-lift flex items-center justify-center gap-2 border ${
                isDark
                  ? "text-white bg-white/5 hover:bg-white/10 border-white/10"
                  : "text-[#0B1F16] bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs"
              }`}
            >
              <span>How resolution works</span>
            </Link>
          </div>

          <div className={`pt-6 border-t grid grid-cols-3 gap-2 sm:gap-4 font-mono ${isDark ? "border-white/10" : "border-zinc-200"}`}>
            <div>
              <div className={`text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                1,284
              </div>
              <div className={`text-[10px] sm:text-xs leading-tight ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"} mt-0.5 line-clamp-1 sm:line-clamp-none`}>
                Beliefs detected
              </div>
            </div>
            <div>
              <div className={`text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                412
              </div>
              <div className={`text-[10px] sm:text-xs leading-tight ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"} mt-0.5 line-clamp-1 sm:line-clamp-none`}>
                Markets open
              </div>
            </div>
            <div>
              <div className={`text-base sm:text-2xl lg:text-3xl font-black tracking-tight truncate ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                3,960 ETH
              </div>
              <div className={`text-[10px] sm:text-xs leading-tight ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"} mt-0.5 line-clamp-1 sm:line-clamp-none`}>
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
