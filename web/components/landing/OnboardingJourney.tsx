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
      title: "Connect Web3 Wallet",
      description: "Link your favorite Web3 wallet (MetaMask, Coinbase, Rainbow) to Arbitrum Sepolia in one click with zero setup fees.",
      badge: "Arbitrum Sepolia",
      action: "Connect Now",
      href: "/predictions",
    },
    {
      step: "02",
      title: "Claim Gasless Daily Quests",
      description: "Check in daily to build your consecutive streak, earn PTS rewards, and unlock up to 3.0x points multiplier without paying gas.",
      badge: "Instant Rewards",
      action: "Start Quests",
      href: "/quests",
    },
    {
      step: "03",
      title: "Predict & Earn Airdrop",
      description: "Place YES/NO positions on trending crypto & tech events. Smart contracts escrow your funds with instant non-custodial payouts.",
      badge: "Season 1 Airdrop",
      action: "Explore Markets",
      href: "/predictions",
    },
  ];

  return (
    <section className="w-full my-8 sm:my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className={`text-xs font-mono font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
          Seamless Onboarding
        </h2>
        <p className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
          How to Get Started in 3 Simple Steps
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
