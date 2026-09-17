"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../ThemeProvider";

export interface HeroSectionProps {
  theme?: "dark" | "light";
}

export default function HeroSection({ theme: propTheme }: HeroSectionProps) {
  const contextTheme = useTheme();
  const activeTheme = propTheme || contextTheme.theme || "dark";
  const isDark = activeTheme === "dark";

  return (
    <section
      className={`relative w-full overflow-hidden rounded-[24px] transition-all duration-300 ${
        isDark
          ? "bg-[#030906] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-white via-[#FAFCFA] to-[#E2F7ED] border border-emerald-500/15 shadow-[0_20px_60px_rgba(14,122,78,0.06),_inset_0_1px_0_rgba(255,255,255,1)]"
      }`}
    >
      <div
        className={`absolute top-0 inset-x-0 h-[1.5px] z-20 pointer-events-none ${
          isDark ? "dark-emerald-seam" : "light-emerald-seam"
        }`}
      />

      <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 lg:px-10 xl:px-14 pt-16 sm:pt-24 pb-48 sm:pb-64 w-full mx-auto">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-xs animate-in fade-in duration-500 border ${
            isDark
              ? "bg-emerald-950/40 border-emerald-500/20 text-[#DCE5DF]"
              : "bg-white/90 border-emerald-500/15 text-[#0E7A4E]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"}`} />
          <span>
            Dual-Testnet Active • <strong className={`font-bold ${isDark ? "text-white" : "text-[#0B1F16]"}`}>Ethereum Sepolia & Robinhood Chain</strong>
          </span>
        </div>

        <h1
          className={`font-black tracking-tight leading-[0.95] max-w-5xl ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
          style={{
            fontSize: "clamp(40px, 7vw, 90px)",
            letterSpacing: "-0.025em",
          }}
        >
          The Internet is Full of Opinions. OMEN Gives Them a Market.
        </h1>

        <p
          className={`mt-6 max-w-[700px] text-base sm:text-lg leading-relaxed font-normal ${
            isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
          }`}
        >
          Transform high-conviction social opinions from Twitter, Warpcast, and community thinkers into decentralized belief markets. Stake capital on AGREE or DISAGREE, backed by EIP-712 creator verification and dual-testnet settlements.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/markets"
            className={`w-full sm:w-auto px-8 py-4 rounded-[14px] text-[15px] font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 group ${
              isDark
                ? "text-[#030906]"
                : "text-white bg-[#10221A] hover:bg-[#183428] shadow-[0_4px_20px_rgba(16,34,26,0.25)]"
            }`}
            style={
              isDark
                ? {
                    background: "linear-gradient(180deg, #34D399 0%, #047857 100%)",
                    boxShadow: "0 0 40px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }
                : undefined
            }
          >
            <span>Explore Markets</span>
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
            href="/create"
            className={`w-full sm:w-auto px-7 py-4 rounded-[14px] text-[15px] font-semibold backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2.5 border ${
              isDark
                ? "text-white bg-white/5 hover:bg-white/10 border-emerald-500/20"
                : "text-[#0B1F16] bg-white/90 hover:bg-white border-emerald-500/15 shadow-xs"
            }`}
          >
            <span>Submit Belief</span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? "bg-emerald-500/20 text-[#34D399] border-emerald-500/30"
                  : "bg-emerald-100 text-[#0E7A4E] border-emerald-300/40"
              }`}
            >
              + AI Extract
            </span>
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <Image
          src="/images/hero-dark-emerald.jpg"
          alt="Omen Web3 3D Dark Emerald Abstract"
          fill
          priority
          sizes="(max-width: 1400px) 100vw, 1400px"
          className={`object-cover object-bottom transition-opacity duration-300 ${
            isDark ? "opacity-90" : "opacity-35 mix-blend-luminosity"
          }`}
        />
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #030906 0%, rgba(3,9,6,0.7) 40%, rgba(3,9,6,0.15) 70%, rgba(3,9,6,0.95) 100%)"
              : "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.6) 65%, rgba(226,247,237,0.9) 100%)",
          }}
        />
      </div>
    </section>
  );
}
