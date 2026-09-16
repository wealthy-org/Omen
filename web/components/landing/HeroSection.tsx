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

  if (isDark) {
    return (
      <section className="relative w-full overflow-hidden rounded-[24px] bg-[#030906] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 inset-x-0 h-[1px] z-20 pointer-events-none dark-emerald-seam" />

        <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-52 sm:pb-72 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[#DCE5DF] text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-xs animate-in fade-in duration-500">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>
              Decentralized Prediction Protocol • <strong className="font-bold text-white">Arbitrum Sepolia</strong>
            </span>
          </div>

          <h1
            className="font-black text-white tracking-tight leading-[0.95] max-w-4xl"
            style={{
              fontSize: "clamp(42px, 7.5vw, 96px)",
              letterSpacing: "-0.025em",
            }}
          >
            Predict Onchain. Farm Points. Dominate the Airdrop.
          </h1>

          <p className="mt-6 max-w-[640px] text-[#A9B3AD] text-base sm:text-lg leading-relaxed font-normal">
            The premier institutional binary prediction market. Bet ETH on crypto outcomes with non-custodial smart contracts, build daily gamified quest streaks, and maximize points for verified airdrop qualification.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/predictions"
              className="w-full sm:w-auto px-8 py-4 rounded-[14px] text-[15px] font-bold text-[#030906] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              style={{
                background: "linear-gradient(180deg, #34D399 0%, #047857 100%)",
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <span>Explore Live Markets</span>
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
              href="/quests"
              className="w-full sm:w-auto px-7 py-4 rounded-[14px] text-[15px] font-semibold text-white bg-white/5 hover:bg-white/10 border border-emerald-500/20 backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <span>Start Quest Farming</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#34D399] border border-emerald-500/30">
                +50 PTS
              </span>
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[68%] pointer-events-none z-10 overflow-hidden">
          <Image
            src="/images/hero-dark-emerald.jpg"
            alt="Omen Web3 3D Dark Emerald Abstract"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-bottom"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, #030906 0%, rgba(3,9,6,0.8) 35%, rgba(3,9,6,0.1) 75%, rgba(3,9,6,0.95) 100%)",
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden rounded-[24px] border border-emerald-900/10 shadow-[0_20px_60px_rgba(14,122,78,0.08)] light-hero-gradient"
    >
      <div className="relative z-20 px-6 sm:px-10 lg:px-14 py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 min-h-[580px]">
        <div className="w-full lg:max-w-[48%] flex flex-col items-start text-left z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-600/20 text-[#0E7A4E] text-xs sm:text-sm font-semibold mb-6 shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Decentralized Prediction Protocol • Arbitrum</span>
          </div>

          <h1
            className="font-black text-[#0B1F16] tracking-tight leading-[1.05]"
            style={{
              fontSize: "clamp(38px, 5.2vw, 68px)",
              letterSpacing: "-0.03em",
            }}
          >
            Predict Onchain. Dominate Airdrops.
          </h1>

          <p className="mt-5 text-[#4B5D55] text-base sm:text-lg leading-[1.6] max-w-[480px]">
            The premier institutional binary prediction market. Bet ETH on crypto outcomes with non-custodial smart contracts, build quest streaks, and maximize points for verified airdrop qualification.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/predictions"
              className="w-full sm:w-auto px-6 py-4 rounded-[14px] text-[15px] font-bold text-white bg-[#10221A] hover:bg-[#183428] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 group shadow-sm"
            >
              <span>Explore Live Markets</span>
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
              href="/quests"
              className="w-full sm:w-auto px-6 py-4 rounded-[14px] text-[15px] font-semibold text-[#0B1F16] bg-white/80 hover:bg-white border border-emerald-700/15 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Start Quest Farming</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0E7A4E] border border-emerald-300/40">
                +50 PTS
              </span>
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-[50%] flex items-center justify-center relative min-h-[340px] sm:min-h-[420px]">
          <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px] animate-in fade-in duration-700">
            <Image
              src="/images/hero-light-emerald.png"
              alt="Omen 3D Emerald Turbine Sculpture"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 460px"
              className="object-contain drop-shadow-[0_20px_35px_rgba(14,122,78,0.22)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
