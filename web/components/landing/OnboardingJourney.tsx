"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface OnboardingJourneyProps {
  theme?: "dark" | "light";
}

export default function OnboardingJourney({ theme: propTheme }: OnboardingJourneyProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const STEPS = [
    {
      step: "01",
      title: "AI Ingests Social Beliefs",
      description: "Our pipeline indexes high-conviction statements from Twitter, Warpcast, and community thinkers, transforming raw opinions into structured predictions.",
      badge: "AI Extraction",
      action: "Submit Opinion",
      href: "/create",
    },
    {
      step: "02",
      title: "Creator EIP-712 Verification",
      description: "Creators sign off on their belief using cryptographic EIP-712 signatures to earn verified badges and receive 1.5% protocol creator fees.",
      badge: "Cryptographic Trust",
      action: "Explore Creators",
      href: "/creators",
    },
    {
      step: "03",
      title: "Stake AGREE or DISAGREE",
      description: "Participants allocate capital into escrow pools on Ethereum Sepolia or Robinhood Chain Testnet with decentralized oracle resolutions.",
      badge: "Dual-Testnet Active",
      action: "Explore Markets",
      href: "/markets",
    },
  ];

  return (
    <section className="w-full my-8 sm:my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className={`text-xs font-mono font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
          Protocol Architecture
        </h2>
        <p className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
          How Social Belief Markets Work
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-300 group ${
              isDark
                ? "bg-[#070D09]/80 border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/[0.04]"
                : "bg-white/95 border-emerald-500/15 light-card-shine hover:shadow-lg hover:border-emerald-400/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tighter ${
                  isDark ? "text-emerald-500/40 group-hover:text-[#34D399]" : "text-emerald-300 group-hover:text-[#0E7A4E]"
                } transition-colors`}>
                  {item.step}
                </span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
                  isDark ? "bg-emerald-950/60 border-emerald-500/30 text-[#34D399]" : "bg-emerald-50 border-emerald-500/20 text-[#0E7A4E]"
                }`}>
                  {item.badge}
                </span>
              </div>

              <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                {item.title}
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                {item.description}
              </p>
            </div>

            <div className={`pt-4 border-t ${isDark ? "border-emerald-500/10" : "border-emerald-500/10"}`}>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold ${
                  isDark ? "text-[#34D399] hover:text-[#6EE7B7]" : "text-[#0E7A4E] hover:text-[#047857]"
                }`}
              >
                <span>{item.action}</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
