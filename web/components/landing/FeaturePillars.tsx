"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface FeaturePillarsProps {
  theme?: "dark" | "light";
}

export default function FeaturePillars({ theme: propTheme }: FeaturePillarsProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const PILLARS = [
    {
      badge: "Pillar I • Prediction Market & Betting",
      title: "Decentralized Binary Betting on Arbitrum Sepolia",
      description:
        "Place binary predictions (YES / NO) on crypto assets, network milestones, and real-world tech events. Smart contracts securely escrow funds and calculate implied odds transparently with instant automated payouts.",
      points: [
        "100% Non-custodial Solidity smart contract execution",
        "Transparent proportional pool odds and instant payout claims",
        "Low gas fees powered by Arbitrum Sepolia Layer-2",
      ],
      linkText: "Explore Prediction Markets",
      linkHref: "/predictions",
      accentGlow: isDark ? "from-emerald-500/20 to-transparent" : "from-emerald-500/15 to-transparent",
      iconColor: isDark ? "text-[#34D399]" : "text-[#0E7A4E]",
    },
    {
      badge: "Pillar II • Gamification, Quest & Airdrop",
      title: "Gamified Daily Quests & Airdrop Points Engine",
      description:
        "Earn reward points daily without paying gas fees. Build consecutive check-in streaks to unlock point multipliers, complete on-chain betting challenges, and qualify for future protocol token airdrop allocations.",
      points: [
        "Daily check-in streak multipliers (1.0x up to 3.0x bonus)",
        "Gasless instant quest verification via Supabase backend",
        "Transparent Season 1 points leaderboard tier rankings",
      ],
      linkText: "Start Quest Farming",
      linkHref: "/quests",
      accentGlow: isDark ? "from-[#34D399]/20 to-transparent" : "from-emerald-400/20 to-transparent",
      iconColor: isDark ? "text-[#34D399]" : "text-[#0E7A4E]",
    },
  ];

  return (
    <section className="w-full my-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className={`text-xs font-mono font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
          Ecosystem Architecture
        </h2>
        <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
          Dual-Engine Web3 Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.badge}
            className={`rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
              isDark
                ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30"
                : "bg-white border border-emerald-900/10 hover:border-emerald-600/30 shadow-[0_4px_24px_rgba(14,122,78,0.06)]"
            }`}
          >
            <div
              className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${pillar.accentGlow} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div>
              <span
                className={`inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full border mb-6 ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-500/20 text-[#DCE5DF]"
                    : "bg-emerald-50 border-emerald-200 text-[#0E7A4E]"
                }`}
              >
                {pillar.badge}
              </span>

              <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                {pillar.title}
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                {pillar.description}
              </p>

              <ul className="space-y-3 mb-8">
                {pillar.points.map((point) => (
                  <li key={point} className={`flex items-start gap-3 text-sm ${isDark ? "text-white/90" : "text-[#17241D]"}`}>
                    <svg
                      className={`w-5 h-5 shrink-0 ${pillar.iconColor} mt-0.5`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`pt-6 border-t ${isDark ? "border-white/10" : "border-emerald-900/10"}`}>
              <Link
                href={pillar.linkHref}
                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                  isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                <span>{pillar.linkText}</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
